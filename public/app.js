import {mountInitialLayout} from './ui/index.js';
import {element as uiElement, render as uiRender, setState, updateStatus, Box, Card, SplitView, TabList, Button, tabsController} from './ui/index.js';
import {mountHexEditor} from './hex/editor.js';
import {mountITReference} from './it-reference/page.js';
import {mountKnowledge} from './knowledge/page.js';
import {initReference} from './reference/index.js';
import {initScience} from './science/index.js';
import {initRoundFour} from './round4/index.js';
import {initGo} from './discovery/go.js';
import {initTuring} from './turing/ui.js';
import {initBasics} from './basics/ui.js';
import {mountProjectSources,setProjectSources} from './project-sources.js';
import {initCodeRunner} from './coderunner/ui.js';
import {initPaper} from './round3/paper.js';
import {mountChefTools} from './chef-tools/index.js';
import {initRoundTwo} from './round-two.js';
import {initRoundOne} from './round-one.js';
import {mountShell,decorateHeading,mountFooter} from './site-shell.js';
import {mountWorkspaceGuides} from './workspace.js';
import {initHuntTools} from './hunt-tools.js';
import {initHuntMedia} from './hunt-media.js';
import { bytesToHex, morseMap, brailleEncode, brailleDecode } from './engine.js';
import { identifyFile, hexDump, fileAnalysis, asciiStrings, wavEncode, reverseChannels, morseAudio } from './media.js';
import { initCyberChef } from './cyberchef.js';
import { initImageTools } from './image-tools.js';
import {initPreferences,initialRoute} from './preferences.js';
import {mountSitePages} from './site-pages.js';
import {toolPages,sitePages} from './navigation.js';
import {loadRegistry,resolveCapability} from './capabilities/registry.js';
import {mountCapabilityWorkspace} from './capabilities/workspace.js';
import {capabilityRoute} from './capabilities/routes.js';
import {selectPanelTask} from './capabilities/task-selection.js';
import {mountNativeWorkspaces} from './capabilities/native-workspaces.js';
import {mountReferenceWorkspaces} from './capabilities/reference-workspaces.js';
import {getCatalogue} from './chef-tools/catalog.js';
import {defaults} from './chef-tools/schema.js';
import {createInputSession} from './capabilities/input-session.js';
import {getBasicsSession} from './basics/ui.js';
import {mountHandoff} from './handoff/dialog.js';
import {createHandoffTargets} from './handoff/targets.js';
import {continueButton} from './handoff/button.js';
import {mountFeedback} from './feedback/ui.js';

initPreferences();
mountInitialLayout();

