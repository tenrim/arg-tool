import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';
import {chooseOperation} from './browser-navigation.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
try{
 for(const motion of ['no-preference','reduce']){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:motion});
  const errors=[];const external=[];
  await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='arg.test'){external.push(u.href);return route.abort();}try{const path=resolve('public',u.pathname.replace(/^\/tools\//,'')||'index.html');await route.fulfill({body:await readFile(path),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.wasm':'application/wasm','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'missing'});}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://arg.test/tools/#encoding');await chooseOperation(page,'To Base64');
  const input=page.locator('#ct-encoding .ct-input');await input.fill('边解谜边记录');await page.locator('#ct-encoding .ct-run').click();
  await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));
  const hash=await page.evaluate(()=>location.hash);
  await page.evaluate(()=>{window.dockOriginalInput=document.querySelector('#ct-encoding .ct-input');window.dockPanelEvents=0;document.addEventListener('arg:panelchange',()=>window.dockPanelEvents++);});
  const open=()=>page.locator('.rail-site-link[data-route="notebook"]').click();
  // Observe animation creation, not a delayed screenshot that may miss it.
  await page.evaluate(()=>{const original=Element.prototype.animate;window.dockMotion=[];Element.prototype.animate=function(...args){const animation=original.apply(this,args);window.dockMotion.push({node:this,animation});return animation;};});
  await open();const dock=page.getByRole('complementary',{name:'笔记本侧栏'});await dock.waitFor({state:'visible'});
  const effects=await page.evaluate(()=>window.dockMotion.map(r=>({id:r.animation.id,duration:r.animation.effect.getTiming().duration,padding:r.animation.effect.getKeyframes().some(k=>'paddingRight'in k)})));
  if(motion==='no-preference')assert(effects.some(e=>e.id==='ui-layout'&&e.duration>0&&e.padding),'notebook opening animates real reserved width');
  else assert(!effects.some(e=>e.id==='ui-layout'),'reduced motion changes dock layout immediately');
  assert.equal(await page.evaluate(()=>location.hash),hash);assert.equal(await page.evaluate(()=>window.dockPanelEvents),0,'Opening notes must not deactivate the tool');
  assert(await input.isVisible());assert(await input.evaluate(n=>n===window.dockOriginalInput));
  assert(await page.locator('#ct-encoding [data-notebook-result]').isEnabled());
  await page.locator('#notebook-new').click();await page.locator('#notebook-title').fill('并排线索');
  const editor=page.locator('#notebook-editor .vditor-ir [contenteditable=true]');await editor.fill('第一条记录');
  await page.waitForFunction(()=>document.querySelector('#notebook-status').textContent==='已保存到本机');
  await page.evaluate(()=>window.dockOriginalEditor=document.querySelector('#notebook-editor'));
  const separator=page.getByRole('separator',{name:'调整笔记本宽度'});const initial=(await dock.boundingBox()).width;
  const rect=await separator.boundingBox();await page.mouse.move(rect.x+rect.width/2,rect.y+120);await page.mouse.down();await page.mouse.move(rect.x-100,rect.y+120,{steps:8});await page.mouse.up();
  assert((await dock.boundingBox()).width>initial+70);await separator.focus();await page.keyboard.press('ArrowRight');assert((await dock.boundingBox()).width>initial+40);
  await page.keyboard.press('Home');assert.equal(await separator.getAttribute('aria-valuenow'),'360');await page.keyboard.press('End');
  const main=await page.locator('main').boundingBox(),side=await dock.boundingBox();assert(main.x+main.width<=side.x+1,'Pane reserves space instead of covering the tool');
  assert(await page.locator('#panel-notebook>.tool-provenance').isVisible());
  // Switching tools leaves the same editor available. Closing must save even
  // before the debounce fires; reopening reuses the original editor instance.
  await chooseOperation(page,'From Hex');assert(await dock.isVisible());assert.match(await editor.textContent(),/第一条记录/);
  await editor.fill('关闭前的修改');await page.getByRole('button',{name:'关闭笔记本侧栏',exact:true}).click();assert(await page.locator('.ui-dock').evaluate(n=>n.hidden&&n.inert),'close is logically immediate');await dock.waitFor({state:'hidden'});
  await open();assert(await page.locator('#notebook-editor').evaluate(n=>n===window.dockOriginalEditor));assert.match(await editor.textContent(),/关闭前的修改/);
  await page.getByRole('button',{name:'打开完整笔记本页面'}).click();await page.waitForFunction(()=>location.hash==='#notebook');assert(!(await dock.isVisible()));assert(await page.locator('main>#panel-notebook').isVisible());assert.match(await editor.textContent(),/关闭前的修改/);
  // Drawings retain the notebook owner and enter the existing full workspace.
  await page.evaluate(()=>{location.hash='encoding';});await input.waitFor({state:'visible'});await open();await page.getByRole('button',{name:'插入脑图',exact:true}).click();await page.waitForFunction(()=>location.hash==='#notebook/mindmap');assert(!(await dock.isVisible()));
  await page.evaluate(()=>{location.hash='encoding';});await input.waitFor({state:'visible'});await open();assert(await page.locator('#panel-notebook>.tool-provenance').isVisible(),'Returning from a drawing restores the notes source footer');
  await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>location.hash==='#notebook');assert(!(await dock.isVisible()));assert.match(await editor.textContent(),/关闭前的修改/);
  await page.evaluate(()=>{location.hash='home';});await page.locator('#panel-home').waitFor({state:'visible'});await page.getByRole('button',{name:'切换工具侧栏'}).click();await open();await page.waitForFunction(()=>location.hash==='#notebook');assert(!(await dock.isVisible()));
  assert(await page.locator('#notebook-editor').evaluate(n=>n===window.dockOriginalEditor));assert.equal(await page.locator('#notebook-editor').count(),1);
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>{location.hash='encoding';});await input.waitFor({state:'visible'});await open();
  await separator.focus();await page.keyboard.press('Home');for(let i=0;i<5;i++)await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('.notebook-compact-index').getAttribute('open'),null);
  await page.locator('.notebook-compact-index>summary').click();assert(await page.locator('.notebook-compact-index').evaluate(n=>n.open),'Disclosure opens synchronously');await page.locator('#notebook-search').waitFor({state:'visible'});await page.locator('#notebook-search').fill('并排');assert.equal(await page.locator('#notebook-list [data-note-id]').count(),1);await page.locator('.notebook-compact-index>summary').click();
  await page.waitForFunction(()=>document.querySelector('.notebook-compact-index').getBoundingClientRect().height<=50);
  const shots=resolve(tmpdir(),'arg-notebook-dock');await mkdir(shots,{recursive:true});await page.screenshot({path:resolve(shots,motion+'.png')});
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await context.close();console.log('PASS notebook dock: '+motion+'; live tool/editor identity, result availability, pointer/keyboard resize, save/close/promote, drawings, narrow viewport and mobile navigation.');
 }
}finally{await browser.close();}
