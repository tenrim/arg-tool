import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {decompose,remapColours,stegPlane,stegExtract} from '../public/image-projects.js';
import {operationName,parameterName,optionName,categories,operationDescription} from '../public/cyberchef-i18n.js';
test('AperiSolve and StegOnline preserve their opposite plane conventions',()=>{
 const pixel=Uint8ClampedArray.of(129,64,33,0);
 assert.deepEqual([...decompose(pixel,'rgb',0)],[255,0,255,255]);
 assert.deepEqual([...stegPlane(pixel,1,1,'r',0)],[0,0,0,255]);
 const map=Uint8Array.from({length:256},(_,i)=>255-i);
 assert.deepEqual([...remapColours(pixel,map)],[126,191,222,0]);
 assert.deepEqual([...pixel],[129,64,33,0]);
});
test('Upstream StegOnline extracts known row/column, multi-plane and bit-order vectors',async()=>{
 const pixels=new Uint8ClampedArray(32);[... '01000001'].forEach((b,i)=>pixels[i*4]=+b);
 const selected={r:[0],g:[],b:[],a:[]};
 assert.deepEqual([...await stegExtract(pixels,2,4,selected,'Row','MSB','rgba')],[65]);
 assert.deepEqual([...await stegExtract(pixels,2,4,selected,'Column','MSB','rgba')],[9]);
 pixels.fill(2);selected.r=[0,1];
 assert.deepEqual([...await stegExtract(pixels,2,4,selected,'Row','MSB','rgba')],[170,170]);
 assert.deepEqual([...await stegExtract(pixels,2,4,selected,'Row','LSB','rgba')],[85,85]);
 assert.deepEqual([...await stegExtract(pixels,2,4,selected,'Row','LSB','rgba',false,1)],[85]);
 assert.equal((await stegExtract(pixels,2,4,selected,'Row','MSB','rgba',false,100)).length,0);
 await assert.rejects(stegExtract(pixels,2,4,selected,'Row','MSB','rgba',false,-1),/起始字节/);
 assert.equal((await stegExtract(pixels.slice(0,12),3,1,{...selected,r:[0]},'Row','MSB','rgba')).length,0);
 await assert.rejects(stegExtract(pixels,2,4,{...selected,r:[]},'Row','MSB','rgba'),/至少选择/);
});
test('Chinese presentation covers the pinned operation and parameter catalogue without altering identifiers',async()=>{
 const catalogue=JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json',import.meta.url),'utf8'));
 for(const [name,definition]of Object.entries(catalogue.operations)){
  assert.match(operationName(name),/[\u3400-\u9fff]/,name);
  assert.match(operationDescription(name,definition),/[\u3400-\u9fff]/);
  for(const arg of definition.args)assert.match(parameterName(arg.name),/[\u3400-\u9fff]/,arg.name);
 }
 for(const category of catalogue.categories)assert.ok(categories[category.name]);
 assert.equal(optionName('Dynamic Huffman Coding'),'动态哈夫曼编码');
 assert.equal(optionName('CBC/NoPadding'),'CBC / 无填充');
 assert.equal(catalogue.operations['AES Decrypt'].args[3].value[0].name,'CBC');
});
