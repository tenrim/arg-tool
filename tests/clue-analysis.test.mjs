import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  analysisLimits,
  errorRecord,
  fingerprint,
  jsonSnapshot,
  snapshot,
} from '../public/clue-analysis/data.js';
import { createAnalysisSession } from '../public/clue-analysis/session.js';
import { createAdapterRegistry } from '../public/clue-analysis/registry.js';
import { defaults } from '../public/chef-tools/parameter-model.js';
import { cyberChefAdapter, LOCAL_CHEF_OPERATIONS } from '../public/clue-analysis/chef-adapter.js';
import { textCandidates, reportMessage } from '../public/clue-analysis/presentation.js';
import { createClueAnalysis } from '../public/clue-analysis/index.js';
import { parserError } from '../public/clue-analysis/expected-errors.js';
import { chefPuzzleAdapters } from '../public/clue-analysis/chef-puzzle-adapters.js';
import { localAdapters } from '../public/clue-analysis/local-adapters.js';
import { CONDITIONAL_OPERATIONS } from '../public/clue-analysis/conditional-operations.js';
import { puzzleAdapters } from '../public/clue-analysis/puzzle-adapters.js';
const text = (value) => ({ type: 'text', text: value });
const adapter = (id, run, suggest) => ({
  id,
  capabilityId: 'native:' + id,
  mode: 'local',
  accepts: ['text'],
  run,
  suggest,
});
test('Caesar Box and Bacon trials obey shape, limits, alphabets and rejection rules', async () => {
  const chef = { run: async () => ({ artifact: text('M?ST') }) };
  const select = (name, expanded = false) =>
    chefPuzzleAdapters(chef, { expanded }).find((a) => a.id === 'search/' + name);
  const box = select('Caesar Box Cipher');
  assert(box.directTrials && box.exploratory);
  for (const [s, accepted] of [
    ['abc', false],
    ['abcd', true],
    ['A'.repeat(512), true],
    ['A'.repeat(513), false],
    ['A\nBC', false],
  ])
    assert.equal(box.matches(text(s)), accepted);
  for (const [n, expanded, last] of [
    [4, false, 3],
    [64, false, 12],
    [64, true, 32],
  ])
    assert.deepEqual(
      select('Caesar Box Cipher', expanded)
        .suggest(text('A'.repeat(n)))
        .map((p) => p.params.recipe[0].args[0]),
      Array.from({ length: last - 1 }, (_, i) => i + 2),
    );
  const bacon = select('Bacon Cipher Decode');
  for (const [s, mode, count] of [
    ['ABABA', 'A/B', 3],
    ['01010', '0/1', 3],
    ['tHe NIgHt wiNds aRE caLm.', 'Case', 4],
    ['a b n m z', 'A-M/N-Z first letter', 4],
  ]) {
    const proposals = bacon.suggest(text(s)).filter((p) => p.params.recipe[0].args[1] === mode);
    assert.equal(proposals.length, count);
    assert.equal((await bacon.run(text(s), proposals[0].params, {})).eligible, false);
  }
  for (const s of ['0101', 'abcdeFGHi', 'a b n 3 z']) assert(!bacon.matches(text(s)));
});
test('keyed coordinates precede unkeyed proposals and beast framing counts Unicode scalars', () => {
  const coords = (key) =>
    localAdapters({ key })
      .find((a) => a.id === 'tapcode')
      .suggest(text('11 12'))
      .map((p) => [p.params.size, p.params.keyword]);
  assert.deepEqual(coords('MIST'), [
    ['5', 'MIST'],
    ['6', 'MIST'],
    ['5', ''],
    ['6', ''],
  ]);
  assert.deepEqual(coords('K9'), [
    ['6', 'K9'],
    ['5', ''],
    ['6', ''],
  ]);
  assert.deepEqual(coords('雾'), [
    ['5', ''],
    ['6', ''],
  ]);
  const beast = (key) => puzzleAdapters({ key }).find((a) => a.id === 'puzzle/beast-keyed');
  assert(beast('😀😁😂😃').matches(text('😃😁😀' + '😀'.repeat(8) + '😂')));
  for (const key of ['😀😁😂', 'ABC A', 'AABC']) assert(!beast(key).matches(text('AAAAAAAA')));
  assert(!beast('ABCD').matches(text('A'.repeat(12))));
});
test('format gates keep reports terminal and exclude malformed or ambiguous probes', () => {
  const adapters = chefPuzzleAdapters(cyberChefAdapter());
  for (const [op, valid, invalid] of [
    ['Analyse UUID', '550e8400-e29b-41d4-a716-446655440000', '550e8400'],
    ['Bcrypt parse', '$2b$10$' + 'a'.repeat(53), '$2b$32$' + 'a'.repeat(53)],
    ['Parse ASN.1 hex string', '3003020105', '3004020105'],
    ['Hex to Object Identifier', '2a864886f70d', '2a8680'],
    ['P-list Viewer', '<plist><true/></plist>', 'hello plist'],
  ]) {
    const a = adapters.find((a) => a.id === 'chef-puzzle/' + op);
    assert(a.observation && a.terminal && a.matches(text(valid)) && !a.matches(text(invalid)), op);
  }
  for (const [op, valid, invalid] of [
    ['Text-Integer Conversion', '4276803', '123.45'],
    ['Remove Diacritics', 'é', '迷雾 ABC'],
    ['HTML To Text', '<p>MIST</p>', 'x < y'],
    ['PHP Deserialize', 'b:1;', 'b:20;'],
  ]) {
    const a = adapters.find((a) => a.id === 'chef-puzzle/' + op);
    assert(a.matches(text(valid)) && !a.matches(text(invalid)), op);
  }
  for (const [op, valid, invalid] of [
    [
      'Avro to JSON',
      [
        79,
        98,
        106,
        1,
        2,
        22,
        ...Buffer.from('avro.schema'),
        12,
        ...Buffer.from('"null"'),
        0,
        ...Array(16).fill(0),
      ],
      [79, 98, 106, 1],
    ],
    ['BSON deserialise', [5, 0, 0, 0, 0], [6, 0, 0, 0, 0]],
    ['Parse TLV', [1, 2, 65, 66], [1, 3, 65, 66]],
  ]) {
    const a = adapters.find((a) => a.id === 'binary-record/' + op);
    assert(a.observation && a.terminal);
    assert(a.matches({ type: 'bytes', bytes: Uint8Array.from(valid) }));
    assert(!a.matches({ type: 'bytes', bytes: Uint8Array.from(invalid) }));
    assert(!a.matches(text('ordinary')));
  }
  assert(CONDITIONAL_OPERATIONS.includes('From Float'));
  assert(!adapters.some((a) => a.id === 'chef-puzzle/From Float'));
  for (const code of ['TIMEOUT', 'ENGINE_UNAVAILABLE']) {
    const err = Object.assign(Error('Error parsing Avro file.'), { code });
    assert.equal(parserError(err, 'Avro to JSON'), err);
  }
  const fault = new TypeError('Unexpected input found');
  assert.equal(parserError(fault, 'Analyse UUID'), fault);
});

