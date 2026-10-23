// Shared motion operates on genuine component instances through core.js. It
// never rebuilds inputs, snapshots private content, or delays logical state.
import {animate as motionAnimate, animateDOM, dialogMotionTargets, motionTokens, toCssTiming} from '../vendor/ui-runtime/runtime.js';
import {configureAnimateUI, refreshAnimateUI, releaseAnimateUI, animatePageEntrance, attachAnimateButton, attachAnimateCheckbox, attachAnimateTabs, attachAnimateSelect, syncAnimateVisibility, attachAnimateHoverGroup, hoverOwner} from './animate-ui.js';
const running = new Map();
const pressedStates=new WeakMap();

// Motion owns interpolation and interruption; preserve underlying CSS after
// completion instead of leaving animated inline values attached to tool nodes.
function animate(node, frames, {duration, easing, delay=0}) {
  const properties=Object.keys(frames[0]);
  const original=new Map(properties.map(key=>[key,node.style[key]]));
  const values=Object.fromEntries(properties.map(key=>[key,frames.map(frame=>frame[key])]));
  const ease=easing?.startsWith('cubic-bezier')?easing.slice(easing.indexOf('(')+1,-1).split(',').map(Number):easing;
  const controls=motionAnimate(node,values,{duration:duration/1000,delay:delay/1000,ease});
  let cancelled=false;
  return {finished:controls.finished,cancel(){if(cancelled)return;cancelled=true;controls.cancel();for(const[key,value]of original)node.style[key]=value;},
    set id(value){node.dataset.motionEngine='motion';for(const item of controls.animations||[])if(item.animation)item.animation.id=value;}};
}
let preference, installed = false, quietUntil = 0;
const enterNames = new Set(['tool-panel', 'tab-panel', 'card', 'result', 'notice']);

function timing(style, token, fallback) {
  const value = style.getPropertyValue(token).trim().match(/^(\d*\.?\d+)(ms|s)$/);
  return {
    duration: value ? Number(value[1]) * (value[2] === 's' ? 1000 : 1) : fallback,
    easing: style.getPropertyValue('--ui-motion-ease').trim() || 'cubic-bezier(.22,1,.36,1)',
  };
}

