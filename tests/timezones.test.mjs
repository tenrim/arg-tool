import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {parseTZif,parsePosix,parseDateTime,localToUTC,utcToLocal,zoneState,dateSeconds,formatOffset,searchZones,sourceRecords} from '../public/timezones/core.js';
const root=new URL('../',import.meta.url),read=name=>readFileSync(new URL(name,root)),index=JSON.parse(read('public/vendor/timezones/index.json')),sources=JSON.parse(read('public/vendor/timezones/source-records.json'));
const zone=id=>parseTZif(read('public/vendor/timezones/zoneinfo/'+id));
test('complete selected IANA default release retains all 598 names and original rule data',()=>{
 assert.equal(index.version,'2026e');assert.equal(index.zoneCount,598);assert.equal(index.zones.length,598);assert.equal(new Set(index.zones.map(z=>z.id)).size,598);
 assert.equal(Object.keys(sources.zones).length,345);assert.equal(Object.keys(sources.backzones).length,125);
 for(const entry of index.zones){assert.ok(entry.canonical);assert.ok(zone(entry.id).types.length);}
 const alias=index.zones.find(z=>z.id==='US/Eastern');assert.equal(alias.canonical,'America/New_York');
 assert.deepEqual(utcToLocal(zone(alias.id),parseDateTime('2024-01-01 00:00')),utcToLocal(zone(alias.canonical),parseDateTime('2024-01-01 00:00')));
});
test('independent CPython TZif oracle agrees for all 598 zones over history and POSIX projections',()=>{
 const oracle=JSON.parse(gunzipSync(read('tests/fixtures/timezones-oracle.json.gz')));assert.equal(oracle.ianaVersion,index.version);assert.equal(oracle.zones.length,index.zoneCount);
 for(const [id,states]of oracle.zones){const parsed=zone(id);for(const [i,expected]of states.entries()){const actual=zoneState(parsed,parseDateTime(oracle.datesUTC[i]));assert.deepEqual([actual.offset,actual.dst,actual.abbreviation],expected,id+' at '+oracle.datesUTC[i]);}}
});
test('local times distinguish ordinary instants, folds, one-hour gaps, half-hour gaps and skipped dates',()=>{
 const ny=zone('America/New_York'),fold=localToUTC(ny,parseDateTime('2024-11-03 01:30'));assert.equal(fold.status,'ambiguous');assert.deepEqual(fold.candidates.map(c=>c.utcText),['2024-11-03 05:30:00Z','2024-11-03 06:30:00Z']);
 const gap=localToUTC(ny,parseDateTime('2024-03-10 02:30'));assert.equal(gap.status,'nonexistent');assert.equal(gap.candidates.length,0);assert.equal(gap.gap.seconds,3600);
 assert.equal(localToUTC(zone('Australia/Lord_Howe'),parseDateTime('2024-10-06 02:15')).gap.seconds,1800);
 assert.equal(localToUTC(zone('Pacific/Apia'),parseDateTime('2011-12-30 12:00')).gap.seconds,86400);
 const china=localToUTC(zone('Asia/Shanghai'),parseDateTime('2024-01-01 08:00'));assert.equal(china.status,'unique');assert.equal(china.candidates[0].utcText,'2024-01-01 00:00:00Z');
});
test('historical second offsets, negative DST and future southern-hemisphere rules are real',()=>{
 const ktm=utcToLocal(zone('Asia/Kathmandu'),parseDateTime('1850-01-01 00:00'));assert.equal(ktm.offset,20476);assert.equal(ktm.offsetText,'UTC+05:41:16');
 const dublin=zone('Europe/Dublin');assert.equal(utcToLocal(dublin,parseDateTime('2024-01-01 00:00')).dst,true);assert.equal(utcToLocal(dublin,parseDateTime('2024-07-01 00:00')).dst,false);
 const sydney=zone('Australia/Sydney');assert.equal(utcToLocal(sydney,parseDateTime('2500-01-01 00:00')).offset,39600);assert.equal(utcToLocal(sydney,parseDateTime('2500-07-01 00:00')).offset,36000);
 assert.equal(utcToLocal(zone('Etc/GMT+5'),parseDateTime('2500-01-01 00:00')).offset,-18000);
 assert.equal(formatOffset(-17762),'UTC-04:56:02');
});
test('raw Zone/Rule/Link and optional backzone are separately identified, not merged into active rules',()=>{
 const original=sourceRecords(sources,'US/Eastern','America/New_York');assert.ok(original.active.some(r=>r.text.startsWith('Link')));assert.ok(original.active.some(r=>r.text.startsWith('Zone')));assert.ok(original.active.some(r=>r.text.startsWith('Rule')));
 const accra=index.zones.find(z=>z.id==='Africa/Accra'),data=sourceRecords(sources,accra.id,accra.canonical);assert.ok(data.optional.some(r=>r.file==='backzone'));assert.ok(data.active.every(r=>r.file!=='backzone'));assert.ok(data.optional.some(r=>r.text.startsWith('Rule')));
});
test('full directory supports alias/city/country search with real paging',()=>{
 assert.ok(searchZones(index,'new york').items.some(z=>z.id==='America/New_York'));
 assert.ok(searchZones(index,'United States').total>20);assert.ok(searchZones(index,'US/Eastern').items.some(z=>z.id==='US/Eastern'));
 const first=searchZones(index),second=searchZones(index,'',1);assert.equal(first.total,598);assert.equal(first.items.length,24);assert.equal(second.items.length,24);assert.notEqual(first.items[0].id,second.items[0].id);
});
test('input, TZif and POSIX validation rejects invalid dates and corrupt files without silent coercion',()=>{
 for(const input of ['2024-02-30 12:00','2023-02-29 12:00','2024-01-01 24:00','2024-01-01 00:00:60','0000-01-01 00:00','2024-01-01'])assert.throws(()=>parseDateTime(input));
 assert.equal(parseDateTime('0099-01-01 00:00'),dateSeconds(99));assert.equal(parseDateTime('2024-02-29 23:59:59'),dateSeconds(2024,2,29,23,59,59));
 const bytes=read('public/vendor/timezones/zoneinfo/America/New_York');for(const limit of [0,10,43,50,bytes.length-3])assert.throws(()=>parseTZif(bytes.subarray(0,limit)));
 for(const footer of ['ABC','EST5EDT','EST5EDT,M13.1.0,M11.1.0','EST5EDT,M3.2.0/2,M11.1.0/2garbage'])assert.throws(()=>parsePosix(footer));
 const ordinal={transitions:[],indices:[],types:[{offset:0,dst:false,abbreviation:'STD'}],posix:parsePosix('STD0DST,J60/2u,J300/2s')};assert.equal(zoneState(ordinal,parseDateTime('2024-03-01 03:00')).dst,true);
});
