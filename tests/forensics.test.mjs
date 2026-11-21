import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { validateJob, createForensicsService } from '../services/forensics/index.mjs';
import { containerCommand, runContainer } from '../services/forensics/process.mjs';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { runCode } from '../services/code-runner/process.mjs';
import { createCodeRunnerService } from '../services/code-runner/index.mjs';
import { FORENSICS_TASKS } from '../public/forensics/catalog.js';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const job = () => ({
  engine: 'strings',
  filename: 'proof.bin',
  password: '',
  data: Buffer.from('proof').toString('base64'),
  options: {},
});

test('分析及代码服务的镜像缺失返回 503；恢复后下一次任务正常执行', async (t) => {
  for (const [name, create, run, input, result] of [
    ['forensics', createForensicsService, runContainer, job(), { complete: true, files: [] }],
    [
      'code',
      createCodeRunnerService,
      runCode,
      { language: 'bash', code: 'echo ok', input: '' },
      { status: 'ok', run: { stdout: 'ok\n' } },
    ],
  ]) {
    await t.test(name, async () => {
      let missing = true;
      const spawnImpl = (_command, args) => {
        assert.ok(args.includes('--pull=never'), '任务不得自动下载替代镜像');
        const child = new EventEmitter();
        child.stdout = new PassThrough();
        child.stderr = new PassThrough();
        child.stdin = new PassThrough();
        child.stdin.on('finish', () =>
          queueMicrotask(() => {
            if (missing)
              child.stderr.write(
                'docker: Error response from daemon: No such image: sha256:private-id',
              );
            else child.stdout.write(JSON.stringify(result));
            child.emit('close', missing ? 125 : 0);
          }),
        );
        return child;
      };
      const service = create({
        env: { FORENSICS_ENABLED: '1', CODE_RUNNER_ENABLED: '1' },
        execute: (value, options) => run(value, { ...options, spawnImpl }),
      });
      const server = createServer(service.handle);
      await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
      const origin = `http://127.0.0.1:${server.address().port}`;
      const request = () =>
        fetch(origin, {
          method: 'POST',
          headers: { Origin: origin, 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
      try {
        const failure = await request();
        assert.equal(failure.status, 503);
        const body = await failure.json();
        assert.equal(body.code, 'ENGINE_UNAVAILABLE');
        assert.match(body.error, /环境缺失/);
        assert.doesNotMatch(body.error, /sha256|private-id|docker/);
        missing = false;
        await new Promise((resolve) => setTimeout(resolve, 2050));
        const recovered = await request();
        assert.equal(recovered.status, 200);
        assert.deepEqual(await recovered.json(), result);
      } finally {
        service.close();
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
      }
    });
  }
});

test('固定上游原始文件和 OpenStego 发行包保持摘要一致', async () => {
  const root = new URL('../upstream/aperisolve-single/', import.meta.url);
  const source = JSON.parse(await readFile(new URL('SOURCE.json', root), 'utf8'));
  assert.equal(source.commit, 'feec31092f0e548513d76545293caa41eb4f1ad8');
  for (const file of source.files) {
    const hash = createHash('sha256')
      .update(await readFile(new URL(file.path, root)))
      .digest('hex');
    assert.equal(hash, file.sha256, file.path);
  }
  const { openstego } = JSON.parse(await readFile(new URL('RUNTIME_SOURCE.json', root), 'utf8'));
  assert.equal(
    createHash('sha256')
      .update(await readFile(new URL(openstego.file, root)))
      .digest('hex'),
    openstego.sha256,
  );
});
test('原 17 个服务端分析器和 StegoVeritas 入口；不接受命令和路径参数', () => {
  assert.equal(
    new Set(FORENSICS_TASKS.filter((t) => t.engine !== 'image-survey').map((t) => t.engine)).size,
    18,
  );
  for (const engine of FORENSICS_TASKS.map((t) => t.engine))
    assert.equal(validateJob({ ...job(), engine }).engine, engine);
  for (const bad of [
    { engine: 'sh' },
    { data: 'abcd==' },
    { password: 'bad\nvalue' },
    { options: { command: 'rm' } },
    { options: { encoding: 'shell' } },
    { options: { minimum: 0 } },
  ])
    assert.throws(() => validateJob({ ...job(), ...bad }));
  assert.throws(() => containerCommand({ FORENSICS_TRANSPORT: 'ssh' }, ['run', 'a;echo']));
  assert.deepEqual(containerCommand({}, ['run', 'test']), ['docker', ['run', 'test']]);
});
test('大文件编码验证不递归溢出、不接受尾部非规范填充', () => {
  assert.equal(
    validateJob({ ...job(), data: Buffer.alloc(3 * 1024 * 1024).toString('base64') }).engine,
    'strings',
  );
  assert.throws(() => validateJob({ ...job(), data: 'AB==' }));
});
test('服务器文件允许恰好 20 MB，拒绝多一个字节及旧 32 MB 范围', () => {
  const size = 20 * 1024 * 1024;
  assert.equal(
    validateJob({ ...job(), data: Buffer.alloc(size).toString('base64') }).engine,
    'strings',
  );
  for (const length of [size + 1, 32 * 1024 * 1024]) {
    assert.throws(
      () => validateJob({ ...job(), data: Buffer.alloc(length).toString('base64') }),
      /20 MB/,
    );
  }
});
test('服务拒绝跨源、并发；断开连接取消底层执行', async () => {
  let signal,
    calls = 0;
  const service = createForensicsService({
    env: { FORENSICS_ENABLED: '1' },
    execute: (_, o) => {
      calls++;
      signal = o.signal;
      return new Promise((resolve, reject) =>
        o.signal.addEventListener('abort', () => reject(Error('cancelled')), { once: true }),
      );
    },
  });
  const server = createServer(service.handle);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (origin = base, abortSignal) =>
    fetch(base, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify(job()),
      signal: abortSignal,
    });
  try {
    assert.equal((await request('https://wrong.invalid')).status, 403);
    const controller = new AbortController();
    const pending = request(base, controller.signal).catch(() => null);
    for (let i = 0; i < 100 && !signal; i++) await new Promise((r) => setTimeout(r, 5));
    assert.equal(calls, 1);
    assert.equal((await request()).status, 429);
    controller.abort();
    await pending;
    for (let i = 0; i < 100 && !signal.aborted; i++) await new Promise((r) => setTimeout(r, 5));
    assert.ok(signal.aborted);
  } finally {
    service.close();
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});
