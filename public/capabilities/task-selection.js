import {resolveCapability} from './registry.js';
import {capabilityRoute} from './routes.js';

// Collection identity is the public workspace; the destination still retains
// its actual member/direction. A shared DOM panel is not a tool identity.
export function recentToolSelection(registry,{taskId,capabilityId,operation,direction:requestedDirection}={}){
 const {entry,op,direction}=resolveCapability(registry,taskId||capabilityId,operation,requestedDirection);
 if(!entry||entry.listed===false)return null;
 return {id:entry.id,title:entry.title,route:capabilityRoute(entry,op,direction),toolRoute:entry.open.panel};
}

export function panelTaskTitle(registry,panel,capabilityId){
 if(panel==='knowledge')return '科普';
 return (registry.byId.get(capabilityId)||selectPanelTask(registry,panel).entry)?.title;
}

// Page IDs remain valid preference keys. They select a task, never an aggregate
// renderer. Only task identity is remembered; controllers retain private input.
export function selectPanelTask(registry, panel, {remembered, operation} = {}) {
  const entries = registry.entries.filter(entry => entry.listed !== false && entry.category !== 'knowledge'
    && (entry.open.panel === panel || entry.variants?.some(member => member.open.panel === panel)));
  const previous = remembered && resolveCapability(registry, remembered.id, remembered.op, remembered.direction, remembered.variant);
  if (previous?.entry?.open.panel === panel && entries.some(entry => entry.id === previous.entry.id)) return previous;
  // A topic can span real controllers. A bare panel route must select that
  // panel's member, not redirect to the first member's unrelated controller.
  const direct = resolveCapability(registry, 'native:' + panel);
  if (direct.entry?.open.panel === panel && entries.some(entry => entry.id === direct.entry.id)) return direct;
  const native = entries.find(entry => entry.id === 'native:' + panel)
    || entries.find(entry => entry.open.kind === 'native');
  const owner = registry.byOperation.get(operation);
  const entry = native || (entries.some(entry => entry.id === owner?.id) && owner) || entries[0];
  return entry ? resolveCapability(registry, entry.id, entry === owner ? operation : undefined, undefined,
    entry.open.panel === panel ? undefined : entry.variants?.find(member => member.open.panel === panel)?.id) : {};
}
