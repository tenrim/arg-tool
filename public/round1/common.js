import {element as uiElement, render as uiRender, ToolPanel, ToolHeader, Provenance, fragment, updateStatus, setState} from '../ui/index.js';
export const $=id=>document.getElementById(id);
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const field=(title,input)=>`<label class="r1-field"><span>${title}</span>${input}</label>`;
export const area=(id,placeholder='',rows=6)=>`<textarea id="${id}" rows="${rows}" spellcheck="false" placeholder="${placeholder}"></textarea>`;
export const button=(id,label,primary=false)=>`<button id="${id}" class="${primary?'primary':'secondary'}-button">${label}</button>`;
export const status=id=>`<p class="status" id="${id}" role="status" aria-live="polite"></p>`;
export function setStatus(id,text,error=false){updateStatus($(id),text,error?'error':'info');}
export function action(id,statusId,fn){const button=$(id);let revision=0;button.addEventListener('click',async()=>{const current=++revision;let pending=false;try{const result=fn();pending=Boolean(result?.then);if(pending)setState(button,{busy:true});await result;}catch(e){setStatus(statusId,e.message||'操作失败，请重试。',true);}finally{if(pending&&current===revision)setState(button,{busy:false});}});}
export function mount(id,title,content,sources){
 const node=ToolPanel({id:'panel-'+id,className:'panel r1-panel',hidden:true,
  header:ToolHeader({className:'page-heading',title}),body:fragment(content),
  footer:Provenance({className:'tool-provenance',items:sources})});
 $('main').append(node);return node;
}
const loads=new Map();export async function script(src){if(!loads.has(src))loads.set(src,new Promise((res,rej)=>{const s=uiElement('script');s.src=src;s.onload=res;s.onerror=()=>{loads.delete(src);s.remove();rej(Error('组件加载失败，请重试。'));};document.head.append(s);}));return loads.get(src);}
export function download(data,name,type='text/plain;charset=utf-8'){const u=URL.createObjectURL(data instanceof Blob?data:new Blob([data],{type}));const a=uiElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
export async function copy(text){if(!text)throw Error('没有可复制的结果。');try{await navigator.clipboard.writeText(text);}catch{const t=uiElement('textarea');t.value=text;document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();if(!ok)throw Error('请选中结果手动复制。');}}
export function sendTo(id,text,target){$(id).value=text;$(id).dispatchEvent(new Event('input',{bubbles:true}));location.hash=target;}
export const webSource=['浏览器 Web API','https://developer.mozilla.org/zh-CN/docs/Web/API','本站界面、统计与交互逻辑'];
