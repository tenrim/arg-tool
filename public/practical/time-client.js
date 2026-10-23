// Named adapter to the existing complete TZif worker; one cancellable owner per form.
export function timeClient(){let worker=null,pending=null,serial=0,timer=null;
 function cancel(){serial++;clearTimeout(timer);worker?.terminate();worker=null;if(pending){pending.reject(Error('已停止。'));pending=null;}}
 return {cancel,run(type,params={}){cancel();const id=serial;return new Promise((resolve,reject)=>{
  pending={resolve,reject};worker=new Worker(new URL('../timezones/worker.js',import.meta.url));
  const end=(error,value)=>{if(id!==serial)return;clearTimeout(timer);pending=null;worker?.terminate();worker=null;error?reject(error):resolve(value);};
  worker.onmessage=({data})=>{if(data.id===id)end(data.error?Error(data.error):null,data.result);};worker.onerror=()=>end(Error('时区资料载入失败，请重试。'));
  timer=setTimeout(()=>end(Error('时区计算超时，请重试。')),30000);
  worker.postMessage({id,type,...params,resourceBase:new URL('../',import.meta.url).href});
 });}};
}
