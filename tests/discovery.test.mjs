import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
import * as sgf from '../public/vendor/discovery/sgf.js';
import {compileGo,goCoordinate,GO_LIMITS} from '../public/discovery/go-core.js';
import {queryCurrencies,queryMarine,filterSky,skyRows,CONSTELLATIONS} from '../public/discovery/reference-core.js';
import {astronomy} from '../public/science/core.js';
const read=name=>JSON.parse(readFileSync(new URL('../public/vendor/'+name,import.meta.url)));
const currencies=read('discovery/currencies.json'),countries=read('reference/countries.json'),flags=read('discovery/marine-flags.json'),sky=read('discovery/sky-index.json');
const compile=text=>compileGo(text,sgf),last=game=>Object.values(game.nodes).at(-1);
const ko='(;SZ[5]AB[bc][dc][cd]AW[cc][bb][db][ca];B[cb]';
test('discovery: SGF actual parser, captures, immutable branches, collection and escaped annotations',()=>{
 const games=compile('(;GM[1]SZ[5]CA[UTF-8]PB[黑方]AB[ab][ba][cb]AW[bb]C[括号 ( 和转义 \\] 中文];B[bc](;W[dd]C[主线]TR[dd])(;W[ee]LB[ee:A]))(;SZ[9];B[];W[tt])');
 assert.equal(games.length,2);const g=games[0],root=g.nodes[g.root],capture=g.nodes[root.children[0]];
 assert.equal(root.board[6],2);assert.equal(capture.board[6],0);assert.equal(capture.black,1);assert.equal(capture.children.length,2);
 const [a,b]=capture.children.map(id=>g.nodes[id]);assert.equal(a.board[18],2);assert.equal(b.board[18],0);assert.equal(b.board[24],2);assert.equal(a.board[24],0);
 assert.match(root.comment,/转义 \] 中文/);assert.equal(a.marks[0].type,'TR');assert.equal(b.marks[0].text,'A');assert.equal(last(games[1]).ply,2);assert.equal(last(games[1]).last,null);
 assert.equal(goCoordinate(8,19),'J19');assert.equal(goCoordinate(null,19),'停一手');
});
test('discovery: simple ko survives annotation nodes, pass releases ko, suicide and overlap fail',()=>{
 assert.throws(()=>compile(ko+';W[cc])'),/劫争/);assert.throws(()=>compile(ko+';C[说明];N[仍然禁止];W[cc])'),/劫争/);
 const g=compile(ko+';W[];B[];W[cc])')[0];assert.equal(last(g).white,1);assert.equal(last(g).board[12],2);
 for(const text of ['(;SZ[5]AW[ab][ba];B[aa])','(;SZ[5]AB[aa];W[aa])','(;SZ[5]AB[aa]AW[aa])','(;SZ[5]AB[aa]B[bb])'])assert.throws(()=>compile(text));
 const g2=compile('(;SZ[5]AB[aa:bb]AE[cc];AE[aa]PL[W])')[0];assert.equal(g2.nodes[g2.root].board.filter(Boolean).length,4);assert.equal(last(g2).board.filter(Boolean).length,3);assert.equal(last(g2).turn,2);
});
test('discovery: SGF bounds and invalid encodings/game/coordinates are rejected before replay',()=>{
 for(const text of ['', '(;SZ[19]', '(;GM[2])','(;SZ[19:13])','(;SZ[26])','(;CA[GB2312])','(;SZ[9];B[zz])','(;SZ[9];B[aa][bb])','(;B[aa]W[bb])'])assert.throws(()=>compile(text));
 assert.throws(()=>compile('(;C['+'中'.repeat(GO_LIMITS.bytes/2)+'])'),/512 KB/);
 assert.throws(()=>compile('(;'+ ';B[]'.repeat(GO_LIMITS.nodes)+')'),/2,000/);
 assert.throws(()=>compile('(;'.repeat(GO_LIMITS.depth+1)+')'.repeat(GO_LIMITS.depth+1)),/嵌套/);
 const expanded=compile('(;SZ[25]AB'+'[aa:yy]'.repeat(1000)+'TR'+'[aa:yy]'.repeat(1000)+')')[0];assert.equal(last(expanded).board.filter(Boolean).length,625);assert.equal(last(expanded).marks.length,625);
});
test('discovery: currency snapshot, leading-zero numeric codes and linked countries are preserved',()=>{
 assert.equal(currencies.length,446);assert.equal(currencies.filter(r=>r.status==='current').length,277);
 const q=p=>queryCurrencies(p,currencies,countries);const cny=q({query:'CNY',filter:'current'}).items.find(r=>r.id==='CNY:current');assert.ok(cny.countryCodes.includes('CN'));assert.ok(cny.countryLinks.some(c=>c.id==='CN'&&c.flag));
 assert.equal(q({query:'008',filter:'current'}).items[0].fields.find(r=>r[0]==='数字代码')[1],'008');
 assert.equal(q({query:'JPY',filter:'current'}).items[0].fields.find(r=>r[0]==='最小单位小数位')[1],'0');
 assert.ok(q({region:'CN',filter:'current'}).items.every(r=>r.countryCodes.includes('CN')));assert.ok(q({query:'中国',filter:'current'}).items.some(r=>r.currencyCode==='CNY'));
 assert.ok(q({filter:'historic'}).items.every(r=>!r.countryCodes.length));assert.throws(()=>q({region:'XX'}),/有效/);
});
test('discovery: 36 authentic flags, Chinese meanings and ordered repeated sequences',()=>{
 assert.equal(flags.length,36);assert.equal(new Set(flags.map(r=>r.id)).size,36);
 const q=p=>queryMarine(p,flags);assert.equal(q({query:'潜水员'}).items[0].symbol,'A');assert.equal(q({query:'Alfa'}).items[0].symbol,'A');
 assert.deepEqual(q({query:'a'}).items.map(r=>r.symbol),['A']);assert.deepEqual(q({query:'Ａ'}).items.map(r=>r.symbol),['A']);assert.deepEqual(q({query:'N'}).items.map(r=>r.symbol),['N']);
 assert.match(q({recordId:'R'}).items[0].fields.at(-1)[1],/未规定/);assert.equal(q({filter:'numbers'}).total,10);
 const sequence=q({mode:'sequence',query:'a B a 1'});assert.equal(sequence.sequence,'ABA1');assert.deepEqual(sequence.items.map(r=>r.symbol),['A','B','A','1']);assert.equal(new Set(sequence.items.map(r=>r.id)).size,4);
 for(const query of ['', '中文', 'A!', 'A'.repeat(129)])assert.throws(()=>q({mode:'sequence',query}));
});
test('discovery: complete fixed sky index, catalogue aliases, Chinese names and missing data',()=>{
 assert.equal(sky.length,14034);assert.ok(sky.every(r=>r.kind==='deep'&&r.chunk.startsWith('sky-records/ngc-')));assert.equal(new Set(sky.map(r=>r.id)).size,sky.length);assert.equal(Object.keys(CONSTELLATIONS).length,88);
 assert.ok(readdirSync(new URL('../public/vendor/discovery/sky-records/',import.meta.url)).every(file=>/^ngc-\d{3}\.json$/.test(file)),'no retired star chunks remain in runtime output');
 assert.ok(!readdirSync(new URL('../public/vendor/discovery/',import.meta.url)).some(file=>file.startsWith('hyg-')),'archived HYG is not a published dependency');
 for(const query of ['M31','M 031','NGC224','NGC 0224','仙女座星系'])assert.deepEqual(filterSky({query},sky).map(r=>r.id),['NGC0224']);
 const orion=filterSky({query:'M42'},sky)[0];assert.equal(orion.name,'Great Orion Nebula');assert.equal(orion.ra,5.587911111111111);assert.equal(orion.dec,-5.389666666666667);assert.equal(filterSky({query:'猎户座大星云'},sky)[0].id,orion.id);
 assert.equal(filterSky({query:'天狼星'},sky).length,0);assert.equal(filterSky({query:'HYG:0'},sky).length,0);
 const bright=filterSky({maxMagnitude:4},sky);assert.ok(bright.length>0);assert.ok(bright.every(r=>r.mag!==null&&r.mag<=4));assert.ok(filterSky({filter:'G'},sky).every(r=>r.kind==='deep'&&r.type==='G'));
 const missing=sky.filter(r=>r.ra===null||r.dec===null);assert.equal(missing.length,7);for(const r of missing)assert.equal(skyRows({recordId:r.id},sky).items[0].sky,null);
 const duplicate=sky.find(r=>r.type==='Dup');assert.equal(skyRows({recordId:duplicate.id},sky).items[0].sky,null);assert.throws(()=>filterSky({maxMagnitude:'NaN'},sky));
 const detail=read('discovery/'+orion.chunk);const row=skyRows({recordId:orion.id},sky,detail).items[0];assert.ok(row.fields.some(([k,v])=>k==='长轴／短轴（角分）'&&v==='90.00 / 60.00'));assert.ok(row.fields.some(([k,v])=>k==='来源字段归属'&&v.includes('Type:1')));assert.equal(row.sky.ra,orion.ra);
});
test('discovery: every lazy chunk retains index identifiers and coordinates',()=>{
 const files=new Set(sky.map(r=>r.chunk)),records=new Map();for(const file of files){assert.match(file,/^sky-records\/ngc-\d{3}\.json$/);const rows=read('discovery/'+file);assert.ok(rows.length<=500);for(const r of rows)records.set(r.id,r);}
 assert.equal(records.size,sky.length);for(const r of sky){const d=records.get(r.id);assert.equal(d.ra,r.ra,r.id);assert.equal(d.dec,r.dec,r.id);assert.ok(d.raw);}
});
test('discovery: catalogue directions use the actual engine and observing date/location',()=>{
 const c={Date};c.self=c;vm.createContext(c);vm.runInContext(readFileSync(new URL('../public/vendor/science/astronomy.js',import.meta.url),'utf8'),c);
 const object=skyRows({query:'M31'},sky).items[0].sky,p={body:'Star1',catalogue:object,date:'2026-10-10T20:00',offset:8,lat:39.9042,lon:116.4074};const a=astronomy(p,c.Astronomy);
 const A=c.Astronomy,date=new Date('2026-10-10T12:00:00Z'),obs=new A.Observer(p.lat,p.lon,0),equ=A.Equator(A.Body.Star1,date,obs,true,true),hor=A.Horizon(date,obs,equ.ra,equ.dec,'normal');
 assert.equal(a.visual.azimuth,hor.azimuth);assert.equal(a.visual.altitude,hor.altitude);assert.ok(Math.abs(equ.ra-object.ra)>.0001);
 assert.notEqual(astronomy({...p,lon:0},A).visual.azimuth,a.visual.azimuth);assert.notEqual(astronomy({...p,date:'2026-10-11T02:00'},A).visual.altitude,a.visual.altitude);
 assert.throws(()=>astronomy({...p,catalogue:{...object,ra:null}},A));assert.match(a.note,/自行/);assert.ok(!Object.hasOwn(a.visual,'phase'));
});
