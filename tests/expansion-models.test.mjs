import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {elementDecompositions,elementWords} from '../public/expansion/element-core.js';
import {normalizeEndpoints,matchStrokeEndpoints} from '../public/expansion/stroke-core.js';
import {parseScore,staffPitch,scorePCM} from '../public/expansion/score-core.js';
import {dictionaryByPattern,ENGLISH_DATASETS} from '../public/expansion/hunt-data.js';
import {searchChinese,CHINESE_WORD_COUNT} from '../public/vendor/expansion/hunt/chinese-search.js';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const elements=await json('public/vendor/science/elements.json');
test('all 118 elements, exact count, case, nontruncated indexed decomposition',()=>{
 const r=elementDecompositions('BaCoN',elements,{limit:200});assert(r.rows.some(x=>x.numbers.join(',')==='56,27,7'));assert.equal(r.rows.length,Number(r.total));
 assert.equal(elementDecompositions('bacon',elements,{caseSensitive:true}).total,'0');
 const large=elementDecompositions('Sn'.repeat(50),elements);assert(BigInt(large.total)>2n**49n);const last=elementDecompositions('Sn'.repeat(50),elements,{offset:String(BigInt(large.total)-1n),limit:50});assert.equal(last.rows.length,1);assert.equal(last.hasNext,false);assert.equal(last.rows[0].rank,large.total);
 assert.throws(()=>elementDecompositions('ABC',elements.slice(0,117)),/118/);assert.throws(()=>elementDecompositions('<img>',elements));
 const words=elementWords(['bacon','xyz','bacon','Sn'],elements);assert.equal(words.total,2);assert(words.rows.every(x=>x.first&&Number(x.count)>0));
});
test('staff pitch and exact fractional ABC durations, MIDI and PCM timing',()=>{
 const r=parseScore('C4:1 D#4:0.5 R:0.25 Bb3:2 |',{bpm:120,meter:'4/4',clef:'treble'});assert.deepEqual(r.events.map(x=>x.midi),[60,63,null,58]);assert.equal(r.duration,1.875);assert.match(r.abc,/\^D1\/2/);assert.match(r.abc,/z1\/4/);assert.equal(staffPitch(0), 'E4');assert.equal(staffPitch(0,{clef:'bass'}),'G2');
 const pcm=scorePCM(r,8000);assert.equal(pcm.samples.length,15800);assert(pcm.samples.some(x=>Math.abs(x)>.15));assert(pcm.samples.subarray(6000,6800).every(x=>x===0));
 for(const text of ['C4:0.333','C9:1','<script>:1','R:0'])assert.throws(()=>parseScore(text));assert.throws(()=>scorePCM({...r,duration:181}));
});
test('complete Chinese endpoint geometry matcher keeps every same-stroke candidate',async()=>{
 const data=await json('public/vendor/expansion/hunt/stroke-endpoints.json');assert.equal(Object.keys(data).length,9562);
 const [character,encoded]=Object.entries(data).find(([,v])=>v.length===8),points=encoded.flatMap(code=>{const a=Math.floor(code/1000000),b=code%1000000;return[{x:Math.floor(a/1000),y:a%1000},{x:Math.floor(b/1000),y:b%1000}];});
 const r=matchStrokeEndpoints(points,data);assert.equal(r.rows.length,r.total);assert(r.rows.some(x=>x.char===character));const moved=matchStrokeEndpoints(points.map(p=>({x:p.x*3+17,y:p.y*3-55})),data);assert.deepEqual(moved.rows.slice(0,5),r.rows.slice(0,5));assert.throws(()=>normalizeEndpoints([{x:0,y:0}]));assert.throws(()=>normalizeEndpoints([{x:0,y:0},{x:0,y:0}]));
});
test('six upstream English corpora and all Chinese data are retained',async()=>{
 const source=await readFile('public/vendor/expansion/hunt/one-word.js','utf8');assert.match(source,/from "\.\.\/\.\.\/hunt\/cipher-machine\/common\/Trie\.js"/);assert(!/\beval\(|new Function/.test(source),'Player queries never execute as host code');
 const expected={standard:214093,large:214092,raw:198619,alternate:181882,twl06:178693,idioms:8263};assert.equal(ENGLISH_DATASETS.length,6);
 for(const {id}of ENGLISH_DATASETS){const rows=await json('public/vendor/expansion/hunt/english-'+id+'.json');assert.equal(rows.length,expected[id]);assert(rows.every(x=>typeof x.word==='string'&&Number.isInteger(x.flags)));}
 assert.equal((await json('public/vendor/expansion/hunt/chinese-idioms.json')).length,28240);assert(CHINESE_WORD_COUNT>100000);assert(searchChinese('一心一意').includes('一心一意'));assert.throws(()=>searchChinese('{h4'),/花括号/);
 const dict=dictionaryByPattern([{word:'test',flags:1},{word:'loop',flags:2},{word:'rare',flags:16}],{filter:1});assert.deepEqual(Object.values(dict).flat(),['test']);
});
