# 基础转换固定来源

`imports.json` 固定四个MIT项目的提交与20个原始源文件SHA-256。`sources` 保留原文，禁止直接修改。维护导入使用 `node scripts/import-basics.mjs`，日常构建使用 `node scripts/build-basics.mjs`，不联网、不安装运行依赖。

生成器仅适配模块接口，保留romanice、Invisibles和baudot.js实际算法。cryptii使用原TapCode、PolybiusSquare及三个ArrayUtil方法，本站提供最小Chain/Encoder兼容层。固定数字轴使用相同标签，未宣称支持不同自定义轴。TapCode修正首组单点的上游解码判断，变化在生成器、NOTICE和回归中记录。

本站core负责显式范围校验、方阵关键词、词间分隔、保护选项与可编辑五位纸带。基础ASCII、Unicode/UTF-8、进制、转义与A1Z26直接复用CyberChef，无第二套转换算法。许可证和归属随页面来源栏及关于提供，ASCII对照表为标准事实，纸带绘图由本站编写。

新增共享ConversionWorkbench在ui层仅负责组成；session负责版本作废、30秒超时、停止、销毁、复制与导出。输入64KB，码字/数字最多4096项；原生Worker通过页面的同源绝对resourceBase动态载入，兼容Blob和子目录托管。

单元测试 `tests/basics.test.mjs` 和真实浏览器回归 `scripts/browser-basics.mjs` 纳入完整verify；必须验证实际双向结果、超出范围拒绝、输入变化作废、各搜索入口、移动与桌面、普通/Blob/子目录线程，而非只核对页面存在。
