// npm advisory coverage only; C/C++/Rust and opaque bundled transitive code need separate review.
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
const packages=new Map();
function add(name,version){if(!name||!version)return;if(!packages.has(name))packages.set(name,new Set());packages.get(name).add(version);}
async function walk(root){for(const entry of await readdir(root,{withFileTypes:true})){const path=join(root,entry.name);if(entry.isDirectory())await walk(path);else if(entry.name==='package.json'){const p=JSON.parse(await readFile(path,'utf8'));add(p.name,p.version);}}}
await walk('public/vendor');
for(const root of ['upstream/round2','upstream/round4','upstream/coderunner','test-tools']){const lock=JSON.parse(await readFile(root+'/package-lock.json','utf8'));for(const [path,pkg]of Object.entries(lock.packages))if(path.startsWith('node_modules/'))add(path.split('node_modules/').at(-1),pkg.version);}
const versions=Object.fromEntries([...packages].sort(([a],[b])=>a.localeCompare(b)).map(([name,v])=>[name,[...v].sort()]));
const endpoint='https://registry.npmjs.org/-/npm/v1/security/advisories/bulk';
const advisories=JSON.parse(execFileSync('curl',['--fail','--silent','--show-error','--max-time','60','-H','Content-Type: application/json','--data-binary','@-',endpoint],{input:JSON.stringify(versions),encoding:'utf8',maxBuffer:10*1024*1024}));
const report={checked_at:new Date().toISOString(),source:endpoint,scope:'Pinned npm versions in bundled package.json and round2/coderunner/test-tools lockfiles. Does not cover non-npm Rust/C/C++, or all transitive code inside CyberChef.',packages:versions,advisories};
const index=process.argv.indexOf('--report');if(index>=0){if(!process.argv[index+1])throw Error('--report requires a path');await writeFile(process.argv[index+1],JSON.stringify(report,null,2)+'\n');}
const count=Object.values(advisories).reduce((n,items)=>n+items.length,0);console.log(`${count?'FAIL':'PASS'}: ${packages.size} pinned npm package names checked; ${count} known advisories returned.`);process.exitCode=count?1:0;
