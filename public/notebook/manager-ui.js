import {
  Box,
  Button,
  Dialog,
  dialogController,
  Toolbar,
  Field,
  Input,
  Select,
  Option,
  Textarea,
  Result,
  Status,
  updateStatus,
  FormGrid,
  CheckGroup,
} from '../ui/index.js';
import { cloneNote, removeAsset, copyDrawing, noteLink, noteLinks } from './management.js';
import { validateNote, exportBackup } from './model.js';
import { drawingsIn, putDrawing } from '../graphics/model.js';
import { snapshot } from '../handoff/model.js';

// All writes run through the notebook's existing transaction queue. The modal
// captures IDs/revisions, never a second selected-note or persistence owner.
export function mountNotebookManager({ store, perform, current, show, download }) {
  const close = Button({ text: '关闭' }),
    heading = Box({ tag: 'h2', id: 'notebook-manage-title' }),
    body = Box(),
    status = Status(),
    dialog = Dialog({
      id: 'notebook-manage',
      className: 'ui-flow-dialog',
      attrs: { 'aria-labelledby': 'notebook-manage-title' },
      children: [Toolbar({ children: [heading, close] }), body, status],
    });
  document.body.append(dialog);
  const modal = dialogController(dialog, { closeButton: close, initialFocus: close });
  let generation = 0;
  const run = (fn) =>
    perform(async () => {
      try {
        await fn();
      } catch (e) {
        updateStatus(status, e.message, 'error');
        throw e;
      }
    });
  async function open(mode) {
    const id = current()?.id,
      rev = ++generation;
    heading.textContent = {
      organize: '整理笔记',
      assets: '附件与图稿',
      history: '历史版本',
      links: '笔记关联',
      batch: '批量管理',
    }[mode];
    body.replaceChildren();
    updateStatus(status, '正在读取…');
    modal.open();
    await run(async () => {
      const note = id ? await store.get(id) : null;
      if (rev !== generation) return;
      if (!note && mode !== 'batch') throw Error('请先打开一篇笔记。');
      updateStatus(status, '');
      if (mode === 'organize') organize(note);
      if (mode === 'assets') assets(note);
      if (mode === 'history') history(note);
      if (mode === 'links') await links(note);
      if (mode === 'batch') await batch();
    });
  }
  function organize(note) {
    const folder = Input({ value: note.folder || '', attrs: { maxlength: 120 } }),
      tags = Input({ value: (note.tags || []).join('，'), attrs: { maxlength: 1600 } }),
      pinned = Input({ type: 'checkbox', attrs: { checked: !!note.pinned } }),
      order = Input({ type: 'number', value: String(note.order || 0), attrs: { step: 1 } });
    body.append(
      FormGrid({
        children: [
          Field({ label: '项目 / 文件夹', control: folder }),
          Field({ label: '标签（逗号分隔）', control: tags }),
          Field({ label: '手动排序位置', control: order }),
        ],
      }),
      CheckGroup({ children: [Field({ label: '置顶这篇笔记', control: pinned })] }),
      Toolbar({
        children: [
          Button({
            text: '保存整理',
            variant: 'primary',
            on: {
              click: () =>
                run(async () => {
                  await store.save(
                    validateNote({
                      ...note,
                      folder: folder.value.trim(),
                      tags: [
                        ...new Set(
                          tags.value
                            .split(/[,，]/)
                            .map((s) => s.trim())
                            .filter(Boolean),
                        ),
                      ],
                      pinned: pinned.checked,
                      order: Number(order.value),
                      updated: new Date().toISOString(),
                    }),
                    { checkpoint: true },
                  );
                  modal.close();
                }),
            },
          }),
          Button({
            text: '复制笔记',
            on: {
              click: () =>
                run(async () => {
                  await store.save(cloneNote(note));
                  updateStatus(status, '已创建包含正文和全部附件的副本。', 'success');
                }),
            },
          }),
        ],
      }),
    );
  }
  function assets(note) {
    const list = Result({ layout: 'collection' });
    body.append(list);
    const drawings = drawingsIn(note),
      previews = new Set(drawings.map((e) => e.drawing.previewId));
    for (const a of note.assets.filter((a) => !previews.has(a.id))) {
      const entry = drawings.find((e) => e.drawing.id === a.id),
        name = Input({
          value: entry?.drawing.title || a.name,
          attrs: { 'aria-label': '重命名 ' + a.name, maxlength: entry ? 120 : 180 },
        }),
        target = Select({ attrs: { 'aria-label': '目标笔记' } });
      const row = Box({
        className: 'notebook-management-row',
        children: [
          Field({ label: entry ? '图稿名称' : '附件名称', control: name }),
          Box({ tag: 'p', text: a.mime + ' · ' + a.bytes.length.toLocaleString() + ' 字节' }),
        ],
      });
      list.append(row);
      const saveName = Button({
        text: '重命名',
        on: {
          click: () =>
            run(async () => {
              let next = structuredClone(note);
              if (entry) {
                next = putDrawing(
                  next,
                  { ...entry.drawing, title: name.value.trim() || entry.drawing.title },
                  { expectedRevision: entry.drawing.revision },
                ).note;
                const preview = next.assets.find((a) => a.id === entry.drawing.previewId);
                if (preview) preview.name = name.value + '.png';
              } else
                next.assets.find((item) => item.id === a.id).name = name.value.trim() || a.name;
              await store.save(validateNote(next), { checkpoint: true });
              await reloadAssets(note.id);
            }),
        },
      });
      const remove = Button({
        text: entry ? '删除整张图稿' : '删除附件',
        variant: 'danger',
        on: {
          click: () =>
            run(async () => {
              await store.save(removeAsset(note, a.id), { checkpoint: true });
              await reloadAssets(note.id);
              updateStatus(status, '已删除，可在历史版本中恢复；正文引用已标记为移除。', 'success');
            }),
        },
      });
      const actions = [
        saveName,
        remove,
        Button({ text: '下载原文件', on: { click: () => download(a.bytes, a.name, a.mime) } }),
      ];
      if (!entry) {
        const replace = Input({
          type: 'file',
          hidden: true,
          attrs: { 'aria-label': '替换 ' + a.name },
        });
        row.append(replace);
        replace.addEventListener('change', () => {
          const file = replace.files?.[0];
          replace.value = '';
          if (file)
            run(async () => {
              if (file.size > 32 * 1024 * 1024) throw Error('单附件最多 32 MB。');
              const data = snapshot({
                  bytes: new Uint8Array(await file.arrayBuffer()),
                  name: file.name,
                }),
                next = structuredClone(note);
              next.assets[next.assets.findIndex((item) => item.id === a.id)] = {
                id: a.id,
                name: data.name,
                mime: data.mime,
                bytes: data.bytes,
              };
              await store.save(validateNote(next), { checkpoint: true });
              await reloadAssets(note.id);
            });
        });
        actions.push(Button({ text: '替换文件', on: { click: () => replace.click() } }));
      } else {
        store
          .summaries()
          .then((rows) => {
            if (row.isConnected) target.replaceChildren(...rows.map((n) => Option(n.title, n.id)));
            target.value = note.id;
          })
          .catch((e) => updateStatus(status, e.message, 'error'));
        row.append(Field({ label: '复制 / 移动到', control: target }));
        actions.push(
          Button({
            text: '复制图稿',
            on: {
              click: () =>
                run(async () => {
                  const dst = target.value === note.id ? note : await store.get(target.value);
                  if (!dst) throw Error('目标笔记已删除。');
                  await store.save(copyDrawing(note, a.id, dst), { checkpoint: true });
                  await reloadAssets(note.id);
                  updateStatus(status, '图稿已复制。', 'success');
                }),
            },
          }),
          Button({
            text: '移动图稿',
            on: {
              click: () =>
                run(async () => {
                  if (target.value === note.id) throw Error('请选择另一篇笔记。');
                  const dst = await store.get(target.value);
                  if (!dst) throw Error('目标笔记已删除。');
                  await store.saveMany([
                    removeAsset(note, a.id),
                    copyDrawing(note, a.id, dst, { move: true }),
                  ]);
                  await reloadAssets(note.id);
                  updateStatus(status, '图稿已移动。', 'success');
                }),
            },
          }),
        );
      }
      row.append(Toolbar({ children: actions }));
    }
    if (!list.children.length) list.append(Box({ tag: 'p', text: '没有附件或图稿。' }));
  }
  async function reloadAssets(id) {
    const n = await store.get(id);
    body.replaceChildren();
    assets(n);
  }
  function history(note) {
    const records = note.history || [];
    body.append(
      Box({
        tag: 'p',
        text: '自动保存约每 5 分钟保留检查点；删除、替换、移动等操作额外保留操作前版本。最多保留 20 份、合计 64 MB，最旧记录自动轮换，完整备份包含这些版本。',
      }),
    );
    if (!records.length) {
      body.append(Box({ tag: 'p', text: '暂无历史版本；启用此功能之前的修改无法补回。' }));
      return;
    }
    const list = Select({
        id: 'notebook-history-select',
        children: records
          .map((h, i) =>
            Option(new Date(h.updated).toLocaleString('zh-CN') + ' · ' + h.title, String(i)),
          )
          .reverse(),
      }),
      preview = Textarea({
        id: 'notebook-history-preview',
        attrs: { readonly: true, 'aria-label': '历史正文' },
      }),
      details = Box({ tag: 'p' });
    const display = () => {
      const h = records[Number(list.value)];
      preview.value = h.markdown;
      details.textContent = h.assets.length + ' 个附件：' + h.assets.map((a) => a.name).join('、');
    };
    list.addEventListener('change', display);
    display();
    body.append(
      Field({ label: '保存时间', control: list }),
      preview,
      details,
      Toolbar({
        children: [
          Button({
            text: '恢复此版本',
            variant: 'primary',
            on: {
              click: () =>
                run(async () => {
                  const h = records[Number(list.value)];
                  await store.save(
                    {
                      ...structuredClone(h),
                      revision: note.revision,
                      updated: new Date().toISOString(),
                      history: note.history,
                    },
                    { checkpoint: true },
                  );
                  modal.close();
                }),
            },
          }),
          Button({
            text: '下载此版本备份',
            on: {
              click: () =>
                download(
                  exportBackup([records[Number(list.value)]]),
                  note.title + '-历史版本.json',
                  'application/json',
                ),
            },
          }),
        ],
      }),
    );
  }
  async function links(note) {
    const all = await store.list(),
      target = Select({
        id: 'notebook-link-target',
        children: all.filter((n) => n.id !== note.id).map((n) => Option(n.title, n.id)),
      });
    body.append(
      Field({ label: '引用另一篇笔记', control: target }),
      Button({
        text: '插入笔记引用',
        disabled: all.length < 2,
        on: {
          click: () =>
            run(async () => {
              const n = all.find((n) => n.id === target.value);
              if (!n) throw Error('请选择笔记。');
              await store.save(
                {
                  ...note,
                  markdown: note.markdown + '\n\n' + noteLink(n),
                  updated: new Date().toISOString(),
                },
                { checkpoint: true },
              );
              modal.close();
            }),
        },
      }),
    );
    for (const [title, rows] of [
      ['当前笔记引用', all.filter((n) => noteLinks(note).includes(n.id))],
      ['引用当前笔记', all.filter((n) => noteLinks(n).includes(note.id))],
    ]) {
      body.append(Box({ tag: 'h3', text: title }));
      body.append(
        Toolbar({
          children: rows.length
            ? rows.map((n) =>
                Button({
                  text: n.title,
                  on: {
                    click: () => {
                      modal.close();
                      show(n.id);
                    },
                  },
                }),
              )
            : [Box({ tag: 'span', text: '暂无' })],
        }),
      );
    }
  }
  async function batch() {
    const all = await store.summaries(),
      selected = new Set(),
      list = Result({ layout: 'collection' }),
      folder = Input({ attrs: { maxlength: 120 } }),
      tag = Input({ attrs: { maxlength: 80 } }),
      pinned = Select({
        children: [
          Option('保持置顶状态', ''),
          Option('全部置顶', 'true'),
          Option('取消置顶', 'false'),
        ],
      });
    for (const n of all) {
      const box = Input({
        type: 'checkbox',
        on: { change: (e) => (e.target.checked ? selected.add(n.id) : selected.delete(n.id)) },
      });
      list.append(Field({ label: n.title, control: box }));
    }
    body.append(
      list,
      FormGrid({
        children: [
          Field({ label: '移入项目（留空保持）', control: folder }),
          Field({ label: '添加标签（留空保持）', control: tag }),
          Field({ label: '置顶', control: pinned }),
        ],
      }),
      Button({
        text: '应用到选中笔记',
        variant: 'primary',
        on: {
          click: () =>
            run(async () => {
              if (!selected.size) throw Error('请先选择笔记。');
              const rows = [];
              for (const id of selected) {
                const n = await store.get(id);
                if (!n) throw Error('笔记已删除，请重新打开列表。');
                rows.push({
                  ...n,
                  ...(folder.value.trim() ? { folder: folder.value.trim() } : {}),
                  ...(tag.value.trim()
                    ? { tags: [...new Set([...(n.tags || []), tag.value.trim()])] }
                    : {}),
                  ...(pinned.value ? { pinned: pinned.value === 'true' } : {}),
                });
              }
              await store.saveMany(rows);
              modal.close();
            }),
        },
      }),
    );
  }
  dialog.addEventListener('close', () => generation++);
  return {
    open,
    destroy() {
      generation++;
      modal.destroy();
      dialog.remove();
    },
  };
}
