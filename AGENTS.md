# 开源分支发行说明

本工作目录维护 codex/open-source，以 main 的已提交快照同步原创源码，不向 Gitee 推送。第三方包由独立发布附件与 dependencies.lock.json 固定，通过 npm run setup 自动安装；不提交真实环境配置、outputs、依赖运行包或部署仓库历史。保留 README 赞助、GPL 原创授权和第三方各自许可。提交说明使用中文，使用用户 GitHub 账号。

# Instructions for Codex

## 新对话交接索引

- 跨对话继续本项目时，先读 [2026-10-20 项目交接](docs/PROJECT_HANDOFF_2026-10-20.md)。其中记录长期决定、IO02／M01 本地开发结果、未提交改动及验证与研究资料位置。
- 该文档是有日期的快照；当前分支、差异、版本、服务和部署状态须重新核实，后续用户指令及本文件中的适用规则优先。

## Calculator and unit navigation (user-approved 2026-10-21)

- 单位换算随数值、物理量和单位选择实时更新；输入修订立即作废结果及笔记租约，部分小数／指数草稿与中文组合输入保持安静，离页／停止拒绝迟到结果。工具最近使用以 registry 的公开工作区为身份，实际成员与方向仍保留，不能按共用面板去合并无关工具。盲文字符键盘为默认入口，逐点输入为同状态的备选视图。资料常用字段与完整原始资料分层，原始数据、署名、许可及完整导出不删减。详见 [工作台核心交互修正](docs/WORKBENCH_CORE_UX_2026-10-21.md)。

- 本轮界面结构、状态取舍、参考和独立验证记录见 [计算器界面调整](docs/CALCULATOR_UI_2026-10-21.md)。
- 综合计算器与单位换算分开：计算器使用显示屏、集中按键和侧边历史／设置／完整结果面板；单位换算在其他工具下按学科分菜单，全部 452 项随包单位继续由同一内核运算。保留旧链接别名与来源。
- 编辑输入、参数和切换任务只同步清除旧结果，不显示‘输入已变化，请重新执行’之类过程提示；保留真实运行进度、停止反馈、错误、限额、固定汇率及主动联网去向说明。

## Player-oriented upstream scope (user-approved 2026-10-21)

- Qalculate 保留完整内核，优先普通／科学计算器与分类单位换算；相同用途的旧换算统一交给 Qalculate。玩家界面不提供完整定义目录、自定义 XML／单位／函数、本地数据和工作表导入导出；这些入口与监听逻辑实际移除，不以折叠或隐藏代替。计算器显示名称为“综合计算器”，Qalculate 仅保留为搜索别名与实现来源。暂不新增带单位数量的公式计算表单，也不接另一个开源网页版。内部复合单位 ID 不是输入语法，按固定 XML 生成可执行记号，不另抄换算倍率。
- 开源接入按玩家真实任务取舍，不能把全部原生方法／JSON 参数工作表当作面向玩家的完成界面。汉字提供属性／编码、字形、笔顺、释义及组词；乐理提供音名、和弦、音阶、音程和移调；序列提供互补、转写、翻译、位置与搜索。姓名／随机生成、语音识别、描红、专业配音、化学指纹／反应／库管理、引力模拟及命理工作表退出玩家界面。
- 魔方是多形状观察和线索复现工具，保留全部固定形状、三维／原生二维视图、前后步进、手动转动、起始公式和本机状态记录；不提供自动求解或竞速打乱。不可误删纸笔谜题规则求解、棋谱复盘、折纸、生命游戏或三维文件观察。
- 二维码码字编辑、图片嵌入及 FFmpeg 原生命令归进阶折叠区，常用识别／修复、提取、帧／音轨／格式处理使用明确中文表单。完整选定资料集、原始字段与许可始终保留，原始字段可折叠，不能改成精选样本。
- 当前实施与本轮验证见 `docs/PLAYER_WORKBENCH_2026-10-21.md`；2026-10-20 的补齐报告是历史快照，不能据此声称本轮仍挂载全部原生接口。

## Optional online reference queries (user-approved 2026-10-17)

- 用户授权在纯前端工具主体之外增加可选的服务端在线查询，首项为 OEIS。它与邮件服务分别拥有配置、取消、限流及请求生命周期，由根目录 `npm start` 一并管理；不能依赖 SMTP 就绪，也不能让本地工具依赖查询后端。
- 在线查询只在玩家明确提交后发送当次查询，不在进入页面、输入文字、切页或失败后自动外发；页面常驻联网／去向提示，使用说明、关于页和页脚同时准确说明。只传该查询所需字段，不附带文件、笔记、其他工具结果或浏览器凭据；本站不持久保存查询或结果。
- 每个服务适配器只允许固定官方接口或经核实允许读取的公开词条，不提供任意 URL 代理、抓取登录页面或绕过验证码。汉典仅读取 robots 允许的公开字词原文，明确非官方 API，不调用被禁止的动态搜索。上游拒绝、限流、变更和离线时明确失败，保留原站入口。各来源独立限速且串行子请求同样遵守；OEIS 的每 10 秒一次是本站保护限制，不能套到所有服务或冒称官方配额，52poke 保守遵守 500 秒访问间隔。
- OEIS 是完整在线服务的查询入口，不恢复退役的 `integerseq` 精选目录，也不宣称本地全库。保留当前页完整原始记录与字段、查询、实际来源和查询时间；笔记／图稿保存使用原结果租约，输入、选择、分页、取消和离页时立即失效。每次实际使用外部数据，关于页与真实任务页末均保留署名、许可及来源。

## Release announcement workflow (user-approved 2026-10-17)

- 用户说“写一下更新公告”时，默认同时完成三项：更新关于页的版本记录、提供适合发群的简短公告、提供可在论坛发布的 Markdown 公告。用户明确限定某个渠道时遵从其范围；仅起草公告，不自动向群聊或论坛发布。
- 版本号以用户指定为准，不虚构缺失版本、发布日期或上线结果。三份内容必须按实际已实现的变更整理，说明主要新增、改进及修复；群公告保留访问入口及遇到问题／好想法可在群里 @维护者的邀请。
- 关于页在 `public/site-pages.js` 的版本记录首项展示当前公告，保留历史版本及默认折叠的布局。当前版本号由纯元数据 `public/site-version.js` 统一提供，关于页与故障报告共用，禁止为报告另写版本号或让数据模型依赖页面 UI。

## Topic workspaces and recipe-only scope (user-approved 2026-10-16)

