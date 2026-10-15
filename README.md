# ARG 工具箱 · 迷雾工具箱源码版

可自行部署的中文 ARG / Puzzlehunt 解谜工作台。保留编解码与加解密、资料查询、图片音视频与文件处理、其他工具和科普五类入口；常规处理在浏览器本地执行。

此分支只分发原创实现、适配与构建脚本、测试、来源和许可记录。第三方引擎、原始源码、字典、数据和字体单独放在依赖包中，不进入源码 Git 历史。原创程序代码为 **GPL-3.0-or-later**；第三方各自许可不变。详见 [LICENSE](LICENSE)、[开源范围](OPEN_SOURCE.md)、[第三方说明](THIRD_PARTY.md)。

## 本地运行

需要 **Node.js 24+、Python 3.12+**。正常部署不需要 Rust，也不需要 npm 安装生产依赖。

1. 获取源码包和与它匹配的 `arg-tool-dependencies.zip`（依赖包须由发布者一同提供，不能用其他版本随意替换）。
2. 在源码目录运行：

```sh
npm run deps:install -- --archive /path/to/arg-tool-dependencies.zip
npm start
```

浏览器打开 `http://localhost:3000`。不要直接双击 HTML：Worker 和 WASM 需要 HTTP 服务。

安装只接受 [dependencies.lock.json](dependencies.lock.json) 列出的路径、尺寸和 SHA-256，先在临时目录验证全部文件，再写入依赖目录。损坏、额外文件及不匹配版本会报错，不执行依赖包中的安装脚本。安装需要约 340 MB 的最终空间和额外临时空间。

维护者已有匹配的完整工作目录时，可以完全离线导入：

```sh
npm run deps:install -- --from /path/to/full-checkout
```

这不是要求使用者访问维护者的服务器或私有仓库。公开源码时必须同时提供匹配依赖包；目前尚未配置公共下载地址。

## 构建静态站点

```sh
npm run build
```

构建前检查固定依赖及来源完整性，完成后将 `dist/` 放到任意静态 HTTP/HTTPS 服务器。支持子目录部署；`.wasm` 应使用 `application/wasm`。此源码版不绑定个人域名、Sites 项目或 1Panel 实例。生成后的工具无需运行时 CDN，首次访问仍需加载部署者托管的本地引擎。

常规工具不会自动上传文件；用户主动选择的 HTTP、DNS 等联网操作仍会发出请求。服务器也可能记录访问日志。

## 问题反馈与部署配置

默认只能复制或下载问题报告，没有收件邮箱或自动发送服务。若部署者自行运行可选的反馈服务，可在 [public/deployment.js](public/deployment.js) 配置同源地址；SMTP 凭据只能配置在服务器环境中，不能写进前端。可选服务代码位于 `services/feedback/`。

关于页保留原作者归属和完整第三方许可证，移除个人打赏与关联站点推广。现有偏好格式、路由和工具数据处理保持兼容。

## 开发与维护

```sh
npm ci --ignore-scripts --prefix test-tools
npm run test:plan -- --files public/site-pages.js
npm run verify -- --files public/site-pages.js
```

构建产物的真实 HTTP 部署回归：`npm run verify -- --files scripts/browser-deployment.mjs`（先构建并安装 test-tools）。实测范围与公开下载缺口见 [GitHub 独立部署记录](docs/GITHUB_DEPLOYMENT_VERIFICATION.md)。

浏览器检查使用 Playwright，可用 `CHROMIUM_PATH` 指定 Chrome/Chromium。按 [测试策略](docs/TESTING_POLICY.md) 选择范围；完整验证是 `npm run verify:all`。组件规范见 [UI 开发规则](docs/UI_DEVELOPMENT_RULES.md)、[组件文档](docs/UI_COMPONENTS.md) 和 [模块边界](docs/MODULE_BOUNDARIES.md)。

`main` 用于原站部署。本分支采用独立源码历史，后续从 main 按需迁移原创功能及相关测试，不直接合并完整部署分支。依赖更新需要重新固定清单、导出依赖包并验证；普通构建不升级上游。

维护者导出依赖包：

```sh
npm run deps:check
npm run deps:export -- --archive /path/to/arg-tool-dependencies.zip
```

发布时将依赖 ZIP 作为独立发布附件，不提交到 Git；源码用 `git archive` 导出。FFmpeg 等组件的对应源码义务不能仅靠附一个许可证满足，见 [开源范围与分发边界](OPEN_SOURCE.md)。
