// Individually authored lessons. Helpers compose metadata, never substitute a
// generic group explanation for the mechanism of a registered capability.
const source = (
  id,
  title,
  publisher,
  url,
  kind = 'official-doc',
  locator = '',
  language = 'en',
) => ({ id, title, publisher, url, kind, locator, language });
const worked = (input, output, explanation, label = '逐步核算') => ({
  label,
  input,
  output,
  explanation,
});
const section = (title, paragraphs, sourceIds, examples = []) => ({
  title,
  paragraphs,
  sourceIds,
  examples,
});
const article = (
  capability,
  title,
  topicGroup,
  summary,
  aliases,
  sources,
  sections,
  misconceptions = [],
) => ({
  id: 'function-' + capability,
  capabilityIds: [capability],
  relatedIds: [capability],
  title,
  topicGroup,
  summary,
  aliases,
  sources,
  sections,
  misconceptions,
});
const constraints = source(
  'rules',
  '焖肉面中文规则脚本规范',
  'philippica / cipher_machine',
  'https://github.com/philippica/cipher_machine/wiki/%E7%84%96%E8%82%89%E9%9D%A2%E8%84%9A%E6%9C%AC%E6%96%87%E6%A1%A3',
  'author-spec',
  '格子范围、互异、和、连续段、排列、条件、回路与桥连',
  'zh-CN',
);
const constraintImplementation = source(
  'parser',
  '固定版本的中文规则解析器',
  'philippica / cipher_machine',
  'https://github.com/philippica/cipher_machine/blob/29fa4ee1c60873484688c250b37c87d93f54cae4/src/sudoku/solverParser.js',
  'implementation',
  'SolverParser 的规则转换',
  'zh-CN',
);
const wordImplementation = source(
  'words',
  '固定版本查词核心',
  'philippica / cipher_machine',
  'https://github.com/philippica/cipher_machine/blob/29fa4ee1c60873484688c250b37c87d93f54cae4/src/one-word/one-word.js',
  'implementation',
  'contains、stringInclude、findByCode',
);
const iupac = source(
  'iupac',
  'Periodic Table of Elements',
  'IUPAC 国际纯粹与应用化学联合会',
  'https://iupac.org/what-we-do/periodic-table-of-elements/',
  'standard',
  '118 个正式元素名称、符号与原子序数',
);
const elementImplementation = source(
  'implementation',
  '元素符号分词与完整候选计数',
  '迷雾工具箱',
  '/expansion/element-core.js',
  'implementation',
  'elementDecompositions / elementWords',
  'zh-CN',
);

