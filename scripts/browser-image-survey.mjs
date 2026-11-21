import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { chooseNativeTask } from './browser-navigation.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite({ env: { ...process.env, FORENSICS_ENABLED: '1' } });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(site.base);
  await chooseNativeTask(page, 'native:forensics-image-survey');
  const panel = page.locator('#panel-forensics-image-survey');
  const data = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 16;
    c.getContext('2d').fillRect(0, 0, 8, 8);
    return c.toDataURL().split(',')[1];
  });
  const clue = 'MIST_IMAGE_SURVEY_PROOF';
  const buffer = Buffer.concat([Buffer.from(data, 'base64'), Buffer.from(clue)]);
  await panel
    .locator('input[type=file]')
    .first()
    .setInputFiles({ name: 'fixture.jpg', mimeType: 'image/jpeg', buffer });
  await panel.locator('select').selectOption('deep');
  await panel.getByRole('button', { name: '上传并分析图片' }).click();
  await panel.getByText(/^PNG · \d+ 项检查$/).waitFor();
  await panel.getByText(/^检查完成 \d+ 项，未提取或异常/).waitFor({ timeout: 255000 });
  for (const [title, count] of [
    ['通道与位平面', 40],
    ['八组颜色重映射', 8],
    ['StegoVeritas 图像增强', 21],
  ]) {
    const detail = panel.getByRole('region', { name: title, exact: true });
    await detail.getByText('检查完成', { exact: true }).waitFor();
    await detail.locator('img').first().waitFor();
    assert.equal(await detail.locator('img').count(), count);
  }
  const tail = panel.getByRole('region', { name: '图片尾随数据', exact: true });
  const artifact = tail.getByRole('link', { name: /trailing.*\.bin/i }).first();
  assert.equal(await artifact.evaluate(async (a) => (await fetch(a.href)).text()), clue);
  assert.equal(await panel.getByRole('region', { name: 'JSteg 隐写提取', exact: true }).count(), 0);
  const download = page.waitForEvent('download');
  await panel.getByRole('button', { name: '打包下载已返回结果' }).click();
  assert.equal((await download).suggestedFilename(), '图片隐写分析.zip');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await tail.getByRole('button', { name: '进入具体功能：图片尾随数据' }).click();
  const target = page.locator('#panel-forensics-stegoveritas');
  await target.getByText('fixture.jpg', { exact: false }).waitFor();
  assert.equal(await target.locator('select').first().inputValue(), 'trailing');
  assert.deepEqual(errors, []);
  console.log(
    '真实隔离分析通过：错扩展名 PNG、40 个位平面、8 个重映射、21 个增强视图、原始尾部载荷、ZIP 和手机宽度。',
  );
} finally {
  await browser.close();
  await site.close();
}
