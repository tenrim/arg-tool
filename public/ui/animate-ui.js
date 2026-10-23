// React interop for the actual Animate UI components. NativeHost exposes the
// ORIGINAL element to upstream refs/Motion; React never owns its tool children.
// No cloned inputs, editor remounts, or second event/state model.
import {createElement as h, createRoot, createPortal, flushSync, useLayoutEffect, useRef,
  AnimateUIProvider, MotionConfig, motionTokens, AnimateButton, AnimateEffect, useAnimationControls, Collapsible, Tabs, Checkbox, AnimateSelect, TriggerHighlightScope, useTriggerHighlight} from '../vendor/ui-runtime/runtime.js';

const mounts=new Map();
let reduced=()=>false,registerControl=()=>{};
export function configureAnimateUI(readReduced,register){reduced=readReduced;registerControl=register||registerControl;}

function NativeHost({node,ref,children,style,...props}){
 useLayoutEffect(()=>{
  const clean=[];
  for(const [key,value]of Object.entries(props)){
   if(key==='children'||key==='node'||key==='className'||key==='id')continue;
   // Existing controllers own native events, labels, focus and semantics. The
   // imported component owns animation through its ref and style properties.
   if(/^on[A-Z]/.test(key))continue;
   if(key==='hidden'||key==='inert'){node[key]=!!value;continue;}
   if(key.startsWith('data-')){if(value==null)node.removeAttribute(key);else node.setAttribute(key,String(value));}
  }
  for(const [key,value]of Object.entries(style||{})){
   if(key.startsWith('--'))node.style.setProperty(key,String(value));
   else node.style[key]=typeof value==='number'&&!['opacity','zIndex','flexGrow','flexShrink','scale','order'].includes(key)?value+'px':value??'';
  }
  if(typeof ref==='function'){const dispose=ref(node);clean.push(typeof dispose==='function'?dispose:()=>ref(null));}
  else if(ref){ref.current=node;clean.push(()=>{ref.current=null;});}
  return()=>clean.forEach(fn=>fn());
 });
 return children?createPortal(children,node):null;
}

function mount(node,render){
 const container=document.createDocumentFragment(),root=createRoot(container);
 let dead=false,first=true;
 const update=()=>{
  if(dead)return;
  flushSync(()=>root.render(h(AnimateUIProvider,{reducedMotion:reduced()?'always':'never',tempo:1},
   h(MotionConfig,{reducedMotion:reduced()?'always':'never'},render(first)))));
  first=false;
 };
 const handle={node,update,destroy(){if(dead)return;dead=true;mounts.delete(handle);root.unmount();}};
 mounts.set(handle,handle);update();
 return handle;
}

export function refreshAnimateUI(){for(const handle of mounts.values())handle.update();}
export function releaseAnimateUI(node,subtree=false){for(const handle of [...mounts.values()])if(handle.node===node||subtree&&node.contains(handle.node))handle.destroy();}

