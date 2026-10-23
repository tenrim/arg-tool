import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm','.txt':'text/plain'},artifacts=resolve(tmpdir(),'mist-timezones');await mkdir(artifacts,{recursive:true});let active;
async function scope(width,motion,blob,prefix){
 const context=await browser.newContext({viewport:{width,height:950},hasTouch:width<1100,reducedMotion:motion}),errors=[],missing=[],external=[];let failPath=null,gate=null;
 if(blob)await context.addInitScript(()=>{
  const NativeWorker=window.Worker;window.__timezoneBlobWorkers=0;
  window.Worker=class extends NativeWorker{
   constructor(url,options){const original=new URL(url,location.href);if(!original.pathname.endsWith('/timezones/worker.js')){super(url,options);return;}const bootstrap=URL.createObjectURL(new Blob(['importScripts('+JSON.stringify(original.href)+');'],{type:'text/javascript'}));super(bootstrap,options);this.bootstrap=bootstrap;window.__timezoneBlobWorkers++;}
   terminate(){super.terminate();if(this.bootstrap)URL.revokeObjectURL(this.bootstrap);}
  };
 });
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.protocol==='blob:'||url.protocol==='data:')return route.continue();if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
  try{assert.ok(url.pathname.startsWith(prefix),'resource escaped subdirectory: '+url.pathname);const relative=url.pathname.slice(prefix.length)||'index.html';
   if(failPath&&relative===failPath)return route.fulfill({status:503,body:'intentional local fixture outage'});
   if(gate&&relative===gate.path){const held=gate;gate=null;held.started();await held.wait;}
   const file=resolve('public',relative);await route.fulfill({body:await readFile(file),contentType:mime[extname(file)]||'application/octet-stream'});
  }catch(error){if(/closed|cancelled|canceled|handled/i.test(error.message))return;missing.push(url.pathname);await route.abort().catch(()=>{});}
 });
 const page=await context.newPage();active=page;page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));
 await page.goto('https://arg.test'+prefix+'#home');await page.locator('#panel-home [data-capability]').first().waitFor();
 const go=async name=>{await page.evaluate(name=>{if(name==='home'){location.hash='home';return;}document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id:'native:timezones'}}));},name);if(name==='timezones'){await page.locator('#panel-timezones').waitFor({state:'visible'});await page.locator('#timezones-list [data-timezone]').first().waitFor();}else await page.locator('#panel-home').waitFor({state:'visible'});};
 const choose=async zone=>{await page.locator('#timezones-search').fill(zone);await page.locator('#timezones-list [data-timezone="'+zone+'"]').waitFor();await page.locator('#timezones-list [data-timezone="'+zone+'"]').click();assert.equal(await page.locator('#timezones-zone').inputValue(),zone);};
 const query=async(text,mode='local')=>{await page.locator('#timezones-mode').selectOption(mode);await page.locator('#timezones-datetime').fill(text);await page.locator('#timezones-run').click();await page.waitForFunction(()=>!document.getElementById('timezones-run').disabled&&!!document.getElementById('timezones-status').textContent&&!document.getElementById('timezones-status').textContent.includes('正在'));assert.notEqual(await page.locator('#timezones-status').getAttribute('data-state'),'error');};
 return {page,context,go,choose,query,fail(path){failPath=path;},hold(path){let started,release;const begin=new Promise(r=>started=r),wait=new Promise(r=>release=r);gate={path,started,wait};return {started:begin,release};},clean(){assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});assert.equal(context.pages().length,1);if(blob)return page.evaluate(()=>window.__timezoneBlobWorkers).then(n=>assert.ok(n>0));}};
}
try{
 const scenarios=[[1440,'no-preference',false,'/'],[1440,'reduce',true,'/'],[390,'no-preference',true,'/toolbox/'],[390,'reduce',true,'/toolbox/']];
 for(const config of (process.argv.includes('--mobile')?scenarios.slice(2):scenarios)){
  const state=await scope(...config),{page,go,choose,query}=state;console.log('Timezone scope',...config);await go('timezones');
  assert.match(await page.locator('#timezones-version').textContent(),/2026e.*598/);assert.equal(await page.locator('#timezones-list button').count(),24);
  await query('2024-01-01 08:00');assert.match(await page.locator('#timezones-result').textContent(),/2024-01-01 00:00:00Z/);
  await choose('America/New_York');await query('2024-11-03 01:30');assert.match(await page.locator('#timezones-summary').textContent(),/重复/);
  assert.match(await page.locator('#timezones-result').textContent(),/2024-11-03 05:30:00Z/);assert.match(await page.locator('#timezones-result').textContent(),/2024-11-03 06:30:00Z/);
  await page.locator('#timezones-sources summary').first().click();assert.match(await page.locator('#timezones-sources textarea').first().inputValue(),/Rule\s+US\s+2007/);
  assert.equal(await page.locator('#timezones-notebook').isEnabled(),true);await page.locator('#timezones-notebook').click();const capture=page.locator('#notebook-capture');await capture.locator('#notebook-capture-save:enabled').waitFor();assert.match(await capture.locator('.notebook-capture-preview').textContent(),/05:30:00Z/);
  await capture.locator('#notebook-capture-save').click();await page.waitForFunction(()=>document.getElementById('notebook-capture-status').textContent==='已加入笔记本');await page.keyboard.press('Escape');
  await page.locator('#timezones-notebook').click();await capture.locator('#notebook-capture-save:enabled').waitFor();await page.locator('#timezones-datetime').evaluate(node=>{node.value='2024-11-03 02:30';node.dispatchEvent(new Event('input',{bubbles:true}));});await capture.locator('#notebook-capture-save').click();assert.match(await capture.locator('#notebook-capture-status').textContent(),/改变|失效/);await page.keyboard.press('Escape');assert.equal(await page.locator('#timezones-result').textContent(),'');assert.equal(await page.locator('#timezones-notebook').isDisabled(),true);
  await query('2024-03-10 02:30');assert.match(await page.locator('#timezones-summary').textContent(),/不存在/);assert.match(await page.locator('#timezones-result').textContent(),/3600 秒/);assert.equal(await page.locator('#timezones-result h2').count(),0,'a gap does not fabricate a successful UTC candidate');
  await choose('Australia/Lord_Howe');await query('2024-10-06 02:15');assert.match(await page.locator('#timezones-result').textContent(),/1800 秒/);
  await choose('US/Eastern');await query('2500-07-01 12:00');assert.match(await page.locator('#timezones-result').textContent(),/2500-07-01 16:00:00Z/);assert.match(await page.locator('#timezones-result').textContent(),/America\/New_York/);
  await choose('Asia/Kathmandu');await query('1850-01-01 00:00','utc');assert.match(await page.locator('#timezones-result').textContent(),/UTC\+05:41:16/);assert.match(await page.locator('#timezones-status').textContent(),/1970/);
  await page.locator('#timezones-datetime').fill('2024-02-30 12:00');await page.locator('#timezones-run').click();await page.waitForFunction(()=>document.getElementById('timezones-status').getAttribute('data-state')==='error');assert.equal(await page.locator('#timezones-result').textContent(),'');
  const footer=page.locator('#panel-timezones>.tool-provenance');await footer.waitFor({state:'visible'});assert.equal(await footer.evaluate(node=>node===node.parentElement.lastElementChild),true);const urls=await footer.locator('a').evaluateAll(nodes=>nodes.map(n=>n.href));assert.ok(urls.includes('https://www.iana.org/time-zones'));assert.ok(urls.includes('https://github.com/python/tzdata'));assert.ok(await footer.locator('[data-license]').count());
  if(config[2]&&config[3]!=='/'){
   for(const path of ['timezones/core.js','vendor/timezones/index.json','vendor/timezones/zoneinfo/Asia/Kathmandu','vendor/timezones/source-records.json']){
    state.fail(path);await page.locator('#timezones-run').click();await page.waitForFunction(()=>document.getElementById('timezones-status').getAttribute('data-state')==='error');assert.equal(await page.locator('#timezones-result').textContent(),'');state.fail(null);await query('2024-01-01 00:00','utc');assert.match(await page.locator('#timezones-result').textContent(),/UTC\+05:45/);
   }
   for(const action of ['stop','edit','leave']){
    const held=state.hold('vendor/timezones/zoneinfo/Asia/Kathmandu');await page.locator('#timezones-run').click();await held.started;
    if(action==='stop')await page.locator('#timezones-stop').click();else if(action==='edit')await page.locator('#timezones-datetime').fill('2024-01-02 00:00');else await go('home');
    held.release();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.equal(await page.locator('#timezones-result').textContent(),'');if(action==='leave')await go('timezones');assert.equal(await page.locator('#timezones-run').isEnabled(),true);
   }
  }
  await choose('America/New_York');await query('2024-11-03 01:30');await page.locator('#timezones-mode').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');assert.equal(await page.locator('#timezones-result').textContent(),'','keyboard parameter changes synchronously invalidate output');await query('2024-11-03 01:30');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'workspace stays within viewport');await page.screenshot({path:resolve(artifacts,`timezones-${config[0]}-${config[1]}.png`),fullPage:true});await state.clean();await state.context.close();
 }
 console.log('PASS: complete local TZif engine, actual historical seconds and DST fold/gap/half-hour transitions; raw original records, explicit alias resolution and future POSIX rules; notebook leases, invalidation, cancellation, load failure/retry; native/blob/subdirectory resources; PC/mobile, keyboard and normal/reduced motion; actual final provenance.');
}catch(error){if(active&&!active.isClosed()){console.error('At',active.url());console.error(await active.locator('body').innerText().catch(()=>''));await active.screenshot({path:resolve(artifacts,'failure.png'),fullPage:true}).catch(()=>{});}throw error;}
finally{await browser.close();}
