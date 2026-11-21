import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createForensicsService } from '../services/forensics/index.mjs';
import { imageFormat, surveyPlan } from '../public/forensics/image-plan.js';
import { zstegDisplayText } from '../public/forensics/zsteg-output.js';

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
