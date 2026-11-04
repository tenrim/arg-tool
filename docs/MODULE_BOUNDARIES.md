# 模块边界

现行分工，更新于 2026 年 11 月 1 日。总入口为 [开发指导](DEVELOPMENT_GUIDE.md)，详细产品限制见 [项目约定](PROJECT_CONTRACTS.md)。此前逐轮追加的边界报告已归档，不与本页并列执行。

## 唯一所有者

| 范围             | 文件／目录                                                                 | 负责什么                                                                                                                                                         | 不负责什么                                                                                            |
| ---------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 启动             | `startup.js`、`startup-guard.js`                                           | 等待真实初始路由、失败重试、首次显示                                                                                                                             | 不复制工具控件，不等待所有可选服务                                                                    |
| 应用装配         | `app.js`                                                                   | 注入服务、激活真实任务、导航与来源通知                                                                                                                           | 不接管媒体算法、音频状态或笔记数据库                                                                  |
| 分类与目录       | `navigation.js`、`capabilities/registry.js`                                | 静态分组、唯一功能／操作归属、别名、真实覆盖与计数                                                                                                               | 不加载 UI、引擎或完整科普正文                                                                         |
| 搜索             | `capabilities/search.js`                                                   | 公开元数据匹配，精确匹配优先，固定本地 Fuse                                                                                                                      | 不索引用户输入、文件、结果、笔记；不联网                                                              |
| 任务身份         | `task-selection.js`、`routes.js`、`preference-targets.js`                  | 深链接、收藏、最近使用和公开工作区身份                                                                                                                           | 不持有工具输入或复制渲染器                                                                            |
| 壳层             | `workbench-shell.js`、`workspace.js`、`capabilities/workspace.js`          | 唯一搜索框、页头、抽屉、目录、帮助与收藏                                                                                                                         | 不建立第二份工具目录或方向工具栏                                                                      |
| UI               | `ui/index.js`、`ui/styles/`、`ui/motion.js`                                | 控件、共享外观、焦点、可中断动效                                                                                                                                 | 不依赖业务模块；页面不绕过组件工厂                                                                    |
| 偏好             | `preferences.js`                                                           | 验证、迁移、持久化、展示设置通知                                                                                                                                 | 不保存工具原始输入或文件                                                                              |
| 笔记存储         | `notebook/model.js`、`store.js`                                            | 数据格式、IndexedDB、事务、冲突与迁移                                                                                                                            | 不依赖编辑器 UI 或图稿控制器                                                                          |
| 笔记编辑         | `notebook/page.js`、`editor.js`                                            | 当前笔记、编辑器、保存队列、生命周期                                                                                                                             | 不创建第二份图稿数据库                                                                                |
| 笔记管理         | `manager-ui.js`、`management.js`                                           | 组织、附件、历史、批量操作与纯模型校验                                                                                                                           | 通过原笔记服务保存，不另起事务队列                                                                    |
| 备份与回收站     | `notebook/archive-ui.js`                                                   | 备份分包、回收站和确认弹窗                                                                                                                                       | 使用注入的 store、action、captureDraft；不选择当前笔记                                                |
| 图稿             | `graphics/model.js`、`engines.js`、`page.js`                               | 可编辑格式、引擎适配、场景草稿、修订与生命周期                                                                                                                   | 不直接打开 IndexedDB，不依赖 Vditor 内部                                                              |
| 图稿导出         | `graphics/export-ui.js`、`interchange.js`                                  | 导出设置，以及 OPML／Markdown／XMind 等格式转换                                                                                                                  | 不拥有笔记或图稿保存队列                                                                              |
| 结果交接         | `result-recording.js`、`handoff/`、`graphics/bridge.js`                    | 明确请求后交付完整字节及有效性租约                                                                                                                               | 不从结果显示 DOM 猜测原始数据                                                                         |
| 图片             | `image-tools.js` 及其工作模块                                              | 原图片、当前视图、处理与结果                                                                                                                                     | 不把显示预览当完整原图                                                                                |
| 趣味编解码与传输 | `fun-tools/`                                                               | 十项选定工具的八个工作区；文本、图像、声音和二维码控制器各自持有草稿、取消和结果；重计算交给独立 Worker                                                          | 不复制笔记数据库，不引入在线上传；固定来源、运行资源、许可与验证见 FUN_TOOLS.md                       |
| 音频／文件       | `media-workspace/audio.js`、`file.js`                                      | 原素材、当前分析、输入失效与结果租约                                                                                                                             | 重音频算法交给 `audio-worker.js`；app 只连接服务                                                      |
| CyberChef        | `cyberchef-client.js`、`cyberchef.js`、`chef-tools/`                       | 官方 Worker 协议、完整配方、单任务控件；客户端保留一个空闲线程，归还时重置会话，正在执行时取消仍终止线程；`structured-result.js` 共用真实 Magic 候选与 JSON 投影 | 不修改 vendor 字节，不另写算法或改写候选评分；输入与结果归原控制器                                    |
| 综合计算与单位   | `qalculate/`                                                               | 唯一 Qalculate 内核、单位目录、请求和取消                                                                                                                        | 不复写换算倍率，不恢复退役定义工作表                                                                  |
| 函数绘图         | `function-plot/`                                                           | 用户明确使用的 Desmos 在线 iframe 及联网说明                                                                                                                     | 不声称离线，不恢复 Gnuplot 或旧绘图 Worker                                                            |
| 代码运行         | `coderunner/`、`services/code-runner/`                                     | 原页面拥有语言草稿、输入、取消及结果；本地 Worker 或可取消 HTTP 适配器执行，服务只运行白名单隔离容器                                                             | 不新增编辑器或笔记状态，不允许客户端指定镜像、命令、挂载；服务器默认关闭，构建及验收见 CODE_RUNNER.md |
| 实用计算         | `practical/`                                                               | 领域公式／参数、真实运算、结果、文献                                                                                                                             | 入口只组合视图，不接管所有领域状态                                                                    |
| 资料与科学       | `reference/`、`discovery/`、`atlas/`、`science/` 等                        | 完整固定资料、原对象、图形浏览、独立 Worker                                                                                                                      | 不用精选样本冒充完整资料库                                                                            |
| 中文资料层       | `reference-locale/`、`reference/chinese-search.js`                         | 固定中文名称和检索归一化                                                                                                                                         | 不改原始字段、不建立额外数据库                                                                        |
| 科普内容         | `knowledge/articles/`、`chapters/`、`topics.js`、`content.js`              | 完整机制、实例、文献；统一投影、校验、冻结和正文搜索                                                                                                             | 不导入 registry、UI 或运算引擎                                                                        |
| 科普发现与阅读   | `knowledge/catalogue.js`、`page.js`                                        | 自动生成的轻量目录；进入后加载完整正文                                                                                                                           | 不手填第二份目录，不裁剪正文换加载速度                                                                |
| 来源             | `project-sources.js`、`project-source-contracts.js`、`project-licenses.js` | 当前真实实现、关于目录、页末来源与精确许可                                                                                                                       | 不将规则文献、浏览器 API 或未运行依赖冒称接入                                                         |
| 在线查询         | `services/online-query/`、`public/online-query/`                           | 固定来源、明确提交、限流、取消与原始响应                                                                                                                         | 不提供任意 URL 代理，不随输入自动外发                                                                 |
| 单项文件分析     | `services/forensics/`、`public/forensics/`                                 | 独立容器执行、单项输入与参数、原字节结果、取消与完整下载                                                                                                         | 不运行全套自动扫描，不保存上传历史，不复制原浏览器图像控制器                                          |
| 反馈服务         | `services/feedback/` 与启动适配                                            | 已配置邮件反馈及自身生命周期                                                                                                                                     | 不成为本地工具／在线查询运行前提                                                                      |

