// A snapshot import verifies distribution changes; it does not claim a full engine audit.
import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { resolve, delimiter } from 'node:path';
const env = {
  ...process.env,
  NODE_PATH: [resolve('test-tools/node_modules'), process.env.NODE_PATH]
    .filter(Boolean)
    .join(delimiter),
};
const commands = [
  ['scripts/audit-integrity.mjs'],
  ['scripts/audit-architecture.mjs'],
  [
    '--test',
    'tests/source-distribution.test.mjs',
    'tests/server.test.mjs',
    'tests/code-runner-service.test.mjs',
    'tests/forensics.test.mjs',
  ],
  ['scripts/build.mjs'],
  ['scripts/browser-deployment.mjs'],
];
const results = [];
try {
  for (const args of commands) {
    const result = spawnSync(process.execPath, args, { stdio: 'inherit', env });
    results.push({ command: ['node', ...args], exitCode: result.status });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      process.exitCode = result.status || 1;
      break;
    }
  }
} finally {
  if (process.env.ARG_SOURCE_REPORT)
    await writeFile(
      process.env.ARG_SOURCE_REPORT,
      JSON.stringify({ scope: '固定源码快照的独立分发验证，非全部工具验收', results }, null, 2) +
        '\n',
    );
}
