import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';

const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm','.png':'image/png','.webp':'image/webp'};

async function production({width=1440,motion='reduce',prefix='/',failCatalogue=false}={}){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:motion,hasTouch:width<1100});
 const errors=[],missing=[],external=[];let unavailable=failCatalogue,catalogueRequests=0;
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(['blob:','data:'].includes(url.protocol))return route.continue();
  if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
  if(url.pathname===prefix+'vendor/cyberchef/catalogue.json'){
   catalogueRequests++;if(unavailable)return route.fulfill({status:503,body:'Unavailable'});
  }
  try{
   assert.ok(url.pathname.startsWith(prefix),'resource must stay inside its deployment directory');
   const file=resolve('public',url.pathname.slice(prefix.length)||'index.html');
   return route.fulfill({body:await readFile(file),contentType:mime[extname(file)]||'application/octet-stream'});
  }catch{missing.push(url.pathname);return route.abort();}
 });
 const page=await context.newPage();page.setDefaultTimeout(20000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('https://arg.test'+prefix+'#home');
 await page.locator('#workspace-search-input').waitFor({state:'visible'});
 const input=page.locator('#workspace-search-input'),popover=page.locator('.workspace-search-popover'),options=popover.locator('[role=option]');
 const go=async(id,task='native:'+id)=>{
  await page.evaluate(({id,task})=>location.hash=id+'?task='+encodeURIComponent(task),{id,task});
  await page.waitForFunction(({id,task})=>{const panel=document.getElementById('panel-'+id);return panel&&!panel.hidden&&panel.querySelector('[data-current-capability]')?.dataset.currentCapability===task;},{id,task});
 };
 const search=async(value,id)=>{
  await input.fill(value);await popover.waitFor({state:'visible'});
  if(id)await popover.locator('[data-capability="'+id+'"]').waitFor({state:'visible'});
  else await options.first().waitFor({state:'visible'});
 };
 const closed=async()=>{
  assert.equal(await popover.evaluate(node=>node.hidden&&node.inert),true);
  assert.equal(await input.getAttribute('aria-expanded'),'false');
  assert.equal(await input.getAttribute('aria-activedescendant'),null);
 };
 return{context,page,input,popover,options,go,search,closed,errors,missing,external,get catalogueRequests(){return catalogueRequests;},recover(){unavailable=false;}};
}

async function bounds(scope,label){
 const geometry=await scope.popover.evaluate(popover=>{
  const r=popover.getBoundingClientRect(),input=document.getElementById('workspace-search-input'),f=input.getBoundingClientRect();
  return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:innerWidth,height:innerHeight,inputBottom:f.bottom,scroll:document.documentElement.scrollWidth,focused:document.activeElement===input};
 });
 assert.ok(geometry.left>=-1&&geometry.right<=geometry.width+1,label+' horizontal bounds: '+JSON.stringify(geometry));
 assert.ok(geometry.top>=geometry.inputBottom-1&&geometry.bottom<=geometry.height+1,label+' vertical bounds: '+JSON.stringify(geometry));
 assert.ok(geometry.scroll<=geometry.width+1,label+' document cannot overflow');
 assert.equal(geometry.focused,true,label+' keeps the real input focused');
}

