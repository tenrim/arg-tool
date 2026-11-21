import { Box, Button, Status, Toolbar } from '../ui/index.js';
import { imageResultCard } from './image-result-card.js';

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
  response,
  { result, link, bytes, current, signal, status, recording, steps, openStep },
) {
  const files = [],
    reports = [],
    groups = Box({ className: 'image-survey-results' }),
    reportFiles = [];
  let labels,
    received = 0,
    completed = false;
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
  result.replaceChildren(Toolbar({ children: [archive] }), groups);
  for await (const event of events(response)) {
    if (!current() || signal.aborted) return;
    if (event.type === 'plan') {
      labels = event.labels;
      groups.before(
        Status({ text: event.format.toUpperCase() + ' · ' + labels.length + ' 项检查' }),
      );
    } else if (event.type === 'start') {
      status(`正在检查 ${event.index + 1}/${labels.length} · ${labels[event.index]}`);
    } else if (event.type === 'result') {
      const value = event.value,
        label = labels[event.index];
      const report = value.result || { error: value.error };
      const ok = report.status === 'ok';
      const state = ok ? '检查完成' : '未提取或检查异常';
      const summary = label + ' · ' + state;
      const raw = JSON.stringify(report, null, 2);
      const items = (value.files || []).map((f) => ({
        name: f.name,
        bytes: bytes(f.data),
      }));
      const directory = String(event.index + 1) + '-' + (value.engine || 'report') + '/';
      for (const f of items) {
        // Escape archive separators and the escape marker without merging distinct names.
        const path = f.name.replace(/[%:\\]/g, (ch) => encodeURIComponent(ch));
        files.push({ name: directory + 'files/' + path, bytes: f.bytes });
      }
      reportFiles.push({ name: directory + 'report.json', bytes: new TextEncoder().encode(raw) });
      reports.push(summary + '\n' + raw);
      groups.append(
        imageResultCard({
          engine: steps[event.index].engine,
          label,
          state,
          report,
          items,
          raw,
          link,
          openTool: () => openStep(steps[event.index]),
          onError: (error) => {
            if (current()) status(error.message, 'error');
          },
        }),
      );
      archive.disabled = false;
      recording.publish(() => ({
        text: reports.join('\n\n'),
        files: files.map((f) => new File([f.bytes], f.name.replaceAll('/', '_'))),
      }));
      received++;
    } else if (event.type === 'end') {
      if (received !== event.finished || event.total !== labels.length)
        throw Error('结果数量不完整');
      const message = `检查完成 ${event.successful} 项，未提取或异常 ${received - event.successful} 项，未执行 ${event.total - received} 项。`;
      status(
        message + (event.reason || ''),
        event.reason || !event.successful ? 'error' : 'success',
      );
      completed = true;
    }
  }
  if (!completed) throw Error('结果连接中断，已返回的项目仍可查看和下载。');
}
