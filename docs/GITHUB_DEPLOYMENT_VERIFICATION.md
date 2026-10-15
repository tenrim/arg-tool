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

独立获取的源码加匹配依赖包，在真实静态 HTTP 下可运行，不依赖原 main 工作区。当前尚不能宣称陌生用户可直接公开下载部署：GitHub 仓库仍是私有，配套依赖 ZIP 尚无公开下载地址。仓库可见性与发布附件需要完成后，再复测匿名下载链路。

本轮运行环境为 Windows、Node.js 24.19.0、Python 3.14.0 和本机 Chrome。PC／手机指浏览器视口；不是实体手机或 Linux 服务器验收。本机没有可用 Docker，WSL 发行版列表失败，因此没有虚构 Linux 实测结果。
