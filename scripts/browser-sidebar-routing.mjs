import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import assert from 'node:assert/strict';

const {chromium} = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox','--disable-dev-shm-usage']});
const mime = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
try {
  for (const width of [390,1440]) for (const reducedMotion of ['reduce','no-preference']) {
    const context = await browser.newContext({viewport:{width,height:950},hasTouch:width<1100,reducedMotion});
    const errors=[],missing=[],external=[];
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if (['blob:','data:'].includes(url.protocol)) return route.continue();
      if (url.hostname!=='arg.test') {external.push(url.href);return route.abort();}
      try {const path=resolve('public',url.pathname.slice(1)||'index.html');await route.fulfill({body:await readFile(path),contentType:mime[extname(path)]||'application/octet-stream'});}
      catch {missing.push(url.pathname);await route.abort();}
    });
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await page.goto('https://arg.test/#home');
    await page.waitForFunction(()=>Number(document.querySelector('.rail-badge')?.textContent)>500);
    const openRail=async()=>{if(width<1100&&(await page.locator('.workbench-drawer').getAttribute('open'))===null)await page.locator('.workbench-menu').click();};
    await openRail();
    // A one-tool group must go straight to that real tool, never via browse.
    const colors=page.locator('.rail-groups [data-capability="native:colors"]');
    assert.equal(await colors.count(),1,'a concrete color tool is directly available in the sidebar');
    await colors.click();await page.locator('#panel-colors:not([hidden])').waitFor();
    assert.equal(await page.locator('#panel-browse').isVisible(),false);
    assert.equal(new URLSearchParams(page.url().split('?')[1]).get('task'),'native:colors');
    await openRail();
    await page.locator('.rail-groups [data-route="browse/reference"]').click();
    await page.locator('#panel-browse:not([hidden])').waitFor();
    assert.equal(new URL(page.url()).hash,'#browse/reference','only the category link opens its overview');
    await openRail();
    const encoding=page.locator('[data-rail-expand="encoding"]');
    await encoding.focus();await page.keyboard.press('Enter');
    assert.equal(await encoding.getAttribute('aria-expanded'),'true');
    assert.equal(new URL(page.url()).hash,'#browse/reference','expanding a sidebar group never navigates');
    await page.locator('.rail-groups [data-capability="pair:To%20Base64"]:visible').click();
    await page.waitForFunction(()=>document.querySelector('#ct-encoding')?.dataset.operation==='To Base64');
    await page.locator('#ct-encoding .ct-input').fill('谜题');await page.locator('#ct-encoding .ct-run').click();
    await page.waitForFunction(()=>document.querySelector('#ct-encoding .ct-status')?.textContent.includes('处理完成'),null,{timeout:45000});
    assert.equal(await page.locator('#ct-encoding .ct-output').inputValue(),Buffer.from('谜题').toString('base64'));
    await openRail();
    assert.equal(await page.locator('.rail-groups [data-capability="pair:To%20Base64"]').getAttribute('aria-current'),'page');
    await page.locator('.rail-filter input').fill('From Base64');
    const inverse=page.locator('.rail-groups [data-capability="pair:To%20Base64"]:visible');
    assert.equal(new URLSearchParams((await inverse.getAttribute('href')).split('?')[1]).get('op'),'From Base64');
    await inverse.click();await page.waitForFunction(()=>document.querySelector('#ct-encoding')?.dataset.operation==='From Base64');
    assert.equal(await page.locator('#ct-encoding .ct-input').inputValue(),'谜题','navigation preserves the source input');
    assert.equal(await page.locator('#ct-encoding .ct-output').count(),0,'direction change removes the stale result');
    if(width<1100)assert.equal(await page.locator('.workbench-drawer').getAttribute('open'),null);
    await openRail();await page.locator('.rail-filter input').fill('SM4');
    await page.locator('.rail-groups [data-capability="learn:function-pair:SM4%20Encrypt"]:visible').click();
    await page.locator('#knowledge-detail [data-knowledge-detail="function-pair:SM4%20Encrypt"]').waitFor();
    assert.equal(await page.locator('#panel-browse').isVisible(),false,'knowledge sidebar entries open the actual article');
    await openRail();await page.locator('.rail-filter input').fill('');
    assert.equal(await page.locator('[data-rail-expand="encoding"]').getAttribute('aria-expanded'),'true','search preserves browsing expansion');
    assert.equal(await page.locator('.rail-groups a[href^="#browse/"]').evaluateAll(nodes=>nodes.every(node=>node.getAttribute('href').split('/').length===2)),true,'no sidebar link opens a group overview');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});
    await context.close();console.log(`PASS sidebar ${width}/${reducedMotion}: direct native/engine/article routes, category overview, keyboard, direction and preserved input.`);
  }
} finally {await browser.close();}