try{
 for(const width of [1440,390])for(const motion of ['no-preference','reduce']){
  const scope=await production({width,motion,prefix:width===390?'/toolbox/':'/'});
  const {page,input,popover,options,go,search,closed}=scope;
  try{
   await go('basics','topic:character-codes');await page.locator('#basics-input').fill('PRIVATE_ARG_CLUE_中');
   await go('file','native:hex-editor');
   await page.locator('#file-input').setInputFiles({name:'PRIVATE_ARG_FILE.bin',mimeType:'application/octet-stream',buffer:Buffer.from([0,65,255,66])});
   await page.locator('#hex-download:enabled').waitFor();
   await page.evaluate(()=>{
    window.__inlineNodes={search:document.getElementById('workspace-search-input'),file:document.getElementById('file-input'),selected:document.getElementById('file-input').files[0],text:document.getElementById('basics-input')};
    const animate=Element.prototype.animate;window.__inlineAnimations=[];
    Element.prototype.animate=function(...args){const animation=Reflect.apply(animate,this,args);if(this.matches('.workspace-search-popover')||this.closest('.workspace-search-popover'))window.__inlineAnimations.push(animation);return animation;};
   });
   // The header itself contains the genuine input; focus opens suggestions.
   await input.focus();await popover.waitFor({state:'visible'});
   assert.equal(await input.getAttribute('role'),'combobox');
   assert.equal(await input.getAttribute('aria-controls'),'workspace-search-results');
   assert.equal(await popover.evaluate(node=>node instanceof HTMLDialogElement||!!node.closest('dialog')),false);
   assert.equal(await page.locator('dialog[open]').count(),0,'search cannot create a modal or backdrop');
   assert.equal(await page.locator('main').evaluate(node=>node.inert),false,'search cannot make the tool workspace inert');
   await search('ASCII','topic:character-codes');
   assert.ok(await popover.locator('[data-capability="topic:character-codes"] .search-match-details mark').count(),'alias explains a match outside the topic title');
   for(const [term,id]of [['字符','topic:character-codes'],['Bsae64','topic:base-family'],['From Base64','topic:base-family']]){
    await search(term,id);
    assert.ok(await popover.locator('[data-capability="'+id+'"] mark.search-match').count(),term+' has actual matched characters');
   }
   await search('ASCII','topic:character-codes');
   const baseAnimations=await page.evaluate(()=>window.__inlineAnimations.length);
   for(const [term,id]of [['Bsae64','topic:base-family'],['Pyhton','topic:code-runner'],['纸笔解题','topic:paper-puzzles'],['ASCII','topic:character-codes']])await search(term,id);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   assert.equal(await page.evaluate(()=>window.__inlineAnimations.length),baseAnimations,'filtering updates immediately without replaying entry animations');
   if(motion==='reduce')assert.equal(baseAnimations,0,'reduced motion suppresses inline entry animation');
   assert.deepEqual(await page.evaluate(()=>({search:document.getElementById('workspace-search-input')===window.__inlineNodes.search,file:document.getElementById('file-input')===window.__inlineNodes.file,selected:document.getElementById('file-input').files[0]===window.__inlineNodes.selected,text:document.getElementById('basics-input')===window.__inlineNodes.text,value:document.getElementById('basics-input').value})),{search:true,file:true,selected:true,text:true,value:'PRIVATE_ARG_CLUE_中'},'opening and filtering search preserve original controls, files and clue text');
   await bounds(scope,width+'px '+motion);

   await search('Base64','topic:base-family');assert.ok(await options.count()>1,'keyboard traversal has more than one real result');
   await input.press('ArrowDown');assert.equal(await input.getAttribute('aria-activedescendant'),'workspace-search-option-0');
   await input.press('ArrowDown');assert.equal(await input.getAttribute('aria-activedescendant'),'workspace-search-option-1','the second ArrowDown advances rather than resetting to the first result');
   await input.press('ArrowUp');assert.equal(await input.getAttribute('aria-activedescendant'),'workspace-search-option-0');
   assert.equal(await input.evaluate(node=>document.activeElement===node),true,'list navigation leaves focus on the combobox');
   await input.press('Escape');await closed();assert.equal(await input.evaluate(node=>document.activeElement===node),true);
   await input.click();await search('ASCII','topic:character-codes');await input.press('Enter');await page.locator('#panel-basics:not([hidden])').waitFor();await closed();
   assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('task'),'topic:character-codes','Enter activates the genuine selected task');

   // Composition events exercise the IME contract without pretending a partially
   // composed word is already an ordinary input or navigation command.
   await search('ASCII','topic:character-codes');const beforeIME={url:page.url(),results:await options.evaluateAll(nodes=>nodes.map(node=>node.dataset.capability||node.dataset.route))};
   await input.evaluate(node=>{
    node.dispatchEvent(new CompositionEvent('compositionstart',{data:'纸',bubbles:true}));node.value='纸笔解题';
    node.dispatchEvent(new InputEvent('input',{data:'纸笔解题',isComposing:true,bubbles:true}));
    node.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',isComposing:true,bubbles:true,cancelable:true}));
    node.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true,cancelable:true}));
   });
   assert.equal(page.url(),beforeIME.url);assert.deepEqual(await options.evaluateAll(nodes=>nodes.map(node=>node.dataset.capability||node.dataset.route)),beforeIME.results,'partial IME input does not replace the visible result selection');
   assert.equal(await input.getAttribute('aria-activedescendant'),null);
   await input.evaluate(node=>node.dispatchEvent(new CompositionEvent('compositionend',{data:'纸笔解题',bubbles:true})));
   await popover.locator('[data-capability="topic:paper-puzzles"]').waitFor({state:'visible'});
   await input.press('Tab');await closed();assert.equal(await input.evaluate(node=>document.activeElement===node),false,'Tab leaves an inline search without a focus trap');
   await input.click();await search('Base64','topic:base-family');await page.locator('.site-header').click({position:{x:(await page.locator('.site-header').boundingBox()).width-2,y:32}});await closed();
   await input.click();await search('Base64','topic:base-family');await page.locator('#basics-input').focus();await closed();
   await input.click();await search('Base64','topic:base-family');await page.evaluate(()=>location.hash='about');await page.locator('#panel-about:not([hidden])').waitFor();await closed();
   await page.keyboard.press('Control+k');assert.equal(await input.evaluate(node=>document.activeElement===node),true);await popover.waitFor({state:'visible'});

   await search('From Base64','topic:base-family');
   const inverse=popover.locator('[data-capability="topic:base-family"]');assert.equal(await inverse.getAttribute('data-op'),'From Base64');await inverse.click();
   await page.waitForFunction(()=>document.querySelector('#ct-encoding')?.dataset.operation==='From Base64');await closed();
   const query=new URLSearchParams(new URL(page.url()).hash.split('?')[1]);assert.equal(query.get('task'),'topic:base-family');assert.equal(query.get('op'),'From Base64');
   await search('电报码反查汉字','native:hanzi-telegraph');await popover.locator('[data-capability="native:hanzi-telegraph"]').click();
   await page.waitForFunction(()=>document.querySelector('#hanzi-mode')?.value==='tele-decode');assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('dir'),'decode');await closed();
   await search('Pyhton','topic:code-runner');
   assert.equal(await popover.locator('[data-capability="native:code-python"]').count(),0,'a language is a mode of one code workspace, not a duplicate result');
   await popover.locator('[data-capability="topic:code-runner"]').click();
   await page.waitForFunction(()=>!document.querySelector('#panel-code')?.hidden&&document.querySelector('#code-language')?.value==='python');await closed();
   const pythonRoute=new URLSearchParams(new URL(page.url()).hash.split('?')[1]);
   assert.equal(pythonRoute.get('task'),'topic:code-runner');assert.equal(pythonRoute.get('view'),'native:code-python','search retains the requested real language after topic consolidation');
   assert.equal(await page.evaluate(()=>document.getElementById('file-input')===window.__inlineNodes.file&&document.getElementById('file-input').files[0]===window.__inlineNodes.selected),true,'opening a topic mode retains the original selected clue file');

   if(width<1100){
    for(const viewport of [{width:320,height:844},{width:390,height:844},{width:390,height:400}]){
     await page.setViewportSize(viewport);await input.click();await search('Base64','topic:base-family');await bounds(scope,viewport.width+'×'+viewport.height+' '+motion);
    }
   }
   await input.press('Escape');await closed();
   // The same evidence reaches the real home, rail and complete directory.
   await page.setViewportSize({width,height:900});
   await page.evaluate(()=>location.hash='home');
   const homeSearch=page.locator('#panel-home .capability-search input');await homeSearch.fill('ASCII');
   const homeResult=page.locator('#panel-home [data-capability="topic:character-codes"]');
   await homeResult.waitFor({state:'visible'});
   assert.ok(await homeResult.locator('.search-match-details mark').count());
   await homeSearch.fill('');assert.equal(await page.locator('#panel-home mark.search-match').count(),0,'clearing search removes transient marks');
   if(width<1100)await page.locator('.workbench-menu').click();
   await page.locator('.rail-filter input').fill('ASCII');
   const railResult=page.locator('.rail-search-results [data-capability="topic:character-codes"]');await railResult.waitFor({state:'visible'});
   assert.ok(await railResult.locator('.search-match-details mark').count());
   await page.locator('.rail-directory-button').click();
   await page.locator('.directory-search input').fill('ASCII');
   const directoryResult=page.locator('.directory-grid [data-capability="topic:character-codes"]');await directoryResult.waitFor({state:'visible'});
   assert.ok(await directoryResult.locator('.search-match-details mark').count());
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'highlight snippets do not widen the page');
   await page.getByRole('button',{name:'关闭工具目录',exact:true}).click();
   const safety=await page.evaluate(async()=>{
    const {SearchHighlight}=await import('./ui/index.js');
    const text='<img src=x onerror=alert(1)> & "文本"',node=SearchHighlight({text,ranges:[[1,4],[30,32]]});
    return {text:node.textContent,images:node.querySelectorAll('img').length,mark:node.querySelector('mark').textContent};
   });
   assert.deepEqual(safety,{text:'<img src=x onerror=alert(1)> & "文本"',images:0,mark:'img'},'highlighting never parses text as HTML');
   assert.equal(await page.evaluate(()=>document.getElementById('workspace-search-input')===window.__inlineNodes.search),true,'routing and viewport changes retain the original header input');
   assert.equal(scope.context.pages().length,1);assert.deepEqual({errors:scope.errors,missing:scope.missing,external:scope.external},{errors:[],missing:[],external:[]});
   console.log('PASS inline search '+width+'px '+motion+': fuzzy/exact/Chinese/direction routes, keyboard, IME, nonmodal focus, original nodes/files, motion and viewport bounds');
  }finally{await scope.context.close();}
 }

 const recovery=await production({failCatalogue:true,prefix:'/nested/'});
 try{
  const {page,input,popover,search}=recovery;
  await input.focus();await input.fill('Base64');await page.waitForFunction(()=>document.querySelector('.workspace-search-info').textContent.includes('再次输入可重试'));
  const route=page.url(),attempts=recovery.catalogueRequests;assert.ok(attempts>0);
  assert.equal(await input.getAttribute('aria-expanded'),'true','failed suggestions remain available for retry');
  recovery.recover();await search('Base64 ','topic:base-family');
  assert.ok(recovery.catalogueRequests>attempts,'a later input genuinely reloads a failed catalogue');assert.equal(page.url(),route,'catalogue retry does not replace the current route');
  assert.equal(await popover.locator('[data-capability="topic:base-family"]').isVisible(),true);
  assert.deepEqual({errors:recovery.errors,missing:recovery.missing,external:recovery.external},{errors:[],missing:[],external:[]});
  console.log('PASS inline search failed local catalogue retries in place without changing routes');
 }finally{await recovery.context.close();}
}finally{await browser.close();}

