import {Box, Button, Card, ConversionWorkbench, DataList, Field, Input, Option, Select, Table, Textarea, ToolHeader, ToolPanel, Toolbar, Provenance, setTextareaValue, updateStatus, onDisconnect} from '../ui/index.js';
import {CONSTRAINT_PRESETS, CONSTRAINT_RULE_REFERENCE} from './hunt-constraints-catalog.js';
import {ENGLISH_DATASETS} from './hunt-data.js';
import {saveFile, startWorkerJob, taskSession} from './session.js';
import {appendToolHelpContent} from '../tool-help.js';

export const CONSTRAINTS_HELP = Object.freeze({
  'hunt-constraints': {steps: ['选择具体规则任务，填写行列数，再在输入区域编辑完整中文规则；编号从 1 开始，按行从左到右排列。', '运行后查看真实网格、首解与已找到解数；有多个解可使用上一解／下一解浏览，完整 JSON 包含所有已找到解。', '只有搜索完成时才展示全局共同部分；达到解数或超时上限的候选不能证明唯一性。', '使用“加入笔记本”或“加入白板 / 脑图”保存完整结果；可下载 JSON 继续复核。'], tip: '纯本地的 cipher_machine 中文规则引擎；保留原有取值、互异、求和、计数、线性、条件、单词、连续段、排列、回路与桥连规则。每次新建独立线程，修改规则／参数、切换任务或停止会作废旧结果。'},
  'dictionary-substitution': {steps: ['粘贴带分词空格的英文替换密文，选择本地完整词库。撇号与大小写会保留。', '可逐行填写已确认的映射，如 A=T，表示密文 A 对应明文 T；锁定映射必须一一对应。', '运行词库约束搜索，逐一查看候选、实际映射和搜索状态；复制、下载或加入笔记本保存结果。'], tip: '真实 SubstitutionSolver 在本地线程中搜索；候选受所选词库范围限制，不把零候选说成密文一定无解，不与现有不带分词的统计替换破解混用。'},
});

const field = (label, control) => Field({label, control});
const numberInput = (id, value, min, max) => Input({id, type: 'number', value: String(value), attrs: {min, max, step: 1}});
const datasetSelect = id => Select({id, children: ENGLISH_DATASETS.map(item => Option(item.title, item.id))});
const provenance = () => Provenance({className: 'tool-provenance', items: [['cipher_machine', 'https://github.com/philippica/cipher_machine', '真实中文规则解析器、约束传播与搜索／词库替换求解核心 · BSD-3-Clause'] ]});
const loops = {UR: '└', UB: '│', UL: '┘', RB: '┌', RL: '─', BL: '┐'};
function displayCell(value) {
  if (value === null || value === undefined) return '·';
  if (value === 'black') return '■';
  if (value === 'white') return '□';
  if (value?.hashi) return ['u','d','l','r'].map((direction, i) => value.hashi[direction] ? `${['↑','↓','←','→'][i]}${value.hashi[direction]}` : '').filter(Boolean).join(' ');
  return loops[value] ?? String(value);
}
function gridRows(cells, columns) { return Array.from({length: Math.ceil(cells.length / columns)}, (_, row) => cells.slice(row * columns, (row + 1) * columns).map(displayCell)); }
function gridText(cells, columns) { return gridRows(cells, columns).map(row => row.join('\t')).join('\n'); }
const resultNames = {none: '未找到满足全部规则的解', unique: '已完成搜索，唯一解', multiple: '已找到多个解', partial: '搜索尚未完成'};

