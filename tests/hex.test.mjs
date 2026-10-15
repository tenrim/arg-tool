import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {HexDocument, parseHex, parseOffset, inspectBytes, MAX_HEX_BYTES, MAX_HISTORY_BYTES, MAX_HISTORY_STEPS} from '../public/hex/model.js';
import {searchBytes, MAX_SEARCH_PATTERN_BYTES} from '../public/hex/search-worker.js';

const values = document => Array.from(document.bytes);

test('Hex document isolates original data, slices and exports from outside mutation', () => {
  const source = Uint8Array.from([0, 127, 128, 255]), document = new HexDocument().load(source);
  assert.equal(document.revision, 1);
  source[0] = 9;
  for (const snapshot of [document.bytes, document.data, document.read(), document.originalBytes(), document.exportBytes()]) snapshot[1] = 9;
  assert.deepEqual(values(document), [0, 127, 128, 255]);
  assert.equal(document.byteAt(2), 128);
  assert.deepEqual(Array.from(document.read(1, 2)), [127, 128]);
  assert.equal(document.modified, false);
  assert.throws(() => document.byteAt(4));
  assert.deepEqual(Array.from(document.read(4, 0)), []);
  assert.throws(() => document.read(3, 2));
  const buffer = Buffer.from([1, 2, 3]);
  document.load(buffer);
  buffer[0] = 9;
  const patch = Buffer.from([8]);
  document.overwrite(1, patch);
  patch[0] = 7;
  document.undo();
  document.redo();
  assert.deepEqual(values(document), [1, 8, 3], 'Uint8Array subclasses with view-producing slice must not leak original or redo buffers');
});

test('Hex edits preserve exact raw bytes, inverse patches and truthful modified state', () => {
  const document = new HexDocument().load(Uint8Array.from([65, 0, 13, 10, 255]));
  assert.equal(document.overwrite(1, [128, 255]), true);
  assert.equal(document.insert(3, [0, 1]), true);
  assert.equal(document.delete(0, 1), true);
  assert.deepEqual(values(document), [128, 255, 0, 1, 10, 255]);
  assert.equal(document.modified, true);
  assert.equal(document.revision, 4);
  assert.deepEqual(Array.from(document.originalBytes()), [65, 0, 13, 10, 255]);
  for (let i = 0; i < 3; i++) assert.equal(document.undo(), true);
  assert.deepEqual(values(document), [65, 0, 13, 10, 255]);
  assert.equal(document.modified, false);
  assert.equal(document.undo(), false);
  for (let i = 0; i < 3; i++) assert.equal(document.redo(), true);
  assert.equal(document.redo(), false);
  assert.deepEqual(Array.from(document.exportBytes()), [128, 255, 0, 1, 10, 255]);
  document.load([1, 2, 3]);
  document.overwrite(1, [9]);
  document.overwrite(1, [2]);
  assert.equal(document.modified, false, 'manual restoration is clean even without undo');
  document.insert(0, [8]);
  document.delete(0, 1);
  assert.equal(document.modified, false, 'structural edits restored to original must be clean');
});

test('Hex validation rejects edits atomically and no-ops preserve redo and revision', () => {
  const document = new HexDocument({maxBytes: 6, maxHistoryBytes: 4}).load([1, 2, 3]);
  document.overwrite(0, [9]);
  document.undo();
  const snapshot = {revision: document.revision, undo: document.undoSteps, redo: document.redoSteps, history: document.historyBytes};
  for (const change of [
    () => document.overwrite(2, [8, 9]), () => document.insert(1, [8, 9, 10, 11]),
    () => document.delete(2, 2), () => document.overwrite(-1, [0]),
    () => document.insert(0.5, [0]), () => document.overwrite(0, [256]),
    () => document.insert(0, [-1]), () => document.overwrite(0, [NaN]),
    () => document.overwrite(0, new Uint16Array([1])), () => document.overwrite(0, [4, 5, 6]),
    () => document.load(new Uint8Array(7)),
  ]) {
    assert.throws(change);
    assert.deepEqual(values(document), [1, 2, 3]);
    assert.deepEqual({revision: document.revision, undo: document.undoSteps, redo: document.redoSteps, history: document.historyBytes}, snapshot);
  }
  assert.equal(document.overwrite(0, [1]), false);
  assert.equal(document.insert(1, []), false);
  assert.equal(document.delete(1, 0), false);
  assert.equal(document.revision, snapshot.revision);
  assert.equal(document.canRedo, true);
  document.overwrite(0, [7]);
  assert.equal(document.canRedo, false);
  assert.equal(document.historyBytes, 2);
  const noOp = new HexDocument({maxHistoryBytes: 2}).load([1, 2, 3]);
  assert.equal(noOp.overwrite(0, [1, 2, 3]), false, 'a no-op larger than history capacity needs no undo allocation');
});