const append = adapter('append', async (input, params) => ({
  artifact: text(input.text + params.suffix),
}));
const step = (id, params = {}) => ({ adapter: id, params });

test('dictionary reports remain observations instead of decoded answer candidates', async () => {
  const words = puzzleAdapters().find((a) => a.id === 'puzzle/words:anagram');
  const session = createAnalysisSession({
    adapters: [{ ...words, run: async () => ({ artifact: text('hello\nwhole\nhole') }) }],
  });
  const report = await session.runPlan(text('hello'), [step(words.id)]);
  const candidate = textCandidates(report)[0];
  assert.equal(candidate.observation, true);
  assert.equal(candidate.text, 'hello\nwhole\nhole');
  assert.equal(report.nodes[report.resultId].expandable, false);
  session.dispose();
});

test('format decodes precede statistical guesses and dictionary observations', () => {
  const report = {
    nodes: [
      { id: 0, artifact: text('encoded') },
      { id: 1, artifact: text('Detts'), hypothesis: true },
      { id: 2, artifact: text('Hello') },
      { id: 3, artifact: text('hello\nwhole\nhole'), observation: true },
    ],
    edges: [1, 2, 3].map((to) => ({
      from: 0,
      to,
      status: 'completed',
      step: { adapter: 'test', params: {} },
      evidence: { kind: to === 2 ? 'heuristic' : 'format' },
    })),
  };
  assert.deepEqual(
    textCandidates(report).map((row) => row.id),
    [2, 1, 3],
  );
});

