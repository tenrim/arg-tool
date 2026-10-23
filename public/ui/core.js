// Native elements are the component instances: existing files, focus and listeners
// survive moving a component between layouts. Imported UI shells never own tool data.
import {installMotion, motionBatch} from './motion.js';
const instances = new WeakMap();
const subscribers = new WeakMap();
let sequence = 0;
let observer;

export const uid = (prefix = 'ui') => `${prefix}-${++sequence}`;

export function emit(node, phase, detail = {}) {
  const event = new CustomEvent(`ui:${phase}`, {bubbles: true, detail: {component: instances.get(node)?.name, ...detail}});
  node.dispatchEvent(event);
}

export function onLifecycle(node, phase, listener) {
  const events = subscribers.get(node) || new Map();
  const listeners = events.get(phase) || new Set();
  listeners.add(listener); events.set(phase, listeners);
  subscribers.set(node, events);
  node.addEventListener(`ui:${phase}`, listener);
  return () => {
    node.removeEventListener(`ui:${phase}`, listener);
    listeners.delete(listener);
    if (!listeners.size) events.delete(phase);
  };
}

function visit(root, fn) {
  if (root.nodeType !== 1) return;
  fn(root);
  for (const node of root.querySelectorAll('[data-ui]')) fn(node);
}

// Observation only delivers lifecycle/state hooks for already-created components;
// it never turns page DOM into components or changes layout/attributes.
function observe() {
  if (observer || !document.documentElement) return;
  installMotion({registerControl(node,name){
    // Ref callback at construction of an imported shared component. This is
    // not a DOM scan: the same instance/lifecycle registry owns its real node.
    if(!node||instances.has(node))return;
    instances.set(node,{name,node,disconnect:new Set()});node.dataset.ui=name;
  }});
  observer = new MutationObserver(records => {
    const mounts = new Set(), unmounts = new Set(), states = new Map(), content = new Set();
    for (const record of records) {
      if (record.type === 'attributes') {
        if (instances.has(record.target)) {
          const keys = states.get(record.target) || new Set();
          keys.add(record.attributeName); states.set(record.target, keys);
        }
      } else {
        content.add(record.target);
        for (const node of record.addedNodes) visit(node, n => mounts.add(n));
        for (const node of record.removedNodes) visit(node, n => unmounts.add(n));
      }
    }
    for (const node of unmounts) {
      if (node.isConnected || !instances.has(node)) continue;
      for (const dispose of instances.get(node).disconnect) dispose();
      if (subscribers.get(node)?.has('unmount')) emit(node, 'unmount');
    }
    for (const node of mounts) if (node.isConnected && subscribers.get(node)?.has('mount')) emit(node, 'mount');
    for (const [node, keys] of states) if (subscribers.get(node)?.has('state')) emit(node, 'state', {attributes: [...keys]});
    motionBatch({mounts:new Set([...mounts].filter(node=>!unmounts.has(node))), unmounts, states, content, componentOf});
  });
  observer.observe(document.documentElement, {subtree: true, childList: true, attributes: true,
    attributeFilter: ['hidden', 'open', 'disabled', 'aria-expanded', 'aria-selected', 'aria-pressed', 'aria-busy', 'data-state']});
}

export function attributes(node, attrs = {}) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    node.setAttribute(key, value === true ? '' : String(value));
  }
  return node;
}

export function children(node, content) {
  if (content == null) return node;
  for (const item of (Array.isArray(content) ? content.flat(Infinity) : [content])) {
    if (item != null && item !== false) node.append(item instanceof Node ? item : document.createTextNode(String(item)));
  }
  return node;
}

export function create(name, tag, options = {}) {
  const node = options.namespace ? document.createElementNS(options.namespace, tag) : document.createElement(tag);
  const instance = {name, node, disconnect: new Set()};
  instances.set(node, instance);
  node.dataset.ui = name;
  attributes(node, options.attrs);
  if (options.id) node.id = options.id;
  if (options.className) node.className = options.className;
  if (options.text != null) node.textContent = options.text;
  children(node, options.children);
  if (options.hidden != null) node.hidden = options.hidden;
  for (const [event, listener] of Object.entries(options.on || {})) node.addEventListener(event, listener);
  observe();
  return node;
}

export function componentOf(node) { return instances.get(node)?.name || null; }

export function setState(node, {disabled, hidden, busy, selected, expanded, pressed, state} = {}) {
  if (!instances.has(node)) throw Error('状态必须设置在 UI 组件上。');
  if (disabled != null) node.disabled = disabled;
  if (hidden != null) node.hidden = hidden;
  for (const [name, value] of Object.entries({busy, selected, expanded, pressed}))
    if (value != null) node.setAttribute(`aria-${name}`, String(value));
  if (state != null) node.dataset.state = state;
  return node;
}

export function onDisconnect(node, dispose) {
  const instance = instances.get(node);
  if (!instance) throw Error('清理函数必须关联 UI 组件。');
  instance.disconnect.add(dispose);
  return () => instance.disconnect.delete(dispose);
}
