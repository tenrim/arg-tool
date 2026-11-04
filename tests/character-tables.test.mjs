import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { characterModel, codePoints, exportCharacters } from '../public/character-tables/model.js';
import { LANGUAGES, viewsFor } from '../public/character-tables/catalog.js';
import { EXTRA_REPERTOIRES } from '../public/character-tables/repertoires.js';
import { GUIDE_SITES, findGuideSites } from '../public/external-guide/catalog.js';
const data = JSON.parse(
    await readFile(
      new URL('../public/vendor/character-tables/characters.json', import.meta.url),
      'utf8',
    ),
  ),
  model = characterModel(data);

test('selected scripts exactly cover UCD Script and Script_Extensions, including supplementary code points', async () => {
  const shorts = {
    Hira: 'Hiragana',
    Kana: 'Katakana',
    Hang: 'Hangul',
    Grek: 'Greek',
    Cyrl: 'Cyrillic',
    Hebr: 'Hebrew',
    Arab: 'Arabic',
    Thai: 'Thai',
    Deva: 'Devanagari',
  };
  for (const [, , , short] of EXTRA_REPERTOIRES) assert(!shorts[short]);
  Object.assign(
    shorts,
    Object.fromEntries(EXTRA_REPERTOIRES.map(([, , script, short]) => [short, script])),
  );
  const expected = Object.fromEntries(Object.values(shorts).map((name) => [name, new Set()]));
  for (const [path, extensions] of [
    ['../upstream/reference/sources/Scripts.txt', false],
    ['../upstream/character-tables/ScriptExtensions.txt', true],
  ]) {
    const text = await readFile(new URL(path, import.meta.url), 'utf8');
    for (const line of text.split('\n')) {
      const m = /^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s*;\s*([^#]+)/.exec(line);
      if (!m) continue;
      const names = extensions
        ? m[3]
            .trim()
            .split(/\s+/)
            .map((n) => shorts[n])
        : [m[3].trim()];
      for (const name of names)
        if (expected[name])
          for (let cp = parseInt(m[1], 16); cp <= parseInt(m[2] || m[1], 16); cp++)
            expected[name].add(cp);
    }
  }
  for (const [name, points] of Object.entries(expected))
    assert.deepEqual(new Set(data.scriptSets[name]), points, name + ' full scope');
  assert.equal(model.search('ja', 'hiragana', 'U+1B001')[0].text, '𛀁');
  assert(model.search('ja', 'katakana', 'U+30FC').length);
  assert(model.search('ja', 'hiragana', 'U+30FC').length);
});
test('CLDR raw sets and pinned input hashes remain intact', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('../upstream/character-tables/PINS.json', import.meta.url), 'utf8'),
  );
  for (const source of manifest.sources) {
    const bytes = await readFile(
      new URL('../upstream/character-tables/' + source.path, import.meta.url),
    );
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256);
  }
  for (const lang of LANGUAGES) {
    if (!lang.source) {
      const raw = JSON.parse(
        await readFile(
          new URL('../upstream/character-tables/' + lang.id + '.json', import.meta.url),
          'utf8',
        ),
      );
      for (const [key, value] of Object.entries(data.exemplars[lang.id]))
        assert.equal(value, raw.main[lang.id].characters[key] || '[]');
    }
    for (const [view] of viewsFor(lang)) {
      const entries = model.entries(lang.id, view);
      if (view === 'numbers') assert(entries.every((r) => r.numericValues.some((v) => v !== null)));
      else assert(entries.length > 0, lang.id + '/' + view);
    }
  }
});

