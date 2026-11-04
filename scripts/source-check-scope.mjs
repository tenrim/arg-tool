// Read both fixed manifests without Node's default 1 MiB subprocess output limit.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
export function sourceSnapshotChanged({ base = 'HEAD^', cwd = process.cwd() } = {}) {
  const previous = JSON.parse(
    execFileSync(
      'git',
      [
        '-c',
        `safe.directory=${cwd.replaceAll('\\', '/')}`,
        'show',
        base + ':dependencies.lock.json',
      ],
      {
        cwd,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      },
    ),
  );
  const current = JSON.parse(readFileSync(resolve(cwd, 'dependencies.lock.json'), 'utf8'));
  return current.snapshot !== previous.snapshot;
}
