import {createHash} from 'node:crypto';
const bad=message=>{throw Object.assign(Error(message),{status:400});};
const string=(value,max)=>typeof value==='string'&&value.length<=max?value:bad('报告字段格式或长度不正确。');
const id=value=>typeof value==='string'&&/^[\w:%.-]{0,160}$/.test(value)?value:'';
export function validateReport(input){
  if(!input||input.schema!==1||!/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(input.id))bad('报告格式不正确。');
  if(!['无法运行','结果异常','显示问题','其他'].includes(input.type))bad('问题类型不正确。');
  const description=string(input.description,3000).trim();if(description.length<5)bad('请描述发生的问题。');
  const d=input.diagnostics||{},e=d.error;
  const diagnostics={version:id(d.version),task:id(d.task),status:id(d.status),browser:id(d.browser?.replace('/','-')),
    viewport:Array.isArray(d.viewport)?d.viewport.slice(0,2).map(n=>Number.isFinite(n)?Math.max(0,Math.min(20000,Math.round(n))):0):[],
    error:e?{code:['BYTE_BOUNDS','RESOURCE_LOAD','TIMEOUT','EXECUTION_ERROR'].includes(e.code)?e.code:'EXECUTION_ERROR',type:['Error','RangeError','TypeError','SyntaxError'].includes(e.type)?e.type:'Error',frames:(Array.isArray(e.frames)?e.frames:[]).slice(0,10).filter(f=>typeof f.file==='string'&&/^[\w/-]+\.m?js$/.test(f.file)&&Number.isSafeInteger(f.line)&&Number.isSafeInteger(f.column)).map(f=>({file:f.file,line:f.line,column:f.column}))}:null,
    actions:(Array.isArray(d.actions)?d.actions:[]).slice(-30).filter(a=>['task','action','error'].includes(a.kind)).map(a=>({kind:a.kind,id:id(a.id),at:typeof a.at==='string'&&/^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(a.at)?a.at:''}))};
  if(!Array.isArray(input.attachments)||input.attachments.length>2)bad('最多添加 2 个附件。');
  let total=0;
  const attachments=input.attachments.map(file=>{
    const name=string(file.name,180).split(/[\\/]/).pop().replace(/[\r\n\x00-\x1f]/g,'_')||'attachment.bin';
    if(typeof file.data!=='string'||file.data.length>5600000||file.data.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(file.data))bad('附件编码不正确。');
    const content=Buffer.from(file.data,'base64');total+=content.length;if(total>4*1024*1024)bad('附件合计不能超过 4 MB。');
    return {filename:name,content,contentType:'application/octet-stream'};
  });
  return {id:input.id,type:input.type,description,expected:string(input.expected,1500),steps:string(input.steps,3000),contact:string(input.contact,160),diagnostics,attachments};
}
export function reportMail(report){
  const {attachments,...body}=report;
  return {subject:`迷雾工具箱 · ${report.type} · ${report.id.slice(0,8)}`,text:[`报告编号：${report.id}`,`问题：${report.description}`,`期望：${report.expected}`,`复现步骤：${report.steps}`,`联系方式：${report.contact}`,'诊断信息：',JSON.stringify(report.diagnostics,null,2)].join('\n'),attachments,
    digest:createHash('sha256').update(JSON.stringify(body)).update(attachments.map(a=>createHash('sha256').update(a.content).digest('hex')).join('')).digest('hex')};
}
