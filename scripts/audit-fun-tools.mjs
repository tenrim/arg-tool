import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FUN_TASKS } from '../public/fun-tools/catalog.js';
import { FUN_SOURCES, FUN_LICENSES } from '../public/fun-tools/sources.js';
const folder = new URL('../public/vendor/fun-tools/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('MANIFEST.json', folder), 'utf8'));
for (const [file, expected] of Object.entries(manifest)) {
  if (file.includes('..') || file.includes('/') || file.includes('\\'))
    throw Error('Invalid resource name ' + file);
  const actual = createHash('sha256')
    .update(await readFile(new URL(file, folder)))
    .digest('hex');
  if (actual !== expected) throw Error('趣味工具资源摘要不一致：' + file);
}
for (const task of FUN_TASKS)
  if (!Object.hasOwn(FUN_SOURCES, task.id)) throw Error('Missing provenance ' + task.id);
for (const project of FUN_LICENSES) {
  for (const notice of [...project.notices, project.sourceArchive].filter(Boolean))
    await readFile(new URL('../public/' + notice, import.meta.url));
}
console.log(
  `趣味工具完整性：${FUN_TASKS.length} 个工作区、${Object.keys(manifest).length} 项资源与源码包通过。`,
);