test('text-only public sessions reject bytes and files as initial inputs before engine execution', () => {
  const session = createClueAnalysis({ textOnly: true });
  for (const input of [
    { type: 'bytes', bytes: new Uint8Array([1]) },
    { type: 'files', files: [] },
  ]) {
    assert.throws(() => session.analyze(input), { code: 'INPUT_INVALID' });
    assert.throws(() => session.runPlan(input, []), { code: 'INPUT_INVALID' });
  }
  session.dispose();
});

test('candidate presentation preserves complete text and real shortest paths without binary reinterpretation', () => {
  const edge = (from, to, adapter) => ({
    from,
    to,
    status: 'completed',
    step: { adapter, params: {} },
  });
  const full = '\ufeffhello\r\n'.repeat(200);
  const report = {
    status: 'partial',
    nodes: [
      { id: 0, artifact: text('source') },
      { id: 1, artifact: { type: 'bytes', bytes: new Uint8Array([255, 0]) } },
      { id: 2, artifact: text(full) },
      { id: 3, artifact: text('') },
    ],
    edges: [
      edge(0, 1, 'decode'),
      edge(1, 2, 'utf8'),
      edge(2, 0, 'loop'),
      edge(0, 2, 'native'),
      edge(2, 3, 'empty'),
    ],
  };
  const candidates = textCandidates(report);
  assert.deepEqual(
    candidates.map((c) => c.id),
    [2, 3],
  );
  assert.equal(candidates[0].text, full);
  assert.equal(candidates[0].path.length, 1);
  assert.equal(candidates[0].path[0].step.adapter, 'native');
  assert.equal(candidates[0].incoming.length, 2);
  assert.equal(candidates[1].text, '');
  assert.equal(candidates[1].path.length, 2);
  assert.match(reportMessage(report, 2), /部分尝试失败/);
  assert.match(reportMessage(report, 2), /1 个非文本/);
  assert.match(reportMessage({ ...report, status: 'limited' }, 0), /并非穷尽/);
  assert.match(
    reportMessage({ ...report, status: 'completed', nodes: [] }, 0),
    /不表示文本没有编码/,
  );
});

test('typed snapshots preserve original bytes, BOM and CRLF and reject oversized/invalid data', async () => {
  const bytes = new Uint8Array([0, 255, 13, 10]);
  const copy = snapshot({ type: 'bytes', bytes }, 4);
  bytes[0] = 1;
  assert.deepEqual([...copy.artifact.bytes], [0, 255, 13, 10]);
  assert.equal(snapshot(text('\ufeffa\r\nb'), 10).artifact.text, '\ufeffa\r\nb');
  assert.throws(() => snapshot(text('中'), 2), { code: 'LIMIT_EXCEEDED' });
  assert.throws(() => snapshot({ type: 'bytes', bytes: [1] }, 10), { code: 'INPUT_INVALID' });
  assert.notEqual(
    await fingerprint(text('a')),
    await fingerprint({ type: 'bytes', bytes: new Uint8Array([97]) }),
  );
  assert.notEqual(await fingerprint(text('\ud800')), await fingerprint(text('\ufffd')));
  const files = snapshot(
    {
      type: 'files',
      files: [
        {
          name: '原始.bin',
          mediaType: 'application/octet-stream',
          bytes: new Uint8Array([0, 255]),
        },
      ],
    },
    100,
  ).artifact;
  assert.deepEqual([...files.files[0].bytes], [0, 255]);
  assert.notEqual(
    await fingerprint(files),
    await fingerprint({ ...files, files: [{ ...files.files[0], name: '其他.bin' }] }),
  );
  assert.throws(() => snapshot({ type: 'json', value: { n: Infinity } }, 100), {
    code: 'INPUT_INVALID',
  });
  const cyclic = {};
  cyclic.self = cyclic;
  assert.throws(() => jsonSnapshot(cyclic), { code: 'INPUT_INVALID' });
  assert.throws(() => analysisLimits({ nodes: 0 }), { code: 'INPUT_INVALID' });
  assert.throws(() => analysisLimits({ totalMs: Infinity }), { code: 'INPUT_INVALID' });
  assert.equal(errorRecord(new DOMException('stop', 'AbortError')).code, 'CANCELLED');
});

