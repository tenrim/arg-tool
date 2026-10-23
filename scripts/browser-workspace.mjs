import {chooseOperation} from './browser-navigation.mjs';
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,join} from 'node:path';
import assert from 'node:assert/strict';
import {toolPages,sitePages} from '../public/navigation.js';
import {TASK_PROJECT_SOURCES} from '../public/project-source-contracts.js';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[],external=[],missing=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='arg.test'){external.push(u.href);return route.abort();}try{const path=resolve('public','.'+(u.pathname==='/'?'/index.html':u.pathname));await route.fulfill({body:await readFile(path),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.wasm':'application/wasm'})[extname(path)]||'application/octet-stream'});}catch{missing.push(u.pathname);await route.abort();}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://arg.test/#crypto');await page.waitForSelector('#ct-crypto[data-operation]');
 const task=page.locator('#ct-crypto');
 const searchInput=page.locator('#workspace-search-input'),searchPopover=page.locator('.workspace-search-popover');
 const registry=await page.evaluate(async()=>{const {loadRegistry}=await import('./capabilities/registry.js');return loadRegistry();});
 await task.locator('.ct-input').fill('保留我的输入');
 // Resizing an open drawer must preserve the desktop sidebar preference and
 // report its actual visibility, after native dialog/media-query events settle.
 const menu=page.locator('.workbench-menu'),drawer=page.locator('.workbench-drawer'),rail=page.locator('.layout > .workbench-sidebar');
 const brand=await page.locator('.brand').elementHandle();
 async function assertBrandPlacement(){
  assert.equal(await page.locator('.brand').count(),1,'响应式布局只有一个品牌链接');
  assert.equal(await brand.evaluate(n=>n===document.querySelector('.brand')&&!!n.closest('.chronicle-header')),true,'原品牌节点固定在顶栏，保留导航监听器且不跨容器跳动');
  assert.equal(await brand.isVisible(),true,'品牌链接在侧栏折叠与手机端始终可见');
 }
 await assertBrandPlacement();
 assert.ok(await page.evaluate(()=>document.querySelector('.chronicle-header').getBoundingClientRect().left>=document.querySelector('.workbench-sidebar').getBoundingClientRect().right-1),'桌面顶栏避开常驻侧栏');
 for(const collapsed of [false,true]){
  if(collapsed)await menu.click();
  await assertBrandPlacement();
  await page.setViewportSize({width:390,height:844});await menu.click();await drawer.waitFor({state:'visible'});
  await assertBrandPlacement();
  await page.setViewportSize({width:1440,height:950});await drawer.waitFor({state:'hidden'});
  await page.waitForSelector(`.workbench-menu[aria-expanded="${!collapsed}"]`);
  if(collapsed)await rail.waitFor({state:'hidden'});else await rail.waitFor({state:'visible'});
  await assertBrandPlacement();
 }
 await menu.click();await rail.waitFor({state:'visible'});
 await page.setViewportSize({width:390,height:844});await menu.click();await page.keyboard.press('Escape');
 await drawer.waitFor({state:'hidden'});await page.waitForSelector('.workbench-menu[aria-expanded="false"]');await page.waitForFunction(()=>document.activeElement===document.querySelector('.workbench-menu'));
 assert.equal(await task.locator('.ct-input').inputValue(),'保留我的输入');
 await page.setViewportSize({width:1440,height:950});await rail.waitFor({state:'visible'});await page.waitForSelector('.workbench-menu[aria-expanded="true"]');
 await brand.click();await page.waitForSelector('#panel-home:not([hidden])');
 await page.evaluate(()=>location.hash='crypto');await task.waitFor({state:'visible'});
 assert.equal(await task.locator('.ct-input').inputValue(),'保留我的输入','品牌导航保留原工具输入');
 const favorite=page.locator('#panel-crypto .tool-favorite');await favorite.click();assert.equal(await favorite.getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.rail-collection').first().locator('[data-route="crypto"]').count(),1);
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('arg.ui.favorites.v1'))),['crypto'],'Only the explicitly selected page ID is persisted');
 await page.locator('.rail-directory-button').click();await page.waitForSelector('.directory-capability');assert.equal(await page.locator('.directory-capability').count(),60,'The full capability directory is progressively rendered');await page.locator('[data-filter="favorites"]').click();const cryptoEntries=registry.entries.filter(e=>e.listed!==false&&e.sourceToolIds.includes('crypto'));assert.equal(await page.locator('.directory-capability').count(),Math.min(cryptoEntries.length,60));assert.match(await page.locator('.directory-count').textContent(),new RegExp('^'+cryptoEntries.length+' 项'));
 await page.locator('[data-filter="media"]').click();const mediaCount=registry.entries.filter(e=>e.listed!==false&&e.category==='media').length;assert.equal(await page.locator('.directory-capability').count(),Math.min(mediaCount,60));assert.match(await page.locator('.directory-count').textContent(),new RegExp('^'+mediaCount+' 项'));await page.locator('[aria-label="关闭工具目录"]').click();assert.equal(await task.locator('.ct-input').inputValue(),'保留我的输入');
 await page.locator('.workbench-menu').click();assert.equal(await page.locator('.layout > .workbench-sidebar').isVisible(),false);await page.locator('.workbench-menu').click();assert.equal(await page.locator('.layout > .workbench-sidebar').isVisible(),true);
 await page.setViewportSize({width:390,height:844});await page.locator('.workbench-menu').click();assert.equal(await page.locator('.workbench-drawer').getAttribute('open'),'');await page.locator('.rail-filter input').fill('纸笔');assert.ok(await page.locator('.rail-groups [data-capability="topic:paper-puzzles"]:visible').count());assert.ok(await page.locator('.rail-groups [data-capability="learn:function-topic:paper-puzzles"]:visible').count(),'Search exposes the unified paper workspace and its precise per-rule lesson');assert.equal(await page.locator('.rail-groups [data-capability="native:paper"]:visible').count(),0,'the old default rule is not a second navigation tool');await page.locator('.rail-groups [data-capability="topic:paper-puzzles"]:visible').click();assert.equal(await page.locator('.workbench-drawer').getAttribute('open'),null);await page.waitForSelector('#panel-paper:not([hidden])');assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('task'),'topic:paper-puzzles');await page.evaluate(()=>location.hash='crypto');assert.equal(await task.locator('.ct-input').inputValue(),'保留我的输入');await page.locator('.rail-filter input').evaluate(n=>{n.value='';n.dispatchEvent(new Event('input',{bubbles:true}));});await page.setViewportSize({width:1440,height:950});await page.waitForFunction(()=>document.querySelector('#panel-crypto:not([hidden]) .capability-workspace-context'));
 assert.equal(await page.locator('.ct-picker,#chef-directory').count(),0,'Aggregate tool UI is removed from the DOM');
 assert.equal(await task.getAttribute('data-operation'),'ROT13','Current task stays visible');
 await page.keyboard.press('Control+k');await searchInput.fill('Generate RSA Key Pair');const rsaChoice=page.locator('.workspace-search-item[data-capability="topic:rsa"]');assert.equal(await rsaChoice.getAttribute('data-op'),'Generate RSA Key Pair','a topic result retains the requested RSA generation action');await rsaChoice.click();
 await page.waitForFunction(()=>document.querySelector('#ct-crypto').dataset.operation==='Generate RSA Key Pair');
 assert.equal(await task.locator('.ct-input').isVisible(),false,'Key generation needs no body input');
 await page.locator('.rail-directory-button').click();await page.locator('.directory-search input').fill('To Base64');await page.locator('.tool-directory [data-capability="topic:base-family"]').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding')?.dataset.operation==='To Base64');await page.evaluate(()=>location.hash='crypto');await page.waitForFunction(()=>!document.querySelector('#panel-crypto').hidden);
 await task.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-crypto .ct-status').textContent.includes('处理完成'),null,{timeout:45000});
 const result=await task.locator('.ct-output').inputValue();assert.match(result,/BEGIN (?:RSA )?PRIVATE KEY/);assert.match(result,/BEGIN (?:RSA )?PUBLIC KEY/);
 const download=page.waitForEvent('download');await task.locator('.ct-download').click();assert.equal((await readFile(await(await download).path(),'utf8')).replaceAll('\r\n','\n'),result,'Original PEM matches the normalized textarea preview');
 await chooseOperation(page,'Generate PGP Key Pair');
 assert.equal(await task.locator('[data-arg="2"] input').count(),1,'Name is a single line');assert.equal(await task.locator('[data-arg="3"] input').count(),1,'Email is a single line');
 assert.equal(await task.locator('.ct-advanced').getAttribute('open'),null);await task.locator('.ct-advanced summary').click();assert.equal(await task.locator('[data-arg="1"] input').getAttribute('type'),'password');
 await task.locator('[data-arg="2"] input').fill('ARG');await chooseOperation(page,'ROT13');assert.equal(await task.locator('.ct-input').inputValue(),'保留我的输入');
 await chooseOperation(page,'Generate PGP Key Pair');assert.equal(await task.locator('[data-arg="2"] input').inputValue(),'ARG');
 await page.keyboard.press('Control+k');await searchInput.fill('纸笔解题');await page.keyboard.press('Enter');await page.waitForSelector('#panel-paper:not([hidden])');
 await page.locator('#paper-board button').first().click();await page.keyboard.press('1');await page.locator('#panel-paper .tool-help-button').click();assert.match(await page.locator('#paper-board button').first().textContent(),/1/,'Help preserves puzzle');await page.locator('#panel-paper .tool-help-button').click();
 const routes=await page.locator('.panel').evaluateAll(nodes=>nodes.map(n=>n.id.slice(6)));assert.equal(routes.length,toolPages.length+sitePages.length+1);
 if(process.env.WORKSPACE_SCREENSHOTS)await mkdir(process.env.WORKSPACE_SCREENSHOTS,{recursive:true});
 for(const width of [320,390,768,1080,1440]){
  await page.setViewportSize({width,height:950});
  for(const route of routes){await page.evaluate(route=>location.hash=route,route);await page.waitForSelector('#panel-'+route+':not([hidden])');await page.waitForTimeout(60);
   const panel=page.locator('#panel-'+route);if(!sitePages.some(page=>page.route===route)&&route!=='browse'){assert.equal(await panel.locator('.tool-help-button').count(),1);if(['extract','knowledge','keyboard-extra'].includes(route)||TASK_PROJECT_SOURCES['native:'+route]?.urls.length===0)assert.equal(await panel.locator('.tool-provenance').count(),0,route+' original-only page omits dependency footer');else assert.equal(await panel.locator('.tool-provenance').evaluate(n=>n===n.parentElement.lastElementChild),true,route+' provenance last');}else assert.equal(await panel.locator('.page-heading h1').count(),route==='home'?0:1,route+' website heading');
   assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w+1,width),route+' '+width+' overflow');
   assert.equal(await page.evaluate(()=>getComputedStyle(document.body,'::before').display),'block','Static CRT remains with reduced motion');assert.equal(await page.evaluate(()=>getComputedStyle(document.body,'::before').pointerEvents),'none');
   if(process.env.WORKSPACE_SCREENSHOTS&&[390,1440].includes(width)){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:join(process.env.WORKSPACE_SCREENSHOTS,`${route}-${width}.png`)});}
  }
 }
 await page.setViewportSize({width:390,height:844});await page.goto('https://arg.test/#encoding');await chooseOperation(page,'To Base64');const picker=page.locator('#ct-encoding');assert.equal(await page.locator('.ct-picker').count(),0);await picker.locator('.ct-input').fill('谜题');await picker.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));assert.equal(await picker.locator('.ct-output').inputValue(),Buffer.from('谜题').toString('base64'));await picker.locator('.ct-input').fill('变更');assert.equal(await picker.locator('.ct-output').count(),0);
 // The Base64 alphabet must render twelve separate glyphs; contextual font
 // substitutions used to join its trailing "/=" into a mathematical symbol.
 await page.evaluate(()=>document.fonts.ready);
 const alphabet=picker.locator('[data-arg="0"] input').first();assert.equal(await alphabet.inputValue(),'A-Za-z0-9+/=');
 const fontSession=await context.newCDPSession(page);await fontSession.send('DOM.enable');await fontSession.send('CSS.enable');
 const {root}=await fontSession.send('DOM.getDocument');
 const {nodeId}=await fontSession.send('DOM.querySelector',{nodeId:root.nodeId,selector:'#ct-encoding [data-arg="0"] input'});
 const {fonts}=await fontSession.send('CSS.getPlatformFontsForNode',{nodeId});
 assert.equal(fonts.reduce((count,font)=>count+font.glyphCount,0),12,'Character alphabet glyphs stay separate');
 await fontSession.detach();
 assert.equal(await page.locator('#panel-crypto .tool-favorite').getAttribute('aria-pressed'),'true','Favorite survives reload');
 await page.locator('.workbench-menu').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.workbench-drawer').getAttribute('open'),null);assert.equal(await picker.locator('.ct-input').inputValue(),'变更');
 const originalInput=await picker.locator('.ct-input').elementHandle(),originalSearch=await searchInput.elementHandle();
 await page.locator('.workbench-menu').click();await page.keyboard.press('Control+k');
 await drawer.waitFor({state:'hidden'});await searchPopover.waitFor({state:'visible'});
 assert.equal(await drawer.getAttribute('open'),null,'Header search closes the mobile navigation drawer');
 assert.equal(await page.locator('dialog[open]').count(),0,'Inline search does not create a replacement modal');
 assert.equal(await searchPopover.evaluate(n=>n instanceof HTMLDialogElement||!!n.closest('dialog')),false);
 assert.equal(await originalSearch.evaluate(n=>n===document.getElementById('workspace-search-input')&&document.activeElement===n),true,'Shortcut focuses the original header input');
 assert.equal(await searchInput.getAttribute('aria-expanded'),'true');
 assert.equal(await page.locator('main').evaluate(n=>n.inert),false,'Inline search leaves the tool workspace interactive');
 await searchInput.fill('Bsae64');await searchPopover.locator('[data-capability="topic:base-family"]').waitFor({state:'visible'});
 await searchInput.press('ArrowDown');assert.equal(await searchInput.getAttribute('aria-activedescendant'),'workspace-search-option-0','Arrow keys select inline suggestions without moving focus');
 await searchInput.press('Escape');
 assert.equal(await searchPopover.evaluate(n=>n.hidden&&n.inert),true);assert.equal(await searchInput.getAttribute('aria-expanded'),'false');assert.equal(await searchInput.getAttribute('aria-activedescendant'),null);
 assert.equal(await originalSearch.evaluate(n=>document.activeElement===n),true,'Escape dismisses suggestions and keeps the header input focused');
 assert.equal(await originalInput.evaluate(n=>n===document.querySelector('#ct-encoding .ct-input')&&n.value==='变更'),true,'Drawer and inline search preserve the original tool input and clue');
 await originalInput.dispose();await originalSearch.dispose();
 await page.evaluate(()=>localStorage.setItem('arg.ui.favorites.v1',JSON.stringify([null,42,{},'paper','missing'])));await page.reload();await page.waitForSelector('#ct-encoding[data-operation]');assert.equal(await page.locator('.rail-collection').first().locator('[data-route="paper"]').count(),1,'Stored favorites are restricted to valid page IDs');
 assert.deepEqual({errors,external,missing},{errors:[],external:[],missing:[]});console.log(`PASS: categorized directory and real operation routing, explicit favorites/persistence/corrupt storage, sidebar/drawer with preserved input, inline header search with keyboard/focus/node continuity, actual RSA bytes, key-generation forms/drafts, mobile operation rail, stale results, ${routes.length} pages across 320–1440px and static CRT with reduced motion.`);
}finally{await browser.close();}
