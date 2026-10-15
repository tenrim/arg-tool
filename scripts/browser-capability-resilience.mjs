import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';

// Only catalogue transport is faulted/delayed. All eventual metadata and
// algorithm responses come from the production files and pinned engines.
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm','.png':'image/png','.webp':'image/webp'};
await mkdir('/tmp/mist-capability-resilience',{recursive:true});
const errors=[],missing=[],external=[],popups=[];
let active;
async function contextFor(width){
 const context=await browser.newContext({viewport:{width,height:950},hasTouch:width<1100,reducedMotion:'reduce'});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.protocol==='blob:'||url.protocol==='data:')return route.continue();
  if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
  try{const path=resolve('public',url.pathname.slice(1)||'index.html');await route.fulfill({body:await readFile(path),contentType:mime[extname(path)]||'application/octet-stream'});}
  catch{missing.push(url.pathname);await route.abort();}
 });
 const page=await context.newPage();active=page;page.setDefaultTimeout(15000);
 page.on('pageerror',error=>errors.push(error.message));page.on('popup',page=>popups.push(page.url()));
 return {context,page};
}

try{
 for(const width of [390,1440]){
  for(const status of [404,503]){
   const {context,page}=await contextFor(width);let failures=0;
   await context.route('**/vendor/cyberchef/catalogue.json',async route=>{
    if(!failures++){await route.fulfill({status,body:'Controlled catalogue transport failure'});return;}
    const path=resolve('public/vendor/cyberchef/catalogue.json');await route.fulfill({body:await readFile(path),contentType:'application/json'});
   });
   const query=new URLSearchParams({task:'pair:To%20Base64',op:'From Base64'});
   await page.goto('https://arg.test/#encoding/base?'+query);
   const fallback=page.locator('#panel-browse:not([hidden])');await fallback.waitFor();
   assert.equal(failures,1,'one initial real resource failure was injected');
   assert.ok(await fallback.locator('.capability-count[data-state="error"]').isVisible(),'startup failure is visibly recoverable');
   assert.equal(await page.locator('.panel:visible').count(),1,'failure shows one usable navigation panel');
   await fallback.getByRole('button',{name:'重新载入',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('#ct-encoding')?.dataset.operation==='From Base64'&&!document.getElementById('panel-encoding').hidden);
   assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('task'),'pair:To%20Base64');
   assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('op'),'From Base64','retry restores the original inverse');
   await page.locator('#ct-encoding .ct-input').fill(Buffer.from('谜题').toString('base64'));await page.locator('#ct-encoding .ct-run').click();
   await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'),null,{timeout:45000});
   assert.equal(await page.locator('#ct-encoding .ct-output').inputValue(),'谜题','retry reaches the actual engine');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await context.close();console.log('PASS '+width+': catalogue HTTP '+status+', visible startup retry, original inverse and real UTF-8 result');
  }
  {
   const {context,page}=await contextFor(width);let release,entered;
   const gate=new Promise(resolveGate=>release=resolveGate),requested=new Promise(resolveRequest=>entered=resolveRequest);
   await context.route('**/vendor/cyberchef/catalogue.json',async route=>{entered();await gate;await route.fulfill({body:await readFile('public/vendor/cyberchef/catalogue.json'),contentType:'application/json'});});
   try{
    await page.goto('https://arg.test/#home');await requested;
    if(width<1100){await page.locator('.workbench-menu').click();await page.locator('.workbench-drawer[open]').waitFor();}
    await page.locator('.rail-filter input').fill('SM4');release();
    const listed=await page.evaluate(async()=>{const {loadRegistry}=await import('./capabilities/registry.js');const registry=await loadRegistry();return registry.entries.filter(entry=>entry.listed!==false).length;});
    await page.waitForFunction(count=>document.querySelector('.rail-badge')?.textContent===String(count),listed);
    assert.equal(await page.locator('.rail-filter input').inputValue(),'SM4');
    const tasks=await page.locator('.rail-groups a:visible').evaluateAll(nodes=>nodes.map(n=>n.dataset.capability));
    assert.deepEqual(tasks,['learn:function-pair:SM4%20Encrypt','pair:SM4%20Encrypt'],
     'deferred search ranks the exact SM4 title first and exposes both the individual lesson and actual cipher directly');
    await page.locator('.rail-groups [data-capability="learn:function-pair:SM4%20Encrypt"]:visible').click();
    await page.locator('#knowledge-detail [data-knowledge-detail="function-pair:SM4%20Encrypt"]').waitFor();
    assert.equal(await page.locator('#knowledge-article-title').textContent(),'SM4','search reaches the precise algorithm lesson');
    assert.ok(await page.locator('#knowledge-detail .knowledge-section a[href]').count()>0,'the actual lesson renders its section references');
    if(width<1100){await page.locator('.workbench-menu').click();await page.locator('.workbench-drawer[open]').waitFor();}
    await page.locator('.rail-groups [data-capability="pair:SM4%20Encrypt"]:visible').click();
    await page.waitForFunction(()=>document.querySelector('#ct-crypto')?.dataset.operation==='SM4 Encrypt');
    assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('task'),'pair:SM4%20Encrypt');
    // Published SM4 single-block known-answer vector, not a response produced
    // by another implementation of the algorithm inside this test.
    const cipher=page.locator('#ct-crypto'),block='0123456789abcdeffedcba9876543210';
    await cipher.locator('[data-arg="0"] input').fill(block);
    await cipher.locator('[data-arg="2"] select').selectOption('ECB/NoPadding');
    await cipher.locator('[data-arg="3"] select').selectOption('Hex');
    await cipher.locator('[data-arg="4"] select').selectOption('Hex');
    await cipher.locator('.ct-input').fill(block);await cipher.locator('.ct-run').click();
    await page.waitForFunction(()=>document.querySelector('#ct-crypto .ct-status').dataset.state==='success'||
     document.querySelector('#ct-crypto .ct-status').classList.contains('error'),null,{timeout:45000});
    assert.equal(await cipher.locator('.ct-status').getAttribute('data-state'),'success');
    const ciphertext=await cipher.locator('.ct-output').inputValue();
    assert.match(ciphertext,/^[0-9a-f]{2}(?: [0-9a-f]{2}){15}$/,'SM4 hex output represents the actual 16-byte block');
    assert.equal(ciphertext.replaceAll(' ',''),'681edf34d206965e86b3e94f536e4246','canonical SM4 task executes the real pinned engine');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   }finally{release();await context.close();}
   console.log('PASS '+width+': pre-load SM4 sidebar search, deferred re-filter, actual tool/knowledge groups, cited SM4 lesson and real known-answer encryption');
  }
  {
   const {context,page}=await contextFor(width);
   try{
    const query=new URLSearchParams({task:'native:countries'});
    await page.goto('https://arg.test/#countries?'+query);
    await page.locator('#countries-browser[data-ready="true"]').waitFor();
    await page.evaluate(()=>{window.originalWorldBrowser=document.getElementById('countries-browser');window.originalWorldPicker=document.getElementById('countries-map-country');});
    const checkPicker=async id=>{
     const picker=page.locator('#'+id);
     const labels=await picker.evaluate(node=>({for:node.closest('label')?.htmlFor,id:node.id,count:node.labels.length,same:node===window.originalWorldPicker}));
     assert.equal(labels.for,labels.id,'moving the shared picker preserves the visible label association');
     assert.equal(labels.count,1,'picker has exactly one associated label');
     assert.equal(labels.same,true,'moving a shared workspace preserves the picker node');
    };
    const completed=async id=>page.waitForFunction(id=>document.getElementById(id+'-status').dataset.state==='success',id);
    await checkPicker('countries-map-country');
    await page.locator('#countries-browser .ref-visual-directory summary').click();
    await page.locator('#countries-map-country').selectOption('AF');await completed('countries');
    assert.equal(await page.locator('#countries-query').inputValue(),'AF');
    assert.equal(await page.locator('#countries-browser [data-choice="AF"]').getAttribute('aria-pressed'),'true','dropdown updates the corresponding flag');
    await page.locator('#countries-browser [data-choice="BE"]').click();await completed('countries');
    assert.equal(await page.locator('#countries-map-country').inputValue(),'BE','flag updates the country picker');
    assert.equal(await page.locator('#countries-browser [data-choice="AF"]').getAttribute('aria-pressed'),'false','only the selected flag remains pressed');
    assert.equal(await page.locator('#countries-browser [data-choice="BE"]').getAttribute('aria-pressed'),'true');
    assert.match(await page.locator('#countries-results').textContent(),/比利时/,'visual selection queries the actual country record');
    for(const task of ['airports','ports','currencies','countries']){
     await page.locator('.ac-workspace-tasks [data-reference-task="'+task+'"]:visible').click();
     const panel=page.locator('#panel-'+task+':not([hidden])');await panel.waitFor();
     await panel.locator('#'+task+'-browser[data-ready="true"]').waitFor();
     const pickerId=task==='currencies'?'currencies-country-picker':task+'-map-country';
     await checkPicker(pickerId);await completed(task);
     assert.equal(await page.evaluate(task=>document.getElementById(task+'-browser')===window.originalWorldBrowser,task),true,'all four world tasks use the same browser node');
     assert.equal(await page.locator('#'+pickerId).inputValue(),'BE','selected country survives task switches');
     assert.equal(await panel.locator('.ref-flag-choice[aria-pressed="true"]').getAttribute('data-choice'),'BE','flag state stays coherent after moving the browser');
     if(task!=='countries')assert.equal(await page.locator('#'+task+'-region').inputValue(),'BE','country filters the actual destination query');
     const queryParams=new URLSearchParams(new URL(page.url()).hash.split('?')[1]);
     assert.equal(queryParams.get('task'),'native:'+task,'world task buttons open the canonical task');
    }
    const duplicates=await page.evaluate(()=>{const seen=new Set(),duplicates=[];for(const node of document.querySelectorAll('[id]')){if(seen.has(node.id))duplicates.push(node.id);seen.add(node.id);}return duplicates;});
    assert.deepEqual(duplicates,[],'shared browser moves without duplicate element IDs');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   }finally{await context.close();}
   console.log('PASS '+width+': shared world label association, real country/flag selection, retained node and country context across all four canonical tasks');
  }
 }
 assert.deepEqual({errors,missing,external,popups},{errors:[],missing:[],external:[],popups:[]});
 console.log('PASS capability resilience: catalogue 404/503 recovery, shared sidebar discovery and world picker/flag state at desktop/mobile widths; no runtime errors, missing resources, popups or external requests');
}catch(error){
 if(active&&!active.isClosed())await active.screenshot({path:'/tmp/mist-capability-resilience/failure.png'}).catch(()=>{});
 throw error;
}finally{await browser.close();}
