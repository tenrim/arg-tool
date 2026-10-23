import {PROJECT_LICENSES} from '../public/project-licenses.js';
import {APP_VERSION} from '../public/site-version.js';
import {toolPages,sitePages} from '../public/navigation.js';
import {GUIDE_PAGES,findGuideSites} from '../public/external-guide/catalog.js';
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
async function selectGuide(scope,value){
 const label=await scope.locator('select').evaluate((node,value)=>[...node.options].find(option=>option.value===value).textContent,value);
 await scope.getByRole('combobox',{name:'资料方向',exact:true}).click();
 await scope.page().getByRole('option',{name:label,exact:true}).click();
}
const screenshotRoot=resolve(tmpdir(),'arg-site-pages');
await mkdir(screenshotRoot,{recursive:true});
try{
 for(const prefix of ['/','/toolbox/']){
  const context=await browser.newContext({viewport:{width:1440,height:950}}),errors=[],missing=[],external=[];
  await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='arg.test'||!url.pathname.startsWith(prefix)){external.push(url.href);return route.abort();}try{const path=resolve('public',url.pathname.slice(prefix.length)||'index.html');await route.fulfill({body:await readFile(path),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm','.png':'image/png'})[extname(path)]||'application/octet-stream'});}catch{missing.push(url.pathname);await route.abort();}});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  const base='https://arg.test'+prefix;
  const go=async route=>{await page.evaluate(route=>location.hash=route,route);await page.waitForSelector('#panel-'+route+':not([hidden])');};
  await page.goto(base);await page.waitForSelector('#panel-home:not([hidden])');
  await page.waitForSelector('#panel-home [data-capability-group]');
  const registry=await page.evaluate(async()=>{const {loadRegistry}=await import('./capabilities/registry.js');return loadRegistry();});
  assert.equal(new URL(page.url()).hash,'#home');assert.equal(await page.locator('.panel').count(),toolPages.length+sitePages.length+1);assert.equal(await page.locator('#panel-home [data-capability-group]').count(),registry.groups.length);
  assert.equal(await page.title(),'首页 · 迷雾工具箱');
  assert.equal(await page.locator('.rail-site-links a[href="#external-guide"]').count(),0);
  const referenceToggle=page.locator('.rail-group[data-group=reference] .rail-category-toggle');
  if(await referenceToggle.getAttribute('aria-expanded')==='false')await referenceToggle.click();
  await page.locator('.rail-group[data-group=reference] a[href="#external-guide"]').click();await page.waitForSelector('#panel-external-guide:not([hidden])');
  const guide=page.locator('#panel-external-guide');
  assert.equal(await guide.locator('[data-external-site]:visible').count(),34);
  assert.equal(await guide.locator('[data-external-site=E27],[data-external-site=E35],[data-external-site=E38]').count(),0);
  assert.equal(await guide.locator('.tool-provenance').count(),0,'External links are not integrated dependencies');
  await selectGuide(guide,'music');assert.equal(await guide.locator('[data-external-site]:visible').count(),7);
  await guide.getByLabel('查找外站资料').fill('旋律');assert.ok(await guide.locator('[data-external-site=E32]').isVisible());
  await guide.getByLabel('查找外站资料').fill('Nutrimatic');assert.equal(await guide.locator('[data-external-site]:visible').count(),0);
  await selectGuide(guide,'');assert.equal(await guide.locator('[data-external-site]:visible').count(),1);
  const guideLink=guide.locator('[data-external-site=E04] a');assert.equal(await guideLink.getAttribute('target'),'_blank');assert.equal(await guideLink.getAttribute('referrerpolicy'),'no-referrer');
  await guide.getByLabel('查找外站资料').focus();await page.keyboard.press('Tab');assert.ok(await guideLink.evaluate(n=>n===document.activeElement),'Search is followed by the visible site link');
  await guide.getByLabel('查找外站资料').fill('');
  for(const item of await guide.locator('[data-external-site]').all()){
   const text=await item.textContent();assert.doesNotMatch(text,/适合的线索|资料语言|怎么查|使用边界|与本站的区别/);
   assert.ok((await item.locator('p').textContent()).length>100);assert.equal(await item.locator('ol,h4').count(),0);
  }
  await page.reload();await page.waitForSelector('#panel-external-guide:not([hidden])');assert.equal(await page.title(),'外站资料指南 · 迷雾工具箱');
  assert.ok(await page.locator('.rail-group[data-group=reference] a[href="#external-guide"]').isVisible());
  assert.equal(await page.locator('.rail-group[data-group=reference] a[href="#external-guide"]').getAttribute('aria-current'),'page');
  for(const definition of GUIDE_PAGES){
   const category=page.locator(`.rail-group[data-group=${definition.category}]`),toggle=category.locator('.rail-category-toggle');
   if(await toggle.getAttribute('aria-expanded')==='false')await toggle.click();
   const menu=category.locator(`a[href="#${definition.route}"]`);await menu.click();
   const panel=page.locator('#panel-'+definition.route);await panel.waitFor({state:'visible'});
   assert.equal(await menu.getAttribute('aria-current'),'page');
   assert.equal(await page.title(),definition.title+' · 迷雾工具箱');
   const sites=findGuideSites('','',definition.category);
   assert.deepEqual((await panel.locator('[data-external-site]').evaluateAll(nodes=>nodes.map(n=>n.dataset.externalSite))).sort(),sites.map(s=>s.id).sort());
   assert.equal(await panel.locator('.tool-provenance,iframe,input[type=file]').count(),0,'Introduction pages neither integrate third-party code nor collect files');
   for(const site of sites){
    const card=panel.locator(`[data-external-site=${site.id}]`),link=card.locator('a').first();
    assert.equal(await card.locator('p').textContent(),site.description);
    assert.equal(await link.getAttribute('href'),site.url);
    assert.equal(await link.getAttribute('target'),'_blank');
    assert.equal(await link.getAttribute('referrerpolicy'),'no-referrer');
    assert.equal(await link.getAttribute('rel'),'noopener noreferrer');
   }
  }
  assert.deepEqual(await page.locator('[id]').evaluateAll(nodes=>{const ids=nodes.map(n=>n.id);return ids.filter((id,i)=>ids.indexOf(id)!==i);}),[],'All four guide forms own distinct IDs');
  const otherGuide=page.locator('#panel-external-other');
  await otherGuide.getByLabel('查找外站资料').fill('Godbolt');
  assert.equal(await otherGuide.locator('[data-external-site]:visible').count(),1);
  await selectGuide(otherGuide,'puzzle-tools');
  assert.equal(await otherGuide.locator('[data-external-site]:visible').count(),0);
  await selectGuide(otherGuide,'');
  await otherGuide.getByLabel('查找外站资料').fill('');
  await go('home');await page.keyboard.press('Control+k');await page.locator('#workspace-search-input').fill('P26');
  await page.locator('#workspace-search-results [data-route=external-other]').waitFor({state:'visible'});
  assert.equal(await page.locator('#workspace-search-results [role=option]').first().getAttribute('data-route'),'external-other','Exact external site ID outranks fuzzy tool names');
  await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
  await otherGuide.waitFor({state:'visible'});
  await go('home');
  assert.deepEqual(await page.locator('#panel-home [data-ui=card-title]').allTextContents(),['已收藏','最近使用','工具导航']);assert.equal(await page.locator('#panel-home .page-heading,#panel-home .home-hero').count(),0);assert.doesNotMatch(await page.locator('#panel-home').textContent(),/从线索开始|一个工具箱，连接每一步解谜/);
  assert.equal(await page.locator('#panel-about .tool-provenance,#panel-extract .tool-provenance').count(),0);assert.equal(await page.locator('#panel-resources').count(),0);assert.equal(await page.locator('.rail-groups [data-route=about],.rail-groups [data-route=settings]').count(),0);
  await page.locator('#panel-home button[data-category=media]').click();assert.equal(await page.locator('#panel-home [data-capability-group]').count(),registry.groups.filter(g=>g.category==='media').length);
  await page.locator('#home-search').fill('传统历法');assert.ok(await page.locator('#panel-home [data-capability="native:calendar"]:visible').isVisible(),'Typing a query searches all five categories');
  await page.locator('#panel-home button[data-category=media]').click();assert.equal(await page.locator('#panel-home [data-capability="native:calendar"]:visible').count(),0,'An explicit category filter narrows search');
  await page.locator('#panel-home button[data-category=""]').click();await page.locator('#panel-home [data-capability="native:calendar"]:visible').click();await page.waitForSelector('#panel-calendar:not([hidden])');
  await page.locator('.brand').click();await page.waitForSelector('#panel-home:not([hidden])');await page.locator('#home-search').fill('ROT13');
  await page.locator('#panel-home [data-capability="topic:rot"]:visible').click();await page.waitForSelector('#panel-crypto:not([hidden])');
  const favorite=page.locator('#panel-crypto [data-favorite=crypto]');await favorite.click();assert.equal(await favorite.getAttribute('aria-pressed'),'true');assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('arg.ui.favorites.v1'))),['crypto']);
  await go('home');assert.equal(await page.locator('#panel-home .home-quick-links a[href="#crypto"]').count(),1,'旧收藏入口保持兼容');const recentROT=page.locator('#panel-home .home-quick-links a[href*="task=topic%3Arot"]');assert.equal(await recentROT.count(),1,'最近使用保存真实工具及其操作');await recentROT.click();await page.waitForSelector('#panel-crypto:not([hidden])');assert.equal(await page.locator('#ct-crypto').getAttribute('data-operation'),'ROT13');
  const task=page.locator('#ct-crypto');await task.locator('.ct-input').fill('Do not persist this clue');
  await page.evaluate(()=>window.originalClue=document.querySelector('#ct-crypto .ct-input'));
  await go('file');await page.locator('#file-input').setInputFiles({name:'保留文件.txt',mimeType:'text/plain',buffer:Buffer.from('ARG preserved bytes')});await page.waitForFunction(()=>document.querySelector('#file-output').value.includes('保留文件.txt'));
  const originalFile=await page.locator('#file-output').inputValue();await page.evaluate(()=>window.originalFileInput=document.querySelector('#file-input'));
  await go('settings');
  const settings=page.locator('#panel-settings');const baseFont=await settings.locator('select').first().evaluate(n=>parseFloat(getComputedStyle(n).fontSize));
  await page.locator('#setting-motion').selectOption('reduce');assert.equal(await page.evaluate(async()=>{const {motionAllowed}=await import('./ui/index.js');return motionAllowed();}),false);
  assert.equal(await settings.locator('button').first().evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
  await page.locator('#setting-scanlines').selectOption('false');assert.equal(await page.evaluate(()=>getComputedStyle(document.body,'::before').display),'none');
  await page.locator('#setting-textSize').selectOption('large');assert.ok(await settings.locator('select').first().evaluate(n=>parseFloat(getComputedStyle(n).fontSize))>baseFont);
  await page.locator('#setting-density').selectOption('comfortable');assert.ok(await settings.locator('select').first().evaluate(n=>n.getBoundingClientRect().height)>=48);
  await page.locator('#setting-showRecent').selectOption('false');await page.locator('#setting-showFavorites').selectOption('false');
  await page.locator('.brand').click();assert.equal(await page.locator('.home-collections').isVisible(),false);assert.equal(await page.locator('.rail-collection:visible').count(),0);
  await go('crypto');assert.equal(await task.locator('.ct-input').inputValue(),'Do not persist this clue');assert.equal(await page.evaluate(()=>window.originalClue===document.querySelector('#ct-crypto .ct-input')),true);
  await go('file');assert.equal(await page.locator('#file-output').inputValue(),'','Leaving a task invalidates its old result');assert.equal(await page.evaluate(()=>document.querySelector('#file-input')===window.originalFileInput),true,'The original file control survives website navigation');await page.locator('#file-hex').click();assert.equal(await page.locator('#file-output').inputValue(),originalFile.split('\n\n')[1],'Re-running reads the same original bytes');
  await go('settings');const exported=page.waitForEvent('download');await settings.getByRole('button',{name:'导出设置与收藏'}).click();const backup=await readFile(await(await exported).path(),'utf8');assert.ok(!backup.includes('Do not persist')&&!backup.includes('preserved bytes')&&!backup.includes('保留文件'));
  const snapshot=await page.evaluate(()=>localStorage.getItem('arg.ui.preferences.v1'));await page.locator('#settings-import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"format":"arg-tool-preferences","version":1,"preferences":{"motion":"system"},"favorites":["missing"]}')});await page.waitForFunction(()=>document.querySelector('#settings-status').dataset.state==='error');assert.equal(await page.evaluate(()=>localStorage.getItem('arg.ui.preferences.v1')),snapshot,'invalid import must not partially apply settings');
  await settings.getByRole('button',{name:'恢复默认设置'}).click();assert.equal(await page.locator('#setting-textSize').inputValue(),'standard');assert.equal(await page.locator('#setting-startPage').inputValue(),'home');assert.equal(await page.evaluate(()=>getComputedStyle(document.body,'::before').display),'block');
  await page.locator('#settings-import').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(backup)});await page.waitForFunction(()=>document.querySelector('#settings-status').textContent==='设置与收藏已导入');assert.equal(await page.locator('#setting-motion').inputValue(),'reduce');
  await page.locator('#setting-startPage').selectOption('last');await go('encoding');await page.goto(base);await page.waitForSelector('#panel-encoding:not([hidden])');
  await page.goto(base+'#resources');await page.waitForSelector('#panel-about:not([hidden])');assert.equal(new URL(page.url()).hash,'#about');assert.equal(await page.locator('.about-credits').getAttribute('open'),null);await page.locator('.about-credits>summary').click();await page.locator('.resource-card').first().waitFor({state:'visible'});assert.equal(await page.locator('.resource-card:visible').count(),PROJECT_LICENSES.length);await page.locator('.about-credits>summary').click();
  const versions=page.locator('#about-versions'),versionSummary=versions.locator(':scope>summary'),currentVersion=versions.locator(`[data-current-version="${APP_VERSION}"]`);
  assert.equal(APP_VERSION,'V1.3');assert.equal(await versions.getAttribute('open'),null,'Version history starts collapsed');assert.equal(await versionSummary.textContent(),`版本更新 · ${APP_VERSION}`);assert.equal(await currentVersion.isVisible(),false);
  await versionSummary.click();await currentVersion.waitFor({state:'visible'});assert.equal(await currentVersion.textContent(),`${APP_VERSION} · 实用计算与符号录入体验优化`);
  assert.equal(await versions.locator('[data-release-version="V1.0"]').count(),1,'V1.0 remains in history');assert.equal(await versions.locator('[data-release-version="V0.9.5"]').count(),1,'V0.9.5 remains in history');assert.equal(await versions.locator('[data-release-version="V0.9.2"]').count(),1,'Previous release remains in history');
  const previousRelease=versions.locator('[data-release-version="V1.2"]');assert.equal(await previousRelease.count(),1,'V1.2 保留为历史记录');assert.equal(await previousRelease.getAttribute('open'),null);
  const currentChanges=await versions.locator(':scope>ul').textContent();for(const feature of ['综合计算器','单位换算','日期加减','会议规划','摩尔质量','盲文与旗语','最近使用'])assert.ok(currentChanges.includes(feature),feature+' 列入当前公告');
  const historicalVersion=versions.locator('[data-release-version="V0.9"]');assert.equal(await historicalVersion.count(),1);assert.equal(await historicalVersion.getAttribute('open'),null,'Previous release stays collapsed');
  await page.locator('#report-problem').click();assert.ok((await page.locator('#report-preview').inputValue()).includes(`"version": "${APP_VERSION}"`),'Problem report and About share the current product version');await page.keyboard.press('Escape');
  const versionText=await versions.textContent();for(const text of ['Vditor 笔记本','删除及导入导出','思维导图与线索白板','Mind Elixir','Excalidraw','25 项底层任务','及对应科普','同一页面选择具体操作','78 个底层操作'])assert.ok(versionText.includes(text),'V0.9 includes '+text);
  assert.equal(await versions.locator('[data-release-version="V0.8"]').count(),1);assert.equal(await versions.locator('[data-release-version="V0.1"]').count(),1);assert.doesNotMatch(await page.locator('#panel-about').textContent(),/按实际开发记录补记|阶段版本|未标注正式发布日期/);await versionSummary.click();
  await go('settings');await page.locator('#setting-startPage').selectOption('home');await page.goto(base+'#crypto');await page.waitForSelector('#panel-crypto:not([hidden])');assert.equal(await task.locator('.tool-favorite').count(),0);
  await go('settings');await settings.getByRole('button',{name:'恢复默认设置'}).click();
  for(const width of [320,390,800,1440]){await page.setViewportSize({width,height:950});for(const id of ['home','about','settings',...GUIDE_PAGES.map(page=>page.route)]){await go(id);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' fits '+width);const missingComponents=await page.locator('#panel-'+id).evaluate(async root=>{const {componentOf}=await import('./ui/index.js');return [...root.querySelectorAll('button,input,select,textarea,details,label')].filter(n=>!componentOf(n)).map(n=>n.id||n.className);});assert.deepEqual(missingComponents,[],id+' uses real components');if(prefix==='/'&&[390,1440].includes(width)){await page.waitForFunction(()=>!document.getAnimations().some(a=>a.id.startsWith('ui-')&&a.playState==='running'));await page.screenshot({path:resolve(screenshotRoot,id+'-'+width+'.png')});}}}
  await go('settings');await page.locator('#setting-textSize').selectOption('large');await page.locator('#setting-density').selectOption('comfortable');await page.setViewportSize({width:390,height:844});for(const id of ['home','about','settings','crypto']){await go(id);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' large text and comfortable density');}
  await go('settings');await settings.getByRole('button',{name:'恢复默认设置'}).click();await page.locator('#setting-motion').selectOption('system');await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(async()=>{const {motionAllowed}=await import('./ui/index.js');return motionAllowed();}),false);await page.emulateMedia({reducedMotion:'no-preference'});assert.equal(await page.evaluate(async()=>{const {motionAllowed}=await import('./ui/index.js');return motionAllowed();}),true);
  await page.evaluate(()=>localStorage.setItem('arg.ui.preferences.v1','{bad'));await page.goto(base);await page.waitForSelector('#panel-home:not([hidden])');assert.equal(await page.evaluate(()=>document.documentElement.dataset.uiText),'standard');
  const tab=await context.newPage();await tab.goto(base+'#settings');await tab.waitForSelector('#panel-settings:not([hidden])');await go('settings');await page.locator('#setting-textSize').selectOption('large');await tab.waitForFunction(()=>document.querySelector('#setting-textSize').value==='large');await settings.getByRole('button',{name:'清空收藏'}).click();await tab.waitForFunction(()=>document.querySelectorAll('.rail-collection:first-child [data-route]').length===0);await tab.close();await settings.getByRole('button',{name:'恢复默认设置'}).click();
  assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});assert.equal(context.pages().length,1);
  console.log('PASS '+prefix+': home search/category routing, shared cards/favorites, about/licenses/legacy link, live motion/type/density/texture, file/input identity, private preference backups/atomic import/recovery/startup, four widths and real components.');
  await context.close();
  if(prefix==='/'){
   const blocked=await browser.newContext({viewport:{width:390,height:844}}),blockedErrors=[];
   await blocked.route('**/*',async route=>{const url=new URL(route.request().url());assert.equal(url.hostname,'arg.test');const path=resolve('public','.'+(url.pathname==='/'?'/index.html':url.pathname));await route.fulfill({body:await readFile(path),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.wasm':'application/wasm'})[extname(path)]||'application/octet-stream'});});
   await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new DOMException('Blocked','SecurityError');};Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError');};});
   const p=await blocked.newPage();p.on('pageerror',e=>blockedErrors.push(e.message));await p.goto('https://arg.test/#settings');await p.waitForSelector('#panel-settings:not([hidden])');await p.locator('#setting-motion').selectOption('reduce');assert.match(await p.locator('#settings-status').textContent(),/储存不可用/);assert.equal(await p.evaluate(()=>document.documentElement.dataset.uiMotion),'reduce');await p.evaluate(()=>location.hash='crypto');await p.waitForSelector('#panel-crypto:not([hidden])');await p.locator('#panel-crypto [data-favorite=crypto]').click();assert.equal(await p.locator('#panel-crypto [data-favorite=crypto]').getAttribute('aria-pressed'),'true');await p.locator('.brand').click();await p.waitForSelector('#panel-home:not([hidden])');assert.ok(await p.locator('#panel-home .home-quick-links a[href="#crypto"]').first().isVisible());assert.deepEqual(blockedErrors,[]);await blocked.close();console.log('PASS: denied browser storage retains live preferences and explicit session favorites.');
  }
 }
}finally{await browser.close();}
