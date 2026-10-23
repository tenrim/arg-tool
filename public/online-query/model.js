// Complete online records belong to this data model, never to their DOM preview.
export const MAX_RESPONSE_BYTES=2*1024*1024;
export const OEIS_ATTRIBUTION=Object.freeze({name:'The On-Line Encyclopedia of Integer Sequences (OEIS)',credit:'The OEIS Foundation Inc. and sequence contributors',license:'CC BY-SA 4.0',licenseURL:'https://creativecommons.org/licenses/by-sa/4.0/',termsURL:'https://oeis.org/wiki/The_OEIS_End-User_License_Agreement'});
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function immutable(value,depth=0){
 if(depth>40)throw Error('查询结果的结构过深，请前往 OEIS 查看。');
 if(value&&typeof value==='object'){for(const entry of Object.values(value))immutable(entry,depth+1);Object.freeze(value);}return value;
}
export function queryParameters(query,start=0){
 if(typeof query!=='string'||!query.trim())throw Error('请输入数列、关键词或 A 编号。');
 if(/\p{Cc}/u.test(query))throw Error('查询内容不能包含控制字符。');
 query=query.trim();if(query.length>500)throw Error('查询内容不能超过 500 个字符。');
 if(!Number.isSafeInteger(start)||start<0||start>10000||start%10)throw Error('查询页码无效，请重新查询。');
 return{query,start};
}
export function officialQueryURL(query){query=String(query).trim();const url=new URL('https://oeis.org/search');url.searchParams.set('q',/^A\d{6}$/i.test(query)?'id:'+query.toUpperCase():query);return url.href;}
export function sequenceID(record){return 'A'+String(record.number).padStart(6,'0');}
export function sequenceURL(record){return 'https://oeis.org/'+sequenceID(record);}
export function parseQueryResponse(text,expected){
 if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>MAX_RESPONSE_BYTES)throw Error('查询结果超过 2 MiB 限额，请缩小查询条件或前往 OEIS。');
 let value;try{value=JSON.parse(text);}catch{throw Error('本站在线查询服务未返回有效资料。静态托管需要另行启用查询服务，可前往 OEIS 查询。');}
 if(!object(value)||value.provider!=='oeis'||value.query!==expected.query||value.start!==expected.start||value.pageSize!==10||!Array.isArray(value.records)||value.records.length>10)throw Error('在线查询结果格式不符，请稍后重试或前往 OEIS。');
 if(typeof value.executedQuery!=='string'||!value.executedQuery||typeof value.fetchedAt!=='string'||!Number.isFinite(Date.parse(value.fetchedAt)))throw Error('在线查询结果缺少执行信息。');
 if(value.total!==null&&(!Number.isSafeInteger(value.total)||value.total<0))throw Error('在线查询结果总数无效。');
 if(value.nextStart!==null&&(!Number.isSafeInteger(value.nextStart)||value.nextStart!==value.start+10||value.nextStart>10000))throw Error('在线查询结果翻页信息无效。');
 let source;try{source=new URL(value.sourceURL);}catch{throw Error('在线查询结果来源无效。');}
 if(source.protocol!=='https:'||source.hostname!=='oeis.org'||source.port||source.username||source.password||source.pathname!=='/search')throw Error('在线查询结果来源无效。');
 if(source.searchParams.get('q')!==value.executedQuery||source.searchParams.get('start')!==String(value.start)||source.searchParams.get('fmt')!=='json')throw Error('在线查询结果来源与本次查询不符。');
 const numbers=new Set();for(const record of value.records){
  if(!object(record)||!Number.isSafeInteger(record.number)||record.number<=0||numbers.has(record.number))throw Error('在线查询包含无效或重复的 OEIS 编号。');numbers.add(record.number);
 }
 return immutable(value);
}
export function recordSnapshot(page,record){
 if(!page.records.includes(record))throw Error('该记录不属于当前查询。');
 return immutable({provider:'oeis',query:page.query,executedQuery:page.executedQuery,start:page.start,fetchedAt:page.fetchedAt,sourceURL:page.sourceURL,recordURL:sequenceURL(record),recordId:sequenceID(record),attribution:OEIS_ATTRIBUTION,record});
}
export function pageSnapshot(page){return immutable({...page,attribution:OEIS_ATTRIBUTION});}
export function notebookRecord(page,record){
 const snapshot=recordSnapshot(page,record);
 return {text:['# '+snapshot.recordId+' · '+String(record.name||'OEIS 数列'),'', '联网查询：'+snapshot.query,'查询时间：'+snapshot.fetchedAt,'来源：'+snapshot.recordURL,'署名：'+OEIS_ATTRIBUTION.credit,'许可：'+OEIS_ATTRIBUTION.license+' · '+OEIS_ATTRIBUTION.licenseURL,'','完整查询信息与原始记录：',JSON.stringify(snapshot,null,2)].join('\n')};
}
