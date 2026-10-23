import {QueryError,failure,configuredOrigins,allowedOrigin,reply,abortable,readRequest,upstreamCooldown,remainingCooldown} from './http.mjs';
import {createProviderQueryService} from './provider-service.mjs';
const PATH='/api/query/oeis',RESPONSE_LIMIT=2*1024*1024;
const unavailable=()=>failure(502,'UPSTREAM_UNAVAILABLE','OEIS 暂时无法连接，请稍后重试或前往原站查询。');
function validateRequest(input){
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>!['query','start'].includes(key))||typeof input.query!=='string'||!input.query.trim()||input.query.length>500||/\p{Cc}/u.test(input.query))throw failure(400,'INVALID_QUERY','请输入 1–500 字的数列或 OEIS 编号，不能包含控制字符。');
  const start=Object.hasOwn(input,'start')?input.start:0;
  if(!Number.isInteger(start)||start<0||start>10000||start%10)throw failure(400,'INVALID_START','查询页码不正确。');
  const query=input.query,trimmed=query.trim(),executedQuery=/^A\d{6}$/i.test(trimmed)?`id:${trimmed.toUpperCase()}`:trimmed;
  return {query,executedQuery,start};
}
async function readUpstream(response,signal){
  if(!response||!response.ok){response?.body?.cancel().catch(()=>{});throw unavailable();}
  if(!/^application\/(?:[\w.-]+\+)?json(?:\s*;|$)/i.test(response.headers.get('content-type')||'')){response.body?.cancel().catch(()=>{});throw failure(502,'INVALID_UPSTREAM_RESPONSE','OEIS 未返回可读取的查询数据，请稍后重试或前往原站查询。');}
  if(Number(response.headers.get('content-length'))>RESPONSE_LIMIT){response.body?.cancel().catch(()=>{});throw failure(502,'UPSTREAM_TOO_LARGE','OEIS 返回的数据过大，请缩小查询范围或前往原站查询。');}
  if(!response.body)throw failure(502,'INVALID_UPSTREAM_RESPONSE','OEIS 未返回可读取的查询数据，请稍后重试或前往原站查询。');
  const reader=response.body.getReader(),chunks=[];let size=0,complete=false;
  try{
    while(true){const {done,value}=await abortable(reader.read(),signal);if(done){complete=true;break;}size+=value.byteLength;if(size>RESPONSE_LIMIT)throw failure(502,'UPSTREAM_TOO_LARGE','OEIS 返回的数据过大，请缩小查询范围或前往原站查询。');chunks.push(value);}
    let value;try{value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));}catch{throw failure(502,'INVALID_UPSTREAM_RESPONSE','OEIS 返回的数据格式不正确，请稍后重试或前往原站查询。');}
    const records=value===null?[]:Array.isArray(value)?value:value&&typeof value==='object'&&Object.hasOwn(value,'results')?value.results===null?[]:value.results:null;
    if(!Array.isArray(records)||records.length>10||records.some(record=>!record||typeof record!=='object'||Array.isArray(record)||!Number.isSafeInteger(record.number)||record.number<1))throw failure(502,'INVALID_UPSTREAM_RESPONSE','OEIS 返回的数据格式不正确，请稍后重试或前往原站查询。');
    const total=!Array.isArray(value)&&Number.isSafeInteger(value?.count)&&value.count>=0?value.count:null;
    return {records,total};
  }finally{if(!complete)reader.cancel().catch(()=>{});try{reader.releaseLock();}catch{/* Pending reads are cancelled above. */}}
}

