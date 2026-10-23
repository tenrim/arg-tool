import {SudokuSolver} from '../vendor/expansion/cipher-constraints/solver.js';
import {SolverParser} from '../vendor/expansion/cipher-constraints/solver-parser.js';
import {Trie} from '../vendor/expansion/cipher-constraints/trie.js';
import {SubstitutionSolver} from '../vendor/expansion/cipher-constraints/substitution.js';
import {configureDictionary} from '../vendor/expansion/cipher-constraints/dictionary-context.js';
export {CONSTRAINT_PRESETS, CONSTRAINT_RULE_REFERENCE} from './hunt-constraints-catalog.js';

const MAX_CELLS = 1600, MAX_RULES = 10000, MAX_RULE_TEXT = 128 * 1024;
const cloneValue = value => value === undefined ? null : structuredClone(value);
const keyOf = value => typeof value === 'object' ? JSON.stringify(value) : `${typeof value}:${value}`;
const equal = (a, b) => keyOf(a) === keyOf(b);
const integer = (value, min, max, label) => {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) throw Error(`${label}必须是 ${min}–${max} 的整数。`);
  return number;
};

function compilePuzzle(payload) {
  if (!payload || typeof payload !== 'object') throw Error('请提供题面参数。');
  const rows = integer(payload.rows, 1, 40, '行数'), columns = integer(payload.columns, 1, 40, '列数');
  if (rows * columns > MAX_CELLS) throw Error(`题面最多 ${MAX_CELLS} 格。`);
  if (typeof payload.rules !== 'string' || payload.rules.length > MAX_RULE_TEXT) throw Error('中文规则须为不超过 128 KB 的文字。');
  const rules = payload.rules.split(/\r?\n/u).map(line => line.trim()).filter(Boolean);
  if (!rules.length || rules.length > MAX_RULES) throw Error('请填写 1–10,000 行中文规则。');
  for (let lineNumber = 0; lineNumber < rules.length; lineNumber++) {
    const line = rules[lineNumber];
    let balance = 0;
    for (const char of line) { if (char === '[') balance++; if (char === ']' && --balance < 0) break; }
    if (balance !== 0) throw Error(`第 ${lineNumber + 1} 行的方括号未配对。`);
    for (const match of line.matchAll(/从(-?\d+)到(-?\d+)/gu)) {
      if (!Number.isSafeInteger(Number(match[1])) || !Number.isSafeInteger(Number(match[2])) || Number(match[2]) < Number(match[1]) || Number(match[2]) - Number(match[1]) > 4095) throw Error(`第 ${lineNumber + 1} 行取值范围须递增且最多 4,096 个值。`);
    }
  }
  const globalRules = [], globalFinalRules = [];
  let parser;
  try { parser = new SolverParser(rules, rows, columns, globalRules, globalFinalRules); }
  catch (error) { throw Error(`中文规则解析失败：${error.message}`); }
  const inspect = list => {
    for (const entry of list) {
      if (!entry || !Array.isArray(entry.restrictAreas) || entry.restrictAreas.some(area => !Number.isInteger(area) || area < 0 || area >= rows * columns)) throw Error('规则引用了题面之外的格子、行或列。');
      const rule = entry.rules;
      if (!rule || typeof rule !== 'object') throw Error('存在未识别的中文规则。');
      if (rule.set && (!rule.set.length || rule.set.length > 4096)) throw Error('格子取值集合不能为空或超过 4,096 项。');
      if (rule.linear && (rule.linear.coefficient.length !== entry.restrictAreas.length || !Number.isFinite(rule.linear.result))) throw Error('线性规则的系数数量必须与区域格数一致。');
      if (rule.bars && (rule.bars.list.some(value => !Number.isInteger(value) || value < 0) || rule.bars.list.filter(Boolean).reduce((a, b) => a + b, 0) + Math.max(0, rule.bars.list.filter(Boolean).length - 1) > entry.restrictAreas.length)) throw Error('连续黑格长度超出所选行列。');
      if (rule.ifCondition) inspect(rule.ifCondition.statement);
    }
  };
  inspect([...globalRules, ...globalFinalRules]);
  const usesWords = rules.some(line => line.includes('按顺序组成单词'));
  return {rows, columns, rules, globalRules, globalFinalRules, parser, ruleCount: rules.length, usesWords};
}

export function validateConstraintPuzzle(payload) {
  const result = compilePuzzle(payload);
  return {rows: result.rows, columns: result.columns, rules: result.rules.join('\n'), ruleCount: result.ruleCount, parsedRuleCount: result.globalRules.length + result.globalFinalRules.length, usesWords: result.usesWords};
}

