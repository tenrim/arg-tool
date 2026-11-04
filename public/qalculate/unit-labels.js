// Player-facing terminology only. Original identities and executable notation
// remain untouched; this module contains no conversion factors.
const names = {
  Micron: '微米',
  Ångström: '埃',
  Foe: '超新星能量单位（foe）',
  Pferdestärke: '公制马力',
  'U.S. Survey Rod': '美制测量杆',
  'Light Second': '光秒',
  'Light Minute': '光分',
  'Light Hour': '光时',
  'Solar Radius (nominal)': '太阳半径（标称值）',
  'Rack Unit': '机架单位',
  'Square Degree': '平方度',
  'Solar Mass': '太阳质量',
  Slug: '斯勒格',
  'Mean Gregorian Year': '平均公历年',
  'Mean Tropical Year': '平均回归年',
  'Ampere Second': '安培秒',
  'Statcoulomb Centimeter': '静库仑厘米',
  'Einstein (one mole of photons)': '爱因斯坦（一摩尔光子）',
  'Mole per Square Meter Second': '摩尔每平方米秒',
  'Micromole per Square Meter Second': '微摩尔每平方米秒',
  'Reciprocal Seconds Mole': '每秒每摩尔',
  Lambert: '朗伯',
  'Foot-Lambert': '英尺朗伯',
  'Candela Steradian': '坎德拉球面度',
  'Lumen per Square Meter': '流明每平方米',
  'Lumen per Square Foot': '流明每平方英尺',
  Darcy: '达西',
  Millidarcy: '毫达西',
  'Cubic Centimeter (cc)': '立方厘米（cc）',
  'Cup (U.S. Legal)': '美制法定杯',
  Cumecs: '立方米每秒',
  'Gallons per Minute': '加仑每分',
  'Gallons per Hour': '加仑每时',
  'Acre-Foot per Day': '英亩英尺每日',
  'Kilometer per Hour (kph)': '千米每时（kph）',
  'Minutes per Kilometer': '分每千米',
  'Minutes per Mile': '分每英里',
  'Meter per Second Cubed (Jerk)': '米每三次方秒（加加速度）',
  'Standard Gravity per Second': '标准重力每秒',
  'Meter per Second to the Fourth (Snap)': '米每四次方秒',
  'Meter per Second to the Fifth (Crackle)': '米每五次方秒',
  'Meter per Second to the Sixth (Pop)': '米每六次方秒',
  Kayser: '凯泽',
  'Meter Kilogram per Second Squared': '米千克每平方秒',
  'Ounce-force': '盎司力',
  'Pound Foot per Second Squared': '磅英尺每平方秒',
  'Newton per Square Meter': '牛顿每平方米',
  'Pound-force per Square Inch': '磅力每平方英寸',
  'Dyne per Square Centimetre': '达因每平方厘米',
  'Calorie (IUNS)': '卡（IUNS）',
  'Therm (IT)': '撒姆（国际蒸汽表）',
  'Therm (ISO)': '撒姆（ISO）',
  'Therm (U.S.)': '美制撒姆',
  Thermie: '大热姆',
  'Joule per Second': '焦耳每秒',
  'Solar Luminosity (nominal)': '太阳光度（标称值）',
  'Btu per Hour': '英热单位每时',
  'Ton of Refrigeration': '冷吨',
  'Trit (Ternary Digit)': '三进制位',
  'Octal Digit': '八进制位',
  'Hartley (Decimal Digit)': '哈特莱（十进制位）',
  Nonet: '九位组',
  Declet: '十位组',
  Tebibyte: '太比字节',
  'TeX Point': 'TeX 点',
  'TeX Scaled Point': 'TeX 缩放点',
  Twip: '缇（1/20 点）',
  Agate: '阿盖特',
  'Johnson Pica': '约翰逊派卡',
  'American Point': '美制点',
  'Planck per Electron Mass Light Speed': '约化普朗克常量除以电子质量与光速之积',
  'Revolutions per Minute': '转每分',
  'Watt per Ampere': '瓦特每安培',
  'Coulomb per Volt': '库仑每伏特',
  'Volt per Ampere': '伏特每安培',
  'Ampere per Volt': '安培每伏特',
  Molar: '摩尔每升',
  'Erg per Square Centimeter Second': '尔格每平方厘米秒',
  'U.S. Teaspoon': '美制茶匙',
  'U.S. Dessertspoon': '美制甜点匙',
  'U.S. Tablespoon': '美制汤匙',
  'U.S. Cup': '美制杯',
  'Volt Seconds': '伏特秒',
  'Weber per Square Meter': '韦伯每平方米',
  'Weber per Ampere': '韦伯每安培',
};
export const unitTitle = (title, translations = {}) => names[title] || translations[title] || title;
const constants = {
  ℏ_unit: 'ℏ',
  c_unit: 'c',
  m_eunit: 'mₑ',
  a_0unit: 'a₀',
  k_Bunit: 'kB',
  e_unit: 'e',
  standard_gravity_unit: 'gₙ',
};
const superscript = {
  '-': '⁻',
  0: '⁰',
  1: '¹',
  2: '²',
  3: '³',
  4: '⁴',
  5: '⁵',
  6: '⁶',
  7: '⁷',
  8: '⁸',
  9: '⁹',
};
export function unitSymbol(expression) {
  let symbol = expression
    .replace(/\^\((-?\d+)\)/g, (_all, power) => [...power].map((c) => superscript[c]).join(''))
    .replace(/[()]/g, '');
  symbol = symbol
    .split('*')
    .map((part) => {
      const match = /^([^⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]*)$/.exec(part);
      return match ? (constants[match[1]] || match[1]) + match[2] : part;
    })
    .join('·');
  // Units without a conventional short symbol are named in Chinese instead of
  // displaying their database identifier as though it were a public symbol.
  if (/_unit|\w_[a-z]|[a-z]{6}/.test(symbol)) return '';
  return symbol;
}
