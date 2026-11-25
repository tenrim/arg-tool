import { parserError } from './expected-errors.js';
import { binaryPlistBytes, parseBinaryPlist, preparePlistXML } from './binary-plist.js';
import { structuredRecords } from './format-profiles.js';
import { acquireCyberChef, releaseCyberChef } from '../cyberchef-client.js';
import { defaults } from '../chef-tools/parameter-model.js';
import { getCatalogue } from '../chef-tools/catalog.js';
import { AnalysisError, fail } from './data.js';
import { CONDITIONAL_OPERATIONS } from './conditional-operations.js';

// Reviewed local operations from the pinned 11.5.0 catalogue. A future upstream
// catalogue change cannot silently add network, script or renderer execution.
// This execution boundary does not remove anything from the original tool UI.
export const LOCAL_CHEF_OPERATIONS = Object.freeze([
  ...CONDITIONAL_OPERATIONS,
  'A1Z26 Cipher Decode',
  'PHP Deserialize',
  'Analyse UUID',
  'Bcrypt parse',
  'Remove Diacritics',
  'HTML To Text',
  'Bzip2 Decompress',
  'Cetacean Cipher Decode',
  'Dechunk HTTP response',
  'Decode NetBIOS Name',
  'Defang IP Addresses',
  'From BCD',
  'From Base32',
  'From Base58',
  'From Base64',
  'From Base85',
  'From Bech32',
  'From Binary',
  'From Decimal',
  'From HTML Entity',
  'From Hex',
  'From Hex Content',
  'From Hexdump',
  'From Modhex',
  'From Morse Code',
  'From Octal',
  'From Quoted Printable',
  'From UNIX Timestamp',
  'Gunzip',
  'JWK to PEM',
  'JWT Decode',
  'Microsoft Script Decoder',
  'PEM to Hex',
  'PEM to JWK',
  'Parse CSR',
  'Parse SSH Host Key',
  'Parse UNIX file permissions',
  'Parse User Agent',
  'Parse X.509 CRL',
  'Parse X.509 certificate',
  'Raw Inflate',
  'Strip HTML tags',
  'Strip HTTP headers',
  'URL Decode',
  'Unescape Unicode Characters',
  'Zlib Inflate',
  'To Base64',
  'To Hex',
  'Analyse hash',
  'Decode text',
  'MIME Decoding',
  'From Base45',
  'From Base62',
  'From Base92',
  'From Braille',
  'From Charcode',
  'Convert Leet Speak',
  'ROT47',
  'From Case Insensitive Regex',
  'Citrix CTX1 Decode',
  'Caret/M-decode',
  'Unescape string',
  'ROT8000',
  'Bifid Cipher Decode',
  'Vigenère Decode',
  'Affine Cipher Decode',
  'Rail Fence Cipher Decode',
  'Atbash Cipher',
  'Reverse',
  'Normalise Unicode',
  'Flask Session Decode',
  'Rison Decode',
  'AMF Decode',
  'CBOR Decode',
  'From MessagePack',
  'Protobuf Decode',
]);
function checkedRecipe(params) {
  if (!Array.isArray(params.recipe) || !params.recipe.length || params.recipe.length > 8)
    fail('INPUT_INVALID', '需要 1–8 步 CyberChef 配方。');
  for (const step of params.recipe) {
    if (!step || !LOCAL_CHEF_OPERATIONS.includes(step.op))
      fail('UNSUPPORTED', '该 CyberChef 操作尚未纳入本地自动分析：' + (step?.op || '未知操作'));
    if (
      Object.keys(step).some((k) => !['op', 'args'].includes(k)) ||
      (Object.hasOwn(step, 'args') && !Array.isArray(step.args))
    )
      fail('INPUT_INVALID', '配方只接受操作名称和原始参数数组。');
  }
  return params.recipe;
}
async function bake(input, recipe, signal) {
  if (signal.aborted) throw signal.reason;
  const client = acquireCyberChef();
  const abort = () => client.close(signal.reason);
  signal.addEventListener('abort', abort, { once: true });
  try {
    // The original Chef Worker accepts ArrayBuffer, not a typed-array object.
    // Copy the view so offsets or unrelated backing bytes never enter the recipe.
    return await client.bake(
      input.type === 'text' ? input.text : input.bytes.slice().buffer,
      recipe,
      {
        structured: true,
      },
    );
  } catch (error) {
    if (signal.aborted) throw signal.reason;
    throw parserError(
      new AnalysisError(client.loaded ? 'EXECUTION_FAILED' : 'ENGINE_UNAVAILABLE', error.message),
      recipe.length === 1 ? recipe[0].op : undefined,
    );
  } finally {
    signal.removeEventListener('abort', abort);
    releaseCyberChef(client);
  }
}
export function cyberChefAdapter({ textOnly = false, ownedSuggestions = [] } = {}) {
  return {
    id: 'cyberchef',
    capabilityId: 'native:cyberchef',
    mode: 'local',
    accepts: ['text', 'bytes'],
    cost: (params) => checkedRecipe(params).length,
    async run(input, params, { signal }) {
      const recipe = checkedRecipe(params);
      let catalogue;
      try {
        catalogue = await getCatalogue(signal);
      } catch (error) {
        if (signal.aborted) throw signal.reason;
        fail('ENGINE_UNAVAILABLE', error.message);
      }
      const operations = catalogue?.operations;
      if (!operations) fail('ENGINE_UNAVAILABLE', 'CyberChef 参数目录无效。');
      const resolved = recipe.map((step) => {
        const definition = operations[step.op];
        if (!definition) fail('ENGINE_UNAVAILABLE', '原引擎缺少操作：' + step.op);
        return {
          op: step.op,
          args: Object.hasOwn(step, 'args') ? step.args : defaults(definition),
        };
      });
      for (const step of resolved) {
        if (step.op === 'XOR Brute Force' && ![1, 2].includes(step.args[0]))
          fail('INPUT_INVALID', 'XOR 试解的密钥长度须为 1 或 2 字节。');
      }
      const last = resolved.at(-1);
      const record = structuredRecords.find(([op]) => op === last.op);
      let remaining = resolved;
      let plist;
      if (record && resolved.length > 1) {
        const prefix = await bake(input, resolved.slice(0, -1), signal);
        input = { type: 'bytes', bytes: prefix.bytes };
        remaining = [last];
      }
      if (last.op === 'P-list Viewer') {
        const bytes = binaryPlistBytes(input);
        if (bytes)
          return {
            ...(await parseBinaryPlist(bytes, { signal })),
            step: { adapter: 'cyberchef', params: { recipe: resolved } },
          };
        if (input.type === 'bytes') {
          try {
            input = {
              type: 'text',
              text: new TextDecoder('utf-8', { fatal: true }).decode(input.bytes),
            };
          } catch {
            fail('INPUT_INVALID', 'XML 属性列表需要有效的 UTF-8。');
          }
        }
        if (input.type !== 'text' || !/<plist(?:\s[^<>]*)?>/.test(input.text))
          fail('INPUT_INVALID', '需要 XML 属性列表或 bplist00 字节。');
        plist = preparePlistXML(input.text);
        input = { type: 'text', text: plist.text };
      } else if (record) {
        if (input.type === 'text')
          input = { type: 'bytes', bytes: new TextEncoder().encode(input.text) };
        const defaultTLV = last.args[0] === 1 && last.args[1] === 1 && !last.args[2];
        if (
          (last.op === 'BSON deserialise' || (last.op === 'Parse TLV' && defaultTLV)) &&
          input.bytes.length > 65536
        )
          fail('LIMIT_EXCEEDED', '这项结构解析最多接受 64 KB。');
        if ((last.op !== 'Parse TLV' || defaultTLV) && !record[2](input.bytes))
          fail('INPUT_INVALID', last.op + ' 的记录头、长度或结束边界无效。');
      }
      const phpBytes =
        last.op === 'PHP Deserialize' &&
        resolved.length === 1 &&
        input.type === 'text' &&
        /[^\x00-\x7f]/u.test(input.text);
      if (phpBytes) {
        // PHP string lengths count bytes; this Worker counts JS string units.
        input = {
          type: 'text',
          text: Array.from(new TextEncoder().encode(input.text), (b) =>
            String.fromCharCode(b),
          ).join(''),
        };
      }
      const result = await bake(input, remaining, signal);
      if (result.files || result.dish?.type === 3)
        fail('UNSUPPORTED', '该输出需要专用展示或文件适配器。');
      let artifact =
        result.dish?.type === 6
          ? { type: 'json', value: result.dish.value }
          : { type: 'bytes', bytes: result.bytes };
      if (plist && typeof result.dish?.value === 'string') {
        result.dish.value = plist.restore(result.dish.value);
        artifact = { type: 'bytes', bytes: new TextEncoder().encode(result.dish.value) };
      }
      const integerBytes =
        phpBytes || (last.op === 'Text-Integer Conversion' && last.args[0] === 'String');
      if (integerBytes && typeof result.dish?.value === 'string')
        artifact = {
          type: 'bytes',
          bytes: Uint8Array.from(result.dish.value, (c) => c.charCodeAt(0)),
        };
      if (textOnly && artifact.type === 'bytes') {
        try {
          // A string dish can also have a legacy single-byte serialization.
          // Byte-producing operations still require lossless UTF-8 decoding.
          const text =
            !integerBytes &&
            operations[last.op].outputType === 'string' &&
            result.dish?.type === 1 &&
            typeof result.dish.value === 'string'
              ? result.dish.value
              : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(artifact.bytes);
          if (
            resolved.at(-1).op === 'XOR Brute Force' ||
            !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u.test(text)
          )
            artifact = { type: 'text', text };
        } catch {
          /* Retain binary output faithfully; never decode it lossily. */
        }
      }
      return {
        artifact,
        step: { adapter: 'cyberchef', params: { recipe: resolved } },
        evidence: {
          kind: 'executed',
          engine: 'CyberChef',
          message: '已执行完整配方并取得原始结果。',
        },
      };
    },
    async suggest(input, { signal }) {
      if (textOnly && input.type === 'bytes') {
        const b = input.bytes;
        // Only text encoded inside common compression wrappers is continued.
        // Images, archives and other binary results stop at the byte boundary.
        const compressed =
          (b[0] === 31 && b[1] === 139) ||
          (b[0] === 66 && b[1] === 90 && b[2] === 104) ||
          (b[0] === 120 && ((b[0] << 8) + b[1]) % 31 === 0);
        if (!compressed) return [];
      }
      // One upstream layer per pass. Cross-engine depth/budgets belong to the session.
      // Magic's data field is a snippet and is NEVER used as the next input.
      const result = await bake(input, [{ op: 'Magic', args: [1, false, false, ''] }], signal);
      if (result.dish?.type !== 6 || !Array.isArray(result.dish.value))
        fail('EXECUTION_FAILED', 'Magic 没有返回候选数组。');
      return result.dish.value.flatMap((candidate, index) =>
        candidate.recipe?.length &&
        !candidate.recipe.some((step) => ownedSuggestions.includes(step.op)) &&
        (!textOnly ||
          candidate.recipe.every(
            (step) =>
              LOCAL_CHEF_OPERATIONS.includes(step.op) && !['To Base64', 'To Hex'].includes(step.op),
          ))
          ? [
              {
                params: { recipe: candidate.recipe },
                evidence: {
                  kind: 'heuristic',
                  engine: 'CyberChef Magic',
                  upstreamOrder: index,
                  message: [
                    candidate.isUTF8 ? '候选输出符合 UTF-8。' : '候选输出未通过 UTF-8 检查。',
                    Number.isFinite(candidate.entropy)
                      ? `字节熵 ${candidate.entropy.toFixed(3)}。`
                      : '',
                    '这是原 Magic 的格式与统计依据，不代表题意或答案正确。',
                  ].join(''),
                },
              },
            ]
          : [],
      );
    },
  };
}
