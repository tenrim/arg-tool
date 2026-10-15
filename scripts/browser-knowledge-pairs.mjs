import {chooseOperation} from './browser-navigation.mjs';
import {createRequire} from 'node:module';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {createCipheriv} from 'node:crypto';
import assert from 'node:assert/strict';

// Exercise real production controls and engines. Transport routing serves only
// the checked-in site; no algorithm or knowledge response is substituted.
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm','.png':'image/png','.webp':'image/webp'};
await mkdir('/tmp/mist-knowledge-pairs',{recursive:true});
let active;

async function productionContext({prefix='/',motion='reduce',width=1440}={}){
 const errors=[],missing=[],external=[],popups=[];
 const context=await browser.newContext({viewport:{width,height:950},hasTouch:width<1100,reducedMotion:motion});
 await context.addInitScript(()=>{
  const Native=Worker;window.__knowledgeLiveWorkers=new Set();
  window.Worker=class extends Native{
   constructor(url,options){
    super(url,options);this.__knowledgeTracked=/\/cyberchef-worker\.js$/.test(new URL(url,location.href).pathname);
    this.__knowledgeStalled=this.__knowledgeTracked&&window.__knowledgeStallWorker;
    if(this.__knowledgeStalled)window.__knowledgeStallWorker=false;
    if(this.__knowledgeTracked)window.__knowledgeLiveWorkers.add(this);
   }
   postMessage(...args){if(!this.__knowledgeStalled)super.postMessage(...args);}
   terminate(){super.terminate();window.__knowledgeLiveWorkers.delete(this);}
  };
 });
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.protocol==='blob:'||url.protocol==='data:')return route.continue();
  if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
  try{
   assert.ok(url.pathname.startsWith(prefix),'resource escaped the deployment prefix');
   const path=resolve('public',url.pathname.slice(prefix.length)||'index.html');
   await route.fulfill({body:await readFile(path),contentType:mime[extname(path)]||'application/octet-stream'});
  }catch{missing.push(url.pathname);await route.abort();}
 });
 const page=await context.newPage();active=page;page.setDefaultTimeout(20000);
 page.on('pageerror',error=>errors.push(error.message));page.on('popup',popup=>popups.push(popup.url()));
 await page.goto('https://arg.test'+prefix+'#home');
 await page.waitForSelector('#panel-home [data-capability]');
 const go=async route=>{
  while(await page.locator('dialog[open]').count())await page.keyboard.press('Escape');
  await page.evaluate(route=>location.hash=route,route);
  await page.waitForSelector('#panel-'+route.split(/[/?]/)[0]+':not([hidden])');
 };
 const snapshot=async()=>page.evaluate(async()=>{
  const {loadRegistry}=await import(new URL('./capabilities/registry.js',location.href));
  const registry=await loadRegistry();
  return {categories:registry.categories,groups:registry.groups,entries:registry.entries,coverage:registry.coverage};
 });
 return {context,page,go,snapshot,assertClean(){assert.deepEqual({errors,missing,external,popups},{errors:[],missing:[],external:[],popups:[]});assert.equal(context.pages().length,1,'all tasks and articles stay in one document');}};
}

