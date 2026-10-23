# 模块边界与耦合检查

## 科普正文（2026-10-22）

`knowledge/articles/` 保留原始功能成员的规则、参数、实例和文献；`knowledge/chapters/` 仅提供各公开工作区的逐篇补写数据。`chapters/index.js` 在原文与专题投影边界做内容装配，不读取登记器、不执行算法、不访问 DOM。`content.js` 统一校验成员归属与独立的介绍引用、冻结模型并建立正文搜索；`page.js` 仍是唯一阅读器，使用原组件呈现介绍、完整成员和文末文献。介绍不能替代成员机制或实例，补写列表也不能成为第二份功能目录。

## 实用计算工作区（2026-10-21）

`practical/catalog.js` 只声明静态能力；`dates.js`、`geometry.js` 只校验日期、尺寸并生成真实计算条件。各领域视图复用具名的 Qalculate 客户端与唯一 `coordinates-engine.js`，表单和结果租约统一交给 `form.js`；`index.js` 只挂载视图，具体分工见下一节。原坐标页距离表单移除。会议／倒计时由独立可取消 `time-client.js` 对接既有 TZif Worker，资源基址同源；`timezones/planner.js` 只消费原 core 的时区模型，不维护第二套偏移表。UI、纯模型、静态发现与 Worker 边界由 practical 单元／浏览器及既有 timezones 契约验证。详见 [实用计算说明](PRACTICAL_CALCULATORS_2026-10-21.md)。


## 媒体控制器与实用计算（2026-10-22）

`app.js` 仅编排导航、任务选择和控制器连接，不读取音频声道、不启动分析 Worker、不生成文件摘要，也不直接修改这些功能的状态。

| 文件 | 唯一职责与公开接口 |
| --- | --- |
| `media-workspace/audio.js` | 解码音频、当前声道／倒放预览、分析取消及结果租约；通过 `snapshot()` 统一向摩斯、乐理与 SSTV 提供当前预览的 PCM 快照，通过 `load()` 接收显式文件采纳 |
| `media-workspace/audio-model.js` | 纯采样区间计算；裁剪、下载与笔记使用同一预览时间轴，不访问 DOM 或 Worker |
| `media-workspace/file.js` | 原文件、分析结果和十六进制编辑器的组合；采用编辑字节时由注入的路由修订确认目标仍有效 |
| `media-workspace/io.js` | 本机文件传输、复制、下载和控件反馈；不保存工具数据，不决定路由 |
| `practical/index.js` | 只挂载各领域视图，不持有表单或计算状态 |
| `practical/form.js` | 共享表单、取消、运行修订、当前结果、复制／下载与笔记租约；输入法组合中的 Enter 不提交 |
| `practical/view-helpers.js` | 无状态的控件工厂与文字格式化；选择器可独立复用，不引入计算或结果租约 |
| `practical/date-view.js`、`geometry-view.js`、`distance-view.js`、`time-view.js` | 各领域输入及结果展示；计算分别委托纯日期模型、Qalculate、既有地理模型、完整 TZif Worker |
| `practical/geometry-diagram.js`、`timezone-picker.js` | 分别只绘制图形示意、筛选时区名称；不执行数值换算或时区计算 |

新模块通过具名桥复用既有模型，不复制算法或目录。架构检查拒绝将媒体算法重新导入 `app.js`，也拒绝实用计算组合入口直接导入 UI 或计算内核。悬停绘制层只属于局部按键容器，不能把主工作区、工具面板或笔记侧栏变成隔离层叠区域，以免遮挡其中的固定定位编辑器。

原表单已经应用的方向切换只由 `app.js` 同步更新路由身份与会话选择，不重新拆装工作区或解除监听。`arg:taskselectionchange` 仅含工作区／实际成员／方向元数据，侧栏据此更新唯一最近使用记录；来源继续走 `arg:tasksourceschange`。计算、参数草稿和结果失效仍归原控制器，事件不携带玩家输入、文件或结果。

共享下拉框以原始 option 节点作为身份，不以可变化的列表序号识别选项。控制器写入后，过期展示回调不能反向覆盖原生 select；键盘检索、鼠标选择与重复值仍交给同一个输入节点。在线查询的模式及条件组使用 `SplitView` 组合，组内参数使用 `FormGrid`，不在弹性表单上叠加失效的网格列声明。

## Qalculate 计算工作区（2026-10-20，2026-10-22 澄清）

