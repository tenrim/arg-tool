// Maintenance only: npm ci --ignore-scripts in upstream/notebook first.
// Copy selected official files unchanged. Ordinary builds consume this snapshot.
import {readFile,writeFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const root='upstream/notebook/node_modules/',out='public/vendor/notebook/';
// Explicit maintenance flag only; normal imports/builds remain offline.
if(process.argv.includes('--renderer-notices')){
 const packages={'mermaid':'11.16.1','echarts':'5.5.1','highlight.js':'11.7.0','katex':'0.16.9','markmap-lib':'0.14.3','markmap-view':'0.14.3','d3':'6.7.0','flowchart.js':'1.14.1','raphael':'2.3.0','eve-raphael':'0.5.0','viz.js':'2.1.2','wavedrom':'3.6.2','abcjs':'5.10.3','smiles-drawer':'2.1.7'};
 const notices=[];
 for(const [name,version]of Object.entries(packages)){
  const response=await fetch(`https://registry.npmjs.org/${name}/${version}`);if(!response.ok)throw Error('License package missing: '+name);
  const metadata=await response.json(),archive=Buffer.from(await(await fetch(metadata.dist.tarball)).arrayBuffer());
  const expected=metadata.dist.integrity?.split('-');if(expected&&createHash(expected[0]).update(archive).digest('base64')!==expected[1])throw Error('Package integrity mismatch: '+name);
  const tar=gunzipSync(archive),selected=[];for(let at=0;at+512<=tar.length;){const file=tar.subarray(at,at+100).toString().replace(/\0.*$/s,''),size=parseInt(tar.subarray(at+124,at+136).toString(),8)||0;at+=512;
   if(/(?:^|\/)(?:LICENSE(?:[-_.].*)?|COPYING(?:\..*)?|NOTICE(?:\..*)?)$/i.test(file)&&size){selected.push({file,body:tar.subarray(at,at+size).toString()});}at+=Math.ceil(size/512)*512;
  }
  if(!selected.length)throw Error('No bundled license for '+name);
  const filename=name.replaceAll('.','-').toUpperCase()+'-RENDERER-LICENSE.txt',text=selected.map(n=>'Source: '+metadata.dist.tarball+' :: '+n.file+'\n\n'+n.body).join('\n\n');
  await writeFile('upstream/notebook/'+filename,text);notices.push({name,version,license:metadata.license,source:metadata.dist.tarball,integrity:metadata.dist.integrity,path:out+filename,sha256:createHash('sha256').update(text).digest('hex')});
 }
 await writeFile('upstream/notebook/renderer-notices.json',JSON.stringify(notices,null,2)+'\n');
}
const paths=[['vditor/LICENSE','VDITOR-LICENSE.txt'],['vditor/package.json','vditor-package.json'],
 ['vditor/dist/index.min.js','vditor/dist/index.min.js'],['vditor/dist/index.css','vditor/dist/index.css'],
 ['vditor/dist/js/lute/lute.min.js','vditor/dist/js/lute/lute.min.js'],
 ['vditor/dist/js/i18n/zh_CN.js','vditor/dist/js/i18n/zh_CN.js'],['vditor/dist/js/icons/ant.js','vditor/dist/js/icons/ant.js'],
 ['vditor/dist/css/content-theme/dark.css','vditor/dist/css/content-theme/dark.css'],
 ['diff-match-patch/LICENSE','DIFF-MATCH-PATCH-LICENSE.txt'],['dompurify/LICENSE','DOMPURIFY-LICENSE.txt'],
 ['dompurify/dist/purify.min.js','purify.min.js']];
const files=[];
// The pinned Vditor package includes its renderer builds. Copy their complete
// local resource trees (fonts/styles/workers), not just the editor entrypoint.
async function tree(path){for(const entry of await readdir(root+path,{withFileTypes:true})){const name=path+'/'+entry.name;if(entry.isDirectory())await tree(name);else paths.push([name,name]);}}
for(const name of ['highlight.js','katex','mermaid','echarts','markmap','flowchart.js','graphviz','wavedrom','abcjs','smiles-drawer'])await tree('vditor/dist/js/'+name);
await tree('vditor/dist/css/content-theme');
// Paths already selected above are copied once.
const selected=[...new Map(paths.map(pair=>[pair[1],pair])).values()];
for(const record of JSON.parse((await readFile('upstream/notebook/license-sources.json','utf8')).replace(/^\uFEFF/,''))){await mkdir(out,{recursive:true});await copyFile('upstream/notebook/'+record.path.split('/').pop(),record.path);files.push(record);}
for(const record of JSON.parse(await readFile('upstream/notebook/renderer-notices.json','utf8'))){await copyFile('upstream/notebook/'+record.path.split('/').pop(),record.path);files.push(record);}
for(const [source,target]of selected){await mkdir(dirname(out+target),{recursive:true});await copyFile(root+source,out+target);files.push({path:out+target,sha256:createHash('sha256').update(await readFile(out+target)).digest('hex')});}
const lock=JSON.parse(await readFile('upstream/notebook/package-lock.json','utf8'));
await writeFile(out+'UPSTREAM.json',JSON.stringify({packages:Object.entries(lock.packages).filter(([key])=>key.startsWith('node_modules/')).map(([key,p])=>({name:key.slice(13),version:p.version,resolved:p.resolved,integrity:p.integrity})),files},null,2)+'\n');
console.log('Pinned notebook runtime copied without modifying upstream bytes.');