所有路径省略 `public/` 前缀，明确写出 `services/` 的除外。这里给出职责，不表示每个大文件都已拆分完毕。

## 跨模块交接

一般使用单向、具名、参数明确的接口。特殊跨域导入在 `scripts/architecture-policy.mjs` 中逐条说明目的与直接回归，不增加“允许任意跨域”的白名单。

笔记事务队列拥有选择和存储，图稿控制器拥有场景。调用图稿或导航前先离开笔记事务队列，不能互相等待。导出和备份弹窗只拥有自己的表单状态；拆分后仍传入原队列，不能为了文件独立而复制当前笔记。

专题成员共享真实输入，方向、草稿、原字节、来源和取消仍由原控制器拥有。选择方向不采纳结果；只有“作为输入”显式采纳。PGP 私钥与公钥等同名字段不自动互换。

事件契约及当前引用者见 [事件清单](EVENT_CONTRACTS.md)。旧 DOM 桥仅作现有素材／参考对象的适配；新功能优先注入服务，不继续扩大全局 ID 读取。动态视图卸载时清理监听、对象 URL、Worker 与异步修订。

## 检查边界

`npm run audit:architecture` 检查第一方字面量导入、循环依赖与禁止跨界，并列出事件、动态资源和全局写入。它不是 JavaScript 语法解析器，也不能证明所有动态依赖和生命周期均正确。

`npm run audit:events` 校验 29 类真实页面事件的登记、字面量发送所有者及文档引用者。启动的 `arg:startup-ready` 另列为性能标记。`npm run audit:ui` 校验共享工厂、动效和样式所有权及生成产物；`npm run audit:knowledge` 确认轻量目录来自完整正文。

源模块边界改变后检查对应依赖边，再运行直接受影响的行为回归。具体执行范围服从 [测试规范](TESTING_POLICY.md)，静态检查不能代替真实功能输出、原字节保存、取消和失败恢复。

## 仓库其余文件的分工

前表是运行时职责。下面覆盖维护、交付和固定资源，不能因不在 `public/` 就不检查。

