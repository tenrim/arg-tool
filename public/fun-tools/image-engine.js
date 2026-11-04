import { gilbert2d } from '../vendor/fun-tools/gilbert.js';

function validate(image, limit = 16_000_000) {
  const { width, height, data } = image;
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width * height > limit ||
    data.length !== width * height * 4
  )
    throw Error('图片尺寸或像素数据无效，最多 1600 万像素。');
}
export function cropPixels(image, rect) {
  validate(image);
  if (!rect) return image;
  const { x, y, width, height } = rect;
  if (
    ![x, y, width, height].every(Number.isInteger) ||
    x < 0 ||
    y < 0 ||
    width < 1 ||
    height < 1 ||
    x + width > image.width ||
    y + height > image.height
  )
    throw Error('裁剪区域必须完整位于原图内，且宽高至少为 1 像素。');
  const data = new Uint8ClampedArray(width * height * 4);
  for (let row = 0; row < height; row++) {
    const start = ((y + row) * image.width + x) * 4;
    data.set(image.data.subarray(start, start + width * 4), row * width * 4);
  }
  return { width, height, data };
}
export function scramble(image, reverse = false) {
  validate(image);
  const { width, height, data } = image;
  const count = width * height,
    curve = gilbert2d(width, height);
  const offset = Math.round(((Math.sqrt(5) - 1) / 2) * count);
  const output = new Uint8ClampedArray(data.length);
  for (let i = 0; i < count; i++) {
    const a = curve[i],
      b = curve[(i + offset) % count];
    const from = (a[1] * width + a[0]) * 4,
      to = (b[1] * width + b[0]) * 4;
    output.set(data.subarray(reverse ? to : from, (reverse ? to : from) + 4), reverse ? from : to);
  }
  return { width, height, data: output };
}
// Naor–Shamir (2,2): uniformly select one of the six 2-black/2-clear cells.
// White secret pixels share the same pattern; black pixels use complementary patterns.
export function visualShares(image, threshold = 128, scale = 1) {
  validate(image);
  if (
    !Number.isInteger(scale) ||
    scale < 1 ||
    scale > 8 ||
    !Number.isFinite(threshold) ||
    threshold < 0 ||
    threshold > 255
  )
    throw Error('阈值或像素尺寸无效。');
  const width = image.width * 2 * scale,
    height = image.height * 2 * scale;
  if (width * height > 16_000_000) throw Error('分片超过 1600 万像素，请减小输入或像素尺寸。');
  const a = new Uint8ClampedArray(width * height * 4),
    b = new Uint8ClampedArray(a.length);
  const patterns = [3, 5, 6, 9, 10, 12];
  const random = new Uint8Array(65536);
  let ri = random.length;
  const choice = () => {
    let n;
    do {
      if (ri === random.length) {
        crypto.getRandomValues(random);
        ri = 0;
      }
      n = random[ri++];
    } while (n >= 252);
    return patterns[n % 6];
  };
  for (let y = 0; y < image.height; y++)
    for (let x = 0; x < image.width; x++) {
      const at = (y * image.width + x) * 4,
        alpha = image.data[at + 3] / 255;
      const light =
        (0.299 * image.data[at] + 0.587 * image.data[at + 1] + 0.114 * image.data[at + 2]) * alpha +
        255 * (1 - alpha);
      const mask = choice(),
        other = light < threshold ? mask ^ 15 : mask;
      for (let cell = 0; cell < 4; cell++)
        for (let yy = 0; yy < scale; yy++)
          for (let xx = 0; xx < scale; xx++) {
            const p =
              (((y * 2 + (cell >> 1)) * scale + yy) * width + (x * 2 + (cell % 2)) * scale + xx) *
              4;
            a[p + 3] = ((mask >> cell) & 1) * 255;
            b[p + 3] = ((other >> cell) & 1) * 255;
          }
    }
  return [
    { width, height, data: a },
    { width, height, data: b },
  ];
}
// HideInfo hide_as_img.py and utils.py: 4-byte BE length followed by payload.
export function fileToPixels(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length > 32 * 1024 * 1024)
    throw Error('文件最多 32 MB。');
  const size = Math.ceil(Math.sqrt((bytes.length + 4) / 3));
  const packed = new Uint8Array(size * size * 3);
  new DataView(packed.buffer).setUint32(0, bytes.length);
  packed.set(bytes, 4);
  const data = new Uint8ClampedArray(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    data.set(packed.subarray(i * 3, i * 3 + 3), i * 4);
    data[i * 4 + 3] = 255;
  }
  return { width: size, height: size, data };
}
export function pixelsToFile(image) {
  validate(image);
  const bytes = new Uint8Array(image.width * image.height * 3);
  for (let i = 0; i < image.width * image.height; i++) {
    if (image.data[i * 4 + 3] !== 255) throw Error('化物为图需要完整不透明的 RGB 图片。');
    bytes.set(image.data.subarray(i * 4, i * 4 + 3), i * 3);
  }
  if (bytes.length < 4) throw Error('缺少文件长度。');
  const length = new DataView(bytes.buffer).getUint32(0);
  if (length > bytes.length - 4 || length > 32 * 1024 * 1024)
    throw Error('声明长度超出图片容量，图片可能已损坏。');
  return bytes.slice(4, 4 + length);
}
