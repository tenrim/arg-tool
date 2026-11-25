import { parserError } from './expected-errors.js';
import { PUZZLE_PROFILES, puzzleOptions } from './puzzle-profiles.js';
import { decodeBytes } from '../completion/bytes.js';
import { integerCode, keyboardCode } from '../completion/codes.js';
import { extendedInteger } from '../completion/numerals.js';
import { runKeyboard } from '../expansion/keyboard-core.js';
import { runClassical } from '../expansion/classical-core.js';
import { transform } from '../engine.js';
import { fail, errorRecord } from './data.js';
import { extractAnswer } from '../hunt-extract.js';

const readable = (text) =>
  text.length > 0 && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd]/u.test(text);
let table;
async function describeCharacters(text) {
  if (!table) {
    const { characterModel } = await import('../character-tables/model.js');
    const response = await fetch(
      new URL('../vendor/character-tables/characters.json', import.meta.url),
    );
    if (!response.ok) fail('ENGINE_UNAVAILABLE', '字符表载入失败。');
    table = characterModel(await response.json());
  }
  const lines = [];
  for (const char of new Set(text)) {
    if (char.codePointAt(0) < 128 || !table.hasCodePoint(char.codePointAt(0))) continue;
    const row = table.record(char);
    lines.push(
      [
        row.codes,
        row.display,
        row.points[0][3],
        row.name,
        row.numericValues[0] == null ? '' : '数值 ' + row.numericValues[0],
      ]
        .filter(Boolean)
        .join(' · '),
    );
  }
  return lines.join('\n');
}
async function run(profile, text, options) {
  let output;
  if (profile.engine === 'bytes') {
    const bytes = decodeBytes(text, options.codec);
    try {
      output = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
      if (readable(output)) return { type: 'text', text: output };
    } catch {
      /* Preserve bytes, including compression wrappers. */
    }
    return { type: 'bytes', bytes };
  }
  if (profile.engine === 'integer')
    output = ['fibonacci', 'gamma', 'delta'].includes(options.codec)
      ? integerCode(text, options.codec, 'decode')
      : extendedInteger(text, options.codec, 'decode', options);
  else if (profile.engine === 'engine')
    output = await transform(options.id, text, 'decode', options);
  else if (profile.engine === 'extract')
    output = extractAnswer(text, options.mode, options.indices || '1');
  else if (profile.engine === 'character-table') output = await describeCharacters(text);
  else if (profile.engine === 'marine') {
    const { flagGroups } = await import('../completion/marine.js');
    output = flagGroups(text, options)
      .map((group) => group.text)
      .join('\n');
  } else if (profile.engine === 'hanzi') {
    if (options.mode === 'telegraph') {
      const response = await fetch(
        new URL('../vendor/round1/telegraph/data/' + options.table + '.json', import.meta.url),
      );
      if (!response.ok) fail('ENGINE_UNAVAILABLE', '完整电码表加载失败。');
      const table = await response.json();
      output = text
        .trim()
        .split(/[\s,，]+/)
        .map((code) => {
          if (!/^\d{4}$/.test(code)) fail('INPUT_INVALID', '电报码应为四位数字。');
          const matches = table.filter((row) => row.code === code).map((row) => row.character);
          return code + ' → ' + (matches.join('/') || '未收录');
        })
        .join('\n');
    } else if (['simplified', 'traditional'].includes(options.mode)) {
      const opencc = await import('../vendor/round1/opencc-js/full.js');
      output = opencc.Converter({
        from: options.mode === 'simplified' ? 't' : 'cn',
        to: options.mode === 'simplified' ? 'cn' : 't',
      })(text);
    } else {
      const { pinyin } = await import('../vendor/round1/pinyin-pro/dist/index.mjs');
      output = pinyin(
        text,
        options.mode === 'pinyin' ? {} : { pattern: options.mode, toneType: 'none' },
      );
    }
  } else if (profile.engine === 'mapping') {
    const result = runKeyboard(options.mapping === 'ninekey' ? 'ninekey' : 'qwerty', text, {
      ...options,
      unknown: 'reject',
      ambiguity: 'all',
    });
    if (!result.details.matched) fail('INPUT_INVALID', '没有匹配的映射项。');
    output = result.text;
  } else if (profile.engine === 'keyboard') output = keyboardCode(text, options.mode, 'decode');
  else if (profile.engine === 'classical')
    output = runClassical(options.cipher, text, options).text;
  else fail('UNSUPPORTED', '此操作由原专用 Worker 执行。');
  if (typeof output !== 'string') fail('EXECUTION_FAILED', '原工具没有返回文本。');
  return { type: 'text', text: output };
}
self.onmessage = async ({ data }) => {
  try {
    if (typeof data.text !== 'string' || data.text.length > 65536)
      fail('INPUT_INVALID', '文本超过 64 KB。');
    if (data.id === 'affine-probe') {
      const { chi } = await import('../round1/analysis-engine.js');
      const rows = [];
      for (const a of [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25])
        for (let b = 0; b < 26; b++) {
          const text = await transform('affine', data.text, 'decode', { a, b });
          rows.push({ a, b, score: chi(text), ...(data.includeText ? { text } : {}) });
        }
      rows.sort((a, b) => a.score - b.score);
      self.postMessage({ result: rows });
      return;
    }
    if (data.id === 'vigenere-probe') {
      const { analyze } = await import('../round1/analysis-engine.js');
      self.postMessage({ result: analyze(data.text).periods });
      return;
    }
    if (data.id === 'affine-run') {
      const artifact = {
        type: 'text',
        text: await transform('affine', data.text, 'decode', data.options),
      };
      self.postMessage({ result: { artifact } });
      return;
    }
    const profile = PUZZLE_PROFILES.find((item) => item.id === data.id);
    if (!profile) fail('UNSUPPORTED', '未登记的文字操作。');
    const options = puzzleOptions(profile, String(data.key || ''), data.options || {});
    if (profile.needsKey && !options[profile.keyField])
      fail('INTERACTION_REQUIRED', '此密码需要密钥。');
    const artifact = await run(profile, data.text, options);
    // Keep original bytes for strict charset decoding, not only compressed data.
    const eligible =
      artifact.type === 'text'
        ? readable(artifact.text) && artifact.text !== data.text
        : artifact.bytes.length > 0;
    self.postMessage({ result: { artifact, eligible, options } });
  } catch (error) {
    self.postMessage({ error: errorRecord(parserError(error)) });
  }
};
