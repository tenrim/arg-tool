// Original editorial introductions; no imported external data or engines.
export const GUIDE_GROUPS = Object.freeze([
  {
    "id": "words",
    "title": "英文词语与字谜"
  },
  {
    "id": "characters",
    "title": "汉字、日语与古诗文"
  },
  {
    "id": "places",
    "title": "旗帜、地图与交通"
  },
  {
    "id": "images",
    "title": "图片溯源、隐写与星空"
  },
  {
    "id": "music",
    "title": "音乐、旋律与影视台词"
  },
  {
    "id": "culture",
    "title": "专题文化与素材"
  },
  {
    "id": "specialist",
    "title": "综合知识与专业参考"
  },
  {id:'cipher-analysis',title:'密文识别与密码分析'},
  {id:'science-reference',title:'化学光谱与无线电信号'},
  {id:'media-analysis',title:'图像取证与媒体信息'},
  {id:'puzzle-tools',title:'纸笔谜题'},
  {id:'simulation-tools',title:'电路与交互模拟'},
  {id:'programming-tools',title:'编译与汇编对照'}
].map(Object.freeze));

export const GUIDE_SITES = Object.freeze([
  {
    id:'P01',category:'codec',group:'cipher-analysis',name:'dCode · 密码分析与专用求解器',url:'https://www.dcode.fr/tools-list',
    description:'dCode 将古典密码、编码和谜题求解器按具体算法组织为独立页面，涵盖单表替换、多表替换、换位、坐标方阵和密码机等不同体系。密码分析部分提供密文类型识别、字母及多字母组合频率、重合指数和卡西斯基测试，可从字符分布与重复片段观察密文结构。具体算法页面提供相应的加解密或求解参数，并配有规则、示例与说明；工具目录将这些专用页面串联起来，便于围绕同一种密码深入分析。',
    aliases:['dCode','密码求解器','重合指数','卡西斯基']
  },
  {
    id:'P02',category:'codec',group:'cipher-analysis',name:'Boxentriq · 密文识别与统计分析',url:'https://www.boxentriq.com/analysis',
    description:'Boxentriq 的分析工具围绕未知输入的结构、统计特征和格式组织。密文识别器根据输入特征给出可能的密码或编码类型，频率分析显示字母及 n-gram 的分布，帮助观察替换关系和重复模式。网站还提供二进制分析、嵌入文件签名扫描以及图像和音频元数据查看等页面，并与密码、编码、符号及隐写工具分类相连。各页面保留自己的输入方式、参数和结果，形成从初步辨识到具体分析的工具集合。',
    aliases:['Boxentriq','密文识别','频率分析']
  },
  {
    id:'P05',category:'reference',group:'music',name:'RISM Online · 国际音乐文献目录',url:'https://rism.online/',
    description:'RISM 是国际音乐文献目录项目，记录音乐手稿、印刷乐谱和音乐理论文献，并连接保存这些资料的图书馆、档案馆及其他机构。条目围绕文献本身整理作曲者、标题、编制、年代和馆藏信息，同一作品的不同文献来源可以分别查阅。RISM Online 还提供音乐开头片段（incipit）的检索，把短小谱例与相关文献联系起来；人物、作品来源和收藏机构之间的关联使它兼具音乐目录与文献追溯功能。',
    aliases:['RISM','RISM Online','音乐手稿','谱例','incipit']
  },
  {
    id:'P06',category:'reference',group:'music',name:'IMSLP · 国际乐谱图书馆',url:'https://imslp.org/',
    description:'IMSLP（国际乐谱图书馆项目）按作曲家和作品整理乐谱、分谱及录音。作品页把不同编制、改编版本、出版版本和演出资料集中起来，提供可直接查看的谱面文件，而不只是一段作品简介。目录可以沿作曲者、作品类型、乐器编制等方向浏览，并通过作品页了解文件对应的版本及上传说明。总谱与分谱、原作与改编、不同出版物分别组织，便于对照相同旋律在不同版本中的记谱和编制。',
    aliases:['IMSLP','国际乐谱图书馆','乐谱','总谱','分谱']
  },
  {
    id:'P07',category:'reference',group:'music',name:'MusicBrainz · 音乐作品与录音资料',url:'https://musicbrainz.org/',
    description:'MusicBrainz 是由社区维护的结构化音乐资料库，将艺人、作品、录音、发行版本、发行组和厂牌区分为不同对象，并用关系把它们连接起来。一个作品可以对应多次演奏录音，同一录音又可能收录在不同唱片或发行版本中；条目可以继续关联演奏者、作曲者及制作人员。资料通常包含名称、别名、曲目、日期、地区和标识信息，因此既能查作品身份，也能沿唱片、录音与人物关系追溯音乐资料。',
    aliases:['MusicBrainz','录音资料','唱片','发行版本','音乐数据库']
  },
  {
    id:'P08',category:'reference',group:'places',name:'David Rumsey · 历史地图收藏',url:'https://www.davidrumsey.com/view',
    description:'David Rumsey Historical Map Collection 是历史地图数字馆藏，收录地图集、城市图、海图、专题地图和其他制图资料。在线阅览提供高分辨率图像及其年代、作者、出版和馆藏描述，可以放大查看地图上的文字、符号与边缘注记。馆藏同时提供地理配准地图的浏览入口，将历史地图影像与地理位置联系起来。原始地图图像、文献说明和空间定位共同呈现旧地名、历史行政边界及城市布局。',
    aliases:['David Rumsey','历史地图','旧地图','地理配准']
  },
  {
    id:'P09',category:'reference',group:'places',name:'Overpass Turbo · 地图要素检索',url:'https://overpass-turbo.eu/',
    description:'Overpass Turbo 是面向 OpenStreetMap 数据的网页查询与地图展示工具。它通过 Overpass 查询筛选节点、道路和关系等地图对象，可组合标签、位置和范围条件，把符合条件的设施、建筑、道路或区域显示在地图上。页面带有查询编辑器、查询向导、示例以及数据查看和导出功能。地图视图帮助观察对象之间的空间关系，数据视图则保留对象标识、标签和几何信息，适合从地图的结构化要素展开查找。',
    aliases:['Overpass Turbo','OpenStreetMap','OSM','地图要素','地理查询']
  },
  {
    id:'P12',category:'reference',group:'science-reference',name:'NIST Chemistry WebBook · 化学物性与光谱',url:'https://webbook.nist.gov/chemistry/',
    description:'NIST Chemistry WebBook 是美国国家标准与技术研究院的化学资料服务，按化学物种汇集名称、分子式、标识、物理性质和实验数据。记录可包含气相及凝聚相热化学、相变、离子能量、红外光谱、质谱和紫外可见光谱，并附对应测量来源与参考文献。检索入口覆盖名称、分子式、CAS 编号及部分性质条件；数据以表格、曲线和光谱图等形式呈现，使物质身份、实验测量和原始文献能够相互对照。',
    aliases:['NIST','Chemistry WebBook','化学物性','红外光谱','质谱']
  },
  {
    id:'P15',category:'reference',group:'science-reference',name:'SIGIDWiki · 无线电信号识别资料',url:'https://www.sigidwiki.com/wiki/Signal_Identification_Guide',
    description:'Signal Identification Wiki（SIGIDWiki）围绕无线电信号建立识别资料，条目结合频率范围、带宽、调制方式、信号用途以及可用的音频样本和瀑布图，展示不同传输方式在听觉和频谱上的特征。目录包含数字、模拟及尚未明确识别的信号，可从类别和技术属性继续浏览。网站以参考样本和条目描述帮助对照观察到的信号，另有配套的 Artemis 离线参考程序，提供信号资料、音频和瀑布图的离线浏览。',
    aliases:['SIGIDWiki','Signal Identification Wiki','无线电','瀑布图','信号识别']
  },
  {
    id:'P16',category:'media',group:'media-analysis',name:'Forensically · 图像取证分析',url:'https://29a.ch/photo-forensics/',
    description:'Forensically 是一组在浏览器中运行的图片取证工具，把放大观察、复制区域检测、误差级别分析（ELA）、噪声分析、主成分分析和亮度扫描集中在同一工作界面。它还提供元数据、JPEG 量化表及内嵌缩略图等检查功能，可以从像素变化与文件结构两个角度观察图片。各分析方式使用不同的可视化结果突出局部差异，参数可调整并与原图比较，帮助检查重复纹理、压缩差异以及不易直接看出的细节。',
    aliases:['Forensically','图像取证','ELA','噪声分析','复制区域检测']
  },
  {
    id:'P17',category:'media',group:'media-analysis',name:'MediaInfo Online · 音视频文件信息',url:'https://mediaarea.net/MediaInfoOnline',
    description:'MediaInfo Online 将 MediaInfo 的媒体信息分析放到浏览器中，可读取音视频文件的容器、视频流、音频流、字幕和其他流信息。报告包括实际存在的编码格式、分辨率、帧率、码率、时长、采样率、声道、语言和标签等字段，并提供不同形式的文本输出。它着重呈现文件内部各条媒体流的技术属性，便于区分容器与编码、检查多音轨及字幕信息；页面中的报告分享由单独的 MediaBin 功能提供。',
    aliases:['MediaInfo','MediaInfo Online','音视频参数','媒体信息','多音轨','容器']
  },
  {
    id:'P23',category:'other',group:'puzzle-tools',name:'puzz.link · 纸笔谜题编辑与游玩',url:'https://puzz.link/',
    description:'puzz.link 是支持多种纸笔逻辑谜题的网页平台，围绕网格、数字、连线、分区和涂色等题型提供对应的棋盘与交互规则。玩家可以在浏览器中录入题面、编辑谜题并进行解答，平台也提供谜题链接分享和题库入口。不同题型拥有自己的标记方式与答案检查规则，编辑状态和解题状态围绕同一题面组织。它既能作为已有题目的游玩界面，也能用于制作并分享可直接打开的交互谜题。',
    aliases:['puzz.link','纸笔谜题','网格谜题','谜题编辑']
  },
  {
    id:'P24',category:'other',group:'simulation-tools',name:'Falstad Circuit Simulator · 电路模拟',url:'https://www.falstad.com/circuit/circuitjs.html',
    description:'Falstad Circuit Simulator 提供可交互的网页电路模拟，使用颜色和动画展示电压与电流，并能结合波形图观察电路随时间的变化。内置示例覆盖基础电路、交流与滤波、晶体管、运算放大器及数字逻辑等主题；元件连接、参数和开关状态可以修改，模拟结果随之更新。电路图与测量视图在同一工作区联动，可以观察振荡、充放电、逻辑状态及不同元件组合产生的动态行为。',
    aliases:['Falstad','CircuitJS','电路模拟','电压','电流','数字电路']
  },
  {
    id:'P26',category:'other',group:'programming-tools',name:'Compiler Explorer · 编译与汇编对照',url:'https://godbolt.org/',
    description:'Compiler Explorer（Godbolt）把源代码编辑、编译器选择与编译结果放在同一个网页工作区，支持 C、C++、Rust、Go 等多种语言，并提供同一语言的多个编译器及版本。它能展示源代码编译后的汇编，将源代码位置与输出指令联系起来；多个面板可以比较不同编译器、参数和优化设置产生的差异。平台还提供相应工具、可视化和可配置布局，便于观察分支、循环、函数调用等代码结构如何转化为实际指令。',
    aliases:['Compiler Explorer','Godbolt','编译器','汇编对照','编译优化']
  },
  {
    "id": "E04",
    "group": "words",
    "name": "Nutrimatic",
    "url": "https://nutrimatic.org/2024/",
    "description": "从语料中检索英文单词和短语，支持字母模式、字母重排及条件交集；短语检索是它区别于普通词典的重要用途。 网站以维基百科等文本语料中的实际用词为基础，不只列出词典词头，还可以找到由多个单词组成的表达。查询表达式能够描述固定字母、未知位置、重排字母和多个条件的组合，结果取决于所选语料版本。"
  },
  {
    "id": "E05",
    "group": "words",
    "name": "QAT",
    "url": "https://www.quinapalus.com/qat.html",
    "description": "面向字谜的英文词库查询器，可用字母模式及组合约束筛选词语。不同词表和查询表达式会影响候选范围。 它把词表与模式表达式结合起来，可以围绕单词的拼写结构进行较细的筛选，例如固定位置的字母、词长和不同条件的组合。网站提供专门的查询语法说明，是偏向文字谜题的词库检索页面。"
  },
  {
    "id": "E06",
    "group": "words",
    "name": "RhymeZone",
    "url": "https://www.rhymezone.com/",
    "description": "按英文词查押韵、近韵、同音词、相似发音及相关词，适合从声音关系扩展候选。 除常见的韵脚查找外，网站还提供同音、相似发音、近义、反义及相关表达等不同检索方向。结果将词语之间的发音联系和语义联系分别呈现，覆盖单词及部分多词表达。"
  },
  {
    "id": "E07",
    "group": "words",
    "name": "Power Thesaurus",
    "url": "https://www.powerthesaurus.org/",
    "description": "提供英文近义词、反义词与相关表达，便于从一段释义寻找另一种说法。 内容以词语和短语之间的语义联系组织，同一表达可以关联多个近义、反义或相关说法。词性、语境和搭配共同影响这些词之间的关系，因此它呈现的是一组可比较的表达，而不是简单的一对一替换表。"
  },
  {
    "id": "E14",
    "group": "words",
    "name": "Wordplays Crossword Solver",
    "url": "https://www.wordplays.com/crossword-solver/",
    "description": "以英文填字提示语寻找答案候选，并结合答案长度及已知字母筛选。 网站将填字提示与可能的答案联系起来，可以同时结合提示文字、答案长度和已知字母进行查找。它更接近填字题的答案索引，既包含定义式提示，也能从已有题目的常用表达中提供候选。"
  },
  {
    "id": "E08",
    "group": "characters",
    "name": "Takoboto",
    "url": "https://takoboto.jp/",
    "description": "日语词典，支持汉字、假名、罗马字和英文检索，也提供汉字部首查找及例句等辅助资料。 词条通常围绕日语写法、假名读音、词性和释义展开，并配有相关词或例句等内容。汉字部分提供部首检索等入口，文字输入可使用汉字、假名、罗马字或英文；另有部分多语言释义。"
  },
  {
    "id": "E10",
    "group": "characters",
    "name": "字统网",
    "url": "https://zi.tools/",
    "description": "以汉字为中心整理字形、异体、构形和历史字形相关资料，适合沿着一个字追查形体关系。 条目围绕具体字符组织，能够串联不同写法、相关字形和字源材料。内容既涉及现代字形之间的关系，也涉及历史书写形式与部件构成，相关资料可继续追溯到条目所列出处。"
  },
  {
    "id": "E12",
    "group": "characters",
    "name": "古文岛（原古诗文网）",
    "url": "https://www.gushiwen.cn/",
    "description": "收录古诗文、名句、作者与古籍相关内容，并提供译文、注释及赏析等阅读材料。 网站按诗文、名句、古籍、作者等入口组织内容。一篇作品可以关联作者资料、正文、注释、译文和赏析，阅读范围从单句出处延伸到完整作品及其背景；不同作品提供的解释材料有所区别。"
  },
  {
    "id": "E13",
    "group": "characters",
    "name": "能不能好好说话",
    "url": "https://lab.magiconch.com/nbnhhsh/",
    "description": "尝试将网络语境中的拼音首字母缩写展开成可能的中文表达。 这是一个中文网络用语缩写查询页面，将连续字母与可能的拼音缩写表达关联起来。内容依赖网络用语及其语境，同一个字母组合可以对应多个不同说法，呈现的是可能的展开形式。"
  },
  {
    "id": "E15",
    "group": "characters",
    "name": "Branah 多语言键盘",
    "url": "https://www.branah.com/",
    "description": "提供多种语言的虚拟键盘，用鼠标或触控输入本机键盘上难以输入的字符。 网站按语言和书写系统提供屏幕键盘，将相应字母与符号排成可点击的按键。输入区域支持组合文字并复制，覆盖不同字母表及附加符号；核心功能是字符输入，而不是文本翻译。"
  },
  {
    "id": "E22",
    "group": "places",
    "name": "Flaglog 历史旗帜",
    "url": "https://flaglog.com/historical",
    "description": "按年份展示历史旗帜及其变动，历史图表从 1848 年开始；年末图表与当年事件记录各有用途。 历史部分将旗帜按年份编排，展示国家、地区和其他历史实体的旗帜形态。年度图表主要反映年末状态，另有事件资料记录年内变化，可以沿时间轴观察配色、徽记和旗帜归属的变迁。"
  },
  {
    "id": "E24",
    "group": "places",
    "name": "Google Maps",
    "url": "https://www.google.com/maps",
    "description": "地图、地名、坐标、路线与街景服务，可将地点线索放回真实地理环境核对。 除平面地图外，还提供卫星影像、可用地区的街景以及地点与路线信息。地点名称、坐标、道路和建筑被放在同一地理空间中呈现，影像和街景的覆盖范围、拍摄时间随地区而不同。"
  },
  {
    "id": "E25",
    "group": "places",
    "name": "MetroMan 地铁通",
    "url": "https://www.metroman.cn/",
    "description": "整理多座城市的轨道交通线路、车站和换乘信息，适合阅读线路关系与站点顺序。 各城市页面以轨道交通线路图、车站名称和换乘关系为主体，同时提供相应的路线查询入口。线路颜色、沿线车站与交汇位置集中展示，内容主要围绕城市内部的公共轨道交通网络。"
  },
  {
    "id": "E26",
    "group": "places",
    "name": "The Subway Page",
    "url": "https://people.reed.edu/~reyn/transport.html",
    "description": "汇集世界各地城市轨道交通图及相关链接，包含历史和不同形式的交通地图。 目录按城市和地区汇集地图来源，其中既有现行线路资料，也有历史版本及其他形式的交通图。它保存的是通往不同地图与资料页面的索引，各链接的年代、语言和地图样式由原始来源决定。"
  },
  {
    "id": "E18",
    "group": "images",
    "name": "Astrometry.net / Nova",
    "url": "https://nova.astrometry.net/",
    "description": "通过星点分布对星空照片进行天文定位，匹配照片覆盖的天区及坐标等信息。 平台通过照片中的星点排列与天文索引匹配，完成通常称为天文测量解算的过程。匹配结果可以给出视场中心的天球坐标、照片覆盖范围与方向，并将画面与已知天区对应起来。图片分析在外站服务器进行。"
  },
  {
    "id": "E28",
    "group": "images",
    "name": "TinEye",
    "url": "https://tineye.com/",
    "description": "反向图片搜索，寻找相同图片及部分裁剪、修改版本出现过的网页。 其检索重点是图片本身的视觉匹配，可以找到同一图像在不同网页上的版本，包括部分尺寸变化、裁剪或修改后的图片。结果关联出现该图的网页与图像版本，覆盖范围由网站建立的图片索引决定。"
  },
  {
    "id": "E29",
    "category": "media",
    "group": "media-analysis",
    "name": "AperiSolve · 在线图片隐写分析",
    "url": "https://www.aperisolve.com/zh/",
    "description": "AperiSolve 是一个开源在线图片隐写分析平台，把图像可视化分析和多种文件检测、提取程序集中在同一份报告中。它能够分解图片的颜色通道与各位平面，并通过颜色重映射呈现肉眼不容易察觉的图案、文字或像素差异。文件分析包括 ExifTool 元数据读取、strings 字符串查找、binwalk 嵌入文件与压缩包特征检查、foremost 文件提取，以及 zsteg、steghide、outguess 等隐写检测和提取程序。结果按程序分别展示，可以查看分析图、执行输出和找到的文件。网站支持 PNG、JPEG、GIF、BMP、TIFF 等常见格式，提供可选密码、深度分析与中文界面；配套 Wiki 介绍隐写分析方法、媒体知识和扫描器。文件由使用者在 AperiSolve 网站提交，分析由对方服务器执行。",
    "aliases": [
      "AperiSolve",
      "图片隐写",
      "完整扫描",
      "steghide",
      "outguess"
    ],
    "links": [
      {
        "title": "隐写分析 Wiki",
        "url": "https://www.aperisolve.com/wiki"
      },
      {
        "title": "开源项目",
        "url": "https://github.com/Zeecka/AperiSolve"
      }
    ]
  },
  {
    "id": "E30",
    "group": "music",
    "name": "GetYarn",
    "url": "https://getyarn.io/",
    "description": "通过台词检索电影、电视剧等内容中的短片段，帮助追查一句话的影视上下文。 网站以对白文字关联短视频片段，内容主要来自电影、电视剧等影视作品，检索以英文台词为主。片段保留说话场景与声音，配合作品信息呈现一句台词在影视内容中的具体出现方式。"
  },
  {
    "id": "E31",
    "group": "music",
    "name": "Folk Tune Finder",
    "url": "https://new.folktunefinder.com/",
    "description": "面向民间曲调的检索网站，整理 ABC 记谱等曲谱资料，可按曲名或旋律查找。 曲调以曲名、乐谱和 ABC 记谱等信息组织，网站提供标题与旋律检索入口。相同曲调可能存在不同名称、调性或流传版本，资料重点放在民间与传统曲调，而非商业录音目录。"
  },
  {
    "id": "E32",
    "group": "music",
    "name": "Musipedia",
    "url": "https://www.musipedia.org/quicksearch.html",
    "description": "旋律检索网站，可利用音符、节奏或旋律上行、下行、重复的轮廓寻找候选曲目。 它将旋律表示为可检索的音乐特征，除了具体音高与节奏，也包含音符上行、下行或重复的轮廓表达。网站围绕这些特征匹配候选曲目，并提供相关的旋律输入与曲目资料入口。"
  },
  {
    "id": "E33",
    "group": "music",
    "name": "Shazam",
    "url": "https://www.shazam.com/",
    "description": "根据实际播放的录音识别歌曲，提供曲名、艺人等音乐信息。 服务以录音中的声音特征匹配音乐目录，识别后关联歌曲名称、艺人及其他作品信息。官网同时提供音乐发现、榜单和歌词等内容，不同设备通过相应网页入口、浏览器扩展或应用使用识别服务。"
  },
  {
    "id": "E36",
    "group": "culture",
    "name": "VOCALOID Wiki",
    "url": "https://vocaloid.fandom.com/",
    "description": "围绕 VOCALOID 整理声库、角色、软件产品和相关背景资料。 条目围绕声库、角色、软件及其不同版本建立关联，包含名称、产品背景和相关发展资料。内容主要为英文，由社区维护，并通过条目间链接和参考来源串联 VOCALOID 的技术产品与文化背景。"
  },
  {
    "id": "E37",
    "group": "culture",
    "name": "Irasutoya 插画目录",
    "url": "https://www.irasutoya.com/",
    "description": "常见日式插画素材的分类与标题目录，可用来追查某张插画原本表示的情景、动作或概念。 网站按主题整理人物、动作、物品、职业和生活场景等插画。每张素材拥有日文标题及相应说明，分类目录将画面主题相近的素材放在一起，因此也保留了这些常见插画的原始命名和情景含义。"
  },
  {
    "id": "E02",
    "group": "specialist",
    "name": "FactorDB",
    "url": "https://factordb.com/",
    "description": "查询整数已知的因数分解及其状态，重点是已有分解记录，而不是一份一般数学百科。 条目记录整数与已知因子之间的关系，并用状态标识区分未完全分解、可能为素数或已经确认的分解结果。数据库中的因子可以继续连接到相应整数记录，形成可追查的分解关系。"
  },
  {
    "id": "E03",
    "group": "specialist",
    "name": "WolframAlpha",
    "url": "https://www.wolframalpha.com/examples/",
    "description": "综合性的结构化知识与计算服务，涉及科学量、日期、地理、数学等多个领域。 网站将不同领域的知识整理成能够计算和查询的结构化内容，输出形式包括数值、图表、公式与事实资料。官方示例按学科和主题展示其覆盖内容，答案通常同时呈现对输入的解释及相关结果模块。"
  },
  {
    "id": "E21",
    "group": "specialist",
    "name": "Name-Reaction",
    "url": "https://www.name-reaction.com/list",
    "description": "有机化学人名反应目录，介绍反应名称、反应式、试剂和机理等信息。 目录以命名反应为索引，将科学家姓名与相应的有机化学反应联系起来。反应页面围绕底物到产物的结构变化展示反应式、试剂条件及机理说明，内容主要使用英语与化学结构图。"
  },
  {
    "id": "E39",
    "group": "specialist",
    "name": "RFC Editor",
    "url": "https://www.rfc-editor.org/search",
    "description": "互联网 RFC 文档的官方检索入口，包含协议、数据格式、实践建议等原始文档。 文档库可以按编号、标题、作者或关键词等信息检索，条目同时记录发布时间、文档状态和更新、废止关系。RFC 包含标准轨道、实验、信息性等不同类型，正文与勘误共同构成查阅原始技术定义的资料来源。"
  },
  {
    "id": "E40",
    "group": "specialist",
    "name": "Intel 软件开发者手册",
    "url": "https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html",
    "description": "Intel 64 与 IA-32 架构的官方手册，覆盖指令、寄存器及系统架构等定义。 手册按基础架构、指令集参考与系统编程等内容分卷，详细描述指令操作数、执行效果、标志位及运行模式。它面向 Intel 64 与 IA-32 架构，以官方技术定义组织汇编指令和处理器行为资料。"
  }
].map(Object.freeze));

