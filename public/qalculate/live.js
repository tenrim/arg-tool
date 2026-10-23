// Latest-only local calculation. Invalidation is synchronous; the short typing
// coalescing window never owns correctness, which is guarded by the revision.
export function liveCalculation({run,cancel,clear,publish,fail,pending,delay=120,setTimer=setTimeout,clearTimer=clearTimeout}){
 let revision=0,timer=null,busy=false,dead=false;
 function invalidate(){revision++;if(timer!==null)clearTimer(timer);timer=null;if(busy)cancel();busy=false;clear();}
 async function execute(value,gen){
  if(dead||gen!==revision)return;timer=null;busy=true;pending?.();
  try{const result=await run(value);if(!dead&&gen===revision)publish(result);}
  catch(error){if(!dead&&gen===revision)fail(error);}
  finally{if(gen===revision)busy=false;}
 }
 return {
  update(value,{immediate=false}={}){if(dead)return;invalidate();if(value==null)return;const gen=revision;if(immediate)void execute(value,gen);else timer=setTimer(()=>void execute(value,gen),delay);},
  stop(){if(!dead)invalidate();},
  destroy(){if(dead)return;invalidate();dead=true;cancel();}
 };
}
