import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';
import { chooseNativeTask } from './browser-navigation.mjs';
const dir = 'outputs/ffmpeg-editing';
await mkdir(dir, { recursive: true });
const ff = (args) =>
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    maxBuffer: 16 * 1024 * 1024,
  });
ff([
  '-f',
  'lavfi',
  '-i',
  'testsrc2=s=64x48:r=10:d=4',
  '-f',
  'lavfi',
  '-i',
  'aevalsrc=0.2*sin(2*PI*440*t)|0.2*sin(2*PI*880*t):s=8000:d=4',
  '-map',
  '0:v',
  '-map',
  '1:a',
  '-c:v',
  'libx264',
  '-preset',
  'ultrafast',
  '-c:a',
  'pcm_s16le',
  `${dir}/first.mkv`,
]);
ff(['-f', 'lavfi', '-i', 'color=red:s=32x32:r=10:d=2', '-c:v', 'libx264', `${dir}/second.mkv`]);
ff(['-f', 'lavfi', '-i', 'sine=frequency=220:sample_rate=8000:duration=1', `${dir}/tone.wav`]);
ff([
  '-f',
  'lavfi',
  '-i',
  'color=black:s=64x48:r=10:d=2',
  '-f',
  'lavfi',
  '-i',
  'testsrc2=s=64x48:r=10:d=2',
  '-f',
  'lavfi',
  '-i',
  'color=red:s=64x48:r=10:d=2',
  '-f',
  'lavfi',
  '-i',
  String.raw`aevalsrc=if(between(t\,2\,4)\,0.2*sin(2*PI*440*t)\,0):s=8000:d=6`,
  '-filter_complex',
  '[0:v][1:v][2:v]concat=n=3:v=1:a=0[v]',
  '-map',
  '[v]',
  '-map',
  '3:a',
  '-c:v',
  'libx264',
  '-preset',
  'ultrafast',
  '-c:a',
  'pcm_s16le',
  `${dir}/anomalies.mkv`,
]);
const input = await Promise.all(
  ['first.mkv', 'second.mkv', 'tone.wav', 'anomalies.mkv'].map(async (name) => ({
    name,
    data: (await readFile(`${dir}/${name}`)).toString('base64'),
  })),
);
const site = await startBrowserTestSite();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
const errors = [],
  outside = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.route('**/*', (route) => {
  if (route.request().url() === site.base + '/__editing')
    return route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Media editing</title>',
    });
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
async function run(options, files = [input[0]]) {
  const r = await page.evaluate(
    async ({ options, files }) => {
      const { mediaJob } = await import('/video/runtime.js');
      const task = mediaJob();
      try {
        const r = await task.run(
          files.map(
            (f) => new File([Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0))], f.name),
          ),
          options,
        );
        return {
          report: r.report,
          files: await Promise.all(
            r.files.map(async (f) => {
              const b = new Uint8Array(await f.arrayBuffer());
              let s = '';
              for (let i = 0; i < b.length; i += 32768)
                s += String.fromCharCode(...b.subarray(i, i + 32768));
              return { name: f.name, data: btoa(s) };
            }),
          ),
        };
      } catch (e) {
        return { error: e.message, logs: e.logs };
      } finally {
        task.cancel();
      }
    },
    { options, files },
  );
  return r;
}
let serial = 0;
async function saved(result) {
  assert(!result.error, result.error + '\n' + result.logs?.slice(-5000));
  return Promise.all(
    result.files.map(async (f) => {
      const path = `${dir}/${++serial}-${f.name}`;
      await writeFile(path, Buffer.from(f.data, 'base64'));
      return path;
    }),
  );
}
const probe = (path) =>
  JSON.parse(
    execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', path], {
      encoding: 'utf8',
    }),
  );
const seconds = (path) => Number(probe(path).format.duration);
const pcm = (path, extra = []) => {
  const b = ff([
    '-i',
    path,
    ...extra,
    '-f',
    'f32le',
    '-c:a',
    'pcm_f32le',
    '-ar',
    '8000',
    '-ac',
    '1',
    'pipe:1',
  ]);
  return Array.from({ length: b.length / 4 }, (_, i) => b.readFloatLE(i * 4));
};
const energy = (a) => a.reduce((s, x) => s + x * x, 0) / a.length;
const amplitude = (a, hz) =>
  Math.hypot(
    ...['sin', 'cos'].map(
      (fn) => a.reduce((s, x, i) => s + x * Math[fn]((2 * Math.PI * hz * i) / 8000), 0) / a.length,
    ),
  );
