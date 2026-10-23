import test from 'node:test';import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {queryRecords,REFERENCE_DATASETS} from '../public/reference/core.js';
import {REFERENCE_TOOLS} from '../public/reference/catalog.js';
const data=async id=>JSON.parse(await readFile(new URL('../public/vendor/reference/'+id+'.json',import.meta.url)));
const countries=await data('countries');
test('reference: real country/flag metadata and airport/location code matching',async()=>{
 const c=queryRecords('countries',{query:'中国'},countries).items.find(r=>r.id==='CN');assert.ok(c);assert.equal(c.flag,'cn');
 const airports=await data('airports');assert.ok(airports.length>86000);assert.equal(queryRecords('airports',{query:'PEK',region:'CN'},airports,countries).items[0].id,'ZBAA');
 const ports=await data('ports');assert.ok(ports.length>116000);const port=queryRecords('ports',{query:'CNSGH',filter:'1'},ports,countries).items[0];assert.equal(port.id,'CNSGH');assert.match(JSON.stringify(port),/港口/);
 assert.equal(queryRecords('countries',{query:'no-such-country-xyz'},countries).total,0);
});
test('reference: Unicode astral characters, control aliases, spaces and invalid code points',async()=>{
 const d=await data('unicode');let r=queryRecords('unicode',{query:'A中😀'},d);assert.equal(r.total,3);assert.equal(r.items[2].id,'1F600');assert.match(JSON.stringify(r),/CJK UNIFIED IDEOGRAPH-4E2D/);
 assert.match(JSON.stringify(queryRecords('unicode',{query:'U+000A'},d)),/LINE FEED/);assert.equal(queryRecords('unicode',{query:' '},d).items[0].id,'0020');
 assert.throws(()=>queryRecords('unicode',{query:'U+110000'},d),/范围/);assert.throws(()=>queryRecords('unicode',{query:'U+ZZ'},d),/格式/);
 assert.match(JSON.stringify(queryRecords('unicode',{query:'U+AC00'},d)),/HANGUL SYLLABLE GA/);
});
test('reference: all hexagrams uniquely match bottom-to-top bits; all tarot names translated',async()=>{
 const d=await data('iching');assert.equal(d.trigrams.length,8);assert.equal(d.hexagrams.length,64);
 for(const h of d.hexagrams){const r=queryRecords('iching',{bits:h.lines.join('')},d);assert.equal(r.total,1);assert.equal(r.items[0].id,String(h.number));}
 assert.equal(queryRecords('iching',{bits:'100010'},d).items[0].id,'3');
 const t=await data('tarot');assert.equal(t.length,78);assert.equal(new Set(t.map(c=>c.name)).size,78);assert.ok(t.every(c=>/[\p{Script=Han}]/u.test(c.name)));assert.equal(queryRecords('tarot',{query:'力量'},t).items[0].fields.find(f=>f[0]==='牌面编号')[1],'11');
});
test('reference: perceptual colors and official Jurassic period numerical boundaries',async()=>{
 const colors=await data('colors');assert.ok(colors.length>31000);const r=queryRecords('colors',{query:'#ff0000'},colors).items[0];assert.equal(r.swatch.toLowerCase(),'#ff0000');assert.equal(r.fields.at(-1)[1],'0.000');
 const g=await data('geology'),jurassic=g.find(r=>r.id==='Jurassic');assert.equal(jurassic.start,201.4);assert.equal(jurassic.end,143.1);
 assert.ok(queryRecords('geology',{query:'150',mode:'age'},g).items.some(r=>r.id==='Jurassic'));assert.ok(queryRecords('geology',{query:'侏罗纪'},g).items.some(r=>r.id==='Jurassic'));assert.throws(()=>queryRecords('geology',{query:'-1',mode:'age'},g));
});
test('reference: retired sequence and crystal samples are absent and cannot be queried',async()=>{
 for(const kind of ['integerseq','crystals','crystal-model']){
  assert.equal(REFERENCE_TOOLS.some(tool=>tool.id===kind),false);
  assert.equal(REFERENCE_DATASETS.includes(kind),false);
  assert.throws(()=>queryRecords(kind,{query:''},[]),/未知资料库/);
 }
 assert.deepEqual(REFERENCE_TOOLS.filter(tool=>REFERENCE_DATASETS.includes(tool.id)).map(tool=>tool.id),REFERENCE_DATASETS);
 const files=await readdir(new URL('../public/vendor/reference/',import.meta.url));
 for(const file of ['integerseq.json','crystals.json','crystals','cod-NOTICE.txt','oeis-LICENSE.txt'])assert.ok(!files.includes(file),'retired runtime file: '+file);
 const meta=await data('META');
 assert.equal(Object.hasOwn(meta.counts,'integerseq'),false);
 assert.equal(Object.hasOwn(meta.counts,'crystals'),false);
});