test('plan captures immutable params/results and resolved paths without leaking between sessions', async () => {
  const session = createAnalysisSession({ adapters: [append] });
  const plan = [step('append', { suffix: 'B' }), step('append', { suffix: 'C' })];
  const promise = session.runPlan(text('A'), plan);
  // Plan is expected to be snapshotted before an async input digest yields control.
  plan[1].params.suffix = 'wrong';
  const report = await promise;
  assert.equal(report.status, 'completed');
  assert.equal(report.nodes[report.resultId].artifact.text, 'ABC');
  assert.equal(report.edges.length, 2);
  assert.equal(session.isCurrent(report), true);
  report.nodes[0].artifact.text = 'changed';
  assert.equal(session.result.nodes[0].artifact.text, 'A');
  const other = createAnalysisSession({ adapters: [append] });
  assert.equal(other.result, null);
  assert.equal(
    (await other.runPlan(text('X'), [step('append', { suffix: 'Y' })])).nodes[1].artifact.text,
    'XY',
  );
  assert.equal(other.isCurrent(report), false);
  session.cancel();
  assert.equal(session.result, null);
  assert.equal(session.isCurrent(report), false);
});

test('rejects unregistered, remote, incompatible or excessive plans before any operation', async () => {
  let calls = 0;
  const local = adapter('local', async (input) => {
    calls++;
    return { artifact: input };
  });
  const remote = { ...local, id: 'remote', mode: 'external' };
  const session = createAnalysisSession({ adapters: [local, remote], limits: { depth: 2 } });
  const report = await session.runPlan(text('x'), [step('local'), step('remote')]);
  assert.equal(report.status, 'failed');
  assert.equal(report.errors[0].code, 'INTERACTION_REQUIRED');
  assert.equal(calls, 0);
  assert.equal((await session.runPlan(text('x'), [step('unknown')])).errors[0].code, 'UNSUPPORTED');
  assert.equal(
    (await session.runPlan({ type: 'bytes', bytes: new Uint8Array([1]) }, [step('local')]))
      .errors[0].code,
    'INPUT_INVALID',
  );
  assert.equal(
    (await session.runPlan(text('x'), [step('local'), step('local'), step('local')])).status,
    'limited',
  );
  assert.equal(calls, 0);
  assert.throws(() => createAdapterRegistry([local, local]), { code: 'INPUT_INVALID' });
});

test('graph keeps alternative paths but executes identical input/step once and stops cycles', async () => {
  let runs = 0;
  const a = adapter(
    'cycle',
    async (input, params) => {
      runs++;
      return { artifact: text(params.target) };
    },
    (input) => [
      { params: { target: input.text === 'A' ? 'B' : 'A' }, evidence: { kind: 'format' } },
      { params: { target: input.text === 'A' ? 'B' : 'A' }, evidence: { kind: 'format' } },
    ],
  );
  const b = adapter(
    'same',
    async () => ({ artifact: text('B') }),
    (input) => (input.text === 'A' ? [{ params: {} }] : []),
  );
  const report = await createAnalysisSession({ adapters: [a, b] }).analyze(text('A'));
  assert.equal(report.status, 'completed');
  assert.equal(report.nodes.length, 2);
  assert.equal(report.edges.length, 3);
  assert.equal(runs, 2);
  assert.equal(report.edges.filter((e) => e.duplicate).length, 2);
});

test('empty output remains a valid result and is distinct from engine failure', async () => {
  const empty = adapter('empty', async () => ({ artifact: text('') }));
  const report = await createAnalysisSession({ adapters: [empty] }).runPlan(text('abc'), [
    step('empty'),
  ]);
  assert.equal(report.status, 'completed');
  assert.equal(report.nodes[report.resultId].artifact.text, '');
});

