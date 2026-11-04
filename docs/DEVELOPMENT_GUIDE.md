# 迷雾工具箱开发指导

现行入口，整理于 2026 年 11 月 1 日。产品版本由 `public/site-version.js` 提供，当前为 V2.0（2026 年 11 月 4 日更新）；文档整理不自动升级版本或部署网站。

## 先看什么

1. 先读本页和 [项目约定](PROJECT_CONTRACTS.md)，了解当前产品边界。
2. 阅读 [README](../README.md) 的运行说明，以及 [第三方说明](../THIRD_PARTY.md)。
3. 改哪个部分，再查对应规范；不要把历史报告里的整套检查当作本轮任务。

| 工作 | 直接参考 |
| --- | --- |
| 找代码所有者、判断文件分工 | [模块边界](MODULE_BOUNDARIES.md) |
| 页面、按钮、布局、动效 | [UI 规则](UI_DEVELOPMENT_RULES.md)、[组件接口](UI_COMPONENTS.md) |
| 添加功能、搜索、专题、路由 | [能力架构](CAPABILITY_ARCHITECTURE.md) |
| 笔记、白板、脑图 | [笔记本](NOTEBOOK.md)、[图稿](GRAPHICS.md) |
| 科普与计算依据 | [科普内容规范](KNOWLEDGE_CONTENT_RULES.md) |
| 借鉴开源实现 | [本地参考编码](REFERENCE_CODING.md) |
| 页面间通知 | [事件契约](EVENT_CONTRACTS.md) |
| 本轮要测什么 | [测试范围规范](TESTING_POLICY.md) |
| 服务器部署 | [部署说明](DEPLOYMENT.md) |

## 冲突怎么处理

按用户最新明确要求处理；要求未变化时，以本指南和项目约定为当前入口，专项文档负责细节。出现冲突时，核实明确决定的时间与当前实现，更新旧说法，不能仅凭文件修改时间认定规则已变。

`docs/archive/` 是历史方案、交接和验证记录，**不再作为当前操作指令**。其中的版本号、未提交状态、测试通过和部署结论只对当时有效。当前规范引用历史记录时，仅用于追溯依据。

本次已统一的易错点：

- 全站仍有五个分类；**输入关键词搜索默认排除科普**，设置可开启，显式选择科普分类也可搜索科普。空搜索的完整目录浏览仍保留所有分类。
- 函数绘图使用用户选择的 **Desmos 在线 iframe**，是明确许可的外站嵌入例外。旧本地绘图实现已退出，不恢复 Gnuplot；CyberChef 仍使用本站原生 UI 和本地 Worker。
- 笔记、脑图和白板是同一个笔记本工作区；全局右下角按钮可打开笔记本。图稿编辑区不恢复“用其他工具处理”。
- `app.js` 负责装配和导航，音频、文件业务状态由 `media-workspace/` 的控制器负责。
- 关于页展示版本历史，`site-version.js` 是当前版本号唯一来源。
- 历史文档中的“必须执行某整套测试”统一服从当前 [测试范围规范](TESTING_POLICY.md)。

## 修改的正常步骤

1. 检查分支、工作区差异和用户授权，保留无关修改与私密文件。
2. 找到原控制器、模型或组件所有者。功能或逻辑修改先使用参考编码检索，记录参考库、固定提交、路径与行号，核实实际接口和许可。
3. 在原所有者修复问题。通用问题修公共组件；单工具参数和草稿留在该工具；不复制数据库、输入节点或任务目录。
4. 同步更新来源、科普、使用说明以及当前契约中实际受影响的部分。
5. 格式化修改的源码；对改变的行为选最小必要验证。失败先查原因，不删断言或缩减功能来换取通过。
6. 交付时区分本地修改、Git 提交、Git 推送、网站部署。提交标题和正文使用中文，只在授权范围内推送或部署。

## 格式与生成文件

源码统一约定：UTF-8、LF、JavaScript／CSS 两空格缩进、Python 四空格缩进、JavaScript 单引号、常规行宽 100。`.editorconfig` 和固定版本 Prettier 配置是工具入口。

```text
npm ci --ignore-scripts --prefix tools/format
npm run format:check
npm run format -- public/notebook/page.js
```

