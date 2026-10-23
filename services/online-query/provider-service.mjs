import {failure,configuredOrigins,allowedOrigin,reply,abortable,readRequest,upstreamCooldown,remainingCooldown} from './http.mjs';
import {SCIENCE_PROVIDERS} from './providers/science.mjs';
import {LANGUAGE_PROVIDERS} from './providers/language.mjs';
import {PLACE_PROVIDERS} from './providers/places.mjs';

export const QUERY_PROVIDERS=Object.freeze([...SCIENCE_PROVIDERS,...LANGUAGE_PROVIDERS,...PLACE_PROVIDERS]);
const MAX_BYTES=8*1024*1024,USER_AGENT='MistToolbox/0.9.2 (+https://www.tool.mistarg.cn/)';
async function readText(response,signal){
 if(Number(response.headers.get('content-length'))>MAX_BYTES){response.body?.cancel().catch(()=>{});throw failure(502,'UPSTREAM_TOO_LARGE','原站返回超过 8 MiB，请缩小查询范围或前往原站。');}
 if(!response.body)throw failure(502,'INVALID_UPSTREAM_RESPONSE','原站没有返回可读取的资料。');
 const reader=response.body.getReader(),chunks=[];let size=0,done=false;
 try{for(;;){const item=await abortable(reader.read(),signal);if(item.done){done=true;break;}size+=item.value.byteLength;if(size>MAX_BYTES)throw failure(502,'UPSTREAM_TOO_LARGE','原站返回超过 8 MiB，请缩小查询范围或前往原站。');chunks.push(item.value);}return new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks));}
 finally{if(!done)reader.cancel().catch(()=>{});try{reader.releaseLock();}catch{}}
}
export function createProviderQueryService({env=process.env,fetchImpl=globalThis.fetch,now=Date.now,origins=configuredOrigins(env),upstreamTimeoutMs=15000,maxClients=1024,maxActiveRequests=16,activeRequests,providers=QUERY_PROVIDERS}={}){
 const registry=new Map(providers.map(provider=>[provider.id,provider])),active=activeRequests??new Set(),clients=new Map(),last=new Map(),blockedUntil=new Map();let closed=false;
 function sourceCooldown(id){
  const entry=blockedUntil.get(id);if(!entry)return;
  const seconds=remainingCooldown(entry,now());if(!seconds){blockedUntil.delete(id);return;}
  // A provider-wide upstream refusal outlives a browser request. Never shorten
  // Retry-After to the site's ordinary spacing or a one-hour display cap.
  throw failure(503,'UPSTREAM_RATE_LIMITED','原站暂时限流，请按提示稍后重试。',seconds);
 }
 function takeClient(req,id){const time=now();for(const[key,value]of clients)if(time-value.time>=60000)clients.delete(key);const key=id+'|'+(req.socket.remoteAddress||'unknown'),item=clients.get(key);if(item?.count>=10)throw failure(429,'CLIENT_RATE_LIMITED','查询过于频繁，请稍后再试。',Math.max(1,Math.ceil((60000-(time-item.time))/1000)));if(!item&&clients.size>=maxClients)throw failure(503,'QUERY_BUSY','查询服务繁忙，请稍后重试。',60);if(item)item.count++;else clients.set(key,{time,count:1});}
 async function request(provider,url,options,signal,budget){
  let target;try{target=new URL(url);}catch{throw failure(500,'INVALID_PROVIDER_TARGET','查询适配器目标配置无效。');}
  if(target.protocol!=='https:'||target.port||target.username||target.password||!provider.allowedHosts.includes(target.hostname))throw failure(500,'INVALID_PROVIDER_TARGET','查询适配器拒绝未登记的请求目标。');
  if(++budget.calls>8)throw failure(502,'UPSTREAM_REQUEST_LIMIT','本次查询需要过多子请求，请缩小范围或前往原站。');
  sourceCooldown(provider.id);
  const at=now(),scheduled=Math.max(at,(last.get(provider.id)??-Infinity)+(provider.minimumIntervalMs??1000)),wait=scheduled-at;
  if(wait>0&&budget.calls===1)throw failure(429,'QUERY_RATE_LIMITED','为遵守原站访问节奏，请稍后再查询。',Math.max(1,Math.ceil(wait/1000)));
  const method=options?.method??'GET';if(!['GET','POST'].includes(method))throw failure(500,'INVALID_PROVIDER_METHOD','查询适配器方法无效。');
  const headers={'User-Agent':USER_AGENT,Accept:'application/json,text/plain;q=0.9'};
  for(const[key,value]of new Headers(options?.headers||{})){if(!['accept','content-type','accept-language'].includes(key))throw failure(500,'INVALID_PROVIDER_HEADERS','查询适配器不能转发凭据或任意请求头。');headers[key]=value;}
  if(signal.aborted)throw signal.reason;last.set(provider.id,scheduled);
  if(wait>0){let timer;try{await abortable(new Promise(resolve=>{timer=setTimeout(resolve,wait);}),signal);}finally{clearTimeout(timer);}}
  // Another in-flight request can receive 429 while this necessary follow-up
  // waits for ordinary spacing. Re-check immediately before any new outbound.
  if(signal.aborted)throw signal.reason;sourceCooldown(provider.id);
  const response=await abortable(fetchImpl(target.href,{method,headers,body:options?.body,redirect:'error',signal,credentials:'omit',cache:'no-store'}),signal);
  if(response.status===429){response.body?.cancel().catch(()=>{});const next=upstreamCooldown(response.headers.get('retry-after'),now()),previous=blockedUntil.get(provider.id);if(!previous||next.until>previous.until)blockedUntil.set(provider.id,next);sourceCooldown(provider.id);}
  const text=await readText(response,signal);budget.bytes+=Buffer.byteLength(text);if(budget.bytes>MAX_BYTES)throw failure(502,'UPSTREAM_TOO_LARGE','本次查询累计结果超过 8 MiB，请缩小范围。');
  return{response,text};
 }
 return{async handle(req,res){
  const match=/^\/api\/query\/([a-z]+)$/.exec(req.url||''),provider=match&&registry.get(match[1]);
  if(!provider)return reply(res,404,{code:'NOT_FOUND',message:'没有这个查询接口。'});
  if(req.method!=='POST')return reply(res,405,{code:'METHOD_NOT_ALLOWED',message:'请使用查询表单提交请求。'});
  if(closed||!origins)return reply(res,503,{code:'QUERY_UNAVAILABLE',message:'联网查询服务尚未就绪，请前往原站查询。'});
  if(!allowedOrigin(req,origins))return reply(res,403,{code:'ORIGIN_NOT_ALLOWED',message:'请求来源未获允许。'});
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))return reply(res,415,{code:'JSON_REQUIRED',message:'查询请求需要 JSON。'});
  if(active.size>=maxActiveRequests)return reply(res,503,{code:'QUERY_BUSY',message:'查询服务繁忙，请稍后重试。'},1);
  const controller=new AbortController(),{signal}=controller,disconnect=()=>{if(!res.writableEnded)controller.abort(failure(499,'CLIENT_CLOSED','查询已取消。'));};
  req.once('aborted',disconnect);res.once('close',disconnect);active.add(controller);
  const timer=setTimeout(()=>controller.abort(failure(504,'QUERY_TIMEOUT','原站查询超时，请手动重试或前往原站。')),Math.min(30000,provider.timeoutMs??upstreamTimeoutMs));timer.unref?.();
  try{const input=await readRequest(req,signal),parameters=provider.validate(input);takeClient(req,provider.id);if(provider.requiresAcknowledgement&&env[provider.requiresAcknowledgement]!=='1')throw failure(503,'PROVIDER_NOT_ENABLED','此服务需要维护者配置使用条件后才能启用。');
   const budget={calls:0,bytes:0},result=await provider.execute(parameters,{signal,now,request:(url,options)=>request(provider,url,options,signal,budget)});
   if(signal.aborted)throw signal.reason;if(result?.provider!==provider.id||!Array.isArray(result.records))throw failure(502,'INVALID_UPSTREAM_RESPONSE','原站返回格式与当前适配器不符。');
   const body={...result,request:parameters,submitted:input,fetchedAt:new Date(now()).toISOString()};if(Buffer.byteLength(JSON.stringify(body))>MAX_BYTES)throw failure(502,'UPSTREAM_TOO_LARGE','完整查询结果超过 8 MiB，请缩小范围。');reply(res,200,body);
  }catch(error){const selected=signal.aborted?signal.reason:error,safe=selected&&Number.isInteger(selected.status)&&selected.status>=400&&selected.status<=599?selected:failure(502,'UPSTREAM_UNAVAILABLE','原站暂时不可用或未返回可读取资料，请稍后手动重试或前往原站。');reply(res,safe.status,{code:safe.code||'QUERY_FAILED',message:safe.message},safe.retryAfter);}
  finally{clearTimeout(timer);active.delete(controller);req.off('aborted',disconnect);res.off('close',disconnect);}
 },close(){if(closed)return;closed=true;for(const controller of active)controller.abort(failure(503,'QUERY_UNAVAILABLE','联网查询服务正在关闭。'));active.clear();clients.clear();last.clear();blockedUntil.clear();}};
}
