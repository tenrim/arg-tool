# 机器人计算服务 v1

2026-11-07。工具箱负责计算，Koishi 插件只调用 HTTP。本服务是可选的独立进程，不改静态网站启动入口，也不需要把工具箱源码、WASM 或浏览器放进插件。

## 本地服务

本服务独立于网页进程，默认监听 `http://127.0.0.1:3216/api/bot-tools/v1`。在仓库根目录新建私密配置 `.env.bot-tools`，填写自身使用的 Token。默认使用本地网页资源，并以 `http://localhost:3000/` 生成工具入口链接。

## 启动

Node.js 24+；依赖只安装到可选服务自身目录，根目录主构建保持离线。

```powershell
npm ci --ignore-scripts --prefix services/bot-tools
# 没有可用 Chromium 时安装匹配浏览器；已有浏览器可在私密配置中指定路径。
node services/bot-tools/node_modules/playwright/cli.js install chromium

# 首次配置：复制示例到仓库根目录，填入独立随机 Token；不要覆盖已有私密配置。
Copy-Item services/bot-tools/.env.example .env.bot-tools
node --env-file=.env.bot-tools services/bot-tools/start.mjs
```

Token 应由密码学随机数生成，至少 32 字节随机数转十六进制。启动器只打印服务地址与固定错误提示；不记录请求体、结果、Token 或浏览器日志。本地已配置的服务不需要重新生成凭证。停机使用 Ctrl+C；任务进程、浏览器和本次创建的临时目录由服务清理。

| 配置项                    | 默认值／要求                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `BOT_TOOLS_TOKEN`         | 必填，独立随机凭证；32–256 个非空白 ASCII 字符；拒绝示例占位符                                    |
| `BOT_TOOLS_HOST`          | `127.0.0.1`；也接受 `::1`，不接受公网监听                                                         |
| `BOT_TOOLS_PORT`          | `3216`                                                                                            |
| `BOT_TOOLS_CONCURRENCY`   | `2`，可设 1–4；无排队，满额返回 429                                                               |
| `BOT_TOOLS_TIMEOUT_MS`    | `30000`，包含浏览器启动、资源加载及执行，允许 100–60000                                           |
| `BOT_TOOLS_RESOURCE_BASE` | 留空使用仓库现有 `public/` 资源和临时回环静态端口；也可配置固定 HTTPS 工具箱资源目录，以 `/` 结尾 |
| `BOT_TOOLS_SITE_URL`      | `http://localhost:3000/`，用于返回网页链接，不是计算请求地址                                |
| `BOT_TOOLS_CHROMIUM_PATH` | 留空使用 Playwright 匹配浏览器；可设管理员指定的本机浏览器绝对路径                                |

远程资源目录的 CyberChef 目录摘要必须与本仓库固定目录一致，不自动兼容或升级不同版本。配置是管理员能力，请求体不能覆盖上述配置。未来远程使用时另行部署 HTTPS 反向代理到回环端口；不得记录 Authorization，不把浏览器内部端口或静态资源辅助端口暴露公网。Linux 使用可启用 Chromium 沙箱的非 root 账号，本服务没有关闭 Chromium 沙箱。

## 认证与通用约定

全部接口，包括健康检查，均要求 `Authorization: Bearer <独立 Token>`。无效凭证返回 HTTP 401。POST 使用 `Content-Type: application/json`。响应统一为 JSON，不启用浏览器跨域访问。

单次请求最多 128 KiB；输入文本按 UTF-8 最多 64 KiB；实际计算结果最多 64 KiB，JSON 响应最多 128 KiB。处理链 1–8 步；二进制预览最多 256 字节。文件上传、图片／音频发送、文件下载和流式大结果均未开放。

每次请求重新创建浏览器进程、浏览器上下文和原 Worker；不复用用户配置、网页笔记、Cookie、变量或上次结果。超时、断开连接、停机都终止任务。并发槽在进程终止和临时目录清理后释放，不将停止响应等同于后台仍在计算。

