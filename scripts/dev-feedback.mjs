import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {isIP} from 'node:net';
import {createFeedbackServer,mailTransport} from '../services/feedback/server.mjs';

const inactive=(state,code)=>({state,code,url:null,trustedProxies:[],close:async()=>{}});
const smtpKeys=['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','REPORT_TO'];

export function normalizeFeedbackIP(value){
  if(typeof value!=='string'||value.trim()!==value||value.includes('%'))return null;
  if(isIP(value)===4)return value;
  if(isIP(value)!==6)return null;
  const canonical=new URL('http://['+value+']/').hostname.slice(1,-1).toLowerCase();
  const mapped=canonical.match(/^::ffff:([a-f\d]{1,4}):([a-f\d]{1,4})$/);
  if(mapped){const high=parseInt(mapped[1],16),low=parseInt(mapped[2],16);return[high>>>8,high&255,low>>>8,low&255].join('.');}
  return canonical;
}
function exactList(value,code,validate,allowEmpty=false){
  if(value===undefined)return[];
  if(allowEmpty&&typeof value==='string'&&!value.trim())return[];
  if(typeof value!=='string'||!value.trim())throw Object.assign(Error(code),{feedbackCode:code});
  const entries=value.split(',').map(part=>part.trim()),valid=entries.map(validate);
  if(valid.some(item=>!item))throw Object.assign(Error(code),{feedbackCode:code});
  return [...new Set(valid)];
}
function exactOrigin(value){
  try{const url=new URL(value);return !value.includes('*')&&['http:','https:'].includes(url.protocol)&&!url.username&&!url.password&&url.origin===value?value:null;}catch{return null;}
}
// Forwarded client addresses are accepted only from explicitly trusted direct
// peers. Host, Origin and X-Forwarded-For never create trust or grant access.
export function feedbackClientIP(request,trustedProxies=[]){
  const peer=normalizeFeedbackIP(request.socket?.remoteAddress);
  if(!peer)return null;
  if(!trustedProxies.includes(peer))return peer;
  return normalizeFeedbackIP(request.headers?.['x-real-ip'])||peer;
}
function closeTransport(transport){try{return Promise.resolve(transport?.close?.()).catch(()=>{});}catch{return Promise.resolve();}}
function deadline(promise,milliseconds,signal){
  let timer,abort;
  return Promise.race([promise,new Promise((_,reject)=>{
    abort=()=>reject(Object.assign(Error('Feedback startup cancelled'),{feedbackCode:'FEEDBACK_START_ABORTED'}));
    if(signal?.aborted){abort();return;}
    signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>reject(Object.assign(Error('Feedback startup timed out'),{feedbackCode:'FEEDBACK_START_TIMEOUT'})),milliseconds);
  })]).finally(()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);});
}

// Root npm start owns this loopback sidecar. Configuration stays in Node and
// all production validation/rate limits remain in the existing report service.
export async function startDevFeedback({sitePort,env=process.env,configPath=new URL('../services/feedback/.env',import.meta.url),transportFactory=mailTransport,startupTimeoutMS=transportFactory===mailTransport?100000:10000,shutdownTimeoutMS=1000,signal}={}){
  let fileEnv={};
  try{fileEnv=parseEnv(await readFile(configPath,'utf8'));}catch(error){if(error.code!=='ENOENT')return inactive('unavailable','FEEDBACK_CONFIG_READ_ERROR');}
  const setting=key=>env[key]??fileEnv[key];
  let origins,trustedProxies;
  try{
    trustedProxies=exactList(setting('FEEDBACK_TRUSTED_PROXIES'),'FEEDBACK_PROXIES_INVALID',normalizeFeedbackIP,true);
  }catch(error){return inactive('unavailable',error.feedbackCode);}
  const feedbackURL=setting('FEEDBACK_URL');
  if(feedbackURL){
    try{
      const url=new URL('/api/feedback',feedbackURL);
      if(!['http:','https:'].includes(url.protocol)||!['localhost','127.0.0.1','[::1]'].includes(url.hostname)||url.username||url.password)throw Error('Invalid local target');
      return{state:'explicit',code:'FEEDBACK_EXPLICIT',url:url.href,trustedProxies,close:async()=>{}};
    }catch{return inactive('unavailable','FEEDBACK_URL_INVALID');}
  }
  try{origins=exactList(setting('ALLOWED_ORIGINS'),'FEEDBACK_ORIGINS_INVALID',exactOrigin);}catch(error){return inactive('unavailable',error.feedbackCode);}
  const config=Object.fromEntries(smtpKeys.map(key=>[key,setting(key)]));
  if(!config.SMTP_USER&&!config.SMTP_PASS&&!config.REPORT_TO)return inactive('unconfigured','FEEDBACK_NOT_CONFIGURED');
  let transport,server,cancelled=false,closing;
  const transportAbort=new AbortController(),abortTransport=()=>transportAbort.abort();
  signal?.addEventListener('abort',abortTransport,{once:true});if(signal?.aborted)abortTransport();
  try{
    if(!Number.isInteger(sitePort)||sitePort<1||sitePort>65535)throw Error('Invalid site port');
    const creating=Promise.resolve().then(()=>transportFactory(config,{signal:transportAbort.signal}));
    creating.then(value=>{if(cancelled)closeTransport(value);},()=>{});
    transport=await deadline(creating,startupTimeoutMS,signal);
    server=createFeedbackServer({send:transport.send,origins:[...new Set([...origins,`http://localhost:${sitePort}`,`http://127.0.0.1:${sitePort}`])],trustProxy:true});
    await deadline(new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>{server.off('error',reject);if(cancelled)server.close();resolve();});}),startupTimeoutMS,signal);
    const close=()=>closing??=new Promise(resolve=>{
      let timer,finished=false;
      const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);closeTransport(transport).then(resolve);};
      timer=setTimeout(()=>{server.closeAllConnections();finish();},shutdownTimeoutMS);
      server.close(finish);server.closeIdleConnections();
    });
    server.on('error',()=>{close();});
    return{state:'automatic',code:'FEEDBACK_READY',url:`http://127.0.0.1:${server.address().port}/api/feedback`,trustedProxies,close};
  }catch(error){
    cancelled=true;abortTransport();if(server?.listening){server.close();server.closeAllConnections();}await closeTransport(transport);
    const code=['FEEDBACK_START_TIMEOUT','FEEDBACK_START_ABORTED','FEEDBACK_DEPENDENCY_INSTALL_FAILED','FEEDBACK_DEPENDENCY_INSTALL_TIMEOUT','FEEDBACK_DEPENDENCY_INSTALL_ABORTED','FEEDBACK_DEPENDENCY_CONFIG_INVALID'].includes(error.feedbackCode)?error.feedbackCode:(['ERR_MODULE_NOT_FOUND','MODULE_NOT_FOUND'].includes(error.code)?'FEEDBACK_DEPENDENCY_MISSING':'FEEDBACK_CONFIG_OR_START_ERROR');
    return inactive('unavailable',code);
  }finally{signal?.removeEventListener('abort',abortTransport);}
}
