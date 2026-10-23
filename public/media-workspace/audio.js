import {wavEncode,reverseChannels,morseAudio} from '../media.js';
import {resultRecording,canvasRecord} from '../result-recording.js';
import {$,MAX_FILE,setStatus,createActions,download,canvasDownload,bindDrop} from './io.js';
import {audioClip} from './audio-model.js';

// Owns decoded PCM, preview, worker lifetime and result leases. Other tools
// receive snapshots through this interface; routing never edits this state.
export function mountAudioWorkspace(){
const state={audioGeneration:0,audio:null,audioURL:null,reversed:false,worker:null};
const action=createActions(()=>state.audioGeneration);
const audioResultRecording=resultRecording({id:'audio-analysis',anchor:$('audio-output'),source:'audio'});
const spectrumRecording=resultRecording({id:'audio-spectrum',anchor:$('spectrum-download'),source:'image'});
const audioClipRecording=resultRecording({id:'audio-clip',anchor:$('audio-export'),source:'audio'});
audioClipRecording.buttons[0].textContent='将当前片段加入笔记本';audioClipRecording.buttons[1].textContent='将当前片段加入白板 / 脑图';
function audioClipValue(){
 if(!state.audio)throw Error('请先选择音频。');const start=+$('audio-start').value,end=+$('audio-end').value,rate=state.audio.sampleRate;
 if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>state.audio.duration+.01)throw Error('片段范围必须在音频时长内，且终点晚于起点。');
 const channels=audioClip(state.audio.channels,rate,start,end,state.reversed);
 return {files:[new File([wavEncode(channels,rate)],'当前音频片段.wav',{type:'audio/wav'})]};
}
function publishAudioClip(){audioClipRecording.clear();if(state.audio&&+$('audio-start').value>=0&&+$('audio-end').value>+$('audio-start').value&&+$('audio-end').value<=state.audio.duration+.01)audioClipRecording.publish(audioClipValue);}
for(const id of ['audio-start','audio-end'])$(id).addEventListener('input',publishAudioClip);
document.addEventListener('arg:audiochange',()=>{audioResultRecording.clear();spectrumRecording.clear();audioClipRecording.clear();});
let audioContext;
const audioButtons = ['audio-reverse', 'audio-dtmf', 'audio-spectrum', 'audio-export'];
function enableAudio(ready) { audioButtons.forEach(id => $(id).disabled = !ready); }
function currentChannel() {
  if (!state.audio) throw new Error('请先选择音频。'); const channels = state.audio.channels;
  if ($('audio-channel').value === 'left') return channels[0];
  if ($('audio-channel').value === 'right') return channels[Math.min(1, channels.length - 1)];
  const mixed = new Float32Array(channels[0].length);
  for (const channel of channels) for (let i = 0; i < mixed.length; i++) mixed[i] += channel[i] / channels.length;
  return mixed;
}
function changeAudioURL(blob) {
  const player = $('audio-player'); player.pause(); if (state.audioURL) URL.revokeObjectURL(state.audioURL);
  state.audioURL = URL.createObjectURL(blob); player.src = state.audioURL; player.playbackRate = +$('audio-speed').value; player.preservesPitch = false;
}
function renderWaveform() {
  if (!state.audio) return; let samples = currentChannel(); if (state.reversed) samples = Float32Array.from(samples).reverse();
  const canvas = $('waveform-canvas'), ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
  const height = canvas.height, center = height / 2; ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(); ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < canvas.width; x++) {
    const start = Math.floor(x * samples.length / canvas.width), end = Math.floor((x + 1) * samples.length / canvas.width); let min = 0, max = 0;
    for (let i = start; i < end; i++) { min = Math.min(min, samples[i]); max = Math.max(max, samples[i]); }
    ctx.moveTo(x + 0.5, center - max * (center - 10)); ctx.lineTo(x + 0.5, center - min * (center - 10));
  }
  ctx.stroke(); ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--line').trim(); ctx.beginPath(); ctx.moveTo(0, center); ctx.lineTo(canvas.width, center); ctx.stroke();
}
function cancelAudioWork() { if (state.worker) { state.worker.terminate(); state.worker.reject?.(new Error('分析已取消。')); state.worker = null; } }
function clearSpectrum() {
  spectrumRecording.clear();
  const canvas = $('spectrogram-canvas'); canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  $('spectrum-download').disabled = true; $('spectrum-axis').textContent = ''; $('spectrum-axis').hidden = true;
}
function invalidateAudioAnalysis(message='') {
  document.dispatchEvent(new Event('arg:audiochange'));
  state.audioGeneration++; cancelAudioWork(); clearSpectrum(); publishAudioClip(); enableAudio(!!state.audio);
  if (state.audio) setStatus('audio-status', message);
}
function getAudioSnapshot(withSamples=true){if(!state.audio)return null;const samples=withSamples?Float32Array.from(currentChannel()):null;if(state.reversed&&samples)samples.reverse();return {samples,sampleRate:state.audio.sampleRate,generation:state.audioGeneration};}
bindDrop($('audio-input'),file=>{void loadAudioFile(file);});
async function loadAudioFile(file,{isCurrent=()=>true}={}) {
  if(!isCurrent())return null;
  document.dispatchEvent(new Event('arg:audiochange'));
  const generation = ++state.audioGeneration; cancelAudioWork(); enableAudio(false); state.audio = null; state.reversed = false; clearSpectrum();
  const player = $('audio-player'); player.pause(); player.removeAttribute('src'); player.load();
  if (state.audioURL) { URL.revokeObjectURL(state.audioURL); state.audioURL = null; }
  $('audio-channel').disabled = true; $('audio-output').value = ''; $('audio-info').textContent = `正在读取：${file.name}`; $('audio-reverse').textContent = '倒放预览';
  const waveform = $('waveform-canvas'); waveform.getContext('2d').clearRect(0, 0, waveform.width, waveform.height);
  setStatus('audio-status', '正在解码音频…');
  try {
    if (file.size > MAX_FILE) throw new Error('音频超过 32 MB。');
    audioContext ||= new AudioContext(); let buffer;
    try { buffer = await audioContext.decodeAudioData(await file.arrayBuffer()); }
    catch { throw new Error('无法解码此音频，请选择有效的 WAV、MP3 或浏览器支持的音频文件。'); }
    if (buffer.duration > 300) throw new Error('音频超过 5 分钟，请先裁剪较短片段。');
    if (generation !== state.audioGeneration) return null;
    if(!isCurrent()){$('audio-info').textContent='音频读取已取消。';setStatus('audio-status','读取已取消，未采用过期音频。');return null;}
    state.audio = { file,channels: Array.from({ length: buffer.numberOfChannels }, (_, i) => Float32Array.from(buffer.getChannelData(i))), sampleRate: buffer.sampleRate, duration: buffer.duration };
    document.dispatchEvent(new Event('arg:audioready'));
    state.reversed = false; $('audio-reverse').textContent = '倒放预览'; changeAudioURL(file); renderWaveform();
    $('audio-info').textContent = `${file.name} / ${buffer.duration.toFixed(2)} 秒 / ${buffer.sampleRate} Hz / ${buffer.numberOfChannels} 声道`;
    $('audio-end').value = buffer.duration.toFixed(2); $('audio-start').value = '0'; $('min-hz').value = '0'; $('max-hz').value = Math.min(12000, buffer.sampleRate / 2); $('audio-output').value = '';
    $('spectrogram-canvas').getContext('2d').clearRect(0, 0, 900, 256); setStatus('audio-status', '音频已载入；可点击波形定位。');
  } catch (error) { if (generation === state.audioGeneration) { $('audio-info').textContent = `未载入：${file.name}`; setStatus('audio-status', error.message || '浏览器无法解码此音频格式。', true); } }
  finally { if (generation === state.audioGeneration) { enableAudio(!!state.audio); $('audio-channel').disabled = !state.audio; publishAudioClip(); } }
  return isCurrent()?getAudioSnapshot():null;
}
$('audio-speed').addEventListener('change', () => { $('audio-player').playbackRate = +$('audio-speed').value; $('audio-player').preservesPitch = false; });
$('audio-channel').addEventListener('change', () => { invalidateAudioAnalysis(); $('audio-output').value = ''; renderWaveform(); });
['fft-size', 'min-hz', 'max-hz'].forEach(id => $(id).addEventListener(id === 'fft-size' ? 'change' : 'input', () => { if (state.audio) invalidateAudioAnalysis(); }));
$('waveform-canvas').addEventListener('click', event => { if (!state.audio) return; const box = event.currentTarget.getBoundingClientRect(); $('audio-player').currentTime = Math.max(0, Math.min(state.audio.duration, (event.clientX - box.left) / box.width * state.audio.duration)); });
$('waveform-canvas').addEventListener('keydown', event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key) && state.audio) { event.preventDefault(); $('audio-player').currentTime = Math.max(0, Math.min(state.audio.duration, $('audio-player').currentTime + (event.key === 'ArrowRight' ? 5 : -5))); } });
action('audio-reverse', 'audio-status', () => {
  if (!state.audio) throw new Error('请先选择音频。'); state.reversed = !state.reversed;
  const channels = state.reversed ? reverseChannels(state.audio.channels) : state.audio.channels;
  changeAudioURL(new Blob([wavEncode(channels, state.audio.sampleRate)], { type: 'audio/wav' })); renderWaveform(); $('audio-reverse').textContent = state.reversed ? '恢复正向预览' : '倒放预览';
  invalidateAudioAnalysis(); $('audio-output').value = '';
  setStatus('audio-status', '');
});
function audioWork(action, options) {
  cancelAudioWork(); const samples = Float32Array.from(currentChannel()); if (state.reversed) samples.reverse();
  const worker = new Worker(new URL('../audio-worker.js', import.meta.url), { type: 'module' }); state.worker = worker;
  return new Promise((resolve, reject) => {
    worker.reject = reject;
    worker.onmessage = event => { worker.terminate(); if (state.worker === worker) state.worker = null; event.data.error ? reject(new Error(event.data.error)) : resolve(event.data); };
    worker.onerror = () => { worker.terminate(); if (state.worker === worker) state.worker = null; reject(new Error('音频分析失败，请使用较短片段重试。')); };
    worker.postMessage({ action, samples, sampleRate: state.audio.sampleRate, options }, [samples.buffer]);
  });
}
action('audio-spectrum', 'audio-status', async () => {
  const generation = state.audioGeneration; enableAudio(false); setStatus('audio-status', '正在生成频谱图…');
  clearSpectrum();
  try {
    const minHz = +$('min-hz').value, maxHz = +$('max-hz').value, result = await audioWork('spectrum', { fftSize: +$('fft-size').value, minHz, maxHz });
    if (generation !== state.audioGeneration) return;
    const canvas = $('spectrogram-canvas'); canvas.width = result.width; canvas.height = result.height; canvas.getContext('2d').putImageData(new ImageData(result.pixels, result.width, result.height), 0, 0);
    $('spectrum-axis').hidden = false; $('spectrum-axis').textContent = `时间：0–${state.audio.duration.toFixed(2)} 秒 / 频率：上方 ${maxHz} Hz，下方 ${minHz} Hz / ${state.reversed ? '倒放' : '正向'} / 当前选定声道`;
    spectrumRecording.publish(()=>canvasRecord(canvas,'音频频谱.png'));$('spectrum-download').disabled = false; setStatus('audio-status', '频谱图已生成');
  } finally { if (generation === state.audioGeneration) enableAudio(!!state.audio); }
});
action('audio-dtmf', 'audio-status', async () => {
  const generation = state.audioGeneration; audioResultRecording.clear();enableAudio(false); setStatus('audio-status', '正在分析电话按键音…');
  try { const result = await audioWork('dtmf'); if (generation !== state.audioGeneration) return;
    $('audio-output').value = result.events.length ? `识别序列：${result.events.map(x => x.digit).join('')}\n\n${result.events.map(x => `${x.time.toFixed(2)} 秒  ${x.digit}`).join('\n')}` : '未检测到稳定的电话按键音。嘈杂或失真的录音可能无法识别。'; audioResultRecording.publish({text:$('audio-output').value+'\n\n完整检测记录：\n'+JSON.stringify(result.events,null,2)});setStatus('audio-status', '分析完成；请结合试听核对结果。');
  } finally { if (generation === state.audioGeneration) enableAudio(!!state.audio); }
});
action('spectrum-download', 'audio-status', () => canvasDownload($('spectrogram-canvas'), 'arg-spectrogram.png'));
action('audio-export', 'audio-status', () => {
  if (!state.audio) throw new Error('请先选择音频。'); const start = +$('audio-start').value, end = +$('audio-end').value, rate = state.audio.sampleRate;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end > state.audio.duration + 0.01) throw new Error('导出范围必须在音频时长内，且终点晚于起点。');
  const channels=audioClip(state.audio.channels,rate,start,end,state.reversed);
  download(wavEncode(channels, rate), 'arg-audio.wav', 'audio/wav'); setStatus('audio-status', 'WAV 已导出');
});
action('morse-audio-save', 'audio-status', () => { download(morseAudio($('morse-audio-text').value, +$('morse-wpm').value), 'arg-morse.wav', 'audio/wav'); setStatus('audio-status', '摩斯音频已生成'); });

document.addEventListener('arg:nativetaskchange',e=>{if(e.detail.panel!=='audio')return;state.audioGeneration++;cancelAudioWork();audioResultRecording.clear();clearSpectrum();$('audio-output').value='';publishAudioClip();enableAudio(!!state.audio);setStatus('audio-status','');});
window.addEventListener('pagehide',()=>{cancelAudioWork();if(state.audioURL)URL.revokeObjectURL(state.audioURL);});
return {snapshot:getAudioSnapshot,load:loadAudioFile,getFile:()=>state.audio?.file};
}