## GET /health

返回 `ok`、服务协议版本 `version`、`engines.cyberchef` / `engines.qalculate`、限制、`activeTasks` 和 `supportedOperations`。

引擎状态包含 `available` 和 `checkedAt`。启动时分别实际调用 Base64 和 `1+1`；此后成功运算或资源失败更新状态。它是最近一次探测／运行状态，不是每次 health 请求都重新初始化两个引擎。引擎不可用时 health 本身仍返回 200，以便读取具体状态；不能只看顶层 `ok` 判断计算可用。

## GET /search?q=关键词

复用原 `createRegistry` / `searchEntries`，最多返回 30 项，默认排除科普，返回：

```json
{
  "ok": true,
  "results": [{
    "id": "topic:base-family",
    "name": "Base 家族编解码",
    "url": "http://localhost:3000/#encoding/base?task=topic%3Abase-family&op=To+Base64",
    "executable": true,
    "operationId": "op:To Base64",
    "supportedOperations": ["op:To Base58", "op:From Base58", "op:To Base64", "op:From Base64"]
  }]
}
```

`id` 是工具箱能力 ID；`operationId` 是当前命中方向的执行 ID，可传给操作详情接口。`executable` 只描述当前命中的操作，不代表专题的全部操作可执行。`supportedOperations` 列出该专题已经开放的成员。无法执行的结果保留网页链接，`operationId` 为 null。用户可以据此去网页，而不是收到虚假的成功结果。

## GET /operations/{id}

整个 ID 做 URL 编码，例如 `/operations/op%3ATo%20Base64` 或 `/operations/qalculate%3Acalculate`。

返回 `{ "ok": true, "operation": {...} }`，包含 `id`、`engine`、`name`、`executable`、`parameters`、`defaults`、`description` 与 `url`。CyberChef 同时返回原始 `op`、`inputType`、`outputType`，参数和默认值直接读取 `schema.js` 与固定目录。

CyberChef 说明是原始 HTML，标注 `descriptionFormat: "html"`；插件应将其转成安全的纯文本显示，不直接渲染为可信 HTML。已知但未开放的 CyberChef 操作返回 `executable:false` 与原因／网页链接；不存在的 ID 返回 404。

### 文字操作执行范围（服务版本 1.1.0）

按用户确认的“开放所有文字相关操作，不开放需要具体文件或图片的操作”，固定目录 505 项中开放 **456 项 CyberChef 操作**，保留 **1 个 Qalculate 表达式入口**。完整可执行名称从 `/health.supportedOperations` 获取，每项的原参数、默认值和网页入口从 `/operations/{id}` 获取。

| 范围 | 处理方式 |
| --- | --- |
| 文本、编码、密码、哈希、正则、URL、日期、数值、结构化文本 | 已开放，继续调用原引擎 |
| JSON、CSV、YAML、JWT、Magic、频率统计等结构化结果 | 返回 `type:json`、完整 `data` 和可读 `text`；Magic 标明自动推测 |
| PEM／PGP 密钥、证书、协议十六进制、反汇编、YARA 文本匹配 | 可以直接提供文本参数，不读取服务端文件 |
| 压缩、序列化、字节处理 | 可用于文字处理链；二进制结果保留类型和有限预览，可接 `To Hex`、`To Base64` 或显式 `Decode text` |
| 文件路径列表、plist XML、文件权限文字 | 已开放，只处理提交的文字，不访问实际路径 |
| 文件、图片、媒体、纯图表、外部网络及内部测试 | 49 项未开放，返回明确原因和网页链接 |

