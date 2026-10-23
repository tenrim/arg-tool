import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {once} from 'node:events';
import {mkdtemp,readFile,writeFile,unlink,rmdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {feedbackClientIP,normalizeFeedbackIP,startDevFeedback} from '../scripts/dev-feedback.mjs';
import {closeDevServer,createDevServer} from '../scripts/server.mjs';
import {createFeedbackServer} from '../services/feedback/server.mjs';

const fixture=()=>({schema:1,id:randomUUID(),type:'无法运行',description:'本机假邮件投递回归测试',expected:'完整报告',steps:'仅测试注入的假 transport',contact:'',diagnostics:{version:'test',task:'native:code',browser:'Chrome/140',viewport:[390,844],actions:[]},attachments:[]});
async function listen(server){server.listen(0,'127.0.0.1');await once(server,'listening');await server.feedbackReady;return `http://127.0.0.1:${server.address().port}`;}
async function close(server){await closeDevServer(server);}
const fakeConfig={SMTP_USER:'sender@example.invalid',SMTP_PASS:'PRIVATE_TEST_AUTH',REPORT_TO:'recipient@example.invalid'};
const fakeTransport=()=>({async send(){},close(){}});
const missingConfig=()=>join(tmpdir(),'mist-no-config-'+randomUUID()+'.env');
const post=(base,origin,headers={})=>fetch(base+'/api/feedback',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(fixture())});

test('configured development feedback uses the actual origin, keeps SMTP private, preserves limits and closes with the site',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'mist-feedback-')),path=join(directory,'.env');
  await writeFile(path,'SMTP_HOST=mail.invalid\nSMTP_PORT=465\nSMTP_USER=sender@example.invalid\nSMTP_PASS=PRIVATE_TEST_AUTH\nREPORT_TO=recipient@example.invalid\nALLOWED_ORIGINS=https://tools.example.invalid\nPORT=6143\n');
  t.after(async()=>{await unlink(path);await rmdir(directory);});
  let sent=0,closed=0,transportConfig;
  const server=createDevServer({env:{},feedbackStarter:options=>startDevFeedback({...options,configPath:path,transportFactory:async config=>{transportConfig=config;return{async send(mail){assert.match(mail.text,/本机假邮件/);sent++;},close(){closed++;}};}})});
  const base=await listen(server),feedback=await server.feedbackReady;t.after(()=>close(server));assert.equal(feedback.state,'automatic');assert.equal(new URL(feedback.url).hostname,'127.0.0.1');
  assert.equal(transportConfig.REPORT_TO,'recipient@example.invalid');assert.equal(transportConfig.SMTP_PASS,'PRIVATE_TEST_AUTH');assert.equal(transportConfig.ALLOWED_ORIGINS,undefined);
  const post=(body,origin=base)=>fetch(base+'/api/feedback',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:typeof body==='string'?body:JSON.stringify(body)});
  assert.equal((await post(fixture(),'http://localhost:16143')).status,403);assert.equal((await post(fixture(),'https://foreign.invalid')).status,403);assert.equal(sent,0);
  assert.equal((await fetch(base+'/api/feedback')).status,405);assert.equal((await post('{')).status,400);assert.equal(sent,0);
  const report=fixture();for(let i=0;i<2;i++){const response=await post(report);assert.equal(response.status,200);const body=await response.text();assert.ok(!body.includes('PRIVATE_TEST_AUTH'));assert.ok(!body.includes('@example.invalid'));}assert.equal(sent,1,'deduplication still owns repeated reports');
  const localOrigin=`http://localhost:${server.address().port}`;assert.equal((await post(fixture(),localOrigin)).status,200);assert.equal(sent,2);
  for(let i=0;i<3;i++)assert.equal((await post(fixture())).status,200);assert.equal((await post(fixture())).status,429);assert.equal(sent,5,'the original per-IP limit is unchanged');
  assert.equal((await post('x'.repeat(6*1024*1024+1))).status,413);assert.equal(sent,5);
  assert.equal((await fetch(base+'/services/feedback/.env')).status,404);assert.equal((await fetch(base+'/../services/feedback/.env')).status,404);
  const stopped=new Promise(resolve=>server.once('close',resolve));server.close();await stopped;await feedback.close();assert.equal(closed,1);await assert.rejects(fetch(feedback.url));
});

