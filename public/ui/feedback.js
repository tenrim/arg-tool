import {create, setState, onDisconnect} from './core.js';
const confirmations = new WeakMap();

// Call only after the real operation succeeds. No optimistic success on click.
export function confirmAction(node) {
  if (!node?.isConnected || node.disabled) return;
  let state = confirmations.get(node);
  if (!state) {
    const clear = () => {clearTimeout(state.timer);delete node.dataset.actionFeedback;};
    state = {clear};confirmations.set(node,state);
    node.addEventListener('click',clear);
    onDisconnect(node,()=>{clear();node.removeEventListener('click',clear);confirmations.delete(node);});
  }
  state.clear();node.dataset.actionFeedback='success';
  state.timer=setTimeout(state.clear,1600);
}

export function Status(options = {}) {
  return create('status', options.tag || 'p', {...options,
    // Preserve explicit attributes while providing the shared live-region contract.
    attrs: {role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true', ...options.attrs}});
}
export function updateStatus(node, text, tone = 'info') {
  node.textContent = text;
  node.classList.toggle('error', tone === 'error');
  setState(node, {state: tone});
}
export const Notice = options => create('notice', options?.tag || 'p', options);
export const Badge = options => create('badge', options?.tag || 'span', options);
export const EmptyState = (options = {}) => create('empty-state', options.tag || 'p', {...options, attrs: {...options.attrs, ...(options.size ? {'data-size': options.size} : {})}});
