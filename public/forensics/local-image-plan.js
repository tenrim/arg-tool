const barcode = { engine: 'barcode', title: '二维码与条形码识别', target: 'native:image-barcode' };
const animation = {
  engine: 'animation',
  title: '动图拆帧与帧延迟',
  target: 'native:video-animation',
};
const hideInfo = { engine: 'hideinfo', title: '化物为图隐藏文件', target: 'native:file-image' };

function animatedPNG(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 8; i + 12 <= bytes.length;) {
    const size = view.getUint32(i);
    if (size > bytes.length - i - 12) return false;
    const type = view.getUint32(i + 4);
    if (type === 0x6163544c) return size === 8; // acTL precedes the first IDAT
    if (type === 0x49444154 || type === 0x49454e44) return false;
    i += size + 12;
  }
  return false;
}
export function localImagePlan(format, bytes) {
  const steps = [barcode];
  if (format === 'gif' || (format === 'png' && animatedPNG(bytes))) steps.push(animation);
  if (format === 'png' || format === 'bmp') steps.push(hideInfo);
  return steps;
}