const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const state = { panel: 'crypto', audioGeneration: 0, audio: null, audioURL: null, reversed: false, worker: null, file: null, fileSource: null, fileGeneration: 0 };
let hexEditor,knowledge;
const MAX_FILE = 32 * 1024 * 1024;
const setStatus = (id, message, error = false) => updateStatus($(id),message,error?'error':'info');
function action(id, status, fn) {
  const field = { 'audio-status': 'audioGeneration', 'file-status': 'fileGeneration' }[status];
  let actionRevision = 0;
  $(id).addEventListener('click', async () => {
    const current = ++actionRevision;let pending = false;
    const generation = field && state[field];
    try { const result = fn();pending = Boolean(result?.then);if(pending)setState($(id),{busy:true});await result; }
    catch (error) { if (!field || generation === state[field]) setStatus(status, error?.message || String(error), true); }
    finally {if(pending&&current===actionRevision)setState($(id),{busy:false});}
  });
}
function download(data, filename, type = 'text/plain;charset=utf-8') {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob), link = uiElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
async function copy(text) {
  if (!text) throw new Error('还没有可复制的结果。');
  try { if (navigator.clipboard) { await navigator.clipboard.writeText(text); return; } } catch { /* Try the selection fallback. */ }
  const box = uiElement('textarea'); box.value = text; box.style.position = 'fixed'; box.style.opacity = '0'; document.body.append(box); box.select();
  const success = document.execCommand('copy'); box.remove(); if (!success) throw new Error('复制失败，请选择结果后手动复制。');
}
function canvasDownload(canvas, filename) { return new Promise((resolve, reject) => canvas.toBlob(blob => { if (!blob) { reject(new Error('图片导出失败。')); return; } download(blob, filename); resolve(); }, 'image/png')); }
function bindDrop(input, handler) {
  input.addEventListener('change', () => { const file = input.files?.[0]; if (file) handler(file); input.value = ''; });
  const zone = input.closest('.upload-zone');
  zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', event => { event.preventDefault(); zone.classList.remove('dragover'); const file = event.dataTransfer.files[0]; if (file) handler(file); });
}
const huntUI = initHuntTools();
initPaper();
initRoundOne();
initRoundFour();
initScience();
initReference();
initGo();
initTuring();
const itReference=mountITReference($('main'),{navigate:panel,onKindChange:kind=>panel('it-reference?task=native:it-'+kind)});
knowledge=mountKnowledge($('main'),{navigate:panel,onArticleChange:id=>panel('knowledge?task=learn:'+id)});
setProjectSources(itReference.panel,['https://www.iana.org/protocols','https://github.com/jshttp/mime-db','https://github.com/publicsuffix/list','https://www.rfc-editor.org/rfc-index/']);
const chef = initCyberChef();
initBasics();
initCodeRunner();
const chefTools=mountChefTools();
const navigation=mountShell(document.querySelector('.site-header'),$('sidebar'),{navigate:panel});
mountSitePages($('main'),{navigate:panel});
let routingRevision=0,capabilityWorkspace,nativeWorkspaces,referenceWorkspaces,currentCapability=null;
const lastTaskRoutes=new Map();
const inputSession=createInputSession();
function inputController(entry){const owner=entry?.open?.panel;return entry?.open?.kind==='operation'?chefTools.getTask(owner):getBasicsSession(owner);}
async function panel(route) {
  const revision=++routingRevision;
  hexEditor?.cancel();itReference.cancel();knowledge?.cancel();
  if(currentCapability)inputSession.capture(currentCapability,inputController(currentCapability));
  chefTools.deactivate();
  const [path,query='']=String(route).split('?');
  const params=new URLSearchParams(query),taskId=params.get('task');
  let [name,group,subgroup]=path.split('/');
  let entry,operation,direction;
  if(taskId||!['home','about','resources','settings','browse','knowledge'].includes(name)){
    let registry;
    try{registry=await loadRegistry();}
    catch(error){if(revision===routingRevision){await panel('browse');capabilityWorkspace.retryRoute(route);}return;}
    if(revision!==routingRevision)return;
    if(taskId)({entry,op:operation,direction}=resolveCapability(registry,taskId,params.get('op'),params.get('dir')));
    if(!entry) {
      const controller=chefTools.getTask(name);
      ({entry,op:operation,direction}=selectPanelTask(registry,name,{remembered:lastTaskRoutes.get(name),operation:controller?.getOperation()}));
    }
    if(entry?.listed===false)entry=null;
    if(entry){[name,group]=entry.route.split('/');}
    else {name='browse';group='';subgroup='';}
  }
  if(name==='resources')name='about';
  if (!$('panel-' + name)) {name = 'home';group='';} const changed = state.panel !== name; state.panel = name;
  // A direction change is the same task. Keep its mounted toolbar and real
  // focused controls; restore composition only when task identity changes.
  if(!entry||currentCapability?.id!==entry.id)capabilityWorkspace?.restore();
  nativeWorkspaces?.restore();currentCapability=null;
  if (name === 'cyberchef') chef.load();
  for (const section of document.querySelectorAll('.panel')) section.hidden = section.id !== 'panel-' + name;
  const target=name==='browse'?name+(group?'/'+group:'')+(subgroup?'/'+subgroup:''):name+(group?'/'+group:'');
  navigation.setActive(target);navigation.close();
  document.dispatchEvent(new CustomEvent('arg:panelchange',{detail:{name,group,capabilityId:entry?.id||null}}));
  syncFileMode(name==='file'&&entry?.open?.slice==='hex');
  if(name==='it-reference'&&!entry)itReference.activate(group);
  if(name==='knowledge'&&!entry){if(group)knowledge.activateCategory(group);else knowledge.activateArticle();}
  if(name==='browse')capabilityWorkspace.showOverview(group,subgroup);
  const title=[...toolPages,...sitePages].find(page=>page.route===name)?.title||'工具导航';
  history.replaceState(null, '', '#' + (entry?capabilityRoute(entry,operation,direction):target));document.title = (entry?.title||title) + ' · 迷雾工具箱';
  if (changed) { $('main').focus({preventScroll: true}); window.scrollTo({top: 0, behavior: 'instant'}); }
  if(entry){
    currentCapability=entry;
    const selection={id:entry.id,op:operation,direction};
    lastTaskRoutes.set(entry.open.panel,selection);
    await capabilityWorkspace.activate(entry,{direction});if(revision!==routingRevision)return;
    try{
      if(entry.open.kind==='learning'){
        knowledge.activateArticle(entry.open.articleId);
      }else if(entry.open.kind==='recipe'){
        const catalogue=await getCatalogue();if(revision!==routingRevision)return;
        await chef.openRecipe([{op:operation,args:defaults(catalogue.operations[operation])}],undefined,{navigate:false,isCurrent:()=>revision===routingRevision});
      }else if(entry.open.kind==='operation'){
        if(!await chefTools.selectCapability({panel:entry.open.panel,op:operation,capabilityId:entry.id,directions:entry.directions}))throw Error('该操作尚未就绪，请重新选择功能。');
        if(revision!==routingRevision)return;
        nativeWorkspaces.activateOperation(entry);
      }else if(!await nativeWorkspaces.activateNative(entry,{op:operation,direction}))throw Error('无法切换到该功能，请重新选择。');
      if(revision!==routingRevision)return;
      inputSession.adopt(entry,inputController(entry));
      referenceWorkspaces.activate(entry.route,entry);
    }catch(error){if(revision===routingRevision)capabilityWorkspace.error(error);}
  }
}
window.addEventListener('hashchange', () => panel(location.hash.slice(1)));
document.querySelector('.skip').addEventListener('click', event => { event.preventDefault(); $('main').focus(); $('main').scrollIntoView(); });

