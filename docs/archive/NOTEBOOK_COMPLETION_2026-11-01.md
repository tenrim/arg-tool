> 历史记录，仅用于追溯。现行规则见 [开发指导](../DEVELOPMENT_GUIDE.md)，不要按本页旧版本、旧部署状态或测试清单执行当前任务。

# 笔记本、脑图与线索白板补齐

本轮为本地实现，未部署、未改版本号。原有笔记数据库及图稿格式保留。

| 审查项 | 本轮处理 |
| --- | --- |
| 白板重开改变原内容 | 移除已保存对象的样式重写；新建默认值不覆盖已保存背景、字体、填充及画笔设置 |
| 附件管理 | 删除、重命名、替换；删除正文引用会标记已移除，字面代码不改写 |
| 整张图稿管理 | 删除及配套预览清理、重命名、复制、跨笔记原子移动 |
| 历史恢复 | 原数据库记录历史快照；约五分钟自动检查点，管理操作额外检查点；最多 20 份且合计 64 MB；预览、恢复、独立下载，完整备份保留历史 |
| 图片与原生导出 | SVG、PNG 1024/2048/4096、透明背景；白板可仅导出选中对象；Excalidraw 与 Mind Elixir 原生文件 |
| 笔记组织 | 项目/文件夹、标签、置顶、四种排序、复制及批量整理 |
| 搜索 | 标题、正文、项目、标签、附件名、UTF-8 文本附件、脑图节点/备注、白板文字 |
| 笔记关联 | 正向引用与反向引用、原地打开；备份批量导入时改写导入笔记间引用 |
| 笔记与图稿 | 标题/列表形成脑图层级；关联来源支持打开笔记、主动更新与预览确认后写回；写回检查正文是否已变化 |
| 素材库 | 原 IndexedDB 增加 workspace 存储，保存与恢复白板素材；仍可使用原生素材库导入/导出 |
| 格式互通 | OPML、Markdown、JSON 型 XMind 的大纲交换；所有导入保留原文件，XMind 导出附完整本站原稿 |
| 图稿操作状态 | 保留本页会话中各图稿引擎，切换后可继续原生撤销；白板和脑图视口随图稿保存；明确重新载入会放弃旧会话 |

## 边界

- 历史从本轮启用后开始，不能找回过去未记录的版本；刷新浏览器后原生撤销栈不恢复，改用持久历史版本。超限历史最旧记录自动轮换。
- 交换格式不等于无损编辑格式。OPML/Markdown 与 JSON 型 XMind 主要交换文字、层级及备注；XMind 特有样式、布局等不承诺复刻，旧 XML 型会明确报错。完整本站图稿与原始导入文件继续保留，不能用 PNG 替代。
- 白板文字卡片最多展示 3,000 字；长笔记可按标题生成脑图，单节备注遵守 10,000 字上限，不静默截断大纲正文。
- 私有笔记、图稿、历史、素材库不进入 URL、工具搜索或偏好备份，不上传。云同步与多人协作不在本轮范围。

## 依据与所有者

- XERJ 本项目命中 `public/notebook/store.js:3` 与 `public/graphics/engines.js:13`。参考 Omni Tools 固定 `60bc64f5a6974f3c802c5ec06cb3cf7f824485e1`、`src/utils/bookmark.ts:3-37`；其公开收藏的 localStorage 做法不用于私有笔记，继续使用原 IndexedDB 事务服务，无代码复制。
- 固定 Excalidraw 0.18.1：`upstream/graphics/node_modules/@excalidraw/excalidraw/dist/types/excalidraw/types.d.ts:386` 素材库项；同目录 `data/library.d.ts:72-82`；`dist/types/utils/export.d.ts:25` 导出。
- 固定 Mind Elixir 5.15.1：`upstream/graphics/node_modules/mind-elixir/dist/MindElixir.js:506-515` 节点修改，`739-770` 缩放/移动，`2664` 起 SVG 背景；只消费现有接口，未改 vendor。
- 格式规范和随包通知见 `public/licenses/NOTEBOOK-INTERCHANGE-NOTICE.txt`，固定接入记录见 `upstream/graphics/NOTEBOOK_INTEGRATION_2026-11-01.json`。
- `notebook/model.js` 拥有记录和有界历史，`store.js` 拥有唯一 IndexedDB 及事务，`management.js` 为纯数据操作，`manager-ui.js` 通过注入的笔记队列修改。
- `graphics/interchange.js` 调用已有有界 ZIP 解析器，不另建解压器；`graphics/page.js` 拥有编辑会话，`engines.js` 适配固定绘图 API。

## 针对性验证

- `tests/notebook.test.mjs`、`tests/graphics.test.mjs`：原始字节、备份、限额、图稿模型。
- `tests/notebook-management.test.mjs`：历史备份恢复、附件/图稿处理、组织搜索、样式、素材库模型和格式交换。
- `scripts/browser-notebook-management.mjs`：1440、390 与 320 宽度，管理、附件删除/历史恢复、附件搜索、标题脑图、SVG/OPML、刷新恢复。
- `scripts/browser-graphic-contracts.mjs`：真实固定引擎，样式/视口保真、透明 PNG、选区导出校验、素材库恢复及切页撤销。
- `scripts/browser-notebook-links.mjs`：引用/反向引用、复制、批量整理、关联更新/写回及图稿移动。
- `scripts/browser-notebook-storage.mjs`：v2 数据库升级、原附件字节、并发冲突整组回滚与素材存储重开。
- 本轮改动文件的 UI 工厂/样式所有权和笔记/图稿模块边界检查；未执行整站套件。
