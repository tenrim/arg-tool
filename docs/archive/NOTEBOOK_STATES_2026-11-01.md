> 历史记录，仅用于追溯。现行规则见 [开发指导](../DEVELOPMENT_GUIDE.md)，不要按本页旧版本、旧部署状态或测试清单执行当前任务。

# 笔记本按钮状态统一

用户反馈笔记本悬停颜色不一致。本轮检查发现外围已经使用共享 Button，但公共 CSS 后部的页头规则覆盖了所有按钮背景；primary 另有文字颜色补丁。普通按钮的悬停底色为灰色，Vditor 工具栏则独立使用黄色，两者不一致。

修复在 `public/ui/components.css`：移除页头透明背景及 primary 字色补丁，保留尺寸规则；普通按钮的悬停／键盘焦点和 Vditor 适配共用两项颜色令牌；primary 保留黄底深字并统一键盘焦点反馈；选中项保留选中背景，Vditor 禁用项不再响应黄色悬停。原生组件、编辑器节点、保存流程、Animate UI 运动与固定第三方字节不变。

参考编码：先运行 SearchProject 查询 notebook hover，确认共享 CSS 与 Animate UI 所有者；再查询 IT-Tools 的 button hover。参考仓库 https://github.com/CorentinTh/it-tools ，固定提交 d505845f918e946ec300af7b36efc107e2f66e9e，src/ui/c-button/c-button.theme.ts:5–24 以 createState 将前景／背景及 hover、pressed 配对。仅参考状态归属方式，未复制代码或引入依赖。本站已装 Animate UI 的 tools/ui-runtime/node_modules/@animate-ui/react/dist/internal/item-highlight.js:183–197 会读取按钮实际背景并迁移到高亮层，因此浏览器验证同时检查该层，不将按钮内联透明误判为无背景。

本轮验证：

- browser-notebook-states：1440（正常动态）、800、320（减少动态），覆盖普通操作、视图选择、编辑器按钮与标题菜单、导入导出弹窗、禁用项、键盘焦点和共享 secondary / quiet / icon / danger / custom 代表；桌面侧栏保留同一编辑器节点与正文，保存成功，无横向溢出或页面错误。
- browser-header-actions：320×534 触屏与 1440×900，验证新建笔记默认、焦点及悬停可读，实际新建／改名／保存，以及页头内外 primary 样式相同。
- 截图仅用于本地核对，不生成用户要求取消的前后对照报告。

本轮未部署、提交或推送。
