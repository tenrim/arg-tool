import { access, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cli = fileURLToPath(
  new URL('../tools/format/node_modules/prettier/bin/prettier.cjs', import.meta.url),
);
try {
  await access(cli);
} catch {
  throw Error(
    '请先运行 npm ci --ignore-scripts --prefix tools/format；格式工具不参与网页运行和主构建。',
  );
}
const scope = JSON.parse(
  await readFile(new URL('../tools/format/scope.json', import.meta.url), 'utf8'),
);
const args = process.argv.slice(2),
  write = args.includes('--write');
const files = args.filter((arg) => arg !== '--write' && arg !== '--check');
const result = spawnSync(
  process.execPath,
  [cli, write ? '--write' : '--check', ...(files.length ? files : scope)],
  { stdio: 'inherit' },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
