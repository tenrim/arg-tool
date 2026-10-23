import {element as uiElement,setState,updateStatus} from '../ui/index.js';
export const MAX_FILE=32*1024*1024;
export const $=id=>document.getElementById(id);
export const escape=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
export const setStatus=(id,message,error=false)=>updateStatus($(id),message,error?'error':'info');
// Transport and control feedback only; data/revisions belong to each workspace.
export function createActions(generation){return (id,status,fn)=>{
 let actionRevision=0;
 $(id).addEventListener('click',async()=>{
  const current=++actionRevision,version=generation();let pending=false;
  try{const result=fn();pending=Boolean(result?.then);if(pending)setState($(id),{busy:true});await result;}
  catch(error){if(version===generation())setStatus(status,error?.message||String(error),true);}
  finally{if(pending&&current===actionRevision)setState($(id),{busy:false});}
 });
};}
export function download(data, filename, type = 'text/plain;charset=utf-8') {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob), link = uiElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export async function copy(text) {
  if (!text) throw new Error('还没有可复制的结果。');
  try { if (navigator.clipboard) { await navigator.clipboard.writeText(text); return; } } catch { /* Try the selection fallback. */ }
  const box = uiElement('textarea'); box.value = text; box.style.position = 'fixed'; box.style.opacity = '0'; document.body.append(box); box.select();
  const success = document.execCommand('copy'); box.remove(); if (!success) throw new Error('复制失败，请选择结果后手动复制。');
}
export function canvasDownload(canvas, filename) { return new Promise((resolve, reject) => canvas.toBlob(blob => { if (!blob) { reject(new Error('图片导出失败。')); return; } download(blob, filename); resolve(); }, 'image/png')); }
export function bindDrop(input, handler) {
  input.addEventListener('change', () => { const file = input.files?.[0]; if (file) handler(file); input.value = ''; });
  const zone = input.closest('.upload-zone');
  zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', event => { event.preventDefault(); zone.classList.remove('dragover'); const file = event.dataTransfer.files[0]; if (file) handler(file); });
}
