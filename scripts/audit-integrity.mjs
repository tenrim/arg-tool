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
const uiRuntime=await json('public/vendor/ui-runtime/UPSTREAM.json');for(const file of uiRuntime.files)await verify(file.path,file.sha256);await verify(uiRuntime.lockfile,uiRuntime.lock_sha256);
const animation=await json('public/vendor/animation/UPSTREAM.json');for(const file of animation.files)await verify(file.path,file.sha256);
const qalculate=await json('public/vendor/qalculate/UPSTREAM.json');for(const file of qalculate.files)await verify(file.path,file.sha256);
const search=await json('public/vendor/fuse/UPSTREAM.json');for(const file of search.files)await verify(file.path,file.sha256);
for(const name of ['timezones','atlas-celestial','atlas-life-culture']){
 const fixed=await json('public/vendor/'+name+'/UPSTREAM.json');
 for(const file of [...fixed.sources||[],...fixed.files])await verify(file.path,file.sha256);
}
const itReference=await json('public/vendor/it-reference/UPSTREAM.json');for(const file of itReference.files)await verify(file.path,file.sha256);
const mdnChinese=await json('public/vendor/reference-mdn-zh/UPSTREAM.json');for(const file of mdnChinese.source.files)await verify('upstream/reference-mdn-zh/'+file.name,file.sha256);for(const file of mdnChinese.files)await verify(file.path,file.sha256);
const cldr=await json('public/vendor/cldr/UPSTREAM.json');for(const file of cldr.sources)await verify('upstream/cldr/'+file.path,file.sha256);for(const file of cldr.files)await verify(file.path,file.sha256);
const referenceChinese=await json('public/vendor/reference-chinese/UPSTREAM.json'),referenceChineseSources=await json(referenceChinese.sourceManifest);
for(const file of referenceChineseSources.files){await verify(file.path,file.sha256);assert.equal(createHash('sha256').update(gunzipSync(await readFile(file.path))).digest('hex'),file.contentSha256,'Original Chinese reference source differs: '+file.path);checked++;}
for(const file of referenceChinese.files)await verify(file.path,file.sha256);
const notebook=await json('public/vendor/notebook/UPSTREAM.json');for(const file of notebook.files)await verify(file.path,file.sha256);
const graphics=await json('public/vendor/graphics/UPSTREAM.json');for(const file of graphics.files)await verify(file.path,file.sha256);
// Expansion sources remain fixed; runtime generations never bless changed originals.
for(const path of ['public/vendor/expansion/hunt/UPSTREAM.json','upstream/expansion/hunt/chinese-puzzle/UPSTREAM.json','upstream/expansion/hunt/cipher-machine/UPSTREAM.json']){const data=await json(path);for(const file of data.files)await verify(join(dirname(path),file.path),file.sha256);}
const numberTheory=await json('public/vendor/expansion/alpertron/UPSTREAM.json');for(const file of numberTheory.files)await verify(join('public/vendor/expansion/alpertron',file.path),file.sha256);for(const file of numberTheory.sources)await verify(join('upstream/expansion/alpertron',file.path),file.sha256);
const morse=await json('public/vendor/expansion/ggmorse/UPSTREAM.json');for(const file of morse.sourceFiles)await verify(file.path,file.sha256);for(const file of morse.runtimeFiles)await verify(join('public',file.path),file.sha256);
const constraints=await json('public/vendor/expansion/cipher-constraints/UPSTREAM.json');for(const [path,hash] of Object.entries(constraints.source_sha256))await verify(join(constraints.original_source_directory,path),hash);for(const [path,hash] of Object.entries(constraints.generated_sha256))await verify(join('public/vendor/expansion/cipher-constraints',path),hash);
const keyboard=await json('public/vendor/expansion/keyboard/UPSTREAM.json');await verify(keyboard.source_path,keyboard.source_sha256);for(const [path,hash] of Object.entries(keyboard.generated_sha256))await verify(join('public/vendor/expansion/keyboard',path),hash);
const discovery=await json('public/vendor/discovery/UPSTREAM.json');for(const file of discovery.files){await verify(file.path,file.sha256);if(file.compression==='gzip'){const original=gunzipSync(await readFile(file.path));assert.equal(original.length,file.content_bytes,'Original size: '+file.path);assert.equal(createHash('sha256').update(original).digest('hex'),file.content_sha256,'Original content differs: '+file.path);checked++;}}
const basics=await json('public/vendor/basics/UPSTREAM.json');for(const file of basics.files)await verify(file.path,file.sha256);
const turing=await json('public/vendor/turing/UPSTREAM.json');for(const file of turing.files)await verify(file.path,file.sha256);
const science=await json('public/vendor/science/UPSTREAM.json');for(const file of science.files)await verify(file.path,file.sha256);
for(const path of ['public/vendor/hanzi-full/UPSTREAM.json','public/vendor/science/seqviz/UPSTREAM.json']){const data=await json(path);for(const file of data.files)await verify(file.path,file.sha256);if(data.lockfile)await verify(data.lockfile,data.lockSha256);}
const round4=await json('public/vendor/round4/UPSTREAM.json');for(const file of round4.bundles)await verify('public/vendor/round4/'+file.path,file.sha256);for(const pkg of round4.packages)for(const file of pkg.files)await verify(join(pkg.source_directory,file.path),file.sha256);
const steg=await json('public/vendor/stegonline/UPSTREAM.json');for(const file of steg.files){await verify(file.source,file.source_sha256);await verify(file.output,file.output_sha256);}for(const port of steg.ports||[])await verify(port.source,port.source_sha256);if(steg.pngtoy)await verify(join('public/vendor/stegonline',steg.pngtoy.path),steg.pngtoy.sha256);
const aperi=await json('public/vendor/aperisolve/UPSTREAM.json');for(const source of aperi.sources)await verify(source.path,source.sha256);await verify(join('public/vendor/aperisolve',aperi.output.path),aperi.output.sha256);
const manifest=await json('upstream-manifest.json');
for(const file of await json('upstream/completion-20261017/SOURCE_FILES.json'))await verify(join('upstream/completion-20261017',file.path),file.sha256);
for(const file of (await json('public/vendor/completion/UPSTREAM.json')).files)await verify(join('public/vendor/completion',file.path),file.sha256);
for(const c of manifest.components){if(c.license_path&&c.license_sha256)await verify(c.license_path,c.license_sha256);if(c.local_path&&c.sha256)await verify(c.local_path,c.sha256);for(const p of c.components||[c]){let repo=p.repository;if(repo&&typeof repo==='object')repo=repo.url;if(!repo)continue;repo=repo.replace(/^git\+/,'').replace(/\.git$/,'').replace(/^github:/,'https://github.com/');assert.ok(projectLicense(repo),'Missing license registration: '+repo);}}
for(const project of PROJECT_LICENSES){assert.ok(project.license&&project.notices.length);for(const path of project.notices){assert.ok(resolve('public',path).startsWith(resolve('public')+sep));await access('public/'+path);}}
console.log(`PASS: ${checked} pinned source/runtime hashes; ${PROJECT_LICENSES.length} license registrations and their notice files.`);
