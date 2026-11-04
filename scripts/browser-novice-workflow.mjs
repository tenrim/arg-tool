import assert from 'node:assert/strict';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseOperation, chooseNativeTask, go } from './browser-navigation.mjs';
const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const failures = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1365, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(site.base + '/?layout=chronicle#home');
  await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
  async function check(name, fn) {
    if (process.env.CASE && !new RegExp(process.env.CASE).test(name)) return;
    try {
      await fn();
      console.log('PASS', name);
    } catch (e) {
      failures.push(name + ': ' + e.message);
      console.error('FAIL', name, e.message);
    }
  }
  async function search(query) {
    await page.locator('#workspace-search-input').fill(query);
    await page.locator('#workspace-search-results [data-capability]').first().waitFor();
  }
  async function operation(op) {
    const e = await chooseOperation(page, op);
    return page.locator('#panel-' + e.panel + ' .ct-tool');
  }
  await check('first-use home has task entries and one global search', async () => {
    await page.locator('.home-shortcut').first().waitFor();
    assert.equal(await page.locator('.home-shortcut').count(), 8);
    assert.equal(await page.locator('#home-search').count(), 0);
    assert.equal(await page.locator('.home-collection:visible').count(), 0);
    assert.equal(await page.locator('.rail-filter input').isVisible(), false);
    await page.getByRole('link', { name: '打开 Base64 解码 →', exact: true }).click();
    await page.waitForFunction(
      () => !!document.querySelector('.ct-tool[data-operation="From Base64"]'),
    );
    await go(page, 'home');
  });
  await check('natural-language image search includes hidden-data tool', async () => {
    await search('图片藏了文字');
    assert.ok(
      await page.locator('#workspace-search-results [data-capability="native:image-steg"]').count(),
    );
    await page.keyboard.press('Escape');
  });
  await check('URL search opens exact operation, survives reload/back', async () => {
    await search('URL解码');
    await page.locator('#workspace-search-results [data-op="URL Decode"]').first().click();
    await page.locator('#panel-basics:not([hidden])').waitFor();
    assert.equal(
      new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('op'),
      'URL Decode',
    );
    const selected = await page
      .locator('#panel-basics select')
      .evaluateAll((ns) => ns.map((n) => [n.id, n.value]));
    assert.ok(selected.some(([, v]) => v === 'url'));
    assert.ok(selected.some(([, v]) => v === 'decode'));
    const target = page.url();
    await page.reload();
    await page.locator('#panel-basics:not([hidden])').waitFor();
    assert.deepEqual(
      await page
        .locator('#panel-basics select')
        .evaluateAll((ns) => ns.map((n) => [n.id, n.value])),
      selected,
    );
    await go(page, 'home');
    await page.goBack();
    await page.waitForURL(target);
    assert.deepEqual(
      await page
        .locator('#panel-basics select')
        .evaluateAll((ns) => ns.map((n) => [n.id, n.value])),
      selected,
    );
  });

  await check('sidebar and full-directory search preserve the same URL destination', async () => {
    await page.locator('.rail-filter-disclosure summary').click();
    await page.locator('.rail-filter input').fill('URL解码');
    const result = page.locator('.rail-search-results [data-capability="topic:text-escapes"]');
    await result.waitFor();
    assert.match(await result.getAttribute('href'), /view=native%3Aescape-url/);
    await result.click();
    await page.waitForFunction(
      () =>
        document.querySelector('#basics-format')?.value === 'url' &&
        document.querySelector('#basics-direction')?.value === 'decode',
    );
    await page.locator('.rail-filter input').fill('');
    await page.locator('#panel-basics [data-task-navigation=directory]').click();
    await page.locator('.directory-search input').fill('URL解码');
    await page.locator('.directory-grid [data-capability="topic:text-escapes"]').click();
    await page.waitForFunction(
      () =>
        document.querySelector('#basics-format')?.value === 'url' &&
        document.querySelector('#basics-direction')?.value === 'decode',
    );
  });
  await check(
    'Base64 preview warns about ignored input, strict failure and correction work',
    async () => {
      const p = await operation('From Base64');
      assert.equal(await p.locator('.ct-advanced').getAttribute('open'), null);
      await p.locator('.ct-input').fill('这不是Base64');
      await p.locator('.ct-run').click();
      await page.waitForFunction(() =>
        document.querySelector('#ct-encoding .ct-status').textContent.includes('忽略了'),
      );
      assert.match(await p.innerText(), /非 UTF-8|不可打印/);
      await p.locator('.ct-advanced summary').click();
      await p.locator('[data-arg="1"] input').uncheck();
      await p.locator('[data-arg="2"] input').check();
      await p.locator('.ct-run').click();
      await p.locator('.ct-status[data-state="error"]').waitFor();
      await p.getByRole('button', { name: /示例/ }).click();
      await p.locator('.ct-run').click();
      await page.waitForFunction(
        () => document.querySelector('#ct-encoding .ct-output')?.value === 'Hello world',
      );
      await p.locator('.ct-copy').click();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'Hello world');
      await p.locator('.ct-source').selectOption('base64');
      assert.match(await p.innerText(), /先进行 Base64解码/);
    },
  );
  await check('AES identifies wrong key field and preserves original error', async () => {
    const p = await operation('AES Decrypt');
    await p.locator('.ct-run').click();
    await page.waitForFunction(() =>
      document.querySelector('#ct-crypto .ct-status').textContent.includes('密钥长度不符合'),
    );
    assert.ok(await p.locator('[data-arg="0"] [aria-invalid=true]').count());
    await p.getByText('查看引擎原始错误', { exact: true }).click();
    await p.locator('pre').filter({ hasText: 'Invalid key length' }).waitFor();
    await p.locator('[data-arg="0"] input').fill('2b7e151628aed2a6abf7158809cf4f3c');
    await p.locator('[data-arg="1"] input').fill('000102030405060708090a0b0c0d0e0f');
    await p.locator('[data-arg="3"] select').selectOption('CBC/NoPadding');
    await p.locator('.ct-input').fill('7649abac8119b246cee98e9b12e9197d');
    await p.locator('.ct-run').click();
    await page.waitForFunction(
      () =>
        document.querySelector('#ct-crypto .ct-output')?.value ===
        '6b c1 be e2 2e 40 9f 96 e9 3d 7e 11 73 93 17 2a',
    );
    assert.equal(await p.locator('[aria-invalid=true]').count(), 0);
  });
  await check(
    'Magic has one source editor, candidates, raw export and copied snippet',
    async () => {
      const p = await operation('Magic');
      await p.locator('.ct-source').selectOption('shared');
      await page.locator('#analysis-input').fill('SGVsbG8gd29ybGQ=');
      assert.equal(
        await page.locator('#panel-analysis textarea:visible:not([readonly])').count(),
        1,
      );
      await p.locator('.ct-source').selectOption('text');
      assert.equal(await page.locator('#analysis-input').isVisible(), false);
      await p.locator('.ct-input').fill('SGVsbG8gd29ybGQ=');
      await p.locator('.ct-run').click();
      await p.getByRole('button', { name: '复制结果片段', exact: true }).first().waitFor();
      assert.equal(await p.locator('.ui-conversion-panes').getAttribute('data-layout'), 'stacked');
      await p.getByRole('button', { name: '复制结果片段', exact: true }).first().click();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'Hello world');
      await p.getByRole('button', { name: '复制完整 JSON', exact: true }).click();
      assert.ok(
        Array.isArray(JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))),
      );
      await p.getByRole('button', { name: '在处理链中打开此配方', exact: true }).first().click();
      await page.locator('#panel-cyberchef:not([hidden])').waitFor();
      await page.locator('#chef-run').click();
      await page.waitForFunction(
        () => document.querySelector('#chef-output')?.value === 'Hello world',
      );
      await chooseNativeTask(page, 'native:cipher-detect');
      assert.equal(await page.locator('#analysis-input').inputValue(), 'SGVsbG8gd29ybGQ=');
      assert.equal(await page.locator('#analysis-input').isVisible(), true);
    },
  );
  await check('complete recipe JSON actions name and copy the entire report', async () => {
    await go(page, 'cyberchef');
    await page.locator('#chef-clear-recipe').click();
    await page.locator('#chef-input').fill('SGVsbG8gd29ybGQ=');
    await page.getByRole('button', { name: 'Magic 自动识别', exact: true }).click();
    await page.locator('#chef-run').click();
    await page.locator('#panel-cyberchef [data-chef-result=magic]').waitFor();
    assert.equal(await page.locator('#chef-copy').textContent(), '复制完整 JSON');
    await page.locator('#chef-copy').click();
    const data = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()));
    assert.equal(data[0].data, 'Hello world');
    assert.equal(await page.locator('#chef-download').textContent(), '下载完整 JSON');
  });
  await check('file status rendered once per owner', async () => {
    await chooseNativeTask(page, 'native:file-versions');
    assert.equal(
      (await page.locator('#panel-file-versions').innerText()).match(/尚未选择文件/g)?.length,
      2,
    );
    await chooseNativeTask(page, 'native:forensics-exiftool');
    assert.equal(
      (await page.locator('#panel-forensics-exiftool').innerText()).match(/尚未选择文件/g)?.length,
      1,
    );
  });
  await check('text-steganography labels match the selected engine', async () => {
    await chooseNativeTask(page, 'native:text-steganography');
    const text = await page.locator('#panel-text-steganography').innerText();
    assert.ok(text.includes('公开文本'));
    assert.ok(!text.includes('佛又曰'));
  });
  await check('numeric preview concise, full precision copied', async () => {
    await chooseNativeTask(page, 'native:water-boiling');
    await page.locator('#water-boiling-run').click();
    await page.getByText('约 99.97 °C', { exact: true }).waitFor();
    await page.locator('#water-boiling-copy').click();
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /99\.974295805/);
  });
  await check('empty notebook hides inapplicable actions but keeps trash and create', async () => {
    await go(page, 'notebook');
    await page.getByRole('button', { name: '新建第一篇笔记', exact: true }).waitFor();
    const p = page.locator('#panel-notebook');
    assert.equal(await p.getByRole('button', { name: '历史版本', exact: true }).isVisible(), false);
    assert.equal(await p.getByRole('button', { name: '批量管理', exact: true }).isVisible(), false);
    assert.equal(await p.getByRole('button', { name: '回收站', exact: true }).isVisible(), true);
    await p.getByRole('button', { name: '新建第一篇笔记', exact: true }).click();
    await p.getByRole('button', { name: '历史版本', exact: true }).waitFor();
    assert.equal(await p.getByRole('button', { name: '批量管理', exact: true }).isVisible(), true);
  });
  await check('mobile result navigation and no horizontal overflow', async () => {
    for (const [width, height] of [
      [390, 844],
      [320, 534],
    ]) {
      await page.setViewportSize({ width, height });
      const p = await operation('From Base64');
      await p.locator('.ct-source').selectOption('text');
      await p.locator('.ct-input').fill('SGVsbG8gd29ybGQ=');
      await p.locator('.ct-run').click();
      await page.waitForFunction(
        () => document.querySelector('#ct-encoding .ct-output')?.value === 'Hello world',
      );
      await p.getByRole('button', { name: '查看结果 ↓', exact: true }).click();
      const rect = await p.locator('.ct-output').boundingBox();
      const dock = await page.locator('[data-ui=floating-actions]').boundingBox();
      assert.ok(rect.y >= 0 && rect.y + rect.height <= dock.y, JSON.stringify({ rect, dock }));
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        true,
      );
      await p.locator('.ct-input').fill('changed');
      assert.equal(
        await p.getByRole('button', { name: '查看结果 ↓', exact: true }).isVisible(),
        false,
      );
    }
  });
  assert.deepEqual(errors, [], 'browser errors');
  assert.deepEqual(failures, []);
} finally {
  await browser.close();
  await site.close();
}
