import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { chooseNativeTask } from './browser-navigation.mjs';
import { chromium } from '../test-tools/node_modules/playwright/index.mjs';
import { startBrowserTestSite } from './browser-test-site.mjs';

const cases = [
  'first-open',
  'runtime-reuse',
  'depth-controls',
  'audit-continuation',
  'audit-regressions',
  'audit-parameters',
  'audit-page',
  'audit-engines',
  'chain',
  'magic',
  'native',
  'cancel',
  'chef-cancel',
  'failure',
  'schema',
  'text',
  'page',
  'page-content',
  'manual',
  'puzzle-engines',
  'puzzle-auto',
  'puzzle-conditions',
  'puzzle-page',
  'puzzle-observations',
  'puzzle-hanzi',
  'puzzle-charsets',
  'puzzle-catalogs',
];
const selected =
  process.argv
    .find((v) => v.startsWith('--case='))
    ?.slice(7)
    .split(',') || cases;
assert(
  selected.every((v) => cases.includes(v)),
  '未知的线索分析测试用例',
);
const site = await startBrowserTestSite();
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  const context = await browser.newContext();
  // Algorithm/page regressions start after the discovery puzzle. The separate
  // browser-analysis-unlock suite verifies the real locked-to-unlocked flow.
  await context.addInitScript(() =>
    localStorage.setItem('arg.discovery.text-analysis.v1', 'solved-v1'),
  );
  const outside = [];
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(site.base + '/__clue-test'))
      return route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>分析接口验证</title>',
      });
    if (!url.startsWith(site.base + '/')) {
      outside.push(url);
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  await page.goto(site.base + '/__clue-test');
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const initialize = () =>
    page.evaluate(async () => {
      window.foundation = await import('/clue-analysis/index.js');
      window.createSession = (limits = {}) =>
        window.foundation.createClueAnalysis({
          limits: {
            depth: 6,
            taskMs: 30000,
            totalMs: 90000,
            ...limits,
          },
        });
    });
  await initialize();
  assert.equal(page.workers().length, 0, 'import must not start engines');
  for (const name of selected) {
    if (name === 'first-open') {
      const tab = await context.newPage();
      const engines = [];
      let catalogues = 0;
      tab.on('worker', (worker) => {
        if (worker.url().endsWith('/cyberchef-worker.js')) engines.push(worker);
      });
      tab.on('request', (request) => {
        if (request.url().endsWith('/vendor/cyberchef/catalogue.json')) catalogues++;
      });
      await tab.goto(site.base + '/#home');
      await tab.waitForFunction(() => document.documentElement.dataset.startupState === 'ready');
      assert.equal(engines.length, 0);
      await chooseNativeTask(tab, 'native:cipher-detect');
      await tab.waitForFunction(() => !document.getElementById('panel-analysis').hidden);
      const first = engines[0] || (await tab.waitForEvent('worker'));
      const closed = first.waitForEvent('close');
      await tab.evaluate(() => {
        location.hash = 'home';
      });
      await closed;
      await chooseNativeTask(tab, 'native:cipher-detect');
      const value = await tab.evaluate(async () => {
        const { cyberChefAdapter } = await import('/clue-analysis/chef-adapter.js');
        return (
          await cyberChefAdapter({ textOnly: true }).run(
            { type: 'text', text: '48656c6c6f' },
            { recipe: [{ op: 'From Hex' }] },
            { signal: new AbortController().signal },
          )
        ).artifact.text;
      });
      assert.equal(value, 'Hello');
      assert.equal(engines.length, 2, 'one initialization for each visit, including execution');
      assert.equal(catalogues, 1, 'reuse the catalogue already read for navigation');
      await tab.close();
      for (const saveData of [false, true]) {
        const fresh = await browser.newPage();
        await fresh.addInitScript((saveData) => {
          if (saveData) {
            localStorage.setItem('arg.discovery.text-analysis.v1', 'solved-v1');
            Object.defineProperty(navigator, 'connection', { value: { saveData: true } });
          }
        }, saveData);
        const started = [];
        fresh.on('worker', (worker) => started.push(worker.url()));
        await fresh.goto(site.base + '/#analysis?task=native%3Acipher-detect');
        await fresh.waitForFunction(
          () => document.documentElement.dataset.startupState === 'ready',
        );
        assert(!started.some((url) => url.endsWith('/cyberchef-worker.js')));
        assert.equal(await fresh.locator('#analysis-magic').isVisible(), saveData);
        await fresh.close();
      }
    }
    if (name === 'runtime-reuse') {
      const created = [];
      const collect = (worker) => created.push(worker.url());
      page.on('worker', collect);
      const result = await page.evaluate(async () => {
        const { cyberChefAdapter } = await import('/clue-analysis/chef-adapter.js');
        const chef = cyberChefAdapter({ textOnly: true });
        const run = (text, op) =>
          chef.run(
            { type: 'text', text },
            { recipe: [{ op }] },
            { signal: new AbortController().signal },
          );
        const first = await run('48656c6c6f', 'From Hex');
        let error;
        try {
          await run('!invalid!', 'Raw Inflate');
        } catch (e) {
          error = e.message;
        }
        const next = await run('576f726c64', 'From Hex');
        const { workerJob, createAnalysisWorkerPool } =
          await import('/clue-analysis/worker-job.js');
        const pool = createAnalysisWorkerPool();
        const url = new URL('/clue-analysis/worker.js', location.href);
        const native = (text, signal = new AbortController().signal) =>
          workerJob(url, { operation: 'cipher-statistics', text }, { signal, workerPool: pool });
        const nativeFirst = await native('AAAA');
        const controller = new AbortController();
        const interrupted = native('BBBB', controller.signal);
        controller.abort(new Error('test stop'));
        let stopped;
        try {
          await interrupted;
        } catch (e) {
          stopped = e.message;
        }
        const nativeNext = await native('CCCC');
        pool.dispose();
        const session = foundation.createClueAnalysis({
          textOnly: true,
          puzzle: true,
          limits: { depth: 1, attempts: 256, nodes: 4096, proposals: null, totalMs: 30000 },
        });
        const report = await session.analyze({ type: 'text', text: 'QWxmYSBCcmF2byBDaGFybGll' });
        session.dispose();
        return {
          first: first.artifact.text,
          next: next.artifact.text,
          nativeFirst: nativeFirst.artifact.value.counts,
          nativeNext: nativeNext.artifact.value.counts,
          stopped,
          error,
          attempts: report.attempts,
          texts: report.nodes.map((n) => n.artifact.text),
        };
      });
      page.off('worker', collect);
      assert.equal(result.first, 'Hello');
      assert.equal(result.next, 'World');
      assert.equal(result.stopped, 'test stop');
      assert.equal(result.nativeFirst[0], 4);
      assert.equal(result.nativeNext[0], 0);
      assert.equal(result.nativeNext[2], 4);
      assert.match(result.error, /input buffer is broken/);
      assert.equal(result.attempts, 256);
      assert(result.texts.includes('Alfa Bravo Charlie'));
      assert(created.filter((url) => url.endsWith('/cyberchef-worker.js')).length <= 1);
      assert.equal(created.filter((url) => url.endsWith('/puzzle-worker.js')).length, 1);
      await page.waitForFunction(() => true);
      assert(
        !page.workers().some((worker) => worker.url().endsWith('/puzzle-worker.js')),
        'completed sessions release their native workers',
      );
    }
    if (name === 'depth-controls') {
      await page.goto(site.base + '/?layout=chronicle#analysis?task=native%3Acipher-detect');
      await chooseNativeTask(page, 'native:cipher-detect');
      await page.evaluate(async () => {
        const { setPreferences } = await import('/preferences.js');
        setPreferences({ showAdvancedParameters: false });
      });
      assert.equal(await page.locator('#analysis-depth option').count(), 16);
      assert.equal(await page.locator('#analysis-depth').inputValue(), '3');
      const depthField = page.locator('#analysis-depth').locator('..');
      assert.equal(await depthField.isVisible(), true);
      assert.equal(await depthField.locator('[role="combobox"]').isVisible(), true);
      await page.locator('#analysis-depth').selectOption('16');
      assert.equal(await page.locator('#analysis-depth').inputValue(), '16');
      await page.locator('#analysis-input').fill('QWxmYSBCcmF2byBDaGFybGll');
      await page.locator('#analysis-magic').click();
      await page.locator('#analysis-depth').selectOption('1');
      assert.equal(await page.locator('#analysis-magic').isEnabled(), true);
      assert.equal(await page.locator('#analysis-output').inputValue(), '');
      await page.setViewportSize({ width: 320, height: 640 });
      assert.equal(await depthField.isVisible(), true);
      await page.goto(site.base + '/__clue-test');
      await initialize();
    }
    if (name === 'audit-continuation') {
      const result = await page.evaluate(async () => {
        const { CLASSICAL_CIPHERS, runClassical } = await import('/expansion/classical-core.js');
        const definition = CLASSICAL_CIPHERS.find((row) => row.id === 'autokey');
        const options = Object.fromEntries(
          definition.fields.map((field) => [field.id, field.default]),
        );
        options.key = 'SECRET';
        const ciphertext = runClassical('autokey', 'KHOOR', {
          ...options,
          direction: 'encrypt',
        }).text;
        const session = foundation.createClueAnalysis({
          textOnly: true,
          puzzle: true,
          limits: {
            depth: 2,
            attempts: 1024,
            nodes: 1024,
            proposals: null,
            totalMs: 120000,
            taskMs: 10000,
          },
        });
        const report = await session.analyze(
          { type: 'text', text: ciphertext },
          {
            prefix: [{ adapter: 'puzzle/classical:autokey', params: { options } }],
          },
        );
        const { textCandidates } = await import('/clue-analysis/presentation.js');
        const answer = textCandidates(report).find((row) => row.text === 'HELLO');
        session.dispose();
        const { createAnalysisSession } = await import('/clue-analysis/session.js');
        const { puzzleAdapters } = await import('/clue-analysis/puzzle-adapters.js');
        const rows = [];
        for (const expandHypotheses of [false, true]) {
          const session = createAnalysisSession({
            adapters: puzzleAdapters().filter((row) =>
              ['puzzle/engine:reverse', 'puzzle/caesar:3'].includes(row.id),
            ),
            expandHypotheses,
            limits: { depth: 2, attempts: null, proposals: null, totalMs: null, taskMs: 10000 },
          });
          const report = await session.analyze({ type: 'text', text: 'ROOHK' });
          rows.push({
            expandHypotheses,
            found: report.nodes.some((n) => n.artifact.text === 'HELLO'),
            errors: report.errors,
          });
          session.dispose();
        }
        return {
          known: Boolean(answer),
          path: answer?.path.map((edge) => edge.step.adapter),
          errors: report.errors,
          rows,
        };
      });
      assert(result.known, JSON.stringify(result));
      assert.equal(result.path[0], 'puzzle/classical:autokey');
      assert.equal(result.errors.length, 0, JSON.stringify(result));
      for (const row of result.rows) {
        assert.equal(row.found, row.expandHypotheses, JSON.stringify(result));
        assert.equal(row.errors.length, 0, JSON.stringify(result));
      }
      console.log('continuation:', JSON.stringify(result));
    }
    if (name === 'audit-regressions') {
      const rows = await page.evaluate(async () => {
        const rows = [];
        for (const [input, expected, key, depth] of [
          ['KHOOR 123', 'HELLO 123', '', 1],
          ['1', 'A', '', 1],
          ['180,225', 'A', '', 1],
          ['DEEZQFEKR#TJ', 'ATTACKAADAWN', 'LEMON', 1],
          ['2K{^w', '你好', '', 2],
        ]) {
          const session = foundation.createClueAnalysis({
            textOnly: true,
            puzzle: true,
            key,
            limits: {
              depth,
              attempts: 8192,
              nodes: 4096,
              proposals: null,
              totalMs: 120000,
              taskMs: 10000,
            },
          });
          const report = await session.analyze({ type: 'text', text: input });
          rows.push({
            input,
            found: report.nodes.some((n) => n.artifact.text === expected),
            attempts: report.attempts,
            errors: report.errors,
            unavailable: report.edges.filter((e) => e.status === 'unavailable').length,
            rootLate: report.edges.some((e) => e.from === 0 && e.adapter === 'affine-search'),
          });
          session.dispose();
        }
        return rows;
      });
      for (const row of rows) {
        assert(row.found, JSON.stringify(row));
        assert.equal(row.errors.length, 0, JSON.stringify(row));
      }
      assert(rows[0].rootLate, 'root affine exploration must execute');
      console.log('PASS audit-regressions', JSON.stringify(rows));
    }
    if (name === 'audit-parameters') {
      const rows = await page.evaluate(async () => {
        const { CLASSICAL_CIPHERS, runClassical } = await import('/expansion/classical-core.js');
        const rows = [];
        for (const cipher of CLASSICAL_CIPHERS) {
          const options = Object.fromEntries(
            cipher.fields.map((field) => [field.id, field.default]),
          );
          if ('squareKey' in options) options.squareKey = 'SECRET';
          if ('key' in options) options.key = 'LEMON';
          if ('period' in options) options.period = 7;
          const plaintext = 'ATTACKATDAWN';
          const ciphertext = runClassical(cipher.id, plaintext, {
            ...options,
            direction: 'encrypt',
          }).text;
          const expected = runClassical(cipher.id, ciphertext, {
            ...options,
            direction: 'decrypt',
          }).text;
          const session = foundation.createClueAnalysis({ textOnly: true, puzzle: true });
          const report = await session.runPlan({ type: 'text', text: ciphertext }, [
            { adapter: 'puzzle/classical:' + cipher.id, params: { options } },
          ]);
          rows.push({
            cipher: cipher.id,
            expected,
            actual: report.nodes[report.resultId]?.artifact.text,
            errors: report.errors,
          });
          session.dispose();
        }
        const session = foundation.createClueAnalysis({
          textOnly: true,
          puzzle: true,
          limits: {
            depth: 1,
            attempts: 1024,
            nodes: 1024,
            proposals: null,
            totalMs: 90000,
            taskMs: 15000,
          },
        });
        for (const [input, expected] of [
          ['(answer:hello)', 'hello'],
          ['eyJhbnN3ZXIiOiJoZWxsbyJ9.ZAAAAA.signature', 'hello'],
          ['ＡＢＣ', 'ABC'],
          ['a\u200bb', 'U+200B'],
        ]) {
          const report = await session.analyze({ type: 'text', text: input });
          rows.push({
            cipher: input,
            found: report.nodes.some((n) =>
              (n.artifact.text || JSON.stringify(n.artifact.value) || '').includes(expected),
            ),
            errors: report.errors,
          });
        }
        session.dispose();
        return rows;
      });
      for (const row of rows) {
        if ('found' in row) assert(row.found, JSON.stringify(row));
        else assert.equal(row.actual, row.expected, JSON.stringify(row));
      }
      console.log('PASS audit-parameters', JSON.stringify(rows));
    }
    if (name === 'audit-engines') {
      const results = await page.evaluate(async () => {
        const session = foundation.createClueAnalysis({
          textOnly: true,
          puzzle: true,
          limits: { depth: 3, taskMs: 120000, totalMs: 300000 },
        });
        const rotor = [
          'EKMFLGDQVZNTOWYHXUSPAIBRCJ<R',
          'AJDKSIRUXBLHWTMCQGZNPYFVOE<F',
          'BDFHJLCPRTXVZNYEIWGAKMUSQO<W',
        ];
        const rows = [];
        const cases = [
          [
            'Bombe',
            'BBYFLTHHYIJQAYBBYS',
            [
              '3-rotor',
              '',
              ...rotor,
              'AY BR CU DH EQ FS GL IP JX KN MO TZ VW',
              'THISISATESTMESSAGE',
              0,
              false,
            ],
            'LGA',
          ],
          [
            'Multiple Bombe',
            'BBYFLTHHYIJQAYBBYS',
            [
              'User defined',
              rotor.join('\n'),
              '',
              'AY BR CU DH EQ FS GL IP JX KN MO TZ VW',
              'THISISATESTMESSAGE',
              0,
              false,
            ],
            'LGA',
          ],
          ['Rison Decode', '(answer:hello)', ['Decode'], 'hello'],
          ['Flask Session Decode', 'eyJhbnN3ZXIiOiJoZWxsbyJ9.ZAAAAA.signature', [false], 'hello'],
          ['Normalise Unicode', 'ＡＢＣ', ['NFKC'], 'ABC'],
          ['AMF Decode', '02000568656c6c6f', ['AMF0'], 'hello'],
          ['AMF Decode', '060b68656c6c6f', ['AMF3'], 'hello'],
          ['CBOR Decode', 'a166616e737765726568656c6c6f', [], 'hello'],
          ['From MessagePack', '81a6616e73776572a568656c6c6f', [], 'hello'],
          ['Protobuf Decode', '0a0568656c6c6f', ['', true, true], 'hello'],
        ];
        for (const [op, input, args, expected] of cases) {
          const recipe = [
            ...(['AMF Decode', 'CBOR Decode', 'From MessagePack', 'Protobuf Decode'].includes(op)
              ? [{ op: 'From Hex', args: ['Auto'] }]
              : []),
            { op, args },
          ];
          const report = await session.runPlan({ type: 'text', text: input }, [
            { adapter: 'cyberchef', params: { recipe } },
          ]);
          const artifact = report.nodes[report.resultId]?.artifact;
          const value = artifact?.text || JSON.stringify(artifact?.value) || '';
          rows.push({
            op,
            ok: report.status === 'completed' && value.includes(expected),
            type: artifact?.type,
            preview: value.slice(0, 100),
            errors: report.errors,
          });
        }
        session.dispose();
        return rows;
      });
      for (const row of results) assert(row.ok, JSON.stringify(row));
      console.log('PASS audit-engines', JSON.stringify(results));
    }
    if (name === 'audit-page') {
      await page.goto(site.base + '/?layout=chronicle#analysis?task=native%3Acipher-detect');
      await page.locator('#analysis-input').waitFor({ state: 'visible' });
      await page.locator('#analysis-input').fill('KHOOR 123');
      const known = page
        .locator('details')
        .filter({ has: page.locator('#analysis-conditional-operation') });
      await known.locator('summary').click();
      await page.locator('#analysis-conditional-operation').selectOption('native:adfgx');
      await page.locator('#analysis-native-squareKey').fill('SECRET');
      await page.locator('#analysis-native-key').fill('LEMON');
      assert.equal(await page.locator('#analysis-native-squareKey').inputValue(), 'SECRET');
      const cipher = await page.evaluate(async () => {
        const { runClassical } = await import('/expansion/classical-core.js');
        document.getElementById('analysis-depth').value = '2';
        document.getElementById('analysis-depth').dispatchEvent(new Event('change'));
        return runClassical('adfgx', 'ATTACKATDAWN', {
          direction: 'encrypt',
          squareKey: 'SECRET',
          key: 'LEMON',
        }).text;
      });
      await page.locator('#analysis-input').fill(cipher);
      await known.getByRole('button', { name: '按这些条件解密并继续分析' }).click();
      await page.waitForFunction(() => !document.getElementById('analysis-magic').disabled, null, {
        timeout: 60000,
      });
      assert(
        await page
          .locator('#analysis-candidates')
          .textContent()
          .then((text) => text.includes('ATTACKATDAWN')),
        'native full parameter prefix is usable from UI',
      );
      await page.locator('#analysis-conditional-operation').selectOption('CBOR Decode');
      await page.locator('#analysis-conditional-format').waitFor({ state: 'visible' });
      await page.locator('#analysis-input').fill('a166616e737765726568656c6c6f');
      await known.getByRole('button', { name: '按这些条件解密并继续分析' }).click();
      await page.waitForFunction(() => !document.getElementById('analysis-magic').disabled, null, {
        timeout: 30000,
      });
      assert.match(await page.locator('#analysis-output').inputValue(), /hello/);
      await page.locator('#analysis-input').fill('KHOOR 123 '.repeat(50));
      await page.locator('#analysis-magic').click();
      await page.waitForFunction(() =>
        /第 [1-9]/.test(document.getElementById('analysis-status')?.textContent || ''),
      );
      await page.waitForTimeout(1500);
      await page.locator('#analysis-stop').click();
      await page.waitForFunction(() => !document.getElementById('analysis-magic').disabled, null, {
        timeout: 15000,
      });
      assert.equal(
        await page.locator('#analysis-export').isDisabled(),
        false,
        'finish keeps report',
      );
      await page.locator('#analysis-input').fill('changed');
      assert.equal(
        await page.locator('#analysis-export').isDisabled(),
        true,
        'editing invalidates report',
      );
      console.log('PASS audit-page');
      await page.goto(site.base + '/__clue-test');
      await initialize();
    }
    if (name === 'puzzle-catalogs') {
      const result = await page.evaluate(async () => {
        const { catalogAdapters } = await import('/clue-analysis/catalog-adapters.js');
        const context = { signal: new AbortController().signal };
        const adapters = catalogAdapters();
        const braille = adapters.find((row) => row.id === 'braille-tables');
        const input = { type: 'text', text: '⠓⠑⠇⠇⠕' };
        const tables = await braille.suggest(input, context);
        const english = tables.find((row) => row.params.table === 'en-ueb-g1.ctb');
        const decoded = await braille.run(input, english.params, context);
        const vigenere = adapters.find((row) => row.id === 'vigenere-search');
        const cipher = { type: 'text', text: 'LXFOPVEFRNHRLXFOPVEFRNHRLXFOPVEFRNHR' };
        const keys = await vigenere.suggest(cipher, context);
        const candidate = await vigenere.run(cipher, keys[0].params, context);
        const { createAnalysisWorkerPool } = await import('/clue-analysis/worker-job.js');
        const { transform } = await import('/engine.js');
        const affine = adapters.find((row) => row.id === 'affine-search');
        const pool = createAnalysisWorkerPool();
        let jobs = 0;
        const pooled = {
          ...context,
          workerPool: {
            take(url) {
              jobs++;
              return pool.take(url);
            },
            release: pool.release,
          },
        };
        try {
          const mixed = { type: 'text', text: 'Alfa BRAVO 123!' };
          const trials = await affine.suggest(mixed, pooled);
          if (trials.length !== 312) throw Error('Missing affine parameters');
          for (const { params } of trials) {
            const actual = await affine.run(mixed, params, pooled);
            if (actual.artifact.text !== (await transform('affine', mixed.text, 'decode', params)))
              throw Error('Scored affine output differs from the original transform');
          }
          if (jobs !== 1) throw Error('The scored trials were executed twice');
          const other = { type: 'text', text: 'Bravo!' };
          const { params } = trials[0];
          const fallback = await affine.run(other, params, pooled);
          if (
            jobs !== 2 ||
            fallback.artifact.text !== (await transform('affine', other.text, 'decode', params))
          )
            throw Error('A different input must use its own transform');
        } finally {
          pool.dispose();
        }
        return {
          tables: tables.length,
          text: decoded.artifact.text,
          keys: keys.length,
          candidate: candidate.artifact.text,
        };
      });
      assert(result.tables > 100, JSON.stringify(result));
      assert.equal(result.text, 'hello');
      assert(result.keys > 0 && result.candidate.length === 36, JSON.stringify(result));
    }
    if (name === 'puzzle-charsets') {
      const result = await page.evaluate(async () => {
        const session = foundation.createClueAnalysis({
          textOnly: true,
          puzzle: true,
          limits: {
            depth: 2,
            attempts: 256,
            nodes: 256,
            proposals: 256,
            taskMs: 10000,
            totalMs: 60000,
          },
        });
        const report = await session.analyze(
          { type: 'text', text: 'c4 e3 ba c3' },
          { prefix: [{ adapter: 'cyberchef', params: { recipe: [{ op: 'From Hex' }] } }] },
        );
        session.dispose();
        return {
          found: report.nodes.some((node) => node.artifact.text === '你好'),
          charsets: report.checks.find(
            (row) => row.adapter === 'character-encodings' && row.proposals,
          )?.proposals,
          status: report.status,
          errors: report.errors.slice(0, 3),
        };
      });
      assert(result.found, JSON.stringify(result));
      assert.equal(result.charsets, 152);
    }
    if (name === 'puzzle-hanzi') {
      const result = await page.evaluate(async () => {
        const session = foundation.createClueAnalysis({
          textOnly: true,
          puzzle: true,
          limits: { taskMs: 30000, totalMs: 60000 },
        });
        const rows = [];
        for (const [mode, text] of [
          ['properties', '永'],
          ['component', '木木'],
          ['sound', 'yong3'],
          ['stroke', '5'],
          ['four', '1000'],
          ['cangjie', 'E'],
          ['wubi', 'II'],
          ['idiom', '一?一?'],
          ['xhy', '泥菩萨'],
        ]) {
          const report = await session.runPlan({ type: 'text', text }, [
            { adapter: 'puzzle/hanzi-lookup:' + mode, params: {} },
          ]);
          rows.push({
            mode,
            text: report.nodes.find((node) => node.id === report.resultId)?.artifact?.text,
            errors: report.errors,
          });
        }
        session.dispose();
        return rows;
      });
      for (const row of result) {
        assert.equal(row.errors.length, 0, JSON.stringify(row));
        assert.equal(typeof row.text, 'string', row.mode);
        if (row.mode === 'properties') {
          assert.match(row.text, /5 笔/);
          assert.match(row.text, /6C38/);
        }
        if (row.mode === 'component') assert.match(row.text, /林/);
        if (row.mode === 'sound' || row.mode === 'stroke') assert.match(row.text, /永/);
        if (row.mode === 'cangjie' || row.mode === 'wubi') assert.match(row.text, /水/);
        if (row.mode === 'idiom') assert.match(row.text, /一心一意/);
      }
    }
    if (name === 'puzzle-observations') {
      const result = await page.evaluate(async () => {
        const { createJob } = await import('/fun-tools/client.js');
        const { completionJob } = await import('/completion/job.js');
        const session = foundation.createClueAnalysis({
          textOnly: true,
          puzzle: true,
          limits: { taskMs: 30000, totalMs: 60000 },
        });
        const rows = [];
        async function run(id, text, key = '') {
          const report = await session.runPlan({ type: 'text', text }, [
            { adapter: 'puzzle/' + id, params: { key } },
          ]);
          const output = report.nodes.find((node) => node.id === report.resultId)?.artifact?.text;
          rows.push({ id, output, errors: report.errors });
          return output;
        }
        for (const [id, task, options] of [
          ['buddha', 'buddha-codec', { password: 'lemon' }],
          [
            'stegcloak',
            'text-steganography',
            {
              engine: 'stegcloak',
              password: 'lemon',
              secret: 'hidden answer',
              encrypt: true,
              integrity: true,
            },
          ],
        ]) {
          const job = createJob();
          const encoded = await job.run({
            kind: 'text',
            task,
            text: id === 'buddha' ? 'hidden answer' : 'cover message',
            options: { ...options, direction: 'encode' },
          });
          await run(id, encoded, 'lemon');
        }
        await run('t9', '43556');
        await run('words:anagram', 'listen');
        await run('words:regex', '^hello$');
        await run('dictionary-substitution', 'hello world');
        for (const [id, task, options] of [
          ['semaphore:angle', 'semaphore-batch', { representation: 'angle' }],
          ['gs8', 'gs8', { syntax: 'text' }],
        ]) {
          const value = await completionJob({
            task,
            input: 'ABC',
            options: { ...options, direction: 'encode' },
          });
          await run(id, value.output);
        }
        session.dispose();
        return rows;
      });
      for (const row of result) {
        assert.equal(row.errors.length, 0, JSON.stringify(row));
        assert.equal(typeof row.output, 'string', row.id);
        if (['buddha', 'stegcloak'].includes(row.id)) assert.equal(row.output, 'hidden answer');
        if (row.id === 't9') assert.match(row.output, /hello/i);
        if (row.id === 'words:anagram') assert.match(row.output, /silent/i);
        if (row.id === 'words:regex') assert.equal(row.output, 'hello');
        if (['semaphore:angle', 'gs8'].includes(row.id)) assert.equal(row.output, 'ABC');
      }
    }
    if (name === 'puzzle-page') {
      await page.goto(site.base + '/?layout=chronicle#analysis?task=native%3Acipher-detect');
      await chooseNativeTask(page, 'native:cipher-detect');
      await page.locator('#analysis-input').fill('LXFOPVEFRNHR');
      await page.locator('#analysis-puzzle-key').fill('LEMON');
      await page.locator('#analysis-magic').click();
      await page.waitForFunction(() => !document.getElementById('analysis-magic').disabled, null, {
        timeout: 65000,
      });
      await page
        .locator('[data-clue-candidate]')
        .filter({ hasText: 'ATTACKATDAWN' })
        .first()
        .click();
      assert.equal(await page.locator('#analysis-output').inputValue(), 'ATTACKATDAWN');
      assert(await page.locator('#analysis-coverage').count());
      await page.locator('#analysis-puzzle-key').fill('OTHER');
      assert.equal(await page.locator('#analysis-output').inputValue(), '');
      assert.equal(await page.locator('#analysis-save').isEnabled(), false);
      const conditions = page
        .locator('details')
        .filter({ has: page.locator('#analysis-conditional-operation') });
      await conditions.locator('summary').first().click();
      await page.locator('#analysis-conditional-operation').selectOption('AES Decrypt');
      await conditions.locator('[data-arg="0"] input').waitFor();
      assert(
        (await conditions.locator('[data-arg]').count()) >= 9,
        'original AES parameter fields retained',
      );
      await conditions.locator('summary').first().click();
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          'no overflow at ' + width,
        );
        await mkdir('outputs/text-analysis', { recursive: true });
        await page.screenshot({ path: 'outputs/text-analysis/puzzle-' + width + '.png' });
      }
      await page.locator('#analysis-input').fill('A'.repeat(2000));
      await page.locator('#analysis-magic').click();
      await page.locator('#analysis-stop').click();
      assert.equal(await page.locator('#analysis-output').inputValue(), '');
      await page.waitForTimeout(200);
      assert.equal(
        page
          .workers()
          .filter((worker) =>
            /clue-analysis|substitution-worker|fun-tools\/worker|completion\/.*worker/.test(
              worker.url(),
            ),
          ).length,
        0,
        'stop terminates original puzzle workers',
      );
      await chooseNativeTask(page, 'native:extract-first');
      await page.locator('#extract-input').fill('Apple\nBravo\nCat');
      assert.equal(await page.locator('#extract-mode').inputValue(), 'first');
      await page.locator('#extract-run').click();
      assert.equal(
        await page.locator('#extract-output').inputValue(),
        'ABC',
        'original extraction page uses the same owner',
      );
    }
    if (name === 'puzzle-engines') {
      const results = await page.evaluate(async () => {
        const { BYTE_CODECS, encodeBytes } = await import('/completion/bytes.js');
        const { runClassical } = await import('/expansion/classical-core.js');
        const { CLASSICAL_CIPHERS } = await import('/expansion/classical-catalog.js');
        const { textTransform } = await import('/fun-tools/text-engine.js');
        const { PUZZLE_PROFILES, puzzleOptions } =
          await import('/clue-analysis/puzzle-profiles.js');
        const output = [];
        async function check(id, input, expected, key = '') {
          const session = foundation.createClueAnalysis({
            textOnly: true,
            puzzle: true,
            key,
            limits: { taskMs: 30000, totalMs: 60000 },
          });
          const report = await session.runPlan({ type: 'text', text: input }, [
            { adapter: 'puzzle/' + id, params: { key } },
          ]);
          output.push({
            id,
            expected,
            actual: report.nodes.find((node) => node.id === report.resultId)?.artifact?.text,
            errors: report.errors,
          });
          session.dispose();
        }
        for (const codec of BYTE_CODECS)
          await check(
            'bytes:' + codec,
            encodeBytes(new TextEncoder().encode('Hello puzzle'), codec),
            'Hello puzzle',
          );
        for (const definition of CLASSICAL_CIPHERS) {
          const profile = PUZZLE_PROFILES.find((item) => item.id === 'classical:' + definition.id);
          const options = { ...puzzleOptions(profile, 'LEMON'), direction: 'encrypt' };
          await check(
            profile.id,
            runClassical(definition.id, 'ATTACKATDAWN', options).text,
            'ATTACKATDAWN',
            'LEMON',
          );
        }
        await check('vigenere:key', 'LXFOPVEFRNHR', 'ATTACKATDAWN', 'LEMON');
        await check('engine:braille', '⠁⠃⠉', 'ABC');
        await check('caesar:3', 'KHOOR', 'HELLO');
        await check('mapping:ninekey', '21 22 23', 'abc');
        await check(
          'beast',
          textTransform('beast-codec', '你好 puzzle', { direction: 'encode', alphabet: '嗷呜啊~' }),
          '你好 puzzle',
        );
        await check(
          'watermark',
          textTransform('text-steganography', 'cover text', {
            engine: 'watermark',
            direction: 'encode',
            secret: 'hidden clue',
            password: 'abc',
            position: 'end',
          }),
          'hidden clue',
          'abc',
        );
        await check('extract:first', 'Apple\nBravo\nCat', 'ABC');
        await check('extract:last', 'Alpha\nBravo\nCat', 'aot');
        await check('extract:indices', 'Apple\nBravo\nCat', 'Art', '1 2 3');
        await check('extract:transpose', 'ABC\nDEF', 'AD\nBE\nCF');
        await check('hanzi:first', '中国', 'z g');
        await check('hanzi:simplified', '漢語', '汉语');
        await check('integer:base37', '14491', 'ALO');
        return output;
      });
      for (const result of results)
        assert.equal(result.actual, result.expected, JSON.stringify(result));
      console.log('native puzzle round trips:', results.length);
    }
    if (name === 'puzzle-conditions') {
      const result = await page.evaluate(async () => {
        const session = foundation.createClueAnalysis({
          puzzle: true,
          textOnly: true,
          limits: { depth: 2, totalMs: 60000, attempts: 128, nodes: 128 },
        });
        // NIST AES-128 ECB known block; binary must remain bytes.
        const aes = await session.runPlan(
          { type: 'text', text: '69c4e0d86a7b0430d8cdb78070b4c55a' },
          [
            {
              adapter: 'cyberchef',
              params: {
                recipe: [
                  {
                    op: 'AES Decrypt',
                    args: [
                      { option: 'Hex', string: '000102030405060708090a0b0c0d0e0f' },
                      { option: 'Hex', string: '' },
                      16,
                      'ECB/NoPadding',
                      'Hex',
                      'Raw',
                      { option: 'Hex', string: '' },
                      { option: 'Hex', string: '' },
                      'Off',
                    ],
                  },
                ],
              },
            },
          ],
        );
        const prefix = await session.analyze(
          { type: 'text', text: 'QWxmYSBCcmF2byBDaGFybGll' },
          { prefix: [{ adapter: 'cyberchef', params: { recipe: [{ op: 'From Base64' }] } }] },
        );
        const missed = await session.analyze({ type: 'text', text: 'LXFOPVEFRNHR' });
        session.dispose();
        return {
          aes: aes.nodes.find((node) => node.id === aes.resultId)?.artifact,
          errors: aes.errors,
          prefix: prefix.nodes.some((node) => node.artifact.text === 'ABC'),
          missing: missed.checks.some(
            (row) => row.adapter === 'puzzle/vigenere:key' && row.status === 'needs-input',
          ),
        };
      });
      assert.equal(result.aes?.type, 'bytes', JSON.stringify(result));
      assert.deepEqual(
        Array.from(result.aes.bytes),
        Array.from({ length: 16 }, (_, i) => i * 17),
      );
      assert(result.prefix && result.missing, JSON.stringify(result));
    }
    if (name === 'puzzle-auto') {
      const result = await page.evaluate(async () => {
        const { encodeBytes } = await import('/completion/bytes.js');
        const session = foundation.createClueAnalysis({
          puzzle: true,
          textOnly: true,
          key: 'LEMON',
          limits: {
            depth: 3,
            attempts: 256,
            nodes: 256,
            proposals: 64,
            totalMs: 60000,
            taskMs: 10000,
          },
        });
        const cross = await session.analyze({
          type: 'text',
          text: encodeBytes(new TextEncoder().encode('Alfa Bravo Charlie'), 'base91'),
        });
        const keyed = await session.analyze({ type: 'text', text: 'LXFOPVEFRNHR' });
        session.dispose();
        return {
          cross: cross.nodes.some((node) => node.artifact.text === 'ABC'),
          key: keyed.nodes.some((node) => node.artifact.text === 'ATTACKATDAWN'),
          status: [cross.status, keyed.status],
          checked: keyed.checks.length,
          errors: keyed.errors.slice(0, 4),
        };
      });
      assert(result.cross, JSON.stringify(result));
      assert(result.key, JSON.stringify(result));
      console.log('automatic puzzle results:', result);
    }
    if (name === 'chain') {
      const result = await page.evaluate(async () => {
        const session = createSession();
        const original = Array(60).fill('Alfa Bravo Charlie').join(' ');
        const report = await session.runPlan({ type: 'text', text: btoa(original) }, [
          { adapter: 'cyberchef', params: { recipe: [{ op: 'From Base64' }] } },
          { adapter: 'utf8-text' },
          { adapter: 'nato', params: { direction: 'decode' } },
        ]);
        const result = {
          status: report.status,
          errors: report.errors,
          text: report.nodes[report.resultId]?.artifact.text,
          intermediate: report.nodes[2]?.artifact.text,
          args: report.edges[0]?.step.params.recipe[0].args,
        };
        const binary = await session.runPlan({ type: 'text', text: 'AP8NCg==' }, [
          {
            adapter: 'cyberchef',
            params: { recipe: [{ op: 'From Base64', args: ['A-Za-z0-9+/=', true, false] }] },
          },
        ]);
        result.binary = Array.from(binary.nodes[binary.resultId]?.artifact.bytes || []);
        session.dispose();
        return result;
      });
      assert.equal(result.status, 'completed', JSON.stringify(result.errors));
      assert.equal(result.text, 'ABC'.repeat(60));
      assert.equal(result.intermediate, Array(60).fill('Alfa Bravo Charlie').join(' '));
      assert.deepEqual(result.args, ['A-Za-z0-9+/=', true, false]);
      assert.deepEqual(result.binary, [0, 255, 13, 10]);
    }
    if (name === 'magic') {
      const result = await page.evaluate(async () => {
        const { cyberChefAdapter } = await import('/clue-analysis/chef-adapter.js');
        const adapter = cyberChefAdapter(),
          controller = new AbortController();
        const original = 'Hello, complete result.\r\n'.repeat(25);
        const input = { type: 'text', text: btoa(original) };
        const candidates = await adapter.suggest(input, { signal: controller.signal });
        const candidate = candidates.find(
          (v) => v.params.recipe.length === 1 && v.params.recipe[0].op === 'From Base64',
        );
        if (!candidate) throw Error('Magic 未产生 Base64 候选');
        const session = createSession();
        const report = await session.runPlan(input, [
          { adapter: 'cyberchef', params: candidate.params },
          { adapter: 'utf8-text' },
        ]);
        const output = report.nodes[report.resultId]?.artifact.text;
        session.dispose();
        controller.abort();
        // Exercise the actual bounded explorer with a native branch as well.
        const auto = createSession({ attempts: 20, nodes: 12, depth: 2 });
        const graph = await auto.analyze({ type: 'text', text: 'Zulu Uniform Lima Uniform' });
        auto.dispose();
        return {
          status: report.status,
          original,
          output,
          native: graph.nodes.some((n) => n.artifact.text === 'ZULU'),
          errors: graph.errors,
        };
      });
      assert.equal(result.status, 'completed');
      assert.equal(result.output, result.original, 'never recurse on the 100-character preview');
      assert.equal(result.native, true, JSON.stringify(result.errors));
    }
    if (name === 'native') {
      const result = await page.evaluate(async () => {
        const session = createSession();
        const roman = await session.runPlan({ type: 'text', text: 'XIV XLII' }, [
          { adapter: 'roman', params: { direction: 'decode' } },
        ]);
        const stats = await session.runPlan({ type: 'text', text: 'KHOOR ZRUOG' }, [
          { adapter: 'cipher-statistics' },
        ]);
        const bad = await session.runPlan({ type: 'bytes', bytes: new Uint8Array([255]) }, [
          { adapter: 'utf8-text' },
        ]);
        const data = {
          roman: roman.nodes[roman.resultId]?.artifact.text,
          stats: stats.nodes[stats.resultId]?.artifact,
          bad: bad.errors[0]?.code,
        };
        session.dispose();
        return data;
      });
      assert.equal(result.roman, '14\n42');
      assert.equal(result.stats.type, 'json');
      assert(result.stats.value.shifts.some((v) => v.shift === 3 && v.text === 'HELLO WORLD'));
      assert.equal(result.bad, 'INPUT_INVALID');
    }
    if (name === 'cancel') {
      // Intercept the actual constructor so termination of the executing Worker is observed.
      const result = await page.evaluate(async () => {
        (await import('/idle-worker.js')).clearIdleLookup();
        const NativeWorker = window.Worker;
        let created = 0,
          terminated = 0;
        window.Worker = class extends NativeWorker {
          constructor(...args) {
            super(...args);
            created++;
          }
          terminate() {
            terminated++;
            super.terminate();
          }
        };
        const session = createSession();
        try {
          const pending = session.runPlan({ type: 'text', text: 'Alfa Bravo' }, [
            { adapter: 'nato', params: { direction: 'decode' } },
          ]);
          while (!created) await new Promise((r) => setTimeout(r, 0));
          session.cancel();
          const cancelled = await pending;
          const terminatedOnCancel = terminated;
          const immediate = session.result;
          const next = await session.runPlan({ type: 'text', text: 'Alfa Bravo' }, [
            { adapter: 'nato', params: { direction: 'decode' } },
          ]);
          return {
            created,
            terminatedOnCancel,
            status: cancelled.status,
            immediate,
            output: next.nodes[next.resultId]?.artifact.text,
          };
        } finally {
          session.dispose();
          window.Worker = NativeWorker;
        }
      });
      assert.equal(result.status, 'cancelled');
      assert.equal(result.immediate, null);
      assert.equal(result.terminatedOnCancel, 1);
      assert.equal(result.created, 2);
      assert.equal(result.output, 'AB');
    }
    if (name === 'chef-cancel') {
      const result = await page.evaluate(async () => {
        const { acquireCyberChef } = await import('/cyberchef-client.js');
        // Discard only this test page's idle client to observe a fresh execution.
        acquireCyberChef().close();
        const NativeWorker = window.Worker;
        let created = 0,
          terminated = 0;
        window.Worker = class extends NativeWorker {
          constructor(...args) {
            super(...args);
            created++;
          }
          terminate() {
            terminated++;
            super.terminate();
          }
        };
        const session = createSession();
        try {
          const plan = [{ adapter: 'cyberchef', params: { recipe: [{ op: 'From Base64' }] } }];
          const pending = session.runPlan({ type: 'text', text: 'SGVsbG8=' }, plan);
          const deadline = performance.now() + 5000;
          while (!created && performance.now() < deadline)
            await new Promise((r) => setTimeout(r, 0));
          if (!created) throw Error('测试未启动 CyberChef Worker');
          session.cancel();
          const stopped = await pending;
          const terminatedOnCancel = terminated;
          const next = await session.runPlan({ type: 'text', text: 'SGVsbG8=' }, plan);
          return {
            status: stopped.status,
            terminatedOnCancel,
            next: next.status,
            bytes: [...next.nodes[next.resultId].artifact.bytes],
          };
        } finally {
          session.dispose();
          window.Worker = NativeWorker;
        }
      });
      assert.equal(result.status, 'cancelled');
      assert.equal(result.terminatedOnCancel, 1);
      assert.equal(result.next, 'completed');
      assert.deepEqual(result.bytes, [...Buffer.from('Hello')]);
    }
    if (name === 'failure') {
      await context.route('**/clue-analysis/worker.js', (route) =>
        route.fulfill({ status: 503, body: 'unavailable' }),
      );
      const failed = await page.evaluate(async () => {
        const session = createSession();
        const report = await session.runPlan({ type: 'text', text: 'XIV' }, [
          { adapter: 'roman', params: { direction: 'decode' } },
        ]);
        session.dispose();
        return report;
      });
      assert.equal(failed.status, 'failed');
      assert.equal(failed.errors[0].code, 'ENGINE_UNAVAILABLE');
      await context.unroute('**/clue-analysis/worker.js');
      const recovered = await page.evaluate(async () => {
        const session = createSession();
        const report = await session.runPlan({ type: 'text', text: 'XIV' }, [
          { adapter: 'roman', params: { direction: 'decode' } },
        ]);
        session.dispose();
        return report.nodes[report.resultId]?.artifact.text;
      });
      assert.equal(recovered, '14');
    }
    if (name === 'schema') {
      const result = await page.evaluate(async () => {
        const schema = await import('/chef-tools/schema.js');
        const model = await import('/chef-tools/parameter-model.js');
        const catalogue = await (await fetch('/vendor/cyberchef/catalogue.json')).json();
        const definition = catalogue.operations['From Base64'];
        const fields = document.createElement('div');
        document.body.append(fields);
        const current = { op: 'From Base64', args: schema.defaults(definition) };
        schema.renderParameters(fields, definition, current, () => {});
        const initial = [...current.args];
        const checkbox = fields.querySelector('input[type=checkbox]');
        checkbox.checked = false;
        checkbox.dispatchEvent(new Event('change'));
        fields.remove();
        return { same: schema.defaults === model.defaults, initial, changed: current.args };
      });
      assert.equal(result.same, true);
      assert.deepEqual(result.initial, ['A-Za-z0-9+/=', true, false]);
      assert.deepEqual(result.changed, ['A-Za-z0-9+/=', false, false]);
    }
    if (name === 'text') {
      const result = await page.evaluate(
        async (compressedText) => {
          const { createClueAnalysis } = await import('/clue-analysis/index.js');
          const { localAdapters } = await import('/clue-analysis/local-adapters.js');
          const session = createClueAnalysis({
            textOnly: true,
            limits: { depth: 3, totalMs: 60000, taskMs: 20000 },
          });
          const auto = await session.analyze({ type: 'text', text: 'QWxmYSBCcmF2byBDaGFybGll' });
          const get = async (text, adapter, params) => {
            const r = await session.runPlan({ type: 'text', text }, [{ adapter, params }]);
            return r.nodes.find((n) => n.id === r.resultId)?.artifact;
          };
          const tap = await get('. . . .. . ...', 'tapcode', { mode: 'tap', direction: 'decode' });
          const polybius = await get('11 12 13', 'tapcode', {
            mode: 'polybius',
            size: '5',
            direction: 'decode',
          });
          const baudot = await get('00001 00011', 'baudot', {
            alphabet: 'ITA2',
            format: 'binary',
            direction: 'decode',
          });
          const invisible = await get('a\u200bb', 'invisible', {
            action: 'inspect',
            preserve: true,
          });
          const binary = await get('AP8NCg==', 'cyberchef', { recipe: [{ op: 'From Base64' }] });
          const bom = await get('77u/aGVsbG8NCg==', 'cyberchef', {
            recipe: [{ op: 'From Base64' }],
          });
          const compressed = await session.analyze({ type: 'text', text: compressedText });
          const proposals = Object.fromEntries(
            localAdapters()
              .filter((a) => ['tapcode', 'baudot'].includes(a.id))
              .map((a) => [
                a.id,
                a.suggest({ type: 'text', text: a.id === 'tapcode' ? '11 12 13' : '00001 00011' }),
              ]),
          );
          session.dispose();
          return {
            nodes: auto.nodes,
            errors: auto.errors,
            tap,
            polybius,
            baudot,
            invisible,
            binary: Array.from(binary.bytes || []),
            bom,
            proposals,
            compressed,
          };
        },
        gzipSync(Buffer.from('Compressed text\r\n'.repeat(20))).toString('base64'),
      );
      assert(
        result.nodes.some((n) => n.artifact.text === 'ABC'),
        JSON.stringify(result.errors),
      );
      assert.equal(result.tap.text, 'ABC');
      assert.equal(result.polybius.text, 'ABC');
      assert.equal(result.baudot.text, 'EA');
      assert.match(result.invisible.text, /200B.*码点位置 1/i);
      assert.deepEqual(result.binary, [0, 255, 13, 10]);
      assert.equal(result.bom.text, '\ufeffhello\r\n');
      assert.equal(result.proposals.tapcode.length, 2);
      assert.equal(result.proposals.baudot.length, 3);
      assert(
        result.compressed.nodes.some((n) => n.artifact.text === 'Compressed text\r\n'.repeat(20)),
        JSON.stringify(result.compressed.errors),
      );
    }
    if (name === 'page') {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(site.base + '/?layout=chronicle#analysis?task=native%3Acipher-detect');
      await chooseNativeTask(page, 'native:cipher-detect');
      assert.equal(await page.locator('#analysis-depth').locator('..').isVisible(), true);
      await page.locator('#analysis-input').fill('QWxmYSBCcmF2byBDaGFybGll');
      await page.locator('#analysis-magic').click();
      await page.waitForFunction(() => !document.getElementById('analysis-magic').disabled, null, {
        timeout: 45000,
      });
      const cross = page
        .locator('[data-clue-candidate]')
        .filter({ hasText: '无线电拼读字母' })
        .filter({ has: page.locator('span', { hasText: /^ABC$/ }) })
        .first();
      await cross.click();
      assert.equal(await page.locator('#analysis-output').inputValue(), 'ABC');
      assert.match(await page.locator('#analysis-trace').textContent(), /Base64/);
      assert.match(await page.locator('#analysis-trace').textContent(), /无线电拼读/);
      assert.equal(await page.locator('#analysis-copy').isEnabled(), true);
      const recordButtons = page.locator('#panel-analysis .result-recording button');
      assert.equal(await recordButtons.first().isEnabled(), true);
      await mkdir('outputs/text-analysis', { recursive: true });
      for (const width of [1440, 800, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.locator('#analysis-input').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `horizontal overflow ${width}`,
        );
        if (width === 1440) {
          const input = await page.locator('#analysis-input').boundingBox();
          const output = await page.locator('#analysis-output').boundingBox();
          assert(Math.abs(input.y - output.y) < 3, 'input/output aligned');
        }
        await page.screenshot({ path: `outputs/text-analysis/page-${width}.png` });
      }
      await page.locator('#analysis-input').fill('changed');
      assert.equal(await page.locator('#analysis-output').inputValue(), '');
      assert.equal(await page.locator('[data-clue-candidate]').count(), 0);
      assert.equal(await recordButtons.first().isEnabled(), false);
      await page.locator('#analysis-input').fill('a\u200bb');
      await page.locator('#analysis-invisible').click();
      await page.waitForFunction(() => !document.getElementById('analysis-magic').disabled);
      assert.match(await page.locator('#analysis-output').inputValue(), /200B/i);
      await page.locator('#analysis-input').fill('KHOOR ZRUOG');
      await page.locator('#analysis-statistics > summary').click();
      await page.locator('#analysis-run').click();
      await page.waitForFunction(() =>
        document.getElementById('analysis-summary').textContent.includes('重合指数'),
      );
      await page
        .locator('#analysis-statistics-details')
        .getByRole('button')
        .filter({ hasText: 'HELLO WORLD' })
        .click();
      assert.equal(await page.locator('#analysis-output').inputValue(), 'HELLO WORLD');
      await page.locator('#analysis-input').fill('SGVsbG8=');
      assert.equal(
        await page.evaluate(() => {
          document.getElementById('analysis-magic').click();
          const enabled = !document.getElementById('analysis-stop').disabled;
          document.getElementById('analysis-stop').click();
          return enabled;
        }),
        true,
        'stop is enabled during an active request',
      );
      assert.equal(await page.locator('#analysis-output').inputValue(), '');
      await page.waitForTimeout(500);
      assert.equal(await page.locator('[data-clue-candidate]').count(), 0);
      // A new request after stopping is allowed, and leaving revokes its output.
      await page.locator('#analysis-magic').click();
      await page.waitForFunction(() => !document.getElementById('analysis-magic').disabled, null, {
        timeout: 45000,
      });
      assert.equal(await page.locator('#analysis-output').inputValue(), 'Hello');
      await page.evaluate(async () => {
        const { setPreferences } = await import('/preferences.js');
        setPreferences({ showAdvancedParameters: true });
      });
      await page.locator('#analysis-depth').selectOption('2');
      assert.equal(await page.locator('#analysis-output').inputValue(), '');
      assert.equal(await page.locator('#analysis-export').isEnabled(), false);
      await page.locator('#analysis-input').fill('你好，普通文本。');
      await page.locator('#analysis-magic').click();
      await page.waitForFunction(() => !document.getElementById('analysis-magic').disabled, null, {
        timeout: 45000,
      });
      assert(
        (await page.locator('[data-clue-candidate]').filter({ hasText: 'nǐ hǎo' }).count()) > 0,
        'Chinese text now produces original pinyin candidates',
      );
      await page.locator('#analysis-input').fill('PHNjcmlwdD53aW5kb3cuYmFkPXRydWU8L3NjcmlwdD4=');
      await page.locator('#analysis-magic').click();
      await page.waitForFunction(() => !document.getElementById('analysis-magic').disabled, null, {
        timeout: 45000,
      });
      assert.equal(
        await page.evaluate(() => window.bad),
        undefined,
        'candidate markup must stay inert',
      );
      assert((await page.locator('[data-clue-candidate]').count()) > 0);
      await page.evaluate(() => {
        location.hash = 'home';
      });
      await page.waitForFunction(() => document.getElementById('panel-analysis').hidden);
      assert.equal(await page.locator('#analysis-output').inputValue(), '');
      assert.equal(await recordButtons.first().isEnabled(), false);
    }
    if (name === 'page-content') {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.goto(site.base + '/?layout=chronicle#analysis?task=native%3Acipher-detect');
      await chooseNativeTask(page, 'native:cipher-detect');
      const original = '汉字线索'.repeat(150) + '\r\n完整内容结束';
      await page.locator('#analysis-input').fill(Buffer.from(original).toString('base64'));
      await page.locator('#analysis-magic').click();
      await page.waitForFunction(() => !document.getElementById('analysis-magic').disabled, null, {
        timeout: 45000,
      });
      await page.locator('[data-clue-candidate]').filter({ hasText: '汉字线索' }).first().click();
      assert.equal(
        await page.locator('#analysis-output').inputValue(),
        original.replaceAll('\r\n', '\n'),
      );
      const pending = page.waitForEvent('download');
      await page.locator('#analysis-save').click();
      const saved = await pending;
      assert.equal(
        await readFile(await saved.path(), 'utf8'),
        original,
        'download preserves full text and original CRLF',
      );
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        'long candidate wraps at 320px',
      );
      const recordDownload = page.waitForEvent('download');
      await page.locator('#analysis-export').click();
      const report = JSON.parse(await readFile(await (await recordDownload).path(), 'utf8'));
      assert(report.nodes.some((node) => node.artifact.text === original));
      assert(
        report.edges.some((edge) => edge.step.params.recipe?.[0]?.args?.length),
        'resolved original parameters exported',
      );
      // An invalid next input must revoke the previous downloadable result.
      await page.locator('#analysis-input').fill('中'.repeat(23000));
      await page.locator('#analysis-magic').click();
      assert.match(await page.locator('#analysis-status').textContent(), /最多 64 KB/);
      assert.equal(await page.locator('#analysis-save').isEnabled(), false);
    }
    if (name === 'manual') {
      await page.goto(site.base + '/?layout=chronicle#analysis?task=native%3Acipher-detect');
      await chooseNativeTask(page, 'native:cipher-detect');
      await page.evaluate(async () => {
        const { connectNotebook } = await import('/handoff/button.js');
        connectNotebook(async (request) => {
          window.statCapture = await request.read();
        });
      });
      await page.locator('#analysis-input').fill('HELLO HELLO');
      await page.locator('#analysis-statistics > summary').click();
      await page.locator('#analysis-run').click();
      await page.locator('#analysis-result-notebook:enabled').waitFor();
      await page.locator('#analysis-result-notebook').click();
      await page.waitForFunction(() => window.statCapture);
      assert.equal(JSON.parse(await page.evaluate(() => window.statCapture.text)).total, 11);
      await page.locator('#analysis-input').fill('LXFOPVEFRNHR');
      assert.equal(await page.locator('#analysis-result-notebook').isEnabled(), false);
      await page.locator('#analysis-key').fill('LEMON');
      await page.locator('#analysis-vig').click();
      assert.equal(await page.locator('#analysis-output').inputValue(), 'ATTACKATDAWN');
      await page.locator('#analysis-key').fill('OTHER');
      assert.equal(await page.locator('#analysis-output').inputValue(), '');
      assert.equal(await page.locator('#analysis-result-notebook').isEnabled(), false);
    }
    console.log('PASS', name);
  }
  assert.deepEqual(outside, [], 'analysis must not contact external services');
  assert.deepEqual(errors, [], 'no uncaught page errors');
} finally {
  await browser?.close();
  await site.close();
}
