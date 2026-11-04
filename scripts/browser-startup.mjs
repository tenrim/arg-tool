import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { createDevServer, closeDevServer } from './server.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const server = createDevServer({
  env: {},
  feedbackStarter: async () => ({
    state: 'unconfigured',
    url: null,
    code: 'TEST',
    close: async () => {},
  }),
  onlineQueryFactory: () => ({
    handle() {
      return false;
    },
    close() {},
  }),
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = 'http://127.0.0.1:' + server.address().port,
  output = process.env.STARTUP_ARTIFACTS || 'outputs/startup-20261025';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--no-sandbox'],
});
const checks = [],
  errors = [];
const ready = (page) =>
  page.waitForFunction(
    () =>
      document.documentElement.dataset.startupState === 'ready' &&
      !document.getElementById('app-startup'),
  );
async function waitingScreen({ width = 1280, reduced = false, storedReduce = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  if (storedReduce)
    await context.addInitScript(() =>
      localStorage.setItem('arg.ui.preferences.v1', JSON.stringify({ motion: 'reduce' })),
    );
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  let release;
  const gate = new Promise((r) => (release = r));
  await page.route('**/app.js', async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto(origin + '/index.html#home', { waitUntil: 'commit' });
  await page.waitForSelector('#app-startup[data-animate=true]');
  assert.equal(await page.locator('#startup-message').innerText(), '正在准备工具…');
  assert.equal(await page.locator('#main').count(), 0, 'app is still blocked');
  const state = await page.evaluate(() => ({
    animations: document
      .querySelector('#app-startup .startup-symbol')
      .getAnimations({ subtree: true }).length,
    overflow: document.documentElement.scrollWidth > innerWidth,
    paint: performance.getEntriesByType('paint').map((e) => ({ name: e.name, time: e.startTime })),
  }));
  assert(!state.overflow);
  assert.equal(
    state.animations,
    reduced || storedReduce ? 0 : 3,
    'loading respects system and stored motion settings',
  );
  await page.evaluate(() => {
    const startup = document.getElementById('app-startup'),
      symbol = startup.querySelector('.startup-symbol');
    const animations = symbol.getAnimations({ subtree: true });
    const probe = (window.startupMotionProbe = { moves: 0, continuity: null });
    const observer = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.removedNodes)
          if (node === startup && startup.isConnected) probe.moves++;
      if (document.getElementById('main') && startup.isConnected) {
        probe.continuity = animations.every((animation) =>
          symbol.getAnimations({ subtree: true }).includes(animation),
        );
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true });
  });
  await page.screenshot({
    path: output + '/loading-' + width + (reduced || storedReduce ? '-reduced' : '') + '.png',
  });
  release();
  await ready(page);
  await page.waitForSelector('#panel-home:not([hidden])');
  assert.equal(await page.locator('[data-startup-inert]').count(), 0);
  assert.equal(await page.locator('.layout').evaluate((n) => n.inert), false);
  const continuity = await page.evaluate(() => window.startupMotionProbe);
  assert.equal(continuity.moves, 0, 'shell creation never disconnects the playing loader');
  assert.equal(
    continuity.continuity,
    true,
    'loader keeps its original Animation objects and phase',
  );
  if (!reduced && !storedReduce) {
    await page.waitForFunction(() =>
      [...document.querySelectorAll('#panel-home [data-animate-ui=effect]')].some(
        (node) => Number(node.style.opacity) > 0 && Number(node.style.opacity) < 1,
      ),
    );
    assert.equal(
      await page.locator('#panel-home').evaluate((node) => node.style.opacity),
      '',
      'initial entrance animates actual visible surfaces instead of an inert page fallback',
    );
  }
  checks.push({ loaderAnimationContinuity: continuity });
  checks.push({ width, reduced, storedReduce, loadingBeforeApp: true, ...state });
  if (width === 1280 && !reduced && !storedReduce) {
    const preparation = await page.evaluate(async () => {
      const ui = await import('/ui/index.js');
      const frame = () =>
        new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const input = ui.Input({ type: 'checkbox' }),
        field = ui.Field({ label: '按需初始化', control: input });
      const panel = ui.ToolPanel({ hidden: true, children: [field] });
      document.getElementById('main').append(panel);
      await frame();
      const deferred = !input.dataset.animateUi && !field.querySelector('.ui-check-indicator');
      input.checked = true;
      input.indeterminate = true;
      panel.hidden = false;
      await frame();
      const revealed =
        input.dataset.animateUi === 'checkbox' &&
        input.checked &&
        input.indeterminate &&
        !!field.querySelector('.ui-check-indicator svg');
      input.indeterminate = false;
      input.click();
      await frame();
      const toggled = !input.checked && !!field.querySelector('.ui-check-indicator');
      panel.hidden = true;
      input.checked = true;
      panel.hidden = false;
      await frame();
      const retained = input.checked && field.querySelectorAll('.ui-check-indicator').length === 1;
      panel.remove();
      await frame();
      const cleaned = !input.dataset.animateUi && !field.querySelector('.ui-check-indicator');
      const visibilityDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
      let settled = false;
      const pending = ui.prepareInitialPresence().then(() => {
        settled = true;
      });
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
      const backgroundImmediate = settled;
      await pending;
      await ui.prepareInitialPresence();
      if (visibilityDescriptor) Object.defineProperty(document, 'hidden', visibilityDescriptor);
      else delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
      const measured = [];
      for (const region of new Set(
        [...document.querySelectorAll('.workspace-outline button')].map((button) => button._region),
      )) {
        const original = region.getClientRects;
        region.getClientRects = function () {
          measured.push(this);
          return original.call(this);
        };
        region._restoreRects = () => {
          delete region.getClientRects;
          delete region._restoreRects;
        };
      }
      for (let i = 0; i < 2; i++)
        document.dispatchEvent(
          new CustomEvent('arg:panelchange', {
            detail: { name: 'home', group: '', capabilityId: null, topicKind: null },
          }),
        );
      await frame();
      const hiddenMeasurements = measured.filter((region) =>
        region.closest('.panel[hidden]'),
      ).length;
      for (const region of new Set(
        [...document.querySelectorAll('.workspace-outline button')].map((button) => button._region),
      ))
        region._restoreRects();
      return {
        deferred,
        revealed,
        toggled,
        retained,
        cleaned,
        backgroundImmediate,
        hiddenMeasurements,
      };
    });
    for (const key of [
      'deferred',
      'revealed',
      'toggled',
      'retained',
      'cleaned',
      'backgroundImmediate',
    ])
      assert(preparation[key], key + ' visual lifecycle');
    assert.equal(
      preparation.hiddenMeasurements,
      0,
      'outline synchronization never measures hidden workspaces',
    );
    checks.push(preparation);
    await page.goto(origin + '/index.html#classical-nihilist?task=native%3Aclassical-nihilist');
    await ready(page);
    await page.waitForSelector('#panel-classical-nihilist:not([hidden])');
    const input = page.locator('#panel-classical-nihilist textarea').first();
    await input.fill('保留当前输入');
    assert.equal(await input.inputValue(), '保留当前输入');
    checks.push('warm deep link activates real workspace and input is usable');
  }
  await context.close();
}
try {
  await waitingScreen();
  await waitingScreen({ width: 375 });
  await waitingScreen({ reduced: true });
  await waitingScreen({ storedReduce: true });
  const context = await browser.newContext(),
    page = await context.newPage();
  let fail = true;
  await page.route('**/app.js', (route) => (fail ? route.abort('failed') : route.continue()));
  await page.goto(origin + '/index.html#classical-nihilist?task=native%3Aclassical-nihilist', {
    waitUntil: 'commit',
  });
  await page.waitForSelector('#app-startup[data-state=error]');
  assert.match(await page.locator('#startup-message').innerText(), /未能加载/);
  assert(await page.locator('#startup-retry').isVisible());
  assert.equal(await page.locator('#app-startup').getAttribute('aria-busy'), 'false');
  fail = false;
  await page.locator('#startup-retry').click();
  await ready(page);
  await page.waitForSelector('#panel-classical-nihilist:not([hidden])');
  checks.push('failed application import shows error; retry preserves deep link and recovers');
  await context.close();
  const nojs = await browser.newContext({ javaScriptEnabled: false }),
    staticPage = await nojs.newPage();
  await staticPage.goto(origin + '/');
  assert(!(await staticPage.locator('#app-startup').isVisible()));
  assert.match(await staticPage.locator('body').innerText(), /请启用 JavaScript/);
  checks.push('disabled JavaScript shows explanation instead of endless loading');
  await nojs.close();
  assert.deepEqual(errors, []);
  await writeFile(output + '/checks.json', JSON.stringify({ checks, errors }, null, 2));
  console.log(JSON.stringify({ checks, errors }, null, 2));
} finally {
  await browser.close();
  await closeDevServer(server);
}
