import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {ARTICLES, getArticle, articlesForGroup, searchArticles, validateKnowledgeArticles} from '../public/knowledge/content.js';
import {capabilityCategories, capabilityGroupDefinitions} from '../public/navigation.js';
import {createRegistry, resolveCapability} from '../public/capabilities/registry.js';
const catalogue = JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json', import.meta.url), 'utf8'));
const registry = createRegistry(catalogue);
const tools = registry.entries.filter(entry => entry.category !== 'knowledge' && entry.listed !== false);
const textOf = article => JSON.stringify(article.sections);
const forTool = id => getArticle('function-' + id);

test('knowledge: every visible function owns one precise lesson, including both directions of each family', () => {
  assert.ok(capabilityCategories.some(category => category.id === 'knowledge'));
  assert.equal(ARTICLES.length, tools.length, 'function coverage, not group introductions');
  assert.equal(new Set(ARTICLES.map(article => article.id)).size, ARTICLES.length);
  for (const entry of tools) {
    const article = forTool(entry.id);
    assert.ok(article, 'Missing function lesson: ' + entry.id);
    assert.deepEqual(article.capabilityIds, [entry.id]);
    assert.equal(article.topicGroup, entry.group);
    assert.equal(article.categoryId, entry.category);
    assert.deepEqual(entry.learningIds, ['learn:' + article.id], 'No unrelated group-wide links: ' + entry.id);
    const registered = registry.byId.get(entry.learningIds[0]);
    assert.equal(registered.open.articleId, article.id);
    assert.ok(registered.relatedIds.includes(entry.id));
    for (const op of entry.sourceOperationIds) assert.equal(registry.byOperation.get(op).learningIds[0], registered.id);
  }
  for (const group of capabilityGroupDefinitions.filter(group => group.category !== 'knowledge')) {
    assert.equal(articlesForGroup(group.id).length, tools.filter(entry => entry.group === group.id).length);
  }
});