`public/qalculate/worker.js` 独占完整官方 WASM 实例与虚拟文件系统；`client.js` 拥有终止、超时与请求生命周期。`index.js` 组装普通／科学计算器、历史／设置及当前结果租约，`model.js` 只投影真实目录和文本结果。计算器保持一个入口，单位换算由静态 `capabilities/unit-catalog.js` 声明学科范围、登记八个真实任务。`qalculate/units.js` 拥有独立原始输入、学科草稿、取消与结果租约，不复制计算器节点。五个旧通用单位操作保留在 CyberChef 配方内部，来源覆盖不删除。

显式计算使用独立 Worker，恢复内部保留的定义和设置；玩家界面不提供自定义 XML、文件或工作表导入入口。实时单位换算只提交经过校验的数值与固定设置，可以复用已载入的内核，输入变化仍同步取消旧请求。Gnuplot 使用独立 Worker；SVG 仅以图片方式显示，不作为 HTML 插入。取消旧任务的清理不能终止后续新任务。笔记／图稿通过 `result-recording.js` 的修订租约取得完整当前结果。

## 本地中文资料层（2026-10-17）

`public/reference-locale/` 只提供固定 CLDR 的纯名称、标签和注释查询；`public/reference/chinese-search.js` 仅包装既有 OpenCC 数据，做有界的内存检索归一化，不改变原始数据、不持久化查询、不访问网络。各资料领域继续拥有记录索引、真实查询和取消；不能把数据库记录放进全站工具导航的 Fuse 索引。

`public/it-reference/chinese.js` 将固定 MDN 已有中文说明按精确标识投影到 IT 资料视图，保留原字段和原说明。维护导入器只负责固定源的显式获取、摘要校验与离线派生，不进入应用依赖图；新源、运行文件和既有数据的边界分别核验。

中文补充仍由原控制器显示及保存到笔记／图稿，沿用其修订租约和失效规则。共享来源所有者负责关于页及当前真实任务的页脚，不在中文层维护第二套 UI 或结果数据库。

## 可选在线查询（2026-10-17）

`services/online-query` 只拥有固定官方接口的请求、输入限制、临时限流和取消，首项为 OEIS。`scripts/server.mjs` 在现有网站端口分派 `/api/query/`，关闭网站时终止待完成查询；它不为查询读取 SMTP 私密配置，不把邮件就绪作为查询前提，也不提供任意目标 URL 代理。

`public/online-query/model.js` 只校验完整响应与记录元数据，不依赖 UI 或服务器代码；`index.js` 拥有玩家输入、分页、选中条目、取消和当前结果租约。与笔记／图稿仅通过具名 `notebookActions` 桥接，既不扫描 DOM 获取结果，也不新增笔记存储。查询词不进入路由、偏好、目录搜索或故障报告的自动诊断。

扩展来源分别由 `services/online-query/providers/science.mjs`、`language.mjs`、`places.mjs` 验证条件、解析真实协议和保留原始字段。`http.mjs` 统一来源校验与有限请求读取，`provider-service.mjs` 拥有固定主机、逐来源请求时隙、累计响应限额和断连取消；适配器没有任意 fetch 权限。不能将复杂星表、Wiki 原文、CIF 和诗词当作一份假定字段表。

`public/online-query/catalog.js` 只描述各工作区真实模式的表单组成；`external-model.js` 校验来源、提交条件及完整快照；`external.js` 组合原位输入、结果和显式后续查询。返回的详情动作须先在原表单显示实际条件，再由明确点击发送；选择记录本身不查询。原字段、单位、原始响应和许可保留在结果所有者，显示折叠或分段不裁剪实际保存资料。Wiki HTML、模板与词谱 HTML 均只作为文字，不执行或自动加载媒体。

静态发现仍由 navigation／registry 拥有，一个在线查询能力对应一篇科普；数据来源在共享来源目录及实际页面末尾说明。后台请求只在明确提交时发生，结果与保存租约在任何输入／选择／分页／任务／离页变化时同步失效。`online-query` 的后端、模型、来源和浏览器回归覆盖这些边界；普通构建仍离线，邮件故障不影响本地工具及在线查询。

笔记本提供 graphicsHost 与 focus/currentId/update/read 服务；graphics 只管理内嵌编辑器和图稿场景。app.js 将 notebookView 路由传给同一个笔记本页面，不再将白板／脑图装配为工具能力。笔记本的图稿打开、新建及跨视图导航在笔记事务队列退出后调用，避免保存回调形成自等待；浏览器绘图回归覆盖切换笔记、归属、立即保存和重新打开。

