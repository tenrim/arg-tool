import {
  element,
  Box,
  Disclosure,
  Field,
  Select,
  Option,
  Input,
  ImageInputPreview,
  Textarea,
  Button,
  Toolbar,
  FormGrid,
  Status,
  onDisconnect,
} from '../ui/index.js';
import { mountAnimation } from '../animation/index.js';
import { resultRecording } from '../result-recording.js';
import { VIDEO_MODES, AUDIO_FORMATS } from './commands.js';
import { mediaJob } from './runtime.js';
import { EDIT_MODES, MULTI_MODES } from './editing.js';
import { editingFields, editingVisibility, EDIT_HELP } from './editing-ui.js';

export function mountVideo(ui) {
  const $ = (id) => document.getElementById(id);
  const controls = {},
    fields = {};
  const select = (id, label, choices) =>
    field(
      id,
      label,
      Select({ id: 'video-' + id, children: choices.map(([value, text]) => Option(text, value)) }),
    );
  const number = (id, label, value, attrs = {}) =>
    field(id, label, Input({ id: 'video-' + id, type: 'number', value, attrs }));
  function field(id, label, control) {
    controls[id] = control;
    fields[id] = Field({ label, control });
    return fields[id];
  }
  const file = Input({
    id: 'video-file',
    type: 'file',
    attrs: {
      multiple: true,
      accept: 'video/*,audio/*,image/gif,image/png,image/apng,.mkv,.mka,.srt,.ass,.vtt',
    },
  });
  const parameters = FormGrid({
    children: [
      select('mode', '操作', VIDEO_MODES),
      ...editingFields({ select, number, field }),
      select('range', '处理范围', [
        ['full', '完整媒体'],
        ['clip', '指定片段'],
      ]),
      number('start', '起点 / 秒', 0, { min: 0, step: 0.1 }),
      number('duration', '片段长度 / 秒', 5, { min: 0.001, step: 0.1 }),
      select('audio-format', '音频输出格式', AUDIO_FORMATS),
      select('track', '提取音轨', [
        ['1', '第一条音轨'],
        ['all', '全部音轨（分别导出）'],
        ['index', '指定音轨序号'],
      ]),
      number('track-index', '音轨序号（从 1 开始）', 2, { min: 1, step: 1 }),
      select('format', '输出格式', [
        ['mp4', 'MP4（H.264 / AAC）'],
        ['webm', 'WebM（VP8 / Vorbis）'],
        ['mkv', 'MKV（保留原编码）'],
        ['mp3', 'MP3 音频'],
        ['wav', 'WAV 音频'],
        ['flac', 'FLAC 音频'],
      ]),
      number('fps', '采样帧率 / 每秒', 1, { min: 0.01, max: 60, step: 0.1 }),
      number('max-frames', '帧数上限（超过则提示，不截断）', 300, { min: 1, max: 1000 }),
      number('width', '输出宽度 / 像素（0 保持原尺寸）', 0, { min: 0, max: 7680, step: 2 }),
      number('speed', '速度倍数', 2, { min: 0.25, max: 4, step: 0.25 }),
      select('rotation', '旋转／翻转', [
        ['right', '顺时针 90°'],
        ['left', '逆时针 90°'],
        ['half', '旋转 180°'],
        ['horizontal', '水平翻转'],
        ['vertical', '垂直翻转'],
      ]),
      field(
        'keep-audio',
        '同时倒放音轨',
        Input({ id: 'video-keep-audio', type: 'checkbox', checked: true }),
      ),
      number('subtitle-track', '文字字幕轨（从 1 开始）', 1, { min: 1, step: 1 }),
    ],
  });
  fields.format.id = 'video-format-field';
  const custom = Input({ id: 'video-use-command', type: 'checkbox' }),
    command = Textarea({
      id: 'video-native-args',
      value: '["-i","input","-c","copy","output.mkv"]',
      rows: 4,
    });
  const advanced = Disclosure({
    id: 'video-advanced',
    preference: 'advancedParameters',
    children: [
      element('summary', { text: 'FFmpeg 原生命令（进阶）' }),
      Field({ label: '使用自定义命令代替表单操作', control: custom }),
      Field({ label: 'JSON 参数数组：首个文件为 input，其他文件保留文件名', control: command }),
    ],
  });
  const inputPreview = ImageInputPreview();
  const help = Box({ id: 'video-hint' }),
    fileOrder = Box({ id: 'video-file-order' }),
    status = Status({ id: 'video-status' }),
    results = Box({ id: 'video-results', className: 'hunt-video-results' }),
    summary = element('pre', { id: 'video-summary' }),
    log = element('pre', { id: 'video-log', className: 'hunt-log' });
  const run = Button({ id: 'video-run', text: '执行处理', variant: 'primary' }),
    stop = Button({ id: 'video-stop', text: '停止', disabled: true });
  const panel = ui.section('video', '视频处理', '10', '', [
    [
      'ffmpeg.wasm',
      'https://github.com/ffmpegwasm/ffmpeg.wasm',
      '浏览器本地处理 · 封装 MIT；固定 FFmpeg 核心 GPL-2.0-or-later',
    ],
  ]);
  // section is the existing shell factory; render through the shared component entry.
  ui.insertVideo(panel);
  const root = $('panel-video'),
    workspace = Box({
      className: 'hunt-workspace',
      children: [
        Box({
          className: 'hunt-inputs',
          children: [
            Field({ label: '选择视频 / 动画 / 音频', control: file }),
            inputPreview.node,
            fileOrder,
            parameters,
            advanced,
            help,
            Toolbar({ children: [run, stop] }),
            status,
          ],
        }),
        Box({
          className: 'hunt-results',
          children: [
            element('h2', { text: '处理结果' }),
            summary,
            results,
            Disclosure({ children: [element('summary', { text: '处理日志' }), log] }),
          ],
        }),
      ],
    });
  root.querySelector('.tool-provenance').before(workspace);
  mountAnimation(root, file, controls.mode);
  let generation = 0,
    job = null,
    urls = [];
  let orderedFiles = [];
  const recording = resultRecording({
    id: 'video-result',
    anchor: results,
    source: 'file',
    onLeave: () => cancel(),
  });
  function clear() {
    recording.clear();
    for (const url of urls) URL.revokeObjectURL(url);
    urls = [];
    results.replaceChildren();
    summary.textContent = '';
    log.textContent = '';
  }
  function cancel() {
    generation++;
    job?.cancel();
    job = null;
    run.disabled = false;
    stop.disabled = true;
    clear();
  }
  function visibility() {
    const mode = controls.mode.value,
      limited = controls.range.value === 'clip',
      isCustom = mode === 'native' && custom.checked;
    const editing = EDIT_MODES.some(([id]) => id === mode);
    const visible = {
      ...editingVisibility(mode, controls),
      mode: true,
      range:
        !editing && !['frame', 'animation', 'inspect', 'capabilities'].includes(mode) && !isCustom,
      start:
        mode === 'frame' ||
        (limited &&
          !editing &&
          !isCustom &&
          !['animation', 'inspect', 'capabilities'].includes(mode)),
      duration:
        limited &&
        !editing &&
        !isCustom &&
        !['frame', 'animation', 'inspect', 'capabilities'].includes(mode),
      'audio-format': mode === 'audio',
      track: mode === 'audio',
      'track-index': mode === 'audio' && controls.track.value === 'index',
      format: mode === 'native' && !isCustom,
      fps: ['frames', 'gif'].includes(mode),
      'max-frames': mode === 'frames',
      width: ['frames', 'gif', 'resize'].includes(mode),
      speed: mode === 'speed',
      rotation: mode === 'rotate',
      'keep-audio': mode === 'reverse',
      'subtitle-track': mode === 'subtitle',
    };
    // Shared native-workspace navigation owns operation selector visibility.
    for (const [id, node] of Object.entries(fields)) if (id !== 'mode') node.hidden = !visible[id];
    advanced.hidden = mode !== 'native';
    const multiple = MULTI_MODES.includes(mode);
    if (fileOrder.hidden === multiple) {
      fileOrder.hidden = !multiple;
      renderOrder();
    }
    inputPreview.show(fileOrder.hidden ? file.files[0] : null);
    help.textContent =
      mode === 'reverse'
        ? '倒放需要缓存所选范围的解码帧，长视频建议先选片段；默认同时倒放声音。'
        : mode === 'audio'
          ? '默认提取完整音轨。可选择单条或全部音轨；原音轨格式保留原编码。轨道详情可在“媒体信息与轨道”查看。'
          : mode === 'frames'
            ? '按设定帧率采样，不默认缩小画面；超出帧数上限会提示，不会只返回前几帧。'
            : mode === 'subtitle'
              ? '提取内嵌文字字幕，不识别烧录在画面中的字幕。'
              : '媒体在本机浏览器处理，不上传。输入合计最多 256 MB；完整输出最多 256 MB／1000 个文件。';
    if (mode === 'animation') help.textContent = '';
    if (EDIT_HELP[mode]) help.textContent = EDIT_HELP[mode];
  }
  const changed = () => {
    cancel();
    status.textContent = '';
    visibility();
  };
  for (const control of [...Object.values(controls), custom, command])
    control.addEventListener('input', changed);
  function renderOrder() {
    if (fileOrder.hidden) {
      fileOrder.replaceChildren();
      return;
    }
    fileOrder.replaceChildren(
      ...orderedFiles.map((f, i) => {
        const move = (delta) => {
          [orderedFiles[i], orderedFiles[i + delta]] = [orderedFiles[i + delta], orderedFiles[i]];
          changed();
          renderOrder();
        };
        const up = Button({
          text: '上移',
          disabled: i === 0,
          attrs: { 'aria-label': `上移 ${f.name}` },
        });
        const down = Button({
          text: '下移',
          disabled: i === orderedFiles.length - 1,
          attrs: { 'aria-label': `下移 ${f.name}` },
        });
        up.addEventListener('click', () => move(-1));
        down.addEventListener('click', () => move(1));
        const preview = ImageInputPreview();
        preview.show(f);
        return Box({
          children: [
            Toolbar({ children: [element('span', { text: `${i + 1}. ${f.name}` }), up, down] }),
            preview.node,
          ],
        });
      }),
    );
  }
  file.addEventListener('change', () => {
    orderedFiles = Array.from(file.files);
    changed();
    renderOrder();
  });
  stop.addEventListener('click', () => {
    cancel();
    status.textContent = '已停止。';
  });
  const taskChanged = ({ detail }) => {
    if (detail?.panel === 'video') {
      changed();
    }
  };
  document.addEventListener('arg:nativetaskchange', taskChanged);
  function publishFile(file) {
    const url = URL.createObjectURL(file);
    urls.push(url);
    const link = element('a', {
        text: '下载 ' + file.name,
        attrs: { href: url, download: file.name },
      }),
      box = Box({ children: [link] });
    if (file.type.startsWith('image/'))
      box.prepend(element('img', { attrs: { src: url, alt: file.name, loading: 'lazy' } }));
    else if (/^(audio|video)\//.test(file.type))
      box.prepend(
        element(file.type.startsWith('audio/') ? 'audio' : 'video', {
          attrs: { src: url, controls: true, preload: 'metadata' },
        }),
      );
    results.append(box);
  }
  run.addEventListener('click', async () => {
    cancel();
    const revision = generation,
      current = () => revision === generation;
    const options = Object.fromEntries(
      Object.entries(controls).map(([k, v]) => [k, v.type === 'checkbox' ? v.checked : v.value]),
    );
    Object.assign(options, {
      track: options.track === 'index' ? options['track-index'] : options.track,
      audioFormat: options['audio-format'],
      maxFrames: options['max-frames'],
      keepAudio: options['keep-audio'],
      subtitleTrack: options['subtitle-track'],
      custom: custom.checked,
      command: command.value,
    });
    const files = MULTI_MODES.includes(options.mode) ? [...orderedFiles] : Array.from(file.files),
      active = (job = mediaJob());
    run.disabled = true;
    stop.disabled = false;
    try {
      const result = await active.run(files, options, (message) => {
        if (current()) status.textContent = message;
      });
      if (!current()) return;
      summary.textContent = result.summary || '';
      log.textContent = result.logs.slice(-20000);
      if (result.logs.length > 20000)
        log.textContent = '日志预览末尾 20000 字符；下载保留全文。\n' + log.textContent;
      const saved = [...result.files];
      if (result.report) {
        const url = URL.createObjectURL(files[0]);
        urls.push(url);
        const preview = element(files[0].type.startsWith('audio/') ? 'audio' : 'video', {
          attrs: { src: url, controls: true, preload: 'metadata' },
        });
        const previewStatus = Status({
          text: '可点击下方时间区间定位；预览取决于浏览器对原格式的支持。',
        });
        preview.addEventListener('error', () => {
          previewStatus.textContent =
            '浏览器无法预览此原始格式；检测已完成，可下载报告查看全部时间区间。';
        });
        results.append(preview, previewStatus);
        if (!result.report.events.length)
          results.append(element('p', { text: '未发现达到当前阈值的异常片段。' }));
        for (const event of result.report.events) {
          const jump = Button({
            text: `${event.label} · ${event.start.toFixed(3)}–${event.end.toFixed(3)} 秒 · 定位预览`,
          });
          jump.addEventListener('click', () => {
            preview.currentTime = event.start;
          });
          results.append(Toolbar({ children: [jump] }));
        }
        results.append(
          element('p', { text: '预览取决于浏览器对原格式的支持；下载报告保留全部时间区间。' }),
        );
      }
      for (const file of result.files) publishFile(file);
      if (result.logs) {
        const f = new File([result.logs], 'ffmpeg-log.txt', { type: 'text/plain' });
        saved.push(f);
        publishFile(f);
      }
      if (result.commands) {
        const f = new File([JSON.stringify(result.commands, null, 2)], 'ffmpeg-commands.json', {
          type: 'application/json',
        });
        saved.push(f);
        publishFile(f);
      }
      recording.publish({ files: saved });
      status.textContent = `处理完成 · ${result.files.length} 个文件`;
    } catch (error) {
      if (current()) {
        clear();
        log.textContent = String(error.logs || '').slice(-20000);
        if (error.logs)
          publishFile(new File([error.logs], 'ffmpeg-error-log.txt', { type: 'text/plain' }));
        if (error.name !== 'AbortError') status.textContent = '处理失败：' + error.message;
      }
    } finally {
      if (current()) {
        job = null;
        run.disabled = false;
        stop.disabled = true;
      }
    }
  });
  onDisconnect(root, () => {
    cancel();
    document.removeEventListener('arg:nativetaskchange', taskChanged);
  });
  visibility();
}
