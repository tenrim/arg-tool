// Self-contained module: no import/fetch URL is resolved relative to a Worker
// blob. Cancelling an in-progress scan is owned by the UI via terminate().
const MAX_BYTES = 32 * 1024 * 1024;
export const MAX_SEARCH_PATTERN_BYTES = 1024 * 1024;
const MAX_MATCHES = 10000;

function bytes(value, limit, name) {
  const result = value instanceof ArrayBuffer ? new Uint8Array(value) : value;
  if (!(result instanceof Uint8Array) || result.length > limit) throw new Error(`${name}不是允许大小的字节数据。`);
  return result;
}

function prefixTable(pattern) {
  const prefix = new Uint32Array(pattern.length);
  for (let i = 1, matched = 0; i < pattern.length; i++) {
    while (matched && pattern[i] !== pattern[matched]) matched = prefix[matched - 1];
    if (pattern[i] === pattern[matched]) matched++;
    prefix[i] = matched;
  }
  return prefix;
}

// Match starts are bounded inclusively. The scan may read beyond maxStart to
// finish a pattern whose first byte is inside the requested range.
function scan(data, pattern, prefix, minStart, maxStart, visit) {
  if (maxStart < minStart) return;
  const end = Math.min(data.length, maxStart + pattern.length);
  for (let i = minStart, matched = 0; i < end; i++) {
    while (matched && data[i] !== pattern[matched]) matched = prefix[matched - 1];
    if (data[i] === pattern[matched]) matched++;
    if (matched === pattern.length) {
      const offset = i - pattern.length + 1;
      if (visit(offset) === false) return;
      matched = prefix[matched - 1];
    }
  }
}

export function searchBytes(value, needle, {direction = 'all', start = 0, wrap = true, maxMatches = MAX_MATCHES} = {}) {
  const data = bytes(value, MAX_BYTES, '待搜索文件');
  const pattern = bytes(needle, MAX_SEARCH_PATTERN_BYTES, '搜索内容');
  if (!pattern.length) throw new Error('搜索内容不能为空。');
  if (!['all', 'next', 'previous'].includes(direction)) throw new Error('搜索方向无效。');
  if (!Number.isSafeInteger(start) || start < -1 || start > data.length) throw new Error('搜索位置超出文件范围。');
  if (!Number.isSafeInteger(maxMatches) || maxMatches < 1 || maxMatches > MAX_MATCHES) throw new Error('搜索结果上限无效。');
  const result = {offsets: [], hasMore: false, offset: null, wrapped: false};
  if (pattern.length > data.length) return result;
  const prefix = prefixTable(pattern), last = data.length - pattern.length;
  if (direction === 'all') {
    scan(data, pattern, prefix, 0, last, offset => {
      if (result.offsets.length === maxMatches) { result.hasMore = true; return false; }
      result.offsets.push(offset);
    });
    result.offset = result.offsets[0] ?? null;
    return result;
  }
  const first = (min, max) => {
    scan(data, pattern, prefix, min, max, offset => {result.offset = offset; return false;});
  };
  const final = (min, max) => {
    scan(data, pattern, prefix, min, max, offset => {result.offset = offset;});
  };
  if (direction === 'next') {
    first(Math.max(0, start), last);
    if (result.offset === null && wrap && start > 0) {
      first(0, Math.min(last, start - 1));
      result.wrapped = result.offset !== null;
    }
  } else {
    final(0, Math.min(last, start));
    if (result.offset === null && wrap && start < last) {
      final(Math.max(0, start + 1), last);
      result.wrapped = result.offset !== null;
    }
  }
  if (result.offset !== null) result.offsets = [result.offset];
  return result;
}

if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
  self.onmessage = event => {
    const data = event?.data && typeof event.data === 'object' ? event.data : {};
    const {id, revision} = data;
    try {
      self.postMessage({id, revision, ...searchBytes(data.bytes, data.pattern, data)});
    } catch (error) {
      self.postMessage({id, revision, error: error.message || '字节搜索失败，请重试。'});
    }
  };
}
