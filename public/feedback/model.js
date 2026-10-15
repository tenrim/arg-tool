export const APP_VERSION='2026-10-15.handoff-feedback.1';
const events=[];
const safeId=value=>typeof value==='string'&&/^[\w:%.-]{1,160}$/.test(value)?value:'';
export function rememberAction(kind,id){
  if(!['task','action','error'].includes(kind))return;
  events.push({kind,id:safeId(id),at:new Date().toISOString()});if(events.length>30)events.shift();
}
export function errorDiagnostic(error){
  // Messages, arbitrary error properties and console output can contain clues
  // or keys. Only classify known failures and keep application source locations.
  const message=String(error?.message||'');
  const code=/bounds|offset|DataView/i.test(message)?'BYTE_BOUNDS':/load|加载|fetch/i.test(message)?'RESOURCE_LOAD':/timeout|超时/i.test(message)?'TIMEOUT':'EXECUTION_ERROR';
  const type=['TypeError','RangeError','SyntaxError','Error'].includes(error?.name)?error.name:'Error';
  const base=new URL('../',import.meta.url).href;
  const frames=String(error?.stack||'').split('\n').slice(1,12).flatMap(line=>{
    const at=line.indexOf(base);if(at<0)return [];
    const match=line.slice(at+base.length).match(/^([A-Za-z0-9_./-]+\.m?js):(\d+):(\d+)/);
    return match?[{file:match[1],line:Number(match[2]),column:Number(match[3])}]:[];
  });
  return {code,type,frames};
}
let latest=null;
export function captureFailure(error){latest=errorDiagnostic(error);rememberAction('error',latest.code);}
export function diagnostics({task='',status='',width=0,height=0,userAgent=''}={}){
  const browser=/(Firefox|Edg|Chrome|Version)\/(\d+(?:\.\d+){0,3})/.exec(userAgent);
  return {version:APP_VERSION,task:safeId(task),status:safeId(status),browser:browser?browser[1]+'/'+browser[2]:'unknown',viewport:[Math.max(0,Math.min(20000,Math.round(width))),Math.max(0,Math.min(20000,Math.round(height)))],error:latest?structuredClone(latest):null,actions:events.map(e=>({...e}))};
}
export function reportText(report){
  return ['迷雾工具箱 · 问题报告',`报告编号：${report.id}`,`类型：${report.type}`,`问题：${report.description}`,`期望：${report.expected}`,`复现步骤：${report.steps}`,`联系方式：${report.contact}`,'诊断信息：',JSON.stringify(report.diagnostics,null,2),`自选附件：${(report.attachments||[]).map(file=>file.name).join('、')||'无'}`].join('\n');
}
