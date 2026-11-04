// Reference: CyberChef BackgroundWorkerWaiter.mjs:94–101; terminate cancels real work.
export function createJob(url = new URL('./worker.js', import.meta.url), type = 'classic') {
  let active;
  function cancel() {
    if (!active) return;
    const job = active;
    active = null;
    clearTimeout(job.timer);
    job.worker.terminate();
    job.reject(new DOMException('已停止', 'AbortError'));
  }
  function run(payload, progress = () => {}) {
    cancel();
    return new Promise((resolve, reject) => {
      const worker = new Worker(url, { type });
      const job = { worker, reject };
      active = job;
      const finish = (error, value) => {
        if (active !== job) return;
        active = null;
        clearTimeout(job.timer);
        worker.terminate();
        error ? reject(Error(error)) : resolve(value);
      };
      worker.onerror = (e) => finish(e.message || '本地引擎加载失败，请重试。');
      worker.onmessageerror = () => finish('本地引擎返回了无法读取的结果。');
      worker.onmessage = ({ data }) => {
        if (active !== job) return;
        if (data.progress !== undefined) progress(data.progress);
        else finish(data.error, data.result);
      };
      job.timer = setTimeout(() => finish('计算超过五分钟，已停止。'), 300000);
      worker.postMessage(payload);
    });
  }
  return { run, cancel };
}
