# 独立文件分析工具

2026-11-04：已随 V2.0 启用正式服务，并将上传文件上限统一为 20 MB；固定镜像及线上验证见 [V2.0 发布记录](releases/V2.0-发布记录.md)。

用户于 2026-11-03 授权补齐 AperiSolve 分析能力，不启用整套自动分析。按固定版本的 19 个分析模块验收，不把底层程序的其他产品功能（例如隐写写入、密码穷举）冒充本轮分析器范围。

## 实际覆盖

| 模块 | 接入与结果 |
| --- | --- |
| decomposer | 复用原浏览器位平面与图层工具；完整 RGBA 位平面，不上传 |
| color_remapping | 复用原浏览器颜色重映射，不上传 |
| exiftool | 完整分组、重复及未知标签，文本／JSON，保留原始输出 |
| file | libmagic 文件类型识别，原浏览器方式并入同一专题 |
| identify | GraphicsMagick 完整详细图像信息与通道统计 |
| binwalk | 签名扫描、提取、递归；可选择仅扫描与递归深度 |
| foremost | 文件雕刻、完整恢复目录及审计报告 |
| pngcheck | PNG／JNG／MNG 结构与 CRC 检查 |
| pcrt | 原始修复算法、完整 IHDR 常见配置表、尺寸搜索、修复图片和尾部数据 |
| zsteg | 常规检测、全部检测组合、按检测参数提取原始二进制 |
| steghide | 密码、原文件名、JPEG／BMP／WAV／AU 提取 |
| outguess | 密钥提取，空文件不当成成功 |
| jsteg | JPEG 提取，原始二进制 stdout 单独保存 |
| jpseek | JPHide／JPSeek 密码提取，保留部分恢复诊断 |
| openstego | RandomLSB，AES128 与 AES256 尝试，密码与原文件 |
| pdfid | PDF 结构／脚本／动作／嵌入标记统计 |
| pdfinfo | 文档信息、页面框、元数据 XML、URL 和打开密码 |
| strings | 7／8 位、16／32 位大小端、最短长度及偏移基数 |
| spectrogram | FFmpeg 解码、多声道频谱和混合波形，完整图片下载 |

同用途的元数据、PNG、类型识别、嵌入文件、字符串、频谱合并为专题，默认采用范围更广的服务器成员。浏览器方式保留它独有的参数、本地处理和处理链能力。不同隐写格式各自保留，不互相冒充。所有现有深链接由原 registry 别名机制兼容。

## 运行

网站主构建仍离线，无需根目录安装 npm 依赖。原生分析工具需要 Linux Docker：

```sh
docker build -t mist-forensics:20261104-limit20 -f services/forensics/Dockerfile .
FORENSICS_ENABLED=1 npm start
```

运行网站的账户必须能调用 Docker。只向网站进程授权既定环境，不对外暴露 Docker socket。反向代理将 `/api/forensics/run` 转发到原 Node 服务；请求体限制28 MB（含 Base64 和 JSON 开销，原文件仍限 20 MB），代理读取超时至少 260 秒。纯静态 dist 不能运行此接口，未启用时页面明确提示。

Windows 本机没有 Docker 时，开发服务可通过已有 SSH 别名调用测试服务器的隔离镜像：

```powershell
$env:FORENSICS_ENABLED='1'
$env:FORENSICS_TRANSPORT='ssh'
$env:FORENSICS_SSH_HOST='mist-server'
node scripts/server.mjs --port 16334
```

SSH 严格校验主机密钥，使用既有身份；上述变量不是浏览器参数。生产部署不要求 SSH。默认镜像名 `mist-forensics:20261104-limit20`，可用 `FORENSICS_IMAGE` 指定部署者固定的镜像。`FORENSICS_ORIGINS` 可设置逗号分隔的准确网站源，默认本站两个正式域名；开发仅接受同端口 localhost／127.0.0.1。

## 文件、密码与限制

- 点击才上传，单次只运行当前工具；不调用 AperiSolve 官网、Redis、队列扫描或外部遥测。
- 每项任务一个无网络、只读根文件系统、非 root、无额外 capability 的容器；工作目录使用临时内存文件系统，退出自动删除。
- 文件最多 20 MB，完整结果最多 64 MB，单次 240 秒，服务同时处理一个任务。超限明确失败，不返回裁剪结果充当完整输出。
- 保留上游 binwalk 单文件提取 10 MB／最多 100 文件边界；递归深度可在 1–8 选择。上游频谱图最多 6 声道、8192 时间列，结果保留其限制说明。PNG 穷举也保留上游时限；这些是实际资源边界，不承诺任意大输入。
- 密码在请求体中传给容器，不写数据库、网址或预设。原始命令输出保存在本次结果，命令参数不写入日志。
- 修改文件／参数、离页、点击停止或关闭连接会作废结果并取消容器。仅原控制器持有当前文件与结果，笔记使用原结果租约。
- 结果既保留上游结构化报告，也保留完整 stdout／stderr 原字节、每个恢复文件和归档。JSteg、zsteg 的二进制输出不经文本转码。所有文本按文本显示，不作为 HTML 执行。

## 来源与维护

AperiSolve 固定提交 `feec31092f0e548513d76545293caa41eb4f1ad8`。`upstream/aperisolve-single/SOURCE.json` 记录原始文件摘要；不导入原网站包初始化逻辑，命名空间仅加载分析器及 PNG 算法依赖。`services/forensics/runner.py` 通过继承适配输出、归档、非 root 执行与明确参数，不修改上游字节。

主要参考：上游 `analyzers/base_analyzer.py` 的 `run_command`、`generate_archive`、`analyze`；`analyzers/registry.py` 第 18 行开始的模块发现；`utils/png.py` 第 269–347 行的完整 IHDR 查表与搜索。本地先通过 XERJ 查询 `createOnlineQueryService` 所有者，再查看 `https://github.com/gchq/CyberChef` 固定提交 `11b86fecdb5d8f6244cf931e1f87cec887ec1f1f` 的 `src/core/operations/ExtractFiles.mjs` 第 16 行及其签名扫描／原文件输出，确定保留本地文件提取方式。

实际安装版本见 `public/licenses/forensics/runtime-packages.txt`；每个组件的原始 copyright、COPYING、依赖声明随站保存。JSteg、JPHS 固定提交和 OpenStego 官方包摘要见 `public/licenses/FORENSICS-NOTICE.txt`。镜像 Debian 包版本会随维护源更新，构建后必须重新导出清单并验证；不能把未锁定的整个 apt 依赖树宣称为逐字节可复现。

## 验证入口

- `node --test --test-isolation=none tests/forensics.test.mjs`：请求校验、隔离参数、并发、断开取消。
- `node scripts/browser-forensics.mjs`：17 个新服务端入口、合并成员、真实许可文件、错误恢复和 320px。
- `services/forensics/fixtures.py`：生成带已知原始字节的各方案载体，不使用玩家文件。
- `node scripts/test-forensics-engines.mjs`：19 模块共 21 个真实正例；可附引擎名复测，保留其他已验记录。
- `node scripts/test-forensics-options.mjs`：新增字符串编码／偏移、JSON、扫描模式、PDF 信息选项与特殊后缀文件导出；只在已配置隔离镜像时显式运行。
- `node scripts/browser-forensics-live.mjs`：实际接口上传、ZIP 字节、密码错误、PNG 图像及停止。需要已配置独立测试镜像和测试夹具。

测试输出位于 `outputs/forensics-build/`，不作为产品文件提交。构建测试镜像不等于发布正式网站；Git、线上发布和版本公告分别按当前授权执行。
