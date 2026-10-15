import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {appPages} from '../scripts/browser-host.mjs';
import {capabilityCategories,capabilityGroupDefinitions,toolPages} from '../public/navigation.js';

// This suite serves actual production modules and pinned engines over localhost.
// It complements (rather than replaces) the existing algorithm/worker suites.
const {chromium}=createRequire(import.meta.url)('playwright');
const localPort=Number(process.env.CAPABILITIES_PORT||40000+(process.pid%20000));
const address=process.env.CAPABILITIES_BASE_URL||'http://127.0.0.1:'+localPort;
const ownServer=!process.env.CAPABILITIES_BASE_URL;
const results=[],errors=[],missing=[],external=[],extraPages=[],screenshots='/tmp/mist-capabilities-production';
const scenarioFilter=process.env.CAPABILITIES_MATCH?new RegExp(process.env.CAPABILITIES_MATCH,'i'):null;
const reportPath=process.env.CAPABILITIES_REPORT||(scenarioFilter?'/tmp/mist-capabilities-production-focused-report.json':'/tmp/mist-capabilities-production-report.json');
let server,browser,activePage,registry;
const origin=new URL(address).origin;
await mkdir(screenshots,{recursive:true});

async function scenario(name,run){
 if(scenarioFilter&&!scenarioFilter.test(name))return;
 const started=Date.now();
 try{await run();results.push({name,status:'passed',elapsed_ms:Date.now()-started});console.log('PASS '+name);}
 catch(error){
  results.push({name,status:'failed',elapsed_ms:Date.now()-started,message:error.stack||error.message});console.error('FAIL '+name+': '+error.message);
  if(activePage&&!activePage.isClosed()){
   try{await activePage.screenshot({path:screenshots+'/failure-'+results.length+'.png',fullPage:false});}catch{}
   try{await activePage.keyboard.press('Escape');}catch{}
  }
 }
}
async function serve(){
 if(!ownServer)return;
 server=spawn(process.execPath,['scripts/server.mjs','--port',String(localPort)],{cwd:resolve('.'),stdio:['ignore','pipe','pipe']});
 let output='';
 await new Promise((resolveReady,reject)=>{
  const timer=setTimeout(()=>reject(Error('Production static server did not start')),10000);
  server.stdout.on('data',chunk=>{output+=chunk;if(output.includes('Local:')){clearTimeout(timer);resolveReady();}});
  server.once('error',error=>{clearTimeout(timer);reject(error);});
  server.once('exit',code=>{clearTimeout(timer);reject(Error('Production server exited before ready: '+code));});
 });
}
async function newPage(width=1440,height=950,reducedMotion='reduce'){
 const context=await browser.newContext({viewport:{width,height},reducedMotion,hasTouch:width<1100});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(['blob:','data:'].includes(url.protocol))return route.continue();
  if(url.origin!==origin){external.push(url.href);return route.abort();}
  return route.continue();
 });
 const page=await context.newPage();activePage=page;page.setDefaultTimeout(12000);
 page.on('popup',popup=>extraPages.push({opener:page.url(),url:popup.url()}));
 page.on('pageerror',error=>errors.push({width,height,url:page.url(),message:error.message}));
 page.on('response',response=>{if(response.status()>=400)missing.push({status:response.status(),url:response.url()});});
 await page.goto(address+'/#browse/codec');
 await page.waitForSelector('#panel-browse:not([hidden]) [data-capability-group]');
 await page.evaluate(()=>document.fonts.ready);
 return {context,page};
}
async function overview(page,category='codec',group=null){
 const route=['browse',category,...(group?[group]:[])].join('/');
 await page.evaluate(route=>{location.hash=route;},route);
 await page.waitForSelector('#panel-browse:not([hidden])');
 await page.waitForFunction(category=>document.querySelector('#panel-browse [data-capability-group]')?.dataset.category===category
  ||document.querySelector('#panel-browse [data-category="'+category+'"][aria-pressed="true"]')
  ||document.querySelector('#panel-browse')?.dataset.category===category,category);
}
function capability(id){const entry=registry.entries.find(entry=>entry.id===id);assert.ok(entry,'known capability '+id);return entry;}
async function openCapability(page,id,rawOp){
 const e=capability(id),query=new URLSearchParams({task:e.id});
 const operation=rawOp||(e.mode!=='native'?e.sourceOperationIds[0]:'');if(operation)query.set('op',operation);
 const route=e.route+'?'+query;
 await page.evaluate(route=>{location.hash=route;},route);
 await page.waitForFunction(id=>document.querySelector('.panel:not([hidden]) [data-current-capability="'+id+'"]')
  ||document.querySelector('.panel:not([hidden])[data-current-capability="'+id+'"]'),id);
 return e;
}
async function noOverflow(page,label){
 const geometry=await page.evaluate(()=>{
  const width=document.documentElement.clientWidth;
  const active=document.querySelector('dialog[open]')||document.querySelector('.panel:not([hidden])');
  const controls=[...active.querySelectorAll('button,input:not([type=file]),select,textarea')].filter(node=>node.getClientRects().length);
  const inHorizontalScroller=node=>{for(let host=node.parentElement;host&&host!==active.parentElement;host=host.parentElement){const style=getComputedStyle(host),rect=host.getBoundingClientRect();if(['auto','scroll'].includes(style.overflowX)&&host.scrollWidth>host.clientWidth&&rect.left>=-.8&&rect.right<=width+.8)return true;}return false;};
  return {width,scroll:document.documentElement.scrollWidth,crushed:controls.filter(n=>n.getBoundingClientRect().width<20).map(n=>n.id||n.className),outside:controls.filter(n=>{const r=n.getBoundingClientRect();return(r.left<-.8||r.right>width+.8)&&!inHorizontalScroller(n);}).slice(0,8).map(n=>({id:n.id,className:n.className,text:n.textContent.slice(0,60),rect:n.getBoundingClientRect().toJSON()}))};
 });
 assert.ok(geometry.scroll<=geometry.width+1,label+' document overflow '+JSON.stringify(geometry));
 assert.deepEqual(geometry.crushed,[],label+' crushed controls');
 assert.deepEqual(geometry.outside,[],label+' offscreen controls');
}
async function doneBasic(page,id){
 await page.waitForFunction(id=>document.getElementById(id+'-status')?.dataset.state==='success'
  ||/处理完成|转换完成|错误|失败/.test(document.getElementById(id+'-status')?.textContent||''),id,{timeout:45000});
 assert.equal(await page.locator('#'+id+'-copy').isEnabled(),true,id+' has a valid computed result');
}
async function doneChef(page,panel){
 await page.waitForFunction(panel=>/处理完成|失败|错误|已停止/.test(document.querySelector('#ct-'+panel+' .ct-status')?.textContent||''),panel,{timeout:45000});
 assert.match(await page.locator('#ct-'+panel+' .ct-status').textContent(),/处理完成/);
}
async function queryDone(page,id){
 await page.waitForFunction(id=>document.getElementById(id+'-status')?.textContent==='查询完成'
  ||document.getElementById(id+'-status')?.classList.contains('error'),id,{timeout:45000});
 assert.equal(await page.locator('#'+id+'-status').textContent(),'查询完成');
}
async function exportedRecipe(page){
 const disclosure=page.locator('.chef-saved-tools');if(await disclosure.getAttribute('open')===null)await disclosure.locator('summary').click();
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#chef-export-recipe').click()]);
 return JSON.parse(await readFile(await download.path(),'utf8'));
}