- 将同一明确用途／对象的碎片任务合并为专题工作区，例如信息提取、PGP、JSON、英文查词、视频处理、代码运行和纸笔解题。目录、搜索、侧栏和科普只计一个专题入口，专题表单允许选择其已登记的真实操作／原生变体；这替代旧版禁止任务内操作选择的规定。不要恢复全站分类／搜索选择器、聚合总览或第二套渲染器，也不能将不同用途只因同属一个组就全部塞在一起。
- `public/capabilities/topics.js` 只声明静态成员；`topic-model.js` 纯投影合并；`registry.js` 保持完整 `sourceOperationIds`、唯一 `byOperation` 所有权、真实 `actions`／原生 `variants`、别名和可见计数。专题不声明可逆性；真实配对只在 `operation-pairs.js` 的 `CHEF_OPERATION_PAIRS` 定义，由 registry 重新导出，不再在其他模块复制一份配对表。
- 本轮进一步合并为 Base 家族（`topic:base-family`）、数字与字节编解码（`topic:byte-numerals`）、字符编码与码点（`topic:character-codes`）、文字转义与还原（`topic:text-escapes`）及二维码与条形码工具（`topic:qr`）。`native:radix` 对整个整数做进制转换，与 Binary／Decimal／Hex 的逐字节表示不同，不能误作同一算法或切换时自动改写输入单位。可见专题数量不是底层算法数量，全部 505 个 CyberChef 来源操作仍须完整覆盖。
- 专题可包含跨实现的 `mixed` 成员：二维码识别保留 ZXing、多制式结果模型，矩阵修复保留 QRazyBox／jsQR、原矩阵与撤销记录，生成与另一种识别保留真实 CyberChef 操作。`variants` 精确选择成员的原 `open`／面板／控制器；原始 `op:` 别名和操作深链接必须解析到该实际成员，不回退专题默认项。不得只合并名称、复制一份输入节点或借混合专题统一重写不同引擎接口。
- 原控制器拥有输入、文件、各原始操作／变体的参数草稿、取消与结果。切换专题成员同步停止旧计算并作废旧结果，保留原输入／文件；只有真实逆向对按具名且语义兼容的参数规则转移参数，其余操作恢复自己的草稿或默认值。PGP 签名私钥与验签公钥不能因同名 Key 被自动互换；只有“作为输入”显式采纳结果。
- `public/capabilities/operation-policy.js` 新增 78 项低相关 CyberChef 操作仅保留在完整配方：基础算术、位逻辑／集合、低层网络协议与指纹、开发编写及部分生成／密钥封装等不独立出现在侧栏、目录、工具计数、推荐或科普中。原 10 个流程控制和 5 个 retained 边界继续保留；全部 505 个原始操作的来源归属、参数、配方 ID 与真实执行不删减。不要以减少菜单为由修改官方 vendor 字节。
- 科普采用一个专题一个入口，`public/knowledge/topics.js` 从真实成员文章做纯内容投影；每个成员的机制、输入单位、步骤、完整可复核实例、参数边界和逐节 `sourceIds` 均须保留，合并时消除来源 ID 冲突。不能用一段泛泛组概论替代成员内容；配方专用 78 项不再各建独立科普。专题成员切换仍显示当前真实实现的来源页脚，不把专题全部依赖误称当前操作都使用。

## Compact task shell, search and active scope (user-approved 2026-10-16)

- 任务页顶端不再生成分类面包屑、同组功能横排（peers）或原生方向按钮。共享页头保留任务标题、收藏、相关科普、使用说明、返回分组与全部功能；相关科普和使用说明属于同一个 `.heading-actions`。不能用 CSS 隐藏重复控件代替删除其生成与监听逻辑。
- 有双向操作时，只保留原表单／`ConversionLayout` 内的真实方向下拉框。删除壳层方向按钮不等于删除路由方向状态：显式方向深链接、搜索意图、各方向草稿、兼容参数、取消和结果失效仍完整。只有“作为输入”显式采纳结果字节，选方向本身不采纳输出。
- 顶端查找使用原位 `Input`／`SearchField` 和非模态结果浮层，不点击后再打开第二个搜索弹窗或复制搜索输入。保留 Ctrl／⌘+K、中文输入法、上下键、Enter、Escape、外部点击关闭和焦点行为。完整工具目录仍是自己的导航界面。
- `public/capabilities/search.js` 拥有统一公开元数据搜索，`registry.js` 的 `searchEntries` 为所有调用方委托该模型。使用固定本地 Fuse.js 7.5.0（Apache-2.0），严格名称／操作和方向匹配优先，无直接匹配时再使用模糊候选；只索引公开名称、别名和操作描述，不把输入、文件、结果、笔记或偏好交给索引，不调用搜索服务。运行包、源码、许可与摘要随站固定，维护导入器为 `scripts/import-fuse.mjs`；主构建仍离线且不需要 npm 安装依赖。
- CyberChef 完整处理链在侧栏、工具目录和计数中只有 `native:cyberchef` 一个入口。10 个流程控制是配方内部操作，保留原始操作 ID、真实执行和 505 项来源覆盖；原 `chain`／`retained` 及本轮新增配方专用项不进入可见工具计数或独立科普。流程控制机制、实例和文献归入完整处理链的一篇科普，不能重新膨胀为 11 个工具。
- Alpertron 当前只启用 `integer`：整数表达式、素性检验、因数分解、除数验证与批处理。高斯整数、丢番图方程、离散对数、二次同余、平方和、立方和、两平方与奇数幂、二次无理数连分数、多项式分解求根已退役，不能在任务、参数、Worker 接口、联动按钮或科普中恢复。官方十引擎字节、固定源码和许可作为完整历史来源归档保留，不据此宣称十项仍在运行。基础进制、单位、通用数值计算及常用因子验证继续保留。

## Integration provenance completion (user-approved 2026-10-16)

- 每次新增或调整实际复用的第三方代码、引擎、数据或素材，必须在同一轮同步更新 `public/project-licenses.js`、`public/project-sources.js`、固定来源记录和随包许可／notice，并保证关于页的开源项目与许可证目录及受影响任务页末的“所用项目与来源”同时完整。不能用已登记到关于页替代工具页脚，也不能用文献链接替代实现来源。
- 按真实任务及当前方向列出实际使用的项目、具体用途、项目链接、精确许可与本地许可／notice；代码、数据、核心和独立依赖有不同条款时分别说明。纯本站实现、浏览器 API、规则／标准引用及只提供外链的工具不冒称已集成依赖。
- 来源页脚由共享来源所有者生成，必须位于当前工作区所有正文、动态结果和帮助内容之后且可见。按需挂载、切换任务／方向、复用同一面板或重新进入均不得漏掉、重复或残留其他任务的项目。不得依赖隐藏旧页面的页脚或 CSS 掩盖错误来源。
- 混合专题由 app 在真实成员激活后发布 `arg:tasksourceschange`，仅含页面、能力／成员、操作及实现种类元数据，不携带输入或结果。`project-sources.js` 持有组装后的面板来源基线与当前成员选择，按真实实现收窄页脚，返回原生工作区或重新挂载时恢复正确基线；不能把已收窄的二维码／CyberChef 页脚误存为整个图片页的来源。
- 交付前对照本轮新增／调整任务清单逐项核查：真实依赖、关于登记、实际页末展示、许可证及 notice 路径一致。扩展任务在 `public/project-source-contracts.js` 显式声明依赖，原创任务也声明空数组；共享来源所有者据此组装，不再在 app 中维护另一套条件清单。来源单元及浏览器回归必须让“整个页脚缺失”也失败，覆盖首次进入、动态挂载和共享面板切换；未完成不能称为接入完成。更新公告只描述已实现内容，当前版本由 `public/site-pages.js` 的版本记录统一展示。

