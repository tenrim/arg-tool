import {element as uiElement,Provenance,onDisconnect} from './ui/index.js';
import {PROJECT_LICENSES,projectLicense} from './project-licenses.js';
import {TASK_PROJECT_SOURCES,OPERATION_PROJECT_SOURCES,NOTEBOOK_PROJECT_SOURCES} from './project-source-contracts.js';
import {completionImplementationSources} from './completion/sources.js';
const element=(tag,text,cls)=>{const node=uiElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
const sourceBindings=new WeakMap(),sourceBaselines=new WeakMap(),sourceSelections=new WeakMap();
function sourceArchiveLink(project){
 if(!project.sourceArchive)return null;
 if(!/^vendor\/[a-z0-9_./-]+\.zip$/i.test(project.sourceArchive)||project.sourceArchive.includes('..'))throw Error('对应源码归档路径无效。');
 const link=element('a','下载完整对应源码与构建包（ZIP）');link.href=new URL('./'+project.sourceArchive,import.meta.url);link.download='';link.dataset.projectNotice=project.sourceArchive;link.dataset.projectArchive='';return link;
}
export function setNotebookSourceView(panel,view='notes'){
 const footer=panel?.querySelector(':scope>.tool-provenance');if(footer)footer.hidden=view!=='notes';
}
function appendNoticeDisclosure(row,project){
 if([...row.querySelectorAll(':scope>.project-notices')].some(node=>node.dataset.projectNotices===project.url))return;
 const details=element('details',undefined,'project-notices'),summary=element('summary',`查看许可与声明原文（${project.notices.length} 份）`),list=element('ul'),controller=new AbortController();details.dataset.projectNotices=project.url;details.append(summary,list);let ready=false;
 details.addEventListener('toggle',()=>{if(!details.open||ready)return;ready=true;for(const path of project.notices){const item=element('li'),link=element('a',path.split('/').pop());link.dataset.projectNotice=path;link.href=new URL('./'+path,import.meta.url);let loading=false,loaded=false,body;link.addEventListener('click',async event=>{event.preventDefault();if(loading||loaded||controller.signal.aborted)return;loading=true;body?.remove();body=element('p','正在读取许可原文…');item.append(body);try{const response=await fetch(link.href,{signal:controller.signal});if(!response.ok)throw Error('读取失败，可再次点击重试。');const text=await response.text();if(controller.signal.aborted)return;body.replaceWith(element('pre',text));loaded=true;}catch(error){if(!controller.signal.aborted)body.textContent=error.message;}finally{loading=false;}});item.append(link);list.append(item);}const archive=sourceArchiveLink(project);if(archive){const item=element('li');item.append(archive);list.append(item);}});onDisconnect(details,()=>controller.abort());row.append(details);
}
// Live units and the two Braille input views retain the same actual engines;
// folded record fields never replace this visible final attribution footer.
// Practical forms declare existing engine/data consumers in TASK_PROJECT_SOURCES;
// original civil-date and spherical calculations declare an empty dependency list.
// Expanded engine workspaces retain their pinned data and independent dependency notices.
// New consumers name actual registered dependencies; appearance and license
// annotations are finalized by the same owner as existing tool footers.
export function setProjectSources(panel,urls,{roles={}}={}){
 const projects=[...new Set(urls)].map(url=>{const project=projectLicense(url);if(!project)throw Error('未登记的项目来源：'+url);return project;});
 let footer=panel.querySelector(':scope>.tool-provenance');
 if(!projects.length){footer?.remove();return;}
 if(!footer)footer=Provenance({className:'tool-provenance',attrs:{'aria-label':'使用的具体项目'}});
 const list=element('ul');
 for(const project of projects){const row=element('li'),link=element('a',project.name),role=element('span',roles[project.url]||project.role);link.href=project.url;link.target='_blank';link.rel='noopener noreferrer';row.dataset.license=project.license;row.append(link,role,element('span','许可证：'+project.license,'project-license'));appendNoticeDisclosure(row,project);list.append(row);}
 footer.replaceChildren(element('p','// 所用项目与来源','micro-label'),list);footer.hidden=false;panel.append(footer);
}
export function mountProjectSources(main){
 sourceBindings.get(main)?.();
 const siteFooter=main.querySelector('.main-footer');
 if(siteFooter&&!siteFooter.querySelector('[data-ui-runtime-sources]')){
  const details=element('details'),summary=element('summary','界面组件、动画与许可');details.dataset.uiRuntimeSources='';details.append(summary);
  for(const url of ['https://animate-ui.com/','https://motion.dev/','https://react.dev/','https://base-ui.com/']){
   const project=projectLicense(url),row=element('div'),link=element('a',project.name);link.href=url;link.target='_blank';link.rel='noopener noreferrer';
   row.append(link,element('span',' · '+project.role),element('span',' · '+project.license));appendNoticeDisclosure(row,project);details.append(row);
  }
  siteFooter.append(details);
 }

 // Record the assembled source ownership once, before narrowing a panel to a
 // task. Remounts must not mistake a previously selected QR/Chef footer for
 // the native image workspace's original StegOnline/AperiSolve/etc. sources.
 for(const panel of main.querySelectorAll('.panel'))if(!sourceBaselines.has(panel)){
  const urls=[],roles={};
  for(const link of panel.querySelectorAll(':scope>.tool-provenance a')){
   const project=projectLicense(link.href);if(!project)continue;
   if(!urls.includes(project.url))urls.push(project.url);
   const row=link.closest('li,p')||link.parentElement;
   const role=row.querySelector(':scope>span:not(.project-license)')?.textContent
    ||row.textContent.replace(link.textContent,'').replace(/^\s*[·↗]?\s*/,'');
   if(role)roles[project.url]=role;
  }
  sourceBaselines.set(panel,{urls,roles});
 }
 // One declared inventory owns initial and task-specific footers. A missing
 // entire footer is checked against this inventory, not just existing links.
 const panels=new Map();
 for(const spec of Object.values(TASK_PROJECT_SOURCES)){
  if(!panels.has(spec.panel))panels.set(spec.panel,new Set());
  for(const url of spec.urls)panels.get(spec.panel).add(url);
 }
 for(const [id,urls]of panels){
  const panel=main.querySelector('#panel-'+id);if(!panel)continue;
  const baseline=sourceBaselines.get(panel);
  setProjectSources(panel,[...new Set([...(baseline?.urls||[]),...urls])],{roles:baseline?.roles});
 }
 const notebook=main.querySelector('#panel-notebook');
 if(notebook)setProjectSources(notebook,NOTEBOOK_PROJECT_SOURCES);
 const syncSources=({detail})=>{
  sourceSelections.set(main,detail);
  // Mixed topics retain each real implementation. The selected Chef action
  // uses Chef; the native QR reader/editor uses its own declared dependencies.
  const spec=detail.topicKind==='mixed'&&detail.kind==='operation'
    ?OPERATION_PROJECT_SOURCES[detail.operation]||{panel:detail.name,urls:['https://github.com/gchq/CyberChef'],roles:{'https://github.com/gchq/CyberChef':'当前操作“'+detail.operation+'”的官方本地处理引擎。'}}
    :TASK_PROJECT_SOURCES[detail.taskId||detail.capabilityId];
  const panel=main.querySelector('#panel-'+(spec?.panel||detail.name));
  // Only contract-owned panels have ever been narrowed by this owner. Leave
  // unrelated lazy controllers' dynamically assembled provenance untouched.
  const sources=spec||(panels.has(detail.name)?sourceBaselines.get(panel):null);
  if(panel&&sources)setProjectSources(panel,completionImplementationSources(detail.name,detail.implementation)||sources.urls,{roles:sources.roles});
  if(detail.name==='notebook'&&notebook)setNotebookSourceView(notebook,detail.notebookView||'notes');
 };
 if(main.isConnected){
  document.addEventListener('arg:panelchange',syncSources);
  document.addEventListener('arg:tasksourceschange',syncSources);
  const cleanup=()=>{document.removeEventListener('arg:panelchange',syncSources);document.removeEventListener('arg:tasksourceschange',syncSources);release();sourceBindings.delete(main);};
  const release=onDisconnect(main,cleanup);sourceBindings.set(main,cleanup);
 }
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
 const roles=new Map(),annotatedRows=new Set();
 for(const link of main.querySelectorAll('.tool-provenance a')){
  if(link.hasAttribute('data-project-notice'))continue;
  const row=link.closest('li,p')||link.parentElement,project=projectLicense(link.href);
  if(!annotatedRows.has(row)){for(const label of row.querySelectorAll(':scope>.project-license'))label.remove();annotatedRows.add(row);}
  if(!project){row.append(element('span','许可证尚未登记','project-license'));row.dataset.license='missing';continue;}
  if(!roles.has(project.url))roles.set(project.url,row.textContent.replace(link.textContent,'').replace(/^\s*[·↗]?\s*/,''));
  row.dataset.license=project.license;row.append(element('span','许可证：'+project.license,'project-license'));
  appendNoticeDisclosure(row,project);
 }
 const grid=main.querySelector('#panel-about .resource-grid');grid.replaceChildren();
 for(const project of PROJECT_LICENSES){
  const card=element('article',undefined,'resource-card');card.dataset.project=project.url;
  card.append(element('h3',project.name),element('p',project.role||roles.get(project.url)||'随工具运行包提供；具体复用范围见所附许可与来源记录。'));
  const source=element('a',project.linkLabel||'项目源代码');source.href=project.url;source.target='_blank';source.rel='noopener noreferrer';card.append(source,element('p','许可证：'+project.license,'project-license'));
  const details=element('details',undefined,'project-notices'),summary=element('summary',`查看许可原文（${project.notices.length} 份）`),body=element('div');details.append(summary,body);let loaded=false,loading=false;
  details.addEventListener('toggle',async()=>{if(!details.open||loaded||loading)return;loading=true;body.replaceChildren(element('p','正在读取随站点提供的许可文件…'));try{const notices=await Promise.all(project.notices.map(async path=>{const response=await fetch(new URL('./'+path,import.meta.url));if(!response.ok)throw Error('许可文件读取失败，请收起后重新展开。');return{path,text:await response.text()};}));body.replaceChildren();for(const notice of notices)body.append(element('p',notice.path.split('/').pop(),'micro-label'),element('pre',notice.text));loaded=true;}catch(error){body.replaceChildren(element('p',error.message));}finally{loading=false;}});
  const archive=sourceArchiveLink(project);if(archive)card.append(archive);card.append(details);grid.append(card);
 }
 const selection=sourceSelections.get(main);if(selection)syncSources({detail:selection});
}
