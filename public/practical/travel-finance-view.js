import { Box, Card, DataList, Disclosure, ReferenceList, Table } from '../ui/index.js';
import { workspace } from './form.js';
import { field, input, choose, grid, textRows } from './view-helpers.js';
import { TRAVEL_FINANCE_DETAILS } from './travel-finance-data.js';
import { calculateTravelFinance, money } from './travel-finance-model.js';

const n = (key, label, value, when) => ({ key, label, value, when });
const s = (key, label, options) => ({ key, label, options });
const forms = {
  'trip-pace': [
    s('mode', '计算方式', [
      ['time', '路程与速度 → 时长'],
      ['speed', '路程与时长 → 速度'],
      ['distance', '速度与时长 → 路程'],
      ['pace', '路程与配速 → 时长'],
    ]),
    n('distance', '路程（km）', 10, (v) => v.mode !== 'distance'),
    n('speed', '移动平均速度（km/h）', 12, (v) => v.mode === 'time' || v.mode === 'distance'),
    n('minutes', '移动时长（分钟）', 50, (v) => v.mode === 'speed' || v.mode === 'distance'),
    n('paceMinutes', '每公里配速：分钟', 5, (v) => v.mode === 'pace'),
    n('paceSeconds', '每公里配速：秒（0～59）', 0, (v) => v.mode === 'pace'),
    n('stop', '另加停留时间（分钟）', 10),
  ],
  'trip-cost': [
    s('mode', '能源类型', [
      ['fuel', '燃油（L）'],
      ['electric', '用电（kWh）'],
    ]),
    n('distance', '路程（km）', 200),
    n(
      'consumption',
      (v) => (v.mode === 'fuel' ? '百公里油耗（L/100 km）' : '百公里电耗（kWh/100 km）'),
      7,
    ),
    n('price', (v) => (v.mode === 'fuel' ? '油价（元/L）' : '电价（元/kWh）'), 8),
    n('extra', '通行、停车等其他费用（元）', 30),
    n('people', '分摊人数', 2),
  ],
  'stopping-distance': [
    n('speed', '初始速度（km/h）', 108),
    n('reaction', '反应时间（秒）', 0.5),
    n('deceleration', '恒定减速度大小（m/s²）', 7),
  ],
  'interest-growth': [
    s('mode', '计息方式', [
      ['compound', '复利'],
      ['simple', '单利'],
    ]),
    n('principal', '一次投入本金（元）', 5000),
    n('rate', '名义年利率（%）', 3.8),
    {
      ...s('frequency', '复利周期', [
        ['12', '每月（每年 12 次）'],
        ['1', '每年'],
        ['2', '每半年'],
        ['4', '每季度'],
        ['365', '每天（每年固定 365 次）'],
      ]),
      when: (v) => v.mode === 'compound',
    },
    n('periods', '完整计息期数（整数）', 60, (v) => v.mode === 'compound'),
    n('years', '存续年数', 1, (v) => v.mode === 'simple'),
  ],
  'loan-payment': [
    n('principal', '借款本金（元）', 28500),
    n('rate', '名义年利率（%）', 3.99),
    n('months', '还款期数（月，1～1200）', 60),
  ],
};
const fmt = (n, unit = '') =>
  Number(n.toPrecision(9)).toLocaleString('zh-CN', { maximumSignificantDigits: 9 }) +
  (unit ? ' ' + unit : '');
const yuan = (n) =>
  n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' 元';
