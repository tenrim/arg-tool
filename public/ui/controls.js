import {create, attributes, uid, onDisconnect} from './core.js';
import {animatePresence} from './motion.js';
const textareaFits = new WeakMap();
export function setTextareaValue(node, value, {feedback = true} = {}) {node.value = String(value ?? '');textareaFits.get(node)?.();if (feedback && node.readOnly && node.value) animatePresence(node,{kind:'feedback'});}

function button(name, options) {
  const node = create(name, 'button', options);
  if (!node.hasAttribute('type')) node.type = options.type || 'button';
  if (options.variant) node.dataset.variant = options.variant;
  if (options.layout === 'stacked') node.dataset.layout = 'stacked';
  if (options.disabled != null) node.disabled = options.disabled;
  if (options.label) node.setAttribute('aria-label', options.label);
  return node;
}
export const Button = (options = {}) => button('button', options);
export function IconButton(options = {}) {
  if (!options.label && !options.attrs?.['aria-label']) throw Error('图标按钮需要可访问名称。');
  return button('icon-button', options);
}
export function Input(options = {}) {
  const node = create('input', 'input', options);
  attributes(node, {type: options.type, placeholder: options.placeholder});
  if (options.value != null) node.value = options.value;
  return node;
}
export function Textarea(options = {}) {
  const node = create('textarea', 'textarea', options);
  attributes(node, {rows: options.rows, placeholder: options.placeholder});
  if (options.value != null) node.value = options.value;
  if (options.autoSize || node.dataset.fit === 'content') {
    node.dataset.fit = 'content';
    let frame, lastWidth = -1;
    const minRows = options.minRows || Number(node.dataset.minRows) || 4;
    const maxRows = options.maxRows || Number(node.dataset.maxRows) || 12;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!node.isConnected || !node.clientWidth) return;
        const style = getComputedStyle(node), line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.75;
        const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        node.style.height = '0px';
        node.style.height = `${Math.min(maxRows * line + padding + 2, Math.max(minRows * line + padding + 2, node.scrollHeight + 2))}px`;
      });
    };
    const resize = new ResizeObserver(() => {if (node.clientWidth !== lastWidth) {lastWidth = node.clientWidth; fit();}});
    resize.observe(node); node.addEventListener('input', fit);
    textareaFits.set(node, fit);
    onDisconnect(node, () => {resize.disconnect();node.removeEventListener('input', fit);cancelAnimationFrame(frame);textareaFits.delete(node);});
  }
  return node;
}
export const Select = options => create('select', 'select', options);
export function Option(text, value = text, defaultSelected = false, selected = false) {
  const node = create('option', 'option', {text});
  node.value = value; node.defaultSelected = defaultSelected; node.selected = selected;
  return node;
}
export function Field(options = {}) {
  const node = create('field', options.tag || 'label', options);
  if (!options.className) node.classList.add('ui-field');
  if (options.span) node.dataset.span = options.span;
  if (options.label != null) node.append(create('field-label', 'span', {text: options.label}));
  if (options.control) {
    const control = options.control;
    if (!control.id) control.id = uid('field');
    if (node.tagName === 'LABEL') node.htmlFor = control.id;
    node.append(control);
    if (options.description || options.error) {
      const hint = create('field-description', 'span', {id: uid('field-hint'), text: options.error || options.description});
      node.append(hint); control.setAttribute('aria-describedby', hint.id);
      if (options.error) control.setAttribute('aria-invalid', 'true');
    }
  }
  return node;
}
// Search is one control surface. Its nested input must not draw a second frame.
export function SearchField(options = {}) {
  const node = create('search-field', 'label', options);
  if (options.icon) node.append(options.icon);
  if (options.control) {
    const control = options.control;
    if (!control.id) control.id = uid('search');
    node.htmlFor = control.id;
    if (options.label) control.setAttribute('aria-label', options.label);
    node.append(control);
  }
  return node;
}
export function FilePicker(options = {}) {
  const node = create('file-picker', options.tag || 'label', options);
  if (options.input) {
    if (node.tagName === 'LABEL') node.htmlFor = options.input.id || (options.input.id = uid('file'));
    node.append(options.input);
    if (options.triggerLabel) {
      options.input.hidden = true;
      const trigger = Button({className: options.buttonClass || 'secondary-button', text: options.triggerLabel});
      trigger.addEventListener('click', event => {event.preventDefault(); options.input.click();});
      node.append(trigger);
      if(options.showFilename !== false){
        const filename = create('file-name', 'span', {text: '尚未选择文件'});
        const changed=()=>{filename.textContent = [...options.input.files].map(file => file.name).join('、') || '尚未选择文件';};
        options.input.addEventListener('change',changed);
        onDisconnect(node,()=>options.input.removeEventListener('change',changed));
        node.append(filename);
      }
    }
  }
  return node;
}
export const Link = options => create('link', 'a', options);
