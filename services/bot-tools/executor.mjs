import { fork, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { ApiError, LIMITS } from './protocol.mjs';

async function killTree(child) {
  if (!child.pid) return;
  if (process.platform === 'win32') {
    await new Promise((resolve, reject) => {
      const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
        windowsHide: true,
        stdio: 'ignore',
      });
      killer.once('error', reject);
      killer.once('exit', (code) => {
        if (code === 0 || child.exitCode !== null) return resolve();
        try {
          process.kill(child.pid, 0);
          reject(Error('任务进程未能终止。'));
        } catch (error) {
          if (error.code === 'ESRCH') resolve();
          else reject(error);
        }
      });
    });
  } else {
    // Playwright launches Chromium in its own POSIX process group. First let
    // its SIGTERM handler close any launch still in flight, then kill both
    // owned groups explicitly rather than only killing the Node wrapper.
    if (child.exitCode === null) {
      try {
        child.kill('SIGTERM');
      } catch {}
      await new Promise((resolve) => {
        const timer = setTimeout(done, 1000);
        function done() {
          clearTimeout(timer);
          child.removeListener('exit', done);
          resolve();
        }
        child.once('exit', done);
        if (child.exitCode !== null) done();
      });
    }
    if (child.browserPid) {
      try {
        process.kill(-child.browserPid, 'SIGKILL');
      } catch (error) {
        if (error.code !== 'ESRCH') throw error;
      }
    }
    try {
      process.kill(-child.pid, 'SIGKILL');
    } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
  }
}
export function createExecutor(config, fingerprint) {
  const active = new Set();
  return {
    get activeCount() {
      return active.size;
    },
    get activePids() {
      return [...active].flatMap((child) => [child.pid, child.browserPid].filter(Boolean));
    },
    async run(job, { signal } = {}) {
      signal?.throwIfAborted();
      const tempRoot = resolve(tmpdir());
      const temporary = await mkdtemp(join(tempRoot, 'mist-bot-task-'));
      const child = fork(fileURLToPath(new URL('./browser-task.mjs', import.meta.url)), [], {
        execArgv: [],
        // Do not inherit the API token, SMTP secrets, or unrelated service config.
        env: {
          ...Object.fromEntries(
            [
              'PATH',
              'Path',
              'SystemRoot',
              'WINDIR',
              'HOME',
              'USERPROFILE',
              'LOCALAPPDATA',
              'APPDATA',
              'NODE_PATH',
              'PLAYWRIGHT_BROWSERS_PATH',
            ]
              .filter((key) => process.env[key] !== undefined)
              .map((key) => [key, process.env[key]]),
          ),
          TEMP: temporary,
          TMP: temporary,
          TMPDIR: temporary,
        },
        windowsHide: true,
        detached: process.platform !== 'win32',
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      });
      active.add(child);
      let timer, abort;
      try {
        return await new Promise((resolve, reject) => {
          abort = () => reject(new ApiError('CANCELLED', '客户端已断开，任务已终止。', 499));
          signal?.addEventListener('abort', abort, { once: true });
          if (signal?.aborted) return abort();
          timer = setTimeout(
            () => reject(new ApiError('TIMEOUT', '任务超时，已终止执行。', 504)),
            config.timeoutMs,
          );
          child.on('message', (message) => {
            if (message?.event === 'browser-started' && Number.isInteger(message.pid))
              child.browserPid = message.pid;
            else resolve(message);
          });
          child.once('error', () =>
            reject(new ApiError('ENGINE_UNAVAILABLE', '计算进程无法启动。', 503)),
          );
          child.once('exit', () =>
            reject(new ApiError('ENGINE_UNAVAILABLE', '计算进程意外退出。', 503)),
          );
          child.send({
            job,
            config: { resourceBase: config.resourceBase, chromiumPath: config.chromiumPath },
            limits: LIMITS,
            fingerprint,
          });
        });
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
        await killTree(child);
        // This unique directory is owned solely by this task, including Chrome's
        // profile and artifacts. Never enumerate or delete other browser profiles.
        if (
          resolve(temporary).startsWith(tempRoot + sep) &&
          temporary.startsWith(join(tempRoot, 'mist-bot-task-'))
        )
          await rm(temporary, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
        active.delete(child);
      }
    },
    async close() {
      await Promise.all([...active].map(killTree));
    },
  };
}
