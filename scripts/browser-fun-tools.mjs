import assert from 'node:assert/strict';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseNativeTask } from './browser-navigation.mjs';
const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 950 },
    reducedMotion: 'reduce',
  });
  const errors = [];
  page.on('pageerror', (e) => {
    errors.push(e.message);
    console.error('PAGE', e.message);
  });
  await page.goto(site.base);
  await page.waitForFunction(
    () => ['ready', 'error'].includes(document.documentElement.dataset.startupState),
    null,
    { timeout: 60000 },
  );
  await page.evaluate(() => import('./app.js'));
  const ids = [
    'pic-scramble',
    'visual-crypto',
    'text-steganography',
    'beast-codec',
    'buddha-codec',
    'spectral-images',
    'file-image',
    'screen-drop',
  ];
  for (const id of ids) {
    await chooseNativeTask(page, 'native:' + id);
    await page.locator('#panel-' + id).waitFor({ state: 'visible' });
    console.log('页面', id);
  }
  const results = await page.evaluate(async () => {
    const { createJob } = await import('./fun-tools/client.js');
    const job = createJob();
    const image = {
      width: 3,
      height: 2,
      data: new Uint8ClampedArray(
        Array.from({ length: 24 }, (_, i) => (i % 4 === 3 ? 255 : i * 9)),
      ),
    };
    const shuffled = await job.run({ kind: 'scramble', image });
    const restored = await job.run({ kind: 'scramble', image: shuffled, reverse: true });
    if (String(restored.data) !== String(image.data)) throw Error('像素往返失败');
    const opts = { direction: 'encode', alphabet: '嗷呜啊~', framed: true };
    const beast = await job.run({
      kind: 'text',
      task: 'beast-codec',
      text: '迷雾😀\nA',
      options: opts,
    });
    const plain = await job.run({
      kind: 'text',
      task: 'beast-codec',
      text: beast,
      options: { ...opts, direction: 'decode' },
    });
    if (plain !== '迷雾😀\nA') throw Error('兽音往返失败');
    const buddha = await job.run({
      kind: 'text',
      task: 'buddha-codec',
      text: '迷雾😀\nA',
      options: { direction: 'encode', password: '秘密' },
    });
    const bp = await job.run({
      kind: 'text',
      task: 'buddha-codec',
      text: buddha,
      options: { direction: 'decode', password: '秘密' },
    });
    if (bp !== plain) throw Error('佛语往返失败');
    for (const engine of ['watermark', 'stegcloak']) {
      const options = {
        engine,
        direction: 'encode',
        secret: '秘密😀',
        password: '密码',
        encrypt: true,
        integrity: true,
        position: 'end',
      };
      const encoded = await job.run({
        kind: 'text',
        task: 'text-steganography',
        text: '迷雾 工具箱',
        options,
      });
      const decoded = await job.run({
        kind: 'text',
        task: 'text-steganography',
        text: encoded,
        options: { ...options, direction: 'decode' },
      });
      if (decoded !== '秘密😀') throw Error(engine + ' 往返失败');
    }
    const packed = await job.run({ kind: 'pack', bytes: new Uint8Array([65, 0, 255, 0]) });
    const unpacked = await job.run({ kind: 'unpack', image: packed });
    if (String(unpacked) !== '65,0,255,0') throw Error('文件图片往返失败');
    const transfer = await job.run({
      kind: 'transfer',
      bytes: new Uint8Array([65, 0, 255, 0]),
      name: '中文.bin',
      capacity: 128,
    });
    const qr = await job.run({ kind: 'qr', packet: transfer.chunks[0] });
    const packet = await job.run({ kind: 'scan', image: qr });
    const { receiver } = await import('./fun-tools/screen-model.js');
    const r = receiver();
    r.add(packet);
    const received = await r.finish();
    if (String(received.fileData) !== '65,0,255,0') throw Error('二维码图像往返失败');
    const trace = await job.run({
      kind: 'trace',
      image,
      options: {
        duration: 1,
        minFreq: 50,
        maxFreq: 4000,
        sampleRate: 22050,
        frequencyScale: 'linear',
        brightnessCurve: 'linear',
        smoothing: 15,
        invertImage: false,
      },
    });
    if (trace.pcm.length !== 22050 || !trace.wav.size) throw Error('声音合成失败');
    const spectrum = createJob(
      new URL('./vendor/fun-tools/spectrum-worker.js', location.href),
      'module',
    );
    const pcm = Float32Array.from(
      { length: 8000 },
      (_, i) => Math.sin((2 * Math.PI * 440 * i) / 8000) * 0.5,
    );
    const spec = await spectrum.run({
      action: 'encode',
      pcm,
      sr: 8000,
      name: 'tone.wav',
      options: {
        mode: 'exact',
        sr: 8000,
        bits: 8,
        fineness: 2,
        fmax: 0,
        start: 0,
        end: 0,
        fine: false,
      },
    });
    if (!spec.png.size || !spec.wav.size || spec.pcm.length !== 8000)
      throw Error('Spectrum 编码失败');
    const back = await spectrum.run({
      action: 'decode',
      file: spec.png,
      name: spec.name,
      options: { sr: 0, fine: false },
    });
    if (back.pcm.length !== 8000) throw Error('Spectrum 解码失败');
    return { beast, buddha, packet: !!packet, spectrum: spec.name };
  });
  console.log('引擎往返', results);
  const fixture = await page.evaluate(async () => {
    const { png } = await import('./fun-tools/common.js');
    const image = {
      width: 4,
      height: 4,
      data: new Uint8ClampedArray(
        Array.from({ length: 64 }, (_, i) => (i % 4 === 3 ? 255 : i < 32 ? 0 : 255)),
      ),
    };
    const bytes = Array.from(new Uint8Array(await (await png(image)).arrayBuffer()));
    const { wavEncode } = await import('./media.js');
    return {
      png: bytes,
      wav: Array.from(
        new Uint8Array(
          wavEncode(
            [
              Float32Array.from(
                { length: 8000 },
                (_, i) => 0.4 * Math.sin((i * Math.PI * 2 * 440) / 8000),
              ),
            ],
            8000,
          ),
        ),
      ),
    };
  });
  const imageFile = {
    name: 'fixture.png',
    mimeType: 'image/png',
    buffer: Buffer.from(fixture.png),
  };
  async function open(id) {
    await chooseNativeTask(page, 'native:' + id);
    return page.locator('#panel-' + id);
  }
  async function choose(p, label, value) {
    const text = await p.evaluate(
      (p, { label, value }) => {
        const s = [...p.querySelectorAll('select')].find(
          (s) =>
            s.closest('[data-ui=field]')?.querySelector('[data-ui=field-label]')?.textContent ===
            label,
        );
        if (!s) throw Error('Missing select ' + label);
        return [...s.options].find((o) => o.value === value)?.text;
      },
      { label, value },
    );
    await p.getByRole('combobox', { name: label, exact: true }).click();
    await page.getByRole('option', { name: text, exact: true }).click();
  }
  async function run(id) {
    await page.locator('#' + id + '-run').click();
    await page.waitForFunction(
      (id) => {
        const p = document.querySelector('#' + id + '-status');
        return /处理完成|失败|错误|无效|超过|不能为空/.test(p.textContent);
      },
      id,
      { timeout: 60000 },
    );
    assert.equal(await page.locator('#' + id + '-status').textContent(), '处理完成');
  }
  for (const id of ['beast-codec', 'buddha-codec']) {
    const p = await open(id);
    await p.locator('#' + id + '-input').fill('迷雾😀');
    await run(id);
    const encoded = await p.locator('#' + id + '-output').inputValue();
    await choose(p, '方向', 'decode');
    assert.equal(await p.locator('#' + id + '-input').inputValue(), '');
    await p.locator('#' + id + '-input').fill(encoded);
    await run(id);
    assert.equal(await p.locator('#' + id + '-output').inputValue(), '迷雾😀');
    await choose(p, '方向', 'encode');
    assert.equal(await p.locator('#' + id + '-input').inputValue(), '迷雾😀');
  }
  {
    const p = await open('text-steganography');
    await p.locator('#text-steganography-input').fill('cover text');
    await p.getByLabel('需要隐藏的内容').fill('中文秘密');
    await run('text-steganography');
    const value = await p.locator('#text-steganography-output').inputValue();
    await choose(p, '方向', 'decode');
    await p.locator('#text-steganography-input').fill(value);
    await run('text-steganography');
    assert.equal(await p.locator('#text-steganography-output').inputValue(), '中文秘密');
  }
  for (const id of ['pic-scramble', 'visual-crypto', 'file-image']) {
    const p = await open(id);
    await p.locator('input[type=file]').first().setInputFiles(imageFile);
    await run(id);
    assert.ok(await p.locator('canvas').count());
    const download = page.waitForEvent('download');
    await p
      .getByRole('button', {
        name: id === 'visual-crypto' ? '下载透明分片 A' : '下载 PNG',
        exact: true,
      })
      .click();
    assert.ok((await download).suggestedFilename().endsWith('.png'));
    await p.locator('input[type=file]').first().setInputFiles(imageFile);
    assert.equal(await p.locator('canvas').count(), 0);
  }
  {
    const p = await open('spectral-images');
    await p.getByRole('button', { name: '载入 Spectrum 示例音频', exact: true }).click();
    await page.waitForFunction(
      () =>
        document.querySelector('#spectral-images-status').textContent ===
        '示例音频已载入，点击开始处理。',
    );
    assert.match(await p.innerText(), /spectrum-demo.ogg/);
    await p.getByRole('button', { name: '清空当前文件', exact: true }).click();
    assert.match(await p.innerText(), /尚未选择文件/);
    await choose(p, '转换方式', 'trace');
    await p.locator('input[type=file]').setInputFiles(imageFile);
    await p.getByLabel('裁剪图片预览', { exact: true }).waitFor();
    await choose(p, '裁剪比例', '1:1');
    assert.equal(
      await p.getByLabel('裁剪宽度（像素）', { exact: true }).inputValue(),
      await p.getByLabel('裁剪高度（像素）', { exact: true }).inputValue(),
    );
    await p.getByRole('button', { name: '放大预览', exact: true }).click();
    assert.equal(await p.getByLabel('预览缩放（%）', { exact: true }).inputValue(), '110');
    await p.getByRole('button', { name: '恢复完整图片', exact: true }).click();
    const preview = await p.getByLabel('裁剪图片预览', { exact: true }).boundingBox();
    // Drag a corner inward, then move the selected rectangle.
    await page.mouse.move(preview.x + preview.width - 1, preview.y + preview.height - 1);
    await page.mouse.down();
    await page.mouse.move(preview.x + preview.width * 0.6, preview.y + preview.height * 0.6, {
      steps: 4,
    });
    await page.mouse.up();
    await p.getByLabel('裁剪左侧（像素）', { exact: true }).fill('0');
    await p.getByLabel('裁剪顶部（像素）', { exact: true }).fill('0');
    await p.getByLabel('裁剪宽度（像素）', { exact: true }).fill('1');
    await p.getByLabel('裁剪高度（像素）', { exact: true }).fill('1');
    await choose(p, 'SpectroTrace 参数', 'advanced');
    await p.getByLabel('时长（秒）', { exact: true }).fill('2');
    await p.getByRole('button', { name: '重置声音参数', exact: true }).click();
    assert.equal(await p.getByLabel('时长（秒）', { exact: true }).inputValue(), '8');
    await p.getByLabel('时长（秒）', { exact: true }).fill('1');
    await run('spectral-images');
    assert.equal(await p.locator('audio').count(), 1);
    await p.getByLabel('裁剪宽度（像素）', { exact: true }).fill('2');
    assert.equal(await p.locator('audio').count(), 0);
    await choose(p, '转换方式', 'encode');
    await p
      .locator('input[type=file]')
      .setInputFiles({ name: 'tone.wav', mimeType: 'audio/wav', buffer: Buffer.from(fixture.wav) });
    await choose(p, 'Spectrum 模式', 'exact');
    await run('spectral-images');
    assert.equal(await p.locator('audio').count(), 1);
    assert.equal(await p.locator('canvas').count(), 4);
    await p.getByRole('button', { name: '分析原图／JPEG／缩小图的恢复质量' }).click();
    await page.waitForFunction(
      () => document.querySelector('#spectral-images-status').textContent === '质量分析完成。',
      null,
      { timeout: 60000 },
    );
    await p.getByRole('button', { name: '精修相位并重新生成' }).click();
    await page.waitForFunction(
      () => document.querySelector('#spectral-images-status').textContent === '处理完成',
    );
    await p.getByRole('button', { name: '分析原图／JPEG／缩小图的恢复质量' }).waitFor();
  }
  {
    const p = await open('screen-drop');
    await p.getByRole('button', { name: '显示接收端二维码', exact: true }).click();
    await p.getByLabel('接收端入口二维码', { exact: true }).waitFor();
    const address = await p.getByLabel('接收端地址', { exact: true }).inputValue();
    const scanned = await p.getByLabel('接收端入口二维码', { exact: true }).evaluate(async (c) => {
      const { createJob } = await import('./fun-tools/client.js');
      return createJob().run({
        kind: 'scan',
        image: {
          width: c.width,
          height: c.height,
          data: c.getContext('2d').getImageData(0, 0, c.width, c.height).data,
        },
      });
    });
    assert.equal(scanned, address);
    const receiving = await browser.newPage();
    await receiving.goto(address);
    await receiving.locator('#panel-screen-drop').waitFor({ state: 'visible', timeout: 60000 });
    await receiving.getByRole('button', { name: '开始接收', exact: true }).waitFor();
    await receiving.close();
    await p.getByRole('button', { name: '使用示例文件', exact: true }).click();
    assert.match(await p.innerText(), /示例文件.txt/);
    await choose(p, '发送内容', 'text');
    await p.getByLabel('发送文字', { exact: true }).fill('跨屏传输😀');
    await run('screen-drop');
    const data = await p.locator('canvas').evaluate((c) => c.toDataURL().split(',')[1]);
    await p.getByRole('button', { name: '开始循环', exact: true }).click();
    await p.getByRole('button', { name: '暂停', exact: true }).click();
    await choose(p, '方向', 'receive');
    await run('screen-drop');
    await p.getByLabel('导入二维码图片', { exact: true }).setInputFiles({
      name: 'frame.png',
      mimeType: 'image/png',
      buffer: Buffer.from(data, 'base64'),
    });
    await p.getByRole('button', { name: '下载完整文件' }).waitFor();
    assert.match(await p.innerText(), /SHA-256 校验通过/);
  }
  console.log('真实表单、草稿、下载、相位精修与二维码导入通过');
  await page.setViewportSize({ width: 320, height: 600 });
  for (const id of ids) {
    const p = await open(id);
    if (id === 'visual-crypto') {
      assert.equal(await p.locator('.tool-provenance').count(), 0);
      await p.locator('[data-ui=reference-list]').waitFor({ state: 'visible' });
    } else await p.locator('.tool-provenance').waitFor({ state: 'visible' });
    const overflow = await p.evaluate((p) =>
      [...p.querySelectorAll('input,select,textarea,button,canvas,audio')]
        .filter(
          (e) => e.getClientRects().length && e.getBoundingClientRect().right > innerWidth + 2,
        )
        .map((e) => e.outerHTML.slice(0, 90)),
    );
    assert.deepEqual(overflow, [], id + ' 手机溢出');
  }
  await page.screenshot({ path: 'outputs/fun-tools/mobile.png', fullPage: true });
  console.log('8 个页面手机布局与来源页脚通过');
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await site.close();
}
