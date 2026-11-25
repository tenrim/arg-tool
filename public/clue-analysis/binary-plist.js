import { fail } from './data.js';
import { workerJob } from './worker-job.js';

// Only this fixed program runs. Player data is passed on stdin in hexadecimal.
const program = `import sys, plistlib, datetime, json
data = bytes.fromhex(sys.stdin.read())
try:
    root = plistlib.loads(data, fmt=plistlib.FMT_BINARY)
except (plistlib.InvalidFileException, RecursionError):
    print(json.dumps({"invalid": True}))
else:
    seen = {}
    def view(value):
        if isinstance(value, (list, dict, bytes, str)):
            identity = id(value)
            if identity in seen:
                return {"ref": seen[identity]}
            index = seen[identity] = len(seen)
            if isinstance(value, dict):
                content = [[view(k), view(v)] for k, v in value.items()]
            elif isinstance(value, list):
                content = [view(v) for v in value]
            elif isinstance(value, bytes):
                content = value.hex()
            else:
                content = value
            return {"id": index, "type": type(value).__name__, "value": content}
        if isinstance(value, datetime.datetime):
            return {"date": value.isoformat()}
        if isinstance(value, plistlib.UID):
            return {"uid": value.data}
        if isinstance(value, int) and abs(value) > 2**53 - 1:
            return {"integer": str(value)}
        if isinstance(value, float):
            return {"real": repr(value)}
        return value
    print(json.dumps({"value": view(root)}, ensure_ascii=True))
`;
// The pinned XML viewer strips whitespace from every line, including string
// values. Let it format the structure while preserving those values verbatim.
export function preparePlistXML(source) {
  const xml = new DOMParser().parseFromString(source, 'application/xml');
  const root = xml.documentElement;
  if (root.localName !== 'plist' || xml.querySelector('parsererror'))
    fail('INPUT_INVALID', '无效的 XML 属性列表。');
  if (!root.hasAttribute('version')) root.setAttribute('version', '1.0');
  const values = [];
  const marker = 'plist' + crypto.randomUUID() + '_';
  for (const node of root.querySelectorAll('key, string')) {
    values.push(node.textContent);
    node.textContent = marker + (values.length - 1);
  }
  const tokens = new RegExp(marker + '(\\d+)', 'g');
  return {
    text: new XMLSerializer().serializeToString(root).replace(/></g, '>\n<'),
    restore: (output) => output.replace(tokens, (_, index) => values[Number(index)]),
  };
}
export function binaryPlistBytes(input) {
  if (input.type === 'bytes')
    return input.bytes.length >= 8 &&
      String.fromCharCode(...input.bytes.subarray(0, 8)) === 'bplist00'
      ? input.bytes
      : null;
  if (!input.text.startsWith('bplist00')) return null;
  if (/[^\x00-\xff]/u.test(input.text)) fail('INPUT_INVALID', '二进制 plist 输入含非字节字符。');
  return Uint8Array.from(input.text, (c) => c.charCodeAt(0));
}
export async function parseBinaryPlist(bytes, context) {
  if (bytes.length < 41 || bytes.length > 65536)
    fail('INPUT_INVALID', '二进制 plist 长度无效或超过 64 KB。');
  const trailer = new DataView(bytes.buffer, bytes.byteOffset + bytes.length - 32, 32);
  const count = trailer.getBigUint64(8),
    offset = trailer.getBigUint64(24);
  if (
    !count ||
    count > 65536n ||
    trailer.getBigUint64(16) >= count ||
    ![1, 2, 4, 8].includes(trailer.getUint8(6)) ||
    ![1, 2, 4, 8].includes(trailer.getUint8(7)) ||
    offset < 8n ||
    offset + count * BigInt(trailer.getUint8(6)) !== BigInt(bytes.length - 32)
  )
    fail('INPUT_INVALID', '二进制 plist 的对象表或偏移表无效。');
  const result = await workerJob(
    new URL('../coderunner/worker.js', import.meta.url),
    {
      kind: 'init',
      language: 'python',
      code: program,
      input: Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(''),
    },
    { ...context, type: 'classic', read: (data) => JSON.parse(data.output) },
  );
  if (result.invalid) fail('INPUT_INVALID', '二进制 plist 对象无法解析。');
  return {
    artifact: { type: 'json', value: result.value },
    evidence: {
      kind: 'parsed',
      message: 'Python plistlib 已读取二进制属性列表；ref 指向已列出的对象。',
    },
  };
}
