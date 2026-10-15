// Pure bounded models and geometry; no vendor engine imports in the UI.
export const CATEGORIES = {'zero-width':'零宽字符','space':'特殊空格','bidi':'双向控制符','soft-hyphen':'软连字符','tag-char':'标签字符','variation-selector':'变体选择符','control':'控制字符'};
export function bounded(text) {if (typeof text !== 'string' || new TextEncoder().encode(text).length > 65536) throw Error('输入最多 64 KB。');return text;}
export function squareModel({mode = 'polybius', size = '5', keyword = ''} = {}) {
  if (!['tap','polybius'].includes(mode) || !['5','6'].includes(String(size))) throw Error('方阵设置无效。');
  const width = mode === 'tap' ? 5 : Number(size);
  const base = mode === 'tap' ? 'ABCDEFGHIJLMNOPQRSTUVWXYZ' : width === 5 ? 'ABCDEFGHIKLMNOPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  if(String(keyword).length>64)throw Error('方阵关键词最多64个字符。');
  let key = bounded(String(keyword)).replace(/[a-z]/g,c=>c.toUpperCase()).replace(/\s/g, '');
  if (mode === 'tap') key = '';else if (width === 5) key = key.replaceAll('J','I');
  if ([...key].some(c => !base.includes(c))) throw Error('关键词只能使用方阵内的字母或数字。');
  const alphabet = [...new Set(key + base)].join('');
  return {width, alphabet, cells: [...alphabet].map((letter,i) => ({letter, coordinate: '' + (Math.floor(i / width) + 1) + (i % width + 1)}))};
}
export function parseWords(text, format = 'binary') {
  bounded(text);if (!['binary','decimal','hex'].includes(format)) throw Error('波多码格式无效。');
  const tokens = text.trim() ? text.trim().split(/[\s,;]+/) : [];
  if (tokens.length > 4096) throw Error('最多处理 4096 个五位码字。');
  return tokens.map((s,i) => {
    const valid = format === 'binary' ? /^[01]{5}$/.test(s) : format === 'decimal' ? /^\d{1,2}$/.test(s) : /^(?:0x)?[0-9a-f]{1,2}$/i.test(s);
    const n = parseInt(s, format === 'binary' ? 2 : format === 'decimal' ? 10 : 16);
    if (!valid || n < 0 || n > 31) throw Error(`第 ${i + 1} 个码字无效；每组须表示 0–31，二进制须为五位。`);return n;
  });
}
export function formatWords(words, format = 'binary') {return words.map(n => n.toString(format === 'binary' ? 2 : format === 'decimal' ? 10 : 16).toUpperCase().padStart(format === 'binary' ? 5 : format === 'hex' ? 2 : 1, '0')).join(' ');}
export function tapeSVG(words) {
  if (!Array.isArray(words) || words.length > 4096 || words.some(n => !Number.isInteger(n) || n < 0 || n > 31)) throw Error('纸带码字无效。');
  const columns = Math.min(64, Math.max(1, words.length)), lines = Math.max(1, Math.ceil(words.length / 64));
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${columns * 20 + 24}" height="${lines * 148}" viewBox="0 0 ${columns * 20 + 24} ${lines * 148}"><rect width="100%" height="100%" fill="#e8d7ae"/><title>五位波多码纸带，从上到下 bit4 至 bit0，按行从左到右读取</title>`;
  words.forEach((n,i) => {const x = 22 + i % 64 * 20, top = Math.floor(i / 64) * 148 + 20;for (let bit = 4; bit >= 0; bit--) svg += `<circle cx="${x}" cy="${top + (4-bit)*22}" r="7" fill="${n & 1<<bit ? '#111' : '#c5b48d'}"/>`;svg += `<circle cx="${x}" cy="${top + 110}" r="2" fill="#111"/>`;});return svg + '</svg>';
}
