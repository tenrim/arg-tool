import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {withChineseIT} from '../public/it-reference/chinese.js';
import {searchITRecords} from '../public/it-reference/model.js';
import {MDN_ZH} from '../public/vendor/reference-mdn-zh/data.js';
const read=async kind=>JSON.parse(await readFile(new URL('../public/vendor/it-reference/'+kind+'.json',import.meta.url),'utf8'));
test('Chinese MDN explanations join exact standards identifiers and preserve full source fields',async()=>{
 for(const kind of ['ports','http','formats','domains']){
  const original=await read(kind),copy=structuredClone(original),adapted=withChineseIT(original);
  assert.deepEqual(original,copy,'input is untouched');assert.equal(adapted.records.length,original.records.length);
  assert.deepEqual(adapted.records.map(r=>r.id),original.records.map(r=>r.id));
  for(let i=0;i<original.records.length;i++)assert.deepEqual(adapted.records[i].fields.slice(0,original.records[i].fields.length),original.records[i].fields);
  if(kind==='http'){assert.equal(adapted.meta.chineseCoverage,103);for(const query of ['内容安全策略','內容安全策略'])assert.ok(searchITRecords(adapted.records,query).records.some(r=>r.id==='header:content-security-policy'));}
  if(kind==='formats'){assert.equal(adapted.meta.chineseCoverage,75);assert.ok(searchITRecords(adapted.records,'超文本').records.some(r=>r.id==='mime:text/html'));}
  if(kind==='ports')assert.match(adapted.meta.scope,/尚未找到.*中文注册表/);
 }
});
test('Selected complete Chinese source pages and derivations are pinned and contain no Markdown macros',async()=>{
 const ledger=JSON.parse(await readFile(new URL('../public/vendor/reference-mdn-zh/UPSTREAM.json',import.meta.url),'utf8'));
 for(const file of ledger.source.files){const bytes=await readFile(new URL('../upstream/reference-mdn-zh/'+file.name,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);}
 for(const file of ledger.files){const bytes=await readFile(new URL('../'+file.path,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);}
 assert.equal(Object.keys(MDN_ZH.headers).length,152);assert.equal(Object.keys(MDN_ZH.mime).length,77);
 for(const value of [...Object.values(MDN_ZH.headers),...Object.values(MDN_ZH.mime).flat()])assert.doesNotMatch(value,/\{\{|<[^>]+>|\]\(/);
 assert.equal(MDN_ZH.meta.license,'CC-BY-SA-2.5');
});
