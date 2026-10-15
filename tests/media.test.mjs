import test from 'node:test';
import assert from 'node:assert/strict';
import { transformPixels, extractLSB, identifyFile, pngChunks, asciiStrings, wavEncode, reverseChannels, morseAudio, spectrogram, detectDTMF } from '../public/media.js';

test('image channels and bit planes retain exact channel values', () => {
  const pixels = Uint8ClampedArray.of(129, 64, 32, 255);
  assert.deepEqual([...transformPixels(pixels, 'red')], [129, 129, 129, 255]);
  assert.deepEqual([...transformPixels(pixels, 'bit-r', 0)], [255, 255, 255, 255]);
  assert.deepEqual([...transformPixels(pixels, 'bit-g', 0)], [0, 0, 0, 255]);
  assert.deepEqual([...transformPixels(pixels, 'invert')], [126, 191, 223, 255]);
  assert.deepEqual([...pixels], [129, 64, 32, 255]);
});
test('LSB extraction decodes a known MSB-first A payload and checks offsets', () => {
  const bits = '01000001', pixels = new Uint8ClampedArray(32);
  for (let i = 0; i < bits.length; i++) pixels[i * 4] = Number(bits[i]);
  assert.deepEqual([...extractLSB(pixels, 'r')], [65]);
  assert.equal(extractLSB(pixels, 'r', 0, 1).length, 0);
  assert.throws(() => extractLSB(pixels, 'rr')); assert.throws(() => extractLSB(pixels, 'rgb', 9));
});
test('file signatures, appended PNG data, boundary errors and strings', () => {
  assert.equal(identifyFile(Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10)), 'PNG 图片');
  assert.equal(identifyFile(new TextEncoder().encode('%PDF-1.7')), 'PDF 文档');
  assert.equal(identifyFile(Uint8Array.of(80, 75, 3, 4)), 'ZIP 或基于 ZIP 的文件');
  const png = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130, 65, 66);
  assert.equal(pngChunks(png)[1].bytes, 2); png[11] = 99; assert.throws(() => pngChunks(png), /边界/);
  assert.deepEqual(asciiStrings(Uint8Array.of(0, 65, 82, 71, 33, 0)), [{ offset: 1, text: 'ARG!' }]);
});
test('WAV headers, clipping and channel interleaving', () => {
  const bytes = wavEncode([Float32Array.of(-1, 1), Float32Array.of(0.5, -0.5)], 8000), view = new DataView(bytes.buffer);
  assert.equal(new TextDecoder().decode(bytes.subarray(0, 4)), 'RIFF'); assert.equal(view.getUint32(4, true), bytes.length - 8);
  assert.equal(view.getUint16(22, true), 2); assert.equal(view.getUint32(24, true), 8000);
  assert.equal(view.getInt16(44, true), -32768); assert.equal(view.getInt16(46, true), 16384); assert.equal(view.getInt16(48, true), 32767);
  const original = Float32Array.of(1, 2, 3); assert.deepEqual([...reverseChannels([original])[0]], [3, 2, 1]); assert.deepEqual([...original], [1, 2, 3]);
});
test('Morse WAV follows PARIS timing for SOS', () => {
  const bytes = morseAudio('SOS', 18); assert.equal((bytes.length - 44) / 2 / 22050, 1.8);
  assert.throws(() => morseAudio('SOS', 0));
});
test('spectrogram distinguishes a real sine wave from silence and bounds frequencies', () => {
  const rate = 8000, samples = Float32Array.from({ length: rate }, (_, i) => Math.sin(2 * Math.PI * 1000 * i / rate));
  const result = spectrogram(samples, rate, { fftSize: 1024, width: 16, height: 65, maxHz: 4000 });
  const row = 48, offset = (row * 16 + 8) * 4;
  assert.ok(result.pixels[offset] > 200); assert.ok(result.pixels[(20 * 16 + 8) * 4] < 30);
  const silent = spectrogram(new Float32Array(rate), rate, { width: 8, height: 8 }); assert.ok(silent.pixels[0] < 20);
  assert.throws(() => spectrogram(samples, rate, { minHz: 4000, maxHz: 5000 }));
});
test('DTMF recognises independently synthesised 1 and 5, and ignores silence', () => {
  const rate = 8000, samples = new Float32Array(rate);
  for (let i = 0; i < 1600; i++) samples[i] = 0.3 * Math.sin(2 * Math.PI * 697 * i / rate) + 0.3 * Math.sin(2 * Math.PI * 1209 * i / rate);
  for (let i = 3200; i < 4800; i++) samples[i] = 0.3 * Math.sin(2 * Math.PI * 770 * i / rate) + 0.3 * Math.sin(2 * Math.PI * 1336 * i / rate);
  assert.equal(detectDTMF(samples, rate).map(x => x.digit).join(''), '15');
  assert.deepEqual(detectDTMF(new Float32Array(rate), rate), []);
});