export const articles = [
  article(
    'native:element-words',
    '元素符号词库筛选',
    'matter',
    '对所选完整词库逐词判断是否能完全拆成正式元素符号。',
    ['Element words', '周期表单词'],
    [iupac, elementImplementation],
    [
      section(
        '逐词分词而非搜索元素名称',
        [
          '先按指定长度范围读取词条，再对每个纯字母词运行元素符号分词。只有从首字母到末字母全部有合法符号覆盖的词才收录。',
          '结果记录这个词的完整分法数与首个分法；首个分法是展示样本，不意味着这个词只能这样拆。检查某个词的全部分法应进入元素符号拼词。',
        ],
        ['iupac', 'implementation'],
        [
          worked(
            '待筛词条为 bacon、xyz',
            'bacon 可以按 Ba+C+O+N 拆分；xyz 不能完整拆分',
            'Ba 是钡，C、O、N 分别是碳、氧、氮；X 不是现行单字母元素符号，所以 xyz 无法从首位开始。示例只核验给定两条词，不假设任意词库都含它们。',
          ),
        ],
      ),
      section(
        '词库覆盖和大小写',
        [
          '词库与元素表是两个独立来源：118 个正式元素不缺项，不意味着所选词库收录所有语言的词。按长度、大小写筛选会改变结果，输入中的非纯字母词条不会冒充可分词单词。',
          '筛选和结果都在本地完成。全词库可能产生大量候选，结果分页与下载应保留全部命中，不能把显示第一页当作总共只有一页。',
        ],
        ['implementation'],
      ),
    ],
  ),
  article(
    'native:stroke-endpoints',
    '汉字笔画首尾匹配',
    'text-language',
    '用每一笔的起点和终点形状，在固定汉字笔画数据中排列候选。',
    ['笔画端点', 'Stroke endpoints'],
    [
      source(
        'upstream',
        'ChinesePuzzleTool 固定原始实现',
        'philippica',
        'https://github.com/philippica/ChinesePuzzleTool/tree/8b4ebec728138981a94b4ff743026084e9e37ef5',
        'implementation',
        'factorHan.js / out.js 中的笔画资料及几何匹配',
      ),
      source(
        'matcher',
        '本站首尾点归一化与完整字库匹配',
        '迷雾工具箱',
        '/expansion/stroke-core.js',
        'implementation',
        'normalizeEndpoints / matchStrokeEndpoints',
        'zh-CN',
      ),
    ],
    [
      section(
        '端点集合的几何比较',
        [
          '每笔提供起点和终点，一笔对应两个点。先按所有点的包围框归一化到 0–999 坐标，再只与笔数一致的汉字数据比较。原始笔画曲线中的中间转折没有被输入，因此不能凭两个端点确定全部笔形。',
          '固定上游比较器对端点距离作最大权匹配，并结合总距离与最大偏差形成排序分数。它不是手写图像 OCR，也不保证按输入的第一笔直接对应字库第一笔。',
        ],
        ['upstream', 'matcher'],
        [
          worked(
            '端点 (10,20)、(30,20)，只输入一笔',
            '归一化为 (0,499.5)、(999,499.5)，只比较字库中的一笔汉字',
            '横向跨度为 20，纵向跨度为零；零跨度轴放在中间。这个几何例子可以复核，但不把它宣称为唯一汉字识别结果。',
          ),
        ],
      ),
      section(
        '顺序、字库和退化输入',
        [
          '支持 1–48 笔，点数须为偶数。所有点重合没有可比较的形状，直接报错；单一竖向或横向跨度允许保留，不把它除以零。',
          '候选由固定上游数据决定，匹配分数不是识别概率。字形、笔画拆分和草写习惯不同可能改变结果，不能用排序第一作为字源或字形规范依据。',
        ],
        ['matcher'],
      ),
    ],
  ),

  article(
    'native:hunt-constraints-custom',
    '自定义中文规则',
    'logic',
    '把有限取值、区域关系和条件组合成可以核验的格子约束问题。',
    ['中文约束脚本', 'Constraint satisfaction'],
    [constraints, constraintImplementation],
    [
      section(
        '变量、取值域和约束相交',
        [
          '每一格是变量，取值规则指定有限域；互异、和、计数、线性组合、条件与排列继续缩小合法赋值。单词规则查询真实词库，连续段、回路和桥连规则有自己的全局结构，不能简化成邻格着色。',
          '编号按题面规则对应实际格子，区域不能越界。解析成功只证明语法和局部范围有效，不证明所有规则存在共同解。',
        ],
        ['rules', 'parser'],
        [
          worked(
            '两格 x、y 取 0–3 的整数，并要求 2x+3y=8',
            '唯一组合为 x=1、y=2',
            '依次令 y=0、1、2、3，x 分别为 4、2.5、1、−0.5；只有 y=2 时 x 仍为域内整数。可写成第[1,2]格的系数是[2,3],线性组合是8。',
          ),
        ],
      ),
      section(
        '条件、停止和可解释性',
        [
          '“如果 A，那么 B”仅在 A 成立时要求 B，不等于同时无条件要求 A 和 B。回路、桥连或多重集合也必须使用各自真实规则，不能以看起来接近的和约束代替。',
          '搜索可能指数增长。本站限制题面、规则和时间；结果要区分可行解、完整枚举、矛盾与被停止的部分搜索。用户修改题面后旧解立刻失效。',
        ],
        ['rules', 'parser'],
      ),
    ],
  ),
  article(
    'native:dictionary-substitution',
    '词库单表替换求解',
    'cipher-analysis',
    '利用重复字母模式与词边界，在完整所选词库中传播一一对应关系。',
    ['Dictionary substitution', '带空格替换密码'],
    [
      source(
        'solver',
        '固定版本单表替换求解器',
        'philippica / cipher_machine',
        'https://github.com/philippica/cipher_machine/blob/29fa4ee1c60873484688c250b37c87d93f54cae4/src/substitution/substitution.js',
        'implementation',
        'Token、MappingTable、候选传播与搜索',
      ),
      source(
        'words',
        '上游单表工具说明',
        'philippica / cipher_machine',
        'https://github.com/philippica/cipher_machine/blob/29fa4ee1c60873484688c250b37c87d93f54cae4/readme.md',
        'author-spec',
        '带空格的单表暴力',
        'zh-CN',
      ),
    ],
    [
      section(
        '重复模式与全局一致映射',
        [
          '单表替换要求同一个密文字母总映射到同一个明文字母，不同密文字母的映射不能相撞。先把每个词改写成重复模式，例如 abb，再从词库取同模式、同长度的候选。',
          '多个词共享同一映射表。一个词的候选会排除其他词中冲突的候选，剩余歧义由搜索展开；不能给每个词各选一个看似合理的词就结束。',
        ],
        ['solver'],
        [
          worked(
            '密文 xyy；只考虑词库候选 all、too、see',
            '三者都符合 abb，单靠这个词不能唯一选择',
            'xyy 的第二、第三字母相同，首字母不同；三个候选都有这种结构。若另一词已确定 x→s，则只剩 see 可同时满足全局映射。',
          ),
        ],
      ),
      section(
        '词典限制与多解',
        [
          '词边界是此方法的重要输入；任意删空格、漏词或专名未收录会改变候选集合。本站使用所选完整本地词表，不把服务端网站返回结果当作本地求解。',
          '这与统计打分的单表求解互为补充。词库多解、候选上限或超时必须明确显示，找到可读句子也不能自动证明它就是作者原文。',
        ],
        ['solver', 'words'],
      ),
    ],
  ),
  article(
    'native:words-contains',
    '字母包含与限定查词',
    'text-language',
    '保留原查词器两种包含判定的并集，与严格字母重排区分。',
    ['Contains words', '字母超集', '仅指定字母'],
    [wordImplementation],
    [
      section(
        '两种条件以“或”相连',
        [
          '第一种判定要求词中至少包含查询字母的全部次数，允许出现额外字母。第二种判定只要求词里的每种字母来自查询的字母种类，不限制这些字母重复多少次。命中任一判定都会被收录。',
          '因此它不是严格同长、同频次的 anagram，也不是“字母必须连续出现”的子串查找。重复次数在第一种判定中有意义，在第二种判定中只用于确定可用字母种类。',
        ],
        ['words'],
        [
          worked(
            '查询 ab；分别判断 cab、baa、cat',
            'cab 和 baa 满足规则，cat 不满足',
            'cab 包含 a、b 各至少一次；baa 的字母全部属于 {a,b}。cat 缺少 b 且含有集合外的 c、t，因此两个分支都不通过。是否实际列出还取决于所选词库。',
          ),
        ],
      ),
      section(
        '词库和重复次数',
        [
          '例如查询 aab 时，第一种分支要求至少两个 a 和一个 b；第二种分支仍只允许 a、b 两类字母，并不把词长限制为三。需要逐字母计数相等时应使用既有严格重排功能。',
          '切换完整词表或词类过滤会改变可列出的词，不改变上述判定语义；空查询不能被当成无限通配式自动枚举所有内容。',
        ],
        ['words'],
      ),
    ],
  ),
  article(
    'native:words-code',
    '自定义谓词查词',
    'text-language',
    '在本地隔离 QuickJS 中，对所选词库逐词运行用户明确编写的筛选函数。',
    ['Predicate word search', 'JS 查词'],
    [
      wordImplementation,
      source(
        'quickjs',
        'QuickJS JavaScript Engine',
        'Fabrice Bellard / Charlie Gordon',
        'https://www.bellard.org/quickjs/quickjs.html',
        'official-doc',
        'Runtime memory limit、interrupt handler 与 API',
      ),
    ],
    [
      section(
        '函数的返回值就是命中条件',
        [
          '函数签名为 (word, tools) => 返回值。每个词分别传入；返回假值就不收录，返回真值则将该值字符串化作为结果，因此可以返回原词，也可以返回计算后的文本。',
          'tools.isWord(s) 按当前完整词库判断是否有该词。上游 tools.anagram(s,letters) 的实际语义是 s 至少包含 letters 的字符次数，允许多余字符，并非严格同长重排；不要仅凭函数名字猜其行为。',
        ],
        ['words'],
        [
          worked(
            'word => word.length === 5 && word',
            '只保留长度为 5 的词，并返回这些词本身',
            '长度不符时 && 返回 false，符合时返回 word；若写成 word => word.length === 5，则符合的词会返回字符串 true，丢失原词。',
          ),
        ],
      ),
      section(
        '隔离与资源边界',
        [
          '本站把用户函数放进 QuickJS 运算环境，不在页面或宿主 Worker 上使用 eval，也不向函数开放 DOM、网络和宿主对象。语法错误应报错，不能悄悄转换成零命中。',
          '自定义程序可能死循环或产生巨大结果，因此保留独立线程、约十秒执行上限、128 MB 引擎内存与 32 MB 输出限额。达到限额说明此次搜索未完整结束，不能声称词库里没有其他答案。',
        ],
        ['quickjs', 'words'],
      ),
    ],
  ),
];
