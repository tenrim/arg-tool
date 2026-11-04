import {
  Box,
  Button,
  Card,
  ToolPanel,
  ToolHeader,
  Toolbar,
  FormGrid,
  Field,
  Input,
  Select,
  Option,
  Textarea,
  FilePicker,
  Status,
  EmptyState,
  ConversionLayout,
  Link,
  element,
  updateStatus,
  onDisconnect,
} from '../ui/index.js';
import { resultRecording } from '../result-recording.js';
import { createJob } from './client.js';
export {
  Box,
  Button,
  Card,
  Toolbar,
  FormGrid,
  Field,
  Input,
  Select,
  Option,
  Textarea,
  element,
  updateStatus,
};
export function select(label, entries, value) {
  const control = Select({ children: entries.map(([v, t]) => Option(t, v)) });
  if (value !== undefined) control.value = String(value);
  return { control, field: Field({ label, control }) };
}
export function number(label, value, min, max, step = 'any') {
  const control = Input({
    type: 'number',
    value: String(value),
    attrs: { min, max, step, required: true },
  });
  return { control, field: Field({ label, control }) };
}
export function check(label, value = false) {
  const control = Input({ type: 'checkbox', attrs: { checked: value } });
  return { control, field: Field({ label, control }) };
}
export function implementation(ui, name) {
  ui.panel.dataset.funImplementation = name;
  if (!ui.panel.hidden)
    document.dispatchEvent(
      new CustomEvent('arg:tasksourceschange', {
        detail: {
          name: ui.panel.id.slice(6),
          capabilityId: 'native:' + ui.panel.id.slice(6),
          implementation: name,
        },
      }),
    );
}
export function save(blob, name) {
  const url = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
  Link({ attrs: { href: url, download: name } }).click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
export function canvas(image, label = '图片预览') {
  const node = element('canvas', {
    attrs: { width: image.width, height: image.height, 'aria-label': label },
  });
  node.style.maxWidth = '100%';
  node.style.height = 'auto';
  node.getContext('2d').putImageData(new ImageData(image.data, image.width, image.height), 0, 0);
  return node;
}
export async function png(image, type = 'image/png', quality = 1) {
  const c = new OffscreenCanvas(image.width, image.height);
  c.getContext('2d').putImageData(new ImageData(image.data, image.width, image.height), 0, 0);
  return c.convertToBlob({ type, quality });
}
export async function readImage(file, limit = 16_000_000) {
  if (!file) throw Error('请先选择图片。');
  if (file.size > 50 * 1024 * 1024) throw Error('图片文件最多 50 MB。');
  const bitmap = await createImageBitmap(file, {
    colorSpaceConversion: 'none',
    premultiplyAlpha: 'none',
  });
  try {
    if (bitmap.width * bitmap.height > limit)
      throw Error('图片超过本工具的像素上限，请先缩小图片。');
    const c = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0);
    return {
      width: bitmap.width,
      height: bitmap.height,
      data: ctx.getImageData(0, 0, bitmap.width, bitmap.height).data,
    };
  } finally {
    bitmap.close();
  }
}
export function fileInput(ui, label, accept = '', onChange = () => {}) {
  let file;
  const input = Input({ type: 'file', attrs: { accept, 'aria-label': label } });
  const info = Status({ text: '尚未选择文件' });
  function set(value) {
    if (!value) return;
    ui.invalidate();
    file = value;
    updateStatus(info, `${value.name} · ${value.size.toLocaleString()} 字节`);
    onChange(value);
  }
  input.onchange = () => set(input.files[0]);
  const box = Box({
    children: [FilePicker({ input, triggerLabel: label, showFilename: false }), info],
  });
  box.ondragover = (e) => e.preventDefault();
  box.ondrop = (e) => {
    e.preventDefault();
    set(e.dataTransfer.files[0]);
  };
  box.onpaste = (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.kind === 'file');
    if (item) {
      e.preventDefault();
      set(item.getAsFile());
    }
  };
  function restore(value) {
    file = value;
    input.value = '';
    updateStatus(
      info,
      value ? `${value.name} · ${value.size.toLocaleString()} 字节` : '尚未选择文件',
    );
  }
  return {
    box,
    input,
    set,
    restore,
    get file() {
      return file;
    },
  };
}
export function variantDrafts(selector, controls, uploads, sync) {
  const snapshot = () => ({
    values: controls.map((c) => (c.type === 'checkbox' ? c.checked : c.value)),
    files: uploads.map((u) => u.file),
  });
  const initial = snapshot(),
    drafts = new Map();
  let key = selector.value;
  selector.addEventListener('change', () => {
    drafts.set(key, snapshot());
    key = selector.value;
    const data = drafts.get(key) || initial;
    controls.forEach((c, i) => {
      if (c.type === 'checkbox') c.checked = data.values[i];
      else c.value = data.values[i];
    });
    uploads.forEach((u, i) => u.restore(data.files[i]));
    sync();
  });
}
export function workspace(host, meta) {
  const parameters = FormGrid(),
    input = Box(),
    output = Box();
  const run = Button({ id: meta.id + '-run', text: '开始处理', variant: 'primary' });
  const stop = Button({ id: meta.id + '-stop', text: '停止', disabled: true });
  const status = Status({ id: meta.id + '-status' });
  const layout = ConversionLayout({
    parameters,
    actions: [run, stop],
    status,
    input,
    result: output,
  });
  const panel = ToolPanel({
    id: 'panel-' + meta.id,
    className: 'panel',
    hidden: true,
    header: ToolHeader({ className: 'page-heading', title: meta.title }),
    body: layout.root,
  });
  host.append(panel);
  const job = createJob();
  let revision = 0,
    busy = false;
  const cleanup = new Set();
  const recording = resultRecording({
    id: meta.id + '-record',
    panel,
    anchor: layout.resultCard,
    onLeave: () => invalidate(),
  });
  function state(value) {
    busy = value;
    run.disabled = value;
    stop.disabled = !value;
    run.setAttribute('aria-busy', String(value));
  }
  function invalidate() {
    revision++;
    job.cancel();
    for (const fn of cleanup) fn();
    cleanup.clear();
    state(false);
    recording.clear();
    output.replaceChildren(EmptyState({ text: '运行后在这里查看结果' }));
    updateStatus(status, '');
  }
  async function execute(work, render) {
    invalidate();
    const rev = revision;
    state(true);
    updateStatus(status, '正在处理…');
    const live = () => rev === revision && !panel.hidden;
    const progress = (text) => {
      if (live()) updateStatus(status, String(text));
    };
    try {
      for (const control of panel.querySelectorAll('input[type=number]')) {
        if (!control.closest('[hidden]') && !control.validity.valid)
          throw Error('请检查数字参数的范围与步长。');
      }
      const value = await work(progress, live);
      if (!live()) return;
      output.replaceChildren();
      await render(value, live);
      if (live()) updateStatus(status, '处理完成', 'success');
    } catch (error) {
      if (live()) updateStatus(status, error.message, 'error');
    } finally {
      if (rev === revision) state(false);
    }
  }
  stop.onclick = () => {
    invalidate();
    updateStatus(status, '已停止。');
  };
  panel.addEventListener('input', (e) => {
    if (!e.target.closest('[data-preview-control]')) invalidate();
  });
  panel.addEventListener('change', (e) => {
    if (!e.target.closest('[data-preview-control]')) invalidate();
  });
  onDisconnect(panel, invalidate);
  invalidate();
  return {
    panel,
    parameters,
    input,
    output,
    run,
    stop,
    status,
    layout,
    job,
    execute,
    invalidate,
    recording,
    cleanup,
    get busy() {
      return busy;
    },
  };
}
