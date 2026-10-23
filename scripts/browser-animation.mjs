import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {gif,png} from '../tests/fixtures/animation.mjs';
import {chooseNativeTask} from './browser-navigation.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm'};
try{
 for(const [width,reducedMotion,blobWorker] of [[1440,'no-preference',false],[390,'reduce',true]]){
  const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion}),errors=[],external=[];let failEngine=false;
  await ctx.route('**/*',async r=>{
   const u=new URL(r.request().url());if(['blob:','data:'].includes(u.protocol))return r.continue();
   if(u.hostname!=='animation.test'){external.push(u.href);return r.abort();}
   const file=u.pathname.replace(/^\/toolbox\//,'');
   if(failEngine&&file==='vendor/animation/engines.js')return r.fulfill({status:503,body:'test failure'});
   try{return r.fulfill({body:await readFile(resolve('public',file||'index.html')),contentType:mime[extname(file)]||'application/octet-stream'});}catch{return r.fulfill({status:404,body:file});}
  });
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
  if(blobWorker)await p.addInitScript(()=>{
   const Original=window.Worker;
   window.Worker=class extends Original{constructor(url,options){if(String(url).includes('/animation/worker.js')){const b=URL.createObjectURL(new Blob([`import ${JSON.stringify(String(url))};`],{type:'text/javascript'}));super(b,options);this.addEventListener('message',()=>URL.revokeObjectURL(b),{once:true});}else super(url,options);}};
  });
  await p.goto('https://animation.test/toolbox/index.html#video?task=native:video-animation');
  await p.locator('#animation-analyze').waitFor({state:'visible'});
  assert.equal(await p.locator('#video-run').isVisible(),false);
  assert.equal(await p.locator('#video-file').count(),1);
  await p.locator('#video-file').setInputFiles({name:'all35.gif',mimeType:'image/gif',buffer:gif()});
  await p.locator('#animation-analyze').click();
  await p.locator('#animation-result-notebook:enabled').waitFor();
  assert.match(await p.locator('#animation-summary').textContent(),/35/);
  const sourceText=await p.locator('#panel-video > .tool-provenance').textContent();assert.match(sourceText,/gifuct/);assert.match(sourceText,/UPNG/);assert.doesNotMatch(sourceText,/FFmpeg/);
  await p.evaluate(async()=>{
   const {connectNotebook}=await import('./handoff/button.js');
   connectNotebook(request=>{window.animationTicket=request;window.animationFiles=request.read().files;});
  });
  await p.locator('#animation-result-notebook').click();
  const recorded=await p.evaluate(async()=>({names:animationFiles.map(f=>f.name),meta:JSON.parse(await animationFiles[1].text())}));
  assert.equal(recorded.meta.animation.frames.length,35);assert.equal(recorded.names[0],'frame-1-composite.png');
  await p.locator('#animation-frame').fill('35');
  assert.equal(await p.evaluate(()=>animationTicket.isCurrent()),false);
  await p.waitForFunction(()=>document.querySelector('#animation-detail')?.textContent.includes('35 / 35'));
  await p.locator('#animation-view').selectOption('raw');
  await p.locator('#animation-result-notebook:enabled').waitFor();
  const download=p.waitForEvent('download');await p.locator('#animation-all').click();assert.equal((await download).suggestedFilename(),'animation-all.zip');
  await p.locator('#animation-analyze:enabled').waitFor();
  const sprite=p.waitForEvent('download');await p.locator('#animation-sheet').click();assert.equal((await sprite).suggestedFilename(),'sprite-sheet.png');
  await p.locator('#animation-slice:enabled').waitFor();
  await p.locator('#animation-tile-width').fill('1');await p.locator('#animation-tile-height').fill('1');await p.locator('#animation-slice').click();
  await p.waitForFunction(()=>document.querySelector('#animation-summary').textContent.includes('SPRITE'));
  await p.locator('#animation-result-notebook:enabled').waitFor();await p.locator('#animation-result-notebook').click();
  const sliced=await p.evaluate(async()=>JSON.parse(await animationFiles[1].text()));
  assert.equal(sliced.animation.frames.length,2);assert.equal(sliced.animation.width,1);
  await p.locator('#animation-restore').click();await p.waitForFunction(()=>document.querySelector('#animation-summary').textContent.includes('35'));
  await p.locator('#animation-result-notebook:enabled').waitFor();
  await chooseNativeTask(p,'native:video');
  assert.equal(await p.locator('#animation-workspace').isVisible(),false);assert.equal(await p.locator('#video-run').isVisible(),true);
  assert.match(await p.locator('#panel-video > .tool-provenance').textContent(),/ffmpeg/i);
  assert.equal(await p.locator('#video-file').evaluate(n=>n.files[0].name),'all35.gif');
  await chooseNativeTask(p,'native:video-animation');
  assert.equal(await p.locator('#animation-result-notebook').isDisabled(),true);
  await p.locator('#video-file').setInputFiles({name:'poster.apng',mimeType:'image/apng',buffer:png({poster:true,frames:[{width:1,rows:[0,0,0,255,255],x:1,dispose:2},{width:1,rows:[0,0,255,0,255]}]})});
  await p.locator('#animation-analyze').click();await p.locator('#animation-result-notebook:enabled').waitFor();
  assert.match(await p.locator('#animation-summary').textContent(),/不计入动画/);
  await p.locator('#animation-play').click();await p.locator('#animation-play').press('Enter');
  assert.equal(await p.locator('#animation-play').textContent(),'播放');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'mobile does not overflow');
  if(process.env.ANIMATION_SCREENSHOTS){await mkdir(process.env.ANIMATION_SCREENSHOTS,{recursive:true});await p.screenshot({path:resolve(process.env.ANIMATION_SCREENSHOTS,`animation-${width}.png`),fullPage:true});}
  await p.locator('#animation-stop').click();assert.equal(await p.locator('#animation-result-notebook').isDisabled(),true);
  failEngine=true;await p.locator('#animation-analyze').click();await p.waitForFunction(()=>document.querySelector('#animation-status').textContent.includes('加载失败'));
  failEngine=false;await p.locator('#animation-analyze').click();await p.locator('#animation-result-notebook:enabled').waitFor();
  await p.locator('#animation-analyze').click();await p.locator('#animation-stop').click();assert.equal(await p.locator('#animation-result-notebook').isDisabled(),true);
  await p.locator('#video-file').setInputFiles({name:'sixteen.png',mimeType:'image/png',buffer:png({width:1,depth:16,rows:[0,0x12,0x34,0x56,0x78,0x9a,0xbc,0xff,0xff]})});
  await p.locator('#animation-analyze').click();await p.locator('#animation-result-notebook:enabled').waitFor();
  await p.locator('#animation-result-notebook').click();
  assert.equal(await p.evaluate(async()=>new Uint8Array(await animationFiles[0].arrayBuffer())[24]),16,'raw PNG recording preserves source bit depth');
  await p.locator('#video-file').setInputFiles({name:'bad.png',mimeType:'image/png',buffer:Buffer.from('broken')});
  await p.locator('#animation-analyze').click();await p.waitForFunction(()=>document.querySelector('#animation-status').textContent.includes('不是完整'));
  assert.equal(await p.locator('#animation-result-notebook').isDisabled(),true);
  assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
  console.log(`PASS animation ${width}px ${reducedMotion}, ${blobWorker?'blob':'normal'} module worker, subdirectory, full frames, source footers, notes, stale leases, exports, cancel and failure/retry.`);
  await ctx.close();
 }
}finally{await browser.close();}
