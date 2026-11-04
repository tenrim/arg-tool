export const articles = [
  {
    id: 'function-native:character-tables',
    capabilityIds: ['native:character-tables'],
    relatedIds: ['native:character-tables'],
    title: '语言文字字符表',
    topicGroup: 'characters-reference',
    summary: '按语言常用字符集和 Unicode 文字系统浏览字符、码点、组合标记与数字符号。',
    aliases: [
      '假名',
      '韩文字母',
      '希腊字母',
      '西里尔文字',
      '希伯来文',
      '阿拉伯文',
      '泰文',
      '天城文',
      '数字符号',
      '卢恩文字',
      '罗马数字',
      '玛雅数字',
    ],
    sources: [
      {
        id: 'script',
        title: 'Unicode Script Property',
        publisher: 'Unicode Consortium',
        url: 'https://www.unicode.org/reports/tr24/tr24-39.html',
        kind: 'standard',
        language: 'en',
        locator:
          '1.1 Examples of Script Classification; 1.3 Scripts and Blocks; 3 Script_Extensions',
      },
      {
        id: 'cldr',
        title: 'LDML Part 2: General — Character Elements',
        publisher: 'Unicode Consortium',
        url: 'https://www.unicode.org/reports/tr35/tr35-77/tr35-general.html#Character_Elements',
        kind: 'standard',
        language: 'en',
        locator: '3.1 Exemplars; 3.2 Exemplar Syntax',
      },
      {
        id: 'ucd',
        title: 'Unicode Character Database 17.0.0',
        publisher: 'Unicode Consortium',
        url: 'https://www.unicode.org/reports/tr44/tr44-36.html',
        kind: 'standard',
        language: 'en',
        locator: 'UnicodeData.txt; Name; General_Category; Simple_Uppercase_Mapping',
      },
      {
        id: 'normalization',
        title: 'Unicode Normalization Forms',
        publisher: 'Unicode Consortium',
        url: 'https://www.unicode.org/reports/tr15/tr15-57.html',
        kind: 'standard',
        language: 'en',
        locator: '1.1 Canonical and Compatibility Equivalence; Hangul normalization',
      },
    ],
    sections: [
      {
        title: '文字中的数字与数值符号',
        sourceIds: ['ucd'],
        paragraphs: [
          'Unicode 的数值属性与字符类别分别记录。Nd 是十进制数字，Nl 是字母形数字，No 是其他数字；汉字中的部分 Lo 字符也有数值属性。因此数字字符表采用完整 DerivedNumericValues 数据，其中包含从 Unihan 派生的记录，而不只筛选 Nd、Nl、No 类别。',
          '十进制数字按所属文字系统保留原字符；罗马、算筹、玛雅、楔形及爱琴数字分别按名称、区段或文字属性分组。分数保留标准的整数比形式，避免有限小数产生误差。单字符的数值属性不等于一整段数字的计算规则，也不自动赋予希伯来字母等传统字母记数值。',
        ],
        examples: [
          {
            label: '相同数值与精确分数',
            input: '๑、⅓、億',
            output: '๑：U+0E51，数值 1；⅓：U+2153，数值 1/3；億：U+5104，数值 100000000',
            explanation:
              '泰文数字、分数符号与汉字各有独立码点；数值元数据不会改变复制和导出的原字符。',
          },
        ],
      },
      {
        title: '语言与文字系统',
        sourceIds: ['script', 'cldr'],
        paragraphs: [
          '语言和文字系统不是一一对应。日语同时使用平假名、片假名和汉字；西里尔文字、阿拉伯文字、天城文各自用于多种语言。Unicode 的 Script 属性标明主要文字系统，Script_Extensions 补充多个文字系统共用的字符。区块是码点分区，不能单独代替文字系统归属。',
          '字符表的常用与辅助集合来自 CLDR 的指定语言记录，完整文字系统来自固定 Unicode 17.0.0。俄语和印地语常用集合分别是西里尔文字和天城文的一部分；日语汉字及韩语汉字只采用 CLDR 收录的范围。',
        ],
        examples: [
          {
            label: '日文的两种假名',
            input: 'あ、ア',
            output: 'あ：U+3042，Hiragana；ア：U+30A2，Katakana',
            explanation:
              '两个字符属于不同文字系统，各有自己的码点。日文页面同时提供这两种字符的浏览入口。',
          },
        ],
      },
      {
        title: '字符名称、大小写和序列',
        sourceIds: ['ucd', 'cldr'],
        paragraphs: [
          '码点写作 U+ 加十六进制数字，标准名称是 Unicode 数据库中的标识。常用希腊文和俄文集合在 CLDR 主字符与索引字符的基础上补充 UCD 简单大小写对应；原始辅助集合保留其字符序列。',
          '组合标记可以依附于前一个字符。字符表在单独的标记前显示虚线圆，圆圈仅辅助观察，不属于复制内容。一个看起来完整的字符也可能由多个码点组成，例如俄语带重音的 а́ 包含 U+0430 和 U+0301。',
        ],
        examples: [
          {
            label: '希腊字母大小写',
            input: 'α',
            output: 'U+03B1 GREEK SMALL LETTER ALPHA；大写 Α 为 U+0391',
            explanation:
              '大小写分别有独立码点，查询与导出保留各自字符，不用字体变换替代真正的大写字符。',
          },
        ],
      },
      {
        title: '韩文字母和音节',
        sourceIds: ['normalization', 'ucd'],
        paragraphs: [
          '韩文合成音节位于 U+AC00 至 U+D7A3，包含 11,172 个现代音节。组合字母、兼容字母与合成音节拥有不同码点；兼容字母还有独立的兼容性分解关系。',
          '同一音节可以有预组形式和组合字母序列。字符表按来源字节复制，不自动进行 NFC、NFD 或兼容归一化，也不合并外观相近的条目。',
        ],
        examples: [
          {
            label: '合成音节与组合字母',
            input: '가',
            output: '预组形式 U+AC00；规范分解为 ᄀ U+1100 + ᅡ U+1161',
            explanation:
              '两种表示在规范归一化下对应同一音节，但原始码点数量不同；兼容字母 ㄱ U+3131 是另一条记录。',
          },
        ],
      },
    ],
  },
];
