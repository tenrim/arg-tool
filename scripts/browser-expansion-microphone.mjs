import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { morseFixture } from '../tests/expansion-morse-fixtures.mjs';
import { wavEncode } from '../public/media.js';
const require = createRequire(new URL('../test-tools/package.json', import.meta.url));
const { chromium } = require('playwright');
const scratch = resolve('.tmp-expansion-tests/microphone'); await mkdir(scratch, { recursive: true });
const pcm = morseFixture('SOS TEST', { sampleRate: 48000 });
const samples = new Float32Array(pcm.samples.length + 96000); samples.set(pcm.samples);
const captureFile = resolve(scratch, 'sos-test-capture.wav'); await writeFile(captureFile, wavEncode([samples], pcm.sampleRate));
const root = resolve('public'), missing = [], external = [];
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://localhost').pathname;
    if (path === '/') {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/expansion.css"><link rel="stylesheet" href="/ui/components.css"><body class="site-ui workbench-app"><main id="test-main"></main>'); return;
    }
    const file = resolve(root, '.' + decodeURIComponent(path));
    if (!file.startsWith(root + sep)) throw Error('outside public');
    const bytes = await readFile(file);
    response.writeHead(200, { 'Content-Type': { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.json': 'application/json' }[extname(file)] || 'application/octet-stream' }); response.end(bytes);
  } catch { missing.push(request.url); response.writeHead(404); response.end('missing'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const fallback = 'C:/Users/14299/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe';
process.env.TEMP = scratch; process.env.TMP = scratch;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (existsSync(fallback) ? fallback : undefined), args: [
  '--no-sandbox', '--disable-dev-shm-usage', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
  '--use-file-for-fake-audio-capture=' + captureFile,
] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const errors = [];
await context.route('**/*', route => { const url = new URL(route.request().url()); if (url.origin !== origin && !['blob:', 'data:'].includes(url.protocol)) { external.push(url.href); return route.abort(); } return route.continue(); });
await context.addInitScript(() => {
  const nativeGet = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  window.captureRequests = 0; window.captureStreams = []; window.captureMode = 'native';
  navigator.mediaDevices.getUserMedia = async constraints => {
    window.captureRequests++; window.captureConstraints = constraints;
    if (window.captureMode === 'deny') throw new DOMException('test denied', 'NotAllowedError');
    if (window.captureMode === 'pending') return new Promise((resolve, reject) => {
      window.deliverPermission = async () => { const stream = await nativeGet(constraints); window.captureStreams.push(stream); resolve(stream); };
      window.rejectPermission = () => reject(new DOMException('late denied', 'NotAllowedError'));
    });
    const stream = await nativeGet(constraints); window.captureStreams.push(stream); return stream;
  };
});
const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
async function harness() {
  await page.goto(origin);
  await page.evaluate(async () => {
    const { mountMorse } = await import('/expansion/morse-view.js');
    window.audioLoads = 0; window.audio = null; window.loadingMode = 'normal';
    window.morse = mountMorse({ host: document.getElementById('test-main'), getAudio: () => window.audio,
      loadAudioFile: async (file, { isCurrent = () => true } = {}) => {
        window.audioLoads++; window.lastLoadedName = file.name;
        if (window.loadingMode === 'pending') await new Promise(resolve => { window.finishAudioLoad = resolve; });
        if (!isCurrent()) return null;
        const ctx = new AudioContext({ sampleRate: 8000 });
        try {
          const decoded = await ctx.decodeAudioData(await file.arrayBuffer());
          if (!isCurrent()) return null;
          window.audio = { samples: decoded.getChannelData(0).slice(), sampleRate: decoded.sampleRate, generation: window.audioLoads };
          document.dispatchEvent(new Event('arg:audiochange')); return window.audio;
        } finally { await ctx.close(); }
      } });
    window.morse.panel.hidden = false;
  });
}
const waitRecording = () => page.waitForFunction(() => !document.getElementById('morse-mic-stop').disabled);
const leave = () => page.evaluate(() => document.dispatchEvent(new CustomEvent('arg:panelchange', { detail: { name: 'home' } })));
const assertReleased = () => page.evaluate(() => window.captureStreams.every(stream => stream.getTracks().every(track => track.readyState === 'ended')));
try {
  await harness();
  assert.equal(await page.evaluate(() => window.captureRequests), 0, 'mount never asks for microphone permission');
  await page.locator('#morse-mic-start').click(); await waitRecording();
  assert.equal(await page.locator('#morse-run').isDisabled(), true);
  assert.equal(await page.locator('#morse-file').isDisabled(), true);
  assert.deepEqual(await page.evaluate(() => window.captureConstraints.audio), { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false });
  // The fake device plays a real independent Morse WAV with its half-second
  // lead-in and two extra seconds at the end to avoid the next replay.
  // Wait on actual recording duration rather than a UI-settling sleep.
  await page.waitForFunction(() => /录音 (?:5|6) \/ 120/.test(document.getElementById('morse-mic-readout').textContent), undefined, { timeout: 11000 });
  await page.locator('#morse-mic-stop').click();
  await page.waitForFunction(() => document.getElementById('morse-status').textContent.includes('麦克风录音已在本机载入'));
  assert.equal(await assertReleased(), true, 'stop and load releases every actual device track');
  assert.equal(await page.evaluate(() => window.audioLoads), 1);
  assert.match(await page.evaluate(() => window.lastLoadedName), /^麦克风录音-.*\.(webm|ogg|m4a)$/);
  await page.locator('#morse-frequency').fill('700'); await page.locator('#morse-speed').fill('20');
  await page.locator('#morse-run').click();
  await page.waitForFunction(() => document.getElementById('morse-status').textContent.includes('已完成识别'), undefined, { timeout: 40000 });
  assert.equal((await page.locator('#morse-output').inputValue()).trim(), 'SOS TEST', 'actual MediaRecorder Blob -> existing audio owner -> real audio Worker -> GGMorse');
  console.log('PASS microphone: genuine getUserMedia + MediaRecorder + captured Morse WAV -> real audio Worker -> SOS TEST.');

  await page.locator('#morse-mic-start').click(); await waitRecording();
  assert.equal(await page.locator('#morse-output').inputValue(), '', 'new capture invalidates previous result');
  await page.locator('#morse-mic-cancel').click();
  assert.equal(await assertReleased(), true); assert.equal(await page.evaluate(() => window.audioLoads), 1, 'cancel never adopts partial recording');
  await page.locator('#morse-mic-start').click(); await waitRecording(); await leave();
  assert.equal(await assertReleased(), true); assert.equal(await page.evaluate(() => window.audioLoads), 1, 'leaving cancels recording without loading a Blob');

  await harness(); await page.evaluate(() => { window.captureMode = 'pending'; });
  await page.locator('#morse-mic-start').click(); await page.waitForFunction(() => Boolean(window.deliverPermission));
  await leave(); await page.evaluate(() => window.deliverPermission());
  await page.waitForFunction(() => window.captureStreams.length === 1 && window.captureStreams[0].getTracks().every(t => t.readyState === 'ended'));
  assert.equal(await page.evaluate(() => window.audioLoads), 0, 'permission granted after departure is immediately released');
  await page.locator('#morse-mic-start').click(); await page.waitForFunction(() => window.captureRequests === 2);
  await leave(); await page.evaluate(() => window.rejectPermission());
  assert.equal(await page.evaluate(() => window.audioLoads), 0, 'late permission rejection cannot revive a departed capture');
  await page.evaluate(() => { window.captureMode = 'deny'; });
  await page.locator('#morse-mic-start').click();
  await page.waitForFunction(() => document.getElementById('morse-status').textContent.includes('麦克风权限未获允许'));
  assert.equal(await page.locator('#morse-run').isDisabled(), false);
  console.log('PASS microphone: stop/cancel/departure cleanup, zero auto permission, late granted/rejected permission, denial recovery.');

  // Controlled recorder edge cases use the same real captured MediaStream.
  // Only event production is controlled, so limits and late Blob adoption do
  // not require allocating minutes of audio or waiting two minutes per test.
  await harness();
  await page.evaluate(async () => {
    const bytes = await (await fetch('/vendor/expansion/ggmorse/LICENSE-MIT.txt')).arrayBuffer();
    window.limitBytes = bytes;
    window.NativeMediaRecorder = MediaRecorder;
    window.MediaRecorder = class {
      static isTypeSupported() { return true; }
      constructor() { this.state = 'inactive'; this.mimeType = 'audio/webm'; window.controlledRecorder = this; }
      start() { this.state = 'recording'; }
      stop() { this.state = 'inactive'; queueMicrotask(() => this.onstop?.()); }
    };
    const nativeTimeout = window.setTimeout;
    window.setTimeout = (callback, delay, ...args) => { if (delay === 120000) window.durationDeadline = callback; return nativeTimeout(callback, delay, ...args); };
  });
  await page.locator('#morse-mic-start').click(); await waitRecording();
  await page.evaluate(() => window.controlledRecorder.ondataavailable({ data: new Blob([new Uint8Array(32 * 1024 * 1024 + 1)]) }));
  assert.equal(await assertReleased(), true); assert.equal(await page.evaluate(() => window.audioLoads), 0);
  assert.match(await page.locator('#morse-status').textContent(), /超过 32 MB/);
  await page.locator('#morse-mic-start').click(); await waitRecording();
  await page.evaluate(() => { window.loadingMode = 'pending'; window.controlledRecorder.ondataavailable({ data: new Blob([window.limitBytes]) }); window.durationDeadline(); });
  await page.waitForFunction(() => Boolean(window.finishAudioLoad));
  assert.equal(await assertReleased(), true, '120-second deadline closes tracks before audio decoding');
  await leave(); await page.evaluate(() => window.finishAudioLoad());
  assert.equal(await page.evaluate(() => window.audio), null, 'late recording decode checks the injected source lease');
  await page.evaluate(() => { window.MediaRecorder = undefined; });
  const beforeUnsupported = await page.evaluate(() => window.captureRequests);
  await page.locator('#morse-mic-start').click();
  assert.match(await page.locator('#morse-status').textContent(), /不支持本地录音/);
  assert.equal(await page.evaluate(() => window.captureRequests), beforeUnsupported);
  await page.evaluate(() => window.morse.panel.remove());
  assert.equal(await assertReleased(), true);
  assert.deepEqual(errors, []); assert.deepEqual(external, []); assert.deepEqual(missing, []);
  console.log('PASS microphone: 32 MB whole-recording rejection, 120-second deadline, late decoder lease, unsupported browser and unmount; no external requests.');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
