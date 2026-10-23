import {tmpdir as testTmpdir} from 'node:os';
import {chooseOperation} from './browser-navigation.mjs';
import {appPages} from './browser-host.mjs';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {toolGroups,capabilityCategories} from '../public/navigation.js';
import {GROUPS} from '../public/chef-tools/catalog.js';
import {completionImplementationSources} from '../public/completion/sources.js';
import {TASK_PROJECT_SOURCES} from '../public/project-source-contracts.js';
import {go} from './browser-navigation.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const context=await browser.newContext({viewport:{width:1365,height:900},hasTouch:true}),errors=[],missing=[],external=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='arg.test'){external.push(u.href);return route.abort();}try{const p=resolve('public','.'+(u.pathname==='/'?'/index.html':u.pathname));await route.fulfill({body:await readFile(p),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.woff2':'font/woff2','.png':'image/png'})[extname(p)]||'application/octet-stream'});}catch{missing.push(u.pathname);await route.abort();}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://arg.test/#crypto');await page.waitForSelector('#panel-crypto:not([hidden])');
 await page.waitForFunction(()=>document.querySelector('#ct-crypto')?.dataset.operation==='ROT13');assert.ok(new URL(page.url()).hash.includes('task='));assert.equal(await page.locator('.ct-picker,#chef-directory').count(),0);
 assert.deepEqual(await page.locator('.rail-category-link>span').allTextContents(),capabilityCategories.map(category=>category.title));
 const task=id=>page.locator('#ct-'+id);
 async function choose(id,op){await chooseOperation(page,op);}
 async function run(id){await task(id).locator('.ct-run').click();await page.waitForFunction(id=>/处理完成|失败|错误|已停止/.test(document.querySelector('#ct-'+id+' .ct-status').textContent),id,{timeout:45000});assert.match(await task(id).locator('.ct-status').textContent(),/处理完成/);}
 const value=id=>task(id).locator('.ct-output').inputValue();
 await page.keyboard.press('Control+k');assert.equal(await page.locator('.workspace-search input').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Escape');
 await choose('crypto','ROT13');await task('crypto').locator('.ct-input').fill('HELLO');await run('crypto');assert.equal(await value('crypto'),'URYYB');
 await choose('crypto','AES Encrypt');
 const key='000102030405060708090a0b0c0d0e0f',iv='00000000000000000000000000000000';
 for(const [i,v]of [[0,key],[1,iv]])await task('crypto').locator(`[data-arg="${i}"] input`).fill(v);
 await task('crypto').locator('.ct-input').fill('ARG 测试');await run('crypto');await task('crypto').locator('.ct-use').click();await choose('crypto','AES Decrypt');
 for(const [i,v]of [[0,key],[1,iv]])await task('crypto').locator(`[data-arg="${i}"] input`).fill(v);
 await run('crypto');assert.equal(await value('crypto'),'ARG 测试');const downloaded=page.waitForEvent('download');await task('crypto').locator('.ct-download').click();assert.deepEqual(await readFile(await(await downloaded).path()),Buffer.from('ARG 测试'));
 await go(page,'encoding/base');await choose('encoding','From Base64');await task('encoding').locator('.ct-input').fill('SEVMTE8=');await run('encoding');assert.equal(await value('encoding'),'HELLO');
 await chooseOperation(page,'URL Decode');await page.locator('#basics-input').fill('%E8%B0%9C%E9%A2%98');await page.locator('#basics-run').click();await page.waitForFunction(()=>document.querySelector('#basics-output').value==='谜题');assert.equal(await page.locator('#basics-output').inputValue(),'谜题');
 // Discovery lists every canonical family once; raw directions remain in the registry.
 await go(page,'browse/codec/encoding');
 const baseFamilies=await page.evaluate(async()=>{const registry=await(await import('./capabilities/registry.js')).loadRegistry();return registry.entries.filter(entry=>entry.group==='encoding'&&entry.listed!==false).map(entry=>entry.id).sort();});
 const group=page.locator('#panel-browse [data-capability-group="encoding"]');
 if(await group.locator('[data-expand-group]').getAttribute('aria-expanded')!=='true')await group.locator('[data-expand-group]').click();
 assert.deepEqual(await group.locator('.capability-expanded-list [data-capability]').evaluateAll(nodes=>nodes.map(node=>node.dataset.capability).sort()),baseFamilies);
 await go(page,'crypto/publickey');await choose('crypto','RSA Encrypt');await page.locator('#panel-crypto .tool-help-button').click();assert.match(await page.locator('#tool-help-crypto .ct-instructions').textContent(),/密钥/);assert.equal(await page.locator('#tool-help-crypto .ct-instructions').isVisible(),true);await page.locator('#panel-crypto .tool-help-button').click();
 // Every navigation destination must exist, and subgroup links must select the promised task category.
 for(const [route]of toolGroups.flatMap(g=>g.items)){await go(page,route);const [panel,group]=route.split('/');await page.waitForSelector('#panel-'+panel+':not([hidden])');if(!['knowledge'].includes(panel))assert.ok(await page.locator('#panel-'+panel+' .capability-workspace-context').count(),'Page destination resolves to a task');const selection=new URLSearchParams(new URL(page.url()).hash.split('?')[1]),sourceTask=selection.get('view')||selection.get('task');const implementation=await page.evaluate(id=>Object.fromEntries(['mode','codec','direction'].map(key=>[key,document.getElementById(id+'-'+key)?.value]).filter(([,value])=>value!==undefined)),panel);const sourceUrls=completionImplementationSources(panel,implementation)??TASK_PROJECT_SOURCES[sourceTask]?.urls;if(['extract','knowledge'].includes(panel)||sourceUrls?.length===0)assert.equal(await page.locator('#panel-'+panel+' .tool-provenance').count(),0,'original-only task has no invented dependency footer');else assert.equal(await page.locator('#panel-'+panel+' .tool-provenance').evaluate(e=>e===e.parentElement.lastElementChild),true);}
 for(const width of [320,390,768,820,1365]){
  await page.setViewportSize({width,height:900});
  for(const route of ['crypto','encoding','language']){
   await go(page,route);const help=page.locator('#panel-'+route+' .tool-help-button');
   await help.click();assert.equal(await help.getAttribute('aria-expanded'),'true');await help.click();
   assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w+1,width),route+' '+width);
   assert.equal(await page.locator('.site-header .tool-category,.workbench-directory-trigger').count(),0);
   assert.equal((await page.locator('.header-inner').boundingBox()).height,64);
   if(width>800){
    const geometry=await page.evaluate(()=>{const box=node=>{const r=node.getBoundingClientRect();return{left:r.left,right:r.right,width:r.width};};const header=document.querySelector('.header-inner'),brand=header.querySelector('.brand');return{header:box(header),main:box(document.querySelector('main')),search:box(document.querySelector('.workspace-search-trigger')),menu:box(document.querySelector('.workbench-menu')),brand:brand?box(brand):null};});
    assert.ok(Math.abs(geometry.header.left-geometry.main.left)<2&&Math.abs(geometry.header.right-geometry.main.right)<2,'B layout header follows the content boundaries '+width);
    assert.ok(geometry.search.left>=Math.max(geometry.menu.right,geometry.brand?.right||0)+8&&geometry.search.right<=geometry.header.right-12,'Search does not overlap header controls '+width);
    assert.ok(geometry.search.width>=240,'Inline search retains a usable input width '+width);
   }
  }
  await go(page,'crypto');await page.screenshot({path:`${testTmpdir()}/arg-categories-${width}.png`,fullPage:true});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='200%');for(const route of ['crypto','encoding','language']){await go(page,route);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=391));}
 assert.equal(appPages(context).length,1,context.pages().map(p=>p.url()).join(' | '));assert.equal(await page.locator('iframe').count(),0);assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});console.log('PASS: 505-operation routing, native default, every catalogue destination through search, real ROT13/AES/Base64/URL flows, help and provenance, 64px header at 320–1365px, content-aligned desktop search and 200% text.');
}finally{await browser.close();}
