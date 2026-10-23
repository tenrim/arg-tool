import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {ARTICLES, RAW_ARTICLES, ARTICLE_ALIASES, PROJECTED_TOPIC_MEMBERS, getArticle, articlesForGroup, searchArticles, validateKnowledgeArticles} from '../public/knowledge/content.js';
import {projectKnowledgeTopics} from '../public/knowledge/topics.js';
import {CHAIN_ONLY_OPERATIONS} from '../public/capabilities/operation-policy.js';
import {CHEF_OPERATION_PAIRS} from '../public/capabilities/operation-pairs.js';
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
  assert.ok(searchArticles('Base64').includes(forTool('pair:To%20Base64')));
  assert.ok(searchArticles('盲文').some(a => a.capabilityIds.includes(resolveCapability(registry, 'native:braille').entry.id)));
  assert.ok(searchArticles('sstv').some(a => a.capabilityIds.includes('native:audio-sstv')));
  assert.ok(searchArticles('ａｓｃｉｉ').includes(forTool('native:ascii')));
  const first = ARTICLES[0], phrase = first.sections[0].paragraphs[0].slice(5, 20);
  assert.ok(searchArticles(phrase).some(a => a.id === first.id));
  for (const oldId of ['intro-characters', 'intro-encoding', 'intro-communication', 'intro-modern', 'intro-pipeline',
    'it-ports', 'it-http', 'it-formats', 'it-domains', 'it-rfc', 'it-instructions',
    'function-native:integerseq', 'function-native:crystals', 'function-native:it-rfc', 'function-native:it-instructions',
    ...['gaussian','quadratic','discreteLog','quadraticMod','squares','cubes','twoSquaresPower','continuedFraction','polynomial'].map(id=>'function-native:number-'+id),
    ...['Fork','Merge','Subsection','Register','Conditional Jump','Label','Jump','Sleep','Return','Comment'].map(id=>'function-op:'+encodeURIComponent(id))]) {
    assert.equal(getArticle(oldId), undefined);
    assert.equal(resolveCapability(registry, 'learn:' + oldId).entry, undefined, 'Removed knowledge has no compatibility route');
  }
  for (const [id, target] of registry.aliases) if (id.startsWith('learn:')) {
    assert.equal(target.id, 'learn:' + ARTICLE_ALIASES[id.slice(6)], 'Only exact merged-member lesson aliases may remain');
  }
  assert.ok(registry.entries.filter(entry => entry.category === 'knowledge').every(entry => entry.articleId.startsWith('function-')));
  assert.equal(forTool('pair:To%20Base64'), forTool('topic:base-family'));
  assert.equal(forTool('pair:To%20Base64').members.find(member => member.capabilityId === 'pair:To%20Base64').title, 'Base64');
  assert.equal(forTool('native:ascii'), forTool('topic:character-codes'));
  assert.equal(forTool('native:braille').title, '盲文工具');
  assert.equal(forTool('native:audio-sstv').title, 'SSTV');
  const recipe=forTool('native:cyberchef');
  assert.ok(recipe.sections.some(section=>section.title.startsWith('分支处理')));
  assert.ok(recipe.sections.some(section=>section.title.startsWith('条件跳转')));
  assert.equal(searchArticles('', {limit: 3}).length, 3);
  assert.equal(searchArticles('', {limit: 0}).length, 0);
  assert.deepEqual(searchArticles('不存在xyz123456'), []);
  assert.equal(getArticle('missing'), undefined);
  assert.throws(() => first.sources.push({}), TypeError);
  assert.throws(() => first.sections[0].paragraphs.push('mutation'), TypeError);
});

