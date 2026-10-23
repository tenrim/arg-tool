/** Real pinned GGMorse C++/WASM adapter. No audio or text leaves this origin. */
import { MORSE_ALPHABET } from './morse-alphabet.js';
export { MORSE_ALPHABET };
export const MORSE_DEFAULTS = Object.freeze({
  frequency_hz: -1, speed_wpm: -1, frequencyRangeMin_hz: 200,
  frequencyRangeMax_hz: 1200, applyFilterHighPass: true, applyFilterLowPass: true,
  volume: 0.1, encodeFrequency_hz: 550, speedCharacters_wpm: 25,
  speedFarnsworth_wpm: 25, sampleRate: 16000,
});

export const MORSE_LIMITS = Object.freeze({
  sampleRate: [4000, 48000], frequency_hz: [40, 1900], speed_wpm: [5, 55],
  volume: [0, 0.99], textBytes: 256, inputBytes: 32 * 1024 * 1024,
  outputBytes: 32 * 1024 * 1024, timeoutMs: 30000,
});

const STAT_NAMES = ['timeResample_ms', 'timePitchDetection_ms', 'timeGoertzel_ms',
  'timeFrameAnalysis_ms', 'estimatedPitch_Hz', 'estimatedSpeed_wpm', 'signalThreshold', 'costFunction'];
const yieldTask = () => new Promise(resolve => setTimeout(resolve, 0));
const error = (message, name = 'Error') => Object.assign(new Error(message), { name });

