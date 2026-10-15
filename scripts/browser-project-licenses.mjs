import {appPages} from './browser-host.mjs';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {PROJECT_LICENSES,projectLicense} from '../public/project-licenses.js';
import {go} from './browser-navigation.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const context=await browser.newContext({viewport:{width:1365,height:900}}),errors=[],missing=[],external=[];
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='arg.test'){external.push(u.href);return route.abort();}try{const p=resolve('public','.'+(u.pathname==='/'?'/index.html':u.pathname));await route.fulfill({body:await readFile(p),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.woff2':'font/woff2'})[extname(p)]||'text/plain'});}catch{missing.push(u.pathname);await route.abort();}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://arg.test/#about');await page.waitForSelector('#panel-about:not([hidden])');
 assert.equal(await page.locator('.brand svg,.brand img,.brand-symbol,.brand-mark').count(),0);
 assert.equal(await page.locator('#panel-about .tool-provenance,#panel-extract .tool-provenance').count(),0,'本站自写页面不展示空来源栏或浏览器接口');
 await page.locator('.about-credits > summary').click();
 assert.equal(await page.locator('.resource-card').count(),PROJECT_LICENSES.length);
 const footers=await page.locator('.tool-provenance a').evaluateAll(links=>links.map(link=>({url:link.href,license:link.closest('li,p')?.dataset.license,text:link.closest('li,p')?.textContent})));
 for(const f of footers){assert.notEqual(new URL(f.url).hostname,'developer.mozilla.org','浏览器接口不是工具项目来源');const p=projectLicense(f.url);assert.ok(p,'Unregistered '+f.url);assert.ok(f.text.includes(p.license),'Missing license '+f.url);}
 await page.evaluate(async()=>{
  const {Box,Provenance}=await import('./ui/index.js'),{mountProjectSources}=await import('./project-sources.js');
  const check=(condition,message)=>{if(!condition)throw Error(message);};
  const own=Provenance({className:'tool-provenance',items:[['浏览器 API','https://developer.mozilla.org/zh-CN/docs/Web/API','本站实现']]}),mixed=Provenance({className:'tool-provenance',items:[['CyberChef','https://github.com/gchq/CyberChef','真实运算引擎'],['浏览器 API','https://developer.mozilla.org/zh-CN/docs/Web/API','本站界面']]}),unknown=Provenance({className:'tool-provenance',items:[['未登记项目','https://example.test/project','待核对']]}),empty=Provenance({className:'tool-provenance',items:[]});
  const host=Box({children:[own,mixed,unknown,empty,Box({id:'panel-about',children:Box({className:'resource-grid'})})]});mountProjectSources(host);
  check(!host.contains(own)&&!host.contains(empty),'纯原生及空来源栏应删除');
  check(host.contains(mixed)&&mixed.querySelectorAll('a').length===1&&mixed.textContent.includes('Apache-2.0'),'混合来源保留真实项目与许可');
  check(host.contains(unknown)&&unknown.querySelector('p').dataset.license==='missing','未登记外部项目必须继续报告缺失许可');
  check(!host.querySelector('.tool-provenance a[href*="developer.mozilla.org"]'),'共用来源层移除浏览器接口条目');
 });
 for(const project of PROJECT_LICENSES){const card=page.locator(`.resource-card[data-project="${project.url}"]`);assert.ok((await card.locator('.project-license').textContent()).includes(project.license));await card.locator('summary').click();await page.waitForFunction(url=>document.querySelector(`.resource-card[data-project="${url}"] pre`),project.url);assert.equal(await card.locator('pre').count(),project.notices.length);for(const [index,path]of project.notices.entries())assert.equal(await card.locator('pre').nth(index).textContent(),await readFile(resolve('public',path),'utf8'));await card.locator('summary').click();}
 for(const width of [320,390,768,1365]){await page.setViewportSize({width,height:900});await go(page,'about');await page.locator('.resource-card details').first().locator('summary').click();assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w+1,width));await page.locator('.resource-card details').first().locator('summary').click();await page.screenshot({path:`/tmp/arg-licenses-${width}.png`,fullPage:true});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=391));
 assert.equal(appPages(context).length,1);assert.deepEqual({errors,missing,external},{errors:[],missing:[],external:[]});console.log(`PASS: ${PROJECT_LICENSES.length} source cards, ${footers.length} footer source links, all bundled license originals, no brand icon, four widths and 200% text.`);
}finally{await browser.close();}
