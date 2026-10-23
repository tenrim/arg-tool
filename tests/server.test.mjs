import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {request} from 'node:http';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import * as fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {gunzipSync} from 'node:zlib';
import {createDevServer,closeDevServer} from '../scripts/server.mjs';
import {createOnlineQueryService} from '../services/online-query/index.mjs';

test('static failures before response commit cannot crash the site or expose symlink targets',async()=>{
 const temporary=await fs.mkdtemp(join(tmpdir(),'mist-static-')),root=join(temporary,'public'),outside=join(temporary,'private');
 await fs.mkdir(root);await fs.mkdir(outside);await fs.writeFile(join(root,'ok.txt'),'ok');await fs.writeFile(join(root,'fail.txt'),'unreadable');await fs.writeFile(join(outside,'secret.txt'),'PRIVATE');
 await fs.symlink(outside,join(root,'linked'),process.platform==='win32'?'junction':'dir');
 const server=createDevServer({staticRoot:root,fileSystem:{...fs,readFile:async path=>{if(path===resolve(root,'fail.txt'))throw Error('simulated read failure after stat');return fs.readFile(path);}},feedbackStarter:async()=>({url:null,close:async()=>{}})});
 server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
 try{
  for(const path of ['/fail.txt','/linked/secret.txt','/%ZZ']){const response=await fetch(base+path);assert.equal(response.status,404);assert.equal(await response.text(),'Not found');}
  const ok=await fetch(base+'/ok.txt');assert.equal(ok.status,200);assert.equal(await ok.text(),'ok');
  assert.equal((await fetch(base+'/ok.txt',{method:'POST'})).status,405);
 }finally{await closeDevServer(server);await fs.rm(temporary,{recursive:true,force:true});}
});

test('public feedback proxy limits pending startup submissions and releases them on shutdown',async()=>{
 let ready;const mail=new Promise(resolve=>{ready=resolve;}),server=createDevServer({feedbackStarter:()=>mail});
 server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
 const pending=Array.from({length:8},()=>{const req=request(base+'/api/feedback',{method:'POST'});req.on('error',()=>{});req.end('{}');return req;});
 try{
  // Each of these sockets must have been admitted before checking the ninth.
  await Promise.all(pending.map(req=>req.writableFinished?Promise.resolve():once(req,'finish')));
  let count=0;while(count<8){count=await new Promise(resolve=>server.getConnections((_error,n)=>resolve(n)));if(count<8)await new Promise(resolve=>setImmediate(resolve));}
  const busy=await fetch(base+'/api/feedback',{method:'POST',body:'{}'});assert.equal(busy.status,503);await busy.text();
  ready({url:null,state:'unconfigured',close:async()=>{}});await server.feedbackReady;
  await closeDevServer(server);assert.equal(server.listening,false);
 }finally{for(const req of pending)req.destroy();ready({url:null,close:async()=>{}});await closeDevServer(server);}
});

test('root website serves optional OEIS queries independently of mail readiness and cancels them on shutdown',async()=>{
  let releaseMail,started,pendingSignal;
  const mailReady=new Promise(resolve=>{releaseMail=resolve;}),fetchStarted=new Promise(resolve=>{started=resolve;});
  const record={number:45,name:'Fibonacci numbers',data:'0,1,1,2,3,5,8',offset:'0,4',futureField:{full:['preserved']}};
  const server=createDevServer({env:{ONLINE_QUERY_ORIGINS:'https://tools.example.invalid'},feedbackStarter:()=>mailReady,onlineQueryFactory:options=>createOnlineQueryService({...options,minimumIntervalMs:0,fetchImpl:async(url,{signal})=>{
    if(new URL(url).searchParams.get('q')==='pending'){pendingSignal=signal;started();return new Promise(()=>{});}
    return new Response(JSON.stringify([record]),{headers:{'Content-Type':'application/json'}});
  }})});
  server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
  const post=query=>fetch(base+'/api/query/oeis',{method:'POST',headers:{Origin:'https://tools.example.invalid','Content-Type':'application/json'},body:JSON.stringify({query})});
  try{
    const result=await post('A000045');assert.equal(result.status,200);assert.equal(result.headers.get('cache-control'),'no-store');assert.deepEqual((await result.json()).records,[record]);
    assert.equal((await fetch(base+'/site-version.js')).status,200,'Website stays available while mail startup has not completed');
    assert.equal((await fetch(base+'/api/query/unknown')).status,404);
    releaseMail({state:'unconfigured',code:'FEEDBACK_NOT_CONFIGURED',url:null,close:async()=>{}});await server.feedbackReady;
    const submission=post('pending').then(response=>response.status,()=>0);await fetchStarted;await closeDevServer(server);
    assert.equal(pendingSignal.aborted,true);assert.notEqual(await submission,200,'Closing the website cannot report an unfinished query as successful');
  }finally{releaseMail({state:'unconfigured',url:null,close:async()=>{}});await closeDevServer(server);}
});

