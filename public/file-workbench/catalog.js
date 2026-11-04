export const FILE_TASKS = Object.freeze([
  {
    id: 'file-versions',
    title: '文件版本比较',
    group: 'files',
    aliases: ['文件夹比较', 'ZIP 比较', '文件增删', '改名检测', '版本差异'],
  },
  {
    id: 'file-batch',
    title: '多文件批量处理',
    group: 'files',
    aliases: ['批量转换', '批量图片', '批量校验', '批量 Base64'],
  },
]);
export const BATCH_OPERATIONS = Object.freeze([
  ['sha256', 'SHA-256 校验值'],
  ['base64-encode', '编码为 Base64'],
  ['base64-decode', '从 Base64 还原'],
  ['text-lf', 'UTF-8 文本统一为 LF'],
  ['image-png', '图片转 PNG'],
  ['image-jpeg', '图片转 JPEG'],
  ['image-webp', '图片转 WebP'],
]);
