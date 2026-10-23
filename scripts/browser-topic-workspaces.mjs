import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';

// Serve the real checked-in application and pinned workers. Only transport is
// local: no catalogue, controller, result or algorithm response is replaced.
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm','.png':'image/png','.webp':'image/webp'};
const artifacts=resolve(tmpdir(),'mist-topic-workspaces');await mkdir(artifacts,{recursive:true});
let active,pgpKeys;

async function production(width,motion){
 const prefix=width<1100?'/toolbox/':'/',errors=[],missing=[],external=[],popups=[];
 const context=await browser.newContext({viewport:{width,height:950},hasTouch:width<1100,reducedMotion:motion});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(['blob:','data:'].includes(url.protocol))return route.continue();
  if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
  try{assert.ok(url.pathname.startsWith(prefix));const path=resolve('public',url.pathname.slice(prefix.length)||'index.html');await route.fulfill({body:await readFile(path),contentType:mime[extname(path)]||'application/octet-stream'});}
  catch{missing.push(url.pathname);await route.abort();}
 });
 const page=await context.newPage();active=page;page.setDefaultTimeout(20000);
 page.on('pageerror',error=>errors.push(error.message));page.on('popup',popup=>popups.push(popup.url()));
 await page.goto('https://arg.test'+prefix+'#home');await page.locator('#panel-home [data-capability]').first().waitFor();
 const go=async(id,{op,variant}={})=>{
  await page.evaluate(({id,op,variant})=>document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id,op,preferredVariant:variant}})),{id,op,variant});
  await page.waitForFunction(({id,op,variant})=>{
   const params=new URLSearchParams(location.hash.split('?')[1]),panel=[...document.querySelectorAll('.panel')].find(node=>!node.hidden);
   return panel?.querySelector('[data-current-capability]')?.dataset.currentCapability===id&&(!op||panel.querySelector('.ct-tool')?.dataset.operation===op)&&(!variant||params.get('view')===variant);
  },{id,op,variant});
 };
 return{page,context,prefix,go,assertClean(){assert.deepEqual({errors,missing,external,popups},{errors:[],missing:[],external:[],popups:[]});assert.equal(context.pages().length,1);}};
}

async function execute(task){
 await task.locator('.ct-run').click();
 await task.locator('.ct-status').filter({hasText:'处理完成'}).waitFor({timeout:45000});
 return task.locator('.ct-output').inputValue();
}

async function extraction(scope){
 const {page,go}=scope;await go('topic:extract-patterns',{op:'Extract URLs'});
 const task=page.locator('#ct-textlab'),select=task.locator('.ct-direction'),input=task.locator('.ct-input');
 assert.equal(await select.getAttribute('aria-label'),'操作');
 assert.equal(await select.locator('option').count(),11,'every real extractor remains selectable in the topic');
 await input.fill('https://example.org/alpha\n2024-01-02\nhttps://puzzle.example.net/beta');
 await input.evaluate(node=>window.__topicInput=node);
 await task.locator('[data-arg="1"] input').check();
 const urls=await execute(task);assert.match(urls,/https:\/\/example\.org\/alpha/);assert.match(urls,/https:\/\/puzzle\.example\.net\/beta/);
 await select.focus();await select.press('Home');await select.press('ArrowDown');await select.press('End');
 // Select by registered raw ID, as the native HTML select does for mouse/touch.
 await select.selectOption('Extract domains');
 assert.equal(await task.locator('.ct-output').count(),0,'changing action synchronously discards the previous result view');
 assert.equal(await task.locator('[data-arg="1"] input').isChecked(),false,'same-named parameters cannot leak between non-inverse actions');
 const domains=await execute(task);assert.match(domains,/example\.org/);assert.match(domains,/puzzle\.example\.net/);
 await select.selectOption('Extract dates');const dates=await execute(task);assert.match(dates,/2024-01-02/);
 assert.equal(await input.evaluate(node=>node===window.__topicInput),true,'one original input node serves all actions');
 assert.equal(await input.inputValue(),'https://example.org/alpha\n2024-01-02\nhttps://puzzle.example.net/beta');
 await select.selectOption('Extract URLs');assert.equal(await task.locator('[data-arg="1"] input').isChecked(),true,'returning to an action restores its own parameter draft');
 assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('op'),'Extract URLs');
 assert.equal(await page.locator('#panel-textlab .capability-topic-settings').count(),0,'Chef topic uses its real form selector without duplicating a native selector');
}

