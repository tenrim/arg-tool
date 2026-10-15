import test from 'node:test';
import assert from 'node:assert/strict';
import {javascriptViolations as js, cssViolations as css, catalogueViolations as catalogue, uiOwnership} from '../scripts/ui-policy.mjs';

test('UI ownership treats Windows and POSIX paths equally without widening the component boundary',()=>{
  for(const path of ['public/ui/core.js','public/ui/motion.js','public/ui/components.css','public/ui-other.js','public/app.js']){
    assert.deepEqual(uiOwnership(path.replaceAll('/','\\')),uiOwnership(path));
  }
  assert.deepEqual(js("document.createElement('div')",uiOwnership('public\\ui\\core.js')),[]);
  assert(js("document.createElement('div')",uiOwnership('public\\app.js')).length);
  assert(js('node.animate([])',uiOwnership('public\\ui\\core.js')).length);
  assert.deepEqual(js('node.animate([])',uiOwnership('public\\ui\\motion.js')),[]);
  assert.equal(uiOwnership('public/ui-other.js').component,false);
});

test('UI boundary catches raw HTML insertion through ordinary and bracket access', () => {
  for (const source of ["document.createElement('button')", "document['createElement']('input')", 'n.innerHTML += text', "n['outerHTML'] = text", "n.insertAdjacentHTML('beforeend', value)", 'range.createContextualFragment(value)', "new window.Option('A')"])
    assert(js(source).some(issue=>issue.startsWith('ui-factory:')), source);
  assert.deepEqual(js("render(host, template); const input = Input(); input.value = clue;"), []);
  assert.deepEqual(js("document.createElementNS('http://www.w3.org/2000/svg', 'path');"), []);
});
test('application modules use a single public component API', () => {
  for (const source of ["import {Input} from '../ui/controls.js';", "export {Icon} from './ui/icons.js';", "await import('/ui/motion.js');"])
    assert(js(source).some(issue=>issue.startsWith('ui-entry:')), source);
  assert.deepEqual(js("import {Input, animatePresence} from '../ui/index.js';"), []);
  assert.deepEqual(js("import {Input} from './controls.js';", {component:true}), []);
});
test('native and inline motion cannot bypass central cancellation and preference handling', () => {
  for (const source of ['node.animate(frames, options)', "node['animate'](frames)", "node.style.transition = 'all 1s'", "node.style['animationDuration'] = '1s'", "node.style.setProperty('transition', 'all 1s')"])
    assert(js(source).some(issue=>issue.startsWith('ui-motion:')), source);
  assert.deepEqual(js('requestAnimationFrame(draw); animatePresence(panel); animateCollection(list, update);'), []);
  assert.deepEqual(js('node.animate(frames)', {component:true,motion:true}), []);
});
test('page CSS allows instant reduced-motion fallback but no independent transitions or tokens', () => {
  for (const source of ['.tool{transition:opacity .2s}', '.tool{animation:fade 1s}', '@keyframes fade{to{opacity:1}}', ':root{--ui-motion-enter:500ms}', '.tool{transition-duration:2s}']) assert(css(source).length, source);
  assert.deepEqual(css('@media(prefers-reduced-motion:reduce){.tool{animation:none!important;transition:none!important}}'), []);
  assert.deepEqual(css('.tool{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}'), []);
});
test('shared component appearance is owned by the component stylesheet', () => {
  const paint='[data-ui=field]{background:red;outline:none;font-size:10px}';
  assert(css(paint).some(issue=>issue.startsWith('ui-style:')));
  assert.deepEqual(css(paint, {component:true}), []);
  assert.deepEqual(css('[data-ui=card]{grid-column:1/-1;max-width:100%;gap:8px}'), []);
});
test('new catalogue routes require help without freezing the existing route count', () => {
  const groups=[{items:[['new-tool','新工具'],['new-tool/format','格式']]}];
  assert.deepEqual(catalogue(groups,{ 'new-tool':{steps:['输入线索，然后执行。']} }), []);
  assert(catalogue(groups,{}).some(issue=>issue.startsWith('ui-help:')));
  assert(catalogue(groups,{'new-tool':{steps:['']}}).some(issue=>issue.startsWith('ui-help:')));
  assert(catalogue([{items:[['a','甲'],['a','乙']]}],{a:{steps:['使用说明']}}).some(issue=>issue.startsWith('ui-route:')));
});
test('website navigation has named routes and cannot shadow a tool',()=>{
 const groups=[{items:[['tool','工具']]}],guides={tool:{steps:['输入线索。']}};
 assert.deepEqual(catalogue(groups,guides,[{route:'home',title:'首页'}]),[]);
 assert(catalogue(groups,guides,[{route:'tool',title:'关于'}]).some(issue=>issue.startsWith('ui-route:')));
 assert(catalogue(groups,guides,[{route:'home',title:''}]).some(issue=>issue.startsWith('ui-route:')));
});
