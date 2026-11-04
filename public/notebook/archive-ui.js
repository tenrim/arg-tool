import {
  Box,
  Button,
  Dialog,
  dialogController,
  Toolbar,
  Result,
  Status,
  EmptyState,
  updateStatus,
} from '../ui/index.js';
import { noteSummary, backupGroups, exportBackup } from './model.js';

// No second store or transaction queue: both are injected by the notebook owner.
export function mountNotebookArchive({ store, action, refresh, download, status, captureDraft }) {
  async function prepareBackup() {
    const draft = captureDraft();
    const summaries = await store.summaries({ includeDeleted: true });
    const all = new Map(summaries.map((n) => [n.id, n]));
    if (draft) all.set(draft.id, noteSummary(draft));
    const parts = backupGroups([...all.values()]);
    if (!parts.length) {
      updateStatus(status, '没有可备份的笔记。');
      return;
    }
    async function savePart(part, index) {
      const records = [];
      for (const summary of part) {
        const note =
          summary.id === draft?.id ? draft : await store.get(summary.id, { includeDeleted: true });
        if (!note || note.revision !== summary.revision)
          throw Error('笔记在备份准备后发生变化，请重新点击备份全部笔记。');
        records.push(note);
      }
      download(
        exportBackup(records),
        parts.length === 1
          ? '迷雾工具箱-笔记备份.json'
          : '迷雾工具箱-笔记备份-' + (index + 1) + '-共' + parts.length + '份.json',
        'application/json',
      );
      updateStatus(status, '备份已下载，包含正文、原始附件及可编辑图稿（含回收站）。', 'success');
    }
    if (parts.length === 1) {
      await savePart(parts[0], 0);
      return;
    }
    backupParts.replaceChildren(
      ...parts.map((part, index) =>
        Button({
          text: '下载第 ' + (index + 1) + ' / ' + parts.length + ' 份（' + part.length + ' 篇）',
          on: {
            click: () =>
              action(async () => {
                await savePart(part, index);
                backupParts.children[index].textContent =
                  '已下载第 ' + (index + 1) + ' / ' + parts.length + ' 份（可再次下载）';
              }),
          },
        }),
      ),
    );
    backupModal.open();
  }
  const backupParts = Result({ layout: 'collection' }),
    backupClose = Button({ text: '关闭' }),
    backupDialog = Dialog({
      id: 'notebook-backup-parts',
      attrs: { 'aria-labelledby': 'notebook-backup-title' },
      children: [
        Toolbar({
          children: [
            Box({ tag: 'h2', id: 'notebook-backup-title', text: '分批完整备份' }),
            backupClose,
          ],
        }),
        Box({
          tag: 'p',
          text: '请逐份下载并保留全部文件。每份都能独立导入，包含对应笔记的完整正文、附件和可编辑图稿。',
        }),
        backupParts,
      ],
    });
  document.body.append(backupDialog);
  const backupModal = dialogController(backupDialog, {
    closeButton: backupClose,
    initialFocus: backupClose,
  });
  const trashList = Result({ layout: 'collection' }),
    trashClose = Button({ text: '关闭' }),
    trashStatus = Status(),
    trashDialog = Dialog({
      id: 'notebook-trash',
      attrs: { 'aria-labelledby': 'notebook-trash-title' },
      children: [
        Toolbar({
          children: [Box({ tag: 'h2', id: 'notebook-trash-title', text: '回收站' }), trashClose],
        }),
        Box({ tag: 'p', text: '笔记及附件会一直保留，直到你主动彻底删除。完整备份包含回收站。' }),
        trashList,
        trashStatus,
      ],
    });
  document.body.append(trashDialog);
  const trashModal = dialogController(trashDialog, {
    closeButton: trashClose,
    initialFocus: trashClose,
  });
  let purgeTarget = null;
  const purgeText = Box({ tag: 'p' }),
    purgeCancel = Button({ text: '取消' }),
    purgeConfirm = Button({
      text: '彻底删除',
      on: {
        click: () =>
          action(async () => {
            try {
              if (!purgeTarget) return;
              await store.purge(purgeTarget);
              purgeModal.close();
              await refreshTrash();
              updateStatus(trashStatus, '已彻底删除。');
            } catch (error) {
              purgeModal.close();
              updateStatus(trashStatus, error.message, 'error');
            }
          }),
      },
    });
  const purgeDialog = Dialog({
    id: 'notebook-purge',
    attrs: { 'aria-labelledby': 'notebook-purge-title' },
    children: [
      Box({ tag: 'h2', id: 'notebook-purge-title', text: '彻底删除笔记' }),
      purgeText,
      Toolbar({ children: [purgeCancel, purgeConfirm] }),
    ],
  });
  document.body.append(purgeDialog);
  const purgeModal = dialogController(purgeDialog, {
    closeButton: purgeCancel,
    initialFocus: purgeCancel,
  });
  async function refreshTrash() {
    const rows = await store.summaries({ trash: true });
    trashList.replaceChildren(
      ...rows.map((n) =>
        Box({
          children: [
            Box({ tag: 'strong', text: n.title }),
            Box({
              tag: 'p',
              text:
                '删除于 ' +
                new Date(n.deletedAt).toLocaleString('zh-CN') +
                ' · ' +
                n.assetCount +
                ' 个附件',
            }),
            Toolbar({
              children: [
                Button({
                  text: '恢复',
                  attrs: { 'aria-label': '恢复 ' + n.title },
                  on: {
                    click: () =>
                      action(async () => {
                        try {
                          await store.restore(n);
                          await refresh();
                          await refreshTrash();
                          updateStatus(trashStatus, '笔记已恢复，可在笔记列表中打开。', 'success');
                        } catch (error) {
                          updateStatus(trashStatus, error.message, 'error');
                        }
                      }),
                  },
                }),
                Button({
                  text: '彻底删除',
                  attrs: { 'aria-label': '彻底删除 ' + n.title },
                  on: {
                    click: () => {
                      purgeTarget = n;
                      purgeText.textContent =
                        '彻底删除「' +
                        n.title +
                        '」及其全部附件、脑图和白板？此操作无法撤销，请先备份。';
                      purgeModal.open();
                    },
                  },
                }),
              ],
            }),
          ],
        }),
      ),
    );
    if (!rows.length) trashList.append(EmptyState({ text: '回收站为空' }));
  }
  return {
    prepareBackup,
    async openTrash() {
      await refreshTrash();
      trashModal.open();
    },
    destroy() {
      for (const modal of [trashModal, purgeModal, backupModal]) modal.destroy();
      for (const dialog of [trashDialog, purgeDialog, backupDialog]) dialog.remove();
      purgeTarget = null;
    },
  };
}
