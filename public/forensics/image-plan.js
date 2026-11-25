import { rasterFormat } from './image-format.js';

export { IMAGE_SURVEY } from './catalog.js';
export const imageSteps = [
  { engine: 'file' },
  { engine: 'exiftool' },
  { engine: 'identify' },
  { engine: 'strings', options: { radix: 'x' } },
  { engine: 'pngcheck', formats: ['png'] },
  { engine: 'decomposer', title: '通道与位平面' },
  { engine: 'color_remapping', title: '八组颜色重映射' },
  { engine: 'binwalk', options: { mode: 'scan' } },
  { engine: 'zsteg', formats: ['png', 'bmp'], options: { mode: 'scan' } },
  { engine: 'jsteg', formats: ['jpeg'] },
  { engine: 'steghide', formats: ['jpeg', 'bmp'], password: true },
  { engine: 'jpseek', formats: ['jpeg'], password: true },
  { engine: 'openstego', formats: ['png', 'bmp', 'jpeg', 'gif', 'tiff'], password: true },
  { engine: 'outguess', formats: ['jpeg'], password: true, deep: true },
  { engine: 'pcrt', formats: ['png'], deep: true },
  { engine: 'foremost', deep: true },
  {
    engine: 'stegoveritas',
    options: { mode: 'trailing' },
    title: '图片尾随数据',
    deep: true,
    formats: ['jpeg', 'png', 'gif', 'bmp', 'tiff'],
  },
  {
    engine: 'stegoveritas',
    options: { mode: 'transform' },
    title: 'StegoVeritas 图像增强',
    deep: true,
  },
  { engine: 'stegoveritas', options: { mode: 'colormap' }, title: '调色板索引分离', deep: true },
  {
    engine: 'stegoveritas',
    options: { mode: 'brute' },
    title: 'StegoVeritas LSB 候选扫描',
    deep: true,
  },
];

export function surveyPlan(bytes, depth) {
  const format = imageFormat(bytes);
  const indexed = format === 'gif' || (format === 'png' && bytes[25] === 3);
  const steps = imageSteps.filter((step) => {
    if ((step.deep && depth !== 'deep') || (step.formats && !step.formats.includes(format)))
      return false;
    if (step.options?.mode === 'colormap') return indexed;
    if (step.options?.mode === 'brute')
      return !indexed && (format !== 'png' || [2, 6].includes(bytes[25]));
    return true;
  });
  return { format, steps };
}

export function surveyOptions(step, depth) {
  if (depth === 'deep' && step.engine === 'zsteg') return { mode: 'all' };
  if (depth === 'deep' && step.engine === 'binwalk') return { mode: 'extract', depth: 2 };
  return { ...step.options };
}

export function imageFormat(bytes) {
  const format = rasterFormat(bytes);
  if (format) return format;
  throw Error('请选择 PNG、JPEG、BMP、GIF、WebP 或 TIFF 图片。未识别到支持的文件头。');
}
