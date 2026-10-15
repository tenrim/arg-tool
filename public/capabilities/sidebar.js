import {Box, Button, IconButton, Icon, Link, Status, disclosureController} from '../ui/index.js';
import {capabilityCategories, searchEntries} from './registry.js';
import {capabilityRoute} from './routes.js';

// The registry owns every task and its direction. The rail only controls how
// much of that inventory is visible; expanding it never changes the workspace.
export function mountCapabilitySidebar(host, {navigate, close}) {
  let registry, currentRoute='', currentId=null, query='', renderedQuery=null, searchLimit=60;
  const categories=new Map(), sections=new Map();
  const tree=Box({className:'rail-category-tree'}), results=Box({className:'rail-search-results',hidden:true});
  const status=Status({text:'正在载入功能目录…',className:'rail-empty'});
  host.append(tree,results,status);
  function routeLink(route, title, icon, attrs={}) {
    return Link({className:'rail-tool',attrs:{href:'#'+route,'data-route':route,...attrs},
      children:[Icon(icon),Box({tag:'span',text:title})],on:{click:event=>{
        if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
        event.preventDefault();close();navigate(route);
      }}});
  }
  function taskLink(entry, location=false) {
    const group=registry.groups.find(group=>group.id===entry.group);
    const link=routeLink(capabilityRoute(entry,entry.preferredOperation,entry.preferredDirection),entry.title,group.icon,
      {'data-capability':entry.id,'data-category':entry.category});
    if(location){
      const text=link.querySelector('span');
      text.append(Box({tag:'small',className:'rail-match-location',text:capabilityCategories.find(category=>category.id===entry.category).title+' / '+group.title}));
    }
    return link;
  }
  for(const category of capabilityCategories){
    const root=Box({className:'rail-group',attrs:{'data-group':category.id}});
    const link=routeLink('browse/'+category.id,category.title,category.icon);
    link.classList.add('rail-category-link');
    const toggle=IconButton({label:'展开或收起'+category.title,className:'rail-category-toggle',variant:'quiet',children:Box({tag:'span',text:'›',attrs:{'aria-hidden':'true'}})});
    const body=Box({className:'rail-category-body'});
    const controller=disclosureController(toggle,body);
    root.append(Box({className:'rail-category-heading',children:[link,toggle]}),body);tree.append(root);
    categories.set(category.id,{root,body,controller});
  }
  function addSection(group){
    const parent=categories.get(group.category).body;
    if(group.entries.length===1){parent.append(taskLink(group.entries[0]));return;}
    const root=Box({className:'rail-section',attrs:{'data-rail-group':group.id}});
    const toggle=Button({className:'rail-tool rail-section-toggle',variant:'quiet',
      attrs:{'data-rail-expand':group.id},children:[Icon(group.icon),Box({tag:'span',text:group.title}),Box({tag:'span',className:'rail-group-count',text:String(group.count)})]});
    const list=Box({className:'rail-task-list',hidden:true,attrs:{'aria-label':group.title+'工具'}});
    const controller=disclosureController(toggle,list);
    let shown=0;
    const more=Button({className:'rail-more',variant:'quiet',text:'继续显示',on:{click:()=>appendEntries(shown+40)}});
    function appendEntries(limit){
      for(const entry of group.entries.slice(shown,limit))list.insertBefore(taskLink(entry),more.parentNode?more:null);
      shown=Math.min(limit,group.count);more.textContent=`继续显示（${shown} / ${group.count}）`;more.hidden=shown===group.count;
      if(!more.parentNode)list.append(more);
      markCurrent();
    }
    toggle.addEventListener('click',()=>{if(!list.hidden&&!shown)appendEntries(40);});
    root.append(toggle,list);parent.append(root);
    sections.set(group.id,{root,controller,reveal(id){const index=group.entryIds.indexOf(id);if(index>=shown)appendEntries(index+1);controller.toggle(true);}});
  }
  function markCurrent(){
    for(const link of host.querySelectorAll('a[data-route]')){
      const selected=link.dataset.capability?link.dataset.capability===currentId:link.dataset.route===currentRoute;
      if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    }
    const entry=registry?.byId.get(currentId);
    for(const [id,section]of sections)section.root.dataset.current=String(id===entry?.group);
  }
  function revealCurrent(){
    const entry=registry?.byId.get(currentId);if(!entry)return;
    categories.get(entry.category).controller.toggle(true);sections.get(entry.group)?.reveal(entry.id);
  }
  function renderSearch(){
    results.replaceChildren();
    if(!registry){status.hidden=false;return;}
    const matches=searchEntries(registry,query);
    for(const entry of matches.slice(0,searchLimit))results.append(taskLink(entry,true));
    if(matches.length>searchLimit)results.append(Button({className:'rail-more',text:`继续显示（${searchLimit} / ${matches.length}）`,variant:'quiet',on:{click:()=>{searchLimit+=60;renderSearch();}}}));
    status.textContent='没有匹配的工具';status.hidden=matches.length>0;markCurrent();
  }
  return {
    setRegistry(value){
      if(registry===value)return;
      registry=value;for(const group of registry.groups)if(group.count)addSection(group);
      status.hidden=true;renderedQuery=null;this.filter(query);revealCurrent();markCurrent();
    },
    filter(value){
      query=value.trim();tree.hidden=!!query;results.hidden=!query;
      if(renderedQuery===query)return;renderedQuery=query;searchLimit=60;
      if(query)renderSearch();else {results.replaceChildren();status.hidden=!!registry;markCurrent();}
    },
    setActive(route,id=null){currentRoute=route;currentId=id;revealCurrent();markCurrent();},
    error(retry){status.hidden=false;status.replaceChildren('功能目录加载失败。',Button({text:'重新载入',on:{click:retry}}));}
  };
}
