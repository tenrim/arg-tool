import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseNativeTask } from './browser-navigation.mjs';
import { FORENSICS_TASKS } from '../public/forensics/catalog.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(site.base);
  await page.waitForFunction(
    () => document.documentElement.dataset.startupState === 'ready',
    null,
    { timeout: 60000 },
  );
  for (const task of FORENSICS_TASKS) {
    await chooseNativeTask(page, 'native:' + task.id);
    const panel = page.locator('#panel-' + task.id);
    await panel.waitFor({ state: 'visible' });
    assert.ok(
      await panel
        .getByRole('button', {
          name: task.engine === 'image-survey' ? '上传并分析图片' : '上传并处理',
          exact: true,
        })
        .isVisible(),
      task.engine,
    );
    const sources = panel.locator('.tool-provenance');
    if (
      !(await sources
        .locator('summary')
        .first()
        .evaluate((summary) => summary.parentElement.open))
    )
      await sources.locator('summary').first().click();
    assert.match(
      await panel.locator('.tool-provenance').innerText(),
      task.engine === 'stegoveritas' ? /StegoVeritas/ : /AperiSolve/,
    );
    await panel
      .locator('.tool-provenance details')
      .evaluateAll((nodes) => nodes.forEach((n) => (n.open = true)));
    await panel.locator('.tool-provenance a[data-project-notice]').first().waitFor();
    const links = await panel
      .locator('.tool-provenance a[data-project-notice]')
      .evaluateAll((nodes) => nodes.map((n) => n.href));
    assert.ok(links.length >= 2, task.engine + ' notices');
    for (const href of links) assert.ok((await page.request.get(href)).ok(), href);
  }
  await chooseNativeTask(page, 'native:forensics-strings');
  const panel = page.locator('#panel-forensics-strings');
  await panel.locator('input[type=file]').setInputFiles({
    name: 'proof.bin',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('proof'),
  });
  await panel.getByRole('button', { name: '上传并处理', exact: true }).click();
  await page.waitForFunction(() =>
    document.querySelector('#panel-forensics-strings').textContent.includes('尚未启用'),
  );
  assert.ok(await panel.getByRole('button', { name: '上传并处理', exact: true }).isEnabled());
  await page.setViewportSize({ width: 320, height: 640 });
  for (const task of FORENSICS_TASKS) {
    await chooseNativeTask(page, 'native:' + task.id);
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      task.id + ' overflow',
    );
  }
  assert.deepEqual(errors, []);
  console.log(FORENSICS_TASKS.length + ' 个入口、成员切换、来源、未配置失败恢复及 320px 布局通过');
} finally {
  await browser.close();
  await site.close();
}
