import test from 'node:test';
import assert from 'node:assert/strict';
import {snapshot,recommendations,compatibleTargets,groupTargets,MAX_HANDOFF_BYTES} from '../public/handoff/model.js';
import {createHandoffTargets} from '../public/handoff/targets.js';
test('handoff preserves binary bytes, CRLF and BOM; never decodes invalid UTF-8',()=>{
  const bytes=new Uint8Array([0,255,128,13,10]),copy=snapshot({bytes});bytes.fill(1);assert.deepEqual([...copy.bytes],[0,255,128,13,10]);assert.equal(copy.text,null);
  assert.equal(snapshot({text:'a\r\nb'}).text,'a\r\nb');assert.equal(snapshot({bytes:new Uint8Array([239,187,191,65])}).text,'\uFEFFA');
  assert.throws(()=>snapshot({bytes:new Uint8Array(MAX_HANDOFF_BYTES+1)}),/32 MB/);
});
test('recommendations use registered targets, prioritize source and never invent lookup/model links',()=>{
  const native=['native:file','native:hex-editor','native:image'].map(id=>({id,title:id,open:{kind:'native'}}));
  const ops=['From Base64','From Hex','URL Decode','Magic','ROT13','To Hex','Entropy','Unzip'].map(op=>[op,{id:'op:'+op,title:op,open:{kind:'operation'}}]);
  const r={byId:new Map(native.map(e=>[e.id,e])),byOperation:new Map(ops)};
  assert.equal(recommendations(snapshot({text:'UEVL'}),'chef',r)[0].op,'From Base64');
  assert.equal(recommendations(snapshot({bytes:new Uint8Array([80,75,3,4])}),'archive',r)[0].op,'Unzip');
  assert.equal(recommendations(snapshot({text:'UEVL'}),'image',r)[0].entry.id,'native:hex-editor');
  assert(!recommendations(snapshot({text:'UEVL'}),'chef',r).some(x=>/model|countries/.test(x.entry.id)));
});
test('a superseded navigation cannot adopt data into a newly chosen task',async()=>{
  let state={revision:1,entry:null},adopted=0;const entry={id:'op:To Hex',route:'encoding',open:{kind:'operation',panel:'encoding'}};
  const targets=createHandoffTargets({current:()=>state,navigate:async()=>{state={revision:3,entry};},controller:()=>({adopt:()=>{adopted++;return true;}}),material:()=>null});
  assert.equal(await targets.receive({entry,op:'To Hex'},snapshot({text:'secret'}),()=>true),false);assert.equal(adopted,0);
  state={revision:1,entry:null};const good=createHandoffTargets({current:()=>state,navigate:async()=>{state={revision:2,entry};},controller:()=>({adopt:value=>{assert.equal(value.kind,'bytes');adopted++;return true;}}),material:()=>null});
  assert.equal(await good.receive({entry,op:'To Hex'},snapshot({text:'a\r\nb'}),()=>true),true);assert.equal(adopted,1);
});
test('other targets retain family directions and exclude incompatible text/image or special tools',()=>{
  const registry={entries:[{id:'pair:x',open:{kind:'operation'},directions:[{op:'encode'},{op:'decode'}]},{id:'image',open:{kind:'operation',operation:'image'}},{id:'native:model',open:{kind:'native'}},{id:'native:airports',open:{kind:'native'}}]};
  const catalogue={operations:{encode:{inputType:'ArrayBuffer'},decode:{inputType:'string'},image:{inputType:'ArrayBuffer'}}};
  const list=compatibleTargets(snapshot({bytes:new Uint8Array([255])}),registry,catalogue,new Set(['image']));assert.equal(list.length,1);assert.deepEqual(list[0].directions,[{op:'encode'}]);
});
test('target hierarchy projects registry category/group order and counts only compatible families',()=>{
  const registry={categories:[{id:'codec',title:'编码'},{id:'media',title:'媒体'},{id:'reference',title:'资料'}],groups:[{id:'base',title:'编码组',category:'codec'},{id:'files',title:'文件组',category:'media'}]};
  const targets=[{entry:{id:'file',category:'media',group:'files'}},{entry:{id:'base64',category:'codec',group:'base'},directions:[{op:'encode'},{op:'decode'}]}];
  const tree=groupTargets(targets,registry);assert.deepEqual(tree.map(c=>c.id),['codec','media']);assert.equal(tree[0].count,1);assert.equal(tree[0].groups[0].title,'编码组');assert.equal(tree[0].groups[0].targets[0],targets[1]);assert.equal(tree[1].groups[0].targets[0],targets[0]);
});
