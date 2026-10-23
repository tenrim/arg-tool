import {Box,Button,Card,Dialog,Disclosure,dialogController,disclosureController,ToolPanel,ToolHeader,ToolHelp,Toolbar,Field,Input,Select,Option,SearchField,Status,Result,EmptyState,updateStatus,onDisconnect,animateCollection} from '../ui/index.js';
import {newNote,newId,validateNote,noteSummary,backupGroups,appendResult,exportBackup,parseBackup,portableMarkdown,importMarkdown,MAX_BACKUP,MAX_ASSET} from './model.js';
import {createNotebookStore} from './store.js';
import {createNoteEditor} from './editor.js';
import {exportHTML} from './export.js';
import {createNoteRecorder} from './recorder.js';
import {snapshot} from '../handoff/model.js';
import {connectNotebook} from '../handoff/button.js';
import {drawingsIn,drawingName} from '../graphics/model.js';
import {notebookViews} from '../navigation.js';
import {createToolHelpContent} from '../tool-help.js';

export function mountNotebook(main,{navigate,current,openGraphic,createGraphic,sendNoteToGraphic}){
 let docked=false;
 const store=createNotebookStore();let notes=[],active=null,editor=null,loadingEditor=null,needsEditorSync=false,dirty=false,editRevision=0,timer,saveTail=Promise.resolve(),actionTail=Promise.resolve(),disposed=false,view='notes',activeDrawingId=null;
 const recorder=createNoteRecorder(async(id,file)=>{if(active?.id!==id)throw Error('当前笔记已变化，请重新录音。');await attach([file]);});
 const status=Status({tag:'span',id:'notebook-status',className:'notebook-save-state'}),search=Input({id:'notebook-search',type:'search',placeholder:'搜索笔记'}),list=Result({id:'notebook-list',layout:'collection'});
 const title=Input({id:'notebook-title',placeholder:'笔记标题',attrs:{maxlength:120,'aria-label':'笔记标题'}});
 const host=Box({id:'notebook-editor',className:'notebook-editor'}),attachments=Box({id:'notebook-attachments',className:'notebook-attachments'});
 const empty=EmptyState({text:'还没有笔记。新建一篇，或从工具结果中加入。'});
 const content=Box({className:'notebook-content',hidden:true,children:[host,attachments]});
 const add=Button({text:'新建笔记',variant:'primary',id:'notebook-new',on:{click:()=>afterNotebook(async()=>{await flush();const saved=await store.save(newNote());notes.unshift(noteSummary(saved));await select(saved);},()=>{if(panel.hidden||view!=='notes')return navigate('notebook');})}});
 const retry=Button({text:'重试',hidden:true,on:{click:()=>action(async()=>{if(!active)await refresh();else{await flush();if(!editor)await select(active);}})}});
 const exportMD=Button({text:'导出 Markdown',on:{click:()=>{if(!active)return;capture();download(portableMarkdown(active),active.title+'.md','text/markdown;charset=utf-8');}}});
 const exportPage=Button({text:'导出 HTML',on:{click:()=>action(async()=>{if(!active||!editor)return;capture();const note=structuredClone(active),document=await editor.document(note.title);download(await exportHTML(note,editor.portableHTML(document,note)),note.title+'.html','text/html;charset=utf-8');})}});
 const print=Button({text:'打印 / PDF',on:{click:()=>action(async()=>{if(!active||!editor)return;capture();const sheet=await editor.document(active.title);sheet.className='notebook-print-document';sheet.removeAttribute('aria-hidden');document.body.append(sheet);document.body.classList.add('notebook-printing');try{window.print();}finally{document.body.classList.remove('notebook-printing');sheet.remove();}})}});
 const backupOne=Button({text:'完整备份当前笔记',disabled:true,on:{click:()=>action(async()=>{if(!active)return;capture();download(exportBackup([active]),active.title+'-完整备份.json','application/json');updateStatus(status,'完整备份已下载，包含正文、附件和可编辑图稿。','success');})}});
 const backup=Button({text:'备份全部笔记',on:{click:()=>action(prepareBackup)}});
 async function prepareBackup(){
  capture();const summaries=await store.summaries({includeDeleted:true}),draft=active?structuredClone(active):null;
  const all=new Map(summaries.map(n=>[n.id,n]));if(draft)all.set(draft.id,noteSummary(draft));
  const parts=backupGroups([...all.values()]);
  if(!parts.length){updateStatus(status,'没有可备份的笔记。');return;}
  async function savePart(part,index){
   const records=[];for(const summary of part){const note=summary.id===draft?.id?draft:await store.get(summary.id,{includeDeleted:true});
    if(!note||note.revision!==summary.revision)throw Error('笔记在备份准备后发生变化，请重新点击备份全部笔记。');records.push(note);}
   download(exportBackup(records),parts.length===1?'迷雾工具箱-笔记备份.json':'迷雾工具箱-笔记备份-'+(index+1)+'-共'+parts.length+'份.json','application/json');
   updateStatus(status,'备份已下载，包含正文、原始附件及可编辑图稿（含回收站）。','success');
  }
  if(parts.length===1){await savePart(parts[0],0);return;}
  backupParts.replaceChildren(...parts.map((part,index)=>Button({text:'下载第 '+(index+1)+' / '+parts.length+' 份（'+part.length+' 篇）',on:{click:()=>action(async()=>{await savePart(part,index);backupParts.children[index].textContent='已下载第 '+(index+1)+' / '+parts.length+' 份（可再次下载）';})}})));
  backupModal.open();
 }
 const importFile=Input({id:'notebook-import',type:'file',attrs:{accept:'.json,.md,text/markdown,application/json'}});
 importFile.addEventListener('change',()=>action(async()=>{const file=importFile.files?.[0];importFile.value='';if(!file)return;if(file.size>MAX_BACKUP)throw Error('导入文件最多 128 MB。');await flush();const text=await file.text();
  const records=/\.md$/i.test(file.name)?[importMarkdown(text,file.name.replace(/\.md$/i,''))]:parseBackup(text).map(n=>({...n,id:newId(),title:n.title.slice(0,110)+'（导入）',revision:1}));
  await store.importCopies(records);await refresh();if(records.some(n=>!n.deletedAt))await select(records.find(n=>!n.deletedAt));updateStatus(status,`已导入 ${records.length} 篇笔记，原有笔记保留；回收站记录仍在回收站。`,'success');
 }));
 const file=Input({id:'notebook-file',type:'file',attrs:{multiple:true}});
 file.addEventListener('change',()=>{const selected=Array.from(file.files||[]);file.value='';attach(selected);});
 let deleteTarget=null;
 const deleteButton=Button({id:'notebook-delete-note',text:'删除笔记',disabled:true,on:{click:()=>requestDelete().catch(report)}});
 async function requestDelete(){const id=active?.id;if(!id)return;
  // Navigation flushes and leaves the drawing controller before deletion.
  // Never await graphics from the notebook transaction queue.
  if(view!=='notes'){await navigate('notebook');if(disposed||panel.hidden||view!=='notes')return;}
  return action(async()=>{await flush();if(active?.id!==id)throw Error('当前笔记已切换，请重新选择后再删除。');deleteTarget=id;deleteTitle.textContent=`删除「${active.title}」？`;deleteModal.open();});
 }
 const fileActions=Button({text:'导入 / 导出',id:'notebook-actions',on:{click:openFiles}});
 const addFile=Button({text:'添加附件',on:{click:()=>{if(active)file.click();}}});
 const heading=ToolHeader({className:'page-heading chronicle-heading',title:'笔记本'}),helpButton=Button({text:'使用说明'}),help=ToolHelp({id:'notebook-help',hidden:true,children:[Box({tag:'ol',children:[
  Box({tag:'li',text:'新建笔记后直接输入。工具栏可切换即时渲染、所见即所得、分屏预览，或打开图表、大纲、全屏。“更多”中提供表情、公式、录音、代码配色和格式检查。'}),
  Box({tag:'li',text:'支持标题、表格、待办、引用、脚注、目录、代码高亮、KaTeX 公式，以及 Mermaid、Markmap、Graphviz、流程图、五线谱、化学结构和波形图。ECharts、脑图数据和 WaveDrom 只接受 JSON，不执行脚本。'}),
  Box({tag:'li',text:'工具结果的“加入笔记本”可追加至已有笔记或新建笔记，记录来源和完整结果。图片和文件原始字节保存在附件中。'}),
  Box({tag:'li',text:'“插入脑图”和“插入线索白板”直接在当前笔记中创建可编辑内容；没有笔记时会新建一篇。编辑后点击“返回笔记”，正文中的预览图和可编辑图稿链接可再次打开。'}),
  Box({tag:'li',text:'选中笔记后，可在笔记列表上方点击“删除笔记”，确认后移入回收站，可恢复正文、附件、脑图和白板；仅“彻底删除”不可撤销。笔记仅存在当前浏览器和当前网站地址下，不会上传或跨设备同步，请定期备份。'}),
  Box({tag:'li',text:'顶部“导入 / 导出”可保存 Markdown、独立 HTML，或打印 / 另存 PDF。“完整备份当前笔记”与“备份全部笔记”包含正文、附件、可编辑脑图和白板。全部备份包含回收站；超过单文件限额时分批下载，所有分批文件都需保留。导入备份会创建副本，不覆盖现有笔记。录音需要主动授权麦克风，完成后保存在当前笔记附件中。'}),
  Box({tag:'li',text:'图片和文件可用工具栏附件按钮、拖入或粘贴加入；富文本粘贴会转换为 Markdown。外链图片不自动加载，PlantUML 保留源码并提示其需要外部服务。'}),
  Box({tag:'li',text:'单篇正文最多 2 MB，单附件 32 MB，单篇合计 64 MB，最多 500 篇（含回收站）。'})
 ]})]});
 // Finish the notebook action before entering graphics: graphics commits use
 // this same transaction queue, so awaiting them inside it would deadlock.
 function insertGraphic(kind){let noteId,ready=false;action(async()=>{await flush();noteId=active?.id;ready=true;}).then(()=>{if(ready)return createGraphic(kind,noteId);}).catch(report);}
 function afterNotebook(prepare,next){let value,ready=false;action(async()=>{value=await prepare();ready=true;}).then(()=>{if(ready&&!disposed)return next(value);}).catch(report);}
 function openFiles(){if(view==='notes'){filesModal.open();return;}afterNotebook(()=>flush(),async()=>{await navigate('notebook');await action(async()=>filesModal.open());});}
 function editDrawing(noteId,id){afterNotebook(()=>flush(),()=>openGraphic(noteId,id));}
 function switchView(target){afterNotebook(async()=>{await flush();return active&&drawingsIn(active).find(entry=>entry.drawing.kind===target.id);},entry=>entry?openGraphic(entry.noteId,entry.drawing.id):navigate(target.route));}
 const viewButtons=notebookViews.map(target=>Button({text:target.title,variant:'choice',attrs:{'data-notebook-view-link':target.id,'aria-pressed':String(target.id==='notes')},on:{click:()=>switchView(target)}}));
 const viewBar=Toolbar({attrs:{'aria-label':'笔记本视图',role:'group'},children:viewButtons});
 const notebookHelp=[...help.childNodes],graphicHelp=new Map(['mindmap','whiteboard'].map(kind=>[kind,createToolHelpContent(kind,drawingName(kind))]));
 const graphicsHost=Box({id:'notebook-graphics',className:'notebook-graphics',hidden:true});
 const documentCard=Card({className:'surface notebook-document',children:[Box({className:'notebook-document-heading',children:[title,Toolbar({children:[status,retry]})]}),empty,content]});
 const drawingList=Result({id:'notebook-drawings',layout:'collection',hidden:true,attrs:{'aria-label':'当前笔记的图稿'}});
 heading.append(Toolbar({className:'heading-actions',children:[add,Button({text:'插入脑图',on:{click:()=>insertGraphic('mindmap')}}),Button({text:'插入线索白板',on:{click:()=>insertGraphic('whiteboard')}}),fileActions,helpButton]}));disclosureController(helpButton,help);
 const compactIndex=Disclosure({className:'notebook-compact-index',hidden:true,children:[Box({tag:'summary',text:'笔记列表与图稿'})]});
 const notebookIndex=Card({className:'surface notebook-index',children:[SearchField({label:'搜索笔记',control:search}),Toolbar({children:[deleteButton,Button({text:'回收站',on:{click:()=>action(async()=>{await flush();await refreshTrash();trashModal.open();})}})]}),list,drawingList]});
 const notebookLayout=Box({className:'notebook-layout',children:[notebookIndex,Box({className:'notebook-workspace',children:[documentCard,graphicsHost]})]});
 const panel=ToolPanel({id:'panel-notebook',className:'panel site-page',hidden:true,children:[heading,help,viewBar,
  Box({hidden:true,children:[importFile,file]}),
  compactIndex,notebookLayout]});main.append(panel);
 const noteGraphicButtons=['mindmap','whiteboard'].map(kind=>Button({text:'正文加入'+drawingName(kind),disabled:true,on:{click:()=>afterNotebook(async()=>{if(!active)throw Error('请先新建或打开笔记。');await flush();capture();return structuredClone(active);},note=>sendNoteToGraphic(kind,note))}}));
 const filesClose=Button({text:'关闭'}),filesDialog=Dialog({id:'notebook-actions-dialog',className:'ui-flow-dialog',attrs:{'aria-labelledby':'notebook-actions-title'},children:[Toolbar({children:[Box({tag:'h2',id:'notebook-actions-title',text:'笔记文件'}),filesClose]}),Box({tag:'h3',text:'当前笔记'}),Toolbar({children:[backupOne,exportMD,exportPage,print,addFile,...noteGraphicButtons]}),Box({tag:'h3',text:'全部笔记'}),Toolbar({children:[backup,Button({text:'导入笔记 / 备份',on:{click:()=>importFile.click()}})]})]});document.body.append(filesDialog);const filesModal=dialogController(filesDialog,{closeButton:filesClose,initialFocus:filesClose});
 filesDialog.addEventListener('click',e=>{if(e.target.closest('button')&&e.target!==filesClose)filesModal.close();});
 const deleteTitle=Box({tag:'h2',id:'notebook-delete-title'}),deleteClose=Button({text:'取消'}),deleteConfirm=Button({text:'确认删除',on:{click:()=>action(async()=>{const id=deleteTarget;if(!id||active?.id!==id)throw Error('当前笔记已切换，请重新选择后再删除。');await flush();if(active?.id!==id)throw Error('当前笔记已切换，请重新选择后再删除。');const target=active;await store.remove(target);active=null;activeDrawingId=null;needsEditorSync=false;dirty=false;editRevision++;recorder.close();deleteModal.close();editor?.enable(false);await refresh();if(notes.length)await select(await store.get(notes[0].id));else{editor?.set({markdown:'',assets:[]});display();updateStatus(status,'笔记已移入回收站');}})}});
 const deleteDialog=Dialog({id:'notebook-delete',attrs:{'aria-labelledby':'notebook-delete-title','aria-describedby':'notebook-delete-description'},children:[deleteTitle,Box({tag:'p',id:'notebook-delete-description',text:'这篇笔记的正文、附件、脑图和线索白板将一起移入回收站，可随时恢复。回收站不会自动清理。'}),Toolbar({children:[deleteClose,deleteConfirm]})]});document.body.append(deleteDialog);const deleteModal=dialogController(deleteDialog,{closeButton:deleteClose,initialFocus:deleteClose});
 const backupParts=Result({layout:'collection'}),backupClose=Button({text:'关闭'}),backupDialog=Dialog({id:'notebook-backup-parts',attrs:{'aria-labelledby':'notebook-backup-title'},children:[Toolbar({children:[Box({tag:'h2',id:'notebook-backup-title',text:'分批完整备份'}),backupClose]}),Box({tag:'p',text:'请逐份下载并保留全部文件。每份都能独立导入，包含对应笔记的完整正文、附件和可编辑图稿。'}),backupParts]});document.body.append(backupDialog);const backupModal=dialogController(backupDialog,{closeButton:backupClose,initialFocus:backupClose});
 const trashList=Result({layout:'collection'}),trashClose=Button({text:'关闭'}),trashStatus=Status(),trashDialog=Dialog({id:'notebook-trash',attrs:{'aria-labelledby':'notebook-trash-title'},children:[Toolbar({children:[Box({tag:'h2',id:'notebook-trash-title',text:'回收站'}),trashClose]}),Box({tag:'p',text:'笔记及附件会一直保留，直到你主动彻底删除。完整备份包含回收站。'}),trashList,trashStatus]});document.body.append(trashDialog);const trashModal=dialogController(trashDialog,{closeButton:trashClose,initialFocus:trashClose});
 let purgeTarget=null;
 const purgeText=Box({tag:'p'}),purgeCancel=Button({text:'取消'}),purgeConfirm=Button({text:'彻底删除',on:{click:()=>action(async()=>{try{if(!purgeTarget)return;await store.purge(purgeTarget);purgeModal.close();await refreshTrash();updateStatus(trashStatus,'已彻底删除。');}catch(error){purgeModal.close();updateStatus(trashStatus,error.message,'error');}})}});
 const purgeDialog=Dialog({id:'notebook-purge',attrs:{'aria-labelledby':'notebook-purge-title'},children:[Box({tag:'h2',id:'notebook-purge-title',text:'彻底删除笔记'}),purgeText,Toolbar({children:[purgeCancel,purgeConfirm]})]});document.body.append(purgeDialog);const purgeModal=dialogController(purgeDialog,{closeButton:purgeCancel,initialFocus:purgeCancel});
 async function refreshTrash(){
  const rows=await store.summaries({trash:true});trashList.replaceChildren(...rows.map(n=>Box({children:[Box({tag:'strong',text:n.title}),Box({tag:'p',text:'删除于 '+new Date(n.deletedAt).toLocaleString('zh-CN')+' · '+n.assetCount+' 个附件'}),Toolbar({children:[Button({text:'恢复',attrs:{'aria-label':'恢复 '+n.title},on:{click:()=>action(async()=>{try{await store.restore(n);await refresh();await refreshTrash();updateStatus(trashStatus,'笔记已恢复，可在笔记列表中打开。','success');}catch(error){updateStatus(trashStatus,error.message,'error');}})}}),Button({text:'彻底删除',attrs:{'aria-label':'彻底删除 '+n.title},on:{click:()=>{purgeTarget=n;purgeText.textContent='彻底删除「'+n.title+'」及其全部附件、脑图和白板？此操作无法撤销，请先备份。';purgeModal.open();}}})]})]})));
  if(!rows.length)trashList.append(EmptyState({text:'回收站为空'}));
 }
 function report(error){retry.hidden=false;updateStatus(status,(error?.message||'操作失败。')+' 当前编辑仍保留，可导出后重试。','error');}
 function action(fn){const run=async()=>{if(disposed)return;try{await fn();}catch(error){report(error);}};actionTail=actionTail.then(run,run);return actionTail;}
 function capture(){if(!active)return;active={...active,title:title.value.trim().slice(0,120)||'未命名笔记',markdown:editor&&!needsEditorSync?editor.get():active.markdown,updated:dirty?new Date().toISOString():active.updated};}
 function markDirty(){if(!active||needsEditorSync)return;dirty=true;editRevision++;updateStatus(status,'尚未保存…');clearTimeout(timer);timer=setTimeout(()=>flush().catch(report),250);}
 function flush(){clearTimeout(timer);const work=async()=>{while(active&&dirty){capture();const target=active,rev=editRevision;validateNote(target);const saved=await store.save(target);
   notes=notes.filter(n=>n.id!==saved.id);notes.unshift(noteSummary(saved));if(active?.id===saved.id){active.revision=saved.revision;if(rev===editRevision){dirty=false;retry.hidden=true;updateStatus(status,'已保存到本机','success');}}else break;if(search.value.trim())findNotes();else drawList(false);}};
  saveTail=saveTail.catch(()=>{}).then(work);return saveTail;
 }
 let searchRevision=0,searchTimer,searchMatches=null;
 function drawList(motion=true){const query=search.value.trim().toLocaleLowerCase(),filtered=query?(searchMatches||notes.filter(n=>n.title.toLocaleLowerCase().includes(query))):notes;
  const updateList=()=>list.replaceChildren(...filtered.map(n=>Button({layout:'stacked',variant:'choice',attrs:{'data-note-id':n.id,'aria-pressed':String(active?.id===n.id)},children:[Box({tag:'strong',text:n.title}),Box({tag:'span',text:new Date(n.updated).toLocaleDateString('zh-CN')+' · '+n.assetCount+' 个附件'})],on:{click:()=>afterNotebook(async()=>{await flush();const latest=await store.get(n.id);if(!latest)throw Error('笔记已被删除，请刷新列表。');await select(latest);},()=>navigate('notebook'))}})));
  if(motion&&!query)animateCollection(list,updateList,{key:node=>node.dataset.noteId});else updateList();
  const drawings=active?drawingsIn(active):[];drawingList.hidden=!drawings.length;drawingList.replaceChildren(...drawings.map(entry=>Button({layout:'stacked',variant:'choice',attrs:{'data-notebook-drawing':entry.drawing.id,'aria-pressed':String(view!=='notes'&&activeDrawingId===entry.drawing.id)},children:[Box({tag:'strong',text:entry.drawing.title}),Box({tag:'span',text:drawingName(entry.drawing.kind)})],on:{click:()=>editDrawing(entry.noteId,entry.drawing.id)}})));
  if(!filtered.length)list.append(EmptyState({text:query?'没有匹配的笔记':'尚未创建笔记'}));
 }
 function download(value,name,type){const url=URL.createObjectURL(value instanceof Blob?value:new Blob([value],{type})),a=Box({tag:'a',attrs:{href:url,download:name.replace(/[\\/:*?"<>|]/g,'_')}});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 let attachmentURLs=[];
 function display(){for(const button of noteGraphicButtons)button.disabled=!active;for(const url of attachmentURLs)URL.revokeObjectURL(url);attachmentURLs=[];attachments.replaceChildren();content.hidden=!active;empty.hidden=!!active;backupOne.disabled=exportMD.disabled=exportPage.disabled=print.disabled=deleteButton.disabled=addFile.disabled=title.disabled=!active;if(!active){title.value='';return;}
  title.value=active.title;
  const drawings=drawingsIn(active);
  for(const asset of active.assets){const info=snapshot(asset),row=Box({className:'notebook-attachment'}),label=Box({tag:'strong',text:asset.name}),drawing=drawings.find(entry=>entry.drawing.id===asset.id||entry.drawing.previewId===asset.id);
   if(info.mime.startsWith('image/')){const url=URL.createObjectURL(new Blob([asset.bytes],{type:info.mime}));attachmentURLs.push(url);row.append(Box({tag:'img',attrs:{src:url,alt:asset.name,loading:'lazy'}}));}
   if(/^(?:audio\/(?:webm|ogg|mpeg|wav|mp4)|video\/(?:webm|mp4))(?:;|$)/i.test(asset.mime)){const url=URL.createObjectURL(new Blob([asset.bytes],{type:asset.mime}));attachmentURLs.push(url);row.append(Box({tag:asset.mime.startsWith('audio/')?'audio':'video',attrs:{controls:true,preload:'metadata',src:url,'aria-label':asset.name}}));}
   row.append(label,Box({tag:'span',text:asset.bytes.length.toLocaleString()+' 字节'}));
   if(drawing)row.append(Button({text:'编辑'+drawingName(drawing.drawing.kind),attrs:{'data-edit-drawing':drawing.drawing.id},on:{click:()=>editDrawing(active.id,drawing.drawing.id)}}));
   row.append(Button({text:'下载原始附件',on:{click:()=>download(asset.bytes,asset.name,'application/octet-stream')}}));attachments.append(row);
  }
 }
 async function ensureEditor(){if(editor)return editor;if(loadingEditor)return loadingEditor;
  loadingEditor=createNoteEditor(host,{change:()=>{if(active&&editor&&!needsEditorSync&&editor.get()!==active.markdown){markDirty();capture();}},dirty:markDirty,attach,openAttachment:()=>file.click(),openAsset:id=>{const entry=active&&drawingsIn(active).find(e=>e.drawing.id===id||e.drawing.previewId===id);if(!entry)return false;editDrawing(active.id,entry.drawing.id);return true;},record:()=>{if(active)recorder.open(active.id);},exportNote:()=>filesModal.open()}).then(value=>{if(disposed)value.destroy();else editor=value;return value;}).finally(()=>{loadingEditor=null;});return loadingEditor;
 }
 async function select(note){active=structuredClone(note);dirty=false;editRevision++;display();drawList();updateStatus(status,'正在打开笔记…');
  const id=active.id;const ed=await ensureEditor();if(disposed||active?.id!==id)return;needsEditorSync=false;ed.set(active);ed.enable(true);if(!dirty)updateStatus(status,'已保存到本机','success');
 }
 async function refresh(){notes=await store.summaries();searchMatches=null;drawList();if(search.value.trim())findNotes();}
 function findNotes(){const rev=++searchRevision,query=search.value.trim();clearTimeout(searchTimer);searchMatches=null;drawList();if(!query)return;
  searchTimer=setTimeout(async()=>{try{const matches=await store.search(query);if(!disposed&&rev===searchRevision){searchMatches=matches;drawList();}}catch(error){if(rev===searchRevision)report(error);}},180);
 }
 function attach(files){return action(async()=>{if(!active)return;const id=active.id,results=[];for(const f of files){if(f.size>MAX_ASSET)throw Error('单附件最多 32 MB。');const data=snapshot({bytes:new Uint8Array(await f.arrayBuffer()),name:f.name});if(/^(?:audio\/(?:webm|ogg|mpeg|wav|mp4)|video\/(?:webm|mp4))(?:;|$)/i.test(f.type))data.mime=f.type;results.push(data);}if(disposed||active?.id!==id)return;capture();let next=active;for(const data of results)next=appendResult(next,data,{title:data.name,tool:'本地附件'});active=next;editor?.set(active);display();markDirty();await flush();});}
 title.addEventListener('input',markDirty);search.addEventListener('input',findNotes);
 const onPanel=e=>{if(docked&&e.detail.name!=='notebook')return;if(e.detail.name==='notebook'){view=e.detail.notebookView||'notes';if(view==='notes')activeDrawingId=null;documentCard.hidden=view!=='notes';graphicsHost.hidden=view==='notes';for(const button of viewButtons)button.setAttribute('aria-pressed',String(button.dataset.notebookViewLink===view));help.replaceChildren(...(graphicHelp.get(view)||notebookHelp));helpButton.setAttribute('aria-label',(view==='notes'?'笔记本':drawingName(view))+'使用说明');action(async()=>{await refresh();if(active){if(needsEditorSync&&view==='notes'){needsEditorSync=false;const ed=await ensureEditor();ed.set(active);}if(dirty)capture();display();if(!dirty)updateStatus(status,'已保存到本机','success');}else if(notes.length)await select(await store.get(notes[0].id));else updateStatus(status,'笔记保存在此浏览器中。');});}if(e.detail.name!=='notebook'||view!=='notes'){recorder.close();editor?.suspend();attachments.querySelectorAll('audio,video').forEach(n=>n.pause());flush().catch(report);}};
 document.addEventListener('arg:panelchange',onPanel);
 const onHide=()=>{if(document.visibilityState==='hidden')flush().catch(report);};document.addEventListener('visibilitychange',onHide);
 const beforeUnload=e=>{if(dirty){flush().catch(report);e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',beforeUnload);

 // Source result capture is a named, explicit bridge. Never read text from the
 // rendered result DOM; validate source ownership before and after async reads.
 const captureTitle=Box({tag:'h2',id:'notebook-capture-title',text:'加入笔记本'}),captureClose=Button({text:'关闭'}),destination=Select({id:'notebook-destination',attrs:{'aria-label':'目标笔记'}}),entryTitle=Input({id:'notebook-entry-title',attrs:{maxlength:120,'aria-label':'记录标题'}}),comment=Input({id:'notebook-comment',placeholder:'可选：写下你的想法',attrs:{'aria-label':'备注',maxlength:2000}}),fileChoice=Select({id:'notebook-result-file',attrs:{'aria-label':'选择要保存的结果'}}),captureStatus=Status({id:'notebook-capture-status'});
 const capturePreview=Box({tag:'pre',className:'notebook-capture-preview'});
 let request=null,items=[],captured=null,sourceInfo=null,captureRevision=0;
 const submit=Button({id:'notebook-capture-save',text:'保存到笔记',variant:'primary',disabled:true,on:{click:()=>action(async()=>{
  const rev=captureRevision;if(!captured||!request?.isCurrent()){updateStatus(captureStatus,'来源结果已改变，请关闭后重新执行。','error');return;}submit.disabled=true;
  try{await flush();if(rev!==captureRevision||!request?.isCurrent())throw Error('来源结果已失效。');let note=destination.value?await store.get(destination.value):newNote(entryTitle.value||sourceInfo.tool);
   if(!note)throw Error('目标笔记已被删除，请重新选择。');const next=appendResult(note,captured,{title:entryTitle.value||sourceInfo.tool,...sourceInfo,comment:comment.value});
   const saved=await store.save(next);await refresh();if(active?.id===saved.id){active=saved;editor?.set(active);display();dirty=false;}
   captured=null;request=null;updateStatus(captureStatus,'已加入笔记本','success');openSaved.hidden=false;openSaved.onclick=()=>{captureModal.close();action(async()=>{await select(saved);await navigate('notebook');});};
  }catch(error){updateStatus(captureStatus,error.message,'error');submit.disabled=!captured;}
 })}}),openSaved=Button({text:'查看笔记',hidden:true});
 const captureDialog=Dialog({id:'notebook-capture',className:'ui-flow-dialog',attrs:{'aria-labelledby':'notebook-capture-title'},children:[Toolbar({children:[captureTitle,captureClose]}),Field({label:'保存位置',control:destination}),Field({label:'记录标题',control:entryTitle}),fileChoice,capturePreview,comment,Toolbar({children:[submit,openSaved]}),captureStatus]});document.body.append(captureDialog);const captureModal=dialogController(captureDialog,{closeButton:captureClose,initialFocus:destination});
 async function pick(index,rev){try{submit.disabled=true;captured=null;const item=items[index];if(item instanceof Blob&&item.size>MAX_ASSET)throw Error('结果超过 32 MB。');const raw=item instanceof Blob?{bytes:new Uint8Array(await item.arrayBuffer()),name:item.name}:item;
  if(rev!==captureRevision)return;if(!request?.isCurrent())throw Error('来源结果已改变，请重新执行。');captured=snapshot(raw);capturePreview.textContent=captured.mime.startsWith('text/')?captured.text.slice(0,500)+(captured.text.length>500?'\n…（保存完整内容）':''):`${captured.name} · ${captured.bytes.length.toLocaleString()} 字节`;submit.disabled=false;
 }catch(error){if(rev===captureRevision)updateStatus(captureStatus,error.message,'error');}}
 fileChoice.addEventListener('change',()=>pick(Number(fileChoice.value),++captureRevision));
 const disconnect=connectNotebook(async value=>{request=value;captured=null;items=[];const rev=++captureRevision;entryTitle.value='工具结果';comment.value='';capturePreview.textContent='';submit.disabled=true;openSaved.hidden=true;fileChoice.hidden=true;updateStatus(captureStatus,'正在读取结果…');captureModal.open();
  try{sourceInfo=current();entryTitle.value=sourceInfo.tool;await flush();const result=await value.read();await refresh();if(rev!==captureRevision)return;if(!value.isCurrent())throw Error('来源结果已改变，请重新执行。');destination.replaceChildren(Option('新建笔记',''),...notes.map(n=>Option(n.title,n.id)));if(active)destination.value=active.id;
   items=result?.files?.length?[...result.files]:[result];fileChoice.replaceChildren(...items.map((n,i)=>Option(n.name||`结果 ${i+1}`,String(i))));fileChoice.hidden=items.length<2;updateStatus(captureStatus,'');await pick(0,rev);
  }catch(error){if(rev===captureRevision)updateStatus(captureStatus,error.message,'error');}
 });
 captureDialog.addEventListener('close',()=>{captureRevision++;request=null;captured=null;items=[];});
 onDisconnect(panel,()=>{disposed=true;clearTimeout(timer);clearTimeout(searchTimer);searchRevision++;recorder.destroy();editor?.destroy();for(const url of attachmentURLs)URL.revokeObjectURL(url);disconnect();captureModal.destroy();deleteModal.destroy();filesModal.destroy();trashModal.destroy();purgeModal.destroy();backupModal.destroy();trashDialog.remove();purgeDialog.remove();backupDialog.remove();captureDialog.remove();deleteDialog.remove();filesDialog.remove();document.removeEventListener('arg:panelchange',onPanel);document.removeEventListener('visibilitychange',onHide);window.removeEventListener('beforeunload',beforeUnload);store.close();});
 display();
 // Public transaction service for editable drawings. Refetch the latest note,
 // flush any Vditor draft first, and use the same optimistic store revision.
 function update(id,mutate,{title='未命名笔记'}={}){const work=actionTail.catch(()=>{}).then(async()=>{await flush();const editorRevision=editRevision;const note=id?await store.get(id):newNote(title);if(!note)throw Error('所属笔记已被删除。');const saved=await store.save(mutate(structuredClone(note)));notes=notes.filter(n=>n.id!==saved.id);notes.unshift(noteSummary(saved));if(active?.id===saved.id){if(editRevision===editorRevision){active=saved;dirty=false;if(panel.hidden||view!=='notes'){needsEditorSync=true;}else{editor?.set(active);display();}}else report(Error('保存图稿时正文也发生了修改。当前正文草稿已保留，请先导出，再重新打开笔记。'));}if(search.value.trim())findNotes();else drawList();return saved;});actionTail=work.catch(()=>{});return work;}
 return{panel,graphicsHost,flush,update,
  setDocked(value){docked=value;compactIndex.hidden=!value;if(value)compactIndex.append(notebookIndex);else notebookLayout.prepend(notebookIndex);if(!value){recorder.close();editor?.suspend();attachments.querySelectorAll('audio,video').forEach(n=>n.pause());flush().catch(report);}},
  activate(){onPanel({detail:{name:'notebook',notebookView:'notes'}});},
  currentId:()=>active?.id||null,focus:async(id,drawingId)=>{await flush();const note=await store.get(id);if(!note)throw Error('所属笔记已被删除。');active=structuredClone(note);activeDrawingId=drawingId||null;dirty=false;editRevision++;needsEditorSync=true;display();drawList();},list:async()=>{await flush();return store.list();},read:async id=>{await flush();return store.get(id);},show:async id=>{await flush();const note=await store.get(id);if(!note)throw Error('笔记已被删除。');await select(note);await navigate('notebook');}};
}
