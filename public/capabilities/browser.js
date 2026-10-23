import {Box, Button, Toolbar, Input, SearchField, Icon, Status, EmptyState, CapabilityGroup, CapabilityButton, updateStatus} from '../ui/index.js';
import {loadRegistry, searchEntries, capabilityCategories} from './registry.js';

export function requestCapability(entry, op, variant = entry.preferredVariant || entry.variantId) {
  document.dispatchEvent(new CustomEvent('arg:opencapability', {detail: {id: entry.id, op:op||entry.preferredOperation,direction:entry.preferredDirection,preferredVariant:variant}}));
}

// The same browser is used by the homepage and category overview. Full lists
// expand in place; search crosses all categories unless explicitly filtered.
export function mountCapabilityBrowser(host, {category = '', group = '', onOpen = requestCapability, onCategory, searchId = 'capability-search'} = {}) {
  let registry, selected = category, selectedGroup = group, revision = 0, retryAction;
  const input = Input({id: searchId, type: 'search', placeholder: '查找功能、格式或线索', attrs: {autocomplete: 'off'}});
  const search = SearchField({control: input, label: '搜索所有功能', icon: Icon('search'), className: 'capability-search'});
  const categories = Toolbar({className: 'capability-categories', attrs: {role: 'group', 'aria-label': '工具大类'}});
  for (const item of [{id: '', title: '全部', icon: 'grid'}, ...capabilityCategories]) categories.append(Button({
    attrs: {'data-category': item.id, 'aria-pressed': String(item.id === selected)}, children: [Icon(item.icon), item.title],
    on: {click: () => {selected = item.id; selectedGroup = ''; render(); onCategory?.(selected);}}}));
  const count = Status({className: 'capability-count', text: '正在载入功能目录…'});
  const groups = Box({className: 'capability-groups'});
  host.append(search, categories, count, groups);
  function render() {
    for (const button of categories.children) button.setAttribute('aria-pressed', String(button.dataset.category === selected));
    if (!registry) return;
    const term = input.value.trim(), matches = searchEntries(registry, term, selected);
    groups.replaceChildren();
    if (term) {
      groups.classList.add('capability-search-list');
      for (const entry of matches) {
        const row = Box({className: 'capability-search-row', children: [CapabilityButton({entry, onOpen, compact: true})]});
        const owner = registry.groups.find(item => item.id === entry.group);
        row.append(Box({tag: 'span', className: 'capability-location', text: capabilityCategories.find(item => item.id === entry.category).title + ' / ' + owner.title}));
        groups.append(row);
      }
    } else {
      groups.classList.remove('capability-search-list');
      for (const definition of registry.groups.filter(item => !selected || item.category === selected)) {
        const entries = registry.entries.filter(entry => entry.group === definition.id && entry.listed !== false);
        if (entries.length) groups.append(CapabilityGroup({group: definition, entries, onOpen, expanded: selectedGroup === definition.id}));
      }
    }
    if (!groups.children.length) groups.append(EmptyState({text: '没有匹配功能，请尝试其他名称或用途'}));
    updateStatus(count, term ? `${matches.length} 项匹配` : `${matches.filter(e=>e.category!=='knowledge').length} 项工具 · ${matches.filter(e=>e.category==='knowledge').length} 篇科普 · ${registry.groups.filter(item => !selected || item.category === selected).length} 个功能组`);
    if (selectedGroup) groups.querySelector(`[data-capability-group="${selectedGroup}"]`)?.scrollIntoView({block: 'start'});
  }
  let previousQuery = '';
  input.addEventListener('input', () => {if (!previousQuery && input.value.trim()) selected = ''; previousQuery = input.value.trim(); selectedGroup = ''; render();});
  function load() {
    const current = ++revision;
    return loadRegistry().then(value => {if (current !== revision) return; registry = value; render();}).catch(error => {
      if (current !== revision) return;
      updateStatus(count, '目录载入失败，请重试。', 'error');
      groups.replaceChildren(Button({text: '重新载入', on: {click: async () => {await load();if(registry)retryAction?.();}}}));
    });
  }
  load();
  return {select(category = '', group = '') {retryAction=null;selected = category; selectedGroup = group; input.value = ''; previousQuery=''; render();}, setRetryAction(action){retryAction=action;}, search(value) {input.value = value; previousQuery=String(value).trim(); selected = ''; selectedGroup = ''; render();}, input};
}
