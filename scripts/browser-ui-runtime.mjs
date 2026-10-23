import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const errors=[],external=[],checks=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:950}});
 await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='arg.test'){external.push(url.href);return route.abort();}try{const path=resolve('public','.'+(url.pathname==='/'?'/index.html':url.pathname));await route.fulfill({body:await readFile(path),contentType:({'.js':'text/javascript','.html':'text/html','.css':'text/css','.woff2':'font/woff2','.json':'application/json','.wasm':'application/wasm'})[extname(path)]||'application/octet-stream'});}catch{external.push(url.pathname);await route.abort();}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('https://arg.test/#crypto');await page.waitForSelector('#ct-crypto[data-operation]');
 assert.equal(await page.locator('main').evaluate(n=>n.classList.contains('ui-hover-group')),false,'hover paint must not isolate an entire workspace or trap its fixed editors');
 for(const width of [1440,800,390])for(const reduce of [false,true]){
  await page.setViewportSize({width,height:950});await page.emulateMedia({reducedMotion:reduce?'reduce':'no-preference'});
  const result=await page.evaluate(async({reduce})=>{
   const ui=await import('/ui/index.js');const ok=(v,m)=>{if(!v)throw Error(m);};
   const frame=()=>new Promise(requestAnimationFrame);
   const until=async fn=>{for(let i=0;i<180;i++){if(fn())return;await frame();}throw Error('Animation did not settle');};
   const host=ui.Box({attrs:{id:'ui-runtime-fixture',style:'position:fixed;inset:80px 12px auto;z-index:999;background:var(--bg);padding:12px;max-height:80vh;overflow:auto'}});
   const input=ui.Input({value:'保留线索 0123'}),file=ui.Input({type:'file'}),trigger=ui.Button({text:'展开'}),panel=ui.ToolHelp({hidden:true});
   host.append(trigger,panel);document.body.append(host);const control=ui.disclosureController(trigger,panel);
   trigger.addEventListener('click',()=>{if(!panel.children.length&&trigger.getAttribute('aria-expanded')==='true')panel.append(input,file,ui.Box({text:'原始说明 '.repeat(60)}));});
   const dt=new DataTransfer();dt.items.add(new File(['original-clue'],'clue.txt'));file.files=dt.files;const originalFile=file.files[0];
   trigger.click();ok(!panel.inert&&trigger.getAttribute('aria-expanded')==='true','open semantics');
   const shell=panel.closest('[data-animate-ui=collapsible]');ok(shell,'actual Animate UI Collapsible shell');
   const samples=[];for(let i=0;i<32;i++){await frame();samples.push(shell.getBoundingClientRect().height);}
   ok(samples.at(-1)>50,'visible natural content');if(!reduce)ok(new Set(samples.map(Math.round)).size>2,'real upstream height interpolation');
   trigger.click();ok(panel.inert&&trigger.getAttribute('aria-expanded')==='false','close immediately removes focusability');
   const exit=[];for(let i=0;i<32;i++){await frame();exit.push(shell.getBoundingClientRect().height);}
   ok(shell.hidden&&shell.getBoundingClientRect().height===0,'close releases layout');if(!reduce)ok(new Set(exit.map(Math.round)).size>2,'real upstream exit interpolation');
   trigger.click();await frame();trigger.click();await frame();trigger.click();await until(()=>!shell.hidden&&shell.style.height==='auto');
   ok(panel.querySelector('input')===input&&input.value==='保留线索 0123'&&file.files[0]===originalFile,'original input/file identity');
   const bar=ui.TabList(),one=ui.TabPanel({text:'一'}),two=ui.TabPanel({text:'二'});host.append(bar,one,two);const tabs=ui.tabsController(bar,[['one','第一页',one],['two','第二页',two]]);
   await until(()=>bar.querySelector('[data-slot=tabs-indicator]'));
   const indicator=bar.querySelector('[data-slot=tabs-indicator]');tabs.select('two');await until(()=>Math.abs(indicator.getBoundingClientRect().left-bar.querySelector('[aria-selected=true]').getBoundingClientRect().left)<1);
   ok(one.hidden&&!two.hidden,'original tab panels');bar.querySelector('[aria-selected=true]').focus();bar.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true}));ok(tabs.active==='one','original keyboard navigation');
   const checkbox=ui.Input({type:'checkbox'}),field=ui.Field({label:'原生复选框',control:checkbox});host.append(field);await until(()=>checkbox.dataset.animateUi==='checkbox');
   checkbox.click();await until(()=>field.querySelector('.ui-check-indicator path'));ok(checkbox.checked&&field.querySelectorAll('input').length===1,'one real input and actual Animate UI Indicator');
   checkbox.indeterminate=true;await until(()=>field.querySelector('path')?.getAttribute('d')==='M5 12h14');
   checkbox.checked=false;checkbox.indeterminate=false;checkbox.disabled=true;field.click();ok(!checkbox.checked,'disabled label behavior');
   const select=ui.Select({children:[ui.Option('甲','a'),ui.Option('乙','b'),ui.Option('重复值','b')]});
   const selectField=ui.Field({label:'选择原参数',control:select});host.append(selectField);
   let changes=0;select.addEventListener('change',()=>changes++);
   await until(()=>select.dataset.animateUi==='select');
   const selectTrigger=selectField.querySelector('.ui-select-trigger');
   ok(selectTrigger&&select.tabIndex===-1&&select.getAttribute('aria-hidden')==='true','one accessible Select presentation');
   selectTrigger.click();await until(()=>document.querySelector('.ui-select-popup [role=option]'));
   const option=[...document.querySelectorAll('.ui-select-popup [role=option]')].find(n=>n.textContent.includes('重复值'));option.click();
   await until(()=>selectTrigger.textContent.includes('重复值'));
   ok(select.selectedIndex===2&&select.value==='b'&&changes===1,'duplicate values retain exact index and dispatch one change');
   select.value='a';await until(()=>selectTrigger.textContent.includes('甲'));ok(changes===1,'programmatic writes do not invent change events');
   select.replaceChildren(ui.Option('新甲','new-a'),ui.Option('新乙','new-b'));select.selectedIndex=1;
   await until(()=>selectTrigger.textContent.includes('新乙'));ok(select.value==='new-b','dynamic operation options retain original owner');
   const originalOptions=[...select.options],other=ui.Option('其他任务','other');
   select.prepend(other);select.value='new-a';await until(()=>selectTrigger.textContent.includes('新甲'));
   select.replaceChildren(...originalOptions);select.value='new-b';await until(()=>selectTrigger.textContent.includes('新乙'));
   for(let i=0;i<4;i++)await frame();
   ok(select.value==='new-b'&&changes===1,'filtering/reindexing original options cannot synthesize a change or overwrite the controller selection');
   select.disabled=true;await until(()=>selectTrigger.disabled);select.disabled=false;
   await until(()=>!selectTrigger.disabled);select.focus();ok(document.activeElement===selectTrigger,'original focus forwards to accessible trigger');
   selectTrigger.click();await until(()=>selectTrigger.getAttribute('aria-expanded')==='true');host.hidden=true;
   await until(()=>selectTrigger.getAttribute('aria-expanded')==='false');host.hidden=false;
   const checkpoint=input;control.destroy();tabs.destroy();ok(panel.querySelector('input')===checkpoint,'destroy preserves opaque content');host.remove();await frame();await frame();
   ok(!document.querySelector('#ui-runtime-fixture')&&!checkbox.hasAttribute('data-animate-ui')&&!select.hasAttribute('data-animate-ui')&&!host.querySelector('.ui-disclosure-host,.ui-check-indicator,.ui-select-host'),'disconnect cleanup');
   return {reduce,enterFrames:new Set(samples.map(Math.round)).size,exitFrames:new Set(exit.map(Math.round)).size};
  },{reduce});checks.push({width,...result});
 }
 await page.setViewportSize({width:1440,height:950});await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(async()=>{
  const ui=await import('/ui/index.js');const select=ui.Select({id:'modal-select-probe',children:[ui.Option('第一项','a'),ui.Option('第二项','b')]});
  const dialog=ui.Dialog({id:'select-modal-probe',attrs:{'aria-label':'嵌套选择验证'},children:ui.Field({label:'弹窗选项',control:select})});document.body.append(dialog);
  window.selectModal=ui.dialogController(dialog);window.selectModal.open();
 });
 await page.locator('#select-modal-probe .ui-select-trigger').click();
 await page.locator('#select-modal-probe .ui-select-popup').waitFor();
 await page.keyboard.press('Escape');
 assert(await page.locator('#select-modal-probe').evaluate(n=>n.open),'Escape first closes the Select, not its parent modal');
 await page.locator('#select-modal-probe .ui-select-popup').waitFor({state:'hidden'});
 await page.locator('#select-modal-probe .ui-select-trigger').focus();await page.keyboard.press('ArrowDown');
 await page.keyboard.press('End');await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelector('#modal-select-probe').value==='b');
 await page.locator('#select-modal-probe .ui-select-popup').waitFor({state:'hidden'});
 await page.evaluate(()=>{const node=document.querySelector('#modal-select-probe');node.options[0].label='Alpha';node.options[1].label='Beta';node.value='a';window.__typeaheadChanges=0;node.addEventListener('change',()=>window.__typeaheadChanges++);});
 await page.waitForFunction(()=>document.querySelector('#select-modal-probe .ui-select-trigger').textContent.includes('Alpha'));
 await page.locator('#select-modal-probe .ui-select-trigger').focus();await page.keyboard.press('b');
 await page.waitForFunction(()=>document.querySelector('#modal-select-probe').value==='b');
 assert.equal(await page.evaluate(()=>window.__typeaheadChanges),1,'closed select keyboard typeahead remains one native change after dynamic label edits');
 await page.evaluate(()=>{window.selectModal.destroy();document.querySelector('#select-modal-probe').remove();});
 // Hover coverage is a shared component contract, independent of the route.
 // Verify the real upstream surface travels, stays below every sibling, and
 // survives native label/list replacement without creating a second control.
 for(const reduce of [false,true]){
  await page.emulateMedia({reducedMotion:reduce?'reduce':'no-preference'});
  await page.evaluate(async()=>{
   const ui=await import('/ui/index.js');const bar=ui.Toolbar({id:'hover-contract',attrs:{style:'position:fixed;left:300px;top:200px;z-index:3000;display:flex;gap:10px;background:var(--bg);padding:10px'},children:[ui.Button({text:'第一项',id:'hover-one'}),ui.Button({text:'中间文字保持可读',id:'hover-middle'}),ui.Button({text:'第三项',id:'hover-three'}),ui.Button({text:'禁用',id:'hover-disabled',disabled:true})]});document.body.append(bar);
  });
  await page.waitForSelector('#hover-contract.ui-hover-group');
  await page.locator('#hover-one').hover();await page.waitForSelector('#hover-contract [data-slot=trigger-highlight]');
  await page.waitForFunction(()=>[...document.querySelector('#hover-contract').shadowRoot.querySelectorAll('[data-slot=trigger-highlight]')].every(n=>n.getAnimations().every(a=>a.playState==='finished')));
  const rescans=await page.locator('#hover-contract').evaluate(bar=>{
   const original=bar.querySelectorAll;let count=0;bar.querySelectorAll=function(...args){count++;return original.apply(this,args);};
   try{for(let i=0;i<25;i++)document.querySelector('#hover-one').dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse'}));return count;}finally{delete bar.querySelectorAll;}
  });
  assert.equal(rescans,0,'moving within an existing action group must not repeatedly rescan and reconcile its controls');
  const before=await page.locator('#hover-middle').boundingBox();
  await page.locator('#hover-three').hover();
  const movement=await page.evaluate(async()=>{
   const bar=document.querySelector('#hover-contract'),text=document.querySelector('#hover-middle');const xs=[];
   for(let i=0;i<18;i++){await new Promise(requestAnimationFrame);const paint=bar.shadowRoot.querySelector('[data-slot=trigger-highlight]:not([data-leaving])');if(paint)xs.push(paint.getBoundingClientRect().left);}
   return{xs,group:getComputedStyle(bar).isolation,layer:getComputedStyle(bar.shadowRoot.querySelector('.ui-hover-surfaces')).zIndex,textLayer:getComputedStyle(text).isolation,controls:bar.querySelectorAll('button').length};
  });
  assert.equal(movement.group,'isolate');assert.equal(movement.layer,'-1','the moving paint layer stays behind all original siblings');assert.equal(movement.textLayer,'auto','individual controls cannot trap the highlight above adjacent text');assert.equal(movement.controls,4);assert.equal(await page.locator('#hover-contract').evaluate(n=>n.children.length),4,'decorations never change the original list indices or child count');
  if(!reduce)assert(new Set(movement.xs.map(Math.round)).size>2,'real upstream hover glide, not just independent CSS hover colors: '+JSON.stringify(movement));
  assert.deepEqual(await page.locator('#hover-middle').boundingBox(),before,'hover must never move control hit areas');
  if(!reduce){
   await page.locator('#hover-one').hover();await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForFunction(()=>[...document.querySelector('#hover-contract').shadowRoot.querySelectorAll('[data-slot=trigger-highlight]')].every(n=>n.getAnimations().every(a=>a.playState!=='running')));
   await page.emulateMedia({reducedMotion:'no-preference'});
  }
  await page.locator('#hover-disabled').hover();await page.locator('#hover-contract [data-slot=trigger-highlight]').waitFor({state:'detached'});
  await page.locator('#hover-one').focus();await page.waitForSelector('#hover-contract [data-slot=trigger-highlight]');
  await page.evaluate(()=>{document.querySelector('#hover-one').textContent='新标签';});
  assert.equal(await page.locator('#hover-contract button').count(),4,'label replacement preserves control identity');
  await page.evaluate(async()=>{const ui=await import('/ui/index.js');const bar=document.querySelector('#hover-contract');bar.replaceChildren(ui.Button({id:'hover-late',text:'动态新增按钮'}));});
  await page.locator('#hover-late').hover();await page.waitForSelector('#hover-contract [data-slot=trigger-highlight]');
  await page.evaluate(()=>{document.querySelector('#hover-contract').hidden=true;});
  await page.waitForFunction(()=>!document.querySelector('#hover-contract').shadowRoot.querySelector('[data-slot=trigger-highlight]'));
  await page.evaluate(()=>document.querySelector('#hover-contract').remove());
  await page.waitForFunction(()=>!document.querySelector('#hover-contract'));
  await page.locator('.heading-actions:visible').evaluate(n=>{if(n.lastElementChild?.classList.contains('ui-hover-surfaces'))throw Error('paint must not replace the last semantic child');});
 }
 await page.emulateMedia({reducedMotion:'no-preference'});
 const button=page.locator('#ct-crypto .ct-run');await page.locator('#ct-crypto .ct-input').fill('输入后立即操作');await button.hover();await page.mouse.down();await page.waitForFunction(()=>{const n=document.querySelector('#ct-crypto .ct-run');return n.dataset.animateUi==='button'&&new DOMMatrix(getComputedStyle(n).transform).a<.999;});await page.mouse.up();
 await page.waitForFunction(()=>Math.abs(new DOMMatrix(getComputedStyle(document.querySelector('#ct-crypto .ct-run')).transform).a-1)<.001);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log(JSON.stringify({status:'passed',runtime:'@animate-ui/react 2.0.0 + motion 14.4.0',checks,contracts:['real upstream enter/exit','rapid interruption','original files/inputs','actual tab indicator','single checkbox input','keyboard','button spring','shared hover glide and layering','dynamic hover labels/lists and disabled cleanup','offline']},null,2));
}finally{await browser.close();}



