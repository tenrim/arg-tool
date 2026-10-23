import {GUIDE_GROUPS,GUIDE_PAGES,findGuideSites} from './catalog.js';
import {Box,Card,ToolPanel,ToolHeader,Toolbar,Link,Select,Option,Field,FormGrid,SplitView,Input,SearchField,Status,updateStatus,EmptyState} from '../ui/index.js';

export function createExternalGuide(definition=GUIDE_PAGES[0]) {
 const {route,title,category}=definition;
 const sites=findGuideSites('','',category),availableGroups=GUIDE_GROUPS.filter(group=>sites.some(site=>site.group===group.id));
 const page=ToolPanel({id:'panel-'+route,className:'panel site-page',hidden:true,
  header:ToolHeader({className:'page-heading',title})});
 const direction=Select({id:route+'-direction',children:[Option('全部方向',''),...availableGroups.map(g=>Option(g.title,g.id))]});
 const search=Input({id:route+'-search',type:'search',attrs:{placeholder:'网站名称、资料或线索类型'}});
 const status=Status({attrs:{'aria-live':'polite'}}),body=Box();
 const cards=new Map(sites.map(site=>[site.id,Card({attrs:{'data-external-site':site.id},children:[
  Box({tag:'h3',text:site.name}),Box({tag:'p',text:site.description}),
  Toolbar({children:[Link({text:'前往 '+site.name+' ↗',attrs:{href:site.url,target:'_blank',rel:'noopener noreferrer',referrerpolicy:'no-referrer','aria-label':'前往 '+site.name+'（在新窗口打开）'}}),
   ...(site.links||[]).map(link=>Link({text:link.title+' ↗',attrs:{href:link.url,target:'_blank',rel:'noopener noreferrer',referrerpolicy:'no-referrer','aria-label':link.title+'（在新窗口打开）'}}))]})
 ]})]));
 const groups=availableGroups.map(group=>{
  const grid=SplitView({minPaneWidth:'28rem',children:sites.filter(s=>s.group===group.id).map(s=>cards.get(s.id))});
  const section=Box({tag:'section',attrs:{'data-external-group':group.id},children:[Box({tag:'h2',text:group.title}),grid]});
  body.append(section);return [group.id,section];
 });
 const empty=EmptyState({text:'没有匹配的网站。可以更换资料方向，或尝试网站原文名称。',hidden:true});
 function refresh(){
  const found=findGuideSites(direction.value,search.value,category),ids=new Set(found.map(s=>s.id));
  for(const [id,card]of cards)card.hidden=!ids.has(id);
  for(const [id,section]of groups)section.hidden=!found.some(s=>s.group===id);
  empty.hidden=found.length>0;updateStatus(status,`显示 ${found.length} 个网站 · 共 ${sites.length} 个`,'info');
 }
 direction.addEventListener('change',refresh);search.addEventListener('input',refresh);
 page.append(FormGrid({children:[Field({label:'资料方向',control:direction}),Field({tag:'div',label:'查找外站资料',control:SearchField({control:search,label:'查找外站资料'})})]}),status,body,empty);
 refresh();return page;
}
