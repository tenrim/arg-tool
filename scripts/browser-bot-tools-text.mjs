import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { startBotTools } from '../services/bot-tools/server.mjs';
import { readConfig } from '../services/bot-tools/config.mjs';
import { createCatalogue } from '../services/bot-tools/catalogue.mjs';

const token = randomBytes(32).toString('hex');
const service = await startBotTools(
  readConfig({
    BOT_TOOLS_TOKEN: token,
    BOT_TOOLS_PORT: '0',
    BOT_TOOLS_TIMEOUT_MS: '30000',
    BOT_TOOLS_CHROMIUM_PATH: process.env.BOT_TOOLS_CHROMIUM_PATH || '',
  }),
  { probe: false },
);
const catalogue = await createCatalogue('https://www.tool.mistarg.cn/');
const step = (op, overrides = {}) => ({
  op,
  args: catalogue
    .operation(op)
    .defaults.map((v, i) => (Object.hasOwn(overrides, i) ? overrides[i] : v)),
});
const records = [];
async function run(name, input, recipe, check) {
  const response = await fetch(service.base + '/run', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: JSON.stringify({ engine: 'cyberchef', input, recipe }),
  });
  const body = await response.json();
  const record = { name, input, recipe, status: response.status, response: body };
  records.push(record);
  try {
    assert.equal(body.ok, true, JSON.stringify(body));
    check(body.result);
    record.passed = true;
  } catch (error) {
    record.passed = false;
    record.failure = error.message;
  }
  console.log(name + ': ' + (record.passed ? 'PASS' : 'FAIL ' + record.failure));
}
const text = (expected) => (r) => assert.equal(r.text, expected);
const binary = (expected) => (r) => {
  assert.equal(r.type, 'binary');
  assert.equal(r.hexPreview, Buffer.from(expected).toString('hex'));
};
const cases = [
  ['BLAKE2s', 'abc', [step('BLAKE2s')], text(createHash('blake2s256').update('abc').digest('hex'))],
  [
    'PGP密钥',
    '',
    [step('Generate PGP Key Pair', { 0: 'ECC-256', 2: 'Bot test' })],
    (r) => {
      assert.match(r.text, /BEGIN PGP PUBLIC KEY BLOCK/);
      assert.match(r.text, /BEGIN PGP PRIVATE KEY BLOCK/);
    },
  ],
  [
    'UserAgent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    [step('Parse User Agent')],
    (r) => assert.match(r.text, /Chrome/),
  ],
  [
    'Protobuf',
    '0d1c0000001203596f751a024d65202b2a0a0a066162633132331200',
    [step('From Hex'), step('Protobuf Decode')],
    (r) => assert.deepEqual(r.data, { 1: 28, 2: 'You', 3: 'Me', 4: 43, 5: { 1: 'abc123', 2: {} } }),
  ],
  ['大小写', 'Hello', [step('To Upper case')], text('HELLO')],
  ['摩斯', 'SOS', [step('To Morse Code')], text('... --- ...')],
  ['凯撒', 'Hello', [step('ROT13')], binary('Uryyb')],
  ['密码', 'ATTACKATDAWN', [step('Vigenère Encode', { 0: 'LEMON' })], text('LXFOPVEFRNHR')],
  ['字符集', '迷雾', [step('Encode text'), step('Decode text')], text('迷雾')],
  ['URL', 'hello%20world', [step('URL Decode')], text('hello world')],
  [
    '替换',
    'a12b34',
    [step('Find / Replace', { 0: { option: 'Regex', string: '[0-9]+' }, 1: '#' })],
    text('a#b#'),
  ],
  [
    '正则',
    'a12b34',
    [step('Regular expression', { 1: '[0-9]+', 8: 'List matches' })],
    (r) => assert.match(r.text, /12[\s\S]*34/),
  ],
  ['JSON', '{"a":1}', [step('JSON Beautify')], (r) => assert.equal(JSON.parse(r.text).a, 1)],
  [
    'CSV',
    'name,age\nAlice,20',
    [step('CSV to JSON')],
    (r) => {
      assert.equal(r.type, 'json');
      assert.equal(r.data[0].name, 'Alice');
    },
  ],
  [
    'JWT',
    'eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjMifQ.',
    [step('JWT Decode')],
    (r) => {
      assert.equal(r.type, 'json');
      assert.match(r.text, /123/);
    },
  ],
  [
    'YAML',
    'name: Alice\ncount: 2',
    [step('YAML to JSON')],
    (r) => assert.deepEqual(r.data, { name: 'Alice', count: 2 }),
  ],
  ['Jq', '{"a":3}', [step('Jq', { 0: '.a' })], text('3')],
  ['JSONata', '{"a":3}', [step('Jsonata Query', { 0: 'a * 2' })], text('6')],
  ['模板', '{"name":"Alice"}', [step('Template', { 0: 'Hello {{name}}' })], text('Hello Alice')],
  [
    'MessagePack',
    '{"a":1}',
    [step('To MessagePack'), step('From MessagePack')],
    (r) => assert.deepEqual(r.data, { a: 1 }),
  ],
  [
    'CBOR',
    '{"a":1}',
    [step('CBOR Encode'), step('CBOR Decode')],
    (r) => assert.deepEqual(r.data, { a: 1 }),
  ],
  ['压缩', 'Hello 迷雾', [step('Gzip'), step('Gunzip'), step('Decode text')], text('Hello 迷雾')],
  [
    'AES',
    'Hello 迷雾',
    [
      step('To Hex'),
      step('AES Encrypt', {
        0: { option: 'Hex', string: '00'.repeat(16) },
        1: { option: 'Hex', string: '00'.repeat(16) },
        3: 'Hex',
      }),
      step('AES Decrypt', {
        0: { option: 'Hex', string: '00'.repeat(16) },
        1: { option: 'Hex', string: '00'.repeat(16) },
        5: 'Hex',
      }),
      step('From Hex'),
      step('Decode text'),
    ],
    text('Hello 迷雾'),
  ],
  [
    '大数',
    '123456789012345678901234567890',
    [step('From Base', { 0: 10 }), step('To Base', { 0: 16 })],
    text('18ee90ff6c373e0ee4e3f0ad2'),
  ],
  ['数值', '1\n2\n3', [step('Mean')], text('2')],
  ['熵', 'aaaa', [step('Entropy')], text('0')],
  [
    '频率',
    'aaab',
    [step('Frequency distribution')],
    (r) => {
      assert.equal(r.data.distribution[97], 3);
      assert.equal(r.data.distribution[98], 1);
    },
  ],
  [
    'Magic',
    'SGVsbG8gd29ybGQ=',
    [step('Magic', { 0: 1 })],
    (r) => {
      assert.equal(r.type, 'json');
      assert.match(r.text, /Hello world/);
      assert.match(r.text, /自动推测/);
    },
  ],
  [
    'HTML文本',
    '<b>Hello</b><script>alert(1)</script>',
    [step('HTML To Text')],
    (r) => assert.match(r.text, /Hello/),
  ],
  [
    'Markdown',
    '**Hello**',
    [step('Render Markdown')],
    (r) => {
      assert.equal(r.sourceType, 'html');
      assert.equal(r.text, 'Hello');
    },
  ],
  ['差异', 'abc\n\naxc', [step('Diff')], (r) => assert.match(r.text, /a[\s\S]*c/)],
  ['目录文本', 'a/b\na/c', [step('File Tree')], (r) => assert.match(r.text, /b[\s\S]*c/)],
  [
    'YARA文本匹配',
    'Hello world',
    [step('YARA Rules', { 0: 'rule hello { strings: $a = "Hello" condition: $a }' })],
    (r) => assert.match(r.text, /hello/),
  ],
  [
    'Enigma往返',
    'HELLOWORLD',
    [step('Enigma', { 15: false }), step('Enigma', { 15: false })],
    text('HELLOWORLD'),
  ],
  [
    'PEM文本',
    '3000',
    [step('Hex to PEM'), step('PEM to Hex')],
    (r) => assert.equal(r.text.replace(/\s/g, ''), '3000'),
  ],
  ['反汇编', '90', [step('Disassemble x86')], (r) => assert.match(r.text, /nop/i)],
  [
    '寄存器',
    '3abc',
    [
      step('Register', { 0: '^(\\d)', 1: true }),
      step('Find / Replace', { 0: { option: 'Simple string', string: 'abc' }, 1: '$R0' }),
    ],
    text('33'),
  ],
];
try {
  for (const [name, ...args] of cases)
    if (!process.env.BOT_TOOLS_CASE || process.env.BOT_TOOLS_CASE.split(',').includes(name))
      await run(name, ...args);
} finally {
  await service.close();
  await mkdir('outputs/bot-tools', { recursive: true });
  await writeFile(
    'outputs/bot-tools/http-text' + (process.env.BOT_TOOLS_CASE ? '-focused' : '') + '.json',
    JSON.stringify(records, null, 2) + '\n',
  );
}
assert.equal(records.filter((r) => !r.passed).length, 0, '文字接口用例失败，见输出记录');