try {
  await page.goto(site.base + '/__editing');
  let [path] = await saved(await run({ mode: 'concat' }, [input[0], input[1]]));
  assert(Math.abs(seconds(path) - 6) < 0.15);
  assert.equal(probe(path).streams[0].width, 64);
  const rgb = ff([
    '-ss',
    '5',
    '-i',
    path,
    '-frames:v',
    '1',
    '-vf',
    'scale=1:1',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgb24',
    'pipe:1',
  ]);
  assert(rgb[0] > rgb[1] * 3, 'last concatenated section must be red');
  assert(
    energy(pcm(path, ['-ss', '4.5', '-t', '0.5'])) < 0.00001,
    'silent video must receive silence',
  );
  [path] = await saved(await run({ mode: 'concat', 'concat-kind': 'audio' }, [input[2], input[0]]));
  assert(Math.abs(seconds(path) - 5) < 0.02);
  assert.equal(probe(path).streams[0].sample_rate, '48000');
  console.log('PASS concat: order, differing sizes, missing sound, audio concat');
  for (const policy of ['video', 'loop', 'shortest']) {
    [path] = await saved(
      await run({ mode: 'replace-audio', 'audio-length': policy }, [input[0], input[2]]),
    );
    assert(Math.abs(seconds(path) - (policy === 'shortest' ? 1 : 4)) < 0.15, policy);
    if (policy !== 'shortest') {
      const e = energy(pcm(path, ['-ss', '2', '-t', '0.5']));
      assert(policy === 'loop' ? e > 0.001 : e < 0.000001, policy + ' duration policy');
    }
  }
  console.log('PASS replace audio: padding, looping, shortest');
  [path] = await saved(
    await run({ mode: 'crop', 'crop-x': 8, 'crop-y': 6, 'crop-width': 32, 'crop-height': 24 }),
  );
  assert.equal(probe(path).streams[0].width, 32);
  assert.equal(probe(path).streams[0].height, 24);
  const expected = ff([
    '-i',
    `${dir}/first.mkv`,
    '-frames:v',
    '1',
    '-vf',
    'crop=32:24:8:6:exact=1',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgb24',
    'pipe:1',
  ]);
  const actual = ff([
    '-i',
    path,
    '-frames:v',
    '1',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgb24',
    'pipe:1',
  ]);
  assert.equal(actual.length, expected.length);
  assert(
    actual.reduce((s, x, i) => s + Math.abs(x - expected[i]), 0) / actual.length < 12,
    'crop coordinates',
  );
  assert((await run({ mode: 'crop', 'crop-x': 40, 'crop-width': 32 })).error);
  assert((await run({ mode: 'crop', 'crop-width': 31 })).error);
  console.log('PASS crop: geometry, pixels, invalid bounds');
  const detected = await run({ mode: 'detect', 'detect-duration': 0.5 }, [input[3]]);
  await saved(detected);
  assert(detected.report.events.some((e) => e.type === 'black' && e.start < 0.1 && e.end > 1.8));
  assert(detected.report.events.some((e) => e.type === 'silence' && e.start < 0.1 && e.end > 1.9));
  assert(detected.report.events.some((e) => e.type === 'freeze' && e.start >= 3.8 && e.end >= 5.8));
  const empty = await run({ mode: 'detect', 'detect-kind': 'black', 'detect-duration': 0.5 });
  await saved(empty);
  assert.equal(empty.report.events.length, 0);
  console.log('PASS detection: black, silence, EOF freeze, empty result');
  let paths = await saved(await run({ mode: 'segments', segments: '0,1\n2,3.5' }));
  assert.equal(paths.length, 2);
  assert(Math.abs(seconds(paths[0]) - 1) < 0.15);
  assert(Math.abs(seconds(paths[1]) - 1.5) < 0.15);
  paths = await saved(
    await run({ mode: 'segments', 'segment-kind': 'audio', segments: '0,0.5\n1,2' }),
  );
  assert(Math.abs(seconds(paths[0]) - 0.5) < 0.01);
  assert((await run({ mode: 'segments', segments: '0,1\n3,9' })).error);
  console.log('PASS segments: all outputs, video/audio timing, invalid last interval');
  for (const offset of [500, -500]) {
    [path] = await saved(await run({ mode: 'sync', offset }));
    assert(Math.abs(seconds(path) - 4) < 0.05);
    const a = pcm(path),
      head = energy(a.slice(0, 3000)),
      tail = energy(a.slice(-3000));
    assert(
      offset > 0 ? head < 0.000001 && tail > 0.001 : head > 0.001 && tail < 0.000001,
      'signed sync',
    );
  }
  console.log('PASS sync: signed delay, length, silence at correct end');
  const split = await run({ mode: 'channels', 'channel-action': 'split' });
  paths = await saved(split);
  assert.equal(paths.length, 2);
  assert.equal(probe(paths[0]).streams[0].channels, 1);
  assert.equal(probe(paths[0]).streams[0].sample_rate, '8000');
  assert(amplitude(pcm(paths[0]), 440) > 0.09);
  assert(amplitude(pcm(paths[1]), 880) > 0.09);
  [path] = await saved(
    await run({ mode: 'channels', 'channel-action': 'merge', 'channel-map': '1:2,1:1' }),
  );
  assert.equal(probe(path).streams[0].channels, 2);
  assert(amplitude(pcm(path, ['-af', 'pan=mono|c0=c0']), 880) > 0.09);
  assert(amplitude(pcm(path, ['-af', 'pan=mono|c0=c1']), 440) > 0.09);
  [path] = await saved(
    await run(
      { mode: 'channels', 'channel-action': 'merge', 'channel-map': '1:1,2:1' },
      split.files,
    ),
  );
  assert(amplitude(pcm(path, ['-af', 'pan=mono|c0=c0']), 440) > 0.09);
  assert(amplitude(pcm(path, ['-af', 'pan=mono|c0=c1']), 880) > 0.09);
  [path] = await saved(
    await run({ mode: 'channels', 'channel-action': 'merge', 'channel-map': '1:1,2:1' }, [
      input[0],
      input[2],
    ]),
  );
  assert(Math.abs(seconds(path) - 4) < 0.01);
  assert(energy(pcm(path, ['-ss', '2', '-af', 'pan=mono|c0=c1'])) < 0.000001);
  assert((await run({ mode: 'channels', 'channel-action': 'merge', 'channel-map': '1:3' })).error);
  [path] = await saved(
    await run({
      mode: 'channels',
      'channel-action': 'merge',
      'channel-map': '1:1,1:2,1:1,1:2,1:1,1:2,1:1,1:2',
    }),
  );
  assert.equal(probe(path).streams[0].channels, 8);
  console.log('PASS channels: every split, swap, multi-file reconstruction, padding, 8 channels');
  ff([
    '-display_rotation',
    '90',
    '-i',
    `${dir}/first.mkv`,
    '-map',
    '0:v',
    '-c:v',
    'copy',
    `${dir}/rotated.mp4`,
  ]);
  const rotated = {
    name: 'rotated.mp4',
    data: (await readFile(`${dir}/rotated.mp4`)).toString('base64'),
  };
  [path] = await saved(await run({ mode: 'crop' }, [rotated]));
  assert.equal(probe(path).streams[0].width, 48);
  assert.equal(probe(path).streams[0].height, 64);
  ff([
    '-i',
    `${dir}/first.mkv`,
    '-f',
    'lavfi',
    '-i',
    'sine=frequency=220:sample_rate=8000:duration=8',
    '-map',
    '0:v',
    '-map',
    '1:a',
    '-c:v',
    'copy',
    '-c:a',
    'pcm_s16le',
    `${dir}/unequal.mkv`,
  ]);
  const unequal = {
    name: 'unequal.mkv',
    data: (await readFile(`${dir}/unequal.mkv`)).toString('base64'),
  };
  [path] = await saved(await run({ mode: 'replace-audio' }, [unequal, input[2]]));
  assert(Math.abs(seconds(path) - 4) < 0.05, 'use video stream duration, not longer container');
  [path] = await saved(await run({ mode: 'sync', offset: 500 }, [unequal]));
  assert(Math.abs(seconds(path) - 4) < 0.05);
  assert(
    (await run({ mode: 'segments', segments: '5,6' }, [unequal])).error,
    'no empty intervals beyond video',
  );
  const noAudio = await run({ mode: 'detect' }, [input[1]]);
  await saved(noAudio);
  assert.deepEqual(noAudio.report.checked, ['黑屏', '画面冻结']);
  const onlyAudio = await run({ mode: 'detect' }, [input[2]]);
  await saved(onlyAudio);
  assert.deepEqual(onlyAudio.report.checked, ['静音']);
  assert((await run({ mode: 'replace-audio' }, [input[0], input[1]])).error);
  assert(
    (
      await run({ mode: 'concat' }, [
        input[0],
        { ...input[1], data: Buffer.from('bad file').toString('base64') },
      ])
    ).error,
  );
  await saved(
    await run(
      { mode: 'concat' },
      [input[0], input[1]].map((f) => ({ ...f, name: '中文同名.mkv' })),
    ),
  );
  console.log(
    'PASS edges: rotation, unequal stream lengths, missing tracks, corrupt extra input, Chinese filenames, recovery',
  );
  ff([
    '-i',
    `${dir}/first.mkv`,
    '-itsoffset',
    '2',
    '-f',
    'lavfi',
    '-i',
    'anullsrc=r=8000:cl=mono:d=2',
    '-map',
    '0:v',
    '-map',
    '1:a',
    '-c:v',
    'copy',
    '-c:a',
    'pcm_s16le',
    `${dir}/delayed.mkv`,
  ]);
  const delayed = {
    name: 'delayed.mkv',
    data: (await readFile(`${dir}/delayed.mkv`)).toString('base64'),
  };
  const shifted = await run({ mode: 'detect', 'detect-kind': 'silence' }, [delayed]);
  await saved(shifted);
  assert(
    shifted.report.events.some((e) => e.start >= 1.99 && e.start <= 2.01 && e.end >= 3.99),
    'detection preserves stream timeline offset',
  );
  console.log('PASS detection timestamps retain delayed audio offset');
  await page.goto(site.base + '/?layout=chronicle#home');
  for (const mode of [
    'concat',
    'replace-audio',
    'crop',
    'detect',
    'segments',
    'sync',
    'channels',
  ]) {
    await chooseNativeTask(page, 'native:video-' + mode);
    await page.waitForFunction((m) => document.querySelector('#video-mode')?.value === m, mode);
    assert.equal(await page.locator('#video-range').isVisible(), false);
    assert.equal(
      await page.locator('#video-mode').isVisible(),
      false,
      'shared mode selector is not duplicated',
    );
  }
  await chooseNativeTask(page, 'native:video-concat');
  await page.locator('#video-file').setInputFiles([`${dir}/first.mkv`, `${dir}/second.mkv`]);
  await page.getByRole('button', { name: '上移 second.mkv', exact: true }).click();
  assert((await page.locator('#video-file-order').innerText()).startsWith('1. second.mkv'));
  await page.locator('#video-run').click();
  await page.waitForFunction(
    () => document.querySelector('#video-status')?.textContent.includes('处理完成'),
    { timeout: 120000 },
  );
  await page.getByRole('button', { name: '上移 first.mkv', exact: true }).click();
  assert.equal(await page.locator('#video-results a').count(), 0, 'reorder invalidates result');
  await chooseNativeTask(page, 'native:video-detect');
  await page.locator('#video-file').setInputFiles(`${dir}/anomalies.mkv`);
  await page.locator('#video-run').click();
  await page.waitForFunction(
    () => document.querySelector('#video-status')?.textContent.includes('处理完成'),
    { timeout: 120000 },
  );
  assert((await page.locator('#video-results button').count()) > 0);
  await page.locator('#video-results button').first().click();
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: `${dir}/mobile.png`, fullPage: true });
  assert.deepEqual(errors, []);
  assert.deepEqual(outside, []);
  console.log(
    'PASS UI: seven routes, file order, invalidation, readable detection, mobile, offline',
  );
} finally {
  await browser.close();
  await site.close();
}
