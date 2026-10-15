// Maintenance only: npm ci --ignore-scripts --prefix upstream/coderunner first.
// Normal builds use the checked-in, pinned runtime assets and require no network.
import {readFile,writeFile,cp,mkdir,readdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..'),up=join(root,'upstream/coderunner'),out=join(root,'public/vendor/coderunner');
const modules=process.env.ARG_CODE_MODULES||join(up,'node_modules');
const {build}=await import(join(modules,'esbuild/lib/main.js'));
const source=JSON.parse(await readFile(join(up,'SOURCE.json'),'utf8'));
for(const file of source.files){const hash=createHash('sha256').update(await readFile(join(up,'esolang-park',file.path))).digest('hex');if(hash!==file.sha256)throw Error('Upstream source checksum mismatch: '+file.path);}
await mkdir(out,{recursive:true});
async function bundle(name,contents){await build({stdin:{contents,resolveDir:modules,sourcefile:name+'.entry.js'},outfile:join(out,name+'.js'),bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof'});}
await bundle('esoteric',`export {default as Brainfuck} from ${JSON.stringify(join(up,'esolang-park/languages/brainfuck/runtime.ts'))};
export {default as Befunge} from ${JSON.stringify(join(up,'esolang-park/languages/befunge93/runtime.ts'))};
export {default as Deadfish} from ${JSON.stringify(join(up,'esolang-park/languages/deadfish/runtime.ts'))};
export {default as whitespace} from '@susisu/whitespace-js'; export {default as malbolge} from 'malbolge-vm';`);
await bundle('quickjs',`import {newQuickJSWASMModuleFromVariant,newVariant} from 'quickjs-emscripten-core';
import variant from '@jitl/quickjs-wasmfile-release-sync';
export const load=url=>newQuickJSWASMModuleFromVariant(newVariant(variant,{wasmLocation:url}));`);
await cp(join(modules,'@jitl/quickjs-wasmfile-release-sync/dist/emscripten-module.wasm'),join(out,'quickjs.wasm'));
// Wasmoon only conditionally requires these Node modules; the browser path does not use them.
await build({stdin:{contents:"export {LuaFactory} from 'wasmoon';",resolveDir:modules},outfile:join(out,'lua.js'),bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof',external:['fs','path','crypto','module','child_process','url']});
await cp(join(modules,'wasmoon/dist/glue.wasm'),join(out,'lua.wasm'));
await cp(join(modules,'sql.js/dist/sql-wasm.js'),join(out,'sql.js'));
await cp(join(modules,'sql.js/dist/sql-wasm.wasm'),join(out,'sql-wasm.wasm'));
await mkdir(join(out,'python'),{recursive:true});
for(const name of ['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','pyodide-lock.json','python_stdlib.zip'])await cp(join(modules,'pyodide',name),join(out,'python',name));
await cp(join(up,'esolang-park/LICENSE'),join(out,'esolang-park.LICENSE.txt'));
const lock=JSON.parse(await readFile(join(up,'package-lock.json'),'utf8'));
let notices='Pinned npm runtime components and build dependencies. Individual licenses follow.\n\n';
for(const [p,info]of Object.entries(lock.packages)){
 if(!p)continue;const dir=join(modules,p.replace(/^node_modules\//,''));
 notices+=`\n=== ${p} ${info.version} (${info.license||'see package'}) ===\nSource: ${info.resolved}\nIntegrity: ${info.integrity}\n`;
 try{for(const f of await readdir(dir))if(/^(licen[cs]e|copying|notice)/i.test(f))notices+=`\n${f}\n${await readFile(join(dir,f),'utf8')}\n`;}catch{/* Platform-specific optional build dependency. */}
}
await writeFile(join(out,'LICENSES.txt'),notices);
// Pyodide's npm package does not contain the distribution's license file.
await cp(join(up,'PYODIDE-LICENSE.txt'),join(out,'python/LICENSE.txt'));
await cp(join(up,'CPYTHON-LICENSE.txt'),join(out,'python/CPYTHON-LICENSE.txt'));
await cp(join(up,'LUA-LICENSE.txt'),join(out,'LUA-LICENSE.txt'));
const files=[];
async function hashes(dir,prefix=''){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(prefix,e.name);if(e.isDirectory())await hashes(join(dir,e.name),p);else if(e.name!=='UPSTREAM.json'){const b=await readFile(join(dir,e.name));files.push({path:p,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});}}}
await hashes(out);
await writeFile(join(out,'UPSTREAM.json'),JSON.stringify({esolang_park_commit:'d84b21c333dc4ce417e0841145d69f04de1a4e2e',packages:Object.fromEntries(Object.entries(lock.packages).filter(([k])=>k).map(([k,v])=>[k,{version:v.version,resolved:v.resolved,integrity:v.integrity}])),files},null,2)+'\n');
console.log('Pinned code runtimes imported; '+files.reduce((n,f)=>n+f.bytes,0)+' bytes.');
