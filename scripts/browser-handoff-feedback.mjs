import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {deflateSync} from 'node:zlib';
import {chooseOperation,chooseNativeTask} from './browser-navigation.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
function chunk(type,data){const body=Buffer.concat([Buffer.from(type),data]),out=Buffer.alloc(body.length+8);let crc=0xffffffff;for(const byte of body){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}out.writeUInt32BE(data.length);body.copy(out,4);out.writeUInt32BE((crc^0xffffffff)>>>0,out.length-4);return out;}
const header=Buffer.alloc(13);header.writeUInt32BE(1);header.writeUInt32BE(1,4);header[8]=8;header[9]=6;
const imageWithZip=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(Buffer.from([0,0,0,0,255]))),chunk('IEND',Buffer.alloc(0)),Buffer.from('504b0506000000000000000000000000000000000000','hex')]);
const hexITOnly=process.argv.includes('--hex-it-only');
async function hexITRecording(page){
 await page.evaluate(async()=>{
  const {connectNotebook}=await import('./handoff/button.js'),{connectGraphics}=await import('./graphics/bridge.js');
  window.extraRecordingRequests={note:null,graphic:null};
  connectNotebook(request=>window.extraRecordingRequests.note=request);connectGraphics(request=>window.extraRecordingRequests.graphic=request);
 });
 const capture=async(selector,kind='note')=>{await page.locator(selector).focus();await page.keyboard.press('Enter');return page.evaluate(async kind=>{
  const request=window.extraRecordingRequests[kind],value=await request.read();
  return {name:value.name||'',bytes:[...(value.bytes||new TextEncoder().encode(value.text))],current:request.isCurrent()};
 },kind);};
 const stale=async(kind='note')=>page.evaluate(async kind=>{const request=window.extraRecordingRequests[kind];let rejected=false;try{await request.read();if(!request.isCurrent())throw Error('来源结果已失效');}catch{rejected=true;}return {current:request.isCurrent(),rejected};},kind);
 const holdFirstRead=async(kind,boundary)=>page.evaluate(async({kind,boundary})=>{
  const {connectNotebook}=await import('./handoff/button.js'),{connectGraphics}=await import('./graphics/bridge.js');
  const gate={boundary};window.pendingRecordingReads??={};window.pendingRecordingReads[kind]=gate;
  const waiting=new Promise(resolve=>{gate.release=resolve;});
  const handler=request=>{gate.request=request;window.extraRecordingRequests[kind]=request;gate.outcome=(async()=>{await waiting;try{const value=await request.read();if(!request.isCurrent())throw Error('来源结果已失效');return{rejected:false,name:value.name||''};}catch(error){return{rejected:true,message:error.message};}})();};
  (kind==='note'?connectNotebook:connectGraphics)(handler);
 },{kind,boundary});
 const releaseFirstRead=async kind=>page.evaluate(async kind=>{const gate=window.pendingRecordingReads[kind];gate.release();return gate.outcome;},kind);
 const resumeCapture=async kind=>page.evaluate(async kind=>{const {connectNotebook}=await import('./handoff/button.js'),{connectGraphics}=await import('./graphics/bridge.js');(kind==='note'?connectNotebook:connectGraphics)(request=>{window.extraRecordingRequests[kind]=request;});},kind);
 await chooseNativeTask(page,'native:hex-editor');await page.locator('#hex-editor').waitFor({state:'visible'});
 assert(await page.locator('#hex-result-notebook').isDisabled());
 const original=Buffer.from(Array.from({length:2048},(_,i)=>i%256));Buffer.from('中文线索\r\n').copy(original,1700);
 await page.locator('#file-input').setInputFiles({name:'完整原始.bin',mimeType:'application/octet-stream',buffer:original});await page.locator('#hex-result-notebook:enabled').waitFor();
 assert.deepEqual((await capture('#hex-result-notebook')).bytes,[...original],'capture preserves all bytes beyond the bounded grid, including NUL/nonUTF8/CRLF');
 assert.deepEqual((await capture('#hex-result-graphics','graphic')).bytes,[...original]);
 // The real graphics receiver awaits its notebook chooser before first read.
 // Keep that boundary pending while editing, and ensure no lazy byte export
 // happens at click time or after its clicked document has been replaced.
 await page.evaluate(async()=>{const {HexDocument}=await import('./hex/model.js');window.restoreHexExport=HexDocument.prototype.exportBytes;window.hexCaptureExports=0;HexDocument.prototype.exportBytes=function(...args){window.hexCaptureExports++;return window.restoreHexExport.apply(this,args);};});
 await holdFirstRead('graphic','graphics chooser');await page.locator('#hex-result-graphics').click();assert.equal(await page.evaluate(()=>window.hexCaptureExports),0,'click captures lease identity without serializing its lazy value');
 await page.locator('#hex-jump-value').fill('1');await page.locator('#hex-jump').click();await page.locator('#hex-edit-value').fill('5a');await page.locator('#hex-write').click();
 assert.equal((await releaseFirstRead('graphic')).rejected,true,'an old graphics chooser cannot perform its first read against the replacement document');assert.equal(await page.evaluate(()=>window.hexCaptureExports),0,'rejected old request never serializes the newer bytes');
 await page.evaluate(async()=>{const {HexDocument}=await import('./hex/model.js');HexDocument.prototype.exportBytes=window.restoreHexExport;delete window.restoreHexExport;});await resumeCapture('graphic');
 assert.deepEqual(await stale('graphic'),{current:false,rejected:true});const edited=Buffer.from(original);edited[1]=0x5a;assert.deepEqual((await capture('#hex-result-notebook')).bytes,[...edited]);
 await page.locator('#hex-undo').click();assert.deepEqual(await stale(),{current:false,rejected:true});assert.deepEqual((await capture('#hex-result-notebook')).bytes,[...original]);
 await page.locator('#hex-redo').click();assert.deepEqual((await capture('#hex-result-notebook')).bytes,[...edited]);
 await page.locator('#hex-filename').fill('工作副本.bin');assert.deepEqual(await stale(),{current:false,rejected:true});const renamed=await capture('#hex-result-notebook');assert.equal(renamed.name,'工作副本.bin');assert.deepEqual(renamed.bytes,[...edited]);
 await page.evaluate(()=>{location.hash='home';});await page.locator('#panel-home').waitFor({state:'visible'});assert.deepEqual(await stale(),{current:false,rejected:true});
 await chooseNativeTask(page,'native:hex-editor');await page.locator('#hex-result-notebook:enabled').waitFor();assert.deepEqual((await capture('#hex-result-notebook')).bytes,[...edited],'reentering republishes the retained working document without resetting its history');
 await page.locator('#file-input').setInputFiles({name:'空文件.bin',mimeType:'application/octet-stream',buffer:Buffer.alloc(0)});assert.deepEqual(await stale(),{current:false,rejected:true});await page.locator('#hex-result-notebook:enabled').waitFor();assert.deepEqual((await capture('#hex-result-notebook')).bytes,[],'an actual empty file remains a real zero-byte snapshot');
 await chooseNativeTask(page,'native:it-ports');await page.locator('#it-results [data-it-record]').first().waitFor();assert(await page.locator('#it-record-notebook').isDisabled());
 const selectRecord=async()=>{const button=page.locator('#it-results [data-it-record]').first(),id=await button.getAttribute('data-it-record');await button.click();await page.locator('#it-record-notebook:enabled').waitFor();return id;};
 const assertRecord=async(kind,id,selector='#it-record-notebook',target='note')=>{
  const captured=await capture(selector,target),saved=JSON.parse(Buffer.from(captured.bytes).toString());
  const expected=await page.evaluate(async({kind,id})=>{const {loadITData}=await import('./it-reference/model.js'),data=await loadITData(kind);return{category:kind,record:data.records.find(record=>record.id===id),meta:data.meta};},{kind,id});
  assert.deepEqual(saved,expected,'record capture retains every model field and fixed dataset provenance');assert(captured.current);return saved;
 };
 let id=await selectRecord();await assertRecord('ports',id);
 // Notebook capture awaits flush() before read(). Clicking record A must pin
 // A's lease even if another valid record B is selected during that await.
 await holdFirstRead('note','notebook flush');await page.locator('#it-record-notebook').click();const second=page.locator('#it-results [data-it-record]').nth(1),secondId=await second.getAttribute('data-it-record');assert.notEqual(secondId,id);await second.click();
 assert.equal((await releaseFirstRead('note')).rejected,true,'pending notebook flush must reject the first read of a superseded record rather than adopt B');await resumeCapture('note');await assertRecord('ports',secondId);
 await page.locator('#it-next').click();assert.deepEqual(await stale(),{current:false,rejected:true},'pagination clears the selected record lease');
 id=await selectRecord();await assertRecord('ports',id,'#it-record-graphics','graphic');
 await chooseNativeTask(page,'native:it-http');assert.deepEqual(await stale('graphic'),{current:false,rejected:true});await page.locator('#it-results [data-it-record]').first().waitFor();await page.locator('#it-query').fill('404');id=await selectRecord();await assertRecord('http',id);
 await page.locator('#it-query').fill('new input');assert.deepEqual(await stale(),{current:false,rejected:true});assert(await page.locator('#it-record-notebook').isDisabled());
 await chooseNativeTask(page,'native:it-domains');await page.locator('#it-domain-run').waitFor({state:'visible'});await page.locator('#it-domain-input').fill('https://a.b.example.co.uk/clue');await page.locator('#it-domain-run').click();await page.locator('#it-domain-notebook:enabled').waitFor();
 const domain=JSON.parse(Buffer.from((await capture('#it-domain-notebook')).bytes).toString());assert.equal(domain.hostname,'a.b.example.co.uk');assert.equal(domain.publicSuffix,'co.uk');assert.equal(domain.domain,'example.co.uk');assert.equal(domain.subdomain,'a.b');assert.equal(domain.includePrivate,true);assert.equal(domain.rule,'co.uk');
 await page.locator('#it-domain-private').uncheck();assert.deepEqual(await stale(),{current:false,rejected:true});assert(await page.locator('#it-domain-notebook').isDisabled());
 await page.locator('#it-domain-run').click();await page.locator('#it-domain-graphics:enabled').waitFor();assert.equal(JSON.parse(Buffer.from((await capture('#it-domain-graphics','graphic')).bytes).toString()).includePrivate,false);
 await page.locator('#it-domain-input').fill('bad domain');assert.deepEqual(await stale('graphic'),{current:false,rejected:true});await page.locator('#it-domain-run').click();await page.waitForFunction(()=>document.getElementById('it-domain-status').dataset.state==='error');assert(await page.locator('#it-domain-notebook').isDisabled());
 assert.equal(await page.locator('[data-continue-result],#handoff-dialog').count(),0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'recording controls fit the current PC/mobile viewport');
}
try{
 for(const [width,motion,prefix]of [[1440,'no-preference',''],[390,'reduce','/tools']]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:motion}),posts=[],errors=[];let failure=true;
  await context.route('**/*',async route=>{
   const u=new URL(route.request().url());if(u.pathname.endsWith('/deployment.js'))return route.fulfill({body:"export const feedbackEndpoint='./api/feedback';",contentType:'text/javascript'});assert.equal(u.hostname,'arg.test');
   if(u.pathname===prefix+'/api/feedback'){const report=route.request().postDataJSON();posts.push(report);return route.fulfill({status:failure?503:200,contentType:'application/json',body:JSON.stringify(failure?{message:'测试邮件服务不可用'}:{accepted:true,id:report.id})});}
   const path=(u.pathname.slice(prefix.length)||'/').replace(/^\/$/,'/index.html');
   try{await route.fulfill({body:await readFile(resolve('public','.'+(path==='/'?'/index.html':path))),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.woff2':'font/woff2'})[extname(path)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'Not found'});}
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(`https://arg.test${prefix}/#${hexITOnly?'home':'encoding'}`);
  if(hexITOnly){await page.locator('#panel-home').waitFor({state:'visible'});await hexITRecording(page);assert.deepEqual(errors,[]);await context.close();console.log('PASS extra hex/IT recording',width,motion,prefix);continue;}
  await page.waitForSelector('#ct-encoding .ct-run:enabled');
  await chooseOperation(page,'To Base64');const task=page.locator('#ct-encoding');await task.locator('.ct-input').fill('PEK');await task.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));
  assert.equal(await page.locator('[data-continue-result],#handoff-dialog,.ct-chain,#analysis-chef,#code-chef').count(),0,'retired transfer UI must not be generated');
  // Exercise the production notebook/graphics buttons against their actual
  // controller leases. The receivers inspect originals, never result DOM.
  await page.evaluate(async()=>{
   const {connectNotebook}=await import('./handoff/button.js'),{connectGraphics}=await import('./graphics/bridge.js');
   window.recordingRequests={note:[],graphic:[]};
   connectNotebook(request=>window.recordingRequests.note.push(request));
   connectGraphics(request=>window.recordingRequests.graphic.push(request));
  });
  const inspect=async(kind='note')=>page.evaluate(async kind=>{
   const request=window.recordingRequests[kind].at(-1),value=await request.read();
   const files=await Promise.all((value.files?.length?value.files:[value]).map(async file=>({name:file.name||'',bytes:[...(file instanceof Blob?new Uint8Array(await file.arrayBuffer()):file.bytes instanceof ArrayBuffer?new Uint8Array(file.bytes):file.bytes||new TextEncoder().encode(file.text))]})));
   return {files,current:request.isCurrent(),stable:value===await request.read()};
  },kind);
  const capture=async(kind='note',selector)=>{const button=selector?page.locator(selector):task.locator(kind==='note'?'[data-notebook-result]':'[data-graphics-result]');await button.focus();await page.keyboard.press('Enter');return inspect(kind);};
  const stale=async(kind='note')=>page.evaluate(async kind=>{const request=window.recordingRequests[kind].at(-1);let rejected=false;try{await request.read();}catch{rejected=true;}return {current:request.isCurrent(),rejected};},kind);
  const execute=async(op,text)=>{await chooseOperation(page,op);await task.locator('.ct-source').selectOption('text');await task.locator('.ct-input').fill(text);await task.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));};
  const first=await capture();assert.equal(Buffer.from(first.files[0].bytes).toString(),'UEVL');assert(first.current&&first.stable,'one click owns a stable original result');
  const firstGraphic=await capture('graphic');assert.deepEqual(firstGraphic.files[0].bytes,first.files[0].bytes);assert(firstGraphic.current&&firstGraphic.stable);
  assert.equal((await stale()).current,false,'opening another destination cannot reuse an earlier capture request');
  await task.locator('.ct-input').fill('new input');assert(await task.locator('[data-notebook-result]').isDisabled());assert(await task.locator('[data-graphics-result]').isDisabled());assert.deepEqual(await stale('graphic'),{current:false,rejected:true});
  // Valid UTF-8, NUL and non-UTF8 bytes all retain exactly the engine result.
  const unicode=Buffer.from('中文线索🧩\r\n');await execute('From Base64',unicode.toString('base64'));assert.deepEqual((await capture()).files[0].bytes,[...unicode]);
  const binary=Buffer.from([0,255,128,13,10]);await execute('From Hex',binary.toString('hex'));assert.deepEqual((await capture()).files[0].bytes,[...binary]);assert.deepEqual((await capture('graphic')).files[0].bytes,[...binary]);
  await chooseOperation(page,'To Hex');assert.deepEqual(await stale('graphic'),{current:false,rejected:true},'switching the actual task invalidates a captured request');assert(await task.locator('[data-notebook-result]').isDisabled());
  // The PNG decoded by Chef includes its complete trailing ZIP, for notes and
  // graphics alike. Neither route substitutes re-encoded canvas bytes.
  await execute('From Base64',imageWithZip.toString('base64'));assert.deepEqual((await capture()).files[0].bytes,[...imageWithZip]);assert.deepEqual((await capture('graphic')).files[0].bytes,[...imageWithZip]);
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id:'native:image'}})));await page.locator('#panel-image').waitFor({state:'visible'});assert.deepEqual(await stale('graphic'),{current:false,rejected:true},'leaving the source task retires its lease');
  await page.locator('#image-input').setInputFiles({name:'图片及尾部ZIP.png',mimeType:'image/png',buffer:imageWithZip});await page.waitForFunction(()=>document.getElementById('image-status').textContent==='图片已载入');
  const original=await capture('note','#image-view-notebook');assert.deepEqual(original.files[0].bytes,[...imageWithZip]);assert.equal(original.files[0].name,'图片及尾部ZIP.png');assert.equal(original.files.length,2,'original and current rendered PNG stay separate');
  const rendered=Buffer.from(original.files[1].bytes);assert.deepEqual(rendered.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));assert.notDeepEqual(rendered,imageWithZip,'rendered view must not masquerade as the original file');
  assert.deepEqual((await capture('graphic','#image-view-graphics')).files[0].bytes,[...imageWithZip]);
  await page.locator('#image-input').setInputFiles({name:'另一份图片.png',mimeType:'image/png',buffer:imageWithZip});assert.deepEqual(await stale('graphic'),{current:false,rejected:true},'choosing another source invalidates the old original-file request immediately');
  await page.waitForFunction(()=>document.getElementById('image-status').textContent==='图片已载入');
  await execute('To Base64','new input');assert.equal(await page.locator('[data-continue-result],#handoff-dialog').count(),0);
  // Open the global entry even when it lives in the mobile native drawer.
  await page.evaluate(()=>document.getElementById('report-problem').click());const report=page.locator('#report-dialog');await report.locator('#report-description').fill('点击按钮之后没有显示结果');
  await report.locator('#report-files').setInputFiles({name:'sample.txt',mimeType:'text/plain',buffer:Buffer.from('USER_SELECTED_ATTACHMENT')});await page.waitForFunction(()=>!document.getElementById('report-send').disabled);
  await report.locator('#report-send').click();await page.waitForFunction(()=>document.getElementById('report-status').textContent.includes('不可用'));assert.equal(await report.locator('#report-description').inputValue(),'点击按钮之后没有显示结果');
  await page.keyboard.press('Escape');await page.evaluate(()=>document.getElementById('report-problem').click());
  failure=false;await report.locator('#report-send').click();await page.waitForFunction(()=>document.getElementById('report-status').textContent.includes('邮件服务器已接收'));assert.equal(posts.length,2);assert.deepEqual(posts[0],posts[1],'closing and reopening preserves the exact retry payload');assert.equal(posts[1].attachments[0].data,Buffer.from('USER_SELECTED_ATTACHMENT').toString('base64'));
  assert(!JSON.stringify(posts[1].diagnostics).includes('new input'));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await report.getByRole('button',{name:'关闭',exact:true}).focus();await page.keyboard.press('Enter');assert.equal(await report.evaluate(n=>n.open),false);
  await page.evaluate(()=>{const s=document.querySelector('#ct-encoding .ct-status');s.classList.add('error');s.textContent='测试错误';});await page.locator('#ct-encoding [data-report-error]').click();assert.equal(await report.evaluate(n=>n.open),true);await page.keyboard.press('Escape');
  await hexITRecording(page);assert.deepEqual(errors,[]);await context.close();
 }
 console.log(hexITOnly?'PASS extra-only: full edited bytes/history/name/reentry/empty-file snapshots and complete IT records/domain parse leases, PC/mobile, reduced motion, keyboard and subdirectory.':'PASS: real Chef notebook/graphics result leases, UTF8/NUL/nonUTF8 bytes, original PNG plus trailing ZIP and separate view, input/task/leave invalidation, retired generic transfer UI, report privacy/attachments/failure/retry, complete edited-byte and IT record/domain leases, PC/mobile, reduced motion, keyboard and subdirectory.');
}finally{await browser.close();}