## 绘图与笔记联动（2026-10-16）

`graphics/model.js` 只拥有可编辑附件格式与校验；`graphics/engines.js` 封装两个本地编辑器；`graphics/page.js` 拥有工作区草稿、修订和生命周期。`app.js` 注入笔记事务服务，笔记页面只读取纯图稿模型用于展示编辑入口。结果按钮通过 `graphics/bridge.js` 交付原始结果快照和有效性检查函数。所有跨域边在 `architecture-policy.mjs` 命名登记，行为由 graphics 单元和 browser-graphics 覆盖。详情见 [GRAPHICS.md](GRAPHICS.md)。

2026-10-13 检查所有第一方 public JavaScript 模块的导入、资源加载点、事件通道、全局写入及已知 DOM 桥接。机器清单见 [coupling-audit.json](coupling-audit.json)，命令为 `npm run audit:architecture -- --report docs/coupling-audit.json`。固定第三方内部代码不重写，其文件完整性仍由独立摘要审计负责。

## 职责和依赖方向

| 所有者 | 允许依赖 | 不允许承担 |
| --- | --- | --- |
| ui | 本目录组件、模板、动效 | 业务控制器、功能登记、引擎加载 |
| navigation / registry / 各 catalog | 静态分类、操作描述、科普内容与搜索 | UI、状态模型、实际运算 |
| capabilities/search | 统一公开元数据索引、精确／模糊排序、固定本地 Fuse.js | 玩家输入、文件、结果、笔记、偏好及外部搜索请求 |
| capabilities/routes | URL 标准接口 | DOM、注册表加载、输入／结果 |
| 侧栏／搜索／总览 | 公共 UI、登记、纯路由 | 计算、素材和工具私有状态 |
| app / site-shell | 各控制器装配、导航生命周期 | 算法复本、第二套目录 |
| 各工具 UI/controller | 本工具模型、公共 UI、命名桥接 | 其他工具内部状态／任意跨工具导入 |
| 模型／算法／Worker | 纯数据、同领域模型、固定运行库 | 公共 UI、壳层、DOM 呈现 |
| bridge / workspace adapter | 经验证的当前对象、明确目标控制器 | 自动上传、模糊目标、旧异步结果回填 |

`scripts/architecture-policy.mjs` 明确登记允许的跨领域边及用途。新增边必须有真实用户流程和相应测试归属，不能用“都是共享代码”放宽整片目录。模型文件按角色判定：`round4/model.js` 是三维模型页面控制器，不是领域状态模型。

## 本轮修正

1. `navigation.js` 删除无人调用的旧顶部菜单实现及 UI 导入。现在登记、偏好和科普读取分类不会加载 UI 组件树；没有恢复已删除的菜单。
2. `capabilityRoute` 移到独立 `capabilities/routes.js`。侧栏、科普、资料联动和 app 使用同一序列化函数，不再为生成 URL 导入完整工作区控制器。
3. 编程语言与纸笔题型描述分别归到 `coderunner/catalog.js`、`round3/catalog.js`。登记只读描述，原模型导入并重新导出同一个对象以保持接口兼容。规则、求解、参数与原始 ID 不变。
4. 测试依赖拆分：默认验证不再把任何一次改动都扩展成全站生成、语法遍历和所有 Worker 回归；公共 UI 行为与具体引擎行为分别选择。

当前字面量 ESM 导入图无循环，已登记的跨领域边符合契约。这个结论不等于“运行时完全没有耦合”。

## 运行时桥接审视

新增结果交接：handoff/button 接受所属控制器的读取／有效性闭包，handoff/model 只判定数据和推荐元数据；dialog 经 targets 调用 app 注入的导航与采纳接口。没有任意 DOM 字段写入，也不让工具彼此导入。feedback/model 只接收经过白名单裁剪的诊断；feedback/ui 不读取工具输入与结果，SMTP 服务与前端独立。对应 handoff、feedback 单元及 browser-handoff-feedback 覆盖有效性、覆盖确认、隐私和失败行为。

