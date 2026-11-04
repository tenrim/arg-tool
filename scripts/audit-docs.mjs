import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import assert from 'node:assert/strict';

// Include nested contributor/release/source notes; only immutable upstream and
// archived snapshots are excluded from the default current-document check.
const root = resolve('.'),
  files = [],
  failures = [];
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', 'vendor', 'fonts', 'licenses', 'python'].includes(entry.name)) continue;
    if (entry.name === 'archive' && !process.argv.includes('--archive')) continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (entry.name.endsWith('.md')) files.push(path);
  }
}
for (const entry of await readdir('.', { withFileTypes: true }))
  if (entry.isFile() && entry.name.endsWith('.md')) files.push(resolve(entry.name));
for (const dir of ['docs', 'deploy', '.github', 'services', 'tools', 'tests', 'public'])
  await scan(dir);
let links = 0;
for (const file of files) {
  const source = await readFile(file, 'utf8');
  for (const [, href] of source.matchAll(/\[[^\]\n]+\]\(([^)\n]+)\)/g)) {
    const path = href.trim().replace(/^<|>$/g, '').split('#')[0];
    if (!path || /^[a-z][a-z\d+.-]*:/i.test(path)) continue;
    links++;
    try {
      const target = resolve(dirname(file), decodeURIComponent(path));
      assert(!relative(root, target).startsWith('..'), 'Link leaves repository');
      await access(target);
    } catch {
      failures.push(`${relative(root, file)} -> ${href}`);
    }
  }
}
assert.deepEqual(failures, [], '当前开发及部署文档存在失效的本地链接');
console.log(
  `PASS: ${files.length} Markdown documents${process.argv.includes('--archive') ? ' including archive' : ' (current)'} / ${links} local file links.`,
);
