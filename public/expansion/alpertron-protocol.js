import {ALPERTRON_LIMITS, getAlpertronCalculator} from './alpertron-catalog.js';

const encoder = new TextEncoder();
const numericOption = (value, fallback, min, max, label) => {
  const result = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(result) || result < min || result > max) throw new RangeError(`${label}必须在 ${min}–${max} 之间`);
  return result;
};
export function encodeAlpertronRequest(options = {}) {
  const calculator = getAlpertronCalculator(options.calculator || 'integer');
  if (!calculator) throw new TypeError('不支持的数论计算器');
  const action = options.action || calculator.actions[0].id;
  if (!calculator.actions.some(item => item.id === action)) throw new TypeError('不支持的计算动作');
  const digits = numericOption(options.digits, 0, 0, 20, '数字分组长度');
  const get = name => {
    const value = String(options[name] ?? calculator.fields.find(field => field.name === name)?.value ?? '').trim();
    if (!value) throw new TypeError(`${calculator.fields.find(field => field.name === name)?.label || name}不能为空`);
    // Upstream uses NUL/SOH as protocol separators and understands its own arithmetic grammar.
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) throw new TypeError('输入包含协议控制字符');
    if (/[^\x09\x0a\x0d\x20-\x7e]/.test(value)) throw new TypeError('数论表达式请使用 ASCII 数字、变量及运算符');
    return value;
  };
  const zero = '\0', hex = options.hexadecimal ? 1 : 0;
  let parameter;
  switch (calculator.id) {
    case 'integer': {
      const flags = {evaluate: 0, factor: 2, prime: 6}[action];
      // fromFile=0, verbose, pretty, Cunningham=0, hexadecimal, keyboard=0.
      const config = `0${options.verbose ? 1 : 0}${options.pretty === false ? 0 : 1}0${hex}0`;
      if (options.algorithm !== undefined && !['auto', 'siqs'].includes(options.algorithm)) throw new TypeError('不支持的分解算法');
      let resume = options.resume === undefined ? '' : String(options.resume);
      if (options.algorithm === 'siqs' && action === 'factor') resume = '1=!';
      if (resume && !/^[0-9A-Fa-f^(),;=! +.*-]+$/.test(resume)) throw new TypeError('无效的因数分解状态');
      parameter = `${digits},${flags},${config},${get('expression')}\x01${resume}${zero}`;
      break;
    }
    default: throw new TypeError('不支持的数论计算器');
  }
  if (encoder.encode(parameter).length > ALPERTRON_LIMITS.inputBytes) throw new RangeError('输入超过本地计算器的 900,000 字节限制');
  return {calculator: calculator.id, action, parameter};
}

