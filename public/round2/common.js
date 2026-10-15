import {element as uiElement, render as uiRender, Card, TabList, Button, tabsController} from '../ui/index.js';
import {$,setStatus} from '../round1/common.js';
export function source(panel,name,url,role){const p=uiElement('p'),a=uiElement('a');a.textContent=name;a.href=url;a.target='_blank';a.rel='noopener noreferrer';p.append(a,document.createTextNode(' · '+role));panel.querySelector('.tool-provenance').append(p);}
export function surface(html){const node=Card({tag:'div',className:'surface r1-gap'});uiRender(node, html);return node;}
// Terminating a worker also rejects its pending task, so controls never wait on an orphaned promise.
export function workerJob(url,statusId){let active=null;function cancel(){if(!active)return;const {worker,reject,timer}=active;active=null;clearTimeout(timer);worker.terminate();reject(Error('任务已取消。'));}function run(data){cancel();return new Promise((resolve,reject)=>{const worker=new Worker(url,{type:'module'}),timer=setTimeout(()=>finish(Error('处理超过 30 秒，请缩小输入后重试。')),30000);active={worker,reject,timer};function finish(error,result){if(active?.worker!==worker)return;active=null;clearTimeout(timer);worker.terminate();if(error)reject(error);else resolve(result);}worker.onmessage=({data})=>{if(data.progress!==undefined)setStatus(statusId,data.progress);else finish(data.error?Error(data.error):null,data.result);};worker.onerror=()=>finish(Error('本地运算组件加载失败，请刷新重试。'));worker.postMessage(data);});}window.addEventListener('pagehide',cancel);return{run,cancel};}
export function tabs(panel,key,items){
 const bar=TabList({className:'r2-tabs',attrs:{role:'tablist','aria-label':key==='audio'?'音频与音乐功能':'图片功能'}});
 const shared=panel.querySelector(':scope > .surface'),footer=panel.querySelector('.tool-provenance');
 const controller=tabsController(bar,[],{onSelect:id=>{if(key==='audio'&&shared)shared.hidden=id==='play';document.dispatchEvent(new CustomEvent('arg:subpanelchange',{detail:{panel:key,id}}));}});
 function add(id,title,node){node.id=`${key}-${id}-pane`;node.classList.add('r2-pane','r1-panel');footer.before(node);const tab=Button({id:`${key}-${id}-tab`,text:title});controller.add(id,title,node,tab);}
 for(const item of items)add(...item);
 if(shared)shared.before(bar);else footer.before(bar);
 const select=id=>controller.select(id);select.add=add;select.active=()=>controller.active;select.bar=bar;select(items[0][0]);return select;
}
export function absorb(oldId,panel){const old=$('panel-'+oldId),node=uiElement('div');for(const entry of [...old.querySelector('.tool-provenance').children])if(entry.tagName==='P'&&entry.querySelector('a'))panel.querySelector('.tool-provenance').append(entry);for(const child of [...old.children])if(!child.matches('.page-heading,.tool-provenance'))node.append(child);old.remove();panel.querySelector('.tool-provenance').before(node);return node;}
