const source = (id, title, publisher, url, kind, locator, language = 'en') => ({ id, title, publisher, url, kind, locator, language });
const worked = (input, output, explanation) => ({ label: '资料核对', input, output, explanation });
const section = (title, paragraphs, sourceIds, examples = []) => ({ title, paragraphs, sourceIds, examples });
const article = (id, title, topicGroup, summary, aliases, sources, sections, misconceptions) => ({ id: 'function-' + id, capabilityIds: [id], relatedIds: [id], title, topicGroup, summary, aliases, sources, sections, misconceptions });

export const articles = [
  article('native:birds', '鸟类名录', 'matter', '按学名、英文名、分类和原始字段核对固定版全球鸟类名录。', ['AviList', '鸟类分类', 'Bird taxonomy'], [
    source('avilist-release', 'AviList v2025b Extended 与发行范围', 'AviList Core Team', 'https://www.avilist.org/checklist/v2025b/', 'author-spec', 'Extended、六个工作表、Recommended Citation、CC BY 4.0'),
    source('avilist-components', 'Components of the AviList Checklist', 'AviList Core Team', 'https://www.avilist.org/checklist/components-of-the-avilist-checklist/', 'official-doc', 'Taxonomy / English Names / Linear Sequence / Range Statements / Bibliographic Information'),
    source('avilist-data', '固定 AviList v2025b 完整 Extended 原表', 'AviList Core Team', '/vendor/atlas-life-culture/AviList-v2025b-10Jun2026-extended.xlsx', 'implementation', 'AviList v2025b extended 主表的 26 列及全部辅助工作表'),
    source('local-query', '本站完整名录的字段投影与查询', '迷雾工具箱', '/atlas-life-culture/core.js', 'implementation', 'queryBirds / queryBirdMetadata', 'zh-CN'),
  ], [
    section('先辨认分类等级，再查名字', ['名录的每行是一项分类单元，不全是一个鸟种。Taxon_rank 区分目、科、属、种、亚种；Scientific_name 是学名，English_name_AviList 是该版使用的英文名称。筛选“种”后得到的数量不能与包含属和亚种的全部记录数混为一谈。', '本站保留 v2025b Extended 的全部 33,684 行：46 目、252 科、2,376 属、11,131 种、19,879 亚种。原表不同英文名称列仍独立保留，不把不同体系的英文名覆盖成同一个值。'], ['avilist-release', 'avilist-components', 'avilist-data'], [worked('学名 Struthio camelus；分类等级 species', 'Common Ostrich；Struthioniformes 目、Struthionidae 科；Sequence=5', '原表第 5 个分类单元是这个鸟种。Taxon_rank=species，而同名属 Struthio 是另一行 genus；学名包含相同字符串不能把属和种当作重复记录删除。')]),
    section('编号、分布与命名文献分别说明什么', ['Sequence 是该版采用的分类排列序号，不是永久物种编号，也不是在进化树上“更原始”的排名。AvibaseID、Cornell 物种代码及外站链接是各体系自己的识别字段。Authority、Bibliographic_details、Protonym、Type_locality 分别帮助追溯命名人、原始文献、原始名称和模式产地。', 'Range 是该版的分布文字，空白只表示该行没有这个值，不能解释成没有分布。IUCN Red List 类别与名录另外的灭绝说明是两个独立字段；不能用一个字段悄悄补写另一个。'], ['avilist-components', 'avilist-data']),
    section('分类决策和完整发行边界', ['Extended 的决策说明通过提案编号交代为何采用某种拆分、合并或名称处理；参考文献、使用说明、引文与变更表都可以按原表行查看，完整 XLSX 保留六个工作表。分页只限制一次显示的记录数，不筛掉搜索范围中的其他分类单元。', '这是明确版本的分类资料，不是图片识鸟、鸟鸣识别或实时观测系统。上游此版不提供完整中文鸟名，也不包含所有史前灭绝鸟类；亚种的协调仍有其版本边界。检索和下载固定数据在本地进行，点击外站记录才会访问相应网站。'], ['avilist-release', 'avilist-components', 'local-query']),
  ], ['学名中出现某个属名，不代表那条记录的分类等级就是属。', '分类序号和外站代码不是可互换的永久统一编号。']),
  article('native:classical-music', '古典音乐资料', 'music-reference', '在完整 Open Opus 快照中把作品名、体裁、时期与真实作曲家关系对应起来。', ['Open Opus', 'Classical music', '作品目录', '作曲家'], [
    source('openopus', 'Open Opus 的数据结构、公共领域声明与覆盖边界', 'Open Opus', 'https://openopus.org/', 'official-doc', 'Simple, direct taxonomy / Open data / Frequently Asked Questions'),
    source('openopus-dump', 'Open Opus 完整数据发行格式', 'Open Opus', 'https://github.com/openopus-org/openopus_api/blob/master/ALLDATA.md', 'author-spec', 'work/dump.json；composers 下每位作曲家的全部 works'),
    source('local-data', '本站固定 Open Opus 完整资料', 'Open Opus', '/vendor/atlas-life-culture/music.json', 'implementation', '2026-10-17 快照；全部 composers / records / meta 原字段'),
    source('local-query', '本站作曲家与作品关系查询', '迷雾工具箱', '/atlas-life-culture/core.js', 'implementation', 'queryMusic；作品、作曲家、时期、体裁与完整字段', 'zh-CN'),
  ], [
    section('作曲家与作品是两层对象', ['作曲家记录包含 name、complete_name、epoch、birth、death 及热门、推荐标记；作品有 title、subtitle、searchterms、genre 及自己的热门、推荐标记。时期属于作曲家，体裁属于作品；同名作品必须结合其作曲家判断，不能只凭一个题名合并。', '本站固定完整发行中的 220 位作曲家和 24,975 部作品，完整保留原字段、空值和关联。查询不默认只选热门作品；选择作曲家后可进一步限定其作品体裁，或切到作曲家资料查看其完整作品集合。'], ['openopus', 'openopus-dump', 'local-data']),
    section('作品编号要与题名和作曲家一起核对', ['编号常写在原始 title 或 searchterms 中。搜索把输入的词分开匹配这些原字段，同时按所选作曲家、时期和体裁过滤；显示第一页不会把其他命中截掉。短编号可能命中不同目录体系，应该保留完整题名与原编号继续比较。', '以固定快照中的 Mozart 为例，完整姓名是 Wolfgang Amadeus Mozart，epoch 是 Classical。K.550 对应 G 小调第 40 交响曲，genre 为 Orchestral；作品页保留原始拼写与这位作曲家的关系。'], ['openopus-dump', 'local-data', 'local-query'], [worked('作曲家 Mozart；输入 K.550', 'Symphony no. 40 in G minor, K.550；Wolfgang Amadeus Mozart；Orchestral', '先选 Mozart 排除其他作曲家，再对原始题名做编号匹配。Classical 是作曲家时期，Orchestral 是作品体裁，不能拿两个字段当作同一类标签。')]),
    section('日期精度、标记和数据许可', ['固定快照中许多出生日期保存为 YYYY-01-01，而本发行没有独立的日期精度字段；不能仅凭这些记录就宣称某位作曲家确切在元旦出生。popular、recommended 的 0、1、null 保持原值，也不能解释为作品质量评分或完整学术目录。', 'Open Opus 数据为公共领域／CC0，完整快照不等于全世界所有古典音乐作品。本站没有复制其 PHP 后端，不含录音、乐谱、肖像素材或每部作品完整创作年份和配器。需要这些资料时应再查作品原目录或权威专门文献。'], ['openopus', 'openopus-dump', 'local-data']),
  ], ['完整收录 Open Opus 的发行数据，不代表全球所有作曲家与作品都已收录。', '以 01-01 储存的简化出生年不能自动当成准确生日。']),
];