const imageTools = initImageTools();
initHuntMedia(huntUI, imageTools.getImage, (withSamples = true) => state.audio ? {sampleRate: state.audio.sampleRate, samples: withSamples ? Float32Array.from(currentChannel()) : null, generation: state.audioGeneration} : null);
const roundTwo=initRoundTwo({getImage:imageTools.getImage,getAudio:()=>{if(!state.audio)return null;const samples=Float32Array.from(currentChannel());if(state.reversed)samples.reverse();return{samples,sampleRate:state.audio.sampleRate,generation:state.audioGeneration};},getFile:()=>state.file?{bytes:state.file,generation:state.fileGeneration}:null});
// One upload and one original analysis model serve both file tasks. Changing a
// route moves no input nodes and never promotes an edited buffer implicitly.
const filePanel=$('panel-file'),fileAnalysisSurface=filePanel.querySelector(':scope>.surface');
fileAnalysisSurface.dataset.nativeSection='file-analysis';
const sharedFile=Card({className:'surface',attrs:{'data-native-section':'file-upload'}});
sharedFile.append(SplitView({minPaneWidth:'260px',children:[fileAnalysisSurface.querySelector('.upload-zone'),Box({children:[$('file-stats'),$('file-status')]})]}));
const fileActions=fileAnalysisSurface.querySelector('.button-row');
const fileResult=Box({children:[fileAnalysisSurface.querySelector('.field-label'),$('file-output'),$('file-copy')]});
fileAnalysisSurface.replaceChildren(SplitView({minPaneWidth:'340px',children:[fileActions,fileResult]}));
fileAnalysisSurface.before(sharedFile);
hexEditor=mountHexEditor(filePanel,{onUseBytes:async(bytes,{name,isCurrent})=>{
  if(!isCurrent())return false;
  const sourceRoute=routingRevision,sourceGeneration=state.fileGeneration;
  // Enter the destination first: leaving the old task must clear its output
  // before a new analysis can commit. The destination lease owns the handoff.
  await panel('file?task=native:file');
  const destinationCurrent=()=>routingRevision===sourceRoute+1&&state.panel==='file';
  if(!destinationCurrent()||state.fileGeneration!==sourceGeneration)return false;
  return loadFile(new File([bytes],name,{type:'application/octet-stream'}),{bytes,preserveEditor:true,isCurrent:destinationCurrent});
}});
const fileModes=TabList({id:'file-modes',attrs:{'aria-label':'文件操作'}});sharedFile.before(fileModes);
let fileModeSync=true;
const fileModeTabs=tabsController(fileModes,[['analysis','文件分析',fileAnalysisSurface,Button({id:'file-mode-analysis',text:'文件分析'})],['hex','十六进制编辑',hexEditor.root,Button({id:'file-mode-hex',text:'十六进制编辑'})]],{initial:'analysis',visibility:false,onSelect:id=>{
  if(!fileModeSync)panel(id==='hex'?'file?task=native:hex-editor':'file?task=native:file');
}});
fileModeSync=false;
function syncFileMode(editing){fileModeSync=true;fileModeTabs.select(editing?'hex':'analysis');fileModeSync=false;hexEditor.setActive(editing);}
nativeWorkspaces=mountNativeWorkspaces({imageTools,roundTwo,hexEditor,itReference,getFile:()=>state.file,getFileFile:()=>state.fileSource,getAudioFile:()=>state.audio?.file});
chefTools.connect({imageTools,roundTwo,getFile:()=>state.file,getAudioFile:()=>state.audio?.file,material:nativeWorkspaces});

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
  const canvas = $('spectrogram-canvas'); canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  $('spectrum-download').disabled = true; $('spectrum-axis').textContent = ''; $('spectrum-axis').hidden = true;
}
function invalidateAudioAnalysis(message) {
  document.dispatchEvent(new Event('arg:audiochange'));
  state.audioGeneration++; cancelAudioWork(); clearSpectrum(); enableAudio(!!state.audio);
  if (state.audio) setStatus('audio-status', message);
}
bindDrop($('audio-input'), async file => {
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
    if (generation !== state.audioGeneration) return;
    state.audio = { file,channels: Array.from({ length: buffer.numberOfChannels }, (_, i) => Float32Array.from(buffer.getChannelData(i))), sampleRate: buffer.sampleRate, duration: buffer.duration };
    document.dispatchEvent(new Event('arg:audioready'));
    state.reversed = false; $('audio-reverse').textContent = '倒放预览'; changeAudioURL(file); renderWaveform();
    $('audio-info').textContent = `${file.name} / ${buffer.duration.toFixed(2)} 秒 / ${buffer.sampleRate} Hz / ${buffer.numberOfChannels} 声道`;
    $('audio-end').value = buffer.duration.toFixed(2); $('audio-start').value = '0'; $('min-hz').value = '0'; $('max-hz').value = Math.min(12000, buffer.sampleRate / 2); $('audio-output').value = '';
    $('spectrogram-canvas').getContext('2d').clearRect(0, 0, 900, 256); setStatus('audio-status', '音频已载入；可点击波形定位。');
  } catch (error) { if (generation === state.audioGeneration) { $('audio-info').textContent = `未载入：${file.name}`; setStatus('audio-status', error.message || '浏览器无法解码此音频格式。', true); } }
  finally { if (generation === state.audioGeneration) { enableAudio(!!state.audio); $('audio-channel').disabled = !state.audio; } }
});
$('audio-speed').addEventListener('change', () => { $('audio-player').playbackRate = +$('audio-speed').value; $('audio-player').preservesPitch = false; });
$('audio-channel').addEventListener('change', () => { invalidateAudioAnalysis('声道已修改，请重新生成频谱或识别按键音。'); $('audio-output').value = ''; renderWaveform(); });
['fft-size', 'min-hz', 'max-hz'].forEach(id => $(id).addEventListener(id === 'fft-size' ? 'change' : 'input', () => { if (state.audio) invalidateAudioAnalysis('频谱参数已修改，请重新生成频谱图。'); }));
$('waveform-canvas').addEventListener('click', event => { if (!state.audio) return; const box = event.currentTarget.getBoundingClientRect(); $('audio-player').currentTime = Math.max(0, Math.min(state.audio.duration, (event.clientX - box.left) / box.width * state.audio.duration)); });
$('waveform-canvas').addEventListener('keydown', event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key) && state.audio) { event.preventDefault(); $('audio-player').currentTime = Math.max(0, Math.min(state.audio.duration, $('audio-player').currentTime + (event.key === 'ArrowRight' ? 5 : -5))); } });
action('audio-reverse', 'audio-status', () => {
  if (!state.audio) throw new Error('请先选择音频。'); state.reversed = !state.reversed;
  const channels = state.reversed ? reverseChannels(state.audio.channels) : state.audio.channels;
  changeAudioURL(new Blob([wavEncode(channels, state.audio.sampleRate)], { type: 'audio/wav' })); renderWaveform(); $('audio-reverse').textContent = state.reversed ? '恢复正向预览' : '倒放预览';
  invalidateAudioAnalysis('播放方向已修改，请重新生成频谱或识别按键音。'); $('audio-output').value = '';
  setStatus('audio-status', state.reversed ? '已切换倒放预览；重新生成频谱可查看倒放后的时间顺序。' : '已恢复正向预览');
});
function audioWork(action, options) {
  cancelAudioWork(); const samples = Float32Array.from(currentChannel()); if (state.reversed) samples.reverse();
  const worker = new Worker(new URL('./audio-worker.js', import.meta.url), { type: 'module' }); state.worker = worker;
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
    $('spectrum-download').disabled = false; setStatus('audio-status', '频谱图已生成');
  } finally { if (generation === state.audioGeneration) enableAudio(!!state.audio); }
});
action('audio-dtmf', 'audio-status', async () => {
  const generation = state.audioGeneration; enableAudio(false); setStatus('audio-status', '正在分析电话按键音…');
  try { const result = await audioWork('dtmf'); if (generation !== state.audioGeneration) return;
    $('audio-output').value = result.events.length ? `识别序列：${result.events.map(x => x.digit).join('')}\n\n${result.events.map(x => `${x.time.toFixed(2)} 秒  ${x.digit}`).join('\n')}` : '未检测到稳定的电话按键音。嘈杂或失真的录音可能无法识别。'; setStatus('audio-status', '分析完成；请结合试听核对结果。');
  } finally { if (generation === state.audioGeneration) enableAudio(!!state.audio); }
});
action('spectrum-download', 'audio-status', () => canvasDownload($('spectrogram-canvas'), 'arg-spectrogram.png'));
action('audio-export', 'audio-status', () => {
  if (!state.audio) throw new Error('请先选择音频。'); const start = +$('audio-start').value, end = +$('audio-end').value, rate = state.audio.sampleRate;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end > state.audio.duration + 0.01) throw new Error('导出范围必须在音频时长内，且终点晚于起点。');
  let channels = state.audio.channels.map(channel => channel.slice(Math.round(start * rate), Math.min(channel.length, Math.round(end * rate))));
  if (state.reversed) channels = reverseChannels(channels); download(wavEncode(channels, rate), 'arg-audio.wav', 'audio/wav'); setStatus('audio-status', 'WAV 已导出');
});
action('morse-audio-save', 'audio-status', () => { download(morseAudio($('morse-audio-text').value, +$('morse-wpm').value), 'arg-morse.wav', 'audio/wav'); setStatus('audio-status', '摩斯音频已生成'); });

