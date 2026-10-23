import {
  Box, Button, Card, CheckGroup, DataList, EmptyState, Field, Icon, Input, Provenance,
  Result, SearchField, SplitView, Status, TabList, TabPanel, ToolHeader,
  ToolPanel, Toolbar, animatePresence, onDisconnect, setState, tabsController,
  updateStatus,
} from '../ui/index.js';
import {mountTaskLifecycle} from '../capabilities/task-lifecycle.js';
import {IT_CATEGORIES, loadITData, parseDomain, searchITRecords} from './model.js';
import {resultRecording} from '../result-recording.js';

const PAGE_SIZE = 24;
const valueText = value => value == null || value === '' ? '—' : Array.isArray(value) ? value.join('、') : String(value);
const categoryById = id => IT_CATEGORIES.find(category => category.id === id);

// The catalogue owns one selection. Query changes, category changes and route
// cancellation synchronously clear that selection before any load can finish.
export function mountITReference(main, {navigate = route => {location.hash = route;}, onKindChange} = {}) {
  const query = Input({id: 'it-query', type: 'search', placeholder: '名称、编号、缩写或中文线索', attrs: {maxlength: 1000, autocomplete: 'off', spellcheck: 'false'}});
  const search = SearchField({control: query, icon: Icon('search'), label: '搜索 IT 资料'});
  const summary = Status({id: 'it-summary'});
  const facets = Toolbar({id: 'it-facets', hidden: true, attrs: {role: 'group', 'aria-label': '资料范围'}});
  const message = Status({id: 'it-status'});
  const scope = Box({id: 'it-scope', tag: 'p'});
  const results = Result({id: 'it-results', className: 'it-records', layout: 'collection', attrs: {'aria-label': '资料目录', 'data-state': 'empty'}});
  const detail = Result({id: 'it-detail', attrs: {'aria-label': '当前资料详情', 'data-state': 'empty'}});
  const previous = Button({id: 'it-prev', text: '上一页', disabled: true});
  const next = Button({id: 'it-next', text: '下一页', disabled: true});
  const pageLabel = Box({id: 'it-page', tag: 'span', text: '0 / 0'});
  const retry = Button({id: 'it-retry', text: '重新载入', hidden: true});
  const returnList = Button({id: 'it-return-list', text: '返回资料目录', hidden: true});
  const catalogue = Card({className: 'surface it-catalogue', children: [search, facets, summary, results, Toolbar({children: [previous, pageLabel, next]}), scope]});
  const detailCard = Card({className: 'surface it-detail-card', children: [returnList, detail]});
  const split = SplitView({className: 'it-split', minPaneWidth: '340px', children: [catalogue, detailCard]});
  const domainInput = Input({id: 'it-domain-input', type: 'text', placeholder: '例如 www.example.co.uk', attrs: {maxlength: 2048, spellcheck: 'false', autocomplete: 'off'}});
  const domainRun = Button({id: 'it-domain-run', text: '分析域名层级', type: 'submit', variant: 'primary'});
  const domainPrivate = Input({id: 'it-domain-private', type: 'checkbox'});
  domainPrivate.checked = true;
  const domainResult = Result({id: 'it-domain-result', attrs: {'data-state': 'empty', 'aria-label': '域名层级分析结果'}});
  const domainStatus = Status({id: 'it-domain-status'});
  const domainForm = Box({tag: 'form', className: 'it-domain-form', hidden: true, children: [
    Card({title: '域名层级', children: [Field({label: '域名或网址', control: domainInput}), CheckGroup({label: '后缀规则范围', children: [Field({label: '包含私有平台后缀', control: domainPrivate})]}), Toolbar({children: [domainRun]}), domainStatus, domainResult]}),
  ]});
  const workspace = Box({className: 'it-workspace', children: [domainForm, message, retry, split]});
  const tabs = TabList({id: 'it-kinds', className: 'it-kinds', attrs: {'aria-label': 'IT 资料类型'}});
  const tabPanels = IT_CATEGORIES.map(category => TabPanel({id: 'it-tab-' + category.id}));
  const tabButtons = IT_CATEGORIES.map(category => Button({id: 'it-kind-' + category.id, text: category.title, attrs: {'data-it-kind': category.id}}));
  const panel = ToolPanel({id: 'panel-it-reference', className: 'panel it-panel', hidden: true,
    header: ToolHeader({className: 'page-heading', title: 'IT 固定资料'}),
    body: Box({className: 'it-page', children: [tabs, ...tabPanels]}),
    // The integration owner supplies actual links; the shared source finalizer
    // annotates their exact licences and removes genuinely empty source roots.
    footer: Provenance({className: 'tool-provenance'}),
  });
  main.append(panel);
  const recordCapture = resultRecording({id: 'it-record', anchor: detail, onLeave: () => clearDetail()});
  const domainCapture = resultRecording({id: 'it-domain', anchor: domainResult, onLeave: () => clearDomain()});
  let kind = 'ports', data = null, page = 0, total = 0, selected = null, facet = '';
  let revision = 0, domainRevision = 0, busy = false, domainBusy = false, activated = false, destroyed = false;
  let activating = false;
  const queries = new Map();
  const facetChoices = new Map();

  function sync() {
    previous.disabled = busy || page === 0;
    next.disabled = busy || (page + 1) * PAGE_SIZE >= total;
    setState(domainRun, {busy: domainBusy, disabled: domainBusy});
    setState(results, {busy});
  }

  function clearDetail(text = '从目录选择一项查看资料') {
    selected = null;
    recordCapture.clear();
    detail.removeAttribute('data-it-selected');
    setState(detail, {state: 'empty'});
    detail.replaceChildren(EmptyState({text, size: 'compact'}));
    returnList.hidden = true;
    for (const button of results.querySelectorAll('[data-it-record]')) setState(button, {pressed: false});
  }

  function clearDomain() {
    if (destroyed) return;
    domainRevision++;
    domainCapture.clear();
    domainBusy = false;
    domainResult.replaceChildren();
    setState(domainResult, {state: 'empty'});
    updateStatus(domainStatus, '');
    sync();
  }

  function cancel() {
    if (destroyed) return;
    revision++;
    busy = false;
    clearDomain();
    clearDetail();
    sync();
  }

  function invalidate() {
    cancel();
    data = null;
    page = 0;
    total = 0;
    scope.textContent = '';
    facets.replaceChildren();facets.hidden = true;
    summary.textContent = '';
    pageLabel.textContent = '0 / 0';
    results.replaceChildren();
    setState(results, {state: 'empty'});
    clearDetail();
    retry.hidden = true;
    updateStatus(message, '');
  }

  function openRelated(route) {
    if (destroyed) return;
    try {
      Promise.resolve(navigate(route)).catch(() => {if (!destroyed && !panel.hidden) updateStatus(message, '关联工具暂时无法打开，请重试。', 'error');});
    } catch {updateStatus(message, '关联工具暂时无法打开，请重试。', 'error');}
  }

  function chooseRecord(record, {focus = false} = {}) {
    if (destroyed || !data || record.kind && record.kind !== kind) return;
    selected = record.id;
    const heading = Box({id: 'it-detail-title', tag: 'h2', text: record.title, attrs: {tabindex: -1}});
    const nodes = [heading];
    if (record.summary) nodes.push(Box({tag: 'h3', text: '是什么'}), Box({tag: 'p', text: record.summary}));
    if (record.clue) nodes.push(Box({tag: 'h3', text: '常见线索'}), Box({tag: 'p', text: record.clue}));
    if (record.fields?.length) nodes.push(DataList({items: record.fields.map(field => Array.isArray(field) ? field : [field.label, valueText(field.value)])}));
    if (record.examples?.length) {
      nodes.push(Box({tag: 'h3', text: '例子'}));
      for (const example of record.examples) nodes.push(Box({className: 'it-example', children: [
        example.title ? Box({tag: 'h4', text: example.title}) : null,
        example.input != null ? Box({tag: 'pre', className: 'it-example-code', text: example.input}) : null,
        example.explanation ? Box({tag: 'p', text: example.explanation}) : null,
      ]}));
    }
    if (record.related?.length) nodes.push(Box({tag: 'h3', text: '关联工具'}), Toolbar({children: record.related.map(related => Button({
      text: related.label, attrs: {'data-it-related': related.route}, on: {click: () => openRelated(related.route)},
    }))}));
    const recordDetail = Box({tag: 'article', attrs: {'data-it-detail': record.id}, children: nodes});
    detail.replaceChildren(recordDetail);
    recordCapture.publish({name: record.title + '.json', text: JSON.stringify({category: kind, record, meta: data.meta}, null, 2)});
    detail.dataset.itSelected = record.id;
    setState(detail, {state: 'ready'});
    returnList.hidden = false;
    for (const button of results.querySelectorAll('[data-it-record]')) setState(button, {pressed: button.dataset.itRecord === selected});
    animatePresence(detail, {kind: 'feedback'});
    if (focus) {
      heading.focus({preventScroll: true});
      if (split.clientWidth < 700) detailCard.scrollIntoView({block: 'start', behavior: 'instant'});
    }
  }

  function renderRecords() {
    if (!data || destroyed) return;
    const records = facet ? data.records.filter(record => record.group === facet) : data.records;
    const match = searchITRecords(records, query.value, {limit: PAGE_SIZE, offset: page * PAGE_SIZE});
    total = match.total;
    if (page > 0 && page * PAGE_SIZE >= total) {page = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);renderRecords();return;}
    const matches = match.records;
    clearDetail();
    results.replaceChildren(...(matches.length ? matches.map(record => Button({
      className: 'it-record', variant: 'choice', layout: 'stacked', attrs: {'data-it-record': record.id, 'aria-pressed': 'false'},
      children: [Box({tag: 'strong', text: record.title}), record.summary ? Box({tag: 'span', text: record.summary}) : null],
      on: {click: () => chooseRecord(record, {focus: true})},
    })) : [EmptyState({text: '没有匹配资料，请换一个名称、编号或缩写', size: 'compact'})]));
    setState(results, {state: matches.length ? 'ready' : 'empty'});
    updateStatus(summary, `${categoryById(kind).title} · ${total.toLocaleString('zh-CN')} 项${total ? ` · ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)}` : ''}`);
    pageLabel.textContent = `${total ? page + 1 : 0} / ${Math.ceil(total / PAGE_SIZE)}`;
    sync();
  }

  function renderFacets() {
    const definitions = data?.meta?.facets || categoryById(kind).facets ||
      [...new Set((data?.records || []).map(record => record.group).filter(Boolean))].map(group => ({id: group, title: group}));
    if (!definitions.length) {facet = '';facets.hidden = true;return;}
    const counts = new Map();
    for (const record of data.records) if (record.group) counts.set(record.group, (counts.get(record.group) || 0) + 1);
    const available = definitions.filter(definition => counts.has(definition.id));
    if (!available.some(definition => definition.id === facet)) facet = '';
    const choices = [{id: '', title: '全部', count: data.records.length}, ...available.map(definition => ({...definition, count: counts.get(definition.id)}))];
    facets.replaceChildren(...choices.map(choice => Button({variant: 'choice', text: `${choice.title} ${choice.count.toLocaleString('zh-CN')}`,
      attrs: {'aria-pressed': String(choice.id === facet), 'data-it-facet': choice.id},
      on: {click() {
        if (destroyed || !data) return;
        facet = choice.id;facetChoices.set(kind, facet);page = 0;
        for (const button of facets.children) setState(button, {pressed: button.dataset.itFacet === facet});
        renderRecords();
      }},
    })));
    facets.hidden = available.length === 0;
  }

  async function load() {
    if (destroyed) return;
    invalidate();
    const version = revision, target = kind;
    busy = true;
    updateStatus(message, '正在载入资料…');
    sync();
    try {
      const loaded = await loadITData(target);
      if (destroyed || version !== revision || target !== kind) return;
      data = loaded;
      busy = false;
      scope.textContent = loaded.meta?.scope || '';
      updateStatus(message, '');
      renderFacets();
      renderRecords();
    } catch (error) {
      if (destroyed || version !== revision || target !== kind) return;
      busy = false;
      updateStatus(message, error.message || '资料载入失败，请重新载入。', 'error');
      results.replaceChildren(EmptyState({text: '资料尚未载入', size: 'compact'}));
      retry.hidden = false;
      sync();
    }
  }

  function selectKind(id, target) {
    if (destroyed || !categoryById(id)) return;
    target.append(workspace);
    domainForm.hidden = id !== 'domains';
    query.setAttribute('aria-label', '搜索' + categoryById(id).title);
    if (kind !== id) {
      queries.set(kind, query.value);
      kind = id;
      query.value = queries.get(id) || '';
      facet = facetChoices.get(id) || '';
      invalidate();
      if (activated && !activating && onKindChange) {
        try {Promise.resolve(onKindChange(id)).catch(() => {
          if (!destroyed && kind === id) {updateStatus(message, '资料类型切换失败，请重新载入。', 'error');retry.hidden = false;}
        });} catch {updateStatus(message, '资料类型切换失败，请重新载入。', 'error');retry.hidden = false;}
      } else if (activated) void load();
    }
  }

  const tabController = tabsController(tabs, IT_CATEGORIES.map((category, index) => [category.id, category.title, tabPanels[index], tabButtons[index]]), {initial: kind, onSelect: selectKind});
  function activate(id) {
    if (destroyed) return;
    const target = categoryById(id)?.id || kind;
    const changed = target !== kind;
    activated = true;
    activating = true;
    try {tabController.select(target);} finally {activating = false;}
    if (!changed && !data && !busy) void load();
  }

  query.addEventListener('input', () => {
    if (destroyed) return;
    queries.set(kind, query.value);
    page = 0;
    clearDetail();
    if (data) renderRecords();
  });
  previous.addEventListener('click', () => {if (!destroyed && page > 0 && !busy) {page--;renderRecords();results.querySelector('button')?.focus({preventScroll: true});}});
  next.addEventListener('click', () => {if (!destroyed && (page + 1) * PAGE_SIZE < total && !busy) {page++;renderRecords();results.querySelector('button')?.focus({preventScroll: true});}});
  retry.addEventListener('click', () => void load());
  returnList.addEventListener('click', () => {
    if (destroyed) return;
    const selectedButton = [...results.querySelectorAll('[data-it-record]')].find(button => button.dataset.itRecord === selected);
    (selectedButton || query).focus({preventScroll: true});
    if (split.clientWidth < 700) catalogue.scrollIntoView({block: 'start', behavior: 'instant'});
  });
  domainInput.addEventListener('input', clearDomain);
  domainPrivate.addEventListener('change', clearDomain);
  domainForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (destroyed) return;
    clearDomain();
    const version = domainRevision, value = domainInput.value;
    domainBusy = true;
    updateStatus(domainStatus, '正在分析…');
    sync();
    try {
      const parsed = await parseDomain(value, {includePrivate: domainPrivate.checked});
      if (destroyed || version !== domainRevision || kind !== 'domains') return;
      domainBusy = false;
      const suffix = parsed.publicSuffix || parsed.suffix;
      const domain = parsed.domain || parsed.registrableDomain;
      const items = [
        ['主机名', parsed.hostname || parsed.host || value], ['主机类型', parsed.isIp ? 'IP 地址' : '域名'], ['公共后缀', suffix],
        ['可注册域名', domain], ['子域名', parsed.subdomain],
        ['后缀类别', parsed.isIp ? 'IP 地址不适用域名后缀' : parsed.isPrivate ? '私有后缀规则' : parsed.isIcann ? 'ICANN 后缀规则' : '未命中明确后缀规则'],
      ];
      if (parsed.rule) items.push(['匹配规则', parsed.rule]);
      if (parsed.asciiHostname) items.push(['ASCII / IDNA', parsed.asciiHostname]);
      domainResult.replaceChildren(DataList({items: items.map(([label, text]) => [label, valueText(text)])}));
      domainCapture.publish({name: (parsed.hostname || value) + ' 域名层级.json', text: JSON.stringify({includePrivate: domainPrivate.checked, ...parsed, meta: data?.meta}, null, 2)});
      setState(domainResult, {state: 'ready'});
      updateStatus(domainStatus, '分析完成', 'success');
      sync();
    } catch (error) {
      if (destroyed || version !== domainRevision || kind !== 'domains') return;
      domainBusy = false;
      updateStatus(domainStatus, error.message || '域名分析失败，请重试。', 'error');
      sync();
    }
  });
  const lifecycle = mountTaskLifecycle(panel, {isBusy: () => busy || domainBusy,
    invalidate(reason) {cancel();clearDetail();updateStatus(message, reason === 'task-change' ? '' : '资料载入已停止');},
    dispose: cancel,
  });
  function destroy() {
    if (destroyed) return;
    cancel();destroyed = true;
    tabController.destroy();lifecycle.destroy();
    data = null;queries.clear();facetChoices.clear();
  }
  onDisconnect(panel, destroy);
  clearDetail();sync();
  return {panel, activate, cancel, destroy, get kind() {return kind;}};
}