test('Hex undo history has bounded steps and total undo plus redo storage', () => {
  const document = new HexDocument({maxHistorySteps: 3, maxHistoryBytes: 5}).load([0]);
  for (let value = 1; value <= 5; value++) document.overwrite(0, [value]);
  assert.equal(document.undoSteps, 2);
  assert.equal(document.historyBytes, 4);
  document.undo();
  assert.equal(document.historyBytes, 4, 'moving to redo must not evade the shared budget');
  document.undo();
  assert.deepEqual(values(document), [3]);
  assert.equal(document.undo(), false);
  assert.equal(document.redoSteps, 2);
  document.overwrite(0, [8]);
  assert.equal(document.redoSteps, 0);
  assert.equal(document.historyBytes, 2);
  const steps = new HexDocument({maxHistorySteps: 2}).load([0]);
  for (let value = 1; value <= 5; value++) steps.overwrite(0, [value]);
  assert.equal(steps.undoSteps, 2);
  assert.equal(MAX_HEX_BYTES, 32 * 1024 * 1024);
  assert.equal(MAX_HISTORY_BYTES, 8 * 1024 * 1024);
  assert.equal(MAX_HISTORY_STEPS, 64);
  assert.throws(() => new HexDocument({maxBytes: MAX_HEX_BYTES + 1}));
  assert.throws(() => new HexDocument({maxHistorySteps: 0}));
});

test('Hex model matches an independent array oracle through random structural edits and history', () => {
  let seed = 0x183511;
  const random = max => {seed = (1664525 * seed + 1013904223) >>> 0; return seed % max;};
  for (let round = 0; round < 20; round++) {
    const original = Array.from({length: 12}, () => random(256));
    const document = new HexDocument({maxBytes: 128}).load(original);
    let expected = original.slice();
    const states = [expected.slice()];
    for (let turn = 0; turn < 30; turn++) {
      const action = random(3), offset = random(expected.length + 1), inserted = Array.from({length: 1 + random(3)}, () => random(256));
      let changed;
      if (action === 0 && offset < expected.length) {
        inserted.length = Math.min(inserted.length, expected.length - offset);
        changed = document.overwrite(offset, inserted);
        expected.splice(offset, inserted.length, ...inserted);
      } else if (action === 1 || !expected.length) {
        changed = document.insert(offset, inserted);
        expected.splice(offset, 0, ...inserted);
      } else {
        const length = Math.min(1 + random(3), expected.length - offset);
        changed = document.delete(offset, length);
        expected.splice(offset, length);
      }
      if (changed) states.push(expected.slice());
      assert.deepEqual(values(document), expected);
      assert.equal(document.modified, expected.length !== original.length || expected.some((byte, index) => byte !== original[index]));
    }
    for (let index = states.length - 2; index >= 0; index--) {
      assert.equal(document.undo(), true);
      assert.deepEqual(values(document), states[index]);
    }
    assert.equal(document.modified, false);
    for (let index = 1; index < states.length; index++) {
      assert.equal(document.redo(), true);
      assert.deepEqual(values(document), states[index]);
    }
  }
});

