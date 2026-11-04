import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sourceSnapshotChanged } from '../scripts/source-check-scope.mjs';

test('dependency installer roundtrip, integrity, path safety and failure preservation', () => {
  const result = spawnSync(process.env.PYTHON || 'python', ['tests/source-dependencies_test.py'], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.error?.message || result.stdout + result.stderr);
  console.log(result.stdout + result.stderr);
});
test('source distribution pins external files and keeps original grid bridge outside the bundle', async () => {
  const lock = JSON.parse(await readFile('dependencies.lock.json', 'utf8'));
  assert.equal(lock.schema, 1);
  assert(lock.files.length > 0);
  assert.match(lock.bundle.url, /^https:\/\//);
  assert.match(lock.bundle.sha256, /^[0-9a-f]{64}$/);
  assert(Number.isSafeInteger(lock.bundle.size) && lock.bundle.size > 0);
  assert(!lock.files.some((row) => row.path === 'upstream/round3/board_bridge.rs'));
  const ignore = await readFile('.gitignore', 'utf8');
  assert(ignore.includes('/public/vendor/'));
  assert(ignore.includes('/release/'));
  for (const row of lock.files) {
    assert.match(row.sha256, /^[0-9a-f]{64}$/);
    assert(Number.isSafeInteger(row.size) && row.size >= 0);
  }
});

test('optional mail template contains no credentials or original deployment domain', async () => {
  const template = await readFile('services/feedback/.env.example', 'utf8');
  for (const key of ['SMTP_USER', 'SMTP_PASS', 'REPORT_TO'])
    assert.match(template, new RegExp('^' + key + '=$', 'm'));
  assert(!template.includes('mistarg.cn'));
  assert.match(template, /ALLOWED_ORIGINS=http:\/\/localhost:3000/);
});

test('source deployment keeps optional services local by default and SSH explicitly configured', async () => {
  for (const feature of ['code-runner', 'forensics']) {
    const source = await readFile(`services/${feature}/index.mjs`, 'utf8');
    assert(!source.includes('mistarg.cn'));
    const { containerCommand } = await import(`../services/${feature}/process.mjs`);
    const prefix = feature === 'code-runner' ? 'CODE_RUNNER' : 'FORENSICS';
    assert.throws(() => containerCommand({ [prefix + '_TRANSPORT']: 'ssh' }, ['run']));
    assert.equal(
      containerCommand({ [prefix + '_TRANSPORT']: 'ssh', [prefix + '_SSH_HOST']: 'sandbox-host' }, [
        'run',
      ])[0],
      'ssh',
    );
  }
  const workflow = await readFile('.github/workflows/check.yml', 'utf8');
  assert(workflow.includes('sourceSnapshotChanged({base:'));
  assert(workflow.includes('npm run test:plan -- --base'));
  assert(workflow.includes('npm run verify:source'));
  assert(workflow.includes('npm run verify:all'));
});

test('CI snapshot comparison handles real Git manifests larger than one MiB', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'mist-source-scope-'));
  const git = (args) =>
    execFileSync('git', ['-c', `safe.directory=${cwd.replaceAll('\\', '/')}`, ...args], {
      cwd,
      stdio: 'pipe',
    });
  try {
    git(['init', '--quiet']);
    const lock = { snapshot: 'old', files: [], padding: 'x'.repeat(2 * 1024 * 1024) };
    await writeFile(join(cwd, 'dependencies.lock.json'), JSON.stringify(lock));
    git(['add', 'dependencies.lock.json']);
    git([
      '-c',
      'user.name=验证夹具',
      '-c',
      'user.email=test@example.invalid',
      'commit',
      '--quiet',
      '-m',
      '保存固定依赖验证夹具',
    ]);
    assert.equal(sourceSnapshotChanged({ base: 'HEAD', cwd }), false);
    lock.snapshot = 'new';
    await writeFile(join(cwd, 'dependencies.lock.json'), JSON.stringify(lock));
    assert.equal(sourceSnapshotChanged({ base: 'HEAD', cwd }), true);
  } finally {
    assert(cwd.startsWith(join(tmpdir(), 'mist-source-scope-')));
    await rm(cwd, { recursive: true, force: true });
  }
});
