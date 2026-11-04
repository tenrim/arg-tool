import assert from 'node:assert/strict';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseOperation, chooseNativeTask } from './browser-navigation.mjs';
const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } }),
    errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const Original = Worker;
    window.chefWorkers = [];
    window.Worker = class extends Original {
      constructor(url, options) {
        super(url, options);
        if (String(url).includes('cyberchef-worker')) window.chefWorkers.push(this);
      }
      terminate() {
        this.wasTerminated = true;
        return super.terminate();
      }
    };
  });
  await page.goto(site.base);
  async function task(op) {
    const entry = await chooseOperation(page, op);
    return page.locator('#panel-' + entry.panel + ' .ct-tool');
  }
  async function run(p) {
    await p.locator('.ct-run').click();
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('.ct-tool')].some(
          (p) =>
            p.getClientRects().length &&
            /处理完成|失败|错误|出错/.test(p.querySelector('.ct-status').textContent),
        ),
      null,
      { timeout: 60000 },
    );
    assert.match(await p.locator('.ct-status').textContent(), /处理完成/);
  }
  if (!process.argv.includes('--native')) {
    let p = await task('To Base64');
    await p.locator('.ct-input').fill('Hello world');
    await run(p);
    assert.equal(await p.locator('.ct-output').inputValue(), 'SGVsbG8gd29ybGQ=');
    await p.locator('.ct-input').fill('second');
    await run(p);
    assert.equal(await page.evaluate(() => window.chefWorkers.length), 1);
    p = await task('ROT13');
    await p.locator('.ct-input').fill('Hello');
    await run(p);
    assert.equal(await p.locator('.ct-output').inputValue(), 'Uryyb');
    assert.equal(
      await page.evaluate(() => window.chefWorkers.length),
      1,
      '不同工具复用一个已初始化线程',
    );
    p = await task('Magic');
    const source = p.locator('.ct-source');
    await source.evaluate((s) => {
      s.value = 'text';
      s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await p.locator('.ct-input').fill('SGVsbG8gd29ybGQ=');
    await run(p);
    const magic = p.locator('[data-chef-result=magic]');
    await magic.waitFor();
    assert.match(await magic.innerText(), /香农熵/);
    assert.equal(await page.evaluate(() => window.chefWorkers.length), 1);
    assert.ok(await magic.getByRole('button', { name: '采用此候选配方' }).count());
    const raw = JSON.parse(await magic.getByLabel('原始 JSON 数据').inputValue());
    assert.ok(raw.some((v) => v.data === 'Hello world'));
    // Pick by actual candidate text; no fixed ordering assumption.
    const chosen = magic
      .locator('[data-ui=card]')
      .filter({ has: page.locator('textarea[aria-label="候选结果片段"]') });
    let selected;
    for (const card of await chosen.all())
      if ((await card.getByLabel('候选结果片段').inputValue()) === 'Hello world') {
        selected = card;
        break;
      }
    assert.ok(selected);
    await selected.getByRole('button', { name: '采用此候选配方' }).click();
    await page.locator('#panel-cyberchef').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#chef-input').inputValue(), 'SGVsbG8gd29ybGQ=');
    await page.locator('#chef-run').click();
    await page.waitForFunction(
      () => document.getElementById('chef-output').value === 'Hello world',
    );
    assert.equal(
      await page.evaluate(() => window.chefWorkers.length),
      1,
      '采用配方进入完整处理链仍复用线程',
    );
    await page.getByRole('button', { name: 'Magic 自动识别', exact: true }).click();
    await page.locator('#chef-run').click();
    await page.locator('#panel-cyberchef [data-chef-result=magic]').waitFor();
    assert.equal(await page.locator('#chef-output').isVisible(), false);
    await page.setViewportSize({ width: 320, height: 620 });
    const overflow = await page
      .locator('#panel-cyberchef [data-chef-result=magic]')
      .evaluate((e) => e.getBoundingClientRect().right > innerWidth + 1);
    assert.equal(overflow, false);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator('#chef-input').fill('changed');
    assert.equal(await page.locator('#panel-cyberchef [data-chef-result=magic]').count(), 0);
    assert.equal(await page.locator('#chef-download').isDisabled(), true);
    await page.setViewportSize({ width: 1280, height: 900 });
    p = await task('ROT13');
    await p.locator('.ct-input').fill('after chain');
    await run(p);
    assert.equal(await page.evaluate(() => window.chefWorkers.length), 1);
    // Cancellation destroys the busy engine; a subsequent acquisition really retries.
    const lifecycle = await page.evaluate(async () => {
      const { acquireCyberChef, releaseCyberChef } = await import('./cyberchef-client.js');
      const c = acquireCyberChef();
      await c.ready;
      const pending = c.bake('abc', [
        { op: 'Label', args: ['loop'] },
        { op: 'Jump', args: ['loop', 99999999] },
      ]);
      await Promise.resolve();
      c.close();
      let rejected = false;
      try {
        await pending;
      } catch {
        rejected = true;
      }
      const next = acquireCyberChef();
      const out = await next.bake('abc', [{ op: 'To Base64', args: ['A-Za-z0-9+/='] }]);
      releaseCyberChef(next);
      return {
        rejected,
        terminated: c.worker.wasTerminated,
        result: new TextDecoder().decode(out.bytes),
      };
    });
    assert.deepEqual(lifecycle, { rejected: true, terminated: true, result: 'YWJj' });
    // Raw object view paginates without dropping records or interpreting HTML.
    const structured = await page.evaluate(async () => {
      const { structuredResult } = await import('./chef-tools/structured-result.js');
      const value = Array.from({ length: 23 }, (_, i) => ({
        index: i,
        text: '<img src=x onerror=alert(1)>',
      }));
      const root = structuredResult(value);
      document.getElementById('main').append(root);
      const initial = root.querySelectorAll('[data-ui=card]').length;
      [...root.querySelectorAll('button')].find((b) => b.textContent === '下一页').click();
      const last = root.querySelectorAll('[data-ui=card]').length;
      const full = JSON.parse(root.querySelector('textarea').value).length,
        images = root.querySelectorAll('img').length;
      root.remove();
      return { initial, last, full, images };
    });
    assert.deepEqual(structured, { initial: 20, last: 3, full: 23, images: 0 });
  }
  await chooseNativeTask(page, 'native:ascii');
  const initialWorkers = await page.evaluate(() => window.chefWorkers.length);
  for (const [text, expected] of [
    ['ARG', '65 82 71'],
    ['ABC', '65 66 67'],
  ]) {
    await page.locator('#basics-input').fill(text);
    await page.locator('#basics-run').click();
    await page.waitForFunction(
      () => document.getElementById('basics-status').textContent === '转换完成',
    );
    assert.equal(await page.locator('#basics-output').inputValue(), expected);
  }
  assert.equal(await page.evaluate(() => window.chefWorkers.length), Math.max(1, initialWorkers));
  await chooseNativeTask(page, 'native:cipher-detect');
  await page.locator('#analysis-input').fill('SGVsbG8gd29ybGQ=');
  await page.locator('#analysis-magic').click();
  const nativeMagic = page.locator('#panel-analysis [data-chef-result=magic]');
  await nativeMagic.waitFor();
  assert.equal(await page.locator('#analysis-output').isVisible(), false);
  let nativeChoice;
  for (const card of await nativeMagic.locator('[data-ui=card]').all())
    if ((await card.getByLabel('候选结果片段').inputValue()) === 'Hello world') {
      nativeChoice = card;
      break;
    }
  assert.ok(nativeChoice);
  await nativeChoice.getByRole('button', { name: '采用此候选配方' }).click();
  await page.waitForFunction(
    () => document.getElementById('analysis-output').value === 'Hello world',
  );
  assert.equal(await page.evaluate(() => window.chefWorkers.length), Math.max(1, initialWorkers));
  await page.locator('#analysis-input').fill('new');
  assert.equal(await page.locator('#analysis-output').inputValue(), '');
  assert.deepEqual(errors, []);
  console.log(
    process.argv.includes('--native')
      ? '通过：基础转换重复使用、原生密文分析候选展示、完整候选执行和输入失效。'
      : '通过：连续/跨工具/处理链复用、Magic 原始候选与配方采纳、手机布局、失效、真实取消后重建、结构化分页与安全文本。',
  );
} finally {
  await browser.close();
  await site.close();
}
