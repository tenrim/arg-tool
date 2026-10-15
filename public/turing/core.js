// The pinned upstream parser, zipper tape and machine own YAML/step semantics.
// This adapter owns safe bounds, reversible sessions and serializable views.
import {parseSpec, TMSpecError, YAMLException} from '../vendor/turing/parser.js';
import {TuringMachine, MoveHead} from '../vendor/turing/machine.js';
import Tape from '../vendor/turing/tape.js';

export const TURING_LIMITS = Object.freeze({bytes: 64 * 1024, input: 8192, states: 128, transitions: 4096, steps: 100000, span: 65536, head: 65536, history: 256, trace: 32, batch: 1000, outputBytes: 256 * 1024});
const directions = Object.freeze({L: MoveHead.left, R: MoveHead.right, S: MoveHead.stay});
const scalar = value => typeof value === 'string' && Array.from(value).length === 1 && !/[\uD800-\uDFFF]/u.test(value);
const moveDelta = value => value === 'L' ? -1 : value === 'R' ? 1 : 0;
const isMapping = value => value && typeof value === 'object' && !Array.isArray(value);
function symbolGroup(key) {
  // This is StateGraph's upstream comma notation: [0,1] becomes '0,1';
  // two adjacent empty fragments represent a literal comma symbol.
  if (key === ',') return [','];
  return key.split(',').reduce((out, value) => {
    if (value === '' && out[out.length - 1] === '') out[out.length - 1] = ',';
    else out.push(value);
    return out;
  }, []);
}
const specReasons = new Map([
  ['The document is empty', '机器定义不能为空。'],
  ['No blank symbol was specified', '请设置 blank 空白符。'],
  ['The blank symbol must be a string of length 1', '空白符必须是一个 Unicode 字符。'],
  ['No start state was specified', '请设置 start state 初始状态。'],
  ['The start state has to be declared in the transition table', '初始状态未在 table 中声明。'],
  ['Missing transition table', '请设置 table 状态转换表。'],
  ['Transition table has an invalid type', 'table 必须是状态映射。'],
  ['Synonyms table has an invalid type', 'synonyms 必须是指令简称映射。'],
  ['State entry has an invalid type', '状态内容必须是符号到指令的映射，停机状态可留空。'],
  ['Undeclared state', '指令指向未声明的状态。'],
  ['Invalid instruction type', '指令必须是 L、R、S、简称或指令映射。'],
  ['Unrecognized string', '无法识别这条指令或简称。'],
  ['Missing instruction', '转换规则缺少指令。'],
  ['Unrecognized key', '指令仅支持 write、L、R、S。'],
  ['Conflicting tape movements', '每条指令只能设置一个移动方向。'],
  ['Missing movement direction', '指令缺少 L、R 或 S 移动方向。'],
  ['Write requires a string of length 1', 'write 必须写入一个 Unicode 字符。'],
]);
function parseError(error) {
  if (error instanceof TMSpecError) {
    const details = error.details;
    const where = details.state == null ? '' : ` 状态：${details.state}${details.symbol == null ? '' : '；符号：' + details.symbol}。`;
    return Error((specReasons.get(error.reason) || '机器转换规则无效。') + where + (details.problemValue == null ? '' : ' 内容：' + String(details.problemValue).slice(0, 100)));
  }
  if (error instanceof YAMLException) {
    const reason = String(error.reason || '');
    const explanation = /duplicated mapping key/.test(reason) ? '同一映射内有重复字段。' : /unknown tag|cannot resolve a node/.test(reason) ? '不支持此 YAML 标签，请使用普通文字、数字或映射。' : /indentation/.test(reason) ? '缩进层级无效。' : '请检查缩进、引号、字段与标点。';
    return Error(`YAML 格式错误${error.mark ? `（第 ${error.mark.line + 1} 行，第 ${error.mark.column + 1} 列）` : ''}：${explanation}`);
  }
  return Error(error.message || '机器定义无法解析。');
}