test('root-started feedback accepts only registered production origins plus actual loopback origins and ignores inherited ports',async()=>{
  let sent=0;
  const server=createDevServer({env:{...fakeConfig,ALLOWED_ORIGINS:'https://tools.example.invalid',PORT:'6142',HOST:'0.0.0.0'},feedbackStarter:options=>startDevFeedback({...options,configPath:missingConfig(),transportFactory:async()=>({async send(){sent++;},close(){}})})});
  const base=await listen(server),feedback=await server.feedbackReady;
  try{
    assert.equal(feedback.state,'automatic');assert.equal(new URL(feedback.url).hostname,'127.0.0.1');assert.notEqual(new URL(feedback.url).port,'6142');assert.notEqual(new URL(feedback.url).port,String(server.address().port));
    assert.equal((await post(base,'https://tools.example.invalid')).status,200);
    for(const origin of ['https://unregistered.invalid','http://localhost:6142','null','https://tools.example.invalid/','https://tools.example.invalid/path'])assert.equal((await post(base,origin)).status,403);
    const missingOrigin=await fetch(base+'/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fixture())});assert.equal(missingOrigin.status,403);
    assert.equal((await post(base,base)).status,200);assert.equal((await post(base,`http://localhost:${server.address().port}`)).status,200);assert.equal(sent,3);
  }finally{await close(server);}
});

test('exact origin/proxy validation fails closed and environment values take precedence over private-file values',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'mist-feedback-')),path=join(directory,'.env');
  await writeFile(path,'SMTP_USER=file@example.invalid\nSMTP_PASS=FILE_SECRET\nREPORT_TO=file-recipient@example.invalid\nALLOWED_ORIGINS=https://file.example.invalid\nFEEDBACK_TRUSTED_PROXIES=192.0.2.9\n');
  t.after(async()=>{await unlink(path);await rmdir(directory);});
  let config,created=0;
  const start=(env={})=>startDevFeedback({sitePort:16319,configPath:path,env,transportFactory:async value=>{created++;config=value;return fakeTransport();}});
  const valid=await start({...fakeConfig,ALLOWED_ORIGINS:'https://env.example.invalid,https://[2001:db8::1]:8443',FEEDBACK_TRUSTED_PROXIES:'::ffff:127.0.0.1,2001:0db8::1'});
  try{
    assert.equal(valid.state,'automatic');assert.deepEqual(valid.trustedProxies,['127.0.0.1','2001:db8::1']);assert.equal(config.SMTP_USER,fakeConfig.SMTP_USER);assert.equal(config.REPORT_TO,fakeConfig.REPORT_TO);
    assert.equal((await post(valid.url.replace('/api/feedback',''),'https://env.example.invalid')).status,200);assert.equal((await post(valid.url.replace('/api/feedback',''),'https://file.example.invalid')).status,403);
  }finally{await valid.close();}
  const before=created;
  for(const value of ['', ' ', '*','https://*.example.invalid','https://tools.example.invalid/path','https://tools.example.invalid/','https://tools.example.invalid?x=1','https://tools.example.invalid#x','https://user:secret@tools.example.invalid','https://tools.example.invalid,','file:///private','null']){
    const result=await start({ALLOWED_ORIGINS:value});assert.equal(result.url,null,value);assert.equal(result.code,'FEEDBACK_ORIGINS_INVALID',value);
  }
  for(const value of ['*','127.0.0.0/8','localhost','192.0.2.1,','192.0.2.999','[::1]','fe80::1%eth0']){const result=await start({FEEDBACK_TRUSTED_PROXIES:value});assert.equal(result.url,null,value);assert.equal(result.code,'FEEDBACK_PROXIES_INVALID',value);}
  assert.equal(created,before,'invalid configuration never creates transport or binds a port');
});

test('the documented optional empty proxy setting starts normally and trusts nobody',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'mist-feedback-')),path=join(directory,'.env');
  const example=await readFile('services/feedback/.env.example','utf8');assert.match(example,/^FEEDBACK_TRUSTED_PROXIES=\s*$/m);await writeFile(path,example);t.after(async()=>{await unlink(path);await rmdir(directory);});
  const feedback=await startDevFeedback({sitePort:16319,env:fakeConfig,configPath:path,transportFactory:async()=>fakeTransport()});
  try{assert.equal(feedback.state,'automatic');assert.deepEqual(feedback.trustedProxies,[]);}finally{await feedback.close();}
});

