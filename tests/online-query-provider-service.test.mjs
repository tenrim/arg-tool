import test from 'node:test';
import assert from 'node:assert/strict';
import {PassThrough} from 'node:stream';
import {EventEmitter} from 'node:events';
import {createProviderQueryService,QUERY_PROVIDERS} from '../services/online-query/provider-service.mjs';
const origin='https://tool.test';
const provider=(id,extra={})=>({id,title:id,allowedHosts:['api.test'],minimumIntervalMs:0,validate(input){if(!input||typeof input.query!=='string'||Object.keys(input).some(key=>key!=='query'))throw Object.assign(Error('只接受查询词'),{status:400,code:'INVALID_QUERY'});return input;},async execute(p,ctx){const {text}=await ctx.request('https://api.test/read?q='+encodeURIComponent(p.query));return{provider:id,query:p.query,parameters:p,records:[{id:'1',title:'Record',fields:JSON.parse(text),sourceURL:'https://api.test/item/1'}],total:1,next:null,attribution:{name:id,credit:'Author',license:'Terms'},sourceURL:'https://api.test/read'};},...extra});
function request(service,{body={query:'clue'},path='/api/query/a',requestOrigin=origin,method='POST',headers={}}={}){const req=new PassThrough();Object.assign(req,{url:path,method,headers:{origin:requestOrigin,'content-type':'application/json',...headers},socket:{remoteAddress:'192.0.2.1',localPort:6142}});const res=new EventEmitter();Object.assign(res,{writableEnded:false,destroyed:false,writeHead(status,headers){this.status=status;this.headers=headers;},end(body){this.writableEnded=true;this.body=JSON.parse(body);}});const done=service.handle(req,res);req.end(JSON.stringify(body));return{req,res,done:done.then(()=>res)};}
const service=options=>createProviderQueryService({env:{ONLINE_QUERY_ORIGINS:origin},providers:[provider('a')],fetchImpl:async()=>new Response('{"complete":{"all":[1,null,"text"]}}'),...options});
test('exactly eight registered providers extend the existing API with independent contracts',()=>{assert.deepEqual(new Set(QUERY_PROVIDERS.map(p=>p.id)),new Set(['simbad','vizier','cod','pubchem','zdic','cnkgraph','pokewiki','placenames']));assert.equal(new Set(QUERY_PROVIDERS.map(p=>p.id)).size,8);});
test('server preserves submitted parameters and full records, strips all browser credentials and refuses redirects',async()=>{let outbound;const s=service({fetchImpl:async(url,options)=>{outbound={url,options};return new Response('{"unknown":{"all":[1,null,"text"]}}');}});try{const r=await request(s,{body:{query:'https://evil.test/?x=1'},headers:{cookie:'secret','x-forwarded-for':'198.51.100.2'}}).done;assert.equal(r.status,200);assert.equal(new URL(outbound.url).hostname,'api.test');assert.equal(new URL(outbound.url).searchParams.get('q'),'https://evil.test/?x=1');assert.equal(outbound.options.redirect,'error');assert.equal(outbound.options.credentials,'omit');assert.equal(new Headers(outbound.options.headers).has('cookie'),false);assert.deepEqual(r.body.submitted,{query:'https://evil.test/?x=1'});assert.deepEqual(r.body.records[0].fields,{unknown:{all:[1,null,'text']}});assert.equal(r.headers['Cache-Control'],'no-store');}finally{s.close();}});
test('unknown routes, foreign origin and arbitrary user URL fields never cause an outbound request',async()=>{let calls=0;const s=service({fetchImpl:async()=>{calls++;return new Response('{}');}});try{assert.equal((await request(s,{path:'/api/query/a?url=https://evil.test'}).done).status,404);assert.equal((await request(s,{path:'/api/query/missing'}).done).status,404);assert.equal((await request(s,{requestOrigin:'https://tool.test.evil'}).done).status,403);assert.equal((await request(s,{body:{query:'x',url:'https://evil.test'}}).done).status,400);assert.equal(calls,0);}finally{s.close();}});
test('adapter cannot target a private host or send auth headers even if its code is mistaken',async()=>{for(const extra of[{async execute(p,ctx){await ctx.request('https://evil.test/');}},{async execute(p,ctx){await ctx.request('https://api.test/x',{headers:{Cookie:'secret'}});}}]){let calls=0;const s=service({providers:[provider('a',extra)],fetchImpl:async()=>{calls++;return new Response('{}');}});try{const r=await request(s).done;assert.equal(r.status,500);assert.equal(calls,0);}finally{s.close();}}});
test('limits belong to each source, including the 500-second Wiki policy',async()=>{let clock=0,calls=0;const s=service({providers:[provider('a',{minimumIntervalMs:500000}),provider('b',{minimumIntervalMs:1000})],now:()=>clock,fetchImpl:async()=>{calls++;return new Response('{}');}});try{assert.equal((await request(s).done).status,200);const limited=await request(s).done;assert.equal(limited.status,429);assert.equal(limited.headers['Retry-After'],'500');assert.equal((await request(s,{path:'/api/query/b'}).done).status,200);clock=500000;assert.equal((await request(s).done).status,200);assert.equal(calls,3);}finally{s.close();}});

