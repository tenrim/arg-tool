import test from 'node:test';
import assert from 'node:assert/strict';
import { transform, runPipeline, entropy, analyzeText, inspectInvisible, base32Decode } from '../public/engine.js';

test('RFC 4648 Base64 and Base32 vectors, including UTF-8', async () => {
  for (const [plain, base64, base32] of [['f', 'Zg==', 'MY======'], ['fo', 'Zm8=', 'MZXQ===='], ['foo', 'Zm9v', 'MZXW6==='], ['foobar', 'Zm9vYmFy', 'MZXW6YTBOI======']]) {
    assert.equal(await transform('base64', plain, 'encode'), base64);
    assert.equal(await transform('base64', base64), plain);
    assert.equal(await transform('base32', plain, 'encode'), base32);
    assert.equal(await transform('base32', base32), plain);
  }
  for (const id of ['base64', 'base32', 'hex', 'binary', 'decimal', 'url', 'unicode']) {
    const value = '迷雾 ARG 🔎'; assert.equal(await transform(id, await transform(id, value, 'encode')), value);
  }
});
test('classical ciphers match published reference examples', async () => {
  assert.equal(await transform('caesar', 'ATTACK AT DAWN', 'encode', { shift: 3 }), 'DWWDFN DW GDZQ');
  assert.equal(await transform('vigenere', 'ATTACKATDAWN', 'encode', { key: 'LEMON' }), 'LXFOPVEFRNHR');
  assert.equal(await transform('vigenere', 'LXFOPVEFRNHR', 'decode', { key: 'LEMON' }), 'ATTACKATDAWN');
  assert.equal(await transform('autokey', 'ATTACKATDAWN', 'encode', { key: 'QUEENLY' }), 'QNXEPVYTWTWP');
  assert.equal(await transform('autokey', 'QNXEPVYTWTWP', 'decode', { key: 'QUEENLY' }), 'ATTACKATDAWN');
  assert.equal(await transform('rail', 'WEAREDISCOVEREDFLEEATONCE', 'encode', { rails: 3 }), 'WECRLTEERDSOEEFEAOCAIVDEN');
  assert.equal(await transform('rail', 'WECRLTEERDSOEEFEAOCAIVDEN', 'decode', { rails: 3 }), 'WEAREDISCOVEREDFLEEATONCE');
  assert.equal(await transform('affine', 'AFFINECIPHER', 'encode', { a: 5, b: 8 }), 'IHHWVCSWFRCP');
  assert.equal(await transform('affine', 'IHHWVCSWFRCP', 'decode', { a: 5, b: 8 }), 'AFFINECIPHER');
});
test('Morse, Braille, A1Z26 and Bacon use documented conventions', async () => {
  assert.equal(await transform('morse', 'SOS 123', 'encode'), '... --- ... / .---- ..--- ...--');
  assert.equal(await transform('morse', '... --- ... / .---- ..--- ...--'), 'SOS 123');
  assert.equal(await transform('braille', 'ARG', 'encode'), '⠁⠗⠛');
  assert.equal(await transform('braille', '⠁⠗⠛'), 'ARG');
  assert.equal(await transform('braille', await transform('braille', 'ARG 123', 'encode')), 'ARG 123');
  assert.equal(await transform('a1z26', '1-18-7 / 20-15-15-12-19'), 'ARG TOOLS');
  assert.equal(await transform('bacon', 'AAAAA BAAAB AABBA'), 'ARG');
});
test('invalid encodings and incompatible parameters fail intentionally', async () => {
  for (const [id, input, params] of [['hex', 'abc'], ['binary', '0101'], ['decimal', '256'], ['base64', '!!'], ['morse', '..--..-'], ['vigenere', 'TEXT', { key: '' }], ['affine', 'TEXT', { a: 2, b: 1 }], ['unicode', 'U+110000']]) {
    await assert.rejects(transform(id, input, 'decode', params));
  }
  assert.throws(() => base32Decode('M'));
  assert.throws(() => base32Decode('MZ======'));
  await assert.rejects(transform('url', '%GG'), /URL 编码无效/);
  await assert.rejects(transform('base64', '/w=='), /UTF-8/);
});
test('UTF-8 XOR, HTML entities, graphemes and known SHA-256', async () => {
  const text = '迷雾 ARG'; assert.equal(await transform('xor', await transform('xor', text, 'encode', { key: '密钥' }), 'decode', { key: '密钥' }), text);
  assert.equal(await transform('html', '&lt;ARG&gt; &#x1F50D;'), '<ARG> 🔍');
  assert.equal(await transform('reverse', 'e\u0301🔎A'), 'A🔎e\u0301');
  assert.equal(await transform('sha256', 'abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
test('processing chains preserve order and identify the failing step', async () => {
  const result = await runPipeline('TkVU', [{ id: 'base64', mode: 'decode' }, { id: 'rot13', mode: 'decode' }]);
  assert.equal(result.output, 'ARG'); assert.deepEqual(result.results.map(x => x.output), ['NET', 'ARG']);
  await assert.rejects(runPipeline('!', [{ id: 'base64', mode: 'decode' }]), /第 1 步/);
});
test('frequency and invisible-character diagnostics use actual bytes and code points', () => {
  assert.equal(entropy(Uint8Array.from({ length: 256 }, (_, i) => i)), 8);
  assert.equal(entropy(new Uint8Array()), 0); assert.equal(analyzeText('AA').coincidence, 1);
  assert.deepEqual(inspectInvisible('🔎A\u200b'), [{ index: 2, code: 'U+200B', name: 'ZERO WIDTH SPACE' }]);
});
