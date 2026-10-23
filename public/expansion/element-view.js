import {ConversionWorkbench,Button,Toolbar,Table} from '../ui/index.js';
import {ENGLISH_DATASETS} from './hunt-data.js';
import {panel,parameter} from './view-common.js';
import {taskSession,startWorkerJob,saveFile} from './session.js';

export function mountElements(host){
 const id='element-spelling';
 const mode=parameter(id+'-mode','任务','elements','select',[['elements','拆分文字'],['element-words','筛选元素单词']]);
 const dictionary=parameter(id+'-dictionary','完整词库','standard','select',ENGLISH_DATASETS);
 const caseSensitive=parameter(id+'-case','大小写','no','select',[['no','忽略大小写'],['yes','严格匹配元素符号大小写']]);
 const min=parameter(id+'-min','最短词长',1,'number'),max=parameter(id+'-max','最长词长',40,'number');
 // Exact combinatorial offsets can exceed Number.MAX_SAFE_INTEGER.
 const offset=parameter(id+'-offset','起点偏移（从 0 开始）','0');
 offset.node.inputMode='numeric';offset.node.setAttribute('pattern','[0-9]+');
 const limit=parameter(id+'-limit','每页拆分数（1–200）',50,'number');
 limit.node.min='1';limit.node.max='200';limit.node.step='1';
 const view=ConversionWorkbench({id,settings:[mode.field,dictionary.field,caseSensitive.field,min.field,max.field,offset.field,limit.field],inputLabel:'文字（拆分）／自定义词表（筛词，可留空）'});
 view.input.maxLength=8*1024*1024;
 const p=panel(host,id,'元素符号拼词',view.root);
 let current=null,wordPageOffset=0;
 const session=taskSession(view,{id,
  options:()=>({dictionary:dictionary.node.value,caseSensitive:caseSensitive.node.value==='yes',mode:mode.node.value,min:+min.node.value,max:+max.node.value,offset:offset.node.value,limit:Number(limit.node.value)}),
  onInvalidate:()=>{current=null;wordPageOffset=0;},
  execute:async(input,options,hooks)=>{
   const result=await startWorkerJob({task:options.mode,input,options},hooks);
   const first=BigInt(result.offset||'0')+1n,last=BigInt(result.offset||'0')+BigInt(result.rows.length);
   const body=options.mode==='elements'
    ?result.rows.map(r=>`${r.rank}\t${r.symbols.join(' ')}\t${r.numbers.join(' ')}\t${r.names.join(' ')}`).join('\n')
    :result.rows.map(r=>`${r.word}\t${r.count}\t${r.first.symbols.join(' ')}`).join('\n');
   const range=result.rows.length?`第 ${first}–${last} 项`:'无可用拆分';
   const output=options.mode==='elements'?`总拆分数：${result.total}\n本页：${range}；偏移 ${result.offset}；每页 ${result.limit}\n排列序号\t元素符号\t原子序数\t中文名\n${body}`:body;
   return {...result,output,value:{text:output},config:options,status:options.mode==='elements'?`共 ${result.total} 种拆分；当前${range}。`:`完整词库筛选完成：${result.rows.length} 项；文本、笔记与下载保留全部结果。`};
  },
  render:result=>{current=result;wordPageOffset=0;renderRows();},
  save:result=>saveFile(JSON.stringify(result,null,2),result.config.mode==='elements'?`元素符号拼词-偏移${result.offset}-每页${result.limit}.json`:'元素单词-全部匹配.json','application/json'),
 });
 function renderRows(){
  if(!current)return;
  view.details.replaceChildren();
  const isElements=current.config.mode==='elements';
  const data=isElements?current.rows:current.rows.slice(wordPageOffset,wordPageOffset+50);
  view.details.append(Table({caption:isElements?'元素拆分（用精确偏移浏览任意候选页）':'全部匹配词语（表格分页；文本、笔记与下载均包含全部结果）',columns:isElements?['排列序号','符号','原子序数','中文名']:['单词','拆分数','一种拆分'],rows:data.map(r=>r.word?[r.word,r.count,r.first.symbols.join(' ')]:[r.rank,r.symbols.join(' '),r.numbers.join(' '),r.names.join(' ')])}));
  const previous=Button({id:id+'-previous',text:'上一页',disabled:isElements?BigInt(current.offset)===0n:wordPageOffset===0});
  const next=Button({id:id+'-next',text:'下一页',disabled:isElements?!current.hasNext:wordPageOffset+50>=current.rows.length});
  previous.onclick=()=>turn(-1);next.onclick=()=>turn(1);
  view.details.append(Toolbar({children:[previous,next]}));
 }
 function turn(direction){
  if(!current)return;
  if(current.config.mode==='element-words'){
   // Only the table projection changes. Output and the result lease contain
   // every matching word and remain identical to the notebook/export snapshot.
   wordPageOffset=Math.max(0,wordPageOffset+direction*50);renderRows();return;
  }
  const requested=BigInt(current.offset)+BigInt(direction)*BigInt(current.limit);
  offset.node.value=(requested<0n?0n:requested).toString();
  // Revoke the old page synchronously, then let the same owner execute and
  // publish the new page to the UI, copy/download, and notebook together.
  offset.node.dispatchEvent(new Event('input',{bubbles:true}));
  void session.run();
 }
 view.input.addEventListener('input',()=>{offset.node.value='0';});
 const sync=()=>{
  const isElements=mode.node.value==='elements';
  dictionary.field.hidden=min.field.hidden=max.field.hidden=isElements;
  offset.field.hidden=limit.field.hidden=!isElements;
  offset.node.value='0';
 };
 mode.node.addEventListener('change',sync);sync();
 return {panels:[p],sessions:{[id]:session}};
}
