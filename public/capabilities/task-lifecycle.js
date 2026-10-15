import {onDisconnect} from '../ui/index.js';

// Route and task identity own async lifetime. Engine adapters retain their input,
// result models and revision checks; the owner synchronously tells them when a
// lease has ended, before another task can accept an old response.
export function createTaskLifecycleOwner({panelId='',taskId=null}={}) {
 const leases=new Map(),lastTasks=new Map();let active={panelId,taskId},destroyed=false;
 const notify=(lease,reason)=>lease.invalidate?.(reason);
 function enter(nextPanel,nextTask=null){
  if(destroyed)return;const previous=active;
  if(previous.panelId!==nextPanel){const lease=leases.get(previous.panelId);if(lease?.isBusy())notify(lease,'leave');}
  active={panelId:nextPanel,taskId:nextTask};
  const lease=leases.get(nextPanel);
  if(lease){
   if(lastTasks.has(nextPanel)&&lastTasks.get(nextPanel)!==nextTask)notify(lease,'task-change');
   lastTasks.set(nextPanel,nextTask);
   const pending=lease.pending;lease.pending=null;pending?.();
  }
  // A deferred bridge request belongs to the next actual destination, not to
  // an eventual future visit after the user has chosen a different route.
  for(const [id,other]of leases)if(id!==nextPanel)other.pending=null;
 }
 function leave(panel){
  if(destroyed||active.panelId!==panel)return;
  const lease=leases.get(panel);if(lease?.isBusy())notify(lease,'leave');
  active={panelId:'',taskId:null};
 }
 function register(panel,{isBusy=()=>false,invalidate,dispose}={}){
  if(destroyed)throw Error('任务生命周期已销毁。');
  if(leases.has(panel))throw Error('任务生命周期重复登记：'+panel);
  const lease={isBusy,invalidate,dispose,pending:null};leases.set(panel,lease);
  if(active.panelId===panel)lastTasks.set(panel,active.taskId);
  let released=false;
  return {get active(){return !released&&!destroyed&&active.panelId===panel;},
   whenActive(action){if(released||destroyed)return false;if(active.panelId===panel){action();return true;}lease.pending=action;return false;},
   destroy(){if(released)return;released=true;if(destroyed)return;lease.pending=null;leases.delete(panel);lastTasks.delete(panel);lease.dispose?.();},
  };
 }
 return {enter,leave,register,get active(){return {...active};},destroy(){if(destroyed)return;destroyed=true;for(const lease of leases.values()){lease.pending=null;lease.dispose?.();}leases.clear();lastTasks.clear();active={panelId:'',taskId:null};}};
}

const owners=new WeakMap();
export function getTaskLifecycleOwner(target=globalThis.document){
 if(!target)throw Error('任务生命周期需要事件目标。');
 if(owners.has(target))return owners.get(target);
 const hash=globalThis.location?.hash?.slice(1)||'',path=hash.split('?')[0],query=new URLSearchParams(hash.split('?')[1]||'');
 const owner=createTaskLifecycleOwner({panelId:path.split('/')[0],taskId:query.get('task')});
 const route=event=>owner.enter(event.detail?.name||'',event.detail?.capabilityId||null);
 const native=event=>{const detail=event.detail||{};if(detail.reason==='leave')owner.leave(detail.panel);else if(owner.active.panelId===detail.panel)owner.enter(detail.panel,detail.id||null);};
 target.addEventListener('arg:panelchange',route);target.addEventListener('arg:nativetaskchange',native);
 const destroy=owner.destroy;owner.destroy=()=>{destroy();target.removeEventListener('arg:panelchange',route);target.removeEventListener('arg:nativetaskchange',native);owners.delete(target);};
 owners.set(target,owner);return owner;
}

export function mountTaskLifecycle(panel,callbacks){
 const id=panel.id.replace(/^panel-/,''),lease=getTaskLifecycleOwner(panel.ownerDocument).register(id,callbacks);
 onDisconnect(panel,()=>lease.destroy());return lease;
}
