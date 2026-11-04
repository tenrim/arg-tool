import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { startBrowserTestSite } from './browser-test-site.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite();
const browser = await chromium
  .launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
  .catch(async (error) => {
    await site.close();
    throw error;
  });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' }),
    bodies = [],
    errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (/\/knowledge\/(?:content\.js|articles\/|chapters\/)/.test(request.url()))
      bodies.push(request.url());
  });
  await page.goto(site.base + '/#home');
  await page.locator('#panel-home [data-capability]').first().waitFor();
  const article = await page.evaluate(async () => {
    const { setPreferences } = await import('/preferences.js');
    setPreferences({ searchKnowledge: true });
    const { loadRegistry } = await import('/capabilities/registry.js');
    const registry = await loadRegistry();
    return registry.entries.find((entry) => entry.type === 'learning').articleId;
  });
  await page.locator('#workspace-search-input').fill('Base64');
  await page.locator('#workspace-search-results [data-capability^="learn:"]').first().waitFor();
  assert.deepEqual(bodies, [], '首页及启用科普全局搜索仍只加载目录');
  await page.keyboard.press('Escape');
  await page.evaluate(
    (id) => (location.hash = 'knowledge?task=' + encodeURIComponent('learn:' + id)),
    article,
  );
  await page.locator('[data-knowledge-detail]').waitFor();
  assert(bodies.some((url) => url.endsWith('/knowledge/content.js')));
  assert((await page.locator('.knowledge-section').count()) > 0);
  assert((await page.locator('.knowledge-references a').count()) > 0);
  await page.getByRole('button', { name: '返回科普目录', exact: true }).click();
  await page.locator('#knowledge-query').fill('Base64');
  await page.locator('#knowledge-list [data-knowledge-article]').first().waitFor();
  assert.deepEqual(errors, []);
  await page.close();

  // A delayed module must not paint an article after leaving the reader.
  const late = await browser.newPage({ reducedMotion: 'reduce' });
  let release, requested;
  const gate = new Promise((resolve) => {
      release = resolve;
    }),
    started = new Promise((resolve) => {
      requested = resolve;
    });
  await late.route('**/knowledge/content.js', async (route) => {
    requested();
    await gate;
    await route.continue();
  });
  await late.goto(site.base + '/#home');
  await late.locator('#panel-home [data-capability]').first().waitFor();
  await late.evaluate(
    (id) => (location.hash = 'knowledge?task=' + encodeURIComponent('learn:' + id)),
    article,
  );
  await started;
  await late.evaluate(() => (location.hash = 'home'));
  await late.locator('#panel-home:not([hidden])').waitFor();
  release();
  await late.evaluate(() => import('/knowledge/content.js'));
  assert.equal(await late.locator('[data-knowledge-detail]').count(), 0);
  await late.evaluate(
    (id) => (location.hash = 'knowledge?task=' + encodeURIComponent('learn:' + id)),
    article,
  );
  await late.locator('[data-knowledge-detail]').waitFor();
  await late.close();

  const failed = await browser.newPage({ reducedMotion: 'reduce' });
  let fail = true;
  await failed.route('**/knowledge/content.js', (route) => {
    if (fail) {
      fail = false;
      return route.abort();
    }
    return route.continue();
  });
  await failed.goto(site.base + '/#knowledge?task=' + encodeURIComponent('learn:' + article));
  await failed.getByRole('button', { name: '重新加载页面', exact: true }).click();
  await failed.locator('[data-knowledge-detail]').waitFor();
  await failed.close();
  console.log(
    'PASS: metadata-only startup/search, complete reader/references, leave/reenter, failed module reload.',
  );
} finally {
  try {
    await browser.close();
  } finally {
    await site.close();
  }
}
