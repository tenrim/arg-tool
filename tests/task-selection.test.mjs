import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectPanelTask} from '../public/capabilities/task-selection.js';

const entries=[
  {id:'op:first',category:'codec',route:'encoding/base',open:{panel:'encoding',kind:'operation',op:'First'},sourceOperationIds:['First']},
  {id:'pair:base',category:'codec',route:'encoding/base',open:{panel:'encoding',kind:'operation',op:'Encode'},sourceOperationIds:['Encode','Decode'],directions:[{op:'Encode'},{op:'Decode'}]},
  {id:'native:image',category:'media',route:'image',open:{panel:'image',kind:'native'},sourceOperationIds:[]},
  {id:'native:planes',category:'media',route:'image',open:{panel:'image',kind:'native'},sourceOperationIds:[]},
];
const registry={entries,byId:new Map(entries.map(entry=>[entry.id,entry])),byOperation:new Map([['First',entries[0]],['Encode',entries[1]],['Decode',entries[1]]]),aliases:new Map()};
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
