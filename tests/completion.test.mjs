import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {BYTE_CODECS,encodeBytes,decodeBytes} from '../public/completion/bytes.js';
import {extendedInteger,negaFibonacci,decodeNega} from '../public/completion/numerals.js';
import {radix,integerCode,cable,permutation,resistor,capacitor,encodeComponent} from '../public/completion/codes.js';
import {validateFold,selectFoldFrame,foldSnapshot} from '../public/completion/fold-model.js';
import {hamming} from '../public/completion/hamming.js';
import {semaphore,prussian} from '../public/completion/signals.js';
import bwip from '../public/vendor/completion/bwip-js/bwip-js.mjs';
import {gs8,gs8Symbols} from '../public/completion/gs8.js';
import {flagGroups,marine} from '../public/completion/marine.js';
import {prussianCode,prussianSegments,prussianSVG} from '../public/completion/prussian.js';
import {queryMarineBook} from '../public/discovery/reference-core.js';
import {keyboardLayouts,layoutCode} from '../public/completion/keyboard-layout.js';
test('all 46 keyboard layout definitions drive actual position transforms',async()=>{
 const layouts=await keyboardLayouts();assert.equal(Object.keys(layouts).length,46);
 assert.equal(layoutCode('q',{mode:'layout-change'},layouts),'a');assert.equal(layoutCode('a',{mode:'layout-change',direction:'decode'},layouts),'q');
 assert.equal(layoutCode('q',{mode:'layout-positions'},layouts),'2,2');assert.equal(layoutCode('2,2',{mode:'layout-positions',direction:'decode'},layouts),'q');
 for(const [name,data]of Object.entries(layouts))for(const [layer,rows]of Object.entries(data.layout)){assert.ok(rows.length,name+layer);const key=rows.flatMap(r=>r.split(' ')).find(k=>k&&!/^\{/.test(k));assert.ok(key,name+layer);assert.equal(layoutCode(key,{mode:'layout-change',fromLayout:name,toLayout:name,fromLayer:layer,toLayer:layer},layouts),key);}
});
test('complete GS8 published tables preserve all symbols, conflicts and multicell structures',()=>{
 const data=JSON.parse(readFileSync('public/vendor/completion/gs8/symbols.json','utf8')),rows=gs8Symbols(data);assert.equal(rows.length,210);
 for(const row of rows)assert.equal(gs8('{'+row.id+'}',{syntax:'tokens'},data),row.braille);
 assert.equal(gs8('Ab',{},data),'⡁⠃');assert.equal(gs8('⡁⠃',{direction:'decode'},data),'Ab');
 assert.match(gs8('⠥',{direction:'decode'},data),/lower-u/);assert.match(gs8('⠥',{direction:'decode'},data),/numbers-/);
 assert.equal(gs8('',{direction:'table'},data).split('\n').length,210);
 assert.throws(()=>gs8('😀',{},data));assert.equal(gs8('{ABC}',{},data).length,5);
});
test('International Signals full book, flag classes, decimal point and substitutes',async()=>{
 const fetchBefore=globalThis.fetch;try{globalThis.fetch=async url=>({ok:true,text:async()=>readFileSync(url,'utf8')});const result=await marine('A1',{direction:'encode'});assert.match(result.svg,/viewBox="0 0 240 120"/);assert.match(result.svg,/viewBox="0 0 120 120"/);}finally{globalThis.fetch=fetchBefore;}
 assert.deepEqual(flagGroups('L2330')[0].tokens,['L','2','3','R2','0']);
 assert.equal(flagGroups('1 R1 0 R3',{direction:'decode'})[0].text,'1100');
 assert.equal(flagGroups('L 2 3 R2 0',{direction:'decode'})[0].text,'L2330');
 assert.throws(()=>flagGroups('AA11')); // R1 already used by the letter hoist; R2 cannot reference a future digit.
 assert.equal(flagGroups('1 CODE 1',{direction:'decode'})[0].text,'1.1');
 assert.throws(()=>flagGroups('R1',{direction:'decode'}));assert.throws(()=>flagGroups('1 R1 R1',{direction:'decode'}));
 const pages=JSON.parse(readFileSync('public/vendor/completion/marine/pages.json','utf8'));assert.equal(pages.length,159);assert.equal(pages[1].image,'flag-chart.png');
 assert.equal(queryMarineBook({query:''},pages).total,159);assert.ok(queryMarineBook({query:'NC'},pages).items.some(r=>r.fields[0][1].includes('distress')));
});
test('Prussian six-arm codes and linear-size animated semaphore output',async()=>{
 assert.deepEqual(prussianSegments('5.100'),['a5','a1']);assert.equal(prussianCode('a1a5'),'5.100');
 assert.equal(prussianCode('a1a6b2c3'),'723');assert.throws(()=>prussianCode('a1a2'));assert.match(prussianSVG(['5.100']),/<svg/);
 const fetchBefore=globalThis.fetch;try{globalThis.fetch=async()=>({ok:true,json:async()=>[]});const result=await prussian('a1a5',{direction:'visual'});assert.match(result.output,/合法姿态/);assert.match(result.svg,/5[.]100/);}finally{globalThis.fetch=fetchBefore;}
 const svg=semaphore('A'.repeat(1000),{direction:'encode',animation:'animated'}).svg;assert.ok(svg.length<1000000);assert.equal((svg.match(/<animate /g)||[]).length,1000);
});
test('byte codecs preserve every byte including zero; known independent vectors',()=>{
 const bytes=Uint8Array.from({length:256},(_,i)=>i);
 for(const codec of BYTE_CODECS.filter(c=>c!=='unary7'))assert.deepEqual(decodeBytes(encodeBytes(bytes,codec),codec),bytes,codec);
 assert.equal(encodeBytes(new TextEncoder().encode('Pineapple'),'bubblebabble'),'xigak-nyryk-humil-bosek-sonax');
 assert.equal(encodeBytes(Uint8Array.of(0,255),'base100'),'🏷📶');
 assert.throws(()=>decodeBytes('010','gray'));assert.throws(()=>decodeBytes('0000','excess3'));
 const ascii=Uint8Array.from({length:128},(_,i)=>i);assert.deepEqual(decodeBytes(encodeBytes(ascii,'unary7'),'unary7'),ascii);assert.throws(()=>encodeBytes(Uint8Array.of(128),'unary7'));
});
test('integer encodings use exact BigInt and preserve signed NegaFibonacci streams',()=>{
 const values=Array.from({length:2000},(_,i)=>String(i-1000)).filter(x=>x!=='0');
 assert.equal(decodeNega(values.map(n=>negaFibonacci(BigInt(n))).join(' ')),values.join(' '));
 assert.equal(negaFibonacci(-1n),'011');assert.equal(negaFibonacci(2n),'0011');
 for(const codec of ['fibonacci','gamma','delta'])assert.equal(integerCode(integerCode('1 2 999999999999999999999',codec,'encode'),codec,'decode'),'1 2 999999999999999999999');
 assert.equal(extendedInteger('1 26 27 702 703','base26','encode'),'A Z AA ZZ AAA');
 assert.equal(extendedInteger('000123','excess3-digits','encode'),'0011 0011 0011 0100 0101 0110');
 assert.equal(extendedInteger('4','shadoks','encode'),'Bu Ga');
 assert.equal(extendedInteger('32','crockford-check','encode'),'10*');
 assert.throws(()=>extendedInteger('10U','crockford-check','decode'));
 for(let base=2;base<=64;base++)assert.equal(radix(radix('-90071992547409931234567890',10,base),base,10),'-90071992547409931234567890');
 assert.equal(radix('+',64,10),'62');assert.equal(radix('FF',16,10),'255');
 assert.equal(extendedInteger('DCODE','base26-zero','decode'),'1415626');assert.equal(extendedInteger('B37','base37','encode'),'15177');
 for(let alphabet=0;alphabet<6;alphabet++){const options={base37Alphabet:alphabet};assert.equal(extendedInteger(extendedInteger('B37 Z','base37','encode',options),'base37','decode',options),'B37 Z');}
 assert.equal(extendedInteger('29','gray-integer','encode',{numberBase:10}),'19');
});
test('all Hamming parity lengths correct each single error; extended code detects double errors',()=>{
 assert.equal(hamming('1100',{direction:'encode'}),'0111100');
 for(let r=2;r<=10;r++){const data='1'.repeat(2**r-1-r),options={parityBits:r,extended:'yes',direction:'encode'};const encoded=hamming(data,options);for(let i=0;i<encoded.length;i++){const bad=encoded.slice(0,i)+(encoded[i]==='1'?'0':'1')+encoded.slice(i+1);assert.equal(hamming(bad,{...options,direction:'decode'}),data);}}
 assert.throws(()=>hamming('11111100',{direction:'decode',extended:'yes'}),/双位/);
 assert.throws(()=>hamming('110',{direction:'encode'}),/完整/);
});
test('color codes retain tolerance, voltage and temperature meanings, not only digit colors',()=>{
 assert.equal(resistor('黄 紫 红 金').ohms,4700);assert.equal(resistor('棕 黑 黑 红 棕 红').temperaturePPM,50);
 assert.equal(encodeComponent('4700',{mode:'resistor',bands:4,tolerancePercent:5}),'黄 紫 红 金');
 assert.deepEqual(capacitor('棕 黑 黄 黑 红'),{pF:100000,nF:100,uF:.1,tolerancePercent:20,minPF:80000,maxPF:120000,volts:250});
 assert.equal(encodeComponent('100000',{mode:'capacitor',bands:5,series:'polyester',tolerancePercent:20,volts:'250'}),'棕 黑 黄 黑 红');
 assert.throws(()=>capacitor('棕 黑 黄 黑 蓝'),/耐压/);
 assert.throws(()=>encodeComponent('4711',{mode:'resistor',bands:4}),/精确/);
});
test('semaphore keeps number/letter state and complete diagrams',()=>{
 const options={direction:'encode',representation:'angle'};const encoded=semaphore('ARG 123 A',options);assert.equal(semaphore(encoded.output,{...options,direction:'decode'}).output,'ARG 123 A');assert.match(encoded.svg,/<svg/);assert.equal(semaphore('A',options).output,'180,225');
});
test('all cable pairs and permutation endpoints round trip',()=>{
 for(let n=1;n<=25;n++)assert.equal(cable(cable(String(n),'encode').split(': ')[1].replace(' / ',' '),'decode'),String(n));
 const letters='A B C D E F G H I J';const last='J I H G F E D C B A';assert.equal(permutation('3628799',letters,'decode'),last);assert.equal(permutation(last,letters,'encode'),'3628799');
});
const fixture={vertices_coords:[[0,0],[1,0],[0,1]],edges_vertices:[[0,1],[1,2],[2,0]],edges_assignment:['B','B','B'],faces_vertices:[[0,1,2]],custom_data:{source:'unchanged'}};
test('FOLD keeps complete source metadata and rejects invalid graph references',()=>{
 const fold=validateFold(fixture);assert.deepEqual(fold.custom_data,fixture.custom_data);assert.deepEqual(fold.edges_foldAngle,[null,null,null]);
 const result=foldSnapshot(fixture,fold,new Float32Array([0,0,0,1,0,0,0,0,1]));assert.deepEqual(result.mist_original,fixture);assert.throws(()=>validateFold({...fixture,faces_vertices:[[0,1,99]]}));
 const multi={...fixture,file_frames:[{frame_inherit:true,frame_parent:0,frame_title:'child'}]};assert.deepEqual(selectFoldFrame(multi,1).vertices_coords,fixture.vertices_coords);assert.equal(selectFoldFrame(multi,1).frame_title,'child');assert.throws(()=>selectFoldFrame({...fixture,file_frames:[{frame_inherit:true,frame_parent:1}]},1));
});
test('QR BCH format damage is corrected or explicitly rejected, never guessed',()=>{
 const {pixs,pixx}=bwip.raw({bcid:'qrcode',text:'BCH',eclevel:'H',fixedeclevel:true})[0],matrix=Array.from({length:pixx},(_,r)=>pixs.slice(r*pixx,(r+1)*pixx));
 const damaged=matrix.map(r=>[...r]);damaged[0][8]=-1;damaged[1][8]^=1;assert.deepEqual(qr(damaged,'recover').matrix,matrix);
 for(let i=0;i<pixx;i++){damaged[i][8]=-1;damaged[8][i]=-1;}assert.throws(()=>qr(damaged,'recover'),/格式信息/);
});
function qr(matrix,mode='inspect',codewords){let output;const scope={console:{log(){},warn(){},error(){}},self:{postMessage:x=>output=x}};const context=vm.createContext(scope);scope.importScripts=(...paths)=>paths.forEach(p=>vm.runInContext(readFileSync(resolve('public/completion',p),'utf8'),context));vm.runInContext(readFileSync('public/completion/qr-worker.js','utf8'),context);scope.self.onmessage({data:{matrix,mode,codewords}});if(output?.error)throw Error(output.error);return JSON.parse(JSON.stringify(output.result));}
test('QR codeword ownership/recovery covers versions 1–40 and all correction levels',()=>{
 for(let version=1;version<=40;version++)for(const eclevel of ['L','M','Q','H']){
  const {pixs,pixx}=bwip.raw({bcid:'qrcode',text:'A',version,eclevel,fixedeclevel:true})[0];
  const matrix=Array.from({length:pixx},(_,r)=>pixs.slice(r*pixx,(r+1)*pixx));
  const {info}=qr(matrix);assert.equal(info.version,version);assert.equal(info.format.ecc,eclevel);
  assert.deepEqual(qr(matrix,'recover').matrix,matrix,`${version}-${eclevel}`);
  const broken=matrix.map(row=>[...row]);for(let i=0;i<8;i++){const [r,c]=info.moduleOrder[i].split('-').map(Number);broken[r][c]=-1;}
  assert.deepEqual(qr(broken,'recover').matrix,matrix,`erasure ${version}-${eclevel}`);
 }
});
