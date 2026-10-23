import {mountAudioWorkspace} from './media-workspace/audio.js';
import {mountFileWorkspace} from './media-workspace/file.js';
import {mountInitialLayout,resizableDock,Box,Link,animatePresence} from './ui/index.js';
import {mountQalculate} from './qalculate/index.js';
import {mountPractical} from './practical/index.js';
import {mountUnits} from './qalculate/units.js';
import {mountITReference} from './it-reference/page.js';
import {mountKnowledge} from './knowledge/page.js';
import {initReference} from './reference/index.js';
import {initScience} from './science/index.js';
import {initRoundFour} from './round4/index.js';
import {initGo} from './discovery/go.js';
import {initTuring} from './turing/ui.js';
import {initBasics} from './basics/ui.js';
import {mountProjectSources,setProjectSources,setNotebookSourceView} from './project-sources.js';
import {initCodeRunner} from './coderunner/ui.js';
import {initPaper} from './round3/paper.js';
import {mountChefTools} from './chef-tools/index.js';
import {initRoundTwo} from './round-two.js';
import {initRoundOne} from './round-one.js';
import {mountShell,decorateHeading,mountFooter} from './site-shell.js';
import {mountWorkspaceGuides} from './workspace.js';
import {initHuntTools} from './hunt-tools.js';
import {initHuntMedia} from './hunt-media.js';
import { initCyberChef } from './cyberchef.js';
import { initImageTools } from './image-tools.js';
import {initPreferences,initialRoute} from './preferences.js';
import {mountSitePages} from './site-pages.js';
import {toolPages,sitePages,notebookViewForRoute} from './navigation.js';
import {loadRegistry,resolveCapability} from './capabilities/registry.js';
import {mountCapabilityWorkspace} from './capabilities/workspace.js';
import {capabilityRoute} from './capabilities/routes.js';
import {selectPanelTask} from './capabilities/task-selection.js';
import {mountNativeWorkspaces} from './capabilities/native-workspaces.js';
import {mountReferenceWorkspaces} from './capabilities/reference-workspaces.js';
import {getCatalogue} from './chef-tools/catalog.js';
import {defaults} from './chef-tools/schema.js';
import {createInputSession} from './capabilities/input-session.js';
import {getBasicsSession} from './basics/ui.js';
import {mountFeedback} from './feedback/ui.js';
import {mountNotebook} from './notebook/page.js';
import {mountGraphics} from './graphics/page.js';
import {mountExpansion} from './expansion/index.js';
import {mountAtlas} from './atlas/index.js';
import {mountTimezones} from './timezones/index.js';
import {mountOnlineQuery} from './online-query/index.js';
import {appendToolHelpContent} from './tool-help.js';

initPreferences();
mountInitialLayout();

