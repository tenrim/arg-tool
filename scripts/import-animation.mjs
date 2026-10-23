// Explicit maintenance import. Runtime and normal builds are entirely offline.
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {build} from '../tools/ui-runtime/node_modules/esbuild/lib/main.js';
const root=resolve(import.meta.dirname,'..'),source=resolve(root,'upstream/animation'),out=resolve(root,'public/vendor/animation');
const packages=[
 ['gifuct-js','2.1.2','sha512-rI2asw77u0mGgwhV3qA+OEgYqaDn5UNqgs+Bx0FGwSpuqfYn+Ir6RQY5ENNQ8SbIiG/m5gVa7CD5RriO4f4Lsg=='],
 ['js-binary-schema-parser','2.0.3','sha512-xezGJmOb4lk/M1ZZLTR/jaBHQ4gG/lqQnJqdIv4721DMggsa1bDVlHXNeHYogaIEHD9vCRv0fcL4hMA+Coarkg=='],
 ['upng-js','2.1.0','sha512-d3xzZzpMP64YkjP5pr8gNyvBt7dLk/uGI67EctzDuVp4lCZyVMo0aJO6l/VDlgbInJYDY6cnClLoBp29eKWI6g=='],
 ['pako','1.0.11','sha512-4hLB8Py4zZce5s4yd9XzopqwVv/yGNhV1Bl8NTmCq1763HeK2+EwVTv+leGeL13Dnh2wfbqowVPXCIO0z4taYw=='],
];
await mkdir(out,{recursive:true});await mkdir(source,{recursive:true});
const records=[];
for(const [name,version,integrity] of packages){
 const url=`https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`;
 let archive;
 if(process.argv.includes('--offline'))archive=await readFile(resolve(source,`${name}-${version}.tgz`));
 else{const response=await fetch(url);if(!response.ok)throw Error(url+': '+response.status);archive=Buffer.from(await response.arrayBuffer());}
 if('sha512-'+createHash('sha512').update(archive).digest('base64')!==integrity)throw Error('Package integrity mismatch: '+name);
 await writeFile(resolve(source,`${name}-${version}.tgz`),archive);
 const tar=gunzipSync(archive),dir=resolve(source,'packages',name);await mkdir(dir,{recursive:true});
 for(let p=0;p+512<=tar.length;){
  const h=tar.subarray(p,p+512);if(h.every(x=>!x))break;
  const file=h.subarray(0,100).toString().replace(/\0.*$/s,''),size=parseInt(h.subarray(124,136).toString(),8);
  if(!Number.isSafeInteger(size)||size<0||p+512+size>tar.length)throw Error('Invalid tar');
  if((h[156]===48||h[156]===0)&&file.startsWith('package/')){
   const rel=file.slice(8);if(rel.split('/').some(x=>x==='..')||rel.includes('\\'))throw Error('Unsafe tar path');
   const target=resolve(dir,rel);await mkdir(resolve(target,'..'),{recursive:true});await writeFile(target,tar.subarray(p+512,p+512+size));
  }
  p+=512+Math.ceil(size/512)*512;
 }
 const meta=JSON.parse(await readFile(resolve(dir,'package.json'),'utf8'));
 const notices=(await readdir(dir)).filter(x=>/^(license|notice|copying)(\.|$)/i.test(x));
 for(const file of notices)await writeFile(resolve(out,name+'-'+file),await readFile(resolve(dir,file)));
 records.push({name,version,integrity,url,license:meta.license,repository:meta.repository,notices:notices.map(x=>name+'-'+x)});
 if(name==='pako'){
  const original=await readFile(resolve(dir,'lib/zlib/inflate.js'),'utf8');
  await writeFile(resolve(out,'pako-ZLIB-NOTICE.txt'),original.split(/\r?\nvar utils/)[0]+'\n');
  records.at(-1).notices.push('pako-ZLIB-NOTICE.txt');
 }
}
await build({stdin:{contents:`export {parseGIF,decompressFrames} from 'gifuct-js'; import UPNG from 'upng-js'; import pako from 'pako'; export {UPNG,pako};`,resolveDir:source,sourcefile:'animation-entry.js'},
 outfile:resolve(out,'engines.js'),bundle:true,format:'esm',platform:'browser',target:'es2022',minify:false,
 plugins:[{name:'pinned-packages',setup(b){b.onResolve({filter:/^(gifuct-js|upng-js|pako|js-binary-schema-parser)(\/.*)?$/},args=>{
 const parts=args.path.split('/'),name=parts.shift();return{path:resolve(source,'packages',name,parts.length?parts.join('/')+(parts.at(-1).endsWith('.js')?'':'.js'):name==='gifuct-js'?'lib/index.js':name==='upng-js'?'UPNG.js':name==='pako'?'index.js':'lib/index.js')};
 });}}]});
await writeFile(resolve(out,'NOTICE.txt'),'GIF: gifuct-js 2.1.2 + js-binary-schema-parser 2.0.3 (MIT).\nPNG/APNG: UPNG.js 2.1.0 (MIT) + pako 1.0.11 (MIT AND Zlib).\nUnmodified package sources bundled by esbuild. Bounds, strict container validation, frame disposal and exports are maintained in public/animation/. ZIP uses the existing fflate 0.8.3 bundle.\n');
const files=[];
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else if(e.name!=='UPSTREAM.json')files.push({path:relative(root,p).replaceAll('\\','/'),sha256:createHash('sha256').update(await readFile(p)).digest('hex')});}}
await walk(source);await walk(out);
await writeFile(resolve(out,'UPSTREAM.json'),JSON.stringify({packages:records,build:'scripts/import-animation.mjs',files},null,2)+'\n');
console.log('Imported complete pinned animation engines:',records.map(p=>p.name+' '+p.version).join(', '));
