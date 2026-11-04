# 独立开源版部署

此版本同步 main 已提交的 `183968f3df695564ed3be57b611ed460d6f03a56`（V2.0）。不包含原站账号、服务器连接或部署环境；以下步骤供部署者准备自己的服务。

## 前端与本地工具

Node.js 24+、Python 3.12+，在根目录执行 `npm run setup`、`npm start`。固定依赖只在准备时下载，完整安装后启动与普通构建离线。静态托管直接使用 `dist/`；子目录部署也保留真实资源相对位置。默认问题报告只复制／下载，不发邮件。

## 服务器文件分析

需要可调用 Docker 的 Linux 网站主机。从仓库根目录执行 `npm run setup:forensics`，该命令使用随包的固定 AperiSolve 分析器与构建材料，并在构建时安装镜像内系统依赖；它不会运行玩家任务。

设置 `FORENSICS_ENABLED=1`，公开站点再设置 `FORENSICS_ORIGINS=https://your.example`，然后执行 `npm start`。默认镜像为 `mist-forensics:20261104-limit20`，可用 `FORENSICS_IMAGE` 改为自己的固定镜像名。本地同端口 localhost／127.0.0.1 自动允许；默认不允许原站域名。

代理 `/api/forensics/run` 到同一个 Node 进程，请求体上限至少 28 MB、读取超时至少 260 秒。原文件仍限 20 MB，每项最多 240 秒。用户明确提交才上传，独立无网络容器执行，停止／离页取消。完整参数、原始输出和恢复文件保留。具体边界见 [文件分析说明](FORENSICS.md)。

## 多语言代码沙箱

同样需要 Linux Docker，主机还需提供 `curl`。根目录执行 `npm run setup:code-runner`，自动按 `services/code-runner/ARTIFACTS.json` 下载并校验 Kotlin／Scala／PowerShell 附件，再按 Dockerfile 构建 `mist-code-runner:20261103`。Docker 基础镜像、apt 与 npm 构建源需要可访问；这不是预编译镜像分发，不宣称整个系统依赖树逐字节可复现。

设置 `CODE_RUNNER_ENABLED=1` 和公开站点的 `CODE_RUNNER_ORIGINS=https://your.example`，再执行 `npm start`。可用 `CODE_RUNNER_IMAGE` 指向自己的固定镜像。代理 `/api/code/run` 到同一个 Node 服务，保留 4 MB 请求限制和至少 125 秒读取超时。默认关闭时本地语言仍可使用。详见 [代码沙箱](CODE_RUNNER.md)。

两个服务均直接使用本机 Docker 为默认方式；只有显式选择 `*_TRANSPORT=ssh` 时才用 SSH，而且必须设置自己的 `*_SSH_HOST`，没有原站别名或身份兜底。不开启这些服务，不需要 Docker 或 SSH。

## 在线查询与邮件

根目录服务器保留独立在线查询服务，查询仅在玩家主动提交时发送。上游的限流、许可及实际可用性以对应工具说明为准，不承诺永久可用。Desmos 是另外的官方 iframe，不由本站代理。

可选邮件需填写私密 `services/feedback/.env`，模板为同目录 `.env.example`；设置自己的 SMTP 和准确允许来源，配置不进入 Git 或 `dist/`。同时将 `public/deployment.js` 的 `feedbackEndpoint` 从空字符串改为同源相对地址 `./api/feedback`，再构建。浏览器不能填写 SMTP 密码。只配置服务但不改此前端开关时，界面仍保持本机报告。

## 同步依据与本轮验证

原创文件和固定依赖分别来自上述提交，未纳入主工作区未提交的 Android 修改。清单与实际验证见 [同步记录](SOURCE_SYNC_V2.0.json)；旧版记录保留历史含义，不能当作本轮结果。

本轮反馈适配先通过本机 XERJ 检索 `mountFeedback`，定位主项目 `public/feedback/ui.js:21`。核对 CyberChef 固定提交 `11b86fecdb5d8f6244cf931e1f87cec887ec1f1f` 的 `src/web/waiters/ControlsWaiter.mjs:400–429`；其问题报告生成状态链接，本站继续采用原报告模型及本机默认方式，没有复制上游实现或将玩家输入写入链接。

## CI 验证范围

普通提交继续按实际文件选择检查，未知文件仍阻止执行。导入新的固定源码快照时，先保留完整候选计划及未知文件检查，再执行明确的分发检查：完整性、模块边界、安装器与服务契约、构建，以及真实 HTTP 根目录／子目录的桌面与手机部署验证。该检查验证固定资源、代表性引擎、笔记和源码版反馈，不宣称逐项复测全部工具。分发验证入口或 CI 配置本身改变时也执行这组分发检查。手动 full 入口继续保留。

## 本轮 Windows 干净安装限制

2026-11-04 本机两次从 Git 源码归档安装依赖时，同一份上游 PHP 示例 `upstream/expansion/ggmorse/source/examples/ggmorse-to-file/ggmorse-to-file.php` 在校验通过后消失；一次发生于临时暂存目录，另一次发生于最终目录。安装器按预期失败，没有跳过缺失文件或伪报成功。尚未确定外部删除来源；部署者遇到同类情况应检查文件保护或清理日志，不要关闭校验或运行不完整的安装。该原始示例及固定摘要完整保留在依赖 ZIP，未修改、删减或执行。已有完整工作区的构建及四种实际部署测试通过；独立 Linux CI 的结果以对应运行记录为准。
