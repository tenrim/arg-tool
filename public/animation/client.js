// The worker owns all decoded pixels. Cancellation destroys its memory and
// rejects every request, including one waiting for first-load module imports.
export function animationClient(){
 let worker=null,serial=0,pending=new Map();
 const cancel=(message='动画处理已取消。')=>{worker?.terminate();worker=null;for(const {reject,timer} of pending.values()){clearTimeout(timer);reject(Error(message));}pending.clear();};
 function run(op,data={}){
  if(!worker){
   worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});
   worker.onmessage=({data})=>{const entry=pending.get(data.id);if(!entry)return;pending.delete(data.id);clearTimeout(entry.timer);if(data.error)entry.reject(Error(data.error));else entry.resolve(data.result);};
   worker.onerror=()=>cancel('本地动画引擎加载失败，请重新分析。');
  }
  return new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>cancel('完整动画处理超过 60 秒，已停止；没有返回部分结果。'),60000);pending.set(id,{resolve,reject,timer});worker.postMessage({id,op,...data});});
 }
 return{run,cancel};
}
