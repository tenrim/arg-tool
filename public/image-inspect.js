import {element as uiElement} from './ui/index.js';
import {pngChunks} from './media.js';
const scriptPromises = new Map();
function loadScript(url) {
  if (scriptPromises.has(url)) return scriptPromises.get(url);
  const promise = new Promise((resolve, reject) => {
    const script = uiElement('script'); script.src = url; script.async = true;
    const failed = message => { clearTimeout(timer); script.remove(); scriptPromises.delete(url); reject(new Error(message)); };
    const timer = setTimeout(() => failed('分析组件下载超时，请检查网络后重试'), 45000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => failed('分析组件下载失败，请检查网络后重试');
    document.head.append(script);
  });
  scriptPromises.set(url, promise); return promise;
}
export class ImageInspector {
  constructor() { this.sequence = 0; }
  cancel() { this.sequence++; }
  async run(kind, image, {source = 'original', canvas, progress = () => {}}) {
    this.cancel(); const sequence = this.sequence;
    const active = () => sequence === this.sequence;
    const check = () => { if (!active()) throw new Error('任务已取消'); };
    if (kind === 'png') {
      const chunks = pngChunks(new Uint8Array(await image.file.arrayBuffer())); check();
      return {text: chunks.length ? JSON.stringify(chunks, null, 2) : '此文件不是 PNG。', label: 'PNG 数据块'};
    }
    if (kind === 'qr') {
      progress('正在识别二维码…');
      await loadScript(new URL('./vendor/jsqr.js', import.meta.url).href); check();
      const pixels = source === 'view' ? canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data : image.pixels;
      const result = window.jsQR(pixels, source === 'view' ? canvas.width : image.width, source === 'view' ? canvas.height : image.height, {inversionAttempts: 'attemptBoth'}); check();
      return {text: result ? result.data : '没有检测到可识别的二维码。可尝试调整对比度、反色后选择当前视图重新识别。', label: '二维码', found: !!result};
    }
    if (kind === 'exif') {
      progress('正在准备元数据组件…');
      await loadScript(new URL('./vendor/exifr.js',import.meta.url).href); check();
      const data = await window.exifr.parse(image.file, {tiff: true, exif: true, gps: true, xmp: true, iptc: true}); check();
      return {text: data ? JSON.stringify(data, null, 2) : '没有读取到支持的 EXIF / XMP / IPTC 元数据。', label: 'EXIF / XMP / IPTC 元数据'};
    }
    throw new Error('未知图片分析方式');
  }
}