| 通道／入口 | 责任与数据 | 相关覆盖 |
| --- | --- | --- |
| panelchange / nativetaskchange | app 发布当前页面／任务身份，控制器同步停止旧工作；不传输入 | task-lifecycle、capability-resilience |
| opencapability / capability-direction | 真实能力 ID、原始操作、显式方向 | sidebar-routing、capabilities、chef-tools |
| image / audio / file / material 事件 | 素材所有者使消费者结果失效；原始文件与当前结果分开 | round-two、chef-tools、privacy |
| reference-request/result/context | 资料控制器与共享地区上下文，用实际记录查询 | reference、discovery、task-lifecycle |
| astronomy-object | 已确认天体对象交给天文控制器，沿用时间／位置 | discovery、science、task-lifecycle |
| model upload / cif-worker | `round4/model.js` 接收本机 CIF，向同领域模块 Worker 发送 `{cif,repeat}` 并接收 `{model}` 或 `{error}`；控制器拥有 token、停止、超时与销毁 | round-four |
| preferences / collections / search | 设置和壳层展示状态；不保存工具私有数据 | site-pages、workspace |
| qr-source / subpanelchange | 原图片／当前视图与原 QR、乐器控制器之间的显式接口 | round-one、round-two |
| tasksourceschange | app 在实际成员激活后发布页面、能力／成员、操作和实现种类；project-sources 选择当前实现来源，不传输入、参数草稿、文件或结果 | project-sources、project-licenses、family-workspaces |

## 跨实现专题与二维码结果桥（2026-10-16）

`capabilities/topics.js` 静态声明 Base 家族、数字与字节、字符编码与码点、文字转义及二维码五个专题。`topic-model.js` 的 `mixed` 投影保留原生和 Chef 的实际成员，不加载控制器；registry 为全部 505 个来源操作保留唯一所有权。原始操作别名、搜索意图和明确成员通过 `resolveCapability` 精确解析到其原 `open`，不能由专题默认项吞掉生成／识别等不同操作。

`native:radix` 处理整个整数；数字与字节专题中的 Binary／Decimal／Hex 按字节编码约定运行，Float、BCD、Text-Integer 等也保持各自原单位和参数。发现入口合并不表示算法相同，不能共享不兼容的输入解释、参数位置或隐含输出。各控制器保留原文件、输入来源、操作／方向草稿及取消；只有真实逆向对转移具名兼容参数，只有显式采纳动作使用输出字节。

二维码混合专题复用三个实际所有者：`hunt-media.js` 的 ZXing 多制式识别，`round1/qr.js` 的 QRazyBox／jsQR 修复矩阵，以及 `chef-tools` 的生成／识别。app 只注入 `beginBarcode: imageTools.beginExternalTextResult`，不从识别控制器导入或读写其他控制器内部状态；识别器通过 `{isCurrent, publish, clear}` 交付当前结果，图片所有者统一更新正文、复制下载、笔记／图稿联动。租约校验原图身份、读取代次、视图修订和来源选择；取消或切成员后拒绝无法中断的 WASM 迟到结果及错误，不声称已终止 WASM 内部调用。

`round1/qr.js` 监听既有任务元数据，只有实际 `native:image-qr` 成员拥有待完成的解码与图片读取。离开时终止 Worker、清计时器、失效图片代次并清旧候选；矩阵、撤销和图片草稿仍由原控制器保存，实际卸载才释放图片及监听。`arg:qr-source` 继续作为显式的原图／当前视图导入接口，不因切到修复页就自动采用生成预览或重编码原图。

`project-sources.js` 保存组装后来源基线与实际成员选择。`arg:panelchange` 给出当前元数据，app 在原控制器激活完成后通过 `arg:tasksourceschange` 再同步来源，避免复用面板或节点恢复时残留其他成员的项目。重新挂载仍使用原基线，不把已收窄的二维码／Chef 页脚当作整个图片页的依赖列表。来源事件不作为输入、参数或结果桥，也不承担计算与导航。

`project-source-contracts.js` 的 `TASK_PROJECT_SOURCES` 和 `OPERATION_PROJECT_SOURCES` 分别声明真实任务与操作的来源。二维码识别沿用共享 PNG 的像素预览／当前视图时，条件用途注明随包 PngToy（MIT）；不得将它误称为识别引擎或隐写步骤。生成二维码只声明实际生成引擎，不因同属专题而附带图片解码依赖。

已检查资源加载所有者：参考、科学、基础转换、图灵机和 CyberChef 的计算地址由各自适配层处理；它们不是导航层的职责。计算出来的 URL 和 vendor 动态加载必须由所属实际 Worker 回归验证，不凭静态图宣称安全或资源正确。

## 资料范围与退役边界（2026-10-16）

资料模型只提供完整选定标准／目录的有界快照，不能把人工精选或演示样本注册成同用途数据库。完整性先从原始表和导入筛选条件核查，再分别确认运行数据、登记、科普与来源。外站链接资料保留对方真实检索用途，既不冒称本地运算，也不自动提交用户线索。

