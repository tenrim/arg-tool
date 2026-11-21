import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { startBotTools } from '../services/bot-tools/server.mjs';
import { readConfig } from '../services/bot-tools/config.mjs';

const token = randomBytes(32).toString('hex');
const config = readConfig({
  BOT_TOOLS_TOKEN: token,
  BOT_TOOLS_PORT: '0',
  BOT_TOOLS_CONCURRENCY: '1',
  BOT_TOOLS_TIMEOUT_MS: '6000',
  BOT_TOOLS_CHROMIUM_PATH: process.env.BOT_TOOLS_CHROMIUM_PATH || process.env.CHROMIUM_PATH || '',
});
const service = await startBotTools(config);
const records = [];
const lifecycleOnly = process.argv.includes('--lifecycle');
async function request(path, job, { signal, authorization = 'Bearer ' + token } = {}) {
  const response = await fetch(service.base + path, {
    method: job ? 'POST' : 'GET',
    signal,
    headers: { authorization, 'content-type': 'application/json' },
    ...(job ? { body: JSON.stringify(job) } : {}),
  });
  const body = await response.json();
  records.push({ path, ...(job ? { request: job } : {}), status: response.status, response: body });
  return { status: response.status, ...body };
}
const run = (job, options) => request('/run', job, options);
const chef = (input, op, args) =>
  run({ engine: 'cyberchef', input, recipe: [{ op, ...(args ? { args } : {}) }] });
const qalc = (expression, options) => run({ engine: 'qalculate', expression }, options);
async function idle() {
  for (let i = 0; i < 100; i++) {
    if ((await request('/health')).activeTasks === 0 && service.executor.activeCount === 0) return;
    await delay(100);
  }
  assert.fail('任务取消后没有释放并发槽和计算进程');
}
try {
  const health = await request('/health');
  assert.equal(health.engines.cyberchef.available, true);
  assert.equal(health.engines.qalculate.available, true);
  if (!lifecycleOnly) {
    assert.equal((await request('/health', null, { authorization: 'Bearer invalid' })).status, 401);
    assert.equal((await request('/search?q=Base64')).results[0].executable, true);
    assert.equal(
      (await request('/search?q=' + encodeURIComponent('脑图'))).results.some((v) => v.executable),
      false,
    );
    const info = await request('/operations/' + encodeURIComponent('op:To Base64'));
    assert.deepEqual(info.operation.defaults, ['A-Za-z0-9+/=']);
    assert.equal((await chef('Hello', 'To Base64')).result.text, 'SGVsbG8=');
    assert.equal(
      (await chef('Hello', 'To Base64', info.operation.defaults)).result.text,
      'SGVsbG8=',
    );
    assert.equal((await chef('Hello', 'To Base58')).result.text, '9Ajdvzr');
    assert.equal((await chef('9Ajdvzr', 'From Base58')).result.hexPreview, '48656c6c6f');
    assert.equal((await chef('SGVsbG8=', 'From Base64')).result.hexPreview, '48656c6c6f');
    assert.equal(
      (await chef('abc', 'SHA2')).result.text,
      createHash('sha512').update('abc').digest('hex'),
    );
    assert.equal(
      (await chef('abc', 'SHA2', ['256', 64, 160])).result.text,
      createHash('sha256').update('abc').digest('hex'),
    );
    assert.equal((await chef('abc', 'MD5')).result.text, '900150983cd24fb0d6963f7d28e17f72');
    assert.equal((await chef('Hello', 'To Hex')).result.text, '48 65 6c 6c 6f');
    const binary = (await chef('00 ff 80', 'From Hex')).result;
    assert.deepEqual(binary, {
      type: 'binary',
      byteLength: 3,
      hexPreview: '00ff80',
      truncated: false,
    });
    const roundtrip = await run({
      engine: 'cyberchef',
      input: '迷雾 Hello',
      recipe: [{ op: 'To Base64' }, { op: 'From Base64' }],
    });
    assert.equal(roundtrip.result.hexPreview, Buffer.from('迷雾 Hello').toString('hex'));
    assert.equal((await qalc('1+2*3')).result.text, '7');
    assert.equal((await qalc('10 km to m')).result.text, '10000 m');
    const assigned = await qalc('mistprobe = 41');
    assert.equal(assigned.ok, true, JSON.stringify(assigned));
    assert.notEqual((await qalc('mistprobe + 1')).result?.text, '42');
    assert.notEqual((await qalc('ans + 1')).result.text, '42');
    assert.equal((await chef('Next', 'To Base64')).result.text, 'TmV4dA==');
    console.log('真实 HTTP：8 项 CyberChef、处理链、Qalculate、默认/显式参数和任务隔离通过');
    assert.equal((await chef('Hello', 'To Base64', [1])).error.code, 'INVALID_ARGUMENTS');
    assert.equal(
      (await chef('not base64!', 'From Base64', ['A-Za-z0-9+/=', false, true])).ok,
      false,
    );
    assert.equal((await qalc('1/0')).ok, false);
    assert.equal((await chef('x', 'HTTP request')).error.code, 'UNSUPPORTED_OPERATION');
    assert.equal((await chef('a'.repeat(65537), 'To Base64')).error.code, 'INPUT_TOO_LARGE');
    assert.equal((await chef('a'.repeat(65536), 'To Base64')).error.code, 'OUTPUT_TOO_LARGE');
    const preview = (await chef('00'.repeat(300), 'From Hex')).result;
    assert.equal(preview.byteLength, 300);
    assert.equal(preview.hexPreview.length, 512);
    assert.equal(preview.truncated, true);
    assert.equal((await qalc('1+1')).result.text, '2');
    console.log('错误参数、运算错误、未支持操作、输入/输出限制和二进制预览通过');
  }

  const slowExpression = 'sum(sin(x), 1, 100000000, x)';
  const abort = new AbortController();
  const cancelled = qalc(slowExpression, { signal: abort.signal }).catch((e) => e);
  await delay(2000);
  const cancelledPids = service.executor.activePids;
  assert.ok(cancelledPids.length >= 2, '取消时应已有实际 Chromium 进程');
  assert.equal((await chef('Hello', 'To Base64')).error.code, 'BUSY');
  abort.abort();
  await cancelled;
  await idle();
  for (const pid of cancelledPids) assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
  assert.equal((await chef('Hello', 'To Base64')).result.text, 'SGVsbG8=');
  const timeout = await qalc(slowExpression);
  assert.equal(timeout.error?.code, 'TIMEOUT', JSON.stringify(timeout));
  await idle();
  assert.equal((await qalc('2+2')).result.text, '4');
  console.log('并发超限、断开终止、真实运算超时以及失败后恢复通过');
  // Store only synthetic requests/results, never the random authorization header.
  await mkdir('outputs/bot-tools', { recursive: true });
  await writeFile(
    `outputs/bot-tools/http-${lifecycleOnly ? 'lifecycle' : 'acceptance'}.json`,
    JSON.stringify(records, null, 2) + '\n',
  );
} finally {
  await service.close();
}
