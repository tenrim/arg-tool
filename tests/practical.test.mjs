import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ageAt,civil,countdown,dateDifference,dateText,fromISOWeek,isoWeek,shiftDate} from '../public/practical/dates.js';
import {SHAPES,bmiExpression,geometryExpressions} from '../public/practical/geometry.js';
import {parseTZif,parseDateTime,utcToLocal} from '../public/timezones/core.js';
import {planMeeting,selectInstant,validateParticipants,meetingAt} from '../public/timezones/planner.js';
import {distanceBearing} from '../public/round2/coordinates-engine.js';
import {formula} from '../public/science/core.js';
import create from '../public/vendor/qalculate/qalculate.mjs';
const zone=async id=>parseTZif(await readFile('public/vendor/timezones/zoneinfo/'+id));
test('本轮复用固定来源，没有覆盖上游数据或运行字节',async()=>{
 const manifest=JSON.parse(await readFile('upstream/practical-20261021/SOURCES.json','utf8'));
 for(const pin of manifest.pins)assert.equal(createHash('sha256').update(await readFile(pin.path)).digest('hex'),pin.sha256,pin.path);
});
test('公历日期：闰世纪、月末合并、减法、年界及无效日期',()=>{
 assert.equal(shiftDate('2024-01-31',{months:1}).date,'2024-02-29');
 assert.equal(shiftDate('2024-02-29',{years:1,months:1,days:1}).date,'2025-03-30');
 assert.equal(shiftDate('2025-03-31',{months:-1,days:-1}).date,'2025-02-27');
 assert.equal(shiftDate('0099-12-31',{days:1}).date,'0100-01-01');
 assert.equal(shiftDate('0001-01-01',{days:0}).date,'0001-01-01');
 for(const d of ['1900-02-29','2100-02-29','2024-04-31','0000-01-01','2025-1-01','2025-02-30'])assert.throws(()=>civil(d),d);
 assert.throws(()=>shiftDate('9999-12-31',{days:1}));assert.throws(()=>shiftDate('0001-01-01',{days:-1}));assert.throws(()=>shiftDate('2024-01-01',{months:1.2}));
});
test('日期差：正反向、包含结束日、周末和日历月末口径',()=>{
 assert.deepEqual(dateDifference('2024-02-28','2024-03-01'),{signedDays:2,days:2,weeks:0,remainingDays:2,weekdays:2,years:0,months:0,calendarDays:2,inclusive:false});
 assert.equal(dateDifference('2024-03-01','2024-02-28',true).signedDays,-2);assert.equal(dateDifference('2024-03-01','2024-02-28',true).days,3);
 assert.equal(dateDifference('2025-01-31','2025-02-28').months,1);assert.equal(dateDifference('2025-01-31','2025-02-28').calendarDays,0);
 assert.equal(dateDifference('2026-10-24','2026-10-24',true).weekdays,0);
 for(let n=0;n<40;n++){const a=civil('2026-10-19').ms,end=dateText(a+n*86400000);let weekdays=0;for(let i=0;i<n;i++)if(![0,6].includes(new Date(a+i*86400000).getUTCDay()))weekdays++;assert.equal(dateDifference('2026-10-19',end).weekdays,weekdays);}
});
test('年龄：生日当天、闰日约定、未出生和边界生日',()=>{
 assert.equal(ageAt('2000-02-29','2025-02-28','mar1').age,24);assert.equal(ageAt('2000-02-29','2025-02-28','mar1').until,1);
 assert.equal(ageAt('2000-02-29','2025-02-28','feb28').age,25);assert.equal(ageAt('2000-02-29','2025-02-28','feb28').isBirthday,true);
 assert.equal(ageAt('2026-10-21','2026-10-21').age,0);assert.throws(()=>ageAt('2026-10-22','2026-10-21'));
 assert.equal(ageAt('2000-01-01','9999-12-31').birthday,null);
});
test('ISO 周：跨周年份、第 53 周、双向转换及完整 400 年的周数',()=>{
 assert.equal(isoWeek('2021-01-01').iso,'2020-W53-5');assert.equal(isoWeek('2019-12-30').iso,'2020-W01-1');
 assert.equal(fromISOWeek(2020,53,5),'2021-01-01');assert.throws(()=>fromISOWeek(2021,53,1));assert.equal(isoWeek('2024-12-31').ordinal,366);
 let weeks=0;for(let year=2000;year<2400;year++){weeks+=isoWeek(year+'-12-28').week;for(const date of [year+'-01-01',year+'-12-31']){const r=isoWeek(date);assert.equal(fromISOWeek(r.year,r.week,r.weekday),date);}}assert.equal(weeks,20871);
 assert.equal(isoWeek('0001-01-01').monday,'0001-01-01');assert.equal(isoWeek('9999-12-31').sunday,'超出 9999 年');
});
test('倒计时使用绝对时钟，归零后显示已过时长而非截断计时',()=>{
 assert.deepEqual(countdown(90061000,0),{remaining:true,complete:false,totalSeconds:90061,days:1,hours:1,minutes:1,seconds:1});
 assert.equal(countdown(0,1000).remaining,false);assert.equal(countdown(0,1000).totalSeconds,-1);assert.equal(countdown(1000,1000).complete,true);assert.equal(countdown(0,500).totalSeconds,0);assert.equal(countdown(0,500).seconds,0);
});
test('真实完整 TZif：夏令时 gap/fold、半小时变化、整天跳时',async()=>{
 const ny=await zone('America/New_York');assert.throws(()=>selectInstant(ny,'2026-03-08T02:30'),/不存在/);
 const fold=selectInstant(ny,'2026-11-01T01:30');assert.equal(fold.ambiguous,true);assert.equal(fold.candidates.length,2);
 const early=selectInstant(ny,'2026-11-01T01:30','earlier').instant,late=selectInstant(ny,'2026-11-01T01:30','later').instant;assert.equal(late-early,3600);
 const lord=await zone('Australia/Lord_Howe');assert.throws(()=>selectInstant(lord,'2026-10-04T02:15'),/不存在/);
 const apia=await zone('Pacific/Apia');assert.throws(()=>selectInstant(apia,'2011-12-30T12:00'),/不存在/);
 assert.throws(()=>selectInstant(ny,'2026-11-01T01:30','invalid'),/选择/);
});
test('多时区会议：跨日、完整占用区间、秒边界、共同空档和限额',async()=>{
 const zones=new Map(await Promise.all(['Asia/Shanghai','America/New_York','UTC'].map(async id=>[id,await zone(id)])));
 const participants=[{zone:'Asia/Shanghai',name:'上海',start:'09:00',end:'18:00',weekdays:true},{zone:'America/New_York',name:'纽约',start:'09:00',end:'18:00',weekdays:true}];
 const utc=selectInstant(zones.get('Asia/Shanghai'),'2026-01-15T21:00').instant,r=planMeeting({utc,duration:60,participants,zones});assert.equal(r.rows[1].start.localText,'2026-01-15 08:00:00');assert.equal(r.rows[1].available,false);
 assert.equal(utcToLocal(zones.get('America/New_York'),selectInstant(zones.get('Asia/Shanghai'),'2026-01-15T08:00').instant).localText,'2026-01-14 19:00:00');
 const utcOnly=validateParticipants([{zone:'UTC',start:'09:00',end:'18:00'}]);assert.equal(meetingAt(parseDateTime('2026-01-15T17:59:30'),1,utcOnly,zones)[0].available,false);
 assert.equal(meetingAt(parseDateTime('2026-01-15T17:00:00'),60,utcOnly,zones)[0].available,true);
 const found=planMeeting({utc:parseDateTime('2026-01-15T06:15'),duration:60,participants:utcOnly,zones,search:true});assert.equal(found.suggestions.length,12);assert.equal(found.suggestions[0].utc,parseDateTime('2026-01-15T09:00'));assert.ok(found.suggestions.every(s=>s.rows.every(r=>r.available)));
 assert.throws(()=>validateParticipants([]));assert.throws(()=>validateParticipants(Array(13).fill(utcOnly[0])));assert.throws(()=>validateParticipants([{start:'19:00',end:'09:00'}]));assert.throws(()=>planMeeting({utc,duration:0,participants,zones}));
 const foldZone=await zone('America/New_York'),foldUTC=selectInstant(foldZone,'2026-11-01T01:30','earlier').instant,foldRows=meetingAt(foldUTC,120,validateParticipants([{zone:'America/New_York',start:'01:00',end:'02:00'}]),new Map([['America/New_York',foldZone]]));assert.equal(foldRows[0].available,false);
});
test('球面距离与三种方位：赤道、日期变更线、极点与对跖',()=>{
 const r=distanceBearing(0,0,0,1);assert.ok(Math.abs(r.distance-111.1950802335)<1e-8);assert.equal(r.bearing,90);assert.equal(r.finalBearing,90);assert.equal(r.reverseBearing,270);
 assert.ok(distanceBearing(0,179,0,-179).distance<223);assert.equal(distanceBearing(0,0,0,0).bearing,null);assert.equal(distanceBearing(0,0,0,180).bearing,null);assert.equal(distanceBearing(90,0,10,10).bearing,null);assert.throws(()=>distanceBearing(NaN,0,0,0));
 const back=distanceBearing(51.5,-.1,39.9,116.4),forward=distanceBearing(39.9,116.4,51.5,-.1);assert.equal(back.bearing,forward.reverseBearing);assert.equal(back.distance,forward.distance);
});
test('摩尔质量：完整元素、方括号、Unicode 下标、结晶水和明确语法边界',async()=>{
 const elements=JSON.parse(await readFile('public/vendor/science/elements.json','utf8'));assert.equal(elements.length,118);
 const water=formula('H₂O',elements);assert.ok(Math.abs(water.mass-18.015)<.01);assert.deepEqual(water.counts,{H:2,O:1});assert.ok(water.rows.some(r=>r[0]==='摩尔质量（约）'&&r[1].includes('g/mol')));
 assert.deepEqual(formula('K4[Fe(CN)6]',elements).counts,{K:4,Fe:1,C:6,N:6});assert.deepEqual(formula('CuSO4*5H2O',elements).counts,{Cu:1,S:1,O:9,H:10});assert.deepEqual(formula('CuSO4.5H2O',elements).counts,formula('CuSO4·5H2O',elements).counts);
 assert.ok(Math.abs(water.composition.reduce((a,e)=>a+e.percent,0)-100)<1e-10);
 for(const s of ['[]','[OH)','(OH]','[H2O·2H2O]','H0','Xx2','Na+','^13C','H9999999','H2O·','H2O**H2O'])assert.throws(()=>formula(s,elements),s);
});
test('19 种几何实际 Qalculate 输出与独立数值公式一致；BMI 支持英制单位',async()=>{
 const q=await create({print:()=>{},printErr:()=>{}});assert.equal(q.setOption('evaluate.parse_options.angle_unit ANGLE_UNIT_RADIANS'),true);q.setOption('precision 16');
 const expected={rectangle:[12,14,5],square:[9,12,3*Math.sqrt(2)],triangle:[6,12],'triangle-height':[6],'trapezoid-area':[9],'right-triangle':[6,12,5],parallelogram:[8,14],trapezoid:[9,6+2*Math.sqrt(10)],circle:[9*Math.PI,6*Math.PI,6],annulus:[16*Math.PI,16*Math.PI],sector:[9*Math.PI/4,3*Math.PI/2,6+3*Math.PI/2],polygon:[6*Math.sqrt(3),12],cuboid:[24,52,Math.sqrt(29)],cube:[27,54],cylinder:[36*Math.PI,42*Math.PI,24*Math.PI],cone:[12*Math.PI,24*Math.PI,5],sphere:[36*Math.PI,36*Math.PI],hemisphere:[18*Math.PI,27*Math.PI,18*Math.PI],pyramid:[48,96]};
 for(const s of SHAPES){const expressions=geometryExpressions(s.id,Object.fromEntries(s.fields.map(f=>[f.id,f.value])));for(let i=0;i<expressions.length;i++){const result=q.calculate(expressions[i][1]);assert.deepEqual(result.messages,[],s.id);const value=Number(result.output.split(/≈|=/).at(-1).replace(/[\s\u202f…]/g,''));assert.ok(Math.abs(value-expected[s.id][i])<1e-10*Math.max(1,value),s.id+': '+result.output);}}
 for(const [id,p]of [['triangle',{a:1,b:2,c:3}],['annulus',{r:2,i:3}],['parallelogram',{a:4,b:2,h:3}],['polygon',{n:2,a:3}],['sector',{r:3,angle:361}],['rectangle',{a:0,b:4}]])assert.throws(()=>geometryExpressions(id,p));
 for(const [w,h,wu,hu,value]of [[70,175,'kg','cm',22.857142857142],[154.3235835294,68.8976377953,'lb','in',22.8571428571],[70,1.75,'kg','m',22.857142857142]]){const r=q.calculate(bmiExpression(w,h,wu,hu));assert.deepEqual(r.messages,[]);const n=Number(r.output.split(/≈|=/).at(-1).replace(/[\s\u202f…]/g,''));assert.ok(Math.abs(n-value)<1e-8);}
 assert.equal(q.setOption('print.min_decimals 2'),true);assert.equal(q.calculate('round('+bmiExpression(70,175)+',2) to decimals').output,'22.86');assert.equal(q.calculate('round('+bmiExpression(100,200)+',2) to decimals').output,'25.00');assert.throws(()=>bmiExpression(0,175));assert.throws(()=>bmiExpression(70,175,'kg','unknown'));
});