test('explicit loops preserve executed path depth and adapter mutation cannot rewrite prior parameters', async () => {
  const change = adapter('change', async (_input, params) => {
    const target = params.target;
    params.target = 'mutated';
    return { artifact: text(target) };
  });
  const report = await createAnalysisSession({ adapters: [change] }).runPlan(text('A'), [
    step('change', { target: 'B' }),
    step('change', { target: 'A' }),
    step('change', { target: 'C' }),
  ]);
  assert.equal(report.status, 'completed');
  assert.equal(report.nodes[report.resultId].artifact.text, 'C');
  assert.deepEqual(
    report.edges.map((e) => e.depth),
    [1, 2, 3],
  );
  assert.deepEqual(
    report.edges.map((e) => e.step.params.target),
    ['B', 'A', 'C'],
  );
});

test('branch failure is recorded while other valid candidates continue', async () => {
  const bad = adapter(
    'bad',
    async () => {
      throw Error('invalid candidate');
    },
    () => [{ params: {} }],
  );
  const good = adapter(
    'good',
    async () => ({ artifact: { type: 'json', value: { found: true } } }),
    () => [{ params: {}, evidence: { kind: 'format' } }],
  );
  const report = await createAnalysisSession({ adapters: [bad, good] }).analyze(text('input'));
  assert.equal(report.status, 'partial');
  assert.equal(report.errors[0].code, 'EXECUTION_FAILED');
  assert.deepEqual(report.nodes.at(-1).artifact, { type: 'json', value: { found: true } });
});

test('output, retained memory, node, proposal, attempts and depth budgets report limited results', async () => {
  const grow = adapter(
    'grow',
    async (input, params) => ({ artifact: text(input.text + params.suffix) }),
    () => [{ params: { suffix: 'abc' } }, { params: { suffix: 'def' } }],
  );
  for (const limits of [
    { outputBytes: 2 },
    { retainedBytes: 3 },
    { nodes: 1 },
    { proposals: 1 },
    { records: 3 },
    { attempts: 1 },
    { depth: 1 },
  ]) {
    const report = await createAnalysisSession({ adapters: [grow], limits }).analyze(text('x'));
    assert.equal(report.status, 'limited', JSON.stringify(limits));
  }
});

test('abort terminates underlying work, invalidates prior output synchronously and allows recovery', async () => {
  let stopped = 0,
    started;
  const ready = new Promise((resolve) => {
    started = resolve;
  });
  const wait = adapter(
    'wait',
    (_input, _params, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener(
          'abort',
          () => {
            stopped++;
            reject(signal.reason);
          },
          { once: true },
        );
        started();
      }),
  );
  const session = createAnalysisSession({ adapters: [append, wait] });
  await session.runPlan(text('a'), [step('append', { suffix: 'b' })]);
  const promise = session.runPlan(text('a'), [step('wait')]);
  assert.equal(session.result, null);
  await ready;
  session.cancel();
  assert.equal(stopped, 1);
  assert.equal((await promise).status, 'cancelled');
  assert.equal(session.result, null);
  const next = await session.runPlan(text('c'), [step('append', { suffix: 'd' })]);
  assert.equal(next.nodes[next.resultId].artifact.text, 'cd');
});

test('task timeout and total timeout abort the adapter; late results cannot publish', async () => {
  let aborted = 0;
  const slow = adapter(
    'slow',
    (_input, _params, { signal }) =>
      new Promise((resolve) => {
        const timer = setTimeout(() => resolve({ artifact: text('late') }), 80);
        signal.addEventListener(
          'abort',
          () => {
            aborted++;
            clearTimeout(timer);
          },
          { once: true },
        );
      }),
  );
  for (const limits of [{ taskMs: 10 }, { totalMs: 10, taskMs: 200 }]) {
    const session = createAnalysisSession({ adapters: [slow], limits });
    const report = await session.runPlan(text('x'), [step('slow')]);
    assert.equal(report.status, 'limited');
    assert.equal(report.errors[0].code, 'TIMEOUT');
    assert.equal(report.nodes.length, 1);
  }
  assert.equal(aborted, 2);
});