test('static JSON stays a JSON resource with optional HTTP gzip and no attachment disposition', {timeout:30000}, async t => {
  const child = spawn(process.execPath, ['scripts/server.mjs', '--port', '0'], {cwd:process.cwd(), env:{...process.env,SMTP_USER:'',SMTP_PASS:'',REPORT_TO:'',ALLOWED_ORIGINS:'https://tools.example.invalid',FEEDBACK_TRUSTED_PROXIES:'',FEEDBACK_URL:''}, stdio:['ignore','pipe','pipe']});
  t.after(async () => { if (child.exitCode === null) { child.kill(); await once(child, 'exit'); } });
  const base = await new Promise((resolve,reject) => {
    let output='';
    child.once('error',reject);
    child.once('exit',code=>reject(Error('Local server exited before readiness: '+code)));
    child.stdout.on('data',chunk=>{output+=chunk.toString();const match=output.match(/Local: (http:\/\/localhost:\d+)/);if(match)resolve(match[1]);});
    child.stderr.on('data',chunk=>{output+=chunk.toString();});
  });
  const get = (path,encoding,method='GET') => new Promise((resolve,reject) => {
    const req=request(base+path,{method,headers:encoding===undefined?{}:{'Accept-Encoding':encoding}},response=>{
      const chunks=[];response.on('data',chunk=>chunks.push(chunk));response.on('end',()=>resolve({status:response.statusCode,headers:response.headers,body:Buffer.concat(chunks)}));
    });req.on('error',reject);req.end();
  });
  const path='/vendor/atlas-celestial/constellations.json',expected=await readFile('public'+path);
  for(const encoding of [undefined,'identity','gzip;q=0','*;q=0','gzip;q=0, *;q=1']){
    const response=await get(path,encoding);assert.equal(response.status,200);assert.equal(response.headers['content-type'],'application/json');assert.equal(response.headers['content-encoding'],undefined);assert.equal(response.headers['content-disposition'],undefined);assert.equal(response.headers.vary,'Accept-Encoding');assert.deepEqual(response.body,expected);
  }
  for(const encoding of ['gzip','br, gzip;q=0.5','*;q=1']){
    const response=await get(path+'?version=2026-10',encoding);assert.equal(response.status,200);assert.equal(response.headers['content-type'],'application/json');assert.equal(response.headers['content-encoding'],'gzip');assert.equal(response.headers.vary,'Accept-Encoding');assert.equal(response.headers['content-disposition'],undefined);assert.deepEqual(gunzipSync(response.body),expected);assert.equal(JSON.parse(gunzipSync(response.body)).records.length,88);
  }
  const head=await get(path,'gzip','HEAD');assert.equal(head.status,200);assert.equal(head.headers['content-encoding'],'gzip');assert.equal(head.body.length,0);
  const plain=await get('/vendor/timezones/index.json','gzip');assert.equal(plain.status,200);assert.equal(plain.headers['content-type'],'application/json');assert.ok(JSON.parse(plain.headers['content-encoding']?gunzipSync(plain.body):plain.body).zones.length>=598);
  const missing=await get('/vendor/atlas-celestial/missing.json','gzip');assert.equal(missing.status,404);assert.equal(missing.headers['content-encoding'],undefined);assert.match(missing.body.toString(),/^Not found$/);
});
