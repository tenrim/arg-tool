import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { SERVER_LANGUAGES } from '../public/coderunner/server-catalog.js';
import { LANGUAGES } from '../public/coderunner/catalog.js';
import { createCodeRunnerService, validateCodeJob } from '../services/code-runner/index.mjs';
import { containerArgs, containerCommand } from '../services/code-runner/process.mjs';

test('all declared server languages have actual runtime profiles, examples and discovery groups', async () => {
  const profiles = JSON.parse(await readFile('services/code-runner/profiles.json'));
  assert.deepEqual(Object.keys(profiles), Object.keys(SERVER_LANGUAGES));
  assert.equal(Object.keys(profiles).length, 17);
  assert.equal(Object.values(LANGUAGES).filter((l) => l.group === '冷门／解谜').length, 6);
  for (const [id, language] of Object.entries(SERVER_LANGUAGES)) {
    assert.equal(profiles[id].file.split('.').at(-1), language.ext);
    assert.ok(profiles[id].run.length);
    assert.ok(language.example.includes('你好'));
  }
});

test('validate server input by UTF-8 bytes and allowlist; ignore arbitrary execution configuration', () => {
  const value = {
    language: 'c',
    code: 'x',
    input: '迷雾\r\n',
    command: 'anything',
    image: 'anything',
  };
  assert.deepEqual(validateCodeJob(value), { language: 'c', code: 'x', input: '迷雾\r\n' });
  for (const language of ['python', '__proto__', '../c', 'c;id'])
    assert.throws(() => validateCodeJob({ ...value, language }));
  assert.throws(() => validateCodeJob({ ...value, code: '' }));
  assert.throws(() => validateCodeJob({ ...value, input: '中'.repeat(100000) }));
});

test('sandbox runs without network, privilege, mounts or runtime downloads', () => {
  const args = containerArgs('mist-code-test', 'mist-code-runner:20261103');
  for (const flag of [
    '--network=none',
    '--read-only',
    '--cap-drop=ALL',
    '--security-opt=no-new-privileges',
    '--user=65534:65534',
    '--pull=never',
  ])
    assert.ok(args.includes(flag));
  assert.ok(!args.includes('--privileged'));
  assert.ok(!args.some((a) => a.startsWith('--volume')));
  assert.throws(() => containerArgs('mist-code-test', 'bad;id'));
  assert.throws(() =>
    containerCommand({ CODE_RUNNER_TRANSPORT: 'ssh', CODE_RUNNER_SSH_HOST: '-o bad' }, args),
  );
  assert.ok(
    containerCommand(
      { CODE_RUNNER_TRANSPORT: 'ssh', CODE_RUNNER_SSH_HOST: 'sandbox-host' },
      args,
    )[1].includes('StrictHostKeyChecking=yes'),
  );
});

async function site(execute, env = { CODE_RUNNER_ENABLED: '1' }) {
  const service = createCodeRunnerService({ env, execute });
  const server = createServer((req, res) => service.handle(req, res));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  return {
    origin,
    service,
    request: (body, headers = {}) =>
      fetch(origin + '/api/code/run', {
        method: 'POST',
        headers: { Origin: origin, 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      }),
    close: async () => {
      service.close();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

test('service requires an explicit enabled deployment and matching origin', async () => {
  let calls = 0;
  const s = await site(async () => {
    calls++;
  }, {});
  try {
    assert.equal((await s.request({})).status, 503);
    assert.equal((await s.request({}, { Origin: 'https://unrelated.invalid' })).status, 403);
    assert.equal((await fetch(s.origin)).status, 405);
    assert.equal(calls, 0);
  } finally {
    await s.close();
  }
});

test('service preserves separate stdout, stderr and compile failure instead of faking success', async () => {
  const result = {
    status: 'compile_error',
    compile: { stdout: '', stderr: 'invalid declaration', exitCode: 1 },
    run: null,
    version: 'gcc',
  };
  let seen;
  const s = await site(async (job) => {
    seen = job;
    return result;
  });
  try {
    const response = await s.request({ language: 'c', code: 'invalid', input: '迷雾\r\n' });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), result);
    assert.equal(seen.input, '迷雾\r\n');
  } finally {
    await s.close();
  }
});

test('service serializes jobs and cancels the actual execution on disconnect', async () => {
  let started, cancelled;
  const running = new Promise((resolve) => {
    started = resolve;
  });
  const stopped = new Promise((resolve) => {
    cancelled = resolve;
  });
  const s = await site(
    (_job, { signal }) =>
      new Promise((_resolve, reject) => {
        started();
        signal.addEventListener(
          'abort',
          () => {
            cancelled();
            reject(Error('cancelled'));
          },
          { once: true },
        );
      }),
  );
  const controller = new AbortController();
  try {
    const pending = fetch(s.origin, {
      method: 'POST',
      headers: { Origin: s.origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'bash', code: 'sleep 5', input: '' }),
      signal: controller.signal,
    }).catch(() => {});
    await running;
    assert.equal((await s.request({ language: 'c', code: 'x', input: '' })).status, 429);
    controller.abort();
    await Promise.race([
      stopped,
      new Promise((_, reject) => setTimeout(() => reject(Error('not cancelled')), 3000).unref()),
    ]);
    await pending;
  } finally {
    await s.close();
  }
});