const entrances=new WeakMap(),pagePlays=new WeakMap();
function entrance(node,slide,fade=true){
 let handle=entrances.get(node);if(handle&&(handle.slide!==slide||handle.fade!==fade)){handle.destroy();handle=null;}if(handle)return handle;
 const original={opacity:node.style.opacity,transform:node.style.transform,willChange:node.style.willChange};
 let controls,playing=false,serial=0,complete,frame,settleFrame;
 const restore=()=>{for(const [key,value]of Object.entries(original))node.style[key]=value;};
 const settle=generation=>{
  restore();cancelAnimationFrame(settleFrame);
  // set()/the final spring value may already have queued a Motion render.
  // Release its styles after that render too, unless a newer play owns them.
  settleFrame=requestAnimationFrame(()=>{if(generation===serial&&!playing)restore();});
 };
 function Entrance(){
  const animation=useAnimationControls();
  useLayoutEffect(()=>{controls=animation;return()=>{controls=null;};},[animation]);
  return h(AnimateEffect,{asChild:true,fade,slide:slide?{direction:'up',offset:matchMedia('(pointer:coarse)').matches?8:16}:false,
   initial:false,animate:animation,children:h(NativeHost,{node})});
 }
 handle=mount(node,()=>h(Entrance));handle.slide=slide;handle.fade=fade;node.dataset.animateUi='effect';
 const cancel=()=>{serial++;cancelAnimationFrame(frame);controls?.stop();controls?.set('visible');playing=false;settle(serial);complete?.();complete=null;};
 handle.play=delay=>{
  // Motion already owns the current values and velocity. Repeated entries must
  // continue from those values, including the last few pixels of the spring.
  // Reading painted styles here interleaved layout reads with each ref's writes.
  const resume=playing;cancelAnimationFrame(frame);cancelAnimationFrame(settleFrame);controls.stop();complete?.();const generation=++serial;playing=true;
  const finished=new Promise(resolve=>{complete=resolve;});
  node.style.willChange=[original.willChange==='auto'?'':original.willChange,slide?'transform':'',fade?'opacity':''].filter(Boolean).join(', ');
  if(!resume)controls.set('hidden');
  // start() replaces the Effect transition; a delay-only override silently
  // discarded Animate UI's entrance spring and fell back to Motion's tween.
  // First expose the prepared layers to layout/ResizeObserver (select, hover
  // and textarea measurements); interpolate in the following render phase.
  // Starting inside the first rAF ran ahead of those observers and lost frames
  // on a cold page. Logical state/focus stay synchronous; no timer delays them.
  frame=requestAnimationFrame(()=>{
   if(generation!==serial)return;
   frame=requestAnimationFrame(()=>{
    if(generation!==serial)return;
    controls.start('visible',{...motionTokens.spring.entrance,delay:delay/1000,...(!resume?{velocity:0}:{})}).then(()=>{if(generation!==serial)return;playing=false;settle(generation);complete?.();complete=null;});
   });
  });
  return {finished,cancel(){if(generation===serial)cancel();}};
 };
 const destroy=handle.destroy;
 // The shared gate prevents starts under reduced motion. Stop this mounted
 // ref in place: remounting Effect during a policy change can revive the
 // painted intermediate style and would break synchronous cancellation.
 handle.update=cancel;
 handle.destroy=()=>{cancel();cancelAnimationFrame(settleFrame);entrances.delete(node);delete node.dataset.animateUi;destroy();restore();};
 entrances.set(node,handle);return handle;
}

// Sliding a page root would capture fixed descendants. Inspect only bounded
// visible surfaces; complex/fixed/sticky surfaces use the same Effect's fade.
function canSlide(node){
 if(getComputedStyle(node).transform!=='none'&&!(entrances.get(node)?.slide&&node.style.transform))return false;
 const walk=document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT);let item=node,count=0;
 do{if(++count>1200||['fixed','sticky'].includes(getComputedStyle(item).position))return false;}while(item=walk.nextNode());
 return true;
}
export function animatePageEntrance(root){
 const candidates=[...root.querySelectorAll('[data-ui=tool-header],[data-ui=card]')].filter(node=>
  node.closest('[data-ui=tool-panel]')===root&&!node.closest('[hidden],[inert],[data-ui=tool-help],[data-ui=provenance],.tool-provenance')&&node.getClientRects().length);
 const surfaces=candidates.filter(node=>!candidates.some(parent=>parent!==node&&parent.contains(node)));
 if(!surfaces.length)surfaces.push(root);
 const targets=new Map();
 for(const node of surfaces){
  const slide=node!==root&&node.dataset.ui==='card'&&canSlide(node);targets.set(node,{slide,fade:true});
  // A fixed/sticky editor remains stationary. Its safe immediate headings
  // and controls can still slide in while the containing surface fades.
  if(node.dataset.ui==='card'&&!slide)for(const child of node.children)if(child.dataset.ui&&!child.closest('[hidden],[inert]')&&child.getClientRects().length&&canSlide(child))targets.set(child,{slide:true,fade:false});
 }
 const previous=pagePlays.get(root)||new Map(),next=new Map();
 for(const [node,play]of previous)if(!targets.has(node))play.cancel();
 // One navigation is one entrance, rather than a staircase of independent
 // header/form/input/result starts. Upstream Effect still owns interpolation.
 for(const [node,{slide,fade}]of targets)next.set(node,entrance(node,slide,fade).play(0));
 pagePlays.set(root,next);root.dataset.motionEngine='animate-ui';
 return {engine:'animate-ui',finished:Promise.all([...next.values()].map(play=>play.finished)),cancel(){for(const play of next.values())play.cancel();}};
}