export function compileDefinition(text) {
  if (typeof text !== 'string' || !text.trim()) throw Error('请填写图灵机规则。');
  if (new TextEncoder().encode(text).length > TURING_LIMITS.bytes) throw Error('规则文件最多 64 KB。');
  let parsed;
  try {parsed = parseSpec(text);} catch (error) {throw parseError(error);}
  if (!scalar(parsed.blank)) throw Error('空白符必须是一个有效 Unicode 字符。');
  const states = Object.keys(parsed.table);
  if (!states.length || states.length > TURING_LIMITS.states) throw Error('图灵机需要 1–128 个状态。');
  for (const name of states) if (!name.length || name.length > 128 || /[\u0000-\u001f\u007f]/.test(name)) throw Error('状态名需要 1–128 个字符，不能包含控制字符。');
  if (!Object.hasOwn(parsed.table, parsed.startState)) throw Error('初始状态未声明。');
  const table = Object.create(null), transitions = [];
  for (const from of states) {
    const instructions = parsed.table[from];
    if (instructions != null && !isMapping(instructions)) throw Error('状态转换规则必须是映射。');
    const row = Object.create(null);
    for (const [key, instruction] of Object.entries(instructions || {})) {
      const symbols = symbolGroup(key);
      for (const read of symbols) {
        if (!scalar(read)) throw Error(`状态 ${from} 的读取符号必须是单个 Unicode 字符。`);
        if (Object.hasOwn(row, read)) throw Error(`状态 ${from} 的符号 ${read === ' ' ? '空格' : read} 有重复转换规则。`);
        const write = instruction.symbol ?? read, move = String(instruction.move), to = String(instruction.state ?? from);
        if (!scalar(write) || !Object.hasOwn(directions, move)) throw Error('转换指令的写入符号或移动方向无效。');
        if (!Object.hasOwn(parsed.table, to)) throw Error(`目标状态 ${to} 未声明。`);
        if (transitions.length >= TURING_LIMITS.transitions) throw Error('展开后的转换规则最多 4,096 条。');
        const rule = Object.freeze({id: 'rule-' + transitions.length, from, read, write, move, to});
        transitions.push(rule); row[read] = rule;
      }
    }
    table[from] = Object.freeze(row);
  }
  if (parsed.input != null && (typeof parsed.input === 'object' || typeof parsed.input === 'boolean')) throw Error('input 纸带输入必须是文字。');
  const input = parsed.input == null ? '' : String(parsed.input);
  validateInput(input);
  return Object.freeze({blank: parsed.blank, input, startState: parsed.startState, states: Object.freeze(states), transitions: Object.freeze(transitions), table: Object.freeze(table)});
}