test('client identity uses the real peer unless an exact trusted proxy supplies one valid IP',()=>{
  const req=(peer,real,forwarded)=>({socket:{remoteAddress:peer},headers:{'x-real-ip':real,'x-forwarded-for':forwarded}});
  assert.equal(normalizeFeedbackIP('::ffff:192.0.2.5'),'192.0.2.5');assert.equal(normalizeFeedbackIP('::ffff:c000:205'),'192.0.2.5');assert.equal(normalizeFeedbackIP('2001:0DB8:0:0::1'),'2001:db8::1');
  for(const invalid of [undefined,['192.0.2.1'],'192.0.2.1,192.0.2.2','example.invalid','192.0.2.1:80','[::1]','fe80::1%eth0',' 192.0.2.1','192.0.2.999'])assert.equal(normalizeFeedbackIP(invalid),null);
  assert.equal(feedbackClientIP(req('::ffff:192.0.2.4','198.51.100.1','203.0.113.1')),'192.0.2.4');
  assert.equal(feedbackClientIP(req('::ffff:192.0.2.4','198.51.100.1'),['192.0.2.4']),'198.51.100.1');
  assert.equal(feedbackClientIP(req('2001:db8::2','::ffff:198.51.100.2'),['2001:db8::2']),'198.51.100.2');
  for(const invalid of ['198.51.100.1, 198.51.100.2',['198.51.100.1'],'bad',undefined])assert.equal(feedbackClientIP(req('192.0.2.4',invalid,'198.51.100.1'),['192.0.2.4']),'192.0.2.4');
  assert.equal(feedbackClientIP(req('unknown','198.51.100.1'),[]),null);
});

test('untrusted visitors cannot evade the original per-client limit by forging proxy headers',async()=>{
  let sent=0;
  const server=createDevServer({env:{...fakeConfig,ALLOWED_ORIGINS:'https://tools.example.invalid'},feedbackStarter:options=>startDevFeedback({...options,configPath:missingConfig(),transportFactory:async()=>({async send(){sent++;},close(){}})})}),base=await listen(server);
  try{
    for(let i=0;i<5;i++)assert.equal((await post(base,'https://tools.example.invalid',{'X-Real-IP':`198.51.100.${i+1}`,'X-Forwarded-For':`203.0.113.${i+1}`})).status,200);
    assert.equal((await post(base,'https://tools.example.invalid',{'X-Real-IP':'198.51.100.99','X-Forwarded-For':'203.0.113.99'})).status,429);assert.equal(sent,5);
  }finally{await close(server);}
});

test('registered reverse proxies retain independent IPv4/IPv6 visitor limits instead of one loopback quota',async()=>{
  let sent=0;
  const server=createDevServer({env:{...fakeConfig,ALLOWED_ORIGINS:'https://tools.example.invalid',FEEDBACK_TRUSTED_PROXIES:'::ffff:127.0.0.1'},feedbackStarter:options=>startDevFeedback({...options,configPath:missingConfig(),transportFactory:async()=>({async send(){sent++;},close(){}})})}),base=await listen(server);
  try{
    for(const ip of ['198.51.100.10','2001:db8::10']){for(let i=0;i<5;i++)assert.equal((await post(base,'https://tools.example.invalid',{'X-Real-IP':ip})).status,200);assert.equal((await post(base,'https://tools.example.invalid',{'X-Real-IP':ip})).status,429);}
    assert.equal(sent,10);assert.equal((await post(base,'https://tools.example.invalid',{'X-Real-IP':'198.51.100.10, 2001:db8::10'})).status,200,'an invalid forwarded address safely falls back to the actual peer');
  }finally{await close(server);}
});

test('different real socket peers retain independent limits without trusting any forwarded header',async()=>{
  let sent=0;
  const server=createDevServer({env:{...fakeConfig,ALLOWED_ORIGINS:'https://tools.example.invalid'},feedbackStarter:options=>startDevFeedback({...options,configPath:missingConfig(),transportFactory:async()=>({async send(){sent++;},close(){}})})});
  server.listen(0,'::');await once(server,'listening');await server.feedbackReady;
  try{
    for(const host of ['127.0.0.1','[::1]']){const base=`http://${host}:${server.address().port}`;for(let i=0;i<5;i++)assert.equal((await post(base,'https://tools.example.invalid',{'X-Real-IP':'203.0.113.1'})).status,200);assert.equal((await post(base,'https://tools.example.invalid')).status,429);}assert.equal(sent,10);
  }finally{await close(server);}
});

test('configuration/startup diagnostics omit secrets and timed-out late transports are disposed',async()=>{
  const options={sitePort:16319,env:fakeConfig,configPath:missingConfig()};
  for(const [error,code] of [[Error('PRIVATE_SMTP_SECRET'),'FEEDBACK_CONFIG_OR_START_ERROR'],[Object.assign(Error('PRIVATE_DEPENDENCY_PATH'),{code:'ERR_MODULE_NOT_FOUND'}),'FEEDBACK_DEPENDENCY_MISSING']]){
    const result=await startDevFeedback({...options,transportFactory:async()=>{throw error;}});assert.equal(result.code,code);assert.ok(!JSON.stringify(result).includes('PRIVATE_'));assert.equal(result.url,null);
  }
  let release,closed=0,startupSignal;const pending=startDevFeedback({...options,startupTimeoutMS:15,transportFactory:(_config,{signal})=>{startupSignal=signal;return new Promise(resolve=>release=resolve);}}),failed=await pending;assert.equal(failed.code,'FEEDBACK_START_TIMEOUT');assert.equal(startupSignal.aborted,true,'Startup deadline cancels dependency preparation');release({send:async()=>{},close(){closed++;}});await new Promise(setImmediate);assert.equal(closed,1);
});

