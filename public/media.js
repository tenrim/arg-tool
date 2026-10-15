import FFT from './vendor/fft.js';
import { entropy, bytesToHex, morseEncode } from './engine.js';

export function transformPixels(original, mode = 'original', bit = 0, contrast = 0) {
  if (!Number.isInteger(bit) || bit < 0 || bit > 7) throw new Error('位平面必须为 0–7。');
  const output = new Uint8ClampedArray(original);
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  for (let i = 0; i < output.length; i += 4) {
    const r = original[i], g = original[i + 1], b = original[i + 2];
    if (mode === 'red' || mode === 'green' || mode === 'blue' || mode === 'alpha') {
      const channel = { red: 0, green: 1, blue: 2, alpha: 3 }[mode];
      output[i] = output[i + 1] = output[i + 2] = original[i + channel]; output[i + 3] = 255;
    } else if (mode === 'gray') {
      output[i] = output[i + 1] = output[i + 2] = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    } else if (mode === 'invert') {
      output[i] = 255 - r; output[i + 1] = 255 - g; output[i + 2] = 255 - b;
    } else if (mode.startsWith('bit-')) {
      const channel = { 'bit-r': 0, 'bit-g': 1, 'bit-b': 2, 'bit-a': 3 }[mode];
      output[i] = output[i + 1] = output[i + 2] = ((original[i + channel] >>> bit) & 1) * 255; output[i + 3] = 255;
    } else if (mode === 'contrast') {
      output[i] = factor * (r - 128) + 128; output[i + 1] = factor * (g - 128) + 128; output[i + 2] = factor * (b - 128) + 128;
    } else if (mode !== 'original') throw new Error('未知图片处理方式。');
  }
  return output;
}
export function extractLSB(rgba, channels = 'rgb', bit = 0, byteOffset = 0, maximum = 65536) {
  if (!/^[rgba]+$/.test(channels) || new Set(channels).size !== channels.length) throw new Error('通道只能由 r、g、b、a 组成，且不能重复。');
  if (!Number.isInteger(bit) || bit < 0 || bit > 7 || !Number.isInteger(byteOffset) || byteOffset < 0) throw new Error('位平面或起始字节无效。');
  const indices = Array.from(channels, ch => 'rgba'.indexOf(ch));
  const length = Math.min(maximum, Math.max(0, Math.floor(rgba.length / 4 * indices.length / 8) - byteOffset));
  const result = new Uint8Array(length);
  for (let byte = 0; byte < length; byte++) {
    let value = 0;
    for (let b = 0; b < 8; b++) {
      const position = (byteOffset + byte) * 8 + b;
      const pixel = Math.floor(position / indices.length), channel = indices[position % indices.length];
      value = (value << 1) | ((rgba[pixel * 4 + channel] >>> bit) & 1);
    }
    result[byte] = value;
  }
  return result;
}
export function pngChunks(bytes) {
  if (bytes.length < 8 || bytesToHex(bytes.subarray(0, 8)) !== '89 50 4e 47 0d 0a 1a 0a') return [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), chunks = []; let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset), type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    if (offset + 12 + length > bytes.length) throw new Error('PNG 数据块声明的长度超过文件边界。');
    const entry = { type, offset, bytes: length };
    if (type === 'tEXt') entry.text = new TextDecoder('latin1').decode(bytes.subarray(offset + 8, offset + 8 + Math.min(length, 4096)));
    chunks.push(entry); offset += 12 + length;
    if (type === 'IEND') { if (offset < bytes.length) chunks.push({ type: 'IEND 后附加数据', offset, bytes: bytes.length - offset }); break; }
    if (chunks.length > 10000) throw new Error('PNG 数据块数量过多。');
  }
  return chunks;
}
export function identifyFile(bytes) {
  const starts = values => values.every((value, i) => bytes[i] === value);
  const ascii = (start, length) => String.fromCharCode(...bytes.subarray(start, start + length));
  if (starts([137, 80, 78, 71, 13, 10, 26, 10])) return 'PNG 图片';
  if (starts([255, 216, 255])) return 'JPEG 图片';
  if (/^GIF8[79]a/.test(ascii(0, 6))) return 'GIF 图片';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WAVE') return 'WAV 音频';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'WebP 图片';
  if (ascii(0, 4) === 'OggS') return 'Ogg 音频 / 容器';
  if (ascii(0, 4) === 'fLaC') return 'FLAC 音频';
  if (ascii(0, 3) === 'ID3' || (bytes[0] === 255 && (bytes[1] & 224) === 224)) return 'MP3 / MPEG 音频';
  if (ascii(4, 4) === 'ftyp') return 'ISO 媒体容器（如 MP4 / AVIF / HEIC）';
  if (ascii(0, 5) === '%PDF-') return 'PDF 文档';
  if (starts([80, 75, 3, 4]) || starts([80, 75, 5, 6]) || starts([80, 75, 7, 8])) return 'ZIP 或基于 ZIP 的文件';
  if (starts([31, 139])) return 'GZIP 压缩文件';
  if (starts([55, 122, 188, 175, 39, 28])) return '7z 压缩文件';
  if (ascii(0, 4) === 'Rar!') return 'RAR 压缩文件';
  if (ascii(0, 4) === 'MThd') return 'MIDI 文件';
  if (starts([127, 69, 76, 70])) return 'ELF 可执行文件';
  if (ascii(0, 2) === 'MZ') return 'DOS / Windows 可执行文件';
  return '未识别；请结合十六进制和字符串判断';
}
export function hexDump(bytes, maximum = 8192, start = 0) {
  const lines = [], end = Math.min(bytes.length, start + maximum);
  for (let offset = start; offset < end; offset += 16) {
    const row = bytes.subarray(offset, Math.min(offset + 16, end));
    const ascii = Array.from(row, n => n >= 32 && n <= 126 ? String.fromCharCode(n) : '.').join('');
    lines.push(offset.toString(16).padStart(8, '0') + '  ' + bytesToHex(row).padEnd(47, ' ') + '  |' + ascii + '|');
  }
  return lines.join('\n');
}
export function asciiStrings(bytes, minimum = 4, maximum = 1000) {
  const results = []; let start = -1;
  for (let i = 0; i <= bytes.length; i++) {
    const valid = i < bytes.length && bytes[i] >= 32 && bytes[i] <= 126;
    if (valid && start < 0) start = i;
    if (!valid && start >= 0) {
      if (i - start >= minimum) results.push({ offset: start, text: new TextDecoder().decode(bytes.subarray(start, Math.min(i, start + 2048))) });
      start = -1;
      if (results.length >= maximum) break;
    }
  }
  return results;
}
export function fileAnalysis(bytes) { return { type: identifyFile(bytes), bytes: bytes.length, entropy: +entropy(bytes).toFixed(4), header: bytesToHex(bytes.subarray(0, 32)), strings: asciiStrings(bytes) }; }