test('upstream 120-second refusal blocks the entire source, not just the triggering browser response',async()=>{
 let clock=0;const outbound=[];const s=service({providers:[provider('a',{minimumIntervalMs:300}),provider('b')],now:()=>clock,fetchImpl:async(url)=>{const query=new URL(url).searchParams.get('q');outbound.push(query);return outbound.length===1?new Response('',{status:429,headers:{'Retry-After':'120'}}):new Response('{}');}});
 try{
  const first=await request(s).done;assert.equal(first.status,503);assert.equal(first.body.code,'UPSTREAM_RATE_LIMITED');assert.equal(first.headers['Retry-After'],'120');
  clock=300;const stillBlocked=await request(s).done;assert.equal(stillBlocked.status,503);assert.equal(stillBlocked.headers['Retry-After'],'120');assert.equal(outbound.length,1,'normal 300ms spacing cannot reopen a source under 120s cooldown');
  assert.equal((await request(s,{path:'/api/query/b',body:{query:'other source'}}).done).status,200);assert.equal(outbound.length,2,'another source remains independent');
  clock=119999;const lastMillisecond=await request(s).done;assert.equal(lastMillisecond.status,503);assert.equal(lastMillisecond.headers['Retry-After'],'1');assert.equal(outbound.length,2);
  clock=120000;assert.equal((await request(s).done).status,200);assert.equal(outbound.length,3,'only the full deadline reopens the source');
 }finally{s.close();}
});

test('Retry-After supports HTTP dates and preserves waits longer than one hour',async()=>{
 const epoch=Date.UTC(2026,9,17,4,0,0);
 for(const header of [new Date(epoch+120000).toUTCString(),'7200']){
  let clock=epoch,calls=0;const seconds=header==='7200'?7200:120,s=service({now:()=>clock,fetchImpl:async()=>{calls++;return calls===1?new Response('',{status:429,headers:{'Retry-After':header}}):new Response('{}');}});
  try{const first=await request(s).done;assert.equal(first.headers['Retry-After'],String(seconds));clock=epoch+seconds*1000-1;const blocked=await request(s).done;assert.equal(blocked.status,503);assert.equal(blocked.headers['Retry-After'],'1');assert.equal(calls,1);clock++;assert.equal((await request(s).done).status,200);assert.equal(calls,2);}finally{s.close();}
 }
});

test('invalid Retry-After uses a shared safe fallback instead of reopening on the next request',async()=>{
 for(const header of ['not a date','1.5','']){let clock=0,calls=0;const s=service({now:()=>clock,fetchImpl:async()=>{calls++;return new Response('',{status:429,headers:header?{'Retry-After':header}:{}});}});try{assert.equal((await request(s).done).headers['Retry-After'],'60');clock=1000;assert.equal((await request(s).done).headers['Retry-After'],'59');assert.equal(calls,1);}finally{s.close();}}
});

test('a caught 429 cannot be bypassed by a necessary child request in the same query',async()=>{
 let calls=0;const s=service({providers:[provider('a',{async execute(p,ctx){try{await ctx.request('https://api.test/first');}catch(error){assert.equal(error.code,'UPSTREAM_RATE_LIMITED');}await ctx.request('https://api.test/follow-up');throw Error('Child request escaped cooldown');}})],fetchImpl:async()=>{calls++;return new Response('',{status:429,headers:{'Retry-After':'120'}});}});
 try{const r=await request(s).done;assert.equal(r.status,503);assert.equal(r.body.code,'UPSTREAM_RATE_LIMITED');assert.equal(r.headers['Retry-After'],'120');assert.equal(calls,1);}finally{s.close();}
});

