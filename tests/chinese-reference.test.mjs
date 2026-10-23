import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {aggregate,matchAirport,deriveGeologyNames,catalogIdentifier,buildReferenceChinese} from '../scripts/import-reference-chinese.mjs';
import {normalizeChineseSearch} from '../public/reference/chinese-search.js';
import {CHINESE_REFERENCE,CHINESE_REFERENCE_COVERAGE} from '../public/reference/chinese-data.js';
import {queryRecords} from '../public/reference/core.js';
import {filterSky,skyRows} from '../public/discovery/reference-core.js';
const json=async relative=>JSON.parse(await readFile(new URL('../'+relative,import.meta.url),'utf8'));
const literal=value=>({value}),label=(value,language='zh-hans')=>({value,'xml:lang':language});
const airport=(id,icao,iata,coord='Point(116.58 40.08)')=>({item:literal('http://www.wikidata.org/entity/'+id),icao:literal(icao),iata:literal(iata),label:label('机场中文名称'),coord:literal(coord)});

test('Chinese reference: exact identifiers reject ambiguity, conflicting airport codes and distant/reassigned codes',()=>{
 const row=['ZBAA','PEK','Original airport','Beijing','CN','large_airport','40.08','116.58'];
 assert.ok(matchAirport(row,aggregate([airport('Q1','ZBAA','PEK')],['icao','iata'])));
 assert.equal(matchAirport(row,aggregate([airport('Q1','ZBAA','XXX'),airport('Q2','ZZZZ','PEK')],['icao','iata'])),null);
 assert.equal(matchAirport(row,aggregate([airport('Q1','ZBAA','PEK'),airport('Q2','ZBAA','PEK')],['icao','iata'])),null);
 assert.equal(matchAirport(row,aggregate([airport('Q1','ZBAA','PEK','Point(0 0)')],['icao','iata'])),null);
 assert.equal(matchAirport([...row.slice(0,6),'',''],aggregate([airport('Q1','ZBAA','PEK')],['icao','iata'])),null);
 assert.equal(catalogIdentifier('NGC 04594'),'NGC:4594');assert.equal(catalogIdentifier('NGC 4594A'),null);
});

test('Chinese reference: simplified/traditional matching preserves original source objects and exact IDs',async()=>{
 const iching=await json('public/vendor/reference/iching.json'),tarot=await json('public/vendor/reference/tarot.json');
 const original=JSON.stringify({iching,tarot});
 assert.equal(queryRecords('iching',{query:'离',mode:'trigram'},iching).total,1);
 assert.equal(queryRecords('iching',{query:'兑',mode:'trigram'},iching).total,1);
 assert.equal(queryRecords('tarot',{query:'審判'},tarot).total,1);
 assert.ok(queryRecords('tarot',{query:'權杖'},tarot).total>=14);
 assert.equal(normalizeChineseSearch('U+1F600'),'u+1f600');
 assert.equal(JSON.stringify({iching,tarot}),original);
});

test('Chinese reference: sourced capital/airport/UNLOCODE names are searchable with original records retained',async()=>{
 const countries=await json('public/vendor/reference/countries.json'),airports=await json('public/vendor/reference/airports.json'),ports=await json('public/vendor/reference/ports.json');
 assert.equal(countries.length,252);assert.equal(airports.length,86226);assert.equal(ports.length,116213);
 assert.ok(queryRecords('countries',{query:'北京'},countries,[],CHINESE_REFERENCE.capitals).items.some(r=>r.id==='CN'));
 const airportResult=queryRecords('airports',{query:'首都',region:'CN'},airports,countries,CHINESE_REFERENCE.airports).items.find(r=>r.id==='ZBAA');
 assert.ok(airportResult);assert.ok(airportResult.fields.some(([k,v])=>k==='机场名称（原文）'&&v.includes('Beijing')));
 assert.ok(airportResult.fields.some(([k,v])=>k==='中文名称来源'&&v.startsWith('https://www.wikidata.org/wiki/Q')));
 assert.equal(queryRecords('airports',{query:'PEK'},airports,countries).items[0].id,'ZBAA');
 assert.ok(queryRecords('ports',{query:'上海',region:'CN'},ports,countries,CHINESE_REFERENCE.ports).items.some(r=>r.id==='CNSHA'));
 assert.equal(airports.find(r=>r[0]==='ZBAA').length,10,'no Chinese fields appended to raw arrays');
 assert.ok(CHINESE_REFERENCE_COVERAGE.airports.chinese<airports.length,'coverage remains explicitly partial');
});

test('Chinese reference: exact deep-sky IDs and real Chinese aliases do not alter OpenNGC coordinates or raw names',async()=>{
 const sky=await json('public/vendor/discovery/sky-index.json'),original=JSON.stringify(sky);
 assert.equal(sky.length,14034);
 const result=filterSky({query:'草帽星系'},sky);assert.ok(result.some(r=>r.id==='NGC4594'));
 const row=skyRows({query:'M104'},sky).items.find(r=>r.id==='NGC4594');assert.ok(row);
 assert.ok(row.fields.some(([k,v])=>k==='中文名称／别名'&&v.includes('草帽星系')));
 assert.equal(JSON.stringify(sky),original);
});

test('Chinese reference: all 21 missing ICS labels derive only from existing Chinese parents without changing chronology',async()=>{
 const geology=await json('public/vendor/reference/geology.json'),original=JSON.stringify(geology),derived=deriveGeologyNames(geology);
 assert.equal(Object.keys(derived).length,21);assert.deepEqual(derived,CHINESE_REFERENCE.geology);
 assert.ok(queryRecords('geology',{query:'早侏罗世'},geology).items.some(r=>r.id==='LowerJurassic'));
 assert.ok(queryRecords('geology',{query:'晚白垩世'},geology).items.some(r=>r.id==='UpperCretaceous'));
 assert.ok(queryRecords('geology',{query:'前寒武纪'},geology).items.some(r=>r.id==='Precambrian'));
 assert.equal(JSON.stringify(geology),original);
});

test('Chinese reference: offline rebuild and all bundled source/runtime hashes are reproducible',async()=>{
 const path='public/vendor/reference-chinese/data.js',before=await readFile(new URL('../'+path,import.meta.url));
 await buildReferenceChinese();assert.deepEqual(await readFile(new URL('../'+path,import.meta.url)),before);
 const runtime=await json('public/vendor/reference-chinese/UPSTREAM.json');
 for(const entry of runtime.files){const bytes=await readFile(new URL('../'+entry.path,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,entry.path);}
});
