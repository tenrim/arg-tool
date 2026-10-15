import { spectrogram, detectDTMF } from './media.js';
self.onmessage = ({ data }) => {
  try {
    if (data.action === 'dtmf') self.postMessage({ events: detectDTMF(data.samples, data.sampleRate) });
    else { const result = spectrogram(data.samples, data.sampleRate, data.options); self.postMessage(result, [result.pixels.buffer]); }
  } catch (error) { self.postMessage({ error: error.message }); }
};
