import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {onlineReading,READING_LIMITS} from '../public/online-query/reading.js';
import {languageReading} from '../public/online-query/reading-language.js';
import {scienceReading} from '../public/online-query/reading-science.js';
import {referenceReading} from '../public/online-query/reading-reference.js';

const fixture=async name=>JSON.parse(await readFile(new URL(`fixtures/online-reading/${name}.json`,import.meta.url),'utf8'));
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const texts=view=>[view.title,view.summary,...view.sections.flatMap(section=>[section.title,...section.fields.flat(),...section.paragraphs,...(section.table?[...section.table.columns,...section.table.rows.flat()]:[])])].filter(value=>typeof value==='string');
const bounds=view=>{assert.ok(view.sections.length<=READING_LIMITS.sections);for(const section of view.sections){assert.ok(section.fields.length<=READING_LIMITS.fields);assert.ok(section.paragraphs.length<=READING_LIMITS.paragraphs);if(section.table){assert.ok(section.table.columns.length<=READING_LIMITS.columns);assert.ok(section.table.rows.length<=READING_LIMITS.rows);assert.ok(section.table.rows.every(row=>row.length===section.table.columns.length));}}assert.ok(texts(view).reduce((sum,value)=>sum+value.length,0)<=READING_LIMITS.text,'all visible text, including truncation markers, stays within the shared display budget');};

test('all nine provider dispatch paths reach their own domain using saved responses',async()=>{
 const language=await Promise.all(['zdic-character','cnk-writing','pokewiki-pikachu'].map(fixture)),science=await Promise.all(['science/simbad-name','science/vizier-records','science/pubchem-search'].map(fixture)),oeis=await fixture('reference/oeis-A001129'),places=await fixture('reference/places-search');
 // No successful COD live response was available. This one explicit protocol
 // boundary record proves dispatch only, and is not evidence of an upstream query.
 const cod={record:{id:'1000001',title:'COD protocol boundary',fields:{file:'1000001',formula:'C',a:null},sourceURL:'https://www.crystallography.net/cod/1000001.html'},result:{parameters:{mode:'search'}}};
 const cases=[...language.map((value,index)=>[['zdic','cnkgraph','pokewiki'][index],value,['读音与字形','正文','基本资料'][index]]),...science.map((value,index)=>[['simbad','vizier','pubchem'][index],value,['天体身份','天体数据','物质基本信息'][index]]),['oeis',{record:oeis,result:{parameters:{mode:'search'}}},'数列项'],['placenames',{record:{id:places.records[0].id,title:places.records[0].standard_name,fields:places.records[0]},result:{parameters:{mode:'search'}}},'地名基本信息'],['cod',cod,'晶体结构']];
 assert.equal(cases.length,9);assert.equal(new Set(cases.map(([provider])=>provider)).size,9);
 for(const [provider,value,expected]of cases){const original=JSON.stringify(value),view=onlineReading(provider,freeze(value.record),freeze(value.result));assert.ok(view.sections.some(section=>section.title===expected),provider);assert.equal(JSON.stringify(value),original,provider);bounds(view);}
});

test('unowned providers return null so an earlier domain cannot shadow later dispatch',()=>{
 assert.equal(languageReading('oeis',{fields:{}},{}),null);assert.equal(languageReading('pubchem',{fields:{}},{}),null);assert.equal(scienceReading('zdic',{fields:{}},{}),null);assert.equal(scienceReading('oeis',{fields:{}},{}),null);assert.equal(referenceReading('cnkgraph',{fields:{}},{}),null);assert.equal(referenceReading('simbad',{fields:{}},{}),null);
 const record={title:'未知来源标题',fields:{privateLookingRaw:'original-only',ra:0}},view=onlineReading('future-provider',record,{});assert.equal(view.title,'未知来源标题');assert.equal(view.summary,'');assert.deepEqual(view.sections,[]);assert.equal(view.truncated,false);assert.doesNotMatch(JSON.stringify(view),/original-only/);bounds(view);
});

test('shared display bounds do not truncate a complete rhyme record or notebook source',async()=>{
 const value=await fixture('cnk-rhyme'),original=JSON.stringify(value),view=onlineReading('cnkgraph',freeze(value.record),freeze(value.result)),table=view.sections.find(section=>section.table).table;
 assert.equal(value.record.fields.Chars.length,244);assert.equal(table.rows.length,READING_LIMITS.rows);assert.equal(view.truncated,true);assert.equal(JSON.stringify(value),original);assert.deepEqual(table.rows[0],[value.record.fields.Chars[0].Char,value.record.fields.Chars[0].Comment??'',value.record.fields.Chars[0].Sames??'']);bounds(view);
});

test('oversized actual-shape dictionary input obeys a total text and section budget',async()=>{
 const value=await fixture('zdic-character'),row=structuredClone(value.record);row.fields.description='释义'.repeat(10000);row.fields.sections=Array.from({length:80},(_,index)=>({id:String(index),title:'词义 '+index,text:'原文字义。'.repeat(4000)}));const original=JSON.stringify(row),view=onlineReading('zdic',freeze(row),value.result);
 assert.equal(view.truncated,true);assert.equal(view.sections.length,READING_LIMITS.sections);assert.equal(JSON.stringify(row),original);bounds(view);
});

test('real missing scientific values stay absent while an actual zero stays visible',async()=>{
 const value=await fixture('science/simbad-name'),row=structuredClone(value.record);Object.assign(row.fields,{ra:null,dec:'',plx_value:null,plx_err:undefined,rvz_radvel:null,rvz_redshift:0});const original=JSON.stringify(row),view=onlineReading('simbad',freeze(row),freeze(value.result)),fields=new Map(view.sections.flatMap(section=>section.fields));
 assert.equal(fields.has('赤经'),false);assert.equal(fields.has('赤纬'),false);assert.equal(fields.has('视差'),false);assert.equal(fields.has('视向速度'),false);assert.equal(fields.get('红移'),'0');assert.equal(JSON.stringify(row),original);bounds(view);
});

test('real Wiki values, type and raw revision survive the normalized dispatcher',async()=>{
 const value=await fixture('pokewiki-pikachu'),revision=value.record.fields.revisions[0],original=revision.slots.main.content,view=onlineReading('pokewiki',freeze(value.record),freeze(value.result)),fields=new Map(view.sections.find(section=>section.title==='基本资料').fields);
 assert.equal(fields.get('全国图鉴编号'),'025');assert.equal(fields.get('属性'),'电');assert.equal(fields.get('身高（m）'),'0.4');assert.match(view.summary,/皮卡丘/);assert.equal(revision.slots.main.content,original);assert.equal(view.truncated,false);bounds(view);
});
