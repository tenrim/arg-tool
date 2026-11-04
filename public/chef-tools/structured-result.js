import {
  Box,
  Card,
  Button,
  Toolbar,
  DataList,
  Table,
  Disclosure,
  Textarea,
  EmptyState,
  Link,
  element,
  confirmAction,
} from '../ui/index.js';
import { operationName } from '../cyberchef-i18n.js';

const describe = (value) =>
  typeof value === 'string' ? value : (JSON.stringify(value) ?? String(value));
const number = (value) => (Number.isFinite(value) ? String(Number(value.toFixed(4))) : '未提供');
function rawData(raw) {
  const text = JSON.stringify(raw, null, 2);
  const root = Disclosure({
    children: [
      element('summary', { text: '查看原始 JSON 数据' }),
      ...(text.length > 200000
        ? [element('p', { text: '这里只预览前 20 万字符，下载保留完整数据。' })]
        : []),
      Textarea({
        value: text.slice(0, 200000),
        autoSize: true,
        minRows: 3,
        maxRows: 12,
        attrs: { readonly: true, 'aria-label': '原始 JSON 数据' },
      }),
    ],
  });
  root.append(
    Button({
      text: '下载完整 JSON',
      on: {
        click: () => {
          if (!root.isConnected) return;
          const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
          Link({ attrs: { href: url, download: 'cyberchef-result.json' } }).click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      },
    }),
  );
  return root;
}
function scrollTable(options) {
  const root = Box({ children: Table(options) });
  root.style.overflowX = 'auto';
  return root;
}
function paged(root, entries, render, size = 10) {
  let page = 0;
  const body = Box(),
    status = element('span', { attrs: { role: 'status' } });
  const previous = Button({
    text: '上一页',
    on: {
      click: () => {
        page--;
        show();
      },
    },
  });
  const next = Button({
    text: '下一页',
    on: {
      click: () => {
        page++;
        show();
      },
    },
  });
  function show() {
    const start = page * size;
    body.replaceChildren(
      ...entries.slice(start, start + size).map((value, i) => render(value, start + i)),
    );
    previous.disabled = page === 0;
    next.disabled = start + size >= entries.length;
    status.textContent = `第 ${start + 1}–${Math.min(start + size, entries.length)} 项，共 ${entries.length} 项`;
  }
  root.append(body);
  if (entries.length > size) root.append(Toolbar({ children: [previous, status, next] }));
  show();
}
function language(code) {
  try {
    return `${new Intl.DisplayNames(['zh-CN'], { type: 'language' }).of(code)}（${code}）`;
  } catch {
    return String(code);
  }
}
// GCHQ/CyberChef 11b86fec, src/core/operations/Magic.mjs:87–164 and
// src/core/lib/Magic.mjs:255–269. Preserve original order and all candidate fields.
export function magicResult(
  raw,
  { onRecipe, recipeLabel = '采用此候选配方', isCurrent = () => true } = {},
) {
  const root = Box({ attrs: { 'data-chef-result': 'magic' } });
  if (!raw.length)
    root.append(
      EmptyState({ text: '未找到可用候选。可以调整识别深度、加强分析或已知内容后重试。' }),
    );
  else {
    root.append(
      element('p', {
        text: `找到 ${raw.length} 个候选，按引擎原有顺序排列。识别依据是统计推测，不代表已确定解码方法。`,
      }),
    );
    paged(root, raw, (candidate, index) => {
      const steps = Array.isArray(candidate.recipe) ? candidate.recipe : [];
      const card = Card({
        children: [
          element('h3', {
            text: `候选 ${index + 1} · ${steps.map((s) => operationName(s.op)).join(' → ') || '原始输入（未转换）'}`,
          }),
          FieldPreview(candidate.data),
          Disclosure({
            children: [
              element('summary', { text: '查看判断依据' }),
              DataList({
                items: [
                  ['香农熵（0–8）', number(candidate.entropy)],
                  ['UTF-8 格式', candidate.isUTF8 ? '有效' : '无效'],
                  [
                    '文件类型',
                    candidate.fileType
                      ? `${candidate.fileType.name || ''} · ${candidate.fileType.mime || ''} · ${candidate.fileType.ext || ''}`
                      : '未识别',
                  ],
                  [
                    '可能适用的操作',
                    [
                      ...new Set((candidate.matchingOps || []).map((s) => operationName(s.op))),
                    ].join('、') || '未识别',
                  ],
                  ['可视化等展示操作', candidate.useful ? '检测到' : '未检测到'],
                  ...(candidate.matchesCrib === null
                    ? []
                    : [['已知内容匹配', candidate.matchesCrib ? '匹配' : '未匹配']]),
                ],
              }),
            ],
          }),
        ],
      });
      const actions = Toolbar();
      const copy = Button({
        text: '复制结果片段',
        on: {
          click: async () => {
            if (!isCurrent()) return;
            try {
              await navigator.clipboard.writeText(String(candidate.data ?? ''));
              if (isCurrent()) confirmAction(copy);
            } catch {
              if (isCurrent()) copy.textContent = '请选中上方片段手动复制';
            }
          },
        },
      });
      actions.append(copy);
      card.children[1].after(actions);
      if (steps.length)
        card.append(
          Disclosure({
            children: [
              element('summary', { text: '查看完整候选步骤与参数' }),
              DataList({
                items: steps.map((s, i) => [`${i + 1}. ${operationName(s.op)}`, describe(s.args)]),
              }),
            ],
          }),
        );
      if (candidate.languageScores?.length)
        card.append(
          Disclosure({
            children: [
              element('summary', { text: '语言统计匹配（全部结果）' }),
              scrollTable({
                columns: ['语言', '匹配分数', '统计概率'],
                rows: candidate.languageScores.map((s) => [
                  language(s.lang),
                  number(s.score),
                  number(s.probability),
                ]),
              }),
            ],
          }),
        );
      if (onRecipe)
        actions.append(
          Button({
            text: recipeLabel,
            on: {
              click: () => {
                if (isCurrent()) void onRecipe(structuredClone(steps), index);
              },
            },
          }),
        );
      return card;
    });
  }
  root.append(rawData(raw));
  return root;
}
function FieldPreview(value) {
  return Box({
    children: [
      element('p', { text: '结果片段（最多 100 字符；执行候选配方可取得完整结果）' }),
      Textarea({
        value: String(value ?? ''),
        autoSize: true,
        minRows: 2,
        maxRows: 6,
        attrs: { readonly: true, 'aria-label': '候选结果片段' },
      }),
    ],
  });
}
export function structuredResult(raw) {
  const root = Box({ attrs: { 'data-chef-result': 'structured' } });
  const entries = Array.isArray(raw) ? raw : Object.entries(raw || {});
  if (!entries.length) root.append(EmptyState({ text: '结果为空。' }));
  else
    paged(
      root,
      entries,
      (value, i) =>
        Array.isArray(raw)
          ? Card({
              children: [
                element('h3', { text: `第 ${i + 1} 项` }),
                value && typeof value === 'object'
                  ? DataList({ items: Object.entries(value).map(([k, v]) => [k, describe(v)]) })
                  : element('p', { text: describe(value) }),
              ],
            })
          : DataList({ items: [[value[0], describe(value[1])]] }),
      20,
    );
  root.append(rawData(raw));
  return root;
}
