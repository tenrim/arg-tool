// Pure route serialization: no UI, registry loading, inputs or results.
export function capabilityRoute(
  entry,
  op = entry.preferredOperation,
  direction = entry.preferredDirection,
) {
  const variant = capabilityVariant(entry, op);
  const query = new URLSearchParams({ task: entry.id });
  if (op) query.set('op', op);
  if (direction) query.set('dir', direction);
  if (variant) query.set('view', variant.id);
  return (variant?.route || entry.route || entry.open.route) + '?' + query;
}

// Explicit search/member intent precedes the topic's default/current view.
// Both event navigation and href navigation use this same precedence.
export function capabilityVariant(
  entry,
  op = entry.preferredOperation,
  variant = entry.preferredVariant,
) {
  return (
    entry.variants?.find((item) => item.id === variant) ||
    entry.variants?.find((item) => item.sourceOperationIds?.includes(op)) ||
    entry.variants?.find((item) => item.id === entry.variantId)
  );
}
