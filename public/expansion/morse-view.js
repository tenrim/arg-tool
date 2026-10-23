import { Box, Button, CheckGroup, ConversionWorkbench, DataList, Field, FilePicker,
  FormGrid, Input, Option, Select, Table, Textarea, ToolHeader, ToolPanel, Toolbar,
  disclosureController, onDisconnect, setState, setTextareaValue, updateStatus } from '../ui/index.js';
import { notebookActions } from '../handoff/button.js';
import { wavEncode } from '../media.js';
import { saveFile, startWorkerJob } from './session.js';
import { MORSE_ALPHABET, MORSE_DEFAULTS, MORSE_LIMITS, validateMorseAlphabet } from './morse-engine.js';

const number = (id, value, min, max, step = 1) => Input({ id, type: 'number', value, attrs: { min, max, step } });
const player = id => Box({ tag: 'audio', id, className: 'expansion-morse-player', attrs: { controls: true, preload: 'metadata' } });
const plot = (id, label) => Box({ tag: 'canvas', id, className: 'expansion-morse-plot', attrs: { width: 1000, height: 280, role: 'img', 'aria-label': label } });

function parseAlphabet(value) {
  if (!value.trim()) return [];
  return validateMorseAlphabet(value.split(/\r?\n/).filter(line => line.trim()).map((line, i) => {
    const match = line.trim().replaceAll('−', '-').replaceAll('—', '-').match(/^([.01-]{1,16})\s+([!-~])$/);
    if (!match) throw Error(`字母表第 ${i + 1} 行应为“点划序列 空格 单个 ASCII 字符”。`);
    return [match[1], match[2]];
  }));
}

function colors(canvas) {
  const style = getComputedStyle(canvas);
  return { line: style.getPropertyValue('--cyan').trim() || '#35c9f3', grid: style.getPropertyValue('--muted').trim() || '#718399', accent: style.getPropertyValue('--amber').trim() || '#ffb000' };
}
function canvasContext(canvas) {
  const bounds = canvas.getBoundingClientRect(), ratio = Math.max(1, devicePixelRatio || 1);
  const width = Math.max(240, bounds.width || 600), height = Math.max(140, bounds.height || width / 3);
  const pixelsWide = Math.round(width * ratio), pixelsHigh = Math.round(height * ratio);
  if (canvas.width !== pixelsWide) canvas.width = pixelsWide;
  if (canvas.height !== pixelsHigh) canvas.height = pixelsHigh;
  const ctx = canvas.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width, height };
}
function linePlot(canvas, samples, { seconds = 0, label = '', unipolar = false } = {}) {
  const { ctx, width, height } = canvasContext(canvas), color = colors(canvas);
  ctx.clearRect(0, 0, width, height);
  const left = 48, top = 22, right = width - 16, bottom = height - 30, range = right - left;
  ctx.strokeStyle = color.grid; ctx.globalAlpha = 0.3; ctx.beginPath();
  ctx.moveTo(left, top); ctx.lineTo(left, bottom); ctx.lineTo(right, bottom); ctx.stroke(); ctx.globalAlpha = 1;
  if (samples?.length) {
    let peak = 1e-9; for (const x of samples) peak = Math.max(peak, Math.abs(x));
    ctx.strokeStyle = color.line; ctx.beginPath();
    for (let px = 0; px < range; px++) {
      const from = Math.floor(px * samples.length / range), to = Math.max(from + 1, Math.floor((px + 1) * samples.length / range));
      let min = Infinity, max = -Infinity;
      for (let k = from; k < Math.min(samples.length, to); k++) { min = Math.min(min, samples[k]); max = Math.max(max, samples[k]); }
      const y = v => unipolar ? bottom - (v / peak) * (bottom - top) : (top + bottom) / 2 - (v / peak) * (bottom - top) / 2;
      ctx.moveTo(left + px, y(min)); ctx.lineTo(left + px, y(max));
    }
    ctx.stroke();
  }
  ctx.fillStyle = color.grid; ctx.font = '16px sans-serif'; ctx.fillText(label, left + 8, top); ctx.fillText('0 s', left, height - 6); ctx.fillText(`${seconds.toFixed(2)} s`, right - 80, height - 6);
}
function spectrumPlot(canvas, spectrum) {
  const { ctx, width, height } = canvasContext(canvas); ctx.clearRect(0, 0, width, height);
  const { values, rows, columns, sampleRate } = spectrum;
  const half = columns / 2, image = ctx.createImageData(rows, half);
  let peak = 1e-20; for (const n of values) if (Number.isFinite(n)) peak = Math.max(peak, n);
  for (let x = 0; x < rows; x++) for (let bin = 0; bin < half; bin++) {
    const strength = Math.max(0, Math.min(1, (20 * Math.log10(Math.max(1e-20, values[x * columns + bin]) / peak) + 70) / 70));
    const offset = ((half - bin - 1) * rows + x) * 4;
    image.data[offset] = Math.round(15 + strength * 35); image.data[offset + 1] = Math.round(25 + strength * 185);
    image.data[offset + 2] = Math.round(40 + strength * 210); image.data[offset + 3] = 255;
  }
  // A canvas component holds the real STFFT pixel matrix before scaling it.
  const source = Box({ tag: 'canvas', attrs: { width: rows, height: half } });
  source.getContext('2d').putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = false; ctx.drawImage(source, 48, 22, width - 64, height - 52);
  const color = colors(canvas); ctx.fillStyle = color.grid; ctx.font = '16px sans-serif';
  ctx.fillText(`${sampleRate / 2} Hz`, 3, 18); ctx.fillText('0 Hz', 3, height - 27);
  ctx.fillText('原生 STFFT', 55, height - 6);
}

