# GitHub 源码独立部署实测

测试日期：2026-10-15。实际取回的 GitHub main 提交：`66a2280c931fa59f3c3d045a48d4370ee9e46708`。

## 获取与构建

测试开始时，GitHub 仓库实际为 private。匿名 GitHub API 请求返回 404；使用当前账号读取确认 private=true。普通 Git 连接两次失败，分别为连接重置与连接超时，未将其误判为源码问题。

随后通过 GitHub 官方 API 取得远端提交号和源码 ZIP，在全新目录解压。源码来自远端，不是复制本地 main 或当前工作树。依赖由本地已经导出的配套 ZIP 安装；因此本次没有验证公共依赖附件的在线下载。

干净目录安装 3,292 项固定依赖成功；npm run build 的前置依赖校验、3,062 项来源／运行文件哈希和 88 条许可登记均通过，dist 构建成功。

## 真实静态 HTTP 测试

新增 scripts/browser-deployment.mjs 将指定 dist 作为唯一文件根目录，通过普通 Node HTTP 服务器提供静态文件。Playwright 的网络规则只放行该服务器，不用 route.fulfill 模拟文件响应，不回退到 public 或其他工作目录，不访问运行时 CDN。

以下场景全部通过：

| 路径 | 视口 | 动效设置 | 实际结果 |
| --- | --- | --- | --- |
| / | 1440px | 正常 | 字体、CyberChef Base64、国家查询／国旗、Python WASM、FFmpeg 视频提帧、本地报告 |
| / | 390px | 减少动态 | 字体、CyberChef Base64、国家查询／国旗、QuickJS WASM、本地报告与手机抽屉 |
| /toolbox/ | 1440px | 减少动态 | 字体、CyberChef Base64、国家查询／国旗、Python WASM、FFmpeg 视频提帧、本地报告 |
| /toolbox/ | 390px | 正常 | 字体、CyberChef Base64、国家查询／国旗、QuickJS WASM、本地报告与手机抽屉 |

每项均断言真实输出、无缺失文件、无页面异常、无意外外联及子目录资源不逃逸。原浏览器测试策略与架构单元检查也通过；部署回归已登记到统一 browserSuites，完整验证会保留该项。

## 复测

安装匹配依赖后运行：

```sh
npm run build
npm ci --ignore-scripts --prefix test-tools
npm run verify -- --files scripts/browser-deployment.mjs
```

可用 CHROMIUM_PATH 指定已安装的 Chrome／Chromium。ARG_DEPLOYMENT_DIRECTORY 可指定其他已构建的 dist 目录；默认使用当前目录的 dist。完整验证会先构建，再执行本项。

## 结论与边界

初次测试确认独立获取的源码加匹配依赖包可在真实静态 HTTP 下运行。当时发现的私有仓库和依赖附件缺口，已在后续自动准备更新中补齐，见下文。

初次测试环境为 Windows、Node.js 24.19.0、Python 3.14.0 和本机 Chrome。PC／手机指浏览器视口，不是实体手机验收。本机没有可用 Docker 或 WSL；后续 Linux 验证通过 GitHub 官方 Ubuntu runner 完成，见下文。

## 自动准备依赖与 Linux 验证

源码仓库现已公开，固定依赖通过 [GitHub Release](https://github.com/tenrim/arg-tool/releases/tag/dependencies-6ab6aea) 提供。默认安装首选官方附件 API，备用为同一文件的 GitHub 发布下载地址；URL、精确尺寸及 SHA-256 在 dependencies.lock.json 固定。不会从 latest 或不匹配版本静默取文件。

```sh
npm run setup
npm start
```

setup 完成依赖下载、校验、安装与静态构建。已安装依赖完整时直接跳过联网；离线 ZIP、本地目录导入和使用者显式指定的同哈希 HTTPS 镜像继续支持。下载只写本地缓存及清单列出的依赖路径，不读取 GitHub 凭据。

[Ubuntu CI（c5bf9d4）](https://github.com/tenrim/arg-tool/actions/runs/38742035670) 已通过，并从实际日志核实：自动下载并安装 3,292 项依赖、构建 dist，随后完成根路径／子目录 × 桌面／手机的四种真实 HTTP 部署回归，7/7 受影响检查通过。包含 CyberChef、Python/QuickJS、国家查询／国旗、FFmpeg 提帧及默认本地报告，非仅检查页面能否打开。

安装器回归现为 12 项，包含损坏文件、越界／符号链接、尺寸限制、缓存复用、重试与官方备用入口切换、HTTPS 降级拒绝，以及已有依赖时不联网。

本机匿名实测还发现常规 GitHub 发布下载路径连接缓慢；同一文件的官方 API 入口可匿名读取，因此将其设为默认，并保留备用入口、下载进度与每次下载总时限。此修复没有改变任何上游运行字节或锁定哈希。

最终官方 API 优先版本 bb31073 的 [Ubuntu 验证](https://github.com/tenrim/arg-tool/actions/runs/38743110330) 也已成功。已通过日志复核自动安装 3,292 项文件、静态构建及四种真实 HTTP 场景，2/2 本轮受影响检查通过。结构化证据见 [自动准备验证](github-online-setup-verification.json)。

本机另以匿名请求取得公开的 bb31073 源码，在无依赖／无缓存目录启动 setup，确认依赖通过公开接口开始下载；本机链路较慢，因此没有将这一下载过程写成完成。完整在线流程验收以已完成的独立 Ubuntu runner 为准。
