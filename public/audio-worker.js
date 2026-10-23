import { spectrogram, detectDTMF, wavEncode } from './media.js';
self.onmessage = async ({ data }) => {
  try {
    if(data.action==='score-audio'){
      const {scorePCM}=await import('./expansion/score-core.js');const audio=scorePCM(data.score);self.postMessage({result:{wav:wavEncode([audio.samples],audio.sampleRate)}});return;
    }
    if(data.action==='morse-decode'||data.action==='morse-encode'){
      const {decodeMorse,encodeMorse}=await import('./expansion/morse-engine.js');
      const hooks={resourceBase:data.resourceBase,timeoutMs:data.timeoutMs||30000,onProgress:p=>self.postMessage({kind:'progress',...p})};
      const result=data.action==='morse-decode'?await decodeMorse(data.samples,data.sampleRate,data.options,hooks):await encodeMorse(data.text,data.options,hooks);
      self.postMessage({result});return;
    }
    if (data.action === 'dtmf') self.postMessage({ events: detectDTMF(data.samples, data.sampleRate) });
    else { const result = spectrogram(data.samples, data.sampleRate, data.options); self.postMessage(result, [result.pixels.buffer]); }
  } catch (error) { self.postMessage({ error: error.message }); }
};