async function pgp(scope,full){
 const {page,go}=scope;await go('topic:pgp',{op:'Parse PGP Key'});
 const task=page.locator('#ct-crypto'),select=task.locator('.ct-direction');
 const operations=await select.locator('option').evaluateAll(nodes=>nodes.map(node=>node.value));
 assert.deepEqual(new Set(operations),new Set(['Parse PGP Key','PGP Decrypt','PGP Encrypt','PGP Encrypt and Sign','PGP Decrypt and Verify','PGP Sign','PGP Verify','Generate PGP Key Pair']));
 if(full){
  await select.selectOption('Generate PGP Key Pair');assert.equal(await task.locator('.ct-input-area').isVisible(),false,'key generation has no misleading source input');
  await task.locator('[data-arg="0"] select').selectOption('ECC-256');
  const generated=await execute(task);
  const publicKey=generated.match(/-----BEGIN PGP PUBLIC KEY BLOCK-----[\s\S]*?-----END PGP PUBLIC KEY BLOCK-----/)?.[0];
  const privateKey=generated.match(/-----BEGIN PGP PRIVATE KEY BLOCK-----[\s\S]*?-----END PGP PRIVATE KEY BLOCK-----/)?.[0];
  assert.ok(publicKey&&privateKey,'the actual upstream generation returns both armored keys');pgpKeys={publicKey,privateKey};
 }
 await select.selectOption('PGP Sign');await task.locator('.ct-input').fill('ARG topic signature clue');
 await task.locator('[data-arg="0"] textarea').fill(pgpKeys?.privateKey||'PRIVATE_KEY_DRAFT');
 await select.selectOption('PGP Verify');assert.equal(await task.locator('[data-arg="0"] textarea').inputValue(),'','a private signing key must not become a verification public key');
 await task.locator('[data-arg="0"] textarea').fill(pgpKeys?.publicKey||'PUBLIC_KEY_DRAFT');
 await select.selectOption('PGP Sign');assert.equal(await task.locator('[data-arg="0"] textarea').inputValue(),pgpKeys?.privateKey||'PRIVATE_KEY_DRAFT');
 if(full){
  const signed=await execute(task);assert.match(signed,/-----BEGIN PGP MESSAGE-----/,'the pinned Keybase engine emits an armored signed-message packet');
  await select.selectOption('PGP Verify');await task.locator('.ct-input').fill(signed);const verified=await execute(task);assert.match(verified,/ARG topic signature clue/);
  await select.selectOption('Parse PGP Key');await task.locator('.ct-input').fill(pgpKeys.publicKey);const parsed=await execute(task);assert.ok(parsed.trim().length>30,'key inspection executes the pinned parser');
 }
 await page.locator('#panel-crypto .heading-actions [data-learning-link]').click();
 await page.locator('#knowledge-detail [data-knowledge-detail="function-topic:pgp"]').waitFor();
 assert.equal(await page.locator('#knowledge-article-title').textContent(),'PGP 工具');
 assert.ok(await page.locator('#knowledge-detail .knowledge-section').count()>=8,'the visible topic lesson retains precise member explanations');
}

