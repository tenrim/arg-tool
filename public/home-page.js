import {
  Box,
  Button,
  Card,
  Disclosure,
  Icon,
  Link,
  Toolbar,
  onDisconnect,
  animatePresence,
} from './ui/index.js';
import { base64ToBytes, textFromBytes } from './engine.js';
import { loadRegistry, resolveCapability } from './capabilities/registry.js';
import { capabilityRoute } from './capabilities/routes.js';

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Project the live registry, keeping categories balanced and neighbouring
// batches disjoint. No second catalogue or persisted recommendation profile.
function recommendTools(registry, previous) {
  const buckets = shuffled(registry.categories)
    .filter((category) => category.id !== 'knowledge')
    .map((category) =>
      shuffled(
        registry.entries.filter(
          (entry) =>
            entry.category === category.id && entry.listed !== false && !previous.has(entry.id),
        ),
      ),
    );
  const selected = [];
  const groups = new Set();
  while (selected.length < 8 && buckets.some((bucket) => bucket.length)) {
    for (const bucket of buckets) {
      if (!bucket.length || selected.length === 8) continue;
      const index = Math.max(
        0,
        bucket.findIndex((entry) => !groups.has(entry.group)),
      );
      const [entry] = bucket.splice(index, 1);
      selected.push(entry);
      groups.add(entry.group);
    }
  }
  return selected;
}

function routeLink(text, route, navigate, options = {}) {
  return Link({
    ...options,
    text,
    attrs: { ...options.attrs, href: '#' + route },
    on: {
      click(event) {
        if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        navigate(route);
      },
    },
  });
}

