import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectPanelTask,recentToolSelection} from '../public/capabilities/task-selection.js';
import {readFile} from 'node:fs/promises';
import {createRegistry} from '../public/capabilities/registry.js';

const entries=[
  {id:'op:first',category:'codec',route:'encoding/base',open:{panel:'encoding',kind:'operation',op:'First'},sourceOperationIds:['First']},
  {id:'pair:base',category:'codec',route:'encoding/base',open:{panel:'encoding',kind:'operation',op:'Encode'},sourceOperationIds:['Encode','Decode'],directions:[{op:'Encode'},{op:'Decode'}]},
  {id:'native:image',category:'media',route:'image',open:{panel:'image',kind:'native'},sourceOperationIds:[]},
  {id:'native:planes',category:'media',route:'image',open:{panel:'image',kind:'native'},sourceOperationIds:[]},
];
const registry={entries,byId:new Map(entries.map(entry=>[entry.id,entry])),byOperation:new Map([['First',entries[0]],['Encode',entries[1]],['Decode',entries[1]]]),aliases:new Map()};
test('recents use canonical workspace identity while keeping actual members; unrelated tasks sharing a panel remain distinct',async()=>{
 const actual=createRegistry(JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json',import.meta.url))));
 for(const [topic,ids]of [['braille',['braille','braille-languages','gs8']],['video',['video','video-gif','video-frames']],['code-runner',['code-python','code-javascript']]]){
  const selections=ids.map(id=>recentToolSelection(actual,{taskId:'native:'+id}));
  assert.ok(selections.every(item=>item.id==='topic:'+topic));assert.equal(new Set(selections.map(item=>item.route)).size,ids.length);
  for(let i=0;i<ids.length;i++)assert.equal(new URLSearchParams(selections[i].route.split('?')[1]).get('view'),'native:'+ids[i]);
 }
 assert.notEqual(recentToolSelection(actual,{taskId:'native:braille'}).id,recentToolSelection(actual,{taskId:'native:pigpen'}).id);
 assert.equal(recentToolSelection(actual,{taskId:'missing'}),null);
 const reverse=recentToolSelection(actual,{taskId:'native:hanzi-telegraph',direction:'decode'});
 assert.equal(new URLSearchParams(reverse.route.split('?')[1]).get('dir'),'decode','native recents retain the selected reverse direction');
 const decode=recentToolSelection(actual,{capabilityId:'topic:base-family',operation:'From Base64'});
 assert.equal(new URLSearchParams(decode.route.split('?')[1]).get('op'),'From Base64');
});
test('page preferences resolve to real tasks; current direction wins over defaults',()=>{
  assert.equal(selectPanelTask(registry,'encoding',{operation:'Decode'}).entry,entries[1]);
  const selected=selectPanelTask(registry,'encoding',{operation:'First',remembered:{id:'pair:base',op:'Decode'}});
  assert.equal(selected.entry,entries[1]);assert.equal(selected.op,'Decode');
  assert.equal(selectPanelTask(registry,'image').entry,entries[2]);
  assert.equal(selectPanelTask(registry,'image',{remembered:{id:'native:planes'}}).entry,entries[3]);
});
test('invalid, hidden or foreign remembered tasks never select an aggregate view',()=>{
  for(const remembered of [{id:'missing'},{id:'native:image'}])assert.equal(selectPanelTask(registry,'encoding',{remembered}).entry,entries[0]);
  assert.deepEqual(selectPanelTask(registry,'missing'),{});
  assert.deepEqual(selectPanelTask({...registry,entries:entries.map(entry=>({...entry,listed:false}))},'encoding'),{});
});

test('consolidated native topics restore the actual remembered mode across transient resolved objects',async()=>{
  const actual=createRegistry(JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json',import.meta.url))));
  for(const [panel,id,variant,selector,value]of [
    ['code','topic:code-runner','native:code-python','#code-language','python'],
    ['words','topic:word-grids','native:word-boggle','#word-grid-mode','boggle'],
    ['hanzi','topic:hanzi-lookup','native:hanzi-cangjie','#hanzi-mode','cangjie'],
    ['video','topic:video','native:video-gif','#video-mode','gif']
  ]){
    const canonical=actual.byId.get(id);assert.ok(canonical,id);
    for(const remembered of [{id,variant},{id:variant}]){
      const selection=selectPanelTask(actual,panel,{remembered});
      assert.equal(selection.entry.id,id);assert.equal(selection.entry.taskId,variant);
      assert.notEqual(selection.entry,canonical,'resolved mode carries transient controls, not mutable canonical state');
      assert.ok(selection.entry.open.controls.some(control=>control.selector===selector&&control.value===value),variant+' reaches the original real control');
      assert.equal(canonical.taskId,canonical.variants[0].id,'remembered modes cannot overwrite a topic default');
    }
  }
});

test('consolidated operation topics remember a precise action and reject internal recipe-only operations as page tasks',async()=>{
  const actual=createRegistry(JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json',import.meta.url))));
  for(const remembered of [{id:'topic:pgp',op:'PGP Verify'},{id:'op:PGP%20Verify'}]){
    const selected=selectPanelTask(actual,'crypto',{remembered});
    assert.equal(selected.entry.id,'topic:pgp');assert.equal(selected.op,'PGP Verify');
    assert.equal(selected.entry.open.operation,'PGP Verify');assert.equal(selected.entry.open.group,'signatures');
  }
  const selected=selectPanelTask(actual,'mathlab',{remembered:{id:'op:Multiply'}});
  assert.ok(selected.entry,'remaining practical number/unit tasks keep a real page default');
  assert.notEqual(selected.entry.id,'native:cyberchef','a hidden calculator primitive cannot become an aggregate math view');
  assert.ok(selected.entry.listed!==false);assert.notEqual(selected.op,'Multiply');
});

test('cross-panel topics resolve each bare member route to its actual controller',async()=>{
  const actual=createRegistry(JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json',import.meta.url))));
  for(const [panel,topic] of [['semaphore-batch','semaphore'],['braille-languages','braille'],['gs8','braille'],['marine-signals','marine'],['barcode-generate','qr']]){
    for(const remembered of [undefined,{id:'topic:'+topic,variant:'native:'+topic}]){
      const selected=selectPanelTask(actual,panel,{remembered});
      assert.equal(selected.entry.id,'topic:'+topic);
      assert.equal(selected.entry.variantId,'native:'+panel);
      assert.equal(selected.entry.open.panel,panel);
    }
  }
});