const fileButtons = ['file-hash', 'file-strings', 'file-hex'];
async function loadFile(file,{preserveEditor=false,bytes:providedBytes,isCurrent=()=>true}={}) {
  if(!isCurrent())return false;
  document.dispatchEvent(new Event('arg:filechange'));
  if(!preserveEditor)hexEditor.load(null);
  const generation = ++state.fileGeneration; state.file = null; state.fileSource = null; fileButtons.forEach(id => $(id).disabled = true); $('file-stats').textContent = ''; $('file-output').value = ''; setStatus('file-status', '正在读取文件…');
  try {
    if (file.size > MAX_FILE) throw new Error('文件超过 32 MB。'); const bytes = providedBytes??new Uint8Array(await file.arrayBuffer()); if (generation !== state.fileGeneration||!isCurrent()) return false;
    if(!(bytes instanceof Uint8Array)||bytes.length>MAX_FILE)throw Error('文件字节超过 32 MB 或格式无效。');
    const info = fileAnalysis(bytes);state.file = bytes; state.fileSource = file;if(!preserveEditor)hexEditor.load(bytes,{name:file.name,generation}); document.dispatchEvent(new Event('arg:fileready'));
    uiRender($('file-stats'), `<div class="stat"><span>文件类型（按文件头）</span><strong>${escape(info.type)}</strong></div><div class="stat"><span>文件大小</span><strong>${bytes.length.toLocaleString()} 字节</strong></div><div class="stat"><span>字节熵 / 0–8</span><strong>${info.entropy}</strong></div>`);
    $('hex-offset').value = '0'; $('file-output').value = `文件名：${file.name}\n文件头：${info.header}\n\n${hexDump(bytes)}`; setStatus('file-status', '文件已载入');return true;
  } catch (error) { if (generation === state.fileGeneration) setStatus('file-status', error.message, true);return false; }
  finally { if (generation === state.fileGeneration) fileButtons.forEach(id => $(id).disabled = !state.file); }
}
bindDrop($('file-input'),loadFile);
action('file-hex', 'file-status', () => { if (!state.file) throw new Error('请先选择文件。'); const offset = +$('hex-offset').value; if (!Number.isInteger(offset) || offset < 0 || offset > state.file.length) throw new Error('起始偏移超出文件范围。'); $('file-output').value = hexDump(state.file, 8192, offset); });
action('file-strings', 'file-status', () => { if (!state.file) throw new Error('请先选择文件。'); const found = asciiStrings(state.file); $('file-output').value = found.length ? found.map(x => `0x${x.offset.toString(16).padStart(8, '0')}  ${x.text}`).join('\n') : '未找到至少 4 个连续字符的可打印 ASCII 字符串。'; setStatus('file-status', `显示 ${found.length} 个字符串（最多 1000 个）`); });
action('file-hash', 'file-status', async () => {
  if (!state.file) throw new Error('请先选择文件。'); if (!crypto.subtle) throw new Error('摘要功能需要 HTTPS 或 localhost。'); const generation = state.fileGeneration, bytes = state.file;
  setStatus('file-status', '正在计算摘要…'); const hash = bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).replace(/ /g, ''); if (generation !== state.fileGeneration) return;
  $('file-output').value = 'SHA-256\n' + hash; setStatus('file-status', '摘要计算完成');
});
action('file-copy', 'file-status', async () => { await copy($('file-output').value); setStatus('file-status', '结果已复制'); });

