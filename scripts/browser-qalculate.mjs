import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm'};
try{
 for(const [width,reducedMotion] of [[1440,'no-preference'],[390,'reduce']]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion}),errors=[],external=[];
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());if(['blob:','data:'].includes(url.protocol))return route.continue();
   if(url.hostname!=='qalculate.test'){external.push(url.href);return route.abort();}
   const file=url.pathname.replace(/^\/toolbox\//,'');
   try{return route.fulfill({body:await readFile(resolve('public',file||'index.html')),contentType:mime[extname(file)]||'application/octet-stream'});}catch{return route.fulfill({status:404,body:file});}
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://qalculate.test/toolbox/index.html#qalculate?task=native:qalculate');
  await page.locator('#panel-qalculate').waitFor({state:'visible'});
  const fontList=value=>value.replace(/['"]/g,'').split(',').map(name=>name.trim()).join(',');
  const checkPlayerShell=async()=>{
   assert.equal(await page.locator('#panel-qalculate h1').textContent(),'综合计算器');
   assert.equal(await page.locator('#qalculate-library,#qalculate-catalog-summary,#qalculate-definitions,#qalculate-data-file,#qalculate-session-file,#qalculate-export-session,#qalculate-clear-definitions').count(),0,'已移除高级目录和自定义数据控件');
   assert.equal(await page.locator('#panel-qalculate summary').filter({hasText:/完整函数、单位、常数与数据集目录|自定义函数、单位、变量与本地数据/}).count(),0);
   const heading=await page.locator('#panel-qalculate h1').evaluate(n=>{const s=getComputedStyle(n);return {family:s.fontFamily,body:s.getPropertyValue('--body').trim(),weight:s.fontWeight,size:s.fontSize};});
   assert.equal(fontList(heading.family),fontList(heading.body));assert.equal(heading.weight,'600');assert.equal(heading.size,width<=800?'21px':'25px');
  };
  await checkPlayerShell();
  const names=await page.evaluate(async()=>{const {loadRegistry,resolveCapability,searchEntries}=await import('./capabilities/registry.js'),registry=await loadRegistry(),{toolGroups}=await import('./navigation.js'),{articles}=await import('./knowledge/articles/qalculate.js');return {capability:resolveCapability(registry,'native:qalculate').entry.title,navigation:toolGroups.flatMap(g=>g.items).find(([id])=>id==='qalculate')?.[1],knowledge:articles[0].title,search:searchEntries(registry,'Qalculate').some(e=>e.id==='native:qalculate')};});
  assert.equal(names.capability,'综合计算器');assert.equal(names.navigation,'综合计算器');assert.equal(names.knowledge,'综合计算器');assert.equal(names.search,true);
  const execute=async text=>{await page.locator('#qalculate-expression').fill(text);await page.locator('#qalculate-run').click();await page.waitForFunction(()=>!document.getElementById('qalculate-download').disabled,null,{timeout:60000});return page.locator('#qalculate-output').textContent();};
  const waitCalculation=()=>page.waitForFunction(()=>!document.getElementById('qalculate-download').disabled,null,{timeout:60000});
  assert.equal(await page.locator('#qalculate-settings').isVisible(),false);assert.equal(await page.locator('#qalculate-status').isVisible(),false);assert.equal(await page.locator('#qalculate-mode option').count(),2);
  for(const key of ['7','multiply','8'])await page.locator('#qalculate-key-'+key).click();await page.locator('#qalculate-run').click();await waitCalculation();assert.match(await page.locator('#qalculate-output').textContent(),/= 56/);
  await page.locator('#qalculate-memory-store').click();await page.waitForFunction(()=>document.getElementById('qalculate-memory-indicator').textContent.includes('M：56'));
  await page.locator('#qalculate-key-add').click();await page.locator('#qalculate-key-4').click();await page.locator('#qalculate-run').click();await waitCalculation();assert.match(await page.locator('#qalculate-output').textContent(),/= 60/);
  await page.locator('#qalculate-memory-add').click();await page.waitForFunction(()=>document.getElementById('qalculate-memory-indicator').textContent.includes('M：116'));await page.locator('#qalculate-memory-recall').click();await page.locator('#qalculate-run').click();await waitCalculation();assert.match(await page.locator('#qalculate-output').textContent(),/= 116/);await page.locator('#qalculate-memory-clear').click();
  await page.evaluate(()=>{document.getElementById('qalculate-memory-store').click();const input=document.getElementById('qalculate-expression');input.value='3';input.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await page.locator('#qalculate-status').textContent(),'','cancelling an older memory request must not publish an error');assert.equal(await page.locator('#qalculate-memory-indicator').textContent(),'');assert(await page.locator('#qalculate-memory-recall').isDisabled());
  assert.match(await execute('3'),/= 3/);await page.locator('#qalculate-key-square').click();await page.locator('#qalculate-run').click();await waitCalculation();assert.match(await page.locator('#qalculate-output').textContent(),/= 9/);await page.locator('#qalculate-key-sqrt').click();await page.locator('#qalculate-run').click();await waitCalculation();assert.match(await page.locator('#qalculate-output').textContent(),/= 3/);await page.locator('#qalculate-key-sign').click();await page.locator('#qalculate-run').click();await waitCalculation();assert.match(await page.locator('#qalculate-output').textContent(),/= −3/);
  await page.locator('#qalculate-mode').selectOption('scientific');
  for(const buttonWidth of [320,390,1440]){await page.setViewportSize({width:buttonWidth,height:950});assert.deepEqual(await page.locator('[data-keypad=scientific] button').evaluateAll(nodes=>nodes.filter(n=>n.scrollWidth>n.clientWidth||getComputedStyle(n).whiteSpace!=='nowrap').map(n=>n.textContent)),[],'scientific function names fit on a single line at '+buttonWidth);}await page.setViewportSize({width,height:950});await page.locator('#qalculate-angle').selectOption('2');await page.locator('#qalculate-expression').fill('30');await page.locator('#qalculate-expression').press('ControlOrMeta+A');await page.locator('#qalculate-key-sin').click();assert.equal(await page.locator('#qalculate-expression').inputValue(),'sin(30)');await page.locator('#qalculate-expression').press('Enter');await waitCalculation();assert.match(await page.locator('#qalculate-output').textContent(),/1 ∕ 2|0[.,]5/);
  await page.locator('#qalculate-angle').selectOption('1');await page.locator('#qalculate-mode').selectOption('expression');
  assert.match(await execute('integrate(x^2,0,1)\nsolve(x^2=4,x)\ndet([1,2;3,4])'),/1 ∕ 3/);
  assert.equal(await page.locator('#panel-qalculate .result-recording button:disabled').count(),0);
  await page.evaluate(async()=>{const {connectNotebook}=await import('./handoff/button.js');connectNotebook(request=>{window.qalculateTicket=request;window.qalculateRecorded=request.read();});});
  await page.locator('#qalculate-record-notebook').click();assert.match(await page.evaluate(()=>qalculateRecorded.files.find(f=>f.name==='计算结果.txt').text()),/det\(\[1,2;3,4\]\)/);
  await page.locator('#qalculate-expression').fill('99');assert.ok(await page.locator('#panel-qalculate .result-recording button:disabled').count()>0);
  assert.equal(await page.evaluate(()=>qalculateTicket.isCurrent()),false);
  assert.match(await execute('export([1,2;3,4],"table.csv")\nload("table.csv")'),/\[1\s+2;\s*3\s+4\]/);
  await page.locator('#qalculate-record-notebook').click();
  const csv=await page.evaluate(async()=>{const f=qalculateRecorded.files.find(f=>f.name==='table.csv'),raw=JSON.parse(await qalculateRecorded.files.find(f=>f.name==='完整计算记录.json').text());return{text:await f.text(),record:raw.generatedFiles[0].bytes};});
  assert.equal(Buffer.from(csv.record.data,'base64').toString('utf8'),csv.text);assert.equal(csv.record.encoding,'base64');
  const [csvDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#qalculate-generated-files a').click()]);assert.equal(await readFile(await csvDownload.path(),'utf8'),csv.text);
  await checkPlayerShell();
  await page.locator('#qalculate-mode').selectOption('expression');assert.match(await execute('plot(sin(x),0,6)'),/plot/);
  await page.locator('.qalculate-plot img').waitFor({state:'visible',timeout:60000});assert.equal(await page.locator('.qalculate-plot img').evaluate(img=>img.complete&&img.naturalWidth>0),true);
  await page.locator('#qalculate-record-notebook').click();
  const graph=await page.evaluate(async()=>{const files=qalculateRecorded.files,png=files.find(f=>f.name.endsWith('.png')),raw=JSON.parse(await files.find(f=>f.name==='完整计算记录.json').text());return{png:Array.from(new Uint8Array(await png.arrayBuffer()).slice(0,8)),svg:files.some(f=>f.name.endsWith('.svg')),points:Object.values(raw.values[0].plot.data)[0].split('\n').length,rendered:raw.plots[0].svg.includes('<svg')};});
  assert.deepEqual(graph.png,[137,80,78,71,13,10,26,10]);assert.equal(graph.svg,true);assert.ok(graph.points>1000);assert.equal(graph.rendered,true);
  assert.match(await execute('save(1/3,"clue")'),/1 ∕ 3/);assert.match(await execute('clue*3'),/= 1/);
  await page.locator('#qalculate-expression').fill('factorial(999999999)');await page.locator('#qalculate-run').click();await page.locator('#qalculate-stop').click();assert.equal(await page.locator('#qalculate-output').textContent(),'');
  assert.match(await execute('2+3'),/= 5/);
  // A rejected old promise must not terminate the following new Worker.
  await page.evaluate(()=>{const input=document.getElementById('qalculate-expression'),run=document.getElementById('qalculate-run');input.value='factorial(999999999)';input.dispatchEvent(new Event('input',{bubbles:true}));run.click();input.value='6*7';input.dispatchEvent(new Event('input',{bubbles:true}));run.click();});
  await page.waitForFunction(()=>!document.getElementById('qalculate-download').disabled,null,{timeout:60000});assert.match(await page.locator('#qalculate-output').textContent(),/= 42/);
  const provenance=page.locator('#panel-qalculate>.tool-provenance');assert.equal(await provenance.isVisible(),true);assert.equal(await provenance.evaluate(n=>n===n.parentElement.lastElementChild),true);
  assert.match(await provenance.textContent(),/Qalculate/);assert.match(await provenance.textContent(),/Gnuplot/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'workspace fits viewport');
  await page.evaluate(()=>location.hash='home');await page.locator('#panel-home').waitFor({state:'visible'});
  await page.evaluate(()=>location.hash='mathlab?task=topic:units');await page.locator('#panel-unitconvert').waitFor({state:'visible'});await page.waitForFunction(()=>document.getElementById('unit-from').options.length>0);
  assert.equal(await page.locator('#unit-discipline').inputValue(),'everyday');assert.equal(await page.locator('#qalculate-mode option[value=units]').count(),0);
  const convert=async(task,category,from,to,amount)=>{await page.evaluate(task=>location.hash='unitconvert?task=native:units-'+task,task);await page.locator('#panel-unitconvert').waitFor({state:'visible'});await page.waitForFunction(()=>document.getElementById('unit-from').options.length>0);await page.locator('#unit-category').selectOption(category);await page.locator('#unit-from').selectOption(from);await page.locator('#unit-to').selectOption(to);await page.locator('#unit-amount').fill(amount);assert.equal(await page.locator('#unit-run').count(),0,'数值换算不再需要额外执行按钮');await page.waitForFunction(()=>!document.getElementById('unit-download').disabled);return page.locator('#unit-output').textContent();};
  assert.match(await convert('thermal','Temperature','oC','oF','20'),/68/);assert.equal(await page.locator('#unit-status').isVisible(),false);
  assert.match(await convert('mechanics','Speed','km_p_h','m_p_s','72'),/20 m/);await page.evaluate(()=>{document.getElementById('unit-swap').click();if(!document.getElementById('unit-download').disabled)throw Error('交换同步作废旧记录');});assert.equal(await page.locator('#unit-from').inputValue(),'m_p_s');await page.waitForFunction(()=>!document.getElementById('unit-download').disabled);assert.match(await page.locator('#unit-output').textContent(),/259/);
  assert.match(await convert('information','Information','Kibyte_c','byte','1'),/1024/);
  assert.match(await convert('everyday','Length','m','cm_c','800'),/80000/);
  await page.evaluate(()=>{const input=document.getElementById('unit-amount');for(const value of ['8','80','800']){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));if(!document.getElementById('unit-download').disabled||document.getElementById('unit-output').textContent!=='—')throw Error('输入必须立即作废旧结果');}});
  await page.waitForFunction(()=>!document.getElementById('unit-download').disabled);assert.match(await page.locator('#unit-output').textContent(),/80000/);
  for(const value of ['-','.','1e']){await page.locator('#unit-amount').fill(value);assert.equal(await page.locator('#unit-status').isVisible(),false);assert.equal(await page.locator('#unit-download').isDisabled(),true);}
  await page.evaluate(()=>{const input=document.getElementById('unit-amount');input.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));input.value='2';input.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}));});
  await page.evaluate(()=>new Promise(requestAnimationFrame));assert.equal(await page.locator('#unit-download').isDisabled(),true);
  await page.evaluate(()=>document.getElementById('unit-amount').dispatchEvent(new CompositionEvent('compositionend',{bubbles:true})));await page.waitForFunction(()=>!document.getElementById('unit-download').disabled);assert.match(await page.locator('#unit-output').textContent(),/200/);
  await page.locator('#unit-amount').fill('');await page.locator('#unit-category').selectOption('Area');await page.locator('#unit-category').selectOption('Length');assert.equal(await page.locator('#unit-amount').inputValue(),'','空草稿不会在返回时被默认 1 覆盖');assert.equal(await page.locator('#unit-download').isDisabled(),true);
  assert.equal(await page.locator('[data-rail-group=unit-conversion] [data-capability]').count(),8,'单位菜单有八个真实学科入口');
  const unitFooter=page.locator('#panel-unitconvert>.tool-provenance');assert.equal(await unitFooter.isVisible(),true);assert.match(await unitFooter.textContent(),/Qalculate/);assert.doesNotMatch(await unitFooter.textContent(),/Gnuplot/);assert.equal(await unitFooter.evaluate(n=>n===n.parentElement.lastElementChild),true);
  if(width<=800)await page.locator('.workbench-menu').click();
  await page.locator('[data-rail-group=unit-conversion] [data-capability="native:units-mechanics"]').click();await page.waitForFunction(()=>document.getElementById('unit-from').options.length>0);assert.equal(await page.locator('#unit-category').inputValue(),'Speed');assert.equal(await page.locator('#unit-amount').inputValue(),'72');assert.equal(await page.locator('#unit-from').inputValue(),'m_p_s');await page.waitForFunction(()=>!document.getElementById('unit-download').disabled);assert.match(await page.locator('#unit-output').textContent(),/259/);
  // Restore both a category draft and the same real calculator input node.
  await page.evaluate(()=>location.hash='qalculate?task=native:qalculate');await page.locator('#panel-qalculate').waitFor({state:'visible'});await checkPlayerShell();
  await page.getByRole('tab',{name:'设置',exact:true}).click();await page.locator('#qalculate-precision').fill('30');await page.getByRole('tab',{name:'历史',exact:true}).click();assert.ok(await page.locator('.qalculate-history button').count()>0);await page.getByRole('tab',{name:'设置',exact:true}).click();assert.equal(await page.locator('#qalculate-precision').inputValue(),'30');await page.getByRole('tab',{name:'历史',exact:true}).click();
  await page.locator('#qalculate-expression').fill('123');assert.equal(await page.locator('#qalculate-status').isVisible(),false);assert.equal(await page.locator('#qalculate-display-value').textContent(),'0');assert.equal(await page.locator('#qalculate-download').isDisabled(),true);
  assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
  const artifacts=process.env.QALCULATE_ARTIFACTS;if(artifacts){await mkdir(artifacts,{recursive:true});await page.evaluate(async()=>{scrollTo(0,0);await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});await page.screenshot({path:resolve(artifacts,`qalculate-${width}.png`),fullPage:true});}
  await context.close();
 }
 console.log('Qalculate desktop/mobile player controls, headings, real engines, plots, cancellation, sources and offline behavior passed.');
}finally{await browser.close();}