async function nativeTopics(scope,full){
 const {page,go}=scope;await go('topic:answer-extraction',{variant:'native:extract-first'});
 const chooser=page.locator('#panel-extract .capability-topic-settings select');
 assert.equal(await chooser.locator('option').count(),5);
 await page.locator('#extract-input').fill('ALPHA\nBRAVO');await page.locator('#extract-input').evaluate(node=>window.__nativeTopicInput=node);
 await page.locator('#extract-run').click();assert.equal(await page.locator('#extract-output').inputValue(),'AB');
 await chooser.selectOption('native:extract-last');await page.waitForFunction(()=>document.getElementById('extract-mode').value==='last');
 await page.locator('#extract-run').click();assert.equal(await page.locator('#extract-output').inputValue(),'AO');
 assert.equal(await page.locator('#extract-input').evaluate(node=>node===window.__nativeTopicInput),true);
 assert.equal(await page.locator('#extract-input').inputValue(),'ALPHA\nBRAVO');
 await page.reload();await page.waitForFunction(()=>document.getElementById('extract-mode')?.value==='last'&&!document.getElementById('panel-extract').hidden);
 assert.equal(await chooser.inputValue(),'native:extract-last','view refresh resolves the selected native child');
 await page.evaluate(()=>location.hash='extract?task=native%3Aextract-first');
 await page.waitForFunction(()=>new URLSearchParams(location.hash.split('?')[1]).get('task')==='topic:answer-extraction'&&document.getElementById('extract-mode').value==='first');
 assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('view'),'native:extract-first','the original child link canonicalizes without losing its selection');

 await go('topic:code-runner',{variant:'native:code-python'});
 const codeSelect=page.locator('#panel-code .capability-topic-settings select');assert.equal(await codeSelect.locator('option').count(),10);
 await page.locator('#code-source').evaluate(node=>window.__topicCodeNode=node);
 const specs=[['native:code-python','python','https://github.com/pyodide/pyodide'],['native:code-sql','sql','https://github.com/sql-js/sql.js'],['native:code','brainfuck','https://github.com/nilaymaj/esolang-park']];
 for(const [variant,language,url]of specs){
  await codeSelect.selectOption(variant);await page.waitForFunction(language=>document.getElementById('code-language').value===language,language);
  assert.equal(await page.locator('#code-source').evaluate(node=>node===window.__topicCodeNode),true,'topic selection reuses the original code controller nodes');
  const footer=page.locator('#panel-code>.tool-provenance');assert.equal(await footer.isVisible(),true);assert.deepEqual(await footer.locator('a').evaluateAll(nodes=>nodes.map(node=>node.href)),[url]);assert.equal(await footer.evaluate(node=>node===node.parentElement.lastElementChild),true);
  if(full){
   const source=language==='python'?'print(6 * 7)':language==='sql'?'SELECT 42;':'++++++[>+++++++<-]>.';
   await page.locator('#code-source').fill(source);await page.locator('#code-run').click();await page.waitForFunction(()=>document.getElementById('code-status').textContent.includes('运行完成'),null,{timeout:45000});
   assert.equal(await page.locator('#code-output').inputValue(),language==='python'?'42\n':language==='sql'?'[42]\n':'*');
  }
 }
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'topic controls fit the viewport');
}

