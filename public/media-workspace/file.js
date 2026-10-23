import {render as uiRender,Card,SplitView,Box,TabList,Button,tabsController} from '../ui/index.js';
import {bytesToHex} from '../engine.js';
import {hexDump,fileAnalysis,asciiStrings} from '../media.js';
import {mountHexEditor} from '../hex/editor.js';
import {resultRecording} from '../result-recording.js';
import {$,MAX_FILE,escape,setStatus,createActions,copy,bindDrop} from './io.js';

// Owns the original upload and analysis; hex edits are adopted only through
// an explicit navigation lease supplied by the router.
export function mountFileWorkspace({navigate,routeState}){
const state={file:null,fileSource:null,fileGeneration:0};
const action=createActions(()=>state.fileGeneration);
let hexEditor;
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
  const sourceRoute=routeState().revision,sourceGeneration=state.fileGeneration;
  // Enter the destination first: leaving the old task must clear its output
  // before a new analysis can commit. The destination lease owns the handoff.
  await navigate('file?task=native:file');
  const destinationCurrent=()=>routeState().revision===sourceRoute+1&&routeState().panel==='file';
  if(!destinationCurrent()||state.fileGeneration!==sourceGeneration)return false;
  return loadFile(new File([bytes],name,{type:'application/octet-stream'}),{bytes,preserveEditor:true,isCurrent:destinationCurrent});
}});
const fileModes=TabList({id:'file-modes',attrs:{'aria-label':'文件操作'}});sharedFile.before(fileModes);
let fileModeSync=true;
const fileModeTabs=tabsController(fileModes,[['analysis','文件分析',fileAnalysisSurface,Button({id:'file-mode-analysis',text:'文件分析'})],['hex','十六进制编辑',hexEditor.root,Button({id:'file-mode-hex',text:'十六进制编辑'})]],{initial:'analysis',visibility:false,onSelect:id=>{
  if(!fileModeSync)navigate(id==='hex'?'file?task=native:hex-editor':'file?task=native:file');
}});
fileModeSync=false;
function syncFileMode(editing){fileModeSync=true;fileModeTabs.select(editing?'hex':'analysis');fileModeSync=false;hexEditor.setActive(editing);}
const fileResultRecording=resultRecording({id:'file-analysis',anchor:$('file-copy')});
let fileAnalysisRevision=0;
const clearFileAnalysis=()=>{fileAnalysisRevision++;fileResultRecording.clear();$('file-output').value='';setStatus('file-status','');};
const publishFileAnalysis=()=>{fileAnalysisRevision++;fileResultRecording.publish($('file-output').value?{text:$('file-output').value}:null);};
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
    $('hex-offset').value = '0'; $('file-output').value = `文件名：${file.name}\n文件头：${info.header}\n\n${hexDump(bytes)}`; publishFileAnalysis();setStatus('file-status', '文件已载入');return true;
  } catch (error) { if (generation === state.fileGeneration) setStatus('file-status', error.message, true);return false; }
  finally { if (generation === state.fileGeneration) fileButtons.forEach(id => $(id).disabled = !state.file); }
}
bindDrop($('file-input'),loadFile);$('hex-offset').addEventListener('input',clearFileAnalysis);
action('file-hex', 'file-status', () => { if (!state.file) throw new Error('请先选择文件。'); const offset = +$('hex-offset').value; if (!Number.isInteger(offset) || offset < 0 || offset > state.file.length) throw new Error('起始偏移超出文件范围。'); $('file-output').value = hexDump(state.file, 8192, offset);publishFileAnalysis(); });
action('file-strings', 'file-status', () => { if (!state.file) throw new Error('请先选择文件。'); const found = asciiStrings(state.file); $('file-output').value = found.length ? found.map(x => `0x${x.offset.toString(16).padStart(8, '0')}  ${x.text}`).join('\n') : '未找到至少 4 个连续字符的可打印 ASCII 字符串。'; publishFileAnalysis();setStatus('file-status', `显示 ${found.length} 个字符串（最多 1000 个）`); });
action('file-hash', 'file-status', async () => {
  if (!state.file) throw new Error('请先选择文件。'); if (!crypto.subtle) throw new Error('摘要功能需要 HTTPS 或 localhost。'); const generation = state.fileGeneration, bytes = state.file;
  clearFileAnalysis();const analysisVersion=fileAnalysisRevision;setStatus('file-status', '正在计算摘要…'); const hash = bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).replace(/ /g, ''); if (generation !== state.fileGeneration||analysisVersion!==fileAnalysisRevision) return;
  $('file-output').value = 'SHA-256\n' + hash;publishFileAnalysis(); setStatus('file-status', '摘要计算完成');
});
action('file-copy', 'file-status', async () => { await copy($('file-output').value); setStatus('file-status', '结果已复制'); });

const fileRecording=resultRecording({id:'file-original',anchor:sharedFile,source:'file'});
fileRecording.buttons[0].textContent='将原文件加入笔记本';fileRecording.buttons[1].textContent='将原文件加入白板 / 脑图';
document.addEventListener('arg:fileready',()=>fileRecording.publish(state.file?{bytes:state.file,name:state.fileSource?.name}:null));
document.addEventListener('arg:filechange',()=>{fileRecording.clear();clearFileAnalysis();});
document.addEventListener('arg:nativetaskchange',e=>{if(e.detail.panel!=='file')return;$('file-output').value='';clearFileAnalysis();setStatus('file-status','');if(state.file)fileRecording.publish({bytes:state.file,name:state.fileSource?.name});});
return {editor:hexEditor,load:loadFile,syncMode:syncFileMode,getBytes:()=>state.file,getFile:()=>state.fileSource,snapshot:()=>state.file?{bytes:state.file,generation:state.fileGeneration}:null};
}
