import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import {referenceReading} from '../public/online-query/reading-reference.js';

const fixture=async name=>JSON.parse(await fs.readFile(new URL('./fixtures/online-reading/reference/'+name+'.json',import.meta.url),'utf8'));
const freeze=(value,seen=new Set())=>{if(value&&typeof value==='object'&&!seen.has(value)){seen.add(value);for(const item of Object.values(value))freeze(item,seen);Object.freeze(value);}return value;};
const allText=value=>JSON.stringify(value);
const section=(view,title)=>view.sections.find(value=>value.title===title);

test('OEIS real records show original terms, formulas, programs and cross references in readable sections',async()=>{
 for(const name of ['oeis-A001129','oeis-A027926']){
  const record=freeze(await fixture(name)),before=JSON.stringify(record),view=referenceReading('oeis',record,{});
  assert.match(view.title,new RegExp('^'+name.slice(5)));assert.ok(view.summary.includes(record.name));
  assert.match(section(view,'数列项').paragraphs[0],new RegExp('^'+record.data.split(',').slice(0,4).join(', ')));
  assert.ok(section(view,'数列信息').fields.some(([label,value])=>label.startsWith('起始索引')&&value===record.offset));
  assert.ok(section(view,'程序示例（原文）').paragraphs[0].includes(record.program[0]));
  assert.ok(section(view,'相关数列（原文）').paragraphs[0].includes(record.xref[0]));
  assert.ok(section(view,'记录信息').fields.some(([label,value])=>label==='贡献者（原文）'&&value===record.author));
  assert.ok(!allText(view).includes('<a href='));assert.equal(JSON.stringify(record),before);
 }
 const array=referenceReading('oeis',await fixture('oeis-A027926'),{});
 assert.match(section(array,'数列信息').fields.find(([label])=>label==='原站标签')[1],/不规则数组逐行展开/);
 assert.ok(section(array,'公式／递推关系（原文）').paragraphs[0].includes('binomial(n-j'));
 assert.ok(section(array,'计算示例（原文）').paragraphs.some(value=>value.includes('前 12 条')));
 assert.ok(section(array,'数列项').paragraphs.some(value=>value.includes('前 80 项')));
});

test('OEIS unknown metadata never gains invented translation or numeric precision loss',()=>{
 const record=freeze({number:99,name:'Untranslated original',data:'0,-1,123456789012345678901234567890',offset:'-1,3',formula:['a(n) < 2 when n > 1'],keyword:'nonn,future,toString',authors:['Author A','Author B'],unknown:{all:['retain']}}),before=JSON.stringify(record);
 const view=referenceReading('oeis',record,{}),text=allText(view);
 assert.ok(text.includes('123456789012345678901234567890'));assert.ok(text.includes('a(n) < 2 when n > 1'));assert.ok(text.includes('future'));assert.ok(text.includes('toString'));assert.ok(!text.includes('function toString'));assert.ok(text.includes('Author A；Author B'));
 assert.equal(view.summary,'Untranslated original');assert.equal(JSON.stringify(record),before);
});

test('real place search/detail show standard name, spelling, administration, CGCS2000 geometry and history',async()=>{
 const search=await fixture('places-search'),detail=await fixture('places-detail');
 for(const [mode,row]of [['search',search.records[0]],['detail',detail]]){
  const record=freeze({title:row.standard_name,fields:row}),before=JSON.stringify(record),view=referenceReading('placenames',record,{parameters:{mode}});
  assert.equal(view.title,'故宫站');assert.match(view.summary,/北京市.*西城区.*公共交通车站/);
  const fields=section(view,'地名基本信息').fields;
  assert.ok(fields.some(([label,value])=>label==='罗马字母拼写'&&value==='Gùgōng Zhàn'));
  assert.ok(fields.some(([label,value])=>label==='地名代码'&&value==='11010201223530950016'));
  const geometry=section(view,'空间位置（CGCS2000）');assert.deepEqual(geometry.table.columns,['坐标节点','经度（度）','纬度（度）']);assert.deepEqual(geometry.table.rows[0].slice(1),['116.3900916','39.9218817']);assert.deepEqual(geometry.paragraphs,[]);
  assert.equal(JSON.stringify(record),before);
  if(mode==='detail'){assert.equal(section(view,'地名含义').paragraphs[0],detail.place_meaning);assert.equal(section(view,'地名来历').paragraphs[0],detail.place_origin);assert.equal(section(view,'地名历史沿革').paragraphs[0],detail.place_history);}
 }
});

