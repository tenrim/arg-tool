import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{for(const reducedMotion of ['no-preference','reduce']){
 const context=await browser.newContext({viewport:{width:1440,height:950},hasTouch:true,reducedMotion}),errors=[],external=[],missing=[];
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}
  try{const path=resolve('public','.'+(url.pathname==='/'?'/index.html':url.pathname));await route.fulfill({body:await readFile(path),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.woff2':'font/woff2'})[extname(path)]||'application/octet-stream'});}
  catch{missing.push(url.pathname);await route.abort();}
 });
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 await page.goto('https://arg.test/#code?task=native%3Acode-python');
 await page.waitForFunction(()=>document.querySelector('#panel-code:not([hidden])')&&document.getElementById('code-language')?.value==='python');
 const choose=async language=>{
  const id=language==='brainfuck'?'native:code':'native:code-'+language;
  await page.evaluate(id=>document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id}})),id);
  await page.waitForFunction(({id,language})=>document.querySelector('#panel-code:not([hidden]) .capability-workspace-context')?.dataset.currentCapability==='topic:code-runner'&&new URLSearchParams(location.hash.split('?')[1]).get('view')===id&&document.getElementById('code-language').value===language,{id,language});
 };
 const recording=page.locator('#code-result-notebook'),graphics=page.locator('#code-result-graphics');
 assert.equal(await recording.count(),1,'one independently owned notebook action');assert.equal(await graphics.count(),1);assert(await recording.isDisabled());assert(await graphics.isDisabled());
 assert.equal(await page.locator('#panel-code [data-continue-result],#code-chef').count(),0,'retired generic transfer and chain shortcuts stay removed');
 const run=async(language,source)=>{await choose(language);await page.fill('#code-source',source);await page.click('#code-run');await page.waitForFunction(()=>document.getElementById('code-status').textContent.includes('运行完成'));};
 const assets=()=>page.evaluate(async()=>{const {createNotebookStore}=await import('./notebook/store.js');const store=createNotebookStore();try{return(await store.list()).flatMap(note=>note.assets).map(asset=>({name:asset.name,mime:asset.mime,bytes:[...asset.bytes]}));}finally{store.close();}});
 const saveResult=async(index='0')=>{await recording.focus();await page.keyboard.press('Enter');await page.locator('#notebook-capture-save:enabled').waitFor();if(index!=='0'){await page.locator('#notebook-result-file').selectOption(index);await page.locator('#notebook-capture-save:enabled').waitFor();}await page.locator('#notebook-capture-save').click();await page.waitForFunction(()=>document.getElementById('notebook-capture-status').textContent==='已加入笔记本');await page.keyboard.press('Escape');};
 const sourceByLanguage={
  python:['https://github.com/pyodide/pyodide','Pyodide：MPL-2.0；CPython：PSF 及历史许可'],
  brainfuck:['https://github.com/nilaymaj/esolang-park','MIT'],
  sql:['https://github.com/sql-js/sql.js','sql.js：MIT；SQLite：公有领域'],
 };
 const assertSources=async language=>{
  const footer=page.locator('#panel-code>.tool-provenance');
  assert.equal(await footer.count(),1,language+' footer must exist');assert.equal(await footer.isVisible(),true);
  assert.deepEqual(await footer.locator('a').evaluateAll(links=>links.map(link=>link.href)),[sourceByLanguage[language][0]],language+' lists only the actual language engine');
  assert.deepEqual(await footer.locator('li').evaluateAll(rows=>rows.map(row=>row.dataset.license)),[sourceByLanguage[language][1]]);
  assert.equal(await footer.evaluate(node=>node===node.parentElement.lastElementChild),true);
 };
 await assertSources('python');
 await page.evaluate(()=>{window.codeOriginalNodes=Object.fromEntries(['code-language','code-source','code-input','code-file','code-db-file','code-run','code-step','code-pause','code-stop'].map(id=>[id,document.getElementById(id)]));});
 assert.equal(await page.locator('#panel-code .code-settings').count(),0,'retired settings wrapper is removed at composition');
 assert.equal(await page.locator('#panel-code .workspace-region-heading').filter({hasText:'运行设置'}).count(),0,'no empty settings region is generated');
 assert.equal(await page.locator('#code-toolbar[data-ui=toolbar] #code-file-actions[data-ui=toolbar]').count(),1);
 assert.equal(await page.locator('#code-toolbar[data-ui=toolbar] #code-actions[data-ui=toolbar]').count(),1);
 assert.equal(await page.locator('#code-source-picker[data-ui=file-picker] #code-file').count(),1);
 assert.equal(await page.locator('#code-database-picker[data-ui=file-picker] #code-db-file').count(),1);
 assert.equal(await page.locator('#code-source-picker [data-ui=file-name],#code-database-picker [data-ui=file-name]').count(),0);
 assert.equal(await page.locator('#code-source-picker').getByRole('button',{name:'打开代码',exact:true}).getAttribute('data-ui'),'button');
 const sourceText='print("线索🧩")\n\t# 保留原始空白\n';
 await page.fill('#code-input','玩家输入');
 const chooserPromise=page.waitForEvent('filechooser');
 await page.locator('#code-source-picker button').focus();await page.keyboard.press('Enter');
 await (await chooserPromise).setFiles({name:'clue.py',mimeType:'text/plain',buffer:Buffer.from(sourceText)});
 await page.waitForFunction(source=>document.getElementById('code-source').value===source,sourceText);
 assert.equal(await page.inputValue('#code-input'),'玩家输入');
 const saved=page.waitForEvent('download');await page.click('#code-save-source');assert.equal(await readFile(await(await saved).path(),'utf8'),sourceText);
 await choose('brainfuck');assert.equal(await page.locator('#code-inspector').isVisible(),true);assert.equal(await page.locator('#code-step').isVisible(),true);assert.equal(await page.locator('#code-pause').isVisible(),true);
 if(reducedMotion==='no-preference'){
  await page.fill('#code-source','+++.');await page.click('#code-step');
  await page.waitForFunction(()=>document.getElementById('code-status').textContent.includes('已暂停'));
  assert.equal(await page.locator('.code-cell.is-current strong').textContent(),'1');
  await page.click('#code-stop');assert.match(await page.locator('#code-status').textContent(),/已停止/);assert.equal(await page.locator('#code-run').isEnabled(),true);
  assert(await recording.isDisabled());assert(await graphics.isDisabled());
 }
 // Both destinations read the real completed output lease. Saving retains the
 // complete text beyond the dialog preview and SQL beyond its 100-row table.
 const longText='线索 A-Z == != 🧩\n'.repeat(80);
 await run('javascript','print('+JSON.stringify(longText)+')');await saveResult();
 let savedAssets=await assets();assert.equal(Buffer.from(savedAssets.find(asset=>asset.name==='JavaScript 运行结果.txt').bytes).toString(),longText+'\n');
 assert(await recording.isEnabled());assert(await graphics.isEnabled());
 await recording.click();await page.locator('#notebook-capture-save:enabled').waitFor();
 await page.locator('#code-input').evaluate(input=>{input.value='changed';input.dispatchEvent(new Event('input',{bubbles:true}));});
 assert(await recording.isDisabled());assert(await graphics.isDisabled());assert.equal(await page.locator('#code-status').textContent(),'','editing clears the old status without a routine notice');await page.locator('#notebook-capture-save').click();assert.match(await page.locator('#notebook-capture-status').textContent(),/失效|改变/);await page.keyboard.press('Escape');assert.equal((await assets()).length,savedAssets.length,'stale captured text cannot be recorded');
 await run('sql','CREATE TABLE clue(clue_number INTEGER, label TEXT); WITH RECURSIVE n(value) AS (VALUES(1) UNION ALL SELECT value+1 FROM n WHERE value<105) INSERT INTO clue SELECT value, \'线索\' FROM n; SELECT * FROM clue;');
 assert.equal(await page.locator('#code-sql-results tbody tr').count(),100,'SQL rendering is a bounded preview');await saveResult();
 savedAssets=await assets();const sqlSaved=JSON.parse(Buffer.from(savedAssets.find(asset=>asset.name==='SQL 查询结果.json').bytes).toString());
 assert.deepEqual(sqlSaved.tables[0].columns,['clue_number','label']);assert.equal(sqlSaved.tables[0].rows.length,105);assert.deepEqual(sqlSaved.tables[0].rows.at(-1),[105,'线索']);assert.equal(sqlSaved.output,await page.inputValue('#code-output'));
 await saveResult('1');savedAssets=await assets();assert.equal(Buffer.from(savedAssets.find(asset=>asset.name==='运行结果.sqlite').bytes).subarray(0,16).toString(),'SQLite format 3\0','SQL database is an explicit full attachment');
 await graphics.click();await page.locator('#graphic-start:enabled').waitFor();assert.deepEqual(await page.locator('#graphic-result-file option').allTextContents(),['SQL 查询结果.json','运行结果.sqlite']);assert.match(await page.locator('#graphic-picker .graphic-capture-preview').textContent(),/clue_number/);
 await page.locator('#code-source').evaluate(source=>{source.value='SELECT 1;';source.dispatchEvent(new Event('input',{bubbles:true}));});assert(await recording.isDisabled());await page.locator('#graphic-start').click();assert.match(await page.locator('#graphic-picker-status').textContent(),/变化|失效/);await page.keyboard.press('Escape');
 await run('javascript','print("complete");');await choose('python');assert(await recording.isDisabled());assert(await graphics.isDisabled());
 await choose('javascript');await page.fill('#code-source','print("partial"); while(true){}');await page.click('#code-run');await page.waitForFunction(()=>document.getElementById('code-status').textContent==='正在运行…');await page.click('#code-stop');assert(await recording.isDisabled());assert(await graphics.isDisabled());
 await page.fill('#code-source','throw new Error("failed");');await page.click('#code-run');await page.waitForFunction(()=>document.getElementById('code-status').textContent.includes('执行失败'));assert(await recording.isDisabled());assert(await graphics.isDisabled());
 await run('javascript','print("leave");');await page.evaluate(()=>{location.hash='home';});await page.locator('#panel-home').waitFor({state:'visible'});assert(await recording.isDisabled());assert(await graphics.isDisabled());await choose('python');
 await choose('sql');assert.equal(await page.locator('#code-db-wrap').isVisible(),true);assert.equal(await page.locator('#code-inspector').isVisible(),false);assert.equal(await page.locator('#code-stdin-wrap').isVisible(),false);
 if(reducedMotion==='no-preference'){
  await page.fill('#code-source','CREATE TABLE clue(value); INSERT INTO clue VALUES (42); SELECT value FROM clue;');await page.click('#code-run');
  await page.waitForFunction(()=>document.getElementById('code-status').textContent.includes('运行完成'));
  assert.equal(await page.inputValue('#code-output'),'[42]\n');
  const databaseDownload=page.waitForEvent('download');await page.click('#code-db-save');const bytes=await readFile(await(await databaseDownload).path());
  const databaseChooser=page.waitForEvent('filechooser');await page.locator('#code-database-picker button').click();
  await(await databaseChooser).setFiles({name:'clue.sqlite',mimeType:'application/vnd.sqlite3',buffer:bytes});
  await page.waitForFunction(()=>document.getElementById('code-db-info').textContent.includes('clue.sqlite'));
  await page.click('#code-db-clear');assert.equal(await page.locator('#code-db-info').textContent(),'空数据库');
 }
 await choose('python');assert.equal(await page.inputValue('#code-source'),sourceText);assert.equal(await page.inputValue('#code-input'),'玩家输入');assert.equal(await page.locator('#code-inspector').isVisible(),false);assert.equal(await page.locator('#code-db-wrap').isVisible(),false);assert.equal(await page.locator('#code-step').isVisible(),false);
 for(const width of [320,390,800,1440]){
  await page.setViewportSize({width,height:950});
  for(const language of ['python','brainfuck','sql']){
   await choose(language);await assertSources(language);
   const geometry=await page.locator('#panel-code').evaluate((panel,width)=>{
    const visible=element=>element.getClientRects().length>0;
    const buttons=[...panel.querySelectorAll('#code-toolbar button,#code-db-actions button,.code-result-actions button')].filter(visible);
    const rects=buttons.map(button=>{const rect=button.getBoundingClientRect();return {name:button.textContent,x:rect.x,y:rect.y,right:rect.right,bottom:rect.bottom,width:rect.width,height:rect.height};});
    const overlaps=[];for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const a=rects[i],b=rects[j];if(Math.min(a.right,b.right)-Math.max(a.x,b.x)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>.5)overlaps.push([a.name,b.name]);}
    const source=panel.querySelector('#code-source'),toolbar=panel.querySelector('#code-toolbar');
    return {scroll:document.documentElement.scrollWidth,rects,overlaps,toolbarBeforeSource:Boolean(toolbar.compareDocumentPosition(source)&Node.DOCUMENT_POSITION_FOLLOWING),sameNodes:Object.entries(window.codeOriginalNodes).every(([id,node])=>node===document.getElementById(id)),width};
   },width);
   assert.ok(geometry.scroll<=width+1,`${language}@${width} page overflow`);assert.deepEqual(geometry.overlaps,[],`${language}@${width} overlapping actions`);assert.equal(geometry.toolbarBeforeSource,true);assert.equal(geometry.sameNodes,true);
   for(const rect of geometry.rects){assert.ok(rect.x>=-.5&&rect.right<=width+1,`${language}@${width} clipped ${rect.name}`);assert.ok(rect.height>=(width<1100?43:39),`${language}@${width} short ${rect.name}: ${rect.height}`);}
   const open=geometry.rects.find(rect=>rect.name==='打开代码'),save=geometry.rects.find(rect=>rect.name==='保存代码');assert.ok(Math.abs(open.height-save.height)<=1,`${language}@${width} file actions have different heights`);
  }
  if([390,1440].includes(width)){
   await page.waitForFunction(()=>document.getAnimations().every(animation=>animation.playState!=='running'&&!animation.pending));
   await page.screenshot({path:resolve(tmpdir(),`mist-code-layout-${reducedMotion}-${width}.png`),fullPage:true});
  }
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 for(const language of ['python','brainfuck','sql']){await choose(language);await assertSources(language);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=391),language+' at 200% text');}
 assert.equal(await page.locator('#panel-code .tool-provenance').evaluate(footer=>footer===footer.parentElement.lastElementChild),true);
 assert.deepEqual({errors,external,missing},{errors:[],external:[],missing:[]});
 console.log(`PASS ${reducedMotion}: real code output notebook capture, full SQL columns/105 rows/database, graphics result choices and stale lease rejection, stop/error/task/leave invalidation, keyboard, exact task licenses, preserved nodes/drafts/stdin and non-overlapping result actions at 320/390/800/1440 and 200% text${reducedMotion==='no-preference'?', real Brainfuck single-step and SQL file export/import/reset':''}.`);
 await context.close();
}}finally{await browser.close();}
