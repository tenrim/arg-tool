import romanice from '../vendor/basics/roman-index.js';
import Polybius from '../vendor/basics/PolybiusSquare.js';
import TapCode from '../vendor/basics/TapCode.js';
import Invisibles from '../vendor/basics/invisibles.js';
import * as Baudot from '../vendor/basics/baudot.js';

import {CATEGORIES,bounded,squareModel,parseWords,formatWords} from './model.js';
export {CATEGORIES,squareModel,parseWords,formatWords,tapeSVG} from './model.js';
const names = {0x200B:'零宽空格',0x200C:'零宽不连字符',0x200D:'零宽连接符',0xFEFF:'字节序标记／零宽不换行空格',0x00A0:'不换行空格',0x00AD:'软连字符',0x202E:'从右到左覆盖',0x2060:'单词连接符',0xFE0F:'Emoji 变体选择符',0xFE0E:'文字变体选择符',0x3000:'全角空格'};
function emojiPreserved(text) {
  const indexes = new Set();
  if (typeof Intl.Segmenter !== 'function') {
    // Conservative fallback: preserve tags too when grapheme boundaries are
    // unavailable, rather than changing a valid emoji flag during cleaning.
    let index=0;for(const c of text){const cp=c.codePointAt(0);if(cp>=0xE0020&&cp<=0xE007F)indexes.add(index);index+=c.length;}return indexes;
  }
  for (const segment of new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)) {
    if (!/\p{Extended_Pictographic}|[0-9#*]\uFE0F?\u20E3/u.test(segment.segment)) continue;
    let index = segment.index;
    for (const c of segment.segment) {const cp = c.codePointAt(0);if (cp === 0x200D || cp >= 0xE0020 && cp <= 0xE007F) indexes.add(index);index += c.length;}
  }return indexes;
}
function inspect(text, options) {
  const report = Invisibles.scan(text), protectedIndexes = options.preserve ? emojiPreserved(text) : new Set();
  const selected = options.categories || Object.keys(CATEGORIES);if (!Array.isArray(selected) || selected.some(c => !Object.hasOwn(CATEGORIES,c))) throw Error('清理类别无效。');
  // Joiners and variation selectors have legitimate typography semantics.
  // Preserve them by default; inspection always reports them regardless.
  const preserveScalar = cp => options.preserve && (cp === 0x200C || cp === 0x200D || Invisibles.classify(cp)?.category === 'variation-selector');
  let index = 0, cleaned = '';
  const skip = Object.keys(CATEGORIES).filter(c => !selected.includes(c));
  for (const c of text) {cleaned += protectedIndexes.has(index) || preserveScalar(c.codePointAt(0)) ? c : Invisibles.cleanWith(c, skip);index += c.length;}
  let scalar = 0, offset = 0;const positions = new Map();for (const c of text) {positions.set(offset, scalar++);offset += c.length;}
  const findings = report.findings.map(f => ({...f,position: positions.get(f.index),name:names[f.cp] || CATEGORIES[f.category],preserved:Boolean(protectedIndexes.has(f.index) || preserveScalar(f.cp))}));
  const output = options.action === 'clean' ? cleaned : findings.map(f => `${f.hex}\t${f.name}\t${CATEGORIES[f.category]}\t码点位置 ${f.position}\tUTF-16位置 ${f.index}`).join('\n');
  return {output, findings, total:report.total, counts:report.counts, segments:Invisibles.visualize(text), cleaned:options.action === 'clean'};
}
export async function convert(kind, text, options = {}) {
  bounded(text);
  const decode = options.direction === 'decode';
  if (options.direction !== undefined && !['encode','decode'].includes(options.direction)) throw Error('转换方向无效。');
  if (kind === 'roman') {
    const engine = romanice(), tokens = text.trim() ? text.trim().split(/\s+/) : [];
    if (tokens.length > 4096) throw Error('最多转换 4096 个数字。');
    const rows = tokens.map(token => {
      let result;
      if (!decode) {if (!/^\d+$/.test(token) || Number(token) < 1 || Number(token) > 3999) throw Error('罗马数字转换范围为整数 1–3999。');result = engine.toRoman(Number(token));}
      else {const roman = token.normalize('NFKC').toUpperCase();if (!/^[IVXLCDM]+$/.test(roman)) throw Error('请输入有效罗马数字。');try {result = engine.fromRoman(roman);}catch {throw Error('罗马数字顺序无效：' + token);}if (result < 1 || result > 3999 || engine.toRoman(result) !== roman) throw Error('请使用标准罗马数字写法：' + token);}
      return [token,String(result)];
    });return {output: rows.map(r => r[1]).join('\n'), rows};
  }
  if (kind === 'tapcode') {
    const model = squareModel(options), engine = options.mode === 'tap' ? new TapCode() : new Polybius();
    if (options.mode !== 'tap') engine.setSettingValues({alphabet:model.alphabet.toLowerCase(),rows:'123456'.slice(0,model.width),columns:'123456'.slice(0,model.width),separator:' ',caseSensitivity:false,includeForeignChars:false});
    const words = decode ? text.trim().split(/\s*\/\s*/) : text.trim().replace(/[a-z]/g,c=>c.toUpperCase()).split(/\s+/);
    if (!text.trim()) return {output:'', model};
    const output = [];
    for (const word of words) {
      if (!word) throw Error('单词分隔符两侧不能为空。');
      if (decode) {
        if (options.mode === 'tap') {if (!/^[.·\s]+$/.test(word)) throw Error('敲击码使用点号和空格，单词以 / 分隔。');const groups = word.trim().split(/\s+/);if (groups.length % 2 || groups.some(s => s.length < 1 || s.length > 5)) throw Error('每个字母需要两组 1–5 次敲击。');}
        else {if (!/^[1-6\s,;]+$/.test(word)) throw Error('坐标只能包含数字、空格、逗号或分号。');const coords=word.replace(/[\s,;]/g,'');if (coords.length%2 || [...coords].some(c => +c>model.width)) throw Error('坐标须成对，且处于当前方阵范围内。');}
      } else {const normalized = options.mode === 'tap' ? word.replaceAll('K','C') : model.width === 5 ? word.replaceAll('J','I') : word;if ([...normalized].some(c => !model.alphabet.includes(c))) throw Error('输入含有当前方阵无法表示的字符。');}
      const payload = decode ? options.mode === 'tap' ? word.replaceAll('·','.') : word.replace(/[\s,;]/g,'') : word;
      output.push((await engine[decode?'decode':'encode'](payload)).getString().toUpperCase());
    }return {output:output.join(decode?' ':' / '),model};
  }
  if (kind === 'baudot') {
    const variant = options.alphabet || 'ITA2';if (!['ITA1','ITA2','US_TTY'].includes(variant)) throw Error('波多码字母表无效。');const alphabet = Baudot[variant];
    let words, output;
    if (decode) {words = parseWords(text, options.format);output = Baudot.decoder(alphabet)(words);}
    else {const normalized = text.replace(/[a-z]/g,c=>c.toUpperCase());if ([...normalized].some(c => !alphabet.some(set => set.includes(c)))) throw Error('输入含有此波多码字母表不支持的字符。');words = Baudot.encoder(alphabet)(normalized);if(words.length>4096)throw Error('编码后超过 4096 个码字。');output = formatWords(words,options.format);}
    return {output, words};
  }
  if (kind === 'invisible') {if (!['inspect','clean'].includes(options.action)) throw Error('请选择检查或清理。');return inspect(text,options);}
  throw Error('未知基础工具。');
}
