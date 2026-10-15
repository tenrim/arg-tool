import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createHash} from 'node:crypto';
// Maintenance-only extraction from the pinned, checksum-verified official bundle.
const root=resolve('public');const dest=resolve(root,'vendor/cyberchef');
const hash=s=>createHash('sha256').update(s).digest('hex');
const manifest=JSON.parse(await readFile(resolve(dest,'UPSTREAM.json'),'utf8'));
for(const file of manifest.files){ const path=file.local_path||file.path; if(path){const data=await readFile(resolve(dest,path));if(hash(data)!==file.sha256)throw Error('Upstream checksum mismatch: '+path);} }
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try {
 const page=await browser.newPage();
 await page.addInitScript(()=>{
   window.capturedWorkers={};window.workerURLs={};
   const create=URL.createObjectURL.bind(URL); URL.createObjectURL=b=>{const u=create(b);if(b instanceof Blob)window.capturedWorkers[u]=b.text();return u;};
   const Original=window.Worker;window.Worker=class extends Original{constructor(url,opts){super(url,opts);this.url=url;}postMessage(msg,...rest){if(msg.action==='setLogPrefix')window.workerURLs[msg.data]=this.url;return super.postMessage(msg,...rest);}};
 });
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url());if(u.hostname!=='arg-tools.test')return route.abort();
  const file=resolve(root,'.'+u.pathname);if(!file.startsWith(root+'/'))return route.abort();
  try{await route.fulfill({contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.ico':'image/x-icon'}[extname(file)]||'application/octet-stream',body:await readFile(file)});}catch{await route.fulfill({status:404,body:'Not found'});}
 });
 await page.goto('https://arg-tools.test/vendor/cyberchef/index.html');
 await page.waitForFunction(()=>window.app?.workerLoaded&&window.workerURLs.ChefWorker,null,{timeout:90000});
 const worker=await page.evaluate(()=>window.capturedWorkers[window.workerURLs.ChefWorker]);
 const meta=await page.evaluate(()=>JSON.stringify({operations:app.operations,categories:app.categories}));
 if(!worker.includes('workerLoaded')||!worker.includes('bakeComplete'))throw Error('ChefWorker capture failed');
 await writeFile(resolve(dest,'ChefWorker.js'),worker);await writeFile(resolve(dest,'catalogue.json'),meta+'\n');
 await writeFile(resolve(dest,'ENGINE.json'),JSON.stringify({version:'11.5.0',source:'assets/main.js',source_sha256:hash(await readFile(resolve(dest,'assets/main.js'))),script:'scripts/extract-cyberchef.mjs',method:'Capture the official inline ChefWorker bytes and serialize app.operations/app.categories; no worker code modification',files:[{path:'ChefWorker.js',sha256:hash(worker)},{path:'catalogue.json',sha256:hash(meta+'\n')}]},null,2)+'\n');
 console.log('Extracted official ChefWorker and '+JSON.parse(meta).categories.length+' categories.');
}finally{await browser.close()}
