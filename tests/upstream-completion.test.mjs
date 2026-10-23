import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {runNativeProgram,publicMethods} from '../public/science/native-api.js';
import {elementRecord} from '../public/science/element-record.js';
import * as Tonal from '../public/vendor/round2/tonal-full.js';
import {stegEmbed,stegExtract,stegEmbedImage} from '../public/image-projects.js';
import {musicClue} from '../public/round2/tonal-model.js';
import {clueViewerOptions} from '../public/science/sequence-model.js';
import {inspectPuzzle} from '../public/round1/cubing-worker.js';
import {puzzles} from '../public/vendor/round1/cubing/lib/cubing/puzzles/index.js';
import {astronomy,calendar} from '../public/science/core.js';

test('所有固定谜题均能建立真实观察状态，旧求解与竞速打乱接口明确拒绝',async()=>{
 for(const puzzle of Object.keys(puzzles)){
  const result=await inspectPuzzle({puzzle,input:'',setup:'',position:0});assert.ok(result.pattern,puzzle);assert.equal(result.solved,true,puzzle);
 }
 const step=await inspectPuzzle({puzzle:'4x4x4',setup:'Rw',input:"[R,U]",position:2});
 const expected=await inspectPuzzle({puzzle:'4x4x4',input:'Rw R U'});assert.deepEqual(step.pattern,expected.pattern);assert.equal(step.expandedCount,4);
 for(const action of ['solve','scramble','unknown'])await assert.rejects(inspectPuzzle({puzzle:'3x3x3',action}),/不提供/);
 await assert.rejects(inspectPuzzle({puzzle:'2x2x2',input:'(R)10001'}),/10000/);
});
test('音程与移调保留八度，位置表单准确映射正反阅读框并拒绝越界',()=>{
 assert.equal(musicClue('distance','C4','G4').find(r=>r[0]==='半音数')[1],'7');
 assert.equal(musicClue('transpose','C4','7').find(r=>r[0]==='移调结果')[1],'G4');
 assert.equal(musicClue('transpose','C4','-1').find(r=>r[0]==='移调结果')[1],'B3');
 assert.throws(()=>musicClue('transpose','C4',''),/整数/);
 const props={seq:'ATGAAATAGG',seqType:'dna',start:'2',end:'9',name:'线索'};
 assert.deepEqual(clueViewerOptions({...props,frame:'2'}).annotations,[{name:'线索',start:1,end:9,direction:1}]);
 assert.deepEqual(clueViewerOptions({...props,frame:'2'}).translations,[{start:1,end:10,direction:1}]);
 assert.deepEqual(clueViewerOptions({...props,frame:'-2'}).translations,[{start:0,end:9,direction:-1}]);
 assert.throws(()=>clueViewerOptions({...props,frame:'1',end:'11'}),/范围/);
 assert.throws(()=>clueViewerOptions({...props,seqType:'aa',frame:'1'}),/氨基酸/);
});
test('当地日食与可选文化历法直接执行原引擎，不依赖原生工作表',()=>{
 const ctx={Date};ctx.self=ctx;vm.createContext(ctx);for(const f of ['astronomy','lunar'])vm.runInContext(readFileSync('public/vendor/science/'+f+'.js','utf8'),ctx);
 const result=astronomy({date:'2024-04-01T00:00',offset:0,lat:32.7767,lon:-96.797,event:'local-eclipse'},ctx.Astronomy);assert.match(JSON.stringify(result),/2024-04-08/);assert.match(JSON.stringify(result),/全食/);
 const plain=calendar({mode:'solar',date:'2024-02-10'},ctx),extra=calendar({mode:'solar',date:'2024-02-10',reference:true},ctx);assert.equal(extra.rows.length,plain.rows.length+2);assert.ok(!plain.rows.some(r=>/八字|宜忌/.test(r[0])));
});

