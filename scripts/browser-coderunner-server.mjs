import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseNativeTask } from './browser-navigation.mjs';
import { SERVER_LANGUAGES } from '../public/coderunner/server-catalog.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  const requests = [],
    errors = [];
  let responseMode = 'success',
    finishSlow;
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/api/code/run', async (route) => {
    const data = route.request().postDataJSON();
    requests.push(data);
    if (responseMode === 'slow')
      await new Promise((resolve) => {
        finishSlow = resolve;
      });
    const result =
      responseMode === 'error'
        ? {
            status: 'compile_error',
            compile: { stdout: '', stderr: 'syntax error at Main.java:1', exitCode: 1 },
            run: null,
            version: 'fixture',
          }
        : {
            status: 'ok',
            compile: null,
            run: { stdout: '你好，迷雾\n', stderr: 'diagnostic', exitCode: 0, elapsed: 10 },
            version: 'fixture',
          };
    await route.fulfill({ json: result }).catch(() => {});
  });
  await page.goto(site.base + '/?layout=chronicle#home');
  for (const id of Object.keys(SERVER_LANGUAGES)) {
    await chooseNativeTask(page, 'native:code-' + id);
    assert.match(
      await page.locator('#code-runtime-status').textContent(),
      /主流／常用.*服务器运行/,
    );
    assert.equal(await page.locator('#code-run').textContent(), '发送并运行');
    assert.ok(await page.locator('#code-step').isHidden());
    const footer = page.locator('#panel-code>.tool-provenance');
    assert.ok(await footer.isVisible());
    assert.ok((await footer.textContent()).includes(SERVER_LANGUAGES[id].name));
  }
  assert.equal(requests.length, 0, 'selecting a server language must not send code');
  const chooser = page.locator('#panel-code .capability-topic-settings select');
  assert.deepEqual(
    await chooser.locator('optgroup').evaluateAll((nodes) => nodes.map((n) => n.label)),
    ['主流／常用', '冷门／解谜'],
  );
  assert.equal(await chooser.locator('optgroup').first().locator('option').count(), 21);
  assert.equal(await chooser.locator('optgroup').last().locator('option').count(), 6);
  await chooseNativeTask(page, 'native:code-java');
  await page.locator('#code-source').fill(SERVER_LANGUAGES.java.example);
  await page.locator('#code-input').fill('迷雾\n');
  await page.locator('#code-run').click();
  await page.waitForFunction(() =>
    document.getElementById('code-status').textContent.includes('运行完成'),
  );
  assert.equal(await page.locator('#code-output').inputValue(), '你好，迷雾\n');
  assert.equal(requests[0].code, SERVER_LANGUAGES.java.example);
  assert.equal(requests[0].input, '迷雾\n');
  assert.equal(await page.locator('#code-result-notebook').isEnabled(), true);
  assert.match(await page.locator('#code-error').textContent(), /diagnostic/);
  await page.locator('#code-input').fill('changed');
  assert.equal(await page.locator('#code-output').inputValue(), '');
  assert.equal(await page.locator('#code-result-notebook').isEnabled(), false);
  responseMode = 'error';
  await page.locator('#code-run').click();
  await page.waitForFunction(() =>
    document.getElementById('code-status').textContent.includes('执行失败'),
  );
  assert.match(await page.locator('#code-error').textContent(), /编译失败.*syntax error/s);
  assert.equal(await page.locator('#code-result-notebook').isEnabled(), false);
  responseMode = 'slow';
  await page.locator('#code-run').click();
  await page.waitForFunction(() => !document.getElementById('code-stop').disabled);
  while (!finishSlow) await new Promise((resolve) => setTimeout(resolve, 20));
  await page.locator('#code-source').fill('new draft');
  responseMode = 'success';
  finishSlow();
  await chooseNativeTask(page, 'native:code-python');
  assert.match(await page.locator('#code-runtime-status').textContent(), /本地运行/);
  await chooseNativeTask(page, 'native:code-java');
  assert.equal(await page.locator('#code-source').inputValue(), 'new draft');
  assert.equal(await page.locator('#code-output').inputValue(), '');
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.ok(await chooser.isVisible());
  }
  assert.deepEqual(errors, []);
  console.log(
    'PASS 27 grouped languages, 17 server source footers, explicit upload, diagnostics, cancellation, drafts and mobile; HTTP responses are fixtures, not compiler acceptance',
  );
} finally {
  await browser.close();
  await site.close();
}