function wordList(words) {
  if (typeof words === 'string') return words.split(/\s+/u);
  if (Array.isArray(words)) return words;
  if (words && typeof words === 'object') return Object.values(words).flat();
  return [];
}

function makeTrie(words, lengths) {
  const trie = new Trie();
  let used = 0;
  for (const raw of wordList(words)) {
    if (typeof raw !== 'string') continue;
    const word = raw.toLowerCase();
    if (lengths.has(word.length) && /^[a-z]+$/.test(word)) { trie.insert(word); used++; }
  }
  if (!used) throw Error('此规则需要本地英文词库，当前未提供相应长度的词条。');
  return {trie, used};
}

function countsOf(values) {
  const counts = new Map();
  for (const value of values) { const key = keyOf(value); counts.set(key, (counts.get(key) || 0) + 1); }
  return counts;
}

function evaluateRule(cells, areas, rule, trie) {
  const values = (rule.hashi ? areas.slice(0, 1) : areas).map(area => cells[area]);
  if (values.some(value => value === undefined || value === null)) return -1;
  if (rule.ifCondition) {
    const condition = evaluateRule(cells, areas, rule.ifCondition.condition, trie);
    return condition !== 1 ? condition === 0 ? 1 : -1 : rule.ifCondition.statement.every(entry => evaluateRule(cells, entry.restrictAreas, entry.rules, trie) === 1) ? 1 : 0;
  }
  if (rule.set && values.some(value => !rule.set.some(allowed => equal(value, allowed)))) return 0;
  if (rule.isDifferent && new Set(values.map(keyOf)).size !== values.length) return 0;
  if (rule.largerThan !== undefined && values.some(value => typeof value !== 'number' || value <= rule.largerThan)) return 0;
  if (rule.smallerThan !== undefined && values.some(value => typeof value !== 'number' || value >= rule.smallerThan)) return 0;
  if (rule.sum !== undefined && (values.some(value => typeof value !== 'number') || values.reduce((a, b) => a + b, 0) !== rule.sum)) return 0;
  if (rule.linear && values.reduce((sum, value, i) => sum + value * rule.linear.coefficient[i], 0) !== rule.linear.result) return 0;
  if (rule.count) {
    const count = values.filter(value => value === rule.count.item).length;
    if (evaluateRule([count], [0], rule.count, trie) !== 1) return 0;
  }
  if (rule.isWord && !trie?.contains(values.join(''))) return 0;
  if (rule.bars) {
    const segments = [];
    let length = 0;
    for (const value of [...values, null]) { if (value === rule.bars.item) length++; else if (length) { segments.push(length); length = 0; } }
    if (!equal(segments, rule.bars.list.filter(Boolean))) return 0;
  }
  if (rule.permutation) {
    const actual = countsOf(values.filter(value => value !== 'black')), expected = countsOf(rule.permutation.list);
    if (actual.size !== expected.size || [...actual].some(([key, count]) => expected.get(key) !== count)) return 0;
  }
  return 1;
}

function validLoops(cells, rules, columns) {
  const seenSets = new Set();
  const directions = {U: -columns, B: columns, L: -1, R: 1}, opposite = {U: 'B', B: 'U', L: 'R', R: 'L'};
  for (const entry of rules) {
    const rule = entry.rules?.loop;
    if (!rule?.areasSet || seenSets.has(rule.areasSet)) continue;
    seenSets.add(rule.areasSet);
    const areas = rule.areasSet, unseen = new Set(areas);
    for (const area of areas) {
      const value = cells[area];
      if (typeof value !== 'string' || value.length !== 2 || new Set(value).size !== 2) return false;
      for (const direction of value) {
        const next = area + directions[direction];
        if (!areas.has(next) || !cells[next]?.includes(opposite[direction]) || (direction === 'L' || direction === 'R') && Math.floor(area / columns) !== Math.floor(next / columns)) return false;
      }
    }
    let components = 0;
    while (unseen.size) {
      components++;
      const stack = [unseen.values().next().value];
      while (stack.length) { const area = stack.pop(); if (!unseen.delete(area)) continue; for (const direction of cells[area]) stack.push(area + directions[direction]); }
    }
    if (components !== rule.number) return false;
  }
  return true;
}

