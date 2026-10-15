// Shared motion operates on genuine component instances through core.js. It
// never rebuilds inputs, snapshots private content, or delays logical state.
const running = new Map();
let preference, installed = false, quietUntil = 0;
const enterNames = new Set(['tool-panel', 'tab-panel', 'card', 'result', 'notice']);

function timing(style, token, fallback) {
  const value = style.getPropertyValue(token).trim().match(/^(\d*\.?\d+)(ms|s)$/);
  return {
    duration: value ? Number(value[1]) * (value[2] === 's' ? 1000 : 1) : fallback,
    easing: style.getPropertyValue('--ui-motion-ease').trim() || 'cubic-bezier(.2,.8,.2,1)',
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
export function animatePresence(node, {kind = 'enter', delay = 0} = {}) {
  if (!motionAllowed() || performance.now() < quietUntil || !node.isConnected || node.closest('[hidden]') || !node.getClientRects().length || !node.animate) return;
  if (kind === 'feedback' && running.has(node)) return;
  // Repeated notifications settle at the CURRENT painted position, instead of
  // rewinding the same node to its starting position.
  const previous = running.get(node), style = getComputedStyle(node);
  const options = timing(style, kind === 'feedback' ? '--ui-motion-fast' : '--ui-motion-enter', kind === 'feedback' ? 140 : 180);
  if (!options.duration) {cancelMotion(node);return;}
  const fade = node.dataset.motion === 'fade';
  let from = previous ? {opacity: style.opacity, translate: style.translate} :
    {opacity: kind === 'feedback' ? .65 : 0, translate: kind === 'feedback' ? '0 0' : `0 ${matchMedia('(pointer: coarse)').matches ? 4 : 6}px`};
  if (fade) from = {opacity: from.opacity};
  cancelMotion(node);
  const animation = node.animate([from, fade ? {opacity:1} : {opacity: 1, translate: '0 0'}],
    {...options, delay, fill: 'both'});
  animation.id = `ui-${kind}`; running.set(node, animation);
  const release = () => {if (running.get(node) === animation) {running.delete(node); animation.cancel();}};
  animation.finished.then(release, release);
}

// Keyed collection motion is shared by native visual selectors as well as lists.
// update() remains synchronous and atomic; no snapshots or outgoing DOM copies.
export function animateCollection(container, update, {key = node => node.dataset.choice || node.dataset.record || node.id} = {}) {
  const first = new Map(), allowed = motionAllowed() && performance.now() >= quietUntil && container.getClientRects().length;
  if (allowed) for (const node of [...container.children].slice(0,48)) {
    const id = key(node);if (!id) continue;
    const style = getComputedStyle(node);
    first.set(id,{x:node.offsetLeft,y:node.offsetTop,transform:style.transform,opacity:style.opacity});
  }
  const result = update();
  if (!allowed) return result;
  for (const node of [...container.children].slice(0,48)) {
    const old = first.get(key(node));
    if (!old) {animatePresence(node);continue;}
    const style = getComputedStyle(node), dx = old.x-node.offsetLeft, dy = old.y-node.offsetTop;
    const transform = `${dx || dy ? `translate(${dx}px,${dy}px) ` : ''}${old.transform==='none'?'':old.transform}`.trim() || 'none';
    if (transform===style.transform && old.opacity===style.opacity) continue;
    cancelMotion(node);
    const options = timing(style, '--ui-motion-enter', 180);
    if (!options.duration) continue;
    const animation = node.animate([{transform,opacity:old.opacity},{transform:style.transform,opacity:style.opacity}],
      {...options,fill:'both'});
    animation.id='ui-collection';running.set(node,animation);
    const release=()=>{if(running.get(node)===animation){running.delete(node);animation.cancel();}};
    animation.finished.then(release,release);
  }
  return result;
}

export function installMotion() {
  if (installed) return; installed = true;
  motionAllowed();
  preference.addEventListener('change', () => {if (preference.matches) for (const node of [...running.keys()]) cancelMotion(node);});
  document.addEventListener('arg:preferenceschange',()=>{if(!motionAllowed())for(const node of [...running.keys()])cancelMotion(node);});
  document.addEventListener('visibilitychange', () => {if (document.hidden) for (const node of [...running.keys()]) cancelMotion(node);});
  // Filtering, typing, scrubbing and continuous previews must not replay entry
  // animations on every event. Button clicks still receive CSS press feedback.
  document.addEventListener('input', () => {quietUntil = performance.now() + 180;}, {capture: true, passive: true});
}

export function motionBatch({mounts, unmounts, states, content, componentOf}) {
  for (const node of unmounts) if (!node.isConnected) cancelMotion(node, true);
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

// No extra DOM children: tabs retain their original keyboard order and tests.
// The indicator lives in the shared TabList pseudo-element and follows actual
// geometry after scrolling, font loading, responsive changes and dynamic tabs.
export function tabIndicator(bar, current) {
  let frame;
  const measure = () => {
    frame = undefined;
    const tab = current();
    if (!bar.isConnected || !tab || !bar.clientWidth) return;
    // Layout coordinates ignore the button's transient press scale.
    bar.style.setProperty('--ui-tab-x', `${tab.offsetLeft}px`);
    bar.style.setProperty('--ui-tab-y', `${tab.offsetTop + tab.offsetHeight - 2}px`);
    bar.style.setProperty('--ui-tab-width', `${tab.offsetWidth}px`);
    bar.dataset.indicator = 'ready';
  };
  const update = () => {cancelAnimationFrame(frame); frame = requestAnimationFrame(measure);};
  const resize = new ResizeObserver(update); resize.observe(bar);
  bar.addEventListener('scroll', update, {passive: true});
  document.fonts?.addEventListener('loadingdone', update);
  return {update, destroy() {cancelAnimationFrame(frame);resize.disconnect();bar.removeEventListener('scroll', update);document.fonts?.removeEventListener('loadingdone', update);bar.removeAttribute('data-indicator');for(const key of ['--ui-tab-x','--ui-tab-y','--ui-tab-width'])bar.style.removeProperty(key);}};
}
