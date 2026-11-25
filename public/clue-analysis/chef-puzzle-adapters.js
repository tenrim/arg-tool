// Supplemental decoders absent from the upstream Magic input-pattern selection.
// Every recipe is replayed by the same original Worker and parameter model.
import { getCatalogue } from '../chef-tools/catalog.js';
import { fail } from './data.js';
import { formatProfiles, structuredRecords, baconArguments } from './format-profiles.js';
export const CHEF_PUZZLE_PROFILES = Object.freeze([
  ...formatProfiles,
  {
    op: 'Flask Session Decode',
    pattern: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    terminal: true,
  },
  { op: 'Rison Decode', pattern: /^!?\([\s\S]*\)$/, terminal: true },
  { op: 'MIME Decoding', pattern: /=\?[^?]+\?[BQ]\?[^?]+\?=/i },
  { op: 'From Base45', pattern: /^[0-9A-Z $%*+./:-]{3,}$/, exploratory: true },
  { op: 'From Base62', pattern: /^[A-Za-z0-9]{3,}$/, exploratory: true },
  { op: 'From Base92', pattern: /^[!#-_a-}]{2,}$/, exploratory: true },
  { op: 'From Braille', pattern: /^[\u2800-\u28ff\s]+$/ },
  { op: 'From Charcode', pattern: /^\d+(?:[ ,]+\d+)+$/ },
  {
    op: 'From Punycode',
    pattern: /^(?:[a-z\d-]+\.)*xn--[a-z\d-]+(?:\.[a-z\d-]+)*\.?$/i,
    args: [true],
  },
  {
    op: 'From Punycode',
    variant: 'raw',
    title: '原始 Punycode',
    requireUnicode: true,
    pattern: /^(?!xn--)(?:[a-z\d-]+-[a-z\d]+|(?=[a-z]*\d)(?=[\d]*[a-z])[a-z\d]{3,63})$/i,
    args: [false],
    exploratory: true,
  },
  {
    op: 'Convert Leet Speak',
    pattern: /^(?=[a-z\d\s.,!?'-]*[a-z])(?=[a-z\d\s.,!?'-]*[013457])[a-z\d\s.,!?'-]{3,}$/i,
    args: ['From Leet Speak'],
    exploratory: true,
  },
  { op: 'From Case Insensitive Regex', pattern: /\[[A-Za-z]{2}\]/ },
  { op: 'Citrix CTX1 Decode', pattern: /^CTX1:/ },
  { op: 'Caret/M-decode', pattern: /(?:\^[A-Z@\[\]\\^_?]|M-)/ },
  { op: 'Unescape string', pattern: /\\(?:[nrtbfv\\'"]|x[\da-f]{2}|u[\da-f]{4})/i },
  { op: 'ROT8000', pattern: /[^\x00-\x7f]/u, exploratory: true },
  { op: 'Bifid Cipher Decode', pattern: /^[A-Za-z\s]+$/, exploratory: true, key: true },
]);
export function chefPuzzleAdapters(chef, { key = '', expanded = false } = {}) {
  const adapters = CHEF_PUZZLE_PROFILES.map((profile) => ({
    id: 'chef-puzzle/' + profile.op + (profile.variant ? '/' + profile.variant : ''),
    title: profile.title || profile.op,
    capabilityId: 'op:' + encodeURIComponent(profile.op),
    accepts: ['text'],
    mode: 'local',
    exploratory: Boolean(profile.exploratory),
    terminal: Boolean(profile.terminal),
    observation: Boolean(profile.observation),
    cost: chef.cost,
    condition: profile.key && !key ? '需要方阵密钥。' : '',
    matches: ({ text }) =>
      text.length <= 65536 &&
      (profile.matches ? profile.matches(text) : profile.pattern.test(text)),
    suggest: () => [
      {
        params: {
          recipe: [
            {
              op: profile.op,
              ...(profile.key || profile.args ? { args: profile.key ? [key] : profile.args } : {}),
            },
            ...(profile.follow ? [{ op: profile.follow }] : []),
          ],
        },
        evidence: {
          kind: profile.exploratory ? 'hypothesis' : 'format',
          ...(profile.key && key && { providedKey: true }),
          message: '字符形式符合 ' + profile.op + ' 的尝试条件，仍需结合题意确认。',
        },
      },
    ],
    run: async (input, params, context) => {
      const result = await chef.run(input, params, context);
      // Do not let arbitrary binary parser successes flood the text graph.
      const artifact = result.artifact;
      if (
        profile.requirePrintable &&
        (artifact.type !== 'text' || !artifact.text.trim() || artifact.text.includes('\ufffd'))
      )
        return { ...result, eligible: false };
      if (
        profile.requireUnicode &&
        (artifact.type !== 'text' || !/[^\x00-\x7f]/u.test(artifact.text))
      )
        return { ...result, eligible: false };
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
  // Explore actual shifts/keys separately so a readable result can continue into the next layer.
  const trials = [
    {
      op: 'Caesar Box Cipher',
      title: '凯撒方阵 · 无折返等宽分栏',
      accepts: ['text'],
      matches: ({ text }) => /^[\x20-\x7e]{4,512}$/.test(text),
      argumentsFor: ({ text }) =>
        Array.from({ length: Math.min(expanded ? 32 : 12, text.length - 1) - 1 }, (_, i) => [
          i + 2,
        ]),
    },
    {
      op: 'Bacon Cipher Decode',
      title: '培根密码 · 字母表与隐写方式',
      accepts: ['text'],
      matches: (input) => input.text.length <= 65536 && baconArguments(input).length > 0,
      argumentsFor: baconArguments,
    },
    {
      op: 'Rail Fence Cipher Decode',
      title: '栅栏密码 · 栏数与偏移',
      accepts: ['text'],
      matches: ({ text }) =>
        text.length >= 3 && text.length <= 512 && /^[\x20-\x7e\r\n\t]+$/.test(text),
      argumentsFor({ text }) {
        const rows = [];
        for (let rails = 2; rails <= Math.min(text.length, expanded ? 32 : 4); rails++)
          for (let offset = rails > 12 ? 0 : 1; offset < 2 * (rails - 1); offset++)
            rows.push([rails, offset]);
        return rows;
      },
    },
  ];
  adapters.push({
    id: 'xor-key-report',
    title: '按已知条件列出短密钥 XOR 试解',
    capabilityId: 'op:XOR%20Brute%20Force',
    accepts: ['text', 'bytes'],
    mode: 'local',
    terminal: true,
    observation: true,
    async run(input, { args }, context) {
      const [length, sampleSize, offset] = args;
      if (
        ![1, 2].includes(length) ||
        ![sampleSize, offset].every((n) => Number.isSafeInteger(n) && n >= 0)
      )
        fail('INPUT_INVALID', '请填写 1–2 字节密钥长度，以及非负整数的样本长度和偏移。');
      const size =
        input.type === 'bytes' ? input.bytes.length : new TextEncoder().encode(input.text).length;
      const testedBytes = Math.min(sampleSize, Math.max(0, size - offset));
      if (testedBytes * (256 ** length - 1) > context.limits.retainedBytes)
        fail('INPUT_INVALID', '本次密钥与样本组合过大，请降低样本长度或指定样本偏移。');
      const result = await chef.run(input, { recipe: [{ op: 'XOR Brute Force', args }] }, context);
      return {
        ...result,
        step: { adapter: 'xor-key-report', params: { args: result.step.params.recipe[0].args } },
      };
    },
  });
  if (expanded)
    trials.push(
      {
        op: 'ROT47',
        title: '可打印字符移位',
        accepts: ['text'],
        matches: ({ text }) =>
          text.length >= 3 && text.length <= 512 && /^[\x20-\x7e\r\n\t]+$/.test(text),
        argumentsFor: () =>
          Array.from({ length: 93 }, (_, i) => i + 1)
            .filter((n) => n !== 47)
            .map((n) => [n]),
      },
      {
        op: 'XOR',
        title: '单字节 XOR 试解',
        accepts: ['text', 'bytes'],
        matches: (input) =>
          input.type === 'bytes'
            ? input.bytes.length >= 2 && input.bytes.length <= 512
            : input.text.length >= 2 &&
              input.text.length <= 512 &&
              /^[\x20-\x7e\r\n\t]+$/.test(input.text),
        argumentsFor: () =>
          Array.from({ length: 255 }, (_, i) => [
            { option: 'Hex', string: (i + 1).toString(16).padStart(2, '0') },
            'Standard',
            false,
          ]),
      },
    );
  for (const trial of trials)
    adapters.push({
      id: 'search/' + trial.op,
      title: trial.title,
      accepts: trial.accepts,
      capabilityId: 'op:' + encodeURIComponent(trial.op),
      mode: 'local',
      exploratory: true,
      matches: trial.matches,
      directTrials: true,
      suggest: (input) =>
        trial.argumentsFor(input).map((args) => ({
          params: { recipe: [{ op: trial.op, args }] },
          evidence: { kind: 'hypothesis', message: trial.title + '，本次尝试的参数见步骤记录。' },
        })),
      async run(input, params, context) {
        const result = await chef.run(input, params, context);
        return {
          ...result,
          eligible:
            result.artifact.type === 'text' &&
            !!result.artifact.text &&
            (trial.op !== 'Bacon Cipher Decode' || !result.artifact.text.includes('?')) &&
            result.artifact.text !== input.text,
        };
      },
    });
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
  for (const [op, args, matches] of [
    ...structuredRecords,
    ['AMF Decode', ['AMF0']],
    ['AMF Decode', ['AMF3']],
    ['CBOR Decode', []],
    ['From MessagePack', []],
    ['Protobuf Decode', ['', true, true]],
  ]) {
    adapters.push({
      id: 'binary-record/' + op + (matches ? '' : args[0] || ''),
      title: op,
      capabilityId: 'op:' + encodeURIComponent(op),
      accepts: matches ? ['bytes', 'text'] : ['bytes'],
      mode: 'local',
      cost: chef.cost,
      terminal: true,
      observation: true,
      ...(matches && { matches: (input) => input.type === 'bytes' && matches(input.bytes) }),
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
