// Installed only by the Android container; the website keeps its own fetch.
(() => {
  if (window.__mistNetworkComplete) return;
  const originalFetch = window.fetch.bind(window);
  const paths = new Set(['feedback', 'code/run', 'forensics/run', ...['oeis','simbad','vizier','cod','pubchem','zdic','cnkgraph','pokewiki','placenames'].map(id=>'query/'+id)].map(id=>'/api/'+id));
  const fileLimit = 20 * 1024 * 1024;
  const policy = path => path === '/api/forensics/run'
    ? {request:28*1024*1024,response:92*1024*1024,timeout:360000}
    : path === '/api/code/run' ? {request:4*1024*1024,response:8*1024*1024,timeout:135000}
    : {request:path === '/api/feedback'?6*1024*1024:8192,response:path === '/api/feedback'?65536:8*1024*1024,timeout:45000};
  const pending = new Map();
  Object.defineProperty(window, '__mistNetworkStart', {value(id,status,headers) {
    const job = pending.get(id);
    if (!job || job.controller) return;
    try {
      if (job.path !== '/api/forensics/run' || status < 200 || status >= 300 ||
          !/^application\/x-ndjson(?:\s*;|$)/i.test(new Headers(headers).get('Content-Type') || ''))
        throw new TypeError('服务器流式响应格式无效。');
      const stream = new ReadableStream({
        start(controller) {job.controller = controller;},
        cancel() {job.cleanup();MistNetwork.cancel(id);}
      });
      job.resolve(new Response(stream,{status,headers}));
    } catch(error) {job.fail(error);}
  }});
  Object.defineProperty(window, '__mistNetworkChunk', {value(id,encoded) {
    const job = pending.get(id);
    if (!job) return;
    try {
      const raw = atob(encoded), bytes = Uint8Array.from(raw,c=>c.charCodeAt(0));
      job.size += bytes.length;
      if (job.size > job.limit) throw new RangeError('服务器完整响应超过限额，未返回截断结果。');
      if (job.controller) job.controller.enqueue(bytes);
      else job.chunks.push(job.decoder.decode(bytes,{stream:true}));
    } catch(error) {job.fail(error);}
  }});
  Object.defineProperty(window, '__mistNetworkComplete', {value(id,status,headers,body,error) {
    const job = pending.get(id);
    if (!job) return;
    if (error) job.fail(new TypeError(error));
    else {
      job.cleanup();
      try {
        if (job.controller) job.controller.close();
        else job.resolve(new Response(body === null ? job.chunks.join('')+job.decoder.decode() : body,{status,headers}));
      } catch(error) {job.fail(error);}
    }
  }});
  window.fetch = async function(input, init) {
    const rawURL = input instanceof Request ? input.url : String(input);
    const url = new URL(rawURL, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith('/api/')) return originalFetch(input,init);
    const request = new Request(input instanceof Request ? input : url.href,init);
    if (request.signal.aborted) throw request.signal.reason;
    if (!paths.has(url.pathname) || url.search || url.hash || request.method !== 'POST' || !/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||'')) {
      return new Response(JSON.stringify({message:'Android 版仅连接已登记的本站 JSON 接口。',error:'接口未登记。'}),{status:400,headers:{'Content-Type':'application/json'}});
    }
    const body = await request.text();
    const limits = policy(url.pathname);
    if (new TextEncoder().encode(body).length > limits.request) return new Response(JSON.stringify({message:'请求过大。',error:'请求超过接口限额。'}),{status:413,headers:{'Content-Type':'application/json'}});
    if (url.pathname === '/api/forensics/run') {
      try {
        const value = JSON.parse(body);
        const fileSize = data => {
          if (typeof data !== 'string' || !data.length || data.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(data)) throw Error('文件编码无效。');
          return data.length / 4 * 3 - (data.endsWith('==')?2:data.endsWith('=')?1:0);
        };
        const size = fileSize(value.data) + ('attachment' in value ? fileSize(value.attachment?.data) : 0);
        if (size > fileLimit) return new Response(JSON.stringify({error:'本次上传文件合计最多 20 MB。'}),{status:413,headers:{'Content-Type':'application/json'}});
      } catch(error) {return new Response(JSON.stringify({error:error.message}),{status:400,headers:{'Content-Type':'application/json'}});}
    }
    if (request.signal.aborted) throw request.signal.reason;
    return new Promise((resolve,reject) => {
      const id = crypto.randomUUID();
      let timer;
      const cleanup = () => {pending.delete(id);clearTimeout(timer);request.signal.removeEventListener('abort',abort);};
      const fail = error => {cleanup();MistNetwork.cancel(id);if(job.controller)job.controller.error(error);reject(error);};
      const abort = () => fail(request.signal.reason);
      const job = {path:url.pathname,resolve,reject,cleanup,fail,chunks:[],decoder:new TextDecoder(),size:0,limit:limits.response};
      pending.set(id,job);
      request.signal.addEventListener('abort',abort,{once:true});
      timer = setTimeout(() => fail(new DOMException('服务器请求超时；若刚发送反馈，请保留原报告并核对接收结果。','TimeoutError')),limits.timeout);
      try {MistNetwork.request(id,url.pathname,body);} catch(error) {fail(error);}
    });
  };
  addEventListener('pagehide',()=>{for(const job of pending.values())job.fail(new DOMException('页面已离开','AbortError'));});
})();
