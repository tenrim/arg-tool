import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRegistry,searchEntries} from '../public/capabilities/registry.js';
import {rankCapabilities,literalSearchEvidence} from '../public/capabilities/search.js';
const registry=createRegistry(JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json',import.meta.url))));
const marked=(text,ranges)=>ranges.map(([start,end])=>text.slice(start,end)).join('|');
test('search evidence uses original display offsets for exact, normalized and fuzzy matches',()=>{
  const entries=[{id:'headphones',title:'Wireless Headphone',aliases:[]}];
  const exact=rankCapabilities(entries,'HEADPHONE')[0];
  assert.equal(marked(exact.title,exact.searchMatch.title),'Headphone');
  assert.deepEqual(exact.searchMatch.snippets,[]);
  const fuzzy=rankCapabilities(entries,'hedphone')[0];
  assert.equal(fuzzy.searchMatch.approximate,true);
  assert.equal(marked(fuzzy.title,fuzzy.searchMatch.title),'He|dphone');
  const normalized={title:'🎧 Ｂａｓｅ ６４ · café e\u0301 ﬃ 𝒜',aliases:[]};
  for(const [query,expected]of [['base64','Ｂａｓｅ ６４'],['é','é|e\u0301'],['ffi','ﬃ'],['a','ａ|a|𝒜']]){
    assert.equal(marked(normalized.title,literalSearchEvidence(normalized,query).title),expected,query);
  }
  assert.equal(entries[0].searchMatch,undefined);
  const greek=rankCapabilities([{id:'g',title:'ΟΣ',aliases:[]}],'ος')[0];
  assert.equal(marked(greek.title,greek.searchMatch.title),'ΟΣ','contextual lowercase normalization stays consistent with searchText');
});
test('search evidence explains alias and operation matches with bounded original context',()=>{
  for(const query of ['ASCII','From Base64','Pyhton','提取日期']){
    const result=searchEntries(registry,query)[0];
    assert.ok(result.searchMatch.title.length||result.searchMatch.snippets.some(s=>s.ranges.length),query);
    assert.ok(result.searchMatch.snippets.length<=2);
  }
  const inverse=searchEntries(registry,'From Base64')[0];
  assert.equal(inverse.searchMatch.snippets[0].text,'From Base64','complete operation match precedes unrelated From Base32 token matches');
  const text='开头'.repeat(100)+'目标词'+'后续'.repeat(100);
  const entry={id:'a',title:'工具',aliases:[text]},match=rankCapabilities([entry],'目标词')[0].searchMatch;
  assert.ok(match.snippets[0].text.startsWith('…'));
  assert.ok(match.snippets[0].text.length<=122);
  assert.equal(marked(match.snippets[0].text,match.snippets[0].ranges),'目标词');
  const multi=rankCapabilities([{id:'b',title:'文字',aliases:['键盘编码']}],'文字 键盘')[0];
  assert.equal(marked(multi.title,multi.searchMatch.title),'文字');
  assert.equal(marked(multi.searchMatch.snippets[0].text,multi.searchMatch.snippets[0].ranges),'键盘');
  assert.equal(rankCapabilities([entry],'')[0],entry,'empty search retains canonical entries without stale highlights');
});
test('search: local fuzzy matching tolerates typos while exact titles and directions retain priority',()=>{
  assert.equal(searchEntries(registry,'ASCII 文本与数字')[0].id,'topic:character-codes');
  assert.equal(searchEntries(registry,'ASCII')[0].id,'topic:character-codes','an exact tool alias precedes its similarly named lesson');
  assert.equal(searchEntries(registry,'ASCII')[0].preferredVariant,'native:ascii');
  assert.ok(searchEntries(registry,'Bsae64').slice(0,8).some(entry=>entry.id==='topic:base-family'));
  assert.ok(searchEntries(registry,'Pyhton').slice(0,8).some(entry=>entry.id==='topic:code-runner'));
  assert.equal(searchEntries(registry,'From Base64')[0].preferredOperation,'From Base64');
  assert.equal(searchEntries(registry,'To Base64')[0].preferredOperation,'To Base64');
  assert.equal(searchEntries(registry,'CIF')[0].id,'native:model');
  assert.equal(searchEntries(registry,'COD CIF')[0].id,'native:cod','an explicit online source selects retrieval while a bare file format retains the local file reader');
  assert.deepEqual(searchEntries(registry,'SM4').map(entry=>entry.id),['pair:SM4%20Encrypt','learn:function-pair:SM4%20Encrypt'],'a known algorithm never expands to lookalike algorithms');
});

test('search: consolidated topics keep exact operation and native-mode intent without duplicate member results',()=>{
  const before=JSON.stringify(registry.entries);
  for(const [query,id,op]of [
    ['PGP Verify','topic:pgp','PGP Verify'],['PGP Sign','topic:pgp','PGP Sign'],
    ['Extract dates','topic:extract-patterns','Extract dates'],['提取日期','topic:extract-patterns','Extract dates'],
    ['Extract URLs','topic:extract-patterns','Extract URLs'],['MD5','topic:hash-digests','MD5']
  ]){
    const results=searchEntries(registry,query),matches=results.filter(entry=>entry.id===id);
    assert.equal(matches.length,1,query+' has one actual workbench result');
    assert.equal(matches[0].preferredOperation,op,query+' opens the requested real action');
    assert.ok(!results.some(entry=>entry.id==='op:'+encodeURIComponent(op)),'merged actions are not separate search entries');
  }
  for(const [query,id,variant]of [
    ['Python','topic:code-runner','native:code-python'],
    ['仓颉','topic:hanzi-lookup','native:hanzi-cangjie'],['五笔','topic:hanzi-lookup','native:hanzi-wubi'],
    ['Boggle','topic:word-grids','native:word-boggle'],['歇后语','topic:chinese-phrases','native:hanzi-xhy']
  ]){
    const results=searchEntries(registry,query),match=results.find(entry=>entry.id===id);
    assert.ok(match,query);assert.equal(match.preferredVariant,variant,query+' retains its original controller mode');
    assert.ok(!results.some(entry=>entry.id===variant));
  }
  assert.equal(JSON.stringify(registry.entries),before,'transient selection intent must never overwrite canonical defaults');
});
test('search: cached indexes preserve inventory, category bounds, hidden entries and immutable registry values',()=>{
  const before=JSON.stringify(registry.entries);
  const empty=rankCapabilities(registry.entries,'');
  assert.deepEqual(empty,registry.entries.filter(entry=>entry.listed!==false));
  assert.ok(searchEntries(registry,'Bsae64','codec').every(entry=>entry.category==='codec'));
  assert.deepEqual(searchEntries(registry,'Bsae64','missing'),[]);
  assert.ok(!searchEntries(registry,'Fork').some(entry=>entry.mode==='chain'));
  assert.equal(JSON.stringify(registry.entries),before);
  assert.deepEqual(searchEntries(registry,'zzqvwxnoexistentsearchzz'),[]);
});

test('bare algorithm searches prefer executable tools and their matching topic operation',()=>{
 for(const algorithm of ['Base32','Base64','Base85']){
  const result=searchEntries(registry,algorithm);
  assert.equal(result[0].id,'topic:base-family');
  assert.equal(result[0].preferredOperation,'To '+algorithm);
  assert.equal(searchEntries(registry,'From '+algorithm)[0].preferredOperation,'From '+algorithm);
  assert.equal(searchEntries(registry,algorithm,'knowledge')[0].category,'knowledge');
 }
 assert.equal(registry.coverage.visibleEntryCount,registry.coverage.visibleToolCount+registry.coverage.knowledgeCount);
});
