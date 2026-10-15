import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {compileDefinition, createSession, stepSession, undoSession, resetSession, snapshotSession, TURING_LIMITS} from '../public/turing/core.js';
import {load, JSON_SCHEMA} from '../public/vendor/turing/js-yaml.mjs';
import {TuringMachine, MoveHead} from '../public/vendor/turing/machine.js';
import Tape from '../public/vendor/turing/tape.js';

const increment = `blank: ' '
input: '111'
start state: scan
table:
  scan:
    '1': R
    ' ': {write: '1', L: done}
  done:
`;
const endless = `blank: ' '
start state: loop
table:
  loop:
    ' ': R
`;
const state = (rules, input, head) => createSession(compileDefinition(rules), input, head);

test('Turing uses the real pinned transition machine and bidirectional zipper tape', () => {
  const tape = new Tape(' ', ['0']);
  const machine = new TuringMachine((s, read) => s === 'q' ? {symbol: '1', move: MoveHead.left, state: 'halt'} : null, 'q', tape);
  assert.equal(machine.step(), true); assert.equal(machine.state, 'halt');
  assert.equal(tape.read(), ' '); assert.equal(tape.readOffset(1), '1');
  assert.equal(machine.step(), false); assert.equal(machine.isHalted, true);
});

test('Turing executes, halts, traces, undoes and resets a real machine without changing the initial input', () => {
  const session = state(increment);
  stepSession(session, 100);
  let view = snapshotSession(session);
  assert.equal(view.tapeText, '1111'); assert.equal(view.steps, 4); assert.equal(view.head, 2);
  assert.equal(view.state, 'done'); assert.equal(view.haltReason, 'terminal-state'); assert.equal(view.status, 'halted');
  assert.equal(view.trace.length, 4); assert.equal(view.lastRuleId, 'rule-1');
  assert.equal(view.window.find(cell => cell.index === 3).symbol, '1');
  assert.equal(undoSession(session), true);
  view = snapshotSession(session); assert.equal(view.tapeText, '111'); assert.equal(view.head, 3); assert.equal(view.steps, 3); assert.equal(view.state, 'scan'); assert.equal(view.halted, false);
  stepSession(session); assert.equal(snapshotSession(session).tapeText, '1111');
  const reset = resetSession(session); assert.equal(snapshotSession(reset).tapeText, '111'); assert.equal(reset.steps, 0); assert.equal(reset.head, 0);
});

test('Turing parses every pinned upstream example and confirms binary increment/busy beaver results', async () => {
  const examples = new URL('../upstream/turing/sources/turing-machine-viz/src/examples/', import.meta.url);
  for (const file of await readdir(examples)) {
    const document = await readFile(new URL(file, examples), 'utf8');
    const definition = compileDefinition(document);
    assert.ok(definition.states.length); assert.ok(definition.transitions.length);
    const session = createSession(definition);
    if (file === 'binaryIncrement.yaml') {stepSession(session, 100); assert.equal(snapshotSession(session).tapeText, '1100'); assert.equal(session.halted, true);}
    if (file === 'busyBeaver3.yaml') {stepSession(session, 1000); assert.equal(session.steps, 13); assert.equal(session.cells.size, 6); assert.equal(session.halted, true);}
    if (file === 'busyBeaver4.yaml') {stepSession(session, 1000); assert.equal(session.steps, 107); assert.equal(session.cells.size, 13); assert.equal(session.halted, true);}
  }
});

test('Turing Unicode symbols, named states, S stay and negative starting heads are reversible', () => {
  const source = `blank: '□'
start state: 扫描
input: '😀'
table:
  扫描:
    '😀': {write: '字', S: 完成}
    '□': {write: '月', R: 完成}
  完成:
`;
  const session = state(source); stepSession(session);
  assert.equal(snapshotSession(session).tapeText, '字'); assert.equal(session.head, 0); assert.equal(session.steps, 1);
  undoSession(session); assert.equal(snapshotSession(session).tapeText, '😀'); assert.equal(session.machine.state, '扫描');
  const left = state(source, '😀', -1); stepSession(left);
  assert.equal(snapshotSession(left).tapeText, '月😀'); assert.equal(snapshotSession(left).outputOrigin, -1); assert.equal(left.head, 0);
  undoSession(left); assert.equal(left.head, -1); assert.equal(snapshotSession(left).tapeText, '😀');
});

test('Turing grouped symbols and synonyms preserve upstream notation and reject overlap', () => {
  const source = `blank: ' '
input: '0,1'
start state: q
synonyms:
  next: R
table:
  q:
    [0, ',', 1]: next
    ' ': {S: halt}
  halt:
`;
  const definition = compileDefinition(source); assert.deepEqual(definition.transitions.slice(0, 3).map(rule => rule.read), ['0', ',', '1']);
  const session = createSession(definition); stepSession(session, 10); assert.equal(session.steps, 4); assert.equal(snapshotSession(session).tapeText, '0,1');
  assert.throws(() => compileDefinition(source.replace("[0, ',', 1]: next", "[0, ',', 1]: next\n    '0': L")), /重复转换/);
  assert.throws(() => compileDefinition(source.replace("[0, ',', 1]: next", "'0': L\n    '0': R")), /重复字段/);
});

test('Turing own-key state names cannot inherit transitions or poison prototypes', () => {
  const source = `blank: ' '
start state: __proto__
table:
  __proto__:
    ' ': {write: X, S: constructor}
  constructor:
`;
  const before = Object.getOwnPropertyNames(Object.prototype);
  const definition = compileDefinition(source); assert.equal(Object.getPrototypeOf(definition.table), null);
  const session = createSession(definition); stepSession(session); assert.equal(session.machine.state, 'constructor'); assert.equal(snapshotSession(session).tapeText, 'X');
  assert.deepEqual(Object.getOwnPropertyNames(Object.prototype), before);
  assert.throws(() => compileDefinition(endless.replace('R', '{R: constructor}')), /未声明/);
  assert.throws(() => compileDefinition(endless.replace('start state: loop', 'start state: constructor')), /初始状态未/);
  assert.throws(() => compileDefinition(endless.replace('R', 'constructor')), /无法识别/);
});

