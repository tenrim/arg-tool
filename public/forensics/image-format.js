export function rasterFormat(bytes) {
  const starts = (...prefix) => prefix.every((value, i) => bytes[i] === value);
  const ascii = (offset, length) => String.fromCharCode(...bytes.subarray(offset, offset + length));
  if (starts(137, 80, 78, 71, 13, 10, 26, 10)) return 'png';
  if (starts(255, 216, 255)) return 'jpeg';
  if (['GIF87a', 'GIF89a'].includes(ascii(0, 6))) return 'gif';
  if (ascii(0, 2) === 'BM') return 'bmp';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'webp';
  if (starts(73, 73, 42, 0) || starts(77, 77, 0, 42)) return 'tiff';
  return '';
}
