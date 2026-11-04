import {
  FORENSICS_TASKS,
  FORENSICS_OPTIONS,
  SERVER_FILE_LIMIT_BYTES,
} from '../../public/forensics/catalog.js';
import { runContainer } from './process.mjs';
const engines = new Set(FORENSICS_TASKS.map((t) => t.engine));
// Base64 adds one third; reserve JSON overhead without increasing the file cap.
const limit = 28 * 1024 * 1024;
export function validateJob(value) {
  if (
    !value ||
    !engines.has(value.engine) ||
    typeof value.data !== 'string' ||
    /[^A-Za-z0-9+/=]/.test(value.data) ||
    value.data.length % 4 !== 0 ||
    !value.data ||
    value.data.length > 4 * Math.ceil(SERVER_FILE_LIMIT_BYTES / 3) ||
    Buffer.from(value.data, 'base64').length > SERVER_FILE_LIMIT_BYTES ||
    typeof value.filename !== 'string' ||
    value.filename.length > 255 ||
    typeof value.password !== 'string' ||
    value.password.length > 1024 ||
    /[\x00\r\n]/.test(value.password)
  )
    throw Error('文件、引擎或密码参数不正确；单文件最多 20 MB');
  if (
    value.options &&
    (typeof value.options !== 'object' ||
      Array.isArray(value.options) ||
      JSON.stringify(value.options).length > 2048)
  )
    throw Error('工具参数不正确');
  if (Buffer.from(value.data, 'base64').toString('base64') !== value.data)
    throw Error('文件编码无效');
  const specs = FORENSICS_OPTIONS[value.engine] || [];
  for (const [key, item] of Object.entries(value.options || {})) {
    const spec = specs.find((s) => s.key === key);
    if (
      !spec ||
      (spec.choices && !spec.choices.some(([v]) => v === item)) ||
      (spec.type === 'number' &&
        (!Number.isInteger(Number(item)) || Number(item) < spec.min || Number(item) > spec.max)) ||
      (key === 'extract' &&
        (typeof item !== 'string' || item.length > 100 || !/^[a-zA-Z0-9_,.]*$/.test(item)))
    )
      throw Error('工具参数无效：' + key);
  }
  return {
    engine: value.engine,
    data: value.data,
    filename: value.filename,
    password: value.password,
    options: value.options || {},
  };
}
export function createForensicsService({ env = process.env, execute = runContainer } = {}) {
  let active = null,
    closed = false;
  const rates = new Map();
  const reply = (res, status, value) => {
    if (res.destroyed || res.writableEnded) return;
    res.writeHead(status, {
      'Content-Type': 'application/json;charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(JSON.stringify(value));
  };
  return {
    async handle(req, res) {
      if (req.method !== 'POST') return reply(res, 405, { error: '仅支持 POST' });
      const origins = (env.FORENSICS_ORIGINS || '').split(',');
      origins.push(
        `http://localhost:${req.socket.localPort}`,
        `http://127.0.0.1:${req.socket.localPort}`,
      );
      if (!origins.includes(req.headers.origin))
        return reply(res, 403, { error: '请求来源不允许' });
      if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || ''))
        return reply(res, 415, { error: '请求格式不正确' });
      if (closed || env.FORENSICS_ENABLED !== '1')
        return reply(res, 503, { error: '服务器分析服务尚未启用，本地工具仍可使用' });
      if (active) return reply(res, 429, { error: '分析服务正在处理其他文件，请稍后重试' });
      if (Number(req.headers['content-length']) > limit)
        return reply(res, 413, { error: '文件超过 20 MB' });
      const now = Date.now(),
        ip = req.socket.remoteAddress;
      for (const [key, at] of rates) if (now - at > 60000) rates.delete(key);
      if (now - (rates.get(ip) || 0) < 2000 || rates.size >= 1024)
        return reply(res, 429, { error: '请求过于频繁，请稍后重试' });
      rates.set(ip, now);
      const controller = new AbortController();
      active = controller;
      const abort = () => {
        if (!res.writableEnded) controller.abort();
      };
      res.once('close', abort);
      const readTimer = setTimeout(() => {
        controller.abort();
        req.destroy();
      }, 60000);
      try {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > limit) throw Error('文件超过 20 MB');
          chunks.push(chunk);
        }
        clearTimeout(readTimer);
        const job = validateJob(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        const result = await execute(job, { env, signal: controller.signal });
        reply(res, result.error ? 422 : 200, result);
      } catch (error) {
        reply(res, controller.signal.aborted ? 408 : 422, { error: error.message });
      } finally {
        clearTimeout(readTimer);
        res.removeListener('close', abort);
        if (active === controller) active = null;
      }
    },
    close() {
      closed = true;
      active?.abort();
    },
  };
}
