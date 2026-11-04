import { toolPages } from '../navigation.js';
import { resolveCapability } from './registry.js';
import { capabilityRoute } from './routes.js';
import { selectPanelTask } from './task-selection.js';

// Only public registry identities may enter preferences. Inputs and arbitrary
// query parameters never survive this projection; legacy page keys still load.
export function createPreferenceTargets(registry) {
  const legacy = new Map(toolPages.map((page) => [page.route, page]));
  const target = (resolved) => {
    const { entry, op, direction } = resolved;
    if (!entry || entry.listed === false) return null;
    return {
      id: entry.id,
      title: entry.title,
      route: capabilityRoute(entry, op, direction),
      toolRoute: entry.open.panel,
    };
  };
  function resolve(value) {
    if (typeof value !== 'string' || value.length > 2048) return null;
    if (legacy.has(value))
      return (
        target(selectPanelTask(registry, value)) || {
          ...legacy.get(value),
          id: 'page:' + value,
          toolRoute: value,
        }
      );
    const [path, query, ...rest] = value.split('?');
    if (!query || rest.length) return null;
    const params = new URLSearchParams(query),
      keys = [...params.keys()];
    if (
      new Set(keys).size !== keys.length ||
      keys.some((key) => !['task', 'op', 'dir', 'view'].includes(key)) ||
      !params.has('task')
    )
      return null;
    const resolved = resolveCapability(
      registry,
      params.get('task'),
      params.get('op') || undefined,
      params.get('dir') || undefined,
      params.get('view') || undefined,
    );
    const result = target(resolved);
    if (!result) return null;
    const canonical = new URLSearchParams(result.route.split('?')[1]);
    if (
      path !== result.route.split('?')[0] ||
      keys.some((key) => canonical.get(key) !== params.get(key))
    )
      return null;
    return result;
  }
  const options = registry.entries
    .filter((entry) => entry.listed !== false && entry.category !== 'knowledge')
    .map((entry) => target(resolveCapability(registry, entry.id)));
  return { resolve, options, limit: registry.entries.length + legacy.size };
}
