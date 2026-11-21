import Invisibles from '../vendor/basics/invisibles.js';
import { completionJob } from '../completion/job.js';
import { NATO } from '../completion/codes.js';
import { fail } from './data.js';
import { workerJob } from './worker-job.js';

const parserEvidence = { kind: 'parsed', message: '原工具已完成转换；仍需结合题意判断。' };
const worker = new URL('./worker.js', import.meta.url);
const utf8 = (bytes) => new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
export function localAdapters() {
  return [
    ...['tapcode', 'baudot', 'invisible'].map((id) => ({
      id,
      capabilityId: 'native:' + id,
      mode: 'local',
      accepts: ['text'],
      terminal: id === 'invisible',
      observation: id === 'invisible',
      suggest(input) {
        const text = input.text.trim();
        if (!input.text || new TextEncoder().encode(input.text).length > 65536) return [];
        const proposal = (params, message) => ({ params, evidence: { kind: 'format', message } });
        if (id === 'tapcode') {
          if (
            /^[.·\s/]+$/.test(text) &&
            text.split(/\s*\/\s*/).every((word) => {
              const groups = word.split(/\s+/);
              return (
                groups.length >= 2 &&
                groups.length % 2 === 0 &&
                groups.every((g) => g.length >= 1 && g.length <= 5)
              );
            })
          )
            return [
              proposal(
                { direction: 'decode', mode: 'tap' },
                '成对点数组符合敲击码；采用 C/K 合并的标准方阵。',
              ),
            ];
          if (
            /^[1-6\s,;/]+$/.test(text) &&
            text.split(/\s*\/\s*/).every((word) => {
              const digits = word.replace(/[\s,;]/g, '');
              return digits.length >= 2 && digits.length % 2 === 0;
            })
          )
            return (text.includes('6') ? ['6'] : ['5', '6']).map((size) =>
              proposal(
                { direction: 'decode', mode: 'polybius', size, keyword: '' },
                `坐标成对；尝试无关键词的 ${size}×${size} 方阵，行在前、列在后。`,
              ),
            );
        }
        if (
          id === 'baudot' &&
          /^[01]{5}(?:[\s,;]+[01]{5})+$/.test(text) &&
          text.split(/[\s,;]+/).length <= 4096
        )
          return ['ITA2', 'ITA1', 'US_TTY'].map((alphabet) =>
            proposal(
              { direction: 'decode', alphabet, format: 'binary' },
              `五位分组符合波多码；尝试 ${alphabet} 字母表，不颠倒位序。`,
            ),
          );
        if (
          id === 'invisible' &&
          [...input.text].some((char) => Invisibles.classify(char.codePointAt(0)))
        )
          return [
            proposal(
              { action: 'inspect', preserve: true },
              '检测到隐藏或方向控制字符，列出位置；不自动清理原文。',
            ),
          ];
        // Inspection is terminal: its report is never treated as ciphertext.
        return [];
      },
      run: (input, params, context) =>
        workerJob(worker, { operation: id, text: input.text, options: params }, context),
    })),
    {
      id: 'utf8-text',
      capabilityId: 'native:utf8',
      mode: 'local',
      accepts: ['bytes'],
      suggest(input) {
        try {
          const text = utf8(input.bytes);
          return text && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)
            ? [{ params: {}, evidence: { kind: 'format', message: '完整字节可按 UTF-8 解码。' } }]
            : [];
        } catch {
          return [];
        }
      },
      async run(input) {
        try {
          return { artifact: { type: 'text', text: utf8(input.bytes) }, evidence: parserEvidence };
        } catch {
          fail('INPUT_INVALID', '字节不是完整有效的 UTF-8。');
        }
      },
    },
    {
      id: 'roman',
      capabilityId: 'native:roman',
      mode: 'local',
      accepts: ['text'],
      suggest(input) {
        return input.text.length <= 65536 &&
          /^[IVXLCDMivxlcdm\s]+$/.test(input.text) &&
          input.text.trim()
          ? [
              {
                params: { direction: 'decode' },
                evidence: {
                  kind: 'format',
                  message: '字符范围符合罗马数字；也可能是普通字母。',
                },
              },
            ]
          : [];
      },
      async run(input, params, context) {
        if (!['encode', 'decode'].includes(params.direction))
          fail('INPUT_INVALID', '需要明确转换方向。');
        const result = await workerJob(
          worker,
          { operation: 'roman', text: input.text, options: { direction: params.direction } },
          context,
        );
        return { ...result, evidence: parserEvidence };
      },
    },
    {
      id: 'nato',
      capabilityId: 'native:nato',
      mode: 'local',
      accepts: ['text'],
      suggest(input) {
        if (!input.text.trim() || input.text.length > 65536) return [];
        const words = input.text.trim().split(/\s+/);
        return words.some((w) => w !== '/') &&
          words.every((w) => w === '/' || NATO.some((n) => n.toLowerCase() === w.toLowerCase()))
          ? [
              {
                params: { direction: 'decode' },
                evidence: {
                  kind: 'format',
                  message: '词项符合无线电拼读字母表。',
                },
              },
            ]
          : [];
      },
      async run(input, params, { signal }) {
        if (!['encode', 'decode'].includes(params.direction))
          fail('INPUT_INVALID', '需要明确转换方向。');
        const result = await completionJob(
          { task: 'nato', input: input.text, options: { direction: params.direction } },
          { signal },
        );
        return { artifact: { type: 'text', text: result.output }, evidence: parserEvidence };
      },
    },
    {
      id: 'cipher-statistics',
      capabilityId: 'native:cipher-detect',
      mode: 'local',
      accepts: ['text'],
      // Statistics are an observation, not a transformed clue to recurse into automatically.
      run: (input, params, context) =>
        workerJob(
          worker,
          { operation: 'cipher-statistics', text: input.text, options: params },
          context,
        ),
    },
  ];
}
