import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {PassThrough} from 'node:stream';
import {createServer,request as httpRequest} from 'node:http';
import {createOnlineQueryService} from '../services/online-query/index.mjs';
import {abortable} from '../services/online-query/http.mjs';

test('already-cancelled query still observes the started operation rejection',async()=>{
 const controller=new AbortController(),reason=Error('cancelled');controller.abort(reason);
 let observed=false;
 const operation={then(_resolve,reject){observed=true;reject(Error('late transport rejection'));}};
 await assert.rejects(abortable(operation,controller.signal),error=>error===reason);
 await new Promise(resolve=>setImmediate(resolve));assert.equal(observed,true);
});

const origin='https://tool.test',record={number:45,name:'Fibonacci numbers',data:'0,1,1,2,3,5,8',offset:'0,4',comment:['An unabridged comment.'],formula:['a(n)=a(n-1)+a(n-2).'],link:['<a href="https://example.test/">Source</a>'],reference:['Original reference'],keyword:'nonn,easy',author:'N. J. A. Sloane',created:'1991-04-30',time:'2026-01-01',futureField:{preserved:['exactly',1]}};
const json=value=>new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json'}});
const service=options=>createOnlineQueryService({env:{ONLINE_QUERY_ORIGINS:origin},fetchImpl:async()=>json([record]),minimumIntervalMs:0,perIP:100,...options});
function request(target,{body={query:'1,1,2,3,5,8'},raw,method='POST',path='/api/query/oeis',requestOrigin=origin,contentType='application/json',peer='192.0.2.1',localPort=6142,headers={}}={}){
  const req=new PassThrough();Object.assign(req,{method,url:path,headers:{'content-type':contentType,...(requestOrigin===null?{}:{origin:requestOrigin}),...headers},socket:{remoteAddress:peer,localPort}});
  const res=new EventEmitter();Object.assign(res,{writableEnded:false,destroyed:false,writeHead(status,responseHeaders){this.status=status;this.headers=responseHeaders;},end(data){this.text=data;this.writableEnded=true;}});
  const pending=target.handle(req,res);req.end(raw??JSON.stringify(body));
  return {req,res,pending:pending.then(()=>({status:res.status,headers:res.headers,body:res.text?JSON.parse(res.text):null,text:res.text}))};
}

test('OEIS response keeps full raw records and uses only the fixed JSON search endpoint',async()=>{
  let called;const adapter=service({fetchImpl:async(url,options)=>{called={url:new URL(url),options};return json([record]);},now:()=>1000});
  try{
    const result=await request(adapter,{body:{query:'  a000045  ',start:20}}).pending;
    assert.equal(result.status,200);assert.deepEqual(result.body.records,[record]);
    assert.deepEqual({...result.body,records:undefined},{provider:'oeis',query:'  a000045  ',executedQuery:'id:A000045',start:20,pageSize:10,records:undefined,fetchedAt:'1970-01-01T00:00:01.000Z',sourceURL:called.url.href,nextStart:null,total:null});
    assert.equal(called.url.origin,'https://oeis.org');assert.equal(called.url.pathname,'/search');assert.deepEqual([...called.url.searchParams],[['q','id:A000045'],['start','20'],['fmt','json']]);assert.equal(called.options.redirect,'error');assert.equal(called.options.method,'GET');assert.equal(result.headers['Cache-Control'],'no-store');
    const injected='https://evil.test/?q=x&fmt=html#fragment';await request(adapter,{body:{query:injected}}).pending;
    assert.equal(called.url.origin,'https://oeis.org');assert.equal(called.url.searchParams.get('q'),injected);assert.equal(called.url.searchParams.get('fmt'),'json');
  }finally{adapter.close();}
});

test('OEIS upstream Retry-After remains effective across peers until its real deadline',async()=>{
 for(const header of ['120',new Date(120000).toUTCString(),null]){
  let clock=0,calls=0;const adapter=service({now:()=>clock,fetchImpl:async()=>++calls===1?new Response('limited',{status:429,headers:header?{'Retry-After':header}:{}}):json([])});
  try{
   const first=await request(adapter).pending;assert.equal(first.status,503);assert.equal(first.headers['Retry-After'],header?'120':'60');
   clock=11000;const blocked=await request(adapter,{peer:'192.0.2.2'}).pending;assert.equal(blocked.status,503);assert.equal(blocked.headers['Retry-After'],header?'109':'49');assert.equal(calls,1);
   clock=header?120000:60000;assert.equal((await request(adapter).pending).status,200);assert.equal(calls,2);
  }finally{adapter.close();}
 }
});

