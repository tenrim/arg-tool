// Function-specific lessons with primary references and unaltered pinned source mirrors.
export const articles = [
  {
    id: 'function-op:TCP%2FIP%20Checksum',
    capabilityIds: ['op:TCP%2FIP%20Checksum'],
    relatedIds: ['op:TCP%2FIP%20Checksum'],
    topicGroup: 'file-compression',
    title: 'TCP/IP 校验和',
    summary: 'Internet 校验和将数据按 16 位字累加，把高位进位回卷加到低 16 位，最后按位取反。',
    aliases: ['Internet checksum', '反码和'],
    sources: [
      {
        id: 'rfc1071',
        title: 'RFC 1071：Internet 校验和',
        publisher: 'RFC Editor · 南京大学开源镜像',
        url: 'https://mirrors.nju.edu.cn/rfc/rfc1071.html',
        language: 'en',
        kind: 'standard',
        locator: '算法与格式定义',
      },
      {
        id: 'implementation',
        title: '本工具输入、参数与输出定义',
        publisher: '迷雾工具箱 · CyberChef 官方上游',
        url: '/vendor/cyberchef/catalogue.json',
        language: 'en',
        kind: 'implementation',
        locator: 'TCP/IP Checksum',
      },
      {
        id: 'engine',
        title: '随站官方引擎实现',
        publisher: 'CyberChef 官方上游',
        url: '/vendor/cyberchef/modules/Crypto.js',
        language: 'en',
        kind: 'implementation',
        locator: 'TCP/IP Checksum',
      },
    ],
    sections: [
      {
        title: '十六位反码和与进位回卷',
        paragraphs: [
          'Internet 校验和将数据按 16 位字累加，把高位进位回卷加到低 16 位，最后按位取反。',
          '奇数长度时计算用零补齐；TCP/UDP 的实际校验还包括伪首部，因此对裸载荷计算不能代替完整包校验。',
        ],
        sourceIds: ['rfc1071', 'implementation', 'engine'],
      },
      {
        title: '读法、例子与边界',
        paragraphs: [
          '此入口计算输入字节的校验；若要验证传输层字段，须提供正确头、载荷和伪首部布局。',
        ],
        sourceIds: ['rfc1071', 'implementation', 'engine'],
        examples: [
          {
            input: '网络字节 00 01 00 02',
            output: 'FFFC',
            explanation: '16 位和为 0003，按位取反为 FFFC。',
            label: '按规则推演',
          },
        ],
      },
    ],
    misconceptions: [],
  },
  {
    id: 'function-op:YARA%20Rules',
    capabilityIds: ['op:YARA%20Rules'],
    relatedIds: ['op:YARA%20Rules'],
    topicGroup: 'files',
    title: 'YARA 规则扫描',
    summary:
      'YARA 规则先声明文本、十六进制或正则模式，再用 condition 描述怎样的命中组合算符合规则。',
    aliases: ['YARA', '规则扫描'],
    sources: [
      {
        id: 'yara',
        title: 'Writing YARA rules',
        publisher: 'YARA 项目',
        url: 'https://yara.readthedocs.io/en/stable/writingrules.html',
        language: 'en',
        kind: 'author-spec',
        locator: 'strings、condition、十六进制模式',
      },
      {
        id: 'implementation',
        title: '本工具输入、参数与输出定义',
        publisher: '迷雾工具箱 · CyberChef 官方上游',
        url: '/vendor/cyberchef/catalogue.json',
        language: 'en',
        kind: 'implementation',
        locator: 'YARA Rules',
      },
      {
        id: 'engine',
        title: '随站官方引擎实现',
        publisher: 'CyberChef 官方上游',
        url: '/vendor/cyberchef/modules/Yara.js',
        language: 'en',
        kind: 'implementation',
        locator: 'YARA Rules',
      },
    ],
    sections: [
      {
        title: '字符串模式与条件怎样配合',
        paragraphs: [
          'YARA 规则先声明文本、十六进制或正则模式，再用 condition 描述怎样的命中组合算符合规则。',
          '字符串名称如 $a 是条件中的布尔值；十六进制模式可用 ?? 表示未知字节，用 [n-m] 表示长度范围。',
        ],
        sourceIds: ['yara', 'implementation', 'engine'],
      },
      {
        title: '读法、例子与边界',
        paragraphs: [
          '命中是满足规则，不等于证明文件恶意；规则质量和误命中范围需要结合上下文检查。',
        ],
        sourceIds: ['yara', 'implementation', 'engine'],
        examples: [
          {
            input: 'rule clue { strings: $a = "ARG" condition: $a }\n文件内容：xxARGyy',
            output: '规则 clue 命中',
            explanation: '模式 ARG 出现一次即使 $a 为真，condition 因而满足。',
            label: '按规则推演',
          },
        ],
      },
    ],
    misconceptions: [],
  },
];
