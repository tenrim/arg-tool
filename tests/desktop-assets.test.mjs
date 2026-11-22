import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createAssetHandler, isAppUrl, ORIGIN } from '../desktop/assets.cjs';

test('desktop origin serves bundled assets and refuses traversal, writes and service calls', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'mist-desktop-assets-'));
  const site = join(fixture, 'site');
  await mkdir(site);
  try {
    await writeFile(join(site, 'index.html'), '<title>离线</title>');
    await writeFile(join(site, 'worker.js'), 'postMessage(1);');
    await writeFile(join(site, '测试.wasm'), Buffer.from([0, 97, 115, 109]));
    await writeFile(join(fixture, 'private.txt'), 'outside bundle');
    const handle = await createAssetHandler(site);
    const get = (path, options) => handle(new Request(ORIGIN + path, options));
    const home = await get('/');
    assert.equal(await home.text(), '<title>离线</title>');
    assert.match(home.headers.get('content-security-policy'), /connect-src 'self'/);
    assert.doesNotMatch(home.headers.get('content-security-policy'), /'unsafe-eval'/);
    const worker = await get('/worker.js');
    assert.match(worker.headers.get('content-security-policy'), /'unsafe-eval'/);
    await worker.body.cancel();
    const wasm = await get('/测试.wasm', { headers: { Range: 'bytes=1-2' } });
    assert.equal(wasm.status, 206);
    assert.equal(wasm.headers.get('content-type'), 'application/wasm');
    assert.equal(wasm.headers.get('content-range'), 'bytes 1-2/4');
    assert.deepEqual([...new Uint8Array(await wasm.arrayBuffer())], [97, 115]);
    assert.equal((await get('/测试.wasm', { headers: { Range: 'bytes=8-' } })).status, 416);
    assert.equal((await get('/%2e%2e%2fprivate.txt')).status, 404);
    assert.equal((await get('/%5c..%5cprivate.txt')).status, 404);
    assert.equal((await get('/index.html', { method: 'POST' })).status, 405);
    assert.equal((await get('/api/code/run', { method: 'POST' })).status, 404);
    assert.equal((await handle(new Request('https://example.invalid/'))).status, 403);
    assert.equal(isAppUrl(ORIGIN + '.example/'), false);
  } finally {
    // In Windows this is the exact distinct temporary directory just returned by mkdtemp.
    assert.equal(fixture.startsWith(join(tmpdir(), 'mist-desktop-assets-')), true);
    await rm(fixture, { recursive: true, force: true });
  }
});
