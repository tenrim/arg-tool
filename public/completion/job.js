import { takeWorker } from '../prepared-worker.js';
import { lookupWorker, releaseLookup } from '../idle-worker.js';
const warmTasks = new Set([
  'nato',
  'semaphore-batch',
  'marine-signals',
  'prussian',
  'gs8',
  'keyboard-extra',
  't9',
  'braille-languages',
  'integer-codecs',
  'color-codes',
  'radix64',
]);
export function completionJob(payload, { signal, onProgress = () => {} } = {}) {
  return new Promise((resolve, reject) => {
    let worker,
      timer,
      ended = false;
    const finish = (error, result) => {
      if (ended) return;
      ended = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      if (!error && worker && warmTasks.has(payload.task)) releaseLookup(worker);
      else worker?.terminate();
      error ? reject(error) : resolve(result);
    };
    const abort = () => finish(Object.assign(Error('已停止'), { name: 'AbortError' }));
    if (signal?.aborted) return abort();
    const url = new URL(
      payload.task === 'braille-languages' ? './braille-worker.js' : './worker.js',
      import.meta.url,
    );
    const options = { type: payload.task === 'braille-languages' ? 'classic' : 'module' };
    worker = warmTasks.has(payload.task) ? lookupWorker(url, options) : takeWorker(url, options);
    signal?.addEventListener('abort', abort, { once: true });
    timer = setTimeout(() => finish(Error('处理超时，已终止本次运算。')), 60000);
    worker.onerror = (e) => {
      e.preventDefault();
      finish(Error(e.message || '本地引擎加载失败。'));
    };
    worker.onmessageerror = () => finish(Error('无法读取引擎结果。'));
    worker.onmessage = ({ data }) =>
      data.progress ? onProgress(data) : finish(data.error ? Error(data.error) : null, data.result);
    worker.postMessage(payload);
  });
}
