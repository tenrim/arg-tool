import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {CLDR_NAMES} from '../public/vendor/cldr/names.js';
import {CLDR_ANNOTATIONS} from '../public/vendor/cldr/annotations.js';
import {currencyLabels,territoryEntries,timezoneLabels} from '../public/reference-locale/names.js';
import {queryRecords,unicodePoint} from '../public/reference/core.js';
import {currencyName,queryCurrencies} from '../public/discovery/reference-core.js';
import {searchZones,localizedZone,parseTZif,localToUTC,parseDateTime} from '../public/timezones/core.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file));
const json=file=>JSON.parse(read(file));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const unicode=json('public/vendor/reference/unicode.json'),zones=json('public/vendor/timezones/index.json'),currencies=json('public/vendor/discovery/currencies.json'),countries=json('public/vendor/reference/countries.json');

test('all fixed Unicode source bytes and derived files match SHA-256, offline rebuild is deterministic',()=>{
 const pins=json('upstream/cldr/PINS.json'),upstream=json('public/vendor/cldr/UPSTREAM.json');
 assert.equal(pins.version,'48.2.0');assert.equal(pins.license,'Unicode-3.0');assert.equal(pins.sources.length,16);
 for(const source of pins.sources)assert.equal(sha(read('upstream/cldr/'+source.path)),source.sha256,source.path);
 for(const file of upstream.files)assert.equal(sha(read(file.path)),file.sha256,file.path);
 const before=read('public/vendor/cldr/UPSTREAM.json');
 execFileSync(process.execPath,['scripts/import-cldr.mjs'],{cwd:root,stdio:'pipe'});
 assert.deepEqual(read('public/vendor/cldr/UPSTREAM.json'),before);
 for(const file of upstream.files)assert.equal(sha(read(file.path)),file.sha256,file.path);
 assert.match(read('public/vendor/cldr/LICENSE.txt').toString(),/UNICODE LICENSE V3/);
});

test('the complete selected zh and zh-Hant annotations survive exact sequence joins',()=>{
 const expected=new Set();for(const locale of ['zh','zh-Hant'])for(const [pkg,key]of [['cldr-annotations-full','annotations'],['cldr-annotations-derived-full','annotationsDerived']]){
  const source=json(`upstream/cldr/${pkg}/${key}/${locale}/annotations.json`)[key].annotations;
  for(const [character,record]of Object.entries(source)){expected.add(character);const result=CLDR_ANNOTATIONS[character];assert.ok(result,character);for(const label of record.tts||[])assert.ok(result.names.includes(label),character+' label');for(const keyword of record.default||[])assert.ok(result.keywords.includes(keyword),character+' keyword');}
 }
 assert.equal(expected.size,4342);assert.equal(Object.keys(CLDR_ANNOTATIONS).length,expected.size);
 assert.equal(Object.keys(CLDR_ANNOTATIONS).filter(s=>Array.from(s).length===1).length,1789);
});

test('Chinese Unicode names, traditional keywords, scripts and existing block labels search real records without altering official names',()=>{
 const before=sha(JSON.stringify(unicode));
 const q=query=>queryRecords('unicode',{query,mode:'name'},unicode);
 assert.ok(q('雪人').items.some(r=>r.id==='2603'));assert.ok(q('箭頭').total>100);assert.ok(q('拉丁文').items.some(r=>r.id==='0041'));
 const snow=unicodePoint(0x2603,unicode);assert.equal(snow.fields.find(([key])=>key==='名称（Unicode 原文）')[1],'SNOWMAN');assert.match(JSON.stringify(snow),/雪/);
 assert.ok(q('ARROW').total>500);assert.equal(sha(JSON.stringify(unicode)),before);
});

