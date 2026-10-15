// PngToy scans its entire input as chunks, including bytes after IEND, and its
// XHR callback cannot reject out-of-bounds reads. Validate framing before that
// boundary and give it only the PNG stream. The caller retains the original File.
export function pngImageBytes(bytes) {
  const signature = [137,80,78,71,13,10,26,10];
  if (!signature.every((byte, i) => bytes[i] === byte)) throw Error('PNG 文件签名不完整或无效');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8, count = 0;
  while (offset < bytes.length) {
    if (bytes.length - offset < 12) throw Error('PNG 数据块不完整');
    const length = view.getUint32(offset), type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    if (length > 0x7fffffff || length > bytes.length - offset - 12) throw Error('PNG 数据块声明的长度超过文件边界');
    if (++count > 10000) throw Error('PNG 数据块数量过多');
    if (count === 1) {
      if (type !== 'IHDR' || length !== 13) throw Error('PNG 图片头无效');
      const width = view.getUint32(offset + 8), height = view.getUint32(offset + 12);
      if (!width || !height || width * height > 8_000_000) throw Error('图片超过 8 百万像素或尺寸无效');
    }
    offset += length + 12;
    if (type === 'IEND') {
      if (length !== 0) throw Error('PNG 结束数据块无效');
      return bytes.subarray(0, offset);
    }
  }
  throw Error('PNG 文件缺少完整的 IEND 结束数据块');
}
