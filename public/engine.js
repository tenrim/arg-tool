import { CaesarString } from './vendor/puzzle-lib/Cipher/CaesarString.js';
import { VigenereString } from './vendor/puzzle-lib/Cipher/VigenereString.js';
import { AutoKeyString } from './vendor/puzzle-lib/Cipher/AutoKeyString.js';
import { MorseCharacter } from './vendor/puzzle-lib/Morse/MorseCharacter.js';
import { MorseEncoding } from './vendor/puzzle-lib/Morse/MorseEncoding.js';
import { MorseData } from './vendor/puzzle-lib/Morse/MorseData.js';
import { BrailleCharacter } from './vendor/puzzle-lib/Braille/BrailleCharacter.js';
import { BrailleEncoding } from './vendor/puzzle-lib/Braille/BrailleEncoding.js';
import { EncodingCategory } from './vendor/puzzle-lib/Common/EncodingCategory.js';

const encoder = new TextEncoder();
export const utf8 = text => encoder.encode(text);
export function textFromBytes(bytes) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new Error('解码后的字节不是有效的 UTF-8 文本，可能是二进制数据或其他字符编码。'); }
}
export const bytesToHex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(' ');
export function hexToBytes(input) {
  const compact = input.replace(/0x/gi, '').replace(/[\s,:-]/g, '');
  if (compact.length % 2 || /[^\da-f]/i.test(compact)) throw new Error('十六进制需要完整的字节，例如 41 52 47。');
  return Uint8Array.from(compact.match(/.{2}/g) || [], x => parseInt(x, 16));
}
export function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
export function base64ToBytes(text) {
  const compact = text.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (/[^A-Za-z0-9+/=]/.test(compact) || compact.length % 4 === 1 || /=.+[^=]/.test(compact) || /={3}/.test(compact)) throw new Error('输入不是有效的 Base64。');
  try { return Uint8Array.from(atob(compact), x => x.charCodeAt(0)); }
  catch { throw new Error('输入不是有效的 Base64。'); }
}
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32Encode(bytes) {
  let bits = 0, buffer = 0, output = '';
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte; bits += 8;
    while (bits >= 5) { bits -= 5; output += B32[(buffer >>> bits) & 31]; }
    buffer &= (1 << bits) - 1;
  }
  if (bits) output += B32[(buffer << (5 - bits)) & 31];
  return output.padEnd(Math.ceil(output.length / 8) * 8, '=');
}
export function base32Decode(text) {
  const compact = text.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z2-7]*={0,6}$/.test(compact)) throw new Error('Base32 仅使用 A–Z、2–7 和末尾的 =。');
  const plain = compact.replace(/=+$/, '');
  if ([1, 3, 6].includes(plain.length % 8) || (compact.includes('=') && compact.length % 8)) throw new Error('Base32 长度或填充无效。');
  let bits = 0, buffer = 0; const bytes = [];
  for (const char of plain) {
    buffer = (buffer << 5) | B32.indexOf(char); bits += 5;
    if (bits >= 8) { bits -= 8; bytes.push((buffer >>> bits) & 255); }
    buffer &= (1 << bits) - 1;
  }
  if (buffer !== 0) throw new Error('Base32 的末尾填充位无效。');
  return Uint8Array.from(bytes);
}
export const morseMap = new Map();
for (const [key, value] of Object.entries(MorseEncoding)) {
  if (/^(Letter|Number|Punctuation)/.test(key) && typeof value === 'number') {
    const letter = MorseData.instance.lookup(value).exact[0]?.display;
    if (letter && !morseMap.has(letter)) morseMap.set(letter, MorseCharacter.toMorseString(value));
  }
}
export function morseEncode(text) {
  return text.trim().toUpperCase().split(/\s+/).map(word => Array.from(word, ch => {
    if (!morseMap.has(ch)) throw new Error(`摩斯编码暂不支持字符「${ch}」。`);
    return morseMap.get(ch);
  }).join(' ')).join(' / ');
}
export function morseDecode(text) {
  return text.trim().replace(/[·•]/g, '.').replace(/[—−_]/g, '-').split(/\s*\/\s*/).map(word => word.trim().split(/\s+/).filter(Boolean).map(token => {
    if (!/^[.-]{1,9}$/.test(token)) throw new Error('摩斯输入用空格分隔字母，用 / 分隔单词。');
    const ch = new MorseCharacter(token);
    if (!ch.valid()) throw new Error(`无法识别摩斯字母 ${token}。`);
    return ch.toString();
  }).join('')).join(' ');
}
export function brailleEncode(text) {
  let result = '', numeric = false;
  for (const char of text.toUpperCase()) {
    if (/\s/.test(char)) { result += char; numeric = false; continue; }
    let code;
    if (/\d/.test(char)) {
      if (!numeric) result += String.fromCharCode(0x2800 + BrailleEncoding.FormattingNumber);
      numeric = true; code = BrailleEncoding['Number' + char];
    } else {
      if (numeric) throw new Error('数字与字母之间请加一个空格。');
      code = BrailleEncoding['Letter' + char];
    }
    if (code === undefined) throw new Error('当前支持英文 A–Z、数字和空白字符。');
    result += String.fromCharCode(0x2800 + code);
  }
  return result;
}
export function brailleDecode(text) {
  let numeric = false, result = '';
  for (const char of text) {
    if (/\s/.test(char) || char === '\u2800') { result += ' '; numeric = false; continue; }
    const bits = char.codePointAt(0) - 0x2800;
    if (bits < 0 || bits > 63) throw new Error('请输入六点 Unicode 盲文，例如 ⠁⠗⠛。');
    if (bits === BrailleEncoding.FormattingNumber) { numeric = true; continue; }
    const value = new BrailleCharacter(bits, numeric ? EncodingCategory.Number : EncodingCategory.Letter);
    if (!value.valid()) throw new Error('发现当前英文盲文模式无法识别的符号。');
    result += value.toString();
  }
  return result;
}
export function railFence(text, rails, decode = false) {
  if (!Number.isInteger(rails) || rails < 2 || rails > 32) throw new Error('栅栏数必须为 2–32。');
  const chars = Array.from(text), positions = chars.map((_, i) => {
    const p = i % (2 * rails - 2); return p < rails ? p : 2 * rails - 2 - p;
  });
  if (!decode) return Array.from({ length: rails }, (_, r) => chars.filter((_, i) => positions[i] === r).join('')).join('');
  const rows = Array.from({ length: rails }, () => []); let offset = 0;
  rows.forEach((row, r) => { const count = positions.filter(p => p === r).length; rows[r] = chars.slice(offset, offset + count); offset += count; });
  const indices = new Array(rails).fill(0);
  return positions.map(r => rows[r][indices[r]++]).join('');
}
export function entropy(bytes) {
  if (!bytes.length) return 0;
  const counts = new Uint32Array(256); for (const byte of bytes) counts[byte]++;
  let value = 0; for (const n of counts) if (n) { const p = n / bytes.length; value -= p * Math.log2(p); }
  return value;
}
export function analyzeText(text) {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  const counts = Object.fromEntries(Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ', char => [char, 0]));
  for (const char of letters) counts[char]++;
  const n = letters.length;
  return { characters: Array.from(text).length, bytes: utf8(text).length, letters: n, entropy: +entropy(utf8(text)).toFixed(4), coincidence: n < 2 ? 0 : Object.values(counts).reduce((sum, c) => sum + c * (c - 1), 0) / (n * (n - 1)), frequencies: counts };
}
const invisibleNames = { 0x200b: 'ZERO WIDTH SPACE', 0x200c: 'ZERO WIDTH NON-JOINER', 0x200d: 'ZERO WIDTH JOINER', 0x2060: 'WORD JOINER', 0x2061: 'FUNCTION APPLICATION', 0x2062: 'INVISIBLE TIMES', 0x2063: 'INVISIBLE SEPARATOR', 0x2064: 'INVISIBLE PLUS', 0xfeff: 'BOM / ZERO WIDTH NO-BREAK SPACE', 0x200e: 'LEFT-TO-RIGHT MARK', 0x200f: 'RIGHT-TO-LEFT MARK', 0x202a: 'LEFT-TO-RIGHT EMBEDDING', 0x202b: 'RIGHT-TO-LEFT EMBEDDING', 0x202c: 'POP DIRECTIONAL FORMATTING', 0x202d: 'LEFT-TO-RIGHT OVERRIDE', 0x202e: 'RIGHT-TO-LEFT OVERRIDE', 0x2066: 'LEFT-TO-RIGHT ISOLATE', 0x2067: 'RIGHT-TO-LEFT ISOLATE', 0x2068: 'FIRST STRONG ISOLATE', 0x2069: 'POP DIRECTIONAL ISOLATE' };
export function inspectInvisible(text) {
  return Array.from(text).flatMap((char, index) => invisibleNames[char.codePointAt(0)] ? [{ index, code: 'U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'), name: invisibleNames[char.codePointAt(0)] }] : []);
}
const mod = (n, d) => ((n % d) + d) % d;
const parameter = (key, label, value, type = 'text', min, max) => ({ key, label, value, type, min, max });
export const tools = [
  { id: 'base64', name: 'Base64', group: '编码', description: 'UTF-8 文本与 Base64 / Base64URL 转换。', example: 'QVJHIOW3peWFtw==', source: 'Web 标准' },
  { id: 'base32', name: 'Base32', group: '编码', description: 'RFC 4648 Base32 编码与解码。', example: 'IFJEOMI=', source: 'Web 标准' },
  { id: 'hex', name: '十六进制', group: '编码', description: '以字节为单位转换 UTF-8 文本。', example: '41 52 47', source: 'Web 标准' },
  { id: 'binary', name: '二进制', group: '编码', description: '8 位字节与 UTF-8 文本转换。', example: '01000001 01010010 01000111', source: 'Web 标准' },
  { id: 'decimal', name: '十进制字节', group: '编码', description: '将 0–255 的字节序列转换为文本。', example: '65 82 71', source: 'Web 标准' },
  { id: 'url', name: 'URL 编码', group: '编码', description: '处理百分号编码，不将 + 自动视为空格。', example: 'ARG%20%E5%B7%A5%E5%85%B7', source: 'Web 标准' },
  { id: 'html', name: 'HTML 实体', group: '编码', description: '转换常见命名实体及数字实体。', example: '&#65;&#82;&#71;', source: 'Web 标准' },
  { id: 'caesar', name: '凯撒密码', group: '古典密码', description: '保留英文大小写，非英文字母保持原样。', example: 'DUJ WRROV', params: [parameter('shift', '位移', 3, 'number', 0, 25)], source: 'puzzle-lib' },
  { id: 'caesar-all', name: '凯撒全位移', group: '古典密码', description: '同时列出 26 种位移结果，供人工判断。', example: 'DUJ WRROV', oneWay: true, source: 'puzzle-lib' },
  { id: 'rot13', name: 'ROT13', group: '古典密码', description: '英文位移 13 位；再次转换即可还原。', example: 'NET GBBYF', source: 'puzzle-lib' },
  { id: 'rot47', name: 'ROT47', group: '古典密码', description: '对可打印 ASCII 字符 !–~ 位移 47 位。', example: 'p#v', source: '迷雾工具箱' },
  { id: 'atbash', name: 'Atbash', group: '古典密码', description: '将英文字母表反转：A↔Z、B↔Y。', example: 'ZIT GLLOH', source: '迷雾工具箱' },
  { id: 'vigenere', name: '维吉尼亚密码', group: '古典密码', description: '使用重复英文密钥进行多表替换。', example: 'LXFOPVEFRNHR', params: [parameter('key', '英文密钥', 'LEMON')], source: 'puzzle-lib' },
  { id: 'autokey', name: '自动密钥密码', group: '古典密码', description: '使用密钥和明文构成自动密钥序列。', example: 'QNXEPVYTWTWP', params: [parameter('key', '英文密钥', 'QUEENLY')], source: 'puzzle-lib' },
  { id: 'rail', name: '栅栏密码', group: '古典密码', description: '按锯齿轨迹重排字符；保留空格。', example: 'WECRLTEERDSOEEFEAOCAIVDEN', params: [parameter('rails', '栅栏数', 3, 'number', 2, 32)], source: '迷雾工具箱' },
  { id: 'affine', name: '仿射密码', group: '古典密码', description: '使用 (a×x+b) mod 26；a 必须与 26 互质。', example: 'IHHWVCSWFRCP', params: [parameter('a', '乘数 a', 5, 'number', 1, 25), parameter('b', '偏移 b', 8, 'number', 0, 25)], source: '迷雾工具箱' },
  { id: 'a1z26', name: 'A1Z26', group: '符号编码', description: 'A=1、B=2…Z=26；单词使用 / 分隔。', example: '1-18-7 / 20-15-15-12-19', source: '迷雾工具箱' },
  { id: 'morse', name: '摩斯电码', group: '符号编码', description: '字母使用空格分隔，单词使用 / 分隔。', example: '.- .-. --. / - --- --- .-.. ...', source: 'puzzle-lib' },
  { id: 'braille', name: '英文六点盲文', group: '符号编码', description: '英文 A–Z、数字与 Unicode 六点盲文转换。', example: '⠁⠗⠛', source: 'puzzle-lib' },
  { id: 'bacon', name: '培根密码', group: '符号编码', description: '使用 26 字母版本，A=0、B=1，每组五位。', example: 'AAAAA BAAAB AABBA', source: '迷雾工具箱' },
  { id: 'xor', name: 'XOR', group: '字节工具', description: '循环使用 UTF-8 密钥；密文以十六进制显示。', example: '32 37 24', params: [parameter('key', 'UTF-8 密钥', 'secret')], source: 'Web 标准' },
  { id: 'reverse', name: '文本倒序', group: '文本分析', description: '按 Unicode 字符倒序，保留组合字符簇。', example: 'SLOOT GRA', oneWay: true, source: 'Web 标准' },
  { id: 'frequency', name: '频率分析', group: '文本分析', description: '统计英文字母频率、重合指数与字节熵。', example: 'ATTACK AT DAWN', oneWay: true, source: '迷雾工具箱' },
  { id: 'invisible', name: '不可见字符检查', group: '文本分析', description: '列出零宽字符与方向控制符的码位和位置。', example: 'ARG\u200b\u200cTOOLS', oneWay: true, source: 'Unicode' },
  { id: 'unicode', name: 'Unicode 码位', group: '字节工具', description: '文本与 U+XXXX 码位序列转换。', example: 'U+0041 U+0052 U+0047', source: 'Unicode' },
  { id: 'sha256', name: 'SHA-256', group: '字节工具', description: '计算摘要；哈希不能直接还原原文。', example: 'ARG', oneWay: true, source: 'Web Crypto' },
  { id: 'sha512', name: 'SHA-512', group: '字节工具', description: '计算 512 位摘要。', example: 'ARG', oneWay: true, source: 'Web Crypto' },
];
export function getTool(id) { const tool = tools.find(t => t.id === id); if (!tool) throw new Error('未知工具。'); return tool; }
export async function transform(id, input, mode = 'decode', params = {}) {
  getTool(id);
  if (typeof input !== 'string' || input.length > 2_000_000) throw new Error('文本输入限制为 200 万字符。');
  if (!['encode', 'decode'].includes(mode)) throw new Error('未知转换方向。');
  const encode = mode === 'encode';
  const key = () => { const k = String(params.key || ''); if (!/^[a-z]+$/i.test(k)) throw new Error('密钥只允许非空英文字母。'); return k; };
  switch (id) {
    case 'base64': return encode ? bytesToBase64(utf8(input)) : textFromBytes(base64ToBytes(input));
    case 'base32': return encode ? base32Encode(utf8(input)) : textFromBytes(base32Decode(input));
    case 'hex': return encode ? bytesToHex(utf8(input)) : textFromBytes(hexToBytes(input));
    case 'binary': {
      if (encode) return Array.from(utf8(input), byte => byte.toString(2).padStart(8, '0')).join(' ');
      const clean = input.replace(/\s/g, '');
      if (/[^01]/.test(clean) || clean.length % 8) throw new Error('二进制输入需要完整的 8 位字节。');
      return textFromBytes(Uint8Array.from(clean.match(/.{8}/g) || [], byte => parseInt(byte, 2)));
    }
    case 'decimal': {
      if (encode) return Array.from(utf8(input)).join(' ');
      const parts = input.trim() ? input.trim().split(/[\s,]+/) : [];
      if (parts.some(x => !/^\d+$/.test(x) || Number(x) > 255)) throw new Error('每个字节必须是 0–255 的整数。');
      return textFromBytes(Uint8Array.from(parts, Number));
    }
    case 'url': {
      try { return encode ? encodeURIComponent(input) : decodeURIComponent(input); }
      catch { throw new Error('URL 编码无效，请检查百分号后是否是完整的十六进制字节及有效的 UTF-8 文本。'); }
    }
    case 'html': {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      if (encode) return input.replace(/[&<>"']/g, x => map[x]);
      const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };
      return input.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (whole, value) => {
        if (value[0] !== '#') return named[value.toLowerCase()];
        const n = value[1].toLowerCase() === 'x' ? parseInt(value.slice(2), 16) : Number(value.slice(1));
        if (n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) throw new Error('无效的 Unicode 数字实体。');
        return String.fromCodePoint(n);
      });
    }
    case 'caesar': { const shift = Number(params.shift ?? 3); if (!Number.isInteger(shift)) throw new Error('位移必须是整数。'); return new CaesarString(input).getRotation(encode ? shift : -shift); }
    case 'caesar-all': return new CaesarString(input).getRotations().map((value, i) => `ROT ${String(i).padStart(2, '0')}  ${value}`).join('\n');
    case 'rot13': return new CaesarString(input).getRotation(13);
    case 'rot47': return Array.from(input, x => { const n = x.charCodeAt(0); return n >= 33 && n <= 126 ? String.fromCharCode(33 + mod(n - 33 + 47, 94)) : x; }).join('');
    case 'atbash': return input.replace(/[a-z]/gi, ch => String.fromCharCode((ch <= 'Z' ? 155 : 219) - ch.charCodeAt(0)));
    case 'vigenere': { const cipher = new VigenereString(input, key()); return encode ? cipher.encrypt() : cipher.decrypt(); }
    case 'autokey': { const cipher = new AutoKeyString(input, key()); return encode ? cipher.encrypt() : cipher.decrypt(); }
    case 'rail': return railFence(input, Number(params.rails ?? 3), !encode);
    case 'affine': {
      const a = Number(params.a ?? 5), b = Number(params.b ?? 8);
      if (!Number.isInteger(a) || !Number.isInteger(b)) throw new Error('a 和 b 必须是整数。');
      const inv = Array.from({ length: 26 }, (_, i) => i).find(i => mod(a * i, 26) === 1);
      if (inv === undefined) throw new Error('a 必须与 26 互质，例如 1、3、5、7、9、11。');
      return input.replace(/[a-z]/gi, ch => { const base = ch <= 'Z' ? 65 : 97, n = ch.charCodeAt(0) - base; return String.fromCharCode(base + mod(encode ? a * n + b : inv * (n - b), 26)); });
    }
    case 'a1z26': {
      if (encode) { if (/[^A-Za-z\s]/.test(input)) throw new Error('A1Z26 编码只接受英文字母和空格。'); return input.toUpperCase().trim().split(/\s+/).map(word => Array.from(word, x => x.charCodeAt(0) - 64).join('-')).join(' / '); }
      return input.trim().split(/\s*\/\s*/).map(word => word.split(/[-\s,]+/).filter(Boolean).map(value => { if (!/^\d+$/.test(value) || +value < 1 || +value > 26) throw new Error('A1Z26 的数字必须为 1–26。'); return String.fromCharCode(64 + Number(value)); }).join('')).join(' ');
    }
    case 'morse': return encode ? morseEncode(input) : morseDecode(input);
    case 'braille': return encode ? brailleEncode(input) : brailleDecode(input);
    case 'bacon': {
      if (encode) { if (/[^A-Za-z\s]/.test(input)) throw new Error('培根编码只接受英文和空格。'); return input.toUpperCase().trim().split(/\s+/).map(word => Array.from(word, ch => (ch.charCodeAt(0) - 65).toString(2).padStart(5, '0').replace(/0/g, 'A').replace(/1/g, 'B')).join(' ')).join(' / '); }
      return input.toUpperCase().trim().split(/\s*\/\s*/).map(word => { const clean = word.replace(/\s/g, ''); if (/[^AB01]/.test(clean) || clean.length % 5) throw new Error('培根密码需要五位 A/B 或 0/1 字符组。'); return (clean.match(/.{5}/g) || []).map(x => { const n = parseInt(x.replace(/A/g, '0').replace(/B/g, '1'), 2); if (n > 25) throw new Error('当前使用 26 字母版培根密码。'); return String.fromCharCode(65 + n); }).join(''); }).join(' ');
    }
    case 'xor': { const bytes = encode ? utf8(input) : hexToBytes(input), k = utf8(String(params.key || '')); if (!k.length) throw new Error('XOR 密钥不能为空。'); const result = bytes.map((b, i) => b ^ k[i % k.length]); return encode ? bytesToHex(result) : textFromBytes(result); }
    case 'reverse': return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(input), item => item.segment).reverse().join('');
    case 'frequency': return JSON.stringify(analyzeText(input), null, 2);
    case 'invisible': { const found = inspectInvisible(input); return found.length ? found.map(x => `位置 ${x.index}  ${x.code}  ${x.name}`).join('\n') : '没有检测到已收录的不可见字符或方向控制符。'; }
    case 'unicode': {
      if (encode) return Array.from(input, ch => 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
      return input.trim().split(/\s+/).filter(Boolean).map(value => { if (!/^(?:U\+)?[\da-f]{1,6}$/i.test(value)) throw new Error('码位格式示例：U+0041 U+1F50D。'); const n = parseInt(value.replace(/^U\+/i, ''), 16); if (n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) throw new Error('码位超出有效范围。'); return String.fromCodePoint(n); }).join('');
    }
    case 'sha256': case 'sha512': {
      if (!globalThis.crypto?.subtle) throw new Error('哈希功能需要 HTTPS 或 localhost。');
      return bytesToHex(new Uint8Array(await crypto.subtle.digest(id === 'sha256' ? 'SHA-256' : 'SHA-512', utf8(input)))).replace(/ /g, '');
    }
  }
}
export async function runPipeline(input, steps) {
  if (!Array.isArray(steps) || steps.length > 12) throw new Error('处理链最多包含 12 个步骤。');
  const results = []; let value = input;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    try { value = await transform(step.id, value, step.mode, step.params); }
    catch (error) { throw new Error(`第 ${i + 1} 步「${getTool(step.id).name}」：${error.message}`); }
    results.push({ id: step.id, output: value });
  }
  return { output: value, results };
}
