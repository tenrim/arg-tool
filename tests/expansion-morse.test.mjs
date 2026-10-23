import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { decodeMorse, encodeMorse, validateMorseAlphabet } from '../public/expansion/morse-engine.js';
import { morseFixture } from './expansion-morse-fixtures.mjs';

// Node's fetch does not read file URLs. This adapter reads real pinned bytes;
// WebAssembly compilation and every DSP call are the production implementation.
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  if (new URL(url).protocol !== 'file:') return realFetch(url, options);
  if (options?.signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return new Response(await readFile(url));
};

test('real GGMorse decodes independent PCM with automatic frequency and speed', async () => {
  for (const config of [
    { sampleRate: 8000, frequency: 700, speed: 20 },
    { sampleRate: 44100, frequency: 550, speed: 15 },
    { sampleRate: 8000, frequency: 700, speed: 20, noise: 0.04 },
  ]) {
    const input = morseFixture('SOS TEST', config);
    const result = await decodeMorse(input.samples, input.sampleRate, config.noise ? { frequency_hz: 700, speed_wpm: 20 } : {});
    assert.equal(result.text, input.text);
    assert.ok(Math.abs(result.statistics.estimatedPitch_Hz - config.frequency) < 12);
    assert.ok(Math.abs(result.statistics.estimatedSpeed_wpm - config.speed) <= 1);
    assert.ok(result.signal.some(x => x > 0));
    assert.ok(result.threshold.length > 0);
    assert.equal(result.spectrogram.values.length, result.spectrogram.rows * result.spectrogram.columns);
    assert.ok(result.spectrogram.values.some(x => x > 0));
    assert.equal(result.diagnostics.inputSamples, input.samples.length);
    assert.ok(result.diagnostics.history.length > 1);
  }
});

test('official audio encoder, Farnsworth and custom alphabet all run in the WASM core', async () => {
  const options = { sampleRate: 8000, frequency_hz: 650, speedCharacters_wpm: 20, speedFarnsworth_wpm: 20, volume: 0.5 };
  const result = await encodeMorse('SOS TEST', options);
  const decoded = await decodeMorse(result.samples, result.sampleRate, { frequency_hz: 650, speed_wpm: 20 });
  assert.equal(decoded.text, 'SOS TEST');
  const slow = await encodeMorse('SOS TEST', { ...options, speedFarnsworth_wpm: 10 });
  assert.ok(slow.samples.length > result.samples.length);
  const alphabet = { '000000': '#' };
  const custom = await encodeMorse('A#A', { ...options, alphabet });
  const customDecoded = await decodeMorse(custom.samples, custom.sampleRate, { frequency_hz: 650, speed_wpm: 20, alphabet });
  assert.equal(customDecoded.text, 'A#A');
  assert.deepEqual(validateMorseAlphabet({ '.-': 'a' }), [['01', 'A']]);
});

test('input limits reject without truncation, cancellation and bad resource recovery are explicit', async () => {
  await assert.rejects(encodeMorse('A'.repeat(257)), /256/);
  await assert.rejects(encodeMorse('中文'), /不支持/);
  await assert.rejects(encodeMorse('A'.repeat(256), { sampleRate: 48000, speedCharacters_wpm: 5, speedFarnsworth_wpm: 5 }), /32 MB/);
  await assert.rejects(decodeMorse(new Float32Array([NaN]), 8000), /非有限/);
  await assert.rejects(decodeMorse(new Float32Array(10), 192000), /采样率/);
  await assert.rejects(decodeMorse(new Float32Array(10), 8000, { frequencyRangeMin_hz: 1000, frequencyRangeMax_hz: 500 }), /下限/);
  await assert.rejects(encodeMorse('A', { alphabet: [['0', '#'], ['0', '%']] }), /重复/);
  const input = morseFixture('SOS TEST');
  const cancelled = new AbortController();
  cancelled.abort();
  await assert.rejects(decodeMorse(input.samples, input.sampleRate, {}, { signal: cancelled.signal }), { name: 'AbortError' });
  const active = new AbortController();
  await assert.rejects(decodeMorse(input.samples, input.sampleRate, {}, { signal: active.signal, onProgress() { active.abort(); } }), { name: 'AbortError' });
  const fetchRealBytes = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('missing', { status: 404 });
    await assert.rejects(decodeMorse(input.samples, input.sampleRate), /HTTP 404/);
  } finally { globalThis.fetch = fetchRealBytes; }
  const retry = await decodeMorse(input.samples, input.sampleRate, { frequency_hz: 700, speed_wpm: 20 });
  assert.equal(retry.text, 'SOS TEST');
});