## Reference database scope (user-approved 2026-10-16)

- 资料查询不能以人工精选、少量样本或演示索引代替同用途的完整数据库。新增前先核查原始表、导入筛选条件、实际记录量与上游检索用途；完整选定标准／目录的有界快照可以保留，并准确标明版本和范围。无法提供同用途完整资料时，整理外站用途、检索方法与链接，不能加一个不完整查询页或把外链冒称本地集成。
- 已退役：272 条 OEIS 精选的 `integerseq`、14 份 COD 样本的 `crystals`、9,026 条筛选 HYG 恒星、56 条精选 RFC 和手工 x86 指令／寄存器资料。删除其运行数据、发现入口、任务、关联与科普覆盖；不能只隐藏界面或在生成时重新带回。原始来源与许可仅留存 `upstream/` 归档，不列作当前运行依赖。旧入口不恢复精简资料页。
- `#sky` 仅为“深空天体目录”，保留固定 OpenNGC 主表与补充表的全部 14,034 条记录。国家、机场、Unicode、地质等完整选定资料集及真实运算能力继续保留；不要因外部网站用途更广，就删除天文计算、Alpertron、x86／ARM 反汇编等实际引擎。
- 本机 CIF 是文件解析与三维观察能力，由现有 `#model` 上传入口承接，不恢复 `#crystals` 或内置样本目录。保留安全对称解析、限额、取消、失效处理与原始文献，不上传用户文件。

## Notebook workspace (user-approved 2026-10-16)

- 笔记、思维导图和线索白板属于同一个笔记本工作区，不是“其他工具”的独立功能。导航只提供笔记本主入口；工具分类、工具目录、能力统计与科普工具目录不登记白板／脑图。
- 脑图和线索白板不提供“用其他工具处理”输出按钮；保留导出图稿／图片、笔记保存及工具结果加入笔记图稿的入口。
- 统一使用 #notebook、#notebook/mindmap、#notebook/whiteboard，旧 #mindmap／#whiteboard 只归一到笔记本视图。共用笔记本标题、当前笔记列表、图稿索引和使用说明；真实编辑器节点嵌入 notebook.graphicsHost，不再挂独立 .panel 或能力外壳。工具结果仍可明确加入笔记或其脑图／白板。
- 笔记事务服务拥有选中笔记和存储，图稿控制器拥有场景及其生命周期；调用图稿、导航前须离开笔记事务队列，不能互相等待。切换笔记保留正确归属并保存修改，保留原附件、图稿 ID、预览、来源字节和备份格式；不增加第二套数据库。

## Unified conversion workspaces (user-approved 2026-10-15)

- Native conversions and CyberChef single-operation tasks share `ConversionLayout`: direction/parameters/actions above, input and result cards below. Use a direction select; remove the duplicate task heading and keep operation guidance in the shared heading's 使用说明.
- Remove the redundant 反向转换 / 反向处理结果 shortcuts. Explicit 作为输入 followed by a direction choice owns the same result-adoption workflow. Retain original bytes, executed format provenance, compatible parameter transfer, direction drafts, cancellation and stale-result guards; direction selection alone never adopts output. This supersedes older instructions requiring a separate reverse-result button.

## Result transfer UX (user-approved 2026-10-15)

- Label cross-tool result transfer “用其他工具处理”. Recommendations and compatible destinations use the main registry's category/group hierarchy, with explicit registered directions and search; do not restore an ungrouped giant tool dropdown.
- An adopted result must be visibly previewed in the destination's input area (text, image or hex), while computation uses the full unchanged original bytes. Preview bounds must never truncate actual input; clear previews and revoke URLs when their source changes.
- Remove standalone tools' “送到处理链” buttons and their unused controller dependencies, including analysis and code output shortcuts. This supersedes older instructions to preserve these shortcuts. The complete CyberChef workspace and its own recipe controls remain available from navigation.

## Task-only workspaces (user-approved 2026-10-14)

- The user retired aggregate tool pages and the requirement to preserve old tool links. All tool entry points select a registered task or explicit topic workspace; only home, category overviews, the complete directory and knowledge directory own browsing. Do not restore task-local category/search pickers or the extra CyberChef discovery directory. The 2026-10-16 topic contract permits selecting only that topic's registered real operations/variants inside its working form.
- `app.js` owns activation. `capabilities/task-selection.js` resolves page-based favorites/recents/startup preferences to an actual remembered/default task without introducing a second renderer. Remember only task identity/direction; original controllers retain inputs/files. Keep raw engine IDs, recipe bytes, validated preference keys and canonical capability routes.
- Native and engine tasks sharing a panel expose only their selected form and required shared source nodes. Preserve the real nodes and listeners; remove aggregate composition and obsolete discovery controllers/styles instead of hiding a duplicate page. Update affected UI tests to select real tasks, keeping engine, state, media, motion and accessibility assertions.

## 本轮最小必要验证（用户更新于 2026-10-21）

- 以 [docs/TESTING_POLICY.md](docs/TESTING_POLICY.md) 为验证范围的唯一规范。本节替代旧版强制先跑计划、执行整套专项或检查所有使用方的要求；其他文档列出的完整覆盖能力不是每轮执行清单。
- 只审查本轮实际修改的内容，验证修改的行为及有具体依赖证据的直接影响。已有未提交改动、历史功能、无关页面与引擎不自动纳入；共享文件被修改本身不是扩大范围的理由。
- 文案、文档、标签、简单排列及可逆样式调整采用差异检查或针对性查看即可，不强制运行测试计划、浏览器套件、架构审计或构建。功能改动选择能证明该行为的具体用例；共享组件只检查改变的契约及少量代表性直接使用方。
- `npm run test:plan -- --files <本轮全部修改文件>` 是可选的候选检查清单，不是必跑清单。逐项核对原因，排除无关检查；计划范围恰当时才运行同范围 `verify`，否则直接运行相关用例。套件不支持筛选时，使用针对性验证并如实记录，不为执行方便扩大到整套，也不少报文件或削弱断言。
- 不无参数运行 `verify` 来验证本轮，以免包含工作区全部改动。`verify` 已包含选定静态与单元检查，不再顺序重复运行 `npm test`、`npm run check`；仅在生成、打包或实际交付产物受影响时构建。
- 已通过且未再受改动影响的检查不重跑；失败后仅重跑失败项和修复直接影响项。只有具体关联故障、明确依赖证据或用户明确要求时才扩大范围，并简述原因。`verify:all` 保留给明确的整站验收，不是小改动或发布前的自动步骤。
- 保留完整测试库、安全边界和真实行为断言，不以删断言替代收窄执行范围。布局、键盘、正常／减少动态等只按本轮改变的行为选择必要场景。模块依赖变化时再查 [模块边界](docs/MODULE_BOUNDARIES.md) 及对应审计；静态检查不能替代受影响的运行时行为验证。
- 相关检查通过后直接交付，简述改动与实际验证；不反复通读无关资料、不为小任务增加审查代理、不把历史结果当成本轮执行结果。


## Mandatory UI and review contract

