const directions = Object.freeze([{value: 'encrypt', label: '文字 → 键盘编码'}, {value: 'decrypt', label: '键盘编码 → 文字'}].map(Object.freeze));
export const KEYBOARD_TASKS = Object.freeze([
  {id: 'qwerty', label: 'QWERTY 键盘替换', title: 'QWERTY 键盘替换', directions},
  {id: 'ninekey', label: '手机九键坐标', title: '手机九键坐标', directions},
].map(Object.freeze));