export function wavEncode(channels, sampleRate) {
  if (!channels.length || channels.some(channel => channel.length !== channels[0].length)) throw new Error('声道长度不一致。');
  const count = channels.length, frames = channels[0].length, size = frames * count * 2;
  const result = new ArrayBuffer(44 + size), view = new DataView(result);
  const word = (offset, text) => Array.from(text).forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)));
  word(0, 'RIFF'); view.setUint32(4, 36 + size, true); word(8, 'WAVE'); word(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, count, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * count * 2, true); view.setUint16(32, count * 2, true); view.setUint16(34, 16, true);
  word(36, 'data'); view.setUint32(40, size, true);
  for (let i = 0; i < frames; i++) for (let c = 0; c < count; c++) {
    const value = Math.max(-1, Math.min(1, channels[c][i])); view.setInt16(44 + (i * count + c) * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
  }
  return new Uint8Array(result);
}
export function reverseChannels(channels) { return channels.map(channel => Float32Array.from(channel).reverse()); }
export function morseAudio(text, wpm = 18, frequency = 600, sampleRate = 22050) {
  if (!Number.isFinite(wpm) || wpm < 5 || wpm > 50 || !text.trim() || text.length > 200) throw new Error('请输入 1–200 个字符，速度为 5–50 WPM。');
  const code = morseEncode(text), dot = 1.2 / wpm, segments = [];
  code.split(' / ').forEach((word, wi, words) => {
    word.split(' ').forEach((letter, li, letters) => {
      Array.from(letter).forEach((symbol, si) => { segments.push([true, symbol === '.' ? 1 : 3]); if (si < letter.length - 1) segments.push([false, 1]); });
      if (li < letters.length - 1) segments.push([false, 3]);
    });
    if (wi < words.length - 1) segments.push([false, 7]);
  });
  const length = segments.reduce((sum, [, units]) => sum + Math.round(units * dot * sampleRate), 0);
  const samples = new Float32Array(length); let offset = 0;
  for (const [sound, units] of segments) {
    const count = Math.round(units * dot * sampleRate);
    if (sound) for (let i = 0; i < count; i++) { const ramp = Math.min(1, i / 80, (count - 1 - i) / 80); samples[offset + i] = 0.5 * ramp * Math.sin(2 * Math.PI * frequency * i / sampleRate); }
    offset += count;
  }
  return wavEncode([samples], sampleRate);
}
export function spectrogram(samples, sampleRate, { fftSize = 2048, width = 900, height = 256, minHz = 0, maxHz = sampleRate / 2, floor = -85 } = {}) {
  if (![512, 1024, 2048, 4096, 8192].includes(fftSize)) throw new Error('FFT 大小无效。');
  if (!Number.isFinite(minHz) || !Number.isFinite(maxHz) || minHz < 0 || minHz >= maxHz || maxHz > sampleRate / 2) throw new Error('频率范围需要满足 0 ≤ 下限 < 上限 ≤ 采样率的一半。');
  const fft = new FFT(fftSize), input = new Float64Array(fftSize), output = fft.createComplexArray();
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let x = 0; x < width; x++) {
    const offset = Math.floor(x / Math.max(1, width - 1) * Math.max(0, samples.length - fftSize));
    for (let i = 0; i < fftSize; i++) input[i] = (samples[offset + i] || 0) * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (fftSize - 1)));
    fft.realTransform(output, input);
    for (let y = 0; y < height; y++) {
      const freq = maxHz - y / (height - 1) * (maxHz - minHz), bin = Math.min(fftSize / 2 - 1, Math.round(freq * fftSize / sampleRate));
      const magnitude = Math.hypot(output[bin * 2], output[bin * 2 + 1]) / (fftSize / 4);
      const db = 20 * Math.log10(Math.max(magnitude, 1e-9)), value = Math.max(0, Math.min(1, (db - floor) / -floor));
      const index = (y * width + x) * 4;
      pixels[index] = 9 + 245 * Math.pow(value, 1.9); pixels[index + 1] = 16 + 204 * Math.pow(value, 1.2); pixels[index + 2] = 22 + 96 * value; pixels[index + 3] = 255;
    }
  }
  return { pixels, width, height };
}
export function detectDTMF(samples, sampleRate) {
  const frequencies = [697, 770, 852, 941, 1209, 1336, 1477, 1633], keys = ['123A', '456B', '789C', '*0#D'];
  const window = Math.round(sampleRate * 0.03), events = []; let current = null, run = 0, last = null;
  for (let offset = 0; offset + window <= samples.length; offset += window) {
    let energy = 0; for (let i = 0; i < window; i++) energy += samples[offset + i] ** 2;
    let digit = null;
    if (energy / window > 0.0001) {
      const powers = frequencies.map(frequency => {
        const coefficient = 2 * Math.cos(2 * Math.PI * frequency / sampleRate); let s1 = 0, s2 = 0;
        for (let i = 0; i < window; i++) { const s = samples[offset + i] + coefficient * s1 - s2; s2 = s1; s1 = s; }
        return s1 * s1 + s2 * s2 - coefficient * s1 * s2;
      });
      const ranked = start => powers.slice(start, start + 4).map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]);
      const row = ranked(0), col = ranked(4), twist = row[0][0] / Math.max(col[0][0], 1e-12);
      if (row[0][0] > row[1][0] * 4 && col[0][0] > col[1][0] * 4 && twist > 0.15 && twist < 6 && (row[0][0] + col[0][0]) / (energy * window) > 0.2) digit = keys[row[0][1]][col[0][1]];
    }
    if (digit === current) run++; else { current = digit; run = 1; }
    if (!digit) last = null;
    if (digit && run >= 2 && digit !== last) { events.push({ digit, time: Math.max(0, (offset - window) / sampleRate) }); last = digit; }
  }
  return events;
}
