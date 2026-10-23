# 迷雾工具箱原始缺口清单复评

本次依据用户指定的《迷雾工具箱_逐项对照.xlsx》和《迷雾工具箱_查漏补缺审计.md》，取消“只能纯前端”的筛选条件，保留用户已经明确的产品范围。编号沿用原文件 K01–K45 与 O01–O37；B01 是上一轮建议中的 AperiSolve 完整扫描，单独实施，不占用旧表编号。

Excel 的 9 张工作表均已读取：原表 345 条、工具箱子项 3,394 条、45 个缺口方案、37 个开源候选，以及外站说明、本站登记、来源访问、未展开链接、阅读指南。此次是按原有逐项审计记录结合当前源码重新评估，不宣称重新在线访问了历史 3,578 条访问记录。已重新核查推荐项目的官方资料；原审计中的死链和未展开链接仍不能算已完整覆盖。

“可完整接入”指能自托管真实引擎和所选完整数据版本，并提供完整输入、结果和必要操作；不等于复制商业网站的全部数据库、账号服务或所有功能。增加后端不会消除数据授权和维护成本。已有同用途完整服务不再新建精选小库，已退役的方程、基础算术独立菜单、OCR 等不恢复。

## 建议优先选择

| 原编号 | 内容与项目 | 相对目前工具箱的新增能力 | 判断及投入 |
| --- | --- | --- | --- |
| K03 / O05 | [Nutrimatic](https://github.com/PuzzleTechHub/nutrimatic) 英文词组检索 | 从已有单词查找扩展到多词短语、乱序、交集和频次检索 | 可自建完整选定语料版本；高投入。官方构建示例需约 20 GB Wikipedia 压缩包及约 100 GB 中间索引，不宜直接在小服务器上现场构建。QAT 不是同一个语法引擎。 |
| K01 / O03 | [CMUdict](https://github.com/cmusphinx/cmudict) 发音词典 | 音素、重音、音节、同音词和押韵反查 | 可导入完整发布版；中投入。美式英语发音库，不冒充 RhymeZone 的全部语境与排序。 |
| K02 / O04 | [Open English WordNet](https://github.com/globalwordnet/english-wordnet) | 按词义查询同义、反义、上下位关系 | 可导入完整发布版；中投入。保留每个词义与关系，不把不同词义混成一个同义词列表。 |
| K06 / O09 | [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html) 日语词典 | 日语字形、假名读音、词性、词义及受约束查词 | 可导入完整选定版并建立索引；中投入。遵循 EDRDG 的许可与更新要求，不能承诺每条都有中文释义。 |
| K07、K44 / O10、O11 | [Unihan](https://www.unicode.org/reports/tr38/) 与 [Rime Cantonese](https://github.com/rime/rime-cantonese) | 在已有汉字工具上补粤音、变体及实际存在的编码属性 | 可接选定完整数据文件；中投入。Rime 各文件来源许可分别核定；不把郑码授权问题混进去。 |
| K20、K21 / O18、O19、O20 | [cspuz](https://github.com/semiexp/cspuz)、[grilops](https://github.com/obijywk/grilops)、[Z3](https://github.com/Z3Prover/z3) | 更多网格、路径、区域、拼块等真实题型模型 | 可在后端运行原生模型；高投入。现有四类纸笔工具及中文约束、Drop Quote 已有，新增应是未覆盖题型及其完整可视化录入和求解。不能把“能运行 Python”冒充已接所有题型。 |
| K29 / O21 | [QRazyBox](https://github.com/Merricx/qrazybox) 高级恢复 | 码字、纠错块分析及更细的损坏恢复操作 | 适合继续补齐；中至高投入。当前已有矩阵编辑、结构恢复、格式枚举和 jsQR 纠错；缺口是高级分析与恢复流程，不能重复算识别和生成。 |
| K40 / O35 | [Astrometry.net](https://github.com/dstndstn/astrometry.net) | 从星空照片解算天区、朝向、比例及 WCS | 可自托管真实求解器与选定完整视场索引；高投入。它与现有 OpenNGC 查询／天文计算不同；不能仅由星空照片唯一确定拍摄地点。 |
| K14 / O02 | [GC Wizard](https://codeberg.org/GCWizard/GCWizard) 图形密码 | 补未覆盖符号集的点选识别、字符映射及输出 | 可按明确符号集完整接入；中至高投入。原项目为 Flutter/Dart，不是直接导入 JS 插件；素材和字体单独核许可。旧 GitHub 仓库已迁往 Codeberg。 |
| K27 / O24、O25 | [OrigamiSimulator](https://github.com/amandaghassaei/OrigamiSimulator) 与 [FOLD](https://github.com/edemaine/fold) | 折痕导入、真实折叠模拟、折叠状态保存 | 可以完整接入所选核心流程；中至高投入。现有三维查看器不包含折纸求解；FOLD 是格式及几何工具，不能单独算一个模拟器。 |
| K28 / O29、O28 | [miniPaint](https://github.com/viliusle/miniPaint)、[SVG-Edit](https://github.com/SVG-Edit/svgedit) | 分层位图编辑、蒙版／画笔，以及矢量路径编辑 | 均可本地集成真实编辑器；高投入。建议先 miniPaint；原图、编辑图和笔记附件分离，不能覆盖用于隐写分析的原始字节。 |
| K30 / O26、O27 | [simple-keyboard](https://github.com/hodgef/simple-keyboard) 与布局包 | 多语言屏幕键盘，辅助录入陌生字符线索 | 可接入完整选定布局；低至中投入。布局包不等于日文转换或中文候选输入法。 |
| K04 | 残缺摩斯／二进制候选 | 对未知位生成真实候选，再交给查词或词组索引筛选 | 可直接开发；低至中投入。与现有完整解码不同，需控制组合爆炸，保留全部候选或明确分页／超限。 |
| K13、K15、K16、K17 | T9 词库、色码、信号输出与额外 Base 编码 | 补明确的剩余规则：九键预测词、色环／电缆、旗语／盲文输出、Base91／100／65536 等 | 可逐项做完整规则；低至中投入。当前九键坐标、QWERTY、NATO 和已有 Base 操作不重做；不把数学长尾借此恢复成独立菜单。 |

## 可做但需要额外条件

| 原编号 | 候选 | 条件及结论 |
| --- | --- | --- |
| K05 / O06 | [中文 Nutrimatic](https://github.com/IcedDog/nutrimatic-zh) | 原 Rust 搜索服务可以运行；完整中文语料、词频和属性索引必须准备并核授权。现有 ChinesePuzzleTool 并不能自动提供同等规模的完整语料。先确认数据再排期。 |
| K35 / O30 | [Yjs 与 WebSocket provider](https://docs.yjs.dev/ecosystem/connection-provider/y-websocket) | 可实现共享房间、实时文本同步和持久化，但 Vditor、Mind Elixir、Excalidraw 各有不同数据模型。需分别实现编辑器适配、权限、附件同步与断线恢复；属于一个独立大功能，不是装 provider 就完成三种编辑器协作。 |
| K32 / O32、O33 | [audfprint](https://github.com/dpwe/audfprint)／[Dejavu](https://github.com/worldveil/dejavu) | 可完整自建“自有录音库的片段匹配”；前提是有合法完整的目标曲库。项目不带全球音乐数据库，也不等于哼唱识曲。 |
| K32 / O34 | [Chromaprint](https://github.com/acoustid/chromaprint) + [AcoustID](https://acoustid.org/webservice) | 本地指纹生成可完整接入，曲目匹配依赖外部 API、应用密钥、配额及使用条件。应明确是联网查询，不能称全库自托管。 |
| K09 / O13 | [nbnhhsh](https://github.com/itorr/nbnhhsh) | 可评估官方社区接口；仓库前端代码不含可直接完整自建的全部社区词条。需核实稳定接口与使用条款，不以抓网页代替正式集成。 |
| K18 | FactorDB 已知因数查询 | 可评估官方查询接口，补已有 Alpertron 的“已知结果库”；它不是另一个方程工具。接口可用性与访问政策还需在实施时确认。 |
| K08 / O12 | [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) | 可按完整已授权诗集做自建全文／定字索引；已有搜韵查询，应先确认新增检索价值，不能另放少量精选冒充搜韵完整库，也不搬未授权现代译注。 |
| K23、K24、K34、K38、K39 | 历史旗帜、交通路网、化学反应、专题百科、知识计算 | 后端解决查询与索引问题，不自动赋予完整数据库。原表未提供足以补齐这些用途的可再分发完整数据；按官方开放 API 或授权集另评，现有 PubChem／地名／宝可梦等继续复用。 |

## 45 个缺口包的完整处置

| 原编号 | 当前复评 |
| --- | --- |
| K01 | 可接 CMUdict 完整发音词典，见优先表。 |
| K02 | 可接 Open English WordNet 完整词义关系，见优先表。 |
| K03 | 取消原“仅外链”结论，可自建 Nutrimatic；语料与索引容量单列。 |
| K04 | 可开发残缺编码候选，保持与已有正常解码的区别。 |
| K05 | ChinesePuzzleTool／中文约束已有；中文 Nutrimatic 等待完整语料条件。 |
| K06 | 可接 JMdict；中文释义覆盖按实际数据说明。 |
| K07 | 优先 Unihan／粤音；郑码必须另核码表许可，不打包承诺。 |
| K08 | 已有搜韵在线查询；可加完整授权诗集自建索引，但不新建精选替代库。 |
| K09 | nbnhhsh 仅可按外部 API 条件接入，不能称全库已开放。 |
| K10 | Cryptic 教程和指示词需授权内容；商业填词答案库继续外链。 |
| K11 | 已接八类新增古典密码；冷门密码按原表具体算法再补，不再整体标缺。 |
| K12 | 可扩展真实密码搜索和评分，但现有词库约束替换已有；原表没有可直接替代 dCode 全部破解能力的开源完整套件。 |
| K13 | QWERTY／九键坐标与上游映射已有；T9 预测词、未覆盖布局可补。 |
| K14 | 可按授权符号集补齐，不将 GC Wizard 整站视作一个插件。 |
| K15 | 可补色环／电缆色码；组合序号只保留确有编码用途的部分。 |
| K16 | 现有盲文、NATO／海事资料不重做；可补特定语言变体和完整视觉输出。 |
| K17 | 现有 Base 家族已有 32／45／58／62／64／85／92；91／100／65536 等可按确切规范补。 |
| K18 | Alpertron 整数引擎已接；可评 FactorDB 联网查询，九个退役数学引擎不恢复。 |
| K19 | 方程、符号代数、矩阵等维持用户退役决定；不因后端开放而重新收录 mathjs／SymPy 页面。 |
| K20 | 可扩充统一纸笔工作区题型，优先既有 cspuz 模型，再考虑原生后端。 |
| K21 | Drop Quote／中文约束已有；剩余拼块和复杂路径／区域模型可用 grilops／Z3。 |
| K22 | 可加获授权的完整规则／题集；每日社区题库不能由求解引擎替代，不默认抓取。 |
| K23 | 当前国家旗帜已有；历史旗帜、国徽、国歌需单独完整授权来源，不能以样本补齐。 |
| K24 | 已有国家、机场、坐标和在线地名；真实路网／地铁需另定完整数据源与更新方式。 |
| K25 | 全网反向搜图／台词场景数据库没有由原表证明的自建完整库；继续外链或另购官方 API，宽泛站点不重新收录。 |
| K26 | OEIS 已有本站在线查询，旧 272 条精选库已删，不再新接同用途小库。 |
| K27 | 可接 OrigamiSimulator＋FOLD，是真实折叠能力。 |
| K28 | 可接 miniPaint／SVG-Edit 的完整编辑流程，先选一种避免挤占现有图像分析。 |
| K29 | 识别／生成／矩阵修复已合并；补 QRazyBox 深层恢复，不重做同一入口。 |
| K30 | 可补多语言虚拟键盘，词典输入法另算。 |
| K31 | ggmorse 已接文件／麦克风识别与生成；morse-pro 不因后端开放而重复接。 |
| K32 | 指纹与旋律区分；自有曲库可自建，公共识曲依赖 API，哼唱搜索无此直接保证。 |
| K33 | 五线谱／节奏与元素拼词已有，不重复接。 |
| K34 | 元素与 PubChem 已有；CAS 全库和完整人名反应资料需独立授权，COD 查询不等于 CAS。 |
| K35 | 笔记本／白板／脑图已有；可进一步做 Yjs 协作，不能新建第二套文档库。 |
| K36 | Handle 等可做，但属于娱乐内容，当前不优先。 |
| K37 | 正则可视化与调试可单独补；现有多语言运行器已有，后端任意代码沙盒是新安全边界，不默认扩大。 |
| K38 | 宝可梦已有在线摘要；其他专门百科按明确开放 API／完整授权资料逐项评，不批量镜像整站。 |
| K39 | WolframAlpha 等只能按官方 API 与配额集成，不能复制全部商业知识计算；维基百科等宽泛站点维持排除。 |
| K40 | 可自建 Astrometry.net；与深空目录查询不同，需实际星图索引。 |
| K41 | 仅评与解谜有关的具体编码／格式，算术、位逻辑留在完整 CyberChef，方程不恢复。 |
| K42 | 开发／办公／AI 长尾不因已有后端就全部接，原表没有可完整替代全部网站的一个项目。 |
| K43 | 用户已移除的 OCR、旧编辑器／URL 求解、图论／几何／数字电路等维持移除。 |
| K44 | 可补完整选定语言／字符标准；手语和手势素材需具体标准与授权，不用少量插图代替完整资料。 |
| K45 | 可以在现有图片、坐标和笔记工具补裁切、拼合、打印排版；不另起通用地图平台。 |

## 当前源码复核位置

- 工具实际入口与专题：`public/capabilities/registry.js`、`public/capabilities/topics.js`。
- 已接古典密码、ggmorse、Alpertron、中文约束和键盘：`public/expansion/catalog.js` 及相应 `*-catalog.js`。
- 当前四个原生纸笔模型：`public/round3/catalog.js`；中文约束及 Drop Quote：`public/expansion/hunt-constraints-catalog.js`。
- 二维码当前恢复能力：`public/round1/qr.js`、`public/round1/qr-worker.js`。
- 实际 505 项 CyberChef 操作：`public/vendor/cyberchef/catalogue.json`；配方专用边界：`public/capabilities/operation-policy.js`。
- 当前在线查询：`services/online-query/` 与 `public/online-query/`；项目来源：`public/project-source-contracts.js`。

## B01 当前状态：改为外站介绍

2026-10-17 按用户决定取消本站图片完整扫描，删除上传界面、后端扫描接口、Docker 安装与运行代码、独立扫描来源登记及运行依赖。图片隐写页保留 AperiSolve 的详细介绍、中文官网、Wiki 与项目链接。

本站原有浏览器内图层分析、颜色重映射和 StegOnline 隐写提取继续保留。现在工具箱没有功能要求 Docker；在线资料查询和邮件反馈仍由现有 Node 服务处理。

### 退役验收（2026-10-18）

本轮按 29 个变更路径选取的 38 项检查全部通过；续跑仅补完上轮未执行完的 6 项浏览器检查。覆盖真实本地 LSB 提取、桌面／手机与减少动态、外链键盘访问、无上传请求、来源页脚、专题切换及邮件／在线查询回归。生产构建通过，部署输出中已无扫描前端与专属许可目录；对应网页、目录和来源文件与当前源码一致。本地 16321 服务已恢复，未部署服务器。
