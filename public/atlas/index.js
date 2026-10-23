import {Box,Button,Card,RecordDetails,Field,FormGrid,Input,Link,Option,SearchField,Select,SplitView,Status,ToolHeader,ToolPanel,Toolbar,element,onDisconnect,updateStatus} from '../ui/index.js';
import {ATLAS_TOOLS} from './catalog.js';
import {mountTaskLifecycle} from '../capabilities/task-lifecycle.js';
import {notebookActions} from '../handoff/button.js';

const dataURL=kind=>new URL('../vendor/'+(['constellations','eclipses'].includes(kind)?'atlas-celestial/':'atlas-life-culture/'),import.meta.url);
const text=value=>typeof value==='string'?value:value==null?'未提供':JSON.stringify(value);
const namedSelect=(id,options)=>Select({id,children:options.map(([value,label])=>Option(label,value))});
const number=(id,placeholder)=>Input({id,type:'number',placeholder,attrs:{step:'1',min:'-1999',max:'3000'}});
const safeURL=value=>{try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}};
function download(value,name,type='application/json;charset=utf-8'){
 const url=URL.createObjectURL(new Blob([value],{type})),link=Link({attrs:{href:url,download:name}});link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function mountAtlas(main){
 const style=element('link');style.rel='stylesheet';style.href=new URL('./style.css',import.meta.url).href;document.head.append(style);
 const mounted=[];
 for(const tool of ATLAS_TOOLS){
  const id=tool.id,query=Input({id:id+'-query',type:'search',placeholder:tool.placeholder,attrs:{maxlength:'1000'}});
  const form=Box({tag:'form',className:'atlas-form'}),parameters=FormGrid({}),filters={};
  const add=(name,label,control)=>{filters[name]=control;parameters.append(Field({label,control}));};
  if(id==='eclipses'){
   add('filter','天象',namedSelect(id+'-filter',[['','日食与月食'],['solar','日食'],['lunar','月食']]));
   add('fromYear','起始天文年',number(id+'-fromYear','-1999'));
   add('toYear','结束天文年',number(id+'-toYear','3000'));
   add('saros','Saros 周期',Input({id:id+'-saros',type:'number',attrs:{step:'1'}}));
  }else if(id==='birds'){
   add('view','查询对象',namedSelect(id+'-view',[['records','分类名录'],['metadata','原表附表与说明']]));
   add('sheet','工作表',namedSelect(id+'-sheet',[['','全部工作表']]));
   for(const [name,label]of [['order','目'],['family','科'],['rank','分类层级']])add(name,label,namedSelect(id+'-'+name,[['','全部']]));
  }else if(id==='classical-music'){
   add('category','查询对象',namedSelect(id+'-category',[['works','作品'],['composers','作曲家']]));
   for(const [name,label]of [['composerId','作曲家'],['epoch','时期'],['genre','体裁']])add(name,label,namedSelect(id+'-'+name,[['','全部']]));
  }
  const run=Button({id:id+'-run',type:'submit',text:'查找',variant:'primary'}),stop=Button({id:id+'-stop',text:'停止',disabled:true});
  const message=Status({id:id+'-status',attrs:{'aria-live':'polite'}}),summary=Box({tag:'p',id:id+'-summary',attrs:{role:'status'}});
  form.append(SearchField({label:tool.title+'查找',control:query}),parameters,Toolbar({children:[run,stop]}),message);
  const index=Card({title:id==='constellations'?'88 星座图谱':id==='eclipses'?'年代索引':id==='birds'?'分类浏览':'作曲家与作品',className:'surface atlas-index'}),indexBody=Box({className:'atlas-index-body'});index.append(indexBody);
  const list=Box({id:id+'-results',className:'atlas-record-list'}),detail=Card({title:'当前记录',className:'surface atlas-detail'}),detailBody=Box({id:id+'-detail'}),resultActions=Toolbar({className:'atlas-result-actions'});
  const selectedDownload=Button({id:id+'-download',text:'下载当前记录',disabled:true}),copy=Button({id:id+'-copy',text:'复制当前记录',disabled:true});
  let lease=null,selected=null,meta=null,worker=null,timer=null,revision=0,page=0,total=0,lastResult=null,initialized=false,disposed=false;
  const notes=notebookActions({id:id+'-record',source:'text',snapshot:()=>lease});resultActions.append(...notes.buttons,copy,selectedDownload);
  detail.append(detailBody,resultActions);
  const previous=Button({id:id+'-prev',text:'上一页',disabled:true}),next=Button({id:id+'-next',text:'下一页',disabled:true}),pageLabel=Box({tag:'span',id:id+'-page',text:'—'});
  const results=Card({title:'查询结果',className:'surface atlas-results',children:[summary,list,Toolbar({children:[previous,pageLabel,next]})]});
  const datasetInfo=Box({tag:'details',id:id+'-dataset',children:[Box({tag:'summary',text:'资料版本与完整说明'})]}),datasetBody=Box({});datasetInfo.append(datasetBody);
  const panel=ToolPanel({id:'panel-'+id,className:'panel atlas-panel',hidden:true,header:ToolHeader({className:'page-heading',title:tool.title}),body:Box({className:'atlas-body',children:[Card({className:'surface',children:form}),index,SplitView({className:'atlas-panes',minPaneWidth:'22rem',children:[results,detail]}),datasetInfo]})});
  main.append(panel);mounted.push(panel);
  const updateButtons=()=>{run.disabled=Boolean(worker);stop.disabled=!worker;previous.disabled=Boolean(worker)||page<=0;next.disabled=Boolean(worker)||(page+1)*24>=total;notes.setEnabled(Boolean(lease));copy.disabled=selectedDownload.disabled=!lease;};
  function end(){worker?.terminate();worker=null;clearTimeout(timer);}
  function invalidate(note=''){
   revision++;end();lease=null;selected=null;lastResult=null;list.replaceChildren();detailBody.replaceChildren();summary.textContent='';pageLabel.textContent='—';total=0;updateStatus(message,note);updateButtons();
  }
  const lifecycle=mountTaskLifecycle(panel,{isBusy:()=>Boolean(worker),invalidate:()=>invalidate(),dispose(){disposed=true;revision++;end();}});
  function select(record){
   if(!record||!lastResult)return;selected=record;
   for(const button of list.querySelectorAll('[data-record]'))button.setAttribute('aria-pressed',String(button.dataset.record===String(record.id)));
   const snapshot={dataset:id,version:meta?.version||meta?.snapshot||meta?.created||'固定资料快照',snapshotDate:meta?.snapshotDate||null,recordId:record.id,title:record.title,fields:record.fields,raw:record.raw,source:meta?.source||meta?.sources||meta?.sourceUrl||meta?.url||null,citation:meta?.citation||null,credit:meta?.credit||null,license:meta?.license||(record.charts?.length?"图谱："+[...new Set(record.charts.map(chart=>chart.license).filter(Boolean))].join("；"):null)};
   const value=[record.title,...record.fields.map(([label,value])=>label+'：'+text(value)),'完整原始记录：',JSON.stringify(record.raw,null,2),'资料版本：'+snapshot.version,'快照日期：'+text(snapshot.snapshotDate),'来源：'+text(snapshot.source),...(snapshot.citation?['引用：'+snapshot.citation]:[]),...(snapshot.credit?['署名：'+snapshot.credit]:[]),...(snapshot.license?['许可：'+snapshot.license]:[])].join('\n');
   lease=Object.freeze({value:{text:value},revision,recordId:record.id});
   detailBody.replaceChildren(Box({tag:'h3',text:record.title}));
   for(const chart of record.charts|| (record.chart?[{path:record.chart,title:record.title}]:[])){
    const image=element('img');image.src=new URL(chart.path,dataURL(id)).href;image.alt=chart.title+'官方星座图谱';image.className='atlas-chart';image.loading='lazy';detailBody.append(image,Link({text:'打开原尺寸图谱 · '+chart.title,attrs:{href:image.src,target:'_blank',rel:'noopener noreferrer'}}));
    if(chart.credit)detailBody.append(Box({tag:'p',text:chart.credit+' · '+(chart.license||'')}));
   }
   const links=new Map();for(const [label,value]of record.fields){const url=safeURL(value);if(url)links.set(url,label);}
   for(const link of record.raw?.links||[]){const url=safeURL(link.url);if(url)links.set(url,link.title||link.text||'NASA 原始资料');}
   const values=items=>items.map(([label,value])=>[label,text(value)]);
   detailBody.append(RecordDetails({items:values(record.presentation?.primary||record.fields),supplementary:values(record.presentation?.additional||[]),original:values(record.fields),raw:record.raw,links:links.size?Toolbar({children:[...links].map(([href,label])=>Link({text:label,attrs:{href,target:'_blank',rel:'noopener noreferrer'}}))}):null}));
   if(id==='classical-music'&&record.composerId&&filters.category.value==='works')detailBody.append(Button({text:'查看这位作曲家的全部作品',on:{click:()=>{query.value='';filters.composerId.value=record.composerId;page=0;execute();}}}));
   selectedDownload.onclick=()=>{if(lease)download(JSON.stringify(snapshot,null,2),id+'-'+String(record.id).replace(/[^\w-]/g,'_')+'.json');};updateButtons();
  }
  function fillFacets(result){
   const facets=result.facets||{},keys={filter:'types',order:'orders',family:'families',rank:'ranks',sheet:'sheets',composerId:'composers',epoch:'epochs',genre:'genres'};
   for(const [name,key]of Object.entries(keys)){
    const control=filters[name],values=facets[key];if(!control||!values)continue;
    const before=control.value;control.replaceChildren(Option('全部',''),...values.map(item=>{const value=typeof item==='object'?item.value??item.id:item,label=typeof item==='object'?item.label??item.title??value:item;return Option(String(label),String(value));}));
    if([...control.options].some(option=>option.value===before))control.value=before;
   }
   if(id==='birds')for(const name of ['order','family','rank','sheet'])filters[name].closest('.ui-field')?.toggleAttribute('hidden',name==='sheet'?filters.view.value!=='metadata':filters.view.value==='metadata');
  }
  function drawIndex(result){
   if(id==='constellations'){
    const entries=result.facets?.index||[];indexBody.replaceChildren(...entries.map(item=>Button({text:item.title,attrs:{'data-atlas-index':item.id},on:{click:()=>{query.value=item.id;page=0;execute({recordId:item.id});}}})));return;
   }
   if(id==='eclipses'){
    indexBody.replaceChildren(Button({text:'全部年代',on:{click:()=>{filters.fromYear.value=filters.toYear.value='';page=0;execute();}}}),...Array.from({length:50},(_,offset)=>{const start=-1999+offset*100,end=start+99;return Button({text:start+' — '+end,attrs:{'data-century':start},on:{click:()=>{filters.fromYear.value=start;filters.toYear.value=end;page=0;execute();}}});}));return;
   }
   const facets=result.facets||{},name=id==='birds'?(filters.view.value==='metadata'?'sheet':'order'):'epoch',items=id==='birds'?(filters.view.value==='metadata'?facets.sheets:facets.orders):facets.epochs;
   indexBody.replaceChildren(...(items||[]).map(item=>{const value=typeof item==='object'?item.value??item.id:item,label=typeof item==='object'?item.label??item.title??value:item;return Button({text:String(label),on:{click:()=>{filters[name].value=value;page=0;execute();}}});}));
  }
  function render(result){
   lastResult=result;total=result.total;page=result.page||0;meta=result.meta||meta;initialized=true;fillFacets(result);drawIndex(result);
   summary.textContent=`共 ${total.toLocaleString('zh-CN')} 条；当前 ${total?page*24+1:0}–${Math.min(total,(page+1)*24)} 条。`;
   pageLabel.textContent=`${total?page+1:0} / ${Math.ceil(total/24)}`;
   datasetBody.replaceChildren(Box({tag:'p',text:result.note||''}),...(meta?.citation?[Box({tag:'p',text:meta.citation})]:[]),Box({tag:'pre',className:'atlas-raw',text:JSON.stringify(meta,null,2)}));
   if(id==='birds'&&!detail.querySelector('[data-workbook]'))resultActions.append(Link({text:'下载完整原始工作簿',attrs:{'data-workbook':'',href:new URL('AviList-v2025b-10Jun2026-extended.xlsx',dataURL(id)).href,download:''}}));
   list.replaceChildren(...result.items.map(record=>Button({className:'atlas-record',text:record.title,attrs:{'data-record':record.id,'aria-pressed':'false'},on:{click:()=>select(record)}})));
   if(result.items.length)select(result.items[0]);else detailBody.replaceChildren(Box({tag:'p',text:'没有符合条件的记录。'}));
   updateStatus(message,'查询完成','success');updateButtons();
  }
  function execute(extra={}){
   const targetPage=page;invalidate('正在读取本地资料…');page=targetPage;
   const current=revision,params={query:query.value.trim(),page,pageSize:24,...Object.fromEntries(Object.entries(filters).map(([key,control])=>[key,control.value])),...extra};
   const fail=error=>{if(current!==revision||disposed)return;end();updateStatus(message,error?.message||String(error),'error');updateButtons();};
   try{worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});const task=worker;timer=setTimeout(()=>fail(Error('查询超过 30 秒，请重试或缩小条件。')),30000);task.onmessage=({data})=>{if(current!==revision||task!==worker||disposed)return;end();if(data.error)fail(Error(data.error));else render(data.result);};task.onerror=event=>{event.preventDefault();fail(Error('资料组件启动失败，请重试。'));};task.postMessage({kind:id,params,resourceBase:new URL('../',import.meta.url).href});updateButtons();}catch(error){fail(error);}
  }
  form.addEventListener('submit',event=>{event.preventDefault();page=0;execute();});query.addEventListener('input',()=>{page=0;invalidate();});
  for(const control of Object.values(filters)){
   control.addEventListener('input',()=>{page=0;invalidate();});
   control.addEventListener('change',()=>{page=0;if(control.tagName==='SELECT')execute();});
  }
  stop.onclick=()=>invalidate('已停止，查询条件保留。');previous.onclick=()=>{page--;execute();};next.onclick=()=>{page++;execute();};
  copy.onclick=async()=>{const current=lease;if(!current)return;try{await navigator.clipboard.writeText(current.value.text);if(current===lease)updateStatus(message,'已复制当前记录。');}catch{if(current===lease)updateStatus(message,'复制失败，请下载记录。','error');}};
  const activate=({detail})=>{if(detail.name===id&&!initialized)lifecycle.whenActive(()=>execute());};document.addEventListener('arg:panelchange',activate);
  onDisconnect(panel,()=>{disposed=true;revision++;end();document.removeEventListener('arg:panelchange',activate);});updateButtons();
 }
 return{panels:mounted};
}
