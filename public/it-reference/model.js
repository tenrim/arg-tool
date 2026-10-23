// Offline fixed references. The only requests made here fetch the bundled datasets.
import {withChineseIT} from './chinese.js';
import {normalizeChineseSearch} from '../reference/chinese-search.js';
export const IT_CATEGORIES=Object.freeze([
 {id:'ports',title:'端口与协议',summary:'端口定位服务，IP协议号定位网络层之上的协议；这两种编号不能混用。'},
 {id:'http',title:'HTTP状态与字段',summary:'状态码说明请求结果，字段描述正文类型、缓存、位置等信息。'},
 {id:'formats',title:'MIME与字符集',summary:'媒体类型说明数据是什么，字符集说明文字如何表示成字节。'},
 {id:'domains',title:'域名与公共后缀',summary:'公共后缀可能有多段；注册域不能简单地取网址最后两段。'}
]);
const kinds=new Set(IT_CATEGORIES.map(item=>item.id));
const cache=new Map();
const searchCache=new WeakMap();
const FETCH_TIMEOUT=30_000;
const MAX_DATA_BYTES=24*1024*1024;
const normalized=value=>normalizeChineseSearch(value).trim();
export async function loadITData(kind){
 if(!kinds.has(kind))throw new Error('未知的IT资料分类。');
 if(cache.has(kind))return cache.get(kind);
 const promise=(async()=>{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),FETCH_TIMEOUT);
  try{
   const response=await fetch(new URL('../vendor/it-reference/'+kind+'.json',import.meta.url),{signal:controller.signal});
   if(!response.ok)throw new Error('资料载入失败（HTTP '+response.status+'）。');
   const length=Number(response.headers.get('content-length'));
   if(Number.isFinite(length)&&length>MAX_DATA_BYTES)throw new Error('资料文件超过载入限额。');
   const text=await response.text();
   if(new TextEncoder().encode(text).length>MAX_DATA_BYTES)throw new Error('资料文件超过载入限额。');
   const data=withChineseIT(JSON.parse(text));
   if(data.kind!==kind||!Array.isArray(data.records)||data.records.length>30_000||!data.meta)throw new Error('资料格式不正确。');
   const ids=new Set();
   for(const r of data.records){
    if(!r||typeof r.id!=='string'||ids.has(r.id)||r.kind!==kind||typeof r.title!=='string'||typeof r.summary!=='string'||!Array.isArray(r.aliases)||!Array.isArray(r.fields)||!Array.isArray(r.examples)||!Array.isArray(r.related))throw new Error('资料记录格式不正确。');
    ids.add(r.id);
    searchCache.set(r,{aliases:r.aliases.map(normalized),title:normalized(r.title),text:normalized([r.title,...r.aliases,r.summary,...r.fields.map(f=>f.value)].join(' '))});
   }
   if(data.meta.recordCount!==data.records.length)throw new Error('资料数量校验失败。');
   return data;
  }catch(error){if(error.name==='AbortError')throw new Error('资料载入超时，请重试。');throw error;}
  finally{clearTimeout(timer);}
 })();
 cache.set(kind,promise);
 try{return await promise;}catch(error){if(cache.get(kind)===promise)cache.delete(kind);throw error;}
}
export function searchITRecords(records,query,{limit=100,offset=0}={}){
 if(!Array.isArray(records))throw new TypeError('资料记录应为数组。');
 if(!Number.isInteger(limit)||limit<1||limit>200||!Number.isInteger(offset)||offset<0)throw new RangeError('查询分页参数不正确。');
 const q=normalized(query);const tokens=q.split(/\s+/u).filter(Boolean);const numeric=/^\d{1,5}$/.test(q)?Number(q):null;
 if(!tokens.length)return{records:records.slice(offset,offset+limit),total:records.length};
 const found=[];
 for(let index=0;index<records.length;index++){
  const r=records[index];let entry=searchCache.get(r);
  if(!entry){entry={aliases:(r.aliases||[]).map(normalized),title:normalized(r.title),text:normalized([r.title,...(r.aliases||[]),r.summary,...(r.fields||[]).map(f=>f.value)].join(' '))};searchCache.set(r,entry);}
  const inRange=numeric!==null&&Array.isArray(r.numericRange)&&numeric>=r.numericRange[0]&&numeric<=r.numericRange[1];
  if(inRange||tokens.every(token=>entry.text.includes(token))){const rank=entry.title===q||entry.aliases.includes(q)?0:entry.title.startsWith(q)||inRange?1:2;found.push({r,rank,index});}
 }
 found.sort((a,b)=>a.rank-b.rank||a.index-b.index);
 return{records:found.slice(offset,offset+limit).map(item=>item.r),total:found.length};
}
export function normalizeDomainInput(input){
 const raw=String(input??'').trim();if(!raw||raw.length>2048)throw new Error('请输入有效域名或网址（最多2048字符）。');
 if(/\s|\\/u.test(raw))throw new Error('域名或网址不能包含空白或反斜杠。');
 let url;try{url=new URL(raw.includes('://')?raw:'https://'+raw);}catch{throw new Error('域名或网址格式不正确。');}
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('请输入HTTP(S)网址或域名，不包含用户名和密码。');
 let hostname=url.hostname.toLowerCase();if(hostname.endsWith('.'))hostname=hostname.slice(0,-1);
 const isIp=/^\[.*\]$/.test(hostname)||/^\d+\.\d+\.\d+\.\d+$/.test(hostname);
 if(!hostname||hostname.length>253||!isIp&&hostname.split('.').some(label=>!label||label.length>63||!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)))throw new Error('域名格式不正确。');
 return{input:raw,hostname,asciiHostname:hostname,isIp};
}
const ruleIndexes=new WeakMap();
export function matchPublicSuffix(hostname,records,{includePrivate=true}={}){
 let indexes=ruleIndexes.get(records);
 if(!indexes){indexes={icann:new Map(),private:new Map()};for(const r of records)if(r.asciiRule)indexes[r.isPrivate?'private':'icann'].set(r.asciiRule,r);ruleIndexes.set(records,indexes);}
 const labels=hostname.split('.');let best=null;let count=1;let exception=null;
 for(let i=0;i<labels.length;i++){
  const suffix=labels.slice(i).join('.');
  for(const [section,rules]of Object.entries(indexes)){
   if(section==='private'&&!includePrivate)continue;
   const ex=rules.get('!'+suffix);if(ex){exception=ex;count=labels.length-i-1;break;}
   const exact=rules.get(suffix);if(exact&&labels.length-i>=count){best=exact;count=labels.length-i;}
   if(i>0){const wildcard=rules.get('*.'+suffix);if(wildcard&&labels.length-i+1>=count){best=wildcard;count=labels.length-i+1;}}
  }
  if(exception)break;
 }
 if(exception)best=exception;
 const publicSuffix=labels.slice(-count).join('.');
 const domain=labels.length>count?labels.slice(-count-1).join('.'):null;
 return{publicSuffix,domain,subdomain:domain?labels.slice(0,labels.length-count-1).join('.')||null:null,isPrivate:Boolean(best?.isPrivate),isIcann:Boolean(best&&!best.isPrivate),rule:best?.asciiRule??'*',knownSuffix:Boolean(best)};
}
export async function parseDomain(input,options={}){
 const host=normalizeDomainInput(input);
 if(host.isIp)return{...host,publicSuffix:null,domain:null,subdomain:null,isPrivate:false,isIcann:false,rule:null,knownSuffix:false};
 const data=await loadITData('domains');return{...host,...matchPublicSuffix(host.hostname,data.records,options)};
}
