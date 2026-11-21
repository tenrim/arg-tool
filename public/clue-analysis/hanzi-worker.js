// The bundled cnchar UMD library is isolated from the application and notebook.
self.window = self;
importScripts('../vendor/hanzi-full/cnchar-all.js');
let componentDictionary;
async function loadComponentDictionary() {
  if (componentDictionary) return componentDictionary;
  const response = await fetch('../vendor/round1/makemeahanzi/dictionary.txt');
  if (!response.ok) throw Error('完整部件字库载入失败。');
  const rows = (await response.text()).trim().split('\n');
  const dictionary = new Map();
  for (const line of rows) {
    const row = JSON.parse(line);
    dictionary.set(row.character, row);
  }
  componentDictionary = dictionary;
  return dictionary;
}
self.onmessage = async ({ data }) => {
  try {
    const { text, mode } = data;
    if (typeof text !== 'string' || !text.trim() || text.length > 2000)
      throw Error('汉字分析接受 1–2000 个字符。');
    const cc = self.cnchar;
    let output;
    if (mode === 'properties' || mode === 'component') {
      const dict = await loadComponentDictionary();
      if (mode === 'component') {
        const { componentMatches } = await import('../round1/hanzi-components.js');
        output = componentMatches(dict, text).join(' ');
      } else {
        const { pinyin } = await import('../vendor/round1/pinyin-pro/dist/index.mjs');
        const characters = [...text].filter((character) => /\p{Script=Han}/u.test(character));
        const readings = pinyin(characters.join(''), { type: 'array', toneType: 'num' });
        output = characters
          .map((character, index) => {
            const code = cc.code(character)[0] || {};
            return [
              `${character}　${readings[index]}　${cc.stroke(character)} 笔`,
              '部首：' + (cc.radical(character)[0]?.radical || '未收录'),
              '笔顺：' + (cc.stroke(character, 'order', 'name')[0]?.join(' → ') || '未收录'),
              '结构：' + (dict.get(character)?.decomposition || '未收录'),
              '四角：' + (code.sijiao || '未收录'),
              '仓颉：' + (code.cangjie || '未收录'),
              '五笔：' + ((cc.code.fiveStroke(character) || []).join('/') || '未收录'),
              '码点：U+' + character.codePointAt(0).toString(16).toUpperCase(),
            ].join('\n');
          })
          .join('\n\n');
      }
    } else if (mode === 'sound') {
      const value = text.normalize('NFC').toLowerCase();
      output = [
        ...new Set(
          cc.spellToWord(
            value,
            ...(/[0-5āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/u.test(value) ? [] : ['alltone']),
          ),
        ),
      ].join(' ');
    } else if (mode === 'stroke') {
      const count = Number(text);
      if (!Number.isInteger(count) || count < 1 || count > 64) throw Error('笔画数须为 1–64。');
      output = [...new Set([...cc.strokeToWord(count), ...cc.strokeToWord(count, 'trad')])].join(
        ' ',
      );
    } else if (mode === 'idiom') {
      const pattern = [...text];
      output = (
        /[?？]/.test(text)
          ? cc
              .idiom(
                pattern.map((character) => (/[?？]/.test(character) ? '' : character)),
                'char',
              )
              .filter((word) => [...word].length === pattern.length)
          : cc.idiom(text)
      ).join('\n');
    } else if (mode === 'xhy') output = cc.xhy(text, 'fuzzy').join('\n');
    else if (mode === 'four' || mode === 'cangjie') {
      const entries = Object.entries({ ...cc.code.dict.code, ...cc.trad.dict.code });
      output = text
        .trim()
        .split(/\s+/)
        .map((token) => {
          const query = token.toUpperCase();
          if (!(mode === 'four' ? /^\d{4,5}$/ : /^[A-Z]{1,5}$/).test(query))
            throw Error('输入不符合四角／仓颉编码格式。');
          return (
            query +
            ' → ' +
            (entries
              .filter(([, row]) => {
                const code = row.split(' ')[mode === 'four' ? 0 : 1];
                return mode === 'four' && query.length === 4
                  ? code.startsWith(query)
                  : code === query;
              })
              .map(([character]) => character)
              .join(' ') || '未收录')
          );
        })
        .join('\n');
    } else if (mode === 'wubi') {
      const entries = Object.entries({ ...cc.input.dict.wubi, ...cc.trad.dict.wubi });
      output = text
        .trim()
        .split(/\s+/)
        .map((token) => {
          const query = token.toUpperCase();
          if (!/^[A-Y]{1,4}$/.test(query)) throw Error('五笔编码须为 1–4 个 A–Y 字母。');
          return (
            query +
            ' → ' +
            (entries
              .filter(([, codes]) => codes.split(' ').some((code) => code.startsWith(query)))
              .map(([character, codes]) => character + ' ' + codes.replace(' ', ' / '))
              .join('，') || '未收录')
          );
        })
        .join('\n');
    } else throw Error('未登记的汉字分析操作。');
    self.postMessage({
      result: { artifact: { type: 'text', text: output }, eligible: Boolean(output) },
    });
  } catch (error) {
    self.postMessage({ error: error.message || String(error) });
  }
};
