// Pinned project licenses, verified against the bundled notices and THIRD_PARTY.md.
export const PROJECT_LICENSES = [
{"name":"seqparse","url":"https://github.com/Lattice-Automation/seqparse","license":"MIT；随包依赖许可分别保留","role":"SeqViz 读取玩家显式选择的本机 GenBank、FASTA、SnapGene、SBOL 等文件；不查询远程 accession。","notices":["vendor/science/seqviz/DEPENDENCY-NOTICES.txt"]},
{"name":"cnchar-data","url":"https://github.com/cn-char/cnchar-data","license":"包代码及词典按上游 MIT；笔顺路径的文鼎衍生数据另按 Arphic Public License","role":"1.1.0 离线笔顺、组词、释义资源；语音素材仅随完整上游归档保留，玩家界面不调用。","notices":["vendor/hanzi-full/CNCHAR-DATA-LICENSE","vendor/hanzi-full/ARPHICPL.txt","vendor/hanzi-full/NOTICE.txt"]},
{"name":"Qalculate! / libqalculate","url":"https://github.com/Qalculate/libqalculate","license":"核心 GPL-2.0-or-later；本次组合 WASM 按 GPL-3.0-or-later 提供","role":"5.13.0 完整内核；普通／科学计算器、分类实时单位换算、几何计算及 BMI 专用表单。全部 452 单位按原始定义解析真实输入记号；完整 425 函数、数据集与高级配置继续保留。","notices":["licenses/WORKBENCH-UX-NOTICE.txt","licenses/PRACTICAL-CALCULATORS-NOTICE.txt","vendor/qalculate/CORE-LICENSE","vendor/qalculate/NOTICE.txt","qalculate/UNIT-DEFINITIONS-NOTICE.txt"],"sourceArchive":"vendor/qalculate/source.zip"},
{"name":"GMP","url":"https://gmplib.org/","license":"LGPL-3.0-or-later 或 GPL-2.0-or-later","role":"6.3.0，Qalculate 任意精度整数与有理数运算。","notices":["vendor/qalculate/GMP-LGPL","vendor/qalculate/GMP-GPL","vendor/qalculate/GMP-LICENSE","vendor/qalculate/NOTICE.txt"]},
{"name":"MPFR","url":"https://www.mpfr.org/","license":"LGPL-3.0-or-later","role":"4.2.1，Qalculate 任意精度浮点数与舍入计算。","notices":["vendor/qalculate/MPFR-LGPL","vendor/qalculate/MPFR-LICENSE","vendor/qalculate/NOTICE.txt"]},
{"name":"libxml2","url":"https://gitlab.gnome.org/GNOME/libxml2","license":"MIT","role":"2.9.12，Qalculate 完整 XML 定义与数据集加载。","notices":["vendor/qalculate/XML-LICENSE","vendor/qalculate/NOTICE.txt"]},
{"name":"Gnuplot","url":"https://www.gnuplot.info/","license":"Gnuplot 自有许可（允许使用、复制及分发；修改以补丁形式分发）","role":"5.4.10，运行 Qalculate 原生绘图指令和完整数据，生成 SVG；使用 qalculate-nb 已编译的未改动 WASM。","notices":["vendor/qalculate/GNUPLOT-LICENSE","vendor/qalculate/NOTICE.txt"]},
{"name":"Emscripten","url":"https://github.com/emscripten-core/emscripten","license":"MIT / NCSA；musl MIT；LLVM libc++ / libc++abi / compiler-rt Apache-2.0 WITH LLVM-exception 等随包原文","role":"3.1.67 编译 Qalculate 完整内核并提供浏览器内存文件系统与 C/C++ 运行库。","notices":["vendor/qalculate/EMSCRIPTEN-LICENSE","vendor/qalculate/MUSL-COPYRIGHT","vendor/qalculate/LIBCXX-LICENSE","vendor/qalculate/LIBCXXABI-LICENSE","vendor/qalculate/COMPILER-RT-LICENSE","vendor/qalculate/NOTICE.txt"]},
{"name":"gifuct-js","url":"https://github.com/matt-way/gifuct-js","license":"MIT","role":"2.1.2；完整 GIF LZW 与交错像素解码；本站保留原始零延时、处置、透明和调色板。","notices":["vendor/animation/gifuct-js-LICENSE","vendor/animation/NOTICE.txt"]},
{"name":"js-binary-schema-parser","url":"https://github.com/matt-way/jsBinarySchemaParser","license":"MIT","role":"2.0.3；GIF 完整二进制结构解析，gifuct-js 的真实依赖。","notices":["vendor/animation/js-binary-schema-parser-LICENSE","vendor/animation/NOTICE.txt"]},
{"name":"UPNG.js","url":"https://github.com/photopea/UPNG.js","license":"MIT","role":"2.1.0；PNG/APNG 原始帧像素解码；本站负责按原始矩形、Alpha 和处置规则合成，16 位原始 PNG 字节保持。","notices":["vendor/animation/upng-js-LICENSE","vendor/animation/NOTICE.txt"]},
{"name":"pako","url":"https://github.com/nodeca/pako","license":"MIT AND Zlib","role":"1.0.11；UPNG 解压依赖、有界解压校验和无损 PNG 压缩，含 zlib 移植独立许可。","notices":["vendor/animation/pako-LICENSE","vendor/animation/pako-ZLIB-NOTICE.txt","vendor/animation/NOTICE.txt"]},
{"name":"Animate UI","url":"https://animate-ui.com/","license":"MIT + Commons Clause（详见随包 LICENSE.md，不是无附加条件的 MIT）","role":"2.0.0；Effect 原语负责页面内容的滑入与淡入；共享按钮、下拉选择、线性菜单滑动高亮与二维按键独立反馈、展开面板、复选标记及标签指示器使用真实组件；弹窗复用官方 Dialog／Sheet 动效定义。","notices":["licenses/WORKBENCH-UX-NOTICE.txt","vendor/ui-runtime/animate-ui-react-LICENSE.md","vendor/ui-runtime/NOTICE.txt"]},
{"name":"Motion","url":"https://motion.dev/","license":"MIT","role":"14.4.0；结果反馈、列表重排、笔记本分栏及 Animate UI 内部动画与进入控制。","notices":["vendor/ui-runtime/framer-motion-LICENSE.md","vendor/ui-runtime/motion-LICENSE.md","vendor/ui-runtime/motion-dom-LICENSE.md","vendor/ui-runtime/motion-utils-LICENSE.md","vendor/ui-runtime/NOTICE.txt"]},
{"name":"React","url":"https://react.dev/","license":"MIT","role":"19.3.1；共享 UI 组件宿主与渲染。工具输入、文件和编辑器保留原始节点，不建立第二套工具数据。","notices":["vendor/ui-runtime/react-LICENSE","vendor/ui-runtime/react-dom-LICENSE","vendor/ui-runtime/scheduler-LICENSE","vendor/ui-runtime/use-sync-external-store-LICENSE","vendor/ui-runtime/NOTICE.txt"]},
{"name":"Base UI","url":"https://base-ui.com/","license":"MIT","role":"1.8.0；Animate UI 的展开、选项与标签原语。随包依赖的具体版本和许可见固定来源记录。","notices":["vendor/ui-runtime/base-ui-react-LICENSE","vendor/ui-runtime/base-ui-utils-LICENSE","vendor/ui-runtime/floating-ui-utils-LICENSE", "vendor/ui-runtime/floating-ui-core-LICENSE", "vendor/ui-runtime/floating-ui-dom-LICENSE", "vendor/ui-runtime/floating-ui-react-dom-LICENSE", "vendor/ui-runtime/reselect-LICENSE","vendor/ui-runtime/NOTICE.txt"]},
{"name":"NGA International Code of Signals","url":"https://msi.nga.mil/Publications/ICOS","license":"美国政府作品；原书明确 NO COPYRIGHT CLAIMED UNDER TITLE 17 U.S.C.","role":"1969 年版／2020 修订版全部 159 页、原始 PDF 和信号旗图版；代用旗规则据其第 1 章第 5 节实现。","notices":["vendor/completion/marine/NOTICE.txt","vendor/completion/marine/SOURCE.json"]},
{"name":"GC Wizard 普鲁士电报码本","url":"https://github.com/GCWizard/GCWizard","license":"GPL-3.0-or-later（本次复用的 Dart 码本、六臂规则及适配）；其他未复用素材不纳入此许可声明","role":"固定提交中的完整普鲁士光学电报码本和六臂图形规则，保留所有条目及两份对应原始源码。","notices":["vendor/completion/gcwizard/LICENSE","vendor/completion/gcwizard/NOTICE.txt"]},
{"name":"grunt-jjencode","url":"https://github.com/blaiprat/grunt-jjencode","license":"MIT（原始源码顶部许可声明）","notices":["vendor/completion/obfuscation/jjencode-original.js"],"role":"完整 JJencode 编码函数，移除 Grunt 包装；保留原版权和来源。"},
{"name":"aaencode-cli","url":"https://github.com/jikkai/aaencode-cli","license":"MIT","notices":["vendor/completion/obfuscation/aaencode-LICENSE"],"role":"完整 AAencode 编码器，移除 CLI 包装；解码由独立 QuickJS 只捕获字符串载荷。"},
{"name":"liblouis-js","url":"https://github.com/liblouis/liblouis-js","license":"GPL-3.0-or-later","role":"浏览器虚拟文件系统与按需表加载；翻译通过已修正长度单位的直接 C 接口调用。","notices":["vendor/completion/liblouis/JS-LICENSE","vendor/completion/liblouis/NOTICE.txt"]},
{"name":"Liblouis","url":"https://github.com/liblouis/liblouis","license":"LGPL-2.1-or-later（核心）；各翻译表按表头原许可，完整保留","role":"Liblouis 3.39.0 核心与全部翻译表及 include 依赖；不使用节选字符表。","notices":["vendor/completion/liblouis/COPYING.LESSER","vendor/completion/liblouis/COPYING","vendor/completion/liblouis/NOTICE.txt"]},
{"name":"OrigamiSimulator","url":"https://github.com/amandaghassaei/OrigamiSimulator","license":"MIT；随包独立依赖许可见 NOTICE","role":"完整动态 GPU 求解器、13 份着色器、直线与曲线 SVG 折痕处理、FOLD 模型。","notices":["vendor/completion/origami/LICENSE","vendor/completion/origami/NOTICE.txt","vendor/completion/origami/dependency-notices/three-LICENSE.txt","vendor/completion/origami/dependency-notices/jquery-LICENSE.txt","vendor/completion/origami/dependency-notices/underscore-LICENSE.txt","vendor/completion/origami/dependency-notices/numeric-LICENSE.txt","vendor/completion/origami/dependency-notices/seedrandom-LICENSE.txt","vendor/completion/origami/dependency-notices/numeric-quadprog-LICENSE.txt","vendor/completion/origami/dependency-notices/earcut-LICENSE.txt","vendor/completion/origami/dependency-notices/cdt2d-LICENSE.txt","vendor/completion/origami/dependency-notices/svgpath-LICENSE.txt","vendor/completion/origami/dependency-notices/path-data-LICENSE.txt"]},
{"name":"FOLD","url":"https://github.com/edemaine/fold","license":"MIT","role":"折纸图结构、边面拓扑转换与几何处理。","notices":["vendor/completion/fold/LICENSE"]},
{"name":"bwip-js / BWIPP","url":"https://github.com/metafloor/bwip-js","license":"MIT；Inconsolata 字体 SIL-OFL-1.1","role":"完整 BWIPP 制式编码器、校验、纠错、矢量绘制与内嵌字体。","notices":["vendor/completion/bwip-js/LICENSE","vendor/completion/bwip-js/LICENSE.INCONSOLATA"]},
{"name":"Base65536","url":"https://github.com/qntm/base65536","license":"MIT","role":"完整 Base65536 算法和安全码点映射。","notices":["vendor/completion/base65536/LICENSE.txt"]},
{"name":"node-base91","url":"https://github.com/Equim-chan/base91","license":"BSD-3-Clause","role":"basE91 字节编码与解码；仅将 Buffer 传输适配为 Uint8Array。","notices":["vendor/completion/base91/LICENSE"]},
{"name":"simple-keyboard-layouts","url":"https://github.com/simple-keyboard/simple-keyboard-layouts","license":"MIT","role":"完整上游语言布局与层、候选数据。","notices":["vendor/completion/simple-keyboard-layouts/LICENSE"]},
{"name":"simple-keyboard","url":"https://github.com/hodgef/simple-keyboard","license":"MIT","role":"完整键盘引擎，包括光标、按键层和候选处理。","notices":["vendor/completion/simple-keyboard/LICENSE"]},
{"name":"IOC World Bird List 中文鸟名","url":"https://www.worldbirdnames.org/new/ioc-lists/master-list-2/","license":"CC-BY-3.0 Unported；Gill F, D Donsker & P Rasmussen (Eds). 2026. IOC World Bird List (v15.2)；中文鸟名编者详见原表 Sources","notices":["licenses/WORKBENCH-UX-NOTICE.txt","vendor/atlas-life-culture/IOC-CC-BY-3.0.txt","vendor/atlas-life-culture/CHINESE-NOTICE.txt"],"role":"完整固定 15.2 多语言原表，以完全相同学名为 AviList 中 11,075 种补充已有简繁中文鸟名；不猜测分类拆分／合并，也不替没有原名的属、目或亚种命名。"},
{"name":"Wikidata 中文名称补充","url":"https://www.wikidata.org/","license":"结构化标签、别名及身份资料 CC0-1.0；保留条目标识、查询来源与修订／固定快照信息；不使用维基百科正文或图片","notices":["vendor/atlas-life-culture/Wikidata-CC0-1.0.txt","vendor/atlas-life-culture/CHINESE-NOTICE.txt","licenses/REFERENCE-CHINESE-NOTICE.txt","licenses/REFERENCE-CHINESE-CC0-1.0.txt"],"role":"固定社区结构化中文资料，经精确身份或标准代码规则对应本地记录：208 位作曲家、14 个音乐检索术语、235 个首都、5,093 个机场、33,831 个运输地点和 87 个深空对象。覆盖有限，未匹配与作品全文保留原文，不是整库自动翻译或官方命名标准。"},
{"name":"Unicode CLDR 中文名称与注释","url":"https://github.com/unicode-org/cldr-json","license":"Unicode License v3（Unicode-3.0）；Copyright Unicode, Inc. and contributors","notices":["vendor/cldr/LICENSE.txt","vendor/cldr/NOTICE.txt"],"role":"固定 48.2.0 简繁中文城市、国家／地区、货币及文字系统名称和 4,342 组 Emoji／符号注释；另以 Unicode 17.0.0 文字系统代码做精确关联。只补充可靠对应的标签及关键词，未覆盖的记录继续保留原文，不宣称完整汉化 Unicode 或历史货币。"},
{"name":"MDN 中文参考资料","url":"https://github.com/mdn/translated-content","license":"中文正文及其抽取说明 CC-BY-SA-2.5；署名 MDN contributors；不包含示例代码、商标或媒体素材","notices":["vendor/reference-mdn-zh/LICENSE.md","vendor/reference-mdn-zh/NOTICE.txt"],"role":"固定 e7abcf317df79ab57e6053f48c8b1fec01920836 的完整选定中文 HTTP 标头、常见 MIME 列表及 CSP 词条，按精确标识为 103 个本地 HTTP 字段、75 个 MIME 类型补充可检索中文说明；其余 IANA 登记仍显示原文。"},
{"name":"CDS/SIMBAD online object data","url":"https://simbad.cds.unistra.fr/simbad/","linkLabel":"官方数据服务","license":"数据按各原始来源许可使用；保留 CDS/SIMBAD、原作者、论文与 DOI，不统一宣称 CC0","notices":["licenses/CDS-ONLINE-TERMS.txt","licenses/SIMBAD-ONLINE-NOTICE.txt","licenses/ONLINE-READING-NOTICE.txt"],"role":"按名称、ICRS 天区和真实对象编号主动查询天体基本资料、别名、测光与文献；完整字段、单位与来源保留。本站原创固定接口适配，不打包本地恒星样本或 SIMBAD 软件。 按坐标、对象类型、别名、波段测光和文献分节展示中文字段，保留实际参考系和单位。"},
{"name":"CDS/VizieR online catalogue data","url":"https://vizier.cds.unistra.fr/","linkLabel":"官方数据服务","license":"各目录独立许可，遵从返回的 rights_uri 和数据集条款；保留 CDS/VizieR、原作者与论文/DOI","notices":["licenses/CDS-ONLINE-TERMS.txt","licenses/VIZIER-ONLINE-NOTICE.txt","licenses/ONLINE-READING-NOTICE.txt"],"role":"主动读取真实星表目录、全部返回字段模式及有界条件/天区记录；保留完整原始 TSV、单位、元数据及目录权利，不打包精选星表。 按目录说明、列定义、单位和查询记录生成可读资料表，原文及未知列保留。"},
{"name":"Crystallography Open Database (COD) online data","url":"https://www.crystallography.net/cod/","linkLabel":"官方数据服务","license":"数据 CC0-1.0；保留结构原作者、COD 编号及原始论文的科研引用","notices":["licenses/ONLINE-CC0-1.0.txt","licenses/COD-ONLINE-NOTICE.txt","licenses/ONLINE-READING-NOTICE.txt"],"role":"主动按组成、元素、空间群和论文条件查询真实晶体记录；显式请求单条详情或原始 CIF。未恢复旧晶体样本库，不含 COD 服务端软件。上游连通受实际部署网络影响。 按化学式、空间群、晶胞和论文分组；CIF 仅作原文预览。"},
{"name":"PubChem PUG REST / PUG View data","url":"https://pubchem.ncbi.nlm.nih.gov/","linkLabel":"官方数据服务","license":"遵从 NIH/NCBI 与各提供方条款；第三方注释和资料不统一视为 CC0，保留各记录来源","notices":["licenses/PUBCHEM-POLICIES.txt","licenses/PUBCHEM-ONLINE-NOTICE.txt","licenses/ONLINE-READING-NOTICE.txt"],"role":"主动获取 CID、完整化合物记录、注释引用、同义词与 2D/3D 结构记录；保留完整原始字段和各提供方来源，不下载图片或使用 PubChem 软件引擎。 从返回值提取身份、性质、带来源注释、同义词及结构统计，不猜译原文或绘制假结构。"},
{"name":"中国·国家地名信息库公开数据服务","url":"https://dmfw.mca.gov.cn/","linkLabel":"官方数据服务","license":"民政部官方公开接口查询；未声明整库开放再分发许可，不包含图片或地图底图授权","notices":["licenses/PLACENAMES-API-TERMS.txt","licenses/PLACENAMES-ONLINE-NOTICE.txt","licenses/ONLINE-READING-NOTICE.txt"],"role":"七个真实只读公开接口：行政区、地名搜索与详情、同名/同音按区划和类别统计；保留全部原始字段、CGCS2000 坐标、查询条件与时间。 将已有标准名称、拼写、沿革、行政层级和统计字段按中文分组展示。"},
{"name":"汉典公开字词页内容","url":"https://www.zdic.net/","linkLabel":"公开字词原文","license":"汉典使用条款对相关字词等内容声明 CC0-1.0；公开页读取并非官方 API，遵从 robots 路径边界","notices":["licenses/ZDIC-TERMS.txt","licenses/ONLINE-CC0-1.0.txt","licenses/ZDIC-ONLINE-NOTICE.txt","licenses/ONLINE-READING-NOTICE.txt"],"role":"仅按明确输入读取 /hans/ 公开字词页的实际原文分节；不调用禁止的动态 API、不含模糊/拼音检索、会员或媒体功能。本站解析器原创，网页变化或拒绝时明确失败。 将已有字词属性、读音及文字释义按中文分节，不补猜动态内容。"},
{"name":"知识图谱网 / CNKGraph 公开诗文服务","url":"https://cnkgraph.com/","linkLabel":"官方数据服务","license":"仅限非商业研究、学习；不属于 CC0 或无限制开源数据，保留原提供方与作品作者","notices":["licenses/CNKGRAPH-OPEN-TERMS.txt","licenses/CNKGRAPH-ONLINE-NOTICE.txt","licenses/ONLINE-READING-NOTICE.txt"],"role":"通过知识图谱网官方开放接口主动读取已登记的诗文/词谱查询与详情；原始繁体、完整返回字段及出处保留，不冒称全部古籍、韵典和其他接口均已集成。 从返回值摘取作品正文、作者朝代、词牌谱式和韵字，以中文字段展示。"},
{"name":"神奇宝贝百科 / 52poke 文字资料","url":"https://wiki.52poke.com/","linkLabel":"官方百科服务","license":"文字 CC-BY-NC-SA-3.0；署名神奇宝贝百科及条目贡献者，保留固定版本与作者历史；媒体权利独立","notices":["licenses/52POKE-COPYRIGHT.txt","licenses/52POKE-CC-BY-NC-SA-3.0.txt","licenses/52POKE-ONLINE-NOTICE.txt","licenses/ONLINE-READING-NOTICE.txt"],"role":"公开 MediaWiki 文字搜索与条目原始 Wiki 文本/版本查询；不执行模板、HTML，不获取角色图像、游戏截图或音频。全服务至少间隔 500 秒，不绕过上游访问拒绝。 从同次 Wiki 原文静态提取可识别基本资料和导语，保留固定版本与历史入口，陌生模板不猜测。"},
{"name":"The On-Line Encyclopedia of Integer Sequences (OEIS)","url":"https://oeis.org/","linkLabel":"官方数据服务","license":"在线条目数据 CC-BY-SA-4.0；署名 The Online Encyclopedia of Integer Sequences、The OEIS Foundation Inc. 及条目贡献者","notices":["licenses/OEIS-CC-BY-SA-4.0.txt","licenses/OEIS-EULA.txt","licenses/OEIS-NOTICE.txt","licenses/ONLINE-READING-NOTICE.txt"],"role":"用户主动提交查询后，由本站服务器向 OEIS 官方 JSON 查询接口取得当前页候选及完整条目字段；保留条目作者、来源链接与查询时间。没有内置全量数据库，不含 OEIS 服务端软件代码；本站查询适配器为原创。 将数列项、offset、公式、例子、说明及文献按中文分节，英文原文不猜译。"},
{"name":"IANA Time Zone Database","url":"https://www.iana.org/time-zones","license":"时区数据与本次使用的数据文档为公有领域；原始包中未使用的 C 代码另见 BSD 原文","notices":["licenses/PRACTICAL-CALCULATORS-NOTICE.txt","vendor/timezones/IANA-LICENSE.txt","vendor/timezones/NOTICE.txt"],"role":"固定 2026e 完整默认 Zone／Link 资料、历史转换和未来规则，支持倒计时与多地会议规划；backzone 原文保留查阅，未作为默认 TZif 计算输入。"},
{"name":"PSF tzdata","url":"https://github.com/python/tzdata","license":"发行包 Apache-2.0；内含 IANA 时区数据为公有领域","notices":["vendor/timezones/PSF-LICENSE.txt","vendor/timezones/PSF-LICENSE_APACHE.txt","vendor/timezones/NOTICE.txt"],"role":"固定 tzdata 2026.5 的 598 个默认编译 TZif 文件；由本站本地解析器读取，不依赖浏览器 Intl 的时区版本。"},
{"name":"IAU 88 Constellations","url":"https://iauarchive.eso.org/public/themes/constellations/","license":"图谱 CC-BY-4.0，署名 IAU and Sky & Telescope；官方名称、缩写与边界保留来源说明","notices":["vendor/atlas-celestial/IAU-NOTICE.txt","vendor/atlas-celestial/CC-BY-4.0.txt"],"role":"全部 88 星座名称、属格、三字母缩写、89 幅原图及边界数据；巨蛇座头尾分别保留。"},
{"name":"NASA Five Millennium Eclipse Catalogs","url":"https://eclipse.gsfc.nasa.gov/","license":"NASA 官网允许再版；须署名 Eclipse Predictions by Fred Espenak and Jean Meeus (NASA's GSFC)","notices":["vendor/atlas-celestial/NASA-NOTICE.txt"],"role":"天文年 −1999 至 3000 的完整 11,898 次日食与 12,064 次月食、原始列、历法与 ΔT 文档；目录查询不等于任意地点可见性计算。"},
{"name":"AviList","url":"https://www.avilist.org/checklist/v2025b/","license":"CC-BY-4.0；AviList Core Team. 2026. AviList: The Global Avian Checklist, v2025b. DOI 10.2173/avilist.v2025b","notices":["licenses/WORKBENCH-UX-NOTICE.txt","vendor/atlas-life-culture/AviList-CC-BY-4.0.txt","vendor/atlas-life-culture/NOTICE.txt"],"role":"v2025b Extended 完整 33,684 条分类记录、26 列与 6 张工作表，包括决议、文献与变更说明；不含鸟鸣或图片素材。"},
{"name":"Open Opus data","url":"https://openopus.org/","license":"数据 CC0-1.0／公有领域；未使用 GPL API 服务器代码","notices":["vendor/atlas-life-culture/OpenOpus-CC0-1.0.txt","vendor/atlas-life-culture/NOTICE.txt"],"role":"2026-10-17 官方全量 JSON 快照的 220 位作曲家与 24,975 部作品，保留所有原字段和作品关联；不包含录音、乐谱与肖像文件。"},
{"name":"Alpertron Calculators","url":"https://github.com/alpertron/calculators","license":"GPL-3.0-or-later；随包 musl MIT／Sun Microsystems 宽松许可","notices":["vendor/expansion/alpertron/LICENSE.txt","vendor/expansion/alpertron/musl-COPYRIGHT.txt","vendor/expansion/alpertron/NOTICE.txt"],"role":"当前启用官方本地 integer WASM：整数表达式、素性检验、ECM／SIQS 因数分解、除数与批处理；其余九个高级计算器已退役。完整原始模块与对应 source.tar.gz、许可保留归档。"},
{"name":"ggmorse","url":"https://github.com/ggerganov/ggmorse","license":"ggmorse MIT；FFT 引用部分 CC-BY-SA-3.0／4.0；Emscripten、musl、libc++ 与 compiler-rt 各附原始许可","notices":["vendor/expansion/ggmorse/LICENSE-MIT.txt","vendor/expansion/ggmorse/FFT-NOTICE.txt","vendor/expansion/ggmorse/CC-BY-SA-3.0.txt","vendor/expansion/ggmorse/CC-BY-SA-4.0.txt","vendor/expansion/ggmorse/EMSCRIPTEN-LICENSE.txt","vendor/expansion/ggmorse/MUSL-COPYRIGHT.txt","vendor/expansion/ggmorse/LIBCXX-LICENSE.txt","vendor/expansion/ggmorse/LIBCXXABI-LICENSE.txt","vendor/expansion/ggmorse/COMPILER-RT-LICENSE.txt"],"role":"固定 ggmorse 源码编译为本地 WASM，真实摩斯音频解码／编码、自动音调与速度估计、诊断信号和频谱。"},
{"name":"Excalidraw","url":"https://github.com/excalidraw/excalidraw","license":"MIT；字体 SIL OFL-1.1（Comic Shanns 为 MIT）；各依赖按随包原始许可","notices":["vendor/graphics/EXCALIDRAW-LICENSE.txt","vendor/graphics/FONTS-NOTICES.txt","vendor/graphics/DEPENDENCY-NOTICES.txt","vendor/graphics/LICENSES.txt"],"role":"固定 0.18.1，线索白板的图形、文字、图片、连线、撤销与图片导出；本地构建 React 组件，默认规整线条。"},
{"name":"React / React DOM","url":"https://github.com/facebook/react","license":"MIT","notices":["vendor/graphics/licenses/react-LICENSE","vendor/graphics/licenses/react-dom-LICENSE"],"role":"固定 19.0.0，仅为本地 Excalidraw 编辑器提供运行时，不接管网站页面。"},
{"name":"Mind Elixir","url":"https://github.com/SSShooter/mind-elixir-core","license":"MIT","notices":["vendor/graphics/licenses/mind-elixir-LICENSE"],"role":"固定稳定版 5.15.1，思维导图的节点、分支、关系线、概要、布局与导出；原始运行文件本地提供。"},
{"name":"笔记公式 · KaTeX","url":"https://github.com/KaTeX/KaTeX","license":"KaTeX 与字体 MIT；mhchem 改编 MIT，原作 Apache-2.0","notices":["vendor/notebook/KATEX-RENDERER-LICENSE.txt","vendor/notebook/KATEX-FONTS-NOTICE.txt","vendor/notebook/KATEX-MHCHEM-NOTICE.txt","vendor/notebook/DIFF-MATCH-PATCH-LICENSE.txt"],"role":"KaTeX 0.16.9 与 mhchem，笔记数学及化学公式、导出字体。"},
{"name":"笔记代码高亮 · highlight.js","url":"https://github.com/highlightjs/highlight.js","license":"BSD-3-Clause","notices":["vendor/notebook/HIGHLIGHT-JS-RENDERER-LICENSE.txt"],"role":"固定 11.7.0，笔记代码语法高亮及本地配色。"},
{"name":"笔记图表 · Mermaid","url":"https://github.com/mermaid-js/mermaid","license":"MIT","notices":["vendor/notebook/MERMAID-RENDERER-LICENSE.txt"],"role":"固定 11.16.1，流程、时序和甘特等图表；本地严格模式渲染。"},
{"name":"笔记图表 · Apache ECharts","url":"https://github.com/apache/echarts","license":"Apache-2.0","notices":["vendor/notebook/ECHARTS-RENDERER-LICENSE.txt"],"role":"固定 5.5.1，JSON 数据图表与树形脑图。"},
{"name":"笔记脑图 · Markmap / D3","url":"https://github.com/markmap/markmap","license":"Markmap MIT；D3 ISC","notices":["vendor/notebook/MARKMAP-LIB-RENDERER-LICENSE.txt","vendor/notebook/MARKMAP-VIEW-RENDERER-LICENSE.txt","vendor/notebook/D3-RENDERER-LICENSE.txt"],"role":"Vditor 固定随包 Markmap 与 D3 6.7.0；只用本地转换、绘制，不加载远程插件。"},
{"name":"笔记流程图 · flowchart.js","url":"https://github.com/adrai/flowchart.js","license":"MIT（flowchart.js、Raphael、eve-raphael）","notices":["vendor/notebook/FLOWCHART-JS-RENDERER-LICENSE.txt","vendor/notebook/RAPHAEL-RENDERER-LICENSE.txt","vendor/notebook/EVE-RAPHAEL-RENDERER-LICENSE.txt"],"role":"flowchart.js 1.14.1、Raphael 2.3.0、Eve 0.5.0，本地 SVG 流程图。"},
{"name":"笔记关系图 · Viz.js","url":"https://github.com/mdaines/viz.js","license":"Viz.js MIT；Graphviz EPL-1.0；Expat MIT；zlib Zlib","notices":["vendor/notebook/VIZ-JS-RENDERER-LICENSE.txt","vendor/notebook/GRAPHVIZ-EPL-LICENSE.txt","vendor/notebook/EXPAT-LICENSE.txt","vendor/notebook/ZLIB-LICENSE.txt"],"role":"Viz.js 2.1.2 / Graphviz 2.40.1，独立本地 Worker 渲染关系图；原分发包内嵌来源声明保留。"},
{"name":"笔记波形 · WaveDrom","url":"https://github.com/wavedrom/wavedrom","license":"MIT","notices":["vendor/notebook/WAVEDROM-RENDERER-LICENSE.txt"],"role":"固定 3.6.2，JSON 数字波形图，不执行输入脚本。"},
{"name":"笔记五线谱 · abcjs","url":"https://github.com/paulrosen/abcjs","license":"MIT","notices":["vendor/notebook/ABCJS-RENDERER-LICENSE.txt"],"role":"固定 5.10.3，ABC 乐谱本地渲染。"},
{"name":"笔记化学结构 · SmilesDrawer","url":"https://github.com/reymond-group/smilesDrawer","license":"MIT","notices":["vendor/notebook/SMILES-DRAWER-RENDERER-LICENSE.txt"],"role":"Vditor 固定随包构建，SMILES 化学结构图；许可来源为 2.1.7 分发包。"},
{"name":"Vditor","url":"https://github.com/Vanessa219/vditor","license":"MIT；随包 diff-match-patch 为 Apache-2.0；Lute 另列","notices":["vendor/notebook/VDITOR-LICENSE.txt","vendor/notebook/DIFF-MATCH-PATCH-LICENSE.txt","vendor/notebook/NOTICE.txt"],"role":"固定 4.0.0，笔记本的中文 Markdown 编辑器，运行资源全部本地提供。"},
{"name":"Lute","url":"https://github.com/88250/lute","license":"MulanPSL-2.0；GopherJS 与 Go 运行时为 BSD-3-Clause","notices":["vendor/notebook/LUTE-LICENSE.txt","vendor/notebook/GOPHERJS-LICENSE.txt","vendor/notebook/GO-LICENSE.txt","vendor/notebook/NOTICE.txt"],"role":"Vditor 4.0.0 自带的固定 Markdown 解析运行包，未替换上游字节。"},
{"name":"DOMPurify","url":"https://github.com/cure53/DOMPurify","license":"Apache-2.0 OR MPL-2.0（本项目按 Apache-2.0 使用）","notices":["vendor/notebook/DOMPURIFY-LICENSE.txt"],"role":"固定 3.4.17，在笔记编辑器的解析边界过滤不可信 HTML 与外部资源。"},
{"name":"Nodemailer","url":"https://github.com/nodemailer/nodemailer","license":"MIT-0","notices":["licenses/nodemailer-MIT-0.txt"],"role":"固定 10.1.1，仅用于独立服务发送用户主动提交的问题报告，不进入浏览器运算包。"},
{"name":"IANA Protocol Registries","url":"https://www.iana.org/protocols","license":"CC0 1.0（协议注册表数据；不含引用的RFC文档）","notices":["vendor/it-reference/IANA-CC0-1.0.txt","vendor/it-reference/IANA-NOTICE.txt"],"role":"固定服务端口、IP协议号、HTTP状态与字段、字符集名称和别名；派生JSON加入本站中文科普。"},
{"name":"mime-db","url":"https://github.com/jshttp/mime-db","license":"MIT","notices":["vendor/it-reference/mime-db-LICENSE.txt"],"role":"固定1.54.0媒体类型、扩展名、默认字符集、来源标记与可压缩性资料。"},
{"name":"Public Suffix List","url":"https://github.com/publicsuffix/list","license":"MPL-2.0（原始和派生公共后缀数据）","notices":["vendor/it-reference/PSL-LICENSE.txt","vendor/it-reference/PSL-NOTICE.txt","vendor/it-reference/public_suffix_list.dat"],"role":"完整ICANN/PRIVATE公共后缀规则；含通配、例外和IDN。原生匹配实现，不使用tldts。"},
{"name": "cryptii", "url": "https://github.com/cryptii/cryptii", "license": "MIT", "notices": ["vendor/basics/cryptii-LICENSE.txt", "vendor/basics/NOTICE.txt"], "role": "敲击码与坐标方阵转换引擎"},
{"name": "romanice", "url": "https://github.com/dkin-om/romanice", "license": "MIT", "notices": ["vendor/basics/romanice-LICENSE.txt", "vendor/basics/NOTICE.txt"], "role": "标准罗马数字双向转换"},
{"name": "Invisibles", "url": "https://github.com/cig13zs/invisibles", "license": "MIT", "notices": ["vendor/basics/invisibles-LICENSE.txt", "vendor/basics/NOTICE.txt"], "role": "隐藏字符分类与清理"},
{"name": "baudot.js", "url": "https://github.com/zenoamaro/baudot.js", "license": "MIT", "notices": ["vendor/basics/baudot-LICENSE.txt", "vendor/basics/NOTICE.txt"], "role": "五位电传编码和三种字母表"},
{"name":"Turing Machine Viz","url":"https://github.com/aepsilon/turing-machine-viz","license":"BSD-3-Clause","notices":["vendor/turing/LICENSE.txt","vendor/turing/NOTICE.txt"],"role":"固定图灵机规则解析、纸带与状态转移引擎；本站适配 Unicode、停留移动、限额和回退。"},
{"name":"js-yaml","url":"https://github.com/nodeca/js-yaml","license":"MIT","notices":["vendor/turing/js-yaml-LICENSE.txt","vendor/turing/NOTICE.txt"],"role":"固定 4.3.2 本地 YAML 解析，使用安全数据模式，不执行 JavaScript 标签。"},
{"name":"doken","url":"https://github.com/yishn/doken","license":"MIT","notices":["vendor/discovery/doken-LICENSE.txt","vendor/discovery/NOTICE.txt"],"role":"Sabaki SGF 使用的固定 1.0.0 tokenizer。"},
{"name":"Sabaki SGF","url":"https://github.com/SabakiHQ/sgf","license":"MIT（含 doken tokenizer 的 MIT 许可）","notices":["vendor/discovery/sgf-LICENSE.txt","vendor/discovery/doken-LICENSE.txt","vendor/discovery/NOTICE.txt"],"role":"SGF 字符串解析、节点分支与转义；棋盘和复盘规则为本站实现。"},
{"name":"Marine Signal Flags","url":"https://github.com/dzangolab/marine-signal-flags","license":"MIT","notices":["vendor/discovery/marine-LICENSE.txt","vendor/discovery/marine-README.txt"],"role":"36 张原始海事字母旗、数字旗 SVG；保留原许可署名。"},
{"name":"Currency Codes","url":"https://github.com/datasets/currency-codes","license":"PDDL 1.0（数据）","notices":["vendor/discovery/currency-README.txt","vendor/discovery/currency-datapackage.json"],"role":"现行与历史 ISO 4217 实体—货币资料；本站按代码和状态合并显示。"},
{"name":"OpenNGC","url":"https://github.com/mattiaverga/OpenNGC","license":"CC BY-SA 4.0（原始及派生数据）","notices":["vendor/discovery/ngc-LICENSE.txt","vendor/discovery/ngc-README.txt","vendor/discovery/ngc-FIELDS.txt","vendor/discovery/NOTICE.txt"],"role":"NGC／IC 及补充深空目录；保留字段来源、缺失值与原始别名。"},
{"name":"Natural Earth","url":"https://github.com/nvkelso/natural-earth-vector","license":"公共领域（地图数据）","notices":["vendor/reference/natural-earth-LICENSE.txt"],"role":"世界地图的固定简化轮廓；投影和点选界面由本站实现。"},
{"name": "Countries", "url": "https://github.com/annexare/Countries", "license": "MIT", "notices": ["vendor/reference/countries-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "flag-icons", "url": "https://github.com/lipis/flag-icons", "license": "MIT", "notices": ["vendor/reference/flags-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "OurAirports", "url": "https://github.com/davidmegginson/ourairports-data", "license": "Unlicense / 公共领域", "notices": ["vendor/reference/airports-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "UN/LOCODE 数据集", "url": "https://github.com/datasets/un-locode", "license": "PDDL 1.0（数据）", "notices": ["vendor/reference/ports-README.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "Unicode Character Database", "url": "https://github.com/unicode-org/unicodetools", "license": "Unicode-3.0（数据）", "notices": ["vendor/reference/unicode-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "i-ching", "url": "https://github.com/strobus/i-ching", "license": "MIT", "notices": ["vendor/reference/iching-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "Tarot Card Data", "url": "https://github.com/smallcat419/tarot-card-data", "license": "CC0 1.0（数据；本站中文简述另行编写）", "notices": ["vendor/reference/tarot-README.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "TarotCards / 1909 RWS 牌面", "url": "https://github.com/mixvlad/TarotCards", "license": "公共领域（1909 RWS 牌面）；MIT（随附来源文档）", "notices": ["vendor/reference/tarot-art-NOTICE.txt", "vendor/reference/tarot-art-SOURCES.txt", "vendor/reference/tarot-art-metadata.json", "vendor/reference/tarot-art-LICENSE.txt", "vendor/reference/tarot-art-README.txt"], "role": "塔罗查询使用的 78 张本地公版牌面；原画 Pamela Colman Smith，扫描修复 Steve P.。"},
{"name": "Gearberry / 蓝金幻想牌面", "url": "https://github.com/reginanka/tarot-cards", "license": "CC BY 4.0（牌面；按上游声明）", "notices": ["vendor/reference/tarot-gearberry-NOTICE.txt", "vendor/reference/tarot-gearberry-LICENSE.txt", "vendor/reference/tarot-gearberry-README.txt"], "role": "Tarot Cards WebP Collection by Gearberry；默认塔罗牌面，78 张原始 WebP 本地分发。"},
{"name": "Color Names", "url": "https://github.com/meodai/color-names", "license": "MIT", "notices": ["vendor/reference/colors-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name": "ICS 国际年代地层表", "url": "https://github.com/i-c-stratigraphy/chart", "license": "CC BY 4.0（派生查询数据）", "notices": ["vendor/reference/geology-chart-LICENSE.txt"], "role": "信息查询使用的固定本地数据，具体改编与版本见随包来源记录。"},
{"name":"Astronomy Engine","url":"https://github.com/cosinekitty/astronomy","license":"MIT","notices":["vendor/science/astronomy-LICENSE.txt"],"role":"固定 2.1.19 完整公开接口工作表，以及原生天体方位、事件与坐标计算。"},
{"name":"lunar-javascript","url":"https://github.com/6tail/lunar-javascript","license":"MIT","notices":["vendor/science/lunar-LICENSE.txt"],"role":"固定 1.7.7 全部原生历法对象、佛历、道历、干支与传统文化计算接口。"},
{"name":"Periodic-Table-JSON","url":"https://github.com/Bowserinator/Periodic-Table-JSON","license":"CC BY-SA 3.0（数据；本站中文字段与筛选结果为改编）","notices":["vendor/science/elements-LICENSE.txt","licenses/PRACTICAL-CALCULATORS-NOTICE.txt"],"role":"固定版本全部 118 个元素及全部原始字段；中文名称为附加层，原始媒体链接仅作文字，不自动加载。"},
{"name":"SeqViz","url":"https://github.com/Lattice-Automation/seqviz","license":"MIT","notices":["vendor/science/seqviz-LICENSE.txt","vendor/science/seqviz/DEPENDENCY-NOTICES.txt"],"role":"3.10.25 完整本地 React 查看器：线性／环形序列、注释、引物、翻译、酶切、搜索与选区；保留原序列算法。外部字体与 accession 查询关闭。"},
{"name": "NtSeq", "url": "https://github.com/keithwhor/NtSeq", "license": "MIT", "notices": ["vendor/science/ntseq-LICENSE.txt"], "role": "科学与历法工具使用的固定本地组件或数据。"},
{"name": "RDKit / MinimalLib", "url": "https://github.com/rdkit/rdkit", "license": "BSD-3-Clause（含上游随附声明）", "notices": ["vendor/science/rdkit-LICENSE.txt"], "role": "科学与历法工具使用的固定本地组件或数据。"},

  {
    "name": "CyberChef",
    "url": "https://github.com/gchq/CyberChef",
    "license": "Apache-2.0（另含依赖许可原文）",
    "notices": [
      "vendor/cyberchef/LICENSE.txt",
      "vendor/knowledge/LICENSE.txt",
      "vendor/knowledge/NOTICE.txt"
    ],
    "role": "官方本地 Worker 算法引擎与完整配方处理，保留原始字节、操作标识及随包依赖许可。"
  },
  {
    "name": "puzzle-lib",
    "url": "https://github.com/kfarnung/puzzle-lib",
    "role": "旗语方向、六点盲文字符键盘与点位识读、数字状态及既有谜题规则的完整映射与实现。",
    "license": "MIT",
    "notices": [
      "licenses/WORKBENCH-UX-NOTICE.txt","vendor/puzzle-lib/LICENSE.txt"
    ]
  },
  {
    "name": "jsQR",
    "url": "https://github.com/cozmo/jsQR",
    "license": "Apache-2.0",
    "notices": [
      "vendor/jsqr-LICENSE.txt"
    ],
    "role": "图片二维码读取与修复矩阵的本地二维码解码核心。"
  },
  {
    "name": "fft.js",
    "url": "https://github.com/indutny/fft.js",
    "license": "MIT",
    "notices": [
      "vendor/fft-LICENSE.txt"
    ],
    "role": ""
  },
  {
    "name": "exifr",
    "url": "https://github.com/MikeKovarik/exifr",
    "license": "MIT",
    "notices": [
      "licenses/exifr-7.1.3-MIT.txt"
    ],
    "role": ""
  },
  {
    "name": "Noto Serif SC",
    "url": "https://github.com/google/fonts",
    "license": "OFL-1.1",
    "notices": [
      "fonts/NotoSerifSC-OFL.txt"
    ],
    "role": "Noto Serif SC 界面字形子集"
  },
  {
    "name": "Noto Sans SC",
    "url": "https://github.com/google/fonts/tree/main/ofl/notosanssc",
    "license": "OFL-1.1",
    "notices": [
      "fonts/NotoSansSC-OFL.txt"
    ],
    "role": "中文界面、工具标题及等宽输入区中文回退字形；本地可变字重子集"
  },
  {
    "name": "Inter",
    "url": "https://github.com/rsms/inter",
    "license": "OFL-1.1",
    "notices": [
      "fonts/Inter-OFL.txt"
    ],
    "role": "英文界面文字与数字；固定 4.1 本地可变字体"
  },
  {
    "name": "JetBrains Mono",
    "url": "https://github.com/JetBrains/JetBrainsMono",
    "license": "OFL-1.1",
    "notices": [
      "fonts/JetBrainsMono-OFL.txt"
    ],
    "role": "界面等宽字体"
  },
  {
    "name": "AperiSolve",
    "url": "https://github.com/Zeecka/AperiSolve",
    "license": "MIT",
    "notices": [
      "vendor/aperisolve/LICENSE.txt"
    ],
    "role": ""
  },
  {
    "name": "StegOnline",
    "url": "https://github.com/Ge0rg3/StegOnline",
    "license": "StegOnline：WTFPL；PngToy：MIT",
    "notices": [
      "vendor/stegonline/LICENSE.txt"
    ],
    "role": "图片位平面与隐写提取；随包 PngToy 另用于共享 PNG 原始像素解码，遵循其 MIT 许可。"
  },
  {
  "name": "cipher-machine",
  "url": "https://github.com/philippica/cipher_machine",
  "license": "BSD-3-Clause",
  "notices": [
    "vendor/hunt/cipher-machine/LICENSE",
    "vendor/expansion/hunt/cipher-machine-LICENSE.txt",
    "vendor/expansion/hunt/NOTICE.txt"
  ],
  "role": "完整英文词库与词类、七类查词和网格搜索；中文规则解析／约束搜索、字典替换及完整键盘映射。"
},
  {
  "name": "chinese-puzzle",
  "url": "https://github.com/philippica/ChinesePuzzleTool",
  "license": "BSD-2-Clause",
  "notices": [
    "vendor/hunt/chinese-puzzle/LICENSE",
    "vendor/expansion/hunt/chinese-puzzle-LICENSE.txt",
    "vendor/expansion/hunt/NOTICE.txt"
  ],
  "role": "完整中文词语、字属性、部件、拼音与成语查询；9562字笔画端点数据与原始KM匹配算法。"
},
  {
    "name": "stereogram",
    "url": "https://github.com/piellardj/stereogram-solver",
    "license": "MIT",
    "notices": [
      "vendor/hunt/stereogram/LICENSE"
    ],
    "role": ""
  },
  {
    "name": "SSTV Decoder",
    "url": "https://github.com/Equinoxis/sstv-decoder",
    "license": "MIT（上游 README 声明）",
    "notices": [
      "vendor/hunt/sstv/README.md"
    ],
    "role": ""
  },
  {
    "name": "ffmpeg.wasm / FFmpeg 核心",
    "url": "https://github.com/ffmpegwasm/ffmpeg.wasm",
    "license": "封装：MIT；当前核心：GPL-2.0-or-later",
    "notices": [
      "vendor/hunt/ffmpeg/LICENSE",
      "vendor/hunt/ffmpeg-core/LICENSE.GPLv2.txt"
    ],
    "role": "固定 ffmpeg.wasm 0.12.15 / FFmpeg core 0.12.10；本地媒体编解码、滤镜、轨道映射和原生命令执行，实际编译范围由核心自报。"
  },
  {
    "name": "zxing-wasm / ZXing-C++",
    "url": "https://github.com/Sec-ant/zxing-wasm",
    "license": "封装：MIT；ZXing-C++：Apache-2.0",
    "notices": [
      "vendor/hunt/zxing/LICENSE",
      "vendor/hunt/zxing/ZXing-C++-LICENSE.txt"
    ],
    "role": "本地 WASM 多制式二维码与条形码识别接口及其 ZXing-C++ 核心。"
  },
  {"name":"cnchar","url":"https://github.com/theajack/cnchar","license":"MIT","notices":["vendor/round1/cnchar/LICENSE","vendor/hanzi-full/CNCHAR-LICENSE","vendor/hanzi-full/CNCHAR-DATA-LICENSE","vendor/hanzi-full/ARPHICPL.txt","vendor/hanzi-full/NOTICE.txt"],"role":"cnchar-all 3.2.6 的汉字属性、笔顺演示、释义、组词与编码；完整固定资源本地保留，玩家界面不调用姓名、随机或语音方法。"},
  {
    "name": "pinyin-pro",
    "url": "https://github.com/zh-lx/pinyin-pro",
    "license": "MIT",
    "notices": [
      "vendor/round1/pinyin-pro/LICENSE"
    ],
    "role": ""
  },
  {
    "name": "OpenCC-JS",
    "url": "https://github.com/nk2028/opencc-js",
    "license": "代码：MIT；字典数据：Apache-2.0",
    "notices": [
      "vendor/round1/opencc-js/LICENSE",
      "vendor/round1/opencc-js/THIRD_PARTY_LICENSES.md",
      "vendor/round1/opencc-js/LICENSES/Apache-2.0.txt"
    ],
    "role": "本地繁简转换及资料检索中的繁简字形归一化；检索不改写原始记录、标准标识或导出内容。"
  },
  {
    "name": "tone",
    "url": "https://github.com/Tonejs/Tone.js",
    "license": "MIT",
    "notices": [
      "vendor/round1/tone/LICENSE.md"
    ],
    "role": ""
  },
  {
    "name": "cubejs",
    "url": "https://github.com/ldez/cubejs",
    "license": "MIT",
    "notices": [
      "vendor/round1/cubejs/LICENSE"
    ],
    "role": ""
  },
  {
    "name": "cubing.js",
    "url": "https://github.com/cubing/cubing.js",
    "license": "MPL-2.0（本站选择；上游另提供 GPL-3.0-or-later）",
    "notices": [
      "vendor/round1/cubing/LICENSE-GPL.md",
      "vendor/round1/cubing/LICENSE-MPL.md"
    ],
    "role": ""
  },
  {
    "name": "three",
    "url": "https://github.com/mrdoob/three.js",
    "license": "MIT",
    "notices": [
      "vendor/round1/three/LICENSE",
      "vendor/round4/LICENSES.txt"
    ],
    "role": "cubing.js 的三维渲染依赖"
  },
  {
    "name": "random-uint-below",
    "url": "https://github.com/lgarron/random-uint-below.js",
    "license": "Unlicense",
    "notices": [
      "vendor/round1/random-uint-below/LICENSE.md"
    ],
    "role": "cubing.js 的随机数依赖"
  },
  {
    "name": "substitution",
    "url": "https://github.com/cateyelow/substitution-cipher-solver",
    "license": "MIT",
    "notices": [
      "vendor/round1/substitution/LICENSE"
    ],
    "role": ""
  },
  {
    "name": "qrazybox",
    "url": "https://github.com/Merricx/qrazybox",
    "license": "MIT",
    "notices": [
      "vendor/round1/qrazybox/LICENSE", "vendor/completion/qrazybox/LICENSE"
    ],
    "role": "二维码矩阵的版本结构、格式信息修复与网格操作。"
  },
  {
    "name": "chinese-telegraph-code",
    "url": "https://github.com/kirklin/chinese-telegraph-code",
    "license": "代码：MIT；数据：Unicode 数据许可",
    "notices": [
      "vendor/round1/telegraph/LICENSE",
      "vendor/round1/telegraph/DATA_LICENSE.md"
    ],
    "role": ""
  },
  {"name":"Make Me a Hanzi","url":"https://github.com/skishore/makemeahanzi","license":"dictionary.txt LGPL-3.0-or-later；graphics.txt Arphic Public License","notices":["vendor/round1/makemeahanzi/COPYING","vendor/round1/makemeahanzi/LGPL","vendor/hanzi-full/ARPHICPL.txt","vendor/hanzi-full/NOTICE.txt"],"role":"固定版本完整字典及笔顺矢量图形、中线与原始属性；图形来自文鼎字型衍生资料。"},
  {
    "name": "Pitchy",
    "url": "https://github.com/ianprime0509/pitchy",
    "license": "MIT",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {"name":"Tonal","url":"https://github.com/tonaljs/tonal","license":"MIT","notices":["vendor/round2/LICENSES.txt"],"role":"固定 6.5.0 本地乐理核心；音名、频率、和弦、音阶、音程与有符号半音移调。专业声部模块仅随原始固定包保留。"},
  {
  "name": "Tonejs/Midi",
  "url": "https://github.com/Tonejs/Midi",
  "license": "MIT",
  "notices": [
    "vendor/round2/LICENSES.txt"
  ],
  "role": "本地解析和生成标准MIDI文件，支持旋律与五线谱事件的真实音轨导出。"
},
  {
    "name": "Pixelmatch",
    "url": "https://github.com/mapbox/pixelmatch",
    "license": "ISC",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "Chroma.js",
    "url": "https://github.com/gka/chroma.js",
    "license": "BSD-3-Clause AND Apache-2.0",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "fflate",
    "url": "https://github.com/101arrowz/fflate",
    "license": "MIT",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": "ZIP / GZIP 本地压缩与解压，以及动画全部原始帧、合成帧与参数的 ZIP 打包。"
  },
  {
    "name": "Proj4js",
    "url": "https://github.com/proj4js/proj4js",
    "license": "MIT",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "MGRS",
    "url": "https://github.com/proj4js/mgrs",
    "license": "MIT",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "node-geohash",
    "url": "https://github.com/sunng87/node-geohash",
    "license": "MIT",
    "notices": [
      "vendor/round2/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "cspuz_core",
    "url": "https://github.com/semiexp/cspuz_core",
    "license": "主项目：MIT；Glucose / MiniSat 与运行库许可见原文",
    "notices": [
      "vendor/round3/LICENSE",
      "vendor/round3/LICENSES.txt"
    ],
    "role": ""
  },
  {
    "name": "Esolang Park",
    "url": "https://github.com/nilaymaj/esolang-park",
    "license": "MIT",
    "notices": [
      "vendor/coderunner/LICENSES.txt",
      "vendor/knowledge/esolang-park/LICENSE.txt"
    ],
    "role": "Brainfuck、Ook!、Befunge-93 与 Deadfish 的真实运行和调试引擎。"
  },
  {
    "name": "Whitespace-JS",
    "url": "https://github.com/susisu/Whitespace-JS",
    "license": "MIT",
    "notices": [
      "vendor/coderunner/LICENSES.txt"
    ],
    "role": "Whitespace 真实执行引擎；保留 loquat 与 co 的独立许可。"
  },
  {
    "name": "malbolge-vm",
    "url": "https://github.com/zb3/malbolge-vm",
    "license": "MIT",
    "notices": [
      "vendor/coderunner/LICENSES.txt"
    ],
    "role": "Malbolge 虚拟机与调试状态。"
  },
  {
    "name": "Pyodide",
    "url": "https://github.com/pyodide/pyodide",
    "license": "Pyodide：MPL-2.0；CPython：PSF 及历史许可",
    "notices": [
      "vendor/coderunner/python/LICENSE.txt",
      "vendor/coderunner/python/CPYTHON-LICENSE.txt",
      "vendor/coderunner/LICENSES.txt"
    ],
    "role": "本地 Python 运行与标准库，保留 CPython 及历史许可。"
  },
  {
  "name": "quickjs-emscripten",
  "url": "https://github.com/justjake/quickjs-emscripten",
  "license": "MIT（包含底层 QuickJS 许可）",
  "notices": [
    "vendor/coderunner/LICENSES.txt"
  ],
  "role": "隔离执行代码运行器中的JavaScript与查词自定义谓词；不暴露宿主DOM或网络。"
},
  {
    "name": "Wasmoon",
    "url": "https://github.com/ceifa/wasmoon",
    "license": "MIT（包含 Lua 许可）",
    "notices": [
      "vendor/coderunner/LICENSES.txt",
      "vendor/coderunner/LUA-LICENSE.txt"
    ],
    "role": "本地 Lua 虚拟机与运行库，含 Lua 核心。"
  },
  {
    "name": "sql.js",
    "url": "https://github.com/sql-js/sql.js",
    "license": "sql.js：MIT；SQLite：公有领域",
    "notices": [
      "vendor/coderunner/LICENSES.txt"
    ],
    "role": "本地 SQLite 执行与数据库导入导出，含 SQLite 公有领域声明。"
  },
  {
    "name": "Glucose / MiniSat",
    "url": "https://github.com/semiexp/glucose",
    "license": "Glucose/Syrup：自定义许可（含竞赛限制）；MiniSat：MIT",
    "notices": [
      "vendor/round3/LICENSE"
    ],
    "role": "纸笔谜题的底层 SAT 求解器"
  },
  {
    "name": "ZXing-C++",
    "url": "https://github.com/zxing-cpp/zxing-cpp",
    "license": "Apache-2.0",
    "notices": [
      "vendor/hunt/zxing/ZXing-C++-LICENSE.txt"
    ],
    "role": "zxing-wasm 使用的条码识别底层"
  },
  {
    "name": "chess.js",
    "url": "https://github.com/jhlywa/chess.js",
    "license": "BSD-2-Clause",
    "notices": [
      "vendor/round4/LICENSES.txt"
    ],
    "role": "第四轮空间与模拟工具及其运行依赖"
  },
  {
    "name": "konva",
    "url": "https://github.com/konvajs/konva",
    "license": "MIT",
    "notices": [
      "vendor/round4/LICENSES.txt"
    ],
    "role": "第四轮空间与模拟工具及其运行依赖"
  },
  {
    "name": "copy/life",
    "url": "https://github.com/copy/life",
    "license": "BSD-2-Clause",
    "notices": [
      "vendor/round4/LICENSES.txt"
    ],
    "role": "第四轮空间与模拟工具及其运行依赖"
  },
{"name":"Fuse.js","url":"https://github.com/krisk/Fuse","license":"Apache-2.0","notices":["vendor/fuse/LICENSE.txt"],"role":"全站导航、工具目录和搜索框的本地模糊匹配；仅索引公开工具名称与别名。"}
];
export const projectKey=url=>new URL(url).href.replace(/\/$/, "").toLowerCase();
export const projectLicense=url=>PROJECT_LICENSES.find(p=>projectKey(p.url)===projectKey(url));
