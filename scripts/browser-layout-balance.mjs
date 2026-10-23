import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
import {chooseOperation} from './browser-navigation.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
const shots=resolve(tmpdir(),'arg-layout-balance');await mkdir(shots,{recursive:true});
try{for(const [width,motion] of [[1600,'no-preference'],[1440,'reduce'],[390,'reduce']]){
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:motion});const errors=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='arg.test')throw Error('Unexpected external request '+u.href);try{const path=resolve('public','.'+(u.pathname==='/'?'/index.html':u.pathname));await route.fulfill({body:await readFile(path),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.wasm':'application/wasm','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'missing'});}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const go=async (route,id)=>{await page.evaluate(r=>{location.hash=r;},route);await page.locator('#panel-'+id).waitFor({state:'visible'});};
 const aligned=async selector=>{const boxes=await page.locator(selector).evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length).map(n=>{const r=n.getBoundingClientRect();return{top:r.top,bottom:r.bottom,x:r.x};}));assert.ok(boxes.length>=2,selector);if(width>1000)assert.ok(Math.abs(boxes[0].bottom-boxes[1].bottom)<2,selector+' unequal bottom edges '+JSON.stringify(boxes));};
 const fits=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
 await page.goto('https://arg.test/#basics?task=native%3Aascii');await page.locator('#basics-input').waitFor();
 // 顶栏和正文共用宽屏边界；页脚不再把导航、品牌、说明分散成三栏。
 if(width===1600){
  await page.setViewportSize({width:2560,height:1440});
  const shell=await page.evaluate(()=>{const a=document.querySelector('.header-inner').getBoundingClientRect(),b=document.querySelector('main').getBoundingClientRect();return {left:Math.abs(a.left-b.left),right:Math.abs(a.right-b.right)};});
  assert.ok(shell.left<2&&shell.right<2,'超宽屏顶栏与正文边界一致');
  await page.setViewportSize({width,height:1000});
 }
 const footer=await page.locator('.main-footer').evaluate(n=>{const rect=s=>n.querySelector(s).getBoundingClientRect();const brand=rect(':scope>span'),links=rect('.footer-links'),privacy=rect('.footer-privacy');return {brandTop:brand.top,brandBottom:brand.bottom,linksTop:links.top,linksBottom:links.bottom,privacyTop:privacy.top,aligned:Math.abs(brand.left-privacy.left)<2,text:n.textContent};});
 assert.ok(footer.aligned&&footer.privacyTop>=Math.max(footer.brandBottom,footer.linksBottom),'联网说明位于页脚信息行下方且左对齐');
 assert.match(footer.text,/在线查询与问题反馈会发送你主动提交的信息/);
 const summary=page.locator('.footer-privacy summary');await summary.click();assert.equal(await summary.evaluate(n=>n.parentElement.open),true);await summary.click();
 const gap=await page.evaluate(()=>{const a=document.querySelector('#panel-basics .capability-topic-settings').getBoundingClientRect(),b=document.querySelector('#panel-basics .ui-conversion').getBoundingClientRect();return b.top-a.bottom;});assert.ok(gap>=12,'topic selector and working form need separation');
 await aligned('#panel-basics .ui-conversion>[data-ui=split-view]>[data-ui=card]');await fits();
 await page.locator('#basics-input').fill('ABC');await page.locator('#basics-run').click();await page.waitForFunction(()=>document.querySelector('#basics-output').value==='65 66 67');
 await page.screenshot({path:resolve(shots,width+'-conversion.png'),fullPage:true});
 await go('encoding','encoding');await chooseOperation(page,'To Base32');
 const pair=page.locator('#ct-encoding .chef-editable-value');await pair.waitFor();
 if(width>1000){const positions=await pair.locator('select,input').evaluateAll(ns=>ns.map(n=>({x:n.getBoundingClientRect().x,y:n.getBoundingClientRect().y})));assert.ok(Math.abs(positions[0].y-positions[1].y)<2);assert.ok(positions[1].x>positions[0].x);}
 const custom=pair.locator('input'),preset=pair.locator('select');await custom.fill('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=');assert.equal(await preset.inputValue(),'');
 await page.locator('#ct-encoding .ct-input').fill('foo');await page.locator('#ct-encoding .ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));assert.match(await page.locator('#ct-encoding .ct-result textarea').inputValue(),/MZXW6/);
 await aligned('#ct-encoding .ui-conversion>[data-ui=split-view]>[data-ui=card]');await fits();
 await go('crypto','crypto');await chooseOperation(page,'ROT13');
 if(width>1000){
  const parameters=await page.locator('#ct-crypto').evaluate(n=>{const group=n.querySelector('[data-ui=check-group]').getBoundingClientRect(),number=n.querySelector('input[type=number]').getBoundingClientRect(),field=n.querySelector('.chef-check').getBoundingClientRect(),direction=n.querySelector('.ct-direction').getBoundingClientRect();const box=r=>({left:r.left,right:r.right,bottom:r.bottom,width:r.width});return {group:box(group),number:box(number),field:box(field),direction:box(direction)};});
  assert.ok(parameters.field.width<240&&parameters.direction.width<=520,'布尔选项和操作选择不拉伸铺满卡片');
  assert.ok(parameters.number.left>parameters.group.right&&Math.abs(parameters.number.bottom-parameters.group.bottom)<2,'空间足够时短参数与选项共用一行');
 }
 await fits();
 await go('symbols?task=native%3Amorse','symbols');await page.locator('#morse-dot').waitFor();await page.locator('#morse-dot').click();await page.locator('#morse-add').click();assert.equal(await page.locator('#symbols-output').inputValue(),'E');
 if(width>1000){const a=await page.locator('[data-native-section=morse]').boundingBox(),b=await page.locator('[data-native-section=symbols-result]').boundingBox();assert.ok(b.x>a.x+a.width,'morse input and result should share a row');}await fits();
 await go('tapcode?task=native%3Apolybius','tapcode');const grid=page.locator('#tapcode-grid');await grid.waitFor();const center=await grid.evaluate(n=>{const a=n.getBoundingClientRect(),b=n.parentElement.getBoundingClientRect();return Math.abs(a.x+a.width/2-b.x-b.width/2);});assert.ok(center<2,'center square');await grid.locator('button').first().click();assert.equal(await page.locator('#tapcode-input').inputValue(),'A');await fits();
 await go('sky','sky');await aligned('#panel-sky .ref-layout>.ref-card');await fits();
 await page.screenshot({path:resolve(shots,width+'-query.png'),fullPage:true});
 await go('home','home');await page.locator('.home-browser .capability-group').first().waitFor();
 await aligned('.home-collections>.home-collection');
 if(width>1000){const rows=await page.locator('.home-browser .capability-group').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return{t:r.top,b:r.bottom};}));for(const a of rows)for(const b of rows)if(Math.abs(a.t-b.t)<2)assert.ok(Math.abs(a.b-b.b)<2,'group row alignment');}
 await fits();await page.screenshot({path:resolve(shots,width+'-home.png'),fullPage:true});
 assert.deepEqual(errors,[]);await context.close();
}console.log('PASS layout balance: row alignment, editable presets, real ASCII/Base32/Morse/grid input, reference, desktop/mobile and motion.');}finally{await browser.close();}