test('current and historical OEIS schemas preserve count, empty matches, and bounded pagination',async()=>{
  const cases=[{value:[],length:0,total:null},{value:null,length:0,total:null},{value:{results:null,count:0},length:0,total:0},{value:{results:[record],count:1234},length:1,total:1234},{value:Array.from({length:10},(_,i)=>({...record,number:i+1})),length:10,total:null}];
  for(const {value,length,total}of cases){const adapter=service({fetchImpl:async()=>json(value)});try{const result=await request(adapter).pending;assert.equal(result.status,200);assert.equal(result.body.records.length,length);assert.equal(result.body.total,total);assert.equal(result.body.nextStart,length===10?10:null);}finally{adapter.close();}}
  const adapter=service({fetchImpl:async()=>json(Array.from({length:10},(_,i)=>({...record,number:1000000+i})))});
  try{const result=await request(adapter,{body:{query:'1,2,3',start:10000}}).pending;assert.equal(result.body.nextStart,null);assert.equal(result.body.records[0].number,1000000);}finally{adapter.close();}
});

test('origin is mandatory and exact; local origins use socket port, never Host or forwarded headers',async()=>{
  let calls=0;const adapter=service({fetchImpl:async()=>{calls++;return json([]);}});
  try{
    for(const requestOrigin of[null,'null','https://tool.test.evil.test','https://tool.test/','http://localhost:1234'])assert.equal((await request(adapter,{requestOrigin,headers:{host:'localhost:1234','x-forwarded-host':'tool.test'}}).pending).status,403);
    for(const requestOrigin of[origin,'http://localhost:6142','http://127.0.0.1:6142'])assert.equal((await request(adapter,{requestOrigin}).pending).status,200);
    assert.equal(calls,3);
  }finally{adapter.close();}
  const production=createOnlineQueryService({env:{},fetchImpl:async()=>json([]),minimumIntervalMs:0});
  try{assert.equal((await request(production,{requestOrigin:'https://www.tool.mistarg.cn'}).pending).status,200);assert.equal((await request(production,{requestOrigin:'https://tool.mistarg.cn'}).pending).status,200);}finally{production.close();}
  for(const value of['https://*.tool.test','',' ',`${origin},`,`,${origin}`,`${origin},,https://another.test`]){const invalid=service({env:{ONLINE_QUERY_ORIGINS:value}});try{assert.equal((await request(invalid).pending).status,503);}finally{invalid.close();}}
  const replacement=service();try{assert.equal((await request(replacement,{requestOrigin:'https://www.tool.mistarg.cn'}).pending).status,403);}finally{replacement.close();}
});

test('invalid requests, query controls, unknown proxy fields and oversized bodies never reach OEIS',async()=>{
  let calls=0;const adapter=service({fetchImpl:async()=>{calls++;return json([]);}});
  try{
    for(const body of[null,[],{query:''},{query:'x'.repeat(501)},{query:'1\n2'},{query:'1\u00852'},{query:'1',start:-10},{query:'1',start:1},{query:'1',start:10010},{query:'1',start:null},{query:'1',url:'https://evil.test'},{query:5}])assert.equal((await request(adapter,{body}).pending).status,400);
    assert.equal((await request(adapter,{raw:'{invalid'}).pending).status,400);
    assert.equal((await request(adapter,{raw:' '.repeat(8193)}).pending).status,413);
    assert.equal((await request(adapter,{headers:{'content-length':'8193'}}).pending).status,413);
    assert.equal((await request(adapter,{contentType:'text/plain'}).pending).status,415);
    const method=await request(adapter,{method:'GET'}).pending;assert.equal(method.status,405);assert.equal(method.headers.Allow,'POST');
    for(const path of['/api/query/oeis?url=https://evil.test','/api/query/other'])assert.equal((await request(adapter,{path}).pending).status,404);
    assert.equal(calls,0);
  }finally{adapter.close();}
});

