import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
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
await mkdir('outputs/function-plot', { recursive: true });
try {
  for (const width of process.env.DESMOS_LIVE_ONLY === '1' ? [] : [1440, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      colorScheme: 'dark',
    });
    const requests = [],
      errors = [];
    await context.route('https://www.desmos.com/**', (r) => {
      requests.push(r.request().url());
      return r.fulfill({
        contentType: 'text/html',
        body: '<label>Expression<input id="formula"></label>',
      });
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + '/?layout=chronicle#home');
    await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
    assert.equal(await page.locator('iframe').count(), 0);
    assert.equal(requests.length, 0);
    await page.evaluate(() => (location.hash = 'function-plot?task=native%3Afunction-plot'));
    await page.locator('#desmos-frame').waitFor();
    const formula = page.frameLocator('#desmos-frame').locator('#formula');
    await formula.fill('y=x^2');
    assert.equal(requests.length, 1);
    assert.equal(await page.locator('#graph-board,#graph-run').count(), 0);
    assert.equal(await page.locator('#desmos-frame').getAttribute('referrerpolicy'), 'no-referrer');
    const box = await page.locator('#desmos-frame').boundingBox();
    assert(box.width > 200 && box.x + box.width <= width + 1, 'frame fits viewport');
    await page.evaluate(() => (location.hash = 'home'));
    await page.locator('#panel-home').waitFor({ state: 'visible' });
    await page.evaluate(() => (location.hash = 'function-plot'));
    await page.locator('#panel-function-plot').waitFor({ state: 'visible' });
    assert.equal(await formula.inputValue(), 'y=x^2');
    assert.equal(requests.length, 1);
    assert.equal(await page.locator('#panel-function-plot .tool-provenance').count(), 0);
    const fallback = page.getByRole('link', { name: '在新标签页打开 Desmos' });
    assert.equal(await fallback.getAttribute('target'), '_blank');
    await page.evaluate(() => document.querySelector('#panel-function-plot').remove());
    await page.waitForFunction(() => !document.querySelector('#desmos-frame'));
    assert.deepEqual(errors, []);
    console.log('iframe lifecycle/layout passed', width);
    await context.close();
  }
  if (process.env.DESMOS_LIVE === '1') {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    await page.goto(base + '/?layout=chronicle#function-plot');
    const frame = page.frameLocator('#desmos-frame');
    await frame.locator('.dcg-mq-editable-field').first().waitFor({ timeout: 60000 });
    await frame.locator('.dcg-mq-editable-field').first().click();
    await page.keyboard.type('y=x^2');
    await page.keyboard.press('Enter');
    const remote = page
      .frames()
      .find((f) => f.url().startsWith('https://www.desmos.com/calculator'));
    await remote.waitForFunction(
      () =>
        [...document.querySelectorAll('canvas')].some((c) => {
          if (c.width < 200 || c.height < 200) return false;
          const ctx = c.getContext('2d');
          if (!ctx) return false;
          const pixels = ctx.getImageData(0, 0, c.width, c.height).data;
          let colored = 0;
          for (let i = 0; i < pixels.length; i += 4)
            if (
              pixels[i] > 100 &&
              pixels[i] > pixels[i + 1] * 1.5 &&
              pixels[i] > pixels[i + 2] * 1.5 &&
              pixels[i + 3] > 100
            )
              colored++;
          return colored > 100;
        }),
      {},
      { timeout: 30000 },
    );
    await page.screenshot({ path: 'outputs/function-plot/desmos-live-desktop.png' });
    await writeFile(
      'outputs/function-plot/desmos-live-body.txt',
      await frame.locator('body').innerText(),
    );
    console.log('Desmos live body', (await frame.locator('body').innerText()).slice(0, 450));
    await page.setViewportSize({ width: 320, height: 800 });
    await page.screenshot({ path: 'outputs/function-plot/desmos-live-mobile.png' });
    console.log('live desktop/mobile loaded; expression typed');
    await context.close();
  }
} finally {
  await browser.close();
  await closeDevServer(server);
}
