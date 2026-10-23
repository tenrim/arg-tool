import {toolPages,sitePages,capabilityCategories} from '../public/navigation.js';
import {appPages} from './browser-host.mjs';
import {createRequire} from 'node:module';
import {readFile,access} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),errors=[],external=[];
 await context.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname!=='arg.test'){external.push(u.href);return r.abort();}const f=resolve('public','.'+(u.pathname==='/'?'/index.html':u.pathname));try{await r.fulfill({body:await readFile(f),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.woff2':'font/woff2'})[extname(f)]||'application/octet-stream'});}catch{errors.push('Missing '+u.pathname);await r.abort();}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const go=async route=>{await page.evaluate(route=>location.hash=route,route);await page.waitForSelector('#panel-'+route.split(/[/?]/)[0]+':not([hidden])');await page.waitForTimeout(100);};
 await page.goto('https://arg.test/#fragments');await page.waitForSelector('#frag-files',{state:'attached'});
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=200;const x=c.getContext('2d');x.fillStyle='#fa1234';x.fillRect(0,0,200,200);return c.toDataURL().split(',')[1];});
 await page.locator('#frag-files').setInputFiles({name:'触控碎片.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await page.waitForFunction(()=>document.querySelector('#frag-select').options.length===1&&!document.querySelector('#frag-export').disabled);
 const state=()=>page.evaluate(async()=>{const {default:K}=await import('./vendor/round4/konva.js'),s=K.stages.find(s=>s.container().id==='frag-view'),n=s.find('Image')[0],r=s.container().getBoundingClientRect(),p=n.getAbsoluteTransform().point({x:n.width()/2,y:n.height()/2});return{x:n.x(),y:n.y(),rotation:n.rotation(),view:{x:s.x(),y:s.y(),scale:s.scaleX()},point:{x:r.left+s.container().clientLeft+p.x,y:r.top+s.container().clientTop+p.y}};});
 const cdp=await context.newCDPSession(page);
 async function gesture(points,moved){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points.map((p,i)=>({...p,id:i+1}))});for(let step=1;step<=5;step++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points.map((p,i)=>({x:p.x+(moved[i].x-p.x)*step/5,y:p.y+(moved[i].y-p.y)*step/5,id:i+1}))});}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(60);}
 await page.locator('#frag-view').scrollIntoViewIfNeeded();const original=await state();await gesture([original.point],[{x:original.point.x+30,y:original.point.y+20}]);let moved=await state();assert.ok(Math.abs(moved.x-original.x-30/original.view.scale)<2,'one-finger drag uses world coordinates');
 const p=moved.point;await gesture([{x:p.x-25,y:p.y},{x:p.x+25,y:p.y}],[{x:p.x-45,y:p.y+10},{x:p.x+45,y:p.y+10}]);const pinched=await state();assert.ok(pinched.view.scale>moved.view.scale*1.6,'pinch zoom');assert.equal(pinched.x,moved.x,'pinch does not move fragment');
 await page.locator('#frag-undo').click();const undone=await state();assert.equal(undone.x,original.x);assert.deepEqual(undone.view,pinched.view,'undo preserves viewport');await page.locator('#frag-redo').click();assert.equal((await state()).x,moved.x);
 await page.locator('#frag-lock').click();await page.locator('#frag-view').scrollIntoViewIfNeeded();const locked=await state();await gesture([locked.point],[{x:locked.point.x+20,y:locked.point.y+20}]);assert.equal((await state()).x,locked.x,'locked fragment cannot drag');assert.equal(await page.locator('#frag-rotate-right').isDisabled(),true);await page.locator('#frag-lock').click();
 await page.locator('#frag-rotate-right').click();assert.equal((await state()).rotation,15);await page.locator('#frag-undo').click();assert.equal((await state()).rotation,0);
 async function exported(){const pending=page.waitForEvent('download');await page.locator('#frag-export').click();return readFile(await(await pending).path());}
 const zoomed=await exported();await page.locator('#frag-fit').click();assert.deepEqual(await exported(),zoomed,'export independent of zoom/pan');assert.equal(zoomed.readUInt32BE(16),1000);assert.equal(zoomed.readUInt32BE(20),700);
 await page.screenshot({path:'/tmp/arg-fragments-touch.png',fullPage:true});
 const ids=await page.locator('.panel:not(.site-page)').evaluateAll(nodes=>nodes.map(node=>node.id.slice(6)));
 assert.deepEqual([...ids].sort(),toolPages.map(page=>page.route).sort(),'the complete original tool set is preserved');
 assert.deepEqual((await page.locator('.panel.site-page').evaluateAll(nodes=>nodes.map(node=>node.id.slice(6)))).sort(),[...sitePages.map(page=>page.route),'browse'].sort(),'category overview is a website page, separate from engine workspaces');
 for(const retired of ['graph','geometry','circuit'])for(const dir of ['public/round4','public/vendor/round4'])await assert.rejects(access(`${dir}/${retired}.js`));
 for(const retired of ['graph','circuit']){assert.ok(!ids.includes(retired));assert.equal(await page.locator(`[data-tab="${retired}"],a[href="#${retired}"]`).count(),0);await page.evaluate(id=>location.hash=id,retired);await page.waitForSelector('#panel-browse:not([hidden])');}
 assert.ok(ids.includes('geometry'),'the new practical geometry calculator retains its registered workspace');
 const overviews=capabilityCategories.map(category=>'browse/'+category.id);
 for(const [width,height]of [[320,844],[390,844],[768,1024],[844,390],[1280,900],[1440,1000],[1920,1080]]){await page.setViewportSize({width,height});for(const route of [...ids,...overviews]){await go(route);const dimensions=await page.evaluate(()=>({w:document.documentElement.scrollWidth,v:innerWidth}));assert.ok(dimensions.w<=width+1,`${route}@${width}: ${JSON.stringify(dimensions)}`);}console.log('PASS all',ids.length,'tool routes and five category overviews at',width,height);}
 await page.setViewportSize({width:1440,height:1000});
 async function sideBySide(id,left,right){await go(id);const panel=page.locator('#panel-'+id),a=await panel.locator(left).first().boundingBox(),b=await panel.locator(right).first().boundingBox();assert.ok(a&&b&&a.x+a.width<=b.x+2&&Math.abs(a.y-b.y)<180,`${id}: desktop columns ${JSON.stringify({a,b})}`);}
 await go('crypto');assert.equal(await page.locator('.ct-picker').count(),0,'Task workspace has no aggregate picker');await sideBySide('crypto','.ct-input-area','.ct-result-area');await sideBySide('fragments','.frag-stage-panel','.frag-inspector');await page.screenshot({path:'/tmp/arg-fragments-desktop.png',fullPage:true});await sideBySide('chess','.r4-chess','#r4-chess>.r4-box');await sideBySide('audio',':scope > .surface',':scope > .r2-pane:not([hidden])');await sideBySide('model','#model-view','#r4-model>.r4-box>.r4-row:nth-child(2)');
 await page.setViewportSize({width:390,height:844});await go('fragments');const a=await page.locator('.frag-stage-panel').boundingBox(),b=await page.locator('.frag-inspector').boundingBox();assert.ok(b.y>=a.y+a.height-1,'phone inspector stacks below canvas');
 assert.equal(appPages(context).length,1);assert.deepEqual({errors,external},{errors:[],external:[]});console.log('PASS release: real touch drag/pinch/lock, undo preserves view, viewport-independent PNG, retired routes, desktop columns and mobile stacking.');
}finally{await browser.close();}
