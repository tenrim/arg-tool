import buddhaMap from '../vendor/fun-tools/buddha-map.js';
import { encode, decode } from '../vendor/fun-tools/beast.js';
const utf8 = new TextEncoder();
// Exact port: hidden_watermark/src/text_wm.rs and CryptTool 0.1.4
// rust/crypt_tool/src/{rng,cipher,binary_converter}.rs. MIT; fixed snapshots retained.
export function watermark(text, options) {
  const {
    direction,
    password = '',
    secret = '',
    position = 'random',
    index = 0,
    zero = '\u2060',
    one = '\ufeff',
  } = options;
  if ([...zero].length !== 1 || [...one].length !== 1 || zero === one)
    throw Error('水印需使用两个不同的 Unicode 字符。');
  const clean = [...text].filter((c) => c !== zero && c !== one).join('');
  if (direction === 'remove') return clean;
  let state = 0;
  for (const byte of utf8.encode(password)) state = (Math.imul(state, 31) + byte) >>> 0;
  const crypt = (bytes) =>
    Uint8Array.from(bytes, (byte) => {
      state = (Math.imul(state, 1664525) + 1013904223) & 0x7fffffff;
      return byte ^ (state & 255);
    });
  if (direction === 'decode') {
    const chars = [...text];
    const start = chars.findIndex((c) => c === zero || c === one);
    if (start < 0) throw Error('未找到所选格式的水印字符。');
    const bits = [];
    for (let i = start; i < chars.length && (chars[i] === zero || chars[i] === one); i++)
      bits.push(chars[i] === one ? 1 : 0);
    if (bits.length % 8) throw Error('水印位数不是完整字节，内容可能已损坏。');
    const bytes = new Uint8Array(bits.length / 8);
    bits.forEach((bit, i) => (bytes[i >> 3] |= bit << (7 - (i % 8))));
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(crypt(bytes));
    } catch {
      throw Error('密码不匹配、字符设置错误或水印已损坏。');
    }
  }
  if (direction !== 'encode') throw Error('未知方向。');
  const mark = [...crypt(utf8.encode(secret))]
    .map((byte) =>
      byte
        .toString(2)
        .padStart(8, '0')
        .replace(/[01]/g, (c) => (c === '1' ? one : zero)),
    )
    .join('');
  const chars = [...clean];
  let at = chars.length;
  if (position === 'index') {
    if (!Number.isInteger(index) || index < 0 || index > chars.length)
      throw Error('插入位置超出文本字符范围。');
    at = index;
  } else if (position === 'random')
    at =
      chars.length > 1
        ? 1 + (crypto.getRandomValues(new Uint32Array(1))[0] % (chars.length - 1))
        : 0;
  else if (position !== 'end') throw Error('未知插入位置。');
  return chars.slice(0, at).join('') + mark + chars.slice(at).join('');
}
export function textTransform(task, text, options, libraries = globalThis) {
  const limit = options.direction === 'encode' ? 1_000_000 : 16_000_064;
  if (text.length > limit || (options.secret || '').length > 250_000)
    throw Error('文本超过本地处理上限：编码 100 万字符，解码 1600 万字符，秘密内容 25 万字符。');
  if (task === 'beast-codec')
    return options.direction === 'decode'
      ? decode(text, { alphabet: options.alphabet })
      : encode(text, { alphabet: options.alphabet, framed: options.framed });
  if (task === 'text-steganography') {
    if (options.engine === 'watermark') return watermark(text, options);
    const engine = new libraries.StegCloak(options.encrypt, options.integrity);
    if (options.direction === 'decode') return engine.reveal(text, options.password);
    if (!text.includes(' ')) throw Error('StegCloak 掩护文本至少需要两个由空格分隔的词。');
    return engine.hide(options.secret, options.password, text);
  }
  if (task !== 'buddha-codec') throw Error('未知文字工具。');
  const C = libraries.CryptoJS,
    key = options.password || 'takuron.top';
  if (!text) throw Error('请输入待处理内容。');
  if (options.direction === 'encode') {
    const table = new Map(buddhaMap);
    return (
      '佛又曰：' +
      [...C.AES.encrypt(text, key).toString().slice(10)].map((c) => table.get(c) || c).join('')
    );
  }
  if (!text.startsWith('佛又曰：')) throw Error('需要以“佛又曰：”开头的 Takuron V2 密文。');
  const table = new Map(buddhaMap.map(([a, b]) => [b, a]));
  const body = [...text.slice(4)];
  if (body.some((c) => !table.has(c))) throw Error('密文含不属于佛又曰 V2 的字符。');
  try {
    const result = C.AES.decrypt(
      'U2FsdGVkX1' + body.map((c) => table.get(c)).join(''),
      key,
    ).toString(C.enc.Utf8);
    if (!result) throw Error('empty');
    return result;
  } catch {
    throw Error('密码不匹配或密文已损坏。');
  }
}
