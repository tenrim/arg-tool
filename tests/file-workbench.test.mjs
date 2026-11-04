import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compareSets,
  readSet,
  transformFile,
  validateFiles,
  safePath,
} from '../public/file-workbench/model.js';
import { zipSync } from '../public/vendor/round2/fflate.js';
const bytes = (text) => new TextEncoder().encode(text);
const row = (path, text) => ({ path, bytes: bytes(text) });
test('版本比较按完整字节区分修改、相同、增删和唯一改名候选', async () => {
  const rows = await compareSets(
    [row('same', 'x'), row('edit', 'ABC'), row('old', 'rename'), row('gone', 'gone')],
    [row('same', 'x'), row('edit', 'ADC'), row('new', 'rename'), row('add', 'add')],
  );
  assert.deepEqual(
    rows.map((r) => r.kind),
    ['相同', '修改', '疑似改名', '删除', '新增'],
  );
  assert.equal(rows[1].differences, 1);
  assert.equal(rows[1].firstOffset, 1);
  assert.equal(rows[2].after, 'new');
});
test('重复内容不猜测改名；长度差计入字节数', async () => {
  const rows = await compareSets(
    [row('a', 'a'), row('c', 'aaa')],
    [row('b', 'a'), row('d', 'a'), row('c', 'a')],
  );
  assert.equal(rows[0].differences, 2);
  assert.ok(!rows.some((r) => r.kind === '疑似改名'));
});
test('ZIP 保留完整目录、拒绝重复路径、损坏和越界输入', async () => {
  const zip = zipSync({ 'a/x.txt': bytes('one'), 'b/x.txt': bytes('two') });
  const result = await readSet([{ name: 'files.zip', bytes: zip }], true);
  assert.deepEqual(
    result.map((r) => r.path),
    ['a/x.txt', 'b/x.txt'],
  );
  for (const name of ['../a', '/a', 'a//b', 'C:/a']) assert.throws(() => safePath(name));
  assert.throws(() => validateFiles([row('a', '1'), row('a', '2')]));
  assert.throws(() => validateFiles([{ name: 'a', size: 33 * 1024 * 1024 }]));
  await assert.rejects(readSet([{ name: 'bad.zip', bytes: bytes('not zip') }], true));
});
test('批量转换保留二进制、严格 Base64 与 UTF-8，换行保留 BOM', async () => {
  const input = new Uint8Array([0, 255, 1, 2, 3]);
  const encoded = await transformFile(input, 'base64-encode');
  assert.deepEqual((await transformFile(encoded.bytes, 'base64-decode')).bytes, input);
  for (const input of ['!!!', 'Zg', 'Zh=='])
    await assert.rejects(transformFile(bytes(input), 'base64-decode'));
  await assert.rejects(transformFile(new Uint8Array([255]), 'text-lf'));
  assert.deepEqual(
    (await transformFile(bytes('\ufeffA\r\nB\rC'), 'text-lf')).bytes,
    bytes('\ufeffA\nB\nC'),
  );
  assert.equal(
    new TextDecoder().decode((await transformFile(bytes('abc'), 'sha256')).bytes).trim(),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});
