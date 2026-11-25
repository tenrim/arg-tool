import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createForensicsService } from '../services/forensics/index.mjs';
import { imageFormat, surveyPlan } from '../public/forensics/image-plan.js';
import { zstegDisplayText } from '../public/forensics/zsteg-output.js';
import { inspectHideInfo } from '../public/forensics/hideinfo.js';
import { fileToPixels } from '../public/fun-tools/image-engine.js';
import { localImagePlan } from '../public/forensics/local-image-plan.js';
import { runLocalImageCheck, FRAME_EXPORT_LIMIT } from '../public/forensics/local-image-checks.js';
import { png, chunk } from './fixtures/animation.mjs';

test('两种深度共用本地计划，只有 GIF 或 acTL 结构触发动图检查', () => {
  const ordinary = png(),
    animated = png({ frames: [{}] });
  const misleading = Buffer.concat([
    ordinary.subarray(0, 33),
    chunk('tEXt', Buffer.from('key\0acTL')),
    ordinary.subarray(33),
  ]);
  const engines = (type, data) => localImagePlan(type, data).map((step) => step.engine);
  for (const sample of [ordinary, misleading, animated.subarray(0, 44)])
    assert.deepEqual(engines('png', sample), ['barcode', 'hideinfo']);
  assert.deepEqual(engines('png', animated), ['barcode', 'animation', 'hideinfo']);
  assert.deepEqual(engines('gif'), ['barcode', 'animation']);
  assert.deepEqual(engines('bmp'), ['barcode', 'hideinfo']);
  for (const type of ['jpeg', 'webp', 'tiff']) assert.deepEqual(engines(type), ['barcode']);
});

test('HideInfo 原引擎往返及四道结构检查，包括恰好占满和最后一个填充字节', () => {
  for (const length of [1, 8, 9, 23, 24, 255, 256]) {
    const bytes = Uint8Array.from({ length }, (_, i) => (i * 7 + 42) % 256);
    assert.deepEqual(inspectHideInfo(fileToPixels(bytes)), bytes);
  }
  const original = () => fileToPixels(Uint8Array.of(1, 2, 3));
  for (const mutate of [
    (image) => image.height--,
    (image) => (image.data[image.data.length - 1] = 254),
    (image) => (image.data[4] = 0),
    (image) => (image.data[0] = 255),
    (image) => (image.data[image.data.length - 2] = 1),
  ]) {
    const sample = original();
    mutate(sample);
    assert.equal(inspectHideInfo(sample), null);
  }
  const enlarged = fileToPixels(new Uint8Array(9));
  enlarged.data[4] = 1;
  assert.equal(inspectHideInfo(enlarged), null);
});

test('zsteg 的终端回车逐项换行，保留未命中的组合和载荷内的字面转义', () => {
  const records = [
    '\rb1,r,lsb,xy  .. file: PNG image data',
    '\rb1,r,msb,xy  .. \rb1,g,lsb,xy  .. text: "A\\rB"',
    '\r       \r',
  ];
  const display =
    'b1,r,lsb,xy  .. file: PNG image data\nb1,r,msb,xy  .. \nb1,g,lsb,xy  .. text: "A\\rB"';
  assert.equal(zstegDisplayText(records), display);
  assert.equal(zstegDisplayText(records.join('\n')), display);
  assert.equal(zstegDisplayText('a\r\nb\nc'), 'a\nb\nc');
});

test('帧导出可恰好达到汇总上限，超限仍保留全部延迟及已导出的帧', async (t) => {
  const calls = [];
  let terminated = false;
  class FrameBudgetWorker {
    postMessage({ id, op, index }) {
      calls.push(op);
      const result =
        op === 'decode'
          ? { width: 2, height: 2, frames: [{ delayMs: 10 }, { delayMs: 20 }, { delayMs: 10 }] }
          : { png: { byteLength: index === 0 ? FRAME_EXPORT_LIMIT : 1 } };
      queueMicrotask(() => this.onmessage({ data: { id, result } }));
    }
    terminate() {
      terminated = true;
    }
  }
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'Worker');
  Object.defineProperty(globalThis, 'Worker', { value: FrameBudgetWorker, configurable: true });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'Worker', previous);
    else delete globalThis.Worker;
  });
  const { report, items } = await runLocalImageCheck(
    { engine: 'animation' },
    null,
    new ArrayBuffer(0),
    new AbortController().signal,
  );
  assert.deepEqual(calls, ['decode', 'frame', 'frame']);
  assert.equal(terminated, true);
  assert.equal(report['每帧延迟（毫秒）'], '10、20、10');
  assert.equal(report['延迟分布'], '10 ms × 2，20 ms × 1');
  assert.equal(items.length, 1);
  assert.match(report.note, /上限/);
});

