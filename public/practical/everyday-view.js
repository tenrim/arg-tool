import { Box, Card, ReferenceList, DataList, Disclosure } from '../ui/index.js';
import { workspace } from './form.js';
import { field, input, choose, grid, textRows } from './view-helpers.js';
import { EVERYDAY_DETAILS } from './everyday-data.js';
import { calculateEveryday } from './everyday-model.js';

const n = (key, label, value, when) => ({ key, label, value, when });
const s = (key, label, options) => ({ key, label, options });
// Each task exposes only its physical quantities, never an expression editor.
const forms = {
  'altitude-pressure': [
    s('mode', '计算方式', [
      ['height', '海拔 → 标准气压'],
      ['pressure', '当地气压 → 气压高度'],
    ]),
    n('height', '海拔（m，−500～11000）', 0, (v) => v.mode === 'height'),
    n('pressure', '当地绝对气压（kPa）', 101.325, (v) => v.mode === 'pressure'),
  ],
  'water-boiling': [
    s('mode', '气压条件', [
      ['pressure', '已知当地绝对气压'],
      ['height', '按海拔估算标准气压'],
    ]),
    n('pressure', '绝对气压（kPa，非表压）', 101.325, (v) => v.mode === 'pressure'),
    n('height', '海拔（m，−500～11000）', 0, (v) => v.mode === 'height'),
  ],
  'dew-point': [
    n('air', '空气温度（°C，−30～50）', 20),
    n('rh', '相对湿度（%，1～100）', 50),
    n('surface', '表面温度（°C，可留空）', 10),
  ],
  'water-mixing': [
    s('mode', '求解内容', [
      ['temperature', '已知两份水，求混合温度'],
      ['amount', '已知目标温度，求配水质量'],
    ]),
    n('cold', '冷水温度（°C）', 20),
    n('hot', '热水温度（°C）', 80),
    n('coldMass', '冷水质量（kg）', 1, (v) => v.mode === 'temperature'),
    n('hotMass', '热水质量（kg）', 1, (v) => v.mode === 'temperature'),
    n('total', '混合总质量（kg）', 2, (v) => v.mode === 'amount'),
    n('target', '目标温度（°C）', 50, (v) => v.mode === 'amount'),
  ],
  'heating-time': [
    n('mass', '水的质量（kg）', 1),
    n('initial', '初温（°C）', 20),
    n('target', '目标温度（°C）', 80),
    n('power', '设备输入功率（W）', 1000),
    n('efficiency', '有效加热效率（%，100 为理想）', 100),
  ],
  'electricity-cost': [
    n('power', '使用时平均功率（W）', 40),
    n('hours', '每日使用时间（h）', 5),
    n('days', '使用天数', 30),
    n('rate', '电价（元/kWh，自行填写）', 0.6),
  ],
  'battery-runtime': [
    s('unit', '额定容量单位', [
      ['Wh', '瓦时 Wh'],
      ['Ah', '安时 Ah'],
      ['mAh', '毫安时 mAh'],
    ]),
    n('capacity', '额定容量（按所选单位）', 37),
    n('voltage', '容量对应的标称电压（V）', 3.7, (v) => v.unit !== 'Wh'),
    n('available', '剩余可用容量比例（%）', 100),
    n('efficiency', '输出转换效率（%，100 为理想）', 100),
    n('power', '负载平均功率（W）', 5),
  ],
  'solution-dilution': [
    s('mode', '求解内容', [
      ['stock', '求取用原液体积'],
      ['final', '求最终溶液体积'],
      ['concentration', '求最终浓度'],
    ]),
    n('stock', '原液浓度 C₁（mol/L）', 5),
    n('stockVolume', '取用原液体积 V₁（mL）', 850, (v) => v.mode !== 'stock'),
    n('concentration', '目标浓度 C₂（mol/L）', 2, (v) => v.mode !== 'concentration'),
    n('final', '最终溶液体积 V₂（mL）', 1800, (v) => v.mode !== 'final'),
  ],
};
const fmt = (n, unit = '') =>
  Number(n.toPrecision(8)).toLocaleString('zh-CN', { maximumSignificantDigits: 8 }) +
  (unit ? ' ' + unit : '');
