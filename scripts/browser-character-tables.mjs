import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createDevServer, closeDevServer } from './server.mjs';
import { EXTRA_REPERTOIRES } from '../public/character-tables/repertoires.js';
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
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  headless: true,
});
const checks = [],
  errors = [],
  external = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  let fail = true,
    requests = 0;
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== base) {
      external.push(url.href);
      return route.abort();
    }
    if (url.pathname.endsWith('/character-tables/characters.json')) {
      requests++;
      if (fail) {
        fail = false;
        return route.fulfill({ status: 503, body: 'test unavailable' });
      }
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + '/#home');
  await page
    .waitForFunction(() => document.documentElement.dataset.startupState === 'ready')
    .catch(async (error) => {
      console.error(
        JSON.stringify({ errors, body: (await page.locator('body').innerText()).slice(0, 1600) }),
      );
      throw error;
    });
  assert.equal(requests, 0, 'data is lazy');
  await page.locator('#workspace-search-input').fill('韩文');
  const found = page.locator(
    '.workspace-search-popover [data-capability="native:character-tables"]',
  );
  await found.waitFor();
  await found.click();
  const panel = page.locator('#panel-character-tables');
  await panel.waitFor({ state: 'visible' });
  await page.locator('#characters-retry').waitFor({ state: 'visible' });
  await page.locator('#characters-retry').click();
  await page.locator('#characters-grid button').first().waitFor();
  assert.equal(await panel.locator(':scope>.tool-provenance').count(), 1);
  assert.equal(await panel.locator(':scope>.tool-provenance [data-license]').count(), 2);
  await page.locator('#characters-grid [data-character="あ"]').click();
  await page.locator('#characters-copy').click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'あ');
  assert((await page.locator('#characters-detail').textContent()).includes('U+3042'));
  await page.locator('#characters-search').fill('U+3042');
  assert.equal(await page.locator('#characters-grid button').count(), 1);
  assert(await page.locator('#characters-copy').isDisabled());
  await page.locator('#characters-search').fill('no such character xyz');
  assert.equal(await page.locator('#characters-grid button').count(), 0);
  assert(await page.locator('#characters-download').isDisabled());
  await page.locator('#characters-search').fill('');
  await page.locator('#characters-language').selectOption('ko');
  await page.locator('#characters-view').selectOption('syllables');
  assert((await page.locator('#characters-summary').textContent()).includes('11172'));
  assert.equal(await page.locator('#characters-grid button').count(), 96);
  const pending = page.waitForEvent('download');
  await page.locator('#characters-download').click();
  const download = await pending;
  const output = JSON.parse(await readFile(await download.path(), 'utf8'));
  assert.equal(output.records.length, 11172);
  assert.equal(output.records.at(-1).text, '힣');
  await page.locator('#characters-next').click();
  assert.equal(await page.locator('#characters-page').textContent(), '2 / 117');
  await page.locator('#characters-search').fill('U+D7A3');
  assert.equal(await page.locator('#characters-grid button').count(), 1);
  await page.locator('#characters-grid button').click();
  await page.locator('#characters-copy').click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), '힣');
  checks.push(
    'search discovery, deferred data failure/retry, exact copy, state invalidation, paging and all 11172 Hangul export',
  );
  for (const [lang, query, expected] of [
    ['el', 'U+03B1', 'α'],
    ['ru', 'U+042C', 'Ь'],
    ['he', 'U+05D0', 'א'],
    ['ar', 'U+064E', 'َ'],
    ['th', 'U+0E01', 'ก'],
    ['hi', 'U+0915', 'क'],
  ]) {
    await page.locator('#characters-language').selectOption(lang);
    await page.locator('#characters-search').fill(query);
    assert.equal(await page.locator('#characters-grid button').count(), 1);
    await page.locator('#characters-grid button').click();
    await page.locator('#characters-copy').click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected);
  }
  await page.locator('#characters-language').selectOption('ru');
  await page.locator('#characters-view').selectOption('auxiliary');
  await page.locator('#characters-search').fill('а́');
  await page.locator('#characters-grid button').click();
  await page.locator('#characters-copy').click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'а́');
  checks.push(
    'all eight language/script groups, RTL and combining sequences without display-circle contamination',
  );
  for (const [id] of EXTRA_REPERTOIRES) {
    await page.locator('#characters-language').selectOption(id);
    assert.equal(await page.locator('#characters-view').inputValue(), 'script');
    assert((await page.locator('#characters-grid button').count()) > 0);
    assert.equal(await page.locator('#characters-view option[value=common]').count(), 0);
  }
  await page.locator('#characters-language').selectOption('numbers');
  assert((await page.locator('#characters-summary').textContent()).includes('770'));
  for (const [view, query, expected, value] of [
    ['roman', 'U+216B', 'Ⅻ', '12'],
    ['han', 'U+5104', '億', '100000000'],
    ['fractions', 'U+2153', '⅓', '1/3'],
    ['mayan', 'U+1D2E0', '𝋠', '0'],
    ['all', 'U+0F33', '༳', '-1/2'],
  ]) {
    await page.locator('#characters-view').selectOption(view);
    await page.locator('#characters-search').fill(query);
    assert.equal(await page.locator('#characters-grid button').count(), 1);
    await page.locator('#characters-grid button').click();
    assert((await page.locator('#characters-detail').textContent()).includes(value));
    await page.locator('#characters-copy').click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected);
  }
  await page.locator('#characters-search').fill('数值:1/3');
  assert(await page.locator('#characters-grid [data-character="⅓"]').count());
  assert(await page.locator('#characters-copy').isDisabled());
  await page.locator('#characters-search').fill('');
  const numericDownload = page.waitForEvent('download');
  await page.locator('#characters-download').click();
  const numericFile = await numericDownload,
    numericOutput = JSON.parse(await readFile(await numericFile.path(), 'utf8'));
  assert.equal(numericOutput.records.length, 2023);
  assert.equal(numericOutput.records.find((r) => r.text === '⅓').points[0].numericValue, '1/3');
  await page.locator('#characters-language').selectOption('bengali');
  await page.locator('#characters-view').selectOption('numbers');
  await page.locator('#characters-search').fill('U+09E7');
  await page.locator('#characters-grid button').click();
  await page.locator('#characters-copy').click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), '১');
  await page.locator('#characters-language').selectOption('he');
  await page.locator('#characters-search').fill('');
  await page.locator('#characters-view').selectOption('numbers');
  assert.equal(await page.locator('#characters-grid button').count(), 0);
  assert(await page.locator('#characters-copy').isDisabled());
  assert(await page.locator('#characters-download').isDisabled());
  await page.locator('#characters-language').selectOption('numbers');
  await page.locator('#characters-search').fill('');
  await page.locator('#characters-view').selectOption('mayan');
  await mkdir('outputs/character-tables', { recursive: true });
  await page.screenshot({ path: 'outputs/character-tables/numerals.png', fullPage: true });
  checks.push(
    '29 added script choices, complete 2023 numeric export, exact fractions/negative values, numeric search, Han subgroup and per-script digits',
  );
  await page.evaluate(() => (location.hash = 'home'));
  await page.locator('#panel-home').waitFor({ state: 'visible' });
  assert(await page.locator('#characters-copy').isDisabled());
  await page.evaluate(() => (location.hash = 'character-tables'));
  await panel.waitFor({ state: 'visible' });
  assert.equal(await panel.locator(':scope>.tool-provenance').count(), 1);
  await page.locator('#characters-language').selectOption('ja');
  await page.locator('#characters-search').fill('');
  await page.locator('#characters-view').selectOption('kana');
  await mkdir('outputs/character-tables', { recursive: true });
  for (const width of [1440, 800, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      width + ' no overflow',
    );
    await page.screenshot({ path: 'outputs/character-tables/' + width + '.png', fullPage: true });
  }
  await page.locator('#characters-grid button').first().focus();
  await page.keyboard.press('Enter');
  assert.equal(
    await page.locator('#characters-grid button').first().getAttribute('aria-pressed'),
    'true',
  );
  await page.evaluate(() => (location.hash = 'external-other'));
  await page.locator('#panel-external-other').waitFor({ state: 'visible' });
  const pudone = page.locator('[data-external-site="P27"]');
  await pudone.waitFor();
  assert.equal(await pudone.locator('a').getAttribute('href'), 'https://pudone.com/');
  assert.equal(await pudone.locator('a').getAttribute('rel'), 'noopener noreferrer');
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  checks.push(
    'keyboard, 1440/800/390 layouts, source footer remount, external link and no background external requests',
  );
  console.log(JSON.stringify({ checks, errors, external }, null, 2));
  await context.close();
} finally {
  await browser.close();
  await closeDevServer(server);
}
