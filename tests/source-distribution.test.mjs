import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';

test('dependency installer roundtrip, integrity, path safety and failure preservation',()=>{
 const result=spawnSync(process.env.PYTHON||'python',['tests/source-dependencies_test.py'],{encoding:'utf8'});
 assert.equal(result.status,0,result.error?.message||result.stdout+result.stderr);
 console.log(result.stdout+result.stderr);
});
test('source distribution pins external files and keeps original grid bridge outside the bundle',async()=>{
 const lock=JSON.parse(await readFile('dependencies.lock.json','utf8'));
 assert.equal(lock.schema,1);assert(lock.files.length>0);
 assert(!lock.files.some(row=>row.path==='upstream/round3/board_bridge.rs'));
 const ignore=await readFile('.gitignore','utf8');assert(ignore.includes('/public/vendor/'));assert(ignore.includes('/release/'));
 for(const row of lock.files){assert.match(row.sha256,/^[0-9a-f]{64}$/);assert(Number.isSafeInteger(row.size)&&row.size>=0);}
});

test('optional mail template contains no credentials or original deployment domain',async()=>{
 const template=await readFile('services/feedback/.env.example','utf8');
 for(const key of ['SMTP_USER','SMTP_PASS','REPORT_TO'])assert.match(template,new RegExp('^'+key+'=$','m'));
 assert(!template.includes('mistarg.cn'));
 assert.match(template,/ALLOWED_ORIGINS=http:\/\/localhost:3000/);
});
