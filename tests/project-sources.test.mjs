import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {EXPANSION_TASKS} from '../public/expansion/catalog.js';
import {TASK_PROJECT_SOURCES,OPERATION_PROJECT_SOURCES,NOTEBOOK_PROJECT_SOURCES} from '../public/project-source-contracts.js';
import {projectLicense} from '../public/project-licenses.js';
import {LANGUAGES} from '../public/coderunner/catalog.js';

test('each code task declares only its actual language engine',()=>{
 for(const language of Object.keys(LANGUAGES)){
  const id=language==='brainfuck'?'native:code':'native:code-'+language,spec=TASK_PROJECT_SOURCES[id];
  assert.ok(spec,'Missing code task sources: '+id);assert.equal(spec.panel,'code');
  assert.equal(spec.urls.length,1,'No unrelated language engines in the task footer');
  assert.ok(spec.roles[spec.urls[0]],'The role names actual language use');
 }
 assert.deepEqual(TASK_PROJECT_SOURCES['native:code-python'].urls,['https://github.com/pyodide/pyodide']);
 assert.deepEqual(TASK_PROJECT_SOURCES['native:code-sql'].urls,['https://github.com/sql-js/sql.js']);
});

test('every expansion task declares actual sources or explicit original ownership',()=>{
 for(const task of EXPANSION_TASKS){
  const spec=TASK_PROJECT_SOURCES['native:'+task.id];
  assert.ok(spec,'Missing source declaration for '+task.id);
  assert.equal(spec.panel,task.panel);
  assert.ok(Object.isFrozen(spec)&&Object.isFrozen(spec.urls));
  if(task.id.startsWith('classical-')||['integer-codecs','color-codes','nato','gs8'].includes(task.id))assert.deepEqual(spec.urls,[],'original algorithms must not invent dependencies');
  else assert.ok(spec.urls.length,'an integrated engine/data task requires sources');
 }
 assert.deepEqual(TASK_PROJECT_SOURCES['native:element-spelling'].urls,['https://github.com/Bowserinator/Periodic-Table-JSON']);
 assert.equal(TASK_PROJECT_SOURCES['native:element-words'].urls.length,2,'word filtering also owns its dictionary source');
 assert.deepEqual(TASK_PROJECT_SOURCES['native:words-chinese'].urls,['https://github.com/philippica/ChinesePuzzleTool']);
 assert.equal(TASK_PROJECT_SOURCES['native:words-code'].urls.length,2,'code search owns the isolated VM and dictionary');
 for(const id of ['gaussian','quadratic','discreteLog','quadraticMod','squares','cubes','twoSquaresPower','continuedFraction','polynomial'])
  assert.equal(TASK_PROJECT_SOURCES['native:number-'+id],undefined,'retired calculators do not retain active task sources');
});

test('all declared projects have precise licenses and real bundled notices',async()=>{
 assert.equal(NOTEBOOK_PROJECT_SOURCES.length,13);
 const groups=[...Object.values(TASK_PROJECT_SOURCES).map(spec=>spec.urls),...Object.values(OPERATION_PROJECT_SOURCES).map(spec=>spec.urls),NOTEBOOK_PROJECT_SOURCES];
 for(const urls of groups){
  assert.equal(new Set(urls).size,urls.length,'source declarations are unique');
  for(const url of urls){
   const project=projectLicense(url);assert.ok(project,'Unregistered source '+url);
   assert.ok(project.role&&project.license&&project.notices.length,'source role, license and notices are required');
   for(const path of project.notices)await access(resolve('public',path));
  }
 }
});

test('QR implementations declare their real engines and conditional PNG input decoder',()=>{
 const png='https://github.com/Ge0rg3/StegOnline';
 const scanner=TASK_PROJECT_SOURCES['native:image-barcode'],repair=TASK_PROJECT_SOURCES['native:image-qr'];
 assert.deepEqual(OPERATION_PROJECT_SOURCES['Parse QR Code'].urls,['https://github.com/gchq/CyberChef',png]);
 assert.match(OPERATION_PROJECT_SOURCES['Parse QR Code'].roles[png],/PngToy.*MIT/);
 assert.equal(OPERATION_PROJECT_SOURCES['Generate QR Code'],undefined,'text-to-QR generation does not decode a shared PNG');
 assert.deepEqual(scanner.urls,['https://github.com/Sec-ant/zxing-wasm','https://github.com/zxing-cpp/zxing-cpp',png]);
 assert.deepEqual(repair.urls,['https://github.com/Merricx/qrazybox','https://github.com/cozmo/jsQR',png]);
 for(const spec of [scanner,repair]){
  assert.equal(spec.panel,'image');
  for(const url of spec.urls)assert.ok(spec.roles[url],url+' names its actual role');
  assert.match(spec.roles[png],/PngToy.*MIT/);
  assert.match(spec.roles[png],/不调用隐写提取/);
 }
});
