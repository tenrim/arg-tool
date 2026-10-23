import {feedbackEndpoint} from '../deployment.js';
import {Button,Box,Dialog,dialogController,Toolbar,Field,Input,Textarea,Select,Option,Status,updateStatus,setTextareaValue,setState,onDisconnect} from '../ui/index.js';
import {diagnostics,captureFailure,rememberAction,reportText} from './model.js';

const MAX_ATTACHMENTS=4*1024*1024;
export function mountFeedback({getTask}) {
  const endpoint=feedbackEndpoint?new URL(feedbackEndpoint,new URL('../',import.meta.url)):null;
  if(endpoint&&(endpoint.origin!==location.origin||!['http:','https:'].includes(endpoint.protocol)))throw Error('反馈服务必须使用同源地址。');
  const open=Button({id:'report-problem',text:'报告问题'});
  (document.querySelector('.rail-site-links')||document.querySelector('.site-footer')).append(open);
  const close=Button({text:'关闭'}),type=Select({children:['无法运行','结果异常','显示问题','其他'].map(value=>Option(value))});
  const description=Textarea({id:'report-description',autoSize:true,attrs:{maxlength:3000}}),expected=Textarea({autoSize:true,minRows:2,attrs:{maxlength:1500}}),steps=Textarea({autoSize:true,minRows:2,attrs:{maxlength:3000}}),contact=Input({attrs:{maxlength:160},placeholder:'选填，便于联系你补充信息'});
  const attachment=Input({id:'report-files',type:'file',attrs:{multiple:true}}),attachmentInfo=Box({tag:'p'});
  const preview=Textarea({id:'report-preview',autoSize:true,maxRows:8,attrs:{readonly:true,'aria-label':'即将发送的报告预览'}});
  const details=Box({tag:'details',children:[Box({tag:'summary',text:'查看报告与诊断信息'}),preview]});
  const send=Button({id:'report-send',text:'发送报告',variant:'primary'}),copy=Button({text:'复制报告'}),save=Button({text:'下载报告'}),status=Status({id:'report-status'});
  const dialog=Dialog({id:'report-dialog',className:'ui-flow-dialog',attrs:{'aria-labelledby':'report-title'},children:[Toolbar({children:[Box({tag:'h2',id:'report-title',text:'报告问题'}),close]}),Field({label:'问题类型',control:type}),Field({label:'发生了什么？',control:description}),Field({label:'原本期望什么？（选填）',control:expected}),Field({label:'如何复现？（选填）',control:steps}),Field({label:'联系方式（选填）',control:contact}),...(endpoint?[Field({label:'截图或示例文件（选填，最多 2 个，合计 4 MB）',control:attachment}),attachmentInfo]:[]),Box({tag:'p',text:endpoint?'报告和你主动选择的附件将发送到部署者配置的反馈服务。':'报告只保留在本机，可复制或下载后自行分享。'}),details,Toolbar({children:endpoint?[send,copy,save]:[copy,save]}),status]});
  document.body.append(dialog);const modal=dialogController(dialog,{trigger:open,closeButton:close,initialFocus:description});
  let id=crypto.randomUUID(),context=null,files=[],fileRevision=0,busy=false,submitted=false,attempted=false;
  const report=()=>({schema:1,id,type:type.value,description:description.value,expected:expected.value,steps:steps.value,contact:contact.value,diagnostics:context,attachments:files});
  function refresh(){setTextareaValue(preview,reportText(report()),{feedback:false});}
  function show(statusId=''){
    if(!busy&&!attempted)context=diagnostics({task:getTask()?.id,status:statusId,width:innerWidth,height:innerHeight,userAgent:navigator.userAgent});refresh();modal.open();
  }
  open.onclick=()=>show();
  function edited(){id=crypto.randomUUID();submitted=false;attempted=false;refresh();}
  for(const field of [type,description,expected,steps,contact])field.addEventListener('input',edited);
  attachment.addEventListener('change',async()=>{
    const rev=++fileRevision;files=[];const selected=[...attachment.files];attachmentInfo.textContent='正在准备附件…';send.disabled=true;
    try{if(selected.length>2||selected.reduce((n,f)=>n+f.size,0)>MAX_ATTACHMENTS)throw Error('附件最多 2 个，合计不能超过 4 MB。');
      const prepared=[];for(const file of selected){const bytes=new Uint8Array(await file.arrayBuffer());if(rev!==fileRevision)return;let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));prepared.push({name:file.name,type:file.type,data:btoa(binary)});}
      files=prepared;attachmentInfo.textContent=selected.map(f=>`${f.name} · ${f.size.toLocaleString()} 字节`).join('；');edited();updateStatus(status,'');
    }catch(error){if(rev===fileRevision){attachment.value='';attachmentInfo.textContent='';updateStatus(status,error.message,'error');}}
    finally{if(rev===fileRevision)send.disabled=busy;}
  });
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(reportText(report()));updateStatus(status,'报告已复制，可粘贴到群里。','success');}catch{details.open=true;preview.select();updateStatus(status,'请手动复制选中的报告。');}};
  save.onclick=()=>{const url=URL.createObjectURL(new Blob([reportText(report())],{type:'text/plain;charset=utf-8'}));const link=Box({tag:'a',attrs:{href:url,download:'迷雾工具箱-问题报告.txt'}});link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  send.onclick=async()=>{
    if(!endpoint||busy)return;if(description.value.trim().length<5){updateStatus(status,'请至少用 5 个字描述发生的问题。','error');description.focus();return;}
    if(submitted){updateStatus(status,'这份报告已经发送；修改内容后可以发送新报告。');return;}
    busy=true;attempted=true;setState(send,{busy:true});send.disabled=true;for(const field of [type,description,expected,steps,contact,attachment])field.disabled=true;
    updateStatus(status,'正在发送报告…');
    try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report()),signal:AbortSignal.timeout(30000),credentials:'same-origin'});
      let result;try{result=await response.json();}catch{throw Error('邮件反馈服务尚未配置或暂时不可用。可先复制或下载报告。');}
      if(!response.ok||result.id!==id||result.accepted!==true)throw Error(result.message||'发送失败，请保留报告后重试。');
      submitted=true;updateStatus(status,`邮件服务器已接收报告，编号：${result.id}。`,'success');
    }catch(error){updateStatus(status,error.name==='TimeoutError'?'发送结果暂未确认。保留当前报告重试，或复制后联系维护者。':error.message,'error');}
    finally{busy=false;setState(send,{busy:false});send.disabled=false;for(const field of [type,description,expected,steps,contact,attachment])field.disabled=false;}
  };
  const errorButtons=new Map(),dirtyStatuses=new Set();let queued=false;
  const statusSelector='[data-ui="status"],.status,#image-status';
  const errorSelector='.panel [data-ui="status"][data-state="error"],.panel .status.error,#image-status.error';
  function scanErrors(){queued=false;
    for(const [node,button]of errorButtons)if(!node.isConnected||!node.matches(errorSelector)||!node.textContent.trim()){button.remove();errorButtons.delete(node);}
    for(const node of dirtyStatuses){
      if(!node.isConnected||!node.matches(errorSelector))continue;
      if(errorButtons.has(node)||!node.textContent.trim())continue;
      const button=Button({text:'报告此问题',attrs:{'data-report-error':node.id||'tool-status'},on:{click:()=>show(node.id)}});node.after(button);errorButtons.set(node,button);
    }
    dirtyStatuses.clear();
  }
  const main=document.getElementById('main');
  for(const node of main.querySelectorAll(statusSelector))dirtyStatuses.add(node);scanErrors();
  // Animation refs change classes and add control nodes while a page enters.
  // Inspect changed statuses/subtrees only, never rescan every hidden workspace
  // for unrelated hover, layout or animation mutations.
  const observer=new MutationObserver(records=>{
    let removed=false;
    for(const record of records){
      const target=record.target.nodeType===1?record.target:record.target.parentElement;
      const status=target?.closest(statusSelector);if(status)dirtyStatuses.add(status);
      if(errorButtons.has(target))dirtyStatuses.add(target);
      if(record.type!=='childList')continue;
      removed ||= record.removedNodes.length>0;
      for(const node of record.addedNodes)if(node.nodeType===1){
        if(node.matches(statusSelector))dirtyStatuses.add(node);
        for(const status of node.querySelectorAll(statusSelector))dirtyStatuses.add(status);
      }
    }
    if(!queued&&(dirtyStatuses.size||removed&&errorButtons.size)){queued=true;queueMicrotask(scanErrors);}
  });observer.observe(main,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-state']});
  const failed=event=>captureFailure(event.error||event.reason),changed=event=>rememberAction('task',event.detail?.capabilityId||event.detail?.name);
  const clicked=event=>{const b=event.target.closest('button');if(b?.id&&b.closest('.panel'))rememberAction('action',b.id);};
  window.addEventListener('error',failed);window.addEventListener('unhandledrejection',failed);document.addEventListener('arg:panelchange',changed);document.addEventListener('click',clicked);
  onDisconnect(dialog,()=>{observer.disconnect();fileRevision++;files=[];window.removeEventListener('error',failed);window.removeEventListener('unhandledrejection',failed);document.removeEventListener('arg:panelchange',changed);document.removeEventListener('click',clicked);for(const b of errorButtons.values())b.remove();modal.destroy();open.remove();});
  return {show};
}
