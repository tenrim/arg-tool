import {create, children} from './core.js';
import {Button, Input, Textarea, Select, Field, SearchField, FilePicker, Link} from './controls.js';
import {Box, Card, ToolPanel, ToolHeader, Toolbar, FormGrid, SplitView, Result, DataList, Table, Provenance, Navigation, ToolHelp} from './layout.js';
import {Status, Notice, Badge, EmptyState} from './feedback.js';
import {Dialog, Disclosure, TabList, TabPanel} from './overlays.js';

// The same factories serve imperative composition and declarative page templates.
// Templates are parsed off-document, then built as NEW component instances. They
// are never inserted as raw HTML and upgraded after the fact.
export function element(tag, options = {}, className = '') {
  if (typeof options === 'string' || typeof options === 'number') options = {text: options, className};
  else if (className) options = {...options, className};
  const attrs = options.attrs || {}, cls = options.className || attrs.class || '', role = attrs.role;
  const config = {...options, tag};
  if (tag === 'button') return Button(config);
  if (tag === 'input') return Input(config);
  if (tag === 'textarea') return Textarea(config);
  if (tag === 'select') return Select(config);
  if (tag === 'dialog') return Dialog(config);
  if (tag === 'details') return Disclosure(config);
  if (tag === 'table') return Table(config);
  if (tag === 'dl') return DataList(config);
  if (tag === 'a') return Link(config);
  if (tag === 'label') {
    if (/\bupload-zone\b/.test(cls)) return FilePicker(config);
    if (/(?:^|\s)(?:search-field|directory-search|rail-filter)(?:\s|$)/.test(cls)) return SearchField(config);
    return Field(config);
  }
  if (/(?:^|\s)(?:chef-args|science-fields|ref-fields|hunt-fields|r4-fields)(?:\s|$)/.test(cls)) return FormGrid(config);
  if (/(?:^|\s)(?:ct-work|r1-columns|r2-two)(?:\s|$)/.test(cls)) return SplitView(config);
  if (/\bsymbol-compose\b/.test(cls)) return SplitView({...config,layout:'balanced'});
  if (role === 'status' || /(?:^|\s)(?:status|ct-status)(?:\s|$)/.test(cls)) return Status(config);
  if (role === 'tablist') return TabList(config);
  if (role === 'tabpanel') return TabPanel(config);
  if (tag === 'section' && /\bpanel\b/.test(cls)) return ToolPanel(config);
  if (/\bpage-heading\b/.test(cls)) return ToolHeader(config);
  if (/\btool-provenance\b/.test(cls)) return Provenance(config);
  if (/\btool-help-panel\b/.test(cls)) return ToolHelp(config);
  if (tag === 'nav') return Navigation(config);
  if (/(?:^|\s)(?:surface|workbench|chef-stage|science-card|ref-card|ref-item|directory-card|r4-box|hunt-inputs|hunt-results|hunt-extraction)(?:\s|$)/.test(cls)) return Card(config);
  if (/(?:^|\s)(?:button-row|toolbar|chef-toolbar|science-actions|ref-actions|r4-row|ct-actions)(?:\s|$)/.test(cls)) return Toolbar(config);
  if (/\b(?:empty-state|ct-empty)\b/.test(cls)) return EmptyState(config);
  if (/\b(?:badge|ct-count)\b/.test(cls)) return Badge(config);
  if (/\b(?:notice|warning|ct-warning)\b/.test(cls)) return Notice(config);
  if (/\b(?:science-result|ref-result|ref-result-list|ct-result)\b/.test(cls) || /(?:-output|-results)$/.test(attrs.id || options.id || '') && tag === 'div') return Result(config);
  return ['div', 'section', 'form', 'fieldset', 'header', 'footer', 'aside', 'main'].includes(tag)
    ? Box(config) : create(tag, tag, config);
}

export function parseInert(markup) {
  const template = document.createElement('template');
  template.innerHTML = String(markup);
  return template;
}

export function fragment(markup, namespace) {
  if (markup instanceof Node) return markup;
  const parsed = parseInert(namespace === 'http://www.w3.org/2000/svg' ? `<svg>${markup ?? ''}</svg>` : markup ?? '');
  const output = document.createDocumentFragment();
  function instantiate(source) {
    if (source.nodeType === Node.TEXT_NODE) return document.createTextNode(source.data);
    if (source.nodeType !== Node.ELEMENT_NODE) return null;
    const tag = source.localName;
    if (['script', 'iframe', 'object', 'embed', 'style'].includes(tag)) throw Error(`UI 模板不允许 ${tag}。`);
    const attrs = Object.fromEntries([...source.attributes].map(({name, value}) => [name, value]));
    if (Object.keys(attrs).some(key => /^on/i.test(key))) throw Error('UI 模板事件必须由组件监听器绑定。');
    const node = source.namespaceURI === 'http://www.w3.org/2000/svg'
      ? document.createElementNS(source.namespaceURI, tag) : element(tag, {attrs});
    if (source.namespaceURI === 'http://www.w3.org/2000/svg')
      for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    for (const child of source.childNodes) {
      const component = instantiate(child); if (component) node.append(component);
    }
    return node;
  }
  const source = namespace === 'http://www.w3.org/2000/svg' ? parsed.content.firstChild : parsed.content;
  for (const child of source.childNodes) {
    const component = instantiate(child); if (component) output.append(component);
  }
  return output;
}

export function render(target, markup) {
  // Build completely before replacing the old tree; a malformed template cannot
  // destroy a working component or leave half a form mounted.
  const content = fragment(markup, target.namespaceURI);
  target.replaceChildren(content);
  return target;
}

export function insert(target, position, markup) {
  const content = fragment(markup);
  if (position === 'beforeend') target.append(content);
  else if (position === 'afterbegin') target.prepend(content);
  else if (position === 'beforebegin') target.before(content);
  else if (position === 'afterend') target.after(content);
  else throw Error(`未知组件插入位置：${position}`);
  return target;
}

export function compose(target, content) { target.replaceChildren(); return children(target, content); }
