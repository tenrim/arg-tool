import { FORENSICS_TASKS } from '../../forensics/catalog.js';
const details = {
  exiftool: [
    '元数据标签可以分布在不同容器和目录中，同名标签不一定是同一字段。ExifTool 的 -a 保留重复标签，-u 显示未知标签，-g1 按实际位置分组。本站同时保留原始命令输出，避免键值对象覆盖同名字段。',
    '一张包含 EXIF Make=Canon 和 XMP 作者字段的 JPEG',
    '分别列出 EXIF 与 XMP 分组中的字段',
    '读取的是文件内声明，不证明作者身份或拍摄时间真实。',
  ],
  file: [
    'libmagic 根据文件字节、偏移和格式规则判断类型。文件扩展名与 MIME 是不同信息；改名不会自动改变文件内部结构。',
    'PNG 文件改名为 image.txt',
    '仍识别为 PNG image data',
    'PNG 签名和图像结构保持不变，文件名不决定检测结论。',
  ],
  identify: [
    '图片详细信息包括尺寸、位深、颜色空间、帧和通道统计。统计反映解码像素；元数据与像素信息都不能单独证明不存在隐写。',
    '宽 64、高 32 的 RGB PNG',
    '尺寸为 64x32，包含颜色空间和通道信息',
    '尺寸来自图像结构，通道统计来自解码后的图像。',
  ],
  binwalk: [
    '文件签名扫描在不同偏移寻找已知格式；递归提取继续检查提取出的文件。签名命中可能是巧合，最终需结合成功提取、结构和内容判断。',
    'PNG 的 IEND 后附加 ZIP',
    '可能发现 PNG 与 ZIP 的起始偏移，并提取 ZIP 内容',
    'ZIP 是否可提取还取决于完整性和已安装的解包器；签名命中不是成功恢复。',
  ],
  foremost: [
    '文件雕刻依据头尾特征和结构恢复内容，不依赖原文件系统目录。恢复出来的名称通常不是原始名称，碎片化或损坏数据可能只能部分恢复。',
    '二进制数据中夹着一份完整 JPEG',
    '恢复目录包含 JPEG 候选和 audit.txt',
    '审计报告记录恢复过程，是否是目标线索仍需检查候选文件。',
  ],
  pngcheck: [
    'PNG 的数据块包含长度、类型、数据和 CRC。CRC 覆盖块类型与数据；校验失败说明字节或校验值不一致，不直接说明哪一项应被修改。',
    '修改 IHDR 中的宽度但不更新 CRC',
    '报告 IHDR CRC 不匹配',
    'CRC 检测用于定位异常，不会替用户推断原始宽度。',
  ],
  pcrt: [
    '修复器检查签名、IHDR、IDAT 与 IEND。尺寸恢复首先查询完整常见配置 CRC 表，找不到时进入有时限的尺寸搜索；IDAT 换行修复也有组合上限。修复文件另存，原文件不改动。',
    'PNG 宽度被修改，原始 IHDR CRC 仍保留',
    '找到匹配尺寸时输出修复后的 PNG；找不到时明确报告失败',
    'CRC 提供恢复约束，但不是任意损坏都能恢复，猜测结果不能当作成功。',
  ],
  zsteg: [
    '最低有效位隐写可能采用不同通道、位数、位序与像素遍历方向。zsteg 检测组合并给出候选参数；提取模式按明确参数导出字节。',
    '检测报告出现 b1,rgb,lsb,xy 对应的文本',
    '按同一参数提取后得到对应的原始字节',
    '可读文本只是候选线索，不能保证每次检测命中都是真实隐藏信息。',
  ],
  steghide: [
    'Steghide 在受支持的载体中存储内容及提取所需信息。密码参与数据定位和解密；没有隐藏内容、密码错误和不支持的格式都会导致提取失败。',
    '使用密码 test 嵌入的 note.txt',
    '输入 test 后恢复 note.txt 的原始字节',
    '提取是格式兼容的恢复过程，不是仅把图片最低位顺序拼接。',
  ],
  outguess: [
    'OutGuess 使用其自身的数据选择与嵌入约定，密钥决定提取行为。工具保留诊断和恢复文件，不把产生了一个空文件当成成功。',
    '使用密钥 test 嵌入内容的 JPEG',
    '相同密钥下恢复内容到文件',
    '使用普通 LSB 参数无法替代 OutGuess 的格式处理。',
  ],
  jsteg: [
    'JSteg 在 JPEG 量化系数中嵌入信息。JPEG 解码后的像素与原压缩系数不同，因此必须读取原始 JPEG。本站保存二进制提取字节，不把 UTF-8 显示当成完整文件。',
    'JSteg 嵌入的内容包含字节 FF 00 41',
    '下载的提取文件仍包含 FF 00 41',
    '文本预览可能出现替换字符，原始下载字节不受影响。',
  ],
  jpseek: [
    'JPSeek 是 JPHide 对应的恢复工具，使用原 JPEG 和密码读取隐藏内容。部分恢复会在诊断中保留，不能被统一成功提示掩盖。',
    'JPHide 使用密码 test 写入一个文件',
    'JPSeek 使用相同密码恢复对应文件',
    '必须匹配隐写方案；密码正确不代表文件一定未损坏。',
  ],
  openstego: [
    'OpenStego 的 RandomLSB 提取包含容器、压缩和加密处理。当前分析器依次尝试 AES128 与 AES256，不在首次失败时丢掉另一种已支持算法。',
    'RandomLSB 以 AES256 和密码 test 保存内容',
    'AES128 不匹配后，AES256 可以恢复文件',
    '两个尝试属于同一种提取工具，不需要启动其他分析器。',
  ],
  pdfid: [
    'PDFiD 扫描 PDF 结构关键字及其出现次数，包括 JavaScript、OpenAction、AA 和 EmbeddedFile 等标记。它不运行脚本，也不是文档安全性的最终判定器。',
    'PDF 对象中包含 /OpenAction 与 /JavaScript',
    '相应关键字计数增加',
    '计数只能说明存在相关标记，不能代替完整对象语义分析。',
  ],
  pdfinfo: [
    'PDF 信息读取基于文档结构，展示属性、页数、页面框、加密和其他状态。需要密码的文档使用用户提供的打开密码；失败不会伪造页数。',
    '一份包含两页的 PDF',
    'Pages 为 2；页面框模式列出相关边界',
    '文档标题等元数据可以由制作者自由设置。',
  ],
  strings: [
    '字符串提取按字符编码寻找达到最短长度的连续可打印字符。16 位、32 位及大小端解释不同；偏移按原始文件字节计数。',
    '字节 00 48 00 69，以 UTF-16BE 且最短长度 2 提取',
    'Hi',
    '若按单字节处理，零字节会把字符分隔，结果可能不同。',
  ],
  spectrogram: [
    '频谱图将音频分成时间窗口，通过傅里叶变换显示频率能量随时间的变化。不同声道分别处理；单声道混合波形用于观察幅度，不能替代各声道频谱。',
    '左声道 440 Hz、右声道 880 Hz 的双声道音频',
    '两个声道的频谱分别出现对应频率的亮带',
    '频率分辨率和时间分辨率受窗口大小影响；当前上游最多 6 声道及 8192 时间列，超出部分会标示。',
  ],
};
export const articles = FORENSICS_TASKS.map((t) => {
  const [mechanism, input, output, explanation] = details[t.engine];
  const source = {
    id: 'analyzer',
    title: 'AperiSolve ' + t.engine + ' 分析器源码',
    publisher: 'Zeecka / AperiSolve',
    url:
      'https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/' +
      t.engine +
      '.py',
    language: 'en',
    kind: 'implementation',
  };
  return {
    id: 'function-native:' + t.id,
    capabilityIds: ['native:' + t.id],
    relatedIds: ['native:' + t.id],
    topicGroup: t.group,
    title: t.title,
    aliases: t.aliases,
    summary: t.description,
    sources: [source],
    sections: [
      {
        title: '原理与输出',
        paragraphs: [mechanism, t.description],
        sourceIds: ['analyzer'],
        examples: [{ label: '输入与结果解释', input, output, explanation }],
      },
      {
        title: '运行范围',
        paragraphs: [
          '本站按用户选定的单项工具运行，不自动调用其他分析器。完整报告与提取文件均可下载，未找到内容、密码错误、格式不支持和超过资源限额分别保留实际诊断。',
        ],
        sourceIds: ['analyzer'],
      },
    ],
  };
});
