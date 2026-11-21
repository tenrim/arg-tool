// Supplemental decoders absent from the upstream Magic input-pattern selection.
// Every recipe is replayed by the same original Worker and parameter model.
import { getCatalogue } from '../chef-tools/catalog.js';
export const CHEF_PUZZLE_PROFILES = Object.freeze([
  {
    op: 'Flask Session Decode',
    pattern: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    terminal: true,
  },
  { op: 'Rison Decode', pattern: /^!?\([\s\S]*\)$/, terminal: true },
  { op: 'MIME Decoding', pattern: /=\?[^?]+\?[BQ]\?[^?]+\?=/i },
  { op: 'From Base45', pattern: /^[0-9A-Z $%*+./:-]{3,}$/, exploratory: true },
  { op: 'From Base62', pattern: /^[A-Za-z0-9]{3,}$/, exploratory: true },
  { op: 'From Base92', pattern: /^[!-u]{3,}$/, exploratory: true },
  { op: 'From Braille', pattern: /^[\u2800-\u28ff\s]+$/ },
  { op: 'From Charcode', pattern: /^\d+(?:[ ,]+\d+)+$/ },
  { op: 'From Punycode', pattern: /(?:^|\.)xn--[a-z0-9-]+/i },
  { op: 'From Case Insensitive Regex', pattern: /\[[A-Za-z]{2}\]/ },
  { op: 'Citrix CTX1 Decode', pattern: /^CTX1:/ },
  { op: 'Caret/M-decode', pattern: /(?:\^[A-Z@\[\]\\^_?]|M-)/ },
  { op: 'Unescape string', pattern: /\\(?:[nrtbfv\\'"]|x[\da-f]{2}|u[\da-f]{4})/i },
  { op: 'ROT8000', pattern: /[^\x00-\x7f]/u, exploratory: true },
  { op: 'Bifid Cipher Decode', pattern: /^[A-Za-z\s]+$/, exploratory: true, key: true },
]);
export function chefPuzzleAdapters(chef, { key = '' } = {}) {
  const adapters = CHEF_PUZZLE_PROFILES.map((profile) => ({
    id: 'chef-puzzle/' + profile.op,
    title: profile.op,
    capabilityId: 'op:' + encodeURIComponent(profile.op),
    accepts: ['text'],
    mode: 'local',
    exploratory: Boolean(profile.exploratory),
    terminal: Boolean(profile.terminal),
    condition: profile.key && !key ? '需要方阵密钥。' : '',
    matches: ({ text }) => text.length <= 65536 && profile.pattern.test(text),
    suggest: () => [
      {
        params: { recipe: [{ op: profile.op, ...(profile.key ? { args: [key] } : {}) }] },
        evidence: {
          kind: 'format',
          message: '字符形式符合 ' + profile.op + ' 的尝试条件，仍需结合题意确认。',
        },
      },
    ],
    run: async (input, params, context) => {
      const result = await chef.run(input, params, context);
      // Do not let arbitrary binary parser successes flood the text graph.
      const artifact = result.artifact;
      return {
        ...result,
        eligible:
          artifact.type === 'bytes'
            ? artifact.bytes.length > 0
            : artifact.type === 'json' ||
              (artifact.type === 'text' &&
                artifact.text.length > 0 &&
                artifact.text !== input.text),
      };
    },
  }));
  adapters.push({
    id: 'unicode-normalisation',
    title: 'Unicode 规范化',
    capabilityId: 'op:Normalise%20Unicode',
    accepts: ['text'],
    mode: 'local',
    matches: ({ text }) =>
      ['NFC', 'NFD', 'NFKC', 'NFKD'].some((form) => text.normalize(form) !== text),
    suggest: ({ text }) =>
      ['NFC', 'NFD', 'NFKC', 'NFKD']
        .filter((form) => text.normalize(form) !== text)
        .map((form) => ({
          params: { recipe: [{ op: 'Normalise Unicode', args: [form] }] },
          evidence: {
            kind: 'hypothesis',
            message: '尝试 Unicode ' + form + ' 规范化；兼容形式可能改变字符含义。',
          },
        })),
    run: (input, params, context) => chef.run(input, params, context),
  });
  adapters.push({
    id: 'character-encodings',
    title: '原字符编码目录',
    capabilityId: 'op:Decode%20text',
    accepts: ['bytes'],
    mode: 'local',
    async suggest(input, { signal }) {
      const bytes = input.bytes;
      const prefix = Array.from(bytes.slice(0, 8))
        .map((value) => value.toString(16).padStart(2, '0'))
        .join('');
      if (/^(89504e47|ffd8ff|47494638|25504446|504b0304|1f8b|425a68)/.test(prefix)) return [];
      try {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        if (!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) return [];
      } catch {
        /* Continue with the original charset catalogue. */
      }
      const definition = (await getCatalogue(signal)).operations['Decode text'];
      signal.throwIfAborted();
      return definition.args
        .filter((arg) => arg.type !== 'label')[0]
        .value.map((value) => {
          const charset = typeof value === 'object' ? value.name : value;
          return {
            params: { recipe: [{ op: 'Decode text', args: [charset] }] },
            evidence: {
              kind: 'hypothesis',
              message: `按原引擎字符编码 ${charset} 解释完整字节；可读不代表已确认编码。`,
            },
          };
        });
    },
    async run(input, params, context) {
      const result = await chef.run(input, params, context);
      return {
        ...result,
        eligible:
          result.artifact.type === 'text' &&
          result.artifact.text.length > 0 &&
          !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd]/u.test(result.artifact.text),
        hypothesis: true,
      };
    },
  });
  for (const [op, args] of [
    ['AMF Decode', ['AMF0']],
    ['AMF Decode', ['AMF3']],
    ['CBOR Decode', []],
    ['From MessagePack', []],
    ['Protobuf Decode', ['', true, true]],
  ]) {
    adapters.push({
      id: 'binary-record/' + op + (args[0] || ''),
      title: op,
      capabilityId: 'op:' + encodeURIComponent(op),
      accepts: ['bytes'],
      mode: 'local',
      terminal: true,
      observation: true,
      suggest: (input) =>
        input.bytes.length
          ? [
              {
                params: { recipe: [{ op, args }] },
                evidence: {
                  kind: 'hypothesis',
                  message: '尝试解释解码后字节的结构；解析成功不代表格式已确认。',
                },
              },
            ]
          : [],
      run: (input, params, context) => chef.run(input, params, context),
    });
  }
  return adapters;
}
