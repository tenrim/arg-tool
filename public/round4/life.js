import {render as uiRender} from '../ui/index.js';
import { LifeUniverse } from "../vendor/round4/life.js";
import {
  $,
  box,
  row,
  field,
  area,
  button,
  number,
  setStatus,
  download,
  watchSize,
  finite,
} from "./common.js";
export function parseRLE(text) {
  if (text.length > 200000) throw Error("RLE 最多 200 KB。");
  const lines = text.split(/\r?\n/).filter((s) => !s.trim().startsWith("#"));
  const header = lines.shift() || "",
    m = header.match(
      /^\s*x\s*=\s*(\d+)\s*,\s*y\s*=\s*(\d+)(?:\s*,\s*rule\s*=\s*([^\s]+))?\s*$/i,
    );
  if (!m || +m[1] > 128 || +m[2] > 128 || +m[1] < 1 || +m[2] < 1)
    throw Error("RLE 需要 x/y 表头，尺寸为 1–128。");
  if (m[3] && !/^B3\/S23$/i.test(m[3]) && !/^23\/3$/.test(m[3]))
    throw Error("当前仅支持 Conway B3/S23 规则。");
  const body = lines.join("").replace(/\s/g, ""),
    cells = [];
  let x = 0,
    y = 0,
    count = "",
    ended = false;
  for (const c of body) {
    if (ended) throw Error("RLE 结束符后存在多余内容。");
    if (/\d/.test(c)) {
      count += c;
      if (count.length > 4) throw Error("RLE 计数过大。");
      continue;
    }
    const n = count ? +count : 1;
    count = "";
    if (n < 1 || n > 128) throw Error("RLE 计数无效。");
    if (c === "b" || c === "o") {
      if (x + n > +m[1] || y >= +m[2]) throw Error("RLE 图案超出声明尺寸。");
      if (c === "o") for (let i = 0; i < n; i++) cells.push([x + i, y]);
      x += n;
    } else if (c === "$") {
      y += n;
      x = 0;
    } else if (c === "!") ended = true;
    else throw Error("RLE 存在无效符号。");
  }
  if (!ended || count) throw Error("RLE 缺少结束符 !。");
  return { width: +m[1], height: +m[2], cells };
}
export function init(root) {
  uiRender(root, box(
      row(
        button("life-step", "演化一代", true) +
          button("life-play", "连续运行") +
          button("life-clear", "清空") +
          field("每秒代数", number("life-speed", 6, 1, 30, 1)) +
          field("显示格数", number("life-size", 48, 16, 128, 1)) +
          button("life-resize", "调整视窗"),
      ) +
        '<div id="life-view" class="r4-view"><canvas id="life-canvas" aria-label="生命游戏网格"></canvas></div><p id="life-info"></p>',
    ) +
    box(
      field(
        "RLE 图案（B3/S23）",
        area("life-rle", "x = 3, y = 3, rule = B3/S23\nbo$2bo$3o!", 4),
      ) +
        row(
          button("life-load", "导入 RLE") +
            button("life-export", "导出可见区域 RLE"),
        ),
    ));
  let universe = new LifeUniverse(),
    size = 48,
    timer = null,
    paint = null,
    last = "",
    steps = 0;
  const canvas = $("life-canvas"),
    ctx = canvas.getContext("2d");
  function stop() {
    clearTimeout(timer);
    timer = null;
    $("life-play").textContent = "连续运行";
  }
  function draw() {
    const dpr = Math.min(devicePixelRatio || 1, 2),
      w = $("life-view").clientWidth,
      h = $("life-view").clientHeight;
    if (!w || !h) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#0b111b";
    ctx.fillRect(0, 0, w, h);
    const cell = Math.min(w, h) / size,
      left = (w - cell * size) / 2,
      top = (h - cell * size) / 2;
    ctx.fillStyle = "#f0bd63";
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++)
        if (
          universe.get_bit(x - Math.floor(size / 2), y - Math.floor(size / 2))
        )
          ctx.fillRect(
            left + x * cell,
            top + y * cell,
            Math.max(1, cell - 1),
            Math.max(1, cell - 1),
          );
    ctx.strokeStyle = "#233344";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 0; i <= size; i++) {
      ctx.moveTo(left + i * cell, top);
      ctx.lineTo(left + i * cell, top + size * cell);
      ctx.moveTo(left, top + i * cell);
      ctx.lineTo(left + size * cell, top + i * cell);
    }
    ctx.stroke();
    $("life-info").textContent =
      `第 ${universe.generation} 代 · 总存活 ${universe.root.population} · 视窗 ${size} × ${size}`;
  }
  function step() {
    if (universe.root.population > 100000 || steps >= 100000) {
      stop();
      throw Error("已达到本轮运行限制，请清空或导入图案后继续。");
    }
    universe.next_generation(true);
    steps++;
    draw();
  }
  function safe(fn) {
    return () => {
      try {
        fn();
      } catch (e) {
        stop();
        setStatus("life-status", e.message, true);
      }
    };
  }
  $("life-step").onclick = safe(() => {
    stop();
    step();
  });
  function tick() {
    try {
      step();
      timer = setTimeout(tick, 1000 / finite($("life-speed").value, 1, 30));
    } catch (e) {
      stop();
      setStatus("life-status", e.message, true);
    }
  }
  $("life-play").onclick = safe(() => {
    if (timer) {
      stop();
      return;
    }
    finite($("life-speed").value, 1, 30);
    $("life-play").textContent = "暂停";
    timer = setTimeout(tick, 0);
  });
  $("life-clear").onclick = () => {
    stop();
    universe = new LifeUniverse();
    steps = 0;
    draw();
  };
  $("life-resize").onclick = safe(() => {
    size = Math.round(finite($("life-size").value, 16, 128));
    draw();
  });
  function cellAt(e) {
    const r = canvas.getBoundingClientRect(),
      c = Math.min(r.width, r.height) / size,
      x = Math.floor((e.clientX - r.left - (r.width - c * size) / 2) / c),
      y = Math.floor((e.clientY - r.top - (r.height - c * size) / 2) / c);
    return x >= 0 && y >= 0 && x < size && y < size
      ? [x - Math.floor(size / 2), y - Math.floor(size / 2)]
      : null;
  }
  canvas.onpointerdown = (e) => {
    stop();
    const p = cellAt(e);
    if (!p) return;
    paint = !universe.get_bit(...p);
    last = p.join();
    universe.set_bit(...p, paint);
    canvas.setPointerCapture(e.pointerId);
    draw();
  };
  canvas.onpointermove = (e) => {
    if (paint === null) return;
    const p = cellAt(e);
    if (p && p.join() !== last) {
      last = p.join();
      universe.set_bit(...p, paint);
      draw();
    }
  };
  canvas.onpointerup = canvas.onpointercancel = () => {
    paint = null;
  };
  $("life-load").onclick = safe(() => {
    const p = parseRLE($("life-rle").value),
      next = new LifeUniverse();
    for (const [x, y] of p.cells)
      next.set_bit(
        x - Math.floor(p.width / 2),
        y - Math.floor(p.height / 2),
        true,
      );
    stop();
    universe = next;
    steps = 0;
    size = Math.max(16, Math.min(128, Math.max(p.width, p.height) + 8));
    $("life-size").value = size;
    draw();
    setStatus("life-status", `已导入 ${p.cells.length} 个细胞。`);
  });
  $("life-export").onclick = () => {
    const rows = [];
    for (let y = 0; y < size; y++) {
      let line = "",
        last = null,
        n = 0;
      for (let x = 0; x < size; x++) {
        const c = universe.get_bit(
          x - Math.floor(size / 2),
          y - Math.floor(size / 2),
        )
          ? "o"
          : "b";
        if (c === last) n++;
        else {
          if (last) line += (n > 1 ? n : "") + last;
          last = c;
          n = 1;
        }
      }
      line += (n > 1 ? n : "") + last;
      rows.push(line);
    }
    const out = `x = ${size}, y = ${size}, rule = B3/S23\n${rows.join("$")}!`;
    download(out, "生命游戏-可见区域.rle");
  };
  watchSize($("life-view"), draw);
  document.addEventListener("arg:panelchange", (e) => {
    if (e.detail.name !== "life") stop();
    else draw();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  draw();
  setStatus(
    "life-status",
    "Conway 规则：有 3 个邻居时出生，有 2 或 3 个邻居时存活。",
  );
}
