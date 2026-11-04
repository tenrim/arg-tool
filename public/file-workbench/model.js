import { listArchive, extractArchive } from '../round2/archive-engine.js';
export { ZIP_NAME_ENCODINGS } from '../round2/archive-engine.js';
export const MAX_FILE = 32 * 1024 * 1024;
export const MAX_TOTAL = 64 * 1024 * 1024;
export const MAX_COUNT = 500;
export function safePath(value) {
  const path = String(value).replaceAll('\\', '/');
  if (
    !path ||
    path.length > 512 ||
    /[\x00-\x1f]/.test(path) ||
    /^(\/|[a-z]:)/i.test(path) ||
    path.split('/').some((p) => !p || p === '.' || p === '..')
  )
    throw Error('不安全或空的文件路径：' + path);
  return path;
}
export function validateFiles(files) {
  if (!files.length || files.length > MAX_COUNT) throw Error('请选择 1–500 个文件。');
  let total = 0;
  const paths = new Set();
  for (const file of files) {
    const path = safePath(file.path || file.name);
    if (paths.has(path)) throw Error('文件路径重复：' + path + '；请使用文件夹选择保留目录。');
    paths.add(path);
    const size = file.size ?? file.bytes?.length;
    if (!Number.isFinite(size) || size < 0 || size > MAX_FILE)
      throw Error('每个文件最多 32 MB：' + path);
    total += size;
  }
  if (total > MAX_TOTAL) throw Error('一组文件合计最多 64 MB。');
}
export async function readSet(files, unpack, progress = () => {}, encoding = 'cp437') {
  validateFiles(files);
  const rows = [];
  let total = 0;
  for (const [index, file] of files.entries()) {
    progress(`读取文件 ${index + 1} / ${files.length}`);
    const bytes = file.bytes || new Uint8Array(await file.file.arrayBuffer());
    if (unpack) {
      if (files.length !== 1) throw Error('ZIP 模式每侧请选择一个压缩包。');
      const archive = listArchive(bytes, encoding);
      if (archive.type !== 'zip') throw Error('文件集合比较仅展开普通 ZIP。');
      const entries = archive.entries.filter((e) => !e.directory);
      validateFiles(entries);
      for (const e of entries) {
        const item = extractArchive(bytes, e.index, encoding);
        total += item.bytes.length;
        if (total > MAX_TOTAL) throw Error('ZIP 展开合计超过 64 MB。');
        rows.push({ path: safePath(e.name), bytes: item.bytes });
      }
    } else rows.push({ path: safePath(file.path || file.name), bytes });
  }
  validateFiles(rows.map((r) => ({ ...r, size: r.bytes.length })));
  return rows;
}
const equal = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
export async function sha256(bytes) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');
}
function preview(bytes) {
  try {
    // Decode the complete bounded file before clipping so multibyte boundaries
    // cannot misclassify valid text. Binary/control content uses a hex excerpt.
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (/[\x00-\x08\x0e-\x1f]/.test(text)) throw Error();
    return { format: 'UTF-8', text: text.slice(0, 8192), truncated: text.length > 8192 };
  } catch {
    return {
      format: '十六进制',
      text: [...bytes.subarray(0, 256)].map((v) => v.toString(16).padStart(2, '0')).join(' '),
      truncated: bytes.length > 256,
    };
  }
}
export async function compareSets(before, after, progress = () => {}) {
  validateFiles(before);
  validateFiles(after);
  const old = new Map(before.map((f) => [f.path, f])),
    next = new Map(after.map((f) => [f.path, f]));
  const removed = before.filter((f) => !next.has(f.path)),
    added = after.filter((f) => !old.has(f.path));
  const rows = [];
  for (const [index, a] of before.entries()) {
    progress(`比较 ${index + 1} / ${before.length}`);
    const b = next.get(a.path);
    if (!b) continue;
    let differences = Math.abs(a.bytes.length - b.bytes.length),
      first = -1;
    for (let i = 0; i < Math.min(a.bytes.length, b.bytes.length); i++)
      if (a.bytes[i] !== b.bytes[i]) {
        differences++;
        if (first < 0) first = i;
      }
    if (first < 0 && differences) first = Math.min(a.bytes.length, b.bytes.length);
    rows.push({
      kind: differences ? '修改' : '相同',
      before: a.path,
      after: b.path,
      oldSize: a.bytes.length,
      newSize: b.bytes.length,
      differences,
      firstOffset: first,
      ...(differences ? { oldPreview: preview(a.bytes), newPreview: preview(b.bytes) } : {}),
    });
  }
  const hashes = new Map();
  for (const b of added) {
    const hash = await sha256(b.bytes);
    hashes.set(hash, [...(hashes.get(hash) || []), b]);
  }
  const paired = new Set();
  for (const a of removed) {
    const candidates = (hashes.get(await sha256(a.bytes)) || []).filter(
      (b) => !paired.has(b) && equal(a.bytes, b.bytes),
    );
    // A one-to-many match is evidence of identical content, not a known rename.
    const uniqueOld =
      candidates.length === 1 && removed.filter((x) => equal(x.bytes, a.bytes)).length === 1;
    if (uniqueOld) {
      const b = candidates[0];
      paired.add(b);
      rows.push({
        kind: '疑似改名',
        before: a.path,
        after: b.path,
        oldSize: a.bytes.length,
        newSize: b.bytes.length,
      });
    } else
      rows.push({
        kind: '删除',
        before: a.path,
        after: '',
        oldSize: a.bytes.length,
        newSize: 0,
        sameContentCandidates: candidates.map((b) => b.path),
      });
  }
  for (const b of added)
    if (!paired.has(b))
      rows.push({ kind: '新增', before: '', after: b.path, oldSize: 0, newSize: b.bytes.length });
  return rows;
}
export async function transformFile(bytes, operation, options = {}) {
  if (bytes.length > MAX_FILE) throw Error('输入超过 32 MB。');
  const encode = (text) => new TextEncoder().encode(text);
  if (operation === 'sha256')
    return { bytes: encode((await sha256(bytes)) + '\n'), suffix: '.sha256.txt' };
  if (operation === 'base64-encode') {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192)
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return { bytes: encode(btoa(binary)), suffix: '.base64.txt' };
  }
  if (operation === 'base64-decode') {
    const value = new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/[\t\n\r ]/g, '');
    if (
      value.length % 4 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
    )
      throw Error('不是带标准填充的 Base64 文本。');
    const binary = atob(value);
    if (btoa(binary) !== value) throw Error('Base64 填充位不规范。');
    return { bytes: Uint8Array.from(binary, (c) => c.charCodeAt(0)), suffix: '.decoded.bin' };
  }
  if (operation === 'text-lf')
    return {
      bytes: encode(
        new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })
          .decode(bytes)
          .replace(/\r\n?/g, '\n'),
      ),
      suffix: '.lf.txt',
    };
  if (['image-png', 'image-jpeg', 'image-webp'].includes(operation)) {
    const max = Number(options.maxEdge),
      quality = Number(options.quality);
    if (
      !Number.isInteger(max) ||
      max < 1 ||
      max > 8192 ||
      !Number.isFinite(quality) ||
      quality < 0.1 ||
      quality > 1
    )
      throw Error('最长边须为 1–8192，质量须为 0.1–1。');
    const bitmap = await createImageBitmap(new Blob([bytes]));
    try {
      if (bitmap.width * bitmap.height > 40_000_000) throw Error('图片超过 4000 万像素。');
      const ratio = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
      const canvas = new OffscreenCanvas(
        Math.max(1, Math.round(bitmap.width * ratio)),
        Math.max(1, Math.round(bitmap.height * ratio)),
      );
      const ctx = canvas.getContext('2d');
      if (operation === 'image-jpeg') {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const type = 'image/' + operation.slice(6),
        blob = await canvas.convertToBlob({ type, quality });
      if (blob.type !== type) throw Error('此浏览器不支持该图片输出格式。');
      return { bytes: new Uint8Array(await blob.arrayBuffer()), suffix: '.' + operation.slice(6) };
    } finally {
      bitmap.close();
    }
  }
  throw Error('未支持的批量操作。');
}
