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
  Link,
  Textarea,
  setTextareaValue,
  element,
} from '../ui/index.js';
import { FORENSICS_TASKS, FORENSICS_OPTIONS, SERVER_FILE_LIMIT_BYTES } from './catalog.js';
import { resultRecording } from '../result-recording.js';

const bytes = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
function encoded(buffer) {
  const data = new Uint8Array(buffer);
  let value = '';
  for (let i = 0; i < data.length; i += 16384)
    value += String.fromCharCode(...data.subarray(i, i + 16384));
  return btoa(value);
}
export function mountForensics(host) {
  for (const task of FORENSICS_TASKS) mount(host, task);
}
function mount(host, task) {
  const status = Status();
  const filename = Status({ text: '尚未选择文件' });
  const result = Box();
  const resultCard = Card({ title: '结果', children: [result] });
  const controls = Card();
  const panel = ToolPanel({
    id: 'panel-' + task.id,
    className: 'panel',
    hidden: true,
    header: ToolHeader({ className: 'page-heading', title: task.title }),
    body: Box({ children: [controls, status, resultCard] }),
  });
  host.append(panel);
  let file = null,
    revision = 0,
    controller = null,
    urls = [],
    outputFiles = [];
  const run = Button({ text: '上传并处理', variant: 'primary', id: task.id + '-run' });
  const stop = Button({
    text: '停止',
    disabled: true,
    on: {
      click: () => {
        invalidate();
        updateStatus(status, '已停止');
      },
    },
  });
  const recording = resultRecording({
    id: task.id + '-record',
    panel,
    anchor: resultCard,
    onLeave: () => invalidate(),
  });
  function invalidate() {
    revision++;
    controller?.abort();
    controller = null;
    urls.forEach((url) => URL.revokeObjectURL(url));
    urls = [];
    outputFiles = [];
    result.replaceChildren(EmptyState({ text: '处理后显示完整诊断及可下载文件。' }));
    recording.clear();
    run.disabled = false;
    stop.disabled = true;
    updateStatus(status, '');
  }
  const input = Input({
    type: 'file',
    attrs: { 'aria-label': '选择待分析文件' },
    on: {
      change: () => {
        invalidate();
        file = input.files?.[0] || null;
        updateStatus(filename, file ? `${file.name}（${file.size} 字节）` : '尚未选择文件');
      },
    },
  });
  const password = Input({
    type: 'password',
    attrs: { autocomplete: 'off', maxlength: 1024 },
    on: { input: invalidate },
  });
  const options = new Map();
  const form = FormGrid();
  for (const spec of FORENSICS_OPTIONS[task.engine] || []) {
    const control = spec.choices
      ? Select({ children: spec.choices.map(([v, l]) => Option(l, v)) })
      : Input({
          type: spec.type || 'text',
          value: String(spec.value ?? ''),
          attrs: { ...(spec.min != null ? { min: spec.min, max: spec.max } : {}) },
        });
    control.addEventListener('input', invalidate);
    control.addEventListener('change', invalidate);
    options.set(spec.key, control);
    form.append(Field({ label: spec.label, control }));
  }
  if (task.password)
    form.append(
      Field({
        label: task.engine === 'outguess' ? '密钥（可留空）' : '密码（可留空）',
        control: password,
      }),
    );
  controls.append(
    FilePicker({ input, triggerLabel: '选择文件', showFilename: false }),
    filename,
    form,
    Status({
      text: '服务器处理：点击后上传到本站，不发送到 AperiSolve 官网；临时文件随任务结束删除。',
    }),
    Toolbar({ children: [run, stop] }),
  );
  function link(blob, name, label) {
    const url = URL.createObjectURL(blob);
    urls.push(url);
    return Link({ text: label || name, attrs: { href: url, download: name.split('/').pop() } });
  }
  run.onclick = async () => {
    invalidate();
    if (!file || !file.size || file.size > SERVER_FILE_LIMIT_BYTES)
      return updateStatus(status, '请选择 1 字节至 20 MB 的文件。', 'error');
    const rev = revision;
    controller = new AbortController();
    const signal = controller.signal;
    const original = file;
    run.disabled = true;
    stop.disabled = false;
    updateStatus(status, '正在读取文件…');
    try {
      const data = encoded(await original.arrayBuffer());
      if (rev !== revision) return;
      updateStatus(status, '正在上传并运行 ' + task.engine + '…');
      const response = await fetch('/api/forensics/run', {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine: task.engine,
          filename: original.name,
          data,
          password: password.value,
          options: Object.fromEntries([...options].map(([key, control]) => [key, control.value])),
        }),
      });
      const value = await response.json();
      if (rev !== revision) return;
      if (!response.ok || value.error) throw Error(value.error || '处理服务返回错误');
      if (!value.complete || !Array.isArray(value.files)) throw Error('结果不完整');
      outputFiles = value.files.map((f) => ({ name: f.name, bytes: bytes(f.data) }));
      result.replaceChildren();
      const report = JSON.stringify(value.result, null, 2);
      const rawLogs = outputFiles.filter((f) => /logs\/.*\.bin$/.test(f.name));
      const text = [
        report,
        ...rawLogs.map((f) => `\n${f.name}\n${new TextDecoder().decode(f.bytes)}`),
      ].join('\n');
      const textarea = Textarea({
        attrs: { readonly: true, 'aria-label': '完整诊断输出' },
        autoSize: true,
        minRows: 4,
        maxRows: 18,
      });
      setTextareaValue(textarea, text);
      result.append(
        textarea,
        link(
          new Blob([text], { type: 'text/plain;charset=utf-8' }),
          task.engine + '-report.txt',
          '下载完整报告',
        ),
      );
      const links = Box();
      for (const f of outputFiles) {
        const blob = new Blob([f.bytes], {
          type: /\.png$/i.test(f.name) ? 'image/png' : 'application/octet-stream',
        });
        const a = link(blob, f.name, `${f.name}（${f.bytes.length} 字节）`);
        links.append(Toolbar({ children: [a] }));
        if (/\.png$/i.test(f.name))
          links.append(
            element('img', {
              attrs: {
                src: a.href,
                alt: f.name,
                loading: 'lazy',
                style: 'max-width:100%;height:auto',
              },
            }),
          );
      }
      const all = Button({
        text: '打包下载全部结果',
        on: {
          click: async () => {
            const snapshot = outputFiles;
            const current = revision;
            try {
              const { zipSync } = await import('../vendor/round2/fflate.js');
              if (current !== revision) return;
              const zip = zipSync(Object.fromEntries(snapshot.map((f) => [f.name, f.bytes])), {
                level: 0,
              });
              link(new Blob([zip]), task.engine + '-results.zip').click();
            } catch (error) {
              if (current === revision) updateStatus(status, '打包失败：' + error.message, 'error');
            }
          },
        },
      });
      result.append(Toolbar({ children: [all] }), links);
      recording.publish(() => ({
        text,
        files: outputFiles.map(
          (f, i) => new File([f.bytes], `${i + 1}-${f.name.replaceAll('/', '_')}`),
        ),
      }));
      updateStatus(
        status,
        value.result.status === 'ok'
          ? '处理完成，完整输出与文件已保留。'
          : '本次未成功提取或检查发现错误，请查看诊断。',
        value.result.status === 'ok' ? 'success' : 'error',
      );
    } catch (error) {
      if (rev === revision) updateStatus(status, error.message, 'error');
    } finally {
      if (rev === revision) {
        run.disabled = false;
        stop.disabled = true;
        controller = null;
      }
    }
  };
  onDisconnect(panel, invalidate);
  invalidate();
}
