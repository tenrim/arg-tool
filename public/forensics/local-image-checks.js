import { animationClient } from '../animation/client.js';

export const FRAME_EXPORT_LIMIT = 64 * 1024 * 1024;
async function animationCheck(buffer, signal) {
  const client = animationClient();
  const cancel = () => client.cancel();
  signal.addEventListener('abort', cancel, { once: true });
  try {
    const meta = await client.run('decode', { bytes: new Uint8Array(buffer) });
    const delays = meta.frames.map((f) => f.delayMs);
    const distribution = new Map();
    for (const ms of delays) distribution.set(ms, (distribution.get(ms) || 0) + 1);
    const report = {
      status: 'ok',
      output: delays.length === 1 ? '单帧图像。' : '已读取全部帧延迟。',
      帧数: delays.length,
      尺寸: meta.width + ' × ' + meta.height,
      循环次数: meta.loops ?? '未声明',
      循环约定: meta.loopMeaning,
      '每帧延迟（毫秒）': delays.join('、'),
      延迟分布: Array.from(distribution, ([ms, n]) => ms + ' ms × ' + n).join('，'),
      metadata: meta,
    };
    const items = [];
    let size = 0;
    if (delays.length > 1)
      for (let index = 0; index < delays.length; index++) {
        signal.throwIfAborted();
        try {
          const { png } = await client.run('frame', { index, view: 'composite' });
          if (size + png.byteLength > FRAME_EXPORT_LIMIT) {
            report.note = '合成帧 PNG 达到 64 MB 汇总上限。';
            break;
          }
          size += png.byteLength;
          items.push({ name: 'frame-' + String(index + 1).padStart(4, '0') + '.png', bytes: png });
        } catch (error) {
          signal.throwIfAborted();
          report.status = 'error';
          report.note = '导出合成帧时中断：' + error.message;
          break;
        }
      }
    report['已导出合成帧'] = items.length;
    return { report, items };
  } finally {
    signal.removeEventListener('abort', cancel);
    cancel();
  }
}

export function runLocalImageCheck(step, file, buffer, signal) {
  signal.throwIfAborted();
  if (step.engine === 'animation') return animationCheck(buffer, signal);
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./local-image-worker.js', import.meta.url), {
      type: 'module',
    });
    const finish = (error, value) => {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      worker.terminate();
      if (error) reject(error);
      else resolve(value);
    };
    const abort = () => finish(signal.reason);
    const timer = setTimeout(() => finish(Error('本地图片检查超时。')), 60000);
    signal.addEventListener('abort', abort, { once: true });
    worker.onmessage = ({ data }) => finish(data.error ? Error(data.error) : null, data);
    worker.onerror = (event) => {
      event.preventDefault();
      finish(Error(event.message || '本地图片检查线程加载失败。'));
    };
    worker.onmessageerror = () => finish(Error('读取本地检查结果失败。'));
    try {
      worker.postMessage({ engine: step.engine, file });
    } catch (error) {
      finish(error);
    }
  });
}
