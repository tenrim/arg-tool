import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('./network.js',import.meta.url),'utf8');
const origin='https://appassets.androidplatform.net';
function harness({manualDeadline=false}={}){
 const requests=[],cancelled=[],events={},forwarded=[];
 let started;const start=new Promise(resolve=>started=resolve);
 let deadline,delay;
 const context=vm.createContext({Request,Response,Headers,ReadableStream,URL,TextEncoder,TextDecoder,Uint8Array,atob,DOMException,crypto,setTimeout:manualDeadline?(fn,ms)=>{deadline=fn;delay=ms;return 1}:setTimeout,clearTimeout:manualDeadline?()=>{}:clearTimeout,location:{origin,href:origin+'/index.html'},fetch:async(...args)=>{forwarded.push(args);return new Response('local asset')},addEventListener:(key,fn)=>events[key]=fn,MistNetwork:{request:(...args)=>{requests.push(args);started(args)},cancel:id=>cancelled.push(id)}});
 context.window=context;vm.runInContext(source,context);
 return {context,requests,cancelled,events,forwarded,start,get delay(){return delay;},expire:()=>deadline(),fetch:(path,body,signal)=>context.fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal})};
}
test('deadline cancels native request and rejects late completion',async()=>{
 const h=harness({manualDeadline:true}),result=h.fetch('/api/query/oeis',{query:'A000045'});const[id]=await h.start;
 h.expire();await assert.rejects(result,{name:'TimeoutError'});assert.deepEqual(h.cancelled,[id]);h.context.__mistNetworkComplete(id,200,{},'{}',null);
});
test('complete JSON and retry headers survive native response without extra fields',async()=>{
 const h=harness(),payload={query:'A000045',start:0};const result=h.fetch('/api/query/oeis',payload);
 const [id,path,body]=await h.start;assert.equal(path,'/api/query/oeis');assert.deepEqual(JSON.parse(body),payload);
 const raw=JSON.stringify({message:'请稍后',records:[{original:'中文与原字段'}]});
 h.context.__mistNetworkComplete(id,429,{'Content-Type':'application/json','Retry-After':'10'},raw,null);
 const response=await result;assert.equal(response.status,429);assert.equal(response.headers.get('Retry-After'),'10');assert.equal(await response.text(),raw);
});
test('feedback keeps original report ID and selected attachment bytes',async()=>{
 const h=harness(),body={id:'original-report-id',description:'玩家明确填写的反馈',attachments:[{name:'示例.bin',data:'AAH+/w=='}]};
 const result=h.fetch('/api/feedback',body);const [id,path,raw]=await h.start;
 assert.equal(path,'/api/feedback');assert.deepEqual(JSON.parse(raw),body);
 h.context.__mistNetworkComplete(id,200,{},JSON.stringify({id:body.id,accepted:true}),null);assert.equal((await(await result).json()).accepted,true);
});
test('cancel rejects immediately; late success cannot revive the result',async()=>{
 const h=harness(),controller=new AbortController(),result=h.fetch('/api/query/oeis',{query:'A000045'},controller.signal);const [id]=await h.start;
 controller.abort();await assert.rejects(result,{name:'AbortError'});assert.deepEqual(h.cancelled,[id]);
 h.context.__mistNetworkComplete(id,200,{},'{}',null);
});
test('page exit cancels outstanding request',async()=>{
 const h=harness(),result=h.fetch('/api/query/oeis',{query:'A000045'});const [id]=await h.start;
 h.events.pagehide();await assert.rejects(result,{name:'AbortError'});assert.deepEqual(h.cancelled,[id]);
});
test('unregistered paths, non-POST, query strings and oversized bodies never go native',async()=>{
 const h=harness();
 assert.equal((await h.fetch('/api/query/unknown',{})).status,400);
 assert.equal((await h.fetch('/api/query/oeis?url=https://example.com',{})).status,400);
 assert.equal((await h.context.fetch(origin+'/api/query/oeis')).status,400);
 assert.equal((await h.fetch('/api/query/oeis',{query:'字'.repeat(8192)})).status,413);
 assert.equal(h.requests.length,0);
});
test('local tools keep normal fetch and network exceptions reject normally',async()=>{
 const h=harness();assert.equal(await(await h.context.fetch(origin+'/vendor/data.json')).text(),'local asset');assert.equal(h.requests.length,0);
 const result=h.fetch('/api/query/oeis',{query:'A000045'});const [id]=await h.start;h.context.__mistNetworkComplete(id,0,{},'','连接失败');await assert.rejects(result,{name:'TypeError',message:'连接失败'});
});

