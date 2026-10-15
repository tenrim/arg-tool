import {create, uid, onDisconnect} from './core.js';
import {Button} from './controls.js';

const controllers = new WeakMap();
const hex = value => value.toString(16).toUpperCase().padStart(2, '0');
const address = value => value.toString(16).toUpperCase().padStart(8, '0');

/** Bounded byte display. A single keyboard focus owns both byte representations. */
export function ByteGrid({id = uid('byte-grid'), label = '文件字节', rows = 32, onSelectionChange, onPageChange} = {}) {
  const node = create('byte-grid', 'section', {id, attrs: {'aria-label': label}});
  const viewport = create('byte-grid-viewport', 'div', {id: `${id}-viewport`, attrs: {role: 'grid', tabindex: '0', 'aria-label': label, 'aria-multiselectable': 'true'}});
  const head = create('byte-grid-head', 'div', {attrs: {role: 'row', 'aria-rowindex': '1'}});
  const body = create('byte-grid-body', 'div', {attrs: {role: 'rowgroup'}});
  const empty = create('byte-grid-empty', 'p', {text: '尚未载入文件'});
  const previous = Button({id: `${id}-previous`, text: '上一页', variant: 'secondary'});
  const next = Button({id: `${id}-next`, text: '下一页', variant: 'secondary'});
  const position = create('byte-grid-position', 'span', {attrs: {'aria-live': 'polite'}});
  const pages = create('toolbar', 'div', {children: [previous, position, next]});
  viewport.append(head, body, empty); node.append(viewport, pages);
  let source = null, length = 0, columns = 4, page = 0, anchor = 0, offset = 0, start = 0, end = 0, disposed = false, renderedPage = -1, renderedColumns = 0;
  const pageRows = Math.max(1, Math.min(64, Math.trunc(rows) || 32));
  const capacity = () => pageRows * columns;
  const pageCount = () => Math.max(1, Math.ceil(length / capacity()));

  function render() {
    if (disposed) return;
    page = Math.max(0, Math.min(pageCount() - 1, page));
    node.dataset.columns = String(columns);
    viewport.style.setProperty('--ui-byte-columns', String(columns));
    viewport.setAttribute('aria-colcount', String(columns * 2 + 1));
    viewport.setAttribute('aria-rowcount', String(Math.ceil(length / columns) + 1));
    head.replaceChildren(create('byte-grid-column', 'span', {text: '偏移', attrs: {role: 'columnheader'}}),
      create('byte-grid-columns', 'span', {attrs: {role: 'columnheader', 'aria-colindex': '2', 'aria-colspan': String(columns)}, children: Array.from({length: columns}, (_, n) => create('byte-grid-column-number', 'span', {text: hex(n)}))}),
      create('byte-grid-column', 'span', {text: columns === 2 ? 'A' : 'ASCII', attrs: {role: 'columnheader', 'aria-label': 'ASCII 字符', title: 'ASCII 字符', 'aria-colindex': String(columns + 2), 'aria-colspan': String(columns)}}));
    const first = page * capacity(), count = Math.max(0, Math.min(capacity(), length - first));
    const bytes = source?.read(first, count) || new Uint8Array();
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index += columns) {
      const rowOffset = first + index;
      const row = create('byte-grid-row', 'div', {attrs: {role: 'row', 'aria-rowindex': String(Math.floor(rowOffset / columns) + 2)}});
      row.append(create('byte-grid-address', 'span', {text: address(rowOffset), attrs: {role: 'rowheader', 'aria-colindex': '1'}}));
      const bytesPane = create('byte-grid-hex', 'span', {attrs: {role: 'presentation'}});
      const asciiPane = create('byte-grid-ascii', 'span', {attrs: {role: 'presentation'}});
      for (let col = 0; col < columns; col++) {
        const absolute = rowOffset + col, value = bytes[index + col], present = index + col < bytes.length;
        for (const [view, pane, text, column] of [['hex', bytesPane, present ? hex(value) : '', col + 2], ['ascii', asciiPane, present ? (value >= 32 && value <= 126 ? String.fromCharCode(value) : '·') : '', columns + col + 2]]) {
          const selected = present && absolute >= start && absolute < end;
          const cell = create('byte-grid-cell', 'span', {id: present ? `${id}-${view}-${absolute}` : undefined, text, attrs: {role: 'gridcell', 'aria-colindex': String(column), 'aria-selected': String(selected), ...(present ? {'data-offset': absolute, 'data-byte-view': view, 'aria-label': `偏移 0x${address(absolute)}，${hex(value)}，${value >= 32 && value <= 126 ? String.fromCharCode(value) : '不可打印字符'}`} : {'aria-disabled': 'true'})}});
          if (present && absolute === offset) cell.dataset.cursor = 'true';
          pane.append(cell);
        }
      }
      row.append(bytesPane, asciiPane); fragment.append(row);
    }
    body.replaceChildren(fragment);
    renderedPage = page; renderedColumns = columns;
    empty.hidden = length > 0;
    empty.textContent = source ? '空文件 · 可在偏移 0 插入字节' : '尚未载入文件';
    head.hidden = length === 0;
    if (offset < length && offset >= first && offset < first + count) viewport.setAttribute('aria-activedescendant', `${id}-hex-${offset}`);
    else viewport.removeAttribute('aria-activedescendant');
    previous.disabled = page === 0; next.disabled = page >= pageCount() - 1;
    position.textContent = length ? `${page + 1} / ${pageCount()} · 0x${address(first)}–0x${address(first + count - 1)}` : '0 字节';
    onPageChange?.({page, pages: pageCount(), first, columns, rows: pageRows});
  }

  function updateSelection() {
    for (const cell of body.querySelectorAll('[data-byte-view]')) {
      const absolute = Number(cell.dataset.offset);
      cell.setAttribute('aria-selected', String(absolute >= start && absolute < end));
      if (absolute === offset) cell.dataset.cursor = 'true';
      else delete cell.dataset.cursor;
    }
    if (offset < length) viewport.setAttribute('aria-activedescendant', `${id}-hex-${offset}`);
    else viewport.removeAttribute('aria-activedescendant');
  }

  function select(value, {extend = false, focus = false, end: selectionEnd} = {}) {
    if (disposed) return;
    offset = Math.max(0, Math.min(length, Math.trunc(value) || 0));
    if (!extend) anchor = offset;
    start = Math.min(anchor, offset);
    end = selectionEnd == null ? Math.min(length, Math.max(anchor, offset) + 1) : Math.max(start, Math.min(length, selectionEnd));
    const nextPage = Math.floor(Math.min(Math.max(0, length - 1), offset) / capacity());
    const changedPage = nextPage !== page; page = nextPage;
    if (renderedPage !== page || renderedColumns !== columns) render();
    else updateSelection();
    if (changedPage) viewport.scrollTop = 0;
    else viewport.querySelector(`[data-byte-view="hex"][data-offset="${Math.min(offset, Math.max(0, length - 1))}"]`)?.scrollIntoView({block: 'nearest', inline: 'nearest'});
    if (focus) viewport.focus({preventScroll: true});
    onSelectionChange?.({offset, start, end, length: end - start});
  }
  function turnPage(nextPage) {
    if (disposed) return;
    const target = Math.max(0, Math.min(pageCount() - 1, nextPage));
    if (target === page) return;
    page = target; viewport.scrollTop = 0;
    select(Math.min(length - 1, page * capacity()));
  }
  const click = event => {
    const cell = event.target.closest('[data-byte-view][data-offset]');
    if (cell && viewport.contains(cell)) select(Number(cell.dataset.offset), {extend: event.shiftKey, focus: true});
  };
  const keydown = event => {
    if (event.target !== viewport || !source) return;
    const control = event.ctrlKey || event.metaKey;
    const changes = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns, PageUp: -capacity(), PageDown: capacity()};
    let target;
    if (event.key in changes) target = offset + changes[event.key];
    else if (event.key === 'Home') target = control ? 0 : Math.floor(offset / columns) * columns;
    else if (event.key === 'End') target = control ? length - 1 : Math.min(length - 1, Math.floor(offset / columns) * columns + columns - 1);
    else return;
    event.preventDefault(); select(target, {extend: event.shiftKey});
  };
  const previousPage = () => turnPage(page - 1), nextPage = () => turnPage(page + 1);
  previous.addEventListener('click', previousPage); next.addEventListener('click', nextPage);
  viewport.addEventListener('click', click); viewport.addEventListener('keydown', keydown);
  const resize = new ResizeObserver(entries => {
    const width = entries[0].contentRect.width, scale = parseFloat(getComputedStyle(viewport).fontSize) / 13 || 1;
    node.dataset.addressLayout = width < 275 * scale ? 'stacked' : 'inline';
    // Dense numeric cells still retain a usable touch width. Two columns are
    // the accessible fallback for a very narrow card or enlarged text.
    const nextColumns = width >= 1015 * scale ? 16 : width >= 555 * scale ? 8 : width >= 290 * scale ? 4 : 2;
    if (nextColumns !== columns) {columns = nextColumns; page = Math.floor(Math.min(Math.max(0, length - 1), offset) / capacity()); render();}
  });
  resize.observe(viewport);
  const api = {
    get viewport() {return viewport;}, get columns() {return columns;}, get selection() {return {offset, start, end};},
    setData(value, {offset: nextOffset = offset} = {}) {
      if (disposed) return;
      source = value; length = Math.max(0, Math.trunc(value?.length) || 0);
      renderedPage = -1;
      select(nextOffset);
    }, select, refresh: render,
    destroy() {if (disposed) return; disposed = true;source = null;length = 0;resize.disconnect();viewport.removeEventListener('click', click);viewport.removeEventListener('keydown', keydown);previous.removeEventListener('click', previousPage);next.removeEventListener('click', nextPage);body.replaceChildren();viewport.removeAttribute('aria-activedescendant');controllers.delete(node);}
  };
  controllers.set(node, api); onDisconnect(node, api.destroy); render();
  return node;
}

export function byteGridController(node) {
  const controller = controllers.get(node);
  if (!controller) throw Error('需要 ByteGrid 组件。');
  return controller;
}