function makeConstraintPanel(host) {
  const id = 'hunt-constraints', initial = CONSTRAINT_PRESETS.find(item => item.id === 'sudoku');
  const preset = Select({id: id + '-preset', hidden: true, children: CONSTRAINT_PRESETS.map(item => Option(item.label, item.id))});
  const rows = numberInput(id + '-rows', initial.rows, 1, 40), columns = numberInput(id + '-columns', initial.columns, 1, 40);
  const maxSolutions = numberInput(id + '-max-solutions', 20, 2, 100), timeout = numberInput(id + '-timeout', 30, 1, 30), dataset = datasetSelect(id + '-dataset');
  const view = ConversionWorkbench({id, inputLabel: '中文规则', resultLabel: '求解摘要', settings: [preset, field('行数', rows), field('列数', columns), field('最多展示解数', maxSolutions), field('超时（秒）', timeout), field('单词约束词库', dataset)]});
  view.run.textContent = '求解'; view.use.hidden = true;
  view.input.maxLength = 128 * 1024; setTextareaValue(view.input, initial.rules, {feedback: false});
  const panel = ToolPanel({id: 'panel-' + id, className: 'panel', hidden: true, header: ToolHeader({className: 'page-heading', title: '中文规则填格求解'}), body: view.root, footer: provenance()});
  host.append(panel);
  const syntax = Box({children: CONSTRAINT_RULE_REFERENCE.map(item => Card({title: item.label, children: Box({tag: 'p', text: item.syntax})}))});
  appendToolHelpContent(id, syntax);
  let page = 0;
  const session = taskSession(view, {
    id,
    options: () => ({rows: Number(rows.value), columns: Number(columns.value), rules: view.input.value, maxSolutions: Number(maxSolutions.value), timeoutMs: Number(timeout.value) * 1000, dataset: dataset.value}),
    execute: async (input, options, hooks) => {
      const result = await startWorkerJob({task: 'constraints', input, options: {...options, rules: input}}, {...hooks, timeoutMs: options.timeoutMs + 2000});
      const output = [resultNames[result.status], `已找到 ${result.solutionCount} 个解；${result.complete ? '已完成枚举' : '未完成枚举'}`, ...result.warnings, ...(result.first ? ['首解：', gridText(result.first.cells, result.columns)] : [])].join('\n');
      return {output, result, value: {text: JSON.stringify(result, null, 2)}, status: resultNames[result.status]};
    },
    render: value => {
      const result = value.result;
      page = 0;
      const grid = Box({id: id + '-grid', attrs: {tabindex: '0', role: 'region', 'aria-label': '求解网格', 'data-layout': 'table-scroll'}}), label = Box({tag: 'span', text: ''});
      const previous = Button({text: '上一解'}), next = Button({text: '下一解'});
      const draw = () => {
        previous.disabled = page <= 0; next.disabled = page >= result.solutions.length - 1;
        label.textContent = result.solutions.length ? `第 ${page + 1} / ${result.solutions.length} 个已找到解` : '没有可显示的解';
        grid.replaceChildren(...(result.solutions[page] ? [Table({caption: label.textContent, columns: Array.from({length: result.columns}, (_, i) => String(i + 1)), rows: gridRows(result.solutions[page].cells, result.columns)})] : []));
      };
      previous.onclick = () => { if (page > 0) { page--; draw(); } };
      next.onclick = () => { if (page < result.solutions.length - 1) { page++; draw(); } };
      view.details.append(Card({title: '真实求解网格', children: [Toolbar({children: [previous, label, next]}), grid]}));
      if (result.complete && result.solutionCount > 1) view.details.append(Card({title: '全部解的共同部分', children: Box({attrs: {'data-layout': 'table-scroll', tabindex: '0', role: 'region', 'aria-label': '全部解的共同部分'}, children: Table({caption: '· 表示不同解之间不一致的格子', columns: Array.from({length: result.columns}, (_, i) => String(i + 1)), rows: gridRows(result.common, result.columns)})})}));
      draw();
    },
    save: value => saveFile(JSON.stringify(value.result, null, 2), '迷雾工具箱-中文规则求解.json', 'application/json'),
  });
  const drafts = new Map(); let currentPreset = initial.id;
  const choosePreset = () => {
    drafts.set(currentPreset, {rows: rows.value, columns: columns.value, rules: session.getInput()});
    const chosen = CONSTRAINT_PRESETS.find(item => item.id === preset.value);
    if (!chosen) { updateStatus(view.status, '未知规则预设。', 'error'); return; }
    const draft = drafts.get(chosen.id) ?? chosen;
    currentPreset = chosen.id; rows.value = String(draft.rows); columns.value = String(draft.columns); session.adopt(draft.rules); session.invalidate();
  };
  preset.addEventListener('change', choosePreset);
  onDisconnect(panel, () => preset.removeEventListener('change', choosePreset));
  return {panel, session};
}

