> 历史记录，仅用于追溯。现行规则见 [开发指导](../DEVELOPMENT_GUIDE.md)，不要按本页旧版本、旧部署状态或测试清单执行当前任务。

# 出行、财务算术与科普搜索偏好

本轮按用户要求新增三项出行计算、两项财务算术，并让普通工具搜索默认排除科普结果。完成范围为本地源码与本地预览；不变更 V1.7 版本号，不执行线上部署。

## 实际新增

| 工具 | 计算内容 | 公式依据 |
| --- | --- | --- |
| 行程与配速 | 路程、移动时长、平均速度、每公里配速互算；另加停留时间 | [OpenStax College Physics 2e §2.3](https://openstax.org/books/college-physics-2e/pages/2-3-time-velocity-and-speed) |
| 行程能耗与费用 | 燃油／电耗、能源费用、额外费用、每人及每公里费用 | [美国能源部 AFDC 车辆成本计算方法](https://afdc.energy.gov/calc/cost_calculator_methodology.html) |
| 反应与制动距离 | 匀速反应距离、恒减速度制动距离及时间 | [OpenStax College Physics 2e §2.5，Example 2.12](https://openstax.org/books/college-physics-2e/pages/2-5-motion-equations-for-constant-acceleration-in-one-dimension) |
| 利息与本息增长 | 单利、完整周期复利、本息、有效年利率 | [OpenStax Contemporary Mathematics §6.3](https://openstax.org/books/contemporary-mathematics/pages/6-3-simple-interest)、[§6.4](https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest) |
| 贷款还款计算 | 固定年利率、每月期末等额本息，完整逐期本金／利息／余额 | [OpenStax Contemporary Mathematics §6.8](https://openstax.org/books/contemporary-mathematics/pages/6-8-the-basics-of-loans) |

以上原始页面于 2026-10-31 核查。贷款教材 Example 6.78 的算式展开存在排印错误，本站使用其通用月供公式和第一题参数独立演算，不照抄错误展开式。本金 28500、年利率 3.99%、60 期的理论付款约 524.742275，向上取整到分为 524.75。原题币种为美元；本站以元展示同一无量纲利率公式，并明确本站逐分取整约定，不把教材金额当作汇率换算。

各页面下方常驻展示公式、变量单位、适用条件和参考链接；对应帮助及逐项科普完整登记。复制、下载及加入笔记包含条件、结果、公式、限制、参考链接，贷款还包含完整还款表。

## 计算和界面所有者

- `public/practical/travel-finance-model.js` 只拥有校验与公式。利率、单价由用户输入，不取银行、油价、地图或车辆服务。贷款使用整数分币和有理数计算月供，避免极小利率下的浮点相消；常规月供向上取整到分，每期利息四舍五入到分，末期据实结清。
- `travel-finance-data.js` 只保存逐工具公式、模型边界、算例和原始文献。它不作为第三方代码依赖登记。
- `travel-finance-view.js` 使用现有 UI 工厂与 `practical/form.js`，保留统一输入失效、离页取消和笔记租约。还款表默认折叠，展开后可横向滚动，不截断完整记录。
- 五项能力均由原 `PRACTICAL_TASKS` 投影到导航、目录、来源契约和 registry。原创实现的来源契约为 `urls: []`；没有复制参考项目代码或新增运行库，因此未伪造开源依赖。
- 配色、扫描线、标志、存储键和现有计算模块保持原有规则。

## 搜索偏好

新增 `searchKnowledge: false`，设置位于“设置 → 使用习惯 → 搜索中显示科普”。布尔值校验、旧备份默认值、设置导入导出、刷新恢复及重置沿用原偏好所有者。

顶部、侧栏、首页、分类总览和完整目录的普通非空搜索均按此开关筛选；过滤在精确匹配和模糊候选选择之前生效。空查询的浏览目录、显式科普分类搜索、独立科普目录和“相关科普”保持可用。纯元数据模型不读取偏好；应用装配层向目录及侧栏注入只返回布尔值的 getter，避免发现模块依赖偏好控制器。偏好变化即时刷新当前匹配，断开组件时移除监听。

## 固定参考编码

修改前按项目流程检索了 `SearchProject` 的搜索／偏好所有者，并检索 Qalculate 和 IT-Tools 后阅读命中源码。仅参考语义与职责划分，本站公式根据上述公开教材原创实现。

| 参考库 | 固定提交 | 路径与行号 | 使用范围 |
| --- | --- | --- | --- |
| [libqalculate](https://github.com/Qalculate/libqalculate) | `132d7b2f150de1ace81c02a93701a012e10fb97c` | `data/functions.xml.in:4787–4811`、`:4959–4970` | PMT 的逐期利率、期末付款语义，以及复利参数定义 |
| [IT-Tools](https://github.com/CorentinTh/it-tools) | `d505845f918e946ec300af7b36efc107e2f66e9e` | `src/composable/fuzzySearch.ts:7–31` | 公开数据、搜索词和选项分离，空查询保持原浏览数据 |

参考项目没有科普开关的现成实现，不将本次偏好逻辑冒称上游现成功能。固定克隆只用于本地参考，不进入运行包。

## 本轮验证

- `tests/travel-finance.test.mjs`：7 项计算与登记检查，覆盖教材算例、三种行程互算及配速、油电单位、制动平方关系、零利率、极小利率、分币守恒、末期结清、最长 1200 期、非法输入和逐项科普／帮助／来源契约。
- `tests/search.test.mjs`：7 项相关搜索模型检查，包括开关过滤、显式科普分类、空查询、精确／模糊优先级和登记对象不变。
- `tests/preferences.test.mjs`：8 项偏好检查，包括默认关闭、严格布尔校验和旧版备份默认恢复。首次执行 20 项通过、2 项测试预期修正后仅重跑失败项并通过：高利率逐分取整可能提前结清，契约字段的类型为 `{panel, urls, roles}`。
- `scripts/browser-travel-finance.mjs`：1440px、320px，深色；正常／减少动态。五项实际计算、参数切换、公式来源、无页面横向溢出、完整 1200 期、完整下载、笔记租约及离页失效均通过。普通搜索偏好覆盖设置即时变化、刷新、备份恢复及重置。计算与搜索未发出外部请求。
- 本轮 22 个应用模块的共享 UI 工厂及变动依赖边检查通过，没有相关循环或边界违规；不运行无关引擎、全站套件或打包。

后续调整只涉及搜索偏好的注入边界，计算实现不再改动；以 `TRAVEL_FINANCE_SCOPE=search` 单独复核五个搜索入口，两个视口均通过，保留默认完整浏览器检查能力。

本机 XERJ 已增量更新至 generation 31，604 个源码文件全部入索引，`code_files_junked=0`。跳过原有 AGENTS.md 的非代码解析候选及两份二进制测试附件，不涉及源码缺失。本地预览 `http://127.0.0.1:16332/` 返回 HTTP 200。