function rowsFor(id, r, fmtValue = fmt) {
  const fmt = fmtValue;
  switch (id) {
    case 'altitude-pressure':
      return [
        ['绝对气压', fmt(r.pressure, 'kPa')],
        ['折合百帕', fmt(r.pressure * 10, 'hPa')],
        ['气压高度（模型值）', fmt(r.height, 'm')],
        ['采用模型', '标准大气近似；气压高度与地形海拔可能不同。'],
      ];
    case 'water-boiling':
      return [
        ['纯水饱和温度', fmt(r.temperature, '°C')],
        ['计算采用的绝对气压', fmt(r.pressure, 'kPa')],
        ['气压来源', r.estimated ? '由海拔按标准大气估算' : '用户提供的当地绝对气压'],
        [
          '模型边界',
          r.pressure === 22064 ? '临界点：液汽共存曲线终点' : '纯水液汽平衡；不含溶质影响',
        ],
      ];
    case 'dew-point':
      return [
        ['露点（相对液态水）', fmt(r.dew, '°C')],
        ['实际水汽压', fmt(r.vapor, 'hPa')],
        ...(r.surface === null
          ? []
          : [
              ['表面温度', fmt(r.surface, '°C')],
              ['水面凝结条件', r.condenses ? '表面温度达到或低于露点' : '表面温度高于露点'],
            ]),
        ...(r.dew < 0 || (r.surface !== null && r.surface < 0)
          ? [['零下结果', '此处为相对液态水的露点；未计算冰面的霜点。']]
          : []),
      ];
    case 'water-mixing':
      return [
        ['混合温度', fmt(r.temperature, '°C')],
        ['冷水质量', fmt(r.coldMass, 'kg')],
        ['热水质量', fmt(r.hotMass, 'kg')],
        ['总质量', fmt(r.total, 'kg')],
      ];
    case 'heating-time':
      return [
        ['估算加热时间', fmt(r.seconds, '秒')],
        ['折合分钟', fmt(r.seconds / 60, '分钟')],
        ['水吸收的热量', fmt(r.heat / 1000, 'kJ')],
        ['输入能量', fmt(r.input / 1000, 'kJ')],
        ['输入电量', fmt(r.kwh, 'kWh')],
      ];
    case 'electricity-cost':
      return [
        ['每日耗电', fmt(r.daily, 'kWh')],
        ['合计耗电', fmt(r.total, 'kWh')],
        ['估算电能费用', fmt(r.cost, '元')],
      ];
    case 'battery-runtime':
      return [
        ['估算续航', fmt(r.hours, '小时')],
        ['折合分钟', fmt(r.hours * 60, '分钟')],
        ['额定能量', fmt(r.energy, 'Wh')],
        ['可交付负载的能量', fmt(r.usable, 'Wh')],
      ];
    case 'solution-dilution':
      return [
        ['取用原液体积', fmt(r.stockVolume, 'mL')],
        ['最终溶液体积', fmt(r.final, 'mL')],
        ['最终浓度', fmt(r.concentration, 'mol/L')],
        ['稀释倍数', fmt(r.factor)],
        ['配制体积', '加入溶剂至最终溶液体积；不将体积差当作精确溶剂用量。'],
      ];
  }
}
export function mountEveryday(main) {
  for (const [id, definitions] of Object.entries(forms)) {
    const detail = EVERYDAY_DETAILS[id],
      controls = new Map(),
      fields = new Map();
    for (const d of definitions) {
      const control = d.options
        ? choose(id + '-' + d.key, d.options)
        : input(id + '-' + d.key, d.value);
      controls.set(d.key, control);
      fields.set(d.key, field(d.label, control));
    }
    const values = () => Object.fromEntries([...controls].map(([key, node]) => [key, node.value]));
    const sync = () => {
      const v = values();
      for (const d of definitions) fields.get(d.key).hidden = Boolean(d.when && !d.when(v));
    };
    for (const d of definitions.filter((d) => d.options))
      controls.get(d.key).addEventListener('change', sync);
    const { panel } = workspace(main, id, [grid([...fields.values()])], () => {
      const v = values(),
        r = calculateEveryday(id, v),
        rows = rowsFor(id, r, (n, unit = '') => String(n) + (unit ? ' ' + unit : ''));
      const concise = rowsFor(
        id,
        r,
        (n, unit = '') =>
          '约 ' +
          Number(n.toPrecision(4)).toLocaleString('zh-CN', { maximumSignificantDigits: 4 }) +
          (unit ? ' ' + unit : ''),
      );
      const conditions = definitions
        .filter((d) => !d.when || d.when(v))
        .map((d) => [
          d.label,
          d.options ? controls.get(d.key).selectedOptions[0].text : v[d.key] || '未填写',
        ]);
      return {
        rows,
        nodes: [
          DataList({ items: concise }),
          Disclosure({
            children: [
              Box({ tag: 'summary', text: '查看完整计算数值' }),
              Box({
                tag: 'p',
                text: '保留程序计算精度，不代表实际测量精度。复制和下载包含这些数值及计算条件。',
              }),
              DataList({ items: rows }),
            ],
          }),
        ],
        text: [
          textRows(conditions),
          textRows(rows),
          '计算公式：\n' + detail.formula,
          detail.symbols,
          detail.limits,
          '参考来源：\n' +
            detail.sources.map((s) => s.publisher + ' · ' + s.title + '\n' + s.url).join('\n'),
        ].join('\n\n'),
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
