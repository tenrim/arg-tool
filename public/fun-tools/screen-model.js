import {
  encodeFile,
  decodePacket,
  mergeChunksWithMetadata,
  sha256Bytes,
  bytesToHex,
} from '../vendor/fun-tools/screendrop.js';
const MAX_BYTES = 32 * 1024 * 1024;
export async function prepareTransfer(bytes, name, capacity = 400) {
  if (!(bytes instanceof Uint8Array) || bytes.length > MAX_BYTES) throw Error('文件最多 32 MB。');
  const nameLength = new TextEncoder().encode(name).length;
  if (!nameLength || nameLength > 255)
    throw Error('文件名须为 1–255 个 UTF-8 字节，请缩短文件名后重试。');
  if (!Number.isInteger(capacity) || capacity < 128 || capacity > 1240)
    throw Error('每块容量须为 128–1240 字节。');
  if (Math.ceil((37 + nameLength + bytes.length) / capacity) > 65535)
    throw Error('分块数超过协议上限，请提高容量或缩小文件。');
  const hash = await sha256Bytes(bytes);
  return {
    chunks: encodeFile(bytes, name, capacity, hash),
    hash: bytesToHex(hash),
    name,
    size: bytes.length,
  };
}
export function receiver() {
  const chunks = new Map();
  let total = 0,
    length = 0;
  function add(raw) {
    const packet = decodePacket(raw);
    if (!packet) throw Error('不是 ScreenDrop 文件二维码。');
    if (packet.error) throw Error('本帧 CRC 校验失败，请重新扫描。');
    const { index, totalChunks, payload } = packet;
    if (
      !totalChunks ||
      index >= totalChunks ||
      payload.length < 1 ||
      payload.length > 1240 ||
      payload.length * totalChunks > MAX_BYTES + 1600
    )
      throw Error('分块编号、容量或文件大小无效。');
    if (total && (total !== totalChunks || length !== payload.length))
      throw Error('检测到不同传输，请清空后再接收。');
    const prior = chunks.get(index);
    if (prior && prior.some((v, i) => v !== payload[i]))
      throw Error('同一分块内容冲突，请清空并重新接收。');
    total = totalChunks;
    length = payload.length;
    chunks.set(index, payload);
    return { received: chunks.size, total, complete: chunks.size === total };
  }
  function missing() {
    return Array.from({ length: total }, (_, i) => i)
      .filter((i) => !chunks.has(i))
      .map((i) => i + 1);
  }
  async function finish() {
    const value = mergeChunksWithMetadata(chunks, total);
    if (!value || value.fileSize > MAX_BYTES) throw Error('分块不足或文件头损坏。');
    const hash = bytesToHex(await sha256Bytes(value.fileData));
    if (hash !== bytesToHex(value.sha256))
      throw Error('SHA-256 不一致，可能混入其他文件，请清空并重新接收。');
    return { ...value, hash };
  }
  return { add, missing, finish };
}