async function enginePairs(page){
 // A mounted production factory makes raw text adoption observable without
 // normalising CRLF through Playwright's textarea fill operation.
 const pairMetadata=await page.evaluate(async()=>{
  const {taskView}=await import(new URL('./chef-tools/task-view.js',location.href));
  const {loadRegistry}=await import(new URL('./capabilities/registry.js',location.href));
  const {getCatalogue}=await import(new URL('./chef-tools/catalog.js',location.href));
  const registry=await loadRegistry(),catalogue=await getCatalogue();
  const task=taskView({id:'knowledge-pair-probe',groups:['base','symmetric','clean'],chef:{},defaultOp:'To Base64'});
  document.getElementById('main').append(task.root);window.__knowledgePairProbe=task;
  await task.ready();
  const families=['To Base64','AES Encrypt','To Case Insensitive Regex'].map(op=>registry.entries.find(entry=>entry.sourceOperationIds.includes(op)));
  return {families,definitions:Object.fromEntries(['AES Encrypt','AES Decrypt'].map(op=>[op,catalogue.operations[op].args]))};
 });
 const probe=page.locator('#knowledge-pair-probe');
 const activate=async op=>{
  const entry=pairMetadata.families.find(item=>item.sourceOperationIds.includes(op));
  assert.ok(entry,'real family exists for '+op);assert.equal(entry.directions.length,2);
  await page.evaluate(async({entry,op})=>window.__knowledgePairProbe.selectCapability({capabilityId:entry.id,op,directions:entry.directions}),{entry,op});
  assert.equal(await probe.getAttribute('data-operation'),op);
 };
 const direction=async op=>{
  const button=probe.locator('.ct-direction');await button.focus();
  await button.evaluate(node=>window.__knowledgeDirectionNode=node);await button.selectOption(op);
  assert.equal(await probe.getAttribute('data-operation'),op);
  assert.equal(await probe.locator('.ct-download').isDisabled(),true,'direction change invalidates old output synchronously');
  assert.equal(await page.evaluate(()=>document.activeElement===window.__knowledgeDirectionNode),true,'direction switches retain their real focused control');
 };
 const run=async()=>{
  await probe.locator('.ct-run').click();
  await page.waitForFunction(()=>document.querySelector('#knowledge-pair-probe .ct-status').dataset.state==='success'||document.querySelector('#knowledge-pair-probe .ct-status').classList.contains('error'),null,{timeout:45000});
  assert.equal(await probe.locator('.ct-status').getAttribute('data-state'),'success',await probe.locator('.ct-status').textContent());
 };
 const download=async()=>{const ready=page.waitForEvent('download');await probe.locator('.ct-download').click();return readFile(await(await ready).path());};
 await activate('To Base64');
 const raw='ARG\r\n谜题\r\n';
 await page.evaluate(raw=>window.__knowledgePairProbe.adopt({kind:'text',source:'text',text:raw}),raw);
 assert.equal(await page.evaluate(()=>window.__knowledgePairProbe.getInput().text),raw);
 await run();assert.equal(await probe.locator('.ct-output').inputValue(),Buffer.from(raw).toString('base64'),'encoding consumes original CRLF rather than its normalised preview');
 const encoded=await probe.locator('.ct-output').inputValue();
 await direction('From Base64');
 assert.equal(await page.evaluate(()=>window.__knowledgePairProbe.getInput().text),raw,'a direction choice preserves the caller-owned original input, not the old output');
 await probe.locator('.ct-input').fill(encoded);await run();
 assert.deepEqual(await download(),Buffer.from(raw),'decode exports exact original UTF-8 bytes and CRLF');
 await probe.locator('[data-arg="2"] input[type=checkbox]').check();
 await direction('To Base64');await direction('From Base64');
 assert.equal(await probe.locator('[data-arg="2"] input[type=checkbox]').isChecked(),true,'direction-specific strict mode survives its own draft without copying unrelated positions');

 await activate('AES Encrypt');
 const key='000102030405060708090a0b0c0d0e0f';
 const setArg=async(op,name,value)=>{
  const index=pairMetadata.definitions[op].findIndex(arg=>arg.name===name);assert.ok(index>=0,name+' exists');
  const field=probe.locator('[data-arg="'+index+'"]'),select=field.locator('select').first();
  if(await select.count()&&typeof value==='string'&&pairMetadata.definitions[op][index].type!=='toggleString')await select.selectOption(value);
  else await field.locator('input:not([type=checkbox]),textarea').first().fill(String(value));
 };
 const originalCipherInput=await page.evaluate(()=>window.__knowledgePairProbe.getInput());
 await direction('AES Decrypt');
 assert.deepEqual(await page.evaluate(()=>window.__knowledgePairProbe.getInput()),originalCipherInput,'direction-only selection preserves the original source and text, rather than adopting an output');
 assert.equal(await probe.locator('[data-arg="4"] select').inputValue(),'Hex','the opposite direction starts with its actual ciphertext input default');
 assert.equal(await probe.locator('[data-arg="5"] select').inputValue(),'Raw','the opposite direction starts with its actual plaintext output default');
 await setArg('AES Decrypt','Input','Raw');await setArg('AES Decrypt','Output','Hex');
 await direction('AES Encrypt');await direction('AES Decrypt');
 assert.equal(await probe.locator('[data-arg="4"] select').inputValue(),'Raw','user-defined target input format remains that direction’s own draft');
 assert.equal(await probe.locator('[data-arg="5"] select').inputValue(),'Hex','user-defined target output format is not overwritten by the other direction’s names');
 assert.deepEqual(await page.evaluate(()=>window.__knowledgePairProbe.getInput()),originalCipherInput,'editing and revisiting direction-specific formats never replaces the caller-owned input');
 await setArg('AES Decrypt','Input','Hex');await setArg('AES Decrypt','Output','Raw');
 await direction('AES Encrypt');
 await setArg('AES Encrypt','Key',key);await setArg('AES Encrypt','Mode','ECB/NoPadding');await setArg('AES Encrypt','Input','Hex');await setArg('AES Encrypt','Output','Hex');
 const plain=Buffer.from('ARG puzzles 2026');assert.equal(plain.length,16);
 await probe.locator('.ct-input').fill(plain.toString('hex'));await run();
 const cipher=createCipheriv('aes-128-ecb',Buffer.from(key,'hex'),null);cipher.setAutoPadding(false);
 const expected=Buffer.concat([cipher.update(plain),cipher.final()]).toString('hex');
 const encrypted=(await probe.locator('.ct-output').inputValue()).replace(/\s/g,'');assert.equal(encrypted,expected,'AES output agrees with independent Node crypto');
 await direction('AES Decrypt');
 assert.equal(await probe.locator('[data-arg="0"] input').inputValue(),key,'named composite key transfers intact');
 assert.equal(await probe.locator('[data-arg="3"] select').inputValue(),'ECB/NoPadding','mode follows its name after the target schema inserts IV Length');
 assert.equal(await probe.locator('[data-arg="2"] input').inputValue(),'16','target-only IV Length keeps its actual default');
 await setArg('AES Decrypt','Output','Raw');await probe.locator('.ct-input').fill(encrypted);await run();assert.deepEqual(await download(),plain,'decrypt executes the actual opposite engine with the asymmetric argument schema');
 await probe.locator('.ct-use').click();await direction('AES Encrypt');
 assert.equal(await probe.getAttribute('data-operation'),'AES Encrypt');
 assert.equal(await probe.locator('.ct-source').inputValue(),'result','reverse adopts result bytes only through the explicit action');
 await run();assert.equal((await probe.locator('.ct-output').inputValue()).replace(/\s/g,''),expected,'explicit reverse maps raw output to the real encrypt input format');
 await probe.locator('.ct-use').click();await direction('AES Decrypt');await run();assert.deepEqual(await download(),plain,'explicit AES reverse maps hex ciphertext back to decrypt input without reinterpreting raw bytes');

 await activate('To Case Insensitive Regex');await probe.locator('.ct-source').selectOption('text');await probe.locator('.ct-input').fill('hello');await run();
 assert.equal(await probe.locator('.ct-output').inputValue(),'[hH][eE][lL][lL][oO]');
 await probe.locator('.ct-use').click();await direction('From Case Insensitive Regex');await run();assert.equal(await probe.locator('.ct-output').inputValue(),'hello','newly unified regex family supports the real opposite operation');
 await activate('To Base64');await probe.locator('.ct-source').selectOption('text');await probe.locator('.ct-input').fill('pending');
 await page.evaluate(()=>window.__knowledgeStallWorker=true);await probe.locator('.ct-run').click();
 await page.waitForFunction(()=>window.__knowledgeLiveWorkers.size===1);
 await direction('From Base64');
 assert.equal(await page.evaluate(()=>window.__knowledgeLiveWorkers.size),0,'a direction choice terminates in-flight work immediately');
 assert.equal(await page.evaluate(()=>window.__knowledgePairProbe.getInput().text),'pending','cancellation never rewrites the original input');
 assert.equal(await probe.locator('.ct-download').isDisabled(),true);
 await probe.locator('.ct-input').fill(Buffer.from('fresh result').toString('base64'));await run();
 assert.equal(await probe.locator('.ct-output').inputValue(),'fresh result','a fresh opposite direction recovers after cancellation');
 await page.evaluate(()=>{window.__knowledgePairProbe.deactivate();window.__knowledgePairProbe.root.remove();delete window.__knowledgePairProbe;});
}

