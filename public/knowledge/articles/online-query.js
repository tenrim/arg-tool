export const articles=[{
 id:'function-native:oeis',capabilityIds:['native:oeis'],relatedIds:['native:oeis'],title:'OEIS 数列查询',topicGroup:'sequences',
 summary:'用连续整数项查找 OEIS 候选，结合编号、偏移、公式和文献检验线索；查询由本站服务器转发至 OEIS。',
 aliases:['OEIS','整数序列','数列','A编号','A000045','Fibonacci','斐波那契','integer sequences'],
 sources:[
  {id:'hints',title:'Hints for Using The On-Line Encyclopedia of Integer Sequences',publisher:'The OEIS Foundation Inc.',url:'https://oeis.org/hints.html',kind:'official-doc',locator:'Advanced search syntax / Commas and spaces / Prefixes / Relevance',language:'en'},
  {id:'json',title:'JSON Format',publisher:'The OEIS Foundation Inc. / OEIS Wiki',url:'https://oeis.org/wiki/JSON_Format',kind:'official-doc',locator:'fmt=json and exact id: query',language:'en'},
  {id:'offset',title:'Offsets',publisher:'The OEIS Foundation Inc. / OEIS Wiki',url:'https://oeis.org/wiki/Offsets',kind:'official-doc',locator:'Offset of the first term / Secondary offset',language:'en'},
  {id:'fibonacci',title:'A000045 — Fibonacci numbers',publisher:'The OEIS Foundation Inc. and sequence contributors',url:'https://oeis.org/A000045',kind:'author-spec',locator:'Name, sequence data, OFFSET and FORMULA',language:'en'},
  {id:'welcome',title:'Welcome to the OEIS',publisher:'The OEIS Foundation Inc. / OEIS Wiki',url:'https://oeis.org/wiki/Welcome',kind:'official-doc',locator:'Description of OEIS entries',language:'en'},
  {id:'license',title:'The OEIS End-User License Agreement',publisher:'The OEIS Foundation Inc.',url:'https://oeis.org/wiki/The_OEIS_End-User_License_Agreement',kind:'official-doc',locator:'Sections 2–3 — CC BY-SA 4.0 and attribution',language:'en'},
 ],
 sections:[
  {title:'查找连续项，而不是猜唯一答案',paragraphs:['OEIS 以整数序列条目为单位。连续项用逗号分隔，原站按给出的次序匹配相邻的项，不要求输入一定从条目第一项开始。逗号隔开的数值不是可以任意打乱的集合；负号、重复项和项间关系都应保留。本站接受整数项、A 编号或查询关键词；关键词按 OEIS 的文字检索规则解释，不自动把字母、分数或图形改写成另一种数列。','命中表示这些数值与某些条目相符，不能证明出题人采用了该条目的规则。少量数字可能对应很多不同定义；应核对线索背景、后续项和文献，而非直接把第一项候选当成答案。增加有依据的连续项可以帮助区分候选，不能为了得到想要的结果擅自改动线索。'],sourceIds:['hints'],examples:[{label:'连续片段也可以查找',input:'0,1,1,2,3,5,8',output:'候选可包含 A000045；具体候选集合和排序由查询时 OEIS 返回。',explanation:'这些项与 A000045 的开头相符。只输入中间片段 2,3,5,8 也可能匹配它，但两次查询都不能据此排除其他定义。'}]},
  {title:'A 编号与完整返回字段',paragraphs:['A 编号是条目的稳定标识。OEIS 的普通 A000045 搜索也可能找到引用此编号的其他条目；id:A000045 才明确限定该条目。本站把合法 A 编号作为精确编号请求发送，不把编号当作任意网址或服务器地址。','官方 fmt=json 返回机器可读记录。页面按返回内容展示候选、名称、数据项、偏移、公式、注释、参考文献、链接、作者、程序和交叉引用等；没有返回的字段保持缺省，不凭空补成“完整数据库”。“完整记录”指选中条目本次接口返回的全部字段，不包含原站所有图形、音频或 b-file 附件；这些仍需主动查看原站。公式和程序保留原文，不因显示在工具箱内就自动执行。'],sourceIds:['json','welcome'],examples:[{label:'精确选择条目',input:'A000045',output:'按 id:A000045 获取 Fibonacci 数列条目。',explanation:'条目编号、作者、原文地址和查询时间跟随结果保存，便于之后在 OEIS 上复核；不会把其他条目中出现的 A000045 引用误作该编号自身。'}]},
  {title:'读懂偏移与斐波那契例子',paragraphs:['offset 的第一个整数是所列第一项的下标，不是“忽略几个数字”。第二个整数是首个绝对值大于 1 的项在所列项中的位置，从 1 计数，不与第一个下标使用同一计数含义。','A000045 以 F(0)=0、F(1)=1 为起点，后续每一项等于前两项之和。因此从 0、1 得到 1，再由 1+1 得到 2，由 1+2 得到 3，由 2+3 得到 5，由 3+5 得到 8。offset 为 0,4：首项下标是 0，而第四个列出项 2 是第一个绝对值大于 1 的值。'],sourceIds:['offset','fibonacci'],examples:[{label:'核对数值、下标和第二偏移',input:'F(0)=0；F(1)=1；F(n)=F(n−1)+F(n−2)',output:'下标 0,1,2,3,4,5,6 → 项值 0,1,1,2,3,5,8；offset=0,4',explanation:'第四个项的下标为 3，值为 2；第二偏移中的 4 是第几个项，不能解释成首项从 n=4 开始。'}]},
  {title:'从候选建立可以复核的记录',paragraphs:['先阅读条目定义，再比对线索中的连续项及 offset；公式、例子、评论和参考文献提供不同层次的证据。条目的排序分数和引用数量反映检索相关性，不能当作解谜正确率。交叉引用可能指相近但不相同的序列，须分别读定义。','加入笔记本或图稿时保留当前条目的全部返回字段与来源信息，画面预览不是原始记录的替代。在线内容可能更新；查询时间让之后的复核者知道记录来自哪一次查询。转载或修改 OEIS 内容需按 CC BY-SA 4.0 署名并遵守相同方式共享等要求，保留条目贡献者信息与具体条目链接。'],sourceIds:['hints','welcome','license'],examples:[]},
  {title:'本站的联网与隐私边界',paragraphs:['这是一项在线查询：输入时不自动发送，点击查询或翻页才把本次查询经本站服务器转发到 OEIS。OEIS 官方 JSON 文档说明接口格式；本站的转发、超时、停止和限频由本项目负责，不是 OEIS 提供的离线能力或可用性承诺。服务器固定访问 OEIS 查询接口，不接受玩家提供任意目标地址。','本站没有打包全量 OEIS，不恢复已退役的精选数列库。服务未启动、网络不可用、上游拒绝或限流时，保留输入并提示原因，可重试或主动打开原站；不能把失败解释成数据库没有此数列。本站对整个服务每 10 秒最多发出一次上游查询，这是本站的保护限制而非官方额度。查询经服务器和外站处理；除主动选择保存到本机笔记外，本站查询模块不持久保存输入或结果。'],sourceIds:['json','license'],examples:[]},
 ],
 misconceptions:['有限项相同不能唯一确定数列规则，也不证明作者意图。','offset=0,4 中的 4 是项的位置，不能当成起始下标。','完整接口记录不等于本机拥有 OEIS 全库及其全部附属文件。','查询失败和没有候选是两种情况，不能互相替代。'],
}];
