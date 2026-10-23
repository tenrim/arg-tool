import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRegistry,resolveCapability,searchEntries} from '../public/capabilities/registry.js';
import {capabilityRoute} from '../public/capabilities/routes.js';
import {getArticle} from '../public/knowledge/content.js';

const catalogue=JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json',import.meta.url),'utf8'));
const registry=createRegistry(catalogue);
const base=[...['Base32','Base45','Base58','Base62','Base64','Base85','Base92'].flatMap(name=>['To '+name,'From '+name]),'Show Base64 offsets'];
const numeric=[...['Binary','Octal','Decimal','Hex','Hex Content','Hexdump','Float','BCD','Base'].flatMap(name=>['To '+name,'From '+name]),'Text-Integer Conversion'];

test('families: Base and numeric representations keep every real operation under one discoverable owner',()=>{
 for(const [id,operations]of [['base-family',base],['byte-numerals',numeric]]){
  const owner=registry.byId.get('topic:'+id);
  assert.ok(owner?.topic&&owner.listed!==false);
  assert.equal(owner.topicKind,'operation');assert.equal(owner.reversible,false);
  assert.deepEqual(new Set(owner.actions.map(action=>action.op)),new Set(operations));
  assert.deepEqual(new Set(owner.sourceOperationIds),new Set(operations));
  for(const operation of operations){
   assert.equal(registry.byOperation.get(operation),owner);
   const result=resolveCapability(registry,'op:'+encodeURIComponent(operation));
   assert.equal(result.entry.id,owner.id);assert.equal(result.op,operation);
   assert.equal(result.entry.open.operation,operation,'real original operation targets survive consolidation');
   assert.ok(searchEntries(registry,operation).some(entry=>entry.id===owner.id));
  }
  const article=getArticle('function-'+owner.id);assert.ok(article?.members.length>1);
  assert.deepEqual(new Set(article.operationIds),new Set(operations));
 }
 assert.equal(registry.coverage.coveredOperationCount,505);
 assert.equal(registry.coverage.operationCount,505);
});

test('families: mixed QR selection preserves explicit controller and engine interfaces and canonical route identity',()=>{
 const owner=registry.byId.get('topic:qr');assert.equal(owner.topicKind,'mixed');
 assert.equal(owner.variants.length,5);assert.equal(owner.actions.length,2);
 const cases=[['native:image-barcode',null,'native'],['native:image-qr',null,'native'],['op:Generate%20QR%20Code','Generate QR Code','operation'],['op:Parse%20QR%20Code','Parse QR Code','operation'],['native:barcode-generate',null,'native']];
 for(const [id,operation,kind]of cases){
  const result=resolveCapability(registry,id);
  assert.equal(result.entry.id,'topic:qr');assert.equal(result.entry.variantId,id);
  assert.equal(result.entry.taskId,id);assert.equal(result.entry.open.kind,kind);
  assert.equal(result.entry.open.panel,id==='native:barcode-generate'?'barcode-generate':'image');
  if(operation){assert.equal(result.op,operation);assert.equal(result.entry.open.operation,operation);}
  const query=new URLSearchParams(capabilityRoute(result.entry,result.op,result.direction).split('?')[1]);
  assert.equal(query.get('task'),'topic:qr');assert.equal(query.get('view'),id);
  const restored=resolveCapability(registry,query.get('task'),query.get('op'),query.get('dir'),query.get('view'));
  assert.equal(restored.entry.variantId,id);assert.equal(restored.entry.open.kind,kind);
 }
 for(const operation of ['Generate QR Code','Parse QR Code'])assert.equal(registry.byOperation.get(operation),owner);
 assert.equal(registry.entries.filter(entry=>entry.id==='topic:qr'&&entry.listed!==false).length,1);
 assert.deepEqual(new Set(getArticle('function-topic:qr').members.map(member=>member.capabilityId)),new Set(cases.map(([id])=>id)));
});

test('families: character and escape topics retain exact native variants and old engine aliases',()=>{
 for(const [topic,ids]of [['character-codes',['native:ascii','native:utf8','native:codepoint']],['text-escapes',['native:escape-hex','native:escape-unicode','native:escape-html','native:escape-url']]]){
  const owner=registry.byId.get('topic:'+topic);assert.equal(owner.topicKind,'native');
  assert.deepEqual(owner.variants.map(variant=>variant.id),ids);
  for(const id of ids){const resolved=resolveCapability(registry,id);assert.equal(resolved.entry.id,owner.id);assert.equal(resolved.entry.variantId,id);assert.equal(resolved.entry.open.kind,'native');}
 }
 for(const [op,id]of [['To HTML Entity','native:escape-html'],['From HTML Entity','native:escape-html'],['URL Encode','native:escape-url'],['URL Decode','native:escape-url'],['Escape Unicode Characters','native:escape-unicode'],['Unescape Unicode Characters','native:escape-unicode']]){
  const resolved=resolveCapability(registry,'op:'+encodeURIComponent(op));
  assert.equal(resolved.entry.id,'topic:text-escapes');assert.equal(resolved.entry.variantId,id);assert.equal(resolved.op,op);
  assert.equal(resolved.entry.open.operationControls.find(mapping=>mapping.op===op).controls.find(control=>control.selector==='#basics-direction').value,/^(From|Unescape)|Decode$/.test(op)?'decode':'encode');
  assert.equal(searchEntries(registry,op).find(entry=>entry.id==='topic:text-escapes')?.preferredOperation,op,'search retains the real native encoding/decoding operation');
 }
 assert.equal(searchEntries(registry,'HTML 实体解码').find(entry=>entry.id==='topic:text-escapes')?.preferredOperation,'From HTML Entity');
});
