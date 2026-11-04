/* Classic worker keeps original UMD dependencies intact and isolated. */
self.onmessage = async ({ data }) => {
  try {
    let result;
    if (data.kind === 'qr') {
      importScripts('../vendor/fun-tools/qrcode.js');
      const qr = self.QRCode.create(data.packet, { errorCorrectionLevel: 'L' });
      const scale = 6,
        width = (qr.modules.size + 8) * scale,
        pixels = new Uint8ClampedArray(width * width * 4).fill(255);
      for (let y = 0; y < qr.modules.size; y++)
        for (let x = 0; x < qr.modules.size; x++)
          if (qr.modules.get(y, x)) {
            for (let yy = 0; yy < scale; yy++)
              for (let xx = 0; xx < scale; xx++) {
                const i = (((y + 4) * scale + yy) * width + (x + 4) * scale + xx) * 4;
                pixels[i] = pixels[i + 1] = pixels[i + 2] = 0;
              }
          }
      result = { width, height: width, data: pixels };
    } else if (data.kind === 'scan') {
      importScripts('../vendor/jsqr.js');
      const code = self.jsQR(data.image.data, data.image.width, data.image.height, {
        inversionAttempts: 'attemptBoth',
      });
      result = code?.data || null;
    } else if (data.kind === 'transfer') {
      const { prepareTransfer } = await import('./screen-model.js');
      result = await prepareTransfer(data.bytes, data.name, data.capacity);
    } else if (data.kind === 'text') {
      if (data.task === 'text-steganography' && data.options.engine === 'stegcloak')
        importScripts('../vendor/fun-tools/stegcloak.min.js');
      if (data.task === 'buddha-codec') importScripts('../vendor/fun-tools/crypto-js.js');
      const { textTransform } = await import('./text-engine.js');
      result = textTransform(data.task, data.text, data.options);
    } else if (data.kind === 'views') {
      const { spectrogram } = await import('../media.js');
      result = [null, data.range].map((range) =>
        spectrogram(data.pcm, data.sr, {
          fftSize: 2048,
          width: 640,
          height: 180,
          ...(range ? { minHz: range[0], maxHz: range[1] } : {}),
        }),
      );
    } else if (data.kind === 'trace') {
      const { cropPixels } = await import('./image-engine.js');
      data.image = cropPixels(data.image, data.crop);
      const { generatePCM, toBasicModeConfig } =
        await import('../vendor/fun-tools/spectrotrace.js');
      const gray = Float32Array.from({ length: data.image.width * data.image.height }, (_, i) => {
        const p = i * 4;
        return (
          (0.299 * data.image.data[p] +
            0.587 * data.image.data[p + 1] +
            0.114 * data.image.data[p + 2]) /
          255
        );
      });
      const pcm = generatePCM(
        { data: gray, width: data.image.width, height: data.image.height },
        toBasicModeConfig(data.options),
        { onProgress: (p) => self.postMessage({ progress: Math.round(p) + '%' }) },
      );
      const { wavEncode } = await import('../media.js');
      result = {
        pcm,
        sr: data.options.sampleRate,
        range: [data.options.minFreq, data.options.maxFreq],
        wav: new Blob([wavEncode([pcm], data.options.sampleRate)], { type: 'audio/wav' }),
      };
    } else {
      const engine = await import('./image-engine.js');
      if (data.kind === 'scramble') result = engine.scramble(data.image, data.reverse);
      else if (data.kind === 'shares')
        result = engine.visualShares(data.image, data.threshold, data.scale);
      else if (data.kind === 'pack') result = engine.fileToPixels(data.bytes);
      else if (data.kind === 'unpack') result = engine.pixelsToFile(data.image);
      else throw Error('未知任务。');
    }
    self.postMessage({ result });
  } catch (error) {
    self.postMessage({ error: error.message || String(error) });
  }
};
