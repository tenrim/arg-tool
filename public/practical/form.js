import {Box,Button,Card,DataList,EmptyState,Link,SplitView,Status,ToolHeader,ToolPanel,Toolbar,onDisconnect,setState,updateStatus} from '../ui/index.js';
import {PRACTICAL_TASKS} from './catalog.js';
import {resultRecording} from '../result-recording.js';
import {textRows} from './view-helpers.js';
export function workspace(main,id,formChildren,execute,{label='计算',cancel=()=>{}}={}){
 const meta=PRACTICAL_TASKS.find(t=>t.id===id),status=Status({id:id+'-status',hidden:true}),content=Box({id:id+'-result',attrs:{'aria-live':id==='countdown'?'off':'polite'}}),raw=Box({tag:'pre',id:id+'-text',hidden:true});
 const copy=Button({id:id+'-copy',text:'复制结果',disabled:true,on:{click:()=>navigator.clipboard.writeText(current).catch(()=>message('复制失败，请手动选择结果。','error'))}});
 const save=Button({text:'下载结果',disabled:true,on:{click:()=>{const url=URL.createObjectURL(new Blob([current],{type:'text/plain;charset=utf-8'}));Link({attrs:{href:url,download:meta.title+'.txt'}}).click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}});
 const run=Button({id:id+'-run',text:label,variant:'primary',on:{click:()=>calculate()}}),stop=Button({id:id+'-stop',text:'停止',hidden:true,on:{click:()=>invalidate('已停止。')}});
 const resultActions=Toolbar({children:[copy,save]});
 const form=Card({title:'计算条件',children:[...formChildren,Toolbar({children:[run,stop]}),status]}),result=Card({title:'结果',children:[content,raw,resultActions]});
 const panel=ToolPanel({id:'panel-'+id,className:'panel',hidden:true,header:ToolHeader({className:'page-heading',title:meta.title}),body:SplitView({className:'practical-layout',minPaneWidth:'22rem',children:[form,result]})});main.append(panel);
 let revision=0,current='',busy=false,disposed=false,tick=null;
 const recording=resultRecording({id:id+'-record',panel,anchor:content,onLeave:()=>invalidate()});result.append(recording.toolbar);
 function message(text='',tone){updateStatus(status,text,tone);status.hidden=!text;}
 function state(){setState(run,{disabled:busy,busy});stop.hidden=!busy&&!tick;copy.disabled=save.disabled=!current;resultActions.hidden=recording.toolbar.hidden=!current;}
 function empty(){content.replaceChildren(EmptyState({text:'填写条件后，点击“'+label+'”查看结果。',size:'compact'}));}
 function invalidate(text=''){revision++;cancel();clearInterval(tick);tick=null;busy=false;current='';recording.clear();empty();raw.textContent='';raw.hidden=true;message(text);state();}
 function publish(answer){current=answer.text||textRows(answer.rows);content.replaceChildren(...(answer.nodes||[DataList({items:answer.rows})]));raw.textContent=current;recording.publish({text:current,name:meta.title+'.txt'});state();}
 async function calculate(){invalidate();const gen=revision;busy=true;state();try{const answer=await execute({isCurrent:()=>!disposed&&gen===revision&&!panel.hidden,message});if(gen!==revision||panel.hidden||disposed)return;if(answer.ambiguous){content.replaceChildren(Box({tag:'p',text:'这个当地时间出现两次。请在“重复时间”中明确选择较早或较晚一次。'}),DataList({items:answer.candidates.map((c,i)=>[i?'较晚一次':'较早一次',c.utcText+' · '+c.offsetText])}));return;}publish(answer);if(answer.refresh){tick=setInterval(()=>{if(gen!==revision||panel.hidden||document.hidden)return;publish(answer.refresh());},1000);}}catch(e){if(gen===revision)message(e.message,'error');}finally{if(gen===revision){busy=false;state();}}}
 for(const event of ['input','change'])form.addEventListener(event,()=>invalidate());
 form.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing&&e.target.tagName==='INPUT'){e.preventDefault();calculate();}});
 const visible=()=>{if(!document.hidden&&tick)calculate();};document.addEventListener('visibilitychange',visible);
 onDisconnect(panel,()=>{disposed=true;invalidate();document.removeEventListener('visibilitychange',visible);});empty();state();return {panel,form,result,content,run,invalidate,publish,message};
}
