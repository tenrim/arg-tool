import {tmpdir as testTmpdir} from 'node:os';
import {chooseOperation} from './browser-navigation.mjs';
import {appPages} from './browser-host.mjs';
import {checkChefWorker} from './browser-chef-worker.mjs';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {wavEncode} from '../public/media.js';
const {chromium}=createRequire(import.meta.url)('playwright'),browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const context=await browser.newContext({viewport:{width:1365,height:900},hasTouch:true}),errors=[],missing=[],external=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='arg.test'){external.push(u.href);return route.abort();}try{const p=resolve('public','.'+(u.pathname==='/'?'/index.html':u.pathname));await route.fulfill({body:await readFile(p),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.woff2':'font/woff2','.png':'image/png'})[extname(p)]||'application/octet-stream'});}catch{missing.push(u.pathname);await route.abort();}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://arg.test/#textlab');
 const go=async id=>{await page.evaluate(id=>location.hash=id,id);await page.waitForSelector('#panel-'+id+':not([hidden])');};
 const task=id=>page.locator('#ct-'+id),field=(id,n)=>task(id).locator(`.ct-parameters [data-arg="${n}"]`).locator('input,textarea,select').last();
 async function choose(id,op){await chooseOperation(page,op);}
 async function run(id){await task(id).locator('.ct-run').click();await page.waitForFunction(id=>/处理完成|操作执行失败|错误|已停止/.test(document.querySelector('#ct-'+id+' .ct-status')?.textContent||''),id,{timeout:45000});assert.match(await task(id).locator('.ct-status').textContent(),/处理完成/,id);}
 const value=id=>task(id).locator('.ct-output').inputValue();
 // Both native and engine conversions use one parameter/action card above the
 // same responsive input/result cards, with no duplicate heading or shortcut.
 await chooseOperation(page,'A1Z26 Cipher Encode');
 const nativeLayout=page.locator('#panel-basics .ui-conversion');
 await choose('encoding','To Base64');
 await task('encoding').locator('.ct-input').fill('clue');await run('encoding');
 await task('encoding').locator('.ct-input').fill('new clue');
 assert.equal(await task('encoding').locator('.ct-status').textContent(),'','editing quietly invalidates the result');
 assert(await task('encoding').locator('.ct-copy').isDisabled());
 assert.equal(await task('encoding').locator('.ct-output').count(),0,'old output is removed synchronously');
 for(const width of [390,1365]){
  await page.setViewportSize({width,height:900});
  for(const [op,layout] of [['A1Z26 Cipher Encode',nativeLayout],['To Base64',task('encoding').locator('.ui-conversion')]]){
   await chooseOperation(page,op);
   const geometry=await layout.evaluate(root=>{const controls=root.querySelector(':scope>[data-ui=card]'),panes=root.querySelector(':scope>[data-ui=split-view]');return {controls:controls.getBoundingClientRect().bottom,panes:panes.getBoundingClientRect().top,cards:panes.children.length};});
   assert.equal(geometry.cards,2);assert.ok(geometry.controls<=geometry.panes,'parameters/actions precede the input/result cards');
  }
 }
 assert.equal(await page.locator('.ct-name,.ct-help,.ct-reverse,#basics-reverse').count(),0,'duplicate headings/help and reverse shortcuts are removed');
 assert.equal(await task('encoding').locator('.ct-parameters').evaluate(node=>node.closest('.ui-conversion').firstElementChild.contains(node)),true);
 await choose('textlab','Unique');await task('textlab').locator('.ct-input').fill('pear\napple\npear');await run('textlab');assert.equal(await value('textlab'),'pear\napple');await task('textlab').locator('.ct-input').fill('other');assert.equal(await task('textlab').locator('.ct-output').count(),0);
 await go('datalab');await choose('datalab','JSON Beautify');await task('datalab').locator('.ct-input').fill('{"clue":42}');await run('datalab');assert.deepEqual(JSON.parse(await value('datalab')),{clue:42});
 await choose('datalab','HTML To Text');await task('datalab').locator('.ct-input').fill('<script>window.injected=true</script><p>safe clue</p>');await run('datalab');assert.equal(await page.evaluate(()=>window.injected),undefined);await choose('datalab','Scatter chart');await task('datalab').locator('.ct-input').fill('x y\n1 2\n2 4');await run('datalab');assert.equal(await task('datalab').locator('.ct-result > svg').count(),1);const chartDownload=page.waitForEvent('download');await task('datalab').locator('.ct-download').click();assert.match(await readFile(await(await chartDownload).path(),'utf8'),/<svg[^>]+xmlns=/);
 await choose('datalab','CSV to JSON');await task('datalab').locator('.ct-input').fill('a,b\n1,2');await run('datalab');assert.ok(JSON.parse(await value('datalab')));
 // Public unit conversion now belongs to the complete Qalculate engine.
 // Original Chef operation ownership and recipe execution remain covered by
 // the topic-policy suite; the Qalculate suite checks actual unit conversions.
 await page.evaluate(()=>location.hash='mathlab?task=topic:units');
 await page.locator('#panel-unitconvert').waitFor({state:'visible'});
 assert.match(await page.locator('#panel-unitconvert h1').textContent(),/几何与日常单位/);
 await go('networklab');await choose('networklab','Parse URI');await task('networklab').locator('.ct-input').fill('https://example.com:8443/clue?q=42#answer');await run('networklab');assert.match(await value('networklab'),/example.com/);
 await go('file');await page.locator('#file-input').setInputFiles({name:'clue.txt',mimeType:'text/plain',buffer:Buffer.from('abc')});await choose('file','MD5');await run('file');assert.equal((await value('file')).trim(),'900150983cd24fb0d6963f7d28e17f72');
 await choose('file','Gzip');await run('file');let downloaded=page.waitForEvent('download');await task('file').locator('.ct-download').click();const gzip=await readFile(await(await downloaded).path());assert.deepEqual([...gzip.slice(0,2)],[31,139]);await task('file').locator('.ct-use').click();await choose('file','Gunzip');await run('file');assert.equal(await value('file'),'abc');
 await go('analysis');await choose('statistics','Entropy');await page.locator('#analysis-input').fill('aaaa');await run('statistics');assert.match(await task('statistics').locator('.ct-metric').textContent(),/0.000000/);await choose('statistics','Frequency distribution');await run('statistics');assert.equal(await task('statistics').locator('svg rect').count(),256);
 await go('coordinates');await choose('time','From UNIX Timestamp');await task('time').locator('.ct-input').fill('0');await run('time');assert.match(await value('time'),/1970/);await choose('time','DateTime Delta');await page.locator('#panel-coordinates .tool-help-button').click();assert.equal(await page.locator('#tool-help-coordinates .ct-instructions').evaluate(n=>n.hidden),false);assert.equal(await page.locator('#panel-coordinates .tool-help-button').getAttribute('aria-expanded'),'true');await page.locator('#tool-help-coordinates .ct-instructions').waitFor({state:'visible'});assert.equal(await page.locator('#tool-help-coordinates .ct-instructions').isVisible(),true);
 await go('image');const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=16;c.height=8;const x=c.getContext('2d');x.fillStyle='#ff0000';x.fillRect(0,0,8,8);x.fillStyle='#00ff00';x.fillRect(8,0,8,8);return c.toDataURL().split(',')[1];});await page.locator('#image-input').setInputFiles({name:'clue.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await page.waitForFunction(()=>document.getElementById('image-status').textContent.includes('已载入'));await choose('image','Add Text To Image');await field('image',0).fill('A');await field('image',5).fill('8');await run('image');assert.ok(await task('image').locator('.ct-result-image').evaluate(img=>{const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const x=canvas.getContext('2d');x.drawImage(img,0,0);const p=x.getImageData(0,0,canvas.width,canvas.height).data;for(let i=0;i<p.length;i+=4)if(p[i]>200&&p[i+1]>200&&p[i+2]>200)return true;return false;}),'bitmap font paints visible pixels');await choose('image','Resize Image');await field('image',0).fill('8');await field('image',1).fill('4');await run('image');assert.deepEqual(await task('image').locator('.ct-result-image').evaluate(i=>[i.naturalWidth,i.naturalHeight]),[8,4]);
 downloaded=page.waitForEvent('download');await task('image').locator('.ct-download').click();const result=await readFile(await(await downloaded).path());assert.deepEqual([...result.slice(0,4)],[137,80,78,71]);
 await task('image').locator('.ct-use').click();await choose('image','Rotate Image');await run('image');assert.deepEqual(await task('image').locator('.ct-result-image').evaluate(i=>[i.naturalWidth,i.naturalHeight]),[4,8]);await task('image').locator('.ct-apply').click();await page.waitForFunction(()=>document.getElementById('image-info').textContent.includes('4 × 8'));assert.equal(await page.locator('#image-analysis-pane').isVisible(),true);
 await choose('image','Split Colour Channels');await task('image').locator('.ct-source').selectOption('shared');await run('image');assert.equal(await task('image').locator('.ct-file-row').count(),3);downloaded=page.waitForEvent('download');await task('image').locator('.ct-file-row button').first().click();assert.ok((await readFile(await(await downloaded).path())).length>50);
 await choose('image','Generate QR Code');await task('image').locator('.ct-source').selectOption('text');await task('image').locator('.ct-input').fill('ARG clue');await run('image');assert.ok(await task('image').locator('.ct-result-image').evaluate(i=>i.naturalWidth>50));
 assert.equal(await page.locator('.ct-chain').count(),0,'standalone tools have no chain shortcut');
 await page.locator('.workspace-search-trigger').click();await page.locator('.workspace-search input').fill('Resize Image');await page.locator('.workspace-search [data-capability="topic:image-geometry"]').click();await page.waitForFunction(()=>document.querySelector('#ct-image').dataset.operation==='Resize Image');
 await go('audio');const audio=wavEncode([Float32Array.from({length:800},(_,i)=>Math.sin(i/8)*.1)],8000);await page.locator('#audio-input').setInputFiles({name:'clue.wav',mimeType:'audio/wav',buffer:Buffer.from(audio)});await page.waitForFunction(()=>document.getElementById('audio-status').textContent.includes('音频已载入'));await choose('audio','Extract Audio Metadata');await run('audio');assert.ok((await value('audio')).length>10);
 await go('video');await page.locator('#video-file').setInputFiles({name:'clue.wav',mimeType:'audio/wav',buffer:Buffer.from(audio)});await choose('media','Play Media');await run('media');assert.equal(await task('media').locator('video').count(),1);
 // Validate cancel and parameter invalidation in the same turn, before any response can be applied.
 await go('textlab');await page.evaluate(()=>{const t=document.getElementById('ct-textlab');t.querySelector('.ct-run').click();t.querySelector('.ct-stop').click();});assert.match(await task('textlab').locator('.ct-status').textContent(),/已停止/);assert.equal(await task('textlab').locator('.ct-output').count(),0);
 for(const width of [320,390,768,1365]){await page.setViewportSize({width,height:900});for(const name of ['textlab','datalab','networklab','mathlab','image','file','analysis','coordinates','audio','video']){await go(name);const panel=page.locator('#panel-'+name);assert.equal(await panel.locator('.tool-provenance').evaluate(e=>e===e.parentElement.lastElementChild),true);const bounds=await panel.evaluate((root,w)=>({scroll:document.documentElement.scrollWidth,bad:[...root.querySelectorAll('.ct-tool button,.ct-tool input,.ct-tool select,.ct-tool textarea')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.left<-.5||r.right>w+1);}).map(e=>e.className)}),width);assert.ok(bounds.scroll<=width+1,`${name} ${width} scroll ${bounds.scroll}`);assert.deepEqual(bounds.bad,[],`${name} ${width}`);}await go('image');await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`${testTmpdir()}/arg-chef-distributed-${width}.png`,fullPage:true});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='200%');for(const name of ['textlab','datalab','networklab','mathlab','image','file']){await go(name);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=391),'200% '+name);}
 assert.equal(await page.locator('iframe').count(),0);assert.equal(appPages(context).length,1);assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});console.log('PASS: real CyberChef task flows, original bytes/images/files, continued image edits, shared media, structured results, standalone tools, discovery, cancellation, four viewport widths and 200% text, no extra pages or external requests.');
 await checkChefWorker(browser);
}finally{await browser.close();}
