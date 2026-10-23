// Both the public proxy and standalone mail service bound requests before
// buffering attachments. This owns HTTP lifetime, never SMTP retry decisions.
const failure=(status,message)=>Object.assign(Error(message),{status});
export function createFeedbackIngress({maxActive=8,timeoutMs=30000,maxBytes=6*1024*1024}={}){
 const active=new Set();
 return{
  acquire(req,res){
   if(active.size>=maxActive)throw failure(503,'反馈服务繁忙，请稍后重试。');
   if(Number(req.headers['content-length'])>maxBytes)throw failure(413,'报告过大，请减少附件。');
   const controller=new AbortController(),{signal}=controller;active.add(controller);
   const abort=()=>controller.abort(failure(499,'提交已取消。'));
   const timer=setTimeout(()=>controller.abort(failure(408,'报告提交超时，请重试。')),timeoutMs);timer.unref?.();
   req.once('aborted',abort);res.once('close',abort);
   function wait(operation){
    const pending=Promise.resolve(operation);
    if(signal.aborted){pending.catch(()=>{});return Promise.reject(signal.reason);}
    return new Promise((resolve,reject)=>{
     const cancelled=()=>{signal.removeEventListener('abort',cancelled);reject(signal.reason);};
     signal.addEventListener('abort',cancelled,{once:true});
     pending.then(value=>{signal.removeEventListener('abort',cancelled);resolve(value);},error=>{signal.removeEventListener('abort',cancelled);reject(error);});
    });
   }
   return{signal,wait,
    read(){return new Promise((resolve,reject)=>{
     let size=0;const chunks=[];
     const cleanup=()=>{req.off('data',data);req.off('end',end);req.off('error',error);signal.removeEventListener('abort',cancelled);};
     const fail=reason=>{cleanup();req.resume();reject(reason);};
     const error=()=>fail(failure(400,'无法读取报告，请重试。')),cancelled=()=>fail(signal.reason);
     const data=chunk=>{size+=chunk.length;if(size>maxBytes)fail(failure(413,'报告过大，请减少附件。'));else chunks.push(chunk);};
     const end=()=>{cleanup();resolve(Buffer.concat(chunks));};
     req.on('data',data);req.once('end',end);req.once('error',error);signal.addEventListener('abort',cancelled,{once:true});
     if(signal.aborted)cancelled();
    });},
    release(){clearTimeout(timer);req.off('aborted',abort);res.off('close',abort);active.delete(controller);}
   };
  },
  close(){for(const controller of active)controller.abort(failure(503,'反馈服务正在关闭。'));}
 };
}
