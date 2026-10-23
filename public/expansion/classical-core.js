// Original implementations of classical, educational ciphers. No network or DOM.
// Mechanism references: American Cryptogram Association cipher specifications;
// ADFGX/ADFGVX interoperability vector: pycipher's author-maintained manual.
import {CLASSICAL_CIPHERS} from './classical-catalog.js';

export {CLASSICAL_CIPHERS};
export const CLASSICAL_INPUT_LIMIT = 1024 * 1024;
const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LATIN25 = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
const upper = text => text.replace(/[a-z]/g, c => c.toUpperCase());
const mod = (number, divisor) => ((number % divisor) + divisor) % divisor;

function inputText(input) {
  if (typeof input !== 'string') throw new TypeError('输入必须是文字。');
  if (input.length > CLASSICAL_INPUT_LIMIT) throw new RangeError('输入超过 1,048,576 个 UTF-16 码元，请分批处理。');
  return input;
}

function directionOf(options) {
  const value = options.direction ?? 'encrypt';
  if (value !== 'encrypt' && value !== 'decrypt') throw new Error('请选择明确的加密或解密方向。');
  return value;
}

function alphabetOf(options, fallback, size) {
  const value = options.alphabet ?? fallback;
  if (typeof value !== 'string') throw new Error('字母表必须是文字。');
  const symbols = [...upper(value)];
  if (size ? symbols.length !== size : symbols.length < 2 || symbols.length > 256) throw new Error(size ? `字母表必须恰好有 ${size} 个字符。` : '字母表须包含 2–256 个不同字符。');
  if (symbols.some(c => /\s/u.test(c))) throw new Error('字母表中不能包含空白字符。');
  if (new Set(symbols).size !== symbols.length) throw new Error('字母表中不能出现重复字符（英文字母不区分大小写）。');
  return symbols;
}

function scan(input, alphabet, options = {}, {mergeJ = false, preserveAllowed = false} = {}) {
  const unknown = options.unknown ?? 'reject';
  if (!['reject', 'remove', 'preserve'].includes(unknown)) throw new Error('未知字符处理方式无效。');
  if (unknown === 'preserve' && !preserveAllowed) throw new Error('此算法会改变分组／长度，无法原位保留未知字符；请选择忽略空白或移除。');
  const index = new Map(alphabet.map((c, i) => [c, i]));
  const symbols = [], slots = [];
  let whitespace = 0, removed = 0, merged = 0;
  for (const original of input) {
    let char = upper(original);
    if (mergeJ && char === 'J') { char = 'I'; merged++; }
    if (index.has(char)) { slots.push({at: symbols.length, original}); symbols.push(char); }
    else if (unknown === 'preserve') slots.push({original});
    else if (/\s/u.test(original)) whitespace++;
    else if (unknown === 'remove') removed++;
    else throw new Error(`输入包含字母表之外的字符 ${JSON.stringify(original)}；可显式选择“移除”或修改字母表。`);
  }
  return {symbols, slots, whitespace, removed, merged, unknown};
}

function keyedSquare(options, size) {
  const fallback = size === 5 ? LATIN25 : size === 6 ? `${LATIN}0123456789` : `${LATIN}#`;
  const alphabet = alphabetOf(options, fallback, size === 3 ? 27 : size * size);
  const mergeJ = size === 5 && alphabet.includes('I') && !alphabet.includes('J');
  const keyText = options.squareKey ?? '';
  if (typeof keyText !== 'string' || keyText.length > 4096) throw new Error('方阵关键词必须是最多 4,096 个码元的文字。');
  const key = scan(keyText, alphabet, {unknown: 'reject'}, {mergeJ}).symbols;
  return {alphabet: [...new Set([...key, ...alphabet])], mergeJ};
}

function keySymbols(options, alphabet, mergeJ = false) {
  const key = options.key;
  if (typeof key !== 'string' || !key || key.length > 4096) throw new Error('请输入最多 4,096 个码元的非空密钥。');
  const symbols = scan(key, alphabet, {unknown: 'reject'}, {mergeJ}).symbols;
  if (!symbols.length) throw new Error('密钥至少需要一个字母表中的字符。');
  return symbols;
}

