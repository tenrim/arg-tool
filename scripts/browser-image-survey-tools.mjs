import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { chooseNativeTask } from './browser-navigation.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { FORENSICS_TASKS } from '../public/forensics/catalog.js';
import { surveyPlan } from '../public/forensics/image-plan.js';

// Exercise every continuation with deterministic result streams; browser-image-survey
// separately checks the actual container output format, thumbnails and recovered bytes.
const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(6500);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(site.base);
  const title = (step) => step.title || FORENSICS_TASKS.find((t) => t.engine === step.engine).title;
  const png = Buffer.from(
    await page.evaluate(() => document.createElement('canvas').toDataURL().split(',')[1]),
    'base64',
  );
  const inputs = [png, Buffer.from('ffd8ff', 'hex'), Buffer.from('GIF89a')];
  const seen = new Set();
  let posted;
  await page.route('**/api/forensics/run', (route) => {
    const req = route.request().postDataJSON();
    if (req.engine !== 'image-survey') {
      posted = req;
      return route.fulfill({ json: { complete: true, files: [], result: { status: 'ok' } } });
    }
    const { steps, format } = surveyPlan(Buffer.from(req.data, 'base64'), req.options.depth);
    const events = [
      { type: 'plan', format, labels: steps.map(title) },
      ...steps.map((step, index) => ({
        type: 'result',
        index,
        value: {
          engine: step.engine,
          result:
            step.engine === 'identify'
              ? { status: 'error', error: '样图诊断失败' }
              : { status: 'ok', output: '样图检查记录' },
          files:
            step.engine === 'decomposer'
              ? [{ name: 'Red_bit_0.png', data: png.toString('base64') }]
              : [],
        },
      })),
      { type: 'end', finished: steps.length, total: steps.length, successful: steps.length - 1 },
    ];
    return route.fulfill({
      contentType: 'application/x-ndjson',
      body: events.map((e) => JSON.stringify(e)).join('\n') + '\n',
    });
  });
  let requests = 0;
  page.on('request', (req) => {
    if (new URL(req.url()).pathname === '/api/forensics/run') requests++;
  });
  await chooseNativeTask(page, 'native:forensics-image-survey');
  const survey = page.locator('#panel-forensics-image-survey');
  const picker = survey.locator('input[type=file]').first();
  const preview = survey.locator('[data-ui=image-input-preview]').first();
  await picker.setInputFiles({
    name: '原图.bin',
    mimeType: 'application/octet-stream',
    buffer: png,
  });
  await preview.getByRole('img', { name: '所选原图：原图.bin' }).waitFor();
  const originalUrl = await preview.locator('img').getAttribute('src');
  await survey.locator('select').selectOption('deep');
  assert.equal(await preview.locator('img').getAttribute('src'), originalUrl);
  await picker.setInputFiles({
    name: '坏图.png',
    mimeType: 'image/png',
    buffer: png.subarray(0, 16),
  });
  await preview.getByText('这张图片暂时无法预览。').waitFor();
  await picker.setInputFiles([]);
  await preview.waitFor({ state: 'hidden' });
  assert.equal(await preview.locator('img').count(), 0);
  assert.equal(requests, 0);
  for (const buffer of inputs) {
    const { steps, format } = surveyPlan(buffer, 'deep');
    for (const step of steps) {
      const name = title(step);
      if (seen.has(name)) continue;
      seen.add(name);
      await chooseNativeTask(page, 'native:forensics-image-survey');
      const panel = page.locator('#panel-forensics-image-survey');
      const filename = 'sample.' + format;
      await panel
        .locator('input[type=file]')
        .first()
        .setInputFiles({ name: filename, mimeType: 'application/octet-stream', buffer });
      if (format === 'png')
        await panel.getByRole('img', { name: '所选原图：' + filename }).waitFor();
      await panel.locator('select').selectOption('deep');
      await panel.getByRole('button', { name: '上传并分析图片' }).click();
      const card = panel.getByRole('region', { name, exact: true });
      await card
        .getByText(step.engine === 'identify' ? '样图诊断失败' : '样图检查记录', { exact: true })
        .waitFor();
      if (step.engine === 'decomposer') {
        for (const width of [1280, 768, 320]) {
          await page.setViewportSize({ width, height: 800 });
          await card.getByRole('img', { name: '红通道 · 位 0' }).waitFor();
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            'width ' + width,
          );
        }
      }
      posted = undefined;
      await card.getByRole('button', { name: '进入具体功能：' + name }).click();
      if (['decomposer', 'color_remapping'].includes(step.engine)) {
        await page.waitForFunction(
          (id) => document.activeElement?.id === id,
          step.engine === 'decomposer' ? 'image-overview' : 'image-remap',
        );
        assert.match(await page.locator('#image-info').innerText(), /sample.png/);
      } else {
        const target = page.locator('#panel-forensics-' + step.engine);
        await target
          .getByText(filename + '（' + buffer.length + ' 字节）', { exact: true })
          .waitFor();
        if (format === 'png')
          await target.getByRole('img', { name: '所选原图：' + filename }).waitFor();
        assert.equal(posted, undefined);
        await target.getByRole('button', { name: '上传并处理' }).click();
        await target.getByText('处理完成，完整输出与文件已保留。', { exact: true }).waitFor();
        assert.equal(posted.engine, step.engine);
        assert.equal(posted.data, buffer.toString('base64'));
        if (step.engine === 'stegoveritas') assert.equal(posted.options.mode, step.options.mode);
        if (step.engine === 'binwalk') assert.equal(posted.options.mode, 'extract');
        if (step.engine === 'zsteg') assert.equal(posted.options.mode, 'all');
      }
    }
  }
  assert.equal(seen.size, 20);
  assert.deepEqual(errors, []);
  console.log('20 个分项入口、原图交接、深入模式、失败卡片、三个视口通过');
} finally {
  await browser.close();
  await site.close();
}
