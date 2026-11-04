# 本地参考编码

2026-10-24 按用户要求安装 XERJ，并将检索加入本项目开发流程。官方说明：[XERJ 文档](https://xerj.org/llms.txt)。安装版本为 `v1.0.0-rc.98`，官方安装器已校验发行包 SHA-256。

## 位置与范围

- 程序：`%LOCALAPPDATA%/Programs/xerj/xerj.exe`，已加入当前用户 PATH；新终端可直接调用。
- 节点：`http://127.0.0.1:19200`；配套端口为 19201、19202，仅监听本机。
- 数据、日志、进程号与增量状态：`%LOCALAPPDATA%/XERJ/arg-tool/`，位于被索引项目之外。
- 本机参考仓库：`.reference-code/repos/`，被 Git 忽略，不进入网页运行包。
- 仓库 URL、固定完整提交、许可和检索前缀：`tools/reference-code.json`。
- 本站源码：前缀 `mistprojectv2`，由 `.xerjignore` 排除 vendor、upstream、outputs、Android 测试产物等。已存在的 Android 开发文件与 `.gitignore` 修改继续保留。
- 2026-11-01：新增公共样式分片作为可编辑源码索引；排除重复的 `ui/components.css`、`knowledge/catalogue.js` 生成产物、格式工具 JSON 清单和已退出现行规则的 `docs/archive/`。这些文件仍保留在仓库，可直接读取；不清空参考库或既有索引。

索引采用本机 BM25 和代码标识符分词，使用 `--no-semantic`，不是神经语义检索。不启用分享、云端重排、外部嵌入或反馈上传。没有安装参考仓库的 npm 依赖，也没有执行其中的项目代码。

| `-Repo` | 参考项目 | 优先解决的问题 |
| --- | --- | --- |
| `cyberchef` | GCHQ CyberChef | 配方、Worker 消息、二进制结果、错误与取消 |
| `ittools` | CorentinTh IT-Tools | 多工具组织、表单、校验、换算及日期操作 |
| `omnitools` | Omni Tools | 浏览器内媒体文件处理、结果展示、Hook 生命周期 |
| `animateui` | Animate UI | 进入、折叠、减少动态、焦点与交互状态 |
| `qalculate` | libqalculate | 数值解析、精度、表达式与单位运算 |

参考仓库为本轮获取的快照，可能不同于本站已接入版本。借鉴前必须核对本站固定运行包，不自动更新产品依赖。IT-Tools 使用 GPL，libqalculate 使用 GPL-2.0-or-later，Animate UI 有 Commons Clause；具体以各文件声明为准。检索到代码不等于允许直接复制；真实复用仍遵循原有来源与许可流程。

## 使用

在项目根目录执行：

```powershell
# 节点不在时启动；已有节点不会被替换
./scripts/reference-code.ps1 -Action Start
./scripts/reference-code.ps1 -Action Status

# 先查本项目的实际所有者
./scripts/reference-code.ps1 -Action SearchProject -Query 'animatePageEntrance'

# 再查最相关上游；优先使用代码中的符号或英文术语
./scripts/reference-code.ps1 -Action SearchReference -Repo animateui -Query 'ReducedMotionConfig Effect'
./scripts/reference-code.ps1 -Action SearchReference -Repo cyberchef -Query 'BackgroundWorkerWaiter'
./scripts/reference-code.ps1 -Action SearchReference -Repo omnitools -Query 'useDebounce cancel'
./scripts/reference-code.ps1 -Action SearchReference -Repo qalculate -Query 'convertToBaseUnits'

# 本站源码变更后增量刷新；不会触碰产品文件或删除已有索引
./scripts/reference-code.ps1 -Action IndexProject

# 刷新指定参考库；固定提交不符会拒绝，不自动拉取新版本
./scripts/reference-code.ps1 -Action IndexReferences -Repo ittools
```

先读检索命中的函数和直接相关测试，再写修改。记录仓库、提交、路径、行号，以及采用或不采用的原因。无命中时调整一次术语，再查看具体文件，不为凑参考遍历全部仓库。文案、格式和已知精确事实不强制检索，测试仍按 `TESTING_POLICY.md` 只覆盖修改及直接影响。

首次到另一台机器时，用官方安装器安装并校验 XERJ，按 JSON 清单浅克隆五个仓库到上述目录，获取清单中的提交并检出，再执行 Start、IndexProject 和 IndexReferences。克隆遇到直连问题时可沿用电脑已有系统代理，但不写入全局 Git 配置。禁止为更新快照清理或强制重置已有改动。

## 本版本解析边界

XERJ rc.98 会将部分 Vue 单文件组件按 XML 提取，造成内容缺失。`IndexReferences` 为 IT-Tools 和 Animate UI 的 Vue 文件建立 `xerj-plain-source/` 完整文本视图，并补入被跳过的旧生成注册表。原始源码不改动，视图第一行记录原始路径；**视图行号减 3 即原文件行号**。命中后回到原文件确认，不把视图当成独立实现。

退出码 3 表示存在跳过项，不能忽略具体原因。本轮首次项目索引只跳过两份音视频测试素材；参考库的 Vue 跳过项通过文本视图补齐，libqalculate 的空 ChangeLog 保持跳过。若出现 `datasets_refused` 或源码拒收，先核对原因，不删除其他索引或假称完整成功。

该版本的增量索引不支持任意结构化字段演化：本轮新增参考清单 JSON 曾触发此限制，已将该开发工具元数据排除，清单由脚本直接读取。其他新结构化文件若触发同样限制，应在新 prefix 和独立 state-dir 建库验证后再切换查询，保留旧库；不要用 `--fresh` 或删库掩盖问题。

最终增量运行的产品代码全部入库；该版本还把修改后的根 `AGENTS.md` 误判为 YAML 并跳过。因此项目规则仍须直接读取根文件，不能依赖检索结果代替规则读取。最终跳过项为该文件和上述两份音视频素材。

本轮安装、计划、进度与查询证据保存在 `outputs/xerj-setup-20261024/`，不纳入 Git。此次仅配置开发检索流程，没有修改、部署或推送网页产品。

## 2026-11-01 全仓格式整理后的索引迁移

XERJ rc.98 拒绝把已有文件从 `txt-prose` 改为 `txt-lines`；这是格式整理导致的分类变化，不是源码缺失。按照工具的 RESUME POLICY，新建独立的 `mistprojectv2` 前缀和 `state/project-v2` 状态目录，验证后切换本项目检索入口。原 `mistproject` 索引、旧状态和全部参考仓库原样保留，没有清空或覆盖。

`tools/reference-code.json` 的 `projectPrefix` 与 `projectStateId` 是当前检索和增量更新的唯一配置。其余参考库仍使用原前缀。首次迁移记录：634 个代码文件全部接收，拒收源码为 0；两份音视频测试夹具作为二进制跳过，不进入源码检索。
