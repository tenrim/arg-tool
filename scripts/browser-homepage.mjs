import assert from 'node:assert/strict';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { go } from './browser-navigation.mjs';

const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(site.base + '/?layout=chronicle#home');
  await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
  await page.locator('.home-shortcut').first().waitFor();
  const home = page.locator('#panel-home');
  assert.equal(await home.locator('h1').textContent(), '迷雾工具箱');
  assert.equal(await home.locator('.home-shortcut').count(), 8);
  assert.equal(await home.locator('input[type=search]').count(), 0);
  assert.equal(await home.locator('.home-collection:visible').count(), 0);
  assert.equal(await home.locator('.home-starter h2').textContent(), '工具推荐');
  const batchIds = () =>
    home
      .locator('[data-home-capability]')
      .evaluateAll((nodes) => nodes.map((node) => node.dataset.homeCapability));
  let previous = await batchIds();
  for (let batch = 0; batch < 5; batch++) {
    const button = home.getByRole('button', { name: '换一批', exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    const current = await batchIds();
    assert.equal(new Set(current).size, 8);
    assert.ok(
      current.every((id) => !previous.includes(id)),
      'Adjacent recommendations repeat',
    );
    assert.equal(await button.evaluate((node) => node === document.activeElement), true);
    const categories = await page.evaluate(async () => {
      const { loadRegistry, resolveCapability } = await import('./capabilities/registry.js');
      const { capabilityRoute } = await import('./capabilities/routes.js');
      const registry = await loadRegistry();
      return [...document.querySelectorAll('[data-home-capability]')].map((link) => {
        const { entry, op, direction } = resolveCapability(registry, link.dataset.homeCapability);
        if (!entry || entry.listed === false || entry.category === 'knowledge')
          throw Error('Unavailable recommendation');
        if (link.getAttribute('href') !== '#' + capabilityRoute(entry, op, direction))
          throw Error('Incorrect recommendation route');
        if (link.querySelector('strong').textContent !== entry.title)
          throw Error('Recommendation name differs from registry');
        return entry.category;
      });
    });
    assert.equal(new Set(categories).size, 4);
    previous = current;
  }
  console.log(
    'PASS five recommendation batches: distinct tools, balanced categories, canonical routes and keyboard focus',
  );
  const categories = await page.evaluate(async () => {
    const { loadRegistry, resolveCapability, capabilityCategories } =
      await import('./capabilities/registry.js');
    const { capabilityRoute } = await import('./capabilities/routes.js');
    const reg = await loadRegistry();
    for (const link of document.querySelectorAll('[data-home-capability]')) {
      const { entry, op, direction } = resolveCapability(reg, link.dataset.homeCapability);
      if (link.getAttribute('href') !== '#' + capabilityRoute(entry, op, direction))
        throw Error('Incorrect shortcut: ' + link.textContent);
    }
    return capabilityCategories.map((cat) => ({
      ...cat,
      groups: reg.groups
        .filter((group) => group.category === cat.id)
        .map((group) => ({ id: group.id, count: group.count })),
    }));
  });
  assert.equal(await home.locator('[data-overview-category]').count(), categories.length);
  assert.equal(await home.locator('[data-capability-group]').count(), 0);
  for (const category of categories) {
    await home
      .locator(`[data-overview-category="${category.id}"]`)
      .getByRole('button', { name: '查看' + category.title + '全部内容' })
      .click();
    assert.equal(await home.locator('[data-capability-group]').count(), category.groups.length);
    for (const group of category.groups) {
      assert.equal(
        await home.locator(`[data-capability-list="${group.id}"] [data-capability]`).count(),
        group.count,
      );
    }
    await home.locator('button[data-category=""]').click();
  }
  console.log('PASS homepage shortcuts and all category contents use the canonical registry');
  await page.keyboard.press('Control+k');
  await page.locator('#workspace-search-input').fill('URL解码');
  await page.locator('#workspace-search-results [data-op="URL Decode"]').first().waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#workspace-search-input').fill('');
  await page.keyboard.press('Escape');
  await home.getByRole('button', { name: '第一次使用', exact: true }).click();
  assert.equal(await page.evaluate(() => document.activeElement.textContent), '使用帮助');
  await home.locator('#home-help summary').first().focus();
  await page.keyboard.press('Enter');
  assert.equal(await home.locator('#home-help details').first().getAttribute('open'), '');
  await home.getByRole('button', { name: '浏览工具分类', exact: true }).click();
  assert.equal(await page.evaluate(() => document.activeElement.textContent), '工具分类');
  console.log('PASS existing search, keyboard help and section focus');
  const example = home.locator('.home-example');
  assert.equal(await example.getByRole('button', { name: '复制结果' }).isDisabled(), true);
  await example.getByRole('button', { name: '运行示例' }).click();
  assert.equal(await example.getByLabel('示例解码结果').textContent(), 'MIST');
  await example.getByRole('button', { name: '复制结果' }).click();
  await page.waitForFunction(() =>
    document.querySelector('.home-example-copy-status').textContent.includes('已复制'),
  );
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'MIST');
  await example.getByRole('link', { name: '打开 Base64 解码 →' }).click();
  await page.waitForFunction(
    () => !!document.querySelector('.ct-tool[data-operation="From Base64"]'),
  );
  await page.locator('.ct-tool[data-operation="From Base64"] .ct-input').fill('keep this draft');
  await go(page, 'home');
  await example.getByRole('button', { name: '运行示例' }).click();
  await example.getByRole('link', { name: '打开 Base64 解码 →' }).click();
  await page.locator('.ct-tool[data-operation="From Base64"] .ct-input').waitFor();
  assert.equal(
    await page.locator('.ct-tool[data-operation="From Base64"] .ct-input').inputValue(),
    'keep this draft',
  );
  await go(page, 'home');
  assert.equal(await home.locator('.home-collection:visible').count(), 1);
  console.log(
    'PASS real Base64 example, clipboard, exact decode route and existing draft preservation',
  );
  for (const width of [900, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.waitForTimeout(300);
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      'Horizontal overflow at ' + width,
    );
    const previous = await batchIds();
    await home.getByRole('button', { name: '换一批', exact: true }).click();
    assert.ok((await batchIds()).every((id) => !previous.includes(id)));
    assert.ok(
      await home
        .locator('.home-shortcut')
        .evaluateAll((nodes) => nodes.every((node) => node.getBoundingClientRect().height >= 44)),
    );
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await example.getByRole('button', { name: '运行示例' }).click();
  assert.equal(await example.getByLabel('示例解码结果').textContent(), 'MIST');
  await page.evaluate(() => document.documentElement.style.setProperty('--ui-font-scale', '2'));
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'Large text overflow',
  );
  assert.deepEqual(errors, []);
  console.log('PASS narrow layouts, large text and reduced motion');
} finally {
  await browser.close();
  await site.close();
}
