// SGF decoding belongs to the pinned Sabaki parser. This adapter owns the
// bounded replay model, setup stones, captures and annotations, not an AI solver.
export const GO_LIMITS = {bytes: 512 * 1024, nodes: 2000, depth: 600, size: 25};
const point = (value, size, pass = false) => {
  if (pass && (value === '' || value === 'tt' && size <= 19)) return null;
  if (!/^[a-y]{2}$/.test(value)) throw Error('棋谱坐标格式无效。');
  const x = value.charCodeAt(0) - 97, y = value.charCodeAt(1) - 97;
  if (x >= size || y >= size) throw Error('棋谱坐标超出棋盘。');
  return y * size + x;
};
export function goCoordinate(index, size) {
  return index === null ? '停一手' : 'ABCDEFGHJKLMNOPQRSTUVWXYZ'[index % size] + (size - Math.floor(index / size));
}
const neighbors = (p, size) => [p % size > 0 ? p - 1 : -1, p % size < size - 1 ? p + 1 : -1, p >= size ? p - size : -1, p < size * (size - 1) ? p + size : -1].filter(n => n >= 0);
function group(board, start, size) {
  const stones = new Set([start]), liberties = new Set(), pending = [start];
  while (pending.length) for (const p of neighbors(pending.pop(), size)) {
    if (!board[p]) liberties.add(p);
    else if (board[p] === board[start] && !stones.has(p)) {stones.add(p); pending.push(p);}
  }
  return {stones, liberties};
}
function setupPoints(values, size) {
  // SGF compressed rectangles can repeat the whole board thousands of times
  // in a small file. A point set bounds expansion to the actual board area.
  const out = new Set();
  for (const value of values || []) {
    const pair = value.split(':');
    if (pair.length === 1) out.add(point(value, size));
    else if (pair.length === 2) {
      const a = point(pair[0], size), b = point(pair[1], size), ax = a % size, ay = Math.floor(a / size), bx = b % size, by = Math.floor(b / size);
      if (ax > bx || ay > by) throw Error('棋谱矩形坐标顺序无效。');
      for (let y = ay; y <= by; y++) for (let x = ax; x <= bx; x++) out.add(y * size + x);
    } else throw Error('棋谱设置坐标无效。');
  }
  return out;
}
function advance(props, parent, size) {
  const board = parent ? parent.board.slice() : new Uint8Array(size * size);
  let black = parent?.black || 0, white = parent?.white || 0, ply = parent?.ply || 0, turn = parent?.turn || 1, last = null, color = 0;
  const setup = ['AB', 'AW', 'AE'].some(k => props[k]?.length);
  let koBoard = setup ? null : parent?.koBoard || null;
  if (setup && (props.B || props.W)) throw Error('同一节点不能同时设置棋子和落子。');
  for (const p of setupPoints(props.AE, size)) board[p] = 0;
  const placed = new Set();
  for (const [key, c] of [['AB', 1], ['AW', 2]]) for (const p of setupPoints(props[key], size)) {
    if (placed.has(p) && board[p] !== c) throw Error('黑白设置棋子重叠。');
    board[p] = c; placed.add(p);
  }
  if (props.B && props.W) throw Error('同一节点不能同时记录黑白两手。');
  for (const [key, c] of [['B', 1], ['W', 2]]) if (props[key]) {
    if (props[key].length !== 1) throw Error('每个落子节点应只有一个坐标。');
    color = c; last = point(props[key][0], size, true); ply++; turn = 3 - c;
    if (last !== null) {
      if (board[last]) throw Error('棋谱在已有棋子的交叉点落子。');
      board[last] = c;
      for (const p of neighbors(last, size)) if (board[p] === 3 - c) {
        const captured = group(board, p, size);
        if (!captured.liberties.size) {for (const n of captured.stones) board[n] = 0; if (c === 1) black += captured.stones.size; else white += captured.stones.size;}
      }
      if (!group(board, last, size).liberties.size) throw Error('棋谱包含自杀落子；本工具使用禁止自杀的基础规则。');
      if (koBoard && board.every((v, i) => v === koBoard[i])) throw Error('棋谱包含立即劫争回提。');
    }
    // An annotation node is not a turn. Only an actual move/pass or a setup
    // resets the simple-ko history, so comments cannot enable an illegal retake.
    koBoard = last === null ? null : parent?.board || null;
  }
  if (props.PL?.[0]) {if (!['B', 'W'].includes(props.PL[0])) throw Error('行棋方标记无效。'); turn = props.PL[0] === 'B' ? 1 : 2;}
  const marks = [];
  for (const type of ['TR', 'SQ', 'CR', 'MA', 'SL']) for (const p of setupPoints(props[type], size)) marks.push({point: p, type});
  for (const value of props.LB || []) {
    const split = value.indexOf(':'); if (split !== 2) throw Error('棋谱标签坐标无效。');
    marks.push({point: point(value.slice(0, split), size), type: 'LB', text: value.slice(split + 1, split + 65)});
  }
  return {board, black, white, ply, turn, last, color, marks, koBoard};
}
export function compileGo(text, parser) {
  if (!text.trim()) throw Error('请粘贴或选择 SGF 棋谱。');
  if (new TextEncoder().encode(text).length > GO_LIMITS.bytes) throw Error('SGF 棋谱最多 512 KB。');
  // Bound nesting before invoking the recursive upstream parser; escaped SGF
  // property values may contain brackets and parentheses without being syntax.
  let depth = 0, inValue = false, escaped = false, count = 0;
  for (const c of text) {
    if (escaped) {escaped = false; continue;}
    if (c === '\\' && inValue) {escaped = true; continue;}
    if (inValue) {if (c === ']') inValue = false; continue;}
    if (c === '[') inValue = true;
    else if (c === '(' && ++depth > GO_LIMITS.depth) throw Error('棋谱分支嵌套过深。');
    else if (c === ')' && --depth < 0) throw Error('棋谱括号不匹配。');
    else if (c === ';' && ++count > GO_LIMITS.nodes) throw Error('棋谱最多 2,000 个节点。');
  }
  if (depth || inValue || escaped || !count) throw Error('SGF 棋谱不完整。');
  let sequence = 0, trees;
  try {trees = parser.parse(text, {getId: () => String(sequence++)});} catch {throw Error('无法解析 SGF，请检查棋谱格式。');}
  if (!trees.length || trees.length > 32) throw Error('棋谱合集最多 32 局。');
  let total = 0;
  return trees.map((root, gameIndex) => {
    const meta = root.data;
    if (meta.GM && meta.GM[0] !== '1') throw Error('SGF 中记录的不是围棋。');
    const sizeText = meta.SZ?.[0] || '19';
    if (!/^\d+$/.test(sizeText) || Number(sizeText) < 2 || Number(sizeText) > GO_LIMITS.size) throw Error('支持 2–25 路正方形围棋棋盘。');
    if (meta.CA && !/^(UTF-?8|US-ASCII)$/i.test(meta.CA[0])) throw Error('请将棋谱转换为 UTF-8 后导入。');
    const size = Number(sizeText), nodes = {}, todo = [[root, null, 0]];
    while (todo.length) {
      const [raw, parentId, level] = todo.pop();
      if (++total > GO_LIMITS.nodes || level > GO_LIMITS.depth) throw Error('棋谱节点或层级超过限制。');
      const id = String(raw.id), state = advance(raw.data, nodes[parentId], size);
      nodes[id] = {id, parent: parentId, children: raw.children.map(n => String(n.id)), ...state, comment: raw.data.C?.join('\n') || '', name: raw.data.N?.[0] || ''};
      for (const child of [...raw.children].reverse()) todo.push([child, id, level + 1]);
    }
    const fields = [['棋盘', size + ' 路'], ['黑方', meta.PB?.[0] || '未记录'], ['白方', meta.PW?.[0] || '未记录'], ['日期', meta.DT?.[0] || '未记录'], ['赛事', meta.EV?.[0] || '未记录'], ['结果', meta.RE?.[0] || '未记录'], ['贴目', meta.KM?.[0] || '未记录'], ['规则（棋谱原文）', meta.RU?.[0] || '未记录']];
    return {id: gameIndex, title: meta.GN?.[0] || `${meta.PB?.[0] || '黑方'} — ${meta.PW?.[0] || '白方'}`, size, root: String(root.id), nodes, fields};
  });
}
