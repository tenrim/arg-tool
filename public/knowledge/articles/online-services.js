// Each service keeps its own data model, identifier system, units and licence.
const source=(id,title,publisher,url,locator,language='en')=>({id,title,publisher,url,locator,language,kind:'official-doc'});
const section=(title,paragraphs,sourceIds,examples=[])=>({title,paragraphs,sourceIds,examples});
const example=(label,input,output,explanation)=>({label,input,output,explanation});
const article=(id,title,topicGroup,summary,aliases,sources,sections,misconceptions)=>({id:'function-native:'+id,capabilityIds:['native:'+id],relatedIds:['native:'+id],title,topicGroup,summary,aliases,sources,sections,misconceptions});
export const articles=[
article('simbad','SIMBAD 天体查询','sky','按名称、别名或 ICRS 天区查找天体，核对对象、测量与文献来源。',['SIMBAD','天体别名','ICRS'],[
 source('query','SIMBAD — How to query SIMBAD by URLs','CDS / Université de Strasbourg','https://simbad.u-strasbg.fr/Pages/guide/sim-url.htx','Identifier / Coordinate / TAP queries / output fields'),
 source('terms','CDS General Terms and Conditions of Use','CDS','https://cds.unistra.fr/legals/','Consulting and downloading data / Licences / dataset citations'),
 ],[
 section('名称与对象标识',['同一天体可能有多个星表编号。名称查询通过 SIMBAD 的标识表关联真实对象，不把输入字符串本身当成一个新天体。返回的 main_id 是主标识，oid 是服务中的对象编号；详细查询沿用实际返回的 oid，可分别读取基本资料、别名、测光和参考文献。','基本资料保留服务返回的全部字段和各字段元数据。缺失视差、红移或测量值时保留缺失，不能由名称、类型或颜色猜出一个数值。别名及文献较多时由用户明确继续读取；一页记录不是全部相关论文。'],['query'],[example('一个对象的不同名称','名称 M31','SIMBAD 可解析到仙女座大星系对象；返回主标识及实际对象编号。','M31 与 NGC 224 是相关星表标识。用返回的对象编号读取别名，逐条核对两者是否归属同一对象，不能只靠字符串相似。')]),
 section('天区半径与坐标单位',['天区查询的输入是 ICRS 十进制度。赤经范围为 0≤RA<360，赤纬范围为 −90≤Dec≤90；半径也是度，本站限制在 1 度以内，避免无意请求巨大天区。1 度等于 60 角分，0.01 度等于 0.6 角分，即 36 角秒。','圆锥检索返回落在指定角距离内的对象，不是地球经纬度搜索。本站通过官方 cone 服务取得候选，再读取当前页对象的完整基本资料，保留两者的字段与来源；最近 250 条构成明确的查询窗口，不声称无界下载。字段可能带坐标历元、误差、光谱类型和参考文献；记录原单位，不将自行的数值显示精度当作测量精度。'],['query'],[example('角半径换算','ra=10.6847，dec=41.26875，radius=0.01','围绕该 ICRS 方向检索半径 36 角秒内的候选。','0.01×60×60=36。查询结果仍应以本次 SIMBAD 返回为准，不能保证指定坐标只对应一个对象。')]),
 section('数据出处与联网边界',['点击查询或继续读取后，本次条件才经本站服务器发送至 CDS/SIMBAD；不自动上传照片、笔记或其他工具输入。取消或离开使旧结果失效，失败不代表没有天体。','保存时保留 CDS/SIMBAD、对象来源、字段元数据和查询时间；引用科学结论应继续核对原论文。CDS 要求引用具体数据集与服务，各来源资料按其许可使用，不能统称 CC0 或声称本站拥有完整恒星库。'],['query','terms'])
 ],['天体赤经赤纬不能当作地球经纬度。','一个别名命中不等于该天体所有测量具有相同历元和精度。']),
article('vizier','VizieR 星表查询','sky','先读星表、字段与单位，再用明确条件查询真实目录记录。',['VizieR','星表','Hipparcos','ASU'],[
 source('args','VizieR query parameters','CDS / VizieR','https://vizier.cds.unistra.fr/vizier/vizHelp/args.htx','-source / column constraints / -out.all / -out.max / coordinate search'),
 source('hip','The Hipparcos and Tycho Catalogues — I/239','ESA / CDS','https://cdsarc.cds.unistra.fr/viz-bin/cat/I/239','Catalogue and table I/239/hip_main'),
 source('terms','CDS General Terms and Conditions of Use','CDS','https://cds.unistra.fr/legals/','Dataset-specific licences, citations and DOI'),
 ],[
 section('目录、表与字段是三个层次',['VizieR 聚合出版的天文目录及论文表格，不能把所有表套成同一种恒星结构。先以目录名或关键词检索，查看服务给出的目录标识、表名、作者、参考文献、权利链接和字段定义，再对真实表名查询。','例如 I/239 是 Hipparcos 与 Tycho 目录，I/239/hip_main 是其中主表；HIP 是该表的对象编号字段。字段模式查询保留全部返回列的名称、单位、格式和注释，不以几个通用列替代整张表。'],['args','hip'],[example('确定查询对象所在表','目录 Hipparcos → 表 I/239/hip_main → 字段 HIP','可用 HIP = 1 指定该表中的编号 1。','HIP 是目录内编号，不是 SIMBAD 的 oid，也不是所有 VizieR 星表都具备的通用主键。')]),
 section('条件与天区查询',['本站通过官方 ASU 文本输出接口读取资料。字段条件使用真实列名和明确比较符号；天区输入用十进制度并限制为小范围，查询前应先阅读表中的坐标系与历元。服务输出的单位、UCD、参考来源和完整原文元数据跟随记录保存。','本站每页显示 25 条，在最多 250 条的明确查询窗口内继续；达到窗口边界时需要缩小条件，不能声称已经下载整张星表。目录关键词检索也有明确返回上限，不捏造未知总数。数值条件、空值与上游字段含义由该表文档决定。'],['args'],[example('使用表内编号而非模糊天体名','table=I/239/hip_main；条件 HIP = 1','读取命中记录及该表所有返回字段，原始单位保持不变。','先查字段模式确认 HIP，按编号查询不需要猜测对象坐标；其他表需要使用它们自己的列名。')]),
 section('科学资料的署名与服务边界',['只有明确提交才经本站服务器向 CDS/VizieR 发出请求；失败保留条件，可主动前往原目录。没有恢复退役的精选 HYG 恒星样本，也没有打包全部 VizieR 目录。','不同目录的作者与许可不相同。页面和笔记保留原始元数据、rights_uri、目录来源及查询时间；使用数据时需遵从该目录的具体许可，引用 CDS/VizieR 和原始论文或 DOI。'],['terms','args'])
 ],['相同列名在不同星表中可能有不同单位或历元。','分页窗口和目录总记录量是不同概念。']),
article('cod','COD 晶体查询','matter','按化学组成与论文条件查找晶体测定记录，并明确读取原始 CIF。',['COD','CIF','晶体','空间群'],[
 source('rest','COD RESTful API','Crystallography Open Database','https://wiki.crystallography.net/RESTful_API/','result query parameters / JSON / count / CIF file access'),
 source('license','COD data availability and CC0','Crystallography Open Database','https://www.crystallography.net/cod/new.html','Database availability / public domain dedication'),
 source('cite','Citing COD','Crystallography Open Database','https://wiki.crystallography.net/cod/citing/','COD and original structure references'),
 ],[
 section('晶体记录不同于物质名称',['COD 的记录描述特定晶体结构测定。搜索可以组合文字、分子式、包含或排除元素、空间群、论文年份和 DOI；同一种化学组成可能对应不同晶型、温度、实验条件或修订记录，因此不能将第一个命中当作物质的唯一结构。','搜索保留实际返回的化学组成、晶胞参数、空间群和原论文字段，缺少值时不补猜。本站先确认匹配数量；结果过多时要求缩小范围，避免用静默截断的列表冒充全部命中。'],['rest'],[example('组合组成和论文条件','包含元素 Si、O；另按实际论文 DOI 或分子式进一步限定','得到符合条件的晶体测定记录及各自 COD 编号。','Si/O 只能约束组成，不能单靠两个元素确定石英晶型；要继续读晶胞、空间群和原论文。')]),
 section('CIF 是结构数据而非图片',['选中真实七位 COD 编号后，可分别主动查询完整记录和该编号的原始 CIF。CIF 中的晶胞边长、夹角、空间群及原子分数坐标共同决定周期结构；分数坐标不是以埃或纳米表示的笛卡尔距离。','例如分数坐标 (0.5,0,0) 表示沿晶胞 a 基矢的一半。对长为 4 Å 且轴间直交的示例晶胞，它对应沿 a 方向 2 Å；一般非直交晶胞仍需使用全部基矢变换。本站保留完整 CIF 文本，不把预览代替原文件，也不自动上传或自动加载用户其他模型。'],['rest'],[example('分数坐标的几何含义','示例晶胞 a=4 Å，b=5 Å，c=6 Å，α=β=γ=90°；分数坐标 (0.5,0,0)','示例笛卡尔坐标 (2,0,0) Å','这是依据晶胞定义计算的例子，不是捏造某条 COD 实验数据；真实结构须用该条完整参数。')]),
 section('许可、文献和查询失败',['COD 数据采用 CC0；仍按科研规范保留结构作者、原论文及数据库来源。此处复用的是在线数据，不将 COD 的服务端程序或其他工具代码混称 CC0。','只有点击查询、详情或获取 CIF 才向 COD 发出本次请求。原站超时、拒绝或响应格式变化时明确失败，不展示演示数据代替真实结果；可主动使用原站，不恢复已退役的 14 条样本库。'],['license','cite','rest'])
 ],['同分子式不意味着同晶体结构。','分数坐标数值不是直接的长度。']),
article('pubchem','PubChem 物质查询','matter','以名称、CID 或结构标识查询化合物，区分组成、结构与提供方注释。',['PubChem','CID','SMILES','InChI'],[
 source('rest','PubChem PUG REST','NIH / NCBI','https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest','Compound identifiers / record retrieval / fast formula / synonyms'),
 source('view','PubChem PUG View','NIH / NCBI','https://pubchem.ncbi.nlm.nih.gov/pug_view/','Annotation JSON and data-source references'),
 source('policy','NCBI policies and disclaimers','National Center for Biotechnology Information','https://www.ncbi.nlm.nih.gov/home/about/policies/','Copyright / third-party data / acknowledgement'),
 ],[
 section('名称、组成与结构的区别',['CID 是 PubChem Compound 的标识；名称检索由服务解析同义词，不能把字符串直接当作确定化学结构。分子式只说明各元素数量，异构体可以具有相同分子式；SMILES 与 InChI 则表达结构信息，但仍应核对电荷、立体化学和服务标准化后的实际记录。','本站支持名称、CID、分子式、SMILES 和 InChI 条件；保留原始标识列表及每页实际完整化合物字段。分子式查询具有明确的 250 条窗口，超过边界应缩小范围，未知总数不伪造。'],['rest'],[example('先以编号确定对象','CID 2244','阿司匹林（aspirin），分子式 C9H8O4。','用 CID 读取记录，再核对名称、组成和结构字段。仅凭 C9H8O4 不能排除其他同分子式结构。')]),
 section('详情、同义词与结构记录',['详情使用 PUG View，完整保留 Record 的分节、注释和来源引用；同义词由官方 PUG REST 读取。返回列表中的登记号或商品名不等于本站验证了注册关系，也不意味着拥有完整 CAS Registry。','二维或三维结构另由明确点击读取，保留 atoms、bonds、coords 和 props 等完整数据。二维排布只是结构图坐标，三维构象也不一定是唯一实验构型；原站没有可用三维资料时明确说明失败或缺失，不凭二维数据编造三维原子位置。'],['rest','view'],[example('区分组成计数与几何','C9H8O4','元素计数：C=9、H=8、O=4，共 21 个原子；键连关系和空间位置仍需结构记录。','9+8+4=21。分子式中的下标不携带原子之间的键、立体化学或坐标。')]),
 section('提供方权利与联网查询',['PubChem 汇集不同提供方的结构与注释，不能把全部第三方文字、图像和数据统一称为 CC0。页面、笔记与导出保留 NIH/NCBI、CID、注释提供方、来源链接与查询时间；再使用按具体来源条件处理。','只有主动查询或点击详情、同义词和结构才经本站服务器发送相应条件。不随请求附带其他工具输入、文件或笔记，不运行上游程序；限流或离线不自动重试，也不把失败当作没有该物质。'],['rest','view','policy'])
 ],['分子式不是唯一结构标识。','数据库中的注释不能替代专业的实验或安全判断。']),
article('placenames','国家地名查询','world','依据国家地名公开接口读取名称、行政区、来历及同名同音统计。',['国家地名信息库','地名','CGCS2000'],[
 source('overview','国家地名信息库 API 概述','中华人民共和国民政部','https://dmfw.mca.gov.cn/baseHtmls/docfile/_1.htm','服务简介、七种接口、CGCS2000 坐标','zh-CN'),
 source('division','行政区划搜索','中华人民共和国民政部','https://dmfw.mca.gov.cn/baseHtmls/docfile/_2.htm','year / code / maxLevel','zh-CN'),
 source('search','地名搜索','中华人民共和国民政部','https://dmfw.mca.gov.cn/baseHtmls/docfile/_3.htm','stName、行政区、类别、匹配方式和分页','zh-CN'),
 source('detail','地名详情获取','中华人民共和国民政部','https://dmfw.mca.gov.cn/baseHtmls/docfile/_4.htm','POST id；地名含义、来历与历史沿革','zh-CN'),
 source('stats','同名与同音统计接口','中华人民共和国民政部','https://dmfw.mca.gov.cn/interface.html','同名区划、同名类别、同音区划和同音类别','zh-CN'),
 ],[
 section('名称、地名代码与记录 ID',['本站接入七个公开接口：地名搜索、详情、行政区树，以及同名/同音的区划和类别统计。标准名称不一定唯一，应结合所属政区、类别和原始地名代码判断。搜索允许精确或模糊匹配、行政区和类别代码、年版与分页；详情使用搜索返回的真实 ID，而不是猜测名称对应的记录。','完整记录保留标准名称、罗马字母拼写、少数民族语书写、旧名、来历、含义、沿革和原始坐标等实际字段。未提供的字段保持缺失；多媒体引用只作为原字段文本保留，不擅自下载图片或把图片权利推定为开放数据。'],['overview','search','detail'],[example('按所属政区与类别复核','地名 故宫；行政区代码 11；模糊匹配','可查到北京市范围的相关地名，例如故宫站；读取真实 ID 后查看其含义和来历。','故宫站是一条公共交通车站记录，不能只因名称含“故宫”就把它等同故宫博物院。实际候选与总数以本次返回为准。')]),
 section('行政树和同名同音统计',['行政区查询的 maxLevel 是相对查询深度：0 仅本级，1 包含下级，2 包含下下级；不是全国行政区等级的固定编号。完整 children 树跟随记录保存，不裁掉子节点来伪装树结构。','同名统计使用地名文字；同音统计使用罗马字母拼写。两者都可以按区划或类别统计，按类别统计需要明确行政区代码。接口返回的数量有服务所用年版与范围语义，不能把结果称为现实世界全部同名地名的永久数量。'],['division','stats'],[example('相对层级的含义','code=11；maxLevel=0 与 maxLevel=2','前者只取本级，后者请求本级及下两级树。','maxLevel=2 不表示只取“第二级行政区”，也不意味着该分支必有两层完整子节点。')]),
 section('坐标与公开服务边界',['接口的空间坐标使用 2000 国家大地坐标系 CGCS2000，以经纬度数值表示。本站保留 GeoJSON 类型和全部坐标，不擅自改成 WGS84、GCJ-02 或 BD-09；点、线和多点也不能都压成一个“中心点”。','只有点击相应查询才经本站服务器发送本次条件。该公开接口是在线查询依据，不等于开放整库镜像、任意再分发或底图使用许可；保存结果保留民政部国家地名信息库、条件和时间，原站不可用时提供手动入口。'],['overview','search'])
 ],['标准名称相同不代表同一个地理对象。','CGCS2000 不能未经处理就改标为其他坐标系。']),
article('zdic','汉典字词原文','language-reference','读取汉典公开字词页的原文分节，明确区别于未公开的站内搜索接口。',['汉典','zdic','字典','词典'],[
 source('entry','汉典 — 明','汉典','https://www.zdic.net/hans/明','公开字页的读音、释义与原文分节','zh-CN'),
 source('word','汉典 — 不言而喻','汉典','https://www.zdic.net/hans/不言而喻','公开词页释义与例证','zh-CN'),
 source('terms','汉典使用条款','汉典','https://www.zdic.net/terms/','全站字词等内容 CC0 声明','zh-CN'),
 source('robots','汉典 robots.txt','汉典','https://zdic.net/robots.txt','站点公开抓取路径边界'),
 ],[
 section('按具体字词读取公开词条',['本站接入的是固定 /hans/ 路径的公开字词原文读取，属于公开页面解析（非官方 API）。输入具体汉字或词语后读取该词条中的实际公开分节；不使用 robots 禁止的动态 /api/，不提供或冒称全站模糊搜索、拼音检索及会员功能。','同一字可能有多个音和义项，原文中的字音、词性、书证和时代应一起阅读。解析保留实际分节文字及原文链接，若版式变化、公开内容为空或有动态资料未返回，明确说明并留原站入口，不以本站生成解释填补。'],['entry','robots'],[example('读音与义项不能随意拆开','明','读取 /hans/明 公开页的真实读音及释义分节。','“明”在不同搭配中承担不同意义。应按原文义项及例证理解，不因某个近义字能替换就认定全部场景等义。')]),
 section('词条、书证和可复核引用',['词语查询使用完整词面，不自动把一个成语拆成单字释义再拼回去。例如“不言而喻”是作为一个词条读取，不等于将“不”“言”“而”“喻”的孤立含义相加。','词条中的书证与转引文本保留原有出处，不能把所有引文都称为汉典原创或把有出处的古籍文字改写成新的事实断言。笔记保留完整本次公开分节、请求词面、原文地址和时间，预览省略不能截断实际保存内容。'],['word','entry'],[example('完整词面查询','不言而喻','读取汉典对应成语词条，释义为无需说明便可明白。','先确定词条整体含义，再用词条实际例证验证使用语境；这不是通过单字词频推断的结果。')]),
 section('CC0 与访问边界',['汉典使用条款对相关字词等内容声明 CC0，本站保留来源与该声明；这不等于有官方稳定 API，也不意味着允许无限频率查询、访问禁止路径或获取收费资料。本站采用保守限流，仅由用户明确提交触发读取。','请求仅包含本次具体字词，经本站服务器送至汉典。页面、说明、关于和页脚均标明实际公开页读取；不下载音视频、书影或其他独立素材，遇到上游拒绝或页面变更时如实失败。'],['terms','robots'])
 ],['公开字词页读取不是汉典全站 API。','成语整体义不能由单字解释机械相加。']),
article('cnkgraph','搜韵与诗文查询','language-reference','通过知识图谱网公开接口查诗文、作者、韵部和词曲谱，保留具体来源与非商业条件。',['搜韵','CNKGraph','知识图谱网','诗词'],[
 source('open','知识图谱网开放资源','知识图谱网 / 苏州图谱信息技术有限公司','https://cnkgraph.com/Home/OpenResources','开放 Web API、非商业研究学习、繁简输出','zh-CN'),
 source('schema','CNKGraph Open API schema','知识图谱网','https://open.cnkgraph.com/Api/index.yaml','公开方法及真实参数与返回模型','zh-CN'),
 source('examples','CNKGraph 官方 Postman 示例','知识图谱网','https://open.cnkgraph.com/Api/postman.zip','诗文库、字典、韵典、词汇词谱与古籍接口','zh-CN'),
 ],[
 section('从作品、作者和片段分别检索',['诗句片段、作品标题、作者和韵部是不同检索条件，应使用对应公开接口的真实参数。搜索结果保留服务返回的作者、时代、作品类型、正文、注释和关联字段，不用少量精选诗句替代全文服务。','命中的同一句可能出现在不同作者、集子、版本或化用中，必须继续阅读真实作品及其出处。本站按登记的方法调用固定公开端点，不把界面提供的一种检索解释为已覆盖原网站每个功能。'],['open','schema','examples'],[example('以标题和作者复核片段','诗文片段或标题 静夜思；继续核对作者 李白','读取实际命中的作品记录及正文、作者和来源字段。','先确认命中是哪一作品及版本，再比较线索；标题相同或片段相似都不足以自动认定唯一出处。')]),
 section('韵部、词谱与原始文字',['本站登记诗文搜索/详情、词牌搜索/完整词谱、词句谱式匹配和韵书韵目字表六种方式。词牌搜索保留名称、别名和简介；完整词谱保留全部 Formats、说明、例词、定义和原始谱式 HTML 字段，HTML 只作文本而不执行。词句匹配返回实际候选，不将一次匹配当唯一词牌结论。','韵部检索需要说明使用的韵书体系，例如平水韵与词林正韵不是同一组韵目；保留所选韵书和完整返回字表，古典押韵不能直接按现代普通话拼音判断。官方可用 Accept-Language 选择是否进行繁简转换；本站用 zh-hant 请求原始文字，保留通假、异体与用字线索，不以简体改写原文。'],['open','schema','examples'],[example('完整词谱保留多个谱式','真实词牌 ID 90（醉花间）','本次官方接口返回三套 Formats，分别包含其定义、例词、说明及原始谱式字段。','不能只取第一套谱式或从标题编造平仄；实际完整字段按本次返回保存。'),example('韵书内按韵目查字','韵书 平水韵；韵目 青','服务对应九靑韵目及完整本次 Chars 字表。','“青”是输入韵目，不是把所有现代拼音 qing 的字自动合为一组；必须保留原韵书及字表。')]),
 section('非商业使用与完整结果记录',['知识图谱网公开接口明确用于非商业研究、学习，不是 CC0 数据库授权。本站免费并无付费功能或商业广告；保存和再分享时仍须保留提供方、作品与引用信息，遵守其非商业条件，不能把接口开放理解为任意商业再分发。','仅点击执行时发送该方法所需的条件，不自动拉取诗库、古籍包或后台续查。完整接口结果与来源、许可说明及时间一并保留；失败可回原站，不能拿示例诗文填充结果。'],['open','schema'])
 ],['接口“开放全部功能”不代表本站已经适配其全部方法。','繁简转换后的显示不能被当作未经转换的原文字形证据。']),
article('pokewiki','神奇宝贝百科查询','culture-reference','查询 52poke 的文字与固定版本，区分百科正文、游戏世代和媒体权利。',['52poke','神奇宝贝百科','宝可梦','皮卡丘'],[
 source('api','52poke Action API — search','神奇宝贝百科','https://wiki.52poke.com/api.php?action=help&modules=query%2Bsearch','Search titles, snippets and continuation','zh-CN'),
 source('copyright','神奇宝贝百科版权声明','神奇宝贝百科及贡献者','https://wiki.52poke.com/wiki/神奇宝贝百科:版权声明','文字 CC BY-NC-SA 3.0 与独立媒体权利','zh-CN'),
 source('robots','52poke robots.txt','神奇宝贝百科','https://wiki.52poke.com/robots.txt','Crawl-delay 500 and disallowed paths'),
 ],[
 section('作品百科不是统一的图鉴 API',['公开 MediaWiki 搜索返回标题、片段、页面标识及版本内容，不能把不同页面强制变成一个固定的宝可梦属性模型。名字、招式和数值可能因游戏世代、作品、形态和语言而变化，阅读时需保留这些上下文。','本站读取正文原始 Wiki 文本及其版本元数据。模板、表格和媒体引用作为原文保留，不在本站执行 HTML 或加载图片、音频；复杂模板依赖原站展开，不能把未展开模板显示成缺失的原始数据。'],['api','copyright'],[example('先确认条目和形态','搜索 皮卡丘；明确选中真实标题及页面版本','保留条目 ID、版本 ID、时间、完整本次原文和贡献者历史入口。','条目含多个世代和形态时，应继续读对应章节；不能随意把某世代数值套到所有游戏。')]),
 section('固定版本与可追溯记录',['Wiki 页面会更新。同一次记录应保留实际 revision id、条目链接、固定版本链接和历史作者入口；搜索片段只是定位材料，不是完整正文。检索时仍应通过显式读取目标条目，不能把首条结果的片段自动当作整条百科。','同名、简繁、重定向和消歧义应依据 API 实际返回。保留原始字段，让之后的使用者能确认查询时间和所读版本；不会因页面名称变化而改写已存笔记的证据。'],['api'],[example('区分当前页面与本次版本','实际返回 revision id R 与标题 T','保存 ?oldid=R 形式的固定版本出处，同时保留 T 的条目入口。','R 是 API 实际返回的版本号，不能自行编造或把当前标题链接误称永久内容快照。')]),
 section('非商业许可与保守请求节奏',['文字按站点 CC BY-NC-SA 3.0 使用，保留神奇宝贝百科、贡献者、原条目和许可；修改与分享遵守相同方式共享及非商业条件。宝可梦图像、游戏截图、商标和音频权利独立，本站仅处理文字和链接，不从文字许可推定可复制这些素材。','站点 robots 声明 500 秒访问间隔。本站按保守的全服务请求节奏处理，查询失败不自动重试，不能因一次匿名 API 成功便忽略站方访问政策。只有明确提交才发送当次请求，等待时可查看已返回记录或主动使用原站。'],['copyright','robots','api'])
 ],['百科文字许可不自动涵盖角色图像、截图或声音。','游戏世代和形态不能在汇总时丢弃。'])
];
