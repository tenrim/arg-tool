import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newNote,
  withHistory,
  exportBackup,
  parseBackup,
  validateNote,
} from '../public/notebook/model.js';
import {
  cloneNote,
  cloneImportedNotes,
  removeAsset,
  copyDrawing,
  searchableText,
  sortNotes,
} from '../public/notebook/management.js';
import {
  newDrawing,
  putDrawing,
  drawingsIn,
  validateDrawing,
  validateLibrary,
  reconcileOutline,
} from '../public/graphics/model.js';
import {
  markdownTree,
  exportXmind,
  importDrawingFile,
  exportOutline,
} from '../public/graphics/interchange.js';
test('history restores complete bytes and metadata through backup and copied IDs', () => {
  const n = {
    ...newNote('原文'),
    folder: '谜题一',
    tags: ['待核查'],
    pinned: true,
    markdown: '第一版',
    assets: [
      {
        id: 'a',
        name: '原始.bin',
        mime: 'application/octet-stream',
        bytes: new Uint8Array([0, 255]),
      },
    ],
  };
  const next = withHistory({ ...n, markdown: '第二版', assets: [] }, n, { checkpoint: true }),
    restored = parseBackup(exportBackup([next]))[0];
  assert.equal(restored.history[0].markdown, '第一版');
  assert.deepEqual(restored.history[0].assets[0].bytes, n.assets[0].bytes);
  assert.equal(restored.folder, '谜题一');
  assert.deepEqual(restored.tags, ['待核查']);
  assert.equal(restored.pinned, true);
  const copy = cloneNote(restored);
  assert.notEqual(copy.id, n.id);
  assert.equal(copy.history[0].id, copy.id);
  validateNote(copy);
});
test('history checkpoints coalesce autosaves and explicit destructive actions preserve prior content', () => {
  const n = newNote();
  n.markdown = '原文';
  let next = withHistory({ ...n, markdown: '改动' }, n);
  assert.equal(next.history.length, 1);
  next = withHistory({ ...next, markdown: '继续' }, next);
  assert.equal(next.history.length, 1);
  next = withHistory({ ...next, markdown: '' }, next, { checkpoint: true });
  assert.equal(next.history.at(-1).markdown, '继续');
  for (let i = 0; i < 25; i++)
    next = withHistory({ ...next, markdown: String(i) }, next, { checkpoint: true });
  assert.equal(next.history.length, 20);
});
test('multi-note backup import remaps cross-note and historical links without dropping bytes', () => {
  const a = newNote('甲'),
    b = newNote('乙');
  a.markdown = `[乙](notebook-note:${b.id})`;
  b.markdown = `[甲](notebook-note:${a.id})`;
  const d = newDrawing('mindmap');
  d.scene.nodeData.hyperLink = 'notebook-note:' + b.id;
  const linked = putDrawing(a, d).note;
  linked.history = [structuredClone(a)];
  const copies = cloneImportedNotes(parseBackup(exportBackup([linked, b])));
  assert(copies[0].markdown.includes(copies[1].id));
  assert(copies[1].markdown.includes(copies[0].id));
  assert(copies[0].history[0].markdown.includes(copies[1].id));
  assert.equal(
    drawingsIn(copies[0])[0].drawing.scene.nodeData.hyperLink,
    'notebook-note:' + copies[1].id,
  );
  copies.forEach((n) => validateNote(n));
});
test('deleting or moving a drawing handles preview pair and leaves literal clue bytes intact', () => {
  const d = newDrawing('mindmap', '线索'),
    n = putDrawing(newNote(), d, { preview: new Uint8Array([137, 80]) }).note;
  n.markdown += '\n`notebook-asset:' + d.id + '`';
  const removed = removeAsset(n, d.id);
  assert.equal(removed.assets.length, 0);
  assert(removed.markdown.includes('`notebook-asset:' + d.id + '`'));
  assert(!removed.markdown.includes('](notebook-asset:'));
  const destination = copyDrawing(n, d.id, newNote(), { move: true });
  assert.equal(drawingsIn(destination)[0].drawing.title, '线索');
  assert.notEqual(drawingsIn(destination)[0].drawing.id, d.id);
  assert.equal(destination.assets.length, 2);
});
test('search includes brain and board text, node notes, tags and text attachments', () => {
  let n = newNote();
  let d = newDrawing('mindmap');
  d.scene.nodeData.children = [{ id: 'clue', topic: '脑图秘密', note: '节点备注' }];
  n = putDrawing(n, d).note;
  d = newDrawing('whiteboard');
  d.scene.elements = [
    { id: 'word', type: 'text', x: 0, y: 0, width: 10, height: 10, angle: 0, text: '白板秘密' },
  ];
  n = putDrawing(n, d).note;
  n.assets.push({
    id: 'text',
    name: '附件.txt',
    mime: 'text/plain',
    bytes: new TextEncoder().encode('文件秘密'),
  });
  for (const q of ['脑图秘密', '节点备注', '白板秘密', '文件秘密'])
    assert(searchableText(n).includes(q));
});
test('organization sorts pinned entries first and combines project and tag filters', () => {
  const a = { ...newNote('甲'), folder: '项目', tags: ['线索'], order: 2 },
    b = { ...newNote('乙'), folder: '项目', tags: ['线索'], pinned: true, order: 5 },
    c = { ...newNote('丙'), folder: '其他' };
  assert.deepEqual(
    sortNotes([a, c, b], { folder: '项目', tag: '线索', sort: 'manual' }).map((n) => n.title),
    ['乙', '甲'],
  );
});
test('whiteboard validation preserves styles and private viewport but removes collaborators', () => {
  const d = newDrawing('whiteboard');
  d.scene.elements = [
    {
      id: 'shape',
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      angle: 0,
      roughness: 2,
      fillStyle: 'hachure',
    },
  ];
  d.scene.appState = {
    viewBackgroundColor: '#ffffff',
    gridModeEnabled: true,
    scrollX: 25,
    scrollY: 12,
    zoom: { value: 2 },
    currentItemFontFamily: 1,
    collaborators: { secret: 1 },
  };
  const clean = validateDrawing(d);
  assert.equal(clean.scene.elements[0].roughness, 2);
  assert.equal(clean.scene.appState.currentItemFontFamily, 1);
  assert.equal(clean.scene.appState.zoom.value, 2);
  assert(!('collaborators' in clean.scene.appState));
  assert.equal(
    validateLibrary([{ id: 'l', created: Date.now(), elements: d.scene.elements }])[0].elements[0]
      .fillStyle,
    'hachure',
  );
  assert.throws(
    () =>
      validateLibrary([
        { id: 'l', created: 1, elements: [{ ...d.scene.elements[0], type: 'embeddable' }] },
      ]),
    /嵌入/,
  );
});
test('markdown hierarchy preserves sections and fenced headings as notes', () => {
  const scene = markdownTree('# 一级\n正文\n## 二级\n```txt\n# 代码不是标题\n```\n- 条目', '来源');
  assert.equal(scene.nodeData.children[0].children[0].topic, '二级');
  assert(scene.nodeData.children[0].children[0].note.includes('# 代码不是标题'));
  assert.equal(scene.nodeData.children[0].children[0].children[0].topic, '条目');
});
test('refreshing linked headings preserves node identity and visual edits', () => {
  const old = {
      id: 'root',
      topic: '笔记',
      children: [
        { id: 'clue', topic: '线索', note: '旧内容', style: { color: '#ff0000' }, children: [] },
      ],
    },
    incoming = markdownTree('# 线索\n新内容', '笔记');
  const merged = reconcileOutline(old, incoming.nodeData);
  assert.equal(merged.children[0].id, 'clue');
  assert.equal(merged.children[0].note, '新内容');
  assert.equal(merged.children[0].style.color, '#ff0000');
});
test('XMind exports valid ZIP with hierarchy and keeps a complete site drawing sidecar', () => {
  const d = newDrawing('mindmap', '工作表');
  d.scene.nodeData.children = [
    { id: 'a', topic: '中文 & <线索>', note: '注释', children: [{ id: 'b', topic: '下级' }] },
  ];
  const bytes = exportXmind(d),
    imported = importDrawingFile(bytes, '导出.xmind', 'mindmap');
  assert.equal(imported.scene.nodeData.children[0].topic, '中文 & <线索>');
  assert.equal(imported.scene.nodeData.children[0].note, '注释');
  assert.equal(imported.scene.nodeData.children[0].children[0].topic, '下级');
  assert(exportOutline(d, 'opml').includes('&amp; &lt;线索&gt;'));
});
