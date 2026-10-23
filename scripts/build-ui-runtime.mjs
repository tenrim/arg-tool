// Maintenance build: npm ci --prefix tools/ui-runtime, then this script.
// Normal start/build serves the pinned local bundle and never fetches packages.
import {build} from '../tools/ui-runtime/node_modules/esbuild/lib/main.js';
import {mkdir,readFile,writeFile,copyFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
const root=resolve(import.meta.dirname,'..'), base=resolve(root,'tools/ui-runtime');
const target=resolve(root,'public/vendor/ui-runtime');
await mkdir(target,{recursive:true});
const result=await build({entryPoints:[resolve(base,'entry.js')],outfile:resolve(target,'runtime.js'),bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,metafile:true,legalComments:'linked',define:{'process.env.NODE_ENV':'"production"'}});
const names=new Set(Object.keys(result.metafile.inputs).filter(p=>p.includes('node_modules/')).map(p=>{const parts=p.split('node_modules/').at(-1).split('/');return parts[0].startsWith('@')?parts.slice(0,2).join('/'):parts[0];}));
const packages=[];
for(const name of [...names].sort()){
 const dir=resolve(base,'node_modules',name),pkg=JSON.parse(await readFile(resolve(dir,'package.json'),'utf8'));
 const licenses=(await readdir(dir)).filter(file=>/^(license|copying|notice)(\.|$)/i.test(file));
 if(!licenses.length)throw Error('Missing license: '+name);
 const notices=[];
 for(const file of licenses){const dest=name.replaceAll('/','-').replace('@','')+'-'+file;await copyFile(resolve(dir,file),resolve(target,dest));notices.push('vendor/ui-runtime/'+dest);}
 packages.push({name,version:pkg.version,license:pkg.license,notices});
}
const lock=JSON.parse(await readFile(resolve(base,'package-lock.json'),'utf8'));
const files=[];
for(const name of (await readdir(target)).filter(name=>name!=='UPSTREAM.json')){const data=await readFile(resolve(target,name));files.push({path:'public/vendor/ui-runtime/'+name,sha256:createHash('sha256').update(data).digest('hex')});}
await writeFile(resolve(target,'UPSTREAM.json'),JSON.stringify({name:'迷雾工具箱共享 UI 运行依赖',entry:'tools/ui-runtime/entry.js',builder:'scripts/build-ui-runtime.mjs',packages,lockfile:'tools/ui-runtime/package-lock.json',lock_sha256:createHash('sha256').update(await readFile(resolve(base,'package-lock.json'))).digest('hex'),integrities:Object.fromEntries(packages.map(p=>[p.name,lock.packages['node_modules/'+p.name].integrity])),files},null,2)+'\n');
await writeFile(resolve(base,'bundle-inputs.json'),JSON.stringify(Object.keys(result.metafile.inputs).map(p=>relative(base,resolve(p)).replaceAll('\\','/')),null,2)+'\n');
console.log('已构建本地 UI 运行包，真实参与打包的依赖：',packages.map(p=>p.name+' '+p.version).join('、'));