// The native select remains the form/data owner (including controller writes,
// duplicate values, optgroups, reset and validation). The upstream Select owns
// the ONLY interactive presentation, keyboard navigation and floating surface.
const selects=new WeakMap();
export function attachAnimateSelect(node){
 if(selects.has(node)||node.multiple||node.size>1||!node.isConnected)return;
 const host=document.createElement('span');host.className='ui-select-host';
 const view=document.createElement('span');view.className='ui-select-view';
 node.before(host);host.append(node,view);
 const priorTab=node.getAttribute('tabindex'),priorAria=node.getAttribute('aria-hidden');
 node.tabIndex=-1;node.setAttribute('aria-hidden','true');node.dataset.animateUi='select';
 let dead=false,pending=false,opened=false,trigger,handle,optionSerial=0;
 const optionIds=new WeakMap();
 const optionId=option=>{if(!optionIds.has(option))optionIds.set(option,String(++optionSerial));return optionIds.get(option);};
 const sync=()=>{if(pending||dead)return;pending=true;queueMicrotask(()=>{pending=false;if(!dead)handle.update();});};
 const label=()=>node.getAttribute('aria-label')||[...(node.labels||[])].map(n=>n.querySelector('[data-ui=field-label],span')?.textContent||n.textContent).join(' ').trim()||node.title||'选择';
 function content(){
  const options=[...node.options],selectedOption=options[node.selectedIndex];
  const item=option=>h(AnimateSelect.Item,{key:optionId(option),value:optionId(option),label:option.label,disabled:option.disabled||option.parentElement.disabled,className:'ui-select-item'},
   h(AnimateSelect.ItemText,null,option.label),h(AnimateSelect.ItemIndicator,{className:'ui-select-check'},'✓'));
  return h(AnimateSelect.Root,{value:node.selectedIndex<0?null:optionId(options[node.selectedIndex]),disabled:node.disabled||!!node.closest('fieldset:disabled'),
   open:opened,onOpenChange:value=>{opened=value;sync();},
   onValueChange:(value,details)=>{
    // Option positions are not identities. Reject a callback from a render
    // that predates a native controller write; keyboard typeahead remains a
    // real edit even though upstream marks that event with reason "none".
    const option=options.find(item=>optionId(item)===value),index=[...node.options].indexOf(option);
    if(node.options[node.selectedIndex]!==selectedOption||index<0||option.disabled||option.parentElement.disabled||node.disabled){details.cancel();sync();return;}
    if(node.selectedIndex===index)return;
    node.selectedIndex=index;node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));sync();}},
   createPortal(h(AnimateSelect.Trigger,{ref:n=>{trigger=n;registerControl(n,'select-trigger');},className:'ui-select-trigger','aria-label':label(),'aria-describedby':node.getAttribute('aria-describedby')||undefined,'aria-invalid':node.getAttribute('aria-invalid')||undefined},
    h('span',{className:'ui-select-value'},options[node.selectedIndex]?.label||'请选择'),h(AnimateSelect.Icon,{className:'ui-select-chevron'},'⌄')),view),
   h(AnimateSelect.Portal,{container:node.closest('dialog')||document.body},h(AnimateSelect.Positioner,{sideOffset:6,align:'start',alignItemWithTrigger:false,className:'ui-select-positioner'},
    h(AnimateSelect.Popup,{className:'ui-select-popup',transition:reduced()?{duration:0}:undefined,exitTransition:reduced()?{duration:0}:undefined},h(AnimateSelect.List,{className:'ui-select-list'},
     [...node.children].map((child,i)=>child.tagName==='OPTGROUP'?h(AnimateSelect.Group,{key:'g'+i},h(AnimateSelect.GroupLabel,{className:'ui-select-group'},child.label),[...child.children].map(item)):item(child)))))));
 }
 handle=mount(node,content);selects.set(node,handle);
 const descriptors=new Map();
 for(const key of ['value','selectedIndex','disabled']){
  const native=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,key);descriptors.set(key,Object.getOwnPropertyDescriptor(node,key));
  Object.defineProperty(node,key,{configurable:true,get(){return native.get.call(this);},set(value){native.set.call(this,value);sync();}});
 }
 const observer=new MutationObserver(sync);observer.observe(node,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','selected','label','value','aria-label','aria-describedby','aria-invalid']});
 const focus=()=>trigger?.focus({preventScroll:true});
 const invalid=event=>{event.preventDefault();focus();};
 node.addEventListener('focus',focus);node.addEventListener('invalid',invalid);node.addEventListener('change',sync);
 const form=node.form;form?.addEventListener('reset',sync);
 handle.checkVisibility=()=>{if(opened&&(!node.isConnected||node.closest('[hidden],[inert]')||node.disabled)){opened=false;sync();}};
 const destroy=handle.destroy;handle.destroy=()=>{
  if(dead)return;dead=true;observer.disconnect();node.removeEventListener('focus',focus);node.removeEventListener('invalid',invalid);node.removeEventListener('change',sync);form?.removeEventListener('reset',sync);
  for(const[key,descriptor]of descriptors){if(descriptor)Object.defineProperty(node,key,descriptor);else delete node[key];}
  if(priorTab==null)node.removeAttribute('tabindex');else node.setAttribute('tabindex',priorTab);
  if(priorAria==null)node.removeAttribute('aria-hidden');else node.setAttribute('aria-hidden',priorAria);
  delete node.dataset.animateUi;selects.delete(node);destroy();host.before(node);host.remove();
 };
}
export function syncAnimateVisibility(){for(const handle of mounts.values())handle.checkVisibility?.();}

