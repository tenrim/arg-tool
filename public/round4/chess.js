import {render as uiRender, element as uiElement} from '../ui/index.js';
import { Chess } from "../vendor/round4/chess.js";
import {
  $,
  box,
  row,
  field,
  area,
  button,
  select,
  setStatus,
  download,
  textFile,
} from "./common.js";
import {resultRecording} from '../result-recording.js';
export function init(root) {
  uiRender(root, box(
      field(
        "国际象棋 PGN 棋谱或 FEN 局面",
        area(
          "chess-input",
          "粘贴 PGN，例如 1. e4 e5 2. Nf3 Nc6；也可粘贴 FEN",
          4,
        ),
      ) +
        row(
          select("chess-format", [
            ["pgn", "PGN 棋谱"],
            ["fen", "FEN 局面"],
          ]) +
            button("chess-load", "载入棋谱", true) +
            field(
              "打开本地棋谱",
              '<input id="chess-file" type="file" accept=".pgn,.fen,.txt">',
            ),
        ),
    ) +
    `<div class="r4-grid">${box(
      '<div id="chess-board" class="r4-chess" role="group" aria-label="国际象棋棋盘"></div>' +
        row(
          button("chess-first", "回到起点") +
            button("chess-prev", "上一步") +
            button("chess-next", "下一步") +
            button("chess-last", "到最后"),
        ) +
        row(
          button("chess-flip", "翻转棋盘") +
            select("chess-promotion", [
              ["q", "升变为后"],
              ["r", "升变为车"],
              ["b", "升变为象"],
              ["n", "升变为马"],
            ]),
        ),
    )}${box('<p id="chess-turn"></p><div id="chess-moves" class="r4-moves"></div>' + field("当前 FEN（可选中复制）", '<textarea id="chess-fen" readonly rows="3"></textarea>') + row(button("chess-save", "下载当前 FEN") + button("chess-pgn", "下载棋谱")) + '')}</div>`);
  const recording=resultRecording({id:'chess-result',anchor:$('chess-save').parentElement,onLeave:()=>{fileToken++;}});
  let start = new Chess().fen(),
    moves = [],
    pos = 0,
    game = new Chess(),
    flipped = false,
    selected = null;
  const glyph = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" },
    names = { p: "兵", n: "马", b: "象", r: "车", q: "后", k: "王" };
  function draw() {
    game = new Chess(start);
    for (let i = 0; i < pos; i++) game.move(moves[i]);
    $("chess-board").replaceChildren();
    const files = flipped ? "hgfedcba" : "abcdefgh",
      ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
    for (const r of ranks)
      for (const f of files) {
        const sq = f + r,
          p = game.get(sq),
          b = uiElement("button");
        b.textContent = p ? (p.color === "w" ? {p:"♙",n:"♘",b:"♗",r:"♖",q:"♕",k:"♔"}[p.type] : glyph[p.type]) + "\uFE0E" : "";
        b.dataset.square = sq;
        b.dataset.color = p?.color || "";
        b.classList.toggle("selected", selected === sq);
        b.setAttribute(
          "aria-label",
          sq +
            (p
              ? " " + (p.color === "w" ? "白" : "黑") + names[p.type]
              : " 空格"),
        );
        const label = uiElement("small");
        label.textContent = sq;
        b.append(label);
        b.onclick = () => move(sq);
        $("chess-board").append(b);
      }
    $("chess-fen").value = game.fen();
    const all=new Chess(start);moves.forEach(move=>all.move(move));recording.publish({text:JSON.stringify({start,moves:[...moves],position:pos,fen:game.fen(),pgn:all.pgn()},null,2),name:'棋谱复盘.json'});
    $("chess-turn").textContent =
      `第 ${pos} / ${moves.length} 半回合 · ${game.turn() === "w" ? "白" : "黑"}方行棋` +
      (game.isCheckmate()
        ? " · 将死"
        : game.isDraw()
          ? " · 和棋"
          : game.isCheck()
            ? " · 将军"
            : "");
    $("chess-moves").replaceChildren();
    moves.forEach((m, i) => {
      const b = uiElement("button");
      b.className = "secondary-button";
      b.textContent = `${i + 1}. ${m}`;
      b.setAttribute("aria-current", String(i === pos - 1));
      b.onclick = () => {
        pos = i + 1;
        selected = null;
        draw();
      };
      $("chess-moves").append(b);
    });
    $("chess-prev").disabled = $("chess-first").disabled = pos === 0;
    $("chess-next").disabled = $("chess-last").disabled = pos === moves.length;
  }
  function move(sq) {
    if (game.get(sq)?.color === game.turn()) {
      selected = sq;
      draw();
      return;
    }
    if (!selected) return;
    try {
      const m = game.move({
        from: selected,
        to: sq,
        promotion: $("chess-promotion").value,
      });
      moves = moves.slice(0, pos);
      moves.push(m.san);
      pos++;
      selected = null;
      draw();
      setStatus("chess-status", "已走棋。");
    } catch {
      selected = null;
      draw();
      setStatus("chess-status", "这一步不符合国际象棋规则，请重新选择。", true);
    }
  }
  $("chess-load").onclick = () => {
    try {
      const input = $("chess-input").value.trim();
      if (!input) throw Error("请粘贴棋谱或局面。");
      if (input.length > 100000) throw Error("棋谱过长，最多 100 KB。");
      const next = new Chess();
      let newStart, newMoves;
      if ($("chess-format").value === "fen") {
        next.load(input);
        newStart = next.fen();
        newMoves = [];
      } else {
        next.loadPgn(input, { strict: false });
        newMoves = next.history();
        if (newMoves.length > 2000) throw Error("最多 2000 半回合。");
        while (next.undo());
        newStart = next.fen();
      }
      start = newStart;
      moves = newMoves;
      pos = 0;
      selected = null;
      draw();
      setStatus("chess-status", `已载入 ${moves.length} 半回合。`);
    } catch (e) {
      setStatus("chess-status", "棋谱无效，请检查格式。" + e.message, true);
    }
  };
  let fileToken = 0;
  $("chess-input").oninput = () => {recording.clear();fileToken++;};
  $("chess-file").onchange = async () => {
    recording.clear();const token = ++fileToken;
    try {
      const f = $("chess-file").files[0],
        text = await textFile(f, 0.1 * 1024 * 1024);
      if (token !== fileToken) return;
      $("chess-input").value = text;
      $("chess-format").value = /\.fen$/i.test(f.name) ? "fen" : "pgn";
      $("chess-load").click();
    } catch (e) {
      if (token === fileToken) setStatus("chess-status", e.message, true);
    }
  };
  for (const [id, value] of [
    ["first", () => 0],
    ["prev", () => Math.max(0, pos - 1)],
    ["next", () => Math.min(moves.length, pos + 1)],
    ["last", () => moves.length],
  ])
    $("chess-" + id).onclick = () => {
      pos = value();
      selected = null;
      draw();
    };
  $("chess-flip").onclick = () => {
    flipped = !flipped;
    draw();
  };
  $("chess-save").onclick = () => download(game.fen(), "局面.fen");
  $("chess-pgn").onclick = () => {
    const all = new Chess(start);
    moves.forEach((m) => all.move(m));
    download(all.pgn(), "棋谱.pgn");
  };
  draw();
  setStatus("chess-status", "可载入棋谱，或直接在初始棋盘走棋。");
}