function bounded(value, name, min, max, fallback) {
  const n = value === undefined ? fallback : Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw error(`${name} 必须在 ${min}–${max} 之间。`);
  return n;
}
function automatic(value, name, fallback = -1) {
  if (value === undefined || Number(value) === -1 || Number(value) === 0) return fallback;
  return bounded(value, name, ...MORSE_LIMITS[name], fallback);
}
function check(hooks, started) {
  if (hooks.signal?.aborted) throw error('已停止摩斯音频处理。', 'AbortError');
  if (performance.now() - started > (hooks.timeoutMs ?? MORSE_LIMITS.timeoutMs)) throw error('摩斯音频处理超时，请缩短音频或固定音调与速度后重试。', 'TimeoutError');
}
function resourceRoot(hooks) {
  const own = new URL(import.meta.url);
  const root = new URL(hooks.resourceBase ?? '../', own);
  if (root.origin !== own.origin || root.username || root.password || !['http:', 'https:', 'file:'].includes(root.protocol)) {
    throw error('GGMorse 资源必须来自本站。');
  }
  if (!root.pathname.endsWith('/')) root.pathname += '/';
  return root;
}
async function runtime(hooks, started) {
  check(hooks, started);
  const root = resourceRoot(hooks);
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  hooks.signal?.addEventListener('abort', onAbort, { once: true });
  const timeout = setTimeout(() => controller.abort(), hooks.timeoutMs ?? MORSE_LIMITS.timeoutMs);
  try {
    const moduleUrl = new URL('vendor/expansion/ggmorse/ggmorse.mjs', root);
    const wasmUrl = new URL('vendor/expansion/ggmorse/ggmorse.wasm', root);
    const [{ default: factory }, response] = await Promise.all([
      import(moduleUrl.href), fetch(wasmUrl, { signal: controller.signal, credentials: 'same-origin' }),
    ]);
    if (!response.ok) throw error(`GGMorse 运算资源加载失败（HTTP ${response.status}）。`);
    const wasmBinary = new Uint8Array(await response.arrayBuffer());
    check(hooks, started);
    const engine = await factory({ wasmBinary, print() {}, printErr() {} });
    check(hooks, started);
    return engine;
  } catch (cause) {
    check(hooks, started);
    if (controller.signal.aborted) throw error('GGMorse 运算资源加载超时。', 'TimeoutError');
    throw error(`GGMorse 本地引擎无法启动：${cause.message}`);
  } finally {
    clearTimeout(timeout);
    hooks.signal?.removeEventListener('abort', onAbort);
  }
}
function alphabetEntries(value) {
  if (value === undefined || value === null || value === '') return [];
  const entries = Array.isArray(value) ? value : Object.entries(value);
  if (entries.length > 94) throw error('自定义字母表最多 94 项。');
  const seenSymbols = new Set(), seenLetters = new Set();
  return entries.map(entry => {
    if (!Array.isArray(entry) || entry.length !== 2) throw error('字母表需使用 [点划序列, 单个 ASCII 字符]。');
    const [raw, char] = entry;
    const bits = String(raw).replaceAll('.', '0').replaceAll('-', '1');
    if (!/^[01]{1,16}$/.test(bits) || typeof char !== 'string' || !/^[!-~]$/.test(char)) throw error('字母表序列仅可含点划或 0/1，目标为单个可打印 ASCII 字符。');
    const upper = char.toUpperCase();
    if (seenSymbols.has(bits) || seenLetters.has(upper)) throw error('自定义字母表不能有重复序列或目标字符。');
    seenSymbols.add(bits); seenLetters.add(upper);
    return [bits, upper];
  });
}
function configureAlphabet(engine, handle, alphabet) {
  for (const [bits, char] of alphabet) {
    const bytes = new TextEncoder().encode(bits + '\0');
    const ptr = engine._malloc(bytes.length);
    try { engine.HEAPU8.set(bytes, ptr); engine._mist_character(handle, ptr, char.charCodeAt(0)); }
    finally { engine._free(ptr); }
  }
}
function floatCopy(engine, ptr, count) {
  return engine.HEAPF32.slice(ptr / 4, ptr / 4 + count);
}
function statistics(engine, handle) {
  const ptr = engine._mist_statistics(handle) / 4;
  return Object.fromEntries(STAT_NAMES.map((key, i) => [key, engine.HEAPF32[ptr + i]]));
}
function effectiveAlphabet(entries) {
  const map = new Map(Object.entries(MORSE_ALPHABET));
  for (const [bits, char] of entries) {
    for (const [oldBits, oldChar] of map) if (oldChar === char) { map.delete(oldBits); break; }
    map.set(bits, char);
  }
  return new Map([...map].map(([bits, char]) => [char, bits]));
}
function spectrumSnapshot(engine, handle) {
  const ptr = engine._mist_spectrum(handle);
  const rows = engine._mist_spectrum_rows(handle), columns = engine._mist_spectrum_columns(handle);
  return { values: floatCopy(engine, ptr, rows * columns), rows, columns, sampleRate: 4000, fftStep: 128 };
}
export function validateMorseAlphabet(value) { return alphabetEntries(value); }

