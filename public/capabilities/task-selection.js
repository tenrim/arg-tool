import {resolveCapability} from './registry.js';

// Page IDs remain valid preference keys. They select a task, never an aggregate
// renderer. Only task identity is remembered; controllers retain private input.
export function selectPanelTask(registry, panel, {remembered, operation} = {}) {
  const entries = registry.entries.filter(entry => entry.listed !== false && entry.category !== 'knowledge' && entry.open.panel === panel);
  const previous = remembered && resolveCapability(registry, remembered.id, remembered.op, remembered.direction);
  if (previous?.entry && entries.includes(previous.entry)) return previous;
  const native = entries.find(entry => entry.id === 'native:' + panel)
    || entries.find(entry => entry.open.kind === 'native');
  const owner = registry.byOperation.get(operation);
  const entry = native || (entries.includes(owner) && owner) || entries[0];
  return entry ? resolveCapability(registry, entry.id, entry === owner ? operation : undefined) : {};
}
