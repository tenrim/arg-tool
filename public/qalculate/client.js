// A cancelled computation loses its entire WASM instance. Restoring explicit
// definitions/options in a fresh instance cannot deliver an old result.
export function qalculateClient(){
 let worker=null,serial=0,pending=new Map();
 function cancel(message='计算已停止。'){
  worker?.terminate();worker=null;
  for(const {reject,timer} of pending.values()){clearTimeout(timer);reject(Error(message));}
  pending.clear();
 }
 function run(op,data={}){
  if(!worker){
   worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});
   worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;pending.delete(data.id);clearTimeout(p.timer);data.error?p.reject(Error(data.error)):p.resolve(data.result);};
   worker.onerror=()=>cancel('Qalculate 内核加载或执行失败。可以保留输入重试。');
  }
  return new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>cancel('计算超过 60 秒，已终止完整任务，没有返回部分结果。'),60000);pending.set(id,{resolve,reject,timer});worker.postMessage({id,op,...data});});
 }
 return{run,cancel};
}
