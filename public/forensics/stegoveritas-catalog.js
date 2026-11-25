export const STEGOVERITAS_SOURCE = 'https://github.com/bannsec/stegoVeritas';
export const STEGOVERITAS_OPTIONS = [
  {
    key: 'mode',
    label: '操作',
    choices: [
      ['transform', '图像增强组合（21 张）'],
      ['colormap', '调色板索引分析'],
      ['extract', '按 RGBA 位编号交织提取'],
      ['brute', 'LSB 候选扫描与文件识别'],
      ['trailing', '图片尾随数据提取'],
      ['hide', 'LSB 嵌入（含 Alpha）'],
    ],
  },
  ...['red', 'green', 'blue', 'alpha'].map((key, i) => ({
    key,
    label: `${['红', '绿', '蓝', 'Alpha'][i]}通道位编号（0–7，空格分隔；留空不取）`,
    value: i < 3 ? '0' : '',
    modes: ['extract'],
    maxLength: 32,
    pattern: '^[0-7 ,]*$',
  })),
  {
    key: 'indices',
    label: '导出索引（0–255，空格分隔；留空导出全部 256 个）',
    value: '',
    modes: ['colormap'],
    maxLength: 1024,
    pattern: '^[0-9 ,]*$',
  },
  {
    key: 'keep',
    label: '各图共同保留的索引（可留空）',
    value: '',
    modes: ['colormap'],
    maxLength: 1024,
    pattern: '^[0-9 ,]*$',
  },
  {
    key: 'rangeStart',
    label: '共同保留区间起点（可留空）',
    value: '',
    modes: ['colormap'],
    maxLength: 3,
    pattern: '^[0-9]*$',
  },
  {
    key: 'rangeEnd',
    label: '共同保留区间终点（不包含，最多 256）',
    value: '',
    modes: ['colormap'],
    maxLength: 3,
    pattern: '^[0-9]*$',
  },
  {
    key: 'text',
    label: '嵌入文字（UTF-8，最多 8192 字符；更长内容请选择载荷文件）',
    type: 'textarea',
    value: '',
    modes: ['hide'],
    maxLength: 8192,
  },
  {
    key: 'bands',
    label: '通道顺序（如 RGB、BGR、RGBA）',
    value: 'RGB',
    modes: ['hide'],
    maxLength: 4,
    pattern: '^[RGBArgba]+$',
  },
  {
    key: 'format',
    label: '输出格式',
    modes: ['hide'],
    choices: [
      ['png', 'PNG（支持 Alpha）'],
      ['bmp', 'BMP（RGB）'],
    ],
  },
];
export const STEGOVERITAS_TIPS = {
  transform: '生成全部 21 张滤镜和增强图。原始颜色通道、位平面、反色等可使用下方本地图片工具。',
  colormap:
    '需要原始索引图（P 模式）。每张图将一个索引及共同保留索引置黑，其余置白。透明索引保留原透明度。',
  extract: '逐像素，再按位编号从低到高、同位按 RGBA 交织。这个顺序与先取完某通道各位的算法不同。',
  brute:
    '执行上游全部 40 组 RGB／48 组 RGBA 候选，并用文件特征库和 Binwalk 检查。所有候选原字节可下载；未命中不能证明没有隐写。',
  trailing:
    '按 PNG、JPEG、BMP、GIF 或经典 TIFF 的结构提取末尾附加字节。附加数据不一定是隐写；TIFF 私有标签可能另有引用。',
  hide: '逐行将完整文字或文件写入所选通道最低位。容量不足会拒绝，不截断载荷。Alpha 通道请导出 PNG；提取时需要知道载荷长度。',
};
export const STEGOVERITAS_REUSED = [
  ['图片隐写、位平面与通道', '#image?task=native%3Aimage-steg'],
  ['GIF／APNG 完整拆帧', '#video?task=native%3Avideo-animation'],
  ['元数据／原始 XMP', '#forensics-exiftool?task=native%3Aforensics-exiftool'],
  ['文件雕刻与递归提取', '#forensics-binwalk?task=native%3Aforensics-binwalk'],
  ['Steghide 密码／密码列表', '#forensics-steghide?task=native%3Aforensics-steghide'],
];
