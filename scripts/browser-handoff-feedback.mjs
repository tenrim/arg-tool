import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {deflateSync} from 'node:zlib';
import {chooseOperation} from './browser-navigation.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
function chunk(type,data){const body=Buffer.concat([Buffer.from(type),data]),out=Buffer.alloc(body.length+8);let crc=0xffffffff;for(const byte of body){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}out.writeUInt32BE(data.length);body.copy(out,4);out.writeUInt32BE((crc^0xffffffff)>>>0,out.length-4);return out;}
const header=Buffer.alloc(13);header.writeUInt32BE(1);header.writeUInt32BE(1,4);header[8]=8;header[9]=6;
const imageWithZip=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(Buffer.from([0,0,0,0,255]))),chunk('IEND',Buffer.alloc(0)),Buffer.from('504b0506000000000000000000000000000000000000','hex')]);
try{
 for(const [width,motion,prefix]of [[1440,'no-preference',''],[390,'reduce','/tools']]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:motion}),posts=[],errors=[];let failure=true;
  await context.route('**/*',async route=>{
   const u=new URL(route.request().url());assert.equal(u.hostname,'arg.test');if(u.pathname.endsWith('/deployment.js'))return route.fulfill({body:"export const feedbackEndpoint='./api/feedback';",contentType:'text/javascript'});
   if(u.pathname===prefix+'/api/feedback'){const report=route.request().postDataJSON();posts.push(report);return route.fulfill({status:failure?503:200,contentType:'application/json',body:JSON.stringify(failure?{message:'测试邮件服务不可用'}:{accepted:true,id:report.id})});}
   const path=(u.pathname.slice(prefix.length)||'/').replace(/^\/$/,'/index.html');
   try{await route.fulfill({body:await readFile(resolve('public','.'+(path==='/'?'/index.html':path))),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.woff2':'font/woff2'})[extname(path)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'Not found'});}
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(`https://arg.test${prefix}/#encoding`);
  await page.waitForSelector('#ct-encoding .ct-run:enabled');
  await chooseOperation(page,'To Base64');const task=page.locator('#ct-encoding');await task.locator('.ct-input').fill('PEK');await task.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));
  assert.equal(await task.locator('[data-continue-result]').textContent(),'用其他工具处理');assert.equal(await page.locator('.ct-chain,#analysis-chef,#code-chef').count(),0);
  await task.locator('[data-continue-result]').click();const dialog=page.locator('#handoff-dialog');await dialog.locator('[data-handoff-target="From Base64"]').waitFor();
  assert.match(await dialog.locator('[data-handoff-target]').first().textContent(),/Base64/);
  assert.equal(await dialog.locator('[data-handoff-section="recommended"] [data-handoff-category="codec"] [data-handoff-group="encoding"] [data-handoff-target="From Base64"]').count(),1);
  assert.equal(await dialog.locator('select:not([hidden])').count(),0,'no flat tool dropdown');
  const all=dialog.locator('[data-handoff-section="all"]');assert.equal(await all.locator('[data-handoff-target]').count(),0,'groups expand on demand');
  await all.locator('[data-handoff-category="codec"]>summary').focus();await page.keyboard.press('Enter');await all.locator('[data-handoff-group="encoding"]>summary').click();await all.locator('[data-handoff-target="From Base64"]').waitFor({state:'visible'});
  await dialog.locator('#handoff-search').fill('AES');assert.equal(await dialog.locator('[data-handoff-section="recommended"]').isVisible(),false);assert.equal(await all.locator('[data-handoff-target="AES Decrypt"]').isVisible(),true);assert.equal(await all.locator('[data-handoff-target="From Base64"]').count(),0);await dialog.locator('#handoff-search').fill('');
  if(process.env.HANDOFF_SCREENSHOT&&width===1440)await dialog.screenshot({path:process.env.HANDOFF_SCREENSHOT});
  await dialog.locator('[data-handoff-target="From Base64"]').click();await dialog.getByRole('button',{name:'替换并继续'}).click();await page.waitForFunction(()=>!document.getElementById('handoff-dialog').open);
  assert.equal(await task.locator('.ct-source').inputValue(),'result');assert.equal(await task.locator('.ct-output').count(),0);
  assert.equal(await task.locator('.ct-previous-text').inputValue(),'UEVL');assert.equal(await task.locator('.ct-previous-text').isVisible(),true);assert.equal(await task.locator('.ct-previous-text').evaluate(n=>n.readOnly),true);
  await task.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));assert.equal(await task.locator('.ct-output').inputValue(),'PEK');
  await task.locator('[data-continue-result]').click();await dialog.locator('[data-handoff-target]').first().waitFor();await page.evaluate(()=>{const n=document.querySelector('#ct-encoding .ct-input');n.value='new input';n.dispatchEvent(new Event('input'));});await dialog.locator('[data-handoff-target]').first().click();assert.match(await dialog.locator('#handoff-status').textContent(),/失效/);await page.keyboard.press('Escape');
  // Decode a real PNG with trailing ZIP, hand off to image analysis, then take
  // the original file back to hex. Re-encoding the canvas would lose the ZIP.
  await chooseOperation(page,'From Base64');await task.locator('.ct-source').selectOption('text');await task.locator('.ct-input').fill(imageWithZip.toString('base64'));await task.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));
  await task.locator('[data-continue-result]').click();await dialog.locator('[data-handoff-target="native:image"]').click();await page.waitForFunction(()=>!document.getElementById('handoff-dialog').open);assert.match(await page.locator('#image-status').textContent(),/图片已载入/);
  await page.locator('#image-view-continue').click();await dialog.locator('#handoff-search').fill('To Hex');await dialog.locator('[data-handoff-section="all"] [data-handoff-target="To Hex"]').click();if(await dialog.getByRole('button',{name:'替换并继续'}).isVisible())await dialog.getByRole('button',{name:'替换并继续'}).click();await page.waitForFunction(()=>!document.getElementById('handoff-dialog').open);
  assert.equal(await task.locator('.ct-source-preview img').isVisible(),true);assert.equal(await task.locator('.ct-source-preview img').getAttribute('alt'),'上一步结果图片预览');
  await task.locator('.ct-source-preview img').evaluate(img=>{window.retiredInputPreview=img;const revoke=URL.revokeObjectURL;window.revokedPreviewURLs=[];URL.revokeObjectURL=url=>{window.revokedPreviewURLs.push(url);revoke(url);};});
  await task.locator('.ct-source').selectOption('text');assert.equal(await page.evaluate(()=>window.revokedPreviewURLs.includes(window.retiredInputPreview.src)),true);await task.locator('.ct-source').selectOption('result');
  await page.evaluate(()=>window.retiredInputPreview.dispatchEvent(new Event('error')));assert.equal(await task.locator('.ct-source-preview img').count(),1);assert.equal(await task.locator('.ct-previous-hex').count(),0,'old preview failure cannot replace the current image');
  await task.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));assert.equal((await task.locator('.ct-output').inputValue()).replace(/\s/g,'').toLowerCase(),imageWithZip.toString('hex'));
  await task.locator('.ct-source').selectOption('text');assert.equal(await task.locator('.ct-source-preview').textContent(),'');assert.equal(await task.locator('.ct-source-preview img').count(),0);
  await chooseOperation(page,'From Hex');await task.locator('.ct-input').fill('00 ff 80 0d 0a');await task.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));
  await task.locator('[data-continue-result]').click();await dialog.locator('[data-handoff-target="To Hex"]').click();await dialog.getByRole('button',{name:'替换并继续'}).click();await page.waitForFunction(()=>!document.getElementById('handoff-dialog').open);assert.match(await task.locator('.ct-previous-hex').inputValue(),/00 ff 80 0d 0a/);await task.locator('.ct-run').click();await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status').textContent.includes('处理完成'));assert.equal((await task.locator('.ct-output').inputValue()).replace(/\s/g,''),'00ff800d0a');
  // Open the global entry even when it lives in the mobile native drawer.
  await page.evaluate(()=>document.getElementById('report-problem').click());const report=page.locator('#report-dialog');await report.locator('#report-description').fill('点击按钮之后没有显示结果');
  await report.locator('#report-files').setInputFiles({name:'sample.txt',mimeType:'text/plain',buffer:Buffer.from('USER_SELECTED_ATTACHMENT')});await page.waitForFunction(()=>!document.getElementById('report-send').disabled);
  await report.locator('#report-send').click();await page.waitForFunction(()=>document.getElementById('report-status').textContent.includes('不可用'));assert.equal(await report.locator('#report-description').inputValue(),'点击按钮之后没有显示结果');
  await page.keyboard.press('Escape');await page.evaluate(()=>document.getElementById('report-problem').click());
  failure=false;await report.locator('#report-send').click();await page.waitForFunction(()=>document.getElementById('report-status').textContent.includes('邮件服务器已接收'));assert.equal(posts.length,2);assert.deepEqual(posts[0],posts[1],'closing and reopening preserves the exact retry payload');assert.equal(posts[1].attachments[0].data,Buffer.from('USER_SELECTED_ATTACHMENT').toString('base64'));
  assert(!JSON.stringify(posts[1].diagnostics).includes('new input'));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await report.getByRole('button',{name:'关闭',exact:true}).focus();await page.keyboard.press('Enter');assert.equal(await report.evaluate(n=>n.open),false);
  await page.evaluate(()=>{const s=document.querySelector('#ct-encoding .ct-status');s.classList.add('error');s.textContent='测试错误';});await page.locator('#ct-encoding [data-report-error]').click();assert.equal(await report.evaluate(n=>n.open),true);await page.keyboard.press('Escape');
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS: real Base64 handoff, recommendations, overwrite, stale-result rejection, no auto-run, report privacy/attachments/failure/retry, PC/mobile, reduced motion, keyboard and subdirectory.');
}finally{await browser.close();}
