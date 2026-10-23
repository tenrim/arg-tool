// Regression for removing the server scanner while retaining local image tools.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.json':'application/json','.wasm':'application/wasm'};
try{for(const [width,motion]of [[1440,'no-preference'],[390,'reduce']]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:motion}),external=[],posts=[],errors=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='arg.test'){external.push(u.href);return route.abort();}if(route.request().method==='POST')posts.push(u.pathname);try{await route.fulfill({body:await readFile(resolve('public','.'+u.pathname)),contentType:mime[extname(u.pathname)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'Not found'});}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://arg.test/index.html#external-media');
 const card=page.locator('#panel-external-media [data-external-site=E29]');await card.waitFor({state:'visible'});assert.match(await card.innerText(),/ExifTool.*strings.*binwalk.*foremost.*zsteg.*steghide.*outguess/s);
 const link=card.getByRole('link',{name:'前往 AperiSolve · 在线图片隐写分析（在新窗口打开）'});assert.equal(await link.getAttribute('href'),'https://www.aperisolve.com/zh/');assert.equal(await link.getAttribute('target'),'_blank');assert.match(await link.getAttribute('rel'),/noopener/);await link.focus();assert.equal(await link.evaluate(n=>n===document.activeElement),true);
 assert.equal(await page.locator('#image-scan,#image-scan-run,#image-scan-password').count(),0);
 assert.equal(await page.locator('#panel-external-media input[type=file],#panel-external-media .tool-provenance').count(),0);
 await page.evaluate(()=>{location.hash='image?task=native%3Aimage-steg';});await page.locator('#lsb-run').waitFor({state:'visible'});
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=8;c.height=8;c.getContext('2d').fillRect(0,0,8,8);return c.toDataURL().split(',')[1];});
 await page.locator('#image-input').setInputFiles({name:'local.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await page.locator('#lsb-run:enabled').waitFor();await page.locator('#lsb-run').click();await page.waitForFunction(()=>document.querySelector('#image-status').textContent.includes('提取完成'));assert.match(await page.locator('#image-output').inputValue(),/提取 8 个完整字节/);
 const footer=page.locator('#panel-image>.tool-provenance');assert.match(await footer.innerText(),/StegOnline/);assert.doesNotMatch(await footer.innerText(),/完整扫描/);assert.equal(await footer.evaluate(n=>n===n.parentElement.lastElementChild),true);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual({posts,external,errors},{posts:[],external:[],errors:[]});await context.close();
}console.log('PASS retired scan: detailed external introduction, safe keyboard links, real local LSB extraction, no uploads, provenance, PC/mobile and reduced motion.');}finally{await browser.close();}