const entities = Object.freeze({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',times:'×',minus:'−',plusmn:'±',pm:'±',middot:'·',divide:'÷',le:'≤',ge:'≥',ne:'≠',infin:'∞',pi:'π',phi:'φ',radic:'√',sup2:'²',sup3:'³',hellip:'…',rarr:'→',larr:'←',equiv:'≡',sum:'∑',sigma:'σ',mu:'μ',theta:'θ',alpha:'α',beta:'β',Delta:'Δ',thinsp:' ',ensp:' ',emsp:' ',and:'∧',or:'∨',InvisibleTimes:'*'});
const decodeEntities = value => value.replace(/&(#x[\da-f]+|#\d+|[a-z][a-z\d]*);/gi, (whole, entity) => {
  if (entity[0] !== '#') return entities[entity] ?? whole;
  const point = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
  return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : '\ufffd';
});
export function alpertronText(html, {verbose = true} = {}) {
  // Upstream uses CSS-only radicals, fractions, and custom math tags. Merely
  // stripping tags would turn sqrt(2) into 2 and a/b into ab. Build a text-only
  // tree (never DOM) and explicitly preserve those mathematical operators.
  const root = {tag: '', classes: [], children: []}, stack = [root];
  for (const token of String(html).match(/<[^>]*>|[^<]+|</g) || []) {
    if (!token.startsWith('<')) { stack.at(-1).children.push(decodeEntities(token)); continue; }
    const end = token.match(/^<\/\s*([\w-]+)/);
    if (end) {
      const index = stack.findLastIndex(node => node.tag === end[1].toLowerCase());
      if (index > 0) stack.length = index;
      continue;
    }
    const start = token.match(/^<\s*([\w-]+)/);
    if (!start) continue;
    const tag = start[1].toLowerCase();
    const classes = (token.match(/\bclass\s*=\s*["']([^"']*)["']/i)?.[1] || '').split(/\s+/);
    const node = {tag, classes, children: []};
    stack.at(-1).children.push(node);
    if (!['br', 'hr', 'img', 'input', 'meta', 'link', 'wbr'].includes(tag) && !/\/\s*>$/.test(token)) {
      if (stack.length > 256) throw new RangeError('数论报告嵌套层数过深');
      stack.push(node);
    }
  }
  const render = node => {
    if (typeof node === 'string') return node;
    const has = value => node.classes.includes(value);
    if (['script', 'style', 'button'].includes(node.tag) || has('offscr') || (!verbose && has('verbose'))) return '';
    const content = () => node.children.map(render).join('');
    if (node.tag === 'f-f' || has('fraction')) {
      const numerator = node.children.find(item => typeof item !== 'string' && (item.tag === 'f-n' || item.classes.includes('fup')));
      const denominator = node.children.find(item => typeof item !== 'string' && (item.tag === 'f-d' || item.classes.includes('fdn')));
      if (numerator && denominator) return `(${render(numerator)})/(${render(denominator)})`;
    }
    if (node.tag === 'r-2' || has('sqrtout')) return `√(${content()})`;
    if (node.tag === 'r-t' || has('root2dig') || has('root3dig')) {
      const order = node.children.find(item => typeof item !== 'string' && item.classes.includes('befrad'));
      const power = order ? render(order) : '';
      return `root(${power};${node.children.filter(item => item !== order).map(render).join('')})`;
    }
    if (node.tag === 'o-p') return `(${content()})`;
    if (node.tag === 'o-t') return '×';
    if (node.tag === 'sup') return `^(${content()})`;
    if (node.tag === 'sub') return `_(${content()})`;
    if (has('bold')) return `[${content()}]`;
    if (node.tag === 'br' || node.tag === 'hr') return '\n';
    if (node.tag === 'li') return `\n${content()}\n`;
    if (['p', 'div', 'ul', 'ol', 'tr', 'table', 'pre', 'summary', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag)) return `${content()}\n`;
    if (['td', 'th'].includes(node.tag)) return `${content()}\t`;
    return content();
  };
  return render(root).replace(/where the periodic part is marked in bold/g, '周期部分用 [ ] 标记')
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

// The official engine encodes parser failures in a final HTML message, not a
// rejected promise. Preserve the report, and never label these diagnostics success.
export function alpertronError(text) {
  const errors = /(?:Error in expression|Syntax error|Division by zero|Parenthesis mismatch|Only integer numbers are accepted|Internal error|Invalid parameter|Too (?:few|many) arguments|GCD of arguments is not 1|must (?:not )?include (?:the )?variable|Number too (?:low|high)|Intermediate number too high|Cannot use variable in exponent|Polynomial division is not integer|Denominator must be constant|Degree is too high|Exponent is (?:too large|negative)|Leading coefficient multiple of prime|Cannot lift because of duplicate factors|Modulus must be|Multiple variables are not accepted|More than one equal sign|Equal sign inside parentheses|three or four semicolons expected|variable x missing|equal sign missing|missing closing quote|too many conversion clauses|strange character after %|number of conversion clauses is|Unexpected variable in expression|It must not be negative)/i;
  return text.split('\n').find(line => errors.test(line)) || '';
}
