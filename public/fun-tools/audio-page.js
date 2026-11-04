import {
  workspace,
  select,
  number,
  check,
  fileInput,
  readImage,
  save,
  canvas,
  Box,
  Button,
  FormGrid,
  Toolbar,
  Input,
  Field,
  element,
  updateStatus,
  implementation,
  variantDrafts,
} from './common.js';
import { createJob } from './client.js';
import { cancelAudioDecoders } from './aac-client.js';
import { Table, Disclosure } from '../ui/index.js';
import { traceCrop } from './trace-crop.js';

export function mountAudio(host, meta) {
  const ui = workspace(host, meta);
  const operation = select('转换方式', [
    ['trace', 'SpectroTrace：图片 → 声谱图声音'],
    ['encode', 'Spectrum：声音 → 图片'],
    ['decode', 'Spectrum：图片 → 声音'],
  ]);
  const basic = select('SpectroTrace 参数', [
    ['basic', '基础模式'],
    ['advanced', '高级模式'],
  ]);
  const duration = number('时长（秒）', 8, 1, 60);
  const min = number('最低频率（Hz）', 50, 20, 2000),
    max = number('最高频率（Hz）', 16000, 500, 22000);
  const traceRate = select(
    '采样率',
    [22050, 44100, 48000].map((x) => [x, x + ' Hz']),
    44100,
  );
  const scale = select('频率映射', [
    ['logarithmic', '对数'],
    ['linear', '线性'],
  ]);
  const curve = select('亮度映射', [
    ['linear', '线性'],
    ['exponential', '指数'],
    ['logarithmic', '对数'],
  ]);
  const smooth = number('平滑程度（%）', 15, 0, 100),
    invert = check('反转亮度');
  const traceParams = FormGrid({
    children: [
      duration.field,
      min.field,
      max.field,
      traceRate.field,
      scale.field,
      curve.field,
      smooth.field,
      invert.field,
    ],
  });
  traceParams.append(
    Button({
      text: '重置声音参数',
      on: {
        click: () => {
          ui.invalidate();
          for (const [field, value] of [
            [duration, 8],
            [min, 50],
            [max, 16000],
            [traceRate, 44100],
            [scale, 'logarithmic'],
            [curve, 'linear'],
            [smooth, 15],
          ])
            field.control.value = String(value);
          invert.control.checked = false;
        },
      },
    }),
  );
  const mode = select('Spectrum 模式', [
    ['compact', 'Compact：紧凑幅度谱'],
    ['exact', 'Exact：幅度与相位'],
  ]);
  const rate = number('采样率（0 保留原值）', 0, 0, 96000, 1);
  const bits = select(
    '量化位数',
    [2, 4, 8].map((x) => [x, String(x)]),
    8,
  );
  const win = select(
    'FFT 窗长',
    [256, 512, 1024, 2048, 4096].map((x, i) => [i, String(x)]),
    2,
  );
  const fmax = number('最高频率（0 保留全部）', 0, 0, 48000);
  const start = number('开始时间（秒）', 0, 0, 86400),
    end = number('结束时间（0 到末尾）', 0, 0, 86400);
  const fine = check('高质量相位恢复（较慢）');
  const spectrumParams = FormGrid({
    children: [mode.field, bits.field, win.field, fmax.field, start.field, end.field],
  });
  const spectrumJob = createJob(
    new URL('../vendor/fun-tools/spectrum-worker.js', import.meta.url),
    'module',
  );
  const crop = traceCrop(ui);
  const upload = fileInput(ui, '选择音频或图片', 'audio/*,image/*,.amr,.aac,.flac,.opus,.ogg', () =>
    sync(),
  );
  ui.parameters.append(
    operation.field,
    basic.field,
    traceParams,
    spectrumParams,
    rate.field,
    fine.field,
  );
  ui.input.append(upload.box, crop.root);
  const example = Button({
    text: '载入 Spectrum 示例音频',
    on: {
      click: async () => {
        ui.invalidate();
        operation.control.value = 'encode';
        operation.control.dispatchEvent(new Event('change', { bubbles: true }));
        const controller = new AbortController();
        ui.cleanup.add(() => controller.abort());
        example.disabled = true;
        updateStatus(ui.status, '正在读取本地示例音频…');
        try {
          const response = await fetch(
            new URL('../vendor/fun-tools/spectrum-demo.ogg', import.meta.url),
            { signal: controller.signal },
          );
          if (!response.ok) throw Error('示例音频读取失败。');
          const blob = await response.blob();
          if (controller.signal.aborted || ui.panel.hidden) return;
          upload.set(new File([blob], 'spectrum-demo.ogg', { type: 'audio/ogg' }));
          updateStatus(ui.status, '示例音频已载入，点击开始处理。');
        } catch (error) {
          if (!controller.signal.aborted) updateStatus(ui.status, error.message, 'error');
        } finally {
          example.disabled = false;
        }
      },
    },
  });
  ui.input.append(
    Toolbar({
      children: [
        example,
        Button({
          text: '清空当前文件',
          on: {
            click: () => {
              ui.invalidate();
              upload.restore(undefined);
              sync();
            },
          },
        }),
      ],
    }),
  );
  function sync() {
    const trace = operation.control.value === 'trace';
    implementation(ui, trace ? 'trace' : 'spectrum');
    basic.field.hidden = !trace;
    traceParams.hidden = !trace || basic.control.value === 'basic';
    spectrumParams.hidden = operation.control.value !== 'encode';
    rate.field.hidden = trace;
    fine.field.hidden = trace;
    bits.field.hidden = mode.control.value === 'exact';
    fmax.field.hidden = mode.control.value === 'exact';
    void crop.load(trace ? upload.file : undefined);
    crop.root.hidden = !trace || !upload.file;
  }
  operation.control.onchange = sync;
  basic.control.onchange = sync;
  mode.control.onchange = sync;
  sync();
  variantDrafts(
    operation.control,
    [
      basic.control,
      duration.control,
      min.control,
      max.control,
      traceRate.control,
      scale.control,
      curve.control,
      smooth.control,
      invert.control,
      mode.control,
      rate.control,
      bits.control,
      win.control,
      fmax.control,
      start.control,
      end.control,
      fine.control,
    ],
    [upload],
    sync,
  );
  function options() {
    const sr = Number(rate.control.value);
    if (sr && sr < 8000) throw Error('Spectrum 采样率须为 0 或 8000–96000 Hz。');
    return {
      mode: mode.control.value,
      sr,
      bits: Number(bits.control.value),
      fineness: Number(win.control.value),
      fmax: mode.control.value === 'exact' ? 0 : Number(fmax.control.value),
      start: Number(start.control.value),
      end: Number(end.control.value),
      fine: fine.control.checked,
    };
  }
  function runSpectrum(payload, progress) {
    ui.cleanup.add(() => spectrumJob.cancel());
    return spectrumJob.run(payload, progress);
  }
  async function render(value, live) {
    if (!live()) return;
    const url = URL.createObjectURL(value.wav);
    const player = element('audio', {
      attrs: { controls: true, src: url, 'aria-label': '声音预览' },
    });
    player.style.maxWidth = '100%';
    ui.cleanup.add(() => {
      player.pause();
      player.removeAttribute('src');
      player.load();
      URL.revokeObjectURL(url);
    });
    const waveform = element('canvas', {
      attrs: { width: 640, height: 100, 'aria-label': '波形，点击定位播放' },
    });
    waveform.style.maxWidth = '100%';
    waveform.style.height = 'auto';
    const c = waveform.getContext('2d');
    c.strokeStyle = getComputedStyle(ui.run).backgroundColor;
    c.beginPath();
    for (let x = 0; x < 640; x++) {
      const from = Math.floor((x * value.pcm.length) / 640),
        to = Math.max(from + 1, Math.floor(((x + 1) * value.pcm.length) / 640));
      let lo = 0,
        hi = 0;
      for (let i = from; i < to; i++) {
        lo = Math.min(lo, value.pcm[i] || 0);
        hi = Math.max(hi, value.pcm[i] || 0);
      }
      c.moveTo(x, 50 - lo * 48);
      c.lineTo(x, 50 - hi * 48);
    }
    c.stroke();
    const seek = Input({
      type: 'range',
      value: '0',
      attrs: {
        min: 0,
        max: value.pcm.length / value.sr,
        step: 0.01,
        'aria-label': '播放位置（秒）',
        'data-preview-control': true,
      },
    });
    seek.oninput = () => {
      player.currentTime = Number(seek.value);
    };
    const timelines = [];
    let animation;
    function paint() {
      seek.value = String(player.currentTime);
      const position = Math.max(0, Math.min(1, player.currentTime / (value.pcm.length / value.sr)));
      for (const { node, background } of timelines) {
        const context = node.getContext('2d');
        context.drawImage(background, 0, 0);
        context.strokeStyle = getComputedStyle(ui.run).backgroundColor;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(position * node.width, 0);
        context.lineTo(position * node.width, node.height);
        context.stroke();
      }
    }
    const animate = () => {
      paint();
      if (live() && !player.paused) animation = requestAnimationFrame(animate);
    };
    player.onplay = () => {
      cancelAnimationFrame(animation);
      animate();
    };
    player.ontimeupdate = paint;
    ui.cleanup.add(() => cancelAnimationFrame(animation));
    function interactive(node) {
      if (node.width * node.height <= 1_000_000) {
        const background = new OffscreenCanvas(node.width, node.height);
        background.getContext('2d').drawImage(node, 0, 0);
        timelines.push({ node, background });
      }
      node.tabIndex = 0;
      const move = (e) => {
        player.currentTime =
          (Math.max(
            0,
            Math.min(
              1,
              (e.clientX - node.getBoundingClientRect().left) / node.getBoundingClientRect().width,
            ),
          ) *
            value.pcm.length) /
          value.sr;
      };
      node.onpointerdown = (e) => {
        node.setPointerCapture(e.pointerId);
        move(e);
      };
      node.onpointermove = (e) => {
        if (node.hasPointerCapture(e.pointerId)) move(e);
      };
      node.onkeydown = (e) => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
          player.currentTime = Math.max(
            0,
            Math.min(
              value.pcm.length / value.sr,
              e.key === 'Home'
                ? 0
                : e.key === 'End'
                  ? value.pcm.length / value.sr
                  : player.currentTime + (e.key === 'ArrowRight' ? 1 : -1),
            ),
          );
        }
      };
    }
    interactive(waveform);
    ui.output.append(
      element('p', {
        text: `${(value.pcm.length / value.sr).toFixed(3)} 秒 · ${value.sr} Hz · 单声道`,
      }),
      player,
      Field({ label: '播放位置（秒）', control: seek }),
      waveform,
    );
    const actions = Toolbar({
      children: [
        Button({ text: '下载 WAV', on: { click: () => save(value.wav, 'spectrum.wav') } }),
      ],
    });
    const files = [new File([value.wav], 'spectrum.wav', { type: 'audio/wav' })];
    if (value.png) {
      const picture = await readImage(value.png);
      if (!live()) return;
      const spectrumPicture = canvas(picture, 'Spectrum 图片，点击、拖动或方向键定位');
      spectrumPicture.style.maxHeight = '360px';
      interactive(spectrumPicture);
      ui.output.append(spectrumPicture);
      actions.append(
        Button({ text: '下载 PNG', on: { click: () => save(value.png, value.name) } }),
      );
      files.push(new File([value.png], value.name, { type: 'image/png' }));
      ui.output.append(
        Disclosure({
          children: [
            element('summary', { text: '完整频谱元数据' }),
            element('pre', { text: JSON.stringify(value.spec.meta, null, 2) }),
          ],
        }),
      );
      const refine = Button({
        text: '精修相位并重新生成',
        on: {
          click: () =>
            ui.execute(
              (p) =>
                runSpectrum(
                  {
                    action: 'refine',
                    spec: value.spec,
                    reference: value.reference,
                    name: value.name,
                    options: { fine: true },
                  },
                  p,
                ),
              render,
            ),
        },
      });
      actions.append(refine);
      if (value.reference) {
        const auditResult = Box();
        const auditButton = Button({
          text: '分析原图／JPEG／缩小图的恢复质量',
          on: {
            click: async () => {
              auditButton.disabled = true;
              try {
                const data = await runSpectrum({ action: 'audit', ...value }, (text) => {
                  if (live()) updateStatus(ui.status, text);
                });
                if (live()) {
                  const display = (n) =>
                    Number.isFinite(n)
                      ? Number(n.toFixed(3))
                      : n === Infinity
                        ? '∞'
                        : n === -Infinity
                          ? '−∞'
                          : '不适用';
                  const table = Table({
                    caption: '恢复质量（对照处理后的单声道原音频）',
                    columns: ['图片', '信噪比 dB', '相关性', '对数谱距离', '幅度差', '字节'],
                    rows: data.rows.map((row) => [
                      { original: '原 PNG', lossy: 'JPEG', half: '缩小一半' }[row.kind],
                      display(row.snr),
                      display(row.corr),
                      display(row.lsd),
                      display(row.level),
                      row.bytes,
                    ]),
                  });
                  const scroll = Box({ children: table });
                  scroll.style.overflowX = 'auto';
                  auditResult.replaceChildren(
                    scroll,
                    element('p', {
                      text: '信噪比与相关性通常越高越好；对数谱距离和幅度差越低越好。',
                    }),
                  );
                  updateStatus(ui.status, '质量分析完成。', 'success');
                }
              } catch (error) {
                if (live()) updateStatus(ui.status, error.message, 'error');
              } finally {
                auditButton.disabled = false;
              }
            },
          },
        });
        actions.append(auditButton);
        ui.output.append(auditResult);
      }
    }
    if (value.notes?.length) ui.output.append(element('p', { text: value.notes.join('\n') }));
    ui.output.append(actions);
    const range = value.range || [0, value.sr / 2];
    const views = await ui.job.run({ kind: 'views', pcm: value.pcm, sr: value.sr, range });
    if (!live()) return;
    for (const [i, view] of views.entries()) {
      const plot = canvas({ ...view, data: view.pixels });
      interactive(plot);
      ui.output.append(
        element('p', {
          text: `声谱图 · ${i ? '选定频带 ' + range.join('–') : '全频带 0–' + value.sr / 2} Hz · 从左到右为时间`,
        }),
        plot,
      );
    }
    ui.recording.publish({ files });
  }
  ui.run.onclick = () =>
    ui.execute(async (progress, live) => {
      if (!upload.file) throw Error('请先选择文件。');
      if (operation.control.value === 'trace') {
        const p =
          basic.control.value === 'basic'
            ? {
                duration: 8,
                minFreq: 50,
                maxFreq: 16000,
                sampleRate: 44100,
                frequencyScale: 'logarithmic',
                brightnessCurve: 'linear',
                smoothing: 15,
                invertImage: false,
              }
            : {
                duration: Number(duration.control.value),
                minFreq: Number(min.control.value),
                maxFreq: Number(max.control.value),
                sampleRate: Number(traceRate.control.value),
                frequencyScale: scale.control.value,
                brightnessCurve: curve.control.value,
                smoothing: Number(smooth.control.value),
                invertImage: invert.control.checked,
              };
        if (p.minFreq >= p.maxFreq || p.maxFreq > p.sampleRate / 2)
          throw Error('频率上限必须高于下限，且不超过采样率的一半。');
        const file = upload.file;
        const selection = await crop.selection(file);
        if (!live()) return;
        const image = await readImage(file);
        if (!live()) return;
        return ui.job.run({ kind: 'trace', image, crop: selection, options: p }, progress);
      }
      const p = options();
      if (operation.control.value === 'decode')
        return runSpectrum(
          { action: 'decode', file: upload.file, name: upload.file.name, options: p },
          progress,
        );
      if (upload.file.size > 128 * 1024 * 1024) throw Error('音频文件最多 128 MB。');
      progress('正在加载音频解码器…');
      const controller = new AbortController();
      ui.cleanup.add(() => controller.abort());
      ui.cleanup.add(cancelAudioDecoders);
      const { decodeAudioFile } = await import('../vendor/fun-tools/spectrum-audio.js');
      if (!live()) return;
      const data = await upload.file.arrayBuffer();
      if (!live()) return;
      const decoded = await decodeAudioFile(data, controller.signal);
      if (!live()) return;
      return runSpectrum(
        { action: 'encode', ...decoded, name: upload.file.name, options: p },
        progress,
      );
    }, render);
  return ui;
}
