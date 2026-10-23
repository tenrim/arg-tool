import {Link,onDisconnect,setState,setTextareaValue,updateStatus} from '../ui/index.js';
import {notebookActions} from '../handoff/button.js';
const sessions=new Map();
export const getExpansionSession=id=>sessions.get(id)||null;
export function saveFile(data,name,type='text/plain;charset=utf-8'){
 const url=URL.createObjectURL(data instanceof Blob?data:new Blob([data],{type}));
 try{Link({text:name,attrs:{href:url,download:name}}).click();}finally{setTimeout(()=>URL.revokeObjectURL(url),1000);}
}
export function startWorkerJob(payload,{audio=false,onProgress=()=>{},signal,timeoutMs=30000}={}){
 let worker;
 const promise=new Promise((resolve,reject)=>{
  let ended=false,timer;
  const end=(error,value)=>{if(ended)return;ended=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);worker?.terminate();error?reject(error):resolve(value);};
  const abort=()=>end(Object.assign(Error('已停止'),{name:'AbortError'}));
  if(signal?.aborted){reject(Object.assign(Error('已停止'),{name:'AbortError'}));return;}
  worker=new Worker(new URL(audio?'../audio-worker.js':'./worker.js',import.meta.url),{type:'module'});
  timer=setTimeout(()=>end(Error('运算超时，已停止；请缩小输入范围后重试。')),timeoutMs);
  signal?.addEventListener('abort',abort,{once:true});
  worker.onmessage=({data})=>{if(data.kind==='progress'){onProgress(data);return;}data.error?end(Error(data.error)):end(null,data.result??data);};
  worker.onerror=event=>{event.preventDefault();end(Error(event.message||'本地线程无法启动，请重试。'));};
  worker.onmessageerror=()=>end(Error('无法读取运算结果。'));
  worker.postMessage({...payload,resourceBase:new URL('../',import.meta.url).href});
 });
 return promise;
}
export function taskSession(view,{id,options=()=>({}),execute,render,save,source='text',onInvalidate=()=>{}}){
 let revision=0,controller=null,result=null,lease=null,rawInput=null,adopting=false,busy=false;
 const recording=notebookActions({id,source,snapshot:()=>lease});
 view.use.before(...recording.buttons);
 const getInput=()=>rawInput?.display===view.input.value?rawInput.text:view.input.value;
 const sync=()=>{setState(view.run,{busy});view.run.disabled=busy;view.stop.disabled=!busy;view.use.disabled=view.copy.disabled=view.save.disabled=!result;recording.setEnabled(!!result);};
 function invalidate(message=''){
  revision++;controller?.abort();controller=null;busy=false;result=null;lease=null;setTextareaValue(view.output,'',{feedback:false});view.details.replaceChildren();onInvalidate();updateStatus(view.status,message);sync();
 }
 async function run(){
  invalidate('正在本地计算…');const version=revision;controller=new AbortController();busy=true;sync();
  try{
   const input=getInput(),config=options();const value=await execute(input,config,{signal:controller.signal,onProgress:p=>{if(version===revision)updateStatus(view.status,p.message||p.text||`正在处理${p.progress!==undefined?' '+Math.round(p.progress*100)+'%':''}…`);}});
   if(version!==revision)return;result=value;lease={value:value.value??{text:value.output}};setTextareaValue(view.output,value.output??'');render?.(value,config,input);updateStatus(view.status,value.status||'已完成','success');
  }catch(error){if(version===revision){result=null;lease=null;setTextareaValue(view.output,'',{feedback:false});view.details.replaceChildren();onInvalidate();updateStatus(view.status,error.message||String(error),'error');}}
  finally{if(version===revision){controller=null;busy=false;sync();}}
 }
 const adopt=text=>{const original=String(text??'');adopting=true;setTextareaValue(view.input,original);rawInput={text:original,display:view.input.value};view.input.dispatchEvent(new Event('input',{bubbles:true}));adopting=false;};
 view.input.addEventListener('input',()=>{if(!adopting)rawInput=null;invalidate();});
 view.parameters.addEventListener('input',()=>invalidate(),{capture:true});view.parameters.addEventListener('change',()=>invalidate(),{capture:true});
 view.run.onclick=run;view.stop.onclick=()=>invalidate('已停止');view.use.onclick=()=>{if(result&&typeof result.output==='string')adopt(result.output);};
 view.copy.onclick=async()=>{if(!result)return;const snapshot=result;try{await navigator.clipboard.writeText(snapshot.output);if(result===snapshot)updateStatus(view.status,'已复制','success');}catch{if(result===snapshot)updateStatus(view.status,'请选中结果后手动复制。','error');}};
 view.save.onclick=async()=>{if(!result)return;const snapshot=result;try{await(save?save(snapshot):saveFile(snapshot.output,'迷雾工具箱-'+id+'.txt'));}catch(error){if(result===snapshot)updateStatus(view.status,error.message||String(error),'error');}};
 const leave=({detail})=>{if(detail.name!==id)invalidate();};document.addEventListener('arg:panelchange',leave);
 const task=({detail})=>{if(detail.panel===id)invalidate();};document.addEventListener('arg:nativetaskchange',task);
 view.root.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'&&!busy){event.preventDefault();void run();}});
 const api={run,invalidate,adopt,getInput,getInputModel:()=>({kind:'text',source:'text',text:getInput()}),adoptInput:value=>{if(value?.kind!=='text'||value.source!=='text')return false;adopt(value.text);return true;},getResult:()=>result};sessions.set(id,api);
 onDisconnect(view.root,()=>{invalidate();document.removeEventListener('arg:panelchange',leave);document.removeEventListener('arg:nativetaskchange',task);sessions.delete(id);});sync();return api;
}