function singleSymbol(value, alphabet, label) {
  if (typeof value !== 'string' || [...upper(value)].length !== 1 || !alphabet.includes(upper(value))) throw new Error(`${label}必须是字母表中的单个字符。`);
  return upper(value);
}

function report(text, details, scanned, extraWarnings = []) {
  const warnings = [...extraWarnings];
  if (scanned?.whitespace) warnings.push(`已忽略 ${scanned.whitespace} 个空白字符，结果不保留原分词。`);
  if (scanned?.removed) warnings.push(`按所选规则移除了 ${scanned.removed} 个字母表之外的字符。`);
  if (scanned?.merged) warnings.push(`${scanned.merged} 个 J 已合并到 I，解密不能辨别原来的 I/J。`);
  return {text, details: {...details, ...(scanned ? {processedSymbols: scanned.symbols.length, ignoredWhitespace: scanned.whitespace, removedUnknown: scanned.removed, mergedJ: scanned.merged} : {})}, warnings};
}

function playfairResult(input, options) {
  const direction = directionOf(options), size = [...upper(options.alphabet ?? LATIN25)].length === 36 ? 6 : 5;
  const {alphabet, mergeJ} = keyedSquare(options, size), scanned = scan(input, alphabet, options, {mergeJ});
  const filler = singleSymbol(options.filler ?? 'X', alphabet, '填充字符');
  const alternate = singleSymbol(options.alternateFiller ?? 'Q', alphabet, '备用填充字符');
  if (filler === alternate) throw new Error('填充字符与备用字符必须不同，才能处理重复的填充字母。');
  const prepared = [], positions = [];
  if (direction === 'encrypt') {
    for (let i = 0; i < scanned.symbols.length;) {
      const first = scanned.symbols[i++], second = scanned.symbols[i];
      prepared.push(first);
      if (second === undefined || first === second) { positions.push(prepared.length); prepared.push(first === filler ? alternate : filler); }
      else { prepared.push(second); i++; }
    }
  } else {
    if (scanned.symbols.length % 2) throw new Error('Playfair 密文需要偶数个方阵字符。');
    for (const char of scanned.symbols) prepared.push(char);
  }
  const lookup = new Map(alphabet.map((c, i) => [c, i])), delta = direction === 'encrypt' ? 1 : -1, output = [];
  for (let i = 0; i < prepared.length; i += 2) {
    const first = lookup.get(prepared[i]), second = lookup.get(prepared[i + 1]);
    const rowA = Math.floor(first / size), rowB = Math.floor(second / size), colA = first % size, colB = second % size;
    if (first === second) throw new Error('Playfair 密文中不能有相同字符组成的字对。');
    if (rowA === rowB) output.push(alphabet[rowA * size + mod(colA + delta, size)], alphabet[rowB * size + mod(colB + delta, size)]);
    else if (colA === colB) output.push(alphabet[mod(rowA + delta, size) * size + colA], alphabet[mod(rowB + delta, size) * size + colB]);
    else output.push(alphabet[rowA * size + colB], alphabet[rowB * size + colA]);
  }
  return report(output.join(''), {direction, alphabet: alphabet.join(''), squareSize: size, preparedInput: prepared.join(''), insertedFillers: positions.length, fillerPositions: positions}, scanned,
    direction === 'decrypt' ? ['解密保留所有填充字母，无法可靠区分真实字母与分组填充。'] : positions.length ? [`分组时插入了 ${positions.length} 个填充字符。`] : []);
}

