import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {queryConstellations, queryEclipses} from '../public/atlas-celestial/core.js';
const runtime = new URL('../public/vendor/atlas-celestial/', import.meta.url);
const data = name => JSON.parse(readFileSync(new URL(name+'.json',runtime),'utf8'));
const constellations = data('constellations'), eclipses = data('eclipses');
const row = (item,label) => item.fields.find(([key]) => key === label)?.[1];
const file = relative => readFileSync(new URL('../'+relative,import.meta.url));
test('celestial: all 88 official constellations, both Serpens charts and exact image/boundary files survive', () => {
  assert.equal(constellations.records.length,88); assert.equal(new Set(constellations.records.map(r=>r.id)).size,88);
  assert.equal(constellations.records.reduce((n,r)=>n+r.charts.length,0),89);
  assert.equal(constellations.records.reduce((n,r)=>n+r.boundaries.length,0),89);
  for (const record of constellations.records) {
    assert.ok(record.zh && record.name && record.genitive && record.english);
    assert.equal(record.sourceCells.length,5);
    for (const chart of record.charts) {
      const bytes=readFileSync(new URL(chart.path,runtime));
      assert.match(bytes.subarray(0,6).toString(),/^GIF8[79]a$/);
      const original=file('upstream/atlas-celestial/sources/'+chart.path); assert.deepEqual(bytes,original);
    }
    for (const boundary of record.boundaries) assert.equal(readFileSync(new URL(boundary.path,runtime),'utf8'),boundary.text);
  }
  const ser=queryConstellations(constellations,{recordId:'Ser'}).items[0];
  assert.equal(ser.charts.length,2);assert.match(ser.charts[0].path,/sercp/);assert.match(ser.charts[1].path,/sercd/);
  assert.equal(ser.raw.id,'Ser');assert.match(row(ser,'拉丁属格'),/^Serpentis$/);
  const apus=constellations.records.find(r=>r.id==='Aps');assert.equal(apus.name,'Apus');assert.equal(apus.pronunciation,'APE-us, APP-us');
});
test('celestial: nominative/genitive/abbreviation/Chinese search and bounded paging share full records', () => {
  for (const term of ['Arietis','Aries','Ari','白羊座']) assert.ok(queryConstellations(constellations,{query:term}).items.some(r=>r.id==='Ari'));
  assert.equal(queryConstellations(constellations,{query:'bootis'}).items[0].id,'Boo');
  assert.deepEqual(queryConstellations(constellations,{query:'獵戶座'}).items.map(record=>record.id),['Ori']);
  for (const query of ['蛇头', '蛇尾', 'Serpens Caput', 'Serpens Cauda']) assert.deepEqual(queryConstellations(constellations,{query}).items.map(record=>record.id),['Ser']);
  const a=queryConstellations(constellations,{}), b=queryConstellations(constellations,{page:1});
  assert.equal(a.total,88);assert.equal(a.items.length,24);assert.equal(b.items.length,24);
  assert.equal(a.facets.index.length,88);assert.equal(new Set([...a.items,...b.items].map(r=>r.id)).size,48);
  assert.equal(queryConstellations(constellations,{page:999}).page,3);
  assert.equal(queryConstellations(constellations,{query:'not-a-constellation'}).total,0);
  for(const p of [{query:'x'.repeat(10001)},{pageSize:101},{page:-1},{filter:'zodiac'}])assert.throws(()=>queryConstellations(constellations,p));
});
test('celestial: all 100 official century tables match every retained raw eclipse line and column', () => {
  assert.equal(eclipses.records.length,23962);assert.equal(new Set(eclipses.records.map(r=>r.id)).size,23962);
  const byId=new Map(eclipses.records.map(r=>[r.id,r]));
  for(const [kind,total] of [['solar',11898],['lunar',12064]]) {
    const dir=new URL('../upstream/atlas-celestial/sources/'+kind+'/',import.meta.url), files=readdirSync(dir).filter(p=>p.endsWith('.html'));
    assert.equal(files.length,50);let n=0;
    for(const name of files) for(const original of readFileSync(new URL(name,dir),'utf8').split(/\r?\n/)) {
      const line=original.replace(/<[^>]*>/g,'').trimEnd();
      if(!/^\d{5}\s+-?\d{4}\s+[A-Z][a-z]{2}\s+\d{2}\s+\d{2}:\d{2}:\d{2}/.test(line))continue;
      const columns=line.split(/\s+/),record=byId.get(kind+':'+columns[0]);n++;
      assert.ok(record);assert.equal(record.rawLine,line);assert.deepEqual(record.rawColumns,columns);
      assert.equal(record.catalogNumber,columns[0]);assert.equal(record.year,Number(columns[1]));
      assert.equal(record.td,columns[4]);assert.equal(record.deltaT,columns[5]);assert.equal(record.lunationNumber,columns[6]);assert.equal(record.saros,columns[7]);
      assert.equal(record.type,columns[8]);assert.equal(record.quincena,columns[9]);assert.equal(record.gamma,columns[10]);
      assert.ok(record.links.length && record.links.every(r=>r.url.startsWith('https://eclipse.gsfc.nasa.gov/')));
    }
    assert.equal(n,total);
    const records=eclipses.records.filter(r=>r.kind===kind);assert.equal(records[0].year,-1999);assert.equal(records.at(-1).year,3000);
    assert.deepEqual(records.map(r=>Number(r.catalogNumber)).sort((a,b)=>a-b),Array.from({length:total},(_,i)=>i+1));
  }
  assert.ok(eclipses.meta.headers.solar.length && eclipses.meta.headers.lunar.length);
  assert.equal(eclipses.meta.documentation.length,8);
  // The complete official ASCII editions add solar plate/azimuth and preserve
  // their own row formatting/coordinate precision independently of web tables.
  for(const [kind,total] of [['solar',11898],['lunar',12064]]) {
    const original=file('upstream/atlas-celestial/sources/'+kind+'-ascii.txt').toString('latin1');let n=0;
    for(const line of original.split(/\r?\n/)) {
      const pattern=kind==='solar'?/^\s*\d{1,5}\s+\d{3}\s+-?\d{4}\s+[A-Z][a-z]{2}\s+\d{2}\s+\d{2}:/:/^\d{5}\s+-?\d{4}\s+[A-Z][a-z]{2}\s+\d{2}\s+\d{2}:/;
      if(!pattern.test(line))continue;
      const columns=line.trim().split(/\s+/),record=byId.get(kind+':'+columns[0].padStart(5,'0'));n++;
      assert.equal(record.ascii.rawLine,line.trimEnd());assert.deepEqual(record.ascii.rawColumns,columns);
      assert.equal(record.ascii.td,record.td);assert.equal(record.ascii.deltaT,record.deltaT);
    }
    assert.equal(n,total);
  }
});
test('celestial: real solar/lunar fields retain time scale, geometry and phase distinctions', () => {
  const s=queryEclipses(eclipses,{filter:'solar',query:'2024-04-08'});
  assert.equal(s.total,1); const item=s.items[0];assert.equal(item.id,'solar:09561');assert.equal(item.raw.td,'18:18:29');assert.equal(item.raw.deltaT,'74');assert.equal(item.raw.saros,'139');assert.equal(item.raw.magnitude,'1.0566');assert.equal(item.raw.centralDuration,'04m28s');assert.equal(item.raw.calendar,'gregorian');
  assert.equal(row(item,'ΔT＝TD－UT（秒）'),'74');assert.match(s.note,/TD/);
  assert.deepEqual(queryEclipses(eclipses,{filter:'solar',query:'2024 Apr 08'}).items.map(r=>r.id),['solar:09561']);
  assert.deepEqual(queryEclipses(eclipses,{filter:'solar',query:'2024 apr 8'}).items.map(r=>r.id),['solar:09561']);
  for (const query of ['2024年4月8日', '2024 年 04 月 08 号', '２０２４年４月８日', '2024年4月8號']) assert.deepEqual(queryEclipses(eclipses,{filter:'solar',query}).items.map(r=>r.id),['solar:09561']);
  assert.equal(item.title, '2024年4月8日 · 日全食');
  assert.equal(row(item,'日期（原目录历法）'),'2024 Apr 08');
  assert.equal(queryEclipses(eclipses,{query:'2024年'}).total,queryEclipses(eclipses,{query:'2024'}).total);
  assert.ok(queryEclipses(eclipses,{query:'2024'}).items.every(r=>r.raw.year===2024));
  assert.equal(item.raw.ascii.plateNumber,'479');assert.equal(item.raw.ascii.sunAzimuth,'149');assert.equal(item.raw.ascii.latitude,'25.3N');assert.equal(row(item,'ASCII 原表太阳方位角（度）'),'149');
  const l=queryEclipses(eclipses,{filter:'lunar:T',query:'2022-11-08'}).items[0];
  assert.equal(l.id,'lunar:09701');assert.equal(l.raw.type,'T+');assert.equal(l.raw.penumbralDuration,'353.9');assert.equal(l.raw.totalDuration,'85.0');assert.equal(l.raw.penumbralMagnitude,'2.4143');assert.equal(l.raw.umbralMagnitude,'1.3589');
  assert.equal(row(l,'全食持续时间（分钟）'),'85.0');
  assert.equal(queryEclipses(eclipses,{filter:'solar:T',saros:139,query:'2024'}).total,1);
});
test('celestial: astronomical zero, ancient calendar and exact filters do not coerce dates', () => {
  const zero=queryEclipses(eclipses,{fromYear:0,toYear:0});assert.ok(zero.total>0);assert.ok(zero.items.every(r=>r.raw.year===0&&r.raw.calendar==='julian'));
  const negative=queryEclipses(eclipses,{fromYear:-1999,toYear:-1999});assert.ok(negative.total>0);assert.ok(negative.items.every(r=>r.raw.dateISO.startsWith('-1999-')));
  for(const yr of [-1999,0,2024]) {
    const records=eclipses.records.filter(r=>r.year===yr),first=records[0];
    assert.equal(queryEclipses(eclipses,{query:String(yr)}).total,records.length);
    for(const query of [first.date,first.dateISO,`${first.year}年${first.month}月${first.day}日`])assert.deepEqual(queryEclipses(eclipses,{query}).items.map(r=>r.id),records.filter(r=>r.month===first.month&&r.day===first.day).map(r=>r.id));
  }
  const all=queryEclipses(eclipses,{});assert.equal(all.total,23962);assert.equal(all.items.length,24);assert.equal(all.facets.types.find(r=>r.value==='solar').count,11898);assert.equal(all.facets.types.find(r=>r.value==='lunar').count,12064);
  assert.equal(all.facets.types.find(r=>r.value==='solar:T').count,3173);assert.equal(all.facets.types.find(r=>r.value==='lunar:T').count,3479);
  assert.equal(queryEclipses(eclipses,{recordId:'solar:09561'}).total,1);
  for(const p of [{fromYear:-2000},{toYear:3001},{fromYear:2000,toYear:1900},{fromYear:'1 BCE'},{fromYear:'1.2'},{saros:1.5},{filter:'T'},{pageSize:0},{query:'2024-02-30'},{query:'1582 Oct 10'},{query:'2023-02-29'},{query:'2024年2月30日'},{query:'1582年10月10日'}])assert.throws(()=>queryEclipses(eclipses,p));
});
test('celestial: pinned source and runtime integrity manifests verify actual complete snapshots', () => {
  const manifest=data('UPSTREAM'); assert.equal(manifest.scope.constellations,88);assert.equal(manifest.scope.solar,11898);assert.equal(manifest.scope.lunar,12064);
  for(const record of [...manifest.files,...manifest.sources])assert.equal(createHash('sha256').update(file(record.path)).digest('hex'),record.sha256,record.path);
  for(const name of ['constellations','eclipses'])assert.deepEqual(gunzipSync(readFileSync(new URL(name+'.json.gz',runtime))),readFileSync(new URL(name+'.json',runtime)));
  assert.match(readFileSync(new URL('NASA-NOTICE.txt',runtime),'utf8'),/Eclipse Predictions by Fred Espenak and Jean Meeus \(NASA's GSFC\)/);
  assert.match(readFileSync(new URL('IAU-NOTICE.txt',runtime),'utf8'),/Roger Sinnott and Rick Fienberg/);
  assert.ok(readFileSync(new URL('CC-BY-4.0.txt',runtime),'utf8').includes('Attribution 4.0 International'));
});


