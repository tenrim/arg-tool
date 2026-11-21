export const PREFIX = '/api/bot-tools/v1';
export const VERSION = '1.1.0';
export const LIMITS = Object.freeze({
  inputBytes: 65536,
  outputBytes: 65536,
  bodyBytes: 131072,
  previewBytes: 256,
  recipeLength: 8,
});
export class ApiError extends Error {
  constructor(code, message, status = 400, details = {}) {
    super(message);
    Object.assign(this, { code, status, details });
  }
}
export function exactObject(value, keys) {
  if (
    !value ||
    Array.isArray(value) ||
    typeof value !== 'object' ||
    Object.keys(value).some((key) => !keys.includes(key))
  )
    throw new ApiError('INVALID_INPUT', '请求对象含未知字段或格式不正确。');
}
export function textInput(value, allowEmpty = false) {
  if (typeof value !== 'string' || (!allowEmpty && !value.trim()))
    throw new ApiError('INVALID_INPUT', '输入必须是文本。');
  if (Buffer.byteLength(value) > LIMITS.inputBytes)
    throw new ApiError('INPUT_TOO_LARGE', '输入文本最多 64 KiB。', 413);
}
export function failure(error, engine) {
  const known = error instanceof ApiError;
  return {
    ok: false,
    ...(engine ? { engine } : {}),
    error: {
      code: known ? error.code : 'ENGINE_UNAVAILABLE',
      message: known ? error.message : '计算服务暂不可用，请稍后重试。',
      ...(known ? error.details : {}),
    },
  };
}
