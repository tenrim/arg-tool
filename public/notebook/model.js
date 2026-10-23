import {mapAttachmentURLs} from './references.js';
// Notebook documents are private data. No routes, preference storage or UI here.
export const MAX_TEXT=2*1024*1024, MAX_ASSET=32*1024*1024, MAX_NOTE=64*1024*1024, MAX_BACKUP=128*1024*1024, MAX_NOTES=500;
const idPattern=/^[a-z0-9-]{1,80}$/i;
const validId=value=>typeof value==='string'&&idPattern.test(value);
export const newId=()=>crypto.randomUUID();
// The index never contains document text or attachment bytes.
export function noteSummary(note){return {id:note.id,title:note.title,created:note.created,updated:note.updated,revision:note.revision,assetCount:note.assets.length,byteSize:new TextEncoder().encode(note.markdown).length+note.assets.reduce((n,a)=>n+a.bytes.length,0),backupSize:4096+note.markdown.length*6+note.assets.reduce((n,a)=>n+Math.ceil(a.bytes.length/3)*4+2048,0),...(note.deletedAt?{deletedAt:note.deletedAt}:{})};}
export function backupGroups(summaries,limit=MAX_BACKUP){
 const groups=[];let group=[],size=1024;
 for(const item of summaries){if(item.backupSize+1024>limit)throw Error('单篇备份超过限制，请先导出该笔记。');if(size+item.backupSize>limit){groups.push(group);group=[];size=1024;}group.push(item);size+=item.backupSize;}
 if(group.length)groups.push(group);return groups;
}
export function newNote(title='未命名笔记') {const now=new Date().toISOString();return{id:newId(),title:title.trim().slice(0,120)||'未命名笔记',markdown:'',assets:[],created:now,updated:now,revision:0};}
export function validateNote(value){
 if(value?.deletedAt!==undefined&&(typeof value.deletedAt!=='string'||!Number.isFinite(Date.parse(value.deletedAt))))throw Error('回收站记录时间无效。');
 if(!value||!validId(value.id)||typeof value.title!=='string'||value.title.length>120||typeof value.markdown!=='string'||new TextEncoder().encode(value.markdown).length>MAX_TEXT||!Array.isArray(value.assets)||value.assets.length>100||!Number.isInteger(value.revision)||value.revision<0||![value.created,value.updated].every(t=>typeof t==='string'&&Number.isFinite(Date.parse(t))))throw Error('笔记格式无效，或正文超过 2 MB。');
 let total=new TextEncoder().encode(value.markdown).length;const ids=new Set();
 for(const a of value.assets){if(!a||!validId(a.id)||ids.has(a.id)||typeof a.name!=='string'||a.name.length>180||typeof a.mime!=='string'||a.mime.length>100||!(a.bytes instanceof Uint8Array)||a.bytes.length>MAX_ASSET)throw Error('笔记附件无效，或单个附件超过 32 MB。');ids.add(a.id);total+=a.bytes.length;}
 if(total>MAX_NOTE)throw Error('单篇笔记及附件最多 64 MB。');return value;
}
export const escapeMarkdown=value=>String(value).replace(/[\\`*_{}\[\]()<>#+.!|~-]/g,'\\$&').replace(/[\r\n]+/g,' ');
export function fenced(text){let longest=2;for(const match of text.matchAll(/`+/g))longest=Math.max(longest,match[0].length);const fence='`'.repeat(longest+1);return fence+'text\n'+text+'\n'+fence;}
export function appendResult(note,data,{title='工具结果',tool='工具结果',route='',comment=''}={}){
 const next=structuredClone(note),asset={id:newId(),name:data.name||'处理结果.bin',mime:data.mime,bytes:data.bytes.slice()};
 next.assets.push(asset);
 // Only the registered tool identity can appear in a source link, never input.
 const safeRoute=/^[a-z][\w/-]*(?:\?(?:task|op|dir)=[^#\s]*)?$/.test(route)?route:'';
 const source=safeRoute?`[${escapeMarkdown(tool)}](#${safeRoute})`:escapeMarkdown(tool);
 let body=data.mime.startsWith('text/')&&data.text!==null?fenced(data.text):data.mime.startsWith('image/')?`![${escapeMarkdown(asset.name)}](notebook-asset:${asset.id})`:`[${escapeMarkdown(asset.name)}](notebook-asset:${asset.id})`;
 // Very large text remains a complete downloadable attachment, not a truncated result.
 if(new TextEncoder().encode(body).length>MAX_TEXT/2)body=`[${escapeMarkdown(asset.name)}](notebook-asset:${asset.id})`;
 next.markdown+=`${next.markdown?'\n\n':''}## ${escapeMarkdown(title)}\n\n> 来源：${source} · ${new Date().toLocaleString('zh-CN')}\n\n${body}\n${comment?'\n'+fenced(comment)+'\n':''}`;
 next.updated=new Date().toISOString();return validateNote(next);
}
export function exportBackup(notes){
 const data=JSON.stringify({format:'mist-notebook',version:1,notes:notes.map(n=>({...validateNote(n),assets:n.assets.map(a=>({...a,bytes:undefined,base64:toBase64(a.bytes)}))}))});
 if(new TextEncoder().encode(data).length>MAX_BACKUP)throw Error('完整备份超过 128 MB，请先分别导出较大的笔记。');return data;
}
export function toBase64(bytes){let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(s);}
function validBase64(value){if(typeof value!=='string'||value.length>Math.ceil(MAX_ASSET/3)*4||value.length%4||/[^A-Za-z0-9+/=]/.test(value))return false;const at=value.indexOf('=');return at<0||at>=value.length-2&&/^={1,2}$/.test(value.slice(at));}
function decodeBase64(text){const binary=atob(text),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;}
export function parseBackup(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_BACKUP)throw Error('备份最多 128 MB。');
 const data=JSON.parse(text);if(data?.format!=='mist-notebook'||data.version!==1||!Array.isArray(data.notes)||data.notes.length>MAX_NOTES)throw Error('不是受支持的笔记本备份。');
 const ids=new Set();let size=0;
 return data.notes.map(n=>{if(!n||!Array.isArray(n.assets)||ids.has(n.id))throw Error('备份包含无效或重复笔记。');ids.add(n.id);
  const assets=n.assets.map(a=>{if(!validBase64(a?.base64))throw Error('备份附件编码无效。');const bytes=decodeBase64(a.base64);size+=bytes.length;if(size>MAX_BACKUP)throw Error('备份附件过大。');return{id:a.id,name:a.name,mime:a.mime,bytes};});
  return validateNote({id:n.id,title:n.title,markdown:n.markdown,assets,created:n.created,updated:n.updated,revision:n.revision,...(n.deletedAt!==undefined?{deletedAt:n.deletedAt}:{})});
 });
}
export function portableMarkdown(note){
 // A single Markdown download remains self-contained; originals also live in backup.
 const value=mapAttachmentURLs(note.markdown,new Map(note.assets.map(asset=>['notebook-asset:'+asset.id,`data:${asset.mime};base64,${toBase64(asset.bytes)}`])));
 return '# '+escapeMarkdown(note.title)+'\n\n'+value;
}
export function importMarkdown(text,title){
 const note=newNote(title);let fence=null;
 note.markdown=text.split('\n').map(line=>{
  const marker=line.match(/^\s{0,3}(`{3,}|~{3,})/);
  if(marker){if(!fence)fence=marker[1];else if(marker[1][0]===fence[0]&&marker[1].length>=fence.length)fence=null;return line;}
  if(fence)return line;
  // Only standalone attachment links emitted by our exporter are promoted.
  // Data URLs in clues, inline code and fenced results remain literal text.
  return line.replace(/^(!?\[.*\]\()data:([a-z0-9.+/-]+(?:;charset=[a-z0-9-]+)?);base64,([A-Za-z0-9+/]+=*)\)$/i,(_url,prefix,mime,data)=>{
   if(!validBase64(data)||note.assets.length>=100)throw Error('Markdown 附件编码或数量无效（单附件最多 32 MB）。');
   const asset={id:newId(),name:'Markdown 附件 '+(note.assets.length+1),mime,bytes:decodeBase64(data)};note.assets.push(asset);return prefix+'notebook-asset:'+asset.id+')';
  });
 }).join('\n');return validateNote(note);
}