未开放项：Image 模块全部 28 项、OCR 的 `Optical Character Recognition`、File 的 `Render PDF`；`Detect File Type`、`ELF Info`、`Extract Audio Metadata`、`Extract Files`、`Extract ID3`、`Play Media`、`Scan for Embedded Files`、`Tar`、`Untar`、`Zip`、`Unzip`；`Heatmap chart`、`Hex Density chart`、`Scatter chart`、`Series chart`、`Show on map`；`HTTP request`、`DNS over HTTPS`；`Automated Validation Test Op`。图片生成／二维码也不通过机器人发送。Entropy 和 Frequency distribution 返回实际数值／统计数据，因此开放。

这里的“开放”是服务允许调用，不表示所有操作、所有输入和参数组合都逐一完成算法验收。本轮对 505 项逐项检查分类、456 项检查原参数默认结构；真实 HTTP 覆盖新增协议类型、处理链和各独立模块的代表性操作，具体见文末验收范围。算法和固定运行包没有改写。

显式参数沿用原引擎结构：字符串最多 64 KiB，整个请求仍最多 128 KiB；数值必须有限并满足原定义的范围和整数要求，不能把 Unix 时间戳等普通数值一律限制在 100000 以内。所有 15 种非 label 参数类型均可传入，包括 `toggleString` 的 `{ "option":"Hex", "string":"..." }` 和 populate 选择参数。显式 args 应提交完整数组，populate 对其他参数的联动默认值由原模块生成，不额外改写显式参数。

保留原默认值不代表默认值能直接处理任意输入：密钥、模板、规则等通常需要调用方填写；部分下拉默认值是分组标题，需要选择实际单位。固定上游还有 `Unicode Text Format` 的字符串 `"false"` 和 `PEM to JWK` 的空布尔默认值，本服务原样保留；需要明确开关状态时传 JSON 布尔值。Register 可用于后续字符串参数，数值参数不能传 `$R0`。这些原引擎边界不会伪装成成功结果。

## POST /run

### CyberChef

```json
{"engine":"cyberchef","input":"Hello","recipe":[{"op":"To Base64"}]}
```

实测响应：

```json
{"ok":true,"engine":"cyberchef","result":{"type":"text","text":"SGVsbG8=","byteLength":8}}
```

省略 `args` 才采用原默认值。显式 `args` 必须完整、按原顺序填写；例如 Base64 为 `"args":["A-Za-z0-9+/="]`。SHA-512 的原操作名是 `SHA2`，默认参数为 `["512",64,160]`；SHA-256 使用 `["256",64,160]`，不新增虚构的 `SHA-512` 操作名。

```json
{"engine":"cyberchef","input":"Hello","recipe":[{"op":"To Base64"},{"op":"From Base64"}]}
```

此链最后一步的原结果是字节数组，即使内容恰好可读，也不会自动当普通字符串解码：

```json
{"ok":true,"engine":"cyberchef","result":{"type":"binary","byteLength":5,"hexPreview":"48656c6c6f","truncated":false}}
```

`byteLength` 为完整结果字节数；`hexPreview` 最多 512 个十六进制字符；`truncated:true` 仅表示预览截断。完整结果超过 64 KiB 时直接失败，不把截断内容伪装成完整结果。

### 结构化结果与文字展示

例如 `YAML to JSON` 输入 `name: Alice\ncount: 2`：

```json
{"ok":true,"engine":"cyberchef","result":{"type":"json","data":{"name":"Alice","count":2},"text":"{\n  \"name\": \"Alice\",\n  \"count\": 2\n}"}}
```

插件优先展示 `result.text`，需要后续处理时读取 `result.data`。Magic 的 text 为候选解码链、解码片段、熵和可能语言；原候选及完整参数仍保留在 data 中，不宣称猜测就是答案。JSON 和可读文字合计受 64 KiB 限制，超限返回错误，不悄悄丢字段。

数值和大数使用原引擎转换出的文字保留精度。原始 HTML 结果只在脱离页面的惰性模板中提取文字、保留表格分隔；移除脚本与嵌入内容，返回 `sourceType:html`。不显示原 HTML、不运行其中的脚本，也不通过工具页面 DOM 执行计算。原引擎提供原始 JSON／数字时优先使用原始值，避免把统计图当作空结果。

