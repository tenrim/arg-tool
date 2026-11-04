import {
  workspace,
  select,
  number,
  fileInput,
  save,
  readImage,
  png,
  canvas,
  Field,
  Input,
  Textarea,
  Box,
  Toolbar,
  Button,
  element,
  variantDrafts,
} from './common.js';
import { ReferenceList } from '../ui/index.js';
export function mountImage(host, meta) {
  const ui = workspace(host, meta);
  if (meta.id === 'visual-crypto')
    ui.layout.root.append(
      ReferenceList({
        items: [
          {
            id: 'naor-shamir',
            title: 'Naor、Shamir：Visual Cryptography',
            url: 'https://www.wisdom.weizmann.ac.il/~naor/PAPERS/vis.pdf',
            publisher: 'Weizmann Institute of Science',
            language: 'en',
            kind: 'author-spec',
            locator: '二取二子像素秘密分享',
          },
        ],
      }),
    );
  const upload = fileInput(
    ui,
    meta.id === 'file-image' ? '选择文件或 PNG' : '选择、拖入或粘贴图片',
  );
  ui.input.append(upload.box);
  const direction = select(
    '方向',
    meta.id === 'pic-scramble'
      ? [
          ['encode', '混淆'],
          ['decode', '解混淆'],
        ]
      : [
          ['encode', '生成图片'],
          ['decode', '还原文件'],
        ],
  );
  if (meta.id !== 'visual-crypto') ui.parameters.append(direction.field);
  const kind = select('输入来源', [
    ['file', '文件'],
    ['text', '文字'],
    ['hex', '十六进制字节'],
  ]);
  const text = Textarea({
    autoSize: true,
    minRows: 2,
    attrs: { 'aria-label': '输入文字或十六进制' },
  });
  const filename = Input({ value: '还原文件.bin' });
  const threshold = number('黑白阈值', 128, 0, 255, 1),
    scale = number('子像素尺寸', 1, 1, 8, 1);
  const overlay = select('操作', [
    ['generate', '生成秘密分片'],
    ['overlay', '叠合已有分片'],
  ]);
  const second = fileInput(ui, '选择分片 B', 'image/*');
  const quality = number('JPEG 质量', 1, 0.1, 1, 0.01);
  if (meta.id === 'file-image') {
    ui.parameters.append(kind.field, Field({ label: '恢复文件名', control: filename }));
    ui.input.append(text);
  } else if (meta.id === 'visual-crypto') {
    kind.control.querySelector('option[value=hex]')?.remove();
    ui.parameters.append(overlay.field, kind.field, threshold.field, scale.field);
    ui.input.append(text, second.box);
  } else ui.parameters.append(quality.field);
  let current, original;
  upload.input.addEventListener('change', () => {
    current = original = undefined;
  });
  let lastFile;
  ui.panel.addEventListener('dragover', (e) => {
    if (!e.target.closest('textarea,input')) e.preventDefault();
  });
  ui.panel.addEventListener('drop', (e) => {
    if (
      e.target.closest('textarea,input') ||
      upload.box.contains(e.target) ||
      second.box.contains(e.target)
    )
      return;
    e.preventDefault();
    upload.set(e.dataTransfer.files[0]);
  });
  ui.panel.addEventListener('paste', (e) => {
    if (
      e.target.closest('textarea,input') ||
      upload.box.contains(e.target) ||
      second.box.contains(e.target)
    )
      return;
    const item = [...(e.clipboardData?.items || [])].find((i) => i.kind === 'file');
    if (item) {
      e.preventDefault();
      upload.set(item.getAsFile());
    }
  });
  ui.run.onclick = () =>
    ui.execute(
      async (progress, live) => {
        const run = (data) => {
          if (!live()) throw new DOMException('已失效', 'AbortError');
          return ui.job.run(data, progress);
        };
        if (meta.id === 'pic-scramble') {
          if (lastFile !== upload.file) {
            const file = upload.file,
              image = await readImage(file);
            if (!live()) return;
            current = original = image;
            lastFile = file;
          }
          if (!current) throw Error('请先选择图片。');
          const result = await run({
            kind: 'scramble',
            image: current,
            reverse: direction.control.value === 'decode',
          });
          return {
            image: result,
            blob: await png(result),
            jpeg: await png(result, 'image/jpeg', Number(quality.control.value)),
          };
        }
        if (meta.id === 'file-image') {
          if (direction.control.value === 'decode') {
            const bytes = await run({ kind: 'unpack', image: await readImage(upload.file) });
            return { bytes, blob: new Blob([bytes]), name: filename.value || '还原文件.bin' };
          }
          let bytes;
          if (kind.control.value === 'text') bytes = new TextEncoder().encode(text.value);
          else if (kind.control.value === 'hex') {
            const hex = text.value.replace(/\s/g, '');
            if (!/^(?:[\da-f]{2})*$/i.test(hex)) throw Error('十六进制须为完整字节。');
            bytes = Uint8Array.from(hex.match(/../g) || [], (s) => parseInt(s, 16));
          } else {
            if (!upload.file || upload.file.size > 32 * 1024 * 1024)
              throw Error('请选择最多 32 MB 的文件。');
            bytes = new Uint8Array(await upload.file.arrayBuffer());
          }
          const image = await run({ kind: 'pack', bytes });
          return { image, blob: await png(image) };
        }
        let shares;
        if (overlay.control.value === 'overlay') {
          shares = await Promise.all([readImage(upload.file), readImage(second.file)]);
          if (shares[0].width !== shares[1].width || shares[0].height !== shares[1].height)
            throw Error('两张分片尺寸必须一致。');
        } else {
          let image;
          if (kind.control.value === 'text') {
            if (!text.value.trim()) throw Error('请输入秘密文字。');
            if (text.value.length > 10000) throw Error('视觉密码文字最多 1 万字符。');
            const lines = text.value.split('\n');
            const c = new OffscreenCanvas(1, 1),
              ctx = c.getContext('2d');
            ctx.font = '32px sans-serif';
            const width = Math.ceil(Math.max(...lines.map((s) => ctx.measureText(s).width))) + 24,
              height = lines.length * 44 + 24;
            if (width * height > 1_000_000 || width > 16000 || height > 16000)
              throw Error('文字画布过大，请减少文本。');
            c.width = width;
            c.height = height;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.font = '32px sans-serif';
            ctx.fillStyle = 'black';
            lines.forEach((s, i) => ctx.fillText(s, 12, 40 + i * 44));
            image = {
              width: c.width,
              height: c.height,
              data: ctx.getImageData(0, 0, c.width, c.height).data,
            };
          } else image = await readImage(upload.file);
          shares = await run({
            kind: 'shares',
            image,
            threshold: Number(threshold.control.value),
            scale: Number(scale.control.value),
          });
        }
        return { shares, blobs: await Promise.all(shares.map((s) => png(s))) };
      },
      (result) => {
        if (result.shares) {
          const [a, b] = result.shares;
          const preview = element('canvas', {
            attrs: { width: a.width * 2, height: a.height, 'aria-label': '分片叠合预览' },
          });
          preview.style.maxWidth = '100%';
          preview.style.height = 'auto';
          const left = canvas(a),
            right = canvas(b);
          const slider = Input({
            type: 'range',
            value: '0',
            attrs: {
              min: 0,
              max: a.width,
              step: 1,
              'aria-label': '分片 B 偏移',
              'data-preview-control': '',
            },
          });
          const draw = () => {
            const c = preview.getContext('2d');
            c.fillStyle = 'white';
            c.fillRect(0, 0, preview.width, preview.height);
            c.drawImage(left, 0, 0);
            c.drawImage(right, Number(slider.value), 0);
          };
          slider.oninput = draw;
          draw();
          ui.output.append(
            preview,
            Field({ label: '滑动叠合分片', control: slider }),
            Toolbar({
              children: result.blobs.map((blob, i) =>
                Button({
                  text: `下载透明分片 ${i ? 'B' : 'A'}`,
                  on: { click: () => save(blob, `分片${i ? 'B' : 'A'}.png`) },
                }),
              ),
            }),
          );
          ui.recording.publish({
            files: result.blobs.map(
              (blob, i) => new File([blob], `分片${i ? 'B' : 'A'}.png`, { type: 'image/png' }),
            ),
          });
        } else {
          if (result.image) ui.output.append(canvas(result.image));
          else
            ui.output.append(
              Box({ text: `已恢复 ${result.bytes.length.toLocaleString()} 字节。` }),
            );
          const actions = Toolbar({
            children: [
              Button({
                text: result.image ? '下载 PNG' : '下载完整文件',
                on: { click: () => save(result.blob, result.name || meta.id + '.png') },
              }),
            ],
          });
          if (meta.id === 'pic-scramble') {
            current = result.image;
            actions.append(
              Button({
                text: '下载 JPEG（有损）',
                on: { click: () => save(result.jpeg, '混淆图片.jpg') },
              }),
              Button({
                text: '恢复原图',
                on: {
                  click: () => {
                    current = original;
                    ui.invalidate();
                    ui.output.replaceChildren(canvas(original));
                  },
                },
              }),
            );
          }
          ui.output.append(actions);
          ui.recording.publish({
            files: [
              new File([result.blob], result.name || meta.id + '.png', { type: result.blob.type }),
            ],
          });
        }
      },
    );
  function sync() {
    const decode = meta.id === 'file-image' && direction.control.value === 'decode';
    const combining = meta.id === 'visual-crypto' && overlay.control.value === 'overlay';
    text.hidden = kind.control.value === 'file' || decode || combining;
    second.box.hidden = !combining;
    upload.box.hidden =
      meta.id !== 'pic-scramble' && !decode && !combining && kind.control.value !== 'file';
    kind.field.hidden = decode || combining;
    if (meta.id === 'visual-crypto') {
      threshold.field.hidden = combining;
      scale.field.hidden = combining;
    }
  }
  kind.control.addEventListener('change', sync);
  overlay.control.addEventListener('change', sync);
  direction.control.addEventListener('change', sync);
  sync();
  if (meta.id === 'file-image')
    variantDrafts(direction.control, [kind.control, text, filename], [upload], sync);
}
