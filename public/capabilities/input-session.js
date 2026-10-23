// Clues are shared only in this module's caller-owned memory. No preferences,
// browser storage, URLs, result views or automatic byte/text conversions belong
// to this boundary.
const MAX_BYTES=32*1024*1024;
const nativeTextTasks=new Set(['native:ascii','native:utf8','native:codepoint','native:radix','native:a1z26','native:roman','native:invisible','native:invisible-clean']);
const encodingGroups=new Set(['charset','radix','base','webencoding','binaryencoding']);
const textSources=new Set(['text','hex','base64']);

export function inputCompatibility(entry){
 if(!entry||entry.type!=='transform')return null;
 if(nativeTextTasks.has(entry.taskId||entry.id))return 'text-conversion';
 const target=entry.open;
 if(target?.kind==='operation'&&encodingGroups.has(target.group))return 'text-conversion';
 return null;
}

// Typed source data stays typed: a hex/base64 editor is not ordinary Unicode
// text, and a file or explicit continued-result byte input is never decoded.
export function normalizeInputSource(value){
 if(typeof value==='string')value={kind:'text',source:'text',text:value};
 if(!value||typeof value!=='object')return null;
 if(value.kind==='text'&&textSources.has(value.source)&&typeof value.text==='string'){
  if(new TextEncoder().encode(value.text).byteLength>MAX_BYTES)return null;
  return {kind:'text',source:value.source,text:value.text};
 }
 if(value.kind==='bytes'&&value.source==='result'){
  const bytes=value.bytes instanceof Uint8Array?value.bytes:value.bytes instanceof ArrayBuffer?new Uint8Array(value.bytes):null;
  if(!bytes||bytes.byteLength>MAX_BYTES)return null;
  return {kind:'bytes',source:'result',bytes:bytes.slice()};
 }
 if(value.kind==='file'&&value.source==='file'&&typeof File!=='undefined'&&value.file instanceof File&&value.file.size<=MAX_BYTES)return {kind:'file',source:'file',file:value.file};
 return null;
}

export function createInputSession(){
 const inputs=new Map();
 function capture(entry,controller){
  const family=inputCompatibility(entry),read=controller?.getInputModel||controller?.getInput;
  if(!family||typeof read!=='function')return false;
  const input=normalizeInputSource(read.call(controller));if(!input)return false;
  inputs.set(family,{owner:entry.id,input});return true;
 }
 function peek(entry){
  const stored=inputs.get(inputCompatibility(entry));return stored?normalizeInputSource(stored.input):null;
 }
 function adopt(entry,controller){
  const input=peek(entry),write=controller?.adoptInput||controller?.adopt;
  if(!input||typeof write!=='function')return false;
  return write.call(controller,input)===true;
 }
 return {capture,adopt,peek,clear:()=>inputs.clear()};
}
