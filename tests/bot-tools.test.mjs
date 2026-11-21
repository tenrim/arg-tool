import assert from 'node:assert/strict';
import test from 'node:test';
import { createCatalogue } from '../services/bot-tools/catalogue.mjs';
import { readConfig } from '../services/bot-tools/config.mjs';
import { SUPPORTED, originalCatalogue, exclusionReason } from '../services/bot-tools/scope.mjs';
const catalogue = await createCatalogue('https://www.tool.mistarg.cn/');

test('固定目录逐项分类，全部文字操作接受原默认参数结构', () => {
  assert.equal(Object.keys(originalCatalogue.operations).length, 505);
  assert.equal(SUPPORTED.length, 456);
  for (const op of Object.keys(originalCatalogue.operations)) {
    const info = catalogue.operation(op);
    assert.equal(info.executable, !exclusionReason(op), op);
    if (info.executable)
      assert.deepEqual(
        catalogue.validate({ engine: 'cyberchef', input: '', recipe: [{ op }] }).recipe[0].args,
        info.defaults,
        op,
      );
    else
      assert.throws(
        () => catalogue.validate({ engine: 'cyberchef', input: '', recipe: [{ op }] }),
        { code: 'UNSUPPORTED_OPERATION' },
        op,
      );
  }
  for (const op of ['Magic', 'File Tree', 'P-list Viewer', 'JWT Decode', 'YARA Rules'])
    assert.equal(catalogue.operation(op).executable, true, op);
});

test('复合参数只接受原结构，禁止多余代码和 URL 字段', () => {
  const info = catalogue.operation('AES Encrypt');
  const job = (key) => ({
    engine: 'cyberchef',
    input: 'text',
    recipe: [{ op: info.op, args: [key, ...info.defaults.slice(1)] }],
  });
  assert.doesNotThrow(() => catalogue.validate(job({ option: 'Hex', string: '00'.repeat(16) })));
  for (const key of [
    { option: 'URL', string: 'https://example.com/key' },
    { option: 'Hex', string: '00', code: 'alert(1)' },
    '00',
  ])
    assert.throws(() => catalogue.validate(job(key)), { code: 'INVALID_ARGUMENTS' });
});
test('机器人元数据复用原参数和真实操作路由', () => {
  const info = catalogue.operation('op:SHA2');
  assert.deepEqual(info.defaults, ['512', 64, 160]);
  assert.equal(catalogue.operation('op:HTTP request').executable, false);
  const base = catalogue.search('From Base64').find((e) => e.id === 'topic:base-family');
  assert.equal(base.operationId, 'op:From Base64');
  assert.match(base.url, /op=From\+Base64/);
  assert.equal(
    catalogue.search('脑图').some((e) => e.executable),
    false,
  );
});
test('机器人只接受限定字段、参数和执行范围', () => {
  const job = { engine: 'cyberchef', input: 'Hello', recipe: [{ op: 'To Base64' }] };
  assert.deepEqual(catalogue.validate(job).recipe[0].args, ['A-Za-z0-9+/=']);
  for (const value of [
    { ...job, url: 'https://example.com/' },
    { ...job, recipe: [{ op: 'To Base64', args: [false] }] },
    { ...job, recipe: [{ op: 'HTTP request' }] },
    { ...job, recipe: Array(9).fill({ op: 'To Base64' }) },
    { ...job, input: '汉'.repeat(30000) },
    { engine: 'qalculate', expression: '1+1', files: [] },
    { engine: 'qalculate', expression: 'command(ls)' },
    { engine: 'qalculate', expression: 'import("/etc/passwd")' },
  ])
    assert.throws(() => catalogue.validate(value));
});
test('机器人配置拒绝公开监听、弱凭据和任意资源协议', () => {
  const env = { BOT_TOOLS_TOKEN: 'test-only-012345678901234567890123456' };
  assert.equal(readConfig(env).host, '127.0.0.1');
  for (const extra of [
    { BOT_TOOLS_HOST: '0.0.0.0' },
    { BOT_TOOLS_TOKEN: 'short' },
    { BOT_TOOLS_RESOURCE_BASE: 'http://example.com/' },
    { BOT_TOOLS_RESOURCE_BASE: 'file:///tmp/' },
    { BOT_TOOLS_RESOURCE_BASE: 'https://user:password@example.com/' },
  ])
    assert.throws(() => readConfig({ ...env, ...extra }));
});
