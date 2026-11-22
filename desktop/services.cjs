const { ORIGIN } = require('./assets.cjs');

const SITE = 'https://www.tool.mistarg.cn';
const MB = 1024 * 1024;
const query = { upload: 8192, download: 8 * MB, timeout: 35000 };
const endpoints = new Map([
  ...['oeis', 'cod', 'pubchem', 'zdic', 'cnkgraph', 'pokewiki', 'placenames'].map((id) => [
    '/api/query/' + id,
    query,
  ]),
  ['/api/feedback', { upload: 6 * MB, download: 65536, timeout: 35000 }],
  ['/api/code/run', { upload: 4 * MB, download: 8 * MB, timeout: 125000 }],
  ['/api/forensics/run', { upload: 28 * MB, download: 92 * MB, timeout: 330000 }],
]);

function failure(status, message) {
  return Response.json(
    { message, error: message },
    { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } },
  );
}

async function readBody(body, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of body) {
    size += chunk.byteLength;
    if (size > limit) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, size);
}

function boundedResponse(upstream, limit, release) {
  const reader = upstream.body.getReader();
  let size = 0;
  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    release();
  }
  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await reader.read();
        if (done) {
          finish();
          controller.close();
          return;
        }
        size += value.byteLength;
        if (size > limit) {
          await reader.cancel();
          throw Error('在线服务响应超过大小限制。');
        }
        controller.enqueue(value);
      } catch (error) {
        finish();
        controller.error(error);
      }
    },
    async cancel() {
      finish();
      await reader.cancel();
    },
  });
}

function createServiceHandler(fetchService) {
  let active = 0;
  return async (request, url) => {
    const config = endpoints.get(url.pathname);
    if (!config || url.search) return failure(404, '没有对应的在线接口。');
    if (request.method !== 'POST') return failure(405, '此接口只接受 POST。');
    const sender = request.initiatorOrigin ?? request.headers.get('Origin');
    if (sender !== ORIGIN) return failure(403, '此接口只接受工具箱页面的请求。');
    if (!request.body || !/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type')))
      return failure(415, '请求需要使用 JSON。');
    if (active >= 4) return failure(503, '在线请求处理中，请稍后重试。');

    active++;
    let streaming = false;
    const release = () => active--;
    try {
      const bytes = await readBody(request.body, config.upload);
      if (!bytes) return failure(413, '在线请求超过大小限制。');
      let input;
      try {
        input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
        if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error();
      } catch {
        return failure(400, '请求不是有效的 JSON 对象。');
      }
      if (url.pathname === '/api/forensics/run') {
        for (const encoded of [input.data, input.attachment?.data]) {
          if (typeof encoded !== 'string') continue;
          const size =
            (encoded.length / 4) * 3 - (encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0);
          if (size > 20 * MB) return failure(413, '单个文件最多 20 MB。');
        }
      }
      const upstream = await fetchService(SITE + url.pathname, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json, application/x-ndjson',
          Origin: SITE,
        },
        body: bytes,
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(config.timeout)]),
      });
      const type = upstream.headers.get('Content-Type') || '';
      const accepted =
        /^application\/json(?:\s*;|$)/i.test(type) ||
        (url.pathname === '/api/forensics/run' && /^application\/x-ndjson(?:\s*;|$)/i.test(type));
      if (
        !accepted ||
        !upstream.body ||
        Number(upstream.headers.get('Content-Length')) > config.download
      ) {
        await upstream.body?.cancel();
        return failure(502, '在线服务返回了无法读取的响应，请稍后重试。');
      }
      const headers = new Headers({
        'Content-Type': type,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      const retry = upstream.headers.get('Retry-After');
      if (retry) headers.set('Retry-After', retry);
      const body = boundedResponse(upstream, config.download, release);
      const response = new Response(body, { status: upstream.status, headers });
      streaming = true;
      return response;
    } catch {
      return failure(503, '无法连接迷雾工具箱在线服务，请检查网络后重试。');
    } finally {
      if (!streaming) release();
    }
  };
}

module.exports = { createServiceHandler };
