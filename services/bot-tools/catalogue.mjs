import { createHash } from 'node:crypto';
import { defaults, schemas } from '../../public/chef-tools/schema.js';
import { createRegistry, searchEntries } from '../../public/capabilities/registry.js';
import { capabilityRoute } from '../../public/capabilities/routes.js';
import { operationName } from '../../public/cyberchef-i18n.js';
import { ApiError, exactObject, textInput, LIMITS } from './protocol.mjs';

import { SUPPORTED, originalCatalogue, catalogueBytes, exclusionReason } from './scope.mjs';
import { validateArguments } from './arguments.mjs';
export { SUPPORTED } from './scope.mjs';
export async function createCatalogue(siteUrl) {
  const raw = catalogueBytes,
    catalogue = originalCatalogue,
    registry = createRegistry(catalogue);
  const fingerprint = createHash('sha256').update(raw).digest('hex');
  const link = (entry, op) => siteUrl + '#' + capabilityRoute(entry, op);
  function operation(id) {
    if (id === 'qalculate:calculate' || id === 'native:qalculate')
      return {
        id: 'qalculate:calculate',
        engine: 'qalculate',
        executable: true,
        name: '综合计算器',
        description: '使用原 Qalculate 引擎计算单条表达式，包括单位换算。',
        parameters: [{ name: 'expression', type: 'string', required: true }],
        defaults: {},
        url: siteUrl + '#qalculate?task=native%3Aqalculate',
      };
    const name = id.startsWith('op:') ? id.slice(3) : id;
    const definition = catalogue.operations[name];
    if (!definition) throw new ApiError('NOT_FOUND', '没有此操作。', 404);
    const entry = registry.byOperation.get(name);
    return {
      id: 'op:' + name,
      engine: 'cyberchef',
      op: name,
      name: operationName(name),
      executable: SUPPORTED.includes(name),
      description: definition.description,
      descriptionFormat: 'html',
      parameters: schemas(definition),
      defaults: defaults(definition),
      inputType: definition.inputType,
      outputType: definition.outputType,
      url: entry ? link(entry, name) : siteUrl + '#home',
      ...(!SUPPORTED.includes(name) ? { reason: exclusionReason(name) } : {}),
    };
  }
  function search(query) {
    return searchEntries(registry, query)
      .slice(0, 30)
      .map((entry) => {
        const chosen = entry.preferredOperation || entry.engineName || entry.sourceOperationIds[0];
        const qalc = entry.id === 'native:qalculate';
        const executable = qalc || SUPPORTED.includes(chosen);
        return {
          id: entry.id,
          name: entry.title,
          url: link(entry, chosen),
          executable,
          operationId: executable ? (qalc ? 'qalculate:calculate' : 'op:' + chosen) : null,
          supportedOperations: entry.sourceOperationIds
            .filter((name) => SUPPORTED.includes(name))
            .map((name) => 'op:' + name),
        };
      });
  }
  function validate(value) {
    if (value?.engine === 'qalculate') {
      exactObject(value, ['engine', 'expression']);
      textInput(value.expression);
      // No quoted strings, path escapes or file/command/definition functions in v1.
      // The original WASM still owns mathematical parsing and calculation.
      const expression = value.expression.normalize('NFKC');
      if (
        /["'`\\;\r\n]/u.test(expression) ||
        expression.includes(':=') ||
        /\b(?:command|process|import|export|load|save|register|plot|function|title|message|warning|error)\b/iu.test(
          expression,
        )
      )
        throw new ApiError(
          'UNSUPPORTED_OPERATION',
          '首版仅开放表达式计算，不支持文件、命令、定义或绘图操作。',
          422,
          { url: operation('qalculate:calculate').url },
        );
      return { engine: 'qalculate', expression: value.expression };
    }
    if (value?.engine !== 'cyberchef')
      throw new ApiError('UNSUPPORTED_ENGINE', '仅支持 CyberChef 和 Qalculate。', 422);
    exactObject(value, ['engine', 'input', 'recipe']);
    textInput(value.input, true);
    if (
      !Array.isArray(value.recipe) ||
      value.recipe.length < 1 ||
      value.recipe.length > LIMITS.recipeLength
    )
      throw new ApiError('INVALID_INPUT', '处理链须包含 1 至 8 步。');
    const recipe = value.recipe.map((step) => {
      exactObject(step, ['op', 'args']);
      if (typeof step.op !== 'string') throw new ApiError('INVALID_INPUT', '操作名称必须是文本。');
      const info = operation(step.op);
      if (!info.executable)
        throw new ApiError('UNSUPPORTED_OPERATION', info.reason, 422, { url: info.url });
      const args = Object.hasOwn(step, 'args') ? step.args : info.defaults;
      validateArguments(info.parameters, args);
      return { op: step.op, args };
    });
    return { engine: 'cyberchef', input: value.input, recipe };
  }
  return { operation, search, validate, fingerprint };
}
