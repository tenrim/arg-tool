> 历史记录，仅用于追溯。现行规则见 [开发指导](../DEVELOPMENT_GUIDE.md)，不要按本页旧版本、旧部署状态或测试清单执行当前任务。

# 2026-10-26 参考案例与工作区重新组织

本轮针对用户“整体界面仍不协调，希望参考成熟设计案例”的反馈。以前一轮空间利用修复后的页面作为基线，先查看真实案例，再调整共享工作区、动作层级和主题。本轮在本地完成，未部署、提交或推送。

## 实际参考

| 来源 | 本轮看到／读到的内容 | 本站采用的方式 |
| --- | --- | --- |
| [IT-Tools Base64 转换页](https://it-tools.tech/base64-string-converter) | 等待表单实际加载后查看：单个转换任务有完整表面，输入结果标签明确，复制靠近结果 | 将原来三块独立框收为一个工作区，区内明确设置、执行、输入和结果；本站仍用真实方向下拉框 |
| [shadcn/ui Field](https://ui.shadcn.com/docs/components/base/field)、[Empty](https://ui.shadcn.com/docs/components/base/empty) | 实际表单示例和官方空态组成：字段成组、操作分主次、空态说明下一步 | 设置字段归组，主执行按钮突出，结果辅助操作使用 quiet；空结果给出明确文字，实际成功后显示原完整结果 |
| [Omni Tools 固定源码](https://github.com/iib0011/omni-tools/tree/60bc64f5a6974f3c802c5ec06cb3cf7f824485e1) | 本地核对 ToolInputAndResult 和 ToolOptions 的真实组合；线上页面本轮停在加载，未用其加载截图作为完成案例 | 输入／结果按可用宽度并排，设置有自己的布局所有者；保持本站参数在输入结果上方的契约 |

公开案例截图位于 `outputs/ui-design-20261026/references/`。仅借鉴组织原则；没有复制参考项目代码、图标、素材或字体，没有新增依赖、升级 Animate UI 或替换现有渲染器。

参考编码按项目要求先查本站 ConversionLayout、resultRecording、heading-actions，再查批准参考库，并核对实际 HEAD：

- IT-Tools：`d505845f918e946ec300af7b36efc107e2f66e9e`，`src/layouts/tool.layout.vue:55-76`、`src/tools/base64-string-converter/base64-string-converter.vue:28-100`。
- Omni Tools：`60bc64f5a6974f3c802c5ec06cb3cf7f824485e1`，`src/components/ToolInputAndResult.tsx:13-27`、`src/components/ToolContent.tsx:90-115`、`src/components/options/ToolOptions.tsx`。

## 改动

1. 统一工作区：外层一个 Card，设置与执行为不同区段，输入／结果内部不重复画外框。统一内区标题，保留原控件、字段名称、上传器、取消和原始字节。
2. 主次动作：执行仍使用琥珀主按钮；复制、下载、作为输入及笔记／图稿操作使用较轻外观。CyberChef 笔记操作并入同一结果动作组，保留原租约与失效规则。
3. 真实空态：CyberChef 空结果改为共享 EmptyState；成功后仍由 resultView 渲染完整真实内容。删除 workspace.css／chef-tools.css 中按 p 子节点猜空态的旧外观规则，消除与新组件的冲突。
4. 视觉角色：黑色／琥珀品牌继续保留，背景与表面改为中性暗色，统一 8px 圆角，减轻扫描线强度；选择器和来源信息使用界面字体，实际代码和数据保留等宽字体。来源、用途、许可与原文入口完整可见，降低其视觉权重。
5. 页面焦点：复现到 main 获得程序焦点后出现整页 2px 琥珀轮廓。只移除非交互 main 的外框；保留焦点落点、跳转链接和可操作控件的可见焦点。

## 本轮验证与查看

- 9 个代表工具在 1920／1280／390px 下复拍，前后各 27 张，无页面异常或整页横向溢出。没有把旧 527 页图册当成本轮复拍结果。
- `scripts/browser-ui-consistency.mjs` 在 1920／768／390px 下通过。新增断言覆盖统一表面、区段标题、明确空态、空态到真实文本切换、结果动作租约、main 焦点外观；同时保留实际 MIDI 读取、WAV 元数据提取、返回后导出、琴键交互、草稿、许可展开、普通／减少动态与大字号检查。
- 修改代码语法、共享 UI 所有权和差异空白检查通过。未执行无关引擎整套测试或构建。
- 图册：`outputs/ui-design-20261026/index.html`；交互预览：`http://127.0.0.1:16332/`。预览只配置本机静态工具，在线查询与问题反馈服务未配置。

本轮代码范围：`public/ui/conversion.js`、`components.css`、`public/ui-theme.css`、`public/chef-tools/task-view.js`、`result-view.js`、`public/handoff/button.js`、`public/result-recording.js`、`public/capabilities/native-workspaces.js`、`public/expansion/morse-view.js`、`public/workspace.css`、`public/chef-tools.css`；持久回归与组件文档同步更新。其他既有工作区改动保留。

## 用户纠正后的实施

用户明确否定本轮配色调整，后续以 ARG 编年史实际源码为准：`ARG编年史相关/index.html:25-51` 的 navy／amber／cyan 色值及字体、`assets/css/index.css:48-68` 的完整扫描线（含 RGB 细纹）。该仓库当前 HEAD 为 `f0035aadea1c52aecc03993bfbe66532617ba265`，index.html 存在本机改动，以读取到的当前样式为准。此前中性配色、8px 卡片圆角及减弱扫描线的方案已撤回。未引入第三方依赖。

共享转换控件改为参数和执行同行、空间不足自然换行，空结果减少占位。只检查键盘位置与替换、音频元数据和摩斯双向表单在 1920／1280／390px 的布局，以及真实键盘转换、扫描线开关；无横向溢出或页面异常。未生成新对照图册，未部署。


## 全站共用布局修正（2026-10-26，后续轮次）

本轮按用户要求遍历全部当前公开入口、方向、专题变体、科普及网站页面，共 872 条唯一路由；未生成对照图册。修复共享所有者，而非按截图页打补丁：

- 复合字段增加 wide 宽度，修正普通 Field 优先级覆盖 full 的问题，字符表预设与编辑框可同行。
- resultRecording 把真实按钮放回原 Toolbar／Card，消除 SplitView 中意外出现的第三列；笔记按钮和其他结果动作自然换行。
- SplitView、收藏／分组、符号及资料双栏按内容高度展示；旧只读结果框使用有上限的内容高度，取消文件结果固定 330px。旧浏览器保留 rows 回退。
- Card 主题由共享组件明确拥有，清理旧 ct-tool 侧栏和参数网格规则，保留编年史颜色、字体、直角和完整扫描线。

参考编码先查本站 schema／resultRecording／ConversionLayout，随后读取 CyberChef `11b86fecdb5d8f6244cf931e1f87cec887ec1f1f` 的 `src/web/HTMLIngredient.mjs:190-245`：editableOption 将预设与值归入同一个宽输入组。参考其组合关系，未复制第三方代码或增加依赖。

实际验证：1440px 与 390px 各遍历 872 条路由，无页面异常、未容纳的横向溢出、游离笔记动作列或超过 150px 的空只读编辑器；卡片颜色和圆角符合共享主题。桌面扫描暴露的资料等高问题修复后，另复查 12 个资料入口／变体，无剩余记录中的大块卡片底部空白。数据在 `outputs/ui-global-20261026/`。这属于布局遍历，不等于全部算法功能验收。

`scripts/browser-ui-consistency.mjs` 在 1920／768／390px 通过：实际 Base32 标准／自定义预设输出、预设改变立即作废结果动作、旧 textarea 写入后增长及清空收缩、汉字结果按钮归属，以及原有 MIDI／WAV、琴键、草稿、来源、字号和动态偏好检查。新增截图输出默认关闭；需要时显式设置 UI_CONSISTENCY_SCREENSHOTS=1。修改文件语法与 UI 所有权检查通过。仅本地预览，未部署、提交或推送。


### 无参数转换页的结构遗漏

用户再次指出脱字符与 M 解码页仍沿用旧结构。上一轮几何扫描未检出“按钮单独占一行、来源选择器把左侧输入下推”的布局问题；无溢出不代表布局已经改善。本轮把 taskView 的真实输入来源 Field 移入共用参数／执行栏，保留输入卡片的文件、编辑器及来源预览；原 mode 所有者同步管理来源显隐。无参数页的来源与执行同行，输入与结果正文顶部对齐。没有改颜色或扫描线。

参考本站 ConversionLayout／taskView，并核对 IT-Tools `d505845f918e946ec300af7b36efc107e2f66e9e` 的 `src/layouts/tool.layout.vue:60-73`（按内容宽度换行与顶部对齐）及 `src/tools/base64-string-converter/base64-string-converter.vue:28-59`（选项位于编辑区之前）；只适配排列关系，未复制代码。

本轮限定运行 `UI_CONSISTENCY_SCOPE=conversion-source node scripts/browser-ui-consistency.mjs`：1920／768／390px 的脱字符解码、音频元数据及扩展字节编码均通过；实际文本／文件转换输出、作为输入、草稿与结果失效仍通过。1440px 实际截图另做视觉核对，未生成对照图册。没有重跑或冒称新的 872 页全站验收。
