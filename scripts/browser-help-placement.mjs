import assert from 'node:assert/strict';

export async function checkHelpPlacement(page,go) {
  const routes=await page.evaluate(async()=>{
    const {toolGroups}=await import('./navigation.js');
    return [...new Set(toolGroups.flatMap(group=>group.items.map(item=>item[0].split('/')[0])))];
  });
  const redundant=['选择牌面版本、花色和牌名','当前牌面编号：','可直接粘贴内容；输入不会自动执行','资料随站点提供，输入在浏览器内查询','通道、灰度、反色和对比度只调整预览','适用于 Magic Eye 随机点立体图','按需加载 · 不上传代码'];
  for(const width of [390,1440]) {
    await page.setViewportSize({width,height:900});
    for(const id of routes) {
      await go(id);
      const panel=page.locator('#panel-'+id),help=page.locator('#tool-help-'+id);
      const button=panel.locator('.tool-help-button');
      assert.equal(await button.count(),1,id+' shared help button');
      assert.equal(await help.evaluate(node=>node.hidden),true,id+' help closed by default');
      const content=await panel.innerText();
      for(const text of redundant)assert.equal(content.includes(text),false,id+' redundant prose: '+text);
      const boundary=await panel.evaluate(root=>({
        misplaced:[...root.querySelectorAll('[data-tool-help]')].filter(node=>!node.closest('.tool-help-panel')).map(node=>node.id),
        dangling:[...root.querySelectorAll('[aria-describedby]')].flatMap(node=>node.getAttribute('aria-describedby').split(/\s+/).filter(id=>!document.getElementById(id))),
        footer:root.lastElementChild.classList.contains('tool-provenance')
      }));
      assert.deepEqual(boundary.misplaced,[],id+' manual content ownership');
      assert.deepEqual(boundary.dangling,[],id+' accessible descriptions');
      assert.equal(boundary.footer,!['extract','knowledge'].includes(id),id+' third-party provenance last; original tool has none');
      const snapshot=()=>panel.evaluate(root=>[...root.querySelectorAll('input,textarea,select')].map(node=>({id:node.id,value:node.value,checked:node.checked,files:node.files?.length})));
      const before=await snapshot();
      await button.click();
      await help.waitFor({state:'visible'});
      assert.ok((await help.textContent()).length>30,id+' actual instructions');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' expanded help stays in the viewport');
      await button.click();
      await help.waitFor({state:'hidden'});
      assert.deepEqual(await snapshot(),before,id+' help preserves controls');
      if(['tarot','image','crypto','code'].includes(id)){
        await page.evaluate(()=>scrollTo(0,0));
        await page.screenshot({path:'/tmp/arg-ui-layout/cleanup-'+id+'-'+width+'.png'});
      }
    }
    console.log('PASS: '+routes.length+' tools, collapsed shared help, no duplicate prose, preserved controls/descriptions and provenance @'+width+'px');
  }
  await go('paper');
  const rule=page.locator('#paper-rule'),before=await rule.textContent();
  assert.equal(await rule.evaluate(node=>!!node.closest('#tool-help-paper')),true);
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id:'native:paper-slitherlink'}})));await page.waitForFunction(()=>document.getElementById('paper-type').value==='slitherlink');
  assert.notEqual(await rule.textContent(),before,'dynamic rules update while the manual is closed');
  await go('code');
  assert.equal(await page.locator('#code-language-note').evaluate(node=>!!node.closest('#tool-help-code')),true);
  await go('fragments');
  assert.equal(await page.locator('#frag-gesture-help').evaluate(node=>!!node.closest('#tool-help-fragments')),true);
  await go('colors');
  await page.waitForSelector('#colors-wheel-help',{state:'attached'});
  assert.equal(await page.locator('#colors-wheel-help').evaluate(node=>!!node.closest('#tool-help-colors')),true,'lazy help content uses the same owner');
  await go('tarot');
  assert.equal(await page.locator('#tarot-numbering,#tarot-attribution').count(),0);
  const footer=page.locator('#panel-tarot .tool-provenance');
  assert.match(await footer.textContent(),/Gearberry.*CC BY 4\.0/s);
  assert.match(await footer.textContent(),/Pamela Colman Smith/);
  assert.match(await footer.textContent(),/公共领域/);
  await go('crypto');
}
