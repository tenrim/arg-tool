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
    await page.locator('.rail-directory-button').click();
    await page.locator('.directory-search input').fill('SM4');
    await page
      .locator('.directory-grid [data-capability="pair:SM4%20Encrypt"]')
      .waitFor({ state: 'visible' });
    assert.equal(
      await page.locator('.directory-grid [data-capability^="learn:"]').count(),
      enabled ? 1 : 0,
    );
    await page.getByRole('button', { name: '关闭工具目录', exact: true }).click();
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
  for (const [query, first] of [
    ['凯撒', 'topic:rot'],
    ['佛曰', 'native:buddha-codec'],
    ['sstv', 'native:audio-sstv'],
    ['zip', 'topic:compression'],
    ['隐写', 'native:forensics-image-survey'],
    ['拆帧', 'topic:video'],
    ['不知道是什么编码', 'op:Magic'],
  ]) {
    await input.fill(query);
    await page.locator('#workspace-search-results [data-capability]').first().waitFor();
    assert.equal(
      await page
        .locator('#workspace-search-results [data-capability]')
        .first()
        .getAttribute('data-capability'),
      first,
      query,
    );
    await input.press('Escape');
    await page.locator('.rail-directory-button').click();
    await page.locator('.directory-search input').fill(query);
    assert.equal(
      await page
        .locator('.directory-grid [data-capability]')
        .first()
        .getAttribute('data-capability'),
      first,
      query,
    );
    await page.getByRole('button', { name: '关闭工具目录', exact: true }).click();
  }
  console.log('PASS same ranked results in header and directory, including locked discovery');
  console.log(
    'PASS default exclusion, settings opt-in/out, header/directory results and reload persistence',
  );
} finally {
  try {
    await browser.close();
  } finally {
    await site.close();
  }
}
