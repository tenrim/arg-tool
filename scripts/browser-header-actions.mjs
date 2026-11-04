import assert from 'node:assert/strict';
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
});
const checks = [];
try {
  for (const mobile of [true, false]) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 320, height: 534 } : { width: 1440, height: 900 },
      hasTouch: mobile,
      isMobile: mobile,
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage(),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + '/#notebook');
    await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
    const button = page.locator('#notebook-new');
    await button.waitFor({ state: 'visible' });
    const paint = () =>
      button.evaluate((node) => {
        const s = getComputedStyle(node),
          body = getComputedStyle(document.body);
        return {
          color: s.color,
          background: s.backgroundColor,
          ink: body.getPropertyValue('--ink').trim(),
          outline: s.outlineStyle,
        };
      });
    const initial = await paint();
    assert.equal(initial.color, 'rgb(10, 14, 23)', JSON.stringify({ mobile, initial }));
    assert.equal(
      initial.background,
      'rgb(212, 136, 6)',
      'Header preserves the shared primary surface, not a transparent override',
    );
    assert(await button.boundingBox());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    // Keyboard focus must retain a visible label and an explicit focus ring.
    await button.focus();
    const focused = await paint();
    assert.equal(focused.color, initial.color);
    assert.notEqual(focused.outline, 'none');
    if (mobile) {
      await button.tap();
      await page.locator('#notebook-title:enabled').waitFor();
      await page.waitForFunction(
        () => document.querySelector('#notebook-status')?.textContent === '已保存到本机',
      );
      await page.locator('#notebook-title').fill('手机端可见按钮');
      await page.waitForFunction(
        () => document.querySelector('#notebook-status')?.textContent === '已保存到本机',
      );
    } else {
      await button.hover();
      const hovered = await paint();
      // Animate UI paints hover backgrounds in a sibling shadow layer while
      // keeping the live button transparent; inspect that actual visible surface.
      const surface = await button.evaluate((node) => {
        const highlight = node.parentElement.shadowRoot?.querySelector(
          '[data-slot=trigger-highlight]',
        );
        return highlight
          ? getComputedStyle(highlight).backgroundColor
          : getComputedStyle(node).backgroundColor;
      });
      assert.equal(surface, 'rgb(240, 165, 0)');
      assert.equal(hovered.color, 'rgb(10, 14, 23)');
      await page.mouse.move(0, 0);
      assert.equal((await paint()).color, initial.color);
    }
    // A representative primary button outside the header keeps its filled style.
    const primary = await page.evaluate(async () => {
      const { Button } = await import('/ui/index.js');
      const node = Button({ text: '独立主操作', variant: 'primary' });
      document.querySelector('#main').append(node);
      const s = getComputedStyle(node),
        value = { color: s.color, background: s.backgroundColor };
      node.remove();
      return value;
    });
    assert.deepEqual(primary, { color: 'rgb(10, 14, 23)', background: 'rgb(212, 136, 6)' });
    assert.deepEqual(errors, []);
    checks.push({
      viewport: mobile ? '320x534 touch' : '1440x900 desktop',
      default: initial,
      primaryOutsideHeader: primary,
    });
    await context.close();
  }
  console.log(JSON.stringify({ checks }, null, 2));
} finally {
  await browser.close();
  await closeDevServer(server);
}
