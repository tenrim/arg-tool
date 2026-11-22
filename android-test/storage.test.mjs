import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('./storage.js',import.meta.url),'utf8');
function boot({saved='',volatile={}}={}){
 let durable=saved;
 class Storage{constructor(values={}){this.values=new Map(Object.entries(values))}get length(){return this.values.size}key(i){return [...this.values.keys()][i]??null}getItem(k){return this.values.get(String(k))??null}setItem(k,v){this.values.set(String(k),String(v))}removeItem(k){this.values.delete(String(k))}clear(){this.values.clear()}}
 const localStorage=new Storage(volatile),sessionStorage=new Storage();
 const commit=fn=>{const value=JSON.parse(durable||'{}');fn(value);durable=JSON.stringify(value)};
 const context=vm.createContext({Storage,localStorage,sessionStorage,MistStorage:{snapshot:()=>durable,initialize:s=>{durable=s},put:(k,v)=>commit(o=>o[k]=v),remove:k=>commit(o=>delete o[k]),clear:()=>durable='{}'}});context.window=context;vm.runInContext(code,context);
 return{context,localStorage,sessionStorage,get durable(){return durable}};
}
test('initial install preserves and mirrors existing browser preference keys',()=>{const h=boot({volatile:{'arg.ui.preferences.v1':'{"motion":"reduce"}'}});assert.equal(JSON.parse(h.durable)['arg.ui.preferences.v1'],'{"motion":"reduce"}');});
test('immediate process loss restores synchronously committed preference',()=>{const a=boot();a.localStorage.setItem('arg.ui.preferences.v1','{"motion":"reduce"}');const b=boot({saved:a.durable});assert.equal(b.localStorage.getItem('arg.ui.preferences.v1'),'{"motion":"reduce"}');});
test('remove and clear cannot resurrect old preferences after restart',()=>{const a=boot({volatile:{a:'1',b:'2'}});a.localStorage.removeItem('a');const b=boot({saved:a.durable,volatile:{a:'old',b:'old'}});assert.equal(b.localStorage.getItem('a'),null);assert.equal(b.localStorage.getItem('b'),'2');b.localStorage.clear();assert.equal(boot({saved:b.durable,volatile:{b:'old'}}).localStorage.length,0);});
test('sessionStorage is not copied into durable preferences',()=>{const a=boot();a.sessionStorage.setItem('private-session','session-only');assert.deepEqual(JSON.parse(a.durable),{});});
