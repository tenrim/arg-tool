import {Box,Card,FormGrid,Field,Input,Select,Option,Button,Toolbar,SplitView,Status,DataList,Table,Disclosure,element,onDisconnect,updateStatus} from '../ui/index.js';
import {resultRecording} from '../result-recording.js';
import {animationClient} from './client.js';

export function mountAnimation(panel,fileInput,mode){
 const client=animationClient(),root=Box({id:'animation-workspace',hidden:true});
 const button=(id,text,click)=>Button({id:'animation-'+id,text,on:{click}});
 const info=Box({id:'animation-summary'}),detail=Box({id:'animation-detail'}),status=Status({id:'animation-status',text:'选择 GIF、APNG 或 PNG，点击完整分析。'});
 const canvas=element('canvas',{id:'animation-canvas'});canvas.width=1;canvas.height=1;
 const frame=Input({id:'animation-frame',type:'number',value:1,attrs:{min:1,step:1}});
 const view=Select({id:'animation-view',children:[Option('合成画面','composite'),Option('原始局部帧','raw'),Option('与上一帧的差异','difference')]});
 const zoom=Select({id:'animation-zoom',children:[Option('适应预览宽度','fit'),...['1','2','4','8','16'].map(n=>Option(n+' 倍',n))]});
 const columns=Input({id:'animation-columns',type:'number',value:8,attrs:{min:1,step:1}});
 const dimensions={width:Input({id:'animation-tile-width',type:'number',value:32,attrs:{min:1,step:1}}),height:Input({id:'animation-tile-height',type:'number',value:32,attrs:{min:1,step:1}}),gap:Input({id:'animation-tile-gap',type:'number',value:0,attrs:{min:0,step:1}}),margin:Input({id:'animation-tile-margin',type:'number',value:0,attrs:{min:0,step:1}})};
 let revision=0,selection=0,model=null,current=null,playing=false,clock,loopsDone=0,active=false,exporting=false;
 const analyze=button('analyze','完整分析',()=>analyzeFile());
 const stop=button('stop','停止',()=>{cancel();updateStatus(status,'已停止；点击完整分析重新读取原文件。');});
 const play=button('play','播放',()=>{if(playing){pause();showFrame();}else if(model){playing=true;loopsDone=0;play.textContent='暂停';recording.clear();save.disabled=true;tick();}});
 const previous=button('previous','上一帧',()=>seek(-1)),next=button('next','下一帧',()=>seek(1));
 const save=button('save','下载当前帧',()=>{if(current)download(current.png,`frame-${frame.value}-${view.value}.png`,'image/png');});
 const all=button('all','导出全部帧 ZIP',()=>job('all',{},r=>download(r.bytes,'animation-all.zip','application/zip')));
 const sheet=button('sheet','导出精灵图',()=>job('sprite',{columns:Number(columns.value)},r=>download(r.png,'sprite-sheet.png','image/png')));
 const report=button('report','下载完整参数',()=>{if(model)download(new TextEncoder().encode(JSON.stringify(model,null,2)),'animation.json','application/json');});
 const split=button('slice','按网格切片',()=>job('slice',{options:Object.fromEntries(Object.entries(dimensions).map(([k,n])=>[k,Number(n.value)]))},r=>adopt(r)));
 const restore=button('restore','恢复原始帧',()=>job('restore',{},r=>adopt(r)));
 const controls=[frame,view,zoom,play,previous,next,all,sheet,columns,report,split,restore,...Object.values(dimensions)];
 const frameCard=Card({title:'逐帧查看',children:[FormGrid({children:[Field({label:'帧编号',control:frame}),Field({label:'查看方式',control:view}),Field({label:'像素缩放',control:zoom})]}),Toolbar({children:[previous,play,next]}),Box({className:'animation-preview',children:[canvas]}),detail,Toolbar({children:[save,report]})]});
 const exports=Card({title:'完整导出与精灵图',children:[Toolbar({children:[all]}),FormGrid({children:[Field({label:'精灵图列数',control:columns})]}),Toolbar({children:[sheet]}),Box({tag:'p',text:'全部帧 ZIP 包含合成帧、原始局部帧、调色板索引、完整参数和原文件。PNG/APNG 原始帧保留原位深及颜色配置。合成、差异和精灵图使用 RGBA8，未应用 ICC 色彩转换。'}),FormGrid({children:Object.entries(dimensions).map(([k,node])=>Field({label:({width:'切片宽度',height:'切片高度',gap:'格间距',margin:'外边距'})[k]+' / 像素',control:node}))}),Toolbar({children:[split,restore]}),Box({tag:'p',text:'切片按源文件第一张合成画面，从左到右、从上到下读取；格间距和外边距不属于切片。尺寸不整除时明确报错，不丢弃残边。'})]});
 root.append(Toolbar({children:[analyze,stop]}),status,info,SplitView({minPaneWidth:'340px',children:[frameCard,exports]}));
 panel.querySelector('.tool-provenance').before(root);
 const recording=resultRecording({id:'animation-result',anchor:frameCard,source:'file',onLeave:()=>cancel()});
 // Keep recording actions inside their result card, not between the two panes.
 frameCard.append(recording.toolbar);
 function state(){const ready=!!model;for(const node of controls)node.disabled=!ready||exporting;save.disabled=!current?.png||exporting||playing;analyze.disabled=exporting;stop.disabled=!model&&!exporting;restore.disabled=!ready||exporting||model?.format!=='SPRITE';}
 function pause(){if(playing){selection++;current=null;recording.clear();save.disabled=true;}playing=false;clearTimeout(clock);play.textContent='播放';}
 function clearCurrent(){selection++;current=null;recording.clear();canvas.width=canvas.height=1;detail.replaceChildren();state();}
 function cancel(){revision++;exporting=false;pause();client.cancel();model=null;clearCurrent();info.replaceChildren();state();}
 function download(bytes,name,type){
  const url=URL.createObjectURL(new Blob([bytes],{type})),a=element('a',{attrs:{href:url,download:name}});a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function activeTask(){return !panel.hidden&&mode.value==='animation';}
 async function analyzeFile(){
  cancel();const file=fileInput.files[0];if(!file){updateStatus(status,'请先选择 GIF、APNG 或 PNG。','error');return;}
  const gen=revision;exporting=true;state();updateStatus(status,'正在完整解析所有帧…');
  try{if(file.size>32*1024*1024)throw Error('文件超过 32 MB。');const bytes=await file.arrayBuffer();if(gen!==revision)return;const result=await client.run('decode',{bytes});if(gen!==revision||!activeTask())return;adopt(result);updateStatus(status,`完整读取 ${result.frames.length} 帧，没有抽帧或缩放。`);}
  catch(e){if(gen===revision){client.cancel();updateStatus(status,e.message,'error');}}
  finally{if(gen===revision){exporting=false;state();}}
 }
 function adopt(result){
  pause();model=result;frame.value='1';frame.max=String(result.frames.length);columns.value=String(Math.min(Number(columns.value)||8,result.frames.length));
  info.replaceChildren(DataList({items:[['格式',result.format],['画布',`${result.width} × ${result.height}`],['全部帧数',result.frames.length],['单轮时长 / 毫秒',result.totalDurationMs],['文件循环值',result.loops===null?'未声明':result.loops===0?'0（无限）':result.loops],['循环含义',result.loopMeaning],['默认封面',result.posterExcluded?'不计入动画；完整 ZIP 单独保留':'属于帧或未单独设置']]}));
  state();showFrame();
 }
 async function showFrame(){
  const index=Number(frame.value)-1;pauseUnlessPlaying();
  const gen=revision,request=++selection;current=null;recording.clear();save.disabled=true;if(!playing){detail.replaceChildren();canvas.width=canvas.height=1;}
  if(!model||!Number.isInteger(index)||index<0||index>=model.frames.length){updateStatus(status,'请输入有效帧编号。','error');return;}
  try{const result=await client.run('frame',{index,view:view.value,previewOnly:playing});if(gen!==revision||request!==selection||!activeTask())return;
   current=result;canvas.width=result.width;canvas.height=result.height;resize();canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(result.pixels),result.width,result.height),0,0);
   if(playing){detail.textContent=`正在播放第 ${index+1} / ${model.frames.length} 帧 · 原始延时 ${model.frames[index].delayMs} 毫秒`;return;}
   const f=model.frames[index];detail.replaceChildren(DataList({items:[['当前帧',`${index+1} / ${model.frames.length}`],['原始延时',`${f.delayNumerator} / ${f.delayDenominator} 秒${f.delayDenominator===0?'（分母 0 按 100 解释）':''}`],['延时 / 毫秒',f.delayMs],['矩形',`x=${f.x}, y=${f.y}, ${f.width} × ${f.height}`],['处置值',f.dispose],['混合值',f.blend??'透明索引覆盖'],['透明索引',f.transparentIndex??'无／使用 Alpha'],['颜色表',f.paletteScope??model.colorType??'RGBA']]}));
   const palette=f.palette||(model.format==='GIF'?model.globalPalette:model.globals?.find(c=>c.type==='PLTE')?.data);
   if(palette?.length){const alpha=model.globals?.find(c=>c.type==='tRNS')?.data;detail.append(Disclosure({children:[Box({tag:'summary',text:`当前颜色表（${palette.length/3} 色）`}),Box({className:'animation-palette',children:[Table({columns:['索引','RGB','透明度'],rows:Array.from({length:palette.length/3},(_,i)=>[i,palette.slice(i*3,i*3+3).join(', '),i===f.transparentIndex?0:alpha?.[i]??255])})]})]}));}
   const metadataBytes=JSON.stringify({source:fileInput.files[0]?.name,view:view.value,frame:f,animation:model},null,2);
   recording.publish({files:[new File([result.png],`frame-${index+1}-${view.value}.png`,{type:'image/png'}),new File([metadataBytes],'animation-metadata.json',{type:'application/json'})]});state();
  }catch(e){if(gen===revision&&request===selection){pause();updateStatus(status,e.message,'error');}}
 }
 function pauseUnlessPlaying(){if(!playing)clearTimeout(clock);}
 function seek(delta){pause();if(!model)return;frame.value=String(Math.max(1,Math.min(model.frames.length,Number(frame.value)+delta)));showFrame();}
 function tick(){if(!playing||!model)return;const f=model.frames[Number(frame.value)-1];clock=setTimeout(async()=>{
  if(!playing||!model)return;let n=Number(frame.value)+1;
  if(n>model.frames.length){n=1;loopsDone++;const total=model.loops===null?1:model.loops===0?Infinity:model.format==='GIF'?model.loops+1:model.loops;if(loopsDone>=total){pause();showFrame();return;}}
  frame.value=String(n);await showFrame();if(playing)tick();
 },Math.max(20,f.delayMs));}
 async function job(op,data,consume){
  if(!model||exporting)return;pause();const gen=revision;exporting=true;recording.clear();state();updateStatus(status,'正在处理全部数据…');
  try{const result=await client.run(op,data);if(gen!==revision||!activeTask())return;consume(result);updateStatus(status,'处理完成。');}
  catch(e){if(gen===revision)updateStatus(status,e.message,'error');}
  finally{if(gen===revision){exporting=false;state();if(model)showFrame();}}
 }
 frame.addEventListener('input',()=>{pause();showFrame();});view.addEventListener('change',()=>{pause();showFrame();});
 function resize(){canvas.style.width=zoom.value==='fit'?'100%':String(canvas.width*Number(zoom.value))+'px';}
 zoom.addEventListener('change',resize);
 for(const input of [columns,...Object.values(dimensions)])input.addEventListener('input',()=>{if(exporting)cancel();});
 const change=()=>{cancel();updateStatus(status,'');};
 fileInput.addEventListener('change',change);
 const sync=()=>{active=activeTask();root.hidden=!active;panel.classList.toggle('animation-active',active);if(!active)cancel();};
 mode.addEventListener('input',sync);document.addEventListener('arg:panelchange',sync);
 const visibility=()=>{if(document.hidden)pause();};document.addEventListener('visibilitychange',visibility);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),reduce=()=>pause();reduced.addEventListener('change',reduce);
 onDisconnect(root,()=>{cancel();fileInput.removeEventListener('change',change);mode.removeEventListener('input',sync);document.removeEventListener('arg:panelchange',sync);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',reduce);});
 state();return root;
}
