// Pure route serialization: no UI, registry loading, inputs or results.
export function capabilityRoute(entry, op, direction) {
  const query = new URLSearchParams({task: entry.id});
  if (op) query.set('op', op);
  if(direction)query.set('dir',direction);
  if(entry.variantId)query.set('view',entry.variantId);
  return (entry.route || entry.open.route) + '?' + query;
}