async function catalogueAndPolicy(scope){
 const {page,go}=scope;
 const audit=await page.evaluate(async()=>{
  const {loadRegistry,searchEntries}=await import('./capabilities/registry.js'),{CHAIN_ONLY_OPERATIONS}=await import('./capabilities/operation-policy.js'),{ARTICLES}=await import('./knowledge/content.js');
  const registry=await loadRegistry(),visible=registry.entries.filter(entry=>entry.listed!==false),hidden=new Set(CHAIN_ONLY_OPERATIONS);
  const topics=visible.filter(entry=>entry.topic);
  return{count:CHAIN_ONLY_OPERATIONS.length,covered:registry.coverage.coveredOperationCount,total:registry.coverage.operationCount,
   leaked:visible.flatMap(entry=>entry.sourceOperationIds.filter(op=>hidden.has(op))),
   searchLeaks:CHAIN_ONLY_OPERATIONS.flatMap(op=>searchEntries(registry,op).filter(entry=>entry.sourceOperationIds.includes(op)).map(entry=>entry.id)),
   lessonLeaks:ARTICLES.flatMap(article=>(article.operationIds||[]).filter(op=>hidden.has(op))),
   missingLessons:topics.filter(entry=>{
    const article=ARTICLES.find(article=>article.capabilityIds.includes(entry.id));
    if(!article||!article.members?.length)return true;
    const explained=section=>section.paragraphs.length&&section.examples?.length&&section.sourceIds.length
      &&section.sourceIds.every(id=>article.sources.some(source=>source.id===id));
    // Every actual controller/function retains its own mechanism, reproducible
    // example and valid section references after the topic projection.
    if(entry.memberIds.some(id=>!article.members.some(member=>member.capabilityId===id)
      ||!article.sections.some(section=>section.memberId===id&&explained(section))))return true;
    // Chef actions are explicit real operation members. A native controller's
    // delegated source inventory is not an invented Chef-article mapping.
    if((entry.actions||[]).some(action=>!article.sections.some(section=>
      section.operationIds?.includes(action.op)&&explained(section))))return true;
    return (entry.variants||[]).filter(variant=>variant.open.kind==='native').some(variant=>
      !article.members.some(member=>member.capabilityId===variant.id&&member.operationIds.length===0)
      ||!article.sections.some(section=>section.memberId===variant.id&&section.operationIds.length===0&&explained(section)));
   }).map(entry=>entry.id)};
 });
 assert.deepEqual(audit,{count:83,covered:505,total:505,leaked:[],searchLeaks:[],lessonLeaks:[],missingLessons:[]},'all operations keep unique source coverage while discovery and knowledge follow the topic/policy boundary');
 await page.locator('#workspace-search-input').fill('Multiply');await page.locator('.workspace-search-popover').waitFor({state:'visible'});
 assert.equal(await page.locator('.workspace-search-popover [data-capability="op:Multiply"]').count(),0);await page.keyboard.press('Escape');
 await go('native:cyberchef');
 await page.locator('#cyberchef-stage[data-ready="true"]').waitFor();
 await page.locator('#chef-category').selectOption('all');
 const pane=async name=>{const tab=page.locator('#chef-tabs [role="tab"][data-pane="'+name+'"]');if(await tab.isVisible())await tab.click();};
 for(const [op,input,expected]of [['Multiply','6 7','42'],['OR','A','C']]){
  await pane('recipe');await page.locator('#chef-clear-recipe').click();await pane('operations');
  await page.locator('#chef-search').fill(op);await page.locator('#chef-operations [data-operation="'+op+'"]').click();
  assert.equal(await page.locator('#chef-recipe>.chef-step').count(),1);
  if(op==='Multiply')await page.locator('#chef-recipe [data-arg="0"] select').selectOption('Space');
  else await page.locator('#chef-recipe [data-arg="0"] input').fill('02');
  await pane('input');await page.locator('#chef-input').fill(input);await page.locator('#chef-run').click();
  await page.waitForFunction(()=>document.getElementById('cyberchef-status').textContent.includes('处理完成'),null,{timeout:45000});
  await pane('output');assert.equal(await page.locator('#chef-output').inputValue(),expected,'recipe-only '+op+' still executes the real official engine');
 }
}

try{
 let full=true;
 for(const width of [1440,390])for(const motion of ['no-preference','reduce']){
  const scope=await production(width,motion);
  try{
   await extraction(scope);await pgp(scope,full);await nativeTopics(scope,full);if(full)await catalogueAndPolicy(scope);
   scope.assertClean();await scope.page.screenshot({path:resolve(artifacts,`topics-${width}-${motion}.png`)});
   console.log(`PASS ${width}px ${motion}${scope.prefix!=='/'?' subdirectory':''}: extractor outputs/drafts, PGP actions and key isolation, native view/alias/controller/provenance, one document${full?', actual PGP/Python/SQL/BF and recipe-only engines, 505 coverage':''}`);
   full=false;
  }finally{await scope.context.close();}
 }
 console.log('PASS topic workspaces: 4 responsive/motion combinations, real production engines and all topic knowledge members');
}catch(error){
 if(active&&!active.isClosed()){await active.screenshot({path:resolve(artifacts,'failure.png'),fullPage:true}).catch(()=>{});await writeFile(resolve(artifacts,'failure-state.json'),JSON.stringify({url:active.url(),error:error.stack},null,2));}
 throw error;
}finally{await browser.close();}