const $ = id => document.getElementById(id);
const state={panel:'crypto'};
let hexEditor,knowledge;
const huntUI = initHuntTools();
initPaper();
initRoundOne();
const audioTools=mountAudioWorkspace();
initRoundFour();
initScience();
initReference();
mountAtlas($('main'));
mountTimezones($('main'));
mountOnlineQuery($('main'));
mountQalculate($('main'));
mountUnits($('main'));
mountPractical($('main'));
initGo();
initTuring();
const itReference=mountITReference($('main'),{navigate:panel,onKindChange:kind=>panel('it-reference?task=native:it-'+kind)});
knowledge=mountKnowledge($('main'),{navigate:panel,onArticleChange:id=>panel('knowledge?task=learn:'+id)});
setProjectSources(itReference.panel,['https://www.iana.org/protocols','https://github.com/jshttp/mime-db','https://github.com/publicsuffix/list']);
const chef = initCyberChef();
initBasics();
initCodeRunner();
const expansion=mountExpansion($('main'),{getAudio:audioTools.snapshot,loadAudioFile:audioTools.load});
appendToolHelpContent('morse',Box({tag:'p',children:['难以处理的信号可手动尝试 ',Link({text:'ggmorse 官方浏览器示例',attrs:{href:'https://ggmorse.ggerganov.com/',target:'_blank',rel:'noopener noreferrer'}}),'。外站独立运行；本站不会替你传送音频。']}));
const chefTools=mountChefTools();
const navigation=mountShell(document.querySelector('.site-header'),$('sidebar'),{navigate:openWorkspace});
mountSitePages($('main'),{navigate:panel});
let routingRevision=0,capabilityWorkspace,nativeWorkspaces,referenceWorkspaces,currentCapability=null;
const implementationSelections=new Map();
document.addEventListener('arg:taskimplementationchange',({detail})=>{
 const byte=detail?.name==='byte-codecs'&&typeof detail.codec==='string'&&['encode','decode'].includes(detail.direction),keyboard=detail?.name==='keyboard-extra'&&typeof detail.mode==='string';if(!byte&&!keyboard)return;
 const implementation=byte?{codec:detail.codec,direction:detail.direction}:{mode:detail.mode};implementationSelections.set(detail.name,implementation);
 if(currentCapability?.open.panel!==detail.name)return;
 document.dispatchEvent(new CustomEvent('arg:tasksourceschange',{detail:{name:detail.name,taskId:currentCapability.taskId||currentCapability.id,capabilityId:currentCapability.id,implementation}}));
});
const lastTaskRoutes=new Map();
const inputSession=createInputSession();
let graphics;
// The router owns task/direction identity. Native controllers and Chef tasks
// deliberately have different computation APIs; source metadata needs neither.
const currentSource=()=>{const remembered=lastTaskRoutes.get(currentCapability?.open.panel),selected=currentCapability?.open.kind==='native'?nativeWorkspaces?.getSelection(currentCapability,remembered):remembered;return{tool:currentCapability?.title||'工具结果',route:currentCapability?capabilityRoute(currentCapability,selected?.op,selected?.direction):''};};
const notebook=mountNotebook($('main'),{navigate:openWorkspace,current:currentSource,openGraphic:(...args)=>graphics.open(...args),createGraphic:(...args)=>graphics.create(...args),sendNoteToGraphic:(...args)=>graphics.fromNote(...args)});
graphics=mountGraphics(notebook.graphicsHost,{navigate:panel,notebook,current:currentSource});
const notebookDock=resizableDock({layout:document.querySelector('.layout'),content:notebook.panel,label:'笔记本',onClose:()=>notebook.setDocked(false),onExpand:()=>panel('notebook'),onNarrow:()=>panel('notebook')});
function openWorkspace(route){
 if(route==='notebook'&&state.panel!=='notebook'&&notebookDock.available){notebook.setDocked(true);notebookDock.open();notebook.activate();setNotebookSourceView(notebook.panel);navigation.close();return;}
 return panel(route);
}
setProjectSources(graphics.panels[0],['https://github.com/excalidraw/excalidraw','https://github.com/facebook/react']);
setProjectSources(graphics.panels[1],['https://github.com/SSShooter/mind-elixir-core']);
function inputController(entry){const owner=entry?.open?.panel;return entry?.open?.kind==='operation'?chefTools.getTask(owner):getBasicsSession(owner)||expansion.getSession(owner);}
async function panel(route) {
  const revision=++routingRevision;
  const previousView=currentCapability?currentSource().route:null;
  try{await graphics?.flush();}catch(error){graphics.report(error);if(currentCapability)history.replaceState(history.state,'','#'+currentSource().route);return;}if(revision!==routingRevision)return;
  hexEditor?.cancel();itReference.cancel();knowledge?.cancel();
  if(currentCapability)inputSession.capture(currentCapability,inputController(currentCapability));
  chefTools.deactivate();
  const [path,query='']=String(route).split('?');
  const params=new URLSearchParams(query),taskId=params.get('task');
  let [name,group,subgroup]=path.split('/');
  const notebookView=notebookViewForRoute(path);
  if(notebookView){name='notebook';group='';subgroup='';notebookDock.close({restoreFocus:false});}
  let entry,operation,direction;
  if(!notebookView&&(taskId||(!sitePages.some(page=>page.route===name)&&!['resources','browse','knowledge'].includes(name)))){
    let registry;
    try{registry=await loadRegistry();}
    catch(error){if(revision===routingRevision){await panel('browse');capabilityWorkspace.retryRoute(route);}return;}
    if(revision!==routingRevision)return;
    if(taskId)({entry,op:operation,direction}=resolveCapability(registry,taskId,params.get('op'),params.get('dir'),params.get('view')));
    if(!entry) {
      const controller=chefTools.getTask(name);
      ({entry,op:operation,direction}=selectPanelTask(registry,name,{remembered:lastTaskRoutes.get(name),operation:controller?.getOperation()}));
    }
    if(entry?.listed===false)entry=null;
    if(entry){[name,group]=entry.route.split('/');}
    else {name='browse';group='';subgroup='';}
  }
  if(name==='resources')name='about';
  if (!$('panel-' + name)) {name = 'home';group='';} const changed = state.panel !== name; state.panel = name;
  const destination=$('panel-'+name);
  if(entry)destination.dataset.motionPending='true';else delete destination.dataset.motionPending;
  // A direction change is the same task. Keep its mounted toolbar and real
  // focused controls; restore composition only when task identity changes.
  if(!entry||currentCapability?.id!==entry.id)capabilityWorkspace?.restore();
  nativeWorkspaces?.restore();currentCapability=null;
  if (name === 'cyberchef') chef.load();
  for (const section of document.querySelectorAll('.panel')) section.hidden = section.id !== 'panel-' + name&&!(notebookDock.opened&&section===notebook.panel);
  const target=name==='browse'?name+(group?'/'+group:'')+(subgroup?'/'+subgroup:''):name+(group?'/'+group:'');
  navigation.setActive(target);navigation.close();
  const sourceDetail={name,group,notebookView:notebookView?.id||null,capabilityId:entry?.id||null,taskId:entry?.taskId||entry?.id||null,topicKind:entry?.topicKind||null,kind:entry?.open.kind||null,operation,direction};
  document.dispatchEvent(new CustomEvent('arg:panelchange',{detail:sourceDetail}));
  fileTools.syncMode(name==='file'&&entry?.open?.slice==='hex');
  if(name==='it-reference'&&!entry)itReference.activate(group);
  if(name==='knowledge'&&!entry){if(group)knowledge.activateCategory(group);else knowledge.activateArticle();}
  if(name==='browse')capabilityWorkspace.showOverview(group,subgroup);
  const title=[...toolPages,...sitePages].find(page=>page.route===name)?.title||'工具导航';
  history.replaceState(null, '', '#' + (notebookView?.route||(entry?capabilityRoute(entry,operation,direction):target)));document.title = (notebookView&&notebookView.id!=='notes'?notebookView.title+' · 笔记本':entry?.title||title) + ' · 迷雾工具箱';
  if (changed) { $('main').focus({preventScroll: true}); window.scrollTo({top: 0, behavior: 'instant'}); }
  if(entry){
    currentCapability=entry;
    const selection={id:entry.id,op:operation,direction,variant:entry.variantId};
    lastTaskRoutes.set(entry.open.panel,selection);
    await capabilityWorkspace.activate(entry,{direction});if(revision!==routingRevision)return;
    try{
      if(entry.open.kind==='learning'){
        knowledge.activateArticle(entry.open.articleId);
      }else if(entry.open.kind==='recipe'){
        const catalogue=await getCatalogue();if(revision!==routingRevision)return;
        await chef.openRecipe([{op:operation,args:defaults(catalogue.operations[operation])}],undefined,{navigate:false,isCurrent:()=>revision===routingRevision});
      }else if(entry.open.kind==='operation'){
        if(!await chefTools.selectCapability({panel:entry.open.panel,op:operation,capabilityId:entry.id,directions:entry.directions,topicKind:entry.topicKind,variantId:entry.variantId}))throw Error('该操作尚未就绪，请重新选择功能。');
        if(revision!==routingRevision)return;
        nativeWorkspaces.activateOperation(entry);
      }else if(!await nativeWorkspaces.activateNative(entry,{op:operation,direction}))throw Error('无法切换到该功能，请重新选择。');
      if(revision!==routingRevision)return;
      inputSession.adopt(entry,inputController(entry));
      referenceWorkspaces.activate(entry.route,entry);
      // The shared source owner finalizes after the real controller has mounted
      // its form/help, so a mixed topic never retains another member's footer.
      document.dispatchEvent(new CustomEvent('arg:tasksourceschange',{detail:{...sourceDetail,implementation:implementationSelections.get(name)}}));
    }catch(error){if(revision===routingRevision)capabilityWorkspace.error(error);}
    if(revision===routingRevision){
      delete destination.dataset.motionPending;
      if(changed||previousView!==currentSource().route)animatePresence(destination);
    }
  }
}
window.addEventListener('hashchange', () => panel(location.hash.slice(1)));
document.querySelector('.skip').addEventListener('click', event => { event.preventDefault(); $('main').focus(); $('main').scrollIntoView(); });