| 目录／文件                                                 | 所有者与边界                                                                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `scripts/server.mjs`、`start.mjs`                          | 本地 HTTP 与子服务生命周期；邮件和在线查询分别失败、取消和关闭，不让本地工具依赖服务就绪                       |
| `services/feedback/`、`services/online-query/`             | 各自拥有请求限制、输入校验和取消；不跨服务导入状态，不依赖浏览器 UI                                            |
| `scripts/build*.mjs`、`import*.mjs`、Python 导入脚本       | 固定输入到运行资源的可重复变换；改生成器后更新自产清单摘要，不重写官方引擎字节                                 |
| `scripts/*audit*.mjs`                                      | 来源、UI、科普、文档和模块契约检查；全仓文件清单包含服务、工具和历史，不把“读过文件”冒称已证明全部语义正确     |
| `scripts/test-map.mjs`、`affected-plan.mjs`、`verify*.mjs` | 行为到检查入口的登记；独立浏览器回归都纳入清单，辅助模块及兼容转发入口不重复登记                               |
| `scripts/browser-*.mjs`、`tests/`                          | 浏览器真实行为、纯模型、服务及测试夹具；按现行产品契约断言，不把旧选择器、动画引擎或默认偏好当作当前规则       |
| `tools/format/`、`pyproject.toml`                          | 固定开发格式工具；不进入网页包，安装内容被忽略                                                                 |
| `tools/ui-runtime/`、`upstream/`                           | 固定依赖与上游来源；维护入口可格式化，原始源码、许可与锁定字节不可随全局整理改写                               |
| `public/vendor/`、`fonts/`、`licenses/`                    | 官方或生成运行资源；按来源清单校验，不手工修包                                                                 |
| `deploy/`、`.github/`                                      | 已有部署配置与自动检查；修改文件不等于授权执行部署                                                             |
| `docs/archive/`、`history/`、`releases/`                   | 可追溯历史与已发布说明，不参与当前规则优先级                                                                   |
| `android-test/`                                            | 本机已有、尚未纳入 Git 的 Android 容器；本轮检查适配与测试，保留其未提交状态；不读取或提交忽略目录里的签名资料 |
| `outputs/`、`.reference-code/`、本机日志                   | 检查产物、参考快照和诊断记录；不作为产品源码提交                                                               |

全仓入口 `audit:repository` 逐个读取并计算文件摘要，检查第一方文本、JSON、根目录归属、浏览器路径，以及前端／服务端合并依赖图。第三方摘要只说明本次读取的字节，可信来源比对仍由 `audit:integrity` 的固定清单负责。

## 文件工作区与参数预设（2026-11-02）

- `public/file-workbench/catalog.js` 声明两个文件任务；`model.js` 拥有路径、限额、字节比较和单文件变换，`worker.js` 顺序执行与 ZIP 打包，`client.js` 拥有取消／超时，`page.js` 组合共享组件及当前结果。复用原 `round2/archive-engine.js` 的 ZIP 校验和固定 fflate，不复制解析器，不读取其他工具私有状态。
- `public/parameter-presets.js` 只拥有命名预设存储及组件；`tool-preferences.js` 继续拥有当前任务身份、参数资格判断及原控件事件回放。不保存自由文本、文件、密钥，不向路由写参数。最多 100 项、128 KB，清除工具参数时一并清除。
- 笔记侧栏移动原 notebook.panel，编辑与保存仍由原 page/store/editor 拥有。桌面可调整宽度，窄屏由共享 dock + 原生 dialog 负责焦点、可见区域和关闭，原任务保留。没有笔记时首次打开自动创建一篇，未增加第二套编辑或存储。
- 引擎阶段提示来自 CyberChef ready／bake、Qalculate Worker 初始化／计算、第四轮动态模块导入／初始化；不制造百分比，也不将加载完成当成计算成功。

### 2026-11-03 新手流程边界

`capabilities/routes.js` 统一事件跳转和链接跳转的子功能选择优先级：显式子功能、显式操作对应成员、专题默认成员。搜索仅添加选择意图，不修改目录默认项；`capabilities/search.js` 根据材料和意图的明确词组扩展检索，科普开关及类别边界保持。

`chef-tools/input-diagnostics.js` 只提供已知默认字符表的忽略字符说明及 AES 错误解释，不校验或修复算法输入，不猜测自定义字符表；真正的运算仍由原引擎处理。`result-view.js` 只转换预览，复制按钮注明文字／JSON／十六进制片段，下载与继续处理保留原始字节。`structured-result.js` 复用候选片段、诊断和完整数据，不合并或删去候选。

## 首页组成（2026-11-04）

`public/home-page.js` 只组合首页介绍、从统一登记抽取的工具推荐、固定 Base64 示例和帮助；推荐排除科普和上一批工具，均衡类别，经 registry 解析真实成员与方向，示例复用 engine.js 的 Base64 字节函数，不读取或覆盖工具草稿。`site-pages.js` 继续拥有收藏／最近使用与网站页装配；`capabilities/browser.js` 的 overview 模式从统一分类登记投影首页概览，完整组与搜索仍由原浏览器负责。样式由 `ui/styles/home.css` 与 `discovery.css` 生成，不改品牌令牌与动效所有者。
