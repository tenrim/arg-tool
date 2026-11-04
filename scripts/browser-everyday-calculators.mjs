import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { createDevServer, closeDevServer } from './server.mjs';
import { EVERYDAY_DETAILS } from '../public/practical/everyday-data.js';
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
await mkdir('outputs/everyday-calculators', { recursive: true });
try {
  for (const width of [1440, 768, 320]) {
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
    await page.goto(base + '/?layout=chronicle#altitude-pressure');
    await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
    for (const id of Object.keys(EVERYDAY_DETAILS)) {
      await page.evaluate((id) => (location.hash = id), id);
      const panel = page.locator('#panel-' + id);
      await panel.waitFor({ state: 'visible' });
      await panel.locator('#' + id + '-run').click();
      await panel.locator('#' + id + '-copy:enabled').waitFor();
      assert(await panel.locator('#' + id + '-result [data-ui=data-list]').isVisible(), id);
      const formula = panel.locator('#' + id + '-formula');
      assert.equal(await formula.textContent(), EVERYDAY_DETAILS[id].formula);
      const links = panel.locator('[data-ui=reference-list] a[data-reference-id]');
      assert.equal(await links.count(), EVERYDAY_DETAILS[id].sources.length);
      for (const link of await links.all())
        assert(/^https:\/\//.test(await link.getAttribute('href')));
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${id}: ${width} overflow`,
      );
      const outside = await panel.locator('input:not([type=hidden]),select').evaluateAll((nodes) =>
        nodes
          .filter((n) => n.getClientRects().length)
          .filter((n) => {
            const r = n.getBoundingClientRect();
            return r.left < 0 || r.right > innerWidth + 1;
          })
          .map((n) => n.id),
      );
      assert.deepEqual(outside, [], `${id}: ${width} clipped controls`);
      // Real input editing revokes the output, copying and notebook lease together.
      const edit = panel.locator('input:visible').first();
      await edit.fill('');
      assert(await panel.locator('#' + id + '-copy').isDisabled());
      assert.equal(await panel.locator('#' + id + '-result [data-ui=data-list]').count(), 0);
      await panel.locator('#' + id + '-run').click();
      assert(await panel.locator('#' + id + '-status').isVisible());
      assert(await panel.locator('#' + id + '-copy').isDisabled());
    }
    // Real parameter switching, preserved drafts and representative numeric outputs.
    await page.evaluate(() => (location.hash = 'water-mixing'));
    await page.locator('#water-mixing-mode').selectOption('amount');
    assert(await page.locator('#water-mixing-target').isVisible());
    assert(!(await page.locator('#water-mixing-coldMass').isVisible()));
    await page.locator('#water-mixing-cold').fill('20');
    await page.locator('#water-mixing-target').fill('40');
    await page.locator('#water-mixing-total').fill('6');
    await page.locator('#water-mixing-run').click();
    await page.locator('#water-mixing-copy:enabled').waitFor();
    assert.match(await page.locator('#water-mixing-result').innerText(), /2 kg/);
    await page.evaluate(async () => {
      const { connectNotebook } = await import('/handoff/button.js');
      connectNotebook((request) => {
        window.everydayTicket = request;
        window.everydaySnapshot = request.read();
      });
    });
    await page.locator('#water-mixing-record-notebook').click();
    const recorded = await page.evaluate(async () => (await window.everydaySnapshot).text);
    assert.match(recorded, /参考来源/);
    assert.match(recorded, /OpenStax/);
    assert.match(recorded, /计算公式/);
    assert.equal(await page.evaluate(() => window.everydayTicket.isCurrent()), true);
    await page.locator('#water-mixing-mode').selectOption('temperature');
    assert(await page.locator('#water-mixing-copy').isDisabled());
    assert.equal(await page.evaluate(() => window.everydayTicket.isCurrent()), false);
    assert.equal(await page.locator('#water-mixing-coldMass').inputValue(), '1');
    await page.evaluate(() => (location.hash = 'battery-runtime'));
    await page.locator('#battery-runtime-unit').selectOption('mAh');
    await page.locator('#battery-runtime-capacity').fill('10000');
    await page.locator('#battery-runtime-efficiency').fill('80');
    await page.locator('#battery-runtime-run').click();
    await page.locator('#battery-runtime-copy:enabled').waitFor();
    assert.match(await page.locator('#battery-runtime-result').innerText(), /5\.92 小时/);
    await page.locator('#battery-runtime-unit').selectOption('Wh');
    assert(!(await page.locator('#battery-runtime-voltage').isVisible()));
    assert(await page.locator('#battery-runtime-copy').isDisabled());
    // Formula blocks must remain below the working form, within the same panel.
    await page.evaluate(() => (location.hash = 'water-boiling'));
    await page.locator('#water-boiling-mode').selectOption('height');
    await page.locator('#water-boiling-height').fill('3000');
    await page.locator('#water-boiling-run').focus();
    await page.keyboard.press('Enter');
    await page.locator('#water-boiling-copy:enabled').waitFor();
    assert.match(await page.locator('#water-boiling-result').innerText(), /标准大气估算/);
    await page.screenshot({
      path: `outputs/everyday-calculators/boiling-${width}.png`,
      fullPage: true,
    });
    await page.evaluate(() => (location.hash = 'electricity-cost'));
    await page.locator('#panel-electricity-cost').waitFor({ state: 'visible' });
    assert(
      await page.locator('#water-boiling-copy').isDisabled(),
      'leaving revokes the old result',
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(external, [], 'calculations never contact external services');
    checks.push({
      width,
      calculators: 8,
      formulas: true,
      sources: true,
      staleResults: true,
      modes: true,
      recordedSources: true,
      offline: true,
    });
    await context.close();
  }
  console.log(JSON.stringify({ checks }, null, 2));
} finally {
  await browser.close();
  await closeDevServer(server);
}
