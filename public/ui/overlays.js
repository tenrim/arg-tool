import {create, emit, uid, setState, onDisconnect} from './core.js';
import {Button} from './controls.js';
import {animatePresence, cancelMotion, motionAllowed, tabIndicator} from './motion.js';

export function Dialog(options = {}) {
  const node = create('dialog', 'dialog', options);
  node.addEventListener('close', () => emit(node, 'close', {returnValue: node.returnValue}));
  node.addEventListener('cancel', event => emit(node, 'cancel', {originalEvent: event}));
  return node;
}
export function dialogController(node, {trigger, closeButton, initialFocus, backdrop = true} = {}) {
  let returnFocus, viewportFrame, exitFrame, exitRevision = 0, leaving = false, destroyed = false;
  const viewport = window.visualViewport;
  const clearExitViewport = () => {node.style.removeProperty('--ui-exit-height');node.style.removeProperty('--ui-exit-top');};
  const measureViewport = () => {
      if (!node.open) return;
      // Android keyboards may shrink only the visual viewport. Keep every modal
      // within that visible rectangle, including when the browser pans it.
      node.style.setProperty('--ui-viewport-height', `${Math.min(viewport?.height ?? innerHeight, innerHeight)}px`);
      node.style.setProperty('--ui-viewport-top', `${viewport?.offsetTop ?? 0}px`);
  };
  const fitViewport = () => {
    cancelAnimationFrame(viewportFrame);
    viewportFrame = requestAnimationFrame(measureViewport);
  };
  const stopViewport = () => {
    cancelAnimationFrame(viewportFrame);
    viewport?.removeEventListener('resize', fitViewport);
    viewport?.removeEventListener('scroll', fitViewport);
    window.removeEventListener('resize', fitViewport);
    node.style.removeProperty('--ui-viewport-height');
    node.style.removeProperty('--ui-viewport-top');
  };
  const open = () => {
    if (destroyed || node.open) return;
    exitRevision++;cancelAnimationFrame(exitFrame);leaving = false;node.inert = false;clearExitViewport();
    returnFocus = document.activeElement;
    node.showModal();
    viewport?.addEventListener('resize', fitViewport);
    viewport?.addEventListener('scroll', fitViewport);
    window.addEventListener('resize', fitViewport);
    measureViewport();
    trigger?.setAttribute('aria-expanded', 'true');
    (typeof initialFocus === 'function' ? initialFocus() : initialFocus)?.focus();
    emit(node, 'open');
  };
  const close = () => {
    if (destroyed || !node.open) return;
    const revision = ++exitRevision;
    leaving = motionAllowed() && CSS.supports('transition-behavior', 'allow-discrete');
    if (leaving) {
      node.style.setProperty('--ui-exit-height',node.style.getPropertyValue('--ui-viewport-height'));
      node.style.setProperty('--ui-exit-top',node.style.getPropertyValue('--ui-viewport-top'));
    }
    node.inert = true;node.close();afterClose();
    // This only coordinates visual cleanup (e.g. moving a sidebar back).
    // Native close, focus restoration and ARIA already happened above.
    exitFrame = requestAnimationFrame(() => {
      Promise.allSettled(node.getAnimations().map(animation => animation.finished)).then(() => {
        if (revision !== exitRevision || node.open) return;
        leaving = false;clearExitViewport();emit(node, 'exitcomplete');
      });
    });
  };
  const escape = event => {
    if (event.key === 'Escape' && node.open) {event.preventDefault(); event.stopPropagation(); close();}
  };
  const dismiss = event => {
    if (!backdrop || event.target !== node) return;
    const rect = node.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
  };
  const afterClose = () => {
    // A delayed native close event may belong to a previous open/close cycle.
    if (node.open) return;
    stopViewport();
    trigger?.setAttribute('aria-expanded', 'false');
    if ((document.activeElement === document.body || node.contains(document.activeElement)) && returnFocus?.isConnected && !returnFocus.closest('[hidden]')) returnFocus.focus({preventScroll: true});
  };
  closeButton?.addEventListener('click', close);
  node.addEventListener('click', dismiss);
  node.addEventListener('keydown', escape);
  node.addEventListener('close', afterClose);
  const destroy = () => {
    if (destroyed) return;
    close();destroyed=true;exitRevision++;cancelAnimationFrame(exitFrame);leaving=false;
    for (const animation of node.getAnimations()) animation.cancel();
    clearExitViewport();stopViewport();closeButton?.removeEventListener('click', close);node.removeEventListener('click', dismiss);node.removeEventListener('keydown', escape);node.removeEventListener('close', afterClose);releaseDisconnect();
  };
  const releaseDisconnect = onDisconnect(node,destroy);
  return {open, close, get leaving() {return leaving;}, destroy};
}
export function Disclosure(options = {}) {
  const node = create('disclosure', 'details', options);
  node.addEventListener('toggle', () => emit(node, 'toggle', {open: node.open}));
  return node;
}
export function disclosureController(trigger, panel, {closedLabel, openLabel, responsiveQuery} = {}) {
  let destroyed = false;
  const viewport=responsiveQuery?matchMedia(responsiveQuery):null;
  panel.dataset.motion = 'collapse';
  if (!panel.id) panel.id = uid('disclosure');
  trigger.setAttribute('aria-controls', panel.id);
  const toggle = open => {
    if (destroyed) return;
    panel.inert = !open;
    setState(panel, {hidden: !open}); setState(trigger, {expanded: open});
    if (closedLabel && openLabel) trigger.textContent = open ? openLabel : closedLabel;
    emit(panel, 'toggle', {open});
  };
  const click = () => toggle(panel.hidden);
  const syncViewport=()=>{
    // A desktop container is not collapsing. Leaving collapse motion attached
    // clips nested floating menus even after the opening animation has settled.
    if(viewport.matches)panel.dataset.motion='collapse';else delete panel.dataset.motion;
    toggle(!viewport.matches);
  };
  trigger.addEventListener('click', click);
  if(viewport){viewport.addEventListener('change',syncViewport);syncViewport();}else toggle(!panel.hidden);
  const destroy = () => {if (destroyed) return;destroyed = true;trigger.removeEventListener('click', click);viewport?.removeEventListener('change',syncViewport);releaseTrigger();releasePanel();};
  const releaseTrigger = onDisconnect(trigger, destroy), releasePanel = onDisconnect(panel, destroy);
  return {toggle, destroy};
}
export const TabList = (options = {}) => create('tab-list', 'div', {...options, attrs: {role: 'tablist', ...options.attrs}});
export const TabPanel = (options = {}) => create('tab-panel', 'div', {...options, attrs: {role: 'tabpanel', ...options.attrs}});
export function tabsController(bar, items, {initial, onSelect, visibility = true} = {}) {
  const entries = new Map(); let active, destroyed = false;
  const indicator = tabIndicator(bar, () => entries.get(active)?.tab);
  function add(id, title, panel, button) {
    if (destroyed) throw Error('标签控制器已销毁。');
    if (entries.has(id)) throw Error(`标签 ID 重复：${id}`);
    if (!panel.id) panel.id = uid('tab-panel');
    const tab = button || Button({text: title});
    if (!tab.id) tab.id = uid('tab');
    tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', tab.id);
    const click = () => select(id);
    tab.addEventListener('click', click);
    if (!tab.parentNode) bar.append(tab);
    entries.set(id, {panel, tab, click});
    tab.tabIndex = -1; tab.setAttribute('aria-selected', 'false');
    if (visibility) panel.hidden = true;
    indicator.update();
    return tab;
  }
  function select(id, {focus = false} = {}) {
    if (destroyed || !entries.has(id) || entries.get(id).tab.disabled) return false;
    const changed = active !== id; active = id;
    for (const [key, {panel, tab}] of entries) {
      const selected = key === id;
      if (visibility) panel.hidden = !selected;
      setState(tab, {selected}); tab.tabIndex = selected ? 0 : -1;
    }
    if (focus) entries.get(id).tab.focus();
    onSelect?.(id, entries.get(id).panel);
    indicator.update();
    if (changed && !visibility) animatePresence(entries.get(id).panel);
    emit(bar, 'select', {id}); return true;
  }
  const keyboard = event => {
    const keys = [...entries.keys()].filter(key => !entries.get(key).tab.disabled);
    const index = keys.findIndex(key => entries.get(key).tab === document.activeElement);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? keys.length - 1 :
      (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + keys.length) % keys.length;
    select(keys[next], {focus: true});
  };
  for (const item of items) add(...item);
  bar.addEventListener('keydown', keyboard);
  const firstEnabled = [...entries.keys()].find(id => !entries.get(id).tab.disabled);
  if (!select(initial ?? firstEnabled) && firstEnabled != null) select(firstEnabled);
  const destroy = () => {if (destroyed) return;destroyed=true;indicator.destroy();bar.removeEventListener('keydown', keyboard);for (const {panel, tab, click} of entries.values()) {tab.removeEventListener('click', click);cancelMotion(panel, true);}releaseDisconnect();};
  const releaseDisconnect = onDisconnect(bar, destroy);
  return {select, add, get active() {return active;}, destroy};
}
