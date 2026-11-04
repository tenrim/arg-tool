import {
  Box,
  Button,
  Card,
  DataList,
  Disclosure,
  Field,
  FilePicker,
  Input,
  Option,
  Select,
  Status,
  ToolHeader,
  ToolPanel,
  Toolbar,
  updateStatus,
} from './ui/index.js';
import {
  getPreferences,
  setPreferences,
  resetPreferences,
  favoriteEntries,
  setFavorites,
  moveFavorite,
  preferenceTarget,
  startupTargets,
  clearRecent,
  importPreferences,
} from './preferences.js';
import { clearToolPreferences } from './tool-preferences.js';

export function mountSettings({ navigate, notebook, downloadSettings }) {
  const panel = ToolPanel({
    id: 'panel-settings',
    className: 'panel site-page',
    hidden: true,
    header: ToolHeader({ className: 'page-heading', title: '设置' }),
  });
  const status = Status({ id: 'settings-status', text: '设置即时生效，保存在当前浏览器。' }),
    controls = new Map();
  let revision = 0,
    storageRevision = 0;
  const report = (saved, text = '设置已保存') =>
    updateStatus(
      status,
      saved ? text : '设置已应用；浏览器储存不可用，仅本次有效',
      saved ? 'success' : 'info',
    );
  const change = (key, value) => {
    revision++;
    importFile.value = '';
    report(setPreferences({ [key]: value }));
  };
  function row(key, label, description, options) {
    const value = getPreferences()[key];
    let control;
    if (typeof value === 'boolean') {
      control = Button({
        id: 'setting-' + key,
        variant: 'setting-toggle',
        appearance: 'custom',
        attrs: { role: 'switch', 'aria-checked': String(value), 'aria-label': label },
        on: { click: () => change(key, !getPreferences()[key]) },
      });
    } else if (key === 'masterVolume') {
      control = Input({
        id: 'setting-' + key,
        type: 'range',
        value,
        attrs: { min: 0, max: 100, step: 1, 'aria-label': label },
        on: { input: (event) => change(key, Number(event.target.value)) },
      });
    } else {
      control = Select({
        id: 'setting-' + key,
        children: options.map(([value, text]) => Option(text, String(value))),
      });
      control.addEventListener('change', () =>
        change(
          key,
          typeof getPreferences()[key] === 'number' ? Number(control.value) : control.value,
        ),
      );
    }
    controls.set(key, control);
    return Field({
      tag: typeof value === 'boolean' ? 'div' : 'label',
      className: 'settings-row',
      label,
      description,
      control,
    });
  }
  const display = Card({
    title: '显示与编辑',
    children: [
      row('textSize', '界面文字', '导航、标签与说明的整体字号。', [
        ['standard', '标准'],
        ['large', '较大'],
      ]),
      row('density', '界面密度', '调整控件间距与页面疏密。', [
        ['compact', '紧凑'],
        ['comfortable', '舒适'],
      ]),
      row(
        'editorSize',
        '编辑区字号',
        '单独调整文本、代码与结果的字号。',
        [12, 14, 16, 18, 20, 24].map((n) => [n, n + ' px']),
      ),
      row('inputWrap', '输入自动换行', '仅影响显示，保留原始换行与内容。', [
        ['wrap', '自动换行'],
        ['scroll', '横向滚动'],
      ]),
      row('resultWrap', '结果自动换行', '长编码和日志可横向查看。', [
        ['wrap', '自动换行'],
        ['scroll', '横向滚动'],
      ]),
    ],
  });
  const favorites = Box({ id: 'settings-favorites', className: 'settings-favorites' });
  const habits = Card({
    title: '使用习惯',
    children: [
      row(
        'searchKnowledge',
        '搜索中显示科普',
        '默认仅搜索工具与网站页面。开启后，顶部、侧栏和工具目录搜索同时显示科普；科普目录与“相关科普”入口始终保留。',
      ),
      row('startPage', '启动页面', '直接访问工具链接时，优先打开链接指定的工具。', [
        ['home', '首页'],
        ['last', '上次使用的工具'],
      ]),
      row('sidebarCollapsed', '默认收起桌面侧栏', '下次打开或切回桌面布局时使用此偏好。'),
      row(
        'rememberParameters',
        '记住工具参数',
        '记住转换工具的选项、数值参数、操作与方向；不保存正文、文件、自由文本、密码或密钥。',
      ),
      row(
        'recordRecent',
        '记录最近使用',
        '仅当前会话记录工具名称；关闭后清空记录并停用“上次使用的工具”恢复。',
      ),
      row('recentLimit', '最近使用数量', '达到上限后移除最早的记录。', [
        [6, '6 项'],
        [12, '12 项'],
        [20, '20 项'],
      ]),
      row('showRecent', '显示最近使用入口', '隐藏入口仍可保留记录。'),
      row('showFavorites', '显示收藏入口', '收藏内容保持不变。'),
      row('favoriteSort', '收藏排序', '手动顺序在首页、侧栏和收藏目录同步。', [
        ['manual', '手动排序'],
        ['name', '按名称排序'],
      ]),
      Disclosure({ children: [Box({ tag: 'summary', text: '调整收藏顺序' }), favorites] }),
      row(
        'runShortcut',
        '快捷键执行',
        '在支持执行的工具中按 Ctrl / ⌘ + Enter 执行；中文组合输入时不会触发。',
      ),
      Disclosure({
        children: [
          Box({ tag: 'summary', text: '查看快捷键' }),
          DataList({
            items: [
              ['Ctrl / ⌘ + K', '聚焦工具搜索'],
              ['↑ / ↓、Enter', '在搜索结果中选择并打开工具'],
              ['Escape', '关闭搜索浮层或当前弹窗'],
              ['Ctrl / ⌘ + Enter', '执行当前工具，受上方开关控制'],
              ['Tab / Shift + Tab', '向前／向后移动焦点'],
            ],
          }),
        ],
      }),
    ],
  });
  const volume = Box({ id: 'settings-volume-value', tag: 'span', text: '100%' });
  const sound = Card({
    title: '声音与动效',
    children: [
      row('masterVolume', '全站音量', '只影响播放，保留工具自身音量，不改变分析与导出文件。'),
      volume,
      row('audioMuted', '全站静音', '音频、视频及琴键合成器统一静音。'),
      row('motion', '界面动画', '减少动态效果时，保留即时操作反馈。', [
        ['system', '跟随系统'],
        ['reduce', '减少动态效果'],
      ]),
      row('scanlines', '扫描线纹理', '使用 ARG 编年史的完整扫描线与 RGB 细纹。'),
    ],
  });
  const usage = Box({ id: 'settings-storage', attrs: { 'aria-live': 'polite' } });
  const importFile = Input({
    id: 'settings-import',
    type: 'file',
    attrs: { accept: '.json,application/json', 'aria-label': '导入设置文件（最多 64 KB）' },
  });
  importFile.addEventListener('change', async () => {
    const file = importFile.files?.[0],
      gen = ++revision;
    if (!file) return;
    try {
      if (file.size > 65536) throw Error('设置文件超过 64 KB。');
      const text = await file.text();
      if (gen !== revision) return;
      report(importPreferences(text), '设置与收藏已导入');
    } catch (error) {
      if (gen === revision) updateStatus(status, error.message, 'error');
    } finally {
      if (gen === revision) importFile.value = '';
    }
  });
  async function openNotebook(kind) {
    try {
      await navigate('notebook');
      if (kind === 'trash') await notebook().openTrash();
      else notebook().openFiles();
    } catch (error) {
      updateStatus(status, error.message, 'error');
    }
  }
  const data = Card({
    title: '数据与备份',
    children: [
      usage,
      Toolbar({
        children: [
          Button({
            text: '刷新占用',
            id: 'settings-refresh-storage',
            on: { click: refreshStorage },
          }),
          Button({
            text: '笔记备份与恢复',
            id: 'settings-notebook-backup',
            on: { click: () => openNotebook('backup') },
          }),
          Button({
            text: '笔记回收站',
            id: 'settings-notebook-trash',
            on: { click: () => openNotebook('trash') },
          }),
        ],
      }),
      Box({
        tag: 'p',
        className: 'help',
        text: '笔记备份包含正文、附件、脑图、白板和回收站。下方设置备份仅包含使用偏好与收藏，不包含工具参数、输入或笔记。',
      }),
      Toolbar({
        children: [
          Button({ text: '导出设置与收藏', on: { click: downloadSettings } }),
          FilePicker({
            tag: 'div',
            input: importFile,
            triggerLabel: '导入设置与收藏',
            showFilename: false,
          }),
        ],
      }),
      Disclosure({
        children: [
          Box({ tag: 'summary', text: '重置与清理' }),
          Box({ tag: 'p', text: '仅清理所选项目；需要保留时请先备份。' }),
          Toolbar({
            children: [
              Button({
                text: '恢复默认设置',
                variant: 'danger',
                on: {
                  click: () => {
                    revision++;
                    importFile.value = '';
                    report(resetPreferences(), '已恢复默认设置');
                  },
                },
              }),
              Button({
                text: '清除已记住的工具参数',
                on: { click: () => report(clearToolPreferences(), '已清除记住的工具参数与方向') },
              }),
              Button({
                text: '清空最近使用',
                on: {
                  click: () => {
                    clearRecent();
                    updateStatus(status, '最近使用已清空', 'success');
                  },
                },
              }),
              Button({
                text: '清空收藏',
                variant: 'danger',
                on: { click: () => report(setFavorites([]), '收藏已清空') },
              }),
            ],
          }),
        ],
      }),
    ],
  });
  const size = (bytes) =>
    bytes < 1024
      ? bytes + ' B'
      : bytes < 1048576
        ? (bytes / 1024).toFixed(1) + ' KB'
        : (bytes / 1048576).toFixed(1) + ' MB';
  async function refreshStorage() {
    const gen = ++storageRevision;
    usage.replaceChildren(Box({ tag: 'p', text: '正在读取本地数据占用…' }));
    try {
      const summary = await notebook().storageSummary();
      if (gen !== storageRevision) return;
      const items = [
        ['笔记', summary.notes + ' 篇'],
        ['回收站', summary.trash + ' 篇'],
        ['附件（含回收站）', summary.assets + ' 个'],
        ['正文及附件合计', size(summary.bytes)],
      ];
      try {
        const estimate = await navigator.storage?.estimate();
        if (estimate && Number.isFinite(estimate.usage) && Number.isFinite(estimate.quota))
          items.push([
            '本站存储（浏览器估算）',
            size(estimate.usage) + ' / ' + size(estimate.quota),
          ]);
      } catch {
        /* notebook counts remain available */
      }
      if (gen === storageRevision) usage.replaceChildren(DataList({ items }));
    } catch (error) {
      if (gen === storageRevision)
        usage.replaceChildren(Box({ tag: 'p', text: error.message || '无法读取本地数据。' }));
    }
  }
  function drawFavorites() {
    const p = getPreferences(),
      entries = favoriteEntries();
    favorites.replaceChildren(
      ...entries.map((entry, index) =>
        Box({
          className: 'settings-favorite',
          children: [
            Box({ tag: 'span', text: entry.title }),
            Toolbar({
              children: [
                Button({
                  text: '上移',
                  disabled: p.favoriteSort !== 'manual' || index === 0,
                  attrs: { 'aria-label': '上移 ' + entry.title },
                  on: { click: () => report(moveFavorite(entry.route, -1), '收藏顺序已保存') },
                }),
                Button({
                  text: '下移',
                  disabled: p.favoriteSort !== 'manual' || index === entries.length - 1,
                  attrs: { 'aria-label': '下移 ' + entry.title },
                  on: { click: () => report(moveFavorite(entry.route, 1), '收藏顺序已保存') },
                }),
              ],
            }),
          ],
        }),
      ),
    );
    if (!entries.length)
      favorites.append(Box({ tag: 'p', text: '尚未收藏工具。可点击工具标题旁的星标添加。' }));
  }
  function sync() {
    const p = getPreferences(),
      start = controls.get('startPage'),
      entries = [...startupTargets()];
    if (!['home', 'last'].includes(p.startPage) && !entries.some((e) => e.route === p.startPage)) {
      const selected = preferenceTarget(p.startPage);
      if (selected) entries.push(selected);
    }
    start.replaceChildren(
      Option('首页', 'home'),
      Option('上次使用的工具', 'last'),
      ...entries.map((e) => Option(e.title, e.route)),
    );
    for (const [key, control] of controls) {
      if (control.getAttribute('role') === 'switch')
        control.setAttribute('aria-checked', String(p[key]));
      else control.value = String(p[key]);
    }
    controls.get('recentLimit').disabled = !p.recordRecent;
    start.querySelector('option[value=last]').disabled = !p.recordRecent;
    volume.textContent = p.masterVolume + '%';
    controls.get('masterVolume').setAttribute('aria-valuetext', p.masterVolume + '%');
    drawFavorites();
  }
  document.addEventListener('arg:preferenceschange', sync);
  document.addEventListener('arg:collectionschange', drawFavorites);
  document.addEventListener('arg:panelchange', ({ detail }) => {
    if (detail.name === 'settings') void refreshStorage();
    else storageRevision++;
  });
  controls
    .get('masterVolume')
    .closest('[data-ui=field]')
    .querySelector('[data-ui=field-label]')
    .append(volume);
  for (const card of [display, habits, sound])
    card.append(
      Box({
        className: 'settings-fields',
        children: [...card.children].filter((n) => n.dataset.ui !== 'card-title'),
      }),
    );
  sync();
  panel.append(
    Box({ className: 'settings-columns', children: [display, habits, sound, data] }),
    status,
  );
  return panel;
}
