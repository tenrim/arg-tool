> 历史记录，仅用于追溯。现行规则见 [开发指导](../DEVELOPMENT_GUIDE.md)，不要按本页旧版本、旧部署状态或测试清单执行当前任务。

# 计算器系统键盘修复

日期：2026-10-31。适用于 V1.7 网页源码及本轮 Android 修复包。

## 问题与处理

综合计算器的屏幕按键、退格和历史回填会聚焦 `qalculate-expression`，以保持光标及选区。算式框此前没有声明输入模式，Android WebView 按普通可编辑文本框唤出系统键盘。

在 `public/qalculate/index.js` 创建算式框时，通过原有公共 Textarea 的 `attrs` 设置 `inputmode="none"`。保留可编辑状态、焦点、选区、长按粘贴、硬件键盘及原有输入失效处理，不使用只读或失焦阻断编辑。普通计算器与科学计算器共用此框；其他输入框未修改。

此属性的用途见 [HTML Standard：inputmode](https://html.spec.whatwg.org/multipage/interaction.html#attr-inputmode)：`none` 供页面自带键盘控件使用，请求浏览器不显示虚拟键盘。没有接入或复制第三方代码。

## 本地参考检索

- 先执行 `SearchProject -Query 'qalculate-expression'`，定位本站 `public/qalculate/index.js:13`；直接检查按键插入、退格和历史回填的 `focus()`，以及公共 Textarea 和属性工厂。
- 检索 IT-Tools，固定提交 `d505845f918e946ec300af7b36efc107e2f66e9e`，查询 `inputmode keyboard`；命中的 `src/tools/keycode-info/keycode-info.vue:7` 仅监听硬件键盘事件，与软键盘控制无关，未采用。
- 改词为 `inputmode` 后无命中，直接采用 HTML 标准属性，不编造上游实现依据。
- 产品源码已执行 `IndexProject` 增量刷新；代码文件全部入库，原有 AGENTS 解析及两个音视频素材跳过项仍保留。

## 本轮验证范围

`scripts/browser-calculator-keyboard.mjs` 在 Chromium 手机触控模拟和桌面两种上下文通过，覆盖：

- 算式框声明不显示软键盘，仍可编辑。
- 点击或触摸屏幕按键计算 `7*8=56`，保留编辑焦点。
- 退格、选区替换及后续输入正确。
- 键盘输入 `2+3` 并用 Enter 得到 5。
- 历史回填保留输入策略。
- 切科学模式后通过屏幕按键计算 `sin(0)=0`。

本轮没有连接手机。浏览器模拟验证的是输入策略和编辑行为，不能代替三星系统输入法弹出状态的真机确认。未执行无关工具或整站运行验收。

## Android 修复包

使用原发行证书，应用 ID 仍为 `cn.mistarg.toolbox`，显示版本仍为 V1.7，Android versionCode 增至 `1070002`，高于上一包 `1070001`。交付位于 `outputs/android-release/V1.7-r2/`，可直接覆盖安装原正式版，不需要先卸载。

完整构建、签名及包内文件核对结果与校验值随包保存；上一轮安装包保留在 `outputs/android-release/V1.7/`。
