import test from 'node:test';
import assert from 'node:assert/strict';
import {pngImageBytes} from '../public/image-png.js';
const signature = Buffer.from([137,80,78,71,13,10,26,10]);
function chunk(type, length = 0) {const b=Buffer.alloc(12+length);b.writeUInt32BE(length);b.write(type,4);return b;}
function header(width=1,height=1) {const b=chunk('IHDR',13);b.writeUInt32BE(width,8);b.writeUInt32BE(height,12);return b;}
const png = (...chunks) => Buffer.concat([signature,...chunks]);
test('decoder boundary follows chunks to IEND and preserves nonzero-offset views',()=>{
  const text=chunk('tEXt',20);text.write('IEND',12);
  const image=png(header(),text,chunk('IDAT'),chunk('IEND')),tail=Buffer.from('PK\x03\x04tail');
  const source=Buffer.concat([Buffer.from('prefix'),image,tail]).subarray(6);
  const bounded=pngImageBytes(source);assert.deepEqual(bounded,image);
  assert.equal(bounded.buffer,source.buffer);assert.deepEqual(source.subarray(bounded.length),tail);
});
test('truncated headers, payloads, CRC boundaries and missing IEND reject before decoding',()=>{
  const valid=png(header(),chunk('IDAT',4),chunk('IEND'));
  for(let end=0;end<valid.length;end++)assert.throws(()=>pngImageBytes(valid.subarray(0,end)),/PNG/);
  assert.throws(()=>pngImageBytes(png(header(),chunk('IEND',1))),/结束/);
  const huge=chunk('IDAT');huge.writeUInt32BE(0xffffffff);assert.throws(()=>pngImageBytes(png(header(),huge,chunk('IEND'))),/边界/);
});
test('invalid IHDR and pixel limits reject before the upstream decoder allocates pixels',()=>{
  for(const first of [chunk('IDAT'),chunk('IHDR',8)])assert.throws(()=>pngImageBytes(png(first,chunk('IEND'))),/图片头/);
  for(const [w,h] of [[0,1],[1,0],[8000001,1],[0xffffffff,0xffffffff]])assert.throws(()=>pngImageBytes(png(header(w,h),chunk('IEND'))),/尺寸/);
  assert.doesNotThrow(()=>pngImageBytes(png(header(4000,2000),chunk('IEND'))));
});
