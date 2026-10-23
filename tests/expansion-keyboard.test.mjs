import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {runKeyboard, KEYBOARD_MAPPINGS, ORIGINAL_MAPPING_ROWS} from '../public/expansion/keyboard-core.js';
import {KEYBOARD_TASKS} from '../public/expansion/keyboard-catalog.js';

test('QWERTY uses all 26 original mappings and its actual inverse, preserving punctuation and case', () => {
  assert.equal(runKeyboard('qwerty', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ').text, 'QWERTYUIOPASDFGHJKLZXCVBNM');
  assert.equal(runKeyboard('qwerty', 'QWERTYUIOPASDFGHJKLZXCVBNM', {direction: 'decrypt'}).text, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  assert.equal(runKeyboard('qwerty', 'Abc, xyz!').text, 'Qwe, bnm!');
  assert.equal(runKeyboard('qwerty', 'Qwe, bnm!', {direction: 'decrypt'}).text, 'Abc, xyz!');
});

test('nine-key coordinate conversion retains four-letter keys 7/9 and explicit word boundaries', () => {
  const expected = '21 22 23 31 32 33 41 42 43 51 52 53 61 62 63 71 72 73 74 81 82 83 91 92 93 94';
  assert.equal(runKeyboard('ninekey', 'abcdefghijklmnopqrstuvwxyz').text, expected);
  assert.equal(runKeyboard('ninekey', expected, {direction: 'decrypt'}).text, 'abcdefghijklmnopqrstuvwxyz');
  assert.equal(runKeyboard('ninekey', 'Hello world!').text, '42 32 53 53 63 / 91 63 73 53 31 !');
  assert.equal(runKeyboard('ninekey', '42 32 53 53 63 / 91 63 73 53 31 !', {direction: 'decrypt'}).text, 'hello world!');
  assert.equal(runKeyboard('ninekey', '21427494', {direction: 'decrypt'}).text, 'ahsz');
  assert.throws(() => runKeyboard('ninekey', '97', {direction: 'decrypt', unknown: 'reject'}), /映射表以外/);
});

test('all 12 original rows survive extraction, including source ambiguities and historical symbols', () => {
  assert.equal(ORIGINAL_MAPPING_ROWS.length, 12); assert.equal(KEYBOARD_MAPPINGS.length, 12);
  assert.deepEqual(ORIGINAL_MAPPING_ROWS.map(row => row.length), [26,26,26,26,26,26,10,26,10,118,26,26]);
  assert.equal(ORIGINAL_MAPPING_ROWS[2][8], '24'); assert.equal(ORIGINAL_MAPPING_ROWS[2][9], '24');
  assert.equal(ORIGINAL_MAPPING_ROWS[9][112], 'uut'); assert.equal(ORIGINAL_MAPPING_ROWS[9][117], 'uuo');
  assert.equal(runKeyboard('qwerty', 'ij', {mapping: 'polybius'}).text, '24 24');
  const ambiguous = runKeyboard('qwerty', '24', {mapping: 'polybius', direction: 'decrypt'});
  assert.equal(ambiguous.text, '{i|j}'); assert.equal(ambiguous.details.ambiguousMatches, 1);
  assert.throws(() => runKeyboard('qwerty', '24', {mapping: 'polybius', direction: 'decrypt', ambiguity: 'reject'}), /多个字符/);
  assert.equal(runKeyboard('qwerty', '24', {mapping: 'polybius', direction: 'decrypt', ambiguity: 'first'}).text, 'i');
  assert.equal(runKeyboard('qwerty', '113 115 117 118', {mapping: 'elements-legacy'}).text, 'uut uup uus uuo');
});

test('original arbitrary two-row/longest-prefix mapping remains a real operation, with explicit failures', () => {
  const options = {sourceMap: 'a ab abc', targetMap: 'x y z', case: 'lower'};
  assert.equal(runKeyboard('qwerty', 'abcaba', options).text, 'zyx');
  assert.equal(runKeyboard('qwerty', 'zyx', {...options, direction: 'decrypt'}).text, 'abc ab a');
  assert.equal(runKeyboard('qwerty', 'a🙂b', {unknown: 'remove'}).text, 'qw');
  assert.throws(() => runKeyboard('qwerty', 'a🙂b', {unknown: 'reject'}), /映射表以外/);
  assert.throws(() => runKeyboard('qwerty', 'abc', {sourceMap: 'a b', targetMap: 'x'}), /相同/);
  assert.throws(() => runKeyboard('qwerty', 'abc', {separator: 'a'}), /分隔符/);
  assert.throws(() => runKeyboard('missing', 'abc'), /未知键盘/);
  assert.equal(KEYBOARD_TASKS.length, 2);
});

test('mapping import records verify actual unchanged source, generated data and license bytes', async () => {
  const base = new URL('../public/vendor/expansion/keyboard/', import.meta.url), manifest = JSON.parse(await readFile(new URL('UPSTREAM.json', base), 'utf8'));
  const source = await readFile(new URL('../' + manifest.source_path, import.meta.url));
  assert.equal(createHash('sha256').update(source).digest('hex'), manifest.source_sha256);
  assert.equal(manifest.commit, '29fa4ee1c60873484688c250b37c87d93f54cae4');
  for (const [name, expected] of Object.entries(manifest.generated_sha256)) assert.equal(createHash('sha256').update(await readFile(new URL(name, base))).digest('hex'), expected);
});
