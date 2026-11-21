import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseNativeTask } from './browser-navigation.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(site.base);
  await chooseNativeTask(page, 'native:forensics-stegoveritas');
  const panel = page.locator('#panel-forensics-stegoveritas');
  const mode = panel.locator('select').first();
  assert.equal(await mode.inputValue(), 'transform');
  await chooseNativeTask(page, 'native:forensics-stegoveritas', 'trailing');
  assert.equal(
    await mode.inputValue(),
    'trailing',
    'deep link selects the actual requested operation',
  );
  for (const value of ['colormap', 'extract', 'brute', 'trailing', 'hide', 'transform']) {
    await mode.selectOption(value);
    assert.equal(
      await panel.getByText('通道顺序（如 RGB、BGR、RGBA）', { exact: true }).isVisible(),
      value === 'hide',
    );
    assert.equal(
      await panel.getByText('共同保留区间起点（可留空）', { exact: true }).isVisible(),
      value === 'colormap',
    );
    await page.setViewportSize({ width: 320, height: 640 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      value + ' mobile overflow',
    );
    await page.setViewportSize({ width: 1280, height: 900 });
  }
  await panel.locator('.tool-provenance summary').first().click();
  await panel
    .locator('.tool-provenance')
    .getByText('StegoVeritas', { exact: true })
    .first()
    .waitFor();
  for (const url of await panel
    .locator('.tool-provenance a[data-project-notice]')
    .evaluateAll((nodes) => nodes.map((n) => n.href)))
    assert.ok((await page.request.get(url)).ok(), url);
  // Test the real form's serialization without sending user's files remotely.
  let received;
  await page.route('**/api/forensics/run', async (route) => {
    received = route.request().postDataJSON();
    await route.fulfill({
      json: {
        complete: true,
        result: { status: 'ok' },
        files: [{ name: 'proof.bin', data: '/wA=' }],
      },
    });
  });
  await mode.selectOption('hide');
  await panel
    .locator('input[type=file]')
    .nth(0)
    .setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: Buffer.from('fixture') });
  await panel
    .locator('input[type=file]')
    .nth(1)
    .setInputFiles({
      name: 'payload.bin',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from([255, 0]),
    });
  await panel.getByRole('button', { name: '上传并处理', exact: true }).click();
  await panel.getByText('处理完成，完整输出与文件已保留。', { exact: true }).waitFor();
  assert.equal(received.attachment.data, '/wA=');
  assert.equal(received.options.mode, 'hide');
  assert.ok(!Object.hasOwn(received.options, 'red'));
  await mode.selectOption('trailing');
  assert.equal(
    await panel.getByRole('link', { name: /proof.bin/ }).count(),
    0,
    'input change clears stale result',
  );
  await panel.getByRole('button', { name: '上传并处理', exact: true }).click();
  await panel.getByText('处理完成，完整输出与文件已保留。', { exact: true }).waitFor();
  assert.ok(!received.attachment, 'hidden payload must not be uploaded');
  for (const [label, id] of [
    ['GIF／APNG 完整拆帧', 'native:video-animation'],
    ['图片隐写、位平面与通道', 'native:image-steg'],
  ]) {
    await panel.getByRole('link', { name: label, exact: true }).click();
    assert.ok((await page.url()).includes(encodeURIComponent(id)), id);
    await chooseNativeTask(page, 'native:forensics-stegoveritas');
  }
  await chooseNativeTask(page, 'native:forensics-steghide');
  assert.ok(
    await page
      .locator('#panel-forensics-steghide')
      .getByText('密码列表（可选，UTF-8 文本，每行一个）', { exact: true })
      .isVisible(),
  );
  assert.deepEqual(errors, []);
  console.log(
    'StegoVeritas 六种操作、条件表单、附件序列化、结果失效、复用入口、来源许可及 320px 布局通过。',
  );
} finally {
  await browser.close();
  await site.close();
}
