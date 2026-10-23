import {Box, Button, Card, DataList, Field, Input, Option, SearchField, Select, Status, Toolbar, disclosureController, element, onDisconnect, setTextareaValue, updateStatus} from '../ui/index.js';
import {worldMap} from '../reference/world-map.js';
import {appendDiscoveryActions} from '../discovery/bridge.js';
import {loadRegistry} from './registry.js';
import {capabilityRoute} from './routes.js';
import {aminoAcids} from '../science/core.js';

export const REFERENCE_WORKSPACES = Object.freeze([
 {id:'world', title:'国家、货币与交通', tasks:[['countries','国家与国旗'],['currencies','货币代码'],['airports','机场'],['ports','港口与运输地点']]},
 {id:'sky', title:'天体目录与观测', tasks:[['sky','深空天体目录'],['astronomy','方位与升落']]},
 {id:'matter', title:'元素、物质与生命', tasks:[['chemistry','元素周期表'],['chemistry-formula','分子式'],['chemistry-molecule','分子结构'],['sequence','氨基酸与密码子']]},
]);
const WORLD_TASKS = new Set(REFERENCE_WORKSPACES[0].tasks.map(([id])=>id));
const taskGroup = id=>REFERENCE_WORKSPACES.find(group=>group.tasks.some(([task])=>task===id));
const routeId = route=>String(route||'').replace(/^#/, '').split(/[/?]/)[0];

// Explicit region context is separate from a query (CN can also be a currency search).
export function worldSelection(kind, country, query = '') {
 const code = String(country||'').trim().toUpperCase();
 if (code && !/^[A-Z]{2}$/.test(code)) throw Error('国家／地区代码应为两个英文字母。');
 if (kind==='countries') return {query:code, recordId:code||null, region:''};
 return {query, region:code};
}

let places = null;
function createPlacesOwner() {
 const stage=Box({className:'ref-visual-stage'}), detail=Box({className:'ref-visual-detail',attrs:{'aria-label':'选中资料'}});
 const body=Box({className:'ref-visual-body',children:[stage,detail]});
 const toggle=Button({text:'收起图形'}), root=Card({className:'ref-browser ref-card',children:[Toolbar({children:[Box({tag:'h2',text:'世界地图与国旗'}),toggle]}),body]});
 body.id='world-visual-body';const disclosure=disclosureController(toggle,body,{openLabel:'收起图形',closedLabel:'展开图形'});
 const records=new Map(), controllers=new Map();let active='',country='',countries=null,map=null,picker=null,ready=false,loading=false,disposed=false;
 const note=Status(), marker=Box({tag:'p',className:'ref-map-context'});stage.append(note);
 function resetDetail(){detail.replaceChildren(Box({tag:'h3',text:'点选后查看资料'}));}
 resetDetail();
 function updateCountry(code,{announce=true}={}) {
  if(countries && code && !countries.some(record=>record.id===code))return;
  country=code;map?.select(code);if(picker)picker.value=code;
  marker.textContent=code?((countries?.find(record=>record.id===code)?.name||code)+' · '+code):'全部国家／地区';
  root.dataset.country=code;
  for(const button of root.querySelectorAll('[data-choice]')){const selected=button.dataset.choice===code;button.setAttribute('aria-pressed',String(selected));button.classList.toggle('is-selected',selected);}
  if(announce)document.dispatchEvent(new CustomEvent('arg:reference-context',{detail:{workspace:'world',country:code,kind:active}}));
 }
 function choose(code) {
  updateCountry(code); const api=controllers.get(active)?.api;if(!api)return;
  api.select(worldSelection(active,code));
 }
 function showResult(result) {
  const item=result.items[0];detail.replaceChildren();
  if(!item){detail.append(Status({text:result.note||'没有匹配资料。'}));map?.setPoints([]);return;}
  // There is one complete record owner, the actual query result list. The shared
  // visual selection only identifies the record and exposes related tasks.
  detail.append(Box({tag:'h3',text:item.title}),Box({tag:'p',text:result.total===1?item.id:`${result.total} 项 · 当前页 ${result.items.length} 项`}));
  appendDiscoveryActions(detail,item);
  detail.append(Button({text:'查看查询结果',on:{click:()=>controllers.get(active)?.panel.querySelector('.ref-results')?.scrollIntoView({block:'start',behavior:'instant'})}}));
  map?.setPoints(result.items);
  if(active==='countries')updateCountry(result.total===1?item.id:'');
  else if(result.items.length && result.items.every(record=>record.country===item.country) && item.country)updateCountry(item.country);
 }
 function buildFlags() {
  const directory=element('details',undefined,'ref-visual-directory');directory.append(element('summary',`国旗目录 · ${countries.length} 个国家和地区`));
  const filter=Input({type:'text',placeholder:'筛选名称或代码',attrs:{'aria-label':'筛选国旗目录'}}),continent=Select({attrs:{'aria-label':'国旗目录所属洲'}});
  continent.append(Option('全部洲',''));for(const name of [...new Set(countries.map(record=>record.continent))])continent.append(Option(name,name));
  const grid=Box({className:'ref-flag-grid'}),pager=Toolbar();let page=0;
  function draw(){
   grid.replaceChildren();pager.replaceChildren();const term=filter.value.trim().toLowerCase(),items=countries.filter(record=>(!continent.value||record.continent===continent.value)&&[record.name,record.english,record.id].join(' ').toLowerCase().includes(term));
   const pages=Math.ceil(items.length/36);page=Math.max(0,Math.min(page,pages-1));
   for(const record of items.slice(page*36,page*36+36)){
    const children=[];if(record.flag){const image=element('img');image.src=new URL('../vendor/reference/flags/'+record.id.toLowerCase()+'.svg',import.meta.url).href;image.alt='';image.loading='lazy';children.push(image);}else children.push(Box({tag:'span',text:'—',className:'ref-no-flag'}));
    children.push(Box({tag:'span',text:record.name}),Box({tag:'small',text:record.id}));
    grid.append(Button({className:'ref-flag-choice',children,attrs:{'data-choice':record.id,'aria-pressed':String(record.id===country)},on:{click:()=>{choose(record.id);draw();}}}));
   }
   if(!items.length)grid.append(Status({text:'没有匹配地区。'}));
   pager.append(Button({text:'上一页',disabled:page<=0,on:{click:()=>{page--;draw();}}}),Box({tag:'span',text:`${pages?page+1:0} / ${pages} 页 · ${items.length} 项`}),Button({text:'下一页',disabled:page+1>=pages,on:{click:()=>{page++;draw();}}}));
  }
  filter.oninput=continent.onchange=()=>{page=0;draw();};directory.append(Toolbar({children:[filter,continent]}),grid,pager);root.append(directory);draw();
 }
 async function activateBrowser(){
  if(ready||loading||disposed||!active)return;loading=true;updateStatus(note,'正在载入浏览资料…');
  try {
   const read=async name=>{const response=await fetch(new URL('../vendor/reference/'+name+'.json',import.meta.url));if(!response.ok)throw Error('浏览资料载入失败，查询表单仍可使用。');return response.json();};
   const [features,data]=await Promise.all([read('world'),read('countries')]);if(disposed)return;countries=data;
   picker=Select({attrs:{'aria-label':'按名称选择国家地区'}});picker.append(Option('全部国家／地区',''));for(const record of [...countries].sort((a,b)=>a.name.localeCompare(b.name,'zh')))picker.append(Option(record.name+' · '+record.id,record.id));
   picker.onchange=()=>choose(picker.value);stage.replaceChildren(Field({label:'国家／地区',control:picker}),marker);
   const mapHost=Box({className:'ref-map-host'});stage.append(mapHost);map=worldMap(mapHost,features,countries,choose,record=>{
   const panel=controllers.get(active)?.panel,card=panel?.querySelector(`.ref-results article[data-record="${CSS.escape(record.id)}"]`);if(!card)return;for(const previous of panel.querySelectorAll('.ref-result-focus'))previous.classList.remove('ref-result-focus');card.scrollIntoView({block:'center',behavior:'instant'});card.classList.add('ref-result-focus');card.tabIndex=-1;card.focus({preventScroll:true});
   });
   buildFlags();ready=true;root.dataset.ready='true';syncIds();updateCountry(country,{announce:false});const latest=records.get(active);if(latest)showResult(latest);
  }catch(error){if(disposed)return;stage.replaceChildren(Status({text:error.message,attrs:{'data-state':'error'}}),Button({text:'重新载入',on:{click:activateBrowser}}));}
  finally{loading=false;}
 }
 function syncIds(){root.id=active+'-browser';if(picker){picker.id=active==='currencies'?'currencies-country-picker':active+'-map-country';const label=picker.closest('label');if(label)label.htmlFor=picker.id;}}
 function moveTo(id){
  const entry=controllers.get(id);if(!entry||disposed)return;const changed=active!==id;
  if(changed && active)controllers.get(active)?.api.invalidate?.('');
  active=id;syncIds();entry.panel.querySelector('.ref-layout').before(root);
  if(changed){map?.setPoints([]);resetDetail();const latest=records.get(active);if(latest)showResult(latest);}
  activateBrowser();
 }
 const changed=event=>{if(WORLD_TASKS.has(event.detail?.name))moveTo(event.detail.name);else if(active)controllers.get(active)?.api.cancelIfBusy?.();};document.addEventListener('arg:panelchange',changed);
 onDisconnect(root,()=>{disposed=true;disclosure.destroy();document.removeEventListener('arg:panelchange',changed);if(places===owner)places=null;});
 const owner={root,controllers,moveTo,choose,updateCountry,get country(){return country;},context:()=>marker.textContent,
  register(panel,tool,api){controllers.set(tool.id,{panel,api});return {
   loading(){if(active===tool.id){detail.replaceChildren(Status({text:'正在查询…'}));map?.setPoints([]);}},
   clear(){records.delete(tool.id);if(active===tool.id){resetDetail();map?.setPoints([]);}},
   results(result){records.set(tool.id,result);if(active===tool.id)showResult(result);},
   error(message){if(active===tool.id)detail.replaceChildren(Status({text:message,attrs:{'data-state':'error'}}));},
   refreshPlot(){},
  };}
 };
 return owner;
}

export function mountSharedPlaceBrowser(panel,tool,api) {
 if(!places)places=createPlacesOwner();const browser=places.register(panel,tool,api);
 const region=panel.querySelector('#'+tool.id+'-region');
 // The common region chooser owns this value; preserve the original named input
 // and worker parameters, rather than building a second independent form.
 if(tool.id!=='countries' && region)region.closest('label').hidden=true;
 queueMicrotask(()=>{const id=routeId(location.hash);if(WORLD_TASKS.has(id))places?.moveTo(id);});
 return browser;
}

export function adoptWorldSelection(kind,selection={}) {
 if(!places || !WORLD_TASKS.has(kind))return;
 if(kind==='countries'){
  const code=selection.recordId||'';if(/^[A-Z]{2}$/.test(code))places.updateCountry(code);
 } else if(Object.hasOwn(selection,'region')){
  const code=String(selection.region||'').trim().toUpperCase();if(!code||/^[A-Z]{2}$/.test(code))places.updateCountry(code);
 }
}

function mountSequenceReference(main,go) {
 const panel=main.querySelector('#panel-sequence'),conversion=panel?.querySelector('.science-layout');if(!panel||!conversion)return null;
 const search=Input({id:'amino-reference-search',type:'search',placeholder:'例如 Met、M、ATG、甲硫氨酸'}),note=Status({id:'amino-reference-status'}),grid=Box({className:'ref-result-list'}),detail=Box({className:'ref-visual-detail'});
 const retry=Button({text:'重新载入密码子表',hidden:true,on:{click:()=>load()}}),root=Card({id:'sequence-reference',hidden:true,children:[SearchField({control:search,label:'查找氨基酸或密码子'}),note,retry,Box({className:'ref-visual-body',children:[grid,detail]})]});
 conversion.before(root);let mapping=null,worker=null,timer=null,version=0,selected=null,disposed=false;
 function stop(){version++;worker?.terminate();worker=null;clearTimeout(timer);}
 function show(record){
  selected=record;detail.replaceChildren(Box({tag:'h3',text:record.name}),DataList({items:[['单字母',record.one],['三字母',record.three],['DNA 密码子',record.codons.join(' · ')||'标准遗传密码未分配'],['RNA 密码子',record.codons.map(value=>value.replaceAll('T','U')).join(' · ')||'标准遗传密码未分配']]}),Button({text:'用于序列转换',on:{click:()=>{
   const type=document.getElementById('seq-type'),input=document.getElementById('seq-input');type.value='aa';type.dispatchEvent(new Event('input',{bubbles:true}));setTextareaValue(input,record.one,{feedback:false});input.dispatchEvent(new Event('input',{bubbles:true}));go('sequence-processing');
  }}}));
  for(const button of grid.querySelectorAll('[data-amino]'))button.setAttribute('aria-pressed',String(button.dataset.amino===record.one));
 }
 function draw(){
  if(!mapping)return;const term=search.value.trim().toUpperCase(),items=mapping.filter(record=>!term||(/^[A-Z*]$/.test(term)?record.one===term:[record.one,record.three,record.name,...record.codons,...record.codons.map(value=>value.replaceAll('T','U'))].some(value=>value.toUpperCase().includes(term))));
  grid.replaceChildren();for(const record of items)grid.append(Button({children:[Box({tag:'strong',text:record.one+' / '+record.three}),Box({tag:'span',text:record.name})],attrs:{'data-amino':record.one,'aria-pressed':String(selected?.one===record.one)},on:{click:()=>show(record)}}));
  updateStatus(note,`${items.length} / ${mapping.length} 个代码 · 标准遗传密码 64 个密码子`);
  if(!items.length){detail.replaceChildren(Status({text:'没有匹配的氨基酸或密码子。'}));selected=null;}else if(selected && !items.includes(selected)){selected=null;detail.replaceChildren(Box({tag:'h3',text:'点选代码查看密码子'}));}
 }
 function load(){
  if(mapping||worker||disposed)return;stop();const current=version;updateStatus(note,'正在读取本地标准遗传密码…');retry.hidden=true;
  const codons=[];for(const first of 'TCAG')for(const second of 'TCAG')for(const third of 'TCAG')codons.push(first+second+third);
  const fail=message=>{if(current!==version||disposed)return;stop();updateStatus(note,message,'error');retry.hidden=false;};
  try{worker=new Worker(new URL('../science/worker.js',import.meta.url));timer=setTimeout(()=>fail('密码子表载入超时，请重试。'),30000);worker.onerror=event=>{event.preventDefault();fail('密码子表载入失败，请重试。');};worker.onmessage=({data})=>{
   if(current!==version||disposed)return;if(data.error){fail(data.error);return;}const translated=data.result?.rows?.find(([label])=>label==='阅读框 +1')?.[1];
   if(typeof translated!=='string'||translated.length!==codons.length){fail('密码子表不完整，请重试。');return;}
   stop();mapping=aminoAcids.map(([one,three,name])=>({one,three,name,codons:codons.filter((_,index)=>translated[index]===one)}));draw();detail.replaceChildren(Box({tag:'h3',text:'点选代码查看密码子'}));
  };worker.postMessage({kind:'sequence',params:{type:'dna',input:codons.join('')},resourceBase:new URL('../',import.meta.url).href});}catch{fail('无法启动密码子查询，请检查浏览器是否支持后台运算。');}
 }
 search.addEventListener('input',draw);onDisconnect(root,()=>{disposed=true;stop();});
 return {activate(reference){root.hidden=!reference;conversion.hidden=reference;if(reference){document.getElementById('sequence-stop')?.click();load();}else if(worker){stop();updateStatus(note,'');}},destroy(){disposed=true;stop();root.remove();conversion.hidden=false;}};
}

export function mountReferenceWorkspaces(main,{navigate}={}) {
 const bars=new Map(),worldContext=Status({className:'ac-reference-context'}),skyContext=Status({className:'ac-reference-context'});let active='',worldTask='',skyTask='',skyObject=null,astroObjectId='',disposed=false;
 const go=async id=>{
  try{const registry=await loadRegistry();if(disposed)return;const entry=registry.byId.get('native:'+id),route=entry?capabilityRoute(entry):id;return navigate?navigate(route):(location.hash=route);}
  catch(error){const context=taskGroup(id)?.id==='world'?worldContext:skyContext;updateStatus(context,error.message||'功能目录载入失败，请重试。','error');}
 };
 const biology=mountSequenceReference(main,go);
 for(const group of REFERENCE_WORKSPACES){const toolbar=Toolbar({className:'ac-workspace-tasks',attrs:{'aria-label':group.title+'的任务'},children:group.tasks.map(([id,title])=>Button({text:title,attrs:{'data-reference-task':id,'aria-pressed':'false'},on:{click:()=>go(id)}}))});
  bars.set(group.id,Box({className:'ac-reference-workspace',attrs:{'data-reference-workspace':group.id},children:[toolbar,...(group.id==='world'?[worldContext]:group.id==='sky'?[skyContext]:[])]}));
 }
 loadRegistry().then(registry=>{if(disposed)return;for(const bar of bars.values())for(const button of bar.querySelectorAll('[data-reference-task]')){const entry=registry.byId.get('native:'+button.dataset.referenceTask);if(entry){button.textContent=entry.title;button.dataset.capability=entry.id;}}}).catch(()=>{});
 function activate(route,entry=null){
  if(disposed)return;const id=routeId(route),group=taskGroup(id);active=id;biology?.activate(entry?.id==='native:sequence');
  if(!group)return;
  const panel=main.querySelector('#panel-'+id),bar=bars.get(group.id);if(!panel)return;const heading=panel.querySelector('.page-heading');heading?heading.after(bar):panel.prepend(bar);
  bar.hidden=Boolean(entry && entry.group!==group.id);
  for(const button of bar.querySelectorAll('[data-reference-task]'))button.setAttribute('aria-pressed',String(entry?button.dataset.capability===entry.id:button.dataset.referenceTask===id));
  if(group.id==='world'){
   const changed=worldTask!==id;worldTask=id;places?.moveTo(id);updateStatus(worldContext,places?.country?places.context():'');
   if(places?.country && changed){const query=document.getElementById(id+'-query')?.value||'';places.controllers.get(id)?.api.select(worldSelection(id,places.country,query));}
  } else if(group.id==='sky'){
   const changed=skyTask!==id;skyTask=id;updateStatus(skyContext,skyObject?skyObject.name+' · '+skyObject.id:'');
   if(changed && skyObject){
    if(id==='astronomy' && (astroObjectId!==skyObject.id || document.getElementById('astro-body')?.value!=='Star1'))document.dispatchEvent(new CustomEvent('arg:astronomy-object',{detail:skyObject}));
    else if(id==='sky')document.dispatchEvent(new CustomEvent('arg:reference-request',{detail:{kind:'sky',selection:{query:'',recordId:skyObject.id}}}));
   }
  }
 }
 const context=event=>{if(event.detail?.workspace==='world')updateStatus(worldContext,places?.context()||'');};
 const acceptObject=value=>{if(!value||typeof value.id!=='string'||typeof value.name!=='string'||!Number.isFinite(value.ra)||!Number.isFinite(value.dec)||value.ra<0||value.ra>24||value.dec< -90||value.dec>90)return false;skyObject={id:value.id,name:value.name,ra:value.ra,dec:value.dec};updateStatus(skyContext,value.name+' · '+value.id);return true;};
 const object=event=>{if(acceptObject(event.detail))astroObjectId=event.detail.id;};
 const result=event=>{if(event.detail?.kind!=='sky')return;const found=event.detail.result;if(found?.total===1 && found.items[0]?.sky)acceptObject(found.items[0].sky);};
 const edited=event=>{if((event.target.id==='astro-body' && event.target.value!=='Star1') || event.target.closest?.('#sky-form')){skyObject=null;astroObjectId='';updateStatus(skyContext,'');}};
 const changed=event=>activate(event.detail?.name);
 document.addEventListener('arg:reference-context',context);document.addEventListener('arg:astronomy-object',object);document.addEventListener('arg:reference-result',result);document.addEventListener('arg:panelchange',changed);main.addEventListener('input',edited);main.addEventListener('change',edited);
 return {activate,select({kind,selection}){if(!taskGroup(kind))return false;document.dispatchEvent(new CustomEvent('arg:reference-request',{detail:{kind,selection}}));go(kind);return true;},getContext(){return {country:places?.country||'',sky:skyObject?{...skyObject}:null,active};},destroy(){if(disposed)return;disposed=true;document.removeEventListener('arg:reference-context',context);document.removeEventListener('arg:astronomy-object',object);document.removeEventListener('arg:reference-result',result);document.removeEventListener('arg:panelchange',changed);main.removeEventListener('input',edited);main.removeEventListener('change',edited);biology?.destroy();for(const bar of bars.values())bar.remove();}};
}
