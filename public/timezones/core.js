// IANA TZif v1/v2/v3/v4 and POSIX footer interpretation. No host timezone data,
// locale timezone formatter, guessed DST offset or operating-system TZ service.
import {CLDR_VERSION,territoryLabels,timezoneLabels} from '../reference-locale/names.js';
import {normalizeChineseSearch} from '../reference/chinese-search.js';
const DAY=86400;
const assert=(ok,text)=>{if(!ok)throw Error(text);};
export function parseTZif(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),decoder=new TextDecoder();
 const header=offset=>{
  assert(offset+44<=bytes.length&&decoder.decode(bytes.subarray(offset,offset+4))==='TZif','无效或不完整的 TZif 头。');
  const version=String.fromCharCode(bytes[offset+4]),counts=Array.from({length:6},(_,i)=>view.getUint32(offset+20+i*4));
  assert(counts[4]>0&&counts[4]<=256&&counts[3]<=200000&&counts[5]<=100000,'TZif 记录数量无效。');
  return {version,utc:counts[0],standard:counts[1],leaps:counts[2],times:counts[3],types:counts[4],chars:counts[5]};
 };
 const blockSize=(h,size)=>h.times*(size+1)+h.types*6+h.chars+h.leaps*(size+4)+h.standard+h.utc;
 let offset=0,h=header(0),size=4;
 if(['2','3','4'].includes(h.version)){offset=44+blockSize(h,4);h=header(offset);size=8;}
 assert(offset+44+blockSize(h,size)<=bytes.length,'TZif 数据超出文件范围。');
 offset+=44;const transitions=[];
 for(let i=0;i<h.times;i++){transitions.push(size===8?Number(view.getBigInt64(offset)):view.getInt32(offset));offset+=size;}
 for(let i=1;i<transitions.length;i++)assert(transitions[i]>transitions[i-1],'TZif 时间记录未递增。');
 const indices=Array.from(bytes.subarray(offset,offset+h.times));offset+=h.times;const rawTypes=[];
 for(let i=0;i<h.types;i++){rawTypes.push({offset:view.getInt32(offset),dst:bytes[offset+4]!==0,abbrIndex:bytes[offset+5]});offset+=6;}
 const chars=bytes.subarray(offset,offset+h.chars);offset+=h.chars;
 const types=rawTypes.map(type=>{assert(type.abbrIndex<chars.length,'TZif 缩写索引无效。');const end=chars.indexOf(0,type.abbrIndex);assert(end>=0,'TZif 缩写未终止。');return {offset:type.offset,dst:type.dst,abbreviation:decoder.decode(chars.subarray(type.abbrIndex,end))};});
 assert(indices.every(i=>i<types.length),'TZif 类型索引无效。');
 offset+=h.leaps*(size+4)+h.standard+h.utc;
 let footer='';
 if(size===8&&bytes[offset]===10){const end=bytes.indexOf(10,offset+1);assert(end>=0,'TZif POSIX 尾规则未终止。');footer=decoder.decode(bytes.subarray(offset+1,end));}
 return {transitions,indices,types,footer,posix:footer?parsePosix(footer):null,leapRecords:h.leaps};
}