// One upstream hover implementation for every native action group. A separate
// shadow paint-only host keeps React surfaces out of native button/list children;
// callers may replace labels, reorder links or clear lists without removing a
// portal behind React's back. The group, not each item, is the stacking context.
const hoverGroups=new WeakMap(),hoverShadows=new WeakSet();
const shadowHosts=new Set(['ARTICLE','ASIDE','BLOCKQUOTE','DIV','FOOTER','H1','H2','H3','H4','H5','H6','HEADER','MAIN','NAV','P','SECTION','SPAN']);
const hoverSelector='[data-ui=button],[data-ui=icon-button],a.rail-tool';
export function hoverOwner(node){
 if(!node?.matches?.(hoverSelector)||node.closest('[data-ui=tab-list],.ui-select-host')||node.getAttribute('role')==='tab')return null;
 let owner=node.matches('.rail-tool,[data-sidebar=menu-button]')?node.closest('.rail-scroll,.rail-site-links')||node.closest('.workbench-sidebar')||node.parentElement:node.parentElement;
 // A local action group may own a paint layer; an entire workspace may not.
 // Promoting a panel/main/dock to an isolated layer traps fixed editors below
 // the site header and changes hit testing far outside the hovered control.
 while(owner){
  if(owner.matches('main,.panel,.layout,.ui-dock,[data-ui=tool-panel]'))return null;
  if(shadowHosts.has(owner.tagName)&&(!owner.shadowRoot||hoverShadows.has(owner.shadowRoot)))break;
  owner=owner.parentElement;
 }
 return owner;
}
export function attachAnimateHoverGroup(node){
 if(!node?.isConnected||node.closest('[hidden]'))return;
 const existing=hoverGroups.get(node);if(existing){existing.refreshPolicy();return;}
 if(!node.getClientRects().length)return;
 // A shadow paint layer leaves light-DOM children, list indices and the last
 // provenance footer untouched. The slot displays the ORIGINAL live controls.
 const shadow=node.shadowRoot||node.attachShadow({mode:'open'});
 if(!hoverShadows.has(shadow)){hoverShadows.add(shadow);const slot=document.createElement('slot');slot.setAttribute('part','hover-slot');shadow.append(slot);}
 const host=document.createElement('div');host.className='ui-hover-surfaces';host.setAttribute('part','hover-surfaces');host.setAttribute('aria-hidden','true');shadow.append(host);
 node.classList.add('ui-hover-group');
 const root=createRoot(host);let dead=false,pending=false,items=[],serial=0,lastReduced,lastSpatial,visible=true;
 const ids=new WeakMap();
 function Surface({item,disabled}){const {ref,highlight}=useTriggerHighlight(disabled,{beside:true});useLayoutEffect(()=>ref(item),[item,ref]);return highlight;}
 const render=()=>{
  const reduce=reduced();visible=node.isConnected&&!node.closest('[hidden],[inert]');
  const next=[...node.querySelectorAll(hoverSelector)].filter(item=>hoverOwner(item)===node&&item.isConnected&&!item.closest('[hidden],[inert]')).map(item=>{if(!ids.has(item))ids.set(item,++serial);return{item,disabled:item.matches(':disabled,[aria-disabled=true]'),key:ids.get(item)};});
  // A travelling highlight belongs to a linear menu, not a two-dimensional
  // keypad or wrapped action group. In a spatial layout each original control
  // retains upstream hover/press feedback without a rectangle flying across keys.
  const boxes=next.map(({item})=>item.getBoundingClientRect());
  const spatial=boxes.some(b=>Math.abs(b.left-boxes[0].left)>8)&&boxes.some(b=>Math.abs(b.top-boxes[0].top)>8);
  if(items.length===next.length&&items.every((v,i)=>v.item===next[i].item&&v.disabled===next[i].disabled)&&lastReduced===reduce&&lastSpatial===spatial)return;
  items=next;lastReduced=reduce;lastSpatial=spatial;node.dataset.hoverLayout=spatial?'spatial':'linear';
  const surfaces=items.map(({key,...props})=>spatial?h(TriggerHighlightScope,{key},h(Surface,props)):h(Surface,{key,...props}));
  flushSync(()=>root.render(h(AnimateUIProvider,{reducedMotion:reduce?'always':'never'},h(TriggerHighlightScope,{key:(reduce?'reduced':'motion')+spatial},surfaces))));
 };
 const sync=()=>{if(dead||pending)return;pending=true;queueMicrotask(()=>{pending=false;if(dead)return;render();});};
 const observer=new MutationObserver(records=>{if(records.some(r=>!host.contains(r.target)))sync();});
 observer.observe(node,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','aria-disabled','hidden','inert']});
 const resize=new ResizeObserver(sync);resize.observe(node);
 const handle={node,update:render,refreshPolicy(){if(lastReduced!==reduced())render();},checkVisibility(){if(visible!==(node.isConnected&&!node.closest('[hidden],[inert]')))sync();},destroy(){if(dead)return;dead=true;observer.disconnect();resize.disconnect();hoverGroups.delete(node);mounts.delete(handle);root.unmount();host.remove();node.classList.remove('ui-hover-group');delete node.dataset.hoverLayout;}};
 hoverGroups.set(node,handle);mounts.set(handle,handle);render();
}

const buttons=new WeakMap();
export function attachAnimateButton(node){
 if(node.disabled)return;
 const existing=buttons.get(node);if(existing){existing.refresh();return;}
 let lastReduced;
 const handle=mount(node,()=>{lastReduced=reduced();return h(AnimateButton,{asChild:true,tapScale:.98,transition:lastReduced?{duration:0}:undefined,children:h(NativeHost,{node})});});
 // Pointer/focus events during a press must not remount the Motion ref and
 // capture the pressed transform as its new resting value.
 handle.refresh=()=>{if(lastReduced!==reduced())handle.update();};
 node.dataset.animateUi='button';buttons.set(node,handle);
 const destroy=handle.destroy;handle.destroy=()=>{buttons.delete(node);delete node.dataset.animateUi;destroy();node.style.removeProperty('transform');};
}

// Real React DOM owns the animated shell; the original panel is adopted once
// as an opaque child. This avoids ref-only adapters resetting Motion on rerender.
export function attachAnimateDisclosure(panel,initialOpen){
 let open=initialOpen,instant=false,frame,dead=false;
 const host=document.createElement('div');host.className='ui-disclosure-host';panel.before(host);
 const root=createRoot(host);
 let shell;
 function Content(){
  const ref=useRef(null);
  useLayoutEffect(()=>{ref.current.append(panel);return()=>{if(panel.parentNode===ref.current)host.before(panel);};},[]);
  return h('div',{ref,style:{display:'flow-root'}});
 }
 const render=()=>{if(dead)return;flushSync(()=>root.render(h(AnimateUIProvider,{reducedMotion:reduced()?'always':'never'},
  h(Collapsible.Root,{open,style:{display:'contents'},children:h(Collapsible.Panel,{
   keepMounted:true,ref:node=>{shell=node;},'data-animate-ui':'collapsible',
   transition:instant||reduced()?{duration:0}:undefined,exitTransition:instant||reduced()?{duration:0}:undefined,
   children:h(Content)
  })}))));
 };
 panel.hidden=false;delete panel.dataset.motion;render();
 const handle={node:panel,update:render,destroy(){if(dead)return;dead=true;mounts.delete(handle);cancelAnimationFrame(frame);observer.disconnect();root.unmount();host.remove();}};
 mounts.set(handle,handle);
 // Opening content must be measurable even while the previous closed shell
 // is awaiting its scheduled render. A late hidden mutation cannot undo open.
 const sync=()=>{if(shell){const hidden=!open&&shell.hidden;if(panel.hidden!==hidden)panel.hidden=hidden;panel.inert=!open;}};
 const observer=new MutationObserver(sync);observer.observe(host,{subtree:true,attributes:true,attributeFilter:['hidden']});sync();
 return{set(value,{immediate=false}={}){if(value===open&&!immediate)return;open=value;instant=immediate;if(open)panel.hidden=false;panel.inert=!open;cancelAnimationFrame(frame);if(immediate||reduced()){render();panel.hidden=!open;}else frame=requestAnimationFrame(render);},destroy:handle.destroy};
}

// Animate UI's List supplies its own measured, interruptible sliding indicator.
// Existing tabs retain the same elements and their keyboard/selection owner.
export function attachAnimateTabs(bar){
 const handle=mount(bar,()=>h(Tabs.Root,{value:'native',children:h(Tabs.List,{render:h(NativeHost,{node:bar})})}));
 bar.dataset.animateUi='tabs';
 return{update(){handle.update();for(const tab of bar.querySelectorAll('[role=tab]'))tab.setAttribute('data-animate-ui-tab','');},destroy(){handle.destroy();delete bar.dataset.animateUi;}};
}

// The original checkbox remains the sole focusable form field. Animate UI's
// checked/indeterminate Indicator is portalled over it, without a second input
// in the live document. Programmatic writes use the native property setters.
const checks=new WeakMap();
export function attachAnimateCheckbox(node){
 if(checks.has(node)||node.type!=='checkbox'||!node.parentElement)return;
 const overlay=document.createElement('span');overlay.className='ui-check-indicator';overlay.setAttribute('aria-hidden','true');node.after(overlay);
 const check=h('svg',{viewBox:'0 0 24 24',width:16,height:16,fill:'none',stroke:'currentColor',strokeWidth:3},h('path',{d:'m5 12 4 4L19 6'}));
 const dash=h('svg',{viewBox:'0 0 24 24',width:16,height:16,fill:'none',stroke:'currentColor',strokeWidth:3},h('path',{d:'M5 12h14'}));
 const handle=mount(node,()=>h(Checkbox.Root,{checked:node.checked,indeterminate:node.indeterminate,children:createPortal(h(Checkbox.Indicator,{children:node.indeterminate?dash:check}),overlay)}));
 checks.set(node,handle);node.dataset.animateUi='checkbox';
 const descriptors=new Map();
 for(const key of ['checked','indeterminate']){
  const descriptor=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,key);descriptors.set(key,Object.getOwnPropertyDescriptor(node,key));
  Object.defineProperty(node,key,{configurable:true,get(){return descriptor.get.call(this);},set(value){descriptor.set.call(this,value);handle.update();}});
 }
 const sync=()=>handle.update();node.addEventListener('change',sync);
 const position=()=>{overlay.style.left=node.offsetLeft+'px';overlay.style.top=node.offsetTop+'px';};
 const resize=new ResizeObserver(position);resize.observe(node.parentElement);position();
 const destroy=handle.destroy;handle.destroy=()=>{checks.delete(node);node.removeEventListener('change',sync);resize.disconnect();for(const[key,descriptor]of descriptors){if(descriptor)Object.defineProperty(node,key,descriptor);else delete node[key];}delete node.dataset.animateUi;destroy();overlay.remove();};
}
