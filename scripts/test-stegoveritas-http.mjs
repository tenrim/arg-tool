// Explicit integration check: requires an isolated image, never a production URL.
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createForensicsService } from '../services/forensics/index.mjs';
const fixture = JSON.parse(
  await readFile(
    process.env.STEGOVERITAS_FIXTURE || 'outputs/stegoveritas-20261117/http-fixture.json',
    'utf8',
  ),
);
const service = createForensicsService({ env: { ...process.env, FORENSICS_ENABLED: '1' } });
const server = createServer(service.handle);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const evidence = [];
async function run(change, status = 200) {
  const response = await fetch(origin, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ engine: 'stegoveritas', password: '', ...fixture, ...change }),
  });
  const value = await response.json();
  assert.equal(response.status, status, JSON.stringify(value));
  if (status === 200) {
    assert.ok(value.complete, value.error);
    assert.equal(value.result.status, 'ok');
  }
  await new Promise((resolve) => setTimeout(resolve, 2050));
  return value;
}
try {
  await run({ options: { mode: 'extract', red: '8' } }, 422);
  evidence.push('错误参数拒绝');
  const payload = Buffer.from([0, 255, 65, 42]);
  const hidden = await run({
    options: { mode: 'hide', bands: 'RGB', format: 'png' },
    attachment: { filename: 'payload.bin', data: payload.toString('base64') },
  });
  const data = hidden.files.find((f) => f.name === 'embedded.png').data;
  const recovered = await run({
    data,
    options: { mode: 'extract', red: '0', green: '0', blue: '0', alpha: '' },
  });
  assert.deepEqual(
    Buffer.from(recovered.files.find((f) => f.name === 'LSBExtracted.bin').data, 'base64').subarray(
      0,
      payload.length,
    ),
    payload,
  );
  evidence.push('HTTP 载荷上传→真实嵌入→原字节提取；失败后正常请求');
  const metadata = await run({ engine: 'exiftool', options: { mode: 'binary' } });
  const all = metadata.files.map((f) => Buffer.from(f.data, 'base64').toString()).join('\n');
  assert.match(all, /MIST_XMP_PROOF/);
  evidence.push('原元数据引擎新增二进制标签模式');
  const xmp = await run({ engine: 'exiftool', options: { mode: 'xmp' } });
  assert.match(
    Buffer.from(xmp.files.find((f) => f.name === 'metadata.xmp').data, 'base64').toString(),
    /MIST_XMP_PROOF/,
  );
  evidence.push('原始 XMP 包下载');
  await writeFile(
    'outputs/stegoveritas-20261117/http-tests.json',
    JSON.stringify({ ok: true, evidence }, null, 2),
  );
  console.log(evidence.join('\n'));
} finally {
  service.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
