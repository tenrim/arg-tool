import assert from 'node:assert/strict';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';

const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(site.base + '/?layout=chronicle#home');
  await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const index of [0, 3]) {
      const details = page.locator('#home-help details').nth(index);
      await details.scrollIntoViewIfNeeded();
      const measured = await details.evaluate(async (node) => {
        const frames = [];
        const closedHeight = node.getBoundingClientRect().height;
        const duration = Math.max(
          ...getComputedStyle(node, '::details-content')
            .transitionDuration.split(',')
            .map((s) => parseFloat(s) * 1000),
        );
        const sample = () =>
          new Promise((resolve) => {
            const end = performance.now() + duration + 100;
            const tick = () => {
              frames.push({
                height: node.getBoundingClientRect().height,
                content: parseFloat(getComputedStyle(node, '::details-content').blockSize),
              });
              if (performance.now() < end) requestAnimationFrame(tick);
              else resolve();
            };
            requestAnimationFrame(tick);
          });
        node.querySelector('summary').click();
        await sample();
        const openHeight = node.getBoundingClientRect().height;
        node.querySelector('summary').click();
        await sample();
        return { frames, closedHeight, openHeight, endHeight: node.getBoundingClientRect().height };
      });
      assert.ok(measured.openHeight > measured.closedHeight + 20, 'Real content expands');
      assert.ok(
        measured.frames.filter(
          (frame) => frame.content > 1 && frame.height < measured.openHeight - 1,
        ).length >= 3,
        'Opening and closing retain intermediate animation frames',
      );
      // A first/last paragraph margin escaping the animated pseudo-element
      // changes this offset by 8/16px even while the content size is continuous.
      assert.ok(
        measured.frames.every(
          (frame) => Math.abs(frame.height - frame.content - measured.closedHeight) < 1,
        ),
        'Margins must travel with the content throughout the transition',
      );
      assert.ok(
        Math.abs(measured.endHeight - measured.closedHeight) < 1,
        'Closed size restores exactly',
      );
      console.log(`PASS continuous disclosure height at ${width}px, item ${index + 1}`);
    }
  }
  const first = page.locator('#home-help details').first();
  await first.locator('summary').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(90);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(70);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  assert.equal(await first.getAttribute('open'), '');
  assert.equal(await first.locator('p').isVisible(), true);
  assert.equal(await page.evaluate(() => document.activeElement.tagName), 'SUMMARY');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await first.locator('summary').click();
  assert.equal(await first.getAttribute('open'), null);
  await first.locator('summary').click();
  assert.equal(await first.locator('p').isVisible(), true);
  assert.equal(
    await first.evaluate((node) => getComputedStyle(node, '::details-content').transitionDuration),
    '0s',
  );
  assert.deepEqual(errors, []);
  console.log('PASS rapid keyboard reversal, final content, focus and reduced motion');
} finally {
  await browser.close();
  await site.close();
}
