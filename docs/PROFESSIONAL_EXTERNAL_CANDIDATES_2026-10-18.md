# 专业外站候选表

整理日期：2026-10-18。候选研究与后续收录记录。AperiSolve 与其他媒体分析网站合并到同一介绍入口；维护者已确认下方 14 项，其余仍为候选。

本轮排除普通文字处理、字词查询、宽泛百科、通用识图、重复的 Base/进制转换网站。链接指向网站本身或其官方功能说明，已核对页面介绍；没有上传玩家文件，也没有逐站执行收费、注册或文件处理流程。优先级是结合迷雾工具箱当前功能作出的判断，不是网站官方评价。

## 编解码与密码分析

| 编号 | 网站与官方依据 | 详细介绍 | 当前关系与建议 |
|---|---|---|---|
| P01 | [dCode](https://www.dcode.fr/tools-list) | 按替换、换位、古典密码等方向组织的大型专用工具库；除了常规编码，还提供密文类型判断、频率分析及不同密码的求解页面。各求解器有独立参数与解释，可以针对候选密码进一步尝试。 | 优先。本站已有许多基础算法，收录重点应放在专门求解器与分析入口，不能宣传为任意密文都可破解。网页服务。 |
| P02 | [Boxentriq](https://www.boxentriq.com/analysis) | 汇集密文识别、字母与 n-gram 频率、重复模式等分析，并连接具体密码工具。适合把“识别候选类型—查看统计—选择求解器”放在同一网站完成。 | 优先。与本站部分功能重合，但可提供不同分析实现与独立交叉核对。网页服务。 |
| P03 | [CrypTool-Online](https://www.cryptool.org/en/cto/) | CrypTool 项目的浏览器实验工具集合，提供密码运算、分析与可视化演示。它的价值包括观察算法内部步骤、实验不同参数，以及学习密码系统的构造；桌面 CrypTool 2 是另外的产品。 | 可选。适合介绍密码实验平台，不要把桌面版功能全部写成在线版支持。 |
| P04 | [FactorDB](https://factordb.com/) | 整数分解数据库，可按整数查找已有因子及分解状态。它与现场计算器不同，核心价值是复用已收集的分解信息，尤其是大整数。 | **已有 E02 外链**，不重复新增。此次研究工具未能读取首页，保留现有记录，暂不提出能力升级结论。 |

## 专题资料与专业检索

| 编号 | 网站与官方依据 | 详细介绍 | 当前关系与建议 |
|---|---|---|---|
| P05 | [RISM Online](https://rism.info/) | 国际音乐文献目录，整理手稿、印刷乐谱、音乐理论文献及其馆藏机构。记录连接作品、人物、机构与谱例，音乐开头片段（incipit）也可作为检索线索，而不仅是按作品名称查资料。 | 优先。补充当前古典音乐资料的原始文献、馆藏和谱例检索。网页；[谱例检索说明](https://github.com/rism-digital/rism.info/blob/staging/community/integrating-rism-searches-on-website.en.md)。 |
| P06 | [IMSLP](https://imslp.org/?full_site=1) | 以作品为单位组织乐谱、分谱与录音，便于对照实际谱面、不同编制及版本。对于只有若干小节或需要核对乐谱细节的情况，实际谱面比一条作品简介更有价值。 | 优先。补充乐谱原文；并非所有文件具有相同版权或下载条件，不做全站文件镜像。 |
| P07 | [MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_Database) | 结构化音乐数据库，区分作品、录音、发行版本、艺人和厂牌，并记录这些对象之间的关系。可以区分同名作品、不同演奏录音及不同地区发行，不只是“歌名—歌手”列表。 | 优先。补充录音与发行关系资料；与本站古典作品目录、听歌识曲是不同用途。 |
| P08 | [David Rumsey Historical Map Collection](https://www.davidrumsey.com/view) | 历史地图数字馆藏，提供高清地图查看及地理配准入口；地图可以结合地理位置考察，而不仅作为静态缩略图浏览。适合研究旧地名、历史边界、城市布局与地图版本。 | 优先。补充历史地图影像和位置对照，当前地名查询不能替代。 |
| P09 | [Overpass Turbo](https://overpass-turbo.eu/) | OpenStreetMap 数据筛选与地图展示工具，可运行 Overpass 查询，按标签和空间范围找出设施、道路、建筑等要素，并在地图上检查结果。 | 优先。补充“按多个地理特征筛选对象”的能力；与普通地图导航不同。 |
| P10 | [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) | NASA/JPL 的太阳系天体历表服务，可按目标、观测位置与时间范围生成天体位置和运动相关表格。提供网页、命令行及 API 等访问形式。 | 可选。补充专业太阳系历表，和本站深空天体目录不是同一资料范围。 |
| P11 | [N2YO](https://www.n2yo.com/) | 卫星跟踪与过境预测网站，可查看对象轨迹和观测预测，围绕人造卫星而非普通恒星星表组织资料。 | 可选。补充卫星方向；不要把动态轨道数据当作任意历史时刻的准确证明。 |
| P12 | [NIST Chemistry WebBook](https://webbook.nist.gov/chemistry/guide/) | NIST 化学物性与光谱资料网站，按化学物种汇集热化学、物理性质及可用的红外、质谱等数据。资料条目有测量来源和参考文献。 | 优先。补充实验光谱和物性文献，区别于 PubChem 的一般物质身份与结构检索。 |
| P13 | [Mindat](https://www.mindat.org/searchmenu.php) | 矿物、岩石、陨石及产地资料库，提供矿物名称、化学组成、照片和地点等检索方向，可以沿着“矿物—成分—产地”之间的联系浏览。 | 可选。补充矿物鉴别资料与产地图片；和 COD 晶体结构记录不同。 |
| P14 | [NCBI BLAST](https://blast.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Web) | 将核酸或蛋白质序列与数据库进行局部相似性比对，返回匹配片段与统计结果。其核心是数据库比对，不是简单的互补链、转录或氨基酸编码转换。 | 可选。补充生物序列来源分析；短片段或人工编码串可能没有可解释匹配。 |
| P15 | [Signal Identification Wiki](https://www.sigidwiki.com/wiki/Signal_Identification_Guide) | 无线电信号参考库，结合声音样本、瀑布图、频率及调制方式整理信号类型，并提供离线配套工具 Artemis 的入口。 | 优先。补充频谱形状与真实信号样本的对照，本站通用频谱显示不包含这类完整参考库。 |

## 图片、音频与视频

| 编号 | 网站与官方依据 | 详细介绍 | 当前关系与建议 |
|---|---|---|---|
| P16 | [Forensically](https://29a.ch/photo-forensics/) | 浏览器图片取证工具，包含重复区域检测、误差级别分析、噪声分析、亮度梯度、PCA、JPEG 结构与量化表、缩略图和元数据等视图。官方明确说明图片留在本机。 | **优先**。补充图片编辑痕迹分析，与 AperiSolve 的隐写提取侧重点不同。分析图不能单独判定真假。 |
| P17 | [MediaInfoOnline](https://mediaarea.net/MediaInfoOnline) | MediaInfo 的浏览器入口，读取音视频文件的技术元数据并生成报告，适合核对容器、流和编码等信息。官方说明基础文件分析在本机完成；另有显式分享报告的 MediaBin。 | 优先。补充更完整的媒体技术报告；不把“本机分析”与“主动分享报告”混为一谈。 |
| P18 | [Morse Code World 自适应音频解码](https://morsecode.world/international/decoder/audio-decoder-adaptive.html) | 支持从麦克风或音频文件分析国际摩斯码，提供速度、频率、阈值与图形显示等控制，也连接专家版与时序资料。 | 可选。本站已有 ggmorse，价值是换一个解码实现交叉尝试，不是新增“摩斯识别”品类。网页；官方称此解码器为实验工具。 |
| P19 | [Soundslice](https://www.soundslice.com/transcribe/) | 将音视频播放与乐谱编辑、标注结合，支持精确循环、变速不变调和定位片段，方便逐段听写、核对音高与节奏。 | 可选。在线服务，有账号和付费差异；官方说明免费账户可听写 YouTube，直接上传音视频属于付费计划。 |
| P20 | [Online Sequencer](https://onlinesequencer.net/?mobile=no) | 网页音乐序列编辑器，可导入 MIDI，在时间与音高网格上查看和编辑音符，再播放验证。对需要观察多轨音符图形、节奏或修改 MIDI 的场景比单纯播放器更直观。 | 可选。补充序列编辑；本站已有 MIDI 与乐理功能，避免重复包装。 |
| P21 | [InVID-WeVerify](https://weverify.eu/verification-plugin/) | 面向图片和视频核验的工具集合，围绕视频关键帧、图片取证、元数据和跨工具核验组织流程。项目持续扩展工具和辅助工作流。 | 优先，但属于**浏览器扩展**入口；不能写成打开普通网页就能使用所有功能。部分服务有单独条件。 |
| P22 | [Sonic Visualiser](https://www.sonicvisualiser.org/features.html) | 音频分析桌面软件，可叠加波形、不同频谱和标注层，并通过特征提取插件分析节拍、音高等内容。适合较复杂的音乐测量与多层对照。 | 可选附录，**需要安装**。作为进阶软件介绍，不混入“免安装在线分析”的承诺。 |

## 其他专业工具

| 编号 | 网站与官方依据 | 详细介绍 | 当前关系与建议 |
|---|---|---|---|
| P23 | [puzz.link](https://puzz.link/) | 多题型纸笔谜题编辑与游玩平台，提供题型入口、可分享题目链接和公开题目数据库；可以在对应题型界面录入、操作及检查解答。 | 优先。补充题型覆盖和分享生态；不应把解答检查描述为所有题型都能自动求解。 |
| P24 | [Falstad Circuit Simulator](https://www.falstad.com/circuit/) | 可交互的电子电路模拟器，可编辑电路、切换开关、观察电压和电流变化，并查看示例电路。适合用实际模拟检验电路和逻辑关系。 | 优先。补充电路动态行为，和本站电阻色环读数属于不同层次的能力。网页 JavaScript 版本。 |
| P25 | [Dogbolt / Decompiler Explorer](https://dogbolt.org/) | 将二进制文件交给多种反编译器，比较 Ghidra、Hex-Rays、Binary Ninja 等不同引擎给出的高层代码结果。侧重解释程序结构，不是简单显示机器指令。 | 可选。补充程序逆向；当前页面要求文件小于 2 MB，并明确说明上传文件会保留。只能由用户主动到原站提交。 |
| P26 | [Compiler Explorer](https://github.com/compiler-explorer/compiler-explorer) · [网页入口](https://godbolt.org/) | 在线运行编译器并观察生成的汇编，可选择语言、编译器及参数，对比源代码与编译结果。适合分析优化行为、指令和编译器差异。 | 可选。面向较技术性的谜题；本站“运行代码”与“比较编译结果”不是同一用途。 |

## 已有外链，不重复当作新增

| 现有编号 | 网站 | 本轮处理建议 |
|---|---|---|
| E29 | [AperiSolve](https://www.aperisolve.com/wiki/getting-started) | 本轮已在图像编辑与分析登记独立介绍页，原外站指南条目保留。打开介绍不执行扫描，也不上传本站图片。 |
| E18 | [Astrometry.net / Nova](https://nova.astrometry.net/) | 已有外链。若以后提高入口优先级，可放在图像分析与天文交叉位置。 |
| E28 | [TinEye](https://tineye.com/) | 已有外链。保留专业图片溯源方向，不新增宽泛通用识图入口。 |
| E31 | [Folk Tune Finder](https://new.folktunefinder.com/) | 已有外链，可与其他音乐检索站共同介绍。 |
| E32 | [Musipedia](https://www.musipedia.org/quicksearch.html) | 已有旋律检索外链，不作为本轮新发现。 |
| E33 | [Shazam](https://www.shazam.com/) | 已有识曲外链，不重复收录。 |
| E03 | [WolframAlpha](https://www.wolframalpha.com/examples/) | 已有外链。不借此恢复用户已删除的基础算术、方程和低相关独立工具。 |
| E39 | [RFC Editor](https://www.rfc-editor.org/search) | 已有协议原文入口，本轮不重复推荐同类目录。 |

优先查看：**P01、P02、P05、P08、P09、P12、P15、P16、P17、P23、P24**。P21 可作为扩展插件介绍；P22 是需要安装的软件。其余按希望覆盖的谜题方向选择即可。

公开访问网页、网站开源、允许介绍链接、允许复制数据库、允许服务端查询是不同事项。这份表只建议介绍入口，没有把第三方服务视为已经接入的本站能力。


## 已确认收录（2026-10-18）

本轮按维护者确认的推荐清单加 P26，共新增 14 个网站介绍。网站内容仍由原站提供，本轮没有引入其运行代码、数据库、后端代理或自动提交功能。原有普通文字类外链不扩充。

| 侧栏归属 | 页面 | 新增网站 |
|---|---|---|
| 编解码与加解密 | 密码分析外站（`#external-codec`） | P01 dCode、P02 Boxentriq |
| 资料查询 | 外站资料指南（`#external-guide`） | P05 RISM、P06 IMSLP、P07 MusicBrainz、P08 David Rumsey、P09 Overpass Turbo、P12 NIST Chemistry WebBook、P15 SIGIDWiki |
| 图片音视频与文件处理 | 图像与媒体分析外站（`#external-media`） | P16 Forensically、P17 MediaInfo Online；并归入原 E29 AperiSolve |
| 其他工具 | 专业工具外站（`#external-other`） | P23 puzz.link、P24 Falstad、P26 Compiler Explorer |

每个网站保留独立完整介绍和原站链接。页面可按方向、网站名或编号筛选，导航搜索从同一个静态目录派生网站名称及别名。外站介绍不增加本站算法数量，也不作为实际集成依赖列入开源许可目录。原 28 项外链内容保留，其中 E29 AperiSolve 移入媒体外站页；资料指南新增 7 项后为 34 项，媒体外站页为 3 项，四页共 42 项。

实现所有者为 `public/external-guide/catalog.js` 与 `page.js`，导航和挂载共用 `GUIDE_PAGES`。单元及浏览器验证覆盖精确收录范围、分类归属、搜索、筛选、键盘导航、唯一控件 ID、完整正文和安全外链；普通浏览及搜索不访问外站。