已移除本地 OEIS 精选、COD 样本目录、HYG 筛选恒星、精选 RFC 和手工 x86 指令／寄存器参考。其原始来源与许可仅在 `upstream/` 归档；运行清单和当前许可目录不得因归档尚存就重新登记为依赖。退役需要删除生成路径、运行文件、任务、导航和关联，不以隐藏旧面板代替。完整国家／交通／Unicode 等资料集、OpenNGC 主表及补充表全部 14,034 条记录和真实计算引擎继续保留。

`#sky` 仅接收 OpenNGC 深空天体对象，仍由 `discovery/bridge.js` 将已确认的 J2000 坐标交给原天文控制器，沿用时间和位置。HYG 精选不再提供运行索引。`#model` 的原上传入口直接接受本机 CIF；`round4/cif-worker.js` 使用同领域 `round4/cif.js` 的 `parseCIF`／`expandCrystal`，不再经过资料查询或 `reference/model-bridge.js`，不恢复晶体样本库。x86／ARM 反汇编、天文与 Alpertron 属于真实引擎能力，不能随同用途精简资料页一并删除。

## 保留的集中点和后续约束

- `app.js` 仍是较大的装配入口，并保留早期音频／文件控制代码；它广泛依赖工具是装配关系，不代表每个工具互相调用。后续新增控制逻辑应放入所属工具，不继续扩大 app。
- `round1/common.js` 已被多轮工具使用，实际是历史共享 UI／下载帮助层，不包含其他轮引擎。当前作为明确的兼容公共入口保留；不要继续塞入某个工具的私有逻辑。`round2/common.js` 的 workerJob 也有纸笔消费者，变更时必须覆盖这个已登记接口。
- 功能登记仍读入完整科普内容以同步验证覆盖；这是启动体积上的集中点。若将来拆为按需正文，应以单一内容模型生成轻量索引，不能手写另一份目录。本轮没有为了静态图漂亮而放弃内容校验。
- 多个控制器仍用 DOM ID 交接素材，例如音高到乐器、纸笔答案到提取、图片到 QR。保留实际节点与输入所有权；已有桥接的改动按两端契约验证，新联动应使用具名函数／事件，不能读写任意页面字段。
- 第一方全局赋值扫描发现的 console/print 位于代码运行的独立 Worker，用于该次运行的受限输出，不是主页面全局状态。

静态审计检查字面量导入、方向与循环；事件、资源表达式和全局写入另列清单。它不是完整 JS 解析器，也不能捕获所有运行时组合或任意 DOM 数据流。因此不能以“0 条静态违规”替代真实联动回归。


## 统一网站与邮件启动（2026-10-17）

项目根目录 `npm start` 通过 `scripts/server.mjs` 提供网页和同源反馈路由，`scripts/dev-feedback.mjs` 拥有服务端私密配置、精确来源／代理白名单及附属邮件服务生命周期；历史文件名不表示仅能本机预览。附属服务复用 `services/feedback/server.mjs` 的原报告校验、固定收件人、去重和限流，不参与浏览器工具计算，也不向前端导出 SMTP 配置。

附属服务只监听私有回环随机端口，并信任根服务器重建的单个来源 IP。根服务器默认使用 socket 对端；只有对端精确命中 `FEEDBACK_TRUSTED_PROXIES` 时才采纳合法的 `X-Real-IP`，不读取 XFF 或从 Host／Origin 学习白名单。网站与附属服务一同关闭，未配置／无效配置不阻断静态网页；显式独立服务 `FEEDBACK_URL` 保持自身生命周期。行为归属为 dev-feedback／server／feedback 单元及 handoff-feedback 浏览器专项，不连带工具引擎回归。

## 本机笔记（2026-10-16）

笔记模型、IndexedDB、Vditor 适配和页面组合分别由 public/notebook 下的 model、store、editor、page 拥有。网站页从 app 装配；不进入能力登记和偏好备份。handoff/button 的 connectNotebook 是命名的显式结果桥，共用原控制器 read/isCurrent 与有效状态，页面不读取显示 DOM 来重建结果。onLifecycle 的 mount/state/unmount 负责伴随按钮位置、状态和卸载；状态修改后的点击处理仍同步校验原按钮 disabled，异步读取前后校验结果租约。回归所有者是 notebook 与 handoff-feedback。

## 白板与脑图（2026-10-16）

