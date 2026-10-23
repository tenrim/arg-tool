import {create, children} from './core.js';
import {Link} from './controls.js';
import {Button, IconButton} from './controls.js';
import {Icon} from './icons.js';

export const Box = options => create('box', options?.tag || 'div', options);
export function Card(options = {}) {
  const node = create('card', options.tag || 'section', options);
  if (!options.className) node.classList.add('surface');
  if (options.title) node.prepend(create('card-title', 'h2', {text: options.title}));
  if (options.actions) node.append(Toolbar({children: options.actions}));
  return node;
}
export function ToolPanel(options = {}) {
  const node = create('tool-panel', 'section', options);
  // Page roots contain sticky navigation and must never become transformed
  // containing blocks during an otherwise decorative route transition.
  node.dataset.motion = 'fade';
  children(node, [options.header, options.body, options.footer]);
  return node;
}
export function ToolHeader(options = {}) {
  const node = create('tool-header', 'div', options);
  if (options.title) {
    const copy = Box({className: 'heading-copy'});
    if (options.eyebrow) copy.append(create('eyebrow', 'p', {className: 'eyebrow', text: options.eyebrow}));
    copy.append(create('heading', 'h1', {text: options.title}));
    node.append(copy);
  }
  if (options.actions) node.append(Toolbar({className: 'heading-actions', children: options.actions}));
  return node;
}
export const Toolbar = options => create('toolbar', options?.tag || 'div', options);
export function FormGrid(options = {}) {
  const node = create('form-grid', options.tag || 'div', options);
  node.dataset.density = options.density || 'compact';
  if (options.minColumnWidth) node.style.setProperty('--ui-field-min-width', options.minColumnWidth);
  return node;
}
export function CheckGroup(options = {}) {
  return create('check-group', 'div', {...options, attrs: {role: 'group', 'aria-label': options.label || '开关选项', ...options.attrs}});
}
export function SplitView(options = {}) {
  const node = create('split-view', options.tag || 'div', options);
  node.dataset.layout = options.layout || 'responsive';
  if (options.minPaneWidth) node.style.setProperty('--ui-pane-min-width', options.minPaneWidth);
  if (options.align === 'start') node.dataset.align = 'start';
  return node;
}
export function Result(options = {}) {
  const node = create('result', options.tag || 'section', options);
  if (options.layout === 'collection') node.dataset.layout = 'collection';
  return node;
}
export function DataList(options = {}) {
  const node = create('data-list', 'dl', options);
  if (!options.className) node.classList.add('ui-data');
  if (options.valueFormat === 'literal') node.dataset.valueFormat = 'literal';
  for (const [label, value] of options.items || []) node.append(create('data-label', 'dt', {text: label}), create('data-value', 'dd', {text: String(value)}));
  return node;
}
export function Table(options = {}) {
  const node = create('table', 'table', options);
  if (options.caption) node.append(create('table-caption', 'caption', {text: options.caption}));
  if (options.columns) {
    const head = create('table-head', 'thead');
    head.append(create('table-row', 'tr', {children: options.columns.map(text => create('table-column', 'th', {text, attrs: {scope: 'col'}}))}));
    node.append(head);
  }
  if (options.rows) node.append(create('table-body', 'tbody', {children: options.rows.map(row => create('table-row', 'tr', {children: row.map(value => create('table-cell', 'td', {text: value == null ? 'NULL' : String(value)}))}))}));
  return node;
}
export function Provenance(options = {}) {
  const node = create('provenance', 'footer', options);
  if (options.items) {
    node.append(create('provenance-title', 'h2', {text: '所用项目与来源'}));
    for (const [name, href, role] of options.items) node.append(create('provenance-item', 'p', {children: [Link({text: name, attrs: {href, target: '_blank', rel: 'noopener noreferrer'}}), ` · ${role}`]}));
  }
  return node;
}
export const Navigation = options => create('navigation', options?.tag || 'nav', options);
export const ToolHelp = options => create('tool-help', 'section', options);
export function ToolCard({title,description,icon,route,onOpen,favorite=false,favoriteSelected=false,className=''}={}){
 const card=Card({tag:'article',className:'tool-card '+className});
 const open=Button({className:'tool-card-open'+(className.includes('directory-card')?' directory-card-open':''),attrs:{'data-route':route},on:{click:onOpen},children:[Icon(icon||route),create('tool-card-title','strong',{text:title}),create('tool-card-description','span',{text:description,className:'directory-card-group'})]});
 card.append(open);
 if(favorite)card.append(IconButton({className:'tool-favorite app-icon-button tool-card-favorite'+(className.includes('directory-card')?' directory-card-favorite':''),label:(favoriteSelected?'取消收藏':'收藏')+' · '+title,attrs:{'data-favorite':route,'aria-pressed':String(favoriteSelected)},children:Icon('star')}));
 return card;
}
