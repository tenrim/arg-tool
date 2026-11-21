import {
  Badge,
  Box,
  Button,
  Card,
  DataList,
  Disclosure,
  EmptyState,
  Result,
  Toolbar,
  element,
} from '../ui/index.js';
import { zstegDisplayText } from './zsteg-output.js';

function pictureLabel(name) {
  const plane = /^(Red|Green|Blue|Alpha|Grayscale|superimposed)_bit_(\d)\.png$/.exec(name);
  if (plane) {
    const channels = {
      Red: '红通道',
      Green: '绿通道',
      Blue: '蓝通道',
      Alpha: '透明通道',
      Grayscale: '灰度',
      superimposed: 'RGB 合成',
    };
    return channels[plane[1]] + ' · 位 ' + plane[2];
  }
  const colour = /^color_remapping_(\d+)\.png$/.exec(name);
  return colour ? '颜色重映射 ' + (Number(colour[1]) + 1) : name;
}

function readable(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(readable).filter(Boolean).join('\n');
  if (typeof value === 'object')
    return Object.entries(value)
      .map(([key, item]) => key + '　' + readable(item))
      .join('\n');
  return String(value);
}

function preview(text) {
  const limit = 12000;
  return text.length > limit ? text.slice(0, limit) + '\n… 其余内容见完整报告' : text;
}

export function imageResultCard({
  engine,
  label,
  state,
  report,
  items,
  raw,
  link,
  openTool,
  onError,
}) {
  const card = Card({ title: label, attrs: { 'aria-label': label } });
  const title = card.firstElementChild;
  const open = Button({
    text: '进入具体功能',
    attrs: { 'aria-label': '进入具体功能：' + label },
    on: {
      click: async () => {
        open.disabled = true;
        try {
          await openTool();
        } catch (error) {
          onError(error);
        } finally {
          open.disabled = false;
        }
      },
    },
  });
  card.append(
    Toolbar({ className: 'image-survey-heading', children: [title, Badge({ text: state }), open] }),
  );
  const gallery = Box({ className: 'image-survey-gallery' });
  const downloads = [];
  const diagnostics = [
    link(new Blob([raw], { type: 'application/json' }), 'report.json', '下载完整报告'),
  ];
  for (const item of items) {
    const png = /\.png$/i.test(item.name);
    const name = png ? pictureLabel(item.name) : item.name;
    const a = link(
      new Blob([item.bytes], { type: png ? 'image/png' : 'application/octet-stream' }),
      item.name,
      name,
    );
    if (png)
      gallery.append(
        Box({
          tag: 'figure',
          children: [
            element('img', {
              attrs: { src: a.href, alt: name, loading: 'lazy', decoding: 'async' },
            }),
            Box({ tag: 'figcaption', children: [a] }),
          ],
        }),
      );
    else if (/^(logs\/|report\.json$|results\.json$)/.test(item.name)) diagnostics.push(a);
    else downloads.push(a);
  }
  const output = readable(report.output);
  const text = [report.error, engine === 'zsteg' ? zstegDisplayText(output) : output, report.note]
    .map(readable)
    .filter(Boolean)
    .join('\n');
  if (text)
    card.append(Result({ tag: 'pre', className: 'image-survey-text', text: preview(text) }));
  // Some adapters return named fields (e.g. byte counts and stream offsets) directly.
  const internal = [
    'status',
    'output',
    'error',
    'note',
    'images',
    'png_images',
    'download',
    '引擎',
    '操作',
  ];
  const fields = Object.entries(report).filter(([key]) => !internal.includes(key));
  if (fields.length)
    card.append(DataList({ items: fields.map(([key, value]) => [key, preview(readable(value))]) }));
  if (gallery.childElementCount) card.append(gallery);
  if (downloads.length) card.append(Toolbar({ children: downloads }));
  if (!text && !fields.length && !gallery.childElementCount && !downloads.length)
    card.append(EmptyState({ text: '本项没有返回文字或提取文件。' }));
  card.append(
    Disclosure({
      children: [
        Box({ tag: 'summary', text: '原始报告与日志' }),
        Toolbar({ children: diagnostics }),
      ],
    }),
  );
  return card;
}
