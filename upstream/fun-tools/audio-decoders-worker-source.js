// Separate codec processes keep synchronous decoder work off the UI thread.
const decoders = {
  amr: () => import('@audio/decode-amr'),
  flac: () => import('@audio/decode-flac'),
  mp3: () => import('@audio/decode-mp3'),
  opus: () => import('@audio/decode-opus'),
  vorbis: () => import('@audio/decode-vorbis'),
  wav: () => import('@audio/decode-wav'),
};
self.onmessage = async ({ data }) => {
  try {
    if (!decoders[data.engine]) throw Error('未知音频解码器');
    self.postMessage({ result: await (await decoders[data.engine]()).default(data.bytes) });
  } catch (error) { self.postMessage({ error: error.message }); }
};