test('new server requests preserve selected fields and use service-specific deadlines',async()=>{
 for(const [path,body,delay] of [
  ['/api/code/run',{language:'c',code:'/*中文*/'+ 'x'.repeat(9000),input:'测试'},135000],
  ['/api/forensics/run',{engine:'exiftool',filename:'文件.bin',data:'AAH+/w==',password:'',options:{}},360000],
 ]){
  const h=harness({manualDeadline:true}),result=h.fetch(path,body),[id,sent,raw]=await h.start;
  assert.equal(sent,path);assert.deepEqual(JSON.parse(raw),body);assert.equal(h.delay,delay);
  h.context.__mistNetworkComplete(id,200,{},'{"complete":true}',null);assert.equal((await(await result).json()).complete,true);
 }
});

test('20 MiB file boundary is enforced independently of Base64 request overhead',async()=>{
 const h=harness(),body={engine:'exiftool',filename:'boundary.bin',data:Buffer.alloc(20*1024*1024).toString('base64'),password:'',options:{}};
 const result=h.fetch('/api/forensics/run',body),[id]=await h.start;
 h.context.__mistNetworkComplete(id,200,{},'{}',null);assert.equal((await result).status,200);
 body.data=Buffer.alloc(20*1024*1024+1).toString('base64');
 assert.equal((await h.fetch('/api/forensics/run',body)).status,413);assert.equal(h.requests.length,1);
 assert.equal((await h.fetch('/api/forensics/run',{...body,data:'bad!'})).status,400);
});

test('chunk transport reconstructs split UTF-8 and complete large analysis results',async()=>{
 const h=harness(),result=h.fetch('/api/forensics/run',{data:'AA=='}),[id]=await h.start;
 const raw=JSON.stringify({complete:true,filename:'中文😀',data:'A'.repeat(9*1024*1024)}),bytes=Buffer.from(raw);
 // Split inside a multibyte character, then stream a result larger than the old 8 MiB cap.
 const split=bytes.indexOf(Buffer.from('中文'))+1;
 h.context.__mistNetworkChunk(id,bytes.subarray(0,split).toString('base64'));
 for(let at=split;at<bytes.length;at+=49152)h.context.__mistNetworkChunk(id,bytes.subarray(at,at+49152).toString('base64'));
 h.context.__mistNetworkComplete(id,200,{'Content-Length':String(bytes.length)},null,null);
 assert.equal(await(await result).text(),raw);
});

test('incomplete, cancelled and oversized chunk streams never publish a partial result',async()=>{
 const h=harness(),controller=new AbortController(),result=h.fetch('/api/code/run',{language:'c',code:'x',input:''},controller.signal),[id]=await h.start;
 h.context.__mistNetworkChunk(id,Buffer.from('{"run":').toString('base64'));controller.abort();
 await assert.rejects(result,{name:'AbortError'});
 h.context.__mistNetworkChunk(id,Buffer.from('null}').toString('base64'));h.context.__mistNetworkComplete(id,200,{},null,null);
 const capped=harness(),oversized=capped.fetch('/api/feedback',{}),[feedbackID]=await capped.start;
 capped.context.__mistNetworkChunk(feedbackID,Buffer.alloc(65537).toString('base64'));
 await assert.rejects(oversized,/完整响应超过限额/);assert.ok(capped.cancelled.includes(feedbackID));
});

test('new endpoints retain strict method, path and JSON body limits',async()=>{
 const h=harness();
 assert.equal((await h.fetch('/api/code/run?url=https://example.com',{})).status,400);
 assert.equal((await h.fetch('/api/forensics/unknown',{})).status,400);
 assert.equal((await h.fetch('/api/code/run',{code:'x'.repeat(4*1024*1024)})).status,413);
 assert.equal((await h.fetch('/api/forensics/run',{data:'A'.repeat(28*1024*1024)})).status,413);
 assert.equal(h.requests.length,0);
});

