import {
  Box,
  Card,
  Button,
  Toolbar,
  Input,
  SearchField,
  Icon,
  Status,
  EmptyState,
  CapabilityGroup,
  CapabilityButton,
  updateStatus,
  onDisconnect,
} from '../ui/index.js';
import { capabilityVariant } from './routes.js';
import { loadRegistry, searchEntries, capabilityCategories } from './registry.js';

export function requestCapability(entry, op, variant = entry.preferredVariant) {
  document.dispatchEvent(
    new CustomEvent('arg:opencapability', {
      detail: {
        id: entry.id,
        op: op || entry.preferredOperation,
        direction: entry.preferredDirection,
        preferredVariant: capabilityVariant(entry, op || entry.preferredOperation, variant)?.id,
      },
    }),
  );
}

// The same browser is used by the homepage and category overview. Full lists
// expand in place; search crosses all categories unless explicitly filtered.
export function mountCapabilityBrowser(
  host,
  {
    category = '',
    group = '',
    onOpen = requestCapability,
    onCategory,
    searchId = 'capability-search',
    searchable = true,
    overview = false,
    searchKnowledge = () => false,
  } = {},
) {
  let registry,
    selected = category,
    selectedGroup = group,
    revision = 0,
    retryAction;
  const input = Input({
    id: searchId,
    type: 'search',
    placeholder: '查找功能、格式或线索',
    attrs: { autocomplete: 'off' },
  });
  const search = SearchField({
    control: input,
    label: '搜索所有功能',
    icon: Icon('search'),
    className: 'capability-search',
  });
  const categories = Toolbar({
    className: 'capability-categories',
    attrs: { role: 'group', 'aria-label': '工具大类' },
  });
  for (const item of [{ id: '', title: '全部', icon: 'grid' }, ...capabilityCategories])
    categories.append(
      Button({
        attrs: { 'data-category': item.id, 'aria-pressed': String(item.id === selected) },
        children: [Icon(item.icon), item.title],
        on: {
          click: () => {
            selected = item.id;
            selectedGroup = '';
            render();
            onCategory?.(selected);
          },
        },
      }),
    );
  const count = Status({ className: 'capability-count', text: '正在载入功能目录…' });
  const groups = Box({ className: 'capability-groups' });
  if (searchable) host.append(search);
  host.append(categories, count, groups);
  function render() {
    for (const button of categories.children)
      button.setAttribute('aria-pressed', String(button.dataset.category === selected));
    if (!registry) return;
    const term = input.value.trim(),
      matches = searchEntries(registry, term, selected, { includeKnowledge: searchKnowledge() });
    groups.replaceChildren();
    groups.classList.toggle('capability-overview', overview && !term && !selected);
    if (term) {
      groups.classList.add('capability-search-list');
      for (const entry of matches) {
        const row = Box({
          className: 'capability-search-row',
          children: [CapabilityButton({ entry, onOpen, compact: true })],
        });
        const owner = registry.groups.find((item) => item.id === entry.group);
        row.append(
          Box({
            tag: 'span',
            className: 'capability-location',
            text:
              capabilityCategories.find((item) => item.id === entry.category).title +
              ' / ' +
              owner.title,
          }),
        );
        groups.append(row);
      }
    } else if (overview && !selected) {
      groups.classList.remove('capability-search-list');
      for (const category of capabilityCategories) {
        const definitions = registry.groups.filter((item) => item.category === category.id);
        const entries = definitions.flatMap((item) => item.entries);
        if (!entries.length) continue;
        const chooseCategory = () => {
          selected = category.id;
          selectedGroup = '';
          render();
          onCategory?.(selected);
          const active = [...categories.children].find(
            (node) => node.dataset.category === selected,
          );
          active?.focus({ preventScroll: true });
          categories.scrollIntoView({ block: 'start' });
        };
        const card = Card({
          className: 'capability-overview-card',
          attrs: { 'data-overview-category': category.id },
        });
        card.append(
          Box({
            className: 'capability-overview-heading',
            children: [
              Icon(category.icon),
              Box({ tag: 'h3', text: category.title }),
              Button({
                text: `全部 ${entries.length} ${category.id === 'knowledge' ? '篇' : '项'} →`,
                label: '查看' + category.title + '全部内容',
                on: { click: chooseCategory },
              }),
            ],
          }),
        );
        card.append(Box({ tag: 'p', text: category.description }));
        const representatives = Toolbar({ className: 'capability-overview-links' });
        for (const definition of definitions.slice(0, 4)) {
          const entry = definition.entries.find(
            (item) => item.id === definition.representatives[0],
          );
          if (entry) representatives.append(CapabilityButton({ entry, onOpen, compact: true }));
        }
        card.append(representatives);
        groups.append(card);
      }
    } else {
      groups.classList.remove('capability-search-list');
      for (const definition of registry.groups.filter(
        (item) => !selected || item.category === selected,
      )) {
        const entries = registry.entries.filter(
          (entry) => entry.group === definition.id && entry.listed !== false,
        );
        if (entries.length)
          groups.append(
            CapabilityGroup({
              group: definition,
              entries,
              onOpen,
              expanded: selectedGroup === definition.id,
            }),
          );
      }
    }
    if (!groups.children.length)
      groups.append(EmptyState({ text: '没有匹配功能，请尝试其他名称或用途' }));
    updateStatus(
      count,
      term
        ? `${matches.length} 项匹配`
        : `${matches.filter((e) => e.category !== 'knowledge').length} 项工具 · ${matches.filter((e) => e.category === 'knowledge').length} 篇科普 · ${registry.groups.filter((item) => !selected || item.category === selected).length} 个功能组`,
    );
    if (selectedGroup)
      groups
        .querySelector(`[data-capability-group="${selectedGroup}"]`)
        ?.scrollIntoView({ block: 'start' });
  }
  let previousQuery = '';
  input.addEventListener('input', () => {
    if (!previousQuery && input.value.trim()) selected = '';
    previousQuery = input.value.trim();
    selectedGroup = '';
    render();
  });
  function load() {
    const current = ++revision;
    return loadRegistry()
      .then((value) => {
        if (current !== revision) return;
        registry = value;
        render();
      })
      .catch((error) => {
        if (current !== revision) return;
        updateStatus(count, '目录载入失败，请重试。', 'error');
        groups.replaceChildren(
          Button({
            text: '重新载入',
            on: {
              click: async () => {
                await load();
                if (registry) retryAction?.();
              },
            },
          }),
        );
      });
  }
  load();
  document.addEventListener('arg:preferenceschange', render);
  onDisconnect(groups, () => {
    revision++;
    document.removeEventListener('arg:preferenceschange', render);
  });
  return {
    select(category = '', group = '') {
      retryAction = null;
      selected = category;
      selectedGroup = group;
      input.value = '';
      previousQuery = '';
      render();
    },
    setRetryAction(action) {
      retryAction = action;
    },
    search(value) {
      input.value = value;
      previousQuery = String(value).trim();
      selected = '';
      selectedGroup = '';
      render();
    },
    input,
  };
}
