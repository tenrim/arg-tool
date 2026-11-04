import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseNativeTask } from './browser-navigation.mjs';
import { unzipSync } from '../public/vendor/round2/fflate.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const { fixtures, payload } = JSON.parse(
  await fs.readFile('outputs/forensics-build/fixtures.json', 'utf8'),
);
const site = await startBrowserTestSite({
  env: { ...process.env, FORENSICS_ENABLED: '1', FORENSICS_TRANSPORT: 'ssh' },
});
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    acceptDownloads: true,
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(site.base);
  await page.waitForFunction(
    () => document.documentElement.dataset.startupState === 'ready',
    null,
    { timeout: 60000 },
  );
  if (!process.argv.includes('--cancel-only')) {
    await chooseNativeTask(page, 'native:forensics-steghide');
    const panel = page.locator('#panel-forensics-steghide');
    const f = fixtures.steghide;
    await panel
      .locator('input[type=file]')
      .setInputFiles({
        name: f.filename,
        mimeType: 'image/jpeg',
        buffer: Buffer.from(f.data, 'base64'),
      });
    await panel.locator('input[type=password]').fill('test');
    const resultResponse = page.waitForResponse((r) => r.url().endsWith('/api/forensics/run'), {
      timeout: 90000,
    });
    await panel.getByRole('button', { name: '上传并处理', exact: true }).click();
    assert.equal((await resultResponse).status(), 200);
    await panel.getByRole('button', { name: '打包下载全部结果', exact: true }).waitFor();
    const download = page.waitForEvent('download');
    await panel.getByRole('button', { name: '打包下载全部结果', exact: true }).click();
    const chunks = [];
    for await (const chunk of await (await download).createReadStream()) chunks.push(chunk);
    const unpacked = unzipSync(Buffer.concat(chunks));
    assert.deepEqual(Buffer.from(unpacked['steghide/payload.bin']), Buffer.from(payload, 'base64'));
    assert.ok(unpacked['logs/01-stdout.bin']);
    await page.screenshot({ path: 'outputs/forensics-build/desktop.png', fullPage: true });
    await panel.locator('input[type=password]').fill('wrong');
    assert.equal(
      await panel.getByRole('button', { name: '打包下载全部结果', exact: true }).count(),
      0,
    );
    const failed = page.waitForResponse((r) => r.url().endsWith('/api/forensics/run'), {
      timeout: 90000,
    });
    await panel.getByRole('button', { name: '上传并处理', exact: true }).click();
    const failure = await (await failed).json();
    assert.equal(failure.result?.status, 'error');
    await chooseNativeTask(page, 'native:forensics-pcrt');
    const png = page.locator('#panel-forensics-pcrt');
    await png
      .locator('input[type=file]')
      .setInputFiles({
        name: 'broken.png',
        mimeType: 'image/png',
        buffer: Buffer.from(fixtures.pcrt.data, 'base64'),
      });
    const repaired = page.waitForResponse((r) => r.url().endsWith('/api/forensics/run'), {
      timeout: 90000,
    });
    await png.getByRole('button', { name: '上传并处理', exact: true }).click();
    assert.equal((await (await repaired).json()).result.status, 'ok');
    await png.locator('img').waitFor();
    await page.setViewportSize({ width: 320, height: 640 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: 'outputs/forensics-build/mobile.png', fullPage: true });
  }
  await chooseNativeTask(page, 'native:forensics-zsteg');
  const z = page.locator('#panel-forensics-zsteg');
  await z
    .locator('input[type=file]')
    .setInputFiles({
      name: 'zsteg.png',
      mimeType: 'image/png',
      buffer: Buffer.from(fixtures.zsteg.data, 'base64'),
    });
  await z.getByRole('combobox', { name: '处理方式', exact: true }).click();
  await page.getByRole('option', { name: '全部检测组合', exact: true }).click();
  const started = page.waitForRequest((r) => r.url().endsWith('/api/forensics/run'));
  await z.getByRole('button', { name: '上传并处理', exact: true }).click();
  await started;
  await z.getByRole('button', { name: '停止', exact: true }).click();
  assert.ok(await z.getByRole('button', { name: '上传并处理', exact: true }).isEnabled());
  assert.equal(await z.locator('a[download]').count(), 0);
  assert.deepEqual(errors, []);
  console.log(
    process.argv.includes('--cancel-only')
      ? '真实请求的停止与结果失效通过'
      : '真实上传、原字节 ZIP 下载、密码错误、结果失效、PNG 图片、320px 和停止通过',
  );
} finally {
  await browser.close();
  await site.close();
}