test('new run cancels old run; pre-aborted and disposed sessions never execute', async () => {
  let entered;
  const ready = new Promise((resolve) => {
    entered = resolve;
  });
  const slow = adapter(
    'slow',
    (_input, _params, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        entered();
      }),
  );
  const session = createAnalysisSession({ adapters: [slow, append] });
  const old = session.runPlan(text('old'), [step('slow')]);
  await ready;
  const fresh = await session.runPlan(text('new'), [step('append', { suffix: '!' })]);
  assert.equal((await old).status, 'cancelled');
  assert.equal(session.result.nodes[session.result.resultId].artifact.text, 'new!');
  assert.equal(fresh.status, 'completed');
  const controller = new AbortController();
  controller.abort();
  assert.equal(
    (await session.runPlan(text('x'), [step('slow')], { signal: controller.signal })).status,
    'cancelled',
  );
  session.dispose();
  await assert.rejects(session.runPlan(text('x'), [step('append')]), { code: 'CANCELLED' });
});

test('parameters use original catalogue defaults and executable scope is explicitly bounded', async () => {
  const catalogue = JSON.parse(
    await readFile(new URL('../public/vendor/cyberchef/catalogue.json', import.meta.url)),
  ).operations;
  assert.deepEqual(defaults(catalogue['From Base64']), ['A-Za-z0-9+/=', true, false]);
  for (const name of LOCAL_CHEF_OPERATIONS) assert(catalogue[name], name);
  const registry = createAdapterRegistry([cyberChefAdapter()]);
  assert.equal(registry.resolve(step('cyberchef', { recipe: [{ op: 'From Base64' }] })).cost, 1);
  for (const op of ['HTTP request', 'JavaScript', 'Magic']) {
    assert.throws(() => registry.resolve(step('cyberchef', { recipe: [{ op }] })), {
      code: 'UNSUPPORTED',
    });
  }
  assert.throws(
    () => registry.resolve(step('cyberchef', { recipe: [{ op: 'From Base64', disabled: true }] })),
    { code: 'INPUT_INVALID' },
  );
});

test('known conditions are inventoried before budgets and prefix results stay in the same graph', async () => {
  const convert = {
    id: 'convert',
    capabilityId: 'native:example',
    mode: 'local',
    accepts: ['text'],
    matches: ({ text }) => text === 'encoded',
    suggest: () => [{ params: {} }],
    run: async () => ({ artifact: { type: 'text', text: 'decoded' } }),
  };
  const conditional = {
    ...convert,
    id: 'conditional',
    exploratory: true,
    matches: () => true,
    condition: '需要密钥',
  };
  const session = createAnalysisSession({
    adapters: [convert, conditional],
    limits: { attempts: 1 },
  });
  const report = await session.analyze({ type: 'text', text: 'encoded' });
  assert(
    report.checks.some((row) => row.adapter === 'conditional' && row.status === 'needs-input'),
  );
  assert(report.nodes.some((node) => node.artifact.text === 'decoded'));
  const prefix = await session.analyze(
    { type: 'text', text: 'encoded' },
    { prefix: [{ adapter: 'convert', params: {} }] },
  );
  assert.equal(prefix.nodes[prefix.resultId].artifact.text, 'decoded');
  assert(prefix.edges.some((edge) => edge.from === 0 && edge.to === prefix.resultId));
  session.dispose();
});

test('hypothesis output continues format decoding without endlessly reapplying hypotheses', async () => {
  const make = (id, source, target, exploratory = false) => ({
    id,
    capabilityId: 'native:example',
    mode: 'local',
    accepts: ['text'],
    exploratory,
    matches: ({ text }) => text === source,
    suggest: () => [{ params: {} }],
    run: async () => ({ artifact: { type: 'text', text: target } }),
  });
  const session = createAnalysisSession({
    adapters: [
      make('guess', 'input', 'encoded', true),
      make('decode', 'encoded', 'answer'),
      make('second-guess', 'answer', 'unsupported-loop', true),
    ],
  });
  const report = await session.analyze({ type: 'text', text: 'input' });
  assert(report.nodes.some((node) => node.artifact.text === 'answer'));
  assert(!report.nodes.some((node) => node.artifact.text === 'unsupported-loop'));
  assert(
    report.checks.some((row) => row.adapter === 'second-guess' && row.status === 'not-expanded'),
  );
  session.dispose();
});

