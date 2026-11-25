# 迷雾工具箱

面向 ARG 与 Puzzlehunt 玩家的中文解谜工作台。当前同步版本为 **V2.3.5**，原创程序代码按 GPL-3.0-or-later 开源，第三方引擎、资料与素材保留各自许可证。

## 安卓版与 Windows 电脑版

两个客户端共用迷雾工具箱的网页工具与固定资料。安装包都可在离线状态下安装、启动并使用随包的本地工具。在线查询、服务器算力和反馈发送需要联网；客户端会在主动操作时连接迷雾工具箱的在线服务。笔记和设置按设备保存，可通过完整备份迁移。

| 平台 | 安装包 | 开源代码与构建 |
| --- | --- | --- |
| Android 9 及以上，需新版 Android System WebView | [下载 V2.3.5 Android 修订 3](https://github.com/tenrim/arg-tool/releases/download/v2.3.5-android-r3/Mist-Toolbox-2.3.5-android-r3.apk) | [Android 源码与构建说明](android-test/README.md) |
| Windows x64 | [下载 V2.3.5 Windows 修订 2](https://github.com/tenrim/arg-tool/releases/download/v2.3.5-windows-r2/Mist-Toolbox-2.3.5-windows-r2-win-x64-setup.exe) | [Electron 源码与构建说明](desktop/README.md) |

Windows 安装程序提供安装向导，支持选择安装范围和目录。安装程序未使用 Authenticode 签名。Android APK 使用项目原有发行证书，已有正式版可以覆盖安装。下载页提供 SHA-256 校验文件及该发行对应的源码。两个客户端的原创代码遵循 [GPL-3.0-or-later 授权说明](OPEN_SOURCE.md)，第三方组件保留各自许可。 [Android 发布页](https://github.com/tenrim/arg-tool/releases/tag/v2.3.5-android-r3) · [Windows 发布页](https://github.com/tenrim/arg-tool/releases/tag/v2.3.5-windows-r2)

## 本地部署

准备 Node.js 24+ 和 Python 3.12+，下载或克隆本仓库后执行：

```sh
npm run setup
npm start
```

`setup` 自动下载约 643 MB 的固定依赖包，校验整包及全部文件后生成 `dist/`。首次安装需要访问 GitHub；完成后普通本地工具、启动和构建不需要联网。根目录不需要安装 npm 运行依赖。Python 仅用于源码版依赖准备及检查。

打开终端显示的本机 HTTP 地址。不要双击 HTML 文件。`npm run build` 可重新生成静态目录，支持放在站点根目录或子目录；代码及 WASM 必须通过 HTTP/HTTPS 使用。

断网安装可先取得匹配的依赖发布附件，再执行：

```sh
npm run deps:install -- --archive /path/to/arg-tool-dependencies.zip
npm run build
```

自动下载支持断线重试和缓存。显式 `--url https://...` 可指定镜像，但文件仍须匹配仓库固定的大小、SHA-256 和逐文件摘要。详见 [依赖安装说明](docs/SOURCE_DISTRIBUTION.md)。

## 工具与数据

- 编解码、古典与现代密码、CyberChef 本地处理链，保留真实参数和原始字节。
- 图片、音视频、文件与 ZIP 处理，新增文件版本比较和批量处理。
- 综合计算器、单位换算、生活计算、完整选定资料库和逐项科普。
- 本机笔记、项目／标签、附件、历史版本、脑图和白板，支持完整备份。
- Gilbert 图片混淆、视觉密码、StegCloak、文字水印、兽音译者、佛又曰、图片声音转换、化物为图与二维码传文件。
- 原有浏览器本地代码运行继续可用；服务器语言、文件分析和在线查询按下节另行配置。

完整变更见 [更新日志](CHANGELOG.md)，来源与许可见 [第三方说明](THIRD_PARTY.md) 和工具内实际来源页脚。

## 可选服务与联网入口

`npm start` 管理网站和可选服务。默认不启用文件分析容器、多语言服务器沙箱或邮件反馈，不使用原站配置。纯静态 `dist/` 也能使用本地工具，但没有服务器 API。

Linux Docker 环境可执行以下独立准备命令：

```sh
npm run setup:forensics
npm run setup:code-runner
```

第二条命令会自动下载并校验固定编译器附件后构建镜像。这些维护构建需要联网及相应镜像源，不属于前端依赖包。启用变量、反向代理、上传与隔离限制见 [开源部署说明](docs/SOURCE_DEPLOYMENT.md)、[文件分析](docs/FORENSICS.md) 和 [代码沙箱](docs/CODE_RUNNER.md)。运行前明确配置自己的域名；不用 SSH 时无需任何 SSH 身份。

OEIS 等在线查询仅在主动提交时请求指定来源，使用边界见对应工具。Desmos 函数绘图首次进入时联网加载官方 iframe；它不是离线绘图引擎。源码版“报告问题”默认只在本机生成报告，可复制或下载；部署者可显式配置自己的同源邮件服务。

机器人计算接口可独立启动，配置方式见 [机器人计算服务](docs/BOT_TOOLS_API.md)。

## 开发与分支

开发入口见 [开发指导](docs/DEVELOPMENT_GUIDE.md)。格式与浏览器工具是可选开发依赖，网页主构建仍离线。固定第三方文件不能直接修改；维护导入及对应源码随依赖包完整提供。

服务器 `main` 使用 Gitee；此独立源码工作区的 `codex/open-source` 推送到 GitHub `main`。常规同步使用已提交快照和明确的发行适配，不合并服务器分支历史，不带入 SMTP、SSH 身份、Android 测试产物、玩家文件或本机研究输出。原创代码授权范围见 [OPEN_SOURCE.md](OPEN_SOURCE.md) 与 [LICENSE](LICENSE)。

## 赞助

如果工具箱帮到了你，欢迎通过 [爱发电支持 musicraft](https://afdian.com/a/musicraft)，支持后续维护。
