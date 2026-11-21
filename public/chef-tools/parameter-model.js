// Shared parameter semantics for page forms and non-UI callers.
export const schemas = (operation) => operation.args.filter((arg) => arg.type !== 'label');
export function defaults(operation) {
  const args = schemas(operation).map((arg) => {
    if (arg.type === 'toggleString')
      return { option: arg.toggleValues[0], string: arg.value || '' };
    if (Array.isArray(arg.value)) {
      const option = arg.value[arg.defaultIndex || 0];
      return typeof option === 'object'
        ? arg.type.startsWith('editable')
          ? option.value
          : option.name
        : option;
    }
    if (
      arg.type === 'number' &&
      typeof arg.value === 'string' &&
      arg.value.trim() &&
      Number.isFinite(Number(arg.value))
    )
      return Number(arg.value);
    return arg.value ?? '';
  });
  schemas(operation).forEach((arg, i) => {
    if (arg.type.startsWith('populate')) populate(arg, args[i], args);
  });
  return args;
}
export function populate(arg, name, args) {
  const selected = arg.value.find((v) => v.name === name);
  if (!selected) return;
  if (Array.isArray(arg.target))
    arg.target.forEach((index, i) => {
      args[index] = selected.value[i];
    });
  else args[arg.target] = selected.value;
}
