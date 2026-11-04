import {
  Box,
  Button,
  Disclosure,
  Input,
  Select,
  Option,
  Toolbar,
  Status,
  updateStatus,
  Field,
} from './ui/index.js';
export const PRESETS_KEY = 'arg.ui.parameter-presets.v1';
const LIMIT = 128 * 1024;
export function readPresets(storage = localStorage) {
  const text = storage.getItem(PRESETS_KEY);
  if (!text) return [];
  if (text.length > LIMIT) throw Error('参数预设超过容量限制。');
  const rows = JSON.parse(text);
  if (
    !Array.isArray(rows) ||
    rows.length > 100 ||
    rows.some(
      (r) =>
        !r ||
        typeof r.id !== 'string' ||
        typeof r.key !== 'string' ||
        typeof r.name !== 'string' ||
        !r.values ||
        Array.isArray(r.values) ||
        typeof r.values !== 'object',
    )
  )
    throw Error('参数预设格式无效；原数据未改写。');
  return rows;
}
export function writePresets(rows, storage = localStorage) {
  const text = JSON.stringify(rows);
  if (rows.length > 100 || text.length > LIMIT)
    throw Error('最多保存 100 份预设，合计不超过 128 KB。');
  storage.setItem(PRESETS_KEY, text);
}
export function presetControls({ snapshot, apply }) {
  const name = Input({
    attrs: { maxlength: 80, 'aria-label': '预设名称' },
    placeholder: '例如：高精度',
  });
  const choice = Select({ attrs: { 'aria-label': '已保存的参数预设' } });
  const status = Status();
  const root = Disclosure({
    attrs: { 'data-parameter-presets': '' },
    hidden: true,
    children: [Box({ tag: 'summary', text: '参数预设' })],
  });
  let key = '';
  const perform = (fn) => {
    try {
      fn();
    } catch (error) {
      updateStatus(status, error.message || '无法保存到本机。', 'error');
    }
  };
  function refresh(selected = choice.value) {
    const rows = readPresets().filter((r) => r.key === key);
    choice.replaceChildren(Option('选择预设', ''), ...rows.map((r) => Option(r.name, r.id)));
    choice.value = rows.some((r) => r.id === selected) ? selected : '';
  }
  const getName = () => {
    const value = name.value.trim();
    if (!value || value.length > 80) throw Error('请填写 1–80 字的预设名称。');
    return value;
  };
  root.append(
    Toolbar({
      children: [
        Field({ label: '已有预设', control: choice }),
        Button({
          text: '应用',
          on: {
            click: () =>
              perform(() => {
                const row = readPresets().find((r) => r.key === key && r.id === choice.value);
                if (!row) throw Error('请先选择预设。');
                const count = apply(row.values);
                updateStatus(status, `已应用 ${count} 个仍兼容的参数；未自动执行。`, 'success');
              }),
          },
        }),
        Button({
          text: '删除',
          on: {
            click: () =>
              perform(() => {
                if (!choice.value) throw Error('请先选择预设。');
                writePresets(
                  readPresets().filter((r) => !(r.id === choice.value && r.key === key)),
                );
                refresh();
                updateStatus(status, '已删除所选预设。');
              }),
          },
        }),
      ],
    }),
    Toolbar({
      children: [
        Field({ label: '预设名称', control: name }),
        Button({
          text: '保存当前参数',
          on: {
            click: () =>
              perform(() => {
                const values = snapshot(),
                  label = getName(),
                  rows = readPresets();
                if (!Object.keys(values).length) throw Error('当前没有可安全保存的参数。');
                if (rows.some((r) => r.key === key && r.name === label))
                  throw Error('已有同名预设，请使用另一个名称。');
                const id = crypto.randomUUID();
                writePresets([...rows, { id, key, name: label, values }]);
                refresh(id);
                updateStatus(status, '已保存到本机；不包含正文、文件、密码或密钥。', 'success');
              }),
          },
        }),
        Button({
          text: '重命名所选预设',
          on: {
            click: () =>
              perform(() => {
                const label = getName(),
                  rows = readPresets(),
                  row = rows.find((r) => r.key === key && r.id === choice.value);
                if (!row) throw Error('请先选择预设。');
                if (rows.some((r) => r.key === key && r.name === label && r.id !== row.id))
                  throw Error('已有同名预设。');
                row.name = label;
                writePresets(rows);
                refresh();
                updateStatus(status, '预设已重命名。', 'success');
              }),
          },
        }),
      ],
    }),
    status,
  );
  return {
    root,
    activate(panel, namespace) {
      key = namespace;
      name.value = '';
      updateStatus(status, '');
      root.open = false;
      root.hidden = false;
      panel.append(root);
      perform(() => refresh(''));
    },
    hide() {
      root.hidden = true;
    },
  };
}
