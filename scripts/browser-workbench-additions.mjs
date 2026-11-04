import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseNativeTask } from './browser-navigation.mjs';
import { zipSync, unzipSync } from '../public/vendor/round2/fflate.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const file = (name, text) => ({ name, mimeType: 'text/plain', buffer: Buffer.from(text) });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    reducedMotion: 'reduce',
    acceptDownloads: true,
  });
  const page = await context.newPage(),
    errors = [];
  page.on('pageerror', (e) => {
    errors.push(e.message);
    console.error('PAGE', e.message);
  });
  await page.goto(site.base);
  await page
    .waitForFunction(
      () => ['ready', 'error'].includes(document.documentElement.dataset.startupState),
      null,
      { timeout: 60000 },
    )
    .catch(async (e) => {
      console.error((await page.locator('body').innerText()).slice(-2000));
      throw e;
    });
  await page.evaluate(async () => {
    await import('./app.js');
  });
  console.log('启动完成');
  await chooseNativeTask(page, 'native:file-versions');
  const comparison = page.locator('#panel-file-versions');
  await comparison
    .locator('input[type=file]')
    .nth(0)
    .setInputFiles([file('a.txt', 'ABC'), file('old.txt', 'same')]);
  await comparison
    .locator('input[type=file]')
    .nth(2)
    .setInputFiles([file('a.txt', 'ADC'), file('new.txt', 'same')]);
  await page.locator('#file-versions-run').click();
  await page.waitForFunction(() =>
    document.querySelector('#file-versions-status').textContent.includes('比较完成'),
  );
  assert.match(await comparison.innerText(), /疑似改名/);
  assert.match(await comparison.innerText(), /修改 · a.txt/);
  assert.ok(
    await comparison
      .locator('.tool-provenance')
      .innerText()
      .then((t) => t.includes('fflate')),
  );
  const z = (name) => ({
    name: 'set.zip',
    mimeType: 'application/zip',
    buffer: Buffer.from(zipSync({ [name]: new Uint8Array([1, 2, 3]) })),
  });
  await comparison.locator('input[type=file]').nth(0).setInputFiles(z('folder/a'));
  await comparison.locator('input[type=file]').nth(2).setInputFiles(z('folder/b'));
  await page.selectOption('#file-versions-mode-0', 'zip');
  await page.selectOption('#file-versions-mode-1', 'zip');
  await page.locator('#file-versions-run').click();
  await page.waitForFunction(() =>
    document.querySelector('#file-versions-status').textContent.includes('比较完成'),
  );
  assert.match(await comparison.innerText(), /folder\/a → folder\/b/);

  // Same filename stored with legacy GBK and modern UTF-8 must compare as one file.
  const legacy = zipSync({ 'xx.txt': Buffer.from('same bytes') }, { level: 0 });
  const legacyView = new DataView(legacy.buffer, legacy.byteOffset, legacy.byteLength);
  const central = legacyView.getUint32(legacy.length - 6, true);
  legacy.set([0xd6, 0xd0], 30);
  legacy.set([0xd6, 0xd0], central + 46);
  await comparison
    .locator('input[type=file]')
    .nth(0)
    .setInputFiles({ name: 'old.zip', mimeType: 'application/zip', buffer: Buffer.from(legacy) });
  await comparison
    .locator('input[type=file]')
    .nth(2)
    .setInputFiles({
      name: 'new.zip',
      mimeType: 'application/zip',
      buffer: Buffer.from(zipSync({ '中.txt': Buffer.from('same bytes') })),
    });
  await page.selectOption('#file-versions-encoding-0', 'gb18030');
  await page.locator('#file-versions-run').click();
  await page.waitForFunction(() =>
    document.querySelector('#file-versions-status').textContent.includes('比较完成'),
  );
  assert.match(await comparison.innerText(), /相同 · 中.txt/);
  await page.selectOption('#file-versions-encoding-0', 'cp437');
  assert.equal(
    await comparison.getByText('相同 · 中.txt', { exact: true }).count(),
    0,
    'encoding change invalidates the old comparison',
  );

  console.log('比较通过');
  await chooseNativeTask(page, 'native:file-batch');
  const batch = page.locator('#panel-file-batch');
  await batch
    .locator('input[type=file]')
    .first()
    .setInputFiles([file('good.txt', 'Zm9v'), file('bad.txt', '!!!')]);
  await page.selectOption('#file-batch-operation', 'base64-decode');
  await page.locator('#file-batch-run').click();
  await page.waitForFunction(() =>
    document.querySelector('#file-batch-status').textContent.includes('处理结束'),
  );
  assert.match(await batch.innerText(), /成功 1 \/ 2/);
  const output = page.waitForEvent('download');
  await batch.getByRole('button', { name: '打包下载成功结果', exact: true }).click();
  const stream = await (await output).createReadStream(),
    chunks = [];
  for await (const c of stream) chunks.push(c);
  assert.equal(
    new TextDecoder().decode(
      unzipSync(new Uint8Array(Buffer.concat(chunks)))['good.txt.decoded.bin'],
    ),
    'foo',
  );
  await batch.getByRole('button', { name: '重试失败或未完成项', exact: true }).click();
  await page.waitForFunction(() =>
    document.querySelector('#file-batch-status').textContent.includes('处理结束'),
  );
  assert.match(await batch.innerText(), /成功 1 \/ 2/);
  await page.selectOption('#file-batch-operation', 'base64-encode');
  assert.equal(await batch.getByRole('button', { name: '下载', exact: true }).count(), 0);
  const presets = batch.locator('[data-parameter-presets]');
  await presets.locator('summary').click();
  await presets.getByLabel('预设名称', { exact: true }).fill('Base64 编码');
  await presets.getByRole('button', { name: '保存当前参数', exact: true }).click();
  await page.selectOption('#file-batch-operation', 'sha256');
  await presets.getByRole('button', { name: '应用', exact: true }).click();
  assert.equal(await page.inputValue('#file-batch-operation'), 'base64-encode');
  assert.ok(
    await page.evaluate(
      () => !localStorage.getItem('arg.ui.parameter-presets.v1').includes('Zm9v'),
    ),
  );
  await presets.getByLabel('预设名称', { exact: true }).fill('重命名预设');
  await presets.getByRole('button', { name: '重命名所选预设', exact: true }).click();
  assert.match(await presets.innerText(), /重命名预设/);

  // Exercise all image encoders with real pixels in a Worker.
  const image = await page.evaluate(async () => {
    const { transformFile } = await import('./file-workbench/model.js');
    const c = new OffscreenCanvas(4, 2);
    c.getContext('2d').fillRect(0, 0, 4, 2);
    const bytes = new Uint8Array(await (await c.convertToBlob()).arrayBuffer());
    const answers = [];
    for (const op of ['image-png', 'image-jpeg', 'image-webp']) {
      const r = await transformFile(bytes, op, { maxEdge: 2, quality: 0.9 });
      const b = await createImageBitmap(new Blob([r.bytes]));
      answers.push([op, b.width, b.height]);
      b.close();
    }
    return answers;
  });
  assert.deepEqual(
    image.map((x) => x.slice(1)),
    [
      [2, 1],
      [2, 1],
      [2, 1],
    ],
  );
  console.log('批量与预设通过');
  for (const width of [1440, 760, 320]) {
    console.log('侧栏宽度', width);
    await page.setViewportSize({ width, height: 850 });
    const launcher = page.locator('#notebook-launcher');
    await launcher.click();
    await page.waitForFunction(
      () =>
        document.querySelector('.ui-dock')?.hidden === false &&
        document.querySelector('#notebook-editor.vditor'),
    );
    await page.locator('#notebook-title').fill('侧栏笔记 ' + width);
    const editor = page.locator('#notebook-editor [contenteditable=true]:visible').first();
    await editor.fill('侧栏内容 ' + width);
    await page.waitForFunction(() =>
      document.querySelector('#notebook-status').textContent.includes('已保存'),
    );
    assert.equal(new URL(page.url()).hash.includes('file-batch'), true);
    await page.getByRole('button', { name: '关闭笔记本侧栏', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.ui-dock').hidden);
    await launcher.click();
    await page.waitForFunction(() =>
      [...document.querySelectorAll('#notebook-editor [contenteditable=true]')].some(
        (n) => n.offsetParent && n.textContent.includes('侧栏内容'),
      ),
    );
    assert.equal(await page.inputValue('#notebook-title'), '侧栏笔记 ' + width);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
    await page.getByRole('button', { name: '关闭笔记本侧栏', exact: true }).click();
  }
  await page.setViewportSize({ width: 1440, height: 950 });
  await chooseNativeTask(page, 'native:qalculate');
  const stages = await page.evaluate(async () => {
    const { qalculateClient } = await import('./qalculate/client.js');
    const stages = [];
    const client = qalculateClient((t) => stages.push(t));
    try {
      const r = await client.run('calculate', { expressions: ['1+1'] });
      return { stages, result: JSON.stringify(r) };
    } finally {
      client.cancel();
    }
  });
  assert.ok(stages.stages.some((t) => t.includes('加载')));
  assert.ok(stages.stages.some((t) => t === '正在计算…'));
  assert.match(stages.result, /2/);
  const chef = await page.evaluate(async () => {
    const { CyberChefClient } = await import('./cyberchef-client.js');
    const stages = [];
    const client = new CyberChefClient((t) => stages.push(t));
    try {
      const result = await client.bake('abc', [{ op: 'To Base64', args: ['A-Za-z0-9+/='] }]);
      return { stages, text: new TextDecoder().decode(result.bytes) };
    } finally {
      client.close();
    }
  });
  assert.equal(chef.text, 'YWJj');
  assert.ok(chef.stages.some((t) => t.includes('加载')));
  assert.ok(chef.stages.some((t) => t.includes('执行')));
  await chooseNativeTask(page, 'native:file-batch');
  await page.selectOption('#file-batch-operation', 'sha256');
  await page.route('**/file-workbench/worker.js', (route) => route.abort());
  await page.locator('#file-batch-run').click();
  await page.waitForFunction(() =>
    document.querySelector('#file-batch-status').textContent.includes('失败'),
  );
  assert.equal(
    await batch
      .locator('input[type=file]')
      .first()
      .evaluate((n) => n.files.length),
    2,
  );
  await page.unroute('**/file-workbench/worker.js');
  await batch.getByRole('button', { name: '重试失败或未完成项', exact: true }).click();
  await page.waitForFunction(() =>
    document.querySelector('#file-batch-status').textContent.includes('成功 2 / 2'),
  );
  let release;
  const held = new Promise((resolve) => (release = resolve));
  await page.route('**/file-workbench/worker.js', async (route) => {
    await held;
    await route.continue().catch(() => {});
  });
  await page.locator('#file-batch-run').click();
  await batch.getByRole('button', { name: '停止', exact: true }).click();
  release();
  await page.unroute('**/file-workbench/worker.js');
  assert.match(await page.locator('#file-batch-status').innerText(), /已停止/);
  assert.equal(await batch.getByRole('button', { name: '下载', exact: true }).count(), 0);
  await page.locator('#notebook-launcher').click();
  await page.getByRole('button', { name: '打开完整笔记本页面', exact: true }).click();
  await page.waitForFunction(() => location.hash === '#notebook');
  assert.equal(await page.locator('#notebook-editor').count(), 1);
  assert.equal(await page.locator('#notebook-title').inputValue(), '侧栏笔记 320');
  assert.deepEqual(errors, []);
  console.log(
    'PASS 文件版本/ZIP、批量成功失败重试打包、参数预设、三种图片格式、桌面与 760/320px 笔记直接编辑保存、计算引擎阶段反馈。',
  );
  await context.close();
} finally {
  await browser.close();
  await site.close();
}