test('site shutdown bounds a pending submission and closes the owned service/transport exactly once',async()=>{
  let release,sending,closed=0;const started=new Promise(resolve=>sending=resolve);
  const server=createDevServer({env:{...fakeConfig,ALLOWED_ORIGINS:'https://tools.example.invalid'},feedbackStarter:options=>startDevFeedback({...options,configPath:missingConfig(),shutdownTimeoutMS:30,transportFactory:async()=>({send:()=>{sending();return new Promise(resolve=>release=resolve);},close(){closed++;}})})}),base=await listen(server),feedback=await server.feedbackReady;
  const submission=post(base,'https://tools.example.invalid').then(response=>response.status,()=>0);await started;await closeDevServer(server,{timeoutMS:500});assert.notEqual(await submission,200);release();
  await feedback.close();assert.equal(closed,1);await assert.rejects(fetch(base));await assert.rejects(fetch(feedback.url));
});

test('missing or invalid local configuration degrades to copying reports and explicit loopback proxies take priority',async()=>{
  const missing=join(tmpdir(),'mist-no-config-'+randomUUID()+'.env');let created=0;
  assert.equal((await startDevFeedback({sitePort:16319,env:{},configPath:missing,transportFactory:async()=>{created++;}})).state,'unconfigured');
  const explicit=await startDevFeedback({sitePort:16319,env:{FEEDBACK_URL:'http://127.0.0.1:6143/',ALLOWED_ORIGINS:'',SMTP_USER:'',SMTP_PASS:''},configPath:missing,transportFactory:async()=>{created++;}});assert.equal(explicit.state,'explicit');assert.equal(explicit.url,'http://127.0.0.1:6143/api/feedback');assert.equal(created,0);
  for(const url of ['https://outside.invalid','file:///tmp/mail','http://user:password@127.0.0.1:6143/'])assert.equal((await startDevFeedback({sitePort:16319,env:{FEEDBACK_URL:url},configPath:missing})).url,null);
  const server=createDevServer({env:{},feedbackStarter:options=>startDevFeedback({...options,configPath:missing})}),base=await listen(server);
  try{const response=await fetch(base+'/api/feedback',{method:'POST',body:'{}'});assert.equal(response.status,503);assert.match((await response.json()).message,/未配置.*复制或下载/);}finally{await close(server);}
});

test('closing during startup cancels creation and disposes a late transport without binding a service',async()=>{
  let release,started,closed=0,startupSignal;const creating=new Promise(resolve=>started=resolve);
  const server=createDevServer({env:fakeConfig,feedbackStarter:options=>startDevFeedback({...options,configPath:missingConfig(),transportFactory:(_config,{signal})=>{startupSignal=signal;started();return new Promise(resolve=>release=resolve);}})});
  server.listen(0,'127.0.0.1');await once(server,'listening');await creating;await closeDevServer(server,{timeoutMS:500});
  const feedback=await server.feedbackReady;assert.equal(feedback.code,'FEEDBACK_START_ABORTED');assert.equal(feedback.url,null);assert.equal(server.listening,false);assert.equal(startupSignal.aborted,true,'Stopping the site cancels the install process');
  release({send:async()=>{},close(){closed++;}});await new Promise(setImmediate);assert.equal(closed,1);
});

test('explicit FEEDBACK_URL preserves the standalone service and original browser origin',async()=>{
  let sent=0;
  const service=createFeedbackServer({send:async()=>{sent++;},origins:['http://localhost:16319']});service.listen(0,'127.0.0.1');await once(service,'listening');
  const server=createDevServer({env:{FEEDBACK_URL:`http://127.0.0.1:${service.address().port}`}}),base=await listen(server);
  try{
    assert.equal((await server.feedbackReady).state,'explicit');
    const request=origin=>fetch(base+'/api/feedback',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(fixture())});
    assert.equal((await request(base)).status,403);assert.equal(sent,0);assert.equal((await request('http://localhost:16319')).status,200);assert.equal(sent,1);
    await close(server);assert.equal((await fetch(`http://127.0.0.1:${service.address().port}/api/feedback`)).status,405,'closing the development proxy never owns an explicit standalone service');
  }finally{if(server.listening)await close(server);await new Promise(resolve=>service.close(resolve));}
});
