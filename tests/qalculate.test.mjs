import {UNIT_DISCIPLINES,unitDiscipline} from '../public/capabilities/unit-catalog.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import create from '../public/vendor/qalculate/qalculate.mjs';
import {catalogueItems,unitExpression,validateSession,recordJSON} from '../public/qalculate/model.js';
import {snapshotVirtualFiles,changedVirtualFiles} from '../public/qalculate/files.js';
import {calculatorInsertion,findUnit,memoryExpression,unitGroups} from '../public/qalculate/player-model.js';

const q=await create({print:()=>{},printErr:()=>{}});
test('分类换算保留全部真实单位，并使用实际输入语法而非内部目录标识',async()=>{
 const definitions=JSON.parse(await readFile('public/qalculate/unit-definitions.json','utf8')),zh=JSON.parse(await readFile('public/vendor/qalculate/zh-CN.json','utf8'));
 assert.equal(createHash('sha256').update(await readFile(definitions.source)).digest('hex'),definitions.sha256);
 const groups=unitGroups(q.catalog(),definitions,zh);assert.equal(groups.flatMap(g=>g.units).length,452);
 assert.ok(groups.find(g=>g.id==='Volume').units.some(u=>u.name==='US_teaspoon'));
 assert.ok(!groups.find(g=>g.id==='Volume').units.some(u=>u.name==='l_p_s'));
 for(const [amount,from,to,expected]of [['72','km_p_h','m_p_s',/^20 m/],['1','km_c','m',/^1000 m/],['1','kg_c','g',/^1000 g/],['20','oC','oF',/^68/],['1','kbyte_c','byte',/^1000/],['1','Kibyte_c','byte',/^1024/],['1','L','ml_c',/^1000/]]){
  const result=q.calculate(unitExpression(amount,findUnit(groups,from).expression,findUnit(groups,to).expression));assert.match(result.output,expected,from+' → '+to);assert.deepEqual(result.messages,[]);
 }
 assert.equal(findUnit(groups,'celsius').name,'oC');assert.equal(findUnit(groups,'cm').name,'cm_c');
});
test('计算键盘按真实选区插入函数、平方与正负号，内存保存可继续计算的值',()=>{
 assert.deepEqual(calculatorInsertion('12+34',3,5,'sqrt('),{text:'12+sqrt(34)',caret:11});
 assert.equal(calculatorInsertion('2+3',0,3,'±').text,'-(2+3)');
 assert.equal(q.calculate(memoryExpression('3','2','add')).output,'5');
 assert.equal(q.calculate(memoryExpression('3','2','subtract')).output,'1');
 assert.throws(()=>memoryExpression('3','','add'),/先完成/);
});
test('完整官方内核目录、数据集和前缀没有裁剪',()=>{
 const c=q.catalog();assert.equal(c.version,'5.13.0');
 assert.deepEqual(Object.fromEntries(['functions','units','variables','prefixes'].map(k=>[k,c[k].length])),{functions:425,units:452,variables:186,prefixes:34});
 assert.ok(c.functions.every(f=>Array.isArray(f.arguments)&&f.name&&Array.isArray(f.aliases)));
 assert.deepEqual(q.datasets().map(d=>[d.name,d.properties.length,d.rows.length]),[['atom',10,118],['planet',12,10]]);
 assert.equal(q.options().length,97);
 assert.ok(q.options().some(o=>o.name==='evaluate.parse_options.parsing_mode'&&o.choices.some(c=>c.name==='PARSING_MODE_RPN')));
});
test('真实算术、符号、微积分、矩阵、统计、数据集与复数',()=>{
 for(const [input,pattern] of [
  ['(1/3+1/6)*2',/^1$/],['solve(x^2=4,x)',/2.*−2/],['integrate(x^2,0,1)',/1 ∕ 3/],
  ['diff(x^3,x)',/3.*x/],['det([1,2;3,4])',/−2/],['mean([1,2,6])',/^3$/],
  ['sqrt(-1)',/^i$/],['atom(79,"weight")',/196.96657/],['planet(Mars,mass)',/6.4171/],
 ])assert.match(q.calculate(input).output,pattern,input);
});
test('统一单位覆盖复合量、偏移温度、数据容量与其他维度',()=>{
 for(const [input,pattern] of [
  ['36 km/h to m/s',/^10 m/],['20 celsius to fahrenheit',/^68/],['1 acre to m^2',/4046/],
  ['1 lb to g',/453.59237/],['1 GiB to byte',/1073741824/],['1 bar to Pa',/100000/],
 ])assert.match(q.calculate(input).output,pattern,input);
 assert.equal(unitExpression('36','km/h','m/s'),'(36) km/h to m/s');
});
test('原生设置保留精度，错误设置拒绝',()=>{
 assert.equal(q.setOption('evaluate.approximation APPROXIMATION_TRY_EXACT'),true);
 assert.equal(q.setOption('precision 80'),true);assert.match(q.calculate('sqrt(2)').output,/1\.4142135623730950488016887242096980785696718753769480731766797379907324784621070/);
 assert.equal(q.setOption('print.base 16'),true);assert.match(q.calculate('255').output,/FF/);
 assert.equal(q.setOption('print.base 10'),true);
 assert.equal(q.setOption('evaluate.parse_options.parsing_mode PARSING_MODE_RPN'),true);assert.equal(q.calculate('2 3 +').output,'5');
 q.setOption('evaluate.parse_options.parsing_mode PARSING_MODE_ADAPTIVE');
 assert.equal(q.setOption('not.a.setting 1'),false);assert.equal(q.setOption('evaluate.approximation BAD_ENUM'),false);
});
test('临时变量及自定义函数导出后在全新内核恢复',async()=>{
 q.calculate('save(1/3,"clue")');const definitions=q.exportDefinitions();
 assert.match(definitions.temporary,/clue/);
 const fresh=await create({print:()=>{},printErr:()=>{}});
 for(const text of Object.values(definitions))assert.ok(fresh.loadDefinitions(text)>0);
 assert.equal(fresh.calculate('clue*3').output,'1');
 const xml='<?xml version="1.0"?><QALCULATE version="5.13.0"><function name="doubleclue"><names>r:doubleclue</names><expression>2*\\x</expression></function></QALCULATE>';
 assert.ok(fresh.loadDefinitions(xml)>0);assert.equal(fresh.calculate('doubleclue(21)').output,'42');
 assert.ok(fresh.catalog().functions.some(f=>f.name==='doubleclue'));
});
test('原生绘图返回完整采样与实际绘图指令',()=>{
 const result=q.calculate('plot(sin(x),0,6)');assert.ok(result.plot);
 assert.ok(Object.values(result.plot.data)[0].split('\n').length>1000);assert.match(result.plot.commands,/plot/);
});
test('原生 CSV 导出生成完整可下载文件，load 真实读取原矩阵',()=>{
 q.FS.chdir('/tmp');const before=snapshotVirtualFiles(q.FS);
 q.calculate('export([1,2;3,4],"core-export.csv")');
 const files=changedVirtualFiles(before,snapshotVirtualFiles(q.FS));assert.equal(files.length,1);assert.equal(files[0].path,'/tmp/core-export.csv');
 assert.match(q.calculate('load("core-export.csv")').output,/\[1\s+2;\s*3\s+4\]/);
 const saved=JSON.parse(recordJSON({files}));assert.equal(saved.files[0].bytes.encoding,'base64');assert.deepEqual(Buffer.from(saved.files[0].bytes.data,'base64'),Buffer.from(q.FS.readFile('/tmp/core-export.csv')));
 assert.deepEqual(changedVirtualFiles(snapshotVirtualFiles(q.FS),snapshotVirtualFiles(q.FS)),[]);
 assert.throws(()=>changedVirtualFiles(new Map(),new Map([['/tmp/too-big',new Uint8Array(33*1024*1024)]])),/未返回删减结果/);
});
test('完整目录搜索和官方中文翻译不改变引擎名称',async()=>{
 const zh=JSON.parse(await readFile('public/vendor/qalculate/zh-CN.json','utf8'));
 assert.ok(Object.keys(zh).length>2700);
 const c=q.catalog();assert.equal(catalogueItems(c,'units').length,452);
 assert.ok(catalogueItems(c,'units','米','',zh).length>0);
 assert.throws(()=>validateSession({format:'x'}));
 const valid={format:'mist-qalculate-session',version:1,expression:'1+2',options:'',settings:{precision:'20'},definitions:[],history:[]};assert.equal(validateSession(valid),valid);
 assert.throws(()=>validateSession({...valid,history:[{expressions:['1+2'],output:3}]}));
 assert.throws(()=>validateSession({...valid,settings:{precision:20}}));
});
test('运行文件与随包来源全部有固定摘要',async()=>{
 const meta=JSON.parse(await readFile('public/vendor/qalculate/UPSTREAM.json','utf8'));
 for(const f of meta.files)assert.equal(createHash('sha256').update(await readFile(f.path)).digest('hex'),f.sha256,f.path);
});

