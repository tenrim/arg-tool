// Byte state stays in memory. The original and returned snapshots are isolated
// so callers cannot mutate a document outside its revision/history contract.
export const MAX_HEX_BYTES = 32 * 1024 * 1024;
export const MAX_HISTORY_BYTES = 8 * 1024 * 1024;
export const MAX_HISTORY_STEPS = 64;

function integer(value, name, minimum, maximum) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) throw new RangeError(`${name}超出允许范围。`);
  return value;
}

function byteView(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (Array.isArray(value)) {
    for (const byte of value) integer(byte, '字节值', 0, 255);
    return Uint8Array.from(value);
  }
  throw new TypeError('请提供真实字节数据。');
}

function equalBytes(left, right) {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i++) if (left[i] !== right[i]) return false;
  return true;
}

export class HexDocument {
  #original = new Uint8Array();
  #bytes = new Uint8Array();
  #undo = [];
  #redo = [];
  #historyBytes = 0;
  #revision = 0;
  #differences = 0;
  #maxBytes;
  #maxHistorySteps;
  #maxHistoryBytes;

  constructor({maxBytes = MAX_HEX_BYTES, maxHistorySteps = MAX_HISTORY_STEPS, maxHistoryBytes = MAX_HISTORY_BYTES} = {}) {
    this.#maxBytes = integer(maxBytes, '文件字节上限', 0, MAX_HEX_BYTES);
    this.#maxHistorySteps = integer(maxHistorySteps, '撤销步数上限', 1, MAX_HISTORY_STEPS);
    this.#maxHistoryBytes = integer(maxHistoryBytes, '撤销字节上限', 1, MAX_HISTORY_BYTES);
  }

