const source = (id, title, url, locator, publisher = 'OpenStax / Rice University') => ({
  id,
  title,
  url,
  locator,
  publisher,
  kind: 'official-doc',
  language: 'en',
});
const speed = source(
  'speed',
  'Time, Velocity, and Speed',
  'https://openstax.org/books/college-physics-2e/pages/2-3-time-velocity-and-speed',
  'College Physics 2e §2.3：平均速率与时间',
);
const energy = source(
  'travel-energy',
  'Vehicle Cost Calculator Assumptions and Methodology',
  'https://afdc.energy.gov/calc/cost_calculator_methodology.html',
  'Vehicle Fuel Use Calculations；Fuel Emissions and Costs',
  '美国能源部 / Alternative Fuels Data Center',
);
const stopping = source(
  'stopping',
  'Motion Equations for Constant Acceleration in One Dimension',
  'https://openstax.org/books/college-physics-2e/pages/2-5-motion-equations-for-constant-acceleration-in-one-dimension',
  '§2.5：v²=v₀²+2aΔx；Example 2.12 的反应距离与制动距离',
);
const simple = source(
  'simple',
  'Simple Interest',
  'https://openstax.org/books/contemporary-mathematics/pages/6-3-simple-interest',
  'Contemporary Mathematics §6.3：I=Prt',
);
const compound = source(
  'compound',
  'Compound Interest',
  'https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest',
  '§6.4：复利、终值、有效年收益率；Example 6.41',
);
const loan = source(
  'loan',
  'The Basics of Loans',
  'https://openstax.org/books/contemporary-mathematics/pages/6-8-the-basics-of-loans',
  '§6.8：等额付款公式、Example 6.78、Reading Amortization Tables',
);
export const TRAVEL_FINANCE_DETAILS = Object.freeze({
  'trip-pace': {
    formula:
      'v = s / t；t = s / v；s = vt\n移动时长（分钟）= 60s / v\n每公里配速（秒/km）= 3600 / v\n总时长 = 移动时长 + 停留时长\n含停留平均速度 = 路程 / 总时长',
    symbols:
      's：实际行进路程，km；v：移动平均速度，km/h；t：移动时长，小时。配速输入为每公里的分钟与秒，换成秒后参与计算；1 h=60 min=3600 s。',
    limits:
      '根据给定路程和平均速度计算，不规划路线、不预测交通。移动时长不含停留，停留另加；不会把两地球面距离当成道路里程。工具范围：路程大于 0 且不超过 1000 万 km，移动时长不超过 1000 万分钟。',
    explanation:
      '平均速率是行进路程除以经过时间。配速把同一关系写成每单位距离的耗时。分开移动时间与停留时间后，可以同时得到移动平均速度和全程平均速度，二者的时间分母不同。',
    example: {
      input: '路程 10 km，移动速度 12 km/h，停留 10 分钟',
      output: '移动 50 分钟；配速 5 分/km；总时长 60 分钟；含停留平均速度 10 km/h',
      explanation:
        '10/12 h=50 min，每公里耗时 60/12=5 min；加入停留后总时间为 1 h，因此全程平均速度为 10 km/h。',
    },
    sources: [speed],
  },
  'trip-cost': {
    formula:
      '行程能耗 = 路程 × 百公里能耗 / 100\n能源费用 = 行程能耗 × 能源单价\n总费用 = 能源费用 + 其他费用\n每人分摊 = 总费用 / 人数\n每公里费用 = 总费用 / 路程',
    symbols:
      '路程为 km；燃油模式能耗为 L/100 km、油价为元/L；电动车模式为 kWh/100 km、电价为元/kWh。其他费用为用户填写的通行、停车等合计，人数是整数。',
    limits:
      '所有能耗、价格和其他费用均由用户提供；默认值只是算例，不是实时价格。实际能耗随道路、速度、载荷、天气和空调变化。电耗需明确测于电池侧还是充电侧；本工具不自动添加未知充电损失。没有计入未填写的保险、折旧或维护费用。',
    explanation:
      '先把百公里能耗按实际路程比例缩放，再乘对应能源单价得到能源费用。燃油和用电采用同一能量使用量乘单价的计费关系，但单位不同。额外费用与能源费用相加后，可按人数平均分摊。',
    example: {
      input: '200 km，7 L/100 km，8 元/L，其他费用 30 元，2 人',
      output: '燃油 14 L；能源费用 112 元；总费用 142 元；每人 71 元',
      explanation: '200×7/100=14 L；14×8=112 元；(112+30)/2=71 元。电动模式以 kWh 和元/kWh 代入。',
    },
    sources: [energy],
  },
  'stopping-distance': {
    formula:
      'v（m/s）= v（km/h）/ 3.6\n反应距离 dr = v × tr\n制动距离 db = v² / (2a)\n制动时间 tb = v / a\n总停车距离 = dr + db\n总耗时 = tr + tb',
    symbols:
      'v：开始反应时的速度；tr：反应时间，秒；a：制动时恒定减速度的正值大小，m/s²。本公式反应阶段保持原速度，制动阶段由原速度降到 0。',
    limits:
      '理想直线、恒减速度模型，不是车辆实测性能或安全车距建议。减速度由用户填写；默认 108 km/h、0.5 秒、7 m/s² 来自教材算例，不代表实际道路。坡度、轮胎、路面、制动系统及减速度变化均未单独建模。',
    explanation:
      '反应阶段尚未开始制动，按匀速运动求路程。制动阶段用匀加速运动的速度平方关系，令末速度为零并以正值表示减速度大小，得到制动距离。两段时间和距离分别相加。',
    example: {
      input: '108 km/h，反应 0.5 s，恒定减速度 7 m/s²',
      output: '反应距离 15 m；制动距离约 64.285714 m；总距离约 79.285714 m',
      explanation:
        '108/3.6=30 m/s；30×0.5=15 m；30²/(2×7)=64.285714… m，对应教材干燥路面假设算例的约 79.3 m。',
    },
    sources: [stopping, speed],
  },
  'interest-growth': {
    formula:
      '单利：I = Prt；A = P + I\n复利：i = r / n；A = P(1 + i)^N\n复利利息：I = A − P；折合年数 t = N / n\n有效年利率 = [(1 + r/n)^n − 1] × 100%',
    symbols:
      'P：一次性投入本金，元；r：名义年利率，百分数输入后除以 100；t：年数；n：每年计息次数；N：完整计息期数；A：期末本息。按日复利使用固定每年 365 个等长周期，不根据日历推断合同规则。',
    limits:
      '固定利率、一次存入、期间不追加或提取，不含税费、通胀或产品费用。单利允许输入折合年数；复利按整数完整周期计算。利率范围 0～100%，时间不超过 100 年，本息结果不超过 1 万亿元；估算金额显示两位小数，不模拟银行逐期结息取整或提前支取规则。',
    explanation:
      '单利只对原始本金计算利息，时间增加时利息线性增长。复利把每期利息加入本金，之后按新的本息计息，形成幂函数增长。名义年利率与有效年利率的区别来自一年内复利的次数。',
    example: {
      input: '本金 5000 元，名义年利率 3.8%，每年复利 12 次，共 60 期',
      output: '本息约 6044.43 元；利息约 1044.43 元',
      explanation:
        '5000×(1+0.038/12)^60≈6044.4332，对应教材 Example 6.41；利息为期末本息减去本金。',
    },
    sources: [simple, compound],
  },
  'loan-payment': {
    formula:
      '月利率 i = r / 12\n理论月供 M = Pi / [1 − (1+i)^(−N)]（i>0）\ni=0 时 M = P / N\n第 k 期利息 Ik = B(k−1) × i\n归还本金 Ck = Mk − Ik\n剩余本金 Bk = B(k−1) − Ck',
    symbols:
      'P：初始借款本金，元；r：名义年利率，百分数输入后除以 100；N：总月数；B：剩余本金。本工具仅计算每月期末付款的固定利率等额本息。',
    limits:
      '金额按人民币元及分表示，本金最多两位小数、范围大于 0 且不超过 10 亿元；年利率最多六位小数、范围 0～100%；期数 1～1200 月。本站约定：理论月供向上取整到分；每期利息四舍五入到分，再据此扣减本金；最后一期据实结清，提前结清后停止列期。所有分币运算使用整数。该取整方式是本工具明确约定，不代表所有贷款合同；不含手续费、保险、罚息、浮动利率或提前还款。',
    explanation:
      '固定月供的现值等于借款本金，等比数列求和得到等额本息公式。每期先按期初剩余本金计算利息，付款扣除利息后减少本金。初期本金较大时利息较多，后期本金降低后归还本金所占比例增加。',
    example: {
      input: '本金 28500 元，年利率 3.99%，60 个月',
      output: '常规月供 524.75 元；完整还款表逐期显示利息、本金和余额',
      explanation:
        '将月利率 0.0399/12 和 60 期代入月供公式，理论值约 524.742275 元，向上取整到分为 524.75 元，对应教材 Example 6.78。最后一期根据逐期按分计算后的余额结清。',
    },
    sources: [loan],
  },
});