默认范围 `tools/format/scope.json` 覆盖全部第一方前端、服务端、维护脚本、测试和公共样式；新增这些目录中的源码会自动纳入。Python 文本读写显式指定 UTF-8，避免 Windows 默认编码破坏中文资料；维护脚本使用固定版本 Black，运行 `python scripts/format-python.py --check` 检查、去掉 `--check` 整理。先执行 `python -m pip install --target tools/format/python -r tools/format/requirements.txt` 安装隔离的开发工具。固定第三方、原始数据、生成产物和历史记录保留各自来源与生成流程，不改写上游字节。主构建仍不需要安装格式工具。

| 可编辑源 | 生成产物 | 生成与检查 |
| --- | --- | --- |
| `public/ui/styles/*.css` | `public/ui/components.css` | `npm run build:ui`；`npm run audit:ui` 检查是否过期 |
| `public/knowledge/articles/`、`chapters/` 与内容投影模型 | `public/knowledge/catalogue.js` | `npm run build:knowledge`；`npm run audit:knowledge` 检查是否过期 |
| `scripts/event-contracts.mjs` 与实际事件引用 | `docs/EVENT_CONTRACTS.md` | `node scripts/audit-events.mjs --write`；`npm run audit:events` |

公共样式仍以单个文件提供给网页，保持现有配色、扫描线、规则次序与状态优先级。分片只改善内部维护；不要直接改生成产物，也不要在最后追加页面补丁。文件顺序由 `scripts/ui-style-source.mjs` 明确登记，新增分片必须登记，未登记分片不享有公共组件外观权限。

科普目录从完整、经过校验的正文自动生成，不手工维护第二套标题或功能清单。首页、工具目录和全局搜索只读目录，打开科普时才加载正文。生成与测试仍检查全部成员、例子、文献和功能对应；按需加载不能裁剪内容。

## 测试与本地服务

Node.js 要求 24 或更新版本。正常运行仍使用 `npm start`；主构建为 `npm run build`，保持离线。格式工具和浏览器工具分别在 `tools/format`、`test-tools` 安装，不变成生产依赖。

需要启动完整网站的浏览器回归复用 `scripts/browser-test-site.mjs`，自行占用随机回环端口并在结束后关闭，不要求开发者先开 16332，也不关闭用户自己的服务。测试服务不启动邮件或在线查询；浏览器上下文与真实笔记隔离。`CHROMIUM_PATH` 可指定本机浏览器，未设置时使用 Playwright 已安装的浏览器。

```text
npm ci --ignore-scripts --prefix test-tools
npx --prefix test-tools playwright install chromium
node --test tests/notebook-management.test.mjs
node scripts/browser-notebook-management.mjs
```

直接运行浏览器脚本时，Node 需要能解析 Playwright；可将 `NODE_PATH` 指向 `test-tools/node_modules`。自动验证入口和 CI 已管理此路径。按实际修改选择测试，不因为指南列出命令就全部执行。`verify:all` 只用于明确的整站验收。

## 这次整理的参考依据

临时测试网站的生命周期参考 IT Tools：仓库 `CorentinTh/it-tools`，固定提交 `d505845f918e946ec300af7b36efc107e2f66e9e`，`playwright.config.ts` 第 4–5、61–68 行。本站适配自己的 `createDevServer`，没有复制上游测试配置或增加生产库。

格式配置参考 [Prettier 安装说明](https://prettier.io/docs/install) 和 [配置说明](https://prettier.io/docs/configuration)，开发工具锁定 3.9.10。格式工具不属于网页实际依赖，不添加到工具来源页脚。

## 保持交接可靠

每次交接说明实际修改、实际验证、未完成事项和 Git／部署状态。历史日志进入归档，现行规则只在对应所有者维护；不要继续在多个文档末尾追加相互矛盾的“本轮新规则”。全仓检查入口为 `npm run audit:repository`，逐文件清单和全局结果见 [全仓维护报告](GLOBAL_MAINTENANCE_2026-11-01.md)。此前核心整理记录见 [上一轮维护结果](MAINTENANCE_2026-11-01.md)。