// Website introductions are category pages, not installed tools or algorithms.
// Navigation, mounting and search all project this one static catalogue.
export const GUIDE_PAGES = Object.freeze([
 {route:'external-guide',title:'外站资料指南',category:'reference'},
 {route:'external-codec',title:'密码分析外站',category:'codec'},
 {route:'external-media',title:'图像与媒体分析外站',category:'media'},
 {route:'external-other',title:'专业工具外站',category:'other'}
].map(page=>Object.freeze({...page,aliases:Object.freeze(['外链','外站','网站介绍','外部资料','网站推荐','资料网站',...GUIDE_SITES
 .filter(site=>(site.category||'reference')===page.category)
 .flatMap(site=>[site.id,site.name,...site.aliases||[]])])})));

export function findGuideSites(group='',query='',category='') {
 const text=String(query).trim().toLocaleLowerCase(),terms=text.split(/\s+/).filter(Boolean);
 const candidates=GUIDE_SITES.filter(s=>(!group||s.group===group)&&(!category||(s.category||'reference')===category));
 const exact=candidates.filter(s=>[s.id,s.name].some(value=>value.toLocaleLowerCase()===text));
 if(exact.length)return exact;
 return candidates.filter(s=>terms.every(t=>[s.id,s.name,s.description,...s.aliases||[]].join(' ').toLocaleLowerCase().includes(t)));
}
