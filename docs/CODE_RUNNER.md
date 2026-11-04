# 代码运行语言扩展

2026-11-04：已随 V2.0 启用正式服务，固定镜像、线上检查及回滚方式见 [V2.0 发布记录](releases/V2.0-发布记录.md)。下述 2026-11-03 内容保留为开发与隔离验证记录。

2026-11-03 开发记录。这里只定义构建、使用和验收方式，不代表已经部署线上。

## 页面和语言

当前目录共 27 种语言，按“主流／常用”（21 种）与“冷门／解谜”（6 种）显示。分组只服务查找，不是客观流行度排名。语言选项同时显示本地／服务器；普通专题默认进入本地 Python，已有 Brainfuck 等深链接保持原意。

原有 Python、JavaScript、Lua、SQL 和六种解谜语言继续使用浏览器本地运行包。新增服务器语言为 C、C++、C#、Java、TypeScript、Go、Rust、PHP、Ruby、R、Perl、Bash、Kotlin、Swift、Dart、Scala、PowerShell。

控制台、标准库和运行版本按实际引擎提供，不把单文件程序运行器说成完整 IDE。Java 使用 Main 类，Scala 使用 Main 对象；C# 支持顶级语句。TypeScript 严格类型检查后交给 Node.js，readline() 和 stdin 提供与现有编辑器匹配的输入；原 JavaScript 入口仍是 QuickJS。Swift 不包含 UIKit，Dart 不包含 Flutter，PowerShell 运行在 Linux。语法和示例由 [共享语言目录](../public/coderunner/server-catalog.js)统一声明。

## 数据和运行边界

- 只有点击“发送并运行”才发送代码和标准输入。语言切换、输入编辑、暂停后的普通页面操作不暗中上传。
- 每次新建非 root 容器，禁用网络、能力提权和宿主目录挂载；根文件系统只读，临时工作区允许执行编译产物，结束删除。容器不会获得 Docker socket、服务环境变量或账号数据。
- 单任务上限：1 GB 内存、0.75 CPU、128 进程；代码和输入分别 256 KB；编译 60 秒、执行 10 秒；每阶段标准输出与错误流合计最多 256 KB。超限停止并明确标记部分输出，失败不发布可保存的成功结果。
- 服务一次只运行一个任务，限制请求频率，校验 Origin、JSON、长度和语言白名单。断开、编辑、离页或停止会中断请求并删除容器。接口不能指定镜像、命令、挂载、编译器参数或任意文件路径。
- 编译诊断、运行错误与标准输出分开显示，实际运行版本随结果返回。原控制器继续拥有草稿、取消、结果租约和笔记操作，没有第二套编辑器或数据库。

## 构建与启用

普通网页构建保持离线。下面是显式维护步骤，需要有 Docker 的隔离测试／部署环境；不得在生产服务运行期间擅自执行。

```sh
node scripts/prepare-code-runner.mjs
docker build -t mist-code-runner:20261103 services/code-runner
node scripts/export-code-runner.mjs
docker image inspect mist-code-runner:20261103
docker run --rm --network=none --entrypoint=cat mist-code-runner:20261103 /opt/mist-code/manifest.json
docker run --rm --network=none --entrypoint=cat mist-code-runner:20261103 /opt/mist-code/NOTICE.txt
```

构建使用固定 Swift 6.0.3、Dart 3.6.0、TypeScript 5.7.2、Kotlin 2.1.20、Scala 2.13.16、PowerShell 7.4.6；Ubuntu 包由构建时发行源提供。构建后必须记录最终镜像 ID、全部实际运行时版本、系统包版本与许可摘要；不能仅凭 Dockerfile 标签称为字节可复现构建。生产的 `CODE_RUNNER_IMAGE` 应指定已验证的不可变镜像摘要。

安装包由 `ARTIFACTS.json` 固定官方地址与 SHA-256，维护下载脚本支持续传并在入库前校验。Scala 使用官网归档，PowerShell 使用微软发行包；Kotlin 使用 JetBrains 官方 Maven 完整 JVM 编译器，按其 2.1.20 POM 安装标准库、脚本运行时、reflect、trove4j、coroutines 和 annotations 依赖。JAR 内的许可与系统共享许可一并导出。安装产物不提交 Git，不进入普通网页构建。

`CODE_RUNNER_ENABLED=1` 显式启用服务，默认关闭。本站开发服务直接连接 `/api/code/run`；独立服务用 `node services/code-runner/start.mjs`，默认只监听 `127.0.0.1:3215`。公开站点使用现有同源反向代理转发该路径，保留 4 MB 请求上限和至少 125 秒读取超时，不直接公开 Docker 或服务端口。静态站点更新不会自动启动这个后端。