function validBridges(cells, parser, columns) {
  const islands = [...parser.hashi];
  if (!islands.length) return true;
  const opposite = {u: 'd', d: 'u', l: 'r', r: 'l'}, edges = [];
  for (const area of islands) {
    const cell = cells[area];
    if (!cell?.hashi || !cell.to) return false;
    for (const direction of ['u', 'd', 'l', 'r']) {
      const count = cell.hashi[direction], next = cell.to[direction];
      if (count && (next === null || next === undefined || cells[next]?.hashi?.[opposite[direction]] !== count)) return false;
      if (count && (direction === 'r' || direction === 'd')) edges.push({area, next, direction});
    }
  }
  if (parser.noMeet) for (const horizontal of edges.filter(edge => edge.direction === 'r')) for (const vertical of edges.filter(edge => edge.direction === 'd')) {
    const row = Math.floor(horizontal.area / columns), col = vertical.area % columns;
    if (col > horizontal.area % columns && col < horizontal.next % columns && row > Math.floor(vertical.area / columns) && row < Math.floor(vertical.next / columns)) return false;
  }
  // Hashi puzzles require one connected island network, not disconnected local degrees.
  const reached = new Set(), stack = [islands[0]];
  while (stack.length) { const area = stack.pop(); if (reached.has(area)) continue; reached.add(area); for (const direction of ['u', 'd', 'l', 'r']) if (cells[area].hashi[direction]) stack.push(cells[area].to[direction]); }
  return reached.size === islands.length;
}

export async function solveConstraints(payload, {words, onProgress, checkCancelled, signal} = {}) {
  const puzzle = compilePuzzle(payload), maxSolutions = integer(payload.maxSolutions ?? 2, 2, 100, '最多展示解数');
  const timeoutMs = integer(payload.timeoutMs ?? 30000, 1, 30000, '超时毫秒数'), start = Date.now();
  const check = () => { if (signal?.aborted) throw new DOMException('求解已取消。', 'AbortError'); checkCancelled?.(); if (Date.now() - start > timeoutMs) throw Error('求解超时；尚未证明无解或唯一解。'); };
  check();
  const solver = new SudokuSolver();
  const lengths = new Set(puzzle.globalRules.filter(entry => entry.rules.isWord).map(entry => entry.restrictAreas.length));
  for (const entry of puzzle.globalRules) if (entry.rules.ifCondition) for (const statement of entry.rules.ifCondition.statement) if (statement.rules.isWord) lengths.add(statement.restrictAreas.length);
  const dictionary = puzzle.usesWords ? makeTrie(words, lengths) : {trie: new Trie(), used: 0};
  solver.trie = dictionary.trie;
  solver.checkCancelled = check;
  const solutions = [], signatures = new Set();
  let common;
  solver.evaluateRule = (areas, rule) => evaluateRule(solver.possibleArray.map(set => set?.size === 1 ? [...set][0] : null), areas, rule, solver.trie);
  solver.isValidSolution = () => {
    const cells = solver.possibleArray.map(set => set?.size === 1 ? [...set][0] : null);
    // The upstream DSL's “强制是” explicitly overrides ordinary domain sets.
    // Domains have already been applied by the engine; other constraints still apply.
    return [...solver.globalRules, ...solver.globalFinalRules].every(entry => evaluateRule(cells, entry.restrictAreas, entry.rules.set && !entry.rules.force && !entry.rules.hashi ? {...entry.rules, set: undefined} : entry.rules, solver.trie) === 1) && validLoops(cells, solver.globalRules, puzzle.columns) && validBridges(cells, solver.parser, puzzle.columns);
  };
  solver.onSolution = cells => {
    check();
    const signature = JSON.stringify(cells);
    if (signatures.has(signature)) return;
    signatures.add(signature);
    const snapshot = cloneValue(cells);
    solutions.push({cells: snapshot, rows: puzzle.rows, columns: puzzle.columns});
    if (!common) common = cloneValue(snapshot);
    else common = common.map((value, i) => equal(value, snapshot[i]) ? value : null);
    onProgress?.({solutionCount: solutions.length, first: solutions[0], common: cloneValue(common), complete: false});
  };
  solver.shouldContinue = () => solutions.length < maxSolutions;
  await solver.solve(puzzle.rules, puzzle.rows, puzzle.columns, async () => { check(); });
  check();
  const complete = solver.searchComplete === true;
  const status = solutions.length > 1 ? 'multiple' : complete ? solutions.length === 1 ? 'unique' : 'none' : 'partial';
  const warnings = complete ? [] : ['达到展示解数上限，尚未枚举所有解；共同部分仅针对已找到的候选，不能当作全局确定答案。'];
  return {rows: puzzle.rows, columns: puzzle.columns, solutions, first: solutions[0] ?? null, common: common ?? Array(puzzle.rows * puzzle.columns).fill(null), solutionCount: solutions.length, complete, status, dictionaryEntries: dictionary.used, warnings};
}

