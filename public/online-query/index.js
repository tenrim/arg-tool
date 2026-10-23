import {Box,Button,Card,EmptyState,Field,Input,Link,Notice,Result,SplitView,Status,ToolHeader,ToolPanel,Toolbar,element,onDisconnect,updateStatus} from '../ui/index.js';
import {mountTaskLifecycle} from '../capabilities/task-lifecycle.js';
import {notebookActions} from '../handoff/button.js';
import {MAX_RESPONSE_BYTES,OEIS_ATTRIBUTION,notebookRecord,officialQueryURL,pageSnapshot,parseQueryResponse,queryParameters,recordSnapshot,sequenceID,sequenceURL} from './model.js';
import {mountExternalQueries} from './external.js';
import {onlineReading} from './reading.js';
import {readingSections} from './reading-view.js';

const endpoint=new URL('../api/query/oeis',import.meta.url);
function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json;charset=utf-8'})),link=Link({attrs:{href:url,download:name}});link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function readBounded(response){
 const length=Number(response.headers.get('content-length'));if(length>MAX_RESPONSE_BYTES)throw Error('查询结果超过 2 MiB 限额，请缩小条件或前往 OEIS。');
 if(!response.body)return response.text();
 const reader=response.body.getReader(),decoder=new TextDecoder();let bytes=0,text='';
 try{for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>MAX_RESPONSE_BYTES){await reader.cancel();throw Error('查询结果超过 2 MiB 限额，请缩小条件或前往 OEIS。');}text+=decoder.decode(value,{stream:true});}return text+decoder.decode();}finally{reader.releaseLock();}
}
export function mountOnlineQuery(main){
 const style=element('link');style.rel='stylesheet';style.href=new URL('./style.css',import.meta.url).href;document.head.append(style);
 const input=Input({id:'oeis-query',type:'search',placeholder:'输入数列、关键词或 A 编号',attrs:{maxlength:'500',autocomplete:'off'}}),run=Button({id:'oeis-run',type:'submit',text:'查询 OEIS',variant:'primary'}),stop=Button({id:'oeis-stop',text:'停止',disabled:true});
 const status=Status({id:'oeis-status',text:'尚未联网查询。'}),fallback=Link({id:'oeis-original-query',text:'前往 OEIS 原站查询',attrs:{href:'https://oeis.org/',target:'_blank',rel:'noopener noreferrer'}});
 const notice=Notice({id:'oeis-online-notice',text:'在线查询：点击查询后，本次输入会经本站服务器发送到 OEIS；需要联网，本站不保存查询内容。'});
 const form=Box({tag:'form',className:'online-query-form',children:[notice,Field({label:'数列、关键词或 A 编号',control:input}),Toolbar({children:[run,stop,fallback]}),status]});
 const summary=Box({tag:'p',id:'oeis-summary'}),records=Result({id:'oeis-records',layout:'collection',className:'online-query-records'}),previous=Button({id:'oeis-prev',text:'上一页',disabled:true}),next=Button({id:'oeis-next',text:'下一页',disabled:true}),pageNumber=Box({tag:'span',id:'oeis-page',text:'尚未查询'});
 const copyPage=Button({id:'oeis-copy-page',text:'复制本页完整结果',disabled:true}),downloadPage=Button({id:'oeis-download-page',text:'下载本页完整结果',disabled:true});
 const listing=Card({title:'匹配数列',className:'surface online-query-results',children:[summary,records,Toolbar({children:[previous,pageNumber,next]}),Toolbar({className:'online-query-actions',children:[copyPage,downloadPage]})]});
 const detail=Box({id:'oeis-detail'}),copyRecord=Button({id:'oeis-copy',text:'复制当前记录',disabled:true}),downloadRecord=Button({id:'oeis-download',text:'下载当前记录',disabled:true});
 let lease=null,page=null,selected=null,controller=null,timer=null,revision=0,disposed=false;
 const notes=notebookActions({id:'oeis-record',source:'text',snapshot:()=>lease});
 const detailCard=Card({className:'surface online-query-detail',children:[detail,Toolbar({className:'online-query-actions',children:[...notes.buttons,copyRecord,downloadRecord]})]});
 const body=Box({className:'online-query-body',children:[Card({className:'surface',children:form}),SplitView({className:'online-query-panes',minPaneWidth:'24rem',children:[listing,detailCard]})]});
 const panel=ToolPanel({id:'panel-oeis',className:'panel',hidden:true,header:ToolHeader({className:'page-heading',title:'OEIS 数列在线查询'}),body});main.append(panel);
 function buttons(){const busy=Boolean(controller);run.disabled=busy;stop.disabled=!busy;previous.disabled=busy||!page||page.start===0;next.disabled=busy||page?.nextStart==null;copyPage.disabled=downloadPage.disabled=!page;copyRecord.disabled=downloadRecord.disabled=!lease;notes.setEnabled(Boolean(lease));panel.setAttribute('aria-busy',String(busy));}
 function clear(message){revision++;clearTimeout(timer);timer=null;controller?.abort();controller=null;lease=null;page=null;selected=null;records.replaceChildren(EmptyState({text:'尚未查询。'}));detail.replaceChildren(EmptyState({text:'选择查询结果后在这里查看完整记录。'}));summary.textContent='';pageNumber.textContent='尚未查询';updateStatus(status,message);buttons();}
 const lifecycle=mountTaskLifecycle(panel,{isBusy:()=>Boolean(controller||page||lease),invalidate:()=>{if(controller||page||lease)clear('');},dispose(){disposed=true;revision++;clearTimeout(timer);timer=null;controller?.abort();controller=null;lease=null;}});
 function select(record){
  if(!page||!page.records.includes(record))return;selected=record;lease=Object.freeze({value:Object.freeze(notebookRecord(page,record)),revision,recordId:sequenceID(record)});
  for(const button of records.querySelectorAll('[data-oeis-record]'))button.setAttribute('aria-pressed',String(button.dataset.oeisRecord===sequenceID(record)));
  const current=page,reading=onlineReading('oeis',record,current);
  detail.replaceChildren(Box({tag:'h3',text:reading.title}),Toolbar({children:[Link({text:'查看 '+sequenceID(record)+' 原文与完整资料',attrs:{href:sequenceURL(record),target:'_blank',rel:'noopener noreferrer'}})]}),readingSections(reading),Box({tag:'p',text:OEIS_ATTRIBUTION.license+' · '+OEIS_ATTRIBUTION.credit}));buttons();
 }
 async function execute(start=0){
  let parameters;try{parameters=queryParameters(input.value,start);}catch(error){clear(error.message);updateStatus(status,error.message,'error');return;}
  clear('正在通过本站服务器查询 OEIS…');const current=revision,request=new AbortController();controller=request;buttons();
  const timeout=setTimeout(()=>{if(current===revision&&controller===request){clear('查询超时，请手动重试或前往 OEIS。');updateStatus(status,'查询超时，请手动重试或前往 OEIS。','error');}},30000);timer=timeout;
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(parameters),signal:request.signal,credentials:'same-origin',cache:'no-store',redirect:'error'});
   const text=await readBounded(response);if(current!==revision||disposed||controller!==request||panel.hidden)return;
   if(!response.ok){let failure;try{failure=JSON.parse(text);}catch{}const retry=response.headers.get('retry-after'),message=typeof failure?.message==='string'?failure.message:([404,405,502,503].includes(response.status)?'本站在线查询服务不可用。静态托管需要启用后端查询模块，可前往 OEIS 查询。':'在线查询失败，请稍后手动重试。');throw Error(message+(retry?' 请在 '+retry+' 秒后重试。':''));}
   const result=parseQueryResponse(text,parameters);controller=null;page=result;summary.textContent=`本页 ${result.records.length} 条${result.total===null?'；OEIS 未提供匹配总数。':'；共 '+result.total+' 条。'}`;pageNumber.textContent='第 '+(result.start/10+1)+' 页';
   records.replaceChildren(...result.records.map(record=>Button({layout:'stacked',attrs:{'data-oeis-record':sequenceID(record),'aria-pressed':'false'},children:[Box({tag:'strong',text:sequenceID(record)+' · '+String(record.name||'未提供名称')}),Box({tag:'span',text:String(record.data||'未提供数列项')})],on:{click:()=>select(record)}})));
   if(result.records.length)select(result.records[0]);else{records.append(EmptyState({text:'没有找到匹配数列，请修改查询条件。'}));detail.replaceChildren(EmptyState({text:'没有匹配记录。'}));}updateStatus(status,'查询完成，资料来自 OEIS 在线服务。','success');buttons();
  }catch(error){if(current!==revision||disposed||controller!==request)return;const message=error instanceof TypeError?'无法连接本站在线查询服务，请检查联网状态或前往 OEIS。':error?.message||'无法连接本站在线查询服务，请重试或前往 OEIS。';clear(message);updateStatus(status,message,'error');}finally{clearTimeout(timeout);if(timer===timeout)timer=null;}
 }
 const inputChanged=()=>{fallback.href=officialQueryURL(input.value.trim());clear('');};
 const submit=event=>{event.preventDefault();execute();};form.addEventListener('submit',submit);input.addEventListener('input',inputChanged);
 stop.onclick=()=>clear('已停止查询，输入保留。');previous.onclick=()=>{if(page)execute(page.start-10);};next.onclick=()=>{if(page?.nextStart!=null)execute(page.nextStart);};
 async function copy(value,isCurrent){try{await navigator.clipboard.writeText(JSON.stringify(value,null,2));if(isCurrent())updateStatus(status,'已复制完整记录。','success');}catch{if(isCurrent())updateStatus(status,'复制失败，请下载完整记录。','error');}}
 copyPage.onclick=()=>{const current=page;if(current)copy(pageSnapshot(current),()=>current===page);};downloadPage.onclick=()=>{if(page)download(pageSnapshot(page),'oeis-page-'+(page.start/10+1)+'.json');};
 copyRecord.onclick=()=>{const current=lease;if(current)copy(recordSnapshot(page,selected),()=>current===lease);};downloadRecord.onclick=()=>{if(page&&selected&&lease)download(recordSnapshot(page,selected),'oeis-'+sequenceID(selected)+'.json');};
 onDisconnect(panel,()=>{disposed=true;revision++;clearTimeout(timer);timer=null;controller?.abort();controller=null;lease=null;notes.setEnabled(false);form.removeEventListener('submit',submit);input.removeEventListener('input',inputChanged);lifecycle.destroy();style.remove();});
 clear('尚未联网查询。');return{panels:[panel,...mountExternalQueries(main)]};
}
