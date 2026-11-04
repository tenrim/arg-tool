// Authored explanations of published relations, not copied software or tables.
const reference = (id, title, publisher, url, locator) => ({
  id,
  title,
  publisher,
  url,
  locator,
  kind: 'official-doc',
  language: 'en',
});
const atmosphere = reference(
  'nws-altitude',
  'Pressure Altitude',
  'NOAA / National Weather Service',
  'https://www.weather.gov/media/epz/wxcalc/pressureAltitude.pdf',
  '第 1 页：气压高度与英尺转米',
);
const saturation = reference(
  'iapws',
  'SR1-86(1992)：Saturation Properties of Ordinary Water Substance',
  'IAPWS',
  'https://iapws.org/technical-guidance/release/Supp-sat',
  '1992 修订版，第 3 页式 (1) 与参考常数',
);
const heat = reference(
  'heat',
  'Temperature Change and Heat Capacity',
  'OpenStax / Rice University',
  'https://openstax.org/books/college-physics-2e/pages/14-2-temperature-change-and-heat-capacity',
  '§14.2：Q = mcΔT、表 14.1、量热法',
);
const power = reference(
  'power',
  'Power',
  'OpenStax / Rice University',
  'https://openstax.org/books/college-physics-2e/pages/7-7-power',
  '§7.7：功率为能量转移除以时间',
);
const energy = reference(
  'energy',
  'Measuring electricity',
  'U.S. Energy Information Administration',
  'https://www.eia.gov/energyexplained/electricity/measuring-electricity.php',
  'W、Wh 与 kWh 的关系',
);
export const EVERYDAY_DETAILS = Object.freeze({
  'altitude-pressure': {
    formula:
      'H = 145366.45 × 0.3048 = 44307.69396 m\nh = H × [1 − (p / 101.325)^0.190284]\np = 101.325 × (1 − h / H)^(1 / 0.190284)',
    symbols:
      'h：气压高度，m；p：当地绝对气压，kPa。101.325 kPa 为模型的标准海平面气压。第二个公式由第一个公式代数反解。',
    limits:
      '标准大气对流层近似；本站将高度范围限制为 −500～11000 m。由气压反求的是气压高度，天气、温度、湿度会造成它与实际海拔不同；不使用天气预报中已折算到海平面的气压。',
    explanation:
      '标准大气用规定的垂直温度分布描述气压随高度变化。气压高度是把测得的当地气压代入该模型后得到的等效高度，不能单凭它确定地形海拔。',
    example: {
      input: '海拔 0 m',
      output: '标准气压 101.325 kPa = 1013.25 hPa',
      explanation:
        'h=0 时幂函数的底数为 1，因而压力等于标准海平面压力。反向代入同一压力，得到 0 m。',
    },
    sources: [atmosphere],
  },
  'water-boiling': {
    formula:
      'τ = 1 − T / Tc\nln(p / pc) = (Tc / T) × [a₁τ + a₂τ^1.5 + a₃τ³ + a₄τ^3.5 + a₅τ⁴ + a₆τ^7.5]\nTc = 647.096 K；pc = 22064 kPa\na₁ = −7.85951783；a₂ = 1.84408259；a₃ = −11.7866497\na₄ = 22.6807411；a₅ = −15.9618719；a₆ = 1.80122502\nT(°C) = T(K) − 273.15',
    symbols:
      'p：绝对气压（kPa，非表压）；T：饱和温度（K）。ln 为自然对数。给定 p，在 273.16～647.096 K 之间以二分法反求 T。按海拔估算时，先用“海拔气压”的标准大气公式得到 p。',
    limits:
      '纯水液汽平衡近似，采用 IAPWS 1992 饱和关联式。输入下限为该式在三相点温度的压力（约 0.611657 kPa），上限 22064 kPa；临界点是液汽共存曲线终点。海拔模式限 −500～11000 m，气压是模型估算。溶质、过热和实际天气变化不在模型内。',
    explanation:
      '平衡沸腾对应水的饱和蒸汽压达到外界压力。IAPWS 的关联式使用临界温度、临界压力及六个公布的系数描述饱和曲线；压力降低时，与之对应的沸腾温度也降低。',
    example: {
      input: '绝对气压 101.325 kPa',
      output: '饱和温度约 99.9743 °C',
      explanation:
        '反解此关联式得到约 373.1243 K，减去 273.15 得摄氏温度。日常说的 100 °C 是常用近似，此式不强行把结果改成整数。',
    },
    sources: [saturation, atmosphere],
  },
  'dew-point': {
    formula:
      'es = 6.112 × exp[17.67T / (T + 243.5)]\ne = (RH / 100) × es\nγ = ln(e / 6.112)\nTd = 243.5γ / (17.67 − γ)\n表面温度 Ts ≤ Td 时，满足水面凝结的温度条件',
    symbols:
      'T：空气温度，°C；RH：相对湿度，%；es、e：饱和与实际水汽压，hPa；Td：露点，°C；Ts：可选的表面温度。exp 为自然指数。',
    limits:
      '采用 NWS 公开的液态水饱和蒸汽压近似及露点反解。本站输入范围为空气／表面温度 −30～50 °C、相对湿度 1～100%；这是工具的限制，不是精度保证。零下仍为相对液态水的露点，不等于霜点。实际结露还与传热、通风及表面状态有关。',
    explanation:
      '相对湿度是实际水汽压与同温度下饱和水汽压的比值。保持水汽压不变而降温，达到饱和时的温度就是露点。零摄氏度以下，以冰面为基准的霜点需要另一条饱和曲线。',
    example: {
      input: '空气 20 °C，相对湿度 100%，表面 20 °C',
      output: '露点 20 °C；表面处于露点边界',
      explanation:
        '饱和空气的实际水汽压等于 es，反解返回原温度。表面等于露点表示达到凝结边界，不代表一定已形成可见水滴。',
    },
    sources: [
      reference(
        'nws-vapor',
        'Vapor Pressure',
        'NOAA / National Weather Service',
        'https://www.weather.gov/media/epz/wxcalc/vaporPressure.pdf',
        'RH = 100e/es',
      ),
      reference(
        'nws-dew',
        'Relative Humidity and Dewpoint Temperature from Temperature and Wet Bulb Temperature',
        'NOAA / National Weather Service',
        'https://www.weather.gov/media/epz/wxcalc/rhTdFromWetBulb.pdf',
        'es 的指数式与 Td 的对数反解；本站已知 RH，不计算湿球温度',
      ),
    ],
  },
  'water-mixing': {
    formula:
      'mc c(Tf − Tc) = mh c(Th − Tf)\nTf = (mcTc + mhTh) / (mc + mh)\n给定总质量 M 和目标 Tf：\nmh = M × (Tf − Tc) / (Th − Tc)\nmc = M − mh',
    symbols:
      'mc、mh：冷／热水质量，kg；Tc、Th、Tf：冷水、热水、混合后温度，°C；c：两份水采用相同的比热容，在比例式中抵消；M：总质量，kg。',
    limits:
      '绝热、同一种液态水、相同比热容近似；温度限 0～100 °C，并须在当地压力下保持液态。不计容器吸热、蒸发和环境散热。按质量计算，不把所有温度下的 1 L 水都当作精确的 1 kg。目标温度必须介于两份水的温度之间。',
    explanation:
      '隔绝外界热交换时，热水放出的热量等于冷水吸收的热量。两份水的比热容近似相同后，热平衡温度成为质量加权平均值。由同一守恒式可反求达到目标温度所需的两份质量。',
    example: {
      input: '1 kg 冷水 20 °C，与 1 kg 热水 80 °C 混合',
      output: '总质量 2 kg；平衡温度 50 °C',
      explanation:
        '(1×20+1×80)/(1+1)=50。反求配水时，总量 2 kg、目标 50 °C，也得到冷水和热水各 1 kg。',
    },
    sources: [heat],
  },
  'heating-time': {
    formula:
      'ΔT = T₂ − T₁\nQ = mcΔT；c = 4186 J/(kg·K)\nEin = Q / η\nt = Q / (ηP)\nE(kWh) = Ein(J) / 3600000',
    symbols:
      'm：水的质量，kg；T₁、T₂：初温和目标温度，°C；Q：水吸收的热量，J；P：设备输入功率，W；η：有效加热效率，百分数输入后除以 100；t：秒。',
    limits:
      '液态水恒定比热近似，温度限 0～100 °C 且目标不低于初温；当地压力下须无相变。不计算蒸发潜热及容器热容量。默认 100% 表示理想效率，不代表实际设备；实际效率需自行测定或查设备资料，功率假定恒定。',
    explanation:
      '升温所需热量与质量、比热容和温差成正比。输入能量只有 η 的比例进入水中，因此总输入能量是 Q/η；恒定输入功率下，用能量除以功率得到持续时间。',
    example: {
      input: '1 kg 水从 20 °C 加热至 80 °C，1000 W，效率 100%',
      output: '热量 251160 J；时间 251.16 秒；输入电量约 0.069767 kWh',
      explanation:
        '1×4186×60=251160 J。除以 1000 J/s 得 251.16 s；再除以 3600000 得 kWh。效率改为 50% 时，输入电量和时间均加倍。',
    },
    sources: [heat, power, energy],
  },
  'electricity-cost': {
    formula: 'Eday = P × h / 1000\nEtotal = Eday × d\n费用 = Etotal × r',
    symbols:
      'P：使用时的平均输入功率，W；h：每日使用小时数；d：使用天数；r：电价，元/kWh；E：电量，kWh（度）。',
    limits:
      '电价由用户填写，不联网获取，也不计算阶梯电价、峰谷分时或固定费用。功率波动或间歇运行的电器应使用相应时段平均功率，不能把铭牌最大功率当作全天实际功率。',
    explanation:
      '瓦是功率单位，瓦时是能量单位。功率乘以运行时间后除以一千得到千瓦时，累计电量乘单位电价得到这段使用的电能费用。',
    example: {
      input: '40 W，每天 5 小时，30 天，0.6 元/kWh',
      output: '每天 0.2 kWh；合计 6 kWh；费用 3.6 元',
      explanation:
        '40×5/1000=0.2；0.2×30=6；6×0.6=3.6。EIA 的算例同样给出 40 W 使用 5 h 为 0.2 kWh。',
    },
    sources: [
      energy,
      reference(
        'cost',
        'Calculate Appliance Operating Costs',
        'Hawaiian Electric',
        'https://www.hawaiianelectric.com/products-and-services/save-energy-and-money/calculate-energy-use/calculate-appliance-operating-costs',
        '功率、运行时间、电量与费用四步计算',
      ),
    ],
  },
  'battery-runtime': {
    formula:
      'E(Wh) = C(Ah) × U(V)\nC(Ah) = C(mAh) / 1000\nEusable = E × f × η\nt(h) = Eusable(Wh) / P(W)',
    symbols:
      'C：额定容量；U：与容量标注对应的电池标称电压；直接输入 Wh 时无需电压。f：从当前状态到截止点的剩余可用容量比例；η：输出转换效率；两者的百分数输入均除以 100。P：负载侧平均功率。',
    limits:
      '恒定标称电压与平均负载的能量估算。默认 f=100%、η=100% 是理想上限，不代表所有电池。可用比例须自行考虑剩余电量和保留容量；温度、老化、大电流、保护截止和 Peukert 效应未单独建模。充电宝的 mAh 应配电芯额定电压，不能直接配 USB 输出电压。',
    explanation:
      '安时表示电荷容量，不能脱离电压直接比较储能。以标称电压换成瓦时后，再乘实际可用比例和转换效率，得到可交付给负载的能量；除以负载侧平均功率可估计续航。',
    example: {
      input: '10000 mAh，标称 3.7 V，可用比例 100%，效率 80%，负载 5 W',
      output: '额定能量 37 Wh；有效能量 29.6 Wh；续航 5.92 h',
      explanation:
        '10000/1000×3.7=37 Wh；37×1×0.8=29.6 Wh；29.6/5=5.92 h。这里的 3.7 V 是容量对应的电池电压。',
    },
    sources: [
      reference(
        'battery',
        'Energy Unlimited，Revision 9',
        'Reinout Vader / Victron Energy',
        'https://www.victronenergy.com/upload/documents/Book-Energy-Unlimited-EN.pdf',
        '§6.2：Wh = Ah × V；§2.5、§3：容量、温度及放电速率影响',
      ),
      energy,
    ],
  },
  'solution-dilution': {
    formula:
      'C₁V₁ = C₂V₂\n取用原液体积 V₁ = C₂V₂ / C₁\n最终体积 V₂ = C₁V₁ / C₂\n最终浓度 C₂ = C₁V₁ / V₂\n稀释倍数 = C₁ / C₂ = V₂ / V₁',
    symbols:
      'C₁、C₂：原液及最终摩尔浓度，mol/L；V₁、V₂：取用原液和最终溶液体积，均为 mL，体积单位在等式两边抵消。',
    limits:
      '同一溶质、溶质物质的量不变、只加不含该溶质的溶剂且无反应。仅提供摩尔浓度，不混用质量分数、体积分数或质量浓度。结果的 V₂ 是最终溶液体积，应补加溶剂至该体积；体积未必可加，不把 V₂−V₁ 标作精确溶剂用量。',
    explanation:
      '摩尔浓度乘溶液体积得到溶质的物质的量。单纯稀释不改变溶质的物质的量，因此稀释前后的乘积相等；指定其中三个量便可反求第四个量。',
    example: {
      input: '5.00 mol/L 原液 850 mL，稀释至最终 1800 mL',
      output: '最终浓度约 2.36111 mol/L；稀释倍数约 2.11765',
      explanation:
        '5×850/1800=2.36111… mol/L，对应 OpenStax §3.3 Example 3.19 的 0.850 L 与 1.80 L 算例；体积统一用 mL 后比值不变。',
    },
    sources: [
      reference(
        'dilution',
        'Molarity',
        'OpenStax / Rice University',
        'https://openstax.org/books/chemistry-2e/pages/3-3-molarity',
        '§3.3：Dilution of Solutions、C₁V₁=C₂V₂ 与 Example 3.19',
      ),
    ],
  },
});
