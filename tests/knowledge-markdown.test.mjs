import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  buildMarkdownOverridesSource,
  parseKnowledgeMarkdown,
} from '../scripts/knowledge-markdown.mjs';
import {
  RAW_ARTICLES,
  applyMarkdownOverrides,
  validateKnowledgeArticles,
} from '../public/knowledge/content.js';
import {
  markdownArticles,
  markdownCompleteIds,
} from '../public/knowledge/articles/markdown-overrides.js';
import { projectKnowledgeTopics } from '../public/knowledge/topics.js';

const sample = `---
capabilityId: native:first
title: 示例
topicGroup: classical
summary: 一份演示
aliases:
  - 'Example'
sources:
  - id: definition
    title: 说明
    publisher: 原作者
    url: https://example.org/definition
    language: zh-CN
    kind: author-spec
  - id: implementation
    title: 源码
    publisher: 项目
    url: /vendor/source.js
    language: en
    kind: implementation
    locator: 入口
    upstreamUrl: https://example.org/source
    license: Apache-2.0
    licenseUrl: /vendor/LICENSE.txt
---
## 介绍
<!-- sources: definition， implementation -->

第一段。

第二段。

:::example 多行示例
[输入]
A
 B
[结果]
B
 A
[说明]
分两行。
保留空格。
:::

## 常见误区

- 第一条。
- 第二条。
`;
const path = 'classical/example.md';
const parse = (source) => parseKnowledgeMarkdown(source, path);

test('every complete Markdown article reaches topic projection with its own validated text and examples', () => {
  const published = new Map(RAW_ARTICLES.map((article) => [article.id, article]));
  const complete = markdownArticles.filter((article) =>
    markdownCompleteIds.includes(article.capabilityIds[0]),
  );
  for (const article of validateKnowledgeArticles(complete)) {
    assert.deepEqual(published.get(article.id), article, article.id);
  }
});

test('Markdown preserves section citations, paragraphs, multiline examples, defaults and license', () => {
  const { article, complete } = parse(sample);
  assert.equal(complete, true);
  assert.equal(article.id, 'function-native:first');
  assert.deepEqual(article.relatedIds, article.capabilityIds);
  assert.deepEqual(article.aliases, ['Example']);
  assert.deepEqual(article.sections[0], {
    title: '介绍',
    sourceIds: ['definition', 'implementation'],
    paragraphs: ['第一段。', '第二段。'],
    examples: [
      { label: '多行示例', input: 'A\n B', output: 'B\n A', explanation: '分两行。\n保留空格。' },
    ],
  });
  assert.deepEqual(article.misconceptions, ['第一条。', '第二条。']);
  assert.equal(article.sources[1].licenseUrl, '/vendor/LICENSE.txt');
  assert.equal(article.sources[1].license, 'Apache-2.0');
  assert.equal(validateKnowledgeArticles([article]).length, 1);
  const explicit = parse(
    sample
      .replace(
        'summary:',
        'complete: false\nrelatedIds:\n  - native:first\n  - native:second\nsummary:',
      )
      .replaceAll('\n', '\r\n'),
  );
  assert.equal(explicit.complete, false);
  assert.deepEqual(explicit.article.relatedIds, ['native:first', 'native:second']);
});

test('Markdown accepts escaped angle brackets as literal example input and output', () => {
  const source = sample
    .replace('A\n B\n[结果]', '\\<p>中文\\</p>\n B\n[结果]')
    .replace('B\n A\n[说明]', '\\<span>中文\\</span>\n A\n[说明]');
  const [example] = parse(source).article.sections[0].examples;
  assert.equal(example.input, '<p>中文</p>\n B');
  assert.equal(example.output, '<span>中文</span>\n A');
  assert.throws(() => parse(source.replace('\\</p>', '</p>')), /HTML/);
  assert.throws(() => parse(source.replace('保留空格。', '\\<p>正文中不能插入标签。')), /HTML/);
});