`public/graphics/model.js` 只定义图稿和笔记附件格式，`engines.js` 适配本地 Excalidraw / Mind Elixir，`page.js` 管理草稿、预览、失效和编辑器生命周期。存储通过 app 注入的笔记事务服务访问，不依赖 Vditor 内部或直接打开数据库。隐藏的笔记编辑器延迟同步，避免每次绘图保存都重新渲染正文。

`graphics/bridge.js` 接收原工具的完整结果与有效性检查；图稿 PNG 通过原有 handoff 返回其他工具。原始来源、预览和可编辑场景分别保存。跨模块契约逐项登记于 `scripts/architecture-policy.mjs`，由 graphics、notebook、handoff-feedback 和共享 UI 专项验证。
## 新增解谜引擎边界

`public/expansion/catalog.js` 及各 `*-catalog.js` 只持有静态任务／参数元数据，不能加载引擎、词库或UI。能力登记和科普只消费这些静态标识，不能从算法代码推测目录。

`expansion/*-core.js` 只计算；`expansion/worker.js` 拥有独立可终止任务和同源完整数据载入；Alpertron客户端只拥有官方线程协议和会话，不拥有页面输入。摩斯与乐谱合成统一进入原有 `audio-worker.js`，重音频计算不进入主线程。

`expansion/session.js` 拥有输入／参数修订、取消、输出与不可变笔记结果租约；视图负责组合公共组件及专用图形。元素翻页通过同一session重新发布结果，不旁路修改输出与笔记归属。图稿与笔记仍通过已有 `handoff/button.js` 的具名结果契约，依赖注入的音频读取由 `app.js` 维持唯一源文件所有者。

用户查词代码只在固定QuickJS实例运行，没有宿主函数／DOM／网络绑定；原始查词正则使用RegExp，不执行eval。所有词库均为固定JSON数据，维护生成时才执行可信上游字面量。维护源码的原始摘要和派生运行文件摘要分别检查。

## 紧凑任务页与搜索（2026-10-16）

`capabilities/workspace.js` 只拥有当前任务标题及共享页头操作，不再生成分类面包屑、同组 peers 或原生方向按钮。相关科普与使用说明同处 `.heading-actions`，返回分组和全部功能继续使用原导航契约；原表单拥有真实方向 Select。去掉重复 UI 不改变 `routes.js` 的明确方向、参数草稿、原输入所有权、取消或过期结果防护。

`workspace.js` 拥有顶端唯一 Input／SearchField、非模态候选浮层与键盘行为。搜索时不借用完整目录弹窗、不复制搜索框，也不管理工具计算状态。`registry.js` 的 `searchEntries` 委托纯 `capabilities/search.js`，首页、侧栏、总览、目录和顶端查找复用同一相关度模型；固定本地 Fuse.js 7.5.0 只索引公开名称、别名和操作，精确与明确方向匹配先于模糊候选。模块不导入 UI 或用户存储，不发请求。原包、源码、Apache-2.0 许可和摘要由 `scripts/import-fuse.mjs` 维护；主构建直接使用固定本地资源，仍离线且无需 npm 安装依赖。

CyberChef 的 10 个 `chain` 库存项及新增 78 个配方专用操作保留原始 ID 与 `byOperation` 归属，但不进入可见目录、计数、推荐或独立科普，5 个 `retained` 边界不变。公开范围来自纯静态 `capabilities/operation-policy.js`，不是执行引擎的允许列表。配方选板仍可使用其真实操作和参数；流程控制正文归入完整处理链文章，505 项官方来源覆盖及 vendor 字节不变。原始 `sourceModes` 的 489 task 等数字描述适配库存，不能拿来当公开工作区数量。

Alpertron 的静态目录、请求协议、Worker 和视图现仅允许 integer。其余九个高级计算器的原始 WASM 与完整源码保留来源归档，不属于当前可执行接口，不能由 vendor 清单重新挂载。整数分解、表达式、素性、除数与批处理及其生命周期仍由原客户端／session 管理；基础进制、单位、通用计算和因数验证继续保留。

## 专题工作区与内容投影（2026-10-16）

`capabilities/topics.js` 只声明同一具体用途／对象的原始成员 ID。`topic-model.js` 是纯能力投影：保留完整 `sourceOperationIds`、成员 `actions`／原生 `variants` 和旧任务别名；不导入 UI、存储、算法或页面控制器。`registry.js` 组合该模型、配方专用策略、唯一 `byOperation` 与真实来源覆盖，首页、侧栏、目录、搜索、推荐及知识从同一登记派生。不能在每个 UI 消费者维护自己的专题表，也不能因分类一致推测成员关系。

