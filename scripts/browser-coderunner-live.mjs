import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseNativeTask } from './browser-navigation.mjs';
import { SERVER_LANGUAGES } from '../public/coderunner/server-catalog.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite({ env: { ...process.env, CODE_RUNNER_ENABLED: '1' } });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.goto(site.base + '/?layout=chronicle#home');
  for (const id of ['c', 'java', 'typescript', 'csharp', 'swift']) {
    await chooseNativeTask(page, 'native:code-' + id);
    await page.locator('#code-source').fill(SERVER_LANGUAGES[id].example);
    await page.locator('#code-input').fill('迷雾\n');
    await page.locator('#code-run').click();
    await page.waitForFunction(
      () => /运行完成|执行失败/.test(document.getElementById('code-status').textContent),
      null,
      { timeout: 120000 },
    );
    assert.match(
      await page.locator('#code-status').textContent(),
      /运行完成/,
      await page.locator('#code-error').textContent(),
    );
    assert.equal(await page.locator('#code-output').inputValue(), '你好，迷雾\n');
    console.log('PASS real browser upload and compiler', id);
  }
} finally {
  await browser.close();
  await site.close();
}