  get length() { return this.#bytes.length; }
  get revision() { return this.#revision; }
  get bytes() { return this.#bytes.slice(); }
  get data() { return this.#bytes.slice(); }
  get canUndo() { return this.#undo.length > 0; }
  get canRedo() { return this.#redo.length > 0; }
  get historyBytes() { return this.#historyBytes; }
  get undoSteps() { return this.#undo.length; }
  get redoSteps() { return this.#redo.length; }
  get modified() {
    if (this.length !== this.#original.length) return true;
    if (this.#differences === null) {
      this.#differences = 0;
      for (let i = 0; i < this.length; i++) if (this.#bytes[i] !== this.#original[i]) this.#differences++;
    }
    return this.#differences !== 0;
  }

  load(value) {
    const bytes = byteView(value);
    integer(bytes.length, '文件大小', 0, this.#maxBytes);
    // Allocate before replacing state; a failed allocation must not invalidate
    // a previously loaded document or its undo stack.
    const original = new Uint8Array(bytes), working = new Uint8Array(bytes);
    this.#original = original;
    this.#bytes = working;
    this.#undo = [];
    this.#redo = [];
    this.#historyBytes = 0;
    this.#differences = 0;
    this.#revision++;
    return this;
  }

  byteAt(offset) {
    integer(offset, '字节位置', 0, this.length - 1);
    return this.#bytes[offset];
  }

  read(offset = 0, length = this.length - offset) {
    integer(offset, '起始位置', 0, this.length);
    integer(length, '字节长度', 0, this.length - offset);
    return this.#bytes.slice(offset, offset + length);
  }

  exportBytes() { return this.#bytes.slice(); }
  originalBytes() { return this.#original.slice(); }

  overwrite(offset, value) {
    integer(offset, '写入位置', 0, this.length);
    const bytes = byteView(value);
    integer(bytes.length, '写入长度', 0, this.length - offset);
    return this.#edit(offset, bytes.length, bytes);
  }

  insert(offset, value) {
    integer(offset, '插入位置', 0, this.length);
    const bytes = byteView(value);
    integer(bytes.length, '插入长度', 0, this.#maxBytes - this.length);
    return this.#edit(offset, 0, bytes);
  }

  delete(offset, length = 1) {
    integer(offset, '删除位置', 0, this.length);
    integer(length, '删除长度', 0, this.length - offset);
    return this.#edit(offset, length, new Uint8Array());
  }

  #edit(offset, removed, value) {
    const current = this.#bytes.subarray(offset, offset + removed);
    if (equalBytes(current, value)) return false;
    const cost = removed + value.length;
    if (cost > this.#maxHistoryBytes) throw new RangeError('本次编辑超过撤销容量，请分成较小的区段编辑。');
    const before = current.slice(), after = new Uint8Array(value);
    const patch = {offset, before, after, cost};
    // A replacement buffer is prepared before history or state changes.
    const replacement = this.#replacement(offset, before.length, after);
    this.#apply(offset, before, after, replacement);
    for (const entry of this.#redo) this.#historyBytes -= entry.cost;
    this.#redo = [];
    this.#undo.push(patch);
    this.#historyBytes += cost;
    while (this.#undo.length > this.#maxHistorySteps || this.#historyBytes > this.#maxHistoryBytes) {
      this.#historyBytes -= this.#undo.shift().cost;
    }
    this.#revision++;
    return true;
  }

  #replacement(offset, removed, inserted) {
    if (removed === inserted.length) return null;
    const result = new Uint8Array(this.length - removed + inserted.length);
    result.set(this.#bytes.subarray(0, offset));
    result.set(inserted, offset);
    result.set(this.#bytes.subarray(offset + removed), offset + inserted.length);
    return result;
  }

  #apply(offset, before, after, replacement) {
    if (replacement) {
      this.#bytes = replacement;
      this.#differences = null;
    } else {
      if (this.length === this.#original.length && this.#differences !== null) {
        for (let i = 0; i < after.length; i++) {
          const original = this.#original[offset + i];
          this.#differences += Number(after[i] !== original) - Number(before[i] !== original);
        }
      }
      this.#bytes.set(after, offset);
    }
  }

  undo() {
    const patch = this.#undo.at(-1);
    if (!patch) return false;
    const replacement = this.#replacement(patch.offset, patch.after.length, patch.before);
    this.#apply(patch.offset, patch.after, patch.before, replacement);
    this.#undo.pop();
    this.#redo.push(patch);
    this.#revision++;
    return true;
  }

  redo() {
    const patch = this.#redo.at(-1);
    if (!patch) return false;
    const replacement = this.#replacement(patch.offset, patch.before.length, patch.after);
    this.#apply(patch.offset, patch.before, patch.after, replacement);
    this.#redo.pop();
    this.#undo.push(patch);
    this.#revision++;
    return true;
  }
}

export function parseHex(value, {allowEmpty = false, maxBytes = MAX_HEX_BYTES} = {}) {
  if (typeof value !== 'string') throw new TypeError('请输入十六进制字节。');
  integer(maxBytes, '字节上限', 0, MAX_HEX_BYTES);
  const text = value.trim();
  if (!text) {
    if (allowEmpty) return new Uint8Array();
    throw new Error('请输入至少一个完整的十六进制字节。');
  }
  const tokens = text.split(/[\s,:-]+/);
  let length = 0;
  for (let token of tokens) {
    if (/^0x/i.test(token)) token = token.slice(2);
    if (!/^(?:[\da-f]{2})+$/i.test(token)) throw new Error('十六进制必须使用完整字节，例如 41 42 00；每个字节包含两位。');
    length += token.length / 2;
    if (length > maxBytes) throw new RangeError('十六进制字节超过允许大小。');
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (let token of tokens) {
    if (/^0x/i.test(token)) token = token.slice(2);
    for (let i = 0; i < token.length; i += 2) result[offset++] = Number.parseInt(token.slice(i, i + 2), 16);
  }
  return result;
}

export function parseOffset(value, {max = MAX_HEX_BYTES} = {}) {
  integer(max, '位置上限', 0, Number.MAX_SAFE_INTEGER);
  if (typeof value === 'number') return integer(value, '位置', 0, max);
  if (typeof value !== 'string' || !/^(?:\d+|0x[\da-f]+)$/i.test(value.trim())) throw new Error('位置请输入十进制整数或 0x 开头的十六进制整数。');
  return integer(Number(value.trim()), '位置', 0, max);
}

export function inspectBytes(value, offset = 0, {littleEndian = true, length = 8} = {}) {
  const bytes = byteView(value);
  integer(offset, '检查位置', 0, bytes.length);
  integer(length, '检查长度', 0, 256);
  const selected = bytes.subarray(offset, Math.min(bytes.length, offset + length));
  const available = bytes.length - offset;
  const view = new DataView(bytes.buffer, bytes.byteOffset + offset, available);
  const result = {
    offset, available, littleEndian: !!littleEndian,
    hex: Array.from(selected, byte => byte.toString(16).padStart(2, '0').toUpperCase()).join(' '),
    binary: Array.from(selected, byte => byte.toString(2).padStart(8, '0')).join(' '),
    ascii: Array.from(selected, byte => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.').join(''),
    utf8: null, validUtf8: false,
  };
  try {
    // preserve BOM as actual data and reject malformed UTF-8, rather than
    // presenting replacement characters as a reversible text interpretation.
    result.utf8 = new TextDecoder('utf-8', {fatal: true, ignoreBOM: true}).decode(selected);
    result.validUtf8 = true;
  } catch { /* Invalid bytes are reported by validUtf8; raw bytes remain intact. */ }
  for (const [name, size, getter] of [
    ['uint8', 1, 'getUint8'], ['int8', 1, 'getInt8'],
    ['uint16', 2, 'getUint16'], ['int16', 2, 'getInt16'],
    ['uint32', 4, 'getUint32'], ['int32', 4, 'getInt32'],
    ['uint64', 8, 'getBigUint64'], ['int64', 8, 'getBigInt64'],
    ['float32', 4, 'getFloat32'], ['float64', 8, 'getFloat64'],
  ]) {
    const number = available >= size ? view[getter](0, !!littleEndian) : null;
    result[name] = typeof number === 'bigint' ? number.toString() : number;
  }
  return result;
}
