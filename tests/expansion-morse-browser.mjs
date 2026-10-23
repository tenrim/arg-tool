import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { morseFixture } from './expansion-morse-fixtures.mjs';
const require = createRequire(new URL('../test-tools/package.json', import.meta.url));
const { chromium } = require('playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const context = await browser.newContext();
const seen = [], errors = [];
let failWasm = false;
const workerCode = base => `
  import {decodeMorse,encodeMorse} from '${base}expansion/morse-engine.js';
  self.onmessage = async ({data}) => {
    const abort = new AbortController();
    try {
      const hooks = {resourceBase: '${base}', signal:abort.signal, onProgress(){if(data.cancel)abort.abort();}};
      const result = data.action==='encode' ? await encodeMorse(data.text,data.options,hooks) : await decodeMorse(new Float32Array(data.samples),data.sampleRate,data.options,hooks);
      self.postMessage({text:result.text, samples:result.samples?.length, statistics:result.statistics, signal:result.signal?.length, spectrum:result.spectrogram?.values.length});
    } catch(e) {self.postMessage({error:e.message,name:e.name});}
  };`;
await context.route('**/*', async route => {
  const url = new URL(route.request().url()); seen.push(url.href);
  if (url.hostname !== 'morse.test') return route.abort();
  if (url.pathname.endsWith('/')) return route.fulfill({ contentType: 'text/html', body: `<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><title>Morse engine regression</title>${['styles.css','desktop-layout.css','workspace.css','expansion.css','ui/components.css'].map(file => `<link rel="stylesheet" href="${url.href}${file}">`).join('')}<style>body{margin:16px}#test-main{max-width:100%}</style><body class="site-ui workbench-app"><main id="test-main"></main>` });
  const base = url.pathname.startsWith('/nested/') ? 'https://morse.test/nested/' : 'https://morse.test/';
  if (url.pathname.endsWith('/__morse-worker.js')) return route.fulfill({ contentType: 'text/javascript', body: workerCode(base) });
  if (failWasm && url.pathname.endsWith('/ggmorse.wasm')) return route.fulfill({ status: 404, body: 'missing wasm' });
  try {
    const pathname = url.pathname.replace(/^\/nested\//, '/');
    const body = await readFile(resolve('public', '.' + pathname));
    return route.fulfill({ body, contentType: { '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.css': 'text/css', '.woff2': 'font/woff2' }[extname(pathname)] ?? 'application/octet-stream' });
  } catch { return route.fulfill({ status: 404, body: 'not found' }); }
});
const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
async function job(base, blob, data) {
  return page.evaluate(async ({ base, blob, code, data }) => {
    const source = blob ? URL.createObjectURL(new Blob([code], { type: 'text/javascript' })) : base + '__morse-worker.js';
    const worker = new Worker(source, { type: 'module' });
    try {
      return await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('worker regression timed out')), 40000);
        worker.onmessage = e => { clearTimeout(timer); resolve(e.data); };
        worker.onerror = e => { clearTimeout(timer); reject(new Error(e.message)); };
        worker.postMessage(data);
      });
    } finally { worker.terminate(); if (blob) URL.revokeObjectURL(source); }
  }, { base, blob, code: workerCode(base), data });
}
try {
  const pcm = morseFixture('SOS TEST');
  const input = { samples: [...pcm.samples], sampleRate: pcm.sampleRate, options: {} };
  for (const [prefix, blob] of [['/', false], ['/', true], ['/nested/', false], ['/nested/', true]]) {
    const base = 'https://morse.test' + prefix;
    await page.goto(base);
    const decoded = await job(base, blob, input);
    assert.equal(decoded.text, 'SOS TEST', prefix + ' blob=' + blob + JSON.stringify(decoded));
    assert.ok(decoded.signal > 0 && decoded.spectrum > 0);
    const encoded = await job(base, blob, { action: 'encode', text: 'SOS TEST', options: { sampleRate: 8000 } });
    assert.ok(encoded.samples > 0);
  }
  await page.goto('https://morse.test/nested/');
  const base = 'https://morse.test/nested/';
  const cancelled = await job(base, true, { ...input, cancel: true });
  assert.equal(cancelled.name, 'AbortError');
  failWasm = true;
  const failed = await job(base, false, input);
  assert.match(failed.error, /HTTP 404/);
  failWasm = false;
  const retry = await job(base, false, input);
  assert.equal(retry.text, 'SOS TEST');
  // Real controller -> shared audio Worker -> core -> notebook result lease.
  await page.evaluate(async ({ samples, sampleRate }) => {
    const { mountMorse } = await import('./expansion/morse-view.js');
    const { connectNotebook } = await import('./handoff/button.js');
    let audio = { samples: new Float32Array(samples), sampleRate, generation: 1 };
    window.morseHarness = mountMorse({ host: document.getElementById('test-main'), getAudio: () => audio,
      loadAudioFile: async file => {
        const ctx = new AudioContext({ sampleRate: 8000 });
        try { const decoded = await ctx.decodeAudioData(await file.arrayBuffer()); audio = { samples: decoded.getChannelData(0).slice(), sampleRate: decoded.sampleRate, generation: audio.generation + 1 }; document.dispatchEvent(new Event('arg:audiochange')); return audio; }
        finally { await ctx.close(); }
      } });
    // Exercise the production shell contract as well as isolated editor DOM.
    const { decorateHeading } = await import('./site-shell.js');
    decorateHeading(window.morseHarness.panel.querySelector('.page-heading'), 'morse');
    window.morseHarness.panel.hidden = false;
    connectNotebook(async request => { window.recordedMorse = await request.read(); window.recordedCurrent = request.isCurrent(); });
  }, input);
  assert.equal(await page.locator('#panel-morse > .page-heading[data-ui="tool-header"]').count(), 1, 'shared app.decorateHeading target exists');
  assert.equal(await page.locator('#panel-morse .tool-help-button').count(), 1, 'shared shell owns the real Chinese help button');
  await page.locator('#morse-run').click();
  await page.waitForFunction(() => document.getElementById('morse-status').textContent.includes('已完成识别'));
  assert.equal((await page.locator('#morse-output').inputValue()).trim(), 'SOS TEST');
  assert.equal(await page.locator('#morse-notebook').isDisabled(), false);
  await page.locator('#morse-notebook').click();
  assert.equal((await page.evaluate(() => window.recordedMorse.text)).trim(), 'SOS TEST');
  assert.equal(await page.evaluate(() => window.recordedCurrent), true);
  assert.equal(await page.locator('#morse-signal-plot').count(), 1);
  await page.locator('#morse-frequency').fill('750');
  assert.equal(await page.locator('#morse-output').inputValue(), '');
  assert.equal(await page.locator('#morse-notebook').isDisabled(), true);
  await page.selectOption('#morse-direction', 'encode');
  await page.locator('#morse-input').fill('SOS TEST');
  await page.locator('#morse-run').click();
  await page.waitForFunction(() => document.getElementById('morse-status').textContent.includes('已生成摩斯音频'));
  assert.equal(await page.locator('#morse-result-player').evaluate(node => node.src.startsWith('blob:')), true);
  await page.locator('#morse-notebook').click();
  const wav = await page.evaluate(() => [...window.recordedMorse.bytes.slice(0, 12)]);
  assert.equal(String.fromCharCode(...wav.slice(0, 4)), 'RIFF');
  assert.equal(String.fromCharCode(...wav.slice(8)), 'WAVE');
  const generatedWav = await page.evaluate(() => [...window.recordedMorse.bytes]);
  await page.locator('#morse-alphabet-toggle').click();
  assert.equal(await page.locator('#morse-alphabet-body tbody tr').count(), 54);
  await page.locator('#morse-alphabet-toggle').focus();
  await page.keyboard.press('Space');
  assert.equal(await page.locator('#morse-alphabet-body').isVisible(), false);
  for (const reducedMotion of ['no-preference', 'reduce']) {
    await page.emulateMedia({ reducedMotion });
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'morse bounds ' + width + ' ' + reducedMotion);
      if (process.env.MORSE_SCREENSHOTS && reducedMotion === 'reduce' && width !== 390) await page.screenshot({ path: resolve(process.env.MORSE_SCREENSHOTS, `morse-${width}.png`), fullPage: true });
    }
  }
  await page.selectOption('#morse-direction', 'decode');
  assert.equal(await page.locator('#morse-result-player').isVisible(), false);
  await page.locator('#morse-file').setInputFiles({ name: 'generated-morse.wav', mimeType: 'audio/wav', buffer: Buffer.from(generatedWav) });
  await page.waitForFunction(() => document.getElementById('morse-status').textContent.includes('音频已载入'));
  await page.locator('#morse-frequency').fill('0');
  await page.locator('#morse-run').focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.getElementById('morse-status').textContent.includes('已完成识别'));
  assert.equal((await page.locator('#morse-output').inputValue()).trim(), 'SOS TEST');
  await page.locator('#morse-run').click();
  await page.locator('#morse-stop').click();
  assert.equal(await page.locator('#morse-notebook').isDisabled(), true);
  assert.equal(await page.locator('#morse-output').inputValue(), '');
  assert.ok(seen.every(url => new URL(url).hostname === 'morse.test'));
  assert.deepEqual(errors, []);
  console.log('PASS GGMorse: real WASM, native/blob/subdirectory resources, cancellation/retry; full UI -> audio Worker -> text/WAV notebook leases, 54-character alphabet, stale results and 320/390/1280 bounds; no external requests.');
} finally { await browser.close(); }