test('administrative hierarchy uses actual fields and keeps descendants in the original record',async()=>{
 const body=await fixture('places-divisions'),row=freeze(body.data),view=referenceReading('placenames',{fields:row},{parameters:{mode:'divisions'}}),table=section(view,'行政区划层级').table;
 assert.deepEqual(table.rows,[['北京市','110000000000','直辖市','1']]);
 const tree=freeze({name:'上级',code:'00',level:0,type:'上级单位',children:[{name:'下级',code:'0001',level:1,type:'下级单位',children:[]}]});
 const nested=referenceReading('placenames',{fields:tree},{parameters:{mode:'divisions'}});assert.deepEqual(section(nested,'行政区划层级').table.rows[1],['上级 → 下级','0001','下级单位','1']);assert.equal(tree.children.length,1);
 assert.doesNotMatch(allText(nested),/不据此推断/);
});

test('all four official statistics modes label original counts and query scope without treating zero as empty',()=>{
 for(const mode of ['same-name-region','same-name-type','same-pinyin-region','same-pinyin-type']){
  // Protocol-shaped examples, not invented claims of returned real records.
  const fields=freeze({name:'北京市',code:'11',type:'公共交通车站',typeCode:'23530',count:0}),parameters=freeze({mode,name:mode.includes('pinyin')?'Gùgōng':'故宫',distCode:'11'}),view=referenceReading('placenames',{fields},{parameters});
  const table=view.sections.at(-1).table;assert.equal(table.rows[0][2],'0');assert.equal(table.rows[0][0],mode.endsWith('-type')?'公共交通车站':'北京市');assert.match(view.summary,/0/);assert.ok(section(view,'统计条件').fields.some(([label,value])=>label==='统计范围行政区划代码'&&value==='11'));
 }
});

test('readable projections tolerate null/unknown values, remain plain data, and bound deep or large previews',()=>{
 for(const provider of ['oeis','placenames'])for(const record of [null,undefined,[],false])assert.deepEqual(referenceReading(provider,record,{}),{sections:[]});
 assert.equal(referenceReading('unknown',{fields:{}},{}),null);
 assert.deepEqual(referenceReading('oeis',{name:{unsafe:'object'},formula:[null,{}]},{}).sections,[]);
 const odd=referenceReading('placenames',{fields:{standard_name:'<img src=x onerror=alert(1)>故宫站',place_meaning:'<script>alert(1)</script>原文 &amp; 资料',gdm:{type:'point',coordinates:[0,0]}}},{parameters:{mode:'detail'}});
 assert.equal(odd.title,'故宫站');assert.equal(section(odd,'地名含义').paragraphs[0],'原文 & 资料');assert.deepEqual(section(odd,'空间位置（CGCS2000）').table.rows[0].slice(1),['0','0']);assert.ok(!allText(odd).includes('onerror'));
 const huge=freeze({number:1,data:Array.from({length:2000},(_,i)=>String(i)).join(','),comment:Array(1000).fill('x'.repeat(10000)),example:Array(1000).fill('y'.repeat(10000))});
 const preview=referenceReading('oeis',huge,{});assert.ok(section(preview,'数列项').paragraphs[1].includes('2000'));assert.ok(allText(preview).length<70000);assert.equal(huge.comment[0].length,10000);
 const children=Array.from({length:200},(_,i)=>({name:'下级'+i,code:String(i),children:[]})),tree={name:'根',children};tree.children.push(tree);
 const nested=referenceReading('placenames',{fields:tree},{parameters:{mode:'divisions'}});assert.equal(section(nested,'行政区划层级').table.rows.length,80);assert.match(allText(nested),/最多展示 80/);assert.equal(tree.children.length,201);
});

test('saved real same-name query stays empty instead of manufacturing a demonstration record',async()=>{
 const body=await fixture('places-same-name');assert.deepEqual(body.data,[]);assert.equal(body.total,0);
});
