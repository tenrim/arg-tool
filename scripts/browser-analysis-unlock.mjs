import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseOperation, chooseNativeTask, go } from './browser-navigation.mjs';

const site = await startBrowserTestSite();
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  for (const width of process.argv.some((arg) => ['--storage-only', '--search-only'].includes(arg))
    ? []
    : [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage(),
      errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(site.base + '/?layout=chronicle#analysis?task=native%3Acipher-detect');
    await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
    assert.equal(await page.locator('#analysis-input').isVisible(), false, 'direct URL is locked');
    const locked = await page.evaluate(async () => {
      const { loadRegistry, searchEntries } = await import('/capabilities/registry.js');
      const registry = await loadRegistry();
      return {
        listed: registry.byId.get('native:cipher-detect').listed,
        hits: searchEntries(registry, '文本线索分析', '', { includeKnowledge: true }).map(
          (row) => row.id,
        ),
        lessons: registry.byId.get('native:cipher-detect').learningIds,
        count: registry.coverage.visibleToolCount,
      };
    });
    assert.equal(locked.listed, false);
    assert(!locked.hits.includes('native:cipher-detect'));
    assert(!locked.lessons.some((id) => locked.hits.includes(id)));
    await go(page, 'about');
    await page.locator('#about-versions > summary').click();
    const clue = await page.locator('#about-analysis-clue').textContent();
    assert.match(clue, /^[0-9a-f]+$/);
    assert.equal(await page.locator('#about-analysis-puzzle').count(), 1);
    assert.doesNotMatch(await page.locator('#about-analysis-puzzle').textContent(), /拨开迷雾/);
    let value = clue;
    for (const [operation, expected] of [
      ['From Hex', '5bhb5olN6Y+36Mh+'],
      ['ROT13', '5ouo5byA6L+36Zu+'],
      ['From Base64', '拨开迷雾'],
    ]) {
      await chooseOperation(page, operation);
      const input = page.locator('.ct-input:visible');
      assert.doesNotMatch(await input.getAttribute('placeholder'), /隐藏线索|解出后/);
      await input.fill(value);
      await page.locator('.ct-run:visible').click();
      await page.waitForFunction(
        (expected) =>
          [...document.querySelectorAll('.ct-result textarea')].some(
            (node) => node.value === expected,
          ),
        expected,
      );
      value = expected;
      assert.equal(await page.locator('dialog[open]').count(), 0);
    }
    // Neither decoded results nor typing the answer into a tool unlock it.
    const input = page.locator('.ct-input:visible');
    await input.fill(value);
    assert.equal(await page.locator('dialog[open]').count(), 0);
    const search = page.locator('#workspace-search-input');
    await search.fill('拨开迷雾!');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    await search.evaluate((node) => {
      node.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      node.value = '拨开迷雾';
      node.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    });
    assert.equal(await page.locator('dialog[open]').count(), 0);
    await search.evaluate((node) =>
      node.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })),
    );
    const dialog = page.getByRole('dialog', { name: '迷雾已拨开' });
    await dialog.waitFor();
    assert.equal(await input.inputValue(), '拨开迷雾');
    await page.waitForFunction(async () => {
      const { loadRegistry } = await import('/capabilities/registry.js');
      return (await loadRegistry()).byId.get('native:cipher-detect').listed !== false;
    });
    assert.doesNotMatch((await input.getAttribute('placeholder')) || '', /隐藏线索/);
    await dialog.getByRole('button', { name: '留在当前页面' }).click();
    assert.equal(await input.inputValue(), '拨开迷雾');
    await page.locator('#workspace-search-input').fill('未知密文');
    assert.deepEqual(
      await page
        .locator('#workspace-search-results [data-capability]')
        .evaluateAll((nodes) => nodes.slice(0, 2).map((node) => node.dataset.capability)),
      ['native:cipher-detect', 'op:Magic'],
    );
    const result = page.locator(
      '#workspace-search-results [data-capability="native:cipher-detect"]',
    );
    await result.waitFor();
    await result.click();
    await page.locator('#analysis-input').waitFor({ state: 'visible' });
    assert.equal(
      await page
        .locator(
          '[data-rail-group="cipher-analysis"] .rail-tool[data-capability="native:cipher-detect"]',
        )
        .count(),
      1,
    );
    await page.reload();
    await page.locator('#analysis-input').waitFor({ state: 'visible' });
    assert.equal(
      await page.evaluate(() => localStorage.getItem('arg.discovery.text-analysis.v1')),
      'solved-v1',
    );
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log(
      'PASS analysis unlock ' +
        width +
        'px: about-only clue, three real decoding steps, search-only unlock, IME, live discovery, persistence',
    );
    await context.close();
  }
  if (!process.argv.includes('--search-only')) {
    const context = await browser.newContext({ viewport: { width: 320, height: 700 } });
    await context.addInitScript(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === 'arg.discovery.text-analysis.v1')
          throw new DOMException('Denied', 'SecurityError');
        return original.call(this, key, value);
      };
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(site.base + '/?layout=chronicle#home');
    await chooseNativeTask(page, 'native:roman');
    const input = page.locator('#roman-input');
    await input.waitFor({ state: 'visible' });
    assert.doesNotMatch((await input.getAttribute('placeholder')) || '', /隐藏线索/);
    await input.fill('拨开迷雾');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    await input.evaluate((node) => (node.placeholder = '罗马数字格式提示'));
    assert.equal(await input.getAttribute('placeholder'), '罗马数字格式提示');
    assert.equal(await input.inputValue(), '拨开迷雾');
    await go(page, 'about');
    await page.locator('#about-versions > summary').click();
    await mkdir('outputs/analysis-unlock', { recursive: true });
    await page
      .locator('#about-analysis-clue')
      .evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page
      .locator('#about-analysis-puzzle')
      .screenshot({ path: 'outputs/analysis-unlock/mobile-clue.png' });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('#workspace-search-input').fill('拨开迷雾');
    const dialog = page.getByRole('dialog', { name: '迷雾已拨开' });
    await dialog.waitFor();
    assert.match(await dialog.textContent(), /无法保存状态/);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'outputs/analysis-unlock/mobile-unlocked.png', fullPage: false });
    await dialog.getByRole('button', { name: '打开文本线索分析' }).click();
    await page.locator('#analysis-input').waitFor({ state: 'visible' });
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
    assert.equal(
      await page.locator('#analysis-input').isVisible(),
      false,
      'denied storage does not claim a persistent unlock',
    );
    assert.deepEqual(errors, []);
    console.log(
      'PASS normal input ignored, about clue, search unlock, storage-denied session, 320px layout',
    );
    await context.close();
  }
  if (!process.argv.includes('--storage-only')) {
    for (const surface of ['directory', 'category']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(site.base + '/?layout=chronicle#about');
      await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
      let search;
      if (surface !== 'category' && !(await page.locator('.rail-directory-button').isVisible()))
        await page.getByRole('button', { name: '切换工具侧栏' }).click();
      if (surface === 'directory') {
        await page.locator('.rail-directory-button').click();
        search = page.locator('.directory-search input');
      } else {
        await go(page, 'browse');
        search = page.locator('#overview-search');
      }
      await search.fill('拨开迷雾');
      const dialog = page.getByRole('dialog', { name: '迷雾已拨开' });
      await dialog.waitFor();
      await dialog.getByRole('button', { name: '打开文本线索分析' }).click();
      await page.locator('#analysis-input').waitFor({ state: 'visible' });
      await page.waitForFunction(() => !document.querySelector('dialog[open]'));
      assert.deepEqual(errors, []);
      console.log('PASS search unlock surface: ' + surface + ', navigation closes overlays');
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await site.close();
}
