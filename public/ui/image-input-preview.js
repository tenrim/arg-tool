import { create, onDisconnect } from './core.js';
import { rasterFormat } from '../forensics/image-format.js';

export function ImageInputPreview() {
  const node = create('image-input-preview', 'div', { hidden: true });
  let selected,
    revision = 0,
    url;

  function release() {
    if (url) URL.revokeObjectURL(url);
    url = undefined;
  }
  async function show(file) {
    if (file === selected) return;
    selected = file;
    const current = ++revision;
    node.replaceChildren();
    node.hidden = true;
    release();
    if (!file) return;
    const namedImage =
      file.type.startsWith('image/') ||
      /\.(png|apng|jpe?g|bmp|gif|webp|tiff?|avif|ico|svg|heic|heif)$/i.test(file.name);
    let recognized = false;
    function unavailable() {
      if (current !== revision) return;
      release();
      node.textContent = '这张图片暂时无法预览。';
      node.hidden = false;
    }
    try {
      const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
      if (current !== revision) return;
      let format = rasterFormat(header);
      if (!format && /^ftyp(?:avif|avis)$/.test(String.fromCharCode(...header.subarray(4, 12))))
        format = 'avif';
      if (!format && header[0] === 0 && header[1] === 0 && header[2] === 1 && header[3] === 0)
        format = 'x-icon';
      if (!format) {
        if (namedImage) unavailable();
        return;
      }
      recognized = true;
      const img = create('original-image', 'img', {
        attrs: { alt: '所选原图：' + file.name, decoding: 'async' },
        on: {
          load: () => {
            if (current === revision) node.hidden = false;
          },
          error: unavailable,
        },
      });
      url = URL.createObjectURL(file.slice(0, file.size, 'image/' + format));
      node.append(img);
      img.src = url;
    } catch {
      if (recognized || namedImage) unavailable();
    }
  }
  onDisconnect(node, () => show(null));
  return { node, show };
}
