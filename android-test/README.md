# Android 构建与验收

迷雾工具箱的原生 Android 容器复用完整静态站点，使用应用内 HTTPS 资源、WebView、Worker 与 WASM。容器、网络和持久化适配为本站原创，没有新增第三方网页运行依赖。图标由现有 `public/favicon.svg` 的路径制作，保留原品牌配色；所有随站资料、固定源码和许可完整打包。

## 构建

准备 Node.js 24+ 和 Python 3.12+，在 Windows PowerShell 从仓库根目录执行：

```powershell
npm run setup
./android-test/build.ps1 -Variant Test -AndroidRevision 1
```

自编译首次验证可用 Test 应用 ID，与正式安装并存。维护者可用 Release 和自己的签名目录构建正式包。工具目录为忽略的 `outputs/apk-build/tools/`：将 JDK 21、Android SDK platform 36、build-tools 36.0.0 分别解压或放在 `jdk/`、`platform/`、`buildtools/` 下的一个子目录中。ADB（`platform-tools/`）仅用于设备验收。`-Tools` 可指定具有相同目录布局的工具目录。不修改系统 Java 或全局 SDK 配置。Windows 旧 aapt 无法正确编码部分中文资源文件名，因此先编译清单／图标，再以 Java ZIP 写入原始 UTF-8 资源路径。

| 模式 | 应用 ID | 签名 | 调试 |
| --- | --- | --- | --- |
| Release | `cn.mistarg.toolbox` | 独立发行密钥 | 关闭 |
| Validation | `cn.mistarg.toolbox` | 同一发行密钥 | 开启，仅供本机 ADB 验收 |
| Test | `cn.mistarg.toolbox.test` | 原测试密钥 | 开启 |

Release 显示名称为“迷雾工具箱”，验收／测试包带对应后缀。Java Activity 保留原类名，以完整类名注册，不决定用户看到的产品名。版本来自 `public/site-version.js`；Android versionCode 为 `major*1000000+minor*10000+patch*100+AndroidRevision`。同一网站版本的后续 APK 修订递增 AndroidRevision（1–99），不虚构网站新版本。更新使用相同应用 ID 和发行密钥。

## 自有签名

自定义发行签名目录可通过 `-SigningDirectory` 提供，包含 `mist-toolbox-release.p12`（别名 `misttoolbox`）和 `signing-password.txt`。指定路径时构建只读现有签名材料。省略该选项时，Release 使用 Git 忽略的本地签名目录；首次构建会创建独立密钥。自行签名的 APK 使用不同证书，无法覆盖安装维护者发布的同应用 ID APK。Test 构建可与正式版并存。

## Android 行为

- 本地资源源保持 `https://appassets.androidplatform.net`。通过应用内资源响应，在原始 index 的 head 前部装配本站三个 Android 适配脚本，先恢复偏好再初始化页面；ZIP 中的站点文件字节不改。
- `storage.js` 仅镜像当前应用的 localStorage 到同步提交的 Android 私有偏好存储，防止刚修改设置后进程立即被终止时尚未落盘。原键名、设置备份格式不变，sessionStorage 不镜像；笔记继续使用原 IndexedDB，不新建笔记数据库。
- 麦克风声明 RECORD_AUDIO 和 WebRTC 所需 MODIFY_AUDIO_SETTINGS。只为本站本地源、且仅 AUDIO_CAPTURE 请求触发系统授权；不自动申请，不授予摄像头。取消请求、退到后台和页面退出会拒绝未完成的授权或停止已有音轨。录音由原控制器保存，音频不自动上传。
- 文件选择使用系统选择器。Blob 导出分块写临时文件，通过系统“保存到”写入用户明确选择的位置；取消后可再次导出，单次上限 128 MiB，超限明确失败。保存对话框跨 Activity 重建保留待保存文件；文件选择无法恢复时明确提示重新选择。
- 外部网站在系统浏览器打开；应用内远程资源保持阻止。Desmos 使用页面中“在新标签页打开 Desmos”的入口进入手机浏览器，APK 不内嵌远程 iframe。在线请求仅放行固定 HTTPS 服务器 `https://www.tool.mistarg.cn` 上既有 9 种查询、反馈及 `/api/code/run`、`/api/forensics/run` 的 JSON POST，不提供任意 URL、重定向或 Cookie 转发，不含 SMTP 凭据。
- 在线提交、查询取消、结果失效、原始记录、报告编号和附件仍归原网页控制器。原生并发最多 4 个；查询请求 8 KiB、反馈请求 6 MiB、代码请求 4 MiB、分析请求 28 MiB（包含 Base64 开销，原文件仍最多 20 MiB）。完整响应限额分别为查询／代码 8 MiB、反馈 64 KiB、分析 92 MiB；原生按块传递后由网页重组完整 UTF-8，超限或中断不发布部分结果。图片综合分析使用 NDJSON，响应头到达后即交给网页，可逐项显示进度和结果。停止、流读取取消、离页、超时和失败会关闭原生连接，忽略迟到的结果。主文件与附件合计最多 20 MiB。
- 查询／反馈的网页总超时为 45 秒；代码 135 秒；分析 360 秒，分别对应原生读取超时 35、125、330 秒。保留状态和 Retry-After，取消会断开原生连接，失败不自动重试。服务器是否启用和实际执行结果以服务器响应为准，打包不部署服务。

## 验证入口

```powershell
node --test --test-isolation=none android-test/network.test.mjs
node --test --test-isolation=none android-test/runtime.test.mjs
node --test --test-isolation=none android-test/storage.test.mjs
./android-test/verify-package.ps1 -Apk outputs/apk-build/迷雾工具箱-V2.3.5-正式版.apk
```

最低可安装 Android 9（API 28），目标 API 35。运行需要新版 Android System WebView。安装包、源码及校验文件见 [Android 发布页](https://github.com/tenrim/arg-tool/releases/tag/v2.3.5-android-r2)。
