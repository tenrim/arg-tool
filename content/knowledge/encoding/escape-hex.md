---
capabilityId: native:escape-hex
title: 反斜杠转义
topicGroup: encoding
summary: 解释文本与程序字面量中的反斜杠、十六进制转义和控制字符。
aliases:
  - 反斜杠十六进制转义
  - 十六进制转义
sources:
  - id: js
    title: ECMAScript Language Specification — String Literals
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#sec-literals-string-literals
    language: en
    kind: standard
    locator: EscapeSequence、HexEscapeSequence、UnicodeEscapeSequence
  - id: json
    title: RFC 8259 — JSON
    publisher: IETF
    url: https://www.rfc-editor.org/info/rfc8259/
    language: en
    kind: standard
    locator: 第 7 节 Strings
  - id: tool
    title: 转义格式与现有工具映射
    publisher: 迷雾工具箱
    url: /basics/foundation.js
    language: zh-CN
    kind: implementation
    locator: ESCAPES 与 foundationRecipe
---

## 介绍
<!-- sources: js, json -->

在某些文本语法中，反斜杠引出一个转义单元，允许用可见字符写下换行、引号、反斜杠或编号。转义含义由当前语法规定。ECMAScript 的 \xNN 用两位十六进制数表示一个码元值。

## 两位十六进制转义
<!-- sources: js, tool -->

在 ECMAScript 字符串字面量里，\x 后恰好取两位十六进制数字。序列结束后，下一个字符回到普通文本位置。小数值常可同时按 ASCII 表读出。

:::example 一段转义后接一个普通字符
[输入]
\x413
[结果]
A3
[说明]
\x41 吃掉两位十六进制数，得到 A。最后的 3 仍是字面字符。
:::

## 固定名称的控制转义
<!-- sources: js, json -->

\n、\r、\t 常分别表示换行、回车和制表符。反斜杠也可转义自身。把显示出来的转义字母看成实际代码前，要核对文本是否已由某一层解析。

:::example 实际换行和字面反斜杠
[输入]
a\nb
a\\nb
[结果]
第一项为 a、换行、b。
第二项为 a、反斜杠、字母 n、b。
[说明]
第二项开头的两个反斜杠成对形成一个字面反斜杠，后续 n 不再参与该转义。
:::

## 语法规定的可用范围
<!-- sources: js, json, tool -->

ECMAScript 支持两位的十六进制转义，JSON 采用四位 \u 转义和少数简短的控制转义。看起来相近的字符串格式也可能对同一写法给出不同判断。

:::example JSON 不能直接使用两位形式
[输入]
"\x41"
"\u0041"
[结果]
JSON 拒绝第一项。第二项读取为 A。
[说明]
两个记号可在某些语法里指向同一数值，但 JSON 的字符串语法只接受第二种写法。
:::

## 单字节与字符值
<!-- sources: js, tool -->

低于 128 的数值在 ASCII 和 UTF-8 里对应同一字节。超出这一范围时，需要区分把数字作为语言中的字符值，还是先恢复原字节再解码。例如 ECMAScript 字面量的 \xE9 直接产生 U+00E9；文本传输系统若把 E9 当作独立 UTF-8 字节，结果就不合法。

## 常见误区

- 反斜杠转义只有在适用语法里才有作用。纯文本中的两字符 \n 可以原样保留。
- 不同语言限制不同。输入包含转义符号，并不能证明它是有效 JSON。
- 处理多层文本时，每解开一层都要保留另一层所需的反斜杠。
