import assert from 'node:assert/strict';
import test from 'node:test';
import {MAX_RESPONSE_BYTES,OEIS_ATTRIBUTION,notebookRecord,officialQueryURL,pageSnapshot,parseQueryResponse,queryParameters,recordSnapshot,sequenceID,sequenceURL} from '../public/online-query/model.js';

const record={number:45,name:'Fibonacci numbers',data:'0,1,1,2,3,5,8,13,21',offset:'0,4',formula:['a(n)=a(n-1)+a(n-2).'],comment:['A complete annotation.'],example:['a(6)=8.'],reference:['A source.'],link:['<a href="javascript:alert(1)">literal upstream text</a>'],program:['(Python) print(1)'],unrecognized:{nested:['retain',null,42]}};
const response=(overrides={})=>({provider:'oeis',query:'1,1,2,3,5',executedQuery:'1,1,2,3,5',start:0,pageSize:10,records:[record],fetchedAt:'2026-10-17T12:00:00.000Z',sourceURL:'https://oeis.org/search?q=1%2C1%2C2%2C3%2C5&start=0&fmt=json',nextStart:null,total:null,...overrides});
const parse=value=>parseQueryResponse(JSON.stringify(value),{query:'1,1,2,3,5',start:0});
test('manual query parameters retain meaning, unicode and explicit page boundaries',()=>{
 assert.deepEqual(queryParameters('  Fibonacci  '),{query:'Fibonacci',start:0});assert.deepEqual(queryParameters('数列 1,2,3',10000),{query:'数列 1,2,3',start:10000});
 for(const query of ['', '   ', null, 'a'.repeat(501),'1,2,3\n','a\u0000b','a\u0085b'])assert.throws(()=>queryParameters(query));
 for(const start of [-1,1,9,10010,0.5,Infinity,'10'])assert.throws(()=>queryParameters('A000045',start));
 const url=new URL(officialQueryURL('1,2,3 & keyword:"<svg>"'));assert.equal(url.origin,'https://oeis.org');assert.equal(url.searchParams.get('q'),'1,2,3 & keyword:"<svg>"');
 assert.equal(new URL(officialQueryURL(' a000045 ')).searchParams.get('q'),'id:A000045');
});
test('records and unknown original fields survive the validated immutable model unchanged',()=>{
 const source=response(),page=parse(source);assert.deepEqual(page,source);assert.ok(Object.isFrozen(page)&&Object.isFrozen(page.records)&&Object.isFrozen(page.records[0].unrecognized.nested));assert.throws(()=>page.records[0].formula.push('mutate'));
 assert.equal(sequenceID(page.records[0]),'A000045');assert.equal(sequenceURL(page.records[0]),'https://oeis.org/A000045');assert.equal(sequenceID({number:1234567}),'A1234567');
});
test('record, whole page and notebook exports preserve full fields, query, time, provenance and license',()=>{
 const page=parse(response()),item=page.records[0],snapshot=recordSnapshot(page,item),whole=pageSnapshot(page),note=notebookRecord(page,item);
 assert.equal(snapshot.record,item);assert.equal(whole.records[0],item);assert.deepEqual(snapshot.attribution,OEIS_ATTRIBUTION);assert.deepEqual(whole.attribution,OEIS_ATTRIBUTION);assert.equal(snapshot.query,page.query);assert.equal(snapshot.fetchedAt,page.fetchedAt);assert.equal(snapshot.recordURL,'https://oeis.org/A000045');
 for(const field of ['formula','comment','example','reference','link','program','unrecognized'])assert.deepEqual(snapshot.record[field],record[field]);
 assert.ok(note.text.includes(JSON.stringify(snapshot,null,2)));assert.ok(note.text.includes(page.fetchedAt));assert.ok(note.text.includes(OEIS_ATTRIBUTION.licenseURL));assert.throws(()=>recordSnapshot(page,{...item}));
});
test('envelope limits, source authenticity and query identity reject unusable responses',()=>{
 for(const override of [{provider:'elsewhere'},{query:'different clue'},{start:10},{pageSize:20},{records:[...Array(11)].map((_,index)=>({...record,number:index+1}))},{records:[record,record]},{records:[{number:0}]},{records:[{number:-1}]},{records:[{number:1.5}]},{total:-1},{total:'100'},{nextStart:20},{nextStart:10010},{executedQuery:''},{fetchedAt:'invalid'},{sourceURL:'https://elsewhere.invalid/search'},{sourceURL:'https://oeis.org.evil.invalid/search'},{sourceURL:'https://user:password@oeis.org/search'},{sourceURL:'https://oeis.org/other'},{sourceURL:'javascript:alert(1)'}])assert.throws(()=>parse(response(override)),JSON.stringify(override));
 assert.throws(()=>parseQueryResponse('<html>static host</html>',{query:'x',start:0}),/静态托管/);assert.throws(()=>parseQueryResponse(' '.repeat(MAX_RESPONSE_BYTES+1),{query:'x',start:0}),/限额/);
 assert.throws(()=>parse(response({sourceURL:'https://oeis.org/search?q=different&start=0&fmt=json'})),/来源与本次查询不符/);
 const deep={};let child=deep;for(let depth=0;depth<45;depth++){child.next={};child=child.next;}assert.throws(()=>parse(response({records:[{...record,deep}]})),/结构过深/);
});
test('unknown total stays unknown and pagination metadata is not invented',()=>{
 const page=parse(response({nextStart:10,total:null}));assert.equal(page.total,null);assert.equal(page.nextStart,10);assert.equal(parse(response({records:[],total:0})).records.length,0);
 const last=parseQueryResponse(JSON.stringify(response({start:10000,nextStart:null,sourceURL:'https://oeis.org/search?q=1%2C1%2C2%2C3%2C5&start=10000&fmt=json'})),{query:'1,1,2,3,5',start:10000});assert.equal(last.nextStart,null);
});