可配置字段：

| 字段 | 用途 |
| --- | --- |
| `CODE_RUNNER_ENABLED` | 只有 `1` 启用执行 |
| `CODE_RUNNER_IMAGE` | 已验证的本地镜像名称／摘要；执行时不自动拉取 |
| `CODE_RUNNER_ORIGINS` | 允许的完整站点 Origin，逗号分隔 |
| `CODE_RUNNER_TRANSPORT=ssh` | 开发时通过已有 SSH 主机别名连接测试 Docker |
| `CODE_RUNNER_SSH_HOST` | 默认 mist-server；保持严格主机密钥校验 |
| `CODE_RUNNER_HOST`、`CODE_RUNNER_PORT` | 独立服务监听，默认回环 3215 |

## 验证与接入完成条件

1. `node --test tests/code-runner-service.test.mjs`：输入边界、禁用状态、Origin、单任务和断连取消。
2. `node scripts/browser-coderunner-server.mjs`：全部语言选择、分组、来源、明确提交、诊断、草稿和手机。这一项使用 HTTP 夹具，**不能代替编译器验证**。
3. `node scripts/test-code-runner.mjs`：逐种实际运行中文输入输出，再测真实编译错误、非零退出、超时、输出上限、任务隔离、禁网和容器清理。记录到 `outputs/code-runner/`；可带语言 ID 定向复查失败项。
4. `node scripts/browser-coderunner-live.mjs`：真实页面 → HTTP → 沙箱 → 编译器 → 页面结果，覆盖 C、Java、TypeScript、C#、Swift。
5. 原 `browser-coderunner` 保持十种浏览器语言的实际执行回归。必要时验证来源、专题及知识生成的直接影响。

真实环境构建、原始许可导出及全部编译器实测完成前，不应把新增语言标为已完成部署。完整验收命令不会自动连接服务器；真实集成单独登记在测试清单。

## 本轮实际验收（2026-11-03）

17 种新增语言全部完成中文标准输入／输出实测，原有十种浏览器语言回归通过。另实测编译错误、非零退出、标准输出与错误流分离、TypeScript 原生文件流输入、超时、输出限额、每次全新文件环境、非 root、无宿主 Docker socket、禁网及取消后的容器清理。浏览器完整链路另验证 C、Java、TypeScript、C#、Swift；27 种选项的分组、来源、草稿和手机布局通过。

隔离测试镜像为 `sha256:7ce4b43845397f947a970938eb38bc6a10f55ebcf6715e98fd3ebe126a66689b`，实际运行版本与包、来源校验见 `services/code-runner/RUNTIME.json`、`PACKAGES.txt`。完整原始许可约 17 MB，只在主动查看许可时读取。运行证据位于被 Git 忽略的 `outputs/code-runner/engines.json`、`boundaries.json`，不作为网站发布资源。

C# 实测触发了 .NET 非 root 运行时共享锁目录问题，按 [dotnet/runtime #135726](https://github.com/dotnet/runtime/issues/135726) 在单次任务内创建权限为 0700 的 `XDG_RUNTIME_DIR`，不放宽容器权限；修复后编译、执行及真实浏览器链路均通过。新增服务器能力只在本地开发预览显式启用，正式网站未发布、未启用新接口。

## 来源与实现参考

引擎仓库、官方语言资料、各语言示例见共享目录；任务页末和关于页列实际编译器及必要运行时，原始许可从已构建镜像导出，不以项目名称代替许可正文。

本轮先用 XERJ 查 `public/coderunner/ui.js` 的 initCodeRunner / launch 和原任务生命周期，再查 Omni Tools `60bc64f5a6974f3c802c5ec06cb3cf7f824485e1` 的 `src/lib/ghostscript/worker-init.ts:26–35` 完成与线程释放方式。本站保留原控制器，通过可取消的 HTTP 适配器复用其修订与结果所有权，没有复制上游 React 状态。

也核对了 [Piston](https://github.com/engineer-man/piston)和 [Judge0](https://github.com/judge0/judge0) 的自托管执行能力；本轮未接入第三方公共执行 API，也未把其语言数量当成本项目实际支持数量。安装参考：[Swift 官方镜像](https://hub.docker.com/_/swift)、[Dart SDK](https://dart.dev/get-dart/archive)、[Ubuntu .NET 安装](https://learn.microsoft.com/en-us/dotnet/core/install/linux-ubuntu-install)、[PowerShell Linux 安装](https://learn.microsoft.com/en-us/powershell/scripting/install/install-ubuntu)。
