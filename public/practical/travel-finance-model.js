// Original fixed formula implementations. Rates and prices are user inputs;
// this model never contacts a bank, pricing service, map or vehicle system.
function value(v, label, min = 0, max = 1e9, { positive = false, integer = false } = {}) {
  if (v === undefined || v === null || String(v).trim() === '')
    throw Error('请填写' + label + '。');
  const n = Number(v);
  if (
    !Number.isFinite(n) ||
    n < min ||
    n > max ||
    (positive && n === 0) ||
    (integer && !Number.isInteger(n))
  )
    throw Error(
      label +
        '须为' +
        (integer ? '整数，' : '') +
        (positive && min === 0 ? '大于 0 且不超过 ' + max : min + ' 至 ' + max) +
        '。',
    );
  return n;
}
const positive = (v, label, max = 1e9) => value(v, label, 0, max, { positive: true });
function choice(v, choices) {
  if (!choices.includes(v)) throw Error('请选择有效的计算方式。');
  return v;
}
function decimal(v, label, places, max) {
  const n = value(v, label, 0, max),
    s = String(v).trim();
  if (!new RegExp('^\\d+(?:\\.\\d{1,' + places + '})?$').test(s))
    throw Error(label + '须为最多 ' + places + ' 位小数的非负十进制数，不使用指数记法。');
  const [whole, frac = ''] = s.split('.');
  return { n, scaled: BigInt(whole) * 10n ** BigInt(places) + BigInt(frac.padEnd(places, '0')) };
}
const rounded = (numerator, denominator) => (2n * numerator + denominator) / (2n * denominator);
export function loanSchedule(v) {
  const principal = decimal(v.principal, '借款本金（元）', 2, 1e9).scaled;
  if (principal === 0n) throw Error('借款本金须大于 0。');
  const rate = decimal(v.rate, '名义年利率（%）', 6, 100),
    months = value(v.months, '还款期数（月）', 1, 1200, { integer: true });
  const denominator = 1200n * 1000000n,
    N = BigInt(months);
  let numerator = principal,
    divisor = N;
  if (rate.scaled !== 0n) {
    // Evaluate the rational annuity exactly before rounding to cents, including
    // near-zero rates. The bounded 1200-period powers have no floating error.
    const growth = (denominator + rate.scaled) ** N,
      base = denominator ** N;
    numerator = principal * rate.scaled * growth;
    divisor = denominator * (growth - base);
  }
  const payment = (numerator + divisor - 1n) / divisor;
  let balance = principal,
    totalInterest = 0n,
    totalPayment = 0n;
  const schedule = [];
  for (let month = 1; month <= months && balance > 0n; month++) {
    const opening = balance,
      interest = rounded(opening * rate.scaled, denominator),
      due = opening + interest;
    const paid = month === months || payment >= due ? due : payment,
      principalPaid = paid - interest;
    if (principalPaid < 0n)
      throw Error('按分取整后的每期还款不足以覆盖利息，请调整本金、利率或期数。');
    balance -= principalPaid;
    totalInterest += interest;
    totalPayment += paid;
    schedule.push({ month, opening, interest, principal: principalPaid, payment: paid, balance });
  }
  return {
    principal,
    payment,
    totalInterest,
    totalPayment,
    months,
    actualMonths: schedule.length,
    schedule,
  };
}
export function calculateTravelFinance(id, v) {
  let result;
  switch (id) {
    case 'trip-pace': {
      const mode = choice(v.mode, ['time', 'speed', 'distance', 'pace']),
        stop = value(v.stop, '停留时间（分钟）', 0, 1e6);
      let distance, speed, minutes;
      if (mode !== 'distance') distance = positive(v.distance, '路程（km）', 1e7);
      if (mode === 'time' || mode === 'distance')
        speed = positive(v.speed, '移动平均速度（km/h）', 1e5);
      if (mode === 'speed' || mode === 'distance')
        minutes = positive(v.minutes, '移动时长（分钟）', 1e7);
      if (mode === 'time') minutes = (60 * distance) / speed;
      if (mode === 'speed') speed = (60 * distance) / minutes;
      if (mode === 'distance') distance = (speed * minutes) / 60;
      if (mode === 'pace') {
        const paceMinutes = value(v.paceMinutes, '每公里配速的分钟', 0, 10000, { integer: true }),
          paceSeconds = value(v.paceSeconds, '每公里配速的秒', 0, 59, { integer: true }),
          pace = paceMinutes + paceSeconds / 60;
        if (pace === 0) throw Error('每公里配速须大于 0 秒。');
        speed = 60 / pace;
        minutes = distance * pace;
      }
      result = {
        distance,
        speed,
        minutes,
        paceSeconds: 3600 / speed,
        totalMinutes: minutes + stop,
        totalSpeed: (60 * distance) / (minutes + stop),
      };
      break;
    }
    case 'trip-cost': {
      const mode = choice(v.mode, ['fuel', 'electric']),
        distance = positive(v.distance, '路程（km）', 1e7),
        consumption = value(
          v.consumption,
          mode === 'fuel' ? '百公里油耗（L/100 km）' : '百公里电耗（kWh/100 km）',
          0,
          1e6,
        ),
        price = value(v.price, mode === 'fuel' ? '油价（元/L）' : '电价（元/kWh）', 0, 1e6),
        extra = value(v.extra, '其他费用（元）', 0, 1e9),
        people = value(v.people, '分摊人数', 1, 10000, { integer: true });
      const amount = (distance * consumption) / 100,
        energyCost = amount * price,
        total = energyCost + extra;
      result = {
        amount,
        energyCost,
        total,
        perPerson: total / people,
        perKm: total / distance,
        unit: mode === 'fuel' ? 'L' : 'kWh',
      };
      break;
    }
    case 'stopping-distance': {
      const speed = value(v.speed, '初始速度（km/h）', 0, 2000) / 3.6,
        reaction = value(v.reaction, '反应时间（秒）', 0, 120),
        deceleration = positive(v.deceleration, '恒定减速度大小（m/s²）', 1000);
      const reactionDistance = speed * reaction,
        brakingDistance = (speed * speed) / (2 * deceleration),
        brakingSeconds = speed / deceleration;
      result = {
        speed,
        reactionDistance,
        brakingDistance,
        totalDistance: reactionDistance + brakingDistance,
        brakingSeconds,
        totalSeconds: reaction + brakingSeconds,
      };
      break;
    }
    case 'interest-growth': {
      const mode = choice(v.mode, ['simple', 'compound']),
        principal = decimal(v.principal, '本金（元）', 2, 1e9).n,
        rate = decimal(v.rate, '名义年利率（%）', 6, 100).n / 100;
      let years, factor, effective;
      if (mode === 'simple') {
        years = value(v.years, '存续年数', 0, 100);
        factor = 1 + rate * years;
        effective = null;
      } else {
        const frequency = value(v.frequency, '每年复利次数', 1, 365, { integer: true }),
          periods = value(v.periods, '完整计息期数', 0, 36500, { integer: true });
        if (![1, 2, 4, 12, 365].includes(frequency)) throw Error('请选择支持的复利周期。');
        years = periods / frequency;
        if (years > 100) throw Error('存续时间最多 100 年。');
        factor = Math.exp(periods * Math.log1p(rate / frequency));
        effective = Math.expm1(frequency * Math.log1p(rate / frequency)) * 100;
      }
      const interest =
        mode === 'simple'
          ? principal * rate * years
          : principal *
            Math.expm1(
              (v.periods === undefined ? 0 : Number(v.periods)) *
                Math.log1p(rate / Number(v.frequency)),
            );
      result = { principal, interest, balance: principal * factor, years, effective };
      if (result.balance > 1e12)
        throw Error('估算本息超过本工具 1 万亿元的显示范围，请减小本金、利率或期数。');
      break;
    }
    case 'loan-payment':
      return loanSchedule(v);
    default:
      throw Error('未登记的计算器。');
  }
  if (Object.values(result).some((n) => typeof n === 'number' && !Number.isFinite(n)))
    throw Error('输入量级超出计算范围，请检查数值。');
  return result;
}
export function money(cents) {
  const n = BigInt(cents),
    negative = n < 0n,
    raw = (negative ? -n : n).toString().padStart(3, '0');
  return (
    (negative ? '-' : '') +
    raw.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
    '.' +
    raw.slice(-2)
  );
}
