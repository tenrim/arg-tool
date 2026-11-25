import { Box, Button, IconButton, Icon, Link, Status, disclosureController } from '../ui/index.js';
import { capabilityCategories } from './registry.js';
import { capabilityRoute } from './routes.js';

// The registry owns every task and its direction. The rail only controls how
// much of that inventory is visible; expanding it never changes the workspace.
export function mountCapabilitySidebar(host, { navigate, close, categoryPages = [] }) {
  let registry,
    renderedGroups,
    currentRoute = '',
    currentId = null;
  const categories = new Map(),
    sections = new Map();
  const tree = Box({ className: 'rail-category-tree' });
  const status = Status({ text: '正在载入功能目录…', className: 'rail-empty' });
  host.append(tree, status);
  function routeLink(route, title, icon, attrs = {}) {
    return Link({
      className: 'rail-tool',
      attrs: { href: '#' + route, 'data-route': route, 'data-sidebar': 'menu-button', ...attrs },
      children: [Icon(icon), Box({ tag: 'span', text: title })],
      on: {
        click: (event) => {
          if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
            return;
          event.preventDefault();
          close();
          navigate(route);
        },
      },
    });
  }
  function taskLink(entry) {
    const group = registry.groups.find((group) => group.id === entry.group);
    return routeLink(
      capabilityRoute(entry, entry.preferredOperation, entry.preferredDirection),
      entry.title,
      group.icon,
      { 'data-capability': entry.id, 'data-category': entry.category },
    );
  }
  for (const category of capabilityCategories) {
    const root = Box({ className: 'rail-group', attrs: { 'data-group': category.id } });
    const link = routeLink('browse/' + category.id, category.title, category.icon);
    link.classList.add('rail-category-link');
    const toggle = IconButton({
      label: '展开或收起' + category.title,
      className: 'rail-category-toggle',
      variant: 'quiet',
      children: Box({ tag: 'span', text: '›', attrs: { 'aria-hidden': 'true' } }),
    });
    const body = Box({ className: 'rail-category-body' });
    const controller = disclosureController(toggle, body);
    root.append(Box({ className: 'rail-category-heading', children: [link, toggle] }), body);
    tree.append(root);
    categories.set(category.id, { root, body, controller });
  }
  for (const page of categoryPages) {
    const category = capabilityCategories.find((category) => category.id === page.category);
    if (category)
      categories.get(category.id).body.append(routeLink(page.route, page.title, category.icon));
  }
  function addSection(group) {
    const parent = categories.get(group.category).body;
    if (group.entries.length === 1) {
      parent.append(taskLink(group.entries[0]));
      return;
    }
    const root = Box({ className: 'rail-section', attrs: { 'data-rail-group': group.id } });
    const toggle = Button({
      className: 'rail-tool rail-section-toggle',
      variant: 'quiet',
      attrs: { 'data-rail-expand': group.id, 'data-sidebar': 'menu-button' },
      children: [
        Icon(group.icon),
        Box({ tag: 'span', text: group.title }),
        Box({ tag: 'span', className: 'rail-group-count', text: String(group.count) }),
      ],
    });
    const list = Box({
      className: 'rail-task-list',
      hidden: true,
      attrs: { 'aria-label': group.title + '工具' },
    });
    const controller = disclosureController(toggle, list);
    let shown = 0;
    const more = Button({
      className: 'rail-more',
      variant: 'quiet',
      text: '继续显示',
      on: { click: () => appendEntries(shown + 40) },
    });
    function appendEntries(limit) {
      for (const entry of group.entries.slice(shown, limit))
        list.insertBefore(taskLink(entry), more.parentNode ? more : null);
      shown = Math.min(limit, group.count);
      more.textContent = `继续显示（${shown} / ${group.count}）`;
      more.hidden = shown === group.count;
      if (!more.parentNode) list.append(more);
      markCurrent();
    }
    toggle.addEventListener('click', () => {
      if (toggle.getAttribute('aria-expanded') === 'true' && !shown) appendEntries(40);
    });
    root.append(toggle, list);
    parent.append(root);
    sections.set(group.id, {
      root,
      controller,
      reveal(id) {
        const index = group.entryIds.indexOf(id);
        if (index >= shown) appendEntries(Math.max(40, index + 1));
        controller.toggle(true);
      },
    });
  }
  function markCurrent() {
    for (const link of host.querySelectorAll('a[data-route]')) {
      const selected = link.dataset.capability
        ? link.dataset.capability === currentId
        : link.dataset.route === currentRoute;
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    const entry = registry?.byId.get(currentId);
    for (const [id, section] of sections)
      section.root.dataset.current = String(id === entry?.group);
  }
  function revealCurrent() {
    const page = categoryPages.find((page) => page.route === currentRoute);
    if (page) categories.get(page.category)?.controller.toggle(true);
    const entry = registry?.byId.get(currentId);
    if (!entry) return;
    categories.get(entry.category).controller.toggle(true);
    sections.get(entry.group)?.reveal(entry.id);
  }
  return {
    setRegistry(value) {
      if (registry === value && renderedGroups === value.groups) return;
      const expanded = [...sections]
        .filter(
          ([, section]) =>
            section.root.querySelector('[aria-expanded]')?.getAttribute('aria-expanded') === 'true',
        )
        .map(([id]) => id);
      for (const section of sections.values()) section.controller.destroy();
      sections.clear();
      for (const category of categories.values()) category.body.replaceChildren();
      for (const page of categoryPages) {
        const category = capabilityCategories.find((category) => category.id === page.category);
        if (category)
          categories.get(category.id).body.append(routeLink(page.route, page.title, category.icon));
      }
      registry = value;
      renderedGroups = value.groups;
      for (const group of registry.groups) if (group.count) addSection(group);
      for (const id of expanded)
        sections.get(id)?.reveal(registry.groups.find((group) => group.id === id)?.entryIds[0]);
      status.hidden = true;
      revealCurrent();
      markCurrent();
    },
    setActive(route, id = null) {
      currentRoute = route;
      currentId = id;
      revealCurrent();
      markCurrent();
    },
    error(retry) {
      status.hidden = false;
      status.replaceChildren(
        '功能目录加载失败。',
        Button({ text: '重新载入', on: { click: retry } }),
      );
    },
  };
}
