// Function-specific lessons with primary references and unaltered pinned source mirrors.
export const articles = [
  {
    "id": "function-op:ROT13",
    "capabilityIds": [
      "op:ROT13"
    ],
    "relatedIds": [
      "op:ROT13"
    ],
    "topicGroup": "classical",
    "title": "凯撒移位（ROT13）",
    "summary": "字母按指定步长循环移动，13 步恰为 26 字母的一半。",
    "aliases": [
      "ROT13",
      "模 26 字母移位"
    ],
    "sources": [
      {
        "id": "rot13",
        "title": "ROT13 中文算法说明",
        "publisher": "DenCode（该转换器作者文档）",
        "url": "https://dencode.com/zh-cn/cipher/rot13",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "关于该算法"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "ROT13"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "把 A–Z 编为 0–25，位移 s 后得到 (x+s) mod 26；解码减去 s。标准 ROT13 固定 s=13，因此连续应用两次回到原字母。"
        ],
        "sourceIds": [
          "rot13",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "ARG，Amount=13",
            "output": "NET",
            "explanation": "A→N、R→E、G→T；再执行 13 步得到 ARG。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站保留小写、大写和数字三个处理开关，以及 Amount 位移参数；数字开关针对 0–9 的独立循环。",
          "ROT13 隐藏阅读而不提供密钥保密；换成其他步长时，再执行相同步长通常不能还原。"
        ],
        "sourceIds": [
          "engine",
          "rot13"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Vigen%C3%A8re%20Encode",
    "capabilityIds": [
      "pair:Vigen%C3%A8re%20Encode"
    ],
    "relatedIds": [
      "pair:Vigen%C3%A8re%20Encode"
    ],
    "topicGroup": "classical",
    "title": "维吉尼亚",
    "summary": "重复关键词使每个位置使用不同凯撒位移。",
    "aliases": [
      "Vigenère Encode",
      "Vigenère Decode",
      "按循环密钥逐字母相加"
    ],
    "sources": [
      {
        "id": "pku",
        "title": "密码学课件：置换密码与维吉尼亚密码",
        "publisher": "北京大学信息科学技术学院",
        "url": "https://www.icst.pku.edu.cn/zlian/docs/20181023161806486415.pdf",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "第 2–6 页"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Vigenère Encode / Vigenère Decode"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "将明文字母和关键词字母分别映射为 0–25，以 cᵢ=(pᵢ+kᵢ) mod 26 编码，以 pᵢ=(cᵢ−kᵢ) mod 26 解码；关键词不足时循环使用。"
        ],
        "sourceIds": [
          "pku",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "ARG，关键词 KEY",
            "output": "KVE",
            "explanation": "0+10=10(K)，17+4=21(V)，6+24=30≡4(E)。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key 是字母关键词，不是现代加密的任意二进制密钥；编码和解码必须使用相同关键词。",
          "关键词重复使同一位置余数的字母共享位移，可用重复串间隔和重合指标估计周期。"
        ],
        "sourceIds": [
          "engine",
          "pku"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Rail%20Fence%20Cipher%20Encode",
    "capabilityIds": [
      "pair:Rail%20Fence%20Cipher%20Encode"
    ],
    "relatedIds": [
      "pair:Rail%20Fence%20Cipher%20Encode"
    ],
    "topicGroup": "classical",
    "title": "栅栏密码",
    "summary": "字符沿多行栅栏往返，最后逐行读出。",
    "aliases": [
      "Rail Fence Cipher Encode",
      "Rail Fence Cipher Decode",
      "沿之字轨迹重排位置"
    ],
    "sources": [
      {
        "id": "rail-fence",
        "title": "Rail Fence 中文算法说明",
        "publisher": "DenCode（该转换器作者文档）",
        "url": "https://dencode.com/zh-cn/cipher/rail-fence",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "关于该算法"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Rail Fence Cipher Encode / Rail Fence Cipher Decode"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "从第一栏向下依次写字符，到最底栏后向上折返，再循环。编码按栏连接字符；解码先恢复各栏占用的槽位，再沿原轨迹取字符。"
        ],
        "sourceIds": [
          "rail-fence",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "ARGTOOL，2 栏，偏移 0",
            "output": "AGOLRTO",
            "explanation": "第一栏收位置 0、2、4、6 得 AGOL，第二栏收 1、3、5 得 RTO。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key 表示栏数；Offset 改变在往返周期中的起始位置。两端必须对栏数与偏移作相同约定。",
          "这是换位而不是字母替换，原字符的数量不变；它不同于中文题目中常见的等距分组读列版本。"
        ],
        "sourceIds": [
          "engine",
          "rail-fence"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Enigma",
    "capabilityIds": [
      "op:Enigma"
    ],
    "relatedIds": [
      "op:Enigma"
    ],
    "topicGroup": "classical",
    "title": "恩尼格玛密码机",
    "summary": "每次按键改变转子位置，电流经过反射器再返回。",
    "aliases": [
      "Enigma",
      "转子、反射器与逐键步进"
    ],
    "sources": [
      {
        "id": "enigma",
        "title": "Enigma working principle",
        "publisher": "Crypto Museum（设备复原研究）",
        "url": "https://www.cryptomuseum.com/crypto/enigma/working.htm",
        "language": "en",
        "kind": "author-spec",
        "locator": "Working principle / cipher wheels"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Enigma"
      },
      {
        "id": "bombe-guide",
        "title": "Enigma, the Bombe, and Typex",
        "publisher": "GCHQ CyberChef 操作作者",
        "url": "https://github.com/gchq/CyberChef/wiki/Enigma,-the-Bombe,-and-Typex/ed7ab8b92789111139fb98d23a9bf2249311b6a7",
        "language": "en",
        "kind": "official-doc",
        "locator": "Cribs / menus / loops / checking machine"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "字母先经插线板和转子映射，再经反射器走反向路径返回；按键造成转子步进，所以同一字母在不同位置可得到不同输出。反射器让正确初始设置下的加密过程也可解密。"
        ],
        "sourceIds": [
          "enigma",
          "engine",
          "bombe-guide"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "转子 I 的固定接线表，输入 A",
            "output": "单个转子接线映射为 E",
            "explanation": "这里只展示接线表的第一项，并非整台机器的输出；转子偏移、其它转子和反射器仍要继续参与。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Model、转子顺序、Ring setting、Initial value、Reflector 和 Plugboard 分别规定机器结构及初始状态，解密前须复原整组参数。",
          "环设置不同于窗口起始字母；普通军用型号不把字母加密成自己，中间转子存在连续两次步进。"
        ],
        "sourceIds": [
          "engine",
          "enigma",
          "bombe-guide"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Atbash%20Cipher",
    "capabilityIds": [
      "op:Atbash%20Cipher"
    ],
    "relatedIds": [
      "op:Atbash%20Cipher"
    ],
    "topicGroup": "classical",
    "title": "埃特巴什密码",
    "summary": "A↔Z、B↔Y 的反向字母表替换。",
    "aliases": [
      "Atbash Cipher",
      "把字母表首尾配对"
    ],
    "sources": [
      {
        "id": "atbash",
        "title": "Atbash 中文算法说明",
        "publisher": "DenCode（该转换器作者文档）",
        "url": "https://dencode.com/zh-cn/cipher/atbash",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "关于该算法"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Atbash Cipher"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "在本站拉丁字母实现中，字母序号 x 映射为 25−x；表首与表尾成对交换。因此再做一次相同替换便回到原字母。"
        ],
        "sourceIds": [
          "atbash",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "ARG",
            "output": "ZIT",
            "explanation": "A→Z、R→I、G→T；输出的字符顺序保持原位。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "该操作不要求关键词；本站实现的是拉丁字母版本，不能把其表直接当成希伯来文的原始字母表。",
          "这是固定单表替换，字母频率只是改了标签；不是把整段文本倒序。"
        ],
        "sourceIds": [
          "engine",
          "atbash"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Multiple%20Bombe",
    "capabilityIds": [
      "op:Multiple%20Bombe"
    ],
    "relatedIds": [
      "op:Multiple%20Bombe"
    ],
    "topicGroup": "classical",
    "title": "多机恩尼格玛破译",
    "summary": "在多组转子顺序与反射器上重复运行 Bombe 筛选。",
    "aliases": [
      "Multiple Bombe",
      "枚举未知转子配置"
    ],
    "sources": [
      {
        "id": "bombe",
        "title": "Bombe: Breaking the Enigma cipher",
        "publisher": "Crypto Museum（设备复原研究）",
        "url": "https://www.cryptomuseum.com/crypto/bombe/",
        "language": "en",
        "kind": "author-spec",
        "locator": "Working principle / cipher wheels"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Multiple Bombe"
      },
      {
        "id": "bombe-guide",
        "title": "Enigma, the Bombe, and Typex",
        "publisher": "GCHQ CyberChef 操作作者",
        "url": "https://github.com/gchq/CyberChef/wiki/Enigma,-the-Bombe,-and-Typex/ed7ab8b92789111139fb98d23a9bf2249311b6a7",
        "language": "en",
        "kind": "official-doc",
        "locator": "Cribs / menus / loops / checking machine"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Bombe 使用已知明文片段与密文字母的关系检查候选机器设置。多机版本把待试的转子组合和反射器集合展开，分别执行同一约束筛选。"
        ],
        "sourceIds": [
          "bombe",
          "engine",
          "bombe-guide"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "可选 5 个不同转子，每次放 3 个，固定 1 个反射器",
            "output": "5×4×3=60 种转子顺序",
            "explanation": "这是顺序数量；每种顺序内仍有大量起始位置要检查。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "先用单次 Bombe 验证 Crib 和偏移；Main rotors、4th rotor、Reflectors 列表定义搜索范围，Use checking machine 再过滤停止点。",
          "输出是候选转子起点和部分插线约束，不是自动得到整段明文，也不会自动补齐未知插线。"
        ],
        "sourceIds": [
          "engine",
          "bombe",
          "bombe-guide"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Bombe",
    "capabilityIds": [
      "op:Bombe"
    ],
    "relatedIds": [
      "op:Bombe"
    ],
    "topicGroup": "classical",
    "title": "恩尼格玛破译机",
    "summary": "从猜测明文片段的闭环关系排除不可能的 Enigma 设置。",
    "aliases": [
      "Bombe",
      "用已知明文构造字母约束环"
    ],
    "sources": [
      {
        "id": "bombe",
        "title": "Bombe: Breaking the Enigma cipher",
        "publisher": "Crypto Museum（设备复原研究）",
        "url": "https://www.cryptomuseum.com/crypto/bombe/",
        "language": "en",
        "kind": "author-spec",
        "locator": "Working principle / cipher wheels"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Bombe"
      },
      {
        "id": "bombe-guide",
        "title": "Enigma, the Bombe, and Typex",
        "publisher": "GCHQ CyberChef 操作作者",
        "url": "https://github.com/gchq/CyberChef/wiki/Enigma,-the-Bombe,-and-Typex/ed7ab8b92789111139fb98d23a9bf2249311b6a7",
        "language": "en",
        "kind": "official-doc",
        "locator": "Cribs / menus / loops / checking machine"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "把明文片段与密文按指定偏移对齐，形成字母之间的约束图，闭环称为 menu 中的 loops。检查候选转子状态是否能同时满足这些连线，矛盾即排除。"
        ],
        "sourceIds": [
          "bombe",
          "engine",
          "bombe-guide"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "密文 ABC，与明文 CAB 对齐",
            "output": "A↔C、B↔A、C↔B，组成 A–C–B–A 环",
            "explanation": "三个对应关系共享字母，构成一个可用于一致性筛选的闭环。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Crib 是确知或猜测的明文片段；Crib offset 是对应密文起点。本站说明特别指出搜索不模拟中间转子在片段中的步进。",
          "片段越长越可能跨越步进；没有得到答案可能是猜测错误或位置不合适。停止点仍需人工补全并验证插线。"
        ],
        "sourceIds": [
          "engine",
          "bombe",
          "bombe-guide"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Affine%20Cipher%20Encode",
    "capabilityIds": [
      "pair:Affine%20Cipher%20Encode"
    ],
    "relatedIds": [
      "pair:Affine%20Cipher%20Encode"
    ],
    "topicGroup": "classical",
    "title": "仿射密码",
    "summary": "用 c=(ap+b) mod 26 进行单表替换。",
    "aliases": [
      "Affine Cipher Encode",
      "Affine Cipher Decode",
      "线性映射与模逆元"
    ],
    "sources": [
      {
        "id": "affine",
        "title": "Affine 中文算法说明",
        "publisher": "DenCode（该转换器作者文档）",
        "url": "https://dencode.com/zh-cn/cipher/affine",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "关于该算法"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Affine Cipher Encode / Affine Cipher Decode"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "把字母转为 0–25，乘 a 再加 b，最后取模 26。解码需要 a 的模逆元 a⁻¹，计算 p=a⁻¹(c−b) mod 26。只有 gcd(a,26)=1 时映射可逆。"
        ],
        "sourceIds": [
          "affine",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "ARG，a=5，b=8",
            "output": "IPM",
            "explanation": "0→8(I)，17→93 mod 26=15(P)，6→38 mod 26=12(M)；5 的模逆元是 21。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "a 和 b 为两项整数参数；a=1 时退化为凯撒移位。编码和解码保持同一组 a、b。",
          "a=2 会把不同字母压到同一结果，不能恢复；不能只通过把 a 改成负数来解密。"
        ],
        "sourceIds": [
          "engine",
          "affine"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Colossus",
    "capabilityIds": [
      "op:Colossus"
    ],
    "relatedIds": [
      "op:Colossus"
    ],
    "topicGroup": "classical",
    "title": "巨人密码破译机",
    "summary": "使用位逻辑与统计计数寻找 Lorenz 轮设置。",
    "aliases": [
      "Colossus",
      "对电传密文作差分与计数"
    ],
    "sources": [
      {
        "id": "colossus",
        "title": "Colossus",
        "publisher": "Crypto Museum（设备复原研究）",
        "url": "https://www.cryptomuseum.com/crypto/colossus/",
        "language": "en",
        "kind": "author-spec",
        "locator": "Working principle / cipher wheels"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Colossus"
      },
      {
        "id": "colossus-guide",
        "title": "Colossus",
        "publisher": "GCHQ CyberChef / VirtualColossus 作者",
        "url": "https://github.com/gchq/CyberChef/wiki/Colossus",
        "language": "en",
        "kind": "official-doc",
        "locator": "Setting Colossus inputs / delta / Q bus"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Colossus 针对 Lorenz 电传密码，不针对 Enigma。输入五位电传序列，按 Z、χ、ψ 及相邻字符的差分构成逻辑条件，并统计条件成立的次数，比较候选轮起点。"
        ],
        "sourceIds": [
          "colossus",
          "engine",
          "colossus-guide"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "相邻五位码 00101 与 00111",
            "output": "异或差分 Δ=00010",
            "explanation": "逐位不同处为 1，相同处为 0；这是 Δ 序列的构造例，不是完整破解结果。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "QBus 选择原序列或 Δ 差分；K Rack 选择条件与计数器，模式和轮起点须与待分析序列一致。",
          "高计数只是统计线索，不能当成完整明文；原设备与本地模拟的可配置范围应分开理解。"
        ],
        "sourceIds": [
          "engine",
          "colossus",
          "colossus-guide"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Caesar%20Box%20Cipher",
    "capabilityIds": [
      "op:Caesar%20Box%20Cipher"
    ],
    "relatedIds": [
      "op:Caesar%20Box%20Cipher"
    ],
    "topicGroup": "classical",
    "title": "凯撒方阵密码",
    "summary": "重新排列字符位置，不改变字母本身。",
    "aliases": [
      "Caesar Box Cipher",
      "按固定跨度读取方阵"
    ],
    "sources": [
      {
        "id": "box-source",
        "title": "CyberChef 11.5.0 固定源码 — CaesarBoxCipher",
        "publisher": "GCHQ CyberChef",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/CaesarBoxCipher.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run(): stride tableHeight",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/CaesarBoxCipher.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Caesar Box Cipher"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "本站操作移除普通空格后，以 Box Height 为跨度：先取索引 0、h、2h…，再取 1、1+h…，依次连接。它的实际读取方向由这个跨度定义。"
        ],
        "sourceIds": [
          "box-source",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "ABCD，Box Height=2",
            "output": "ACBD",
            "explanation": "第一轮取 A、C，第二轮取 B、D；这是本站实现的精确输出。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Box Height 是整数跨度；默认 1 时保持字符顺序。说明中常用方阵或长方阵解释此种换位，但必须按实际实现的读写方向比对题目。",
          "不能把它和凯撒字母移位混用；删除空格后，原来的分词空格不再可还原。"
        ],
        "sourceIds": [
          "engine",
          "box-source"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:ROT47",
    "capabilityIds": [
      "op:ROT47"
    ],
    "relatedIds": [
      "op:ROT47"
    ],
    "topicGroup": "classical",
    "title": "可打印字符移位（ROT47）",
    "summary": "在 ASCII ! 到 ~ 的连续范围内移动 47 格。",
    "aliases": [
      "ROT47",
      "在 94 个可打印字符中循环"
    ],
    "sources": [
      {
        "id": "rot47",
        "title": "ROT47 中文算法说明",
        "publisher": "DenCode（该转换器作者文档）",
        "url": "https://dencode.com/zh-cn/cipher/rot47",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "关于该算法"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "ROT47"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "!–~ 共 94 个字符，映射公式是 33+((code−33+47) mod 94)。因为 47 是范围长度的一半，同一变换应用两次可以还原。"
        ],
        "sourceIds": [
          "rot47",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "A0!",
            "output": "p_P",
            "explanation": "A 的 ASCII 65 转为 112(p)，0 的 48 转为 95(_)，! 的 33 转为 80(P)。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "此工具面向可打印 ASCII；空格和换行不属于 !–~ 范围。中文不应按同一 94 字符表解释。",
          "它会把字母、数字和标点互相转成对方，不能把看起来像标点的结果判为损坏。"
        ],
        "sourceIds": [
          "engine",
          "rot47"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Lorenz",
    "capabilityIds": [
      "op:Lorenz"
    ],
    "relatedIds": [
      "op:Lorenz"
    ],
    "topicGroup": "classical",
    "title": "洛伦兹密码机",
    "summary": "把五位明文与 χ、ψ 两组轮产生的密钥流组合。",
    "aliases": [
      "Lorenz",
      "五位电传码与两组轮流异或"
    ],
    "sources": [
      {
        "id": "lorenz",
        "title": "Lorenz SZ-40/42",
        "publisher": "Crypto Museum（设备复原研究）",
        "url": "https://www.cryptomuseum.com/crypto/lorenz/sz40/",
        "language": "en",
        "kind": "author-spec",
        "locator": "Working principle / cipher wheels"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Lorenz"
      },
      {
        "id": "lorenz-guide",
        "title": "Lorenz SZ",
        "publisher": "GCHQ CyberChef / VirtualColossus 作者",
        "url": "https://github.com/gchq/CyberChef/wiki/Lorenz-SZ",
        "language": "en",
        "kind": "official-doc",
        "locator": "Chi/Psi/Motor wheels / ITA2 / enciphering"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Lorenz 对电传字符的五个通道逐位异或：密文 Z=P⊕χ⊕ψ。五个 χ 轮、五个 ψ 轮和两个控制轮决定密钥流，控制轮使 ψ 轮不规则步进。"
        ],
        "sourceIds": [
          "lorenz",
          "engine",
          "lorenz-guide"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "P=00101，合成密钥流 χ⊕ψ=10110",
            "output": "Z=10011",
            "explanation": "00101⊕10110=10011；再与 10110 异或得到原五位明文。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "轮图样与起点必须全部相同，字符还需遵从电传字母/数字换档；不同限制模式会改变步进条件。",
          "它不是字母表上的 Enigma 转子替换；同一密钥流重复使用会使两段密文的异或暴露明文之间的关系。"
        ],
        "sourceIds": [
          "engine",
          "lorenz",
          "lorenz-guide"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Bacon%20Cipher%20Encode",
    "capabilityIds": [
      "pair:Bacon%20Cipher%20Encode"
    ],
    "relatedIds": [
      "pair:Bacon%20Cipher%20Encode"
    ],
    "topicGroup": "classical",
    "title": "培根密码",
    "summary": "用 A/B、粗细或其它两类外观隐藏五位代码。",
    "aliases": [
      "Bacon Cipher Encode",
      "Bacon Cipher Decode",
      "每个字母表示为五个二选一符号"
    ],
    "sources": [
      {
        "id": "bacon-source",
        "title": "CyberChef 11.5.0 固定源码 — BaconCipherEncode",
        "publisher": "GCHQ CyberChef / Karsten Silkenbäumer",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/BaconCipherEncode.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "Alphabet / Translation / 5-bit groups",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/BaconCipherEncode.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Bacon Cipher Encode / Bacon Cipher Decode"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "先把字母映射为五位二进制，再把 0、1 表示成两种外观；每连续五项组成一个字母。原始合并表把 I/J 与 U/V 合并，完整表则保留 26 个字母。"
        ],
        "sourceIds": [
          "bacon-source",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "Complete 字母表，输入 A、B",
            "output": "00000 00001（或 AAAAA AAAAB）",
            "explanation": "A 的序号为 0，B 为 1；各自补足五位后再换成外观标记。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Alphabet 选择 Standard 或 Complete；Translation 选择 0/1 或 A/B；Invert Translation 交换两类符号，Keep extra characters 决定是否保留非代码字符。",
          "二类外观的真实含义必须统一；合并表解码无法区分 I 与 J、U 与 V。"
        ],
        "sourceIds": [
          "engine",
          "bacon-source"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:ROT47%20Brute%20Force",
    "capabilityIds": [
      "op:ROT47%20Brute%20Force"
    ],
    "relatedIds": [
      "op:ROT47%20Brute%20Force"
    ],
    "topicGroup": "classical",
    "title": "穷举 ROT47",
    "summary": "把 !–~ 字符表上可能的位移逐一展示。",
    "aliases": [
      "ROT47 Brute Force",
      "枚举可打印字符循环位移"
    ],
    "sources": [
      {
        "id": "rot47",
        "title": "ROT47 中文算法说明",
        "publisher": "DenCode（该转换器作者文档）",
        "url": "https://dencode.com/zh-cn/cipher/rot47",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "关于该算法"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "ROT47 Brute Force"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "把每个字符看成 94 元循环表中的一个位置，逐项尝试循环步长并返回候选文本。标准 ROT47 只是其中第 47 步，穷举操作并不预先知道实际步长。"
        ],
        "sourceIds": [
          "rot47",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "候选片段 p_P，测试步长 47",
            "output": "A0!",
            "explanation": "按 94 元循环再加 47 等价于撤销原 ROT47；其它步长仍需单独检查。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "候选输出要结合题目的字符范围、自然语言和上下文判断；非可打印范围字符不会由这张表自动解出。",
          "可读短串可能偶然出现；枚举循环位移不能破解任意单表替换或现代加密。"
        ],
        "sourceIds": [
          "engine",
          "rot47"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:ROT13%20Brute%20Force",
    "capabilityIds": [
      "op:ROT13%20Brute%20Force"
    ],
    "relatedIds": [
      "op:ROT13%20Brute%20Force"
    ],
    "topicGroup": "classical",
    "title": "穷举凯撒移位",
    "summary": "依次试出字母表中的循环移位候选。",
    "aliases": [
      "ROT13 Brute Force",
      "枚举凯撒步长"
    ],
    "sources": [
      {
        "id": "rot13",
        "title": "ROT13 中文算法说明",
        "publisher": "DenCode（该转换器作者文档）",
        "url": "https://dencode.com/zh-cn/cipher/rot13",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "关于该算法"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "ROT13 Brute Force"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "对 26 字母循环表分别尝试位移值，列出变换结果。固定凯撒密码只有一个步长，因而可以用有限的候选表找出符合上下文的文本。"
        ],
        "sourceIds": [
          "rot13",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "NET，候选位移 13",
            "output": "ARG",
            "explanation": "N→A、E→R、T→G；13 是这一候选的解码步长。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "可独立决定是否旋转大小写和数字；数字属于 10 元表，其循环规律与 26 个字母不同。",
          "此处穷举的是位移，不是所有 26! 种字符替换；短候选应靠题面验证。"
        ],
        "sourceIds": [
          "engine",
          "rot13"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Bifid%20Cipher%20Encode",
    "capabilityIds": [
      "pair:Bifid%20Cipher%20Encode"
    ],
    "relatedIds": [
      "pair:Bifid%20Cipher%20Encode"
    ],
    "topicGroup": "classical",
    "title": "双分密码",
    "summary": "把 Polybius 方阵的行坐标和列坐标分别排列后重新配对。",
    "aliases": [
      "Bifid Cipher Encode",
      "Bifid Cipher Decode",
      "拆分并重新组合方阵坐标"
    ],
    "sources": [
      {
        "id": "bifid-source",
        "title": "CyberChef 11.5.0 固定源码 — BifidCipherEncode",
        "publisher": "GCHQ CyberChef / Matt C",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/BifidCipherEncode.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run(): yCo+xCo / polybius",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/BifidCipherEncode.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Bifid Cipher Encode / Bifid Cipher Decode"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "先在 5×5 方阵中找每个字母的行、列，收集所有行坐标，再连接所有列坐标；把连接后的数字流两两分组，重新查方阵。解码还原数字流后从中间拆开行与列。"
        ],
        "sourceIds": [
          "bifid-source",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "无关键词，标准方阵，明文 AG",
            "output": "BB",
            "explanation": "A=(1,1)，G=(2,2)；行流 12，列流 12，组合 1212，配对 12、12 得到 BB。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Keyword 去重后置于方阵开头，其余字母补齐；本站采用不含 J 的 25 字母表。",
          "方阵坐标拼接跨度和 I/J 处理必须一致；本站表单没有另设周期参数，不应假定每五个字母自动重置。"
        ],
        "sourceIds": [
          "engine",
          "bifid-source"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Substitute",
    "capabilityIds": [
      "op:Substitute"
    ],
    "relatedIds": [
      "op:Substitute"
    ],
    "topicGroup": "classical",
    "title": "字符替换",
    "summary": "同一位置的字符形成确定映射表。",
    "aliases": [
      "Substitute",
      "由两张对应字符表进行替换"
    ],
    "sources": [
      {
        "id": "pku",
        "title": "密码学课件：置换密码与维吉尼亚密码",
        "publisher": "北京大学信息科学技术学院",
        "url": "https://www.icst.pku.edu.cn/zlian/docs/20181023161806486415.pdf",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "第 2–6 页"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Substitute"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "源字母表和目标字母表按位置一一对应，每次遇到源字符便输出同位置的目标字符。它是自定义单表替换，映射本身决定字符关系。"
        ],
        "sourceIds": [
          "pku",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "源表 ABC，目标表 XYZ，输入 CAB",
            "output": "ZXY",
            "explanation": "C 对应 Z，A 对应 X，B 对应 Y；没有改变原字符位置。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Plaintext 和 Ciphertext 是按位置对应的字节表，可使用 \\n、\\x0a 等转义及 0-9 等范围；Ignore case 控制大小写处理。反向无歧义需要目标表没有重复。",
          "替换不同于重排文本位置；把多个源字符替成同一字符会丢失可逆性。"
        ],
        "sourceIds": [
          "engine",
          "pku"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:LS47%20Encrypt",
    "capabilityIds": [
      "pair:LS47%20Encrypt"
    ],
    "relatedIds": [
      "pair:LS47%20Encrypt"
    ],
    "topicGroup": "classical",
    "title": "LS47",
    "summary": "字符置于 7×7 密钥棋盘，每轮替换后改变棋盘。",
    "aliases": [
      "LS47 Encrypt",
      "LS47 Decrypt",
      "会随消息更新的 7×7 棋盘"
    ],
    "sources": [
      {
        "id": "ls47",
        "title": "LS47 hand-computable cipher",
        "publisher": "LS47 作者 exaexa",
        "url": "https://github.com/exaexa/ls47",
        "language": "en",
        "kind": "author-spec",
        "locator": "7×7 字符表 / 状态更新 / nonce"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "LS47 Encrypt / LS47 Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "LS47 是 ElsieFour 的 7×7 扩展。49 个互不重复符号组成棋盘；当前标记与明文字符的位置决定输出，随后旋转相关行列并更新标记，下一轮使用新状态。"
        ],
        "sourceIds": [
          "ls47",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "7×7 棋盘",
            "output": "49 个位置，恰放 49 个允许符号",
            "explanation": "这是状态空间的尺寸推演，并非一条可预先固定的随机封装密文；同一棋盘中的字符必须唯一。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Password 经该实现的密钥扩展生成排列；Padding 和 Signature 属此协议的消息封装，解密时须遵守同一字母表与状态更新。",
          "这不是固定的 Polybius 坐标表；某字符被改动会改变之后的状态，不能逐字符用一张静态表直接替回。"
        ],
        "sourceIds": [
          "engine",
          "ls47"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:SIGABA",
    "capabilityIds": [
      "op:SIGABA"
    ],
    "relatedIds": [
      "op:SIGABA"
    ],
    "topicGroup": "classical",
    "title": "SIGABA 密码机",
    "summary": "主密码轮由控制轮和索引轮共同决定前进方式。",
    "aliases": [
      "SIGABA",
      "三组轮控制不规则步进"
    ],
    "sources": [
      {
        "id": "sigaba",
        "title": "SIGABA ECM II",
        "publisher": "Crypto Museum（设备复原研究）",
        "url": "https://www.cryptomuseum.com/crypto/usa/sigaba/",
        "language": "en",
        "kind": "author-spec",
        "locator": "Working principle / cipher wheels"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "SIGABA"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "SIGABA 有 5 个主密码轮、5 个控制轮与 5 个索引轮。主轮作字母映射，另外两组生成步进控制，使主轮不像普通 Enigma 那样按简单节律前进。"
        ],
        "sourceIds": [
          "sigaba",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "5 个主轮 + 5 个控制轮 + 5 个索引轮",
            "output": "共 15 个轮，只有第一组负责主字母映射",
            "explanation": "这说明为什么仅知道主轮起点仍不足以复原整个密钥流。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "各轮的选择、方向和初始位置都是机器密钥的一部分；加密和解密模式需要保持完整相同设置。",
          "15 个轮并非全部同时参与字母变换；索引轮负责控制，不应把其十个触点当成字母表。"
        ],
        "sourceIds": [
          "engine",
          "sigaba"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Typex",
    "capabilityIds": [
      "op:Typex"
    ],
    "relatedIds": [
      "op:Typex"
    ],
    "topicGroup": "classical",
    "title": "Typex 密码机",
    "summary": "五个密码轮中两个不随输入转动，其余三个步进。",
    "aliases": [
      "Typex",
      "带静止轮的五转子机器"
    ],
    "sources": [
      {
        "id": "typex",
        "title": "Typex",
        "publisher": "Crypto Museum（设备复原研究）",
        "url": "https://www.cryptomuseum.com/crypto/uk/typex/",
        "language": "en",
        "kind": "author-spec",
        "locator": "Working principle / cipher wheels"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Typex"
      },
      {
        "id": "bombe-guide",
        "title": "Enigma, the Bombe, and Typex",
        "publisher": "GCHQ CyberChef 操作作者",
        "url": "https://github.com/gchq/CyberChef/wiki/Enigma,-the-Bombe,-and-Typex/ed7ab8b92789111139fb98d23a9bf2249311b6a7",
        "language": "en",
        "kind": "official-doc",
        "locator": "Cribs / menus / loops / checking machine"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Typex 信号经输入盘、五个密码轮和反射器往返；其中两个轮保持静止，三个轮按机器的步进规则运动。多凹口和不同插线结构使它不能简单视为标准 Enigma。"
        ],
        "sourceIds": [
          "typex",
          "engine",
          "bombe-guide"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "5 个轮，2 个静止",
            "output": "3 个轮步进，5 个轮均可影响信号映射",
            "explanation": "静止描述的是机械运动，不是删除该轮的替换作用。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "轮选择、方向、起点、环设置和插线分别决定映射；兼容模式必须匹配对应设备配置。",
          "不同 Typex 型号的插线改造不相同；保持静止不表示该轮不参与电信号映射。"
        ],
        "sourceIds": [
          "engine",
          "typex",
          "bombe-guide"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:ROT8000",
    "capabilityIds": [
      "op:ROT8000"
    ],
    "relatedIds": [
      "op:ROT8000"
    ],
    "topicGroup": "classical",
    "title": "Unicode 移位（ROT8000）",
    "summary": "实际实现以允许字符表的半长进行自逆映射。",
    "aliases": [
      "ROT8000",
      "在过滤后的 BMP 字符表中对半交换"
    ],
    "sources": [
      {
        "id": "rot8000-source",
        "title": "CyberChef 11.5.0 固定源码 — ROT8000 operation",
        "publisher": "GCHQ CyberChef / Daniel Temkin / Thomas Leplus",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/ROT8000.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run(): validIntList / rotateNum",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/ROT8000.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "ROT8000"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "本站引擎先建立过滤控制、部分空白和代理区的 BMP 字符列表，再将列表索引移动列表长度的一半。列表外的字符原样保留；不是对每个 Unicode 码点直接加 0x8000。"
        ],
        "sourceIds": [
          "rot8000-source",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "空格 + 换行，应用 ROT8000",
            "output": "空格 + 换行保持不变",
            "explanation": "两者不在过滤后的替换列表；对被映射的字符执行两次会恢复。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "该操作没有步长参数；使用固定表。补充平面字符由代理对表示，其代码单元不在允许表中，不能当成 BMP 单字符套公式。",
          "名称中的 8000 不能代替实际算法规范；引擎描述的简写必须结合 validIntList 和 rotateNum 实现阅读。"
        ],
        "sourceIds": [
          "engine",
          "rot8000-source"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:AES%20Encrypt",
    "capabilityIds": [
      "pair:AES%20Encrypt"
    ],
    "relatedIds": [
      "pair:AES%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "AES",
    "summary": "AES 的分组固定为 16 字节，密钥长度决定轮数。",
    "aliases": [
      "AES Encrypt",
      "AES Decrypt",
      "128 位分组与轮变换"
    ],
    "sources": [
      {
        "id": "aes",
        "title": "FIPS 197 — Advanced Encryption Standard (AES)",
        "publisher": "美国国家标准与技术研究院 NIST",
        "url": "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf",
        "language": "en",
        "kind": "standard",
        "locator": "§3 / §5 / Appendix B"
      },
      {
        "id": "aliyun",
        "title": "边缘脚本加解密与摘要函数",
        "publisher": "阿里云",
        "url": "https://help.aliyun.com/zh/cdn/user-guide/cipher-algorithm-functions",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "aes_new / hmac"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "AES Encrypt / AES Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "AES 把 16 字节组织为 4×4 状态数组，经字节替换、行移位、列混合和轮密钥异或等变换；128/192/256 位密钥分别使用 10/12/14 轮。分组长度不会随密钥增长。"
        ],
        "sourceIds": [
          "aes",
          "aliyun",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "16 字节密钥，16 字节明文，AES-128 无填充分组",
            "output": "执行 10 轮并输出 16 字节分组",
            "explanation": "这是分组和轮数的规则推演；使用 CBC 的填充或额外 IV 会改变最终封装长度。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "CBC、CTR、GCM 等是把分组原语用于整段消息的不同模式；Key 的 Hex/UTF8 选择控制字节解释。GCM 的 AAD 参与认证，不参与加密。",
          "CBC/ECB 的 PKCS#7 会补齐分组，NoPadding 要求整分组；解密必须匹配密钥、模式、IV 和认证参数。"
        ],
        "sourceIds": [
          "engine",
          "aes",
          "aliyun"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:RSA%20Encrypt",
    "capabilityIds": [
      "pair:RSA%20Encrypt"
    ],
    "relatedIds": [
      "pair:RSA%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "RSA",
    "summary": "公钥加密先进行规范填充，再作模幂。",
    "aliases": [
      "RSA Encrypt",
      "RSA Decrypt",
      "模幂运算与加密填充"
    ],
    "sources": [
      {
        "id": "r8017",
        "title": "RFC 8017 — PKCS #1: RSA Cryptography Specifications Version 2.2",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc8017.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3–8"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "RSA Encrypt / RSA Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "RSA 公钥含模数 n 与指数 e，私钥包含对应秘密参数。数学原语为 c=mᵉ mod n，但真实消息需先用 OAEP 或 PKCS#1 v1.5 编码，不能把裸模幂当完整安全方案。"
        ],
        "sourceIds": [
          "r8017",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "2048 位 RSA，OAEP-SHA256",
            "output": "最多 256−2×32−2=190 字节明文",
            "explanation": "256 是模数的字节长度，32 是 SHA-256 摘要长度；此处没有生成随机密文。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Encryption Scheme 选择 OAEP、PKCS1-v1_5 或 RAW；OAEP 的摘要算法同时决定最大明文长度。解密使用对应私钥与相同填充。",
          "RSA 不是任意长度文件的分组流；OAEP 上限为 k−2hLen−2 字节，通常用于封装对称密钥。"
        ],
        "sourceIds": [
          "engine",
          "r8017"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:ChaCha",
    "capabilityIds": [
      "op:ChaCha"
    ],
    "relatedIds": [
      "op:ChaCha"
    ],
    "topicGroup": "modern",
    "title": "ChaCha",
    "summary": "ChaCha quarter-round 混合四个 32 位字，再与输入异或。",
    "aliases": [
      "ChaCha",
      "加法、异或和循环移位生成密钥流"
    ],
    "sources": [
      {
        "id": "r8439",
        "title": "RFC 8439 — ChaCha20 and Poly1305 for IETF Protocols",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc8439.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2.1–2.4"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "ChaCha"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "ChaCha 的核心以模 2³² 加法、异或和循环移位作 ARX 变换。标准 ChaCha20 由 20 轮生成 64 字节密钥流分组；输入字节与密钥流异或得到输出。"
        ],
        "sourceIds": [
          "r8439",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "输入字节 41，密钥流该字节为 20（十六进制）",
            "output": "41⊕20=61",
            "explanation": "得到的是示例密钥流位置的异或结果；真正密钥流由密钥、nonce、counter 和轮数共同生成。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站可选 20/12/8 轮与原始/IETF nonce 长度；Counter 控制从哪一分组开始，Nonce 与 Key 必须和解密端一致。",
          "此入口仅为 ChaCha 流变换，不能因为名称就认定附带 Poly1305 标签；同一密钥下不可重复同一 nonce 和计数区间。"
        ],
        "sourceIds": [
          "engine",
          "r8439"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generate%20RSA%20Key%20Pair",
    "capabilityIds": [
      "op:Generate%20RSA%20Key%20Pair"
    ],
    "relatedIds": [
      "op:Generate%20RSA%20Key%20Pair"
    ],
    "topicGroup": "modern",
    "title": "生成 RSA 密钥对",
    "summary": "模数 n=pq 与互逆指数形成 RSA 密钥对。",
    "aliases": [
      "Generate RSA Key Pair",
      "两个素数构成公私钥"
    ],
    "sources": [
      {
        "id": "r8017",
        "title": "RFC 8017 — PKCS #1: RSA Cryptography Specifications Version 2.2",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc8017.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3–8"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate RSA Key Pair"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "RSA 选择不同素数 p、q，构造 n=pq，并令公钥指数 e 与 λ(n) 互质，再求 d 使 ed≡1 mod λ(n)。私钥还可保存 CRT 参数以加速运算。"
        ],
        "sourceIds": [
          "r8017",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "教学小数 p=3、q=11、e=3",
            "output": "n=33，λ(n)=10，d=7",
            "explanation": "3×7=21≡1 mod 10；这些极小数字只用于看清公私钥关系。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "RSA Key Length 选择 1024/2048/4096 位；Output Format 选择 PEM、JSON 或 DER，输出的外观不会改变密钥数学内容。",
          "教学中的小素数例不能用于实际密钥；本站上游不承诺生成密钥的生产安全性，不应把课堂示意当真实密钥。"
        ],
        "sourceIds": [
          "engine",
          "r8017"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:XOR",
    "capabilityIds": [
      "op:XOR"
    ],
    "relatedIds": [
      "op:XOR"
    ],
    "topicGroup": "modern",
    "title": "按位异或",
    "summary": "相同比特得到 0，不同比特得到 1；再异或同一密钥还原。",
    "aliases": [
      "XOR",
      "逐位异或与重复密钥"
    ],
    "sources": [
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "XOR"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "标准 XOR 每个输入字节与对应密钥字节异或。关键恒等式是 (P⊕K)⊕K=P，因此标准重复密钥 XOR 可用同一变换还原。"
        ],
        "sourceIds": [
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "标准方案，字节 41，密钥 20（Hex）",
            "output": "61；再与 20 异或得到 41",
            "explanation": "0x41 的第 5 位被切换，两次相同切换抵消。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Scheme 可选 Standard、Input differential、Output differential、Cascade；后者会更新后续密钥。Null preserving 会跳过零字节或等于密钥的字节。",
          "不同 Scheme 不是同一个算法；Null preserving 改变标准逐字节规则。短重复密钥也不同于随机且只用一次的密钥。"
        ],
        "sourceIds": [
          "engine"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:XOR%20Brute%20Force",
    "capabilityIds": [
      "op:XOR%20Brute%20Force"
    ],
    "relatedIds": [
      "op:XOR%20Brute%20Force"
    ],
    "topicGroup": "modern",
    "title": "穷举异或密钥",
    "summary": "枚举有限长度 XOR 密钥，保留满足明文线索的候选。",
    "aliases": [
      "XOR Brute Force",
      "试遍短密钥并筛选已知片段"
    ],
    "sources": [
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "XOR Brute Force"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "单字节密钥只有 2⁸ 种；双字节有 2¹⁶ 种。对采样输入逐个计算 XOR，使用 Crib 已知片段筛选可行密钥，最后再用完整数据验证。"
        ],
        "sourceIds": [
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "一个字节密钥，8 个二进制位",
            "output": "256 个可能值",
            "explanation": "2⁸=256；两字节 2¹⁶=65536，不能据此推断任意长度密钥都能在浏览器穷举。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key length、Sample length、Sample offset 控制枚举与采样；本站目录说明最大密钥长为 2 字节。输出可带密钥并以 Hex 展示。",
          "仅在样本中出现片段不能证明整段解密正确；差分 Scheme 和 Null preserving 也必须与原处理一致。"
        ],
        "sourceIds": [
          "engine"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generate%20PGP%20Key%20Pair",
    "capabilityIds": [
      "op:Generate%20PGP%20Key%20Pair"
    ],
    "relatedIds": [
      "op:Generate%20PGP%20Key%20Pair"
    ],
    "topicGroup": "modern",
    "title": "生成 PGP 密钥对",
    "summary": "PGP 密钥是带身份和签名的数据包集合。",
    "aliases": [
      "Generate PGP Key Pair",
      "公钥包、用户标识和自签名"
    ],
    "sources": [
      {
        "id": "r9580",
        "title": "RFC 9580 — OpenPGP",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9580.html",
        "language": "en",
        "kind": "standard",
        "locator": "§5 / §6 / §13"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate PGP Key Pair"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "OpenPGP 公钥并不只有一串 RSA 数字：主公钥包可与 User ID、自签名和子密钥绑定。私钥包保存秘密参数，口令可保护私钥包中的秘密部分。"
        ],
        "sourceIds": [
          "r9580",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "设置 Name=玩家、Email=player@example.invalid",
            "output": "公钥包可以包含一个对应 User ID",
            "explanation": "这只是字段结构说明；随机密钥和真实指纹每次生成不同。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key type 选择 RSA 或椭圆曲线；Name、Email 是可选用户标识；Password 是私钥保护口令，不是公开公钥的读取密码。",
          "邮箱字符串不证明真实身份，身份可信度还取决于如何验证公钥指纹及签名。本站生成仅供题目和学习。"
        ],
        "sourceIds": [
          "engine",
          "r9580"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:ROR13",
    "capabilityIds": [
      "op:ROR13"
    ],
    "relatedIds": [
      "op:ROR13"
    ],
    "topicGroup": "modern",
    "title": "ROR13",
    "summary": "每读一个字节，先右循环移位 13 位再累加该字节。",
    "aliases": [
      "ROR13",
      "32 位旋转累加哈希"
    ],
    "sources": [
      {
        "id": "ror13-source",
        "title": "CyberChef 11.5.0 固定源码 — ROR13",
        "publisher": "GCHQ CyberChef / fufu_btw",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/ROR13.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run(): ror(hash,13)+byte",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/ROR13.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "ROR13"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "本站 ROR13 从 h=0 开始，对每个输入字节 b 计算 h=(ROR32(h,13)+b) mod 2³²，最终输出补足八位的十六进制值。常用于 API 名称标识。"
        ],
        "sourceIds": [
          "ror13-source",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "ASCII A（Hex 41）",
            "output": "0x00000041",
            "explanation": "初值为 0，旋转后仍为 0；加 65 得 0x41，再补足八位。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "此操作没有步长参数，使用固定 13 位旋转和 32 位无符号累计。输入是字节序列；大小写和字符编码会改变结果。",
          "它是许多输入映射到 32 位值的哈希，不能解码回原名称，也不是 ROT13 字母变换。"
        ],
        "sourceIds": [
          "engine",
          "ror13-source"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:AES%20Key%20Wrap",
    "capabilityIds": [
      "pair:AES%20Key%20Wrap"
    ],
    "relatedIds": [
      "pair:AES%20Key%20Wrap"
    ],
    "topicGroup": "modern",
    "title": "AES 密钥封装",
    "summary": "以 AES 和固定完整性初值包装 64 位密钥片段。",
    "aliases": [
      "AES Key Wrap",
      "AES Key Unwrap",
      "封装密钥与完整性寄存器"
    ],
    "sources": [
      {
        "id": "r3394",
        "title": "RFC 3394 — Advanced Encryption Standard (AES) Key Wrap Algorithm",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc3394.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2.2–2.3 / §4"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "AES Key Wrap / AES Key Unwrap"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "RFC 3394 把待封装密钥分为 64 位片段，以 A 寄存器和各片段反复调用 AES，混入迭代计数。解封装按逆序还原，并检查 A 是否等于约定完整性初值。"
        ],
        "sourceIds": [
          "r3394",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "16 字节待封装密钥",
            "output": "标准 RFC 3394 封装为 24 字节",
            "explanation": "两个 64 位片段加一个 64 位 A 寄存器，净增加 8 字节。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key(KEK) 是用于保护另一把密钥的封装密钥；默认 IV 为 A6 重复八次，不是 AES-CBC 的 16 字节 IV。",
          "普通 RFC 3394 对输入长度有整 64 位片段要求；失败的完整性检查不能通过删除头部来绕开。"
        ],
        "sourceIds": [
          "engine",
          "r3394"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Ascon%20Encrypt",
    "capabilityIds": [
      "pair:Ascon%20Encrypt"
    ],
    "relatedIds": [
      "pair:Ascon%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "Ascon",
    "summary": "Ascon-AEAD128 同时加密明文并认证 AAD。",
    "aliases": [
      "Ascon Encrypt",
      "Ascon Decrypt",
      "海绵状态与认证标签"
    ],
    "sources": [
      {
        "id": "ascon",
        "title": "Ascon — Specification",
        "publisher": "Ascon 设计团队 / 格拉茨技术大学",
        "url": "https://ascon.isec.tugraz.at/specification.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "Permutation / Ascon-AEAD128 / CT-RSA 2024 MAC 文献说明"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Ascon Encrypt / Ascon Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Ascon-AEAD128 在 320 位状态上应用置换，分初始化、关联数据吸收、明文处理和终结四阶段。密钥、nonce 和标签都为 128 位；终结产生认证标签。"
        ],
        "sourceIds": [
          "ascon",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "3 字节明文，Ascon-AEAD128 输出密文加标签",
            "output": "3+16=19 字节（不含另行保存的 nonce）",
            "explanation": "认证加密不补成 16 字节明文块；标签是额外的 16 字节。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key 和 Nonce 都需 16 字节；Associated Data 原样可见但纳入认证。本站输出包含密文与 16 字节标签，解密须保留完整标签。",
          "NIST 标准化版本与早期提交版本的字节序和初始化常量并不相同；同一密钥下 nonce 不能重用。"
        ],
        "sourceIds": [
          "engine",
          "ascon"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Blowfish%20Encrypt",
    "capabilityIds": [
      "pair:Blowfish%20Encrypt"
    ],
    "relatedIds": [
      "pair:Blowfish%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "Blowfish",
    "summary": "密钥扩展生成 P 数组与 S 盒，再作 16 轮 Feistel 变换。",
    "aliases": [
      "Blowfish Encrypt",
      "Blowfish Decrypt",
      "64 位 Feistel 分组"
    ],
    "sources": [
      {
        "id": "blowfish",
        "title": "Description of a New Variable-Length Key, 64-Bit Block Cipher (Blowfish)",
        "publisher": "Bruce Schneier",
        "url": "https://www.schneier.com/academic/archives/1994/09/description_of_a_new.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "Algorithm description"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Blowfish Encrypt / Blowfish Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Blowfish 对 64 位分组执行 16 轮 Feistel 网络。密钥先扩展为 P 数组和四个 S 盒，轮函数把半块拆成字节，查表后使用加法与异或混合。"
        ],
        "sourceIds": [
          "blowfish",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "一个 8 字节分组",
            "output": "64 位分组，经 16 轮处理仍为 8 字节",
            "explanation": "这是分组原语的长度推演；工作模式和填充可能另加输出字节。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站 Mode 可选 CBC/CFB/OFB/CTR/ECB；CBC 的 IV 为 8 字节，Key 的字符表示须先正确解成字节。",
          "64 位分组不同于密钥长度；大数据量下小分组会出现生日界限问题，解谜兼容不等于适合新系统。"
        ],
        "sourceIds": [
          "engine",
          "blowfish"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:CipherSaber2%20Encrypt",
    "capabilityIds": [
      "pair:CipherSaber2%20Encrypt"
    ],
    "relatedIds": [
      "pair:CipherSaber2%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "CipherSaber2",
    "summary": "随机 IV 拼接用户密钥，重复 RC4 初始化后异或消息。",
    "aliases": [
      "CipherSaber2 Encrypt",
      "CipherSaber2 Decrypt",
      "10 字节 IV 与多轮 RC4 调度"
    ],
    "sources": [
      {
        "id": "cs2-source",
        "title": "CyberChef 11.5.0 固定源码 — CipherSaber2Encrypt",
        "publisher": "GCHQ CyberChef",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/CipherSaber2Encrypt.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run(): 10-byte random IV prefix",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/CipherSaber2Encrypt.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "r6229",
        "title": "RFC 6229 — Test Vectors for the Stream Cipher RC4",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc6229.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "CipherSaber2 Encrypt / CipherSaber2 Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "本站实现生成 10 字节随机 IV，将其用于 CipherSaber2 的 RC4 密钥调度，并把 IV 前置于输出。Rounds 控制重复密钥调度次数，收件端读取同一 IV 后恢复密钥流。"
        ],
        "sourceIds": [
          "cs2-source",
          "r6229",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "3 字节正文",
            "output": "10 字节 IV + 3 字节加密正文，共 13 字节",
            "explanation": "这是本站封装长度，不是固定随机密文；每次 IV 可不同。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key 和 Rounds 两端必须一致；加密封装保留前置 IV，解密不能把这十字节当成加密正文丢掉。",
          "此历史方案使用 RC4，不应把旧简介的安全宣传当现代安全保证；原官网现已重定向，来源以固定实现核对。"
        ],
        "sourceIds": [
          "engine",
          "cs2-source",
          "r6229"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:DES%20Encrypt",
    "capabilityIds": [
      "pair:DES%20Encrypt"
    ],
    "relatedIds": [
      "pair:DES%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "DES",
    "summary": "DES 在左右半块上进行 16 轮 Feistel 变换。",
    "aliases": [
      "DES Encrypt",
      "DES Decrypt",
      "56 位有效密钥与 64 位分组"
    ],
    "sources": [
      {
        "id": "des",
        "title": "FIPS 46-3 — Data Encryption Standard (DES)（已撤销）",
        "publisher": "美国国家标准与技术研究院 NIST",
        "url": "https://csrc.nist.gov/pubs/fips/46-3/final",
        "language": "en",
        "kind": "standard",
        "locator": "DES / TDEA"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "DES Encrypt / DES Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "DES 分组长为 64 位，输入密钥通常占 64 位，但其中 8 位用于奇偶校验，有效密钥为 56 位。轮密钥选择、扩展、S 盒和置换组合成 16 轮 Feistel 运算。"
        ],
        "sourceIds": [
          "des",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "8 字节 DES 密钥表示",
            "output": "64 位表示中只有 56 位有效密钥位",
            "explanation": "每个字节的一位属于奇偶校验，共减去八位。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站 Key 与 CBC 的 IV 各用 8 字节；CBC/ECB 按说明采用 PKCS#7，解密必须按相同模式解释。",
          "FIPS 46-3 已撤销，56 位有效密钥不足以保护新的敏感数据；仍可用于历史题目识读。"
        ],
        "sourceIds": [
          "engine",
          "des"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:GOST%20Encrypt",
    "capabilityIds": [
      "pair:GOST%20Encrypt"
    ],
    "relatedIds": [
      "pair:GOST%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "GOST",
    "summary": "GOST 家族内存在不同分组尺寸和替换规则。",
    "aliases": [
      "GOST Encrypt",
      "GOST Decrypt",
      "区分 1989、Magma 与 Kuznyechik"
    ],
    "sources": [
      {
        "id": "r8891",
        "title": "RFC 8891 — GOST R 34.12-2015: Block Cipher Magma",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc8891.html",
        "language": "en",
        "kind": "standard",
        "locator": "§4"
      },
      {
        "id": "r7801",
        "title": "RFC 7801 — GOST R 34.12-2015: Block Cipher Kuznyechik",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7801.html",
        "language": "en",
        "kind": "standard",
        "locator": "§4"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "GOST Encrypt / GOST Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "1989 的 GOST 28147 和 2015 的 Magma 使用 64 位分组；Kuznyechik 使用 128 位分组。不能仅按 GOST 名称互换，算法版本、S 盒和数据排列均有约定。"
        ],
        "sourceIds": [
          "r8891",
          "r7801",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "同为 16 字节输入：Magma 与 Kuznyechik",
            "output": "Magma 原语是 2 个 8 字节块；Kuznyechik 原语是 1 个 16 字节块",
            "explanation": "只比较分组尺寸；填充、工作模式和 IV 会另影响输出。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Algorithm、sBox、Block mode、Key meshing 和 Padding 共同决定结果；1989 版本的 sBox 选择不可忽略。",
          "所有这些模式仍需密钥；填充成功或出现可打印字符不能替代真实性验证。"
        ],
        "sourceIds": [
          "engine",
          "r8891",
          "r7801"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:GOST%20Key%20Wrap",
    "capabilityIds": [
      "pair:GOST%20Key%20Wrap"
    ],
    "relatedIds": [
      "pair:GOST%20Key%20Wrap"
    ],
    "topicGroup": "modern",
    "title": "GOST 密钥封装",
    "summary": "用封装密钥和 UKM 保护另一把密钥。",
    "aliases": [
      "GOST Key Wrap",
      "GOST Key Unwrap",
      "加密待封装密钥并校验 MAC"
    ],
    "sources": [
      {
        "id": "r4357",
        "title": "RFC 4357 — Additional Cryptographic Algorithms for Use with GOST Algorithms",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4357.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2 / §6"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "GOST Key Wrap / GOST Key Unwrap"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "GOST 的密钥封装组合密钥加密和 MAC 完整性保护；CryptoPro 方案还用 UKM 作 KEK diversification，使实际封装密钥依 UKM 变化。",
          "RFC 4357 的协议封装包含 8 字节 UKM、32 字节加密 CEK 和 4 字节 MAC，共 44 字节；本站 1989 NO/CP 封装函数实际返回 CEK_ENC 与 MAC 共 36 字节，UKM 另由参数保存，不能把 44 字节直接当本站函数输出长度。"
        ],
        "sourceIds": [
          "r4357",
          "engine"
        ],
        "examples": [
          {
            "label": "协议字段与本站返回值",
            "input": "1989 NO/CP；32 字节 CEK；另设 8 字节 UKM",
            "output": "本站返回：32 字节 CEK_ENC + 4 字节 MAC = 36 字节\n协议另带 UKM 时：8 + 32 + 4 = 44 字节",
            "explanation": "两个长度对应不同边界：函数返回不含 UKM。解封装必须保留原 UKM 参数；不要按44字节截取函数返回。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key 是封装密钥，User Key Material 是 UKM；Key wrapping 可选 NO/CP/SC，各端必须使用相同变体及算法。",
          "UKM 不是待封装密钥，也不是代替 KEK 的口令；解封装需要正确校验 MAC，不能只做分组解密。"
        ],
        "sourceIds": [
          "engine",
          "r4357"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:PGP%20Encrypt%20and%20Sign",
    "capabilityIds": [
      "pair:PGP%20Encrypt%20and%20Sign"
    ],
    "relatedIds": [
      "pair:PGP%20Encrypt%20and%20Sign"
    ],
    "topicGroup": "modern",
    "title": "PGP 加密签名与解密验签",
    "summary": "加密用收件人公钥，签名用发件人私钥。",
    "aliases": [
      "PGP Encrypt and Sign",
      "PGP Decrypt and Verify",
      "收件人加密与发件人签名"
    ],
    "sources": [
      {
        "id": "r9580",
        "title": "RFC 9580 — OpenPGP",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9580.html",
        "language": "en",
        "kind": "standard",
        "locator": "§5 / §6 / §13"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "PGP Encrypt and Sign / PGP Decrypt and Verify"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "组合流程对消息生成签名，再使用会话对称密钥加密消息内容，收件人公钥保护会话密钥。收件人私钥恢复会话密钥，发件人公钥验证消息签名。"
        ],
        "sourceIds": [
          "r9580",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "甲发给乙：甲私钥签名，乙公钥加密",
            "output": "乙私钥解密，甲公钥验签",
            "explanation": "这是四把公私钥的角色关系；随机加密报文不能预设固定字节输出。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Private key of signer 与 Public key of recipient 扮演不同身份；解密验签时交换为收件人私钥和发件人公钥，不是单纯把同一把键调方向。",
          "机密性与署名真实性是两项检查；能解密不自动证明发送者，也不能用自己的公钥替代发件人公钥验签。"
        ],
        "sourceIds": [
          "engine",
          "r9580"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:PGP%20Encrypt",
    "capabilityIds": [
      "pair:PGP%20Encrypt"
    ],
    "relatedIds": [
      "pair:PGP%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "PGP",
    "summary": "OpenPGP 混合使用公钥加密和对称加密。",
    "aliases": [
      "PGP Encrypt",
      "PGP Decrypt",
      "用公钥包住随机会话密钥"
    ],
    "sources": [
      {
        "id": "r9580",
        "title": "RFC 9580 — OpenPGP",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9580.html",
        "language": "en",
        "kind": "standard",
        "locator": "§5 / §6 / §13"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "PGP Encrypt / PGP Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "消息内容由随机会话密钥驱动的对称密码加密；会话密钥由收件人公钥保护并写入对应数据包。解密从收件人私钥恢复会话密钥，再处理消息内容。"
        ],
        "sourceIds": [
          "r9580",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "同一消息分别送给甲和乙",
            "output": "可对应两个收件人会话密钥包，消息正文只需一份对称密文",
            "explanation": "展示的是 OpenPGP 封装原理；本站一次操作的收件人数量以表单支持为准。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "输入 ASCII-armoured 收件人公钥；解密用对应私钥及需要时的私钥口令。ASCII armor 只是二进制包的文本外壳。",
          "单独加密入口不承诺发件人签名；BEGIN PGP MESSAGE 也不等于已经验证消息来源。"
        ],
        "sourceIds": [
          "engine",
          "r9580"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:PRESENT%20Encrypt",
    "capabilityIds": [
      "pair:PRESENT%20Encrypt"
    ],
    "relatedIds": [
      "pair:PRESENT%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "PRESENT",
    "summary": "轻量密码以 31 轮替换和置换处理 64 位分组。",
    "aliases": [
      "PRESENT Encrypt",
      "PRESENT Decrypt",
      "四位 S 盒与位置换"
    ],
    "sources": [
      {
        "id": "present",
        "title": "PRESENT: An Ultra-Lightweight Block Cipher",
        "publisher": "Bogdanov 等设计者 / Orange Labs（作者单位）",
        "url": "https://crypto.orange-labs.fr/papers/ches2007-450.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "§2: 31 rounds / 4-bit S-box / pLayer"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "PRESENT Encrypt / PRESENT Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "PRESENT 是 64 位分组密码，密钥可为 80 或 128 位。每轮异或轮密钥，用 16 个四位 S 盒替换，再用固定位置换传播差异，连续执行 31 轮。"
        ],
        "sourceIds": [
          "present",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "64 位状态分成 4 位小组",
            "output": "64÷4=16 次 S 盒映射 / 每轮",
            "explanation": "这个尺寸关系来自轮结构，不是完整密文测试向量。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站提供 CBC/ECB 和填充选择；80 位密钥占 10 字节、128 位占 16 字节，CBC IV 占 8 字节。",
          "轻量指实现资源需求，不是简单的字母替换；80 位和 128 位密钥不能靠补零随意视作同一密钥。"
        ],
        "sourceIds": [
          "engine",
          "present"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Rabbit",
    "capabilityIds": [
      "op:Rabbit"
    ],
    "relatedIds": [
      "op:Rabbit"
    ],
    "topicGroup": "modern",
    "title": "Rabbit",
    "summary": "128 位密钥初始化状态，64 位 IV 可改变后续流。",
    "aliases": [
      "Rabbit",
      "八组状态与计数器生成密钥流"
    ],
    "sources": [
      {
        "id": "r4503",
        "title": "RFC 4503 — The Rabbit Cipher",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4503.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2–4"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Rabbit"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Rabbit 用八个 32 位状态字和八个计数器构成内部状态，非线性平方变换及状态组合每次生成 128 位密钥流；消息再与密钥流异或。"
        ],
        "sourceIds": [
          "r4503",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "一次密钥流输出为 128 位",
            "output": "可与 16 字节消息片段逐字节异或",
            "explanation": "128÷8=16；超过一段要继续推进状态而非重复第一段。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key 是 16 字节，IV 可为 8 字节；本站 Big/Little 选择是对字节序的不同约定，要与题目实现一致。",
          "字节序变化会改变结果，不能把 Big 与 Little 当成输出显示差异；同一密钥和 IV 的流不可重复使用。"
        ],
        "sourceIds": [
          "engine",
          "r4503"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:RC2%20Encrypt",
    "capabilityIds": [
      "pair:RC2%20Encrypt"
    ],
    "relatedIds": [
      "pair:RC2%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "RC2",
    "summary": "64 位分组经过 mixing 与 mashing 两种更新。",
    "aliases": [
      "RC2 Encrypt",
      "RC2 Decrypt",
      "16 位字上的混合与搅拌"
    ],
    "sources": [
      {
        "id": "rc2",
        "title": "RFC 2268 — A Description of the RC2 Encryption Algorithm",
        "publisher": "R. Rivest / RFC Editor",
        "url": "https://www.rfc-editor.org/rfc/rfc2268.html",
        "language": "en",
        "kind": "standard",
        "locator": "§1–3"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "RC2 Encrypt / RC2 Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "RC2 把 64 位分组分为四个 16 位字，密钥扩展得到 64 个字；加法、按位逻辑和循环移位构成 mixing，mashing 用状态相关索引加入扩展密钥。"
        ],
        "sourceIds": [
          "rc2",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "64 位输入分组",
            "output": "四个 16 位字 R[0]、R[1]、R[2]、R[3]",
            "explanation": "4×16=64，字内计算按 16 位范围处理。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站 Key 为变长字节串；填入 8 字节 IV 时使用 CBC，留空按该引擎说明为 ECB，两种方式都采用 PKCS#7。",
          "RC2 的实际密钥字节数与规范中的 effective key bits 是不同参数；不能从密钥文本长度直接断言兼容所有 RC2 实现。"
        ],
        "sourceIds": [
          "engine",
          "rc2"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:RC4%20Drop",
    "capabilityIds": [
      "op:RC4%20Drop"
    ],
    "relatedIds": [
      "op:RC4%20Drop"
    ],
    "topicGroup": "modern",
    "title": "RC4 Drop",
    "summary": "丢弃的单位是 32 位字，不是一个字节。",
    "aliases": [
      "RC4 Drop",
      "先丢弃密钥流再处理正文"
    ],
    "sources": [
      {
        "id": "r6229",
        "title": "RFC 6229 — Test Vectors for the Stream Cipher RC4",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc6229.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "RC4 Drop"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "RC4-drop 先生成并丢弃初始密钥流，然后用后续流异或正文。它旨在避开初始流的一部分统计偏差，但并不把 RC4 变成现代认证加密。"
        ],
        "sourceIds": [
          "r6229",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "丢弃数 192 dwords",
            "output": "跳过 192×4=768 字节密钥流",
            "explanation": "正文第一字节使用第 769 个密钥流字节；这是起点约定。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站 Number of dwords to drop 的 dword 为 4 字节；默认 192 dwords，相当于先跳过 768 字节。",
          "解密端必须丢弃相同数量；仅删去密文头部不等于执行 RC4-drop 的密钥流跳过。"
        ],
        "sourceIds": [
          "engine",
          "r6229"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:RC4",
    "capabilityIds": [
      "op:RC4"
    ],
    "relatedIds": [
      "op:RC4"
    ],
    "topicGroup": "modern",
    "title": "RC4",
    "summary": "256 项数组先由密钥打乱，再逐步交换并生成字节。",
    "aliases": [
      "RC4",
      "置换数组调度与密钥流"
    ],
    "sources": [
      {
        "id": "r6229",
        "title": "RFC 6229 — Test Vectors for the Stream Cipher RC4",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc6229.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "RC4"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "RC4 的 KSA 初始化并置换 0–255 的数组，PRGA 持续更新索引、交换数组元素并取出密钥流字节。输入与该流异或，加密和解密使用同一操作。"
        ],
        "sourceIds": [
          "r6229",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "输入 41，当前位置密钥流为 20（Hex）",
            "output": "61；再次异或同一流得 41",
            "explanation": "说明 XOR 还原关系，不宣称任何具体密钥会生成这里的示例 20。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Passphrase 的格式决定密钥字节；Input format 和 Output format 只决定正文/结果的字节与文本解释。",
          "流密码不自带填充或 MAC；同一密钥的同一流位置被重复使用会泄露信息，RC4 也有已知统计偏差。"
        ],
        "sourceIds": [
          "engine",
          "r6229"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:RC6%20Encrypt",
    "capabilityIds": [
      "pair:RC6%20Encrypt"
    ],
    "relatedIds": [
      "pair:RC6%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "RC6",
    "summary": "RC6-w/r/b 用字长、轮数、密钥字节数定义实例。",
    "aliases": [
      "RC6 Encrypt",
      "RC6 Decrypt",
      "四个可配置字与数据相关旋转"
    ],
    "sources": [
      {
        "id": "rc6",
        "title": "The RC6 Block Cipher",
        "publisher": "Rivest / Robshaw / Sidney / Yin（麻省理工学院）",
        "url": "https://people.csail.mit.edu/rivest/pubs/RRSY98.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "§2: RC6-w/r/b"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "RC6 Encrypt / RC6 Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "RC6 把分组分为四个 w 位字，使用模 2ʷ 加法、乘法、异或和数据相关循环移位。AES 参赛配置为 w=32、r=20，分组为 128 位。"
        ],
        "sourceIds": [
          "rc6",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "Word Size=32，四个字组成分组",
            "output": "4×32=128 位=16 字节，CBC IV 也为 16 字节",
            "explanation": "若改 w=16，分组会变为 8 字节，不能复用原 16 字节 IV。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Word Size 与 Rounds 是算法参数，改变任一项就不是同一个实例；CBC IV 长度为 4w/8 字节，工作模式及填充也须匹配。",
          "RC6 是 AES 竞赛候选而非最终的 AES；相同 16 字节密钥不能说明两个算法等价。"
        ],
        "sourceIds": [
          "engine",
          "rc6"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Salsa20",
    "capabilityIds": [
      "op:Salsa20"
    ],
    "relatedIds": [
      "op:Salsa20"
    ],
    "topicGroup": "modern",
    "title": "Salsa20",
    "summary": "模加、异或和移位在 16 个字之间传播状态。",
    "aliases": [
      "Salsa20",
      "行列 quarter-round 与 64 字节流块"
    ],
    "sources": [
      {
        "id": "salsa",
        "title": "Salsa20 — stream ciphers",
        "publisher": "libsodium 项目",
        "url": "https://doc.libsodium.org/advanced/stream_ciphers/salsa20",
        "language": "en",
        "kind": "official-doc",
        "locator": "Nonce / counter / reduced-round variants"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Salsa20"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Salsa20 在 16 个 32 位字中组织常量、密钥、nonce 和计数器，经行列 quarter-round 交替混合，再加入原状态产生 64 字节密钥流。消息与流逐字节异或。"
        ],
        "sourceIds": [
          "salsa",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "Counter=0，处理 65 字节",
            "output": "前 64 字节用流块 0，第 65 字节用流块 1 的第一字节",
            "explanation": "块计数器按 64 字节推进，不能每个字节加一次。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站接受 16/32 字节密钥、8 字节 nonce，Counter 每 64 字节前进；20/12/8 是不同轮数实例。",
          "Salsa20 与 ChaCha 的 quarter-round 和状态安排不一样，不能只换名称复用密文；该入口不附认证标签。"
        ],
        "sourceIds": [
          "engine",
          "salsa"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:SM2%20Encrypt",
    "capabilityIds": [
      "pair:SM2%20Encrypt"
    ],
    "relatedIds": [
      "pair:SM2%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "SM2",
    "summary": "临时密钥协商得到掩码和校验值，再封装密文。",
    "aliases": [
      "SM2 Encrypt",
      "SM2 Decrypt",
      "椭圆曲线临时点与 C1/C2/C3"
    ],
    "sources": [
      {
        "id": "sm2",
        "title": "GM/T 0003.4 — SM2 椭圆曲线公钥密码算法 第 4 部分 公钥加密算法",
        "publisher": "国家密码管理局",
        "url": "https://www.oscca.gov.cn/sca/xxgk/201705/1012587.shtml",
        "language": "zh-CN",
        "kind": "standard",
        "locator": "官方标准条目"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "SM2 Encrypt / SM2 Decrypt"
      },
      {
        "id": "sm2-mechanism",
        "title": "SM2 Public Key Algorithms — draft-shen-sm2-ecdsa-02（草案）",
        "publisher": "Shen / Lee，IETF Datatracker",
        "url": "https://datatracker.ietf.org/doc/html/draft-shen-sm2-ecdsa-02",
        "language": "en",
        "kind": "author-spec",
        "locator": "§7.2.1: C1 / KDF / C2 / C3"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "SM2 公钥加密用随机标量生成临时点 C1，与收件人椭圆曲线公钥计算共享点，再由 KDF 产生与明文异或的掩码 C2，使用杂凑得到校验部分 C3。"
        ],
        "sourceIds": [
          "sm2",
          "engine",
          "sm2-mechanism"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "三个部件 C1、C2、C3，选择 C1C3C2",
            "output": "输出顺序为临时点、校验值、密文正文",
            "explanation": "这是字段顺序示意，不是预设随机密文；完整算法定义对应 GM/T 0003 的公钥加密部分。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Public Key X/Y 是公钥点的坐标；Output Format 在 C1C3C2 与 C1C2C3 间选择封装次序，解密须按实际次序解释。",
          "两个格式的数学密文部件相同但次序不同；不能拿 SM2 数字签名格式去解析这里的公钥加密数据。"
        ],
        "sourceIds": [
          "engine",
          "sm2",
          "sm2-mechanism"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:SM4%20Encrypt",
    "capabilityIds": [
      "pair:SM4%20Encrypt"
    ],
    "relatedIds": [
      "pair:SM4%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "SM4",
    "summary": "128 位密钥和 128 位分组，轮密钥按逆序用于解密。",
    "aliases": [
      "SM4 Encrypt",
      "SM4 Decrypt",
      "32 轮非线性与线性变换"
    ],
    "sources": [
      {
        "id": "sm4",
        "title": "GM/T 0002 — SM4 分组密码算法",
        "publisher": "国家密码管理局",
        "url": "https://www.oscca.gov.cn/sca/xxgk/201705/1012583.shtml",
        "language": "zh-CN",
        "kind": "standard",
        "locator": "官方标准条目"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "SM4 Encrypt / SM4 Decrypt"
      },
      {
        "id": "sm4-mechanism",
        "title": "SM4 Blockcipher Algorithm — draft-ribose-cfrg-sm4-10（草案）",
        "publisher": "Tse 等作者，IETF Datatracker",
        "url": "https://datatracker.ietf.org/doc/html/draft-ribose-cfrg-sm4-10",
        "language": "en",
        "kind": "author-spec",
        "locator": "§4 / §6 / §7: 128-bit / 32 rounds"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "SM4 把分组分为四个 32 位字；每轮将三个状态字与轮密钥组合，依次作 S 盒非线性变换与线性扩散，再更新状态。共 32 轮，解密使用逆序轮密钥。"
        ],
        "sourceIds": [
          "sm4",
          "engine",
          "sm4-mechanism"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "128 位分组，分成 32 位字",
            "output": "4 个状态字，32 轮更新",
            "explanation": "128÷32=4；分组长度与轮数是两个不同维度。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key 固定 16 字节；CBC 的 IV 为 16 字节，本站也有 CFB/OFB/CTR/ECB 和 NoPadding 选项。",
          "国密算法名称不决定消息封装，工作模式和填充仍需明确；16 个文本字符不必然是 16 字节。"
        ],
        "sourceIds": [
          "engine",
          "sm4",
          "sm4-mechanism"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:TEA%20Encrypt",
    "capabilityIds": [
      "pair:TEA%20Encrypt"
    ],
    "relatedIds": [
      "pair:TEA%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "TEA",
    "summary": "以移位、加法和异或构成紧凑的轮更新。",
    "aliases": [
      "TEA Encrypt",
      "TEA Decrypt",
      "两字 Feistel 与黄金比常量"
    ],
    "sources": [
      {
        "id": "tea",
        "title": "TEA, a Tiny Encryption Algorithm",
        "publisher": "Wheeler / Needham（剑桥大学）",
        "url": "https://www.cl.cam.ac.uk/ftp/papers/djw-rmn/djw-rmn-tea.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "Encoding routine"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "TEA Encrypt / TEA Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "TEA 用两个 32 位字组成 64 位分组，密钥为四个 32 位字。每轮以左右移位、加法和异或更新半块，并累积常量 0x9E3779B9；常见配置为 32 个双轮循环。"
        ],
        "sourceIds": [
          "tea",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "2 个 32 位明文字，4 个 32 位密钥字",
            "output": "明文分组 8 字节，密钥 16 字节",
            "explanation": "这是 TEA 数据布局，可与题目中的 uint32 数组和字节序对应。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站固定 16 字节密钥，工作模式控制跨分组处理；CBC IV 为 8 字节，填充需与解密端一致。",
          "TEA、XTEA、XXTEA 的轮函数不同；不能把三者当成同一算法不同界面。"
        ],
        "sourceIds": [
          "engine",
          "tea"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Triple%20DES%20Encrypt",
    "capabilityIds": [
      "pair:Triple%20DES%20Encrypt"
    ],
    "relatedIds": [
      "pair:Triple%20DES%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "Triple DES",
    "summary": "三个 DES 步骤仍然只处理 64 位分组。",
    "aliases": [
      "Triple DES Encrypt",
      "Triple DES Decrypt",
      "加密—解密—加密的三段组合"
    ],
    "sources": [
      {
        "id": "des",
        "title": "FIPS 46-3 — Data Encryption Standard (DES)（已撤销）",
        "publisher": "美国国家标准与技术研究院 NIST",
        "url": "https://csrc.nist.gov/pubs/fips/46-3/final",
        "language": "en",
        "kind": "standard",
        "locator": "DES / TDEA"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Triple DES Encrypt / Triple DES Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "TDEA 常用 EDE 组合：先用 K1 加密、再用 K2 解密、最后用 K3 加密；反向按相反顺序撤销。分组仍是 DES 的 64 位，三把密钥扩大的是密钥材料。"
        ],
        "sourceIds": [
          "des",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "K1=K2=K3=K",
            "output": "E_K(D_K(E_K(P)))=E_K(P)",
            "explanation": "中间解密抵消一次加密，说明三段密钥若相同就退化为单 DES。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站 Key 用 24 字节表示三段 DES 密钥；Mode 和 8 字节 CBC IV 需要相同设置。",
          "24 字节表示不等于 192 位实际安全强度，也不把分组变成 24 字节；历史兼容用途不能当作新设计建议。"
        ],
        "sourceIds": [
          "engine",
          "des"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Twofish%20Encrypt",
    "capabilityIds": [
      "pair:Twofish%20Encrypt"
    ],
    "relatedIds": [
      "pair:Twofish%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "Twofish",
    "summary": "128 位分组经过 16 轮 Feistel 与输入输出白化。",
    "aliases": [
      "Twofish Encrypt",
      "Twofish Decrypt",
      "密钥相关 S 盒与 MDS 扩散"
    ],
    "sources": [
      {
        "id": "twofish",
        "title": "The Twofish Encryption Algorithm",
        "publisher": "Bruce Schneier 等设计者",
        "url": "https://www.schneier.com/academic/archives/1998/12/the_twofish_encrypti.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "128-bit block / key lengths / 16 rounds"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Twofish Encrypt / Twofish Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Twofish 使用密钥相关 S 盒、MDS 矩阵和伪 Hadamard 组合构建轮函数；128 位分组经输入白化、16 轮 Feistel 处理和输出白化。"
        ],
        "sourceIds": [
          "twofish",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "Twofish 一分组 16 字节，Blowfish 一分组 8 字节",
            "output": "同一 16 字节正文分别对应 1 个和 2 个原语分组",
            "explanation": "这是算法分组差异，不包含各自额外填充。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "密钥可为 16/24/32 字节；CBC IV 为 16 字节。填充、工作模式和输入格式需与原数据一致。",
          "Twofish 是 AES 竞赛候选，不是 Blowfish 的同名别称；两者分组长度也不同。"
        ],
        "sourceIds": [
          "engine",
          "twofish"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:XSalsa20",
    "capabilityIds": [
      "op:XSalsa20"
    ],
    "relatedIds": [
      "op:XSalsa20"
    ],
    "topicGroup": "modern",
    "title": "XSalsa20",
    "summary": "先以 HSalsa20 处理长 nonce 的前段，再生成 Salsa20 流。",
    "aliases": [
      "XSalsa20",
      "24 字节 nonce 与派生子密钥"
    ],
    "sources": [
      {
        "id": "xsalsa",
        "title": "XSalsa20 — stream ciphers",
        "publisher": "libsodium 项目",
        "url": "https://doc.libsodium.org/advanced/stream_ciphers/xsalsa20",
        "language": "en",
        "kind": "official-doc",
        "locator": "192-bit nonce / HSalsa20"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "XSalsa20"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "XSalsa20 将 24 字节 nonce 分成 16 字节与 8 字节：前段与密钥经 HSalsa20 派生子密钥，后段用作后续 Salsa20 nonce。这让 nonce 空间扩大到 192 位。"
        ],
        "sourceIds": [
          "xsalsa",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "24 字节 nonce",
            "output": "16 字节进入 HSalsa20，剩余 8 字节进入 Salsa20",
            "explanation": "16+8=24，不能直接把全部 24 字节塞进普通 Salsa20 的 8 字节 nonce 槽。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站还保留 Counter、Rounds 和字节格式；实际密钥长度及减轮变体须与题目实现核对，libsodium 的标准 XSalsa20 接口使用 32 字节密钥。",
          "长 nonce 不是消息密文前缀的自动识别规则；XSalsa20 本身仍是流密码，不自动附带消息认证。"
        ],
        "sourceIds": [
          "engine",
          "xsalsa"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:XTEA%20Encrypt",
    "capabilityIds": [
      "pair:XTEA%20Encrypt"
    ],
    "relatedIds": [
      "pair:XTEA%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "XTEA",
    "summary": "保留两字结构，但根据累计 sum 改变密钥索引。",
    "aliases": [
      "XTEA Encrypt",
      "XTEA Decrypt",
      "改进的移位组合与轮密钥选择"
    ],
    "sources": [
      {
        "id": "xtea-source",
        "title": "CyberChef 固定源码 — XTEA",
        "publisher": "GCHQ CyberChef",
        "url": "/vendor/knowledge/cyberchef/src/core/lib/TEA.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "32-bit word updates / key selection",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/lib/TEA.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "XTEA Encrypt / XTEA Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "XTEA 对两个 32 位字作交替更新，以移位、异或、加法和累计 sum 混合状态；密钥字索引依 sum 而变，与 TEA 的固定选法不同。"
        ],
        "sourceIds": [
          "xtea-source",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "32 个循环，每循环更新左、右半块各一次",
            "output": "64 次半块更新",
            "explanation": "这里只解释计数口径，不改变本站 Rounds 参数的约定。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站 Rounds 默认为 32；密钥固定 16 字节、分组为 8 字节，Mode/IV/Padding 定义跨块处理。",
          "源码中的 cycles 和资料里的 half-rounds 可能用不同计数口径；应核对两次半块更新是否算一轮。"
        ],
        "sourceIds": [
          "engine",
          "xtea-source"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:XXTEA%20Encrypt",
    "capabilityIds": [
      "pair:XXTEA%20Encrypt"
    ],
    "relatedIds": [
      "pair:XXTEA%20Encrypt"
    ],
    "topicGroup": "modern",
    "title": "XXTEA",
    "summary": "每个字同时受到前后邻居和密钥的影响。",
    "aliases": [
      "XXTEA Encrypt",
      "XXTEA Decrypt",
      "变长字数组与相邻双向扩散"
    ],
    "sources": [
      {
        "id": "xxtea",
        "title": "Correction to xtea",
        "publisher": "Wheeler / Needham（剑桥大学原稿）",
        "url": "https://www.cix.co.uk/~klockstone/xxtea.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "第 1–2 页：q=6+52/n"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "XXTEA Encrypt / XXTEA Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Corrected Block TEA 把至少两个 32 位字作为一块；更新函数同时使用前后邻居，使差异在正反方向传播。完整循环数依 n 计算为 6+floor(52/n)。"
        ],
        "sourceIds": [
          "xxtea",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "n=4 个 32 位字",
            "output": "循环数 6+floor(52/4)=19",
            "explanation": "n=2 时为 32 个循环，展示长度如何改变处理次数。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站入口主要接收 Key；实现自行按变长字数组处理数据，不能照搬 TEA 的固定 8 字节分组和 CBC IV。",
          "XXTEA 修正的是 Block TEA，不表示把 XTEA 的轮数调大；字节序和明文长度封装需要按实现核对。"
        ],
        "sourceIds": [
          "engine",
          "xxtea"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:RSA%20Sign",
    "capabilityIds": [
      "op:RSA%20Sign"
    ],
    "relatedIds": [
      "op:RSA%20Sign"
    ],
    "topicGroup": "authentication",
    "title": "RSA签名",
    "summary": "数字签名使用私钥生成，由公钥验证消息是否一致。",
    "aliases": [
      "RSA Sign",
      "对消息摘要进行私钥签名"
    ],
    "sources": [
      {
        "id": "r8017",
        "title": "RFC 8017 — PKCS #1: RSA Cryptography Specifications Version 2.2",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc8017.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3–8"
      },
      {
        "id": "mdn-sign",
        "title": "SubtleCrypto.sign()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/sign",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "RSA / ECDSA / HMAC"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "RSA Sign"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "RSA 签名先计算消息摘要，按签名编码规则组织摘要，再应用 RSA 私钥运算。它与公钥加密的编码规则不同；签名并不隐藏明文。"
        ],
        "sourceIds": [
          "r8017",
          "mdn-sign",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "2048 位 RSA 模数",
            "output": "签名原始长度 256 字节",
            "explanation": "模数长 k=2048/8=256；Hex 表示会用 512 个十六进制字符，这不是明文长度。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站输入 PEM 私钥、可选 Key Password 与 Message Digest Algorithm；验签必须使用相同摘要算法和对应公钥。",
          "不是把 RSA Encrypt 改为私钥输入就完成标准签名；摘要算法及 PKCS#1 编码需明确。"
        ],
        "sourceIds": [
          "engine",
          "r8017",
          "mdn-sign"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JWT%20Decode",
    "capabilityIds": [
      "op:JWT%20Decode"
    ],
    "relatedIds": [
      "op:JWT%20Decode"
    ],
    "topicGroup": "authentication",
    "title": "解码 JWT",
    "summary": "JWT 常见紧凑格式用点分隔头部、载荷和签名。",
    "aliases": [
      "JWT Decode",
      "拆开令牌并读取 JSON"
    ],
    "sources": [
      {
        "id": "r7519",
        "title": "RFC 7519 — JSON Web Token (JWT)",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7519.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3 / §4 / §7"
      },
      {
        "id": "jwt-cn",
        "title": "微服务平台 TSF 配置 JWT 插件",
        "publisher": "腾讯云",
        "url": "https://cloud.tencent.com/document/product/649/54707",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "JWT 结构与签名算法"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "JWT Decode"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "常见签名 JWT 是 header.payload.signature，前两段为 UTF-8 JSON 的 Base64URL 表示。解码只恢复这些可读字段，不检查签名，也不会自动判定身份真实。"
        ],
        "sourceIds": [
          "r7519",
          "jwt-cn",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "载荷段 eyJzdWIiOiJBIn0",
            "output": "{\"sub\":\"A\"}",
            "explanation": "Base64URL 解码恢复这段 JSON；示例只解码载荷，不给出任何签名验证结论。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "这个操作没有密钥参数；要检查真实性，应进入 JWT Verify 并提供正确密钥。exp、nbf、iss 等字段应按各自语义另行检查。",
          "JWT 签名不是载荷加密；能看到 sub 或 role 不表示字段可信。加密 JWT 的结构也不能套三段模型。"
        ],
        "sourceIds": [
          "engine",
          "r7519",
          "jwt-cn"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Derive%20PBKDF2%20key",
    "capabilityIds": [
      "op:Derive%20PBKDF2%20key"
    ],
    "relatedIds": [
      "op:Derive%20PBKDF2%20key"
    ],
    "topicGroup": "authentication",
    "title": "派生 PBKDF2 密钥",
    "summary": "重复计算 PRF，提高每次口令猜测的成本。",
    "aliases": [
      "Derive PBKDF2 key",
      "加盐、迭代 HMAC 和异或累计"
    ],
    "sources": [
      {
        "id": "r8018",
        "title": "RFC 8018 — PKCS #5: Password-Based Cryptography Specification Version 2.1",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc8018.html",
        "language": "en",
        "kind": "standard",
        "locator": "§5.2"
      },
      {
        "id": "r6070",
        "title": "RFC 6070 — PKCS #5: Password-Based Key Derivation Function 2 (PBKDF2) Test Vectors",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc6070.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2"
      },
      {
        "id": "mdn-kdf",
        "title": "SubtleCrypto.deriveKey()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/deriveKey",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "HKDF / PBKDF2"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Derive PBKDF2 key"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "PBKDF2 对 password、salt 和块序号计算第一轮 PRF，后续轮以先前结果继续计算，并把同块各轮结果异或；多块拼接后截为要求长度。"
        ],
        "sourceIds": [
          "r8018",
          "r6070",
          "mdn-kdf",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "RFC 测试：password、salt、1 次、HMAC-SHA1、20 字节",
            "output": "0c60c80f961f0e71f3a9b524af6012062fe037a6",
            "explanation": "这是 RFC 6070 的测试向量，只为复核算法；一次迭代不适合真实口令保护。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Passphrase、Salt、Iterations、Hashing function 和 Key size 一起定义输出；本站 Salt 留空可随机生成，保存参数才能重复得到同一密钥。",
          "盐不是需要保密的口令，迭代数也不等于密钥位数；PBKDF2 是派生而非可逆加密。"
        ],
        "sourceIds": [
          "engine",
          "r8018",
          "r6070",
          "mdn-kdf"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20X.509%20certificate",
    "capabilityIds": [
      "op:Parse%20X.509%20certificate"
    ],
    "relatedIds": [
      "op:Parse%20X.509%20certificate"
    ],
    "topicGroup": "authentication",
    "title": "解析 X.509 证书",
    "summary": "X.509 证书包含待签名内容、算法标识及 CA 签名。",
    "aliases": [
      "Parse X.509 certificate",
      "读取身份、公钥和签名字段"
    ],
    "sources": [
      {
        "id": "r5280",
        "title": "RFC 5280 — Internet X.509 Public Key Infrastructure Certificate and CRL Profile",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc5280.html",
        "language": "en",
        "kind": "standard",
        "locator": "§4 / §5"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse X.509 certificate"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Certificate 序列由 tbsCertificate、signatureAlgorithm、signatureValue 组成；待签名区包含序列号、颁发者、有效期、主体、公钥和扩展。解析器把 ASN.1 字段展开给人读取。"
        ],
        "sourceIds": [
          "r5280",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "notBefore=2026-01-01，notAfter=2026-12-31",
            "output": "形成证书声明的有效期区间",
            "explanation": "这里只解释字段；当前时间位于区间内仍不能单独证明整条信任链有效。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Input format 区分 PEM、DER Hex、Base64 和 Raw；同一证书可有不同传输表示，内部证书结构不因外观改变。",
          "解析能读取字段，不等于验证证书链、域名、有效期或吊销状态；Subject 文本也不是自动可信身份。"
        ],
        "sourceIds": [
          "engine",
          "r5280"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Public%20Key%20from%20Private%20Key",
    "capabilityIds": [
      "op:Public%20Key%20from%20Private%20Key"
    ],
    "relatedIds": [
      "op:Public%20Key%20from%20Private%20Key"
    ],
    "topicGroup": "authentication",
    "title": "从私钥提取公钥",
    "summary": "公钥可由私钥信息导出，反方向通常不可行。",
    "aliases": [
      "Public Key from Private Key",
      "从私钥参数导出对应公钥"
    ],
    "sources": [
      {
        "id": "r8017",
        "title": "RFC 8017 — PKCS #1: RSA Cryptography Specifications Version 2.2",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc8017.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3–8"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Public Key from Private Key"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "RSA 私钥结构通常包含 n 和 e，可直接组成公钥；椭圆曲线私钥标量 d 可计算 Q=dG 作为公钥。导出公钥不需要把秘密参数放进公钥文件。"
        ],
        "sourceIds": [
          "r8017",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "RSA 私钥包含 n=33、e=3、d=7（教学数）",
            "output": "对应公钥数学参数为 (n=33,e=3)",
            "explanation": "d 不进入公钥；这组小数只解释字段角色，不能用于保护数据。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "输入有效的私钥容器；输出的 PEM 公钥只含公有数学信息，容器标签要与所用算法兼容。",
          "导出公钥不是把私钥文本删去几行；无法据此从一个公钥重建其私钥。"
        ],
        "sourceIds": [
          "engine",
          "r8017"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Public%20Key%20from%20Certificate",
    "capabilityIds": [
      "op:Public%20Key%20from%20Certificate"
    ],
    "relatedIds": [
      "op:Public%20Key%20from%20Certificate"
    ],
    "topicGroup": "authentication",
    "title": "从证书提取公钥",
    "summary": "证书携带主体公钥和该公钥的算法参数。",
    "aliases": [
      "Public Key from Certificate",
      "提取 SubjectPublicKeyInfo"
    ],
    "sources": [
      {
        "id": "r5280",
        "title": "RFC 5280 — Internet X.509 Public Key Infrastructure Certificate and CRL Profile",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc5280.html",
        "language": "en",
        "kind": "standard",
        "locator": "§4 / §5"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Public Key from Certificate"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "X.509 的 subjectPublicKeyInfo 由算法标识和公钥位串组成。提取操作解开证书容器，只输出其中主体的公钥，不输出 CA 签名或私钥。"
        ],
        "sourceIds": [
          "r5280",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "证书主体为 example.invalid，签发者为示例 CA",
            "output": "提取的是 example.invalid 的主体公钥",
            "explanation": "Issuer 和 Subject 在证书里担任不同角色，不应混淆。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "输入正确的证书；若 PEM 标签、Base64 或 DER 结构损坏，提取无法靠文件扩展名补救。",
          "证书公钥属于 Subject，不是 Issuer 的 CA 公钥；提取成功并未验证证书自身的签名或身份。"
        ],
        "sourceIds": [
          "engine",
          "r5280"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:CMAC",
    "capabilityIds": [
      "op:CMAC"
    ],
    "relatedIds": [
      "op:CMAC"
    ],
    "topicGroup": "authentication",
    "title": "分组密码消息认证码",
    "summary": "使用分组密码和末块子密钥计算带密钥的标签。",
    "aliases": [
      "CMAC",
      "分组密码生成消息认证码"
    ],
    "sources": [
      {
        "id": "r4493",
        "title": "RFC 4493 — The AES-CMAC Algorithm",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4493.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2 / §4"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "CMAC"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "CMAC 先由分组密码生成两个子密钥；消息按块串联处理，完整末块使用 K1，不完整末块补 1 和零后使用 K2，得到最终认证码。"
        ],
        "sourceIds": [
          "r4493",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "RFC 4493：AES key=2b7e151628aed2a6abf7158809cf4f3c，空消息",
            "output": "bb1d6929e95937287fa37d129b756746",
            "explanation": "空消息也要进行末块规则处理，这是 AES-CMAC 的标准测试向量。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Encryption algorithm 可选 AES 或 Triple DES；Key 是认证密钥，不是附在消息中的公有校验和。",
          "CMAC 不提供消息机密性；它与 HMAC 的核心不同，前者用分组密码，后者用哈希。"
        ],
        "sourceIds": [
          "engine",
          "r4493"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:HMAC",
    "capabilityIds": [
      "op:HMAC"
    ],
    "relatedIds": [
      "op:HMAC"
    ],
    "topicGroup": "authentication",
    "title": "哈希消息认证码",
    "summary": "通过 ipad、opad 两层结构绑定消息与密钥。",
    "aliases": [
      "HMAC",
      "内外两层带密钥哈希"
    ],
    "sources": [
      {
        "id": "r2104",
        "title": "RFC 2104 — HMAC: Keyed-Hashing for Message Authentication",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc2104.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2"
      },
      {
        "id": "r4231",
        "title": "RFC 4231 — Identifiers and Test Vectors for HMAC-SHA-224/256/384/512",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4231.html",
        "language": "en",
        "kind": "standard",
        "locator": "§4.2"
      },
      {
        "id": "aliyun",
        "title": "边缘脚本加解密与摘要函数",
        "publisher": "阿里云",
        "url": "https://help.aliyun.com/zh/cdn/user-guide/cipher-algorithm-functions",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "aes_new / hmac"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "HMAC"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "HMAC 先把密钥规范到哈希块长，计算 H((K⊕opad)||H((K⊕ipad)||message))。内外两层固定掩码把密钥与消息绑定；不是简单拼接密钥后做一次哈希。"
        ],
        "sourceIds": [
          "r2104",
          "r4231",
          "aliyun",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "RFC 4231：20 个 0b 密钥字节，消息 Hi There，HMAC-SHA256",
            "output": "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7",
            "explanation": "这是独立标准测试向量；密钥是重复的字节 0b，不是文本字符“0b”。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key 格式与 Hashing function 决定实际字节和摘要；验证端必须用同一秘密密钥与同一哈希算法重新计算。",
          "普通 SHA256(message) 没有共享秘密，不能替代 HMAC；知道 HMAC 输出不能直接解出消息。"
        ],
        "sourceIds": [
          "engine",
          "r2104",
          "r4231",
          "aliyun"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Flask%20Session%20Decode",
    "capabilityIds": [
      "op:Flask%20Session%20Decode"
    ],
    "relatedIds": [
      "op:Flask%20Session%20Decode"
    ],
    "topicGroup": "authentication",
    "title": "解码 Flask 会话",
    "summary": "会话 cookie 可读，但真实性依赖另外的签名校验。",
    "aliases": [
      "Flask Session Decode",
      "读取签名会话的 JSON 载荷"
    ],
    "sources": [
      {
        "id": "flask-intro",
        "title": "Flask Quickstart — Sessions",
        "publisher": "Pallets Flask 项目",
        "url": "https://flask.palletsprojects.com/en/stable/quickstart/#sessions",
        "language": "en",
        "kind": "official-doc",
        "locator": "Sessions: signed but not encrypted"
      },
      {
        "id": "itsdangerous",
        "title": "URL Safe Serialization",
        "publisher": "Pallets ItsDangerous 项目",
        "url": "https://itsdangerous.palletsprojects.com/en/stable/url_safe/",
        "language": "en",
        "kind": "official-doc",
        "locator": "URLSafeSerializer / URLSafeTimedSerializer"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Flask Session Decode"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Flask 默认会话使用客户端 cookie 保存经过序列化的数据，由 ItsDangerous 添加签名。载荷常以 URL-safe Base64 表示，也可能带压缩标记；解码还原 JSON，不要求秘密密钥。"
        ],
        "sourceIds": [
          "flask-intro",
          "itsdangerous",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "载荷片段 eyJuIjoxfQ",
            "output": "{\"n\":1}",
            "explanation": "这里只解读载荷，未构造完整 cookie，也未证明任何服务端会话有效。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "View TimeStamp 可展示时间戳；应保留 cookie 的压缩标记、载荷、时间戳和签名边界，不能按普通 Base64 一口气解整串。",
          "默认 signed session 没有把载荷加密；解出字段不表示其签名有效。"
        ],
        "sourceIds": [
          "engine",
          "flask-intro",
          "itsdangerous"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20ASN.1%20hex%20string",
    "capabilityIds": [
      "op:Parse%20ASN.1%20hex%20string"
    ],
    "relatedIds": [
      "op:Parse%20ASN.1%20hex%20string"
    ],
    "topicGroup": "authentication",
    "title": "解析 ASN.1 十六进制",
    "summary": "ASN.1 类型借助 BER/DER 的 TLV 结构编码。",
    "aliases": [
      "Parse ASN.1 hex string",
      "按标签、长度和值展开树"
    ],
    "sources": [
      {
        "id": "asn1",
        "title": "X.690: ASN.1 encoding rules",
        "publisher": "国际电信联盟 ITU-T",
        "url": "https://www.itu.int/rec/T-REC-X.690",
        "language": "en",
        "kind": "standard",
        "locator": "BER / CER / DER / Object Identifier"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse ASN.1 hex string"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "TLV 的标签描述类型，长度描述后续值的字节数，值再依类型解释。构造型标签可含嵌套元素，DER 对同一值要求确定的编码方式。"
        ],
        "sourceIds": [
          "asn1",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "02 01 2a",
            "output": "INTEGER，长度 1，值 42",
            "explanation": "02 是 INTEGER 标签，01 是内容长一字节，2a 的十进制值为 42。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Starting index 控制起始偏移；Truncate octet strings longer than 只缩短展示，不改变原值。输入必须是字节的十六进制表示。",
          "遇到 30 不应无条件判定整段为证书；ASN.1 序列可用于许多协议，结构解析也不等于签名校验。"
        ],
        "sourceIds": [
          "engine",
          "asn1"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Bcrypt%20parse",
    "capabilityIds": [
      "op:Bcrypt%20parse"
    ],
    "relatedIds": [
      "op:Bcrypt%20parse"
    ],
    "topicGroup": "authentication",
    "title": "解析 Bcrypt 哈希",
    "summary": "bcrypt 文本同时携带参数与校验材料。",
    "aliases": [
      "Bcrypt parse",
      "拆解版本、成本、盐和哈希"
    ],
    "sources": [
      {
        "id": "bcrypt",
        "title": "A Future-Adaptable Password Scheme",
        "publisher": "Niels Provos / David Mazières，USENIX 1999",
        "url": "https://www.usenix.org/legacy/events/usenix99/provos/provos.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "§5: bcrypt / EksBlowfish"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Bcrypt parse"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "常见 bcrypt 串以 $2b$cost$ 开始；随后 22 个 bcrypt 字母表字符表示盐，其余表示哈希结果。成本是指数参数，计算规模随 2^cost 增长。"
        ],
        "sourceIds": [
          "bcrypt",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "前缀 $2b$12$",
            "output": "版本 2b，cost=12，调度成本量级 2¹²=4096",
            "explanation": "这里只分析前缀；它还不是一个完整可校验的 bcrypt 哈希串。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "该操作读取已有哈希串，输出版本、成本、盐及校验值；不需要待测口令。",
          "解析盐和哈希不等于恢复原口令，bcrypt 的编码字母表也不是普通 RFC 4648 Base64。"
        ],
        "sourceIds": [
          "engine",
          "bcrypt"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20PGP%20Key",
    "capabilityIds": [
      "op:Parse%20PGP%20Key"
    ],
    "relatedIds": [
      "op:Parse%20PGP%20Key"
    ],
    "topicGroup": "authentication",
    "title": "解析 PGP 密钥",
    "summary": "OpenPGP 密钥由不同版本的主钥、子钥与签名包构成。",
    "aliases": [
      "Parse PGP Key",
      "解析版本、指纹和数据包"
    ],
    "sources": [
      {
        "id": "r9580",
        "title": "RFC 9580 — OpenPGP",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9580.html",
        "language": "en",
        "kind": "standard",
        "locator": "§5 / §6 / §13"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse PGP Key"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "解析器读取密钥包版本和公有参数，再显示用户标识、指纹或子密钥等结构。v4 和 v6 的包格式、指纹构造并不相同，不能仅按 ASCII armor 外观判断。"
        ],
        "sourceIds": [
          "r9580",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "v4 公钥指纹长度为 20 字节",
            "output": "用十六进制表示为 40 个字符",
            "explanation": "每字节写成两位 Hex；这条尺寸规则不能直接套给 v6 指纹。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "输入完整 PGP key 数据，本站目录明确支持 v4 或 v6；保留 armor 头尾和内部编码，避免截断包。",
          "能读出 Name/Email 不等于证明身份；指纹才是比对同一密钥的关键材料，仍需可靠渠道核对。"
        ],
        "sourceIds": [
          "engine",
          "r9580"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20SSH%20Host%20Key",
    "capabilityIds": [
      "op:Parse%20SSH%20Host%20Key"
    ],
    "relatedIds": [
      "op:Parse%20SSH%20Host%20Key"
    ],
    "topicGroup": "authentication",
    "title": "解析 SSH 主机密钥",
    "summary": "SSH key blob 有自身的长度前缀与算法标识。",
    "aliases": [
      "Parse SSH Host Key",
      "按协议字段读取主机公钥"
    ],
    "sources": [
      {
        "id": "r4253",
        "title": "RFC 4253 — The Secure Shell (SSH) Transport Layer Protocol",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4253.html",
        "language": "en",
        "kind": "standard",
        "locator": "§6.6"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse SSH Host Key"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "SSH 公钥二进制格式使用长度前缀 string 字段，首字段通常是算法名；RSA 再带 e、n，ECDSA 带曲线名和点，Ed25519 带公钥字节。"
        ],
        "sourceIds": [
          "r4253",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "00 00 00 07 后接 ASCII ssh-rsa",
            "output": "第一个 SSH string 长度为 7，值 ssh-rsa",
            "explanation": "四字节长度用网络字节序；后续还有指数和模数等字段。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Input Format 选择 Auto、Base64 或 Hex；authorized_keys 或 known_hosts 行外还有主机名、算法名等文本，blob 需按正确边界取出。",
          "主机公钥不含主机私钥；解析 key blob 也不等于确认远端主机身份或信任 known_hosts 记录。"
        ],
        "sourceIds": [
          "engine",
          "r4253"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20X.509%20CRL",
    "capabilityIds": [
      "op:Parse%20X.509%20CRL"
    ],
    "relatedIds": [
      "op:Parse%20X.509%20CRL"
    ],
    "topicGroup": "authentication",
    "title": "解析 X.509 证书吊销列表",
    "summary": "CA 签署的吊销清单记录更新时刻与被吊销项。",
    "aliases": [
      "Parse X.509 CRL",
      "读取被吊销证书序列号"
    ],
    "sources": [
      {
        "id": "r5280",
        "title": "RFC 5280 — Internet X.509 Public Key Infrastructure Certificate and CRL Profile",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc5280.html",
        "language": "en",
        "kind": "standard",
        "locator": "§4 / §5"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse X.509 CRL"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "CRL 的待签名区包含 issuer、thisUpdate、可选 nextUpdate 和 revokedCertificates；每个吊销项至少标明证书序列号和吊销时刻。"
        ],
        "sourceIds": [
          "r5280",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "吊销条目 serialNumber=42，证书同一颁发者且 serialNumber=42",
            "output": "序列号匹配到该条吊销记录",
            "explanation": "这说明索引方式；完整可信结论还需校验清单签名和更新时间。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Input format 支持 PEM、DER Hex、Base64、Raw；序列号必须与同一颁发者的证书匹配，不能只看主体名称。",
          "解析 CRL 不自动验证其 CA 签名或是否过期；列表里没有某序列号，也需结合有效性与更新策略判断。"
        ],
        "sourceIds": [
          "engine",
          "r5280"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20CSR",
    "capabilityIds": [
      "op:Parse%20CSR"
    ],
    "relatedIds": [
      "op:Parse%20CSR"
    ],
    "topicGroup": "authentication",
    "title": "解析证书签名请求",
    "summary": "证书请求尚未成为受 CA 签署的证书。",
    "aliases": [
      "Parse CSR",
      "读取申请公钥和申请者签名"
    ],
    "sources": [
      {
        "id": "r2986",
        "title": "RFC 2986 — PKCS #10: Certification Request Syntax Specification Version 1.7",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc2986.html",
        "language": "en",
        "kind": "standard",
        "locator": "§4"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse CSR"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "PKCS#10 的 CertificationRequest 由申请信息、签名算法和签名组成。申请信息携带 subject、subjectPublicKeyInfo 和 attributes；签名由申请者私钥证明对应关系。"
        ],
        "sourceIds": [
          "r2986",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "CSR 含主体 CN=example.invalid 和申请公钥",
            "output": "得到申请身份与公钥，而非 CA 已授权的证书",
            "explanation": "这是请求与正式证书的边界；申请者自签名只能证明私钥持有关系。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站输入 PEM CSR；可从中查看申请字段和扩展请求，但 CA 最终签发的内容可能受其策略调整。",
          "CSR 没有证书有效期或 CA 证书链，不能把解析成功当成已获得受信任证书。"
        ],
        "sourceIds": [
          "engine",
          "r2986"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Derive%20EVP%20key",
    "capabilityIds": [
      "op:Derive%20EVP%20key"
    ],
    "relatedIds": [
      "op:Derive%20EVP%20key"
    ],
    "topicGroup": "authentication",
    "title": "派生 EVP 密钥",
    "summary": "EVP_BytesToKey 用前轮摘要、口令和盐继续哈希。",
    "aliases": [
      "Derive EVP key",
      "串联摘要得到旧式密钥材料"
    ],
    "sources": [
      {
        "id": "evp",
        "title": "EVP_BytesToKey",
        "publisher": "OpenSSL 项目",
        "url": "https://docs.openssl.org/3.0/man3/EVP_BytesToKey/",
        "language": "en",
        "kind": "official-doc",
        "locator": "KEY DERIVATION ALGORITHM"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Derive EVP key"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "其规则为 Dᵢ=HASH^count(Dᵢ₋₁||password||salt)，D₀ 为空；连接 D1、D2…直到材料足够，前段取密钥，后段可取 IV。它用于兼容 OpenSSL 的旧口令方案。"
        ],
        "sourceIds": [
          "evp",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "一次摘要长 16 字节，目标密钥材料需 32 字节",
            "output": "至少连接两段 16 字节摘要",
            "explanation": "第二段的输入包括第一段摘要；不能把第一次摘要简单重复两遍。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Passphrase、Key size、Iterations、Hashing function 和 Salt 必须匹配；空盐由本站操作随机生成时，要记录生成值才能复现。",
          "它不是 PBKDF2 的别称；OpenSSL 正式文档建议新应用选择更现代派生方法。"
        ],
        "sourceIds": [
          "engine",
          "evp"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Derive%20HKDF%20key",
    "capabilityIds": [
      "op:Derive%20HKDF%20key"
    ],
    "relatedIds": [
      "op:Derive%20HKDF%20key"
    ],
    "topicGroup": "authentication",
    "title": "派生 HKDF 密钥",
    "summary": "HKDF-Extract 和 HKDF-Expand 使用 HMAC 分工。",
    "aliases": [
      "Derive HKDF key",
      "先提取，再按上下文扩展"
    ],
    "sources": [
      {
        "id": "r5869",
        "title": "RFC 5869 — HMAC-based Extract-and-Expand Key Derivation Function (HKDF)",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc5869.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2 / Appendix A"
      },
      {
        "id": "mdn-kdf",
        "title": "SubtleCrypto.deriveKey()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/deriveKey",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "HKDF / PBKDF2"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Derive HKDF key"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Extract 以 salt 和输入密钥材料得到伪随机密钥 PRK；Expand 用 PRK、前一块、Info 和块序号生成 T1、T2…，取前 L 字节。Info 可使不同用途得到不同派生结果。"
        ],
        "sourceIds": [
          "r5869",
          "mdn-kdf",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "选 SHA-256，目标 L=40 字节",
            "output": "一块 32 字节不足，要生成两块并取前 40 字节",
            "explanation": "Expand 的各块依链式 HMAC 构造；不同 Info 的用途分离需保持一致。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Extract mode 可有盐、无盐或跳过；跳过提取时输入应已是合适 PRK。L 是输出字节数，不是位数。",
          "HKDF 不适合把低熵口令变难猜；迭代成本不是其目标，应使用口令派生函数处理密码。"
        ],
        "sourceIds": [
          "engine",
          "r5869",
          "mdn-kdf"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Flask%20Session%20Sign",
    "capabilityIds": [
      "op:Flask%20Session%20Sign"
    ],
    "relatedIds": [
      "op:Flask%20Session%20Sign"
    ],
    "topicGroup": "authentication",
    "title": "签署 Flask 会话",
    "summary": "签名让服务端发现客户端字段被改动。",
    "aliases": [
      "Flask Session Sign",
      "为序列化载荷附时间与 HMAC"
    ],
    "sources": [
      {
        "id": "flask",
        "title": "Flask API — SecureCookieSessionInterface",
        "publisher": "Pallets Flask 项目",
        "url": "https://flask.palletsprojects.com/en/stable/api/#flask.sessions.SecureCookieSessionInterface",
        "language": "en",
        "kind": "official-doc",
        "locator": "cookie-session / signing / serializer"
      },
      {
        "id": "itsdangerous",
        "title": "URL Safe Serialization",
        "publisher": "Pallets ItsDangerous 项目",
        "url": "https://itsdangerous.palletsprojects.com/en/stable/url_safe/",
        "language": "en",
        "kind": "official-doc",
        "locator": "URLSafeSerializer / URLSafeTimedSerializer"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Flask Session Sign"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "会话对象先用 Flask 的序列化规则转成载荷，再由带上下文盐的 ItsDangerous 签名器添加时间与认证码。cookie 中保留载荷，所以它可被用户解码阅读。"
        ],
        "sourceIds": [
          "flask",
          "itsdangerous",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "Salt=cookie-session 与相同密钥、相同 JSON",
            "output": "生成的认证材料绑定该会话上下文",
            "explanation": "具体 cookie 可能随时间戳变化；这里只说明绑定关系，不捏造固定 cookie。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "输入 JSON，设置 Key、Salt 与 Algorithm；默认上下文盐 cookie-session，算法可选 sha1/sha256，须与目标 Flask 配置一致。",
          "同一 SECRET_KEY 用于不同用途时盐区分上下文；盐不等于秘密密钥，也不会把字段加密。"
        ],
        "sourceIds": [
          "engine",
          "flask",
          "itsdangerous"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JWT%20Sign",
    "capabilityIds": [
      "op:JWT%20Sign"
    ],
    "relatedIds": [
      "op:JWT%20Sign"
    ],
    "topicGroup": "authentication",
    "title": "签署 JWT",
    "summary": "签名覆盖头部与载荷的编码文本及其中的点。",
    "aliases": [
      "JWT Sign",
      "对两段 Base64URL 文本计算签名"
    ],
    "sources": [
      {
        "id": "r7515",
        "title": "RFC 7515 — JSON Web Signature (JWS)",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7515.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3 / Appendix A.3"
      },
      {
        "id": "jwt-cn",
        "title": "微服务平台 TSF 配置 JWT 插件",
        "publisher": "腾讯云",
        "url": "https://cloud.tencent.com/document/product/649/54707",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "JWT 结构与签名算法"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "JWT Sign"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "常见 JWS 签名输入是 BASE64URL(header)||\".\"||BASE64URL(payload)，再按 alg 指定 HMAC、RSA 或 ECDSA 计算第三段。JSON 内容先成为 UTF-8 字节，再编码。"
        ],
        "sourceIds": [
          "r7515",
          "jwt-cn",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "头段 H，载荷段 P",
            "output": "签名输入是 H.P，而不是把解码后的两个 JSON 直接拼接",
            "explanation": "H、P 在此是两段编码文本的占位示意，不是一条有效令牌。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Private/Secret Key 对 HS 系列是共享秘密，对 RS/ES 系列是 PEM 私钥；Header 可加入 alg 以外的头字段，算法选择须与密钥类型匹配。",
          "None 没有真实性保护；签名 JWT 的 payload 仍可读，不能把 HS256 误当 AES 加密。"
        ],
        "sourceIds": [
          "engine",
          "r7515",
          "jwt-cn"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generate%20ECDSA%20Key%20Pair",
    "capabilityIds": [
      "op:Generate%20ECDSA%20Key%20Pair"
    ],
    "relatedIds": [
      "op:Generate%20ECDSA%20Key%20Pair"
    ],
    "topicGroup": "authentication",
    "title": "生成 ECDSA 密钥对",
    "summary": "私钥标量 d 与基点 G 相乘得到公钥 Q。",
    "aliases": [
      "Generate ECDSA Key Pair",
      "曲线标量与公钥点"
    ],
    "sources": [
      {
        "id": "mdn-key",
        "title": "SubtleCrypto.generateKey()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/generateKey",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "ECDSA / RSA"
      },
      {
        "id": "r7518",
        "title": "RFC 7518 — JSON Web Algorithms (JWA)",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7518.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3.4 / §6"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate ECDSA Key Pair"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "ECDSA 在规定椭圆曲线群上选择秘密标量 d，计算 Q=dG。公钥的曲线参数决定点的含义，不同曲线上的坐标不能直接互换。"
        ],
        "sourceIds": [
          "mdn-key",
          "r7518",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "未压缩 P-256 公钥点",
            "output": "04 前缀 + 32 字节 x + 32 字节 y，共 65 字节",
            "explanation": "这只是点的表示长度，JWK 或 PEM 另有其封装。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Elliptic Curve 选择 P-256/P-384/P-521，Output Format 选择 PEM/DER/JWK；格式转换并不改变密钥点。",
          "P-256 指曲线参数规模，不代表公钥文件总长只有 256 位；文件还包含坐标、算法标识和容器结构。"
        ],
        "sourceIds": [
          "engine",
          "mdn-key",
          "r7518"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generate%20HOTP",
    "capabilityIds": [
      "op:Generate%20HOTP"
    ],
    "relatedIds": [
      "op:Generate%20HOTP"
    ],
    "topicGroup": "authentication",
    "title": "生成 HOTP 动态密码",
    "summary": "共享秘密和递增计数器决定一次性验证码。",
    "aliases": [
      "Generate HOTP",
      "计数器 HMAC 与动态截断"
    ],
    "sources": [
      {
        "id": "r4226",
        "title": "RFC 4226 — HOTP: An HMAC-Based One-Time Password Algorithm",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4226.html",
        "language": "en",
        "kind": "standard",
        "locator": "§5 / Appendix D"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate HOTP"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "HOTP 对八字节计数器计算 HMAC-SHA1，从摘要末尾取低四位作为偏移，截出四字节并去掉最高符号位，再对 10^digits 取模得到数字码。"
        ],
        "sourceIds": [
          "r4226",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "RFC 4226 秘密 ASCII 12345678901234567890，counter=0，6 位",
            "output": "755224",
            "explanation": "这是标准测试值；本站要把该秘密先写成合法 Base32 输入。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "输入为 Base32 secret，Counter 为非负计数器，Code length 可为 6–8；相同秘密与计数器产生相同代码。",
          "每生成一次须按使用方规则推进计数器；与 TOTP 不同，它不自动把当前时间作为步长。"
        ],
        "sourceIds": [
          "engine",
          "r4226"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generate%20TOTP",
    "capabilityIds": [
      "op:Generate%20TOTP"
    ],
    "relatedIds": [
      "op:Generate%20TOTP"
    ],
    "topicGroup": "authentication",
    "title": "生成 TOTP 动态密码",
    "summary": "T=floor((t−T0)/X) 把时刻映射到整数窗口。",
    "aliases": [
      "Generate TOTP",
      "把时间步长作为 HOTP 计数器"
    ],
    "sources": [
      {
        "id": "r6238",
        "title": "RFC 6238 — TOTP: Time-Based One-Time Password Algorithm",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc6238.html",
        "language": "en",
        "kind": "standard",
        "locator": "§4 / Appendix B"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Generate TOTP"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "TOTP 在 HOTP 基础上用时间窗口计数器代替事件计数器；T0 为起始秒数，X 为窗口秒长，同一窗口内 t 会得到相同计数值。"
        ],
        "sourceIds": [
          "r6238",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "RFC 示例 t=59 秒，T0=0，X=30 秒",
            "output": "T=floor(59/30)=1；标准 SHA1 八位测试值 94287082",
            "explanation": "该固定时刻来自 RFC 测试，不是声称本站当前时钟会输出这条代码。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Epoch offset(T0) 和 Interval(T1) 均以秒计；默认间隔 30 秒，secret 为 Base32，双方时钟与算法设置需一致。",
          "不是每秒都变一个代码；相邻设备时钟差可能跨窗口，验证码通过与否还取决于服务端容忍策略。"
        ],
        "sourceIds": [
          "engine",
          "r6238"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Hex%20to%20PEM",
    "capabilityIds": [
      "pair:Hex%20to%20PEM"
    ],
    "relatedIds": [
      "pair:Hex%20to%20PEM"
    ],
    "topicGroup": "authentication",
    "title": "PEM / 十六进制",
    "summary": "PEM 在 Base64 内容前后添加类型标签。",
    "aliases": [
      "Hex to PEM",
      "PEM to Hex",
      "二进制 DER 与文本 armor"
    ],
    "sources": [
      {
        "id": "r7468",
        "title": "RFC 7468 — Textual Encodings of PKIX, PKCS, and CMS Structures",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7468.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2 / §5"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Hex to PEM / PEM to Hex"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "PEM 文本表示把结构的二进制字节编码为 Base64，外加 BEGIN/END 标签。DER 是内部编码规则；PEM 只是外层文本表示，不把字节加密。"
        ],
        "sourceIds": [
          "r7468",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "Hex=010203，演示 Header=DATA",
            "output": "-----BEGIN DATA-----\nAQID\n-----END DATA-----",
            "explanation": "010203 的 Base64 是 AQID；这里只展示 armor 机制，DATA 不是有效证书声明。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Header string 决定标签，例如 CERTIFICATE 或 PUBLIC KEY；标签应与内部结构对应，双向转换须保留原 DER 字节。",
          "任意三字节加上 CERTIFICATE 标签不会成为有效证书；容器格式和内容语义是两层检查。"
        ],
        "sourceIds": [
          "engine",
          "r7468"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Hex%20to%20Object%20Identifier",
    "capabilityIds": [
      "pair:Hex%20to%20Object%20Identifier"
    ],
    "relatedIds": [
      "pair:Hex%20to%20Object%20Identifier"
    ],
    "topicGroup": "authentication",
    "title": "OID / 十六进制",
    "summary": "OID 的层级数字有专门的 ASN.1 字节表示。",
    "aliases": [
      "Hex to Object Identifier",
      "Object Identifier to Hex",
      "弧值合并与 128 进制续位"
    ],
    "sources": [
      {
        "id": "asn1",
        "title": "X.690: ASN.1 encoding rules",
        "publisher": "国际电信联盟 ITU-T",
        "url": "https://www.itu.int/rec/T-REC-X.690",
        "language": "en",
        "kind": "standard",
        "locator": "BER / CER / DER / Object Identifier"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Hex to Object Identifier / Object Identifier to Hex"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "首两级 a、b 合并为 40a+b；后续弧值用 base-128 分组，除末组外设置续位最高位。解码须沿续位收集完整弧，不能把每个字节当一个数字。"
        ],
        "sourceIds": [
          "asn1",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "1.2.840.113549",
            "output": "2a864886f70d",
            "explanation": "1×40+2=42=2a；840 用 86 48 表示，113549 用 86 f7 0d 表示。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "输入为 OID 内容的 Hex 字节，工具负责数字串双向转换；要区分 OID 内容与包含 06 标签及长度的完整 TLV。",
          "对象标识符不是 IPv4 地址；1.2.840.113549 的各弧可超过 255，不应使用一字节整数截断。"
        ],
        "sourceIds": [
          "engine",
          "asn1"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Argon2%20compare",
    "capabilityIds": [
      "op:Argon2%20compare"
    ],
    "relatedIds": [
      "op:Argon2%20compare"
    ],
    "topicGroup": "authentication",
    "title": "校验 Argon2 哈希",
    "summary": "验证待测口令是否产生同一加盐 Argon2 结果。",
    "aliases": [
      "Argon2 compare",
      "从编码串读取参数后重算"
    ],
    "sources": [
      {
        "id": "r9106",
        "title": "RFC 9106 — Argon2 Memory-Hard Function for Password Hashing and Proof-of-Work Applications",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9106.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3–4"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Argon2 compare"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Argon2 的编码串保存类型、版本、内存、迭代、并行度、盐与结果。验证时先读取这些参数，对待测口令重算，再比较结果，而不是从哈希里解密口令。"
        ],
        "sourceIds": [
          "r9106",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "编码参数 m=4096,t=3,p=1",
            "output": "验证时仍采用 4096 KiB、3 次、并行度 1",
            "explanation": "成本参数来自保存的哈希串，而非重新选择与原串无关的一组默认值。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Encoded hash 必须是完整编码串；输入是待测试口令。使用多个候选时需要逐项或在处理链中显式拆分。",
          "结果 false 表示这组口令/参数不匹配；不是算法坏了，也不能把省略盐的裸 Hex 哈希当完整编码串。"
        ],
        "sourceIds": [
          "engine",
          "r9106"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Bcrypt%20compare",
    "capabilityIds": [
      "op:Bcrypt%20compare"
    ],
    "relatedIds": [
      "op:Bcrypt%20compare"
    ],
    "topicGroup": "authentication",
    "title": "校验 Bcrypt 哈希",
    "summary": "同一口令要按保存参数重新哈希才可比较。",
    "aliases": [
      "Bcrypt compare",
      "使用哈希串内的盐与成本核对"
    ],
    "sources": [
      {
        "id": "bcrypt",
        "title": "A Future-Adaptable Password Scheme",
        "publisher": "Niels Provos / David Mazières，USENIX 1999",
        "url": "https://www.usenix.org/legacy/events/usenix99/provos/provos.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "§5: bcrypt / EksBlowfish"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Bcrypt compare"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "bcrypt 哈希串携带 salt 和 cost；比较函数读取它们，对待测口令重新执行 EksBlowfish 调度并比对所得校验值。不通过反向计算寻找明文。"
        ],
        "sourceIds": [
          "bcrypt",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "同一口令，以两个不同盐分别生成完整哈希",
            "output": "两个哈希串可以不同，但分别验证该口令都应通过",
            "explanation": "这是盐的作用推演，不提供虚构的具体随机哈希。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Hash 是已有完整 bcrypt 串；输入为待测口令。不要先用另一次随机盐生成哈希再比较两个文本是否相同。",
          "相同口令可因随机盐生成不同哈希串，但验证都可能通过；哈希串不同不能直接证明口令不同。"
        ],
        "sourceIds": [
          "engine",
          "bcrypt"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Flask%20Session%20Verify",
    "capabilityIds": [
      "op:Flask%20Session%20Verify"
    ],
    "relatedIds": [
      "op:Flask%20Session%20Verify"
    ],
    "topicGroup": "authentication",
    "title": "验证 Flask 会话",
    "summary": "使用相同秘密、盐和算法校验载荷与时间戳。",
    "aliases": [
      "Flask Session Verify",
      "重建签名输入并检查 cookie"
    ],
    "sources": [
      {
        "id": "flask",
        "title": "Flask API — SecureCookieSessionInterface",
        "publisher": "Pallets Flask 项目",
        "url": "https://flask.palletsprojects.com/en/stable/api/#flask.sessions.SecureCookieSessionInterface",
        "language": "en",
        "kind": "official-doc",
        "locator": "cookie-session / signing / serializer"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Flask Session Verify"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "签名会话把载荷与时间信息绑定；验证操作使用相同密钥和上下文盐重新计算认证码，只有完整 cookie 的签名匹配才通过。解码载荷本身不需秘密。"
        ],
        "sourceIds": [
          "flask",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "有效 cookie 中把载荷数字 1 改成 2，保留旧签名",
            "output": "原签名不再匹配新载荷",
            "explanation": "说明完整性保护；它不会自动恢复被改之前的字段。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key、Salt、Algorithm 和 View TimeStamp 与对应 Flask 配置匹配；压缩载荷标记与分段文本必须保留。",
          "签名有效不等于应用授权成立；用户标识、过期策略与服务端会话语义仍由实际服务决定。"
        ],
        "sourceIds": [
          "engine",
          "flask"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JWT%20Verify",
    "capabilityIds": [
      "op:JWT%20Verify"
    ],
    "relatedIds": [
      "op:JWT%20Verify"
    ],
    "topicGroup": "authentication",
    "title": "验证 JWT",
    "summary": "按算法和密钥重算签名，拒绝被篡改的令牌。",
    "aliases": [
      "JWT Verify",
      "验证签名与检查声明分开理解"
    ],
    "sources": [
      {
        "id": "r7519",
        "title": "RFC 7519 — JSON Web Token (JWT)",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7519.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3 / §4 / §7"
      },
      {
        "id": "jwt-cn",
        "title": "微服务平台 TSF 配置 JWT 插件",
        "publisher": "腾讯云",
        "url": "https://cloud.tencent.com/document/product/649/54707",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "JWT 结构与签名算法"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "JWT Verify"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "验证按头部 alg 与预期允许算法解释密钥，重建 header.payload 签名输入后检查第三段。HS 系列用同一共享秘密，RS/ES 系列用发件方对应公钥。"
        ],
        "sourceIds": [
          "r7519",
          "jwt-cn",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "签名有效令牌的 payload 改为其它 Base64URL 内容，签名保持不变",
            "output": "签名验证失败",
            "explanation": "签名覆盖编码后的 payload 字节；重新写 JSON 即使语义相近也可能改变签名输入。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Public/Secret Key 是 HMAC secret 或 RSA/ECDSA PEM 公钥；不得把任意头部 alg 当作信任依据，实际应用还要有自己的算法允许策略。",
          "签名校验与 exp、nbf、iss、aud 等声明检查是不同步骤；解码出来的 JSON 未通过验签前不能采信。"
        ],
        "sourceIds": [
          "engine",
          "r7519",
          "jwt-cn"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:ECDSA%20Signature%20Conversion",
    "capabilityIds": [
      "op:ECDSA%20Signature%20Conversion"
    ],
    "relatedIds": [
      "op:ECDSA%20Signature%20Conversion"
    ],
    "topicGroup": "authentication",
    "title": "转换 ECDSA 签名格式",
    "summary": "同一对 r、s 可写成 ASN.1 DER 或固定长度拼接。",
    "aliases": [
      "ECDSA Signature Conversion",
      "r/s 整数的不同容器"
    ],
    "sources": [
      {
        "id": "r7515",
        "title": "RFC 7515 — JSON Web Signature (JWS)",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7515.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3 / Appendix A.3"
      },
      {
        "id": "asn1",
        "title": "X.690: ASN.1 encoding rules",
        "publisher": "国际电信联盟 ITU-T",
        "url": "https://www.itu.int/rec/T-REC-X.690",
        "language": "en",
        "kind": "standard",
        "locator": "BER / CER / DER / Object Identifier"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "ECDSA Signature Conversion"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "ECDSA 数学签名是一对整数 (r,s)。DER 用 SEQUENCE 包两个 INTEGER，正整数高位为 1 时须添 00；P1363 与 JWS 使用约定长度的 r||s 字节，不带 DER 标签。"
        ],
        "sourceIds": [
          "r7515",
          "asn1",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "r=128，s=1，只演示 DER 数字编码",
            "output": "30 07 02 02 00 80 02 01 01",
            "explanation": "r 的 80 最高位为 1，要补 00；SEQUENCE 的内容共 7 字节。这不是一条实际消息的有效签名。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Input Format/Output Format 选择 ASN.1 HEX、P1363 HEX、JWS 或 JSON；曲线字长影响固定拼接长度，要保留必要前导零。",
          "格式转换不验证签名的数学正确性，也不会替换摘要算法；删掉整数前导零时要区分数值和容器规则。"
        ],
        "sourceIds": [
          "engine",
          "r7515",
          "asn1"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Argon2",
    "capabilityIds": [
      "op:Argon2"
    ],
    "relatedIds": [
      "op:Argon2"
    ],
    "topicGroup": "authentication",
    "title": "Argon2 哈希",
    "summary": "口令派生同时消耗内存和计算时间。",
    "aliases": [
      "Argon2",
      "内存填充、迭代和并行通道"
    ],
    "sources": [
      {
        "id": "r9106",
        "title": "RFC 9106 — Argon2 Memory-Hard Function for Password Hashing and Proof-of-Work Applications",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9106.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3–4"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Argon2"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Argon2 把内存分为通道和块，按变体规则访问并混合块，再从最终状态得到派生结果。Argon2i、Argon2d、Argon2id 的内存索引策略不同，版本参数也影响兼容性。"
        ],
        "sourceIds": [
          "r9106",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "Memory=4096 KiB，Hash length=32 字节",
            "output": "工作内存约 4 MiB，结果为 256 位",
            "explanation": "4096 KiB=4 MiB，32 字节=256 位；两项服务不同目的。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Memory 以 KiB 计，Iterations 是遍数，Parallelism 是通道数，Hash length 以字节计；Encoded hash 保存参数和盐，Raw/Hex 只有结果字节。",
          "内存成本不是输出长度；想复现必须保留盐、类型、版本及成本参数，不能对编码文本再做普通 SHA 哈希替代。"
        ],
        "sourceIds": [
          "engine",
          "r9106"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Ascon%20MAC",
    "capabilityIds": [
      "op:Ascon%20MAC"
    ],
    "relatedIds": [
      "op:Ascon%20MAC"
    ],
    "topicGroup": "authentication",
    "title": "Ascon 消息认证码",
    "summary": "Ascon-Mac 属设计者的 MAC 扩展，不是 AEAD 密文。",
    "aliases": [
      "Ascon MAC",
      "带秘密密钥的独立认证扩展"
    ],
    "sources": [
      {
        "id": "ascon",
        "title": "Ascon — Specification",
        "publisher": "Ascon 设计团队 / 格拉茨技术大学",
        "url": "https://ascon.isec.tugraz.at/specification.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "Permutation / Ascon-AEAD128 / CT-RSA 2024 MAC 文献说明"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Ascon MAC"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Ascon-Mac 用秘密密钥和 Ascon 置换吸收消息，输出认证标签。设计团队将 MAC/PRF 另列于 CT-RSA 2024 论文；NIST SP 800-232 标准化的是 AEAD、Hash、XOF，不能将独立 MAC 称为该标准的同一算法。"
        ],
        "sourceIds": [
          "ascon",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "本站 16 字节 MAC 输出，以 Hex 表示",
            "output": "32 个十六进制字符",
            "explanation": "每个字节两位 Hex；消息长度变化不会让这个固定标签变成长密文。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站 Key 是秘密字节，目录给定标签为 16 字节；结果用于消息完整性核对，不包含经过加密的明文。",
          "认证码与 Ascon-AEAD128 的密文加标签不是同一格式；上游目录概述中的标准归属必须以原规范区分。"
        ],
        "sourceIds": [
          "engine",
          "ascon"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Bcrypt",
    "capabilityIds": [
      "op:Bcrypt"
    ],
    "relatedIds": [
      "op:Bcrypt"
    ],
    "topicGroup": "authentication",
    "title": "Bcrypt 哈希",
    "summary": "EksBlowfish 用盐与口令反复扩展状态。",
    "aliases": [
      "Bcrypt",
      "自适应成本的加盐口令哈希"
    ],
    "sources": [
      {
        "id": "bcrypt",
        "title": "A Future-Adaptable Password Scheme",
        "publisher": "Niels Provos / David Mazières，USENIX 1999",
        "url": "https://www.usenix.org/legacy/events/usenix99/provos/provos.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "§5: bcrypt / EksBlowfish"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Bcrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "bcrypt 基于 EksBlowfish：在盐与口令驱动下重复进行昂贵密钥调度，再计算校验输出。成本 cost 表示重复工作按 2^cost 增长，盐使相同口令的保存结果可不同。"
        ],
        "sourceIds": [
          "bcrypt",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "cost=10 改为 cost=11",
            "output": "调度工作量量级从 1024 变为 2048，约翻倍",
            "explanation": "这是指数成本关系；实际耗时还取决于实现与设备。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Rounds 是成本指数，本站默认 10；输出编码串包含版本、cost、随机盐和哈希材料，可供 compare 直接核对。",
          "不是 Blowfish 的可逆加密；不能把 Rounds=10 理解为只执行十次简单 SHA 哈希。"
        ],
        "sourceIds": [
          "engine",
          "bcrypt"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:ECDSA%20Sign",
    "capabilityIds": [
      "op:ECDSA%20Sign"
    ],
    "relatedIds": [
      "op:ECDSA%20Sign"
    ],
    "topicGroup": "authentication",
    "title": "ECDSA签名",
    "summary": "摘要和一次性随机标量共同产生两个签名整数。",
    "aliases": [
      "ECDSA Sign",
      "临时标量决定 r/s 签名"
    ],
    "sources": [
      {
        "id": "mdn-sign",
        "title": "SubtleCrypto.sign()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/sign",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "RSA / ECDSA / HMAC"
      },
      {
        "id": "r7518",
        "title": "RFC 7518 — JSON Web Algorithms (JWA)",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7518.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3.4 / §6"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "ECDSA Sign"
      },
      {
        "id": "ecdsa-mechanism",
        "title": "FIPS 186-5 — Digital Signature Standard",
        "publisher": "美国国家标准与技术研究院 NIST",
        "url": "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf",
        "language": "en",
        "kind": "standard",
        "locator": "§6: ECDSA signature generation / verification"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "ECDSA 以临时标量 k 计算曲线点 kG，取其横坐标模 n 为 r，再计算 s=k⁻¹(z+rd) mod n；z 是按曲线规则处理的摘要，d 是私钥。"
        ],
        "sourceIds": [
          "mdn-sign",
          "r7518",
          "engine",
          "ecdsa-mechanism"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "P-256，固定长度 r||s 格式",
            "output": "32 字节 r + 32 字节 s，共 64 字节",
            "explanation": "DER 形式长度可不同；这只是签名格式尺寸，不是固定消息的随机签名结果。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站输入 PEM EC 私钥、Message Digest Algorithm 和 Output Format；同一 r/s 可编码为 DER、P1363 或 JWS。",
          "k 重复或可预测会泄露私钥，不能把课堂算式用于手工生成真实签名；签名并不加密消息。"
        ],
        "sourceIds": [
          "engine",
          "mdn-sign",
          "r7518"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:ECDSA%20Verify",
    "capabilityIds": [
      "op:ECDSA%20Verify"
    ],
    "relatedIds": [
      "op:ECDSA%20Verify"
    ],
    "topicGroup": "authentication",
    "title": "ECDSA验签",
    "summary": "验签计算的曲线点必须与 r 一致。",
    "aliases": [
      "ECDSA Verify",
      "由公钥与摘要重建验证点"
    ],
    "sources": [
      {
        "id": "mdn-sign",
        "title": "SubtleCrypto.sign()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/sign",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "RSA / ECDSA / HMAC"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "ECDSA Verify"
      },
      {
        "id": "ecdsa-mechanism",
        "title": "FIPS 186-5 — Digital Signature Standard",
        "publisher": "美国国家标准与技术研究院 NIST",
        "url": "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf",
        "language": "en",
        "kind": "standard",
        "locator": "§6: ECDSA signature generation / verification"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "验签先检查 r、s 的范围，令 w=s⁻¹ mod n，计算 u1=zw、u2=rw，取 R=u1G+u2Q；只有 R 的横坐标模 n 等于 r 才满足签名关系。"
        ],
        "sourceIds": [
          "mdn-sign",
          "engine",
          "ecdsa-mechanism"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "对同一签名，原消息增加一个 LF 字节",
            "output": "消息摘要改变，原签名通常不再通过",
            "explanation": "签名针对确切字节；不能随意规范化空格与换行后再验签。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站输入原消息、公钥、摘要算法和签名格式；消息的 Raw/Hex/Base64 选择必须还原签名时的同一字节序列。",
          "文本看起来相同但编码、换行不同会产生不同摘要；格式能解析不等于签名数学关系通过。"
        ],
        "sourceIds": [
          "engine",
          "mdn-sign"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Fernet%20Encrypt",
    "capabilityIds": [
      "pair:Fernet%20Encrypt"
    ],
    "relatedIds": [
      "pair:Fernet%20Encrypt"
    ],
    "topicGroup": "authentication",
    "title": "Fernet",
    "summary": "同一 32 字节密钥分成加密与认证两部分。",
    "aliases": [
      "Fernet Encrypt",
      "Fernet Decrypt",
      "AES-CBC 加密与 HMAC 认证封装"
    ],
    "sources": [
      {
        "id": "fernet",
        "title": "Fernet (symmetric encryption)",
        "publisher": "PyCA cryptography 项目",
        "url": "https://cryptography.io/en/latest/fernet/",
        "language": "en",
        "kind": "official-doc",
        "locator": "Key / Implementation / token timestamp"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Fernet Encrypt / Fernet Decrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "Fernet 将 32 字节密钥分作签名和加密材料，以 AES-128-CBC 加密 PKCS#7 明文，再用 HMAC-SHA256 认证版本、时间戳、IV 和密文，整体采用 URL-safe Base64。"
        ],
        "sourceIds": [
          "fernet",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "3 字节正文，PKCS#7 的 AES 16 字节块",
            "output": "正文补 13 个 0d 字节成为一个块",
            "explanation": "版本、时间、IV、HMAC 随后另行封装；此处只推演明文填充，不编造随机 token。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Key 输入为 Base64URL 编码的 32 字节；密文 token 必须保留时间戳、IV 和 MAC，解密先验证认证材料。",
          "时间戳在 token 中并非加密；Fernet 不是把任意 Base64 文本送入 AES-CBC，完整封装和认证都必不可少。"
        ],
        "sourceIds": [
          "engine",
          "fernet"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:GOST%20Sign",
    "capabilityIds": [
      "op:GOST%20Sign"
    ],
    "relatedIds": [
      "op:GOST%20Sign"
    ],
    "topicGroup": "authentication",
    "title": "GOST 消息认证",
    "summary": "该操作名为 Sign，实际选择的是分组密码 MAC 模式。",
    "aliases": [
      "GOST Sign",
      "本站实际生成对称 MAC"
    ],
    "sources": [
      {
        "id": "gost-mac-source",
        "title": "CyberChef 11.5.0 固定源码 — GOSTSign",
        "publisher": "GCHQ CyberChef",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/GOSTSign.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "mode:\"MAC\" / macLength",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/GOSTSign.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "r4357",
        "title": "RFC 4357 — Additional Cryptographic Algorithms for Use with GOST Algorithms",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4357.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2 / §6"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "GOST Sign"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "本站 GOST Sign 源码把模式设为 MAC，并用共享 Key、IV、分组密码算法和 MAC length 生成标签。它不使用椭圆曲线私钥；这里的 Sign 不能解释为 GOST R 34.10 数字签名。"
        ],
        "sourceIds": [
          "gost-mac-source",
          "r4357",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "MAC length=32 位，Hex 输出",
            "output": "4 字节标签，8 位十六进制字符",
            "explanation": "32÷8=4 字节，每字节两位 Hex；这是本站默认标签长度。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Algorithm 选择 1989/Magma/Kuznyechik，sBox 属 1989 选项；MAC length 单位为位，输出可为 Hex 或 Raw。",
          "拥有同一共享密钥的人都能生成 MAC，因此该标签不具备公私钥数字签名的角色区分。"
        ],
        "sourceIds": [
          "engine",
          "gost-mac-source",
          "r4357"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:GOST%20Verify",
    "capabilityIds": [
      "op:GOST%20Verify"
    ],
    "relatedIds": [
      "op:GOST%20Verify"
    ],
    "topicGroup": "authentication",
    "title": "GOST 消息认证校验",
    "summary": "根据消息重算分组密码 MAC 并比较提供的标签。",
    "aliases": [
      "GOST Verify",
      "用同一对称密钥核对 MAC"
    ],
    "sources": [
      {
        "id": "gost-mac-source",
        "title": "CyberChef 11.5.0 固定源码 — GOSTSign",
        "publisher": "GCHQ CyberChef",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/GOSTSign.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "mode:\"MAC\" / macLength",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/GOSTSign.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "r4357",
        "title": "RFC 4357 — Additional Cryptographic Algorithms for Use with GOST Algorithms",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4357.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2 / §6"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "GOST Verify"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "该入口与本站 GOST Sign 对应的是对称消息认证码。验证者使用相同 Key、IV、算法版本及 S 盒重算 MAC，再与 MAC 字段给定值比较。"
        ],
        "sourceIds": [
          "gost-mac-source",
          "r4357",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "消息或 IV 改变，仍提供旧 MAC",
            "output": "通常不匹配，验证失败",
            "explanation": "体现消息与参数被标签绑定；短 MAC 仍可能有随机碰撞，不能说数学上绝无碰撞。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "MAC 是待核对标签，格式必须正确解为字节；Input type 区分正文是文本还是 Hex，不能把两位 Hex 文本误作两个正文字符。",
          "不使用公钥，也不是 GOST 椭圆曲线签名验签；结果只说明这组消息和共享密钥参数对应的 MAC 是否一致。"
        ],
        "sourceIds": [
          "engine",
          "gost-mac-source",
          "r4357"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:JWK%20to%20PEM",
    "capabilityIds": [
      "pair:JWK%20to%20PEM"
    ],
    "relatedIds": [
      "pair:JWK%20to%20PEM"
    ],
    "topicGroup": "authentication",
    "title": "JWK / PEM",
    "summary": "把密钥数学参数按不同容器重新编码。",
    "aliases": [
      "JWK to PEM",
      "PEM to JWK",
      "JSON 密钥参数与 ASN.1 容器"
    ],
    "sources": [
      {
        "id": "r7517",
        "title": "RFC 7517 — JSON Web Key (JWK)",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7517.html",
        "language": "en",
        "kind": "standard",
        "locator": "§4 / Appendix A"
      },
      {
        "id": "r7518",
        "title": "RFC 7518 — JSON Web Algorithms (JWA)",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7518.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3.4 / §6"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "JWK to PEM / PEM to JWK"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "JWK 使用 JSON 字段保存密钥，例如 RSA 的 n、e，EC 的 crv、x、y；大整数多为 Base64URL 无符号表示。PEM 包裹 ASN.1 DER 结构，转换须保持相同数学参数。"
        ],
        "sourceIds": [
          "r7517",
          "r7518",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "RSA JWK 的 e=\"AQAB\"",
            "output": "指数字节 01 00 01，即 65537",
            "explanation": "先做 Base64URL 解码，再按无符号大整数读；它不是文本数字 10001。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "JWK 私钥还含秘密字段；Public/Private 的 PEM 标签取决于输入类型，不能仅靠改 BEGIN 标签把公钥变成私钥。",
          "Base64URL 参数不是十进制字符串；转换改变外观，不改变同一公钥的 n、e 或曲线点。"
        ],
        "sourceIds": [
          "engine",
          "r7517",
          "r7518"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:PGP%20Sign",
    "capabilityIds": [
      "op:PGP%20Sign"
    ],
    "relatedIds": [
      "op:PGP%20Sign"
    ],
    "topicGroup": "authentication",
    "title": "PGP签名",
    "summary": "使用发送者私钥签署消息，保留明文可读性。",
    "aliases": [
      "PGP Sign",
      "为明文附 OpenPGP 签名包"
    ],
    "sources": [
      {
        "id": "r4880",
        "title": "RFC 4880 — OpenPGP（较早规范，已由 RFC 9580 更新）",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4880.html",
        "language": "en",
        "kind": "standard",
        "locator": "§5 / §6 / §13"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "PGP Sign"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "OpenPGP 签名包携带签名类型、算法、摘要标识、签名子包和算法相关数值；签名覆盖消息与规定元数据。Clearsign 模式还规定文本规范化及 dash escaping。"
        ],
        "sourceIds": [
          "r4880",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "明文行以 - 开始，使用 OpenPGP clearsign",
            "output": "armor 内该行按 dash escaping 作 - 前缀转义",
            "explanation": "规范处理解决文本行与 armor 分隔的歧义；不展示虚构的签名数值。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "输入消息和签署者 ASCII-armoured 私钥，可填私钥口令；验签端须使用签署者公钥，而不是收件人私钥。",
          "签名本身不会隐藏明文；文本签名的换行规范与普通二进制签名不同，不能任意删改 armor 内文本。"
        ],
        "sourceIds": [
          "engine",
          "r4880"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:PGP%20Verify",
    "capabilityIds": [
      "op:PGP%20Verify"
    ],
    "relatedIds": [
      "op:PGP%20Verify"
    ],
    "topicGroup": "authentication",
    "title": "PGP验签",
    "summary": "读取签名包，按其类型核对消息与签署者公钥。",
    "aliases": [
      "PGP Verify",
      "验证签名者密钥与消息"
    ],
    "sources": [
      {
        "id": "r4880",
        "title": "RFC 4880 — OpenPGP（较早规范，已由 RFC 9580 更新）",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4880.html",
        "language": "en",
        "kind": "standard",
        "locator": "§5 / §6 / §13"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "PGP Verify"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "OpenPGP 验签使用签名包规定的摘要算法、签名类型和公钥算法，重建被签内容并检查签名。文本签名需遵守其规范化规则，不能简单对屏幕上的字符哈希。"
        ],
        "sourceIds": [
          "r4880",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "用甲私钥签署消息，使用乙公钥验证",
            "output": "除非它们实际是同一密钥对，否则验签不匹配",
            "explanation": "这展示发件人公私钥对应关系，不是用任意公钥都能验出真伪。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "本站输入签名消息和 Public key of signer；签署者指纹要经可靠渠道核对，输出字段中的用户标识不能替代指纹。",
          "签名通过只说明消息与这把公钥匹配；还需验证这把公钥确实属于预期的人。"
        ],
        "sourceIds": [
          "engine",
          "r4880"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:RSA%20Verify",
    "capabilityIds": [
      "op:RSA%20Verify"
    ],
    "relatedIds": [
      "op:RSA%20Verify"
    ],
    "topicGroup": "authentication",
    "title": "RSA验签",
    "summary": "使用公钥还原签名编码并核对原消息摘要。",
    "aliases": [
      "RSA Verify",
      "公钥检查摘要签名编码"
    ],
    "sources": [
      {
        "id": "r8017",
        "title": "RFC 8017 — PKCS #1: RSA Cryptography Specifications Version 2.2",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc8017.html",
        "language": "en",
        "kind": "standard",
        "locator": "§3–8"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "RSA Verify"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "RSA 验签根据公钥执行 RSA 验证原语，检查签名的编码结构与消息摘要。算法、签名方案和摘要必须与签署时一致，不能只比较输出是否可读。"
        ],
        "sourceIds": [
          "r8017",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "签名时消息字节为 41，验签时输入 Hex=41",
            "output": "还原同一个字节 0x41（ASCII A）",
            "explanation": "若把格式选 Raw，文本“41”是字节 34 31，与签署原文不同。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "输入 RSA Public Key、Message 和 Message Digest Algorithm；Message format 负责 Raw/Hex/Base64 还原确切原文。",
          "验签不解密正文；错误消息、错误公钥或错误摘要算法都可能使验证失败。"
        ],
        "sourceIds": [
          "engine",
          "r8017"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Scrypt",
    "capabilityIds": [
      "op:Scrypt"
    ],
    "relatedIds": [
      "op:Scrypt"
    ],
    "topicGroup": "authentication",
    "title": "Scrypt 哈希",
    "summary": "ROMix 使大规模口令尝试同时付出内存成本。",
    "aliases": [
      "Scrypt",
      "以大量内存保存并混合状态"
    ],
    "sources": [
      {
        "id": "r7914",
        "title": "RFC 7914 — The scrypt Password-Based Key Derivation Function",
        "publisher": "RFC Editor / IETF（南京大学镜像）",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7914.html",
        "language": "en",
        "kind": "standard",
        "locator": "§2 / §6"
      },
      {
        "id": "engine",
        "title": "CyberChef 随站附带的操作说明与参数",
        "publisher": "GCHQ CyberChef（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Scrypt"
      }
    ],
    "sections": [
      {
        "title": "机制与规则",
        "paragraphs": [
          "scrypt 结合 PBKDF2、BlockMix 与 ROMix，在内存数组保存状态后依数据相关位置取回混合。参数 N、r、p 决定计算、内存块和并行工作量。"
        ],
        "sourceIds": [
          "r7914",
          "engine"
        ],
        "examples": [
          {
            "label": "规则推演",
            "input": "N=16384，r=8",
            "output": "主要 ROMix 数组约 128×N×r=16777216 字节=16 MiB",
            "explanation": "这不含实现开销与并行附加缓冲；用于理解成本数量级。"
          }
        ]
      },
      {
        "title": "参数与识读边界",
        "paragraphs": [
          "Iterations(N) 必须是允许范围内的 2 的幂；Memory factor(r)、Parallelization factor(p)、Salt 和 Key length 一起定义输出。",
          "N 不是普通 PBKDF2 迭代数，也不是内存 KiB；不能只通过增加输出长度提高口令抗猜测成本。"
        ],
        "sourceIds": [
          "engine",
          "r7914"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  }
];
