// Analysis owns snapshots only. No UI, storage, routes or implicit byte decoding.
export class AnalysisError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'AnalysisError';
    this.code = code;
  }
}
export const fail = (code, message) => {
  throw new AnalysisError(code, message);
};
const errorCodes = new Set([
  'INPUT_INVALID',
  'UNSUPPORTED',
  'INTERACTION_REQUIRED',
  'LIMIT_EXCEEDED',
  'TIMEOUT',
  'CANCELLED',
  'ENGINE_UNAVAILABLE',
  'EXECUTION_FAILED',
]);
export function errorRecord(error) {
  return {
    code: errorCodes.has(error?.code)
      ? error.code
      : error?.name === 'AbortError'
        ? 'CANCELLED'
        : 'EXECUTION_FAILED',
    message: String(error?.message || '分析失败。').slice(0, 2000),
  };
}
const encoder = new TextEncoder();
export function jsonSnapshot(value, maxBytes = 32768) {
  let count = 0;
  const seen = new Set();
  function visit(item, depth) {
    if (++count > 100000 || depth > 32) fail('LIMIT_EXCEEDED', '结构化数据过于复杂。');
    if (item === null || typeof item === 'boolean') return item;
    if (typeof item === 'string') {
      if (item.length > maxBytes) fail('LIMIT_EXCEEDED', '结构化数据超过大小限制。');
      return item;
    }
    if (typeof item === 'number' && Number.isFinite(item)) return item;
    if (!item || typeof item !== 'object' || seen.has(item))
      fail('INPUT_INVALID', '需要有限数值、文字或无循环的 JSON 数据。');
    if (!Array.isArray(item) && Object.getPrototypeOf(item) !== Object.prototype)
      fail('INPUT_INVALID', '结构化数据只能包含普通 JSON 对象。');
    seen.add(item);
    const result = Array.isArray(item)
      ? item.map((v) => visit(v, depth + 1))
      : Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((k) => [k, visit(item[k], depth + 1)]),
        );
    seen.delete(item);
    return result;
  }
  const copy = visit(value, 0);
  if (encoder.encode(JSON.stringify(copy)).length > maxBytes)
    fail('LIMIT_EXCEEDED', '结构化数据超过大小限制。');
  return copy;
}
export function snapshot(value, maxBytes) {
  let artifact, size;
  const bytes = (input) => {
    const view =
      input instanceof Uint8Array
        ? input
        : input instanceof ArrayBuffer
          ? new Uint8Array(input)
          : null;
    if (!view) fail('INPUT_INVALID', '字节输入必须是 Uint8Array 或 ArrayBuffer。');
    if (view.byteLength > maxBytes) fail('LIMIT_EXCEEDED', '数据超过本次分析大小限制。');
    return view.slice();
  };
  if (value?.type === 'text' && typeof value.text === 'string') {
    if (value.text.length > maxBytes) fail('LIMIT_EXCEEDED', '文字超过本次分析大小限制。');
    artifact = { type: 'text', text: value.text };
    size = encoder.encode(value.text).length;
  } else if (value?.type === 'bytes') {
    artifact = { type: 'bytes', bytes: bytes(value.bytes) };
    size = artifact.bytes.length;
  } else if (value?.type === 'json') {
    artifact = { type: 'json', value: jsonSnapshot(value.value, maxBytes) };
    size = encoder.encode(JSON.stringify(artifact.value)).length;
  } else if (value?.type === 'files' && Array.isArray(value.files)) {
    if (value.files.length > 128) fail('LIMIT_EXCEEDED', '一次最多接收 128 个结果文件。');
    size = 0;
    artifact = {
      type: 'files',
      files: value.files.map((file) => {
        if (
          typeof file.name !== 'string' ||
          file.name.length > 1024 ||
          typeof file.mediaType !== 'string' ||
          file.mediaType.length > 256
        )
          fail('INPUT_INVALID', '文件结果需要名称和媒体类型。');
        size += file.bytes?.byteLength || 0;
        size += encoder.encode(file.name + file.mediaType).length;
        if (size > maxBytes) fail('LIMIT_EXCEEDED', '文件结果超过本次分析大小限制。');
        return { name: file.name, mediaType: file.mediaType, bytes: bytes(file.bytes) };
      }),
    };
  } else fail('INPUT_INVALID', '不支持的分析数据类型。');
  if (size > maxBytes) fail('LIMIT_EXCEEDED', '数据超过本次分析大小限制。');
  return { artifact, size };
}
// Types and file boundaries form part of identity; text is never silently bytes.
export async function fingerprint(artifact) {
  const hash = async (bytes) =>
    Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (n) =>
      n.toString(16).padStart(2, '0'),
    ).join('');
  let value;
  if (artifact.type === 'bytes') value = await hash(artifact.bytes);
  else if (artifact.type === 'files') {
    value = JSON.stringify(
      await Promise.all(
        artifact.files.map(async (file) => [file.name, file.mediaType, await hash(file.bytes)]),
      ),
    );
  } else value = JSON.stringify(artifact.type === 'text' ? artifact.text : artifact.value);
  return artifact.type + ':' + (await hash(encoder.encode(value)));
}
export const DEFAULT_LIMITS = Object.freeze({
  inputBytes: 1024 * 1024,
  outputBytes: 4 * 1024 * 1024,
  retainedBytes: 16 * 1024 * 1024,
  depth: 3,
  nodes: 48,
  records: 200000,
  attempts: 64,
  proposals: 16,
  totalMs: 30000,
  taskMs: 8000,
});
const ceilings = {
  inputBytes: 32 * 1024 * 1024,
  outputBytes: 32 * 1024 * 1024,
  retainedBytes: 64 * 1024 * 1024,
  depth: 16,
  nodes: 16384,
  records: 200000,
  attempts: 100000,
  proposals: 100000,
  totalMs: 3600000,
  taskMs: 120000,
};
export function analysisLimits(overrides = {}) {
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null && ['attempts', 'proposals', 'totalMs'].includes(key)) continue;
    if (
      !Object.hasOwn(ceilings, key) ||
      !Number.isSafeInteger(value) ||
      value < 1 ||
      value > ceilings[key]
    )
      fail('INPUT_INVALID', '无效的分析限制：' + key);
  }
  return Object.freeze({ ...DEFAULT_LIMITS, ...overrides });
}
