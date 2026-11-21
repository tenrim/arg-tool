import {
  Box,
  Button,
  Disclosure,
  Field,
  Input,
  Select,
  Option,
  Toolbar,
  ToolPanel,
  ToolHeader,
  Provenance,
  ConversionWorkbench,
  Textarea,
  element,
  setTextareaValue,
  updateStatus,
  onDisconnect,
} from '../ui/index.js';
import { $, copy, download, sendTo } from './common.js';
import { createClueAnalysis } from '../clue-analysis/index.js';
import { adapterNames, textCandidates, reportMessage } from '../clue-analysis/presentation.js';
import { operationName } from '../cyberchef-i18n.js';
import { resultRecording } from '../result-recording.js';
import { candidateList } from './analysis-candidates.js';
import { statisticsView } from './analysis-statistics.js';
import { PUZZLE_PROFILES } from '../clue-analysis/puzzle-profiles.js';
import { analysisConditions } from './analysis-conditions.js';
import { ANALYSIS_SOURCES } from '../clue-analysis/sources.js';
import { projectLicense } from '../project-licenses.js';

const puzzleNames = Object.fromEntries(
  PUZZLE_PROFILES.map((profile) => ['puzzle/' + profile.id, profile.title]),
);

const names = (edge) =>
  edge.step.adapter === 'cyberchef'
    ? edge.step.params.recipe.map((step) => operationName(step.op)).join(' → ')
    : edge.step.adapter === 'tapcode'
      ? edge.step.params.mode === 'tap'
        ? '敲击码'
        : `${edge.step.params.size}×${edge.step.params.size} 方阵`
      : edge.step.adapter === 'baudot'
        ? `波多码 ${edge.step.params.alphabet}`
        : puzzleNames[edge.step.adapter] ||
          {
            'affine-search': '仿射密码',
            'braille-tables': '多语言盲文 ' + (edge.step.params.table || ''),
          }[edge.step.adapter] ||
          adapterNames[edge.step.adapter] ||
          edge.step.adapter;
const pathName = (candidate) => candidate.path.map(names).join(' → ');

