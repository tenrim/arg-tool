// Real cancellation acceptance: no remaining isolated job after stopping startup or execution.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { runContainer, containerCommand } from '../services/forensics/process.mjs';
const exec = promisify(execFile);
const { fixtures } = JSON.parse(await fs.readFile('outputs/forensics-build/fixtures.json', 'utf8'));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function active() {
  const [cmd, args] = containerCommand(process.env, ['ps', '-q', '--filter=name=mist-forensics-']);
  const { stdout } = await exec(cmd, args, { windowsHide: true, timeout: 10000 });
  return stdout.trim();
}
assert.equal(await active(), '', 'Run only when no other forensics acceptance is active');
for (const mode of ['startup', 'running']) {
  const controller = new AbortController();
  let finished = false;
  const result = runContainer(
    { engine: 'zsteg', password: '', ...fixtures.zsteg, options: { mode: 'all' } },
    { signal: controller.signal },
  ).then(
    (value) => {
      finished = true;
      return value;
    },
    (error) => {
      finished = true;
      return error;
    },
  );
  if (mode === 'running') {
    let observed = false;
    for (let i = 0; i < 10 && !finished; i++) {
      if (await active()) {
        observed = true;
        break;
      }
      await wait(100);
    }
    assert.ok(observed, 'Expected a running container before cancellation');
  }
  controller.abort();
  assert.match((await result).message, /已取消/);
  await wait(2500);
  assert.equal(await active(), '', mode + ' cancellation left a running container');
  console.log('PASS cancellation', mode);
}
