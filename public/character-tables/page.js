import {
  Box,
  Button,
  Card,
  DataList,
  EmptyState,
  Field,
  FormGrid,
  Input,
  Link,
  Option,
  Select,
  Status,
  ToolHeader,
  ToolPanel,
  Toolbar,
  onDisconnect,
  updateStatus,
} from '../ui/index.js';
import { resultRecording } from '../result-recording.js';
import { LANGUAGES, viewsFor } from './catalog.js';
import { characterModel, exportCharacters } from './model.js';

export function mountCharacterTables(main) {
  const language = Select({
      id: 'characters-language',
      children: LANGUAGES.map((l) => Option(l.title, l.id)),
    }),
    view = Select({ id: 'characters-view' });
  const query = Input({
    id: 'characters-search',
    type: 'search',
    placeholder: '字符、U+3042、名称、数值:1/2',
    attrs: { maxlength: 120 },
  });
  const note = Box({ tag: 'p', className: 'help' }),
    summary = Status({ id: 'characters-summary' }),
    status = Status({ id: 'characters-status', attrs: { 'aria-live': 'polite' } });
  const grid = Box({
      id: 'characters-grid',
      className: 'character-grid',
      attrs: { role: 'group', 'aria-label': '字符表' },
    }),
    detail = Box({ id: 'characters-detail', className: 'character-detail', hidden: true });
  const previous = Button({ id: 'characters-prev', text: '上一页', disabled: true }),
    next = Button({ id: 'characters-next', text: '下一页', disabled: true }),
    pageLabel = Box({ id: 'characters-page', tag: 'span' });
  const copy = Button({ id: 'characters-copy', text: '复制字符', disabled: true }),
    copyPage = Button({ id: 'characters-copy-page', text: '复制本页字符', disabled: true }),
    download = Button({
      id: 'characters-download',
      text: '下载筛选后的完整字符表',
      disabled: true,
    });
  const selection = Toolbar({ children: [copy] }),
    detailBody = Box();
  detail.append(detailBody, selection);
  const retry = Button({ id: 'characters-retry', text: '重新载入', hidden: true });
  const panel = ToolPanel({
    id: 'panel-character-tables',
    className: 'panel',
    hidden: true,
    header: ToolHeader({ className: 'page-heading', title: '语言文字字符表' }),
    body: Card({
      children: [
        FormGrid({
          layout: 'flow',
          children: [
            Field({ label: '语言／文字', control: language }),
            Field({ label: '字符分组', control: view }),
            Field({ label: '在当前分组查找', control: query }),
          ],
        }),
        note,
        Toolbar({ children: [summary, copyPage, download] }),
        grid,
        Toolbar({ children: [previous, pageLabel, next] }),
        detail,
        status,
        retry,
      ],
    }),
  });
  main.append(panel);
  const recording = resultRecording({ id: 'characters-record', anchor: copy, panel });
  let model = null,
    loading = false,
    disposed = false,
    controller = null,
    revision = 0,
    page = 0,
    rows = [],
    selected = null;
  const pageSize = 96;
  const drafts = new Map();
  const currentLanguage = () => LANGUAGES.find((l) => l.id === language.value);
  function groups() {
    view.replaceChildren(...viewsFor(currentLanguage()).map(([id, title]) => Option(title, id)));
    view.value = drafts.get(language.value)?.view || currentLanguage().defaultView;
    query.value = drafts.get(language.value)?.query || '';
    note.textContent =
      currentLanguage().note +
      ' 名称保留 Unicode 标准英文；附加标记以虚线圆辅助显示，复制时不带圆圈。';
  }
  function clearSelection() {
    selected = null;
    detail.hidden = true;
    detailBody.replaceChildren();
    copy.disabled = true;
    recording.clear();
  }
  function invalidate() {
    revision++;
    clearSelection();
    updateStatus(status, '');
  }
  function choose(row) {
    invalidate();
    selected = row;
    detail.hidden = false;
    copy.disabled = false;
    for (const button of grid.querySelectorAll('button'))
      button.setAttribute('aria-pressed', String(button.dataset.character === row.text));
    const values = row.numericValues.filter((v) => v !== null),
      valueText = values.length ? values.join(' · ') : '';
    detailBody.replaceChildren(
      Box({
        tag: 'bdi',
        className: 'character-selected-glyph',
        text: row.display,
        attrs: { dir: 'auto' },
      }),
      DataList({
        items: [
          ['码点', row.codes],
          ['标准名称', row.name],
          ['类别', row.categories.join(' · ')],
          ...(valueText ? [['标准数值', valueText]] : []),
        ],
      }),
    );
    recording.publish(() => ({
      text:
        row.text +
        '\n' +
        row.codes +
        '\n' +
        row.name +
        (valueText ? '\n标准数值：' + valueText : ''),
      name: '字符-' + row.codes + '.txt',
    }));
  }
  function render() {
    invalidate();
    if (!model) return;
    rows = model.search(language.value, view.value, query.value);
    page = Math.min(page, Math.max(0, Math.ceil(rows.length / pageSize) - 1));
    const visible = rows.slice(page * pageSize, (page + 1) * pageSize);
    grid.replaceChildren(
      ...visible.map((row) =>
        Button({
          variant: 'character',
          appearance: 'custom',
          attrs: {
            'aria-label': row.text + ' · ' + row.codes + ' · ' + row.name,
            'aria-pressed': 'false',
            'data-character': row.text,
          },
          children: [
            Box({
              tag: 'bdi',
              className: 'character-glyph',
              text: row.display,
              attrs: { dir: 'auto' },
            }),
            Box({ tag: 'span', className: 'character-code', text: row.codes }),
          ],
          on: { click: () => choose(row) },
        }),
      ),
    );
    if (!visible.length)
      grid.append(EmptyState({ text: '当前分组没有匹配字符。可修改查询或选择“全部收录字符”。' }));
    updateStatus(summary, rows.length + ' 项' + (query.value.trim() ? '匹配' : '字符'));
    pageLabel.textContent = rows.length
      ? page + 1 + ' / ' + Math.ceil(rows.length / pageSize)
      : '0 / 0';
    previous.disabled = page === 0;
    next.disabled = (page + 1) * pageSize >= rows.length;
    copyPage.disabled = download.disabled = !rows.length;
  }
  async function load() {
    if (model) {
      render();
      return;
    }
    if (loading || disposed) return;
    loading = true;
    retry.hidden = true;
    controller = new AbortController();
    updateStatus(status, '正在载入本地字符表…');
    try {
      const response = await fetch(
        new URL('../vendor/character-tables/characters.json', import.meta.url),
        { signal: controller.signal },
      );
      if (!response.ok) throw Error('字符资料载入失败，请重试。');
      const data = await response.json();
      if (disposed || controller.signal.aborted) return;
      model = characterModel(data);
      if (!panel.hidden) render();
    } catch (error) {
      if (error.name !== 'AbortError' && !disposed) {
        updateStatus(status, error.message, 'error');
        retry.hidden = false;
      }
    } finally {
      loading = false;
    }
  }
  language.addEventListener('change', () => {
    page = 0;
    groups();
    render();
  });
  view.addEventListener('change', () => {
    page = 0;
    drafts.set(language.value, { view: view.value, query: query.value });
    render();
  });
  query.addEventListener('input', () => {
    page = 0;
    drafts.set(language.value, { view: view.value, query: query.value });
    render();
  });
  previous.addEventListener('click', () => {
    page--;
    render();
  });
  next.addEventListener('click', () => {
    page++;
    render();
  });
  retry.addEventListener('click', load);
  async function copyText(text) {
    const rev = revision;
    try {
      await navigator.clipboard.writeText(text);
      if (rev === revision) updateStatus(status, '已复制', 'success');
    } catch {
      if (rev === revision)
        updateStatus(status, '无法访问剪贴板，请从字符详情中选取文字。', 'error');
    }
  }
  copy.addEventListener('click', () => {
    if (selected) void copyText(selected.text);
  });
  copyPage.addEventListener('click', () =>
    copyText(
      rows
        .slice(page * pageSize, (page + 1) * pageSize)
        .map((r) => r.text)
        .join(' '),
    ),
  );
  download.addEventListener('click', () => {
    if (!rows.length) return;
    const data = exportCharacters(rows, {
        language: language.value,
        view: view.value,
        query: query.value,
      }),
      url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      );
    Link({
      attrs: { href: url, download: '迷雾工具箱-' + currentLanguage().title + '-字符表.json' },
    }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const onPanel = ({ detail: event }) => {
    if (event.name === 'character-tables') void load();
    else invalidate();
  };
  document.addEventListener('arg:panelchange', onPanel);
  onDisconnect(panel, () => {
    disposed = true;
    revision++;
    controller?.abort();
    document.removeEventListener('arg:panelchange', onPanel);
  });
  groups();
  return panel;
}
