import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Only public engine resources, on a private loopback port. No application APIs.
export async function startAssets() {
  const root = await realpath(fileURLToPath(new URL('../../public/', import.meta.url)));
  const mime = {
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.json': 'application/json',
    '.wasm': 'application/wasm',
  };
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const path = await realpath(resolve(root, '.' + decodeURIComponent(url.pathname)));
      if (
        req.method !== 'GET' ||
        url.search ||
        !path.startsWith(root + sep) ||
        !/\.(?:js|mjs|json|wasm|data|bin|xml)$/.test(path)
      )
        throw Error();
      const body = await readFile(path);
      res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return {
    base: `http://127.0.0.1:${server.address().port}/`,
    close: () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  };
}
