import {tmpdir as testTmpdir} from 'node:os';
import {go} from './browser-navigation.mjs';
import {createRequire} from 'node:module';import {readFile} from 'node:fs/promises';import {resolve,extname} from 'node:path';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try {
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='arg-tools.test'){await route.abort();return;}const file=resolve('public','.'+(url.pathname==='/'?'/index.html':url.pathname));const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.json':'application/json','.svg':'image/svg+xml'};try{await route.fulfill({body:await readFile(file),contentType:types[extname(file)]||'application/octet-stream'});}catch{await route.abort();}});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('https://arg-tools.test/#image');await page.evaluate(()=>document.fonts.ready);
 assert.deepEqual(await page.locator('.rail-group').evaluateAll(nodes=>nodes.map(n=>n.dataset.group)),['codec','reference','media','other','knowledge']);
 assert.equal(await page.locator('#image-ocr,#pz-solve,[data-tool=cspuz]').count(),0);
 await page.locator('.workbench-menu').click();await page.waitForFunction(()=>document.activeElement===document.querySelector('.rail-close'));await page.keyboard.press('Escape');await page.locator('.workbench-drawer').waitFor({state:'hidden'});await page.waitForSelector('.workbench-menu[aria-expanded="false"]');
 const imageTask=async engine=>{const ids={basic:'native:image',aperi:'native:image-planes',steg:'native:image-steg',inspect:'native:image-exif'};await page.evaluate(id=>document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id}})),ids[engine]);await page.waitForSelector('[data-current-capability="'+ids[engine]+'"]',{state:'attached'});assert.equal(await page.locator('#panel-image').isVisible(),true);};
 const problems=[];
 async function bounds(label) {
  const value=await page.evaluate(expectedWidth=>{
   const outside=node=>{const r=node.getBoundingClientRect();return r.left < -1 || r.right > expectedWidth+1;};
   const clipped=[];
   for(const node of document.querySelectorAll('button,select,input:not([type=file]),textarea,a.primary-button,a.secondary-button')){
    if(!node.getClientRects().length||!node.getBoundingClientRect().width||!outside(node))continue;
    // A bounded horizontal toolbar intentionally exposes further controls by
    // scrolling. Verify actual reachability, not just its initial scroll offset.
    let scroller=node.parentElement;
    while(scroller&&!(scroller.scrollWidth>scroller.clientWidth&&/auto|scroll/.test(getComputedStyle(scroller).overflowX)))scroller=scroller.parentElement;
    if(scroller&&scroller!==document.documentElement&&scroller!==document.body&&!outside(scroller)){
     const left=scroller.scrollLeft;node.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
     if(outside(node))clipped.push(node.id||node.textContent.trim().slice(0,25));
     scroller.scrollLeft=left;
    }else clipped.push(node.id||node.textContent.trim().slice(0,25));
   }
   return {width:expectedWidth,scroll:document.documentElement.scrollWidth,clipped};
  },page.viewportSize().width);
  if(value.scroll>value.width+1||value.clipped.length)problems.push({label,...value});
 }
 for(const width of [320,390,430,768,667]) {
  await page.setViewportSize({width,height:width===667?375:844});
  for(const name of ['crypto','encoding','language','cyberchef','image','audio','file','symbols','about','words','video','extract']) {
   await go(page,name);await bounds(`${width} ${name}`);
   if(name==='image')for(const engine of ['basic','aperi','steg','inspect']){await imageTask(engine);await bounds(`${width} image ${engine}`);}
  }
 }
 await page.setViewportSize({width:390,height:844});await page.goto('https://arg-tools.test/#cyberchef');await page.waitForFunction(()=>document.getElementById('cyberchef-stage').dataset.ready==='true');
 await page.locator('#chef-import-recipe').setInputFiles({name:'mobile.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify([{op:'AES Decrypt',args:[]}]))});await page.waitForFunction(()=>document.querySelectorAll('.chef-step').length===1);await page.locator('#chef-tabs [role="tab"][data-pane=recipe]').click();
 await bounds('390 AES parameters');assert.ok(await page.locator('.chef-arg select').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=16));
 await page.evaluate(()=>window.scrollTo(0,800));assert.ok(await page.evaluate(()=>document.getElementById('chef-tabs').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom-1),'Sticky workspace tabs should stay below the header');
 await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0)});await page.screenshot({path:testTmpdir()+'/arg-mobile-chef-after.png',fullPage:true});
 await go(page,'image');await imageTask('steg');await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0)});await page.screenshot({path:testTmpdir()+'/arg-mobile-image-after.png',fullPage:true});
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 for(const name of ['crypto','encoding','language','cyberchef','image','audio','file','symbols','about','words','video','extract']){await bounds(`200% menu ${name}`);await go(page,name);await bounds(`200% ${name}`);if(name==='image')for(const engine of ['basic','aperi','steg','inspect']){await imageTask(engine);await bounds(`200% image ${engine}`);}}
 console.log(JSON.stringify({status:problems.length?'layout issues':'passed',problems,errors,checks:['touch/mobile 320,390,430,768 and landscape 667x375','remaining general tools and four image tabs','AES parameter font size','200% text enlargement at 390px']},null,2));assert.deepEqual(problems,[]);assert.deepEqual(errors,[]);
} finally {await browser.close();}