function validateInput(input) {
  if (typeof input !== 'string') throw Error('纸带输入必须是文字。');
  const symbols = Array.from(input);
  if (symbols.length > TURING_LIMITS.input || symbols.some(symbol => !scalar(symbol))) throw Error('初始纸带最多 8,192 个有效 Unicode 字符。');
  return symbols;
}
function instructionFor(definition, state, symbol) {
  return Object.hasOwn(definition.table, state) && Object.hasOwn(definition.table[state], symbol) ? definition.table[state][symbol] : null;
}
function refreshHalt(session) {
  const next = instructionFor(session.definition, session.machine.state, session.tape.read());
  session.halted = next === null;
  session.haltReason = next ? null : Object.keys(session.definition.table[session.machine.state]).length ? 'missing-transition' : 'terminal-state';
  if (!session.limit) session.status = session.halted ? 'halted' : 'ready';
}
export function createSession(definition, input = definition.input, head = 0) {
  if (!Number.isSafeInteger(head) || Math.abs(head) > TURING_LIMITS.head) throw Error('初始读写头必须是 −65,536 到 65,536 的整数。');
  const symbols = validateInput(input);
  // Include the original input and selected head in the bounded allocated span.
  const low = Math.min(0, head), high = Math.max(symbols.length - 1, head, 0);
  if (high - low + 1 > TURING_LIMITS.span) throw Error('初始纸带与读写头的跨度最多 65,536 格。');
  const tape = new Tape(definition.blank, symbols);
  for (let n = 0; n < Math.abs(head); n++) head < 0 ? tape.headLeft() : tape.headRight();
  const cells = new Map();
  symbols.forEach((symbol, index) => {if (symbol !== definition.blank) cells.set(index, symbol);});
  const transition = (state, symbol) => {
    const rule = instructionFor(definition, state, symbol);
    return rule ? {symbol: rule.write, state: rule.to, move: directions[rule.move]} : null;
  };
  const machine = new TuringMachine(transition, definition.startState, tape);
  const session = {definition, machine, tape, cells, head, low, high, steps: 0, history: [], trace: [], limit: null, status: 'ready', lastRuleId: null, initial: {input, head}};
  refreshHalt(session);
  return session;
}
export function stepSession(session, count = 1) {
  if (!Number.isSafeInteger(count) || count < 1 || count > TURING_LIMITS.batch) throw Error('每批执行步数必须是 1–1,000 的整数。');
  for (let index = 0; index < count && !session.halted && !session.limit; index++) {
    const rule = instructionFor(session.definition, session.machine.state, session.tape.read());
    const nextHead = session.head + moveDelta(rule.move), low = Math.min(session.low, nextHead), high = Math.max(session.high, nextHead);
    let limit = null;
    if (session.steps >= TURING_LIMITS.steps) limit = 'step-limit';
    else if (Math.abs(nextHead) > TURING_LIMITS.head || high - low + 1 > TURING_LIMITS.span) limit = 'tape-limit';
    // The forbidden step never writes or moves: back and reset remain accurate.
    if (limit) {session.limit = limit; session.status = 'limit'; break;}
    const history = {state: session.machine.state, symbol: session.tape.read(), head: session.head, low: session.low, high: session.high, lastRuleId: session.lastRuleId};
    if (!session.machine.step()) {refreshHalt(session); break;}
    session.history.push(history);
    if (session.history.length > TURING_LIMITS.history) session.history.shift();
    if (rule.write === session.definition.blank) session.cells.delete(session.head);
    else session.cells.set(session.head, rule.write);
    session.trace.push({step: ++session.steps, id: rule.id, from: rule.from, to: rule.to, head: session.head, read: rule.read, write: rule.write, move: rule.move});
    if (session.trace.length > TURING_LIMITS.trace) session.trace.shift();
    session.head = nextHead; session.low = low; session.high = high; session.lastRuleId = rule.id;
    refreshHalt(session);
  }
  return session;
}
export function undoSession(session) {
  const previous = session.history.pop();
  if (!previous) return false;
  if (session.head < previous.head) session.tape.headRight();
  else if (session.head > previous.head) session.tape.headLeft();
  session.tape.write(previous.symbol);
  if (previous.symbol === session.definition.blank) session.cells.delete(previous.head);
  else session.cells.set(previous.head, previous.symbol);
  session.machine.state = previous.state; session.head = previous.head; session.low = previous.low; session.high = previous.high;
  session.steps--; session.lastRuleId = previous.lastRuleId; session.limit = null;
  session.trace = session.trace.filter(entry => entry.step <= session.steps);
  refreshHalt(session);
  return true;
}
export function resetSession(session) {return createSession(session.definition, session.initial.input, session.initial.head);}
export function snapshotSession(session, options = {}) {
  const radius = options.radius ?? 7;
  if (!Number.isSafeInteger(radius) || radius < 0 || radius > 100) throw Error('纸带显示半径必须是 0–100 的整数。');
  const next = instructionFor(session.definition, session.machine.state, session.tape.read());
  const window = Array.from({length: 2 * radius + 1}, (_, offset) => ({index: session.head + offset - radius, symbol: session.tape.readOffset(offset - radius)}));
  let outputOrigin = 0, tapeText = '';
  if (session.cells.size) {
    let max = -Infinity; outputOrigin = Infinity;
    for (const index of session.cells.keys()) {outputOrigin = Math.min(outputOrigin, index); max = Math.max(max, index);}
    const output = [];
    let bytes = 0;
    for (let index = outputOrigin; index <= max; index++) {
      const symbol = session.cells.get(index) ?? session.definition.blank;
      const code = symbol.codePointAt(0);
      bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
      if (bytes > TURING_LIMITS.outputBytes) throw Error('输出超过 256 KB，请缩小纸带内容后导出。');
      output.push(symbol);
    }
    tapeText = output.join('');
  }
  const result = {state: session.machine.state, head: session.head, steps: session.steps, halted: session.halted, status: session.status, haltReason: session.haltReason, limit: session.limit, symbol: session.tape.read(), next, lastRuleId: session.lastRuleId, window, trace: session.trace.map(entry => ({...entry})), canUndo: !!session.history.length, tapeText, outputOrigin, tapeLength: session.high - session.low + 1, nonblankCells: session.cells.size};
  if (options.includeTape) result.tape = [...session.cells].sort(([a], [b]) => a - b).map(([index, symbol]) => ({index, symbol}));
  return result;
}
