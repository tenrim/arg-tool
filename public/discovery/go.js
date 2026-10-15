import {Box, Button, Card, DataList, EmptyState, Field, FilePicker, Input, Option, Select, SplitView, Status, Textarea, Toolbar, onDisconnect, setState, setTextareaValue, updateStatus} from '../ui/index.js';
import {mount, download, copy} from '../round1/common.js';
import {goCoordinate, GO_LIMITS} from './go-core.js';
const ns = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}, text) => {const node = document.createElementNS(ns, tag); for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value); if (text !== undefined) node.textContent = text; return node;};
export function drawGoBoard(game, state, flipped = false) {
  const size = game.size, edge = 1, extent = size + 1;
  const root = svg('svg', {width:720,height:720,viewBox: `0 0 ${extent} ${extent}`, class: 'go-board', role: 'img', 'aria-label': `${size} 路围棋棋盘，第 ${state.ply} 手，黑方提子 ${state.black}，白方提子 ${state.white}`});
  root.append(svg('rect', {x: 0, y: 0, width: extent, height: extent, fill: '#c6a46c', rx: '.15'}));
  const xy = p => {const x = p % size, y = Math.floor(p / size); return flipped ? [edge + size - 1 - x, edge + size - 1 - y] : [edge + x, edge + y];};
  for (let i = 0; i < size; i++) {
    root.append(svg('path', {d: `M${edge} ${edge + i}H${size}M${edge + i} ${edge}V${size}`, stroke: '#3e3528', 'stroke-width': '.025'}));
    const axis={'font-size':'.34','text-anchor':'middle',fill:'#342c20'};
    const xLabel = svg('text', {...axis,x: edge + i, y: '.5', class: 'go-axis'}), yLabel = svg('text', {...axis,x: '.4', y: edge + i + .12, class: 'go-axis'});
    xLabel.textContent = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'[flipped ? size - 1 - i : i]; yLabel.textContent = String(flipped ? i + 1 : size - i); root.append(xLabel, yLabel);
  }
  if ([9, 13, 19].includes(size)) {
    const offset = size === 9 ? 2 : 3, spots = size === 9 ? [[2, 2], [6, 2], [4, 4], [2, 6], [6, 6]] : [offset, (size - 1) / 2, size - 1 - offset].flatMap(x => [offset, (size - 1) / 2, size - 1 - offset].map(y => [x, y]));
    for (const [x, y] of spots) root.append(svg('circle', {cx: edge + x, cy: edge + y, r: '.07', fill: '#3e3528'}));
  }
  state.board.forEach((color, p) => {
    if (!color) return; const [x, y] = xy(p), stone = svg('circle', {cx: x, cy: y, r: '.45', fill: color === 1 ? '#10131b' : '#f1f1ec', stroke: color === 1 ? '#080b10' : '#b9b9ae', 'stroke-width': '.04', 'data-point': goCoordinate(p, size), 'data-color': color});
    stone.append(svg('title', {}, `${color === 1 ? '黑' : '白'} ${goCoordinate(p, size)}`)); root.append(stone);
  });
  if (state.last !== null) {const [cx, cy] = xy(state.last); root.append(svg('circle', {cx, cy, r: '.15', fill: 'none', stroke: '#e7a719', 'stroke-width': '.09', class: 'go-last'}));}
  for (const mark of state.marks) {
    const [x, y] = xy(mark.point), stroke = state.board[mark.point] === 1 ? '#f6f6ef' : '#193044', common = {fill: 'none', stroke, 'stroke-width': '.07'};
    if (mark.type === 'LB') root.append(svg('text', {x, y: y + .12, class: 'go-label', fill: stroke,'font-size':'.36','text-anchor':'middle'}, mark.text));
    else if (mark.type === 'CR') root.append(svg('circle', {...common, cx: x, cy: y, r: '.24'}));
    else if (mark.type === 'TR') root.append(svg('path', {...common, d: `M${x} ${y - .27}l.26 .45h-.52Z`}));
    else if (mark.type === 'MA') root.append(svg('path', {...common, d: `M${x - .2} ${y - .2}l.4 .4m0-.4-.4 .4`}));
    else root.append(svg('rect', {...common, x: x - .22, y: y - .22, width: '.44', height: '.44'}));
  }
  return root;
}
export function initGo() {
  const input = Textarea({id: 'go-input', autoSize: true, minRows: 4, maxRows: 10, attrs: {maxlength: GO_LIMITS.bytes, spellcheck: 'false', placeholder: '(;GM[1]FF[4]CA[UTF-8]SZ[19];B[pd];W[dd])'}});
  const file = Input({id: 'go-file', type: 'file', attrs: {accept: '.sgf,.txt,text/plain'}});
  const load = Button({id: 'go-load', text: '载入棋谱', variant: 'primary'}), stop = Button({id: 'go-stop', text: '停止', attrs: {disabled: true}});
  const clear = Button({id: 'go-clear', text: '清空棋谱'}), message = Status({id: 'go-status'});
  const gameSelect = Select({id: 'go-game', attrs: {'aria-label': '选择棋谱合集中的对局', disabled: true}});
  const branch = Select({id: 'go-branch', attrs: {'aria-label': '选择下一节点或棋谱分支', disabled: true}});
  const board = Box({id: 'go-board', className: 'go-board-host'}), readout = Status({id: 'go-position'}), notes = Box({id: 'go-comment'}), info = Box({id: 'go-info'}), moves = Toolbar({id: 'go-moves'});
  const nav = [['first', '回到起点'], ['prev', '上一步'], ['next', '下一步'], ['last', '到分支末尾']].map(([id, text]) => Button({id: 'go-' + id, text, attrs: {disabled: true}}));
  const slider = Input({id: 'go-step', type: 'range', attrs: {min: '0', max: '0', value: '0', 'aria-label': '复盘节点位置', disabled: true}});
  const flip = Button({id: 'go-flip', text: '翻转棋盘', attrs: {disabled: true}}), save = Button({id: 'go-save', text: '下载 SGF', attrs: {disabled: true}}), image = Button({id: 'go-image', text: '下载当前棋盘', attrs: {disabled: true}}), clipboard = Button({id: 'go-copy', text: '复制 SGF', attrs: {disabled: true}});
  const panel = mount('go', '围棋棋谱复盘', '', [['Sabaki SGF', 'https://github.com/SabakiHQ/sgf', '本地 SGF 解析'], ['doken', 'https://github.com/yishn/doken', 'SGF 词法解析依赖']]);
  panel.insertBefore(Box({children: [
    Card({title: 'SGF 棋谱', children: [Field({label: '棋谱内容', control: input}), Toolbar({children: [load, stop, clear, FilePicker({tag: 'div', input: file, triggerLabel: '选择 SGF 文件'})]}), message]}),
    SplitView({className: 'go-layout', minPaneWidth: '360px', children: [
      Card({title: '棋盘', children: [gameSelect, board, readout, Toolbar({children: nav}), Field({label: '复盘进度', control: slider}), Field({label: '下一节点／分支', control: branch}), Toolbar({children: [flip, image]})]}),
      Card({title: '棋谱与注释', children: [info, notes, moves, Toolbar({children: [save, clipboard]})]})
    ]})
  ]}), panel.querySelector('.tool-provenance'));
  let games = null, game = null, current = null, source = '', flipped = false, worker = null, timer = null, version = 0, reading = false;
  const choices = new Map();
  const syncBusy = () => {setState(load, {busy: Boolean(worker) || reading, disabled: Boolean(worker) || reading}); stop.disabled = !worker && !reading;};
  function terminate() {worker?.terminate(); worker = null; clearTimeout(timer);}
  function invalidate(text = '棋谱已修改，请重新载入。') {
    version++; terminate(); reading = false; games = game = current = null; source = ''; choices.clear();
    board.replaceChildren(EmptyState({text: '载入 SGF 后显示棋盘'})); info.replaceChildren(); notes.replaceChildren(); moves.replaceChildren(); readout.textContent = '';
    gameSelect.replaceChildren(); branch.replaceChildren(); for (const node of [...nav, slider, flip, save, image, clipboard, gameSelect, branch]) node.disabled = true;
    updateStatus(message, text); syncBusy();
  }
  function line() {
    const ancestors = []; let node = current;
    while (node) {ancestors.unshift(node.id); node = game.nodes[node.parent];}
    node = current;
    while (node.children.length) {node = game.nodes[choices.get(node.id) || node.children[0]]; ancestors.push(node.id);}
    return ancestors;
  }
  function draw() {
    board.replaceChildren(drawGoBoard(game, current, flipped));
    readout.textContent = `第 ${current.ply} 手 · ${current.turn === 1 ? '黑' : '白'}方行棋 · 黑方提子 ${current.black} / 白方提子 ${current.white}`;
    info.replaceChildren(DataList({items: game.fields}));
    notes.replaceChildren(Box({tag: 'h3', text: current.name || '当前注释'}), Box({tag: 'p', className: 'go-comment-text', text: current.comment || '此节点没有注释'}));
    branch.replaceChildren(Option(current.children.length ? '选择下一节点／分支' : '已到分支末尾', ''));
    for (const id of current.children) {const n = game.nodes[id], label = n.color ? `${n.color === 1 ? '黑' : '白'} ${goCoordinate(n.last, game.size)}` : n.name || '注释／设置节点'; branch.append(Option(label + (n.comment ? ' · ' + n.comment.slice(0,40) : ''), id));}
    branch.disabled = !current.children.length; branch.value = '';
    const path = line(), index = path.indexOf(current.id); slider.max = String(path.length - 1); slider.value = String(index); slider.disabled = path.length < 2;
    nav[0].disabled = nav[1].disabled = !current.parent; nav[2].disabled = nav[3].disabled = !current.children.length;
    for (const node of [flip, save, image, clipboard]) node.disabled = false;
    moves.replaceChildren();
    const start = Math.max(0, index - 10);
    for (const id of path.slice(start, start + 24)) {const n = game.nodes[id], text = n.ply + (n.color ? ' · ' + (n.color === 1 ? '黑 ' : '白 ') + goCoordinate(n.last, game.size) : ' · 节点'); moves.append(Button({text, attrs: {'data-node': id, 'aria-pressed': String(id === current.id)}, on: {click: () => jump(id)}}));}
  }
  function jump(id) {if (!game?.nodes[id]) return; current = game.nodes[id]; draw();}
  function compile(text) {
    invalidate('正在解析本地棋谱…'); const revision = version;
    const fail = error => {if (revision !== version) return; terminate(); updateStatus(message, error, 'error'); syncBusy();};
    try {
      worker = new Worker(new URL('./go-worker.js', import.meta.url)); syncBusy(); timer = setTimeout(() => fail('棋谱解析超过 30 秒，已停止。'), 30000);
      worker.onerror = e => {e.preventDefault(); fail('围棋组件执行失败，请重试。');};
      worker.onmessage = ({data}) => {
        if (revision !== version) return; if (data.error) {fail(data.error); return;} terminate();
        games = data.games; game = games[0]; current = game.nodes[game.root]; source = text;
        gameSelect.replaceChildren(...games.map(g => Option(g.title, String(g.id)))); gameSelect.disabled = games.length < 2;
        updateStatus(message, `已载入 ${games.length} 局棋谱`, 'success'); draw(); syncBusy();
      };
      worker.postMessage({text, resourceBase: new URL('../', import.meta.url).href});
    } catch {fail('无法启动围棋解析组件，请重试。');}
  }
  load.onclick = () => compile(input.value); stop.onclick = () => invalidate('已停止，输入保留。'); clear.onclick = () => {setTextareaValue(input, ''); file.value = ''; invalidate('棋谱已清空。');};
  input.addEventListener('input', () => invalidate());
  file.onchange = async () => {
    invalidate('正在读取棋谱…'); const selected = file.files[0], revision = version; if (!selected) return; reading = true; syncBusy();
    try {if (selected.size > GO_LIMITS.bytes) throw Error('SGF 棋谱最多 512 KB。'); const bytes = await selected.arrayBuffer(); const text = new TextDecoder('utf-8', {fatal: true}).decode(bytes); if (revision !== version) return; setTextareaValue(input, text); reading = false; compile(text);}
    catch (error) {if (revision === version) updateStatus(message, error instanceof TypeError ? '文件不是有效的 UTF-8 棋谱，请先转换编码。' : error.message, 'error');}
    finally {if (revision === version) {reading = false; syncBusy();} file.value = '';}
  };
  gameSelect.onchange = () => {game = games[Number(gameSelect.value)]; current = game.nodes[game.root]; choices.clear(); draw();};
  branch.onchange = () => {if (branch.value) {choices.set(current.id, branch.value); jump(branch.value);}};
  nav[0].onclick = () => jump(game.root); nav[1].onclick = () => jump(current.parent); nav[2].onclick = () => jump(choices.get(current.id) || current.children[0]);
  nav[3].onclick = () => {const path = line(); jump(path.at(-1));}; slider.oninput = () => jump(line()[Number(slider.value)]);
  flip.onclick = () => {flipped = !flipped; draw();}; save.onclick = () => download(source, '围棋棋谱.sgf'); image.onclick = () => download(new XMLSerializer().serializeToString(board.firstElementChild), '围棋棋盘.svg', 'image/svg+xml');
  clipboard.onclick = async () => {try {await copy(source); updateStatus(message, '已复制棋谱', 'success');} catch (error) {updateStatus(message, error.message, 'error');}};
  const leave = event => {if (event.detail.name !== 'go' && (worker || reading)) invalidate('已停止，输入保留。');}; document.addEventListener('arg:panelchange', leave);
  onDisconnect(panel, () => {version++; terminate(); document.removeEventListener('arg:panelchange', leave);}); invalidate('');
}