test('complete numeric property includes Unihan and preserves exact signed fractions and large integers', async () => {
  const source = await readFile(
      new URL('../upstream/character-tables/DerivedNumericValues.txt', import.meta.url),
      'utf8',
    ),
    expected = new Map();
  for (const line of source.split('\n')) {
    const match = /^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s*;[^;]*;[^;]*;\s*([^#\s]+)/.exec(line);
    if (match)
      for (let cp = parseInt(match[1], 16); cp <= parseInt(match[2] || match[1], 16); cp++)
        expected.set(cp, match[3]);
  }
  const actual = new Map(
    model.entries('numbers', 'all').map((r) => [r.points[0][0], r.numericValues[0]]),
  );
  assert.deepEqual(actual, expected);
  assert.equal(actual.size, 2023);
  for (const [char, value] of [
    ['⅓', '1/3'],
    ['༳', '-1/2'],
    ['億', '100000000'],
    ['𠀁', '7'],
    ['𝋠', '0'],
    ['Ⅻ', '12'],
  ])
    assert.equal(model.record(char).numericValues[0], value, char);
  assert.equal(model.entries('numbers', 'decimal').length, 770);
  assert.equal(model.entries('numbers', 'mayan').length, 20);
  assert(model.search('numbers', 'all', '数值:1/3').some((r) => r.text === '⅓'));
  assert(model.search('numbers', 'all', 'value:-1/2').some((r) => r.text === '༳'));
  const exported = exportCharacters(model.entries('numbers', 'all'), {
    language: 'numbers',
    view: 'all',
    query: '',
  });
  assert.equal(exported.records.length, 2023);
  assert.equal(exported.records.find((r) => r.text === '⅓').points[0].numericValue, '1/3');
  assert.equal(model.search('th', 'numbers', 'U+0E51')[0].text, '๑');
  assert.equal(
    model.entries('he', 'numbers').length,
    0,
    'Unicode numeric property does not invent Hebrew gematria values',
  );
});

test('new script choices contain their full registered sets and remain distinct from CLDR exemplars', () => {
  assert.equal(EXTRA_REPERTOIRES.length, 29);
  assert.equal(LANGUAGES.length, 38);
  for (const [id, , script] of EXTRA_REPERTOIRES) {
    assert.deepEqual(
      model.entries(id, 'script').map((r) => r.points[0][0]),
      data.scriptSets[script],
    );
    assert(!viewsFor(LANGUAGES.find((l) => l.id === id)).some(([view]) => view === 'common'));
  }
  assert.equal(model.search('runic', 'script', 'U+16A0')[0].text, 'ᚠ');
  assert.equal(model.search('bengali', 'numbers', 'U+09E7')[0].text, '১');
});
test('all modern Hangul syllables and script alternatives have their exact names', () => {
  const syllables = model.entries('ko', 'syllables');
  assert.equal(syllables.length, 11172);
  assert.equal(syllables[0].text, '가');
  assert.equal(syllables.at(-1).text, '힣');
  assert.equal(syllables[0].name, 'HANGUL SYLLABLE GA');
  assert.equal(syllables.at(-1).name, 'HANGUL SYLLABLE HIH');
  assert.equal(model.search('ko', 'compat', 'U+3131')[0].text, 'ㄱ');
  assert.equal(model.search('ko', 'jamo', 'U+1100')[0].text, 'ᄀ');
  assert.equal(new Set(syllables.map((r) => r.text)).size, 11172);
});
test('mark display, RTL and multi-codepoint exemplars never change copied/exported text', () => {
  const mark = model.search('ar', 'common', 'U+064E')[0];
  assert.equal(mark.text, 'َ');
  assert.equal(mark.display, '◌َ');
  const sequence = model.search('ru', 'auxiliary', 'а́')[0];
  assert.equal(sequence.codes, 'U+0430 U+0301');
  assert.equal(codePoints('𛀁'), 'U+1B001');
  const exported = exportCharacters(model.entries('ko', 'syllables'), {
    language: 'ko',
    view: 'syllables',
    query: '',
  });
  assert.equal(exported.records.length, 11172);
  assert.equal(exported.records.at(-1).text, '힣');
  assert.equal(model.entries('ru', 'common').length, 66);
  assert.equal(model.search('ru', 'common', 'U+042C')[0].text, 'Ь');
  assert.equal(model.search('hi', 'all', '<script>').length, 0);
});
test('pudone is a discoverable external link, not an installed dependency', () => {
  const site = GUIDE_SITES.find((s) => s.id === 'P27');
  assert.equal(site.url, 'https://pudone.com/');
  assert.equal(site.category, 'other');
  assert.deepEqual(
    findGuideSites('', 'pudone', 'other').map((s) => s.id),
    ['P27'],
  );
});

test('character table has its real capability, help, authored knowledge and actual sources', async () => {
  const [{ createRegistry }, { ARTICLES }, { guides }, { TASK_PROJECT_SOURCES }] =
    await Promise.all([
      import('../public/capabilities/registry.js'),
      import('../public/knowledge/content.js'),
      import('../public/tool-help.js'),
      import('../public/project-source-contracts.js'),
    ]);
  const catalogue = JSON.parse(
    await readFile(new URL('../public/vendor/cyberchef/catalogue.json', import.meta.url), 'utf8'),
  );
  const registry = createRegistry(catalogue);
  assert(registry.entries.some((e) => e.id === 'native:character-tables'));
  const article = ARTICLES.find((a) => a.id === 'function-native:character-tables');
  assert(article.preface.length);
  assert.equal(article.capabilityIds[0], 'native:character-tables');
  assert(guides['character-tables'].steps.length);
  assert(
    TASK_PROJECT_SOURCES['native:character-tables'] || TASK_PROJECT_SOURCES['character-tables'],
  );
});
