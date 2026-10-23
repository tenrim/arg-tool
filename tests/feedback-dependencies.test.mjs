import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {ensureFeedbackDependencies,installFeedbackDependencies} from '../services/feedback/dependencies.mjs';

async function fixture(t){
  const directory=await mkdtemp(join(tmpdir(),'mist-mail-dependencies-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  const manifest={name:'mist-test-feedback',type:'module',dependencies:{nodemailer:'10.1.1'}};
  const lock={lockfileVersion:3,packages:{'':{dependencies:{nodemailer:'10.1.1'}},'node_modules/nodemailer':{version:'10.1.1',integrity:'sha512-TESTLOCK='}}};
  await writeFile(join(directory,'package.json'),JSON.stringify(manifest));await writeFile(join(directory,'package-lock.json'),JSON.stringify(lock));
  return{directory,manifest,lock,marker:join(directory,'node_modules/.mist-feedback-install.json'),saveLock:()=>writeFile(join(directory,'package-lock.json'),JSON.stringify(lock))};
}
async function installFixture(directory,version='10.1.1'){
  const target=join(directory,'node_modules/nodemailer');await mkdir(target,{recursive:true});
  await writeFile(join(target,'package.json'),JSON.stringify({name:'nodemailer',version,main:'index.js'}));await writeFile(join(target,'index.js'),'module.exports={};\n');
}
const code=expected=>error=>error.feedbackCode===expected&&error.message===expected;

test('fresh service installs its own lock once and valid cached restarts are offline',async t=>{
  const f=await fixture(t);let installs=0;
  const install=async({serviceDirectory,env})=>{assert.equal(serviceDirectory,f.directory);assert.equal(env.SMTP_PASS,undefined);assert.equal(env.SMTP_USER,undefined);assert.equal(env.REPORT_TO,undefined);assert.equal(env.FEEDBACK_URL,undefined);assert.equal(env.PATH,'test-path');installs++;await installFixture(serviceDirectory);};
  const options={serviceDirectory:f.directory,install,env:{SMTP_PASS:'NEVER_FORWARD',SMTP_USER:'sender@private.invalid',REPORT_TO:'private@private.invalid',smtp_pass:'ALSO_SECRET',FEEDBACK_URL:'http://private.invalid',PATH:'test-path'}};
  assert.deepEqual(await ensureFeedbackDependencies(options),{installed:true,version:'10.1.1'});
  const marker=await readFile(f.marker,'utf8');assert.ok(!marker.includes('PRIVATE'));assert.ok(!marker.includes('NEVER_FORWARD'));assert.match(JSON.parse(marker).digest,/^[a-f\d]{64}$/);
  assert.deepEqual(await ensureFeedbackDependencies({...options,install:async()=>assert.fail('cached restart must not install')}),{installed:false,version:'10.1.1'});assert.equal(installs,1);
});

test('lock or manifest changes, missing entry and wrong installed versions trigger a fresh locked install',async t=>{
  const f=await fixture(t);let installs=0;const options={serviceDirectory:f.directory,install:async()=>{installs++;await installFixture(f.directory);}};
  await ensureFeedbackDependencies(options);
  f.lock.packages['node_modules/nodemailer'].integrity='sha512-UPDATED=';await f.saveLock();await ensureFeedbackDependencies(options);assert.equal(installs,2);
  f.manifest.description='Metadata changes also refresh the exact install';await writeFile(join(f.directory,'package.json'),JSON.stringify(f.manifest));await ensureFeedbackDependencies(options);assert.equal(installs,3);
  await installFixture(f.directory,'0.0.0');await ensureFeedbackDependencies(options);assert.equal(installs,4);
  await rm(join(f.directory,'node_modules/nodemailer/index.js'));await ensureFeedbackDependencies(options);assert.equal(installs,5);
});

test('invalid or mismatched lockfiles are rejected before invoking an installer',async t=>{
  const f=await fixture(t);const options={serviceDirectory:f.directory,install:async()=>assert.fail('invalid lock must not install')};
  f.lock.packages[''].dependencies.nodemailer='^10.1.1';await f.saveLock();await assert.rejects(ensureFeedbackDependencies(options),code('FEEDBACK_DEPENDENCY_CONFIG_INVALID'));
  await writeFile(join(f.directory,'package-lock.json'),'PRIVATE_BROKEN_JSON');await assert.rejects(ensureFeedbackDependencies(options),code('FEEDBACK_DEPENDENCY_CONFIG_INVALID'));
});

test('failed and incomplete installs have no successful marker and never expose raw errors',async t=>{
  const f=await fixture(t);await ensureFeedbackDependencies({serviceDirectory:f.directory,install:async()=>installFixture(f.directory)});
  f.lock.packages['node_modules/nodemailer'].integrity='sha512-CHANGED=';await f.saveLock();
  await assert.rejects(ensureFeedbackDependencies({serviceDirectory:f.directory,install:async()=>{throw Error('SMTP_PASSWORD=RAW_PRIVATE_ERROR');}}),code('FEEDBACK_DEPENDENCY_INSTALL_FAILED'));
  await assert.rejects(readFile(f.marker),{code:'ENOENT'});
  await assert.rejects(ensureFeedbackDependencies({serviceDirectory:f.directory,install:async()=>installFixture(f.directory,'0.0.0')}),code('FEEDBACK_DEPENDENCY_INSTALL_FAILED'));await assert.rejects(readFile(f.marker),{code:'ENOENT'});
});

test('cancellation prevents install or marker commit and cleans temporary marker files',async t=>{
  const f=await fixture(t),aborted=new AbortController();aborted.abort();
  await assert.rejects(ensureFeedbackDependencies({serviceDirectory:f.directory,signal:aborted.signal,install:()=>assert.fail('already cancelled')}),code('FEEDBACK_DEPENDENCY_INSTALL_ABORTED'));
  const controller=new AbortController();
  await assert.rejects(ensureFeedbackDependencies({serviceDirectory:f.directory,signal:controller.signal,install:async()=>{await installFixture(f.directory);controller.abort();}}),code('FEEDBACK_DEPENDENCY_INSTALL_ABORTED'));
  await assert.rejects(readFile(f.marker),{code:'ENOENT'});assert.deepEqual((await readdir(join(f.directory,'node_modules'))).filter(name=>name.startsWith('.mist-feedback-install')),[]);
});

test('npm executes through Node without a shell, ignores scripts and private environment, and kills cancelled children',async t=>{
  const f=await fixture(t),cli=join(f.directory,'npm-cli.js');await writeFile(cli,'// fake npm; never executed\n');
  const controller=new AbortController();let invocation,killed;
  const spawnProcess=(command,args,options)=>{invocation={command,args,options};const child=new EventEmitter();child.kill=signal=>{killed=signal;queueMicrotask(()=>child.emit('close',null,signal));return true;};queueMicrotask(()=>controller.abort());return child;};
  await assert.rejects(installFeedbackDependencies({serviceDirectory:f.directory,npmCLI:cli,signal:controller.signal,spawnProcess,env:{SMTP_PASS:'PRIVATE_SECRET',smtp_user:'PRIVATE_ADDRESS',REPORT_TO:'PRIVATE_RECIPIENT',PATH:'keep'}}),code('FEEDBACK_DEPENDENCY_INSTALL_ABORTED'));
  assert.equal(killed,'SIGTERM');assert.equal(invocation.command,process.execPath);assert.deepEqual(invocation.args,[cli,'ci','--omit=dev','--ignore-scripts','--no-audit','--no-fund','--prefix',f.directory]);
  assert.equal(invocation.options.shell,false);assert.equal(invocation.options.windowsHide,true);assert.equal(invocation.options.stdio,'ignore');assert.deepEqual(invocation.options.env,{PATH:'keep'});assert.ok(!JSON.stringify(invocation).includes('PRIVATE_'));
});

test('installer timeout and npm failures expose only stable reasons, with no false success marker',async t=>{
  const f=await fixture(t),cli=join(f.directory,'npm-cli.js');await writeFile(cli,'// not executed\n');let killed;
  const spawnProcess=()=>{const child=new EventEmitter();child.kill=signal=>{killed=signal;queueMicrotask(()=>child.emit('close',null,signal));return true;};return child;};
  await assert.rejects(ensureFeedbackDependencies({serviceDirectory:f.directory,npmCLI:cli,spawnProcess,timeoutMS:10}),code('FEEDBACK_DEPENDENCY_INSTALL_TIMEOUT'));assert.equal(killed,'SIGTERM');await assert.rejects(readFile(f.marker),{code:'ENOENT'});
  const failingSpawn=()=>{const child=new EventEmitter();queueMicrotask(()=>child.emit('error',Error('PRIVATE_STDERR')));return child;};
  await assert.rejects(ensureFeedbackDependencies({serviceDirectory:f.directory,npmCLI:cli,spawnProcess:failingSpawn}),code('FEEDBACK_DEPENDENCY_INSTALL_FAILED'));await assert.rejects(readFile(f.marker),{code:'ENOENT'});
});