try{
 await serve();
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const initial=await newPage();
 registry=await initial.page.evaluate(async()=>{const {loadRegistry}=await import('./capabilities/registry.js');return loadRegistry();});
 await initial.context.close();

 await scenario('production capability registry preserves legacy pages, exposes five categories including knowledge and covers all 505 operation identities',async()=>{
  assert.deepEqual(registry.categories.map(category=>category.id),['codec','reference','media','other','knowledge']);
  assert.deepEqual(registry.categories.map(category=>[category.id,category.title]),capabilityCategories.map(category=>[category.id,category.title]));
  assert.equal(registry.categories.length,5);assert.equal(registry.groups.length,38);
  assert.deepEqual(registry.groups.map(group=>group.id).sort(),capabilityGroupDefinitions.map(group=>group.id).sort());
  assert.equal(registry.coverage.toolCount,52);assert.equal(registry.coverage.coveredToolCount,52);
  assert.equal(registry.coverage.toolCount,toolPages.length);
  assert.equal(registry.coverage.operationCount,505);assert.equal(registry.coverage.coveredOperationCount,505);
  assert.deepEqual(registry.coverage.missingToolIds,[]);assert.deepEqual(registry.coverage.missingOperationIds,[]);
  assert.deepEqual(registry.coverage.sourceModes,{task:489,existing:1,chain:10,retained:5});
  const owners=registry.entries.flatMap(e=>e.sourceOperationIds);assert.equal(owners.length,new Set(owners).size);
  assert.deepEqual(capability('pair:To%20Base64').sourceOperationIds,['To Base64','From Base64']);
 });

 for(const [width,height] of [[320,950],[390,844],[800,950],[1440,950],[844,390]]){
  if(scenarioFilter&&!scenarioFilter.test(width+' × '+height+' all five overview categories expose every group and same-page full-list expansion')&&!scenarioFilter.test(width+' × '+height+' catalogue search spans categories without nested menus and restores focus'))continue;
  const {context,page}=await newPage(width,height);
  await scenario(width+' × '+height+' all five overview categories expose every group and same-page full-list expansion',async()=>{
   for(const category of registry.categories){
    await overview(page,category.id);
    const groups=registry.groups.filter(group=>group.category===category.id);
    for(const top of registry.categories)assert.ok(await page.locator('#panel-browse button[data-category="'+top.id+'"]').isVisible(),'category is directly exposed '+top.title);
    const actual=await page.locator('#panel-browse [data-capability-group]').evaluateAll(nodes=>nodes.map(n=>n.dataset.capabilityGroup).sort());
    assert.deepEqual(actual,groups.map(group=>group.id).sort(),'complete group overview '+category.id);
    for(const group of groups){
     const row=page.locator('#panel-browse [data-capability-group="'+group.id+'"]');assert.ok(await row.isVisible());
     for(const id of group.representatives)assert.ok(await row.locator('.capability-representatives [data-capability="'+id+'"]:visible').isVisible(),'representative function exposed '+id);
    }
    const group=groups.reduce((a,b)=>b.count>a.count?b:a,groups[0]);
    const toggle=page.locator('#panel-browse [data-expand-group="'+group.id+'"]');await toggle.click();
    await page.waitForFunction(id=>document.querySelector('#panel-browse [data-expand-group="'+id+'"]')?.getAttribute('aria-expanded')==='true',group.id);
    const list=page.locator('#panel-browse [data-capability-group="'+group.id+'"] [data-capability-list]');
    assert.equal(await list.locator('[data-capability]').count(),registry.entries.filter(entry=>entry.group===group.id&&entry.category===category.id&&entry.listed!==false).length);
    for(const other of groups)assert.ok(await page.locator('#panel-browse [data-capability-group="'+other.id+'"]').isVisible(),'peer groups remain visible');
    assert.match(new URL(page.url()).hash,new RegExp('^#browse/'+category.id),'expansion stays in the current overview');
    await noOverflow(page,category.id+' full-list '+width);
    await toggle.click();
   }
  });
  await scenario(width+' × '+height+' catalogue search spans categories without nested menus and restores focus',async()=>{
   await overview(page);
   const trigger=page.locator('.rail-directory-button');
   if(width<1100){await page.locator('.workbench-menu').click();await page.locator('.workbench-drawer[open]').waitFor();}
   await trigger.click();const dialog=page.locator('.tool-directory[open]');await dialog.waitFor();
   assert.equal(await page.locator('dialog[open]').count(),1,'drawer replaced rather than layered');
   const search=dialog.locator('input[type=search]').first();
   for(const [query,id] of [['ASCII','native:ascii'],['Base92','pair:To%20Base92'],['机场','native:airports'],['图灵机','native:turing']]){
    await search.fill(query);assert.ok(await dialog.locator('[data-capability="'+id+'"]').isVisible(),'all-category discoverability '+query);
   }
   assert.equal(await dialog.locator('dialog').count(),0,'no inner modal');
   await noOverflow(page,'full directory '+width);await page.keyboard.press('Escape');
   await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
   assert.ok(await page.evaluate(()=>!!document.activeElement&&document.activeElement!==document.body),'focus is restored to a valid navigation trigger');
  });
  await context.close();
 }

 {
  const {context,page}=await newPage(1440);
  await scenario('real ASCII to Base64 handoff preserves one current input and invalidates old results',async()=>{
   await openCapability(page,'native:ascii');await page.locator('#basics-input').fill('ARG\r\n');
   await page.locator('#basics-run').click();await doneBasic(page,'basics');
   assert.equal(await page.locator('#basics-output').inputValue(),'65 82 71 10','native textarea projection uses actual engine');
   await openCapability(page,'pair:To%20Base64');await page.locator('#ct-encoding[data-operation]').waitFor();
   assert.equal(await page.locator('#ct-encoding .ct-input').inputValue(),'ARG\n','shared codec input carries across actual adapters');
   assert.equal(await page.locator('#ct-encoding .ct-output').count(),0,'handoff does not revive a prior result');
   await page.locator('#ct-encoding .ct-run').click();await doneChef(page,'encoding');
   assert.equal(await page.locator('#ct-encoding .ct-output').inputValue(),Buffer.from('ARG\n').toString('base64'));
   await page.locator('#ct-encoding .ct-input').fill('changed');
   assert.equal(await page.locator('#ct-encoding .ct-output').count(),0,'editing clears result synchronously');
   assert.equal(await page.locator('#ct-encoding .ct-download').isDisabled(),true,'stale data cannot download');
   await openCapability(page,'native:ascii');assert.equal(await page.locator('#basics-input').inputValue(),'changed');
   assert.equal(await page.locator('#basics-output').inputValue(),'','native adapter result is also invalidated');
  });
  await scenario('canonical operation deep-link reload preserves the selected inverse and real UTF-8 bytes',async()=>{
   await openCapability(page,'pair:To%20Base64','From Base64');
   assert.equal(await page.locator('#ct-encoding').getAttribute('data-operation'),'From Base64');
   await page.reload();await page.locator('#ct-encoding[data-operation]').waitFor();
   assert.equal(await page.locator('#ct-encoding').getAttribute('data-operation'),'From Base64','reload must not default inverse to encode');
   assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('op'),'From Base64');
   await page.locator('#ct-encoding .ct-input').fill(Buffer.from('谜题').toString('base64'));
   await page.locator('#ct-encoding .ct-run').click();await doneChef(page,'encoding');assert.equal(await page.locator('#ct-encoding .ct-output').inputValue(),'谜题');
   const event=page.waitForEvent('download');await page.locator('#ct-encoding .ct-download').click();
   assert.deepEqual(await readFile(await(await event).path()),Buffer.from('谜题'),'download preserves original UTF-8 bytes');
  });
  await scenario('native inverse deep-link reload restores the actual format and direction controls',async()=>{
   await openCapability(page,'native:escape-url','URL Decode');await page.locator('#basics-input').waitFor();
   assert.equal(await page.locator('#basics-family').inputValue(),'escapes');assert.equal(await page.locator('#basics-format').inputValue(),'url');assert.equal(await page.locator('#basics-direction').inputValue(),'decode');
   await page.reload();await page.locator('#panel-basics:not([hidden]) [data-current-capability="native:escape-url"]').waitFor();
   await page.waitForFunction(()=>document.getElementById('basics-direction').value==='decode');assert.equal(await page.locator('#basics-format').inputValue(),'url');
   assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('op'),'URL Decode');
   await page.locator('#basics-input').fill('%E8%B0%9C%E9%A2%98');await page.locator('#basics-run').click();await doneBasic(page,'basics');assert.equal(await page.locator('#basics-output').inputValue(),'谜题');
  });
  await scenario('world query tasks carry region and expose one task owner without cloning live forms',async()=>{
   await openCapability(page,'native:countries');await page.locator('#countries-browser[data-ready="true"]').waitFor();
   await page.locator('#countries-query').fill('中国');await page.locator('#countries-run').click();await queryDone(page,'countries');
   assert.ok((await page.locator('#countries-results').textContent()).includes('中国'));
   await page.locator('#countries-map-country').selectOption('CN');await queryDone(page,'countries');
   assert.equal(await page.locator('#countries-map-country').inputValue(),'CN','region is explicitly selected in the shared map owner');
   await page.evaluate(()=>{window.__capWorldMap=document.querySelector('.ref-world');});
   await openCapability(page,'native:currencies');await page.locator('#currencies-browser[data-ready="true"]').waitFor();
   assert.equal(await page.locator('#currencies-country-picker').inputValue(),'CN','selected region carries to currencies');
   await page.locator('#currencies-run').click();await queryDone(page,'currencies');assert.match(await page.locator('#currencies-results').textContent(),/CNY/);
   await openCapability(page,'native:airports');await page.locator('#airports-browser[data-ready="true"]').waitFor();
   assert.equal(await page.locator('#airports-region').inputValue(),'CN','same region carries to airports');
   await page.locator('#airports-query').fill('PEK');await page.locator('#airports-run').click();await queryDone(page,'airports');assert.match(await page.locator('#airports-results').textContent(),/ZBAA/);
   assert.equal(await page.locator('#airports-query').count(),1,'live query input has one owner');
   await page.locator('[data-reference-task="ports"]:visible').click();await queryDone(page,'ports');assert.equal(await page.locator('#ports-region').inputValue(),'CN');
   await page.locator('#ports-query').fill('CNSGH');await page.locator('#ports-run').click();await queryDone(page,'ports');assert.match(await page.locator('#ports-results').textContent(),/Shanghai/);
   assert.equal(await page.locator('.ref-world').count(),1,'one original map for all four task tabs');
   assert.equal(await page.evaluate(()=>window.__capWorldMap===document.querySelector('.ref-world')),true,'map DOM identity is retained');
   assert.equal(await page.locator('[data-reference-workspace="world"]').count(),1);
   for(const id of ['countries','currencies','airports','ports'])assert.equal(await page.locator('[data-reference-task="'+id+'"]:visible').count(),1,'one direct task control '+id);
  });
  await scenario('sky catalogue and observation reuse the selected Sirius record through actual Astronomy Engine',async()=>{
   await openCapability(page,'native:sky');await page.locator('#sky-browser[data-ready="true"]').waitFor();
   await page.locator('#sky-query').fill('Sirius');await page.locator('#sky-run').click();await queryDone(page,'sky');
   await page.locator('[data-reference-task="astronomy"]:visible').click();await page.waitForFunction(()=>document.querySelector('#astronomy-status').textContent==='处理完成');
   assert.equal(await page.locator('#astro-body').inputValue(),'Star1');assert.match(await page.locator('#astronomy-output').textContent(),/Sirius|天狼星/);
   await page.locator('[data-reference-task="sky"]:visible').click();await queryDone(page,'sky');assert.equal(await page.locator('#sky-results article').count(),1);
  });
  await scenario('real standard codon reference hands the selected amino acid to sequence conversion',async()=>{
   await openCapability(page,'native:sequence');await page.locator('#sequence-reference:not([hidden])').waitFor();await page.locator('[data-amino="M"]').waitFor();
   await page.locator('#amino-reference-search').fill('ATG');assert.equal(await page.locator('[data-amino]').count(),1);await page.locator('[data-amino="M"]').click();
   const detail=await page.locator('#sequence-reference .ref-visual-detail').textContent();assert.match(detail,/ATG/);assert.match(detail,/AUG/);
   await page.getByRole('button',{name:'用于序列转换',exact:true}).click();await page.locator('#panel-sequence .science-layout:not([hidden])').waitFor();
   assert.equal(await page.locator('#seq-input').inputValue(),'M');assert.equal(await page.locator('#seq-type').inputValue(),'aa');assert.equal(await page.locator('#sequence-reference').isVisible(),false);
   await page.locator('#sequence-run').click();await page.waitForFunction(()=>document.querySelector('#sequence-status').textContent==='处理完成');assert.match(await page.locator('#sequence-output').textContent(),/Met/);
  });
  await scenario('media adapters preserve the original File object and input node across same-object tasks',async()=>{
   await page.evaluate(()=>{location.hash='file';});await page.locator('#panel-file:not([hidden])').waitFor();
   await page.locator('#file-input').setInputFiles({name:'old-material.txt',mimeType:'text/plain',buffer:Buffer.from('old material must not replace active image')});
   await page.waitForFunction(()=>document.querySelector('#file-output')?.value.includes('old-material.txt'));
   const priorFileOutput=await page.locator('#file-output').inputValue();
   await openCapability(page,'native:image');await page.locator('#image-input').waitFor({state:'attached'});
   const png=await readFile('tests/fixtures/image-channels.png').catch(()=>null);
   let bytes=png;
   if(!bytes){bytes=Buffer.from(await page.evaluate(async()=>{const canvas=new OffscreenCanvas(2,2),ctx=canvas.getContext('2d');ctx.fillStyle='#ff0000';ctx.fillRect(0,0,2,2);return Array.from(new Uint8Array(await(await canvas.convertToBlob({type:'image/png'})).arrayBuffer()));}));}
   await page.evaluate(()=>{const input=document.getElementById('image-input');window.__capOriginalNode=input;input.addEventListener('change',()=>{window.__capOriginalFile=input.files[0];},{capture:true,once:true});});
   await page.locator('#image-input').setInputFiles({name:'capabilities-original.png',mimeType:'image/png',buffer:bytes});
   await page.waitForFunction(()=>{const text=document.querySelector('#image-info')?.textContent||'';return text.includes('capabilities-original.png')&&text.includes('2 × 2');});
   const imageInfo=await page.locator('#image-info').textContent();
   for(const id of ['native:image-steg','native:image-planes','native:image-compare','native:image']){
    await openCapability(page,id);
    assert.equal(await page.evaluate(()=>window.__capOriginalNode===document.getElementById('image-input')),true,'same original input node retained '+id);
    assert.equal(await page.locator('#image-info').textContent(),imageInfo,'original image metadata retained '+id);
    assert.equal(await page.locator('#image-output').inputValue(),'','task change clears prior analysis '+id);
    assert.equal(await page.locator('#lsb-download').isDisabled(),true,'old extraction is not downloadable '+id);
   }
   await openCapability(page,'op:Resize%20Image');await page.locator('#ct-image[data-operation]').waitFor();
   for(const index of [0,1])await page.locator('#ct-image [data-arg="'+index+'"] input').fill('1');
   await page.locator('#ct-image .ct-run').click();await doneChef(page,'image');
   await page.waitForFunction(()=>{const image=document.querySelector('#ct-image .ct-result-image');return image?.complete&&image.naturalWidth===1&&image.naturalHeight===1;});
   assert.equal(await page.locator('#image-info').textContent(),imageInfo,'engine uses retained original without replacing analysis input');
   assert.equal(await page.evaluate(()=>window.__capOriginalNode===document.getElementById('image-input')),true,'engine task does not clone original material input');
   await page.evaluate(()=>{location.hash='image';});await page.waitForFunction(()=>document.querySelector('#panel-image .capability-workspace-context')?.dataset.currentCapability==='op:Resize%20Image');assert.equal(await page.locator('#panel-image .r2-tabs').isVisible(),false);
   assert.equal(await page.locator('#image-info').textContent(),imageInfo,'page preference returns to the same task and preserved original material');
   await openCapability(page,'op:SHA2');await page.locator('#ct-file[data-operation]').waitFor();
   await page.locator('#ct-file .ct-source').selectOption('shared');await page.locator('#ct-file [data-arg="0"] select').selectOption('256');
   await page.locator('#ct-file .ct-run').click();await doneChef(page,'file');
   assert.equal((await page.locator('#ct-file .ct-output').inputValue()).trim(),createHash('sha256').update(bytes).digest('hex'),'cross-kind file task hashes the selected original PNG bytes, not an older file');
   assert.equal(await page.locator('#file-output').inputValue(),'','leaving the native task invalidates its old result');
   await openCapability(page,'native:file');await page.locator('#file-hex').click();
   assert.equal(await page.locator('#file-output').inputValue(),priorFileOutput.split('\n\n')[1],'reopening and inspecting proves original file bytes were not overwritten by the media handoff');
   assert.equal(await page.locator('#image-info').textContent(),imageInfo);
   assert.equal(appPages(context).length,1,'bridges remain within the page');assert.equal(await page.locator('iframe').count(),0);
  });
  await scenario('native symbols share their output while task adapters expose only the chosen controls',async()=>{
   await openCapability(page,'native:morse');await page.locator('#morse-entry').waitFor({state:'visible'});
   await page.evaluate(()=>{window.__capSymbolsOutput=document.getElementById('symbols-output');});
   for(const [id,visible,hidden] of [['native:braille','#braille-dots','#morse-entry'],['native:pigpen','#pigpen-keys','#braille-dots'],['native:morse','#morse-entry','#pigpen-keys']]){
    await openCapability(page,id);assert.ok(await page.locator(visible).isVisible());assert.equal(await page.locator(hidden).isVisible(),false,'other symbol controls are not mixed into chosen task');
    assert.equal(await page.evaluate(()=>window.__capSymbolsOutput===document.getElementById('symbols-output')),true,'one output node follows native symbol tasks');
   }
  });
  await scenario('decoded audio and the original material input survive spectrum, music and instrument tasks',async()=>{
   await openCapability(page,'native:audio-spectrum');
   const samples=800,rate=8000,wav=Buffer.alloc(44+samples*2);wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples*2,40);for(let i=0;i<samples;i++)wav.writeInt16LE(Math.round(Math.sin(i*2*Math.PI*440/rate)*12000),44+i*2);
   await page.evaluate(()=>{window.__capAudioInput=document.getElementById('audio-input');});
   await page.locator('#audio-input').setInputFiles({name:'capabilities-tone.wav',mimeType:'audio/wav',buffer:wav});
   await page.waitForFunction(()=>document.querySelector('#audio-info')?.textContent.includes('Hz'));
   const info=await page.locator('#audio-info').textContent(),player=await page.locator('#audio-player').getAttribute('src');
   for(const [id,control] of [['native:audio-music','#pitch-output'],['native:audio-play','#music-keyboard'],['native:audio-spectrum','#spectrogram-canvas']]){
    await openCapability(page,id);assert.ok(await page.locator(control).isVisible(),'selected task control '+id);
    assert.equal(await page.evaluate(()=>window.__capAudioInput===document.getElementById('audio-input')),true,'audio input is moved or retained, never cloned');
    assert.equal(await page.locator('#audio-info').textContent(),info,'decoded original audio metadata retained');
    assert.equal(await page.locator('#audio-player').getAttribute('src'),player,'original audio object URL remains stable');
   }
  });
  await context.close();
 }

 await scenario('canonical Fork opens the real recipe owner without losing its task deep link',async()=>{
  const {context,page}=await newPage(1440);await openCapability(page,'op:Fork');
  await page.waitForFunction(()=>document.getElementById('cyberchef-stage').dataset.ready==='true',{},{timeout:45000});
  await page.waitForFunction(()=>document.querySelectorAll('#chef-recipe .chef-step').length===1);
  assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('task'),'op:Fork','initializing a recipe must not rewrite the canonical route');
  const recipe=await exportedRecipe(page);assert.equal(recipe.length,1);assert.equal(recipe[0].op,'Fork');assert.ok(Array.isArray(recipe[0].args),'actual official operation arguments are serialized');
  await context.close();
 });
 await scenario('a late real recipe catalogue cannot steal navigation or overwrite the next active clue',async()=>{
  const {context,page}=await newPage(1440);let release,entered;
  const gate=new Promise(resolveGate=>{release=resolveGate;}),requested=new Promise(resolveEntered=>{entered=resolveEntered;});
  await context.route('**/vendor/cyberchef/catalogue.json',async route=>{entered();await gate;await route.continue();});
  try{
   await openCapability(page,'op:Fork');await requested;
   await openCapability(page,'native:ascii');await page.locator('#basics-input').fill('new active clue');release();
   await page.waitForFunction(()=>document.getElementById('cyberchef-stage').dataset.ready==='true',{},{timeout:45000});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('task'),'native:ascii');assert.ok(await page.locator('#panel-basics:not([hidden])').isVisible());
   assert.equal(await page.locator('#basics-input').inputValue(),'new active clue');assert.equal(await page.locator('#chef-recipe .chef-step').count(),0,'abandoned request never installs a late recipe');
  }finally{release();await context.close();}
 });
 await scenario('typing and editing a real recipe while its Worker starts preserves the newer user input and steps',async()=>{
  const {context,page}=await newPage(1440);let release,entered;
  const gate=new Promise(resolveGate=>{release=resolveGate;}),requested=new Promise(resolveEntered=>{entered=resolveEntered;});
  await context.route('**/cyberchef-worker.js',async route=>{entered();await gate;await route.continue();});
  try{
   await openCapability(page,'op:Fork');await requested;
   await page.locator('#chef-input').fill('typed while engine starts');
   await page.locator('#chef-category').selectOption('all');await page.locator('#chef-search').fill('To Base64');await page.locator('#chef-operations [data-operation="To Base64"]').click();release();
   await page.waitForFunction(()=>document.getElementById('cyberchef-stage').dataset.ready==='true',{},{timeout:45000});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   assert.equal(await page.locator('#chef-input').inputValue(),'typed while engine starts');assert.equal(await page.locator('#chef-recipe .chef-step').count(),1);
   const recipe=await exportedRecipe(page);assert.equal(recipe[0].op,'To Base64','late request cannot replace user edited steps with Fork');
  }finally{release();await context.close();}
 });

 await scenario('task-only routing keeps favorites, recents, page preferences and task links in the same workspace',async()=>{
  for(const width of [390,1440])for(const motion of ['reduce','no-preference']){
   const {context,page}=await newPage(width,950,motion);
   await openCapability(page,'pair:To%20Base64','From Base64');
   await page.locator('#ct-encoding .ct-input').fill('同一个输入');
   await page.locator('#panel-encoding .tool-favorite').click();
   await page.locator('#ct-encoding .ct-input').evaluate(node=>window.__taskInput=node);
   const assertTask=async()=>{
    await page.waitForSelector('#panel-encoding:not([hidden]) [data-current-capability="pair:To%20Base64"]');
    assert.equal(await page.locator('#ct-encoding').getAttribute('data-operation'),'From Base64');
    assert.equal(await page.locator('#ct-encoding .ct-input').inputValue(),'同一个输入');
    assert.ok(await page.evaluate(()=>window.__taskInput===document.querySelector('#ct-encoding .ct-input')));
    assert.equal(await page.locator('.ct-picker,#chef-directory,.ct-jump').count(),0);
    assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('task'),'pair:To%20Base64');
   };
   for(const index of [0,1]){
    await page.evaluate(()=>location.hash='home');await page.locator('#panel-home:not([hidden])').waitFor();
    await page.locator('.home-collection').nth(index).locator('a[href="#encoding"]').click();await assertTask();
   }
   if(width<1100)await page.locator('.workbench-menu').click();
   await page.locator('.rail-collection [data-route="encoding"]').first().click();await assertTask();
   await page.evaluate(()=>location.hash='encoding');await assertTask();
   await page.evaluate(()=>location.hash='encoding?task=missing');await assertTask();
   await openCapability(page,'native:cipher-detect');
   assert.equal(await page.locator('#panel-analysis .ct-extension').isVisible(),false,'native task cannot display the unrelated statistics form');
   await context.close();
  }
 });
 await scenario('desktop sidebar, mobile drawer and virtual keyboard preserve active inputs and modal viewport',async()=>{
  const {context,page}=await newPage(1440);await openCapability(page,'native:ascii');await page.locator('#basics-input').fill('keep active clue');
  assert.ok(await page.locator('.layout>.workbench-sidebar').isVisible(),'desktop keeps persistent sidebar');
  await page.setViewportSize({width:390,height:844});await page.locator('.workbench-menu').click();await page.locator('.workbench-drawer[open]').waitFor();
  await page.locator('.rail-directory-button').click();await page.locator('.tool-directory[open]').waitFor();
  const directory=page.locator('.tool-directory[open]');assert.equal(await page.locator('dialog[open]').count(),1);
  // Android can shrink only visualViewport while layout viewport stays intact.
  // Inject browser geometry events, not tool output or engine responses.
  await page.evaluate(()=>{Object.defineProperties(visualViewport,{height:{configurable:true,value:450},offsetTop:{configurable:true,value:35}});visualViewport.dispatchEvent(new Event('resize'));visualViewport.dispatchEvent(new Event('scroll'));});
  await page.waitForFunction(()=>document.querySelector('.tool-directory[open]')?.style.getPropertyValue('--ui-viewport-height')==='450px');
  const viewport=await page.evaluate(()=>({height:visualViewport.height,top:visualViewport.offsetTop}));
  const rect=await directory.boundingBox();assert.ok(rect.y>=viewport.top-1&&rect.y+rect.height<=viewport.top+viewport.height+1,'shared dialog fits visible keyboard viewport');
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
  assert.equal(await page.locator('#basics-input').inputValue(),'keep active clue');
  await page.evaluate(()=>{delete visualViewport.height;delete visualViewport.offsetTop;});await page.setViewportSize({width:1440,height:950});assert.ok(await page.locator('.layout>.workbench-sidebar').isVisible());
  await context.close();
 });
 await scenario('no extra pages, runtime errors, missing production resources, or remote requests',async()=>{
  assert.deepEqual(extraPages,[]);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(external,[]);
 });
}catch(error){
 results.push({name:'production capabilities suite bootstrap',status:'failed',message:error.stack||error.message});
 console.error('FAIL capabilities bootstrap: '+error.message);
}finally{
 await browser?.close();
 if(server&&!server.killed&&server.exitCode===null){server.kill('SIGTERM');await once(server,'exit').catch(()=>{});}
 const hashes={};for(const file of ['public/app.js','public/navigation.js','public/capabilities/registry.js','public/capabilities/browser.js','public/capabilities/workspace.js','public/capabilities/input-session.js','public/capabilities/native-workspaces.js','public/capabilities/reference-workspaces.js','public/workspace.js','public/workbench-shell.js','public/cyberchef.js','public/ui/capabilities.js','public/ui/components.css']){
  try{hashes[file]=createHash('sha256').update(await readFile(file)).digest('hex');}catch{}
 }
 const report={run_at:new Date().toISOString(),scope:'real production static server, local pinned engines, emulated Chromium viewports',address,filter:scenarioFilter?.source||null,registry:registry?{capabilities:registry.entries.length,listed:registry.entries.filter(entry=>entry.listed!==false).length,groups:registry.groups.length,coverage:registry.coverage}:null,passed:results.filter(r=>r.status==='passed').length,failed:results.filter(r=>r.status==='failed').length,results,errors,missing,external,extraPages,hashes,screenshots};
 await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({passed:report.passed,failed:report.failed,errors:errors.length,missing:missing.length,external:external.length,report:reportPath}));
 if(report.failed)process.exitCode=1;
}
