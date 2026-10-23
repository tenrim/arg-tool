// Function-specific, cited rules aligned with verified shared runtime behaviour.
export const articles = [
  {
    "id": "function-native:cipher-detect",
    "capabilityIds": [
      "native:cipher-detect"
    ],
    "relatedIds": [
      "native:cipher-detect"
    ],
    "topicGroup": "cipher-analysis",
    "title": "密文智能识别",
    "summary": "先测字符分布，再检验移位和周期候选；格式相似只产生提示。",
    "aliases": [
      "密文识别",
      "IC",
      "字频",
      "启发式"
    ],
    "sources": [
      {
        "id": "entropy",
        "title": "Shannon Diversity Index：频率概率与熵公式",
        "publisher": "美国国家标准与技术研究院 NIST",
        "url": "https://itl.nist.gov/div898/software/dataplot/refman2/auxillar/shannon.htm",
        "language": "en",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "chi",
        "title": "卡方拟合优度检验：观测频数与期望频数",
        "publisher": "美国国家标准与技术研究院 NIST",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda35f.htm",
        "language": "en",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "ic",
        "title": "The Index of Coincidence：单一样本的重复概率",
        "publisher": "Howard H. Campaigne / NSA 原典，Crypto Museum 镜像",
        "url": "https://www.cryptomuseum.com/people/friedman/files/NSA_TIOC_1955.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "§ V；§ VI"
      },
      {
        "id": "implementation",
        "title": "本站 密文智能识别 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/analysis-engine.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:cipher-detect"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "本站对 A–Z 统计频数 fᵢ、样本长度 N，并以 IC=Σfᵢ(fᵢ−1)/(N(N−1)) 衡量不放回抽取两字符相同的概率。全体字符另以 H=−Σpᵢlog₂pᵢ 计算熵，二者使用的字符集合不同。",
          "凯撒候选逐一尝试 26 个移位，按相对英语字频的卡方分数排列；多表候选按假设周期分列，再检查各列 IC。十六进制、Base64 和摩斯提示只检查字符范围与部分长度特征。"
        ],
        "sourceIds": [
          "entropy",
          "chi",
          "ic",
          "implementation"
        ],
        "examples": [
          {
            "label": "识别规则演算",
            "input": "QUJD",
            "output": "满足 Base64 字符范围且长度为 4，可尝试解码为 ABC",
            "explanation": "QUJD 也可以是普通四字母文本；提示没有证明其来源。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "英语模型不适用于任意中文或极短密文。高熵也可能来自压缩；格式匹配不能确认编码，候选的可读性须结合题面核对。"
        ],
        "sourceIds": [
          "implementation",
          "entropy",
          "chi",
          "ic"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:substitution",
    "capabilityIds": [
      "native:substitution"
    ],
    "relatedIds": [
      "native:substitution"
    ],
    "topicGroup": "cipher-analysis",
    "title": "单表替换求解",
    "summary": "同一密文字母始终代入同一明文字母，重复结构随之保留。",
    "aliases": [
      "monoalphabetic substitution",
      "词型"
    ],
    "sources": [
      {
        "id": "ic",
        "title": "The Index of Coincidence：单一样本的重复概率",
        "publisher": "Howard H. Campaigne / NSA 原典，Crypto Museum 镜像",
        "url": "https://www.cryptomuseum.com/people/friedman/files/NSA_TIOC_1955.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "§ V；§ VI"
      },
      {
        "id": "implementation",
        "title": "本站 单表替换求解 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/analysis-engine.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:substitution"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "单表替换使用固定的一一映射。若 X→H、Y→E、Z→L、W→O，则 XYZZW 解为 HELLO；相同的 Z 必须在每处变为相同字母，重复位置形成词形约束。",
          "本站可手工填写部分映射，并结合词型和频率检查猜测。未分配位置显示占位，映射校验禁止把两个不同密文字母同时分配给同一个明文字母，以维持置换条件。"
        ],
        "sourceIds": [
          "ic",
          "implementation"
        ],
        "examples": [
          {
            "label": "固定映射演算",
            "input": "XYZZW；X→H，Y→E，Z→L，W→O",
            "output": "HELLO",
            "explanation": "第 3、4 位相同，因此在任何合法映射下仍相同。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "一个高频字符不一定是 E。短文本、专有名词与其他语言会改变频率；词型匹配只能缩小候选，不能替代上下文验证。"
        ],
        "sourceIds": [
          "implementation",
          "ic"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Frequency%20distribution",
    "capabilityIds": [
      "op:Frequency%20distribution"
    ],
    "relatedIds": [
      "op:Frequency%20distribution"
    ],
    "topicGroup": "cipher-analysis",
    "title": "字符频率分布",
    "summary": "统计 00–FF 每个字节出现次数，再画频数或相对频率。",
    "aliases": [
      "频率",
      "直方图"
    ],
    "sources": [
      {
        "id": "entropy",
        "title": "Shannon Diversity Index：频率概率与熵公式",
        "publisher": "美国国家标准与技术研究院 NIST",
        "url": "https://itl.nist.gov/div898/software/dataplot/refman2/auxillar/shannon.htm",
        "language": "en",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Frequency distribution"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "一个字节有 256 个可能值。对长度 N 的输入逐字节累加 f[b]，相对频率为 f[b]/N；图中的字节标签可按十六进制或 ASCII 呈现。",
          "字节直方图不保留先后顺序。因此 ABAB 与 AABB 的分布相同，但排列不同。中文 UTF-8 通常每字包含多个字节，字节频率不能直接当作汉字词频。"
        ],
        "sourceIds": [
          "entropy",
          "implementation"
        ],
        "examples": [
          {
            "label": "ASCII 字节计数",
            "input": "ABBA",
            "output": "41(A)：2 / 4 = 50%；42(B)：2 / 4 = 50%",
            "explanation": "四字节中两种字节各出现两次；计数与顺序无关。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "“显示 0%”控制未出现字节是否保留；字符标签是帮助阅读的表示。请先确认输入是文本对应字节，还是已经解码的二进制文件。"
        ],
        "sourceIds": [
          "implementation",
          "entropy"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Index%20of%20Coincidence",
    "capabilityIds": [
      "op:Index%20of%20Coincidence"
    ],
    "relatedIds": [
      "op:Index%20of%20Coincidence"
    ],
    "topicGroup": "cipher-analysis",
    "title": "重合指数",
    "summary": "用重复字符对数量除以总字符对数量，估计重复概率。",
    "aliases": [
      "IC",
      "coincidence index"
    ],
    "sources": [
      {
        "id": "ic",
        "title": "The Index of Coincidence：单一样本的重复概率",
        "publisher": "Howard H. Campaigne / NSA 原典，Crypto Museum 镜像",
        "url": "https://www.cryptomuseum.com/people/friedman/files/NSA_TIOC_1955.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "§ V；§ VI"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Index of Coincidence"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "令某字符出现 fᵢ 次，选取该字符的有序不同位置对共有 fᵢ(fᵢ−1) 个；长度 N 的总有序位置对有 N(N−1) 个。两者之比就是样本重合指数。",
          "固定字母置换只改变字母名字，保持每种字母的出现次数，因此保持这种 IC。把周期密文按某个长度分列，可比较各列重复概率，但匹配周期并不保证唯一。"
        ],
        "sourceIds": [
          "ic",
          "implementation"
        ],
        "examples": [
          {
            "label": "不放回抽样演算",
            "input": "AAB",
            "output": "IC = (2×1 + 1×0) / (3×2) = 1/3",
            "explanation": "六个有序位置对中，两个是 A 与 A。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "样本过短时估计波动很大；处理空白、标点和大小写会改变字符集合。不同语言的基准不同，不能把某一个英语经验值当作所有明文的通用阈值。原典另有乘以字母表规模归一化的 I.C. 表示；本例使用未归一化的重复概率，两种数值不要直接比较。"
        ],
        "sourceIds": [
          "implementation",
          "ic"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Chi%20Square",
    "capabilityIds": [
      "op:Chi%20Square"
    ],
    "relatedIds": [
      "op:Chi%20Square"
    ],
    "topicGroup": "cipher-analysis",
    "title": "卡方检验",
    "summary": "把各类别的观测频数与期望频数差异按期望频数加权累加。",
    "aliases": [
      "chi-squared",
      "χ²"
    ],
    "sources": [
      {
        "id": "chi",
        "title": "卡方拟合优度检验：观测频数与期望频数",
        "publisher": "美国国家标准与技术研究院 NIST",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda35f.htm",
        "language": "en",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "ChiSquare.run：v11.5.0 只累计出现过的字节类别",
        "publisher": "CyberChef / GCHQ，固定 v11.5.0 作者源码",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/ChiSquare.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run；distArray[i] > 0 条件",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/operations/ChiSquare.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "site-correction",
        "title": "完整字节卡方统计的公共运算适配",
        "publisher": "迷雾工具箱 · 共用 Worker 适配",
        "url": "/cyberchef-operation-corrections.js",
        "language": "en",
        "kind": "implementation",
        "locator": "patchChiSquare；全部256类别与原始字节"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "标准卡方统计量 χ²=Σ(Oᵢ−Eᵢ)²/Eᵢ。Oᵢ 是观测次数，Eᵢ 是假设下的期望次数；只要某类别的 Eᵢ>0，就应参与求和，即使 Oᵢ=0。",
          "对 256 种字节的均匀分布假设，Eᵢ=N/256。英语候选评分则使用英语字母频率建立另一组 Eᵢ，两种期望模型回答不同问题；统计量的大小不能脱离类别、样本量与假设解读。"
        ],
        "sourceIds": [
          "chi",
          "implementation",
          "site-correction"
        ],
        "examples": [
          {
            "label": "标准公式的两类别演算",
            "input": "观测 O=[3,1]；期望 E=[2,2]",
            "output": "χ²=(3−2)²/2+(1−2)²/2=1",
            "explanation": "两个期望频数都大于零，因此两个类别全部参加求和。"
          },
          {
            "label": "本站完整求和与未适配原版的差别",
            "input": "ASCII 字节 AAB；N=3；256 类均匀假设",
            "output": "本站完整 256 类求和：423.6666666666667\n未适配的原版 v11.5.0：420.69010416666663",
            "explanation": "254 个未出现字节各贡献 3/256，总计 2.9765625；本站公共适配层计入全部类别，独立任务和处理链都采用完整求和。原版历史值只说明未适配源码的差别。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "本站按全部 256 种字节计算 Pearson 统计量；统一适配纠正了原版 v11.5.0 跳过零计数类别的实现差异。统计结果不是英语字母频率评分，也不能单靠该数值识别密码种类。",
          "N=0 时标准期望频数为零，公式不能按普通除法使用；小样本下每类期望频数很低，卡方分布的拟合优度解释也有适用限制。统计量不能自动证明输入随机或已经加密。"
        ],
        "sourceIds": [
          "implementation",
          "chi",
          "site-correction"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Entropy",
    "capabilityIds": [
      "op:Entropy"
    ],
    "relatedIds": [
      "op:Entropy"
    ],
    "topicGroup": "cipher-analysis",
    "title": "信息熵",
    "summary": "把经验概率乘以其信息量，并对所有字节值求和。",
    "aliases": [
      "Shannon entropy",
      "信息量"
    ],
    "sources": [
      {
        "id": "entropy",
        "title": "Shannon Diversity Index：频率概率与熵公式",
        "publisher": "美国国家标准与技术研究院 NIST",
        "url": "https://itl.nist.gov/div898/software/dataplot/refman2/auxillar/shannon.htm",
        "language": "en",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Entropy"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Shannon 熵 H=−Σpᵢlog₂pᵢ，以 2 为底时单位为 bit。未出现的类别贡献为 0；越均匀的分布，平均不确定性越高。",
          "本站字节分析的类别为 256 个字节值，均匀分布时 H=log₂256=8 bit/byte。AAAA 只有一种值，熵为 0；ABAB 两种值各半，熵为 1。"
        ],
        "sourceIds": [
          "entropy",
          "implementation"
        ],
        "examples": [
          {
            "label": "经验字节概率",
            "input": "ABAB",
            "output": "p(A)=p(B)=1/2；H=−2×(1/2)×log₂(1/2)=1 bit/byte",
            "explanation": "序列 AABB 也得到 1，熵本身不保存排列信息。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "高熵不区分压缩、加密或随机数据；低熵也不保证能破解。这里测的是输入样本的经验分布，而不是密钥强度或整个系统的安全性。"
        ],
        "sourceIds": [
          "implementation",
          "entropy"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Magic",
    "capabilityIds": [
      "op:Magic"
    ],
    "relatedIds": [
      "op:Magic"
    ],
    "topicGroup": "cipher-analysis",
    "title": "自动识别与解码",
    "summary": "检测特征、尝试解码，再对输出继续检测；深度限制控制递归层数。",
    "aliases": [
      "自动解码",
      "递归检测"
    ],
    "sources": [
      {
        "id": "magic",
        "title": "CyberChef Magic：编码检测方法说明",
        "publisher": "CyberChef / GCHQ",
        "url": "https://github.com/gchq/CyberChef/wiki/Automatic-detection-of-encoded-data-using-CyberChef-Magic",
        "language": "en",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Magic"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "CyberChef Magic 检查字符集、文件特征与语言频率，选择看起来可能适用的操作。某次转换得到更像可读文本的输出后，它可以在该输出上重复检测，构造多步候选。",
          "“深度”限制递归层数；强化模式还尝试 XOR、位旋转与字符编码组合，官方参数说明限制了强化暴力尝试所用的初始数据长度。Crib 可用已知片段或正则筛选输出。"
        ],
        "sourceIds": [
          "magic",
          "implementation"
        ],
        "examples": [
          {
            "label": "双层编码的可能路径",
            "input": "UVVKRA==",
            "output": "Base64 → QUJD → Base64 → ABC",
            "explanation": "这是手工核对后的有效路径；Magic 是否列出它还受参数及版本影响。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "这种搜索是启发式，可能漏解，也可能出现看似合理的错误候选。候选处理链需要结合原题、期望文件格式与内容核验。"
        ],
        "sourceIds": [
          "implementation",
          "magic"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:extract-position",
    "capabilityIds": [
      "native:extract-position"
    ],
    "relatedIds": [
      "native:extract-position"
    ],
    "topicGroup": "text-language",
    "title": "按位置提取答案",
    "summary": "每行去掉空白后，按从 1 开始的码位位置取一个字符。",
    "aliases": [
      "索引提取",
      "index"
    ],
    "sources": [
      {
        "id": "iterator",
        "title": "字符串迭代器：按 Unicode 码位迭代",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "slice",
        "title": "String.prototype.slice()：位置与截取范围",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/slice",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 按位置提取答案 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:extract-position"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "这个入口把非空文本行看成独立答案，先去掉行内空白，再按 Unicode 码位拆分。输入索引 N 实际取数组第 N−1 项，因此首字的索引为 1。",
          "固定索引作用于每一行，最后按原行序连接取出的字；它不会自动推断答案排序或索引来源。标点不属于空白，仍会参与计数。"
        ],
        "sourceIds": [
          "iterator",
          "slice",
          "implementation"
        ],
        "examples": [
          {
            "label": "每行第 2 个字",
            "input": "CAT\nDOG；N=2",
            "output": "AO",
            "explanation": "C A T 取 A，D O G 取 O，再按行序连接。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "N 必须是正整数，且不得超过任何一行的有效长度。一个带组合音符或连接符的可见字形可能有多个码位，不能仅按屏幕上看见的字形数量计数。"
        ],
        "sourceIds": [
          "implementation",
          "iterator",
          "slice"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:extract-indices",
    "capabilityIds": [
      "native:extract-indices"
    ],
    "relatedIds": [
      "native:extract-indices"
    ],
    "topicGroup": "text-language",
    "title": "按每行索引提取",
    "summary": "第 i 个索引只用于第 i 行，提取后按行序连接。",
    "aliases": [
      "逐行索引",
      "答案提取"
    ],
    "sources": [
      {
        "id": "iterator",
        "title": "字符串迭代器：按 Unicode 码位迭代",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 按每行索引提取 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:extract-indices"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "把索引列表与文本行一一配对，例如两行配索引 2、3。每行去空白后转为码位数组，索引均从 1 开始；不是把全部索引反复应用于每一行。",
          "提取按外部给定数字执行。数字可以来自题号、答案长度或另一条线索；工具只处理输入的配对，不判断索引来源是否符合题意。"
        ],
        "sourceIds": [
          "iterator",
          "implementation"
        ],
        "examples": [
          {
            "label": "按行配对",
            "input": "CAT\nDOG；索引 2 3",
            "output": "AG",
            "explanation": "第一行第 2 位 A，第二行第 3 位 G。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "有效索引数要覆盖全部非空行；缺项、非整数、零和越界会报错。空行会先排除，因此不要把它当成仍占一个索引的答案行。"
        ],
        "sourceIds": [
          "implementation",
          "iterator"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:extract-first",
    "capabilityIds": [
      "native:extract-first"
    ],
    "relatedIds": [
      "native:extract-first"
    ],
    "topicGroup": "text-language",
    "title": "每行首字提取",
    "summary": "从每个非空答案行取首码位，再按题目顺序连接。",
    "aliases": [
      "藏头",
      "acrostic"
    ],
    "sources": [
      {
        "id": "iterator",
        "title": "字符串迭代器：按 Unicode 码位迭代",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 每行首字提取 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:extract-first"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "首字提取是固定索引 1 的一种特例：每行去空白后取第一个码位。换行决定记录边界，行内第一个标点同样会被取出。",
          "若每行是一条答案，提取结果保留行顺序。交换两条答案会交换相应的提取字符，这也是核对题目排序是否正确的重要方式。"
        ],
        "sourceIds": [
          "iterator",
          "implementation"
        ],
        "examples": [
          {
            "label": "首字规则",
            "input": "SUN\nKEY\nYELLOW",
            "output": "SKY",
            "explanation": "三行首字 S、K、Y 按行序组成 SKY。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "这里按码位读取，复合 emoji 可能拆成多个部分。题面的“首词”“首音”“首字母”可能需要先做分词或拼音转换，不能都当作首码位。"
        ],
        "sourceIds": [
          "implementation",
          "iterator"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:extract-last",
    "capabilityIds": [
      "native:extract-last"
    ],
    "relatedIds": [
      "native:extract-last"
    ],
    "topicGroup": "text-language",
    "title": "每行末字提取",
    "summary": "从每行去空白后的最后一个码位读取线索。",
    "aliases": [
      "藏尾",
      "telestich"
    ],
    "sources": [
      {
        "id": "iterator",
        "title": "字符串迭代器：按 Unicode 码位迭代",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 每行末字提取 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:extract-last"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "末字提取把第 i 行有效长度记为 Lᵢ，读取其第 Lᵢ 位。因为每行长度可以不同，它不等同于给所有行输入同一个固定 N。",
          "行末句号或逗号仍是字符；空白会去除而标点不会。需要“最后一个字母”时，应先清理标点或明确题面的计数规则。"
        ],
        "sourceIds": [
          "iterator",
          "implementation"
        ],
        "examples": [
          {
            "label": "末字规则",
            "input": "ORBIT\nRADIO\nMAP",
            "output": "TOP",
            "explanation": "末位分别是 T、O、P。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "换行边界和答案顺序仍然决定输出；工具不自动删除题号或注释。多码位组合字形的最后码位可能只是组合符。"
        ],
        "sourceIds": [
          "implementation",
          "iterator"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:extract-transpose",
    "capabilityIds": [
      "native:extract-transpose"
    ],
    "relatedIds": [
      "native:extract-transpose"
    ],
    "topicGroup": "text-language",
    "title": "文字行列转置",
    "summary": "把原矩阵第 i 行第 j 列交换为新矩阵第 j 行第 i 列。",
    "aliases": [
      "转置",
      "transpose",
      "竖读"
    ],
    "sources": [
      {
        "id": "iterator",
        "title": "字符串迭代器：按 Unicode 码位迭代",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 文字行列转置 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:extract-transpose"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "等长文本行构成字符矩阵 A。转置规定 B[j][i]=A[i][j]，所以原本竖排的一列会变为结果中的一行；它只重排位置，不改字符。",
          "本站先排除空行并去掉空白，再按码位建立网格。原有 r 行 c 列，结果得到 c 行 r 列；转置两次可以恢复同一规范化矩阵。"
        ],
        "sourceIds": [
          "iterator",
          "implementation"
        ],
        "examples": [
          {
            "label": "2×3 矩阵",
            "input": "ABC\nDEF",
            "output": "AD\nBE\nCF",
            "explanation": "第 1 列 A、D 变为第一行 AD，其余列同理。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "每行有效字符数必须相同。去掉空格后才比较长度；如果题图中空白本身是格子，需要先用明确占位符保留它。"
        ],
        "sourceIds": [
          "implementation",
          "iterator"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi",
    "capabilityIds": [
      "native:hanzi"
    ],
    "relatedIds": [
      "native:hanzi"
    ],
    "topicGroup": "text-language",
    "title": "汉字属性与读音",
    "summary": "一个字可对应多种属性，属性之间不能彼此替代。",
    "aliases": [
      "部首",
      "笔画",
      "汉字属性"
    ],
    "sources": [
      {
        "id": "strokes",
        "title": "通用规范汉字笔顺规范的规则、字形与编码",
        "publisher": "教育部全国青少年普法网",
        "url": "https://qspfw.moe.gov.cn/html/hotnews/20210301/17988.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "pinyinapi",
        "title": "拼音转换、声母韵母和音调参数",
        "publisher": "pinyin-pro 作者文档",
        "url": "https://pinyin-pro.cn/use/pinyin.html",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 汉字属性与读音 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Unicode 码位标识字符，部首与部件描述字形检索，拼音描述读音，笔画数与笔顺描述书写。比如“明”有 8 画，但 8 不是它的字符编号或读音。",
          "本站把 cnchar 的笔画、部首、编码与 pinyin-pro 的语境读音，以及结构分解数据并列呈现。各字段来自不同字库，未知字段会显示未收录。"
        ],
        "sourceIds": [
          "strokes",
          "pinyinapi",
          "implementation"
        ],
        "examples": [
          {
            "label": "字段的区别",
            "input": "明",
            "output": "常用读音 míng；8 画；码位 U+660E",
            "explanation": "同一个字符的语音、字形计数和编码属于三类不同信息。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "返回内容不等于所有生僻字、地区字形和全部读音的权威全量记录。用于教学或规范核对时，应再查看教育部字表及笔顺规范。"
        ],
        "sourceIds": [
          "implementation",
          "strokes",
          "pinyinapi"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi-code",
    "capabilityIds": [
      "native:hanzi-code"
    ],
    "relatedIds": [
      "native:hanzi-code"
    ],
    "topicGroup": "text-language",
    "title": "汉字编码与反查",
    "summary": "按四个角的笔形取四位编号，可另带第五位补充信息。",
    "aliases": [
      "四角号码",
      "four-corner"
    ],
    "sources": [
      {
        "id": "unihan",
        "title": "Unicode Han Database：字形、读音及检索字段",
        "publisher": "Unicode Consortium",
        "url": "https://unicode.org/reports/tr38/",
        "language": "en",
        "kind": "standard",
        "locator": "kFourCornerCode；kCangjie；kMainlandTelegraph；kTotalStrokes"
      },
      {
        "id": "cnchar",
        "title": "cnchar：汉字编码、成语和歇后语参数",
        "publisher": "cnchar 作者随附文档",
        "url": "/vendor/round1/cnchar/README.md",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 汉字编码与反查 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi-code"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "四角号码是一种按字形检索的编号：观察左上、右上、左下、右下四个角，按方案给笔形分配数字。某些字再用第五位进一步区别近似形状。",
          "Unicode Unihan 的 kFourCornerCode 记录四角字段。本站输入四位数时做前缀匹配，输入五位时做完整匹配；这不是把数字当成 Unicode 十六进制码位。"
        ],
        "sourceIds": [
          "unihan",
          "cnchar",
          "implementation"
        ],
        "examples": [
          {
            "label": "四位前缀的作用",
            "input": "6010",
            "output": "查找四角码以 6010 开头的已收录字符",
            "explanation": "查询规则例：6010 和 60100 的匹配范围不同，前者允许额外第五位。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "同一号码可以匹配多个字；不同字典或字形可能产生差异。本站反查字库的覆盖范围由随附资料决定。"
        ],
        "sourceIds": [
          "implementation",
          "unihan",
          "cnchar"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi-stroke",
    "capabilityIds": [
      "native:hanzi-stroke"
    ],
    "relatedIds": [
      "native:hanzi-stroke"
    ],
    "topicGroup": "text-language",
    "title": "按笔画反查汉字",
    "summary": "数完整字的书写笔画，再筛选字库中计数相同的字。",
    "aliases": [
      "笔画反查"
    ],
    "sources": [
      {
        "id": "strokes",
        "title": "通用规范汉字笔顺规范的规则、字形与编码",
        "publisher": "教育部全国青少年普法网",
        "url": "https://qspfw.moe.gov.cn/html/hotnews/20210301/17988.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "cnchar",
        "title": "cnchar：汉字编码、成语和歇后语参数",
        "publisher": "cnchar 作者随附文档",
        "url": "/vendor/round1/cnchar/README.md",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 按笔画反查汉字 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi-stroke"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "笔画数记录完成一个字所需的笔画数量，不是部件数。“人”的两笔与“日”的四笔是笔画计数；“明”由日月组成但不是两笔。",
          "按笔画反查把这个整数与字库字段比较，返回所有相符候选。它保留大量同画字，通常还需要读音、部件或题面条件进一步筛选。"
        ],
        "sourceIds": [
          "strokes",
          "cnchar",
          "implementation"
        ],
        "examples": [
          {
            "label": "计数检索",
            "input": "4",
            "output": "可包含已收录的“日”等四画字",
            "explanation": "“日”的笔顺涉及横折等复合笔画，不能把每条直线段都数作独立笔画。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "本站接受 1–64 的整数。字形标准和地区习惯可能影响计数，字库并未宣称覆盖所有历史异体或扩展字符。"
        ],
        "sourceIds": [
          "implementation",
          "strokes",
          "cnchar"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi-component",
    "capabilityIds": [
      "native:hanzi-component"
    ],
    "relatedIds": [
      "native:hanzi-component"
    ],
    "topicGroup": "text-language",
    "title": "按部件反查汉字",
    "summary": "按结构分解寻找同时包含指定部件的已收录汉字。",
    "aliases": [
      "拆字",
      "部件检索"
    ],
    "sources": [
      {
        "id": "components",
        "title": "现代常用字部件及部件名称规范发布说明",
        "publisher": "中华人民共和国教育部",
        "url": "https://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/moe_1485/tnull_45766.html",
        "language": "zh-CN",
        "kind": "standard",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 按部件反查汉字 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi-component"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "部件是汉字结构分析的单位，部首是用于归部检索的分类，两者并不总相同。部件还可能继续分解，形成从整字到较小部件的层级。",
          "本站在结构字库中递归查找：一个字直接等于目标部件，或它的子部件继续包含目标，均可满足条件；输入多个部件时要求全部出现。"
        ],
        "sourceIds": [
          "components",
          "implementation"
        ],
        "examples": [
          {
            "label": "同时包含两个部件",
            "input": "日 月",
            "output": "“明”满足这两个部件条件",
            "explanation": "这是结构关系的例子；完整候选还由随附分解字库决定。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "这不是任意字形像素匹配；结构分解存在未收录及异体差异，形似的笔画也未必在数据中被标为同一部件。"
        ],
        "sourceIds": [
          "implementation",
          "components"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi-sound",
    "capabilityIds": [
      "native:hanzi-sound"
    ],
    "relatedIds": [
      "native:hanzi-sound"
    ],
    "topicGroup": "text-language",
    "title": "按拼音反查汉字",
    "summary": "用拼音匹配字库读音字段，返回所有已收录的同读音字符。",
    "aliases": [
      "同音字",
      "拼音反查"
    ],
    "sources": [
      {
        "id": "pinyin",
        "title": "汉语拼音方案的通用键盘表示规范",
        "publisher": "中华人民共和国教育部",
        "url": "https://www.moe.gov.cn/jyb_sjzl/ziliao/A19/201001/t20100115_75673.html",
        "language": "zh-CN",
        "kind": "standard",
        "locator": "GF 3006—2001"
      },
      {
        "id": "cnchar",
        "title": "cnchar：汉字编码、成语和歇后语参数",
        "publisher": "cnchar 作者随附文档",
        "url": "/vendor/round1/cnchar/README.md",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 按拼音反查汉字 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi-sound"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "汉语中一个音节可以对应多个汉字，一个汉字也可能有多个读音。因此从拼音到汉字是候选查询，通常没有唯一答案。",
          "本站使用 cnchar 的读音反查，并合并简体和繁体候选后去重。带声调和不带声调的输入约束不同，应按引擎文档规定的拼写形式提供。"
        ],
        "sourceIds": [
          "pinyin",
          "cnchar",
          "implementation"
        ],
        "examples": [
          {
            "label": "同音不是唯一映射",
            "input": "shi",
            "output": "可能出现“诗、时、使、是”等不同声调和词义的候选",
            "explanation": "是否带调号改变匹配条件；具体列表以本地字库为准。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "这类单字反查不具备完整上下文；人名、方言及多音字的具体读法还需题面或正式辞书。不能用结果中的第一个字替代所有同音字。"
        ],
        "sourceIds": [
          "implementation",
          "pinyin",
          "cnchar"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi-cangjie",
    "capabilityIds": [
      "native:hanzi-cangjie"
    ],
    "relatedIds": [
      "native:hanzi-cangjie"
    ],
    "topicGroup": "text-language",
    "title": "仓颉编码反查",
    "summary": "把字形部件映射为字母键位，再用码串反查字库。",
    "aliases": [
      "倉頡",
      "Cangjie"
    ],
    "sources": [
      {
        "id": "unihan",
        "title": "Unicode Han Database：字形、读音及检索字段",
        "publisher": "Unicode Consortium",
        "url": "https://unicode.org/reports/tr38/",
        "language": "en",
        "kind": "standard",
        "locator": "kFourCornerCode；kCangjie；kMainlandTelegraph；kTotalStrokes"
      },
      {
        "id": "cnchar",
        "title": "cnchar：汉字编码、成语和歇后语参数",
        "publisher": "cnchar 作者随附文档",
        "url": "/vendor/round1/cnchar/README.md",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 仓颉编码反查 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi-cangjie"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "仓颉属于形码输入方案，不按汉语读音编码。常见键位 A、B、C、D、E 对应日、月、金、木、水；不同代际和复杂字取码规则需要分别核对。",
          "本站读取随附字库的仓颉字段，把输入转为大写并精确匹配。码串可有 1–5 个字母，多个查询用空白分开；它不会根据任意图像自动计算拆字码。"
        ],
        "sourceIds": [
          "unihan",
          "cnchar",
          "implementation"
        ],
        "examples": [
          {
            "label": "基本字形取码",
            "input": "A",
            "output": "日（常见仓颉方案的基本键位）",
            "explanation": "A 是字形键位，不是“日”的拼音首字母。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "相同码可能重码，不同版本可能编码不同。不要把拼音缩写直接当仓颉码，也不要假定查不到就说明输入字形不合法。"
        ],
        "sourceIds": [
          "implementation",
          "unihan",
          "cnchar"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi-idiom",
    "capabilityIds": [
      "native:hanzi-idiom"
    ],
    "relatedIds": [
      "native:hanzi-idiom"
    ],
    "topicGroup": "text-language",
    "title": "成语查询",
    "summary": "把已知位置固定，未知位置用单字占位符表示。",
    "aliases": [
      "成语缺字",
      "成语模式"
    ],
    "sources": [
      {
        "id": "cnchar",
        "title": "cnchar：汉字编码、成语和歇后语参数",
        "publisher": "cnchar 作者随附文档",
        "url": "/vendor/round1/cnchar/README.md",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 成语查询 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi-idiom"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "成语查询使用位置约束：在“画?点?”中，第 1 位必须是画、第 3 位必须是点，问号各占一个未知汉字；不是任意长度的通配符。",
          "本站把问号转换为空位模式，再查询 cnchar 成语库。未带问号时则按库的查询规则匹配输入；结果是已收录成语而非现场生成的四字词。"
        ],
        "sourceIds": [
          "cnchar",
          "implementation"
        ],
        "examples": [
          {
            "label": "固定字位",
            "input": "画?点?",
            "output": "候选可包含“画龙点睛”",
            "explanation": "龙和睛分别填入第 2、4 位；例子用于说明位置约束。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "该入口主要筛选字面形式，不解释所有典故或判断任何组合是否成语。引用来源与释义需要正式辞书进一步核对。"
        ],
        "sourceIds": [
          "implementation",
          "cnchar"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi-telegraph",
    "capabilityIds": [
      "native:hanzi-telegraph"
    ],
    "relatedIds": [
      "native:hanzi-telegraph"
    ],
    "topicGroup": "text-language",
    "title": "汉字电报码双向转换",
    "summary": "电报码把一个汉字映射到字表中的四位十进制编号。",
    "aliases": [
      "中文电码",
      "telegraph code"
    ],
    "sources": [
      {
        "id": "unihan",
        "title": "Unicode Han Database：字形、读音及检索字段",
        "publisher": "Unicode Consortium",
        "url": "https://unicode.org/reports/tr38/",
        "language": "en",
        "kind": "standard",
        "locator": "kFourCornerCode；kCangjie；kMainlandTelegraph；kTotalStrokes"
      },
      {
        "id": "implementation",
        "title": "本站 汉字电报码双向转换 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi-telegraph"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "汉字电报码依靠预先约定的字表；编码时查字得四位数，解码时查四位数得字。数字没有逐位拼音意义，0001 中的前导零属于编号必须保留。",
          "大陆和台湾电码表可能不同。本站按所选表分别查找全部匹配，并用空白或逗号分隔多个编码；一个码或字有多条记录时不会强行视为唯一映射。"
        ],
        "sourceIds": [
          "unihan",
          "implementation"
        ],
        "examples": [
          {
            "label": "常见字表编号",
            "input": "0001",
            "output": "一",
            "explanation": "保持四位数字形式；本例需选有该记录的电码表。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "电报码是字表编号，不是 ASCII、Unicode 或某种四位加密算法。查不到表示该表没有记录，需要核对表版本和字形。"
        ],
        "sourceIds": [
          "implementation",
          "unihan"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi-traditional",
    "capabilityIds": [
      "native:hanzi-traditional"
    ],
    "relatedIds": [
      "native:hanzi-traditional"
    ],
    "topicGroup": "text-language",
    "title": "汉字转繁体",
    "summary": "先按词汇语境区分一对多对应，再应用目标字形配置。",
    "aliases": [
      "简转繁",
      "s2t"
    ],
    "sources": [
      {
        "id": "opencc",
        "title": "OpenCC：字符、词汇和地区转换配置",
        "publisher": "OpenCC 作者文档",
        "url": "https://opencc.byvoid.com/1.3.0/",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 汉字转繁体 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi-traditional"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "繁简关系可能一对多。例如“发”在头发中对应髮，在发展中对应發。逐字替换无法正确处理这种语境差异，OpenCC 因此支持词汇级和字符级配置。",
          "本站从大陆简体配置 cn 转到 OpenCC 繁体配置 t。配置名称指定目标字形和词汇规则，不能据此自动推断为台湾或香港的全部惯用词。"
        ],
        "sourceIds": [
          "opencc",
          "implementation"
        ],
        "examples": [
          {
            "label": "一字分流",
            "input": "头发发展",
            "output": "頭髮發展",
            "explanation": "两个“发”依语境得到不同繁体；这是词组处理的重要原因。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "转换可能改变字形与某些词汇，不能保证无上下文文本的唯一正确恢复。专名、古籍、混合字形和谜题刻意异体应保留原文对照。"
        ],
        "sourceIds": [
          "implementation",
          "opencc"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi-simplified",
    "capabilityIds": [
      "native:hanzi-simplified"
    ],
    "relatedIds": [
      "native:hanzi-simplified"
    ],
    "topicGroup": "text-language",
    "title": "汉字转简体",
    "summary": "不同繁体字可能合并为一个简体字，原先区别随之丢失。",
    "aliases": [
      "繁转简",
      "t2s"
    ],
    "sources": [
      {
        "id": "opencc",
        "title": "OpenCC：字符、词汇和地区转换配置",
        "publisher": "OpenCC 作者文档",
        "url": "https://opencc.byvoid.com/1.3.0/",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 汉字转简体 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi-simplified"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "字形合并会使映射成为多对一：發和髮在常见简化转换中都可成为发。因此简化后再转繁体，必须依赖语境，不能仅凭字码恢复原来每一种写法。",
          "本站从 OpenCC 标准繁体配置 t 转大陆简体配置 cn。该转换依据字词数据，不是把 Unicode 数值相减或删去某个笔画。"
        ],
        "sourceIds": [
          "opencc",
          "implementation"
        ],
        "examples": [
          {
            "label": "多对一的区别",
            "input": "頭髮與發展",
            "output": "头发与发展",
            "explanation": "髮和發合并为发，原来的字符区别已不能从单字发反推。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "方言惯用词、专有名词和古籍异体要单独核对。繁转简的输出未必能作为原字形的无损存档。"
        ],
        "sourceIds": [
          "implementation",
          "opencc"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi-pinyin",
    "capabilityIds": [
      "native:hanzi-pinyin"
    ],
    "relatedIds": [
      "native:hanzi-pinyin"
    ],
    "topicGroup": "text-language",
    "title": "拼音、声母与声调",
    "summary": "完整音节、声母、韵母与首字母是不同粒度的语音字段。",
    "aliases": [
      "声母",
      "韵母",
      "声调"
    ],
    "sources": [
      {
        "id": "pinyinapi",
        "title": "拼音转换、声母韵母和音调参数",
        "publisher": "pinyin-pro 作者文档",
        "url": "https://pinyin-pro.cn/use/pinyin.html",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "pinyin",
        "title": "汉语拼音方案的通用键盘表示规范",
        "publisher": "中华人民共和国教育部",
        "url": "https://www.moe.gov.cn/jyb_sjzl/ziliao/A19/201001/t20100115_75673.html",
        "language": "zh-CN",
        "kind": "standard",
        "locator": "GF 3006—2001"
      },
      {
        "id": "implementation",
        "title": "本站 拼音、声母与声调 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi-pinyin"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "拼音的调号表明声调，数字后缀是另一种表示形式。比如“中”的 zhōng 可写 zhong1；zh 是声母，而 z 是拼音首字母，两者不能互换。",
          "本站使用 pinyin-pro 输出语境读音、数字声调、声母、韵母和首字母。库默认把 y、w 放入 initial 输出以便使用；这项 API 约定不能代替规范声母分类。"
        ],
        "sourceIds": [
          "pinyinapi",
          "pinyin",
          "implementation"
        ],
        "examples": [
          {
            "label": "逐字段对照",
            "input": "中",
            "output": "拼音 zhōng；数字声调 zhong1；声母 zh；首字母 z",
            "explanation": "声母可含两个字母，所以“取声母”和“取首字母”可能产生不同答案。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "多音字需要语境，人名和古语可能识别不准。汉语拼音键盘规范以 v 替代某些 ü 输入时，还要区分显示拼写与输入键位。"
        ],
        "sourceIds": [
          "implementation",
          "pinyinapi",
          "pinyin"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi-wubi",
    "capabilityIds": [
      "native:hanzi-wubi"
    ],
    "relatedIds": [
      "native:hanzi-wubi"
    ],
    "topicGroup": "text-language",
    "title": "五笔编码反查",
    "summary": "按字根与拆分规则编码，反查时还须区分方案版本。",
    "aliases": [
      "王码",
      "五笔86",
      "五笔98"
    ],
    "sources": [
      {
        "id": "wubi",
        "title": "五笔字型输入法词典：86 版与 98 版",
        "publisher": "清华大学出版社",
        "url": "https://www.tup.tsinghua.edu.cn/upload/books/yz/074387-01.pdf",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "前言"
      },
      {
        "id": "cnchar",
        "title": "cnchar：汉字编码、成语和歇后语参数",
        "publisher": "cnchar 作者随附文档",
        "url": "/vendor/round1/cnchar/README.md",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 五笔编码反查 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi-wubi"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "五笔是按字形拆分的输入方案，86 版和 98 版都有独立字根与编码资料。一个字可由若干字根键位组成，读音相同的字并不因此共享编码。",
          "本站使用随附 cnchar 字库，接受 1–4 个 A–Y 字母并按码前缀查找；字库中的多种码以记录形式显示。短前缀会返回比完整码更多候选。"
        ],
        "sourceIds": [
          "wubi",
          "cnchar",
          "implementation"
        ],
        "examples": [
          {
            "label": "前缀范围",
            "input": "G",
            "output": "查找随附五笔码以 G 开头的字符",
            "explanation": "本例演示本站前缀规则，不把 G 的全部候选限定为某个唯一字根。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "版本差异、简码与完整码不能混为一谈；查询命中只证明该字库有记录，不代表所有版本均使用同一码。"
        ],
        "sourceIds": [
          "implementation",
          "wubi",
          "cnchar"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:hanzi-xhy",
    "capabilityIds": [
      "native:hanzi-xhy"
    ],
    "relatedIds": [
      "native:hanzi-xhy"
    ],
    "topicGroup": "text-language",
    "title": "歇后语查询",
    "summary": "前半句设置形象或比喻，后半句点明含义，查询可利用任一部分。",
    "aliases": [
      "歇后语",
      "谐音"
    ],
    "sources": [
      {
        "id": "cnchar",
        "title": "cnchar：汉字编码、成语和歇后语参数",
        "publisher": "cnchar 作者随附文档",
        "url": "/vendor/round1/cnchar/README.md",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 歇后语查询 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/round1/hanzi.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:hanzi-xhy"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "歇后语常用两部分建立联系：如“泥菩萨过江”引出“自身难保”。解谜时可能只给画面、前半句或谐音，补出的后半句才是所需线索。",
          "本站按 cnchar 的模糊查询规则搜索随附歇后语库，不是把任意比喻自动补全。结果保留字库已有配对，供进一步核对词形和题意。"
        ],
        "sourceIds": [
          "cnchar",
          "implementation"
        ],
        "examples": [
          {
            "label": "两部分关系",
            "input": "泥菩萨过江",
            "output": "自身难保",
            "explanation": "通过前半句的形象寻找后半句含义；具体命中以随附字库为准。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "方言、异文和谐音会造成多种版本；模糊命中不表示只有一个规范表达。没有收录的短语也可能在现实语言中存在。"
        ],
        "sourceIds": [
          "implementation",
          "cnchar"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:words",
    "capabilityIds": [
      "native:words"
    ],
    "relatedIds": [
      "native:words"
    ],
    "topicGroup": "text-language",
    "title": "查词与字母重排",
    "summary": "每种字母的次数必须完全相同，排列顺序可以改变。",
    "aliases": [
      "Anagram",
      "字母重排"
    ],
    "sources": [
      {
        "id": "wordengine",
        "title": "英文字库查询：通配符、字母计数和编辑距离",
        "publisher": "cipher-machine 作者源码",
        "url": "/vendor/hunt/cipher-machine/one-word/one-word.js",
        "language": "en",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 查词与字母重排 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:words"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Anagram 不是只看两词有没有相同字母，而是比较每种字母出现的次数。silent 与 listen 均包含 e、i、l、n、s、t 各一次，因此可互为重排。",
          "本站对英文字母查询去空白并转小写，再在字库中寻找相同字母多重集合。词库候选受收录范围限制，字母重排不会凭空证明某词是题目答案。"
        ],
        "sourceIds": [
          "wordengine",
          "implementation"
        ],
        "examples": [
          {
            "label": "同一字母计数",
            "input": "silent",
            "output": "listen、enlist 等具有相同字母计数的词",
            "explanation": "排列不同而各字母数量相同；完整候选以所选字库为准。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "重复字母必须保留次数：aab 与 abb 不互为重排。带标点、非英语字符与分词边界应先按题面处理。"
        ],
        "sourceIds": [
          "implementation",
          "wordengine"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:words-letters",
    "capabilityIds": [
      "native:words-letters"
    ],
    "relatedIds": [
      "native:words-letters"
    ],
    "topicGroup": "text-language",
    "title": "使用给定字母组词",
    "summary": "按允许字母或可用字母条件筛选，不要求总长度与原串一致。",
    "aliases": [
      "给定字母",
      "字母集合"
    ],
    "sources": [
      {
        "id": "wordengine",
        "title": "英文字库查询：通配符、字母计数和编辑距离",
        "publisher": "cipher-machine 作者源码",
        "url": "/vendor/hunt/cipher-machine/one-word/one-word.js",
        "language": "en",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 使用给定字母组词 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:words-letters"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "严格重排要求每种字母计数相等；“使用给定字母组词”则筛选在输入字母条件下可构成的词。二者在能否少用字母、重复利用字母方面必须查看具体引擎规则。",
          "本站调用 cipher-machine 的 onlyContains 查询。它先把输入字母形成允许集合，再筛选词中字母，因此允许重复使用某个已给定字母；不是按字母牌库存逐张消耗。"
        ],
        "sourceIds": [
          "wordengine",
          "implementation"
        ],
        "examples": [
          {
            "label": "允许集合规则",
            "input": "abc",
            "output": "cab 可以通过；字母重复次数需另行核对",
            "explanation": "a、b、c 形成允许字母集合；这是集合筛选而非库存计数。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "如果谜题要求每张字母牌最多使用一次，应改用字母重排或自行核对次数。只看允许集合会接受次数超过输入的候选。"
        ],
        "sourceIds": [
          "implementation",
          "wordengine"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:words-wildcard",
    "capabilityIds": [
      "native:words-wildcard"
    ],
    "relatedIds": [
      "native:words-wildcard"
    ],
    "topicGroup": "text-language",
    "title": "通配符与重复字型查词",
    "summary": "小写字母固定值，未知格占位，同一个大写标记约束重复位置。",
    "aliases": [
      "通配符",
      "词型",
      "重复字母"
    ],
    "sources": [
      {
        "id": "wordengine",
        "title": "英文字库查询：通配符、字母计数和编辑距离",
        "publisher": "cipher-machine 作者源码",
        "url": "/vendor/hunt/cipher-machine/one-word/one-word.js",
        "language": "en",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "regex",
        "title": "正则表达式：模式与标志",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 通配符与重复字型查词 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:words-wildcard"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "本站通配符中，小写字母表示已知字母，# 或 ? 表示一个未知字母，* 表示任意长度片段。大写标记通过捕获与回引使同一标记位置使用同一个字母。",
          "例如 A##A 要求首尾相同；A 不代表固定字母 a。不同大写标记是否必须不同不能从名字推断，本站实现只保证同标记回引相同。"
        ],
        "sourceIds": [
          "wordengine",
          "regex",
          "implementation"
        ],
        "examples": [
          {
            "label": "重复位置约束",
            "input": "A##A",
            "output": "noon 可以匹配；note 不满足首尾相同",
            "explanation": "A 两处回引同一字母；两处 # 各自独立。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "该语法不是完整正则表达式。要用量词、逻辑组合或更严格的不同字母约束，请到正则查词并写明确模式。"
        ],
        "sourceIds": [
          "implementation",
          "wordengine",
          "regex"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:word-grid",
    "capabilityIds": [
      "native:word-grid"
    ],
    "relatedIds": [
      "native:word-grid"
    ],
    "topicGroup": "text-language",
    "title": "网格搜词",
    "summary": "从每一格出发，沿固定方向逐格比较字母。",
    "aliases": [
      "Word Search",
      "八方向",
      "网格搜词"
    ],
    "sources": [
      {
        "id": "gridengine",
        "title": "网格搜词：八方向和相邻路径",
        "publisher": "cipher-machine 作者源码",
        "url": "/vendor/hunt/cipher-machine/word-search/wordSearch.js",
        "language": "en",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "distance",
        "title": "编辑距离的定义与动态规划矩阵",
        "publisher": "东北大学学报（自然科学版）",
        "url": "https://xuebao.neu.edu.cn/natural/article/html/2019-11-1543.htm",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "§ 1；§ 1.1"
      },
      {
        "id": "implementation",
        "title": "本站 网格搜词 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:word-grid"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "直线 Word Search 在水平、竖直与两条斜线的正反方向共八个方向寻找字库词。一次候选沿同一个方向走，途中不能拐弯。",
          "前缀树保存共享单词前缀；路径当前字母若不属于任何词前缀，就提前停止继续搜索，避免把每条长串都与整个字库逐个比较。"
        ],
        "sourceIds": [
          "gridengine",
          "distance",
          "implementation"
        ],
        "examples": [
          {
            "label": "水平直线路径",
            "input": "CAT\nDOG",
            "output": "第一行可沿左→右读取 CAT",
            "explanation": "同一条路径方向保持不变；示例仅展示一条候选路径。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "每行网格须等长；本站忽略空白并转小写。最少字数用于筛选结果，直线模式最多 3600 格；若题面允许转弯，应选择相邻格模式。"
        ],
        "sourceIds": [
          "implementation",
          "gridengine",
          "distance"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:word-boggle",
    "capabilityIds": [
      "native:word-boggle"
    ],
    "relatedIds": [
      "native:word-boggle"
    ],
    "topicGroup": "text-language",
    "title": "相邻格转弯搜词",
    "summary": "通过相邻格组合字母，每条路径同时记住已经用过的格子。",
    "aliases": [
      "Boggle",
      "相邻格搜词"
    ],
    "sources": [
      {
        "id": "gridengine",
        "title": "网格搜词：八方向和相邻路径",
        "publisher": "cipher-machine 作者源码",
        "url": "/vendor/hunt/cipher-machine/word-search/wordSearch.js",
        "language": "en",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "distance",
        "title": "编辑距离的定义与动态规划矩阵",
        "publisher": "东北大学学报（自然科学版）",
        "url": "https://xuebao.neu.edu.cn/natural/article/html/2019-11-1543.htm",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "§ 1；§ 1.1"
      },
      {
        "id": "implementation",
        "title": "本站 相邻格转弯搜词 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:word-boggle"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Boggle 类型搜索每一步可走到相邻格，因此能够转弯。深度优先搜索同时记录当前词前缀和已使用位置，避免在同一条词路径中无限循环或重复使用同一格。",
          "字库前缀树仍可剪枝：没有任何词以当前字母串开头时立即退回。分支比直线搜索多得多，所以本站相邻格模式限制最多 100 格。"
        ],
        "sourceIds": [
          "gridengine",
          "distance",
          "implementation"
        ],
        "examples": [
          {
            "label": "转弯候选",
            "input": "CA\nXT",
            "output": "C(左上) → A(右上) → T(右下) 组成 CAT",
            "explanation": "路径转一次弯且三个格子各使用一次。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "这项路径规则是本工具引擎的约定，不保证所有 Boggle 变体的 Qu、最小长度与计分都相同。词长筛选由当前最少字数参数决定。"
        ],
        "sourceIds": [
          "implementation",
          "gridengine",
          "distance"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:words-fuzzy",
    "capabilityIds": [
      "native:words-fuzzy"
    ],
    "relatedIds": [
      "native:words-fuzzy"
    ],
    "topicGroup": "text-language",
    "title": "相似词查询",
    "summary": "通过插入、删除和替换的最小次数度量与目标词的差异。",
    "aliases": [
      "编辑距离查词",
      "模糊查词"
    ],
    "sources": [
      {
        "id": "distance",
        "title": "编辑距离的定义与动态规划矩阵",
        "publisher": "东北大学学报（自然科学版）",
        "url": "https://xuebao.neu.edu.cn/natural/article/html/2019-11-1543.htm",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "§ 1；§ 1.1"
      },
      {
        "id": "wordengine",
        "title": "英文字库查询：通配符、字母计数和编辑距离",
        "publisher": "cipher-machine 作者源码",
        "url": "/vendor/hunt/cipher-machine/one-word/one-word.js",
        "language": "en",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 相似词查询 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:words-fuzzy"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "编辑距离定义为把一个字符串改成另一个的最少编辑操作数；单次插入、删除或替换通常各计 1。cat→cut 只需替换 a，距离为 1。",
          "本站对输入转小写后，在英文字库中计算候选距离，保留不超过当前阈值的词。这可以找到拼写相近项，但不衡量意思相近或发音相近。"
        ],
        "sourceIds": [
          "distance",
          "wordengine",
          "implementation"
        ],
        "examples": [
          {
            "label": "三种单步差异",
            "input": "cat，阈值 1",
            "output": "cut：替换；cats：插入；at：删除",
            "explanation": "这三种变化都只需一个单位成本操作。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "相邻字母交换通常需要两次编辑，不是自动算一次。阈值越大候选越多；结果仍受字库范围和输出上限限制。"
        ],
        "sourceIds": [
          "implementation",
          "distance",
          "wordengine"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:words-regex",
    "capabilityIds": [
      "native:words-regex"
    ],
    "relatedIds": [
      "native:words-regex"
    ],
    "topicGroup": "text-language",
    "title": "正则表达式查词",
    "summary": "用正则表达式描述位置、字符集合和重复规则，再逐词匹配。",
    "aliases": [
      "regex 查词"
    ],
    "sources": [
      {
        "id": "regex",
        "title": "正则表达式：模式与标志",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "wordengine",
        "title": "英文字库查询：通配符、字母计数和编辑距离",
        "publisher": "cipher-machine 作者源码",
        "url": "/vendor/hunt/cipher-machine/one-word/one-word.js",
        "language": "en",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 正则表达式查词 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:words-regex"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "^ 与 $ 表示字符串边界，字符类如 [aeiou] 表示其中任一字符，{2} 表示前项重复两次。^c[aeiou]t$ 只接受三个字符且中间为元音的 c?t 结构。",
          "本站把输入转为小写并对所选词库逐词执行正则测试；不加锚点时可能只匹配词中一段。表达式写在模式输入框中，不需要再包 /.../。"
        ],
        "sourceIds": [
          "regex",
          "wordengine",
          "implementation"
        ],
        "examples": [
          {
            "label": "明确整词边界",
            "input": "^c[aeiou]t$",
            "output": "cat、cot、cut 等符合该形状的词",
            "explanation": "锚点防止在较长单词内部只匹配到一段。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "本站词库正则运行于可停止的工作线程，复杂回溯可能仍耗时。这里与 CyberChef 扩展正则入口不是完全相同的语法和标志集合。"
        ],
        "sourceIds": [
          "implementation",
          "regex",
          "wordengine"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-native:words-chinese",
    "capabilityIds": [
      "native:words-chinese"
    ],
    "relatedIds": [
      "native:words-chinese"
    ],
    "topicGroup": "text-language",
    "title": "中文查词",
    "summary": "用已知字位、拼音或部件条件检索随附中文词库。",
    "aliases": [
      "中文词库",
      "中文填字"
    ],
    "sources": [
      {
        "id": "chinesesearch",
        "title": "中文字库的部件、拼音与词形查询",
        "publisher": "chinese-puzzle 作者源码",
        "url": "/vendor/hunt/chinese-puzzle/search.js",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "pinyinapi",
        "title": "拼音转换、声母韵母和音调参数",
        "publisher": "pinyin-pro 作者文档",
        "url": "https://pinyin-pro.cn/use/pinyin.html",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站 中文查词 的实现规则",
        "publisher": "迷雾工具箱",
        "url": "/hunt-tools.js",
        "language": "zh-CN",
        "kind": "implementation",
        "locator": "native:words-chinese"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "中文填字查询需要区分词语长度、固定字位、同音条件和字形条件。读音相同不能保证字形相同，字形部件相同也不意味着含义相同。",
          "本站调用 chinese-puzzle 的规则解析与字库搜索，把查询条件转为字位、拼音和部件约束后寻找已收录词语。精确符号语法以该模块的使用说明和作者源码为准。"
        ],
        "sourceIds": [
          "chinesesearch",
          "pinyinapi",
          "implementation"
        ],
        "examples": [
          {
            "label": "固定字位的基本思路",
            "input": "已知两字词的首字为“中”",
            "output": "只保留首字为中的两字候选，例如“中国”",
            "explanation": "这是字位筛选的规则演算；具体查询符号以入口说明为准。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "这是条件检索，不是自然语言问答或全网百科搜索。生僻词、专名、地区词汇未收录时需要外部资料继续核对。"
        ],
        "sourceIds": [
          "implementation",
          "chinesesearch",
          "pinyinapi"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Diff",
    "capabilityIds": [
      "op:Diff"
    ],
    "relatedIds": [
      "op:Diff"
    ],
    "topicGroup": "text-language",
    "title": "比较差异",
    "summary": "先按指定单位拆分两份输入，再标出匹配部分和差异部分。",
    "aliases": [
      "diff",
      "文本差异"
    ],
    "sources": [
      {
        "id": "split",
        "title": "String.prototype.split()：分隔符与 UTF-16 边界",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/split",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Diff"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "比较差异需要两份输入。本站以“样本分隔符”划分样本，再按字符、词、行等选定单位比较；换行是样本分隔符还是文本内容取决于参数。",
          "保留部分在两边相同，新增部分只在第二份中，删除部分只在第一份中。词级和字符级会产生不同粒度的结果，JSON 模式又以结构化数据比较。"
        ],
        "sourceIds": [
          "split",
          "implementation"
        ],
        "examples": [
          {
            "label": "字符级比较",
            "input": "CAT\n\nCUT；样本分隔符为两个换行",
            "output": "C 与 T 保留；第一份的 A 删除；第二份的 U 新增",
            "explanation": "演示字符差异，显示颜色与布局由当前界面决定。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "差异显示不是完整文件版本管理，也不表示两段代码执行效果不同。忽略空白选项会主动减少某些差异，解谜中空白有意义时要关闭。"
        ],
        "sourceIds": [
          "implementation",
          "split"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Head",
    "capabilityIds": [
      "op:Head"
    ],
    "relatedIds": [
      "op:Head"
    ],
    "topicGroup": "text-language",
    "title": "保留开头",
    "summary": "按分隔符切成记录后，正数保留前段，负数排除末段。",
    "aliases": [
      "head",
      "文本截取"
    ],
    "sources": [
      {
        "id": "split",
        "title": "String.prototype.split()：分隔符与 UTF-16 边界",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/split",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "slice",
        "title": "String.prototype.slice()：位置与截取范围",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/slice",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Head"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Head 默认将换行视为记录边界，正数 N 取前 N 条记录。分隔符也可设为逗号、空格或单个字符，此时取的是字段或字符而不是文本行。",
          "负数 −N 在本入口中表示保留除最后 N 条之外的全部记录。取前 2 条与去掉后 2 条只有在总数恰好 4 时才碰巧相同。"
        ],
        "sourceIds": [
          "split",
          "slice",
          "implementation"
        ],
        "examples": [
          {
            "label": "前三条中的前两条",
            "input": "A\nB\nC；N=2；分隔符 LF",
            "output": "A\nB",
            "explanation": "先分成三个记录，再选前两个。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "边界由所选 LF 或 CRLF 等分隔符确定；选错分隔符会把多行当成一条。请区分读取记录数和字节长度。"
        ],
        "sourceIds": [
          "implementation",
          "split",
          "slice"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Tail",
    "capabilityIds": [
      "op:Tail"
    ],
    "relatedIds": [
      "op:Tail"
    ],
    "topicGroup": "text-language",
    "title": "保留结尾",
    "summary": "按分隔符建立记录列表，再从末端确定保留范围。",
    "aliases": [
      "tail",
      "取末尾"
    ],
    "sources": [
      {
        "id": "split",
        "title": "String.prototype.split()：分隔符与 UTF-16 边界",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/split",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "slice",
        "title": "String.prototype.slice()：位置与截取范围",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/slice",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Tail"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Tail 默认按换行保留末 N 行。可选其他分隔符，把末尾字段或字符当作记录；它不会自动识别哪一部分是文件页脚。",
          "负数参数在本入口中选择从给定行之后的记录；请核对参数说明，不能把负值解释成“负数行数”。正数从结尾倒数，但输出仍保持原顺序。"
        ],
        "sourceIds": [
          "split",
          "slice",
          "implementation"
        ],
        "examples": [
          {
            "label": "三行中的后两行",
            "input": "A\nB\nC；N=2；分隔符 LF",
            "output": "B\nC",
            "explanation": "定位末两个记录后，按原来的 B、C 顺序输出。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "与 Head 一样，LF 与 CRLF 的选择决定分组。包含相同字面符号的内容也可能被当成分隔符，先确认记录边界。"
        ],
        "sourceIds": [
          "implementation",
          "split",
          "slice"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Levenshtein%20Distance",
    "capabilityIds": [
      "op:Levenshtein%20Distance"
    ],
    "relatedIds": [
      "op:Levenshtein%20Distance"
    ],
    "topicGroup": "text-language",
    "title": "编辑距离",
    "summary": "对两个前缀比较插入、删除和替换路径，逐格选择成本最小者。",
    "aliases": [
      "Levenshtein",
      "动态规划",
      "编辑距离"
    ],
    "sources": [
      {
        "id": "distance",
        "title": "编辑距离的定义与动态规划矩阵",
        "publisher": "东北大学学报（自然科学版）",
        "url": "https://xuebao.neu.edu.cn/natural/article/html/2019-11-1543.htm",
        "language": "zh-CN",
        "kind": "author-spec",
        "locator": "§ 1；§ 1.1"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Levenshtein Distance"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "令 D[i,j] 为两字符串前 i、j 个字符的最小编辑成本。边界为空串时成本是另一串长度；每格比较插入、删除与替换三种前驱的累计成本。",
          "单位成本下：D[i,j]=min(D[i−1,j]+1, D[i,j−1]+1, D[i−1,j−1]+[aᵢ≠bⱼ])。本站也允许分别设置插入、删除和替换成本，分隔符负责划分两份样本。"
        ],
        "sourceIds": [
          "distance",
          "implementation"
        ],
        "examples": [
          {
            "label": "默认单位成本",
            "input": "cat\ncut；样本分隔符 LF",
            "output": "1",
            "explanation": "仅把 a 替换为 u，成本 1；其余位置相同。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "距离不是相似百分比，也不衡量词义；不同成本设置会改变结果。相邻字符交换没有独立操作，需要由允许的三类编辑组合实现。"
        ],
        "sourceIds": [
          "implementation",
          "distance"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Find%20%2F%20Replace",
    "capabilityIds": [
      "op:Find%20%2F%20Replace"
    ],
    "relatedIds": [
      "op:Find%20%2F%20Replace"
    ],
    "topicGroup": "text-language",
    "title": "查找与替换",
    "summary": "查找模式决定匹配范围，替换串可以引用捕获的内容。",
    "aliases": [
      "replace",
      "捕获组替换"
    ],
    "sources": [
      {
        "id": "replace",
        "title": "String.prototype.replace()：替换与捕获组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "regex",
        "title": "正则表达式：模式与标志",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Find / Replace"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "普通查找以字符序列匹配；正则模式可用量词、字符类和捕获组。是否全局匹配决定替换第一个还是全部匹配项，忽略大小写则改变比较方式。",
          "替换串中的 $1 等表示被括号捕获的部分；扩展字符串输入另支持换行、制表符和 \\x 字节写法。正则元字符和扩展字符串转义处于不同处理层。"
        ],
        "sourceIds": [
          "replace",
          "regex",
          "implementation"
        ],
        "examples": [
          {
            "label": "正则捕获组",
            "input": "输入 A12 B34；查找 ([A-Z])(\\d+)；替换 $2-$1；全局",
            "output": "12-A 34-B",
            "explanation": "第 1 组保存字母，第 2 组保存数字，替换时交换次序。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "替换前应核对模式类型和标志。句点 . 在正则中通常不是字面句点；若要查找实际点号，应使用转义或普通字符串模式。"
        ],
        "sourceIds": [
          "implementation",
          "replace",
          "regex"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20Case%20Insensitive%20Regex",
    "capabilityIds": [
      "pair:To%20Case%20Insensitive%20Regex"
    ],
    "relatedIds": [
      "pair:To%20Case%20Insensitive%20Regex"
    ],
    "topicGroup": "text-language",
    "title": "大小写不敏感正则转换",
    "summary": "展开字母为两种大小写的字符类，反向收拢无法恢复原始大小写。",
    "aliases": [
      "case-insensitive regex",
      "正则大小写"
    ],
    "sources": [
      {
        "id": "regexflags",
        "title": "RegExp.prototype.ignoreCase：忽略大小写",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/ignoreCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "regexclass",
        "title": "正则字符类：[abc] 与字符范围",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "To Case Insensitive Regex / From Case Insensitive Regex"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "常规忽略大小写由 i 标志实现；当目标环境没有这个标志时，可把字面字母 a 改成 [aA]，让同一位置接受两种形式。",
          "本站双向入口把适合的字母选择展开或收拢。收拢 [aA] 时已经没有哪种大小写最初写在模式中的信息，所以不能保证恢复原作者的原始文本。"
        ],
        "sourceIds": [
          "regexflags",
          "regexclass",
          "implementation"
        ],
        "examples": [
          {
            "label": "ASCII 模式展开",
            "input": "cat",
            "output": "[cC][aA][tT]",
            "explanation": "每一位置都可选两种大小写；本例说明 ASCII 范围规则。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "Unicode 大小写折叠比 A–Z 成对替换复杂，某些环境和字符不能靠简单展开等价实现。请保留原模式并针对目标正则引擎核对。"
        ],
        "sourceIds": [
          "implementation",
          "regexflags",
          "regexclass"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Reverse",
    "capabilityIds": [
      "op:Reverse"
    ],
    "relatedIds": [
      "op:Reverse"
    ],
    "topicGroup": "text-language",
    "title": "反转",
    "summary": "反转的是选定单元的顺序，单元定义决定结果。",
    "aliases": [
      "reverse",
      "倒序"
    ],
    "sources": [
      {
        "id": "reverse",
        "title": "Array.prototype.reverse()：顺序反转",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "iterator",
        "title": "字符串迭代器：按 Unicode 码位迭代",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Reverse"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "选字节时，字节排列倒序，字节内部的 8 位不变；选字符时按字符单元重排；选行时行序反转，行内内容保留。ASCII 单字符恰好一字节，所以简单例子可能看不出区别。",
          "多字节编码的单个字符由几个字节组成。按字节反转 UTF-8 中文会打乱编码，不能期待仍显示同一字符；按行反转则只交换整行位置。"
        ],
        "sourceIds": [
          "reverse",
          "iterator",
          "implementation"
        ],
        "examples": [
          {
            "label": "按行反转",
            "input": "AB\nCD；单位 Line",
            "output": "CD\nAB",
            "explanation": "行次序交换，AB 与 CD 的内部顺序不变。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "先选处理单位再运行。对复合 Unicode 字形还要区分码位和字素簇；必要时检查结果字节或先规范化。"
        ],
        "sourceIds": [
          "implementation",
          "reverse",
          "iterator"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Split",
    "capabilityIds": [
      "op:Split"
    ],
    "relatedIds": [
      "op:Split"
    ],
    "topicGroup": "text-language",
    "title": "分割",
    "summary": "先删除切分分隔符形成记录，再用连接分隔符把记录串联。",
    "aliases": [
      "split",
      "分隔符"
    ],
    "sources": [
      {
        "id": "split",
        "title": "String.prototype.split()：分隔符与 UTF-16 边界",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/split",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "join",
        "title": "Array.prototype.join()：元素连接与分隔符",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/join",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Split"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "切分分隔符定位边界，连接分隔符决定新输出。输入 a,b,c 用逗号切分形成 a、b、c 三段，再以换行连接可把 CSV 样式的一行变成三行。",
          "首尾分隔符和连续分隔符可能产生空字段，空字段仍会影响记录位置。这个入口是字符串分割，不会处理 CSV 引号中的逗号语义。"
        ],
        "sourceIds": [
          "split",
          "join",
          "implementation"
        ],
        "examples": [
          {
            "label": "分隔符更换",
            "input": "a,b,c；切分 ,；连接 LF",
            "output": "a\nb\nc",
            "explanation": "内容未编码，只改变了三段内容之间的连接字符。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "如果引号允许字段内包含分隔符，应选择真正的 CSV 解析入口。空分隔符的字符拆分还可能受 UTF-16 码元影响。"
        ],
        "sourceIds": [
          "implementation",
          "split",
          "join"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Hamming%20Distance",
    "capabilityIds": [
      "op:Hamming%20Distance"
    ],
    "relatedIds": [
      "op:Hamming%20Distance"
    ],
    "topicGroup": "text-language",
    "title": "汉明距离",
    "summary": "只比较等长样本中对应位置，不通过插入或删除对齐。",
    "aliases": [
      "Hamming",
      "码距"
    ],
    "sources": [
      {
        "id": "hamming",
        "title": "HammingDistance：等长序列不一致的位置数",
        "publisher": "Wolfram 官方中文参考",
        "url": "https://reference.wolfram.com/language/ref/HammingDistance.html.zh",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Hamming Distance"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "汉明距离数对应位置不一致的元素。二进制位模式下每位不同加 1，字节模式下一个字节即使不同多位也只计一个字节差异。",
          "计算按位距离可先把两字节 XOR，再统计 1 的位数。0F 与 F0 的 XOR 是 FF，八位都不同；按字节比较这仍只是一个不同字节。"
        ],
        "sourceIds": [
          "hamming",
          "implementation"
        ],
        "examples": [
          {
            "label": "位与字节计数",
            "input": "十六进制 0F 与 F0",
            "output": "Bit：8；Byte：1",
            "explanation": "两个样本均为一字节；按位单位逐位比较，按字节单位逐字节比较。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "经典汉明距离要求等长且位置已对齐。需要允许插入删除或处理长短不同文本时，编辑距离回答的是另一种问题。"
        ],
        "sourceIds": [
          "implementation",
          "hamming"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Swap%20case",
    "capabilityIds": [
      "op:Swap%20case"
    ],
    "relatedIds": [
      "op:Swap%20case"
    ],
    "topicGroup": "text-language",
    "title": "交换大小写",
    "summary": "大写变小写、小写变大写，无大小写区别的字符按规则保留。",
    "aliases": [
      "swap case"
    ],
    "sources": [
      {
        "id": "upper",
        "title": "String.prototype.toUpperCase()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "lower",
        "title": "String.prototype.toLowerCase()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Swap case"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "大小写变换依据字符的大小写属性，不是任意字节减 32。ASCII 字母的映射简单，但 Unicode 的大小写规则可能涉及多个字符或语言差异。",
          "这个入口对每个字符交换大小写。数字、常见标点和汉字没有对应的大小写字母，通常不会改变；它不把整串统一成全大写。"
        ],
        "sourceIds": [
          "upper",
          "lower",
          "implementation"
        ],
        "examples": [
          {
            "label": "ASCII 交换",
            "input": "aB3中",
            "output": "Ab3中",
            "explanation": "a→A、B→b；3 和中没有本例的大小写映射。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "大小写映射不总是一一可逆，尤其在超出 ASCII 的文字中。用于密码或精确数据时要对照转换前后的长度与码位。"
        ],
        "sourceIds": [
          "implementation",
          "upper",
          "lower"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Alternating%20Caps",
    "capabilityIds": [
      "op:Alternating%20Caps"
    ],
    "relatedIds": [
      "op:Alternating%20Caps"
    ],
    "topicGroup": "text-language",
    "title": "交替大小写",
    "summary": "按顺序给字母应用交替的大小写状态。",
    "aliases": [
      "studly caps",
      "交替大写"
    ],
    "sources": [
      {
        "id": "upper",
        "title": "String.prototype.toUpperCase()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "lower",
        "title": "String.prototype.toLowerCase()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Alternating Caps"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "交替大小写是输出样式：字母沿序列交替采用小写与大写。它改变的是字形大小写，不是字母在字母表中的编号，也不提供密码强度。",
          "本站操作生成自身约定的交替排列，不能用它恢复原稿有意安排的大小写线索。非字母字符的参与方式需要按当前引擎核对。"
        ],
        "sourceIds": [
          "upper",
          "lower",
          "implementation"
        ],
        "examples": [
          {
            "label": "交替样式演算",
            "input": "abcd",
            "output": "aBcD",
            "explanation": "按小写起步、下一位大写的交替样式，展示字母不变而大小写变化。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "先保留原文再改变大小写。若原文中的大小写代表二进制或培根密码，这种处理会破坏线索。"
        ],
        "sourceIds": [
          "implementation",
          "upper",
          "lower"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Fuzzy%20Match",
    "capabilityIds": [
      "op:Fuzzy%20Match"
    ],
    "relatedIds": [
      "op:Fuzzy%20Match"
    ],
    "topicGroup": "text-language",
    "title": "模糊匹配",
    "summary": "允许跳过目标中的字符，给连续匹配、分隔位置和词首加分。",
    "aliases": [
      "子序列",
      "fuzzy match"
    ],
    "sources": [
      {
        "id": "filter",
        "title": "Array.prototype.filter()：保留通过条件的元素",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Fuzzy Match"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "该入口的模糊匹配寻找按顺序出现的搜索字符，而不是必须找到连续子串。例如 dpan 可对应 Don’t Panic 中的 D、P、a、n。",
          "连续字符、分隔符后字符、驼峰边界与首字母有不同加分；领先字符及未匹配字符可能扣分。调整分数权重会改变哪个候选更突出。"
        ],
        "sourceIds": [
          "filter",
          "implementation"
        ],
        "examples": [
          {
            "label": "子序列位置",
            "input": "目标 Dont Panic；搜索 dpan",
            "output": "D + Pan 可以按顺序命中",
            "explanation": "中间字符允许跳过，连续的 Pan 还能获得连续匹配奖励。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "这里的分数不是概率、编辑距离或词义相似度；它主要用于检索。搜索字符必须依照实现要求按顺序出现。"
        ],
        "sourceIds": [
          "implementation",
          "filter"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Sort",
    "capabilityIds": [
      "op:Sort"
    ],
    "relatedIds": [
      "op:Sort"
    ],
    "topicGroup": "text-language",
    "title": "排序",
    "summary": "先分出记录，再用所选比较规则排列它们。",
    "aliases": [
      "排序",
      "字典序",
      "数值序"
    ],
    "sources": [
      {
        "id": "sort",
        "title": "Array.prototype.sort()：排序与比较函数",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Sort"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "字符串比较逐字符看大小，数值比较则把记录解释为数。因此字典序中 10 可以排在 2 前，数值序中 2 排在 10 前。",
          "本站可选大小写敏感或不敏感的字母序、数值、十六进制数、长度和 IPv4 顺序。逆序选项翻转比较方向，分隔符仍决定一条记录是什么。"
        ],
        "sourceIds": [
          "sort",
          "implementation"
        ],
        "examples": [
          {
            "label": "两种顺序",
            "input": "2\n10",
            "output": "字典序：10, 2；数值序：2, 10",
            "explanation": "数值大小与字符逐位比较使用不同的比较规则。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "本入口的 IP 顺序只支持 IPv4。排序会改变题面原顺序；对数字格式、前导零和无效字段应先确认其解释方式。"
        ],
        "sourceIds": [
          "implementation",
          "sort"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Unique",
    "capabilityIds": [
      "op:Unique"
    ],
    "relatedIds": [
      "op:Unique"
    ],
    "topicGroup": "text-language",
    "title": "去重",
    "summary": "把内容相等的记录合成一个，必要时附出现次数。",
    "aliases": [
      "distinct",
      "去重"
    ],
    "sources": [
      {
        "id": "set",
        "title": "Set：唯一值与插入顺序",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Unique"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "先按分隔符建立记录，再比较记录内容；相同记录只保留一个。集合的“唯一”是内容相等，不是看起来类似或发音相同。",
          "开启显示计数可看到被合并的次数。去重前 A、A、B 共三条，去重后只剩 A、B 两种；总记录数与不同记录数是两个量。"
        ],
        "sourceIds": [
          "set",
          "implementation"
        ],
        "examples": [
          {
            "label": "逐行去重",
            "input": "A\nA\nB",
            "output": "A\nB",
            "explanation": "相同 A 合成一项，B 仍保留。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "空白和大小写是否已经处理会影响相等判断。若重复次数承载线索，应先保存计数，不能直接删去重复。"
        ],
        "sourceIds": [
          "implementation",
          "set"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Filter",
    "capabilityIds": [
      "op:Filter"
    ],
    "relatedIds": [
      "op:Filter"
    ],
    "topicGroup": "text-language",
    "title": "筛选",
    "summary": "对每条记录测试模式，保留整个满足条件的记录。",
    "aliases": [
      "过滤",
      "invert"
    ],
    "sources": [
      {
        "id": "filter",
        "title": "Array.prototype.filter()：保留通过条件的元素",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "regex",
        "title": "正则表达式：模式与标志",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Filter"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "筛选先按分隔符切成记录，再用正则测试。测试为真时保留整条记录，而不是只输出其中被匹配的字母。",
          "反转条件选项保留测试不成立的记录。a1、b2 两行以 ^a 为条件时只保留 a1，反转则只保留 b2。"
        ],
        "sourceIds": [
          "filter",
          "regex",
          "implementation"
        ],
        "examples": [
          {
            "label": "按行条件",
            "input": "a1\nb2；正则 ^a",
            "output": "a1",
            "explanation": "^a 匹配第一行开头，输出的是完整记录 a1。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "正则未加边界时，记录中任何地方命中即可通过；需要固定开头用 ^，需要完整记录匹配再加 $。分隔符选错会改变筛选单位。"
        ],
        "sourceIds": [
          "implementation",
          "filter",
          "regex"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Get%20All%20Casings",
    "capabilityIds": [
      "op:Get%20All%20Casings"
    ],
    "relatedIds": [
      "op:Get%20All%20Casings"
    ],
    "topicGroup": "text-language",
    "title": "生成全部大小写组合",
    "summary": "每个可变字母有两种选择，独立组合形成全部样式。",
    "aliases": [
      "大小写枚举",
      "2^n"
    ],
    "sources": [
      {
        "id": "upper",
        "title": "String.prototype.toUpperCase()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "lower",
        "title": "String.prototype.toLowerCase()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Get All Casings"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "在简单 ASCII 模型中，n 个可变字母各取大写或小写，共有 2ⁿ 种组合。这与单次转大写不同，它列举每个位置的选择。",
          "两字母 ab 依次选择 a/A 和 b/B，组成 ab、aB、Ab、AB。没有大小写变化的字符不会引入同等的新分支。"
        ],
        "sourceIds": [
          "upper",
          "lower",
          "implementation"
        ],
        "examples": [
          {
            "label": "两位置组合",
            "input": "ab",
            "output": "ab、aB、Ab、AB",
            "explanation": "2×2=4 个选择，列出的次序只是便于说明。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "长文本的组合量会快速增长，20 个独立位置已有 1,048,576 种。非 ASCII 大小写变换也可能改变长度，不能机械假设所有字符都恰有两种。"
        ],
        "sourceIds": [
          "implementation",
          "upper",
          "lower"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Shuffle",
    "capabilityIds": [
      "op:Shuffle"
    ],
    "relatedIds": [
      "op:Shuffle"
    ],
    "topicGroup": "text-language",
    "title": "随机打乱",
    "summary": "随机重排分隔出的元素，保留各元素出现次数。",
    "aliases": [
      "shuffle",
      "随机重排"
    ],
    "sources": [
      {
        "id": "sort",
        "title": "Array.prototype.sort()：排序与比较函数",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "set",
        "title": "Set：唯一值与插入顺序",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Shuffle"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "洗牌改变记录在列表中的位置，既不替换记录也不删除重复项。对 A、A、B 打乱后仍应有两个 A 和一个 B。",
          "分隔符决定随机重排的是行、字段还是字符。每次运行通常可能得到不同排列，不适合用结果顺序当稳定编号。"
        ],
        "sourceIds": [
          "sort",
          "set",
          "implementation"
        ],
        "examples": [
          {
            "label": "内容保持的不变量",
            "input": "A\nB\nC",
            "output": "一个可能结果：C\nA\nB",
            "explanation": "只展示可能排列，实际输出不保证是这个顺序。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "随机洗牌不是密码学安全随机源，也不是自动恢复正确题序。重复值会使多种内部置换显示成同一个可见结果。"
        ],
        "sourceIds": [
          "implementation",
          "sort",
          "set"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20IP%20addresses",
    "capabilityIds": [
      "op:Extract%20IP%20addresses"
    ],
    "relatedIds": [
      "op:Extract%20IP%20addresses"
    ],
    "topicGroup": "text-language",
    "title": "提取 IP 地址",
    "summary": "匹配 IPv4 的点分数字或 IPv6 的十六进制组，再输出候选。",
    "aliases": [
      "IPv4 提取",
      "IPv6 提取"
    ],
    "sources": [
      {
        "id": "uri",
        "title": "RFC 3986：URI 的 scheme、authority 与 path",
        "publisher": "IETF / 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc3986.html",
        "language": "en",
        "kind": "standard",
        "locator": "§ 3；§ 3.2"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract IP addresses"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "IPv4 常见文本由四个 0–255 的十进制数和点号组成；IPv6 的文本用十六进制组与冒号表示，并允许按规则省略连续零组。二者不是任意点号数字串。",
          "本站分别提供 IPv4、IPv6 开关，可再去掉本地 IPv4、排序或去重。它从文本中寻找地址形式，不访问地址也不测试地址当前是否可达。"
        ],
        "sourceIds": [
          "uri",
          "implementation"
        ],
        "examples": [
          {
            "label": "IPv4 文本形式",
            "input": "server=192.0.2.5",
            "output": "192.0.2.5",
            "explanation": "四组点分十进制构成地址候选；示例地址仅用于文档。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "连续更长数字串可能产生多个局部匹配，例如 1.2.3.4.5.6.7.8。结果必须回看原文边界；格式命中不证明它确实是通信地址。"
        ],
        "sourceIds": [
          "implementation",
          "uri"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20MAC%20addresses",
    "capabilityIds": [
      "op:Extract%20MAC%20addresses"
    ],
    "relatedIds": [
      "op:Extract%20MAC%20addresses"
    ],
    "topicGroup": "text-language",
    "title": "提取 MAC 地址",
    "summary": "识别六组两位十六进制数以及受支持的分隔符。",
    "aliases": [
      "MAC 提取",
      "网卡地址"
    ],
    "sources": [
      {
        "id": "mac",
        "title": "MAC 子层：48 bit 与十六进制表示",
        "publisher": "华为官方技术文档",
        "url": "https://info.support.huawei.com/hedex/api/pages/EDOC1100210440/AZK0901G/09/resources/dc/dc_fd_eth-basic_0010.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract MAC addresses"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "常见 Ethernet MAC 地址有 48 bit，即六字节、十二个十六进制数字。文本可以用冒号、短横线或点分组展示，同一字节值可有多种外观。",
          "本站提取操作按其支持的格式寻找候选，并可统计、排序和去重。不同显示格式的同一地址是否合并取决于是否先做格式规范化。"
        ],
        "sourceIds": [
          "mac",
          "implementation"
        ],
        "examples": [
          {
            "label": "六字节表示",
            "input": "src=00:11:22:33:44:55",
            "output": "00:11:22:33:44:55",
            "explanation": "六组各两位十六进制，合计 6×8=48 bit。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "形似 MAC 的串可能只是普通编号；不是所有分隔写法都会命中。提取结果也不能直接证明设备身份、制造商或全球唯一性。"
        ],
        "sourceIds": [
          "implementation",
          "mac"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20hashes",
    "capabilityIds": [
      "op:Extract%20hashes"
    ],
    "relatedIds": [
      "op:Extract%20hashes"
    ],
    "topicGroup": "text-language",
    "title": "提取哈希",
    "summary": "按十六进制字符和给定长度找候选，无法仅凭外观确认算法。",
    "aliases": [
      "hash 提取",
      "摘要长度"
    ],
    "sources": [
      {
        "id": "regexclass",
        "title": "正则字符类：[abc] 与字符范围",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract hashes"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "哈希摘要经常以十六进制呈现，每两个数字表示一个字节。因此 40 个十六进制字符代表 20 字节，64 个代表 32 字节；显示长度与字节长度不同。",
          "本站入口主要按哈希字符长度筛选疑似摘要。“全部哈希”扩大长度类别，并不运行原算法或验证原文；显示计数只统计匹配候选。"
        ],
        "sourceIds": [
          "regexclass",
          "implementation"
        ],
        "examples": [
          {
            "label": "长度演算",
            "input": "0123456789abcdef0123456789abcdef01234567",
            "output": "40 个十六进制字符 = 20 字节的疑似摘要",
            "explanation": "字符串满足形式条件，但没有原文与算法就不能证明它是哈希。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "相同长度可以对应不同摘要或随机 ID。也可能存在截断哈希、Base64 摘要与带前缀格式，不能靠一个正则确定算法。"
        ],
        "sourceIds": [
          "implementation",
          "regexclass"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Strings",
    "capabilityIds": [
      "op:Strings"
    ],
    "relatedIds": [
      "op:Strings"
    ],
    "topicGroup": "text-language",
    "title": "提取可打印字符串",
    "summary": "按选定字符宽度、字节序和可打印集合扫描连续片段。",
    "aliases": [
      "strings",
      "可打印文本"
    ],
    "sources": [
      {
        "id": "iterator",
        "title": "字符串迭代器：按 Unicode 码位迭代",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Strings"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "二进制数据可能混有文本字段。Strings 从输入中寻找达到最小长度的连续可打印字符，而不是把整个文件视为可读文本；控制字节会中断某些候选片段。",
          "本站可选单字节、16 位小端、16 位大端或全部模式，并分别限制 ASCII、Unicode、空字符终止等匹配集合。两个字节解释成一个 16 位单元时字节序影响字符值。"
        ],
        "sourceIds": [
          "iterator",
          "implementation"
        ],
        "examples": [
          {
            "label": "单字节 ASCII 片段",
            "input": "字节 00 41 42 43 44 00；最小长度 4",
            "output": "ABCD",
            "explanation": "41–44 是连续可打印 ASCII，前后 00 分隔这段文本。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "提取到的可读词可能是偶然字节组合；没有命中也不证明不存在文本，可能用了不同编码或压缩。它不会自动解析每种文件的字段结构。"
        ],
        "sourceIds": [
          "implementation",
          "iterator"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20dates",
    "capabilityIds": [
      "op:Extract%20dates"
    ],
    "relatedIds": [
      "op:Extract%20dates"
    ],
    "topicGroup": "text-language",
    "title": "提取日期",
    "summary": "先按年月日的位置与分隔符提取候选，再由语境判断日期含义。",
    "aliases": [
      "日期提取",
      "年月日"
    ],
    "sources": [
      {
        "id": "date",
        "title": "RFC 3339：日期、时间与时区",
        "publisher": "IETF / 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc3339.html",
        "language": "en",
        "kind": "standard",
        "locator": "§ 5.6"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract dates"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "本站支持 yyyy-mm-dd、dd/mm/yyyy 和 mm/dd/yyyy 等形式，分隔符可为斜线、短横线、句点或空格。日期书写顺序可能随地区不同而不同。",
          "正则可以限制某一字段的数字范围，但完整历法还需要判断月份天数、闰年和时区。仅匹配 02/03/2026 无法判断它表示 2 月 3 日还是 3 月 2 日。"
        ],
        "sourceIds": [
          "date",
          "implementation"
        ],
        "examples": [
          {
            "label": "无歧义的年月日",
            "input": "clue 2026-10-13",
            "output": "2026-10-13",
            "explanation": "四位年份放在最前能减少月日顺序歧义，但具体合法性仍需检查。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "提取入口不是完整日期合法性或传统历法查询。可能命中非日期编号或不真实的月日组合，应到历法工具或标准格式继续核验。"
        ],
        "sourceIds": [
          "implementation",
          "date"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20URLs",
    "capabilityIds": [
      "op:Extract%20URLs"
    ],
    "relatedIds": [
      "op:Extract%20URLs"
    ],
    "topicGroup": "text-language",
    "title": "提取网址",
    "summary": "识别带协议的 URI 结构，提取协议、主机和后续路径。",
    "aliases": [
      "URL 提取",
      "网址提取"
    ],
    "sources": [
      {
        "id": "uri",
        "title": "RFC 3986：URI 的 scheme、authority 与 path",
        "publisher": "IETF / 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc3986.html",
        "language": "en",
        "kind": "standard",
        "locator": "§ 3；§ 3.2"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract URLs"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "URI 可分 scheme、authority、path、query、fragment。网址常见 https://example.org/a?x=1#b 中，https 是方案，主机与路径属于不同字段。",
          "本站网址提取要求协议前缀，避免把大量普通词和点号串都视为网址。排序与去重只整理候选，不打开链接或检查远端响应。"
        ],
        "sourceIds": [
          "uri",
          "implementation"
        ],
        "examples": [
          {
            "label": "带协议的完整片段",
            "input": "see https://example.org/clue",
            "output": "https://example.org/clue",
            "explanation": "scheme 与路径一并保留；仅 example.org 属于较小的域名字段。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "并非所有合法 URI 都能被当前模式完整识别；末尾标点、括号和 Unicode 域名还需回看原文。缺协议的域名应使用域名提取入口。"
        ],
        "sourceIds": [
          "implementation",
          "uri"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20file%20paths",
    "capabilityIds": [
      "op:Extract%20file%20paths"
    ],
    "relatedIds": [
      "op:Extract%20file%20paths"
    ],
    "topicGroup": "text-language",
    "title": "提取文件路径",
    "summary": "按 Windows 或 UNIX 的路径形式寻找字符串，而不访问文件。",
    "aliases": [
      "文件路径提取",
      "UNC"
    ],
    "sources": [
      {
        "id": "path",
        "title": "Windows 文件路径：驱动器、目录与 UNC",
        "publisher": "Microsoft Learn 中文文档",
        "url": "https://learn.microsoft.com/zh-cn/dotnet/standard/io/file-path-formats",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract file paths"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Windows 路径常出现驱动器加反斜线，例如 C:\\clues\\note.txt；UNIX 路径常用 / 分隔目录。相对路径、UNC 与设备路径又有各自规则。",
          "本站可独立开启 Windows、UNIX 识别。它只是从文本提取形似路径的片段，结果不表示浏览器拥有这个路径对应的文件权限。"
        ],
        "sourceIds": [
          "path",
          "implementation"
        ],
        "examples": [
          {
            "label": "Windows 绝对路径",
            "input": "open C:\\clues\\note.txt",
            "output": "C:\\clues\\note.txt",
            "explanation": "驱动器、目录分隔符和文件名组成候选；提取不会读取磁盘。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "UNIX 模式更容易命中普通斜线文本。工具不保证覆盖所有操作系统合法路径或特殊字符，后续要按上下文核对边界。"
        ],
        "sourceIds": [
          "implementation",
          "path"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20email%20addresses",
    "capabilityIds": [
      "op:Extract%20email%20addresses"
    ],
    "relatedIds": [
      "op:Extract%20email%20addresses"
    ],
    "topicGroup": "text-language",
    "title": "提取邮箱地址",
    "summary": "按 @ 两侧结构找候选地址，再核对原文和合法规则。",
    "aliases": [
      "email 提取",
      "邮箱结构"
    ],
    "sources": [
      {
        "id": "email",
        "title": "RFC 5322：邮箱地址的 local-part 与 domain",
        "publisher": "IETF / 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc5322.html",
        "language": "en",
        "kind": "standard",
        "locator": "§ 3.4.1"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract email addresses"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "邮箱的基本 addr-spec 结构为 local-part@domain。左侧用于邮箱本地标识，右侧是域；完整邮件头中还可有显示名与尖括号包裹地址。",
          "本站从文本寻找支持的邮箱形式，并可统计、排序和去重。该操作不会发邮件、查账户是否存在或验证收件服务。"
        ],
        "sourceIds": [
          "email",
          "implementation"
        ],
        "examples": [
          {
            "label": "邮箱核心字段",
            "input": "联系 puzzle@example.org",
            "output": "puzzle@example.org",
            "explanation": "puzzle 是本地部分，example.org 是域；地址只用于示例。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "RFC 允许引号等复杂语法，国际化邮箱也有额外规则；简单提取模式不等于全标准解析器。形似邮箱的字符串可能只是示例或无效账户。"
        ],
        "sourceIds": [
          "implementation",
          "email"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Extract%20domains",
    "capabilityIds": [
      "op:Extract%20domains"
    ],
    "relatedIds": [
      "op:Extract%20domains"
    ],
    "topicGroup": "text-language",
    "title": "提取域名",
    "summary": "域名是 URI 主机部分的一种形式，提取时只保留名称。",
    "aliases": [
      "域名提取",
      "FQDN"
    ],
    "sources": [
      {
        "id": "uri",
        "title": "RFC 3986：URI 的 scheme、authority 与 path",
        "publisher": "IETF / 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc3986.html",
        "language": "en",
        "kind": "standard",
        "locator": "§ 3；§ 3.2"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Extract domains"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "https://example.org/a?x=1 中的 example.org 才是域名，/a 是路径，?x=1 是查询。域名由点分标签组成，标签与 URL 不是同一粒度。",
          "本站寻找完整域名候选，可选择支持某些 DNS 记录里出现的下划线，并可排序与去重。其结果不会查询 DNS 或证明这个域名已经注册。"
        ],
        "sourceIds": [
          "uri",
          "implementation"
        ],
        "examples": [
          {
            "label": "字段分离",
            "input": "https://example.org/a?x=1",
            "output": "example.org",
            "explanation": "协议、路径和参数被排除，只保留域名候选。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "纯数字编号、电子邮件内域名和正文中的点号串都可能影响提取。需要完整网址时不要把路径拼回去猜测，应选择 URL 提取入口。"
        ],
        "sourceIds": [
          "implementation",
          "uri"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Add%20line%20numbers",
    "capabilityIds": [
      "op:Add%20line%20numbers"
    ],
    "relatedIds": [
      "op:Add%20line%20numbers"
    ],
    "topicGroup": "text-language",
    "title": "添加行号",
    "summary": "每行编号为从零起的行序号 + 1 + Offset，编号与正文之间为一个空格。",
    "aliases": [
      "行号",
      "number lines"
    ],
    "sources": [
      {
        "id": "split",
        "title": "String.prototype.split()：分隔符与 UTF-16 边界",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/split",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "AddLineNumbers.run：编号偏移、补齐与空格分隔",
        "publisher": "CyberChef / GCHQ，固定 v11.5.0 作者源码",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/AddLineNumbers.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run(input,args)",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/operations/AddLineNumbers.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "本操作按 LF（换行符）拆分输入。若行序号 n 从 0 起，写入的编号是 n+1+Offset；Offset=0 的前两行编号为 1、2，Offset=1 则为 2、3。",
          "编号左侧用空格补到总行数的十进制位数，随后加一个空格连接原正文，再以 LF 连接各行。这个固定版本不在编号后添加冒号；编号偏移不会移动或修改行内原字符。"
        ],
        "sourceIds": [
          "split",
          "implementation"
        ],
        "examples": [
          {
            "label": "Offset=0 的固定输出",
            "input": "alpha\nbeta；Offset=0",
            "output": "1 alpha\n2 beta",
            "explanation": "两行的编号分别为 1、2，每个编号后跟一个空格；Offset=1 时同一输入输出为 2 alpha 和 3 beta。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "空行和末尾 LF 拆出的最后空记录也参与行数与编号计算。行号本身是新增文本，后续藏头、索引或哈希处理会把编号及其空格一起作为输入；需要保留原文时另存未编号版本。"
        ],
        "sourceIds": [
          "implementation",
          "split"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Pad%20lines",
    "capabilityIds": [
      "op:Pad%20lines"
    ],
    "relatedIds": [
      "op:Pad%20lines"
    ],
    "topicGroup": "text-language",
    "title": "填充文本行",
    "summary": "这个入口向每行的开头或结尾添加指定数量的字符。",
    "aliases": [
      "文本填充",
      "pad lines"
    ],
    "sources": [
      {
        "id": "pad",
        "title": "String.prototype.padStart()：长度与填充",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/padStart",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Pad lines"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "填充可有两种不同语义：补 N 个字符，或补到总长度 N。本站 Pad lines 的 Length 是添加数量；原行长度不会被扣除。",
          "选择 Start 将字符放在行前，End 放在行后；可把空格、零或其他明确字符作为填充内容。多字符填充会形成更长的实际字符串。"
        ],
        "sourceIds": [
          "pad",
          "implementation"
        ],
        "examples": [
          {
            "label": "开头添加两次 0",
            "input": "AB；Position=Start；Length=2；Character=0",
            "output": "00AB",
            "explanation": "增加两个字符，不是把总长度改成 2。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "不要把该参数误作固定宽度目标。填充会改变后续字符位置；密码学分组填充也有独立标准，不能用本入口随意补零代替。"
        ],
        "sourceIds": [
          "implementation",
          "pad"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Count%20occurrences",
    "capabilityIds": [
      "op:Count%20occurrences"
    ],
    "relatedIds": [
      "op:Count%20occurrences"
    ],
    "topicGroup": "text-language",
    "title": "统计出现次数",
    "summary": "按字面串或正则寻找匹配，次数与字符总数不是同一个量。",
    "aliases": [
      "出现次数",
      "count"
    ],
    "sources": [
      {
        "id": "replace",
        "title": "String.prototype.replace()：替换与捕获组",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "regex",
        "title": "正则表达式：模式与标志",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Count occurrences"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "字面串计数寻找完全相同的连续内容；正则计数则按模式匹配。比如文本 ababa 中 ab 在位置 1、3 各出现一次，共 2 次。",
          "搜索串可按所选类型解释转义或正则。单字符、多个字符和零长度模式的匹配规则不同，不能把所有计数都当作逐字符频率。"
        ],
        "sourceIds": [
          "replace",
          "regex",
          "implementation"
        ],
        "examples": [
          {
            "label": "非重叠的明确样例",
            "input": "ababa；搜索普通字符串 ab",
            "output": "2",
            "explanation": "两次 ab 互不重叠，分别占第 1–2、3–4 位。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "重叠子串是否重复计算要核对实现的匹配推进方式。空模式和大小写条件可能改变结果，正式统计应注明所用模式。"
        ],
        "sourceIds": [
          "implementation",
          "replace",
          "regex"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Wrap",
    "capabilityIds": [
      "op:Wrap"
    ],
    "relatedIds": [
      "op:Wrap"
    ],
    "topicGroup": "text-language",
    "title": "文本换行",
    "summary": "按给定宽度切分长行，以便观察固定长度块或改善阅读。",
    "aliases": [
      "wrap",
      "固定宽度"
    ],
    "sources": [
      {
        "id": "split",
        "title": "String.prototype.split()：分隔符与 UTF-16 边界",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/split",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Wrap"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Wrap 使用字符宽度参数在文本中插入换行。它不同于浏览器自动视觉换行：输出实际多出换行字符，会影响后续数据处理。",
          "固定宽度适合检查编码分组，如把一长串按每 8 位换行观察字节。但分组宽度仍需题面或格式依据，不能任意试到看似可读就认定正确。"
        ],
        "sourceIds": [
          "split",
          "implementation"
        ],
        "examples": [
          {
            "label": "ASCII 三字符分组",
            "input": "ABCDEF；Line Width=3",
            "output": "ABC\nDEF",
            "explanation": "本例按三个 ASCII 字符一组展示；输出中出现真实换行。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "字符宽度与显示像素、全角字宽和字节数量不等。空白处理及已有换行会影响实际输出，应保留原串对照。"
        ],
        "sourceIds": [
          "implementation",
          "split"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Remove%20ANSI%20Escape%20Codes",
    "capabilityIds": [
      "op:Remove%20ANSI%20Escape%20Codes"
    ],
    "relatedIds": [
      "op:Remove%20ANSI%20Escape%20Codes"
    ],
    "topicGroup": "text-language",
    "title": "移除 ANSI 转义序列",
    "summary": "删除 ESC 引导的终端控制序列，留下可读文字。",
    "aliases": [
      "ANSI",
      "ESC",
      "终端控制码"
    ],
    "sources": [
      {
        "id": "ansi",
        "title": "控制台虚拟终端序列：ESC、CSI 与 SGR",
        "publisher": "Microsoft Learn 中文文档",
        "url": "https://learn.microsoft.com/zh-cn/windows/console/console-virtual-terminal-sequences",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "文本格式；输出序列"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Remove ANSI Escape Codes"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "终端色彩和游标动作可编码为控制序列。CSI 通常以 ESC(1B) 和 [ 开始，SGR 以 m 结束；ESC[31m 常设置红色，ESC[0m 重置样式。",
          "删除这些序列使日志不再夹杂颜色控制字符。控制序列本来可能移动游标或擦除显示，因此纯删除不等于模拟终端最终画面。"
        ],
        "sourceIds": [
          "ansi",
          "implementation"
        ],
        "examples": [
          {
            "label": "去掉 SGR",
            "input": "\\x1b[31mRED\\x1b[0m（\\x1b 表示真实 ESC 字节）",
            "output": "RED",
            "explanation": "红色和重置控制字被移除，正文三个字母保留。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "该入口不是完整终端模拟器，也不能恢复被终端控制动作覆盖的文字。某些非标准序列需要另行核对是否在删除范围中。"
        ],
        "sourceIds": [
          "implementation",
          "ansi"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Remove%20Diacritics",
    "capabilityIds": [
      "op:Remove%20Diacritics"
    ],
    "relatedIds": [
      "op:Remove%20Diacritics"
    ],
    "topicGroup": "text-language",
    "title": "移除变音符号",
    "summary": "将可分解的带调字母拆为基字母和组合符，再按规则移除附加符。",
    "aliases": [
      "accent",
      "去音调符号"
    ],
    "sources": [
      {
        "id": "unicode",
        "title": "Unicode 规范化：NFC、NFD、NFKC、NFKD",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/normalize",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "combining",
        "title": "Unicode：字符与组合附加符号",
        "publisher": "Unicode Consortium",
        "url": "https://www.unicode.org/faq/char_combmark.html",
        "language": "en",
        "kind": "standard",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Remove Diacritics"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "同一带音符字母可以表示为预组字符，也可以表示为基字母加组合附加符。é 能规范分解为 e(U+0065) 与重音符 U+0301。",
          "去变音符会把可分解组合的附加信息移除，让某些带调拉丁字母与基础字母便于比较。这是有损处理，区别词义或读音的标记可能丢失。"
        ],
        "sourceIds": [
          "unicode",
          "combining",
          "implementation"
        ],
        "examples": [
          {
            "label": "可分解重音",
            "input": "café",
            "output": "cafe",
            "explanation": "é 的重音信息被删除；输出不能再唯一恢复原来的 accent。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "并非每个特殊字母都能规范分解为一个基础字母；去变音也不等于音译所有文字。Unicode 组合下划线、删除线等亦可能被移除。"
        ],
        "sourceIds": [
          "implementation",
          "unicode",
          "combining"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Remove%20whitespace",
    "capabilityIds": [
      "op:Remove%20whitespace"
    ],
    "relatedIds": [
      "op:Remove%20whitespace"
    ],
    "topicGroup": "text-language",
    "title": "移除空白字符",
    "summary": "空格、回车、换行、制表和换页可分别选择，避免混为一种字符。",
    "aliases": [
      "空白",
      "CRLF",
      "TAB"
    ],
    "sources": [
      {
        "id": "jslex",
        "title": "JavaScript 词法：注释、空白和自动分号插入",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Lexical_grammar",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Remove whitespace"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "空格常用 U+0020，TAB 为 U+0009，CR 为 U+000D，LF 为 U+000A。看起来都像留白，但它们的编码与分隔意义不同。",
          "本站分别控制移除空格、CR、LF、TAB、FF；还提供句点删除，因为某些字节视图用句点表示不可打印字节。这些开关不是所有 Unicode 空白的同义项。"
        ],
        "sourceIds": [
          "jslex",
          "implementation"
        ],
        "examples": [
          {
            "label": "保留换行，只删空格",
            "input": "A B\nC D；只启用 Spaces",
            "output": "AB\nCD",
            "explanation": "原有 LF 保留，U+0020 空格被删除。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "如果空格分词、换行分记录或缩进具有语法意义，删除会改变含义。不能把显示用句点等同于原文件内的零字节。"
        ],
        "sourceIds": [
          "implementation",
          "jslex"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Remove%20line%20numbers",
    "capabilityIds": [
      "op:Remove%20line%20numbers"
    ],
    "relatedIds": [
      "op:Remove%20line%20numbers"
    ],
    "topicGroup": "text-language",
    "title": "移除行号",
    "summary": "寻找可识别的行首编号形式，再将辅助前缀去除。",
    "aliases": [
      "删除行号"
    ],
    "sources": [
      {
        "id": "regex",
        "title": "正则表达式：模式与标志",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Remove line numbers"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "行号通常由行首数字与固定分隔符组成。删除行号应只处理被识别为编号的前缀，而不是删除行内所有数字；正文日期和编码可能同样含数字。",
          "本站说明限定为可轻易检测的行号格式。前缀不一致、混合缩进或原文自然以数字开头时，需要先比较删除前后的每一行。"
        ],
        "sourceIds": [
          "regex",
          "implementation"
        ],
        "examples": [
          {
            "label": "辅助前缀的概念",
            "input": "1: alpha\n2: beta",
            "output": "识别为行号时仅保留 alpha 与 beta",
            "explanation": "本例说明目标效果；是否支持该前缀样式以实际检测结果为准。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "自动识别不能知道作者是否将行首数字作为谜题信息。保留原文，尤其不要对数字密文盲目移除编号。"
        ],
        "sourceIds": [
          "implementation",
          "regex"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Expand%20alphabet%20range",
    "capabilityIds": [
      "op:Expand%20alphabet%20range"
    ],
    "relatedIds": [
      "op:Expand%20alphabet%20range"
    ],
    "topicGroup": "text-language",
    "title": "展开字符范围",
    "summary": "按范围端点枚举中间字符，供字母表和匹配规则使用。",
    "aliases": [
      "字母范围",
      "alphabet range"
    ],
    "sources": [
      {
        "id": "regexclass",
        "title": "正则字符类：[abc] 与字符范围",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Expand alphabet range"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "范围是一种紧凑写法；ASCII a-z 表示从 a 到 z 的连续字符。展开时枚举端点及它们之间的字符，得到完整列表。",
          "本站还可在每个展开字符之间插入指定分隔符。这个结果是文本列表，不再是一个只有四个字符的 a-z 范围表达式。"
        ],
        "sourceIds": [
          "regexclass",
          "implementation"
        ],
        "examples": [
          {
            "label": "短范围",
            "input": "a-c；分隔符为空",
            "output": "abc",
            "explanation": "a、b、c 各占一个输出位置，短横线不属于最终字母表。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "字符范围依编码顺序，不等于自然语言字母顺序；[A-z] 还可能包含 Z 与 a 之间的标点。用于自定义字母表时应核对枚举集合。"
        ],
        "sourceIds": [
          "implementation",
          "regexclass"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Regular%20expression",
    "capabilityIds": [
      "op:Regular%20expression"
    ],
    "relatedIds": [
      "op:Regular%20expression"
    ],
    "topicGroup": "text-language",
    "title": "正则表达式",
    "summary": "用模式规定可接受字符与位置，匹配结果可显示整段或捕获字段。",
    "aliases": [
      "regex",
      "捕获组",
      "量词"
    ],
    "sources": [
      {
        "id": "regex",
        "title": "正则表达式：模式与标志",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "regexclass",
        "title": "正则字符类：[abc] 与字符范围",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Regular expression"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "正则表达式由字面字符和元字符组成。\\d 匹配数字字符，+ 要求前项一次或多次，括号建立捕获组；^ 和 $ 约束边界，标志再改变匹配行为。",
          "本站可选择大小写、逐行边界、点号跨行及 Unicode 相关选项，并可输出命中列表或捕获组。该入口采用扩展语法，不能假定与每个语言的正则方言完全一致。"
        ],
        "sourceIds": [
          "regex",
          "regexclass",
          "implementation"
        ],
        "examples": [
          {
            "label": "数字段提取",
            "input": "输入 key42door7；模式 \\d+",
            "output": "42\n7",
            "explanation": "+ 让相邻数字组成一次匹配；选择命中列表时得到两个数字段。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "正则是形式匹配，不能天然验证日期存在、网址可达或某串一定是某算法密文。复杂回溯可能很慢，表达式应先用小样本核对。"
        ],
        "sourceIds": [
          "implementation",
          "regex",
          "regexclass"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:To%20Upper%20case",
    "capabilityIds": [
      "op:To%20Upper%20case"
    ],
    "relatedIds": [
      "op:To%20Upper%20case"
    ],
    "topicGroup": "text-language",
    "title": "转大写",
    "summary": "按作用范围将字母映射为对应大写形式。",
    "aliases": [
      "uppercase",
      "大写"
    ],
    "sources": [
      {
        "id": "upper",
        "title": "String.prototype.toUpperCase()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "To Upper case"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "大写转换使用字符映射。ASCII a–z 对应 A–Z，而数字、汉字和标点通常没有这种对应。转换只涉及大小写，不移动字母在文本中的位置。",
          "本站 Scope 可选全体或词、句、段等范围；“全部”与标题式首字母变化不同，输入单词 puzzle 在全体范围会成为 PUZZLE。"
        ],
        "sourceIds": [
          "upper",
          "implementation"
        ],
        "examples": [
          {
            "label": "全部范围",
            "input": "puzzle 42",
            "output": "PUZZLE 42",
            "explanation": "六个字母转为大写，数字与空格保留。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "Unicode 大写可能改变字符串长度，且通用映射与语言地区映射不同。大小写可能是谜题线索，先保留原文本。"
        ],
        "sourceIds": [
          "implementation",
          "upper"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Convert%20Leet%20Speak",
    "capabilityIds": [
      "op:Convert%20Leet%20Speak"
    ],
    "relatedIds": [
      "op:Convert%20Leet%20Speak"
    ],
    "topicGroup": "text-language",
    "title": "转换 Leet 替代字母",
    "summary": "用约定的字母替代表表达网络文字，反向转换会出现多义性。",
    "aliases": [
      "1337",
      "Leetspeak"
    ],
    "sources": [
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Convert Leet Speak"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Leet 使用外形或习惯替换，例如 E 常写成 3，O 常写成 0，T 常写成 7。它没有唯一、覆盖所有写法的全球字母表，许多字母可有多种表示。",
          "本站提供 To Leet Speak 与 From Leet Speak 两种方向，使用引擎内置替换表。反向看到 1 时可能涉及 I 或 L，不能从单个符号必然推断唯一原字母。"
        ],
        "sourceIds": [
          "implementation"
        ],
        "examples": [
          {
            "label": "常见替代约定",
            "input": "ELITE",
            "output": "一种常见写法：3L173",
            "explanation": "3→E、1→I、7→T 是示例约定；本站默认表可能选择其他形式。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "这属于文字替换约定，不是安全加密。标点组成的多字符变体也未必被当前内置表支持。"
        ],
        "sourceIds": [
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Convert%20to%20NATO%20alphabet",
    "capabilityIds": [
      "op:Convert%20to%20NATO%20alphabet"
    ],
    "relatedIds": [
      "op:Convert%20to%20NATO%20alphabet"
    ],
    "topicGroup": "text-language",
    "title": "转换为北约拼读字母",
    "summary": "为每个字母分配固定的可辨识代码词，降低语音混淆。",
    "aliases": [
      "NATO",
      "Alfa Bravo",
      "无线电拼读"
    ],
    "sources": [
      {
        "id": "nato",
        "title": "无线电通信字母拼写表",
        "publisher": "中国民用航空局",
        "url": "https://www.caac.gov.cn/XXGK/XXGK/GFXWJ/201706/P020170601329561444305.pdf",
        "language": "zh-CN",
        "kind": "standard",
        "locator": "无线电通信字母拼写表"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Convert to NATO alphabet"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "国际无线电拼读字母表把 A、B、C 分别读作 Alfa、Bravo、Charlie。目的在嘈杂通信中区分字母，不是把单词翻译成另一个意思。",
          "转换逐字查表，ARG 便对应 Alfa、Romeo、Golf。需要保留规范拼写 Alfa、Juliett 等，避免因日常英语拼法改变代码词。"
        ],
        "sourceIds": [
          "nato",
          "implementation"
        ],
        "examples": [
          {
            "label": "逐字查表",
            "input": "ARG",
            "output": "Alfa Romeo Golf",
            "explanation": "三个代码词分别表示 A、R、G，按原顺序读取。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "它与国际音标 IPA 不是同一种系统；代码词代表原字母而非整词读音。本站输出形式和非字母处理以引擎实现为准。"
        ],
        "sourceIds": [
          "implementation",
          "nato"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:To%20Lower%20case",
    "capabilityIds": [
      "op:To%20Lower%20case"
    ],
    "relatedIds": [
      "op:To%20Lower%20case"
    ],
    "topicGroup": "text-language",
    "title": "转小写",
    "summary": "使用字符的小写映射，位置与非字母内容按规则保留。",
    "aliases": [
      "lowercase",
      "小写"
    ],
    "sources": [
      {
        "id": "lower",
        "title": "String.prototype.toLowerCase()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "To Lower case"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "小写转换把相应大写字母变为小写，如 A→a；它不把文本翻译为英语，也不按拼音改变汉字。",
          "本站对全部输入应用小写操作。某些文字的 Unicode 大小写映射复杂，字符串长度或比较关系可能变化，不能仅以 ASCII 数值差推广到所有语言。"
        ],
        "sourceIds": [
          "lower",
          "implementation"
        ],
        "examples": [
          {
            "label": "ASCII 小写",
            "input": "ARG 42",
            "output": "arg 42",
            "explanation": "字母的位置保持，数字与空格仍在原处。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "用于比较时还可能需要 Unicode 规范化；变小写不是所有语言下完整的大小写折叠。原有大小写线索也会丢失。"
        ],
        "sourceIds": [
          "implementation",
          "lower"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:RAKE",
    "capabilityIds": [
      "op:RAKE"
    ],
    "relatedIds": [
      "op:RAKE"
    ],
    "topicGroup": "text-language",
    "title": "RAKE 关键词提取",
    "summary": "先用停用词切出候选短语，再按词频与共现关系累加分数。",
    "aliases": [
      "关键词提取",
      "Rapid Automatic Keyword Extraction"
    ],
    "sources": [
      {
        "id": "rake",
        "title": "Automatic Keyword Extraction from Individual Documents",
        "publisher": "Stuart Rose 等 / Wiley",
        "url": "https://catalogimages.wiley.com/images/db/pdf/9780470749821.excerpt.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "§ 1.2"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "RAKE"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "RAKE 从单篇文本提取关键词，依赖词分隔、句分隔与停用词表。and、the 等常用功能词可把长句切成候选片段，而不是直接把整句当作关键词。",
          "经典评分以词的共现 degree 与词频 frequency 的比值衡量，再把候选短语中各词分数相加。本站可改分隔正则与停用词，默认名单以英语为主。"
        ],
        "sourceIds": [
          "rake",
          "implementation"
        ],
        "examples": [
          {
            "label": "候选切分与公式演算",
            "input": "red key and blue door；and 为停用词",
            "output": "候选 red key、blue door；四词各出现 1 次，每个二词候选可得分 4",
            "explanation": "按经典 degree 含自身共现的规则，每词 degree/frequency=2，二词相加为 4。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "分数不是语言理解或关键词正确概率。中文未分词文本、术语缩写及不合适的停用词表会改变切分与得分。"
        ],
        "sourceIds": [
          "implementation",
          "rake"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Normalise%20Unicode",
    "capabilityIds": [
      "op:Normalise%20Unicode"
    ],
    "relatedIds": [
      "op:Normalise%20Unicode"
    ],
    "topicGroup": "text-language",
    "title": "Unicode 规范化",
    "summary": "NFC/NFD处理规范等价，NFKC/NFKD还处理兼容等价。",
    "aliases": [
      "NFC",
      "NFD",
      "NFKC",
      "NFKD"
    ],
    "sources": [
      {
        "id": "unicode",
        "title": "Unicode 规范化：NFC、NFD、NFKC、NFKD",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/normalize",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Normalise Unicode"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "NFD 做规范分解，NFC 再把可组合序列组合；NFKD 做兼容分解，NFKC 再组合。因此同样看起来是 é 的一或两个码位可通过 NFC 统一。",
          "兼容形式会合并某些有视觉差异的字符，如全角 Ａ 经 NFKC 变为 A。它与大小写变换、繁简转换和删除重音不是同一操作。"
        ],
        "sourceIds": [
          "unicode",
          "implementation"
        ],
        "examples": [
          {
            "label": "规范与兼容的区别",
            "input": "é 与 e\\u0301；全角 Ａ",
            "output": "NFC：两种 é 统一为 U+00E9；NFKC：Ａ→A",
            "explanation": "\\u0301 表示组合重音码位；两类等价不要混用。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "兼容规范化可能改变题目故意保留的样式区别；NFC 也不会把所有外形相近的字统一。选择形式前先确认需要保留哪些线索。"
        ],
        "sourceIds": [
          "implementation",
          "unicode"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Unicode%20Text%20Format",
    "capabilityIds": [
      "op:Unicode%20Text%20Format"
    ],
    "relatedIds": [
      "op:Unicode%20Text%20Format"
    ],
    "topicGroup": "text-language",
    "title": "Unicode 文本样式",
    "summary": "在字母后附加组合符号，显示效果依赖字体与渲染器。",
    "aliases": [
      "组合下划线",
      "Unicode 删除线"
    ],
    "sources": [
      {
        "id": "combining",
        "title": "Unicode：字符与组合附加符号",
        "publisher": "Unicode Consortium",
        "url": "https://www.unicode.org/faq/char_combmark.html",
        "language": "en",
        "kind": "standard",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Unicode Text Format"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Unicode 组合符可以附在前面的基字符上。组合下划线和删除线通常作为额外码位保留在文本中，不需要 HTML 的 u 或 s 标签。",
          "本站选择 Underline 或 Strikethrough 时插入相应组合符；复制结果也会复制这些符号。因此屏幕上一个字形可能实际包含多个码位。"
        ],
        "sourceIds": [
          "combining",
          "implementation"
        ],
        "examples": [
          {
            "label": "基字母加删除线符",
            "input": "A + U+0336 COMBINING LONG STROKE OVERLAY",
            "output": "A̶",
            "explanation": "可见字形像带删除线的 A，但文本实际保存 A 和一个附加码位。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "不同字体对组合符的定位不同；这不是所有应用通用的富文本格式。删除变音符或某些规范化、清理操作可能移除这些样式。"
        ],
        "sourceIds": [
          "implementation",
          "combining"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:CSV%20to%20JSON",
    "capabilityIds": [
      "pair:CSV%20to%20JSON"
    ],
    "relatedIds": [
      "pair:CSV%20to%20JSON"
    ],
    "topicGroup": "formats",
    "title": "CSV / JSON",
    "summary": "CSV 按记录和字段组织文本，JSON 用对象或数组表示结构。",
    "aliases": [
      "CSV",
      "JSON",
      "双引号转义"
    ],
    "sources": [
      {
        "id": "csv",
        "title": "RFC 4180：CSV 的记录、引号与转义",
        "publisher": "RFC Editor / 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4180.html",
        "language": "en",
        "kind": "standard",
        "locator": "§ 2"
      },
      {
        "id": "json",
        "title": "JSON：语法、字符串和数据类型",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "CSV to JSON / JSON to CSV"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "CSV 常用逗号分字段、CRLF 分记录。包含逗号、双引号或换行的字段用双引号包围，字段内部双引号写成两个双引号；不能只用 split(\",\") 正确解析所有 CSV。",
          "转 JSON 时可选择对象数组或数组的数组；对象形式通常把首行作为键。反向转换要把 JSON 单元值写回表格，并按需要加引号与转义。"
        ],
        "sourceIds": [
          "csv",
          "json",
          "implementation"
        ],
        "examples": [
          {
            "label": "带字段内逗号的记录",
            "input": "name,note\r\nA,\"x,y\"",
            "output": "[{\"name\":\"A\",\"note\":\"x,y\"}]",
            "explanation": "双引号中的逗号属于一个字段内容，表头形成对象键。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "CSV 没有统一内建的数字、布尔类型声明。空单元与缺失属性、重复表头、嵌套对象如何处理需按当前格式参数核对。"
        ],
        "sourceIds": [
          "implementation",
          "csv",
          "json"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JSON%20Beautify",
    "capabilityIds": [
      "op:JSON%20Beautify"
    ],
    "relatedIds": [
      "op:JSON%20Beautify"
    ],
    "topicGroup": "formats",
    "title": "格式化 JSON",
    "summary": "解析括号和层级，在结构边界增加换行与缩进。",
    "aliases": [
      "JSON 美化",
      "prettify"
    ],
    "sources": [
      {
        "id": "jsonstringify",
        "title": "JSON.stringify()：缩进、序列化与空白",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "jsonparse",
        "title": "JSON.parse()：解析 JSON 文本",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "JSON Beautify"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "JSON 的结构含对象、数组、字符串、数字、true、false 和 null。对象键要用双引号；字符串内部空格是数据，字符串外允许的空白属于语法间隔。",
          "格式化通过显示嵌套层级降低阅读难度。本站可以选择缩进字符串、是否按对象键排序与格式化显示；排序键会额外改变书写顺序。"
        ],
        "sourceIds": [
          "jsonstringify",
          "jsonparse",
          "implementation"
        ],
        "examples": [
          {
            "label": "两空格缩进的示例",
            "input": "{\"a\":1,\"b\":[2,3]}",
            "output": "{\n  \"a\": 1,\n  \"b\": [\n    2,\n    3\n  ]\n}",
            "explanation": "内容结构相同，换行与缩进展示嵌套；具体数组排版由格式器决定。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "美化不负责解密，也不会把任意 JavaScript 对象字面值变成合法 JSON。重复键或超大整数在解析后可能丢失原稿信息，重要数据保留原文。"
        ],
        "sourceIds": [
          "implementation",
          "jsonstringify",
          "jsonparse"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JSON%20Minify",
    "capabilityIds": [
      "op:JSON%20Minify"
    ],
    "relatedIds": [
      "op:JSON%20Minify"
    ],
    "topicGroup": "formats",
    "title": "压缩 JSON",
    "summary": "去掉结构间多余空白，字符串内部内容仍必须保留。",
    "aliases": [
      "JSON 压缩",
      "minify JSON"
    ],
    "sources": [
      {
        "id": "jsonstringify",
        "title": "JSON.stringify()：缩进、序列化与空白",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "json",
        "title": "JSON：语法、字符串和数据类型",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "JSON Minify"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "JSON 允许部分语法符号之间出现空白；删除这些空白可以缩短文本。字符串里 \"a b\" 的空格属于值，不能像结构外空格一样删除。",
          "本站把合法 JSON 写成紧凑形式。标点和必要的转义仍保留；压缩后可以再次格式化，但不能凭空恢复原来的缩进、注释或书写顺序。"
        ],
        "sourceIds": [
          "jsonstringify",
          "json",
          "implementation"
        ],
        "examples": [
          {
            "label": "结构间空白",
            "input": "{ \"a\" : \"x y\" }",
            "output": "{\"a\":\"x y\"}",
            "explanation": "字符串 x y 内的空格保留，键值分隔符旁的空白删除。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "标准 JSON 不允许注释和尾逗号，所谓“压缩”不是宽松语法清洗。解析超大整数与重复键还可能影响无损性。"
        ],
        "sourceIds": [
          "implementation",
          "jsonstringify",
          "json"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:XPath%20expression",
    "capabilityIds": [
      "op:XPath%20expression"
    ],
    "relatedIds": [
      "op:XPath%20expression"
    ],
    "topicGroup": "formats",
    "title": "XPath 表达式",
    "summary": "沿 XML 节点树选位置，用谓词筛选，再取节点或属性。",
    "aliases": [
      "XPath",
      "XML 查询"
    ],
    "sources": [
      {
        "id": "xpath",
        "title": "XPath：XML 节点路径与查询",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/XML/XPath",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "xml",
        "title": "XML 入门：元素、标签、层级与严格语法",
        "publisher": "Microsoft 官方中文支持",
        "url": "https://support.microsoft.com/zh-cn/office/xml-for-the-uninitiated",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "XPath expression"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "XPath 用 / 描述路径，// 可选择后代，@ 表示属性，方括号表示条件。例如 /clues/clue[@id=\"a\"] 指向 id 为 a 的 clue 元素。",
          "选择元素文本可以用 text()，选择属性可以用 @name。查询返回可能为节点集合或值；本站用结果分隔符连接多条结果。"
        ],
        "sourceIds": [
          "xpath",
          "xml",
          "implementation"
        ],
        "examples": [
          {
            "label": "属性筛选后取文本",
            "input": "<clues><clue id=\"a\">KEY</clue></clues>；/clues/clue[@id=\"a\"]/text()",
            "output": "KEY",
            "explanation": "先按树路径选节点，再依据 id 属性筛选，最后取文本。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "XML 命名空间会影响节点名匹配；XPath 与 JSONPath、CSS 选择器的语法和索引约定不同，不能直接互换。"
        ],
        "sourceIds": [
          "implementation",
          "xpath",
          "xml"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:P-list%20Viewer",
    "capabilityIds": [
      "op:P-list%20Viewer"
    ],
    "relatedIds": [
      "op:P-list%20Viewer"
    ],
    "topicGroup": "formats",
    "title": "XML 属性列表",
    "summary": "按固定替换规则显示 XML plist 的键和值；此查看器不解析二进制 plist。",
    "aliases": [
      "plist",
      "属性列表"
    ],
    "sources": [
      {
        "id": "plist",
        "title": "Property Lists：可存储对象与格式",
        "publisher": "Apple Developer",
        "url": "https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/PropertyLists/Introduction/Introduction.html",
        "language": "en",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "P-list Viewer"
      },
      {
        "id": "engine-run",
        "title": "CyberChef 11.5.0：P-list Viewer 固定实现",
        "publisher": "GCHQ · 随站官方线程",
        "url": "/vendor/cyberchef/ChefWorker.js",
        "language": "en",
        "kind": "implementation",
        "locator": "P-list Viewer.run：slice 根元素后正则替换与缩进"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Apple 属性列表用于保存数组、字典、字符串、数字、布尔、日期和数据等对象。相同属性列表可以有 XML 或二进制等表示，.plist 后缀不决定内部一定是文字。",
          "XML 形式用 dict、key、string 等标签标示对象。本操作先从 <plist 起截取文本，再以正则替换 dict、array、key、string 等并缩进；不是通用 XML 解析器，也不会解码 bplist 二进制对象表。"
        ],
        "sourceIds": [
          "plist",
          "implementation",
          "engine-run"
        ],
        "examples": [
          {
            "label": "完整 XML 的实际格式化结果",
            "input": "<?xml version=\"1.0\"?>\n<plist version=\"1.0\">\n<dict>\n<key>clue</key>\n<string>KEY</string>\n</dict>\n</plist>",
            "output": "plist => {\n\tclue => \"KEY\"\n}\n/plist\n",
            "explanation": "该固定查看器按文本替换生成可读表示。需保留 plist 根与原分行，输出不是 JSON，也不证明任意 XML 已通过完整语法验证。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "输入须是带 <plist 根元素的 XML 文本；只有 dict 片段不会得到上述结果。二进制 plist 应先用支持该格式的解析器转换，此操作不提供该转换。"
        ],
        "sourceIds": [
          "implementation",
          "plist",
          "engine-run"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:CSS%20Beautify",
    "capabilityIds": [
      "op:CSS%20Beautify"
    ],
    "relatedIds": [
      "op:CSS%20Beautify"
    ],
    "topicGroup": "formats",
    "title": "格式化 CSS",
    "summary": "把 CSS 规则、属性和分号边界排成便于阅读的行。",
    "aliases": [
      "CSS 美化"
    ],
    "sources": [
      {
        "id": "css",
        "title": "CSS 语法：声明、规则与空白",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Syntax/Introduction",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "CSS Beautify"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "CSS 规则由选择器和声明块构成；声明包含属性、冒号和值，多条声明以分号分开。花括号界定一组规则的范围。",
          "美化在这些语法边界插入换行和缩进，例如把同一声明块中的 color 与 margin 分行。它不改变选择器优先级，也不计算页面最终样式。"
        ],
        "sourceIds": [
          "css",
          "implementation"
        ],
        "examples": [
          {
            "label": "声明分行",
            "input": "p{color:red;margin:0;}",
            "output": "p {\n    color: red;\n    margin: 0;\n}",
            "explanation": "规则仍针对 p；具体空格数由格式器参数决定。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "注释、字符串、URL 与自定义属性中的内容可能有特别空白规则。格式化工具不能代替浏览器样式检查，更不能修复错误的 CSS 逻辑。"
        ],
        "sourceIds": [
          "implementation",
          "css"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:CSS%20Minify",
    "capabilityIds": [
      "op:CSS%20Minify"
    ],
    "relatedIds": [
      "op:CSS%20Minify"
    ],
    "topicGroup": "formats",
    "title": "压缩 CSS",
    "summary": "缩短格式空白，同时保留选择器和值所需的分隔。",
    "aliases": [
      "CSS 压缩"
    ],
    "sources": [
      {
        "id": "css",
        "title": "CSS 语法：声明、规则与空白",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Syntax/Introduction",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "selectors",
        "title": "CSS 选择器：元素、类与属性选择",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Selectors",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "CSS Minify"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "CSS 空格有时只用于排版，有时表示后代选择器。a b 与 ab 不是同一选择器，不能通过删除所有空格压缩样式。",
          "压缩器在认识的语法位置去掉多余空白和某些可省略符号；字符串、函数和值的内部结构仍需保留。输出更短并不代表规则更少。"
        ],
        "sourceIds": [
          "css",
          "selectors",
          "implementation"
        ],
        "examples": [
          {
            "label": "保持声明意义",
            "input": "p { color: red; }",
            "output": "p{color:red}",
            "explanation": "删除的是格式空白；后代选择器的必要空格不能按此类比删除。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "压缩不改变网页动画或样式的设计意图；不同版本优化方式可能不同。复杂自定义属性和新语法应与浏览器实际结果交叉核对。"
        ],
        "sourceIds": [
          "implementation",
          "css",
          "selectors"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JavaScript%20Beautify",
    "capabilityIds": [
      "op:JavaScript%20Beautify"
    ],
    "relatedIds": [
      "op:JavaScript%20Beautify"
    ],
    "topicGroup": "formats",
    "title": "格式化 JavaScript",
    "summary": "按 JavaScript 语法边界排版，帮助识读函数与表达式。",
    "aliases": [
      "JS 美化",
      "JavaScript 格式化"
    ],
    "sources": [
      {
        "id": "jslex",
        "title": "JavaScript 词法：注释、空白和自动分号插入",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Lexical_grammar",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "JavaScript Beautify"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "JavaScript 的花括号、括号和语句边界表示控制结构和表达式。缩进展示层次但并非所有层次都由缩进决定，字符串与模板字面量另有其内容规则。",
          "美化器在可识别边界插入空白和换行；它不执行代码，也不说明某个函数的用途。结果可以帮助查看被挤成一行的脚本。"
        ],
        "sourceIds": [
          "jslex",
          "implementation"
        ],
        "examples": [
          {
            "label": "简短函数的排版",
            "input": "function f(){return 1;}",
            "output": "function f() {\n    return 1;\n}",
            "explanation": "原语句仍返回 1；具体缩进和换行样式由格式器选项决定。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "自动分号插入会让某些换行有语义；不要用通用文本分割代替 JS 格式器。解析器版本不支持的新语法可能无法可靠处理。"
        ],
        "sourceIds": [
          "implementation",
          "jslex"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JavaScript%20Minify",
    "capabilityIds": [
      "op:JavaScript%20Minify"
    ],
    "relatedIds": [
      "op:JavaScript%20Minify"
    ],
    "topicGroup": "formats",
    "title": "压缩 JavaScript",
    "summary": "必须保留词法和语法所需的边界，字符串内容也不能改写。",
    "aliases": [
      "JS 压缩",
      "minify JavaScript"
    ],
    "sources": [
      {
        "id": "jslex",
        "title": "JavaScript 词法：注释、空白和自动分号插入",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Lexical_grammar",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "JavaScript Minify"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "相邻关键字、标识符和运算符需要合法边界。let a 与 leta 完全不同；某些行终止符又参与自动分号插入，所以压缩必须理解语言规则。",
          "本站压缩入口缩短脚本表示，处理可识别的注释与空白。它不执行脚本，也不能把混淆代码自动还原出原变量名与业务含义。"
        ],
        "sourceIds": [
          "jslex",
          "implementation"
        ],
        "examples": [
          {
            "label": "必须保留的边界",
            "input": "var a = 1;",
            "output": "var a=1;",
            "explanation": "var 与 a 之间至少保留合法分隔；字符串内部空格另当别论。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "不同语法版本、保留注释和特殊字面量可能影响输出。用于运行的脚本还应在目标环境验证，压缩后可读性下降也是预期结果。"
        ],
        "sourceIds": [
          "implementation",
          "jslex"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:SQL%20Beautify",
    "capabilityIds": [
      "op:SQL%20Beautify"
    ],
    "relatedIds": [
      "op:SQL%20Beautify"
    ],
    "topicGroup": "formats",
    "title": "格式化 SQL",
    "summary": "把 SQL 子句和嵌套结构排成清晰层次，不执行查询。",
    "aliases": [
      "SQL 美化"
    ],
    "sources": [
      {
        "id": "sql",
        "title": "SQL 子句、词汇与换行规则",
        "publisher": "Microsoft 官方中文支持",
        "url": "https://support.microsoft.com/zh-cn/access/access-sql-basic-concepts-vocabulary-and-syntax",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "基本 SQL 子句：SELECT、FROM 和 WHERE"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "SQL Beautify"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "SELECT 指定返回列，FROM 指定来源，WHERE 限定条件；SQL 方言还可以增加连接、分组和其他子句。子句结构是语法的一部分，换行只是便于阅读的表示。",
          "本站提供缩进字符串参数，将可识别的 SQL 语句分段排版。它不连接数据库、不读取表，也不验证查询能否在任一数据库方言中运行。"
        ],
        "sourceIds": [
          "sql",
          "implementation"
        ],
        "examples": [
          {
            "label": "子句分段",
            "input": "SELECT name FROM clues WHERE id=1;",
            "output": "SELECT name\nFROM clues\nWHERE id = 1;",
            "explanation": "展示来源和条件的不同子句；具体格式细节随格式器变化。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "引号字符串和标识符内空白属于内容。不同数据库方言的关键字、注释和引用方式不同，美化成功不等于 SQL 已经语义正确。"
        ],
        "sourceIds": [
          "implementation",
          "sql"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:SQL%20Minify",
    "capabilityIds": [
      "op:SQL%20Minify"
    ],
    "relatedIds": [
      "op:SQL%20Minify"
    ],
    "topicGroup": "formats",
    "title": "压缩 SQL",
    "summary": "删除可省略的排版空白，保留关键字与标识符间必要分隔。",
    "aliases": [
      "SQL 压缩"
    ],
    "sources": [
      {
        "id": "sql",
        "title": "SQL 子句、词汇与换行规则",
        "publisher": "Microsoft 官方中文支持",
        "url": "https://support.microsoft.com/zh-cn/access/access-sql-basic-concepts-vocabulary-and-syntax",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": "基本 SQL 子句：SELECT、FROM 和 WHERE"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "SQL Minify"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "SELECT name 和 SELECTname 是不同文本，缩短 SQL 不能直接删光空白。字符串 \"a b\" 或单引号字符串内空格还属于字段值。",
          "本站把可识别 SQL 写得更紧凑，不执行数据库查询。它与删除 SQL 条件、优化查询计划和改变结果数据不是同一操作。"
        ],
        "sourceIds": [
          "sql",
          "implementation"
        ],
        "examples": [
          {
            "label": "紧凑而保留词边界",
            "input": "SELECT   name   FROM   clues;",
            "output": "SELECT name FROM clues;",
            "explanation": "关键字与名称仍分开，多余排版空白被压缩。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "SQL 方言及注释形式不同；用于真实数据库前需要核对其方言。不得把紧凑输出当作自动防止注入或语法审核的结果。"
        ],
        "sourceIds": [
          "implementation",
          "sql"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:XML%20Beautify",
    "capabilityIds": [
      "op:XML%20Beautify"
    ],
    "relatedIds": [
      "op:XML%20Beautify"
    ],
    "topicGroup": "formats",
    "title": "格式化 XML",
    "summary": "利用起始与结束标签表示的树结构排列 XML 元素。",
    "aliases": [
      "XML 美化"
    ],
    "sources": [
      {
        "id": "xml",
        "title": "XML 入门：元素、标签、层级与严格语法",
        "publisher": "Microsoft 官方中文支持",
        "url": "https://support.microsoft.com/zh-cn/office/xml-for-the-uninitiated",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "XML Beautify"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "XML 元素由起始标签、结束标签及内部内容构成，子元素产生嵌套层级。标签必须成对闭合或使用空元素写法，属性值也有引用规则。",
          "格式器在合适边界增加换行与缩进，使嵌套结构更易看清；它不会修复所有不合法 XML，也不会自动理解元素里数据的含义。"
        ],
        "sourceIds": [
          "xml",
          "implementation"
        ],
        "examples": [
          {
            "label": "纯元素嵌套",
            "input": "<a><b/></a>",
            "output": "<a>\n    <b/>\n</a>",
            "explanation": "展示纯元素结构的层级；混合文本场景不能照搬插空白规则。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "XML 的空白文本节点有时属于实际内容，尤其混合文本或 xml:space 约定中。格式改变应核对是否引入有意义的空白。"
        ],
        "sourceIds": [
          "implementation",
          "xml"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:XML%20Minify",
    "capabilityIds": [
      "op:XML%20Minify"
    ],
    "relatedIds": [
      "op:XML%20Minify"
    ],
    "topicGroup": "formats",
    "title": "压缩 XML",
    "summary": "压缩排版空白时必须区分节点数据和格式间隔。",
    "aliases": [
      "XML 压缩"
    ],
    "sources": [
      {
        "id": "xml",
        "title": "XML 入门：元素、标签、层级与严格语法",
        "publisher": "Microsoft 官方中文支持",
        "url": "https://support.microsoft.com/zh-cn/office/xml-for-the-uninitiated",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "XML Minify"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "XML 既可以保存元素树，也可以包含文本。<p>A B</p> 中的空格是正文；相邻元素之间的空白也可能被应用当作文本节点。",
          "本站紧凑入口减少其规则认定可省的内容与空白，目的是缩短显示和传输表示，不是把 XML 改成普通字符串。"
        ],
        "sourceIds": [
          "xml",
          "implementation"
        ],
        "examples": [
          {
            "label": "内容空格保持",
            "input": "<p>A B</p>",
            "output": "<p>A B</p>",
            "explanation": "没有可随意删除的正文空格；紧凑操作不应把它变成 AB。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "保留空白的应用或混合内容可能不适合压缩。标签结构、命名空间和属性引用不能因追求变短而随意删除。"
        ],
        "sourceIds": [
          "implementation",
          "xml"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JavaScript%20Parser",
    "capabilityIds": [
      "op:JavaScript%20Parser"
    ],
    "relatedIds": [
      "op:JavaScript%20Parser"
    ],
    "topicGroup": "formats",
    "title": "解析 JavaScript",
    "summary": "解析器识别语法节点，输出 AST 与可选位置数据。",
    "aliases": [
      "AST",
      "抽象语法树"
    ],
    "sources": [
      {
        "id": "esprima",
        "title": "Syntactic Analysis：AST、位置与容错选项",
        "publisher": "Esprima 作者文档",
        "url": "https://docs.esprima.org/en/latest/syntactic-analysis.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "Syntax Tree Format；Node Location"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "JavaScript Parser"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "AST 把代码表示为节点树，例如变量声明含标识符与初始表达式。节点名称反映语法类别，而不是这段代码最终显示的值。",
          "本站可附行列位置、字符范围、token 和注释数组，并可尝试容错报告。位置记录用于把节点映射回原稿，通常需要与对应选项一起阅读。"
        ],
        "sourceIds": [
          "esprima",
          "implementation"
        ],
        "examples": [
          {
            "label": "字面量的 AST",
            "input": "42;",
            "output": "Program → ExpressionStatement → Literal(value:42)",
            "explanation": "一条表达式语句的结构示意；完整 AST 还含类型与其他元数据。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "解析器不会运行脚本。它支持的 ECMAScript 语法范围由版本决定，容错模式也不保证对错误输入生成完整正确的树。"
        ],
        "sourceIds": [
          "implementation",
          "esprima"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Generic%20Code%20Beautify",
    "capabilityIds": [
      "op:Generic%20Code%20Beautify"
    ],
    "relatedIds": [
      "op:Generic%20Code%20Beautify"
    ],
    "topicGroup": "formats",
    "title": "通用代码格式化",
    "summary": "按类似 C 的花括号和标点整理外观，未完整解析每种语言。",
    "aliases": [
      "通用美化",
      "C 风格"
    ],
    "sources": [
      {
        "id": "jslex",
        "title": "JavaScript 词法：注释、空白和自动分号插入",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Lexical_grammar",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Generic Code Beautify"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "C、Java、JavaScript 等语言共享某些花括号和分号外观，但语法并不相同。通用美化器依这些共同外观尝试排版，所以无法保证语言专属结构完全正确。",
          "本入口官方说明列出 for、do-while、switch/case 与某些移位运算等限制。它主要帮助读混淆或压缩文本，不是可信的编译器。"
        ],
        "sourceIds": [
          "jslex",
          "implementation"
        ],
        "examples": [
          {
            "label": "共同外观的排版示意",
            "input": "if(x){y();}",
            "output": "if (x) {\n    y();\n}",
            "explanation": "花括号可帮助显示层次，但这个简单例子不能推广为所有语言均安全。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "需要执行的代码优先选具体语言格式器，并保留原稿。排版看起来更整齐不表示程序语法、行为或安全性通过检查。"
        ],
        "sourceIds": [
          "implementation",
          "jslex"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Parse%20TLV",
    "capabilityIds": [
      "op:Parse%20TLV"
    ],
    "relatedIds": [
      "op:Parse%20TLV"
    ],
    "topicGroup": "formats",
    "title": "解析 TLV",
    "summary": "先读类型和长度字段，再依长度读取 Value，重复解析后续段。",
    "aliases": [
      "TLV",
      "KLV",
      "Length Value"
    ],
    "sources": [
      {
        "id": "tlv",
        "title": "ASN.1 BER/CER/DER：标识、长度与内容编码",
        "publisher": "国际电信联盟 ITU-T",
        "url": "https://www.itu.int/rec/dologin_pub.asp?id=T-REC-X.690-202102-I!!PDF-E&lang=e&type=items",
        "language": "en",
        "kind": "standard",
        "locator": "§ 8.1.1；§ 8.1.2；§ 8.1.3"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Parse TLV"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "TLV 由 Type、Length、Value 组成。类型标识如何解释内容，长度指定 Value 字节数，因此不能只把整个字节串当成三个等长部分。",
          "本站可设类型/键的宽度、长度字段的宽度，并选择 BER 长度规则。普通定长长度字段与 BER 短式、长式不同，编码协议必须与参数一致。"
        ],
        "sourceIds": [
          "tlv",
          "implementation"
        ],
        "examples": [
          {
            "label": "一字节类型和长度",
            "input": "01 03 41 42 43；Type size=1；Length size=1；BER=false",
            "output": "类型 01；长度 03；值 41 42 43（ASCII ABC）",
            "explanation": "Value 占 3 字节，类型和长度字段另占各 1 字节。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "声明长度超过剩余数据表示格式不完整或参数不匹配。TLV 是结构方式，不是唯一协议；单个 Type 值的实际含义需要相应协议字典。"
        ],
        "sourceIds": [
          "tlv",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Template",
    "capabilityIds": [
      "op:Template"
    ],
    "relatedIds": [
      "op:Template"
    ],
    "topicGroup": "formats",
    "title": "模板",
    "summary": "解析模板中的变量路径，从输入对象读取字段并替换。",
    "aliases": [
      "Handlebars",
      "Mustache",
      "模板变量"
    ],
    "sources": [
      {
        "id": "handlebars",
        "title": "Handlebars 表达式：变量路径与 HTML 转义",
        "publisher": "Handlebars 官方中文文档",
        "url": "https://handlebarsjs.com/zh/guide/expressions.html",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Template"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Handlebars 表达式用双花括号描述变量，如 {{name}} 读取对象的 name。点分路径 {{person.name}} 可以读取嵌套对象字段。",
          "普通双花括号会 HTML 转义特殊字符，三花括号可以保留原值；本站把输出作为纯文本呈现，避免将模板生成的内容直接当作可执行网页。"
        ],
        "sourceIds": [
          "handlebars",
          "implementation"
        ],
        "examples": [
          {
            "label": "变量替换",
            "input": "JSON {\"name\":\"KEY\"}；模板 Clue: {{name}}",
            "output": "Clue: KEY",
            "explanation": "表达式读取字符串值，模板其他文字原样连接。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "模板不负责自动纠正缺失键或任意脚本执行。双花括号输出与原始输出在特殊字符时不同，应先确认结果要当文本还是后续格式输入。"
        ],
        "sourceIds": [
          "implementation",
          "handlebars"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Heatmap%20chart",
    "capabilityIds": [
      "op:Heatmap%20chart"
    ],
    "relatedIds": [
      "op:Heatmap%20chart"
    ],
    "topicGroup": "formats",
    "title": "热力图",
    "summary": "把二维数据落入矩形格子，以颜色呈现各格的累计密度。",
    "aliases": [
      "heatmap",
      "热力图",
      "矩形分箱"
    ],
    "sources": [
      {
        "id": "scatter",
        "title": "基础散点图：二维坐标与散点数据",
        "publisher": "Apache ECharts 官方中文手册",
        "url": "https://echarts.apache.org/handbook/zh/how-to/chart-types/scatter/basic-scatter/",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Heatmap chart"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "本入口按 X、Y 数值把数据分入水平和竖直 bins，格子颜色表示该区域的点分布。不同分箱数量会改变同一数据的视觉细节。",
          "记录分隔符与字段分隔符决定坐标数据如何读取，首行可作为标签。颜色的最小与最大值是显示参数，不改变原数据的点数。"
        ],
        "sourceIds": [
          "scatter",
          "implementation"
        ],
        "examples": [
          {
            "label": "分箱计数的演算",
            "input": "点 (1,1)、(1.1,1.1)、(9,9)；前两个落同格",
            "output": "同格计数 2，另一格计数 1，颜色据计数映射",
            "explanation": "这是分箱机制的说明，具体格界取决于横纵分箱参数。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "颜色聚集只表示分箱内数据较多，不能自动推出因果关系。切换分箱范围或数量时图案可能改变，解谜应与原坐标一起核对。"
        ],
        "sourceIds": [
          "implementation",
          "scatter"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Scatter%20chart",
    "capabilityIds": [
      "op:Scatter%20chart"
    ],
    "relatedIds": [
      "op:Scatter%20chart"
    ],
    "topicGroup": "formats",
    "title": "散点图",
    "summary": "将每条记录的两个数分别作为 X、Y 坐标绘点。",
    "aliases": [
      "散点图",
      "坐标点"
    ],
    "sources": [
      {
        "id": "scatter",
        "title": "基础散点图：二维坐标与散点数据",
        "publisher": "Apache ECharts 官方中文手册",
        "url": "https://echarts.apache.org/handbook/zh/how-to/chart-types/scatter/basic-scatter/",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Scatter chart"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "散点图直接展示成对数值 (x,y)。X 和 Y 各有数值坐标，点间不需要按输入顺序连线，所以它适合发现点阵、离群点或二维关系。",
          "本站以记录和字段分隔符读取数据，可选首行作标签，并可以第三列给颜色。点半径只影响显示大小，不改变坐标数值。"
        ],
        "sourceIds": [
          "scatter",
          "implementation"
        ],
        "examples": [
          {
            "label": "二维点位置",
            "input": "1,2\n2,4；逗号字段；无表头",
            "output": "两个点位于 (1,2) 和 (2,4)",
            "explanation": "点的坐标来自每行两个数字；无需理解为某个折线函数。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "坐标轴范围与比例会影响外观；相关性不证明因果。输入标题行与纯数字行混用时要正确设置表头选项。"
        ],
        "sourceIds": [
          "implementation",
          "scatter"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Hex%20Density%20chart",
    "capabilityIds": [
      "op:Hex%20Density%20chart"
    ],
    "relatedIds": [
      "op:Hex%20Density%20chart"
    ],
    "topicGroup": "formats",
    "title": "六边形分箱密度图",
    "summary": "以六边形网格把许多坐标点汇总为密度，Hex 指形状。",
    "aliases": [
      "hexbin",
      "六边形分箱",
      "十六进制密度图"
    ],
    "sources": [
      {
        "id": "scatter",
        "title": "基础散点图：二维坐标与散点数据",
        "publisher": "Apache ECharts 官方中文手册",
        "url": "https://echarts.apache.org/handbook/zh/how-to/chart-types/scatter/basic-scatter/",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Hex Density chart"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Hex Density chart 中的 Hex 指 hexagon（六边形），不是 hexadecimal（十六进制编码）。它将二维散点归入六边形分箱，避免大量点相互遮挡。",
          "Pack radius 控制分箱尺度，Draw radius 控制显示六边形大小；两者角色不同。颜色用于表示箱内数量或密度，空箱是否绘制可单独设置。"
        ],
        "sourceIds": [
          "scatter",
          "implementation"
        ],
        "examples": [
          {
            "label": "密度汇总的不变量",
            "input": "同一箱内有 3 个坐标点",
            "output": "该六边形代表计数 3 的聚集区域",
            "explanation": "显示一个六边形替代三个重叠点；原点总数不因此变成 1。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "这是坐标图而非字节可视化。改变分箱半径会改变图案尺度，观察到蜂窝边界不说明数据本身由六边形组成。"
        ],
        "sourceIds": [
          "implementation",
          "scatter"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Series%20chart",
    "capabilityIds": [
      "op:Series%20chart"
    ],
    "relatedIds": [
      "op:Series%20chart"
    ],
    "topicGroup": "formats",
    "title": "序列图",
    "summary": "每行严格三个字段：系列名、X 标签、数值；X 标签等距排布，不是线性时间轴。",
    "aliases": [
      "时间序列",
      "折线图"
    ],
    "sources": [
      {
        "id": "series-values",
        "title": "getSeriesValues：三字段读取、标签顺序与覆盖规则",
        "publisher": "CyberChef / GCHQ，固定 v11.5.0 作者源码",
        "url": "/vendor/knowledge/cyberchef/src/core/lib/Charts.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "getValues；getSeriesValues",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/lib/Charts.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      },
      {
        "id": "implementation",
        "title": "SeriesChart.run：scalePoint 标签坐标与系列绘制",
        "publisher": "CyberChef / GCHQ，固定 v11.5.0 作者源码",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/SeriesChart.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "run；d3.scalePoint().domain(xValues)",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/operations/SeriesChart.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "固定版本要求每行恰好三个字段：第 1 列为系列名，第 2 列为 X 标签，第 3 列为数值。记录分隔符可选 LF 或 CRLF，字段分隔符可选空格等；这里没有首行表头开关，表头不能直接混入数值行。",
          "引擎依标签第一次出现的顺序建立 X 集合，用 scalePoint 将标签等距排布。X 标签即使写成 1、100、1000 或时间字符串，也仍是类别标签，图中间距不会按数值或实际时间差比例计算。"
        ],
        "sourceIds": [
          "series-values",
          "implementation"
        ],
        "examples": [
          {
            "label": "一个系列的四个标签点",
            "input": "s t1 1\ns t2 3\ns t3 2\ns t4 4\n参数：Record delimiter=Line feed；Field delimiter=Space",
            "output": "系列 s：t1→1，t2→3，t3→2，t4→4；四个 X 标签等距排列",
            "explanation": "每一行都含三个字段，无表头。第三个点下降到 2，第四个升到 4；X 标签只指定类别顺序，不表示线性时间间隔。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "相同系列与相同 X 标签再次出现时，后面的数值覆盖前面的数值；这不是保存两次测量、取平均或累加。不同系列可以共享同一标签，而横轴标签次序来自整个输入的首次出现顺序。",
          "连续空格、末尾空行或多余字段可能使按指定分隔符拆分后的字段数不等于 3。请使用明确的三列数据；若要按实际时间或数值距离绘图，应使用支持数值 X 坐标的图表入口。"
        ],
        "sourceIds": [
          "series-values",
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Microsoft%20Script%20Decoder",
    "capabilityIds": [
      "op:Microsoft%20Script%20Decoder"
    ],
    "relatedIds": [
      "op:Microsoft%20Script%20Decoder"
    ],
    "topicGroup": "formats",
    "title": "微软脚本解码",
    "summary": "识别 Microsoft Encoded Script 封装，再按其替换规则恢复源码。",
    "aliases": [
      "VBE",
      "JSE",
      "Script Encoder"
    ],
    "sources": [
      {
        "id": "scriptencoder",
        "title": "微软 Script Encoder 的编码脚本示例",
        "publisher": "Microsoft Scripting 官方归档",
        "url": "https://devblogs.microsoft.com/scripting/how-can-i-encode-scripts-within-an-hta/",
        "language": "en",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Microsoft Script Decoder"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Microsoft Script Encoder 曾把 VBScript/JScript 混淆成编码脚本，常见扩展名为 .vbe 与 .jse。内容中可见 #@~^ 和 ^#~@ 一类封装标记，扩展名本身不构成完整证据。",
          "本站解码器读取这种特定格式并恢复脚本文本。这不是 Base64 把整个文件一次解码，也不是运行 VBScript 或 JScript。"
        ],
        "sourceIds": [
          "scriptencoder",
          "implementation"
        ],
        "examples": [
          {
            "label": "引擎随附封装样例",
            "input": "#@~^RQAAAA==-mD~sX|:/TP{~J:+dYbxL~@!F@*@!+@*@!&@*eEI@#@&@#@&.jm.raY 214Wv:zms/obI0xEAAA==^#~@",
            "output": "var my_msg = \"Testing <1><2><3>!\";\n\nVScript.Echo(my_msg);",
            "explanation": "此输入/输出来自本站所用操作的官方随附样例，用于核对特定脚本封装。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "编码属于混淆表示，不能当作秘密内容的可靠保护。损坏封装或不受支持的变体会解码失败；恢复的脚本应先只读分析。"
        ],
        "sourceIds": [
          "implementation",
          "scriptencoder"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Render%20Markdown",
    "capabilityIds": [
      "op:Render%20Markdown"
    ],
    "relatedIds": [
      "op:Render%20Markdown"
    ],
    "topicGroup": "formats",
    "title": "渲染 Markdown",
    "summary": "解析 Markdown 标记，将标题、列表、链接与强调转换成显示结构。",
    "aliases": [
      "Markdown",
      "CommonMark"
    ],
    "sources": [
      {
        "id": "markdown",
        "title": "CommonMark 0.31.2：块元素和行内语法",
        "publisher": "CommonMark 项目",
        "url": "https://spec.commonmark.org/0.31.2/",
        "language": "en",
        "kind": "author-spec",
        "locator": "ATX headings；Emphasis and strong emphasis"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Render Markdown"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Markdown 包含块语法与行内语法。# 后接空格可表示一级标题，**内容**可表示强调；代码块与普通段落对特殊字符的处理不同。",
          "本站将输入解析并在结果区呈现排版。不同 Markdown 实现支持的扩展会不同；CommonMark 规范描述核心语法，不能代替所有扩展插件的行为文档。"
        ],
        "sourceIds": [
          "markdown",
          "implementation"
        ],
        "examples": [
          {
            "label": "块与行内语法",
            "input": "## Key\n\n**ARG**",
            "output": "二级标题 Key；下一段中的 ARG 强调显示",
            "explanation": "标题由行开头标记形成，强调作用于行内内容。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "渲染不是脚本执行器，也不代表输入中任意 HTML 都应执行。谜题中的 #、* 或反引号可能原本是线索，渲染前保留原文。"
        ],
        "sourceIds": [
          "implementation",
          "markdown"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Strip%20HTML%20tags",
    "capabilityIds": [
      "op:Strip%20HTML%20tags"
    ],
    "relatedIds": [
      "op:Strip%20HTML%20tags"
    ],
    "topicGroup": "formats",
    "title": "移除 HTML 标签",
    "summary": "去除标记语法，保留文本并按选项清理缩进与多余换行。",
    "aliases": [
      "HTML 去标签"
    ],
    "sources": [
      {
        "id": "htmltext",
        "title": "Node.textContent：节点文本",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Node/textContent",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Strip HTML tags"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "HTML 标签描述结构或样式，如 <b> 指示强调，正文位于标签之间。删除标签是提取文字的一种处理，不等于完整模拟浏览器的可见页面。",
          "本站可移除缩进和过量空行。HTML 实体、脚本、样式和相邻元素文本的处理会受具体实现规则影响，不能只用“所有尖括号内容都无意义”推断。"
        ],
        "sourceIds": [
          "htmltext",
          "implementation"
        ],
        "examples": [
          {
            "label": "单个简单元素",
            "input": "<b>KEY</b>",
            "output": "KEY",
            "explanation": "起始与结束标签被去除，内部三个字符保留。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "标签删除不应当作 HTML 安全净化器，也不保证保留原页面阅读顺序。结构中的表格列、换行与隐藏内容要另行核对。"
        ],
        "sourceIds": [
          "implementation",
          "htmltext"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:HTML%20To%20Text",
    "capabilityIds": [
      "op:HTML%20To%20Text"
    ],
    "relatedIds": [
      "op:HTML%20To%20Text"
    ],
    "topicGroup": "formats",
    "title": "HTML 转文本",
    "summary": "把 HTML 类型输出改为普通字符串，源码原样保留，不删除标签或提取正文。",
    "aliases": [
      "HTML 转文本"
    ],
    "sources": [
      {
        "id": "implementation",
        "title": "HTMLToText：html→string，run 原样返回输入",
        "publisher": "CyberChef / GCHQ，固定 v11.5.0 作者源码",
        "url": "/vendor/knowledge/cyberchef/src/core/operations/HTMLToText.mjs",
        "language": "en",
        "kind": "implementation",
        "locator": "inputType；outputType；run(input,args)",
        "upstreamUrl": "https://raw.githubusercontent.com/gchq/CyberChef/v11.5.0/src/core/operations/HTMLToText.mjs",
        "license": "Apache-2.0",
        "licenseUrl": "/vendor/knowledge/LICENSE.txt",
        "mirroredCommit": "8cd426dd4f40f1423912d5fad91b578a86a65112"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "这个操作的输入类型是 html，输出类型是 string。固定源码的 run(input,args) 直接 return input，因此字符串内容完全不变，标签、属性和其中的文本都仍保留。",
          "变化发生在结果的解释方式：前一步生成的 HTML 不再作为节点结构渲染，而以普通字符串显示并可送给后续源码处理。它不是读取 DOM 文本，也不是 Strip HTML tags 那种删除标签的操作。"
        ],
        "sourceIds": [
          "implementation"
        ],
        "examples": [
          {
            "label": "源码保持不变",
            "input": "<strong>KEY</strong>",
            "output": "<strong>KEY</strong>",
            "explanation": "输出仍含起始和结束标签；它们作为字符串字符保留，不再将 KEY 渲染为 strong 元素。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "需要正文 KEY 而不保留 <strong> 标签时，使用“移除 HTML 标签”等实际去标记的入口。这个转换只改变 HTML 输出与字符串输出的类型解释，不能据此声称隐藏内容、节点或标签已被清理。"
        ],
        "sourceIds": [
          "implementation"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Syntax%20highlighter",
    "capabilityIds": [
      "op:Syntax%20highlighter"
    ],
    "relatedIds": [
      "op:Syntax%20highlighter"
    ],
    "topicGroup": "formats",
    "title": "语法高亮",
    "summary": "按所选语言识别词法类别，以颜色展示原代码。",
    "aliases": [
      "syntax highlighting",
      "高亮"
    ],
    "sources": [
      {
        "id": "jslex",
        "title": "JavaScript 词法：注释、空白和自动分号插入",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Lexical_grammar",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Syntax highlighter"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "语法高亮将关键字、字符串、数字和注释等类别显示为不同样式。它可以帮助识别语言线索，但颜色并不是源码的一部分。",
          "本站可选语言或自动检测，官方说明明确不负责代码缩进。自动检测是候选判断，小片段或多语言文本可能被判为不合适的语言。"
        ],
        "sourceIds": [
          "jslex",
          "implementation"
        ],
        "examples": [
          {
            "label": "JavaScript 词法类别",
            "input": "const key = \"ARG\";",
            "output": "const：关键字；key：标识符；\"ARG\"：字符串",
            "explanation": "样式区分三类词法元素，原有字符顺序和缩进不因此改变。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "高亮不执行代码，也不证明语法正确；需要整理排版应使用对应 Beautify 入口。下载文本时通常不会保留屏幕上的颜色。"
        ],
        "sourceIds": [
          "implementation",
          "jslex"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:To%20Table",
    "capabilityIds": [
      "op:To%20Table"
    ],
    "relatedIds": [
      "op:To%20Table"
    ],
    "topicGroup": "formats",
    "title": "转表格",
    "summary": "解析分隔数据，按所选格式输出行列结构和可选表头。",
    "aliases": [
      "TSV",
      "PSV",
      "数据转表格"
    ],
    "sources": [
      {
        "id": "csv",
        "title": "RFC 4180：CSV 的记录、引号与转义",
        "publisher": "RFC Editor / 南京大学开源镜像",
        "url": "https://mirrors.nju.edu.cn/rfc/rfc4180.html",
        "language": "en",
        "kind": "standard",
        "locator": "§ 2"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "To Table"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "表格数据需要区分行边界和单元边界。默认逗号对应 CSV，制表符对应 TSV，竖线常用于 PSV；一个字段内的引用规则仍需解析器处理。",
          "本站能输出 ASCII、HTML 或 Markdown 表格，并可把第一行视为表头。单元分隔符参数允许多个候选字符，每个字符都可作为独立分隔符。"
        ],
        "sourceIds": [
          "csv",
          "implementation"
        ],
        "examples": [
          {
            "label": "两个表格列",
            "input": "name,value\r\nkey,42；第一行表头",
            "output": "列名 name / value；一条记录 key / 42",
            "explanation": "同一数据可写成 ASCII、HTML 或 Markdown 表，逻辑行列相同。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "转换只改变展示结构，不自动确认列的数据类型或字段含义。分隔符出现在正文、字段数不一致或引号损坏时要核对解析结果。"
        ],
        "sourceIds": [
          "implementation",
          "csv"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:To%20Kebab%20case",
    "capabilityIds": [
      "op:To%20Kebab%20case"
    ],
    "relatedIds": [
      "op:To%20Kebab%20case"
    ],
    "topicGroup": "formats",
    "title": "转短横线命名",
    "summary": "把词转为小写，并以短横线连接各词。",
    "aliases": [
      "kebab-case",
      "短横线命名"
    ],
    "sources": [
      {
        "id": "lower",
        "title": "String.prototype.toLowerCase()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "jslex",
        "title": "JavaScript 词法：注释、空白和自动分号插入",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Lexical_grammar",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "To Kebab case"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "kebab-case 用短横线表示词边界：两个词 secret 和 key 变为 secret-key。它不同于把所有字符连成 secretkey。",
          "本站可尝试识别原变量和函数名的上下文边界；对原本连续串，如何分词并非总能唯一确定。输出仍是字符串，不会修改整段程序中的所有引用。"
        ],
        "sourceIds": [
          "lower",
          "jslex",
          "implementation"
        ],
        "examples": [
          {
            "label": "清楚的空格词边界",
            "input": "Secret Key",
            "output": "secret-key",
            "explanation": "词转小写，中间用 - 明确保留边界。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "短横线在某些编程语言表达式中是减号，不是合法标识符字符。路径、CSS 类名和语言变量不能无条件采用同一命名样式。"
        ],
        "sourceIds": [
          "implementation",
          "lower",
          "jslex"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:To%20Camel%20case",
    "capabilityIds": [
      "op:To%20Camel%20case"
    ],
    "relatedIds": [
      "op:To%20Camel%20case"
    ],
    "topicGroup": "formats",
    "title": "转驼峰命名",
    "summary": "首词小写，后续词以大写首字母标示新的词边界。",
    "aliases": [
      "camelCase",
      "驼峰"
    ],
    "sources": [
      {
        "id": "lower",
        "title": "String.prototype.toLowerCase()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "upper",
        "title": "String.prototype.toUpperCase()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "To Camel case"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "camelCase 将 secret key 写成 secretKey。词间不再有空格或下划线，后续词的大写首字母起分隔作用；它不同于每词首字都大写的 PascalCase。",
          "本站可尝试根据变量名上下文识别词界。HTTPServer 一类连续缩写存在多种拆分习惯，转换器的选择不是全球唯一规范。"
        ],
        "sourceIds": [
          "lower",
          "upper",
          "implementation"
        ],
        "examples": [
          {
            "label": "明确两个词",
            "input": "Secret Key",
            "output": "secretKey",
            "explanation": "首词用小写，第二词 Key 的 K 作为边界提示。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "改变名字字符串不会自动重构代码引用。保留原始名称，以免谜题中大小写本身承载线索。"
        ],
        "sourceIds": [
          "implementation",
          "lower",
          "upper"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:To%20Snake%20case",
    "capabilityIds": [
      "op:To%20Snake%20case"
    ],
    "relatedIds": [
      "op:To%20Snake%20case"
    ],
    "topicGroup": "formats",
    "title": "转下划线命名",
    "summary": "各词转小写，再用下划线隔开。",
    "aliases": [
      "snake_case",
      "下划线命名"
    ],
    "sources": [
      {
        "id": "lower",
        "title": "String.prototype.toLowerCase()",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "jslex",
        "title": "JavaScript 词法：注释、空白和自动分号插入",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Lexical_grammar",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "To Snake case"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "snake_case 把 secret key 写成 secret_key，下划线属于结果字符，不能在后续索引中忽略其位置。它也不同于短横线形式 secret-key。",
          "本站可尝试理解已有变量名的上下文词界，再插入下划线。缩写、数字边界与原来的多个分隔符仍可能存在歧义。"
        ],
        "sourceIds": [
          "lower",
          "jslex",
          "implementation"
        ],
        "examples": [
          {
            "label": "两个单词连接",
            "input": "Secret Key",
            "output": "secret_key",
            "explanation": "词小写，两个词之间加一个 _。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "这项操作是命名表示转换，不是自然语言分词器或全程序变量重命名。某些语言允许的名字字符与其命名规范需另行核对。"
        ],
        "sourceIds": [
          "implementation",
          "lower",
          "jslex"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:AMF%20Encode",
    "capabilityIds": [
      "pair:AMF%20Encode"
    ],
    "relatedIds": [
      "pair:AMF%20Encode"
    ],
    "topicGroup": "formats",
    "title": "AMF 编码与解码",
    "summary": "按 AMF0 或 AMF3 的独立规则写类型、值及引用信息。",
    "aliases": [
      "AMF0",
      "AMF3",
      "Action Message Format"
    ],
    "sources": [
      {
        "id": "amf3",
        "title": "AMF 3 Specification：标记、变长整数与引用表",
        "publisher": "Adobe Systems / SRS 标准文档镜像",
        "url": "https://ossrs.net/lts/en-us/assets/files/amf3_spec_121207-5ec039969edc9d9b7cd53607ec3253d9.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "§ 1.3；§ 3"
      },
      {
        "id": "amf0",
        "title": "AMF 0 Specification：类型标记与对象编码",
        "publisher": "Adobe Systems / SRS 标准文档镜像",
        "url": "https://ossrs.net/lts/en-us/assets/files/amf0_spec_121207-ac97fd4db9408706cd816b681ca3918c.pdf",
        "language": "en",
        "kind": "author-spec",
        "locator": "§ 2"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "AMF Encode / AMF Decode"
      },
      {
        "id": "site-correction",
        "title": "AMF 字符串长度与节点工厂的公共兼容适配",
        "publisher": "迷雾工具箱 · 共用 Worker 适配",
        "url": "/cyberchef-operation-corrections.js",
        "language": "en",
        "kind": "implementation",
        "locator": "受限 Encodings 同步导入；AMF0 UTF-8 长度；AMF3 节点赋值；按声明字节长度保留 NUL"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "AMF 是 Adobe 的二进制对象序列化格式。AMF0 与 AMF3 的类型标记和部分字段布局不同，不能仅因为都是 AMF 就使用同一字节解释。",
          "AMF3 可用 U29 变长整数，并维护字符串、复杂对象和对象特征的引用表以减少重复。字符串内容为 UTF-8，长度与引用标记一起决定如何读取后续字节。"
        ],
        "sourceIds": [
          "amf3",
          "amf0",
          "implementation",
          "site-correction"
        ],
        "examples": [
          {
            "label": "同一布尔值的两个版本",
            "input": "JSON true；分别选择 AMF0、AMF3",
            "output": "AMF0：01 01\nAMF3：03",
            "explanation": "AMF0 的01是布尔类型标记，后续01表示真；AMF3 的03类型标记自身即表示true。两种格式必须选择各自的解码版本，不能按同一标记表读取。"
          },
          {
            "label": "UTF-8 字节决定字符串长度",
            "input": "JSON 字符串 \"中\"；选择 AMF3",
            "output": "06 07 E4 B8 AD",
            "explanation": "06为字符串标记；中占三个UTF-8字节，内联长度头是(3×2)+1=7；后面是E4 B8 AD。长度不是JavaScript字符数。"
          },
          {
            "label": "按长度保留隐藏的 NUL 字节",
            "input": "JSON 字符串 \"A\\u0000B\"",
            "output": "AMF0：02 00 03 41 00 42\nAMF3：06 07 41 00 42",
            "explanation": "载荷是41、00、42三个字节；U+0000属于字符串内容，解码按声明长度读取，不提前终止。本站适配保留原Reader并按四个AMF字符串字段的长度规则读取。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "本站从 JSON 表示编码，并让编码/解码选择同一版本。JSON 不涵盖所有 ActionScript 类型和对象关系，不能假定任意 AMF 数据往返都无损。",
          "本站公共适配沿用原编码库，修正了 AMF3 节点赋值和 AMF0 Unicode 长度兼容问题。AMF0 字符串长度以 UTF-8 字节计，超过 65535 字节时采用长字符串格式。解码仍展示库的类型节点字段树，不会自动整理为原始 JSON 值；可按类型标记和字段读取。"
        ],
        "sourceIds": [
          "implementation",
          "amf3",
          "amf0",
          "site-correction"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Avro%20to%20JSON",
    "capabilityIds": [
      "op:Avro%20to%20JSON"
    ],
    "relatedIds": [
      "op:Avro%20to%20JSON"
    ],
    "topicGroup": "formats",
    "title": "Avro 转 JSON",
    "summary": "二进制值按模式依次写入，容器在元数据中保存必要模式。",
    "aliases": [
      "Apache Avro",
      "schema",
      "Obj01"
    ],
    "sources": [
      {
        "id": "avro",
        "title": "Avro 1.11.2：模式和二进制编码",
        "publisher": "Apache Software Foundation",
        "url": "https://avro.apache.org/docs/1.11.2/specification/",
        "language": "en",
        "kind": "author-spec",
        "locator": "Binary Encoding；Object Container Files"
      },
      {
        "id": "avrocn",
        "title": "消息队列的数据存储格式：Avro 序列化",
        "publisher": "阿里云官方文档",
        "url": "https://help.aliyun.com/zh/dts/user-guide/data-formats-of-a-kafka-cluster-1",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Avro to JSON"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Avro 二进制编码通常不带每个字段的名字或类型，读取依赖写入时使用的 schema。record 按字段声明顺序连接值，int/long 使用 ZigZag 与变长编码。",
          "对象容器文件有 Obj 后接 01 的魔数、元数据及同步标记，元数据中的 avro.schema 帮助读取记录。本站此入口读 Avro 数据并转为可读 JSON，不提供任意未知原始值的模式猜测。"
        ],
        "sourceIds": [
          "avro",
          "avrocn",
          "implementation"
        ],
        "examples": [
          {
            "label": "已知 string 模式的格式层演算",
            "input": "字符串 ARG；schema 为 string",
            "output": "06 41 52 47",
            "explanation": "UTF-8 内容为三个字节，长度 3 的 ZigZag 变长表示是 06；这四字节不是完整 Avro 容器。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "把四个裸 Avro 值字节当完整容器上传可能失败。JSON 与 Avro 的字节、长整数等类型存在表示差异，Force Valid JSON 改变输出的呈现约束。"
        ],
        "sourceIds": [
          "implementation",
          "avro",
          "avrocn"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:BSON%20serialise",
    "capabilityIds": [
      "pair:BSON%20serialise"
    ],
    "relatedIds": [
      "pair:BSON%20serialise"
    ],
    "topicGroup": "formats",
    "title": "BSON",
    "summary": "文档带总字节长度，元素带类型、字段名和对应值。",
    "aliases": [
      "BSON",
      "Binary JSON"
    ],
    "sources": [
      {
        "id": "bson",
        "title": "BSON 类型：UTF-8 与二进制数据",
        "publisher": "MongoDB 官方中文文档",
        "url": "https://www.mongodb.com/zh-cn/docs/manual/reference/bson-types/",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "bsonspec",
        "title": "BSON 1.1 规范：长度、元素类型和终止字节",
        "publisher": "BSON 项目",
        "url": "https://bsonspec.org/spec.html",
        "language": "en",
        "kind": "author-spec",
        "locator": "Basic Types；Non-terminals"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "BSON serialise / BSON deserialise"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "BSON 文档以四字节小端长度开始，随后是元素，末尾为 00。每个元素带类型标记、以 00 终止的字段名，以及该类型的值表示；不能将 JSON 文本直接加魔数当 BSON。",
          "字符串使用 UTF-8，并包含自身长度和终止字节。BSON 还支持 JSON 不直接具备的类型，如 ObjectId、日期和二进制，因此两种格式的类型集合不完全相同。"
        ],
        "sourceIds": [
          "bson",
          "bsonspec",
          "implementation"
        ],
        "examples": [
          {
            "label": "最小 BSON 文档",
            "input": "{}",
            "output": "05 00 00 00 00",
            "explanation": "小端长度 5：四字节总长度加一字节文档结束符，没有元素。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "本站序列化输入须为合法 JSON。某些 BSON 特有类型与超出 JavaScript 精确整数范围的值需要额外表示，普通 JSON 不能保证无损往返。"
        ],
        "sourceIds": [
          "implementation",
          "bson",
          "bsonspec"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:CBOR%20Encode",
    "capabilityIds": [
      "pair:CBOR%20Encode"
    ],
    "relatedIds": [
      "pair:CBOR%20Encode"
    ],
    "topicGroup": "formats",
    "title": "CBOR 编码与解码",
    "summary": "高 3 位指定主类型，低 5 位指定小值或后续长度形式。",
    "aliases": [
      "CBOR",
      "major type",
      "RFC 8949"
    ],
    "sources": [
      {
        "id": "cbor",
        "title": "RFC 8949：CBOR 数据项与首字节",
        "publisher": "IETF / RFC Editor",
        "url": "https://www.rfc-editor.org/rfc/rfc8949.html",
        "language": "en",
        "kind": "standard",
        "locator": "§ 3；Appendix A"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "CBOR Encode / CBOR Decode"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "CBOR 首字节高 3 位为 major type，低 5 位为 additional information。小于 24 的参数可直接放低位，更大的值需要后续 1、2、4 或 8 字节表示参数。",
          "主类型 0 为非负整数，1 为负整数（值为 −1−参数），2 为字节串，3 为 UTF-8 文本，4 为数组，5 为映射；长度的具体含义由主类型决定。"
        ],
        "sourceIds": [
          "cbor",
          "implementation"
        ],
        "examples": [
          {
            "label": "单字节整数演算",
            "input": "整数 10 与整数 −1",
            "output": "10 → 0A；−1 → 20",
            "explanation": "0A 是主类型 0、参数 10；20 是主类型 1、参数 0，即 −1−0。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "本站从 JSON 数据编码，所以 JSON 未覆盖的 CBOR 标签、字节类型或大整数可能需专门表示。解码后的展示不等于所有 CBOR 值都能无损转成普通 JSON。"
        ],
        "sourceIds": [
          "implementation",
          "cbor"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:CSS%20selector",
    "capabilityIds": [
      "op:CSS%20selector"
    ],
    "relatedIds": [
      "op:CSS%20selector"
    ],
    "topicGroup": "formats",
    "title": "CSS 选择器",
    "summary": "解析文档后，用选择器找出符合结构与属性条件的元素。",
    "aliases": [
      "CSS 选择器",
      "DOM 查询"
    ],
    "sources": [
      {
        "id": "selectors",
        "title": "CSS 选择器：元素、类与属性选择",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Selectors",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "CSS selector"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "类型选择器 p 选 p 元素，.clue 选 class 中含 clue 的元素，[data-id=\"a\"] 选属性满足条件者；空格与 > 分别表示后代与直接子元素关系。",
          "本站对输入 HTML 应用 CSS 选择器，提取匹配元素。它与 XPath 的路径和属性写法不同；多条匹配的输出顺序及表示以实现为准。"
        ],
        "sourceIds": [
          "selectors",
          "implementation"
        ],
        "examples": [
          {
            "label": "类型加类条件",
            "input": "<p class=\"clue\">KEY</p><p>OTHER</p>；p.clue",
            "output": "匹配第一个 p，文本为 KEY",
            "explanation": "第二个 p 没有 clue 类，所以不匹配。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "选择器结果只证明节点满足条件，不证明它在屏幕可见或属于作者有意隐藏的线索。伪类支持也受使用的解析器版本限制。"
        ],
        "sourceIds": [
          "implementation",
          "selectors"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:JPath%20expression",
    "capabilityIds": [
      "op:JPath%20expression"
    ],
    "relatedIds": [
      "op:JPath%20expression"
    ],
    "topicGroup": "formats",
    "title": "JPath 表达式",
    "summary": "从根对象按成员和数组位置逐级选择值。",
    "aliases": [
      "JSONPath",
      "JPath"
    ],
    "sources": [
      {
        "id": "jsonpath",
        "title": "JSONPath：JSON 节点路径与数组索引",
        "publisher": "Stefan Gössner 原始设计文档",
        "url": "https://goessner.net/articles/JsonPath/",
        "language": "en",
        "kind": "author-spec",
        "locator": "JSONPath expressions"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "JPath expression"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "JSONPath 用 $ 表示根，点号或方括号访问字段，数组索引通常从 0 开始。例如 $.clues[0].answer 读取 clues 数组第一项的 answer。",
          "通配符 * 可选择一组成员，递归下降与过滤表达式还能描述更复杂条件。本站 JPath 使用所集成的 JSONPath 方言，结果分隔符连接多条选值。"
        ],
        "sourceIds": [
          "jsonpath",
          "implementation"
        ],
        "examples": [
          {
            "label": "第一项字段",
            "input": "{\"clues\":[{\"answer\":\"KEY\"}]}；$.clues[0].answer",
            "output": "KEY",
            "explanation": "[0] 指第一项；字段名 answer 不能当成数组下标。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "XPath 通常从 1 计集合位置，而 JSONPath 从 0 计数组位置。历史 JSONPath 实现与后来的 RFC 9535 并非每个语法细节都一致，应核对当前支持范围。"
        ],
        "sourceIds": [
          "implementation",
          "jsonpath"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Jq",
    "capabilityIds": [
      "op:Jq"
    ],
    "relatedIds": [
      "op:Jq"
    ],
    "topicGroup": "formats",
    "title": "Jq 查询",
    "summary": "每个过滤器接收并输出值，管道将输出继续送入下一步。",
    "aliases": [
      "jq",
      "JSON 过滤器"
    ],
    "sources": [
      {
        "id": "jq",
        "title": "jq 1.6：过滤器、管道和数组查询",
        "publisher": "jq 项目",
        "url": "https://jqlang.org/manual/v1.6/",
        "language": "en",
        "kind": "author-spec",
        "locator": "Basic filters"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Jq"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "jq 的 . 表示当前输入，.name 读取字段，.[] 迭代数组元素。过滤器可以生成零个、一个或多个值，管道 | 把前一步每个输出继续处理。",
          "select(.n>1) 按条件保留值，map(...) 收集逐项结果。本站 Raw 选项控制字符串是否以原始文字形式输出，与 JSON 引号显示不同。"
        ],
        "sourceIds": [
          "jq",
          "implementation"
        ],
        "examples": [
          {
            "label": "过滤数组项后取字段",
            "input": "[{\"n\":1},{\"n\":2}]；.[] | select(.n > 1) | .n",
            "output": "2",
            "explanation": "迭代两项，只保留 n 大于 1 的第二项，再取 n 值。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "jq 是独立查询语言，不是任意 JavaScript。管道多值输出和数组输出的区别会影响后续处理，空结果也不等于 null 字符串。"
        ],
        "sourceIds": [
          "implementation",
          "jq"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:JSON%20to%20YAML",
    "capabilityIds": [
      "pair:JSON%20to%20YAML"
    ],
    "relatedIds": [
      "pair:JSON%20to%20YAML"
    ],
    "topicGroup": "formats",
    "title": "JSON / YAML",
    "summary": "JSON 的对象和数组分别对应 YAML 映射和序列，标量需保留类型。",
    "aliases": [
      "YAML",
      "JSON 转 YAML"
    ],
    "sources": [
      {
        "id": "yaml",
        "title": "YAML 1.2.2 规范：映射、序列和标量",
        "publisher": "YAML Language Development Team",
        "url": "https://yaml.org/spec/1.2.2/",
        "language": "en",
        "kind": "author-spec",
        "locator": "§ 2.1；§ 2.3"
      },
      {
        "id": "json",
        "title": "JSON：语法、字符串和数据类型",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "JSON to YAML / YAML to JSON"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "JSON 用花括号和方括号表示结构；YAML 常用缩进、冒号和短横线。二者都可表示映射、序列及标量，但 YAML 还允许 JSON 不具备的语法与类型形式。",
          "双向转换先解析逻辑值再用目标语法写出。字符串 KEY 与数字 7 必须保留各自类型；缩进影响 YAML 层次，不能只把逗号换成换行。"
        ],
        "sourceIds": [
          "yaml",
          "json",
          "implementation"
        ],
        "examples": [
          {
            "label": "映射的常见写法",
            "input": "{\"clue\":\"KEY\",\"n\":7}",
            "output": "clue: KEY\nn: 7",
            "explanation": "两字段处于同一层；KEY 是字符串，7 是数字。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "YAML 版本与 schema 影响 yes、日期或特殊数字等标量解释。转换通常不保留注释、锚点书写和原来的样式，JSON 对任意键类型也有限制。"
        ],
        "sourceIds": [
          "implementation",
          "yaml",
          "json"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-op:Jsonata%20Query",
    "capabilityIds": [
      "op:Jsonata%20Query"
    ],
    "relatedIds": [
      "op:Jsonata%20Query"
    ],
    "topicGroup": "formats",
    "title": "JSONata 查询",
    "summary": "点号映射成员，方括号筛选序列，表达式还可计算或重构结果。",
    "aliases": [
      "JSONata",
      "路径映射"
    ],
    "sources": [
      {
        "id": "jsonata",
        "title": "JSONata 路径运算：映射、过滤和排序",
        "publisher": "JSONata 项目",
        "url": "https://docs.jsonata.org/path-operators",
        "language": "en",
        "kind": "author-spec",
        "locator": "Map；Filter"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Jsonata Query"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "JSONata 的路径链从当前对象读取成员，并可在数组上逐项映射。方括号中的表达式作谓词，例如 clues[n=2].answer 选 n 等于 2 的条目答案。",
          "JSONata 可以把字段值用于算术、函数和对象构造；它的序列模型还会对空序列与单值序列作特殊处理，不能按 JavaScript 数组方法直接类比。"
        ],
        "sourceIds": [
          "jsonata",
          "implementation"
        ],
        "examples": [
          {
            "label": "谓词选择",
            "input": "{\"clues\":[{\"n\":1,\"answer\":\"A\"},{\"n\":2,\"answer\":\"B\"}]}；clues[n=2].answer",
            "output": "B",
            "explanation": "谓词留下第二个对象，随后取 answer 字段。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "JSONata、JSONPath 与 jq 是三种不同语言。方括号索引、真假判断和输出是否包数组须依当前语言规则核对。"
        ],
        "sourceIds": [
          "implementation",
          "jsonata"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:To%20MessagePack",
    "capabilityIds": [
      "pair:To%20MessagePack"
    ],
    "relatedIds": [
      "pair:To%20MessagePack"
    ],
    "topicGroup": "formats",
    "title": "MessagePack 编码与解码",
    "summary": "以首字节区分值类型，并把短字符串和小整数紧凑写入。",
    "aliases": [
      "MessagePack",
      "fixmap",
      "fixstr"
    ],
    "sources": [
      {
        "id": "msgpack",
        "title": "MessagePack：二进制对象格式及实例",
        "publisher": "MessagePack 项目",
        "url": "https://msgpack.org/",
        "language": "en",
        "kind": "author-spec",
        "locator": "格式说明；示例"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "To MessagePack / From MessagePack"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "MessagePack 是二进制对象格式，支持整数、布尔、字符串、数组、映射等。小整数和短数组、短字符串可将一部分长度或值信息直接编码在首字节。",
          "例如一个单键映射可用 fixmap 前缀 81，键 a 用 fixstr 长度 1 前缀 A1 后接 61，小整数 1 直接写 01；不是把 JSON 文本整体压缩。"
        ],
        "sourceIds": [
          "msgpack",
          "implementation"
        ],
        "examples": [
          {
            "label": "单键映射演算",
            "input": "{\"a\":1}",
            "output": "81 A1 61 01",
            "explanation": "81=一对键值；A1=长度为 1 的字符串；61=a；01=整数 1。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "MessagePack 的键类型、二进制和扩展类型比普通 JSON 丰富。本站从 JSON 开始的编码子集与解码展示需要分别核对，二进制输出应按字节传递。"
        ],
        "sourceIds": [
          "implementation",
          "msgpack"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:PHP%20Serialize",
    "capabilityIds": [
      "pair:PHP%20Serialize"
    ],
    "relatedIds": [
      "pair:PHP%20Serialize"
    ],
    "topicGroup": "formats",
    "title": "PHP 序列化",
    "summary": "写入类型、字符串字节长度和集合结构，再按这些字段反解析。",
    "aliases": [
      "PHP serialize",
      "PHP 反序列化"
    ],
    "sources": [
      {
        "id": "php",
        "title": "serialize：保留值类型和结构",
        "publisher": "PHP 官方中文手册",
        "url": "https://www.php.net/manual/zh/function.serialize.php",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "phpdecode",
        "title": "unserialize：恢复序列化值",
        "publisher": "PHP 官方中文手册",
        "url": "https://www.php.net/manual/zh/function.unserialize.php",
        "language": "zh-CN",
        "kind": "official-doc",
        "locator": ""
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "PHP Serialize / PHP Deserialize"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "PHP 序列化字符串用类型标记区分值，整数常见 i:1;，布尔 b:1;，null 为 N;。字符串中的长度指字节数，不是可见汉字数量。",
          "数组记录元素对数量及每个键和值，因而可以保留键类型和嵌套结构。本站 JSON 输入可转换为受支持的 PHP 序列化表示，再由反方向读取。"
        ],
        "sourceIds": [
          "php",
          "phpdecode",
          "implementation"
        ],
        "examples": [
          {
            "label": "单字段关联数组",
            "input": "{\"a\":1}",
            "output": "a:1:{s:1:\"a\";i:1;}",
            "explanation": "a:1 表示一对元素；键为一字节字符串 a，值为整数 1。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "JSON 与 PHP 对象、引用及资源类型不完全一致，不能将任意 PHP 对象当成普通 JSON 无损还原。这里读取表示数据，不运行 PHP 对象的方法。"
        ],
        "sourceIds": [
          "implementation",
          "php",
          "phpdecode"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Protobuf%20Encode",
    "capabilityIds": [
      "pair:Protobuf%20Encode"
    ],
    "relatedIds": [
      "pair:Protobuf%20Encode"
    ],
    "topicGroup": "formats",
    "title": "Protobuf 编码与解码",
    "summary": "把字段号左移三位，与 wire type 组合，再按线类型写值。",
    "aliases": [
      "Protobuf",
      "varint",
      "wire type",
      ".proto"
    ],
    "sources": [
      {
        "id": "protobuf",
        "title": "Protocol Buffers：线类型、标签与变长整数",
        "publisher": "Protocol Buffers 项目",
        "url": "https://protobuf.dev/programming-guides/encoding/",
        "language": "en",
        "kind": "author-spec",
        "locator": "Base 128 Varints；Message Structure"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Protobuf Encode / Protobuf Decode"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Protobuf 标签为 (field_number << 3) | wire_type。字段号 1 的 VARINT 线类型 0 得标签 08；值的名字和声明类型通常要用 .proto 模式才能正确解释。",
          "Varint 每字节低 7 位存有效数据，最高位指示是否还有下一字节，低位组先写。150 拆为 22 与 1，写成 96 01，因此完整字段为 08 96 01。"
        ],
        "sourceIds": [
          "protobuf",
          "implementation"
        ],
        "examples": [
          {
            "label": "uint32 字段演算",
            "input": "schema：message Clue { uint32 n = 1; }；JSON {\"n\":150}",
            "output": "08 96 01",
            "explanation": "08 是字段 1/线类型 0；96 的最高位为 1，01 结束变长整数。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "无模式解码可显示字段号和线类型，却不保证区分 string、bytes、嵌套消息或某些整数解释。本站编码要提供 schema；解码一次处理一条消息。"
        ],
        "sourceIds": [
          "implementation",
          "protobuf"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  },
  {
    "id": "function-pair:Rison%20Encode",
    "capabilityIds": [
      "pair:Rison%20Encode"
    ],
    "relatedIds": [
      "pair:Rison%20Encode"
    ],
    "topicGroup": "formats",
    "title": "Rison 编码与解码",
    "summary": "使用紧凑标点表示 JSON 类数据，减少 URI 中的转义负担。",
    "aliases": [
      "Rison",
      "Kibana URL",
      "!t"
    ],
    "sources": [
      {
        "id": "risonspec",
        "title": "Rison：紧凑 URL 对象编码",
        "publisher": "rison-node 作者文档",
        "url": "https://github.com/w33ble/rison-node",
        "language": "en",
        "kind": "author-spec",
        "locator": "Rison syntax"
      },
      {
        "id": "rison",
        "title": "Kibana URL 状态与 Rison",
        "publisher": "Elastic 官方文档",
        "url": "https://www.elastic.co/docs/extend/kibana/key-concepts/platform-architecture/routing-navigation-and-url",
        "language": "en",
        "kind": "official-doc",
        "locator": "Syncing state with URL"
      },
      {
        "id": "implementation",
        "title": "本站所用 CyberChef 操作与参数",
        "publisher": "CyberChef / GCHQ",
        "url": "/vendor/cyberchef/catalogue.json",
        "language": "en",
        "kind": "implementation",
        "locator": "Rison Encode / Rison Decode"
      }
    ],
    "sections": [
      {
        "title": "规则与机制",
        "paragraphs": [
          "Rison 使用圆括号表示对象，!(...) 表示数组，!t、!f、!n 分别表示 true、false、null。可作标识符的字符串可省引号，复杂字符串仍需按规则引用和转义。",
          "普通 JSON {\"a\":1,\"ok\":true} 可写成 (a:1,ok:!t)。本站还可选择对象、数组或 URI 相关编码选项；外层是否省略和是否进行百分号编码是不同问题。"
        ],
        "sourceIds": [
          "risonspec",
          "rison",
          "implementation"
        ],
        "examples": [
          {
            "label": "对象与布尔",
            "input": "{\"a\":1,\"ok\":true}",
            "output": "(a:1,ok:!t)",
            "explanation": "圆括号包对象，逗号分字段，布尔真使用 !t。"
          }
        ]
      },
      {
        "title": "边界与参数",
        "paragraphs": [
          "它在 Kibana 等 URL 状态中出现，但不是所有 URL 参数的通用格式，也不是加密。对象键顺序或写法可能变化，而逻辑值相同。"
        ],
        "sourceIds": [
          "implementation",
          "risonspec",
          "rison"
        ],
        "examples": []
      }
    ],
    "misconceptions": []
  }
];
