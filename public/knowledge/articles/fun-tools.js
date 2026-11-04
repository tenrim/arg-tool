const source = (id, repo, locator) => ({
  id,
  title: repo,
  url: 'https://github.com/' + repo,
  locator,
  publisher: repo.split('/')[0],
  language: 'en',
  kind: 'implementation',
});
const section = (title, paragraphs, sourceIds, example) => ({
  title,
  paragraphs,
  sourceIds,
  ...(example
    ? {
        examples: [
          { label: title, input: example[0], output: example[1], explanation: example[2] },
        ],
      }
    : {}),
});
const data = [
  [
    'pic-scramble',
    '图片混淆',
    'image',
    '沿矩形 Gilbert 曲线移动像素，改变图片可见结构，保持无损像素置换可逆。',
    [source('pic', 'iris10086/pic-scramble', 'index.html:107–236')],
    [
      section(
        '曲线与移位',
        [
          'Gilbert 曲线为矩形像素建立一维访问顺序。令 N 为宽乘高，位移为 round((√5−1)N/2)，原位置 i 的像素复制到曲线位置 (i+位移) mod N。逆变换交换读取与写入位置。',
          '算法没有用户密钥。相同尺寸的所有图片使用相同置换，因此它只能打乱直观可读性，不提供密码学保密。',
        ],
        ['pic'],
        ['1×1 图片', '唯一像素保持不变', 'N=1，位移模 1 为 0。'],
      ),
      section(
        '像素与文件',
        [
          'PNG 保存重排后的像素；JPEG 是有损编码，重复处理会累积失真。图片缩放、颜色空间转换、透明像素处理也可能改变输入像素。原文件的 EXIF、ICC、动画及压缩结构不会随 Canvas 像素重排保留。',
        ],
        ['pic'],
      ),
    ],
  ],
  [
    'visual-crypto',
    '二取二视觉密码',
    'image',
    '将黑白图片拆成两份随机透明分片，叠合时以黑色覆盖率差异显现秘密。',
    [
      {
        id: 'paper',
        title: 'Visual Cryptography',
        url: 'https://www.wisdom.weizmann.ac.il/~naor/PAPERS/vis.pdf',
        locator: '二取二秘密分享的子像素构造',
        publisher: 'Moni Naor、Adi Shamir',
        language: 'en',
        kind: 'author-spec',
      },
    ],
    [
      section(
        '随机分片',
        [
          '每个秘密像素扩为 2×2 子像素。从六种恰含两个黑点的排列中均匀随机选择。白像素对应两份相同排列，黑像素对应两份互补排列。',
          '单份分片中每个块都有两个黑点，不揭示秘密像素的黑白值。叠合后白区域黑色覆盖一半，黑区域全部覆盖，因此恢复图有灰色背景。',
        ],
        ['paper'],
        [
          '白像素：A=1100，B=1100；黑像素：A=1100，B=0011',
          '叠合分别为 1100 和 1111',
          '以黑点覆盖执行逻辑 OR，黑色覆盖率分别为 50% 与 100%。',
        ],
      ),
      section(
        '输入与几何',
        [
          '文字先栅格化，图片按阈值化为黑白；颜色与灰阶不保留。每份分片尺寸是原图宽高的两倍，再乘以子像素尺寸。保持透明 PNG 与整数像素对齐可避免缩放插值破坏点阵。',
        ],
        ['paper'],
      ),
    ],
  ],
  [
    'text-steganography',
    '零宽文本隐写与水印',
    'encoding',
    '在可见文本间插入不可见字符；StegCloak 与郭飞水印采用不同的载荷格式。',
    [
      source('steg', 'KuroLabs/stegcloak', 'stegcloak.js、components/、README.md'),
      source('wm', 'guofei9987/hidden_watermark', 'src/text_wm.rs'),
      source('crypt', 'guofei9987/CryptTool', 'rust/crypt_tool/src/'),
    ],
    [
      section(
        'StegCloak',
        [
          '原实现对秘密文本压缩，按参数加密并附加 HMAC，再转为零宽字符藏入以空格分隔的掩护文本。提取必须保留完整零宽字符和原密码。HMAC 可在加密开启时选择，关闭加密也会关闭 HMAC；解码时从密文头读取实际格式。未启用 HMAC 的结果不提供该格式的完整性保护。',
        ],
        ['steg'],
      ),
      section(
        '郭飞格式',
        [
          '密码的 UTF-8 字节按 seed=31×seed+byte 累积为 32 位种子。LCG 每步为 (1664525×state+1013904223) mod 2³¹，低 8 位与秘密 UTF-8 字节异或。结果按高位到低位转为两个字符，默认 0 为 U+2060、1 为 U+FEFF。',
          '提取读取第一个连续的水印字符段。插入位置按 Unicode 字符计数；末尾和随机插入也是同一载荷。移除会删除所选两种字符。此格式没有认证标签，不是现代安全加密，错误密码可能解出仍合法的乱码。',
        ],
        ['wm', 'crypt'],
        [
          '密码为空，秘密为 ASCII A',
          '异或字节为 1E，位序 00011110',
          '首个 LCG 输出低字节为 5F，41 XOR 5F = 1E。',
        ],
      ),
      section(
        '文本传递',
        [
          '聊天平台的清理、Unicode 规范化和手动复制可能改变不可见字符。不同隐写格式不能混用；普通文本、秘密文本和结果各自保留，只有显式“作为输入”才替换输入。',
        ],
        ['steg', 'wm'],
      ),
    ],
  ],
  [
    'beast-codec',
    '兽音编码',
    'encoding',
    '用四个字符表示十六进制半字节，再随位置轮换编码值。',
    [source('beast', 'ntnyq/beast-codec', 'src/core.ts、src/utils.ts')],
    [
      section(
        '编码单位',
        [
          '原实现以 UTF-16 码元为单位，将每个码元分成四个半字节。每个半字节按位置偏移后用两个四进制字符表示，所以每个 UTF-16 码元对应八个兽音字符。补充平面字符占两个码元，对应十六个兽音字符。',
          '四字符字典的顺序有意义。可选首尾标记允许携带格式标识；解码支持裸编码和带标记编码，非法字符或不完整长度会报错。该变换不提供保密性。',
        ],
        ['beast'],
        ['空文本，不加首尾标记', '空文本', '没有 UTF-16 码元，不产生编码字符。'],
      ),
    ],
  ],
  [
    'buddha-codec',
    '佛又曰 V2',
    'encoding',
    '将 CryptoJS AES 口令密文转为佛经风格字符，兼容 Takuron 的固定 V2 格式。',
    [
      source('buddha', 'takuron/talk-with-buddha', 'js/main.js:81–225'),
      source('aes', 'brix/crypto-js', 'src/aes.js、src/cipher-core.js'),
    ],
    [
      section(
        '口令与字符替换',
        [
          'CryptoJS 的口令接口生成带随机盐的 AES 密文，原页面省略 Base64 固定前十字符 U2FsdGVkX1，再逐字符替换为佛语表。解码执行逆替换、补回前缀并用原口令解密。',
          '前缀为“佛又曰：”，默认口令为 takuron.top。随机盐使相同输入通常产生不同密文。此格式没有认证标签，不能把成功输出当作内容未遭篡改的证明。',
        ],
        ['buddha', 'aes'],
        ['明文 迷雾，使用默认口令', '解密后为 迷雾', '编码密文随随机盐变化，往返时使用同一口令。'],
      ),
      section(
        '版本边界',
        [
          '与佛论禅存在多种不兼容版本。本页保留 Takuron V2 的映射与 AES 口令格式，不将其他佛语格式误认为可兼容输入。',
        ],
        ['buddha'],
      ),
    ],
  ],
  [
    'spectral-images',
    '图片与声音互转',
    'audio',
    '图片既可作为加法合成的目标声谱，也可保存真实音频的短时傅里叶信息。',
    [
      source('trace', 'j-about/SpectroTrace', 'app/lib/audio/generateFromImage.ts'),
      source('spectrum', 'HK-SHAO/atools', 'app/lib/spectrum.ts、image.ts、audit.ts；moon/'),
    ],
    [
      section(
        'SpectroTrace 加法合成',
        [
          '横轴对应时间，纵轴对应频率，像素亮度对应振幅。各频率的正弦波叠加得到波形，可写为 y(t)=Σ Aₖ(t)sin(2πfₖt+φₖ)。线性或对数频率映射决定纵坐标与频率关系，亮度曲线、反相与平滑改变幅度包络。',
          '基础模式使用 8 秒、50–16000 Hz、44100 Hz 采样率、对数频率、线性亮度、15% 平滑。高级模式提供原引擎全部参数；最高频率须不超过采样率一半。图像转为灰阶，原引擎会对大图进行子采样。',
        ],
        ['trace'],
        ['纯黑图片，关闭反相', '静音波形', '所有频率的亮度与振幅均为零。'],
      ),
      section(
        'Spectrum 编解码',
        [
          '音频先混合为单声道。FFT 窗长可选 256、512、1024、2048、4096，帧移为窗长的四分之一。Compact 保存量化幅度；Exact 同时保存相位信息。位深选择 2、4、8 位，可设置重采样、频带与截取时间。',
          'PNG 携带恢复所需元数据，下载文件名也保留参数。普通图片或破坏元数据的图片按上游推断规则读取，不保证还原原音频。没有完整相位时用迭代方式估计；精修增加计算成本。Exact 仍有量化误差，不是无损音频封装。',
        ],
        ['spectrum'],
      ),
      section(
        '输出与质量',
        [
          'WAV 采用单声道 PCM 输出。结果展示波形和完整频带与选定频带的声谱，播放控件可定位。原图、JPEG 有损版和缩小版的恢复质量分别计算信噪比、相关性和对数谱距离；差值可用于观察图片变换造成的信息损失。',
          '超过容量时可降低采样率或主动截取时间，本站不静默缩短音频。浏览器与本地解码器支持范围以实际解码为准，失败文件不能被当作成功声音输出。',
        ],
        ['spectrum'],
      ),
    ],
  ],
  [
    'file-image',
    '文件的 RGB 图片封装',
    'files',
    '用图片 RGB 通道保存文件长度与原始字节，以 PNG 无损传递。',
    [source('hide', 'guofei9987/HideInfo', 'hide_info/hide_as_img.py')],
    [
      section(
        '长度与像素',
        [
          '先写入四字节大端无符号长度，再依次写入原始字节。每三个字节组成一个 RGB 像素，边长为 ceil(√((长度+4)/3))，多余通道填零。恢复按长度读取，不删除文件末尾本来存在的零字节。',
          '文件名和 MIME 不在原格式中，恢复时需自行命名。此封装不加密，也不包含校验和；长度超过容量可以被拒绝，但一般像素位翻转未必能检测。',
        ],
        ['hide'],
        [
          '原始字节 41 00',
          '前四字节 00 00 00 02，随后 41 00；恢复仍为 41 00',
          '长度为 2，末尾零是文件内容而非填充。',
        ],
      ),
      section(
        '图像变换的影响',
        [
          '必须保持 RGB 字节不变。JPEG、调色、缩放、截图及丢失原始色值都会损坏文件。PNG 输出保存不透明像素；透明或长度不合法的图片被拒绝。',
        ],
        ['hide'],
      ),
    ],
  ],
  [
    'screen-drop',
    '二维码分块传文件',
    'files',
    '将文件拆成连续二维码，接收端按序号收集并核对完整摘要。',
    [source('screen', 'guofei9987/ScreenDrop', 'protocol.js、sender.js、receiver.js')],
    [
      section(
        'GF 传输格式',
        [
          '文件头包含 UTF-8 文件名长度、文件名、四字节文件大小和 32 字节 SHA-256，随后为全部文件字节。分块前缀 GF，附两字节块序号、总块数和 CRC16。编号从零开始，界面向用户显示从一开始的帧号。',
          '每个分块固定容量，末尾填零。CRC 检查帧内容，最终 SHA-256 对照文件头验证完整文件。重复帧可以忽略，乱序帧按序号组装；缺帧必须补齐。',
        ],
        ['screen'],
        [
          '总共 3 帧，收到第 3、1、1 帧',
          '收到 2/3 帧，缺少第 2 帧',
          '重复帧不增加已接收数量，乱序不改变文件顺序。',
        ],
      ),
      section(
        '接收与补传',
        [
          '发送端可控制间隔、循环、暂停、单步、跳转及仅传指定帧。接收端使用摄像头或二维码图片，列出缺帧编号并在完整校验后交付文件。暂停摄像头保留本页接收进度，离页释放设备。',
          '协议没有独立的传输 ID 和加密。不同文件有相同分块数时不能靠序号区分，最终摘要校验失败需重新接收。UTF-8 文件名最多 255 字节；超过上限应改名，不能按字符数静默截断中文名称。',
        ],
        ['screen'],
      ),
    ],
  ],
];
export const articles = data.map(([id, title, topicGroup, summary, sources, sections]) => ({
  id: 'function-native:' + id,
  capabilityIds: ['native:' + id],
  relatedIds: ['native:' + id],
  topicGroup,
  title,
  aliases: [],
  summary,
  sources,
  sections,
  misconceptions: [],
}));
