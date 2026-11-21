import { takeWorker } from './prepared-worker.js';
// Keep at most one completed lookup warm across the application. Active work
// belongs exclusively to its caller and is always terminated on cancellation.
let idle, timer;
const keys = new WeakMap();
export function clearIdleLookup() {
  clearTimeout(timer);
  idle?.terminate();
  idle = null;
}
globalThis.addEventListener?.('pagehide', clearIdleLookup);
export function hasIdleLookup(url, type, group = '') {
  return Boolean(idle && keys.get(idle) === JSON.stringify([url.href, type, group]));
}
export function lookupWorker(url, { type = 'classic', group = '' } = {}) {
  const key = JSON.stringify([url.href, type, group]);
  if (hasIdleLookup(url, type, group)) {
    const worker = idle;
    clearTimeout(timer);
    idle = null;
    return worker;
  }
  const worker = takeWorker(url, { type });
  keys.set(worker, key);
  return worker;
}
export function releaseLookup(worker) {
  clearIdleLookup();
  worker.onmessage = worker.onerror = worker.onmessageerror = null;
  idle = worker;
  worker.onerror = worker.onmessageerror = () => {
    if (idle === worker) clearIdleLookup();
  };
  timer = setTimeout(clearIdleLookup, 30000);
}
