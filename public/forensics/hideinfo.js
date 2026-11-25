import { pixelsToFile } from '../fun-tools/image-engine.js';
export function inspectHideInfo(image) {
  const { width, height, data } = image;
  if (width !== height || width < 2 || data.length !== width * height * 4) return null;
  const length = data[0] * 0x1000000 + data[1] * 0x10000 + data[2] * 0x100 + data[4];
  if (!length || Math.ceil(Math.sqrt((length + 4) / 3)) !== width) return null;
  for (let p = 3; p < data.length; p += 4) if (data[p] !== 255) return null;
  for (let i = length + 4; i < width * height * 3; i++)
    if (data[i + Math.floor(i / 3)] !== 0) return null;
  return pixelsToFile(image);
}