export function createOnlineQueryService({env=process.env,fetchImpl=globalThis.fetch,now=Date.now,upstreamTimeoutMs=15000,minimumIntervalMs=10000,perIP=3,ipWindowMs=60000,maxClients=1024,maxActiveRequests=16}={}){
  const origins=configuredOrigins(env),clients=new Map(),active=new Set();let closed=false,lastOutbound=-Infinity,cooldown=null;
  const providers=createProviderQueryService({env,fetchImpl,now,origins,upstreamTimeoutMs,maxClients,maxActiveRequests,activeRequests:active});
  function takeRate(req){
    const retryAfter=remainingCooldown(cooldown,now());if(retryAfter)throw failure(503,'UPSTREAM_RATE_LIMITED','OEIS 当前请求较多，请稍后再试。',retryAfter);
    const at=now();for(const [key,rate] of clients)if(at-rate.at>=ipWindowMs)clients.delete(key);
    const key=req.socket.remoteAddress||'unknown',rate=clients.get(key);
    if(rate?.count>=perIP)throw failure(429,'CLIENT_RATE_LIMITED','查询过于频繁，请稍后再试。',Math.max(1,Math.ceil((ipWindowMs-(at-rate.at))/1000)));
    if(!rate&&clients.size>=maxClients)throw failure(503,'QUERY_BUSY','查询服务当前较忙，请稍后再试。',Math.max(1,Math.ceil(ipWindowMs/1000)));
    const wait=minimumIntervalMs-(at-lastOutbound);
    if(wait>0)throw failure(429,'QUERY_RATE_LIMITED','为减少 OEIS 的访问负担，请稍后再查询。',Math.max(1,Math.ceil(wait/1000)));
    if(rate)rate.count++;else clients.set(key,{at,count:1});lastOutbound=at;
  }
  return {
    async handle(req,res){
      if(req.url!==PATH)return providers.handle(req,res);
      if(req.method!=='POST')return reply(res,405,{code:'METHOD_NOT_ALLOWED',message:'请使用查询表单提交请求。'});
      if(closed||!origins)return reply(res,503,{code:'QUERY_UNAVAILABLE',message:'联网查询服务尚未就绪，请稍后重试或前往原站查询。'});
      if(!allowedOrigin(req,origins))return reply(res,403,{code:'ORIGIN_NOT_ALLOWED',message:'请求来源未获允许。'});
      if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))return reply(res,415,{code:'JSON_REQUIRED',message:'查询请求需要使用 JSON。'});
      if(active.size>=maxActiveRequests)return reply(res,503,{code:'QUERY_BUSY',message:'查询服务当前较忙，请稍后再试。'},1);
      const controller=new AbortController(),{signal}=controller;
      const disconnected=()=>{if(!res.writableEnded)controller.abort(failure(499,'CLIENT_CLOSED','查询已取消。'));};
      req.once('aborted',disconnected);res.once('close',disconnected);active.add(controller);
      const timer=setTimeout(()=>controller.abort(failure(504,'QUERY_TIMEOUT','OEIS 查询超时，请稍后重试或前往原站查询。')),upstreamTimeoutMs);timer.unref?.();
      try{
        const {query,executedQuery,start}=validateRequest(await readRequest(req,signal));takeRate(req);
        const url=new URL('https://oeis.org/search');url.searchParams.set('q',executedQuery);url.searchParams.set('start',String(start));url.searchParams.set('fmt','json');
        const response=await abortable(fetchImpl(url.href,{method:'GET',headers:{Accept:'application/json','User-Agent':'MistToolbox (+https://www.tool.mistarg.cn/)'},redirect:'error',signal}),signal);
        if(response?.status===429){response.body?.cancel().catch(()=>{});const next=upstreamCooldown(response.headers.get('retry-after'),now());if(!cooldown||next.until>cooldown.until)cooldown=next;throw failure(503,'UPSTREAM_RATE_LIMITED','OEIS 当前请求较多，请稍后再试。',remainingCooldown(cooldown,now()));}
        const {records,total}=await readUpstream(response,signal);
        if(signal.aborted)throw signal.reason;
        reply(res,200,{provider:'oeis',query,executedQuery,start,pageSize:10,records,fetchedAt:new Date(now()).toISOString(),sourceURL:url.href,nextStart:records.length===10&&start<10000?start+10:null,total});
      }catch(error){const safe=signal.aborted?signal.reason:error instanceof QueryError?error:unavailable();reply(res,safe.status||502,{code:safe.code||'UPSTREAM_UNAVAILABLE',message:safe.message||'OEIS 暂时不可用。'},safe.retryAfter);}
      finally{clearTimeout(timer);req.off('aborted',disconnected);res.off('close',disconnected);active.delete(controller);}
    },
    close(){if(closed)return;closed=true;providers.close();for(const controller of active)controller.abort(failure(503,'QUERY_UNAVAILABLE','联网查询服务正在关闭，请稍后重试。'));active.clear();clients.clear();}
  };
}
