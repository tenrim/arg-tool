// First-party protocol adapter around unchanged official Alpertron WASM.
// No importScripts, remote endpoints, DOM, or JavaScript evaluation is used.
'use strict';
(() => {
  let exports, calculator, currentId = 0, resourceBase, lastReport = '', snapshot = '', curve = '';
  const decoder = new TextDecoder(), encoder = new TextEncoder();
  const inputLimit = 900000, outputLimit = 32 * 1024 * 1024;
  const calculators = new Set(['integer']);
  const readString = pointer => {
    const memory = new Uint8Array(exports.memory.buffer);
    if (!Number.isInteger(pointer) || pointer < 0 || pointer >= memory.length) throw new RangeError('数论引擎返回了越界地址');
    let end = pointer;
    while (end < memory.length && end - pointer <= outputLimit && memory[end]) end++;
    if (end >= memory.length || end - pointer > outputLimit) throw new RangeError('数论报告超过 32 MB 限制或缺少终止符');
    return decoder.decode(memory.subarray(pointer, end));
  };
  const send = (type, data = {}) => self.postMessage({type, id: currentId, calculator, ...data});
  const receive = pointer => {
    const message = readString(pointer), code = message[0], html = message.slice(1);
    if (code === '8') { snapshot = html; return; }
    if (code === '7') { curve = html; return; }
    if (code === '9') return; // Official diagnostic log; not a result.
    if (code === '2' || code === '6' || code === 'A' || code === 'B') {
      lastReport = html;
      send('result', {html, code, paused: code === '6' || code === 'A', snapshot, curve});
    } else if (code === 'D' || code === 'E' || code === 'S' || code === 'T') {
      send('result', {html, code, paused: false, more: code === 'E' || code === 'S', snapshot, curve});
    } else if (code === 'M' || code === 'N') {
      send('error', {name: 'AlpertronExpressionError', error: '这里只处理整数表达式，不支持方程或多项式求根。'});
    } else if (code === 'K' || code === 'L') {
      send('error', {error: '本工作台使用原生表达式和批处理，不接受 Blockly 页面协议。'});
    } else {
      if (code === '1' || code === '3') lastReport = html;
      send('progress', {html, code});
    }
  };
  const load = async (id, base) => {
    if (!calculators.has(id)) throw new TypeError('不支持的数论计算器');
    const location = new URL(base);
    if (!/^https?:$/.test(location.protocol) || location.origin !== self.location.origin || !location.pathname.endsWith('/vendor/expansion/alpertron/')) throw new TypeError('数论资源必须位于本站固定资源目录');
    resourceBase = location.href;
    const response = await fetch(new URL(`${id}.wasm`, resourceBase), {credentials: 'same-origin', mode: 'same-origin', redirect: 'error'});
    if (!response.ok) throw new Error(`数论引擎载入失败（HTTP ${response.status}）`);
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength < 8 || bytes.byteLength > 4 * 1024 * 1024) throw new RangeError('数论引擎文件大小异常');
    const env = {
      databack: receive, tenths: () => Math.floor(Date.now() / 100),
      startSkipTest: () => send('progress', {code: '51', html: ''}),
      endSkipTest: () => send('progress', {code: '52', html: ''}),
      // The upstream front-end offers a remote Cunningham table. This adapter
      // explicitly clears that flag and refuses the hook if the contract drifts.
      getCunn: () => { throw new Error('本地模式不允许请求远程 Cunningham 因数表'); },
    };
    const result = await WebAssembly.instantiate(bytes, {env});
    exports = result.instance.exports;
    if (!(exports.memory instanceof WebAssembly.Memory) || typeof exports.getInputStringPtr !== 'function' || typeof exports.doWork !== 'function') throw new TypeError('数论引擎导出接口不匹配');
    calculator = id;
    lastReport = ''; snapshot = ''; curve = '';
  };
  const execute = parameter => {
    const bytes = encoder.encode(parameter);
    if (bytes.length > inputLimit) throw new RangeError('数论输入超过安全限额');
    const pointer = exports.getInputStringPtr();
    const memory = new Uint8Array(exports.memory.buffer);
    if (pointer < 0 || pointer + bytes.length + 1 > memory.length) throw new RangeError('数论输入缓冲区越界');
    memory.set(bytes, pointer); memory[pointer + bytes.length] = 0;
    exports.doWork();
  };
  self.onmessage = async event => {
    const data = event.data;
    if (!data || !Number.isSafeInteger(data.id) || data.id < 1) return;
    currentId = data.id;
    try {
      if (data.type === 'init') {
        await load(data.calculator, data.resourceBase);
        send('ready');
      } else if (data.type === 'run') {
        if (!exports || data.calculator !== calculator) throw new Error('数论引擎尚未就绪');
        if (typeof data.parameter !== 'string') throw new TypeError('无效的数论输入协议');
        lastReport = ''; execute(data.parameter);
      } else if (data.type === 'command') {
        if (!exports || !['C', 'D'].includes(data.command)) throw new Error('没有可以继续的本地运算');
        execute(data.command);
      } else throw new TypeError('未知数论工作任务');
    } catch (error) {
      send('error', {error: error?.message || '数论计算失败', name: error?.name || 'Error', partialHtml: lastReport});
    }
  };
})();
