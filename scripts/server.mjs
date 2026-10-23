import { createServer } from 'node:http';
import * as fs from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {feedbackClientIP,startDevFeedback} from './dev-feedback.mjs';
import {createOnlineQueryService} from '../services/online-query/index.mjs';
import {createFeedbackIngress} from '../services/feedback/ingress.mjs';
const directory = resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.py': 'text/plain; charset=utf-8', '.gz': 'application/gzip', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.wasm': 'application/wasm' };
function acceptsGzip(value='') {
  const codings = new Map(String(value).toLowerCase().split(',').map(part => {
    const [name, ...parameters] = part.trim().split(';');
    const quality = parameters.map(parameter => parameter.trim()).find(parameter => parameter.startsWith('q='));
    const weight = quality === undefined ? 1 : Number(quality.slice(2));
    return [name, Number.isFinite(weight) && weight >= 0 && weight <= 1 ? weight : 0];
  }));
  return (codings.get('gzip') ?? codings.get('*') ?? 0) > 0;
}
export function createDevServer({env=process.env,feedbackStarter=startDevFeedback,onlineQueryFactory=createOnlineQueryService,staticRoot=directory,fileSystem=fs}={}) {
const root=resolve(staticRoot);
async function publicFile(path){
  const [realRoot,realFile]=await Promise.all([fileSystem.realpath(root),fileSystem.realpath(path)]);
  if(!realFile.startsWith(realRoot+sep)||!(await fileSystem.stat(realFile)).isFile())throw Error('Not found');
  return realFile;
}
let ready;
const feedbackAbort=new AbortController();
const feedbackIngress=createFeedbackIngress({timeoutMs:25000});
const feedbackReady=new Promise(resolve=>ready=resolve);
const onlineQuery=onlineQueryFactory({env});
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if(pathname.startsWith('/api/query/')){await onlineQuery.handle(request,response);return;}
    if(pathname==='/api/feedback'){
      let admission;
      try{
      if(request.method!=='POST'){response.writeHead(405,{Allow:'POST'});response.end();return;}
      admission=feedbackIngress.acquire(request,response);
      const feedback=await admission.wait(feedbackReady);
      if(!feedback.url){response.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});response.end(JSON.stringify({message:feedback.state==='unconfigured'?'邮件反馈尚未配置，可复制或下载报告。':'邮件反馈暂时不可用，可复制或下载报告。'}));return;}
      const target=new URL(feedback.url);if(!['http:','https:'].includes(target.protocol)||!['localhost','127.0.0.1','[::1]'].includes(target.hostname)||target.username||target.password)throw Error('Local feedback only');
        const clientIP=feedbackClientIP(request,feedback.trustedProxies);if(!clientIP)throw Error('Invalid client peer');
        const bytes=await admission.read();
        const upstream=await fetch(target,{method:'POST',headers:{'Content-Type':request.headers['content-type']||'','Origin':request.headers.origin||'','X-Real-IP':clientIP},body:bytes,signal:admission.signal,redirect:'error'});
        const body=await upstream.text();if(response.destroyed||response.writableEnded)return;response.writeHead(upstream.status,{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store'});response.end(body);
      }catch(error){if(!response.destroyed&&!response.writableEnded){response.writeHead(error.status===413?413:503,{'Content-Type':'application/json','Cache-Control':'no-store'});response.end(JSON.stringify({message:error.status===413?'报告过大，请减少附件。':'邮件服务暂时不可用，可复制或下载报告。'}));}}finally{admission?.release();}return;
    }
    if(!['GET','HEAD'].includes(request.method)){response.writeHead(405,{Allow:'GET, HEAD'});response.end();return;}
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + sep)) throw new Error('Not found');
    let servedFile = await publicFile(file);
    const headers = { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Cache-Control': 'no-cache' };
    const compressed=extname(file)==='.json'?await publicFile(file+'.gz').catch(()=>null):null;
    if (compressed) {
      headers.Vary = 'Accept-Encoding';
      if (acceptsGzip(request.headers['accept-encoding'])) { servedFile = compressed; headers['Content-Encoding'] = 'gzip'; }
    }
    const body=request.method === 'HEAD' ? undefined : await fileSystem.readFile(servedFile);
    if(response.destroyed||response.writableEnded)return;
    response.writeHead(200, headers);response.end(body);
  } catch {
    if(response.destroyed||response.writableEnded)return;
    if(response.headersSent){response.destroy();return;}
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});
server.feedbackReady=feedbackReady;
server.feedbackAbort=feedbackAbort;
server.onlineQuery=onlineQuery;
server.once('listening',()=>{Promise.resolve().then(()=>feedbackStarter({sitePort:server.address().port,env,signal:feedbackAbort.signal})).then(ready,()=>ready({state:'unavailable',code:'FEEDBACK_START_ERROR',url:null,close:async()=>{}}));});
server.feedbackIngress=feedbackIngress;
server.once('close',()=>{feedbackAbort.abort();feedbackIngress.close();onlineQuery.close();feedbackReady.then(feedback=>feedback.close());});
return server;
}

export function closeDevServer(server,{timeoutMS=1500}={}){
  server.feedbackAbort?.abort();
  server.feedbackIngress?.close();
  server.onlineQuery?.close();
  return server.shutdownReady??=new Promise(resolve=>{
    let timer,stopped=false;
    const finish=()=>{if(stopped)return;stopped=true;clearTimeout(timer);resolve();};
    timer=setTimeout(()=>{server.closeAllConnections();finish();},timeoutMS);
    const closeFeedback=server.feedbackReady.then(feedback=>feedback.close()).catch(()=>{});
    const closeSite=new Promise(done=>{server.close(done);server.closeIdleConnections();});
    Promise.all([closeFeedback,closeSite]).then(finish);
  });
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const args=process.argv.slice(2),portArg=args.indexOf('--port'),port=Number(portArg>=0?args[portArg+1]:process.env.PORT||3000);
  const server=createDevServer();
  server.listen(port,'0.0.0.0',async()=>{const feedback=await server.feedbackReady;if(!server.listening)return;console.log(`Local: http://localhost:${server.address().port}`);console.log(`Feedback: ${feedback.code}.`);if(feedback.code.startsWith('FEEDBACK_DEPENDENCY_'))console.error('Feedback dependency preparation failed; check registry access and service directory permissions, then restart.');});
  const close=async()=>{await closeDevServer(server);process.exit(0);};
  process.once('SIGINT',close);process.once('SIGTERM',close);
}