test('image survey delivers readable NDJSON before the native request completes',async()=>{
 const h=harness(),result=h.fetch('/api/forensics/run',{data:'AA=='}),[id]=await h.start;
 h.context.__mistNetworkStart(id,200,{'Content-Type':'application/x-ndjson;charset=utf-8'});
 const response=await result;
 assert.match(response.headers.get('Content-Type'),/x-ndjson/);
 const reader=response.body.pipeThrough(new TextDecoderStream()).getReader();
 const first=JSON.stringify({type:'plan',labels:['中文检查']})+'\n';
 h.context.__mistNetworkChunk(id,Buffer.from(first).toString('base64'));
 assert.equal((await reader.read()).value,first,'first event is available while analysis is still running');
 const last=JSON.stringify({type:'end',reason:'结束😀'})+'\n',bytes=Buffer.from(last),split=bytes.indexOf(Buffer.from('结束'))+1;
 h.context.__mistNetworkChunk(id,bytes.subarray(0,split).toString('base64'));
 h.context.__mistNetworkChunk(id,bytes.subarray(split).toString('base64'));
 h.context.__mistNetworkComplete(id,200,{},null,null);
 let text='';for(;;){const item=await reader.read();if(item.done)break;text+=item.value;}
 assert.equal(text,last);
});

test('abort, native failure, deadline and page exit error an already opened survey stream',async()=>{
 for(const mode of ['abort','failure','deadline','leave']){
  const h=harness({manualDeadline:true}),controller=new AbortController(),result=h.fetch('/api/forensics/run',{data:'AA=='},controller.signal),[id]=await h.start;
  h.context.__mistNetworkStart(id,200,{'Content-Type':'application/x-ndjson'});
  const reader=(await result).body.getReader(),waiting=reader.read();
  if(mode==='abort')controller.abort();
  if(mode==='failure')h.context.__mistNetworkComplete(id,0,{},'','连接中断');
  if(mode==='deadline')h.expire();
  if(mode==='leave')h.events.pagehide();
  await assert.rejects(waiting);
  assert.ok(h.cancelled.includes(id));
  h.context.__mistNetworkChunk(id,Buffer.from('{"type":"end"}\n').toString('base64'));
  h.context.__mistNetworkComplete(id,200,{},null,null);
  await assert.rejects(reader.read());
 }
});

test('cancelling a response reader disconnects the native analysis job',async()=>{
 const h=harness(),result=h.fetch('/api/forensics/run',{data:'AA=='}),[id]=await h.start;
 h.context.__mistNetworkStart(id,200,{'Content-Type':'application/x-ndjson'});
 const reader=(await result).body.getReader();await reader.cancel();
 assert.deepEqual(h.cancelled,[id]);
 h.context.__mistNetworkChunk(id,'AA==');h.context.__mistNetworkComplete(id,200,{},null,null);
 assert.equal((await reader.read()).done,true);
});

test('streams remain restricted to successful first-party analysis NDJSON',async()=>{
 for(const [path,status,type] of [['/api/code/run',200,'application/x-ndjson'],['/api/forensics/run',200,'text/html'],['/api/forensics/run',500,'application/x-ndjson'],['/api/forensics/run',204,'application/x-ndjson']]){
  const h=harness(),result=h.fetch(path,{data:'AA=='}),[id]=await h.start;
  h.context.__mistNetworkStart(id,status,{'Content-Type':type});
  await assert.rejects(result,status===204?/Invalid response status code 204/:/流式响应格式无效/);assert.deepEqual(h.cancelled,[id]);
 }
});

test('main and attached file share the 20 MiB upload boundary',async()=>{
 const h=harness(),body={data:Buffer.alloc(19*1024*1024).toString('base64'),attachment:{filename:'附加.bin',data:Buffer.alloc(1024*1024).toString('base64')}};
 const result=h.fetch('/api/forensics/run',body),[id,path,raw]=await h.start;
 assert.equal(path,'/api/forensics/run');assert.equal(JSON.parse(raw).attachment.filename,'附加.bin');
 h.context.__mistNetworkComplete(id,200,{},'{}',null);assert.equal((await result).status,200);
 body.attachment.data=Buffer.alloc(1024*1024+1).toString('base64');
 assert.equal((await h.fetch('/api/forensics/run',body)).status,413);assert.equal(h.requests.length,1);
 body.attachment={filename:'bad.bin'};assert.equal((await h.fetch('/api/forensics/run',body)).status,400);
});
