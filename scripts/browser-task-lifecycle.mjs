import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.wasm':'application/wasm','.woff2':'font/woff2'};
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:950},reducedMotion:width===390?'reduce':'no-preference'}),errors=[],missing=[],external=[];
  await context.addInitScript(()=>{
   const NativeWorker=Worker;window.__taskWorkers=[];window.Worker=class extends NativeWorker{
    constructor(url,options){super(url,options);this.__url=String(url);this.__terminated=false;window.__taskWorkers.push(this);}
    set onmessage(handler){this.__handler=handler;super.onmessage=handler;}
    get onmessage(){return super.onmessage;}
    terminate(){this.__terminated=true;super.terminate();}
   };
   const set=window.setTimeout,clear=window.clearTimeout;window.__taskTimers=new Set();
   window.setTimeout=function(handler,delay,...args){if(delay!==30000||typeof handler!=='function')return set.call(window,handler,delay,...args);const id=set.call(window,(...values)=>{window.__taskTimers.delete(id);handler(...values);},delay,...args);window.__taskTimers.add(id);return id;};
   window.clearTimeout=function(id){window.__taskTimers.delete(id);return clear.call(window,id);};
  });
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
   try{const file=resolve('public',url.pathname.slice(1)||'index.html');await route.fulfill({body:await readFile(file),contentType:mime[extname(file)]||'application/octet-stream'});}
   catch(error){missing.push(url.pathname);await route.abort();}
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));await page.goto('https://arg.test/#home');await page.waitForSelector('#panel-home [data-capability]');
  const go=async route=>{await page.evaluate(route=>location.hash=route,route);const id=route.split(/[/?]/)[0];await page.waitForSelector('#panel-'+id+':not([hidden])');if(route.includes('?task='))await page.waitForFunction(task=>document.querySelector('.capability-workspace-context')?.dataset.currentCapability===task,new URLSearchParams(route.split('?')[1]).get('task'));};
  async function gate(path,{failure=false}={}){
   let seen,release,finished;const requested=new Promise(resolve=>seen=resolve),unblock=new Promise(resolve=>release=resolve),done=new Promise(resolve=>finished=resolve),url='https://arg.test'+path;
   await context.route(url,async route=>{seen();await unblock;try{const file=resolve('public',path.slice(1));await route.fulfill(failure?{status:503,body:'Unavailable'}:{body:await readFile(file),contentType:mime[extname(file)]||'application/octet-stream'});}catch{/* A terminated Worker can abort its gated resource. */}finally{finished();}});
   return {requested,async finish(){release();await done;await context.unroute(url);}};
  }
  async function assertStopped(id,workerSuffix,oldResult){
   assert.equal(await page.locator('#'+id+'-stop').isDisabled(),true,id+' stop is synchronous');assert.equal(await page.locator('#'+id+'-run').isEnabled(),true,id+' execution becomes available');
   const output=id==='calendar'||id==='chemistry'?'output':'results';assert.equal(await page.locator('#'+id+'-'+output).textContent(),'');
   const state=await page.evaluate(suffix=>{const worker=window.__taskWorkers.filter(worker=>worker.__url.endsWith(suffix)).at(-1);return {terminated:worker?.__terminated,timers:window.__taskTimers.size};},workerSuffix);assert.equal(state.terminated,true,id+' Worker terminated');assert.equal(state.timers,0,id+' timeout released');
   // Even a callback already queued before terminate must fail the engine's
   // revision guard. This explicitly exercises stale-response rejection.
   await page.evaluate(({suffix,result})=>{const worker=window.__taskWorkers.filter(worker=>worker.__url.endsWith(suffix)).at(-1);worker.__handler({data:{result}});}, {suffix:workerSuffix,result:oldResult});
   assert.equal(await page.locator('#'+id+'-'+output).textContent(),'');assert.notEqual(await page.locator('#'+id+'-status').getAttribute('data-state'),'success');
  }
  const scienceLate={title:'旧任务结果',rows:[['结果','不应显示']]},referenceLate={total:1,page:0,items:[{id:'LATE',title:'旧资料结果',fields:[['结果','不应显示']]}]};
  await go('calendar?task=native%3Acalendar');const lunar=await gate('/vendor/science/lunar.js',{failure:true});await page.locator('#calendar-run').click();await lunar.requested;await go('home');await assertStopped('calendar','/science/worker.js',scienceLate);await lunar.finish();await assertStopped('calendar','/science/worker.js',scienceLate);
  await go('calendar?task=native%3Acalendar');await page.locator('#calendar-run').click();await page.waitForFunction(()=>document.querySelector('#calendar-status').dataset.state==='success');assert.match(await page.locator('#calendar-output').textContent(),/农历|干支/);
  await go('unicode?task=native%3Aunicode');await page.locator('#unicode-query').fill('U+0041');const unicode=await gate('/vendor/reference/unicode.json');await page.locator('#unicode-run').click();await unicode.requested;await go('home');await assertStopped('unicode','/reference/worker.js',referenceLate);await unicode.finish();await assertStopped('unicode','/reference/worker.js',referenceLate);
  await go('unicode?task=native%3Aunicode');await page.locator('#unicode-run').click();await page.waitForFunction(()=>document.querySelector('#unicode-status').dataset.state==='success');assert.match(await page.locator('#unicode-results').textContent(),/LATIN CAPITAL LETTER A/);
  await go('chemistry?task=native%3Achemistry-formula');await page.locator('#chem-input').fill('Ca(OH)2');const chemistry=await gate('/science/worker.js');await page.locator('#chemistry-run').click();await chemistry.requested;await go('chemistry?task=native%3Achemistry-molecule');await assertStopped('chemistry','/science/worker.js',scienceLate);await chemistry.finish();await assertStopped('chemistry','/science/worker.js',scienceLate);
  await go('chemistry?task=native%3Achemistry-formula');await page.locator('#chemistry-run').click();await page.waitForFunction(()=>document.querySelector('#chemistry-status').dataset.state==='success');assert.match(await page.locator('#chemistry-output').textContent(),/Ca.*钙/);assert.match(await page.locator('#chemistry-output').textContent(),/2 个/);
  assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});assert.equal(context.pages().length,1);
  console.log(`PASS ${width}px: shared science/reference leave cancellation, immediate Worker/timer cleanup, failed held resource and queued stale callback rejection, same-panel task invalidation and fresh real-engine retry.`);await context.close();
 }
}finally{await browser.close();}
