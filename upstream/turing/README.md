# 图灵机上游与离线适配

`aepsilon/turing-machine-viz` 固定提交 `b4dab9e4a649051ada94cb352c48ec177da5952e`，BSD-3-Clause；`js-yaml` 固定 4.3.2，MIT。

维护导入：`node scripts/import-turing.mjs`（联网）；离线生成：`node scripts/build-turing.mjs`。前者固定提交、npm SHA-512 完整性和各源码 SHA-256，后者生成前核验原始文件。原始 parser、TuringMachine、Tape、StateGraph、示例与许可保留不改；JS YAML 分发字节保持原样。

适配脚本将 CommonJS 变为 ES 模块，以本站编写的少量原生辅助函数替代 lodash 调用，保留上游转换、纸带与指令算法。显式添加 Unicode 码点符号、`S` 原地移动、安全自有属性检查；YAML 仅使用 JSON_SCHEMA，限制嵌套／节点并拒绝循环或重复引用。状态名 `__proto__`／`constructor` 作为普通自有键处理，不能访问继承属性。默认机器 YAML 与上游兼容，也接受带 `source code` 的上游导出文档。

本站 `public/turing/core.js` 负责规则展开后的重复校验、执行限额、256 步撤销、32 条追踪以及有界输出。64 KB 规则、8,192 个初始符号、128 个状态、4,096 条规则、100,000 步、65,536 格跨度、256 KB UTF-8 输出（最坏每格 4 字节）。每批最多 1,000 步，触及步数／纸带限制时拒绝即将发生的那一步，保留可撤销和重置的局面。

`worker.js` 从同源绝对资源基址动态导入引擎，禁止依赖 Blob Worker 地址、运行时 CDN、远端保存和执行用户代码。运行／暂停节奏由页面控制；Worker 每个请求仅处理一个有界批次。来源和生成摘要见 `public/vendor/turing/UPSTREAM.json`，适配说明和完整许可随运行包提供。
