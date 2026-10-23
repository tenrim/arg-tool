import {Box,Button,Card,DataList,Disclosure,Field,FormGrid,Input,Link,Option,Result,SearchField,Select,SplitView,Status,Table,Textarea,ToolHeader,ToolPanel,Toolbar,onDisconnect,setState,updateStatus} from '../ui/index.js';
import {notebookActions} from '../handoff/button.js';
import {mountTaskLifecycle} from '../capabilities/task-lifecycle.js';
import {CLDR_VERSION} from '../reference-locale/names.js';

export function mountTimezones(main){
 const prior=main.querySelector('#panel-timezones');if(prior)return prior;
 let selected='Asia/Shanghai',revision=0,searchRevision=0,page=0,total=0,lease=null,disposed=false;
 let searchJob=null,queryJob=null,searchTimer;
 const search=Input({id:'timezones-search',placeholder:'中文／英文城市、国家名称、时区标识或代码',attrs:{maxlength:200}}),list=Result({id:'timezones-list',layout:'collection'}),searchStatus=Status({id:'timezones-search-status'});
 const pageInfo=Box({tag:'span',id:'timezones-page',text:'—'}),previous=Button({text:'上一页',id:'timezones-prev',disabled:true,on:{click:()=>{page--;find();}}}),next=Button({text:'下一页',id:'timezones-next',disabled:true,on:{click:()=>{page++;find();}}});
 const current=Input({id:'timezones-zone',value:selected,attrs:{readonly:true}}),mode=Select({id:'timezones-mode',children:[Option('当地时间 → UTC','local'),Option('UTC → 当地时间','utc')]}),date=Input({id:'timezones-datetime',value:'2026-10-17 12:00:00',placeholder:'YYYY-MM-DD HH:mm:ss',attrs:{maxlength:19,spellcheck:false}});
 const status=Status({id:'timezones-status'}),summary=Status({id:'timezones-summary'}),details=Result({id:'timezones-result'}),source=Box({id:'timezones-sources'});
 const run=Button({id:'timezones-run',text:'查询时间',variant:'primary',on:{click:calculate}}),stop=Button({id:'timezones-stop',text:'停止',disabled:true,on:{click:()=>invalidate('已停止，输入保留。')}}),copy=Button({id:'timezones-copy',text:'复制结果',disabled:true,on:{click:copyResult}}),save=Button({id:'timezones-download',text:'下载结果',disabled:true,on:{click:downloadResult}});
 const records=notebookActions({id:'timezones',source:'text',snapshot:()=>panel.hidden?null:lease});
 const metadata=Status({id:'timezones-version',text:'打开工作区后读取本地时区目录。'});
 const parameters=FormGrid({children:[Field({label:'所选时区／别名',control:current,span:'full'}),Field({label:'查询方向',control:mode}),Field({label:'日期与时间',control:date})]});
 const panel=ToolPanel({id:'panel-timezones',className:'panel',hidden:true,header:ToolHeader({className:'page-heading',title:'历史时区资料'}),body:SplitView({minPaneWidth:'320px',children:[Card({title:'时区目录',children:[SearchField({label:'查找时区',control:search}),searchStatus,list,Toolbar({children:[previous,pageInfo,next]}),metadata]}),Card({title:'时区与日期',children:[parameters,Toolbar({children:[run,stop]}),status,summary,details,Toolbar({children:[copy,save,...records.buttons]}),source]})]})});
 main.append(panel);

 function controls(){const busy=!!queryJob;setState(run,{busy});run.disabled=busy;stop.disabled=!busy;copy.disabled=save.disabled=!lease;records.setEnabled(!!lease);}
 function kill(kind){const job=kind==='search'?searchJob:queryJob;if(job){clearTimeout(job.timer);job.worker.terminate();}if(kind==='search')searchJob=null;else queryJob=null;}
 function invalidate(message=''){revision++;kill('query');lease=null;details.replaceChildren();source.replaceChildren();updateStatus(summary,'');updateStatus(status,message);controls();}
 function request(type,values,done,fail){
  kill(type==='search'?'search':'query');let worker;try{worker=new Worker(new URL('./worker.js',import.meta.url));}catch{fail('本地时区组件无法启动，请确认浏览器支持后台运算后重试。');controls();return;}const job={worker,timer:null};
  const owner=type==='search'?'search':'query',version=owner==='search'?searchRevision:revision;
  if(owner==='search')searchJob=job;else queryJob=job;
  const valid=()=>!disposed&&(owner==='search'?searchJob===job&&version===searchRevision:queryJob===job&&version===revision);
  const error=text=>{if(!valid())return;kill(owner);fail(text);controls();};
  job.timer=setTimeout(()=>error('本地时区查询超过 30 秒，已停止。请重试。'),30000);
  worker.onerror=event=>{event.preventDefault();error('本地时区组件启动失败，请重试。');};worker.onmessageerror=()=>error('无法读取时区查询结果。');
  worker.onmessage=({data})=>{if(!valid()||data.id!==version)return;kill(owner);if(data.error)fail(data.error);else done(data.result);controls();};
  worker.postMessage({type,id:version,...values,resourceBase:new URL('../',import.meta.url).href});controls();
 }
 function find(){
  clearTimeout(searchTimer);searchRevision++;updateStatus(searchStatus,'正在查询本地目录…');previous.disabled=next.disabled=true;
  request('search',{query:search.value,page},result=>{
   total=result.total;page=result.page;list.replaceChildren();
   for(const entry of result.items){const label=entry.chineseName?entry.chineseName+' · '+entry.id.replaceAll('_',' '):entry.id.replaceAll('_',' '),subtitle=[entry.countryNames.join(' / '),entry.countries.join(' / '),entry.canonical!==entry.id?'别名 → '+entry.canonical:entry.comment||'IANA 时区'].filter(Boolean).join(' · ');
    list.append(Button({layout:'stacked',variant:'choice',attrs:{'data-timezone':entry.id,'aria-pressed':String(selected===entry.id)},children:[Box({tag:'strong',text:label}),Box({tag:'span',text:subtitle})],on:{click:()=>{if(selected!==entry.id){selected=entry.id;current.value=selected;invalidate();}for(const button of list.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.timezone===selected));date.focus();}}}));
   }
   pageInfo.textContent=`${total?page+1:0} / ${Math.ceil(total/24)} 页`;previous.disabled=page<=0;next.disabled=(page+1)*24>=total;
   updateStatus(searchStatus,`找到 ${total} 个名称，当前显示 ${result.items.length} 个。`);updateStatus(metadata,`IANA ${result.version} · ${result.zoneCount} 个完整默认编译名称（含别名）。中文城市及国家／地区名称取自本地 Unicode CLDR ${CLDR_VERSION}；未收录名称和历史规则说明保留原文。`);
  },message=>{list.replaceChildren();pageInfo.textContent='—';updateStatus(searchStatus,message,'error');});
 }
 function calculate(){
  invalidate('正在本地查询时区规则…');const token=revision;
  request('query',{zone:selected,mode:mode.value,dateTime:date.value},result=>{
   if(token!==revision)return;const labels={unique:'唯一时间',ambiguous:'重复时间：存在多个 UTC 候选',nonexistent:'不存在的当地时间'};updateStatus(summary,labels[result.status],result.status==='nonexistent'?'error':result.status==='ambiguous'?'warning':'success');
   details.replaceChildren(DataList({items:[['时区',result.entry.id],['中文城市／名称',result.entry.chineseName||'CLDR 未提供，保留原标识'],['中文别名',result.entry.chineseAliases.join('、')||'—'],['规范目标',result.entry.canonical],['国家／地区',result.entry.countryNames.join(' / ')||'—'],['国家／地区代码',result.entry.countries.join(' / ')||'—'],['目录坐标',result.entry.coordinates||'—'],['资料版本','IANA '+result.version+' / CLDR '+result.entry.localeVersion],['输入',result.input+(result.mode==='utc'?' UTC':' 当地时间')]]}));
   for(const [i,candidate]of result.candidates.entries())details.append(Card({title:result.candidates.length>1?'候选 '+(i+1):'对应时间',children:DataList({items:[['UTC',candidate.utcText],['当地时间',candidate.localText],['UTC 偏移',candidate.offsetText],['缩写',candidate.abbreviation],['TZDB DST 标志',candidate.dst?'是':'否'],['Unix 秒',String(candidate.utc)],['规则类型',candidate.projected?'按本版 POSIX 尾规则计算':'已登记历史转换记录']]})}));
   if(result.gap)details.append(DataList({items:[['不存在的当地时间段',result.gap.start+' ≤ 时间 < '+result.gap.end],['时钟前跳',result.gap.seconds+' 秒']]}));
   if(result.nearbyTransitions.length)details.append(Disclosure({children:[Box({tag:'summary',text:'前后年份的时区转换'}),Table({columns:['UTC 转换时刻','转换前','转换后','当地时钟跳变'],rows:result.nearbyTransitions.map(t=>[t.utcText,t.before,t.after,t.localBefore+' → '+t.localAfter])})]}));
   const recordText=items=>items.map(item=>`${item.file}:${item.line}  ${item.text}`).join('\n');
   for(const [title,items]of [['实际计算口径的 Zone / Rule / Link 原文',result.source.active],['可选 backzone 史料（未参与计算）',result.source.optional]])if(items.length)source.append(Disclosure({children:[Box({tag:'summary',text:title}),Textarea({value:recordText(items),autoSize:true,minRows:4,maxRows:18,attrs:{readonly:true,'aria-label':title,spellcheck:false}})]}));
   source.append(Disclosure({children:[Box({tag:'summary',text:'完整原始表与规则文件'}),Toolbar({children:['zone.tab','zone1970.tab','backward','backzone','africa','antarctica','asia','australasia','europe','northamerica','southamerica','etcetera','iso3166.tab'].map(name=>Link({text:name,attrs:{href:new URL('../vendor/timezones/source/'+name+'.txt',import.meta.url).href,target:'_blank',rel:'noopener noreferrer'}}))})]}));
   const lines=['历史时区资料',`IANA ${result.version} / ${result.entry.id}`,`中文名称：${result.entry.chineseName||'未收录'}；${result.entry.countryNames.join(' / ')}`,`中文名称来源：Unicode CLDR ${result.entry.localeVersion}`,`规范目标：${result.entry.canonical}`,`输入：${result.input} ${result.mode==='utc'?'UTC':'当地时间'}`,labels[result.status],...result.candidates.map((c,i)=>`候选 ${i+1}：UTC ${c.utcText}；当地 ${c.localText}；${c.offsetText}；${c.abbreviation}；DST=${c.dst}`)];
   if(result.gap)lines.push(`不存在区间：${result.gap.start} ≤ 时间 < ${result.gap.end}；前跳 ${result.gap.seconds} 秒`);
   if(result.pre1970)lines.push('1970 年前历史不保证全球完整；采用上游默认编译口径，未启用 optional backzone。');
   lines.push('按此固定版本推算；未来法律政策可能变化。POSIX 时间不计闰秒。','来源：https://www.iana.org/time-zones');lease={value:{text:lines.join('\n')}};
   updateStatus(status,result.pre1970?'查询完成。1970 年前记录覆盖有限，请结合原始规则核对。':'查询完成；时差与 DST 来自固定本地 TZDB。','success');controls();
  },message=>{updateStatus(status,message,'error');});
 }
 async function copyResult(){const captured=lease;if(!captured)return;try{await navigator.clipboard.writeText(captured.value.text);if(lease===captured)updateStatus(status,'已复制结果。','success');}catch{if(lease===captured)updateStatus(status,'无法自动复制，请下载文本。','error');}}
 function downloadResult(){if(!lease)return;const url=URL.createObjectURL(new Blob([lease.value.text],{type:'text/plain;charset=utf-8'}));try{Link({attrs:{href:url,download:'迷雾工具箱-历史时区.txt'}}).click();}finally{setTimeout(()=>URL.revokeObjectURL(url),1000);}}
 search.addEventListener('input',()=>{searchRevision++;kill('search');page=0;clearTimeout(searchTimer);searchTimer=setTimeout(find,140);});
 parameters.addEventListener('input',()=>invalidate());parameters.addEventListener('change',()=>invalidate());
 panel.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'&&!queryJob){event.preventDefault();calculate();}});
 const lifecycle=mountTaskLifecycle(panel,{isBusy:()=>!!queryJob||!!searchJob,invalidate:()=>{clearTimeout(searchTimer);searchRevision++;kill('search');invalidate();},dispose:()=>{disposed=true;revision++;searchRevision++;clearTimeout(searchTimer);kill('search');kill('query');}});
 const onPanel=event=>{if(event.detail?.name==='timezones'&&!list.childElementCount&&!searchJob)find();};document.addEventListener('arg:panelchange',onPanel);
 onDisconnect(panel,()=>{disposed=true;lease=null;document.removeEventListener('arg:panelchange',onPanel);});
 controls();lifecycle.whenActive(find);return panel;
}