test('upstream HTML, malformed JSON/schema, denial and arbitrary transport errors are explicit safe failures',async()=>{
  const cases=[
    {fetchImpl:async()=>new Response('<html>captcha SECRET_QUERY</html>',{headers:{'Content-Type':'text/html'}}),status:502,code:'INVALID_UPSTREAM_RESPONSE'},
    {fetchImpl:async()=>new Response('not JSON SECRET_QUERY',{headers:{'Content-Type':'application/json'}}),status:502,code:'INVALID_UPSTREAM_RESPONSE'},
    {fetchImpl:async()=>json({message:'unexpected SECRET_QUERY'}),status:502,code:'INVALID_UPSTREAM_RESPONSE'},
    {fetchImpl:async()=>json([{name:'missing number'}]),status:502,code:'INVALID_UPSTREAM_RESPONSE'},
    {fetchImpl:async()=>json(Array.from({length:11},()=>record)),status:502,code:'INVALID_UPSTREAM_RESPONSE'},
    {fetchImpl:async()=>new Response('SECRET_QUERY',{status:429}),status:503,code:'UPSTREAM_RATE_LIMITED'},
    {fetchImpl:async()=>new Response('SECRET_QUERY',{status:403}),status:502,code:'UPSTREAM_UNAVAILABLE'},
    {fetchImpl:async()=>{throw Object.assign(Error('SECRET_QUERY https://evil.test/password'),{status:502,code:'SECRET_QUERY'});},status:502,code:'UPSTREAM_UNAVAILABLE'}
  ];
  for(const entry of cases){let calls=0;const adapter=service({fetchImpl:(...args)=>{calls++;return entry.fetchImpl(...args);}});try{const result=await request(adapter,{body:{query:'SECRET_QUERY'}}).pending;assert.equal(result.status,entry.status);assert.equal(result.body.code,entry.code);assert(!result.text.includes('SECRET_QUERY'));assert.equal(calls,1,'No retries or alternate scraping');if(entry.code==='UPSTREAM_RATE_LIMITED')assert.equal(result.headers['Retry-After'],'60');}finally{adapter.close();}}
});

test('both declared and streamed upstream payloads are bounded and unread streams cancel',async()=>{
  let cancelled=0;
  const adapter=service({fetchImpl:async()=>new Response(new ReadableStream({start(controller){controller.enqueue(new Uint8Array(2*1024*1024+1));},cancel(){cancelled++;}}),{headers:{'Content-Type':'application/json'}})});
  try{const result=await request(adapter).pending;assert.equal(result.status,502);assert.equal(result.body.code,'UPSTREAM_TOO_LARGE');assert.equal(cancelled,1);}finally{adapter.close();}
  const declared=service({fetchImpl:async()=>new Response('[]',{headers:{'Content-Type':'application/json','Content-Length':String(2*1024*1024+1)}})});
  try{assert.equal((await request(declared).pending).body.code,'UPSTREAM_TOO_LARGE');}finally{declared.close();}
});

test('a single global outbound slot prevents concurrent and rapid searches, including across peers',async()=>{
  let clock=0,calls=0,finish;const adapter=service({minimumIntervalMs:10000,now:()=>clock,fetchImpl:async()=>{calls++;return await new Promise(resolve=>{finish=resolve;});}});
  try{
    const first=request(adapter);await new Promise(resolve=>setImmediate(resolve));
    const blocked=await request(adapter,{peer:'192.0.2.2'}).pending;assert.equal(blocked.status,429);assert.equal(blocked.headers['Retry-After'],'10');assert.equal(calls,1);
    finish(json([]));assert.equal((await first.pending).status,200);clock=9999;assert.equal((await request(adapter).pending).headers['Retry-After'],'1');
    clock=10000;const next=request(adapter);await new Promise(resolve=>setImmediate(resolve));finish(json([]));assert.equal((await next.pending).status,200);assert.equal(calls,2);
  }finally{adapter.close();}
});

test('per-peer budgets ignore spoofed forwarding, and client memory capacity expires without evicting live budgets',async()=>{
  let clock=0;const adapter=service({now:()=>clock,perIP:1,maxClients:2,ipWindowMs:60000});
  try{
    assert.equal((await request(adapter).pending).status,200);
    const spoofed=await request(adapter,{headers:{'x-forwarded-for':'192.0.2.99','x-real-ip':'192.0.2.99'}}).pending;assert.equal(spoofed.status,429);assert.equal(spoofed.body.code,'CLIENT_RATE_LIMITED');
    assert.equal((await request(adapter,{peer:'192.0.2.2'}).pending).status,200);
    for(let i=0;i<30;i++)assert.equal((await request(adapter,{peer:`198.51.100.${i}`}).pending).body.code,'QUERY_BUSY');
    assert.equal((await request(adapter).pending).status,429,'New peers cannot evict another live budget');
    clock=60000;assert.equal((await request(adapter,{peer:'192.0.2.3'}).pending).status,200);assert.equal((await request(adapter).pending).status,200);
  }finally{adapter.close();}
});