export function motionAllowed() {
  preference ??= matchMedia('(prefers-reduced-motion: reduce)');
  return !preference.matches && document.documentElement.dataset.uiMotion !== 'reduce' && document.visibilityState !== 'hidden';
}
export function cancelMotion(node, subtree = false) {
  for (const [target, animation] of running) {
    if (target === node || subtree && node.contains(target)) {
      running.delete(target); animation.cancel();
    }
  }
}
export function animateDialog(node,open){
  const previous=running.has(node),style=getComputedStyle(node);
  const current={opacity:style.opacity,transform:style.transform,filter:style.filter};
  cancelMotion(node);
  const side=node.classList.contains('workbench-drawer')?'left':node.classList.contains('ui-dock')?'right':undefined;
  const targets=dialogMotionTargets({side,reduce:!motionAllowed(),enter:side?motionTokens.transition.sheet:{...motionTokens.spring.dialog,opacity:motionTokens.transition.dialogFade},exit:motionTokens.transition.dismiss});
  node.style.setProperty('--ui-dialog-presence-duration',open?'400ms':'200ms');
  if(!motionAllowed())return Promise.resolve();
  const to=open?targets.animate:targets.exit,from=previous?current:open?targets.initial:current;
  const properties=['opacity','transform',...(!side?['filter']:[])];
  const values=Object.fromEntries(properties.map(key=>[key,[from[key],to[key]]]));
  const controls=animateDOM(node,values,to.transition);
  const animation={finished:controls.finished,cancel(){controls.cancel();for(const key of properties)node.style.removeProperty(key);}};
  running.set(node,animation);node.dataset.motionEngine='motion';
  controls.finished.then(()=>{if(open&&running.get(node)===animation){running.delete(node);animation.cancel();}},()=>{});
  return controls.finished;
}
export function animatePresence(node, {kind = 'enter', delay = 0} = {}) {
  if(node.dataset.motion==='popover')return; // the presence surface owns both enter and exit
  if (!motionAllowed() || performance.now() < quietUntil || !node.isConnected || node.closest('[hidden],[data-motion-pending]') || !node.getClientRects().length || !node.animate) return;
  if (kind === 'feedback' && running.has(node)) return;
  // Repeated notifications settle at the CURRENT painted position, instead of
  // rewinding the same node to its starting position.
  const previous = running.get(node), style = getComputedStyle(node);
  const options = timing(style, kind === 'feedback' ? '--ui-motion-fast' : '--ui-motion-enter', kind === 'feedback' ? 160 : 240);
  if (!options.duration) {cancelMotion(node);return;}
  if(kind==='enter'&&node.dataset.ui==='tool-panel'){
    for(const target of [...running.keys()])if(target!==node&&node.contains(target))cancelMotion(target);
    if(previous?.engine!=='animate-ui')cancelMotion(node);else running.delete(node);
    const animation=animatePageEntrance(node);running.set(node,animation);
    const release=()=>{if(running.get(node)===animation){running.delete(node);animation.cancel();}};
    animation.finished.then(release,release);return;
  }
  // An explicit outer entry can arrive after nested mounts have started.
  // Let the workspace own that transition without stacking child effects.
  if(kind==='enter')for(const target of [...running.keys()])if(target!==node&&node.contains(target))cancelMotion(target);
  const fade = node.dataset.motion === 'fade';
  const displacement = node.dataset.motion === 'dock' ? '24px 0' : `0 ${matchMedia('(pointer: coarse)').matches ? 4 : 10}px`;
  let from = previous ? {opacity: style.opacity, translate: style.translate} :
    {opacity: kind === 'feedback' ? .65 : 0, translate: kind === 'feedback' ? '0 0' : displacement};
  if (fade) from = {opacity: from.opacity};
  cancelMotion(node);
  const animation = animate(node, [from, fade ? {opacity:1} : {opacity: 1, translate: '0 0'}],
    {...options, delay, fill: 'both'});
  animation.id = `ui-${kind}`; running.set(node, animation);
  const release = () => {if (running.get(node) === animation) {running.delete(node); animation.cancel();}};
  animation.finished.then(release, release);
}

// Animate only the reserved gutter, never transform the workspace root (which
// contains sticky/fixed tools). The update and focus changes happen immediately.
export function animateLayoutChange(node, update) {
  const allowed = motionAllowed() && performance.now() >= quietUntil && node.isConnected && node.getClientRects().length && node.animate;
  const from = allowed ? getComputedStyle(node).paddingRight : null;
  cancelMotion(node);
  const result = update();
  if (!allowed || !node.isConnected) return result;
  const style = getComputedStyle(node), to = style.paddingRight;
  const options = timing(style, '--ui-motion-overlay', 300);
  if (from === to || !options.duration) return result;
  const animation = animate(node, [{paddingRight:from},{paddingRight:to}], {...options,fill:'both'});
  animation.id='ui-layout';running.set(node,animation);
  const release=()=>{if(running.get(node)===animation){running.delete(node);animation.cancel();}};
  animation.finished.then(release,release);
  return result;
}

