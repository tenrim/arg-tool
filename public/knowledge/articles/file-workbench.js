const source = (id, title, url, locator, language = 'en') => ({
  id,
  title,
  url,
  locator,
  language,
  publisher: id === 'base64' ? 'RFC Editor' : 'MDN Web Docs',
  kind: 'official-doc',
});
const digest = source(
  'digest',
  'SubtleCrypto.digest',
  'https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/digest',
  'SHA-256 与摘要输入',
  'zh-CN',
);
const implementation = {
  id: 'implementation',
  title: '文件工作区实现',
  url: '/file-workbench/model.js',
  locator: 'readSet、compareSets、transformFile',
  publisher: '迷雾工具箱',
  language: 'zh-CN',
  kind: 'implementation',
};
export const articles = [
  {
    id: 'function-native:file-versions',
    capabilityIds: ['native:file-versions'],
    relatedIds: ['native:file-versions'],
    topicGroup: 'files',
    title: '文件版本比较',
    aliases: ['文件夹比较', '改名检测'],
    summary:
      '按相对路径配对两个文件集合，以实际字节判断增删和修改，再为不同路径的相同内容查找改名候选。',
    sources: [digest, implementation],
    sections: [
      {
        title: '路径与字节比较',
        paragraphs: [
          '文件夹选择去掉最外层目录名，保留其余相对路径；ZIP 保留内部路径。相同路径逐字节比较，完全相同记为相同，不同记为修改。只在旧集合出现的路径记为删除，只在新集合出现的路径记为新增。名称区分大小写，不使用文件修改时间代替内容比较。',
          '修改数量按相同字节偏移比较，再加上两侧长度差；它不是文本编辑距离。首次差异偏移从零开始，文字与十六进制片段只供预览，比较过程读取全部允许范围内的字节。',
        ],
        sourceIds: ['implementation'],
        examples: [
          {
            input: '旧 a.txt 为 ABC，新 a.txt 为 ADC',
            output: '修改；1 字节不同；首次偏移 1',
            explanation: '三个位置逐一比较，只有第二个字节 B 与 D 不同。',
            label: '字节比较',
          },
        ],
      },
      {
        title: '改名候选与边界',
        paragraphs: [
          '对新增和删除项先计算 SHA-256，再对摘要匹配的候选逐字节复核。只有两侧各有一个相同内容候选时标为疑似改名；多个相同副本保持增删状态并列出候选。仅凭内容相同不能证明真实改名历史。',
          '每侧最多 500 文件、单文件 32 MB、合计 64 MB。ZIP 必须显式选择展开，不递归展开嵌套压缩包；拒绝加密、分卷、ZIP64、不安全路径及校验失败的条目。报告保留全部文件差异条目，较大文本仅截取并标示预览片段。',
        ],
        sourceIds: ['digest', 'implementation'],
      },
    ],
    misconceptions: [],
  },
  {
    id: 'function-native:file-batch',
    capabilityIds: ['native:file-batch'],
    relatedIds: ['native:file-batch'],
    topicGroup: 'files',
    title: '多文件批量处理',
    aliases: ['批量转换', '批量图片'],
    summary:
      '将同一操作逐个应用于文件，分别记录成功、失败与输出，单项失败不会把其他文件伪装为成功。',
    sources: [
      digest,
      implementation,
      source(
        'base64',
        'RFC 4648 Base64',
        'https://www.rfc-editor.org/rfc/rfc4648.html',
        '第 3、4、10 节',
      ),
      source(
        'canvas',
        'OffscreenCanvas.convertToBlob',
        'https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob',
        'type、quality 与浏览器格式支持',
      ),
      source(
        'text',
        'TextDecoder',
        'https://developer.mozilla.org/zh-CN/docs/Web/API/TextDecoder',
        'fatal、ignoreBOM',
        'zh-CN',
      ),
    ],
    sections: [
      {
        title: '字节与文本操作',
        paragraphs: [
          'SHA-256 将文件原字节映射为 256 位摘要，输出 64 位十六进制文本。Base64 每 3 字节分为 4 个六位组，使用标准字母表及等号填充；解码允许空格、制表符和换行，拒绝非法字符及不规范填充位。',
          '换行统一严格按 UTF-8 解码，无法解码即报错；将 CRLF 和单独 CR 转为 LF，保留 BOM 和其他字符。此操作改变文本字节，不适用于任意二进制文件。',
        ],
        sourceIds: ['digest', 'base64', 'text', 'implementation'],
        examples: [
          {
            input: 'UTF-8 文件内容 foo',
            output: 'Base64 编码结果 Zm9v',
            explanation: '66 6f 6f 共 24 位，四个六位索引对应 Z、m、9、v。',
            label: '标准测试向量',
          },
          {
            input: 'A\r\nB\rC',
            output: 'A\nB\nC',
            explanation: '两种回车换行序列都变为单一 LF。',
            label: '换行规则',
          },
        ],
      },
      {
        title: '图片重新编码',
        paragraphs: [
          'PNG、JPEG、WebP 转换先由浏览器解码图片，再在画布上按最长边限制等比缩小，不放大。输出尺寸四舍五入且至少一像素。JPEG 不支持透明度，透明处铺白色；质量参数只用于 JPEG 和 WebP。',
          '这是静态图片重新编码：不会保留原始元数据、动画全部帧或隐写字节。图片最多 4000 万像素；浏览器无法解码或不支持目标格式时该项明确失败，不将 PNG 回退结果冒充其他格式。',
        ],
        sourceIds: ['canvas', 'implementation'],
        examples: [
          {
            input: '4000 × 2000 图片，最长边 1000',
            output: '1000 × 500 图片',
            explanation: '缩放比例为 1000/4000=0.25，宽高同比缩小。',
            label: '比例计算',
          },
        ],
      },
      {
        title: '队列、停止与导出',
        paragraphs: [
          '每批最多 500 文件、单文件 32 MB、输入合计 64 MB，成功输出合计最多 32 MB。任务在本地 Worker 顺序执行，停止会终止 Worker，已经完成的结果仍可下载。重试只执行失败和未完成项。',
          '修改文件或参数会清除旧结果；打包仅包含成功输出并保留目录。同名输出不会覆盖；失败原因留在列表，不能将部分成功标为全部完成。',
        ],
        sourceIds: ['implementation'],
      },
    ],
    misconceptions: [],
  },
];
