import {tmpdir as testTmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium} = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
const errors = [], missing = [], external = [], checks = [];
try {
  const context = await browser.newContext({viewport:{width:1440,height:950}, reducedMotion:'no-preference'});
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'arg.test') {external.push(url.href);return route.abort();}
    try {
      const file = resolve('public','.'+(url.pathname === '/' ? '/index.html' : url.pathname));
      await route.fulfill({body:await readFile(file),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.wasm':'application/wasm','.svg':'image/svg+xml'})[extname(file)] || 'application/octet-stream'});
    } catch {missing.push(url.pathname);await route.abort();}
  });
  const page = await context.newPage();page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://arg.test/#crypto');await page.waitForSelector('#ct-crypto[data-operation]');
  await page.evaluate(() => document.fonts.ready);
  const settle = async () => {await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.waitForFunction(()=>{document.body.getBoundingClientRect();return document.getAnimations().filter(a=>a.playState==='running'||a.playState==='pending').length===0;});};
  await settle();

  // A painted-frame snapshot can miss a short, correctly completed animation
  // under slow layout. Observe actual native creation without changing the
  // effect, timing, lifecycle, or route that the application executes.
  await page.evaluate(() => {
    const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'animate');
    const records = [];
    Object.defineProperty(Element.prototype, 'animate', {...descriptor, value:function(...args) {
      const animation = Reflect.apply(descriptor.value, this, args);
      records.push({target:this, animation});
      return animation;
    }});
    globalThis.__routeMotionProbe = {records, restore() {
      Object.defineProperty(Element.prototype, 'animate', descriptor);
      delete globalThis.__routeMotionProbe;
    }};
  });
  try {
    // Each switch exercises a real route, not a disconnected demo. The original
    // Animation object retains its assigned ID after normal cleanup cancels it.
    for (const route of ['symbols','encoding','image','astronomy','countries','crypto']) {
      await page.evaluate(route => {
        globalThis.__routeMotionProbe.records.length = 0;
        location.hash = route;
      }, route);
      await page.waitForFunction(route => {
        const target = document.getElementById('panel-'+route);
        return !target.hidden && target.getClientRects().length > 0 &&
          globalThis.__routeMotionProbe.records.some(({target:node,animation}) =>
            node === target && animation.id === 'ui-enter');
      }, route);
      const observed = await page.evaluate(route => {
        const target = document.getElementById('panel-'+route);
        const {animation} = globalThis.__routeMotionProbe.records.find(record =>
          record.target === target && record.animation.id === 'ui-enter');
        return {id:animation.id, duration:animation.effect.getTiming().duration,
          actualTarget:animation.effect.target === target, hidden:target.hidden,
          onlyVisible:[...document.querySelectorAll('.panel')].every(panel => panel === target || panel.hidden),
          route:location.hash,task:target.querySelector('.capability-workspace-context')?.dataset.currentCapability};
      }, route);
      assert.equal(observed.id, 'ui-enter', `route motion: ${route}`);
      assert(observed.duration > 0 && observed.actualTarget && !observed.hidden && observed.onlyVisible,
        `real visible route effect: ${route}`);
      assert.equal(observed.route.split(/[/?]/)[0], '#'+route, `real route activation: ${route}`);assert.ok(observed.task);assert.equal(new URLSearchParams(observed.route.split('?')[1]).get('task'),observed.task,'route and workspace identify the same real task');
      await settle();
      assert(await page.evaluate(route => globalThis.__routeMotionProbe.records
        .filter(record => record.target.id === 'panel-'+route)
        .every(record => record.animation.playState === 'idle'), route), `route owned motion cleanup: ${route}`);
    }
  } finally {
    await page.evaluate(() => globalThis.__routeMotionProbe.restore());
  }
  checks.push('real route presence and idle cleanup');
  await page.locator('.workbench-menu').click();
  assert(await page.locator('.workbench-sidebar').evaluate(n=>n.inert),'collapsed desktop sidebar cannot receive focus');
  assert(await page.locator('.layout').evaluate(n=>n.getAnimations().length>0),'desktop layout moves with sidebar');
  await page.locator('.workbench-menu').click();await settle();
  assert(await page.locator('.workbench-sidebar').evaluate(n=>!n.inert&&getComputedStyle(n).display!=='none'),'desktop interrupted collapse restores sidebar');
  checks.push('desktop sidebar collapse/interrupt');

  // Responsive placement owns no enter effect: a drawer becoming the desktop
  // rail must be fully painted on its first frame, including a stored collapsed
  // preference. Waiting for a snapshot of animations would miss late-created
  // @starting-style transitions, so inspect each of the first painted frames.
  await page.evaluate(()=>{globalThis.__responsiveRail=document.querySelector('.workbench-sidebar');});
  for(const reducedMotion of ['no-preference','reduce']){
    await page.emulateMedia({reducedMotion});
    for(const collapsed of [false,true]){
      const current=await page.evaluate(async()=>(await import('/preferences.js')).getPreferences().sidebarCollapsed);
      if(current!==collapsed){
        await page.locator('.workbench-menu').click();
        const toggle=await page.evaluate(()=>{
          const layout=document.querySelector('.layout'),rail=document.querySelector('.workbench-sidebar');
          layout.getBoundingClientRect();rail.getBoundingClientRect();
          return {intent:layout.dataset.sidebarMotion,layout:layout.getAnimations().length,rail:rail.getAnimations().length};
        });
        assert.equal(toggle.intent,'toggle');
        if(reducedMotion==='reduce')assert.equal(toggle.layout+toggle.rail,0,'reduced motion desktop toggle is immediate');
        else assert(toggle.layout>0&&toggle.rail>0,'intentional desktop toggle animates both rail and gutter');
        await settle();
      }
      await page.setViewportSize({width:390,height:844});await settle();
      await page.locator('.workbench-menu').click();await settle();
      assert(await page.locator('.workbench-drawer').evaluate(n=>n.open&&n.contains(globalThis.__responsiveRail)),'phone drawer uses the original rail');
      await page.setViewportSize({width:1440,height:950});
      const frames=await page.evaluate(async()=>{
        const states=[];
        for(let frame=0;frame<4;frame++){
          await new Promise(resolve=>requestAnimationFrame(resolve));
          const layout=document.querySelector('.layout'),rail=document.querySelector('.workbench-sidebar'),style=getComputedStyle(rail),rect=rail.getBoundingClientRect();
          states.push({intent:layout.dataset.sidebarMotion,same:rail===globalThis.__responsiveRail,parent:rail.parentElement===layout,
            drawer:document.querySelector('.workbench-drawer').open,expanded:document.querySelector('.workbench-menu').getAttribute('aria-expanded'),
            display:style.display,opacity:Number(style.opacity),translate:style.translate,left:rect.left,right:rect.right,
            mainLeft:document.querySelector('main').getBoundingClientRect().left,inert:rail.inert,
            animations:rail.getAnimations().length+layout.getAnimations().length});
        }
        return states;
      });
      for(const state of frames){
        assert.equal(state.intent,'responsive',`${reducedMotion}: viewport changes use responsive placement`);
        assert(state.same&&state.parent&&!state.drawer,`${reducedMotion}: responsive placement preserves the rail and closes the drawer`);
        assert.equal(state.expanded,String(!collapsed));assert.equal(state.inert,collapsed);
        assert.equal(state.animations,0,`${reducedMotion}: responsive rail/gutter must not animate`);
        if(collapsed)assert.equal(state.display,'none','stored desktop collapse stays collapsed after using the mobile drawer');
        else {
          assert.notEqual(state.display,'none');assert.equal(state.opacity,1,'desktop rail never enters partially transparent');
          assert(state.translate==='none'||parseFloat(state.translate)===0,'desktop rail never enters offscreen');
          assert.equal(state.left,0);assert(state.mainLeft>=state.right,'responsive content clears the rail from the first frame');
        }
      }
      assert.equal(await page.evaluate(async()=>(await import('/preferences.js')).getPreferences().sidebarCollapsed),collapsed,'mobile drawer and resizing preserve the desktop preference');
      await settle();
    }
  }
  await page.locator('.workbench-menu').click();await settle();
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{delete globalThis.__responsiveRail;});
  checks.push('first-frame responsive rail placement, original node and stored collapse in normal/reduced motion');

  const run = page.locator('#ct-crypto .ct-run');await run.hover();await page.mouse.down();
  await run.evaluate(n=>getComputedStyle(n).scale);
  await page.waitForFunction(()=>new DOMMatrix(getComputedStyle(document.querySelector('#ct-crypto .ct-run')).transform).a<.999);
  await page.mouse.move(1400,900);await page.mouse.up();await settle();
  assert(Math.abs(await run.evaluate(n=>new DOMMatrix(getComputedStyle(n).transform).a)-1)<.001);checks.push('button press/release');

  const components = await page.evaluate(async () => {
    const ui = await import('/ui/index.js'), ok = (v,m) => {if (!v) throw Error(m);};
    const host = ui.Box({id:'motion-test-host',attrs:{style:'position:fixed;left:400px;top:100px;width:560px;z-index:100;background:var(--bg)'}});
    const trigger = ui.Button({text:'动画说明'}), help = ui.ToolHelp({hidden:true,children:ui.Box({text:'实际说明内容 '.repeat(30)})});
    const bar = ui.TabList(), a = ui.TabPanel({text:'甲内容'}), b = ui.TabPanel({text:'乙内容'});
    const busy = ui.Button({text:'执行'}), status = ui.Status();host.append(trigger,help,bar,a,b,busy,status);document.body.append(host);
    const disclosure = ui.disclosureController(trigger,help), tabs = ui.tabsController(bar,[['a','标签甲',a],['b','标签乙',b]]);
    const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const done = async n => {await frame();await Promise.allSettled(n.getAnimations({subtree:true}).map(a => a.finished));await frame();const shell=n.closest('[data-animate-ui=collapsible]');for(let i=0;shell&&i<90&&!shell.hidden&&shell.style.height!=='auto';i++)await frame();};
    try {
      const check=ui.Input({type:'checkbox'}), field=ui.Field({label:'即时勾选',control:check});host.append(field);await done(host);
      check.click();
      ok(check.checked,'checkbox state is synchronous');
      await frame();ok(field.querySelector('.ui-check-indicator path'),'actual Animate UI checkbox indicator is rendered');
      check.click();check.click();await done(field);
      ok(check.checked&&field.querySelector('.ui-check-indicator svg'),'rapid checkbox changes settle on the actual state');
      check.indeterminate=true;await frame();ok(field.querySelector('.ui-check-indicator path')?.getAttribute('d')==='M5 12h14','indeterminate has its own visible mark');
      check.disabled=true;field.click();ok(check.checked,'disabled whole-label activation cannot change value');
      check.disabled=false;check.indeterminate=false;check.focus();
      const copyWidth=busy.getBoundingClientRect().width;ok(!busy.dataset.actionFeedback,'no optimistic completion feedback');
      ui.confirmAction(busy);ok(busy.dataset.actionFeedback==='success','explicit completion displays feedback');
      ok(busy.getBoundingClientRect().width===copyWidth,'completion does not shift neighbouring buttons');
      busy.click();ok(!busy.dataset.actionFeedback,'next action clears prior completion');
      ui.confirmAction(busy);busy.disabled=true;await Promise.resolve();ok(!busy.dataset.actionFeedback,'invalidation removes completion');busy.disabled=false;
      const completion=ui.Button({text:'已完成'});host.append(completion);ui.confirmAction(completion);completion.remove();await frame();ok(!completion.dataset.actionFeedback,'unmount clears feedback and timer');
      const list=ui.Box({attrs:{style:'position:relative;display:grid'}}), rowA=ui.Button({id:'motion-row-a',text:'甲'}), rowB=ui.Button({id:'motion-row-b',text:'乙'});list.append(rowA,rowB);host.append(list);await done(host);
      ui.animatePresence(rowA);for(const effect of rowA.getAnimations().filter(a=>a.id==='ui-enter'))effect.currentTime=60;
      const paintedTop=rowA.getBoundingClientRect().top;ui.animateCollection(list,()=>list.append(rowA));
      ok(Math.abs(rowA.getBoundingClientRect().top-paintedTop)<2,'reordering during entry starts at the current painted position');
      await done(list);ok(list.lastElementChild===rowA&&!rowA.getAnimations().length,'keyed reorder settles and releases its effect '+JSON.stringify({last:list.lastElementChild===rowA,a:rowA.getAnimations().map(x=>({id:x.id,play:x.playState,property:x.transitionProperty,keyframes:x.effect.getKeyframes()}))}));list.remove();
      trigger.click();ok(!help.hidden && !help.inert,'opening is immediate');await frame();
      const helpShell=help.closest('[data-animate-ui=collapsible]');ok(helpShell&&!helpShell.hidden&&helpShell.style.height!=='auto','actual imported disclosure height transition');await done(help);
      const height = help.getBoundingClientRect().height;ok(height > 70,'expanded natural height');
      trigger.click();ok(help.inert && trigger.getAttribute('aria-expanded')==='false','closing semantics are immediate while exit remains visible');
      // Inspect real CSS effects synchronously. An overloaded frame may arrive
      // after their completion; inert content also cannot receive start events.
      await frame();ok(!helpShell.hidden&&helpShell.getBoundingClientRect().height<height,'Animate UI exit shrinks original content');
      await done(help);ok(help.hidden&&helpShell.getBoundingClientRect().height===0,'collapsed layout settles');
      trigger.click();trigger.click();trigger.click();await done(help);ok(!help.hidden&&!help.inert,'interrupt disclosure final state');
      await done(bar);const indicator=bar.querySelector('[data-slot=tabs-indicator]');ok(indicator,'real upstream tab indicator');
      const initial=indicator.getBoundingClientRect().left;tabs.select('b');await frame();
      ok(b.hidden===false&&a.hidden,'tab logical state');
      await done(bar);ok(indicator.getBoundingClientRect().left!==initial,'indicator moves to selected tab');
      bar.querySelector('[aria-selected=true]').focus();bar.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true}));ok(tabs.active==='a','tabs keyboard during motion');
      bar.style.width='90px';bar.style.flexWrap='wrap';await done(bar);tabs.select('a');await done(bar);const firstRow=indicator.getBoundingClientRect().top;
      tabs.select('b');await done(bar);ok(indicator.getBoundingClientRect().top>firstRow,'wrapped tabs indicator tracks actual row');
      ui.setState(busy,{busy:true,disabled:true});await frame();
      ok(getComputedStyle(busy,'::after').animationName==='ui-busy'&&busy.getAttribute('aria-busy')==='true','actual busy state spinner');
      ui.setState(busy,{busy:false,disabled:false});ui.updateStatus(status,'实际完成','success');await frame();
      ok(getComputedStyle(busy,'::after').animationName==='none'&&getComputedStyle(status,'::before').content.includes('✓'),'completion feedback and spinner cleanup');
      const result = ui.Result({text:'原始结果'});host.append(result);await frame();ui.cancelMotion(result);result.textContent='新结果';
      // The component observer runs in a microtask. Waiting two painted frames
      // can miss a valid short feedback effect after a slow layout/frame.
      await Promise.resolve();const replacement=result.getAnimations().find(a=>a.id==='ui-feedback');
      ok(replacement&&replacement.effect.getTiming().duration>0&&result.textContent==='新结果','shared result replacement feedback');await replacement.finished;
      ui.animatePresence(result);const animations=result.getAnimations();result.remove();await frame();ok(animations.every(a=>a.playState==='idle'),'unmount cancels owned motion');
      const modalNode=ui.Dialog({children:ui.Input()});host.append(modalNode);const modal=ui.dialogController(modalNode);modal.open();modal.close();await frame();modal.destroy();modal.open();
      ok(!modalNode.open&&!modal.leaving&&!modalNode.style.getPropertyValue('--ui-exit-height')&&!modalNode.getAnimations().length,'退出过程中销毁弹窗清理动画、快照与旧回调');
      const editor=ui.Textarea({autoSize:true,minRows:2,maxRows:4,attrs:{readonly:'','aria-label':'动态结果'}}), filtered=ui.Card({text:'筛选后的工具'});host.append(editor,filtered);await done(host);ui.cancelMotion(filtered);
      const inputAt=performance.now();trigger.dispatchEvent(new Event('input',{bubbles:true}));
      ui.setTextareaValue(editor,'保留完整结果');ui.animatePresence(filtered);
      ok(!editor.getAnimations().length&&!filtered.getAnimations().length&&editor.value==='保留完整结果','连续输入时显式动效和只读结果共用抑制入口，结果即时更新');
      let updated=false;ui.animateCollection(filtered,()=>{updated=true;filtered.textContent='即时筛选结果';});
      ok(updated&&filtered.textContent==='即时筛选结果','动效被抑制时集合更新仍同步执行');
      while(performance.now()-inputAt<200) await frame();
      ui.animatePresence(filtered);ok(filtered.getAnimations().some(a=>a.id==='ui-enter'),'连续输入停止后恢复共享入场动效');await done(filtered);
      ui.setTextareaValue(editor,'单次操作结果');
      ok(editor.getAnimations().some(a=>a.id==='ui-feedback'),'只读结果的默认单次反馈保持有效');await done(editor);
      const shortHeight=editor.getBoundingClientRect().height;
      ui.setTextareaValue(editor,'逐步结果\n第二行\n第三行\n第四行\n第五行',{feedback:false});
      ok(editor.value.includes('第五行')&&!editor.getAnimations().length,'持续计算可通过公共接口即时更新而不重播反馈');
      const fitStarted=performance.now();while(editor.getBoundingClientRect().height<=shortHeight&&performance.now()-fitStarted<1000)await frame();
      ok(editor.getBoundingClientRect().height>shortHeight,'关闭持续计算反馈仍保持公共内容自适应');
      filtered.style.setProperty('--ui-motion-enter','0ms');ui.animatePresence(filtered);
      ok(!filtered.getAnimations().length,'零时长令牌不能被默认值替换而恢复动画');
      filtered.style.setProperty('--ui-motion-enter','.2s');filtered.style.setProperty('--ui-motion-ease','linear');ui.animatePresence(filtered);
      const timing=filtered.getAnimations().find(a=>a.id==='ui-enter')?.effect.getTiming();
      ok(timing?.duration===200&&timing.easing==='linear','JS 动效与 CSS 共用时长单位和曲线令牌');await done(filtered);
      tabs.destroy();disclosure.destroy();return ['native checkbox mark/rapid toggle/indeterminate/disabled','confirmed action feedback, stable geometry and cleanup','disclosure enter/exit/interrupt','tab geometry/keyboard','busy/success states','result/unmount cleanup','all motion entrypoints respect continuous input'];
    } finally {host.remove();}
  });checks.push(...components);await settle();

  // Native modal entry AND exit; rapid reopen must keep focus and viewport state.
  await page.locator('.rail-directory-button').click();
  assert(await page.locator('.tool-directory').evaluate(n => n.getAnimations().length > 0),'modal enter');
  await settle();
  await page.locator('.tool-directory .directory-search input').fill('Base64');
  assert.equal(await page.evaluate(() => document.getAnimations().filter(a=>a.id.startsWith('ui-')).length),0,'typing does not replay entry');
  await page.keyboard.press('Escape');
  assert(await page.locator('.tool-directory').evaluate(n => !n.open && n.inert),'modal closes logically immediately');
  await page.locator('.rail-directory-button').click();await settle();
  assert(await page.locator('.tool-directory').evaluate(n=>n.open&&!n.inert&&n.contains(document.activeElement)&&!!n.style.getPropertyValue('--ui-viewport-height')),'rapid reopen owns latest focus and viewport');
  await page.keyboard.press('Escape');
  assert(await page.locator('.tool-directory').evaluate(n=>n.getAnimations().length>0),'modal exit');
  const exitLayout=await page.locator('.tool-directory').evaluate(n=>{const r=n.getBoundingClientRect();return {direction:getComputedStyle(n).flexDirection,outside:[...n.querySelectorAll('input,button')].filter(c=>{const b=c.getBoundingClientRect();return b.left<r.left-1||b.right>r.right+1;}).map(c=>({id:c.id,label:c.textContent,control:c.getBoundingClientRect().toJSON(),dialog:r.toJSON()}))};});
  assert.equal(exitLayout.direction,'column','modal keeps its column layout during native exit');assert.deepEqual(exitLayout.outside,[],'every control stays inside the modal during native exit');
  await settle();assert.equal(await page.locator('.tool-directory').evaluate(n=>getComputedStyle(n).display),'none');checks.push('native directory modal enter/exit/reopen and search stability');
  assert(await page.locator('.tool-directory').evaluate(n=>!n.style.getPropertyValue('--ui-exit-height')&&!n.style.getPropertyValue('--ui-exit-top')),'exit viewport snapshot cleanup');

  // Header search is inline. Its focus and state are independent of native
  // modal exit geometry; filtering must not replay the popover's entry effect.
  await page.locator('#workspace-search-input').focus();await page.locator('.workspace-search-popover').waitFor({state:'visible'});await settle();
  assert(await page.locator('.workspace-search-popover').evaluate(n=>!n.hidden&&!n.inert&&!(n instanceof HTMLDialogElement)&&!n.closest('dialog')),'inline suggestions open without a dialog');
  assert.equal(await page.locator('dialog[open]').count(),0,'inline search has no backdrop or modal focus owner');
  await page.locator('#workspace-search-input').fill('Base64');
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.id.startsWith('ui-')).length),0,'inline typing does not replay entry');
  await page.keyboard.press('Escape');
  assert(await page.locator('.workspace-search-popover').evaluate(n=>n.hidden&&n.inert),'inline closing is immediate');
  await page.keyboard.press('Control+k');await page.locator('.workspace-search-popover').waitFor({state:'visible'});
  assert(await page.locator('#workspace-search-input').evaluate(n=>document.activeElement===n),'inline reopen focuses the original real input');
  await page.keyboard.press('Escape');await settle();checks.push('inline search open/filter/close without modal state or repeated input motion');

  // All entry points share a task workspace. The removed aggregate picker
  // cannot return during responsive placement or motion transitions.
  for (const reducedMotion of ['no-preference','reduce']) {
    await page.emulateMedia({reducedMotion});
    for (const width of [390,1440]) {
      await page.setViewportSize({width,height:950});
      for (const route of ['crypto','encoding','language','image','audio','file']) {
        await page.evaluate(route=>{location.hash=route;scrollTo(0,0);},route);
        await page.waitForSelector('#panel-'+route+':not([hidden]) .capability-workspace-context',{state:'attached'});assert.equal(await page.locator('#panel-'+route).isVisible(),true);await settle();
        assert.equal(await page.locator('.ct-picker,#chef-directory,.ct-jump').count(),0);
        assert.equal(await page.locator('#panel-'+route).evaluate(n=>n.classList.contains('capability-task-panel')),true);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      }
    }
  }
  await page.emulateMedia({reducedMotion:'no-preference'});
  checks.push('task-only composition during mobile/desktop placement and normal/reduced motion');
  await page.evaluate(()=>{location.hash='tarot';});await page.waitForSelector('#tarot-fan .ref-tarot-card');await settle();
  const fan = await page.evaluate(async()=>{
    const host=document.getElementById('tarot-fan');host.focus();host.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
    await new Promise(resolve=>requestAnimationFrame(resolve));
    return {selected:host.querySelector('[aria-pressed=true]').dataset.choice,animations:host.getAnimations({subtree:true}).map(a=>a.id)};
  });
  assert(fan.selected&&fan.animations.includes('ui-collection'),'real keyed tarot fan motion');
  await page.evaluate(()=>{const fan=document.getElementById('tarot-fan');for(let i=0;i<2;i++)fan.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));});
  await page.waitForFunction(()=>document.querySelector('#tarot-status').textContent==='查询完成');await settle();
  assert.equal(await page.locator('#tarot-card').inputValue(),'3');assert.match(await page.locator('#tarot-results').textContent(),/皇后/);
  checks.push('real tarot collection reordering/rapid selection');
  await page.evaluate(()=>{location.hash='crypto';});await page.waitForSelector('#panel-crypto',{state:'visible'});await settle();

  // Actual CyberChef execution, while its animation is allowed, retains output.
  await page.locator('#ct-crypto .ct-input').fill('Abc123');
  const started = await page.evaluate(()=>{const b=document.querySelector('#ct-crypto .ct-run');b.click();return b.getAttribute('aria-busy');});
  assert.equal(started,'true');
  await page.waitForSelector('#ct-crypto .ct-output');
  assert.equal(await page.locator('#ct-crypto .ct-output').inputValue(),'Nop123');
  await page.waitForFunction(()=>document.querySelector('#ct-crypto .ct-run').getAttribute('aria-busy')==='false');await settle();checks.push('actual ROT13 with busy and result motion');
  await page.evaluate(()=>{const clipboard=navigator.clipboard,original=Object.getOwnPropertyDescriptor(clipboard,'writeText');window.copyProbe={restore(){if(original)Object.defineProperty(clipboard,'writeText',original);else delete clipboard.writeText;}};Object.defineProperty(clipboard,'writeText',{configurable:true,value:text=>new Promise((resolve,reject)=>Object.assign(window.copyProbe,{text,resolve,reject}))});});
  const copyButton=page.locator('#ct-crypto .ct-copy');
  await copyButton.click();assert.equal(await copyButton.getAttribute('data-action-feedback'),null,'pending clipboard cannot claim success');
  assert.equal(await page.evaluate(()=>window.copyProbe.text),'Nop123');await page.evaluate(()=>window.copyProbe.resolve());
  await page.waitForFunction(()=>document.querySelector('#ct-crypto .ct-copy').dataset.actionFeedback==='success');
  await copyButton.click();await page.evaluate(()=>window.copyProbe.reject(Error('denied')));
  await page.waitForFunction(()=>document.querySelector('#ct-crypto .ct-status').textContent.includes('手动复制'));
  assert.equal(await copyButton.getAttribute('data-action-feedback'),null,'rejected clipboard leaves no success mark');
  await copyButton.click();await page.locator('#ct-crypto .ct-input').fill('changed');await page.evaluate(()=>window.copyProbe.resolve());
  assert.equal(await copyButton.getAttribute('data-action-feedback'),null);assert(await copyButton.isDisabled(),'stale clipboard completion cannot revive a result');
  await page.evaluate(()=>{window.copyProbe.restore();delete window.copyProbe;});checks.push('real copy success, rejection and stale-result feedback');

  await page.setViewportSize({width:390,height:844});await settle();
  await page.evaluate(()=>{location.hash='cyberchef';});await page.waitForSelector('#panel-cyberchef',{state:'visible'});
  await page.evaluate(async()=>{const {animatePresence}=await import('/ui/index.js');animatePresence(document.getElementById('panel-cyberchef'));scrollTo(0,800);});
  assert(await page.evaluate(()=>document.getElementById('chef-tabs').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom-1),'sticky tabs remain below header DURING route animation');
  await page.evaluate(()=>{scrollTo(0,0);location.hash='crypto';});await page.waitForSelector('#panel-crypto',{state:'visible'});await settle();
  checks.push('sticky navigation during live route motion');
  await page.locator('.workbench-menu').click();await settle();
  await page.locator('.rail-close').click();
  assert(await page.locator('.workbench-drawer').evaluate(n=>!n.open&&n.inert&&n.contains(document.querySelector('.workbench-sidebar'))),'drawer preserves exiting content but closes immediately');
  await page.locator('.workbench-menu').click();await settle();
  assert(await page.locator('.workbench-drawer').evaluate(n=>n.open&&!n.inert&&n.contains(document.querySelector('.workbench-sidebar'))),'drawer rapid reopen preserves nodes');
  await page.locator('.rail-directory-button').click();await settle();
  assert(await page.locator('.tool-directory').evaluate(n=>n.open&&!n.inert),'directory opens after drawer');
  await page.setViewportSize({width:390,height:420});
  await page.waitForFunction(()=>{const n=document.querySelector('.tool-directory'),r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1;});
  await page.locator('.directory-heading button').click();await settle();
  assert(await page.locator('.workbench-sidebar').evaluate(n=>n.parentElement.classList.contains('layout')),'drawer exit cleanup returns sidebar');
  await page.setViewportSize({width:390,height:844});checks.push('mobile drawer continuity/directory/keyboard viewport');

  // Switching the system preference DURING animation cancels JS and CSS motion.
  await page.evaluate(async()=>{const ui=await import('/ui/index.js');ui.animatePresence(document.querySelector('#panel-crypto'));});
  await page.emulateMedia({reducedMotion:'reduce'});
  await settle();assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
  await page.locator('.workbench-menu').click();
  assert.equal(await page.locator('.workbench-drawer').evaluate(n=>n.getAnimations().length),0);
  await page.locator('.rail-close').click();
  assert(await page.locator('.workbench-sidebar').evaluate(n=>n.parentElement.classList.contains('layout')),'reduced motion cleanup is immediate');
  await page.evaluate(()=>{location.hash='symbols';});await page.waitForSelector('#panel-symbols',{state:'visible'});
  assert.equal(await page.locator('#panel-symbols').evaluate(n=>n.getAnimations({subtree:true}).length),0);checks.push('live reduced-motion preference and immediate interactions');
  await page.emulateMedia({reducedMotion:'no-preference'});await settle();
  await mkdir(testTmpdir()+'/arg-ui-motion',{recursive:true});
  await page.screenshot({path:testTmpdir()+'/arg-ui-motion/mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:950});await settle();
  assert(await page.evaluate(()=>document.querySelector('main').getBoundingClientRect().left>=document.querySelector('.workbench-sidebar').getBoundingClientRect().right),'desktop viewport settles outside sidebar');
  await page.screenshot({path:testTmpdir()+'/arg-ui-motion/desktop.png',fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(external,[]);
  console.log(JSON.stringify({passed:true,checks,errors,missing,external},null,2));
} finally {await browser.close();}
