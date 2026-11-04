import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';

export function containerCommand(env, args) {
  if (env.CODE_RUNNER_TRANSPORT !== 'ssh') return ['docker', args];
  const host = env.CODE_RUNNER_SSH_HOST || '';
  if (!/^[\w-]+$/.test(host) || args.some((a) => !/^[a-zA-Z0-9_./:=,@-]+$/.test(a)))
    throw Error('代码沙箱启动参数无效');
  return [
    'ssh',
    [
      '-o',
      'StrictHostKeyChecking=yes',
      '-o',
      'BatchMode=yes',
      host,
      'sudo',
      '-n',
      'docker',
      ...args,
    ],
  ];
}

export function containerArgs(name, image) {
  if (!/^[a-zA-Z0-9_./:@-]+$/.test(image)) throw Error('代码沙箱镜像名称无效');
  return [
    'run',
    '--rm',
    '--pull=never',
    '-i',
    '--name',
    name,
    '--network=none',
    '--read-only',
    '--cap-drop=ALL',
    '--security-opt=no-new-privileges',
    '--user=65534:65534',
    '--pids-limit=128',
    '--memory=1024m',
    '--memory-swap=1024m',
    '--cpus=0.75',
    '--ulimit=nofile=256:256',
    '--ulimit=core=0:0',
    '--tmpfs=/work:rw,exec,nosuid,nodev,size=384m,mode=1777',
    '--tmpfs=/tmp:rw,noexec,nosuid,nodev,size=16m,mode=1777',
    image,
  ];
}

export function runCode(input, { env = process.env, signal, spawnImpl = spawn } = {}) {
  if (signal?.aborted) return Promise.reject(Error('已取消'));
  const name = 'mist-code-' + randomUUID();
  const image = env.CODE_RUNNER_IMAGE || 'mist-code-runner:20261103';
  const [command, args] = containerCommand(env, containerArgs(name, image));
  return new Promise((resolve, reject) => {
    const child = spawnImpl(command, args, { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    const chunks = [];
    let size = 0,
      diagnostic = '',
      settled = false,
      cancelling = false;
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
      error ? reject(error) : resolve(result);
    };
    const remove = () =>
      new Promise((done) => {
        const [cmd, argv] = containerCommand(env, ['rm', '-f', name]);
        const cleanup = spawnImpl(cmd, argv, { windowsHide: true, stdio: 'ignore' });
        const timeout = setTimeout(() => {
          cleanup.kill();
          done();
        }, 10000);
        cleanup.on('error', () => {
          clearTimeout(timeout);
          done();
        });
        cleanup.once('close', () => {
          clearTimeout(timeout);
          done();
        });
      });
    const cancel = async () => {
      if (settled || cancelling) return;
      cancelling = true;
      child.kill();
      // A Docker startup can race the first removal, especially over SSH.
      for (let i = 0; i < 3; i++) {
        await remove();
        if (i < 2) await new Promise((done) => setTimeout(done, 500));
      }
      finish(Error(signal?.aborted ? '已取消运行' : '编译或执行超过限制，任务已停止'));
    };
    const timer = setTimeout(cancel, 90000);
    signal?.addEventListener('abort', cancel, { once: true });
    child.stdout.on('data', (chunk) => {
      size += chunk.length;
      if (size > 4 * 1024 * 1024) void cancel();
      else chunks.push(chunk);
    });
    child.stderr.on('data', (chunk) => {
      if (diagnostic.length < 2000) diagnostic += chunk.toString();
    });
    child.stdin.on('error', () => {});
    child.on('error', () => finish(Error('代码运行服务未就绪，请检查独立沙箱环境')));
    child.once('close', (code) => {
      if (cancelling || settled) return;
      if (code !== 0) return finish(Error('代码沙箱启动或执行失败：' + diagnostic));
      try {
        const result = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!['ok', 'compile_error', 'runtime_error'].includes(result.status))
          throw Error('沙箱结果无效');
        finish(null, result);
      } catch {
        finish(Error('运行引擎没有返回完整结果'));
      }
    });
    child.stdin.end(JSON.stringify(input));
    if (signal?.aborted) void cancel();
  });
}