function columnOrder(options) {
  const type = options.keyType ?? 'keyword', key = options.key;
  if (typeof key !== 'string' || !key.trim() || key.length > 4096) throw new Error('列换位需要最多 4,096 个码元的非空密钥。');
  if (type === 'keyword') {
    const chars = [...upper(key.replace(/\s/gu, ''))];
    if (!chars.length) throw new Error('列换位密钥不能全部为空白。');
    return chars.map((char, index) => ({char, index})).sort((a, b) => a.char === b.char ? a.index - b.index : a.char < b.char ? -1 : 1).map(item => item.index);
  }
  if (type !== 'numeric') throw new Error('列密钥形式无效。');
  const trimmed = key.trim();
  const tokens = /^[1-9]+$/.test(trimmed) ? [...trimmed] : trimmed.split(/[\s,;]+/u);
  if (tokens.some(value => !/^[1-9]\d*$/.test(value))) throw new Error('数字列密钥必须由 1 开始的整数排名组成，如 3 1 2。');
  const ranks = tokens.map(Number), sorted = [...ranks].sort((a, b) => a - b);
  if (sorted.some((value, i) => value !== i + 1)) throw new Error('数字列密钥必须是 1 到列数的完整排列，不能重复或缺项。');
  return ranks.map((rank, index) => ({rank, index})).sort((a, b) => a.rank - b.rank).map(item => item.index);
}

function columnarTransform(chars, order, direction) {
  const columns = order.length, output = [];
  if (direction === 'encrypt') {
    for (const col of order) for (let row = col; row < chars.length; row += columns) output.push(chars[row]);
  } else {
    const rows = Math.floor(chars.length / columns), remainder = chars.length % columns, parts = Array(columns);
    let offset = 0;
    for (const col of order) { const length = rows + (col < remainder ? 1 : 0); parts[col] = chars.slice(offset, offset + length); offset += length; }
    for (let i = 0; i < chars.length; i++) output.push(parts[i % columns][Math.floor(i / columns)]);
  }
  return output.join('');
}

function columnarResult(input, options) {
  const direction = directionOf(options), order = columnOrder(options), chars = [...input], padding = options.padding ?? 'none';
  if (!['none', 'fill'].includes(padding)) throw new Error('列换位填充方式无效。');
  let added = 0;
  if (padding === 'fill') {
    const filler = options.filler ?? 'X';
    if (typeof filler !== 'string' || [...filler].length !== 1) throw new Error('列换位填充必须是一个完整字符。');
    if (direction === 'encrypt') { added = (order.length - chars.length % order.length) % order.length; for (let i = 0; i < added; i++) chars.push(filler); }
    else if (chars.length % order.length) throw new Error('完整矩形列换位的密文长度必须是列数的整数倍。');
  }
  return report(columnarTransform(chars, order, direction), {direction, columnOrder: order.map(i => i + 1), columns: order.length, paddingAdded: added, inputSymbols: [...input].length}, null,
    padding === 'fill' ? [direction === 'decrypt' ? '已保留填充字符；请结合原文长度人工判断，不自动删去末尾字母。' : `已补入 ${added} 个填充字符，原有空白和标点均参与换位。`] : []);
}

function adfgResult(input, options, size) {
  const direction = directionOf(options), {alphabet, mergeJ} = keyedSquare(options, size), labels = [...(size === 5 ? 'ADFGX' : 'ADFGVX')], order = columnOrder(options);
  const scanned = scan(input, direction === 'encrypt' ? alphabet : labels, options, {mergeJ: direction === 'encrypt' && mergeJ});
  let output;
  if (direction === 'encrypt') {
    const lookup = new Map(alphabet.map((c, i) => [c, i])), coordinates = [];
    for (const char of scanned.symbols) { const index = lookup.get(char); coordinates.push(labels[Math.floor(index / size)], labels[index % size]); }
    output = columnarTransform(coordinates, order, 'encrypt');
  } else {
    if (scanned.symbols.length % 2) throw new Error('ADFGX／ADFGVX 密文必须有偶数个坐标字符。');
    const coordinates = [...columnarTransform(scanned.symbols, order, 'decrypt')], decoded = [];
    for (let i = 0; i < coordinates.length; i += 2) decoded.push(alphabet[labels.indexOf(coordinates[i]) * size + labels.indexOf(coordinates[i + 1])]);
    output = decoded.join('');
  }
  return report(output, {direction, alphabet: alphabet.join(''), squareSize: size, coordinateLabels: labels.join(''), columnOrder: order.map(i => i + 1)}, scanned);
}