test('Hex and offset parsers reject partial bytes and ambiguous offsets without coercion', () => {
  assert.deepEqual(Array.from(parseHex(' 00 ff,0x41:42-0x4344\n80 ')), [0, 255, 65, 66, 67, 68, 128]);
  assert.deepEqual(Array.from(parseHex('4142')), [65, 66]);
  assert.deepEqual(Array.from(parseHex('', {allowEmpty: true})), []);
  for (const text of ['', 'F', '0x0', '41 1', '41 GG', '0x', '1e3', '-41', '41,', '<script>']) assert.throws(() => parseHex(text));
  assert.throws(() => parseHex('010203', {maxBytes: 2}));
  assert.equal(parseOffset('0x10', {max: 16}), 16);
  assert.equal(parseOffset('0016', {max: 16}), 16);
  assert.equal(parseOffset(0), 0);
  for (const value of ['-1', '1e2', '10.0', '10px', 'FF', '', '0x', NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => parseOffset(value));
  assert.throws(() => parseOffset('17', {max: 16}));
});

test('Byte inspector respects actual slice offset, endian, 64-bit precision and unavailable widths', () => {
  const backing = Uint8Array.from([222, 221, 1, 2, 3, 4, 5, 6, 7, 128, 220]);
  const bytes = backing.subarray(2, 10);
  const little = inspectBytes(bytes), big = inspectBytes(bytes, 0, {littleEndian: false});
  assert.equal(little.uint16, 513);
  assert.equal(big.uint16, 258);
  assert.equal(little.uint32, 0x04030201);
  assert.equal(big.uint32, 0x01020304);
  assert.equal(little.uint64, 0x8007060504030201n.toString());
  assert.equal(little.int64, BigInt.asIntN(64, 0x8007060504030201n).toString());
  const final = inspectBytes(bytes, 7);
  assert.equal(final.uint8, 128);
  assert.equal(final.int8, -128);
  for (const name of ['uint16', 'int16', 'uint32', 'int32', 'uint64', 'int64', 'float32', 'float64']) assert.equal(final[name], null);
  assert.equal(final.binary, '10000000');
  assert.equal(final.hex, '80');
  assert.equal(final.validUtf8, false);
  assert.equal(final.utf8, null);
  assert.equal(inspectBytes(bytes, 8).hex, '');
  assert.throws(() => inspectBytes(bytes, 9));
  assert.throws(() => inspectBytes(bytes, 0, {length: 257}));
});

test('Byte inspector never replaces malformed UTF8 and preserves BOM, CRLF and true float values', () => {
  const utf8 = new TextEncoder().encode('\uFEFF中\r\n');
  assert.equal(inspectBytes(utf8).utf8, '\uFEFF中\r\n');
  assert.equal(inspectBytes(utf8, 0, {length: 4}).validUtf8, false);
  assert.equal(inspectBytes(Uint8Array.from([0xc0, 0xaf])).validUtf8, false);
  const data = new Uint8Array(8), view = new DataView(data.buffer);
  view.setFloat64(0, Math.PI, true);
  assert.equal(inspectBytes(data).float64, Math.PI);
  view.setFloat32(0, Infinity, false);
  assert.equal(inspectBytes(data, 0, {littleEndian: false}).float32, Infinity);
});

test('Byte search preserves overlapping matches, exact bounds and directional wrap', () => {
  const data = Uint8Array.from([1, 1, 1, 1, 2, 1, 1]), pattern = Uint8Array.from([1, 1]);
  assert.deepEqual(searchBytes(data, pattern).offsets, [0, 1, 2, 5]);
  assert.deepEqual(searchBytes(data, pattern, {maxMatches: 2}), {offsets: [0, 1], hasMore: true, offset: 0, wrapped: false});
  assert.equal(searchBytes(data, pattern, {direction: 'next', start: 2}).offset, 2);
  assert.equal(searchBytes(data, pattern, {direction: 'next', start: 3}).offset, 5);
  assert.deepEqual(searchBytes(data, pattern, {direction: 'next', start: 6}), {offsets: [0], hasMore: false, offset: 0, wrapped: true});
  assert.equal(searchBytes(data, pattern, {direction: 'next', start: 6, wrap: false}).offset, null);
  assert.equal(searchBytes(data, pattern, {direction: 'previous', start: 4}).offset, 2);
  assert.deepEqual(searchBytes(data, pattern, {direction: 'previous', start: -1}), {offsets: [5], hasMore: false, offset: 5, wrapped: true});
  assert.equal(searchBytes(data, pattern, {direction: 'previous', start: -1, wrap: false}).offset, null);
  assert.deepEqual(searchBytes(new Uint8Array(), pattern).offsets, []);
  assert.deepEqual(searchBytes(data, new Uint8Array(8)).offsets, []);
  assert.throws(() => searchBytes(data, new Uint8Array()));
  assert.throws(() => searchBytes(data, pattern, {maxMatches: 10001}));
  assert.throws(() => searchBytes(data, pattern, {start: 8}));
  assert.throws(() => searchBytes(data, new Uint8Array(MAX_SEARCH_PATTERN_BYTES + 1)));
});

test('Byte search agrees with brute-force starts, supports UTF8 and adversarial repeated prefixes', () => {
  let seed = 0x12abc;
  const random = max => {seed = (1103515245 * seed + 12345) >>> 0; return seed % max;};
  for (let round = 0; round < 60; round++) {
    const data = Uint8Array.from({length: 25}, () => random(4));
    const pattern = Uint8Array.from({length: 1 + random(4)}, () => random(4));
    const expected = [];
    for (let i = 0; i <= data.length - pattern.length; i++) if (pattern.every((byte, index) => byte === data[i + index])) expected.push(i);
    assert.deepEqual(searchBytes(data, pattern).offsets, expected);
    for (let start = -1; start <= data.length; start++) {
      assert.equal(searchBytes(data, pattern, {direction: 'next', start}).offset, expected.find(offset => offset >= start) ?? expected[0] ?? null);
      assert.equal(searchBytes(data, pattern, {direction: 'previous', start}).offset, expected.filter(offset => offset <= start).at(-1) ?? expected.at(-1) ?? null);
    }
  }
  const encoder = new TextEncoder();
  assert.deepEqual(searchBytes(encoder.encode('谜😀谜😀'), encoder.encode('😀')).offsets, [3, 10]);
  const repeated = new Uint8Array(1024 * 1024).fill(65), needle = new Uint8Array(32769).fill(65);
  needle[needle.length - 1] = 66;
  assert.deepEqual(searchBytes(repeated, needle).offsets, [], 'KMP avoids quadratic rescanning of repeated prefix data');
  assert.equal(searchBytes(repeated, Uint8Array.of(65), {direction: 'next', start: 20000}).offset, 20000, 'directional search is not limited to the first10000 matches');
});

test('Actual search Worker protocol preserves request identity and returns visible validation errors', async () => {
  const url = new URL('../public/hex/search-worker.js', import.meta.url).href;
  const script = `import {parentPort} from 'node:worker_threads';globalThis.self={postMessage:value=>parentPort.postMessage(value)};await import(${JSON.stringify(url)});parentPort.on('message',data=>self.onmessage({data}));`;
  const worker = new Worker(new URL('data:text/javascript,' + encodeURIComponent(script)), {type: 'module'});
  const request = message => new Promise((resolve, reject) => {
    worker.once('message', resolve);
    worker.once('error', reject);
    worker.postMessage(message);
  });
  try {
    assert.deepEqual(await request({id: 'scan1', revision: 7, bytes: Uint8Array.from([0, 255, 0, 255]), pattern: Uint8Array.of(255)}), {id: 'scan1', revision: 7, offsets: [1, 3], hasMore: false, offset: 1, wrapped: false});
    const error = await request({id: 'scan2', revision: 8, bytes: Uint8Array.of(1), pattern: new Uint8Array()});
    assert.equal(error.id, 'scan2');
    assert.equal(error.revision, 8);
    assert.match(error.error, /不能为空/);
    assert.match((await request(null)).error, /字节数据/);
  } finally { await worker.terminate(); }
});
