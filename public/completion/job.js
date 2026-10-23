// One disposable worker per execution: cancellation cannot leave a live engine.
export function completionJob(payload,{signal,onProgress=()=>{}}={}){
 return new Promise((resolve,reject)=>{
  let worker,timer,ended=false;
  const finish=(error,result)=>{if(ended)return;ended=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);worker?.terminate();error?reject(error):resolve(result);};
  const abort=()=>finish(Object.assign(Error('已停止'),{name:'AbortError'}));
  if(signal?.aborted)return abort();
  worker=new Worker(new URL(payload.task==='braille-languages'?'./braille-worker.js':'./worker.js',import.meta.url),payload.task==='braille-languages'?{}:{type:'module'});
  signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>finish(Error('处理超时，已终止本次运算。')),60000);
  worker.onerror=e=>{e.preventDefault();finish(Error(e.message||'本地引擎加载失败。'));};worker.onmessageerror=()=>finish(Error('无法读取引擎结果。'));
  worker.onmessage=({data})=>data.progress?onProgress(data):finish(data.error?Error(data.error):null,data.result);
  worker.postMessage(payload);
 });
}
