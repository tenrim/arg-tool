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
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  });
  for (const mobile of [true, false]) {
    const context = await browser.newContext({
      viewport: { width: mobile ? 390 : 1440, height: 900 },
      isMobile: mobile,
      hasTouch: mobile,
    });
    const errors = [];
    await context.route('**/*', (route) => {
      const url = new URL(route.request().url());
      return url.origin === base || ['blob:', 'data:'].includes(url.protocol)
        ? route.continue()
        : route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + '/#qalculate?task=native:qalculate');
    const expression = page.locator('#qalculate-expression');
    await expression.waitFor({ state: 'visible' });
    const checkInput = async () => {
      assert.equal(
        await expression.getAttribute('inputmode'),
        'none',
        'calculator requests no system soft keyboard',
      );
      assert.equal(
        await expression.isEditable(),
        true,
        'selection, paste and hardware editing remain available',
      );
    };
    const key = async (id) => {
      const node = page.locator('#qalculate-' + (id.startsWith('clear-') ? '' : 'key-') + id);
      if (mobile) await node.tap();
      else await node.click();
    };
    const waitResult = () =>
      page.waitForFunction(() => !document.getElementById('qalculate-download').disabled, null, {
        timeout: 60000,
      });
    await checkInput();
    for (const id of ['7', 'multiply', '8']) await key(id);
    assert.equal(await expression.inputValue(), '7*8');
    assert.equal(
      await expression.evaluate((n) => n === document.activeElement),
      true,
      'keypad retains the editing caret',
    );
    await page.locator('#qalculate-run').click();
    await waitResult();
    assert.match(await page.locator('#qalculate-display-value').textContent(), /56/);
    await key('clear-all');
    for (const id of ['1', '2', 'clear-entry', '3']) await key(id);
    assert.equal(await expression.inputValue(), '13', 'keypad deletion remains available');
    if (mobile) await expression.tap();
    else await expression.click();
    await expression.evaluate((n) => n.setSelectionRange(0, 1));
    await key('9');
    assert.equal(await expression.inputValue(), '93', 'keypad replaces the selected text');
    await checkInput();
    await key('clear-all');
    await expression.pressSequentially('2+3');
    await expression.press('Enter');
    await waitResult();
    assert.match(
      await page.locator('#qalculate-display-value').textContent(),
      /5/,
      'physical keyboard input and Enter still calculate',
    );
    await page.locator('#qalculate-history-0').click();
    await checkInput();
    assert.equal(
      await expression.inputValue(),
      '2+3',
      'history restores the same editable display',
    );
    await page.locator('#qalculate-mode').selectOption('scientific');
    await key('clear-all');
    for (const id of ['sin', '0', 'close']) await key(id);
    await page.locator('#qalculate-run').click();
    await waitResult();
    assert.match(await page.locator('#qalculate-display-value').textContent(), /0/);
    await checkInput();
    assert.deepEqual(errors, []);
    console.log(
      'PASS: ' +
        (mobile ? 'touch/mobile' : 'desktop') +
        ' calculator keyboard policy, keypad, selection, history, hardware input and scientific keys',
    );
    await context.close();
  }
} finally {
  await browser?.close();
  await closeDevServer(server);
}
