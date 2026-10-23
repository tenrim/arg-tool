import {validateNote,noteSummary,MAX_NOTES} from './model.js';
export const DB_NAME='mist-notebook-v1';
export function createNotebookStore(factory=globalThis.indexedDB){
 let opening;
 function open(){if(opening)return opening;opening=new Promise((resolve,reject)=>{
  if(!factory){reject(Error('浏览器无法使用本机笔记存储。'));return;}
  const req=factory.open(DB_NAME,2);let finished=false;
  const timer=setTimeout(()=>{finished=true;reject(Error('笔记存储被其他窗口占用，请关闭旧窗口后重试。'));},5000);
  req.onupgradeneeded=()=>{
   const db=req.result,notes=db.objectStoreNames.contains('notes')?req.transaction.objectStore('notes'):db.createObjectStore('notes',{keyPath:'id'});
   const index=db.createObjectStore('note-index',{keyPath:'id'});
   // Upgrade atomically, one old record at a time; original bytes never change.
   const cursor=notes.openCursor();cursor.onsuccess=()=>{const row=cursor.result;if(row){index.put(noteSummary(row.value));row.continue();}};
  };
  req.onerror=()=>{clearTimeout(timer);reject(req.error);};req.onsuccess=()=>{clearTimeout(timer);if(finished){req.result.close();return;}const db=req.result;db.onversionchange=()=>{db.close();opening=null;};resolve(db);};
 }).catch(error=>{opening=null;throw error;});return opening;}
 async function transaction(mode,body,names=['notes','note-index']){const db=await open();return new Promise((resolve,reject)=>{
  const tx=db.transaction(names,mode),store=tx.objectStore(names[0]),index=names.includes('note-index')?tx.objectStore('note-index'):null;let result,error;
  tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(error||tx.error||Error('笔记未保存，可能空间不足。'));tx.onerror=()=>{};
  const fail=e=>{error=e;try{tx.abort();}catch{/* already aborted */}};
  const read=(request,fn)=>{request.onsuccess=e=>{try{fn(e.target.result);}catch(error){fail(error);}};};
  try{body(store,value=>{result=value;},fail,read,index);}catch(e){fail(e);}
 });}
 const order=rows=>rows.sort((a,b)=>b.updated.localeCompare(a.updated));
 // Full reads remain explicit for drawing consumers, never note lists.
 const list=()=>transaction('readonly',(s,done,_fail,read)=>read(s.getAll(),rows=>done(order(rows.filter(n=>!n.deletedAt)))),['notes']);
 const summaries=({trash=false,includeDeleted=false}={})=>transaction('readonly',(s,done,_fail,read)=>read(s.getAll(),rows=>done(order(rows.filter(n=>includeDeleted||Boolean(n.deletedAt)===trash)))) ,['note-index']);
 const search=query=>transaction('readonly',(s,done,_fail,read)=>{const matches=[],term=query.toLocaleLowerCase();read(s.openCursor(),row=>{if(!row){done(order(matches));return;}const n=row.value;if(!n.deletedAt&&(n.title+'\n'+n.markdown).toLocaleLowerCase().includes(term))matches.push(noteSummary(n));row.continue();});},['notes']);
 const get=(id,{includeDeleted=false}={})=>transaction('readonly',(s,done,_fail,read)=>read(s.get(id),n=>done(n&&(!n.deletedAt||includeDeleted)?n:undefined)),['notes']);
 const save=note=>{validateNote(note);if(note.deletedAt)return Promise.reject(Error('请先从回收站恢复笔记。'));return transaction('readwrite',(s,done,fail,read,index)=>read(s.get(note.id),old=>{
  if(old?.deletedAt||(old?.revision||0)!==note.revision||(note.revision>0&&!old)){fail(Error('这篇笔记已在其他窗口修改或删除。请导出当前内容，再重新打开笔记。'));return;}
  read(s.count(),count=>{if(!old&&count>=MAX_NOTES){fail(Error('最多保存 500 篇笔记（含回收站），请先备份或清理回收站。'));return;}
   const saved={...note,revision:note.revision+1};s.put(saved);index.put(noteSummary(saved));done(saved);});
 }));};
 function change(note,kind){return transaction('readwrite',(s,done,fail,read,index)=>read(s.get(note.id),old=>{
  if(!old||old.revision!==note.revision||Boolean(old.deletedAt)!==(kind!=='trash')){fail(Error('笔记已改变，请刷新列表后重试。'));return;}
  if(kind==='purge'){s.delete(old.id);index.delete(old.id);done(true);return;}
  const next={...old,revision:old.revision+1};if(kind==='trash')next.deletedAt=new Date().toISOString();else delete next.deletedAt;
  s.put(next);index.put(noteSummary(next));done(next);
 }));}
 const remove=note=>change(note,'trash'),restore=note=>change(note,'restore'),purge=note=>change(note,'purge');
 const importCopies=notes=>{notes.forEach(validateNote);return transaction('readwrite',(s,done,fail,read,index)=>read(s.count(),count=>{if(count+notes.length>MAX_NOTES){fail(Error('导入后超过 500 篇笔记（含回收站）。'));return;}for(const n of notes){s.add(n);index.add(noteSummary(n));}done(notes);}));};
 return{list,summaries,search,get,save,remove,restore,purge,importCopies,close:async()=>{if(opening)(await opening).close();opening=null;}};
}