async function requestSurvey(bytes, execute, options = {}) {
  const service = createForensicsService({ env: { FORENSICS_ENABLED: '1' }, execute });
  const server = createServer(service.handle);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    const response = await fetch(base, {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engine: 'image-survey',
        filename: 'wrong.png',
        password: 'sample',
        options,
        data: bytes.toString('base64'),
      }),
    });
    if (!response.ok) return { status: response.status, error: (await response.json()).error };
    const events = (await response.text())
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    return { status: response.status, events };
  } finally {
    service.close();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

test('六种图片文件头，拒绝按扩展名猜测', () => {
  for (const [type, bytes] of Object.entries({
    png: Buffer.from('89504e470d0a1a0a', 'hex'),
    jpeg: Buffer.from('ffd8ff', 'hex'),
    bmp: Buffer.from('BM'),
    gif: Buffer.from('GIF89a'),
    webp: Buffer.from('RIFF1234WEBP'),
    tiff: Buffer.from('4d4d002a', 'hex'),
  }))
    assert.equal(imageFormat(bytes), type);
  assert.throws(() => imageFormat(Buffer.from('RIFF1234WAVE')));
  const png = Buffer.alloc(30);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(png);
  for (const [colour, expected] of [
    [3, 'colormap'],
    [6, 'brute'],
  ]) {
    png[25] = colour;
    const modes = surveyPlan(png, 'deep').steps.map((s) => s.options?.mode);
    assert.ok(modes.includes(expected));
    assert.ok(!modes.includes(expected === 'brute' ? 'colormap' : 'brute'));
    assert.ok(!surveyPlan(png, 'standard').steps.some((step) => step.deep));
  }
});

test('深入 JPEG 按内容分派、密码只传给适用引擎、单项失败后继续', async () => {
  const calls = [];
  const { events } = await requestSurvey(
    Buffer.from('ffd8ff', 'hex'),
    async (job) => {
      calls.push(job);
      if (job.engine === 'identify') throw Error('图片无法解码');
      return { engine: job.engine, complete: true, result: { status: 'ok' }, files: [] };
    },
    { depth: 'deep' },
  );
  assert.ok(calls.some((j) => j.engine === 'jsteg'));
  assert.ok(calls.some((j) => j.engine === 'outguess' && j.password === 'sample'));
  assert.ok(calls.some((j) => j.engine === 'decomposer' && j.password === ''));
  assert.ok(calls.every((j) => j.filename === 'input.jpeg'));
  assert.ok(
    !calls.some((j) => ['pngcheck', 'pcrt', 'zsteg', 'pdfinfo', 'spectrogram'].includes(j.engine)),
  );
  const end = events.at(-1);
  assert.equal(end.finished, end.total);
  assert.equal(end.successful, end.finished - 1);
  assert.ok(events.some((e) => e.value?.error === '图片无法解码'));
  assert.equal(events[0].format, 'jpeg');
});

test('不支持的输入不会启动容器，环境不可用即停止后续检查', async () => {
  let calls = 0;
  const missing = async () => {
    calls++;
    throw Object.assign(Error('引擎不可用'), { code: 'ENGINE_UNAVAILABLE' });
  };
  assert.equal((await requestSurvey(Buffer.from('%PDF'), missing)).status, 422);
  assert.equal((await requestSurvey(Buffer.from('BM'), missing, { depth: 'unknown' })).status, 422);
  assert.equal(calls, 0);
  const { events } = await requestSurvey(Buffer.from('BM'), missing);
  assert.equal(calls, 1);
  assert.equal(events.at(-1).successful, 0);
  assert.equal(events.at(-1).finished, 1);
  assert.ok(events.at(-1).total > 1);
  assert.equal(events.at(-1).reason, '引擎不可用');
});
