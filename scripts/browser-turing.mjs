import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {appPages} from './browser-host.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const unary="blank: ' '\nstart state: scan\ninput: '111'\ntable:\n  scan:\n    '1': R\n    ' ': {write: '1', L: done}\n  done:\n";
const endless="blank: ' '\nstart state: loop\ninput: ''\ntable:\n  loop:\n    ' ': R\n";
const unicode="blank: '□'\nstart state: 扫描\ninput: '😀棋'\ntable:\n  扫描:\n    '😀': {write: '🧩', R: 第二步}\n  第二步:\n    '棋': {write: '星', R: 完成}\n  完成:\n";
const contentTypes={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm','.png':'image/png','.webp':'image/webp'};

try{
 for(const scenario of ['native','blob','blob-subpath']){
  const prefix=scenario==='blob-subpath'?'/toolbox/':'/',errors=[],missing=[],external=[];
  const context=await browser.newContext({viewport:{width:1440,height:950},hasTouch:true});
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());if(url.protocol==='blob:')return route.continue();
   if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
   try{
    assert.ok(url.pathname.startsWith(prefix),'asset escaped deployment prefix');
    const path=resolve('public',url.pathname.slice(prefix.length)||'index.html');
    await route.fulfill({body:await readFile(path),contentType:contentTypes[extname(path)]||'application/octet-stream'});
   }catch{missing.push(url.pathname);await route.abort();}
  });
  // Preserve real Worker imports/fetch semantics while exercising a blob: entry.
  // Count live threads in every scenario to verify cancellation and page leave.
  await context.addInitScript(useBlob=>{
   const Native=Worker;let sequence=0;window.__turingWorkers=0;window.__turingLive=new Set();
   window.Worker=class extends Native{
    constructor(url,options){
     const original=new URL(url,location.href);
     if(!original.pathname.endsWith('/turing/worker.js')){super(url,options);return;}
     let bootstrap;
     if(useBlob)bootstrap=URL.createObjectURL(new Blob([(options?.type==='module'?'import(':'importScripts(')+JSON.stringify(original.href)+');'],{type:'text/javascript'}));
     super(bootstrap||url,options);this.__turingId=++sequence;this.__turingBlob=bootstrap;
     window.__turingWorkers++;window.__turingLive.add(this.__turingId);
    }
    terminate(){super.terminate();if(this.__turingId)window.__turingLive.delete(this.__turingId);if(this.__turingBlob){URL.revokeObjectURL(this.__turingBlob);this.__turingBlob=undefined;}}
   };
  },scenario!=='native');
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto('https://arg.test'+prefix+'#turing');
  await page.waitForSelector('#panel-turing:not([hidden]) #turing-compile');
  const go=async id=>{await page.evaluate(id=>location.hash=id,id);await page.waitForSelector('#panel-'+id+':not([hidden])');};
  const value=async id=>page.locator('#'+id).evaluate(node=>'value' in node?node.value:node.textContent);
  const steps=async()=>Number((await value('turing-steps')).match(/-?\d+/)?.[0]);
  const compile=async(rules,input,head='0')=>{
   await page.locator('#turing-rules').fill(rules);await page.locator('#turing-input').fill(input);await page.locator('#turing-head').fill(head);
   await page.locator('#turing-compile').click();
   await page.waitForFunction(()=>['ready','halted'].includes(document.querySelector('#panel-turing').dataset.phase)||document.querySelector('#turing-status').classList.contains('error'));
   assert.equal(await page.locator('#turing-step').isEnabled(),true,await value('turing-status'));assert.equal(await steps(),0);
  };
  const step=async count=>{
   await page.locator('#turing-step').click();
   await page.waitForFunction(count=>Number(document.querySelector('#turing-steps').textContent.match(/-?\d+/)?.[0])===count,count);
  };
  const finish=async()=>{
   await page.waitForFunction(()=>['halted','paused','limit'].includes(document.querySelector('#panel-turing').dataset.phase));
   assert.equal(await page.locator('#turing-status').evaluate(node=>node.classList.contains('error')),false,await value('turing-status'));
  };
  const graph=async()=>page.locator('#turing-graph').evaluate(root=>({
   states:[...root.querySelectorAll('[data-state]')].map(node=>node.dataset.state).sort(),
   current:[...root.querySelectorAll('[data-state][data-current="true"]')].map(node=>node.dataset.state),
   active:[...root.querySelectorAll('[data-rule-id][data-active="true"]')].map(node=>node.dataset.ruleId),
  }));
  const assertGraphPaths=async name=>{
   const paths=await page.locator('#turing-graph path[data-rule-id]').evaluateAll(nodes=>nodes.map(node=>{
    const edge=node.closest('[data-target]'),from=node.ownerSVGElement.querySelector('[data-state]')?.dataset.state;
    const label=edge?.querySelector('text'),labelBox=label?.getBBox(),pathBox=node.getBBox();
    return{id:node.dataset.ruleId,d:node.getAttribute('d'),length:node.getTotalLength(),selfLoop:edge?.dataset.target===from,labelBottom:labelBox?labelBox.y+labelBox.height:null,pathTop:pathBox.y};
   }));
   assert.ok(paths.length>0,name+' must include real transition geometry');
   for(const path of paths){
    assert.ok(path.length>0,name+' transition '+path.id+' has no drawable SVG geometry: '+path.d);
    if(path.selfLoop)assert.ok(path.labelBottom<path.pathTop,name+' self-loop label overlaps the actual curve: '+JSON.stringify(path));
   }
  };

  assert.equal(await page.locator('.rail-groups [data-rail-expand="programming"]').count(),1,'one inline programming group with actual task links');
  assert.equal(await page.locator('#panel-turing .tool-help-button').count(),1);
  assert.equal(await page.locator('#panel-turing .tool-provenance').evaluate(node=>node===node.parentElement.lastElementChild),true);
  // The default example is executable, not merely an illustrative diagram.
  assert.equal(await page.locator('#turing-input').inputValue(),'00101');
  await page.locator('#turing-compile').click();await page.waitForFunction(()=>document.querySelector('#panel-turing').dataset.phase==='ready');
  await assertGraphPaths('default self-loop and terminal edge');
  await page.locator('#turing-run').click();await finish();assert.equal(await value('turing-output'),'11010');
  for(const [template,expected,count]of [['increment','1000',8],['unary','1111',4]]){
   await page.locator('#turing-example').selectOption(template);
   assert.equal(await page.locator('#turing-input').inputValue(),'111','actual template sets its initial tape');
   await page.locator('#turing-compile').click();
   await page.waitForFunction(()=>document.querySelector('#panel-turing').dataset.phase==='ready'||document.querySelector('#turing-status').classList.contains('error'));
   assert.equal(await page.locator('#turing-step').isEnabled(),true,template+' template: '+await value('turing-status'));
   await page.locator('#turing-run').click();await finish();
   assert.equal(await value('turing-output'),expected,template+' template executes the real upstream engine');assert.equal(await steps(),count);
  }
  await compile(unary,'111');
  assert.equal(await value('turing-state'),'scan');
  assert.deepEqual(await graph(),{states:['done','scan'],current:['scan'],active:[]});
  await assertGraphPaths('unary self-loop and cross-state edge');
  await page.locator('#turing-graph [data-state="done"]').press('Enter');
  assert.equal(await page.locator('#turing-graph-state').inputValue(),'done');
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset.state),'done','state graph redraw preserves the actual keyboard node focus');
  assert.deepEqual(await graph(),{states:['done'],current:[],active:[]});
  assert.equal(await page.locator('#turing-transitions tbody tr').count(),0,'graph selection changes the compiled transition list');
  await page.locator('#turing-graph-state').selectOption('');
  await step(1);assert.equal(await value('turing-state'),'scan');assert.equal(await value('turing-output'),'111');
  const firstEdge=(await graph()).active;assert.equal(firstEdge.length,1,'actual last transition is highlighted');
  await page.locator('#turing-back').click();await page.waitForFunction(()=>document.querySelector('#turing-steps').textContent==='0');
  assert.equal(await value('turing-output'),'111');
  assert.deepEqual((await graph()).active,[],'undo restores graph transition state');
  await page.locator('#turing-run').click();await finish();
  assert.equal(await steps(),4);assert.equal(await value('turing-state'),'done');assert.equal(await value('turing-output'),'1111');
  assert.deepEqual((await graph()).current,['done']);
  await page.locator('#turing-graph-state').selectOption('scan');
  assert.deepEqual((await graph()).current,['done']);assert.equal((await graph()).active.length,1);assert.notDeepEqual((await graph()).active,firstEdge,'terminal edge comes from executed rule');
  await page.locator('#turing-graph-state').selectOption('');
  await page.locator('#turing-back').click();await page.waitForFunction(()=>document.querySelector('#turing-steps').textContent==='3');
  assert.equal(await value('turing-state'),'scan');assert.equal(await value('turing-output'),'111');
  await step(4);assert.equal(await value('turing-output'),'1111');
  await page.locator('#turing-reset').click();await page.waitForFunction(()=>document.querySelector('#turing-steps').textContent==='0');
  assert.equal(await value('turing-output'),'111');assert.equal(await value('turing-state'),'scan');

  await compile(unicode,'😀棋');await page.locator('#turing-run').click();await finish();
  assert.equal(await steps(),2);assert.equal(await value('turing-state'),'完成');assert.equal(await value('turing-output'),'🧩星');
  assert.ok(await page.locator('#turing-tape').textContent().then(text=>text.includes('🧩')&&text.includes('星')),'Unicode code points are individual cells');
  const tapeDownload=page.waitForEvent('download');await page.locator('#turing-save-output').click();
  assert.equal(await readFile(await(await tapeDownload).path(),'utf8'),'🧩星','download keeps real Unicode tape output');
  await page.evaluate(()=>{
   window.__originalTuringClipboard=navigator.clipboard.writeText;
   navigator.clipboard.writeText=async text=>{window.__turingCopied=text;};
  });
  await page.locator('#turing-copy').click();await page.waitForFunction(()=>document.querySelector('#turing-status').textContent==='纸带已复制');
  assert.equal(await page.evaluate(()=>window.__turingCopied),'🧩星','copy uses the real Unicode tape');
  await page.evaluate(()=>{
   const button=document.querySelector('#turing-copy');window.__originalTuringCopyHandler=button.onclick;
   button.onclick=function(event){return window.__turingCopyTask=window.__originalTuringCopyHandler.call(this,event);};
   navigator.clipboard.writeText=text=>{window.__turingCopied=text;return new Promise(resolve=>{window.__finishTuringCopy=resolve;});};
  });
  await page.locator('#turing-copy').click();await page.waitForFunction(()=>typeof window.__finishTuringCopy==='function');
  await page.locator('#turing-input').fill('changed during copy');
  const invalidatedCopyStatus=await value('turing-status');assert.match(invalidatedCopyStatus,/输入已修改/);
  await page.evaluate(async()=>{
   window.__finishTuringCopy();await window.__turingCopyTask;
   navigator.clipboard.writeText=window.__originalTuringClipboard;document.querySelector('#turing-copy').onclick=window.__originalTuringCopyHandler;
   delete window.__finishTuringCopy;delete window.__turingCopyTask;delete window.__originalTuringCopyHandler;delete window.__originalTuringClipboard;
  });
  assert.equal(await value('turing-status'),invalidatedCopyStatus,'a settled old clipboard task cannot overwrite input invalidation');
  assert.equal(await value('turing-output'),'');

  const missingRule="blank: ' '\nstart state: scan\ninput: 'ab'\ntable:\n  scan:\n    'a': R\n";
  await compile(missingRule,'ab');await page.locator('#turing-run').click();await finish();
  assert.equal(await steps(),1);assert.equal(await value('turing-state'),'scan');assert.equal(await value('turing-output'),'ab','undefined transition halts without modifying tape');

  const unsafeState='<img src=x onerror="window.injected=true">';
  const safeText=`blank: ' '\nstart state: '${unsafeState}'\ninput: 'a'\ntable:\n  '${unsafeState}':\n    'a': {write: '<', S: '<done>'}\n  '<done>':\n`;
  await compile(safeText,'a');assert.deepEqual((await graph()).current,[unsafeState]);
  await page.locator('#turing-run').click();await finish();assert.equal(await value('turing-output'),'<');
  assert.equal(await page.evaluate(()=>window.injected),undefined);assert.equal(await page.locator('#panel-turing img,#panel-turing script,#panel-turing foreignObject').count(),0,'untrusted state names and symbols remain text');

  // Signed initial positions and a leftward write use real sparse tape cells.
  const negative="blank: ' '\nstart state: left\ninput: ''\ntable:\n  left:\n    ' ': {write: '左', L: right}\n  right:\n    ' ': {write: '右', R: done}\n  done:\n";
  await compile(negative,'','-2');await page.locator('#turing-run').click();await finish();
  assert.equal(await value('turing-output'),'右左');assert.equal(await steps(),2);

  // Every input change immediately invalidates the execution and downloads.
  await page.locator('#turing-input').fill('new');
  assert.equal(await page.locator('#turing-step').isDisabled(),true);assert.equal(await page.locator('#turing-back').isDisabled(),true);
  assert.equal(await value('turing-output'),'');
  await compile(unary,'111');await page.locator('#turing-rules').fill('table: [');await page.locator('#turing-compile').click();
  await page.waitForSelector('#turing-status.error');assert.equal(await page.locator('#turing-step').isDisabled(),true);assert.equal(await value('turing-output'),'');
  await compile(unary,'111');await page.locator('#turing-run').click();await finish();assert.equal(await value('turing-output'),'1111');

  // Export/import preserves source, Unicode input and signed head rather than
  // serializing a mutable VM snapshot. The file is read through the real picker.
  await compile(unicode,'😀棋');await page.locator('#turing-head').fill('-3');
  const download=page.waitForEvent('download');await page.locator('#turing-export').click();
  const saved=await download,bytes=await readFile(await saved.path());
  assert.deepEqual(JSON.parse(bytes.toString('utf8')),{format:'mist-turing',version:1,rules:unicode,input:'😀棋',head:-3});
  await page.locator('#turing-rules').fill('invalid');await page.locator('#turing-input').fill('lost');await page.locator('#turing-head').fill('7');
  await page.locator('#turing-file').setInputFiles({name:saved.suggestedFilename(),mimeType:'text/plain',buffer:bytes});
  await page.waitForFunction(source=>document.querySelector('#turing-rules').value===source,unicode);
  assert.equal(await page.locator('#turing-input').inputValue(),'😀棋');assert.equal(await page.locator('#turing-head').inputValue(),'-3');
  await page.locator('#turing-file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"format":"mist-turing","version":999,"rules":"bad","input":"lost","head":1}')});
  await page.waitForSelector('#turing-status.error');assert.equal(await page.locator('#turing-rules').inputValue(),unicode,'invalid import is atomic');
  assert.equal(await page.locator('#turing-input').inputValue(),'😀棋');assert.equal(await page.locator('#turing-head').inputValue(),'-3');

  // Bound actual execution, cancel while running, then leave without an orphan
  // Worker. Waiting observes real state/counters, not a fixed timing delay.
  await compile(endless,'');await page.locator('#turing-limit').fill('20');
  await page.locator('#turing-run').click();await finish();assert.equal(await steps(),20);assert.match(await value('turing-status'),/上限|限额|限制/);
  await page.locator('#turing-reset').click();await page.locator('#turing-limit').fill('100000');
  await page.locator('#turing-run').click();await page.waitForFunction(()=>!document.querySelector('#turing-pause').disabled);
  await page.locator('#turing-pause').click();await page.waitForFunction(()=>document.querySelector('#turing-pause').disabled&&!document.querySelector('#turing-step').disabled);
  const paused=await steps();assert.ok(paused<100000);await step(paused+1);
  await page.locator('#turing-run').click();await page.waitForFunction(()=>!document.querySelector('#turing-pause').disabled);
  await go('home');assert.equal(await page.evaluate(()=>window.__turingLive.size),0,'leave terminates local execution immediately');
  await go('turing');assert.equal(await page.locator('#turing-rules').inputValue(),endless,'navigation preserves draft nodes');
  assert.equal(await page.locator('#turing-pause').isDisabled(),true);
  await compile(endless,'');await page.locator('#turing-run').click();await page.waitForFunction(()=>!document.querySelector('#turing-pause').disabled);
  await page.locator('#turing-input').fill('changed');
  assert.equal(await page.locator('#panel-turing').getAttribute('data-phase'),'empty');assert.equal(await value('turing-output'),'');
  assert.equal(await page.locator('#turing-pause').isDisabled(),true);assert.equal(await page.evaluate(()=>window.__turingLive.size),0,'editing cancels worker before any stale snapshot');
  await compile(unary,'111');await page.locator('#turing-run').click();await finish();assert.equal(await value('turing-output'),'1111');

  if(scenario==='blob-subpath'){
   for(const file of ['turing/core.js','vendor/turing/js-yaml.mjs']){
    const resource='https://arg.test'+prefix+file;
    await context.route(resource,route=>route.fulfill({status:503,body:'Unavailable'}));
    await page.locator('#turing-compile').click();await page.waitForSelector('#turing-status.error');
    assert.equal(await page.locator('#turing-compile').isEnabled(),true);assert.equal(await page.locator('#turing-step').isDisabled(),true);assert.equal(await value('turing-output'),'');
    await context.unroute(resource);await compile(unary,'111');await page.locator('#turing-run').click();await finish();assert.equal(await value('turing-output'),'1111','fresh worker recovers after module load failure: '+file);
   }
   await page.evaluate(()=>{window.__workingTuringWorker=Worker;window.Worker=class{constructor(){throw new DOMException('Blocked','SecurityError');}};});
   await page.locator('#turing-compile').click();await page.waitForSelector('#turing-status.error');assert.equal(await page.locator('#turing-compile').isEnabled(),true);
   await page.evaluate(()=>{window.Worker=window.__workingTuringWorker;delete window.__workingTuringWorker;});await compile(unary,'111');
  }

  // A long tape stays internally bounded; common controls remain inside both
  // phone and desktop viewports under normal and reduced-motion preferences.
  await compile(unary,'1'.repeat(300));
  for(const width of [320,390,800,1440]){
   await page.setViewportSize({width,height:950});
   const bounds=await page.locator('#panel-turing').evaluate((root,width)=>({
    scroll:document.documentElement.scrollWidth,
    controls:[...root.querySelectorAll('button,input,textarea,select')].filter(node=>{const rect=node.getBoundingClientRect();return rect.width&&rect.height&&(rect.left<-.5||rect.right>width+1);}).map(node=>node.id),
    cells:root.querySelectorAll('#turing-tape [data-index]').length,
   }),width);
   assert.ok(bounds.scroll<=width+1,scenario+' overflow '+width+': '+bounds.scroll);assert.deepEqual(bounds.controls,[],scenario+' controls '+width);
   assert.ok(bounds.cells>0&&bounds.cells<=41,'bounded tape rendering, '+bounds.cells+' cells');
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=391),'200% text does not overflow');
  await page.emulateMedia({reducedMotion:'reduce'});await compile(unary,'111');await page.locator('#turing-run').click();await finish();assert.equal(await value('turing-output'),'1111');
  assert.ok(await page.evaluate(()=>window.__turingWorkers)>5,'real local worker exercised');
  assert.equal(await page.locator('iframe').count(),0);assert.equal(appPages(context).length,1);
  assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});
  console.log(scenario+' PASS: real YAML machine compilation/execution, unary/Unicode/signed tape, step/back/reset, atomic invalidation/error recovery, actual import/export, step cap/pause/page-leave cleanup, bounded tape and 320–1440px/200% text/reduced motion; no external requests or windows.');
  await context.close();
 }
}finally{await browser.close();}