export function parsePosix(text){
 let cursor=0;
 const name=()=>{const match=/^(?:<([^>]+)>|([A-Za-z]{3,}))/.exec(text.slice(cursor));assert(match,'无法读取 POSIX 时区缩写。');cursor+=match[0].length;return match[1]||match[2];};
 const clock=()=>{const match=/^([+-]?)(\d{1,3})(?::(\d{1,2}))?(?::(\d{1,2}))?/.exec(text.slice(cursor));assert(match&&Number(match[3]||0)<60&&Number(match[4]||0)<60,'POSIX 时间偏移无效。');cursor+=match[0].length;return (match[1]==='-'?-1:1)*(Number(match[2])*3600+Number(match[3]||0)*60+Number(match[4]||0));};
 const standardName=name(),standardOffset=-clock()||0,standard={offset:standardOffset,dst:false,abbreviation:standardName};
 if(cursor===text.length)return {standard};
 const daylightName=name(),daylightOffset=(text[cursor]===','?standardOffset+3600:-clock())||0,daylight={offset:daylightOffset,dst:true,abbreviation:daylightName};
 const rule=()=>{
  assert(text[cursor++ ]===',','POSIX 夏令时规则缺少逗号。');const match=/^(M(\d{1,2})\.(\d)\.(\d)|J(\d{1,3})|(\d{1,3}))/.exec(text.slice(cursor));assert(match,'不支持的 POSIX 日期规则。');cursor+=match[0].length;
  const result=match[2]?{kind:'month',month:Number(match[2]),week:Number(match[3]),weekday:Number(match[4])}:match[5]?{kind:'julian',day:Number(match[5])}:{kind:'ordinal',day:Number(match[6])};
  if(result.kind==='month')assert(result.month>=1&&result.month<=12&&result.week>=1&&result.week<=5&&result.weekday<=6,'POSIX 月周规则超出范围。');
  else assert(result.day>=(result.kind==='julian'?1:0)&&result.day<=365,'POSIX 年内日序超出范围。');
  result.seconds=7200;result.basis='w';
  if(text[cursor]==='/'){cursor++;result.seconds=clock();if(/[wsugz]/.test(text[cursor]||'!')){result.basis=text[cursor];cursor++;}}
  return result;
 };
 const start=rule(),end=rule();assert(cursor===text.length,'POSIX 尾规则含有未解析内容。');return {standard,daylight,start,end};
}
const leap=year=>year%4===0&&(year%100!==0||year%400===0);
export function dateSeconds(year,month=1,day=1,hour=0,minute=0,second=0){const d=new Date(0);d.setUTCFullYear(year,month-1,day);d.setUTCHours(hour,minute,second,0);return d.getTime()/1000;}
function ruleSeconds(year,rule){
 if(rule.kind==='month'){
  const first=new Date(dateSeconds(year,rule.month,1)*1000).getUTCDay();let day=1+(rule.weekday-first+7)%7+(rule.week-1)*7;
  const days=new Date(dateSeconds(year,rule.month+1,0)*1000).getUTCDate();if(day>days)day-=7;
  return dateSeconds(year,rule.month,day)+rule.seconds;
 }
 const ordinal=rule.kind==='julian'?rule.day-1+(leap(year)&&rule.day>=60?1:0):rule.day;
 return dateSeconds(year)+ordinal*DAY+rule.seconds;
}
function posixEvents(posix,year){
 if(!posix?.daylight)return [];
 const at=(rule,before)=>ruleSeconds(year,rule)-(rule.basis==='s'?posix.standard.offset:'ugz'.includes(rule.basis)?0:before.offset);
 return [{utc:at(posix.start,posix.standard),before:posix.standard,after:posix.daylight},{utc:at(posix.end,posix.daylight),before:posix.daylight,after:posix.standard}];
}
function posixState(posix,utc){
 if(!posix.daylight)return {...posix.standard,projected:true};
 const year=new Date(utc*1000).getUTCFullYear(),events=[year-2,year-1,year,year+1].flatMap(y=>posixEvents(posix,y)).sort((a,b)=>a.utc-b.utc);
 const last=events.findLast(event=>event.utc<=utc);return {...(last?.after||events[0].before),projected:true};
}
export function zoneState(zone,utc){
 assert(Number.isFinite(utc),'UTC 时间无效。');const times=zone.transitions;
 if(zone.posix&&(!times.length||utc>times.at(-1)))return posixState(zone.posix,utc);
 let lo=0,hi=times.length;while(lo<hi){const mid=(lo+hi)>>>1;if(times[mid]<=utc)lo=mid+1;else hi=mid;}
 return {...zone.types[lo?zone.indices[lo-1]:0],projected:false};
}
export function parseDateTime(value){
 const match=/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(value));assert(match,'请输入 YYYY-MM-DD HH:mm:ss（秒可省略）。');
 const [year,month,day,hour,minute,second]=match.slice(1).map(s=>Number(s||0));assert(year>=1&&year<=9999&&month>=1&&month<=12&&day>=1&&day<=31&&hour<=23&&minute<=59&&second<=59,'日期或时间超出范围；不接受闰秒。');
 const seconds=dateSeconds(year,month,day,hour,minute,second),d=new Date(seconds*1000);assert(d.getUTCFullYear()===year&&d.getUTCMonth()+1===month&&d.getUTCDate()===day,'日期不存在。');return seconds;
}
export function isoDateTime(seconds){return new Date(seconds*1000).toISOString().replace('.000Z','').replace('T',' ');}
export function formatOffset(seconds){const sign=seconds<0?'-':'+',n=Math.abs(seconds),pad=x=>String(x).padStart(2,'0');return 'UTC'+sign+pad(Math.floor(n/3600))+':'+pad(Math.floor(n%3600/60))+(n%60?':'+pad(n%60):'');}
export function utcToLocal(zone,utc){const state=zoneState(zone,utc);return {utc,utcText:isoDateTime(utc)+'Z',local:utc+state.offset,localText:isoDateTime(utc+state.offset),...state,offsetText:formatOffset(state.offset)};}
function nearTransitions(zone,year){
 const min=dateSeconds(year-1),max=dateSeconds(year+2),list=[];
 for(let i=0;i<zone.transitions.length;i++){const utc=zone.transitions[i];if(utc<min||utc>max)continue;list.push({utc,before:zone.types[i?zone.indices[i-1]:0],after:zone.types[zone.indices[i]]});}
 if(zone.posix)for(let y=year-1;y<=year+1;y++)for(const event of posixEvents(zone.posix,y))if(!zone.transitions.length||event.utc>zone.transitions.at(-1))list.push(event);
 return list.sort((a,b)=>a.utc-b.utc);
}
export function localToUTC(zone,local){
 const offsets=new Set(zone.types.map(t=>t.offset));if(zone.posix){offsets.add(zone.posix.standard.offset);if(zone.posix.daylight)offsets.add(zone.posix.daylight.offset);}
 const candidates=[];
 for(const offset of offsets){const utc=local-offset,state=zoneState(zone,utc);if(state.offset===offset)candidates.push(utcToLocal(zone,utc));}
 candidates.sort((a,b)=>a.utc-b.utc);
 const year=new Date(local*1000).getUTCFullYear();let gap=null;
 if(!candidates.length)for(const event of nearTransitions(zone,year)){const start=event.utc+event.before.offset,end=event.utc+event.after.offset;if(end>start&&local>=start&&local<end){gap={start:isoDateTime(start),end:isoDateTime(end),seconds:end-start,before:event.before,after:event.after};break;}}
 return {status:candidates.length>1?'ambiguous':candidates.length?'unique':'nonexistent',candidates,gap,nearbyTransitions:nearTransitions(zone,year).map(t=>({utcText:isoDateTime(t.utc)+'Z',before:formatOffset(t.before.offset)+' '+t.before.abbreviation,after:formatOffset(t.after.offset)+' '+t.after.abbreviation,localBefore:isoDateTime(t.utc+t.before.offset),localAfter:isoDateTime(t.utc+t.after.offset)}))};
}
export function localizedZone(index,entry){
 const labels=timezoneLabels(entry.id,entry.canonical),countryNames=entry.countries.map(code=>territoryLabels(code)[0]||index.countries[code]||code);
 return {...entry,chineseName:labels.cities[0]||labels.names[0]||'',chineseAliases:[...labels.cities,...labels.names],countryNames,localeVersion:CLDR_VERSION};
}
export function searchZones(index,query='',page=0,pageSize=24){
 const words=normalizeChineseSearch(query).replaceAll('_',' ').trim().split(/\s+/).filter(Boolean);
 const matches=index.zones.map(z=>localizedZone(index,z)).filter(z=>{const text=normalizeChineseSearch([z.id,z.canonical,...z.chineseAliases,...z.countries,...z.countryNames,...z.countries.flatMap(c=>territoryLabels(c)),...z.countries.map(c=>index.countries[c]||''),z.comment].join(' ')).replaceAll('_',' ');return words.every(w=>text.includes(w));});
 return {total:matches.length,page,items:matches.slice(page*pageSize,(page+1)*pageSize)};
}
export function sourceRecords(data,id,canonical){
 const blocks=data.zones[canonical]||[],names=new Set();
 for(const record of blocks){const p=record.text.split('#')[0].trim().split(/\s+/),rule=p[0]==='Zone'?p[3]:p[1];if(rule&&rule!=='-'&&!/^[-+\d]/.test(rule))names.add(rule);}
 const linkTrail=[];let cursor=id;const seen=new Set();while(data.links[cursor]&&!seen.has(cursor)){seen.add(cursor);linkTrail.push(data.links[cursor]);cursor=data.links[cursor].target;}
 const optional=data.backzones[id]||data.backzones[canonical]||[],optionalNames=new Set();for(const record of optional){const p=record.text.split('#')[0].trim().split(/\s+/),rule=p[0]==='Zone'?p[3]:p[1];if(rule&&rule!=='-'&&!/^[-+\d]/.test(rule))optionalNames.add(rule);}
 return {active:[...linkTrail,...blocks,...[...names].flatMap(name=>data.rules[name]||[])],optional:[...optional,...[...optionalNames].flatMap(name=>data.rules['backzone:'+name]||data.rules[name]||[])]};
}
