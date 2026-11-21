import { workerJob } from './worker-job.js';
import { completionJob } from '../completion/job.js';
import { fail } from './data.js';

export function catalogAdapters() {
  // A pool belongs to one analysis. Keep at most four scored inputs (each
  // at most 4096 characters) while interleaved branches consume their trials.
  const affineTrials = new WeakMap();
  return [
    {
      id: 'vigenere-search',
      title: 'Vigenère 周期与密钥候选',
      capabilityId: 'op:Vigen%C3%A8re%20Decode',
      mode: 'local',
      accepts: ['text'],
      exploratory: true,
      async suggest(input, context) {
        if (
          !/^[A-Za-z0-9\s.,!?':;()#/_-]+$/.test(input.text) ||
          input.text.replace(/[^A-Za-z]/g, '').length < 30 ||
          input.text.length > 20000
        )
          return [];
        const periods = await workerJob(
          new URL('./puzzle-worker.js', import.meta.url),
          { id: 'vigenere-probe', text: input.text },
          context,
        );
        return periods.map((row) => ({
          params: { key: row.key },
          evidence: {
            kind: 'statistical',
            message: `原统计器估计周期 ${row.length}、密钥 ${row.key}；仅按英文频率提出假设，短文本尤其不稳定。`,
          },
        }));
      },
      run: (input, params, context) =>
        workerJob(
          new URL('./puzzle-worker.js', import.meta.url),
          { id: 'vigenere:key', text: input.text, key: params.key },
          context,
        ),
    },
    {
      id: 'affine-search',
      title: '仿射密码 312 组参数',
      capabilityId: 'op:Affine%20Cipher%20Decode',
      mode: 'local',
      accepts: ['text'],
      exploratory: true,
      async suggest(input, context) {
        if (
          !/^[A-Za-z0-9\s.,!?':;()#/_-]+$/.test(input.text) ||
          input.text.replace(/[^A-Za-z]/g, '').length < 3 ||
          input.text.length > 4096
        )
          return [];
        const rows = await workerJob(
          new URL('./puzzle-worker.js', import.meta.url),
          { id: 'affine-probe', text: input.text, includeText: Boolean(context.workerPool) },
          context,
        );
        if (context.workerPool) {
          const recent = affineTrials.get(context.workerPool) || new Map();
          recent.set(input.text, rows);
          if (recent.size > 4) recent.delete(recent.keys().next().value);
          affineTrials.set(context.workerPool, recent);
        }
        return rows.map(({ a, b, score }) => ({
          params: { a, b },
          evidence: {
            kind: 'statistical',
            message: `全部 312 组参数按原英文卡方分数排序；a=${a}、b=${b}，分数 ${score.toFixed(2)}。该排序不适用于所有语言，也不是正确概率。`,
          },
        }));
      },
      run(input, params, context) {
        const rows = affineTrials.get(context.workerPool)?.get(input.text);
        const scored = rows?.find((row) => row.a === params.a && row.b === params.b);
        if (scored) {
          context.signal.throwIfAborted();
          return { artifact: { type: 'text', text: scored.text } };
        }
        return workerJob(
          new URL('./puzzle-worker.js', import.meta.url),
          { id: 'affine-run', text: input.text, options: params },
          context,
        );
      },
    },
    {
      id: 'braille-tables',
      title: '多语言盲文规则表',
      capabilityId: 'native:braille-languages',
      mode: 'local',
      accepts: ['text'],
      async suggest(input, { signal }) {
        if (!/^[\u2800-\u28ff\s]+$/.test(input.text) || !input.text.trim()) return [];
        const response = await fetch(
          new URL('../vendor/completion/liblouis/tables.json', import.meta.url),
          { signal },
        );
        if (!response.ok) fail('ENGINE_UNAVAILABLE', '盲文完整规则目录载入失败。');
        const tables = await response.json();
        return tables.map((table) => ({
          params: { table: table.file },
          evidence: {
            kind: 'hypothesis',
            message: `按原规则表 ${table.name}（${table.file}）反译。盲文单元本身不能确定语言。`,
          },
        }));
      },
      async run(input, params, context) {
        const value = await completionJob(
          {
            task: 'braille-languages',
            input: input.text,
            options: { table: params.table, direction: 'decode' },
          },
          context,
        );
        return {
          artifact: { type: 'text', text: value.output },
          eligible: value.output.length > 0 && value.output !== input.text,
        };
      },
    },
  ];
}
