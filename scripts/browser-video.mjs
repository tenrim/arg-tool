import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseNativeTask } from './browser-navigation.mjs';
const selected = process.argv.find((v) => v.startsWith('--case='))?.slice(7) || 'runtime,ui';
const output = 'outputs/ffmpeg-review';
await mkdir(output, { recursive: true });
await writeFile(output + '/input.srt', '1\n00:00:01,000 --> 00:00:03,000\nPuzzle subtitle\n');
execFileSync('ffmpeg', [
  '-hide_banner',
  '-loglevel',
  'error',
  '-y',
  '-f',
  'lavfi',
  '-i',
  'testsrc2=size=64x48:rate=2:duration=45',
  '-f',
  'lavfi',
  '-i',
  'sine=frequency=440:sample_rate=16000:duration=45',
  '-f',
  'lavfi',
  '-i',
  'sine=frequency=880:sample_rate=16000:duration=45',
  '-i',
  output + '/input.srt',
  '-map',
  '0:v',
  '-map',
  '1:a',
  '-map',
  '2:a',
  '-map',
  '3:s',
  '-c:v',
  'libx264',
  '-preset',
  'ultrafast',
  '-pix_fmt',
  'yuv420p',
  '-c:a',
  'aac',
  '-c:s',
  'srt',
  output + '/long.mkv',
]);
const source = (await readFile(output + '/long.mkv')).toString('base64');
const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const context = await browser.newContext(),
  errors = [],
  outside = [];