/** Full mono PCM input; native engine consumes bounded blocks without truncation. */
export async function decodeMorse(samples, sampleRate, options = {}, hooks = {}) {
  const started = performance.now();
  if (!(samples instanceof Float32Array) || !samples.length) throw error('请先载入非空的单声道 PCM 音频。');
  if (samples.byteLength > MORSE_LIMITS.inputBytes) throw error('摩斯识别 PCM 输入超过 32 MB，请先裁剪音频。');
  bounded(sampleRate, '采样率', ...MORSE_LIMITS.sampleRate, 16000);
  for (const sample of samples) if (!Number.isFinite(sample)) throw error('PCM 中包含非有限数值。');
  const p = {
    frequency_hz: automatic(options.frequency_hz, 'frequency_hz'),
    speed_wpm: automatic(options.speed_wpm, 'speed_wpm'),
    frequencyRangeMin_hz: bounded(options.frequencyRangeMin_hz, '自动音调下限', 40, 1900, 200),
    frequencyRangeMax_hz: bounded(options.frequencyRangeMax_hz, '自动音调上限', 40, 1900, 1200),
    applyFilterHighPass: options.applyFilterHighPass ?? true,
    applyFilterLowPass: options.applyFilterLowPass ?? true,
  };
  if (p.frequencyRangeMin_hz >= p.frequencyRangeMax_hz) throw error('自动音调下限必须小于上限。');
  const alphabet = alphabetEntries(options.alphabet);
  const engine = await runtime(hooks, started);
  let handle = 0, ptr = 0;
  try {
    handle = engine._mist_create(sampleRate);
    if (!handle) throw error('无法创建 GGMorse 解码器。');
    engine._mist_configure_decode(handle, p.frequency_hz, p.speed_wpm,
      p.frequencyRangeMin_hz, p.frequencyRangeMax_hz, Number(p.applyFilterHighPass), Number(p.applyFilterLowPass));
    configureAlphabet(engine, handle, alphabet);
    const blockSize = 4096;
    ptr = engine._malloc(blockSize * 4);
    const tailSamples = Math.ceil(sampleRate * 4); // native 3-second analysis latency + final letter/word space
    const total = samples.length + tailSamples;
    const textParts = [], thresholds = [], history = [];
    let thresholdCount = 0, lastSignal = new Float32Array(), textBytes = 0, inputStats, inputSpectrum;
    for (let offset = 0; offset < total;) {
      check(hooks, started);
      const count = Math.min(blockSize, (offset < samples.length ? samples.length : total) - offset);
      engine.HEAPF32.fill(0, ptr / 4, ptr / 4 + count);
      if (offset < samples.length) engine.HEAPF32.set(samples.subarray(offset, Math.min(offset + count, samples.length)), ptr / 4);
      engine._mist_feed(handle, ptr, count);
      const n = engine._mist_result_size(handle);
      if (n) {
        textBytes += n;
        if (textBytes > MORSE_LIMITS.outputBytes) throw error('摩斯文本结果超过 32 MB，已停止处理。');
        textParts.push(new TextDecoder('ascii').decode(engine.HEAPU8.slice(engine._mist_result(handle), engine._mist_result(handle) + n)));
      }
      const signalCount = engine._mist_signal_size(handle);
      if (signalCount && offset < samples.length) lastSignal = floatCopy(engine, engine._mist_signal(handle), signalCount);
      const thresholdSize = engine._mist_threshold_size(handle);
      if (thresholdSize) {
        thresholdCount += thresholdSize;
        thresholds.push(floatCopy(engine, engine._mist_threshold(handle), thresholdSize));
      }
      const stats = statistics(engine, handle);
      if (offset < samples.length) {
        inputStats = stats;
        if (offset + count >= samples.length) inputSpectrum = spectrumSnapshot(engine, handle);
      }
      history.push({ seconds: Math.min(offset + count, samples.length) / sampleRate, flush: offset >= samples.length, ...stats });
      hooks.onProgress?.({ progress: Math.min(1, (offset + count) / total), seconds: Math.min(offset + count, samples.length) / sampleRate,
        statistics: stats, textChunk: n ? textParts.at(-1) : '' });
      offset += count;
      await yieldTask();
    }
    const threshold = new Float32Array(thresholdCount);
    let index = 0;
    for (const part of thresholds) { threshold.set(part, index); index += part.length; }
    check(hooks, started);
    const rawText = textParts.join('');
    return { text: rawText.trim(), rawText, statistics: inputStats, signal: lastSignal, threshold,
      spectrogram: inputSpectrum ?? spectrumSnapshot(engine, handle),
      diagnostics: { history, parameters: p, inputSamples: samples.length, sampleRate, flushSamples: tailSamples,
        finalStatistics: statistics(engine, handle),
        signalWindowSeconds: 3, signalSampleRate: 500, thresholdStepSeconds: 128 / 4000, durationSeconds: samples.length / sampleRate,
        elapsedMs: performance.now() - started, alphabet, engine: 'ggmorse 7b4822a8cfdbb1addfe497f3ae8186f142a4ee79' } };
  } finally { if (ptr) engine._free(ptr); if (handle) engine._mist_destroy(handle); }
}

