// Discovery scope, not an engine allowlist. Every operation below keeps its
// original CyberChef ID, arguments and executable recipe implementation.
// These developer/calculator primitives belong to the complete recipe workspace
// rather than a standalone ARG tool, search result or individual lesson.
const group = (id, title, reason, operations) => Object.freeze({
  id, title, reason, operations: Object.freeze(operations)
});

export const CHAIN_ONLY_OPERATION_GROUPS = Object.freeze([
  group('qalculate-units','旧独立单位换算','通用单位换算统一由完整 Qalculate 内核承接；原操作仍完整保留在 CyberChef 配方中。',[
    'Convert distance','Convert area','Convert mass','Convert speed','Convert data units'
  ]),
  group('calculator-arithmetic', '通用计算器运算',
    '普通四则与描述统计没有独立 ARG 工作区的必要；需要把它们用于数据处理时，在完整配方中组合。', [
      'Sum', 'Subtract', 'Multiply', 'Divide', 'Mean', 'Median', 'Standard Deviation'
    ]),
  group('calculator-bitwise', '位逻辑与字节算术原语',
    '位与、位或、取反、移位、循环移位和按字节加减是底层配方步骤；常用的 XOR 与 XOR Brute Force 解谜功能不在此清单。', [
      'ADD', 'SUB', 'AND', 'OR', 'NOT', 'MOD', 'Bit shift left', 'Bit shift right',
      'Rotate left', 'Rotate right'
    ]),
  group('calculator-number-theory', '底层数论计算',
    '扩展最大公因数、模幂与模逆由专业数学工具或配方负责，不作为独立玩家入口；真实密码算法与整数因数验证仍保留。', [
      'Extended GCD', 'Modular Exponentiation', 'Modular Inverse'
    ]),
  group('calculator-sets', '集合运算原语',
    '集合代数和笛卡尔积属于组合数据的中间步骤，不能因上游每个操作都有名称而展开成多个玩家工具。', [
      'Cartesian Product', 'Power Set', 'Set Difference', 'Set Intersection',
      'Set Union', 'Symmetric Difference'
    ]),
  group('network-fingerprints', 'SSH 与 TLS 流量指纹',
    '这些指纹需要握手报文，主要服务流量识别与安全分析；在完整配方中保留，公开工具目录不提供独立入口。', [
      'HASSH Client Fingerprint', 'HASSH Server Fingerprint', 'JA3 Fingerprint',
      'JA3S Fingerprint', 'JA4 Fingerprint', 'JA4Server Fingerprint'
    ]),
  group('network-packet-primitives', '报文与网络运维原语',
    '以太网和传输层报文、头部剥离、子网分组及校验服务协议分析；网址解析、IP 表示转换和用户主动的 HTTP／DNS 查询另行保留。', [
      'Parse Ethernet frame', 'Parse IPv4 header', 'Parse TCP', 'Parse TLS record',
      'Parse UDP', 'Strip IPv4 header', 'Strip TCP header', 'Strip UDP header',
      'Group IP addresses', 'Format MAC addresses', 'Parse IP range',
      'IPv6 Transition Addresses', 'Dechunk HTTP response', 'Strip HTTP headers',
      'TCP/IP Checksum'
    ]),
  group('security-indicators', '安全情报链接处理',
    '危险指标的去武器化和恢复属于安全情报流转流程，保留为配方步骤，不与普通网址线索处理并列。', [
      'Defang IP Addresses', 'Defang URL', 'Fang URL'
    ]),
  group('developer-authoring', '开发编写与格式压缩',
    '代码压缩、开发命名转换、模板渲染、语法着色和穷举大小写主要用于编写或生成数据；用于阅读线索的格式化、查询与解码功能仍保留。', [
      'CSS Minify', 'JavaScript Minify', 'JSON Minify', 'SQL Minify', 'XML Minify',
      'To Camel case', 'To Kebab case', 'To Snake case', 'Template',
      'Syntax highlighter', 'To Case Insensitive Regex', 'From Case Insensitive Regex',
      'Get All Casings', 'Expand alphabet range'
    ]),
  group('data-generators', '配方数据生成器',
    '随机浮点／整数／大素数、UUID、遍历按键序列、占位文字及当前时间生成并不分析现有线索；需要时仍能作为配方的数据来源。', [
      'Pseudo-Random Number Generator', 'Pseudo-Random Integer Generator',
      'Pseudo-Random Prime Generator', 'Generate UUID', 'Generate De Bruijn Sequence',
      'Generate Lorem Ipsum', 'Get Time'
    ]),
  group('cryptographic-plumbing', '密钥封装与签名格式原语',
    '密钥封装和 ECDSA 签名容器转换属于实现协议的底层步骤；不据算法冷门程度删减真实加解密、签名和密钥解析能力。', [
      'AES Key Wrap', 'AES Key Unwrap', 'GOST Key Wrap', 'GOST Key Unwrap',
      'ECDSA Signature Conversion'
    ]),
  group('malware-analysis', '恶意软件分析专用步骤',
    '自编 YARA 规则和 API 哈希主要服务样本分析，在完整配方保留；不影响文件类型、嵌入文件、字符串及真实反汇编工具。', [
      'YARA Rules', 'ROR13'
    ])
]);

export const CHAIN_ONLY_OPERATIONS = Object.freeze(
  CHAIN_ONLY_OPERATION_GROUPS.flatMap(({operations}) => operations)
);