export function createHomeIntroduction({ navigate, browse }) {
  let disposed = false;
  const intro = Box({ className: 'home-introduction' });
  const hero = Box({ tag: 'header', className: 'home-hero' });
  const copy = Box({
    className: 'home-hero-copy',
    children: [
      Box({ tag: 'p', className: 'home-eyebrow', text: 'ARG / PUZZLEHUNT' }),
      Box({ tag: 'h1', text: '迷雾工具箱' }),
      Box({ tag: 'p', className: 'home-subtitle', text: 'ARG 与解谜工具集' }),
      Box({
        tag: 'p',
        className: 'home-description',
        text: '文字编解码、图像与音视频分析、资料查询、纸笔解题。',
      }),
    ],
  });
  const help = Card({ id: 'home-help', title: '使用帮助', className: 'surface home-help' });
  const jumpTo = (node) => {
    const heading = node.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    node.scrollIntoView({ block: 'start' });
  };
  copy.append(
    Toolbar({
      className: 'home-actions',
      children: [
        Button({
          text: '浏览工具分类',
          variant: 'primary',
          on: { click: () => jumpTo(browse) },
        }),
        Button({ text: '第一次使用', on: { click: () => jumpTo(help) } }),
      ],
    }),
  );
  const example = Card({ className: 'surface home-example', title: '一个解码示例' });
  const sample = 'TUlTVA==';
  let sampleResult = '';
  const output = Box({
    tag: 'code',
    text: '运行后显示',
    attrs: { 'aria-live': 'polite', 'aria-label': '示例解码结果' },
  });
  const copyStatus = Box({
    tag: 'p',
    className: 'home-example-copy-status',
    attrs: { role: 'status' },
  });
  const copyResult = Button({
    text: '复制结果',
    disabled: true,
    on: {
      click: async () => {
        try {
          await navigator.clipboard.writeText(sampleResult);
          if (!disposed) copyStatus.textContent = '已复制示例结果。';
        } catch {
          if (!disposed) copyStatus.textContent = '复制失败，可以选中示例结果手动复制。';
        }
      },
    },
  });
  const runExample = Button({
    text: '运行示例',
    variant: 'primary',
    on: {
      click: () => {
        sampleResult = textFromBytes(base64ToBytes(sample));
        output.textContent = sampleResult;
        copyResult.disabled = false;
        copyStatus.textContent = '';
        animatePresence(output, { kind: 'feedback' });
      },
    },
  });
  example.append(
    Box({ tag: 'p', text: 'Base64 把字节表示为可打印字符。' }),
    Box({
      className: 'home-example-flow',
      children: [
        Box({
          children: [Box({ tag: 'span', text: '编码文本' }), Box({ tag: 'code', text: sample })],
        }),
        Box({
          className: 'home-example-method',
          children: [Icon('arrow'), Box({ tag: 'span', text: 'Base64 解码' })],
        }),
        Box({
          className: 'home-example-output',
          children: [Box({ tag: 'span', text: '文字结果' }), output],
        }),
      ],
    }),
    Toolbar({ className: 'home-example-actions', children: [runExample, copyResult] }),
    copyStatus,
  );
  const description = Box({ className: 'home-hero-description' });
  description.append(copy.querySelector('.home-description'), copy.querySelector('.home-actions'));
  hero.append(copy, description);
  const starter = Card({ title: '工具推荐', className: 'surface home-starter' });
  let recommendationRegistry;
  let previous = new Set();
  const changeBatch = Button({
    text: '换一批',
    disabled: true,
    attrs: { 'aria-controls': 'home-recommendations' },
    on: { click: () => showRecommendations() },
  });
  starter.append(
    Toolbar({
      className: 'home-recommendation-heading',
      children: [starter.querySelector('h2'), changeBatch],
    }),
  );
  const grid = Box({
    id: 'home-recommendations',
    className: 'home-shortcuts',
    attrs: { 'aria-live': 'polite', 'aria-label': '工具推荐' },
  });
  const status = Box({ tag: 'p', text: '正在载入工具入口…', attrs: { role: 'status' } });
  starter.append(status, grid);
  const retry = Button({ text: '重试载入', hidden: true, on: { click: () => fillShortcuts() } });
  starter.append(retry);
  function showRecommendations() {
    if (disposed || !recommendationRegistry) return;
    const entries = recommendTools(recommendationRegistry, previous);
    if (!entries.length) return;
    const cards = entries.map((item) => {
      const { entry, op, direction } = resolveCapability(recommendationRegistry, item.id);
      const group = recommendationRegistry.groups.find((group) => group.id === entry.group);
      return routeLink(undefined, capabilityRoute(entry, op, direction), navigate, {
        className: 'home-shortcut',
        attrs: { 'aria-label': entry.title, 'data-home-capability': entry.id },
        children: [
          Icon(group.icon),
          Box({
            className: 'home-shortcut-copy',
            children: [
              Box({ tag: 'strong', text: entry.title }),
              Box({ tag: 'span', text: entry.tip || group.title }),
            ],
          }),
          Icon('arrow'),
        ],
      });
    });
    grid.replaceChildren(...cards);
    previous = new Set(entries.map((entry) => entry.id));
    changeBatch.disabled = !recommendationRegistry.entries.some(
      (entry) =>
        entry.listed !== false && entry.category !== 'knowledge' && !previous.has(entry.id),
    );
  }
  async function fillShortcuts() {
    retry.hidden = true;
    status.hidden = false;
    status.textContent = '正在载入工具入口…';
    try {
      const registry = await loadRegistry();
      if (disposed) return;
      recommendationRegistry = registry;
      showRecommendations();
      const { entry, op, direction } = resolveCapability(registry, 'op:From%20Base64');
      if (!example.querySelector('a'))
        example.append(
          routeLink('打开 Base64 解码 →', capabilityRoute(entry, op, direction), navigate),
        );
      status.hidden = true;
    } catch {
      if (disposed) return;
      status.textContent = '工具入口未能载入，请重试。';
      retry.hidden = false;
    }
  }
  for (const [title, text] of [
    [
      '不知道该用哪个工具？',
      '在顶部搜索输入材料或用途，例如“图片藏了文字”“URL 解码”。知道材料类型时，也可以从工具分类进入。自动识别给出的是候选，需要结合线索判断。',
    ],
    [
      '打开工具后怎么操作？',
      '在工具页输入文字或选择文件，确认操作方向与参数，再执行。需要步骤和格式说明时，打开页头的“使用说明”；想了解原理时，打开“相关科普”。',
    ],
    [
      '如何保存结果和解谜记录？',
      '结果区可以复制、下载，支持的工具还可将结果加入笔记。右下角“笔记本”可随时记录。笔记保存在当前浏览器，重要内容请在完整笔记本中导出备份。',
    ],
    [
      '文件会被上传吗？',
      '多数工具在浏览器内处理；在线查询、服务器分析和外部网页会在对应工具中说明。选择这类功能前，请先查看页面上的联网提示。',
    ],
  ]) {
    help.append(
      Disclosure({ children: [Box({ tag: 'summary', text: title }), Box({ tag: 'p', text })] }),
    );
  }
  help.append(
    Toolbar({
      children: [
        routeLink('打开完整笔记本', 'notebook', navigate),
        routeLink('调整使用偏好', 'settings', navigate),
      ],
    }),
  );
  intro.append(hero, starter);
  fillShortcuts();
  onDisconnect(intro, () => {
    disposed = true;
  });
  return { intro, help, example };
}