test('knowledge: topic chapters preserve each actual function, worked example and precise primary reference', () => {
  const originals = new Map(RAW_ARTICLES.map(article => [article.capabilityIds[0], article]));
  const pairs = new Map(CHEF_OPERATION_PAIRS.map(pair => [pair[0], pair]));
  const topics = ARTICLES.filter(article => article.members);
  assert.ok(topics.length > 2, 'Topics are real content families, not a special case for PGP');
  for (const topic of topics) {
    const owner = topic.capabilityIds[0];
    assert.deepEqual(topic.mergedIds, PROJECTED_TOPIC_MEMBERS[owner]);
    assert.ok(topic.members.length > 1, 'A single original paired article must not be repackaged');
    for (const member of topic.members) {
      const original = originals.get(member.capabilityId);
      assert.ok(original, 'Missing precise original article: ' + member.capabilityId);
      assert.equal(ARTICLE_ALIASES[original.id], topic.id);
      assert.equal(getArticle(original.id), topic, 'Existing exact lesson links enter the unified topic');
      assert.ok(!ARTICLES.includes(original), 'Merged members are not additional directory entries');
      const sections = topic.sections.filter(section => section.memberId === member.capabilityId);
      assert.equal(sections.length, original.sections.length);
      sections.forEach((section, index) => {
        const before = original.sections[index];
        assert.deepEqual(section.paragraphs, before.paragraphs, 'No original mechanism paragraph is summarized away');
        assert.deepEqual(section.examples, before.examples, 'No worked input/output/example is discarded');
        assert.equal(section.title, original.title + ' · ' + before.title);
        assert.deepEqual(section.sourceIds, before.sourceIds.map(id => encodeURIComponent(member.capabilityId) + '__' + id));
      });
      for (const before of original.sources) {
        const id = encodeURIComponent(member.capabilityId) + '__' + before.id;
        assert.deepEqual(topic.sources.find(source => source.id === id), {...before, id}, 'References keep exact URL, publisher, language, locator and license');
      }
      for (const text of original.misconceptions) assert.ok(topic.misconceptions.includes(original.title + '：' + text));
      if (member.capabilityId.startsWith('pair:')) {
        const first = decodeURIComponent(member.capabilityId.slice(5));
        assert.deepEqual(member.operationIds, pairs.get(first), 'Both real directions keep their common precise explanation');
      }
    }
  }
  assert.ok(getArticle('function-topic:pgp').members.some(member => member.capabilityId === 'op:PGP%20Verify'));
  assert.ok(getArticle('function-topic:extract-patterns').members.some(member => member.capabilityId === 'op:Extract%20dates'));
  assert.throws(() => {ARTICLE_ALIASES.changed = 'value';}, TypeError);
});

test('knowledge: recipe-only primitives disappear from discovery without removing their original content records', () => {
  const recipeOnly = new Set(CHAIN_ONLY_OPERATIONS);
  const moved = RAW_ARTICLES.filter(article => article.capabilityIds[0].startsWith('op:')
    && recipeOnly.has(decodeURIComponent(article.capabilityIds[0].slice(3))));
  assert.ok(moved.some(article => article.capabilityIds[0] === 'op:Multiply'));
  assert.ok(moved.some(article => article.capabilityIds[0] === 'op:OR'));
  for (const article of moved) {
    assert.equal(getArticle(article.id), undefined);
    assert.ok(!ARTICLES.some(visible => visible.capabilityIds.includes(article.capabilityIds[0])));
    assert.ok(article.sections.some(section => section.examples.length), 'Archived precise mechanism and example remain intact');
  }
});

test('knowledge: topic projection filters recipe-only candidates, preserves single pairs and rejects split directions', () => {
  const gzip = RAW_ARTICLES.find(article => article.capabilityIds[0] === 'pair:Gzip');
  const topic = {id: 'compression-test', title: '压缩', group: 'files', operations: ['Gzip', 'Gunzip'], nativeIds: []};
  const single = projectKnowledgeTopics([gzip], [topic], []);
  assert.deepEqual(single.articles, [gzip]);
  assert.deepEqual(single.aliases, {});
  assert.deepEqual(single.members, {});
  assert.deepEqual(projectKnowledgeTopics([gzip], [topic], ['Gzip', 'Gunzip']).articles, []);
  assert.throws(() => projectKnowledgeTopics([gzip], [{...topic, operations: ['Gzip']}], []), /cannot split canonical directions/);
  assert.throws(() => projectKnowledgeTopics([gzip], [topic], ['Gzip']), /cannot split knowledge pair/);
  assert.throws(() => projectKnowledgeTopics([gzip], [{...topic, operations: ['Gzip', 'Gunzip', 'Missing operation']}], []), /lacks its precise mechanism/);
});

