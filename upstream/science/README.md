# 科学与历法组件

固定版本及 npm tarball 完整性保存在 `imports.json`；运行文件与保留源码的 SHA-256 见 `../../public/vendor/science/UPSTREAM.json`。本站原生页面在 `public/science/`，每次运算使用新建的本地 Worker，30 秒超时，可停止；输入变化清除旧结果，原始输入和结果不上传。

| 组件 | 固定版本 / 提交 | 复用范围与许可 |
| --- | --- | --- |
| Astronomy Engine | 2.1.19 | 原版浏览器计算引擎，MIT；许可从其未改写的文件头原样保留 |
| lunar-javascript | 1.7.7 | 原版浏览器历法引擎，MIT |
| Periodic-Table-JSON | 9090b1c472a1e68f7295e77280f374f8d125cefc | CC BY-SA 3.0；筛选至 118 元素的基本属性，添加 `element-names-zh.json` 中的中文名，不加载外部图片与百科摘要；派生数据沿用 CC BY-SA 3.0 |
| SeqViz | 7a0e8f4c45ad5f4d076178f54f08f071e91d7b6a | MIT；从 sequence.ts 移除类型导入并转换 TypeScript，封装为 Worker 全局，只对本站公开互补/反向互补/转译三个接口；不加载 React 界面或 WebFont |
| NtSeq | e8a3f87f5f2086a9bb54eac63d0018c6071a8c37 | MIT；SeqViz 源码明确注明密码子表改编自 NtSeq，另附其许可 |
| RDKit MinimalLib | npm 2026.9.1 / Release_2026_09_1，fece8caa860bdf6c9c82bdb9253f22a0cf87150c | 官方 JS/WASM 与类型声明；核心 BSD-3-Clause 许可从对应上游提交保存，未改写运算包 |

普通 `npm run build` 使用已固定的运行文件，不下载或升级。维护时在仓库根目录运行 `python scripts/import-science.py`（需要网络），再运行 `node scripts/build-science-vendor.mjs`（离线）；审阅差异后更新哈希清单，并执行完整验证。保留原始源码、包版本和许可，不从 latest 自动升级。

适配代码负责中文交互、范围校验、分子式解析及元素符号拆分。SeqViz 对不确定密码子返回 `?`，末尾不满三个碱基不翻译；GC 比例以全部输入字符为分母。查询功能不包含医疗判断或蛋白质结构预测。
