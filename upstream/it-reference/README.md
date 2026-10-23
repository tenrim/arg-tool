# IT 固定资料与科普数据

本站只离线查询这些固定资料，不扫描端口、不请求 DNS、不查询注册人。

2026-10-16 已撤下 56 项 RFC 精选索引和人工精选的指令／寄存器参考，避免与完整检索混淆。RFC 原始索引与既有哈希仅作历史归档，维护导入不再抓取，生成器清理退役的 JSON 与随站声明。实际 x86/ARM 反汇编计算仍保留。

| 资料 | 固定来源 | 复用范围与许可 |
| --- | --- | --- |
| 服务与端口、IP 协议号、HTTP 状态/字段、字符集 | IANA 原始 XML；`larseggert/iana-assignments` 固定镜像提交 `a3cbd401df5dd06cf60f7376fa0601bd5f426aec` | 协议注册表数据 CC0 1.0；不包含引用的 RFC 文档 |
| MIME 与扩展名 | `mime-db` 1.54.0 原始 npm 包，验证 SHA-512 integrity | MIT；保留 IANA/Apache/nginx 来源字段 |
| 域名与公共后缀 | `publicsuffix/list` 提交 `3929462652695bad04f0a27afb600974014a3c8b` | 原始和派生数据 MPL-2.0；完整 ICANN/PRIVATE、通配、例外和 IDN 规则 |

`education.mjs` 中的中文科普、误区说明、解谜示例与关联工具为本站编写。没有引入 tldts、iced-x86 或远程查询服务。

维护导入：`python3 scripts/import-it-reference.py`。该命令使用固定版本/提交下载原始文件，并记录 `imports.json` 的 URL、SHA-256、npm 包 integrity。改版必须先审查许可、固定版本与数据结构。

普通生成：`node scripts/build-it-reference.mjs`。完全离线，先验证全部原始文件哈希，再输出每类 JSON、许可原文、来源声明和 `UPSTREAM.json`；不直接编辑生成的数据。项目整体完整性审计应在生成前验证已发布派生文件。

每类 JSON 的统一格式是 `{kind, records, meta}`，记录含 `id,kind,group,title,aliases,summary,fields,examples,related`。域名记录还含 `asciiRule,isPrivate`。分类资源按需载入；模型统一执行超时、失败重试缓存、验证、搜索排序与分页。公共后缀匹配遵循最长规则、通配和例外规则，私有后缀可明确排除。不会声称域名存在或已注册。

测试：`node --test tests/it-reference.test.mjs`，覆盖真实端口/协议、HTTP临时登记、MIME/字符别名、分页、完整PSL匹配、IDNA/IP/输入错误、来源哈希以及失败后的重试。
