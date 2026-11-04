export const SERVER_FILE_LIMIT_BYTES = 20 * 1024 * 1024;

const definitions = [
  [
    'exiftool',
    '完整文件元数据',
    'files',
    '读取图片、音频、视频和文档元数据，保留重复标签、未知标签与分组。',
    'https://exiftool.org/',
    'Artistic-1.0-Perl 或 GPL-1.0-or-later',
  ],
  [
    'file',
    '文件类型与 MIME 识别',
    'files',
    '使用 libmagic 特征库识别文件实际类型，不以扩展名代替检测。',
    'https://www.darwinsys.com/file/',
    'BSD-2-Clause',
  ],
  [
    'identify',
    '图片详细属性与通道统计',
    'image',
    '读取图像格式、尺寸、颜色空间、通道统计及详细属性。',
    'http://www.graphicsmagick.org/',
    'MIT；依赖按各自许可',
  ],
  [
    'binwalk',
    '嵌入文件扫描与递归提取',
    'files',
    '识别文件内部的格式特征，并按所选深度提取嵌套内容。',
    'https://github.com/ReFirmLabs/binwalk',
    'MIT',
  ],
  [
    'foremost',
    '文件雕刻与恢复',
    'files',
    '按文件头、文件尾和内部结构从原始数据中恢复文件，输出完整恢复报告。',
    'https://foremost.sourceforge.net/',
    'Public domain；api.c、ole.h 等为 GPL-2.0-or-later',
  ],
  [
    'pngcheck',
    'PNG 完整性检查',
    'image',
    '检查 PNG、JNG、MNG 的数据块、CRC 与压缩数据并保留完整诊断。',
    'http://www.libpng.org/pub/png/apps/pngcheck.html',
    '自定义 MIT-like；附加 gpl 工具为 GPL-2.0-or-later',
  ],
  [
    'pcrt',
    'PNG 损坏修复',
    'image',
    '修复 PNG 签名、IHDR 尺寸、数据块及部分换行损坏，提取 IEND 后附加数据。',
    'https://github.com/Zeecka/AperiSolve',
    'MIT',
  ],
  [
    'zsteg',
    'PNG／BMP 隐写检测与提取',
    'image',
    '检测多种位序、通道和像素顺序的隐写数据，并按检测参数提取原始字节。',
    'https://github.com/zed-0xff/zsteg',
    'MIT',
  ],
  [
    'steghide',
    'Steghide 隐写提取',
    'files',
    '从 JPEG、BMP、WAV、AU 中提取 Steghide 数据，支持密码和原文件名。',
    'https://steghide.sourceforge.net/',
    'GPL-2.0-or-later',
  ],
  [
    'outguess',
    'OutGuess 隐写提取',
    'image',
    '提取 OutGuess 隐写内容，支持用户提供的密钥。',
    'https://github.com/resurrecting-open-source-projects/outguess',
    'BSD-4-Clause、BSD-3-Clause；JPEG 等部分另有许可',
  ],
  [
    'jsteg',
    'JSteg 隐写提取',
    'image',
    '从 JPEG 提取 JSteg 隐写的原始二进制内容。',
    'https://github.com/lukechampine/jsteg',
    'MIT',
  ],
  [
    'jpseek',
    'JPHide／JPSeek 隐写提取',
    'image',
    '使用 JPSeek 提取 JPHide 写入 JPEG 的内容，支持密码。',
    'https://github.com/h3xx/jphs',
    'GNU GPL（随包 COPYING 为第 3 版）；JPEG 库按 IJG 许可',
  ],
  [
    'openstego',
    'OpenStego 隐写提取',
    'image',
    '提取 RandomLSB 数据，保留 AES128、AES256 两种密码尝试及提取文件。',
    'https://github.com/syvaidya/openstego',
    'GPL-2.0-only',
  ],
  [
    'pdfid',
    'PDF 结构与脚本标记检查',
    'files',
    '统计 PDF 对象、流、脚本、自动动作和嵌入文件标记，不执行 PDF 内容。',
    'https://github.com/DidierStevens/DidierStevensSuite',
    'Public domain',
  ],
  [
    'pdfinfo',
    'PDF 完整信息',
    'files',
    '读取 PDF 元数据、页数、页面尺寸、加密状态与页面框。',
    'https://poppler.freedesktop.org/',
    'GPL-2.0-or-later',
  ],
  [
    'strings',
    '二进制字符串提取',
    'files',
    '提取单字节和多字节编码字符串，可指定最短长度、编码及偏移。',
    'https://www.gnu.org/software/binutils/',
    'GPL-3.0-or-later',
  ],
  [
    'spectrogram',
    '多声道音频频谱图',
    'audio',
    '通过 FFmpeg 解码音频并生成各声道频谱图与波形，完整导出生成图片。',
    'https://ffmpeg.org/',
    'LGPL-2.1-or-later；本镜像 Debian 构建含 GPL 组件',
  ],
];
export const FORENSICS_TASKS = Object.freeze(
  definitions.map(([engine, title, group, description, url, license]) => ({
    engine,
    id: 'forensics-' + engine,
    title,
    group,
    description,
    url,
    license,
    aliases: [engine, 'AperiSolve', 'Aperi’Solve', description],
    password: ['steghide', 'outguess', 'jpseek', 'openstego', 'pdfinfo'].includes(engine),
  })),
);
export const FORENSICS_OPTIONS = Object.freeze({
  binwalk: [
    {
      key: 'mode',
      label: '处理方式',
      choices: [
        ['extract', '扫描并提取'],
        ['scan', '只扫描'],
      ],
    },
    { key: 'depth', label: '递归深度', type: 'number', value: 2, min: 1, max: 8 },
  ],
  zsteg: [
    {
      key: 'mode',
      label: '处理方式',
      choices: [
        ['scan', '常规检测'],
        ['all', '全部检测组合'],
        ['extract', '按参数提取'],
      ],
    },
    { key: 'extract', label: '提取参数（例如 b1,rgb,lsb,xy）', value: '' },
  ],
  strings: [
    {
      key: 'encoding',
      label: '字符编码',
      choices: [
        ['s', '7 位单字节'],
        ['S', '8 位单字节'],
        ['l', '16 位小端'],
        ['b', '16 位大端'],
        ['L', '32 位小端'],
        ['B', '32 位大端'],
      ],
    },
    { key: 'minimum', label: '最短字符数', type: 'number', value: 4, min: 1, max: 1024 },
    {
      key: 'radix',
      label: '偏移显示',
      choices: [
        ['none', '不显示'],
        ['x', '十六进制'],
        ['d', '十进制'],
        ['o', '八进制'],
      ],
    },
  ],
  pdfinfo: [
    {
      key: 'mode',
      label: '信息范围',
      choices: [
        ['default', '基本信息'],
        ['box', '页面框'],
        ['meta', '完整元数据 XML'],
        ['url', '文档 URL'],
      ],
    },
  ],
  exiftool: [
    {
      key: 'mode',
      label: '输出格式',
      choices: [
        ['text', '完整分组文本'],
        ['json', 'JSON（含重复和未知标签）'],
      ],
    },
  ],
});
export const FORENSICS_HELP = Object.fromEntries(
  FORENSICS_TASKS.map((t) => [
    t.id,
    {
      steps: [
        '选择需要处理的原始文件，设置当前工具参数。',
        '点击“上传并处理”，只运行当前选择的引擎。',
        '查看完整诊断，下载单个文件或全部结果；修改输入或离页会停止当前任务。',
      ],
      tip:
        t.description +
        ' 文件会上传到本站独立处理容器，不会提交给 AperiSolve 官网。单文件最多 20 MB，完整结果最多 64 MB，单次最多 240 秒；超过限额明确失败。临时文件随任务容器删除。密码不保存到预设、网址或日志。频谱图沿用上游最多 6 声道、8192 时间列的边界，超出时由结果说明。',
    },
  ]),
);
