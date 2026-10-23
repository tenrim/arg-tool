import test from 'node:test';
import assert from 'node:assert/strict';
import {moduleGraph,closure,cyclesOf} from '../scripts/module-graph.mjs';
import {boundaryViolations} from '../scripts/architecture-policy.mjs';
import {capabilityRoute} from '../public/capabilities/routes.js';
import {LANGUAGES} from '../public/coderunner/catalog.js';
import {LANGUAGES as legacyLanguages,ookToBrainfuck} from '../public/coderunner/model.js';
import {TYPES} from '../public/round3/catalog.js';
import {TYPES as legacyTypes,blankBoard} from '../public/round3/board-model.js';

test('discovery dependencies remain data-only; real application imports have no cycles',async()=>{
  const graph=await moduleGraph();assert.deepEqual(cyclesOf(graph),[]);
  assert.deepEqual(boundaryViolations(graph,closure),[]);
  const dependencies=closure(graph,'public/capabilities/registry.js');
  for(const file of dependencies)assert(!/\/ui\/|\/model\.js$|board-model|workspace\.js$|worker\.js$/.test(file),file);
  assert(!closure(graph,'public/capabilities/sidebar.js').has('public/capabilities/workspace.js'));
});
test('boundaries reject UI back-imports, worker-to-UI and accidental cross-feature imports',()=>{
  const graph=new Map([
    ['public/ui/core.js',{imports:['public/turing/ui.js']}],
    ['public/turing/ui.js',{imports:['public/ui/core.js','public/reference/index.js','public/image-tools.js']}],
    ['public/science/worker.js',{imports:['public/ui/core.js']}],
    ['public/navigation.js',{imports:['public/coderunner/model.js']}]
  ]);
  const issues=boundaryViolations(graph,closure).join('\n');
  assert.match(issues,/UI must not/);assert.match(issues,/cross-feature/);assert.match(issues,/transitively imports UI/);assert.match(issues,/discovery data/);
  assert.match(issues,/root-level feature/);
  assert.equal(cyclesOf(graph).length,1);
});

test('the metadata search adapter alone may import the pinned pure fuzzy library',()=>{
  const allowed=new Map([['public/capabilities/search.js',{imports:['public/vendor/fuse/fuse.js']}]]);
  assert.deepEqual(boundaryViolations(allowed,closure),[]);
  for(const [from,to]of [['public/capabilities/search.js','public/ui/index.js'],['public/navigation.js','public/vendor/fuse/fuse.js'],['public/capabilities/search.js','public/science/core.js']]){
    assert.ok(boundaryViolations(new Map([[from,{imports:[to]}]]),closure).some(issue=>issue.includes('discovery data')));
  }
});

test('组合入口不重新接管媒体算法、计算内核或表单状态',()=>{
 const wrong=new Map([
  ['public/app.js',{imports:['public/media.js']}],
  ['public/practical/index.js',{imports:['public/qalculate/client.js','public/ui/index.js']}]
 ]);
 const issues=boundaryViolations(wrong,closure).join('\n');
 assert.match(issues,/bootstrap composes controllers/);assert.match(issues,/practical entry composes domain views only/);
 const right=new Map([
  ['public/app.js',{imports:['public/media-workspace/audio.js','public/media-workspace/file.js']}],
  ['public/practical/index.js',{imports:['public/practical/date-view.js','public/practical/geometry-view.js']}]
 ]);
 assert.deepEqual(boundaryViolations(right,closure),[]);
});

test('魔方观察来源使用单向具名桥，不扩大其他功能的根模块访问权限',()=>{
 assert.deepEqual(boundaryViolations(new Map([['public/round1/cube.js',{imports:['public/project-sources.js']}]]),closure),[]);
 assert.ok(boundaryViolations(new Map([['public/round1/hanzi.js',{imports:['public/project-sources.js']}]]),closure).some(issue=>issue.includes('root-level feature')));
});
test('route extraction preserves direction, original operation IDs and contains only route identity',()=>{
  const entry={id:'chef:To Base64',route:'encoding',input:'private clue'};
  const [path,query]=capabilityRoute(entry,'From Base64','decode').split('?');
  assert.equal(path,'encoding');assert.deepEqual(Object.fromEntries(new URLSearchParams(query)),{task:entry.id,op:'From Base64',dir:'decode'});
  assert.equal(capabilityRoute({id:'native:colors',open:{route:'colors'}}),'colors?task=native%3Acolors');
});
test('metadata extraction retains legacy exports and actual model behavior',()=>{
  assert.equal(LANGUAGES,legacyLanguages);assert.equal(TYPES,legacyTypes);
  assert.equal(Object.keys(LANGUAGES).length,10);assert.equal(Object.keys(TYPES).length,4);
  assert.equal(ookToBrainfuck('Ook. Ook. Ook! Ook.').code,'+.');
  assert.equal(blankBoard('sudoku',4,4).cells.length,4);
});
