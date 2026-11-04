import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { createDevServer, closeDevServer } from './server.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const server = createDevServer({
  env: {},
  feedbackStarter: async () => ({ state: 'unconfigured', close: async () => {} }),
  onlineQueryFactory: () => ({
    handle() {
      return false;
    },
    close() {},
  }),
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const amber = 'rgb(240, 165, 0)',
  tint = 'rgba(240, 165, 0, 0.08)';
async function state(node) {
  return node.evaluate((n) => {
    const s = getComputedStyle(n);
    let background = s.backgroundColor;
    for (let parent = n.parentElement; parent; parent = parent.parentElement) {
      const surfaces = parent.shadowRoot?.querySelectorAll(
        '[data-slot=trigger-highlight]:not([data-leaving])',
      );
      if (!surfaces?.length) continue;
      const r = n.getBoundingClientRect();
      for (const surface of surfaces) {
        const b = surface.getBoundingClientRect();
        if (Math.abs(r.x - b.x) < 2 && Math.abs(r.y - b.y) < 2)
          background = getComputedStyle(surface).backgroundColor;
      }
      break;
    }
    return { color: s.color, background, outline: s.outlineStyle };
  });
}
async function expectPaint(node, color, background) {
  const deadline = Date.now() + 4000;
  let value;
  do {
    value = await state(node);
    if (value.color === color && value.background === background) return value;
    await node.evaluate(() => new Promise(requestAnimationFrame));
  } while (Date.now() < deadline);
  assert.deepEqual({ color: value.color, background: value.background }, { color, background });
}
try {
  await mkdir('outputs/notebook-ui', { recursive: true });
  for (const [width, motion] of [
    [1440, 'no-preference'],
    [800, 'reduce'],
    [320, 'reduce'],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      reducedMotion: motion,
      colorScheme: 'dark',
    });
    const page = await context.newPage(),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + '/?layout=chronicle#notebook');
    await page.locator('#notebook-new').click();
    const editor = page.locator('#notebook-editor .vditor-ir [contenteditable=true]');
    await editor.fill('保留正文与输入');
    await page.waitForFunction(
      () => document.querySelector('#notebook-status').textContent === '已保存到本机',
    );
    await page.mouse.move(0, 0);
    await editor.blur();
    await expectPaint(page.locator('#notebook-new'), 'rgb(10, 14, 23)', 'rgb(212, 136, 6)');
    for (const node of [
      page.getByRole('button', { name: '插入脑图', exact: true }),
      page.locator('#notebook-actions'),
      page.locator('[data-notebook-view-link=whiteboard]'),
      page.locator('#notebook-delete-note'),
      page.locator('#notebook-editor button[data-type=bold]'),
    ]) {
      await node.hover();
      await expectPaint(node, amber, tint);
      await page.mouse.move(0, 0);
      await page.keyboard.press('Tab');
      await node.focus();
      assert.notEqual((await expectPaint(node, amber, tint)).outline, 'none');
      await node.blur();
    }
    const selected = page.locator('[data-notebook-view-link=notes]');
    await selected.hover();
    await expectPaint(selected, amber, tint);
    await page.mouse.move(0, 0);
    await selected.blur();
    await expectPaint(selected, amber, tint);
    const undo = page.locator('#notebook-editor button[data-type=redo]');
    assert(await undo.evaluate((n) => n.classList.contains('vditor-menu--disabled')));
    await undo.hover();
    assert.notEqual((await state(undo)).color, amber);
    assert.equal((await state(undo)).background, 'rgba(0, 0, 0, 0)');
    const headings = page.locator('#notebook-editor button[data-type=headings]');
    await headings.click();
    const menu = page
      .locator('#notebook-editor .vditor-hint button')
      .filter({ hasText: '一级标题' })
      .first();
    await menu.hover();
    await expectPaint(menu, amber, tint);
    await editor.click();
    await page.locator('#notebook-actions').click();
    const exportButton = page.getByRole('button', { name: '导出 Markdown', exact: true });
    await exportButton.hover();
    await expectPaint(exportButton, amber, tint);
    await page
      .locator('#notebook-actions-dialog')
      .getByRole('button', { name: '关闭', exact: true })
      .click();
    // Exercise shared variants directly outside the notebook header.
    await page.evaluate(async () => {
      const ui = await import('/ui/index.js');
      const bar = ui.Toolbar({
        id: 'state-consumers',
        children: [
          ui.Button({ id: 'state-secondary', text: '次操作', variant: 'secondary' }),
          ui.Button({ id: 'state-quiet', text: '轻操作', variant: 'quiet' }),
          ui.IconButton({ id: 'state-icon', label: '图标操作', text: '+' }),
          ui.Button({ id: 'state-disabled', text: '不可用', disabled: true }),
          ui.Button({ id: 'state-danger', text: '危险操作', variant: 'danger' }),
          ui.Button({ id: 'state-custom', text: '自有表面', appearance: 'custom' }),
        ],
      });
      document.querySelector('#panel-notebook').append(bar);
    });
    for (const id of ['secondary', 'quiet', 'icon']) {
      const node = page.locator('#state-' + id);
      await node.hover();
      await expectPaint(node, amber, tint);
    }
    for (const id of ['disabled', 'danger', 'custom']) {
      const node = page.locator('#state-' + id);
      await node.hover();
      assert.notEqual((await state(node)).color, amber);
    }
    await page.locator('#state-consumers').evaluate((n) => n.remove());
    if (width === 1440) {
      await page.evaluate(() => {
        window.notebookEditorNode = document.querySelector('#notebook-editor');
        location.hash = 'home';
      });
      await page.locator('#notebook-launcher').click();
      await page.getByRole('complementary', { name: '笔记本侧栏' }).waitFor();
      const action = page.getByRole('button', { name: '格式工具', exact: true });
      await action.hover();
      await expectPaint(action, amber, tint);
      assert(
        await page.locator('#notebook-editor').evaluate((n) => n === window.notebookEditorNode),
      );
    } else {
      await page.locator('#notebook-actions').hover();
    }
    assert((await editor.innerText()).includes('保留正文与输入'));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: 'outputs/notebook-ui/verified-' + width + '.png' });
    assert.deepEqual(errors, []);
    console.log('notebook shared states passed', width, motion);
    await context.close();
  }
} finally {
  await browser.close();
  await closeDevServer(server);
}
