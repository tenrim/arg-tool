import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';

// The production application, actual pinned engines and original fixture are
// served unchanged. Test gates delay real async results, never invent answers.
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm','.png':'image/png'};
const artifacts=resolve(tmpdir(),'mist-family-workspaces');await mkdir(artifacts,{recursive:true});
const matrix=JSON.parse(await readFile('tests/fixtures/round-one-qr.json','utf8'));
let active;

async function production(width,motion){
 const prefix=width<1100?'/toolbox/':'/',errors=[],missing=[],external=[];
 let heldRequest;
 const context=await browser.newContext({viewport:{width,height:950},hasTouch:width<1100,reducedMotion:motion});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(['blob:','data:'].includes(url.protocol))return route.continue();
  if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
  try{assert.ok(url.pathname.startsWith(prefix));const path=resolve('public',url.pathname.slice(prefix.length)||'index.html');
   if(heldRequest?.matches(url)){const gate=heldRequest;heldRequest=null;gate.started();await gate.wait;}
   await route.fulfill({body:await readFile(path),contentType:mime[extname(path)]||'application/octet-stream'});}
  catch{missing.push(url.pathname);await route.abort();}
 });
 const page=await context.newPage();active=page;page.setDefaultTimeout(20000);
 page.on('pageerror',error=>errors.push(error.message));await page.goto('https://arg.test'+prefix+'#home');await page.locator('#panel-home [data-capability]').first().waitFor();
 const go=async(id,{op,variant}={})=>{
  await page.evaluate(({id,op,variant})=>document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id,op,preferredVariant:variant}})),{id,op,variant});
  await page.waitForFunction(({id,op,variant})=>{
   const panel=[...document.querySelectorAll('.panel')].find(node=>!node.hidden),query=new URLSearchParams(location.hash.split('?')[1]);
   return panel?.querySelector('[data-current-capability]')?.dataset.currentCapability===id&&(!op||panel.querySelector('.ct-tool')?.dataset.operation===op)&&(!variant||query.get('view')===variant);
  },{id,op,variant});
 };
 return{page,context,go,width,motion,holdRequest(matches){let started,release;const waiting=new Promise(resolve=>started=resolve),wait=new Promise(resolve=>release=resolve);heldRequest={matches,started,wait};return{started:waiting,release};},clean(){assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});assert.equal(context.pages().length,1);}};
}
async function run(task){
 await task.locator('.ct-run').click();
 await task.locator('.ct-status').filter({hasText:/处理完成|操作执行失败|错误|未能/}).waitFor({timeout:45000});
 assert.match(await task.locator('.ct-status').textContent(),/处理完成/);
 return await task.locator('.ct-output').count()?task.locator('.ct-output').inputValue():null;
}
async function download(page,button){const pending=page.waitForEvent('download');await button.click();return readFile(await(await pending).path());}
async function footer(page,urls){
 const source=page.locator('#panel-image>.tool-provenance');await source.waitFor({state:'visible'});
 assert.deepEqual(new Set(await source.locator('a').evaluateAll(nodes=>nodes.map(node=>node.href))),new Set(urls));
 assert.equal(await source.evaluate(node=>node===node.parentElement.lastElementChild),true,'the actual selected implementation owns the final visible footer');
 assert.ok(await source.locator('[data-license]').count());
}