let brailleBits = 0;
for (const bit of [0, 3, 1, 4, 2, 5]) {
  const button = uiElement('button'); button.textContent = bit + 1; button.setAttribute('aria-label', `盲文第 ${bit + 1} 点`); button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => { brailleBits ^= 1 << bit; const selected = !!(brailleBits & (1 << bit)); button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected)); const symbol = String.fromCharCode(0x2800 + brailleBits); $('braille-symbol').textContent = symbol;
    try { $('braille-letter').textContent = brailleBits ? brailleDecode(symbol).trim() || '数字标记' : '空白'; } catch { $('braille-letter').textContent = '非英文字母'; }
  }); $('braille-dots').append(button);
}
uiRender($('symbol-table'), Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ', letter => `<div class="symbol-cell"><b>${letter}</b><code>${escape(morseMap.get(letter))}</code><span>${brailleEncode(letter)}</span></div>`).join(''));

mountProjectSources($('main'));
for(const section of document.querySelectorAll('.panel'))decorateHeading(section.querySelector('.page-heading'),section.id.slice(6));
mountWorkspaceGuides($('main'));
referenceWorkspaces=mountReferenceWorkspaces($('main'),{navigate:panel});
capabilityWorkspace=mountCapabilityWorkspace($('main'),{navigate:panel,openDirectory:navigation.openDirectory,onCategoryChange:navigation.setActive});
document.addEventListener('arg:openoperation',async e=>{try{const registry=await loadRegistry(),entry=registry.byOperation.get(e.detail?.op);if(entry&&entry.listed!==false)await panel(capabilityRoute(entry,e.detail.op));}catch(error){capabilityWorkspace.error(error);}});
document.addEventListener('arg:opencapability',async e=>{try{const registry=await loadRegistry(),{entry,op,direction}=resolveCapability(registry,e.detail?.id,e.detail?.op,e.detail?.direction);if(entry&&entry.listed!==false)await panel(capabilityRoute(entry,op,direction));}catch(error){capabilityWorkspace.error(error);}});
document.addEventListener('arg:capability-native-direction',e=>{if(currentCapability?.id===e.detail.id)panel(capabilityRoute(currentCapability,undefined,e.detail.direction));});
document.addEventListener('arg:capability-direction',e=>{if(currentCapability?.id!==e.detail.capabilityId)return;const selection={id:currentCapability.id,op:e.detail.op};lastTaskRoutes.set(currentCapability.open.panel,selection);history.replaceState(null,'','#'+capabilityRoute(currentCapability,e.detail.op));});
document.addEventListener('arg:nativetaskchange',e=>{if(e.detail.panel==='audio'){cancelAudioWork();clearSpectrum();$('audio-output').value='';}if(e.detail.panel==='file'){$('file-output').value='';}});
mountFooter($('main'),{navigate:panel});
mountHandoff(createHandoffTargets({navigate:panel,current:()=>({entry:currentCapability,revision:routingRevision}),controller:inputController,material:kind=>kind==='image'?imageTools.getImage():kind==='file'?state.file:null,loadImage:imageTools.load,loadFile}));
mountFeedback({getTask:()=>currentCapability});
let handedFile;
const fileContinue=continueButton({id:'file-continue',source:'file',read:()=>{handedFile=state.file;return {bytes:state.file,name:state.fileSource?.name};},isCurrent:()=>!!handedFile&&handedFile===state.file});
sharedFile.append(fileContinue);
document.addEventListener('arg:fileready',()=>{fileContinue.disabled=!state.file;});
document.addEventListener('arg:filechange',()=>{fileContinue.disabled=true;});
const launch=new URL(location.href);
if(launch.searchParams.has('editor')){launch.search='';launch.hash='cyberchef';history.replaceState(null,'',launch);}
panel(location.hash.slice(1) || initialRoute());
window.addEventListener('pagehide', () => { cancelAudioWork(); if (state.audioURL) URL.revokeObjectURL(state.audioURL); });
