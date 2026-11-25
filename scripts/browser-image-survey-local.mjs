import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { chooseNativeTask } from './browser-navigation.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { fileToPixels } from '../public/fun-tools/image-engine.js';
import { gif, png } from '../tests/fixtures/animation.mjs';
import { unzipSync } from '../public/vendor/round2/fflate.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite();
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  downloadsPath: resolve('.tmp-expansion-tests/image-survey'),
});
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(12000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    // Delay only the selected job so each invalidation runs with a worker in flight.
    const Original = window.Worker;
    window.Worker = class extends Original {
      constructor(url, opts) {
        super(url, opts);
        this.path = new URL(url, location.href).pathname;
      }
      postMessage(data, ...transfer) {
        if (
          window.pauseSurvey &&
          ((this.path.endsWith('/local-image-worker.js') && data.engine === window.pauseSurvey) ||
            (this.path.endsWith('/animation/worker.js') && data.op === window.pauseSurvey))
        ) {
          window.pendingSurvey = {
            terminated: false,
            deliver: () =>
              this.onmessage({
                data: {
                  id: data.id,
                  result: {},
                  report: { status: 'ok', output: '迟到的测试结果' },
                  items: [],
                },
              }),
          };
          this.held = window.pendingSurvey;
          return;
        }
        super.postMessage(data, ...transfer);
      }
      terminate() {
        if (this.held) this.held.terminated = true;
        super.terminate();
      }
    };
  });
  await page.route('**/api/forensics/run', (route) =>
    route.fulfill({ status: 503, json: { error: '隔离测试：服务端暂不可用' } }),
  );
  await page.goto(site.base);
  const panel = page.locator('#panel-forensics-image-survey'),
    picker = panel.locator('input[type=file]').first();
  const target = (id) => chooseNativeTask(page, 'native:' + id);
  const card = (name) => panel.getByRole('region', { name, exact: true });
  const barcode = card('二维码与条形码识别'),
    animation = card('动图拆帧与帧延迟'),
    hiding = card('化物为图隐藏文件');
  const select = async (name, buffer, depth = 'standard') => {
    await target('forensics-image-survey');
    await picker.setInputFiles({
      name,
      buffer,
      mimeType: name.endsWith('gif') ? 'image/gif' : 'image/png',
    });
    await panel.locator('select').selectOption(depth);
  };
  const run = () => panel.getByRole('button', { name: '上传并分析图片' }).click();
  const done = () => panel.getByText(/检查完成 .*隔离测试：服务端暂不可用/).waitFor();
  const report = (c) =>
    c.locator('a[download="report.json"]').evaluate((a) => fetch(a.href).then((r) => r.json()));
  const open = (c) => c.getByRole('button', { name: /进入具体功能/ }).click();
  const zip = async () => {
    const download = page.waitForEvent('download');
    await panel.getByRole('button', { name: '打包下载已返回结果' }).click();
    return unzipSync(new Uint8Array(await readFile(await (await download).path())));
  };
  const record = async () => {
    await panel.locator('#forensics-image-survey-record-notebook').click();
    return page.evaluate(async () => {
      const { text, files } = window.surveyTicket.read();
      return {
        text,
        files: await Promise.all(
          files.map(async (f) => ({
            name: f.name,
            bytes: Array.from(new Uint8Array(await f.arrayBuffer())),
          })),
        ),
      };
    });
  };
  await target('forensics-image-survey');
  await page.evaluate(async () => {
    const { connectNotebook } = await import('/handoff/button.js');
    connectNotebook((request) => {
      window.surveyTicket = request;
    });
  });
  await page.addScriptTag({ url: site.base + '/vendor/fun-tools/qrcode.js' });
  const message = 'MIST 原文\n代码 0042';
  for (const inverted of [false, true]) {
    const qr = await page.evaluate(
      async ({ message, inverted }) => {
        return (
          await window.QRCode.toDataURL(
            message,
            inverted ? { color: { dark: '#ffffff', light: '#000000' } } : {},
          )
        ).split(',')[1];
      },
      { message, inverted },
    );
    await select('clue.png', Buffer.from(qr, 'base64'), inverted ? 'deep' : 'standard');
    await run();
    await done();
    assert.match(await barcode.innerText(), /MIST 原文\n代码 0042/);
    const { symbols } = await report(barcode);
    assert.equal(symbols.length, 1);
    assert.match(symbols[0].format, /QR/i);
    assert.equal(symbols[0].text, message);
    assert.equal((await report(hiding)).output, '未检测到 HideInfo 结构。');
    assert.match((await record()).text, /MIST 原文/);
    const entries = await zip();
    const entry = Object.keys(entries).find((name) => name.endsWith('-barcode/report.json'));
    assert.deepEqual(JSON.parse(new TextDecoder().decode(entries[entry])).symbols, symbols);
  }
  await open(barcode);
  await page.locator('#barcode-read').waitFor();
  await page.waitForFunction(() =>
    document.querySelector('#image-info')?.textContent.includes('clue.png'),
  );
  assert.equal(await page.evaluate(() => surveyTicket.isCurrent()), false);

  const linear = await page.evaluate(async () => {
    const { prepareZXingModule, writeBarcode } = await import('/vendor/hunt/zxing/index.js');
    prepareZXingModule({
      overrides: {
        locateFile: (path) => new URL('/vendor/hunt/zxing/' + path, location.href).href,
      },
    });
    const { image, error } = await writeBarcode('MIST-128', { format: 'Code128', scale: 3 });
    if (!image) throw Error(error);
    return Array.from(new Uint8Array(await image.arrayBuffer()));
  });
  await select('linear.png', Buffer.from(linear));
  await run();
  await done();
  assert.deepEqual((await report(barcode)).symbols, [{ format: 'Code128', text: 'MIST-128' }]);

  const gifs = gif({ frames: [{ delay: 2 }, { delay: 7 }], loops: 2 });
  const apng = png({
    frames: [
      { num: 3, den: 100 },
      { num: 2, den: 10, rows: [0, 0, 0, 255, 255, 0, 0, 255, 255] },
    ],
    plays: 3,
  });
  for (const [name, bytes, delays, loops] of [
    ['delay.gif', gifs, [20, 70], 2],
    ['delay.png', apng, [30, 200], 3],
  ]) {
    await select(name, bytes);
    await run();
    await done();
    const info = await report(animation);
    assert.equal(info['帧数'], 2);
    assert.equal(info['尺寸'], '2 × 1');
    assert.equal(info['循环次数'], loops);
    assert.deepEqual(
      info.metadata.frames.map((f) => f.delayMs),
      delays,
    );
    assert.equal(info['每帧延迟（毫秒）'], delays.join('、'));
    for (const ms of delays) assert.ok(info['延迟分布'].includes(ms + ' ms × 1'));
    assert.equal(await animation.getByRole('img').count(), 2);
    const entries = await zip();
    for (let i = 1; i <= 2; i++) {
      const frame = 'frame-000' + i + '.png',
        path = Object.keys(entries).find((n) => n.endsWith('/files/' + frame));
      const original = await animation
        .getByRole('link', { name: frame })
        .evaluate(async (a) =>
          Array.from(new Uint8Array(await (await fetch(a.href)).arrayBuffer())),
        );
      assert.deepEqual(Array.from(entries[path]), original);
      assert.deepEqual(original.slice(0, 8), [137, 80, 78, 71, 13, 10, 26, 10]);
      const firstPixel = await animation.getByRole('link', { name: frame }).evaluate(async (a) => {
        const bitmap = await createImageBitmap(await (await fetch(a.href)).blob());
        try {
          const ctx = new OffscreenCanvas(2, 1).getContext('2d');
          ctx.drawImage(bitmap, 0, 0);
          return Array.from(ctx.getImageData(0, 0, 1, 1).data);
        } finally {
          bitmap.close();
        }
      });
      assert.deepEqual(firstPixel, i === 1 ? [255, 0, 0, 255] : [0, 0, 255, 255]);
    }
    assert.equal((await record()).files.length, 2);
  }
  await open(animation);
  await page.locator('#animation-analyze').waitFor();
  await page.waitForFunction(
    () => document.getElementById('video-file')?.files?.[0]?.name === 'delay.png',
  );
  await select('single.gif', gif({ count: 1 }));
  await run();
  await done();
  assert.equal((await report(animation)).output, '单帧图像。');
  assert.equal(await animation.getByRole('img').count(), 0);
  const payload = new TextEncoder().encode('化物为图：原始字节');
  const pixels = fileToPixels(payload);
  const rows = [];
  for (let y = 0; y < pixels.height; y++)
    rows.push(0, ...pixels.data.subarray(y * pixels.width * 4, (y + 1) * pixels.width * 4));
  const carrier = png({ ...pixels, rows });
  await select('hidden.png', carrier);
  await run();
  await done();
  assert.equal((await report(hiding))['UTF-8 摘要'], '化物为图：原始字节');
  assert.equal((await report(barcode)).output, '未检测到条码或二维码。');
  const entries = await zip();
  assert.deepEqual(entries[Object.keys(entries).find((n) => n.endsWith('/还原文件.bin'))], payload);
  assert.deepEqual((await record()).files[0].bytes, Array.from(payload));
  await open(hiding);
  await page.locator('#file-image-run').click();
  await page.getByText('已恢复 ' + payload.length + ' 字节。', { exact: true }).waitFor();

  for (const [action, job] of [
    ['停止', 'decode'],
    ['换图', 'barcode'],
    ['范围', 'hideinfo'],
    ['离页', 'frame'],
  ]) {
    await select('cancel.png', apng);
    await page.evaluate((job) => {
      window.pauseSurvey = job;
      window.pendingSurvey = null;
    }, job);
    await run();
    await page.waitForFunction(() => !!window.pendingSurvey);
    if (action === '停止') await panel.getByRole('button', { name: '停止', exact: true }).click();
    if (action === '换图')
      await picker.setInputFiles({ name: 'new.png', buffer: carrier, mimeType: 'image/png' });
    if (action === '范围') await panel.locator('select').selectOption('deep');
    if (action === '离页') await target('file-image');
    assert.equal(await page.evaluate(() => window.pendingSurvey.terminated), true, action);
    const count = await panel.locator('.image-survey-results > *').count();
    assert.equal(count, action === '停止' ? 1 : 0);
    await page.evaluate(() => {
      window.pauseSurvey = null;
      window.pendingSurvey.deliver();
    });
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    assert.equal(await panel.locator('.image-survey-results > *').count(), count);
    assert.equal(await panel.getByText('迟到的测试结果').count(), 0);
  }
  await select('again.png', carrier);
  await run();
  await done();
  assert.equal((await report(hiding))['字节数'], payload.length);
  await page.unroute('**/api/forensics/run');
  const { surveyPlan } = await import('../public/forensics/image-plan.js');
  const plan = surveyPlan(carrier, 'standard');
  const stream = [
    { type: 'plan', format: plan.format, labels: plan.steps.map((s) => s.engine) },
    {
      type: 'result',
      index: 0,
      value: { result: { status: 'ok', output: '服务端已返回' }, files: [] },
    },
    { type: 'end', total: plan.steps.length, finished: 1, reason: '服务端超时' },
  ];
  await page.route('**/api/forensics/run', (route) =>
    route.fulfill({
      contentType: 'application/x-ndjson',
      body: stream.map((e) => JSON.stringify(e)).join('\n') + '\n',
    }),
  );
  await run();
  await panel
    .getByText(
      '检查完成 3 项，未提取或异常 0 项，未执行 ' + (plan.steps.length - 1) + ' 项。服务端超时',
    )
    .waitFor();
  const mixed = Object.keys(await zip());
  for (const item of ['file', 'barcode', 'hideinfo'])
    assert.ok(mixed.some((n) => n.endsWith('-' + item + '/report.json')));
  assert.deepEqual(errors, []);
  console.log(
    '正反色二维码、GIF/APNG 全部帧、HideInfo 正反例、ZIP、笔记、三个入口和四种失效操作通过。',
  );
} finally {
  await browser.close();
  await site.close();
}
