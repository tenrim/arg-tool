import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {wavEncode} from '../public/media.js';
import {chooseNativeTask} from './browser-navigation.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
try{
 const context=await browser.newContext({viewport:{width:1440,height:950}}),errors=[];
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname!=='arg.test'){errors.push('External '+url.href);return route.abort();}
  const path=resolve('public','.'+(url.pathname==='/'?'/index.html':url.pathname));
  try{await route.fulfill({body:await readFile(path),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.woff2':'font/woff2'})[extname(path)]||'application/octet-stream'});}catch{errors.push('Missing '+url.pathname);await route.abort();}
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('https://arg.test/#audio?task=native:audio-spectrum');
 const samples=Float32Array.from({length:16000},(_,i)=>i<8000?.2:.7);
 await page.locator('#audio-input').setInputFiles({name:'two-halves.wav',mimeType:'audio/wav',buffer:Buffer.from(wavEncode([samples],8000))});
 await page.waitForFunction(()=>!document.getElementById('audio-reverse').disabled);
 await page.locator('#audio-reverse').click();await page.locator('#audio-start').fill('0');await page.locator('#audio-end').fill('.25');
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#audio-export').click()]);
 const bytes=await readFile(await download.path());assert.ok(bytes.readInt16LE(44+500)/32767>.65,'reversed clip uses the final source quarter, not the beginning');
 await page.evaluate(()=>{
  window.originalWorker=window.Worker;
  window.Worker=class extends window.originalWorker{
   constructor(url,options){super(url,options);this.reviewAudio=String(url).endsWith('/audio-worker.js');this.reviewSSTV=String(url).includes('/sstv/worker/');}
   postMessage(data,...rest){if(this.reviewAudio){window.pendingAudio=true;return;}if(this.reviewSSTV){window.sstvSamples=[data.samples[1000],data.samples.at(-1001)];return;}return super.postMessage(data,...rest);}
  };
 });
 await page.locator('#audio-spectrum').click();await page.waitForFunction(()=>window.pendingAudio);
 await chooseNativeTask(page,'native:audio-music');await chooseNativeTask(page,'native:audio-spectrum');
 assert.equal(await page.locator('#audio-spectrum').isDisabled(),false,'cancelled analysis restores reusable controls');
 assert.equal(await page.locator('#audio-output').inputValue(),'');assert.equal(await page.locator('#audio-status').textContent(),'');
 await chooseNativeTask(page,'native:audio-sstv');await page.locator('#sstv-run').click();
 const snapshot=await page.evaluate(()=>window.sstvSamples);assert.ok(snapshot[0]>.65&&snapshot[1]<.25,'SSTV sees the same reversed PCM as other audio tools');
 await page.locator('#sstv-stop').click();await page.evaluate(()=>window.Worker=window.originalWorker);
 await chooseNativeTask(page,'native:file');await page.locator('#file-input').setInputFiles({name:'clue.txt',mimeType:'text/plain',buffer:Buffer.from('ARG review')});
 await page.waitForFunction(()=>!document.getElementById('file-hash').disabled);
 await page.locator('#file-hash').click();await page.waitForFunction(()=>document.getElementById('file-output').value.startsWith('SHA-256'));
 assert.match(await page.locator('#file-output').inputValue(),/^[\s\S]*[a-f0-9]{64}$/);
 await page.locator('#file-hex').click();assert.match(await page.locator('#file-output').inputValue(),/ARG review/);
 await page.locator('#hex-offset').fill('2');assert.equal(await page.locator('#file-output').inputValue(),'','changing dump offset clears the old visible result as well as its notebook lease');
 assert.equal(await page.locator('#file-status').textContent(),'');
 assert.deepEqual(errors,[]);
 console.log('PASS: preview-aligned WAV clip, shared reversed SSTV snapshot, cancelled audio controls, preserved upload, real SHA-256 and immediate dump invalidation.');
}finally{await browser.close();}
