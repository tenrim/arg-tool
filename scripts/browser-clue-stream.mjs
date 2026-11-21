import assert from 'node:assert/strict';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';

const online = process.argv.includes('--production');
const site = online ? null : await startBrowserTestSite();
const origin = online ? 'https://www.tool.mistarg.cn' : site.base;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  for (const finish of process.argv.includes('--stop-only') ? ['stop'] : ['stop', 'complete']) {
    const ctx = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('arg.discovery.text-analysis.v1', 'solved-v1');
      document.addEventListener(
        'click',
        (event) => {
          if (!event.target.closest('#analysis-magic')) return;
          window.times = { click: performance.now() };
          const observe = () => {
            const candidates = document.querySelectorAll('[data-clue-candidate] span');
            if (candidates[0]?.getClientRects().length)
              window.times.first ??= performance.now() - window.times.click;
            if (
              Array.from(candidates).some(
                (n) => n.textContent === 'Alfa Bravo Charlie' && n.getClientRects().length,
              )
            )
              window.times.answer ??= performance.now() - window.times.click;
            if (!window.times.answer && document.querySelector('#analysis-magic').disabled)
              requestAnimationFrame(observe);
          };
          requestAnimationFrame(observe);
        },
        true,
      );
    });
    await page.goto(origin + '/?layout=chronicle#analysis?task=native%3Acipher-detect', {
      waitUntil: 'commit',
    });
    await page.waitForFunction(
      () => document.documentElement.dataset.startupState === 'ready',
      null,
      { timeout: 120000 },
    );
    assert.equal(await page.locator('#analysis-depth').inputValue(), '3');
    await page.locator('#analysis-input').fill('QWxmYSBCcmF2byBDaGFybGll');
    await page.locator('#analysis-magic').click();
    await page.waitForFunction(() => window.times?.answer > 0, null, { timeout: 60000 });
    assert.equal(await page.locator('#analysis-export').isEnabled(), false);
    const answer = page
      .locator('[data-clue-candidate]')
      .filter({ has: page.locator('span', { hasText: /^Alfa Bravo Charlie$/ }) })
      .first();
    await answer.click();
    assert.equal(await page.locator('#analysis-output').inputValue(), 'Alfa Bravo Charlie');
    await page.locator('#analysis-copy').click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'Alfa Bravo Charlie');
    if (finish === 'stop') await page.locator('#analysis-stop').click();
    await page.locator('#analysis-export:enabled').waitFor({ timeout: 650000 });
    assert.equal(await page.locator('#analysis-output').inputValue(), 'Alfa Bravo Charlie');
    assert.equal(await answer.getAttribute('aria-pressed'), 'true');
    const times = await page.evaluate(() => window.times);
    console.log(
      JSON.stringify({
        finish,
        ...times,
        status: await page.locator('#analysis-status').textContent(),
      }),
    );
    await page.locator('#analysis-input').fill('changed');
    assert.equal(await page.locator('[data-clue-candidate]').count(), 0);
    assert.equal(await page.locator('#analysis-copy').isDisabled(), true);
    if (finish === 'stop' && !online) {
      await page.locator('#analysis-input').fill('QWxmYSBCcmF2byBDaGFybGll');
      await page.locator('#analysis-magic').click();
      await answer.waitFor();
      assert.equal(await page.locator('#analysis-stop').isEnabled(), true);
      await page.locator('#analysis-input').fill('new input');
      await page.evaluate(
        () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
      );
      assert.equal(await page.locator('[data-clue-candidate]').count(), 0);
      assert.equal(await page.locator('#analysis-output').inputValue(), '');
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  await site?.close();
}
