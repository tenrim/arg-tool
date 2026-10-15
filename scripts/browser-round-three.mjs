import {appPages} from './browser-host.mjs';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true}),missing=[],external=[],errors=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='arg.test'){external.push(u.href);return route.abort();}try{const f=resolve('public','.'+(u.pathname==='/'?'/index.html':u.pathname));await route.fulfill({body:await readFile(f),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.woff2':'font/woff2'})[extname(f)]||'application/octet-stream'});}catch{missing.push(u.pathname);await route.abort();}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const click=id=>page.locator('#'+id).click(),fill=(id,value)=>page.locator('#'+id).fill(value),value=id=>page.locator('#'+id).inputValue();
 const cell=(y,x)=>page.locator(`#paper-board button[data-row="${y}"][data-col="${x}"]`);
 async function status(id,text){await page.waitForFunction(({id,text})=>document.getElementById(id)?.textContent.includes(text),{id,text},{timeout:30000});}
 async function type(kind,rows,cols){await page.locator('#paper-type').selectOption(kind);await fill('paper-rows',String(rows));await fill('paper-cols',String(cols));await click('paper-new');}
 async function input(text){if(!await page.locator('.paper-io').evaluate(e=>e.open))await page.locator('.paper-io summary').click();await fill('paper-text',text);await click('paper-import-text');await status('paper-io-status','已应用');}
 async function solve(text='唯一完整解'){await click('paper-solve');await status('paper-status',text);}
 await page.goto('https://arg.test/#paper');await page.waitForSelector('#panel-paper:not([hidden])');
 await type('sudoku',4,4);await input('1204\n0410\n2043\n4321');await solve();assert.equal(await value('paper-output'),'1 2 3 4\n3 4 1 2\n2 1 4 3\n4 3 2 1');assert.equal(await cell(0,2).textContent(),'3');
 await click('paper-original');assert.equal(await cell(0,2).textContent(),'');await click('paper-result');assert.equal(await cell(0,2).textContent(),'3');
 const jsonPromise=page.waitForEvent('download');await click('paper-export');const json=JSON.parse(await readFile(await(await jsonPromise).path(),'utf8'));assert.equal(json.cells[0][2],null);
 const svgPromise=page.waitForEvent('download');await click('paper-svg');const svg=await readFile(await(await svgPromise).path(),'utf8');assert.match(svg,/<svg/);assert.match(svg,/求解结果/);assert.match(svg,/stroke-width="2"/);
 await cell(0,1).tap();await page.getByRole('button',{name:'填写 1',exact:true}).tap();assert.equal(await value('paper-output'),'');assert.equal(await page.locator('#paper-result').isDisabled(),true);await solve('无解');
 await click('paper-undo');assert.equal(await cell(0,1).textContent(),'2');await click('paper-redo');assert.equal(await cell(0,1).textContent(),'1');await click('paper-undo');
 await cell(0,2).click();await page.keyboard.press('3');assert.equal(await cell(0,2).textContent(),'3');await page.keyboard.press('ArrowDown');await page.keyboard.press('Delete');assert.equal(await cell(1,2).textContent(),'');await click('paper-undo');await click('paper-undo');
 await type('slitherlink',2,2);await input('2 2\n2 2');await solve();assert.equal(await page.locator('#paper-board svg line').count(),8);await page.locator('#paper-crosses').check();assert.equal(await page.locator('#paper-board svg text').count(),4);
 await input('0 0\n0 0');await solve('无解');
 await type('nurikabe',2,2);await input('1 .\n. .');await solve();assert.equal(await page.locator('#paper-board .paper-sea').count(),3);assert.equal(await value('paper-output'),'. #\n# #');
 await type('akari',2,2);await input('. #\n# .');await solve();assert.equal(await page.locator('#paper-board .paper-lamp').count(),2);assert.equal(await value('paper-output'),'● #\n# ●');
 await click('paper-extract');await page.waitForSelector('#panel-extract:not([hidden])');assert.equal(await value('extract-input'),'● #\n# ●');await page.evaluate(()=>location.hash='paper');await page.waitForSelector('#panel-paper:not([hidden])');
 await page.locator('#paper-type').selectOption('sudoku');assert.equal(await cell(0,0).textContent(),'1');await click('paper-new');await solve('多个解');assert.match(await value('paper-output'),/\?/);
 // Cancellation must settle the pending promise and never restore old output.
 await page.evaluate(()=>{document.getElementById('paper-solve').click();document.getElementById('paper-stop').click();});await status('paper-status','已停止');assert.equal(await page.locator('#paper-solve').isEnabled(),true);assert.equal(await value('paper-output'),'');
 // Import crosses puzzle types, retains other drafts, and rejects invalid dimensions.
 await page.locator('#paper-file').setInputFiles({name:'saved.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(json))});await status('paper-io-status','已打开');assert.equal(await cell(0,2).textContent(),'');await solve();
 await page.locator('#paper-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...json,rows:999999999}))});await status('paper-io-status','无法读取');assert.equal(await cell(0,0).textContent(),'1');
 await page.reload();await page.waitForSelector('#panel-paper:not([hidden])');assert.equal(await cell(0,0).textContent(),'1');assert.equal(await value('paper-output'),'');
 const panel=page.locator('#panel-paper');await panel.locator('.tool-help-button').click();assert.equal(await panel.locator('.tool-provenance').evaluate(e=>e===e.parentElement.lastElementChild),true);assert.ok(await panel.locator('.tool-provenance').textContent().then(s=>s.includes('cspuz_core')));
 for(const width of [320,390,768,1365]){await page.setViewportSize({width,height:900});for(const [kind,n]of [['sudoku',9],['slitherlink',15],['nurikabe',15],['akari',15]]){await type(kind,n,n);await click('paper-larger');const bounds=await panel.evaluate((root,w)=>({scroll:document.documentElement.scrollWidth,clipped:[...root.querySelectorAll('button,input,textarea,select')].filter(e=>!e.closest('.paper-board-scroll')).filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.left<-.5||r.right>w+1);}).map(e=>e.id||e.textContent.slice(0,20))}),width);assert.ok(bounds.scroll<=width+1,`${kind} ${width}: document ${bounds.scroll}`);assert.deepEqual(bounds.clipped,[],`${kind} ${width}`);}await type('sudoku',9,9);await page.screenshot({path:`/tmp/arg-r3-${width}.png`,fullPage:true});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=391));
 assert.equal(appPages(context).length,1);assert.equal(await page.locator('iframe').count(),0);assert.deepEqual({missing,external,errors},{missing:[],external:[],errors:[]});console.log('PASS: four actual solver workers; unique/multiple/impossible; touch and keyboard entry; undo/redo; original/results; JSON/SVG; extraction; drafts; cancellation; Chinese help/sources; 320–1365 px and 200% text; no external requests or extra pages.');
}finally{await browser.close();}