// Keyed collection motion is shared by native visual selectors as well as lists.
// update() remains synchronous and atomic; no snapshots or outgoing DOM copies.
export function animateCollection(container, update, {key = node => node.dataset.choice || node.dataset.record || node.id} = {}) {
  const first = new Map(), allowed = motionAllowed() && performance.now() >= quietUntil && !container.closest('[hidden],[inert]') && container.getClientRects().length;
  if (allowed) for (const node of [...container.children].slice(0,48)) {
    const id = key(node);if (!id) continue;
    const style = getComputedStyle(node);
    // Entry effects use the individual translate property; include its painted
    // offset when a newly appearing row is reordered before its entry finishes.
    const [tx=0,ty=0]=style.translate==='none'?[]:style.translate.split(/\s+/).map(value=>parseFloat(value)||0);
    first.set(id,{x:node.offsetLeft+tx,y:node.offsetTop+ty,transform:style.transform,opacity:style.opacity});
  }
  const result = update();
  if (!allowed) return result;
  let entering = 0;
  for (const node of [...container.children].slice(0,48)) {
    const old = first.get(key(node));
    if (!old) {animatePresence(node,{delay:Math.min(entering++ * 20,80)});continue;}
    const style = getComputedStyle(node), dx = old.x-node.offsetLeft, dy = old.y-node.offsetTop;
    const transform = `${dx || dy ? `translate(${dx}px,${dy}px) ` : ''}${old.transform==='none'?'':old.transform}`.trim() || 'none';
    if (transform===style.transform && old.opacity===style.opacity) continue;
    cancelMotion(node);
    const options = timing(style, '--ui-motion-enter', 240);
    if (!options.duration) continue;
    const animation = animate(node, [{transform,opacity:old.opacity},{transform:style.transform,opacity:style.opacity}],
      {...options,fill:'both'});
    animation.id='ui-collection';running.set(node,animation);
    const release=()=>{if(running.get(node)===animation){running.delete(node);animation.cancel();}};
    animation.finished.then(release,release);
  }
  return result;
}

export function installMotion({registerControl}={}) {
  if (installed) return; installed = true;
  motionAllowed();
  configureAnimateUI(()=>!motionAllowed() || performance.now()<quietUntil,registerControl);
  // Use the installed project's own physics/curves for the native top-layer
  // dialog and layout surfaces too. No second hand-tuned timing catalogue.
  for(const [name,token]of Object.entries({dialog:motionTokens.spring.dialog,slide:motionTokens.spring.slide,height:motionTokens.spring.height,pop:motionTokens.spring.pop,overlay:motionTokens.transition.overlay,menu:motionTokens.transition.menu})){
    const {duration,easing}=toCssTiming(token);
    document.documentElement.style.setProperty('--ui-'+name+'-duration',duration+'ms');
    document.documentElement.style.setProperty('--ui-'+name+'-ease',easing);
  }
  const engage=event=>{const node=event.target.closest?.('[data-ui=button],[data-ui=icon-button],a.rail-tool');if(node){quietUntil=0;if(node.matches('[data-ui=button],[data-ui=icon-button]'))attachAnimateButton(node);const owner=hoverOwner(node);if(owner)attachAnimateHoverGroup(owner);}};
  for(const type of ['pointerover','pointerdown','focusin'])document.addEventListener(type,engage,{capture:true,passive:true});
  preference.addEventListener('change',refreshAnimateUI);
  document.addEventListener('arg:preferenceschange',refreshAnimateUI);
  document.addEventListener('visibilitychange',refreshAnimateUI);
  preference.addEventListener('change', () => {if (preference.matches) for (const node of [...running.keys()]) cancelMotion(node);});
  document.addEventListener('arg:preferenceschange',()=>{if(!motionAllowed())for(const node of [...running.keys()])cancelMotion(node);});
  document.addEventListener('visibilitychange', () => {if (document.hidden) for (const node of [...running.keys()]) cancelMotion(node);});
  // Filtering, typing, scrubbing and continuous previews must not replay entry
  // animations on every event. Explicit button clicks retain upstream press feedback.
  document.addEventListener('input', event => {if(event.detail?.uiSource!=='navigation'&&!event.target.matches?.('input[type=checkbox],input[type=radio]'))quietUntil = performance.now() + 180;}, {capture: true, passive: true});
  document.addEventListener('click',()=>{quietUntil=0;},{capture:true,passive:true});
}

