import { Box, Button, Field, Input, Disclosure, Toolbar, element, render } from '../ui/index.js';
import { esc } from './common.js';
import { vigenere } from './analysis-engine.js';

// The page controller owns input, job cancellation and publication. This view
// receives the original statistics result; it does not start another engine.
export function statisticsView({ input, publish, invalidateResult, run, showError }) {
  const summary = Box({ id: 'analysis-summary' });
  const frequency = Box({
    id: 'analysis-frequency',
    className: 'r1-frequency',
    attrs: { 'aria-label': '英文字母频率' },
  });
  const details = Box({ id: 'analysis-statistics-details' });
  const key = Input({ id: 'analysis-key', placeholder: '英文密钥', attrs: { maxlength: 100 } });
  const decode = Button({
    id: 'analysis-vig',
    text: '按密钥解码',
    on: {
      click() {
        try {
          if (!input.value.trim()) throw Error('请先输入文本。');
          if (input.value.length > 20000) throw Error('密文统计与试解最多 20,000 个字符。');
          publish(vigenere(input.value, key.value), '维吉尼亚候选');
        } catch (error) {
          showError(error.message);
        }
      },
    },
  });
  const root = Disclosure({
    id: 'analysis-statistics',
    children: [
      element('summary', { text: '字频、凯撒与维吉尼亚试解' }),
      element('p', {
        text: '统计按英文字母模型计算；短文本及其他语言的评分不可靠。最多 20,000 个字符。',
      }),
      Button({ id: 'analysis-run', text: '分析特征', on: { click: run } }),
      summary,
      frequency,
      details,
      Field({ label: '维吉尼亚密钥', control: key }),
      decode,
    ],
  });
  key.addEventListener('input', invalidateResult);
  const score = (n, digits) => (Number.isFinite(n) ? n.toFixed(digits) : '—');
  return {
    root,
    clear() {
      summary.replaceChildren();
      frequency.replaceChildren();
      details.replaceChildren();
    },
    show(a, source) {
      render(
        summary,
        `<div class="stats-grid"><div class="stat"><span>字符 / 英文字母</span><strong>${a.total} / ${a.n}</strong></div><div class="stat"><span>重合指数 IC</span><strong>${score(a.ic, 4)}</strong></div><div class="stat"><span>字符熵</span><strong>${score(a.entropy, 3)}</strong></div></div><ul>${a.hints.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`,
      );
      render(
        frequency,
        a.counts
          .map(
            (n, i) =>
              `<div><span>${String.fromCharCode(65 + i)}</span><meter min="0" max="${Math.max(...a.counts, 1)}" value="${n}"></meter><small>${n}</small></div>`,
          )
          .join(''),
      );
      render(
        details,
        `<p>重复二元组：${esc(a.bigrams.map((x) => x.join('×')).join('　') || '无')}</p><p>重复三元组：${esc(a.trigrams.map((x) => x.join('×')).join('　') || '无')}</p><p>重复三元组间距：${esc(a.repeats.map((x) => x.text + ':' + x.gap).join('　') || '无')}</p><h3>凯撒候选（英文卡方评分，越小越接近常见字频）</h3>`,
      );
      details.append(
        Box({
          className: 'r1-candidates',
          children: a.shifts.slice(0, 5).map((x) =>
            Button({
              text: `移位 ${x.shift} · ${score(x.score, 1)} · ${x.text.slice(0, 100)}`,
              on: { click: () => publish(x.text, '凯撒候选') },
            }),
          ),
        }),
        element('h3', { text: '密钥长度试探' }),
        Toolbar({
          children: a.periods
            .toSorted((a, b) => b.ic - a.ic)
            .slice(0, 8)
            .map((x) =>
              Button({
                text: `${x.length} 位 · IC ${score(x.ic, 3)}`,
                on: {
                  click() {
                    key.value = x.key;
                    publish(vigenere(source, x.key), '维吉尼亚候选');
                  },
                },
              }),
            ),
        }),
      );
    },
  };
}
