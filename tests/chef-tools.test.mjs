import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {classifyCatalogue,GROUPS,searchScore} from '../public/chef-tools/catalog.js';
import {defaults,schemas} from '../public/chef-tools/schema.js';
import {checkImageSize} from '../public/chef-tools/limits.js';
import {fileKind} from '../public/chef-tools/result-view.js';
import {createRegistry,CHEF_OPERATION_PAIRS} from '../public/capabilities/registry.js';
import {operationFamilies,matchFamilies} from '../public/chef-tools/families.js';
import {INVERSES} from '../public/chef-tools/inverse.js';
const catalogue=JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json',import.meta.url),'utf8'));
test('every pinned operation has a destination and preserved upstream arguments',()=>{
 const entries=classifyCatalogue(catalogue);assert.equal(entries.length,505);assert.equal(new Set(entries.map(e=>e.op)).size,505);
 for(const e of entries){assert.ok(GROUPS[e.group]);assert.equal(e.panel,GROUPS[e.group].panel);const d=catalogue.operations[e.op],values=defaults(d);assert.equal(values.length,schemas(d).length);for(const [i,a]of schemas(d).entries()){if(a.type==='number')assert.ok(Number.isFinite(values[i]),e.op+' '+a.name);}}
 const entry=op=>entries.find(e=>e.op===op);assert.equal(entry('Resize Image').panel,'image');assert.equal(entry('JSON Beautify').panel,'datalab');assert.equal(entry('MD5').panel,'file');assert.equal(entry('Extract Audio Metadata').panel,'audio');assert.equal(entry('Fork').mode,'chain');assert.equal(entry('Optical Character Recognition').mode,'retained');assert.equal(entry('Remove EXIF').mode,'task');
 assert.ok(searchScore(entry('Resize Image'),'图片缩放','调整图片尺寸')>0);assert.ok(searchScore(entry('Unique'),'去重','去重')>searchScore(entry('Sort'),'去重','排序'));
 assert.deepEqual(defaults(catalogue.operations['Resize Image']),[100,100,'Pixels',false,'Bilinear']);assert.deepEqual(defaults(catalogue.operations['AES Encrypt'])[0],{option:'Hex',string:''});
});
test('image allocations and generated output formats retain actual binary semantics',()=>{
 assert.doesNotThrow(()=>checkImageSize('Resize Image',[50,50,'Percent'],100,[1000,1000]));assert.throws(()=>checkImageSize('Resize Image',[500,500,'Percent'],100,[2000,2000]));assert.throws(()=>checkImageSize('Generate Image',['Bits',64,2048],100000));assert.throws(()=>checkImageSize('Crop Image',[8,8,10,10,false],100,[16,16]));assert.throws(()=>checkImageSize('Rotate Image',[45],100,[4000,2000]));
 assert.equal(fileKind(Uint8Array.from([137,80,78,71])).ext,'png');assert.equal(fileKind(Uint8Array.from([31,139])).ext,'gz');assert.equal(fileKind(new TextEncoder().encode('%PDF-1.4')).ext,'pdf');assert.equal(fileKind(new TextEncoder().encode('<svg></svg>'),'Generate QR Code',['SVG']).image,true);
});

test('five capability categories distinguish tool operations, fixed references and explanatory knowledge',async()=>{
 const {toolGroups}=await import('../public/navigation.js');
 assert.deepEqual(toolGroups.map(g=>g.name),['编解码与加解密','资料查询','图片音视频与文件处理','其他工具','科普']);
 assert.deepEqual(toolGroups.map(g=>g.sections.length),[9,10,6,9,4]);
 assert.deepEqual(toolGroups[4].sections.map(section=>section.id),toolGroups.slice(0,4).map(group=>'learn-'+group.id));
 assert.deepEqual(toolGroups[4].sections.map(section=>section.name),toolGroups.slice(0,4).map(group=>group.name+'知识'));
 assert.deepEqual(toolGroups[1].sections.find(section=>section.id==='technical').items,[['it-reference','IT 固定资料']]);
 const sections=toolGroups[0].sections;
 for(const name of ['字符与数字','通用与传输编码','符号与通信编码','古典密码与密码机','现代加密','签名、口令与密钥','密文识别与分析','文字、语言与提取','数据格式与排版'])assert.ok(sections.some(s=>s.name===name),name+' is directly represented');
 const entries=classifyCatalogue(catalogue),entry=op=>entries.find(e=>e.op===op);
 for(const [op,group]of Object.entries({'ROT13':'classical','Vigenère Decode':'classical','Enigma':'machines','AES Decrypt':'symmetric','RSA Encrypt':'publickey','ECDSA Verify':'signatures','Bcrypt':'derivation','JWT Verify':'credentials','From Base64':'base','From Hex':'radix','URL Decode':'webencoding','Decode text':'charset','To Morse Code':'symbolic','From COBS':'binaryencoding'}))assert.equal(entry(op).group,group,op);
 assert.equal(entries.filter(e=>e.mode==='task').length,489);assert.equal(entries.filter(e=>e.mode==='chain').length,10);
 for(const e of entries.filter(e=>['task','existing'].includes(e.mode)))assert.ok(toolGroups.some(g=>g.items.some(i=>i[0]===e.panel+'/'+e.group||i[0]===e.panel)),e.op);
 assert.ok(toolGroups[3].items.some(i=>i[0]==='cyberchef'));assert.ok(!toolGroups[0].items.some(i=>i[0]==='cyberchef'));
 const unknown=structuredClone(catalogue);unknown.operations['Unclassified future operation']={args:[]};assert.throws(()=>classifyCatalogue(unknown),/尚未分类/);
});

