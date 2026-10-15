import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {convert,squareModel,parseWords,formatWords,tapeSVG,CATEGORIES} from '../public/basics/core.js';
import {foundationRecipe,foundationInput,ASCII_TABLE,characterRows} from '../public/basics/foundation.js';
import {matchesTool} from '../public/tool-search.js';
import {searchScore,classifyCatalogue} from '../public/chef-tools/catalog.js';
import {INVERSES,inverseArgs} from '../public/chef-tools/inverse.js';
import {schemas,defaults} from '../public/chef-tools/schema.js';
const catalogue=JSON.parse(await readFile(new URL('../public/vendor/cyberchef/catalogue.json',import.meta.url),'utf8'));

test('Roman: entire supported range, canonical invalids, Unicode and bounds',async()=>{
  const all=Array.from({length:3999},(_,i)=>i+1).join('\n');const encoded=await convert('roman',all,{direction:'encode'});
  assert.equal((await convert('roman',encoded.output,{direction:'decode'})).output,all);
  assert.equal((await convert('roman','Ⅳ Ⅻ mcmxcix',{direction:'decode'})).output,'4\n12\n1999');
  for(const text of ['0','-1','1.5','4000','999999999'])await assert.rejects(convert('roman',text,{direction:'encode'}));
  for(const text of ['IIV','VX','MMMM','ABC'])await assert.rejects(convert('roman',text,{direction:'decode'}));
});
test('Tap and coordinate square: all cells, first one-tap regression, words and keyed 6x6',async()=>{
  for(const opts of [{mode:'tap',size:'5'},{mode:'polybius',size:'5'},{mode:'polybius',size:'6',keyword:'SECRET123'}]){
    const model=squareModel(opts),input=model.alphabet+' '+model.alphabet;
    const encoded=await convert('tapcode',input,{...opts,direction:'encode'});
    assert.equal((await convert('tapcode',encoded.output,{...opts,direction:'decode'})).output,input);
  }
  assert.equal((await convert('tapcode','. .',{mode:'tap',direction:'decode'})).output,'A');
  assert.equal((await convert('tapcode','CK',{mode:'tap',direction:'encode'})).output,'. ...  . ...');
  assert.equal((await convert('tapcode','IJ',{mode:'polybius',direction:'encode'})).output,'24 24');
  for(const text of ['.','...... .','. . .','x .'])await assert.rejects(convert('tapcode',text,{mode:'tap',direction:'decode'}));
  for(const text of ['1','66','1x','11 / / 22'])await assert.rejects(convert('tapcode',text,{mode:'polybius',size:'5',direction:'decode'}));
  await assert.rejects(convert('tapcode','中文',{mode:'polybius',direction:'encode'}));
  for(const input of ['ß','ſ','é'])await assert.rejects(convert('tapcode',input,{mode:'polybius',direction:'encode'}),'non-ASCII case expansion must not silently encode');
  assert.throws(()=>squareModel({keyword:'ß'}));assert.throws(()=>squareModel({keyword:'a'.repeat(65)}));
  // Exercises the actual upstream indexed loop with a realistically large
  // message; compatibility access must not rebuild the full string per mark.
  const long='ARG'.repeat(2000),encoded=await convert('tapcode',long,{mode:'tap',direction:'encode'});
  assert.equal((await convert('tapcode',encoded.output,{mode:'tap',direction:'decode'})).output,long);
});
test('Baudot: actual letter/figure shifts, variants, five-bit validation and full SVG',async()=>{
  for(const alphabet of ['ITA1','ITA2','US_TTY'])for(const format of ['binary','decimal','hex']){
    const enc=await convert('baudot','Hello 123\nTEST',{direction:'encode',alphabet,format});
    assert.equal((await convert('baudot',enc.output,{direction:'decode',alphabet,format})).output,'HELLO 123\nTEST');
    assert.deepEqual(parseWords(formatWords(enc.words,format),format),enc.words);
  }
  assert.deepEqual((await convert('baudot','A1A',{direction:'encode',alphabet:'ITA2',format:'decimal'})).words,[3,27,23,31,3]);
  for(const [text,format] of [['0000','binary'],['100000','binary'],['32','decimal'],['-1','decimal'],['20','hex'],['x','hex']])assert.throws(()=>parseWords(text,format));
  await assert.rejects(convert('baudot','中文😀',{direction:'encode'}));
  const svg=tapeSVG(Array.from({length:70},(_,i)=>i%32));assert.equal((svg.match(/<circle /g)||[]).length,420);assert.match(svg,/height="296"/);
});
test('Invisible: UTF-16/scalar positions, explicit cleaning, emoji and joiners protected',async()=>{
  const input='😀A\u200BB\u00A0\u202E👩‍💻❤️';
  const result=await convert('invisible',input,{action:'inspect',preserve:true});
  assert.equal(result.total,5);assert.equal(result.findings[0].index,3);assert.equal(result.findings[0].position,2);
  const cleaned=await convert('invisible',input,{action:'clean',preserve:true,categories:Object.keys(CATEGORIES)});
  assert.equal(cleaned.output,'😀AB 👩‍💻❤️');assert.ok(cleaned.findings.find(f=>f.cp===0x200D).preserved);
  const forced=await convert('invisible',input,{action:'clean',preserve:false,categories:Object.keys(CATEGORIES)});assert.equal(forced.output,'😀AB 👩💻❤');
  assert.equal((await convert('invisible','A\u200BB',{action:'clean',preserve:false,categories:[]})).output,'A\u200BB');
  assert.equal((await convert('invisible',' \t\r\n',{action:'inspect'})).total,0);
  await assert.rejects(convert('invisible','x'.repeat(65537),{action:'inspect'}));
  const segmenter=Intl.Segmenter;try{Intl.Segmenter=undefined;const tags='🏴\u{E0067}\u{E0062}\u{E007F}';assert.equal((await convert('invisible',tags,{action:'clean',preserve:true,categories:Object.keys(CATEGORIES)})).output,tags);}finally{Intl.Segmenter=segmenter;}
});
test('Foundation preserves separation of codepoints, UTF8 bytes and numeral bases',()=>{
  assert.deepEqual(foundationRecipe(catalogue,'65',{family:'radix',direction:'encode',base:'10',target:'16'}),[{op:'From Base',args:[10]},{op:'To Base',args:[16]}]);
  assert.deepEqual(foundationRecipe(catalogue,'A',{family:'ascii',direction:'encode',base:'10'}),[{op:'To Charcode',args:['Space',10]}]);
  assert.throws(()=>foundationRecipe(catalogue,'中',{family:'ascii',direction:'encode'}));
  assert.throws(()=>foundationRecipe(catalogue,'128',{family:'ascii',direction:'decode',base:'10'}));
  assert.throws(()=>foundationRecipe(catalogue,'D800',{family:'characters',direction:'decode',base:'16',format:'codepoint'}));
  assert.throws(()=>foundationRecipe(catalogue,'256',{family:'characters',direction:'decode',format:'decimal'}));
  assert.equal(foundationInput(' 65\t\n  66 ',{family:'ascii',direction:'decode'}),'65 66');
  assert.equal(foundationInput(' \t\n ',{family:'ascii',direction:'encode'}),' \t\n ','literal text is preserved');
  assert.equal(foundationInput(' \\x41\t ',{family:'escapes',direction:'decode'}),' \\x41\t ');
  assert.throws(()=>foundationRecipe(catalogue,' \t\n ',{family:'ascii',direction:'decode'}));
  assert.equal(ASCII_TABLE.length,128);assert.equal(ASCII_TABLE[127].label,'DEL');assert.deepEqual(characterRows('😀'),[[0,'😀','U+1F600','F0 9F 98 80']]);
});
test('Shared search and inverse metadata are discoverable and preserve matched schemas',()=>{
  for(const term of ['ASCII','ASCII转换','ascii 转换','ＡＳＣＩＩ转换','文字转数字','数字转文字','字母转数字','数字转字母','进制转换','码点']){assert.ok(matchesTool({route:'basics',title:'基础转换'},term),term);assert.ok(classifyCatalogue(catalogue).some(e=>searchScore(e,term,e.op)>0),term);}
  for(const [route,term] of [['invisible','零宽'],['tapcode','敲击码'],['baudot','打孔纸带'],['roman','Roman']])assert.ok(matchesTool({route,title:''},term));
  assert.equal(INVERSES['To Charcode'],'From Charcode');assert.equal(INVERSES['SHA256'],undefined);
  assert.deepEqual(inverseArgs(catalogue.operations['To Charcode'],catalogue.operations['From Charcode'],['Comma',2],schemas,defaults),['Comma',2]);
  const source=catalogue.operations['To Base64'],target=catalogue.operations['From Base64'],args=defaults(source);args[0]='ZYXWVUTSRQPONMLKJIHGFEDCBAabcdefghijklmnopqrstuvwxyz0123456789+/=';
  assert.equal(inverseArgs(source,target,args,schemas,defaults)[0],args[0],'editable alphabets preserve custom values');
});
