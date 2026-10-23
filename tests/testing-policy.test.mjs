import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {changedFiles,planChecks} from '../scripts/affected-plan.mjs';
import {browserSuites,browserFile,rules} from '../scripts/test-map.mjs';
import {sourceFiles} from '../scripts/module-graph.mjs';

const ids=plan=>plan.checks.map(row=>row.id);
test('sidebar selects its real regression and never unrelated engines or a full build',async()=>{
  const plan=await planChecks(['public\\capabilities\\sidebar.js']);
  assert.deepEqual(plan.unknown,[]);assert(ids(plan).includes('browser:sidebar-routing'));
  assert(!ids(plan).some(id=>/browser:(?:science|reference|coderunner|round-)|^build$/.test(id)));
  assert.equal(new Set(ids(plan)).size,plan.checks.length);
});
test('shared motion selects motion behavior without treating every mount as an engine dependency',async()=>{
  const plan=await planChecks(['public/ui/motion.js']);
  assert.deepEqual(ids(plan).filter(id=>id.startsWith('browser:')),['browser:ui-motion']);
  assert(plan.checks.every(row=>row.reasons.length));
});
test('metadata-only, pure engine, vendor and documentation changes have distinct owners',async()=>{
  const [docs,engine,vendor,metadata]=await Promise.all([
    planChecks(['README.md']),planChecks(['public/science/core.js']),
    planChecks(['public/vendor/round3/grid-engine.wasm']),planChecks(['public/coderunner/catalog.js'])]);
  assert.deepEqual(ids(docs),['docs']);
  assert(ids(engine).includes('unit:tests/science.test.mjs'));assert(!ids(engine).some(id=>id.startsWith('browser:')));
  assert(ids(vendor).includes('integrity'));assert(ids(vendor).includes('browser:round-three'));
  assert(!ids(metadata).includes('browser:coderunner'));assert(ids(metadata).includes('unit:tests/capabilities.test.mjs'));
});
test('changed test selects itself; unknown files fail closed; paths cannot leave the repository',async()=>{
  const testPlan=await planChecks(['scripts/browser-basics.mjs']);assert(ids(testPlan).includes('browser:basics'));
  const unknown=await planChecks(['public/new-tool.js']);assert.deepEqual(unknown.unknown,['public/new-tool.js']);
  await assert.rejects(planChecks(['../private.js']),/inside the repository/);
  assert.equal((await planChecks([])).checks.length,0);
});
test('Git discovery includes staged, unstaged, untracked, renamed and deleted paths',async()=>{
  const cwd=await mkdtemp(join(tmpdir(),'arg-impact-'));
  const git=args=>execFileSync('git',['-c',`safe.directory=${cwd.replaceAll('\\','/')}`,...args],{cwd,encoding:'utf8'});
  try{
    git(['init','--quiet']);git(['config','user.email','test@example.invalid']);git(['config','user.name','Impact test']);
    for(const file of ['old.js','deleted.js','edit.js','staged.js'])await writeFile(join(cwd,file),'initial\n');
    git(['add','.']);git(['commit','--quiet','-m','fixture']);const base=git(['rev-parse','HEAD']).trim();
    git(['mv','old.js','renamed.js']);await rm(join(cwd,'deleted.js'));
    await writeFile(join(cwd,'edit.js'),'unstaged\n');await writeFile(join(cwd,'staged.js'),'staged\n');git(['add','staged.js']);
    await writeFile(join(cwd,'new.js'),'untracked\n');
    assert.deepEqual(changedFiles({cwd,base}),['deleted.js','edit.js','new.js','old.js','renamed.js','staged.js']);
  }finally{assert(cwd.startsWith(join(tmpdir(),'arg-impact-')));await rm(cwd,{recursive:true,force:true});}
});
test('every registered browser suite exists and full verification uses the same catalogue',async()=>{
  assert.equal(new Set(browserSuites).size,browserSuites.length);
  for(const name of browserSuites)assert((await readFile(browserFile(name),'utf8')).length);
  assert.match(await readFile('scripts/verify-all.mjs','utf8'),/from ['"]\.\/test-map\.mjs/);
  assert.deepEqual((await sourceFiles('public')).filter(file=>!rules.some(([pattern])=>pattern.test(file))),[], 'Every existing first-party module needs a test owner');
});
test('vendor license notices still select integrity; UI lifecycle imports retain motion coverage',async()=>{
  const [notice,source,component]=await Promise.all([planChecks(['public/vendor/round1/LICENSE.md']),planChecks(['public/project-sources.js']),planChecks(['public/ui/core.js'])]);
  assert(ids(notice).includes('integrity'));assert(ids(source).includes('integrity'));
  assert(ids(component).includes('browser:ui-motion'));assert(!ids(component).includes('browser:coderunner'));
});
test('explicit JSON file scopes preserve empty scopes and reject malformed path lists',async()=>{
 const cwd=await mkdtemp(join(tmpdir(),'arg-explicit-scope-'));
 try{
  const file=join(cwd,'scope.json');await writeFile(file,'[]');
  const empty=execFileSync(process.execPath,['scripts/verify-affected.mjs','--plan','--files','@'+file],{encoding:'utf8'});assert.match(empty,/0 changed files; 0 selected checks/);
  await writeFile(file,JSON.stringify(['public/expansion/classical-core.js']));const scoped=execFileSync(process.execPath,['scripts/verify-affected.mjs','--plan','--files','@'+file],{encoding:'utf8'});assert.match(scoped,/1 changed files/);assert.match(scoped,/expansion-classical/);
  await writeFile(file,'[42]');assert.throws(()=>execFileSync(process.execPath,['scripts/verify-affected.mjs','--plan','--files','@'+file],{stdio:'pipe'}),/failed/i);
 }finally{assert(cwd.startsWith(join(tmpdir(),'arg-explicit-scope-')));await rm(cwd,{recursive:true,force:true});}
});
