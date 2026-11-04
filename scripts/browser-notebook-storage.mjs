import { startBrowserTestSite } from './browser-test-site.mjs';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite();
const browser = await chromium
  .launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
  .catch(async (error) => {
    await site.close();
    throw error;
  });
try {
  const page = await browser.newPage();
  await page.goto(site.base + '/#home');
  const result = await page.evaluate(async () => {
    const { createNotebookStore } = await import('/notebook/store.js'),
      { newNote, noteSummary } = await import('/notebook/model.js');
    const oldNote = {
      ...newNote('旧数据库笔记'),
      markdown: '旧内容不变',
      revision: 1,
      assets: [
        {
          id: 'original',
          name: '原始.bin',
          mime: 'application/octet-stream',
          bytes: new Uint8Array([0, 255, 128]),
        },
      ],
    };
    const dbName = 'notebook-migration-regression-' + crypto.randomUUID();
    await new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, 2);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('notes', { keyPath: 'id' }).put(oldNote);
        req.result.createObjectStore('note-index', { keyPath: 'id' }).put(noteSummary(oldNote));
      };
      req.onsuccess = () => {
        req.result.close();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
    const store = createNotebookStore({
      open: (_name, version) => indexedDB.open(dbName, version),
    });
    try {
      const restored = await store.get(oldNote.id);
      await store.workspaceSet('whiteboard-library', [{ id: 'test', value: '持久数据' }]);
      const a = await store.save(newNote('甲')),
        b = await store.save(newNote('乙'));
      await store.save({ ...b, title: '已被其他窗口修改' });
      let conflict = false;
      try {
        await store.saveMany([
          { ...a, title: '不能部分写入' },
          { ...b, title: '过期修改' },
        ]);
      } catch {
        conflict = true;
      }
      const unchanged = await store.get(a.id);
      await store.close();
      const library = await store.workspaceGet('whiteboard-library');
      return {
        oldMarkdown: restored.markdown,
        bytes: [...restored.assets[0].bytes],
        conflict,
        title: unchanged.title,
        library,
      };
    } finally {
      await store.close();
      indexedDB.deleteDatabase(dbName);
    }
  });
  assert.equal(result.oldMarkdown, '旧内容不变');
  assert.deepEqual(result.bytes, [0, 255, 128]);
  assert(result.conflict);
  assert.equal(result.title, '甲');
  assert.equal(result.library[0].value, '持久数据');
  console.log(
    'PASS version 2 migration, original bytes, atomic rollback on stale revision, workspace reopen',
  );
} finally {
  try {
    await browser.close();
  } finally {
    await site.close();
  }
}
