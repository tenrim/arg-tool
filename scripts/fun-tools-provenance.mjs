import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { zipSync } from '../public/vendor/round2/fflate.js';
const root = path.resolve(import.meta.dirname, '..');
const upstream = path.join(root, 'upstream/fun-tools');
const out = path.join(root, 'public/vendor/fun-tools');
export async function provenance() {
  for (const dir of await readdir(upstream, { withFileTypes: true })) {
    if (!dir.isDirectory() || dir.name === 'node_modules') continue;
    let record;
    try {
      record = JSON.parse(await readFile(path.join(upstream, dir.name, 'SOURCE.json'), 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    for (const [file, hash] of Object.entries(record.files)) {
      const bytes = await readFile(path.join(upstream, dir.name, 'source', file));
      if (createHash('sha256').update(bytes).digest('hex') !== hash)
        throw Error(`固定源码已变化：${dir.name}/${file}`);
    }
    await writeFile(
      path.join(out, dir.name + '-SOURCE.json'),
      JSON.stringify(record, null, 2) + '\n',
    );
  }
  const notices = [
    '依赖许可证原文。以下包含固定构建环境的依赖；并非每个包都会装入网页。\nStegCloak 使用原版 UMD；CLI 的 inquirer、external-editor、tmp 不进入网页或服务器运行链。\nAAC/FAAD2 解码进程独立按 GPL-2.0 提供，对应源代码见 fun-tools-sources.zip。\n',
  ];
  async function packages(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const dir = path.join(folder, entry.name);
      if (entry.name.startsWith('@')) {
        await packages(dir);
        continue;
      }
      let pkg;
      try {
        pkg = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8'));
      } catch {
        continue;
      }
      const files = (await readdir(dir)).filter((name) =>
        /^(license|licence|copying|notice)(\.|$)/i.test(name),
      );
      notices.push(
        `\n===== ${pkg.name} ${pkg.version} · ${typeof pkg.license === 'string' ? pkg.license : JSON.stringify(pkg.license)} =====\n`,
      );
      if (!files.length)
        notices.push(
          '许可声明：' +
            JSON.stringify({
              license: pkg.license,
              author: pkg.author,
              repository: pkg.repository,
            }) +
            '\n',
        );
      for (const name of files) notices.push(await readFile(path.join(dir, name), 'utf8'));
      try {
        await packages(path.join(dir, 'node_modules'));
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
    }
  }
  await packages(path.join(upstream, 'node_modules'));
  await writeFile(path.join(out, 'DEPENDENCIES-NOTICE.txt'), notices.join('\n'));
  await writeFile(
    path.join(out, 'FAAD2-COPYING.txt'),
    await readFile(path.join(upstream, 'faad2/source/COPYING')),
  );
  await writeFile(
    path.join(out, 'GPL-2.0.txt'),
    await readFile(path.join(upstream, 'faad2/source/COPYING')),
  );
  await writeFile(
    path.join(out, 'moon-core-LICENSE.txt'),
    await readFile(path.join(upstream, 'moon-core/source/LICENSE')),
  );
  const archive = {};
  async function collect(folder, prefix) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      if (['.git', '.bin', '_build', '.mooncakes', 'outputs', '.cache'].includes(entry.name))
        continue;
      const p = path.join(folder, entry.name),
        name = prefix + '/' + entry.name;
      if (entry.isDirectory()) await collect(p, name);
      else if (entry.isFile())
        archive[name] = [
          new Uint8Array(await readFile(p)),
          { mtime: new Date('2026-11-03T00:00:00Z') },
        ];
    }
  }
  await collect(upstream, 'upstream/fun-tools');
  await collect(path.join(root, 'public/fun-tools'), 'public/fun-tools');
  for (const file of [
    'scripts/build-fun-tools.mjs',
    'scripts/fun-tools-provenance.mjs',
    'scripts/fetch-fun-tools.py',
    'tools/ui-runtime/package.json',
    'tools/ui-runtime/package-lock.json',
    'docs/FUN_TOOLS.md',
  ])
    archive[file] = new Uint8Array(await readFile(path.join(root, file)));
  // The bundler's archive dependency is shipped with its original license.
  for (const file of ['public/vendor/round2/fflate.js', 'public/vendor/round2/LICENSES.txt']) {
    try {
      archive[file] = new Uint8Array(await readFile(path.join(root, file)));
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
  await mkdir(out, { recursive: true });
  await writeFile(path.join(out, 'fun-tools-sources.zip'), zipSync(archive, { level: 6 }));
  console.log('固定源码、依赖许可证与对应源码包已生成。');
}