function rowsFor(id, r) {
  switch (id) {
    case 'trip-pace':
      return [
        ['路程', fmt(r.distance, 'km')],
        ['移动时长', fmt(r.minutes, '分钟')],
        ['移动平均速度', fmt(r.speed, 'km/h')],
        ['每公里配速', fmt(r.paceSeconds, '秒/km')],
        ['含停留总时长', fmt(r.totalMinutes, '分钟')],
        ['含停留平均速度', fmt(r.totalSpeed, 'km/h')],
      ];
    case 'trip-cost':
      return [
        ['行程能耗', fmt(r.amount, r.unit)],
        ['能源费用', yuan(r.energyCost)],
        ['总费用', yuan(r.total)],
        ['每人分摊', yuan(r.perPerson)],
        ['每公里费用', fmt(r.perKm, '元/km')],
      ];
    case 'stopping-distance':
      return [
        ['初始速度', fmt(r.speed, 'm/s')],
        ['反应距离', fmt(r.reactionDistance, 'm')],
        ['制动距离', fmt(r.brakingDistance, 'm')],
        ['总停车距离（模型值）', fmt(r.totalDistance, 'm')],
        ['制动时间', fmt(r.brakingSeconds, '秒')],
        ['总耗时', fmt(r.totalSeconds, '秒')],
      ];
    case 'interest-growth':
      return [
        ['投入本金', yuan(r.principal)],
        ['累计利息（估算）', yuan(r.interest)],
        ['期末本息（估算）', yuan(r.balance)],
        ['折合年数', fmt(r.years, '年')],
        ...(r.effective === null ? [] : [['有效年利率', fmt(r.effective, '%')]]),
      ];
    case 'loan-payment':
      return [
        ['借款本金', money(r.principal) + ' 元'],
        ['常规月供（向上取整到分）', money(r.payment) + ' 元'],
        ['最后一期实付', money(r.schedule.at(-1).payment) + ' 元'],
        ['实际还款期数', r.actualMonths + ' 月'],
        ['累计利息', money(r.totalInterest) + ' 元'],
        ['累计付款', money(r.totalPayment) + ' 元'],
      ];
  }
}
const label = (d, v) => (typeof d.label === 'function' ? d.label(v) : d.label);
export function mountTravelFinance(main) {
  for (const [id, definitions] of Object.entries(forms)) {
    const detail = TRAVEL_FINANCE_DETAILS[id],
      controls = new Map(),
      fields = new Map();
    for (const d of definitions) {
      const control = d.options
        ? choose(id + '-' + d.key, d.options)
        : input(id + '-' + d.key, d.value);
      controls.set(d.key, control);
      fields.set(d.key, field(label(d, { mode: 'fuel' }), control));
    }
    const values = () => Object.fromEntries([...controls].map(([key, node]) => [key, node.value]));
    const sync = () => {
      const v = values();
      for (const d of definitions) {
        const f = fields.get(d.key);
        f.hidden = Boolean(d.when && !d.when(v));
        if (typeof d.label === 'function')
          f.querySelector('[data-ui=field-label]').textContent = label(d, v);
      }
    };
    for (const d of definitions.filter((d) => d.options))
      controls.get(d.key).addEventListener('change', sync);
    const { panel } = workspace(main, id, [grid([...fields.values()])], () => {
      const v = values(),
        r = calculateTravelFinance(id, v),
        rows = rowsFor(id, r);
      const conditions = definitions
        .filter((d) => !d.when || d.when(v))
        .map((d) => [
          label(d, v),
          d.options ? controls.get(d.key).selectedOptions[0].text : v[d.key],
        ]);
      let nodes,
        scheduleText = '';
      if (id === 'loan-payment') {
        const columns = [
          '期数',
          '期初本金（元）',
          '付款（元）',
          '利息（元）',
          '归还本金（元）',
          '剩余本金（元）',
        ];
        const tableRows = r.schedule.map((p) => [
          String(p.month),
          money(p.opening),
          money(p.payment),
          money(p.interest),
          money(p.principal),
          money(p.balance),
        ]);
        scheduleText =
          '完整还款表：\n' + [columns, ...tableRows].map((row) => row.join('\t')).join('\n');
        nodes = [
          DataList({ items: rows }),
          Disclosure({
            children: [
              Box({ tag: 'summary', text: '完整还款表（' + r.actualMonths + ' 期）' }),
              Box({
                className: 'practical-table',
                children: Table({
                  caption: '按月期末付款；金额单位为元',
                  columns,
                  rows: tableRows,
                }),
              }),
            ],
          }),
        ];
      }
      return {
        rows,
        nodes,
        text: [
          textRows(conditions),
          textRows(rows),
          scheduleText,
          '计算公式：\n' + detail.formula,
          detail.symbols,
          detail.limits,
          '参考来源：\n' +
            detail.sources.map((s) => s.publisher + ' · ' + s.title + '\n' + s.url).join('\n'),
        ]
          .filter(Boolean)
          .join('\n\n'),
      };
    });
    panel.append(
      Card({
        title: '计算公式与参考来源',
        children: [
          Box({
            tag: 'pre',
            className: 'calculation-formula',
            id: id + '-formula',
            text: detail.formula,
          }),
          Box({ tag: 'p', text: detail.symbols }),
          Box({ tag: 'p', text: detail.limits }),
          ReferenceList({ label: '公式依据', items: detail.sources }),
        ],
      }),
    );
    sync();
  }
}
