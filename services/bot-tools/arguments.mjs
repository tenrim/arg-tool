import { ApiError, LIMITS } from './protocol.mjs';

const textTypes = new Set([
  'string',
  'text',
  'shortString',
  'binaryString',
  'binaryShortString',
  'editableOption',
  'editableOptionShort',
]);
const choiceTypes = new Set(['option', 'argSelector', 'populateOption', 'populateMultiOption']);
export function validateArguments(parameters, args) {
  if (!Array.isArray(args) || args.length !== parameters.length)
    throw new ApiError('INVALID_ARGUMENTS', '参数数量与原操作定义不一致。');
  const text = (value) =>
    typeof value === 'string' && Buffer.byteLength(value) <= LIMITS.inputBytes;
  parameters.forEach((schema, index) => {
    const arg = args[index];
    let valid = false;
    if (textTypes.has(schema.type)) valid = text(arg);
    else if (choiceTypes.has(schema.type))
      valid =
        text(arg) && schema.value.some((v) => (typeof v === 'object' ? v.name : String(v)) === arg);
    else if (schema.type === 'boolean')
      valid =
        typeof arg === 'boolean' ||
        (typeof schema.value !== 'boolean' && arg === (schema.value ?? '')); // Preserve original default sentinels.
    else if (schema.type === 'number')
      valid =
        typeof arg === 'number' &&
        Number.isFinite(arg) &&
        (schema.min === undefined || arg >= schema.min) &&
        (schema.max === undefined || arg <= schema.max) &&
        (!schema.integer || Number.isInteger(arg));
    else if (schema.type === 'toggleString')
      valid =
        !!arg &&
        typeof arg === 'object' &&
        !Array.isArray(arg) &&
        Object.keys(arg).length === 2 &&
        Object.hasOwn(arg, 'option') &&
        Object.hasOwn(arg, 'string') &&
        schema.toggleValues.includes(arg.option) &&
        text(arg.string);
    if (!valid)
      throw new ApiError('INVALID_ARGUMENTS', `参数 ${schema.name} 的类型、选项或范围不正确。`);
  });
}
