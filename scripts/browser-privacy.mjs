import {chooseOperation} from './browser-navigation.mjs';
import {appPages} from './browser-host.mjs';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const context=await browser.newContext(),errors=[],external=[],writes=[];
 await context.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(req.method()!=='GET')writes.push(req.url());if(u.hostname!=='arg.test'){external.push(u.href);return route.abort();}const file=resolve('public','.'+(u.pathname==='/'?'/index.html':u.pathname));await route.fulfill({body:await readFile(file),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2'})[extname(file)]||'application/octet-stream'});});
 await context.addInitScript(()=>localStorage.setItem('arg.cyberchef.recipes.v1',JSON.stringify([null,42,{name:'broken'},{name:'有效配方',recipe:[]}])));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://arg.test/#cyberchef');await page.waitForSelector('#cyberchef-stage[data-ready=true]');
 assert.equal(await page.locator('#chef-saved option').count(),2);
 assert.match(await page.locator('.footer-privacy').textContent(),/不会将你的输入、文件或结果上传或保存在本站服务器/);
 await page.locator('.footer-privacy summary').click();assert.match(await page.locator('.footer-privacy p').textContent(),/HTTP、DNS/);
 // Delay actual browser file reads: old data must not run, and later edits win.
 await page.locator('#chef-file').setInputFiles({name:'old.txt',mimeType:'text/plain',buffer:Buffer.from('OLD')});await page.waitForFunction(()=>document.getElementById('chef-input').value==='OLD');
 await page.evaluate(()=>{const original=File.prototype.arrayBuffer;File.prototype.arrayBuffer=async function(){if(this.name==='slow.txt')await new Promise(r=>window.releaseFile=r);return original.call(this);};});
 await page.locator('#chef-file').setInputFiles({name:'slow.txt',mimeType:'text/plain',buffer:Buffer.from('LATE')});await page.waitForFunction(()=>!!window.releaseFile);assert.equal(await page.locator('#chef-run').isDisabled(),true);assert.equal(await page.locator('#chef-input').inputValue(),'');
 await page.locator('#chef-input').fill('NEW');await page.evaluate(()=>window.releaseFile());await page.evaluate(()=>new Promise(requestAnimationFrame));assert.equal(await page.locator('#chef-input').inputValue(),'NEW');assert.equal(await page.locator('#chef-run').isEnabled(),true);
 await page.locator('#chef-run').click();await page.waitForFunction(()=>document.getElementById('cyberchef-status').textContent.includes('处理完成'));assert.equal(await page.locator('#chef-output').inputValue(),'NEW');
 await page.evaluate(()=>{const original=File.prototype.text;File.prototype.text=async function(){if(this.name==='slow.json')await new Promise(r=>window.releaseRecipe=r);return original.call(this);};});
 await page.locator('#chef-import-recipe').setInputFiles({name:'slow.json',mimeType:'application/json',buffer:Buffer.from('[{"op":"To Base64","args":["A-Za-z0-9+/="]}]')});await page.waitForFunction(()=>!!window.releaseRecipe);
 await page.locator('#chef-clear-recipe').click();await page.evaluate(()=>window.releaseRecipe());await page.evaluate(()=>new Promise(requestAnimationFrame));assert.equal(await page.locator('#chef-recipe .chef-step').count(),0);
 // JPEG fixture generated locally; EXIF strip must preserve all other bytes.
 const jpeg=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=4;c.height=2;const x=c.getContext('2d');x.fillStyle='#eab143';x.fillRect(0,0,4,2);return Array.from(new Uint8Array(await(await new Promise(r=>c.toBlob(r,'image/jpeg'))).arrayBuffer()));});
 const exif=Buffer.from([255,225,0,22,69,120,105,102,0,0,73,73,42,0,8,0,0,0,0,0,0,0,0,0]),tagged=Buffer.concat([Buffer.from(jpeg.slice(0,2)),exif,Buffer.from(jpeg.slice(2))]);
 const exifResults=await page.evaluate(async({jpeg,tagged})=>{const {CyberChefClient}=await import('./cyberchef-client.js');const out=[];for(const value of [[],jpeg,tagged]){const client=new CyberChefClient();try{out.push(Array.from((await client.bake(new Uint8Array(value).buffer,[{op:'Remove EXIF',args:[]}])).bytes));}finally{client.close();}}const client=new CyberChefClient();try{const result=await client.bake(new Uint8Array(jpeg).buffer,[{op:'Remove EXIF',args:[]},{op:'To Hex',args:['Space',0]}]);out.push(new TextDecoder().decode(result.bytes));try{await client.bake('not a JPEG',[{op:'Remove EXIF',args:[]}]);out.push('unexpected success');}catch{out.push('invalid JPEG rejected');}}finally{client.close();}return out;},{jpeg,tagged:[...tagged]});
 assert.deepEqual(exifResults[0],[]);assert.deepEqual(exifResults[1],jpeg);assert.deepEqual(exifResults[2],jpeg);assert.equal(exifResults[3],jpeg.map(v=>v.toString(16).padStart(2,'0')).join(' '));assert.equal(exifResults[4],'invalid JPEG rejected');
 await page.evaluate(()=>location.hash='image');await page.waitForSelector('#panel-image:not([hidden])');await page.locator('#image-input').setInputFiles({name:'tagged.jpg',mimeType:'image/jpeg',buffer:tagged});await page.waitForFunction(()=>document.getElementById('image-status').textContent==='图片已载入');await chooseOperation(page,'Remove EXIF');await page.locator('#ct-image .ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-image .ct-status').textContent.includes('处理完成'));const downloaded=page.waitForEvent('download');await page.locator('#ct-image .ct-download').click();assert.deepEqual(await readFile(await(await downloaded).path()),Buffer.from(jpeg));
 // Legitimate control flow and disabled steps still finish successfully.
 const flow=await page.evaluate(async()=>{const {CyberChefClient}=await import('./cyberchef-client.js');const client=new CyberChefClient();try{const configs=[[{op:'Fork',args:['\\n','\\n',false]},{op:'To Base64',args:['A-Za-z0-9+/=']},{op:'Merge',args:[true]}],[{op:'Return',args:[]},{op:'To Base64',args:['A-Za-z0-9+/=']}],[{op:'To Base64',args:['A-Za-z0-9+/='],disabled:true}]],values=[];for(const recipe of configs)values.push(new TextDecoder().decode((await client.bake('A\nB',recipe)).bytes));return values;}finally{client.close();}});
 assert.deepEqual(flow,['QQ==\nQg==','A\nB','A\nB']);
 // Real engine limits, including UTF-8 byte count and expansion above output cap.
 const limits=await page.evaluate(async()=>{const {CyberChefClient}=await import('./cyberchef-client.js');const client=new CyberChefClient(),messages=[];try{try{await client.bake('汉'.repeat(12*1024*1024),[]);}catch(e){messages.push(e.message);}const ok=await client.bake('恢复',[]);messages.push(new TextDecoder().decode(ok.bytes));try{await client.bake(new Uint8Array(17*1024*1024).buffer,[{op:'To Hex',args:['None',0]}]);}catch(e){messages.push(e.message);}messages.push(client.closed);return messages;}finally{client.close();}});
 assert.match(limits[0],/输入最多 32 MB/);assert.equal(limits[1],'恢复');assert.match(limits[2],/结果超过 32 MB/);assert.equal(limits[3],true);
 for(const width of [320,390,768,1365]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w+1,width),`footer at ${width}`);}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=391));
 assert.equal(appPages(context).length,1);assert.deepEqual({errors,external,writes},{errors:[],external:[],writes:[]});console.log('PASS: local privacy explanation, no unsolicited network/writes, mobile footer, corrupt saved recipes, delayed file/import races, lossless EXIF removal and chain continuation, UTF-8 input and expanded output limits with real CyberChef.');
}finally{await browser.close();}
