import test from 'node:test';
import assert from 'node:assert/strict';
import {ARTICLES, RAW_ARTICLES, searchArticles, validateKnowledgeArticles} from '../public/knowledge/content.js';
import {addKnowledgeChapters, editKnowledgePresentation} from '../public/knowledge/chapters/index.js';
import {cipherExamples} from '../public/knowledge/articles/cipher-examples.js';
import {readdir} from 'node:fs/promises';
import {moduleGraph, closure, cyclesOf} from '../scripts/module-graph.mjs';
import {boundaryViolations} from '../scripts/architecture-policy.mjs';

test('knowledge chapters: every remaining public article has its own authored and cited introduction', () => {
  const remaining = ARTICLES.filter(article => article.capabilityIds[0] !== 'op:Enigma');
  assert.equal(remaining.length, 255);
  const introductions = new Set();
  for (const article of remaining) {
    assert.equal(article.preface[0].title, '介绍');
    assert.ok(article.preface.length >= 2);
    assert.ok(article.sections.some(section => section.examples.length), 'The preface does not replace worked mechanisms');
    introductions.add(article.preface[0].paragraphs[0]);
    for (const section of [...article.preface, ...article.sections]) {
      assert.doesNotMatch(section.title, /[？?]|是什么|怎样|怎么|为什么|你会/);
    }
    for (const section of article.preface) {
      for (const id of section.sourceIds) assert.ok(article.sources.some(source => source.id === id));
      for (const paragraph of section.paragraphs) assert.ok(searchArticles(paragraph).includes(article), 'New body text is searchable');
    }
  }
  assert.equal(introductions.size, remaining.length, 'Introductions are not shared group boilerplate');
});

test('knowledge chapters: missing or retired mappings fail rather than silently falling back to a generic article', () => {
  const items = structuredClone(ARTICLES);
  items[0].capabilityIds = ['native:unwritten-chapter'];
  assert.throws(() => addKnowledgeChapters(items), /Missing authored/);
  assert.throws(() => addKnowledgeChapters(ARTICLES.slice(1)), /Unregistered knowledge chapters/);
});

test('knowledge chapters: prefaces have their own citation validation and cannot satisfy member requirements', () => {
  const original = ARTICLES.find(article => article.preface && article.members);
  const check = mutate => {const article = structuredClone(original);mutate(article);return () => validateKnowledgeArticles([article]);};
  assert.throws(check(article => {article.preface[0].sourceIds = ['invented'];}), /preface lacks valid citations/);
  assert.throws(check(article => {article.preface[0].paragraphs = [];}), /empty preface section/);
  assert.throws(check(article => {article.preface[0].memberId = article.members[0].capabilityId;}), /cannot replace member/);
  assert.throws(check(article => {
    for (const section of article.sections.filter(section => section.memberId === article.members[0].capabilityId)) section.examples = [];
  }), /member requires/);
  assert.throws(() => original.preface[0].paragraphs.push('mutation'), TypeError);
});

test('knowledge chapters: removing an empty editorial example wrapper preserves its example and reference bindings', () => {
  const example = {label: '例', input: 'A', output: 'B', explanation: '映射'};
  const source = {id: 'a', url: 'https://example.org/spec'};
  const [article] = editKnowledgePresentation([{
    capabilityIds: ['native:fixture'], sources: [source],
    sections: [
      {title: '规则与机制', paragraphs: ['第一项规则。', '第二项规则。'], sourceIds: ['a']},
      {title: '逐步核对', paragraphs: ['下例用于核对这项规则；参数和输入格式需与示例所述保持一致。'], sourceIds: ['b'], examples: [example]},
    ],
  }]);
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
    const article = RAW_ARTICLES.find(article => article.capabilityIds[0] === example.capabilityId);
    const section = article.sections.find(section => section.title === '加密示例');
    assert.equal(section.examples[0].output, example.ciphertext);
    assert.ok(section.examples[0].input.includes(example.plaintext));
    for (const [label, value] of example.parameters) assert.ok(section.examples[0].input.includes(label + '：' + value));
    if (example.reference) assert.ok(article.sources.some(source => source.id === example.reference.id && source.url === example.reference.url));
  }
});

test('knowledge chapters: the new composition edges stay pure and cannot import a controller or UI', async () => {
  const files = (await readdir('public/knowledge/chapters')).map(name => 'public/knowledge/chapters/' + name);
  const graph = await moduleGraph([...files, 'public/knowledge/content.js', 'public/knowledge/articles/cipher-examples.js']);
  assert.deepEqual(boundaryViolations(graph, closure), []);
  assert.deepEqual(cyclesOf(graph), []);
  for (const target of ['public/ui/index.js', 'public/cyberchef-client.js']) {
    const bad = new Map([['public/knowledge/chapters/index.js', {imports: [target]}]]);
    assert.ok(boundaryViolations(bad, closure).some(issue => issue.includes('discovery data')));
  }
});
