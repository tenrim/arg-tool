import {readdir, readFile, access} from 'node:fs/promises';
import {resolve, dirname, relative} from 'node:path';
import assert from 'node:assert/strict';

// Current contributor/deployment docs; historical snapshots are archived as-is.
const root = resolve('.'), files = [], failures = [];
for (const dir of ['.', 'docs', 'deploy', '.github']) {
  for (const entry of await readdir(dir, {withFileTypes:true}))
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(resolve(dir, entry.name));
}
let links = 0;
for (const file of files) {
  const source = await readFile(file, 'utf8');
  for (const [, href] of source.matchAll(/\[[^\]\n]+\]\(([^)\n]+)\)/g)) {
    const path = href.trim().replace(/^<|>$/g, '').split('#')[0];
    if (!path || /^[a-z][a-z\d+.-]*:/i.test(path)) continue;
    links++;
    try {
      const target=resolve(dirname(file),decodeURIComponent(path));
      assert(!relative(root,target).startsWith('..'), 'Link leaves repository');await access(target);
    } catch {failures.push(`${relative(root,file)} -> ${href}`);}
  }
}
assert.deepEqual(failures, [], '当前开发及部署文档存在失效的本地链接');
console.log(`PASS: ${files.length} current Markdown documents / ${links} local file links.`);
