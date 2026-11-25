const report = { terminal: true, observation: true };
const commonTag = /<(?:html|body|div|p|span|a|br|table|ul|ol|li|h[1-6])(?:\s[^<>]*|\/?)>/i;
function derSequence(text) {
  const hex = text.replace(/\s+/g, '');
  if (!/^30(?:[\da-f]{2})+$/i.test(hex)) return false;
  const first = parseInt(hex.slice(2, 4), 16);
  if (first < 128) return hex.length === 4 + first * 2;
  const count = first - 128;
  if (count < 1 || count > 3 || hex.slice(4, 6) === '00') return false;
  const length = parseInt(hex.slice(4, 4 + 2 * count), 16);
  return length >= 256 ** (count - 1) && length >= 128 && hex.length === 4 + 2 * (count + length);
}
function oidValue(text) {
  const hex = text.replace(/\s+/g, '');
  // OID value octets have no tag. Restrict automatic guesses to common roots.
  if (!/^(?:2a86|2b06|55(?:04|1d))(?:[\da-f]{2})+$/i.test(hex)) return false;
  let continued = false;
  for (let i = 2; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    if (!continued && byte === 128) return false;
    continued = byte >= 128;
  }
  return !continued;
}
export const formatProfiles = [
  {
    op: 'PHP Deserialize',
    args: [true],
    pattern:
      /^(?:N;|i:-?\d+;|b:[01];|d:(?:-?(?:\d+(?:\.\d*)?(?:e[+-]?\d+)?|INF)|NAN);|s:\d+:"[\s\S]*";|a:\d+:\{[\s\S]*\}|[OC]:\d+:"[^"]+":\d+:\{[\s\S]*\})$/i,
  },
  {
    op: 'Analyse UUID',
    args: [true],
    pattern: /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i,
    ...report,
  },
  {
    op: 'Bcrypt parse',
    args: [],
    pattern: /^\$2[aby]\$(?:0[4-9]|[12]\d|3[01])\$[./A-Za-z0-9]{53}$/,
    ...report,
  },
  {
    op: 'Parse ASN.1 hex string',
    args: [0, 32],
    matches: derSequence,
    exploratory: true,
    ...report,
  },
  { op: 'Hex to Object Identifier', args: [], matches: oidValue, exploratory: true, ...report },
  {
    op: 'Remove Diacritics',
    args: [],
    matches: (text) => /\p{Mn}/u.test(text.normalize('NFD')),
    exploratory: true,
  },
  { op: 'HTML To Text', args: [], pattern: commonTag, follow: 'Strip HTML tags' },
  {
    op: 'Text-Integer Conversion',
    args: ['String'],
    pattern: /^(?=.{6,512}$)(?:\d+|0x[\da-f]+)$/i,
    requirePrintable: true,
    exploratory: true,
  },
  {
    op: 'P-list Viewer',
    args: [],
    pattern:
      /^(?:bplist00|(?:\s*<\?xml[^>]*\?>)?(?:\s*<!DOCTYPE plist[^>]*>)?\s*<plist(?:\s[^<>]*)?>[\s\S]*<\/plist>\s*$)/,
    ...report,
  },
];

// Validate container boundaries before the upstream Avro stream decoder, which
// treats incomplete trailing blocks (even the magic alone) as a clean EOF.
function avroContainer(bytes) {
  if (bytes.length < 20 || bytes[0] !== 79 || bytes[1] !== 98 || bytes[2] !== 106 || bytes[3] !== 1)
    return false;
  let cursor = 4;
  function long() {
    let value = 0;
    for (let shift = 1; cursor < bytes.length && shift <= 2 ** 49; shift *= 128) {
      const octet = bytes[cursor++];
      value += (octet & 127) * shift;
      if (!Number.isSafeInteger(value)) return NaN;
      if (octet < 128) return value % 2 ? -(value + 1) / 2 : value / 2;
    }
    return NaN;
  }
  function take(n) {
    if (!Number.isSafeInteger(n) || n < 0 || n > bytes.length - cursor) return null;
    cursor += n;
    return bytes.subarray(cursor - n, cursor);
  }
  let schema = false;
  for (let n = long(); n !== 0; n = long()) {
    if (!Number.isSafeInteger(n) || Math.abs(n) > bytes.length / 2) return false;
    let end;
    if (n < 0) {
      const size = long();
      if (!(size >= 0 && size <= bytes.length - cursor)) return false;
      end = cursor + size;
      n = -n;
    }
    for (let i = 0; i < n; i++) {
      const key = take(long()),
        value = take(long());
      if (!key || !value) return false;
      if (key.length === 11 && String.fromCharCode(...key) === 'avro.schema' && value.length)
        schema = true;
    }
    if (end !== undefined && cursor !== end) return false;
  }
  const sync = take(16);
  if (!schema || !sync) return false;
  let records = 0;
  while (cursor < bytes.length) {
    const count = long();
    records += count;
    if (!(count > 0) || records > 65536 || !take(long())) return false;
    const marker = take(16);
    if (!marker || !marker.every((v, i) => v === sync[i])) return false;
  }
  return true;
}
function isTLV(bytes) {
  if (bytes.length < 2 || bytes.length > 65536) return false;
  let i = 0;
  while (i + 2 <= bytes.length) i += 2 + bytes[i + 1];
  return i === bytes.length;
}
export const structuredRecords = [
  [
    'BSON deserialise',
    [],
    (b) =>
      b.length >= 5 &&
      b.length <= 65536 &&
      b.at(-1) === 0 &&
      new DataView(b.buffer, b.byteOffset, b.byteLength).getInt32(0, true) === b.length,
  ],
  ['Avro to JSON', [true], avroContainer],
  ['Parse TLV', [1, 1, false], isTLV],
  [
    'P-list Viewer',
    [],
    (b) => b.length >= 8 && new TextDecoder().decode(b.subarray(0, 8)) === 'bplist00',
  ],
];

export function baconArguments({ text }) {
  const result = [];
  const compact = text.replace(/\s/g, '');
  const modes = [];
  if (compact.length && compact.length % 5 === 0) {
    if (/^[AB]+$/i.test(compact)) modes.push('A/B');
    if (/^[01]+$/.test(compact)) modes.push('0/1');
  }
  const letters = text.replace(/[^A-Za-z]/g, '');
  if (
    text.length <= 1024 &&
    letters.length >= 10 &&
    letters.length % 5 === 0 &&
    /[A-Z]/.test(letters) &&
    /[a-z]/.test(letters)
  )
    modes.push('Case');
  const words = text.trim().split(/\s+/);
  if (words.length >= 5 && words.length % 5 === 0 && words.every((w) => /^[A-Za-z]/.test(w)))
    modes.push('A-M/N-Z first letter');
  for (const mode of modes)
    for (const alphabet of ['Standard (I=J and U=V)', 'Complete'])
      for (const invert of [false, true])
        if (invert || alphabet !== 'Complete' || !['0/1', 'A/B'].includes(mode))
          result.push([alphabet, mode, invert]);
  return result;
}