test('fair breadth scheduling gives each root adapter a turn before descendants or second proposals', async () => {
  const order = [];
  const make = (id, count) => ({
    ...adapter(
      id,
      async (input, params) => {
        order.push([input.text, id, params.i]);
        return { artifact: text(input.text + id + params.i) };
      },
      () => Array.from({ length: count }, (_, i) => ({ params: { i } })),
    ),
    matches: () => true,
  });
  const session = createAnalysisSession({
    adapters: [make('large', 20), make('late', 1)],
    limits: { depth: 2, attempts: 3 },
  });
  const report = await session.analyze(text('root'));
  assert.deepEqual(order, [
    ['root', 'large', 0],
    ['root', 'late', 0],
    ['root', 'large', 1],
  ]);
  assert.equal(report.status, 'limited');
});

test('sibling discovery cannot consume the budget reserved by an already matched input', async () => {
  const seed = {
    ...adapter(
      'seed',
      async (_, { value }) => ({ artifact: text(value) }),
      () => ['first', 'second', 'third'].map((value) => ({ params: { value } })),
    ),
    matches: (input) => input.text === 'root',
  };
  const decode = adapter(
    'decode',
    async () => ({ artifact: text('answer') }),
    (input) => (input.text === 'first' ? [{ params: {} }] : []),
  );
  const session = createAnalysisSession({
    adapters: [seed, decode],
    limits: { depth: 2, attempts: 6 },
  });
  try {
    const report = await session.analyze(text('root'));
    assert(report.nodes.some((n) => n.artifact.text === 'answer'));
    assert.equal(report.status, 'limited');
  } finally {
    session.dispose();
  }
});

test('continuous mode accepts no count/time budget; finish aborts actual work while retaining completed results', async () => {
  let started,
    aborted = false;
  const ready = new Promise((resolve) => {
    started = resolve;
  });
  const work = {
    ...adapter(
      'work',
      async (input, params, { signal }) => {
        if (params.i === 0) return { artifact: text('answer') };
        return new Promise((resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => {
              aborted = true;
              reject(signal.reason);
            },
            { once: true },
          );
          started();
        });
      },
      () => [{ params: { i: 0 } }, { params: { i: 1 } }],
    ),
    matches: () => true,
  };
  const session = createAnalysisSession({
    adapters: [work],
    limits: { attempts: null, proposals: null, totalMs: null },
  });
  const pending = session.analyze(text('source'));
  await ready;
  session.finish();
  const report = await pending;
  assert(aborted);
  assert(session.isCurrent(report));
  assert.equal(report.nodes[1].artifact.text, 'answer');
  session.cancel();
  assert.equal(session.result, null);
});

test('known parser rejection and unavailable encoding do not turn automatic probing into engine failure', async () => {
  const reject = (code) => ({
    ...adapter(
      code,
      async () => {
        const error = new Error(code);
        error.code = code;
        throw error;
      },
      () => [{ params: {} }],
    ),
    matches: () => true,
  });
  const report = await createAnalysisSession({
    adapters: [reject('INPUT_INVALID'), reject('UNSUPPORTED')],
  }).analyze(text('x'));
  assert.equal(report.status, 'completed');
  assert.equal(report.errors.length, 0);
  assert.deepEqual(
    report.edges.map((e) => e.status),
    ['rejected', 'unavailable'],
  );
});

