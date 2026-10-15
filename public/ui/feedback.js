import {create, setState} from './core.js';

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
