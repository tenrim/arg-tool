import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARTICLES,
  RAW_ARTICLES,
  searchArticles,
  validateKnowledgeArticles,
} from '../public/knowledge/content.js';
import {
  addKnowledgeChapters,
  COMPLETE_KNOWLEDGE_IDS,
  editKnowledgePresentation,
} from '../public/knowledge/chapters/index.js';
import { cipherExamples } from '../public/knowledge/articles/cipher-examples.js';
import { readdir } from 'node:fs/promises';
import { moduleGraph, closure, cyclesOf } from '../scripts/module-graph.mjs';
import { boundaryViolations } from '../scripts/architecture-policy.mjs';

test('knowledge chapters: every remaining public article has its own authored and cited introduction', () => {
  const remaining = ARTICLES.filter((article) => article.preface);
  // A rewritten member inside a projected topic does not replace the topic's own preface.
  const completePages = ARTICLES.filter((article) =>
    COMPLETE_KNOWLEDGE_IDS.has(article.capabilityIds[0]),
  );
  assert.equal(remaining.length, ARTICLES.length - completePages.length);
  const introductions = new Set();
  for (const article of remaining) {
    assert.equal(article.preface[0].title, '介绍');
    assert.ok(article.preface.length >= 2);
    assert.ok(
      article.sections.some((section) => section.examples.length),
      'The preface does not replace worked mechanisms',
    );
    introductions.add(article.preface[0].paragraphs[0]);
    for (const section of [...article.preface, ...article.sections]) {
      assert.doesNotMatch(section.title, /[？?]|是什么|怎样|怎么|为什么|你会/);
    }
    for (const section of article.preface) {
      for (const id of section.sourceIds)
        assert.ok(article.sources.some((source) => source.id === id));
      for (const paragraph of section.paragraphs)
        assert.ok(searchArticles(paragraph).includes(article), 'New body text is searchable');
    }
  }
  assert.equal(
    introductions.size,
    remaining.length,
    'Introductions are not shared group boilerplate',
  );
});

test('all complete lessons publish searchable, cited sections without a site-settings chapter', () => {
  for (const id of [
    'op:Enigma',
    'pair:Vigen%C3%A8re%20Encode',
    'pair:Rail%20Fence%20Cipher%20Encode',
    'op:Atbash%20Cipher',
    'pair:Affine%20Cipher%20Encode',
    'pair:Bacon%20Cipher%20Encode',
    'pair:Bifid%20Cipher%20Encode',
  ]) {
    assert.ok(COMPLETE_KNOWLEDGE_IDS.has(id), id);
    assert.ok(
      ARTICLES.some((article) => article.capabilityIds[0] === id),
      id,
    );
  }
  const pagesByCapability = new Map(
    ARTICLES.flatMap((page) =>
      (page.members?.map((member) => member.capabilityId) || page.capabilityIds).map((id) => [
        id,
        page,
      ]),
    ),
  );
  for (const article of RAW_ARTICLES) {
    const [id] = article.capabilityIds;
    if (!COMPLETE_KNOWLEDGE_IDS.has(id)) continue;
    const page = pagesByCapability.get(id);
    assert.ok(page, id);
    if (!page.members) assert.equal(page.preface, undefined);
    assert.equal(article.sections[0].title, '介绍');
    assert.ok(
      article.sections.length >= 5 &&
        article.sources.length >= (article.topicGroup === 'classical' ? 5 : 2) &&
        article.misconceptions.length >= 3,
      id,
    );
    assert.ok(article.sections.flatMap((section) => section.examples).length >= 3);
    for (const section of article.sections) {
      assert.doesNotMatch(section.title, /[？?]|是什么|怎样|怎么|为什么|你会/);
      assert.doesNotMatch(section.title, /本站实现|^参数(?:与设置)?$/u);
      for (const text of [
        section.title,
        ...section.paragraphs,
        ...section.examples.flatMap(Object.values),
      ]) {
        assert.ok(searchArticles(text).includes(page), id + ': ' + text);
      }
    }
    for (const text of article.misconceptions) assert.ok(searchArticles(text).includes(page));
  }
});

