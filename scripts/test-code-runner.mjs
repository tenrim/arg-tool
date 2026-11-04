// Real installed compiler/interpreter acceptance. Never replace engines with mocks.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { SERVER_LANGUAGES } from '../public/coderunner/server-catalog.js';
import { runCode, containerCommand } from '../services/code-runner/process.mjs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
const path = 'outputs/code-runner/engines.json';
await fs.mkdir('outputs/code-runner', { recursive: true });
const previous = JSON.parse(await fs.readFile(path, 'utf8').catch(() => '[]'));
const only = process.argv.slice(2);
const image = process.env.CODE_RUNNER_IMAGE || 'mist-code-runner:20261103';
const report = previous.filter((row) => row.image === image);
for (const [language, spec] of Object.entries(SERVER_LANGUAGES)) {
  if (
    only.length ? !only.includes(language) : report.some((r) => r.language === language && r.passed)
  )
    continue;
  const result = await runCode({ language, code: spec.example, input: '迷雾\n' });
  const passed = result.status === 'ok' && result.run.stdout === '你好，迷雾\n';
  const row = { language, image, passed, ...result };
  const index = report.findIndex((r) => r.language === language);
  if (index < 0) report.push(row);
  else report[index] = row;
  await fs.writeFile(path, JSON.stringify(report, null, 2));
  console.log(
    passed ? 'PASS' : 'FAIL',
    language,
    passed ? result.version.split('\n')[0] : JSON.stringify(result),
  );
}
if (only.length)
  process.exit(report.filter((r) => only.includes(r.language)).every((r) => r.passed) ? 0 : 1);
assert.equal(report.length, Object.keys(SERVER_LANGUAGES).length);
assert.ok(
  report.every((r) => r.passed),
  'Every language must actually execute',
);
const compile = await runCode({ language: 'c', code: 'int main( {', input: '' });
const nativeStdin = await runCode({
  language: 'typescript',
  code: "import {readFileSync} from 'node:fs'; process.stdout.write(readFileSync(0, 'utf8'));",
  input: '原生标准输入\n',
});
assert.equal(nativeStdin.status, 'ok');
assert.equal(nativeStdin.run.stdout, '原生标准输入\n');
assert.equal(compile.status, 'compile_error');
assert.equal(compile.run, null);
const error = await runCode({
  language: 'bash',
  code: 'printf partial; printf problem >&2; exit 7',
  input: '',
});
assert.equal(error.status, 'runtime_error');
assert.equal(error.run.exitCode, 7);
assert.equal(error.run.stdout, 'partial');
assert.equal(error.run.stderr, 'problem');
const loop = await runCode({ language: 'bash', code: 'while true; do :; done', input: '' });
assert.equal(loop.run.reason, 'timeout');
const large = await runCode({ language: 'bash', code: 'yes x', input: '' });
assert.equal(large.run.reason, 'output_limit');
const privateFile = await runCode({
  language: 'bash',
  code: 'echo test > secret.txt; echo saved',
  input: '',
});
assert.equal(privateFile.status, 'ok');
const isolated = await runCode({
  language: 'bash',
  code: 'test ! -f secret.txt && test "$(id -u)" = 65534 && test ! -S /var/run/docker.sock && echo isolated',
  input: '',
});
assert.equal(isolated.run.stdout, 'isolated\n');
const net = await runCode({
  language: 'bash',
  code: 'if timeout 2 bash -c "echo hi >/dev/tcp/1.1.1.1/80" 2>/dev/null; then echo unexpected; else echo blocked; fi',
  input: '',
});
assert.equal(net.run.stdout, 'blocked\n');
const controller = new AbortController();
const stopped = runCode(
  { language: 'bash', code: 'sleep 30', input: '' },
  { signal: controller.signal },
);
setTimeout(() => controller.abort(), 1500);
await assert.rejects(stopped, /取消/);
const [command, args] = containerCommand(process.env, ['ps', '-q', '--filter=name=mist-code-']);
const running = await exec(command, args, { windowsHide: true, timeout: 15000 });
assert.equal(running.stdout.trim(), '');
await fs.writeFile(
  'outputs/code-runner/boundaries.json',
  JSON.stringify(
    {
      passed: true,
      cases: [
        'compile_error',
        'typescript_native_stdin',
        'nonzero_exit',
        'stdout_stderr',
        'timeout',
        'output_limit',
        'fresh_environment',
        'nonroot',
        'no_host_socket',
        'no_network',
        'cancel_cleanup',
      ],
    },
    null,
    2,
  ),
);
console.log(
  'PASS real compiler errors, runtime errors, output/time limits, isolation, network denial and cancellation',
);