- Before adding a tool or changing UI, read [docs/UI_DEVELOPMENT_RULES.md](docs/UI_DEVELOPMENT_RULES.md), [docs/UI_COMPONENTS.md](docs/UI_COMPONENTS.md) and [docs/CAPABILITY_ARCHITECTURE.md](docs/CAPABILITY_ARCHITECTURE.md). The rules apply to every page and lazy/dynamic view. Do not add per-page bypasses or relax assertions to make a fix pass.
- Use only `public/ui/index.js` from application modules; common appearance and all UI motion belong to `ui/components.css` / `ui/motion.js`. State, focus, input invalidation and cancellation are synchronous; motion is interruptible and honors live reduced-motion preferences. All explicit motion paths share continuous-input suppression and disconnect cleanup.
- Fix the owner of the failed contract (component/controller, cascade, resource resolution, result model or engine adapter). Reproduce the affected behavior, fix its cause and verify the changed contract with representative direct consumers. Add a regression when the behavioral risk warrants one; do not traverse every consumer. A screenshot-specific patch, fixed wait or hidden error is not an acceptable fix.
- `audit:ui` checks HTML factories, public imports, motion/style ownership and catalogue help; existing `check`, `build` and full verification entries include it. Their availability does not require running them for every edit. Select only directly affected component/layout/motion cases under TESTING_POLICY.md; retain the full coverage library without automatically executing it. Report actual checks from this run.

## Capability discovery and workspace contract

- The five production categories are 编解码与加解密 (`codec`), 资料查询 (`reference`), 图片音视频与文件处理 (`media`), 其他工具 (`other`) and 科普 (`knowledge`). The user's explicit addition of 科普 supersedes the former four-category contract. Preserve the original desktop sidebar and use that same node for the mobile native drawer.
- Read [docs/CAPABILITY_ARCHITECTURE.md](docs/CAPABILITY_ARCHITECTURE.md). Shared static category/group definitions live in navigation.js; the capability registry maps real native tools and CyberChef operations, validates stable IDs and unique source coverage, and derives navigation, global search, group representatives, counts and complete task lists. Do not restore parallel hand-maintained catalogues.
- Show every group on its category overview with representative tasks covering different uses and the real count. Expand the full list in place; retain one complete searchable directory, not nested category pages or a default-only dropdown. Search defaults to all five categories and includes Chinese, original English and player phrases.
- Selecting a capability opens its real workspace in the same document. Retain original engine/operation IDs, route aliases, input nodes and files; favorites, recents and preference backups remain compatible with validated tool IDs. No private inputs, files or results in routes/preferences.
- Workspace UI owns the current task heading, help/knowledge actions and return-to-group/all-functions controls; it does not generate a breadcrumb, peer toolbar or direction buttons. Original controllers own inputs, parameters, real direction selects, results and cancellation. Share applicable input or selected objects, but synchronously invalidate stale results and revisions when the actual task/input changes. Copy only compatible named parameters, never invent an inverse or claim all conversions lossless.
- A supported encryption/decryption or encoding/decoding pair is one discoverable capability family, not two classified tools. `operation-pairs.js` alone declares `CHEF_OPERATION_PAIRS`; `registry.js` re-exports it and owns native direction definitions, `byOperation` and legacy `aliases`. All selectors and search use this registration; CyberChef palettes project its families/topics through `chef-tools/families.js`. Resolve old single-direction IDs with `resolveCapability` to their real operation or native direction. Preserve every original operation ID in recipes and source coverage. Topic actions are not inverse directions: hashes and signing/verification may share a concrete topic but never gain an invented inverse. Changing the actual operation cancels stale work while preserving source input; explicit 作为输入 alone adopts actual output bytes. Do not restore separate reverse-result actions or another inverse list.
- 科普必须一项可见功能一篇，双向功能族一篇、同用途专题一个入口；专题合并完整保留每个成员的准确机制、步骤、实例和引用。用户明确否定工具组概论：每种编解码分别说明输入单位、排列／映射／运算步骤、可复核例子、参数与边界。先读 [docs/KNOWLEDGE_CONTENT_RULES.md](docs/KNOWLEDGE_CONTENT_RULES.md)。分片内容位于 `public/knowledge/articles/`，统一冻结／校验模型在 `content.js`；`capabilityIds` 精确对应注册功能，禁止用组名给所有工具套同一篇。每个正文小节通过 `sourceIds` 引用真实、支持对应断言的机构标准／官方文档／原作者规范，优先国内官方中文资料和国内标准镜像；如仅有原文如实标语言，不能贴无关中文链接或把社区转载称为权威。ReferenceList 在文章末尾集中展示每项文献一次，保留机构、章节与链接，以及小节 sourceIds 的依据归属；文献引用不是项目依赖，不虚构来源页脚。原工具库、软件／资料／素材许可继续完整保留。新增可见功能缺科普、重复功能覆盖、无依据小节、无实例或不安全链接必须使模型／登记／测试失败。标题只用基本功能名，目录只显示名称；禁止恢复已删除的旧分组科普或其兼容入口。保留阅读焦点、同页真实工具联动、失效回调拒绝与销毁清理。
- Query pages preserve their own visual index and current record model, with related tasks using that object. Country/currency/transport share a region context; the complete selected OpenNGC catalogue supplies real deep-sky objects to astronomy with the user's time/location. Local CIF files enter the existing model upload directly. Media retains separate original/current-result assets. Simulators share shell/components but keep separate rules and state models.
- Full verification must retain source-coverage, discovery/deep-link compatibility, actual engine output, sidebar/mobile focus, cross-task invalidation, reference/media integration, normal/reduced motion and keyboard/multi-viewport coverage. Update assertions to the user-approved contract; do not weaken behavior or source/security boundaries.

## Project and tool requirements