const imageTools = initImageTools();
initHuntMedia(huntUI,imageTools.getImage,audioTools.snapshot,{beginBarcode:imageTools.beginExternalTextResult});
const roundTwo=initRoundTwo({getImage:imageTools.getImage,getAudio:audioTools.snapshot,getFile:()=>fileTools.snapshot()});
const fileTools=mountFileWorkspace({navigate:panel,routeState:()=>({revision:routingRevision,panel:state.panel})});
hexEditor=fileTools.editor;
nativeWorkspaces=mountNativeWorkspaces({imageTools,roundTwo,hexEditor,itReference,getFile:fileTools.getBytes,getFileFile:fileTools.getFile,getAudioFile:audioTools.getFile});
chefTools.connect({imageTools,roundTwo,getFile:fileTools.getBytes,getAudioFile:audioTools.getFile,material:nativeWorkspaces});

mountProjectSources($('main'));
for(const section of document.querySelectorAll('.panel'))decorateHeading(section.querySelector('.page-heading'),section.id.slice(6));
mountWorkspaceGuides($('main'));
referenceWorkspaces=mountReferenceWorkspaces($('main'),{navigate:panel});
capabilityWorkspace=mountCapabilityWorkspace($('main'),{navigate:panel,openDirectory:navigation.openDirectory,onCategoryChange:navigation.setActive});
document.addEventListener('arg:openoperation',async e=>{try{const registry=await loadRegistry(),source=registry.byOperation.get(e.detail?.op),{entry,op}=resolveCapability(registry,source?.id,e.detail?.op);if(entry&&entry.listed!==false)await panel(capabilityRoute(entry,op));}catch(error){capabilityWorkspace.error(error);}});
document.addEventListener('arg:opencapability',async e=>{try{const registry=await loadRegistry(),{entry,op,direction}=resolveCapability(registry,e.detail?.id,e.detail?.op,e.detail?.direction,e.detail?.preferredVariant||e.detail?.variant);if(entry&&entry.listed!==false)await panel(capabilityRoute(entry,op,direction));}catch(error){capabilityWorkspace.error(error);}});
// The real controller has already applied and invalidated this direction.
// Synchronize identity in place: tearing the workspace down here drops rapid
// changes while listeners are detached and can steal keyboard focus.
function syncTaskSelection({op,direction}){
 const entry=currentCapability;if(!entry)return;
 const selection={id:entry.id,op,direction,variant:entry.variantId};
 lastTaskRoutes.set(entry.open.panel,selection);
 history.replaceState(null,'','#'+capabilityRoute(entry,op,direction));
 const detail={name:entry.open.panel,taskId:entry.taskId||entry.id,capabilityId:entry.id,topicKind:entry.topicKind,kind:entry.open.kind,operation:op,direction,implementation:implementationSelections.get(entry.open.panel)};
 document.dispatchEvent(new CustomEvent('arg:taskselectionchange',{detail}));
 document.dispatchEvent(new CustomEvent('arg:tasksourceschange',{detail}));
}
document.addEventListener('arg:capability-native-direction',e=>{if(currentCapability?.id===e.detail.id)syncTaskSelection({direction:e.detail.direction});});
document.addEventListener('arg:capability-direction',e=>{if(currentCapability?.id===e.detail.capabilityId)syncTaskSelection({op:e.detail.op});});
mountFooter($('main'),{navigate:panel});
mountFeedback({getTask:()=>currentCapability});
const launch=new URL(location.href);
if(launch.searchParams.has('editor')){launch.search='';launch.hash='cyberchef';history.replaceState(null,'',launch);}
panel(location.hash.slice(1) || initialRoute());
