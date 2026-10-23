import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {decodeAnimation,metadata,framePixels,encodePNG,spriteSheet,sliceSheet,exportAll} from '../public/animation/core.js';
import {unzipSync} from '../public/vendor/round2/fflate.js';
import {gif,png,chunk} from './fixtures/animation.mjs';
test('GIF: all 35 frames, exact zero delay, loops and complete reversible exports',()=>{
 const bytes=gif(),m=decodeAnimation(bytes);assert.equal(m.frames.length,35);assert.equal(m.frames[0].delayMs,0);assert.equal(m.loops,0);
 const zip=unzipSync(exportAll(m));assert.equal(Object.keys(zip).filter(x=>x.startsWith('composited/')).length,35);assert.equal(Object.keys(zip).filter(x=>x.startsWith('raw/')).length,35);assert.equal(Object.keys(zip).filter(x=>x.startsWith('indices/')).length,35);
 assert.deepEqual(zip['original.bin'],new Uint8Array(bytes));assert.equal(JSON.parse(new TextDecoder().decode(zip['metadata.json'])).frames.length,35);
 const roundtrip=decodeAnimation(zip['composited/0035.png']);assert.deepEqual(roundtrip.outputs[0],m.outputs[34]);
});
test('GIF: background disposal, restore previous, transparent overlays and raw rectangles',()=>{
 const m=decodeAnimation(gif({frames:[{pixels:[0,0]},{pixels:[1],x:1,dispose:3},{pixels:[2],dispose:2},{pixels:[3],transparent:3}]}));
 assert.deepEqual([...m.outputs[1]],[255,0,0,255,0,0,255,255]);
 assert.deepEqual([...m.outputs[2]],[0,255,0,255,255,0,0,255]);
 assert.deepEqual([...m.outputs[3]],[255,0,0,255,255,0,0,255]);
 assert.equal(framePixels(m,1,'raw').width,1);assert.deepEqual([...framePixels(m,1,'difference').pixels].slice(0,4),[0,0,0,0]);
});
test('APNG: SOURCE/OVER, transparent background disposal and exact rational timing',()=>{
 const m=decodeAnimation(png({plays:3,frames:[{}, {x:1,width:1,rows:[0,0,0,255,128],blend:1,dispose:1,num:1,den:3},{width:1,rows:[0,0,255,0,255]}]}));
 assert.equal(m.frames[1].delayMs,1000/3);assert.equal(m.loops,3);assert.deepEqual([...m.outputs[1]],[255,0,0,255,127,0,128,255]);assert.deepEqual([...m.outputs[2]],[0,255,0,255,0,0,0,0]);
});
test('GIF control extensions remain associated across comments',()=>{
 const g=gif({frames:[{pixels:[0,0]},{pixels:[1,0],transparent:0,delay:7}]}),second=g.indexOf(Buffer.from([0x21,0xf9]),g.indexOf(Buffer.from([0x21,0xf9]))+1)+8;
 const bytes=Buffer.concat([g.subarray(0,second),Buffer.from([0x21,0xfe,1,65,0]),g.subarray(second)]);
 const m=decodeAnimation(bytes);assert.equal(m.frames[1].delayMs,70);assert.deepEqual([...m.outputs[1]],[0,0,255,255,255,0,0,255]);
});
test('APNG: excluded default image, partial first frame and first PREVIOUS',()=>{
 const m=decodeAnimation(png({poster:true,frames:[{x:1,width:1,rows:[0,0,0,255,255],dispose:2,den:0},{width:1,rows:[0,0,255,0,255]}]}));
 assert.equal(m.frames.length,2);assert.ok(m.poster);assert.deepEqual([...m.outputs[0]],[0,0,0,0,0,0,255,255]);assert.deepEqual([...m.outputs[1]],[0,255,0,255,0,0,0,0]);assert.equal(m.frames[0].delayMs,100);
 assert.ok(unzipSync(exportAll(m))['default-image.png']);
});
test('16-bit raw PNG remains 16-bit; low-bit grayscale preserves per-row padding',()=>{
 const original=png({width:1,depth:16,rows:[0,0x12,0x34,0x56,0x78,0x9a,0xbc,0xff,0xff]});
 const m=decodeAnimation(original),raw=unzipSync(exportAll(m))['raw/0001.png'];assert.equal(raw[24],16);assert.deepEqual(decodeAnimation(raw).outputs[0],m.outputs[0]);
 const gray=decodeAnimation(png({width:1,height:2,depth:1,color:0,rows:[0,128,0,0]}));assert.deepEqual([...gray.outputs[0]],[255,255,255,255,0,0,0,255]);
});
test('sprite round trip retains every original pixel; invalid grid rejects leftovers',()=>{
 const m=decodeAnimation(gif({count:4})),s=spriteSheet(m,2),sheet=decodeAnimation(encodePNG(s.pixels,s.width,s.height)),sliced=sliceSheet(sheet,{width:2,height:1});
 assert.equal(sliced.frames.length,4);for(let i=0;i<4;i++)assert.deepEqual(sliced.outputs[i],m.outputs[i]);assert.throws(()=>sliceSheet(sheet,{width:3,height:1}),/完整覆盖/);assert.throws(()=>spriteSheet(m,0),/列数/);
});
test('container integrity, invalid LZW, CRC, bomb and frame-budget failures never return truncated success',()=>{
 const g=gif();assert.throws(()=>decodeAnimation(g.subarray(0,-2)),/完整/);
 const broken=gif();broken[broken.indexOf(0x2c)+12]=255;assert.throws(()=>decodeAnimation(broken),/LZW/);
 const bad=png();bad[40]^=1;assert.throws(()=>decodeAnimation(bad),/CRC/);
 assert.throws(()=>decodeAnimation(png({width:1,height:1,rows:new Array(20000).fill(0)})),/超过声明/);
 assert.throws(()=>decodeAnimation(png({width:50000,height:50000})),/画布/);
 assert.throws(()=>decodeAnimation(gif({count:4097})),/4096/);
 assert.throws(()=>sliceSheet({width:5000,height:5000},{width:1,height:1}),/4096/);
 const many=png({frames:Array.from({length:4096},()=>({}))}),profile=chunk('iCCP',Buffer.alloc(65536));
 assert.throws(()=>decodeAnimation(Buffer.concat([many.subarray(0,33),profile,many.subarray(33)])),/颜色配置需要超过/);
});
test('full fixed upstream GIFs decode without a first-30-frame cap',async()=>{
 const bytes=await readFile('upstream/animation/packages/gifuct-js/demo/dog.gif');
 const m=decodeAnimation(bytes);assert.ok(m.frames.length>0);assert.equal(metadata(m).frames.length,m.outputs.length);
});
test('PNG profile bytes survive raw exports without decompressing an untrusted ICC profile',()=>{
 const original=png(),profile=chunk('iCCP',[112,0,0,255,255,255]),gamma=chunk('gAMA',[0,0,177,143]);
 const source=Buffer.concat([original.subarray(0,33),profile,gamma,original.subarray(33)]);
 const model=decodeAnimation(source),raw=unzipSync(exportAll(model))['raw/0001.png'];
 assert.ok(Buffer.from(raw).includes(profile));assert.ok(Buffer.from(raw).includes(gamma));
 assert.deepEqual(model.outputs[0],decodeAnimation(original).outputs[0]);
 assert.deepEqual(metadata(model).colorChunks,[{type:'iCCP',bytes:6},{type:'gAMA',bytes:4}]);
});
