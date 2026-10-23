import {Box, Card, Toolbar, FormGrid, SplitView, Field, Input, Textarea, Select, Option, Button, FilePicker, Status, DataList, Table, EmptyState, onDisconnect, setState, setTextareaValue, updateStatus} from '../ui/index.js';
import {mount, download, copy} from '../round1/common.js';

import {resultRecording} from '../result-recording.js';
const templates = {
  flip: {name: '二进制取反', input: '00101', rules: "blank: '_'\nstart state: flip\ntable:\n  flip:\n    '0': {write: '1', R}\n    '1': {write: '0', R}\n    '_': {S: done}\n  done:\n"},
  unary: {name: '一元数加一', input: '111', rules: "blank: ' '\nstart state: scan\ntable:\n  scan:\n    '1': R\n    ' ': {write: '1', L: done}\n  done:\n"},
  increment: {name: '二进制加一', input: '111', rules: "blank: '_'\nstart state: seek\ntable:\n  seek:\n    [0,1]: R\n    '_': {L: carry}\n  carry:\n    '1': {write: '0', L}\n    '0': {write: '1', S: done}\n    '_': {write: '1', S: done}\n  done:\n"}
};
const symbol = value => value === ' ' ? '␣' : value === '\n' ? '↵' : value === '\t' ? '⇥' : value;
const direction = value => ({L: '左移', R: '右移', S: '停留'}[value]);
const svg = (tag, attrs = {}, text) => {const node = document.createElementNS('http://www.w3.org/2000/svg', tag);for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));if (text !== undefined) node.textContent = text;return node;};

// Focused graph: every edge represents actual compiled transitions. The bounded
// neighbourhood stays readable on phones; selecting a node only changes view.
function stateGraph(definition, snapshot, selected, choose) {
  const state = selected || snapshot.state;
  const rules = definition.transitions.filter(rule => rule.from === state);
  const groups = new Map();
  for (const rule of rules) {if (!groups.has(rule.to)) groups.set(rule.to, []);groups.get(rule.to).push(rule);}
  const targets = [...groups.keys()].filter(target => target !== state), height = Math.max(200, targets.length * 88 + 56);
  const graph = svg('svg', {viewBox: `0 0 620 ${height}`, width: 620, height, role: 'group', 'aria-label': `状态 ${state} 的转移图`, class: 'turing-state-svg'});
  function node(name, x, y) {
    const group = svg('g', {'data-state': name, 'data-current': String(name === snapshot.state), tabindex: 0, role: 'button', 'aria-label': `查看状态 ${name}`});
    group.append(svg('rect', {x: x - 72, y: y - 24, width: 144, height: 48, rx: 12, class: 'turing-state-node'}));
    const title = svg('title', {}, name), label = svg('text', {x, y: y + 5, 'text-anchor': 'middle', class: 'turing-state-label'}, [...name].length > 15 ? [...name].slice(0, 14).join('') + '…' : name);
    group.append(title, label);group.onclick = () => choose(name);group.onkeydown = event => {if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();choose(name);}};
    graph.append(group);
  }
  const cy = height / 2;
  for (const [target, entries] of groups) {
    const index = targets.indexOf(target), y = target === state ? cy : 56 + index * 88;
    const edge = svg('g', {'data-target': target});
    for (const rule of entries) edge.append(svg('path', {'data-rule-id': rule.id, 'data-active': String(rule.id === snapshot.lastRuleId), d: target === state ? `M 110 ${cy - 24} C 20 ${cy - 72} 220 ${cy - 72} 170 ${cy - 24}` : `M 212 ${cy} C 300 ${cy} 340 ${y} 408 ${y}`, class: 'turing-state-edge'}));
    const label = entries.slice(0, 3).map(rule => `${symbol(rule.read)} → ${symbol(rule.write)} · ${direction(rule.move)}`).join(' / ') + (entries.length > 3 ? ` / +${entries.length - 3}` : '');
    edge.append(svg('title', {}, entries.map(rule => `${symbol(rule.read)} → ${symbol(rule.write)} · ${direction(rule.move)}`).join('\n')));
    edge.append(svg('text', {x: target === state ? 142 : 312, y: target === state ? cy - 77 : (cy + y) / 2 - 8, 'text-anchor': 'middle', class: 'turing-edge-label'}, label));
    if (target !== state) edge.append(svg('path', {d: `M399 ${y - 5}l9 5-9 5`, class: 'turing-state-arrow'}));
    graph.append(edge);
  }
  node(state, 140, cy);for (const [index, target] of targets.entries()) node(target, 480, 56 + index * 88);
  return graph;
}

