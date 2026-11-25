import { inspectHideInfo } from './hideinfo.js';
self.onmessage = async ({ data: { engine, file } }) => {
  try {
    const bitmap = await createImageBitmap(file, {
      colorSpaceConversion: 'none',
      premultiplyAlpha: 'none',
    });
    let pixels;
    try {
      const { width, height } = bitmap;
      if (width * height > 16000000) throw Error('原图超过本地像素检查的 1600 万像素上限。');
      const ctx = new OffscreenCanvas(width, height).getContext('2d', { willReadFrequently: true });
      ctx.drawImage(bitmap, 0, 0);
      pixels = ctx.getImageData(0, 0, width, height);
    } finally {
      bitmap.close();
    }
    let report,
      items = [];
    if (engine === 'barcode') {
      const { scanBarcodes } = await import('../barcode-reader.js');
      const rows = await scanBarcodes(pixels, { textMode: 'Plain' });
      report = {
        status: 'ok',
        output: rows.length
          ? rows.map((r) => r.format + '\n' + r.text).join('\n\n')
          : '未检测到条码或二维码。',
        symbols: rows.map((r) => ({ format: r.format, text: r.text })),
      };
    } else {
      const bytes = inspectHideInfo(pixels);
      report = { status: 'ok', output: '未检测到 HideInfo 结构。' };
      if (bytes) {
        items = [{ name: '还原文件.bin', bytes }];
        const head = Array.from(bytes.subarray(0, 32), (b) => b.toString(16).padStart(2, '0')).join(
          ' ',
        );
        report = {
          status: 'ok',
          output: '检测到 HideInfo 结构。',
          字节数: bytes.length,
          文件头: head,
        };
        try {
          const sample = bytes.subarray(0, 256);
          const text = new TextDecoder('utf-8', { fatal: true }).decode(sample, {
            stream: bytes.length > sample.length,
          });
          if (text && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text))
            report['UTF-8 摘要'] = text;
        } catch {
          /* A binary payload still has a byte-exact download. */
        }
      }
    }
    self.postMessage(
      { report, items },
      items.map((item) => item.bytes.buffer),
    );
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
