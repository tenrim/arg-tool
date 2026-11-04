import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { createDevServer, closeDevServer } from './server.mjs';
import { chooseNativeTask, go } from './browser-navigation.mjs';
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
const origin = 'http://127.0.0.1:' + server.address().port,
  output = process.env.REPAIR_ARTIFACTS || 'outputs/workbench-repairs-20261025';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox'],
  }),
  checks = [],
  errors = [];
const ready = (page) =>
  page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
const wanted = (name) =>
  !process.env.REPAIR_CASE || process.env.REPAIR_CASE.split(',').includes(name);
const visibleRect = async (locator) => {
  const r = await locator.evaluate((node) => {
    const r = node.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, height: innerHeight };
  });
  assert(r.top >= 63 && r.bottom <= r.height, JSON.stringify(r));
};
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } }),
    page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin + '/#it-reference?task=native%3Ait-ports');
  await ready(page);
  if (wanted('collections')) {
    const star = page.locator('#panel-it-reference .tool-favorite');
    await star.click();
    await chooseNativeTask(page, 'native:it-http');
    assert.equal(await star.getAttribute('aria-pressed'), 'false');
    await star.click();
    const favorites = await page.evaluate(async () =>
      (await import('./preferences.js')).favoriteEntries(),
    );
    assert.deepEqual(
      favorites.map((entry) => entry.id),
      ['native:it-ports', 'native:it-http'],
    );
    await go(page, 'home');
    for (const title of ['端口与网络协议资料', 'HTTP 状态与字段资料'])
      assert(
        await page.locator('.home-quick-links a').filter({ hasText: title }).first().isVisible(),
      );
    checks.push('收藏按实际工具区分，首页保留两个准确入口');
    await chooseNativeTask(page, 'native:braille');
    await page.locator('#panel-symbols .tool-favorite').click();
    await chooseNativeTask(page, 'native:braille-languages');
    assert.equal(
      await page.locator('.panel:not([hidden]) .tool-favorite').getAttribute('aria-pressed'),
      'true',
    );
    checks.push('同一盲文专题的不同成员仍共用一个收藏身份');
    await page.locator('.panel:not([hidden]) .tool-favorite').click();
    await page.locator('.panel:not([hidden]) .tool-favorite').click();
    await chooseNativeTask(page, 'native:it-ports');
    await page.locator('.rail-directory-button').click();
    await page.locator('.tool-directory [data-filter=favorites]').click();
    await page.locator('.tool-directory [data-capability="topic:braille"]').click();
    await page.waitForFunction(
      () =>
        new URLSearchParams(location.hash.split('?')[1]).get('view') === 'native:braille-languages',
    );
    checks.push('收藏目录保留实际收藏的专题成员');
    await chooseNativeTask(page, 'native:units-thermal');
    await go(page, 'settings');
    await page.locator('#setting-startPage').selectOption('last');
    const fresh = await context.newPage();
    await fresh.goto(origin + '/');
    await ready(fresh);
    assert.match(await fresh.title(), /^热学与能量单位/);
    await fresh.close();
    const startupOptions = await page.locator('#setting-startPage option').allTextContents();
    assert.equal(startupOptions.filter((s) => s === '盲文工具').length, 1);
    assert.equal(startupOptions.filter((s) => s === '海事信号工具').length, 1);
    checks.push('新文档恢复真实的上次工具，启动选项按登记去重');
    await chooseNativeTask(page, 'native:it-ports');
    await page.locator('[data-it-record]').last().click();
    await visibleRect(page.locator('#it-detail-title'));
    await page.screenshot({ path: output + '/ports.png' });
    await page.locator('#it-return-list').click();
    await visibleRect(page.locator('[data-it-record][aria-pressed=true]'));
    checks.push('长资料列表选择和返回均将目标置于视口内');
  }
  if (wanted('reading')) {
    await go(page, 'knowledge');
    await page.locator('#knowledge-list button').filter({ hasText: 'Base 家族' }).click();
    const hrefs = await page
      .locator('.knowledge-references [data-reference-id]')
      .evaluateAll((nodes) => nodes.map((n) => n.href));
    assert.equal(new Set(hrefs).size, hrefs.length);
    const outline = page.locator('.knowledge-reader details[data-variant=outline]');
    await outline.locator('summary').click();
    await outline.locator('nav button').last().click();
    await visibleRect(page.locator('#knowledge-detail h3:focus'));
    await page.screenshot({ path: output + '/article.png' });
    await page.locator('#knowledge-return-list').click();
    await page.locator('#knowledge-list button').last().click();
    await page.locator('#knowledge-return-list').click();
    await visibleRect(page.locator('#knowledge-list button:focus'));
    checks.push('文献不重复，长文目录可跳转，返回目录的焦点可见');
  }
  if (wanted('calculation')) {
    await chooseNativeTask(page, 'native:qalculate');
    await page.locator('#qalculate-expression').fill('2+3');
    await page.locator('#qalculate-expression').press('=');
    await page.waitForFunction(
      () => document.getElementById('qalculate-display-value').textContent === '5',
    );
    assert.equal(await page.locator('#qalculate-expression').inputValue(), '2+3');
    await page.locator('#qalculate-mode').selectOption('scientific');
    await page.locator('#qalculate-expression').fill('x');
    await page.locator('#qalculate-expression').press('=');
    assert.equal(await page.locator('#qalculate-expression').inputValue(), 'x=');
    checks.push('普通模式等号执行计算，科学模式保留等式输入');
    await chooseNativeTask(page, 'native:units-everyday');
    await page.waitForFunction(
      () => document.getElementById('unit-output').textContent === '100 cm',
    );
    await page.setViewportSize({ width: 390, height: 544 });
    await page.locator('#unit-amount').fill('800');
    await page.waitForFunction(
      () => document.getElementById('unit-output').textContent === '80000 cm',
    );
    const pair = await page.evaluate(() => ({
      input: document.getElementById('unit-amount').getBoundingClientRect().top,
      output: document.getElementById('unit-output').getBoundingClientRect().top,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    assert(Math.abs(pair.input - pair.output) < 100);
    assert(!pair.overflow);
    await visibleRect(page.locator('#unit-output'));
    await page.screenshot({ path: output + '/units-mobile.png' });
    await page.locator('#unit-category').selectOption('Area');
    await page.waitForFunction(() =>
      document.getElementById('unit-from').selectedOptions[0].textContent.includes('m²'),
    );
    assert(
      !(await page
        .locator('#unit-from')
        .innerText()
        .then((s) => s.includes('^('))),
    );
    await page.locator('#unit-category').selectOption('Length');
    assert(
      await page
        .locator('#unit-from')
        .innerText()
        .then((s) => s.includes('光秒') && !s.includes('Light Second')),
    );
    checks.push('手机换算结果紧邻输入，实时更新，单位名称和显示符号清楚');
    await page.locator('#unit-swap').click();
    await page.locator('#unit-notation summary').click();
    await page.locator('#unit-notation dl').waitFor({ state: 'visible' });
    assert.match(await page.locator('#unit-notation').innerText(), /原单位\s*\(cm\)/);
    checks.push('交换单位同步更新详细记号');
  }
  if (wanted('birds')) {
    await page.setViewportSize({ width: 1440, height: 960 });
    await chooseNativeTask(page, 'native:birds');
    await page.waitForFunction(() =>
      document.getElementById('birds-summary').textContent.startsWith('共 '),
    );
    assert.equal(await page.locator('#birds-rank').inputValue(), 'species');
    assert.match(
      await page.locator('#birds-results button').first().innerText(),
      /[\u4e00-\u9fff]/,
    );
    assert.equal(await page.locator('#panel-birds details.atlas-index').getAttribute('open'), null);
    assert(await page.locator('[data-workbook]').count());
    await page.locator('#birds-rank').selectOption('');
    await page.waitForFunction(() =>
      document.getElementById('birds-summary').textContent.includes('33,684'),
    );
    checks.push('鸟类默认浏览种与中文名，完整分类及工作簿仍可访问');
  }
  await context.close();
  if (wanted('reading')) {
    const reduced = await browser.newContext({ reducedMotion: 'reduce' }),
      reading = await reduced.newPage();
    await reading.goto(origin + '/#knowledge?task=learn%3Afunction-topic%3Abase-family');
    await ready(reading);
    await reading.locator('details[data-variant=outline] summary').click();
    await reading.locator('details[data-variant=outline] nav button').last().click();
    await visibleRect(reading.locator('#knowledge-detail h3:focus'));
    await reduced.close();
    checks.push('减少动态模式下文章目录与定位同样可用');
  }
  if (wanted('startup')) {
    const failure = await browser.newContext(),
      failed = await failure.newPage();
    let block = true;
    await failed.route('**/startup.js', (route) => (block ? route.abort() : route.continue()));
    await failed.goto(origin + '/#unitconvert?task=native%3Aunits-thermal');
    await failed.waitForSelector('#app-startup[data-state=error]');
    assert(await failed.locator('#startup-retry').isVisible());
    block = false;
    await failed.locator('#startup-retry').click();
    await ready(failed);
    assert.match(await failed.title(), /^热学与能量单位/);
    await failure.close();
    checks.push('入口脚本下载失败有明确反馈，重试保留原工具深链接');
  }
  assert.deepEqual(errors, []);
  await writeFile(
    output + '/checks-' + (process.env.REPAIR_CASE || 'all').replaceAll(',', '-') + '.json',
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log(JSON.stringify({ checks, errors }, null, 2));
} finally {
  await browser.close();
  await closeDevServer(server);
}