function parseLocks(text) {
  const result = {};
  for (const raw of text.split(/\r?\n/u)) {
    const line = raw.trim(); if (!line) continue;
    const match = line.match(/^([a-z])\s*(?:=|→|:|：)\s*([a-z])$/i);
    if (!match) throw Error('锁定映射请逐行填写 A=T，左边密文，右边明文。');
    const cipher = match[1].toUpperCase(), plain = match[2].toUpperCase();
    if (result[cipher] && result[cipher] !== plain) throw Error('同一密文字母填写了不同的明文。');
    result[cipher] = plain;
  }
  return result;
}

function makeSubstitutionPanel(host) {
  const id = 'dictionary-substitution', dataset = datasetSelect(id + '-dataset');
  const locked = Textarea({id: id + '-locked', minRows: 2, maxRows: 5, autoSize: true, attrs: {spellcheck: 'false', placeholder: 'A=T\nB=H', maxlength: 1024}});
  const maxSolutions = numberInput(id + '-max-solutions', 20, 1, 100), timeout = numberInput(id + '-timeout', 30, 1, 30);
  const view = ConversionWorkbench({id, inputLabel: '带空格的英文替换密文', resultLabel: '候选结果', settings: [field('本地完整词库', dataset), field('锁定映射（密文=明文）', locked), field('最多展示候选数', maxSolutions), field('超时（秒）', timeout)]});
  view.run.textContent = '搜索候选'; view.input.maxLength = 10000; view.use.hidden = true;
  const panel = ToolPanel({id: 'panel-' + id, className: 'panel', hidden: true, header: ToolHeader({className: 'page-heading', title: '带分词的替换密码求解'}), body: view.root, footer: provenance()});
  host.append(panel);
  const session = taskSession(view, {
    id, options: () => ({dataset: dataset.value, locked: parseLocks(locked.value), maxSolutions: Number(maxSolutions.value), timeoutMs: Number(timeout.value) * 1000}),
    execute: async (input, options, hooks) => {
      const result = await startWorkerJob({task: 'dictionary-substitution', input, options}, {...hooks, timeoutMs: options.timeoutMs + 2000});
      const output = [`找到 ${result.candidateCount} 个词库候选；${result.complete ? '该词库搜索已完成' : '搜索未穷尽'}`, ...result.warnings, ...result.candidates.map((candidate, i) => `${i + 1}. ${candidate.text}`)].join('\n');
      return {output, result, value: {text: JSON.stringify(result, null, 2)}, status: result.candidateCount ? `找到 ${result.candidateCount} 个候选` : '当前词库没有找到候选'};
    },
    render: value => {
      const result = value.result; let page = 0;
      const detail = Box(), previous = Button({text: '上一候选'}), next = Button({text: '下一候选'}), label = Box({tag: 'span'});
      const draw = () => {
        previous.disabled = page <= 0; next.disabled = page >= result.candidates.length - 1;
        label.textContent = result.candidates.length ? `第 ${page + 1} / ${result.candidates.length} 个候选` : '没有候选';
        const candidate = result.candidates[page];
        detail.replaceChildren(...(candidate ? [Textarea({value: candidate.text, autoSize: true, minRows: 3, maxRows: 8, attrs: {readonly: true, 'aria-label': '当前候选明文'}}), DataList({items: Object.entries(candidate.mapping).map(([cipher, plain]) => [cipher.toUpperCase(), plain.toUpperCase()])})] : []));
      };
      previous.onclick = () => { if (page > 0) { page--; draw(); } }; next.onclick = () => { if (page < result.candidates.length - 1) { page++; draw(); } };
      view.details.append(Card({title: '候选与实际替换表', children: [Toolbar({children: [previous, label, next]}), detail]})); draw();
    },
    save: value => saveFile(JSON.stringify(value.result, null, 2), '迷雾工具箱-带分词替换候选.json', 'application/json'),
  });
  return {panel, session};
}

export function mountConstraints(host) {
  const constraint = makeConstraintPanel(host), substitution = makeSubstitutionPanel(host);
  return {panels: [constraint.panel, substitution.panel], sessions: new Map([['hunt-constraints', constraint.session], ['dictionary-substitution', substitution.session]])};
}
