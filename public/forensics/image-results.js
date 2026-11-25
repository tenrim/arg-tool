import { Box, Button, Status, Toolbar } from '../ui/index.js';
import { imageResultCard } from './image-result-card.js';
import { runLocalImageCheck } from './local-image-checks.js';

async function* events(response) {
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  const fragments = [];
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      const lines = value.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        fragments.push(lines[i]);
        const line = fragments.join('');
        fragments.length = 0;
        yield JSON.parse(line);
      }
      if (lines.at(-1)) fragments.push(lines.at(-1));
    }
    if (fragments.length) throw Error('结果连接中断，已返回的项目仍可查看和下载。');
  } finally {
    reader.releaseLock();
  }
}

export async function showImageSurvey(
  request,
  {
    result,
    link,
    bytes,
    current,
    signal,
    status,
    recording,
    plan,
    localSteps,
    original,
    buffer,
    openStep,
  },
) {
  const files = [],
    reports = [],
    reportFiles = [];
  const groups = Box({ className: 'image-survey-results' });
  const total = plan.steps.length + localSteps.length;
  let received = 0,
    successful = 0;
  const live = () => current() && !signal.aborted;
  const archive = Button({
    text: '打包下载已返回结果',
    disabled: true,
    on: {
      click: async () => {
        try {
          const { zipSync } = await import('../vendor/round2/fflate.js');
          if (!current()) return;
          const entries = [...files, ...reportFiles].map((f) => [f.name, f.bytes]);
          link(
            new Blob([zipSync(Object.fromEntries(entries), { level: 0 })]),
            '图片隐写分析.zip',
          ).click();
        } catch (error) {
          if (current()) status('打包失败：' + error.message, 'error');
        }
      },
    },
  });
  result.replaceChildren(
    Toolbar({ children: [archive] }),
    Status({ text: plan.format.toUpperCase() + ' · ' + total + ' 项检查' }),
    groups,
  );
  function publish(step, index, label, report, items) {
    if (!live()) return;
    const ok = report.status === 'ok';
    const state = ok ? '检查完成' : '未提取或检查异常';
    const raw = JSON.stringify(report, null, 2);
    const directory = index + 1 + '-' + step.engine + '/';
    const card = imageResultCard({
      engine: step.engine,
      label,
      ok,
      state,
      report,
      items,
      raw,
      link,
      openTool: () => openStep(step),
      onError: (error) => {
        if (current()) status(error.message, 'error');
      },
    });
    groups.append(card);
    for (const f of items) {
      const path = f.name.replace(/[%:\\]/g, (ch) => encodeURIComponent(ch));
      files.push({ name: directory + 'files/' + path, bytes: f.bytes });
    }
    reportFiles.push({ name: directory + 'report.json', bytes: new TextEncoder().encode(raw) });
    reports.push(label + ' · ' + state + '\n' + raw);
    recording.publish(() => ({
      text: reports.join('\n\n'),
      files: files.map((f) => new File([f.bytes], f.name.replaceAll('/', '_'))),
    }));
    archive.disabled = false;
    received++;
    if (ok) successful++;
    status('已完成 ' + received + '/' + total + ' 项检查 · ' + label);
  }
  async function local() {
    for (const [i, step] of localSteps.entries()) {
      if (!live()) return;
      let value;
      try {
        value = await runLocalImageCheck(step, original, buffer, signal);
      } catch (error) {
        value = { report: { status: 'error', error: error.message }, items: [] };
      }
      publish(step, plan.steps.length + i, step.title, value.report, value.items);
    }
  }
  async function remote() {
    try {
      const response = await request();
      let labels,
        finished = 0,
        end;
      for await (const event of events(response)) {
        if (!live()) return;
        if (event.type === 'plan') {
          if (event.format !== plan.format || event.labels?.length !== plan.steps.length)
            throw Error('服务端检查计划不匹配。');
          labels = event.labels;
        } else if (event.type === 'start') {
          status('已完成 ' + received + '/' + total + ' 项 · 正在检查 ' + labels[event.index]);
        } else if (event.type === 'result') {
          const v = event.value;
          publish(
            plan.steps[event.index],
            event.index,
            labels[event.index],
            v.result || { error: v.error },
            (v.files || []).map((f) => ({ name: f.name, bytes: bytes(f.data) })),
          );
          finished++;
        } else if (event.type === 'end') {
          if (event.finished !== finished || event.total !== labels?.length)
            throw Error('服务端结果数量不完整。');
          end = event;
        }
      }
      if (!end) throw Error('结果连接中断，已返回的项目仍可查看和下载。');
      return end.reason || '';
    } catch (error) {
      return error.message;
    }
  }
  const [reason] = await Promise.all([remote(), local()]);
  if (live())
    status(
      '检查完成 ' +
        successful +
        ' 项，未提取或异常 ' +
        (received - successful) +
        ' 项，未执行 ' +
        (total - received) +
        ' 项。' +
        (reason || ''),
      reason || !successful ? 'error' : 'success',
    );
}