async function taskCipherContinuation({page,go}){
 await go('crypto/symmetric');
 const task=page.locator('#ct-crypto');
 await task.locator('.ct-run:enabled').waitFor();
 const choose=async op=>{await chooseOperation(page,op);assert.equal(await task.getAttribute('data-operation'),op);};
 await choose('AES Encrypt');
 const key='000102030405060708090a0b0c0d0e0f',iv='00000000000000000000000000000000',plain='ARG 测试\n谜题 🔐';
 await task.locator('[data-arg="0"] input').fill(key);await task.locator('[data-arg="1"] input').fill(iv);
 assert.equal(await task.locator('[data-arg="2"] select').inputValue(),'CBC');
 assert.equal(await task.locator('[data-arg="3"] select').inputValue(),'Raw');
 assert.equal(await task.locator('[data-arg="4"] select').inputValue(),'Hex');
 await task.locator('.ct-input').fill(plain);
 const run=async()=>{await task.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-crypto .ct-status').dataset.state==='success'||document.querySelector('#ct-crypto .ct-status').classList.contains('error'),null,{timeout:45000});assert.equal(await task.locator('.ct-status').getAttribute('data-state'),'success',await task.locator('.ct-status').textContent());};
 await run();
 const cipher=createCipheriv('aes-128-cbc',Buffer.from(key,'hex'),Buffer.from(iv,'hex'));
 const expected=Buffer.concat([cipher.update(Buffer.from(plain)),cipher.final()]).toString('hex');
 assert.equal((await task.locator('.ct-output').inputValue()).replace(/\s/g,''),expected,'default Raw/Hex AES-CBC consumes the original Unicode UTF-8 bytes and matches independent Node crypto');
 await task.locator('.ct-use').click();
 assert.equal(await task.locator('.ct-source').inputValue(),'result');
 assert.equal(await task.locator('.ct-download').isDisabled(),true,'explicit result adoption clears the old export');
 await choose('AES Decrypt');
 assert.equal(await task.locator('.ct-source').inputValue(),'result','task navigation keeps the explicitly adopted original result bytes');
 assert.equal(await task.locator('[data-arg="0"] input').inputValue(),key);
 assert.equal(await task.locator('[data-arg="1"] input').inputValue(),iv);
 assert.equal(await task.locator('[data-arg="3"] select').inputValue(),'CBC');
 assert.equal(await task.locator('[data-arg="4"] select').inputValue(),'Hex','adopted hexadecimal output becomes the declared inverse input representation');
 assert.equal(await task.locator('[data-arg="5"] select').inputValue(),'Raw','the original raw input representation becomes the inverse output representation');
 await run();assert.equal(await task.locator('.ct-output').inputValue(),plain,'continue-result plus task inverse navigation executes the real Unicode decrypt path');
 const ready=page.waitForEvent('download');await task.locator('.ct-download').click();
 assert.deepEqual(await readFile(await(await ready).path()),Buffer.from(plain),'continued AES decode exports exact original UTF-8 bytes, including newline and supplementary characters');
}

async function discoveryAndAliases({page,go},registry){
 const family=registry.entries.find(entry=>entry.sourceOperationIds.includes('To Base64'));
 const routeFor=(entry,op)=>entry.route+'?'+new URLSearchParams({task:entry.id,...(op?{op}:{})});
 await go('home');
 for(const category of registry.categories){
  await page.locator('#panel-home button[data-category="'+category.id+'"]').first().click();
  assert.equal(await page.locator('#panel-home [data-capability-group]').count(),registry.groups.filter(group=>group.category===category.id&&group.count).length,'home derives all '+category.title+' groups from the registry');
 }
 await page.locator('#home-search').fill('From Base64');
 assert.equal(await page.locator('#panel-home [data-capability]').evaluateAll((nodes,id)=>nodes.filter(node=>node.dataset.capability===id).length,family.id),1,'global discovery shows one family for the decoding name');
 await page.locator('#home-search').fill('To Base64');
 assert.equal(await page.locator('#panel-home [data-capability]').evaluateAll((nodes,id)=>nodes.filter(node=>node.dataset.capability===id).length,family.id),1,'the encoding name reaches the same single owner');
 for(const query of ['From Base64','Base64解码']){
  await go('home');await page.locator('#home-search').fill(query);
  const button=page.locator('#panel-home [data-capability]').filter({has:page.locator('.capability-label')});
  const target=button.filter({hasText:family.title});assert.equal(await target.count(),1);
  await target.click();await page.waitForFunction(()=>document.querySelector('#ct-encoding')?.dataset.operation==='From Base64');
  const task=page.locator('#ct-encoding');await task.locator('.ct-input').fill(Buffer.from('全局方向').toString('base64'));await task.locator('.ct-run').click();
  await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').dataset.state==='success',null,{timeout:45000});
  assert.equal(await task.locator('.ct-output').inputValue(),'全局方向','global '+query+' search preserves and executes the requested decode direction');
 }
 await go('home');await page.locator('.workspace-search-trigger').click();await page.locator('.workspace-search input').fill('From Base64');
 await page.locator('.workspace-search [data-capability]').filter({hasText:family.title}).click();
 await page.waitForFunction(()=>document.querySelector('#ct-encoding')?.dataset.operation==='From Base64');
 assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('op'),'From Base64','command search keeps the requested raw direction in its canonical route');
 await go('home');await page.locator('#home-search').fill('电报码反查汉字');
 const telegraph=registry.entries.find(entry=>entry.id==='native:hanzi-telegraph');
 await page.locator('#panel-home [data-capability]').filter({hasText:telegraph.title}).click();
 await page.waitForFunction(()=>document.querySelector('#hanzi-mode')?.value==='tele-decode');
 assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('dir'),'decode','global native reverse search carries its real direction');
 for(const [direction,mode]of [['encode','tele-encode'],['decode','tele-decode']]){
  const button=page.locator('.capability-native-directions [data-native-direction="'+direction+'"]');
  await button.focus();await button.evaluate(node=>window.__knowledgeNativeDirectionNode=node);await button.click();
  await page.waitForFunction(mode=>document.querySelector('#hanzi-mode')?.value===mode,mode);
  assert.equal(await page.evaluate(()=>document.activeElement===window.__knowledgeNativeDirectionNode),true,'native direction routing preserves the actual focused button');
  assert.equal(await page.evaluate(()=>document.querySelector('[data-native-direction="'+window.__knowledgeNativeDirectionNode.dataset.nativeDirection+'"]')===window.__knowledgeNativeDirectionNode),true,'native direction choices retain their DOM identity');
 }
 await go('encoding');
 const task=page.locator('#ct-encoding');await task.locator('.ct-run:enabled').waitFor();
 assert.equal(await page.locator('.ct-picker').count(),0,'Task workspace has no legacy picker');
 await chooseOperation(page,'From Base64');
 assert.equal(await task.locator('.ct-direction option').count(),2,'both real directions remain visible');
 await task.locator('.ct-input').fill(Buffer.from('方向合并').toString('base64'));await task.locator('.ct-run').click();
 await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').dataset.state==='success',null,{timeout:45000});
 assert.equal(await task.locator('.ct-output').inputValue(),'方向合并');
 await task.locator('.ct-direction').focus();await task.locator('.ct-direction').selectOption('To Base64');
 assert.equal(await page.evaluate(()=>document.activeElement?.value),'To Base64','task direction choice keeps keyboard focus');
 // Old IDs that once owned one raw operation resolve to the new canonical
 // family, while preserving the exact operation originally bookmarked.
 for(const op of ['To Base64','From Base64','To Case Insensitive Regex','From Case Insensitive Regex']){
  const entry=registry.entries.find(entry=>entry.sourceOperationIds.includes(op));
  const panel=entry.open.panel;
  await go(entry.route+'?'+new URLSearchParams({task:'op:'+encodeURIComponent(op)}));
  await page.waitForFunction(({panel,op})=>document.querySelector('#ct-'+panel)?.dataset.operation===op,{panel,op});
  assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('task'),entry.id,'old op deep link canonicalises without losing identity');
  assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('op'),op);
 }
 await go('hanzi?'+new URLSearchParams({task:'native:hanzi-telegraph-decode'}));
 await page.waitForFunction(()=>document.querySelector('#hanzi-mode')?.value==='tele-decode');
 assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('task'),'native:hanzi-telegraph');
 assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('dir'),'decode');
 await page.locator('#hanzi-input').fill('0022 0948');await page.locator('#hanzi-run').click();
 await page.waitForFunction(()=>/查询完成/.test(document.querySelector('#hanzi-status').textContent));
 assert.match(await page.locator('#hanzi-output').inputValue(),/0022\s*→\s*中[\s\S]*0948\s*→\s*国/,'the native family alias executes its original decode controller');

 await go('cyberchef');
 await page.waitForFunction(()=>document.querySelector('#cyberchef-stage').dataset.ready==='true',null,{timeout:45000});
 const chefPane=async name=>{if(await page.locator('#chef-tabs').isVisible())await page.locator('#chef-tabs [data-pane="'+name+'"]').click();};
 await chefPane('operations');
 await page.locator('#chef-category').selectOption('all');await page.locator('#chef-search').fill('Base64');
 const palette=page.locator('#chef-operations .chef-operation-family');
 assert.equal(await palette.evaluateAll((nodes,id)=>nodes.filter(node=>node.dataset.familyId===id).length,family.id),1,'the complete recipe palette also groups the two directions');
 await chefPane('recipe');await page.locator('#chef-clear-recipe').click();await chefPane('operations');
 const familyCard=palette.filter({has:page.locator('[data-operation="To Base64"]')});
 await familyCard.locator('[data-operation="To Base64"]').click();
 await chefPane('operations');
 await familyCard.locator('[data-operation="From Base64"]').click();
 assert.equal(await page.locator('#chef-recipe .chef-step').count(),2,'each direction adds its own original recipe operation');
 await chefPane('input');await page.locator('#chef-input').fill('ARG');await page.locator('#chef-run').click();
 await page.waitForFunction(()=>document.querySelector('#cyberchef-status').dataset.state==='success',null,{timeout:45000});
 assert.equal(await page.locator('#chef-output').inputValue(),'ARG','the grouped palette produces a real two-operation roundtrip');
 assert.equal(await page.locator('#chef-directory').count(),0,'The recipe workspace has no duplicate tool directory');

 const article=registry.entries.find(entry=>entry.category==='knowledge'&&entry.open.articleId==='function-native:ascii');
 assert.ok(article);
 await go('home');await page.locator('#home-search').fill(article.title);
 assert.equal(await page.locator('#panel-home [data-capability]').evaluateAll((nodes,id)=>nodes.filter(node=>node.dataset.capability===id).length,article.id),1);
 await page.locator('.workspace-search-trigger').click();await page.locator('.workspace-search input').fill(article.title);
 assert.equal(await page.locator('.workspace-search [data-capability]').evaluateAll((nodes,id)=>nodes.filter(node=>node.dataset.capability===id).length,article.id),1,'command search uses the same fifth-category registry');
 await page.keyboard.press('Escape');
 if(await page.locator('.layout>.workbench-sidebar').isHidden())await page.locator('.workbench-menu').click();
 await page.locator('.rail-directory-button').click();await page.waitForSelector('.tool-directory[open]');
 await page.locator('.tool-directory [data-filter="knowledge"]').click();
 const lessonCount=registry.entries.filter(entry=>entry.category==='knowledge'&&entry.listed!==false).length;
 assert.equal(await page.locator('.directory-capability').count(),Math.min(60,lessonCount),'the large directory keeps its bounded initial page');
 while(await page.locator('.tool-directory .directory-more').isVisible())await page.locator('.tool-directory .directory-more').click();
 assert.equal(await page.locator('.directory-capability').count(),lessonCount,'continued display exposes every precise lesson');
 await page.keyboard.press('Escape');
 await go(routeFor(family,'To Base64'));await task.locator('.ct-input').fill('保留这条线索');
 await task.locator('.ct-direction').focus();await task.locator('.ct-direction').selectOption('From Base64');
 assert.equal(await page.evaluate(()=>document.activeElement?.value),'From Base64','canonical direction choice keeps focus while synchronising its route');
 assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('op'),'From Base64');
 if(await page.locator('.layout>.workbench-sidebar').isHidden())await page.locator('.workbench-menu').click();
 const rail=page.locator('.rail-groups [data-route="browse/knowledge"]');
 assert.equal(await rail.count(),1,'the original sidebar includes the fifth category');
 await page.locator('.rail-filter input').fill(article.title);
 await page.locator('.rail-groups [data-capability="'+article.id+'"]:visible').click();
 await page.locator('#knowledge-detail [data-knowledge-detail="'+article.open.articleId+'"]').waitFor();
 await go(routeFor(family,'To Base64'));
 assert.equal(await task.locator('.ct-input').inputValue(),'保留这条线索','navigation to knowledge never discards the original clue input');
 await page.locator('.rail-filter input').evaluate(node=>{node.value='';node.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.evaluate(()=>localStorage.setItem('arg.ui.favorites.v1',JSON.stringify(['encoding','hanzi','knowledge'])));
 await page.reload();await page.waitForSelector('#ct-encoding[data-operation]');
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('arg.ui.favorites.v1'))),['encoding','hanzi','knowledge'],'old favorites remain compatible alongside the new page ID');
}

