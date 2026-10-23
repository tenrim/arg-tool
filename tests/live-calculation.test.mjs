import test from 'node:test';
import assert from 'node:assert/strict';
import {liveCalculation} from '../public/qalculate/live.js';
import {unitAmount} from '../public/qalculate/player-model.js';

test('live calculations clear synchronously, coalesce typing and reject late success/error after edits, stop and disposal',async()=>{
 const timers=new Map(),pending=[],shown=[],errors=[];let serial=0,cleared=0,cancelled=0;
 const live=liveCalculation({setTimer:fn=>{timers.set(++serial,fn);return serial;},clearTimer:id=>timers.delete(id),clear:()=>cleared++,cancel:()=>cancelled++,run:value=>new Promise((resolve,reject)=>pending.push({value,resolve,reject})),publish:r=>shown.push(r),fail:e=>errors.push(e.message)});
 const tick=()=>{for(const [id,fn]of timers){timers.delete(id);fn();}};
 live.update('1');live.update('12');live.update('123');assert.equal(cleared,3);assert.equal(timers.size,1);tick();assert.equal(pending[0].value,'123');
 live.update('456');assert.equal(cancelled,1);pending[0].resolve('stale');await Promise.resolve();assert.deepEqual(shown,[]);tick();pending[1].resolve('current');await Promise.resolve();assert.deepEqual(shown,['current']);
 live.update('789',{immediate:true});live.stop();pending[2].reject(Error('stale error'));await Promise.resolve();assert.deepEqual(errors,[]);assert.equal(timers.size,0);
 live.update('10');live.destroy();tick();assert.equal(pending.length,3);live.update('11',{immediate:true});assert.equal(pending.length,3);
});
test('partial decimal/scientific drafts stay quiet and warm unit calculations cannot accept state-changing expressions',()=>{
 for(const value of ['', ' ', '-', '+', '.', '-.', '1e', '.5e-', '1.2E+'])assert.equal(unitAmount(value),null,value);
 for(const [input,value]of [['800','800'],['−2.5','-2.5'],['.5','.5'],['1.2e-3','1.2e-3'],['0','0']])assert.equal(unitAmount(input),value);
 for(const value of ['x=5','1+1','1 m','NaN','Infinity','1e10001','1'.repeat(1001)])assert.throws(()=>unitAmount(value));
});
