import { SERVER_LANGUAGES } from '../../public/coderunner/server-catalog.js';
import { runCode } from './process.mjs';
const LIMIT = 256 * 1024;
const BODY_LIMIT = 4 * 1024 * 1024;
export function validateCodeJob(value) {
  if (!value || !Object.hasOwn(SERVER_LANGUAGES, value.language)) throw Error('不支持的运行语言');
  if (typeof value.code !== 'string' || !value.code.length || typeof value.input !== 'string')
    throw Error('代码和标准输入必须是文本');
  if ([value.code, value.input].some((s) => Buffer.byteLength(s, 'utf8') > LIMIT))
    throw Error('代码和标准输入分别最多 256 KB');
  return { language: value.language, code: value.code, input: value.input };
}
export function createCodeRunnerService({ env = process.env, execute = runCode } = {}) {
  let active = null,
    closed = false;
  const rates = new Map();
  const reply = (res, status, body) => {
    if (res.destroyed || res.writableEnded) return;
    res.writeHead(status, {
      'Content-Type': 'application/json;charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(JSON.stringify(body));
  };
  return {
    async handle(req, res) {
      if (req.method !== 'POST') return reply(res, 405, { error: '仅支持 POST' });
      const origins = (env.CODE_RUNNER_ORIGINS || '').split(',');
      origins.push(
        `http://localhost:${req.socket.localPort}`,
        `http://127.0.0.1:${req.socket.localPort}`,
      );
      if (!origins.includes(req.headers.origin))
        return reply(res, 403, { error: '请求来源不允许' });
      if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || ''))
        return reply(res, 415, { error: '请求格式不正确' });
      if (closed || env.CODE_RUNNER_ENABLED !== '1')
        return reply(res, 503, { error: '服务器代码运行尚未启用，仍可选择本地运行语言' });
      if (active) return reply(res, 429, { error: '代码沙箱正在运行其他程序，请稍后重试' });
      if (Number(req.headers['content-length']) > BODY_LIMIT)
        return reply(res, 413, { error: '请求过大' });
      const now = Date.now(),
        ip = req.socket.remoteAddress;
      for (const [key, at] of rates) if (now - at > 60000) rates.delete(key);
      if (now - (rates.get(ip) || 0) < 1000 || rates.size >= 1024)
        return reply(res, 429, { error: '运行请求过于频繁，请稍后重试' });
      rates.set(ip, now);
      const controller = new AbortController();
      active = controller;
      const abort = () => {
        if (!res.writableEnded) controller.abort();
      };
      res.once('close', abort);
      const readTimer = setTimeout(() => {
        controller.abort();
        req.destroy();
      }, 10000);
      try {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > BODY_LIMIT) throw Error('请求过大');
          chunks.push(chunk);
        }
        clearTimeout(readTimer);
        const job = validateCodeJob(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        const result = await execute(job, { env, signal: controller.signal });
        reply(res, 200, result);
      } catch (error) {
        reply(res, controller.signal.aborted ? 408 : 422, { error: error.message });
      } finally {
        clearTimeout(readTimer);
        res.removeListener('close', abort);
        if (active === controller) active = null;
      }
    },
    close() {
      closed = true;
      active?.abort();
    },
  };
}