test('a child already waiting for ordinary spacing rechecks a concurrent source refusal before outbound',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});let clock=0,firstReady,limitedReady,firstResolve,limitedResolve,childQueued;const initial=new Promise(resolve=>firstReady=resolve),limited=new Promise(resolve=>limitedReady=resolve),queued=new Promise(resolve=>childQueued=resolve),outbound=[];
 const s=service({now:()=>clock,providers:[provider('a',{minimumIntervalMs:100,async execute(p,ctx){if(p.query==='workflow'){await ctx.request('https://api.test/initial');const child=ctx.request('https://api.test/follow-up');childQueued();await child;}else await ctx.request('https://api.test/limited');return{provider:'a',records:[]};}})],fetchImpl:async(url)=>{outbound.push(url);if(url.endsWith('/initial')){firstReady();return new Promise(resolve=>firstResolve=resolve);}if(url.endsWith('/limited')){limitedReady();return new Promise(resolve=>limitedResolve=resolve);}return new Response('{}');}});
 try{
  const workflow=request(s,{body:{query:'workflow'}});await initial;clock=100;const other=request(s);await limited;
  firstResolve(new Response('{}'));await queued;limitedResolve(new Response('',{status:429,headers:{'Retry-After':'120'}}));assert.equal((await other.done).status,503);
  clock=200;t.mock.timers.tick(100);const blocked=await workflow.done;assert.equal(blocked.status,503);assert.equal(blocked.body.code,'UPSTREAM_RATE_LIMITED');assert.equal(blocked.headers['Retry-After'],'120');assert.equal(outbound.length,2);assert.ok(!outbound.some(url=>url.endsWith('/follow-up')),'queued child never goes upstream during the new cooldown');
 }finally{s.close();t.mock.timers.reset();}
});

test('disconnect and close cancel a spacing wait without issuing its child request',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 try{for(const action of ['disconnect','close']){
  let calls=0,queued;const ready=new Promise(resolve=>queued=resolve),s=service({now:()=>0,providers:[provider('a',{minimumIntervalMs:100,async execute(p,ctx){await ctx.request('https://api.test/initial');const child=ctx.request('https://api.test/follow-up');queued();await child;return{provider:'a',records:[]};}})],fetchImpl:async()=>{calls++;return new Response('{}');}});
  try{const pending=request(s);await ready;if(action==='close')s.close();else pending.res.emit('close');const r=await pending.done;assert.equal(r.status,action==='close'?503:499);t.mock.timers.tick(1000);assert.equal(calls,1);}finally{s.close();}
 }}finally{t.mock.timers.reset();}
});
test('disconnect, timeout and close abort pending source work; transport errors do not leak internal details',async()=>{for(const action of['disconnect','timeout','close']){let received,started;const ready=new Promise(r=>started=r);const s=service({upstreamTimeoutMs:30,fetchImpl:async(url,{signal})=>{received=signal;started();return new Promise(()=>{});}});const keepAlive=setTimeout(()=>{},1000);try{const pending=request(s);await ready;if(action==='disconnect')pending.res.emit('close');if(action==='close')s.close();const r=await pending.done;assert.ok(received.aborted);assert.equal(r.status,action==='disconnect'?499:action==='timeout'?504:503);}finally{clearTimeout(keepAlive);s.close();}}
 const s=service({fetchImpl:async()=>{throw Error('SECRET_TOKEN file path');}});try{const r=await request(s).done;assert.equal(r.status,502);assert.ok(!r.body.message.includes('SECRET'));}finally{s.close();}});
test('oversized and endlessly streaming sources are bounded and cancelled',async()=>{let cancelled=false;const s=service({fetchImpl:async()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(8*1024*1024+1));},cancel(){cancelled=true;}}))});try{const r=await request(s).done;assert.equal(r.status,502);assert.equal(r.body.code,'UPSTREAM_TOO_LARGE');assert.ok(cancelled);}finally{s.close();}});
test('OEIS and new provider lanes share admission instead of doubling the global active limit',async()=>{const otherLane=new AbortController(),activeRequests=new Set([otherLane]);let calls=0;const s=service({activeRequests,maxActiveRequests:1,fetchImpl:async()=>{calls++;return new Response('{}');}});try{assert.equal((await request(s).done).status,503);assert.equal(calls,0);activeRequests.delete(otherLane);assert.equal((await request(s).done).status,200);}finally{s.close();}});