test('knowledge: mixed QR topic keeps each native controller and Chef implementation as a precise original member', () => {
  const nativeIds = ['native:image-barcode', 'native:image-qr'];
  const operations = ['Generate QR Code', 'Parse QR Code'];
  const topic = {id: 'mixed-qr-test', title: '二维码工具', group: 'image', nativeIds, operations};
  const ids = [...nativeIds, ...operations.map(op => 'op:' + encodeURIComponent(op))];
  const originals = ids.map(id => RAW_ARTICLES.find(article => article.capabilityIds[0] === id));
  assert.ok(originals.every(Boolean));
  const before = structuredClone(originals);
  const projected = projectKnowledgeTopics(originals, [topic], []);
  assert.equal(projected.articles.length, 1, 'One QR lesson, not separate native/engine directories');
  const merged = projected.articles[0];
  assert.deepEqual(new Set(merged.members.map(member => member.capabilityId)), new Set(ids));
  assert.deepEqual(merged.operationIds, operations, 'Only the explicitly registered Chef members claim these operation IDs');
  assert.deepEqual(validateKnowledgeArticles([merged])[0].capabilityIds, ['topic:mixed-qr-test']);
  for (const article of originals) {
    const id = article.capabilityIds[0], member = merged.members.find(member => member.capabilityId === id);
    assert.deepEqual(member.operationIds, id.startsWith('native:') ? [] : [decodeURIComponent(id.slice(3))]);
    assert.equal(projected.aliases[article.id], merged.id);
    const sections = merged.sections.filter(section => section.memberId === id);
    assert.equal(sections.length, article.sections.length);
    sections.forEach((section, index) => {
      assert.deepEqual(section.paragraphs, article.sections[index].paragraphs);
      assert.deepEqual(section.examples, article.sections[index].examples);
      assert.deepEqual(section.sourceIds, article.sections[index].sourceIds.map(source => encodeURIComponent(id) + '__' + source));
    });
    for (const source of article.sources) {
      const sourceId = encodeURIComponent(id) + '__' + source.id;
      assert.deepEqual(merged.sources.find(item => item.id === sourceId), {...source, id: sourceId});
    }
  }
  assert.deepEqual(originals, before, 'Projecting mixed members must not rewrite original mechanisms or references');
  assert.throws(() => projectKnowledgeTopics(originals.slice(1), [topic], []), /native member lacks its precise mechanism/);
  assert.throws(() => projectKnowledgeTopics(originals.slice(0, -1), [topic], []), /operation lacks its precise mechanism/);
  assert.throws(() => projectKnowledgeTopics(originals, [topic, {...topic, id: 'other'}], []), /multiple topics|conflicting discovery owners/);
});

test('knowledge: exact native membership does not guess its delegated Chef operation coverage or pair semantics', () => {
  const nativeIds = ['native:escape-hex', 'native:escape-unicode', 'native:escape-html', 'native:escape-url'];
  const originals = nativeIds.map(id => RAW_ARTICLES.find(article => article.capabilityIds[0] === id));
  const topic = {id: 'native-escapes-test', title: '文本转义', group: 'encoding', nativeIds, operations: []};
  const projected = projectKnowledgeTopics(originals, [topic], []);
  assert.equal(projected.articles.length, 1);
  assert.deepEqual(projected.articles[0].operationIds, []);
  assert.ok(projected.articles[0].members.every(member => member.operationIds.length === 0));
  assert.deepEqual(projected.members['topic:native-escapes-test'], nativeIds);
  validateKnowledgeArticles(projected.articles);
  const gzip = RAW_ARTICLES.find(article => article.capabilityIds[0] === 'pair:Gzip');
  assert.throws(() => projectKnowledgeTopics([...originals, gzip], [{...topic, nativeIds: [...nativeIds, 'pair:Gzip']}], []), /exact native capability/);
  assert.throws(() => projectKnowledgeTopics([...originals, gzip], [{...topic, operations: ['Gzip']}], []), /cannot split canonical directions/);
  assert.throws(() => projectKnowledgeTopics(originals, [{...topic, operations: ['URL Encode']}], []), /operation lacks its precise mechanism/);
});

test('knowledge: a topic cannot pass validation after losing one member mechanism, example or reference binding', () => {
  const original = ARTICLES.find(article => article.members?.length > 1);
  const changed = mutation => {const article = structuredClone(original);mutation(article);return [article];};
  assert.throws(() => validateKnowledgeArticles(changed(article => {
    for (const section of article.sections.filter(section => section.memberId === article.members[0].capabilityId)) section.examples = [];
  })), /member requires its own mechanism and worked example/);
  assert.throws(() => validateKnowledgeArticles(changed(article => {article.sections.push({...structuredClone(article.sections[0]), memberId: 'generic-overview'});})), /unowned generic section/);
  assert.throws(() => validateKnowledgeArticles(changed(article => {article.sections[0].operationIds.push('invented reverse');})), /lost precise operation coverage/);
  assert.throws(() => validateKnowledgeArticles(changed(article => {article.members[0].sourceIds = [article.members[1].sourceIds[0]];})), /another member references/);
  assert.throws(() => validateKnowledgeArticles(changed(article => {article.members.push(structuredClone(article.members[0]));})), /duplicate or missing topic member/);
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