AES 原 Raw 格式有字节语义。中文文本可用 `To Hex → AES Encrypt（Input=Hex）→ AES Decrypt（Output=Hex）→ From Hex → Decode text` 验证还原；密钥与 IV 使用原 `toggleString` 结构。不要让插件自行推测原参数的字符编码。

### Qalculate

```json
{"engine":"qalculate","expression":"10 km to m"}
```

实测响应：

```json
{"ok":true,"engine":"qalculate","result":{"type":"text","text":"10000 m","warnings":[]}}
```

只提交一条表达式，不接受 `options`、`definitions`、`files` 或脚本。临时变量只存在于本次进程，不会在下一次请求保留。首版不接受引号、反斜杠、换行、分号、`:=` 和文件／命令／注册／绘图等功能名；文件、图形输出也会被拒绝。普通表达式仍由完整原 Qalculate 解析，未知符号可能保留为符号表达式，不伪造数值答案。货币若使用原引擎内置数据，是随包汇率，不是实时汇率。

原内核的消息级别为 INFORMATION=0、WARNING=1、ERROR=2。首版对警告采取保守处理：返回 `CALCULATION_WARNING`，不附成功结果；例如除零会触发警告，缺少函数参数触发错误。两者都不能发送成“计算成功”。返回消息来自原引擎，可能是英文，插件可保留原文并展示对应网页入口。

### 失败

```json
{"ok":false,"engine":"qalculate","error":{"code":"TIMEOUT","message":"任务超时，已终止执行。"}}
```

| HTTP      | 错误代码                                                              | 含义                                               |
| --------- | --------------------------------------------------------------------- | -------------------------------------------------- |
| 400       | `INVALID_INPUT` / `INVALID_ARGUMENTS`                                 | JSON、字段、输入或参数不正确                       |
| 401       | `UNAUTHORIZED`                                                        | 凭证无效或缺失                                     |
| 404       | `NOT_FOUND`                                                           | 接口或操作 ID 不存在                               |
| 405       | `METHOD_NOT_ALLOWED`                                                  | 请求方式不正确                                     |
| 413       | `INPUT_TOO_LARGE`                                                     | 输入或请求体超限                                   |
| 415       | `INVALID_INPUT`                                                       | Content-Type 不是 JSON                             |
| 422       | `UNSUPPORTED_ENGINE` / `UNSUPPORTED_OPERATION` / `UNSUPPORTED_RESULT` | 当前未开放；已知操作附网页链接                     |
| 422       | `INVALID_INPUT` / `CALCULATION_WARNING` / `OUTPUT_TOO_LARGE`          | 原引擎失败、警告或结果超限                         |
| 429       | `BUSY`                                                                | 并发已满，附 `Retry-After: 1`                      |
| 408 / 504 | `TIMEOUT`                                                             | 读取请求体超过 5 秒／执行超时                      |
| 503       | `ENGINE_UNAVAILABLE`                                                  | 浏览器、资源、版本匹配或计算进程不可用             |
| 内部 499  | `CANCELLED`                                                           | 客户端已断开，通常无法再收到响应；任务仍会实际终止 |

插件应同时检查 HTTP 状态和 `ok`，根据 `error.code` 分支，不根据可读消息判断成功。超时、断开和失败均不自动重试计算。

## 实现、来源与验收

