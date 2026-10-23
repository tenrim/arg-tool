export const QUERY_RESPONSE_LIMIT=8*1024*1024;
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function freezeResult(value,depth=0){if(depth>60)throw Error('资料层级过深，请到原站查看。');if(value&&typeof value==='object'){for(const item of Object.values(value))freezeResult(item,depth+1);Object.freeze(value);}return value;}
const canonical=value=>Array.isArray(value)?value.map(canonical):object(value)?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
export function sourceURL(value,provider){let url;try{url=new URL(value);}catch{throw Error('查询结果来源无效。');}if(url.protocol!=='https:'||url.username||url.password||url.port||!provider.sourceHosts.includes(url.hostname))throw Error('查询结果包含未登记的来源地址。');return url.href;}
export function parseExternalResult(text,provider,expected){
 if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>QUERY_RESPONSE_LIMIT)throw Error('查询结果超过 8 MiB，请缩小范围。');
 let result;try{result=JSON.parse(text);}catch{throw Error('本站未返回查询资料；纯静态托管需要启用后端查询服务。');}
 if(!object(result)||result.provider!==provider.id||!Array.isArray(result.records)||result.records.length>10000||JSON.stringify(canonical(result.submitted))!==JSON.stringify(canonical(expected)))throw Error('查询结果与本次条件不符。');
 if(!object(result.parameters)||typeof result.query!=='string'||!Number.isFinite(Date.parse(result.fetchedAt))||!object(result.attribution)||typeof result.attribution.name!=='string'||typeof result.attribution.credit!=='string'||typeof result.attribution.license!=='string')throw Error('查询资料缺少参数、来源或许可信息。');
 sourceURL(result.sourceURL,provider);if(result.total!==null&&(!Number.isSafeInteger(result.total)||result.total<0))throw Error('查询总数无效。');if(result.next!==null&&!object(result.next))throw Error('查询翻页信息无效。');
 const ids=new Set();for(const record of result.records){if(!object(record)||typeof record.id!=='string'||!record.id||ids.has(record.id)||typeof record.title!=='string'||!object(record.fields))throw Error('查询记录格式无效或重复。');ids.add(record.id);sourceURL(record.sourceURL,provider);if(record.actions!==undefined&&(!Array.isArray(record.actions)||record.actions.length>12||record.actions.some(action=>!object(action)||typeof action.label!=='string'||!object(action.parameters))))throw Error('查询记录的后续动作无效。');}
 return freezeResult(result);
}
export function externalSnapshot(result,record){if(!result.records.includes(record))throw Error('当前记录已失效。');const {records,...context}=result;return freezeResult({...context,record});}
export function externalNote(result,record){const value=externalSnapshot(result,record);return Object.freeze({text:['# '+record.title,'','在线来源：'+result.attribution.name,'原始条目：'+record.sourceURL,'查询：'+result.query,'查询时间：'+result.fetchedAt,'署名：'+result.attribution.credit,'许可：'+result.attribution.license,'','完整返回记录与来源上下文：',JSON.stringify(value,null,2)].join('\n')});}
