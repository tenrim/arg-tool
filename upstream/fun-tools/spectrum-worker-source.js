// SPDX-License-Identifier: GPL-3.0-only
// Adapter for HK-SHAO/atools; complete corresponding source shipped with this worker.
import { startKernel } from './spectrum/source/app/lib/dsp.ts';
import { encode, synthesise, fitEncode, cutoffOf } from './spectrum/source/app/lib/spectrum.ts';
import { spectrumToPng, imageToSpectrum } from './spectrum/source/app/lib/image.ts';
import { resample } from './spectrum/source/app/lib/resample.ts';
import { wavFile } from './spectrum/source/app/lib/wav.ts';
import { audit } from './spectrum/source/app/lib/audit.ts';
import { downloadName } from './spectrum/source/app/lib/container.ts';

self.onmessage = async ({ data }) => {
  try {
    await startKernel({ fft: true });
    const progress = value => self.postMessage({ progress: Math.round(value * 100) + '%' });
    if (data.action === 'audit') {
      const rows = await audit(data.reference, data.spec, data.png, data.name, () => true, progress, data.pcm);
      self.postMessage({ result: { rows } });
      return;
    }
    let spec, reference, notes = [], sr;
    if (data.action === 'encode') {
      const input = data.pcm;
      sr = data.sr;
      const p = data.options;
      if(p.sr>sr)throw Error('音频编码仅支持保留原采样率或降采样，请降低目标采样率。');
      if(p.fmax>(p.sr||sr)/2)throw Error('频带上限不能超过目标采样率的一半。');
      const start = Math.round(p.start * sr), end = p.end > 0 ? Math.round(p.end * sr) : input.length;
      if (start < 0 || start >= end || end > input.length) throw Error('截取时间超出音频范围。');
      const slice = input.slice(start, end);
      const fitted = fitEncode({ ...p, start: 0, end: 0 }, sr, slice.length);
      // Preserve all samples: if the upstream fit would truncate, refuse instead.
      const enc = fitted.enc || fitted;
      if (enc.end > 0 && enc.end < slice.length / sr) throw Error('图片容量不足以保存完整音频，请显式缩短时间范围。');
      const rate = enc.sr || sr;
      reference = resample(slice, sr, rate, cutoffOf(enc));
      if (reference.length > 8_000_000) throw Error('当前参数超出完整音频容量，请显式选择时间范围或降低采样率。');
      spec = await encode(reference, rate, enc, () => true, progress);
      if (spec.meta.samples !== reference.length) throw Error('当前参数无法容纳完整音频，请调整参数。');
      if (rate !== sr) notes.push(`已重采样至 ${rate} Hz。`);
    } else if (data.action === 'decode') {
      const read = await imageToSpectrum(data.file, data.name);
      spec = read.spec;
      const labels={exact:'完整相位',compact:'紧凑幅度谱',degraded:'相位受损，按降级规则恢复',foreign:'普通图片，按幅度谱解释'};
      notes.push(`读取方式：${labels[read.mode]||read.mode}；图片格式：${read.container}；原尺寸：${read.width}×${read.height}。`);
      if(read.phaseReliability!==null)notes.push(`相位可靠度：${(read.phaseReliability*100).toFixed(1)}%。`);
      if(read.guessed)notes.push('部分参数由图片和文件名推断，不保证是原音频参数。');
      if (data.options.sr) spec.meta.sr = data.options.sr;
    } else if (data.action === 'refine') {spec = data.spec; reference = data.reference;}
    else throw Error('未知声音图片操作。');
    const pcm = await synthesise(spec, () => true, progress, data.options.fine ? 'fine' : 'fast');
    const png = await spectrumToPng(spec);
    self.postMessage({ result: { spec, pcm, reference, png, wav: new Blob([wavFile(pcm, spec.meta.sr)], { type: 'audio/wav' }), name: downloadName(data.name || 'spectrum', spec.meta), sr: spec.meta.sr, notes } });
  } catch (error) { self.postMessage({ error: error.message }); }
};
