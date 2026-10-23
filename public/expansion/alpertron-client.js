import {ALPERTRON_LIMITS} from './alpertron-catalog.js';
import {encodeAlpertronRequest, alpertronText, alpertronError} from './alpertron-protocol.js';

const errorOf = (message, name = 'Error') => Object.assign(new Error(message), {name});

/** The controller owns input/result revisions. This client owns only its Worker. */
export class AlpertronClient {
  constructor({workerUrl = new URL('./alpertron-worker.js', import.meta.url), resourceBase = new URL('../vendor/expansion/alpertron/', import.meta.url), timeoutMs = ALPERTRON_LIMITS.defaultTimeoutMs, WorkerClass = globalThis.Worker} = {}) {
    this.workerUrl = workerUrl; this.resourceBase = String(resourceBase); this.timeoutMs = timeoutMs;
    this.WorkerClass = WorkerClass; this.worker = null; this.pending = null; this.sequence = 0;
    this.calculator = null; this.readyPromise = null; this.lastResult = null; this.canInspectFactorization = false; this.latestRun = null;
    this.mainReport = ''; this.supplements = new Map();
  }
  ready(calculator = 'integer') {
    if (this.worker && this.calculator === calculator && this.readyPromise) return this.readyPromise;
    this.cancel('切换数论计算器');
    const id = ++this.sequence;
    this.calculator = calculator;
    this.readyPromise = new Promise((resolve, reject) => {
      let worker;
      try { worker = new this.WorkerClass(this.workerUrl); }
      catch (cause) { reject(errorOf(`无法启动本地数论计算：${cause.message}`)); return; }
      this.worker = worker;
      const timer = setTimeout(() => this.fail(errorOf('数论引擎载入超时', 'TimeoutError')), Math.min(30000, this.timeoutMs));
      this.pending = {id, resolve, reject, timer, kind: 'ready'};
      worker.onmessage = event => this.receive(event.data);
      worker.onerror = event => { event.preventDefault?.(); this.fail(errorOf(event.message || '数论计算线程载入失败')); };
      worker.onmessageerror = () => this.fail(errorOf('数论计算线程返回了无效数据'));
      worker.postMessage({type: 'init', id, calculator, resourceBase: this.resourceBase});
    });
    // Failed readiness must not poison later attempts; awaiters still receive the rejection.
    const promise = this.readyPromise;
    promise.catch(() => { if (this.readyPromise === promise) this.readyPromise = null; });
    return promise;
  }
  async run(options = {}, {onProgress} = {}) {
    const request = encodeAlpertronRequest(options);
    if (this.pending && this.pending.kind !== 'ready') this.cancel('已被新的数论任务替代');
    const readiness = this.ready(request.calculator), token = {};
    this.latestRun = token;
    await readiness;
    if (this.latestRun !== token) throw errorOf('已被新的数论任务替代', 'AbortError');
    this.canInspectFactorization = false;
    this.mainReport = ''; this.supplements.clear();
    this.verbose = !!options.verbose;
    return this.dispatch({type: 'run', calculator: request.calculator, parameter: request.parameter}, {onProgress, timeoutMs: options.timeoutMs, action: request.action});
  }
  continue(options = {}) { return this.command('C', options); }
  divisors(options = {}) { return this.command('D', options); }
  command(command, options = {}) {
    if (!this.worker || !this.lastResult) return Promise.reject(errorOf('请先完成对应的数论运算'));
    if (command === 'C' && !this.lastResult.paused) return Promise.reject(errorOf('当前结果没有待继续的批处理'));
    if (!['C', 'D'].includes(command)) return Promise.reject(errorOf('不支持的整数结果操作'));
    if (command !== 'C' && !this.canInspectFactorization) return Promise.reject(errorOf('请先完成整数因数分解，再查询除数'));
    if (this.pending) return Promise.reject(errorOf('请等待当前数论运算结束'));
    return this.dispatch({type: 'command', command}, {...options, action: command});
  }
  dispatch(message, {onProgress, timeoutMs = this.timeoutMs, action} = {}) {
    if (!Number.isFinite(Number(timeoutMs)) || timeoutMs < 1 || timeoutMs > ALPERTRON_LIMITS.maxTimeoutMs) return Promise.reject(errorOf('计算时限必须在 1–300000 毫秒之间'));
    if (this.pending) return Promise.reject(errorOf('已有正在运行的数论任务'));
    const id = ++this.sequence;
    this.lastResult = null;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.fail(errorOf('本地数论计算超时；可调整时限后重新计算', 'TimeoutError')), Number(timeoutMs));
      this.pending = {id, resolve, reject, timer, onProgress, action, kind: 'run'};
      try { this.worker.postMessage({...message, id}); }
      catch (error) { this.fail(error); }
    });
  }
  receive(message) {
    const pending = this.pending;
    if (!pending || !message || message.id !== pending.id) return;
    if (message.type === 'progress') {
      try { pending.onProgress?.({code: message.code, text: alpertronText(message.html, {verbose:this.verbose}), calculator: message.calculator}); }
      catch { /* Observer failures must not interrupt the engine's state machine. */ }
      return;
    }
    if (message.type === 'error') {
      const error = errorOf(message.error || '数论计算失败', message.name);
      if (message.partialHtml) error.partialText = alpertronText(message.partialHtml);
      this.fail(error); return;
    }
    if (message.type === 'ready' && pending.kind === 'ready') {
      clearTimeout(pending.timer); this.pending = null; pending.resolve(this); return;
    }
    if (message.type !== 'result' || pending.kind !== 'run') return;
    const text = alpertronText(message.html, {verbose:this.verbose}), diagnostic = alpertronError(text);
    if (diagnostic) {
      const error = errorOf(diagnostic, 'AlpertronExpressionError'); error.reportText = text;
      this.fail(error); return;
    }
    if (pending.action === 'C') this.mainReport += '\n\n' + text;
    else if (pending.action === 'D') this.supplements.set(pending.action, text);
    else this.mainReport = text;
    const combined = [this.mainReport, ...this.supplements.values()].filter(Boolean).join('\n\n');
    if (new TextEncoder().encode(combined).length > ALPERTRON_LIMITS.outputBytes) { this.fail(errorOf('累计数论结果超过 32 MB；请缩小批处理范围。', 'RangeError')); return; }
    clearTimeout(pending.timer); this.pending = null;
    if (this.calculator === 'integer' && pending.action !== 'D') this.canInspectFactorization = !message.paused && message.html.includes('id="showdiv"');
    const result = Object.freeze({calculator: message.calculator, action: pending.action, text: combined, chunkText: text, code: message.code,
      paused: !!message.paused, more: !!message.more, snapshot: message.snapshot || '', curve: message.curve || ''});
    this.lastResult = result; pending.resolve(result);
  }
  fail(error) {
    const pending = this.pending;
    this.pending = null; this.lastResult = null; this.canInspectFactorization = false; this.latestRun = null;
    this.worker?.terminate(); this.worker = null; this.calculator = null; this.readyPromise = null;
    if (pending) { clearTimeout(pending.timer); pending.reject(error); }
  }
  cancel(message = '数论计算已停止') { this.fail(errorOf(message, 'AbortError')); }
  destroy() { this.cancel('数论工作区已关闭'); }
}