test('reference visual: map projection, source geometries and transport coordinates',async()=>{
 const {projectPoint,parsePortCoordinate}=await import('../public/reference/visual-core.js');
 assert.deepEqual(projectPoint(0,0),[500,250]);assert.deepEqual(projectPoint(-180,90),[0,0]);assert.equal(projectPoint(181,0),null);
 assert.deepEqual(parsePortCoordinate('3114N 12129E'),[121+29/60,31+14/60]);assert.deepEqual(parsePortCoordinate('3355S 01825E'),[18+25/60,-(33+55/60)]);assert.equal(parsePortCoordinate('3199N 12129E'),null);assert.equal(parsePortCoordinate(''),null);
 const world=await data('world');assert.equal(world.length,177);for(const code of ['CN','FR','US','AU','ZA'])assert.ok(world.some(r=>r.id===code));assert.ok(world.every(r=>r.path.startsWith('M')&&!/NaN|Infinity/.test(r.path)));
 const a=queryRecords('airports',{query:'PEK'},await data('airports'),countries).items[0];assert.ok(a.point[0]>116&&a.point[1]>39);assert.equal(a.country,'CN');
 const p=queryRecords('ports',{query:'CNSGH'},await data('ports'),countries).items[0];assert.ok(p.point[0]>120&&p.point[1]>30);
});
test('reference map adapter: ambiguous postal codes never select an unrelated country',async()=>{
 const generated=await data('world');
 assert.equal(generated.filter(feature=>feature.id==='CN').length,1);
 assert.ok(generated.some(feature=>feature.id==='ne:CYN'));
 const source=JSON.parse(await readFile(new URL('../upstream/reference/sources/world.geojson',import.meta.url)));
 const script="import sys,json;sys.path.insert(0,'scripts');from reference_world import build_world;d=json.load(sys.stdin);print(json.dumps(build_world(d['source'],d['countries']),ensure_ascii=False,separators=(',',':')))";
 const rebuilt=JSON.parse(execFileSync('python',['-c',script],{cwd:new URL('../',import.meta.url),input:JSON.stringify({source,countries:Object.fromEntries(countries.map(country=>[country.id,true]))}),encoding:'utf8',maxBuffer:4*1024*1024}));
 assert.deepEqual(rebuilt,generated,'Checked-in map must be reproducible from the maintenance adapter');
 const fixture={features:[{properties:{ISO_A2_EH:'-99',ISO_A2:'-99',POSTAL:'CN',ADM0_A3:'CYN',NAME:'Northern Cyprus'},geometry:{type:'Polygon',coordinates:[[[0,0],[1,0],[0,0]]]}}]};
 const unsupported=JSON.parse(execFileSync('python',['-c',script],{cwd:new URL('../',import.meta.url),input:JSON.stringify({source:fixture,countries:{CN:true}}),encoding:'utf8'}));
 assert.equal(unsupported[0].id,'ne:CYN');
});
test('reference workspace context: region transfers preserve each task query and exact country selection',async()=>{
 const {worldSelection}=await import('../public/capabilities/reference-workspaces.js');
 assert.deepEqual(worldSelection('countries','cn'),{query:'CN',recordId:'CN',region:''});
 assert.deepEqual(worldSelection('airports','cn','PEK'),{query:'PEK',region:'CN'});
 assert.deepEqual(worldSelection('ports','CN','CNSGH'),{query:'CNSGH',region:'CN'});
 assert.deepEqual(worldSelection('currencies','CN','CNY'),{query:'CNY',region:'CN'});
 assert.deepEqual(worldSelection('countries',''),{query:'',recordId:null,region:''});
 assert.throws(()=>worldSelection('airports','中国'),/两个英文字母/);
});
test('reference visual: traditional bagua orders and every upper/lower combination',async()=>{
 const {BAGUA_ORDERS}=await import('../public/reference/visual-core.js'),d=await data('iching');
 assert.equal(d.trigrams.find(r=>r.number===BAGUA_ORDERS.early[0]).chineseName,'乾');assert.equal(d.trigrams.find(r=>r.number===BAGUA_ORDERS.later[0]).chineseName,'離');
 for(const order of Object.values(BAGUA_ORDERS))assert.equal(new Set(order).size,8);
 for(const upper of d.trigrams)for(const lower of d.trigrams){const h=d.hexagrams.find(h=>h.topTrigram===upper.number&&h.bottomTrigram===lower.number);assert.ok(h);assert.deepEqual(h.lines,[...lower.lines,...upper.lines]);}
 const picked=queryRecords('iching',{query:'乾',mode:'trigram',recordId:'1'},d);assert.equal(picked.total,1);
});
test('reference visual: exact record selection keeps parent metadata and color values',async()=>{
 const {colorValues,geologicalName}=await import('../public/reference/visual-core.js');assert.deepEqual(colorValues('#ff0000'),{hex:'#FF0000',rgb:'255, 0, 0',hsl:'0°, 100%, 50%'});assert.equal(colorValues('#808080').hsl,'0°, 0%, 50%');
 assert.equal(queryRecords('countries',{query:'CN',recordId:'CN'},countries).total,1);
 const d=await data('geology'),r=queryRecords('geology',{query:'Jurassic',recordId:'Jurassic'},d);assert.equal(r.total,1);assert.match(JSON.stringify(r),/中生/);assert.equal(geologicalName(d.find(r=>r.id==='Precambrian')),'前寒武时期');
});
test('reference color wheel: HSV round trips, all sectors, greyscale and pointer bounds',async()=>{
 const {normalizeColorHex,hexToHsv,hsvToHex,colorWheelPoint,colorValues}=await import('../public/reference/visual-core.js');
 for(const hex of ['#ff0000','#00ff00','#0000ff','#123abc','#e9ad28','#808080','#ffffff','#000000']){const {h,s,v}=hexToHsv(hex);assert.equal(hsvToHex(h,s,v),hex.toUpperCase());}
 assert.equal(normalizeColorHex('#a3f'),'#AA33FF');assert.equal(colorValues('#f00').hex,'#FF0000');
 for(const hex of ['#00z0ff','#ggff00','#12345','#1234567','red'])assert.throws(()=>normalizeColorHex(hex));
 for(const [h,hex]of [[0,'#FF0000'],[60,'#FFFF00'],[120,'#00FF00'],[180,'#00FFFF'],[240,'#0000FF'],[300,'#FF00FF'],[360,'#FF0000']])assert.equal(hsvToHex(h,1,1),hex);
 assert.equal(hsvToHex(123,0,1),'#FFFFFF');assert.equal(hsvToHex(123,0,.5),'#808080');assert.equal(hsvToHex(123,.72,0),'#000000');
 assert.deepEqual(colorWheelPoint(0,0),{h:0,s:0});assert.deepEqual(colorWheelPoint(0,1),{h:90,s:1});assert.deepEqual(colorWheelPoint(-2,0),{h:180,s:1});assert.deepEqual(colorWheelPoint(0,-1),{h:270,s:1});assert.throws(()=>colorWheelPoint(NaN,0));
 assert.throws(()=>hsvToHex(0,-1,1));assert.throws(()=>hsvToHex(Infinity,1,1));
});
test('reference tarot art: 78 unique real local JPEGs with exact rank and source mapping',async()=>{
 const cards=await data('tarot');assert.equal(new Set(cards.map(r=>r.image)).size,78);
 for(const r of cards){assert.match(r.image,/^[a-z0-9_]+\.jpg$/i);const bytes=await readFile(new URL('../public/vendor/reference/tarot-art/'+r.image,import.meta.url));assert.equal(bytes.readUInt16BE(0),0xffd8);assert.ok(bytes.length>100000);assert.equal(queryRecords('tarot',{query:r.name,recordId:r.id,deck:'rws'},cards).items[0].tarotImage,'tarot-art/'+r.image);}
 assert.equal(cards.find(r=>r.name==='力量').image,'08_Strength.jpg');assert.equal(cards.find(r=>r.name==='正义').image,'11_Justice.jpg');
 for(const [zh,en]of [['权杖','Wands'],['圣杯','Cups'],['宝剑','Swords'],['星币','Pents']])for(const [rank,n]of [['首牌',1],['十',10],['侍从',11],['骑士',12],['王后',13],['国王',14]])assert.equal(cards.find(r=>r.name===zh+rank).image,en+String(n).padStart(2,'0')+'.jpg');
 const upstream=await data('UPSTREAM');assert.equal(upstream.pins['mixvlad/TarotCards'],'840b84d012c6b74dc1634fa2d00d1b21f5b28093');assert.equal(upstream.files.filter(f=>f.path.startsWith('upstream/reference/sources/tarot-art/')).length,78);
});
test('reference modern tarot: all 78 original WebPs, exact named mapping and version-specific numeric results',async()=>{
 const cards=await data('tarot'),source=JSON.parse(await readFile(new URL('../upstream/reference/sources/tarot-gearberry-cards.json',import.meta.url),'utf8')).filter(c=>c.arcana!=='special');
 assert.equal(source.length,78);assert.equal(new Set(cards.map(c=>c.gearberryImage)).size,78);
 const name=n=>n.replace(/^The /,'').toLowerCase();
 for(const r of cards){const original=source.find(c=>name(c.name)===name(r.english));assert.equal(r.gearberryImage,original.filename);assert.equal(r.gearberryNumber,original.number);
  const bytes=await readFile(new URL('../public/vendor/reference/tarot-gearberry/'+r.gearberryImage,import.meta.url));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.ok(bytes.length>10000);assert.deepEqual(bytes,await readFile(new URL('../upstream/reference/sources/tarot-gearberry/'+r.gearberryImage,import.meta.url)));
  const result=queryRecords('tarot',{query:r.name,recordId:r.id},cards).items[0];assert.equal(result.tarotImage,'tarot-gearberry/'+original.filename);assert.equal(result.fields.find(f=>f[0]==='牌面编号')[1],String(original.number));
 }
 const exact=(deck,query)=>queryRecords('tarot',{deck,query,filter:'大阿尔卡那'},cards).items;
 assert.deepEqual(exact('gearberry','8').map(c=>c.title),['正义']);assert.deepEqual(exact('rws','8').map(c=>c.title),['力量']);assert.deepEqual(exact('gearberry','11').map(c=>c.title),['力量']);assert.deepEqual(exact('rws','11').map(c=>c.title),['正义']);
 for(const deck of ['gearberry','rws']){
  assert.deepEqual(exact(deck,'').map(c=>Number(c.fields.find(f=>f[0]==='牌面编号')[1])),Array.from({length:22},(_,i)=>i));
  assert.deepEqual(queryRecords('tarot',{deck,query:'14',filter:'圣杯'},cards).items.map(c=>c.title),['圣杯国王']);
  assert.deepEqual(queryRecords('tarot',{deck,query:'8',filter:'权杖'},cards).items.map(c=>c.title),['权杖八']);
 }
 assert.throws(()=>queryRecords('tarot',{deck:'missing'},cards),/未收录/);
 const upstream=await data('UPSTREAM');assert.equal(upstream.pins['reginanka/tarot-cards'],'83a25b0d4caeb24fa7d556796cf6244d8a55fd81');assert.equal(upstream.files.filter(f=>f.path.startsWith('upstream/reference/sources/tarot-gearberry/')).length,78);
});
