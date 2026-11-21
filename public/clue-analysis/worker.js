import { parserError } from './expected-errors.js';
import { errorRecord, fail } from './data.js';

// Original engines, isolated from page state. No caller-controlled module paths.
self.onmessage = async ({ data }) => {
  try {
    const { operation, text, options } = data;
    if (typeof text !== 'string' || text.length > 1048576)
      fail('INPUT_INVALID', '原生文字分析输入过大或类型无效。');
    let artifact;
    if (['roman', 'tapcode', 'baudot', 'invisible'].includes(operation)) {
      const { convert } = await import('../basics/core.js');
      const result = await convert(operation, text, options);
      artifact = { type: 'text', text: result.output };
    } else if (operation === 'cipher-statistics') {
      if (text.length > 20000) fail('LIMIT_EXCEEDED', '密文统计最多 20,000 个字符。');
      const { analyze } = await import('../round1/analysis-engine.js');
      // Preserve Infinity in an explicit tag; JSON must not silently turn it into null.
      artifact = {
        type: 'json',
        value: JSON.parse(
          JSON.stringify(analyze(text), (_, value) =>
            typeof value === 'number' && !Number.isFinite(value)
              ? { nonFinite: String(value) }
              : value,
          ),
        ),
      };
    } else fail('UNSUPPORTED', '未知的原生分析操作。');
    self.postMessage({ result: { artifact } });
  } catch (error) {
    self.postMessage({ error: errorRecord(parserError(error)) });
  }
};
