/** Independent ITU dot/dash fixture; never used by the production decoder. */
export function morseFixture(text = 'SOS TEST', { sampleRate = 8000, frequency = 700, speed = 20, noise = 0 } = {}) {
  const code = { S: '...', O: '---', T: '-', E: '.', A: '.-', R: '.-.', G: '--.', C: '-.-.', Q: '--.-', H: '....', L: '.-..', W: '.--', D: '-..', '1': '.----', '2': '..---', '3': '...--' };
  const dot = Math.round(sampleRate * 1.2 / speed);
  const segments = [[0, Math.round(sampleRate * 0.5)]];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ') continue;
    const bits = code[text[i]];
    if (!bits) throw new Error('Unknown fixture character ' + text[i]);
    for (let k = 0; k < bits.length; k++) {
      segments.push([1, dot * (bits[k] === '-' ? 3 : 1)]);
      if (k < bits.length - 1) segments.push([0, dot]);
    }
    if (i < text.length - 1) segments.push([0, dot * (text[i + 1] === ' ' ? 7 : 3)]);
  }
  segments.push([0, dot * 10]);
  const samples = new Float32Array(segments.reduce((n, [, count]) => n + count, 0));
  let offset = 0, random = 321987;
  for (const [on, count] of segments) {
    for (let i = 0; i < count; i++) {
      random ^= random << 13; random ^= random >>> 17; random ^= random << 5;
      samples[offset] = (on ? 0.5 * Math.sin(2 * Math.PI * frequency * offset / sampleRate) : 0) + noise * ((random >>> 0) / 0xffffffff - 0.5);
      offset++;
    }
  }
  return { samples, sampleRate, text };
}
