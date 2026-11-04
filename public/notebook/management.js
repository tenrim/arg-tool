import { newId, validateNote, escapeMarkdown } from './model.js';
import { mapAttachmentURLs } from './references.js';
import {
  drawingsIn,
  decodeDrawing,
  encodeDrawing,
  isDrawing,
  putDrawing,
} from '../graphics/model.js';

export function searchableText(note) {
  const parts = [note.title, note.markdown, note.folder || '', ...(note.tags || [])];
  for (const asset of note.assets) {
    parts.push(asset.name);
    if (isDrawing(asset)) {
      try {
        const d = decodeDrawing(asset);
        parts.push(d.title);
        if (d.kind === 'whiteboard') parts.push(...d.scene.elements.map((e) => e.text || ''));
        else {
          const walk = (n) => {
            parts.push(
              n.topic,
              n.note || '',
              ...(n.tags || []).map((t) => (typeof t === 'string' ? t : t.text)),
            );
            (n.children || []).forEach(walk);
          };
          walk(d.scene.nodeData);
        }
      } catch {
        /* Original invalid attachment remains downloadable. */
      }
    } else if (/^text\//.test(asset.mime)) parts.push(new TextDecoder().decode(asset.bytes));
  }
  return parts.join('\n').toLocaleLowerCase();
}
export function sortNotes(notes, { folder = '', tag = '', sort = 'updated' } = {}) {
  return notes
    .filter((n) => (!folder || n.folder === folder) && (!tag || (n.tags || []).includes(tag)))
    .sort(
      (a, b) =>
        Number(!!b.pinned) - Number(!!a.pinned) ||
        (sort === 'title'
          ? a.title.localeCompare(b.title, 'zh-CN')
          : sort === 'created'
            ? b.created.localeCompare(a.created)
            : sort === 'manual'
              ? (a.order || 0) - (b.order || 0)
              : b.updated.localeCompare(a.updated)),
    );
}
export function cloneNote(note, { imported = false } = {}) {
  const next = structuredClone(note),
    id = newId();
  next.id = id;
  next.title = note.title.slice(0, 110) + (imported ? '（导入）' : '（副本）');
  next.revision = 0;
  next.created = next.updated = new Date().toISOString();
  // IDs of assets are scoped to their owning note. Keeping them preserves every
  // reference inside diagrams and Markdown, while remapping self note links.
  next.markdown = next.markdown.split('notebook-note:' + note.id).join('notebook-note:' + id);
  next.history = (next.history || []).map((h) => ({
    ...h,
    id,
    markdown: h.markdown.split('notebook-note:' + note.id).join('notebook-note:' + id),
  }));
  return validateNote(next);
}
export function cloneImportedNotes(notes) {
  const copies = notes.map((n) => cloneNote(n, { imported: true })),
    mapping = new Map(notes.map((n, i) => [n.id, copies[i].id]));
  const rewrite = (note) => {
    note.markdown = note.markdown.replace(/notebook-note:([a-z0-9-]+)/gi, (url, id) =>
      mapping.has(id) ? 'notebook-note:' + mapping.get(id) : url,
    );
    for (const a of note.assets.filter(isDrawing)) {
      let d;
      try {
        d = decodeDrawing(a);
      } catch {
        continue;
      }
      for (const s of d.sources) if (mapping.has(s.noteId)) s.noteId = mapping.get(s.noteId);
      if (d.kind === 'whiteboard')
        for (const e of d.scene.elements) {
          const target = e.link?.match(/^notebook-note:(.+)$/)?.[1];
          if (mapping.has(target)) e.link = 'notebook-note:' + mapping.get(target);
        }
      else {
        const visit = (n) => {
          const target = n.hyperLink?.match(/^notebook-note:(.+)$/)?.[1];
          if (mapping.has(target)) n.hyperLink = 'notebook-note:' + mapping.get(target);
          (n.children || []).forEach(visit);
        };
        visit(d.scene.nodeData);
      }
      a.bytes = encodeDrawing(d);
    }
    (note.history || []).forEach(rewrite);
    return note;
  };
  return copies.map(rewrite);
}
export function removeAsset(note, id) {
  const next = structuredClone(note),
    entry = drawingsIn(next).find((e) => e.drawing.id === id || e.drawing.previewId === id),
    ids = new Set(entry ? [entry.drawing.id, entry.drawing.previewId] : [id]);
  next.assets = next.assets.filter((a) => !ids.has(a.id));
  next.markdown = mapAttachmentURLs(
    next.markdown,
    new Map([...ids].map((i) => ['notebook-asset:' + i, '#removed-attachment'])),
  );
  next.markdown = next.markdown.replace(
    /!?\[([^\]\n]*)\]\(#removed-attachment\)/g,
    '[已移除附件：$1]',
  );
  // Only exact attachment destinations change; literal puzzle text stays intact.
  return validateNote(next);
}
export function copyDrawing(note, id, target, { move = false } = {}) {
  const entry = drawingsIn(note).find((e) => e.drawing.id === id);
  if (!entry) throw Error('图稿不存在。');
  const drawing = {
    ...entry.drawing,
    id: newId(),
    previewId: newId(),
    revision: 0,
    title: move ? entry.drawing.title : entry.drawing.title.slice(0, 110) + '（副本）',
  };
  const preview = note.assets.find((a) => a.id === entry.drawing.previewId)?.bytes;
  return putDrawing(target, drawing, { preview, expectedRevision: 0 }).note;
}
export const noteLink = (note) => `[${escapeMarkdown(note.title)}](notebook-note:${note.id})`;
export function noteLinks(note) {
  return [...note.markdown.matchAll(/\]\(notebook-note:([a-z0-9-]+)\)/gi)].map((m) => m[1]);
}
