// Maintenance only. Ordinary builds use the unchanged, pinned local ES module.
import {mkdir,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const version='7.5.0';
const url=`https://registry.npmjs.org/fuse.js/-/fuse.js-${version}.tgz`;
const integrity='sha512-sQtrEfA+ez/3G0cCZecF70oqpCRttCexYUG4mUrtWL49ULUzUyxokt5kyqwtKzj1270RaKih+hcP3qLcumccow==';
const response=await fetch(url);if(!response.ok)throw Error('Fuse source download failed: '+response.status);
const archive=Buffer.from(await response.arrayBuffer());
if('sha512-'+createHash('sha512').update(archive).digest('base64')!==integrity)throw Error('Pinned Fuse package integrity mismatch');
const tar=gunzipSync(archive),wanted=new Map([['package/dist/fuse.mjs','fuse.mjs'],['package/LICENSE','LICENSE'],['package/package.json','package.json']]),originals=new Map();
for(let offset=0;offset+512<=tar.length;){
 const header=tar.subarray(offset,offset+512);if(header.every(byte=>byte===0))break;
 const name=header.subarray(0,100).toString().replace(/\0.*$/s,''),size=parseInt(header.subarray(124,136).toString().replace(/\0.*$/s,'').trim(),8);
 if(!Number.isSafeInteger(size)||size<0||offset+512+size>tar.length)throw Error('Invalid source tar member');
 if(wanted.has(name))originals.set(wanted.get(name),tar.subarray(offset+512,offset+512+size));
 offset+=512+Math.ceil(size/512)*512;
}
if(originals.size!==wanted.size)throw Error('Pinned Fuse module/license/package metadata missing');
const files=[];
async function save(path,data,entry){await writeFile(resolve(root,path),data);files.push({path,sha256:createHash('sha256').update(data).digest('hex'),...(entry?{archive_entry:entry}:{})});}
await mkdir(resolve(root,'upstream/fuse/source'),{recursive:true});await mkdir(resolve(root,'public/vendor/fuse'),{recursive:true});
await save(`upstream/fuse/fuse-${version}.tgz`,archive);
for(const [name,data] of originals)await save('upstream/fuse/source/'+name,data,[...wanted].find(([,value])=>value===name)[0]);
// Keep original bytes; .js is served as JavaScript by conventional static hosts.
await rm(resolve(root,'public/vendor/fuse/fuse.mjs'),{force:true});
await save('public/vendor/fuse/fuse.js',originals.get('fuse.mjs'),'package/dist/fuse.mjs');
await save('public/vendor/fuse/LICENSE.txt',originals.get('LICENSE'),'package/LICENSE');
await writeFile(resolve(root,'public/vendor/fuse/UPSTREAM.json'),JSON.stringify({name:'Fuse.js',version,repository:'https://github.com/krisk/Fuse',source_url:url,integrity,license:'Apache-2.0',files},null,2)+'\n');
console.log('Pinned local Fuse.js:',version,files.length,'original/runtime files');
