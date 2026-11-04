import {
  workspace,
  select,
  number,
  fileInput,
  readImage,
  save,
  canvas,
  png,
  Box,
  Button,
  Field,
  Input,
  Textarea,
  Toolbar,
  Option,
  element,
  updateStatus,
} from './common.js';
import { receiver } from './screen-model.js';
import { createJob } from './client.js';
export function mountScreen(host, meta) {
  const ui = workspace(host, meta);
  const direction = select('方向', [
    ['send', '发送文件／文字'],
    ['receive', '接收文件'],
  ]);
  if (new URLSearchParams(location.hash.split('?')[1] || '').get('mode') === 'receive')
    direction.control.value = 'receive';
  const kind = select('发送内容', [
    ['file', '文件'],
    ['text', '文字'],
  ]);
  const capacity = select(
    '每帧有效字节',
    [128, 256, 400, 600, 900, 1240].map((x) => [x, String(x)]),
    400,
  );
  const text = Textarea({ minRows: 3, autoSize: true, attrs: { 'aria-label': '发送文字' } });
  const upload = fileInput(ui, '选择发送文件');
  const textField = Field({ label: '发送文字（UTF-8）', control: text });
  const camera = select('摄像头', [['', '默认后置摄像头']]);
  const refresh = Button({
    text: '刷新摄像头列表',
    on: {
      click: async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          camera.control.replaceChildren(
            Option('默认后置摄像头', ''),
            ...devices
              .filter((d) => d.kind === 'videoinput')
              .map((d, i) => Option(d.label || `摄像头 ${i + 1}`, d.deviceId)),
          );
        } catch (e) {
          updateStatus(ui.status, e.message, 'error');
        }
      },
    },
  });
  const sendBox = Box({ children: [upload.box, textField] });
  const count = element('p');
  textField.append(count);
  text.oninput = () => {
    count.textContent = `${[...text.value].length} 个字符 · ${new TextEncoder().encode(text.value).length} 字节`;
  };
  const receiverUrl = new URL(location.href);
  receiverUrl.hash = 'screen-drop?task=native%3Ascreen-drop&mode=receive';
  const address = Input({
    value: receiverUrl.href,
    attrs: { readonly: true, 'aria-label': '接收端地址', 'data-preview-control': true },
  });
  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      updateStatus(ui.status, '已复制。', 'success');
    } catch {
      updateStatus(ui.status, '复制失败，请选择文字后手动复制。', 'error');
    }
  }
  const entry = Box(),
    entryQr = Box();
  const entryJob = createJob();
  let entryRevision = 0;
  entry.append(
    Field({ label: '在接收设备浏览器打开', control: address }),
    Toolbar({
      children: [
        Button({ text: '复制接收端地址', on: { click: () => copy(address.value) } }),
        Button({
          text: '显示接收端二维码',
          on: {
            click: async () => {
              const revision = ++entryRevision;
              ui.cleanup.add(() => {
                entryRevision++;
                entryJob.cancel();
                entryQr.replaceChildren();
              });
              try {
                const image = await entryJob.run({ kind: 'qr', packet: address.value });
                if (revision !== entryRevision || ui.panel.hidden) return;
                entryQr.replaceChildren(canvas(image, '接收端入口二维码'));
              } catch (e) {
                if (revision === entryRevision) updateStatus(ui.status, e.message, 'error');
              }
            },
          },
        }),
        Button({
          text: '使用示例文件',
          on: {
            click: () => {
              kind.control.value = 'file';
              upload.set(
                new File(
                  [
                    '迷雾工具箱 ScreenDrop 示例\n中文、English、数字 0123456789 与表情 😀\n接收完成后使用 SHA-256 校验完整内容。\n',
                  ],
                  '示例文件.txt',
                  { type: 'text/plain' },
                ),
              );
              sync();
            },
          },
        }),
      ],
    }),
    entryQr,
  );
  if (['127.0.0.1', 'localhost', '[::1]'].includes(receiverUrl.hostname))
    entry.append(
      element('p', {
        text: '当前是本机预览地址，其他设备无法访问此地址。跨设备接收时，请在可访问的 HTTPS 站点打开此工具。',
      }),
    );
  sendBox.append(entry);
  const receiveBox = Box({ children: [camera.field, refresh] });
  ui.parameters.append(direction.field, kind.field, capacity.field);
  ui.input.append(sendBox, receiveBox);
  function sync() {
    const sending = direction.control.value === 'send';
    sendBox.hidden = !sending;
    receiveBox.hidden = sending;
    kind.field.hidden = !sending;
    capacity.field.hidden = !sending;
    upload.box.hidden = kind.control.value !== 'file';
    textField.hidden = kind.control.value !== 'text';
    ui.run.textContent = sending ? '生成传输二维码' : '开始接收';
  }
  direction.control.onchange = sync;
  kind.control.onchange = sync;
  sync();
  async function renderSend(value, live) {
    let index = 0,
      timer,
      playing = false,
      drawing = false,
      loop = 1;
    const qrBox = Box(),
      info = element('p'),
      stats = element('p'),
      hash = element('p', { text: `SHA-256：${value.hash}` });
    const controls = Toolbar({ attrs: { 'data-preview-control': true } });
    const speed = number('帧间隔（毫秒）', 300, 100, 10000, 1),
      jump = number('跳转到帧', 1, 1, value.chunks.length, 1);
    const subset = Input({
      attrs: { 'aria-label': '只补传这些帧（逗号分隔）', placeholder: '例如 1,3,8；留空传全部' },
    });
    const pause = Button({ text: '开始循环' });
    let selected = Array.from({ length: value.chunks.length }, (_, i) => i),
      currentImage;
    function pausePlayback() {
      playing = false;
      clearTimeout(timer);
      pause.textContent = '开始循环';
    }
    function statistics() {
      const ms = Number(speed.control.value);
      stats.textContent = `设定速度 ${(1000 / ms).toFixed(2)} 帧/秒 · 当前范围 ${selected.length} 帧 · 每轮预计 ${((selected.length * ms) / 1000).toFixed(1)} 秒（不含绘制耗时与补传）`;
    }
    speed.control.oninput = statistics;
    async function show() {
      if (!live() || drawing) return;
      drawing = true;
      try {
        currentImage = await ui.job.run({ kind: 'qr', packet: value.chunks[index] });
        if (!live()) return;
        qrBox.replaceChildren(canvas(currentImage, `传输二维码，第 ${index + 1} 帧`));
        info.textContent = `${value.name} · ${value.size} 字节 · 第 ${index + 1}/${value.chunks.length} 帧 · 第 ${loop} 轮`;
        jump.control.value = String(index + 1);
        statistics();
      } catch (e) {
        if (live()) {
          pausePlayback();
          updateStatus(ui.status, e.message, 'error');
        }
      } finally {
        drawing = false;
      }
      if (playing && live())
        timer = setTimeout(() => {
          const at = selected.indexOf(index);
          if (at === selected.length - 1) loop++;
          index = selected[(at + 1) % selected.length];
          void show();
        }, Number(speed.control.value));
    }
    pause.onclick = () => {
      if (playing) pausePlayback();
      else if (speed.control.validity.valid) {
        playing = true;
        pause.textContent = '暂停';
        void show();
      }
    };
    const step = (delta) => {
      if (drawing) return;
      pausePlayback();
      index = (index + delta + value.chunks.length) % value.chunks.length;
      void show();
    };
    controls.append(
      pause,
      Button({ text: '上一帧', on: { click: () => step(-1) } }),
      Button({ text: '下一帧', on: { click: () => step(1) } }),
      speed.field,
      jump.field,
      Button({
        text: '跳转',
        on: {
          click: () => {
            if (!drawing && jump.control.validity.valid) {
              pausePlayback();
              index = Number(jump.control.value) - 1;
              void show();
            }
          },
        },
      }),
      Field({ label: '补传帧号', control: subset }),
      Button({
        text: '应用补传范围',
        on: {
          click: () => {
            pausePlayback();
            const values = subset.value.trim()
              ? subset.value.split(/[,，\s]+/).map(Number)
              : Array.from({ length: value.chunks.length }, (_, i) => i + 1);
            if (values.some((x) => !Number.isInteger(x) || x < 1 || x > value.chunks.length)) {
              updateStatus(ui.status, '补传帧号无效。', 'error');
              return;
            }
            selected = [...new Set(values.map((x) => x - 1))];
            index = selected[0];
            void show();
          },
        },
      }),
      Button({
        text: '下载当前二维码',
        on: {
          click: async () => {
            if (currentImage) save(await png(currentImage), `screendrop-${index + 1}.png`);
          },
        },
      }),
      Button({ text: '复制完整 SHA-256', on: { click: () => copy(value.hash) } }),
      Button({
        text: '停止传输／更换文件',
        on: {
          click: () => {
            ui.invalidate();
            upload.input.focus();
          },
        },
      }),
    );
    ui.cleanup.add(pausePlayback);
    ui.output.append(info, stats, qrBox, controls, hash);
    await show();
    if (live())
      ui.recording.publish({
        text: `ScreenDrop：${value.name}\n${value.size} 字节，${value.chunks.length} 帧\nSHA-256 ${value.hash}`,
      });
  }
  async function renderReceive(_, live) {
    let state = receiver(),
      stream,
      timer,
      scanning = false,
      finished = false,
      receiveRevision = 0,
      cameraRevision = 0;
    const scanJob = createJob(),
      video = element('video', {
        attrs: { playsinline: true, muted: true, 'aria-label': '接收摄像头' },
      });
    video.style.maxWidth = '100%';
    video.style.maxHeight = '320px';
    const info = element('p', { text: '等待扫描 ScreenDrop 二维码。' }),
      missing = Textarea({
        autoSize: true,
        minRows: 2,
        maxRows: 5,
        attrs: { readonly: true, 'aria-label': '缺少的帧号' },
      }),
      result = Box();
    const controls = Toolbar({ attrs: { 'data-preview-control': true } });
    const stopCamera = () => {
      cameraRevision++;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      video.srcObject = null;
      scanJob.cancel();
    };
    ui.cleanup.add(stopCamera);
    async function accept(raw) {
      if (!raw || finished) return;
      const revision = receiveRevision;
      const progress = state.add(raw);
      if (!live()) return;
      info.textContent = `已收到 ${progress.received}/${progress.total} 帧`;
      missing.value = state.missing().join(',');
      if (progress.complete) {
        const value = await state.finish();
        if (!live() || revision !== receiveRevision) return;
        finished = true;
        stopCamera();
        const name = value.fileName.replace(/[\\/\u0000-\u001f]/g, '_') || 'received.bin';
        const file = new File([value.fileData], name);
        result.replaceChildren(
          element('p', {
            text: `接收完成：${name} · ${value.fileSize} 字节\nSHA-256 校验通过：${value.hash}`,
          }),
          Button({ text: '下载完整文件', on: { click: () => save(file, name) } }),
          Button({ text: '复制完整 SHA-256', on: { click: () => copy(value.hash) } }),
        );
        ui.recording.publish({ files: [file] });
      }
    }
    async function scan() {
      if (!live() || !stream || finished) return;
      if (video.readyState >= 2 && !scanning) {
        scanning = true;
        try {
          const factor = Math.min(1, 1280 / video.videoWidth),
            w = Math.round(video.videoWidth * factor),
            h = Math.round(video.videoHeight * factor);
          const c = new OffscreenCanvas(w, h),
            ctx = c.getContext('2d');
          ctx.drawImage(video, 0, 0, w, h);
          const raw = await scanJob.run({
            kind: 'scan',
            image: { width: w, height: h, data: ctx.getImageData(0, 0, w, h).data },
          });
          if (live()) await accept(raw);
        } catch (e) {
          if (live() && e.name !== 'AbortError') updateStatus(ui.status, e.message, 'error');
        } finally {
          scanning = false;
        }
      }
      if (live() && stream && !finished) timer = setTimeout(scan, 120);
    }
    const startCamera = Button({
      text: '打开摄像头',
      on: {
        click: async () => {
          if (stream) return;
          const revision = ++cameraRevision;
          try {
            if (!navigator.mediaDevices?.getUserMedia)
              throw Error('摄像头需要 HTTPS 或本机地址，也可导入二维码图片。');
            const acquired = await navigator.mediaDevices.getUserMedia({
              video: camera.control.value
                ? { deviceId: { exact: camera.control.value } }
                : { facingMode: 'environment' },
              audio: false,
            });
            if (!live() || revision !== cameraRevision) {
              acquired.getTracks().forEach((t) => t.stop());
              return;
            }
            stream = acquired;
            video.srcObject = stream;
            await video.play();
            void scan();
          } catch (e) {
            if (live()) updateStatus(ui.status, `摄像头未打开：${e.message}`, 'error');
          }
        },
      },
    });
    const images = Input({
      type: 'file',
      attrs: { accept: 'image/*', multiple: true, 'aria-label': '导入二维码图片' },
    });
    images.onchange = async () => {
      stopCamera();
      const revision = ++receiveRevision;
      for (const file of images.files) {
        if (!live() || finished || revision !== receiveRevision) break;
        try {
          const image = await readImage(file);
          if (!live() || revision !== receiveRevision) break;
          const raw = await scanJob.run({ kind: 'scan', image });
          if (!live() || revision !== receiveRevision) break;
          if (!raw) throw Error('图片中未找到二维码。');
          await accept(raw);
        } catch (e) {
          if (live()) updateStatus(ui.status, e.message, 'error');
        }
      }
    };
    controls.append(
      startCamera,
      Button({ text: '暂停摄像头（保留进度）', on: { click: stopCamera } }),
      Field({ label: '导入二维码图片（可多选补传）', control: images }),
      Button({
        text: '清空接收进度',
        on: {
          click: () => {
            receiveRevision++;
            stopCamera();
            state = receiver();
            finished = false;
            missing.value = '';
            result.replaceChildren();
            info.textContent = '已清空，等待新的传输。';
            ui.recording.clear();
          },
        },
      }),
    );
    ui.output.append(
      video,
      controls,
      info,
      Field({ label: '缺少的帧号（复制到发送端补传）', control: missing }),
      result,
    );
  }
  ui.run.onclick = () =>
    ui.execute(
      async (progress, live) => {
        if (direction.control.value === 'receive') return null;
        const file =
          kind.control.value === 'text' ? new File([text.value], 'message.txt') : upload.file;
        if (!file) throw Error('请选择文件或输入文字。');
        if (file.size > 32 * 1024 * 1024) throw Error('文件最多 32 MB。');
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (!live()) return;
        return ui.job.run(
          { kind: 'transfer', bytes, name: file.name, capacity: Number(capacity.control.value) },
          progress,
        );
      },
      (value, live) =>
        direction.control.value === 'receive'
          ? renderReceive(value, live)
          : renderSend(value, live),
    );
  return ui;
}
