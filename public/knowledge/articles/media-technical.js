// Function-specific lessons with primary references and unaltered pinned source mirrors.
export const articles = [
  {
    "id": "function-op:Modular%20Inverse",
    "capabilityIds": [
      "op:Modular%20Inverse"
    ],
    "relatedIds": [
      "op:Modular%20Inverse"
    ],
    "topicGroup": "maths",
    "title": "模逆元",
    "summary": "在模 m 的世界中寻找 a 的乘法逆元。",
    "aliases": [
      "乘法逆元",
      "互质",
      "Modular Inverse"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "内置函数 pow、sum",
        "publisher": "Python 官方中文文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/functions.html",
        "locator": "pow / sum",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Modular Inverse",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Modular Inverse\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "模逆元 x 满足 a×x≡1（mod m）。它存在的条件是 a 与 m 互质，即 gcd(a,m)=1；普通实数的 1/a 不能直接代入模运算。",
          "扩展欧几里得算法先求 ax+my=gcd(a,m)，互质时取 x 对 m 的余数即可。参数中的数是整数，不是待转换的文本字节。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "求 3 在模 11 下的逆元",
            "input": "a=3，m=11",
            "output": "x=4",
            "explanation": "3×4=12=1+11，所以 3×4 mod 11=1；a=2、m=4 则不存在逆元。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Set%20Intersection",
    "capabilityIds": [
      "op:Set%20Intersection"
    ],
    "relatedIds": [
      "op:Set%20Intersection"
    ],
    "topicGroup": "maths",
    "title": "集合交集",
    "summary": "逐成员判断集合关系。",
    "aliases": [
      "Set Intersection"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "集合类型与集合运算",
        "publisher": "Python 官方文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/stdtypes.html#set-types-set-frozenset",
        "locator": "intersection / union / difference / symmetric_difference",
        "language": "en",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Set Intersection",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Set Intersection\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "交集保留同时出现在两个集合中的元素。集合成员不重复，通常不把输入顺序当作数学意义的一部分。",
          "可将每行线索视为一个成员；求交集就是逐项检查它是否也在另一个集合中。成员分隔符与两个集合的分隔符必须区分。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "两个集合",
            "input": "A={A,B}，B={B,C}",
            "output": "{B}",
            "explanation": "按成员 A、B、C 分别判断是否属于 A、是否属于 B，即可独立核对结果。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Set%20Union",
    "capabilityIds": [
      "op:Set%20Union"
    ],
    "relatedIds": [
      "op:Set%20Union"
    ],
    "topicGroup": "maths",
    "title": "集合并集",
    "summary": "逐成员判断集合关系。",
    "aliases": [
      "Set Union"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "集合类型与集合运算",
        "publisher": "Python 官方文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/stdtypes.html#set-types-set-frozenset",
        "locator": "intersection / union / difference / symmetric_difference",
        "language": "en",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Set Union",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Set Union\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "并集收集至少出现在一个集合中的元素。相同成员即使出现多次，在并集中也只有一个。",
          "先读取第一个集合，再把第二个集合尚未出现的成员加入。它回答的是“全部候选有哪些”，不是“共同候选有哪些”。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "两个集合",
            "input": "A={A,B}，B={B,C}",
            "output": "{A,B,C}",
            "explanation": "按成员 A、B、C 分别判断是否属于 A、是否属于 B，即可独立核对结果。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Set%20Difference",
    "capabilityIds": [
      "op:Set%20Difference"
    ],
    "relatedIds": [
      "op:Set%20Difference"
    ],
    "topicGroup": "maths",
    "title": "集合差集",
    "summary": "逐成员判断集合关系。",
    "aliases": [
      "Set Difference"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "集合类型与集合运算",
        "publisher": "Python 官方文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/stdtypes.html#set-types-set-frozenset",
        "locator": "intersection / union / difference / symmetric_difference",
        "language": "en",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Set Difference",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Set Difference\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "差集 A−B 保留在 A 中、但不在 B 中的成员。它有方向：交换 A 和 B 通常会改变结果。",
          "逐项读取 A，只保留未在 B 中找到的成员。不要把差集误认为对称差，也不要把字符串排序作为成员相等的必要条件。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "两个集合",
            "input": "A={A,B}，B={B,C}",
            "output": "{A}",
            "explanation": "按成员 A、B、C 分别判断是否属于 A、是否属于 B，即可独立核对结果。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Symmetric%20Difference",
    "capabilityIds": [
      "op:Symmetric%20Difference"
    ],
    "relatedIds": [
      "op:Symmetric%20Difference"
    ],
    "topicGroup": "maths",
    "title": "集合对称差",
    "summary": "逐成员判断集合关系。",
    "aliases": [
      "Symmetric Difference"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "集合类型与集合运算",
        "publisher": "Python 官方文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/stdtypes.html#set-types-set-frozenset",
        "locator": "intersection / union / difference / symmetric_difference",
        "language": "en",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Symmetric Difference",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Symmetric Difference\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "对称差保留仅属于一个集合的成员；同时属于两个集合的成员被排除。",
          "可以先取并集再删掉交集，等价于 (A−B)∪(B−A)。它适合查找两个线索列表不同的项。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "两个集合",
            "input": "A={A,B}，B={B,C}",
            "output": "{A,C}",
            "explanation": "按成员 A、B、C 分别判断是否属于 A、是否属于 B，即可独立核对结果。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Cartesian%20Product",
    "capabilityIds": [
      "op:Cartesian%20Product"
    ],
    "relatedIds": [
      "op:Cartesian%20Product"
    ],
    "topicGroup": "maths",
    "title": "笛卡尔积",
    "summary": "两个集合的笛卡尔积生成有序组合。",
    "aliases": [
      "Cartesian Product"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "itertools.product 笛卡尔积",
        "publisher": "Python 官方中文文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/itertools.html#itertools.product",
        "locator": "product",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Cartesian Product",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Cartesian Product\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "A×B 是全部 (a,b) 组合，其中 a∈A、b∈B。这里的位置有意义：(A,1) 与 (1,A) 是不同的有序对。",
          "可用双重循环理解：对 A 的每个成员，依次配上 B 的全部成员。若 A 有 m 项、B 有 n 项且成员各不重复，会得到 m×n 个有序对。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "字母与数字配对",
            "input": "A={A,B}，B={1,2}",
            "output": "(A,1),(A,2),(B,1),(B,2)",
            "explanation": "2×2=4；这不是把两个列表逐行一一配对。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Power%20Set",
    "capabilityIds": [
      "op:Power%20Set"
    ],
    "relatedIds": [
      "op:Power%20Set"
    ],
    "topicGroup": "maths",
    "title": "幂集",
    "summary": "幂集枚举一个集合的全部子集。",
    "aliases": [
      "Power Set"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "powerset 配方",
        "publisher": "Python 官方中文文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/itertools.html#itertools-recipes",
        "locator": "powerset",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Power Set",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Power Set\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "幂集 P(A) 包括空集和 A 自身。每个成员有“选入”或“不选入”两种状态，所以 n 个不同成员对应 2ⁿ 个子集。",
          "用二进制掩码枚举：第 i 位为 1 就选第 i 个成员。集合大小增长时结果按指数增长，不能把大量成员误当作一个便宜的线性操作。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "两个成员的全部子集",
            "input": "A={A,B}",
            "output": "∅，{A}，{B}，{A,B}",
            "explanation": "掩码 00、01、10、11 分别对应这四个子集。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Sum",
    "capabilityIds": [
      "op:Sum"
    ],
    "relatedIds": [
      "op:Sum"
    ],
    "topicGroup": "maths",
    "title": "求和",
    "summary": "相加得到总值。",
    "aliases": [
      "Sum"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "表达式与运算符",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Expressions_and_operators",
        "locator": "算术与按位运算",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Sum",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Sum\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "求和把输入解析得到的数依次相加，得到一个数。十六进制写法 0x0a 表示数值 10，而不是字母 a。",
          "本站操作按选择的分隔符读取列表，不能识别为数字的项会被跳过；因此应先检查是否漏读线索。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "顺序累加",
            "input": "2 3 5；分隔符为空格",
            "output": "10",
            "explanation": "0+2=2，2+3=5，5+5=10。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Subtract",
    "capabilityIds": [
      "op:Subtract"
    ],
    "relatedIds": [
      "op:Subtract"
    ],
    "topicGroup": "maths",
    "title": "减法",
    "summary": "依次减去列表中的后续数。",
    "aliases": [
      "Subtract"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "表达式与运算符",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Expressions_and_operators",
        "locator": "算术与按位运算",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Subtract",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Subtract\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "列表减法以第一个数为起点，依次减去后面的数。交换元素顺序可能改变结果。",
          "这不是逐字节减法 SUB。数字列表按分隔符解析，负数的减法应写清符号：减去 −2 等于加上 2。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "从第一项开始相减",
            "input": "10 3 2；分隔符为空格",
            "output": "5",
            "explanation": "(10−3)−2=5；10−(3−2) 则是 9，括号结构不同。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Multiply",
    "capabilityIds": [
      "op:Multiply"
    ],
    "relatedIds": [
      "op:Multiply"
    ],
    "topicGroup": "maths",
    "title": "乘法",
    "summary": "依次相乘得到乘积。",
    "aliases": [
      "Multiply"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "表达式与运算符",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Expressions_and_operators",
        "locator": "算术与按位运算",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Multiply",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Multiply\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "列表乘法把各个数相乘。只要有一个因子为 0，乘积就是 0；负因子的个数决定结果符号。",
          "CyberChef 的 Multiply 是数字运算，不是重复文本。输入分隔符和可识别数字决定实际参与计算的因子。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "依次相乘",
            "input": "2 3 4；分隔符为空格",
            "output": "24",
            "explanation": "2×3=6，6×4=24。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Divide",
    "capabilityIds": [
      "op:Divide"
    ],
    "relatedIds": [
      "op:Divide"
    ],
    "topicGroup": "maths",
    "title": "除法",
    "summary": "依次相除得到商。",
    "aliases": [
      "Divide"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "表达式与运算符",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Expressions_and_operators",
        "locator": "算术与按位运算",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Divide",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Divide\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "列表除法以第一个数为起点，依次除以下一个数。除数为 0 时没有有限的普通实数结果。",
          "除法不满足结合律；多个除数与一个括号里的商不是同一操作。它处理数值列表，不负责字节拆分。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "连续相除",
            "input": "20 2 5；分隔符为空格",
            "output": "2",
            "explanation": "(20÷2)÷5=2；20÷(2÷5)=50。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:MOD",
    "capabilityIds": [
      "op:MOD"
    ],
    "relatedIds": [
      "op:MOD"
    ],
    "topicGroup": "maths",
    "title": "取模",
    "summary": "按给定模数处理每一项。",
    "aliases": [
      "MOD"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "表达式与运算符",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Expressions_and_operators",
        "locator": "算术与按位运算",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · MOD",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"MOD\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "取模把数分到固定周期内。对正整数 n 与正模数 m，可以写 n=q×m+r，其中 0≤r<m。",
          "本站 MOD 对列表中的各个数字分别计算，而不是把全部数字先相加。负值的余数约定在不同语言中可能不同，须核对引擎约定。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "每项分别模 3",
            "input": "15 4 7；m=3",
            "output": "0 1 1",
            "explanation": "15=5×3+0，4=1×3+1，7=2×3+1。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Mean",
    "capabilityIds": [
      "op:Mean"
    ],
    "relatedIds": [
      "op:Mean"
    ],
    "topicGroup": "maths",
    "title": "平均值",
    "summary": "算术平均数等于总和除以项数。",
    "aliases": [
      "Mean"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "数字统计函数",
        "publisher": "Python 官方中文文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/statistics.html",
        "locator": "mean / median / pstdev",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Mean",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Mean\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "先把实际参与计算的数字求和，再除以数字个数。每一项在普通算术平均中权重相同。",
          "本站会跳过无法解析的项，空值与数字 0 不等价。平均数容易受极大或极小值影响，不能自动代表最常见或居中的项。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "三个数的算术平均",
            "input": "2 4 9；分隔符为空格",
            "output": "5",
            "explanation": "(2+4+9)/3=15/3=5。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Median",
    "capabilityIds": [
      "op:Median"
    ],
    "relatedIds": [
      "op:Median"
    ],
    "topicGroup": "maths",
    "title": "中位数",
    "summary": "中位数是排序后中间位置的数。",
    "aliases": [
      "Median"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "数字统计函数",
        "publisher": "Python 官方中文文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/statistics.html",
        "locator": "mean / median / pstdev",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Median",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Median\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "奇数个数字取正中间一项；偶数个数字取中间两项的算术平均。不能直接选输入列表中间的字符。",
          "例如含有极端值的数据，中位数仍由排序位置决定。先检查所有项是否被成功读取，再确定项数和中间位置。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "偶数个数字",
            "input": "1 9 3 7；分隔符为空格",
            "output": "5",
            "explanation": "排序为 1,3,7,9，中间两项是 3 和 7，(3+7)/2=5。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Standard%20Deviation",
    "capabilityIds": [
      "op:Standard%20Deviation"
    ],
    "relatedIds": [
      "op:Standard%20Deviation"
    ],
    "topicGroup": "maths",
    "title": "标准差",
    "summary": "标准差把偏离均值的程度换回原单位。",
    "aliases": [
      "Standard Deviation"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "数字统计函数",
        "publisher": "Python 官方中文文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/statistics.html",
        "locator": "mean / median / pstdev",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Standard Deviation",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Standard Deviation\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "先求平均数 μ，再计算每项 (x−μ)²。总体标准差是这些平方偏差平均值的平方根，即 √(Σ(x−μ)²/n)。",
          "本站该操作计算总体形式，不能直接当作除以 n−1 的样本标准差。平方防止正负偏差互相抵消，开方把单位恢复。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "对称的两项",
            "input": "2 4；分隔符为空格",
            "output": "1",
            "explanation": "μ=3；平方偏差为 1 和 1，√((1+1)/2)=1。样本标准差则为 √2。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extended%20GCD",
    "capabilityIds": [
      "op:Extended%20GCD"
    ],
    "relatedIds": [
      "op:Extended%20GCD"
    ],
    "topicGroup": "maths",
    "title": "扩展欧几里得算法",
    "summary": "扩展欧几里得算法求 Bézout 系数。",
    "aliases": [
      "Extended GCD"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "整数最大公约数 gcd",
        "publisher": "Python 官方中文文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/math.html#math.gcd",
        "locator": "gcd",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Extended GCD",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Extended GCD\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "欧几里得算法反复执行 a=q×b+r，并把 (a,b) 更新为 (b,r)，直到余数为 0；最后的非零余数是 gcd(a,b)。",
          "扩展版把这些等式倒推回去，求整数 x、y 使 ax+by=gcd(a,b)。系数一般不唯一，但代入等式应得到同一个最大公约数。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "Bézout 等式",
            "input": "a=30，b=18",
            "output": "gcd=6；x=−1，y=2",
            "explanation": "30−18=12，18−12=6；6=18−(30−18)=−30+2×18。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Modular%20Exponentiation",
    "capabilityIds": [
      "op:Modular%20Exponentiation"
    ],
    "relatedIds": [
      "op:Modular%20Exponentiation"
    ],
    "topicGroup": "maths",
    "title": "模幂运算",
    "summary": "模幂求 aᵉ mod m。",
    "aliases": [
      "Modular Exponentiation"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "内置函数 pow、sum",
        "publisher": "Python 官方中文文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/functions.html",
        "locator": "pow / sum",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Modular Exponentiation",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Modular Exponentiation\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "每次相乘后都可以先对 m 取模，不必构造整个巨大幂。指数的二进制展开让算法用反复平方组合需要的幂。",
          "例如 e=13=8+4+1，只需 a、a²、a⁴、a⁸ 的余数再相乘。它是 RSA 等算法中的基础步骤，但单独做一次模幂不等于完成加密协议。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "反复平方",
            "input": "a=3，e=5，m=7",
            "output": "5",
            "explanation": "3² mod 7=2，3⁴ mod 7=4，再乘 3 得 12 mod 7=5。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:OR",
    "capabilityIds": [
      "op:OR"
    ],
    "relatedIds": [
      "op:OR"
    ],
    "topicGroup": "maths",
    "title": "按位或",
    "summary": "在 8 位字节上逐位应用真值规则。",
    "aliases": [
      "OR"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "按位或怎样合并置位",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_OR",
        "locator": "描述、规则与示例",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "8 位按位运算、加减法实际实现",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/knowledge/cyberchef/src/core/lib/BitwiseOp.mjs",
        "locator": "bitOp / and / or / not / add / sub",
        "language": "en",
        "kind": "implementation",
        "upstreamUrl": "https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/lib/BitwiseOp.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · OR",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"OR\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "把两个字节的相同位置逐位比较，至少一个位为 1 时输出 1。它常用于设置标记位。",
          "本站用输入字节与所选格式的密钥字节配对；密钥较短时循环使用。不是逻辑运算中的“只要有一个非空就返回文本”。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "置低四位",
            "input": "输入 F0；密钥 0F；十六进制",
            "output": "FF",
            "explanation": "11110000 OR 00001111 =11111111。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:AND",
    "capabilityIds": [
      "op:AND"
    ],
    "relatedIds": [
      "op:AND"
    ],
    "topicGroup": "maths",
    "title": "按位与",
    "summary": "在 8 位字节上逐位应用真值规则。",
    "aliases": [
      "AND"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "按位与怎样选择位",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_AND",
        "locator": "描述、规则与示例",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "8 位按位运算、加减法实际实现",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/knowledge/cyberchef/src/core/lib/BitwiseOp.mjs",
        "locator": "bitOp / and / or / not / add / sub",
        "language": "en",
        "kind": "implementation",
        "upstreamUrl": "https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/lib/BitwiseOp.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · AND",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"AND\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "相同位置两个位都为 1 时输出 1，否则输出 0。它常用作掩码，筛出指定的位。",
          "与 0 的位相与会清零，与 1 的位相与会保留。本站逐字节运算，密钥格式决定读到的掩码数值。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "保留低四位",
            "input": "输入 AB；密钥 0F；十六进制",
            "output": "0B",
            "explanation": "10101011 AND 00001111 =00001011。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:NOT",
    "capabilityIds": [
      "op:NOT"
    ],
    "relatedIds": [
      "op:NOT"
    ],
    "topicGroup": "maths",
    "title": "按位取反",
    "summary": "在 8 位字节上逐位应用真值规则。",
    "aliases": [
      "NOT"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "为什么取反需要确定位宽",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_NOT",
        "locator": "描述、规则与示例",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "8 位按位运算、加减法实际实现",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/knowledge/cyberchef/src/core/lib/BitwiseOp.mjs",
        "locator": "bitOp / and / or / not / add / sub",
        "language": "en",
        "kind": "implementation",
        "upstreamUrl": "https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/lib/BitwiseOp.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · NOT",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"NOT\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "按位取反将每个 0 改成 1、每个 1 改成 0。本站把位宽固定为一个字节，即 8 位。",
          "计算 ~x 后还要保留低 8 位，所以 FF 变为 00。不同语言中有符号整数的 ~x 可能显示负数，不能直接作为本站字节结果。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "8 位取反",
            "input": "输入 0F；十六进制",
            "output": "F0",
            "explanation": "00001111 逐位翻转成 11110000。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Bit%20shift%20left",
    "capabilityIds": [
      "op:Bit%20shift%20left"
    ],
    "relatedIds": [
      "op:Bit%20shift%20left"
    ],
    "topicGroup": "maths",
    "title": "位左移",
    "summary": "移位改变每个字节内部的位位置。",
    "aliases": [
      "Bit shift left"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "左移运算",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Left_shift",
        "locator": "描述、规则与示例",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Bit shift left",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Bit shift left\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "逐字节向左移动指定位数，右侧补 0；越过该字节高位的位被丢弃。保留 8 位时与无限位宽整数乘 2ⁿ 不完全相同。",
          "先确认移位量，再画出原字节的 8 位排列。移位不同于循环移位，丢失的信息通常不能仅靠反向移位恢复。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "左移一位",
            "input": "81；十六进制；移位数 1",
            "output": "02",
            "explanation": "10000001→00000010，高位的 1 已丢弃。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Bit%20shift%20right",
    "capabilityIds": [
      "op:Bit%20shift%20right"
    ],
    "relatedIds": [
      "op:Bit%20shift%20right"
    ],
    "topicGroup": "maths",
    "title": "位右移",
    "summary": "移位改变每个字节内部的位位置。",
    "aliases": [
      "Bit shift right"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "右移运算",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Unsigned_right_shift",
        "locator": "描述、规则与示例",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Bit shift right",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Bit shift right\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "逐字节向右移动指定位数，左侧补 0；越过低位的位被丢弃。本站处理无符号字节，不做有符号数的符号扩展。",
          "先确认移位量，再画出原字节的 8 位排列。移位不同于循环移位，丢失的信息通常不能仅靠反向移位恢复。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "右移一位",
            "input": "81；十六进制；移位数 1",
            "output": "40",
            "explanation": "10000001→01000000，最低位的 1 被丢弃。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Rotate%20left",
    "capabilityIds": [
      "op:Rotate%20left"
    ],
    "relatedIds": [
      "op:Rotate%20left"
    ],
    "topicGroup": "maths",
    "title": "循环左移",
    "summary": "8 位循环移位与普通移位的差异。",
    "aliases": [
      "Rotate left"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Rotate left",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Rotate left\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "循环左移把越过高位的位重新放到低位；在固定 8 位宽度内，位的数量与次序循环关系保持不变。",
          "本站还有“跨字节进位”参数，会改变位跨相邻字节的传播方式。下例关闭该参数，不能把逐字节结果当作整个多字节数的旋转。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "逐字节循环左移",
            "input": "81；移位数 1；不跨字节进位",
            "output": "03",
            "explanation": "10000001 的最高位 1 回到最低位，结果 00000011。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Rotate%20right",
    "capabilityIds": [
      "op:Rotate%20right"
    ],
    "relatedIds": [
      "op:Rotate%20right"
    ],
    "topicGroup": "maths",
    "title": "循环右移",
    "summary": "8 位循环移位与普通移位的差异。",
    "aliases": [
      "Rotate right"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Rotate right",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Rotate right\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "循环右移把越过低位的位重新放到高位；固定宽度下可以用相反方向的相同位数还原。",
          "本站还有“跨字节进位”参数，会改变位跨相邻字节的传播方式。下例关闭该参数，不能把逐字节结果当作整个多字节数的旋转。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "逐字节循环右移",
            "input": "81；移位数 1；不跨字节进位",
            "output": "C0",
            "explanation": "10000001 的最低位 1 回到最高位，结果 11000000。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:ADD",
    "capabilityIds": [
      "op:ADD"
    ],
    "relatedIds": [
      "op:ADD"
    ],
    "topicGroup": "maths",
    "title": "逐字节加法",
    "summary": "固定 8 位的加减使用模 256。",
    "aliases": [
      "模256",
      "字节回绕",
      "ADD"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "8 位按位运算、加减法实际实现",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/knowledge/cyberchef/src/core/lib/BitwiseOp.mjs",
        "locator": "bitOp / and / or / not / add / sub",
        "language": "en",
        "kind": "implementation",
        "upstreamUrl": "https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/lib/BitwiseOp.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · ADD",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"ADD\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "逐字节加法把输入字节与密钥字节相加，再保留低 8 位：结果=(输入+密钥) mod 256。密钥较短时循环使用。",
          "操作名 ADD/SUB 与数字列表 Sum/Subtract 不同。上游旧描述写有 MOD 255，但官方实际实现使用 256；这里按实际代码中的字节规则核对。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "跨越 255",
            "input": "FF；密钥 01；十六进制",
            "output": "00",
            "explanation": "255+1=256；256 mod 256=0。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:SUB",
    "capabilityIds": [
      "op:SUB"
    ],
    "relatedIds": [
      "op:SUB"
    ],
    "topicGroup": "maths",
    "title": "逐字节减法",
    "summary": "固定 8 位的加减使用模 256。",
    "aliases": [
      "模256",
      "字节回绕",
      "SUB"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "8 位按位运算、加减法实际实现",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/knowledge/cyberchef/src/core/lib/BitwiseOp.mjs",
        "locator": "bitOp / and / or / not / add / sub",
        "language": "en",
        "kind": "implementation",
        "upstreamUrl": "https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/lib/BitwiseOp.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · SUB",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"SUB\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "逐字节减法把输入字节减去密钥字节，负数加上 256，得到 0～255 范围的结果。它可以撤销同密钥的逐字节 ADD。",
          "操作名 ADD/SUB 与数字列表 Sum/Subtract 不同。上游旧描述写有 MOD 255，但官方实际实现使用 256；这里按实际代码中的字节规则核对。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "从 0 减 1",
            "input": "00；密钥 01；十六进制",
            "output": "FF",
            "explanation": "0−1=−1；加上 256 得 255，即 FF。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Pseudo-Random%20Number%20Generator",
    "capabilityIds": [
      "op:Pseudo-Random%20Number%20Generator"
    ],
    "relatedIds": [
      "op:Pseudo-Random%20Number%20Generator"
    ],
    "topicGroup": "maths",
    "title": "生成伪随机数",
    "summary": "分清随机字节与区间内整数。",
    "aliases": [
      "Pseudo-Random Number Generator"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "密码学随机值 getRandomValues",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Crypto/getRandomValues",
        "locator": "安全随机整数数组",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Pseudo-Random Number Generator",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Pseudo-Random Number Generator\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "密码学伪随机生成器从内部状态和熵产生字节。本站优先使用浏览器 crypto.getRandomValues，缺少该接口时由引擎使用 Fortuna 路径。",
          "输出 1 个字节可表示 0～255。转换为十六进制、整数或字节数组只是显示方式，并不能从显示方式判断随机质量。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "一个字节的表示",
            "input": "假设本次随机字节为十进制 165",
            "output": "Hex=a5；8 位二进制=10100101",
            "explanation": "这是同一字节的表示核对，不保证每次生成都会得到 165。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Pseudo-Random%20Integer%20Generator",
    "capabilityIds": [
      "op:Pseudo-Random%20Integer%20Generator"
    ],
    "relatedIds": [
      "op:Pseudo-Random%20Integer%20Generator"
    ],
    "topicGroup": "maths",
    "title": "生成伪随机整数",
    "summary": "分清随机字节与区间内整数。",
    "aliases": [
      "Pseudo-Random Integer Generator"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "密码学随机值 getRandomValues",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Crypto/getRandomValues",
        "locator": "安全随机整数数组",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Pseudo-Random Integer Generator",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Pseudo-Random Integer Generator\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "此操作在指定的整数范围内生成随机整数。内部将随机字节映射到区间，而不是对输入文本加密。",
          "结果是随机的，不能规定一个固定输出；设置最小值、最大值和数量后，应检查每个整数是否落在区间内。浏览器普通 Math.random 与密码学随机接口的用途不同。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "区间大小核对",
            "input": "最小值=10，最大值=12，数量=1",
            "output": "可能值为 10、11、12",
            "explanation": "包含两端时共有 12−10+1=3 个候选；下一次允许重复上一次结果。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Pseudo-Random%20Prime%20Generator",
    "capabilityIds": [
      "op:Pseudo-Random%20Prime%20Generator"
    ],
    "relatedIds": [
      "op:Pseudo-Random%20Prime%20Generator"
    ],
    "topicGroup": "maths",
    "title": "生成伪随机素数",
    "summary": "先生成候选整数，再做素性检验。",
    "aliases": [
      "Pseudo-Random Prime Generator"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "Miller–Rabin 素性检验",
        "publisher": "美国国家标准与技术研究院 NIST",
        "url": "https://xlinux.nist.gov/dads/HTML/millerRabin.html",
        "locator": "Definition",
        "language": "en",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Pseudo-Random Prime Generator",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Pseudo-Random Prime Generator\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "指定 k 位时候选整数应处于 2^(k−1) 至 2^k−1。Miller–Rabin 检验通过模幂寻找合数证据；找到了证据就淘汰候选。",
          "有限轮概率检验通过不能普遍等同数学证明。更多检验轮数降低错误通过概率，本站“密码学等级”改变检验强度，不保证某个固定生成结果。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "4 位素数的范围",
            "input": "位长=4",
            "output": "范围 8～15；其中素数为 11、13",
            "explanation": "9 可被 3 整除，15 可被 3 和 5 整除；11、13 没有不超过平方根的非平凡因子。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Convert%20distance",
    "capabilityIds": [
      "op:Convert%20distance"
    ],
    "relatedIds": [
      "op:Convert%20distance"
    ],
    "topicGroup": "maths",
    "title": "距离单位换算",
    "summary": "先换基准单位，再应用目标比例。",
    "aliases": [
      "Convert distance"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "国际单位制中文定义",
        "publisher": "中国计量科学研究院",
        "url": "https://www.nim.ac.cn/520/si.html",
        "locator": "米、千克、秒",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "SI 词头",
        "publisher": "国际计量局 BIPM",
        "url": "https://www.bipm.org/en/measurement-units/si-prefixes",
        "locator": "kilo / centi / milli",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · Convert distance",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Convert distance\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "距离单位换算改变同一长度的数值表示。先换到共同基准米，再除以目标单位相当于多少米。",
          "kilo 表示 10³，centi 表示 10⁻²；因此 1 km=1000 m、1 cm=0.01 m。工具中的“车、球场”等比较尺度是约定值，不是计量标准。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "千米转米",
            "input": "1.25 km",
            "output": "1250 m",
            "explanation": "1.25×1000=1250。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Convert%20area",
    "capabilityIds": [
      "op:Convert%20area"
    ],
    "relatedIds": [
      "op:Convert%20area"
    ],
    "topicGroup": "maths",
    "title": "面积单位换算",
    "summary": "先换基准单位，再应用目标比例。",
    "aliases": [
      "Convert area"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "国际单位制中文定义",
        "publisher": "中国计量科学研究院",
        "url": "https://www.nim.ac.cn/520/si.html",
        "locator": "米、千克、秒",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "SI 词头",
        "publisher": "国际计量局 BIPM",
        "url": "https://www.bipm.org/en/measurement-units/si-prefixes",
        "locator": "kilo / centi / milli",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · Convert area",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Convert area\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "面积单位来自长度单位的平方。1 cm²=(0.01 m)²=0.0001 m²，不能沿用长度的 100 倍关系。",
          "换算时先核对量纲是面积，再将长度比例平方。平方千米与千米是不同量，输入只有数字还需选择单位。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "平方米转平方厘米",
            "input": "2 m²",
            "output": "20000 cm²",
            "explanation": "每边 100 cm，1 m²=100×100=10000 cm²。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Convert%20mass",
    "capabilityIds": [
      "op:Convert%20mass"
    ],
    "relatedIds": [
      "op:Convert%20mass"
    ],
    "topicGroup": "maths",
    "title": "质量单位换算",
    "summary": "先换基准单位，再应用目标比例。",
    "aliases": [
      "Convert mass"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "国际单位制中文定义",
        "publisher": "中国计量科学研究院",
        "url": "https://www.nim.ac.cn/520/si.html",
        "locator": "米、千克、秒",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "SI 词头",
        "publisher": "国际计量局 BIPM",
        "url": "https://www.bipm.org/en/measurement-units/si-prefixes",
        "locator": "kilo / centi / milli",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · Convert mass",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Convert mass\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "质量换算用同一物理量在不同单位下的比例。SI 质量基本单位是 kg，1 g=0.001 kg。",
          "质量不是力：公斤与牛顿不能只凭一个固定倍数互换。本站此入口处理质量单位，不计算随重力变化的重量。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "千克转克",
            "input": "2.5 kg",
            "output": "2500 g",
            "explanation": "2.5×1000=2500。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Convert%20speed",
    "capabilityIds": [
      "op:Convert%20speed"
    ],
    "relatedIds": [
      "op:Convert%20speed"
    ],
    "topicGroup": "maths",
    "title": "速度单位换算",
    "summary": "先换基准单位，再应用目标比例。",
    "aliases": [
      "Convert speed"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "国际单位制中文定义",
        "publisher": "中国计量科学研究院",
        "url": "https://www.nim.ac.cn/520/si.html",
        "locator": "米、千克、秒",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "SI 词头",
        "publisher": "国际计量局 BIPM",
        "url": "https://www.bipm.org/en/measurement-units/si-prefixes",
        "locator": "kilo / centi / milli",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · Convert speed",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Convert speed\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "速度是距离除以时间，换算时分子和分母都要换。1 km/h=1000 m/3600 s=1/3.6 m/s。",
          "不能只把 km 换成 m 就结束；小时变秒使分母也增加。不同量纲的距离、时长、速度不可混用。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "公里每小时转米每秒",
            "input": "72 km/h",
            "output": "20 m/s",
            "explanation": "72×1000÷3600=20。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Convert%20data%20units",
    "capabilityIds": [
      "op:Convert%20data%20units"
    ],
    "relatedIds": [
      "op:Convert%20data%20units"
    ],
    "topicGroup": "maths",
    "title": "数据单位换算",
    "summary": "区别十进制词头、二进制词头与位/字节。",
    "aliases": [
      "Convert data units"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "二进制词头与数据单位",
        "publisher": "NIST",
        "url": "https://physics.nist.gov/cuu/Units/binary.html",
        "locator": "Examples and comparisons",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Convert data units",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Convert data units\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "1 byte（B）=8 bit（b）；1 kB 按十进制为 1000 B，1 KiB 按二进制为 1024 B。大写 B 和小写 b 的量纲相差 8 倍。",
          "先把输入转为 bit 或 byte，再按 1000 或 1024 的相应幂转换。不能把 MB/s 与 Mb/s 当作同一传输速率。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "二进制千字节",
            "input": "1 KiB",
            "output": "1024 B=8192 bit",
            "explanation": "1024×8=8192；1 kB 则是 1000 B。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generate%20UUID",
    "capabilityIds": [
      "op:Generate%20UUID"
    ],
    "relatedIds": [
      "op:Generate%20UUID"
    ],
    "topicGroup": "maths",
    "title": "生成 UUID",
    "summary": "UUID 版本规定不同的生成机制。",
    "aliases": [
      "Generate UUID"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "UUID 中文文档",
        "publisher": "Python 官方文档",
        "url": "https://docs.python.org/zh-cn/3.13/library/uuid.html",
        "locator": "uuid3 / uuid4 / uuid5",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "RFC 9562 · UUID（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9562.html",
        "locator": "§4、§5.4、§5.5、§5.7",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · Generate UUID",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Generate UUID\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "UUID 总长为 128 位，常写作 8-4-4-4-12 个十六进制字符。v4 使用随机位；v3/v5 由命名空间和名称计算；时间类版本有各自字段布局。",
          "本站默认 v4，也提供 v1、v3、v5、v6、v7。标识符不是加密密钥，不是所有版本都随机，也不能因名为“唯一”就保证永远绝不碰撞。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "确定性的 UUID v5",
            "input": "DNS 命名空间；名称 www.example.com",
            "output": "2ed6657d-e927-568b-95e1-2665a8aea6a2",
            "explanation": "相同命名空间与名称重复计算应得到同一 v5；随机 v4 没有固定输出。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Analyse%20UUID",
    "capabilityIds": [
      "op:Analyse%20UUID"
    ],
    "relatedIds": [
      "op:Analyse%20UUID"
    ],
    "topicGroup": "maths",
    "title": "分析 UUID",
    "summary": "按固定字段检查版本与变体。",
    "aliases": [
      "Analyse UUID"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 9562 · UUID（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9562.html",
        "locator": "§4、§5.4、§5.5、§5.7",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Analyse UUID",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Analyse UUID\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "规范字符串的第三组首位是版本位，例如 xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx 中的 4 表示 v4。第四组首位中的高位决定变体。",
          "分析器可以识别版本并在该版本有相应字段时解释元数据。v4 的随机位不能可靠还原生成时间或机器身份，不能把每个 UUID 都当时间戳。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "读版本位",
            "input": "550e8400-e29b-41d4-a716-446655440000",
            "output": "版本 v4；IETF 变体",
            "explanation": "第三组 41d4 的首位是 4；第四组 a716 的 a 二进制高两位为 10。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generate%20De%20Bruijn%20Sequence",
    "capabilityIds": [
      "op:Generate%20De%20Bruijn%20Sequence"
    ],
    "relatedIds": [
      "op:Generate%20De%20Bruijn%20Sequence"
    ],
    "topicGroup": "maths",
    "title": "生成德布鲁因序列",
    "summary": "循环序列令每种长度 n 的组合出现一次。",
    "aliases": [
      "Generate De Bruijn Sequence"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "A combinatorial problem，1946 原始论文",
        "publisher": "N. G. de Bruijn / 埃因霍温理工大学存档",
        "url": "https://pure.tue.nl/ws/portalfiles/portal/4442708/597473.pdf",
        "locator": "原论文 pp. 461–467",
        "language": "en",
        "kind": "author-spec"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Generate De Bruijn Sequence",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Generate De Bruijn Sequence\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "对 k 个符号、长度 n 的词，德布鲁因循环序列包含每种词恰好一次作为连续窗口。理想循环长度为 kⁿ。",
          "阅读时必须处理末尾接回开头的窗口。若写成线性文本，可在末尾补前 n−1 个符号；这些补位不代表新增循环位置。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "二元、长度 3 的窗口",
            "input": "循环序列 00010111",
            "output": "000,001,010,101,011,111,110,100",
            "explanation": "8=2³ 个窗口；最后两项跨越末尾回到开头。线性写法可为 0001011100。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generate%20Lorem%20Ipsum",
    "capabilityIds": [
      "op:Generate%20Lorem%20Ipsum"
    ],
    "relatedIds": [
      "op:Generate%20Lorem%20Ipsum"
    ],
    "topicGroup": "maths",
    "title": "生成占位文本",
    "summary": "用无业务意义的文本测试排版长度。",
    "aliases": [
      "Generate Lorem Ipsum"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Generate Lorem Ipsum",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Generate Lorem Ipsum\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Lorem Ipsum 是排版时使用的占位文本，目的在于观察文字密度、换行与版式，而不是生成可用于推理的有意义线索。",
          "本站操作按段落、句子、词或字节等长度方式生成。词数与字节数不是同一数量；这种文本不能当作随机密钥。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "长度单位比较",
            "input": "占位片段：lorem ipsum",
            "output": "2 个词；UTF-8/ASCII 下含空格共 11 字节",
            "explanation": "lorem=5、空格=1、ipsum=5，因此总长 11 字节。此片段只演示计数，非保证的随机输出。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:audio-spectrum",
    "capabilityIds": [
      "native:audio-spectrum"
    ],
    "relatedIds": [
      "native:audio-spectrum"
    ],
    "topicGroup": "audio",
    "title": "声音频谱与线索分析",
    "summary": "分窗做 FFT，把时间、频率和强度画成二维图。",
    "aliases": [
      "频谱",
      "频率",
      "傅里叶",
      "FFT",
      "声谱图"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "频域分析与 FFT 窗口",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/AnalyserNode",
        "locator": "fftSize / frequencyBinCount",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "本站声谱图的窗函数与频率坐标",
        "publisher": "迷雾工具箱随站实现",
        "url": "/media.js",
        "locator": "spectrogram",
        "language": "zh-CN",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "声谱图把声音切成短时间窗，对每窗做傅里叶变换。横轴对应时间，纵轴对应频率，颜色表示该时间和频率处的信号强度。",
          "采样率 Fs、FFT 长度 N 对应频率间隔约 Fs/N。较长窗口能细分频率，却会把短事件摊到更长时间；最高可解释频率受 Fs/2 限制。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "频率格点",
            "input": "采样率 48000 Hz，FFT 长度 4096",
            "output": "频率间隔约 11.71875 Hz；上限 24000 Hz",
            "explanation": "48000/4096=11.71875；因此分辨窄频率线索时，要同时核对窗口大小和采样率。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:audio-sstv",
    "capabilityIds": [
      "native:audio-sstv"
    ],
    "relatedIds": [
      "native:audio-sstv"
    ],
    "topicGroup": "audio",
    "title": "SSTV",
    "summary": "SSTV 通过扫描、音调映射与同步传送静止图片。",
    "aliases": [
      "慢扫描电视",
      "Slow Scan Television",
      "Martin",
      "Scottie",
      "Robot",
      "VIS"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CRAC SSTV 图像传送演练规则",
        "publisher": "中国无线电协会业余无线电分会",
        "url": "https://www.crac.org.cn/?p=1088",
        "locator": "SSTV 通信成绩与制式选择",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "Slow Scan Television Explained",
        "publisher": "英国业余电视俱乐部 BATC",
        "url": "https://batc.org.uk/wp-content/uploads/Slow-Scan-Television-Explained.pdf",
        "locator": "Modes and Systems；印刷 pp. 15–19、22、94",
        "language": "en",
        "kind": "author-spec"
      },
      {
        "id": "s3",
        "title": "随站 SSTV 模式时序表",
        "publisher": "Mathieu Renaud / Equinoxis",
        "url": "/vendor/hunt/sstv/spec.js",
        "locator": "VIS_MAP；M1、M2、S1、S2、SDX、R36、R72",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "SSTV 是慢扫描电视，传输的是静止图片。图像被按扫描线和颜色分量分解，像素分量的强弱转换为音频频率；接收端测量音调，再按相同模式逐行重建。",
          "常见模拟 SSTV 用约 1500 Hz 对应分量最小值、2300 Hz 对应最大值，1200 Hz 用作同步。彩色模式可能按 RGB 分量逐条发送，也可能发送亮度与色差，不能只把任意录音画成波形当作解码。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "模式与 VIS：为什么选错会出现斜图",
        "paragraphs": [
          "VIS 是图像开头的模式标识：开始音调之后传送 7 个数据位和一个奇偶校验位，数据位以约 1100/1300 Hz 的音调区分。接收器据此选择每行时长、尺寸和颜色分量顺序。",
          "模式决定“何时读哪个像素”。Martin 1、Martin 2 与 Scottie 模式的扫描时序并不一样；Robot 模式还涉及亮度/色差分量。用错模式时即使听到了信号，也可能出现斜行、错色或无法定位图像。"
        ],
        "sourceIds": [
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "模式标识核对",
            "input": "VIS 数据值 44",
            "output": "Martin 1；320×256；按 G、B、R 通道扫描",
            "explanation": "44 对应随站模式表的 M1；40 是 M2，不能因尺寸相同就交换时序。"
          }
        ]
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "此处给出的是像素通道映射示意，完整解码还必须识别模式、行起点和颜色分量。"
        ],
        "sourceIds": [
          "s2"
        ],
        "examples": [
          {
            "label": "音调到像素强度",
            "input": "在采用 1500～2300 Hz 线性映射的通道内，测得 1900 Hz",
            "output": "归一化分量约 0.5",
            "explanation": "(1900−1500)/(2300−1500)=0.5；1200 Hz 同步脉冲不是一个黑色像素。"
          }
        ]
      },
      {
        "title": "本站能处理的模式",
        "paragraphs": [
          "本地引擎的实际 VIS 表有 7 个模式：Robot 36（8）、Robot 72（12）、Martin 2（40）、Martin 1（44）、Scottie 2（56）、Scottie 1（60）、Scottie DX（76）。它没有 PD120 模式，不能把国际空间站所有 SSTV 活动录音都承诺可解。",
          "保留录音开头的标识和同步段；用变速改变音高会同时改变频率与扫描时间。输入需要已经取得的音频，本站不会从无线电载波中自行完成接收机解调。"
        ],
        "sourceIds": [
          "s3"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:audio-music",
    "capabilityIds": [
      "native:audio-music"
    ],
    "relatedIds": [
      "native:audio-music"
    ],
    "topicGroup": "audio",
    "title": "音高与乐理",
    "summary": "十二平均律用每八度 12 个等比例半音描述音高。",
    "aliases": [
      "十二平均律",
      "基频",
      "音程",
      "和弦"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "音名、MIDI 编号与频率的关系",
        "publisher": "新南威尔士大学物理学院",
        "url": "https://www.phys.unsw.edu.au/jw/notes.html",
        "locator": "MIDI number and equal-tempered semitone conversion",
        "language": "en",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "本站音高、音符与和弦分析",
        "publisher": "迷雾工具箱随站实现",
        "url": "/round2/music-engine.js",
        "locator": "detectPitch / theory",
        "language": "zh-CN",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "以 A4=440 Hz 为参考时，第 n 个 MIDI 音符频率 f=440×2^((n−69)/12)。八度上升使频率翻倍，相邻半音按 2^(1/12) 的比例变化。",
          "音高识别从声音周期估计基频，谐波、同时发声的多个音与噪声都可能影响结果。乐理入口另以音符间的音程关系查询音阶或和弦，不能把最强谱峰自动当作基频。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "八度核对",
            "input": "MIDI 69 与 MIDI 81",
            "output": "A4=440 Hz；A5=880 Hz",
            "explanation": "81−69=12，440×2^(12/12)=880；C 大三和弦的音级为 C、E、G。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:audio-play",
    "capabilityIds": [
      "native:audio-play"
    ],
    "relatedIds": [
      "native:audio-play"
    ],
    "topicGroup": "audio",
    "title": "乐器弹奏与 MIDI",
    "summary": "音高决定按键，拍数和 BPM 决定持续时间。",
    "aliases": [
      "拍数",
      "BPM",
      "MIDI",
      "Note On"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "MIDI 1.0 消息总表",
        "publisher": "MIDI Association",
        "url": "https://midi.org/summary-of-midi-1-0-messages",
        "locator": "Note On / Note Off",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "本站旋律解析与弹奏时序",
        "publisher": "迷雾工具箱随站实现",
        "url": "/round1/instruments.js",
        "locator": "parseMelody / music-play",
        "language": "zh-CN",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "MIDI 是音符和控制事件的表示，不是录制好的声音。Note On 指定通道、音符编号与力度；播放器再用自己的音色合成出可听见的音。",
          "本站旋律写法为 音名:拍数，R 是休止。BPM 指每分钟拍数，一拍时长为 60/BPM 秒；换音色不会改变写入的音符编号。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "把拍数换成时间",
            "input": "C4:2 R:1；BPM=120",
            "output": "C4 两拍为 1 秒；休止一拍为 0.5 秒；共 1.5 秒",
            "explanation": "一拍=60/120=0.5 秒。MIDI Note On 90 3C 40 的 3C 是十进制 60，不是音频采样。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20Audio%20Metadata",
    "capabilityIds": [
      "op:Extract%20Audio%20Metadata"
    ],
    "relatedIds": [
      "op:Extract%20Audio%20Metadata"
    ],
    "topicGroup": "audio",
    "title": "提取音频元数据",
    "summary": "从容器和音频流头部读取技术参数。",
    "aliases": [
      "Extract Audio Metadata"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "音频信息提取与媒体流字段",
        "publisher": "阿里云官方文档",
        "url": "https://help.aliyun.com/zh/oss/user-guide/audio-information-extraction",
        "locator": "格式、音频流信息",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Extract Audio Metadata",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Extract Audio Metadata\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "音频元数据包括格式、编码、采样率、声道与时长等。采样率是每秒采样次数，声道是同时保存的信号通道数量，与码率不是一个概念。",
          "元数据解析主要读取文件结构，不会替你听懂声音中的内容。标题、作者等描述性标签也不一定存在，不同容器保存的字段不同。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "PCM 数据量估算",
            "input": "48000 Hz、16 bit、双声道、10 秒",
            "output": "裸 PCM 数据 1920000 字节，未计文件头",
            "explanation": "48000×2 字节×2 声道×10=1920000；压缩音频不能直接用此式算实际文件体积。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20ID3",
    "capabilityIds": [
      "op:Extract%20ID3"
    ],
    "relatedIds": [
      "op:Extract%20ID3"
    ],
    "topicGroup": "audio",
    "title": "提取 ID3 标签",
    "summary": "ID3 标签把标题、作者等元信息组织成帧。",
    "aliases": [
      "Extract ID3"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "ID3v2.4.0 标签结构规范",
        "publisher": "ID3.org",
        "url": "https://id3.org/id3v2.4.0-structure",
        "locator": "§3 tag header；§4 frames",
        "language": "en",
        "kind": "author-spec"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Extract ID3",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Extract ID3\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "ID3 不等于音频编码。ID3v2 头部以 ID3 标识版本和标签长度，后面按帧保存信息；例如 TIT2 帧用于标题、TPE1 用于主要表演者。",
          "帧体中的编码标识决定文字怎样解释。v1 与 v2 结构不同，标签可以缺失或被人工改写，所以它适合找线索，不能当作内容真实来源的保证。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "辨认标签与帧",
            "input": "文件开头 49 44 33；某帧标识 54 49 54 32",
            "output": "ASCII 为 ID3；该帧标识为 TIT2（标题）",
            "explanation": "这 3/4 个字节只是标识；读出真正标题还要读取帧长度、编码方式和帧体。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:video",
    "capabilityIds": [
      "native:video"
    ],
    "relatedIds": [
      "native:video"
    ],
    "topicGroup": "video",
    "title": "指定时刻视频帧",
    "summary": "媒体按时间戳定位，解码到目标附近再取得画面。",
    "aliases": [],
    "sources": [
      {
        "id": "s1",
        "title": "媒体时间轴 currentTime",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/currentTime",
        "locator": "以秒表示的媒体位置",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "本站视频处理与 FFmpeg 参数",
        "publisher": "迷雾工具箱随站实现",
        "url": "/hunt-media.js",
        "locator": "video-run；frame / frames / reverse / gif / audio 分支",
        "language": "zh-CN",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "视频帧在时间轴上都有显示时间。固定帧率 F 的理想视频，第 k 帧附近的时间可写 k/F 秒；可变帧率视频不能只用一个固定 F 推算每帧。",
          "本站将起点秒数交给 FFmpeg，并输出一张 PNG。关键帧用于解码定位，目标截图可以是关键帧之后解码得到的画面，截图不是只读压缩包里的一张 JPEG。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "固定帧率的时间位置",
            "input": "假定 25 fps，时间点 2 秒",
            "output": "对应零起点计数约第 50 帧的位置",
            "explanation": "2×25=50；实际帧时间戳和起点偏移仍需核对。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Play%20Media",
    "capabilityIds": [
      "op:Play%20Media"
    ],
    "relatedIds": [
      "op:Play%20Media"
    ],
    "topicGroup": "video",
    "title": "播放媒体",
    "summary": "播放必须同时识别容器和其中的音视频编码。",
    "aliases": [
      "Play Media"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "媒体播放接口与播放失败",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/play",
        "locator": "play() Promise / NotSupportedError",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Play Media",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Play Media\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "扩展名一般描述容器，例如 MP4；音视频流还各有编码，例如 H.264、AAC。容器相同并不保证内部编码相同。",
          "本操作把媒体字节交给浏览器播放器。能够解析文件结构与能够播放是两件事；浏览器不支持的编码不会因改扩展名就自动变成支持的格式。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "文件类型核对",
            "input": "两个都名为 MP4 的文件：一个 H.264/AAC，另一个其他编码",
            "output": "后者是否可播仍取决于浏览器编码支持",
            "explanation": "改为 .mp4 只改名字，没有重新编码流。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:video-frames",
    "capabilityIds": [
      "native:video-frames"
    ],
    "relatedIds": [
      "native:video-frames"
    ],
    "topicGroup": "video",
    "title": "视频连续帧提取",
    "summary": "按设定采样频率从时间轴输出一组静止帧。",
    "aliases": [],
    "sources": [
      {
        "id": "s1",
        "title": "视频截图及帧率参数",
        "publisher": "阿里云官方文档",
        "url": "https://help.aliyun.com/zh/vod/user-guide/frame-animation/",
        "locator": "帧率与片段范围",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "本站视频处理与 FFmpeg 参数",
        "publisher": "迷雾工具箱随站实现",
        "url": "/hunt-media.js",
        "locator": "video-run；frame / frames / reverse / gif / audio 分支",
        "language": "zh-CN",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "抽帧频率为 F 时，输出相邻采样点间隔约 1/F 秒。例如每秒 2 张的抽帧不是提取源视频全部 25/30/60 张画面。",
          "本站按起点、时长和抽帧 fps 调用滤镜，连续帧输出最多 30 张。视频时长不足、时间点或实际时间戳偏移都可能使输出数量减少。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "采样时刻",
            "input": "起点 10 秒，时长 3 秒，每秒 2 帧",
            "output": "理想采样时刻为 10、10.5、11、11.5、12、12.5 秒",
            "explanation": "每 0.5 秒一张，共约 3×2=6 张；这是时序示意，实际以源时间戳与滤镜结果为准。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:video-reverse",
    "capabilityIds": [
      "native:video-reverse"
    ],
    "relatedIds": [
      "native:video-reverse"
    ],
    "topicGroup": "video",
    "title": "视频片段倒放",
    "summary": "将片段中的解码画面顺序反转。",
    "aliases": [],
    "sources": [
      {
        "id": "s1",
        "title": "reverse / areverse 滤镜",
        "publisher": "FFmpeg 官方文档",
        "url": "https://www.ffmpeg.org/ffmpeg-filters.html#reverse_002c-areverse",
        "locator": "reverse / areverse",
        "language": "en",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "本站视频处理与 FFmpeg 参数",
        "publisher": "迷雾工具箱随站实现",
        "url": "/hunt-media.js",
        "locator": "video-run；frame / frames / reverse / gif / audio 分支",
        "language": "zh-CN",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "视频倒放是将片段最后的画面先显示、最早的画面最后显示。压缩视频中帧可能引用其他帧，因此不是把文件字节顺序反转。",
          "本站先截取片段，对解码帧应用 reverse，再输出无音轨视频。reverse 需要缓存片段帧，所以片段越长、分辨率越高，内存负担越大。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "顺序核对",
            "input": "原片段显示 A→B→C",
            "output": "倒放显示 C→B→A；本站输出无音轨",
            "explanation": "帧顺序反转；若同时要声音反转，需要另外处理音频，不能假定本站此入口自动反转音轨。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:video-gif",
    "capabilityIds": [
      "native:video-gif"
    ],
    "relatedIds": [
      "native:video-gif"
    ],
    "topicGroup": "video",
    "title": "视频片段转 GIF",
    "summary": "GIF 将抽取的画面与帧延时保存成动画。",
    "aliases": [],
    "sources": [
      {
        "id": "s1",
        "title": "视频截取动图",
        "publisher": "阿里云官方文档",
        "url": "https://help.aliyun.com/zh/vod/user-guide/frame-animation/",
        "locator": "动图、帧率、时长",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "本站视频处理与 FFmpeg 参数",
        "publisher": "迷雾工具箱随站实现",
        "url": "/hunt-media.js",
        "locator": "video-run；frame / frames / reverse / gif / audio 分支",
        "language": "zh-CN",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "GIF 动画通过多帧画面和每帧延时播放。调低 fps 会减少运动细节；缩小尺寸会减少空间细节，不等同于原视频无损复制。",
          "GIF 的调色板颜色与视频的真彩色编码不同，而且不含音轨。本站按选择的片段、fps 和缩放参数生成动图。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "帧数与时间",
            "input": "片段 2 秒，每秒 5 帧",
            "output": "理想约 10 帧，每帧约 0.2 秒；没有声音",
            "explanation": "2×5=10，1/5=0.2。实际输出还受源帧时间戳和 GIF 时间精度影响。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:video-audio",
    "capabilityIds": [
      "native:video-audio"
    ],
    "relatedIds": [
      "native:video-audio"
    ],
    "topicGroup": "video",
    "title": "视频音轨提取",
    "summary": "从媒体容器选取音频流，解码后另存。",
    "aliases": [],
    "sources": [
      {
        "id": "s1",
        "title": "音频信息提取与媒体流字段",
        "publisher": "阿里云官方文档",
        "url": "https://help.aliyun.com/zh/oss/user-guide/audio-information-extraction",
        "locator": "格式、音频流信息",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "本站视频处理与 FFmpeg 参数",
        "publisher": "迷雾工具箱随站实现",
        "url": "/hunt-media.js",
        "locator": "video-run；frame / frames / reverse / gif / audio 分支",
        "language": "zh-CN",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "视频容器可保存独立的画面流与音频流。提取音轨是选择音频流，跳过视频；若没有音频流，就没有可提取的声音。",
          "本站输出 PCM 16 位 WAV，而不是把原始 AAC/MP3 包直接改名。它会解码音频流，按选定起点和片段时长写出样本。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "WAV 数据量",
            "input": "假定 1 秒、44100 Hz、16 位、单声道 PCM",
            "output": "样本数据 88200 字节，另有 WAV 头",
            "explanation": "44100 次采样×2 字节=88200；扩展为双声道，裸样本数据翻倍。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:sequence-processing",
    "capabilityIds": [
      "native:sequence-processing"
    ],
    "relatedIds": [
      "native:sequence-processing"
    ],
    "topicGroup": "sequence-processing",
    "title": "蛋白质与核酸序列转换",
    "summary": "核酸序列按阅读框每三个碱基组成一个密码子。",
    "aliases": [
      "DNA",
      "RNA",
      "密码子",
      "阅读框",
      "反向互补"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "密码子的三个核苷酸与重编码研究",
        "publisher": "中国科学院",
        "url": "https://www.cas.cn/kj/202502/t20250214_5047103.shtml",
        "locator": "密码子和终止密码子",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "标准遗传密码表",
        "publisher": "NCBI",
        "url": "https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi",
        "locator": "The Standard Code (transl_table=1)",
        "language": "en",
        "kind": "official-doc"
      },
      {
        "id": "s3",
        "title": "本站核酸、蛋白质转换",
        "publisher": "迷雾工具箱随站实现",
        "url": "/science/core.js",
        "locator": "sequence 转换函数",
        "language": "zh-CN",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "DNA 常用 A、C、G、T；RNA 通常用 U 替代 T。翻译要先确定从哪一位开始，以三个碱基为组查遗传密码表，不能逐字母直接映成一个氨基酸。",
          "互补配对遵循 DNA A↔T、C↔G；反向互补还要反转顺序。阅读框、正反链和遗传密码表影响翻译，多个密码子可对应同一种氨基酸，所以蛋白质不能唯一反推出原核酸序列。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "标准遗传密码表的分组",
            "input": "DNA 编码链 ATGGCTTAA，从第 1 位分组",
            "output": "ATG/GCT/TAA → M/A/停止；反向互补为 TTAAGCCAT",
            "explanation": "ATG 对应甲硫氨酸 M、GCT 对应丙氨酸 A、TAA 是停止密码子；不同阅读框会重新分组。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:coordinates",
    "capabilityIds": [
      "native:coordinates"
    ],
    "relatedIds": [
      "native:coordinates"
    ],
    "topicGroup": "coordinates-time",
    "title": "坐标与时间",
    "summary": "先分清坐标格式、基准与时间单位。",
    "aliases": [
      "WGS84",
      "UTM",
      "Geohash",
      "MGRS",
      "儒略日"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "本站经纬度、UTM、时间转换公式",
        "publisher": "迷雾工具箱随站实现",
        "url": "/round2/coordinates-engine.js",
        "locator": "coordinate / convertPoint / timeValue / formatTime",
        "language": "zh-CN",
        "kind": "implementation"
      },
      {
        "id": "s2",
        "title": "时间点、UTC 与毫秒纪元",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date",
        "locator": "时间值与时间戳",
        "language": "zh-CN",
        "kind": "official-doc"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "度分秒将一度分成 60 分、每分分成 60 秒；十进制度数=度+分/60+秒/3600。北纬和东经取正，南纬和西经取负；UTM 还需要带号与半球，Geohash 描述的是一个区域而非无限精度点。",
          "本站原生坐标入口按 WGS84 做网格转换，不把国内互联网地图的不同坐标系自动当作同一地点。时间页则按 UNIX 秒/毫秒、ISO 时区、JD/MJD 对应同一个时刻。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "度分秒转换",
            "input": "39°54′0″N；116°24′0″E",
            "output": "纬度 39.9，经度 116.4",
            "explanation": "39+54/60=39.9；116+24/60=116.4。经纬的顺序和方向需分别核对。"
          },
          {
            "label": "时间单位转换",
            "input": "1970-01-01T00:00:00Z",
            "output": "UNIX 秒=0；JD=2440587.5；MJD=40587",
            "explanation": "本站用 JD=毫秒/86400000+2440587.5；MJD=毫秒/86400000+40587。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20UNIX%20Timestamp",
    "capabilityIds": [
      "pair:To%20UNIX%20Timestamp"
    ],
    "relatedIds": [
      "pair:To%20UNIX%20Timestamp"
    ],
    "topicGroup": "coordinates-time",
    "title": "UNIX 时间戳 编码与解码",
    "summary": "时间戳是相对纪元的数值，单位必须明确。",
    "aliases": [
      "纪元",
      "Epoch",
      "时间戳",
      "To UNIX Timestamp",
      "From UNIX Timestamp"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "Unix 时间戳（秒）",
        "publisher": "Day.js 官方中文文档",
        "url": "https://day.js.org/docs/zh-CN/parse/unix-timestamp",
        "locator": "Unix timestamp",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "时间点、UTC 与毫秒纪元",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date",
        "locator": "时间值与时间戳",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · To UNIX Timestamp",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"To UNIX Timestamp\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "UNIX 时间以 1970-01-01 00:00:00 UTC 为纪元。以秒表示与以毫秒表示相差 1000 倍，不能只根据数字位数猜测全部情况。",
          "编码方向先按日期与时区解析时间点，再换成所选单位；解码方向把数值按指定单位还原日期。UTC 与 UTC+8 是显示同一时刻的两种时区，不改变时刻本身。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "正反方向核对",
            "input": "1970-01-01T00:00:01Z",
            "output": "秒=1；毫秒=1000；解码 1000 毫秒回到原时刻",
            "explanation": "一秒含 1000 毫秒；若把 1000 错当秒，就会变成纪元后 16 分 40 秒。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Haversine%20distance",
    "capabilityIds": [
      "op:Haversine%20distance"
    ],
    "relatedIds": [
      "op:Haversine%20distance"
    ],
    "topicGroup": "coordinates-time",
    "title": "球面距离",
    "summary": "半正矢公式求球面最短弧长。",
    "aliases": [
      "大圆距离",
      "半正矢",
      "Haversine distance"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "HaversineDistance 官方实现",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/HaversineDistance.mjs",
        "locator": "run / distanceTo",
        "language": "en",
        "kind": "implementation",
        "upstreamUrl": "https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/HaversineDistance.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "s2",
        "title": "本站经纬度、UTM、时间转换公式",
        "publisher": "迷雾工具箱随站实现",
        "url": "/round2/coordinates-engine.js",
        "locator": "coordinate / convertPoint / timeValue / formatTime",
        "language": "zh-CN",
        "kind": "implementation"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · Haversine distance",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Haversine distance\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "把两点纬度与经度转换为弧度，计算 a=sin²(Δφ/2)+cosφ₁cosφ₂sin²(Δλ/2)，球心角 c=2atan2(√a,√(1−a))，距离 d=R×c。",
          "这是球面近似的大圆距离，不是道路路线、航行避障距离或椭球上的精确测地线。经纬顺序、度与弧度，以及采用的地球半径都会影响数值。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "赤道上一度经差",
            "input": "(纬度 0，经度 0) 到 (纬度 0，经度 1)",
            "output": "约 111.2 km",
            "explanation": "球心角为 π/180；若 R≈6371 km，d≈6371×π/180≈111.195 km。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Get%20Time",
    "capabilityIds": [
      "op:Get%20Time"
    ],
    "relatedIds": [
      "op:Get%20Time"
    ],
    "topicGroup": "coordinates-time",
    "title": "获取时间",
    "summary": "读取当前时间点再按指定时区和格式显示。",
    "aliases": [
      "Get Time"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "时间点、UTC 与毫秒纪元",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date",
        "locator": "时间值与时间戳",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Get Time",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Get Time\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "此操作读取执行时的当前时间，因此不是一个每次都有固定答案的转换。时间格式定义要显示年、月、日或 UNIX 数值，时区决定墙上时钟的显示。",
          "同一时刻在北京显示为 UTC+8，在 UTC 显示为另一钟点。此入口不能替代权威授时校准，设备时钟错误会反映到结果。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "同一时刻的时区显示",
            "input": "假设执行瞬间为 2026-10-13T00:00:00Z",
            "output": "UTC：00:00；Asia/Shanghai：08:00",
            "explanation": "时差 8 小时；日期跨界时还要同步改变日期。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20ObjectID%20timestamp",
    "capabilityIds": [
      "op:Parse%20ObjectID%20timestamp"
    ],
    "relatedIds": [
      "op:Parse%20ObjectID%20timestamp"
    ],
    "topicGroup": "coordinates-time",
    "title": "解析 ObjectID 时间戳",
    "summary": "读取 ObjectId 前四字节的 UNIX 秒值。",
    "aliases": [
      "ObjectId",
      "BSON",
      "Parse ObjectID timestamp"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "BSON ObjectId 的字段结构",
        "publisher": "MongoDB 官方中文文档",
        "url": "https://www.mongodb.com/zh-cn/docs/manual/reference/bson-types/#objectid",
        "locator": "ObjectId",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Parse ObjectID timestamp",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Parse ObjectID timestamp\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "MongoDB ObjectId 为 12 字节，常写成 24 个十六进制字符。前 4 字节是以 UNIX 秒计的时间戳，后面还有随机部分与计数器。",
          "应先核对长度和十六进制字符，再按大端数值读取前八个字符。它通常反映生成 ID 时的时间，不能证明数据库记录最后修改时间，也可能被人为构造。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "前四字节核对",
            "input": "507f1f77bcf86cd799439011",
            "output": "0x507f1f77=1350508407；2012-10-17T21:13:27Z",
            "explanation": "507f1f77 是时间部分；后 16 个字符不参加这一步的秒数计算。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20DateTime",
    "capabilityIds": [
      "op:Parse%20DateTime"
    ],
    "relatedIds": [
      "op:Parse%20DateTime"
    ],
    "topicGroup": "coordinates-time",
    "title": "解析日期时间",
    "summary": "格式标记说明每一段数字的意义。",
    "aliases": [
      "Parse DateTime"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "日期格式的大小写标记",
        "publisher": "Day.js 官方中文文档",
        "url": "https://day.js.org/docs/zh-CN/display/format",
        "locator": "YYYY / MM / DD / HH / mm / ss / Z",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "日期解析、格式标记与时长运算",
        "publisher": "Moment.js 官方文档",
        "url": "https://momentjs.com/docs/",
        "locator": "Parsing / Displaying / Manipulating",
        "language": "en",
        "kind": "official-doc"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · Parse DateTime",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Parse DateTime\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "YYYY 是四位年、MM 是月、DD 是日、HH 是 24 小时制小时、mm 是分钟。大小写不同，不能把月份与分钟交换。",
          "先使用与输入一致的格式解析，再按照指定时区解释时间。像 03/04/2026 这样的写法可能表示 3 月 4 日或 4 月 3 日，自动猜测不能替代明确约定。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "消除月日歧义",
            "input": "03/04/2026 12:30；格式 DD/MM/YYYY HH:mm",
            "output": "2026 年 4 月 3 日 12:30",
            "explanation": "DD 对应 03，MM 对应 04；若格式换成 MM/DD/YYYY，则日期含义改变。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:DateTime%20Delta",
    "capabilityIds": [
      "op:DateTime%20Delta"
    ],
    "relatedIds": [
      "op:DateTime%20Delta"
    ],
    "topicGroup": "coordinates-time",
    "title": "日期时间加减",
    "summary": "把解析后的日期时间加上或减去时长。",
    "aliases": [
      "DateTime Delta"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "日期加法",
        "publisher": "Day.js 官方中文文档",
        "url": "https://day.js.org/docs/zh-CN/manipulate/add",
        "locator": "Add",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "日期解析、格式标记与时长运算",
        "publisher": "Moment.js 官方文档",
        "url": "https://momentjs.com/docs/",
        "locator": "Parsing / Displaying / Manipulating",
        "language": "en",
        "kind": "official-doc"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · DateTime Delta",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"DateTime Delta\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "先按输入格式解析时间，再分别应用天、小时、分钟和秒的差量。跨过一天边界时日期会变化，不是把小时字段简单变成 24 或负数。",
          "时区存在夏令时变化时，“一日历天”与“24 小时”可能不同；下例使用 UTC，避免混淆。本工具所选加减参数决定运算方向。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "跨午夜加小时",
            "input": "UTC：2026-10-13 23:30；加 2 小时",
            "output": "2026-10-14 01:30 UTC",
            "explanation": "23:30 后一小时到次日 00:30，再一小时到 01:30。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Translate%20DateTime%20Format",
    "capabilityIds": [
      "op:Translate%20DateTime%20Format"
    ],
    "relatedIds": [
      "op:Translate%20DateTime%20Format"
    ],
    "topicGroup": "coordinates-time",
    "title": "转换日期时间格式",
    "summary": "把已解析的时间点格式化成另一种文本。",
    "aliases": [
      "Translate DateTime Format"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "日期格式的大小写标记",
        "publisher": "Day.js 官方中文文档",
        "url": "https://day.js.org/docs/zh-CN/display/format",
        "locator": "YYYY / MM / DD / HH / mm / ss / Z",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "日期解析、格式标记与时长运算",
        "publisher": "Moment.js 官方文档",
        "url": "https://momentjs.com/docs/",
        "locator": "Parsing / Displaying / Manipulating",
        "language": "en",
        "kind": "official-doc"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · Translate DateTime Format",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Translate DateTime Format\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "输入格式用于读懂文本，输出格式用于把日期重新写出。例如 YYYY-MM-DD 与 DD/MM/YYYY 可以表达同一天。",
          "时区转换改变显示钟点，格式转换本身只改变写法。应先明确输入时区再选输出时区，不要把不带时区的钟点当作全球唯一时间点。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "换写法并换显示时区",
            "input": "2026-10-13T00:00:00Z；输出 DD/MM/YYYY HH:mm；Asia/Shanghai",
            "output": "13/10/2026 08:00",
            "explanation": "先锁定 UTC 时刻，再加 8 小时显示，最后按日/月/年写出。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Convert%20co-ordinate%20format",
    "capabilityIds": [
      "op:Convert%20co-ordinate%20format"
    ],
    "relatedIds": [
      "op:Convert%20co-ordinate%20format"
    ],
    "topicGroup": "coordinates-time",
    "title": "坐标格式转换",
    "summary": "同一位置可以写成度分秒或十进制度。",
    "aliases": [
      "Convert co-ordinate format"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Convert co-ordinate format",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Convert co-ordinate format\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      },
      {
        "id": "s2",
        "title": "本站经纬度、UTM、时间转换公式",
        "publisher": "迷雾工具箱随站实现",
        "url": "/round2/coordinates-engine.js",
        "locator": "coordinate / convertPoint / timeValue / formatTime",
        "language": "zh-CN",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "度分秒转换成十进制度时，分除以 60、秒除以 3600。方向字母表示正负：N/E 正，S/W 负；经纬两个量要分别换算。",
          "本站此操作支持 DD、DMS、DDM、Geohash、MGRS、OSNG、UTM 等格式。自动识别可能失败；网格坐标还需要它所属的基准与区带，不能把不同坐标系的同名数值直接等同。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "纬度写法转换",
            "input": "12°30′0″S",
            "output": "−12.5°",
            "explanation": "12+30/60=12.5，再因 S 取负；0.5 度是 30 分，不是 50 分。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:UNIX%20Timestamp%20to%20Windows%20Filetime",
    "capabilityIds": [
      "pair:UNIX%20Timestamp%20to%20Windows%20Filetime"
    ],
    "relatedIds": [
      "pair:UNIX%20Timestamp%20to%20Windows%20Filetime"
    ],
    "topicGroup": "coordinates-time",
    "title": "UNIX / Windows 时间戳",
    "summary": "FILETIME 用 1601 年纪元与 100 纳秒单位。",
    "aliases": [
      "FILETIME",
      "1601",
      "100纳秒",
      "UNIX Timestamp to Windows Filetime",
      "Windows Filetime to UNIX Timestamp"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "Windows 文件时间",
        "publisher": "Microsoft 官方中文文档",
        "url": "https://learn.microsoft.com/zh-cn/windows/win32/sysinfo/file-times",
        "locator": "64 位 FILETIME 与 100 纳秒间隔",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · UNIX Timestamp to Windows Filetime",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"UNIX Timestamp to Windows Filetime\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Windows FILETIME 记录从 1601-01-01 UTC 经过的 100 纳秒间隔数；UNIX 秒从 1970-01-01 UTC 起算。两种数值都能指向同一时间点，但起点与单位不同。",
          "换算 UNIX 秒 t 到 FILETIME 时用 (t+11644473600)×10000000；逆向先除以 10000000，再减去纪元秒差。数值很大时应保留整数精度，避免普通浮点数损坏低位。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "两方向的纪元核对",
            "input": "UNIX 秒=0",
            "output": "FILETIME=116444736000000000；逆换得到 0",
            "explanation": "(0+11644473600)×10000000=116444736000000000；按反式计算可回到 1970-01-01 UTC。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20URI",
    "capabilityIds": [
      "op:Parse%20URI"
    ],
    "relatedIds": [
      "op:Parse%20URI"
    ],
    "topicGroup": "network",
    "title": "解析 URI",
    "summary": "URI 由方案、权威部分、路径、查询与片段组成。",
    "aliases": [
      "Parse URI"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 3986 · URI 通用语法（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc3986.html",
        "locator": "§3 Components",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Parse URI",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Parse URI\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "例如 https://example.com:8443/a?x=1#part 中，https 是方案，example.com:8443 是权威部分，/a 是路径，x=1 是查询，part 是片段。",
          "查询参数的意义由具体应用决定，不是所有 ? 后内容都必然是一组 key=value。解析 URI 是结构分解，不会因此访问网址或证明网址安全。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "逐段分解",
            "input": "https://example.com:8443/a?x=1#part",
            "output": "scheme=https；host=example.com；port=8443；path=/a；query=x=1；fragment=part",
            "explanation": "冒号、问号、井号属于不同结构分隔；片段通常由客户端解释。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Change%20IP%20format",
    "capabilityIds": [
      "op:Change%20IP%20format"
    ],
    "relatedIds": [
      "op:Change%20IP%20format"
    ],
    "topicGroup": "network",
    "title": "转换 IP 地址格式",
    "summary": "IPv4 的四个八位组组成一个 32 位数。",
    "aliases": [
      "Change IP format"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "IPv4 地址与报文结构",
        "publisher": "华为官方文档",
        "url": "https://info.support.huawei.com/info-finder/encyclopedia/zh/IPv4.html",
        "locator": "报头、地址与分片",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Change IP format",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Change IP format\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "IPv4 的点分十进制 a.b.c.d 对应 a×2²⁴+b×2¹⁶+c×2⁸+d。每段应在 0～255，不是简单把十进制文字拼起来。",
          "十六进制表示每段两位，总共八位。例如192的十六进制是 C0。这只是同一地址的数值写法转换，不会更改网络地址或完成 DNS 查询。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "四段拼成 32 位",
            "input": "192.0.2.1",
            "output": "Hex=c0000201；十进制=3221225985",
            "explanation": "192×16777216+0×65536+2×256+1=3221225985。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Format%20MAC%20addresses",
    "capabilityIds": [
      "op:Format%20MAC%20addresses"
    ],
    "relatedIds": [
      "op:Format%20MAC%20addresses"
    ],
    "topicGroup": "network",
    "title": "格式化 MAC 地址",
    "summary": "相同 48 位 MAC 可有不同书写格式。",
    "aliases": [
      "Format MAC addresses"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 7042 · IANA 与 IEEE 802 参数（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7042.html",
        "locator": "§2 48-bit MAC identifiers",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Format MAC addresses",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Format MAC addresses\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "常见 MAC 地址为 6 个八位组，通常写成 12 个十六进制数字。冒号、短横线和三组四位的点分写法只是分组方式。",
          "本站格式化操作不做完整有效性校验，因此排版成功不能证明它是现实网卡地址。MAC 与 IPv4 的 32 位地址也不是同一个编号体系。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "同一组 6 字节",
            "input": "001122aabbcc",
            "output": "00:11:22:AA:BB:CC 或 00-11-22-AA-BB-CC",
            "explanation": "两种写法移除分隔符后都是 001122aabbcc，大小写也不改变十六进制数值。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Group%20IP%20addresses",
    "capabilityIds": [
      "op:Group%20IP%20addresses"
    ],
    "relatedIds": [
      "op:Group%20IP%20addresses"
    ],
    "topicGroup": "network",
    "title": "归并 IP 地址",
    "summary": "CIDR 前缀选择网络部分。",
    "aliases": [
      "Group IP addresses"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CIDR、前缀与地址范围",
        "publisher": "阿里云官方文档",
        "url": "https://help.aliyun.com/zh/ecs/user-guide/overview-32",
        "locator": "CIDR 格式换算为 IP 地址网段",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Group IP addresses",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Group IP addresses\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "IPv4 的 /p 表示高 p 位作为网络前缀，其余 32−p 位为地址块内的变化部分。把地址与前缀掩码相与可求所属网段。",
          "此入口按所选前缀长度把地址列表分组。它不是去探测这些地址是否在线，也不自动证明两台设备处在同一真实二层网络。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "按 /24 归组",
            "input": "192.0.2.1、192.0.2.130、192.0.3.1；前缀 24",
            "output": "前两项属于 192.0.2.0/24；后一项属于 192.0.3.0/24",
            "explanation": "/24 的掩码是 255.255.255.0，低八位不参加网络前缀比较。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20IP%20range",
    "capabilityIds": [
      "op:Parse%20IP%20range"
    ],
    "relatedIds": [
      "op:Parse%20IP%20range"
    ],
    "topicGroup": "network",
    "title": "解析 IP 地址范围",
    "summary": "地址总数由剩余的主机位决定。",
    "aliases": [
      "Parse IP range"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CIDR、前缀与地址范围",
        "publisher": "阿里云官方文档",
        "url": "https://help.aliyun.com/zh/ecs/user-guide/overview-32",
        "locator": "CIDR 格式换算为 IP 地址网段",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Parse IP range",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Parse IP range\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "IPv4 /p 地址块有 2^(32−p) 个数值地址。例如 /30 有 4 个，不是因为斜杠后是 30 就包含 30 个。",
          "本站还接受起止范围及列表，并可枚举 IPv4；IPv6 可分析但不枚举所有地址。地址数量与传统子网中可分配给主机的数量不是同一概念。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "一个小范围",
            "input": "192.0.2.0/30",
            "output": "192.0.2.0、192.0.2.1、192.0.2.2、192.0.2.3",
            "explanation": "32−30=2，2²=4 个地址；网络/广播等用途另由网络规则决定。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20IPv6%20address",
    "capabilityIds": [
      "op:Parse%20IPv6%20address"
    ],
    "relatedIds": [
      "op:Parse%20IPv6%20address"
    ],
    "topicGroup": "network",
    "title": "解析 IPv6 地址",
    "summary": "128 位地址可按八组十六进制简写。",
    "aliases": [
      "Parse IPv6 address"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "IPv6 地址的书写与压缩",
        "publisher": "华为官方文档",
        "url": "https://info.support.huawei.com/info-finder/encyclopedia/zh/IPv6.html",
        "locator": "128 位地址、零压缩",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "RFC 4291 · IPv6 地址体系（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4291.txt",
        "locator": "§2.2 Text Representation",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · Parse IPv6 address",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Parse IPv6 address\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "完整 IPv6 地址有 8 组 16 位字段，每组常写 4 个十六进制数字。组内前导零可省略，一段连续零组可用 :: 压缩。",
          "一条地址只能有一个 ::，否则恢复时无法知道各处省略几组。展开时总组数必须补足到八组，不能把冒号当十进制小数点。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "展开零压缩",
            "input": "2001:db8::1",
            "output": "2001:0db8:0000:0000:0000:0000:0000:0001",
            "explanation": "已明确三组：2001、db8、1，因此中间补五个 0000 组。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:IPv6%20Transition%20Addresses",
    "capabilityIds": [
      "op:IPv6%20Transition%20Addresses"
    ],
    "relatedIds": [
      "op:IPv6%20Transition%20Addresses"
    ],
    "topicGroup": "network",
    "title": "解析 IPv6 过渡地址",
    "summary": "过渡机制使用不同前缀与字段布局。",
    "aliases": [
      "IPv6 Transition Addresses"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 4291 · IPv6 地址体系（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4291.txt",
        "locator": "§2.2 Text Representation",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "RFC 3056 · 6to4 过渡机制（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc3056.html",
        "locator": "§2",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · IPv6 Transition Addresses",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"IPv6 Transition Addresses\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "IPv4 映射地址可写成 ::ffff:a.b.c.d，例如 ::ffff:192.0.2.1。这里后 32 位保存 IPv4 地址，不等同于为主机开通了一条 IPv6 路由。",
          "6to4、Teredo 与 EUI-64 各有不同布局；不能把一种格式套到另一种。本操作也处理相关地址写法，输出须结合具体前缀判断机制。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "映射地址的尾部",
            "input": "IPv4=192.0.2.1",
            "output": "IPv4-mapped IPv6=::ffff:c000:201",
            "explanation": "192.0.2.1 的四字节是 c0 00 02 01，组合成最后两组 c000:0201。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20TCP",
    "capabilityIds": [
      "op:Parse%20TCP"
    ],
    "relatedIds": [
      "op:Parse%20TCP"
    ],
    "topicGroup": "network",
    "title": "解析 TCP",
    "summary": "Data Offset 决定 TCP 首部长度。",
    "aliases": [
      "Parse TCP"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 9293 · TCP（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9293.html",
        "locator": "§3.1 Header Format",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Parse TCP",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Parse TCP\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "TCP 首部保存源/目的端口、序号、确认号、标志与窗口等。Data Offset 字段以 4 字节为单位指出数据开始位置。",
          "基础 TCP 首部最少 20 字节；带选项时更长。应输入 TCP 段本身，不能把以太网或 IPv4 首部一起误当作 TCP 端口。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "首部长度字段",
            "input": "Data Offset=5",
            "output": "TCP 首部=5×4=20 字节",
            "explanation": "若首部字段变成 8，则首部长 32 字节，不能仍从第 20 字节提取载荷。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Strip%20TCP%20header",
    "capabilityIds": [
      "op:Strip%20TCP%20header"
    ],
    "relatedIds": [
      "op:Strip%20TCP%20header"
    ],
    "topicGroup": "network",
    "title": "移除 TCP 头部",
    "summary": "Data Offset 决定 TCP 首部长度。",
    "aliases": [
      "Strip TCP header"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 9293 · TCP（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9293.html",
        "locator": "§3.1 Header Format",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Strip TCP header",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Strip TCP header\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "移除 TCP 首部要先读 Data Offset，计算首部长度=字段值×4 字节，然后保留它后面的载荷。",
          "必须先定位 TCP 段起点；字段不足或长度超过输入时不能安全地当作完整段。移除 TCP 首部不会重新组装跨多个段的应用消息。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "首部后面的载荷",
            "input": "TCP 段 24 字节；Data Offset=5；末四字节为 54 45 53 54",
            "output": "保留 54 45 53 54，即 TEST",
            "explanation": "首部 20 字节，24−20=4 个载荷字节。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20UDP",
    "capabilityIds": [
      "op:Parse%20UDP"
    ],
    "relatedIds": [
      "op:Parse%20UDP"
    ],
    "topicGroup": "network",
    "title": "解析 UDP",
    "summary": "按固定八字节首部定位 UDP 载荷。",
    "aliases": [
      "Parse UDP"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 768 · UDP（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc768.html",
        "locator": "Format / Fields",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Parse UDP",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Parse UDP\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "UDP 首部固定为 8 字节，依次是源端口、目的端口、长度、校验和，每个字段 2 字节。长度包含首部和数据。",
          "解析长度和端口时按网络字节序，即大端读取。UDP 数据报结构可被解析，并不代表其传输可靠或校验通过。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "8 字节 UDP 首部",
            "input": "04 d2 00 35 00 0c 00 00 54 45 53 54",
            "output": "源端口=1234；目的端口=53；总长度=12；载荷=TEST",
            "explanation": "0x04d2=1234，0x0035=53，0x000c=12；12−8=4 字节载荷。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Strip%20UDP%20header",
    "capabilityIds": [
      "op:Strip%20UDP%20header"
    ],
    "relatedIds": [
      "op:Strip%20UDP%20header"
    ],
    "topicGroup": "network",
    "title": "移除 UDP 头部",
    "summary": "按固定八字节首部定位 UDP 载荷。",
    "aliases": [
      "Strip UDP header"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 768 · UDP（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc768.html",
        "locator": "Format / Fields",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Strip UDP header",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Strip UDP header\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "UDP 的固定 8 字节首部位于数据报开头，移除后留下应用数据。长度字段还可用于检查数据是否完整。",
          "不能对 IPv4 包直接盲目移除前 8 字节，那会删除 IP 首部的一部分。先剥掉外层封装，再把真正的 UDP 数据报交给这个操作。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "去除 UDP 首部",
            "input": "04 d2 00 35 00 0c 00 00 54 45 53 54",
            "output": "54 45 53 54，即 TEST",
            "explanation": "前 8 字节是 UDP 首部，后 4 字节是载荷。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20IPv4%20header",
    "capabilityIds": [
      "op:Parse%20IPv4%20header"
    ],
    "relatedIds": [
      "op:Parse%20IPv4%20header"
    ],
    "topicGroup": "network",
    "title": "解析 IPv4 头部",
    "summary": "IHL 描述首部长度，不是载荷长度。",
    "aliases": [
      "Parse IPv4 header"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 791 · Internet Protocol（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc791.html",
        "locator": "§3.1 Internet Header Format",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "IPv4 地址与报文结构",
        "publisher": "华为官方文档",
        "url": "https://info.support.huawei.com/info-finder/encyclopedia/zh/IPv4.html",
        "locator": "报头、地址与分片",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · Parse IPv4 header",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Parse IPv4 header\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "IPv4 首部第一字节高四位是版本，低四位是 IHL。IHL 的单位是 4 字节，基本首部 IHL=5，即 20 字节。",
          "总长度包含 IP 首部和载荷；协议字段指向 TCP（6）、UDP（17）等。选项会加长首部，分片字段还影响应用数据能否完整读取。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "首字节拆位",
            "input": "首字节 45；总长度 0028；协议 06",
            "output": "版本=4；IHL=5；首部=20 字节；IP 总长=40 字节；上层为 TCP",
            "explanation": "0x45 拆成两个半字节 4 与 5；0x0028=40。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Strip%20IPv4%20header",
    "capabilityIds": [
      "op:Strip%20IPv4%20header"
    ],
    "relatedIds": [
      "op:Strip%20IPv4%20header"
    ],
    "topicGroup": "network",
    "title": "移除 IPv4 头部",
    "summary": "IHL 描述首部长度，不是载荷长度。",
    "aliases": [
      "Strip IPv4 header"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 791 · Internet Protocol（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc791.html",
        "locator": "§3.1 Internet Header Format",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "IPv4 地址与报文结构",
        "publisher": "华为官方文档",
        "url": "https://info.support.huawei.com/info-finder/encyclopedia/zh/IPv4.html",
        "locator": "报头、地址与分片",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · Strip IPv4 header",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Strip IPv4 header\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "移除 IPv4 首部先读取 IHL，按 IHL×4 字节跳过首部。剩下的是 IP 载荷，可能是 TCP 段或 UDP 数据报。",
          "不能永远固定删除 20 字节：带选项时 IHL 大于 5。IP 分片也可能只保存载荷的一段，去首部不会自动把所有分片重新拼成完整消息。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "带选项的首部",
            "input": "IPv4 包长 32 字节；首字节 46",
            "output": "首部 6×4=24 字节；剩余载荷 8 字节",
            "explanation": "若错误地只去掉 20 字节，会把最后 4 字节 IP 选项混进载荷。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20Ethernet%20frame",
    "capabilityIds": [
      "op:Parse%20Ethernet%20frame"
    ],
    "relatedIds": [
      "op:Parse%20Ethernet%20frame"
    ],
    "topicGroup": "network",
    "title": "解析以太网帧",
    "summary": "以太网按目的 MAC、源 MAC 和类型组织首部。",
    "aliases": [
      "Parse Ethernet frame"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 7042 · IEEE 802 参数（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc7042.html",
        "locator": "EtherType values",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "VLAN 的以太网帧字段",
        "publisher": "华为官方文档",
        "url": "https://info.support.huawei.com/info-finder/encyclopedia/zh/VLAN.html",
        "locator": "VLAN Tag 和 VLAN ID；以太网帧增加 4 字节标签",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · Parse Ethernet frame",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Parse Ethernet frame\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "普通 Ethernet II 帧开头有 6 字节目的 MAC、6 字节源 MAC 和 2 字节 EtherType，之后是对应上层协议数据。0x0800 指向 IPv4。",
          "VLAN 标签会在首部加入额外字段，所以不能在所有情况下都固定从第 14 字节开始解析 IP。本操作可读 VLAN，并选择输出帧资料或载荷。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "普通 Ethernet II 首部",
            "input": "目的=001122334455；源=66778899aabb；类型=0800",
            "output": "未含 VLAN 时首部共 14 字节；上层为 IPv4",
            "explanation": "6+6+2=14；类型字段不是 IP 地址，也不是两个字节的负载长度。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20TLS%20record",
    "capabilityIds": [
      "op:Parse%20TLS%20record"
    ],
    "relatedIds": [
      "op:Parse%20TLS%20record"
    ],
    "topicGroup": "network",
    "title": "解析 TLS 记录",
    "summary": "TLS 记录有类型、版本和长度字段。",
    "aliases": [
      "Parse TLS record"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 8446 · TLS 1.3（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc8446.html",
        "locator": "§5 Record Protocol",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Parse TLS record",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Parse TLS record\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "TLS 记录头通常为 5 字节：1 字节内容类型、2 字节传统版本字段、2 字节后续数据长度。接收端按长度找到记录边界。",
          "解析记录头不等于解密记录体。TLS 1.3 兼容字段可能保留旧版本值，真正版本判断还需握手协商字段，不能仅凭记录头 03 03 就断言只支持 TLS 1.2。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "记录长度核对",
            "input": "17 03 03 00 04 后跟四字节记录体",
            "output": "内容类型 0x17；记录体长度 4；含头共 9 字节",
            "explanation": "5 字节头+4 字节体=9；解析只能显示这些边界，不会凭空获得加密明文。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20User%20Agent",
    "capabilityIds": [
      "op:Parse%20User%20Agent"
    ],
    "relatedIds": [
      "op:Parse%20User%20Agent"
    ],
    "topicGroup": "network",
    "title": "解析用户代理",
    "summary": "User-Agent 是应用声明的身份描述文本。",
    "aliases": [
      "Parse User Agent"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "User-Agent 请求头",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/User-Agent",
        "locator": "Syntax / browser compatibility",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Parse User Agent",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Parse User Agent\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "User-Agent 常包含产品名、版本及注释，例如 Mozilla/5.0 中的名字是兼容性标记，不能直接断言用户正在使用同名浏览器。",
          "解析器按模式识别操作系统、设备和浏览器候选；客户端可以自行改变这一字符串。它不是密码学证明，也不是可唯一追踪一个人的稳定编号。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "读产品与注释",
            "input": "ExampleBrowser/1.0 (ExampleOS) Engine/2.0",
            "output": "产品 ExampleBrowser，版本 1.0；注释 ExampleOS；附加产品 Engine/2.0",
            "explanation": "斜杠分隔产品与版本；括号是注释，具体识别结果还由模式库决定。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:DNS%20over%20HTTPS",
    "capabilityIds": [
      "op:DNS%20over%20HTTPS"
    ],
    "relatedIds": [
      "op:DNS%20over%20HTTPS"
    ],
    "topicGroup": "network",
    "title": "通过 HTTPS 查询 DNS",
    "summary": "DoH 将 DNS 查询封装在 HTTPS 请求中。",
    "aliases": [
      "DNS over HTTPS"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 8484 · DNS Queries over HTTPS（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc8484.html",
        "locator": "§4 HTTP Exchange",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "DoH 接入与加密地址",
        "publisher": "阿里云官方文档",
        "url": "https://www.alibabacloud.com/help/zh/dns/httpdns-access-configuration",
        "locator": "DoT/DoH 接入",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · DNS over HTTPS",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"DNS over HTTPS\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "DNS 把域名和记录类型交给解析器查询，A 记录表示 IPv4 地址，AAAA 表示 IPv6 地址。DoH 使用 HTTPS 运输这类查询。",
          "它是一项真实的联网请求：选择的解析服务会收到查询内容。加密运输不能使查询数据本身免受服务商观察，也不能把 NXDOMAIN 误认为工具没有运行。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "记录类型核对",
            "input": "查询 example.com 的 A 与 AAAA",
            "output": "A 返回 IPv4 地址记录；AAAA 返回 IPv6 地址记录",
            "explanation": "两种类型不同，即使同一个域名也可能一类有记录、一类没有。具体实时结果由 DNS 决定。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:HTTP%20request",
    "capabilityIds": [
      "op:HTTP%20request"
    ],
    "relatedIds": [
      "op:HTTP%20request"
    ],
    "topicGroup": "network",
    "title": "HTTP 请求",
    "summary": "浏览器通过 HTTP 方法向网址发起请求。",
    "aliases": [
      "HTTP request"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "使用 Fetch 与 CORS 响应",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch",
        "locator": "Request method / mode / opaque responses",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · HTTP request",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"HTTP request\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "方法描述请求意图：GET 常用于取得表示，POST 常用于提交处理，响应状态码表示处理结果。头部传递内容类型等元信息，正文承载实际内容。",
          "本站由浏览器直接发送请求，跨域读取受 CORS 约束。No CORS 可能得到不透明响应，不能把它当成绕过对方服务器策略的完整响应读取。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "请求与正文分开",
            "input": "GET https://example.com/；响应假设为 HTTP/1.1 200 OK，Content-Type: text/plain，正文 OK",
            "output": "状态 200；类型 text/plain；内容 OK",
            "explanation": "请求方法不属于响应正文；CORS 暴露哪些响应头由目标服务器决定。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Strip%20HTTP%20headers",
    "capabilityIds": [
      "op:Strip%20HTTP%20headers"
    ],
    "relatedIds": [
      "op:Strip%20HTTP%20headers"
    ],
    "topicGroup": "network",
    "title": "移除 HTTP 头部",
    "summary": "HTTP/1 消息中空行标记头部结束。",
    "aliases": [
      "Strip HTTP headers"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 9112 · HTTP/1.1（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9112.html",
        "locator": "§2 Message；§7.1 Chunked Transfer Coding",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Strip HTTP headers",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Strip HTTP headers\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "HTTP/1 消息由开始行、若干头部字段、空行和可选正文组成。常见字节分界为 CRLF CRLF，即 0d 0a 0d 0a。",
          "移除头部只保留后面的正文部分，不自动解码 gzip 或分块传输。二进制正文应保留字节，不能先任意按文本改写换行再认为完全无损。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "头部与正文分界",
            "input": "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nTEST",
            "output": "TEST",
            "explanation": "第一处空行之前为开始行和头部，之后为正文。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Dechunk%20HTTP%20response",
    "capabilityIds": [
      "op:Dechunk%20HTTP%20response"
    ],
    "relatedIds": [
      "op:Dechunk%20HTTP%20response"
    ],
    "topicGroup": "network",
    "title": "解码 HTTP 分块响应",
    "summary": "每块前的十六进制长度决定读取字节数。",
    "aliases": [
      "Dechunk HTTP response"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "RFC 9112 · HTTP/1.1（南京大学镜像）",
        "publisher": "IETF / 南京大学开源镜像站",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc9112.html",
        "locator": "§2 Message；§7.1 Chunked Transfer Coding",
        "language": "en",
        "kind": "standard"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Dechunk HTTP response",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Dechunk HTTP response\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "HTTP/1 分块传输按“十六进制长度行、块数据、换行”发送正文；长度为 0 的块表示结束，之后还可能有尾部字段。",
          "解析时按声明字节数读取每个块，再拼接块数据，不能只删除所有看似数字的行。分块解码也不会自动解压 Content-Encoding。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "两个数据块",
            "input": "4\r\nTEST\r\n2\r\nOK\r\n0\r\n\r\n",
            "output": "TESTOK",
            "explanation": "0x4=4 字节 TEST，0x2=2 字节 OK；0x0 为结束。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Defang%20IP%20Addresses",
    "capabilityIds": [
      "op:Defang%20IP%20Addresses"
    ],
    "relatedIds": [
      "op:Defang%20IP%20Addresses"
    ],
    "topicGroup": "network",
    "title": "解除 IP 地址可点击性",
    "summary": "改变写法以减少误触和自动链接。",
    "aliases": [
      "Defang IP Addresses"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "Defang all the things：指标去可点击化",
        "publisher": "SANS Internet Storm Center",
        "url": "https://isc.sans.edu/diary/Defang%2Ball%2Bthe%2Bthings/22744",
        "locator": "域名、网址的 defang 写法",
        "language": "en",
        "kind": "author-spec"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · Defang IP Addresses",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Defang IP Addresses\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Defang 把地址中的点或冒号加上标记，使普通解析器不再把它直接当作有效地址。例如把 IPv4 的 . 写成 [.]。",
          "这种操作保留人工识别线索，但不是加密或删除地址。看见 [.] 时需要知道它是表现层变体，不能原样当作点分十进制输入。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "去可点击化",
            "input": "192.0.2.1",
            "output": "192[.]0[.]2[.]1",
            "explanation": "四个八位组未改变，只改变了分隔符表现。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Defang%20URL",
    "capabilityIds": [
      "op:Defang%20URL"
    ],
    "relatedIds": [
      "op:Defang%20URL"
    ],
    "topicGroup": "network",
    "title": "解除网址可点击性",
    "summary": "对网址方案和分隔符作可读替换。",
    "aliases": [
      "Defang URL"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Defang URL",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Defang URL\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "网址去可点击化常把 http 改为 hxxp、域名点改为 [.]，也可转义 ://。这样可以减少文档自动生成可点击链接。",
          "本站提供多种替换参数，选择哪些部分改变会影响结果。它不会访问网址，也不会检测网址的真实安全性。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "两种转义参数",
            "input": "https://example.com/a；仅开启点与 http 转义，关闭 :// 转义",
            "output": "hxxps://example[.]com/a",
            "explanation": "https→hxxps，域名点→[.]；路径内容保持原写法。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Fang%20URL",
    "capabilityIds": [
      "op:Fang%20URL"
    ],
    "relatedIds": [
      "op:Fang%20URL"
    ],
    "topicGroup": "network",
    "title": "恢复网址可点击性",
    "summary": "按选项撤销去可点击化的替换。",
    "aliases": [
      "Fang URL"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Fang URL",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Fang URL\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Fang 把 hxxp/hxxps 恢复为 http/https，把 [.] 恢复为 .，并可恢复经过转义的 ://。它处理的是文本形式。",
          "恢复后可能形成真正可访问的网址；这种文本还原不会验证域名归属或页面内容。先核对原线索约定，再决定哪些替换确实要撤销。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "还原网址写法",
            "input": "hxxps://example[.]com/a",
            "output": "https://example.com/a",
            "explanation": "还原方案与点号；这个结果只是规范网址文本。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JA3%20Fingerprint",
    "capabilityIds": [
      "op:JA3%20Fingerprint"
    ],
    "relatedIds": [
      "op:JA3%20Fingerprint"
    ],
    "topicGroup": "network",
    "title": "JA3 指纹",
    "summary": "把 ClientHello 的参数组合成固定顺序字符串。",
    "aliases": [
      "JA3 Fingerprint"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "JA3 与 JA3S 原始方法说明",
        "publisher": "Salesforce 原始作者",
        "url": "https://github.com/salesforce/ja3",
        "locator": "How JA3 works / JA3S",
        "language": "en",
        "kind": "author-spec"
      },
      {
        "id": "s2",
        "title": "TLS 客户端 JA3、JA4 字段",
        "publisher": "阿里云官方中文文档",
        "url": "https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/rules-match-fields-available-for-bots",
        "locator": "JA3/JA4 fingerprint",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · JA3 Fingerprint",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"JA3 Fingerprint\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "JA3 按顺序收集版本、密码套件列表、扩展列表、支持的曲线及点格式。字段之间用逗号，列表项之间用短横线，忽略 GREASE 值，再计算 MD5。",
          "它描述客户端握手配置，不是给证书做哈希，也不直接解密流量。不同程序可能共享配置，顺序变化也可能改变指纹；本站输入需是相应 ClientHello 数据而不是一条网址。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "哈希前字符串核对",
            "input": "版本=771；套件=4865,4866；扩展=0,10,11；曲线=29；点格式=0",
            "output": "771,4865-4866,0-10-11,29,0 → 25a116fec34559b24a512bcd37ea22e3",
            "explanation": "左侧是按规则得到的 JA3 字符串，右侧是对这段 ASCII 字节独立计算的 MD5。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JA3S%20Fingerprint",
    "capabilityIds": [
      "op:JA3S%20Fingerprint"
    ],
    "relatedIds": [
      "op:JA3S%20Fingerprint"
    ],
    "topicGroup": "network",
    "title": "JA3S 指纹",
    "summary": "读取 ServerHello 的协商选择。",
    "aliases": [
      "JA3S Fingerprint"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "JA3 与 JA3S 原始方法说明",
        "publisher": "Salesforce 原始作者",
        "url": "https://github.com/salesforce/ja3",
        "locator": "How JA3 works / JA3S",
        "language": "en",
        "kind": "author-spec"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · JA3S Fingerprint",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"JA3S Fingerprint\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "JA3S 从服务端 ServerHello 收集版本、选中的密码套件和扩展列表，形成三字段字符串再做 MD5。它不使用客户端的完整套件候选列表。",
          "同一服务端可能针对不同客户端给出不同协商参数，所以这个指纹还反映具体会话协商。它不是服务端 IP 或域名的哈希。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "三字段哈希",
            "input": "版本=771；套件=4865；扩展=43,51",
            "output": "771,4865,43-51 → f4febc55ea12b31ae17cfb7e614afda8",
            "explanation": "字段以逗号分隔，扩展列表用短横线；MD5 输入就是左侧 ASCII 字符串。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JA4%20Fingerprint",
    "capabilityIds": [
      "op:JA4%20Fingerprint"
    ],
    "relatedIds": [
      "op:JA4%20Fingerprint"
    ],
    "topicGroup": "network",
    "title": "JA4 指纹",
    "summary": "结构摘要加上两段经规范化列表的短哈希。",
    "aliases": [
      "JA4 Fingerprint"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "JA4 客户端指纹原始规范",
        "publisher": "FoxIO",
        "url": "https://github.com/FoxIO-LLC/ja4/blob/main/technical_details/JA4.md",
        "locator": "JA4 Algorithm / Cipher hash / Extension hash",
        "language": "en",
        "kind": "author-spec"
      },
      {
        "id": "s2",
        "title": "TLS 客户端 JA3、JA4 字段",
        "publisher": "阿里云官方中文文档",
        "url": "https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/rules-match-fields-available-for-bots",
        "locator": "JA3/JA4 fingerprint",
        "language": "zh-CN",
        "kind": "official-doc"
      },
      {
        "id": "s3",
        "title": "CyberChef 官方操作定义 · JA4 Fingerprint",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"JA4 Fingerprint\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "JA4 的首段编码传输协议、协商版本、是否有 SNI、套件/扩展数量及 ALPN 概况。后两段来自规范化套件和扩展/签名算法列表的 SHA-256，并截取前 12 个十六进制字符。",
          "套件与相关扩展按规范排序并排除 GREASE；ALPN/SNI 等已在首段表达的字段还有特定处理。它不是把整个握手包简单做一次 SHA-256；原始输出有助于核对排序前后变化。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2",
          "s3"
        ],
        "examples": [
          {
            "label": "读首段",
            "input": "t13d0203h2",
            "output": "TCP 上的 TLS 1.3；有域名 SNI；2 个套件；3 个扩展；ALPN 为 h2",
            "explanation": "t=TCP，13=TLS1.3，d=有域名，02/03 是计数；这里只核对首段，完整指纹还需要两段哈希。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JA4Server%20Fingerprint",
    "capabilityIds": [
      "op:JA4Server%20Fingerprint"
    ],
    "relatedIds": [
      "op:JA4Server%20Fingerprint"
    ],
    "topicGroup": "network",
    "title": "JA4 服务端指纹",
    "summary": "首段概况、所选套件与扩展摘要共同组成指纹。",
    "aliases": [
      "JA4Server Fingerprint"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "JA4S 原始参考实现",
        "publisher": "FoxIO",
        "url": "https://github.com/FoxIO-LLC/ja4/blob/main/python/ja4.py",
        "locator": "to_ja4s",
        "language": "en",
        "kind": "implementation"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · JA4Server Fingerprint",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"JA4Server Fingerprint\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "JA4S 读取 ServerHello，首段描述传输协议、版本、扩展数量与 ALPN；第二段直接写出所选密码套件，第三段来自服务端扩展列表的短 SHA-256 摘要。",
          "客户端 JA4 与服务端 JA4S 字段不同，不能交换解释。本站支持原始明细与摘要输出，收到的握手字节决定实际字段，不能从一个域名推算固定 JA4S。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "核对中间套件段",
            "input": "服务端选中密码套件十进制 4865",
            "output": "JA4S 中间段为 1301",
            "explanation": "4865=0x1301；这是所选套件本身的四位十六进制表示，不是该数的 MD5。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:HASSH%20Client%20Fingerprint",
    "capabilityIds": [
      "op:HASSH%20Client%20Fingerprint"
    ],
    "relatedIds": [
      "op:HASSH%20Client%20Fingerprint"
    ],
    "topicGroup": "network",
    "title": "HASSH 客户端指纹",
    "summary": "在 KEXINIT 中读取四组协商算法。",
    "aliases": [
      "HASSH Client Fingerprint"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "HASSH 与 hasshServer 原始方法说明",
        "publisher": "Salesforce 原始作者",
        "url": "https://github.com/salesforce/hassh",
        "locator": "How does HASSH work / Examples",
        "language": "en",
        "kind": "author-spec"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · HASSH Client Fingerprint",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"HASSH Client Fingerprint\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "HASSH 从 SSH_MSG_KEXINIT 读取密钥交换、加密、MAC 和压缩算法列表。此入口取客户端到服务端方向相关的列表，保留列表顺序，以分号分隔四组，再做 MD5。",
          "这一步利用握手时可见的算法声明，不是解密 SSH 正文，也不是对用户名或公钥计算指纹。客户端与服务端使用不同方向的消息，不应混用同一份数据。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "四组拼接与哈希",
            "input": "密钥交换=curve25519-sha256；加密=aes128-ctr；MAC=hmac-sha2-256；压缩=none",
            "output": "curve25519-sha256;aes128-ctr;hmac-sha2-256;none → e97d07603350d1111ec2b64bf25413c9",
            "explanation": "这是一组简化的可复核算法列表，不是承诺某个真实产品一定发出这些值；MD5 按拼接 ASCII 串计算。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:HASSH%20Server%20Fingerprint",
    "capabilityIds": [
      "op:HASSH%20Server%20Fingerprint"
    ],
    "relatedIds": [
      "op:HASSH%20Server%20Fingerprint"
    ],
    "topicGroup": "network",
    "title": "HASSH 服务端指纹",
    "summary": "在 KEXINIT 中读取四组协商算法。",
    "aliases": [
      "HASSH Server Fingerprint"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "HASSH 与 hasshServer 原始方法说明",
        "publisher": "Salesforce 原始作者",
        "url": "https://github.com/salesforce/hassh",
        "locator": "How does HASSH work / Examples",
        "language": "en",
        "kind": "author-spec"
      },
      {
        "id": "s2",
        "title": "CyberChef 官方操作定义 · HASSH Server Fingerprint",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"HASSH Server Fingerprint\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "HASSH 从 SSH_MSG_KEXINIT 读取密钥交换、加密、MAC 和压缩算法列表。此入口取服务端到客户端方向相关的列表，保留列表顺序，以分号分隔四组，再做 MD5。",
          "这一步利用握手时可见的算法声明，不是解密 SSH 正文，也不是对用户名或公钥计算指纹。客户端与服务端使用不同方向的消息，不应混用同一份数据。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "四组拼接与哈希",
            "input": "密钥交换=curve25519-sha256；加密=aes128-ctr；MAC=hmac-sha2-256；压缩=none",
            "output": "curve25519-sha256;aes128-ctr;hmac-sha2-256;none → e97d07603350d1111ec2b64bf25413c9",
            "explanation": "这是一组简化的可复核算法列表，不是承诺某个真实产品一定发出这些值；MD5 按拼接 ASCII 串计算。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:cyberchef",
    "capabilityIds": [
      "native:cyberchef"
    ],
    "relatedIds": [
      "native:cyberchef"
    ],
    "topicGroup": "pipeline",
    "title": "完整 CyberChef 配方工作区",
    "summary": "输出作为下一步输入，按顺序执行多种转换。",
    "aliases": [
      "配方",
      "Recipe",
      "处理链"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方项目介绍与操作组合",
        "publisher": "GCHQ / CyberChef",
        "url": "https://github.com/gchq/CyberChef",
        "locator": "README / How it works",
        "language": "en",
        "kind": "official-doc"
      },
      {
        "id": "s2",
        "title": "本站配方任务与字节输入约定",
        "publisher": "迷雾工具箱随站实现",
        "url": "/cyberchef.js",
        "locator": "initCyberChef / checkedRecipe / run",
        "language": "zh-CN",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "CyberChef 配方是按顺序排列的操作：第一步读取输入，下一步继续处理前一步的结果。每步都有自己的参数与输入/输出类型。",
          "编码后的文本、原始字节和数字是不同的数据表示；配方里要明确哪些步骤产生哪种表示。正向执行的逆链需反转顺序，并为各步骤选择实际逆操作。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1",
          "s2"
        ],
        "examples": [
          {
            "label": "两步配方的顺序",
            "input": "原文本 ARG；To Base64 → Reverse",
            "output": "Base64 得 QVJH；反转后 HJVQ",
            "explanation": "要还原应先 Reverse 得 QVJH，再 From Base64 得 ARG；直接对 HJVQ 做 Base64 解码并不是原链的逆向。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Fork",
    "capabilityIds": [
      "op:Fork"
    ],
    "relatedIds": [
      "op:Fork"
    ],
    "topicGroup": "pipeline",
    "title": "分支处理",
    "summary": "按分隔符生成独立分支。",
    "aliases": [
      "Fork"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Fork",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Fork\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Fork 用指定分隔符切分输入，后续操作分别在各分支执行。例如每行是一个独立 Base64 文本时，每一行应分别解码。",
          "分支结果最后用合并分隔符连接。切分分隔符与输出连接分隔符可不同；分支内的转换不会自动把整份输入当作一个连续字节流。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "分开解码两个 Base64 值",
            "input": "QQ==\nQg==；Fork 按换行分割 → From Base64；用换行合并",
            "output": "A\nB",
            "explanation": "QQ== 和 Qg== 各表示一个字节；Fork 保持了两个独立输入的边界。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Merge",
    "capabilityIds": [
      "op:Merge"
    ],
    "relatedIds": [
      "op:Merge"
    ],
    "topicGroup": "pipeline",
    "title": "合并分支",
    "summary": "把多个分支重新合成一个输入。",
    "aliases": [
      "Merge"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Merge",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Merge\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Merge 把当前分支集合收束成一条主干，后续操作再面对整个合并结果。它用于结束 Fork 或 Subsection 的局部处理范围。",
          "多层分支时，“合并全部”与只合并最近一层不同。应在合并前核对连接分隔符，否则片段可能紧连后改变后续解释。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "局部结果变成整体",
            "input": "Fork 按换行，合并分隔符也为换行；A 和 B 各自处理后 → Merge",
            "output": "一份文本 A\nB；之后的 Length 面对整份文本",
            "explanation": "ASCII/UTF-8 下包含 A、换行、B，共 3 字节，而不是两个各 1 字节的独立结果。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Subsection",
    "capabilityIds": [
      "op:Subsection"
    ],
    "relatedIds": [
      "op:Subsection"
    ],
    "topicGroup": "pipeline",
    "title": "截取片段",
    "summary": "正则匹配限定后续操作的处理片段。",
    "aliases": [
      "Subsection"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Subsection",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Subsection\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Subsection 用正则选择输入中需要处理的子串。如果有捕获组，后续操作针对第一个捕获组；未使用捕获组时针对完整匹配。",
          "它与简单删除前后文本不同：未选择的文本可以保留在输出上下文中。需要恢复全局处理时使用 Merge；多个捕获组也不会自动各运行一条不同配方。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "只改括号里的文字",
            "input": "x[abc]y；Subsection 正则 \\[([a-z]+)\\] → To Upper case → Merge",
            "output": "x[ABC]y",
            "explanation": "捕获组内容是 abc，方括号和外侧 x/y 不参加转大写。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Register",
    "capabilityIds": [
      "op:Register"
    ],
    "relatedIds": [
      "op:Register"
    ],
    "topicGroup": "pipeline",
    "title": "寄存器",
    "summary": "用 $R0 等引用已提取的值。",
    "aliases": [
      "Register"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Register",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Register\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Register 把正则捕获的数据存入寄存器。后续参数中的 $R0 引用第一个捕获值，$R1 引用下一个，编号从 0 开始。",
          "它用于让参数跟随输入中提取的线索变化，不是普通 CPU 寄存器模拟。如果要字面写出 $R0 而不替换，可按项目规则用反斜杠转义。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "捕获一个数字",
            "input": "输入 key=13；提取器 key=(\\d+)；后续参数 $R0",
            "output": "后续参数值为 13",
            "explanation": "括号捕获的是 13，key= 不在捕获组内；这一步保存参数，不代表已完成任何密文解密。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Conditional%20Jump",
    "capabilityIds": [
      "op:Conditional%20Jump"
    ],
    "relatedIds": [
      "op:Conditional%20Jump"
    ],
    "topicGroup": "pipeline",
    "title": "条件跳转",
    "summary": "对当前数据做正则判断，再决定跳转。",
    "aliases": [
      "Conditional Jump"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Conditional Jump",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Conditional Jump\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Conditional Jump 将当前结果与正则匹配；满足条件时跳到指定 Label。反转匹配选项可改成“不匹配时跳转”。",
          "后向跳转可能构成循环，因此需要最大跳转次数。判断针对当前步骤的数据，不是永远针对最初输入；每次转换可能改变条件是否成立。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "正则条件核对",
            "input": "当前数据为 9；条件 ^[0-8]$；反转匹配关闭",
            "output": "不跳转；当前数据 8 则会跳转",
            "explanation": "锚点要求整段恰好一位 0～8；9 不在范围内。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Label",
    "capabilityIds": [
      "op:Label"
    ],
    "relatedIds": [
      "op:Label"
    ],
    "topicGroup": "pipeline",
    "title": "标签",
    "summary": "给配方位置一个名字。",
    "aliases": [
      "Label"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Label",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Label\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Label 只为配方中的位置命名，Jump 或 Conditional Jump 可以用同一名称定位它。它不替换输入文本，也不是显示结果标题。",
          "只有到达跳转操作并指定该标签时，执行顺序才会改变。标签本身经过执行不会更改当前数据。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "一个没有转换作用的位置",
            "input": "当前数据 ARG；Label 名称 decode-start",
            "output": "当前数据仍为 ARG",
            "explanation": "decode-start 是控制流位置名，不会添加到结果正文。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Jump",
    "capabilityIds": [
      "op:Jump"
    ],
    "relatedIds": [
      "op:Jump"
    ],
    "topicGroup": "pipeline",
    "title": "跳转",
    "summary": "无条件把执行位置移到命名标签。",
    "aliases": [
      "Jump"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Jump",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Jump\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Jump 无条件转到指定 Label，位于中间的操作可能被跳过。向后跳转可重复一段配方，向前跳转可绕过一段。",
          "后向跳转设置上限用于限制重复次数。不能把“最大跳转次数”直接当作转换总次数，第一次顺序进入时也可能已经执行了转换。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "前向跳过",
            "input": "配方：Jump(end) → To Base64 → Label(end)；输入 ARG",
            "output": "仍为 ARG",
            "explanation": "Jump 直接到 end，To Base64 未执行，因此不会得到 QVJH。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Sleep",
    "capabilityIds": [
      "op:Sleep"
    ],
    "relatedIds": [
      "op:Sleep"
    ],
    "topicGroup": "pipeline",
    "title": "等待",
    "summary": "按毫秒暂停配方再继续。",
    "aliases": [
      "Sleep"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Sleep",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Sleep\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Sleep 在当前操作位置等待指定毫秒数，随后执行下一步。它没有编码或解码作用，也不创建定时重复任务。",
          "毫秒与秒相差 1000 倍。实际恢复时刻还受浏览器调度影响，不能把等待参数当作精密时钟计时保证。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "等待时长核对",
            "input": "输入 ARG；Sleep=1000 ms",
            "output": "名义等待 1 秒；数据仍是 ARG",
            "explanation": "1000/1000=1 秒；若填 1，则只是 1 毫秒。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Return",
    "capabilityIds": [
      "op:Return"
    ],
    "relatedIds": [
      "op:Return"
    ],
    "topicGroup": "pipeline",
    "title": "返回",
    "summary": "到达 Return 后终止后续操作。",
    "aliases": [
      "Return"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Return",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Return\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Return 终止当前配方执行，不是把输出送给后面的操作继续执行。它适合与条件跳转组合，在已经得到合适结果时提前结束。",
          "项目正式说明明确其作用是结束正在执行的操作流。应把它与 Merge 区分：Merge 结束分支处理范围，但还会继续后续配方。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "终止位置核对",
            "input": "输入 ARG；Return → To Base64",
            "output": "ARG",
            "explanation": "后面的 To Base64 不执行，所以结果不是 QVJH。"
          }
        ]
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Comment",
    "capabilityIds": [
      "op:Comment"
    ],
    "relatedIds": [
      "op:Comment"
    ],
    "topicGroup": "pipeline",
    "title": "注释",
    "summary": "为配方记录意图，计算结果不改变。",
    "aliases": [
      "Comment"
    ],
    "sources": [
      {
        "id": "s1",
        "title": "CyberChef 官方操作定义 · Comment",
        "publisher": "GCHQ / CyberChef",
        "url": "/vendor/cyberchef/catalogue.json",
        "locator": "operations[\"Comment\"]；随站提供的 Apache-2.0 操作描述与参数",
        "language": "en",
        "kind": "implementation"
      }
    ],
    "sections": [
      {
        "title": "原理与规则",
        "paragraphs": [
          "Comment 提供一处说明配方步骤的文字，不参与编码、解码或字节计算。运行经过它时，当前数据原样继续传递。",
          "注释应记录参数约定、线索来源或选择原因。写在注释里的代码和正则不会因此被执行，也不会成为输出的一部分。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": []
      },
      {
        "title": "逐步核对",
        "paragraphs": [
          "下例用于核对这项规则；参数和输入格式需与示例所述保持一致。"
        ],
        "sourceIds": [
          "s1"
        ],
        "examples": [
          {
            "label": "文字注释与结果分离",
            "input": "输入 ARG；Comment=这一行保留原样",
            "output": "ARG",
            "explanation": "注释只解释流程；结果长度仍为 3 个 ASCII 字节。"
          }
        ]
      }
    ],
    "misconceptions": []
  }
];
