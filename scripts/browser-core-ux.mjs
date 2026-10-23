import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {chooseNativeTask} from './browser-navigation.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const errors=[],external=[],checks=[];
try{
 for(const [width,reduce]of [[1440,false],[390,false],[390,true]]){
  const context=await browser.newContext({viewport:{width,height:950},reducedMotion:reduce?'reduce':'no-preference'});
  await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}try{const path=resolve('public','.'+(url.pathname==='/'?'/index.html':url.pathname));await route.fulfill({body:await readFile(path),contentType:({'.js':'text/javascript','.html':'text/html','.css':'text/css','.woff2':'font/woff2','.json':'application/json','.wasm':'application/wasm'})[extname(path)]||'application/octet-stream'});}catch{external.push(url.pathname);await route.abort();}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://arg.test/#symbols');await chooseNativeTask(page,'native:braille');await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('#braille-entry-mode').inputValue(),'keyboard');assert.equal(await page.locator('#braille-dots').isVisible(),false);assert.equal(await page.locator('#braille-keyboard button').count(),27);assert.deepEqual(await page.locator('#braille-keyboard button small').allTextContents(),[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ','数字标记']);assert.equal(await page.locator('[data-braille-cell="2"],[data-braille-cell="0"]').count(),0,'不生成空白或未对应字符的按键');
  await page.locator('[data-braille-cell="1"]').click();assert.equal(await page.locator('#braille-letter').textContent(),'A');assert.equal(await page.locator('#symbols-output').inputValue(),'A');assert.equal(await page.locator('#braille-add').isVisible(),false);
  await page.locator('#braille-entry-mode').selectOption('dots');assert.equal(await page.locator('[data-braille-dot="0"]').getAttribute('aria-pressed'),'true');await page.locator('[data-braille-dot="1"]').click();assert.equal(await page.locator('#braille-letter').textContent(),'B');
  await page.locator('#braille-add').click();assert.equal(await page.locator('#symbols-output').inputValue(),'AB');await page.locator('#braille-entry-mode').selectOption('keyboard');assert.equal(await page.locator('[data-braille-cell="3"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#braille-add').isVisible(),false);
  await page.locator('[data-braille-cell="9"]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('#braille-letter').textContent(),'C');
  await page.locator('#braille-entry-mode').selectOption('dots');await page.evaluate(()=>{for(const node of document.querySelectorAll('#braille-dots [aria-pressed=true]'))node.click();document.querySelector('[data-braille-dot="1"]').click();});assert.equal(await page.locator('#braille-symbol').textContent(),'⠂');await page.locator('#braille-entry-mode').selectOption('keyboard');assert.equal(await page.locator('#braille-keyboard [aria-pressed=true]').count(),0,'逐点输入仍保留未定义图形，不冒充另一个字母');await page.locator('[data-braille-cell="9"]').click();
  for(const id of ['native:braille-languages','native:gs8','native:braille'])await chooseNativeTask(page,id);
  const recents=await page.evaluate(async()=> (await import('/preferences.js')).getRecentEntries());assert.equal(recents.filter(entry=>entry.id==='topic:braille').length,1);assert.equal(recents[0].title,'盲文工具');
  assert.equal(await page.locator('.rail-collection [data-collection-id="topic:braille"]').count(),1);assert.match(await page.locator('.rail-collection [data-collection-id="topic:braille"]').getAttribute('href'),/view=native%3Abraille/);
  await chooseNativeTask(page,'native:pigpen');await chooseNativeTask(page,'native:braille-languages');
  assert.equal(await page.evaluate(async()=> (await import('/preferences.js')).getRecentEntries().filter(entry=>['native:pigpen','topic:braille'].includes(entry.id)).length),2);
  if(width>=1100)await page.locator('.rail-collection [data-collection-id="topic:braille"]').click();
  assert.match(page.url(),/braille-languages/);
  await chooseNativeTask(page,'native:qalculate');
  const buttons=page.locator('.qalculate-keypad').last().locator('button');const before=await buttons.evaluateAll(nodes=>nodes.map(n=>({id:n.id,left:n.offsetLeft,top:n.offsetTop,width:n.offsetWidth,height:n.offsetHeight})));
  for(const id of ['7','close','1','9','0','open']){
   await page.locator('#qalculate-key-'+id).hover();
   const paints=await page.locator('.qalculate-keypad').last().evaluate(async group=>{
    const snapshots=[];for(let i=0;i<6;i++){await new Promise(requestAnimationFrame);const keys=[...group.children].map(n=>n.getBoundingClientRect());for(const paint of group.shadowRoot?.querySelectorAll('[data-slot=trigger-highlight]')||[]){const box=paint.getBoundingClientRect();if(getComputedStyle(paint).opacity==='0')continue;snapshots.push({fits:keys.some(key=>box.left>=key.left-4&&box.right<=key.right+4&&box.top>=key.top-4&&box.bottom<=key.bottom+4),box:box.toJSON()});}}return{layout:group.dataset.hoverLayout,snapshots};
   });
   assert.equal(paints.layout,'spatial');assert.ok(paints.snapshots.every(s=>s.fits),'hover paint remains inside an actual key: '+JSON.stringify(paints));
   await page.locator('#qalculate-key-'+id).click();
  }
  assert.deepEqual(await buttons.evaluateAll(nodes=>nodes.map(n=>({id:n.id,left:n.offsetLeft,top:n.offsetTop,width:n.offsetWidth,height:n.offsetHeight}))),before,'rapid input cannot resize or displace the keypad');
  await page.emulateMedia({reducedMotion:reduce?'no-preference':'reduce'});await page.locator('#qalculate-key-8').click();await page.emulateMedia({reducedMotion:reduce?'reduce':'no-preference'});
  await chooseNativeTask(page,'native:number-integer');
  for(const size of width===1440?[1440,1080,800,390,320]:[width]){
   await page.setViewportSize({width:size,height:950});
   const geometry=await page.locator('#number-integer-digits').evaluate(input=>{const form=input.closest('[data-ui=form-grid]'),box=form.getBoundingClientRect(),fields=[...form.children].filter(n=>n.dataset.ui==='field').map(n=>{const control=n.querySelector('.ui-select-trigger,input');const rect=control.getBoundingClientRect();return{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:rect.width};});return{box:box.toJSON(),fields,file:form.querySelector('[data-ui=file-picker]').getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth+1};});
   assert.equal(geometry.overflow,false,'responsive form @'+size);assert.ok(geometry.fields.every(f=>f.left>=geometry.box.left-1&&f.right<=geometry.box.right+1&&f.width>=Math.min(200,geometry.box.width)-1));assert.ok(Math.abs(geometry.file.width-geometry.box.width)<1,'file picker owns a complete row');
   if(size===1440)assert.ok(Math.abs(geometry.fields.at(-1).right-geometry.box.right)<1,'no phantom empty columns');
  }
  await page.setViewportSize({width,height:950});await chooseNativeTask(page,'native:birds');await page.locator('#birds-run:enabled').waitFor();await page.locator('#birds-query').fill('灰颈鸵鸟');await page.locator('#birds-run').click();await page.locator('#birds-download:enabled').waitFor();
  const primary=page.locator('#birds-detail [data-record-section=primary]');assert.match(await primary.textContent(),/灰颈鸵鸟/);assert.doesNotMatch(await primary.textContent(),/Sequence|English_name|sourceRow|快照|许可|CLDR|IOC/);
  const original=page.locator('#birds-detail [data-record-section=original]');assert.equal(await original.getAttribute('open'),null);await original.locator('summary').click();assert.match(await original.textContent(),/English_name_AviList/);assert.match(await original.textContent(),/CC BY 3.0/);assert.match(await original.textContent(),/中文名原表行号/);
  const footer=page.locator('#panel-birds>.tool-provenance');assert.equal(await footer.isVisible(),true);assert.equal(await footer.evaluate(n=>n===n.parentElement.lastElementChild),true);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await original.locator('summary').click();assert.equal(await original.getAttribute('open'),null,'收起语义立即生效');
  await page.waitForFunction(()=>{const node=document.querySelector('#birds-detail [data-record-section=original]'),summary=node.querySelector('summary'),style=getComputedStyle(node),child=getComputedStyle(summary),extra=['paddingTop','paddingBottom','borderTopWidth','borderBottomWidth'].reduce((sum,key)=>sum+(parseFloat(style[key])||0),0)+(parseFloat(child.marginTop)||0)+(parseFloat(child.marginBottom)||0);return node.getBoundingClientRect().height<=summary.getBoundingClientRect().height+extra+1;});
  if(process.env.CORE_UX_ARTIFACTS){await mkdir(process.env.CORE_UX_ARTIFACTS,{recursive:true});await page.screenshot({path:resolve(process.env.CORE_UX_ARTIFACTS,`birds-${width}-${reduce}.png`),fullPage:true});}
  checks.push({width,reducedMotion:reduce,braille:'27 meaningful keys, alphabetic order and complete dot entry',recents:'canonical workspace and actual member',motion:'local spatial highlight',layout:'full responsive rows',records:'primary and complete original'});await context.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log(JSON.stringify({status:'passed',checks},null,2));
}finally{await browser.close();}
