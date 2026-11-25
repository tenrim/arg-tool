import {
  Box,
  Button,
  Card,
  ToolHeader,
  ToolPanel,
  Toolbar,
  Input,
  FilePicker,
  ImageInputPreview,
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
import { STEGOVERITAS_TIPS, STEGOVERITAS_REUSED } from './stegoveritas-catalog.js';
import { IMAGE_SURVEY, surveyPlan, surveyOptions } from './image-plan.js';
import { zstegDisplayText } from './zsteg-output.js';
import { localImagePlan } from './local-image-plan.js';

function bytes(value) {
  if (typeof Uint8Array.fromBase64 === 'function') return Uint8Array.fromBase64(value);
  const raw = atob(value);
  const data = new Uint8Array(raw.length);
  for (let i = 0; i < data.length; i++) data[i] = raw.charCodeAt(i);
  return data;
}
function encoded(buffer) {
  const data = new Uint8Array(buffer);
  let value = '';
  for (let i = 0; i < data.length; i += 16384)
    value += String.fromCharCode(...data.subarray(i, i + 16384));
  return btoa(value);
}
async function readForensicsJson(response) {
  const raw = await response.text();
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // Non-JSON proxy or static host error page; fall through to status message.
    }
  }
  if (response.status === 413) throw Error('上传内容超出服务器限制，请确认文件合计不超过 20 MB。');
  if (response.status === 404 || response.status === 405)
    throw Error('当前站点尚未启用服务器文件分析服务。');
  if ([502, 503, 504].includes(response.status))
    throw Error('服务器处理服务暂不可用或已超时，请稍后重试。');
  if (!response.ok) throw Error(`处理服务返回异常状态（HTTP ${response.status}）。`);
  throw Error('服务器未返回有效的分析结果，当前环境可能尚未启用文件分析服务。');
}
export function mountForensics(host, { openTool, loadImage, receiveFileImage }) {
  const receivers = new Map();
  async function openStep(step, original, depth, current) {
    const visual = ['decomposer', 'color_remapping'].includes(step.engine);
    const active = await openTool(
      step.target || (visual ? 'native:image-planes' : 'native:forensics-' + step.engine),
      step.engine === 'stegoveritas' ? step.options.mode : undefined,
      current,
    );
    if (!active) return;
    if (step.engine === 'barcode') await loadImage(original, active);
    else if (step.engine === 'hideinfo') receiveFileImage(original);
    else if (step.engine === 'animation') {
      const picker = document.getElementById('video-file');
      const transfer = new DataTransfer();
      transfer.items.add(original);
      picker.files = transfer.files;
      picker.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (visual) {
      if ((await loadImage(original, active)) && active())
        document
          .getElementById(step.engine === 'decomposer' ? 'image-overview' : 'image-remap')
          ?.focus();
    } else receivers.get(step.engine)(original, surveyOptions(step, depth));
  }
  for (const task of FORENSICS_TASKS) receivers.set(task.engine, mount(host, task, openStep));
}
function mount(host, task, openStep) {
  const survey = task.engine === IMAGE_SURVEY;
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
  const run = Button({
    text: survey ? '上传并分析图片' : '上传并处理',
    variant: 'primary',
    id: task.id + '-run',
  });
  const stop = Button({
    text: '停止',
    disabled: true,
    on: {
      click: () => {
        if (survey && controller) {
          controller.abort();
          stop.disabled = true;
          updateStatus(status, '已停止分析，已返回的结果仍可查看。');
          return;
        }
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
  const preview = ImageInputPreview();
  function selectOriginal(value) {
    file = value;
    updateStatus(filename, file ? `${file.name}（${file.size} 字节）` : '尚未选择文件');
    preview.show(file);
  }
  const input = Input({
    type: 'file',
    attrs: {
      'aria-label': '选择待分析文件',
      ...(survey ? { accept: '.png,.jpg,.jpeg,.bmp,.gif,.webp,.tif,.tiff' } : {}),
    },
    on: {
      change: () => {
        invalidate();
        selectOriginal(input.files?.[0]);
      },
    },
  });
  const password = Input({
    type: 'password',
    attrs: { autocomplete: 'off', maxlength: 1024 },
    on: { input: invalidate },
  });
  const options = new Map();
  const fields = new Map();
  const form = FormGrid();
  for (const spec of FORENSICS_OPTIONS[task.engine] || []) {
    const control = spec.choices
      ? Select({ children: spec.choices.map(([v, l]) => Option(l, v)) })
      : spec.type === 'textarea'
        ? Textarea({ minRows: 3 })
        : Input({
            type: spec.type || 'text',
            value: String(spec.value ?? ''),
            attrs: { ...(spec.min != null ? { min: spec.min, max: spec.max } : {}) },
          });
    control.addEventListener('input', invalidate);
    if (task.engine === 'stegoveritas' && spec.key === 'mode')
      control.id = 'forensics-stegoveritas-mode';
    control.addEventListener('change', invalidate);
    options.set(spec.key, control);
    const field = Field({ label: spec.label, control });
    fields.set(spec.key, field);
    form.append(field);
  }
  const attachment = Input({ type: 'file', on: { change: invalidate } });
  const extraPreview = ImageInputPreview();
  const clearAttachment = Button({
    text: '清除附加文件',
    disabled: true,
    on: {
      click: () => {
        if (!attachment.value && !attachment.files?.length) return;
        attachment.value = '';
        attachment.dispatchEvent(new Event('change'));
      },
    },
  });
  attachment.addEventListener('change', () => {
    const extraFile = attachment.files?.[0] || null;
    clearAttachment.disabled = !extraFile;
    extraPreview.show(extraFile);
  });
  const attachmentField = Field({
    label:
      task.engine === 'steghide'
        ? '密码列表（可选，UTF-8 文本，每行一个）'
        : '载荷文件（可选，优先于嵌入文字）',
    control: Toolbar({
      children: [FilePicker({ input: attachment, triggerLabel: '选择附加文件' }), clearAttachment],
    }),
  });
  attachmentField.append(extraPreview.node);
  if (['stegoveritas', 'steghide'].includes(task.engine)) form.append(attachmentField);
  const modeTip = Status();
  function updateMode() {
    const mode = options.get('mode')?.value;
    for (const spec of FORENSICS_OPTIONS[task.engine] || [])
      fields.get(spec.key).hidden = Boolean(spec.modes && !spec.modes.includes(mode));
    if (task.engine === 'stegoveritas') {
      attachmentField.hidden = mode !== 'hide';
      updateStatus(modeTip, STEGOVERITAS_TIPS[mode]);
    }
  }
  options.get('mode')?.addEventListener('change', updateMode);
  updateMode();
  if (task.password)
    form.append(
      Field({
        label: task.engine === 'outguess' ? '密钥（可留空）' : '密码（可留空）',
        control: password,
      }),
    );
  controls.append(
    FilePicker({ input, triggerLabel: survey ? '选择图片' : '选择文件', showFilename: false }),
    filename,
    preview.node,
    form,
    modeTip,
    Status({
      text: survey
        ? '图片最多 20 MB。条码、动图帧与化物为图在本地检查，同时上传至本站进行隔离分析。服务端最长 4 分钟。'
        : '服务器处理：点击后上传到本站，不发送到第三方网站；临时文件随任务结束删除。',
    }),
    Toolbar({ children: [run, stop] }),
  );
  if (task.engine === 'stegoveritas')
    controls.append(
      Status({ text: '已有能力入口（不会自动转交当前文件）：' }),
      Toolbar({
        children: STEGOVERITAS_REUSED.map(([text, href]) => Link({ text, attrs: { href } })),
      }),
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
    const extra =
      !attachmentField.hidden && ['stegoveritas', 'steghide'].includes(task.engine)
        ? attachment.files?.[0]
        : null;
    run.disabled = true;
    stop.disabled = false;
    updateStatus(status, '正在读取文件…');
    try {
      if (extra && (!extra.size || extra.size + original.size > SERVER_FILE_LIMIT_BYTES))
        throw Error('本次上传的原文件与附加文件合计须为 1 字节至 20 MB。');
      const buffer = await original.arrayBuffer();
      if (signal.aborted) return;
      const depth = options.get('depth')?.value;
      const plan = survey
        ? surveyPlan(new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 32)), depth)
        : null;
      const data = encoded(buffer);
      const attached = extra
        ? { filename: extra.name, data: encoded(await extra.arrayBuffer()) }
        : null;
      if (rev !== revision) return;
      updateStatus(status, survey ? '正在上传并识别图片…' : '正在上传并运行 ' + task.engine + '…');
      const request = () =>
        fetch('/api/forensics/run', {
          method: 'POST',
          signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            engine: task.engine,
            filename: original.name,
            data,
            password: password.value,
            options: Object.fromEntries(
              [...options]
                .filter(([key]) => !fields.get(key).hidden)
                .map(([key, control]) => [key, control.value]),
            ),
            ...(attached ? { attachment: attached } : {}),
          }),
        });
      if (survey) {
        const { showImageSurvey } = await import('./image-results.js');
        if (rev !== revision || signal.aborted) return;
        await showImageSurvey(
          async () => {
            const response = await request();
            if (!response.ok) {
              const value = await readForensicsJson(response);
              throw Error(value.error || '处理服务返回错误');
            }
            if (!response.headers.get('Content-Type')?.includes('application/x-ndjson'))
              throw Error('服务器尚未提供图片综合分析服务。');
            return response;
          },
          {
            result,
            link,
            bytes,
            recording,
            signal,
            plan,
            localSteps: localImagePlan(plan.format, new Uint8Array(buffer)),
            original,
            buffer,
            openStep: (step) => openStep(step, original, depth, () => rev === revision),
            current: () => rev === revision,
            status: (message, type) => updateStatus(status, message, type),
          },
        );
        return;
      }
      const response = await request();
      const value = await readForensicsJson(response);
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
      if (
        task.engine === 'zsteg' &&
        options.get('mode').value !== 'extract' &&
        Array.isArray(value.result.output)
      ) {
        const { output, ...details } = value.result;
        setTextareaValue(
          textarea,
          [
            zstegDisplayText(output),
            JSON.stringify(details, null, 2),
            ...rawLogs.map(
              (f) => `\n${f.name}\n${zstegDisplayText(new TextDecoder().decode(f.bytes))}`,
            ),
          ].join('\n'),
        );
      } else setTextareaValue(textarea, text);
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
      if (rev === revision && !signal.aborted) updateStatus(status, error.message, 'error');
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
  return (original, settings) => {
    invalidate();
    input.value = '';
    attachment.value = '';
    attachment.dispatchEvent(new Event('change'));
    password.value = '';
    selectOriginal(original);
    for (const [key, value] of Object.entries(settings)) options.get(key).value = String(value);
    updateMode();
  };
}
