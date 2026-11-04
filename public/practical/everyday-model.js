// Original implementations of the cited physical relations. Fixed SI inputs;
// no expression evaluation, network requests or assumptions about local weather.
function number(value, label, min, max, { positive = false } = {}) {
  if ((typeof value === 'string' && !value.trim()) || value === null || value === undefined)
    throw Error('请填写' + label + '。');
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max || (positive && n === 0))
    throw Error(
      label +
        '须' +
        (positive && min === 0 ? '大于 0，且不超过 ' + max : '在 ' + min + ' 至 ' + max + ' 之间') +
        '。',
    );
  return n;
}
const pos = (v, label, max = 1e9) => number(v, label, 0, max, { positive: true });
const pct = (v, label) => pos(v, label, 100) / 100;
const temperature = (v, label) => number(v, label, 0, 100);
const mode = (v, options) => {
  if (!options.includes(v)) throw Error('请选择有效的计算方式。');
  return v;
};
export const ATM_HEIGHT = 145366.45 * 0.3048;
export function standardPressure(height) {
  const h = number(height, '海拔（m）', -500, 11000);
  return 101.325 * Math.pow(1 - h / ATM_HEIGHT, 1 / 0.190284);
}
export function pressureAltitude(pressure) {
  const p = number(pressure, '绝对气压（kPa）', standardPressure(11000), standardPressure(-500));
  return ATM_HEIGHT * (1 - Math.pow(p / 101.325, 0.190284));
}
// IAPWS SR1-86(1992), Eq. (1), p in kPa, T in kelvin.
export function saturationPressure(kelvin) {
  const T = number(kelvin, '绝对温度（K）', 273.16, 647.096),
    tau = 1 - T / 647.096;
  return (
    22064 *
    Math.exp(
      (647.096 / T) *
        (-7.85951783 * tau +
          1.84408259 * tau ** 1.5 -
          11.7866497 * tau ** 3 +
          22.6807411 * tau ** 3.5 -
          15.9618719 * tau ** 4 +
          1.80122502 * tau ** 7.5),
    )
  );
}
export function boilingTemperature(pressure) {
  const p = number(pressure, '绝对气压（kPa）', saturationPressure(273.16), 22064);
  let lo = 273.16,
    hi = 647.096;
  for (let i = 0; i < 64; i++) {
    const mid = (lo + hi) / 2;
    if (saturationPressure(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2 - 273.15;
}
export function calculateEveryday(id, v) {
  const answer = calculate(id, v);
  if (Object.values(answer).some((value) => typeof value === 'number' && !Number.isFinite(value)))
    throw Error('输入量级超出计算范围，请检查数值。');
  return answer;
}
function calculate(id, v) {
  switch (id) {
    case 'altitude-pressure': {
      const m = mode(v.mode, ['height', 'pressure']);
      return m === 'height'
        ? {
            height: number(v.height, '海拔（m）', -500, 11000),
            pressure: standardPressure(v.height),
          }
        : { height: pressureAltitude(v.pressure), pressure: Number(v.pressure) };
    }
    case 'water-boiling': {
      const m = mode(v.mode, ['pressure', 'height']),
        pressure =
          m === 'height'
            ? standardPressure(v.height)
            : number(v.pressure, '绝对气压（kPa）', saturationPressure(273.16), 22064);
      return { pressure, temperature: boilingTemperature(pressure), estimated: m === 'height' };
    }
    case 'dew-point': {
      const air = number(v.air, '空气温度（°C）', -30, 50),
        rh = number(v.rh, '相对湿度（%）', 1, 100);
      const gamma = Math.log(rh / 100) + (17.67 * air) / (air + 243.5),
        dew = (243.5 * gamma) / (17.67 - gamma);
      const surface =
        v.surface === undefined || String(v.surface).trim() === ''
          ? null
          : number(v.surface, '表面温度（°C）', -30, 50);
      return {
        dew,
        vapor: (rh / 100) * 6.112 * Math.exp((17.67 * air) / (air + 243.5)),
        surface,
        condenses: surface === null ? null : surface <= dew,
      };
    }
    case 'water-mixing': {
      const m = mode(v.mode, ['temperature', 'amount']),
        cold = temperature(v.cold, '冷水温度（°C）'),
        hot = temperature(v.hot, '热水温度（°C）');
      if (hot <= cold) throw Error('热水温度须高于冷水温度。');
      if (m === 'temperature') {
        const coldMass = number(v.coldMass, '冷水质量（kg）', 0, 1e9),
          hotMass = number(v.hotMass, '热水质量（kg）', 0, 1e9);
        if (coldMass + hotMass === 0) throw Error('两份水的总质量须大于 0。');
        return {
          coldMass,
          hotMass,
          total: coldMass + hotMass,
          temperature: (coldMass * cold + hotMass * hot) / (coldMass + hotMass),
        };
      }
      const total = pos(v.total, '混合总质量（kg）'),
        target = number(v.target, '目标温度（°C）', cold, hot),
        hotMass = (total * (target - cold)) / (hot - cold);
      return { coldMass: total - hotMass, hotMass, total, temperature: target };
    }
    case 'heating-time': {
      const mass = pos(v.mass, '水的质量（kg）'),
        initial = temperature(v.initial, '初温（°C）'),
        target = temperature(v.target, '目标温度（°C）'),
        power = pos(v.power, '输入功率（W）'),
        efficiency = pct(v.efficiency, '加热效率（%）');
      if (target < initial) throw Error('目标温度须不低于初温；本工具计算加热，不计算冷却。');
      const heat = mass * 4186 * (target - initial),
        input = heat / efficiency;
      return { heat, input, seconds: input / power, kwh: input / 3600000 };
    }
    case 'electricity-cost': {
      const power = number(v.power, '平均功率（W）', 0, 1e9),
        hours = number(v.hours, '每日使用时间（h）', 0, 24),
        days = number(v.days, '使用天数', 0, 366000),
        rate = number(v.rate, '电价（元/kWh）', 0, 1e6);
      if (!Number.isInteger(days)) throw Error('使用天数须为整数。');
      const daily = (power * hours) / 1000,
        total = daily * days;
      return { daily, total, cost: total * rate };
    }
    case 'battery-runtime': {
      const unit = mode(v.unit, ['Wh', 'Ah', 'mAh']),
        capacity = pos(v.capacity, '额定容量'),
        fraction = number(v.available, '剩余可用容量比例（%）', 0, 100) / 100,
        efficiency = pct(v.efficiency, '输出转换效率（%）'),
        power = pos(v.power, '负载平均功率（W）');
      const energy =
          unit === 'Wh'
            ? capacity
            : (capacity * pos(v.voltage, '电池标称电压（V）')) / (unit === 'mAh' ? 1000 : 1),
        usable = energy * fraction * efficiency;
      return { energy, usable, hours: usable / power };
    }
    case 'solution-dilution': {
      const m = mode(v.mode, ['stock', 'final', 'concentration']),
        stock = pos(v.stock, '原液浓度（mol/L）', 1e6);
      if (m === 'stock') {
        const concentration = pos(v.concentration, '目标浓度（mol/L）', stock),
          final = pos(v.final, '最终溶液体积（mL）');
        return {
          stockVolume: (concentration * final) / stock,
          final,
          concentration,
          factor: stock / concentration,
        };
      }
      const stockVolume = pos(v.stockVolume, '取用原液体积（mL）');
      if (m === 'final') {
        const concentration = pos(v.concentration, '目标浓度（mol/L）', stock);
        return {
          stockVolume,
          final: (stock * stockVolume) / concentration,
          concentration,
          factor: stock / concentration,
        };
      }
      const final = number(v.final, '最终溶液体积（mL）', stockVolume, 1e9);
      return {
        stockVolume,
        final,
        concentration: (stock * stockVolume) / final,
        factor: final / stockVolume,
      };
    }
    default:
      throw Error('未登记的计算器。');
  }
}