- This is a static, Chinese ARG puzzle workbench. Read `README.md` and `THIRD_PARTY.md` first.
- The user-facing product name is 迷雾工具箱. Keep header/footer branding, about, document titles and export/release display names consistent; retain established storage keys, preference format IDs, routes and repository identifiers for compatibility.
- Use Node.js 24 or newer. The primary build has no npm install dependencies.
- After functional edits perform the minimum directly relevant verification from TESTING_POLICY.md; the automatic plan is optional and its candidates require scope review. Build only when needed for generated output or delivery.
- Keep the core tools usable without contacting external services. Selected files must stay in the browser unless the user explicitly requests a server-backed operation.
- Password/encoding and processing chains use the official local CyberChef ChefWorker with a native site UI. Do not restore an iframe or extra-window entrypoint. Keep official vendor bytes unchanged. Shared, documented compatibility corrections belong to `public/cyberchef-operation-corrections.js` and are installed at the Worker module boundary for standalone tasks and complete recipes; never patch only the displayed result. Strictly scope the AMF registration hook to the pinned Encodings synchronous import and restore the global descriptor function in finally. Preserve original serializers and decoder node-tree output. `scripts/extract-cyberchef.mjs` extracts the unmodified worker and catalogue with ENGINE.json hashes. `public/cyberchef-client.js` adapts its message protocol and `public/cyberchef.js` owns controls. Preserve raw binary input/output and clear stale results on changes. The old text/pipeline UI and WebMCP registration remain removed.
- Keep CPU-heavy audio work in `public/audio-worker.js`.
- Preserve upstream source and license notices. puzzle-lib and fft.js adaptations are generated by `scripts/build-vendor.mjs`; edit its transformations rather than silently replacing generated files. CyberChef is imported by `scripts/install-cyberchef.py` from the pinned official ZIP, preserving every runtime file and bundled license notice; it omits only duplicate HTTP compression variants and renames the HTML entrypoint. Preserve `public/vendor/cyberchef/UPSTREAM.json` checksums.
- Read `upstream-manifest.json` before upgrading an upstream component. New integrations require license and provenance records.
- Prefer specific Chinese labels, accessible controls and responsive layouts. Escape untrusted values before inserting HTML.
- UI must use the real factories/templates exported by public/ui/index.js. Common presentation belongs to ui/components.css; tool styles own composition and visualization only. Use SearchField for compound search, FormGrid/Field spans for width-driven parameters, CheckGroup for related booleans, and SplitView for responsive panes. Preserve parameter order/values, whole-label activation and named composite groups. Do not restore per-page checkbox direction/focus overrides. Textarea autoSize and setTextareaValue share bounded content sizing; keep disconnect cleanup. Shared changes select the relevant browser-ui-components/browser-ui-layout contracts.
- The requested visual reference is `https://chronicle.mistarg.cn/index.html`. The user supplied its migration archive on 2026-10-07; its index HTML and styles were inspected and rendered locally. Preserve its navy/amber/cyan palette and restrained static CRT texture. The current workbench uses local Inter / Noto Sans SC for headings and controls, JetBrains Mono for data/code, and Noto Serif SC for the brand and directory title. Keep ligatures disabled for puzzle symbols and code. Keep the tool workspace practical. Do not commit the user archive, backend or uploaded media.
- CyberChef computation is directly integrated and hosted locally. The image page supplements its original channel/gray/invert/contrast, QR, EXIF/XMP/IPTC, PNG-chunk features with pinned AperiSolve visual-algorithm ports and actual StegOnline extraction/bit-plane code, generated by scripts/build-image-vendor.mjs. Keep all features in one upload/preview/result workspace, with LSB quick presets and byte offset. Keep PNG raw decoding, opposite bit-plane polarity conventions and partial-byte handling. AperiSolve full server scanning remains an explicit official-site link; no automatic uploads. QR may use the original image or current view. Image OCR has been removed by user request; do not restore it.
- 二维码混合专题保留原图与当前视图的明确选择；矩阵修复通过显式 `arg:qr-source` 沿用图片，生成结果不自动覆盖原始图片。修复控制器在离开实际 `native:image-qr` 成员时同步终止 Worker、清计时器及旧输出，拒绝迟到的图片解码回调，保留矩阵／撤销／图片草稿；卸载再释放图片和监听。ZXing 通过 app 注入的 `beginBarcode: imageTools.beginExternalTextResult` 提交到图片所有者的同一结果模型，不能只写 textarea 而遗漏笔记／图稿联动。租约校验原图身份、读取代次、视图、来源和任务失效；无法中断的 WASM 回调须拒绝过期结果及错误，不宣称已停止其内部执行。
- Keep licenses in public/project-licenses.js and use project-sources.js for both the source catalogue and tool footers. Every integrated project needs its precise license (including separate data/core/dependency terms) and bundled notice paths; browser APIs are not licensed dependencies. Tools using third-party code, data or media must end with a `tool-provenance` footer naming the actual projects, concrete roles, links and precise licenses. Original-only tools and website pages omit this footer. Do not list browser APIs, MDN or our own implementation as project sources; remove native-only rows and empty source sections in the shared project-sources finalization after dependency assembly, never by CSS hiding. The user requested no ARG-tool repository display. Never list an external tool as an integrated dependency unless its code/data/media is actually used.
- Do not commit credentials, `.env` files, user-selected files, browser profiles or screenshots. Git destinations and publication audience must come from the user's instructions. Gitee musicraft/arg-tool is the current source target; inspect actual remote URLs instead of assuming origin points there. An imported source ZIP is a snapshot, not imported Git history.