async function knowledgeReader({page,go},registry,{allArticles=false}={}){
 const articles=await page.evaluate(async()=>{
  const {ARTICLES}=await import(new URL('./knowledge/content.js',location.href));return ARTICLES;
 });
 const toolGroups=registry.groups.filter(group=>group.category!=='knowledge');
 const tools=registry.entries.filter(entry=>entry.category!=='knowledge'&&entry.listed!==false);
 assert.equal(articles.length,tools.length,'every concrete function owns a lesson');
 for(const entry of tools)assert.deepEqual(entry.learningIds,['learn:function-'+entry.id],'exact function learning link '+entry.id);
 assert.ok(articles.length>=toolGroups.length,'every existing tool group has meaningful knowledge content');
 for(const group of toolGroups)assert.ok(articles.some(article=>article.topicGroup===group.id),'knowledge covers '+group.title);
 assert.deepEqual(new Set(articles.map(article=>article.categoryId)),new Set(['codec','reference','media','other']),'the reader explains all four existing tool domains');
 const byArticle=new Map(registry.entries.filter(entry=>entry.category==='knowledge').map(entry=>[entry.open.articleId,entry]));
 assert.equal(byArticle.size,articles.length,'articles and fifth-category discovery use the same inventory');
 const open=async article=>{
  const entry=byArticle.get(article.id);assert.ok(entry,'article has a real registry destination');
  await go(entry.route+'?'+new URLSearchParams({task:entry.id}));
  await page.waitForSelector('#knowledge-detail [data-knowledge-detail="'+article.id+'"]');
  if(article.relatedIds?.length)await page.waitForSelector('#knowledge-detail [data-knowledge-related]');
 };
 await go('knowledge');await page.waitForSelector('#knowledge-list [data-knowledge-article]');
 assert.equal(await page.locator('#knowledge-list [data-knowledge-article]').count(),articles.length);
 const labels=await page.locator('#knowledge-list [data-knowledge-article]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.knowledgeArticle,text:node.textContent})));
 for(const label of labels)assert.equal(label.text,articles.find(article=>article.id===label.id).title,'knowledge discovery displays only the basic function name');
 const assertLayout=async label=>{
  const geometry=await page.evaluate(()=>{
   const rail=document.querySelector('.layout>.workbench-sidebar'),main=document.getElementById('main');
   const rows=[...document.querySelectorAll('#knowledge-list [data-knowledge-article]')];
   const rect=element=>{const bounds=element.getBoundingClientRect();return {top:bounds.top,right:bounds.right,bottom:bounds.bottom,left:bounds.left,width:bounds.width,height:bounds.height};};
   return {railVisible:Boolean(rail?.getClientRects().length),rail:rail?rect(rail):null,main:rect(main),rows:rows.map(row=>({id:row.dataset.knowledgeArticle,rect:rect(row),children:[...row.children].map(rect)}))};
  });
  if(geometry.railVisible&&await page.evaluate(()=>innerWidth>=1100))assert.ok(geometry.main.left>=geometry.rail.right-.8,label+' main must reserve the actual desktop sidebar width: '+JSON.stringify({main:geometry.main,rail:geometry.rail}));
  for(const [index,row]of geometry.rows.entries()){
   for(const child of row.children)assert.ok(child.top>=row.rect.top-.8&&child.bottom<=row.rect.bottom+.8&&child.left>=row.rect.left-.8&&child.right<=row.rect.right+.8,label+' topic child must fit its compound button: '+JSON.stringify({id:row.id,row:row.rect,child}));
   if(index)assert.ok(row.rect.top>=geometry.rows[index-1].rect.bottom-.8,label+' topic rows cannot overlap: '+row.id);
  }
 };
 await assertLayout('initial knowledge catalogue');
 for(const width of [390,1440,390,1440]){
  await page.setViewportSize({width,height:950});
  await assertLayout('immediate responsive placement at '+width);
 }
 for(const category of ['codec','reference','media','other']){
  await go('knowledge/'+category);
  await page.waitForSelector('[data-knowledge-category="'+category+'"][aria-pressed="true"]');
  const routeIds=await page.locator('#knowledge-list [data-knowledge-article]').evaluateAll(nodes=>nodes.map(node=>node.dataset.knowledgeArticle));
  assert.deepEqual(new Set(routeIds),new Set(articles.filter(article=>article.categoryId===category).map(article=>article.id)),'knowledge/'+category+' preselects its declared actual content domain');
 }
 await page.locator('[data-knowledge-category=""]').click();
 for(const category of ['codec','reference','media','other']){
  await page.locator('[data-knowledge-category="'+category+'"]').click();
  const visible=await page.locator('#knowledge-list [data-knowledge-article]').evaluateAll(nodes=>nodes.map(node=>node.dataset.knowledgeArticle));
  assert.deepEqual(new Set(visible),new Set(articles.filter(article=>article.categoryId===category).map(article=>article.id)),'reader domain filter exposes the actual '+category+' article set');
  const topics=await page.locator('#knowledge-topics [data-knowledge-topic]').evaluateAll(nodes=>nodes.map(node=>node.dataset.knowledgeTopic).filter(Boolean));
  assert.deepEqual(new Set(topics),new Set(articles.filter(article=>article.categoryId===category).map(article=>article.topicGroup)),'topic filters derive from actual covered tool groups');
  await page.locator('[data-knowledge-topic="'+topics[0]+'"]').click();
  const selectedIds=await page.locator('#knowledge-list [data-knowledge-article]').evaluateAll(nodes=>nodes.map(node=>node.dataset.knowledgeArticle));
  assert.ok(selectedIds.every(id=>articles.find(article=>article.id===id).topicGroup===topics[0]));
 }
 await page.locator('[data-knowledge-category=""]').click();
 const fulltext=articles.find(article=>article.sections.some(section=>section.paragraphs.some(paragraph=>paragraph.length>30)));
 const paragraph=fulltext.sections.flatMap(section=>section.paragraphs).find(text=>text.length>30);
 const query=paragraph.slice(8,24);
 await page.locator('#knowledge-query').fill(query);
 assert.ok(await page.locator('#knowledge-list [data-knowledge-article="'+fulltext.id+'"]').count(),'knowledge search indexes its actual explanation, not just its title');
 await page.locator('#knowledge-query').fill('<img src=x onerror="window.__knowledgeXSS=1">');
 assert.equal(await page.locator('#knowledge-list [data-knowledge-article]').count(),0);
 assert.equal(await page.locator('#knowledge-list img').count(),0);assert.equal(await page.evaluate(()=>window.__knowledgeXSS),undefined,'search text cannot turn into executable markup');
 await page.locator('#knowledge-query').fill('');

 const subset=allArticles?articles:['codec','reference','media','other'].map(category=>articles.find(article=>article.categoryId===category));
 for(const article of subset){
  await open(article);
  const snapshot=await page.locator('#knowledge-detail').evaluate(root=>({body:root.textContent,
   examples:root.querySelectorAll('[data-knowledge-example]').length,
   related:[...root.querySelectorAll('[data-knowledge-related]')].map(node=>node.dataset.knowledgeRelated),
   sections:[...root.querySelectorAll('.knowledge-section')].map(section=>({title:section.querySelector('h3')?.textContent,
    references:[...section.querySelectorAll('[data-ui=reference-list]')].map(node=>({text:node.textContent,
     links:[...node.querySelectorAll('[data-reference-id]')].map(link=>({id:link.dataset.referenceId,href:link.getAttribute('href')}))}))})),
  }));
  const body=snapshot.body;assert.ok(body.length>180,article.id+' contains explanatory content');
  assert.equal(await page.locator('#knowledge-article-title').textContent(),article.title,'reader uses the same simple function name');
  for(const section of article.sections){
   assert.ok(body.includes(section.title),article.id+' section title is rendered');
   for(const paragraph of section.paragraphs)assert.ok(body.includes(paragraph),article.id+' renders the complete cited explanation');
   const rendered=snapshot.sections.find(part=>part.title===section.title);assert.ok(rendered);
   assert.equal(rendered.references.length,1,'citations adjacent to '+section.title);
   const references=rendered.references[0];
   for(const id of section.sourceIds){
    const source=article.sources.find(source=>source.id===id),link=references.links.find(link=>link.id===id);assert.ok(link);
    assert.equal(link.href,source.url.startsWith('/')?new URL('.'+source.url,page.url()).href:source.url);
    assert.ok(references.text.includes(source.publisher));
   }
  }
  const examples=article.sections.flatMap(section=>section.examples||[]);
  assert.ok(examples.length,article.id+' has a concrete example');assert.equal(snapshot.examples,examples.length);
  for(const example of examples){
   if(example.input!=null)assert.ok(body.includes(String(example.input)),article.id+' example input');
   if(example.output!=null)assert.ok(body.includes(String(example.output)),article.id+' example output');
  }
  for(const id of snapshot.related)assert.ok(registry.entries.some(entry=>entry.id===id&&entry.listed!==false),article.id+' links to a real visible task');
 }
 // Each domain has an actual same-document route into its existing tools.
 for(const topic of ['characters','world','image','simulation']){
  const article=articles.find(article=>article.topicGroup===topic);assert.ok(article);
  await open(article);
  const related=page.locator('#knowledge-detail [data-knowledge-related]').first();
  const id=await related.getAttribute('data-knowledge-related'),entry=registry.entries.find(entry=>entry.id===id);
  await related.click();await page.waitForSelector('#panel-'+entry.open.panel+':not([hidden])');
  assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('task'),id,'related '+topic+' knowledge opens its original canonical tool');
 }
 const article=articles.find(article=>article.topicGroup==='characters');
 await open(article);await page.reload();
 await page.waitForSelector('#knowledge-detail [data-knowledge-detail="'+article.id+'"]');
 assert.equal(await page.locator('#knowledge-article-title').textContent(),article.title,'article routes restore the same real text after reload');
 assert.equal(await page.locator('#panel-knowledge .tool-help-button').count(),1);
 assert.equal(await page.locator('#panel-knowledge .tool-provenance').count(),0,'original educational text has no fabricated browser/API attribution');

 const originalFont=await page.evaluate(()=>document.documentElement.style.fontSize);
 for(const width of [320,390,800,1440])for(const textScale of [1,2]){
  await page.setViewportSize({width,height:950});
  await page.evaluate(({originalFont,textScale})=>{document.documentElement.style.fontSize=originalFont;const base=parseFloat(getComputedStyle(document.documentElement).fontSize);if(textScale===2)document.documentElement.style.fontSize=(base*2)+'px';},{originalFont,textScale});
  await go('knowledge');await page.waitForSelector('#knowledge-list [data-knowledge-article]');
  await assertLayout('catalogue '+width+' at '+textScale+'× text');
  const button=page.locator('#knowledge-list [data-knowledge-article="'+article.id+'"]');await button.click();
  await page.waitForSelector('#knowledge-detail [data-knowledge-detail="'+article.id+'"]');
  await page.waitForFunction(()=>document.getElementById('panel-knowledge').dataset.knowledgeLayout);
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'knowledge-article-title','article selection keeps keyboard focus on the actual reader title');
  const geometry=await page.locator('#panel-knowledge').evaluate(panel=>({overflow:document.documentElement.scrollWidth>innerWidth+1,crushed:[...panel.querySelectorAll('button,input,select')].filter(node=>node.getClientRects().length).filter(node=>{const rect=node.getBoundingClientRect();return rect.width<40||rect.height<43;}).map(node=>node.id||node.textContent)}));
  assert.equal(geometry.overflow,false,'knowledge overflow '+width+' at '+textScale+'× text');assert.deepEqual(geometry.crushed,[],'knowledge touch targets '+width+' at '+textScale+'× text');
  await assertLayout('article '+width+' at '+textScale+'× text');
  if(await page.locator('#knowledge-return-list').isVisible()){
   await page.locator('#knowledge-return-list').click();
   assert.equal(await page.evaluate(()=>document.activeElement?.dataset.knowledgeArticle),article.id,'back restores the chosen topic button, including large text/mobile');
  }
 }
 await page.evaluate(originalFont=>document.documentElement.style.fontSize=originalFont,originalFont);
 await page.setViewportSize({width:390,height:844});await go('knowledge');
 await page.locator('#knowledge-query').focus();await page.setViewportSize({width:390,height:400});
 const keyboard=await page.locator('#knowledge-query').evaluate(input=>({focused:document.activeElement===input,visible:input.getBoundingClientRect().top>=0&&input.getBoundingClientRect().bottom<=innerHeight}));
 assert.deepEqual(keyboard,{focused:true,visible:true},'search remains usable in a phone keyboard-height viewport');
 const settle=async()=>{
  await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));await Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{})));});
  await page.waitForFunction(()=>{document.body.getBoundingClientRect();return document.getAnimations().every(animation=>animation.playState!=='running'&&animation.playState!=='pending');});
 };
 const suffix=allArticles?'normal':'reduce';
 await page.setViewportSize({width:1440,height:950});await open(article);await settle();
 await page.waitForFunction(()=>{const rail=document.querySelector('.layout>.workbench-sidebar');if(!rail?.getClientRects().length)return true;const style=getComputedStyle(rail);return Number(style.opacity)>=.999&&(style.translate==='none'||Math.abs(parseFloat(style.translate))<.001);});
 await page.screenshot({path:'/tmp/mist-knowledge-pairs/article-desktop-'+suffix+'.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await go('knowledge');await settle();
 await page.screenshot({path:'/tmp/mist-knowledge-pairs/catalogue-mobile-'+suffix+'.png',fullPage:true});
 await page.locator('#knowledge-list [data-knowledge-article="'+article.id+'"]').click();
 await page.waitForSelector('#knowledge-detail [data-knowledge-detail="'+article.id+'"]');await settle();
 await page.screenshot({path:'/tmp/mist-knowledge-pairs/article-mobile-'+suffix+'.png',fullPage:true});
}

try{
 // Both scenarios serve real production modules; the second verifies prefix-
 // safe resources and reduced motion independently of the desktop scenario.
 for(const settings of [{prefix:'/',motion:'no-preference',width:1440},{prefix:'/toolbox/',motion:'reduce',width:390}]){
  const scope=await productionContext(settings);
  try{
   const registry=await scope.snapshot();
   assert.equal(registry.categories.length,5,'the fifth category is a production category, not a separate parallel catalogue');
   assert.equal(registry.categories.find(category=>category.title==='科普')?.id,'knowledge');
   const sources=registry.entries.flatMap(entry=>entry.sourceOperationIds);
   assert.equal(new Set(sources).size,505);assert.equal(sources.length,505,'each official operation has one canonical owner');
   assert.deepEqual(registry.coverage.missingOperationIds,[]);assert.deepEqual(registry.coverage.missingToolIds,[]);
   if(settings.prefix==='/')await enginePairs(scope.page);
   await taskCipherContinuation(scope);
   await discoveryAndAliases(scope,registry);
   await knowledgeReader(scope,registry,{allArticles:settings.prefix==='/'});
   scope.assertClean();
   console.log('PASS knowledge/pairs '+settings.prefix+': fifth category, unique real source ownership and actual bidirectional engines');
  }catch(error){await scope.page.screenshot({path:'/tmp/mist-knowledge-pairs/failure.png'}).catch(()=>{});throw error;}
  finally{await scope.context.close();}
 }
}catch(error){if(active&&!active.isClosed())await active.screenshot({path:'/tmp/mist-knowledge-pairs/failure.png'}).catch(()=>{});throw error;}
finally{await browser.close();}
