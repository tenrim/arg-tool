import {readdir, readFile} from 'node:fs/promises';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {toolGroups,sitePages} from '../public/navigation.js';
import {guides} from '../public/tool-help.js';
import {javascriptViolations, cssViolations, catalogueViolations, uiOwnership} from './ui-policy.mjs';

const violations = [];
let modules = 0;
let stylesheets = 0;
async function walk(dir) {
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    if (entry.isDirectory() && entry.name === 'vendor') continue;
    const file = join(dir, entry.name);
    const owner=uiOwnership(file);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith('.js')) {
      if (!owner.component) modules++;
      const source = await readFile(file, 'utf8');
      // SVG geometry has its own strict rendering/sanitizing paths. HTML UI
      // factories, template insertion and Option construction belong to ui/.
      for (const issue of javascriptViolations(source, owner)) violations.push(`${file}: ${issue}`);
    } else if (entry.name.endsWith('.css')) {
      stylesheets++;
      for (const issue of cssViolations(await readFile(file, 'utf8'), {component:owner.stylesheet})) violations.push(`${file}: ${issue}`);
    }
  }
}
await walk('public');
violations.push(...catalogueViolations(toolGroups, guides, sitePages));
assert.deepEqual(violations, [], '共享 UI 开发规则被违反；修复组件边界，不要增加页面豁免');
const entry = await readFile('public/index.html', 'utf8');
assert(!/<(?:button|input|select|textarea|dialog|section)\b/i.test(entry), 'HTML 入口只保留加载声明，不维护第二套控件');
const styles = [...entry.matchAll(/<link\b[^>]*href="([^"]+\.css)"/g)].map(match=>match[1]);
assert.equal(styles.filter(path=>path === './ui/components.css').length, 1);
assert.equal(styles.at(-1), './ui/components.css', '组件样式必须为最后的入口样式层');
assert((await readFile('public/app.js', 'utf8')).includes('mountInitialLayout();'));
const pages = toolGroups.flatMap(group => group.items).filter(([id]) => !id.includes('/'));
console.log(`PASS: ${modules} application modules, ${stylesheets} stylesheets, ${pages.length} tool routes + ${sitePages.length} website routes: shared factories, motion/style ownership, public entrypoint and required help.`);
