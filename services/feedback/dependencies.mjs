import {spawn} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {readFile,stat,mkdir,writeFile,rename,unlink} from 'node:fs/promises';
import {dirname,resolve,sep,isAbsolute,basename} from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const defaultDirectory=fileURLToPath(new URL('.',import.meta.url));
const failure=code=>Object.assign(Error(code),{feedbackCode:code});
const checkAbort=signal=>{if(signal?.aborted)throw failure('FEEDBACK_DEPENDENCY_INSTALL_ABORTED');};
const installEnvironment=env=>Object.fromEntries(Object.entries(env).filter(([key])=>!/^SMTP_|^REPORT_TO$|^FEEDBACK_/i.test(key)));
async function remove(path){try{await unlink(path);}catch(error){if(error.code!=='ENOENT')throw error;}}

async function findNpmCLI(env,npmCLI){
  const nodeDirectory=dirname(process.execPath);
  const candidates=npmCLI?[npmCLI]:[env.npm_execpath,resolve(nodeDirectory,'node_modules/npm/bin/npm-cli.js'),resolve(nodeDirectory,'../lib/node_modules/npm/bin/npm-cli.js'),resolve(nodeDirectory,'../share/nodejs/npm/bin/npm-cli.js')];
  for(const path of candidates){
    if(typeof path==='string'&&isAbsolute(path)&&basename(path)==='npm-cli.js'&&await stat(path).then(info=>info.isFile(),()=>false))return path;
  }
  throw failure('FEEDBACK_DEPENDENCY_INSTALL_FAILED');
}

// No shell, lifecycle scripts, npm output or SMTP credentials cross this boundary.
export async function installFeedbackDependencies({serviceDirectory,signal,timeoutMS=90000,env=process.env,npmCLI,spawnProcess=spawn}={}){
  checkAbort(signal);
  const cli=await findNpmCLI(env,npmCLI);checkAbort(signal);
  await new Promise((resolvePromise,reject)=>{
    let child,timer,forceTimer,reason,settled=false;
    const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);clearTimeout(forceTimer);signal?.removeEventListener('abort',abort);error?reject(error):resolvePromise();};
    const stop=code=>{
      if(settled||reason)return;reason=code;
      try{child.kill('SIGTERM');}catch{}
      forceTimer=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},1000);
    };
    const abort=()=>stop('FEEDBACK_DEPENDENCY_INSTALL_ABORTED');
    try{
      child=spawnProcess(process.execPath,[cli,'ci','--omit=dev','--ignore-scripts','--no-audit','--no-fund','--prefix',serviceDirectory],{cwd:serviceDirectory,env:installEnvironment(env),stdio:'ignore',shell:false,windowsHide:true});
      child.once('error',()=>finish(failure(reason||'FEEDBACK_DEPENDENCY_INSTALL_FAILED')));
      child.once('close',code=>finish(reason?failure(reason):code===0?undefined:failure('FEEDBACK_DEPENDENCY_INSTALL_FAILED')));
      signal?.addEventListener('abort',abort,{once:true});
      timer=setTimeout(()=>stop('FEEDBACK_DEPENDENCY_INSTALL_TIMEOUT'),timeoutMS);
      if(signal?.aborted)abort();
    }catch{finish(failure('FEEDBACK_DEPENDENCY_INSTALL_FAILED'));}
  });
  checkAbort(signal);
}

async function installationMatches(serviceDirectory,version){
  try{
    const packageDirectory=resolve(serviceDirectory,'node_modules/nodemailer');
    const installed=JSON.parse(await readFile(resolve(packageDirectory,'package.json'),'utf8'));
    if(installed.name!=='nodemailer'||installed.version!==version)return false;
    const entry=createRequire(resolve(serviceDirectory,'package.json')).resolve('nodemailer');
    return entry.startsWith(packageDirectory+sep)&&await stat(entry).then(info=>info.isFile(),()=>false);
  }catch{return false;}
}

// The marker belongs to the private installed tree, never the Git checkout.
// Removing/recreating a container or changing either lock input rechecks it.
export async function ensureFeedbackDependencies({serviceDirectory=defaultDirectory,signal,timeoutMS=90000,env=process.env,install=installFeedbackDependencies,npmCLI,spawnProcess}={}){
  checkAbort(signal);serviceDirectory=resolve(serviceDirectory);
  let digest,version;
  try{
    const [manifestBytes,lockBytes]=await Promise.all(['package.json','package-lock.json'].map(name=>readFile(resolve(serviceDirectory,name))));
    const manifest=JSON.parse(manifestBytes),lock=JSON.parse(lockBytes);
    version=manifest.dependencies?.nodemailer;
    if(!/^\d+\.\d+\.\d+$/.test(version||'')||Object.keys(manifest.dependencies).length!==1||lock.lockfileVersion!==3||lock.packages?.['']?.dependencies?.nodemailer!==version||lock.packages?.['node_modules/nodemailer']?.version!==version||!/^sha512-[A-Za-z\d+/]+={0,2}$/.test(lock.packages['node_modules/nodemailer'].integrity||''))throw Error('Invalid fixed lock');
    digest=createHash('sha256').update(manifestBytes).update('\0').update(lockBytes).digest('hex');
  }catch{throw failure('FEEDBACK_DEPENDENCY_CONFIG_INVALID');}
  checkAbort(signal);
  const markerPath=resolve(serviceDirectory,'node_modules/.mist-feedback-install.json');
  let marker;try{marker=JSON.parse(await readFile(markerPath,'utf8'));}catch{}
  if(marker?.schema===1&&marker.digest===digest&&marker.dependencies?.nodemailer===version&&await installationMatches(serviceDirectory,version)){
    checkAbort(signal);return{installed:false,version};
  }
  let temporary;
  try{
    checkAbort(signal);await remove(markerPath);
    await install({serviceDirectory,signal,timeoutMS,env:installEnvironment(env),npmCLI,spawnProcess});
    checkAbort(signal);
    if(!await installationMatches(serviceDirectory,version))throw failure('FEEDBACK_DEPENDENCY_INSTALL_FAILED');
    checkAbort(signal);
    await mkdir(dirname(markerPath),{recursive:true});
    temporary=markerPath+'.'+process.pid+'.'+randomUUID()+'.tmp';
    await writeFile(temporary,JSON.stringify({schema:1,digest,dependencies:{nodemailer:version}})+'\n',{mode:0o600,flag:'wx'});
    checkAbort(signal);await rename(temporary,markerPath);temporary=undefined;
    if(signal?.aborted){await remove(markerPath);checkAbort(signal);}
    return{installed:true,version};
  }catch(error){
    if(temporary)await remove(temporary).catch(()=>{});
    if(signal?.aborted)throw failure('FEEDBACK_DEPENDENCY_INSTALL_ABORTED');
    const codes=['FEEDBACK_DEPENDENCY_INSTALL_FAILED','FEEDBACK_DEPENDENCY_INSTALL_ABORTED','FEEDBACK_DEPENDENCY_INSTALL_TIMEOUT'];
    throw failure(codes.includes(error.feedbackCode)?error.feedbackCode:'FEEDBACK_DEPENDENCY_INSTALL_FAILED');
  }
}