/** Host injects current audio ownership; this view never reads another tool's DOM. */
export function mountMorse({ host, getAudio = () => null, loadAudioFile } = {}) {
  const direction = Select({ id: 'morse-direction', children: [Option('音频 → 文字', 'decode'), Option('文字 → 摩斯音频', 'encode')] });
  const frequency = number('morse-frequency', 0, 0, 1900), speed = number('morse-speed', 0, 0, 55);
  const rangeMin = number('morse-range-min', MORSE_DEFAULTS.frequencyRangeMin_hz, 40, 1900), rangeMax = number('morse-range-max', MORSE_DEFAULTS.frequencyRangeMax_hz, 40, 1900);
  const high = Input({ id: 'morse-high-pass', type: 'checkbox', attrs: { checked: true } }), low = Input({ id: 'morse-low-pass', type: 'checkbox', attrs: { checked: true } });
  const encodeFrequency = number('morse-encode-frequency', MORSE_DEFAULTS.encodeFrequency_hz, 40, 1900);
  const charSpeed = number('morse-character-speed', 25, 5, 55), gapSpeed = number('morse-farnsworth-speed', 25, 5, 55), volume = number('morse-volume', 10, 0, 99);
  const rate = Select({ id: 'morse-sample-rate', children: [8000, 16000, 22050, 44100, 48000].map(n => Option(`${n} Hz`, String(n), n === 16000, n === 16000)) });
  const decodeFields = FormGrid({ minColumnWidth: '170px', children: [Field({ label: '音调 Hz（0 自动）', control: frequency }), Field({ label: '速度 WPM（0 自动）', control: speed }),
    Field({ label: '自动音调下限 Hz', control: rangeMin }), Field({ label: '自动音调上限 Hz', control: rangeMax }),
    CheckGroup({ label: '识别滤波', children: [Field({ label: '高通滤波', control: high }), Field({ label: '低通滤波', control: low })] })] });
  const encodeFields = FormGrid({ minColumnWidth: '150px', hidden: true, children: [Field({ label: '音调 Hz', control: encodeFrequency }), Field({ label: '字符速度 WPM', control: charSpeed }),
    Field({ label: 'Farnsworth 间隔 WPM', control: gapSpeed }), Field({ label: '音量 %', control: volume }), Field({ label: '输出采样率', control: rate })] });
  const alphabet = Textarea({ id: 'morse-alphabet', autoSize: true, minRows: 2, maxRows: 6, placeholder: '.- A\n-... B', attrs: { spellcheck: 'false', maxlength: 5000 } });
  const alphabetButton = Button({ id: 'morse-alphabet-toggle', text: '自定义摩斯字母表' });
  const alphabetBody = Box({ id: 'morse-alphabet-body', hidden: true, children: [Field({ label: '每行：点划序列 空格 ASCII 字符', control: alphabet, span: 'full' }),
    Table({ caption: '内置 54 个字符（自定义映射会覆盖同序列或同字符）', columns: ['字符', '点划序列'], rows: Object.entries(MORSE_ALPHABET).map(([bits, char]) => [char, bits.replaceAll('0', '.').replaceAll('1', '-')]) })] });
  const alphabetDisclosure = disclosureController(alphabetButton, alphabetBody);
  const view = ConversionWorkbench({ id: 'morse', inputLabel: '要生成音频的文字', resultLabel: '结果', settings: [Field({ label: '方向', control: direction, span: 'full' }),
    Box({ children: [decodeFields, encodeFields, alphabetButton, alphabetBody], attrs: { 'data-span': 'full' } })] });
  view.input.removeAttribute('maxlength');
  const inputField = view.input.closest('[data-ui="field"]');
  const inputCard = inputField.parentElement;
  const file = Input({ id: 'morse-file', type: 'file', attrs: { accept: 'audio/*,.wav,.mp3,.ogg,.flac,.m4a,.aiff,.webm' } });
  const pick = FilePicker({ input: file, triggerLabel: '选择音频文件' });
  const sourceInfo = Box({ id: 'morse-source-info', text: '尚未载入音频。' });
  const sourcePlayer = player('morse-source-player'); sourcePlayer.hidden = true;
  const sourceWave = plot('morse-source-wave', '当前音频的完整波形预览'); sourceWave.hidden = true;
  const micStart = Button({ id: 'morse-mic-start', text: '麦克风录音' });
  const micStop = Button({ id: 'morse-mic-stop', text: '停止并载入', disabled: true });
  const micCancel = Button({ id: 'morse-mic-cancel', text: '取消录音', disabled: true });
  const micReadout = Box({ id: 'morse-mic-readout', text: '未录音', attrs: { role: 'timer', 'aria-live': 'off', 'aria-label': '麦克风录音状态与时长' } });
  const audioInput = Box({ id: 'morse-audio-input', children: [Field({ label: '当前音频（含已应用变换）', control: pick }),
    Toolbar({ children: [micStart, micStop, micCancel, micReadout] }), sourceInfo, sourcePlayer, sourceWave] });
  inputCard.prepend(audioInput);
  const outputPlayer = player('morse-result-player'); outputPlayer.hidden = true;
  const outputWave = plot('morse-result-wave', '生成摩斯音频的完整波形'); outputWave.hidden = true;
  view.output.closest('[data-ui="field"]').after(outputPlayer, outputWave);
  const diagnosticsSave = Button({ id: 'morse-diagnostics-save', text: '导出诊断 JSON', disabled: true });
  const csvSave = Button({ id: 'morse-timing-save', text: '导出时序 CSV', disabled: true });
  const recording = notebookActions({ id: 'morse', source: 'audio', snapshot: () => lease });
  view.use.before(...recording.buttons, diagnosticsSave, csvSave);
  const panel = ToolPanel({ id: 'panel-morse', className: 'panel expansion-panel', hidden: true,
    header: ToolHeader({ className: 'page-heading', title: '摩斯音频', actions: [] }), body: view.root });
  host?.append(panel);

  let revision = 0, loadRevision = 0, busy = false, controller = null, result = null, lease = null, currentAudio = null;
  let inputURL = null, resultURL = null, dead = false;
  let microphone = null, microphoneRevision = 0;
  const MAX_MICROPHONE_MS = 120000, MAX_MICROPHONE_BYTES = 32 * 1024 * 1024;
  const revoke = which => { const url = which === 'input' ? inputURL : resultURL; if (url) URL.revokeObjectURL(url); if (which === 'input') inputURL = null; else resultURL = null; };
  function stopPlayer(node) { node.pause(); node.removeAttribute('src'); node.load(); node.hidden = true; }
  const sync = () => {
    view.run.textContent = direction.value === 'decode' ? '识别音频' : '生成音频';
    setState(view.run, { busy }); view.run.disabled = busy || Boolean(microphone); view.stop.disabled = !busy;
    micStart.disabled = busy || Boolean(microphone); micStop.disabled = microphone?.phase !== 'recording'; micCancel.disabled = !microphone;
    file.disabled = Boolean(microphone); const fileTrigger = pick.querySelector('button'); if (fileTrigger) fileTrigger.disabled = file.disabled;
    view.use.hidden = true; view.use.disabled = true;
    view.copy.disabled = !result || direction.value !== 'decode'; view.save.disabled = !result;
    diagnosticsSave.disabled = !result; csvSave.disabled = !result || direction.value !== 'decode';
    recording.setEnabled(Boolean(result));
  };
  function invalidate(message = '') {
    revision++; controller?.abort(); controller = null; busy = false; result = null; lease = null;
    stopPlayer(outputPlayer); revoke('result'); outputWave.hidden = true;
    setTextareaValue(view.output, '', { feedback: false }); view.details.replaceChildren(); updateStatus(view.status, message); sync();
  }
  function refreshAudio() {
    currentAudio = getAudio(); stopPlayer(sourcePlayer); revoke('input'); sourceWave.hidden = true;
    if (!currentAudio?.samples?.length) { sourceInfo.textContent = '尚未载入音频。'; return; }
    const { samples, sampleRate } = currentAudio;
    sourceInfo.textContent = `${currentAudio.name || '当前音频'} · ${(samples.length / sampleRate).toFixed(2)} 秒 · ${sampleRate} Hz · ${(samples.byteLength / 1024 / 1024).toFixed(2)} MB PCM`;
    if (samples.byteLength <= MORSE_LIMITS.inputBytes) {
      inputURL = URL.createObjectURL(new Blob([wavEncode([samples], sampleRate)], { type: 'audio/wav' }));
      sourcePlayer.src = inputURL; sourcePlayer.hidden = false; sourceWave.hidden = false;
      linePlot(sourceWave, samples, { seconds: samples.length / sampleRate, label: '当前音频' });
    }
  }
  function changeDirection(value) {
    cancelMicrophone();
    const next = typeof value === 'string' ? value : value?.direction;
    if (next === 'encode' || next === 'decode') direction.value = next;
    invalidate();
    const decode = direction.value === 'decode'; decodeFields.hidden = !decode; audioInput.hidden = !decode;
    encodeFields.hidden = decode; inputField.hidden = decode; view.save.textContent = decode ? '下载文字' : '下载 WAV';
    if (!decode) sourcePlayer.pause();
    sync();
  }
  const readOptions = () => ({ alphabet: parseAlphabet(alphabet.value), ...(direction.value === 'decode' ? {
    frequency_hz: +frequency.value || -1, speed_wpm: +speed.value || -1,
    frequencyRangeMin_hz: +rangeMin.value, frequencyRangeMax_hz: +rangeMax.value,
    applyFilterHighPass: high.checked, applyFilterLowPass: low.checked,
  } : { sampleRate: +rate.value, frequency_hz: +encodeFrequency.value, speedCharacters_wpm: +charSpeed.value,
    speedFarnsworth_wpm: +gapSpeed.value, volume: +volume.value / 100 }) });
  function renderDiagnostics(value) {
    const d = value.diagnostics;
    const metrics = [['时长', `${d.durationSeconds.toFixed(2)} 秒`], ['采样率', `${value.sampleRate ?? d.sampleRate} Hz`], ['总耗时', `${d.elapsedMs.toFixed(0)} ms`]];
    if (value.statistics) {
      const s = value.statistics;
      metrics.push(['估计音调', `${s.estimatedPitch_Hz.toFixed(2)} Hz`], ['估计速度', `${s.estimatedSpeed_wpm.toFixed(2)} WPM`], ['信号阈值比例', s.signalThreshold.toFixed(4)], ['拟合代价', s.costFunction.toFixed(4)],
        ['重采样', `${s.timeResample_ms.toFixed(3)} ms`], ['音调检测', `${s.timePitchDetection_ms.toFixed(3)} ms`], ['Goertzel', `${s.timeGoertzel_ms.toFixed(3)} ms`], ['时序分析', `${s.timeFrameAnalysis_ms.toFixed(3)} ms`]);
    }
    view.details.append(DataList({ items: metrics }));
    if (value.signal?.length) {
      const signal = plot('morse-signal-plot', 'GGMorse 实际输入末尾三秒的 Goertzel 信号');
      const threshold = plot('morse-threshold-plot', 'GGMorse 逐帧阈值比例');
      const spectrum = plot('morse-spectrum-plot', 'GGMorse 实际 STFFT 频谱');
      view.details.append(FormGrid({ minColumnWidth: '280px', children: [Field({ label: 'Goertzel 信号（输入末尾窗口）', control: signal }), Field({ label: '阈值比例（含末尾静音冲洗）', control: threshold }), Field({ label: 'STFFT 频谱（输入末尾窗口）', control: spectrum })] }));
      linePlot(signal, value.signal, { seconds: value.signal.length / 500, unipolar: true, label: '原生 Goertzel 幅度' });
      linePlot(threshold, value.threshold, { seconds: value.threshold.length * d.thresholdStepSeconds, unipolar: true, label: '原生阈值比例' });
      spectrumPlot(spectrum, value.spectrogram);
    }
  }
  async function run() {
    if (microphone) { updateStatus(view.status, '请先停止并载入录音，或取消录音。'); return; }
    invalidate('正在准备本地引擎…'); const version = revision; controller = new AbortController(); busy = true; sync();
    try {
      const options = readOptions(), decoding = direction.value === 'decode';
      if (decoding) refreshAudio();
      if (decoding && !currentAudio?.samples?.length) throw Error('请先选择音频文件。');
      const payload = decoding ? { action: 'morse-decode', samples: currentAudio.samples, sampleRate: currentAudio.sampleRate, options }
        : { action: 'morse-encode', text: view.input.value, options };
      const value = await startWorkerJob(payload, { audio: true, signal: controller.signal, onProgress: p => {
        if (version !== revision) return;
        const s = p.statistics;
        updateStatus(view.status, `正在识别 ${Math.round((p.progress ?? 0) * 100)}%${s ? ` · ${s.estimatedPitch_Hz.toFixed(1)} Hz · ${s.estimatedSpeed_wpm.toFixed(1)} WPM` : ''}`);
      } });
      if (version !== revision) return;
      result = value;
      if (decoding) {
        setTextareaValue(view.output, value.rawText);
        lease = { value: { text: value.rawText, name: '摩斯音频识别.txt' } };
        updateStatus(view.status, value.text ? '已完成识别，请对照原音频核验。' : '已完成分析，未识别出可靠字符。可固定音调和速度后重试。', value.text ? 'success' : '');
      } else {
        const bytes = wavEncode([value.samples], value.sampleRate);
        result.wav = bytes; lease = { value: { bytes, name: '摩斯音频.wav', mime: 'audio/wav' } };
        resultURL = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
        outputPlayer.src = resultURL; outputPlayer.hidden = false; outputWave.hidden = false;
        linePlot(outputWave, value.samples, { seconds: value.samples.length / value.sampleRate, label: '生成波形' });
        setTextareaValue(view.output, `${value.text}\n\n${value.samples.length} 个 PCM 样本 · ${(value.samples.length / value.sampleRate).toFixed(2)} 秒 · ${value.sampleRate} Hz`);
        updateStatus(view.status, '已生成摩斯音频，可试听、下载 WAV 或加入笔记。', 'success');
      }
      renderDiagnostics(value);
    } catch (e) { if (version === revision) { invalidate(); updateStatus(view.status, e.message || String(e), 'error'); } }
    finally { if (version === revision) { busy = false; controller = null; sync(); } }
  }
  function microphoneCurrent(job) {
    return !dead && microphone === job && microphoneRevision === job.revision && direction.value === 'decode' && !panel.hidden;
  }
  function releaseMicrophone(job) {
    clearInterval(job.interval); clearTimeout(job.timeout);
    for (const track of job.stream?.getTracks() ?? []) track.stop();
  }
  function cancelMicrophone(message = '') {
    const job = microphone; microphoneRevision++; microphone = null;
    if (job) {
      job.accept = false; releaseMicrophone(job);
      if (job.recorder) {
        job.recorder.ondataavailable = job.recorder.onstop = job.recorder.onerror = null;
        if (job.recorder.state !== 'inactive') { try { job.recorder.stop(); } catch { /* Already ended by the device. */ } }
      }
      job.chunks.length = 0;
      micReadout.textContent = message || '录音已取消';
    }
    sync();
  }
  async function adoptRecording(job) {
    releaseMicrophone(job);
    if (!microphoneCurrent(job) || !job.accept) return;
    job.phase = 'loading'; micReadout.textContent = '正在载入本机录音…'; sync();
    try {
      const blob = new Blob(job.chunks, { type: job.recorder.mimeType || job.chunks[0]?.type || 'audio/webm' });
      job.chunks.length = 0;
      if (!blob.size) throw Error('没有录到可读取的声音数据，请重新录音。');
      if (blob.size > MAX_MICROPHONE_BYTES) throw Error('录音文件超过 32 MB，未载入部分数据。');
      if (!loadAudioFile) throw Error('音频载入接口尚未连接。');
      const extension = /mp4/.test(blob.type) ? 'm4a' : /ogg/.test(blob.type) ? 'ogg' : 'webm';
      await loadAudioFile(new File([blob], `麦克风录音-${Date.now()}.${extension}`, { type: blob.type }), { isCurrent: () => microphoneCurrent(job) });
      if (!microphoneCurrent(job)) return;
      refreshAudio();
      if (!currentAudio?.samples?.length) throw Error('录音来源已变化，请重新录音。');
      microphone = null; microphoneRevision++; micReadout.textContent = `录音已载入 · ${((job.stopped - job.started) / 1000).toFixed(1)} 秒`;
      updateStatus(view.status, '麦克风录音已在本机载入，可识别或试听。', 'success'); sync();
    } catch (e) {
      if (microphoneCurrent(job)) { cancelMicrophone('录音未载入'); updateStatus(view.status, e.message || String(e), 'error'); }
    }
  }
  function finishMicrophone() {
    const job = microphone;
    if (!job || job.phase !== 'recording') return;
    job.phase = 'stopping'; job.accept = true; job.stopped = performance.now();
    clearInterval(job.interval); clearTimeout(job.timeout);
    micReadout.textContent = '录音已停止，正在整理…';
    try { job.recorder.stop(); releaseMicrophone(job); sync(); }
    catch (e) { cancelMicrophone('录音未载入'); updateStatus(view.status, '无法结束录音：' + e.message, 'error'); }
  }
  async function beginMicrophone() {
    if (microphone || busy || dead || direction.value !== 'decode' || panel.hidden) return;
    if (!navigator.mediaDevices?.getUserMedia) { updateStatus(view.status, '当前浏览器或网站环境不支持麦克风访问；请使用 HTTPS 或本机地址，或选择音频文件。', 'error'); return; }
    if (typeof MediaRecorder !== 'function') { updateStatus(view.status, '当前浏览器不支持本地录音，请选择音频文件。', 'error'); return; }
    invalidate('正在请求麦克风权限…'); sourcePlayer.pause();
    const job = { revision: ++microphoneRevision, phase: 'permission', stream: null, recorder: null, chunks: [], bytes: 0, accept: false };
    microphone = job; micReadout.textContent = '等待麦克风授权'; sync();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
      if (!microphoneCurrent(job)) { for (const track of stream.getTracks()) track.stop(); return; }
      job.stream = stream;
      const mimeType = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported?.(type));
      job.recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      job.recorder.ondataavailable = ({ data }) => {
        if (!microphoneCurrent(job) || !data?.size) return;
        job.bytes += data.size;
        if (job.bytes > MAX_MICROPHONE_BYTES) { cancelMicrophone('录音超过 32 MB，已取消'); updateStatus(view.status, '录音超过 32 MB，未载入部分数据。请缩短录音。', 'error'); return; }
        job.chunks.push(data);
      };
      job.recorder.onstop = () => { void adoptRecording(job); };
      job.recorder.onerror = event => { if (microphoneCurrent(job)) { const reason = event.error?.message || '设备或编码器无法继续录音'; cancelMicrophone('录音失败'); updateStatus(view.status, '麦克风录音失败：' + reason, 'error'); } };
      for (const track of stream.getTracks()) track.addEventListener('ended', () => {
        if (microphoneCurrent(job) && job.phase === 'recording') { cancelMicrophone('麦克风已断开'); updateStatus(view.status, '麦克风已断开，录音未载入。', 'error'); }
      }, { once: true });
      job.started = performance.now(); job.phase = 'recording'; job.recorder.start(250);
      const readout = () => { if (microphoneCurrent(job)) micReadout.textContent = `录音 ${((performance.now() - job.started) / 1000).toFixed(0)} / 120 秒 · ${(job.bytes / 1024).toFixed(0)} KB`; };
      job.interval = setInterval(readout, 1000); job.timeout = setTimeout(finishMicrophone, MAX_MICROPHONE_MS); readout();
      updateStatus(view.status, '正在本机录音，停止后才载入音频。'); sync();
    } catch (e) {
      if (!microphoneCurrent(job)) return;
      const reasons = { NotAllowedError: '麦克风权限未获允许。可重新授权或选择音频文件。', SecurityError: '当前网站环境不允许麦克风访问。请使用 HTTPS 或本机地址。', NotFoundError: '没有找到可用的麦克风。', NotReadableError: '无法读取麦克风，设备可能被占用。', OverconstrainedError: '麦克风不支持当前录音设置。', NotSupportedError: '浏览器不支持当前录音格式，请选择音频文件。' };
      cancelMicrophone('未开始录音'); updateStatus(view.status, reasons[e.name] || `无法开始麦克风录音：${e.message}`, 'error');
    }
  }
  micStart.onclick = () => { void beginMicrophone(); }; micStop.onclick = finishMicrophone;
  micCancel.onclick = () => { cancelMicrophone('录音已取消'); updateStatus(view.status, '录音已取消，未采用新录音。'); };
  const audioChanged = () => { if (microphone && microphone.phase !== 'loading') cancelMicrophone('音频来源变化，录音已取消'); invalidate(); refreshAudio(); };
  const leaving = ({ detail }) => { if (detail.name !== 'morse') { cancelMicrophone(); invalidate(); sourcePlayer.pause(); } };
  const taskChanged = ({ detail }) => { if (detail.panel === 'morse') changeDirection(detail.direction ?? direction.value); };
  document.addEventListener('arg:audiochange', audioChanged); document.addEventListener('arg:panelchange', leaving); document.addEventListener('arg:nativetaskchange', taskChanged);
  direction.addEventListener('change', () => changeDirection(direction.value));
  view.parameters.addEventListener('input', () => invalidate());
  view.parameters.addEventListener('change', event => { if (event.target !== direction) invalidate(); });
  view.input.addEventListener('input', () => invalidate());
  file.addEventListener('change', async () => {
    const selected = file.files?.[0], serial = ++loadRevision; if (!selected) return;
    cancelMicrophone();
    invalidate('正在读取音频…');
    try {
      if (!loadAudioFile) throw Error('音频载入接口尚未连接。');
      await loadAudioFile(selected, { isCurrent: () => serial === loadRevision && !dead && !panel.hidden });
      if (serial !== loadRevision || dead) return;
      refreshAudio();
      if (!currentAudio?.samples?.length) throw Error('音频来源已经变化，请等待当前文件载入后重试。');
      updateStatus(view.status, '音频已载入。');
    } catch (e) { if (serial === loadRevision && !dead) updateStatus(view.status, e.message || String(e), 'error'); }
  });
  view.run.onclick = run; view.stop.onclick = () => invalidate('已停止。');
  view.copy.onclick = async () => { if (!result || direction.value !== 'decode') return; try { await navigator.clipboard.writeText(result.rawText); updateStatus(view.status, '已复制识别文字。', 'success'); } catch { updateStatus(view.status, '请选中文字后手动复制。', 'error'); } };
  view.save.onclick = () => { if (result) void (direction.value === 'decode' ? saveFile(result.rawText, '迷雾工具箱-摩斯识别.txt') : saveFile(result.wav, '迷雾工具箱-摩斯音频.wav', 'audio/wav')); };
  diagnosticsSave.onclick = () => { if (result) void saveFile(JSON.stringify({ diagnostics: result.diagnostics, statistics: result.statistics, signal: result.signal ? [...result.signal] : undefined,
    threshold: result.threshold ? [...result.threshold] : undefined, spectrogram: result.spectrogram ? { ...result.spectrogram, values: [...result.spectrogram.values] } : undefined }, null, 2), '迷雾工具箱-摩斯诊断.json', 'application/json'); };
  csvSave.onclick = () => { if (!result?.diagnostics.history) return; const keys = ['seconds', 'flush', 'estimatedPitch_Hz', 'estimatedSpeed_wpm', 'signalThreshold', 'costFunction', 'timeResample_ms', 'timePitchDetection_ms', 'timeGoertzel_ms', 'timeFrameAnalysis_ms'];
    void saveFile('\ufeff' + keys.join(',') + '\n' + result.diagnostics.history.map(row => keys.map(key => row[key]).join(',')).join('\n'), '迷雾工具箱-摩斯时序.csv', 'text/csv;charset=utf-8'); };
  panel.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !busy) { event.preventDefault(); void run(); } });
  const api = { run, invalidate, activate: changeDirection, getResult: () => result,
    getInputModel: () => direction.value === 'encode' ? { kind: 'text', source: 'text', text: view.input.value } : null,
    adoptInput: value => { if (value?.kind !== 'text' || value.source !== 'text') return false; changeDirection('encode'); setTextareaValue(view.input, value.text); return true; } };
  const resize = new ResizeObserver(() => {
    if (dead || panel.hidden) return;
    if (currentAudio?.samples && !sourceWave.hidden) linePlot(sourceWave, currentAudio.samples, { seconds: currentAudio.samples.length / currentAudio.sampleRate, label: '当前音频' });
    if (result?.samples && !outputWave.hidden) linePlot(outputWave, result.samples, { seconds: result.samples.length / result.sampleRate, label: '生成波形' });
    if (result?.signal) {
      const signal = view.details.querySelector('#morse-signal-plot'), threshold = view.details.querySelector('#morse-threshold-plot'), spectrum = view.details.querySelector('#morse-spectrum-plot');
      if (signal) linePlot(signal, result.signal, { seconds: result.signal.length / 500, unipolar: true, label: 'Goertzel 幅度' });
      if (threshold) linePlot(threshold, result.threshold, { seconds: result.threshold.length * result.diagnostics.thresholdStepSeconds, unipolar: true, label: '阈值比例' });
      if (spectrum) spectrumPlot(spectrum, result.spectrogram);
    }
  }); resize.observe(panel);
  onDisconnect(panel, () => { dead = true; cancelMicrophone(); resize.disconnect(); loadRevision++; invalidate(); alphabetDisclosure.destroy(); stopPlayer(sourcePlayer); revoke('input');
    document.removeEventListener('arg:audiochange', audioChanged); document.removeEventListener('arg:panelchange', leaving); document.removeEventListener('arg:nativetaskchange', taskChanged); });
  refreshAudio(); changeDirection('decode');
  return { panels: [panel], sessions: { morse: api }, activate: changeDirection, panel, view };
}