test('continuous exploration can combine distinct generic transformations within depth, without disabling deduplication', async () => {
  const rows = [
    {
      ...adapter(
        'first',
        async () => ({ artifact: text('middle') }),
        (input) => (input.text === 'source' ? [{ params: {} }] : []),
      ),
      exploratory: true,
      matches: () => true,
    },
    {
      ...adapter(
        'second',
        async () => ({ artifact: text('answer') }),
        (input) => (input.text === 'middle' ? [{ params: {} }] : []),
      ),
      exploratory: true,
      matches: () => true,
    },
  ];
  const session = createAnalysisSession({
    adapters: rows,
    expandHypotheses: true,
    limits: { depth: 2, attempts: null, proposals: null, totalMs: null },
  });
  const report = await session.analyze(text('source'));
  assert(report.nodes.some((n) => n.artifact.text === 'answer'));
  assert.equal(report.edges.length, 2);
});

function transition(id, source, target, exploratory = false) {
  return {
    ...adapter(
      id,
      async () => ({ artifact: text(target) }),
      () => [{ params: {} }],
    ),
    matches: (input) => input.text === source,
    exploratory,
  };
}

test('invalid pinyin is a parser rejection while unrelated dictionary faults remain failures', () => {
  assert.equal(
    parserError(new Error('【spellInfo】错误的拼音: khoor, 请检查字符是否正确')).code,
    'INPUT_INVALID',
  );
  for (const error of [
    new TypeError('Cannot read properties of undefined'),
    new Error('完整部件字库载入失败。'),
  ]) {
    assert.equal(parserError(error), error);
  }
});

test('converging format and speculative paths do not depend on adapter order', async () => {
  for (const reverse of [false, true]) {
    const routes = [
      transition('guess', 'source', 'middle', true),
      transition('format', 'source', 'middle'),
    ];
    if (reverse) routes.reverse();
    const report = await createAnalysisSession({
      adapters: [...routes, transition('next-guess', 'middle', 'answer', true)],
      limits: { depth: 2 },
    }).analyze(text('source'));
    assert(
      report.nodes.some((n) => n.artifact.text === 'answer'),
      `adapter order ${reverse}`,
    );
  }
});

test('explicit known conditions permit subsequent generic analysis', async () => {
  const report = await createAnalysisSession({
    adapters: [
      transition('known', 'source', 'middle', true),
      transition('guess', 'middle', 'answer', true),
    ],
    limits: { depth: 2 },
  }).analyze(text('source'), { prefix: [step('known')] });
  assert(report.nodes.some((n) => n.artifact.text === 'answer'));
});

test('repeated identity steps in a supplied prefix execute exactly as requested', async () => {
  let calls = 0;
  const identity = adapter('identity', async (input) => {
    calls++;
    return { artifact: input };
  });
  const report = await createAnalysisSession({ adapters: [identity] }).analyze(text('source'), {
    prefix: [step('identity'), step('identity')],
  });
  assert.notEqual(report.status, 'failed');
  assert.equal(calls, 2);
  assert.equal(report.nodes[report.resultId].artifact.text, 'source');
});

test('longer format routes reuse computed results without borrowing speculative route depth', async () => {
  for (const depth of [3, 4]) {
    let calls = 0;
    const decode = transition('decode', 'middle', 'decoded');
    decode.run = async () => {
      calls++;
      return { artifact: text('decoded') };
    };
    const report = await createAnalysisSession({
      adapters: [
        transition('guess', 'source', 'middle', true),
        transition('format-1', 'source', 'other'),
        transition('format-2', 'other', 'middle'),
        decode,
        transition('next-guess', 'decoded', 'answer', true),
      ],
      limits: { depth },
    }).analyze(text('source'));
    assert.equal(
      report.nodes.some((n) => n.artifact.text === 'answer'),
      depth === 4,
    );
    assert.equal(calls, 1, 'one computation is reused for both path policies');
  }
});

test('an observation sharing a format result cannot mark that result as terminal observation only', async () => {
  for (const reverse of [false, true]) {
    const routes = [
      { ...transition('observe', 'source', 'middle'), terminal: true, observation: true },
      transition('format', 'source', 'middle'),
    ];
    if (reverse) routes.reverse();
    const report = await createAnalysisSession({
      adapters: [...routes, transition('continue', 'middle', 'answer')],
    }).analyze(text('source'));
    assert.equal(report.nodes.find((n) => n.artifact.text === 'middle').observation, false);
    assert(report.nodes.some((n) => n.artifact.text === 'answer'));
  }
});
