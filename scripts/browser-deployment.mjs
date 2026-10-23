import {chooseNativeTask} from './browser-navigation.mjs';
// Serve built files over real HTTP. No route.fulfill, local source fallback or CDN.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const directory=resolve(process.env.ARG_DEPLOYMENT_DIRECTORY||'dist');
assert((await stat(resolve(directory,'index.html'))).isFile(),'Run npm run build first');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css','.wasm':'application/wasm','.woff2':'font/woff2','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.gz':'application/gzip'};
const missing=[];
const server=createServer(async(request,response)=>{
 let pathname;
 try{
  pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  const local=pathname.startsWith('/toolbox/')?pathname.slice('/toolbox/'.length):pathname.slice(1);
  const file=resolve(directory,local||'index.html');
  assert(file.startsWith(directory+sep));
  const body=await readFile(file);
  response.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  response.end(body);
 }catch{missing.push(pathname);if(!response.headersSent)response.writeHead(404);response.end('Not found');}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin='http://127.0.0.1:'+server.address().port;
const {chromium}=createRequire(import.meta.url)('playwright');
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [prefix,width,motion]of [['/',1440,'no-preference'],['/',390,'reduce'],['/toolbox/',1440,'reduce'],['/toolbox/',390,'no-preference']]){
  const context=await browser.newContext({viewport:{width,height:950},reducedMotion:motion}),errors=[],external=[],escaped=[],failed=[];
  await context.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(!['http:','https:'].includes(url.protocol))return route.continue();
   if(url.origin!==origin){external.push(url.origin+url.pathname);return route.abort();}
   if(!url.pathname.startsWith(prefix))escaped.push(url.pathname);
   return route.continue();
  });
  context.on('requestfailed',request=>failed.push(request.url()));
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+prefix);await page.waitForSelector('#panel-home:not([hidden])');
  await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>document.fonts.check('400 16px "JetBrains Mono"','ARG')));
  const encoded=await page.evaluate(async()=>{
   const {CyberChefClient}=await import('./cyberchef-client.js');const client=new CyberChefClient();
   try{await client.ready;const answer=await client.bake('ARG deploy 123',[{op:'To Base64',args:['A-Za-z0-9+/=']}]);return new TextDecoder().decode(answer.bytes);}finally{client.close();}
  });
  assert.equal(encoded,Buffer.from('ARG deploy 123').toString('base64'));
  const go=async id=>{await page.evaluate(id=>location.hash=id,id);await page.waitForSelector('#panel-'+id+':not([hidden])');};
  await go('countries');await page.locator('#countries-query').fill('中国');await page.locator('#countries-run').click();
  await page.waitForFunction(()=>document.getElementById('countries-status').textContent==='查询完成');
  assert.match(await page.locator('#countries-results').textContent(),/CNY/);
  await page.waitForFunction(()=>document.querySelector('#countries-results img')?.naturalWidth>0);
  await go('code');const language=width===1440?'python':'javascript',id='native:code-'+language;
  await chooseNativeTask(page,id);
  await page.waitForFunction(language=>document.getElementById('code-language').value===language,language);
  await page.locator('#code-source').fill(language==='python'?"print('deploy', 6 * 7)":"print('deploy', 6 * 7);");
  await page.locator('#code-run').click();
  await page.waitForFunction(()=>/运行完成|失败|超时/.test(document.getElementById('code-status').textContent),null,{timeout:65000});
  assert.match(await page.locator('#code-status').textContent(),/运行完成/,await page.locator('#code-error').textContent());
  assert.equal(await page.locator('#code-output').inputValue(),'deploy 42\n');
  if(width===1440){
   await go('video');await page.locator('#video-file').setInputFiles('tests/fixtures/hunt-video.mp4');await page.locator('#video-run').click();
   await page.waitForFunction(()=>/完成|失败/.test(document.getElementById('video-status').textContent),null,{timeout:120000});
   assert.match(await page.locator('#video-status').textContent(),/完成/);assert.equal(await page.locator('#video-results img').count(),1);
   await page.waitForFunction(()=>document.querySelector('#video-results img')?.naturalWidth>0);
  }
  if(width===1440){
   await chooseNativeTask(page,'native:qalculate');await page.locator('#qalculate-expression').fill('6*7');await page.locator('#qalculate-run').click();
   await page.waitForFunction(()=>!document.getElementById('qalculate-download').disabled,null,{timeout:60000});assert.match(await page.locator('#qalculate-output').textContent(),/42/);
   await go('notebook');await page.locator('#notebook-new').click();await page.locator('#notebook-title').fill('部署测试笔记');
   const editor=page.locator('#notebook-editor .vditor-ir [contenteditable="true"]');await editor.fill('仅在本机保存的部署验证记录');
   await page.waitForFunction(()=>document.getElementById('notebook-status').textContent.includes('已保存'));assert.equal(await page.locator('#notebook-title').inputValue(),'部署测试笔记');
  }
  await go('about');assert.ok(await page.locator('#about-source').isVisible());
  if(!await page.locator('#report-problem').isVisible())await page.getByRole('button',{name:'切换工具侧栏',exact:true}).click();
  await page.locator('#report-problem').click();assert.equal(await page.locator('#report-send').count(),0);
  assert.ok((await page.locator('#report-dialog').textContent()).includes('报告只保留在本机'));
  await page.locator('#report-dialog button').filter({hasText:'关闭'}).click();
  if(await page.locator('.workbench-drawer').evaluate(dialog=>dialog.open))await page.keyboard.press('Escape');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(escaped,[]);assert.deepEqual(failed,[]);
  console.log(`PASS real HTTP ${prefix}, ${width}px, ${motion}: local fonts, Chef output, country data/flag, ${language} WASM, ${width===1440?'FFmpeg frame, ':''}local report; no missing/external resources or page errors.`);
  await context.close();
 }
 assert.deepEqual(missing,[]);
 console.log('PASS built distribution served only from '+directory);
}finally{await browser?.close();await new Promise(done=>server.close(done));}
