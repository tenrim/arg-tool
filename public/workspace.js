import {element as uiElement, Box, Button, Input, SearchField, Icon, Status, SearchHighlight, SearchMatchDetails, onDisconnect, animatePresence, motionAllowed} from './ui/index.js';
import {sitePages} from './navigation.js';
import {loadRegistry, searchEntries, capabilityCategories, literalSearchEvidence} from './capabilities/registry.js';
import {requestCapability} from './capabilities/browser.js';

// All discovery surfaces read canonical public capability metadata.
export function mountToolSearch(header,navigate){
 const input=Input({id:'workspace-search-input',type:'search',placeholder:'查找工具',attrs:{autocomplete:'off',role:'combobox','aria-autocomplete':'list','aria-controls':'workspace-search-results','aria-expanded':'false'}});
 const field=SearchField({className:'workspace-search-field workspace-search-trigger',control:input,label:'查找工具与操作',icon:Icon('search')});
 const shortcut=Box({tag:'kbd',className:'workspace-search-shortcut',text:'Ctrl K'});field.append(shortcut);
 const info=Status({className:'workspace-search-info'}),list=Box({id:'workspace-search-results',className:'workspace-search-results',attrs:{role:'listbox','aria-label':'匹配的工具与页面'}});
 const popover=Box({className:'workspace-search-popover',attrs:{'data-motion':'popover'},hidden:true,children:[info,list]});
 const root=Box({className:'workspace-search',children:[field,popover]});header.append(root);
 const abort=new AbortController();let registry,index=-1,loading,expanded=false,destroyed=false,composing=false;
 function close(){expanded=false;popover.hidden=true;popover.inert=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');}
 function highlight(){
  [...list.children].forEach((button,i)=>{button.classList.toggle('is-current',i===index);button.setAttribute('aria-selected',String(i===index));});
  if(list.children[index])input.setAttribute('aria-activedescendant',list.children[index].id);else input.removeAttribute('aria-activedescendant');
 }
 function render(){
  if(destroyed||!expanded)return;
  const term=input.value.trim(),matches=term&&registry?searchEntries(registry,term):[];
  list.replaceChildren();index=-1;
  const add=(title,subtitle,attrs,onOpen,match)=>{const button=Button({id:'workspace-search-option-'+list.children.length,className:'workspace-search-item',layout:'stacked',attrs:{role:'option',tabindex:'-1','aria-selected':'false',...attrs},children:[SearchHighlight({tag:'strong',text:title,ranges:match?.title}),...(match?.snippets.length?[SearchMatchDetails({match})]:[]),Box({tag:'span',text:subtitle})],on:{click:()=>{close();onOpen();}}});list.append(button);};
  const sites=term?sitePages.filter(page=>[page.title,...page.aliases||[]].some(name=>name.toLocaleLowerCase().includes(term.toLocaleLowerCase()))):[];
  const exactSites=new Set(sites.filter(page=>[page.title,...page.aliases||[]].some(name=>name.toLocaleLowerCase()===term.toLocaleLowerCase())));
  const addSite=page=>add(page.title,page.route==='notebook'?'笔记 · 思维导图 · 线索白板':page.category?capabilityCategories.find(c=>c.id===page.category).title+' · 外站介绍':'网站页面',{'data-route':page.route},()=>navigate(page.route),literalSearchEvidence(page,term));
  for(const page of exactSites)addSite(page);
  for(const entry of matches.slice(0,30))add(entry.title,capabilityCategories.find(c=>c.id===entry.category).title,{'data-capability':entry.id,'data-op':entry.preferredOperation||entry.engineName||'','data-route':entry.route},()=>requestCapability(entry),entry.searchMatch);
  for(const page of sites)if(!exactSites.has(page))addSite(page);
  const total=matches.length+sites.length;
  info.textContent=!term?'输入工具名称或用途，支持中文和英文。':!registry?'正在载入本地功能目录…':total?`${total} 项匹配${matches.length>30?' · 显示前 30 项工具':''}`:'没有匹配项，请换一个名称或用途。';
  highlight();
 }
 function load(){
  if(registry||loading)return;
  loading=loadRegistry().then(value=>{if(!destroyed){registry=value;render();}}).catch(()=>{if(!destroyed&&expanded)info.textContent='功能目录暂时无法载入，再次输入可重试。';}).finally(()=>loading=null);
 }
 function show(){if(destroyed)return;if(!expanded){document.dispatchEvent(new CustomEvent('arg:searchopen'));expanded=true;popover.hidden=false;popover.inert=false;input.setAttribute('aria-expanded','true');render();}load();}
 function open(){show();input.focus();input.select();}
 const listen=(node,event,fn)=>node.addEventListener(event,fn,{signal:abort.signal});
 listen(input,'focus',show);listen(input,'input',()=>{if(!composing){show();render();}});
 listen(input,'pointerdown',show);
 listen(input,'compositionstart',()=>composing=true);listen(input,'compositionend',()=>{composing=false;show();render();});
 listen(input,'keydown',event=>{
  if(event.isComposing||composing)return;
  if(event.key==='Escape'){event.preventDefault();close();return;}
  // A long result list can become a browser-tab-stop scroll container. Close
  // before native Tab traversal so focus goes to the next real page control.
  if(event.key==='Tab'){close();return;}
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();show();if(!list.children.length)return;
   index=index<0?(event.key==='ArrowDown'?0:list.children.length-1):(index+(event.key==='ArrowDown'?1:-1)+list.children.length)%list.children.length;highlight();list.children[index].scrollIntoView({block:'nearest'});
  }else if(event.key==='Enter'&&expanded&&list.children.length){event.preventDefault();list.children[Math.max(0,index)].click();}
 });
 listen(document,'keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();open();}});
 listen(document,'pointerdown',event=>{if(!root.contains(event.target))close();});
 listen(document,'focusin',event=>{if(!root.contains(event.target))close();});
 listen(document,'arg:panelchange',close);
 onDisconnect(root,()=>{destroyed=true;abort.abort();close();list.replaceChildren();registry=null;});
 return {open,close};
}

// Preserve the original controls and listeners. Shortcuts simply focus/scroll
// existing work areas; shared tab state and uploaded files stay in place.
export function mountWorkspaceGuides(main){
 const singleTitles={analysis:['输入密文','特征与建议','候选与密钥'],substitution:['密文与搜索','候选明文'],hanzi:['查询条件','查询结果'],cube:['魔方与公式','当前状态'],words:['查找条件','匹配结果'],extract:['输入与提取'],video:['视频与操作','预览与结果'],coordinates:['坐标换算','时间与时区'],symbols:['符号识读'],paper:['题面设置','题面','求解结果'],code:['运行设置','源代码','程序输出']};
 for(const panel of main.querySelectorAll('.panel')){
  if(panel.classList.contains('site-page'))continue;
  panel.classList.add('compact-workspace');const id=panel.id.slice(6);if(['crypto','encoding','language','textlab','datalab','networklab','mathlab','image','audio'].includes(id))continue;
  const bar=uiElement('nav');bar.className='workspace-outline';bar.setAttribute('aria-label','本页工作区');let counter=0;
  const candidates=[...panel.querySelectorAll('.surface,.hunt-inputs,.hunt-results,.hunt-extraction,.r4-box,.frag-stage-panel,.frag-inspector,.chef-pane')].filter(n=>!n.closest('.ct-tool,.ct-extension')&&!n.parentElement.closest('.surface,.r4-box,.frag-stage-panel,.frag-inspector,.chef-pane'));
  for(const node of candidates){node.classList.add('workspace-region');const h=node.querySelector('h2');let title=h?.textContent?.trim()||singleTitles[id]?.[counter]||(['image','audio','file'].includes(id)&&counter===0?'文件与预览':'');if(!title||title.length>24)continue;counter++;if(!h&&singleTitles[id]&&node.matches('.surface,.hunt-inputs')){const titleNode=uiElement('h2');titleNode.className='workspace-region-heading';titleNode.textContent=title;node.prepend(titleNode);}if(!node.id)node.id=`workspace-${id}-${counter}`;const button=uiElement('button');button.type='button';button.textContent=title;button.onclick=()=>{node.scrollIntoView({block:'start',behavior:motionAllowed()?'smooth':'instant'});const field=node.querySelector('input:not([type=file]),textarea:not([readonly]),select,button');field?.focus({preventScroll:true});};button._region=node;bar.append(button);}
  const jump=panel.querySelector(':scope>.ct-jump');if(jump){jump._region=panel.querySelector('.ct-extension');bar.append(jump);}
  if(bar.children.length>2||['file','coordinates','symbols','code'].includes(id)&&bar.children.length>1)panel.querySelector('.page-heading').after(bar);
 }
 function sync(){for(const button of main.querySelectorAll('.workspace-outline button'))button.hidden=!button._region.getClientRects().length;}
 document.addEventListener('arg:panelchange',()=>requestAnimationFrame(sync));document.addEventListener('arg:subpanelchange',()=>requestAnimationFrame(sync));
}
