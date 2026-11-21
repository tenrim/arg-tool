import { BYTE_CODECS } from '../completion/bytes.js';
import { CLASSICAL_CIPHERS } from '../expansion/classical-catalog.js';
import { fail } from './data.js';
import { KEYBOARD_MAPPINGS } from '../expansion/keyboard-core.js';

// Detection and dispatch only. Algorithms and defaults stay with their original owners.
const alpha = (text) => /^[A-Za-z0-9\s.,!?':;()#/_-]+$/.test(text) && /[A-Za-z]{3}/.test(text);
const bits = (text) => /^[01\s]+$/.test(text) && /[01]/.test(text);
const rows = [];
const add = (id, title, capabilityId, engine, options, matches, extra = {}) =>
  rows.push({
    id,
    title,
    capabilityId:
      {
        'native:bacon': 'op:Bacon%20Cipher%20Decode',
        'native:atbash': 'op:Atbash%20Cipher',
        'native:rot47': 'op:ROT47',
        'native:reverse': 'op:Reverse',
        'native:caesar': 'op:ROT13',
        'native:rail': 'op:Rail%20Fence%20Cipher%20Decode',
        'native:vigenere': 'op:Vigen%C3%A8re%20Decode',
      }[capabilityId] || capabilityId,
    engine,
    options,
    matches,
    ...extra,
  });

for (const codec of BYTE_CODECS)
  add(
    'bytes:' + codec,
    codec,
    'native:byte-codecs',
    'bytes',
    { codec },
    (text) => {
      if (
        [
          'unary',
          'unary7',
          'gray',
          'hamming74',
          'excess3',
          'manchester',
          'differential-manchester',
        ].includes(codec)
      )
        return bits(text);
      if (codec === 'base100')
        return [...text].every((c) => c.codePointAt(0) >= 0x1f3f7 && c.codePointAt(0) <= 0x1f4f6);
      if (codec === 'base65536') return /[^\x00-\x7f]/u.test(text);
      if (codec === 'bubblebabble') return /^x[a-z-]+x$/.test(text);
      if (codec === 'crockford32') return /^[0-9a-z-]+$/i.test(text);
      if (codec === 'zbase32') return /^[ybndrfg8ejkmcpqxot1uwisza345h769]+$/.test(text);
      if (codec === 'uuencode' || codec === 'xxencode') return text.includes('\n');
      return /^[\x21-\x7e]+$/.test(text);
    },
    { exploratory: ['base91', 'crockford32', 'zbase32'].includes(codec) },
  );
for (const codec of [
  'fibonacci',
  'negafibonacci',
  'gamma',
  'delta',
  'base26',
  'base26-zero',
  'base37',
  'shadoks',
  'excess3-digits',
  'crockford-integer',
  'crockford-check',
  'gray-integer',
])
  add(
    'integer:' + codec,
    codec + ' 整数',
    'native:integer-codecs',
    'integer',
    { codec },
    (text) => {
      if (codec === 'shadoks') return /^(?:(?:Ga|Bu|Zo|Meu)\s*)+$/i.test(text);
      if (codec.startsWith('base26'))
        return /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/.test(text) && text.length <= 256;
      if (codec === 'base37') return /^\d+$/.test(text) && text.length <= 256;
      if (codec.startsWith('crockford')) return /^[A-Z0-9 *~$=]+$/.test(text) && text.length <= 256;
      return bits(text);
    },
    { exploratory: codec !== 'shadoks' },
  );
for (const [id, title, matches] of [
  ['braille', '六点英文盲文', (text) => /^[\u2800-\u283f\s]+$/.test(text)],
  ['bacon', '培根密码（26 字母）', (text) => /^[AB01\s/]+$/i.test(text)],
  ['a1z26', '字母序号', (text) => /^\d+(?:[-\s,/]+\d+)*$/.test(text)],
  ['unicode', 'Unicode 码点还原', (text) => /^U\+[\da-f]{1,6}(?:\s+U\+[\da-f]{1,6})*$/i.test(text)],
  ['morse', '摩斯码', (text) => /^[.\-\s/]+$/.test(text)],
])
  add(
    'engine:' + id,
    title,
    'native:' + (id === 'unicode' ? 'codepoint' : id),
    'engine',
    { id },
    matches,
  );
for (const [id, title] of [
  ['atbash', 'Atbash'],
  ['rot47', 'ROT47'],
  ['reverse', '倒序文字'],
])
  add(
    'engine:' + id,
    title,
    'native:' + id,
    'engine',
    { id },
    (text) => text.length >= 3 && text.length <= 4096,
    { exploratory: true },
  );
for (let shift = 1; shift < 26; shift++)
  add(
    'caesar:' + shift,
    '凯撒位移 ' + shift,
    'native:caesar',
    'engine',
    { id: 'caesar', shift },
    alpha,
    { exploratory: true },
  );
for (let rails = 2; rails <= 12; rails++)
  add(
    'rail:' + rails,
    '栅栏密码 · ' + rails + ' 栏',
    'native:rail',
    'engine',
    { id: 'rail', rails },
    (text) => alpha(text) && text.length > rails,
    { exploratory: true },
  );
for (const mapping of KEYBOARD_MAPPINGS.filter(
  (item) => !['latin', 'digits', 'elements-legacy'].includes(item.id),
))
  add(
    'mapping:' + mapping.id,
    mapping.label,
    'native:keyboard-' + (mapping.id === 'ninekey' ? 'ninekey' : 'qwerty'),
    'mapping',
    { mapping: mapping.id },
    (text) => text.length <= 4096,
    { exploratory: true },
  );
for (const mode of [
  'coordinates',
  'column-row',
  'shift-left',
  'shift-right',
  'mirror',
  'dvorak',
  'multitap',
])
  add(
    'keyboard:' + mode,
    '键盘 ' + mode,
    'native:keyboard-extra',
    'keyboard',
    { mode },
    (text) =>
      text.length <= 4096 &&
      (['coordinates', 'column-row', 'multitap'].includes(mode)
        ? /^[\d\s,/]+$/.test(text)
        : alpha(text)),
    { exploratory: true },
  );
for (const definition of CLASSICAL_CIPHERS) {
  const options = Object.fromEntries(definition.fields.map((field) => [field.id, field.default]));
  add(
    'classical:' + definition.id,
    definition.label,
    'native:classical-' + definition.id,
    'classical',
    { ...options, cipher: definition.id },
    (text) =>
      definition.id === 'nihilist'
        ? /^[\d\s,]+$/.test(text)
        : definition.id === 'adfgx'
          ? /^[ADFGX\s]+$/i.test(text)
          : definition.id === 'adfgvx'
            ? /^[ADFGVX\s]+$/i.test(text)
            : definition.id === 'columnar'
              ? text.length > 0
              : [...text.toUpperCase()].every(
                  (c) =>
                    /\s/.test(c) ||
                    options.alphabet.includes(c) ||
                    (definition.id === 'playfair' && c === 'J'),
                ),
    {
      exploratory: true,
      needsKey: !['playfair', 'trifid'].includes(definition.id),
      keyField: ['playfair', 'trifid'].includes(definition.id) ? 'squareKey' : 'key',
    },
  );
}
add(
  'vigenere:key',
  'Vigenère（提供的密钥）',
  'native:vigenere',
  'engine',
  { id: 'vigenere' },
  alpha,
  { exploratory: true, needsKey: true, keyField: 'key' },
);
add(
  'beast',
  '兽音译者',
  'native:beast-codec',
  'fun',
  { task: 'beast-codec', alphabet: '嗷呜啊~' },
  (text) => /^[嗷呜啊~]+$/.test(text),
);
add(
  'buddha',
  '佛又曰 V2',
  'native:buddha-codec',
  'fun',
  { task: 'buddha-codec' },
  (text) => text.startsWith('佛又曰：'),
  { passwordField: 'password' },
);
add(
  'watermark',
  '零宽文字水印',
  'native:text-steganography',
  'fun',
  { task: 'text-steganography', engine: 'watermark' },
  (text) => /[\u2060\ufeff]{8}/u.test(text),
  { passwordField: 'password' },
);
add(
  'stegcloak',
  'StegCloak 隐藏文本',
  'native:text-steganography',
  'fun',
  { task: 'text-steganography', engine: 'stegcloak', encrypt: true, integrity: false },
  (text) => /[\u200b-\u200f\u2060-\u2064]{8}/u.test(text),
  { passwordField: 'password' },
);
for (const representation of ['angle', 'clock'])
  add(
    'semaphore:' + representation,
    '旗语 · ' + (representation === 'angle' ? '角度' : '钟面'),
    'native:semaphore-batch',
    'completion',
    { task: 'semaphore-batch', representation },
    (text) => /^[\d.,，\s;；]+$/.test(text) && /\d\s*[,，]\s*\d/.test(text),
  );
add('prussian', '普鲁士光学报码', 'native:prussian', 'completion', { task: 'prussian' }, (text) =>
  /^(?:[abc][1-6])+(?:\s+(?:[abc][1-6])+)*$/i.test(text),
);
add('gs8', 'GS8 八点盲文', 'native:gs8', 'completion', { task: 'gs8', syntax: 'text' }, (text) =>
  /^[\u2800-\u28ff\s]+$/.test(text),
);
add(
  't9',
  'T9 英文词库',
  'native:t9',
  'completion',
  { task: 't9', dictionary: 'standard' },
  (text) => /^[2-9]{2,24}$/.test(text),
  { terminal: true },
);
for (const [mode, title] of [
  ['first', '逐行首字'],
  ['last', '逐行末字'],
  ['transpose', '行列转置'],
  ['index', '各行同一位置'],
  ['indices', '逐行索引'],
])
  add(
    'extract:' + mode,
    title,
    'native:extract-' + ({ index: 'position' }[mode] || mode),
    'extract',
    { mode },
    (text) => text.includes('\n'),
    {
      exploratory: true,
      ...(['index', 'indices'].includes(mode) ? { needsKey: true, keyField: 'indices' } : {}),
    },
  );
for (const [mode, title] of [
  ['anagram', '字母重排'],
  ['wildcard', '通配符查词'],
  ['letters', '限定字母组词'],
  ['fuzzy', '近似英文词'],
  ['contains', '包含片段查词'],
  ['code', '代码筛选词库（需编写条件）'],
])
  add(
    'words:' + mode,
    title,
    'native:words' + (mode === 'anagram' ? '' : '-' + mode),
    'hunt',
    { mode },
    (text) =>
      text.length <= 24 &&
      (mode === 'wildcard'
        ? /^[a-z?*#]+$/i.test(text) && /[?*#]/.test(text)
        : /^[a-z]{3,18}$/i.test(text)),
    {
      exploratory: true,
      terminal: true,
      ...(mode === 'code'
        ? { manual: '需要编写词库筛选函数，请在原代码查词工具中运行；普通密文不是筛选代码。' }
        : {}),
    },
  );
for (const mode of ['wordsearch', 'boggle'])
  add(
    'grid:' + mode,
    mode === 'boggle' ? '转弯找词' : '直线找词',
    'native:' + (mode === 'boggle' ? 'word-boggle' : 'word-grid'),
    'hunt',
    { task: 'wordsearch', mode },
    (text) =>
      /^[A-Za-z\s]+$/.test(text) &&
      text.includes('\n') &&
      text.length <= (mode === 'boggle' ? 120 : 3700),
    { exploratory: true, terminal: true },
  );
add(
  'substitution',
  '英文单表替换求解',
  'native:substitution',
  'substitution',
  {},
  (text) => alpha(text) && text.replace(/[^A-Za-z]/g, '').length >= 30 && text.length <= 4000,
  { exploratory: true },
);
for (const codec of ['aaencode', 'jjencode'])
  add(
    codec,
    codec + ' 还原',
    'native:byte-codecs',
    'completion',
    { task: 'byte-codecs', codec, format: 'utf8' },
    (text) => (codec === 'aaencode' ? /ﾟωﾟ|ﾟДﾟ/.test(text) : /\$=~\[\]/.test(text)),
  );
for (const [mode, title] of [
  ['pinyin', '汉字拼音'],
  ['initial', '拼音声母'],
  ['final', '拼音韵母'],
  ['first', '拼音首字母'],
  ['simplified', '转简体'],
  ['traditional', '转繁体'],
])
  add(
    'hanzi:' + mode,
    title,
    'native:' + (['simplified', 'traditional'].includes(mode) ? 'hanzi-' + mode : 'hanzi-pinyin'),
    'hanzi',
    { mode },
    (text) => /\p{Script=Han}/u.test(text) && text.length <= 2000,
    { exploratory: true },
  );
for (const table of ['cn', 'tw'])
  add(
    'telegraph:' + table,
    '中文电报码 · ' + (table === 'cn' ? '大陆' : '台湾'),
    'native:hanzi-telegraph',
    'hanzi',
    { mode: 'telegraph', table },
    (text) => /^\d{4}(?:[\s,，]+\d{4})*$/.test(text),
    { terminal: true },
  );
add(
  'words:regex',
  '英文正则查词',
  'native:words-regex',
  'hunt',
  { mode: 'regex' },
  (text) => text.length <= 180 && /^\^.*\$$/.test(text),
  { terminal: true, exploratory: true },
);
add(
  'words:chinese',
  '中文词语模式',
  'native:words-chinese',
  'hunt',
  { task: 'chinese' },
  (text) => text.length <= 180 && /\p{Script=Han}/u.test(text) && /[?？*]/.test(text),
  { terminal: true, exploratory: true },
);
add(
  'dictionary-substitution',
  '词库约束单表替换',
  'native:dictionary-substitution',
  'dictionary-substitution',
  { dataset: 'standard', maxSolutions: 20, timeoutMs: 9000, threshold: 10 },
  (text) => alpha(text) && text.trim().includes(' ') && text.length <= 1000,
  { exploratory: true, terminal: true },
);

for (const [mode, title, matches] of [
  ['properties', '汉字完整属性', (text) => /\p{Script=Han}/u.test(text) && text.length <= 2000],
  ['component', '汉字部件反查', (text) => /^\p{Script=Han}{1,4}$/u.test(text)],
  ['sound', '拼音反查汉字', (text) => /^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]{1,8}[0-5]?$/i.test(text)],
  ['stroke', '笔画数反查', (text) => /^\d{1,2}$/.test(text) && +text >= 1 && +text <= 64],
  ['four', '四角号码反查', (text) => /^\d{4,5}(?:\s+\d{4,5})*$/.test(text)],
  ['cangjie', '仓颉码反查', (text) => /^[A-Za-z]{1,5}(?:\s+[A-Za-z]{1,5})*$/.test(text)],
  ['wubi', '五笔码反查', (text) => /^[A-Ya-y]{1,4}(?:\s+[A-Ya-y]{1,4})*$/.test(text)],
  ['idiom', '成语模式查询', (text) => /^[\p{Script=Han}?？]{2,8}$/u.test(text)],
  [
    'xhy',
    '歇后语查询',
    (text) => /\p{Script=Han}/u.test(text) && text.length >= 2 && text.length <= 30,
  ],
])
  add(
    'hanzi-lookup:' + mode,
    title,
    'native:' +
      ({ properties: 'hanzi', four: 'hanzi-code', idiom: 'hanzi-idiom', xhy: 'hanzi-xhy' }[mode] ||
        'hanzi-' + mode),
    'hanzi-lookup',
    { mode },
    matches,
    { terminal: true, exploratory: true },
  );

export const PUZZLE_PROFILES = Object.freeze(rows.map(Object.freeze));
export function puzzleOptions(profile, key = '', supplied = {}) {
  const fields =
    profile.engine === 'classical'
      ? CLASSICAL_CIPHERS.find((row) => row.id === profile.options.cipher).fields
      : [];
  if (
    !supplied ||
    typeof supplied !== 'object' ||
    Array.isArray(supplied) ||
    Object.keys(supplied).some((name) => !fields.some((field) => field.id === name))
  )
    fail('INPUT_INVALID', '不支持的原工具参数。');
  return {
    ...profile.options,
    direction: ['classical', 'mapping'].includes(profile.engine) ? 'decrypt' : 'decode',
    ...(profile.keyField && key ? { [profile.keyField]: key } : {}),
    ...(profile.passwordField ? { [profile.passwordField]: key } : {}),
    ...supplied,
  };
}
