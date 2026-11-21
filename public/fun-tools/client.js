import { takeWorker } from '../prepared-worker.js';
import { lookupWorker, releaseLookup } from '../idle-worker.js';
const builtin = new URL('./worker.js', import.meta.url);
// Reference: CyberChef BackgroundWorkerWaiter.mjs:94–101; terminate cancels real work.
export function createJob(url = builtin, type = 'classic') {
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
      const reusable = String(url) === builtin.href && ['qr', 'scan'].includes(payload.kind);
      const worker = reusable ? lookupWorker(url, { type }) : takeWorker(url, { type });
      const job = { worker, reject };
      active = job;
      const finish = (error, value) => {
        if (active !== job) return;
        active = null;
        clearTimeout(job.timer);
        if (!error && reusable) releaseLookup(worker);
        else worker.terminate();
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
