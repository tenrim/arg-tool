import {element as uiElement, dialogController, Status, SearchField, Input, ToolCard} from './ui/index.js';
import {toolPages,sitePages} from './navigation.js';
import {getPreferences,setPreferences,favorites as currentFavorites,setFavorites,getRecent,recordTool} from './preferences.js';
import {loadRegistry,searchEntries,capabilityCategories} from './capabilities/registry.js';
import {requestCapability} from './capabilities/browser.js';
import {mountCapabilitySidebar} from './capabilities/sidebar.js';
import {CapabilityButton,Box,Button,Toolbar} from './ui/index.js';

// Original UI only. The catalogue, engines and file controls stay in their
// existing modules; this shell routes to them without replacing live DOM.
export {Icon as uiIcon} from './ui/index.js';
import {Icon as uiIcon} from './ui/index.js';

const node=uiElement;
const pages=toolPages;
const byRoute=new Map(pages.map(p=>[p.route,p]));

export function mountWorkbenchShell(header,{navigate,search}){
 const layout=document.querySelector('.layout');if(!layout)return {setActive(){},close(){}};
 layout.dataset.motion='shell';
 layout.dataset.sidebarMotion='responsive';
 document.body.classList.add('workbench-app');
 let favorites=currentFavorites(),current='home',recent=getRecent(),registry=null,cataloguePromise=null;
 const rail=node('aside',undefined,'workbench-sidebar');rail.id='workbench-sidebar';rail.setAttribute('aria-label','工具侧栏');
 rail.dataset.motion='rail';
 const railHead=node('div',undefined,'workbench-rail-heading'),railTitle=node('strong','工作台'),close=node('button',undefined,'app-icon-button rail-close');close.type='button';close.setAttribute('aria-label','关闭工具侧栏');close.append(uiIcon('close'));railHead.append(railTitle,close);
 const all=node('button',undefined,'rail-directory-button');all.type='button';all.append(uiIcon('grid'),node('span','全部工具'),node('span',String(pages.length),'rail-badge'));
 const filter=Input({type:'search',placeholder:'筛选工具'}),filterLabel=SearchField({className:'rail-filter',control:filter,label:'筛选侧栏工具',icon:uiIcon('search')});
 const scroll=node('div',undefined,'rail-scroll'),favoriteSection=node('section',undefined,'rail-collection'),recentSection=node('section',undefined,'rail-collection');
 favoriteSection.append(node('h2','已收藏'));recentSection.append(node('h2','最近使用'));
 const groups=node('nav',undefined,'rail-groups');groups.setAttribute('aria-label','分类工具列表');
 const sidebar=mountCapabilitySidebar(groups,{navigate,close:closeDrawer});
 scroll.append(favoriteSection,recentSection,groups);
 const railFoot=node('div',undefined,'rail-footer');railFoot.append(node('span','','local-dot'),node('span','浏览器本地处理'));
 const homeLink=pageLink(sitePages[0]);homeLink.classList.add('rail-site-link');
 const siteLinks=node('nav',undefined,'rail-site-links');siteLinks.setAttribute('aria-label','网站页面');for(const entry of sitePages.slice(1))siteLinks.append(pageLink(entry));railFoot.prepend(siteLinks);
 rail.append(railHead,homeLink,all,filterLabel,scroll,railFoot);layout.prepend(rail);
 const menu=node('button',undefined,'app-icon-button workbench-menu');menu.type='button';menu.setAttribute('aria-label','切换工具侧栏');menu.setAttribute('aria-controls',rail.id);menu.setAttribute('aria-expanded','true');menu.append(uiIcon('menu'));header.prepend(menu);
 const drawer=node('dialog',undefined,'workbench-drawer');drawer.setAttribute('aria-label','工具导航');document.body.append(drawer);
 const drawerModal=dialogController(drawer,{trigger:menu,initialFocus:close});
 const mobile=matchMedia('(max-width:1099px)');let collapsed=getPreferences().sidebarCollapsed;document.body.classList.toggle('rail-collapsed',collapsed);
 // Dialog close events are asynchronous. Always derive placement and ARIA
 // from the current viewport/open state, including a close followed by reopen.
 let railViewport=mobile.matches;
 function syncRail(){if(railViewport!==mobile.matches){railViewport=mobile.matches;layout.dataset.sidebarMotion='responsive';}const inDrawer=mobile.matches&&(drawer.open||drawerModal.leaving);const parent=inDrawer?drawer:layout;if(rail.parentElement!==parent){if(inDrawer)drawer.append(rail);else layout.prepend(rail);}rail.inert=!mobile.matches&&collapsed;menu.setAttribute('aria-expanded',String(mobile.matches?drawer.open:!collapsed));}
 function closeDrawer(){if(drawer.open)drawerModal.close();syncRail();}
 drawer.addEventListener('close',syncRail);
 drawer.addEventListener('ui:exitcomplete',syncRail);
 function toggleRail(){if(mobile.matches){if(drawer.open){closeDrawer();return;}drawer.append(rail);drawerModal.open();syncRail();}else{layout.dataset.sidebarMotion='toggle';collapsed=!collapsed;setPreferences({sidebarCollapsed:collapsed});}}
 menu.onclick=toggleRail;close.onclick=closeDrawer;
 mobile.addEventListener('change',closeDrawer);syncRail();

 // This overlay is a directory, not another tool page. Opening or filtering
 // it never changes a file, running task, draft or recipe.
 const directory=node('dialog',undefined,'tool-directory');directory.setAttribute('aria-labelledby','tool-directory-title');
 const directoryHead=node('div',undefined,'directory-heading');directoryHead.append(node('div',undefined,'directory-title'));
 directoryHead.firstChild.append(node('p','TOOLS / 工具目录','micro-label'),node('h2','全部工具'));directoryHead.querySelector('h2').id='tool-directory-title';
 const directoryClose=node('button',undefined,'app-icon-button');directoryClose.type='button';directoryClose.setAttribute('aria-label','关闭工具目录');directoryClose.append(uiIcon('close'));directoryHead.append(directoryClose);
 const directoryInput=Input({type:'search',placeholder:'搜索工具、算法或格式'}),directorySearch=SearchField({className:'directory-search',control:directoryInput,label:'搜索全部工具',icon:uiIcon('search')});
 const filters=Toolbar({className:'directory-filters',attrs:{role:'group','aria-label':'筛选工具类别'}});let selectedGroup='',capabilityGroup='';
 for(const [id,title]of [['','全部'],...capabilityCategories.map(g=>[g.id,g.title]),['favorites','已收藏']]){const b=Button({text:title,attrs:{'data-filter':id,'aria-pressed':String(!id)},on:{click:()=>{selectedGroup=id;capabilityGroup='';limit=60;renderDirectory();}}});filters.append(b);}
 const groupIndex=Toolbar({className:'directory-group-index',attrs:{role:'group','aria-label':'功能组'}});
 const toolbar=node('div',undefined,'directory-toolbar'),count=Status({className:'directory-count'});toolbar.append(count);
 const grid=node('div',undefined,'directory-grid'),more=Button({text:'继续显示',className:'secondary-button directory-more'});let limit=60;
 const directoryResults=node('div',undefined,'directory-results');directoryResults.append(grid,more);
 directory.append(directoryHead,directorySearch,filters,groupIndex,toolbar,directoryResults);document.body.append(directory);
 const directoryModal=dialogController(directory,{trigger:all,closeButton:directoryClose,initialFocus:()=>matchMedia('(max-width:1099px), (pointer:coarse)').matches?directoryClose:directoryInput});
 function openDirectory(options={}){closeDrawer();search.close();directoryInput.value=options.query||'';selectedGroup=options.category||'';capabilityGroup=options.group||'';limit=60;renderDirectory();directoryResults.scrollTop=0;if(!directory.open)directoryModal.open();loadOperations();}
 document.addEventListener('arg:searchopen',()=>{closeDrawer();if(directory.open)directoryModal.close();});
 all.onclick=()=>openDirectory();directoryInput.oninput=()=>{limit=60;capabilityGroup='';renderDirectory();};more.onclick=()=>{limit+=60;renderDirectory();};
 function loadOperations(){if(cataloguePromise)return;cataloguePromise=loadRegistry().then(value=>{registry=value;sidebar.setRegistry(value);all.querySelector('.rail-badge').textContent=String(registry.entries.filter(e=>e.listed!==false).length);filterRail();if(directory.open)renderDirectory();}).catch(()=>{cataloguePromise=null;sidebar.error(loadOperations);if(directory.open){count.textContent='功能目录加载失败，请重试。';grid.replaceChildren(Button({text:'重新载入',on:{click:loadOperations}}));}});}
 function renderDirectory(){const term=directoryInput.value.trim();for(const b of filters.children)b.setAttribute('aria-pressed',String(b.dataset.filter===selectedGroup));
  groupIndex.replaceChildren();grid.replaceChildren();
  if(!registry){count.textContent='正在载入本地功能目录…';more.hidden=true;return;}
  const groupMatches=registry.groups.filter(g=>!selectedGroup||g.category===selectedGroup);
  if(selectedGroup!=='favorites')for(const group of groupMatches){const b=Button({text:group.title,attrs:{'data-directory-group':group.id,'aria-pressed':String(group.id===capabilityGroup)},on:{click:()=>{capabilityGroup=capabilityGroup===group.id?'':group.id;limit=60;renderDirectory();}}});groupIndex.append(b);}
  groupIndex.hidden=selectedGroup==='favorites';
  let entries=searchEntries(registry,term,selectedGroup==='favorites'?'':selectedGroup).filter(e=>(!capabilityGroup||e.group===capabilityGroup)&&(selectedGroup!=='favorites'||e.sourceToolIds.some(id=>favorites.has(id))));
  for(const entry of entries.slice(0,limit)){const card=Box({className:'directory-capability'});const group=registry.groups.find(g=>g.id===entry.group);card.append(CapabilityButton({entry,compact:true,onOpen:()=>{directoryModal.close();requestCapability(entry);}}),node('span',group.title,'capability-location'));grid.append(card);}
  count.textContent=entries.length?`${entries.length} 项${entries.length>limit?' · 已显示 '+limit+' 项':''}`:'没有匹配项';more.hidden=entries.length<=limit;
 }
 function pageLink(entry){const a=node('a',undefined,'rail-tool');a.href='#'+entry.route;a.dataset.route=entry.route;a.append(uiIcon(entry.icon||entry.route),node('span',entry.title));a.onclick=event=>{if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();closeDrawer();navigate(entry.route);};return a;}
 function toggleFavorite(id){if(!byRoute.has(id))return;if(favorites.has(id))favorites.delete(id);else favorites.add(id);setFavorites(favorites);}
 document.addEventListener('click',event=>{const button=event.target.closest('[data-favorite]');if(button)toggleFavorite(button.dataset.favorite);});
 document.addEventListener('arg:collectionschange',()=>{favorites=currentFavorites();recent=getRecent();refreshCollections();if(directory.open)renderDirectory();});
 document.addEventListener('arg:preferenceschange',()=>{const next=getPreferences().sidebarCollapsed;if(next!==collapsed&&!mobile.matches)layout.dataset.sidebarMotion='toggle';collapsed=next;document.body.classList.toggle('rail-collapsed',collapsed);syncRail();refreshCollections();});
 function refreshCollections(){for(const [section,ids]of [[favoriteSection,[...favorites]],[recentSection,recent.slice(0,4)]]){section.querySelectorAll('a,p').forEach(n=>n.remove());for(const id of ids)section.append(pageLink(byRoute.get(id)));section.hidden=!ids.length;}
  for(const b of document.querySelectorAll('[data-favorite]')){const id=b.dataset.favorite,selected=favorites.has(id);b.setAttribute('aria-pressed',String(selected));b.setAttribute('aria-label',(selected?'取消收藏':'收藏')+' · '+(byRoute.get(id)?.title||id));b.title=selected?'取消收藏':'收藏工具';}
  markCurrent();filterRail();
 }
 function markCurrent(){for(const a of rail.querySelectorAll('[data-route]')){if(groups.contains(a))continue;if(a.dataset.route===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}}
 function filterRail(){const term=filter.value.trim();sidebar.filter(term);const prefs=getPreferences();favoriteSection.hidden=!!term||!favorites.size||!prefs.showFavorites;recentSection.hidden=!!term||!recent.length||!prefs.showRecent;}
 filter.oninput=filterRail;
 function setActive(route){const path=route.split('?')[0];const id=path.split('/')[0];sidebar.setActive(path);if(id==='browse'){current=path;refreshCollections();return;}if(!byRoute.has(id)&&!sitePages.some(p=>p.route===id))return;current=id;if(byRoute.has(id))recordTool(id);refreshCollections();}
 // Heading buttons are mounted by the shared heading decorator after init.
 document.addEventListener('arg:panelchange',event=>{const {name,group,capabilityId}=event.detail;sidebar.setActive(name+(group?'/'+group:''),capabilityId);refreshCollections();});
 loadOperations();refreshCollections();return {setActive,close:closeDrawer,openDirectory,openSearch:search.open};
}
