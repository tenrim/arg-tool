// Exhaustive tracked-file inventory. Immutable assets are classified, not reformatted.
import { execFileSync } from 'node:child_process';
import { access, readFile, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import assert from 'node:assert/strict';
import { moduleGraph, cyclesOf, sourceFiles } from './module-graph.mjs';
const paths = [
  ...new Set(
    execFileSync(
      'git',
      [
        '-c',
        `safe.directory=${process.cwd().replaceAll('\\', '/')}`,
        'ls-files',
        '--cached',
        '--others',
        '--exclude-standard',
        '-z',
      ],
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
    )
      .split('\0')
      .filter(Boolean),
  ),
].sort();
const deleted = new Set(
  execFileSync(
    'git',
    ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, 'ls-files', '--deleted', '-z'],
    { encoding: 'utf8' },
  )
    .split('\0')
    .filter(Boolean),
);
const fixed = /^(?:upstream\/|public\/(?:vendor|fonts|licenses)\/)/;
const history = /^docs\/(?:archive|history|releases|knowledge-review|completion-20261017)\//;
const generated = new Set([
  'public/ui/components.css',
  'public/knowledge/catalogue.js',
  'public/qalculate/unit-definitions.json',
  'docs/EVENT_CONTRACTS.md',
  'DEPENDENCY_AUDIT.json',
]);
const roots = new Set([
  'public',
  'scripts',
  'services',
  'tests',
  'tools',
  'test-tools',
  'docs',
  'deploy',
  '.github',
  '.openai',
  'android-test',
]);
const totals = {},
  files = [],
  failures = [];
for (const path of paths) {
  if (deleted.has(path)) continue;
  const kind = fixed.test(path)
    ? '固定来源与资源'
    : history.test(path)
      ? '历史记录'
      : generated.has(path)
        ? '生成产物'
        : path.endsWith('.log')
          ? '本机日志'
          : path.startsWith('android-test/')
            ? '本机 Android 原型（保留未提交状态）'
            : '维护文件';
  totals[kind] = (totals[kind] || 0) + 1;
  if (kind === '固定来源与资源') {
    const digest = createHash('sha256');
    let size = 0;
    for await (const chunk of createReadStream(path)) {
      digest.update(chunk);
      size += chunk.length;
    }
    files.push({
      path,
      kind,
      bytes: size,
      sha256: digest.digest('hex'),
      checks: ['读取与摘要；来源一致性另见完整性审计'],
    });
    continue;
  }
  if (path.includes('/') && !roots.has(path.split('/')[0]))
    failures.push(`未登记的根目录：${path}`);
  const bytes = await readFile(path);
  const extension = extname(path);
  const checks = ['读取与摘要'];
  if (
    [
      '.js',
      '.mjs',
      '.css',
      '.md',
      '.json',
      '.py',
      '.ps1',
      '.html',
      '.yml',
      '.toml',
      '.conf',
      '.example',
      '.txt',
    ].includes(extension)
  ) {
    try {
      const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      checks.push('UTF-8');
      if (extension === '.json') {
        JSON.parse(source);
        checks.push('JSON 解析');
      }
      if (
        /\.(?:js|mjs)$/.test(path) &&
        /^(scripts|tests)\//.test(path) &&
        /(?:\/usr\/bin\/chromium|C:\/Users\/\d+\/AppData\/Local\/ms-playwright)/.test(source)
      )
        failures.push(`测试硬编码浏览器路径：${path}`);
    } catch (error) {
      failures.push(`${path}: ${error.message}`);
    }
  }
  files.push({
    path,
    kind,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    checks,
  });
}
// Frontend contracts have their own audit. Include server modules here so
// service-to-service coupling and missing runtime imports cannot escape it.
const services = await sourceFiles('services');
const graph = await moduleGraph([...(await sourceFiles('public')), ...services]);
const serviceImports = {};
for (const file of services) {
  const imports = graph.get(file).imports;
  serviceImports[file] = imports;
  for (const target of imports) {
    try {
      await access(target);
    } catch {
      failures.push(`${file}: 缺失依赖 ${target}`);
    }
    if (!target.startsWith(file.split('/').slice(0, 2).join('/') + '/'))
      failures.push(`${file}: 服务跨界依赖 ${target}`);
  }
}
const cycles = cyclesOf(graph);
if (cycles.length) failures.push(...cycles.map((c) => `运行时代码循环依赖：${c.join(' -> ')}`));
const report = {
  runtimeModules: graph.size,
  runtimeCycles: cycles,
  serviceImports,
  scope:
    '逐个清点全部 Git 文件；固定来源另由完整性审计校验。此表是文件级检查记录，不把静态检查称为逐行人工审计。',
  deleted: [...deleted],
  total: paths.length - deleted.size,
  totals,
  failures,
  files,
};
const index = process.argv.indexOf('--report');
if (index >= 0) {
  assert(process.argv[index + 1], '--report requires a path');
  await writeFile(process.argv[index + 1], JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ total: report.total, totals, failures }, null, 2));
assert.deepEqual(failures, [], '全仓文件检查失败');
