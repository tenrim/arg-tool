import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{for(const scenario of ['native','blob','blob-subpath']){
 const prefix=scenario==='blob-subpath'?'/toolbox/':'/',errors=[],missing=[],external=[],chunks=new Set();
 const ctx=await browser.newContext({viewport:{width:1440,height:950},hasTouch:true});
 await ctx.route('**/*',async route=>{
  const u=new URL(route.request().url());if(u.protocol==='blob:')return route.continue();
  if(u.hostname!=='arg.test'){external.push(u.href);return route.abort();}
  try{assert.ok(u.pathname.startsWith(prefix),'escaped deployment prefix');const path=resolve('public',u.pathname.slice(prefix.length)||'index.html');if(u.pathname.includes('/sky-records/'))chunks.add(u.pathname);
   await route.fulfill({body:await readFile(path),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm','.png':'image/png','.webp':'image/webp'})[extname(path)]||'application/octet-stream'});
  }catch{missing.push(u.pathname);await route.abort();}
 });
 if(scenario!=='native')await ctx.addInitScript(()=>{
  const Native=Worker;window.__discoveryWorkers=0;
  window.Worker=class extends Native{constructor(url,options){const original=new URL(url,location.href);if(!/\/(reference\/worker|science\/worker|discovery\/go-worker)\.js$/.test(original.pathname)){super(url,options);return;}
   const blob=URL.createObjectURL(new Blob(['importScripts('+JSON.stringify(original.href)+');'],{type:'text/javascript'}));super(blob,options);this.blob=blob;window.__discoveryWorkers++;}
   terminate(){super.terminate();if(this.blob)URL.revokeObjectURL(this.blob);}
  };
 });
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://arg.test'+prefix+'#go');
 const go=async id=>{await page.evaluate(id=>location.hash=id,id);await page.waitForSelector('#panel-'+id+':not([hidden])');};
 const run=async id=>{await page.locator('#'+id+'-run').click();await done(id);};
 const done=async id=>{await page.waitForFunction(id=>document.getElementById(id+'-status').textContent==='查询完成'||document.getElementById(id+'-status').classList.contains('error'),id);assert.equal(await page.locator('#'+id+'-status').textContent(),'查询完成',scenario+' '+id);};
 const load=async()=>{await page.locator('#go-load').click();await page.waitForFunction(()=>document.getElementById('go-status').textContent.startsWith('已载入')||document.getElementById('go-status').classList.contains('error'));assert.match(await page.locator('#go-status').textContent(),/已载入/);};
 const sgf='(;GM[1]SZ[5]CA[UTF-8]PB[黑方]PW[白方]AB[ab][ba][cb]AW[bb];B[bc]C[提一子](;W[dd]C[主线])(;W[ee]C[变化]))(;SZ[9];B[];W[tt])';
 await page.locator('#go-file').setInputFiles({name:'branches.sgf',mimeType:'text/plain',buffer:Buffer.from(sgf)});
 await page.waitForFunction(()=>document.querySelector('#go-status').textContent==='已载入 2 局棋谱');
 assert.equal(await page.locator('#go-board [data-color]').count(),4);
 await page.locator('#go-next').click();assert.match(await page.locator('#go-position').textContent(),/黑方提子 1/);assert.equal(await page.locator('#go-board [data-point="B4"]').count(),0);
 const choices=await page.locator('#go-branch option').evaluateAll(nodes=>nodes.map(n=>({value:n.value,text:n.textContent})));const branch=choices.find(r=>r.text.includes('变化'));await page.locator('#go-branch').selectOption(branch.value);
 assert.equal(await page.locator('#go-board [data-point="E1"][data-color="2"]').count(),1);assert.match(await page.locator('#go-comment').textContent(),/变化/);
 await page.locator('#go-prev').click();await page.locator('#go-next').click();assert.match(await page.locator('#go-comment').textContent(),/变化/);
 const image=page.waitForEvent('download');await page.locator('#go-image').click();const boardSvg=await readFile(await(await image).path(),'utf8');assert.match(boardSvg,/data-point="E1"/);
 const exported=await page.evaluate(async source=>{const doc=new DOMParser().parseFromString(source,'image/svg+xml'),img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(source);await img.decode();return{width:img.naturalWidth,height:img.naturalHeight,axis:doc.querySelector('.go-axis').getAttribute('font-size')};},boardSvg);assert.deepEqual(exported,{width:720,height:720,axis:'.34'});
 const download=page.waitForEvent('download');await page.locator('#go-save').click();assert.equal(await readFile(await(await download).path(),'utf8'),sgf);
 await page.locator('#go-flip').click();assert.equal(await page.locator('#go-board [data-point="E1"]').getAttribute('cx'),'1');
 await page.locator('#go-game').selectOption('1');await page.locator('#go-last').click();assert.match(await page.locator('#go-position').textContent(),/第 2 手/);
 await page.locator('#go-input').fill('(;SZ[5]AB[aa];W[aa])');assert.equal(await page.locator('#go-board [data-color]').count(),0);assert.equal(await page.locator('#go-save').isDisabled(),true);await page.locator('#go-load').click();await page.waitForSelector('#go-status.error');assert.match(await page.locator('#go-status').textContent(),/已有棋子/);
 await page.locator('#go-input').fill(sgf);await load();
 assert.equal(await page.evaluate(()=>{document.getElementById('go-load').click();const enabled=!document.getElementById('go-stop').disabled;document.getElementById('go-stop').click();return enabled;}),true);await page.waitForTimeout(100);assert.equal(await page.locator('#go-save').isDisabled(),true);assert.match(await page.locator('#go-status').textContent(),/已停止/);await load();
 await go('marine');await page.waitForSelector('#marine-browser[data-ready="true"]');assert.equal(await page.locator('[data-flag]').count(),36);await page.locator('[data-flag="A"]').click();await done('marine');assert.match(await page.locator('#marine-results').textContent(),/潜水员/);
 assert.equal(await page.locator('#marine-results img').evaluate(n=>n.complete&&n.naturalWidth>0),true);
 await page.locator('#marine-mode').selectOption('sequence');await page.locator('#marine-query').fill('a b a 1');await run('marine');assert.deepEqual(await page.locator('.marine-sequence figcaption').allTextContents(),['A','B','A','1']);
 await page.locator('[data-flag="2"]').click();await done('marine');assert.equal(await page.locator('#marine-query').inputValue(),'ABA12');await page.locator('#marine-query').fill('A!');await page.locator('#marine-run').click();await page.waitForSelector('#marine-status.error');assert.equal(await page.locator('#marine-results').textContent(),'');
 await go('currencies');await page.waitForSelector('#currencies-browser[data-ready="true"]');await page.locator('#currencies-country-picker').selectOption('CN');await done('currencies');assert.match(await page.locator('#currencies-results').textContent(),/CNY/);
 await page.locator('#currencies-results [data-country="CN"]').click();await page.waitForSelector('#panel-countries:not([hidden])');await done('countries');assert.equal(await page.locator('#countries-results article').count(),1);assert.match(await page.locator('#countries-results').textContent(),/中国/);
 await page.locator('#countries-results [data-currency="CNY"]').click();await page.waitForSelector('#panel-currencies:not([hidden])');await done('currencies');assert.equal(await page.locator('#currencies-query').inputValue(),'CNY');
 await page.locator('#currencies-query').fill('008');await run('currencies');assert.match(await page.locator('#currencies-results').textContent(),/数字代码008/);
 await page.locator('#currencies-filter').selectOption('historic');await page.locator('#currencies-query').fill('');await run('currencies');assert.match(await page.locator('#currencies-results').textContent(),/历史／已退出/);assert.equal(await page.locator('#currencies-results [data-country]').count(),0);
 await go('sky');await page.waitForSelector('#sky-browser[data-ready="true"]');assert.ok(await page.locator('[data-sky-point]').count()>0);assert.equal(chunks.size,0,'detail files must be lazy');
 await page.locator('#sky-query').fill('M31');await run('sky');assert.equal(await page.locator('#sky-results article').count(),1);assert.match(await page.locator('#sky-results').textContent(),/NGC0224/);assert.equal(chunks.size,1);
 await page.locator('#sky-results [data-sky]').click();await page.waitForSelector('#panel-astronomy:not([hidden])');await page.waitForFunction(()=>document.querySelector('#astronomy-status').textContent==='处理完成');assert.match(await page.locator('#astronomy-output').textContent(),/NGC0224/);assert.match(await page.locator('#astronomy-output').textContent(),/方位角[\d.]+°/);assert.equal(await page.locator('#astronomy-output canvas').count(),1);
 const first=await page.locator('#astronomy-output').textContent();await page.locator('#astro-lon').fill('0');assert.equal(await page.locator('#astronomy-output').textContent(),'');await page.locator('#astronomy-run').click();await page.waitForFunction(()=>document.querySelector('#astronomy-status').textContent==='处理完成');assert.notEqual(await page.locator('#astronomy-output').textContent(),first);
 await page.locator('#astro-catalog').click();await page.waitForSelector('#panel-sky:not([hidden])');await done('sky');
 await page.locator('#sky-query').fill('天狼星');await run('sky');assert.match(await page.locator('#sky-results').textContent(),/6\.752481/);assert.equal(await page.locator('[data-sky-point]').count(),1);await page.locator('[data-sky-point]').press('Enter');await done('sky');assert.match(await page.locator('#sky-visual-detail').textContent(),/天狼星/);
 await page.locator('#sky-query').fill('IC1064');await run('sky');assert.match(await page.locator('#sky-results').textContent(),/未提供/);assert.equal(await page.locator('#sky-results [data-sky]').count(),0);
 if(scenario==='blob-subpath'){
  for(const [id,file]of [['go','vendor/discovery/sgf.js'],['marine','vendor/discovery/marine-flags.json'],['currencies','vendor/discovery/currencies.json'],['sky','vendor/discovery/sky-index.json'],['sky','vendor/discovery/sky-records/ngc-011.json']]){
   await go(id);if(id==='sky')await page.locator('#sky-query').fill('M31');if(id==='marine')await page.locator('#marine-query').fill('AB');
   const url='https://arg.test'+prefix+file;await ctx.route(url,r=>r.fulfill({status:503,body:'Unavailable'}));await page.locator('#'+id+(id==='go'?'-load':'-run')).click();await page.waitForSelector('#'+id+'-status.error');assert.equal(await page.locator('#'+id+(id==='go'?'-save':'-download')).isDisabled(),true);await ctx.unroute(url);if(id==='go')await load();else await run(id);
  }
  await go('go');await page.evaluate(()=>{window.__originalWorker=Worker;window.Worker=class{constructor(){throw new DOMException('Blocked','SecurityError');}};});await page.locator('#go-load').click();assert.match(await page.locator('#go-status').textContent(),/无法启动/);await page.evaluate(()=>{window.Worker=window.__originalWorker;});await load();
 }
 await mkdir('/tmp/mist-discovery-shots',{recursive:true});
 for(const width of [320,390,768,1440,1920]){await page.setViewportSize({width,height:950});for(const id of ['go','marine','currencies','sky']){await go(id);assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w+1,width),id+' overflow '+width);assert.equal(await page.locator('#panel-'+id+' .tool-help-button').count(),1);assert.equal(await page.locator('#panel-'+id+' .tool-provenance').evaluate(n=>n===n.parentElement.lastElementChild),true);if(scenario==='native'&&[390,1440].includes(width))await page.screenshot({path:`/tmp/mist-discovery-shots/${id}-${width}.png`});}}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='200%');for(const id of ['go','marine','currencies','sky']){await go(id);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=391),id+' 200% overflow');}
 await page.emulateMedia({reducedMotion:'reduce'});await go('go');assert.equal(await page.locator('#go-input').inputValue(),sgf);
 if(scenario!=='native')assert.ok(await page.evaluate(()=>window.__discoveryWorkers)>10);
 assert.equal(ctx.pages().length,1);assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});
 console.log(scenario+' PASS: SGF file/branches/captures/pass/flip/download/invalidation/cancel, real flags, ordered sequence, currency-country links, lazy sky aliases and real astronomy coordinates, resource failure recovery, 320–1920px/200% text, no external requests or windows.');await ctx.close();
}}finally{await browser.close();}