- `services/bot-tools/`：配置、认证、HTTP 协议、支持范围、浏览器进程生命周期；不实现编码或数学算法。
- `catalogue.mjs` 直接使用原 registry/search/routes/schema；浏览器通过原 `CyberChefClient.bake()` 与 `qalculateClient().run('calculate', ...)` 调用原 Worker，不点击页面、不读取结果 DOM。
- 每个浏览器仅允许 GET 配置源内的静态资源，不接受任意模块 URL；禁止外源、重定向、WebSocket 和 Service Worker。所有凭证留在父进程，计算子进程不继承 Token／SMTP 等配置。
- 每任务浏览器沙箱开启，使用独立临时目录。Windows 终止本任务 PID 树；POSIX 同时处理 Node 和 Playwright 单独创建的 Chromium 进程组。正常结束和强制停止后清理本任务临时文件，不操作其他浏览器进程或目录。
- 参考检索：XERJ 本项目 `public/cyberchef-client.js` 的 bake/close、`public/chef-tools/schema.js` 的 defaults，以及 CyberChef 参考仓库固定提交 `11b86fecdb5d8f6244cf931e1f87cec887ec1f1f` 的 `src/core/ChefWorker.js:98`、`src/core/Dish.mjs:522–540`。这是参考快照；实际运行仍为既有 v11.5.0 固定运行包，未替换上游字节。
- Qalculate 使用现有 5.13.0 运行包；复核 `public/vendor/qalculate/source.zip` 中 `core.tar.gz/libqalculate-5.13.0/libqalculate/Calculator.h:144–150` 的消息枚举和 `upstream/qalculate/bridge.cc:13`。原源码与许可仍在既有源码包和 NOTICE 中。
- 浏览器适配使用固定 Playwright 1.62.1 的 `launchServer`、`BrowserServer.process`、`routeWebSocket` 接口；核对随包类型定义与 `playwright-core/lib/coreBundle.js:8902–8905` 的独立进程组行为。依赖按 Apache-2.0 许可提供，不自动升级。

验收命令：

```powershell
node --test --test-isolation=none tests/bot-tools.test.mjs
$env:BOT_TOOLS_CHROMIUM_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'
node scripts/browser-bot-tools.mjs
node scripts/browser-bot-tools-network.mjs
node scripts/browser-bot-tools-text.mjs
```

覆盖：已知结果、两步链、默认和显式参数、二进制类型及预览、错误参数和原生计算错误、临时变量和前次结果隔离、大小限制、凭证拒绝、并发超限、实际长计算超时、断开后进程退出、失败后正常请求，以及模拟资源失败／跨源重定向和恢复。全部使用合成数据；验收不会调用公网服务器或真实聊天机器人。


### 文字范围扩展的参考与实测

参考同一固定 CyberChef 提交 `11b86fecdb5d8f6244cf931e1f87cec887ec1f1f`：`src/core/Ingredient.mjs:211`（原参数准备）、`src/core/Chef.mjs:55`（先保留原 Dish 再展示）、`src/core/operations/Magic.mjs:64`、`FrequencyDistribution.mjs:54`（原 JSON）、`Register.mjs:94`（后续参数替换），以及 `tests/operations/tests/Protobuf.mjs:94` 的公开测试向量。本站所有者为 `public/chef-tools/schema.js:12`、`public/chef-tools/result-view.js:61`、`public/chef-tools/structured-result.js`。只适配传输和展示，未复制算法或升级参考库。

`browser-bot-tools-text.mjs` 使用合成数据检查文字大小写、摩斯、ROT13、Vigenère、字符编码、URL、复合替换、正则、JSON／CSV／YAML／JWT、Jq／JSONata／模板、MessagePack／CBOR／Protobuf、压缩、中文 AES 往返、大数、平均值、熵、频率、Magic、HTML文字、Markdown、Diff、目录文本、YARA、Enigma、PEM、反汇编、寄存器、BLAKE2s、PGP 密钥和 UserAgent。这些覆盖 21 个开放的模块（Crypto 的已知摘要另由基础 HTTP 套件覆盖），不是 456 项全部参数组合的证明。实测记录保存在 `outputs/bot-tools/http-text.json`；PGP 数据是测试专用生成密钥，不用于任何账号。
