import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2);
const portArg = args.indexOf('--port');
const port = Number(portArg >= 0 ? args[portArg + 1] : process.env.PORT || 3000);
const directory = resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.py': 'text/plain; charset=utf-8', '.gz': 'application/gzip', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.wasm': 'application/wasm' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if(pathname==='/api/feedback'){
      if(!process.env.FEEDBACK_URL){response.writeHead(503,{'Content-Type':'application/json'});response.end(JSON.stringify({message:'本地邮件反馈服务未启动，可复制或下载报告。'}));return;}
      try{const target=new URL('/api/feedback',process.env.FEEDBACK_URL);if(!['localhost','127.0.0.1','[::1]'].includes(target.hostname))throw Error('Local feedback only');
        const chunks=[];let size=0;for await(const chunk of request){size+=chunk.length;if(size>6*1024*1024)throw Error('Too large');chunks.push(chunk);}
        const upstream=await fetch(target,{method:request.method,headers:{'Content-Type':request.headers['content-type']||'','Origin':request.headers.origin||''},body:request.method==='POST'?Buffer.concat(chunks):undefined,signal:AbortSignal.timeout(25000)});
        response.writeHead(upstream.status,{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store'});response.end(await upstream.text());
      }catch{response.writeHead(503,{'Content-Type':'application/json'});response.end(JSON.stringify({message:'本地邮件服务暂时不可用，可复制或下载报告。'}));}return;
    }
    const file = resolve(directory, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(directory + sep) || !(await stat(file)).isFile()) throw new Error('Not found');
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Cache-Control': 'no-cache' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});
server.listen(port, '0.0.0.0', () => console.log(`Local: http://localhost:${port}`));