test('Chef discovery families preserve every real direction with one canonical owner',()=>{
 const rows=classifyCatalogue(catalogue),registry=createRegistry(catalogue),families=operationFamilies(rows,registry);
 assert.equal(new Set(families.map(family=>family.id)).size,families.length);
 assert.deepEqual(families.flatMap(family=>family.rows.map(row=>row.op)).sort(),Object.keys(catalogue.operations).sort());
 for(const [first,second]of CHEF_OPERATION_PAIRS){
  if(!catalogue.operations[first]||!catalogue.operations[second])continue;
  const family=families.find(item=>item.rows.some(row=>row.op===first));
  assert.equal(family.id,registry.byOperation.get(second).id,`${first} and ${second} discover one family`);
  assert.ok(family.directions.some(direction=>direction.op===first));assert.ok(family.directions.some(direction=>direction.op===second));
  assert.equal(INVERSES[first],second);assert.equal(INVERSES[second],first);
 }
 const hash=families.find(family=>family.rows.some(row=>row.op==='SHA2'));
 assert.equal(hash.directions.length,1);assert.equal(INVERSES.SHA2,undefined);
 assert.notEqual(registry.byOperation.get('ECDSA Sign').id,registry.byOperation.get('ECDSA Verify').id);
});

test('raw operation search reaches one family while selecting the requested actual direction',()=>{
 const families=operationFamilies(classifyCatalogue(catalogue),createRegistry(catalogue));
 for(const op of ['To Base64','From Base64','AES Encrypt','AES Decrypt','From Case Insensitive Regex']){
  const matches=matchFamilies(families,op),first=matches[0];
  assert.ok(first,op);assert.equal(first.op,op);assert.equal(matches.filter(family=>family.id===first.id).length,1);
  assert.equal(first.directions.length,2);
 }
 const both=matchFamilies(families,'Base64').filter(family=>family.rows.some(row=>['To Base64','From Base64'].includes(row.op)));
 assert.equal(both.length,1);
 assert.throws(()=>operationFamilies(classifyCatalogue(catalogue),{byOperation:new Map()}),/缺少统一登记/);
});

test('family defaults follow declared directions instead of alphabetically choosing decrypt',()=>{
 const registry=createRegistry(catalogue),rows=classifyCatalogue(catalogue),families=operationFamilies(rows,registry);
 for(const family of families.filter(item=>item.directions.length>1)){
  const first=family.directions[0].op,second=family.directions[1].op;
  assert.equal(matchFamilies([family],'')[0].op,first,family.id);
  assert.equal(matchFamilies([family],'',{preferred:second})[0].op,second,'an explicit preferred direction remains selected');
  assert.equal(matchFamilies([family],second)[0].op,second,'a specific raw decode/decrypt search takes priority');
 }
 const nativeOwned=registry.entries.find(entry=>entry.id.startsWith('native:')&&entry.sourceOperationIds.length>1);
 assert.ok(nativeOwned);
 const row=rows.find(item=>item.op===nativeOwned.sourceOperationIds[1]);
 const local=operationFamilies([row],registry);
 assert.equal(local.length,1);assert.equal(matchFamilies(local,'')[0].op,row.op,'a partial native palette only offers its actual local operation');
 assert.deepEqual(local[0].directions.map(direction=>direction.op),[row.op]);
});
