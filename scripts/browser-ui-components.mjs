import {toolPages,sitePages} from '../public/navigation.js';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium} = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
try {
  const context = await browser.newContext({viewport: {width: 1440, height: 950}, reducedMotion: 'reduce'});
  const errors = [], missing = [], external = [];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'arg.test') {external.push(url.href); return route.abort();}
    try {
      const path = resolve('public', '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
      await route.fulfill({body: await readFile(path), contentType: ({'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.svg': 'image/svg+xml'})[extname(path)] || 'application/octet-stream'});
    } catch {missing.push(url.pathname); await route.abort();}
  });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto('https://arg.test/#crypto'); await page.waitForSelector('#ct-crypto[data-operation]');
  const behaviors = await page.evaluate(async () => {
    const ui = await import('/ui/index.js');
    const check = (condition, message) => {if (!condition) throw Error(message);};
    const host = ui.Box({id: 'ui-component-test'}); document.body.append(host);
    try {
      const literal=ui.DataList({items:[['点位','1 4\n2 5\n3 6']],valueFormat:'literal'});host.append(literal);
      check(literal.querySelector('dd').textContent==='1 4\n2 5\n3 6'&&getComputedStyle(literal.querySelector('dd')).whiteSpace==='pre-wrap','规则示例保持真实点位行列');
      const reference = ui.ReferenceList({items:[{id:'rfc',title:'一个应自然换行的原始标准资料名称 RFC 4648',publisher:'南京大学标准镜像',url:'https://mirrors.nju.edu.cn/rfc/rfc4648.html',language:'en',kind:'standard',locator:'第4节'}]});
      host.append(reference);
      const referenceLink=reference.querySelector('a');
      check(referenceLink.textContent.includes('RFC 4648')&&reference.textContent.includes('第4节'),'原始依据与章节旁注');
      check(referenceLink.rel.includes('noopener')&&referenceLink.target==='_blank','资料链接隔离窗口');
      for(const url of ['javascript:alert(1)','data:text/html,unsafe','https://secret@example.org/']){
        let rejected=false;try{ui.ReferenceList({items:[{id:'unsafe',title:'无效来源',publisher:'x',language:'en',kind:'standard',url}]});}catch{rejected=true;}
        check(rejected,'拒绝危险资料 URL');
      }
      const control = ui.Input({value: '<script>私密输入</script>'});
      const field = ui.Field({label: '验证字段', control, description: '本地输入'});
      host.append(field);
      check(field.htmlFor === control.id && document.getElementById(control.getAttribute('aria-describedby')).textContent === '本地输入', '字段名称与描述关联');
      const right = ui.Card({title: '移动后保留状态'}); host.append(right); right.append(field);
      check(control.value === '<script>私密输入</script>' && right.contains(control), '组件移动不重建输入');
      // No page selector participates: an intrinsically sized multiline choice
      // must remain readable inside any bounded, scrolling result collection.
      const collection = ui.Result({layout: 'collection'});
      collection.style.width = '250px';collection.style.maxHeight = '120px';collection.style.overflow = 'auto';
      const record = () => ui.Button({layout: 'stacked', variant: 'choice', children: [
        ui.Box({tag: 'strong', text: '这是需要自然换行的很长的知识主题标题 ASCII Unicode UTF-8'}),
        ui.Box({tag: 'span', text: '完整摘要必须保持真实高度，不得被下一行遮盖，也不能被压缩为零。'}),
        ui.Badge({text: '字符与字节'}),
      ]});
      const firstRecord = record(), secondRecord = record();collection.append(firstRecord, secondRecord);host.append(collection);
      const checkCollection = scale => {
        firstRecord.style.fontSize = `${13 * scale}px`;secondRecord.style.fontSize = `${13 * scale}px`;
        const first = firstRecord.getBoundingClientRect(), second = secondRecord.getBoundingClientRect();
        const children = [...firstRecord.children].map(node => node.getBoundingClientRect());
        check(first.height > 44 && children.every(rect => rect.height > 0 && rect.top >= first.top && rect.bottom <= first.bottom + 1)
          && second.top >= first.bottom && collection.scrollHeight > collection.clientHeight,
        '共享多行按钮在有界资料列表保持摘要、标签、行间隔和整体滚动 ' + JSON.stringify({scale, firstHeight: first.height, childHeights: children.map(rect => rect.height), nextTop: second.top, firstBottom: first.bottom}));
      };
      checkCollection(1);checkCollection(2);collection.remove();
      const data=ui.DataList({items:[['编号','008']]}),file=ui.Input({type:'file'}),picker=ui.FilePicker({tag:'div',input:file,triggerLabel:'选择文件'});right.append(data,picker);
      check(parseFloat(getComputedStyle(right).paddingInlineStart)>0&&getComputedStyle(field).flexDirection==='column'&&getComputedStyle(data).display==='grid','无旧页面类名的卡片、字段和资料列表有一致的默认布局');
      check(file.hidden&&getComputedStyle(file).display==='none'&&picker.querySelector('button').textContent==='选择文件','自定义文件选择组件只显示中文触发控件，不重复显示原生输入');
      const search=ui.SearchField({label:'无页面样式的搜索',icon:ui.Icon('search'),control:ui.Input({type:'search'})});right.append(search);
      const searchRect=search.getBoundingClientRect(),iconRect=search.querySelector('svg').getBoundingClientRect(),inputRect=search.querySelector('input').getBoundingClientRect();
      check(searchRect.height>=44&&searchRect.height<90&&iconRect.width===20&&iconRect.height===20&&inputRect.width>100,'搜索组件自行约束图标与输入布局，不依赖各页面补丁');
      const custom=ui.Card({className:'explicit-card'});check(!custom.classList.contains('surface'),'明确的卡片组合样式不被默认变体覆盖');
      const editor = ui.Textarea({autoSize:true,value:'短结果',attrs:{'aria-label':'自动高度编辑器'}});right.append(editor);
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const shortHeight=editor.getBoundingClientRect().height;
      editor.value=Array(60).fill('这是很长的结果行，用于验证共用编辑器高度与滚动。').join('\n');editor.dispatchEvent(new Event('input'));
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      check(shortHeight<180&&editor.getBoundingClientRect().height>shortHeight&&editor.getBoundingClientRect().height<500&&editor.scrollHeight>editor.clientHeight,'共用编辑器按内容增长并限制长结果高度 '+JSON.stringify({shortHeight,height:editor.getBoundingClientRect().height,scrollHeight:editor.scrollHeight,clientHeight:editor.clientHeight,style:editor.style.height}));
      const forged = document.createElement('button'); forged.dataset.ui = 'button';
      check(ui.componentOf(forged) === null && ui.componentOf(ui.Button()) === 'button', '组件由工厂实例化而非补标记');
      check(ui.componentOf(ui.IconButton({label: '图标', children: ui.Icon('star')})) === 'icon-button', '图标按钮与 SVG 组件');
      const status = ui.Status(); host.append(status); ui.updateStatus(status, '校验失败', 'error');
      check(status.getAttribute('aria-live') === 'polite' && status.dataset.state === 'error', '共享状态与播报');
      let mounted = 0, unmounted = 0, states = 0, removedListener = 0;
      const watched = ui.Button({text: '生命周期'});
      ui.onLifecycle(watched, 'mount', () => mounted++); ui.onLifecycle(watched, 'unmount', () => unmounted++); ui.onLifecycle(watched, 'state', () => states++);
      const unsubscribe=ui.onLifecycle(watched,'state',()=>removedListener++);unsubscribe();
      host.append(watched); await new Promise(resolve => setTimeout(resolve, 0));
      ui.setState(watched, {disabled: true, busy: true}); await new Promise(resolve => setTimeout(resolve, 0));
      watched.remove(); await new Promise(resolve => setTimeout(resolve, 0));
      check(mounted === 1 && unmounted === 1 && states === 1 && removedListener === 0 && watched.disabled, '原生状态及挂载卸载钩子；取消订阅不影响其他监听器');
      const target = ui.Box(); host.append(target);
      ui.render(target, '<div class="surface"><label class="r1-field"><span>参数</span><input value="保留" required></label><button type="submit">执行</button><select><option value="a">A</option><option value="b" selected>B</option></select></div>');
      check(ui.componentOf(target.firstChild) === 'card' && ui.componentOf(target.querySelector('input')) === 'input', '声明式组合调用组件工厂');
      check(target.querySelector('select').value === 'b' && target.querySelector('button').type === 'submit' && target.querySelector('input').required, '原生表单属性保留');
      const before = target.firstChild;
      for (const unsafe of ['<button onclick="alert(1)">坏模板</button>', '<script>alert(1)</script>']) {
        let rejected = false; try {ui.render(target, unsafe);} catch {rejected = true;}
        check(rejected && before === target.firstChild, '无效模板不得破坏现有组件');
      }
      const table = ui.Table({caption: '安全结果', columns: ['内容'], rows: [['<img src=x onerror=alert(1)>'], [null]]});
      host.append(table); check(!table.querySelector('img') && table.querySelector('th').scope === 'col' && table.querySelectorAll('td')[1].textContent === 'NULL', '结果安全文本及表头');
      const list = ui.DataList({items: [['原文', '<b>线索</b>']]}); check(!list.querySelector('b') && list.querySelector('dd').textContent === '<b>线索</b>', '共享资料列表');
      const trigger = ui.Button({text: '说明'}), help = ui.ToolHelp({hidden: true}); host.append(trigger, help);
      const disclosure = ui.disclosureController(trigger, help, {closedLabel: '说明', openLabel: '收起'});
      trigger.click(); check(!help.hidden && trigger.getAttribute('aria-expanded') === 'true' && trigger.textContent === '收起', '说明状态同步');
      disclosure.destroy(); trigger.click(); check(!help.hidden, '控制器解除监听');
      const popupTrigger=ui.Button({text:'浮动属性'}),popupContent=ui.Box({text:'滚动内容'}),popup=ui.Card({hidden:true,attrs:{'data-motion':'popover'},children:[popupContent]});popup.style.maxHeight='64px';popup.style.overflow='auto';popupContent.style.height='200px';host.append(popupTrigger,popup);
      const floating=ui.disclosureController(popupTrigger,popup);floating.toggle(true);popup.scrollTop=32;check(popup.dataset.motion==='popover'&&getComputedStyle(popup).overflowY==='auto'&&popup.scrollTop>0,'浮动属性面板保留滚动，不被折叠动画裁切');floating.destroy();
      const bar = ui.TabList({attrs:{'aria-label':'组件标签'}}), first = ui.TabPanel({attrs:{'aria-label':'第一面板'}}), second = ui.TabPanel(), third = ui.TabPanel(); host.append(bar, first, second, third);
      check(bar.getAttribute('role')==='tablist'&&first.getAttribute('role')==='tabpanel','属性扩展保留标签语义');
      const tabs = ui.tabsController(bar, [['a', '甲', first], ['b', '乙', second], ['c', '丙', third]]);
      bar.children[1].disabled = true; bar.children[0].focus();
      check(tabs.select('b') === false && tabs.active === 'a' && !first.hidden && second.hidden, '程序选择也不能激活禁用标签或改变当前结果');
      bar.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
      check(tabs.active === 'c' && document.activeElement === bar.children[2] && first.hidden && !third.hidden, '标签键盘跳过禁用项');
      const fourth = ui.TabPanel(); host.append(fourth); tabs.add('d', '丁', fourth); tabs.select('d');
      check(!fourth.hidden && bar.children[3].getAttribute('aria-controls') === fourth.id && fourth.getAttribute('aria-labelledby') === bar.children[3].id, '动态标签关联');
      tabs.destroy();
      check(tabs.select('a')===false && tabs.active==='d' && !fourth.hidden, '已销毁标签控制器不能被旧回调重新激活');
      tabs.destroy();
      const disabledBar=ui.TabList(), disabledPanel=ui.TabPanel(), enabledPanel=ui.TabPanel();
      host.append(disabledBar, disabledPanel, enabledPanel);
      const disabledTab=ui.Button({text:'不可用',disabled:true});
      const initialTabs=ui.tabsController(disabledBar,[['off','不可用',disabledPanel,disabledTab],['on','可用',enabledPanel]],{initial:'off'});
      check(initialTabs.active==='on' && disabledPanel.hidden && !enabledPanel.hidden, '禁用的初始标签回退到首个可用标签');initialTabs.destroy();
      for (const removeTrigger of [false,true]) {
        const t=ui.Button(), p=ui.ToolHelp({hidden:true});host.append(t,p);
        const controller=ui.disclosureController(t,p);(removeTrigger?t:p).remove();
        await new Promise(resolve=>setTimeout(resolve,0));t.click();controller.toggle(true);
        check(p.hidden && t.getAttribute('aria-expanded')==='false', '说明任一端卸载后自动清理监听和控制器');controller.destroy();
      }
      const responsiveTrigger=ui.Button(),responsivePanel=ui.ToolHelp({hidden:true}),viewport=matchMedia('(max-width:800px)');
      host.append(responsiveTrigger,responsivePanel);
      const originalMatchMedia=window.matchMedia;let responsive;
      try{window.matchMedia=query=>query==='(max-width:800px)'?viewport:originalMatchMedia.call(window,query);responsive=ui.disclosureController(responsiveTrigger,responsivePanel,{responsiveQuery:'(max-width:800px)'});}finally{window.matchMedia=originalMatchMedia;}
      check(responsivePanel.hidden===viewport.matches,'响应式说明初始化使用当前视口');
      check((responsivePanel.dataset.motion==='collapse')===viewport.matches,'仅在可折叠视口启用高度动画，桌面不裁切内部浮层');
      viewport.dispatchEvent(new MediaQueryListEvent('change',{media:viewport.media,matches:!viewport.matches}));
      check(responsivePanel.hidden===viewport.matches && responsiveTrigger.getAttribute('aria-expanded')===String(!viewport.matches),'过期媒体事件不能覆盖当前视口状态');
      responsive.toggle(viewport.matches);const responsiveHidden=responsivePanel.hidden;responsive.destroy();
      viewport.dispatchEvent(new MediaQueryListEvent('change',{media:viewport.media,matches:viewport.matches}));
      check(responsivePanel.hidden===responsiveHidden,'响应式说明销毁解除媒体监听');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); ui.render(svg, '<circle cx="10" cy="10" r="5"/>');
      check(svg.firstChild.namespaceURI === svg.namespaceURI && svg.firstChild.localName === 'circle', '图形模板保留 SVG 命名空间');
      const dialog = ui.Dialog({children: ui.Input()}), openButton = ui.Button({text: '打开测试弹窗'}); host.append(openButton, dialog);
      const modal = ui.dialogController(dialog, {trigger: openButton, initialFocus: dialog.firstChild}); openButton.focus(); modal.open();
      check(dialog.open && document.activeElement === dialog.firstChild && openButton.getAttribute('aria-expanded') === 'true', '弹窗初始焦点');
      modal.close(); await new Promise(resolve => setTimeout(resolve, 30));
      check(!dialog.open && document.activeElement === openButton && openButton.getAttribute('aria-expanded') === 'false', '弹窗关闭恢复焦点 '+JSON.stringify({open:dialog.open,focus:document.activeElement?.outerHTML,expanded:openButton.getAttribute('aria-expanded')}));
      modal.open(); modal.close(); modal.open(); await new Promise(resolve => setTimeout(resolve, 30));
      check(dialog.open && openButton.getAttribute('aria-expanded') === 'true' && dialog.style.getPropertyValue('--ui-viewport-height'), '过期 close 事件不得清除重新打开的状态与可见视口');
      modal.close(); check(!dialog.style.getPropertyValue('--ui-viewport-height'), '关闭释放可见视口状态'); modal.destroy();
      modal.open();check(!dialog.open && !dialog.style.getPropertyValue('--ui-viewport-height'), '已销毁弹窗不能重新打开或重新注册视口监听');
      const activeDialog=ui.Dialog({children:ui.Input()}), activeTrigger=ui.Button({text:'销毁打开的弹窗'});host.append(activeTrigger,activeDialog);activeTrigger.focus();
      const activeModal=ui.dialogController(activeDialog,{trigger:activeTrigger,initialFocus:activeDialog.firstChild});activeModal.open();activeModal.destroy();activeModal.destroy();
      check(!activeDialog.open && activeDialog.inert && document.activeElement===activeTrigger && activeTrigger.getAttribute('aria-expanded')==='false' && !activeDialog.style.getPropertyValue('--ui-viewport-height'), '销毁打开的弹窗同步释放模态状态与焦点');
      return ['factory identity', 'safe composition', 'fields/forms', 'multiline/collection', 'tabs/keyboard', 'dialogs/focus', 'disclosure', 'state/lifecycle', 'SVG namespace'];
    } finally {host.remove();}
  });
  const routes = await page.evaluate(async () => (await import('/navigation.js')).toolGroups.flatMap(group => group.items).map(([id]) => id).filter(id => !id.includes('/')));
  assert.equal(routes.length, toolPages.length);
  const coverage = [];
  for (const route of routes) {
    await page.evaluate(id => {location.hash = '#' + id;}, route);
    await page.waitForSelector('#panel-' + route, {state: 'visible'});
    if (['fragments', 'chess', 'life', 'model'].includes(route)) await page.waitForSelector(`#r4-${route} input`, {state: 'attached'});
    coverage.push(await page.evaluate(async id => {
      const {componentOf} = await import('/ui/index.js');
      const panel = document.getElementById('panel-' + id);
      const controls = [...panel.querySelectorAll('button,input,select,textarea,dialog,details,table,dl,label')];
      const missed = controls.filter(node => !componentOf(node)).map(node => node.id || node.className || node.tagName);
      const footer = panel.querySelector(':scope > .tool-provenance');
      if (componentOf(panel) !== 'tool-panel') missed.push('ToolPanel');
      if (componentOf(panel.querySelector('.page-heading')) !== 'tool-header') missed.push('ToolHeader');
      if (componentOf(panel.querySelector('.tool-help-panel')) !== 'tool-help') missed.push('ToolHelp');
      // These pages contain original logic/content. Every dependency-bearing
      // route still requires an actual component provenance footer at the end.
      const {TASK_PROJECT_SOURCES}=await import('/project-source-contracts.js');
      const original=['extract','knowledge','keyboard-extra'].includes(id)||TASK_PROJECT_SOURCES['native:'+id]?.urls.length===0;
      if (original ? Boolean(footer) : componentOf(footer) !== 'provenance' || panel.lastElementChild !== footer) missed.push('Provenance');
      return {route: id, controls: controls.length, missed};
    }, route));
  }
  assert.deepEqual(coverage.filter(row => row.missed.length), [], '全部页面与按需加载控件使用组件');
  await page.evaluate(() => {location.hash = '#cyberchef';}); await page.waitForSelector('#panel-cyberchef', {state: 'visible'});
  const fontList=value=>value.replace(/['"]/g,'').split(',').map(name=>name.trim()).join(',');
  for (const width of [1440, 800, 390, 320]) {
    await page.setViewportSize({width, height: 900});
    const headings=await page.evaluate(async()=>{
      const {ToolHeader}=await import('/ui/index.js');
      return ['', 'page-heading'].map(className=>{
        const header=ToolHeader({className,title:'动态标题 中文 Test'});document.body.append(header);
        try{const style=getComputedStyle(header.querySelector('h1'));return {family:style.fontFamily,body:style.getPropertyValue('--body').trim(),weight:style.fontWeight,size:style.fontSize};}finally{header.remove();}
      });
    });
    for(const heading of headings){assert.equal(fontList(heading.family),fontList(heading.body),'动态标题统一字体');assert.equal(heading.weight,'600');assert.equal(heading.size,width<=800?'21px':'25px',`动态标题响应式字号 ${width}`);}

    const sizes = await page.locator('#chef-input, #chef-output').evaluateAll(nodes => nodes.map(node => {
      const parent = node.parentElement, style = getComputedStyle(parent);
      return {width: node.getBoundingClientRect().width, content: parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)};
    }));
    for (const size of sizes.filter(size => size.width)) assert(size.width >= size.content - 2, `输入结果编辑器应填满可用宽度 ${width}: ${JSON.stringify(size)}`);
  }
  assert.deepEqual(errors, []); assert.deepEqual(missing, []); assert.deepEqual(external, []);
  console.log(JSON.stringify({status: 'passed', behaviors, routes: coverage.length, component_controls: coverage.reduce((sum, row) => sum + row.controls, 0), viewports: [320, 390, 800, 1440]}, null, 2));
} finally {await browser.close();}
