import { startBrowserTestSite } from './browser-test-site.mjs';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite();
const browser = await chromium
  .launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
  .catch(async (error) => {
    await site.close();
    throw error;
  });
try {
  for (const width of (process.env.NOTEBOOK_WIDTHS || '1440,390').split(',').map(Number)) {
    const context = await browser.newContext({
        viewport: { width, height: 1000 },
        reducedMotion: 'reduce',
      }),
      page = await context.newPage(),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.setDefaultTimeout(20000);
    await page.goto(site.base + '/?layout=chronicle#notebook');
    await page.locator('#notebook-new').click();
    const editor = page.locator('#notebook-editor .vditor-ir [contenteditable=true]'),
      manager = page.locator('#notebook-manage');
    const saved = (kind) =>
      page.waitForFunction(
        (k) =>
          document.querySelector('#' + k + '-status')?.textContent ===
          (k === 'notebook' ? '已保存到本机' : '已保存到笔记本'),
        kind,
      );
    await editor.waitFor();
    await page.locator('#notebook-title').fill('线索整理');
    await editor.fill('# 第一节\n原始正文\n## 第二节\n另一条线索');
    await saved('notebook');
    await page.getByRole('button', { name: '整理笔记', exact: true }).click();
    await manager.getByLabel('项目 / 文件夹', { exact: true }).fill('测试项目');
    await manager.getByLabel('标签（逗号分隔）').fill('线索，待查');
    await manager.getByLabel('置顶这篇笔记').check();
    await manager.getByRole('button', { name: '保存整理', exact: true }).click();
    await manager.waitFor({ state: 'hidden' });
    await saved('notebook');
    assert.equal(
      await page.locator('#notebook-folder-filter option').last().textContent(),
      '测试项目',
    );
    await page.locator('#notebook-file').setInputFiles({
      name: '线索.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('附件里才有的文字'),
    });
    await saved('notebook');
    await page.locator('#notebook-attachments').getByText('线索.txt', { exact: true }).waitFor();
    await page.getByRole('button', { name: '附件与图稿', exact: true }).click();
    await manager.getByRole('button', { name: '删除附件', exact: true }).click();
    await manager.getByText('没有附件或图稿。', { exact: true }).waitFor();
    await manager.getByRole('button', { name: '关闭', exact: true }).click();
    await page.getByRole('button', { name: '历史版本', exact: true }).click();
    const history = page.locator('#notebook-history-select');
    await history.waitFor();
    await manager.getByRole('button', { name: '恢复此版本', exact: true }).click();
    await manager.waitFor({ state: 'hidden' });
    await page.locator('#notebook-attachments').getByText('线索.txt', { exact: true }).waitFor();
    await page.locator('#notebook-search').fill('附件里才有');
    await page.locator('#notebook-list [data-note-id]').first().waitFor();
    assert((await page.locator('#notebook-list').innerText()).includes('线索整理'));
    await page.locator('#notebook-search').fill('');
    await page.locator('#notebook-actions').click();
    await page.getByRole('button', { name: '正文加入思维导图', exact: true }).click();
    await page.locator('#graphic-start').click();
    await saved('mindmap');
    const mind = page.locator('#mindmap-editor > .graphic-engine-session:not([hidden])');
    await mind.getByText('第一节', { exact: true }).waitFor();
    await mind.getByText('第二节', { exact: true }).waitFor();
    await page
      .locator('#panel-mindmap')
      .getByRole('button', { name: '导出设置', exact: true })
      .click();
    await page.locator('#graphic-export-format').selectOption('svg');
    await page.locator('#graphic-export-background').selectOption('transparent');
    let [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#graphic-export').getByRole('button', { name: '下载', exact: true }).click(),
    ]);
    let svg = await readFile(await download.path(), 'utf8');
    assert(svg.includes('<svg'));
    assert(!/<svg[^>]*>\s*<rect[^>]*fill="#0b1019"/.test(svg));
    await page.locator('#graphic-export-format').selectOption('opml');
    [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#graphic-export').getByRole('button', { name: '下载', exact: true }).click(),
    ]);
    const opml = await readFile(await download.path());
    assert(opml.toString().includes('第一节'));
    await page
      .locator('#graphic-export')
      .getByRole('button', { name: '关闭', exact: true })
      .click();
    const geometry = await page.evaluate(() => {
      const canvas = document.querySelector('#mindmap-editor .map-container');
      return { w: canvas.clientWidth, h: canvas.clientHeight };
    });
    assert(geometry.w > 100 && geometry.h > 100);
    await page
      .locator('#panel-mindmap')
      .getByRole('button', { name: '返回笔记', exact: true })
      .click();
    await page.locator('[data-notebook-drawing]').first().click();
    await saved('mindmap');
    await mind.getByText('第一节', { exact: true }).waitFor();
    await page
      .locator('#mindmap-import')
      .setInputFiles({ name: '重新导入.opml', mimeType: 'text/x-opml', buffer: opml });
    await page.locator('#graphic-start').click();
    await saved('mindmap');
    await mind.getByText('第二节', { exact: true }).waitFor();
    await page
      .locator('#panel-mindmap')
      .getByRole('button', { name: '返回笔记', exact: true })
      .click();
    await editor.waitFor();
    await page.waitForURL('**#notebook');
    await page.reload();
    await editor.waitFor();
    const data = await page.evaluate(async () => {
      const { createNotebookStore } = await import('/notebook/store.js');
      const s = createNotebookStore();
      try {
        const notes = await s.list();
        return notes.map((n) => ({
          title: n.title,
          folder: n.folder,
          tags: n.tags,
          pinned: n.pinned,
          history: n.history?.length,
          assets: n.assets.length,
        }));
      } finally {
        await s.close();
      }
    });
    assert.equal(data[0].folder, '测试项目');
    assert.equal(data[0].pinned, true);
    assert(data[0].history > 0);
    assert(data[0].assets >= 5);
    assert.deepEqual(errors, []);
    console.log(
      'PASS notebook management',
      width,
      'organization, attachment deletion/history restore, attachment search, heading tree, SVG/OPML, reopen/reload',
    );
    await context.close();
  }
} finally {
  try {
    await browser.close();
  } finally {
    await site.close();
  }
}
