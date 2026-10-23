import test from 'node:test';
import assert from 'node:assert/strict';
import {PLACE_PROVIDERS} from '../services/online-query/providers/places.mjs';
const provider=PLACE_PROVIDERS[0],at=Date.UTC(2026,9,17);
const ctx=(body,inspect=()=>{})=>({now:()=>at,request:async(url,options)=>{inspect(url,options);return {response:{status:200},text:JSON.stringify(body)};}});
test('places exposes exactly the seven documented read-only modes and rejects unrelated inputs',()=>{
 for(const mode of ['same-name-region','same-name-type','same-pinyin-region','same-pinyin-type'])assert.equal(provider.validate({mode,name:'故宫',distCode:'11'}).mode,mode);
 assert.throws(()=>provider.validate({mode:'arbitrary',url:'https://evil.test'}),{code:'INVALID_MODE'});
 assert.throws(()=>provider.validate({stName:'故宫',url:'https://evil.test'}),{code:'INVALID_QUERY'});
 assert.throws(()=>provider.validate({stName:'故宫',page:0}),{code:'INVALID_QUERY'});
 assert.throws(()=>provider.validate({stName:'故宫',size:51}),{code:'INVALID_QUERY'});
 assert.throws(()=>provider.validate({stName:'故宫',searchType:'近似'}),{code:'INVALID_QUERY'});
 assert.throws(()=>provider.validate({mode:'divisions',maxLevel:3}),{code:'INVALID_QUERY'});
 assert.throws(()=>provider.validate({mode:'same-pinyin-type',name:'Gùgōng'}),{code:'INVALID_QUERY'});
 assert.throws(()=>provider.validate({mode:'detail',id:'../../secret'}),{code:'INVALID_QUERY'});
});
test('places retains complete actual fields, CGCS2000 coordinates, pagination and provenance',async()=>{
 const row={id:'abc123',standard_name:'故宫站',gdm:{type:'multipoint',coordinates:[[116.3900916,39.9218817]]},future:{raw:['保留']}};
 const result=await provider.execute({stName:'故宫',code:'11',page:1,size:1},ctx({records:[row],total:7},url=>{assert.equal(url.host,'dmfw.mca.gov.cn');assert.equal(url.pathname,'/9095/stname/listPub');assert.equal(url.searchParams.get('stName'),'故宫');}));
 assert.deepEqual(result.records[0].fields,row);assert.equal(result.total,7);assert.equal(result.next.page,2);assert.match(result.attribution.license,/CGCS2000/);assert.equal(result.fetchedAt,'2026-10-17T00:00:00.000Z');
});
test('places detail uses documented form POST without loading attached media',async()=>{
 const row={id:'abc123',standard_name:'故宫站',multimedia_info:'api/MediaUpload/Get?path=image.jpg',place_meaning:'因位于故宫附近，故名。'};
 let calls=0;const result=await provider.execute({mode:'detail',id:'abc123'},ctx(row,(url,o)=>{calls++;assert.equal(url.pathname,'/9095/stname/detailsPub');assert.equal(o.method,'POST');assert.equal(new URLSearchParams(o.body).get('id'),'abc123');}));
 assert.equal(calls,1);assert.deepEqual(result.records[0].fields,row);assert.equal(result.next,null);
});
test('places administration preserves whole nested tree and all four statistics retain original counts',async()=>{
 const tree={code:'110000000000',name:'北京市',level:1,children:[{name:'东城区',code:'110101000000',children:[]}]};
 const result=await provider.execute({mode:'divisions',code:'11',maxLevel:2},ctx({data:tree,status:200,total:1}));assert.deepEqual(result.records[0].fields,tree);
 for(const mode of ['same-name-region','same-name-type','same-pinyin-region','same-pinyin-type']){
  const row={name:'北京市',type:'交通',typeCode:'23530',code:'11',count:3};
  const r=await provider.execute({mode,name:'故宫',distCode:'11'},ctx({data:[row],status:200,total:1},url=>assert.match(url.pathname,/GroupCount(Name|Pinyin)By(Code|Type)$/)));
  assert.deepEqual(r.records[0].fields,row);assert.equal(r.records[0].fields.count,3);
 }
});
test('places distinguishes upstream errors from empty results',async()=>{
 await assert.rejects(provider.execute({stName:'故宫'},ctx({status:500,message:'private detail'})),{code:'UPSTREAM_REJECTED'});
 await assert.rejects(provider.execute({stName:'故宫'},ctx({records:{},total:1})),{code:'INVALID_UPSTREAM_RESPONSE'});
 const r=await provider.execute({stName:'不存在的公开示例'},ctx({records:[],total:0}));assert.equal(r.total,0);assert.deepEqual(r.records,[]);assert.equal(r.next,null);
});
