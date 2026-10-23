import {Box,Button,Card,Dialog,dialogController,Toolbar,Field,Input,Textarea,Select,Option,Status,EmptyState,updateStatus,onDisconnect} from '../ui/index.js';
import {notebookViews} from '../navigation.js';
import {createGraphicEngine} from './engines.js';
import {newDrawing,decodeDrawing,encodeDrawing,drawingsIn,putDrawing,drawingName,MAX_DRAWING,DRAWING_MIME} from './model.js';
import {connectGraphics} from './bridge.js';
import {snapshot} from '../handoff/model.js';
import {toBase64} from '../notebook/model.js';

// The injected notebook service owns all transactions. This controller owns
// scene drafts, preview revisions and engine lifetimes, never Vditor state.
export function mountGraphics(main,{navigate,notebook,current}){
 const states=new Map();let activeKind=null,dead=false,queue=Promise.resolve();
 const download=(data,name,type)=>{const url=URL.createObjectURL(new Blob([data],{type})),a=Box({tag:'a',attrs:{href:url,download:name.replace(/[\\/:*?"<>|]/g,'_')}});a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);};
 const run=fn=>{const work=queue.catch(()=>{}).then(fn);queue=work;work.catch(error=>report(error));return work;};
 const report=error=>{if(pickerDialog.open){updateStatus(pickerStatus,error.message||'操作失败。','error');return;}const state=states.get(activeKind);if(state){updateStatus(state.status,error.message||'图稿操作失败。','error');state.retry.hidden=false;state.reload.hidden=false;}else updateStatus(pickerStatus,error.message||'操作失败。','error');};
 const noteRef=state=>state.noteId&&state.doc;
 for(const kind of ['whiteboard','mindmap']){
  const status=Status({tag:'span',id:kind+'-status'}),title=Input({id:kind+'-title',attrs:{'aria-label':'图稿标题',maxlength:120}}),host=Box({id:kind+'-editor',className:'graphic-engine graphic-'+kind,attrs:{tabindex:0,'aria-label':drawingName(kind)+'编辑区'}}),sources=Box({id:kind+'-sources',className:'graphic-sources'});
  const state={kind,status,title,host,sources,doc:null,engine:null,noteId:null,dirty:false,revision:0,timer:null,loading:null,serial:0};states.set(kind,state);
  const retry=Button({text:'重试保存 / 加载',hidden:true,on:{click:()=>run(async()=>{if(!state.engine)await load(state);await flushState(state);})}});state.retry=retry;
  const reload=Button({text:'重新载入',hidden:true,on:{click:()=>{discardState=state;discardModal.open();}}});state.reload=reload;
  const noteButton=Button({text:'返回笔记',disabled:true,on:{click:()=>run(async()=>{await flushState(state);await notebook.show(state.noteId);})}});
  const json=Button({text:'导出图稿',disabled:true,on:{click:()=>{try{capture(state);download(encodeDrawing(state.doc),state.doc.title+'.mist-drawing.json',DRAWING_MIME);}catch(error){report(error);}}}}),png=Button({text:'导出图片',disabled:true,on:{click:()=>run(async()=>{if(!state.engine)return;download(await state.engine.png(),state.doc.title+'.png','image/png');})}});
  const importFile=Input({type:'file',id:kind+'-import',hidden:true,attrs:{accept:'.json,.excalidraw,application/json'}});
  importFile.addEventListener('change',()=>{const file=importFile.files?.[0];importFile.value='';if(file)run(async()=>{if(file.size>MAX_DRAWING)throw Error('图稿最多 24 MB。');const value=JSON.parse(await file.text());let doc;
   if(value.format==='mist-drawing')doc=decodeDrawing({mime:DRAWING_MIME,bytes:new TextEncoder().encode(JSON.stringify(value))});
   else if(kind==='whiteboard'&&value.type==='excalidraw')doc={...newDrawing(kind,file.name.replace(/\.[^.]+$/,'')),scene:{elements:value.elements,files:value.files||{},appState:value.appState||{}}};
   else if(kind==='mindmap'&&value.nodeData)doc={...newDrawing(kind,file.name.replace(/\.[^.]+$/,'')),scene:value};
   else throw Error('请选择迷雾图稿；白板支持 .excalidraw，脑图支持 Mind Elixir JSON。');
   if(doc.kind!==kind)throw Error('图稿类型不匹配，请在对应视图中导入。');doc={...decodeDrawing({mime:DRAWING_MIME,bytes:encodeDrawing(doc)}),id:crypto.randomUUID(),previewId:crypto.randomUUID(),revision:0};await choose(kind,{imported:doc,noteId:notebook.currentId()});
  });});
  const files=Button({text:'导入图稿',on:{click:()=>importFile.click()}});
  state.insertText=()=>{textValue.value='';textKind=kind;textModal.open();};state.pickImage=nodeId=>{state.imageTarget={docId:state.doc?.id,nodeId};imageFile.click();};
  const text=kind==='whiteboard'?Button({text:'添加文字',disabled:true,on:{click:state.insertText}}):null,image=kind==='whiteboard'?Button({text:'添加图片',disabled:true,on:{click:()=>state.pickImage()}}):null;
  const imageFile=Input({id:kind+'-image',type:'file',hidden:true,attrs:{accept:'image/png,image/jpeg,image/webp,image/gif'}});
  imageFile.addEventListener('change',()=>{const file=imageFile.files?.[0],target=state.imageTarget||{docId:state.doc?.id};state.imageTarget=null;imageFile.value='';if(file)run(async()=>{if(file.size>16*1024*1024)throw Error('图片最多 16 MB。');const source=makeSource(snapshot({bytes:new Uint8Array(await file.arrayBuffer()),name:file.name}),{tool:'本地图片',route:''});if(state.doc?.id!==target.docId)throw Error('图稿已变化，请重新添加图片。');await addSource(state,source,{nodeId:target.nodeId});await flushState(state);});});
  const fit=kind==='whiteboard'?Button({text:'适应画布',disabled:true,on:{click:()=>state.engine?.fit()}}):null;
  const editActions=kind==='whiteboard'?Toolbar({className:'graphic-edit-actions',children:[text,image,fit]}):null;
  const empty=EmptyState({text:'当前笔记尚未打开'+drawingName(kind)+'。可新建一份，或从左侧笔记图稿中打开。'}),body=Box({className:'graphic-document',hidden:true,children:[Toolbar({className:'graphic-document-heading',children:[title,status,retry,reload]}),editActions,host,sources]});state.body=body;state.empty=empty;state.enabled=[noteButton,json,png,text,image,fit].filter(Boolean);
  const panel=Box({tag:'section',id:'panel-'+kind,className:'notebook-graphic-view',hidden:true,attrs:{'aria-label':drawingName(kind),'data-notebook-view':kind},children:[Toolbar({children:[files,json,png,noteButton]}),importFile,imageFile,empty,body]});state.panel=panel;main.append(panel);
  title.addEventListener('input',()=>{if(state.doc){state.doc.title=title.value.slice(0,120)||drawingName(kind);mark(state);}});
 }
 function mark(state){if(!state.doc)return;state.dirty=true;state.revision++;clearTimeout(state.timer);updateStatus(state.status,'正在保存…');state.timer=setTimeout(()=>run(()=>flushState(state)),650);}
 function capture(state){if(!state.doc)return;if(state.engine)state.doc={...state.doc,scene:state.engine.get(),title:state.title.value.trim().slice(0,120)||drawingName(state.kind)};return state.doc;}
 function flushState(state){const work=(state.saving||Promise.resolve()).catch(()=>{}).then(()=>saveState(state));state.saving=work;return work;}
 async function saveState(state){clearTimeout(state.timer);if(!state.dirty||!noteRef(state))return;
  const revision=state.revision,doc=capture(state),frozen=decodeDrawing({mime:DRAWING_MIME,bytes:encodeDrawing(doc)}),id=state.noteId;
  const preview=state.engine?await state.engine.png():undefined;
  let stored;await notebook.update(id,note=>{const result=putDrawing(note,frozen,{preview,expectedRevision:frozen.revision});stored=result.drawing;return result.note;});
  if(state.doc?.id===stored.id){state.doc.revision=stored.revision;if(state.revision===revision){state.dirty=false;state.retry.hidden=true;state.reload.hidden=true;updateStatus(state.status,'已保存到笔记本','success');}else{clearTimeout(state.timer);state.timer=setTimeout(()=>run(()=>flushState(state)),650);}}
 }
 function sourceList(state){state.sources.replaceChildren(...state.doc.sources.map(source=>Card({children:[Box({tag:'strong',text:source.name}),Box({tag:'span',text:source.tool?'来源：'+source.tool:'本地内容'}),Toolbar({children:[Button({text:'下载原始内容',on:{click:()=>download(Uint8Array.from(atob(source.base64),c=>c.charCodeAt(0)),source.name,'application/octet-stream')}}),...(source.route?[Button({text:'打开来源工具',on:{click:()=>navigate(source.route)}})]:[])]})]})));}
 async function load(state){if(state.engine)return;if(state.loading)return state.loading;
  if(!state.doc)return;const serial=++state.serial;state.body.hidden=false;state.empty.hidden=true;state.title.value=state.doc.title;updateStatus(state.status,'正在加载本地编辑器…');
  state.loading=createGraphicEngine(state.kind,state.host,state.doc.scene,{changed:()=>{if(serial===state.serial)mark(state);},onText:state.insertText,onImage:state.pickImage,onError:report}).then(engine=>{
   if(dead||serial!==state.serial){engine.destroy();return;}state.engine=engine;state.enabled.forEach(b=>b.disabled=false);state.retry.hidden=true;state.reload.hidden=true;updateStatus(state.status,'已保存到笔记本','success');sourceList(state);
  }).catch(error=>{if(serial===state.serial){state.retry.hidden=false;updateStatus(state.status,error.message,'error');throw error;}}).finally(()=>{if(serial===state.serial)state.loading=null;});return state.loading;
 }
 async function open(noteId,assetId){await flush();const note=await notebook.read(noteId),asset=note?.assets.find(a=>a.id===assetId);if(!asset)throw Error('图稿已被删除，请重新选择。');const doc=decodeDrawing(asset),state=states.get(doc.kind);
  state.serial++;state.engine?.destroy();state.engine=null;state.loading=null;state.doc=doc;state.noteId=noteId;state.dirty=false;state.revision++;activeKind=doc.kind;await notebook.focus(noteId,doc.id);await navigate(notebookViews.find(view=>view.id===doc.kind).route);await load(state);return state;
 }
 async function flush(){for(const state of states.values())await flushState(state);}
 async function createInNote(kind,noteId){await flush();const doc=newDrawing(kind);let stored;const note=await notebook.update(noteId,n=>{const result=putDrawing(n,doc,{expectedRevision:0});stored=result.drawing;return result.note;},{title:doc.title});const state=await open(note.id,stored.id);mark(state);await flushState(state);}
 function makeSource(data,info){return{id:crypto.randomUUID(),name:data.name||'线索.txt',mime:data.mime,base64:toBase64(data.bytes),text:data.text===null?null:data.text.slice(0,3000),tool:info.tool||'',route:info.route||''};}
 async function addSource(state,source,options){if(!state.engine)await load(state);if(!state.engine)throw Error('编辑器尚未就绪。');
  // Validate size before adding to the real scene. Full bytes live in sources;
  // only the visible card/node text is bounded.
  const next={...state.doc,sources:[...state.doc.sources,source]};const size=encodeDrawing(next).length;if(source.mime.startsWith('image/')&&size+source.base64.length+65536>MAX_DRAWING)throw Error('加入这张图片后图稿会超过 24 MB，请新建图稿或使用较小图片。');await state.engine.add(source,options);state.doc.sources=next.sources;sourceList(state);mark(state);
 }
 const pickerTitle=Box({tag:'h2',id:'graphic-picker-title',text:'加入白板 / 脑图'}),pickerClose=Button({text:'取消'}),kindSelect=Select({id:'graphic-kind',children:[Option('线索白板','whiteboard'),Option('思维导图','mindmap')]}),target=Select({id:'graphic-target'}),destination=Select({id:'graphic-note'}),name=Input({id:'graphic-name',attrs:{maxlength:120}}),pickerStatus=Status({id:'graphic-picker-status'}),preview=Box({tag:'pre',className:'graphic-capture-preview'}),fileSelect=Select({id:'graphic-result-file',hidden:true,attrs:{'aria-label':'选择结果文件'}});
 let request=null,pendingSource=null,sourceInfo=null,options={},entries=[],pickerRevision=0,items=[];
 const start=Button({id:'graphic-start',text:'开始编辑',variant:'primary',on:{click:()=>{start.disabled=true;const operation=run(async()=>{
  const revision=pickerRevision,source=pendingSource,lease=request;if(lease&&!lease.isCurrent())throw Error('来源结果已变化，请重新执行后再加入。');await notebook.flush();await flush();if(revision!==pickerRevision)return;if(lease&&!lease.isCurrent())throw Error('来源结果已变化，请重新执行后再加入。');
  let state;if(target.value){const entry=entries.find(e=>e.noteId+'/'+e.drawing.id===target.value);if(!entry)throw Error('图稿已变化，请重新选择。');
   picker.close();state=await open(entry.noteId,entry.drawing.id);
  }else{const doc=options.imported||newDrawing(kindSelect.value,name.value.trim()||drawingName(kindSelect.value));let stored;
   const note=await notebook.update(destination.value||null,n=>{const result=putDrawing(n,doc,{expectedRevision:0});stored=result.drawing;return result.note;},{title:name.value.trim()||doc.title});
   picker.close();state=await open(note.id,stored.id);
  }
  if(source)await addSource(state,source);mark(state);await flushState(state);
 });operation.finally(()=>{if(pickerDialog.open)start.disabled=false;}).catch(()=>{});}}});
 const pickerDialog=Dialog({id:'graphic-picker',className:'ui-flow-dialog',attrs:{'aria-labelledby':'graphic-picker-title'},children:[Toolbar({children:[pickerTitle,pickerClose]}),Field({label:'图稿类型',control:kindSelect}),Field({label:'目标图稿',control:target}),Field({label:'所属笔记',control:destination}),Field({label:'新图稿名称',control:name}),fileSelect,preview,pickerStatus,Toolbar({children:[start]})]});document.body.append(pickerDialog);const picker=dialogController(pickerDialog,{closeButton:pickerClose,initialFocus:kindSelect});
 function targetList(){target.replaceChildren(Option('新建'+drawingName(kindSelect.value),''),...entries.filter(e=>e.drawing.kind===kindSelect.value).map(e=>Option(e.noteTitle+' / '+e.drawing.title,e.noteId+'/'+e.drawing.id)));targetChanged();}
 function targetChanged(){destination.disabled=name.disabled=!!target.value;}
 kindSelect.addEventListener('change',targetList);target.addEventListener('change',targetChanged);
 async function choose(kind,{noteId,source,imported}={}){const rev=++pickerRevision;request=null;pendingSource=source||null;options={imported};kindSelect.value=kind;kindSelect.disabled=!!imported;preview.textContent=source?source.name:'';fileSelect.hidden=true;name.value=imported?.title||source?.name||drawingName(kind);start.disabled=true;updateStatus(pickerStatus,'正在读取笔记…');picker.open();
  const notes=await notebook.list();if(rev!==pickerRevision)return;entries=notes.flatMap(drawingsIn);destination.replaceChildren(Option('新建笔记',''),...notes.map(n=>Option(n.title,n.id)));if(noteId)destination.value=noteId;targetList();start.disabled=false;updateStatus(pickerStatus,'');
 }
 async function pickSource(index,rev){start.disabled=true;const item=items[index];if(item instanceof Blob&&item.size>16*1024*1024)throw Error('单次加入的结果最多 16 MB。');const data=item instanceof Blob?{bytes:new Uint8Array(await item.arrayBuffer()),name:item.name}:item;if(rev!==pickerRevision)return;if(!request?.isCurrent())throw Error('来源结果已变化，请重新加入。');pendingSource=makeSource(snapshot(data),sourceInfo);preview.textContent=pendingSource.text===null?pendingSource.name:pendingSource.text.slice(0,500);start.disabled=false;}
 const disconnect=connectGraphics(async value=>{try{const info=current();await choose('whiteboard');request=value;sourceInfo=info;const rev=pickerRevision;start.disabled=true;updateStatus(pickerStatus,'正在读取结果…');const result=await value.read();if(rev!==pickerRevision)return;if(!value.isCurrent())throw Error('来源结果已变化，请重新执行。');items=result?.files?.length?[...result.files]:[result];fileSelect.replaceChildren(...items.map((item,i)=>Option(item.name||'结果 '+(i+1),String(i))));fileSelect.hidden=items.length<2;await pickSource(0,rev);updateStatus(pickerStatus,'');}catch(error){updateStatus(pickerStatus,error.message,'error');}});
 fileSelect.onchange=()=>pickSource(Number(fileSelect.value),++pickerRevision).catch(error=>updateStatus(pickerStatus,error.message,'error'));
 pickerDialog.addEventListener('close',()=>{pickerRevision++;request=null;pendingSource=null;items=[];});
 let textKind=null;const textValue=Textarea({id:'graphic-text',attrs:{'aria-label':'文字内容',maxlength:100000}}),textClose=Button({text:'取消'}),textSubmit=Button({text:'加入图稿',variant:'primary',on:{click:()=>run(async()=>{const state=states.get(textKind),value=textValue.value;if(!value.trim())throw Error('请输入文字。');textModal.close();await addSource(state,makeSource(snapshot({bytes:new TextEncoder().encode(value),name:'文字线索.txt'}),{tool:'手动记录'}));await flushState(state);})}}),textDialog=Dialog({id:'graphic-text-dialog',className:'ui-flow-dialog',attrs:{'aria-labelledby':'graphic-text-title'},children:[Box({tag:'h2',id:'graphic-text-title',text:'添加文字线索'}),textValue,Toolbar({children:[textSubmit,textClose]})]});document.body.append(textDialog);const textModal=dialogController(textDialog,{closeButton:textClose,initialFocus:textValue});
 const onPanel=e=>{activeKind=e.detail.name==='notebook'&&states.has(e.detail.notebookView)?e.detail.notebookView:null;for(const [kind,state]of states){state.panel.hidden=kind!==activeKind;if(kind===activeKind){if(state.doc&&state.noteId!==notebook.currentId()){state.serial++;state.engine?.destroy();state.engine=null;state.loading=null;state.doc=null;state.noteId=null;state.body.hidden=true;state.empty.hidden=false;state.enabled.forEach(b=>b.disabled=true);}if(state.doc)load(state).catch(report);}else{state.serial++;state.engine?.destroy();state.engine=null;state.loading=null;state.enabled.forEach(b=>b.disabled=true);}}};document.addEventListener('arg:panelchange',onPanel);
 let discardState;const discardClose=Button({text:'保留当前草稿'}),discardDialog=Dialog({id:'graphic-discard',className:'ui-flow-dialog',attrs:{'aria-labelledby':'graphic-discard-title'},children:[Box({tag:'h2',id:'graphic-discard-title',text:'重新载入已保存图稿？'}),Box({tag:'p',text:'这会放弃未保存的修改。需要保留当前内容时，请先导出图稿。'}),Toolbar({children:[discardClose,Button({text:'放弃修改并重新载入',on:{click:()=>run(async()=>{const state=discardState;discardModal.close();await state.saving?.catch(()=>{});clearTimeout(state.timer);state.dirty=false;state.revision++;const note=await notebook.read(state.noteId);if(note?.assets.some(a=>a.id===state.doc.id))await open(state.noteId,state.doc.id);else{state.serial++;state.engine?.destroy();state.engine=null;state.doc=null;state.body.hidden=true;state.empty.hidden=false;state.enabled.forEach(b=>b.disabled=true);}})}})]})]});document.body.append(discardDialog);const discardModal=dialogController(discardDialog,{closeButton:discardClose,initialFocus:discardClose});
 const beforeUnload=e=>{if([...states.values()].some(s=>s.dirty)){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',beforeUnload);
 const onHide=()=>{if(document.visibilityState==='hidden')flush().catch(report);};document.addEventListener('visibilitychange',onHide);
 onDisconnect(states.get('whiteboard').panel,()=>{dead=true;disconnect();for(const state of states.values()){clearTimeout(state.timer);state.serial++;state.engine?.destroy();}document.removeEventListener('arg:panelchange',onPanel);document.removeEventListener('visibilitychange',onHide);window.removeEventListener('beforeunload',beforeUnload);picker.destroy();pickerDialog.remove();textModal.destroy();textDialog.remove();discardModal.destroy();discardDialog.remove();});
 return{panels:[...states.values()].map(s=>s.panel),flush,report,open,create:(kind,noteId)=>run(()=>createInNote(kind,noteId)),
  fromNote:(kind,note)=>choose(kind,{noteId:note.id,source:makeSource(snapshot({bytes:new TextEncoder().encode(note.markdown),name:note.title+'.md'}),{tool:'笔记本',route:'notebook'})})};
}