export function motionBatch({mounts, unmounts, states, content, componentOf}) {
  for (const node of unmounts) if (!node.isConnected) {cancelMotion(node, true);releaseAnimateUI(node,true);}
  for(const node of mounts)if(node.isConnected&&componentOf(node)==='input'&&node.type==='checkbox')attachAnimateCheckbox(node);

  // A batch contains both an added card and all its nested component nodes.
  // Collect once before mounting refs: repeated subtree preparation mixed
  // synchronous React writes with visibility/layout reads during page entry.
  const owners=new Set(),fields=new Set();
  const prepare=root=>{
    if(!root.isConnected||root.closest('[hidden]'))return;
    const actions=root.matches?.('[data-ui=button],[data-ui=icon-button],a.rail-tool')?[root]:root.querySelectorAll?.('[data-ui=button],[data-ui=icon-button],a.rail-tool')||[];
    for(const action of actions){const owner=hoverOwner(action);if(owner)owners.add(owner);}
    const selects=root.matches?.('select[data-ui=select]')?[root]:root.querySelectorAll?.('select[data-ui=select]')||[];
    for(const field of selects)if(!field.closest('[hidden]'))fields.add(field);
  };
  const roots=new Set([...mounts,...[...states].filter(([node,keys])=>keys.has('hidden')&&!node.hidden||keys.has('open')&&node.open).map(([node])=>node)]);
  for(const node of roots){let parent=node.parentElement;while(parent&&!roots.has(parent))parent=parent.parentElement;if(!parent)prepare(node);}
  const visibleFields=[...fields].filter(field=>field.getClientRects().length);
  for(const owner of owners)attachAnimateHoverGroup(owner);
  for(const field of visibleFields)attachAnimateSelect(field);
  if(states.size)syncAnimateVisibility();
  for(const[node,keys]of states)if(keys.has('aria-pressed')){
    const value=node.getAttribute('aria-pressed'),previous=pressedStates.get(node);pressedStates.set(node,value);
    const icon=node.querySelector('svg');
    if(previous===undefined||previous===value||!icon||!node.hasAttribute('data-favorite')||!motionAllowed()||performance.now()<quietUntil)continue;
    const from=getComputedStyle(icon).transform;cancelMotion(icon);
    const animation=animate(icon,[{transform:from},{transform:value==='true'?'scale(1.18) rotate(-12deg)':'scale(.86)'},{transform:'none'}],{duration:300,easing:'cubic-bezier(.23,1,.32,1)'});
    animation.id='ui-selection';running.set(icon,animation);
    animation.finished.then(()=>{if(running.get(icon)===animation){running.delete(icon);animation.cancel();}},()=>{});
  }
  for (const [node, keys] of states) if (keys.has('disabled') && node.disabled) delete node.dataset.actionFeedback;
  for (const [node, keys] of states) if (keys.has('hidden') && node.hidden) cancelMotion(node, true);
  if (!motionAllowed() || performance.now() < quietUntil) return;
  const candidates = new Map();
  for (const node of mounts) if (enterNames.has(componentOf(node))) candidates.set(node, 'enter');
  for (const [node, keys] of states) {
    const name = componentOf(node);
    if (keys.has('hidden') && !node.hidden && enterNames.has(name)) candidates.set(node, 'enter');
    if (keys.has('data-state') && ['ready', 'success', 'error'].includes(node.dataset.state)) candidates.set(node, 'feedback');
    if (name === 'tool-panel' && node.hidden) cancelMotion(node, true);
  }
  for (const target of content) {
    const node = target.nodeType === 1 ? target : target.parentElement;
    const result = node?.closest('[data-ui=result]');
    const status = node?.closest('[data-ui=status]');
    if (result && componentOf(result) === 'result' && result.textContent.trim() && result.dataset.state !== 'empty') candidates.set(result, 'feedback');
    if (status && componentOf(status) === 'status' && status.textContent.trim()) candidates.set(status, 'feedback');
  }
  // One outer entry per branch, rather than dozens of nested moving fields. A
  // filtered/replaced list animates its result container once, not every row.
  for (const [node, kind] of candidates) {
    let parent = node.parentElement, covered = false;
    while (parent) {if (candidates.has(parent) || running.has(parent)) {covered = true; break;} parent = parent.parentElement;}
    if (!covered) animatePresence(node, {kind});
  }
}

// Animate UI owns the measured indicator; original tabs retain their keyboard
// order and selection controller. Mount only after the live bar is connected.
export function tabIndicator(bar, current) {
  let controller,frame,dead=false;
  const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
    if(dead||!bar.isConnected)return;
    controller??=attachAnimateTabs(bar);controller.update();
  });};
  return {update,destroy(){dead=true;cancelAnimationFrame(frame);controller?.destroy();}};
}
