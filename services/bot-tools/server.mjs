import { createServer } from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { createCatalogue, SUPPORTED } from './catalogue.mjs';
import { createExecutor } from './executor.mjs';
import { startAssets } from './assets.mjs';
import { ApiError, PREFIX, VERSION, LIMITS, failure } from './protocol.mjs';

function readBody(req, signal) {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    const chunks = [];
    const finish = (error) => {
      clearTimeout(timer);
      req.removeListener('data', data);
      req.removeListener('end', end);
      req.removeListener('error', broken);
      signal.removeEventListener('abort', abort);
      if (error) {
        req.resume();
        reject(error);
      } else {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch {
          reject(new ApiError('INVALID_INPUT', '请求不是有效 JSON。'));
        }
      }
    };
    const data = (chunk) => {
      bytes += chunk.length;
      if (bytes > LIMITS.bodyBytes)
        finish(new ApiError('INPUT_TOO_LARGE', '请求体最多 128 KiB。', 413));
      else chunks.push(chunk);
    };
    const end = () => finish();
    const broken = () => finish(new ApiError('INVALID_INPUT', '请求读取失败。'));
    const abort = () => finish(new ApiError('CANCELLED', '请求已取消。', 499));
    const timer = setTimeout(() => finish(new ApiError('TIMEOUT', '请求体读取超时。', 408)), 5000);
    req.on('data', data).once('end', end).once('error', broken);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });
}
export async function startBotTools(config, { probe = true } = {}) {
  const assets = config.resourceBase ? null : await startAssets();
  config = { ...config, resourceBase: config.resourceBase || assets.base };
  const catalogue = await createCatalogue(config.siteUrl);
  const executor = createExecutor(config, catalogue.fingerprint);
  const controllers = new Set();
  const engines = {
    cyberchef: { available: false, checkedAt: null },
    qalculate: { available: false, checkedAt: null },
  };
  const expected = createHash('sha256')
    .update('Bearer ' + config.token)
    .digest();
  const note = (engine, response) => {
    if (response.ok || response.error?.code === 'ENGINE_UNAVAILABLE')
      engines[engine] = { available: response.ok, checkedAt: new Date().toISOString() };
  };
  const reply = (res, status, body) => {
    if (res.destroyed || res.writableEnded) return;
    let json = JSON.stringify(body);
    if (Buffer.byteLength(json) > LIMITS.bodyBytes) {
      status = 422;
      json = JSON.stringify(failure(new ApiError('OUTPUT_TOO_LARGE', '响应超过 128 KiB。', 422)));
    }
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...(status === 429 ? { 'Retry-After': '1' } : {}),
      ...(status >= 400 ? { Connection: 'close' } : {}),
    });
    res.end(json);
  };
  const server = createServer({ maxHeaderSize: 8192 }, async (req, res) => {
    let controller, engine;
    const abort = () => {
      if (!res.writableEnded) controller?.abort();
    };
    try {
      const provided = createHash('sha256')
        .update(req.headers.authorization || '')
        .digest();
      if (!timingSafeEqual(provided, expected))
        throw new ApiError('UNAUTHORIZED', '调用凭证无效。', 401);
      if ((req.url || '').length > 2048) throw new ApiError('INVALID_INPUT', '请求地址过长。');
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'GET' && url.pathname === PREFIX + '/health')
        return reply(res, 200, {
          ok: true,
          version: VERSION,
          engines,
          limits: { ...LIMITS, concurrency: config.concurrency, timeoutMs: config.timeoutMs },
          activeTasks: controllers.size,
          supportedOperations: SUPPORTED.map((op) => 'op:' + op).concat('qalculate:calculate'),
        });
      if (req.method === 'GET' && url.pathname === PREFIX + '/search') {
        const q = url.searchParams.get('q') || '';
        if (!q.trim() || q.length > 200)
          throw new ApiError('INVALID_INPUT', '关键词须为 1 至 200 字符。');
        return reply(res, 200, { ok: true, results: catalogue.search(q) });
      }
      if (req.method === 'GET' && url.pathname.startsWith(PREFIX + '/operations/')) {
        let id;
        try {
          id = decodeURIComponent(url.pathname.slice((PREFIX + '/operations/').length));
        } catch {
          throw new ApiError('INVALID_INPUT', '操作 ID 编码无效。');
        }
        return reply(res, 200, { ok: true, operation: catalogue.operation(id) });
      }
      if (url.pathname !== PREFIX + '/run') throw new ApiError('NOT_FOUND', '接口不存在。', 404);
      if (req.method !== 'POST')
        throw new ApiError('METHOD_NOT_ALLOWED', '此接口仅支持 POST。', 405);
      if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || ''))
        throw new ApiError('INVALID_INPUT', '请使用 application/json 请求体。', 415);
      if (Number(req.headers['content-length']) > LIMITS.bodyBytes)
        throw new ApiError('INPUT_TOO_LARGE', '请求体最多 128 KiB。', 413);
      if (controllers.size >= config.concurrency)
        throw new ApiError('BUSY', '并发任务已满，请稍后重试。', 429);
      controller = new AbortController();
      controllers.add(controller);
      res.once('close', abort);
      const job = catalogue.validate(await readBody(req, controller.signal));
      engine = job.engine;
      const result = await executor.run(job, { signal: controller.signal });
      if (!result.ok)
        result.error.url = catalogue.operation(
          engine === 'qalculate' ? 'qalculate:calculate' : job.recipe.at(-1).op,
        ).url;
      note(engine, result);
      reply(res, result.ok ? 200 : result.error.code === 'ENGINE_UNAVAILABLE' ? 503 : 422, result);
    } catch (error) {
      reply(res, error instanceof ApiError ? error.status : 503, failure(error, engine));
    } finally {
      res.removeListener('close', abort);
      if (controller) controllers.delete(controller);
    }
  });
  server.headersTimeout = 10000;
  server.requestTimeout = 10000;
  server.keepAliveTimeout = 2000;
  try {
    if (probe)
      for (const job of [
        { engine: 'cyberchef', input: 'Hello', recipe: [{ op: 'To Base64' }] },
        { engine: 'qalculate', expression: '1+1' },
      ]) {
        try {
          note(job.engine, await executor.run(catalogue.validate(job)));
        } catch {
          note(job.engine, { ok: false, error: { code: 'ENGINE_UNAVAILABLE' } });
        }
      }
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(config.port, config.host, resolve);
    });
  } catch (error) {
    await executor.close();
    await assets?.close();
    throw error;
  }
  return {
    base: `http://${config.host === '::1' ? '[::1]' : config.host}:${server.address().port}${PREFIX}`,
    executor,
    async close() {
      for (const controller of controllers) controller.abort();
      await executor.close();
      await new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      });
      await assets?.close();
    },
  };
}
