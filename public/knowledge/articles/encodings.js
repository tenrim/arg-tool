// Function-specific, cited rules and verified tool boundaries.
export const articles = [
  {
    "id": "function-native:ascii",
    "capabilityIds": [
      "native:ascii"
    ],
    "relatedIds": [
      "native:ascii"
    ],
    "topicGroup": "characters",
    "title": "ASCII",
    "summary": "一个 ASCII 字符占 7 位；文字、十进制和十六进制是同一个编号的不同写法。",
    "aliases": [
      "ASCII",
      "字符编号",
      "字符表"
    ],
    "sources": [
      {
        "id": "ascii",
        "title": "ASCIIEncoding：7 位字符范围",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/zh-cn/dotnet/api/system.text.asciiencoding",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "注解：U+0000–U+007F"
      },
      {
        "id": "foundation",
        "title": "ASCII／码点／字节输入的校验与操作映射",
        "publisher": "迷雾工具箱",
        "url": "/basics/foundation.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "foundationRecipe、validateCodes"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "ASCII 为 128 个位置分配字符和控制用途。A 的编号是十进制 65，即十六进制 41、二进制 1000001；作为一个字节显示时在前面补 0，成为 01000001。",
          "文字转数字时逐个查编号；数字转文字时按所选进制解析每个独立编号，再查回字符。LF 的编号 10 表示换行，不是屏幕上能看见的两个字符“1”“0”。"
        ],
        "sourceIds": [
          "ascii",
          "foundation"
        ],
        "examples": [
          {
            "label": "两个 ASCII 字母",
            "input": "AB",
            "output": "十进制：65 66\n十六进制：41 42\n二进制字节：01000001 01000010",
            "explanation": "依次解析两个编号，反向均得到 AB。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "本入口接受的 ASCII 编号只有 0–127。中文、Emoji 和 é 超出范围，应转到 UTF-8 字节或 Unicode 码点入口。",
          "65 和 41 只有在分别声明十进制、十六进制时才都表示 A；分隔符是编号的边界，不能把 65 66 拼成一个数 6566。"
        ],
        "sourceIds": [
          "ascii",
          "foundation"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:utf8",
    "capabilityIds": [
      "native:utf8"
    ],
    "relatedIds": [
      "native:utf8"
    ],
    "topicGroup": "characters",
    "title": "UTF-8",
    "summary": "UTF-8 先取得 Unicode 码点，再把码点的有效位装入 1–4 个字节。",
    "aliases": [
      "UTF8",
      "字节",
      "中文乱码"
    ],
    "sources": [
      {
        "id": "utf8",
        "title": "RFC 3629：UTF-8",
        "publisher": "IETF／南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc3629.html",
        "language": "en",
        "kind": "standard",
        "locator": "第 3 节：UTF-8 定义"
      },
      {
        "id": "foundation",
        "title": "ASCII／码点／字节输入的校验与操作映射",
        "publisher": "迷雾工具箱",
        "url": "/basics/foundation.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "foundationRecipe、validateCodes"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "UTF-8 的字节模板依次为 0xxxxxxx、110xxxxx 10xxxxxx、1110xxxx 10xxxxxx 10xxxxxx、11110xxx 10xxxxxx 10xxxxxx 10xxxxxx。x 放码点的二进制位，10 开头的是后续字节。",
          "解码先由首字节确定总长度，再移除模板前缀，把各字节的 x 位接回一个码点。中是 U+4E2D，使用三个字节 E4 B8 AD；这三个值不是三个独立汉字。"
        ],
        "sourceIds": [
          "utf8",
          "foundation"
        ],
        "examples": [
          {
            "label": "汉字的三字节表示",
            "input": "中",
            "output": "E4 B8 AD\n11100100 10111000 10101101",
            "explanation": "把前缀 1110、10、10 去掉后，剩余位组合为 0100 111000 101101，即 0x4E2D。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "UTF-8 不把 U+D800–U+DFFF 代理码元单独编码，也不能接受任意乱序的续字节。解码乱码时先确认原始字节和字符集，而不是改字体。",
          "本入口的十六进制、二进制、八进制和十进制模式只改变每个字节的显示方式，不改变 UTF-8 字节本身。"
        ],
        "sourceIds": [
          "utf8",
          "foundation"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:radix",
    "capabilityIds": [
      "native:radix"
    ],
    "relatedIds": [
      "native:radix"
    ],
    "topicGroup": "characters",
    "title": "数字进制转换",
    "summary": "转换一个整数的记数法，不把每位数字当成字符字节。",
    "aliases": [
      "进制",
      "radix",
      "base36",
      "位权"
    ],
    "sources": [
      {
        "id": "radix",
        "title": "parseInt：基数与数字字符",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "参数 radix、描述"
      },
      {
        "id": "foundation",
        "title": "ASCII／码点／字节输入的校验与操作映射",
        "publisher": "迷雾工具箱",
        "url": "/basics/foundation.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "foundationRecipe、validateCodes"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "r 进制中，从右到左的位权是 1、r、r²……。十六进制 FF 表示 15×16+15=255；二进制 11111111 表示 128+64+32+16+8+4+2+1。",
          "转入新进制时不断除以目标基数，保存余数，最后倒序读余数。255 除 16 得 15 余 15，再除 16 得 0 余 15，所以是 FF。2–36 进制中 10–35 用字母 a–z 表示。"
        ],
        "sourceIds": [
          "radix",
          "foundation"
        ],
        "examples": [
          {
            "label": "同一整数的四种写法",
            "input": "十进制 255",
            "output": "二进制 11111111\n八进制 377\n十六进制 FF",
            "explanation": "四种写法的数值相同；反向按对应基数加总位权即可。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "这是单个有符号整数的转换；本入口校验所有数字是否小于输入基数。二进制里的“2”、八进制里的“8”都是无效数字。",
          "字符 A 的 UTF-8 字节 41 与整数十六进制 A（十进制 10）不同。数字转换不会自动把结果解释为文字。"
        ],
        "sourceIds": [
          "radix",
          "foundation"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:a1z26",
    "capabilityIds": [
      "native:a1z26"
    ],
    "relatedIds": [
      "native:a1z26"
    ],
    "topicGroup": "characters",
    "title": "A1Z26",
    "summary": "A=1、B=2，直到 Z=26，解码时一组数字对应一个字母。",
    "aliases": [
      "A1Z26",
      "字母顺序",
      "字母数字密码"
    ],
    "sources": [
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      },
      {
        "id": "foundation",
        "title": "ASCII／码点／字节输入的校验与操作映射",
        "publisher": "迷雾工具箱",
        "url": "/basics/foundation.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "foundationRecipe、validateCodes"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "A1Z26 的表由 26 个英文字母顺序组成。字母的序号从 1 起算，所以它与从 65 起算的 ASCII 大写字母编号不同。",
          "编码逐字母查序号；解码先按分隔符拆出数字，再查 1–26 表。ARG 依次是 A→1、R→18、G→7。"
        ],
        "sourceIds": [
          "chef",
          "foundation"
        ],
        "examples": [
          {
            "label": "字母序号",
            "input": "ARG",
            "output": "1 18 7",
            "explanation": "按 1、18、7 三个数字查表，得到 ARG。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "大小写不会保留为独立编码；当前基础入口只接收英文字母与空白，数字必须以空格分隔且处于 1–26。",
          "“1187”没有足够边界来确定是 1/18/7 还是其他切分。没有密钥的固定映射可以直接反查。"
        ],
        "sourceIds": [
          "chef",
          "foundation"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:invisible",
    "capabilityIds": [
      "native:invisible"
    ],
    "relatedIds": [
      "native:invisible"
    ],
    "topicGroup": "characters",
    "title": "隐藏字符检查",
    "summary": "逐码点检查零宽字符、方向控制符、特殊空格和变体选择符。",
    "aliases": [
      "零宽字符",
      "隐藏字符",
      "ZWSP",
      "方向控制"
    ],
    "sources": [
      {
        "id": "bidi",
        "title": "Unicode 双向算法 UAX #9",
        "publisher": "Unicode 联盟",
        "url": "https://www.unicode.org/reports/tr9/",
        "language": "en",
        "kind": "standard",
        "locator": "Explicit Directional Embeddings、Overrides、Isolates"
      },
      {
        "id": "invisibles",
        "title": "隐藏字符类别、扫描及清理实现",
        "publisher": "invisibles 项目（MIT）",
        "url": "/vendor/basics/invisibles.js",
        "language": "en",
        "kind": "implementation",
        "locator": "classify、scan、cleanWith"
      },
      {
        "id": "invisible-wrapper",
        "title": "隐藏字符的选择性清理与 Emoji 保留",
        "publisher": "迷雾工具箱",
        "url": "/basics/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "inspect、emojiPreserved"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "Unicode 中一些码点主要控制排版或连接，不会绘制独立可见字形。U+200B 是零宽空格；U+202E 是从右向左覆盖控制符，会影响后续文本的显示方向。",
          "检查器扫描实际字符串，报告具体码点、类别和位置。码点位置按 Unicode 标量计数；UTF-16 位置按码元计数，前面有 Emoji 时两者可能不同。"
        ],
        "sourceIds": [
          "bidi",
          "invisibles",
          "invisible-wrapper"
        ],
        "examples": [
          {
            "label": "零宽空格藏在两字母之间",
            "input": "A[U+200B]B",
            "output": "U+200B：零宽空格；码点位置 1",
            "explanation": "方括号用于说明位置；实际检查时粘贴 A 与 B 之间真实的 U+200B。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "不可见不代表多余：U+200D 可以连接 Emoji 的组成部分，变体选择符可能选择文字或 Emoji 字形。检查会报告这些字符，是否清理由另一个功能决定。",
          "检查结果针对字符串中真实的隐藏码点；输入可见文本“\\u200B”只是一串普通字符，须先做 Unicode 转义还原。"
        ],
        "sourceIds": [
          "bidi",
          "invisibles",
          "invisible-wrapper"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:roman",
    "capabilityIds": [
      "native:roman"
    ],
    "relatedIds": [
      "native:roman"
    ],
    "topicGroup": "characters",
    "title": "罗马数字",
    "summary": "I、V、X、L、C、D、M 分别表示 1、5、10、50、100、500、1000。",
    "aliases": [
      "Roman numerals",
      "罗马数字",
      "IV",
      "IX"
    ],
    "sources": [
      {
        "id": "roman",
        "title": "从罗马数字的书写错误说起",
        "publisher": "北京师范大学出版科学研究院",
        "url": "https://pub.bnu.edu.cn/jzyg1/92686.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "基本符号、右加左减"
      },
      {
        "id": "romanimpl",
        "title": "romanice 数值转换实现",
        "publisher": "romanice 项目（MIT）",
        "url": "/vendor/basics/roman-converter.js",
        "language": "en",
        "kind": "implementation",
        "locator": "toRoman、fromRoman"
      },
      {
        "id": "invisible-wrapper",
        "title": "隐藏字符的选择性清理与 Emoji 保留",
        "publisher": "迷雾工具箱",
        "url": "/basics/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "inspect、emojiPreserved"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "罗马数字不用十进制位权。相邻较小符号在较大符号右侧时相加，例如 VI=5+1；规范减法组合 IV、IX、XL、XC、CD、CM 分别表示 4、9、40、90、400、900。",
          "转换时可按千、百、十、个位分别构造规范片段再连接。2049 的千位是 MM，十位 40 是 XL，个位 9 是 IX，因此写成 MMXLIX。"
        ],
        "sourceIds": [
          "roman",
          "romanimpl",
          "invisible-wrapper"
        ],
        "examples": [
          {
            "label": "减法组合",
            "input": "2049",
            "output": "MMXLIX",
            "explanation": "2000+40+9；反向识别 MM、XL、IX 后相加得到 2049。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "本工具接受 1–3999，解码后会重新编码校验规范写法，不接受用 IC 代替 99 或 IIII 代替 IV。历史钟表写法和横线乘千写法不在这一转换范围内。",
          "Unicode 字符 Ⅳ 与两个拉丁字母 IV 的码点不同。本入口对输入做兼容正规化，以支持这些数字字形，再验证数值。"
        ],
        "sourceIds": [
          "roman",
          "romanimpl",
          "invisible-wrapper"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:invisible-clean",
    "capabilityIds": [
      "native:invisible-clean"
    ],
    "relatedIds": [
      "native:invisible-clean"
    ],
    "topicGroup": "characters",
    "title": "隐藏字符清理",
    "summary": "清理依赖字符的语义类别，不能把所有零宽码点一律删掉。",
    "aliases": [
      "删除零宽",
      "清理隐藏字符",
      "ZWJ"
    ],
    "sources": [
      {
        "id": "bidi",
        "title": "Unicode 双向算法 UAX #9",
        "publisher": "Unicode 联盟",
        "url": "https://www.unicode.org/reports/tr9/",
        "language": "en",
        "kind": "standard",
        "locator": "Explicit Directional Embeddings、Overrides、Isolates"
      },
      {
        "id": "invisibles",
        "title": "隐藏字符类别、扫描及清理实现",
        "publisher": "invisibles 项目（MIT）",
        "url": "/vendor/basics/invisibles.js",
        "language": "en",
        "kind": "implementation",
        "locator": "classify、scan、cleanWith"
      },
      {
        "id": "invisible-wrapper",
        "title": "隐藏字符的选择性清理与 Emoji 保留",
        "publisher": "迷雾工具箱",
        "url": "/basics/core.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "inspect、emojiPreserved"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "清理按零宽、特殊空格、方向控制、软连字符、标签字符、变体选择符、控制字符等类别选择目标，再逐码点决定保留或移除。零宽空格 U+200B 常能删除，但 U+200D 可能连接一个完整 Emoji。",
          "默认保留模式识别字素簇，并保留 Emoji 的连接符或标签；普通连接符和变体选择符也按保留策略处理。输出是移除选中码点后的字符串，不是把字符替换为可见编号。"
        ],
        "sourceIds": [
          "bidi",
          "invisibles",
          "invisible-wrapper"
        ],
        "examples": [
          {
            "label": "只移除零宽空格",
            "input": "A[U+200B]B",
            "output": "AB",
            "explanation": "选中零宽类别后 U+200B 被移除；示例方括号只用来说明隐藏码点。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "清理会改变文本，删除双向控制符或变体选择符可能改变显示含义。先用检查结果确定位置与类别，再选择范围。",
          "这不会还原已经丢失的字节、字体或乱码，也不会删除只是看起来相似的正常字符。"
        ],
        "sourceIds": [
          "bidi",
          "invisibles",
          "invisible-wrapper"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:codepoint",
    "capabilityIds": [
      "native:codepoint"
    ],
    "relatedIds": [
      "native:codepoint"
    ],
    "topicGroup": "characters",
    "title": "Unicode 码点",
    "summary": "U+ 后面的十六进制数是字符编号，不是文本文件中的字节。",
    "aliases": [
      "code point",
      "码位",
      "Unicode scalar"
    ],
    "sources": [
      {
        "id": "unicode",
        "title": "Unicode 指南",
        "publisher": "Python 软件基金会",
        "url": "https://docs.python.org/zh-cn/3/howto/unicode.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "定义、编码"
      },
      {
        "id": "foundation",
        "title": "ASCII／码点／字节输入的校验与操作映射",
        "publisher": "迷雾工具箱",
        "url": "/basics/foundation.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "foundationRecipe、validateCodes"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "Unicode 给字符分配码点。中是 U+4E2D，😀 是 U+1F600；相同码点可以被 UTF-8、UTF-16 或 UTF-32 编成不同的字节。",
          "文字转码点时按 Unicode 标量逐个读取编号；反向时把每个编号解释为标量，生成字符。补充平面的 Emoji 在 UTF-16 字符串里占两个码元，但在这个入口中是一个码点。"
        ],
        "sourceIds": [
          "unicode",
          "foundation"
        ],
        "examples": [
          {
            "label": "两个不同长度的码点",
            "input": "A😀",
            "output": "十六进制：41 1F600",
            "explanation": "A 的码点是 65，😀 的码点是 128512；不是 UTF-8 字节 41 F0 9F 98 80 的逐字节列表。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "有效标量排除 U+D800–U+DFFF，最大为 U+10FFFF；本入口拒绝孤立代理码元。",
          "“字数”也不能直接等于码点数：组合附加符或 Emoji 序列可能包含多个码点，却呈现成一个字素。"
        ],
        "sourceIds": [
          "unicode",
          "foundation"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Octal",
    "capabilityIds": [
      "pair:To%20Octal"
    ],
    "relatedIds": [
      "pair:To%20Octal"
    ],
    "topicGroup": "characters",
    "title": "八进制字节",
    "summary": "按每个 0–255 的字节分别转八进制，字节边界靠分隔符保留。",
    "aliases": [
      "octal",
      "八进制字节"
    ],
    "sources": [
      {
        "id": "radix",
        "title": "parseInt：基数与数字字符",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "参数 radix、描述"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "八进制使用 0–7；每位权值依次是 1、8、64。一个字节的最大值 255 写作 377，因 3×64+7×8+7=255。",
          "本操作先取得输入字节，逐字节显示八进制；解码按分隔符解析每组值，组合回字节，再由结果显示方式解释文字。"
        ],
        "sourceIds": [
          "radix",
          "chef"
        ],
        "examples": [
          {
            "label": "ASCII 字节的八进制",
            "input": "AB",
            "output": "101 102",
            "explanation": "101₈=65，102₈=66，反向字节为 41 42，即 AB。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "汉字先经过 UTF-8，会生成多组八进制字节；它不是把整个码点编号转八进制。",
          "分隔符和单组数值的范围必须匹配；没有分隔时要明确每个字节的宽度，不能任意猜拆分。"
        ],
        "sourceIds": [
          "radix",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Binary",
    "capabilityIds": [
      "pair:To%20Binary"
    ],
    "relatedIds": [
      "pair:To%20Binary"
    ],
    "topicGroup": "characters",
    "title": "二进制字节",
    "summary": "二进制字符串是字节的位表示，组宽决定怎样收回原数据。",
    "aliases": [
      "binary",
      "比特",
      "bit",
      "二进制字节"
    ],
    "sources": [
      {
        "id": "radix",
        "title": "parseInt：基数与数字字符",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "参数 radix、描述"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "二进制只使用 0 和 1。默认每个字节显示八位，高位在前；65 写成 01000001，66 写成 01000010。",
          "解码按分隔符读取位组，再将各位的 128、64、32……1 权值相加收回字节。编码里的 Byte Length 控制展示的组宽，要与实际线索的分组方式配合。"
        ],
        "sourceIds": [
          "radix",
          "chef"
        ],
        "examples": [
          {
            "label": "两组八位二进制",
            "input": "AB",
            "output": "01000001 01000010",
            "explanation": "左组 64+1=65，右组 64+2=66，反向得到 AB。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "文字形式“01000001”在没有执行二进制解码前，是八个 ASCII 数字字符，不是一个字节 41。",
          "字节展开和整个整数的二进制记数法不同；多个字节的顺序不可随意颠倒。"
        ],
        "sourceIds": [
          "radix",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Float",
    "capabilityIds": [
      "pair:To%20Float"
    ],
    "relatedIds": [
      "pair:To%20Float"
    ],
    "topicGroup": "characters",
    "title": "IEEE 754 浮点数",
    "summary": "浮点转换解释的是四字节或八字节位模式，方向名要连同输入类型一起看。",
    "aliases": [
      "IEEE754",
      "float32",
      "float64",
      "浮点",
      "端序"
    ],
    "sources": [
      {
        "id": "float",
        "title": "struct：二进制数值格式与字节序",
        "publisher": "Python 软件基金会",
        "url": "https://docs.python.org/zh-cn/3/library/struct.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "字节顺序、格式字符 f/d"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      },
      {
        "id": "float-impl",
        "title": "ToFloat 的字节到数值转换",
        "publisher": "CyberChef 11.5.0（Apache-2.0）",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/ToFloat.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run：ieee754.read、4/8 字节与有效位长度",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/operations/ToFloat.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "IEEE 754 binary32 使用 32 位，binary64 使用 64 位；位模式分别承载符号、指数和有效数字，能表示有限数、无穷和 NaN。1.0 的 binary32 位模式是 0x3F800000。",
          "本引擎 To Float 读取字节并输出数值文本，From Float 读取数值文本并写字节；使用之前选择 Float（4 字节）或 Double（8 字节），再选择大端或小端。"
        ],
        "sourceIds": [
          "float",
          "chef",
          "float-impl"
        ],
        "examples": [
          {
            "label": "binary32 的 1.0",
            "input": "字节 3F 80 00 00；大端；Float（4 字节）",
            "output": "1",
            "explanation": "反向 From Float 输入数值 1，在同样配置下得到字节 3F 80 00 00。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "大端 3F 80 00 00 与小端 00 00 80 3F 都能表示 1.0，但必须使用相应字节序。不能把四个十六进制字符当成四个原始字节。",
          "十进制 0.1 等数通常不能被有限二进制位精确表示；往返会受所选精度的舍入影响。"
        ],
        "sourceIds": [
          "float",
          "chef",
          "float-impl"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Text%20Encoding%20Brute%20Force",
    "capabilityIds": [
      "op:Text%20Encoding%20Brute%20Force"
    ],
    "relatedIds": [
      "op:Text%20Encoding%20Brute%20Force"
    ],
    "topicGroup": "characters",
    "title": "穷举文本编码",
    "summary": "同一字节序列用不同字符集解读会产生不同候选文本。",
    "aliases": [
      "乱码候选",
      "编码穷举",
      "charset"
    ],
    "sources": [
      {
        "id": "unicode",
        "title": "Unicode 指南",
        "publisher": "Python 软件基金会",
        "url": "https://docs.python.org/zh-cn/3/howto/unicode.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "定义、编码"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "字符集解码规定字节如何映射到字符。UTF-8 的 E4 B8 AD 表示中，单字节 Latin-1 会把相同三个字节分别解释成三个字符。",
          "穷举工具使用其支持的编码表逐一尝试 Encode 或 Decode，集中展示候选结果，便于与线索语言、文件声明和上下文核对。"
        ],
        "sourceIds": [
          "unicode",
          "chef"
        ],
        "examples": [
          {
            "label": "同一字节的两种解释",
            "input": "原始字节 E4 B8 AD",
            "output": "UTF-8：中\nISO-8859-1：ä¸­",
            "explanation": "Latin-1 的第三个码点 U+00AD 是软连字符，界面可能不显示；这说明只凭可见字形无法判断正确编码。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "得到可打印字符不证明字符集正确；短文本尤其可能同时适配多个编码。候选应与文件头、网页 charset 或可确认的语言一致。",
          "无法恢复已经被错误替换为问号的字符；如果原始字节已丢失，增加候选字符集不会补回信息。"
        ],
        "sourceIds": [
          "unicode",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Base",
    "capabilityIds": [
      "pair:To%20Base"
    ],
    "relatedIds": [
      "pair:To%20Base"
    ],
    "topicGroup": "characters",
    "title": "任意进制整数",
    "summary": "To Base 和 From Base 转的是一个整数，不是逐字节的 Base64。",
    "aliases": [
      "radix",
      "base36",
      "数值进制"
    ],
    "sources": [
      {
        "id": "radix",
        "title": "parseInt：基数与数字字符",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "参数 radix、描述"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "以基数 r 表示整数时，一位只能使用 0 到 r−1 的数值；超过 9 的数位用字母表示。本操作的 Radix 范围为 2–36。",
          "To Base 将十进制整数反复除以基数，倒序输出余数；From Base 按位权相加返回十进制。36 进制 Z 的值是 35，10 的值是 36。"
        ],
        "sourceIds": [
          "radix",
          "chef"
        ],
        "examples": [
          {
            "label": "36 进制的一进位",
            "input": "十进制 1295；基数 36",
            "output": "zz",
            "explanation": "35×36+35=1295；本站 To Base 默认使用小写数位，输出 zz；From Base 得到 1295。大写 ZZ 是相同数值的另一种写法。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "字母大小写的数位解释与字母表规则有关；数字必须全部属于所选基数。",
          "这一转换不会自动将十进制 65 当成字符 A，也不保留整数的前导零格式。"
        ],
        "sourceIds": [
          "radix",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Decimal",
    "capabilityIds": [
      "pair:To%20Decimal"
    ],
    "relatedIds": [
      "pair:To%20Decimal"
    ],
    "topicGroup": "characters",
    "title": "十进制字节",
    "summary": "输出每个字节的数值，输入文字的“65”不会自动等同字节 65。",
    "aliases": [
      "decimal bytes",
      "十进制字节",
      "ordinal"
    ],
    "sources": [
      {
        "id": "ascii",
        "title": "ASCIIEncoding：7 位字符范围",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/zh-cn/dotnet/api/system.text.asciiencoding",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "注解：U+0000–U+007F"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "一个字节有 256 种位模式，无符号解释为 0–255。To Decimal 逐个输出字节的整数值，From Decimal 按所选分隔符把整数收回字节。",
          "有符号模式使用相同八位位模式的不同整数解释：11111111 无符号为 255，有符号为 −1；转换时要保持双方的 signed 配置一致。"
        ],
        "sourceIds": [
          "ascii",
          "chef"
        ],
        "examples": [
          {
            "label": "逐字节十进制数组",
            "input": "Hi",
            "output": "72 105",
            "explanation": "H 的字节为 72、i 为 105；解码方向解析两组十进制数，输出 Hi。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "中文在 UTF-8 中通常产生多个十进制数值；“中”输出 228 184 173，不是 Unicode 码点 20013。",
          "在文本输入栏直接填写 65 并编码，输入字节实际为数字字符 6 和 5；需要解码方向才能得到 A。"
        ],
        "sourceIds": [
          "ascii",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Hex",
    "capabilityIds": [
      "pair:To%20Hex"
    ],
    "relatedIds": [
      "pair:To%20Hex"
    ],
    "topicGroup": "characters",
    "title": "十六进制字节",
    "summary": "一个字节拆成两个四位组，分别用 0–9、a–f 显示。",
    "aliases": [
      "hex",
      "十六进制",
      "hexadecimal"
    ],
    "sources": [
      {
        "id": "base",
        "title": "RFC 4648：Base16、Base32、Base64",
        "publisher": "IETF／南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4648.html",
        "language": "en",
        "kind": "standard",
        "locator": "第 4–8 节及第 10 节测试向量"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "十六进制每位表示四个比特。字节 01000001 拆为 0100 和 0001，分别查出 4 和 1，因此输出 41。",
          "To Hex 逐字节输出十六进制，From Hex 把两位收回一个字节。空格、0x、\\x 或百分号可以作为显示分隔方式；它们不属于字节数值本身。"
        ],
        "sourceIds": [
          "base",
          "chef"
        ],
        "examples": [
          {
            "label": "两个半字节",
            "input": "A",
            "output": "41",
            "explanation": "4×16+1=65；反向 From Hex 将 41 收回字节 0x41，即 A。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "中在 UTF-8 中是 e4 b8 ad，不能把它简化成码点 4e2d 再称为同一个字节编码。",
          "奇数个十六进制数字无法无歧义地形成完整字节；从文件抄数时同时确认前导零与字节边界。"
        ],
        "sourceIds": [
          "base",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Hex%20Content",
    "capabilityIds": [
      "pair:To%20Hex%20Content"
    ],
    "relatedIds": [
      "pair:To%20Hex%20Content"
    ],
    "topicGroup": "characters",
    "title": "Snort 十六进制内容",
    "summary": "竖线中的部分是字节，竖线外的部分是字面 ASCII 文本。",
    "aliases": [
      "Snort content",
      "hex content",
      "竖线十六进制"
    ],
    "sources": [
      {
        "id": "snort",
        "title": "Snort 3 Rule Writing Guide：content",
        "publisher": "Cisco Talos／Snort 官方文档",
        "url": "https://docs.snort.org/rules/options/payload/content",
        "language": "en",
        "kind": "official-doc",
        "locator": "ASCII 与 |HEX| 混合内容"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "Snort content 格式允许在可读文本中嵌入十六进制字节，嵌入区域用 | 包围。PK|03 04| 表示两个 ASCII 字符 PK 后接字节 03、04。",
          "编码把需要转换的字符写入 |HEX| 片段；解码只把这些片段还原为字节，再与外部文字连接。引擎可选择仅特殊字符、连空格一起转换或全部字符。"
        ],
        "sourceIds": [
          "snort",
          "chef"
        ],
        "examples": [
          {
            "label": "特殊字符嵌入",
            "input": "foo=bar",
            "output": "foo|3d|bar",
            "explanation": "等号的 ASCII 字节是 0x3D；反向将 |3d| 收回等号。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "这是 Snort 内容字符串的表示，不是 URL 的百分号编码或常规十六进制转储。",
          "竖线是格式标记而非原始数据；处理真正的竖线字符时必须按该格式转义，不能无条件删掉所有 |。"
        ],
        "sourceIds": [
          "snort",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Hexdump",
    "capabilityIds": [
      "pair:To%20Hexdump"
    ],
    "relatedIds": [
      "pair:To%20Hexdump"
    ],
    "topicGroup": "characters",
    "title": "十六进制转储",
    "summary": "转储把同一段字节同时展示为地址偏移、十六进制和可读字符。",
    "aliases": [
      "hexdump",
      "hex dump",
      "偏移",
      "ASCII列"
    ],
    "sources": [
      {
        "id": "hexdump",
        "title": "hexdump 命令手册",
        "publisher": "Oracle Solaris 官方手册",
        "url": "https://docs.oracle.com/cd/E75432_01/html/E71066/hexdump-1.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "-C：偏移、十六进制、ASCII"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "一行通常包含起始偏移、固定数量的十六进制字节和右侧 ASCII 预览。偏移 00000010 表示从文件第 16 个字节开始，不是该行内容的一部分。",
          "编码按 Width 将字节分行，生成数值列和预览列；解码从转储中取回字节。右侧不可打印字符常显示为点，点本身并不代表原始字节 2E。"
        ],
        "sourceIds": [
          "hexdump",
          "chef"
        ],
        "examples": [
          {
            "label": "读一行转储",
            "input": "00000000  41 42 00 43  |AB.C|",
            "output": "原始字节：41 42 00 43",
            "explanation": "偏移为 0；第三个字节是 NUL 00，右侧的 . 只是不可打印字符的占位。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "不要将偏移列、最后的总长度或右侧预览再次当成十六进制数据。不同转储布局应与解码器支持的格式相配。",
          "ASCII 预览无法证明文件整体是文本；二进制文件也常含少量可读片段。"
        ],
        "sourceIds": [
          "hexdump",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Text-Integer%20Conversion",
    "capabilityIds": [
      "op:Text-Integer%20Conversion"
    ],
    "relatedIds": [
      "op:Text-Integer%20Conversion"
    ],
    "topicGroup": "characters",
    "title": "文本与大整数",
    "summary": "A B C 三个字符不是三组输出，而是拼成整数 0x414243。",
    "aliases": [
      "text integer",
      "大端整数",
      "文本转整数"
    ],
    "sources": [
      {
        "id": "float",
        "title": "struct：二进制数值格式与字节序",
        "publisher": "Python 软件基金会",
        "url": "https://docs.python.org/zh-cn/3/library/struct.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "字节顺序、格式字符 f/d"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "此操作把 ASCII／Latin-1 字符值按大端排列：最左字符占最高字节，后面的每个字节令已有数乘 256，再加新字节值。",
          "ABC 对应字节 41、42、43，因此整数为 65×256²+66×256+67=4276803。输入纯数字按十进制、0x 前缀按十六进制，其他文字按字符串处理。"
        ],
        "sourceIds": [
          "float",
          "chef"
        ],
        "examples": [
          {
            "label": "三个字符组成一个整数",
            "input": "ABC",
            "output": "十六进制：0x414243\n十进制：4276803",
            "explanation": "分三组八位读取整数的高、中、低字节，即可取回 A、B、C。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "它与 To Decimal 的逐字节数组不同，也不同于把 UTF-8 字节解释为整数。引擎对字符值限制在 0–255，不能直接输入中或 Emoji。",
          "整数表示会丢失字节串的前导零个数；需要原始长度时同时保留长度资料。"
        ],
        "sourceIds": [
          "float",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Escape%20Smart%20Characters",
    "capabilityIds": [
      "op:Escape%20Smart%20Characters"
    ],
    "relatedIds": [
      "op:Escape%20Smart%20Characters"
    ],
    "topicGroup": "characters",
    "title": "智能标点替换",
    "summary": "把弯引号、长破折号等映射成普通键盘符号，是有损替换。",
    "aliases": [
      "smart quotes",
      "智能标点",
      "排版引号"
    ],
    "sources": [
      {
        "id": "unicode",
        "title": "Unicode 指南",
        "publisher": "Python 软件基金会",
        "url": "https://docs.python.org/zh-cn/3/howto/unicode.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "定义、编码"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "排版引号 “ ” 与普通双引号 \" 是不同码点；长破折号 — 与短连字符 - 也不同。该操作使用预设映射，将排版符号改成可用 ASCII 表示的近似形式。",
          "例如弯引号改成直引号，长破折号可变成两个连字符，省略号 … 可变成三个点。没有映射的字符由 Include、Remove 或替换为点的选项决定。"
        ],
        "sourceIds": [
          "unicode",
          "chef"
        ],
        "examples": [
          {
            "label": "排版字符转键盘字符",
            "input": "“Hello” — world…",
            "output": "\"Hello\" -- world...",
            "explanation": "弯引号、长破折号和单字符省略号分别使用预设 ASCII 近似替代。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "这是多对一的有损映射，不能从替换后的普通引号判断原来是左弯还是右弯。",
          "它与 Unicode 的 NFC／NFKC 正规化不同，也不会对所有非 ASCII 文字做音译。"
        ],
        "sourceIds": [
          "unicode",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Encode%20text",
    "capabilityIds": [
      "pair:Encode%20text"
    ],
    "relatedIds": [
      "pair:Encode%20text"
    ],
    "topicGroup": "characters",
    "title": "字符集编码",
    "summary": "字符集决定字符到字节的映射，正确解码必须使用相同规则。",
    "aliases": [
      "charset",
      "字符编码",
      "GBK",
      "UTF16",
      "code page"
    ],
    "sources": [
      {
        "id": "unicode",
        "title": "Unicode 指南",
        "publisher": "Python 软件基金会",
        "url": "https://docs.python.org/zh-cn/3/howto/unicode.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "定义、编码"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "编码将 Unicode 文本写成指定字符集的字节；解码将指定字符集的字节读取成 Unicode 文本。UTF-8、UTF-16LE、GBK 等有不同映射，不能因都能显示中文而互换。",
          "UTF-16LE 使用 16 位码元，小端先写低字节。A 的码元 0041 写成 41 00；UTF-8 的 A 则只有 41。"
        ],
        "sourceIds": [
          "unicode",
          "chef"
        ],
        "examples": [
          {
            "label": "同一字母的两种字节",
            "input": "A",
            "output": "UTF-8：41\nUTF-16LE：41 00\nUTF-16BE：00 41",
            "explanation": "按同样字符集反向解码，三者都还原 A；选错编码会误读字节。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "部分旧编码不能表示所有 Unicode 字符，回退替换可能丢失信息。选择字符集应优先依据文件声明、协议或可验证的原始环境。",
          "UTF-16LE 与 UTF-16BE 的字节序不同；BOM 是相关但独立的标记，不应随意将它当作正文字符。"
        ],
        "sourceIds": [
          "unicode",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Charcode",
    "capabilityIds": [
      "pair:To%20Charcode"
    ],
    "relatedIds": [
      "pair:To%20Charcode"
    ],
    "topicGroup": "characters",
    "title": "字符码转换",
    "summary": "每个 Unicode 码点可用二进制、十进制或十六进制编号表示。",
    "aliases": [
      "charcode",
      "字符码",
      "码点转换"
    ],
    "sources": [
      {
        "id": "unicode",
        "title": "Unicode 指南",
        "publisher": "Python 软件基金会",
        "url": "https://docs.python.org/zh-cn/3/howto/unicode.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "定义、编码"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "To Charcode 输出字符的 Unicode 编号，Base 决定编号所用进制。A 是十六进制 41、十进制 65；中是 4E2D、20013。",
          "From Charcode 按分隔符解析编号，生成相应字符。此操作的单位是字符编号，和 To Hex／To Decimal 的字节单位不同。"
        ],
        "sourceIds": [
          "unicode",
          "chef"
        ],
        "examples": [
          {
            "label": "汉字的码点",
            "input": "中；Base=16",
            "output": "4e2d",
            "explanation": "改为 Base=10 输出 20013；UTF-8 字节则是 e4 b8 ad，二者不是同一数组。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "补充平面字符的编号超过四位十六进制，不能固定按四个字符切分；要保留分隔符。",
          "码点与字素不同，组合字符或 Emoji 序列可能包含多个编号。"
        ],
        "sourceIds": [
          "unicode",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20BCD",
    "capabilityIds": [
      "pair:To%20BCD"
    ],
    "relatedIds": [
      "pair:To%20BCD"
    ],
    "topicGroup": "characters",
    "title": "BCD",
    "summary": "BCD 逐个十进制数字编码，不把整个数直接转成二进制。",
    "aliases": [
      "Binary Coded Decimal",
      "8421",
      "BCD",
      "压缩十进制"
    ],
    "sources": [
      {
        "id": "bcd",
        "title": "SN74LS47：BCD 到七段显示译码器",
        "publisher": "德州仪器 TI 中国官网",
        "url": "https://www.ti.com.cn/product/zh-cn/SN74LS47",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "BCD 输入、0–9 数字显示及数据表"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "常见 8421 BCD 用四位表示一个十进制数位：0→0000，5→0101，9→1001。59 分成“5”“9”后编码，得到 0101 1001。",
          "Packed 把两个四位数位放进一个字节；不打包时数位分开存储。引擎还提供 Excess-3 等不同方案，以及 IBM 8421 有符号表示，解码必须使用相同方案。"
        ],
        "sourceIds": [
          "bcd",
          "chef"
        ],
        "examples": [
          {
            "label": "两个十进制数位",
            "input": "59；8421；Packed；无符号",
            "output": "0101 1001",
            "explanation": "前四位表示十进制 5，后四位表示十进制 9；不是 8 位二进制整数 89 的数值解释。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "8421 中 1010–1111 不是普通十进制数位；有符号方案可能另用特殊半字节表示正负号。",
          "59 的普通二进制是 00111011（0x3B），Packed BCD 则是 0x59；看到十六进制 59 不能直接认定数值为 89。"
        ],
        "sourceIds": [
          "bcd",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Base64",
    "capabilityIds": [
      "pair:To%20Base64"
    ],
    "relatedIds": [
      "pair:To%20Base64"
    ],
    "topicGroup": "encoding",
    "title": "Base64",
    "summary": "每三字节合成 24 位，再拆成四组 6 位查 64 字符字母表。",
    "aliases": [
      "Base64",
      "b64",
      "填充",
      "base64url"
    ],
    "sources": [
      {
        "id": "base",
        "title": "RFC 4648：Base16、Base32、Base64",
        "publisher": "IETF／南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4648.html",
        "language": "en",
        "kind": "standard",
        "locator": "第 4–8 节及第 10 节测试向量"
      },
      {
        "id": "base64zh",
        "title": "Base64：6 位分组和 Unicode 文本",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Glossary/Base64",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "编码后大小增加、Unicode 问题"
      },
      {
        "id": "sls",
        "title": "编码解码函数的语法规则",
        "publisher": "阿里云日志服务",
        "url": "https://help.aliyun.com/zh/sls/encoding-and-decoding-functions",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "base64、url、html、hex 函数"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "标准字母表按索引 0–63 排列为 A–Z、a–z、0–9、+、/。输入单位是字节；先把三字节的 24 位连接，再从左到右拆成四组 6 位，每组转成一个 0–63 索引并查字符。",
          "尾组只有一字节时，8 位分成两组 6 位，缺的低位补零，再补两个 =；只有两字节时生成三组并补一个 =。= 记录尾组长度，解码时不产生新字节。",
          "解码先把字符查回 6 位索引，将位串连接，再按八位收回字节并去掉填充产生的尾位。中文先编码成 UTF-8 字节；Base64 不直接给汉字分配编号。"
        ],
        "sourceIds": [
          "base",
          "base64zh",
          "sls",
          "chef"
        ],
        "examples": [
          {
            "label": "三字节手算全过程",
            "input": "ARG\n字节：41 52 47\n八位：01000001 01010010 01000111",
            "output": "24 位：010000010101001001000111\n六位：010000 010101 001001 000111\n索引：16 21 9 7\n字符：Q V J H\n结果：QVJH",
            "explanation": "16→Q，21→V，9→J，7→H；反向把四组六位连回三组八位，得到 ARG。"
          },
          {
            "label": "一字节尾组",
            "input": "A：01000001",
            "output": "010000 010000 → Q Q\nQQ==",
            "explanation": "第二组低四位补零，两个 = 表示原始尾组只有一字节。"
          },
          {
            "label": "两字节尾组",
            "input": "AB：01000001 01000010",
            "output": "010000 010100 001000 → Q U I\nQUI=",
            "explanation": "第三组低两位补零，一个 = 表示原始尾组有两字节。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "标准 Base64 与 URL-safe 变体的字母表不同，后者将 +、/ 换成 -、_，填充是否省略由协议约定。只有 A–Z、a–z、0–9 外观并不足以确认编码。",
          "Base64 是公开可逆的表示，没有密钥；输出长度通常约为输入的 4/3。解码得到文件字节时，应按文件格式或字符集继续解释。"
        ],
        "sourceIds": [
          "base",
          "base64zh",
          "sls",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:escape-url",
    "capabilityIds": [
      "native:escape-url"
    ],
    "relatedIds": [
      "native:escape-url"
    ],
    "topicGroup": "encoding",
    "title": "URL 百分号编码",
    "summary": "把需要转义的字节写成 %HH，非 ASCII 文字通常先转 UTF-8。",
    "aliases": [
      "URL encode",
      "percent encoding",
      "百分号转义"
    ],
    "sources": [
      {
        "id": "url",
        "title": "RFC 3986：URI 百分号编码",
        "publisher": "IETF／南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc3986.html",
        "language": "en",
        "kind": "standard",
        "locator": "第 2.1、2.2、2.3 节"
      },
      {
        "id": "urlzh",
        "title": "百分号编码",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Glossary/Percent-encoding",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "百分号和十六进制字节"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "URI 的保留字符具有结构含义，例如 / 分路径、? 开始查询、& 分隔部分查询参数。要把它们作为数据传输，可将对应字节写成百分号加两位十六进制。",
          "中先转 UTF-8 字节 E4 B8 AD，再逐字节写成 %E4%B8%AD。解码收回三个字节后，再用 UTF-8 还原文字。"
        ],
        "sourceIds": [
          "url",
          "urlzh",
          "chef"
        ],
        "examples": [
          {
            "label": "汉字参数值",
            "input": "中",
            "output": "%E4%B8%AD",
            "explanation": "先 UTF-8，再 %HH；反向一次收回 E4 B8 AD 后按 UTF-8 读为中。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "%20 表示空格字节；+ 只在 application/x-www-form-urlencoded 等表单规则中常用于空格，并非所有 URI 中都等同 %20。",
          "对完整 URL 编码与对一个参数值编码的保留字符范围不同，不能重复编码而把 % 再写成 %25 后仍期待只解码一次。"
        ],
        "sourceIds": [
          "url",
          "urlzh",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:escape-html",
    "capabilityIds": [
      "native:escape-html"
    ],
    "relatedIds": [
      "native:escape-html"
    ],
    "topicGroup": "encoding",
    "title": "HTML 实体",
    "summary": "把有语法意义的字符或编号写成命名、十进制或十六进制引用。",
    "aliases": [
      "HTML entity",
      "字符引用",
      "HTML转义"
    ],
    "sources": [
      {
        "id": "html",
        "title": "HTML 字符引用（实体）",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Glossary/Entity",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "命名与数字字符引用"
      },
      {
        "id": "sls",
        "title": "编码解码函数的语法规则",
        "publisher": "阿里云日志服务",
        "url": "https://help.aliyun.com/zh/sls/encoding-and-decoding-functions",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "base64、url、html、hex 函数"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "HTML 用 &name;、&#十进制; 或 &#x十六进制; 表示字符引用。&lt;、&#60;、&#x3C; 都引用小于号 <。",
          "编码按选项选择命名实体、数值实体或十六进制实体；解码识别完整引用并查回字符。它针对字符码点，不是 UTF-8 每个字节。"
        ],
        "sourceIds": [
          "html",
          "sls",
          "chef"
        ],
        "examples": [
          {
            "label": "同一小于号的三种引用",
            "input": "<",
            "output": "&lt;\n&#60;\n&#x3C;",
            "explanation": "三种引用都指向 U+003C；反向得到一个小于号。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "实体用于 HTML 文本的字符表示；把它粘贴到纯文本框不会由浏览器自动当作 HTML 源码解释。",
          "对原来的 &lt; 再编码会得到 &amp;lt;，反向一次只变回 &lt;，不会同时跨两层还原。"
        ],
        "sourceIds": [
          "html",
          "sls",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20COBS",
    "capabilityIds": [
      "pair:To%20COBS"
    ],
    "relatedIds": [
      "pair:To%20COBS"
    ],
    "topicGroup": "encoding",
    "title": "COBS",
    "summary": "非零码字记录后面一段非零数据的长度，让零能作为帧边界。",
    "aliases": [
      "Consistent Overhead Byte Stuffing",
      "COBS",
      "字节填充"
    ],
    "sources": [
      {
        "id": "cobs",
        "title": "Consistent Overhead Byte Stuffing",
        "publisher": "Stuart Cheshire、Mary Baker",
        "url": "https://www.stuartcheshire.org/papers/COBSforToN/",
        "language": "en",
        "kind": "author-spec",
        "locator": "COBS 算法、编码块与 254 字节上限"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "COBS 将由零分隔的非零字节段改写成“长度码＋数据”。长度码等于该段非零字节数加 1；解码读该码、复制后面的若干字节，必要时在段间补回零。",
          "码 FF 表示后面有 254 个非零字节且这一步不补零，长段可以继续分块。编码输出本身不含零字节，协议可另外使用 00 分隔帧。"
        ],
        "sourceIds": [
          "cobs",
          "chef"
        ],
        "examples": [
          {
            "label": "中间有一个零字节",
            "input": "原始字节：11 22 00 33",
            "output": "COBS 载荷：03 11 22 02 33",
            "explanation": "03 后复制 2 字节并补 00；02 后复制最后 1 字节，末块不补零。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "这里的 00 帧分隔符与 COBS 编码载荷分开，工具输出未必自动带协议尾部 00。",
          "长度码错误或数据不够长会破坏分块；COBS 处理边界，不提供加密或错误校验。"
        ],
        "sourceIds": [
          "cobs",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:escape-hex",
    "capabilityIds": [
      "native:escape-hex"
    ],
    "relatedIds": [
      "native:escape-hex"
    ],
    "topicGroup": "encoding",
    "title": "反斜杠转义",
    "summary": "转义用反斜杠引入一个字面量表示，不等同于十六进制字节列表。",
    "aliases": [
      "hex escape",
      "字符串转义",
      "backslash"
    ],
    "sources": [
      {
        "id": "escape",
        "title": "JavaScript 词法语法",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Lexical_grammar",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "字符串字面量、转义序列"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      },
      {
        "id": "foundation",
        "title": "ASCII／码点／字节输入的校验与操作映射",
        "publisher": "迷雾工具箱",
        "url": "/basics/foundation.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "foundationRecipe、validateCodes"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "字符串语法用 \\n 表示换行、\\t 表示制表、\\\\ 表示反斜杠。\\x41 中的两位十六进制引用字符值 0x41，即 A。",
          "本入口使用 Escape string 的 Everything 级别，将普通字符写成相应转义；反向 Unescape string 把支持的转义序列还原为实际字符。"
        ],
        "sourceIds": [
          "escape",
          "chef",
          "foundation"
        ],
        "examples": [
          {
            "label": "一个 ASCII 字符",
            "input": "A",
            "output": "\\x41",
            "explanation": "反向把四个可见字符 \\、x、4、1 读成字符 A。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "\\xHH、\\uHHHH 与 URL 的 %HH 是不同语法，不能直接由同一解析规则还原。",
          "JSON 字符串没有 \\xHH 语法；启用 JSON 兼容时须使用 JSON 允许的转义写法。"
        ],
        "sourceIds": [
          "escape",
          "chef",
          "foundation"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:escape-unicode",
    "capabilityIds": [
      "native:escape-unicode"
    ],
    "relatedIds": [
      "native:escape-unicode"
    ],
    "topicGroup": "encoding",
    "title": "Unicode 转义",
    "summary": "Unicode 转义写字符编号；补充平面与代理对须按语法分清。",
    "aliases": [
      "unicode escape",
      "\\u",
      "%u",
      "U+"
    ],
    "sources": [
      {
        "id": "escape",
        "title": "JavaScript 词法语法",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Lexical_grammar",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "字符串字面量、转义序列"
      },
      {
        "id": "unicode",
        "title": "Unicode 指南",
        "publisher": "Python 软件基金会",
        "url": "https://docs.python.org/zh-cn/3/howto/unicode.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "定义、编码"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      },
      {
        "id": "foundation",
        "title": "ASCII／码点／字节输入的校验与操作映射",
        "publisher": "迷雾工具箱",
        "url": "/basics/foundation.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "foundationRecipe、validateCodes"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "常见 \\u0041 引用码点 A 的编号。JavaScript 的四位 \\uXXXX 表示 UTF-16 码元；支持的 \\u{1F600} 形式直接表示补充平面码点。",
          "本操作可选择 \\u、%u、U+ 前缀并设置位数和大小写；反向操作按其支持的前缀收回字符。U+4E2D 是中，不能将它作为 UTF-8 字节 E4 B8 AD 的缩写。"
        ],
        "sourceIds": [
          "escape",
          "unicode",
          "chef",
          "foundation"
        ],
        "examples": [
          {
            "label": "基本平面汉字",
            "input": "中",
            "output": "\\u4E2D",
            "explanation": "4E2D 为字符的 Unicode 编号，解码生成中；不按两位一组收回字节。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "U+XXXX 是文献中的码点记号，%uXXXX 是另一种转义约定，二者不都是合法 JSON 或标准 URL 百分号编码。",
          "表示 Emoji 的 \\uD83D\\uDE00 是两个代理码元构成的合法组合；孤立代理项不等于一个普通 Unicode 字符。"
        ],
        "sourceIds": [
          "escape",
          "unicode",
          "chef",
          "foundation"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Encode%20NetBIOS%20Name",
    "capabilityIds": [
      "pair:Encode%20NetBIOS%20Name"
    ],
    "relatedIds": [
      "pair:Encode%20NetBIOS%20Name"
    ],
    "topicGroup": "encoding",
    "title": "NetBIOS 一级编码",
    "summary": "把每个四位数值加上 A 的 ASCII 编号，字节长度扩大一倍。",
    "aliases": [
      "NetBIOS",
      "A-P",
      "half ASCII"
    ],
    "sources": [
      {
        "id": "netbios",
        "title": "RFC 1001：NetBIOS 名称表示",
        "publisher": "IETF／南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc1001.html",
        "language": "en",
        "kind": "standard",
        "locator": "第 14.1 节 FIRST LEVEL ENCODING"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "RFC 1001 的一级编码把 16 字节 NetBIOS 名称变成 32 个字符。每字节先分高、低两个四位组，将各组 0–15 加 0x41，得到 A–P。",
          "例如 0x41 分成 4 和 1，4+65 得 E、1+65 得 B，所以该字节编码为 EB。解码减去偏移后，把两个半字节重新合成。"
        ],
        "sourceIds": [
          "netbios",
          "chef"
        ],
        "examples": [
          {
            "label": "一个名称字节的映射",
            "input": "字节 41；Offset=65",
            "output": "EB",
            "explanation": "E−A=4，B−A=1，合成 (4×16)+1=0x41。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "完整 NetBIOS 名称的一级表示与 DNS 名称的第二级压缩不是同一步；该操作执行的是半字节映射。",
          "Offset 默认 65 对应标准 A–P；更改偏移得到的是相应自定义映射，不再是标准字母表。"
        ],
        "sourceIds": [
          "netbios",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Quoted%20Printable",
    "capabilityIds": [
      "pair:To%20Quoted%20Printable"
    ],
    "relatedIds": [
      "pair:To%20Quoted%20Printable"
    ],
    "topicGroup": "encoding",
    "title": "Quoted-Printable",
    "summary": "保留多数可打印 ASCII，把其他字节写成 = 加两位十六进制。",
    "aliases": [
      "Quoted Printable",
      "QP",
      "可打印编码"
    ],
    "sources": [
      {
        "id": "qp",
        "title": "RFC 2045：MIME 正文传输编码",
        "publisher": "IETF／南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc2045.txt",
        "language": "en",
        "kind": "standard",
        "locator": "第 6.7 节 Quoted-Printable"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "Quoted-Printable 是 MIME 的正文传输编码。大部分可打印 ASCII 可保留，其余字节按 =HH 转义；= 自身写成 =3D，避免被当成转义引导符。",
          "编码行最长 76 个字符；行尾 = 加 CRLF 是软换行，解码时移除它，连接原来的数据。真正的文本换行和软换行需要区分。"
        ],
        "sourceIds": [
          "qp",
          "chef"
        ],
        "examples": [
          {
            "label": "等号必须转义",
            "input": "A=B",
            "output": "A=3DB",
            "explanation": "A、B 保留，等号字节 3D 写为 =3D；反向还原等号。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "行尾空格与 Tab 必须按标准特别处理，否则邮件传输可能删掉它们。",
          "正文 Quoted-Printable 与邮件头 Q 编码有关但不同；Q 编码里的下划线空格规则不应套用到正文。"
        ],
        "sourceIds": [
          "qp",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Caret%2FM-decode",
    "capabilityIds": [
      "op:Caret%2FM-decode"
    ],
    "relatedIds": [
      "op:Caret%2FM-decode"
    ],
    "topicGroup": "encoding",
    "title": "脱字符与 M- 解码",
    "summary": "^ 记控制字节，M- 记最高位被置 1 的字节。",
    "aliases": [
      "caret notation",
      "M-",
      "cat -v",
      "^M"
    ],
    "sources": [
      {
        "id": "cat",
        "title": "cat 的 ^ 与 M- 可视表示",
        "publisher": "GNU Coreutils 官方手册",
        "url": "https://www.gnu.org/software/coreutils/manual/html_node/cat-invocation.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "-v / --show-nonprinting"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "终端工具 cat -v 会用脱字符记法显示不可打印字节：^A 是 0x01，^M 是回车 0x0D。常见规则是把可见 ASCII 字符的编号减 64。",
          "M- 表示该字节的第八位为 1；M-^] 先由 ^] 得 0x1D，再置高位得到 0x9D。解码先识别 M- 前缀，再解释其后字符或脱字符片段。"
        ],
        "sourceIds": [
          "cat",
          "chef"
        ],
        "examples": [
          {
            "label": "带高位的控制字节",
            "input": "M-^]",
            "output": "字节 9D",
            "explanation": "0x5D−0x40=0x1D，再设置 0x80 位，得到 0x9D。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "^M 是回车 CR，不是换行 LF；终端显示出来的 ^ 和 M- 在此是记号，不是原始文件的字符。",
          "这种记法针对字节；不能用它直接推出原文件属于哪个 Unicode 字符集。"
        ],
        "sourceIds": [
          "cat",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Show%20Base64%20offsets",
    "capabilityIds": [
      "op:Show%20Base64%20offsets"
    ],
    "relatedIds": [
      "op:Show%20Base64%20offsets"
    ],
    "topicGroup": "encoding",
    "title": "Base64 偏移",
    "summary": "三字节分组的起点变化，会改变目标文字所在的六位字符边界。",
    "aliases": [
      "Base64 offsets",
      "Base64偏移",
      "分组对齐"
    ],
    "sources": [
      {
        "id": "base",
        "title": "RFC 4648：Base16、Base32、Base64",
        "publisher": "IETF／南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4648.html",
        "language": "en",
        "kind": "standard",
        "locator": "第 4–8 节及第 10 节测试向量"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "Base64 每三字节分一组。目标字符串嵌在更大文件里时，其起始字节位置模 3 只能是 0、1、2 三种，文字附近的六位分组会跟着变化。",
          "这个操作针对同一输入展示三种分组偏移，用于查找更大 Base64 载荷中的片段。边缘六位字符可能同时含前后邻接字节的位，所以不一定是目标本身单独编码的结果。"
        ],
        "sourceIds": [
          "base",
          "chef"
        ],
        "examples": [
          {
            "label": "目标 A 在不同分组位置",
            "input": "A、BA、BBA（B 为前置字节）",
            "output": "QQ==、QkE=、QkJB",
            "explanation": "三个完整串都包含 A，但 A 所在分组位置分别是 0、1、2；因此其边界编码不同。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "不能把目标单独编码的整个字符串（包括 =）直接当作文件内固定子串；只有不受邻字节影响的内部字符才稳定。",
          "显示可变字符和填充选项用于标出边界条件，不是在自动解密另一种 Base64 算法。"
        ],
        "sourceIds": [
          "base",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Base32",
    "capabilityIds": [
      "pair:To%20Base32"
    ],
    "relatedIds": [
      "pair:To%20Base32"
    ],
    "topicGroup": "encoding",
    "title": "Base32",
    "summary": "五字节的 40 位被分成八组 5 位，每组选择 32 个符号之一。",
    "aliases": [
      "Base32",
      "b32",
      "Base32hex"
    ],
    "sources": [
      {
        "id": "base",
        "title": "RFC 4648：Base16、Base32、Base64",
        "publisher": "IETF／南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4648.html",
        "language": "en",
        "kind": "standard",
        "locator": "第 4–8 节及第 10 节测试向量"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "标准 Base32 的索引 0–31 映射到 A–Z、2–7。从输入字节位串左侧开始，每五位转一个索引；尾组不足五位时低位补零。",
          "完整组是五字节到八字符，带填充的尾组补 = 至八字符。解码先反查五位、移除无数据的填充尾位，再按八位收回字节。"
        ],
        "sourceIds": [
          "base",
          "chef"
        ],
        "examples": [
          {
            "label": "一字节尾组",
            "input": "f：01100110",
            "output": "01100 11000 → M Y\nMY======",
            "explanation": "索引为 12、24，对应 M、Y，余下位置用六个 = 填充。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "Base32hex 使用 0–9、A–V 的不同表，不能只改变文字大小写就得到同一种编码。",
          "标准字母表不包含 0 和 1，避免与 O、I 混淆；是否允许容错替换由解码器约定，不能擅自替换。"
        ],
        "sourceIds": [
          "base",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Base45",
    "capabilityIds": [
      "pair:To%20Base45"
    ],
    "relatedIds": [
      "pair:To%20Base45"
    ],
    "topicGroup": "encoding",
    "title": "Base45",
    "summary": "两个字节组成 16 位整数，再按低位在前的 45 进制写成三字符。",
    "aliases": [
      "Base45",
      "二维码字母数字模式"
    ],
    "sources": [
      {
        "id": "base45",
        "title": "RFC 9285：Base45 Data Encoding",
        "publisher": "IETF／南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9285.html",
        "language": "en",
        "kind": "standard",
        "locator": "第 4 节规则、第 4.3 节例子"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "Base45 的 45 字符表使用 0–9、A–Z、空格和 $%*+-./:，适合二维码字母数字模式。两字节 a、b 先组成 n=256a+b。",
          "计算 n=c+45d+2025e，把 c、d、e 按从低位到高位的顺序查表输出。最后仅有一个字节时用两个字符；整个编码不需要 = 填充。"
        ],
        "sourceIds": [
          "base45",
          "chef"
        ],
        "examples": [
          {
            "label": "RFC 的双字节例子",
            "input": "AB：65 66",
            "output": "BB8",
            "explanation": "n=65×256+66=16706=11+11×45+8×2025；11→B、11→B、8→8。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "字符表中的空格是数据，不能随意 trim 或删除；输出也不保证 URL 安全。",
          "解码的三字符数值必须不超过 65535，末尾两字符值不超过 255，否则不能收回对应字节数。"
        ],
        "sourceIds": [
          "base45",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Base58",
    "capabilityIds": [
      "pair:To%20Base58"
    ],
    "relatedIds": [
      "pair:To%20Base58"
    ],
    "topicGroup": "encoding",
    "title": "Base58",
    "summary": "Bitcoin 字母表避开 0、O、I、l，前导零字节另用首字符记录。",
    "aliases": [
      "Base58",
      "Bitcoin alphabet",
      "Base58Check"
    ],
    "sources": [
      {
        "id": "base58-impl",
        "title": "ToBase58：数位转换与前导零",
        "publisher": "CyberChef 11.5.0（Apache-2.0）",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/ToBase58.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run：zeroPrefix、基数除法与字母表",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/operations/ToBase58.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "Bitcoin 表为 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz。把字节串视为大端非负整数，反复除以 58、倒序读余数并查字符。",
          "与纯整数进制不同，Bitcoin Base58 还把每个前导 00 字节写成字母表首字符 1。解码反查数位并恢复这些前导零；Ripple 表顺序不同，必须选择匹配的表。"
        ],
        "sourceIds": [
          "base58-impl",
          "chef"
        ],
        "examples": [
          {
            "label": "保留一个前导零",
            "input": "字节：00 41；Bitcoin 表",
            "output": "128",
            "explanation": "65=1×58+7，查表为 28；前导 00 再添首字符 1，所以是 128。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "普通 Base58 没有自动的 Base58Check 校验和，能解码不等于通过地址校验。",
          "数字字符 1 在这里既可以是前导零标记，也可以是普通数位 0，含义由其位置与完整编码决定。"
        ],
        "sourceIds": [
          "base58-impl",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Base62",
    "capabilityIds": [
      "pair:To%20Base62"
    ],
    "relatedIds": [
      "pair:To%20Base62"
    ],
    "topicGroup": "encoding",
    "title": "Base62",
    "summary": "本实现把整段字节视为大端整数，字母表顺序决定输出字符。",
    "aliases": [
      "Base62",
      "短链接字母表"
    ],
    "sources": [
      {
        "id": "base62impl",
        "title": "ToBase62 的大端整数处理",
        "publisher": "CyberChef 11.5.0（Apache-2.0）",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/ToBase62.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run：toHexFast、BigNumber、toString(62)",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/operations/ToBase62.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "默认表按 0–9、A–Z、a–z 顺序排列，共 62 个符号。输入字节先读作一个大端整数，反复以 62 为基数转换，而不是固定按六位分组。",
          "单字节 A 为整数 65，65=1×62+3，因此使用默认表输出 13。更换大小写字母顺序时，同一个数的文本表示会变化。"
        ],
        "sourceIds": [
          "base62impl",
          "chef"
        ],
        "examples": [
          {
            "label": "默认表中的整数 65",
            "input": "A：字节 41",
            "output": "13",
            "explanation": "数位 1、3 对应 1×62+3=65，逆向取回字节 41；前导 00 的个数须另存。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "Base62 没有像 RFC 4648 Base64 那样唯一的通用字母表；双方须确认具体实现。",
          "这一实现按数值处理，字节串前导零不会自动保留；00 41 与 41 得到相同整数 65。"
        ],
        "sourceIds": [
          "base62impl",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Base85",
    "capabilityIds": [
      "pair:To%20Base85"
    ],
    "relatedIds": [
      "pair:To%20Base85"
    ],
    "topicGroup": "encoding",
    "title": "Base85",
    "summary": "把 32 位块作为整数转成五个 85 进制数位。",
    "aliases": [
      "Ascii85",
      "Base85",
      "Z85",
      "RFC1924"
    ],
    "sources": [
      {
        "id": "base85",
        "title": "Base85 的字母表、分组与变体",
        "publisher": "Python 软件基金会",
        "url": "https://docs.python.org/zh-cn/3/library/base64.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "Base85 编码格式、a85encode、b85encode、z85encode"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "85⁵ 大于 2³²，所以四个字节的 32 位块可用五个 85 进制数位表示。Ascii85 通常把数位 0–84 映射到 ASCII 的 !–u。",
          "编码将四字节按大端组成整数，依次分解成五个数位再查表；尾部不足四字节会按该变体的规则补零并缩短输出，解码必须使用同一尾组规则。"
        ],
        "sourceIds": [
          "base85",
          "chef"
        ],
        "examples": [
          {
            "label": "完整四字节块",
            "input": "字节：00 00 00 01；Ascii85 表",
            "output": "!!!!\"",
            "explanation": "五位数字依次 0、0、0、0、1；对应 !!!!\"，解码数值为 1，按四字节收回。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "Ascii85、ZeroMQ Z85、RFC 1924 的字母表不同。Ascii85 的 <~ 与 ~> 是可选封装标记，不是数据数位。",
          "某些变体用 z 缩写四个零字节，但不是所有 Base85 表都接受这种缩写；选项应与来源格式一致。"
        ],
        "sourceIds": [
          "base85",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Base92",
    "capabilityIds": [
      "pair:To%20Base92"
    ],
    "relatedIds": [
      "pair:To%20Base92"
    ],
    "topicGroup": "encoding",
    "title": "Base92",
    "summary": "名称叫 Base92，但本实现主体用 91 个数据字符表示每组 13 位。",
    "aliases": [
      "Base92",
      "13位分组"
    ],
    "sources": [
      {
        "id": "base92",
        "title": "Base92 原作者的编码设计",
        "publisher": "Nathan Hwang（thenoviceoof）",
        "url": "https://thenoviceoof.com/blog/projects/base92/",
        "language": "en",
        "kind": "author-spec",
        "locator": "13 位分组与 91 字符字母表"
      },
      {
        "id": "base92impl",
        "title": "ToBase92：13 位分组及尾组规则",
        "publisher": "CyberChef 11.5.0（Apache-2.0）",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/ToBase92.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/operations/ToBase92.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "base92alphabet",
        "title": "Base92 的固定数据字符表",
        "publisher": "CyberChef 11.5.0（Apache-2.0）",
        "url": "/vendor/knowledge/cyberchef/src/core/lib/Base92.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "base92Chr、base92Ord",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/lib/Base92.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "原作者设计每次读取 13 位，把其数值分成商 floor(n/91) 与余数 n mod 91，再查两个数据字符。它不是每个字符固定承载完整七位。",
          "本引擎尾部不足七位时补到六位并输出一个字符；尾部七至十二位时补到十三位并输出两个字符。本引擎数据表使用 !、#–_、a–}，不使用双引号、反引号和波浪号。"
        ],
        "sourceIds": [
          "base92",
          "base92impl",
          "base92alphabet",
          "chef"
        ],
        "examples": [
          {
            "label": "一个字节形成尾部双字符",
            "input": "A：01000001",
            "output": "8q",
            "explanation": "补到 13 位为 0100000100000=2080；2080÷91 商 22 余 78。固定实现的字符表中 22→8、78→q。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "Base92 与 basE91 是不同项目和规则，不能互换。原作者设计中的特殊空串标记与各实现细节也可能不同。",
          "这里的规范来自作者和固定版本代码，不冒充 IETF 或通用加密标准；解码必须选择一致的字母表与尾组规则。"
        ],
        "sourceIds": [
          "base92",
          "base92impl",
          "base92alphabet",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Bech32",
    "capabilityIds": [
      "pair:To%20Bech32"
    ],
    "relatedIds": [
      "pair:To%20Bech32"
    ],
    "topicGroup": "encoding",
    "title": "Bech32",
    "summary": "Bech32 由 HRP、分隔符 1、数据和校验和组成，不是普通 Base32。",
    "aliases": [
      "Bech32",
      "Bech32m",
      "BIP173",
      "BIP350",
      "HRP"
    ],
    "sources": [
      {
        "id": "bech32",
        "title": "BIP 173：Bech32 地址格式",
        "publisher": "Pieter Wuille、Greg Maxwell／Bitcoin.org 文献镜像",
        "url": "https://bitcoin.org/bip/173/",
        "language": "en",
        "kind": "author-spec",
        "locator": "Bech32、checksum、test vectors"
      },
      {
        "id": "bech32m",
        "title": "BIP 350：Bech32m format for v1+ witness addresses",
        "publisher": "Pieter Wuille／Bitcoin.org 文献镜像",
        "url": "https://bitcoin.org/bip/350/",
        "language": "en",
        "kind": "author-spec",
        "locator": "Bech32m 常数、第 1–16 版 witness 地址"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "HRP 是可读前缀，后接最后一个分隔符 1，再接使用 qpzry9x8gf2tvdw0s3jn54khce6mua7l 的五位数据。末尾六字符是校验和，不承载原始输入。",
          "编码把字节位串从八位重组为五位、补足尾位，再根据 HRP 和数据计算多项式校验。Bitcoin SegWit 模式还把 witness version 放进载荷，不能把 Generic 模式输出直接当地址。"
        ],
        "sourceIds": [
          "bech32",
          "bech32m",
          "chef"
        ],
        "examples": [
          {
            "label": "BIP 173 的合法通用测试向量",
            "input": "A12UEL5L",
            "output": "HRP：A\n分隔符：1\n数据：空\n校验和：2UEL5L",
            "explanation": "这是格式校验向量；不是一个可付款的 Bitcoin 地址。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "总长度上限和禁止大小写混用属于格式要求。Bech32m 更改校验常数，Bitcoin witness v0 使用 Bech32、v1–v16 使用 Bech32m；版本与模式必须匹配。",
          "校验和用于发现传输错误，不是签名或加密。文献中的空载荷测试向量也不等于有效 Bitcoin 地址。"
        ],
        "sourceIds": [
          "bech32",
          "bech32m",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Citrix%20CTX1%20Encode",
    "capabilityIds": [
      "pair:Citrix%20CTX1%20Encode"
    ],
    "relatedIds": [
      "pair:Citrix%20CTX1%20Encode"
    ],
    "topicGroup": "encoding",
    "title": "Citrix CTX1",
    "summary": "依次 XOR 0xA5 与上一个混淆字节，再把半字节映成 A–P。",
    "aliases": [
      "Citrix",
      "CTX1",
      "链式异或"
    ],
    "sources": [
      {
        "id": "ctx1",
        "title": "CitrixCTX1Encode 的实现规则",
        "publisher": "CyberChef 11.5.0（Apache-2.0）",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/CitrixCTX1Encode.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run：UTF-16LE、链式 XOR、A–P 映射",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/operations/CitrixCTX1Encode.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "本操作先将输入编码为 UTF-16LE 字节。从临时值 0 开始，每个字节 b 更新 t=b XOR 0xA5 XOR 上一个 t，再将 t 的高低半字节各加 0x41 输出。",
          "解码按两个 A–P 字符收回当前 t，再 XOR 0xA5 和上一个 t 得到原字节；最后用 UTF-16LE 读回文本。"
        ],
        "sourceIds": [
          "ctx1",
          "chef"
        ],
        "examples": [
          {
            "label": "单字符 A 的两字节处理",
            "input": "A；UTF-16LE 字节 41 00",
            "output": "OEEB",
            "explanation": "第一步 41 XOR A5 XOR 00=E4，映成 OE；第二步 00 XOR A5 XOR E4=41，映成 EB。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "这是 CyberChef 对 CTX1 格式的具体实现说明。它不使用秘密密钥，因此可逆，不是密码哈希，也不提供现代加密的安全性。",
          "不能把输出半字节映射和 NetBIOS 编码混为同一格式：二者都用 A–P，但 CTX1 还有 UTF-16LE 与链式 XOR。"
        ],
        "sourceIds": [
          "ctx1",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:MIME%20Decoding",
    "capabilityIds": [
      "op:MIME%20Decoding"
    ],
    "relatedIds": [
      "op:MIME%20Decoding"
    ],
    "topicGroup": "encoding",
    "title": "MIME 邮件头",
    "summary": "先识别 encoded-word，再按 B 或 Q 收回字节，最后按声明的字符集解码。",
    "aliases": [
      "MIME header",
      "RFC2047",
      "encoded-word",
      "邮件头"
    ],
    "sources": [
      {
        "id": "mime",
        "title": "RFC 2047：MIME 邮件头编码",
        "publisher": "IETF／南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc2047.html",
        "language": "en",
        "kind": "standard",
        "locator": "第 2、4 节 encoded-word、B、Q"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "RFC 2047 用 =?charset?encoding?encoded-text?= 把非 ASCII 邮件头文字装进 ASCII 表示。B 表示 Base64，Q 表示邮件头版本的 Quoted-Printable。",
          "解码按问号分出字符集、方法和载荷，先解 B/Q，再按 charset 生成文字。Q 中下划线可表示空格，规则与正文 Quoted-Printable 不完全一样。"
        ],
        "sourceIds": [
          "mime",
          "chef"
        ],
        "examples": [
          {
            "label": "B 方法的短邮件头",
            "input": "=?UTF-8?B?QVJH?=",
            "output": "ARG",
            "explanation": "载荷 QVJH 解成 41 52 47，再按 UTF-8 读取为 ARG。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "这个操作处理邮件头 encoded-word，不是自动解码整个邮件正文、附件或 multipart 结构。",
          "一个 encoded-word 最长 75 字符；相邻 encoded-word 间的折行空白有专门规则，不能随意拼接任何普通文字。"
        ],
        "sourceIds": [
          "mime",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Modhex",
    "capabilityIds": [
      "pair:To%20Modhex"
    ],
    "relatedIds": [
      "pair:To%20Modhex"
    ],
    "topicGroup": "encoding",
    "title": "Modhex",
    "summary": "把 0–15 的四位数值依次映射到 cbdefghijklnrtuv。",
    "aliases": [
      "Modhex",
      "YubiKey",
      "modified hexadecimal"
    ],
    "sources": [
      {
        "id": "modhex",
        "title": "Modified hexadecimal encoding (ModHex)",
        "publisher": "Yubico 官方 SDK 手册",
        "url": "https://docs.yubico.com/yesdk/users-manual/application-otp/modhex.html",
        "language": "en",
        "kind": "official-doc",
        "locator": "4 位数据与 ModHex 字母表"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "Yubico 的 Modhex 字母表为 cbdefghijklnrtuv，对应通常十六进制的 0123456789abcdef。每字节仍是高低两个半字节，只改变其可见字符。",
          "编码拆高低半字节再查新表；解码查回两个 0–15 数位，合成原字节。字节 41 的两个数位 4、1 映到 f、b。"
        ],
        "sourceIds": [
          "modhex",
          "chef"
        ],
        "examples": [
          {
            "label": "十六进制的替换字母表",
            "input": "A：字节 41",
            "output": "fb",
            "explanation": "f 对应数位 4，b 对应 1，反向合成 0x41。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "这是键盘友好的字节表示，不是把数据本身加密。YubiKey OTP 内部的加密属于另一层协议。",
          "分隔符和大小写容忍应按工具设置匹配，不能把 Modhex 的字母直接当普通 Hex 的 a–f 来解析。"
        ],
        "sourceIds": [
          "modhex",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Punycode",
    "capabilityIds": [
      "pair:To%20Punycode"
    ],
    "relatedIds": [
      "pair:To%20Punycode"
    ],
    "topicGroup": "encoding",
    "title": "Punycode",
    "summary": "Bootstring 将 Unicode 标签表示为有限 ASCII 字符，不是 URL 百分号转义。",
    "aliases": [
      "Punycode",
      "IDN",
      "xn--",
      "国际化域名"
    ],
    "sources": [
      {
        "id": "punycode",
        "title": "RFC 3492：Punycode",
        "publisher": "IETF／南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc3492.html",
        "language": "en",
        "kind": "standard",
        "locator": "第 3、6、7 节"
      },
      {
        "id": "domain",
        "title": "域名命名规范",
        "publisher": "阿里云域名服务",
        "url": "https://help.aliyun.com/zh/dws/developer-reference/domain-name-validity/",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "中文域名的 Punycode 长度"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "Punycode 先保留输入中的基本 ASCII 字符，再用连字符分隔后续编码部分。非 ASCII 字符按码点顺序与插入位置转成增量，以可变长度数字串表示，并动态调整 bias。",
          "IDN 域名标签会在 Punycode 结果前加 xn--；每个标签独立处理。纯 Punycode 操作可得到 mnchen-3ya，域名模式则形成 xn--mnchen-3ya。"
        ],
        "sourceIds": [
          "punycode",
          "domain",
          "chef"
        ],
        "examples": [
          {
            "label": "带 ü 的域名标签",
            "input": "münchen",
            "output": "mnchen-3ya\nIDN 标签：xn--mnchen-3ya",
            "explanation": "保留 ASCII 的 mnchen，尾部 3ya 表示插回 ü 的位置和码点增量。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "Punycode 编码步骤与完整 IDNA 的合法字符检查、规范化和域名注册规则不同；能编码不等于注册局允许该域名。",
          "域名长度计算通常以 ASCII 转换后的标签为准；URL 的路径和查询仍有自己的 UTF-8 百分号编码规则。"
        ],
        "sourceIds": [
          "punycode",
          "domain",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:VarInt%20Encode",
    "capabilityIds": [
      "pair:VarInt%20Encode"
    ],
    "relatedIds": [
      "pair:VarInt%20Encode"
    ],
    "topicGroup": "encoding",
    "title": "VarInt",
    "summary": "每字节最高位说明后面是否还有一字节，低七位按低位在前排列。",
    "aliases": [
      "VarInt",
      "LEB128",
      "Protobuf",
      "变长整数"
    ],
    "sources": [
      {
        "id": "varint",
        "title": "Protocol Buffers Encoding",
        "publisher": "Protocol Buffers 官方文档",
        "url": "https://protobuf.dev/programming-guides/encoding/",
        "language": "en",
        "kind": "official-doc",
        "locator": "Base 128 Varints：150 → 96 01"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "Base128 VarInt 用每个字节低七位保存数值，高位 1 表示继续、0 表示最后一字节。编码不断取整数的低七位，剩余不为零时设置继续位。",
          "解码去掉继续位，按七位块的低位在前顺序恢复整数。150 的低七位是 22，高块是 1，所以输出 0x96、0x01。"
        ],
        "sourceIds": [
          "varint",
          "chef"
        ],
        "examples": [
          {
            "label": "官方文档的整数 150",
            "input": "150",
            "output": "96 01",
            "explanation": "96 的载荷为 0x16=22，01 的载荷为 1；22+1×128=150。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "VarInt 本身通常表示非负整数。Protobuf 的 sint 使用额外 ZigZag 映射处理负数，不能把两者当成同一操作。",
          "字节 80 后必须还有字节；仅看见继续位而未收到终止组，不能确定完整数值。"
        ],
        "sourceIds": [
          "varint",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:morse",
    "capabilityIds": [
      "native:morse"
    ],
    "relatedIds": [
      "native:morse"
    ],
    "topicGroup": "communication",
    "title": "摩斯录入",
    "summary": "按字符内点划、字符间停顿和词间停顿保留消息边界。",
    "aliases": [
      "Morse input",
      "CW",
      "点划",
      "摩斯录入"
    ],
    "sources": [
      {
        "id": "morse",
        "title": "ITU-R M.1677-1：国际摩尔斯电码（中文）",
        "publisher": "国际电信联盟",
        "url": "https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.1677-1-200910-I!!PDF-C.pdf",
        "language": "zh-CN",
        "kind": "standard",
        "locator": "附件 1 第 1、2 节：字符表、间隔和长度"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      },
      {
        "id": "itu-sos",
        "title": "SOS：一个连续的求救程序信号",
        "publisher": "国际电信联盟 ITU",
        "url": "https://www.itu.int/itunews/manager/display.asp?ext=html&ipage=pioneers&issue=06&lang=en&year=2006",
        "language": "en",
        "kind": "official-doc",
        "locator": "历史 SOS 连续九个点划的说明"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "国际摩斯用点与划的顺序表示字母和数字。点长 1 单位，划长 3 单位；同一字符的符号间隔 1 单位，字符间隔 3 单位，单词间隔 7 单位。",
          "本面板一次输入一个字符的点划序列，查表匹配后追加字母；追加完成清空当前序列。点划相同但边界不同，读出的文字可能不同。"
        ],
        "sourceIds": [
          "morse",
          "chef"
        ],
        "examples": [
          {
            "label": "依次抄录三个字符",
            "input": "... / --- / ...",
            "output": "SOS",
            "explanation": "斜线这里只标字符边界；S 是三点，O 是三划，再追加一个 S。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "这里输入的是抄录的点划，不直接分析录音。国际摩斯与历史 American Morse 字母表并不完全相同。",
          "SOS 写作 ... --- ...；不能丢掉字符间边界后，把全部点划当一个巨大字符查表。",
          "本面板的逐字母示例保留字母边界；历史 SOS 求救程序信号则把九个点划作为一个连续组发送，按该规定读取。"
        ],
        "sourceIds": [
          "morse",
          "chef",
          "itu-sos"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:braille",
    "capabilityIds": [
      "native:braille"
    ],
    "relatedIds": [
      "native:braille"
    ],
    "topicGroup": "communication",
    "title": "六点盲文",
    "summary": "读面上的点位为左列 1、2、3，右列 4、5、6；含空白共有 64 种组合。",
    "aliases": [
      "六点盲文",
      "Braille dots",
      "盲文点位"
    ],
    "sources": [
      {
        "id": "braille-school",
        "title": "“指趣”小课堂：国家通用盲文（一）",
        "publisher": "浙江特殊教育职业学院",
        "url": "https://www.zcse.edu.cn/info/1696/40761.htm",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "三：六点位置、读面编号与 63 个非空符形"
      },
      {
        "id": "braille",
        "title": "Unicode 17 第 21.1 节：Braille",
        "publisher": "Unicode 联盟",
        "url": "https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-21/",
        "language": "en",
        "kind": "standard",
        "locator": "点位编号、六点 64 种组合、不同语言的映射差异"
      },
      {
        "id": "braille-native",
        "title": "英文字母与数字的六点对应",
        "publisher": "puzzle-lib 项目（MIT）",
        "url": "/vendor/puzzle-lib/Braille/BrailleEncoding.js",
        "language": "en",
        "kind": "implementation",
        "locator": "Letter、Number、FormattingNumber"
      },
      {
        "id": "braille-cn",
        "title": "《国家通用盲文方案》研制组负责人答记者问",
        "publisher": "教育部／国家语言文字工作委员会",
        "url": "https://qspfw.moe.gov.cn/html/hotnews/20180523/12925.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "第六问：声母、韵母、声调与汉盲规则"
      },
      {
        "id": "braille-panel",
        "title": "六点面板的单方追加校验",
        "publisher": "迷雾工具箱",
        "url": "/round1/symbols.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "braille-add：仅追加当前单个英文字母或数字；面板不保存跨方数字状态"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "一个六点方占两列三行；面向读面时点位从左上向下是 1、2、3，右上向下是 4、5、6。每位凸起或不凸起，共 2⁶=64 种图形。",
          "识读先记录凸点编号，再查当前语言字母表。英语基础字母 A 是点 1，B 是点 1、2，C 是点 1、4；英语数字语境中，数字标记点 3、4、5、6 后可将 a–j 的图形读为 1–0。"
        ],
        "sourceIds": [
          "braille-school",
          "braille",
          "braille-native",
          "braille-cn",
          "braille-panel"
        ],
        "examples": [
          {
            "label": "从读面看点位",
            "input": "1 4\n2 5\n3 6",
            "output": "点 1：⠁ → A\n点 1、2：⠃ → B\n点 1、4：⠉ → C",
            "explanation": "先确认读面方向；凸点 1+2 对应英文基础字母 B。手写扎点时从背面压印会出现镜像，不能直接沿用读面方向。"
          },
          {
            "label": "英语盲文数字语境（不是本面板的连续数字翻译）",
            "input": "⠼⠁⠃",
            "output": "12",
            "explanation": "这是英语盲文的数字语境规则：⠼ 后的 a、b 点形读作 1、2。本面板逐方识读，不能将这一整串自动追加为 12。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "Unicode 只编码点形，不给每个点形规定唯一语言含义。中国《国家通用盲文方案》按汉语读音、声韵调等规则组织，不能用英文 A–Z 识读面板直接翻译汉语。",
          "本录入面板每次识读一个六点方并追加英文单字母；数字标记 ⠼ 不会被追加，面板也不会跨方保持数字状态。它不支持连续数字翻译，也不是完整英语 Grade 1／UEB 或汉语转写器。"
        ],
        "sourceIds": [
          "braille-school",
          "braille",
          "braille-native",
          "braille-cn",
          "braille-panel"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:semaphore",
    "capabilityIds": [
      "native:semaphore"
    ],
    "relatedIds": [
      "native:semaphore"
    ],
    "topicGroup": "communication",
    "title": "旗语",
    "summary": "选择八个方向中的两个组合，按照英文 Semaphore 表查字母。",
    "aliases": [
      "Semaphore",
      "手旗",
      "双旗旗语"
    ],
    "sources": [
      {
        "id": "signal",
        "title": "船舶通信语言（二）——旗语",
        "publisher": "交通运输部海事局官方发布",
        "url": "https://m.thepaper.cn/newsDetail_forward_7256510",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "手旗通信、航海手旗字母和数字图表"
      },
      {
        "id": "semaphore",
        "title": "双旗八方向的字母组合",
        "publisher": "puzzle-lib 项目（MIT）",
        "url": "/vendor/puzzle-lib/Semaphore/SemaphoreEncoding.js",
        "language": "en",
        "kind": "implementation",
        "locator": "LetterA–LetterZ"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "双旗 Semaphore 用两根手旗在不同方向的组合表示字母，不是悬挂字母信号旗的花色图案。方向可按上、右上、右、右下、下、左下、左、左上八个位置记录。",
          "本工具把所选两个方向合为一个组合，再在 A–Z 的固定表中查字母；有效组合追加到识读结果，顺序按线索字符保存。"
        ],
        "sourceIds": [
          "signal",
          "semaphore"
        ],
        "examples": [
          {
            "label": "本站方向表的字母 A",
            "input": "下＋左下（按面板读图方向）",
            "output": "A",
            "explanation": "这两个方向对应 SemaphoreEncoding 的 South 与 SouthWest 组合。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "先确认图是从接收者还是发送者方向画的，镜像会改变左右。不同手旗体系也不能只凭双旗外观混用。",
          "当前面板按字母组合识读，不自动处理数字标记和整套通信开始、取消等程序信号。"
        ],
        "sourceIds": [
          "signal",
          "semaphore"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:tapcode",
    "capabilityIds": [
      "native:tapcode"
    ],
    "relatedIds": [
      "native:tapcode"
    ],
    "topicGroup": "communication",
    "title": "敲击码",
    "summary": "每个字母用两组 1–5 次敲击，在 5×5 方阵里查行列坐标。",
    "aliases": [
      "Tap code",
      "Knock code",
      "敲击",
      "C/K"
    ],
    "sources": [
      {
        "id": "tap",
        "title": "No Such Puzzle: Tap Codes",
        "publisher": "美国国家安全局密码谜题栏目",
        "url": "https://www.nsa.gov/puzzles/view/article/3860720/no-such-puzzle-tap-codes/",
        "language": "en",
        "kind": "official-doc",
        "locator": "Tap Codes Instructions"
      },
      {
        "id": "tap-impl",
        "title": "TapCode 的 C/K 合并方阵",
        "publisher": "cryptii 项目（MIT）",
        "url": "/vendor/basics/TapCode.js",
        "language": "en",
        "kind": "implementation",
        "locator": "5×5 方阵、两组敲击"
      },
      {
        "id": "polybius",
        "title": "PolybiusSquare 的行列坐标编码",
        "publisher": "cryptii 项目（MIT）",
        "url": "/vendor/basics/PolybiusSquare.js",
        "language": "en",
        "kind": "implementation",
        "locator": "alphabet、rows、columns、encode、decode"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "默认敲击码按 ABCDE／FGHIJ／LMNOP／QRSTU／VWXYZ 填五行，K 与 C 共用一个位置。第一组敲击数为行，停顿后第二组为列。",
          "T 在第 4 行第 4 列，敲四次、停顿、再敲四次；A 是一一，P 是三五。抄录时每字母必须保留两组，单词边界可另外记录。"
        ],
        "sourceIds": [
          "tap",
          "tap-impl",
          "polybius"
        ],
        "examples": [
          {
            "label": "逐字母发送 TAP",
            "input": "TAP",
            "output": ".... ....  . .  ... .....",
            "explanation": "每两组为一个字母，三对敲击分别表示 44、11、35；组间空格保留行、列边界。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "敲击码的 C/K 合并与常见 Polybius 的 I/J 合并不同；同一个坐标 33 会随方阵而改变意义。",
          "五次以上敲击或缺少一组的字符无效。本站敲击模式固定此方阵，关键词选项用于坐标方阵而不是改写敲击码。"
        ],
        "sourceIds": [
          "tap",
          "tap-impl",
          "polybius"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:baudot",
    "capabilityIds": [
      "native:baudot"
    ],
    "relatedIds": [
      "native:baudot"
    ],
    "topicGroup": "communication",
    "title": "波多码与打孔纸带",
    "summary": "五位只给 32 个码字，通过 LTRS／FIGS 移位让同一码字有两种含义。",
    "aliases": [
      "Baudot",
      "ITA2",
      "ITA1",
      "US TTY",
      "五孔纸带",
      "LTRS",
      "FIGS"
    ],
    "sources": [
      {
        "id": "baudot",
        "title": "ITU-T S.1：国际电报字母表第 2 号",
        "publisher": "国际电信联盟",
        "url": "https://www.itu.int/rec/dologin_pub.asp?id=T-REC-S.1-199303-I!!PDF-E&lang=e&type=items",
        "language": "en",
        "kind": "standard",
        "locator": "第 3、4 节及表 1：五位、打孔、字母/数字移位"
      },
      {
        "id": "baudotimpl",
        "title": "ITA1／ITA2／US_TTY 字母表及移位实现",
        "publisher": "baudot.js 项目（MIT）",
        "url": "/vendor/basics/baudot.js",
        "language": "en",
        "kind": "implementation",
        "locator": "字母表、encoder、decoder"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "ITA2 使用五位码字，每位 0 表示不打孔、1 表示打孔。只有 32 种组合，字母与数字共用位置，因此接收器保留当前字母/数字状态。",
          "FIGS（11011）切换到数字表，LTRS（11111）切回字母表。00001 在字母状态是 E，在数字状态是 3；移位码本身不输出可见字母。"
        ],
        "sourceIds": [
          "baudot",
          "baudotimpl"
        ],
        "examples": [
          {
            "label": "ITA2 状态变化",
            "input": "A3E",
            "output": "00011 11011 00001 11111 00001",
            "explanation": "A=00011；FIGS 后 00001 读 3；LTRS 后同一个 00001 读 E。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "“波多码”可指 ITA1、ITA2 或 US_TTY 等不同表，数字标点处尤其不同；先选择表再读纸带。",
          "本站纸带每列一组五位，从上到下显示 bit4 至 bit0；最下面的小孔是进带孔，不是第六个数据位。历史实物的位序与读向要另行核对。"
        ],
        "sourceIds": [
          "baudot",
          "baudotimpl"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:seven-segment",
    "capabilityIds": [
      "native:seven-segment"
    ],
    "relatedIds": [
      "native:seven-segment"
    ],
    "topicGroup": "communication",
    "title": "七段数码管",
    "summary": "上、右上、右下、下、左下、左上和中段的组合对应 0–9。",
    "aliases": [
      "seven segment",
      "七段显示",
      "数码管"
    ],
    "sources": [
      {
        "id": "bcd",
        "title": "SN74LS47：BCD 到七段显示译码器",
        "publisher": "德州仪器 TI 中国官网",
        "url": "https://www.ti.com.cn/product/zh-cn/SN74LS47",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "BCD 输入、0–9 数字显示及数据表"
      },
      {
        "id": "symbolsimpl",
        "title": "符号面板的七段与猪圈字母映射",
        "publisher": "迷雾工具箱",
        "url": "/round1/symbols.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "patterns、pigpen-keys"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "标准段位通常叫 a、b、c、d、e、f、g，分别是上、右上、右下、下、左下、左上、中。每段开或关，数字由亮段集合决定。",
          "数字 1 只亮 b、c；8 亮全部七段；0 亮 a–f 但中段 g 不亮。本面板把点击的亮段集合与数字表比较，匹配后可追加数字。"
        ],
        "sourceIds": [
          "bcd",
          "symbolsimpl"
        ],
        "examples": [
          {
            "label": "从亮段识别数字",
            "input": "右上 b＋右下 c",
            "output": "1",
            "explanation": "只有右侧两条竖段亮，对应 1；全部七段亮对应 8。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "共阳／共阴器件的电平极性不同，但可见数字仍按亮段组合读取；本工具输入的是亮灭图形，不是芯片脚上的电压。",
          "七段也能显示部分字母，但当前识读表只把标准十进制 0–9 当作数字结果。"
        ],
        "sourceIds": [
          "bcd",
          "symbolsimpl"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:pigpen",
    "capabilityIds": [
      "native:pigpen"
    ],
    "relatedIds": [
      "native:pigpen"
    ],
    "topicGroup": "communication",
    "title": "猪圈密码",
    "summary": "两组井字格加两组 X 格，取字母所在格子的轮廓并标是否带点。",
    "aliases": [
      "Pigpen",
      "Masonic cipher",
      "共济会密码",
      "猪圈"
    ],
    "sources": [
      {
        "id": "pigpen",
        "title": "Pig Pen Cipher 教学图表",
        "publisher": "NIST 美国国家标准与技术研究院",
        "url": "https://www.nist.gov/system/files/documents/2021/06/25/ccaw_pig_pen_cipher.pdf",
        "language": "en",
        "kind": "official-doc",
        "locator": "两组井字格与两组 X 格的字母图表"
      },
      {
        "id": "symbolsimpl",
        "title": "符号面板的七段与猪圈字母映射",
        "publisher": "迷雾工具箱",
        "url": "/round1/symbols.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "patterns、pigpen-keys"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "常见猪圈表把 A–I 放入第一张 3×3 井字格，J–R 放入同形带点格，S–V 放入 X 的四个区域，W–Z 放入同形带点区域。",
          "识读时保留图形的开口方向、直角或斜角、是否有点，再查字母表。例如本站中心方框无点为 E，加点为 N。"
        ],
        "sourceIds": [
          "pigpen",
          "symbolsimpl"
        ],
        "examples": [
          {
            "label": "有点与无点的相同轮廓",
            "input": "中心四边方框：无点／有点",
            "output": "E／N（本站默认表）",
            "explanation": "先查所在格子的边框，再用有点区分第二组字母。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "存在不同字母排列的猪圈表；相同轮廓可能因表不同代表其他字母。不要只记“这个形状一定是 E”。",
          "旋转、镜像或漏点会改变字母；图案的颜色通常不是该基础表的数据位，若题目给了特殊约定则按约定处理。"
        ],
        "sourceIds": [
          "pigpen",
          "symbolsimpl"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:polybius",
    "capabilityIds": [
      "native:polybius"
    ],
    "relatedIds": [
      "native:polybius"
    ],
    "topicGroup": "communication",
    "title": "Polybius 方阵",
    "summary": "5×5 常合并 I/J，6×6 则可容纳 26 字母和 10 数字。",
    "aliases": [
      "Polybius",
      "波利比乌斯",
      "I/J",
      "坐标方阵"
    ],
    "sources": [
      {
        "id": "polybius",
        "title": "PolybiusSquare 的行列坐标编码",
        "publisher": "cryptii 项目（MIT）",
        "url": "/vendor/basics/PolybiusSquare.js",
        "language": "en",
        "kind": "implementation",
        "locator": "alphabet、rows、columns、encode、decode"
      },
      {
        "id": "tap-impl",
        "title": "TapCode 的 C/K 合并方阵",
        "publisher": "cryptii 项目（MIT）",
        "url": "/vendor/basics/TapCode.js",
        "language": "en",
        "kind": "implementation",
        "locator": "5×5 方阵、两组敲击"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "在默认 5×5 表中，按 ABCDE／FGHIK／LMNOP／QRSTU／VWXYZ 填字母，I 和 J 共用格。编码依次写行号、列号；解码按两数字定位一个格。",
          "关键词模式先放去重后的关键词，再补其余字母，因此改变表会改变坐标。6×6 模式使用 A–Z、0–9，共 36 个格。"
        ],
        "sourceIds": [
          "polybius",
          "tap-impl"
        ],
        "examples": [
          {
            "label": "默认 5×5 坐标",
            "input": "ARG",
            "output": "11 42 22",
            "explanation": "A 在 1 行 1 列，R 在 4 行 2 列，G 在 2 行 2 列；反向按两位一组查回。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "行列顺序不能颠倒。I/J 合并有信息损失，解码无法仅凭坐标决定原来是哪一个字母。",
          "该方阵与敲击码不是同一默认表；敲击码通常合并 C/K。编号字符可变但必须与创建方阵的设置匹配。"
        ],
        "sourceIds": [
          "polybius",
          "tap-impl"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Cetacean%20Cipher%20Encode",
    "capabilityIds": [
      "pair:Cetacean%20Cipher%20Encode"
    ],
    "relatedIds": [
      "pair:Cetacean%20Cipher%20Encode"
    ],
    "topicGroup": "communication",
    "title": "鲸鱼密码",
    "summary": "每个 UTF-16 码元展开 16 位，0 写 E、1 写 e。",
    "aliases": [
      "Cetacean cipher",
      "鲸鱼密码",
      "E/e"
    ],
    "sources": [
      {
        "id": "cetacean",
        "title": "CetaceanCipherEncode 的 16 位映射",
        "publisher": "CyberChef 11.5.0（Apache-2.0）",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/CetaceanCipherEncode.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run：UTF-16 码元、0→E、1→e",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/operations/CetaceanCipherEncode.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "CyberChef 的 Cetacean Cipher 并不使用字母替换密钥。它读取每个 UTF-16 码元，写成高位在前的 16 位二进制，再把 0 替换为 E、1 替换为 e。",
          "解码按 16 个 E/e 收回码元；普通空格保留为间隔。ASCII A 的码元是 0x0041，位串是 0000000001000001。"
        ],
        "sourceIds": [
          "cetacean",
          "chef"
        ],
        "examples": [
          {
            "label": "一字母的十六位",
            "input": "A：0000000001000001",
            "output": "EEEEEEEEEeEEEEEe",
            "explanation": "第 10 位和第 16 位为 1，用小写 e；其余为大写 E。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "这是项目定义的趣味编码，大小写就是数据位，不能统一转成大写再解码。",
          "补充平面 Emoji 在 UTF-16 中有两个码元，所以会出现两组 16 位；这不同于把 UTF-8 四字节逐个展开。"
        ],
        "sourceIds": [
          "cetacean",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Braille",
    "capabilityIds": [
      "pair:To%20Braille"
    ],
    "relatedIds": [
      "pair:To%20Braille"
    ],
    "topicGroup": "communication",
    "title": "Braille ASCII",
    "summary": "以 64 个 Braille ASCII 字符对应 64 个六点形状，不能当作完整汉语或英语翻译器。",
    "aliases": [
      "Braille ASCII",
      "盲文编码",
      "六点转码"
    ],
    "sources": [
      {
        "id": "braille-school",
        "title": "“指趣”小课堂：国家通用盲文（一）",
        "publisher": "浙江特殊教育职业学院",
        "url": "https://www.zcse.edu.cn/info/1696/40761.htm",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "三：六点位置、读面编号与 63 个非空符形"
      },
      {
        "id": "braille",
        "title": "Unicode 17 第 21.1 节：Braille",
        "publisher": "Unicode 联盟",
        "url": "https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-21/",
        "language": "en",
        "kind": "standard",
        "locator": "点位编号、六点 64 种组合、不同语言的映射差异"
      },
      {
        "id": "braille-map",
        "title": "CyberChef 的 Braille ASCII 查表",
        "publisher": "CyberChef 11.5.0（Apache-2.0）",
        "url": "/vendor/knowledge/cyberchef/src/core/lib/Braille.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "BRAILLE_LOOKUP.ascii 与 dot6",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/lib/Braille.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      },
      {
        "id": "braille-cn",
        "title": "《国家通用盲文方案》研制组负责人答记者问",
        "publisher": "教育部／国家语言文字工作委员会",
        "url": "https://qspfw.moe.gov.cn/html/hotnews/20180523/12925.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "第六问：声母、韵母、声调与汉盲规则"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "点形的位置采用左列 1、2、3，右列 4、5、6。CyberChef 的转码以 Braille ASCII 查表为规则，将输入字母统一为大写，A→⠁、B→⠃、C→⠉。",
          "编码逐字符寻找其在 64 字符表的位置，输出同位置点形；解码反查点形。数字 1 在这张表里对应 ⠂，不是英语数字前缀 ⠼ 加 a 点形。"
        ],
        "sourceIds": [
          "braille-school",
          "braille",
          "braille-map",
          "chef",
          "braille-cn"
        ],
        "examples": [
          {
            "label": "点位和直接查表",
            "input": "1 4\n2 5\n3 6\n输入：Ab1",
            "output": "⠁⠃⠂",
            "explanation": "A/a 都查到点 1；B/b 查到点 1、2；字符 1 在 Braille ASCII 中查到点 2。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "Braille ASCII 是字符与点形的直接表示，不是完整英语 Grade 1／UEB 转写，也不是国家通用盲文方案。英文大小写在此操作中无法保持为独立信息。",
          "表中不支持的字符由编码器原样保留；因此看到汉字留在结果里，不表示已经完成了汉语盲文翻译。"
        ],
        "sourceIds": [
          "braille-school",
          "braille",
          "braille-map",
          "chef",
          "braille-cn"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Morse%20Code",
    "capabilityIds": [
      "pair:To%20Morse%20Code"
    ],
    "relatedIds": [
      "pair:To%20Morse%20Code"
    ],
    "topicGroup": "communication",
    "title": "摩斯电码",
    "summary": "International Morse 的点划序列需要保留字母和单词两层边界。",
    "aliases": [
      "Morse code",
      "国际摩斯",
      "摩尔斯",
      "点划转码"
    ],
    "sources": [
      {
        "id": "morse",
        "title": "ITU-R M.1677-1：国际摩尔斯电码（中文）",
        "publisher": "国际电信联盟",
        "url": "https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.1677-1-200910-I!!PDF-C.pdf",
        "language": "zh-CN",
        "kind": "standard",
        "locator": "附件 1 第 1、2 节：字符表、间隔和长度"
      },
      {
        "id": "chef",
        "title": "CyberChef 11.5.0 官方操作定义与参数",
        "publisher": "GCHQ（Apache-2.0）",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "对应 operation 的 description、args、inputType、outputType"
      }
    ],
    "sections": [
      {
        "title": "是什么，怎样表示与还原",
        "paragraphs": [
          "本操作将字母和数字查成国际摩斯点划表，S 是 ...，O 是 ---。点划可显示为 -/.、_/. 或文字 Dash/Dot 等不同样式，规则本身不变。",
          "编码为每个字母写点划，再插字母与单词分隔符；解码先拆单词、再拆字母，查表收回字符。参数中的两种分隔符必须有可辨边界。"
        ],
        "sourceIds": [
          "morse",
          "chef"
        ],
        "examples": [
          {
            "label": "三个字母查表",
            "input": "SOS",
            "output": "... --- ...",
            "explanation": "S、O、S 各自查表；空间间隔在这个展示例子中是字母边界，不是七单位的完整词间停顿。"
          }
        ]
      },
      {
        "title": "识读条件与边界",
        "paragraphs": [
          "引擎会忽略不在其摩斯表里的字符；输入并不一定可以逐字无损往返。要检查线索中的标点是否受到支持。",
          "这一步转的是文字表示，不直接把它变成音频波形。真实发报时间仍遵循点 1、划 3、字内间隔 1、字间 3、词间 7 的单位规则。"
        ],
        "sourceIds": [
          "morse",
          "chef"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  }
];
