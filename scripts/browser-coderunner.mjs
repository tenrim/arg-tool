import {appPages} from './browser-host.mjs';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const context=await browser.newContext({viewport:{width:1365,height:900},hasTouch:true}),external=[],missing=[],errors=[],requests=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());requests.push(u.pathname);if(u.hostname!=='arg.test'){external.push(u.href);return route.abort();}try{const p=resolve('public','.'+(u.pathname==='/'?'/index.html':u.pathname));await route.fulfill({body:await readFile(p),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.woff2':'font/woff2'})[extname(p)]||'application/octet-stream'});}catch{missing.push(u.pathname);await route.abort();}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://arg.test/#code');await page.waitForSelector('#panel-code:not([hidden])');
 assert.equal(requests.some(s=>s.includes('/vendor/coderunner/')),false,'runtimes load on demand');
 assert.equal(await page.locator('.rail-groups [data-rail-expand="programming"]').count(),1,'one inline programming group with actual task links');
 await page.getByRole('button',{name:'代码运行使用说明',exact:true}).click();assert.equal(await page.locator('#tool-help-code').isVisible(),true);
 const chooseLanguage=async lang=>{const id=lang==='brainfuck'?'native:code':'native:code-'+lang;await page.evaluate(id=>document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id}})),id);await page.waitForFunction(({id,lang})=>document.querySelector('.capability-workspace-context')?.dataset.currentCapability===id&&document.getElementById('code-language').value===lang,{id,lang});};
 const select=async(lang,code,input='')=>{await chooseLanguage(lang);await page.fill('#code-source',code);if(lang!=='sql')await page.fill('#code-input',input);};
 const wait=async()=>{await page.waitForFunction(()=>/运行完成|执行失败|加载或执行失败|超时|已停止/.test(document.getElementById('code-status').textContent),{},{timeout:65000});};
 const output=()=>page.inputValue('#code-output');
 async function run(lang,code,input=''){await select(lang,code,input);await page.click('#code-run');await wait();assert.match(await page.locator('#code-status').textContent(),/运行完成/,await page.locator('#code-error').textContent());return output();}
 const ws='   '+(65).toString(2).replace(/0/g,' ').replace(/1/g,'\t')+'\n\t\n  \n\n\n';
 assert.equal(await run('brainfuck',',+.','@'),'A');
 assert.equal(await run('brainfuck',await readFile('upstream/coderunner/esolang-park/languages/brainfuck/tests/helloworld.txt','utf8')),'Hello World!\n');
 assert.equal(await run('ook','Ook. Ook! Ook. Ook. Ook! Ook.','@'),'A');
 assert.equal(await run('befunge','&1+.@','41'),'42 ');
 assert.equal(await run('deadfish','iiiso'),'9');
 assert.equal(await run('whitespace',ws),'A');
 assert.equal(await run('malbolge','(&%$_""7<5492V0TA3P'),'zb3');
 assert.equal(await run('javascript',"console.log(readline(),2**10,typeof fetch); Promise.resolve(42).then(print)",'clue'),'clue 1024 undefined\n42\n');
 assert.equal(await run('lua',"print(io.read('*n')+io.read('*n')); io.write('线索')",'19 23'),'42\n线索');
 assert.equal(await run('sql','CREATE TABLE clue(x); INSERT INTO clue VALUES (42); SELECT * FROM clue;'),'[42]\n');
 assert.equal(await page.locator('#code-sql-results td').textContent(),'42');
 let pending=page.waitForEvent('download');await page.click('#code-db-save');const database=await readFile(await(await pending).path());assert.equal(database.subarray(0,16).toString(),'SQLite format 3\0');
 await page.locator('#code-db-file').setInputFiles({name:'clue.sqlite',mimeType:'application/vnd.sqlite3',buffer:database});await page.waitForFunction(()=>document.getElementById('code-db-info').textContent.includes('clue.sqlite'));
 assert.equal(await run('sql','UPDATE clue SET x=43; SELECT * FROM clue;'),'[43]\n');
 assert.equal(await run('sql','SELECT * FROM clue;'),'[42]\n','rerun uses original input database');
 await page.click('#code-db-clear');assert.equal(await page.locator('#code-db-save').isVisible(),false);
 assert.equal(await run('python',"import math, json, hashlib\nprint(input())\nprint(math.factorial(6))\nprint('中文线索🧩')\nprint(hashlib.sha256(b'abc').hexdigest())",'clue'),'clue\n720\n中文线索🧩\nba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad\n');
 assert.equal(await run('python',"import js\nprint(hasattr(js,'fetch'),hasattr(js,'navigator'))\nimport pyodide_js\ntry:\n pyodide_js.runPython.constructor(\"return import('https://blocked.invalid/probe.js')\")()\nexcept Exception:\n print('blocked')"),'False False\nblocked\n');
 assert.equal(await run('javascript','print(typeof window,typeof fetch,typeof Worker,typeof process);'),'undefined undefined undefined undefined\n');
 assert.equal(await run('lua','print(type(os.execute),type(io.popen))'),'nil\tnil\n');
 // Single steps operate on the upstream VM; the first step increments the first cell.
 await select('brainfuck','+++.');await page.click('#code-step');await page.waitForFunction(()=>document.getElementById('code-status').textContent.includes('已暂停'));assert.equal(await page.locator('.code-cell.is-current strong').textContent(),'1');await page.click('#code-step');await page.waitForFunction(()=>document.querySelector('.code-cell.is-current strong').textContent==='2');await page.click('#code-run');await wait();assert.equal(await output(),'\u0003');
 // File input preserves whitespace bytes; visualisation does not alter source.
 await select('whitespace','');await page.locator('#code-file').setInputFiles({name:'clue.ws',mimeType:'text/plain',buffer:Buffer.from(ws)});await page.waitForFunction(()=>document.getElementById('code-source').value.includes('\t'));if(!(await page.locator('#code-whitespace').evaluate(e=>e.open)))await page.locator('#code-whitespace summary').click();await page.waitForFunction(()=>document.getElementById('code-visible').textContent.includes('→'));assert.match(await page.locator('#code-visible').textContent(),/→/);assert.equal(await page.inputValue('#code-source'),ws);pending=page.waitForEvent('download');await page.click('#code-save-source');assert.equal(await readFile(await(await pending).path(),'utf8'),ws);
 // Error result and HTML-looking program output remain inert text.
 await select('brainfuck','[');await page.click('#code-run');await wait();assert.match(await page.locator('#code-status').textContent(),/执行失败/);assert.match(await page.locator('#code-error').textContent(),/方括号/);
 await run('javascript',`print('<img src=x onerror="window.injected=true">')`);assert.equal(await page.evaluate(()=>window.injected),undefined);assert.equal(await page.locator('#panel-code img').count(),0);
 await select('python','1/0');await page.click('#code-run');await wait();assert.match(await page.locator('#code-error').textContent(),/ZeroDivisionError/);
 // A user change and stop both terminate the previous worker, preventing stale results.
 await select('javascript','while(true){}');await page.click('#code-run');await page.waitForFunction(()=>document.getElementById('code-status').textContent==='正在运行…');await page.click('#code-stop');assert.match(await page.locator('#code-status').textContent(),/已停止/);assert.equal(await page.locator('#code-run').isEnabled(),true);
 await select('python','while True: pass');await page.click('#code-run');await page.fill('#code-source','print(7)');assert.equal(await output(),'');assert.equal(await page.locator('#code-stop').isDisabled(),true);await page.click('#code-run');await wait();assert.equal(await output(),'7\n');
 await select('javascript',"print('x'.repeat(300000))");await page.click('#code-run');await wait();assert.match(await page.locator('#code-error').textContent(),/256 KB/);
 await select('javascript','while(true){}');await page.click('#code-run');await wait();assert.match(await page.locator('#code-status').textContent(),/执行失败|已停止/);assert.equal(await page.locator('#code-run').isEnabled(),true);
 await run('javascript','print("QUJDSA==")');assert.equal(await output(),'QUJDSA==\n');assert.equal(await page.locator('#code-chef').count(),0);await page.evaluate(()=>location.hash='home');await page.waitForSelector('#panel-home:not([hidden])');
 await page.evaluate(()=>location.hash='code');await page.waitForSelector('#panel-code:not([hidden])');assert.equal(await page.inputValue('#code-source'),'print("QUJDSA==")');
 // Mobile symbols, source drafts, viewport bounds, help and provenance.
 await select('python','abc');await page.locator('#code-source').focus();await page.locator('#code-source').evaluate(e=>{e.setSelectionRange(3,3);e.dispatchEvent(new Event('select'));});await page.locator('#code-keypad button').filter({hasText:/^Tab$/}).click();assert.equal(await page.inputValue('#code-source'),'abc\t');
 for(const width of [320,390,768,1365]){await page.setViewportSize({width,height:900});for(const lang of ['python','brainfuck','whitespace','sql']){await chooseLanguage(lang);const bounds=await page.locator('#panel-code').evaluate((root,w)=>({scroll:document.documentElement.scrollWidth,bad:[...root.querySelectorAll('button,input,textarea,select')].filter(e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height||r.left>=-.5&&r.right<=w+1)return false;for(let host=e.parentElement;host&&host!==root.parentElement;host=host.parentElement){const box=host.getBoundingClientRect();if(['auto','scroll'].includes(getComputedStyle(host).overflowX)&&host.scrollWidth>host.clientWidth&&box.left>=-.5&&box.right<=w+1)return false;}return true;}).map(e=>e.id)}),width);assert.ok(bounds.scroll<=width+1,`${width} ${lang} scroll ${bounds.scroll}`);assert.deepEqual(bounds.bad,[],`${width} ${lang}`);}await chooseLanguage('brainfuck');await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});await page.screenshot({path:`/tmp/arg-code-${width}.png`,fullPage:true});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=391),'200% text');
 assert.equal(await page.locator('#panel-code .tool-provenance').evaluate(e=>e===e.parentElement.lastElementChild),true);
 assert.equal(await page.locator('iframe').count(),0);assert.equal(appPages(context).length,1);assert.deepEqual({external,missing,errors},{external:[],missing:[],errors:[]});
 console.log('PASS: ten real runtimes, stdin/Unicode, SQL import/export/reset, single steps, preserved whitespace, JS/Python/Lua access restrictions, output/time limits, stop/invalidation, removed chain shortcut, mobile keypad, four viewports and 200% text.');
}finally{await browser.close();}
