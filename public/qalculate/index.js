import {Box,Button,Card,EmptyState,Field,FormGrid,Input,Link,Option,Select,Status,TabList,TabPanel,Textarea,ToolHeader,ToolPanel,Toolbar,element,onDisconnect,tabsController,setTextareaValue,updateStatus} from '../ui/index.js';
import {resultRecording,canvasRecord} from '../result-recording.js';
import {qalculateClient} from './client.js';
import {reportResult,recordJSON} from './model.js';
import {calculatorInsertion,memoryExpression} from './player-model.js';

export function mountQalculate(main){
 const client=qalculateClient(),memoryClient=qalculateClient();
 const select=(id,choices)=>Select({id:'qalculate-'+id,children:choices.map(([v,t])=>Option(t,v))});
 const input=(id,value='',placeholder='')=>Input({id:'qalculate-'+id,value,placeholder});
 const button=(id,text,click)=>Button({id:'qalculate-'+id,text,on:{click}});
 const mode=select('mode',[['expression','普通计算器'],['scientific','科学计算器']]);
 const expression=Textarea({id:'qalculate-expression',className:'qalculate-editor',rows:1,autoSize:true,minRows:1,maxRows:4,placeholder:'0'});
 const precision=input('precision','20'),angle=select('angle',[['1','弧度'],['2','角度'],['3','百分度'],['0','无默认单位']]);
 precision.type='number';precision.min='2';precision.max='10000';
 const approximation=select('approximation',[['APPROXIMATION_TRY_EXACT','尽量精确'],['APPROXIMATION_EXACT','精确形式'],['APPROXIMATION_APPROXIMATE','小数近似']]);
 const syntax=select('syntax',[['0','自适应'],['1','隐式乘法优先'],['2','常规'],['3','链式'],['4','RPN 逆波兰表达式']]);
 const base=input('base','10'),options=Textarea({id:'qalculate-options',rows:3,placeholder:'额外内核设置，每行一条，例如：\nprint.min_exp -3\nprint.show_ending_zeroes true'});
 const run=button('run','=',()=>calculate()),stop=button('stop','停止',()=>invalidate('已停止。'));run.setAttribute('aria-label','计算');
 run.dataset.variant='primary';
 const status=Status({id:'qalculate-status',hidden:true});
 const answer=Box({tag:'output',id:'qalculate-display-value',text:'0',attrs:{'aria-live':'polite','aria-label':'计算结果'}}),empty=EmptyState({text:'暂无计算结果'});
 const output=Box({tag:'pre',id:'qalculate-output',className:'qalculate-result',text:''}),plotBox=Box({className:'qalculate-plot'}),generatedBox=Box({id:'qalculate-generated-files',hidden:true});
 const copy=button('copy','复制结果',()=>{if(current)navigator.clipboard.writeText(current.values.at(-1).output).catch(()=>message('复制失败，请手动选择结果。','error'));});
 const save=button('download','下载文本结果',()=>{if(current)download(reportResult(current),'计算结果.txt','text/plain');});
 const saveRecord=button('download-record','下载完整记录',()=>{if(current)download(recordJSON(current),'完整计算记录.json','application/json');});
 const key=(id,text,token=text)=>Button({id:'qalculate-key-'+id,text,attrs:{'data-calc-token':token,'data-key-role':/^[+*/-]$/.test(token)?'operator':/^[0-9.]$/.test(token)?'number':'function'},on:{click:()=>insert(token)}});
 const keypad=Box({className:'qalculate-keypad',children:[
  button('clear-all','AC',()=>{setTextareaValue(expression,'');invalidate();}),button('clear-entry','退格',()=>{const a=expression.selectionStart,b=expression.selectionEnd;expression.setRangeText('',a===b?Math.max(0,a-1):a,b,'end');expression.dispatchEvent(new Event('input',{bubbles:true}));expression.focus();}),key('open','('),key('close',')'),
  ...[['7','7'],['8','8'],['9','9'],['divide','÷','/'],['4','4'],['5','5'],['6','6'],['multiply','×','*'],['1','1'],['2','2'],['3','3'],['subtract','−','-'],['sign','±'],['0','0'],['decimal','.'],['add','+']].map(([id,text,token])=>key(id,text,token)),
  key('percent','%'),key('square','x²'),key('sqrt','√','sqrt('),run]});
 const scientificKeys=Box({className:'qalculate-keypad',attrs:{'data-keypad':'scientific'},children:[...['sin','cos','tan','asin','acos','atan','sinh','cosh','tanh','ln','log10','log2','abs','floor','ceil','cbrt'].map(name=>key(name,name,name+'(')),key('power','xʸ','^'),key('reciprocal','1/x'),key('factorial','n!','!'),key('pi','π','pi'),key('e','e'),key('imaginary','i'),key('comma',','),key('exp','eˣ','exp(')]});scientificKeys.hidden=true;
 const memoryStatus=Box({tag:'span',id:'qalculate-memory-indicator',text:'',attrs:{role:'status'}}),memoryControls=Toolbar({className:'qalculate-memory',children:[button('memory-clear','MC',()=>{memoryRevision++;memoryClient.cancel();memory='';memoryStatus.textContent='';state();}),button('memory-recall','MR',()=>{if(memory)insert(memory);else message('尚未存储数值。');}),...Object.entries({store:'MS',add:'M+',subtract:'M−'}).map(([action,text])=>button('memory-'+action,text,()=>remember(action))),button('answer','Ans',()=>{if(lastValue)insert(lastValue);else message('请先完成一次计算。');}),memoryStatus]});
 const settings=TabPanel({id:'qalculate-settings',children:[FormGrid({children:[Field({label:'精度（十进制有效位）',control:precision}),Field({label:'结果形式',control:approximation}),Field({label:'表达式语法',control:syntax}),Field({label:'结果进制',control:base})]}),Field({label:'内核设置',control:options}),Link({text:'官方设置说明',attrs:{href:'https://qalculate.github.io/reference/structPrintOptions.html',target:'_blank',rel:'noopener noreferrer'}})]});
 const angleField=Field({label:'角度单位',control:angle});angleField.hidden=true;
 const editor=Card({className:'qalculate-machine',attrs:{'data-variant':'calculator'},children:[
  Toolbar({children:[Field({label:'模式',control:mode}),angleField,stop]}),
  Box({className:'qalculate-display',children:[Field({label:'算式',control:expression}),Box({className:'qalculate-answer-row',children:[answer,copy]})]}),status,memoryControls,memoryStatus,
  Box({className:'qalculate-keyzone',children:[scientificKeys,keypad]})
 ]});
 // The memory indicator is separate from the key row, so six keys always fit.
 memoryControls.lastElementChild===memoryStatus&&memoryStatus.remove();editor.insertBefore(memoryStatus,editor.lastElementChild);
 const clearHistory=button('clear-history','清空历史',()=>{history=[];drawHistory();});
 const historyBox=Box({className:'qalculate-history'}),historyPane=TabPanel({id:'qalculate-history-panel',children:[historyBox,clearHistory]});
 const resultCard=TabPanel({id:'qalculate-results',children:[empty,output,plotBox,generatedBox,Toolbar({children:[save,saveRecord]})]});
 const tabs=TabList({attrs:{'aria-label':'计算器面板'}}),aside=Card({className:'qalculate-aside',attrs:{'data-variant':'calculator-side'},children:[tabs,historyPane,settings,resultCard]});
 const panel=ToolPanel({id:'panel-qalculate',className:'panel',hidden:true,header:ToolHeader({className:'page-heading',title:'综合计算器'}),body:Box({className:'qalculate-body',children:[editor,aside]})});main.append(panel);
 const auxiliary=tabsController(tabs,[['history','历史',historyPane],['settings','设置',settings],['results','完整结果',resultCard]]);
 const recording=resultRecording({id:'qalculate-record',anchor:output,panel,source:'file',onLeave:()=>invalidate()});resultCard.append(recording.toolbar);
 for(const [id,label] of [['memory-clear','清空存储'],['memory-recall','取回存储'],['memory-store','存储结果'],['memory-add','累加存储'],['memory-subtract','扣减存储'],['answer','上次结果']]){const node=memoryControls.querySelector('#qalculate-'+id);node.title=label;node.setAttribute('aria-label',label);}
 const style=element('link',{attrs:{rel:'stylesheet',href:new URL('./style.css',import.meta.url).href}});document.head.append(style);
 let revision=0,busy=false,current=null,definitions=[],history=[],plotWorkers=[],plotURLs=[],memory='',lastValue='',memoryRevision=0,replaceOnDigit=false;
 const plotTimers=new Set(),plotCompletions=new Set();
 const settingControls={precision,angle,approximation,syntax,base,mode};
 function download(value,name,type){const url=URL.createObjectURL(new Blob([value],{type}));Link({attrs:{href:url,download:name}}).click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function cleanupPlots(){for(const complete of plotCompletions)complete({cancelled:true});plotCompletions.clear();for(const timer of plotTimers)clearTimeout(timer);plotTimers.clear();for(const w of plotWorkers)w.terminate();plotWorkers=[];for(const u of plotURLs)URL.revokeObjectURL(u);plotURLs=[];plotBox.replaceChildren();generatedBox.replaceChildren();generatedBox.hidden=true;}
 function message(text='',tone){updateStatus(status,text,tone);status.hidden=!text;}
 function state(){run.disabled=busy;stop.hidden=!busy;copy.disabled=save.disabled=saveRecord.disabled=!current||busy;for(const id of ['memory-clear','memory-recall'])memoryControls.querySelector('#qalculate-'+id).disabled=!memory;for(const id of ['memory-store','memory-add','memory-subtract','answer'])memoryControls.querySelector('#qalculate-'+id).disabled=!lastValue;}
 function invalidate(text=''){replaceOnDigit=false;revision++;memoryRevision++;memoryClient.cancel();memoryStatus.textContent=memory?'M：'+memory:'';client.cancel();busy=false;current=null;recording.clear();cleanupPlots();answer.textContent='0';output.textContent='';empty.hidden=false;message(text);state();}
 function insert(text){if(replaceOnDigit){const unary=['±','x²','1/x'].includes(text)||text.endsWith('(');setTextareaValue(expression,unary?lastValue:/^[+*/^!%−-]$/.test(text)?'('+lastValue+')':'');expression.setSelectionRange(unary?0:expression.value.length,expression.value.length);}const value=calculatorInsertion(expression.value,expression.selectionStart,expression.selectionEnd,text);setTextareaValue(expression,value.text);expression.setSelectionRange(value.caret,value.caret);expression.dispatchEvent(new Event('input',{bubbles:true}));expression.focus();}
 function syncMode(){const scientific=mode.value==='scientific';editor.dataset.calculatorMode=mode.value;scientificKeys.hidden=!scientific;angleField.hidden=!scientific;invalidate();}
 mode.addEventListener('change',syncMode);
 for(const node of [expression,precision,angle,approximation,syntax,base,options])node.addEventListener('input',()=>invalidate());
 expression.addEventListener('pointerdown',()=>{replaceOnDigit=false;});
 expression.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','Backspace','Delete'].includes(event.key))replaceOnDigit=false;if(replaceOnDigit&&!event.ctrlKey&&!event.metaKey&&!event.isComposing&&/^[0-9.+*/^%-]$/.test(event.key)){event.preventDefault();insert(event.key);return;}if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();calculate();}if(event.key==='Escape'){event.preventDefault();invalidate('已停止。');}});
 const exactValue=result=>String(result.values.at(-1)?.output||'').split(/ = | ≈ /)[0].trim();
 async function remember(action){const gen=++memoryRevision;try{const expr=memoryExpression(memory,lastValue,action);memoryStatus.textContent='正在保存…';const value=await memoryClient.run('calculate',{expressions:[expr],options:settingLines(),definitions});if(gen!==memoryRevision)return;memory=exactValue(value);memoryStatus.textContent='M：'+memory;state();}catch(e){if(gen!==memoryRevision)return;memoryStatus.textContent=memory?'M：'+memory:'';state();message(e.message,'error');}}
 function settingLines(values=Object.fromEntries(Object.entries(settingControls).map(([key,node])=>[key,node.value])),extra=options.value){
  const p=Number(values.precision);if(!Number.isInteger(p)||p<2||p>10000)throw Error('精度需要是 2 至 10,000 位的整数。');
  return ['precision '+p,'evaluate.parse_options.angle_unit '+values.angle,'evaluate.approximation '+values.approximation,'evaluate.parse_options.parsing_mode '+values.syntax,'print.base '+values.base,...extra.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)];
 }
 async function calculate(){
  invalidate();const gen=revision;busy=true;state();message('正在计算…');
  try{
   const expressions=expression.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
   if(!expressions.length)throw Error('请先输入表达式。');if(expressions.length>1000)throw Error('一次工作表最多 1,000 行，未执行部分计算。');
   const result=await client.run('calculate',{expressions,options:settingLines(),definitions});
   if(gen!==revision||panel.hidden)return;
   if(result.values.some(v=>v.messages.some(m=>m.type===0)))throw Error(result.values.flatMap(v=>v.messages.filter(m=>m.type===0).map(m=>m.text)).join('\n'));
   current=result;lastValue=exactValue(result);replaceOnDigit=true;answer.textContent=result.values.at(-1)?.output||'0';output.textContent=reportResult(result);empty.hidden=true;
   const exported=Object.values(result.definitions).filter(x=>/<(?:variable|function|unit|dataset)\b/.test(x));
   if(exported.length)definitions=exported;
   const plots=await Promise.all(result.values.map((item,index)=>item.plot?renderPlot(item.plot,gen,index):null));
   if(gen!==revision||panel.hidden)return;
   result.plots=plots.filter(p=>p&&!p.cancelled).map(({index,svg,error})=>({index,svg,error}));
   const graphFiles=plots.filter(p=>p?.files).flatMap(p=>p.files),generated=(result.generatedFiles||[]).map(file=>new File([file.bytes],file.name,{type:'application/octet-stream'}));
   if(generated.length){generatedBox.hidden=false;generatedBox.append(Box({tag:'h3',text:'生成的文件'}),Toolbar({children:generated.map((file,i)=>{const url=URL.createObjectURL(file);plotURLs.push(url);return Link({text:result.generatedFiles[i].path,attrs:{href:url,download:file.name}});})}));}
   const files=[...graphFiles,...generated,new File([reportResult(result)],'计算结果.txt',{type:'text/plain'}),new File([recordJSON(result)],'完整计算记录.json',{type:'application/json'})];
   recording.publish({files});history.unshift({expressions,output:reportResult(result),record:result});drawHistory();
   if(result.plots.length||generated.length||expressions.length>1)auxiliary.select('results');
   message(plots.some(p=>p?.error)?'计算完成；部分图形未能渲染，完整原始数据仍可下载。':'',plots.some(p=>p?.error)?'error':undefined);state();
  }catch(error){if(gen===revision)message(error.message,'error');}
  finally{if(gen===revision){busy=false;state();client.cancel();}}
 }
 function renderPlot(plot,gen,index){return new Promise(resolve=>{
  const worker=new Worker(new URL('./plot-worker.js',import.meta.url));plotWorkers.push(worker);
  let finished=false;
  const complete=result=>{if(finished)return;finished=true;clearTimeout(timer);plotTimers.delete(timer);plotCompletions.delete(complete);worker.terminate();resolve(result);};
  plotCompletions.add(complete);
  const timer=setTimeout(()=>complete({index,error:'绘图超过 30 秒。'}),30000);
  plotTimers.add(timer);
  worker.onmessage=async({data})=>{if(finished)return;if(gen!==revision||panel.hidden){complete({cancelled:true});return;}if(data.error){complete({index,error:data.error});return;}
   const url=URL.createObjectURL(new Blob([data.svg],{type:'image/svg+xml'}));plotURLs.push(url);
   const img=element('img',{attrs:{src:url,alt:'Qalculate 原生 Gnuplot 计算图形'}});plotBox.append(img,Link({text:'下载完整 SVG 图形',attrs:{href:url,download:`qalculate-${index+1}.svg`}}));
   try{
    await img.decode();if(gen!==revision||finished){complete({cancelled:true});return;}
    const canvas=element('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;canvas.getContext('2d').drawImage(img,0,0);
    const png=await canvasRecord(canvas,`计算图形-${index+1}.png`);if(gen!==revision||finished){complete({cancelled:true});return;}
    complete({index,svg:data.svg,files:[...png.files,new File([data.svg],`计算图形-${index+1}.svg`,{type:'image/svg+xml'})]});
   }catch(error){complete({index,svg:data.svg,error:'图形预览导出失败：'+error.message,files:[new File([data.svg],`计算图形-${index+1}.svg`,{type:'image/svg+xml'})]});}
  };
  worker.onerror=()=>complete({index,error:'Gnuplot 绘图引擎加载失败。'});
  worker.postMessage({id:gen,plot});
 });}
 function drawHistory(){clearHistory.hidden=!history.length;historyBox.replaceChildren(...(history.length?history.map((entry,i)=>Button({id:'qalculate-history-'+i,layout:'stacked',variant:'choice',children:[Box({tag:'span',text:entry.expressions.join('\n')}),Box({tag:'strong',text:entry.record.values.at(-1)?.output||entry.output})],on:{click:()=>{setTextareaValue(expression,entry.expressions.join('\n'));syncMode();expression.focus();}}})):[EmptyState({text:'暂无计算记录'})]));}
 onDisconnect(panel,()=>{memoryClient.cancel();invalidate();auxiliary.destroy();style.remove();});
 drawHistory();syncMode();
 state();return panel;
}
