import {element as uiElement} from './ui/index.js';
import {PROJECT_LICENSES,projectLicense} from './project-licenses.js';
const element=(tag,text,cls)=>{const node=uiElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
// New consumers name actual registered dependencies; appearance and license
// annotations are finalized by the same owner as existing tool footers.
export function setProjectSources(panel,urls){
 const projects=[...new Set(urls)].map(url=>{const project=projectLicense(url);if(!project)throw Error('未登记的项目来源：'+url);return project;});
 let footer=panel.querySelector(':scope>.tool-provenance');
 if(!projects.length){footer?.remove();return;}
 if(!footer){footer=element('footer',undefined,'tool-provenance');footer.setAttribute('aria-label','使用的具体项目');}
 const list=element('ul');
 for(const project of projects){const row=element('li'),link=element('a',project.name),role=element('span',project.role);link.href=project.url;link.target='_blank';link.rel='noopener noreferrer';row.append(link,role);list.append(row);}
 footer.replaceChildren(element('p','// 所用项目与来源','micro-label'),list);panel.append(footer);
}
export function mountProjectSources(main){
 // Finalize assembled source data once tools have added their real dependencies.
 // Native browser interfaces and original code are not third-party projects.
 const browserInterface=link=>new URL(link.href).hostname==='developer.mozilla.org';
 for(const footer of main.querySelectorAll('.tool-provenance')){
  for(const link of footer.querySelectorAll('a')){
   if(!browserInterface(link))continue;
   const row=link.closest('li,p');
   if(row&&[...row.querySelectorAll('a')].every(browserInterface))row.remove();else link.remove();
  }
  for(const list of footer.querySelectorAll('ul,ol'))if(!list.children.length)list.remove();
  if(!footer.querySelector('a'))footer.remove();
  else footer.parentElement.append(footer);
 }
 const roles=new Map();
 for(const link of main.querySelectorAll('.tool-provenance a')){
  const row=link.closest('li,p')||link.parentElement,project=projectLicense(link.href);
  if(!project){row.append(element('span','许可证尚未登记','project-license'));row.dataset.license='missing';continue;}
  if(!roles.has(project.url))roles.set(project.url,row.textContent.replace(link.textContent,'').replace(/^\s*[·↗]?\s*/,''));
  row.dataset.license=project.license;row.append(element('span','许可证：'+project.license,'project-license'));
 }
 const grid=main.querySelector('#panel-about .resource-grid');grid.replaceChildren();
 for(const project of PROJECT_LICENSES){
  const card=element('article',undefined,'resource-card');card.dataset.project=project.url;
  card.append(element('h3',project.name),element('p',roles.get(project.url)||project.role||'随工具运行包提供；具体复用范围见所附许可与来源记录。'));
  const source=element('a','项目源代码');source.href=project.url;source.target='_blank';source.rel='noopener noreferrer';card.append(source,element('p','许可证：'+project.license,'project-license'));
  const details=element('details',undefined,'project-notices'),summary=element('summary',`查看许可原文（${project.notices.length} 份）`),body=element('div');details.append(summary,body);let loaded=false,loading=false;
  details.addEventListener('toggle',async()=>{if(!details.open||loaded||loading)return;loading=true;body.replaceChildren(element('p','正在读取随站点提供的许可文件…'));try{const notices=await Promise.all(project.notices.map(async path=>{const response=await fetch(new URL('./'+path,import.meta.url));if(!response.ok)throw Error('许可文件读取失败，请收起后重新展开。');return{path,text:await response.text()};}));body.replaceChildren();for(const notice of notices)body.append(element('p',notice.path.split('/').pop(),'micro-label'),element('pre',notice.text));loaded=true;}catch(error){body.replaceChildren(element('p',error.message));}finally{loading=false;}});
  card.append(details);grid.append(card);
 }
}
