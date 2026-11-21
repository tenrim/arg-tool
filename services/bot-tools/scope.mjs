import { readFile } from 'node:fs/promises';

// One policy over the pinned original catalogue; no duplicate algorithm definitions.
export const catalogueBytes = await readFile(
  new URL('../../public/vendor/cyberchef/catalogue.json', import.meta.url),
);
export const originalCatalogue = JSON.parse(catalogueBytes);
const fileOperations = new Set([
  'Detect File Type',
  'ELF Info',
  'Extract Audio Metadata',
  'Extract Files',
  'Extract ID3',
  'Play Media',
  'Scan for Embedded Files',
  'Tar',
  'Untar',
  'Zip',
  'Unzip',
]);
const visualOperations = new Set([
  'Heatmap chart',
  'Hex Density chart',
  'Scatter chart',
  'Series chart',
  'Show on map',
]);
export function exclusionReason(name, definition = originalCatalogue.operations[name]) {
  if (!definition) return '没有此操作。';
  if (['Image', 'OCR', 'File'].includes(definition.module) || fileOperations.has(name))
    return '需要文件、图片或媒体处理，本接口仅开放文字相关操作。';
  if (visualOperations.has(name)) return '输出为图表或地图，请使用工具网页。';
  if (['HTTP request', 'DNS over HTTPS'].includes(name))
    return '需要外部网络访问，机器人计算服务不开放外部联网。';
  if (name === 'Automated Validation Test Op') return '这是上游内部测试操作。';
  return null;
}
export const SUPPORTED = Object.freeze(
  Object.keys(originalCatalogue.operations).filter((name) => !exclusionReason(name)),
);
