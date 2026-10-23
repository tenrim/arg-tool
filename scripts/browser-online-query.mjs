import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {extname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {chooseNativeTask,go} from './browser-navigation.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.wasm':'application/wasm'};
const directory=resolve(tmpdir(),'mist-online-query');await mkdir(directory,{recursive:true});
const fixture=index=>({number:45+index,name:index?'Fixture sequence '+index:'Fibonacci numbers (mock query fixture)',data:'0,1,1,2,3,5,8,13,21',offset:'0,4',formula:['a(n)=a(n-1)+a(n-2).'],comment:['Fixture full annotation '+index],example:['a(6)=8.'],program:['(Python) print(1)'],reference:['Fixture source'],link:['<img src=x onerror="window.__injected=true">'],unknownField:{nested:['complete',index,null]}});
const envelope=parameters=>{const executedQuery=/^A\d{6}$/i.test(parameters.query)?'id:'+parameters.query.toUpperCase():parameters.query;return{provider:'oeis',query:parameters.query,executedQuery,start:parameters.start,pageSize:10,records:Array.from({length:parameters.start?2:10},(_,offset)=>fixture(parameters.start+offset)),fetchedAt:'2026-10-17T12:00:00.000Z',sourceURL:'https://oeis.org/search?q='+encodeURIComponent(executedQuery)+'&start='+parameters.start+'&fmt=json',nextStart:parameters.start?null:10,total:null};};
async function production(width,motion){
 const prefix=width<1100?'/toolbox/':'/',base='https://arg.test'+prefix,requests=[],external=[],errors=[],missing=[],gates=[];let failure=null;
 const context=await browser.newContext({viewport:{width,height:950},hasTouch:width<1100,reducedMotion:motion,permissions:['clipboard-read','clipboard-write']});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(['blob:','data:'].includes(url.protocol))return route.continue();
  if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
  try{
   assert.ok(url.pathname.startsWith(prefix),'resource keeps deployment subdirectory');const relative=url.pathname.slice(prefix.length)||'index.html';
   if(relative==='api/query/oeis'){
    assert.equal(route.request().method(),'POST');const parameters=route.request().postDataJSON();requests.push(parameters);
    if(failure){const current=failure;failure=null;return route.fulfill(current);}
    const gate=gates.find(item=>!item.used);if(gate){gate.used=true;gate.started();await gate.wait;}
    return route.fulfill({contentType:'application/json',body:JSON.stringify(envelope(parameters)),headers:{'Cache-Control':'no-store'}});
   }
   return route.fulfill({body:await readFile(resolve('public',relative)),contentType:mime[extname(relative)]||'application/octet-stream'});
  }catch(error){if(route.request().url().includes('/api/query/oeis')&&/closed|intercept|disposed|target/i.test(error.message))return;missing.push(url.pathname+': '+error.message);await route.abort().catch(()=>{});}
 });
 const page=await context.newPage();page.setDefaultTimeout(30000);page.on('pageerror',error=>errors.push(error.message));await page.goto(base+'#home');await page.locator('#panel-home [data-capability]').first().waitFor();
 return{page,context,requests,base,gate(){let started,release;const wait=new Promise(resolve=>release=resolve),pending=new Promise(resolve=>started=resolve);gates.push({wait,started,used:false});return{started:pending,release};},fail(value){failure=value;},check(){assert.deepEqual({external,errors,missing},{external:[],errors:[],missing:[]});assert.equal(context.pages().length,1);}};
}
async function ready(page){await page.locator('#oeis-status').filter({hasText:'查询完成'}).waitFor();}
async function query(page,value='1,1,2,3,5'){await page.locator('#oeis-query').fill(value);await page.locator('#oeis-query').press('Enter');await ready(page);}
async function exported(page,id){const pending=page.waitForEvent('download');await page.locator(id).click();return JSON.parse(await readFile(await(await pending).path(),'utf8'));}
async function footer(page){const node=page.locator('#panel-oeis>.tool-provenance');await node.waitFor({state:'visible'});assert.match(await node.textContent(),/OEIS/);assert.match(await node.textContent(),/CC[- ]BY-SA[- ]4\.0/);assert.equal(await node.evaluate(value=>value.parentElement.lastElementChild===value),true,'source footer follows dynamic results and help');}
async function scenario(scope,width,motion){
 const {page,requests}=scope;await chooseNativeTask(page,'native:oeis');assert.equal(requests.length,0,'entering page never queries online');assert.match(await page.locator('#oeis-status').textContent(),/尚未联网查询/);
 assert.match(await page.locator('#oeis-online-notice').textContent(),/点击查询后.*本站服务器.*OEIS.*需要联网.*不保存/);
 await page.locator('#oeis-query').fill('1,1,2,3,5');assert.equal(requests.length,0,'typing never queries online');assert.equal(await page.locator('#oeis-record-notebook').isDisabled(),true);await footer(page);
 await page.locator('#oeis-query').press('Enter');await ready(page);assert.equal(requests.length,1);assert.deepEqual(requests[0],{query:'1,1,2,3,5',start:0});assert.equal(await page.locator('[data-oeis-record]').count(),10);assert.match(await page.locator('#oeis-summary').textContent(),/未提供匹配总数/);
 assert.match(await page.locator('#oeis-detail [data-query-reading]').textContent(),/a\(n\)=a\(n-1\)\+a\(n-2\)/,'useful formulas are readable without opening raw fields');assert.equal(await page.locator('#oeis-detail [data-query-original],#oeis-raw-record').count(),0,'raw JSON is not generated');
 assert.equal(await page.locator('#oeis-detail img').count(),0,'upstream HTML is inert text');assert.equal(await page.evaluate(()=>Boolean(window.__injected)),false);assert.doesNotMatch(await page.locator('#oeis-detail').textContent(),/window\.__injected/);
 const current=await exported(page,'#oeis-download'),whole=await exported(page,'#oeis-download-page');assert.equal(current.record.number,45);assert.deepEqual(current.record.formula,['a(n)=a(n-1)+a(n-2).']);assert.deepEqual(current.record.unknownField,{nested:['complete',0,null]});assert.equal(whole.records.length,10);assert.equal(current.attribution.license,'CC BY-SA 4.0');assert.equal(whole.attribution.license,'CC BY-SA 4.0');assert.equal(current.sourceURL,whole.sourceURL);assert.equal(current.fetchedAt,whole.fetchedAt);
 await page.locator('#oeis-copy').click();const copied=await page.evaluate(()=>navigator.clipboard.readText());assert.deepEqual(JSON.parse(copied),current);
 await page.evaluate(async()=>{const {connectNotebook}=await import('./handoff/button.js');const {connectGraphics}=await import('./graphics/bridge.js');connectNotebook(request=>{window.__oeisNote=request;window.__oeisNoteValue=request.read();});connectGraphics(request=>{window.__oeisGraphic=request;window.__oeisGraphicValue=request.read();});});
 await page.locator('#oeis-record-notebook').click();assert.match(await page.evaluate(()=>window.__oeisNoteValue.text),/"unknownField"/);assert.match(await page.evaluate(()=>window.__oeisNoteValue.text),/CC BY-SA 4\.0/);
 await page.locator('[data-oeis-record="A000046"]').click();assert.equal(await page.evaluate(()=>window.__oeisNote.isCurrent()),false,'record selection invalidates pending chooser');
 await page.locator('#oeis-record-graphics').click();assert.match(await page.evaluate(()=>window.__oeisGraphicValue.text),/A000046/);await page.locator('#oeis-query').fill('draft changed');assert.equal(await page.evaluate(()=>window.__oeisGraphic.isCurrent()),false);assert.equal(await page.locator('#oeis-download').isDisabled(),true);assert.equal(requests.length,1);
 await query(page);await page.locator('#oeis-next').click();await ready(page);assert.equal(requests.at(-1).start,10);assert.equal(await page.locator('[data-oeis-record]').count(),2);assert.equal(await page.locator('#oeis-next').isDisabled(),true);assert.equal(await page.locator('#oeis-prev').isEnabled(),true);assert.equal((await exported(page,'#oeis-download')).record.number,55);await page.locator('#oeis-prev').click();await ready(page);assert.equal(requests.at(-1).start,0);
 // Deliberately let fetch ignore AbortSignal, proving revisions reject late
 // successful responses independently of network cancellation support.
 await page.evaluate(()=>{window.__oeisFetch=window.fetch;window.fetch=(url,options)=>String(url).includes('/api/query/oeis')?window.__oeisFetch(url,{...options,signal:undefined}):window.__oeisFetch(url,options);});
 let gate=scope.gate();await page.locator('#oeis-run').click();await gate.started;await page.locator('#oeis-stop').click();assert.match(await page.locator('#oeis-status').textContent(),/已停止/);gate.release();await query(page,'fresh fixture');assert.equal((await exported(page,'#oeis-download')).query,'fresh fixture','only the latest query owns the saved record');
 gate=scope.gate();await page.locator('#oeis-run').click();await gate.started;await page.locator('#oeis-query').fill('new input');assert.equal(await page.locator('#oeis-stop').isDisabled(),true);gate.release();await query(page,'after input');assert.equal((await exported(page,'#oeis-download')).query,'after input','only the latest query owns the saved record');
 await page.locator('#oeis-record-notebook').click();await go(page,'about');assert.equal(await page.evaluate(()=>window.__oeisNote.isCurrent()),false,'leaving invalidates completed result');
 const about=await page.locator('#panel-about').textContent();assert.match(about,/OEIS/);assert.match(about,/在线查询/);assert.match(about,/反馈|报告/);
 const count=requests.length;await chooseNativeTask(page,'native:oeis');assert.equal(await page.locator('#oeis-query').inputValue(),'after input');assert.equal(requests.length,count,'return never automatically replays query');assert.equal(await page.locator('#oeis-download').isDisabled(),true);
 gate=scope.gate();await page.locator('#oeis-run').click();await gate.started;await go(page,'about');gate.release();await chooseNativeTask(page,'native:oeis');assert.equal(await page.locator('#oeis-download').isDisabled(),true);await query(page,'after navigation');
 scope.fail({status:429,contentType:'application/json',headers:{'Retry-After':'60'},body:JSON.stringify({code:'RATE_LIMIT',message:'查询过于频繁。'})});await page.locator('#oeis-run').click();await page.locator('#oeis-status').filter({hasText:'60 秒'}).waitFor();assert.equal(await page.locator('#oeis-record-notebook').isDisabled(),true);
 scope.fail({status:404,contentType:'text/html',body:'<html>static host</html>'});await page.locator('#oeis-run').click();await page.locator('#oeis-status').filter({hasText:'后端查询模块'}).waitFor();
 scope.fail({status:200,contentType:'text/html',body:'<html>static host</html>'});await page.locator('#oeis-run').click();await page.locator('#oeis-status').filter({hasText:'静态托管'}).waitFor();
 scope.fail({status:200,contentType:'application/json',body:' '.repeat(2*1024*1024+1)});await page.locator('#oeis-run').click();await page.locator('#oeis-status').filter({hasText:'限额'}).waitFor();
 await page.evaluate(()=>{window.fetch=window.__oeisFetch;});await query(page,'A000045');await footer(page);
 await page.locator('#oeis-query').focus();assert.equal(await page.locator('#oeis-query').evaluate(node=>document.activeElement===node),true);await page.keyboard.press('Tab');assert.equal(await page.locator('#oeis-run').evaluate(node=>document.activeElement===node),true);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow at '+width);if(width<1100){await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% text retains page width');await page.evaluate(()=>document.documentElement.style.fontSize='');}
 await page.screenshot({path:resolve(directory,'oeis-'+width+'-'+motion+'.png'),fullPage:true});scope.check();
}
try{for(const [width,motion]of [[1440,'no-preference'],[390,'reduce'],[320,'reduce']]){const scope=await production(width,motion);await scenario(scope,width,motion);await scope.context.close();}console.log('PASS: explicit online consent notice, no automatic requests, complete safe OEIS records and exports, attribution/footer, real notebook/graphics leases, paging, cancellation/late replies, static-host/rate/size failures, keyboard and PC/phone/subdirectory/reduced-motion layouts.');}finally{await browser.close();}