async function byteFamilies({page,go}){
 await go('topic:base-family',{op:'To Base32'});const task=page.locator('#ct-encoding'),select=task.locator('.ct-direction'),input=task.locator('.ct-input');
 assert.equal(await select.locator('option').count(),15);assert.equal(await select.getAttribute('aria-label'),'操作');
 await input.fill('ARG');await input.evaluate(node=>window.__familyInput=node);
 for(const [op,expected]of [['To Base32','IFJEO==='],['To Base64','QVJH'],['To Base85','5uL2']]){
  await select.selectOption(op);await task.locator('.ct-source').selectOption('text');await input.fill('ARG');
  const output=await run(task);assert.equal(output,expected,op+' actual known-answer vector');
  await task.locator('.ct-use').click();await select.selectOption(op.replace('To ','From '));await run(task);
  assert.deepEqual(await download(page,task.locator('.ct-download')),Buffer.from('ARG'),'actual byte roundtrip '+op);
 }
 await select.selectOption('To Base85');await task.locator('[data-arg="1"] input').check();
 await select.selectOption('To Base64');assert.equal(await task.locator('[data-arg="1"] input').count(),0,'non-inverse member does not acquire unrelated arguments');
 await select.selectOption('To Base85');assert.equal(await task.locator('[data-arg="1"] input').isChecked(),true,'each encoder retains its own argument draft');
 await task.locator('[data-arg="1"] input').uncheck();
 const raw=Buffer.from([0,255,128,13,10,65,226,152,131]);
 for(const mode of ['hex','file']){
  await select.selectOption('To Base64');await task.locator('.ct-source').selectOption(mode);
  if(mode==='hex')await input.fill(raw.toString('hex'));else await task.locator('.ct-file-input').setInputFiles({name:'clue.bin',mimeType:'application/octet-stream',buffer:raw});
  assert.equal(await run(task),raw.toString('base64'));
  await task.locator('.ct-use').click();await select.selectOption('From Base64');await run(task);
  assert.deepEqual(await download(page,task.locator('.ct-download')),raw,'binary NUL/invalid UTF-8/CRLF bytes survive '+mode+' and explicit adoption');
 }
 assert.equal(await input.evaluate(node=>node===window.__familyInput),true);
 await go('topic:byte-numerals',{op:'To Binary'});assert.equal(await select.locator('option').count(),19);
 await task.locator('.ct-source').selectOption('text');await input.fill('A');
 for(const [op,expected]of [['To Binary','01000001'],['To Decimal','65'],['To Hex','41']]){
  await select.selectOption(op);assert.equal(await input.inputValue(),'A');assert.equal(await run(task),expected,'the numeric text denotes bytes, not integer arithmetic: '+op);
 }
 await select.selectOption('To Binary');await task.locator('[data-arg="1"] input').fill('7');
 await select.selectOption('To Decimal');await select.selectOption('To Binary');assert.equal(await task.locator('[data-arg="1"] input').inputValue(),'7');
 await task.locator('[data-arg="1"] input').fill('8');await run(task);await select.selectOption('From Binary');
 assert.equal(await task.locator('.ct-output').count(),0,'choosing another member cannot adopt its output');assert.equal(await input.inputValue(),'A');
}

async function nativeFamilies({page,go}){
 await go('topic:character-codes',{variant:'native:ascii'});const chooser=page.locator('#panel-basics .capability-topic-settings select');
 assert.equal(await chooser.locator('option').count(),3);await page.locator('#basics-input').fill('A');await page.locator('#basics-run').click();
 await page.waitForFunction(()=>document.getElementById('basics-output').value==='65');await page.locator('#basics-input').evaluate(node=>window.__characterInput=node);
 await chooser.selectOption('native:utf8');await page.waitForFunction(()=>document.getElementById('basics-family').value==='characters');
 assert.equal(await page.locator('#basics-format').inputValue(),'hex');assert.equal(await page.locator('#basics-input').inputValue(),'A');
 assert.equal(await page.locator('#basics-output').inputValue(),'');await page.locator('#basics-input').fill('雪');await page.locator('#basics-run').click();
 await page.waitForFunction(()=>document.getElementById('basics-output').value.toUpperCase()==='E9 9B AA');
 assert.equal(await page.locator('#basics-input').evaluate(node=>node===window.__characterInput),true);
 // An old operation alias resolves through the unified native owner, rather
 // than silently opening a second Chef renderer for the same function.
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('arg:openoperation',{detail:{op:'To HTML Entity'}})));
 await page.waitForFunction(()=>document.querySelector('#panel-basics [data-current-capability]')?.dataset.currentCapability==='topic:text-escapes'&&document.getElementById('basics-format').value==='html');
 assert.equal(await chooser.locator('option').count(),4);assert.equal(await page.locator('#basics-direction').inputValue(),'encode');
 await page.locator('#basics-input').fill('<ARG>&');await page.locator('#basics-run').click();
 await page.waitForFunction(()=>/&#x[0-9a-f]+;/i.test(document.getElementById('basics-output').value));
 const encoded=await page.locator('#basics-output').inputValue();
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('arg:openoperation',{detail:{op:'From HTML Entity'}})));
 await page.waitForFunction(()=>document.getElementById('basics-direction').value==='decode');
 assert.equal(await page.locator('#basics-input').inputValue(),'<ARG>&','alias direction selection preserves source instead of auto-adopting output');
 await page.locator('#basics-input').fill(encoded);await page.locator('#basics-run').click();await page.waitForFunction(()=>document.getElementById('basics-output').value==='<ARG>&');
}

