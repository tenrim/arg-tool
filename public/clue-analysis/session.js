import {
  AnalysisError,
  analysisLimits,
  errorRecord,
  fail,
  fingerprint,
  jsonSnapshot,
  snapshot,
} from './data.js';
import { createAdapterRegistry } from './registry.js';
import { createAnalysisWorkerPool } from './worker-job.js';

// Sequential engine execution is intentional: one running engine per session.
// Each adapter must release/terminate its real work on signal.abort, not just ignore replies.
export function createAnalysisSession({
  adapters,
  limits: overrides,
  expandHypotheses = false,
} = {}) {
  const sessionId = crypto.randomUUID();
  const registry = createAdapterRegistry(adapters || []),
    limits = analysisLimits(overrides);
  let active,
    revision = 0,
    disposed = false,
    latest = null;
  function cancel() {
    revision++;
    latest = null;
    active?.abort(new AnalysisError('CANCELLED', '分析已停止。'));
    active = null;
  }
  async function start(source, options, plan, explicit = false) {
    if (disposed) fail('CANCELLED', '分析会话已关闭。');
    cancel();
    const generation = revision,
      controller = new AbortController();
    active = controller;
    const workerPool = createAnalysisWorkerPool();
    const { signal, onProgress = () => {} } = options || {};
    const abort = () => controller.abort(new AnalysisError('CANCELLED', '分析已停止。'));
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    const timer =
      limits.totalMs === null
        ? null
        : setTimeout(
            () => controller.abort(new AnalysisError('TIMEOUT', '达到总分析时间限制。')),
            limits.totalMs,
          );
    const report = {
      sessionId,
      revision: generation,
      status: 'completed',
      nodes: [],
      edges: [],
      errors: [],
      limits: [],
      attempts: 0,
      checks: [],
    };
    let retained = 0,
      executingPrefix = false;
    const identities = new Map(),
      attempted = new Map(),
      queuedDepth = new Map(),
      queue = [];
    const routeKey = (node) => node.id + ':' + (expandHypotheses ? false : node.hypothesis);
    function enqueue(node) {
      if (!node.expandable) return;
      const key = routeKey(node);
      if ((queuedDepth.get(key) ?? Infinity) <= node.depth) return;
      queuedDepth.set(key, node.depth);
      queue.push(node);
    }
    const check = () => {
      if (controller.signal.aborted) throw controller.signal.reason;
      if (report.edges.length + report.checks.length >= limits.records)
        fail('LIMIT_EXCEEDED', '达到分析记录内存保护上限。');
    };
    const notify = (event) => {
      if (generation !== revision || controller.signal.aborted) return;
      // Observers cannot mutate or interrupt the engine; never send clue data in progress.
      try {
        onProgress({ ...event });
      } catch {
        /* presentation is caller owned */
      }
    };
    const limited = (reason) => {
      if (!report.limits.includes(reason)) report.limits.push(reason);
    };
    async function task(work, label) {
      check();
      if (limits.attempts !== null && report.attempts >= limits.attempts)
        fail('LIMIT_EXCEEDED', '达到本次分析尝试次数限制。');
      report.attempts++;
      const child = new AbortController();
      const propagate = () => child.abort(controller.signal.reason);
      controller.signal.addEventListener('abort', propagate, { once: true });
      let rejectAbort;
      const cancelled = new Promise((_, reject) => {
        rejectAbort = reject;
      });
      const stop = () => rejectAbort(child.signal.reason);
      child.signal.addEventListener('abort', stop, { once: true });
      const timeout = setTimeout(
        () => child.abort(new AnalysisError('TIMEOUT', '单项分析超时，已停止。')),
        limits.taskMs,
      );
      notify({ phase: 'running', adapter: label, attempts: report.attempts });
      try {
        const result = await Promise.race([
          Promise.resolve().then(() => {
            check();
            return work(child.signal);
          }),
          cancelled,
        ]);
        check();
        return result;
      } finally {
        clearTimeout(timeout);
        controller.signal.removeEventListener('abort', propagate);
        child.signal.removeEventListener('abort', stop);
        // Release even a successful adapter's per-task resources/listeners.
        child.abort(new AnalysisError('CANCELLED', '单项分析已结束。'));
      }
    }
    async function add(
      value,
      depth,
      input = false,
      expand = true,
      hypothesis = false,
      observation = false,
    ) {
      check();
      const copy = snapshot(value, input ? limits.inputBytes : limits.outputBytes);
      const key = await fingerprint(copy.artifact);
      check();
      const existing = identities.get(key);
      if (existing) {
        existing.depth = Math.min(depth, existing.depth);
        existing.expandable ||= expand;
        existing.hypothesis &&= hypothesis;
        existing.observation &&= observation;
        // Content is shared, but each route retains its own depth and policy.
        // A longer format path must not borrow a shorter speculative path's depth.
        const route = { ...existing, depth, expandable: expand, hypothesis };
        enqueue(route);
        return { node: route, duplicate: true };
      }
      if (report.nodes.length >= limits.nodes || retained + copy.size > limits.retainedBytes)
        fail('LIMIT_EXCEEDED', '达到结果数量或累计数据大小限制。');
      const node = {
        id: report.nodes.length,
        depth,
        artifact: copy.artifact,
        expandable: expand,
        hypothesis,
        observation,
      };
      retained += copy.size;
      report.nodes.push(node);
      identities.set(key, node);
      const route = { ...node };
      enqueue(route);
      return { node: route, duplicate: false };
    }
    async function execute(node, raw, evidence = {}, pathDepth = node.depth) {
      const { adapter, step, cost } = registry.resolve(raw);
      if (!adapter.accepts.includes(node.artifact.type))
        fail('INPUT_INVALID', '该工具不接受此数据类型。');
      if (pathDepth + cost > limits.depth) {
        limited('depth');
        return null;
      }
      const identity = node.id + ':' + JSON.stringify(step);
      if (!explicit && !executingPrefix && attempted.has(identity)) {
        const cached = attempted.get(identity);
        if (!cached) return null;
        // Reuse computation while allowing a newly reachable route to continue.
        return (
          await add(
            cached.artifact,
            pathDepth + cost,
            false,
            !adapter.terminal,
            !!(node.hypothesis || cached.hypothesis),
            !!adapter.observation,
          )
        ).node;
      }
      attempted.set(identity, null);
      const edge = {
        from: node.id,
        adapter: adapter.id,
        step,
        depth: pathDepth + cost,
        evidence: jsonSnapshot(evidence),
        status: 'running',
      };
      report.edges.push(edge);
      try {
        const result = await task(
          (taskSignal) =>
            adapter.run(
              snapshot(
                node.artifact,
                limits.outputBytes > limits.inputBytes ? limits.outputBytes : limits.inputBytes,
              ).artifact,
              jsonSnapshot(step.params),
              { signal: taskSignal, limits, workerPool },
            ),
          adapter.id,
        );
        // Full typed output only. Adapters may return their actual resolved defaults for replay.
        if (result.step) edge.step = registry.resolve(result.step).step;
        if (result.evidence) edge.resultEvidence = jsonSnapshot(result.evidence);
        if (!explicit && !executingPrefix && result.eligible === false) {
          edge.status = 'rejected';
          edge.reason = '原工具已执行，但没有得到新的可读文本或可继续处理的字节。';
          return null;
        }
        const ownHypothesis = !!(!executingPrefix && (adapter.exploratory || result.hypothesis));
        const output = await add(
          result.artifact,
          pathDepth + cost,
          false,
          !adapter.terminal,
          !!(!executingPrefix && (ownHypothesis || node.hypothesis)),
          !!adapter.observation,
        );
        attempted.set(identity, { artifact: output.node.artifact, hypothesis: ownHypothesis });
        edge.to = output.node.id;
        edge.duplicate = output.duplicate;
        edge.status = 'completed';
        if (
          options?.onDiscovery &&
          !output.duplicate &&
          generation === revision &&
          !controller.signal.aborted
        ) {
          const { artifact, observation, id } = output.node;
          // Keep clue contents out of ordinary progress and mutable engine objects out of the UI.
          try {
            options.onDiscovery({
              id,
              observation,
              edge: structuredClone(edge),
              text:
                artifact.type === 'text'
                  ? artifact.text
                  : artifact.type === 'json'
                    ? JSON.stringify(artifact.value, null, 2)
                    : null,
            });
          } catch {
            /* A presentation callback cannot change the completed edge. */
          }
        }
        return output.node;
      } catch (error) {
        edge.status = 'failed';
        edge.error = errorRecord(error);
        throw error;
      }
    }
    try {
      let prepared;
      const seed = explicit ? plan : options?.prefix;
      if (seed) {
        if (
          !Array.isArray(seed) ||
          !seed.length ||
          (limits.attempts !== null && seed.length > limits.attempts)
        )
          fail('INPUT_INVALID', '需要有界且非空的处理步骤。');
        // Snapshot and validate before the first await; edits cannot change an active plan.
        prepared = seed.map((step) => registry.resolve(step));
        if (prepared.reduce((n, step) => n + step.cost, 0) > limits.depth)
          fail('LIMIT_EXCEEDED', '处理链超过本次深度限制。');
      }
      let node = (await add(source, 0, true)).node;
      if (prepared) {
        let pathDepth = 0;
        executingPrefix = true;
        for (const item of prepared) {
          node = await execute(node, item.step, {}, pathDepth);
          pathDepth += item.cost;
        }
        executingPrefix = false;
        queue.length = 0;
        queuedDepth.clear();
        enqueue(node);
        report.resultId = node.id;
      }
      if (!explicit) {
        const expanded = new Map();
        // Breadth first: finish all strategies at this depth before descendants.
        // Within a depth, rotate one proposal per adapter so a large catalogue
        // cannot consume the entire budget before another tool gets its first turn.
        while (queue.length) {
          check();
          const level = queue.reduce((depth, node) => Math.min(depth, node.depth), Infinity);
          const layer = queue.filter((node) => node.depth === level);
          for (const node of layer) queue.splice(queue.indexOf(node), 1);
          const pending = [];
          for (const current of layer) {
            const key = routeKey(current);
            if ((expanded.get(key) ?? Infinity) <= current.depth) continue;
            if (
              current.hypothesis &&
              !expandHypotheses &&
              (queuedDepth.get(current.id + ':false') ?? Infinity) <= current.depth
            )
              continue;
            expanded.set(key, current.depth);
            if (current.depth >= limits.depth) {
              limited('depth');
              continue;
            }
            for (const adapter of registry.automatic()) {
              check();
              if (!adapter.accepts.includes(current.artifact.type)) continue;
              if (
                adapter.exploratory &&
                current.hypothesis &&
                !expandHypotheses &&
                !adapter.condition
              ) {
                report.checks.push({
                  nodeId: current.id,
                  adapter: adapter.id,
                  status: 'not-expanded',
                  message: '同一分支只作一层泛用试解；可选中候选作为输入继续。',
                });
                continue;
              }
              const work = await explore(current, adapter);
              if (work) pending.push(work);
            }
          }
          while (pending.length) {
            const work = pending.shift();
            const proposal = work.proposals[work.index++];
            work.record.status = 'attempted';
            try {
              await execute(
                work.current,
                { adapter: work.adapter.id, params: proposal.params },
                proposal.evidence,
              );
            } catch (error) {
              check();
              if (error.code === 'LIMIT_EXCEEDED') throw error;
              const detail = errorRecord(error);
              if (['INPUT_INVALID', 'UNSUPPORTED', 'INTERACTION_REQUIRED'].includes(detail.code)) {
                const edge = report.edges.at(-1);
                if (edge?.status === 'failed')
                  edge.status = detail.code === 'UNSUPPORTED' ? 'unavailable' : 'rejected';
              } else
                report.errors.push({
                  nodeId: work.current.id,
                  adapter: work.adapter.id,
                  ...detail,
                });
            }
            if (work.index < work.proposals.length) pending.push(work);
          }
        }
        async function explore(current, adapter) {
          const record = { nodeId: current.id, adapter: adapter.id, status: 'checking' };
          report.checks.push(record);
          if (adapter.matches && !adapter.matches(current.artifact)) {
            record.status = 'not-matched';
            return;
          }
          if (adapter.condition) {
            record.status = 'needs-input';
            record.message = adapter.condition;
            return;
          }
          try {
            const discover = (taskSignal) =>
              adapter.suggest(
                snapshot(current.artifact, Math.max(limits.inputBytes, limits.outputBytes))
                  .artifact,
                {
                  signal: taskSignal,
                  limits,
                  workerPool,
                  remainingDepth: limits.depth - current.depth,
                },
              );
            // Fixed native profiles only test syntax synchronously; they do not start
            // an engine here. Engine-backed discovery continues to consume its budget.
            const proposals = adapter.matches
              ? await discover(controller.signal)
              : await task((taskSignal) => discover(taskSignal), adapter.id);
            if (!Array.isArray(proposals)) fail('EXECUTION_FAILED', '分析器没有返回有效候选。');
            record.status = proposals.length ? 'proposed' : 'not-matched';
            record.proposals = proposals.length;
            if (limits.proposals !== null && proposals.length > limits.proposals)
              limited('proposals');
            const selected =
              limits.proposals === null ? proposals : proposals.slice(0, limits.proposals);
            if (selected.length) return { current, adapter, proposals: selected, index: 0, record };
          } catch (error) {
            check();
            record.status = 'failed';
            record.error = errorRecord(error);
            if (error.code === 'LIMIT_EXCEEDED') throw error;
            report.errors.push({
              nodeId: current.id,
              adapter: adapter.id,
              ...errorRecord(error),
            });
          }
        }
      }
      if (report.limits.length) report.status = 'limited';
      else if (report.errors.length) report.status = 'partial';
    } catch (error) {
      const detail = errorRecord(error);
      report.errors.push(detail);
      report.status =
        detail.code === 'CANCELLED'
          ? 'cancelled'
          : ['TIMEOUT', 'LIMIT_EXCEEDED'].includes(detail.code)
            ? 'limited'
            : 'failed';
    } finally {
      workerPool.dispose();
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      if (active === controller) active = null;
    }
    if (generation === revision && report.status !== 'cancelled') latest = structuredClone(report);
    notify({ phase: 'finished', status: report.status, nodes: report.nodes.length });
    return report;
  }
  return {
    analyze: (input, options) => start(input, options, null),
    runPlan: (input, steps, options) => start(input, options, steps, true),
    cancel,
    finish() {
      active?.abort(new AnalysisError('LIMIT_EXCEEDED', '已结束分析，保留已完成的候选。'));
    },
    dispose() {
      cancel();
      disposed = true;
    },
    get result() {
      return latest ? structuredClone(latest) : null;
    },
    capabilities: registry.describe,
    isCurrent: (report) =>
      !disposed &&
      latest !== null &&
      report?.sessionId === sessionId &&
      report.revision === revision,
  };
}
