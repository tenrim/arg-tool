import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRegistry,resolveCapability,searchEntries,CHEF_OPERATION_PAIRS} from '../public/capabilities/registry.js';
import {CAPABILITY_TOPICS} from '../public/capabilities/topics.js';
import {CHAIN_ONLY_OPERATIONS,CHAIN_ONLY_OPERATION_GROUPS} from '../public/capabilities/operation-policy.js';
import {consolidateTopics} from '../public/capabilities/topic-model.js';
import {ARTICLES,getArticle} from '../public/knowledge/content.js';
import {capabilityRoute} from '../public/capabilities/routes.js';
import {selectPanelTask} from '../public/capabilities/task-selection.js';
import {inputCompatibility} from '../public/capabilities/input-session.js';

const catalogue=JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json',import.meta.url),'utf8'));
const registry=createRegistry(catalogue);

test('topics: all declared members have one real owner and their original operations remain complete',()=>{
  assert.equal(registry.byOperation.size,505);
  assert.equal(registry.entries.flatMap(entry=>entry.sourceOperationIds).length,505);
  for(const topic of registry.entries.filter(entry=>entry.topic)){
    assert.equal(topic.reversible,false,'a collection of actions does not declare an inverse');
    assert.ok(topic.memberIds.length>1);
    assert.equal(registry.entries.some(entry=>topic.memberIds.includes(entry.id)),false,'no duplicate standalone members');
    const definition=CAPABILITY_TOPICS.find(item=>'topic:'+item.id===topic.id);
    assert.ok(definition);
    const article=getArticle('function-'+topic.id);
    assert.deepEqual(new Set(article.members.map(member=>member.capabilityId)),new Set(topic.memberIds));
    if(topic.topicKind==='operation'){
      assert.deepEqual(topic.actions.map(action=>action.op),definition.operations.filter(op=>!CHAIN_ONLY_OPERATIONS.includes(op)));
      for(const action of topic.actions){
        const selected=resolveCapability(registry,topic.id,action.op);
        assert.equal(selected.entry.id,topic.id);assert.equal(selected.op,action.op);
        assert.equal(selected.entry.open.operation,action.op);
        assert.equal(selected.entry.open.kind,'operation');
        assert.equal(registry.byOperation.get(action.op),topic);
      }
    }else for(const variant of topic.variants){
      const selected=resolveCapability(registry,topic.id,undefined,undefined,variant.id);
      assert.equal(selected.entry.taskId,variant.id);
      assert.equal(selected.entry.open,variant.open);
      const legacy=resolveCapability(registry,variant.id);
      assert.equal(legacy.entry.id,topic.id);assert.equal(legacy.entry.taskId,variant.id);
      assert.equal(capabilityRoute(selected.entry).includes('view='+encodeURIComponent(variant.id)),true);
    }
  }
});

test('topics: raw names search the one topic and preserve the intended operation',()=>{
  for(const [query,id,op] of [['提取日期','topic:extract-patterns','Extract dates'],
    ['Extract URLs','topic:extract-patterns','Extract URLs'],['PGP Verify','topic:pgp','PGP Verify'],
    ['Parse PGP Key','topic:pgp','Parse PGP Key'],['MD5','topic:hash-digests','MD5']]){
    const result=searchEntries(registry,query).find(entry=>entry.category!=='knowledge');
    assert.equal(result.id,id,query);assert.equal(result.preferredOperation,op,query);
  }
  const python=searchEntries(registry,'Python').find(entry=>entry.id==='topic:code-runner');
  assert.equal(python.preferredVariant,'native:code-python');
  assert.equal(searchEntries(registry,'Pyhton').find(entry=>entry.id==='topic:code-runner').preferredVariant,'native:code-python',
    'an unambiguous fuzzy member query preserves its actual language instead of opening the topic default');
  assert.equal(registry.byId.get(python.id).preferredVariant,undefined,'query intent must be transient');
});

test('topics: calculator, packet and developer primitives are executable only in the recipe workspace',()=>{
  assert.equal(new Set(CHAIN_ONLY_OPERATIONS).size,CHAIN_ONLY_OPERATIONS.length);
  assert.deepEqual(CHAIN_ONLY_OPERATION_GROUPS.flatMap(group=>group.operations),CHAIN_ONLY_OPERATIONS);
  for(const op of CHAIN_ONLY_OPERATIONS){
    assert.ok(catalogue.operations[op],op);
    const source=registry.byOperation.get(op);
    assert.equal(source.listed,false,op);assert.equal(source.execution,'complete-workspace-only');
    assert.ok(!searchEntries(registry,op).some(entry=>entry.sourceOperationIds.includes(op)),op);
    const resolved=resolveCapability(registry,'op:'+encodeURIComponent(op));
    assert.equal(resolved.entry.id,'native:cyberchef');assert.equal(resolved.entry.open.kind,'recipe');
    assert.equal(resolved.op,op);assert.equal(resolved.entry.open.operation,op);
    assert.ok(!ARTICLES.some(article=>article.operationIds?.includes(op)),op+' must not have a standalone lesson');
  }
  for(const op of ['XOR','XOR Brute Force','Disassemble x86','Disassemble ARM','PGP Sign','Generate PGP Key Pair'])
    assert.notEqual(registry.byOperation.get(op).listed,false,op);
  for(const [first,second] of CHEF_OPERATION_PAIRS)assert.equal(
    CHAIN_ONLY_OPERATIONS.includes(first),CHAIN_ONLY_OPERATIONS.includes(second),'do not retire half a pair: '+first);
});

test('topics: remembered native views and source compatibility use actual member identity',()=>{
  const requested=resolveCapability(registry,'native:code-python');
  const remembered=selectPanelTask(registry,'code',{remembered:{id:requested.entry.id,variant:requested.entry.taskId}});
  assert.equal(remembered.entry.taskId,'native:code-python');
  const invalid=resolveCapability(registry,'topic:code-runner',undefined,undefined,'native:paper');
  assert.equal(invalid.entry.taskId,'native:code');
  assert.equal(inputCompatibility(resolveCapability(registry,'native:invisible-clean').entry),'text-conversion');
  assert.equal(registry.byId.get('topic:code-runner').variantId,'native:code','selection must not mutate default');
});

test('topics: invalid source ownership is rejected instead of silently duplicating or dropping an operation',()=>{
  const entry={id:'pair:A',title:'A',group:'g',listed:true,sourceOperationIds:['A','B'],sourceToolIds:[],aliases:[],
    directions:[{op:'A',label:'A'},{op:'B',label:'B'}],open:{kind:'operation'},route:'a',panel:'a'};
  assert.throws(()=>consolidateTopics([entry],[{id:'partial',title:'Partial',group:'g',operations:['A']}]),/不能拆开/);
  assert.throws(()=>consolidateTopics([entry],[{id:'missing',title:'Missing',group:'g',operations:['Absent']}]),/未登记/);
  assert.throws(()=>consolidateTopics([entry],[{id:'one',title:'One',group:'g',operations:['A','B']},
    {id:'two',title:'Two',group:'g',operations:['A','B']}]),/重复/);
});