test('Turing invalid syntax, tags, aliases and transitions are rejected before execution', () => {
  const sources = [
    '', '[]', 'blank: x', endless.replace("blank: ' '", 'blank: xx'),
    endless.replace("' ': R", "' ': {write: xx, R}"), endless.replace("' ': R", "' ': {R, L}"),
    endless.replace("' ': R", "' ': {write: X}"), endless.replace("' ': R", "' ': {R: missing}"),
    endless.replace("' ': R", "' ': {run: something}"), endless.replace("' ': R", "' ': null"),
    endless.replace("' ': R", "' ': {R: [loop]}"), endless.replace("' ': R", "' ': {R: {name: loop}}"),
    endless.replace("' ': R", "' ': !<tag:yaml.org,2002:js/function> 'function(){return 1}'"),
    'blank: " "\nstart state: q\ntable: &a {q: *a}',
    'blank: " "\nstart state: q\ntable: {q: [], h: {}}',
    'blank: " "\nstart state: q\ntable: {q: {ab: R}}',
    'blank: " "\nstart state: q\ntable: {q: {" ": R}}\ninput: [1, 2]',
  ];
  for (const source of sources) assert.throws(() => compileDefinition(source));
  assert.throws(() => compileDefinition('['.repeat(100) + ']'.repeat(100)), /层级|YAML/);
  assert.throws(() => compileDefinition(endless + '\n#' + 'x'.repeat(TURING_LIMITS.bytes)), /64 KB/);
  assert.throws(() => createSession(compileDefinition(endless), '\ud800'), /有效 Unicode/);
});

test('Turing absent transitions halt normally without consuming a step', () => {
  const session = state(endless, 'X');
  assert.equal(session.halted, true); assert.equal(session.haltReason, 'missing-transition');
  stepSession(session, 10); assert.equal(session.steps, 0); assert.equal(session.head, 0); assert.equal(snapshotSession(session).tapeText, 'X'); assert.equal(undoSession(session), false);
});

test('Turing step limit is atomic and bounded histories remain reversible', () => {
  const session = state(endless.replace("' ': R", "' ': S"));
  for (let i = 0; i < TURING_LIMITS.steps / TURING_LIMITS.batch; i++) stepSession(session, TURING_LIMITS.batch);
  assert.equal(session.steps, TURING_LIMITS.steps); assert.equal(session.history.length, 256); assert.equal(session.trace.length, 32);
  stepSession(session); assert.equal(session.limit, 'step-limit'); assert.equal(session.steps, TURING_LIMITS.steps); assert.equal(session.status, 'limit');
  undoSession(session); assert.equal(session.steps, TURING_LIMITS.steps - 1); assert.equal(session.limit, null); assert.equal(session.status, 'ready');
  assert.throws(() => stepSession(session, 0)); assert.throws(() => stepSession(session, 1001)); assert.throws(() => stepSession(session, 1.5));
  assert.equal(resetSession(session).steps, 0);
});

test('Turing tape limit is atomic and does not leave a hidden write after failure', () => {
  const session = state(endless.replace("' ': R", "' ': {write: X, R}"), '', 65535);
  const before = snapshotSession(session); stepSession(session);
  const after = snapshotSession(session); assert.equal(after.limit, 'tape-limit'); assert.equal(after.steps, 0); assert.equal(after.head, before.head); assert.equal(after.tapeText, '');
  assert.throws(() => state(endless, '', 65536), /跨度/); assert.throws(() => state(endless, '', -65536), /跨度/);
  assert.throws(() => state(endless, 'x'.repeat(8193)), /8,192/); assert.throws(() => state(endless, '', 1.1));
});

test('Turing output preserves internal blanks and reports its actual coordinate origin', () => {
  const session = state(endless, '  A 😀  ');
  const view = snapshotSession(session, {includeTape: true, radius: 1});
  assert.equal(view.tapeText, 'A 😀'); assert.equal(view.outputOrigin, 2); assert.equal(view.nonblankCells, 2); assert.equal(view.window.length, 3);
  assert.deepEqual(view.tape, [{index: 2, symbol: 'A'}, {index: 4, symbol: '😀'}]);
  assert.throws(() => snapshotSession(session, {radius: 101}));
});

test('Turing imported sources and generated runtime match all recorded hashes', async () => {
  const manifest = JSON.parse(await readFile(new URL('../public/vendor/turing/UPSTREAM.json', import.meta.url), 'utf8'));
  assert.equal(manifest.pins['turing-machine-viz'], 'b4dab9e4a649051ada94cb352c48ec177da5952e'); assert.equal(manifest.packages['js-yaml'].version, '4.3.2');
  for (const record of manifest.files) assert.equal(createHash('sha256').update(await readFile(new URL('../' + record.path, import.meta.url))).digest('hex'), record.sha256, record.path);
  const dist = await readFile(new URL('../public/vendor/turing/js-yaml.mjs', import.meta.url));
  assert.deepEqual(dist, await readFile(new URL('../upstream/turing/sources/js-yaml/dist/js-yaml.mjs', import.meta.url)));
  const outer = load(await readFile(new URL('../upstream/turing/sources/turing-machine-viz/src/examples/binaryIncrement.yaml', import.meta.url), 'utf8'), {schema: JSON_SCHEMA});
  assert.equal(compileDefinition(outer['source code']).input, '1011');
});
