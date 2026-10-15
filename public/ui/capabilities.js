import {Box, Card, Toolbar} from './layout.js';
import {Button} from './controls.js';
import {Icon} from './icons.js';
import {disclosureController} from './overlays.js';
import {uid} from './core.js';

// Public capability metadata only. Engines, private drafts and material state
// never belong to discovery components.
export function CapabilityButton({entry, onOpen, compact = false, selected = false} = {}) {
  const button = Button({className: 'capability-button' + (compact ? ' capability-button-compact' : ''),
    attrs: {'data-capability': entry.id, 'data-operation': entry.preferredOperation || entry.engineName || entry.sourceOperationIds?.[0] || '',
      'aria-current': selected ? 'true' : null}, on: {click: () => onOpen(entry)},
    children: [Box({tag: 'span', className: 'capability-label', text: entry.title})]});
  if (entry.reversible) button.append(Box({tag: 'span', className: 'capability-direction-mark', text: '⇄', attrs: {'aria-label': '双向操作'}}));
  return button;
}

export function CapabilityGroup({group, entries, onOpen, expanded = false} = {}) {
  entries = entries.filter(entry => entry.listed !== false);
  const card = Card({className: 'capability-group', attrs: {'data-capability-group': group.id, 'data-category': group.category}});
  const heading = Box({className: 'capability-group-heading', children: [Icon(group.icon), Box({tag: 'h3', text: group.title})]});
  const toggle = Button({className: 'capability-expand', text: `全部 ${entries.length} 项`,
    attrs: {'data-expand-group': group.id, 'aria-expanded': String(expanded)}});
  heading.append(toggle);
  const representatives = Toolbar({className: 'capability-representatives', attrs: {'aria-label': group.title + '常用功能'}});
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  for (const id of group.representatives) if (byId.has(id)) representatives.append(CapabilityButton({entry: byId.get(id), onOpen}));
  const all = Box({id: uid('capability-list-' + group.id), className: 'capability-expanded-list', hidden: !expanded,
    attrs: {'aria-label': group.title + '完整功能', 'data-capability-list': group.id}});
  for (const entry of entries) all.append(CapabilityButton({entry, onOpen, compact: true}));
  const disclosure = disclosureController(toggle, all);
  toggle.addEventListener('click', () => {representatives.hidden = !all.hidden;});
  if (expanded) {representatives.hidden = true;}
  card.append(heading, representatives, all);
  return card;
}