async function qrFamily(scope,full){
 const {page,go}=scope;
 await go('native:image');
 const baselineSources=await page.locator('#panel-image>.tool-provenance a').evaluateAll(nodes=>nodes.map(node=>node.href));
 await go('topic:qr',{variant:'native:image-barcode'});const chooser=page.locator('#panel-image .capability-topic-settings select'),task=page.locator('#ct-image');
 assert.equal(await chooser.locator('option').count(),5);assert.equal(await page.locator('#barcode-read').isVisible(),true);
 const png=Buffer.from(await page.evaluate(matrix=>{const canvas=document.createElement('canvas'),n=matrix.length+8;canvas.width=canvas.height=n*8;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='black';matrix.forEach((row,y)=>row.forEach((cell,x)=>{if(cell)ctx.fillRect((x+4)*8,(y+4)*8,8,8);}));return canvas.toDataURL().split(',')[1];},matrix),'base64');
 await page.locator('#image-input').setInputFiles({name:'qr-fixture.png',mimeType:'image/png',buffer:png});
 await page.waitForFunction(()=>document.getElementById('image-status').textContent.includes('载入'));
 if(full){
  // Hold the actual first WASM request after readBarcodes has already captured
  // its real input. Leaving this member invalidates its result lease while
  // that real read remains pending; releasing it must not publish old text.
  const gate=scope.holdRequest(url=>url.pathname.includes('/vendor/hunt/zxing/')&&url.pathname.endsWith('.wasm'));
  await page.locator('#barcode-read').click();await gate.started;
  await chooser.selectOption('op:Generate%20QR%20Code');await task.locator('.ct-run:enabled').waitFor();gate.release();
  await page.evaluate(async()=>{const zxing=await import('./vendor/hunt/zxing/index.js');await zxing.prepareZXingModule({fireImmediately:true});await Promise.resolve();await Promise.resolve();});
  assert.equal(await page.locator('#image-output').inputValue(),'','a late real ZXing read cannot publish into another member on the same canonical topic');
  assert.equal(await page.locator('#image-copy').isEnabled(),false);
  await chooser.selectOption('native:image-barcode');
 }
 await page.locator('#barcode-read').click();await page.waitForFunction(()=>document.getElementById('image-status').textContent.includes('识别完成'));
 assert.match(await page.locator('#image-output').inputValue(),/ARG ROUND ONE/);
 await footer(page,['https://github.com/Sec-ant/zxing-wasm','https://github.com/zxing-cpp/zxing-cpp','https://github.com/Ge0rg3/StegOnline']);
 await page.evaluate(()=>{window.__qrFile=document.getElementById('image-input').files[0];window.__qrImageChanges=0;document.addEventListener('arg:imagechange',()=>window.__qrImageChanges++);});
 await chooser.selectOption('native:image-qr');await page.locator('#qr-matrix').fill(matrix.map(row=>row.join('')).join('\n'));await page.locator('#qr-import').click();
 await page.locator('#qr-decode').click();await page.waitForFunction(()=>document.getElementById('qr-status').textContent.includes('找到'));
 assert.equal(await page.locator('#qr-output').inputValue(),'ARG ROUND ONE');
 await footer(page,['https://github.com/Merricx/qrazybox','https://github.com/cozmo/jsQR','https://github.com/Ge0rg3/StegOnline']);
 if(full){
  await page.locator('#qr-brush').selectOption('-1');await page.locator('#qr-canvas').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press(' ');
  await page.locator('#qr-undo').click();await page.locator('#qr-decode').click();await page.waitForFunction(()=>document.getElementById('qr-output').value==='ARG ROUND ONE');
 }
 await chooser.selectOption('op:Generate%20QR%20Code');await task.locator('.ct-run:enabled').waitFor();
 assert.equal(await task.locator('.ct-direction').isVisible(),false,'mixed topic exposes exactly one real member selector');
 await task.locator('.ct-source').selectOption('text');await task.locator('.ct-input').fill('ARG GENERATED');await run(task);
 const generated=await download(page,task.locator('.ct-download'));assert.deepEqual([...generated.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 assert.equal(await page.evaluate(()=>document.getElementById('image-input').files[0]===window.__qrFile&&window.__qrImageChanges===0),true,'generating/downloading QR never replaces the original selected image');
 await footer(page,['https://github.com/gchq/CyberChef']);
 await chooser.selectOption('op:Parse%20QR%20Code');assert.equal(await task.locator('.ct-output').count(),0);assert.equal(await task.locator('.ct-source').inputValue(),'shared');
 assert.equal(await run(task),'ARG ROUND ONE','Chef parses the same original PNG as ZXing/jsQR');
 if(full){
  await chooser.selectOption('op:Generate%20QR%20Code');assert.equal(await task.locator('.ct-source').inputValue(),'text');
  assert.equal(await task.locator('.ct-input').inputValue(),'ARG GENERATED');await run(task);await task.locator('.ct-use').click();
  await chooser.selectOption('op:Parse%20QR%20Code');assert.equal(await task.locator('.ct-source').inputValue(),'result','explicit adoption owns the full generated PNG across member changes');
  assert.equal(await run(task),'ARG GENERATED');
  await task.locator('.ct-source').selectOption('shared');
 }
 await chooser.selectOption('native:image-barcode');assert.equal(await page.locator('#image-output').inputValue(),'','changing selected implementation invalidates the previous native result');
 await page.locator('#image-input').setInputFiles({name:'generated-explicit.png',mimeType:'image/png',buffer:generated});await page.waitForFunction(()=>document.getElementById('image-info').textContent.includes('generated-explicit.png')&&document.getElementById('image-status').textContent.includes('载入'));
 await page.locator('#barcode-read').click();await page.waitForFunction(()=>document.getElementById('image-output').value.includes('ARG GENERATED'));
 if(full)await notebookCapture(page);
 if(full){
  // Produce a real all-white alpha-channel view through the original image
  // controller. QR consumers must distinguish that view from original bytes.
  await go('native:image');await page.locator('#image-mode').selectOption('alpha');await page.locator('#image-view').click();await page.waitForFunction(()=>document.getElementById('image-status').textContent.includes('图像调整'));
  await go('topic:qr',{variant:'native:image-barcode'});await page.locator('#image-analysis-source').selectOption('view');await page.locator('#barcode-read').click();await page.waitForFunction(()=>document.getElementById('image-status').textContent.includes('未识别到条码'));
  assert.equal(await page.locator('#image-output').inputValue(),'');assert.equal(await page.locator('#image-result-notebook:visible').isEnabled(),false,'no-hit output cannot capture a stale previous QR result');
  await page.locator('#image-analysis-source').selectOption('original');await page.locator('#barcode-read').click();await page.waitForFunction(()=>document.getElementById('image-output').value.includes('ARG GENERATED'));
  await chooser.selectOption('op:Parse%20QR%20Code');await task.locator('.ct-source').selectOption('shared');assert.equal(await run(task),'ARG GENERATED');
  await task.locator('.ct-source').selectOption('view');await task.locator('.ct-run').click();await task.locator('.ct-status').filter({hasText:/处理完成|操作执行失败|错误/}).waitFor({timeout:45000});
  assert.ok(!await task.locator('.ct-output').count()||!((await task.locator('.ct-output').inputValue()).includes('ARG GENERATED')),'white processed view is never silently replaced with original QR input');
  await staleQR(scope);
 }
 await chooser.selectOption('native:image-qr');await page.reload();await page.waitForFunction(()=>new URLSearchParams(location.hash.split('?')[1]).get('view')==='native:image-qr'&&!document.getElementById('image-repair-pane').hidden);
 assert.equal(await chooser.inputValue(),'native:image-qr','refresh keeps the real selected member under one canonical topic');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'QR composition respects the viewport');
 await page.evaluate(async()=>{const {mountProjectSources}=await import('./project-sources.js');mountProjectSources(document.getElementById('main'));});
 await go('topic:qr',{variant:'native:image-barcode'});await footer(page,['https://github.com/Sec-ant/zxing-wasm','https://github.com/zxing-cpp/zxing-cpp','https://github.com/Ge0rg3/StegOnline']);
 await go('native:image');
 assert.deepEqual(new Set(await page.locator('#panel-image>.tool-provenance a').evaluateAll(nodes=>nodes.map(node=>node.href))),new Set(baselineSources),'leaving narrow QR modes restores the original image source inventory even after remount');
 assert.equal(await page.locator('#panel-image>.tool-provenance').count(),1);
 await go('native:image-steg');await footer(page,['https://github.com/Ge0rg3/StegOnline']);
 await go('topic:qr',{variant:'native:image-qr'});
 await page.locator('#qr-matrix').fill(matrix.map(row=>row.join('')).join('\n'));await page.locator('#qr-import').click();
 await chooser.selectOption('native:barcode-generate');await page.locator('#panel-barcode-generate:not([hidden])').waitFor();await page.waitForFunction(()=>document.getElementById('barcode-generate-symbology').options.length===111);
 await page.locator('#barcode-generate-input').fill('ARG BWIPP');await page.locator('#panel-barcode-generate').getByRole('button',{name:'转换',exact:true}).click();await page.waitForFunction(()=>document.getElementById('barcode-generate-output').value.includes('<svg'));
 assert.equal(await page.locator('#panel-barcode-generate>.tool-provenance a').first().getAttribute('href'),'https://github.com/metafloor/bwip-js');
 await page.locator('#panel-barcode-generate .capability-topic-settings select').selectOption('native:image-qr');await page.locator('#qr-import').waitFor();assert.equal(await page.locator('#qr-matrix').inputValue(),matrix.map(row=>row.join('')).join('\n'),'cross-panel generator preserves repair input');
 await page.evaluate(()=>window.scrollTo(0,0));
}

async function notebookCapture(page){
 const capture=page.locator('#image-result-notebook:visible');
 assert.equal(await capture.count(),1,'the selected native result exposes one notebook capture');assert.equal(await capture.isEnabled(),true);
 await capture.click();const dialog=page.locator('#notebook-capture');await dialog.locator('#notebook-capture-save:enabled').waitFor();await dialog.locator('#notebook-capture-save').click();
 await page.waitForFunction(()=>document.getElementById('notebook-capture-status').textContent==='已加入笔记本');await page.keyboard.press('Escape');
 const notes=await page.evaluate(async()=>{const {createNotebookStore}=await import('./notebook/store.js'),store=createNotebookStore();try{return await store.list();}finally{await store.close();}});
 assert.match(JSON.stringify(notes),/ARG GENERATED/,'capturing reads the actual current QR text, not a previous image result');
}

async function staleQR({page}){
 const chooser=page.locator('#panel-image .capability-topic-settings select');await chooser.selectOption('native:image-qr');
 await page.locator('#qr-matrix').fill(matrix.map(row=>row.join('')).join('\n'));await page.locator('#qr-import').click();
 await page.evaluate(()=>{
  const Original=window.Worker;window.__heldQr=[];window.__holdQr=true;
  window.Worker=class extends Original{constructor(url,options){super(url,options);this.testQr=/\/qr-worker\.js$/.test(String(url));}set onmessage(handler){super.onmessage=event=>{if(this.testQr&&window.__holdQr)window.__heldQr.push(()=>handler(event));else handler(event);};}};
 });
 await page.locator('#qr-decode').click();await page.waitForFunction(()=>window.__heldQr.length>0);
 await chooser.selectOption('op:Generate%20QR%20Code');await page.evaluate(()=>{window.__holdQr=false;window.__heldQr.splice(0).forEach(deliver=>deliver());});
 assert.equal(await page.locator('#qr-output').inputValue(),'','a completed old QR Worker cannot refill output after a same-topic member switch');
 await chooser.selectOption('native:image-qr');
 const before=await page.locator('#qr-preview').evaluate(canvas=>({width:canvas.width,height:canvas.height,hidden:canvas.hidden}));
 await page.evaluate(()=>{const original=window.createImageBitmap;window.__heldBitmaps=[];window.createImageBitmap=async(...args)=>{const bitmap=await original(...args);return new Promise(resolve=>window.__heldBitmaps.push(()=>resolve(bitmap)));};});
 const tiny=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=29;return canvas.toDataURL().split(',')[1];});
 await page.locator('#qr-image').setInputFiles({name:'late-preview.png',mimeType:'image/png',buffer:Buffer.from(tiny,'base64')});await page.waitForFunction(()=>window.__heldBitmaps.length>0);
 await chooser.selectOption('op:Generate%20QR%20Code');await page.evaluate(async()=>{window.__heldBitmaps.splice(0).forEach(deliver=>deliver());await new Promise(requestAnimationFrame);});
 assert.deepEqual(await page.locator('#qr-preview').evaluate(canvas=>({width:canvas.width,height:canvas.height,hidden:canvas.hidden})),before,'late decoded image closes without changing the preserved native repair preview');
}

try{
 let full=true;
 for(const width of [1440,390])for(const motion of ['no-preference','reduce']){
  const scope=await production(width,motion);console.log('Family scope',width,motion);
  await byteFamilies(scope);console.log('  byte families passed');await nativeFamilies(scope);console.log('  native families passed');await qrFamily(scope,full);console.log('  QR family passed');
  await scope.page.screenshot({path:resolve(artifacts,'qr-'+width+'-'+motion+'.png'),fullPage:true});
  scope.clean();await scope.context.close();full=false;
 }
 console.log('PASS: five consolidated families; real Base/numeric/native outputs and raw-byte roundtrips; mixed QR generation, download, explicit image adoption, three real decoders and original/view separation; exact provenance, notebook capture and stale Worker/image rejection; PC/mobile, keyboard, normal/reduced motion and subdirectory resources.');
}catch(error){if(active&&!active.isClosed()){console.error('At',active.url());console.error(await active.locator('body').innerText().catch(()=>''));await active.screenshot({path:resolve(artifacts,'failure.png'),fullPage:true}).catch(()=>{});}throw error;}
finally{await browser.close();}