await context.route('**/*', (route) => {
  if (
    route
      .request()
      .url()
      .startsWith(site.base + '/__video-test')
  )
    return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Video</title>' });
  if (
    !route
      .request()
      .url()
      .startsWith(site.base + '/')
  ) {
    outside.push(route.request().url());
    return route.abort();
  }
  return route.continue();
});
const page = await context.newPage();
page.on('pageerror', (error) => errors.push(error.message));
const defaults = {
  range: 'full',
  start: 0,
  duration: 2,
  fps: 1,
  width: 0,
  maxFrames: 300,
  audioFormat: 'wav',
  track: '1',
  format: 'mp4',
  keepAudio: true,
  speed: 2,
  rotation: 'right',
  subtitleTrack: 1,
};
async function run(options, input = source) {
  return page.evaluate(
    async ({ source, options }) => {
      const { mediaJob } = await import('/video/runtime.js');
      const job = mediaJob();
      try {
        const result = await job.run(
          [new File([Uint8Array.from(atob(source), (c) => c.charCodeAt(0))], 'long.mkv')],
          options,
        );
        return {
          summary: result.summary,
          files: await Promise.all(
            result.files.map(async (f) => {
              const bytes = new Uint8Array(await f.arrayBuffer());
              let text = '';
              for (let i = 0; i < bytes.length; i += 32768)
                text += String.fromCharCode(...bytes.subarray(i, i + 32768));
              return { name: f.name, data: btoa(text) };
            }),
          ),
        };
      } catch (e) {
        return { error: e.message, logs: e.logs };
      } finally {
        job.cancel();
      }
    },
    { source: input, options: { ...defaults, ...options } },
  );
}
async function probe(file, prefix) {
  const path = output + '/' + prefix + '-' + file.name;
  await writeFile(path, Buffer.from(file.data, 'base64'));
  return JSON.parse(
    execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', path], {
      encoding: 'utf8',
    }),
  );
}
try {
  await page.goto(site.base + '/__video-test');
  if (selected.includes('runtime')) {
    let r = await run({ mode: 'audio', track: 'all' });
    assert(!r.error, JSON.stringify(r));
    assert.equal(r.files.length, 2);
    for (const f of r.files) {
      const m = await probe(f, 'full');
      assert(Number(m.format.duration) > 44.9, 'full audio exceeds old 30s limit');
      assert.equal(m.streams[0].sample_rate, '16000');
    }
    console.log('PASS complete 45-second audio, both tracks and original sampling rate');
    r = await run({ mode: 'audio', range: 'clip', start: 3, duration: 35 });
    assert(!r.error, JSON.stringify(r));
    assert(Math.abs(Number((await probe(r.files[0], 'clip')).format.duration) - 35) < 0.1);
    for (const audioFormat of ['mp3', 'm4a', 'flac', 'mka']) {
      r = await run({ mode: 'audio', range: 'clip', duration: 2, audioFormat });
      assert(!r.error, JSON.stringify(r));
      const m = await probe(r.files[0], audioFormat);
      assert(m.streams.some((s) => s.codec_type === 'audio'));
      if (audioFormat === 'mka') assert.equal(m.streams[0].codec_name, 'aac');
      console.log('PASS audio ' + audioFormat);
    }
    r = await run({ mode: 'frames' });
    assert(!r.error, JSON.stringify(r));
    assert(r.files.length >= 45);
    const frame = await probe(r.files[0], 'frames');
    assert.equal(frame.streams[0].width, 64);
    assert.equal(frame.streams[0].height, 48);
    r = await run({ mode: 'frames', maxFrames: 30 });
    assert.match(r.error, /不会静默截断/);
    r = await run({ mode: 'audio', track: '3' });
    assert.match(r.error, /音轨序号/);
    r = await run({ mode: 'frame', start: 90 });
    assert.match(r.error, /超出媒体时长/);
    console.log('PASS uncropped dimensions, more than 30 frames and explicit invalid-range errors');
    for (const mode of [
      'frame',
      'clip',
      'mute',
      'resize',
      'rotate',
      'speed',
      'reverse',
      'gif',
      'subtitle',
      'inspect',
    ]) {
      r = await run({
        mode,
        range: mode === 'subtitle' ? 'full' : 'clip',
        width: mode === 'resize' ? 32 : 0,
      });
      assert(!r.error, JSON.stringify({ mode, ...r }));
      assert(r.files.length);
      if (mode === 'subtitle')
        assert.match(Buffer.from(r.files[0].data, 'base64').toString(), /Puzzle subtitle/);
      else if (mode === 'inspect')
        assert.equal(
          JSON.parse(Buffer.from(r.files[0].data, 'base64').toString()).streams.length,
          4,
        );
      else {
        const m = await probe(r.files[0], mode);
        if (mode === 'mute') assert(!m.streams.some((s) => s.codec_type === 'audio'));
        if (mode === 'reverse')
          assert.equal(m.streams.filter((s) => s.codec_type === 'audio').length, 2);
        if (mode === 'resize') assert.equal(m.streams[0].width, 32);
        if (mode === 'rotate') assert.equal(m.streams[0].width, 48);
        if (mode === 'speed') assert(Number(m.format.duration) < 1.8);
      }
      console.log('PASS ' + mode);
    }
    for (const format of ['mp4', 'webm', 'mkv', 'mp3', 'wav', 'flac']) {
      r = await run({ mode: 'native', range: 'clip', format });
      assert(!r.error, JSON.stringify(r));
      assert((await probe(r.files[0], 'convert-' + format)).streams.length);
      console.log('PASS conversion ' + format);
    }
  }
  if (selected.includes('edges')) {
    const corrupt = await run({ mode: 'inspect' }, Buffer.from('not media').toString('base64'));
    assert(corrupt.error);
    execFileSync('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      output + '/long.mkv',
      '-map',
      '0:v:0',
      '-c:v',
      'copy',
      '-an',
      output + '/silent.mkv',
    ]);
    const silent = (await readFile(output + '/silent.mkv')).toString('base64');
    const absent = await run({ mode: 'audio' }, silent);
    assert.match(absent.error, /没有音轨/);
    const reverse = await run({ mode: 'reverse', range: 'clip' }, silent);
    assert(!reverse.error, JSON.stringify(reverse));
    const custom = await run({
      mode: 'native',
      custom: true,
      command: JSON.stringify([
        '-i',
        'input',
        '-t',
        '1',
        '-map',
        '0:a:0',
        '-c:a',
        'copy',
        'custom.mka',
      ]),
    });
    assert(!custom.error, JSON.stringify(custom));
    assert.equal(custom.files[0].name, 'custom.mka');
    const ignored = await run({
      mode: 'audio',
      duration: 'invalid',
      start: 'invalid',
      fps: 'invalid',
    });
    assert(!ignored.error, JSON.stringify(ignored));
    const capabilities = await run({ mode: 'capabilities' });
    assert(!capabilities.error, JSON.stringify(capabilities));
    assert.match(Buffer.from(capabilities.files[0].data, 'base64').toString(), /Encoders:/);
    console.log(
      'PASS corrupt media rejected, absent audio, silent reverse, custom command, inactive field validation and full core help',
    );
  }
  if (selected.includes('ui')) {
    await page.goto(site.base + '/?layout=chronicle#video?task=native%3Avideo-audio');
    await chooseNativeTask(page, 'native:video-audio');
    await page.locator('#video-file').setInputFiles(output + '/long.mkv');
    assert.equal(await page.locator('#video-range').inputValue(), 'full');
    assert(!(await page.locator('#video-duration').isVisible()));
    await page.locator('#video-run').click();
    await page.waitForFunction(
      () => /完成|失败/.test(document.querySelector('#video-status').textContent),
      null,
      { timeout: 120000 },
    );
    assert.match(await page.locator('#video-status').textContent(), /完成/);
    assert.equal(await page.locator('#video-results audio').count(), 1);
    await page.locator('#video-track').selectOption('index');
    await page.locator('#video-track-index').fill('2');
    assert.equal(await page.locator('#video-results a').count(), 0);
    for (const id of [
      'clip',
      'mute',
      'resize',
      'rotate',
      'speed',
      'subtitle',
      'inspect',
      'capabilities',
    ]) {
      await chooseNativeTask(page, 'native:video-' + id);
      assert.equal(await page.locator('#video-mode').inputValue(), id);
    }
    await chooseNativeTask(page, 'native:video-animation');
    assert(await page.locator('#animation-workspace').isVisible());
    await chooseNativeTask(page, 'native:video-audio');
    assert(await page.locator('#video-range').isVisible());
    assert(!(await page.locator('#video-duration').isVisible()));
    await chooseNativeTask(page, 'native:video-reverse');
    await page.locator('#video-run').click();
    await page.locator('#video-stop').click();
    assert.match(await page.locator('#video-status').textContent(), /已停止/);
    assert.equal(await page.locator('#video-results a').count(), 0);
    await page.waitForFunction(() => !document.querySelector('#video-run').disabled);
    await chooseNativeTask(page, 'native:video-audio');
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: output + '/mobile.png', fullPage: true });
    console.log('PASS real UI full audio, routes, invalidation, cancel, mobile width');
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(outside, []);
} finally {
  await browser.close();
  await site.close();
}
