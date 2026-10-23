import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {chooseNativeTask} from './browser-navigation.mjs';

const {chromium}=createRequire(new URL('../test-tools/package.json',import.meta.url))('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml','.py':'text/plain','.gz':'application/gzip'};

// Resolve legacy member IDs through the production registry, including the
// canonical topic and its exact registered native variant.
async function openTask(page,id){
 await chooseNativeTask(page,id);
}

async function runWords(page){
 await page.locator('#word-run').click();
 await page.waitForFunction(()=>{
  const status=document.getElementById('word-status').textContent;
  return status&&!status.startsWith('正在加载');
 },null,{timeout:45000});
 assert.match(await page.locator('#word-status').textContent(),/^找到/,'the real query must complete successfully');
 return page.locator('#word-output').inputValue();
}

try{
 for(const profile of [
  {name:'PC',viewport:{width:1365,height:1000},reducedMotion:'no-preference'},
  {name:'phone',viewport:{width:390,height:844},reducedMotion:'reduce',isMobile:true,hasTouch:true}
 ]){
  const {name,...options}=profile,ctx=await browser.newContext(options),failures=[],external=[],errors=[];
  await ctx.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.hostname!=='arg-tools.test'){external.push(url.href);await route.abort();return;}
   const path=resolve('public','.'+url.pathname+(url.pathname.endsWith('/')?'index.html':''));
   try{await route.fulfill({body:await readFile(path),contentType:types[extname(path)]||'application/octet-stream'});}
   catch{failures.push(url.pathname);await route.fulfill({status:404,body:'missing'});}
  });
  const page=await ctx.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  try{
   await page.goto('https://arg-tools.test/index.html#words?task=native%3Awords');
   await page.waitForSelector('#panel-words:not([hidden])');
   assert.equal(await page.locator('#panel-words').isVisible(),true);
   await openTask(page,'native:words');
   assert.equal(await page.locator('#word-mode').inputValue(),'anagram');
   await page.locator('#word-query').fill('silent');
   assert.match(await runWords(page),/listen/);
   console.log(name+': English anagram passed');

   await openTask(page,'native:words-letters');
   await page.locator('#word-query').fill('ab');
   await page.locator('#word-custom').fill('abba cab ba');
   const letters=await runWords(page);
   assert.deepEqual(letters.split('\n'),['abba','ba'],'a real allowed-letter query keeps repeated allowed letters, excludes disallowed letters and supplies the engine callback');
   console.log(name+': Allowed-letter matching passed');

   await openTask(page,'native:words-chinese');
   assert.equal(await page.locator('#word-english').isVisible(),false);
   await page.locator('#chinese-query').fill('{h4}{h5}{h10}{h14}');
   assert.match(await runWords(page),/风平浪静/);
   console.log(name+': Chinese stroke matching passed');

   await openTask(page,'native:word-grid');
   assert.equal(await page.locator('#word-grid-mode').inputValue(),'straight');
   await page.locator('#word-grid-input').fill('CAT\nARE\nTEN');
   await page.locator('#word-custom').fill('cat\nare\nten');
   assert.match(await runWords(page),/cat/);
   console.log(name+': Word Search passed');

   await openTask(page,'native:extract-first');
   assert.equal(await page.locator('#extract-mode').inputValue(),'first');
   await page.locator('#extract-input').fill('ALPHA\nBRAVO\nCHARLIE');
   await page.locator('#extract-run').click();
   assert.equal(await page.locator('#extract-output').inputValue(),'ABC');
   console.log(name+': Answer extraction passed');

   console.log(JSON.stringify({scope:name,failures,external,errors}));
   assert.equal(external.length,0);assert.equal(failures.length,0);assert.equal(errors.length,0);
  }finally{await ctx.close();}
 }
}finally{await browser.close();}