test('Markdown syntax errors include the file and offending line', () => {
  const cases = [
    ['title: 示例\n', '', '---\n##', /缺少 title/],
    ['    publisher: 原作者\n', '', '  - id: definition', /缺少 publisher/],
    ['<!-- sources: definition， implementation -->', '', '## 介绍', /sources/],
    ['implementation -->', 'missing -->', '<!-- sources:', /来源/],
    [':::example 多行示例', ':::example 多行示例', ':::example', /未闭合/],
    ['[输入]\n', '', 'A\n B', /输入/],
    ['[结果]\n', '', '[说明]', /结果/],
    ['[说明]\n', '', ':::\n\n## 常见', /说明/],
    ['第一段。', '<b>第一段。</b>', '<b>', /HTML/],
    [' B\n[结果]', ' <img src=x>\n[结果]', ' <img', /HTML/],
    ['summary:', 'complete: yes\nsummary:', 'complete: yes', /complete/],
  ];
  for (const [old, replacement, location, message] of cases) {
    let source = sample.replace(old, replacement);
    if (message.source === '未闭合') source = source.replace('\n:::\n', '\n');
    const pos = source.indexOf(location);
    assert.notEqual(pos, -1);
    const line = source.slice(0, pos).split('\n').length;
    assert.throws(
      () => parse(source),
      (error) => error.message.startsWith(path + ':' + line + ':') && message.test(error.message),
    );
  }
});

test('replacement preserves order and projected member ownership, new capabilities are appended', () => {
  const { article: first } = parse(sample);
  const second = parse(sample.replaceAll('native:first', 'native:second')).article;
  const replacement = { ...first, title: '新标题' };
  const third = parse(sample.replaceAll('native:first', 'native:third')).article;
  const base = [first, second];
  const merged = applyMarkdownOverrides(base, [replacement, third]);
  assert.deepEqual(merged, [replacement, second, third]);
  assert.deepEqual(base, [first, second]);
  const projected = projectKnowledgeTopics(
    merged,
    [
      {
        id: 'fixture',
        title: '专题',
        group: 'classical',
        nativeIds: ['native:first', 'native:second'],
      },
    ],
    [],
    [],
  );
  const topic = projected.articles.find((a) => a.capabilityIds[0] === 'topic:fixture');
  assert.equal(topic.members[0].title, '新标题');
  assert.deepEqual(topic.sections[0].examples, first.sections[0].examples);
  validateKnowledgeArticles(projected.articles);
});

test('scanner recurses in path order, ignores templates, freezes output and rejects duplicate owners', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'mist-knowledge-md-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await mkdir(join(dir, 'classical'));
  await writeFile(join(dir, 'README.md'), '手册');
  await writeFile(join(dir, 'classical', '_template.md'), '模板');
  await writeFile(
    join(dir, 'last.md'),
    sample
      .replaceAll('native:first', 'native:last')
      .replace('title: 示例', 'complete: false\ntitle: 示例'),
  );
  await writeFile(join(dir, 'classical', 'first.md'), sample);
  const source = await buildMarkdownOverridesSource(dir);
  assert.equal(await buildMarkdownOverridesSource(dir), source);
  const { markdownArticles, markdownCompleteIds } = await import(
    'data:text/javascript;base64,' + Buffer.from(source).toString('base64')
  );
  assert.deepEqual(markdownCompleteIds, ['native:first']);
  assert.ok(
    Object.isFrozen(markdownCompleteIds) &&
      Object.isFrozen(markdownArticles) &&
      Object.isFrozen(markdownArticles[0].sources[1]),
  );
  assert.deepEqual(
    markdownArticles.map((a) => a.capabilityIds[0]),
    ['native:first', 'native:last'],
  );
  await writeFile(join(dir, 'last.md'), sample);
  await assert.rejects(buildMarkdownOverridesSource(dir), /last\.md:2:.*native:first.*first\.md:2/);
});
