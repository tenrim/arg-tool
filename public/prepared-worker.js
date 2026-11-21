// A single unused worker for the selected page. Once claimed, its controller
// owns messages, cancellation and disposal exactly as for a new worker.
let prepared;

export function clearPreparedWorker() {
  prepared?.worker.terminate();
  prepared = undefined;
}

export function prepareWorker(url, type = 'classic', init, variant) {
  clearPreparedWorker();
  const worker = new Worker(url, { type });
  prepared = { url: url.href, type, worker, variant };
  worker.onerror = worker.onmessageerror = (event) => {
    event.preventDefault();
    if (prepared?.worker === worker) clearPreparedWorker();
  };
  if (init) worker.postMessage(init);
}

export function takeWorker(url, options, variant) {
  if (!prepared || prepared.url !== String(url) || prepared.type !== (options?.type || 'classic'))
    return new Worker(url, options);
  if (prepared.variant !== variant) {
    clearPreparedWorker();
    return new Worker(url, options);
  }
  const { worker } = prepared;
  prepared = undefined;
  worker.onerror = worker.onmessageerror = null;
  return worker;
}