export function initAnalysis() {
  const view = ConversionWorkbench({
    id: 'analysis',
    inputLabel: '待分析文本',
    resultLabel: '候选内容',
  });
  view.run.id = 'analysis-magic';
  view.run.textContent = '分析文本';
  view.input.placeholder = '粘贴编码串、密文、数字或可疑文本。';
  view.output.placeholder = '分析后选择候选，查看完整内容。';
  const depth = Select({
    id: 'analysis-depth',
    children: Array.from({ length: 16 }, (_, index) =>
      Option(`${index + 1} 层${index === 2 ? '（默认）' : ''}`, String(index + 1)),
    ),
  });
  depth.value = '3';
  const budget = Select({
    id: 'analysis-budget',
    children: [
      Option('充分分析（默认）', 'standard'),
      Option('持续分析，直到完成或手动停止', 'continuous'),
    ],
  });
  const advanced = Disclosure({
    children: [
      element('summary', { text: '分析范围与限制' }),
      element('p', {
        text: '默认最多 10 分钟、8192 次尝试、4096 个结果；持续分析不限制尝试次数、单项候选数和总时间，并允许多层泛用试解。两种模式均保留转换层数、单项超时、16384 个节点上限和 64 MB 结果内存保护。输入最多 64 KB。',
      }),
    ],
  });
  view.parameters.append(
    Field({ label: '分析深度（最大转换层数）', control: depth }),
    Field({ label: '分析预算', control: budget }),
    advanced,
  );
  const key = Input({
    id: 'analysis-puzzle-key',
    attrs: { autocomplete: 'off', maxlength: 256 },
    placeholder: '有题目给出的密钥时填写',
  });
  view.parameters.append(Field({ label: '已知文字密钥／提取索引（可选）', control: key }));
  const candidates = Box({ id: 'analysis-candidates', className: 'r1-candidates' });
  const more = Button({ text: '显示更多候选', hidden: true });
  const trace = Box({ id: 'analysis-trace' });
  const diagnostics = Box({ id: 'analysis-diagnostics' });
  const candidateSection = Box({
    hidden: true,
    children: [
      element('h2', { text: '候选与处理步骤' }),
      element('p', {
        text: '分析中按发现顺序展示，可随时查看、复制或停止。结束后按格式依据和可读性排序。选择候选查看完整内容；相同结果合并展示，观察报告不继续作为密文分析。',
      }),
      candidates,
      more,
      trace,
    ],
  });
  const exportReport = Button({ id: 'analysis-export', text: '下载分析记录', disabled: true });
  const example = Button({
    text: '填入跨工具示例（替换输入）',
    on: {
      click() {
        view.input.value = 'QWxmYSBCcmF2byBDaGFybGll';
        view.input.dispatchEvent(new Event('input', { bubbles: true }));
        view.input.focus();
      },
    },
  });
  view.inputCard.append(
    element('p', { text: '文本仅在本机处理，不会自动打开链接或联网查询。' }),
    example,
  );
  view.details.append(candidateSection, diagnostics, exportReport);
  let session = null,
    generation = 0,
    stopRequested = false,
    selected = null,
    currentReport = null;
  const panel = ToolPanel({
    id: 'panel-analysis',
    className: 'panel r1-panel',
    hidden: true,
    header: ToolHeader({ className: 'page-heading', title: '文本线索分析' }),
    body: view.root,
    footer: Provenance({
      className: 'tool-provenance',
      items: ANALYSIS_SOURCES.map((url) => {
        const source = projectLicense(url);
        return [source?.name || url, url, source?.license || '见随包许可'];
      }),
    }),
  });
  $('main').append(panel);
  const recording = resultRecording({
    id: 'analysis-result',
    anchor: view.save,
    panel,
    onLeave: () => cancel(),
  });
  const list = candidateList({ candidates, more, section: candidateSection, pathName, choose });
  function clearResult() {
    selected = null;
    setTextareaValue(view.output, '', { feedback: false });
    recording.clear();
    for (const action of [view.copy, view.save, view.use]) action.disabled = true;
  }
  function busy(value) {
    conditions.busy(value);
    view.run.disabled = value;
    view.stop.disabled = !value;
    view.root.setAttribute('aria-busy', String(value));
    for (const button of [
      stats.root.querySelector('#analysis-run'),
      stats.root.querySelector('#analysis-vig'),
      stats.root.querySelector('#analysis-key'),
      inspect,
    ])
      button.disabled = value;
  }
  function cancel() {
    generation++;
    stopRequested = false;
    session?.dispose();
    session = null;
    currentReport = null;
    clearResult();
    list.reset();
    trace.replaceChildren();
    diagnostics.replaceChildren();
    exportReport.disabled = true;
    stats.clear();
    busy(false);
    updateStatus(view.status, '');
  }
  function publish(text, title) {
    selected = { text, title };
    setTextareaValue(view.output, text);
    for (const action of [view.copy, view.save, view.use]) action.disabled = false;
    recording.publish({ text, name: title + '.txt' });
  }
  const stats = statisticsView({
    input: view.input,
    publish,
    invalidateResult: clearResult,
    run: () => run('cipher-statistics'),
    showError: (message) => updateStatus(view.status, message, 'error'),
  });
  const inspect = Button({
    id: 'analysis-invisible',
    text: '检查隐藏字符',
    on: { click: () => run('invisible') },
  });
  const substitution = Button({
    id: 'analysis-sub',
    text: '送到单表替换',
    on: { click: () => sendTo('sub-input', view.input.value, 'substitution') },
  });
  const manual = Box({
    className: 'surface r1-gap',
    children: [Toolbar({ children: [inspect, substitution] }), stats.root],
  });
  const conditions = analysisConditions({
    invalidate: cancel,
    run: (step) => run('auto', step),
    showError: (message) => updateStatus(view.status, message, 'error'),
  });
  manual.prepend(conditions.root);
  panel.querySelector('.tool-provenance').before(manual);
  function choose(candidate) {
    if (!session || panel.hidden) return;
    publish(candidate.text, '文本分析候选');
    for (const button of candidates.children)
      button.setAttribute(
        'aria-pressed',
        String(Number(button.dataset.clueCandidate) === candidate.id),
      );
    trace.replaceChildren(
      element('h3', { text: pathName(candidate) }),
      element('ol', {
        children: candidate.path.map((edge) =>
          element('li', {
            children: [
              element('strong', { text: names(edge) }),
              element('p', {
                text: edge.evidence?.message || edge.resultEvidence?.message || '原工具已执行。',
              }),
              Disclosure({
                children: [
                  element('summary', { text: '实际操作与参数' }),
                  Textarea({
                    value: JSON.stringify(
                      {
                        ...edge.step,
                        ...(edge.resultEvidence?.options
                          ? { actualOptions: edge.resultEvidence.options }
                          : {}),
                      },
                      null,
                      2,
                    ),
                    autoSize: true,
                    minRows: 2,
                    maxRows: 6,
                    attrs: { readonly: true, 'aria-label': '实际操作与参数' },
                  }),
                ],
              }),
            ],
          }),
        ),
      }),
    );
    if (candidate.incoming.length > 1)
      trace.append(
        element('p', {
          text: `此结果有 ${candidate.incoming.length} 条到达记录，完整关系见下载的分析记录。`,
        }),
      );
  }
  function showDiagnostics(report) {
    const checked = new Set();
    const statuses = new Map();
    for (const row of report.checks) {
      if (!statuses.has(row.adapter)) statuses.set(row.adapter, new Set());
      statuses.get(row.adapter).add(row.status);
      if (
        row.status !== 'checking' &&
        row.status !== 'not-expanded' &&
        row.error?.code !== 'LIMIT_EXCEEDED'
      )
        checked.add(row.adapter);
    }
    const executed = new Set(
      report.edges
        .filter((edge) => edge.status === 'completed')
        .map((edge) => edge.adapter || edge.step.adapter),
    );
    const coverage = session.capabilities();
    diagnostics.append(
      Disclosure({
        id: 'analysis-coverage',
        children: [
          element('summary', { text: `本轮检查范围与待补条件（${checked.size} 项已检查）` }),
          element('p', {
            text: '格式检查、实际转换和等待条件分别记录。未匹配不等于排除；达到限制的项目不算已检查。',
          }),
          element('ul', {
            children: coverage.map((item) => {
              const records = statuses.get(item.id);
              const state = executed.has(item.id)
                ? '有转换结果'
                : records?.has('needs-input')
                  ? item.condition
                  : records?.has('failed')
                    ? '执行失败，原因见下方详情'
                    : records?.has('attempted')
                      ? '已尝试，未得到可用结果'
                      : records?.has('proposed')
                        ? '已匹配，尚未执行（已停止或达到限制）'
                        : checked.has(item.id)
                          ? '本轮未匹配格式／未继续展开'
                          : '本轮未检查（按需操作或达到限制）';
              return element('li', {
                text: `${item.title ? operationName(item.title) : adapterNames[item.id] || item.id}：${state}`,
              });
            }),
          }),
        ],
      }),
    );
    const unavailable = [
      ...new Set(
        report.edges
          .filter((edge) => edge.status === 'unavailable')
          .map((edge) => edge.error?.message),
      ),
    ];
    if (unavailable.length)
      diagnostics.append(
        Disclosure({
          children: [
            element('summary', { text: '当前引擎不支持的选项（' + unavailable.length + '）' }),
            element('ul', { children: unavailable.map((text) => element('li', { text })) }),
          ],
        }),
      );
    const issues = report.errors.map(
      (e) =>
        `${puzzleNames[e.adapter] || adapterNames[e.adapter] || '分析'}：${e.message}（${e.code}）`,
    );
    if (report.limits.length)
      issues.push(
        '已达到限制：' +
          report.limits
            .map(
              (v) =>
                ({
                  depth: '转换层数',
                  proposals: '单轮候选数量',
                  'hypothesis-descendants': '试解候选的下一层尚未分析',
                })[v] || v,
            )
            .join('、'),
      );
    if (issues.length)
      diagnostics.append(
        Disclosure({
          children: [
            element('summary', { text: `限制与失败详情（${issues.length}）` }),
            element('ul', { children: issues.map((text) => element('li', { text })) }),
          ],
        }),
      );
  }
  async function run(mode = 'auto', seed) {
    cancel();
    const text = view.input.value;
    if (!text.length) return updateStatus(view.status, '请先输入文本。', 'error');
    if (new TextEncoder().encode(text).length > 65536)
      return updateStatus(view.status, '文本分析最多 64 KB，请缩小输入。', 'error');
    const revision = generation;
    session = createClueAnalysis({
      textOnly: true,
      puzzle: mode === 'auto',
      key: key.value,
      expandHypotheses: budget.value === 'continuous',
      limits: {
        inputBytes: 65536,
        depth: Number(depth.value),
        taskMs: 120000,
        totalMs: budget.value === 'continuous' ? null : 600000,
        attempts: budget.value === 'continuous' ? null : 8192,
        nodes: budget.value === 'continuous' ? 16384 : 4096,
        proposals: null,
        retainedBytes: 64 * 1024 * 1024,
      },
    });
    const current = session;
    let lastProgress = -Infinity,
      progressTimer,
      pendingProgress;
    const showProgress = () => {
      progressTimer = undefined;
      if (generation !== revision || stopRequested || panel.hidden) return;
      lastProgress = performance.now();
      const { adapter, attempts } = pendingProgress;
      updateStatus(
        view.status,
        `正在分析：${puzzleNames[adapter] || adapterNames[adapter] || adapter} · 第 ${attempts} 次尝试`,
      );
    };
    busy(true);
    updateStatus(view.status, '正在准备本地分析引擎…');
    try {
      const options = {
        ...(seed ? { prefix: seed } : {}),
        onDiscovery:
          mode === 'auto'
            ? (result) => {
                if (revision === generation && !panel.hidden) list.discover(result);
              }
            : undefined,
        onProgress(event) {
          if (revision !== generation || event.phase !== 'running' || stopRequested) return;
          pendingProgress = event;
          if (progressTimer !== undefined) return;
          const remaining = 125 - (performance.now() - lastProgress);
          if (remaining <= 0) showProgress();
          else progressTimer = setTimeout(showProgress, remaining);
        },
      };
      const report =
        mode === 'auto'
          ? await current.analyze({ type: 'text', text }, options)
          : await current.runPlan(
              { type: 'text', text },
              [
                {
                  adapter: mode,
                  params: mode === 'invisible' ? { action: 'inspect', preserve: true } : {},
                },
              ],
              options,
            );
      if (revision !== generation || !current.isCurrent(report) || panel.hidden) return;
      currentReport = report;
      exportReport.disabled = false;
      showDiagnostics(report);
      if (mode !== 'auto') {
        const result = report.nodes.find((n) => n.id === report.resultId)?.artifact;
        if (!result)
          return updateStatus(
            view.status,
            report.errors.at(-1)?.message || '分析未完成。',
            'error',
          );
        if (mode === 'cipher-statistics') {
          stats.show(result.value, text);
          recording.publish({ text: JSON.stringify(result.value, null, 2), name: '密文统计.json' });
          updateStatus(view.status, '统计完成。点击候选或填写密钥试解。');
        } else {
          publish(result.text, '隐藏字符检查');
          updateStatus(
            view.status,
            result.text
              ? '已列出隐藏字符的位置与类别；原文保持不变。'
              : '当前检查范围内未发现隐藏字符。',
          );
        }
        return;
      }
      const items = textCandidates(report);
      list.finish(items);
      updateStatus(
        view.status,
        stopRequested
          ? `已停止，保留 ${items.length} 个候选。`
          : reportMessage(report, items.length),
        report.status === 'failed' ? 'error' : 'info',
      );
    } catch (error) {
      if (revision === generation) updateStatus(view.status, error.message, 'error');
    } finally {
      clearTimeout(progressTimer);
      if (revision === generation) busy(false);
    }
  }
  view.run.addEventListener('click', () => run());
  view.stop.addEventListener('click', () => {
    if (session) {
      stopRequested = true;
      session.finish();
      updateStatus(view.status, '正在停止当前任务并整理已完成的候选…');
    }
  });
  view.input.addEventListener('input', cancel);
  depth.addEventListener('change', cancel);
  budget.addEventListener('change', cancel);
  key.addEventListener('input', cancel);
  view.use.addEventListener('click', () => {
    if (!selected) return;
    view.input.value = selected.text;
    view.input.dispatchEvent(new Event('input', { bubbles: true }));
    view.input.focus();
  });
  view.copy.addEventListener('click', async () => {
    if (!selected) return;
    const revision = generation;
    try {
      await (selected.text === '' ? navigator.clipboard.writeText('') : copy(selected.text));
      if (revision === generation) updateStatus(view.status, '已复制完整候选。');
    } catch (error) {
      if (revision === generation) updateStatus(view.status, error.message, 'error');
    }
  });
  view.save.addEventListener('click', () => {
    if (selected) download(selected.text, selected.title + '.txt');
  });
  exportReport.addEventListener('click', () => {
    if (!currentReport || !session?.isCurrent(currentReport)) return;
    const report = {
      ...currentReport,
      format: 'mist-text-analysis-v1',
      binaryPolicy: '非文本节点仅导出字节数与前 64 字节十六进制预览；文本节点与处理参数完整保留。',
      nodes: currentReport.nodes.map((node) =>
        node.artifact.type !== 'bytes'
          ? node
          : {
              ...node,
              artifact: {
                type: 'bytes',
                byteLength: node.artifact.bytes.length,
                hexPreview: Array.from(node.artifact.bytes.slice(0, 64), (v) =>
                  v.toString(16).padStart(2, '0'),
                ).join(' '),
              },
            },
      ),
    };
    download(JSON.stringify(report, null, 2), '文本分析记录.json', 'application/json');
  });
  window.addEventListener('pagehide', cancel);
  onDisconnect(panel, () => {
    conditions.dispose();
    cancel();
    window.removeEventListener('pagehide', cancel);
  });
}