test('单位学科覆盖全部 452 项，类别唯一归属，学科实例交给真实内核',async()=>{
 const definitions=JSON.parse(await readFile('public/qalculate/unit-definitions.json')),zh=JSON.parse(await readFile('public/vendor/qalculate/zh-CN.json'));
 const groups=unitGroups(q.catalog(),definitions,zh);assert.equal(groups.flatMap(g=>g.units).length,452);
 for(const group of groups)assert.ok(UNIT_DISCIPLINES.some(d=>d.id===unitDiscipline(group.id)),group.id);
 assert.equal(unitDiscipline('Mass/Atomic Mass'),'chemistry');assert.equal(unitDiscipline('Volume'),'everyday');assert.equal(unitDiscipline('Volume/Volumetric Flow Rate'),'mechanics');
 for(const [expression,expected]of [['1 km to m',/^1000 m/],['72 km/h to m/s',/^20 m/],['20 celsius to fahrenheit',/^68/],['1 V to mV',/^1000/],['1 lx to ph',/ph/],['1 mol/L to mol/m^3',/^1000/],['1 KiB to byte',/^1024/],['100 eurocent to EUR',/^€1$/]]){const r=q.calculate(expression);if(expression.includes('eurocent'))assert.ok(r.messages.every(m=>m.type===1&&/exchange rates/.test(m.text)));else assert.deepEqual(r.messages,[],expression);assert.match(r.output,expected);}
});
