import { planMedia, MEDIA_TYPES, mediaSummary } from './commands.js';
import { MULTI_MODES, detectionReport } from './editing.js';
let coreBytes;
let preparation;
async function readCore(signal) {
  const response = await fetch(
    new URL('../vendor/hunt/ffmpeg-core/esm/ffmpeg-core.wasm.gz', import.meta.url),
    { signal },
  );
  if (!response.ok) throw Error('视频引擎载入失败，请重试。');
  const packed = await response.arrayBuffer();
  const magic = new Uint8Array(packed, 0, 2);
  const bytes =
    magic[0] === 31 && magic[1] === 139
      ? await new Response(
          new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip')),
        ).arrayBuffer()
      : packed;
  signal.throwIfAborted();
  return bytes;
}
export function prepareVideoCore() {
  if (coreBytes || preparation) return;
  const controller = new AbortController();
  const item = { controller, promise: readCore(controller.signal) };
  preparation = item;
  item.promise.catch(() => {
    if (preparation === item) preparation = undefined;
  });
}
export function cancelVideoPreparation() {
  preparation?.controller.abort();
  preparation = undefined;
}
async function takeCore(signal) {
  if (coreBytes) return coreBytes;
  const item = preparation;
  preparation = undefined;
  const abort = () => item?.controller.abort();
  signal.addEventListener('abort', abort, { once: true });
  try {
    const bytes = await (item?.promise || readCore(signal));
    signal.throwIfAborted();
    return (coreBytes = bytes);
  } finally {
    signal.removeEventListener('abort', abort);
  }
}
export const INPUT_LIMIT = 256 * 1024 * 1024;
export const OUTPUT_LIMIT = 256 * 1024 * 1024;
export function mediaJob() {
  const controller = new AbortController();
  let engine,
    disposed = false;
  const cancel = () => {
    disposed = true;
    controller.abort();
    engine?.terminate();
  };
  const check = () => {
    if (disposed) throw new DOMException('已停止', 'AbortError');
  };
  async function run(files, options, notify = () => {}) {
    if (files.reduce((sum, f) => sum + f.size, 0) > INPUT_LIMIT)
      throw Error('浏览器内处理的输入合计上限为 256 MB。');
    if (!files.length && options.mode !== 'capabilities') throw Error('请选择媒体文件。');
    const custom = options.mode === 'native' && options.custom;
    const names = ['input', ...files.slice(1).map((f, i) => (custom ? f.name : `input-${i + 2}`))];
    if (
      new Set(names).size !== names.length ||
      names
        .slice(1)
        .some((n) => !/^[a-zA-Z0-9_ .-]+$/.test(n) || ['.', '..', 'probe.json'].includes(n))
    )
      throw Error(
        '额外文件请使用不重复的英文、数字、空格、点、横线或下划线文件名，不能为 input 或 probe.json。',
      );
    if (files.length > 20) throw Error('单次最多选择 20 个文件。');
    if (files.length > 1 && !custom && !MULTI_MODES.includes(options.mode))
      throw Error('当前操作一次处理一个文件；多个输入请使用高级命令，避免遗漏所选文件。');
    let coreURL,
      logs = '',
      timer;
    const output = [],
      commands = [];
    timer = setTimeout(() => {
      notify('处理超过 10 分钟，已停止；可缩短范围后重试。');
      cancel();
    }, 600000);
    try {
      notify('正在载入本地 FFmpeg…');
      const { FFmpeg } = await import('../vendor/hunt/ffmpeg/esm/index.js');
      check();
      engine = new FFmpeg();
      engine.on('log', ({ message }) => {
        if (disposed) return;
        logs += '\n' + message;
        if (logs.length > 16 * 1024 * 1024) {
          notify('完整日志超过 16 MB，已停止。');
          cancel();
        }
      });
      let last = 0;
      engine.on('progress', ({ time }) => {
        if (!disposed && performance.now() - last > 400) {
          last = performance.now();
          notify(`正在处理 · 已处理至 ${Math.max(0, time / 1e6).toFixed(1)} 秒`);
        }
      });
      if (!coreBytes) {
        notify('正在读取并解压固定 FFmpeg 核心…');
        await takeCore(controller.signal);
      }
      check();
      notify('正在初始化 FFmpeg…');
      coreURL = URL.createObjectURL(new Blob([coreBytes], { type: 'application/wasm' }));
      await engine.load({
        coreURL: new URL('../vendor/hunt/ffmpeg-core/esm/ffmpeg-core.js', import.meta.url).href,
        wasmURL: coreURL,
      });
      check();
      if (options.mode === 'capabilities') {
        for (const flag of [
          '-version',
          '-formats',
          '-codecs',
          '-encoders',
          '-decoders',
          '-filters',
          '-protocols',
          '-h',
        ]) {
          if (await engine.exec(flag === '-h' ? ['-h', 'full'] : [flag]))
            throw Error('无法读取固定核心能力：' + flag);
          check();
        }
        return {
          files: [new File([logs], 'ffmpeg-capabilities.txt', { type: 'text/plain' })],
          logs,
          summary: '已读取固定核心的完整能力与帮助。',
        };
      }
      for (let i = 0; i < files.length; i++) {
        check();
        await engine.writeFile(names[i], new Uint8Array(await files[i].arrayBuffer()));
        check();
      }
      let metadata = {};
      const metas = [];
      if (!custom) {
        notify('正在读取时长与轨道…');
        for (const name of names) {
          const code = await engine.ffprobe([
            '-protocol_whitelist',
            'file,pipe',
            '-v',
            'error',
            '-show_format',
            '-show_streams',
            '-show_error',
            '-of',
            'json',
            '-o',
            'probe.json',
            name,
          ]);
          check();
          // core 0.12.10 leaves its shared return slot at -1 after a successful
          // ffprobe call. Require complete probe output with streams and no error.
          if (code !== 0 && code !== -1) throw Error('无法读取媒体信息（退出码 ' + code + '）。');
          metadata = JSON.parse(new TextDecoder().decode(await engine.readFile('probe.json')));
          if (
            metadata.error ||
            !metadata.format ||
            !Array.isArray(metadata.streams) ||
            !metadata.streams.length
          )
            throw Error(
              '无法读取有效媒体轨道：' +
                (metadata.error?.string || '文件损坏或格式不受当前核心支持。'),
            );
          check();
          metas.push(metadata);
        }
        metadata = metas.length > 1 ? { ...metas[0], inputs: metas } : metas[0];
      }
      const summary =
        metas.length > 1
          ? metas.map((m, i) => `${i + 1}. ${files[i].name}\n${mediaSummary(m)}`).join('\n\n')
          : mediaSummary(metadata);
      if (options.mode === 'inspect')
        return {
          files: [
            new File([JSON.stringify(metadata, null, 2)], 'media-info.json', {
              type: 'application/json',
            }),
          ],
          logs,
          summary,
        };
      const jobs = planMedia(options, metadata),
        existing = new Set((await engine.listDir('/')).map((x) => x.name));
      const detections = [];
      for (let i = 0; i < jobs.length; i++) {
        check();
        notify(`正在处理 ${i + 1}/${jobs.length}…`);
        // FFprobe and FFmpeg share the core's log level; probing uses error only.
        // Reset explicitly so detection events and diagnostics remain observable.
        const args = ['-loglevel', 'info', ...jobs[i].args];
        commands.push(args);
        const logStart = logs.length;
        const exit = await engine.exec(args);
        check();
        if (exit !== 0)
          throw Error(`FFmpeg 处理失败（退出码 ${exit}），请查看完整日志中的格式／编解码器错误。`);
        if (jobs[i].detection)
          detections.push({
            type: jobs[i].detection,
            duration: jobs[i].duration,
            logs: logs.slice(logStart),
          });
      }
      if (options.mode === 'detect') {
        const report = detectionReport(detections);
        const csv = [
          '类型,起点秒,终点秒,持续秒,延续至文件结束',
          ...report.events.map(
            (e) => `${e.label},${e.start},${e.end},${e.duration},${e.endAtFile}`,
          ),
        ].join('\r\n');
        return {
          files: [
            new File([JSON.stringify(report, null, 2)], 'detection.json', {
              type: 'application/json',
            }),
            new File(['\uFEFF' + csv], 'detection.csv', { type: 'text/csv' }),
          ],
          logs,
          commands,
          report,
          summary: `${summary}\n已检测：${report.checked.join('、')}；发现 ${report.events.length} 个候选片段。阈值检测不等于媒体损坏或隐藏线索。`,
        };
      }
      const generated = (await engine.listDir('/'))
        .filter((x) => !x.isDir && !existing.has(x.name))
        .map((x) => x.name)
        .sort();
      if (!generated.length) throw Error('没有生成输出文件，请检查轨道、时间范围或命令。');
      let total = 0;
      for (const name of generated) {
        check();
        const bytes = await engine.readFile(name);
        check();
        total += bytes.byteLength;
        if (total > OUTPUT_LIMIT || generated.length > 1000)
          throw Error(
            '完整输出超过浏览器保护上限（256 MB／1000 个文件），未发布不完整结果；请缩小范围。',
          );
        if (!bytes.byteLength) throw Error('输出文件为空：' + name + '；请检查时间范围。');
        output.push(
          new File([bytes], name, {
            type: MEDIA_TYPES[name.split('.').pop().toLowerCase()] || 'application/octet-stream',
          }),
        );
      }
      return { files: output, logs, summary, commands };
    } catch (error) {
      if (disposed) throw new DOMException('已停止', 'AbortError');
      const failure = error instanceof Error ? error : Error(String(error));
      failure.logs = logs;
      throw failure;
    } finally {
      clearTimeout(timer);
      engine?.terminate();
      engine = null;
      if (coreURL) URL.revokeObjectURL(coreURL);
    }
  }
  return { run, cancel };
}
