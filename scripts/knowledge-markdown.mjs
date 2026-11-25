import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const required = ['capabilityId', 'title', 'topicGroup', 'summary', 'aliases', 'sources'];
const referenceFields = ['id', 'title', 'publisher', 'url', 'language', 'kind'];
const optionalReferenceFields = ['locator', 'upstreamUrl', 'license', 'licenseUrl'];
const arrays = ['aliases', 'relatedIds', 'sources'];
const markers = ['[输入]', '[结果]', '[说明]'];

// Deliberately parse only the documented YAML subset. Never evaluate author input.
function scalar(raw, fail) {
  const value = raw.trim();
  if (value.startsWith('"')) {
    try {
      const text = JSON.parse(value);
      if (typeof text === 'string' && text.trim()) return text;
    } catch {
      /* Report the original Markdown location below. */
    }
    fail('双引号字符串无效或为空');
  }
  if (value.startsWith("'")) {
    if (!/^'(?:[^']|'')+'$/.test(value)) fail('单引号字符串无效或为空');
    return value.slice(1, -1).replaceAll("''", "'");
  }
  if (!value || /^[\[\]{}|>&*!#]/.test(value)) fail('此字段需要非空字符串');
  return value;
}

function readHeader(lines, end, error) {
  const fields = Object.create(null);
  let field, reference, referenceLine;
  const finishReference = () => {
    if (!reference) return;
    for (const key of referenceFields) {
      if (!reference[key]) error(referenceLine, '来源缺少 ' + key);
    }
    reference = undefined;
  };
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const fail = (msg) => error(i, msg);
    const entry = /^([A-Za-z]+):(?:\s+(.*)|$)/.exec(line);
    if (entry) {
      finishReference();
      field = entry[1];
      if (![...required, 'relatedIds', 'complete'].includes(field)) fail('未知字段 ' + field);
      if (Object.hasOwn(fields, field)) fail('字段重复 ' + field);
      const raw = (entry[2] || '').trim();
      if (arrays.includes(field)) {
        if (raw && raw !== '[]') fail(field + ' 请使用分行列表');
        fields[field] = [];
      } else if (field === 'complete') {
        if (!['true', 'false'].includes(raw)) fail('complete 必须为 true 或 false');
        fields.complete = raw === 'true';
      } else fields[field] = scalar(raw, fail);
      continue;
    }
    if (!arrays.includes(field)) fail('无法识别的前置信息或缩进');
    const item = /^  - (.+)$/.exec(line);
    if (field !== 'sources') {
      if (!item) fail(field + ' 需要字符串列表');
      fields[field].push(scalar(item[1], fail));
      continue;
    }
    if (item) {
      finishReference();
      reference = {};
      referenceLine = i;
      fields.sources.push(reference);
    }
    const property = /^(?:  - |    )([A-Za-z]+):\s+(.*)$/.exec(line);
    if (!reference || !property) fail('来源字段或缩进无效');
    const [, key, value] = property;
    if (![...referenceFields, ...optionalReferenceFields].includes(key))
      fail('未知来源字段 ' + key);
    if (Object.hasOwn(reference, key)) fail('来源字段重复 ' + key);
    reference[key] = scalar(value, fail);
    if (key === 'id' && fields.sources.slice(0, -1).some((r) => r.id === reference.id))
      fail('来源 id 重复');
  }
  finishReference();
  for (const field of required) if (!Object.hasOwn(fields, field)) error(end, '缺少 ' + field);
  if (!fields.sources.length) error(end, 'sources 列表为空');
  return fields;
}

