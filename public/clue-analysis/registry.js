import { fail, jsonSnapshot } from './data.js';

// Executable bindings reference the original capability IDs. This is not a menu.
export function createAdapterRegistry(definitions) {
  const adapters = new Map();
  for (const definition of definitions) {
    if (
      !definition?.id ||
      adapters.has(definition.id) ||
      !definition.capabilityId ||
      !['local', 'external', 'recommendation'].includes(definition.mode) ||
      !Array.isArray(definition.accepts) ||
      definition.accepts.some((v) => !['text', 'bytes', 'json', 'files'].includes(v))
    )
      fail('INPUT_INVALID', '分析适配器登记无效或重复。');
    if (definition.mode === 'local' && typeof definition.run !== 'function')
      fail('INPUT_INVALID', '本地适配器缺少执行接口。');
    adapters.set(definition.id, Object.freeze({ ...definition, accepts: [...definition.accepts] }));
  }
  function resolve(step) {
    const adapter = adapters.get(step?.adapter);
    if (!adapter) fail('UNSUPPORTED', '该分析工具尚未接通。');
    if (adapter.mode !== 'local') fail('INTERACTION_REQUIRED', '该工具需要用户主动打开或提交。');
    const params = jsonSnapshot(step.params ?? {});
    if (!params || Array.isArray(params) || typeof params !== 'object')
      fail('INPUT_INVALID', '工具参数必须是 JSON 对象。');
    const cost = adapter.cost?.(params) ?? 1;
    if (!Number.isSafeInteger(cost) || cost < 1) fail('INPUT_INVALID', '无效的处理步骤数。');
    return { adapter, step: { adapter: adapter.id, params }, cost };
  }
  return {
    resolve,
    automatic: () => [...adapters.values()].filter((a) => a.mode === 'local' && a.suggest),
    describe: () =>
      [...adapters.values()].map(({ id, capabilityId, mode, accepts, title, condition }) => ({
        id,
        capabilityId,
        mode,
        accepts: [...accepts],
        ...(title ? { title } : {}),
        ...(condition ? { condition } : {}),
      })),
  };
}