function trifidResult(input, options) {
  const direction = directionOf(options), {alphabet} = keyedSquare(options, 3), scanned = scan(input, alphabet, options);
  const period = Number(options.period ?? 5);
  if (!Number.isSafeInteger(period) || period < 1 || period > CLASSICAL_INPUT_LIMIT) throw new Error('Trifid 周期必须是 1–1,048,576 的整数。');
  const lookup = new Map(alphabet.map((c, i) => [c, i])), output = [];
  for (let offset = 0; offset < scanned.symbols.length; offset += period) {
    const group = scanned.symbols.slice(offset, offset + period), length = group.length;
    const coordinates = new Uint8Array(length * 3);
    for (let i = 0; i < length; i++) { const value = lookup.get(group[i]); coordinates[i * 3] = Math.floor(value / 9); coordinates[i * 3 + 1] = Math.floor(value / 3) % 3; coordinates[i * 3 + 2] = value % 3; }
    if (direction === 'encrypt') {
      const digits = [];
      for (let dimension = 0; dimension < 3; dimension++) for (let i = 0; i < length; i++) digits.push(coordinates[i * 3 + dimension]);
      for (let i = 0; i < digits.length; i += 3) output.push(alphabet[digits[i] * 9 + digits[i + 1] * 3 + digits[i + 2]]);
    } else {
      const digits = coordinates;
      for (let i = 0; i < length; i++) output.push(alphabet[digits[i] * 9 + digits[length + i] * 3 + digits[2 * length + i]]);
    }
  }
  return report(output.join(''), {direction, alphabet: alphabet.join(''), period, groups: Math.ceil(scanned.symbols.length / period)}, scanned);
}

function polyalphabeticResult(input, options, autokeyMode) {
  const direction = directionOf(options), alphabet = alphabetOf(options, LATIN), key = keySymbols(options, alphabet), scanned = scan(input, alphabet, options, {preserveAllowed: true});
  const variant = options.variant ?? (autokeyMode ? 'vigenere' : 'beaufort'), stream = options.stream ?? 'plaintext';
  if (!(autokeyMode ? ['vigenere', 'beaufort', 'variant'] : ['beaufort', 'variant']).includes(variant)) throw new Error('请选择支持的密码运算变体。');
  if (autokeyMode && !['plaintext', 'ciphertext'].includes(stream)) throw new Error('自密钥流必须选明文或密文。');
  const lookup = new Map(alphabet.map((c, i) => [c, i])), keyValues = key.map(c => lookup.get(c)), values = scanned.symbols.map(c => lookup.get(c)), output = [], usedKeys = [];
  for (let i = 0; i < values.length; i++) {
    const k = autokeyMode ? i < keyValues.length ? keyValues[i] : stream === 'plaintext' ? direction === 'encrypt' ? values[i - keyValues.length] : output[i - keyValues.length] : direction === 'encrypt' ? output[i - keyValues.length] : values[i - keyValues.length] : keyValues[i % keyValues.length];
    usedKeys.push(alphabet[k]);
    const value = values[i];
    output.push(mod(variant === 'beaufort' ? k - value : variant === 'variant' ? direction === 'encrypt' ? value - k : value + k : direction === 'encrypt' ? value + k : value - k, alphabet.length));
  }
  const result = output.map(value => alphabet[value]);
  const text = scanned.unknown === 'preserve' ? scanned.slots.map(slot => slot.at === undefined ? slot.original : options.preserveCase && /^[a-z]$/.test(slot.original) ? result[slot.at].toLowerCase() : result[slot.at]).join('') : result.join('');
  return report(text, {direction, alphabet: alphabet.join(''), variant, ...(autokeyMode ? {stream} : {}), keyStreamPreview: usedKeys.slice(0, 512).join(''), keyStreamLength: usedKeys.length, keyStreamPreviewTruncated: usedKeys.length > 512}, scanned);
}