test('knowledge chapters: missing or retired mappings fail rather than silently falling back to a generic article', () => {
  const items = structuredClone(ARTICLES);
  items[0].capabilityIds = ['native:unwritten-chapter'];
  assert.throws(() => addKnowledgeChapters(items), /Missing authored/);
  const legacy = ARTICLES.find((article) => article.preface);
  if (legacy) {
    assert.throws(
      () => addKnowledgeChapters(ARTICLES.filter((article) => article !== legacy)),
      /Unregistered knowledge chapters/,
    );
  }
});

test('knowledge chapters: prefaces have their own citation validation and cannot satisfy member requirements', () => {
  const original = ARTICLES.find((article) => article.preface && article.members);
  const check = (mutate) => {
    const article = structuredClone(original);
    mutate(article);
    return () => validateKnowledgeArticles([article]);
  };
  assert.throws(
    check((article) => {
      article.preface[0].sourceIds = ['invented'];
    }),
    /preface lacks valid citations/,
  );
  assert.throws(
    check((article) => {
      article.preface[0].paragraphs = [];
    }),
    /empty preface section/,
  );
  assert.throws(
    check((article) => {
      article.preface[0].memberId = article.members[0].capabilityId;
    }),
    /cannot replace member/,
  );
  assert.throws(
    check((article) => {
      for (const section of article.sections.filter(
        (section) => section.memberId === article.members[0].capabilityId,
      ))
        section.examples = [];
    }),
    /member requires/,
  );
  assert.throws(() => original.preface[0].paragraphs.push('mutation'), TypeError);
});

test('knowledge chapters: removing an empty editorial example wrapper preserves its example and reference bindings', () => {
  const example = { label: '例', input: 'A', output: 'B', explanation: '映射' };
  const source = { id: 'a', url: 'https://example.org/spec' };
  const [article] = editKnowledgePresentation([
    {
      capabilityIds: ['native:fixture'],
      sources: [source],
      sections: [
        { title: '规则与机制', paragraphs: ['第一项规则。', '第二项规则。'], sourceIds: ['a'] },
        {
          title: '逐步核对',
          paragraphs: ['下例用于核对这项规则；参数和输入格式需与示例所述保持一致。'],
          sourceIds: ['b'],
          examples: [example],
        },
      ],
    },
  ]);
  assert.equal(article.sections.length, 1);
  assert.equal(article.sections[0].title, '工作原理');
  assert.deepEqual(article.sections[0].paragraphs, ['第一项规则。', '第二项规则。']);
  assert.deepEqual(article.sections[0].examples, [example]);
  assert.deepEqual(article.sections[0].sourceIds, ['a', 'b']);
  assert.equal(article.sources[0], source);
});

test('knowledge chapters: complete cipher examples are attached to their exact raw member before topic projection', () => {
  assert.equal(cipherExamples.length, 17);
  for (const example of cipherExamples) {
    if (COMPLETE_KNOWLEDGE_IDS.has(example.capabilityId)) continue;
    const article = RAW_ARTICLES.find(
      (article) => article.capabilityIds[0] === example.capabilityId,
    );
    const section = article.sections.find((section) => section.title === '加密示例');
    assert.equal(section.examples[0].output, example.ciphertext);
    assert.ok(section.examples[0].input.includes(example.plaintext));
    for (const [label, value] of example.parameters)
      assert.ok(section.examples[0].input.includes(label + '：' + value));
    if (example.reference)
      assert.ok(
        article.sources.some(
          (source) => source.id === example.reference.id && source.url === example.reference.url,
        ),
      );
  }
});

test('knowledge chapters: the new composition edges stay pure and cannot import a controller or UI', async () => {
  const files = (await readdir('public/knowledge/chapters')).map(
    (name) => 'public/knowledge/chapters/' + name,
  );
  const graph = await moduleGraph([
    ...files,
    'public/knowledge/content.js',
    'public/knowledge/articles/cipher-examples.js',
  ]);
  assert.deepEqual(boundaryViolations(graph, closure), []);
  assert.deepEqual(cyclesOf(graph), []);
  for (const target of ['public/ui/index.js', 'public/cyberchef-client.js']) {
    const bad = new Map([['public/knowledge/chapters/index.js', { imports: [target] }]]);
    assert.ok(boundaryViolations(bad, closure).some((issue) => issue.includes('discovery data')));
  }
});
