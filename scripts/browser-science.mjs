import {createRequire} from 'node:module';import {readFile,mkdir} from 'node:fs/promises';import {resolve,extname} from 'node:path';import {tmpdir} from 'node:os';import assert from 'node:assert/strict';
import {chooseNativeTask} from './browser-navigation.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const scenario of (process.argv.includes('--blob')?['blob-subpath']:['native','blob','blob-subpath'])){
 const prefix=scenario==='blob-subpath'?'/toolbox/':'/';
 const ctx=await browser.newContext({viewport:{width:1440,height:950},hasTouch:true}),errors=[],missing=[],external=[];
 await ctx.route('**/*',async r=>{const u=new URL(r.request().url());if(u.protocol==='blob:')return r.continue();if(u.hostname!=='arg.test'){external.push(u.href);return r.abort();}try{assert.ok(u.pathname.startsWith(prefix),'asset escaped deployment directory: '+u.pathname);const relative=u.pathname.slice(prefix.length)||'index.html';const p=resolve('public',relative);await r.fulfill({body:await readFile(p),contentType:({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.wasm':'application/wasm','.woff2':'font/woff2'})[extname(p)]||'application/octet-stream'});}catch{missing.push(u.pathname);await r.abort();}});
 // A hosted bootstrap can import the entry script while WorkerGlobalScope.location
 // remains blob:. Keep native importScripts/fetch behavior, including its URL errors.
 if(scenario!=='native')await ctx.addInitScript(()=>{
  const NativeWorker=window.Worker;
  window.__scienceWorkers=0;
  window.Worker=class extends NativeWorker{
   constructor(url,options){
    const original=new URL(url,location.href);
    if(!original.pathname.endsWith('/science/worker.js')){super(url,options);return;}
    const bootstrap=URL.createObjectURL(new Blob(['importScripts('+JSON.stringify(original.href)+');'],{type:'text/javascript'}));
    super(bootstrap,options);this.bootstrap=bootstrap;window.__scienceWorkers++;
   }
   terminate(){super.terminate();if(this.bootstrap)URL.revokeObjectURL(this.bootstrap);}
  };
 });
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://arg.test'+prefix+'#astronomy');
 const go=async(id,task='native:'+id)=>{
  const selected=await chooseNativeTask(page,task);
  assert.equal(selected.panel,id,'the registered member opens its actual scientific workspace');
 };
 const run=async id=>{await page.locator('#'+id+'-run').click();await page.waitForFunction(id=>document.getElementById(id+'-status').textContent==='处理完成'||document.getElementById(id+'-status').classList.contains('error'),id,{timeout:45000});assert.equal(await page.locator('#'+id+'-status').textContent(),'处理完成',scenario+' '+id);};
 await page.locator('#astro-date').fill('2024-04-08T18:00');await page.locator('#astro-offset').fill('0');await run('astronomy');assert.match(await page.locator('#astronomy-output').textContent(),/2024-04-08 18:2/);
 assert.equal(await page.locator('#astronomy-output canvas').count(),2);assert.match(await page.locator('#astronomy-output').textContent(),/全球日食/);await page.screenshot({path:resolve(tmpdir(),'arg-astronomy-results.png')});
 await page.locator('#astro-body').selectOption('Mars');await page.locator('#astro-offset').fill('8');await run('astronomy');assert.match(await page.locator('#astronomy-output').textContent(),/天体火星/);assert.match(await page.locator('#astronomy-output').textContent(),/方位角[\d.]+°/);
 await page.locator('#astro-lat').fill('0');assert.equal(await page.locator('#astronomy-output').textContent(),'');assert.equal(await page.locator('#astronomy-download').isDisabled(),true);
 await page.locator('#astro-event').selectOption('local-eclipse');assert.equal(await page.locator('#astro-body').isVisible(),false);assert.equal(await page.locator('#astronomy-native').count(),0);await page.locator('#astro-date').fill('2024-04-01T00:00');await page.locator('#astro-offset').fill('0');await page.locator('#astro-lat').fill('32.7767');await page.locator('#astro-lon').fill('-96.797');await run('astronomy');assert.match(await page.locator('#astronomy-output').textContent(),/2024-04-08/);assert.match(await page.locator('#astronomy-output').textContent(),/初亏/);await page.locator('#astro-event').selectOption('position');assert.equal(await page.locator('#astro-body').isVisible(),true);
 await go('calendar');await page.locator('#cal-date').fill('2024-02-10');await run('calendar');assert.match(await page.locator('#calendar-output').textContent(),/正月初一/);assert.equal(await page.locator('#calendar-output dt').count(),34);await page.locator('#cal-reference').check();await run('calendar');assert.match(await page.locator('#calendar-output').textContent(),/佛历（文化参考）/);assert.equal(await page.locator('#calendar-native').count(),0);await page.locator('#cal-reference').uncheck();
 await page.locator('#cal-mode').selectOption('lunar');await page.locator('#cal-year').fill('2023');await page.locator('#cal-month').fill('2');await page.locator('#cal-day').fill('1');await page.locator('#cal-leap').check();await run('calendar');assert.match(await page.locator('#calendar-output').textContent(),/2023-03-22/);
 await page.locator('#cal-year').fill('2024');await page.locator('#calendar-run').click();await page.waitForFunction(()=>document.querySelector('#calendar-status').textContent.includes('没有所选闰月'));assert.equal(await page.locator('#calendar-output').textContent(),'');
 await go('sequence','native:sequence-processing');await page.locator('#seq-type').selectOption('dna');await page.locator('#seq-file').setInputFiles({name:'test.fasta',mimeType:'text/plain',buffer:Buffer.from('>test\nATGGCTGGT')});await page.waitForFunction(()=>document.querySelector('#seq-input').value.includes('ATGGCTGGT'));await run('sequence');assert.match(await page.locator('#sequence-output').textContent(),/MAG/);assert.match(await page.locator('#sequence-output').textContent(),/ACCAGCCAT/);
 const dl=page.waitForEvent('download');await page.locator('#sequence-download').click();assert.match(await readFile(await(await dl).path(),'utf8'),/阅读框 \+1\tMAG/);
 await page.locator('#seq-type').selectOption('aa3');await page.locator('#seq-input').fill('Met Ala Gly');await run('sequence');assert.match(await page.locator('#sequence-output').textContent(),/MAG/);
 await go('sequence','native:sequence');assert.equal(await page.locator('#seq-input').inputValue(),'Met Ala Gly','opening the reference task preserves the source sequence');assert.equal(await page.locator('#sequence-form').isVisible(),false);
 await go('sequence','native:sequence-processing');assert.equal(await page.locator('#seq-input').inputValue(),'Met Ala Gly','returning to sequence processing preserves input');assert.equal(await page.locator('#sequence-output').textContent(),'','task changes clear the previous computation');
 await page.locator('#seq-type').selectOption('dna');await page.locator('#seq-input').fill('ATG1');await page.locator('#sequence-run').click();await page.waitForFunction(()=>document.querySelector('#sequence-status').textContent.includes('不支持'));assert.equal(await page.locator('#sequence-output').textContent(),'');
 await go('chemistry');await page.waitForSelector('.element');assert.equal(await page.locator('.element').count(),118);await page.locator('#element-search').fill('氧');await page.locator('.element').click();assert.match(await page.locator('#chemistry-output').textContent(),/原子序数8/);
 await go('element-spelling');await page.locator('#element-spelling-case').selectOption('yes');await page.locator('#element-spelling-input').fill('BaCoN');await page.locator('#element-spelling-run').click();
 await page.waitForFunction(()=>!document.getElementById('element-spelling-run').disabled&&document.getElementById('element-spelling-status').textContent&&!/正在/.test(document.getElementById('element-spelling-status').textContent));
 assert.notEqual(await page.locator('#element-spelling-status').getAttribute('data-state'),'error');assert.match(await page.locator('#element-spelling-output').inputValue(),/56 27 7/,'the registered element spelling task executes the actual full element splitter');
 await go('chemistry','native:chemistry-formula');assert.equal(await page.locator('#chem-mode').inputValue(),'formula');await page.locator('#chem-input').fill('Ca(OH)2');await run('chemistry');assert.match(await page.locator('#chemistry-output').textContent(),/74\.09/);
 await go('chemistry','native:chemistry-molecule');assert.equal(await page.locator('#chem-input').inputValue(),'Ca(OH)2','switching chemistry tasks preserves the actual input node');assert.equal(await page.locator('#chemistry-output').textContent(),'','switching chemistry tasks clears stale output');assert.equal(await page.locator('#chem-mode').inputValue(),'molecule');await page.locator('#chem-input').fill('CCO');await run('chemistry');assert.match(await page.locator('#chemistry-output').textContent(),/46\.0/);assert.equal(await page.locator('.molecule-image').evaluate(n=>n.complete&&n.naturalWidth>0),true);
 await page.locator('#chem-input').fill('C1(');await page.locator('#chemistry-run').click();await page.waitForFunction(()=>document.querySelector('#chemistry-status').classList.contains('error'));assert.equal(await page.locator('.molecule-image').count(),0);
 await page.locator('#chem-input').fill('CCO');await page.locator('#chemistry-run').click();await page.locator('#chemistry-stop').click();await page.waitForTimeout(300);assert.match(await page.locator('#chemistry-status').textContent(),/已停止/);assert.equal(await page.locator('#chemistry-output').textContent(),'');
 await go('element-spelling');await page.locator('#element-spelling-input').fill('<img src=x onerror=alert(1)>');await page.locator('#element-spelling-run').click();await page.waitForFunction(()=>document.getElementById('element-spelling-status').getAttribute('data-state')==='error');assert.equal(await page.locator('#element-spelling-output').inputValue(),'');assert.equal(await page.locator('#panel-element-spelling img').count(),0,'invalid element input never creates image markup');
 await go('chemistry');await page.locator('#element-search').fill('');assert.equal(await page.locator('.element').count(),118);await go('chemistry','native:chemistry-formula');assert.equal(await page.locator('#chem-input').inputValue(),'CCO','separate tasks retain the shared chemistry input');await page.locator('#chem-input').fill('H2O');await run('chemistry');
 if(scenario==='blob-subpath'){
  // Resource outages must leave a usable form, and a fresh run must recover.
  for(const [id,file,expected]of [
   ['astronomy','science/core.js','计算组件载入失败'],
   ['astronomy','vendor/science/astronomy.js','天文引擎载入失败'],
   ['calendar','vendor/science/lunar.js','历法引擎载入失败'],
   ['sequence','vendor/science/sequence.js','序列引擎载入失败'],
   ['chemistry','vendor/science/elements.json','元素数据载入失败'],
   ['chemistry','vendor/science/RDKit_minimal.js','分子引擎载入失败'],
   ['chemistry','vendor/science/RDKit_minimal.wasm','分子运算组件载入失败']]){
   const task=id==='sequence'?'native:sequence-processing':id==='chemistry'?(file.includes('RDKit')?'native:chemistry-molecule':'native:chemistry-formula'):'native:'+id;
   await go(id,task);
   if(id==='calendar'){await page.locator('#cal-mode').selectOption('solar');await page.locator('#cal-date').fill('2024-02-10');}
   if(id==='sequence'){await page.locator('#seq-type').selectOption('rna');await page.locator('#seq-input').fill('AUGGCUGGU');}
   if(id==='chemistry'){assert.equal(await page.locator('#chem-mode').inputValue(),file.includes('RDKit')?'molecule':'formula');await page.locator('#chem-input').fill(file.includes('RDKit')?'CCO':'H2O');}
   const url='https://arg.test'+prefix+file;
   await ctx.route(url,r=>r.fulfill({status:503,body:'Unavailable'}));
   await page.locator('#'+id+'-run').click();
   await page.waitForFunction(({id,expected})=>document.getElementById(id+'-status').textContent.includes(expected),{id,expected});
   assert.equal(await page.locator('#'+id+'-run').isEnabled(),true);
   assert.equal(await page.locator('#'+id+'-stop').isDisabled(),true);
   assert.equal(await page.locator('#'+id+'-output').textContent(),'');
   await ctx.unroute(url);await run(id);
   if(id==='sequence')assert.match(await page.locator('#sequence-output').textContent(),/MAG/);
  }
  await go('astronomy');
  await page.evaluate(()=>{window.__workingWorker=Worker;window.Worker=class{constructor(){throw new DOMException('Blocked','SecurityError');}};});
  await page.locator('#astronomy-run').click();assert.match(await page.locator('#astronomy-status').textContent(),/无法启动本地计算/);
  assert.equal(await page.locator('#astronomy-run').isEnabled(),true);
  await page.evaluate(()=>{window.Worker=window.__workingWorker;delete window.__workingWorker;});await run('astronomy');
 }
 await mkdir(resolve(tmpdir(),'arg-science-shots'),{recursive:true});
 const workspaces=[['astronomy','native:astronomy'],['chemistry','native:chemistry'],['chemistry','native:chemistry-formula'],['chemistry','native:chemistry-molecule'],['sequence','native:sequence'],['sequence','native:sequence-processing'],['calendar','native:calendar']];
 for(const width of [320,390,768,1440,1920]){await page.setViewportSize({width,height:950});for(const [id,task] of workspaces){await go(id,task);assert.equal(await page.locator('#panel-'+id+' .tool-help-button').count(),1);assert.equal(await page.locator('#panel-'+id+' .tool-provenance').evaluate(n=>n===n.parentElement.lastElementChild),true);assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w+1,width),task+' overflow '+width);if(width===390||width===1440)await page.screenshot({path:resolve(tmpdir(),`arg-science-shots/${task.replace(':','-')}-${width}.png`)});}}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='200%');for(const [id,task] of workspaces){await go(id,task);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=391),task+' 200% overflow');}
 if(scenario!=='native')assert.ok(await page.evaluate(()=>window.__scienceWorkers)>=12,'blob Worker adapter was exercised');
 assert.equal(ctx.pages().length,1);assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});console.log(scenario+' PASS: real astronomy, 24 solar terms and leap dates, FASTA/three-letter protein/six frames/download, all 118 elements, formula and real RDKit SVG, invalidation/cancel, sources/help, 320–1920px and 200% text; no external requests.');
 await ctx.close();
 }
}finally{await browser.close();}
