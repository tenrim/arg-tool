import assert from 'node:assert/strict';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseOperation, chooseNativeTask } from './browser-navigation.mjs';
const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage();
  const workers = [],
    req = [];
  page.on('worker', (w) => workers.push(new URL(w.url()).pathname));
  page.context().on('request', (r) => req.push(new URL(r.url()).pathname));
  await page.goto(site.base + '/#countries');
  await page.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
  for (const [q, answer] of [
    ['中国', 'CNY'],
    ['日本', 'JPY'],
  ]) {
    await page.locator('#countries-query').fill(q);
    await page.locator('#countries-run').click();
    await page.waitForFunction(
      (t) => document.querySelector('#countries-results').textContent.includes(t),
      answer,
    );
  }
  assert.equal(workers.filter((x) => x.endsWith('/reference/worker.js')).length, 1);

  await chooseNativeTask(page, 'native:chemistry-molecule');
  for (const [q, answer] of [
    ['CCO', '46.0'],
    ['C1(', 'error'],
    ['CC', '30.0'],
  ]) {
    await page.locator('#chem-input').fill(q);
    await page.locator('#chemistry-run').click();
    if (answer === 'error')
      await page.waitForFunction(() =>
        document.querySelector('#chemistry-status').textContent.includes('无法解析'),
      );
    else
      await page.waitForFunction(
        (t) => document.querySelector('#chemistry-output').textContent.includes(t),
        answer,
      );
  }
  assert.equal(workers.filter((x) => x.endsWith('/science/worker.js')).length, 1);
  assert.equal(req.filter((x) => x.endsWith('RDKit_minimal.wasm')).length, 1);
  await chooseNativeTask(page, 'native:spectral-images');
  await page.getByLabel('时长（秒）', { exact: true }).filter({ visible: true }).fill('3');
  const panel = page.locator('#panel-spectral-images');
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 8;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 8, 8);
    return canvas.toDataURL().split(',')[1];
  });
  await panel
    .locator('input[type=file]')
    .setInputFiles({ name: 'clue.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await panel.getByLabel('裁剪图片预览', { exact: true }).waitFor();
  await panel.getByRole('button', { name: '开始处理', exact: true }).click();
  await page.waitForFunction(
    () => Math.abs(document.querySelector('#panel-spectral-images audio')?.duration - 3) < 0.01,
  );
  console.log('basic mode produced the selected three-second audio');
  await chooseOperation(page, 'Magic');
  const depth = page
    .locator('.ct-tool:visible .chef-arg')
    .filter({ hasText: /深度|Depth/i })
    .first();
  assert(await depth.isVisible());
  await chooseOperation(page, 'Generate PGP Key Pair');
  await page.locator('.ct-tool:visible').getByText('私钥密码（可选）', { exact: true }).click();
  await page.locator('.ct-tool:visible [data-arg="1"] input').waitFor({ state: 'visible' });
  console.log('Magic depth and PGP passphrase accessible');
  const results = await page.evaluate(async () => {
    const { completionJob } = await import('/completion/job.js');
    const run = (task, input, options) => completionJob({ task, input, options });
    const out = [];
    for (const [task, input, options] of [
      ['nato', 'Alfa Bravo', { direction: 'decode' }],
      ['nato', 'Charlie Delta', { direction: 'decode' }],
      ['braille-languages', 'hello', { table: 'en-us-g1.ctb', direction: 'encode' }],
      ['braille-languages', '⠓⠑⠇⠇⠕', { table: 'en-us-g1.ctb', direction: 'decode' }],
    ])
      out.push((await run(task, input, options)).output);
    return out;
  });
  assert.deepEqual(results, ['AB', 'CD', '⠓⠑⠇⠇⠕', 'hello']);
  assert.equal(workers.filter((x) => x.endsWith('/completion/braille-worker.js')).length, 1);
  console.log('NATO and braille repeated jobs OK');
  const values = await page.evaluate(async () => {
    const { startWorkerJob } = await import('/expansion/session.js');
    const { runClassical } = await import('/expansion/classical-core.js');
    const values = [];
    for (const input of ['HELLO', 'WORLD']) {
      const options = { key: 'LEMON', direction: 'encrypt' };
      const result = await startWorkerJob({
        task: 'classical',
        cipher: 'beaufort',
        input,
        options,
      });
      values.push([result.text, runClassical('beaufort', input, options).text]);
    }
    return values;
  });
  for (const [answer, expected] of values) {
    assert(expected);
    assert.equal(answer, expected);
  }
  assert.equal(workers.filter((x) => x.endsWith('/expansion/worker.js')).length, 1);
  const startOfQR = workers.length;
  const scans = await page.evaluate(async () => {
    const { createJob } = await import('/fun-tools/client.js');
    const job = createJob();
    const results = [];
    for (const packet of ['first packet', 'second packet']) {
      const image = await job.run({ kind: 'qr', packet });
      results.push(await job.run({ kind: 'scan', image }));
    }
    return results;
  });
  assert.deepEqual(scans, ['first packet', 'second packet']);
  assert.equal(
    workers.slice(startOfQR).filter((x) => x.endsWith('/fun-tools/worker.js')).length,
    1,
  );
  console.log('two QR packets rendered and scanned with 1 worker');
} finally {
  await browser.close();
  await site.close();
}
