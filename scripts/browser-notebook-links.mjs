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
  const p = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  p.setDefaultTimeout(20000);
  await p.goto(site.base + '/?layout=chronicle#notebook');
  const ed = p.locator('#notebook-editor .vditor-ir [contenteditable=true]'),
    manager = p.locator('#notebook-manage');
  const saved = (k) =>
    p.waitForFunction(
      (k) =>
        document.querySelector('#' + k + '-status')?.textContent ===
        (k === 'notebook' ? '已保存到本机' : '已保存到笔记本'),
      k,
    );
  await p.locator('#notebook-new').click();
  await ed.waitFor();
  await p.locator('#notebook-title').fill('笔记甲');
  await ed.fill('# 标题甲\n原始内容');
  await saved('notebook');
  await p.getByRole('button', { name: '整理笔记', exact: true }).click();
  await manager.getByRole('button', { name: '复制笔记', exact: true }).click();
  await manager.getByText('已创建包含正文和全部附件的副本。', { exact: true }).waitFor();
  await manager.getByRole('button', { name: '关闭', exact: true }).click();
  assert.equal(await p.locator('#notebook-list [data-note-id]').count(), 2);
  await p.getByRole('button', { name: '笔记关联', exact: true }).click();
  await manager.getByRole('button', { name: '插入笔记引用', exact: true }).click();
  await manager.waitFor({ state: 'hidden' }).catch(async (e) => {
    console.log(await manager.innerText());
    throw e;
  });
  await saved('notebook');
  await ed.locator('.vditor-ir__link').filter({ hasText: '笔记甲（副本）' }).click();
  await p.waitForFunction(
    () => document.querySelector('#notebook-title')?.value === '笔记甲（副本）',
  );
  await p.getByRole('button', { name: '笔记关联', exact: true }).click();
  await manager.getByRole('button', { name: '笔记甲', exact: true }).click();
  await p.waitForFunction(() => document.querySelector('#notebook-title')?.value === '笔记甲');
  await p.getByRole('button', { name: '批量管理', exact: true }).click();
  await manager.getByRole('checkbox').first().check();
  await manager.getByRole('checkbox').last().check();
  await manager.getByLabel('移入项目（留空保持）').fill('共同项目');
  await manager.getByRole('button', { name: '应用到选中笔记', exact: true }).click();
  await manager.waitFor({ state: 'hidden' }).catch(async (e) => {
    console.log(await manager.innerText());
    throw e;
  });
  await p.locator('#notebook-actions').click();
  await p.getByRole('button', { name: '正文加入思维导图', exact: true }).click();
  await p.locator('#graphic-start').click();
  await saved('mindmap');
  await p
    .locator('#mindmap-sources')
    .getByRole('button', { name: '从笔记更新', exact: true })
    .click();
  await saved('mindmap');
  await p
    .locator('#mindmap-sources')
    .getByRole('button', { name: '写回关联笔记…', exact: true })
    .click();
  await p
    .locator('#graphic-sync')
    .getByRole('button', { name: '确认替换正文', exact: true })
    .click();
  await p.locator('#graphic-sync').waitFor({ state: 'hidden' });
  await p.locator('#panel-mindmap').getByRole('button', { name: '返回笔记', exact: true }).click();
  await ed.waitFor();
  await p.getByRole('button', { name: '附件与图稿', exact: true }).click();
  await manager.locator('select[aria-label="目标笔记"]').selectOption({ label: '笔记甲（副本）' });
  await manager.getByRole('button', { name: '移动图稿', exact: true }).click();
  await manager.getByText('没有附件或图稿。', { exact: true }).waitFor();
  await manager.getByRole('button', { name: '关闭', exact: true }).click();
  const state = await p.evaluate(async () => {
    const { createNotebookStore } = await import('/notebook/store.js'),
      { drawingsIn } = await import('/graphics/model.js');
    const s = createNotebookStore();
    try {
      return (await s.list()).map((n) => ({
        title: n.title,
        folder: n.folder,
        history: n.history.length,
        drawings: drawingsIn(n).length,
      }));
    } finally {
      await s.close();
    }
  });
  assert(state.every((n) => n.folder === '共同项目'));
  assert.equal(state.find((n) => n.title === '笔记甲').drawings, 0);
  assert.equal(state.find((n) => n.title === '笔记甲（副本）').drawings, 1);
  assert(state.every((n) => n.history > 0));
  console.log(
    'PASS links, backlinks, copy, batch organization, linked refresh/writeback and atomic drawing move',
  );
} finally {
  try {
    await browser.close();
  } finally {
    await site.close();
  }
}
