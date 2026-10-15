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
