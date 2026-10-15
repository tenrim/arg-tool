// Function-specific lessons with primary references and unaltered pinned source mirrors.
export const articles = [
  {
    "id": "function-native:it-ports",
    "capabilityIds": [
      "native:it-ports"
    ],
    "relatedIds": [
      "native:it-ports"
    ],
    "topicGroup": "technical",
    "title": "端口与网络协议资料",
    "summary": "读懂 TCP/UDP 端口的三个范围，并区分端口号与 IP 首部协议号。",
    "aliases": [
      "TCP",
      "UDP",
      "端口",
      "协议号",
      "IANA"
    ],
    "sources": [
      {
        "id": "iana",
        "title": "Service Name and Transport Protocol Port Number Registry",
        "publisher": "IANA",
        "url": "https://www.iana.org/assignments/service-names-port-numbers",
        "language": "en",
        "kind": "standard",
        "locator": "Note：三个端口范围与传输协议列"
      },
      {
        "id": "rfc",
        "title": "RFC 6335：服务名与端口号管理",
        "publisher": "IETF · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc6335.txt",
        "language": "en",
        "kind": "standard",
        "locator": "§6，端口号范围"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/it-reference/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      },
      {
        "id": "iana-protocols",
        "title": "Protocol Numbers",
        "publisher": "IANA",
        "url": "https://www.iana.org/assignments/protocol-numbers",
        "language": "en",
        "kind": "standard",
        "locator": "Decimal=6（TCP）、17（UDP）；不是端口登记表"
      }
    ],
    "sections": [
      {
        "title": "端口、传输协议和 IP 协议号怎样区分",
        "paragraphs": [
          "端口是在 TCP、UDP 等传输协议内区分服务的 16 位编号。0–1023 为系统端口，1024–49151 为用户端口，49152–65535 为动态或私有端口；查表时必须同时看端口和协议列。",
          "IP 首部的协议号标识下一层协议，例如 TCP 是 6、UDP 是 17；它不是服务器的端口。IANA 登记只给出约定用途，流量出现在某个端口并不能证明实际应用就是登记的服务。"
        ],
        "sourceIds": [
          "iana",
          "rfc",
          "iana-protocols"
        ],
        "examples": [
          {
            "label": "两层编号",
            "input": "TCP 服务使用端口 443",
            "output": "IP 协议号：6；TCP 目的端口：443",
            "explanation": "6 描述传输层协议，443 描述该协议下的服务端点，二者不可互换。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "搜索十进制端口、服务名或协议缩写，逐项核对传输协议、用途和原始登记来源；数字范围记录也可能命中查询。",
          "这是固定登记资料查询，不会对输入的主机进行端口扫描，也不会证明某个端口目前开放。"
        ],
        "sourceIds": [
          "iana",
          "rfc",
          "implementation",
          "iana-protocols"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "这是固定登记资料查询，不会对输入的主机进行端口扫描，也不会证明某个端口目前开放。"
    ]
  },
  {
    "id": "function-native:it-http",
    "capabilityIds": [
      "native:it-http"
    ],
    "relatedIds": [
      "native:it-http"
    ],
    "topicGroup": "technical",
    "title": "HTTP 状态与字段资料",
    "summary": "按响应类别解释状态码，用字段名与字段值读取 HTTP 元数据。",
    "aliases": [
      "HTTP",
      "404",
      "200",
      "Content-Type",
      "Location",
      "标头"
    ],
    "sources": [
      {
        "id": "status",
        "title": "HTTP 响应状态码",
        "publisher": "MDN 官方中文文档",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "五类响应状态码"
      },
      {
        "id": "fields",
        "title": "HTTP 标头",
        "publisher": "MDN 官方中文文档",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "请求、响应与表示标头"
      },
      {
        "id": "rfc",
        "title": "RFC 9110：HTTP Semantics",
        "publisher": "IETF · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9110.html",
        "language": "en",
        "kind": "standard",
        "locator": "§5 字段；§15 状态码"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/it-reference/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "状态码与标头如何组成一次 HTTP 消息",
        "paragraphs": [
          "HTTP 状态码是三位十进制数，首位区分类别：1xx 信息、2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务端错误。200、301、404 各有独立语义，不能仅把它们当作成功或失败两个开关。",
          "标头使用字段名与字段值携带消息上下文，例如 Content-Type 描述内容类型，Location 可指出重定向目标。字段名不区分大小写；主体内容、状态码和标头是不同部分。"
        ],
        "sourceIds": [
          "status",
          "fields",
          "rfc"
        ],
        "examples": [
          {
            "label": "读取响应",
            "input": "HTTP/1.1 302 Found\nLocation: /next",
            "output": "临时重定向；目标是 /next",
            "explanation": "302 的具体行为需连同 Location 和请求方法解释，不能凭字段出现就断言永久跳转。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "先查状态码的类别和具体含义，再查关联字段；缓存、认证、范围响应等情况通常要把多个字段放在同一消息里看。",
          "本入口解释固定协议资料；不会请求目标网址，状态码也不是网站内容可信度评分。"
        ],
        "sourceIds": [
          "status",
          "fields",
          "rfc",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本入口解释固定协议资料；不会请求目标网址，状态码也不是网站内容可信度评分。"
    ]
  },
  {
    "id": "function-native:it-formats",
    "capabilityIds": [
      "native:it-formats"
    ],
    "relatedIds": [
      "native:it-formats"
    ],
    "topicGroup": "technical",
    "title": "MIME 与字符集资料",
    "summary": "分清类型/子类型与 charset 参数，避免把扩展名当作编码。",
    "aliases": [
      "MIME",
      "charset",
      "UTF-8",
      "application/json",
      "text/plain"
    ],
    "sources": [
      {
        "id": "mime",
        "title": "MIME 类型",
        "publisher": "MDN 官方中文文档",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/MIME_types",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "类型/子类型、参数与通用类型"
      },
      {
        "id": "iana",
        "title": "Character Sets",
        "publisher": "IANA",
        "url": "https://www.iana.org/assignments/character-sets/character-sets.xhtml",
        "language": "en",
        "kind": "standard",
        "locator": "字符集名称与别名登记"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/it-reference/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "媒体类型、字符集和文件扩展名怎样区分",
        "paragraphs": [
          "媒体类型写成 type/subtype，例如 image/png、text/plain、application/json；它说明数据的类别和格式。文件名的 .txt 或 .json 是命名约定，不能独立保证内部字节的格式。",
          "字符集规定文本字节怎样还原字符。Content-Type: text/plain; charset=utf-8 同时给出媒体类型和字符集；UTF-8 不是压缩方法，也不能把图片字节当文本去解码。"
        ],
        "sourceIds": [
          "mime",
          "iana"
        ],
        "examples": [
          {
            "label": "拆开一个字段",
            "input": "text/plain; charset=utf-8",
            "output": "类型 text；子类型 plain；字符集 UTF-8",
            "explanation": "类型回答内容是什么，字符集回答文本字节怎样读。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "可查扩展名、媒体类型、字符集名称及别名；遇到未知文件，应结合文件签名或内容检查，不能只看文件名。",
          "本站使用随站固定数据，媒体类型与扩展名可能是一对多关系；命中名称不等于文件内容已通过格式验证。"
        ],
        "sourceIds": [
          "mime",
          "iana",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站使用随站固定数据，媒体类型与扩展名可能是一对多关系；命中名称不等于文件内容已通过格式验证。"
    ]
  },
  {
    "id": "function-native:it-domains",
    "capabilityIds": [
      "native:it-domains"
    ],
    "relatedIds": [
      "native:it-domains"
    ],
    "topicGroup": "technical",
    "title": "域名与公共后缀资料",
    "summary": "依据公共后缀列表识别可注册域与子域。",
    "aliases": [
      "PSL",
      "eTLD+1",
      "公共后缀",
      "域名"
    ],
    "sources": [
      {
        "id": "psl",
        "title": "Learn more about the Public Suffix List",
        "publisher": "Public Suffix List 项目",
        "url": "https://publicsuffix.org/learn/",
        "language": "en",
        "kind": "official-doc",
        "locator": "公共后缀、可注册域与 Cookie 边界"
      },
      {
        "id": "list",
        "title": "随站公共后缀规则原表",
        "publisher": "Public Suffix List 项目",
        "url": "/vendor/it-reference/public_suffix_list.dat",
        "language": "en",
        "kind": "implementation",
        "locator": "ICANN / PRIVATE 段，通配符与例外规则"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/it-reference/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "公共后缀为什么不能只取最后一段",
        "paragraphs": [
          "公共后缀是用户通常不能直接控制、注册下一级名称的后缀，例如 com、co.uk。识别可注册域需要按列表匹配最长规则，不能固定截取最后两段。",
          "规则既有精确后缀，也有 *. 的通配规则和 ! 开头的例外；列表还区分 ICANN 与私人平台段。私人平台规则是否纳入，会改变某些托管域名的可注册边界。"
        ],
        "sourceIds": [
          "psl",
          "list"
        ],
        "examples": [
          {
            "label": "多段后缀",
            "input": "a.b.example.co.uk",
            "output": "公共后缀 co.uk；可注册域 example.co.uk；子域 a.b",
            "explanation": "co.uk 整体是后缀，所以最后两段 co.uk 并不是可注册域。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "输入域名或 HTTP(S) 网址，先检查规范化主机名，再阅读公共后缀、可注册域和命中规则；国际化域名会转换成 ASCII 主机名。",
          "解析按随站 PSL 快照进行；它不检查 DNS 是否存在、域名是否已经注册，也不能把私人平台划分当作所有权证明。"
        ],
        "sourceIds": [
          "psl",
          "list",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "解析按随站 PSL 快照进行；它不检查 DNS 是否存在、域名是否已经注册，也不能把私人平台划分当作所有权证明。"
    ]
  },
  {
    "id": "function-native:it-instructions",
    "capabilityIds": [
      "native:it-instructions"
    ],
    "relatedIds": [
      "native:it-instructions"
    ],
    "topicGroup": "technical",
    "title": "指令、寄存器与标志位",
    "summary": "按 Intel 语法分清目的与源操作数，理解位宽和条件标志。",
    "aliases": [
      "x86",
      "x86-64",
      "MOV",
      "EAX",
      "ZF",
      "CF",
      "汇编"
    ],
    "sources": [
      {
        "id": "intel",
        "title": "Intel 64 and IA-32 Software Developer’s Manual",
        "publisher": "Intel 官方手册",
        "url": "https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "Volume 1 寄存器和 EFLAGS；Volume 2 指令定义"
      },
      {
        "id": "local",
        "title": "本站基础指令、寄存器与标志资料",
        "publisher": "迷雾工具箱 · 随站资料",
        "url": "/vendor/it-reference/instructions.json",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "记录采用 Intel 语法；按每条指令单独标明语义"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/it-reference/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "x86 指令、寄存器与标志位怎样阅读",
        "paragraphs": [
          "Intel 语法通常把目的操作数放在前面：mov eax, 65 把十进制 65 写入 EAX；mov 是复制值，而非把源位置清空。EAX 是 32 位寄存器，RAX 是相关的 64 位寄存器。",
          "算术标志记录运算条件，例如 ZF 表示结果为零，CF 与无符号进位或借位有关，OF 与有符号溢出有关。不同指令更新的标志不一样，不能把 INC 与 ADD 的全部标志行为视为相同。"
        ],
        "sourceIds": [
          "intel",
          "local"
        ],
        "examples": [
          {
            "label": "数值写法和操作数顺序",
            "input": "mov eax, 65",
            "output": "EAX 的值为 65，即 0x41",
            "explanation": "65 和 0x41 是同一数值的十进制与十六进制表示；转成 ASCII 才是字母 A。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "查到指令后核对语法、位宽和受影响的标志；再结合反汇编里的操作数确认它是在读内存还是计算地址。",
          "本资料入口只覆盖收录的基础 x86/x86-64 条目，不是 CPU 仿真器；具体编码、模式及扩展指令以厂商手册为准。"
        ],
        "sourceIds": [
          "intel",
          "local",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本资料入口只覆盖收录的基础 x86/x86-64 条目，不是 CPU 仿真器；具体编码、模式及扩展指令以厂商手册为准。"
    ]
  },
  {
    "id": "function-native:it-rfc",
    "capabilityIds": [
      "native:it-rfc"
    ],
    "relatedIds": [
      "native:it-rfc"
    ],
    "topicGroup": "technical",
    "title": "RFC 标准索引",
    "summary": "沿 Updates、Obsoletes 和文档类别判断规范关系。",
    "aliases": [
      "RFC",
      "IETF",
      "Obsoletes",
      "Updates",
      "标准"
    ],
    "sources": [
      {
        "id": "search",
        "title": "RFC Editor 文档检索",
        "publisher": "RFC Editor",
        "url": "https://www.rfc-editor.org/search/",
        "language": "en",
        "kind": "official-doc",
        "locator": "编号、标题和状态检索"
      },
      {
        "id": "process",
        "title": "RFC 2026：The Internet Standards Process",
        "publisher": "IETF · 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc2026.html",
        "language": "en",
        "kind": "standard",
        "locator": "§4 Standards Track；§5 非标准轨道"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/it-reference/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "RFC 编号、状态与替代关系怎样阅读",
        "paragraphs": [
          "RFC 是有连续编号的文档系列；编号是文档身份，并不表示内容越大越新就一定替代所有旧规则。RFC 可以属于标准轨道，也可以是信息性、实验性等文档，不是每一篇都是互联网标准。",
          "Obsoletes 表示新文档替代旧文档，Updates 表示对既有内容作补充或修改。判断某项协议当前规定时，应同时读文档状态、勘误和这些引用关系。"
        ],
        "sourceIds": [
          "search",
          "process"
        ],
        "examples": [
          {
            "label": "追踪规范变化",
            "input": "RFC 9110 的首页列出 Obsoletes: 7231",
            "output": "理解 HTTP 语义时核对 RFC 9110 与相关后续更新",
            "explanation": "替代关系来自文档首页和状态信息，不靠编号大小自行猜测。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "通过编号或标题检索，沿关联编号阅读对应文档；本站保存的是索引元数据，规范全文使用旁边的原始来源或高校镜像。",
          "随站索引有版本时点；查询命中并不保证该条文是最新有效标准，需查看 RFC Editor 的当前状态。"
        ],
        "sourceIds": [
          "search",
          "process",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "随站索引有版本时点；查询命中并不保证该条文是最新有效标准，需查看 RFC Editor 的当前状态。"
    ]
  },
  {
    "id": "function-native:countries",
    "capabilityIds": [
      "native:countries"
    ],
    "relatedIds": [
      "native:countries"
    ],
    "topicGroup": "world",
    "title": "国家地区与国旗",
    "summary": "用二字母代码定位地区，再交叉核对国旗、语言、电话和货币。",
    "aliases": [
      "ISO 3166",
      "国旗",
      "国家代码",
      "CN",
      "CHN"
    ],
    "sources": [
      {
        "id": "gb",
        "title": "GB/T 2659.1-2022：国家和地区代码",
        "publisher": "国家市场监督管理总局 · 国家标准公开系统",
        "url": "https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=FBCE39BE204B54F6F944092C209121F2",
        "language": "zh-CN",
        "kind": "standard",
        "locator": "标准名称、采用关系与实施状态"
      },
      {
        "id": "iso",
        "title": "ISO 3166 — Country Codes",
        "publisher": "ISO",
        "url": "https://www.iso.org/iso-3166-country-codes.html",
        "language": "en",
        "kind": "standard",
        "locator": "alpha-2、alpha-3、numeric-3 的用途"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/reference/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "国家代码和国旗怎样对应资料",
        "paragraphs": [
          "国家及地区代码用稳定短标识减少跨语言名称歧义。ISO 3166-1 有二字母、三字母和三位数字形式；它们不是国家名称的自由缩写，也不能靠任意取首字母得到。",
          "本站以二字母代码连接国旗与地区记录，再关联货币和地点资料。相似旗帜只提供候选，需连同条纹方向、图案、名称和代码核验。"
        ],
        "sourceIds": [
          "gb",
          "iso",
          "implementation"
        ],
        "examples": [
          {
            "label": "二字母代码查找",
            "input": "CN",
            "output": "中国的地区记录与对应国旗；可继续查看 CNY 货币资料",
            "explanation": "CN 是地区代码，CNY 是货币代码，二者属于不同标准字段。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "点选地图或搜索地区名称、代码，阅读首都、语言、电话区号和货币字段；有多个货币记录时分别核对。",
          "旗帜图案与固定资料存在版本时点；本站不提供人口、行政区变化或货币流通情况的实时更新。"
        ],
        "sourceIds": [
          "gb",
          "iso",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "旗帜图案与固定资料存在版本时点；本站不提供人口、行政区变化或货币流通情况的实时更新。"
    ]
  },
  {
    "id": "function-native:currencies",
    "capabilityIds": [
      "native:currencies"
    ],
    "relatedIds": [
      "native:currencies"
    ],
    "topicGroup": "world",
    "title": "货币代码",
    "summary": "区分国家、货币、符号和兑换价格。",
    "aliases": [
      "ISO 4217",
      "CNY",
      "USD",
      "JPY",
      "币种",
      "货币"
    ],
    "sources": [
      {
        "id": "iso",
        "title": "ISO 4217 — Currency codes",
        "publisher": "ISO",
        "url": "https://www.iso.org/iso-4217-currency-codes.html",
        "language": "en",
        "kind": "standard",
        "locator": "字母代码、数字代码与国家代码联系"
      },
      {
        "id": "boc",
        "title": "电话银行常用货币代码对照表",
        "publisher": "中国银行",
        "url": "https://www.boc.cn/ebanking/service/cs1/201003/t20100326_992613.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "币种缩写字段；电话键盘代码是该业务自用代码"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/discovery/reference-core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "三字母货币代码怎样识读",
        "paragraphs": [
          "ISO 4217 用三字母或三位数字标识货币。USD 的 US 与美国国家代码联系，D 对应 dollar；但这是编码约定，欧元等代码不能套用一国一币的规则。",
          "¥、$ 等货币符号可能被多种货币共用，所以题目里单独的符号不足以确定币种。货币代码表示种类，不包含实时汇率、购买力或兑换方向。"
        ],
        "sourceIds": [
          "iso",
          "boc"
        ],
        "examples": [
          {
            "label": "同一符号，不同币种",
            "input": "JPY 与 CNY 都可能使用 ¥",
            "output": "JPY 是日元；CNY 是人民币",
            "explanation": "明确代码比只看符号更能消除歧义；银行电话代码也不要当作 ISO 数字代码。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "搜索币名或字母代码，再查看关联国家；一个国家可能关联多个币种，一种货币也可能用于多个地区。",
          "本站查询的是固定货币资料与国家关联，不是实时汇率或兑换计算；历史和流通状态需核对资料版本。"
        ],
        "sourceIds": [
          "iso",
          "boc",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站查询的是固定货币资料与国家关联，不是实时汇率或兑换计算；历史和流通状态需核对资料版本。"
    ]
  },
  {
    "id": "function-native:airports",
    "capabilityIds": [
      "native:airports"
    ],
    "relatedIds": [
      "native:airports"
    ],
    "topicGroup": "world",
    "title": "机场代码",
    "summary": "辨别机场、城市和本地标识的不同代码体系。",
    "aliases": [
      "IATA",
      "ICAO",
      "PEK",
      "ZBAA",
      "机场三字码"
    ],
    "sources": [
      {
        "id": "iata",
        "title": "Airline and Airport Codes Search",
        "publisher": "国际航空运输协会 IATA",
        "url": "https://www.iata.org/codes/",
        "language": "en",
        "kind": "official-doc",
        "locator": "官方三字地点代码检索"
      },
      {
        "id": "facts",
        "title": "IATA Location Codes",
        "publisher": "国际航空运输协会 IATA",
        "url": "https://www.iata.org/en/iata-repository/pressroom/fact-sheets/fact-sheet-iata-location-codes/",
        "language": "en",
        "kind": "official-doc",
        "locator": "IATA 商业用途与 ICAO 运行用途区别"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/reference/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "IATA 三字码与 ICAO 四字码有什么区别",
        "paragraphs": [
          "IATA 地点代码通常是三个字母，服务于航空商业与预订体系；ICAO 地点标识通常是四个字母，面向航空运行。三字码可能指机场，也可能指包含多个机场的都市地区。",
          "机场名称、城市名、代码和地理位置应一起核对。本站数据的“ICAO／本地标识”字段并不保证每一项都是已分配的四字 ICAO 代码，小型设施可能只有本地标识。"
        ],
        "sourceIds": [
          "iata",
          "facts",
          "implementation"
        ],
        "examples": [
          {
            "label": "两套代码的同一机场",
            "input": "PEK / ZBAA",
            "output": "北京首都国际机场",
            "explanation": "PEK 属于 IATA，ZBAA 属于 ICAO；不能通过增删一个字母相互转换。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "搜索代码或英文城市名，再核对国家、机场类型、经纬度与是否有定期航班；关闭设施与在运营机场不要混为一谈。",
          "固定目录不提供航班时刻、机场运行通告或代码实时变更；不确定的记录应到 IATA 或民航官方资料复核。"
        ],
        "sourceIds": [
          "iata",
          "facts",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "固定目录不提供航班时刻、机场运行通告或代码实时变更；不确定的记录应到 IATA 或民航官方资料复核。"
    ]
  },
  {
    "id": "function-native:ports",
    "capabilityIds": [
      "native:ports"
    ],
    "relatedIds": [
      "native:ports"
    ],
    "topicGroup": "world",
    "title": "港口与运输地点代码",
    "summary": "读懂国家前缀、地点功能、状态和坐标。",
    "aliases": [
      "UN/LOCODE",
      "CNSHA",
      "港口",
      "运输代码"
    ],
    "sources": [
      {
        "id": "unece",
        "title": "UN/LOCODE Recommendation 16",
        "publisher": "联合国欧洲经济委员会 UNECE",
        "url": "https://unlocode.unece.org/recommendation16/",
        "language": "en",
        "kind": "standard",
        "locator": "五字符代码与维护原则"
      },
      {
        "id": "data",
        "title": "UN/LOCODE Data Attributes",
        "publisher": "联合国欧洲经济委员会 UNECE",
        "url": "https://unlocode.unece.org/docs/data-attributes/",
        "language": "en",
        "kind": "official-doc",
        "locator": "列与功能、状态字段"
      },
      {
        "id": "cn",
        "title": "中华人民共和国口岸及相关地点代码标准项目",
        "publisher": "全国标准信息公共服务平台",
        "url": "https://std.samr.gov.cn/gb/search/gbDetailed?id=60D16A2E9D2DB783E05397BE0A0A90DB",
        "language": "zh-CN",
        "kind": "standard",
        "locator": "国家地点代码属于 UN/LOCODE 体系的说明"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/reference/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "UN/LOCODE 五字符地点代码如何拆开",
        "paragraphs": [
          "UN/LOCODE 是五字符地理代码，前两个字符是国家/地区代码，后三个标识地点。它覆盖港口、机场、铁路、公路和其他贸易运输节点，并非每条记录都只是海港。",
          "功能字段用不同位置或数字标注地点用途，状态字段说明记录的确认状态。某地点可有多种运输功能，因此不能仅凭代码后缀就断言它是单一港口。"
        ],
        "sourceIds": [
          "unece",
          "data",
          "cn"
        ],
        "examples": [
          {
            "label": "拆分一个地点代码",
            "input": "CNSHA",
            "output": "国家/地区前缀 CN；地点部分 SHA",
            "explanation": "完整代码才标识 UN/LOCODE 地点；SHA 单独出现也可能处于机场等别的代码体系。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "查完整五字符代码，连同功能、行政区、状态、原始坐标和版本年月阅读；地图上的点帮助定位，不替代原始记录。",
          "固定地点库不提供船期、码头泊位或实时航运状态；资料中的机场关联码与地点代码不可直接互换。"
        ],
        "sourceIds": [
          "unece",
          "data",
          "cn",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "固定地点库不提供船期、码头泊位或实时航运状态；资料中的机场关联码与地点代码不可直接互换。"
    ]
  },
  {
    "id": "function-native:sky",
    "capabilityIds": [
      "native:sky"
    ],
    "relatedIds": [
      "native:sky"
    ],
    "topicGroup": "sky",
    "title": "恒星与深空天体目录",
    "summary": "把目录身份、赤经赤纬、亮度字段与当地天空位置分开。",
    "aliases": [
      "恒星",
      "深空",
      "Messier",
      "NGC",
      "赤经",
      "赤纬",
      "星等"
    ],
    "sources": [
      {
        "id": "hko",
        "title": "太阳视赤经与视赤纬",
        "publisher": "香港天文台",
        "url": "https://www.hko.gov.hk/sc/gts/astronomy/sun_ra_dec.htm",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "注释：赤经单位与赤纬方向"
      },
      {
        "id": "iau",
        "title": "视星等词条",
        "publisher": "国际天文学联合会 IAU 天文教育办公室",
        "url": "https://www.astro4edu.org/zh-hans/resources/glossary/term/15/",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "视星等对数尺度；页面标明中文译文审核状态"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/discovery/reference-core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "星表编号、天球坐标和星等怎样阅读",
        "paragraphs": [
          "星表编号表示目录条目的身份，同一对象可能有多个目录名。赤经 RA 常用时、分、秒，24 小时对应 360°；赤纬 Dec 用角度，天赤道以北为正、以南为负。",
          "视星等描述观测到的亮度，数值越小通常越亮，相差 5 星等对应 100 倍亮度。坐标必须带参考历元理解，目录 J2000 坐标并不是某时某地的方位角和高度角。"
        ],
        "sourceIds": [
          "hko",
          "iau"
        ],
        "examples": [
          {
            "label": "赤经单位转换",
            "input": "RA = 6h 00m 00s",
            "output": "90°",
            "explanation": "赤经的 1 小时等于 15°，不是地球表面经度的 1°。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "按目录编号、名称或类型查找，再将有坐标的条目送入天文工具，填写时间、时区与地点计算当地位置。",
          "本站保存选定的固定目录；某字段缺失不应当作零值，且目录到天文位置的换算不计真实恒星距离视差与自行。"
        ],
        "sourceIds": [
          "hko",
          "iau",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站保存选定的固定目录；某字段缺失不应当作零值，且目录到天文位置的换算不计真实恒星距离视差与自行。"
    ]
  },
  {
    "id": "function-native:astronomy",
    "capabilityIds": [
      "native:astronomy"
    ],
    "relatedIds": [
      "native:astronomy"
    ],
    "topicGroup": "sky",
    "title": "天体位置与升落",
    "summary": "以 UTC 时刻和观测地点把天球位置换成当地高度与方位。",
    "aliases": [
      "天文",
      "升落",
      "方位角",
      "高度角",
      "月相",
      "UTC"
    ],
    "sources": [
      {
        "id": "hko",
        "title": "太阳视赤经与视赤纬",
        "publisher": "香港天文台",
        "url": "https://www.hko.gov.hk/sc/gts/astronomy/sun_ra_dec.htm",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "赤道坐标与时间标准注释"
      },
      {
        "id": "engine",
        "title": "Astronomy Engine 随站原始 API 文档与实现",
        "publisher": "原作者 Don Cross · MIT 许可的随站上游文件",
        "url": "/vendor/science/astronomy.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Observer、Horizon、SearchRiseSet、MoonPhase 的原始文档注释"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/science/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "时刻与地点怎样决定天体方位",
        "paragraphs": [
          "天体在本地天空的位置取决于时刻、经纬度和天体本身。本站先把输入本地时间减去 UTC 时差得到 UTC，再按观测地点计算天体方向。赤经赤纬描述天球坐标，方位高度描述观察者天空。",
          "本站方位角从正北 0° 起，正东 90°；高度角以地平线为 0°，负值表示地平线下。升落查询在所选时刻后的 24 小时内搜索，极区天体可能在这段时间内没有升落事件。"
        ],
        "sourceIds": [
          "hko",
          "engine",
          "implementation"
        ],
        "examples": [
          {
            "label": "时区换算",
            "input": "北京时间 2026-10-13 20:00，UTC 时差 +8",
            "output": "UTC 2026-10-13 12:00",
            "explanation": "时差是本地时间相对 UTC 的偏移，不能重复再加 8 小时。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "先核对时区与东/西经符号，再看方位高度；月面照亮比例与月相角是不同字段，全球日食记录还要另外判断当地可见性。",
          "使用标准大气折射近似，不计建筑和山体遮挡；目录天体以固定 J2000 方向换算，全球日食结果不保证查询地点可见。"
        ],
        "sourceIds": [
          "hko",
          "engine",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "使用标准大气折射近似，不计建筑和山体遮挡；目录天体以固定 J2000 方向换算，全球日食结果不保证查询地点可见。"
    ]
  },
  {
    "id": "function-native:chemistry",
    "capabilityIds": [
      "native:chemistry"
    ],
    "relatedIds": [
      "native:chemistry"
    ],
    "topicGroup": "matter",
    "title": "元素周期表与化学线索",
    "summary": "用原子序数识别元素，用周期、族和规范符号组织线索。",
    "aliases": [
      "元素",
      "周期表",
      "原子序数",
      "Fe",
      "化学"
    ],
    "sources": [
      {
        "id": "ccs",
        "title": "元素周期表中文版",
        "publisher": "中国化学会",
        "url": "https://img.chemsoc.org.cn/web/2019/01/%E5%85%83%E7%B4%A0%E5%91%A8%E6%9C%9F%E8%A1%A8%E4%B8%AD%E6%96%87%E7%89%8820190123%E6%9C%80%E6%96%B0(1).pdf",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "图例：原子序数、元素符号、相对原子量"
      },
      {
        "id": "iupac",
        "title": "Periodic Table of Elements",
        "publisher": "国际纯粹与应用化学联合会 IUPAC",
        "url": "https://iupac.org/what-we-do/periodic-table-of-elements/",
        "language": "en",
        "kind": "official-doc",
        "locator": "原子量数据、同位素和周期表说明"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/science/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "元素周期表的编号和符号怎样阅读",
        "paragraphs": [
          "元素由原子序数区分，原子序数是核内质子数。元素符号区分大小写，例如 Co 是钴，C 与 O 分别是碳和氧；表格横向称周期、纵向称族。",
          "相对原子量不是原子序数，也不必是整数，它与同位素组成有关。题目把词拆成元素符号时，多个拆分可能成立，需将符号、序数和题目语境一起核对。"
        ],
        "sourceIds": [
          "ccs",
          "iupac"
        ],
        "examples": [
          {
            "label": "符号与编号",
            "input": "Fe",
            "output": "铁；原子序数 26",
            "explanation": "Fe 是一个元素符号，不是字母 F 与 e 的两个独立元素。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "可以按名称、符号或序数定位元素；元素符号拆分入口会把字母串分成完整覆盖的候选，再显示对应序数。",
          "符号拆分忽略输入大小写，最多显示 100 个候选；这是一种谜题读法，不表示输入字符串本身就是规范化学式。"
        ],
        "sourceIds": [
          "ccs",
          "iupac",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "符号拆分忽略输入大小写，最多显示 100 个候选；这是一种谜题读法，不表示输入字符串本身就是规范化学式。"
    ]
  },
  {
    "id": "function-native:crystals",
    "capabilityIds": [
      "native:crystals"
    ],
    "relatedIds": [
      "native:crystals"
    ],
    "topicGroup": "matter",
    "title": "晶体与矿物结构",
    "summary": "读懂晶胞参数、原子位点和 CIF 结构记录。",
    "aliases": [
      "晶体",
      "矿物",
      "CIF",
      "晶胞",
      "分数坐标"
    ],
    "sources": [
      {
        "id": "cas",
        "title": "科学家揭秘亚晶格尺度下晶体—非晶杂化结构",
        "publisher": "中国科学院",
        "url": "https://www.cas.cn/kj/202208/t20220812_4844446.shtml",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "晶态与非晶态的长程周期性"
      },
      {
        "id": "iucr",
        "title": "CIF Core Dictionary：atom_site_fract",
        "publisher": "国际晶体学联合会 IUCr",
        "url": "https://www.iucr.org/__data/iucr/cifdic_html/1/cif_core.dic/Iatom_site_fract_.html",
        "language": "en",
        "kind": "standard",
        "locator": "分数坐标 x、y、z 定义"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/reference/cif.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "晶胞与分数坐标如何构成周期结构",
        "paragraphs": [
          "晶体的结构具有长程周期性。晶胞用三条边长 a、b、c 和三夹角 α、β、γ 描述重复单元；原子位点给出单元内部的位置，重复与对称操作生成更大的结构。",
          "分数坐标不是米或埃：位置写作 x·a 向量 + y·b 向量 + z·c 向量。CIF 将晶胞参数和位点等结构信息保存为可读文本，分数坐标必须结合晶胞才能变成空间坐标。"
        ],
        "sourceIds": [
          "cas",
          "iucr"
        ],
        "examples": [
          {
            "label": "一个正交晶胞内的位置",
            "input": "a=4 Å；位点 (0.5, 0, 0)",
            "output": "沿 a 轴距原点 2 Å",
            "explanation": "这只是说明分数坐标换算的示例，不代表某个真实矿物的完整晶体结构。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "查到矿物记录后阅读结构来源、化学式和晶胞参数，再送到三维观察工具旋转和查看原子排列。",
          "三维展示取决于随站结构与对称处理；球棍里的连接线是展示约定，不能直接当作完整化学键、电子结构或真实表面。"
        ],
        "sourceIds": [
          "cas",
          "iucr",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "三维展示取决于随站结构与对称处理；球棍里的连接线是展示约定，不能直接当作完整化学键、电子结构或真实表面。"
    ]
  },
  {
    "id": "function-native:sequence",
    "capabilityIds": [
      "native:sequence"
    ],
    "relatedIds": [
      "native:sequence"
    ],
    "topicGroup": "matter",
    "title": "氨基酸与密码子对照",
    "summary": "区分 DNA/RNA 与蛋白字母，按阅读框理解密码子翻译。",
    "aliases": [
      "蛋白质",
      "DNA",
      "RNA",
      "密码子",
      "AUG",
      "Met",
      "FASTA"
    ],
    "sources": [
      {
        "id": "ncbi",
        "title": "The Genetic Codes",
        "publisher": "美国国家生物技术信息中心 NCBI",
        "url": "https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi",
        "language": "en",
        "kind": "official-doc",
        "locator": "Standard Code / transl_table=1 与变体遗传密码表"
      },
      {
        "id": "course",
        "title": "遗传密码与蛋白质生物合成课程",
        "publisher": "国家高等教育智慧教育平台",
        "url": "https://higher.smartedu.cn/course/690530325345b68214577976",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "遗传密码：相邻三个核苷酸形成三联体"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/science/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "核酸三联体怎样映射成氨基酸",
        "paragraphs": [
          "DNA 常用 A、C、G、T，RNA 用 U 代替 T；蛋白质使用氨基酸的一字母或三字母代码。RNA 的三个相邻碱基构成密码子，例如 AUG 对应甲硫氨酸 Met，蛋白一字母记为 M。",
          "阅读框从起点每三个碱基分组，起点移一位就可能得到不同结果。双链核酸还需考虑反向互补链，因此可有六个阅读框；标准密码表中的 UAA、UAG、UGA 是终止码。"
        ],
        "sourceIds": [
          "ncbi",
          "course"
        ],
        "examples": [
          {
            "label": "标准密码表翻译",
            "input": "RNA：AUG GCU UAA",
            "output": "M A *，即 Met Ala 终止",
            "explanation": "每组恰好三个碱基；末尾 * 表示终止，不是一个普通氨基酸。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "先选择 DNA、RNA 或蛋白类型；比较原序列、互补链、反向互补与各阅读框，不要把所有输出都当作真实生物表达的蛋白。",
          "本站使用标准遗传密码表，不自动寻找起始码，也不预测三维结构；不足三碱基的尾部不翻译，模糊密码子显示为未知。"
        ],
        "sourceIds": [
          "ncbi",
          "course",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站使用标准遗传密码表，不自动寻找起始码，也不预测三维结构；不足三碱基的尾部不翻译，模糊密码子显示为未知。"
    ]
  },
  {
    "id": "function-native:chemistry-formula",
    "capabilityIds": [
      "native:chemistry-formula"
    ],
    "relatedIds": [
      "native:chemistry-formula"
    ],
    "topicGroup": "matter",
    "title": "分子式与原子计数",
    "summary": "逐层展开化学式，再按原子量求近似质量。",
    "aliases": [
      "分子式",
      "Ca(OH)2",
      "原子计数",
      "结晶水",
      "摩尔质量"
    ],
    "sources": [
      {
        "id": "iupac",
        "title": "IUPAC 元素与原子量说明",
        "publisher": "国际纯粹与应用化学联合会 IUPAC",
        "url": "https://iupac.org/what-we-do/periodic-table-of-elements/",
        "language": "en",
        "kind": "official-doc",
        "locator": "标准原子量与同位素组成"
      },
      {
        "id": "parser",
        "title": "本站分子式语法与计数实现",
        "publisher": "迷雾工具箱",
        "url": "/science/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "formula：下标、括号倍数、点分隔结晶水"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/science/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "下标、括号和结晶水怎样累计原子",
        "paragraphs": [
          "本站分子式计数器把数字视为前面元素或括号组的倍数。Ca(OH)2 展开为 1 个 Ca、2 个 O、2 个 H；括号外的 2 同时乘括号里的 O 和 H。",
          "结晶水以点分隔，例如 CuSO4·5H2O 中 5 乘整个水组；总量是 Cu 1、S 1、O 9、H 10。质量估算将每种元素的原子数乘随站平均原子量，再相加。"
        ],
        "sourceIds": [
          "iupac",
          "parser",
          "implementation"
        ],
        "examples": [
          {
            "label": "展开括号",
            "input": "Ca(OH)2",
            "output": "Ca:1；O:2；H:2",
            "explanation": "2 乘整个 OH 组，不是只乘紧挨数字的 H。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "检查规范元素符号大小写并核对原子数；质量求和得到相对式量，真正分子的分子式可称相对分子质量，两者均无量纲，摩尔质量常以 g/mol 表示。",
          "本站解析普通式、整数下标、括号和结晶水，不支持电荷、同位素标注或小数下标；质量是平均原子量近似。"
        ],
        "sourceIds": [
          "iupac",
          "parser",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站解析普通式、整数下标、括号和结晶水，不支持电荷、同位素标注或小数下标；质量是平均原子量近似。"
    ]
  },
  {
    "id": "function-native:chemistry-molecule",
    "capabilityIds": [
      "native:chemistry-molecule"
    ],
    "relatedIds": [
      "native:chemistry-molecule"
    ],
    "topicGroup": "matter",
    "title": "SMILES 分子结构",
    "summary": "读取原子、键、分支和闭环符号，区分连接关系与空间形状。",
    "aliases": [
      "SMILES",
      "CCO",
      "分子结构",
      "芳香环"
    ],
    "sources": [
      {
        "id": "daylight",
        "title": "Daylight Theory：SMILES",
        "publisher": "SMILES 规范原作者 Daylight",
        "url": "https://www.daylight.com/dayhtml/doc/theory/theory.smiles.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "Atoms、Bonds、Branches、Rings"
      },
      {
        "id": "cas",
        "title": "ConfSeq：用语言读写三维分子构象",
        "publisher": "中国科学院上海药物研究所",
        "url": "https://www.simm.cas.cn/web/xwzx/kydt/202606/t20260612_8227870.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "SMILES 描述分子拓扑与三维构象的区别"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/science/worker.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "SMILES 怎样把分子连接图写成文字",
        "paragraphs": [
          "SMILES 是分子连接关系的线性表示：原子用元素符号，= 表示双键，# 表示三键，括号表示分支，相同数字标记成对闭环位置。数字不是该原子的数量。",
          "CCO 表示碳—碳—氧连接，省略的氢按价态补齐；c1ccccc1 用小写芳香原子与成对的 1 描述苯环。不同 SMILES 可能描述同一连接图，原始字符串并不天然唯一。"
        ],
        "sourceIds": [
          "daylight",
          "cas"
        ],
        "examples": [
          {
            "label": "解析乙醇的连接",
            "input": "CCO",
            "output": "两碳一氧的骨架；补隐含氢得到 C2H6O",
            "explanation": "CCO 中没有写出的氢通过价态规则补足，不能仅按三个字符计算所有原子。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "先核对原子与分支，再看环闭合和电荷、立体标记；本站结构图帮助查看连接关系，可配合分子式字段核验。",
          "未给出立体标记时，字符串不保证特定立体异构体；二维结构图也不是真实三维构象、反应结果或物性预测。"
        ],
        "sourceIds": [
          "daylight",
          "cas",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "未给出立体标记时，字符串不保证特定立体异构体；二维结构图也不是真实三维构象、反应结果或物性预测。"
    ]
  },
  {
    "id": "function-native:unicode",
    "capabilityIds": [
      "native:unicode"
    ],
    "relatedIds": [
      "native:unicode"
    ],
    "topicGroup": "characters-reference",
    "title": "Unicode 字符表",
    "summary": "用 U+ 十六进制编号读 Unicode 字符，而不是用外观猜编码。",
    "aliases": [
      "Unicode",
      "码点",
      "字符表",
      "U+0041",
      "UTF-8"
    ],
    "sources": [
      {
        "id": "unicode",
        "title": "UTF-8、UTF-16、UTF-32 与 BOM FAQ",
        "publisher": "Unicode 联盟",
        "url": "https://www.unicode.org/faq/utf_bom.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "Unicode 编码形式、代理码位与字节序"
      },
      {
        "id": "mdn",
        "title": "String.prototype.codePointAt",
        "publisher": "MDN 官方中文文档",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "码点与 UTF-16 代码单元区别"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/reference/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "码点、字符属性和 UTF-8 字节怎样对应",
        "paragraphs": [
          "Unicode 给字符指定码点，U+ 后使用十六进制，例如 A 是 U+0041。码点编号、UTF-16 代码单元和 UTF-8 文件字节是不同层次，不能直接把 U+ 后的数字拆成文件字节。",
          "UTF-8 把一个 Unicode 标量值写成 1–4 个字节。Unicode 属性如字母类别、文字系统和区块用于组织字符；组合标记也可能参与组成一个可见符号。"
        ],
        "sourceIds": [
          "unicode",
          "mdn"
        ],
        "examples": [
          {
            "label": "汉字的码点和存储",
            "input": "中：U+4E2D",
            "output": "十进制码点 20013；UTF-8 E4 B8 AD",
            "explanation": "U+4E2D 指字符身份，而 UTF-8 采用三个字节保存它。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "可粘贴字符或输入 U+XXXX；看名称、类别、区块、别名和字节。看不见的格式字符也有记录，不必把它们当作空输入。",
          "代理码位 U+D800–U+DFFF 不能单独编码成有效 UTF-8 标量；相同外观不证明码点相同，字体也可能缺少字形。"
        ],
        "sourceIds": [
          "unicode",
          "mdn",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "代理码位 U+D800–U+DFFF 不能单独编码成有效 UTF-8 标量；相同外观不证明码点相同，字体也可能缺少字形。"
    ]
  },
  {
    "id": "function-native:marine",
    "capabilityIds": [
      "native:marine"
    ],
    "relatedIds": [
      "native:marine"
    ],
    "topicGroup": "characters-reference",
    "title": "海事信号旗",
    "summary": "先辨认字母旗，再区分拼字和标准航海消息。",
    "aliases": [
      "海事信号旗",
      "Alfa",
      "Bravo",
      "国际信号规则"
    ],
    "sources": [
      {
        "id": "cinnet",
        "title": "海上运输船舶国际信号旗简介",
        "publisher": "中国航海学会",
        "url": "https://www.cinnet.cn/zh-hans/xsjl/hhkp/kpzsc/287-hai-shang-yun-shu-chuan-bo-guo-ji-xin-hao-qi-jian-jie.htm",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "单旗用途、两旗通用信息及三旗医疗部分"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/discovery/reference-core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "海事单旗与组合旗怎样识读",
        "paragraphs": [
          "国际信号旗用特定图案代表字母和数字。单旗独立使用时可有规定航海含义，例如 A 旗提示有潜水员，要求他船慢速远离；B 旗提示危险货物。",
          "旗帜排列还可以用于拼写，或按《国际信号规则》形成组合消息。组合含义不是把每面单旗中文意思机械相加；阅读时要先确认上下排列与通信语境。"
        ],
        "sourceIds": [
          "cinnet"
        ],
        "examples": [
          {
            "label": "识别 A 旗",
            "input": "白蓝燕尾形 A / Alfa 旗",
            "output": "我船有潜水员，请慢速远离",
            "explanation": "在单旗航海语境中读取规定消息；在谜题拼字语境中也可能只取字母 A。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "点选旗帜后核对字母、读音和单旗含义；照片中要看燕尾、三角或矩形轮廓，以及颜色分块的方向。",
          "本站重点查询字母与收录的单旗资料，不是完整航海通信规则库；不能据此直接解释所有多旗组合。"
        ],
        "sourceIds": [
          "cinnet",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站重点查询字母与收录的单旗资料，不是完整航海通信规则库；不能据此直接解释所有多旗组合。"
    ]
  },
  {
    "id": "function-native:colors",
    "capabilityIds": [
      "native:colors"
    ],
    "relatedIds": [
      "native:colors"
    ],
    "topicGroup": "colors",
    "title": "颜色",
    "summary": "自由选色后读通道值、色相和近似名称。",
    "aliases": [
      "颜色",
      "RGB",
      "HEX",
      "HSL",
      "色盘",
      "ΔE"
    ],
    "sources": [
      {
        "id": "mdn",
        "title": "CSS <color> 颜色值",
        "publisher": "MDN 官方中文文档",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/Values/color_value",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "RGB、HEX、HSL 与命名颜色"
      },
      {
        "id": "local",
        "title": "本站颜色空间换算与近似名称算法",
        "publisher": "迷雾工具箱",
        "url": "/reference/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "colorLab / queryRecords colors：ΔE76 排序"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/reference/color-picker.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "RGB、HEX 与 HSL 怎样描述同一颜色",
        "paragraphs": [
          "#RRGGBB 用两位十六进制表示红、绿、蓝通道，各通道 00–FF 对应十进制 0–255。#RGB 是简写，每位扩为两位；#f80 就等于 #ff8800。",
          "HSL 用色相角、饱和度和亮度描述颜色，表达方式不同但可对应同一 sRGB 色值。本站将输入色与名称库转换到 Lab，用 ΔE76 距离排序近似名称，而非给任意颜色唯一命名。"
        ],
        "sourceIds": [
          "mdn",
          "local",
          "implementation"
        ],
        "examples": [
          {
            "label": "拆解一个色值",
            "input": "#FF8000",
            "output": "RGB(255,128,0)",
            "explanation": "FF=255，80=128，00=0；这三个数分别是红、绿、蓝的通道。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "在自由色盘选色或填 HEX，读取当前数值后查看近似名称；比较颜色时注意输入和结果是否使用同一颜色空间。",
          "近似名称依赖随站名称库和 ΔE76 算法，不是唯一官方色名；屏幕、色彩管理和亮度会改变视觉观感。"
        ],
        "sourceIds": [
          "mdn",
          "local",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "近似名称依赖随站名称库和 ΔE76 算法，不是唯一官方色名；屏幕、色彩管理和亮度会改变视觉观感。"
    ]
  },
  {
    "id": "function-native:calendar",
    "capabilityIds": [
      "native:calendar"
    ],
    "relatedIds": [
      "native:calendar"
    ],
    "topicGroup": "calendar",
    "title": "传统历法",
    "summary": "理解阴阳合历、月相起月和太阳黄经分节气。",
    "aliases": [
      "农历",
      "公历",
      "闰月",
      "节气",
      "干支"
    ],
    "sources": [
      {
        "id": "lunar",
        "title": "农历历法",
        "publisher": "香港天文台",
        "url": "https://www.hko.gov.hk/sc/gts/time/lunarcal.htm",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "朔望月、回归年与朔日"
      },
      {
        "id": "terms",
        "title": "二十四节气",
        "publisher": "香港天文台",
        "url": "https://www.hko.gov.hk/sc/gts/time/24solarterms.htm",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "太阳黄经每 15° 分一个节气"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/science/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "朔、节气与闰月怎样组成农历",
        "paragraphs": [
          "农历是同时考虑月相和太阳季节的阴阳历。月以朔，也就是新月，为开端；朔望月约 29.53 日，因此农历月有 29 或 30 天，不是每月固定 30 天。",
          "二十四节气按太阳黄经每 15° 分段，春分为 0°、清明为 15°。十二个朔望月比回归年短约 11 天，安排闰月用于协调月与季节；闰月不是每四年固定增加的一天。"
        ],
        "sourceIds": [
          "lunar",
          "terms"
        ],
        "examples": [
          {
            "label": "读取节气的角度",
            "input": "太阳黄经 90°",
            "output": "夏至",
            "explanation": "这里的角度是太阳沿黄道的位置；它不是当地太阳高度角。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "公历转农历或反向输入时，核对年份、月份和闰月标记；再阅读节气表和分别注明换年约定的干支字段。",
          "本站支持 1900–2100 年；闰月需该年确实存在，节气时刻以北京时间给出，年干支使用春节换年约定。"
        ],
        "sourceIds": [
          "lunar",
          "terms",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站支持 1900–2100 年；闰月需该年确实存在，节气时刻以北京时间给出，年干支使用春节换年约定。"
    ]
  },
  {
    "id": "function-native:geology",
    "capabilityIds": [
      "native:geology"
    ],
    "relatedIds": [
      "native:geology"
    ],
    "topicGroup": "geology",
    "title": "地质年代时间带",
    "summary": "沿嵌套层级定位过去时间，而不是把区间当公历年份。",
    "aliases": [
      "地质年代",
      "Ma",
      "纪",
      "白垩纪",
      "年代地层"
    ],
    "sources": [
      {
        "id": "ics",
        "title": "国际年代地层表中文版 2023/09",
        "publisher": "国际地层委员会 ICS",
        "url": "https://stratigraphy.org/ICSchart/ChronostratChart2023-09Chinese.pdf",
        "language": "zh-CN",
        "kind": "standard",
        "locator": "地质时间层级、数值年龄与单位 Ma"
      },
      {
        "id": "chart",
        "title": "ICS 最新年代地层图入口",
        "publisher": "国际地层委员会 ICS",
        "url": "https://stratigraphy.org/chart/?language=zh",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "最新版本及界线定义说明"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/reference/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "Ma 和宙、代、纪、世怎样读地质时间",
        "paragraphs": [
          "Ma 表示百万年，以距今时间表达年龄；66 Ma 就是约 6600 万年前，不能当作公元前 66 年。时间单位按宙、代、纪、世、期嵌套，岩层单位对应宇、界、系、统、阶。",
          "数值年龄通常是年代界线的估计，有些界线用全球界线层型剖面和点位来定义，并不只是任意整数。新版表可能修订估计年龄，查询时要保留数据版本。"
        ],
        "sourceIds": [
          "ics",
          "chart"
        ],
        "examples": [
          {
            "label": "读取年龄单位",
            "input": "66 Ma",
            "output": "约 6600 万年前；需在相应版本时间表定位所属区间",
            "explanation": "先乘 100 万，再根据年代层级查找；边界值要按数据表的区间约定理解。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "拖动或点击时间带，先看上层单位，再下钻相应纪、世和期；数字查询也可用于查找包住该年龄的层级。",
          "本站时间带基于随站固定快照；数值界线与单位名称请以旁边 ICS 最新图复核，不把颜色本身当成全球通用密码。"
        ],
        "sourceIds": [
          "ics",
          "chart",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站时间带基于随站固定快照；数值界线与单位名称请以旁边 ICS 最新图复核，不把颜色本身当成全球通用密码。"
    ]
  },
  {
    "id": "function-native:iching",
    "capabilityIds": [
      "native:iching"
    ],
    "relatedIds": [
      "native:iching"
    ],
    "topicGroup": "traditions",
    "title": "八卦与六十四卦",
    "summary": "从下往上读断续线，辨别上下卦和编号体系。",
    "aliases": [
      "八卦",
      "六十四卦",
      "爻",
      "乾",
      "坤",
      "二进制"
    ],
    "sources": [
      {
        "id": "text",
        "title": "易学四同别录：占用八卦为纲",
        "publisher": "明代季本著 · 识典古籍",
        "url": "https://www.shidianguji.com/mid-page/7418256532158021659",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "八卦之象、位与乾坤交生诸卦"
      },
      {
        "id": "model",
        "title": "本站八卦与六十四卦结构数据",
        "publisher": "迷雾工具箱 · 随站资料",
        "url": "/vendor/reference/iching.json",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "lines 自下而上；上下三爻与收录编号"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/reference/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "阴阳爻如何从三爻组成六爻卦",
        "paragraphs": [
          "阳爻画为完整横线，阴爻画为断开的横线；三爻有 2³=8 种组合，六爻有 2⁶=64 种组合。本站用阳 1、阴 0 表示，lines 字段按自下而上排列。",
          "六爻的底部三爻构成下卦，顶部三爻构成上卦；上、下次序改变可得到不同卦。卦名、传统序号、先天/后天方位是不同排列约定，不能把六位二进制的数值直接当作传统序号。"
        ],
        "sourceIds": [
          "text",
          "model",
          "implementation"
        ],
        "examples": [
          {
            "label": "全阳爻结构",
            "input": "自下而上 111；六爻 111111",
            "output": "三爻为乾 ☰；六爻为乾 ䷀",
            "explanation": "数字是本站标记线型的约定，读取时保留自下而上的顺序。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "点八卦图或输入线型，核对爻序、上卦、下卦和采用的编号；需要比较两个卦时先比较线型再比较名称。",
          "这里提供传统符号结构与文献对应，不把传统象义解释为自然科学因果或对未来事件的可靠预测。"
        ],
        "sourceIds": [
          "text",
          "model",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "这里提供传统符号结构与文献对应，不把传统象义解释为自然科学因果或对未来事件的可靠预测。"
    ]
  },
  {
    "id": "function-native:tarot",
    "capabilityIds": [
      "native:tarot"
    ],
    "relatedIds": [
      "native:tarot"
    ],
    "topicGroup": "traditions",
    "title": "塔罗牌",
    "summary": "先识别牌面版本，再读 22+56 的牌组结构。",
    "aliases": [
      "塔罗",
      "大阿尔卡那",
      "小阿尔卡那",
      "RWS",
      "牌组"
    ],
    "sources": [
      {
        "id": "met",
        "title": "Before Fortune-Telling：The History and Structure of Tarot Cards",
        "publisher": "大都会艺术博物馆 · 策展人 Tim Husband",
        "url": "https://www.metmuseum.org/perspectives/tarot-2",
        "language": "en",
        "kind": "official-doc",
        "locator": "四花色、56 花色牌、21 张王牌与愚者；历史变体"
      },
      {
        "id": "deck",
        "title": "本站牌面版本与编号映射",
        "publisher": "迷雾工具箱 · 已署名牌面资料",
        "url": "/reference/tarot-art.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "蓝金幻想与经典 RWS；正义、力量编号映射"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/reference/tarot-art.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "牌组、花色与牌面编号怎样组织塔罗资料",
        "paragraphs": [
          "常见 78 张塔罗由 22 张大阿尔卡那与 56 张小阿尔卡那组成。后者分四花色，每花色 14 张，包括 Ace 至 Ten 与四张宫廷牌；历史牌组也有不同结构。",
          "读取一张牌时应分清花色、牌名、序号和牌面版本。不同版本可交换力量与正义的编号；本工具的编号查询跟随当前选择的牌组，而不是固定套用同一序列。"
        ],
        "sourceIds": [
          "met",
          "deck",
          "implementation"
        ],
        "examples": [
          {
            "label": "核对同一编号的版本",
            "input": "经典 RWS 的 VIII",
            "output": "力量；本站蓝金幻想版本的 VIII 为正义",
            "explanation": "名称和编号必须连同版式核对；切换牌组后相同数字可能对应另一张牌。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "通过花色和牌名选择，比较图案、英文名称和编号；牌面在本地加载，旁边列出的关键词属于本站简述。",
          "关键词与元素对应取决于传统或牌组解释；本查询没有统一适用于所有历史牌组的编号，应先确认题目采用哪套牌。"
        ],
        "sourceIds": [
          "met",
          "deck",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "关键词与元素对应取决于传统或牌组解释；本查询没有统一适用于所有历史牌组的编号，应先确认题目采用哪套牌。"
    ]
  },
  {
    "id": "function-native:integerseq",
    "capabilityIds": [
      "native:integerseq"
    ],
    "relatedIds": [
      "native:integerseq"
    ],
    "topicGroup": "sequences",
    "title": "整数数列识别",
    "summary": "用连续项匹配和索引核对候选，再检查递推定义。",
    "aliases": [
      "整数数列",
      "OEIS",
      "斐波那契",
      "等差",
      "等比"
    ],
    "sources": [
      {
        "id": "oeis",
        "title": "A000045：Fibonacci numbers",
        "publisher": "OEIS 基金会",
        "url": "https://oeis.org/A000045",
        "language": "en",
        "kind": "official-doc",
        "locator": "数列项、offset 与递推公式"
      },
      {
        "id": "faq",
        "title": "OEIS FAQ：Searching",
        "publisher": "OEIS 基金会",
        "url": "https://oeis.org/FAQ.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "按若干连续项查找与条目编号"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/reference/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "有限整数怎样匹配数列而不误认规律",
        "paragraphs": [
          "数列查找把输入整数作为连续项，在收录的前缀中寻找同顺序匹配；匹配索引需要结合条目的 offset 解释。某组数字可能是数列中间片段，不一定从第 0 或第 1 项开始。",
          "有限个数不能证明唯一生成规律。等差或整数等比只是可检验的简单候选，OEIS 条目还需核对定义、递推式和索引范围，再看新的项是否继续符合。"
        ],
        "sourceIds": [
          "oeis",
          "faq"
        ],
        "examples": [
          {
            "label": "一个递推候选",
            "input": "0,1,1,2,3,5",
            "output": "斐波那契候选；在 F(0)=0、F(1)=1 下，下一项是 8",
            "explanation": "按照 F(n)=F(n−1)+F(n−2) 得到 3+5=8；这是候选定义，而非仅凭六项证明。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "输入至少三项完整整数，查看命中位置与收录后续项；用题目里其他数字或结构验证候选，不只比较开头几项。",
          "本站仅匹配本地收录的数列前缀，并附简单规律候选；没有命中不表示 OEIS 完整数据库不存在该数列。"
        ],
        "sourceIds": [
          "oeis",
          "faq",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站仅匹配本地收录的数列前缀，并附简单规律候选；没有命中不表示 OEIS 完整数据库不存在该数列。"
    ]
  },
  {
    "id": "function-native:go",
    "capabilityIds": [
      "native:go"
    ],
    "relatedIds": [
      "native:go"
    ],
    "topicGroup": "boards",
    "title": "围棋棋谱复盘",
    "summary": "沿棋谱树读取落子、摆子、提子与停一手。",
    "aliases": [
      "围棋",
      "SGF",
      "气",
      "提子",
      "棋谱"
    ],
    "sources": [
      {
        "id": "sgf",
        "title": "SGF FF[4]：Go（GM[1]）",
        "publisher": "SGF 格式维护者",
        "url": "https://www.red-bean.com/sgf/go.html",
        "language": "en",
        "kind": "standard",
        "locator": "Move / Point 坐标；B、W、AB、AW 与提子顺序"
      },
      {
        "id": "rules",
        "title": "中国围棋规则",
        "publisher": "中国围棋协会",
        "url": "https://wqwh.weiqi.org.cn/rules/",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "第2–6条：下法、气、提子和禁止全局同形再现"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/discovery/go-core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "SGF 的节点、坐标和分支怎样复盘围棋",
        "paragraphs": [
          "SGF 用分号开始节点、属性名加方括号保存内容。B[dd] 表示黑棋在 dd 落子，W[] 表示白棋停一手；括号嵌套记录变化分支，而不是所有分支都依次下到同一盘。",
          "SGF 坐标的第一字母从左向右表示列，第二字母从上向下表示行，a 为第一格；它与常见棋盘 A1 显示坐标不同。复盘落子后还要检查相邻棋块的气，移除无气棋块才能得到对应局面。"
        ],
        "sourceIds": [
          "sgf",
          "rules"
        ],
        "examples": [
          {
            "label": "一手棋的坐标",
            "input": "(;GM[1]SZ[19];B[dd])",
            "output": "19 路棋盘第 4 列、第 4 行落黑子",
            "explanation": "dd 的两个 d 都是从左上数的第四格，不是棋盘显示里的 D4。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "打开 SGF 后选择棋局与分支，逐手查看落子和评论；AB/AW 的摆子属性用于设置局面，不能当成普通交替落子。",
          "本工具是有边界的棋谱回放，不是围棋 AI 或赛事裁判；复杂规则、劫争与胜负需根据原谱规则集核对。"
        ],
        "sourceIds": [
          "sgf",
          "rules",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本工具是有边界的棋谱回放，不是围棋 AI 或赛事裁判；复杂规则、劫争与胜负需根据原谱规则集核对。"
    ]
  },
  {
    "id": "function-native:chess",
    "capabilityIds": [
      "native:chess"
    ],
    "relatedIds": [
      "native:chess"
    ],
    "topicGroup": "boards",
    "title": "国际象棋棋谱复盘",
    "summary": "区分逐步走子记录和单个局面快照，读取代数记谱。",
    "aliases": [
      "国际象棋",
      "PGN",
      "FEN",
      "SAN",
      "Nf3"
    ],
    "sources": [
      {
        "id": "fide",
        "title": "FIDE Laws of Chess 2023",
        "publisher": "国际棋联 FIDE",
        "url": "https://handbook.fide.com/chapter/e012023",
        "language": "en",
        "kind": "official-doc",
        "locator": "Appendix C：代数记谱法"
      },
      {
        "id": "parser",
        "title": "Chess.js：PGN、FEN 与走子接口",
        "publisher": "Chess.js 官方文档",
        "url": "https://jhlywa.github.io/chess.js/",
        "language": "en",
        "kind": "official-doc",
        "locator": "loadPgn、fen、move 与局面校验"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/round4/chess.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "PGN 棋谱与 FEN 局面如何表达棋局",
        "paragraphs": [
          "PGN 保存棋局的标签和按顺序的走子，走子通常使用 SAN 代数记谱：N 表示马，f3 表示终点格，x 表示吃子，+ 表示将军。王车易位用 O-O 或 O-O-O，兵走子通常不写 P。",
          "FEN 描述一个局面：棋子排列、行棋方、易位权、吃过路兵目标、半回合计数和完整回合数。它没有过去全部着法；相同棋子位置也可能因易位权不同而有不同合法着法。"
        ],
        "sourceIds": [
          "fide",
          "parser"
        ],
        "examples": [
          {
            "label": "读一段 PGN 着法",
            "input": "1. e4 e5 2. Nf3",
            "output": "白兵到 e4；黑兵到 e5；白马到 f3",
            "explanation": "在标准初始局面中按合法性确定具体棋子，Nf3 不表示字母 N 位置的棋子。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "PGN 用于逐步复盘，FEN 用于直接查看给定位置；每次走子后核对行棋方、吃子、将军与回合号。",
          "本入口进行规则校验与复盘，不提供最佳着法搜索或棋力评分；一条 FEN 也不能还原完整棋局历史。"
        ],
        "sourceIds": [
          "fide",
          "parser",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本入口进行规则校验与复盘，不提供最佳着法搜索或棋力评分；一条 FEN 也不能还原完整棋局历史。"
    ]
  },
  {
    "id": "function-native:paper",
    "capabilityIds": [
      "native:paper"
    ],
    "relatedIds": [
      "native:paper"
    ],
    "topicGroup": "logic",
    "title": "标准数独求解",
    "summary": "用候选排除理解数独，而不是进行算术求和。",
    "aliases": [
      "数独",
      "Sudoku",
      "候选",
      "宫"
    ],
    "sources": [
      {
        "id": "nikoli",
        "title": "Sudoku：Rules",
        "publisher": "Nikoli 官方题型规则",
        "url": "https://www.nikoli.co.jp/en/puzzles/sudoku/",
        "language": "en",
        "kind": "official-doc",
        "locator": "9×9 的行、列和 3×3 宫约束"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/round3/board-model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "数字、行列与宫怎样构成数独约束",
        "paragraphs": [
          "标准 9×9 数独用 1–9 填满空格，每行、每列和每个 3×3 宫都恰好出现一次每个数字。数字只是不同符号的标签，不要求对题面进行加减乘除。",
          "一个空格的候选集合是 1–9 减去同行、同列、同宫已经出现的数字；若只剩一个值，就可以确定。局部候选还需同全盘约束一起验证，重复给定数字会使题目矛盾。"
        ],
        "sourceIds": [
          "nikoli"
        ],
        "examples": [
          {
            "label": "单一候选",
            "input": "某行已含 1,2,3,4,5,6,7,8，只有一空格",
            "output": "该空格必须为 9",
            "explanation": "由行内不重复并完整使用 1–9 推出；仍需检查该 9 不与列或宫条件冲突。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "按原题尺寸录入给定值，留空格子保持未定；求解后区分完整唯一解、共同确定部分与无解状态。",
          "本站支持 4×4、6×6、9×9 标准数独；6×6 使用 2×3 宫，不包含对角线、杀手等额外题型规则。"
        ],
        "sourceIds": [
          "nikoli",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站支持 4×4、6×6、9×9 标准数独；6×6 使用 2×3 宫，不包含对角线、杀手等额外题型规则。"
    ]
  },
  {
    "id": "function-native:paper-slitherlink",
    "capabilityIds": [
      "native:paper-slitherlink"
    ],
    "relatedIds": [
      "native:paper-slitherlink"
    ],
    "topicGroup": "logic",
    "title": "数回 求解",
    "summary": "从局部边数与节点度数推导数回。",
    "aliases": [
      "数回",
      "Slitherlink",
      "闭合回路",
      "连线"
    ],
    "sources": [
      {
        "id": "nikoli",
        "title": "Slitherlink：Rules",
        "publisher": "Nikoli 官方题型规则",
        "url": "https://www.nikoli.co.jp/en/puzzles/slitherlink/",
        "language": "en",
        "kind": "official-doc",
        "locator": "单闭环、格周边数、不分叉或交叉"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/round3/board-model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "格内数字怎样约束一条闭合回路",
        "paragraphs": [
          "数回沿相邻格点间的横竖边画线，最终只形成一条不分叉、不交叉的闭合回路。格内数字说明它四条周边中恰好有几条被使用；无数字格不规定周边条数。",
          "每个被回路经过的点应连接两条线，未经过的点连接零条线。局部满足数字仍不够，还需排除独立的小闭环与分叉，保证所有线属于同一个回路。"
        ],
        "sourceIds": [
          "nikoli"
        ],
        "examples": [
          {
            "label": "数字 0 的直接推论",
            "input": "一个格子中的提示数字是 0",
            "output": "该格子的上、下、左、右四边全部不连线",
            "explanation": "0 表示周边用边总数为零，与空白格的无约束完全不同。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "只录入原题给出的 0–3；解答里的线表示确定使用，× 表示确定不用，未确定边仍保留候选。",
          "本站不会把任意满足部分边数的图当成完整答案；题面多解时显示共同确定的边，留白并不一定表示该边不用。"
        ],
        "sourceIds": [
          "nikoli",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站不会把任意满足部分边数的图当成完整答案；题面多解时显示共同确定的边，留白并不一定表示该边不用。"
    ]
  },
  {
    "id": "function-native:paper-nurikabe",
    "capabilityIds": [
      "native:paper-nurikabe"
    ],
    "relatedIds": [
      "native:paper-nurikabe"
    ],
    "topicGroup": "logic",
    "title": "数墙 求解",
    "summary": "理解岛屿面积、四邻连接和禁止 2×2 海块。",
    "aliases": [
      "数墙",
      "Nurikabe",
      "岛屿",
      "连通"
    ],
    "sources": [
      {
        "id": "nikoli",
        "title": "Nurikabe：Rules",
        "publisher": "Nikoli 官方题型规则",
        "url": "https://www.nikoli.co.jp/en/puzzles/nurikabe/",
        "language": "en",
        "kind": "official-doc",
        "locator": "白区含一个数字、黑区连通与禁 2×2"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/round3/board-model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "数字岛与连通海怎样形成数墙规则",
        "paragraphs": [
          "数墙把格子分成白色岛屿与黑色海域。每个岛恰好有一个数字，白格总数等于该数字；不同岛不能通过格边连接，角上接触不等于四邻连通。",
          "所有黑格必须通过上下左右连成一片，同时不能出现 2×2 全黑块。数字格属于自己的岛，不能涂黑；面积与全局连通条件需要同时满足。"
        ],
        "sourceIds": [
          "nikoli"
        ],
        "examples": [
          {
            "label": "面积 1 的岛",
            "input": "一个不在边界、标有 1 的白格",
            "output": "上下左右四个邻格都是黑色海域",
            "explanation": "岛的面积已经用完，四邻不能再成为同一岛，也不能边邻另一座岛。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "录入每座岛的面积数字，解答时分别核对数字所属白区大小、海域连通和任意 2×2 区块。",
          "本站深色为海、浅色为岛，? 表示未确定；仅看颜色而忽略连通方向会把角接触误判为岛连接。"
        ],
        "sourceIds": [
          "nikoli",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站深色为海、浅色为岛，? 表示未确定；仅看颜色而忽略连通方向会把角接触误判为岛连接。"
    ]
  },
  {
    "id": "function-native:paper-akari",
    "capabilityIds": [
      "native:paper-akari"
    ],
    "relatedIds": [
      "native:paper-akari"
    ],
    "topicGroup": "logic",
    "title": "照明 求解",
    "summary": "用可见行列与四邻灯数判断灯的位置。",
    "aliases": [
      "照明",
      "Akari",
      "灯泡",
      "Light Up"
    ],
    "sources": [
      {
        "id": "nikoli",
        "title": "Akari：Rules",
        "publisher": "Nikoli 官方题型规则",
        "url": "https://www.nikoli.co.jp/en/puzzles/akari/",
        "language": "en",
        "kind": "official-doc",
        "locator": "白格全照亮、灯不互照与黑格邻灯数"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/round3/board-model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "灯光传播与黑格数字怎样构成照明约束",
        "paragraphs": [
          "照明在白格放灯，灯沿同一行、列传播，遇黑格或外框停止；每一个白格都必须被至少一盏灯照亮，但任何两盏灯不能互相照射。",
          "黑格数字只计上下左右紧邻的灯数，不计斜角灯，也不计远处照来的光。黑格会挡光，数字 0 禁止四邻放灯，但不代表周边白格不能被远处灯照亮。"
        ],
        "sourceIds": [
          "nikoli"
        ],
        "examples": [
          {
            "label": "内部数字 4",
            "input": "内部黑格标记 4，四邻都是白格",
            "output": "四个上下左右邻格都必须放灯",
            "explanation": "提示数数的是直接相邻的灯；随后仍需检查这些灯没有与其他灯相互照射。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "录入黑格及数字，白格留空；解答中 ● 为灯，· 为确定不放灯，再核对所有白格是否都已照亮。",
          "未确定格子不等于确定无灯，× 或文字空白也不能替代题目的黑墙；本站只采用标准 Akari 规则。"
        ],
        "sourceIds": [
          "nikoli",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "未确定格子不等于确定无灯，× 或文字空白也不能替代题目的黑墙；本站只采用标准 Akari 规则。"
    ]
  },
  {
    "id": "function-native:life",
    "capabilityIds": [
      "native:life"
    ],
    "relatedIds": [
      "native:life"
    ],
    "topicGroup": "simulation",
    "title": "生命游戏",
    "summary": "同步计算八邻域，让简单规则形成静物和振荡器。",
    "aliases": [
      "生命游戏",
      "Conway",
      "B3/S23",
      "元胞自动机",
      "闪烁器"
    ],
    "sources": [
      {
        "id": "gardner",
        "title": "The fantastic combinations of John Conway’s new solitaire game life",
        "publisher": "Martin Gardner · Scientific American 1970；ibiblio 原文存档",
        "url": "https://ibiblio.org/lifepatterns/october1970.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "生存、死亡与出生规则"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/round4/life.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "B3/S23 怎样从邻居数量决定下一代",
        "paragraphs": [
          "Conway 生命游戏把每个格子分为活或死，检查周围八个邻格。B3 表示死格恰有 3 个活邻居时出生；S23 表示活格有 2 或 3 个活邻居时存活，其他情况死亡。",
          "所有格子必须依据同一旧代同时更新，不能一边修改一边给后面的格子计数。初始图案决定演化：有些稳定不变，有些周期振荡，还有些图案会移动。"
        ],
        "sourceIds": [
          "gardner"
        ],
        "examples": [
          {
            "label": "闪烁器",
            "input": "三格水平活细胞：OOO，其他格都死",
            "output": "下一代变为竖直三格；再下一代恢复水平",
            "explanation": "端点各只有一个活邻居而死亡；中心存活，上下两个死格各有三个活邻居而出生。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "画出初始格子后用单步观察代数变化；导入 RLE 时，o 是活格，b 是死格，$ 换行，! 结束。",
          "本站采用 B3/S23，RLE 导入不支持任意生命类规则；理论网格与实际展示范围要分开理解。"
        ],
        "sourceIds": [
          "gardner",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站采用 B3/S23，RLE 导入不支持任意生命类规则；理论网格与实际展示范围要分开理解。"
    ]
  },
  {
    "id": "function-native:cube",
    "capabilityIds": [
      "native:cube"
    ],
    "relatedIds": [
      "native:cube"
    ],
    "topicGroup": "simulation",
    "title": "魔方模拟",
    "summary": "按面、方向与转角读公式，并通过逆序求撤销动作。",
    "aliases": [
      "魔方",
      "R",
      "U",
      "F",
      "转动记号",
      "逆公式"
    ],
    "sources": [
      {
        "id": "wca",
        "title": "WCA 规则中文译文：第12条记号",
        "publisher": "世界魔方协会 WCA",
        "url": "https://www.worldcubeassociation.org/regulations/translations/chinese/",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "12a1：面转动方向；英文原规则为准"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/round1/cube.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "魔方转动记号怎样描述面旋转",
        "paragraphs": [
          "三阶魔方面转动以 F、B、R、L、U、D 表示前、后、右、左、上、下。单字母表示面对该面观察时顺时针 90°，加撇号表示逆时针 90°，加 2 表示 180°。",
          "公式从左到右执行，次序通常不可交换。撤销一串动作时要反转动作顺序并逐个取逆；R 与 R′ 互为逆，R2 的逆仍是 R2。"
        ],
        "sourceIds": [
          "wca"
        ],
        "examples": [
          {
            "label": "两步动作的逆",
            "input": "R U",
            "output": "逆序为 U′ R′",
            "explanation": "先撤销最后的 U，再撤销先前的 R；R′ U′ 一般不能撤销 R U。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "保持明确的前面与上面，再输入公式或点选面转动；转动视角与实际旋转某层是不同动作。",
          "本站展示和执行支持的魔方动作，不保证任意变种符号都被解析，也不把可视化模拟当作最优解搜索。"
        ],
        "sourceIds": [
          "wca",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站展示和执行支持的魔方动作，不保证任意变种符号都被解析，也不把可视化模拟当作最优解搜索。"
    ]
  },
  {
    "id": "function-native:code",
    "capabilityIds": [
      "native:code"
    ],
    "relatedIds": [
      "native:code"
    ],
    "topicGroup": "programming",
    "title": "Brainfuck",
    "summary": "追踪指针、单元和循环，再把输出字节解释为字符。",
    "aliases": [
      "Brainfuck",
      "BF",
      "内存带",
      "八指令"
    ],
    "sources": [
      {
        "id": "bf",
        "title": "Yet another brainfuck reference",
        "publisher": "Brainfuck 文档作者 Brian Raiter",
        "url": "https://www.brainfuck.org/brainfuck.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "八指令、循环匹配与输入输出差异"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/coderunner/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "八条 Brainfuck 指令怎样操作内存带",
        "paragraphs": [
          "Brainfuck 只有 > < + - . , [ ] 八条核心指令：尖括号移动内存指针，加减改变当前单元，. 输出字节，, 读入字节；其他字符通常被忽略。内存单元初值为 0。",
          "[ 在当前单元为 0 时跳过匹配循环，] 在当前单元非 0 时回到循环继续执行。方括号必须正确嵌套，循环测试的是当前指针指向的单元，而不是某个固定变量。"
        ],
        "sourceIds": [
          "bf"
        ],
        "examples": [
          {
            "label": "由数字生成 ASCII",
            "input": "++++++++[>++++++++<-]>+.",
            "output": "A",
            "explanation": "循环将 8×8=64 加到右侧单元，移过去再加 1 得 65，. 将字节 65 输出为 A。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "用单步对照源码位置、指针与单元；只有看到 . 才出现输出，内存数值改变不代表文字已经输出。",
          "本站使用 8 位循环单元、不能越过左边界、输入结束读 0；这些实现约定可能与其他 Brainfuck 解释器不同。"
        ],
        "sourceIds": [
          "bf",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站使用 8 位循环单元、不能越过左边界、输入结束读 0；这些实现约定可能与其他 Brainfuck 解释器不同。"
    ]
  },
  {
    "id": "function-native:code-python",
    "capabilityIds": [
      "native:code-python"
    ],
    "relatedIds": [
      "native:code-python"
    ],
    "topicGroup": "programming",
    "title": "Python",
    "summary": "用 print 观察结果，区分解释器与浏览器运行环境。",
    "aliases": [
      "Python",
      "Python 3.13",
      "range",
      "缩进",
      "Pyodide"
    ],
    "sources": [
      {
        "id": "python",
        "title": "Python 3.13 官方教程：更多控制流工具",
        "publisher": "Python 软件基金会",
        "url": "https://docs.python.org/zh-cn/3.13/tutorial/controlflow.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "for、range 与函数定义"
      },
      {
        "id": "runtime",
        "title": "Pyodide 使用文档",
        "publisher": "Pyodide 官方项目",
        "url": "https://pyodide.org/en/stable/usage/index.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "浏览器中的 Python 运行环境"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/coderunner/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "Python 的对象、缩进和迭代怎样执行",
        "paragraphs": [
          "Python 用缩进界定复合语句的代码块，for 按序迭代列表、字符串或其他可迭代对象。变量名绑定对象，代码执行结果只有通过 print 等输出操作才显示为程序输出。",
          "range 的终点不包含在序列中，例如 range(3) 产生 0、1、2；range(1,4) 产生 1、2、3。本工具通过 Pyodide 在浏览器里运行 CPython，语言规则与运行环境可用 API 要分别理解。"
        ],
        "sourceIds": [
          "python",
          "runtime",
          "implementation"
        ],
        "examples": [
          {
            "label": "终点不包含",
            "input": "print(sum(range(1,4)))",
            "output": "6",
            "explanation": "range(1,4) 为 1、2、3，求和是 6，不包括 4。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "把需要读取的数据放到程序输入，通过 input() 读入；格式错误时先看异常位置，再核对缩进、字符串和类型。",
          "本站提供本地标准库环境，不提供 pip、联网、桌面窗口或系统子进程；不能把普通电脑上的全部 Python 能力套用到这里。"
        ],
        "sourceIds": [
          "python",
          "runtime",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站提供本地标准库环境，不提供 pip、联网、桌面窗口或系统子进程；不能把普通电脑上的全部 Python 能力套用到这里。"
    ]
  },
  {
    "id": "function-native:code-whitespace",
    "capabilityIds": [
      "native:code-whitespace"
    ],
    "relatedIds": [
      "native:code-whitespace"
    ],
    "topicGroup": "programming",
    "title": "Whitespace",
    "summary": "保留真实空白，把栈、前缀和二进制参数分开读。",
    "aliases": [
      "Whitespace",
      "空白编程",
      "Space",
      "Tab",
      "栈"
    ],
    "sources": [
      {
        "id": "author",
        "title": "Whitespace-JS：Usage 与 Notes",
        "publisher": "实际解释器作者 Susisu",
        "url": "https://raw.githubusercontent.com/susisu/Whitespace-JS/master/README.md",
        "language": "en",
        "kind": "official-doc",
        "locator": "32 位精度、终止指令与显形转换"
      },
      {
        "id": "engine",
        "title": "本站固定 Whitespace-JS 解析与虚拟机",
        "publisher": "Susisu · Whitespace-JS 随站版本",
        "url": "/vendor/coderunner/esoteric.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Whitespace 指令前缀、数字解析与栈执行"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/coderunner/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "空格、Tab 和换行怎样组成 Whitespace 指令",
        "paragraphs": [
          "本站 Whitespace 引擎只把空格、Tab 和换行作为语法字符，普通可见字符被忽略。指令由前缀和后续空白组合区分，分别操作栈、算术、堆、流程和输入输出。",
          "数字参数用空格表示二进制 0、Tab 表示 1，带符号并以换行结束；栈顶是最近压入的值。看起来“空白”的文本仍可能包含完整程序，自动整理缩进会改变它。"
        ],
        "sourceIds": [
          "author",
          "engine",
          "implementation"
        ],
        "examples": [
          {
            "label": "数字参数的显形读法",
            "input": "正号 S，数值位 T S T，终止 L（S=空格，T=Tab，L=换行）",
            "output": "参数值 +5",
            "explanation": "TST 对应二进制 101，即十进制 5；这是参数说明，显形字母本身不是可直接执行的原始程序。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "导入原始 .ws 文件或粘贴保留空白的代码，使用空白显形面板核对实际空格、Tab 和换行，再单步看栈与程序计数器。",
          "本站 Whitespace-JS 使用 32 位整数，和原始任意精度实现有区别；显形的 ·、→、↵ 不能直接替代原始空白字符执行。"
        ],
        "sourceIds": [
          "author",
          "engine",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站 Whitespace-JS 使用 32 位整数，和原始任意精度实现有区别；显形的 ·、→、↵ 不能直接替代原始空白字符执行。"
    ]
  },
  {
    "id": "function-native:code-sql",
    "capabilityIds": [
      "native:code-sql"
    ],
    "relatedIds": [
      "native:code-sql"
    ],
    "topicGroup": "programming",
    "title": "SQL / SQLite",
    "summary": "理解列、行、过滤与排序，区分查询和修改。",
    "aliases": [
      "SQL",
      "SQLite",
      "SELECT",
      "WHERE",
      "ORDER BY"
    ],
    "sources": [
      {
        "id": "sqlite",
        "title": "SQLite SELECT 官方文档",
        "publisher": "SQLite 项目",
        "url": "https://www.sqlite.org/lang_select.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "SELECT、WHERE、ORDER BY 与 LIMIT"
      },
      {
        "id": "expr",
        "title": "SQLite SQL Language Expressions",
        "publisher": "SQLite 项目",
        "url": "https://www.sqlite.org/lang_expr.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "表达式与字符串字面量"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/coderunner/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "SELECT 怎样把表数据筛成结果集",
        "paragraphs": [
          "SQLite 将数据组织成表，表有列和行。SELECT 指定结果表达式，FROM 指定输入，WHERE 过滤行，ORDER BY 指定返回顺序；没有 ORDER BY 就不能保证行按录入顺序返回。",
          "SELECT 本身不修改数据库；CREATE、INSERT、UPDATE 等语句会修改结构或数据。字符串通常使用单引号，SQL 的 NULL 表示缺失值，不能直接按普通数值或空字符串推理。"
        ],
        "sourceIds": [
          "sqlite",
          "expr"
        ],
        "examples": [
          {
            "label": "无需建表的表达式查询",
            "input": "SELECT 1 + 2 AS answer;",
            "output": "answer = 3",
            "explanation": "SELECT 可以直接返回表达式的一行结果；AS 为这一结果列起名。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "在空数据库建表并查询，或先打开 SQLite 文件；多语句用分号分隔，查看结果后下载需要保留的数据库。",
          "本站每次运行从导入的原文件重新开始，结果最多展示 10000 行；修改只存在于本次本地运行，不自动覆盖原文件。"
        ],
        "sourceIds": [
          "sqlite",
          "expr",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站每次运行从导入的原文件重新开始，结果最多展示 10000 行；修改只存在于本次本地运行，不自动覆盖原文件。"
    ]
  },
  {
    "id": "function-native:turing",
    "capabilityIds": [
      "native:turing"
    ],
    "relatedIds": [
      "native:turing"
    ],
    "topicGroup": "programming",
    "title": "图灵机",
    "summary": "按当前状态和符号确定写入、移动和下一状态。",
    "aliases": [
      "图灵机",
      "Turing",
      "状态",
      "转换表",
      "纸带"
    ],
    "sources": [
      {
        "id": "tm",
        "title": "Turing machine visualization：In more detail",
        "publisher": "图灵机模拟器原作者 Andy Li",
        "url": "https://turingmachine.io/",
        "language": "en",
        "kind": "official-doc",
        "locator": "Basics、Formal definition 与 Binary increment"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/turing/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "状态转换怎样让读写头操作纸带",
        "paragraphs": [
          "图灵机由有限状态、符号表、纸带和读写头组成。每一步用“当前状态＋当前格符号”查转换表，然后写一个符号、移动读写头、切到下一状态。未写入的纸带格使用指定空白符。",
          "纸带在数学模型中可无限延伸，但浏览器模拟必须有资源上限。本站规则可用 L、R、S 表示左移、右移、停留；没有适用转换时停机，这和进入无限循环是不同情况。"
        ],
        "sourceIds": [
          "tm",
          "implementation"
        ],
        "examples": [
          {
            "label": "跟踪一条转换",
            "input": "δ(scan,0)=(1,R,done)，当前格为 0",
            "output": "当前格改为 1；头右移一格；状态变为 done",
            "explanation": "写入、移动、改状态属于同一转移，不是三条独立输入字符。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "定义 blank、start state 和 table 后载入；用单步查看命中的规则、头位置、状态与纸带，再用撤销核对过程。",
          "本站有步数、纸带范围与历史上限；触及运行上限不等于数学上已证明该机器永不停机。"
        ],
        "sourceIds": [
          "tm",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站有步数、纸带范围与历史上限；触及运行上限不等于数学上已证明该机器永不停机。"
    ]
  },
  {
    "id": "function-native:code-befunge",
    "capabilityIds": [
      "native:code-befunge"
    ],
    "relatedIds": [
      "native:code-befunge"
    ],
    "topicGroup": "programming",
    "title": "Befunge-93",
    "summary": "保留程序布局，用箭头改变执行方向并按栈计算。",
    "aliases": [
      "Befunge-93",
      "二维语言",
      "栈",
      "箭头"
    ],
    "sources": [
      {
        "id": "befunge",
        "title": "Befunge-93 Documentation",
        "publisher": "原作者 Chris Pressey · Cat’s Eye Technologies",
        "url": "https://catseye.tc/view/Befunge-93/doc/Befunge-93.markdown",
        "language": "en",
        "kind": "author-spec",
        "locator": "80×25 环绕空间、栈、指令方向与输出"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/coderunner/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "二维指令指针和栈怎样运行 Befunge-93",
        "paragraphs": [
          "Befunge-93 把源码放在 80×25 二维字符网格上，指令指针从左上角向右出发。>、<、^、v 改变方向，越过网格边界会绕回对侧，所以空格与换行都属于程序布局。",
          "数字 0–9 压入栈，+ 等从栈顶取数计算，. 输出整数，, 输出字符，@ 停机。双引号切换字符串模式，把沿途字符的 ASCII 值压栈；栈是后进先出。"
        ],
        "sourceIds": [
          "befunge"
        ],
        "examples": [
          {
            "label": "栈计算",
            "input": "23+.@",
            "output": "5 后接空格，然后停机",
            "explanation": "依次压入 2、3，+ 弹出两数再压入 5，. 输出栈顶，@ 结束。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "粘贴时保持原排列，单步同时查看网格位置、运动方向和栈；不要把按二维路径读取的源码强行压成一行。",
          "本站使用 Befunge-93，源码最多 80 列×25 行；除以零、越界 g/p 等情况按本站引擎报错，不采用 Funge-98 扩展。"
        ],
        "sourceIds": [
          "befunge",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站使用 Befunge-93，源码最多 80 列×25 行；除以零、越界 g/p 等情况按本站引擎报错，不采用 Funge-98 扩展。"
    ]
  },
  {
    "id": "function-native:code-deadfish",
    "capabilityIds": [
      "native:code-deadfish"
    ],
    "relatedIds": [
      "native:code-deadfish"
    ],
    "topicGroup": "programming",
    "title": "Deadfish",
    "summary": "按加减、平方和十进制输出跟踪值。",
    "aliases": [
      "Deadfish",
      "累计器",
      "i d s o",
      "平方"
    ],
    "sources": [
      {
        "id": "engine",
        "title": "Esolang Park 的 Deadfish 解释器与单步核心",
        "publisher": "实际引擎作者 nilaymaj · 随站固定提交",
        "url": "/vendor/coderunner/esoteric.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Deadfish：value、i/d/s/o 与边界重置"
      },
      {
        "id": "model",
        "title": "本站 Deadfish 运行约定",
        "publisher": "迷雾工具箱",
        "url": "/coderunner/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "Deadfish 命令说明及输出类型"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/coderunner/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      },
      {
        "id": "author-readme",
        "title": "Deadfish：固定实现的作者说明",
        "publisher": "Esolang Park 维护者",
        "url": "/vendor/knowledge/esolang-park/languages/deadfish/README.md",
        "language": "en",
        "kind": "author-spec",
        "locator": "Command list；无条件与循环；仅说明该项目实现，非统一语言标准",
        "upstreamUrl": "https://raw.githubusercontent.com/nilaymaj/esolang-park/d84b21c333dc4ce417e0841145d69f04de1a4e2e/languages/deadfish/README.md",
        "license": "MIT",
        "licenseUrl": "/vendor/knowledge/esolang-park/LICENSE.txt",
        "mirroredCommit": "d84b21c333dc4ce417e0841145d69f04de1a4e2e"
      }
    ],
    "sections": [
      {
        "title": "一个累计器怎样用四条命令生成数字",
        "paragraphs": [
          "本站 Deadfish 执行器从一个初值 0 的累计器开始：i 加一，d 减一，s 平方，o 输出当前十进制值。它没有普通变量名，也没有读取用户输入的命令。",
          "平方会快速增长数值；该引擎在值恰好等于 −1 或 256 时重置为 0，而不是把一切大于 255 的数都取模。o 输出数字，不会自动按 ASCII 转成字符。"
        ],
        "sourceIds": [
          "engine",
          "model",
          "implementation",
          "author-readme"
        ],
        "examples": [
          {
            "label": "两次加一再平方",
            "input": "iiso",
            "output": "4",
            "explanation": "0→1→2→4，最后 o 输出十进制 4；它不是 ASCII 值 4 的字符。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "单步比较命令位置与累计器；若题目给的是字符编码，先得到完整数字输出，再明确选择 ASCII 等转换工具。",
          "这篇说明的是本站固定 Deadfish 引擎行为，不声称存在统一国际语言标准；不要把其他变种的字符输出或额外命令套用到它。"
        ],
        "sourceIds": [
          "engine",
          "model",
          "implementation",
          "author-readme"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "这篇说明的是本站固定 Deadfish 引擎行为，不声称存在统一国际语言标准；不要把其他变种的字符输出或额外命令套用到它。"
    ]
  },
  {
    "id": "function-native:code-javascript",
    "capabilityIds": [
      "native:code-javascript"
    ],
    "relatedIds": [
      "native:code-javascript"
    ],
    "topicGroup": "programming",
    "title": "JavaScript",
    "summary": "区分数字相加与字符串拼接，并从输出观察结果。",
    "aliases": [
      "JavaScript",
      "JS",
      "QuickJS",
      "数组",
      "类型"
    ],
    "sources": [
      {
        "id": "mdn",
        "title": "JavaScript 指南：语法与类型",
        "publisher": "MDN 官方中文文档",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Grammar_and_types",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "变量声明、数据类型与字面量"
      },
      {
        "id": "quickjs",
        "title": "QuickJS 官方文档",
        "publisher": "QuickJS 作者 Fabrice Bellard",
        "url": "https://bellard.org/quickjs/quickjs.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "JavaScript 语言与嵌入环境"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/coderunner/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "JavaScript 的值、数组和表达式怎样求值",
        "paragraphs": [
          "JavaScript 表达式计算值，let、const 声明名称绑定，数组按从 0 开始的索引保存元素。程序的运行环境决定哪些 API 存在，语言支持 JavaScript 并不代表它就是浏览器页面脚本。",
          "+ 在两个数值间进行加法，遇到字符串会参与字符串拼接；例如 1+2 为 3，而 \"1\"+2 得 \"12\"。解谜处理数字串时，要先明确它是文字还是数值。"
        ],
        "sourceIds": [
          "mdn",
          "quickjs"
        ],
        "examples": [
          {
            "label": "从码值生成字母",
            "input": "console.log(String.fromCharCode(65,82,71));",
            "output": "ARG",
            "explanation": "65、82、71 都位于 ASCII 范围，分别对应 A、R、G；此例不涵盖所有 Unicode 码点。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "用 console.log 或 print 输出结果；readline 按行读取程序输入，stdin 保存完整输入，错误信息用于定位语法与类型问题。",
          "本站用独立 QuickJS 引擎，没有 DOM、网络或 Node.js API；网页中的 document、fetch 和 require 不能假设存在。"
        ],
        "sourceIds": [
          "mdn",
          "quickjs",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站用独立 QuickJS 引擎，没有 DOM、网络或 Node.js API；网页中的 document、fetch 和 require 不能假设存在。"
    ]
  },
  {
    "id": "function-native:code-lua",
    "capabilityIds": [
      "native:code-lua"
    ],
    "relatedIds": [
      "native:code-lua"
    ],
    "topicGroup": "programming",
    "title": "Lua",
    "summary": "理解 table、从 1 开始的序列与 ipairs 遍历。",
    "aliases": [
      "Lua",
      "Lua 5.4",
      "table",
      "ipairs",
      "local"
    ],
    "sources": [
      {
        "id": "lua",
        "title": "Lua 5.4 Reference Manual",
        "publisher": "Lua 官方作者团队",
        "url": "https://www.lua.org/manual/5.4/manual.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "§3.4.9 Table Constructors；§6.1 ipairs、print"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/coderunner/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "Lua 的表、顺序与循环怎样处理数据",
        "paragraphs": [
          "Lua 用 table 同时表达映射和序列；构造 {10,20,30} 时自动给顺序项使用 1、2、3 键。local 声明局部变量，.. 连接字符串，print 将参数输出。",
          "ipairs 按整数键从 1 开始依次遍历，遇第一个不存在的值停止。表中有空洞时，#t 不一定等于所有已保存项数量，所以缺失值与序列长度需要分开看。"
        ],
        "sourceIds": [
          "lua"
        ],
        "examples": [
          {
            "label": "遍历一段连续序列",
            "input": "local a={2,4,6}\nlocal s=0\nfor _,v in ipairs(a) do s=s+v end\nprint(s)",
            "output": "12",
            "explanation": "ipairs 读取键 1、2、3 的值，累计得到 2+4+6=12。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "使用 print 或 io.write 输出，程序输入由 io.read 读取；比较字节串时，Lua 字符串长度默认计字节而非可见汉字数量。",
          "本站运行 Lua 5.4；文件位于本次虚拟环境，不提供系统命令或网络，不能依赖电脑安装的任意外部 Lua 模块。"
        ],
        "sourceIds": [
          "lua",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站运行 Lua 5.4；文件位于本次虚拟环境，不提供系统命令或网络，不能依赖电脑安装的任意外部 Lua 模块。"
    ]
  },
  {
    "id": "function-native:code-malbolge",
    "capabilityIds": [
      "native:code-malbolge"
    ],
    "relatedIds": [
      "native:code-malbolge"
    ],
    "topicGroup": "programming",
    "title": "Malbolge",
    "summary": "从三进制机器、A/C/D 寄存器与指令变换理解程序。",
    "aliases": [
      "Malbolge",
      "三进制",
      "自修改",
      "A C D"
    ],
    "sources": [
      {
        "id": "spec",
        "title": "Malbolge Specification（原始规范存档）",
        "publisher": "语言原作者 Ben Olmstead；Lou Scheffer 保存",
        "url": "https://www.lscheffer.com/malbolge_spec.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "Environment、Commands；作者声明公共领域"
      },
      {
        "id": "analysis",
        "title": "Programming in Malbolge",
        "publisher": "研究者 Lou Scheffer 原始分析",
        "url": "https://www.lscheffer.com/malbolge.shtml",
        "language": "en",
        "kind": "author-spec",
        "locator": "执行后改写与跳转的次序"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/coderunner/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "地址相关指令与自修改怎样运行 Malbolge",
        "paragraphs": [
          "标准 Malbolge 使用十个三进制位的无符号机器字，范围 0–59048，内存有 59049 个字。A 是累计器，C 是代码指针，D 是数据指针；程序和数据共用同一内存。",
          "指令含义不仅取决于字符，也取决于地址；执行之后还会通过置换表改写指令。因此同一字符在不同位置、或第二次被执行时，可能产生不同操作，普通逐字符替换不足以解释它。"
        ],
        "sourceIds": [
          "spec",
          "analysis"
        ],
        "examples": [
          {
            "label": "机器字取值范围",
            "input": "一个机器字有 10 个三进制位",
            "output": "3^10=59049 种值；最大值为 59048",
            "explanation": "从全 0 到全 2 共 59049 个不同字，不能把它当作十位二进制整数。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "加载标准源码，使用单步查看 A、C、D 与邻近内存；同时区分原始 Malbolge 字符和为便于人读而写的规范化表示。",
          "本站执行标准源码，输入结束值为 59048，不自动把规范化代码当作原始代码执行；资源限制导致停止不能证明理论停机性质。"
        ],
        "sourceIds": [
          "spec",
          "analysis",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站执行标准源码，输入结束值为 59048，不自动把规范化代码当作原始代码执行；资源限制导致停止不能证明理论停机性质。"
    ]
  },
  {
    "id": "function-native:code-ook",
    "capabilityIds": [
      "native:code-ook"
    ],
    "relatedIds": [
      "native:code-ook"
    ],
    "topicGroup": "programming",
    "title": "Ook!",
    "summary": "按两个词一组还原内存指针、算术与循环动作。",
    "aliases": [
      "Ook!",
      "Ook.",
      "Ook?",
      "Brainfuck",
      "成对指令"
    ],
    "sources": [
      {
        "id": "ook",
        "title": "Ook!：Language Concepts and Commands",
        "publisher": "语言原作者 David Morgan-Mar",
        "url": "https://www.dangermouse.net/esoteric/ook.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "三个语法元素与两词命令映射"
      },
      {
        "id": "implementation",
        "title": "本站功能实现与适用范围",
        "publisher": "迷雾工具箱",
        "url": "/coderunner/model.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "当前随站版本；核对输入、输出与实现边界"
      }
    ],
    "sections": [
      {
        "title": "成对 Ook 标记怎样对应 Brainfuck 指令",
        "paragraphs": [
          "Ook! 使用 Ook.、Ook?、Ook! 三种标记，每两个组成一条命令。Ook. Ook. 对应 +，Ook. Ook? 对应 >，Ook? Ook. 对应 <；词数必须成对。",
          "这些命令映射到 Brainfuck 的内存带模型。Ook! Ook. 输出当前字节，Ook. Ook! 读输入；Ook! Ook? 与 Ook? Ook! 是匹配循环起止，需要像方括号一样正确嵌套。"
        ],
        "sourceIds": [
          "ook"
        ],
        "examples": [
          {
            "label": "两词组成一条动作",
            "input": "Ook. Ook. Ook. Ook?",
            "output": "Brainfuck：+>",
            "explanation": "前两词把当前单元加 1，后两词把指针右移；不是把每个 Ook 单独当作一条指令。"
          }
        ]
      },
      {
        "title": "怎样阅读与验证结果",
        "paragraphs": [
          "保留标点与配对顺序，单步查看对应源码位置和内存；词形相同而标点不同就是不同语法。",
          "本站 Ook! 转换层只接受八种有效命令对，Ook? Ook? 被拒绝；内存规则与本站 Brainfuck 相同，不实现原作者的幽默“banana”动作。"
        ],
        "sourceIds": [
          "ook",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": [
      "本站 Ook! 转换层只接受八种有效命令对，Ook? Ook? 被拒绝；内存规则与本站 Brainfuck 相同，不实现原作者的幽默“banana”动作。"
    ]
  }
];