- The default website page is 首页 (#home), containing only 已收藏, 最近使用 and 工具导航, with no hero or promotional headings; explicit tool deep links take precedence over the saved startup preference. Website pages home/about/settings are separate from capability overviews and tool tasks; do not hard-code the compatibility tool-page count as the capability count. 关于 (#about) replaces 项目来源; #resources remains an alias. Keep all precise project/license notices in the about disclosure and actual tool footers. Shared ToolCard and navigation data serve the home and directory. Preferences belong to preferences.js; persist only validated UI choices, explicit favorite IDs and the opt-in last tool ID. Recents are session-only. Export/import only versioned preferences and favorite IDs, never clues/files/results/drafts or all of localStorage. Invalid imports must be atomic and unavailable storage must preserve session behavior. Settings must apply at the shared component/motion layer, respect system reduced motion and preserve current tool nodes/input/files. Website/preferences changes select browser-site-pages and related affected contracts.
- 保留 #crypto、#encoding 和各原始操作深链接作为兼容入口；新的编解码与加解密总览按能力展示真实任务。CyberChef 完整处理链 (#cyberchef) 属于其他工具。 Translate presentation in public/cyberchef-i18n.js; preserve recipe operation IDs and arg values. No sample-loading controls. Keep English-name search working.
- CyberChef Worker initialization must receive the same-origin absolute resource base from cyberchef-client.js before loading the official engine. Resolve importScripts and local asset fetches against that base, never a temporary blob Worker location. Keep docURL as a path for Jimp path.join; turn requests into absolute URLs at the adapter boundary. Resource failures must reject readiness/pending work and terminate promptly, while explicit network operations retain their response semantics. browser-chef-tools includes browser-chef-worker regressions for native/blob/subdirectory starts, task and chain output, module/font failures, fresh retry and cancellation; preserve all of them.

- Shared tokens/fonts live in public/ui-theme.css. All HTML UI must be created through public/ui/index.js: shared factories or render/insert composition; public/ui/components.css owns common control/state styles. Do not create raw HTML elements, write innerHTML, call insertAdjacentHTML or new Option in application modules. SVG geometry and upstream sanitizing are separate. Initial page composition lives in public/ui/pages.js, not index.html. Shared tabs/dialog/disclosure controllers own keyboard, focus and ARIA state; preserve native nodes/files when moving UI. Component interfaces and lifecycle contracts are documented in docs/UI_COMPONENTS.md. Shared UI changes select audit:ui and the affected component suites. public/site-shell.js owns common headings, help and footers; public/workbench-shell.js owns the sidebar, mobile drawer, card directory and favorites; public/workspace.js owns command search and in-page navigation. public/workspace.css is the final layout layer after site-shell.css and desktop-layout.css. Keep a single 64px header on both desktop and mobile, a text-only brand, centered desktop search, and the five stable capability categories (codec 编解码与加解密 / reference 资料查询 / media 图片音视频与文件处理 / other 其他工具 / knowledge 科普). public/navigation.js owns the shared static category/group definitions and compatibility routes; public/capabilities/registry.js maps real tasks, representatives, counts, aliases and source coverage for all discovery surfaces. Do not restore top category dropdowns or a second mobile header row. Desktop sidebar starts at 1100px; retain the same sidebar node in the mobile native drawer. Task workspaces show the current task, inputs/parameters/results, help, return-to-group and all-functions actions rather than a second full taxonomy. Preserve desktop collapse preferences across viewport changes; dialog close events must derive placement and aria-expanded from current state. Favorites persist only explicit page IDs, recents remain in memory, and opening navigation must preserve tool input/files. Shell changes select the affected workspace/sidebar/layout contracts; unrelated engines are excluded.


- Each current and future tool must have a Chinese 使用说明 button beside its shared heading. Keep concise input, operation and result steps in public/tool-help.js, with accurate limitations. Expand help inline without navigation and preserve user input; keep project provenance last. Do not restore the ARG Chronicle outbound header button.
- Keep persistent instructional prose and implementation introductions inside the shared 使用说明, not beside each control. Delete duplicated static notes at composition time; do not blanket-hide .help/.ref-note because these classes also carry live statuses/results. Dynamic instructions with real IDs use data-tool-help and the shared help owner; late content uses appendToolHelpContent. Preserve accessible descriptions, original nodes, live file/selection/result/error readouts and one accurate provenance footer; do not repeat license paragraphs in the workspace.

- First-round tools live in public/round1 and share the existing shell/help/navigation. Keep local workers for substitution, QR decoding and cube solving, cancellation and stale-result guards. Preserve locked substitution mappings. Hanzi reverse lookup must compare complete Cangjie codes (not substrings); Wubi prefixes use the dictionaries, not cnchar's composition API. Cube setupAlg must reflect the current facelet state. No remote Quipqiup dependency is present.
- New upstream components are pinned by scripts/import-round-one.py; ordinary builds are offline. Generated substitution and QR adapters come from scripts/build-round-one.mjs; retain original source and separate data licenses. Run scripts/browser-round-one.mjs for changes to these tools; it verifies actual workers, local sampling, touch and viewport bounds.


- 第二轮入口已合并：#audio 为“音频与音乐”（signal/music/play 标签），#image 含 analysis/compare/repair；#instruments 和 #qrrepair 仅为兼容别名，不恢复独立目录项。public/round-two.js 移动原 DOM，保留监听器与状态；音频/图片/文件变化须使相应异步结果失效。第二轮 Worker 与算法在 public/round2，固定本地库在 vendor/round2。维护导入脚本 import-round-two.mjs 使用 upstream/round2/package-lock.json；正常构建离线。MIDI 重叠音符不静默压平，坐标固定 WGS84，秒/毫秒不猜测。ZIP 不自动全量解压，保留 32 MB 输出限制、CRC 验证、取消和超时。相关改动按测试映射选择第二轮与实际受影响的媒体／共享接口回归，不连带无关第一轮工具。

- 旧纸笔编辑器（Penpa / Noqx、pzprjs、Interactive Sudoku Solver、Exet / Exolve）及网站题目链接求解已删除，不能恢复。用户随后授权第三轮：新建一个直接嵌入主页面的中文“纸笔解题”入口，统一标准数独、数回、数墙、照明四种题面；不可重新引入整套外部编辑器、iframe 或独立工具窗口。public/round3 使用固定 cspuz_core 的本地 WASM 网格接口。保留题面/结果分离、修改即作废、停止/超时、草稿、撤销、手机数字键盘、JSON/SVG、答案提取。多解只展示共同确定部分；数回补充非空回路约束。维护源码、补丁和许可在 upstream/round3，编译脚本 build-round-three.py；普通构建不需要 Rust 或联网。新增改动运行 browser-round-three；browser-paper-removal 继续验证旧编辑器已删除。查词、网格搜词与答案提取保持保留。

- CyberChef 功能已按用途拆分：public/chef-tools 负责 505 项目录映射、任务表单、输出适配和限额；原始适配库存为 489 task、1 项现有 ZIP、10 chain 与 5 retained；不能将 489 称为公开工作区数量。另由 operation-policy.js 将 78 项转为配方专用，再以专题合并计算实际公开入口；全部 505 项来源覆盖和真实引擎保留。编解码与加解密按字符／编码／通信符号、古典与密码机、现代加密、签名／口令／密钥、分析、文字和格式分组；古典、现代对称、公钥、签名认证、令牌、派生与证书的区别仍需可发现。侧栏、能力总览、完整目录和搜索共享能力登记；每组展示不同用途的代表入口及真实数量，完整列表在组内展开。#panel/group 旧深链接继续兼容，不能把未分类操作默默归入加密。编辑分类后运行 scripts/audit-cyberchef.mjs 更新任务表。普通构建离线，不更新官方运行字节。参数渲染由 chef-tools/schema.js 同时供任务与处理链使用；用原始 Dish 值显示 JSON、二进制、图片及多文件，不能把展示 HTML 当作真实数据。图表只重建安全 SVG，不执行结果脚本/iframe。新任务保留输入变化即取消、30 秒超时、32 MB 输出限制、原始文件共享和图片连续处理；独立任务不恢复“送到处理链”按钮。图片编辑补充现有功能，不覆盖原始隐写输入，需用户点击“用于图片分析”才载入新图。docURL 同源绝对路径用于兼容 Jimp 字体资源拼接。Remove EXIF 通过 public/cyberchef-worker.js 将上游 Uint8Array 返回值规范为 byteArray；不得修改官方文件或重新编码像素代替移除。必须保留无 EXIF 字节一致、含 EXIF 无损移除与错误不报成功的回归；OCR 与旧编辑器不恢复。按测试映射选择实际受影响的 Chef、分类或媒体接口回归，不默认连跑其他轮工具或整站构建。

- 代码运行暂放“其他” `#code`，遵循当前五大类侧栏、卡片目录与搜索导航。`public/coderunner` 提供十语言统一页面与新建 Worker；偏门语言使用固定上游真实引擎，Ook! 仅做语法适配。原始源码/许可/依赖锁在 `upstream/coderunner`，维护导入脚本 `import-coderunner.mjs` 生成带哈希的本地运行包；正常构建不联网。Python 只用本地随包标准库，保持空 `jsglobals`、宿主 API 限制与禁用动态 JS 路径；用户 JavaScript 只能进入 QuickJS，不能改为主页面或 Worker 的 eval。保留代码/输入变化立即终止、10 秒/输出限额、暂停/单步、手机符号键、SQL 原数据库与结果分离、文本安全展示和送入 CyberChef。不得复用跨次执行的可变 VM 状态。变更选择 `browser-coderunner` 及确实受影响的接口回归。

- 原生密码操作遇到 Input=Raw 的字节字符串接口时，通过官方 To Hex + Input=Hex 保留 UTF-8 字节；不要将汉字截断为低 8 位。结果中有效 UTF-8 可作文本预览，但下载/续接保持真实字节。不得修改官方算法包。

- License/UI/source audits: keep public/project-licenses.js, project-sources.js and bundled notices consistent; browser APIs must not be labeled as third-party code. Explicit full verification is `npm run verify:all` (test-tools supplies pinned Playwright; CHROMIUM_PATH may select the browser). Run `npm run audit:integrity` before generators. Reproducible media fixtures are in tests/fixtures and must never enter dist. Optional network advisory command: `npm run audit:dependencies`. Preserve separate FFmpeg core, ZXing-C++, dictionary, Glucose/Syrup and runtime license terms. exifr 7.1.3 is now a pinned local file with upstream-manifest hashes.

- 页脚本地运行承诺仅指本站常规工具的数据处理，不掩盖主动 HTTP/DNS 请求、外部服务或托管访问日志。CyberChefClient 要校验上游 progress，OperationError/DishError 可能返回 error=false，提前结束不可当成功。处理链文件加载期间禁用执行、配方导入不得覆盖较新的编辑，输入/输出和文件列表限额均在共享客户端校验。相关变更选择 browser-privacy 与实际受影响的客户端回归。

- 第四轮按用户发布前要求仅保留四工具：图片音视频与文件处理的 fragments/model，其他工具的 chess/life；图论路径、几何作图、数字电路及专用依赖已删除，不恢复。public/round4 原生页面按需加载，禁止 iframe、独立工具窗口和运行时 CDN。保持碎片双指视图变换、单指拖动、40 步撤销与资产释放、导出不受视图影响；棋谱非法载入保留旧局面；模型禁止外部 URI、解析前限额；切页停止动画。按测试映射选择第四轮回归；排布、共享 UI 或许可有变化时，补对应专项。桌面基础布局在 public/desktop-layout.css，当前工作台覆盖规则在 public/workspace.css，不能破坏手机顺序和键盘操作。
- 当前正式部署目标为用户的 1Panel 静态网站，部署说明与 OpenResty 配置在 deploy/；不要把现有 Sites 预览误认为用户服务器。npm run release 只打包 dist 和部署资料，不包含测试素材、源仓库、凭据。没有服务器访问与域名时应交付发布包并准确说明部署未执行。

- 科学与历法保留 #astronomy/#chemistry/#sequence/#calendar：天文、化学与历法归资料查询，序列资料入口关联其他工具的生物序列处理；各原始深链接继续可用。引擎和数据在 public/vendor/science，固定原始文件在 upstream/science；普通构建离线。保持独立可终止 Worker、30 秒超时、输入变更作废、文本安全显示和 SVG 图片隔离。蛋白质/DNA/RNA 类型必须显式选择；模糊密码子与不完整末尾不可偷偷修正。传统历法明确北京时间、春节换年及日期有效性，24 节气必须覆盖所选公历年。元素派生数据保留 CC BY-SA 3.0 和独立中文名记录；SeqViz 的 NtSeq 映射归属也要保留。运行 science 单元与 browser-science；导航/许可等共享变更按测试映射补对应专项。用户可明确要求 Sites 测试部署；这不等于完成 1Panel 服务器部署。

- Science Worker resources must use the same-origin absolute base supplied by the page module. Never resolve importScripts/fetch/WASM against a blob Worker location. browser-science must retain native, blob and subdirectory runs with real engine outputs and failed-load recovery.

- 固定资料入口属于资料查询：countries/airports/ports/unicode/iching/tarot/colors/geology/currencies/marine/sky。原始文件和固定版本在 upstream/reference、upstream/discovery，派生运行数据在对应 public/vendor 目录；只有维护导入器联网，普通构建离线。保留精确许可、来源原文与 UPSTREAM 摘要。大表先分页再创建结果对象；支持取消、输入失效、失败重试与同源绝对 Worker 资源地址。CIF 对称表达式禁止 eval，保持解析/原子限额，由现有 model 上传流程解析用户文件，不维护矿物样本库。修改按实际影响选择 reference、discovery、round-four 单元与浏览器专项，不恢复退役目录。

- 信息查询的图形浏览在 public/reference/browser.js / world-map.js / visual-core.js：保留国家地图/国旗、交通地点、先天/后天八卦与上下卦组合、Unicode 字符表、塔罗叠牌、连续色盘、地质层级。点选通过原查询 Worker 和 recordId 精确取资料，不能用静态示意冒充实际结果。移动端多数图形点选后定位紧邻页头的详情，可返回图形；塔罗翻牌和色盘保留操作位置。目录不阻挡详情。地图缩放/触控不误触查询，原比例允许页面滑动；地图是本地固定 Natural Earth 数据，完整公共领域声明不能删。图标集中于 ui/icons.js（workbench-shell.js 保留 uiIcon 导出），当前可见资料/科学入口不可退回通用网格图标，也不为退役资料保留入口。修改后保留 browser-reference 的真实点选、手机触控、失败恢复与 blob 子目录测试；共享图标/许可按测试映射选择专项。

- 连续色盘在 color-picker.js，用三条 HSV 滑条与 HEX 同步色值；拖动使旧结果失效，松手查询。HEX 连续输入不能在三位时强制改写破坏六位输入，非法输入不得保留旧结果。tarot-deck.js 提供五张以内真实叠牌和下拉、键盘及手机横向滑动；不恢复大网格或文字符号。默认使用 Gearberry 固定 78 张原始 WebP，保留其 CC BY 4.0 声明、署名与来源限制；经典切换保留 78 张 1909 RWS 公版图片，文档 MIT／牌面公共领域独立声明。tarot-art.js 统一两套尺寸、文件和编号：Gearberry 正义 VIII／力量 XI，RWS 力量 VIII／正义 XI，按牌名绑定，查询编号与排序随所选版本变化；切换保留输入并立即作废旧查询。browser-reference 保留全部 156 张图像解码、版本切换、准确等级、HEX 错误恢复、色盘触控和翻牌不跳到详情的测试。

- Shared motion lives in public/ui/motion.js and ui/components.css. ToolPanel roots use fade-only motion; never transform page roots containing sticky/fixed controls. Keep normal/reduced-motion behavior, immediate logical state and cancellation/unmount cleanup. Do not animate every input/Canvas frame, infer busy from disabled, clone private content for exits, or delay result invalidation. Native dialog close/focus is synchronous; leaving/ui:exitcomplete coordinates only visual sidebar cleanup, with stale callback guards. Use animateCollection for keyed visual reordering and preserve real record IDs. Shared motion changes select browser-ui-motion; derive check counts from the current runner instead of preserving obsolete totals.

- Discovery additions live in public/discovery; go belongs to Other → 棋谱复盘; currencies/marine/sky belong to 资料查询 and link to their related capability objects. Use pinned Sabaki SGF+doken for parsing and the bounded replay model for setup, branches, captures, pass and simple ko. Annotation nodes cannot reset ko; pass/setup can. Do not claim AI/score or full rules adjudication. Keep 512 KB/2,000-node/32-game/2–25 square/UTF-8 limits, immediate invalidation and terminate-on-leave. Discovery sources and maintenance scripts are hash-pinned; OpenNGC derived data retain CC BY-SA 4.0. Sky is 深空天体目录 with all 14,034 rows from the pinned NGC and addendum tables; selected HYG stars are retired and their original bytes are archived only. Preserve null coordinates and Dup/NonEx; never turn missing values into zero or enable astronomy for unconfirmed entries. Query catalogue directions through the real Astronomy Engine using the existing time/location and J2000-to-date transform; limitations belong in help/results. Currency data are fixed current/historical snapshots without FX quotes; preserve numeric leading zeros and never invent historical country associations. In-page bridges preserve inputs and never spawn windows. Run discovery unit/browser tests including native, Blob and subdirectory workers; shared changes select their affected contracts.

- Plain Card/Field/DataList factories provide usable default surface, field and data layout without legacy page classes. Explicit composition classes remain respected. FilePicker with a custom trigger owns hiding its native input. New pages must not compensate for missing component defaults using page-only CSS; retain default-layout/file-trigger regressions in browser-ui-components.

- 图灵机位于其他工具 → 代码与计算模型（#turing）。public/turing 的原生组件 UI 与会话模型分离；引擎复用固定 Turing Machine Viz 和 js-yaml，本地有界 Worker，所有资源从页面绝对基址加载。转换图只能使用实际编译规则；初始纸带坐标从 0 开始，读写头位置独立设置。保留 Unicode、L/R/S、实际单步/回退/重置、原子限额、配置验证、输入变更失效、离页终止及失败重试。维护改动只编辑 scripts/build-turing.mjs 的转换，禁止直接修改生成文件；原文、摘要与许可必须保留。连续计算结果使用公共 setTextareaValue 的 feedback:false，单次反馈保持默认；新增通用行为必须在组件层实现和回归。运行 tests/turing.test.mjs、browser-turing，共享层变更按测试映射补对应专项。

## Basic conversion contract

- Science and reference controllers register with `public/capabilities/task-lifecycle.js`. Leaving a route immediately cancels pending work and clears timers; changing task identity on the same panel invalidates old output. Deferred bridge queries run only after their actual destination enters. Preserve inputs and shared objects, and keep browser-task-lifecycle and browser-capability-resilience regressions in the explicit full suite and select them when affected.

- Basic entry points use the pinned CyberChef engine; do not duplicate algorithms already provided there. Keep Unicode scalars, UTF-8 byte values and numeric radix conversion distinct. All search surfaces use `public/capabilities/registry.js` and its shared vocabulary from `public/tool-search.js`; add discoverable direction names and player aliases.
- Native conversions use `ConversionWorkbench` with revision/cancel/timeout ownership in the controller. New results must invalidate synchronously on input/parameter changes and page leave; never copy or download a stale result. Explicit inverse pairs preserve compatible named parameters and real bytes.
- Preserve adopted input data separately from native textarea display normalization. Controllers append/read through `getInput` and `adopt`; user input discards the saved projection. CR/CRLF, downloads and inverse operations must use original data rather than the displayed LF string.
- `scripts/build-basics.mjs` verifies preserved sources and generates offline ESM adapters; edits to generated vendor files are forbidden. Keep selected upstream algorithm fixes in the generator, notices and meaningful regressions. Hidden character cleaning is opt-in with joiner/variation protection; never silently discard unsupported coordinate/teleprinter characters.

## Native hex and IT reference contract

- `public/hex` separates immutable original bytes, editable memory and UI; 32 MB files, 64 steps/8 MB total undo history, 1 MB search patterns, independent terminable search Worker. ByteGrid owns bounded rendering, keyboard/ARIA and responsive geometry; normal controls retain 44px targets. Hide preserves edits, actual destroy releases bytes/history/read closures. Never persist clues/files in preferences or IndexedDB.
- The original file loader owns one upload and its visible progress/errors across analysis/edit modes. Use shared SplitView composition, not structural CSS that assumes the upload, controls and result share one Card. Native tasks hide the whole engine extension, not just its inner form. Edited-byte handoff enters the destination before adopting a revision-qualified snapshot; stale task output clearing stays intact. Preserve raw bytes and original disk files.
- `#it-reference` is reference/technical with four registered capabilities: ports/protocols, HTTP, MIME/charsets and domains/public suffixes. Category tabs synchronize actual task routes, facets derive from dataset groups, and queries/details invalidate on changes. Original sources and pins are in upstream/it-reference; the offline generator verifies retained sources before writing runtime JSON. IANA CC0 excludes RFC documents, mime-db is MIT and PSL data is MPL-2.0. The selected RFC index and hand-written x86 reference are retired; their source archive does not create a runtime dependency. Actual x86/ARM disassembly remains available through CyberChef. Do not conflate numeric ranges, temporary registrations, missing facts and parser failures. Maintain tests/hex.test.mjs, tests/it-reference.test.mjs and browser-hex-it in the explicit full suite and select them when affected.

- CyberChef result continuation and explicit reversal share one adoption owner. Preserve real result bytes with the executed operation/argument snapshot in controller memory; use it to initialize declared compatible input/output formats on the actual inverse, rather than interpreting adopted data from current form values. A direction-only switch never adopts output. Preserve subsequent target edits and clear origin on external adoption; keep real AES Unicode continuation, independently checked ciphertext and raw-byte download regressions.

- 固定资料扩充 A10–A14：历史时区 `#timezones`、88星座 `#constellations`、日月食 `#eclipses`、鸟类 `#birds`、古典音乐 `#classical-music` 统一在资料查询。`atlas/catalog.js` 只供静态发现，atlas与timezones各自拥有Worker、取消和记录；只能通过具名notebookActions租约保存记录。不得退回样本或在线接口，不能使用浏览器Intl替代固定TZif，不能省略Serpens两图、AviList辅助sheet或作曲家作品关联。每次更新维护独立源/运行SHA、原始许可、页末来源和科普；详见docs/MODULE_BOUNDARIES.md。

## Result recording completion (user-approved 2026-10-17)

- 用户再次确认跨工具“用其他工具处理”保持删除。笔记与图稿按钮必须独立接入，不能依附已删除按钮的 mount／hidden／disabled 或恢复泛化目标选择器；旧 result transfer UX 的泛化按钮要求由本条覆盖。
- 公共 notebookActions 管理每次点击的独立结果租约与有效性，不拥有工具状态；result-recording.js 接收原控制器显式 publish／clear 的完整结果。禁止扫描结果 DOM、使用被裁剪预览代替完整输出，或建立第二套笔记数据库。
- 代码、查询、文本、图像、音频、压缩条目及可导出的模拟结果均按真实模型记录；SQL 保留完整列与行并可选择实际数据库，异步 PNG/WAV 只在主动保存时序列化并在完成后校验租约。3D 查看等无实际结果的页面不强造截图。
- 每个拥有结果的控制器在输入／参数／文件／任务变化、停止、失败和离页时同步使记录失效。新增工具检查按钮实际存在、可保存且旧请求会拒绝；不以关于页说明或隐藏按钮冒充接入。
- 资料查询请求语义 JSON URL，HTTP 层负责 gzip 协商，不能让正常加载请求 .gz 等下载档案。私密 SMTP 配置仅由可选开发邮件服务／单独生产反馈服务读取，静态工具计算不能依赖邮件服务。
