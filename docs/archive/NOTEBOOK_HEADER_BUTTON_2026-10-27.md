> 历史记录，仅用于追溯。现行规则见 [开发指导](../DEVELOPMENT_GUIDE.md)，不要按本页旧版本、旧部署状态或测试清单执行当前任务。

# 笔记本页头按钮可读性修复

对应反馈编号 `e72f388f-bb1a-4c49-b35c-3ff43808ffae`。在 320×534 触屏深色视口复现：“新建笔记”的背景被共用页头样式设为透明，文字却继承普通主按钮的 `--bg` 深色；修复前实际颜色为 `rgb(10, 14, 23)`，与深色页面背景混在一起。

修复 `public/ui/components.css` 的页头主操作配色契约：透明底默认使用 `--ink` 浅白文字，悬停出现橙色底层时使用 `--bg` 深色文字。适用于共用页头内以 variant 或旧 primary-button 类登记的主按钮，不按 notebook-new ID 打补丁，也不改变页头外主按钮的配色。

参考编码：先检索本站 notebook-new／button primary color，再检索 IT-Tools 固定提交 `d505845f918e946ec300af7b36efc107e2f66e9e`，具体源码 `src/ui/c-button/c-button.theme.ts:5-26` 中 createState 同时声明默认、hover、pressed 的文字与背景配对。仅参考状态配色组织，无代码复制、新依赖或 vendor 修改。

定向浏览器回归 `scripts/browser-header-actions.mjs` 已通过：320×534 触屏、1440×900 桌面默认文字均为 `rgb(226, 232, 240)`；键盘焦点可见，手机真实新建／编辑／保存成功，桌面悬停橙底深字、移开后恢复浅白字；页头外主按钮仍保留原有填充配色。悬停背景检查读取 Animate UI 实际 sibling shadow 绘制层，不误把原按钮透明层判为无背景。上述操作无页面脚本异常；没有据此认定报告中其他路径的 TypeError 已修复。

只检查本轮配色规则、直接使用方和差异，未运行整站套件。当前为本地修复，尚未部署。
