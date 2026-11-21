import { parserError } from './expected-errors.js';
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
  'Bacon Cipher Decode',
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
  'From Punycode',
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
    );
  } finally {
    signal.removeEventListener('abort', abort);
    releaseCyberChef(client);
  }
}
export function cyberChefAdapter({ textOnly = false } = {}) {
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
      const result = await bake(input, resolved, signal);
      if (result.files || result.dish?.type === 3)
        fail('UNSUPPORTED', '该输出需要专用展示或文件适配器。');
      let artifact =
        result.dish?.type === 6
          ? { type: 'json', value: result.dish.value }
          : { type: 'bytes', bytes: result.bytes };
      if (textOnly && artifact.type === 'bytes') {
        try {
          const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(
            artifact.bytes,
          );
          if (!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text))
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
