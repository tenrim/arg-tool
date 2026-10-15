// Maintenance post-processing for the remaining local media components.
import {readFile,writeFile,rm,readdir} from 'node:fs/promises';import {join} from 'node:path';import {gzipSync} from 'node:zlib';import {createHash} from 'node:crypto';
const root='public/vendor/hunt';
await writeFile(root+'/stereogram/processing-worker.js',(await readFile(root+'/stereogram/processing.js','utf8')).replace('document.createElement("canvas")','new OffscreenCanvas(1, 1)'));
const wasm=root+'/ffmpeg-core/esm/ffmpeg-core.wasm';try{const data=await readFile(wasm);await writeFile(wasm+'.gz',gzipSync(data,{level:9}));await rm(wasm);}catch(e){if(e.code!=='ENOENT')throw e;}
const files={};async function hash(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())await hash(p);else if(e.name!=='INTEGRITY.json'){const b=await readFile(p);files[p.slice(root.length+1)]={bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};}}}await hash(root);await writeFile(root+'/INTEGRITY.json',JSON.stringify({generated:'2026-10-08',files},null,2)+'\n');console.log(`Recorded ${Object.keys(files).length} browser runtime files.`);
