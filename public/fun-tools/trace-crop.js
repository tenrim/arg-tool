import {
  Box,
  Button,
  FormGrid,
  Toolbar,
  element,
  number,
  select,
  readImage,
  canvas,
  updateStatus,
} from './common.js';

// SpectroTrace f4700267, ImageUpload/ImageCropper/index.tsx:179-257:
// expose free/1:1/4:3/16:9 crops and 1–4x preview zoom in original-image coordinates.
export function traceCrop(ui) {
  const x = number('裁剪左侧（像素）', 0, 0, 16000000, 1);
  const y = number('裁剪顶部（像素）', 0, 0, 16000000, 1);
  const width = number('裁剪宽度（像素）', 1, 1, 16000000, 1);
  const height = number('裁剪高度（像素）', 1, 1, 16000000, 1);
  const aspect = select('裁剪比例', [
    ['free', '自由'],
    ['1:1', '1:1'],
    ['4:3', '4:3'],
    ['16:9', '16:9'],
  ]);
  const zoom = number('预览缩放（%）', 100, 100, 400, 10);
  zoom.control.dataset.previewControl = 'true';
  const viewport = Box(),
    info = element('p');
  viewport.style.overflow = 'auto';
  viewport.style.maxHeight = '420px';
  const root = Box({
    children: [
      info,
      viewport,
      FormGrid({
        children: [aspect.field, zoom.field, x.field, y.field, width.field, height.field],
      }),
    ],
  });
  const drafts = new WeakMap();
  let current,
    image,
    preview,
    background,
    pending,
    revision = 0,
    drag;
  const ratio = () =>
    aspect.control.value === 'free'
      ? null
      : aspect.control.value
          .split(':')
          .map(Number)
          .reduce((a, b) => a / b);
  const rect = () => ({
    x: Number(x.control.value),
    y: Number(y.control.value),
    width: Number(width.control.value),
    height: Number(height.control.value),
  });
  function remember() {
    if (current && image)
      drafts.set(current, { ...rect(), aspect: aspect.control.value, zoom: zoom.control.value });
  }
  function paint() {
    if (!preview || !image) return;
    const r = rect(),
      ctx = preview.getContext('2d'),
      sx = preview.width / image.width,
      sy = preview.height / image.height;
    ctx.drawImage(background, 0, 0);
    ctx.strokeStyle = getComputedStyle(ui.run).backgroundColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x * sx, r.y * sy, r.width * sx, r.height * sy);
    ctx.lineWidth = 1;
    for (const t of [1 / 3, 2 / 3]) {
      ctx.beginPath();
      ctx.moveTo((r.x + r.width * t) * sx, r.y * sy);
      ctx.lineTo((r.x + r.width * t) * sx, (r.y + r.height) * sy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(r.x * sx, (r.y + r.height * t) * sy);
      ctx.lineTo((r.x + r.width) * sx, (r.y + r.height * t) * sy);
      ctx.stroke();
    }
    for (const px of [r.x, r.x + r.width])
      for (const py of [r.y, r.y + r.height]) ctx.strokeRect(px * sx - 4, py * sy - 4, 8, 8);
    preview.style.width = `${Number(zoom.control.value)}%`;
    preview.style.maxWidth = `${Math.round((preview.width * Number(zoom.control.value)) / 100)}px`;
    preview.style.height = 'auto';
    info.textContent = `原图 ${image.width} × ${image.height}；选区 ${r.width} × ${r.height}。拖动框内移动选区，拖动角点缩放，框外拖动重选；也可填写像素坐标。`;
    remember();
  }
  function setRect(r) {
    for (const [key, field] of Object.entries({ x, y, width, height }))
      field.control.value = String(r[key]);
    paint();
  }
  function centered() {
    if (!image) return;
    const a = ratio();
    const w = a ? Math.min(image.width, image.height * a) : image.width;
    const h = a ? w / a : image.height;
    setRect({
      x: Math.round((image.width - w) / 2),
      y: Math.round((image.height - h) / 2),
      width: Math.max(1, Math.round(w)),
      height: Math.max(1, Math.round(h)),
    });
  }
  aspect.control.onchange = centered;
  zoom.control.oninput = paint;
  for (const field of [x, y, width, height])
    field.control.oninput = () => {
      if (!image) return;
      const a = ratio();
      if (a && field === width)
        height.control.value = String(Math.max(1, Math.round(Number(width.control.value) / a)));
      if (a && field === height)
        width.control.value = String(Math.max(1, Math.round(Number(height.control.value) * a)));
      paint();
    };
  root.append(
    Toolbar({
      children: [
        Button({
          text: '恢复完整图片',
          on: {
            click: () => {
              ui.invalidate();
              aspect.control.value = 'free';
              zoom.control.value = '100';
              centered();
            },
          },
        }),
        ...[-10, 10].map((delta) =>
          Button({
            text: delta < 0 ? '缩小预览' : '放大预览',
            on: {
              click: () => {
                zoom.control.value = String(
                  Math.max(100, Math.min(400, Number(zoom.control.value) + delta)),
                );
                paint();
              },
            },
          }),
        ),
      ],
    }),
  );
  function bind() {
    const point = (e) => {
      const b = preview.getBoundingClientRect();
      return {
        x: Math.max(
          0,
          Math.min(image.width, Math.round(((e.clientX - b.left) / b.width) * image.width)),
        ),
        y: Math.max(
          0,
          Math.min(image.height, Math.round(((e.clientY - b.top) / b.height) * image.height)),
        ),
      };
    };
    preview.onpointerdown = (e) => {
      ui.invalidate();
      const p = point(e),
        r = rect(),
        b = preview.getBoundingClientRect();
      const corner = [
        [r.x, r.y],
        [r.x + r.width, r.y],
        [r.x, r.y + r.height],
        [r.x + r.width, r.y + r.height],
      ].find(
        ([cx, cy]) =>
          Math.abs(cx - p.x) < (12 * image.width) / b.width &&
          Math.abs(cy - p.y) < (12 * image.height) / b.height,
      );
      const inside = p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
      drag = {
        p,
        r,
        move: !corner && inside,
        anchor: corner
          ? {
              x: corner[0] === r.x ? r.x + r.width : r.x,
              y: corner[1] === r.y ? r.y + r.height : r.y,
            }
          : p,
      };
      preview.setPointerCapture(e.pointerId);
    };
    preview.onpointermove = (e) => {
      if (!drag || !preview.hasPointerCapture(e.pointerId)) return;
      const p = point(e),
        { r } = drag;
      if (drag.move)
        setRect({
          ...r,
          x: Math.max(0, Math.min(image.width - r.width, r.x + p.x - drag.p.x)),
          y: Math.max(0, Math.min(image.height - r.height, r.y + p.y - drag.p.y)),
        });
      else {
        const a = ratio(),
          origin = drag.anchor,
          dx = p.x >= origin.x ? 1 : -1,
          dy = p.y >= origin.y ? 1 : -1;
        let w = Math.max(1, Math.abs(p.x - origin.x)),
          h = Math.max(1, Math.abs(p.y - origin.y));
        if (a) {
          w = Math.min(
            w,
            h * a,
            dx > 0 ? image.width - origin.x : origin.x,
            (dy > 0 ? image.height - origin.y : origin.y) * a,
          );
          h = w / a;
        }
        w = Math.max(1, Math.round(w));
        h = Math.max(1, Math.round(h));
        setRect({
          x: Math.max(0, Math.min(image.width - w, dx > 0 ? origin.x : origin.x - w)),
          y: Math.max(0, Math.min(image.height - h, dy > 0 ? origin.y : origin.y - h)),
          width: w,
          height: h,
        });
      }
    };
    preview.onpointerup = preview.onpointercancel = () => {
      drag = null;
    };
  }
  async function load(file) {
    if (file === current) return pending;
    remember();
    current = file;
    image = null;
    preview = null;
    viewport.replaceChildren();
    const rev = ++revision;
    root.hidden = !file;
    if (!file) return;
    info.textContent = '正在加载裁剪预览…';
    pending = (async () => {
      try {
        const value = await readImage(file);
        if (rev !== revision) return;
        image = value;
        const factor = Math.min(1, 640 / image.width, 400 / image.height);
        background = new OffscreenCanvas(
          Math.max(1, Math.round(image.width * factor)),
          Math.max(1, Math.round(image.height * factor)),
        );
        const original = canvas(image);
        background.getContext('2d').drawImage(original, 0, 0, background.width, background.height);
        preview = element('canvas', {
          attrs: {
            width: background.width,
            height: background.height,
            'aria-label': '裁剪图片预览',
          },
        });
        preview.style.maxWidth = 'none';
        preview.style.touchAction = 'none';
        preview.style.cursor = 'crosshair';
        viewport.append(preview);
        bind();
        const old = drafts.get(file);
        aspect.control.value = old?.aspect || 'free';
        zoom.control.value = old?.zoom || '100';
        if (old) setRect(old);
        else centered();
      } catch (error) {
        if (rev === revision) {
          info.textContent = error.message;
          updateStatus(ui.status, error.message, 'error');
        }
      }
    })();
    return pending;
  }
  return {
    root,
    load,
    async selection(file) {
      await load(file);
      if (file !== current || !image) throw Error('图片尚未成功加载。');
      return rect();
    },
  };
}
