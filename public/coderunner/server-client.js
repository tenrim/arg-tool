// Worker-compatible transport; UI keeps its existing revision and result owner.
export function serverRunner() {
  const controller = new AbortController();
  let dead = false;
  const client = {
    onmessage: null,
    onerror: null,
    terminate() {
      dead = true;
      controller.abort();
    },
    async postMessage(job) {
      if (dead || job.kind !== 'init') return;
      try {
        const response = await fetch(new URL('../../api/code/run', import.meta.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: job.language, code: job.code, input: job.input }),
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok || result.error) throw Error(result.error || '代码运行服务请求失败');
        if (dead) return;
        if (!['ok', 'compile_error', 'runtime_error'].includes(result.status))
          throw Error('运行结果格式无效');
        const execution = result.run,
          compile = result.compile;
        const diagnostics = [
          compile?.stdout && '编译输出：\n' + compile.stdout,
          compile?.stderr && '编译诊断：\n' + compile.stderr,
          execution?.stderr,
          (execution?.reason || compile?.reason) === 'timeout' &&
            '达到时间上限，执行已停止；输出可能不完整。',
          (execution?.reason || compile?.reason) === 'output_limit' &&
            '输出超过 256 KB，执行已停止；当前内容仅为部分输出。',
        ]
          .filter(Boolean)
          .join('\n');
        client.onmessage?.({
          data: {
            kind: result.status === 'ok' ? 'done' : 'error',
            output: execution?.stdout || '',
            stderr: diagnostics,
            error:
              result.status === 'ok'
                ? ''
                : result.status === 'compile_error'
                  ? '编译失败'
                  : `程序未正常结束（退出码 ${execution?.exitCode}）`,
            elapsed: (execution?.elapsed || 0) + (compile?.elapsed || 0),
            version: result.version,
          },
        });
      } catch (error) {
        if (!dead)
          client.onmessage?.({ data: { kind: 'error', output: '', error: error.message } });
      }
    },
  };
  return client;
}
