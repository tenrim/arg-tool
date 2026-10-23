// Offline build from retained pinned packages. This script never installs or upgrades.
import {readFile,writeFile,mkdir,readdir,copyFile,cp} from 'node:fs/promises';
import {resolve,join,dirname,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {build} from '../upstream/graphics/node_modules/esbuild/lib/main.js';
const hash=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const out='public/vendor/science/seqviz';await mkdir(out,{recursive:true});
await copyFile('upstream/completion-20261020/seqviz/README.md',out+'/README.md');
await copyFile('upstream/completion-20261020/seqviz/dist/SeqViz.d.ts',out+'/SeqViz.d.ts');
const result=await build({entryPoints:['upstream/completion-20261020/seqviz-build/entry.js'],outfile:out+'/viewer.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'linked',metafile:true,define:{'process.env.NODE_ENV':'"production"'}});
const base='upstream/completion-20261020/seqviz-build',lock=JSON.parse(await readFile(base+'/package-lock.json','utf8')),notices=[];
for(const [key,p]of Object.entries(lock.packages)){
 if(!key.startsWith('node_modules/'))continue;
 const dir=join(base,key);for(const f of await readdir(dir))if(/^(license|licence|notice|copying)([._-]|$)/i.test(f)){
  const path=join(out,key.slice(13).replaceAll('/','_')+'-'+f);await copyFile(join(dir,f),path);notices.push({name:key.slice(13),version:p.version,license:p.license,path});
 }
}
await writeFile(out+'/DEPENDENCY-NOTICES.txt',(await Promise.all(notices.map(async n=>`\n===== ${n.name} ${n.version} (${n.license||'see original license'}) =====\n${await readFile(n.path,'utf8')}`))).join('\n'));
const files=await Promise.all((await readdir(out)).filter(p=>p!=='UPSTREAM.json').map(async p=>({path:out+'/'+p,sha256:await hash(out+'/'+p)})));
await writeFile(out+'/UPSTREAM.json',JSON.stringify({package:'seqviz',version:'3.10.25',sourceCommit:'7a0e8f4c45ad5f4d076178f54f08f071e91d7b6a',lockfile:base+'/package-lock.json',lockSha256:await hash(base+'/package-lock.json'),inputs:await Promise.all(Object.keys(result.metafile.inputs).map(async path=>({path,sha256:await hash(path)}))),files,notices},null,2)+'\n');
const source='upstream/science/sources/';await writeFile('public/vendor/science/native-interfaces.json',JSON.stringify({chemistry:await readFile(source+'@rdkit-rdkit-2026.9.1/dist/RDKit_minimal.d.ts','utf8'),astronomy:await readFile(source+'astronomy-engine-2.1.19/astronomy.d.ts','utf8'),calendar:await readFile(source+'lunar-javascript-1.7.7/README.md','utf8')}));
const packages=await readdir('upstream/round2/sources/@tonaljs');
await build({stdin:{contents:'export * from "./upstream/round2/sources/tonal-6.5.0/dist/index.mjs";',resolveDir:process.cwd()},outfile:'public/vendor/round2/tonal-full.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'linked',plugins:[{name:'pinned-tonal',setup(b){b.onResolve({filter:/^@tonaljs\//},async({path})=>{const name=path.slice(9),entry=packages.find(x=>x.startsWith(name+'-'));if(!entry)throw Error('Missing pinned Tonal package: '+path);return {path:resolve('upstream/round2/sources/@tonaljs',entry,'dist/index.mjs')};});}}]});
const manifest=JSON.parse(await readFile('public/vendor/round2/UPSTREAM.json','utf8'));for(const p of ['tonal-full.js','tonal-full.js.LEGAL.txt']){try{const item={path:p,sha256:await hash('public/vendor/round2/'+p)},old=manifest.bundles.find(x=>x.path===p);if(old)Object.assign(old,item);else manifest.bundles.push(item);}catch(e){if(e.code!=='ENOENT')throw e;}}
await writeFile('public/vendor/round2/UPSTREAM.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Built fixed SeqViz viewer, full Tonal exports and native interface references.');
const hanzi='public/vendor/hanzi-full';await mkdir(hanzi,{recursive:true});
await copyFile('upstream/completion-20261020/cnchar/cnchar.all.min.js',hanzi+'/cnchar-all.js');
await copyFile('upstream/completion-20261020/cnchar/LICENSE',hanzi+'/CNCHAR-LICENSE');
await copyFile('upstream/completion-20261020/cnchar/README.md',hanzi+'/README.md');
await copyFile('upstream/completion-20261020/cnchar-data/LICENSE',hanzi+'/CNCHAR-DATA-LICENSE');
await copyFile('upstream/completion-20261020/ARPHICPL.txt',hanzi+'/ARPHICPL.txt');
await copyFile('upstream/completion-20261020/makemeahanzi-graphics.txt',hanzi+'/graphics.txt');
for(const dir of ['draw','voice','words','explanation'])await cp('upstream/completion-20261020/cnchar-data/'+dir,hanzi+'/data/'+dir,{recursive:true});
await writeFile(hanzi+'/NOTICE.txt','cnchar-all 3.2.6 / cnchar-data 1.1.0: MIT, theajack. Complete package resources retained locally.\nMake Me a Hanzi graphics at bddc96d41bef78427ed0e034e9f7e31d71fd1b92: Arphic Public License, Arphic Technology Co., Ltd. cnchar draw resources include these derived glyph paths. Original dictionary LGPL-3.0-or-later remains in vendor/round1/makemeahanzi.\nNo remote fonts, glyphs, voice or definitions are requested by this adapter.\n');
const walk=async dir=>{const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())files.push(...await walk(p));else files.push(p.replaceAll('\\','/'));}return files;};
const hanziFiles=[];for(const path of (await walk(hanzi)).filter(p=>!p.endsWith('UPSTREAM.json')))hanziFiles.push({path,sha256:await hash(path)});
await writeFile(hanzi+'/UPSTREAM.json',JSON.stringify({projects:[{name:'cnchar-all',version:'3.2.6',url:'https://registry.npmjs.org/cnchar-all/-/cnchar-all-3.2.6.tgz',archiveSha256:await hash('upstream/completion-20261020/cnchar-all.tgz')},{name:'cnchar-data',version:'1.1.0',url:'https://registry.npmjs.org/cnchar-data/-/cnchar-data-1.1.0.tgz',archiveSha256:await hash('upstream/completion-20261020/cnchar-data.tgz')}],graphics:{commit:'bddc96d41bef78427ed0e034e9f7e31d71fd1b92',source:'upstream/completion-20261020/makemeahanzi-graphics.txt',sha256:await hash('upstream/completion-20261020/makemeahanzi-graphics.txt')},files:hanziFiles},null,2)+'\n');
console.log(`Built full local Hanzi resources: ${hanziFiles.length} files.`);
