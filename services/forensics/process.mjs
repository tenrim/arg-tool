import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
export function containerCommand(env, args) {
  if (env.FORENSICS_TRANSPORT === 'ssh') {
    const host = env.FORENSICS_SSH_HOST || '';
    if (!/^[a-zA-Z0-9_-]+$/.test(host)) throw Error('Invalid SSH host alias');
    // Only server-generated allowlisted arguments enter the remote shell.
    if (args.some((x) => !/^[a-zA-Z0-9_./:=,-]+$/.test(x)))
      throw Error('Invalid container argument');
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
  return ['docker', args];
}
export function runContainer(input, { env = process.env, signal, spawnImpl = spawn } = {}) {
  const name = 'mist-forensics-' + randomUUID();
  const image = env.FORENSICS_IMAGE || 'mist-forensics:20261104-limit20';
  if (!/^[a-zA-Z0-9_./:-]+$/.test(image)) throw Error('Invalid image');
  const args = [
    'run',
    '--rm',
    '-i',
    '--name',
    name,
    '--network=none',
    '--read-only',
    '--cap-drop=ALL',
    '--security-opt=no-new-privileges',
    '--pids-limit=96',
    '--memory=768m',
    '--memory-swap=768m',
    '--cpus=0.75',
    '--tmpfs=/work:rw,noexec,nosuid,size=256m,mode=1777',
    '--entrypoint=/usr/bin/timeout',
    image,
    '240',
    'python3',
    '/opt/runner.py',
  ];
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(Error('已取消'));
    const [command, commandArgs] = containerCommand(env, args);
    const child = spawnImpl(command, commandArgs, {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const chunks = [];
    let size = 0,
      error = '',
      settled = false;
    const finish = (failure, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
      failure ? reject(failure) : resolve(value);
    };
    const cancel = () => {
      const [cmd, argv] = containerCommand(env, ['rm', '-f', name]);
      const cleanup = spawnImpl(cmd, argv, { windowsHide: true, stdio: 'ignore' });
      cleanup.on('error', () => {});
      const killTimer = setTimeout(() => cleanup.kill(), 10000);
      cleanup.once('close', () => clearTimeout(killTimer));
      child.kill();
      finish(Error(signal?.aborted ? '已取消' : '任务超时或输出超过限制；没有返回截断结果'));
    };
    const timer = setTimeout(cancel, 255000);
    signal?.addEventListener('abort', cancel, { once: true });
    child.stdout.on('data', (chunk) => {
      size += chunk.length;
      if (size > 92 * 1024 * 1024) cancel();
      else chunks.push(chunk);
    });
    child.stderr.on('data', (chunk) => {
      if (error.length < 8192) error += chunk.toString();
    });
    child.on('error', () => finish(Error('分析引擎未启动，请检查独立容器运行环境')));
    child.stdin.on('error', () => {});
    child.once('close', (code) => {
      if (settled) return;
      if (code !== 0)
        return finish(Error(code === 124 ? '处理超时' : '分析引擎执行失败：' + error));
      try {
        const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        finish(null, value);
      } catch {
        finish(Error('引擎未返回完整、可读取的结果'));
      }
    });
    child.stdin.end(JSON.stringify(input));
  });
}
