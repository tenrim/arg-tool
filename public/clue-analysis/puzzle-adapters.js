import { PUZZLE_PROFILES, puzzleOptions } from './puzzle-profiles.js';
import { workerJob } from './worker-job.js';
import { completionJob } from '../completion/job.js';
import { createJob } from '../fun-tools/client.js';
import { fail } from './data.js';
import { parserError } from './expected-errors.js';

const worker = new URL('./puzzle-worker.js', import.meta.url);
export function puzzleAdapters({ key = '' } = {}) {
  return [...PUZZLE_PROFILES]
    .sort((a, b) => Number(Boolean(b.needsKey && key)) - Number(Boolean(a.needsKey && key)))
    .map((profile) => ({
      id: 'puzzle/' + profile.id,
      capabilityId: profile.capabilityId,
      title: profile.title,
      mode: 'local',
      accepts: ['text'],
      exploratory: Boolean(profile.exploratory),
      priority: Boolean(profile.needsKey && key),
      terminal: Boolean(profile.terminal),
      observation: Boolean(profile.terminal),
      matches: (input) => Boolean(input.text && profile.matches(input.text.trim())),
      condition:
        profile.manual ||
        (profile.needsKey && !key
          ? profile.engine === 'extract'
            ? '需要提取索引；可在上方已知条件中填写。'
            : '需要密钥；填写上方密钥后重新分析。'
          : ''),
      suggest() {
        if (profile.manual || (profile.needsKey && !key)) return [];
        return [
          {
            params: { key },
            evidence: {
              kind: profile.exploratory ? 'hypothesis' : 'format',
              message: `${profile.title}：按原工具规则尝试${profile.needsKey ? '提供的密钥' : '默认约定'}。能转换不代表题目采用此规则。`,
            },
          },
        ];
      },
      async run(input, params, context) {
        const options = puzzleOptions(profile, params.key || '', params.options || {});
        if (profile.needsKey && !options[profile.keyField])
          fail('INTERACTION_REQUIRED', '此密码需要密钥。');
        let result;
        if (profile.engine === 'fun') {
          const job = createJob(),
            abort = () => job.cancel();
          if (context.signal.aborted) throw context.signal.reason;
          context.signal.addEventListener('abort', abort, { once: true });
          try {
            const text = await job.run({
              kind: 'text',
              task: options.task,
              text: input.text,
              options,
            });
            result = {
              artifact: { type: 'text', text },
              eligible: Boolean(text && text !== input.text),
            };
          } finally {
            context.signal.removeEventListener('abort', abort);
            job.cancel();
          }
        } else if (profile.engine === 'hanzi-lookup') {
          result = await workerJob(
            new URL('./hanzi-worker.js', import.meta.url),
            { text: input.text, mode: options.mode },
            { ...context, type: 'classic' },
          ).catch((error) => {
            throw parserError(error);
          });
        } else if (profile.engine === 'hunt') {
          const rows = await workerJob(
            new URL('../hunt-worker.js', import.meta.url),
            { task: 'words', query: input.text, grid: input.text, ...options },
            {
              ...context,
              workerPool: options.mode === 'code' ? undefined : context.workerPool,
              read: (data) => data.rows,
            },
          );
          result = {
            artifact: {
              type: 'text',
              text: rows
                .map((row) => (typeof row === 'string' ? row : JSON.stringify(row)))
                .join('\n'),
            },
            eligible: rows.length > 0,
          };
        } else if (profile.engine === 'dictionary-substitution') {
          const value = await workerJob(
            new URL('../expansion/worker.js', import.meta.url),
            { task: 'dictionary-substitution', input: input.text, options },
            context,
          );
          const text = [
            ...value.warnings,
            ...value.candidates.map(
              (row, index) =>
                `${index + 1}. ${row.text}\n替换表：${Object.entries(row.mapping)
                  .map(([a, b]) => a + '→' + b)
                  .join(' ')}`,
            ),
          ].join('\n\n');
          result = { artifact: { type: 'text', text }, eligible: value.candidates.length > 0 };
          options.searchComplete = value.complete;
          options.dictionaryEntries = value.dictionaryEntries;
        } else if (profile.engine === 'substitution') {
          const data = await workerJob(
            new URL('../round1/substitution-worker.js', import.meta.url),
            { text: input.text, attempts: 1, runs: 3, locked: {} },
            { ...context, read: (data) => data.results[0] },
          );
          result = {
            artifact: { type: 'text', text: data.plaintext },
            eligible: data.plaintext !== input.text,
          };
          options.actualKey = data.key;
          options.score = data.score;
          options.seed = 12345;
          options.runs = 3;
        } else if (profile.engine === 'completion') {
          const value = await completionJob(
            { task: options.task, input: input.text, options },
            context,
          );
          result = {
            artifact: { type: 'text', text: value.output },
            eligible: Boolean(value.output && value.output !== input.text),
          };
        } else
          result = await workerJob(
            worker,
            {
              id: profile.id,
              text: input.text,
              key: params.key || '',
              options: params.options || {},
            },
            context,
          );
        return {
          ...result,
          evidence: {
            kind: 'executed',
            message: profile.title + ' · 原工具已执行；完整参数见记录。',
            options,
          },
        };
      },
    }));
}