`capabilities/operation-pairs.js` 唯一声明 `CHEF_OPERATION_PAIRS`，registry 重新导出原接口。`chef-tools/inverse.js` 从该表派生真实逆向；`chef-tools/families.js` 从最终登记投影成员操作。专题不是逆向对，不拥有跨成员参数兼容规则。原控制器继续拥有输入、文件、每个真实操作／变体独立参数草稿、取消和结果租约；只有原真实逆向对可转移语义相同的具名参数。UI 只在专题工作表单内选定登记成员，切换同步作废旧输出并沿原路由激活实际控制器，不复制输入节点或另写计算器。

`knowledge/topics.js` 只组合成员正文数据，不导入 registry、UI、引擎或存储，避免内容与登记反向循环。专题只有一个文章入口；每个成员的机制、输入单位、步骤、完整例子、参数边界和准确 `sourceIds` 都保留，ID 去冲突须同步重映射引用。`content.js` 校验与冻结最终模型；禁止用自动生成的组简介冒充成员内容，配方专用 78 项不再各占独立文章。来源页脚仍由共享 `project-sources.js` 根据当前实际成员／方向组合，不由专题投影或知识文献生成依赖。

专题行为归属覆盖成员深链接及搜索意图、原输入／文件保留、独立草稿、真实逆向参数兼容、旧结果失效、取消、真实输出和当前来源；公开范围行为同时验证配方专用操作不露出独立入口且仍在完整配方中执行。静态边界检查不代替这些运行时契约，日常依 [TESTING_POLICY.md](TESTING_POLICY.md) 只选本轮受影响检查。


## 完整固定资料目录（2026-10-17）

`public/atlas/catalog.js` 仅持有名称、别名、分组和稳定 ID；`navigation.js` 与能力登记共用这份元数据。`atlas/index.js` 负责四个独立任务页的查询条件、分页、选中记录和结果租约，不拥有数据或算法。`atlas/worker.js` 只允许四个固定资料类型，以页面提供的同源绝对资源基址读取固定数据并动态加载纯 `atlas-celestial/core.js` 或 `atlas-life-culture/core.js`；不得从用户输入构造资源地址。gzip 解压后有 48 MB 上限，单次 30 秒，输入、离页、停止均终止 Worker 并同步作废结果。`browser-atlas` 覆盖 native/blob/子目录、实际记录、失败重试及迟到拒绝。

`timezones/index.js` 独立拥有时区目录、选中名称和当地／UTC 查询；`worker.js` 通过绝对同源资源基址读取固定 TZif，`core.js` 解析 v2/v3 与 POSIX 尾规则，不能退回宿主 Intl。默认编译的 598 个名称、别名和所有已记录转换均保留；optional backzone 保留原文、未混入计算。`timezones` 单元使用独立 CPython ZoneInfo 对照，`browser-timezones` 覆盖真实页面、Worker 载入、时区 fold/gap、取消和笔记。

两个视图只通过 `handoff/button.js` 传递当前完整记录或真实计算的不可变结果租约，不导入笔记数据库、Vditor 或图稿控制器。原始来源、版本与字段跟随记录；输入变化立即失效。来源由 `project-source-contracts.js` 和共享页脚拥有，科普文献不冒充软件依赖。IAU 巨蛇头尾两图、NASA 全列和历法／TD、AviList 26 列及 6 表、Open Opus 全部作曲家与作品关联不可因展示分页丢失。

## 独立结果记录（2026-10-17）

`handoff/button.js` 的 notebookActions 只产生笔记／图稿动作，每次点击拥有独立 request 和只读一次的值缓存；不再生成跨工具按钮或依赖其生命周期。`result-recording.js` 由实际工具显式 publish／clear 结果对象或懒序列化函数，监听离页／任务变化清理租约，但不查找输出 DOM、不管理工具输入、存储或算法。异步序列化之后仍由笔记／图稿接收方复核同一租约，原始字节及完整查询行不取自可见预览。

代码运行直接发布独立成功结果，SQL 的 JSON 与实际运行数据库分别提供附件选择。传统消费者及各原生工具复用记录桥；新增跨域边逐一具名，实际测试覆盖可用入口、完整字节／记录、同步失效与过期回调拒绝。图片和音频的原始输入／当前处理结果继续分开，记录不等于自动把结果写回其他工具。

## 2026-10-17 补全工作区

