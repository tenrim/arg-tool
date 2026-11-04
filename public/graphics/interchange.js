import { newDrawing, validateDrawing, encodeDrawing, MAX_NODES, MAX_DRAWING } from './model.js';
import { listArchive, extractArchive, createArchive } from '../round2/archive-engine.js';
const enc = new TextEncoder(),
  dec = new TextDecoder('utf-8', { fatal: true }),
  id = () => crypto.randomUUID();
const xml = (s) =>
  String(s)
    .replace(
      /[<>&"']/g,
      (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c],
    )
    .replace(/\n/g, '&#10;');
function xmlDocument(text) {
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw Error('不支持含实体或文档类型声明的 XML。');
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) throw Error('XML 格式无效。');
  return doc;
}
export function markdownTree(text, title = '笔记大纲') {
  const root = { id: id(), topic: title, root: true, children: [] },
    stack = [{ level: 0, node: root }];
  let fence = null,
    count = 1;
  for (const line of text.split('\n')) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
    }
    const heading = !fence && line.match(/^(#{1,6})\s+(.+)$/),
      bullet = !fence && line.match(/^(\s*)[-*+]\s+(.+)$/);
    if (heading || bullet) {
      if (++count > MAX_NODES) throw Error('大纲超过 2,000 节点。');
      const level = heading ? heading[1].length : 7 + Math.floor(bullet[1].length / 2);
      while (stack.length > 1 && stack.at(-1).level >= level) stack.pop();
      const node = { id: id(), topic: (heading || bullet)[2], children: [] };
      stack.at(-1).node.children.push(node);
      stack.push({ level, node });
    } else if (line.trim()) {
      const node = stack.at(-1).node;
      node.note = (node.note ? node.note + '\n' : '') + line;
      if (node.note.length > 10000) throw Error('单节正文超过脑图备注上限 10,000 字，请拆分章节。');
    }
  }
  return { nodeData: root, direction: 1 };
}
export function exportOutline(drawing, format) {
  const root = drawing.scene.nodeData;
  if (format === 'opml') {
    const walk = (n) =>
      `<outline text="${xml(n.topic)}"${n.note ? ` _note="${xml(n.note)}"` : ''}${n.hyperLink ? ` url="${xml(n.hyperLink)}"` : ''}>${(n.children || []).map(walk).join('')}</outline>`;
    return `<?xml version="1.0" encoding="UTF-8"?><opml version="2.0"><head><title>${xml(drawing.title)}</title></head><body>${walk(root)}</body></opml>`;
  }
  const lines = [];
  const walk = (n, depth) => {
    lines.push(
      (depth < 6 ? '#'.repeat(depth + 1) + ' ' : '  '.repeat(depth - 6) + '- ') +
        n.topic.replace(/\n/g, ' '),
    );
    if (n.note) lines.push('', n.note, '');
    (n.children || []).forEach((c) => walk(c, depth + 1));
  };
  walk(root, 0);
  return lines.join('\n');
}
export function exportXmind(drawing) {
  const walk = (n) => ({
    id: n.id,
    title: n.topic,
    notes: { plain: { content: n.note || '' } },
    labels: (n.tags || []).map((t) => (typeof t === 'string' ? t : t.text)),
    ...(n.hyperLink ? { href: n.hyperLink } : {}),
    children: { attached: (n.children || []).map(walk) },
  });
  const content = [
    {
      id: id(),
      title: drawing.title,
      rootTopic: { ...walk(drawing.scene.nodeData), structureClass: 'org.xmind.ui.logic.right' },
      relationships: (drawing.scene.arrows || []).map((a) => ({
        id: a.id,
        title: a.label,
        end1Id: a.from,
        end2Id: a.to,
      })),
    },
  ];
  return createArchive([
    { name: 'content.json', bytes: enc.encode(JSON.stringify(content)) },
    {
      name: 'metadata.json',
      bytes: enc.encode(JSON.stringify({ creator: { name: '迷雾工具箱' } })),
    },
    {
      name: 'manifest.json',
      bytes: enc.encode(
        JSON.stringify({
          'file-entries': { 'content.json': {}, 'metadata.json': {}, 'mist-drawing.json': {} },
        }),
      ),
    },
    { name: 'mist-drawing.json', bytes: encodeDrawing(drawing) },
  ]);
}
export function importDrawingFile(bytes, name, kind) {
  if (bytes.length > MAX_DRAWING) throw Error('图稿最多 24 MB。');
  let doc = newDrawing(kind, name.replace(/\.[^.]+$/, ''));
  if (kind === 'mindmap' && /\.xmind$/i.test(name)) {
    const archive = listArchive(bytes),
      entry = archive.entries.find((e) => e.name === 'content.json');
    if (!entry)
      throw Error(
        '此文件不是 JSON 格式的 XMind 图稿；旧 XML 版请先在 XMind 中转存新版或导出 OPML。',
      );
    const sheets = JSON.parse(dec.decode(extractArchive(bytes, entry.index).bytes));
    if (!Array.isArray(sheets) || !sheets.length) throw Error('XMind 工作表无效。');
    let count = 0;
    const walk = (n, depth = 0) => {
      if (++count > MAX_NODES || depth > 60 || !n || typeof n.title !== 'string')
        throw Error('XMind 节点无效或超出 2,000 节点 / 60 层。');
      return {
        id: id(),
        topic: n.title,
        note: n.notes?.plain?.content || '',
        tags: Array.isArray(n.labels) ? n.labels : [],
        ...(n.href ? { hyperLink: n.href } : {}),
        children: Object.values(n.children || {})
          .flat()
          .map((c) => walk(c, depth + 1)),
      };
    };
    doc.scene = {
      nodeData:
        sheets.length === 1
          ? { ...walk(sheets[0].rootTopic), root: true }
          : {
              id: id(),
              topic: doc.title,
              root: true,
              children: sheets.map((s) => walk(s.rootTopic)),
            },
      direction: 1,
    };
  } else if (kind === 'mindmap' && /\.opml$/i.test(name)) {
    const xmlDoc = xmlDocument(dec.decode(bytes));
    if (xmlDoc.documentElement.tagName !== 'opml') throw Error('请选择 OPML 文件。');
    let count = 0;
    const walk = (e, depth = 0) => {
      if (++count > MAX_NODES || depth > 60 || !e.hasAttribute('text'))
        throw Error('OPML 节点无效或超限。');
      return {
        id: id(),
        topic: e.getAttribute('text'),
        note: e.getAttribute('_note') || '',
        ...(e.getAttribute('url') ? { hyperLink: e.getAttribute('url') } : {}),
        children: [...e.children]
          .filter((c) => c.tagName === 'outline')
          .map((c) => walk(c, depth + 1)),
      };
    };
    const roots = [...(xmlDoc.querySelector('body')?.children || [])]
      .filter((e) => e.tagName === 'outline')
      .map((e) => walk(e));
    if (!roots.length) throw Error('OPML 中没有大纲。');
    doc.scene = {
      nodeData:
        roots.length === 1
          ? { ...roots[0], root: true }
          : { id: id(), topic: doc.title, root: true, children: roots },
      direction: 1,
    };
  } else if (kind === 'mindmap' && /\.md$/i.test(name))
    doc.scene = markdownTree(dec.decode(bytes), doc.title);
  else {
    const value = JSON.parse(dec.decode(bytes));
    if (value.format === 'mist-drawing') doc = value;
    else if (kind === 'whiteboard' && value.type === 'excalidraw')
      doc.scene = {
        elements: value.elements,
        files: value.files || {},
        appState: value.appState || {},
      };
    else if (kind === 'mindmap' && value.nodeData) doc.scene = value;
    else throw Error('不是支持的图稿格式。');
  }
  if (doc.kind !== kind) throw Error('图稿类型不匹配。');
  return validateDrawing({ ...doc, id: id(), previewId: id(), revision: 0 });
}
