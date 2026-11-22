# 迷雾工具箱 Windows 离线测试版

安装包适用于 Windows x64。它随包提供 Electron、整站静态资源、计算引擎、词库、固定资料和相关许可。可断网安装和首次启动。

编解码、图片和音视频处理、固定资料、笔记、脑图、白板以及现有的 10 种本地语言使用原网页实现。网页版笔记可先导出完整备份，再从桌面版的笔记本导入。服务器文件分析、服务器语言、在线查询、Desmos、网络配方操作和报告发送联网时使用原有服务，断网时仍可使用本地工具。

## 构建

在项目根目录使用 Node.js 24 或更新版本执行。固定网页依赖通过 Python 3.12 或更新版本准备。

```powershell
npm.cmd run deps:install
npm.cmd ci --prefix desktop
npm.cmd run dist --prefix desktop
```

首次构建需要获取固定的 Electron 及 NSIS 打包工具。构建使用项目主构建产出的 `dist/`，安装包和 SHA-256 文件写入 `outputs/windows-offline/`。测试包按当前用户安装，版本来自 `public/site-version.js`，未使用发行证书签名。

## 验收

在具有管理员权限的 Windows PowerShell 中运行下列命令。浏览器测试使用 `test-tools` 的 Playwright。

```powershell
npm.cmd ci --prefix test-tools --ignore-scripts
./desktop/test-install.ps1 -Installer ./outputs/windows-offline/Mist-Toolbox-2.3.5-offline.3-win-x64-setup.exe -Online
```

验证脚本为安装器、已安装程序和独立联通性探针临时添加 Windows 出站阻断规则，只保留回环连接用于本地资源和自动化。断网测试进程同时禁用代理，避免经由本地代理外联。脚本先确认阻断前后的连接差异，再在独立目录安装、运行功能回归、逐文件比较安装后的网页资源与构建产物。带 `-Online` 时恢复测试应用的出站连接，沿用同一配置抽查在线功能。完成后卸载本轮测试实例并移除本轮防火墙规则。

## 运行方式和来源

- 本地 HTTPS 服务仅绑定本机回环的随机端口。证书与会话密钥启动时在内存中生成，Electron 只信任此次本地地址的证书。应用保留上一版的 HTTPS 源和 IndexedDB，外网请求由 Chromium 处理，桌面会话的 HTTP 和 HTTPS 代理沿用系统为工具箱站点解析的默认值。沙箱及上下文隔离继续启用。
- 线上 API 沿用 Android 客户端的接口约定，见 `android-test/src/cn/mistarg/toolbox/test/ApiTransport.java:14`、`ApiTransport.java:49`。桌面将当前 7 个查询入口、代码、文件分析及反馈的 JSON 请求发送到正式站，支持图片综合分析的 NDJSON 流。CyberChef 联网操作沿用固定上游 `11b86fecdb5d8f6244cf931e1f87cec887ec1f1f` 的 `src/core/operations/HTTPRequest.mjs:106`、`src/core/operations/DNSOverHTTPS.mjs:109`。
- 静态路径和类型处理参考本站基线 `7657f180fb7156c8c074ad3ee54c26dd09ff66e7` 的 `scripts/server.mjs:46`、`scripts/server.mjs:153`。桌面进程只复用静态服务的边界和资源格式，未引入网站服务端。
- 保留本站固定 FFmpeg WASM 加载，见 `public/video/runtime.js:5`。对照 Omni Tools `60bc64f5a6974f3c802c5ec06cb3cf7f824485e1` 的 `src/lib/ffmpeg.ts:1`、`src/lib/ffmpeg.ts:15`，其 CDN 取资源方式未采用。
- 运行时固定为 Electron 45.4.1，证书使用 node-forge 1.4.3。打包工具 electron-builder 26.18.0 仅用于开发构建。 [Electron 固定版本](https://github.com/electron/electron/releases/tag/v45.4.1) · [Electron 会话接口](https://www.electronjs.org/docs/latest/api/session) · [node-forge 固定版本及许可](https://github.com/digitalbazaar/forge/tree/v1.4.3) · [NSIS 打包配置](https://www.electron.build/docs/nsis/)
