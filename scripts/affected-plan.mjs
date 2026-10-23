import {execFileSync} from 'node:child_process';
import {access} from 'node:fs/promises';
import {normalize, localPath, moduleGraph, sourceFiles, closure} from './module-graph.mjs';
import {rules, vendorOwners, generatorOwners, browserFile, browserSuites} from './test-map.mjs';

export function changedFiles({base, cwd=process.cwd()}={}) {
  const git = args => execFileSync('git',['-c',`safe.directory=${normalize(cwd)}`,'-c','core.safecrlf=false',...args],{cwd,encoding:'utf8',maxBuffer:16*1024*1024});
  let ref='HEAD';
  if(base) ref=/^0+$/.test(base) ? '4b825dc642cb6eb9a060e54bf8d69288fbee4904' : git(['merge-base',base,'HEAD']).trim();
  // --no-renames includes both old and new owners. diff compares the base with
  // the working tree, including staged changes. Untracked code is not omitted.
  return [...new Set([...git(['diff','--name-only','-z','--no-renames',ref,'--']).split('\0'),
    ...git(['ls-files','--others','--exclude-standard','-z']).split('\0')].filter(Boolean))].sort();
}

export async function planChecks(files, {unitOnly=false, staticOnly=false}={}) {
  files=[...new Set(files.map(file=>localPath(file)))].sort();
  const checks=new Map(),unknown=[],units=new Map(),browsers=new Map(),generators=new Set(),syntax=[];
  const add=(id,command,reason)=>{if(!checks.has(id))checks.set(id,{id,command,reasons:[]});const row=checks.get(id);if(!row.reasons.includes(reason))row.reasons.push(reason);};
  const addUnit=(name,reason)=>{const file=name.startsWith('tests/')?name:`tests/${name}.test.mjs`;if(!units.has(file))units.set(file,[]);units.get(file).push(reason);};
  const addBrowser=(name,reason)=>{if(!browserSuites.includes(name))throw Error('Unknown browser suite '+name);if(!browsers.has(name))browsers.set(name,[]);browsers.get(name).push(reason);};
  const choose=(row,file)=>{for(const name of row[1]||[])addBrowser(name,file);for(const name of row[2]||[])addUnit(name,file);};
  const integrity=file=>add('integrity',['node','scripts/audit-integrity.mjs'],file);
  const architecture=file=>add('architecture',['node','scripts/audit-architecture.mjs'],file);
  const ui=file=>add('ui-policy',['node','scripts/audit-ui.mjs'],file);
  const workflow=/^scripts\/(?:test-all|verify-all|verify-affected|affected-plan|test-map|module-graph|architecture-policy|audit-architecture|check)\.mjs$/;
  for(const file of files){
    // Fixed upstream archives may contain preprocessor fragments (e.g.
    // Alpertron Blockly), not standalone Node programs. Their original bytes
    // are checked by integrity; executable adapters stay syntax/browser owned.
    if(/\.(?:m?js)$/.test(file)&&!file.startsWith('public/vendor/')&&!file.startsWith('upstream/')) {
      try{await access(file);syntax.push(file);}catch{/* Deleted files still select their owner's suite. */}
    }
    if(file.startsWith('public/')&&!file.startsWith('public/vendor/')) {
      if(/\.js$/.test(file))architecture(file);
      if(/\.(?:js|css|html)$/.test(file))ui(file);
    }
    if(/\.md$/.test(file)&&!file.startsWith('upstream/')&&!file.startsWith('public/vendor/')){add('docs',['node','scripts/audit-docs.mjs'],file);continue;}
    if(['public/project-licenses.js','public/project-sources.js'].includes(file))integrity(file);
    if(['dependencies.lock.json','scripts/source-dependencies.py','tests/source-dependencies_test.py','public/deployment.js'].includes(file)){addUnit('source-distribution',file);continue;}
    if(/^docs\//.test(file))continue; // Verification artifacts, not runtime data.
    if(/^tests\/[^/]+\.test\.mjs$/.test(file)){try{await access(file);addUnit(file,file);}catch{}continue;}
    const browser=browserSuites.find(name=>browserFile(name)===file);
    if(browser){addBrowser(browser,file);continue;}
    if(file==='scripts/browser-chef-worker.mjs'){addBrowser('chef-tools',file);continue;}
    if(workflow.test(file)||file==='package.json'||file==='package-lock.json'||file.startsWith('.github/workflows/')){
      addUnit('testing-policy',file);addUnit('architecture',file);architecture(file);continue;
    }
    if(/^scripts\/(?:audit-ui|ui-policy)\.mjs$/.test(file)){ui(file);addUnit('ui-policy',file);continue;}
    if(file==='scripts/audit-docs.mjs'){add('docs',['node','scripts/audit-docs.mjs'],file);continue;}
    if(/^scripts\/audit-(?:integrity|dependencies)\.mjs$/.test(file)||file==='upstream-manifest.json'){integrity(file);continue;}
    if(file==='scripts/audit-cyberchef.mjs'){addUnit('chef-tools',file);addUnit('capabilities',file);continue;}
    if(/^scripts\/(?:import-knowledge-sources|mirror-knowledge)/.test(file)){addUnit('knowledge-sources',file);continue;}
    if(file==='scripts/build.mjs'||file==='scripts/package-release.mjs'||file.startsWith('deploy/')){
      integrity(file);add('build',['node','scripts/build.mjs'],file);continue;
    }
    const generator=file.match(/^scripts\/([^/]+)\.(?:mjs|py)$/)?.[1];
    if(generatorOwners[generator]){
      const owner=vendorOwners.find(([pattern])=>pattern.test(generatorOwners[generator]));choose(owner,file);integrity(file);
      // Only offline JS generators are automatic. Importers never run on their
      // own: they may access upstream services or replace pinned source bytes.
      if(generator.startsWith('build-')&&file.endsWith('.mjs'))generators.add(file);
      continue;
    }
    const vendor=file.match(/^(?:public\/vendor|upstream)\/(.+)$/);
    if(vendor){const owner=vendorOwners.find(([pattern])=>pattern.test(vendor[1]));if(owner){choose(owner,file);integrity(file);continue;}}
    const rule=rules.find(([pattern])=>pattern.test(file));if(rule){choose(rule,file);continue;}
    if(/^public\/(?:fonts|assets)\//.test(file)){addBrowser('ui-layout',file);continue;}
    if(/^tests\/fixtures\//.test(file)){addBrowser('smoke',file);addBrowser('round-two',file);continue;}
    if(file.startsWith('test-tools/')){addUnit('testing-policy',file);addBrowser('sidebar-routing',file);continue;}
    // The source snapshot once included Chromium's local diagnostic log.
    // Its deletion has no behavior owner; an existing tracked log still fails closed.
    if(file==='debug.log'){try{await access(file);}catch{continue;}}
    if(['.gitignore','.gitattributes','.nojekyll','public/.nojekyll','LICENSE'].includes(file))continue;
    unknown.push(file);
  }
  // Follow real imports for cheap unit checks only. Do NOT walk app.js backwards
  // to select every browser suite merely because the application mounts them.
  const testFiles=(await sourceFiles('tests')).filter(file=>file.endsWith('.test.mjs'));
  const graph=await moduleGraph([...(await sourceFiles('public')),...(await sourceFiles('scripts')), ...testFiles]);
  // Domain unit tests sometimes import a page's exported validation function.
  // Its presentation imports do not make that algorithm test a motion test.
  const domainGraph=new Map([...graph].map(([file,node])=>[file,{...node,imports:node.imports.filter(target=>!target.startsWith('public/ui/')&&target!=='public/round1/common.js')} ]));
  for(const test of testFiles){const dependencies=closure(domainGraph,test);for(const file of files)if(dependencies.has(file))addUnit(test,file);}
  if(syntax.length)add('syntax',['node','scripts/check.mjs','--files',...syntax],syntax.join(', '));
  for(const file of generators)add('generate:'+file,['node',file],file);
  for(const [file,reasons]of units){await access(file);for(const reason of reasons)add('unit:'+file,['node','--test','--test-reporter=spec',file],reason);}
  for(const [name,reasons]of browsers)for(const reason of reasons)add('browser:'+name,['node',browserFile(name)],reason);
  const order=id=>id==='integrity'?0:id.startsWith('generate:')?1:id==='build'?5:id.startsWith('unit:')?3:id.startsWith('browser:')?4:2;
  const selected=[...checks.values()].filter(row=>!unitOnly||row.id.startsWith('unit:')).filter(row=>!staticOnly||!row.id.startsWith('unit:')&&!row.id.startsWith('browser:')&&!row.id.startsWith('generate:')&&row.id!=='build').sort((a,b)=>order(a.id)-order(b.id));
  return {mode:unitOnly?'affected-units':staticOnly?'affected-static':'affected',files,unknown,checks:selected};
}