function nihilistResult(input, options) {
  const direction = directionOf(options), {alphabet, mergeJ} = keyedSquare(options, 5), key = keySymbols(options, alphabet, mergeJ);
  const useModulo = options.modulo100 === undefined || options.modulo100 === true || options.modulo100 === 'yes';
  if (options.modulo100 !== undefined && ![true, false, 'yes', 'no'].includes(options.modulo100)) throw new Error('Nihilist 数字约定请选择两位数或完整和。');
  const lookup = new Map(alphabet.map((char, i) => [char, (Math.floor(i / 5) + 1) * 10 + i % 5 + 1])), keyValues = key.map(c => lookup.get(c));
  if (direction === 'encrypt') {
    const scanned = scan(input, alphabet, options, {mergeJ}), numbers = scanned.symbols.map((char, i) => lookup.get(char) + keyValues[i % keyValues.length]);
    return report(numbers.map(value => useModulo ? String(value % 100).padStart(2, '0') : String(value)).join(' '), {direction, alphabet: alphabet.join(''), modulo100: useModulo, numbers: numbers.length}, scanned);
  }
  if (!input.trim()) return report('', {direction, alphabet: alphabet.join(''), modulo100: useModulo, numbers: 0});
  const tokens = input.trim().split(/[\s,;]+/u);
  if (tokens.some(token => useModulo ? !/^\d{2}$/.test(token) : !/^\d{1,3}$/.test(token))) throw new Error(useModulo ? '两位数密文需逐项分隔，例如 65 55 08；不要粘连为一串数字。' : '完整和密文需用空白或逗号分隔整数。');
  const output = [];
  for (let i = 0; i < tokens.length; i++) {
    let value = Number(tokens[i]);
    if (useModulo && value <= 10) value += 100;
    if (value < 22 || value > 110) throw new Error(`第 ${i + 1} 项密文超出 Nihilist 坐标和的范围。`);
    const plain = value - keyValues[i % keyValues.length], row = Math.floor(plain / 10), col = plain % 10;
    if (row < 1 || row > 5 || col < 1 || col > 5) throw new Error(`第 ${i + 1} 项减去密钥后不是合法的 11–55 方阵坐标；请检查数字约定、方阵或密钥。`);
    output.push(alphabet[(row - 1) * 5 + col - 1]);
  }
  return report(output.join(''), {direction, alphabet: alphabet.join(''), modulo100: useModulo, numbers: tokens.length}, null, ['解密只能还原方阵字符，无法恢复被忽略的分词或 I/J 区别。']);
}

export function runClassical(id, input, options = {}) {
  inputText(input);
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('参数必须是对象。');
  switch (id) {
    case 'playfair': return playfairResult(input, options);
    case 'adfgx': return adfgResult(input, options, 5);
    case 'adfgvx': return adfgResult(input, options, 6);
    case 'trifid': return trifidResult(input, options);
    case 'autokey': return polyalphabeticResult(input, options, true);
    case 'beaufort': return polyalphabeticResult(input, options, false);
    case 'columnar': return columnarResult(input, options);
    case 'nihilist': return nihilistResult(input, options);
    default: throw new Error('未知的古典密码任务。');
  }
}

export const playfair = (input, options) => runClassical('playfair', input, options).text;
export const adfgx = (input, options) => runClassical('adfgx', input, options).text;
export const adfgvx = (input, options) => runClassical('adfgvx', input, options).text;
export const trifid = (input, options) => runClassical('trifid', input, options).text;
export const autokey = (input, options) => runClassical('autokey', input, options).text;
export const beaufort = (input, options) => runClassical('beaufort', input, options).text;
export const columnar = (input, options) => runClassical('columnar', input, options).text;
export const nihilist = (input, options) => runClassical('nihilist', input, options).text;
