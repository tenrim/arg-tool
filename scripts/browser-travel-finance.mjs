import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { createDevServer, closeDevServer } from './server.mjs';
import { TRAVEL_FINANCE_DETAILS } from '../public/practical/travel-finance-data.js';
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
await mkdir('outputs/travel-finance', { recursive: true });
try {
  for (const width of [1440, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      hasTouch: width === 320,
      isMobile: width === 320,
      colorScheme: 'dark',
      reducedMotion: width === 320 ? 'reduce' : 'no-preference',
    });
    const external = [];
    await context.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.origin === base || ['blob:', 'data:'].includes(url.protocol)) return route.continue();
      external.push(url.href);
      return route.abort();
    });
    const page = await context.newPage(),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + '/?layout=chronicle#trip-pace');
    await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
    const go = async (id) => {
      await page.evaluate((id) => (location.hash = id), id);
      await page.locator('#panel-' + id).waitFor({ state: 'visible' });
    };
    const run = async (id) => {
      await page.locator('#' + id + '-run').click();
      await page.locator('#' + id + '-copy:enabled').waitFor();
    };
    if (process.env.TRAVEL_FINANCE_SCOPE !== 'search') {
      for (const id of Object.keys(TRAVEL_FINANCE_DETAILS)) {
        await go(id);
        const panel = page.locator('#panel-' + id);
        await run(id);
        assert(await panel.locator('#' + id + '-result [data-ui=data-list]').isVisible(), id);
        assert.equal(
          await panel.locator('#' + id + '-formula').textContent(),
          TRAVEL_FINANCE_DETAILS[id].formula,
        );
        assert.equal(
          await panel.locator('[data-ui=reference-list] a[data-reference-id]').count(),
          TRAVEL_FINANCE_DETAILS[id].sources.length,
        );
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${id}: ${width} overflow`,
        );
        const outside = await panel.locator('input,select').evaluateAll((nodes) =>
          nodes
            .filter((n) => n.getClientRects().length)
            .filter((n) => {
              const r = n.getBoundingClientRect();
              return r.left < 0 || r.right > innerWidth + 1;
            })
            .map((n) => n.id),
        );
        assert.deepEqual(outside, [], id);
        await panel.locator('input:visible').first().fill('');
        assert(await panel.locator('#' + id + '-copy').isDisabled());
        assert.equal(await panel.locator('#' + id + '-result [data-ui=data-list]').count(), 0);
        await page.locator('#' + id + '-run').click();
        assert(await panel.locator('#' + id + '-status').isVisible());
      }
      await go('trip-pace');
      await page.locator('#trip-pace-mode').selectOption('pace');
      await page.locator('#trip-pace-distance').fill('10');
      await run('trip-pace');
      assert.match(await page.locator('#trip-pace-result').innerText(), /300 秒\/km/);
      await page.locator('#trip-pace-mode').selectOption('distance');
      assert(await page.locator('#trip-pace-distance').isHidden());
      assert(await page.locator('#trip-pace-copy').isDisabled());
      await run('trip-pace');
      assert.match(await page.locator('#trip-pace-result').innerText(), /10 km/);
      await page.locator('#trip-pace-mode').selectOption('speed');
      await page.locator('#trip-pace-distance').fill('10');
      await run('trip-pace');
      assert.match(await page.locator('#trip-pace-result').innerText(), /12 km\/h/);
      await go('trip-cost');
      await page.locator('#trip-cost-mode').selectOption('electric');
      await page.locator('#trip-cost-distance').fill('300');
      await page.locator('#trip-cost-consumption').fill('15');
      await page.locator('#trip-cost-price').fill('.8');
      await page.locator('#trip-cost-extra').fill('24');
      await page.locator('#trip-cost-people').fill('3');
      await run('trip-cost');
      assert.match(await page.locator('#trip-cost-result').innerText(), /45 kWh/);
      assert.match(await page.locator('#trip-cost-result').innerText(), /20\.00 元/);
      assert.equal(
        await page.locator('label[for=trip-cost-price] [data-ui=field-label]').textContent(),
        '电价（元/kWh）',
      );
      await go('interest-growth');
      await page.locator('#interest-growth-principal').fill('5000');
      await run('interest-growth');
      assert.match(await page.locator('#interest-growth-result').innerText(), /6,044\.43 元/);
      await page.locator('#interest-growth-mode').selectOption('simple');
      assert(await page.locator('#interest-growth-frequency').isHidden());
      assert(await page.locator('#interest-growth-copy').isDisabled());
      await run('interest-growth');
      assert.match(await page.locator('#interest-growth-result').innerText(), /5,190\.00 元/);
      await go('loan-payment');
      await page.locator('#loan-payment-principal').fill('28500');
      await run('loan-payment');
      assert.match(await page.locator('#loan-payment-result').innerText(), /524\.75 元/);
      const details = page.locator('#loan-payment-result details');
      assert.equal(await details.getAttribute('open'), null);
      await details.locator('summary').click();
      await details.locator('tbody tr').last().waitFor({ state: 'visible' });
      assert.equal(await details.locator('tbody tr').count(), 60);
      assert.match(await details.locator('tbody tr').last().innerText(), /524\.23/);
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        'expanded table contained at ' + width,
      );
      const downloadPromise = page.waitForEvent('download');
      await page
        .locator('#panel-loan-payment')
        .getByRole('button', { name: '下载结果', exact: true })
        .click();
      const download = await downloadPromise;
      const stream = await download.createReadStream();
      let text = '';
      for await (const chunk of stream) text += chunk.toString('utf8');
      assert.match(text, /完整还款表/);
      assert.match(text, /60\t522\.49\t524\.23\t1\.74\t522\.49\t0\.00/);
      assert.match(text, /openstax/);
      await page.evaluate(async () => {
        const { connectNotebook } = await import('/handoff/button.js');
        connectNotebook((request) => {
          window.ticket = request;
          window.snapshot = request.read();
        });
      });
      await page.locator('#loan-payment-record-notebook').click();
      assert.match(await page.evaluate(async () => (await window.snapshot).text), /完整还款表/);
      await page.locator('#loan-payment-rate').fill('0');
      assert.equal(await page.evaluate(() => window.ticket.isCurrent()), false);
      await run('loan-payment');
      assert.match(await page.locator('#loan-payment-result').innerText(), /475\.00 元/);
      await page.locator('#loan-payment-principal').fill('120000');
      await page.locator('#loan-payment-rate').fill('3');
      await page.locator('#loan-payment-months').fill('1200');
      await run('loan-payment');
      assert.equal(await page.locator('#loan-payment-result tbody tr').count(), 1200);
      await page.screenshot({ path: `outputs/travel-finance/loan-${width}.png`, fullPage: true });
      await go('settings');
      assert(await page.locator('#loan-payment-copy').isDisabled());
    } else await go('settings');
    const toggle = page.locator('#setting-searchKnowledge');
    assert.equal(await toggle.getAttribute('aria-checked'), 'false');
    const header = page.locator('#workspace-search-input'),
      popover = page.locator('.workspace-search-popover');
    async function headerSearch(included) {
      await header.fill('复利');
      await popover
        .locator('[data-capability="native:interest-growth"]')
        .waitFor({ state: 'visible' });
      assert.equal((await popover.locator('[data-capability^="learn:"]').count()) > 0, included);
      await header.press('Escape');
    }
    await headerSearch(false);
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-checked'), 'true');
    await headerSearch(true);
    // Retain a header query while the preference is changed: matching rerenders immediately.
    await header.fill('复利');
    await toggle.click();
    await header.focus();
    await popover.waitFor({ state: 'visible' });
    assert.equal(await popover.locator('[data-capability^="learn:"]').count(), 0);
    await header.press('Escape');
    await toggle.click();
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
    assert.equal(await toggle.getAttribute('aria-checked'), 'true');
    await headerSearch(true);
    const exported = await page.evaluate(async () =>
      (await import('/preferences.js')).exportPreferences(),
    );
    assert.equal(JSON.parse(exported).preferences.searchKnowledge, true);
    await go('home');
    await page.locator('#home-search').fill('复利');
    const home = page.locator('#panel-home .capability-search-list');
    await home.locator('[data-capability^="learn:"]').first().waitFor({ state: 'visible' });
    await page.evaluate(async () =>
      (await import('/preferences.js')).setPreferences({ searchKnowledge: false }),
    );
    assert.equal(await home.locator('[data-capability^="learn:"]').count(), 0);
    assert(await home.locator('[data-capability="native:interest-growth"]').isVisible());
    await page.locator('#panel-home [data-category=knowledge]').click();
    assert(
      await home.locator('[data-capability^="learn:"]').first().isVisible(),
      'explicit knowledge category remains searchable',
    );
    await go('browse');
    await page.locator('#overview-search').fill('复利');
    const overview = page.locator('#panel-browse .capability-search-list');
    assert.equal(await overview.locator('[data-capability^="learn:"]').count(), 0);
    await page.evaluate(async () =>
      (await import('/preferences.js')).setPreferences({ searchKnowledge: true }),
    );
    await overview.locator('[data-capability^="learn:"]').first().waitFor({ state: 'visible' });
    await page.evaluate(async () =>
      (await import('/preferences.js')).setPreferences({ searchKnowledge: false }),
    );
    assert.equal(await overview.locator('[data-capability^="learn:"]').count(), 0);
    // The sidebar is the same original node in desktop layout and mobile drawer.
    if (width === 320)
      await page.getByRole('button', { name: '切换工具侧栏', exact: true }).click();
    const rail = page.locator('#workbench-sidebar');
    await rail.getByPlaceholder('筛选工具', { exact: true }).fill('复利');
    const railResults = rail.locator('.rail-search-results');
    assert.equal(await railResults.locator('[data-category=knowledge]').count(), 0);
    await page.evaluate(async () =>
      (await import('/preferences.js')).setPreferences({ searchKnowledge: true }),
    );
    await railResults.locator('[data-category=knowledge]').first().waitFor({ state: 'visible' });
    await rail.getByRole('button', { name: /全部工具/ }).click();
    const directory = page.locator('dialog.tool-directory');
    await directory.waitFor({ state: 'visible' });
    await directory.getByPlaceholder('搜索工具、算法或格式').fill('复利');
    await directory.locator('[data-capability^="learn:"]').first().waitFor({ state: 'visible' });
    await page.evaluate(async () =>
      (await import('/preferences.js')).setPreferences({ searchKnowledge: false }),
    );
    assert.equal(await directory.locator('[data-capability^="learn:"]').count(), 0);
    await directory.locator('[data-filter=knowledge]').click();
    assert(await directory.locator('[data-capability^="learn:"]').first().isVisible());
    await directory.getByRole('button', { name: '关闭工具目录', exact: true }).click();
    await page.evaluate(
      async (text) => (await import('/preferences.js')).importPreferences(text),
      exported,
    );
    await go('settings');
    assert.equal(await toggle.getAttribute('aria-checked'), 'true');
    await page.locator('#panel-settings').getByText('重置与清理', { exact: true }).click();
    await page.getByRole('button', { name: '恢复默认设置', exact: true }).click();
    assert.equal(await toggle.getAttribute('aria-checked'), 'false');
    await header.fill('复利');
    await header.press('ArrowDown');
    await header.press('Enter');
    await page.locator('#panel-interest-growth').waitFor({ state: 'visible' });
    assert.deepEqual(errors, []);
    assert.deepEqual(external, [], 'calculations and metadata search remain offline');
    checks.push({
      width,
      calculators: process.env.TRAVEL_FINANCE_SCOPE === 'search' ? 0 : 5,
      completeSchedule: process.env.TRAVEL_FINANCE_SCOPE !== 'search',
      searchSurfaces: 5,
      preferencePersistence: true,
    });
    await context.close();
  }
  console.log(JSON.stringify({ checks }, null, 2));
} finally {
  await browser.close();
  await closeDevServer(server);
}
