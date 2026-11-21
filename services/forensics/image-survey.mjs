import { surveyOptions, surveyPlan } from '../../public/forensics/image-plan.js';
import { FORENSICS_TASKS } from '../../public/forensics/catalog.js';
import { setTimeout as delay } from 'node:timers/promises';

const titles = new Map(FORENSICS_TASKS.map((task) => [task.engine, task.title]));
const maxTransfer = 88 * 1024 * 1024;
export async function streamImageSurvey(job, { res, env, signal, execute }) {
  const { format, steps: plan } = surveyPlan(
    Buffer.from(job.data.slice(0, 40), 'base64'),
    job.options.depth,
  );
  const timeout = AbortSignal.timeout(240000);
  const executionSignal = AbortSignal.any([signal, timeout]);
  res.writeHead(200, {
    'Content-Type': 'application/x-ndjson;charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Accel-Buffering': 'no',
  });
  const send = (event) =>
    new Promise((resolve, reject) => {
      if (signal.aborted || res.destroyed) return reject(Error('连接已关闭'));
      res.write(JSON.stringify(event) + '\n', (error) => (error ? reject(error) : resolve()));
    });
  const labels = plan.map((step) => step.title || titles.get(step.engine));
  await send({ type: 'plan', format, labels });
  let delivered = 0,
    finished = 0,
    successful = 0,
    reason = '';
  let nextSessionAt = 0;
  for (const [index, step] of plan.entries()) {
    if (executionSignal.aborted || reason) break;
    await send({ type: 'start', index });
    let value;
    try {
      // The SSH development transport opens a new authenticated connection for each sandbox.
      if (env.FORENSICS_TRANSPORT === 'ssh') {
        const wait = nextSessionAt - Date.now();
        if (wait > 0) await delay(wait, undefined, { signal: executionSignal });
        nextSessionAt = Date.now() + 12500;
      }
      const options = surveyOptions(step, job.options.depth);
      value = await execute(
        {
          engine: step.engine,
          options,
          filename: 'input.' + format,
          data: job.data,
          password: step.password ? job.password : '',
        },
        { env, signal: executionSignal },
      );
      if (!value.complete || !Array.isArray(value.files) || !value.result?.status)
        throw Error(value.error || '引擎未返回完整结果');
      const size = Buffer.byteLength(JSON.stringify(value));
      if (delivered + size > maxTransfer)
        throw Error('本项完整输出超出本次汇总容量。可在单项工具中重新运行。');
      delivered += size;
      if (value.result.status === 'ok') successful++;
    } catch (error) {
      if (signal.aborted) throw error;
      value = { error: timeout.aborted ? '已达到总时间上限' : error.message };
      if (error.code === 'ENGINE_UNAVAILABLE') reason = error.message;
    }
    await send({ type: 'result', index, value });
    finished++;
  }
  if (timeout.aborted) reason = '已达到 4 分钟总时限';
  await send({ type: 'end', finished, successful, total: plan.length, reason });
  res.end();
}
