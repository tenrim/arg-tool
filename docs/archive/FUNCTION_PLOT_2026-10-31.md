> 历史记录，仅用于追溯。现行规则见 [开发指导](../DEVELOPMENT_GUIDE.md)，不要按本页旧版本、旧部署状态或测试清单执行当前任务。

# Desmos 在线函数绘图（2026-10-31）

用户明确要求试用 iframe，并移除之前的本地函数绘图实现。保留 native:function-plot、#function-plot 与原搜索别名，显示名称为“Desmos 函数绘图（在线）”。本轮仅本地修改，未部署、提交或推送，版本仍为 V1.7。

## 实际范围

- 固定加载 https://www.desmos.com/calculator?lang=zh-CN，不使用 API key，不代理或修改外站。
- 只有首次进入该工具才创建 iframe；切换工具保留同一个浏览上下文，删除工作区时清理观察器与 iframe。
- 页内保留联网提示、官方来源、使用指南与新标签页备用链接。新标签页不会自动携带嵌入页的未保存内容；刷新前使用 Desmos 自身保存或分享。
- 内部界面由 Desmos 控制，外部容器沿用工具箱；没有读取表达式、导出本站 JSON 或保存到本站笔记的跨域桥接。
- 删除旧解释器、Qalculate 绘图适配、模型、采样及数值 Worker、渲染器、参考模块，以及专属 JSXGraph 运行包、归档、导入器与旧测试。普通 Qalculate 计算器与其他工具保留。
- 导航、帮助、科普、依赖声明、许可目录、隐私说明和测试映射同步调整。远程网站不冒称本地开源依赖。

## 参考

先通过 SearchProject 检索 iframe 所有者，再检索 Omni Tools 参考库。
Omni Tools 仓库 https://github.com/iib0011/omni-tools ，固定提交 60bc64f5a6974f3c802c5ec06cb3cf7f824485e1，src/components/input/ToolPdfInput.tsx:7 使用 iframe 展示本机 PDF。这仅用于对照嵌入容器，不构成外站授权或生命周期实现依据；本轮未复制其代码。

Desmos 官方指南 https://help.desmos.com/hc/en-us/articles/202529279-Desmos-Graphing-Calculator-User-Guide 和不等式文档 https://help.desmos.com/hc/en-us/articles/4407885334285-Inequalities-and-Restrictions 支持科普中的数学表达式示例。

## 本轮验证

- 加载知识模型与能力登记成功，未保留删除模块的运行导入。
- scripts/browser-function-plot.mjs 的本地模拟服务验证：1440、320 两种宽度；首页无外站请求、首次进入加载、切换后内容保留、无横向溢出、备用链接、安全属性、无错误项目来源页脚以及销毁清理。
- DESMOS_LIVE=1 的真实官网验证：中文网页加载，实际输入 y=x^2，官方无障碍文本确认“有图表”，画布检测到已绘制的红色曲线；桌面与手机视口均截图检查。
- 账号登录、云端保存与分享未操作。没有将 iframe load 事件当作远程计算器成功证据；不承诺其他网络或未来上游策略一直允许嵌入。
