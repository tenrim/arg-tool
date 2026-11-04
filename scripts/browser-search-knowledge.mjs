import { startBrowserTestSite } from './browser-test-site.mjs';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite();
const browser = await chromium
  .launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
  .catch(async (error) => {
    await site.close();
    throw error;
  });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  await page.goto(site.base + '/?layout=chronicle#settings');
  await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
  const toggle = page.locator('#setting-searchKnowledge'),
    input = page.locator('#workspace-search-input');
  const lessons = page.locator('#workspace-search-results [data-capability^="learn:"]');
  await toggle.waitFor({ state: 'visible' });
  assert.equal(await toggle.getAttribute('aria-checked'), 'false');
  async function check(enabled) {
    await input.fill('SM4');
    await page
      .locator('#workspace-search-results [data-capability="pair:SM4%20Encrypt"]')
      .waitFor({ state: 'visible' });
    assert.equal(await lessons.count(), enabled ? 1 : 0);
    await input.press('Escape');
    await page.locator('.rail-filter input').fill('SM4');
    await page
      .locator('.rail-search-results [data-capability="pair:SM4%20Encrypt"]')
      .waitFor({ state: 'visible' });
    assert.equal(
      await page.locator('.rail-search-results [data-category="knowledge"]').count(),
      enabled ? 1 : 0,
    );
  }
  await check(false);
  await toggle.click();
  await check(true);
  await page.reload();
  await toggle.waitFor({ state: 'visible' });
  assert.equal(await toggle.getAttribute('aria-checked'), 'true');
  await check(true);
  await toggle.click();
  await check(false);
  await page.reload();
  await toggle.waitFor({ state: 'visible' });
  assert.equal(await toggle.getAttribute('aria-checked'), 'false');
  await check(false);
  console.log(
    'PASS default exclusion, settings opt-in/out, header/sidebar results and reload persistence',
  );
} finally {
  try {
    await browser.close();
  } finally {
    await site.close();
  }
}
