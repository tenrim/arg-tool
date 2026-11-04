# 文件工作区、参数预设与笔记入口

本轮为本地开发记录，不代表已提交、推送或上线。维护规则继续以开发指导和项目现行约定为准。

## 用户可见变化

| 功能 | 本轮提供的能力 | 范围与限制 |
| --- | --- | --- |
| 文件版本比较 | 比较两组文件、文件夹或 ZIP；查看新增、删除、修改、不变及疑似改名；导出报告 | 按相对路径和完整字节比较；只有内容完全相同且唯一配对才提示疑似改名。文本和十六进制预览会明确截短，不代表完整编辑差异 |
| 多文件批量处理 | SHA-256、Base64 编解码、文本换行统一、PNG/JPEG/WebP 转换；逐项下载、失败重试、成功结果 ZIP | 一次顺序处理；最多 500 个文件，单个 32 MiB、输入合计 64 MiB、输出合计 32 MiB。图片转换处理静态图，不保留动画和原始元数据 |
| 工具参数预设 | 在支持的参数区保存、应用、重命名、删除多份预设 | 最多 100 份、合计 128 KB；仅保存已获准的选择、数字、范围和开关参数，不含正文、文件、密码、密钥；应用后不自动运行 |
| 重型工具加载反馈 | CyberChef、Qalculate、延迟载入页面及新文件工作区显示实际加载或执行阶段 | 不提供虚构百分比；失败仍能重试，原控制器继续拥有取消和结果状态 |
| 笔记快捷侧栏 | 原右下角“笔记本”直接打开可编辑笔记；无笔记时自动创建；保留新建、列表、格式工具和完整页面入口 | 桌面为可调宽侧栏，窄屏为对话面板；复用同一编辑器和笔记数据库，不增加第二套草稿。打开不改变当前工具输入 |

文件处理全部在浏览器本地完成，不改写源文件。ZIP 使用已有受限解析器，保留路径并检查 CRC；加密、分卷、ZIP64 和不安全路径不在支持范围。参数预设、笔记继续使用各自原有状态所有者，输入变化或离开任务使执行立即失效。

## 参考编码

以下均为实际检查的固定版本；只借鉴相关机制，没有复制新的第三方运行代码，也没有升级现有供应文件。

| 仓库及固定提交 | 路径与行号 | 采用方式 |
| --- | --- | --- |
| `iib0011/omni-tools` · `60bc64f5a6974f3c802c5ec06cb3cf7f824485e1` | `src/hooks/useFileDrop.ts:40–90` | 参考多文件选择与回调边界，本站仍由文件工作区控制器管理队列和失效 |
| `gchq/CyberChef` · `11b86fecdb5d8f6244cf931e1f87cec887ec1f1f` | `src/web/waiters/WorkerWaiter.mjs:186–244` | 使用真实 workerLoaded 生命周期区分引擎准备和执行 |
| `CorentinTh/it-tools` · `d505845f918e946ec300af7b36efc107e2f66e9e` | `src/composable/queryParams.ts:44–65` | 参考有类型的参数存储；不采用将私密参数放入 URL 的方式 |
| `animate-ui/animate-ui` · `c28163655493f98bff9dc0362301a6242f74a1fd` | `apps/v1/apps/www/registry/primitives/radix/sheet/index.tsx:96–137` | 参考侧面板呈现；继续复用本站 Dialog、Dock 和动效所有者 |

文件算法资料见工具自带说明与科普：[RFC 4648](https://www.rfc-editor.org/rfc/rfc4648.html)、[SubtleCrypto.digest](https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/digest)、[OffscreenCanvas.convertToBlob](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob)。ZIP 复用项目已固定的 fflate 0.8.3，来源与许可保留在工具页脚和第三方清单。

## 本轮检查

- 文件模型覆盖完整字节比较、重复内容、路径、ZIP 损坏、Base64 非法填充位、UTF-8、BOM、换行和 SHA-256。
- 浏览器实测文件比较、ZIP 路径、部分批量失败、重试、结果打包、参数预设以及三种图片格式。
- 笔记覆盖桌面与 800/760/320 像素宽度，检查实际编辑保存、关闭重开、同一编辑器、原工具输入、浮动键盘共存和完整页面切换。
- 实测 CyberChef 与 Qalculate 的准备和执行消息，并检查加载失败重试、停止后无迟到结果。
- 相关知识、来源登记、测试映射、设置集成及 UI、架构边界检查通过。没有以全站回归代替本轮直接影响检查。

实现边界见 [模块边界](MODULE_BOUNDARIES.md)、[笔记本维护](NOTEBOOK.md) 和 [组件接口](UI_COMPONENTS.md)。
