import {Box,Button,Toolbar,Status,Dialog,dialogController,updateStatus} from '../ui/index.js';
import {MAX_ASSET} from './model.js';

// Microphone access only follows the explicit start button. Closing, switching
// pages or destroying the notebook always releases every media track.
export function createNoteRecorder(save){
 let stream=null,recorder=null,chunks=[],size=0,generation=0,target=null,keep=false;
 const status=Status(),close=Button({text:'取消'}),start=Button({text:'开始录音',variant:'primary'}),stop=Button({text:'保存录音',disabled:true});
 const dialog=Dialog({id:'notebook-recorder',className:'ui-flow-dialog',attrs:{'aria-labelledby':'notebook-recorder-title'},children:[Box({tag:'h2',id:'notebook-recorder-title',text:'录音笔记'}),status,Toolbar({children:[start,stop,close]})]});document.body.append(dialog);
 const modal=dialogController(dialog,{closeButton:close,initialFocus:start});
 function release(){generation++;keep=false;if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());stream=null;recorder=null;chunks=[];size=0;}
 start.addEventListener('click',async()=>{const revision=++generation;start.disabled=true;updateStatus(status,'正在请求麦克风…');
  try{if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw Error('当前浏览器不支持本地录音，可添加已有音频文件。');
   const media=await navigator.mediaDevices.getUserMedia({audio:true});if(revision!==generation){media.getTracks().forEach(t=>t.stop());return;}stream=media;
   recorder=new MediaRecorder(stream);chunks=[];size=0;keep=false;
   recorder.ondataavailable=e=>{if(revision!==generation)return;size+=e.data.size;if(size>MAX_ASSET){release();start.disabled=false;stop.disabled=true;updateStatus(status,'录音超过 32 MB，请分段录制。','error');return;}chunks.push(e.data);if(size)updateStatus(status,`正在录音 · 已记录 ${(size/1024).toFixed(1)} KB`);};
   recorder.onerror=()=>{if(revision!==generation)return;release();start.disabled=false;stop.disabled=true;updateStatus(status,'录音失败，请检查麦克风后重试。','error');};
   recorder.onstop=async()=>{if(revision!==generation)return;stream?.getTracks().forEach(t=>t.stop());stream=null;
    if(keep){const type=recorder.mimeType||'audio/webm',file=new File(chunks,['录音',new Date().toISOString().replace(/[:.]/g,'-')].join('-')+(type.includes('mp4')?'.m4a':'.webm'),{type});try{if(!file.size)throw Error('录音时间太短，没有收到音频数据，请重新录制。');await save(target,file);if(revision!==generation)return;modal.close();}catch(error){if(revision!==generation)return;updateStatus(status,error.message,'error');}}
    if(revision!==generation)return;
    start.disabled=false;stop.disabled=true;
   };recorder.start(1000);stop.disabled=false;updateStatus(status,'正在录音 · 完成后点击“保存录音”');
  }catch(error){if(revision!==generation)return;release();start.disabled=false;stop.disabled=true;updateStatus(status,error.name==='NotAllowedError'?'未获得麦克风权限，也可以直接添加音频文件。':error.message,'error');}
 });
 stop.addEventListener('click',()=>{if(recorder?.state!=='recording')return;keep=true;stop.disabled=true;updateStatus(status,'正在保存录音…');recorder.stop();});
 dialog.addEventListener('close',release);
 return{open(id){release();target=id;start.disabled=false;stop.disabled=true;updateStatus(status,'录音保存在当前笔记的本机附件中。');modal.open();},close(){modal.close();release();},destroy(){release();modal.destroy();dialog.remove();}};
}
