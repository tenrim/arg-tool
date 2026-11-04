import {
  Box,
  Button,
  Card,
  Disclosure,
  DataList,
  Field,
  FormGrid,
  Input,
  Link,
  Option,
  Result,
  Select,
  Status,
  ToolHeader,
  ToolPanel,
  Toolbar,
  onDisconnect,
  updateStatus,
} from '../ui/index.js';
import { UNIT_DISCIPLINES, unitDiscipline } from '../capabilities/unit-catalog.js';
import { qalculateClient } from './client.js';
import { findUnit, unitGroups, unitAmount } from './player-model.js';
import { reportResult, recordJSON, unitExpression } from './model.js';
import { resultRecording } from '../result-recording.js';
import { liveCalculation } from './live.js';

export function mountUnits(main) {
  const calc = qalculateClient((text) => message(text)),
    catalog = qalculateClient(),
    drafts = new Map(),
    disciplineDrafts = new Map();
  const discipline = Select({
    id: 'unit-discipline',
    children: UNIT_DISCIPLINES.map((d) => Option(d.title, d.id)),
  });
  const quantity = Select({ id: 'unit-category' }),
    amount = Input({ id: 'unit-amount', value: '1', attrs: { inputmode: 'decimal' } }),
    from = Select({ id: 'unit-from' }),
    to = Select({ id: 'unit-to' });
  const status = Status({ id: 'unit-status' }),
    note = Box({ tag: 'p', hidden: true }),
    output = Result({
      tag: 'output',
      id: 'unit-output',
      text: '—',
      attrs: { 'data-variant': 'metric', 'aria-live': 'polite', 'aria-label': '换算结果' },
    });
  const stop = Button({
      id: 'unit-stop',
      text: '停止',
      hidden: true,
      on: {
        click: () => {
          invalidate();
          message('已停止。');
        },
      },
    }),
    retry = Button({
      id: 'unit-retry',
      text: '重新载入单位',
      hidden: true,
      on: { click: () => load() },
    });
  const swap = Button({
    id: 'unit-swap',
    text: '交换单位',
    on: {
      click: () => {
        [from.value, to.value] = [to.value, from.value];
        showNotation();
        refresh(true);
      },
    },
  });
  const copy = Button({
    id: 'unit-copy',
    text: '复制结果',
    disabled: true,
    on: {
      click: () =>
        navigator.clipboard
          .writeText(reportResult(current))
          .catch(() => message('复制失败，请手动选择结果。', 'error')),
    },
  });
  const download = Button({
    id: 'unit-download',
    text: '下载完整记录',
    disabled: true,
    on: {
      click: () => {
        const url = URL.createObjectURL(
          new Blob([recordJSON(current)], { type: 'application/json' }),
        );
        Link({ attrs: { href: url, download: '单位换算记录.json' } }).click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
    },
  });
  const resultActions = Toolbar({ hidden: true, children: [copy, download] });
  const actionBar = Toolbar({
    id: 'unit-result-actions',
    hidden: true,
    attrs: { 'data-variant': 'action-bar', 'aria-label': '换算结果操作' },
    children: [resultActions],
  });
  const notation = Disclosure({
      id: 'unit-notation',
      children: [Box({ tag: 'summary', text: '单位详细记号' })],
    }),
    notationBody = Box({});
  notation.append(notationBody);
  const readout = Box({
    attrs: { 'data-variant': 'unit-readout' },
    children: [Box({ tag: 'span', text: '换算结果' }), output],
  });
  const actions = Box({
    attrs: { 'data-layout': 'action-stack' },
    children: [Toolbar({ children: [swap, stop, retry] }), note, status, actionBar, notation],
  });
  const form = Card({
    title: '单位换算',
    children: [
      Field({ label: '学科', control: discipline, hidden: true }),
      Field({ label: '物理量', control: quantity }),
      FormGrid({
        minColumnWidth: '8rem',
        align: 'start',
        children: [Field({ label: '数值', control: amount }), readout],
      }),
      FormGrid({
        minColumnWidth: '12rem',
        children: [
          Field({ label: '原单位', control: from }),
          Field({ label: '目标单位', control: to }),
        ],
      }),
      actions,
    ],
  });
  const panel = ToolPanel({
    id: 'panel-unitconvert',
    className: 'panel',
    hidden: true,
    header: ToolHeader({ className: 'page-heading', title: '单位换算' }),
    body: form,
  });
  main.append(panel);
  const recording = resultRecording({
    id: 'unit-result',
    panel,
    anchor: output,
    onLeave: () => invalidate(),
  });
  actionBar.append(recording.toolbar);
  let groups = [],
    loading = null,
    current = null,
    busy = false,
    disposed = false,
    composing = false,
    selectedCategory = '',
    selectedDiscipline = '';
  function message(text = '', tone) {
    updateStatus(status, text, tone);
    status.hidden = !text;
  }
  function state() {
    stop.hidden = !busy;
    swap.disabled = !groups.length;
    copy.disabled = download.disabled = !current;
    actionBar.hidden = resultActions.hidden = recording.toolbar.hidden = !current;
    output.dataset.state = current ? 'ready' : 'empty';
  }
  const live = liveCalculation({
    cancel: () => calc.cancel(),
    clear: () => {
      busy = false;
      current = null;
      recording.clear();
      output.textContent = '—';
      message();
      state();
    },
    pending: () => {
      busy = true;
      state();
    },
    run: async (expression) => {
      const result = await calc.run('calculate', {
        expressions: [expression],
        options: ['precision 20'],
      });
      const errors = result.values.flatMap((v) =>
        v.messages.filter((m) => m.type === 0).map((m) => m.text),
      );
      if (errors.length) throw Error(errors.join('\n'));
      return result;
    },
    publish: (result) => {
      if (panel.hidden || disposed) return;
      busy = false;
      current = result;
      output.textContent = result.values.at(-1)?.output || '—';
      message();
      recording.publish({ text: recordJSON(result), name: '单位换算记录.json' });
      state();
    },
    fail: (error) => {
      busy = false;
      message(error.message, 'error');
      state();
    },
  });
  function invalidate() {
    live.stop();
    calc.cancel();
  }
  function refresh(immediate = false) {
    if (disposed || panel.hidden || composing || !groups.length || !from.value || !to.value) {
      live.update(null);
      return;
    }
    try {
      const value = unitAmount(amount.value);
      live.update(
        value === null
          ? null
          : unitExpression(
              value,
              findUnit(groups, from.value)?.expression || from.value,
              findUnit(groups, to.value)?.expression || to.value,
            ),
        { immediate },
      );
    } catch (error) {
      live.update(null);
      message(error.message, 'error');
    }
  }
  function stash() {
    if (selectedCategory)
      drafts.set(selectedCategory, { amount: amount.value, from: from.value, to: to.value });
  }
  function draw() {
    const group = groups.find((g) => g.id === quantity.value);
    if (!group) {
      state();
      return;
    }
    const active = group.units.filter((u) => u.active);
    for (const [node, fallback] of [
      [from, active[0]?.name],
      [to, active[1]?.name || active[0]?.name],
    ]) {
      const old = findUnit([group], node.value)?.name || fallback;
      node.replaceChildren(
        ...group.units.map((u) => {
          const o = Option(
            u.label + (u.symbol ? ' · ' + u.symbol : '') + (u.active ? '' : '（已停用）'),
            u.name,
          );
          o.disabled = !u.active;
          return o;
        }),
      );
      node.value = old;
    }
    note.textContent =
      group.id === 'Currency'
        ? '使用随包固定汇率，不是实时汇率。'
        : group.id === 'Information'
          ? 'kB 按 1000 字节，KiB 按 1024 字节。'
          : '';
    note.hidden = !note.textContent;
    state();
  }
  function chooseCategory() {
    stash();
    selectedCategory = quantity.value;
    const d = drafts.get(selectedCategory);
    amount.value = d?.amount ?? '1';
    from.replaceChildren();
    to.replaceChildren();
    draw();
    if (d) {
      from.value = d.from;
      to.value = d.to;
    } else if (selectedCategory === 'Length') {
      from.value = 'm';
      to.value = 'cm_c';
    }
    showNotation();
    refresh(true);
  }
  function showNotation() {
    notationBody.replaceChildren(
      DataList({
        items: [
          ['原单位', findUnit(groups, from.value)?.expression || '—'],
          ['目标单位', findUnit(groups, to.value)?.expression || '—'],
        ],
      }),
    );
  }
  function chooseDiscipline() {
    stash();
    if (selectedDiscipline && selectedCategory)
      disciplineDrafts.set(selectedDiscipline, selectedCategory);
    const available = groups.filter((g) => unitDiscipline(g.id) === discipline.value),
      previous = disciplineDrafts.get(discipline.value) || quantity.value;
    selectedDiscipline = discipline.value;
    quantity.replaceChildren(...available.map((g) => Option(g.label, g.id)));
    if (available.some((g) => g.id === previous)) quantity.value = previous;
    selectedCategory = '';
    chooseCategory();
    if (!groups.length) load();
  }
  async function load() {
    if (loading) return loading;
    retry.hidden = true;
    message('正在载入单位…');
    loading = (async () => {
      try {
        const [data, definitions, translations] = await Promise.all([
          catalog.run('catalog'),
          fetch(new URL('./unit-definitions.json', import.meta.url)).then((r) => {
            if (!r.ok) throw Error('单位定义载入失败。');
            return r.json();
          }),
          fetch(new URL('../vendor/qalculate/zh-CN.json', import.meta.url)).then((r) => {
            if (!r.ok) throw Error('单位名称载入失败。');
            return r.json();
          }),
        ]);
        if (disposed) return;
        groups = unitGroups(data, definitions, translations);
        if (groups.some((g) => !unitDiscipline(g.id)))
          throw Error('单位分类不完整，请报告此问题。');
        chooseDiscipline();
      } catch (e) {
        if (!disposed) {
          message(e.message, 'error');
          retry.hidden = false;
        }
      } finally {
        loading = null;
        catalog.cancel();
        state();
      }
    })();
    return loading;
  }
  discipline.onchange = chooseDiscipline;
  quantity.onchange = chooseCategory;
  for (const node of [amount, from, to])
    node.addEventListener('input', () => {
      if (node !== amount) showNotation();
      refresh(node !== amount);
    });
  amount.addEventListener('compositionstart', () => {
    composing = true;
    live.update(null);
  });
  amount.addEventListener('compositionend', () => {
    composing = false;
    refresh();
  });
  amount.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.isComposing && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      refresh(true);
    }
  };
  onDisconnect(panel, () => {
    disposed = true;
    live.destroy();
    catalog.cancel();
  });
  message();
  state();
  return panel;
}
