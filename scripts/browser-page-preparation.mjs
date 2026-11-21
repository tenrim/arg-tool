import assert from 'node:assert/strict';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseNativeTask, chooseOperation } from './browser-navigation.mjs';

const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  for (const saveData of [true, false]) {
    const page = await browser.newPage();
    await page.addInitScript((save) => {
      Object.defineProperty(navigator, 'connection', { value: { saveData: save } });
      window.createdEngines = [];
      const Original = window.Worker;
      window.Worker = class extends Original {
        constructor(url, options) {
          super(url, options);
          window.createdEngines.push(new URL(url, location.href).pathname);
        }
      };
    }, saveData);
    const writes = [];
    page.on('request', (request) => {
      if (request.method() === 'POST') writes.push(request.url());
    });
    await page.goto(site.base + '/#home');
    await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
    assert.deepEqual(await page.evaluate(() => window.createdEngines), []);
    await chooseNativeTask(page, 'native:qalculate');
    const count = (path) =>
      page.evaluate(
        (path) => window.createdEngines.filter((url) => url.endsWith(path)).length,
        path,
      );
    assert.equal(await count('/qalculate/worker.js'), saveData ? 0 : 1);
    await page.locator('#qalculate-expression').fill('6 * 7');
    const start = performance.now();
    await page.locator('#qalculate-run').click();
    await page.waitForFunction(() =>
      document.getElementById('qalculate-display-value').textContent.includes('42'),
    );
    console.log(
      'Calculator, first click',
      saveData ? 'on demand' : 'prepared',
      Math.round(performance.now() - start),
      'ms',
    );
    assert.equal(await count('/qalculate/worker.js'), 1);
    await chooseOperation(page, 'From Hex');
    assert.equal(await count('/cyberchef-worker.js'), saveData ? 0 : 1);
    await chooseNativeTask(page, 'native:code-go');
    assert.equal(await count('/coderunner/worker.js'), 0);
    if (!saveData) {
      for (const [language, code] of [
        ['javascript', 'console.log(6 * 7)'],
        ['python', 'print(6 * 7)'],
        ['lua', 'print(6 * 7)'],
        ['sql', 'SELECT 6 * 7 AS result;'],
      ]) {
        await chooseNativeTask(page, 'native:code-' + language);
        const workers = await count('/coderunner/worker.js');
        await page.locator('#code-source').fill(code);
        await page.locator('#code-run').click();
        await page.waitForFunction(() =>
          document.getElementById('code-status').textContent.includes('运行完成'),
        );
        assert.match(
          (await page.locator('#code-output').inputValue()) +
            (await page.locator('#code-sql-results').textContent()),
          /42/,
        );
        assert.equal(await count('/coderunner/worker.js'), workers);
      }
    }
    await chooseNativeTask(page, 'native:countries');
    assert.equal(await count('/reference/worker.js'), saveData ? 0 : 1);
    await page.locator('#countries-query').fill('China');
    await page.locator('#countries-run').click();
    await page.waitForFunction(() =>
      /China|中国/.test(document.querySelector('#countries-results')?.textContent),
    );
    assert.equal(await count('/reference/worker.js'), 1);
    await chooseNativeTask(page, 'native:video-animation');
    assert.equal(await count('/animation/worker.js'), saveData ? 0 : 1);
    await chooseNativeTask(page, 'native:paper');
    assert.equal(await count('/round3/solver-worker.js'), saveData ? 0 : 1);
    await page.evaluate(() => {
      const original = window.fetch;
      window.ffmpegStart = 0;
      window.fetch = (url, options) => {
        if (!String(url).endsWith('/ffmpeg-core.wasm.gz')) return original(url, options);
        window.ffmpegStart++;
        // Hold only this optional empty-core request so navigation always races a download.
        return new Promise((_, reject) =>
          options.signal.addEventListener(
            'abort',
            () => {
              window.ffmpegAborted = true;
              reject(options.signal.reason);
            },
            { once: true },
          ),
        );
      };
    });
    await chooseNativeTask(page, 'native:video-audio');
    assert.equal(await page.evaluate(() => window.ffmpegStart), saveData ? 0 : 1);
    await chooseNativeTask(page, 'native:video-animation');
    assert.equal(await page.evaluate(() => Boolean(window.ffmpegAborted)), !saveData);
    assert.deepEqual(writes, []);
    await page.close();
  }
} finally {
  await browser.close();
  await site.close();
}
