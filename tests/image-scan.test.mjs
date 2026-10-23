import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {once} from 'node:events';
import {createDevServer,closeDevServer} from '../scripts/server.mjs';
import {TASK_PROJECT_SOURCES} from '../public/project-source-contracts.js';
import {PROJECT_LICENSES} from '../public/project-licenses.js';

test('retired server scan has no executable, package command or integrated dependency',async()=>{
 for(const path of ['services/image-scan','public/image-scan','scripts/setup-image-scanner.mjs','public/licenses/aperisolve-server','upstream/aperisolve-server'])await assert.rejects(access(path),{code:'ENOENT'});
 const pkg=JSON.parse(await readFile('package.json','utf8'));assert.equal(pkg.scripts['setup:scanner'],undefined);
 assert.deepEqual(TASK_PROJECT_SOURCES['native:image-steg'].urls,['https://github.com/Ge0rg3/StegOnline']);
 assert.equal(PROJECT_LICENSES.some(p=>p.name==='AperiSolve 完整扫描运行环境'),false);
 assert.ok(PROJECT_LICENSES.some(p=>p.name==='AperiSolve'),'local visual algorithm attribution remains');
});
test('retired scan requests never start a processing backend',async()=>{
 const server=createDevServer({feedbackStarter:async()=>({url:null,close:async()=>{}})});server.listen(0,'127.0.0.1');await once(server,'listening');
 try{const base=`http://127.0.0.1:${server.address().port}`;assert.equal(server.imageScan,undefined);assert.equal((await fetch(base+'/api/image-scan')).status,404);assert.equal((await fetch(base+'/api/image-scan',{method:'POST',body:'{}'})).status,405);}
 finally{await closeDevServer(server);}
});
