import { AnalysisError } from './data.js';

// These workers accept independent jobs. Within an analysis, the lookup workers
// can keep their bundled dictionaries and indexes until the pool is disposed.
const reusableURLs = new Set([
  new URL('./worker.js', import.meta.url).href,
  new URL('./puzzle-worker.js', import.meta.url).href,
  new URL('./hanzi-worker.js', import.meta.url).href,
  new URL('../hunt-worker.js', import.meta.url).href,
]);
export function createAnalysisWorkerPool() {
  const idle = new Map();
  let disposed = false;
  return {
    take(url) {
      const worker = idle.get(String(url));
      idle.delete(String(url));
      return worker;
    },
    release(url, worker) {
      const key = String(url);
      if (disposed || !reusableURLs.has(key)) return worker.terminate();
      idle.get(key)?.terminate();
      idle.set(key, worker);
    },
    dispose() {
      disposed = true;
      for (const worker of idle.values()) worker.terminate();
      idle.clear();
    },
  };
}

// URLs are supplied by fixed internal adapters, never by a plan or a clue.
export function workerJob(
  url,
  payload,
  { signal, read = (data) => data.result, type = 'module', workerPool },
) {
  return new Promise((resolve, reject) => {
    let worker,
      ended = false;
    const finish = (error, result, reusable = false) => {
      if (ended) return;
      ended = true;
      signal.removeEventListener('abort', abort);
      if (worker) {
        worker.onmessage = worker.onerror = worker.onmessageerror = null;
        if (reusable && workerPool) workerPool.release(url, worker);
        else worker.terminate();
      }
      error ? reject(error) : resolve(result);
    };
    const abort = () => finish(signal.reason || new AnalysisError('CANCELLED', '分析已停止。'));
    if (signal.aborted) return abort();
    signal.addEventListener('abort', abort, { once: true });
    try {
      worker = workerPool?.take(url) || new Worker(url, { type });
      worker.onerror = (event) => {
        event.preventDefault();
        finish(new AnalysisError('ENGINE_UNAVAILABLE', '本地分析引擎加载失败。'));
      };
      worker.onmessageerror = () =>
        finish(new AnalysisError('EXECUTION_FAILED', '无法读取分析结果。'));
      worker.onmessage = ({ data }) => {
        if (data.kind === 'progress' || data.done === false) return;
        if (data.error)
          finish(
            new AnalysisError(
              data.error.code || 'EXECUTION_FAILED',
              typeof data.error === 'string' ? data.error : data.error.message,
            ),
            undefined,
            true,
          );
        else {
          try {
            finish(null, read(data), true);
          } catch (error) {
            finish(error);
          }
        }
      };
      worker.postMessage(payload);
    } catch {
      finish(new AnalysisError('ENGINE_UNAVAILABLE', '无法启动本地分析线程。'));
    }
  });
}
