// Maintenance-only offline build from the pinned npm lock. No runtime CDN.
import {readFile,writeFile,mkdir,cp,readdir,copyFile} from 'node:fs/promises';
import {resolve,dirname,relative,join} from 'node:path';
import {createHash} from 'node:crypto';
import {build} from '../upstream/graphics/node_modules/esbuild/lib/main.js';
const root=resolve('upstream/graphics'),modules=join(root,'node_modules'),out=resolve('public/vendor/graphics');
await mkdir(out,{recursive:true});
const result=await build({entryPoints:[join(root,'excalidraw-entry.js')],outdir:join(out,'excalidraw'),bundle:true,splitting:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'linked',metafile:true,define:{'process.env.NODE_ENV':'"production"'},conditions:['production'],loader:{'.woff2':'file','.woff':'file','.ttf':'file'},assetNames:'assets/[name]-[hash]'});
await cp(join(modules,'@excalidraw/excalidraw/dist/prod/fonts'),join(out,'excalidraw/fonts'),{recursive:true});
await copyFile(join(modules,'@excalidraw/excalidraw/dist/prod/index.css'),join(out,'excalidraw/style.css'));
await cp(join(modules,'mind-elixir/dist'),join(out,'mind-elixir'),{recursive:true});
// Record the package lock, exact input bytes and generated outputs separately.
const hash=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
const paths=async dir=>{const values=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())values.push(...await paths(p));else values.push(p);}return values;};
const lock=JSON.parse(await readFile(join(root,'package-lock.json'),'utf8')),notices=[];
for(const [key,p]of Object.entries(lock.packages)){
 if(!key.startsWith('node_modules/')||p.dev)continue;
 const dir=join(root,key),name=key.slice(key.lastIndexOf('node_modules/')+13);let entries;try{entries=await readdir(dir);}catch{continue;}
 const records=entries.filter(n=>/^(?:licen[cs]e|copying|notice)(?:[._-].*)?$/i.test(n));
 for(const file of records){const source=join(dir,file);const dest=join(out,'licenses',name.replaceAll('/','_')+'-'+file);await mkdir(dirname(dest),{recursive:true});await copyFile(source,dest);notices.push({name,version:p.version,license:p.license,path:relative(resolve('public'),dest).replaceAll('\\','/')});}
}
await writeFile(join(out,'LICENSES.txt'),notices.map(n=>`${n.name}@${n.version} | ${n.license||'see notice'} | ${n.path}`).join('\n')+'\n');
await copyFile(join(root,'EXCALIDRAW-LICENSE.txt'),join(out,'EXCALIDRAW-LICENSE.txt'));
const fontNotices=JSON.parse(await readFile(join(root,'notices.json'),'utf8'));
let fontText='Excalidraw 0.18.1 bundled fonts. Original font bytes are unchanged.\nComic Shanns: MIT. Other bundled fonts: SIL OFL 1.1.\n';
for(const record of fontNotices){if(await hash(record.file)!==record.sha256)throw Error('Font notice changed: '+record.file);fontText+='\n\n'+record.url+'\n'+await readFile(record.file,'utf8');}
await writeFile(join(out,'FONTS-NOTICES.txt'),fontText);
let dependencyText='Pinned production package notices; the full package lock records versions and integrity.\n';
for(const record of notices)dependencyText+='\n\n'+record.name+'@'+record.version+' | '+record.license+'\n'+await readFile(resolve('public',record.path),'utf8');
await writeFile(join(out,'DEPENDENCY-NOTICES.txt'),dependencyText);
const inputs=Object.keys(result.metafile.inputs).map(p=>resolve(p));
inputs.push(join(root,'package.json'),join(root,'package-lock.json'));
inputs.push(join(root,'EXCALIDRAW-LICENSE.txt'),join(root,'notices.json'),...fontNotices.map(n=>resolve(n.file)));
const files=[];for(const path of await paths(out)){if(path.endsWith('UPSTREAM.json'))continue;files.push({path:relative(process.cwd(),path).replaceAll('\\','/'),sha256:await hash(path)});}
// The immutable installed sources are reproducible via npm ci and recorded in
// the lock; source snippets needed for inspection are copied as a snapshot.
await mkdir(join(root,'sources'),{recursive:true});
for(const name of ['@excalidraw/excalidraw','mind-elixir'])await copyFile(join(modules,name,'package.json'),join(root,'sources',name.replaceAll('/','_')+'-package.json'));
await writeFile(join(out,'UPSTREAM.json'),JSON.stringify({packages:Object.entries(lock.packages).filter(([key,p])=>key.startsWith('node_modules/')&&!p.dev).map(([key,p])=>({name:key.slice(13),version:p.version,license:p.license,resolved:p.resolved,integrity:p.integrity})),inputs:await Promise.all(inputs.map(async path=>({path:relative(process.cwd(),path).replaceAll('\\','/'),sha256:await hash(path)}))),files,notices},null,2)+'\n');
console.log(`Graphics built offline: ${files.length} runtime files, ${notices.length} original notices.`);
