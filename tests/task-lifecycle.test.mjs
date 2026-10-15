import test from 'node:test';
import assert from 'node:assert/strict';
import {createTaskLifecycleOwner,getTaskLifecycleOwner} from '../public/capabilities/task-lifecycle.js';

test('task lifecycle: leaving synchronously cancels pending work before old results can repaint',()=>{
 const owner=createTaskLifecycleOwner({panelId:'calendar',taskId:'native:calendar'});let busy=true,revision=1,result='',stops=0;
 const lease=owner.register('calendar',{isBusy:()=>busy,invalidate(){revision++;busy=false;result='';stops++;}});
 const run=revision;owner.enter('home');assert.equal(busy,false);assert.equal(lease.active,false);assert.equal(stops,1);
 if(run===revision)result='late success';assert.equal(result,'');owner.enter('home');assert.equal(stops,1);
});
test('task lifecycle: same-panel task identity invalidates completed output exactly once',()=>{
 const owner=createTaskLifecycleOwner({panelId:'chemistry',taskId:'native:chemistry'});const changes=[];
 owner.register('chemistry',{isBusy:()=>false,invalidate:reason=>changes.push(reason)});
 owner.leave('chemistry');owner.enter('chemistry','native:chemistry-formula');owner.enter('chemistry','native:chemistry-formula');
 assert.deepEqual(changes,['task-change']);
});
test('task lifecycle: deferred bridge adopts only the latest selection after target enters',()=>{
 const owner=createTaskLifecycleOwner({panelId:'sky'});const calls=[];
 const lease=owner.register('astronomy',{invalidate:reason=>calls.push(reason)});
 assert.equal(lease.whenActive(()=>calls.push('first')),false);lease.whenActive(()=>calls.push('latest'));
 owner.leave('sky');assert.deepEqual(calls,[]);owner.enter('astronomy','native:astronomy');assert.deepEqual(calls,['latest']);
 owner.enter('astronomy','native:astronomy');assert.deepEqual(calls,['latest']);
});
test('task lifecycle: superseded destination and destroyed lease cannot run a deferred query',()=>{
 const owner=createTaskLifecycleOwner({panelId:'sky'});let calls=0,disposed=0;
 const lease=owner.register('astronomy',{dispose:()=>disposed++});lease.whenActive(()=>calls++);owner.enter('home');owner.enter('astronomy');assert.equal(calls,0);
 owner.leave('astronomy');lease.whenActive(()=>calls++);lease.destroy();lease.destroy();owner.enter('astronomy');assert.equal(calls,0);assert.equal(disposed,1);assert.equal(lease.whenActive(()=>calls++),false);
});
test('task lifecycle: route and native events use one owner and preserve task-change detection through staging leave',()=>{
 const target=new EventTarget(),owner=getTaskLifecycleOwner(target);assert.equal(getTaskLifecycleOwner(target),owner);
 let busy=false;const changes=[];owner.register('sequence',{isBusy:()=>busy,invalidate:reason=>{busy=false;changes.push(reason);}});
 const event=(name,detail)=>target.dispatchEvent(new CustomEvent(name,{detail}));
 event('arg:panelchange',{name:'sequence',capabilityId:'native:sequence-processing'});busy=true;
 event('arg:nativetaskchange',{panel:'sequence',id:null,reason:'leave'});assert.equal(busy,false);event('arg:panelchange',{name:'sequence',capabilityId:'native:sequence'});event('arg:nativetaskchange',{panel:'sequence',id:'native:sequence'});
 assert.deepEqual(changes,['leave','task-change']);owner.destroy();event('arg:panelchange',{name:'sequence'});assert.equal(owner.active.panelId,'');
});
test('task lifecycle: owner and lease destruction release resources once in either order',()=>{
 const owner=createTaskLifecycleOwner();let disposed=0;const lease=owner.register('calendar',{dispose:()=>disposed++});owner.destroy();owner.destroy();lease.destroy();assert.equal(disposed,1);
});
