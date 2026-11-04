export function fileJob() {
  let worker, reject, timer;
  function cancel() {
    clearTimeout(timer);
    worker?.terminate();
    worker = null;
    reject?.(Error('已停止。'));
    reject = null;
  }
  function run(data, progress = () => {}, item = () => {}) {
    cancel();
    return new Promise((resolve, fail) => {
      reject = fail;
      worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
      const finish = (error, value) => {
        clearTimeout(timer);
        worker?.terminate();
        worker = null;
        reject = null;
        error ? fail(Error(error)) : resolve(value);
      };
      worker.onmessage = ({ data }) => {
        if (data.progress) progress(data.progress);
        else if (data.item) item(data.item);
        else finish(data.error, data.result);
      };
      worker.onerror = () => finish('本地文件引擎加载或执行失败，请保留文件重试。');
      worker.onmessageerror = () => finish('结果无法读取，请重试。');
      timer = setTimeout(() => finish('本次处理超过两分钟，已停止；可减少文件后重试。'), 120000);
      progress('正在加载本地文件引擎…');
      worker.postMessage(data);
    });
  }
  return { run, cancel };
}
