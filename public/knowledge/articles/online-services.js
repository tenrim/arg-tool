// Each service keeps its own data model, identifier system, units and licence.
const source = (id, title, publisher, url, locator, language = 'en') => ({
  id,
  title,
  publisher,
  url,
  locator,
  language,
  kind: 'official-doc',
});
const section = (title, paragraphs, sourceIds, examples = []) => ({
  title,
  paragraphs,
  sourceIds,
  examples,
});
const example = (label, input, output, explanation) => ({ label, input, output, explanation });
const article = (id, title, topicGroup, summary, aliases, sources, sections, misconceptions) => ({
  id: 'function-native:' + id,
  capabilityIds: ['native:' + id],
  relatedIds: ['native:' + id],
  title,
  topicGroup,
  summary,
  aliases,
  sources,
  sections,
  misconceptions,
});
export const articles = [
  article(
    'zdic',
    '汉典字词原文',
    'language-reference',
    '读取汉典公开字词页的原文分节，明确区别于未公开的站内搜索接口。',
    ['汉典', 'zdic', '字典', '词典'],
    [
      source(
        'entry',
        '汉典 — 明',
        '汉典',
        'https://www.zdic.net/hans/明',
        '公开字页的读音、释义与原文分节',
        'zh-CN',
      ),
      source(
        'word',
        '汉典 — 不言而喻',
        '汉典',
        'https://www.zdic.net/hans/不言而喻',
        '公开词页释义与例证',
        'zh-CN',
      ),
      source(
        'terms',
        '汉典使用条款',
        '汉典',
        'https://www.zdic.net/terms/',
        '全站字词等内容 CC0 声明',
        'zh-CN',
      ),
      source(
        'robots',
        '汉典 robots.txt',
        '汉典',
        'https://zdic.net/robots.txt',
        '站点公开抓取路径边界',
      ),
    ],
    [
      section(
        '按具体字词读取公开词条',
        [
          '本站接入的是固定 /hans/ 路径的公开字词原文读取，属于公开页面解析（非官方 API）。输入具体汉字或词语后读取该词条中的实际公开分节；不使用 robots 禁止的动态 /api/，不提供或冒称全站模糊搜索、拼音检索及会员功能。',
          '同一字可能有多个音和义项，原文中的字音、词性、书证和时代应一起阅读。解析保留实际分节文字及原文链接，若版式变化、公开内容为空或有动态资料未返回，明确说明并留原站入口，不以本站生成解释填补。',
        ],
        ['entry', 'robots'],
        [
          example(
            '读音与义项不能随意拆开',
            '明',
            '读取 /hans/明 公开页的真实读音及释义分节。',
            '“明”在不同搭配中承担不同意义。应按原文义项及例证理解，不因某个近义字能替换就认定全部场景等义。',
          ),
        ],
      ),
      section(
        '词条、书证和可复核引用',
        [
          '词语查询使用完整词面，不自动把一个成语拆成单字释义再拼回去。例如“不言而喻”是作为一个词条读取，不等于将“不”“言”“而”“喻”的孤立含义相加。',
          '词条中的书证与转引文本保留原有出处，不能把所有引文都称为汉典原创或把有出处的古籍文字改写成新的事实断言。笔记保留完整本次公开分节、请求词面、原文地址和时间，预览省略不能截断实际保存内容。',
        ],
        ['word', 'entry'],
        [
          example(
            '完整词面查询',
            '不言而喻',
            '读取汉典对应成语词条，释义为无需说明便可明白。',
            '先确定词条整体含义，再用词条实际例证验证使用语境；这不是通过单字词频推断的结果。',
          ),
        ],
      ),
      section(
        'CC0 与访问边界',
        [
          '汉典使用条款对相关字词等内容声明 CC0，本站保留来源与该声明；这不等于有官方稳定 API，也不意味着允许无限频率查询、访问禁止路径或获取收费资料。本站采用保守限流，仅由用户明确提交触发读取。',
          '请求仅包含本次具体字词，经本站服务器送至汉典。页面、说明、关于和页脚均标明实际公开页读取；不下载音视频、书影或其他独立素材，遇到上游拒绝或页面变更时如实失败。',
        ],
        ['terms', 'robots'],
      ),
    ],
    ['公开字词页读取不是汉典全站 API。', '成语整体义不能由单字解释机械相加。'],
  ),
  article(
    'cnkgraph',
    '搜韵与诗文查询',
    'language-reference',
    '通过知识图谱网公开接口查诗文、作者、韵部和词曲谱，保留具体来源与非商业条件。',
    ['搜韵', 'CNKGraph', '知识图谱网', '诗词'],
    [
      source(
        'open',
        '知识图谱网开放资源',
        '知识图谱网 / 苏州图谱信息技术有限公司',
        'https://cnkgraph.com/Home/OpenResources',
        '开放 Web API、非商业研究学习、繁简输出',
        'zh-CN',
      ),
      source(
        'schema',
        'CNKGraph Open API schema',
        '知识图谱网',
        'https://open.cnkgraph.com/Api/index.yaml',
        '公开方法及真实参数与返回模型',
        'zh-CN',
      ),
      source(
        'examples',
        'CNKGraph 官方 Postman 示例',
        '知识图谱网',
        'https://open.cnkgraph.com/Api/postman.zip',
        '诗文库、字典、韵典、词汇词谱与古籍接口',
        'zh-CN',
      ),
    ],
    [
      section(
        '从作品、作者和片段分别检索',
        [
          '诗句片段、作品标题、作者和韵部是不同检索条件，应使用对应公开接口的真实参数。搜索结果保留服务返回的作者、时代、作品类型、正文、注释和关联字段，不用少量精选诗句替代全文服务。',
          '命中的同一句可能出现在不同作者、集子、版本或化用中，必须继续阅读真实作品及其出处。本站按登记的方法调用固定公开端点，不把界面提供的一种检索解释为已覆盖原网站每个功能。',
        ],
        ['open', 'schema', 'examples'],
        [
          example(
            '以标题和作者复核片段',
            '诗文片段或标题 静夜思；继续核对作者 李白',
            '读取实际命中的作品记录及正文、作者和来源字段。',
            '先确认命中是哪一作品及版本，再比较线索；标题相同或片段相似都不足以自动认定唯一出处。',
          ),
        ],
      ),
      section(
        '韵部、词谱与原始文字',
        [
          '本站登记诗文搜索/详情、词牌搜索/完整词谱、词句谱式匹配和韵书韵目字表六种方式。词牌搜索保留名称、别名和简介；完整词谱保留全部 Formats、说明、例词、定义和原始谱式 HTML 字段，HTML 只作文本而不执行。词句匹配返回实际候选，不将一次匹配当唯一词牌结论。',
          '韵部检索需要说明使用的韵书体系，例如平水韵与词林正韵不是同一组韵目；保留所选韵书和完整返回字表，古典押韵不能直接按现代普通话拼音判断。官方可用 Accept-Language 选择是否进行繁简转换；本站用 zh-hant 请求原始文字，保留通假、异体与用字线索，不以简体改写原文。',
        ],
        ['open', 'schema', 'examples'],
        [
          example(
            '完整词谱保留多个谱式',
            '真实词牌 ID 90（醉花间）',
            '本次官方接口返回三套 Formats，分别包含其定义、例词、说明及原始谱式字段。',
            '不能只取第一套谱式或从标题编造平仄；实际完整字段按本次返回保存。',
          ),
          example(
            '韵书内按韵目查字',
            '韵书 平水韵；韵目 青',
            '服务对应九靑韵目及完整本次 Chars 字表。',
            '“青”是输入韵目，不是把所有现代拼音 qing 的字自动合为一组；必须保留原韵书及字表。',
          ),
        ],
      ),
      section(
        '非商业使用与完整结果记录',
        [
          '知识图谱网公开接口明确用于非商业研究、学习，不是 CC0 数据库授权。本站免费并无付费功能或商业广告；保存和再分享时仍须保留提供方、作品与引用信息，遵守其非商业条件，不能把接口开放理解为任意商业再分发。',
          '仅点击执行时发送该方法所需的条件，不自动拉取诗库、古籍包或后台续查。完整接口结果与来源、许可说明及时间一并保留；失败可回原站，不能拿示例诗文填充结果。',
        ],
        ['open', 'schema'],
      ),
    ],
    [
      '接口“开放全部功能”不代表本站已经适配其全部方法。',
      '繁简转换后的显示不能被当作未经转换的原文字形证据。',
    ],
  ),
];
