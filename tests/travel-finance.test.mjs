import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTravelFinance as calc,
  loanSchedule,
  money,
} from '../public/practical/travel-finance-model.js';
import { TRAVEL_FINANCE_DETAILS } from '../public/practical/travel-finance-data.js';
import { PRACTICAL_TASKS } from '../public/practical/catalog.js';
import { ARTICLES } from '../public/knowledge/content.js';
import { TASK_PROJECT_SOURCES } from '../public/project-source-contracts.js';
import { PRACTICAL_HELP } from '../public/practical/help.js';
const near = (a, b, t = 1e-9) => assert(Math.abs(a - b) <= t, `${a} ≠ ${b}`);
test('出行：速度、时长、路程、配速与停留的不同时间分母', () => {
  const r = calc('trip-pace', { mode: 'time', distance: 10, speed: 12, stop: 10 });
  assert.deepEqual(r, {
    distance: 10,
    speed: 12,
    minutes: 50,
    paceSeconds: 300,
    totalMinutes: 60,
    totalSpeed: 10,
  });
  near(calc('trip-pace', { mode: 'speed', distance: 42.195, minutes: 180, stop: 0 }).speed, 14.065);
  near(calc('trip-pace', { mode: 'distance', speed: 90, minutes: 80, stop: 10 }).distance, 120);
  const p = calc('trip-pace', {
    mode: 'pace',
    distance: 10,
    paceMinutes: 5,
    paceSeconds: 30,
    stop: 0,
  });
  near(p.minutes, 55);
  near(p.paceSeconds, 330);
  for (const patch of [{ speed: 0 }, { stop: '' }, { stop: -1 }, { distance: NaN }])
    assert.throws(() =>
      calc('trip-pace', { mode: 'time', distance: 10, speed: 12, stop: 0, ...patch }),
    );
  for (const paceSeconds of [60, 1.5, -1])
    assert.throws(() =>
      calc('trip-pace', { mode: 'pace', distance: 10, stop: 0, paceMinutes: 5, paceSeconds }),
    );
  assert.throws(() =>
    calc('trip-pace', { mode: 'pace', distance: 10, stop: 0, paceMinutes: 0, paceSeconds: 0 }),
  );
});
test('行程能耗：燃油和电耗单位、额外费用、人数与零单价', () => {
  assert.deepEqual(
    calc('trip-cost', {
      mode: 'fuel',
      distance: 200,
      consumption: 7,
      price: 8,
      extra: 30,
      people: 2,
    }),
    { amount: 14, energyCost: 112, total: 142, perPerson: 71, perKm: 0.71, unit: 'L' },
  );
  const r = calc('trip-cost', {
    mode: 'electric',
    distance: 300,
    consumption: 15,
    price: 0.8,
    extra: 24,
    people: 3,
  });
  assert.equal(r.unit, 'kWh');
  near(r.amount, 45);
  near(r.total, 60);
  near(r.perPerson, 20);
  assert.equal(
    calc('trip-cost', {
      mode: 'electric',
      distance: 10,
      consumption: 0,
      price: 0,
      extra: 0,
      people: 1,
    }).total,
    0,
  );
  assert.throws(() =>
    calc('trip-cost', {
      mode: 'fuel',
      distance: 10,
      consumption: 7,
      price: 8,
      extra: 0,
      people: 1.5,
    }),
  );
});
test('反应与制动：OpenStax 2.12 算例，零速度与平方规律', () => {
  const r = calc('stopping-distance', { speed: 108, reaction: 0.5, deceleration: 7 });
  near(r.reactionDistance, 15);
  near(r.brakingDistance, 64.28571428571429);
  near(r.totalDistance, 79.28571428571429);
  near(
    calc('stopping-distance', { speed: 108, reaction: 0.5, deceleration: 5 }).totalDistance,
    105,
  );
  near(
    calc('stopping-distance', { speed: 216, reaction: 0.5, deceleration: 7 }).brakingDistance,
    4 * r.brakingDistance,
  );
  assert.equal(
    calc('stopping-distance', { speed: 0, reaction: 0, deceleration: 7 }).totalDistance,
    0,
  );
  assert.throws(() => calc('stopping-distance', { speed: 100, reaction: 0.5, deceleration: 0 }));
});
test('本息：教材 6.41、单利、零利率、完整周期及范围', () => {
  const r = calc('interest-growth', {
    mode: 'compound',
    principal: '5000',
    rate: '3.8',
    frequency: 12,
    periods: 60,
  });
  near(r.balance, 6044.43317859664, 1e-8);
  near(r.interest, 1044.43317859664, 1e-8);
  near(r.effective, 3.86688693803633);
  near(r.years, 5);
  near(
    calc('interest-growth', { mode: 'simple', principal: '10000', rate: '3', years: 2 }).balance,
    10600,
  );
  assert.equal(
    calc('interest-growth', {
      mode: 'compound',
      principal: '100',
      rate: '0',
      frequency: 365,
      periods: 365,
    }).balance,
    100,
  );
  assert.equal(
    calc('interest-growth', {
      mode: 'compound',
      principal: '0',
      rate: '10',
      frequency: 1,
      periods: 0,
    }).interest,
    0,
  );
  for (const patch of [
    { frequency: 3 },
    { periods: 1.5 },
    { periods: 36501 },
    { principal: '1e6' },
    { principal: '1.001' },
    { rate: '3.0000001' },
  ])
    assert.throws(() =>
      calc('interest-growth', {
        mode: 'compound',
        principal: '100',
        rate: '3',
        frequency: 365,
        periods: 365,
        ...patch,
      }),
    );
  assert.throws(() =>
    calc('interest-growth', {
      mode: 'compound',
      principal: '1000000000',
      rate: '100',
      frequency: 1,
      periods: 100,
    }),
  );
});
function balanceChecks(r) {
  assert.equal(r.schedule.at(-1).balance, 0n);
  assert.equal(
    r.schedule.reduce((s, p) => s + p.principal, 0n),
    r.principal,
  );
  assert.equal(
    r.schedule.reduce((s, p) => s + p.interest, 0n),
    r.totalInterest,
  );
  assert.equal(r.totalPayment, r.totalInterest + r.principal);
  let balance = r.principal;
  for (const p of r.schedule) {
    assert.equal(p.opening, balance);
    assert.equal(p.payment, p.interest + p.principal);
    assert.equal(p.balance, p.opening - p.principal);
    assert(p.principal >= 0n && p.balance >= 0n);
    balance = p.balance;
  }
}
test('贷款：教材月供、逐分金额守恒与末期据实结清', () => {
  const r = loanSchedule({ principal: '28500', rate: '3.99', months: 60 });
  assert.equal(r.payment, 52475n);
  assert.equal(r.schedule[0].interest, 9476n);
  assert.equal(r.schedule[0].principal, 42999n);
  assert.equal(r.schedule.at(-1).payment, 52423n);
  assert.equal(r.totalInterest, 298448n);
  assert.equal(r.schedule.length, 60);
  balanceChecks(r);
  assert.equal(money(r.totalPayment), '31,484.48');
  assert.equal(money(1n), '0.01');
  assert.equal(money(-99n), '-0.99');
});
test('贷款：零利率、半分舍入、微小利率及最长完整还款表', () => {
  const zero = loanSchedule({ principal: '100', rate: '0', months: 3 });
  assert.equal(zero.payment, 3334n);
  assert.equal(zero.totalInterest, 0n);
  assert.equal(zero.schedule.at(-1).payment, 3332n);
  balanceChecks(zero);
  const half = loanSchedule({ principal: '1', rate: '6', months: 1 });
  assert.equal(half.schedule[0].interest, 1n);
  balanceChecks(half);
  const tiny = loanSchedule({ principal: '0.01', rate: '0', months: 1200 });
  assert.equal(tiny.actualMonths, 1);
  balanceChecks(tiny);
  for (const rate of ['0.000001', '100']) {
    const r = loanSchedule({ principal: '1000000000', rate, months: 1200 });
    if (rate === '0.000001') assert.equal(r.schedule.length, 1200);
    else assert(r.schedule.length <= 1200 && r.schedule.length > 1);
    balanceChecks(r);
  }
  for (const patch of [
    { principal: '0' },
    { principal: '0.001' },
    { rate: '-1' },
    { rate: '100.1' },
    { months: 1201 },
    { months: 1.5 },
    { rate: '1e-6' },
    { months: '' },
  ])
    assert.throws(() => loanSchedule({ principal: '100', rate: '3', months: 12, ...patch }));
});
test('五项工具均有独立入口、完整公式、帮助、逐项科普与明确原创来源契约', () => {
  assert.equal(Object.keys(TRAVEL_FINANCE_DETAILS).length, 5);
  for (const [id, d] of Object.entries(TRAVEL_FINANCE_DETAILS)) {
    assert(PRACTICAL_TASKS.some((t) => t.id === id));
    assert(PRACTICAL_HELP[id].tip.length > 20);
    const article = ARTICLES.find((a) => a.capabilityIds.includes('native:' + id));
    assert(article);
    assert(article.preface.length);
    assert(article.sections.some((s) => s.examples.length));
    assert(d.formula && d.symbols && d.limits);
    assert(d.sources.length);
    for (const s of d.sources) {
      assert(s.locator && s.publisher);
      assert(s.url.startsWith('https://'));
    }
    assert.deepEqual(TASK_PROJECT_SOURCES['native:' + id].urls, []);
  }
});