test('Chinese sequence results retain complete codepoints and UTF-8 and do not relabel sequences as single characters',()=>{
 const character='👨‍👩‍👧‍👦',points=Array.from(character),result=queryRecords('unicode',{query:character,mode:'name'},unicode);
 assert.equal(result.total,1);assert.match(result.items[0].id,/^seq:/);assert.equal(result.items[0].fields.find(([key])=>key==='序列码位')[1].split(' ').length,points.length);
 assert.equal(result.items[0].fields.find(([key])=>key==='UTF-8')[1],Buffer.from(character).toString('hex').match(/../g).join(' '));
 assert.ok(queryRecords('unicode',{query:'家庭',mode:'name'},unicode).items.some(r=>r.id.startsWith('seq:')));
 assert.equal(queryRecords('unicode',{query:character},unicode).total,points.length);
 assert.equal(queryRecords('unicode',{query:'A中😀'},unicode).total,3);
});

test('fixed CLDR currency names work independently from browser ICU and retain the full original registry',()=>{
 const before=sha(JSON.stringify(currencies)),original=Intl.DisplayNames;
 try{Intl.DisplayNames=class{constructor(){throw Error('no ICU');}};assert.equal(currencyName({code:'CNY',name:'Yuan Renminbi'}),'人民币');assert.equal(currencyName({code:'XAD',name:'ARAB DINAR'}),'ARAB DINAR');}
 finally{Intl.DisplayNames=original;}
 assert.ok(queryCurrencies({query:'人民幣'},currencies,countries).items.some(r=>r.currencyCode==='CNY'));
 const result=queryCurrencies({query:'日圆'},currencies,countries);assert.ok(result.items.some(r=>r.currencyCode==='JPY'));
 const groups=[...new Set(currencies.map(r=>r.code+':'+r.status))];assert.equal(groups.length,315);
 assert.equal(groups.filter(id=>currencyLabels(id.split(':')[0]).some(label=>/\p{Script=Han}/u.test(label))).length,296);
 assert.equal(sha(JSON.stringify(currencies)),before);
});

test('all 598 original timezone IDs remain searchable, with Chinese cities, countries and canonical aliases',()=>{
 const before=sha(JSON.stringify(zones));
 assert.equal(searchZones(zones).total,598);assert.ok(searchZones(zones,'上海').items.some(r=>r.id==='Asia/Shanghai'));
 assert.ok(searchZones(zones,'中国').total>=7);assert.ok(searchZones(zones,'倫敦').items.some(r=>r.id==='Europe/London'));assert.ok(searchZones(zones,'紐約').items.some(r=>r.id==='America/New_York'));
 assert.ok(searchZones(zones,'US/Eastern').items.some(r=>r.id==='US/Eastern'&&r.chineseName==='纽约'));
 assert.ok(timezoneLabels('Asia/Kolkata').cities.length);assert.equal(zones.zones.filter(entry=>localizedZone(zones,entry).chineseName).length,562);assert.ok(searchZones(zones,'协调世界时').items.some(row=>row.id==='Etc/UTC'));
 for(const code of Object.keys(zones.countries))assert.ok(territoryEntries().some(r=>r.code===code&&r.labels.some(label=>/\p{Script=Han}/u.test(label))));
 assert.equal(sha(JSON.stringify(zones)),before);
});

test('Chinese timezone overlay does not change the original historical DST ambiguity calculation',()=>{
 const zone=parseTZif(read('public/vendor/timezones/zoneinfo/America/New_York')),result=localToUTC(zone,parseDateTime('2024-11-03 01:30:00'));
 assert.equal(result.status,'ambiguous');assert.equal(result.candidates.length,2);assert.deepEqual(result.candidates.map(row=>row.offsetText),['UTC-04:00','UTC-05:00']);
});

test('CLDR territory metadata only provides exact source codes and English names for other local models',()=>{
 const china=territoryEntries().find(row=>row.code==='CN');assert.ok(china.labels.includes('中国'));assert.ok(china.labels.includes('中國'));assert.ok(china.english.includes('China'));
 assert.equal(CLDR_NAMES.version,'48.2.0');assert.equal(Object.keys(CLDR_NAMES.territories).length,264);
});
