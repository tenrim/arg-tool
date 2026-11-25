import { chi } from '../round1/analysis-engine.js';
// Pure projection of executed results. No truncated preview is used as source data.
export const adapterNames = Object.freeze({
  cyberchef: '编码与格式还原',
  'utf8-text': 'UTF-8 文本',
  roman: '罗马数字',
  nato: '无线电拼读字母',
  tapcode: '敲击码／方阵',
  baudot: '波多码',
  invisible: '隐藏字符检查',
  'cipher-statistics': '密文统计',
});

export function textCandidates(report) {
  const paths = new Map([[0, []]]);
  // Relax shortest paths, retaining the actual edge objects, including defaults.
  for (let pass = 0; pass < report.nodes.length; pass++) {
    let changed = false;
    for (const edge of report.edges) {
      if (edge.status !== 'completed' || edge.to === 0 || !paths.has(edge.from)) continue;
      const path = [...paths.get(edge.from), edge];
      if (!paths.has(edge.to) || paths.get(edge.to).length > path.length) {
        paths.set(edge.to, path);
        changed = true;
      }
    }
    if (!changed) break;
  }
  const incoming = new Map();
  for (const edge of report.edges)
    if (edge.status === 'completed') {
      if (!incoming.has(edge.to)) incoming.set(edge.to, []);
      incoming.get(edge.to).push(edge);
    }
  const results = [];
  for (const node of report.nodes) {
    if (node.id === 0 || !paths.has(node.id) || !['text', 'json'].includes(node.artifact.type))
      continue;
    results.push({
      id: node.id,
      type: node.artifact.type,
      observation: Boolean(node.observation),
      providedKey:
        incoming
          .get(node.id)
          ?.some((edge) => edge.from === 0 && edge.evidence?.providedKey === true) ?? false,
      hypothesis: Boolean(node.hypothesis),
      text:
        node.artifact.type === 'text'
          ? node.artifact.text
          : JSON.stringify(node.artifact.value, null, 2),
      path: paths.get(node.id),
      incoming: incoming.get(node.id) || [],
    });
  }
  for (const result of results) {
    const sample = Array.from(result.text.slice(0, 4096));
    const letters = (result.text.slice(0, 4096).match(/[A-Za-z]/g) || []).length;
    const unusual = sample.filter(
      (c) => /[\p{Cn}\p{Co}\p{Cs}\p{Cc}]/u.test(c) && !/[\n\r\t]/.test(c),
    ).length;
    const evidence = result.path.reduce(
      (n, edge) =>
        n +
        (['format', 'parsed'].includes(edge.evidence?.kind)
          ? 8
          : edge.evidence?.kind === 'hypothesis'
            ? -4
            : 0),
      0,
    );
    result.rank =
      evidence -
      result.path.length +
      (sample.length ? 10 : -20) -
      (80 * unusual) / Math.max(1, sample.length);
    if (letters >= 3 && letters / sample.length > 0.6)
      result.rank += 20 / (1 + chi(result.text.slice(0, 4096)) / letters);
    if (/^[\d\s]+$/.test(result.text)) result.rank -= 8;
    if (result.observation) result.rank -= 20;
  }
  return results.sort(
    (a, b) =>
      Number(a.observation) - Number(b.observation) ||
      Number(b.providedKey) - Number(a.providedKey) ||
      Number(a.hypothesis) - Number(b.hypothesis) ||
      b.rank - a.rank ||
      a.id - b.id,
  );
}

export function reportMessage(report, count) {
  const prefix = count
    ? `得到 ${count} 个不同的文本／结构化候选，请结合题意判断。`
    : '本轮没有得到可展示的文本候选；这不表示文本没有编码。';
  const status =
    report.status === 'limited'
      ? '达到本轮时间、深度或数量上限，结果并非穷尽。'
      : report.status === 'partial'
        ? '部分尝试失败，已保留成功结果。'
        : report.status === 'failed'
          ? '分析失败，请查看详情。'
          : '';
  const binary = report.nodes.filter((n) => n.id !== 0 && n.artifact.type === 'bytes').length;
  return [prefix, status, binary ? `${binary} 个非文本中间结果未作为文字显示。` : '']
    .filter(Boolean)
    .join(' ');
}
