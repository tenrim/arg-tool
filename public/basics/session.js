import {captureFailure} from '../feedback/model.js';
import {onDisconnect, setState, setTextareaValue, updateStatus} from '../ui/index.js';
import {copy,download} from '../round1/common.js';
import {CyberChefClient} from '../cyberchef-client.js';
import {getCatalogue} from '../chef-tools/catalog.js';
import {foundationRecipe,foundationInput} from './foundation.js';
import {localizedError} from '../cyberchef-i18n.js';
import {normalizeInputSource} from '../capabilities/input-session.js';
import {continueButton} from '../handoff/button.js';

const sessions=new Map();
export const getConversionSession=id=>sessions.get(id)||null;

export function conversionSession(view,{id,options,draw}) {
  let revision=0,worker=null,client=null,timer=null,pending=null,result=null,busy=false;
  // Native textarea values normalize CR/CRLF to LF. Keep adopted engine data
  // separately from that display projection until the user actually edits it.
  let inputSnapshot=null,adopting=false;
  let handedResult;
  const next=continueButton({id:id+'-continue',source:'text',read:()=>{handedResult=result;return {text:result?.output};},isCurrent:()=>!!handedResult&&handedResult===result});view.use.before(next);
  const getInput=()=>inputSnapshot?.display===view.input.value?inputSnapshot.text:view.input.value;
  function sync(){setState(view.run,{busy});view.run.disabled=busy;view.stop.disabled=!busy;view.copy.disabled=view.save.disabled=view.use.disabled=next.disabled=!result;}
  function dispose(){worker?.terminate();worker=null;client?.close();client=null;clearTimeout(timer);timer=null;pending?.reject(Error('已停止'));pending=null;}
  function invalidate(message=''){revision++;dispose();busy=false;result=null;setTextareaValue(view.output,'',{feedback:false});view.details.replaceChildren();updateStatus(view.status,message);sync();}
  async function run(){invalidate('正在转换…');busy=true;sync();const version=revision;
    timer=setTimeout(()=>{if(version===revision)invalidate('转换超过 30 秒，已停止。');},30000);
    try {
      const text=getInput(),config=options();let response;
      if(id==='basics') {const catalogue=await getCatalogue();if(version!==revision)return;const recipe=foundationRecipe(catalogue,text,config);client=new CyberChefClient();const cooked=await client.bake(foundationInput(text,config),recipe,{structured:true});response={output:new TextDecoder('utf-8',{fatal:true}).decode(cooked.bytes)};}
      else {response=await new Promise((resolve,reject)=>{pending={resolve,reject};worker=new Worker(new URL('./worker.js',import.meta.url));worker.onmessage=({data})=>{pending=null;data.error?reject(Error(data.error)):resolve(data.result);};worker.onerror=event=>{event.preventDefault();pending=null;reject(Error('转换线程加载失败，请重试。'));};worker.onmessageerror=()=>{pending=null;reject(Error('无法读取转换结果。'));};worker.postMessage({kind:id,text,options:config,resourceBase:new URL('../',import.meta.url).href});});}
      if(version!==revision)return;result=response;setTextareaValue(view.output,response.output);draw?.(response,text,config);updateStatus(view.status,'转换完成','success');
    } catch(error) {captureFailure(error);if(version===revision){result=null;view.details.replaceChildren();setTextareaValue(view.output,'',{feedback:false});updateStatus(view.status,localizedError(error.message),'error');}}
    finally {if(version===revision){dispose();busy=false;sync();}}
  }
  view.run.onclick=run;view.stop.onclick=()=>invalidate('已停止');view.input.addEventListener('input',()=>{if(!adopting)inputSnapshot=null;invalidate();});
  // Invalidate before a page's dependent-preview listener, so live validation
  // and graphics updates cannot be erased by a later bubbling reset.
  view.parameters.addEventListener('input',()=>invalidate(),{capture:true});view.parameters.addEventListener('change',()=>invalidate(),{capture:true});
  view.root.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'&&!busy){event.preventDefault();void run();}});
  // Programmatic edits use the same input contract as typing so dependent
  // previews, parsers and result invalidation cannot diverge.
  const adopt=text=>{const original=String(text??'');setTextareaValue(view.input,original);inputSnapshot={text:original,display:view.input.value};adopting=true;try{view.input.dispatchEvent(new Event('input',{bubbles:true}));}finally{adopting=false;}};
  view.use.onclick=()=>{if(result)adopt(result.output);};
  view.copy.onclick=async()=>{if(!result)return;const version=revision;try{await copy(result.output);if(version===revision)updateStatus(view.status,'已复制','success');}catch(error){if(version===revision)updateStatus(view.status,error.message,'error');}};
  view.save.onclick=()=>{if(result)download(result.output,id+'-结果.txt');};
  const leave=({detail})=>{if(detail.name!==id)invalidate();};document.addEventListener('arg:panelchange',leave);
  const adoptInput=value=>{const input=normalizeInputSource(value);if(input?.kind!=='text'||input.source!=='text')return false;adopt(input.text);return true;};
  const api={run,invalidate,adopt,getInput,getInputModel:()=>({kind:'text',source:'text',text:getInput()}),adoptInput,getResult:()=>result};
  sessions.set(id,api);
  onDisconnect(view.root,()=>{invalidate();document.removeEventListener('arg:panelchange',leave);if(sessions.get(id)===api)sessions.delete(id);});sync();
  return api;
}
