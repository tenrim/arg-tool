// Check pinned artifacts before any generator can rewrite an integrity manifest.
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join,resolve,sep} from 'node:path';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {PROJECT_LICENSES,projectLicense} from '../public/project-licenses.js';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
let checked=0;
async function verify(path,hash){assert.match(hash,/^[0-9a-f]{64}$/i,path);assert.equal(createHash('sha256').update(await readFile(path)).digest('hex'),hash,'Artifact differs: '+path);checked++;}
for(const path of ['public/vendor/cyberchef/UPSTREAM.json','public/vendor/cyberchef/ENGINE.json','public/vendor/coderunner/UPSTREAM.json','public/vendor/knowledge/UPSTREAM.json']){const data=await json(path);for(const file of data.files)await verify(join(dirname(path),file.path),file.sha256);}
for(const [file,hash]of Object.entries(await json('public/vendor/round1/INTEGRITY.json')))await verify('public/vendor/round1/'+file,hash);
for(const [file,info]of Object.entries((await json('public/vendor/hunt/INTEGRITY.json')).files))await verify('public/vendor/hunt/'+file,info.sha256);
for(const [file,hash]of Object.entries((await json('public/vendor/round3/UPSTREAM.json')).files))await verify('public/vendor/round3/'+file,hash);
const round2=await json('public/vendor/round2/UPSTREAM.json');for(const file of round2.bundles)await verify('public/vendor/round2/'+file.path,file.sha256);for(const pkg of round2.packages)for(const file of pkg.files)await verify(join(pkg.source_directory,file.path),file.sha256);
const reference=await json('public/vendor/reference/UPSTREAM.json');for(const file of reference.files)await verify(file.path,file.sha256);
const itReference=await json('public/vendor/it-reference/UPSTREAM.json');for(const file of itReference.files)await verify(file.path,file.sha256);
const discovery=await json('public/vendor/discovery/UPSTREAM.json');for(const file of discovery.files){await verify(file.path,file.sha256);if(file.compression==='gzip'){const original=gunzipSync(await readFile(file.path));assert.equal(original.length,file.content_bytes,'Original size: '+file.path);assert.equal(createHash('sha256').update(original).digest('hex'),file.content_sha256,'Original content differs: '+file.path);checked++;}}
const basics=await json('public/vendor/basics/UPSTREAM.json');for(const file of basics.files)await verify(file.path,file.sha256);
const turing=await json('public/vendor/turing/UPSTREAM.json');for(const file of turing.files)await verify(file.path,file.sha256);
const science=await json('public/vendor/science/UPSTREAM.json');for(const file of science.files)await verify(file.path,file.sha256);
const round4=await json('public/vendor/round4/UPSTREAM.json');for(const file of round4.bundles)await verify('public/vendor/round4/'+file.path,file.sha256);for(const pkg of round4.packages)for(const file of pkg.files)await verify(join(pkg.source_directory,file.path),file.sha256);
const steg=await json('public/vendor/stegonline/UPSTREAM.json');for(const file of steg.files){await verify(file.source,file.source_sha256);await verify(file.output,file.output_sha256);}if(steg.pngtoy)await verify(join('public/vendor/stegonline',steg.pngtoy.path),steg.pngtoy.sha256);
const aperi=await json('public/vendor/aperisolve/UPSTREAM.json');for(const source of aperi.sources)await verify(source.path,source.sha256);await verify(join('public/vendor/aperisolve',aperi.output.path),aperi.output.sha256);
const manifest=await json('upstream-manifest.json');
for(const c of manifest.components){if(c.license_path&&c.license_sha256)await verify(c.license_path,c.license_sha256);if(c.local_path&&c.sha256)await verify(c.local_path,c.sha256);for(const p of c.components||[c]){let repo=p.repository;if(repo&&typeof repo==='object')repo=repo.url;if(!repo)continue;repo=repo.replace(/^git\+/,'').replace(/\.git$/,'').replace(/^github:/,'https://github.com/');assert.ok(projectLicense(repo),'Missing license registration: '+repo);}}
for(const project of PROJECT_LICENSES){assert.ok(project.license&&project.notices.length);for(const path of project.notices){assert.ok(resolve('public',path).startsWith(resolve('public')+sep));await access('public/'+path);}}
console.log(`PASS: ${checked} pinned source/runtime hashes; ${PROJECT_LICENSES.length} license registrations and their notice files.`);