export function parseKnowledgeMarkdown(source, filePath) {
  const lines = source
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n');
  const error = (index, message) => {
    throw Error(`${filePath}:${index + 1}: ${message}`);
  };
  if (lines[0] !== '---') error(0, '缺少前置信息起始 ---');
  const end = lines.indexOf('---', 1);
  if (end < 0) error(0, '前置信息未闭合');
  const {
    capabilityId,
    relatedIds = [capabilityId],
    complete = true,
    ...meta
  } = readHeader(lines, end, error);
  const sections = [],
    misconceptions = [];
  let section,
    inList = false,
    paragraph = [];
  const flush = () => {
    if (paragraph.length) section.paragraphs.push(paragraph.join('\n'));
    paragraph = [];
  };
  const plain = (line, index, literalExample = false) => {
    const markup = /<\/?[a-z][\w:-]*(?=[\s/>]|$)|<!--|<!doctype\b/i;
    if (markup.test(literalExample ? line.replaceAll('\\<', '') : line))
      error(index, '正文不接受 HTML 标签');
    return literalExample ? line.replaceAll('\\<', '<') : line;
  };
  for (let i = end + 1; i < lines.length; i++) {
    const line = plain(lines[i], i);
    if (!line.trim()) {
      flush();
      continue;
    }
    if (line.startsWith('## ')) {
      flush();
      if (inList) error(i, '常见误区须为最后一节');
      const title = line.slice(3).trim();
      if (!title) error(i, '缺少小节标题');
      inList = title === '常见误区';
      if (inList) continue;
      const cite = /^<!--\s*sources:\s*(.*?)\s*-->$/.exec(lines[i + 1] || '');
      if (!cite) error(i, '小节标题下一行须声明 sources');
      const sourceIds = cite[1].split(/[,，]/).map((s) => s.trim());
      if (
        new Set(sourceIds).size !== sourceIds.length ||
        sourceIds.some((id) => !meta.sources.some((s) => s.id === id))
      )
        error(i + 1, '引用了未知或重复的来源');
      section = { title, paragraphs: [], sourceIds };
      sections.push(section);
      i++;
    } else if (inList) {
      if (!/^- \S/.test(line)) error(i, '常见误区需要 - 列表项');
      misconceptions.push(line.slice(2));
    } else if (!section) error(i, '正文须从 ## 小节开始');
    else if (line.startsWith(':::example ')) {
      flush();
      const start = i,
        values = [];
      const label = line.slice(':::example '.length).trim();
      if (!label) error(i, '示例标题为空');
      for (i++; i < lines.length && lines[i] !== ':::'; i++) {
        const part = lines[i];
        if (markers.includes(part)) {
          if (part !== markers[values.length])
            error(i, '示例缺少或顺序错误 ' + (markers[values.length] || part));
          values.push([]);
        } else {
          if (/^:::|^## /.test(part)) error(start, '示例块未闭合');
          if (!values.length) error(i, '示例须先写 [输入]');
          values.at(-1).push(plain(part, i, values.length < 3));
        }
      }
      if (i === lines.length) error(start, '示例块未闭合');
      if (values.length !== 3) error(i, '示例缺少 ' + markers[values.length]);
      const [input, output, explanation] = values.map((v, index) => {
        const text = v.join('\n');
        if (!text.trim()) error(start, markers[index] + ' 内容为空');
        return text;
      });
      (section.examples ??= []).push({ label, input, output, explanation });
    } else if (line.startsWith(':::')) error(i, '示例块标记无效');
    else paragraph.push(line);
  }
  flush();
  if (!sections.length) error(end, '缺少正文小节');
  return {
    article: {
      id: 'function-' + capabilityId,
      capabilityIds: [capabilityId],
      relatedIds,
      ...meta,
      sections,
      misconceptions,
    },
    complete,
  };
}

export async function buildMarkdownOverridesSource(rootDir) {
  const files = [];
  async function collect(relativeDir) {
    for (const entry of await readdir(join(rootDir, relativeDir), { withFileTypes: true })) {
      const path = relativeDir ? relativeDir + '/' + entry.name : entry.name;
      if (entry.isDirectory()) await collect(path);
      else if (
        entry.isFile() &&
        entry.name.endsWith('.md') &&
        entry.name !== 'README.md' &&
        !entry.name.startsWith('_')
      )
        files.push(path);
    }
  }
  await collect('');
  const articles = [],
    completeIds = [],
    owners = new Map();
  for (const relativePath of files.sort()) {
    const path = join(rootDir, relativePath);
    const source = await readFile(path, 'utf8');
    const { article, complete } = parseKnowledgeMarkdown(source, path);
    const [id] = article.capabilityIds;
    const line = source.split(/\r?\n/).findIndex((s) => s.startsWith('capabilityId:')) + 1;
    if (owners.has(id))
      throw Error(`${path}:${line}: capabilityId ${id} 重复，首次声明在 ${owners.get(id)}`);
    owners.set(id, path + ':' + line);
    articles.push(article);
    if (complete) completeIds.push(id);
  }
  return (
    '// Generated by npm run build:knowledge. Edit content/knowledge/**/*.md.\n' +
    'function freeze(value) { if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }\n' +
    'export const markdownArticles = freeze(' +
    JSON.stringify(articles, null, 2) +
    ');\n' +
    'export const markdownCompleteIds = Object.freeze(' +
    JSON.stringify(completeIds) +
    ');\n'
  );
}
