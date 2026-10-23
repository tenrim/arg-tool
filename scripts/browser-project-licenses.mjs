import {tmpdir as testTmpdir} from 'node:os';
import {appPages} from './browser-host.mjs';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {PROJECT_LICENSES,projectLicense} from '../public/project-licenses.js';
import {COMPLETION_TASKS} from '../public/completion/catalog.js';
import {EXPANSION_TASKS} from '../public/expansion/catalog.js';
import {TASK_PROJECT_SOURCES,OPERATION_PROJECT_SOURCES,NOTEBOOK_PROJECT_SOURCES} from '../public/project-source-contracts.js';
import {go} from './browser-navigation.mjs';
import {createDevServer,closeDevServer} from './server.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
// Chromium's native download transport cannot consume a fulfilled synthetic
// origin reliably. Use the real static server so archives are verified as
// actual binary downloads, with mail and online services explicitly stubbed.
const server=createDevServer({env:{},feedbackStarter:async()=>({state:'unconfigured',url:null,code:'TEST',close:async()=>{}}),onlineQueryFactory:()=>({handle(_request,response){response.writeHead(503);response.end();},close(){}})});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
try{
 const context=await browser.newContext({viewport:{width:1365,height:900}}),errors=[],missing=[],external=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(['blob:','data:'].includes(u.protocol)||u.origin===base)return route.continue();external.push(u.href);return route.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.push(new URL(r.url()).pathname);});await page.goto(base+'/#about');await page.waitForSelector('#panel-about:not([hidden])');
 // Check actual registered workspaces, not just whichever footers happen to
 // exist. This makes an entirely omitted footer fail without running engines.
 async function sourceFooter(selector,urls,label){
  const panel=page.locator(selector),footer=panel.locator(':scope > .tool-provenance');
  assert.equal(await footer.count(),urls.length?1:0,label+' has exactly its actual source footer');
  if(!urls.length)return;
  assert.equal(await footer.isVisible(),true,label+' source footer is visible');
  assert.equal(await footer.evaluate(node=>node===node.parentElement.lastElementChild),true,label+' source footer is last');
  const rows=await footer.locator('a').evaluateAll(links=>links.map(link=>{const row=link.closest('li,p');return{url:link.href,license:row?.dataset.license,text:row?.textContent,annotations:row?.querySelectorAll('.project-license').length};}));
  assert.deepEqual(rows.map(row=>row.url),urls,label+' names only real code/data dependencies');
  for(const row of rows){const project=projectLicense(row.url);assert.ok(project,label+' registered '+row.url);assert.equal(row.license,project.license,label+' license data '+row.url);assert.ok(row.text.includes(project.license),label+' visible license '+row.url);assert.equal(row.annotations,1,label+' has one license annotation '+row.url);}
 }
 async function taskSources(id,contract){
  const canonical=await page.evaluate(async id=>{
   const [{loadRegistry,resolveCapability},{capabilityRoute}]=await Promise.all([import('./capabilities/registry.js'),import('./capabilities/routes.js')]);
   const registry=await loadRegistry(),{entry,op,direction}=resolveCapability(registry,id);
   if(!entry||!['native','operation'].includes(entry.open.kind))throw Error('Missing real task '+id);
   location.hash=capabilityRoute(entry,op,direction);
   return entry.id;
  },id);
  await page.waitForFunction(({id,panel})=>{const node=document.getElementById('panel-'+panel);return node&&!node.hidden&&node.querySelector('.capability-workspace-context')?.dataset.currentCapability===id;},{id:canonical,panel:contract.panel});
  const activeUrls=id==='native:byte-codecs'?['https://github.com/Equim-chan/base91']:id==='native:keyboard-extra'?[]:contract.urls;
  await sourceFooter('#panel-'+contract.panel,activeUrls,id);
 }
 assert.equal(await page.locator('.brand svg,.brand img,.brand-symbol,.brand-mark').count(),0);
 assert.equal(await page.locator('#panel-about .tool-provenance,#panel-extract .tool-provenance').count(),0,'本站自写页面不展示空来源栏或浏览器接口');
 await page.locator('.about-credits > summary').click();
 assert.equal(await page.locator('.resource-card').count(),PROJECT_LICENSES.length);
 const footers=await page.locator('.tool-provenance a').evaluateAll(links=>links.map(link=>({url:link.href,license:link.closest('li,p')?.dataset.license,text:link.closest('li,p')?.textContent})));
 for(const f of footers){assert.notEqual(new URL(f.url).hostname,'developer.mozilla.org','浏览器接口不是工具项目来源');const p=projectLicense(f.url);assert.ok(p,'Unregistered '+f.url);assert.ok(f.text.includes(p.license),'Missing license '+f.url);}
 await page.evaluate(async()=>{
  const {Box,Provenance}=await import('./ui/index.js'),{mountProjectSources,setProjectSources}=await import('./project-sources.js');
  const check=(condition,message)=>{if(!condition)throw Error(message);};
  const own=Provenance({className:'tool-provenance',items:[['浏览器 API','https://developer.mozilla.org/zh-CN/docs/Web/API','本站实现']]}),mixed=Provenance({className:'tool-provenance',items:[['CyberChef','https://github.com/gchq/CyberChef','真实运算引擎'],['浏览器 API','https://developer.mozilla.org/zh-CN/docs/Web/API','本站界面']]}),unknown=Provenance({className:'tool-provenance',items:[['未登记项目','https://example.test/project','待核对']]}),empty=Provenance({className:'tool-provenance',items:[]});
  const host=Box({children:[own,mixed,unknown,empty,Box({id:'panel-about',children:Box({className:'resource-grid'})})]});mountProjectSources(host);
  check(!host.contains(own)&&!host.contains(empty),'纯原生及空来源栏应删除');
  check(host.contains(mixed)&&mixed.querySelectorAll('a').length===1&&mixed.textContent.includes('Apache-2.0'),'混合来源保留真实项目与许可');
  check(host.contains(unknown)&&unknown.querySelector('p').dataset.license==='missing','未登记外部项目必须继续报告缺失许可');
  check(!host.querySelector('.tool-provenance a[href*="developer.mozilla.org"]'),'共用来源层移除浏览器接口条目');
  const dynamic=Box();host.prepend(dynamic);
  const projects=['https://github.com/alpertron/calculators','https://github.com/ggerganov/ggmorse'];
  const verify=()=>{const footer=dynamic.querySelector(':scope>.tool-provenance');check(footer&&footer===dynamic.lastElementChild,'动态来源保持页末');check(footer.querySelectorAll('a').length===projects.length,'动态来源项目不得重复或丢失');for(const row of footer.querySelectorAll('li,p[data-license]')){if(!row.querySelector('a'))continue;check(row.dataset.license&&row.dataset.license!=='missing','动态来源即时登记许可');check(row.querySelectorAll('.project-license').length===1,'重复来源组装不得重复许可');check(row.textContent.includes(row.dataset.license),'动态来源显示精确许可');}};
  setProjectSources(dynamic,projects);verify();setProjectSources(dynamic,projects);verify();
  mountProjectSources(host);verify();mountProjectSources(host);verify();
  setProjectSources(dynamic,[]);check(!dynamic.querySelector('.tool-provenance'),'无实际依赖时删除整个来源栏');
 });
 for(const project of PROJECT_LICENSES){const card=page.locator(`.resource-card[data-project="${project.url}"]`);assert.ok((await card.locator('.project-license').textContent()).includes(project.license));await card.locator('summary').click();await page.waitForFunction(url=>document.querySelector(`.resource-card[data-project="${url}"] pre`),project.url);assert.equal(await card.locator('pre').count(),project.notices.length);for(const [index,path]of project.notices.entries())assert.equal(await card.locator('pre').nth(index).textContent(),await readFile(resolve('public',path),'utf8'));if(project.sourceArchive){const [download]=await Promise.all([page.waitForEvent('download'),card.locator('[data-project-archive]').click()]);assert.deepEqual(await readFile(await download.path()),await readFile(resolve('public',project.sourceArchive)),'corresponding source is a complete binary download, never decoded as license text');}await card.locator('summary').click();}
 assert.equal(EXPANSION_TASKS.length,25+COMPLETION_TASKS.length,'active expansion families exclude the nine retired advanced calculators');
 for(const task of EXPANSION_TASKS){const id='native:'+task.id;assert.ok(Object.hasOwn(TASK_PROJECT_SOURCES,id),'Missing source ownership for '+id);assert.equal(TASK_PROJECT_SOURCES[id].panel,task.panel,id+' uses its real panel');}
 for(const [id,contract]of Object.entries(TASK_PROJECT_SOURCES))await taskSources(id,contract);
 for(const [operation,contract]of Object.entries(OPERATION_PROJECT_SOURCES))await taskSources('op:'+encodeURIComponent(operation),contract);
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id:'op:Generate%20QR%20Code'}})));
 await page.locator('#ct-image[data-operation="Generate QR Code"]').waitFor();
 await sourceFooter('#panel-image',['https://github.com/gchq/CyberChef'],'QR generation after shared-image parsing');
 await go(page,'notebook');await page.waitForSelector('[data-notebook-view-link="notes"][aria-pressed="true"]');
 await sourceFooter('#panel-notebook',NOTEBOOK_PROJECT_SOURCES,'notebook notes');
 for(const [view,urls]of [['mindmap',['https://github.com/SSShooter/mind-elixir-core']],['whiteboard',['https://github.com/excalidraw/excalidraw','https://github.com/facebook/react']]]){
  await go(page,'notebook/'+view);await page.waitForSelector(`[data-notebook-view-link="${view}"][aria-pressed="true"]`);
  assert.equal(await page.locator('#panel-notebook > .tool-provenance').isVisible(),false,view+' hides note-editor sources');
  await sourceFooter('#panel-'+view,urls,'notebook '+view);
  assert.equal(await page.locator('#panel-notebook .tool-provenance:visible').count(),1,view+' has one visible source footer');
 }
 await go(page,'notebook');await page.waitForSelector('[data-notebook-view-link="notes"][aria-pressed="true"]');
 await sourceFooter('#panel-notebook',NOTEBOOK_PROJECT_SOURCES,'notebook notes after graph views');
 for(const width of [320,390,768,1365]){await page.setViewportSize({width,height:900});await go(page,'about');await page.locator('.resource-card details').first().locator('summary').click();assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w+1,width));await page.locator('.resource-card details').first().locator('summary').click();await page.screenshot({path:`${testTmpdir()}/arg-licenses-${width}.png`,fullPage:true});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=391));
 assert.equal(appPages(context).length,1);assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});console.log(`PASS: ${PROJECT_LICENSES.length} source cards, ${footers.length} initial footer source links, ${Object.keys(TASK_PROJECT_SOURCES).length} registered task source contracts, notebook/graph view ownership, repeated source assembly, all bundled license originals, no brand icon, four widths and 200% text.`);
}finally{await browser.close();await closeDevServer(server);}
