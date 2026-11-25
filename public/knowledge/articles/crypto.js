// Function-specific lessons with primary references and unaltered pinned source mirrors.
export const articles = [
  {
    id: 'function-op:ROR13',
    capabilityIds: ['op:ROR13'],
    relatedIds: ['op:ROR13'],
    topicGroup: 'modern',
    title: 'ROR13',
    summary: '每读一个字节，先右循环移位 13 位再累加该字节。',
    aliases: ['ROR13', '32 位旋转累加哈希'],
    sources: [
      {
        id: 'ror13-source',
        title: 'CyberChef 11.5.0 固定源码 — ROR13',
        publisher: 'GCHQ CyberChef / fufu_btw',
        url: '/vendor/knowledge/cyberchef/src/core/operations/ROR13.mjs',
        language: 'en',
        kind: 'implementation',
        locator: 'run(): ror(hash,13)+byte',
        upstreamUrl:
          'https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/ROR13.mjs',
        license: 'Apache-2.0',
        licenseUrl: '/vendor/knowledge/LICENSE.txt',
        mirroredCommit: '8cd426dd4f40f1423912d5fad91b578a86a65112',
      },
      {
        id: 'engine',
        title: 'CyberChef 随站附带的操作说明与参数',
        publisher: 'GCHQ CyberChef（Apache-2.0）',
        url: '/vendor/cyberchef/catalogue.json',
        language: 'en',
        kind: 'implementation',
        locator: 'ROR13',
      },
    ],
    sections: [
      {
        title: '机制与规则',
        paragraphs: [
          '本站 ROR13 从 h=0 开始，对每个输入字节 b 计算 h=(ROR32(h,13)+b) mod 2³²，最终输出补足八位的十六进制值。常用于 API 名称标识。',
        ],
        sourceIds: ['ror13-source', 'engine'],
        examples: [
          {
            label: '规则推演',
            input: 'ASCII A（Hex 41）',
            output: '0x00000041',
            explanation: '初值为 0，旋转后仍为 0；加 65 得 0x41，再补足八位。',
          },
        ],
      },
      {
        title: '参数与识读边界',
        paragraphs: [
          '此操作没有步长参数，使用固定 13 位旋转和 32 位无符号累计。输入是字节序列；大小写和字符编码会改变结果。',
          '它是许多输入映射到 32 位值的哈希，不能解码回原名称，也不是 ROT13 字母变换。',
        ],
        sourceIds: ['engine', 'ror13-source'],
        examples: [],
      },
    ],
    misconceptions: [],
  },
  {
    id: 'function-pair:AES%20Key%20Wrap',
    capabilityIds: ['pair:AES%20Key%20Wrap'],
    relatedIds: ['pair:AES%20Key%20Wrap'],
    topicGroup: 'modern',
    title: 'AES 密钥封装',
    summary: '以 AES 和固定完整性初值包装 64 位密钥片段。',
    aliases: ['AES Key Wrap', 'AES Key Unwrap', '封装密钥与完整性寄存器'],
    sources: [
      {
        id: 'r3394',
        title: 'RFC 3394 — Advanced Encryption Standard (AES) Key Wrap Algorithm',
        publisher: 'RFC Editor / IETF（南京大学镜像）',
        url: 'https://mirrors.nju.edu.cn/rfc/rfc3394.html',
        language: 'en',
        kind: 'standard',
        locator: '§2.2–2.3 / §4',
      },
      {
        id: 'engine',
        title: 'CyberChef 随站附带的操作说明与参数',
        publisher: 'GCHQ CyberChef（Apache-2.0）',
        url: '/vendor/cyberchef/catalogue.json',
        language: 'en',
        kind: 'implementation',
        locator: 'AES Key Wrap / AES Key Unwrap',
      },
    ],
    sections: [
      {
        title: '机制与规则',
        paragraphs: [
          'RFC 3394 把待封装密钥分为 64 位片段，以 A 寄存器和各片段反复调用 AES，混入迭代计数。解封装按逆序还原，并检查 A 是否等于约定完整性初值。',
        ],
        sourceIds: ['r3394', 'engine'],
        examples: [
          {
            label: '规则推演',
            input: '16 字节待封装密钥',
            output: '标准 RFC 3394 封装为 24 字节',
            explanation: '两个 64 位片段加一个 64 位 A 寄存器，净增加 8 字节。',
          },
        ],
      },
      {
        title: '参数与识读边界',
        paragraphs: [
          'Key(KEK) 是用于保护另一把密钥的封装密钥；默认 IV 为 A6 重复八次，不是 AES-CBC 的 16 字节 IV。',
          '普通 RFC 3394 对输入长度有整 64 位片段要求；失败的完整性检查不能通过删除头部来绕开。',
        ],
        sourceIds: ['engine', 'r3394'],
        examples: [],
      },
    ],
    misconceptions: [],
  },
  {
    id: 'function-pair:GOST%20Key%20Wrap',
    capabilityIds: ['pair:GOST%20Key%20Wrap'],
    relatedIds: ['pair:GOST%20Key%20Wrap'],
    topicGroup: 'modern',
    title: 'GOST 密钥封装',
    summary: '用封装密钥和 UKM 保护另一把密钥。',
    aliases: ['GOST Key Wrap', 'GOST Key Unwrap', '加密待封装密钥并校验 MAC'],
    sources: [
      {
        id: 'r4357',
        title: 'RFC 4357 — Additional Cryptographic Algorithms for Use with GOST Algorithms',
        publisher: 'RFC Editor / IETF（南京大学镜像）',
        url: 'https://mirrors.nju.edu.cn/rfc/rfc4357.html',
        language: 'en',
        kind: 'standard',
        locator: '§2 / §6',
      },
      {
        id: 'engine',
        title: 'CyberChef 随站附带的操作说明与参数',
        publisher: 'GCHQ CyberChef（Apache-2.0）',
        url: '/vendor/cyberchef/catalogue.json',
        language: 'en',
        kind: 'implementation',
        locator: 'GOST Key Wrap / GOST Key Unwrap',
      },
    ],
    sections: [
      {
        title: '机制与规则',
        paragraphs: [
          'GOST 的密钥封装组合密钥加密和 MAC 完整性保护；CryptoPro 方案还用 UKM 作 KEK diversification，使实际封装密钥依 UKM 变化。',
          'RFC 4357 的协议封装包含 8 字节 UKM、32 字节加密 CEK 和 4 字节 MAC，共 44 字节；本站 1989 NO/CP 封装函数实际返回 CEK_ENC 与 MAC 共 36 字节，UKM 另由参数保存，不能把 44 字节直接当本站函数输出长度。',
        ],
        sourceIds: ['r4357', 'engine'],
        examples: [
          {
            label: '协议字段与本站返回值',
            input: '1989 NO/CP；32 字节 CEK；另设 8 字节 UKM',
            output:
              '本站返回：32 字节 CEK_ENC + 4 字节 MAC = 36 字节\n协议另带 UKM 时：8 + 32 + 4 = 44 字节',
            explanation:
              '两个长度对应不同边界：函数返回不含 UKM。解封装必须保留原 UKM 参数；不要按44字节截取函数返回。',
          },
        ],
      },
      {
        title: '参数与识读边界',
        paragraphs: [
          'Key 是封装密钥，User Key Material 是 UKM；Key wrapping 可选 NO/CP/SC，各端必须使用相同变体及算法。',
          'UKM 不是待封装密钥，也不是代替 KEK 的口令；解封装需要正确校验 MAC，不能只做分组解密。',
        ],
        sourceIds: ['engine', 'r4357'],
        examples: [],
      },
    ],
    misconceptions: [],
  },
  {
    id: 'function-op:ECDSA%20Signature%20Conversion',
    capabilityIds: ['op:ECDSA%20Signature%20Conversion'],
    relatedIds: ['op:ECDSA%20Signature%20Conversion'],
    topicGroup: 'authentication',
    title: '转换 ECDSA 签名格式',
    summary: '同一对 r、s 可写成 ASN.1 DER 或固定长度拼接。',
    aliases: ['ECDSA Signature Conversion', 'r/s 整数的不同容器'],
    sources: [
      {
        id: 'r7515',
        title: 'RFC 7515 — JSON Web Signature (JWS)',
        publisher: 'RFC Editor / IETF（南京大学镜像）',
        url: 'https://mirrors.nju.edu.cn/rfc/rfc7515.html',
        language: 'en',
        kind: 'standard',
        locator: '§3 / Appendix A.3',
      },
      {
        id: 'asn1',
        title: 'X.690: ASN.1 encoding rules',
        publisher: '国际电信联盟 ITU-T',
        url: 'https://www.itu.int/rec/T-REC-X.690',
        language: 'en',
        kind: 'standard',
        locator: 'BER / CER / DER / Object Identifier',
      },
      {
        id: 'engine',
        title: 'CyberChef 随站附带的操作说明与参数',
        publisher: 'GCHQ CyberChef（Apache-2.0）',
        url: '/vendor/cyberchef/catalogue.json',
        language: 'en',
        kind: 'implementation',
        locator: 'ECDSA Signature Conversion',
      },
    ],
    sections: [
      {
        title: '机制与规则',
        paragraphs: [
          'ECDSA 数学签名是一对整数 (r,s)。DER 用 SEQUENCE 包两个 INTEGER，正整数高位为 1 时须添 00；P1363 与 JWS 使用约定长度的 r||s 字节，不带 DER 标签。',
        ],
        sourceIds: ['r7515', 'asn1', 'engine'],
        examples: [
          {
            label: '规则推演',
            input: 'r=128，s=1，只演示 DER 数字编码',
            output: '30 07 02 02 00 80 02 01 01',
            explanation:
              'r 的 80 最高位为 1，要补 00；SEQUENCE 的内容共 7 字节。这不是一条实际消息的有效签名。',
          },
        ],
      },
      {
        title: '参数与识读边界',
        paragraphs: [
          'Input Format/Output Format 选择 ASN.1 HEX、P1363 HEX、JWS 或 JSON；曲线字长影响固定拼接长度，要保留必要前导零。',
          '格式转换不验证签名的数学正确性，也不会替换摘要算法；删掉整数前导零时要区分数值和容器规则。',
        ],
        sourceIds: ['engine', 'r7515', 'asn1'],
        examples: [],
      },
    ],
    misconceptions: [],
  },
];
