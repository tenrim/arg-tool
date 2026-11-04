import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
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
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
  }),
  checks = [];
try {
  for (const width of process.env.LAUNCHER_WIDTH
    ? [Number(process.env.LAUNCHER_WIDTH)]
    : [1440, 800, 320]) {
    const context = await browser.newContext({
        viewport: { width, height: 900 },
        isMobile: width === 320,
        hasTouch: width === 320,
        reducedMotion: width === 1440 ? 'no-preference' : 'reduce',
      }),
      page = await context.newPage(),
      errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(base + '/#byte-codecs?task=native%3Abyte-codecs');
    await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
    const launcher = page.locator('#notebook-launcher'),
      input = page.locator('#byte-codecs-input');
    await input.waitFor({ state: 'visible' });
    await launcher.waitFor({ state: 'visible' });
    assert.equal(await page.locator('#workbench-sidebar [data-route=notebook]').count(), 0);
    assert.equal(await page.locator('[data-ui=floating-actions]').count(), 1);
    const placed = await launcher.boundingBox();
    assert(placed.width >= 44 && placed.height >= 44);
    assert(placed.x >= 0 && placed.x + placed.width <= width - 12);
    assert(placed.y + placed.height <= 900 - 12);
    await input.fill('ABC');
    await input.evaluate((node) => node.setSelectionRange(1, 2));
    const keyboard = page.locator('.completion-keyboard-trigger');
    await keyboard.waitFor({ state: 'visible' });
    const keyBox = await keyboard.boundingBox(),
      noteBox = await launcher.boundingBox();
    assert(keyBox.y + keyBox.height <= noteBox.y - 7, 'floating actions have separate hit targets');
    assert.equal(
      await keyboard.evaluate(
        (node) => node.parentElement === document.querySelector('#notebook-launcher').parentElement,
      ),
      true,
    );
    assert(
      await keyboard.evaluate((node) =>
        Boolean(
          node.compareDocumentPosition(document.querySelector('#notebook-launcher')) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ),
      'DOM focus order follows the visible floating stack',
    );
    await keyboard.click();
    await page.locator('dialog[open] .hg-button').first().waitFor();
    await page.locator('#virtual-keyboard-input').fill('字');
    await page.getByRole('button', { name: '插入所选输入框', exact: true }).click();
    assert.equal(await input.inputValue(), 'A字C');
    const hash = await page.evaluate(() => location.hash);
    await page.evaluate(() => {
      window.launcherInput = document.querySelector('#byte-codecs-input');
      window.launcherPanelEvents = 0;
      document.addEventListener('arg:panelchange', () => window.launcherPanelEvents++);
    });
    await launcher.focus();
    await page.keyboard.press('Enter');
    await page.locator('.ui-dock:not([hidden])').waitFor();
    assert.equal(await page.evaluate(() => location.hash), hash);
    assert.equal(await page.evaluate(() => window.launcherPanelEvents), 0);
    assert(await input.evaluate((node) => node === window.launcherInput));
    assert.equal(await input.inputValue(), 'A字C');
    if (width !== 1440) assert(await page.locator('.ui-dock-sheet').evaluate((n) => n.open));
    await page.locator('#notebook-new').click();
    await page.locator('#notebook-title').fill('悬浮入口测试');
    await page.waitForFunction(
      () => document.querySelector('#notebook-status')?.textContent === '已保存到本机',
    );
    assert.equal(await page.locator('#notebook-editor').count(), 1);
    await page.evaluate(() => (window.launcherEditor = document.querySelector('#notebook-editor')));
    await page.getByRole('button', { name: '关闭笔记本侧栏', exact: true }).click();
    await page.locator('.ui-dock').waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => document.activeElement.id), 'notebook-launcher');
    await launcher.click();
    await page.locator('.ui-dock:not([hidden])').waitFor();
    assert(
      await page.locator('#notebook-editor').evaluate((node) => node === window.launcherEditor),
    );
    assert.equal(await page.locator('#notebook-title').inputValue(), '悬浮入口测试');
    await page.waitForFunction(() => {
      const pane = document.querySelector('.ui-dock:not([hidden])');
      const bounds = pane?.getBoundingClientRect();
      return (
        bounds &&
        bounds.left >= 0 &&
        bounds.right <= innerWidth + 1 &&
        pane.getAnimations().every((animation) => animation.playState === 'finished')
      );
    });
    assert(await page.getByRole('button', { name: '关闭笔记本侧栏', exact: true }).isVisible());
    assert(await page.locator('#notebook-editor .vditor-toolbar').evaluate((node) => node.hidden));
    await page.getByRole('button', { name: '格式工具', exact: true }).click();
    assert.equal(
      await page.locator('#notebook-editor .vditor-toolbar').evaluate((node) => node.hidden),
      false,
    );
    await page.getByRole('button', { name: '格式工具', exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const scrolled = await launcher.boundingBox();
    assert(
      Math.abs(scrolled.y + scrolled.height - (noteBox.y + noteBox.height)) <= 1,
      'launcher stays anchored while scrolling',
    );
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await mkdir('outputs/notebook-launcher-20261028', { recursive: true });
    await page.screenshot({ path: 'outputs/notebook-launcher-20261028/' + width + '.png' });
    assert.deepEqual(errors, []);
    checks.push({
      width,
      checks: [
        'single floating stack',
        'no sidebar duplicate',
        'keyboard bridge and no overlap',
        'keyboard opening',
        'existing notebook/editor/save retained',
        'fixed position and no overflow',
      ],
    });
    await context.close();
  }
  console.log(JSON.stringify({ checks }, null, 2));
} finally {
  await browser.close();
  await closeDevServer(server);
}
