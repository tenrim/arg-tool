const DEFAULT_ORIGINS=['https://www.tool.mistarg.cn','https://tool.mistarg.cn'];
const BODY_LIMIT=8192;
export class QueryError extends Error{constructor(status,code,message,retryAfter){super(message);this.status=status;this.code=code;this.retryAfter=retryAfter;}}
export const failure=(status,code,message,retryAfter)=>new QueryError(status,code,message,retryAfter);
export function upstreamCooldown(value,at){
 const header=typeof value==='string'?value.trim():'';
 if(/^\d+$/.test(header)){const until=at+Number(header)*1000;return{until:Math.max(at+1000,until),longRetryAfter:header};}
 const date=header&&/[a-z]{3}/i.test(header)&&/\d{2}:\d{2}:\d{2}/.test(header)?Date.parse(header):NaN;
 return{until:Number.isFinite(date)?Math.max(at+1000,date):at+60000,longRetryAfter:null};
}
export function remainingCooldown(entry,at){
 if(!entry||entry.until<=at)return 0;
 const remaining=entry.until-at;
 return Number.isFinite(remaining)?Math.max(1,Math.ceil(remaining/1000)):entry.longRetryAfter;
}

export function configuredOrigins(env){
  const values=String(env.ONLINE_QUERY_ORIGINS===undefined?DEFAULT_ORIGINS.join(','):env.ONLINE_QUERY_ORIGINS).split(',').map(value=>value.trim());
  if(!values.length||values.some(value=>{try{const url=new URL(value);return !value||value.includes('*')||!['http:','https:'].includes(url.protocol)||url.origin!==value;}catch{return true;}}))return null;
  return new Set(values);
}
export function allowedOrigin(req,origins){
  const origin=req.headers.origin;
  if(typeof origin!=='string')return false;
  if(origins.has(origin))return true;
  const port=req.socket.localPort;
  return Number.isInteger(port)&&[ `http://localhost:${port}`,`http://127.0.0.1:${port}` ].includes(origin);
}
export function reply(res,status,body,retryAfter){
  if(res.destroyed||res.writableEnded)return;
  res.writeHead(status,{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(retryAfter?{'Retry-After':String(retryAfter)}:{}),...(status===405?{Allow:'POST'}:{})});
  res.end(JSON.stringify(body));
}
export function abortable(promise,signal){
  const pending=Promise.resolve(promise);
  // The operation has already started; even an already-aborted caller must
  // observe its eventual rejection, otherwise Node may terminate the service.
  if(signal.aborted){pending.catch(()=>{});return Promise.reject(signal.reason);}
  return new Promise((resolve,reject)=>{
    const abort=()=>{cleanup();reject(signal.reason);},cleanup=()=>signal.removeEventListener('abort',abort);
    signal.addEventListener('abort',abort,{once:true});
    pending.then(value=>{cleanup();resolve(value);},error=>{cleanup();reject(error);});
  });
}
export function readRequest(req,signal){
  if(Number(req.headers['content-length'])>BODY_LIMIT){req.resume();return Promise.reject(failure(413,'REQUEST_TOO_LARGE','查询请求过大。'));}
  return new Promise((resolve,reject)=>{
    let size=0;const chunks=[];
    const cleanup=()=>{req.off('data',data);req.off('end',end);req.off('error',error);signal.removeEventListener('abort',abort);};
    const error=()=>{cleanup();reject(failure(400,'INVALID_REQUEST','无法读取查询请求。'));};
    const abort=()=>{cleanup();req.resume();reject(signal.reason);};
    const data=chunk=>{size+=chunk.length;if(size>BODY_LIMIT){cleanup();req.resume();reject(failure(413,'REQUEST_TOO_LARGE','查询请求过大。'));}else chunks.push(chunk);};
    const end=()=>{cleanup();try{resolve(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks))));}catch{reject(failure(400,'INVALID_JSON','查询请求不是有效的 JSON。'));}};
    req.on('data',data);req.once('end',end);req.once('error',error);signal.addEventListener('abort',abort,{once:true});
    if(signal.aborted)abort();
  });
}