test('timeout, browser disconnect and service close abort outbound work; close is idempotent',async()=>{
  let timeoutSignal;const timeout=service({upstreamTimeoutMs:10,fetchImpl:(_url,{signal})=>{timeoutSignal=signal;return new Promise(()=>{});}});
  try{const pending=request(timeout).pending;await new Promise(resolve=>setTimeout(resolve,25));const result=await pending;assert.equal(result.status,504);assert.equal(result.body.code,'QUERY_TIMEOUT');assert(timeoutSignal.aborted);}finally{timeout.close();}
  for(const mode of['disconnect','close']){
    let signal;const adapter=service({fetchImpl:(_url,options)=>{signal=options.signal;return new Promise(()=>{});}}),call=request(adapter);
    await new Promise(resolve=>setImmediate(resolve));
    if(mode==='disconnect'){call.res.destroyed=true;call.res.emit('close');}else adapter.close();
    await call.pending;assert(signal.aborted);if(mode==='close')assert.equal(call.res.status,503);adapter.close();adapter.close();
    assert.equal((await request(adapter).pending).status,503);
  }
});

test('timeout also bounds stalled response streams rather than only the initial fetch',async()=>{
  let cancelled=false;const adapter=service({upstreamTimeoutMs:10,fetchImpl:async()=>new Response(new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('['));},cancel(){cancelled=true;}}),{headers:{'Content-Type':'application/json'}})});
  try{const pending=request(adapter).pending;await new Promise(resolve=>setTimeout(resolve,25));assert.equal((await pending).body.code,'QUERY_TIMEOUT');assert(cancelled);}finally{adapter.close();}
});

test('actual HTTP request and UTF-8 response use the same bounded handler without SMTP setup',async()=>{
  const adapter=service({env:{ONLINE_QUERY_ORIGINS:origin},fetchImpl:async()=>json([{...record,name:'中文说明'}])}),server=createServer((req,res)=>adapter.handle(req,res));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{const response=await fetch(`http://127.0.0.1:${server.address().port}/api/query/oeis`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({query:'1,1,2,3,5'})});assert.equal(response.status,200);assert.equal((await response.json()).records[0].name,'中文说明');}finally{adapter.close();await new Promise(resolve=>server.close(resolve));}
});

test('concurrent unfinished HTTP bodies have bounded admission; completed input frees slots and close drains pending work',async()=>{
  let entered=0,resolveEntered,calls=0;
  const adapter=service({maxActiveRequests:2,upstreamTimeoutMs:100,fetchImpl:async()=>{calls++;return json([]);}});
  const server=createServer((req,res)=>{const pending=adapter.handle(req,res);entered++;resolveEntered?.();return pending;});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const pending=[];
  function slow(){
    const req=httpRequest({hostname:'127.0.0.1',port:server.address().port,path:'/api/query/oeis',method:'POST',headers:{Origin:origin,'Content-Type':'application/json','Transfer-Encoding':'chunked'}});
    const received=new Promise((resolve,reject)=>{req.once('response',res=>{let text='';res.setEncoding('utf8');res.on('data',chunk=>{text+=chunk;});res.once('end',()=>resolve({status:res.statusCode,body:JSON.parse(text)}));});req.once('error',reject);});
    // Supply a partial JSON body, with neither end-of-stream nor an upstream request.
    req.write('{"query":');pending.push(req);return {req,received};
  }
  const waitEntered=async count=>{while(entered<count)await new Promise(resolve=>{resolveEntered=resolve;});resolveEntered=null;};
  try{
    const a=slow();await waitEntered(1);const b=slow();await waitEntered(2);
    const overflow=await fetch(`http://127.0.0.1:${server.address().port}/api/query/oeis`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({query:'1,2,3'})});
    assert.equal(overflow.status,503);assert.equal((await overflow.json()).code,'QUERY_BUSY');assert.equal(calls,0);
    // Completing a failed input releases admission without consuming an OEIS slot.
    a.req.end('invalid}');assert.equal((await a.received).status,400);
    const c=slow();await waitEntered(4);adapter.close();adapter.close();
    assert.equal((await b.received).body.code,'QUERY_UNAVAILABLE');assert.equal((await c.received).body.code,'QUERY_UNAVAILABLE');assert.equal(calls,0);
    assert.equal((await request(adapter).pending).status,503);
  }finally{adapter.close();for(const req of pending)req.destroy();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
