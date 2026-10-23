// Thin protocol adapter for the unchanged official GCHQ CyberChef ChefWorker.
const MAX_BYTES = 32 * 1024 * 1024;
const RESOURCE_BASE = new URL('./', import.meta.url);
const ROOT = new URL('./vendor/cyberchef/', import.meta.url);
export class CyberChefClient {
  constructor(onStatus = () => {}) {
    this.onStatus = onStatus;
    this.pending = null;
    this.highlightPending = null;
    this.worker = new Worker(new URL('./cyberchef-worker.js', import.meta.url));
    this.ready = new Promise((resolve, reject) => { this.resolveReady = resolve; this.rejectReady = reject; });
    // UI may create the client before the first bake. Keep failures handled.
    this.ready.catch(() => {});
    this.timer = setTimeout(() => this.fail(new Error('运算引擎加载超时，请重试')), 30000);
    this.worker.onmessage = ({ data: message }) => {
      const data = message.data;
      if (message.action === 'workerLoaded') { clearTimeout(this.timer); this.resolveReady(); }
      else if (message.action === 'bootstrapError' || message.action === 'resourceError') this.fail(new Error(data.message));
      else if (message.action === 'bakeComplete') {
        if(!this.pending)return;
        if (data.error) this.fail(new Error(data.error.displayStr || String(data.error)));
        // Upstream OperationError/DishError stop early but keep error=false.
        // A normal completed recipe reports its full length (including disabled steps).
        else if(Number.isInteger(data.progress)&&data.progress<this.pending.recipeConfig.length&&!this.pending.recipeConfig[data.progress]?.breakpoint){this.fail(new Error(String(data.dish?.value||'处理链未完成，请检查输入和参数。')));}
        else if([7,8].includes(data.dish?.type)) {
          const files=data.dish.type===7?[data.dish.value]:data.dish.value;
          if(!Array.isArray(files)||files.length>256||files.reduce((n,f)=>n+(f?.size||0),0)>32*1024*1024){this.fail(new Error('结果超过 256 个文件或 32 MB，请缩小输入。'));return;}
          if(this.pending.structured){clearTimeout(this.timer);const pending=this.pending;this.pending=null;pending.resolve({...data,files,bytes:new Uint8Array()});}
          else {this.response=data;this.worker.postMessage({action:'getDishAs',data:{dish:data.dish,type:'ArrayBuffer',id:'raw'}});}
        } else if(this.pending?.structured&&data.dish?.type===3){
          clearTimeout(this.timer);const pending=this.pending;this.pending=null;const bytes=new TextEncoder().encode(String(data.dish.value));if(bytes.length>MAX_BYTES){pending.reject(new Error('结果超过 32 MB，请缩小输入。'));this.close();return;}pending.resolve({...data,bytes});
        } else { this.response = data; this.worker.postMessage({ action: 'getDishAs', data: { dish: data.dish, type: 'ArrayBuffer', id: 'raw' } }); }
      } else if (message.action === 'dishReturned' && data.id === 'raw') {
        const bytes=new Uint8Array(data.value);if(bytes.length>MAX_BYTES){this.fail(new Error('结果超过 32 MB，请缩小输入。'));return;}
        clearTimeout(this.timer); const pending = this.pending; this.pending = null;
        const response=this.response;this.response=null;pending?.resolve({ ...response, bytes });
      } else if (message.action === 'bakeError') this.fail(new Error(data.error?.displayStr || String(data.error)));
      else if (message.action === 'highlightsCalculated') {const task=this.highlightPending;this.highlightPending=null;task?.resolve(data);}
      else if (message.action === 'statusMessage') this.onStatus(String(data.message));
      else if (message.action === 'progressMessage') this.onStatus(`${data.progress} / ${data.total}`);
    };
    this.worker.onerror = event => { event.preventDefault(); this.fail(new Error('CyberChef 运算线程出错，请重试')); };
    this.worker.onmessageerror = () => this.fail(new Error('运算结果无法读取，请重试'));
    // Hosting may replace the entry URL with a blob bootstrap. The original
    // module directory, not WorkerGlobalScope.location, owns local resources.
    this.worker.postMessage({ action: 'initialize', data: { resourceBase: RESOURCE_BASE.href } });
    this.worker.postMessage({ action: 'setLogLevel', data: 'silent' });
    // A same-origin absolute path also survives Jimp's path.join when it loads
    // bitmap font pages. Passing https:// here gets reduced to https:/ by Jimp.
    this.worker.postMessage({ action: 'docURL', data: ROOT.pathname.replace(/\/$/, '') });
  }
  async bake(input, recipeConfig, {structured=false,attemptHighlight=false}={}) {
    const size=typeof input==='string'?new TextEncoder().encode(input).length:input?.byteLength;
    if(!Number.isFinite(size)||size>MAX_BYTES)throw new Error('输入最多 32 MB，请缩小内容后重试。');
    await this.ready;
    if (this.closed) throw new Error('运算已停止');
    if (this.pending) throw new Error('已有正在执行的处理链');
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject, structured, recipeConfig:structuredClone(recipeConfig) };
      this.timer = setTimeout(() => this.fail(new Error('运行超过两分钟，已停止。请缩小输入或简化处理链后重试。')), 120000);
      this.worker.postMessage({ action: 'bake', data: { input, recipeConfig, options: { attemptHighlight }, bakeId: 1, inputNum: 0 } });
    });
  }
  fail(error) { this.close(error); }
  async highlight(recipeConfig,direction,pos) {
    await this.ready;if(this.closed)throw Error('运算已停止');if(this.pending||this.highlightPending)throw Error('请等待当前运算结束');
    if(!['forward','reverse'].includes(direction)||!Array.isArray(pos))throw Error('无效高亮请求');
    return new Promise((resolve,reject)=>{this.highlightPending={resolve,reject};this.worker.postMessage({action:'highlight',data:{recipeConfig,direction,pos}});});
  }
  close(error = new Error('运算已停止')) {
    clearTimeout(this.timer); this.closed = true; this.worker.terminate();
    this.rejectReady(error); this.pending?.reject(error); this.pending = null;this.response=null;
    this.highlightPending?.reject(error);this.highlightPending=null;
  }
}
