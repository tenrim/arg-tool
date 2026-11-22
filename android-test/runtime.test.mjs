import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const script=await readFile(new URL('./runtime.js',import.meta.url),'utf8');
function setup(){
 const events={},documentEvents={};let stopped=0,resolve;
 const track={stop(){stopped++},addEventListener(){}};
 const context=vm.createContext({DOMException,document:{hidden:false,addEventListener:(k,f)=>documentEvents[k]=f},navigator:{mediaDevices:{getUserMedia:()=>new Promise(r=>resolve=r)}},addEventListener:(k,f)=>events[k]=f});context.window=context;vm.runInContext(script,context);
 return{context,events,documentEvents,get stopped(){return stopped},fulfil(){resolve({getTracks:()=>[track]})}};
}
test('active microphone tracks stop when app hides',async()=>{
 const h=setup(),p=h.context.navigator.mediaDevices.getUserMedia({audio:true});h.fulfil();await p;
 h.context.document.hidden=true;h.documentEvents.visibilitychange();assert.equal(h.stopped,1);
});
test('late permission fulfilment after background is rejected and released',async()=>{
 const h=setup(),p=h.context.navigator.mediaDevices.getUserMedia({audio:true});h.events.pagehide();h.fulfil();await assert.rejects(p,{name:'AbortError'});assert.equal(h.stopped,1);
});
test('normal result stays live until explicit lifecycle release',async()=>{
 const h=setup(),p=h.context.navigator.mediaDevices.getUserMedia({audio:true});h.fulfil();await p;assert.equal(h.stopped,0);
 h.context.__mistReleaseMicrophone();assert.equal(h.stopped,1);h.context.__mistReleaseMicrophone();assert.equal(h.stopped,1);
});