const wordPattern = word => { const seen = new Map(); return [...word].map(char => { if (!seen.has(char)) seen.set(char, String.fromCharCode(97 + seen.size)); return seen.get(char); }).join(''); };
function lockMap(locked) {
  if (!locked || typeof locked !== 'object' || Array.isArray(locked)) throw Error('锁定映射须为密文字母到明文字母的对象。');
  const result = Object.create(null);
  for (const [cipher, plain] of Object.entries(locked)) {
    if (!/^[a-z]$/i.test(cipher) || typeof plain !== 'string' || !/^[a-z]$/i.test(plain)) throw Error('锁定映射每一项必须是一对英文字母。');
    const key = cipher.toLowerCase(), value = plain.toLowerCase();
    if (result[key] && result[key] !== value) throw Error('同一密文字母存在冲突的锁定映射。');
    result[key] = value;
  }
  if (new Set(Object.values(result)).size !== Object.keys(result).length) throw Error('锁定映射必须一一对应，不能重复使用同一明文字母。');
  return result;
}

export async function solveDictionarySubstitution(payload, {words, onProgress, checkCancelled, signal} = {}) {
  if (!payload || typeof payload.text !== 'string' || !/[a-z]/i.test(payload.text) || payload.text.length > 10000) throw Error('请输入最多 10,000 个字符、含英文单词和空格的密文。');
  const text = payload.text.replace(/[’‘]/gu, "'"), tokens = text.toLowerCase().match(/[a-z]+(?:'[a-z]+)*/gu) || [];
  if (tokens.some(token => token.length > 64)) throw Error('单个词最多 64 个字母／撇号。');
  const locked = lockMap(payload.locked ?? {}), patterns = new Set(tokens.map(wordPattern)), index = Object.create(null);
  let dictionaryEntries = 0;
  for (const raw of wordList(words)) {
    if (typeof raw !== 'string') continue;
    const word = raw.toLowerCase().replace(/[’‘]/gu, "'");
    if (!/^[a-z]+(?:'[a-z]+)*$/.test(word)) continue;
    const pattern = wordPattern(word);
    if (!patterns.has(pattern)) continue;
    (index[pattern] ??= []).push(word); dictionaryEntries++;
  }
  if (!dictionaryEntries) throw Error('当前未提供对应词形的本地英文词库，不能用空词库宣称密文无解。');
  for (const pattern of Object.keys(index)) index[pattern] = [...new Set(index[pattern])];
  const maxSolutions = integer(payload.maxSolutions ?? 20, 1, 100, '最多展示候选数'), timeoutMs = integer(payload.timeoutMs ?? 30000, 1, 30000, '超时毫秒数'), start = Date.now();
  const check = () => { if (signal?.aborted) throw new DOMException('替换求解已取消。', 'AbortError'); checkCancelled?.(); if (Date.now() - start > timeoutMs) throw Error('替换求解超时，尚未完成候选搜索。'); };
  check(); configureDictionary(index, locked);
  const solver = new SubstitutionSolver();
  solver.checkCancelled = check;
  const candidates = solver.substituteSolver(tokens.join(' '), maxSolutions, integer(payload.threshold ?? 10, 1, 1000, '每批搜索宽度'));
  const results = [], seen = new Set();
  let rejected = 0;
  for (const candidate of candidates) {
    const candidateTokens = candidate.trim().split(/\s+/u), mapping = Object.create(null), reverse = new Map();
    let valid = candidateTokens.length === tokens.length;
    for (let i = 0; valid && i < tokens.length; i++) {
      if (candidateTokens[i].length !== tokens[i].length) { valid = false; break; }
      for (let j = 0; j < tokens[i].length; j++) {
        const cipher = tokens[i][j], plain = candidateTokens[i][j];
        if (cipher === "'") { if (plain !== cipher) valid = false; continue; }
        if (mapping[cipher] && mapping[cipher] !== plain || reverse.has(plain) && reverse.get(plain) !== cipher || locked[cipher] && locked[cipher] !== plain) { valid = false; break; }
        mapping[cipher] = plain; reverse.set(plain, cipher);
      }
    }
    if (!valid) { rejected++; continue; }
    const plaintext = text.replace(/[a-z]/gi, char => char === char.toUpperCase() ? mapping[char.toLowerCase()]?.toUpperCase() ?? char : mapping[char] ?? char);
    if (seen.has(plaintext)) continue;
    seen.add(plaintext); results.push({text: plaintext, mapping: {...mapping}, locked: {...locked}});
  }
  const complete = solver.searchComplete === true && rejected === 0;
  onProgress?.({candidateCount: results.length, complete});
  return {candidates: results, candidateCount: results.length, complete, dictionaryEntries, rejectedCandidates: rejected, status: results.length ? 'candidates' : 'no-candidate', warnings: ['此处是词库约束下的候选，字典之外的词、人名及非英文原文不会自动出现。', ...(complete ? [] : ['搜索未穷尽或有候选被一致性校验拒绝，零候选不能作为密文无解的证明。'])]};
}