test('knowledge: mechanisms and examples cite specific primary documents beside their own sections', async () => {
  for (const article of ARTICLES) {
    assert.doesNotMatch(article.title, /[：:？?⇄]/u, 'Only the basic function name is displayed');
    assert.ok(article.sections.flatMap(section => section.paragraphs).length >= 2, article.id);
    assert.ok(article.sections.flatMap(section => section.examples).length, article.id);
    const sourceMap = new Map(article.sources.map(source => [source.id, source]));
    for (const section of article.sections) {
      assert.ok(section.sourceIds.length, article.id + ' has an unsupported section');
      for (const id of section.sourceIds) assert.ok(sourceMap.has(id));
    }
    for (const source of article.sources) {
      const url = new URL(source.url, 'https://mist.invalid');
      assert.equal(url.protocol, 'https:');
      assert.equal(url.username + url.password, '');
      assert.doesNotMatch(url.hostname, /(?:wikipedia|csdn|cnblogs|baike\.baidu)/i, article.id + ': secondary source presented as primary');
      assert.doesNotMatch(url.pathname, /\/developer\/article\//, 'Vendor community posts are not official documentation');
      if (source.url.startsWith('/')) {
        assert.doesNotMatch(source.url, /(?:^|\/)\.\.(?:\/|$)/);
        await access(new URL('../public' + source.url, import.meta.url));
      }
      assert.ok(source.publisher && source.language && source.title);
    }
    for (const id of article.relatedIds) assert.ok(resolveCapability(registry, id).entry);
  }
});

test('knowledge: content owner rejects missing, unrelated and unsafe citations rather than hiding UI errors', () => {
  const changed = mutation => {const article = structuredClone(ARTICLES[0]);mutation(article);return [article];};
  assert.throws(() => validateKnowledgeArticles(changed(a => {a.sections[0].sourceIds = [];})), /citations/);
  assert.throws(() => validateKnowledgeArticles(changed(a => {a.sections[0].sourceIds = ['missing'];})), /citations/);
  assert.throws(() => validateKnowledgeArticles(changed(a => {a.sources[0].url = 'javascript:alert(1)';})), /unsafe/);
  assert.throws(() => validateKnowledgeArticles(changed(a => {a.sources[0].url = 'https://secret@example.org/';})), /unsafe/);
  assert.throws(() => validateKnowledgeArticles(changed(a => {a.capabilityIds.push('another-function');})), /one function/);
  assert.throws(() => validateKnowledgeArticles(changed(a => {a.title = 'Base64：为什么会这样';})), /function name only/);
  assert.throws(() => validateKnowledgeArticles([...structuredClone([ARTICLES[0]]), ...structuredClone([ARTICLES[0]])]), /duplicate/);
});

test('knowledge: exact function search and immutable content exclude removed group introductions', () => {
  assert.deepEqual(searchArticles(), ARTICLES);
  assert.ok(searchArticles('Base64').some(a => a.capabilityIds.includes('pair:To%20Base64')));
  assert.ok(searchArticles('盲文').some(a => a.capabilityIds.includes('native:braille')));
  assert.ok(searchArticles('sstv').some(a => a.capabilityIds.includes('native:audio-sstv')));
  assert.ok(searchArticles('ａｓｃｉｉ').some(a => a.capabilityIds.includes('native:ascii')));
  const first = ARTICLES[0], phrase = first.sections[0].paragraphs[0].slice(5, 20);
  assert.ok(searchArticles(phrase).some(a => a.id === first.id));
  for (const oldId of ['intro-characters', 'intro-encoding', 'intro-communication', 'intro-modern', 'intro-pipeline',
    'it-ports', 'it-http', 'it-formats', 'it-domains', 'it-rfc', 'it-instructions']) {
    assert.equal(getArticle(oldId), undefined);
    assert.equal(resolveCapability(registry, 'learn:' + oldId).entry, undefined, 'Removed knowledge has no compatibility route');
  }
  assert.ok([...registry.aliases.keys()].every(id => !id.startsWith('learn:')), 'No old knowledge compatibility aliases remain');
  assert.ok(registry.entries.filter(entry => entry.category === 'knowledge').every(entry => entry.articleId.startsWith('function-')));
  assert.equal(forTool('pair:To%20Base64').title, 'Base64');
  assert.equal(forTool('native:braille').title, '六点盲文');
  assert.equal(forTool('native:audio-sstv').title, 'SSTV');
  assert.equal(searchArticles('', {limit: 3}).length, 3);
  assert.equal(searchArticles('', {limit: 0}).length, 0);
  assert.deepEqual(searchArticles('不存在xyz123456'), []);
  assert.equal(getArticle('missing'), undefined);
  assert.throws(() => first.sources.push({}), TypeError);
  assert.throws(() => first.sections[0].paragraphs.push('mutation'), TypeError);
});

test('knowledge: Base64, Braille and SSTV have separate concrete mechanisms with checkable examples', () => {
  const base = forTool('pair:To%20Base64'), braille = forTool('native:braille'), sstv = forTool('native:audio-sstv');
  const bits = [...new TextEncoder().encode('ARG')].map(b => b.toString(2).padStart(8, '0')).join('');
  const indices = bits.match(/.{6}/g).map(value => parseInt(value, 2));
  assert.equal(indices.map(i => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[i]).join(''), 'QVJH');
  assert.match(textOf(base), /QVJH/); assert.match(textOf(base), /QQ==/); assert.match(textOf(base), /6|六/);
  assert.match(textOf(braille), /1.*4/); assert.match(textOf(braille), /2.*5/); assert.match(textOf(braille), /3.*6/);
  assert.match(textOf(braille), /⠁|点.?1|1.?点/);
  assert.notEqual(base.id, braille.id); assert.notEqual(braille.id, sstv.id);
  assert.match(textOf(sstv), /扫描/); assert.match(textOf(sstv), /1200/); assert.match(textOf(sstv), /1500|2300/);
  assert.ok(base.sources.some(s => /mirrors\.nju\.edu\.cn|help\.aliyun\.com|cloud\.tencent\.com/.test(s.url)));
  assert.ok(sstv.sources.some(s => /crac\.org\.cn|uestc\.edu\.cn/.test(s.url)));
});
