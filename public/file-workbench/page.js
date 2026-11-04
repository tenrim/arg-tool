import {
  Box,
  Button,
  Card,
  ToolHeader,
  ToolPanel,
  Toolbar,
  Input,
  FilePicker,
  Field,
  FormGrid,
  Select,
  Option,
  Status,
  updateStatus,
  onDisconnect,
  EmptyState,
  Disclosure,
  Link,
} from '../ui/index.js';
import { FILE_TASKS, BATCH_OPERATIONS } from './catalog.js';
import { validateFiles, ZIP_NAME_ENCODINGS } from './model.js';
import { fileJob } from './client.js';
import { resultRecording } from '../result-recording.js';

function download(bytes, name, type = 'application/octet-stream') {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  Link({ attrs: { href: url, download: name } }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function selectedFiles(input) {
  return [...input.files].map((file) => ({
    file,
    path: file.webkitRelativePath
      ? file.webkitRelativePath.split('/').slice(1).join('/')
      : file.name,
    size: file.size,
  }));
}
function picker(label, changed, folder = false) {
  const input = Input({
    type: 'file',
    attrs: { multiple: true, 'aria-label': label, ...(folder ? { webkitdirectory: '' } : {}) },
    on: { change: () => changed(selectedFiles(input)) },
  });
  return FilePicker({ input, triggerLabel: label, showFilename: false });
}
function workspace(host, meta) {
  const status = Status({ id: meta.id + '-status' });
  const controls = Card({ className: 'ui-conversion-controls' });
  const result = Box();
  const resultCard = Card({ title: '结果', children: [result] });
  const panel = ToolPanel({
    id: 'panel-' + meta.id,
    className: 'panel',
    hidden: true,
    header: ToolHeader({ className: 'page-heading', title: meta.title }),
    body: Box({ children: [controls, status, resultCard] }),
  });
  host.append(panel);
  const job = fileJob();
  let revision = 0,
    busy = false;
  const run = Button({
    id: meta.id + '-run',
    text: meta.id === 'file-versions' ? '比较版本' : '开始处理',
    variant: 'primary',
  });
  const stop = Button({
    text: '停止',
    disabled: true,
    on: {
      click: () => {
        invalidate(false);
        updateStatus(status, '已停止；已完成的批量结果仍可下载。');
      },
    },
  });
  const state = (value) => {
    busy = value;
    run.disabled = value;
    stop.disabled = !value;
    controls.setAttribute('aria-busy', String(value));
  };
  const recording = resultRecording({
    id: meta.id + '-record',
    panel,
    anchor: resultCard,
    onLeave: () => invalidate(false),
  });
  function invalidate(clear = true) {
    revision++;
    job.cancel();
    state(false);
    if (clear) {
      result.replaceChildren();
      recording.clear();
      updateStatus(status, '');
    }
  }
  async function execute(data, item) {
    const rev = ++revision;
    state(true);
    try {
      return await job
        .run(
          data,
          (text) => {
            if (rev === revision) updateStatus(status, text);
          },
          (value) => {
            if (rev === revision) item?.(value);
          },
        )
        .then((value) => (rev === revision ? value : undefined));
    } catch (error) {
      if (rev === revision) updateStatus(status, error.message, 'error');
    } finally {
      if (rev === revision) state(false);
    }
  }
  onDisconnect(panel, () => invalidate());
  return {
    panel,
    controls,
    result,
    status,
    run,
    stop,
    recording,
    invalidate,
    execute,
    get busy() {
      return busy;
    },
  };
}
export function mountFileWorkbench(host) {
  mountComparison(host);
  mountBatch(host);
}
function mountComparison(host) {
  const ui = workspace(host, FILE_TASKS[0]);
  const sides = ['旧版本', '新版本'].map((label, index) => {
    const item = { files: [] };
    const count = Status({ text: '尚未选择文件' });
    const mode = Select({
      id: 'file-versions-mode-' + index,
      children: [Option('直接比较所选文件', 'files'), Option('展开一个 ZIP 的全部文件', 'zip')],
    });
    const change = (files) => {
      ui.invalidate();
      item.files = files;
      updateStatus(
        count,
        files.length
          ? `${files.length} 个文件 · ${files
              .slice(0, 3)
              .map((entry) => entry.path)
              .join('、')}${files.length > 3 ? '…' : ''}`
          : '尚未选择文件',
      );
    };
    const encoding = Select({
      id: 'file-versions-encoding-' + index,
      children: ZIP_NAME_ENCODINGS.map(([id, title]) => Option(title, id)),
      on: { change: () => ui.invalidate() },
    });
    const encodingField = Field({ label: '无 Unicode 标记时的 ZIP 文件名编码', control: encoding });
    encodingField.hidden = true;
    mode.onchange = () => {
      encodingField.hidden = mode.value !== 'zip';
      ui.invalidate();
    };
    item.mode = mode;
    item.encoding = encoding;
    item.card = Card({
      title: label,
      children: [
        Toolbar({
          children: [
            picker('选择' + label + '文件或 ZIP', change),
            picker('选择' + label + '文件夹', change, true),
          ],
        }),
        count,
        Field({ label: '比较方式', control: mode }),
        encodingField,
      ],
    });
    return item;
  });
  ui.controls.append(
    FormGrid({ children: sides.map((s) => s.card) }),
    Toolbar({ children: [ui.run, ui.stop] }),
  );
  ui.result.append(EmptyState({ text: '选择两侧文件、文件夹或 ZIP 后比较。' }));
  ui.run.onclick = async () => {
    ui.invalidate();
    const rows = await ui.execute({
      action: 'compare',
      before: sides[0].files,
      after: sides[1].files,
      beforeZip: sides[0].mode.value === 'zip',
      afterZip: sides[1].mode.value === 'zip',
      beforeEncoding: sides[0].encoding.value,
      afterEncoding: sides[1].encoding.value,
    });
    if (!rows) return;
    const json = JSON.stringify({ format: 'mist-file-comparison-v1', rows }, null, 2);
    const filter = Select({
      attrs: { 'aria-label': '差异筛选' },
      children: ['全部', '修改', '新增', '删除', '疑似改名', '相同'].map((x) => Option(x, x)),
    });
    const list = Box();
    const draw = () =>
      list.replaceChildren(
        ...rows
          .filter((r) => filter.value === '全部' || r.kind === filter.value)
          .map((r) => {
            const details = Disclosure({
              children: [
                Box({
                  tag: 'summary',
                  text: `${r.kind} · ${r.before || r.after}${r.kind === '疑似改名' ? ' → ' + r.after : ''}`,
                }),
              ],
            });
            details.append(
              Box({
                tag: 'p',
                text: `${r.oldSize} → ${r.newSize} 字节${r.kind === '修改' ? `；相同偏移比较共 ${r.differences} 字节不同，首次偏移 ${r.firstOffset}` : ''}`,
              }),
            );
            for (const [label, value] of [
              ['旧版本', r.oldPreview],
              ['新版本', r.newPreview],
            ])
              if (value)
                details.append(
                  Box({
                    tag: 'p',
                    text: `${label} · ${value.format}${value.truncated ? '（仅预览片段）' : ''}`,
                  }),
                  Box({ tag: 'pre', attrs: { 'data-record-raw': '' }, text: value.text }),
                );
            if (r.sameContentCandidates?.length)
              details.append(
                Box({ tag: 'p', text: '相同内容候选：' + r.sameContentCandidates.join('、') }),
              );
            return details;
          }),
      );
    filter.onchange = draw;
    ui.result.replaceChildren(
      Toolbar({
        children: [
          filter,
          Button({
            text: '下载完整比较报告',
            on: { click: () => download(json, '文件版本比较.json', 'application/json') },
          }),
        ],
      }),
      list,
    );
    draw();
    ui.recording.publish({ text: json, name: '文件版本比较.json' });
    updateStatus(
      ui.status,
      `比较完成，共 ${rows.length} 项；改名仅表示内容完全相同的唯一候选。`,
      'success',
    );
  };
}
function mountBatch(host) {
  const ui = workspace(host, FILE_TASKS[1]);
  let files = [],
    rows = [];
  const operation = Select({
    id: 'file-batch-operation',
    children: BATCH_OPERATIONS.map(([v, t]) => Option(t, v)),
  });
  const maxEdge = Input({
    id: 'file-batch-max-edge',
    type: 'number',
    value: 4096,
    attrs: { min: 1, max: 8192 },
  });
  const quality = Input({
    id: 'file-batch-quality',
    type: 'number',
    value: 0.9,
    attrs: { min: 0.1, max: 1, step: 0.05 },
  });
  const imageOptions = FormGrid({
    hidden: true,
    children: [
      Field({ label: '最长边（不放大）', control: maxEdge }),
      Field({ label: 'JPEG / WebP 质量', control: quality }),
    ],
  });
  const list = Box();
  const retry = Button({
    text: '重试失败或未完成项',
    disabled: true,
    on: { click: () => run(true) },
  });
  const pack = Button({
    text: '打包下载成功结果',
    disabled: true,
    on: {
      click: async () => {
        const value = await ui.execute({ action: 'zip', files: rows.filter((r) => r.bytes) });
        if (value) {
          download(value, '批量处理结果.zip', 'application/zip');
          updateStatus(ui.status, '成功结果已打包下载。', 'success');
        }
        draw();
      },
    },
  });
  const draw = () => {
    list.replaceChildren(
      ...rows.map((r, i) =>
        Toolbar({
          children: [
            Box({
              text: `${files[i].path} · ${r.bytes ? '完成 · ' + r.bytes.length + ' 字节' : r.error || '等待处理'}`,
            }),
            ...(r.bytes
              ? [
                  Button({
                    text: '下载',
                    on: { click: () => download(r.bytes, r.name.split('/').pop()) },
                  }),
                ]
              : []),
          ],
        }),
      ),
    );
    retry.disabled = ui.busy || !rows.some((r) => !r.bytes);
    pack.disabled = ui.busy || !rows.some((r) => r.bytes);
  };
  const reset = () => {
    ui.invalidate();
    rows = files.map(() => ({}));
    ui.result.append(Toolbar({ children: [retry, pack] }), list);
    imageOptions.hidden = !operation.value.startsWith('image-');
    draw();
  };
  const choose = (values) => {
    try {
      validateFiles(values);
      files = values;
      reset();
    } catch (error) {
      files = [];
      reset();
      updateStatus(ui.status, error.message, 'error');
    }
  };
  ui.controls.append(
    Toolbar({ children: [picker('选择多个文件', choose), picker('选择文件夹', choose, true)] }),
    Field({ label: '批量操作', control: operation }),
    imageOptions,
    Toolbar({ children: [ui.run, ui.stop] }),
  );
  operation.onchange = maxEdge.oninput = quality.oninput = reset;
  ui.stop.addEventListener('click', draw);
  async function run(failedOnly = false) {
    if (!files.length) {
      updateStatus(ui.status, '请先选择文件。', 'error');
      return;
    }
    if (!failedOnly) reset();
    const selected = files
      .map((f, index) => ({ ...f, index }))
      .filter((f) => !failedOnly || !rows[f.index].bytes);
    const work = ui.execute(
      {
        action: 'batch',
        files: selected,
        operation: operation.value,
        options: { maxEdge: maxEdge.value, quality: quality.value },
        existingSize: rows.reduce((s, r) => s + (r.bytes?.length || 0), 0),
      },
      (item) => {
        rows[item.index] = item;
        draw();
      },
    );
    draw();
    const done = await work;
    draw();
    if (done) {
      const count = rows.filter((r) => r.bytes).length;
      updateStatus(
        ui.status,
        `处理结束：成功 ${count} / ${rows.length} 项。${count < rows.length ? '失败项可单独重试。' : ''}`,
        count === rows.length ? 'success' : 'error',
      );
    }
  }
  ui.run.onclick = () => run();
  reset();
}