/** Official generator, including its own envelope, timing and Farnsworth behavior. */
export async function encodeMorse(text, options = {}, hooks = {}) {
  const started = performance.now();
  if (typeof text !== 'string' || !text.trim()) throw error('请输入要生成摩斯音频的文字。');
  const alphabet = alphabetEntries(options.alphabet);
  const encoding = effectiveAlphabet(alphabet);
  for (const char of text.toUpperCase()) if (char !== ' ' && !encoding.has(char)) throw error(`上游摩斯字母表不支持字符 ${char}，请先转换或设置自定义映射。`);
  const bytes = new TextEncoder().encode(text.toUpperCase());
  if (bytes.length > MORSE_LIMITS.textBytes) throw error('上游单次编码上限为 256 个 ASCII 字节；请分段生成，输入不会被截断。');
  const sampleRate = bounded(options.sampleRate, '采样率', ...MORSE_LIMITS.sampleRate, 16000);
  const p = {
    volume: bounded(options.volume, '音量', 0, 0.99, 0.1),
    frequency_hz: bounded(options.frequency_hz, '音调', 40, Math.min(1900, sampleRate / 2 - 1), 550),
    speedCharacters_wpm: bounded(options.speedCharacters_wpm, '字符速度', 5, 55, 25),
    speedFarnsworth_wpm: bounded(options.speedFarnsworth_wpm, '间隔速度', 5, 55, 25),
  };
  if (p.speedFarnsworth_wpm > p.speedCharacters_wpm) throw error('Farnsworth 间隔速度不能快于字符速度。');
  // Match the upstream generator's integer timing exactly, including its
  // Farnsworth intra-symbol gap. Reject before any large native allocation.
  const dot = Math.floor(sampleRate * (1.2 / p.speedCharacters_wpm));
  const gap = Math.floor(sampleRate * (1.2 / p.speedFarnsworth_wpm));
  let sampleCount = 2 * gap;
  const upperText = text.toUpperCase();
  for (let i = 0; i < upperText.length; i++) {
    const bits = encoding.get(upperText[i]);
    if (bits) for (let j = 0; j < bits.length; j++) sampleCount += (bits[j] === '1' ? 3 : 1) * dot + (j < bits.length - 1 ? gap : 0);
    if (i < upperText.length - 1 && upperText[i] !== ' ') sampleCount += (upperText[i + 1] === ' ' ? 7 : 3) * gap;
  }
  if (sampleCount * 4 > MORSE_LIMITS.outputBytes) throw error('生成 PCM 超过 32 MB，请减少文字、降低采样率或分段生成。');
  const engine = await runtime(hooks, started);
  let handle = 0, ptr = 0;
  try {
    handle = engine._mist_create(sampleRate);
    configureAlphabet(engine, handle, alphabet);
    ptr = engine._malloc(bytes.length);
    engine.HEAPU8.set(bytes, ptr);
    check(hooks, started);
    if (!engine._mist_encode(handle, ptr, bytes.length, p.volume, p.frequency_hz, p.speedCharacters_wpm, p.speedFarnsworth_wpm)) throw error('GGMorse 音频生成失败。');
    const count = engine._mist_encoded_size(handle);
    if (count * 4 > MORSE_LIMITS.outputBytes) throw error('生成 PCM 超过 32 MB，请分段生成。');
    const samples = floatCopy(engine, engine._mist_encoded(handle), count);
    check(hooks, started);
    return { samples, sampleRate, text: text.toUpperCase(), diagnostics: { parameters: p, alphabet,
      durationSeconds: count / sampleRate, elapsedMs: performance.now() - started,
      engine: 'ggmorse 7b4822a8cfdbb1addfe497f3ae8186f142a4ee79' } };
  } finally { if (ptr) engine._free(ptr); if (handle) engine._mist_destroy(handle); }
}
