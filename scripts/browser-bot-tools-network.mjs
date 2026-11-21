import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { startAssets } from '../services/bot-tools/assets.mjs';
import { startBotTools } from '../services/bot-tools/server.mjs';
import { readConfig } from '../services/bot-tools/config.mjs';

const assets = await startAssets();
let mode = 'redirect',
  escapedRequests = 0;
const trap = createServer((_req, res) => {
  escapedRequests++;
  res.end('unexpected');
});
await new Promise((resolve) => trap.listen(0, '127.0.0.1', resolve));
const proxy = createServer(async (req, res) => {
  if (req.url.endsWith('/ChefWorker.js') && mode !== 'normal') {
    res.writeHead(
      mode === 'redirect' ? 302 : 503,
      mode === 'redirect'
        ? { Location: `http://127.0.0.1:${trap.address().port}/unexpected.js` }
        : {},
    );
    return res.end();
  }
  const response = await fetch(new URL(req.url.slice(1), assets.base));
  res.writeHead(response.status, {
    'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
  });
  res.end(Buffer.from(await response.arrayBuffer()));
});
await new Promise((resolve) => proxy.listen(0, '127.0.0.1', resolve));
const token = randomBytes(32).toString('hex');
const service = await startBotTools(
  readConfig({
    BOT_TOOLS_TOKEN: token,
    BOT_TOOLS_PORT: '0',
    BOT_TOOLS_RESOURCE_BASE: `http://127.0.0.1:${proxy.address().port}/`,
    BOT_TOOLS_CHROMIUM_PATH: process.env.BOT_TOOLS_CHROMIUM_PATH || process.env.CHROMIUM_PATH || '',
  }),
  { probe: false },
);
async function run() {
  const response = await fetch(service.base + '/run', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: JSON.stringify({ engine: 'cyberchef', input: 'Hello', recipe: [{ op: 'To Base64' }] }),
  });
  return { status: response.status, ...(await response.json()) };
}
try {
  for (mode of ['redirect', 'unavailable']) {
    const failed = await run();
    assert.equal(failed.status, 503, JSON.stringify(failed));
    assert.equal(failed.error.code, 'ENGINE_UNAVAILABLE');
  }
  assert.equal(escapedRequests, 0, '不得跟随资源重定向请求非配置源');
  mode = 'normal';
  assert.equal((await run()).result.text, 'SGVsbG8=');
  console.log('真实 HTTP：跨源重定向被拦截、引擎不可用正确返回、资源恢复后正常执行');
} finally {
  await service.close();
  await assets.close();
  for (const server of [proxy, trap])
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
}