export function initTuring() {
  const example = Select({id: 'turing-example', children: [Option('自定义', 'custom'), ...Object.entries(templates).map(([id, value]) => Option(value.name, id))]});example.value = 'flip';
  const rules = Textarea({id: 'turing-rules', value: templates.flip.rules, autoSize: true, minRows: 8, maxRows: 20, attrs: {spellcheck: 'false', maxlength: 65536, 'aria-label': '图灵机 YAML 规则'}});
  const input = Textarea({id: 'turing-input', value: templates.flip.input, autoSize: true, minRows: 2, maxRows: 5, attrs: {spellcheck: 'false', maxlength: 32768}});
  const head = Input({id: 'turing-head', type: 'number', value: 0, attrs: {min: -65535, max: 65535, step: 1}});
  const file = Input({id: 'turing-file', type: 'file', attrs: {accept: '.yaml,.yml,.json,.txt'}});
  const compile = Button({id: 'turing-compile', text: '载入规则', variant: 'primary'}), save = Button({id: 'turing-export', text: '保存配置'});
  const run = Button({id: 'turing-run', text: '运行', variant: 'primary'}), pause = Button({id: 'turing-pause', text: '暂停'}), step = Button({id: 'turing-step', text: '单步'}), back = Button({id: 'turing-back', text: '回退'}), reset = Button({id: 'turing-reset', text: '重置纸带'});
  const speed = Select({id: 'turing-speed', children: [2, 10, 50, 250, 1000].map(n => Option(n + ' 步／秒', String(n)))});speed.value = '50';
  const limit = Input({id: 'turing-limit', type: 'number', value: 10000, attrs: {min: 1, max: 100000, step: 1}});
  const message = Status({id: 'turing-status'}), tape = Box({id: 'turing-tape', className: 'turing-tape-scroll', attrs: {tabindex: 0, role: 'region', 'aria-label': '纸带，可横向滚动'}});
  const counters = DataList({items: [['当前状态', '—'], ['执行步数', '0'], ['读写头位置', '—'], ['当前符号', '—']]});
  const [currentState, steps, position, read] = counters.querySelectorAll('dd');currentState.id = 'turing-state';steps.id = 'turing-steps';position.id = 'turing-position';
  const output = Textarea({id: 'turing-output', autoSize: true, minRows: 2, maxRows: 8, attrs: {readonly: true, spellcheck: 'false'}}), origin = Box({id: 'turing-origin', tag: 'p'});
  const copyOutput = Button({id: 'turing-copy', text: '复制纸带'}), saveOutput = Button({id: 'turing-save-output', text: '下载纸带'});
  const graphSelect = Select({id: 'turing-graph-state', attrs: {'aria-label': '图示状态'}}), graph = Box({id: 'turing-graph', className: 'turing-graph-scroll', attrs: {tabindex: 0, role: 'region', 'aria-label': '状态转移图，可横向滚动'}}), transitionTable = Box({id: 'turing-transitions', className: 'turing-table-scroll'}), trace = Box({id: 'turing-trace', className: 'turing-table-scroll'});
  const panel = mount('turing', '图灵机', '', [['Turing Machine Viz', 'https://github.com/aepsilon/turing-machine-viz', '规则解析、纸带和状态转移引擎'], ['js-yaml', 'https://github.com/nodeca/js-yaml', '本地 YAML 规则解析']]);panel.dataset.phase = 'empty';
  panel.insertBefore(Box({className: 'turing-workspace', children: [
    SplitView({minPaneWidth: '380px', children: [
      Card({title: '规则与输入', children: [Field({label: '规则模板', control: example}), Field({label: 'YAML 规则', control: rules}), Field({label: '初始纸带', control: input}), Field({label: '初始读写头位置', control: head}), Toolbar({children: [compile, FilePicker({tag: 'div', input: file, triggerLabel: '打开配置'}), save]})]}),
      Card({title: '执行', children: [Toolbar({children: [run, pause, step, back, reset]}), FormGrid({children: [Field({label: '运行速度', control: speed}), Field({label: '本次运行步数上限', control: limit})]}), message, counters, tape, Field({label: '纸带内容', control: output}), origin, Toolbar({children: [copyOutput, saveOutput]})]})
    ]}),
    SplitView({minPaneWidth: '380px', children: [Card({title: '状态转移', children: [Field({label: '图示状态', control: graphSelect}), graph, transitionTable]}), Card({title: '执行记录', children: trace})]})
  ]}), panel.querySelector('.tool-provenance'));
  const recording=resultRecording({id:'turing-result',anchor:saveOutput.parentElement,panel});
  let worker = null, revision = 0, requestId = 0, pending = null, timeout = null, runTimer = null, running = false, reading = false, definition = null, snapshot = null, runStart = 0, runSteps = 0;
  function sync() {
    const busy = Boolean(pending) || reading;
    setState(compile, {disabled: busy || running, busy: busy && !snapshot});
    run.disabled = !snapshot || snapshot.halted || snapshot.status === 'limit' || busy || running;
    step.disabled = run.disabled;back.disabled = !snapshot?.canUndo || busy || running;reset.disabled = !snapshot || busy || running;
    pause.disabled = !running;save.disabled = reading;
    copyOutput.disabled = saveOutput.disabled = !snapshot || busy || running;
    graphSelect.disabled = !definition;
    if(snapshot&&!busy&&!running)recording.publish({text:JSON.stringify({rules:rules.value,input:input.value,head:Number(head.value),snapshot},null,2),name:'图灵机执行记录.json'});else recording.clear();
  }
  function stopScheduling() {running = false;clearTimeout(runTimer);runTimer = null;}
  function terminate() {worker?.terminate();worker = null;clearTimeout(timeout);timeout = null;if (pending) {pending.reject(Error('执行已停止。'));pending = null;}}
  function invalidate(text = '') {
    recording.clear();
    revision++;stopScheduling();terminate();reading = false;definition = snapshot = null;panel.dataset.phase = 'empty';
    currentState.textContent = position.textContent = read.textContent = '—';steps.textContent = '0';setTextareaValue(output, '', {feedback: false});origin.textContent = '';
    tape.replaceChildren(EmptyState({text: '载入规则后显示纸带'}));graph.replaceChildren(EmptyState({text: '载入规则后显示状态转移'}));trace.replaceChildren(EmptyState({text: '执行后显示记录'}));transitionTable.replaceChildren();graphSelect.replaceChildren();updateStatus(message, text);sync();
  }
  function fail(text) {invalidate();panel.dataset.phase = 'error';updateStatus(message, text, 'error');}
  function send(action, values = {}) {
    if (pending) return Promise.reject(Error('上一条操作尚未完成。'));
    return new Promise((resolve, reject) => {
      const id = ++requestId, version = revision;pending = {id, version, resolve, reject};sync();
      timeout = setTimeout(() => {if (pending?.id === id) {reject(Error('图灵机执行超过 30 秒，已停止。'));pending = null;fail('图灵机执行超过 30 秒，已停止。');}}, 30000);
      try {worker.postMessage({id, action, ...values});}catch (error) {clearTimeout(timeout);pending = null;reject(error);sync();}
    });
  }
  function drawGraph() {
    if (!definition || !snapshot) return;
    const focusedState = graph.contains(document.activeElement) ? document.activeElement.dataset.state : undefined;
    const selected = graphSelect.value || snapshot.state;
    graph.replaceChildren(stateGraph(definition, snapshot, selected, name => {graphSelect.value = name;drawGraph();}));
    if (focusedState !== undefined) [...graph.querySelectorAll('[data-state]')].find(node => node.dataset.state === focusedState)?.focus({preventScroll: true});
    const entries = definition.transitions.filter(rule => rule.from === selected);
    transitionTable.replaceChildren(Table({columns: ['读取', '写入', '移动', '下一状态'], rows: entries.map(rule => [symbol(rule.read), symbol(rule.write), direction(rule.move), rule.to])}));
    transitionTable.querySelectorAll('tbody tr').forEach((row, index) => {row.dataset.ruleId = entries[index].id;row.dataset.active = String(entries[index].id === snapshot.next?.id);});
  }
  function draw(data, feedback = false) {
    snapshot = data;currentState.textContent = data.state;steps.textContent = String(data.steps);position.textContent = String(data.head);read.textContent = symbol(data.symbol);
    const cells = Box({className: 'turing-tape-cells'});
    for (const cell of data.window) cells.append(Box({className: 'turing-tape-cell', attrs: {'data-index': cell.index, 'data-head': String(cell.index === data.head)}, children: [Box({tag: 'span', text: symbol(cell.symbol), className: 'turing-tape-symbol'}), Box({tag: 'span', text: String(cell.index), className: 'turing-tape-index'})]}));
    tape.replaceChildren(cells);const center = cells.querySelector('[data-head="true"]');tape.scrollLeft = Math.max(0, center.offsetLeft - cells.offsetLeft - (tape.clientWidth - center.offsetWidth) / 2);
    setTextareaValue(output, data.tapeText, {feedback});origin.textContent = `起始位置 ${data.outputOrigin} · ${data.tapeLength} 格 · 空白符 ${symbol(definition.blank)}`;
    trace.replaceChildren(data.trace.length ? Table({columns: ['步', '状态', '位置', '读取 → 写入', '移动', '下一状态'], rows: data.trace.slice(-32).map(entry => [entry.step, entry.from, entry.head, symbol(entry.read) + ' → ' + symbol(entry.write), direction(entry.move), entry.to])}) : EmptyState({text: '执行后显示记录'}));
    drawGraph();panel.dataset.phase = running ? 'running' : data.halted ? 'halted' : data.status === 'limit' ? 'limit' : 'ready';sync();
  }
  function haltMessage() {return snapshot.status === 'limit' ? '已达到引擎限额，可回退或重置。' : snapshot.haltReason === 'missing-transition' ? `已停机：状态 ${snapshot.state} 没有匹配符号 ${symbol(snapshot.symbol)} 的规则。` : `已停机 · ${snapshot.steps} 步` ;}
  async function load() {
    invalidate('正在载入规则…');const version = revision;
    try {
      if (!/^-?\d+$/.test(head.value) || Math.abs(Number(head.value)) > 65535) throw Error('读写头位置须为 -65535 至 65535 的整数。');
      worker = new Worker(new URL('./worker.js', import.meta.url));
      worker.onerror = event => {event.preventDefault();if (version === revision) fail('图灵机运算线程出错，请重新载入规则。');};
      worker.onmessage = ({data}) => {
        if (version !== revision || !pending || data.id !== pending.id) return;
        const current = pending;pending = null;clearTimeout(timeout);timeout = null;
        if (data.error) current.reject(Error(data.error));else current.resolve(data);sync();
      };
      const result = await send('init', {rules: rules.value, input: input.value, head: Number(head.value), resourceBase: new URL('../', import.meta.url).href});
      if (version !== revision) return;definition = result.definition;
      graphSelect.replaceChildren(Option('当前状态（跟随执行）', ''), ...definition.states.map(name => Option(name, name)));draw(result.snapshot, true);
      updateStatus(message, snapshot.halted ? haltMessage() : '规则已载入', snapshot.halted ? 'success' : 'info');
    } catch (error) {if (version === revision) fail(error.message || '无法载入规则，请重试。');}
  }
  async function command(action) {
    const version = revision;
    try {const result = await send(action);if (version !== revision) return;draw(result.snapshot, true);updateStatus(message, snapshot.halted || snapshot.status === 'limit' ? haltMessage() : action === 'reset' ? '纸带已重置' : action === 'back' ? '已回退一步' : '已执行一步', snapshot.halted ? 'success' : 'info');}
    catch (error) {if (version === revision) fail(error.message);}
  }
  function pauseRun(text = '已暂停') {stopScheduling();panel.dataset.phase = snapshot?.halted ? 'halted' : 'paused';updateStatus(message, text);sync();}
  async function tick() {
    if (!running || !snapshot) return;const version = revision, max = Number(limit.value), rate = Number(speed.value);
    if (runSteps >= max || performance.now() - runStart >= 30000) {pauseRun(runSteps >= max ? '已达到本次运行步数上限' : '运行已满 30 秒，已暂停');return;}
    const count = Math.min(Math.max(1, Math.round(rate / 10)), max - runSteps);
    try {
      const before = snapshot.steps, result = await send('step', {count});if (version !== revision) return;runSteps += result.snapshot.steps - before;draw(result.snapshot);
      if (!running) {panel.dataset.phase = 'paused';sync();return;}
      if (snapshot.halted || snapshot.status === 'limit') {stopScheduling();panel.dataset.phase = snapshot.halted ? 'halted' : 'paused';updateStatus(message, haltMessage(), snapshot.halted ? 'success' : 'info');sync();return;}
      runTimer = setTimeout(tick, Math.max(16, count * 1000 / rate));
    } catch (error) {if (version === revision) fail(error.message);}
  }
  run.onclick = () => {if (!/^\d+$/.test(limit.value) || Number(limit.value) < 1 || Number(limit.value) > 100000) {updateStatus(message, '运行步数上限须为 1 至 100000 的整数。', 'error');return;}running = true;runSteps = 0;runStart = performance.now();panel.dataset.phase = 'running';updateStatus(message, '运行中');sync();void tick();};
  compile.onclick = load;pause.onclick = () => pauseRun();step.onclick = () => command('step');back.onclick = () => command('back');reset.onclick = () => command('reset');
  for (const control of [rules, input, head]) control.addEventListener('input', () => {example.value = 'custom';invalidate();});
  limit.addEventListener('input', () => {if (running) pauseRun('运行上限已修改，已暂停');});
  graphSelect.onchange = drawGraph;
  example.onchange = () => {const template = templates[example.value];if (!template) return;invalidate();setTextareaValue(rules, template.rules);setTextareaValue(input, template.input);head.value = '0';};
  save.onclick = () => {
    if (!/^-?\d+$/.test(head.value) || Math.abs(Number(head.value)) > 65535) {updateStatus(message, '初始读写头位置无效。', 'error');return;}
    download(JSON.stringify({format: 'mist-turing', version: 1, rules: rules.value, input: input.value, head: Number(head.value)}, null, 2), '迷雾工具箱-图灵机.json', 'application/json');
  };
  file.onchange = async () => {
    const selected = file.files[0];if (!selected) return;invalidate('正在读取配置…');const version = revision;reading = true;sync();
    try {
      if (selected.size > 256 * 1024) throw Error('配置文件最多 256 KB。');const text = new TextDecoder('utf-8', {fatal: true}).decode(await selected.arrayBuffer());if (version !== revision) return;
      let config;
      if (/\.json$/i.test(selected.name) || /^\s*\{/.test(text)) {
        try {config = JSON.parse(text);}catch {throw Error('JSON 配置无效。');}
        if (config?.format !== 'mist-turing' || config.version !== 1 || typeof config.rules !== 'string' || typeof config.input !== 'string' || !Number.isSafeInteger(config.head) || Math.abs(config.head) > 65535) throw Error('不是受支持的图灵机配置。');
      } else config = {rules: text, input: '', head: 0};
      if (new TextEncoder().encode(config.rules).length > 65536 || [...config.input].length > 8192) throw Error('规则最多 64 KB，纸带输入最多 8192 个符号。');
      setTextareaValue(rules, config.rules);setTextareaValue(input, config.input);head.value = String(config.head);example.value = 'custom';updateStatus(message, '配置已打开，请载入规则。');
    } catch (error) {if (version === revision) updateStatus(message, error.message || '文件读取失败。', 'error');}
    finally {if (version === revision) {reading = false;sync();file.value = '';}}
  };
  copyOutput.onclick = async () => {
    const version = revision, source = snapshot;
    const current = () => version === revision && source === snapshot && !running && !pending && panel.isConnected;
    try {if (!output.value) throw Error('纸带内容为空。');await copy(output.value);if (current()) updateStatus(message, '纸带已复制', 'success');}
    catch (error) {if (current()) updateStatus(message, error.message || '复制失败，请重试。', 'error');}
  };
  saveOutput.onclick = () => download(output.value, '图灵机纸带.txt');
  const leave = event => {if (event.detail.name !== 'turing' && (worker || reading)) invalidate();};
  const visibility = () => {if (document.hidden && running) pauseRun('页面进入后台，已暂停');};
  document.addEventListener('arg:panelchange', leave);document.addEventListener('visibilitychange', visibility);
  onDisconnect(panel, () => {revision++;stopScheduling();terminate();document.removeEventListener('arg:panelchange', leave);document.removeEventListener('visibilitychange', visibility);});invalidate();
}
