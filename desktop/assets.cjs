const { createReadStream } = require('node:fs');
const { realpath, stat } = require('node:fs/promises');
const { extname, isAbsolute, join, relative, sep } = require('node:path');
const { Readable } = require('node:stream');

const ORIGIN = 'https://mist-toolbox.invalid';
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.gz': 'application/gzip',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.mjs': 'text/javascript; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.ogg': 'audio/ogg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const headers = {
  'Content-Security-Policy': [
    "default-src 'self' blob: data:",
    "script-src 'self' blob: 'wasm-unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' blob: data: https: http:",
    "worker-src 'self' blob:",
    'frame-src https://www.desmos.com',
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cache-Control': 'no-store',
};

function isAppUrl(value) {
  const url = URL.parse(value);
  return url?.origin === ORIGIN && !url.username && !url.password;
}

function byteRange(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2]) || !size) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  return Number.isSafeInteger(start) && start <= end ? { start, end } : null;
}

async function createAssetHandler(directory, handleService) {
  const root = await realpath(directory);
  return async (request) => {
    if (!isAppUrl(request.url)) return new Response(null, { status: 403 });
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith('/api/')) {
        return handleService
          ? handleService(request, url)
          : new Response(null, { status: 404, headers });
      }
      if (!['GET', 'HEAD'].includes(request.method)) {
        return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET, HEAD' } });
      }
      const path = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
      if (/[\\:\x00-\x1f]/.test(path)) throw Error('Invalid resource path');
      const file = await realpath(join(root, path));
      const inside = relative(root, file);
      if (!inside || inside === '..' || inside.startsWith('..' + sep) || isAbsolute(inside)) {
        throw Error('Resource outside bundle');
      }
      const info = await stat(file);
      if (!info.isFile()) throw Error('Not a file');
      const extension = extname(file).toLowerCase();
      const responseHeaders = new Headers(headers);
      responseHeaders.set('Content-Type', mime[extension] || 'application/octet-stream');
      // A worker's CSP comes from its entry script response. Fixed Emscripten
      // glue (such as Qalculate Embind) generates JavaScript inside the worker.
      // The document keeps its own script policy, including when it imports JS.
      if (extension === '.js' || extension === '.mjs') {
        responseHeaders.set(
          'Content-Security-Policy',
          headers['Content-Security-Policy'].replace("'wasm-unsafe-eval'", "'unsafe-eval'"),
        );
      }
      responseHeaders.set('Accept-Ranges', 'bytes');
      const rangeHeader = request.headers.get('Range');
      const range = rangeHeader ? byteRange(rangeHeader, info.size) : null;
      if (rangeHeader && !range) {
        responseHeaders.set('Content-Range', 'bytes */' + info.size);
        return new Response(null, { status: 416, headers: responseHeaders });
      }
      if (range) {
        responseHeaders.set('Content-Range', `bytes ${range.start}-${range.end}/${info.size}`);
      }
      responseHeaders.set('Content-Length', range ? range.end - range.start + 1 : info.size);
      const body =
        request.method === 'HEAD' ? null : Readable.toWeb(createReadStream(file, range || {}));
      return new Response(body, { status: range ? 206 : 200, headers: responseHeaders });
    } catch {
      return new Response(null, { status: 404, headers });
    }
  };
}

module.exports = { ORIGIN, createAssetHandler, isAppUrl };
