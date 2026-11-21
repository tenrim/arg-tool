// One owner for the original answer-extraction rules, shared by its page and analysis.
export function extractAnswer(text, mode = 'first', indexText = '1') {
  const rows = text
    .split(/\r?\n/)
    .filter((x) => x.trim())
    .map((x) => [...x.replace(/\s/g, '')]);
  if (!rows.length) throw Error('请先输入文本。');
  if (!['first', 'last', 'index', 'indices', 'transpose'].includes(mode))
    throw Error('未知提取方式。');
  const indices = indexText
    .trim()
    .split(/[\s,，]+/)
    .map(Number);
  if (mode === 'transpose') {
    if (rows.some((r) => r.length !== rows[0].length)) throw Error('转置要求每行长度相同。');
    return rows[0].map((_, i) => rows.map((r) => r[i]).join('')).join('\n');
  }
  return rows
    .map((r, i) => {
      const n =
        mode === 'first'
          ? 1
          : mode === 'last'
            ? r.length
            : mode === 'index'
              ? indices[0]
              : indices[i];
      if (!Number.isInteger(n) || n < 1 || n > r.length)
        throw Error(`第 ${i + 1} 行的索引无效或超出长度。`);
      return r[n - 1];
    })
    .join('');
}