- `public/completion/catalog.js`、`sources.js` 仅拥有公开任务及实现来源；`views.js` 使用共享 ConversionWorkbench 和 expansion/session 的同一输入、取消、结果租约与笔记入口，不引入第二个工作区渲染器。
- `completion/job.js` 管理 Worker 生命周期，`worker.js` 分发真实编码／信号／条码运算；Liblouis 使用独立经典 Worker，QuickJS 还原只截获源码字符串，不运行最终代码。超时、取消与参数改变拒绝旧结果，不截取部分结果作为成功。
- `arg:taskimplementationchange` 仅传 `name`、`codec`、`direction` 或键盘 `mode`，由 app 验证当前任务后交给来源所有者。不得携带线索、文件或笔记。来源按实际算法变化，并在重入恢复。
- `completion/qr-view.js` 借用 round1/qr 的真实矩阵、失效与撤销所有权；高级 Worker 只返回候选矩阵，用户明确采用后才改原矩阵。
- `completion/origami.js` 独占当前场景／WebGL／原文件与计算代次；官方求解器只通过生成的适配器运行。SVG 异步回调校验来源 URL、代次及激活状态；导入参数变化须重载，不能拿旧拓扑继续导出。笔记记录调用统一 result-recording，导出完整 FOLD 当前网格与原始元数据。
- `completion/keyboard.js` 的输入面板只保存明确捕获的活动输入目标和选区租约；插入触发原控制器 input/change 失效。完整布局数据同时供键盘与位置换位使用，不复制手工语言表。
- NGA 完整书页查询仍由 discovery/reference 的原记录模型承接；新组合旗语只生成实际文本／旗图。同专题通过注册成员切换，不互相重写输入类型。
- 行为回归：`tests/completion.test.mjs`、`scripts/browser-completion.mjs`；注册、来源与混合专题继续归现有 family/topic/project-sources 契约。各上游源文件与运行包由完整性审计逐文件校验。

## 笔记索引、回收站与完整备份

同一个 IndexedDB 数据库以版本 2 增加 note-index 元数据索引；升级逐条读取原笔记，不改写正文或附件。普通列表只读取索引，显式全文搜索逐条匹配并用查询代次拒绝迟到结果。笔记和索引在同一事务中保存、删除或恢复。

删除以 deletedAt 标记进入回收站，恢复及永久删除都校验 revision，防止另一窗口覆盖更新。回收站仍计入容量限制，不自动清空。单篇备份及分批备份保留原始附件字节、图稿和回收站状态，每份均是可独立导入的完整备份；不引入第二套存储或云同步。

共享 UI 仅通过 `ui/animate-ui.js` 与 `ui/motion.js` 导入 `vendor/ui-runtime/runtime.js`。它是固定的 Animate UI / Motion / React / Base UI 运行依赖，不是应用功能域；两个具名依赖边由 architecture-policy 登记，browser-ui-runtime 覆盖原始节点、退出、中断、键盘和离线行为。

## 玩家表单与观察边界（2026-10-21）

`qalculate/player-model.js` 只处理分类、可执行单位记号与编辑选区，不做换算数学。`unit-definitions.json` 从固定源码 XML 生成；单位倍率由独立内核 Worker 执行。计算、单位加载与内存请求各有自己的取消生命周期；完整定义目录、自定义 XML 与本地数据表单已从玩家界面移除，单位加载仍从完整内核目录读取。

`round1/cubing-worker.js` 执行各谜题的真实公式和完整状态，只允许观察／逆序／展开／简化，明确拒绝 solve 和 scramble。观察控制器拥有形状、起始公式、过程、步数、播放和记录；`cube.js` 只挂载该工作区并提供三阶面色兼容，不创建第二套模拟器或加载求解 Worker。

`round2/tonal-model.js` 与 `science/sequence-model.js` 是具体玩家输入的纯投影，UI 控制器同步作废旧结果。science/index 不再挂载 native-view；原生声明式调用器仅留作内部开发验证，不作为页面。元素完整字段模型保持不变，常用属性和完整原文在同一个结果中呈现。

魔方来源由 `cube.js → project-sources.js` 的具名桥接收窄：控制器只传实际依赖 URL 和固定用途文字，三阶面色记录才包含 cubejs，不向来源所有者传公式或线索。来源所有者继续保证唯一页末与完整 notice；异形图形、切换与页末回归由 upstream-completion 覆盖。观察器关闭自动提示动画，减少动态效果或隐藏网页时停止自动步进。
