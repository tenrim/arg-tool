import {KEYBOARD_MAPPINGS, ORIGINAL_MAPPING_ROWS} from '../vendor/expansion/keyboard/mappings.js';
export {KEYBOARD_MAPPINGS, ORIGINAL_MAPPING_ROWS};
const normalize = text => text.replace(/[A-Z]/g, char => char.toLowerCase());
const tokensOf = (value, fallback) => {
  if (value === undefined) return [...fallback];
  if (typeof value !== 'string' || value.length > 32768) throw Error('映射表必须是不超过 32,768 字符的文字。');
  return value.trim().split(/\s+/u).filter(Boolean);
};
const tokenized = values => values.some(value => [...value].length > 1) || values.every(value => /^\d+$/u.test(value));

export function runKeyboard(mode, input, options = {}) {
  if (!['qwerty', 'ninekey'].includes(mode)) throw Error('未知键盘任务。');
  if (typeof input !== 'string' || input.length > 65536) throw Error('输入必须是不超过 65,536 字符的文字。');
  const direction = options.direction ?? 'encrypt';
  if (!['encrypt', 'decrypt'].includes(direction)) throw Error('请选择明确的转换方向。');
  const template = KEYBOARD_MAPPINGS.find(item => item.id === (options.mapping ?? mode));
  if (!template) throw Error('未知上游映射表。');
  const source = tokensOf(options.sourceMap, template.from), target = tokensOf(options.targetMap, template.to);
  if (!source.length || source.length !== target.length || source.length > 256) throw Error('两行映射须有相同的 1–256 项，使用空白分隔。');
  if ([...source, ...target].some(value => [...value].length > 64)) throw Error('单项映射最多 64 个字符。');
  const from = direction === 'encrypt' ? source : target, to = direction === 'encrypt' ? target : source;
  const unknown = options.unknown ?? 'preserve', ambiguity = options.ambiguity ?? 'all', letterCase = options.case ?? 'preserve';
  if (!['preserve','reject','remove'].includes(unknown) || !['all','reject','first'].includes(ambiguity) || !['preserve','upper','lower'].includes(letterCase)) throw Error('未知字符、歧义或大小写参数无效。');
  const inputTokens = tokenized(from), outputTokens = tokenized(to);
  const separator = options.separator ?? (outputTokens || inputTokens ? ' ' : '');
  const wordSeparator = options.wordSeparator ?? '/';
  if (typeof separator !== 'string' || separator.length > 8 || /[a-z0-9]/i.test(separator)) throw Error('项间分隔符最多 8 个字符，不能含字母或数字。');
  if (typeof wordSeparator !== 'string' || !wordSeparator || wordSeparator.length > 8 || /\s|[a-z0-9]/i.test(wordSeparator)) throw Error('词间标记须为 1–8 个非空白、非字母数字字符。');
  if (inputTokens && from.some(value => normalize(value) === normalize(wordSeparator))) throw Error('词间标记不能与映射编码相同，请更换词间标记。');
  const root = {next: new Map()}, ambiguousEntries = [];
  for (let i = 0; i < from.length; i++) {
    let node = root;
    for (const char of normalize(from[i])) { if (!node.next.has(char)) node.next.set(char, {next: new Map()}); node = node.next.get(char); }
    node.outputs ??= [];
    if (!node.outputs.includes(to[i])) node.outputs.push(to[i]);
    if (node.outputs.length > 1) ambiguousEntries.push(from[i]);
  }
  const chars = [...input], parts = [];
  let matched = 0, unknownCount = 0, spaces = 0, ambiguousMatches = 0;
  const warnings = [];
  for (let at = 0; at < chars.length;) {
    const rest = chars.slice(at, at + 8).join('');
    if (inputTokens && rest.startsWith(wordSeparator)) { parts.push(outputTokens ? wordSeparator : ' '); at += [...wordSeparator].length; continue; }
    if (inputTokens && /\s/u.test(chars[at])) { at++; continue; }
    if (inputTokens && separator && rest.startsWith(separator)) { at += [...separator].length; continue; }
    let node = root, found, end = at;
    for (let i = at; i < chars.length && node.next.has(normalize(chars[i])); i++) {
      node = node.next.get(normalize(chars[i]));
      if (node.outputs) { found = node.outputs; end = i + 1; }
    }
    if (found) {
      if (found.length > 1 && ambiguity === 'reject') throw Error(`编码 ${JSON.stringify(chars.slice(at, end).join(''))} 对应多个字符：${found.join(' / ')}。`);
      let output = found.length > 1 && ambiguity === 'all' ? `{${found.join('|')}}` : found[0];
      if (found.length > 1) ambiguousMatches++;
      const original = chars.slice(at, end).join('');
      if (letterCase === 'upper' || letterCase === 'preserve' && /^[A-Z]+$/u.test(original)) output = output.replace(/[a-z]/g, char => char.toUpperCase());
      else if (letterCase === 'lower') output = normalize(output);
      parts.push(output); matched++; at = end;
    } else {
      const char = chars[at++];
      if (outputTokens && /\s/u.test(char)) {
        while (at < chars.length && /\s/u.test(chars[at])) at++;
        parts.push(wordSeparator); spaces++; continue;
      }
      if (unknown === 'reject') throw Error(`输入含映射表以外的字符 ${JSON.stringify(char)}。`);
      if (unknown === 'preserve') parts.push(char);
      unknownCount++;
    }
  }
  if (ambiguousMatches) warnings.push(`有 ${ambiguousMatches} 处编码对应多个值；${ambiguity === 'all' ? '用 {a|b} 明确列出歧义，未擅自选取唯一字母' : '按所选规则取首项，结果可能丢失区别'}。`);
  if (unknownCount) warnings.push(`映射表之外的 ${unknownCount} 个字符已${unknown === 'remove' ? '移除' : '原样保留'}，这些字符未被成功转换。`);
  if (spaces) warnings.push(`编码将 ${spaces} 段空白改为 ${wordSeparator} 词间标记；连续空格、制表和换行的原始形式不会自动恢复。`);
  if (mode === 'ninekey' && direction === 'decrypt') warnings.push('键位数字本身不含原文大小写；输出采用所选大小写约定。');
  if (template.id === 'elements-legacy') warnings.push('此处完整保留上游历史元素表（含 uut/uup/uus/uuo 临时符号）；当前正式元素符号请使用本站元素资料与元素拼词任务。');
  return {text: parts.join(outputTokens ? separator : ''), details: {mode, direction, mapping: template.id, inputTokens, outputTokens, matched, unknownCount, ambiguousMatches, ambiguousEntries: [...new Set(ambiguousEntries)], mappingRows: source.map((value, i) => [value, target[i]]), source: source.join(' '), target: target.join(' ')}, warnings};
}
