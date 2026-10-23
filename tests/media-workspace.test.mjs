import test from 'node:test';
import assert from 'node:assert/strict';
import {audioClip} from '../public/media-workspace/audio-model.js';
import {coordinate} from '../public/round2/coordinates-engine.js';

test('度分坐标保留南纬和负零度方向，不把 S 吞作秒标记',()=>{
 for(const text of ['39°54′S','39°54′0″S','39D54MS','39.9S'])assert.equal(coordinate(text,true),-39.9,text);
 assert.equal(coordinate('-0°30′',true),-.5);
 assert.equal(coordinate('-0°0′30″',false),-1/120);
 assert.equal(coordinate('0°30′S',true),-.5);
 assert.equal(coordinate('39°54′N',true),39.9);
 assert.equal(coordinate('39D54M0SN',true),39.9,'explicit ASCII second marker before the hemisphere remains supported');
 assert.equal(coordinate('116°24′E',false),116.4);
 for(const value of ['-0°30′N','91S','39°60′S','39°30′E'])assert.throws(()=>coordinate(value,true));
});

test('音频裁剪按预览时间轴取样，倒放区间不误取原音频同一位置',()=>{
 const original=Float32Array.from([0,1,2,3,4,5,6,7,8,9]);
 assert.deepEqual([...audioClip([original],2,1,3)[0]],[2,3,4,5]);
 assert.deepEqual([...audioClip([original],2,1,3,true)[0]],[7,6,5,4]);
 const result=audioClip([original,Float32Array.from(original,x=>x+10)],2,0,1,true);
 assert.deepEqual(result.map(a=>[...a]),[[9,8],[19,18]]);
 assert.deepEqual([...original],[0,1,2,3,4,5,6,7,8,9]);
 for(const [start,end] of [[0,0],[-1,1],[0,6],[0,.001]])assert.throws(()=>audioClip([original],2,start,end));
});
