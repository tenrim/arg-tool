import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
const site = await startBrowserTestSite(),
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage();
  await page.goto(site.base);
  for (const [engine, path] of [
    ['wav', 'spectrum/source/fixtures/tone.wav'],
    ['mp3', 'spectrum/source/fixtures/tone.mp3'],
    ['flac', 'spectrum/source/fixtures/tone.flac'],
    ['vorbis', 'spectrum/source/fixtures/tone-vorbis.ogg'],
    ['opus', 'spectrum/source/fixtures/tone-opus.ogg'],
    ['amr', 'spectrum/source/fixtures/speech-nb.amr'],
    ['aac', 'audio-decode/source/packages/decode-aac/fixtures/tagged.m4a'],
  ]) {
    const bytes = Array.from(
      await readFile(new URL('../upstream/fun-tools/' + path, import.meta.url)),
    );
    const result = await page.evaluate(
      async ({ bytes, engine }) => {
        const { audioDecoder } = await import('./fun-tools/aac-client.js');
        const data = await audioDecoder(engine)(new Uint8Array(bytes));
        return {
          sr: data.sampleRate,
          length: data.channelData[0]?.length,
          finite: data.channelData.every((c) => c.every(Number.isFinite)),
        };
      },
      { bytes, engine },
    );
    assert.ok(result.sr > 0 && result.length > 0 && result.finite, engine);
    console.log('解码回退', engine, result);
  }
  const stats = await page.evaluate(async () => {
    const { createJob } = await import('./fun-tools/client.js');
    const spectrum = createJob(
        new URL('./vendor/fun-tools/spectrum-worker.js', location.href),
        'module',
      ),
      regular = createJob();
    const pcm = Float32Array.from(
      { length: 4096 },
      (_, i) => 0.5 * Math.sin((2 * Math.PI * 440 * i) / 8000),
    );
    let cases = 0;
    for (const mode of ['compact', 'exact'])
      for (const fineness of [0, 1, 2, 3, 4])
        for (const bits of mode === 'compact' ? [2, 4, 8] : [8]) {
          const r = await spectrum.run({
            action: 'encode',
            pcm,
            sr: 8000,
            options: { mode, sr: 0, bits, fineness, fmax: 0, start: 0, end: 0, fine: false },
          });
          if (
            r.spec.meta.win !== [256, 512, 1024, 2048, 4096][fineness] ||
            r.pcm.length !== pcm.length ||
            !r.pcm.every(Number.isFinite)
          )
            throw Error('Spectrum 参数遗漏');
          const back = await spectrum.run({
            action: 'decode',
            file: r.png,
            name: r.name,
            options: { sr: 0, fine: false },
          });
          if (back.pcm.length !== pcm.length) throw Error('Spectrum PNG 长度不匹配');
          cases++;
        }
    const image = {
      width: 64,
      height: 64,
      data: Uint8ClampedArray.from({ length: 64 * 64 * 4 }, (_, i) =>
        i % 4 === 3 ? 255 : i % 256,
      ),
    };
    const { png } = await import('./fun-tools/common.js');
    const any = await spectrum.run({
      action: 'decode',
      file: await png(image),
      name: 'arbitrary.png',
      options: { sr: 16000, fine: true },
    });
    if (!any.pcm.length || !any.pcm.every(Number.isFinite) || any.sr !== 16000)
      throw Error('任意图片恢复失败');
    const long = Float32Array.from({ length: 48000 }, (_, i) => Math.sin(i * 0.05) * 0.5);
    const trimmed = await spectrum.run({
      action: 'encode',
      pcm: long,
      sr: 48000,
      options: {
        mode: 'exact',
        sr: 8000,
        bits: 8,
        fineness: 1,
        fmax: 2000,
        start: 0.25,
        end: 0.75,
        fine: false,
      },
    });
    if (trimmed.pcm.length !== 4000 || trimmed.sr !== 8000) throw Error('截取与重采样长度错误');
    for (const sampleRate of [22050, 44100, 48000])
      for (const frequencyScale of ['linear', 'logarithmic'])
        for (const brightnessCurve of ['linear', 'exponential', 'logarithmic']) {
          const r = await regular.run({
            kind: 'trace',
            image: { width: 2, height: 2, data: new Uint8ClampedArray(16) },
            options: {
              duration: 1,
              minFreq: 20,
              maxFreq: 4000,
              sampleRate,
              frequencyScale,
              brightnessCurve,
              smoothing: 100,
              invertImage: false,
            },
          });
          if (r.pcm.length !== sampleRate || r.pcm.some((x) => x !== 0))
            throw Error('SpectroTrace 黑图不为静音');
          cases++;
        }
    const running = regular.run({
      kind: 'trace',
      image,
      options: {
        duration: 60,
        minFreq: 50,
        maxFreq: 22000,
        sampleRate: 48000,
        frequencyScale: 'logarithmic',
        brightnessCurve: 'linear',
        smoothing: 0,
        invertImage: true,
      },
    });
    regular.cancel();
    let cancelled = false;
    try {
      await running;
    } catch (e) {
      cancelled = e.name === 'AbortError';
    }
    if (!cancelled) throw Error('取消未拒绝待办任务');
    const fresh = await regular.run({ kind: 'pack', bytes: new Uint8Array([1, 2, 3]) });
    if (!fresh.data.length) throw Error('取消后无法重试');
    return {
      parameterCases: cases,
      arbitrarySamples: any.pcm.length,
      trimmedSamples: trimmed.pcm.length,
      cancelled,
    };
  });
  console.log('高级参数与取消', stats);
  // A synthetic video exercises the actual getUserMedia/play/scan/track-release
  // pipeline without claiming to have tested a physical phone camera.
  await page.evaluate(async () => {
    await import('./app.js');
  });
  const { chooseNativeTask } = await import('./browser-navigation.mjs');
  await chooseNativeTask(page, 'native:screen-drop');
  await page.evaluate(() => {
    const p = document.querySelector('#panel-screen-drop'),
      s = p.querySelector('select');
    s.value = 'receive';
    s.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.locator('#screen-drop-run').click();
  await page.getByRole('button', { name: '打开摄像头', exact: true }).waitFor();
  await page.evaluate(async () => {
    const { createJob } = await import('./fun-tools/client.js'),
      job = createJob();
    const transfer = await job.run({
      kind: 'transfer',
      bytes: new Uint8Array([7, 0, 8]),
      name: 'camera.bin',
      capacity: 128,
    });
    const image = await job.run({ kind: 'qr', packet: transfer.chunks[0] });
    const { canvas } = await import('./fun-tools/common.js');
    const source = canvas(image),
      stream = source.captureStream(10);
    globalThis.__cameraStopped = 0;
    for (const track of stream.getTracks()) {
      const stop = track.stop.bind(track);
      track.stop = () => {
        globalThis.__cameraStopped++;
        stop();
      };
    }
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async () => stream,
    });
  });
  await page.getByRole('button', { name: '打开摄像头', exact: true }).click();
  await page.getByRole('button', { name: '下载完整文件', exact: true }).waitFor({ timeout: 20000 });
  assert.ok(await page.evaluate(() => globalThis.__cameraStopped > 0));
  console.log('合成视频摄像头扫描、完整文件校验与轨道释放通过');
} finally {
  await browser.close();
  await site.close();
}
