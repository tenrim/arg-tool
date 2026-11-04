import { LANGUAGES, viewsFor } from './catalog.js';

export const codePoints = (text) =>
  Array.from(text, (c) => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(
    ' ',
  );
const scriptNames = {
  ...Object.fromEntries(LANGUAGES.filter((l) => l.script).map((l) => [l.script, l.title])),
  Hiragana: '平假名',
  Katakana: '片假名',
  Hangul: '韩文',
  Greek: '希腊',
  Cyrillic: '西里尔',
  Hebrew: '希伯来',
  Arabic: '阿拉伯',
  Thai: '泰文',
  Devanagari: '天城文',
  Han: '汉字',
  Common: '通用',
  Inherited: '继承',
};
const categoryNames = {
  Lu: '大写字母',
  Ll: '小写字母',
  Lt: '首字母大写',
  Lm: '修饰字母',
  Lo: '其他字母',
  Mn: '组合标记',
  Mc: '占位组合标记',
  Me: '包围标记',
  Nd: '十进制数字',
  Nl: '字母数字',
  No: '其他数字',
  Cf: '格式字符',
  Po: '标点',
  Ps: '开标点',
  Pe: '闭标点',
  Sk: '修饰符号',
  So: '其他符号',
  Sm: '数学符号',
  Sc: '货币符号',
  Zs: '空格',
};
export function characterModel(data) {
  if (
    data.ucdVersion !== '17.0.0' ||
    data.cldrVersion !== '48.2.0' ||
    !Array.isArray(data.rows) ||
    !data.languages
  )
    throw Error('字符资料版本或结构不匹配。');
  const byPoint = new Map(data.rows.map((row) => [row[0], row]));
  const record = (text) => {
    const points = Array.from(text, (c) => byPoint.get(c.codePointAt(0)));
    if (points.some((p) => !p)) throw Error('字符资料缺少码位。');
    const name = points.map((p) => p[1]).join(' + '),
      codes = codePoints(text),
      categories = points.map((p) => categoryNames[p[2]] || p[2]);
    const invisible = points.every((p) => /^[CZ]/.test(p[2]));
    const numericValues = points.map((p) => p[5] ?? null);
    return {
      text,
      points,
      name,
      codes,
      categories,
      numericValues,
      display: invisible ? '空白' : (/^M/.test(points[0][2]) ? '◌' : '') + text,
      search: [
        text,
        name,
        codes,
        ...categories,
        ...points.flatMap((p) => [p[3], scriptNames[p[3]] || '', p[4]]),
      ]
        .join(' ')
        .toLocaleLowerCase(),
    };
  };
  const cache = new Map();
  function entries(language, view) {
    const definition = LANGUAGES.find((l) => l.id === language);
    if (!definition || !viewsFor(definition).some((v) => v[0] === view))
      throw Error('未知字符分组。');
    const key = language + ':' + view;
    if (cache.has(key)) return cache.get(key);
    const source = data.languages[language];
    let texts;
    if (language === 'ja' && view === 'kana')
      texts = source.common.filter((text) =>
        Array.from(text).some(
          (c) => ['Hiragana', 'Katakana'].includes(byPoint.get(c.codePointAt(0))[3]) || c === 'ー',
        ),
      );
    else if (language === 'ja' && view === 'han')
      texts = [...new Set([...source.common, ...source.auxiliary])].filter((text) =>
        Array.from(text).some((c) => byPoint.get(c.codePointAt(0))[3] === 'Han'),
      );
    else if (['hiragana', 'katakana'].includes(view))
      texts = data.scriptSets[view === 'hiragana' ? 'Hiragana' : 'Katakana'].map((cp) =>
        String.fromCodePoint(cp),
      );
    else if (view === 'compat')
      texts = source.script
        .filter((cp) => cp >= 0x3130 && cp <= 0x318f)
        .map((cp) => String.fromCodePoint(cp));
    else if (view === 'jamo')
      texts = source.script
        .filter((cp) =>
          ['Hangul Jamo', 'Hangul Jamo Extended-A', 'Hangul Jamo Extended-B'].includes(
            byPoint.get(cp)[4],
          ),
        )
        .map((cp) => String.fromCodePoint(cp));
    else if (view === 'syllables')
      texts = Array.from({ length: 11172 }, (_, i) => String.fromCodePoint(0xac00 + i));
    else
      texts =
        view === 'script' ? source.script.map((cp) => String.fromCodePoint(cp)) : source[view];
    const result = texts.map(record);
    cache.set(key, result);
    return result;
  }
  function search(language, view, query = '') {
    const rows = entries(language, view),
      value = query.trim();
    if (!value) return rows;
    const numericQuery = /^(?:数值|value)\s*[:=：]\s*(-?\d+(?:\/\d+)?)$/i.exec(value);
    if (numericQuery) return rows.filter((r) => r.numericValues.includes(numericQuery[1]));
    const points = /^(?:U\+|0x)([0-9a-f]{1,6})$/i.exec(value);
    if (points) {
      const cp = parseInt(points[1], 16);
      return rows.filter((r) => r.points.some((p) => p[0] === cp));
    }
    const exact = rows.filter((r) => r.text === value);
    if (exact.length) return exact;
    const terms = value.toLocaleLowerCase().split(/\s+/);
    return rows.filter((r) => terms.every((t) => r.search.includes(t)));
  }
  return { entries, search, record };
}
export function exportCharacters(rows, { language, view, query }) {
  return {
    format: 'mist-character-table',
    ucdVersion: '17.0.0',
    cldrVersion: '48.2.0',
    language,
    view,
    query,
    sources: [
      'https://github.com/unicode-org/unicodetools',
      'https://github.com/unicode-org/cldr-json',
    ],
    records: rows.map(({ text, codes, name, points }) => ({
      text,
      codes,
      name,
      points: points.map(([codePoint, name, category, script, block, numericValue]) => ({
        codePoint,
        name,
        category,
        script,
        block,
        numericValue: numericValue ?? null,
      })),
    })),
  };
}