test('complete element projection preserves every original field and every original value',()=>{
 const original=JSON.parse(readFileSync('upstream/science/sources/periodic-table/PeriodicTableJSON.json')).elements.filter(x=>x.number<=118),runtime=JSON.parse(readFileSync('public/vendor/science/elements.json'));
 assert.equal(runtime.length,118);for(const el of original){const actual=runtime.find(x=>x.number===el.number);for(const [key,value]of Object.entries(el))assert.deepEqual(actual[key],value,el.symbol+'.'+key);assert.equal(elementRecord(actual).rows.length,Object.keys(actual).length);}
});
test('real fixed Astronomy event, coordinate and lunar calendar APIs are callable',async()=>{
 const ctx={Date};ctx.self=ctx;vm.createContext(ctx);for(const f of ['astronomy','lunar'])vm.runInContext(readFileSync('public/vendor/science/'+f+'.js','utf8'),ctx);
 const result=await runNativeProgram(ctx.Astronomy,[{new:'Observer',id:'obs',args:[32.7767,-96.797,0]},{call:'SearchLocalSolarEclipse',args:[{date:'2024-04-01T00:00:00Z'},{ref:'obs'}]}],{constructors:['Observer']});assert.match(result.rows[0][1],/2024-04-08/);assert.match(result.rows[0][1],/total/);
 const objects={Solar:ctx.Solar,Lunar:ctx.Lunar};const lunar=await runNativeProgram(objects,[{on:'Solar',call:'fromYmd',id:'s',args:[2024,2,10]},{on:'s',call:'getLunar',id:'l'},{on:'l',call:'getYearInGanZhi'},{on:'l',call:'getFoto',id:'f'},{on:'f',call:'toFullString'}],{objects});assert.match(lunar.rows[0][1],/甲辰/);
});
test('native workbook refuses prototype traversal and invalid references and releases WASM handles on failure',async()=>{
 let destroyed=0;const obj={method(){return 1;},delete(){destroyed++;}},lib={create(){return obj;}};
 await assert.rejects(runNativeProgram(lib,[{call:'constructor'}]),/无效/);
 await assert.rejects(runNativeProgram(lib,[{call:'create',id:'m'},{on:'m',call:'missing'}]),/没有公开方法/);assert.equal(destroyed,1);
 await assert.rejects(runNativeProgram(lib,[{call:'create',args:[{ref:'unknown'}]}]),/未知对象/);
 assert.ok(!publicMethods(obj).includes('constructor'));
});
test('full pinned Tonal includes key, mode, progression, pcset, voicing and voice-leading',()=>{
 for(const n of ['Key','Mode','Progression','Pcset','Voicing','VoiceLeading','RomanNumeral','RhythmPattern'])assert.ok(Tonal[n],n);
 assert.equal(Tonal.Key.majorKey('C').tonic,'C');assert.deepEqual(Tonal.Progression.fromRomanNumerals('C',['I','IV','V']),['C','F','G']);assert.equal(Tonal.Mode.get('dorian').name,'dorian');
});
test('actual StegOnline embedding roundtrips complete binary through both traversal orders',async()=>{
 globalThis.ImageData??=class{constructor(data,width,height){this.data=data;this.width=width;this.height=height;}};
 const original=Uint8ClampedArray.from({length:16*16*4},(_,i)=>i%256),selectedBits={r:[0,1],g:[0],b:[1],a:[]},payload=Uint8Array.of(0,255,65,128,10);
 for(const order of ['Row','Column'])for(const bitOrder of ['MSB','LSB']){const result=await stegEmbed(original,16,16,payload,selectedBits,order,bitOrder,'bgra');const read=await stegExtract(result,16,16,selectedBits,order,bitOrder,'bgra');assert.deepEqual(read.slice(0,payload.length),payload);}
 await assert.rejects(stegEmbed(original,16,16,new Uint8Array(1000),selectedBits,'Row','MSB','rgba'),/超过/);
 const result=stegEmbedImage(original,16,16,{width:1,height:1,pixels:Uint8Array.of(255,0,0,255)},'r',0);assert.equal(result[0]&1,0);assert.deepEqual(original.slice(0,4),Uint8ClampedArray.of(0,1,2,3));
});
