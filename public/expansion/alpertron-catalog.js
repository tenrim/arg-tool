// Declarative catalogue only. The unmodified upstream WASM owns the mathematics.
const field = (name, label, value = '', extra = {}) => Object.freeze({name, label, value, ...extra});
const action = (id, label) => Object.freeze({id, label});
const expression = () => field('expression', '数值表达式／批处理', '', {multiline: true});
const descriptor = (id, title, page, fields, actions, description) => Object.freeze({
  id, title, sourceUrl: `https://www.alpertron.com.ar/${page}`, fields: Object.freeze(fields),
  actions: Object.freeze(actions), description, supportsBatch: id === 'integer',
});
export const ALPERTRON_CALCULATORS = Object.freeze([
  descriptor('integer', '大整数分解与数论', 'ECM.HTM', [expression(), field('algorithm', '分解算法', 'auto', {type: 'select', options: Object.freeze([['auto', '自动 ECM／SIQS'], ['siqs', '优先 SIQS（30–110 位）']])})],
    [action('factor', '因数分解与数论报告'), action('evaluate', '计算表达式'), action('prime', '素性检验')],
    '官方 ECM／SIQS 引擎；支持整数求值、素性检验、因数分解与除数验证，以及多行和循环批处理。'),
]);
export const ALPERTRON_LIMITS = Object.freeze({inputBytes: 900000, outputBytes: 32 * 1024 * 1024, defaultTimeoutMs: 30000, maxTimeoutMs: 300000});
export function getAlpertronCalculator(id) { return ALPERTRON_CALCULATORS.find(item => item.id === id) || null; }
