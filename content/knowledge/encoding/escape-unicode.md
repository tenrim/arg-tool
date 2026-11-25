---
capabilityId: native:escape-unicode
title: Unicode 转义
topicGroup: encoding
summary: 区分四位码元转义、带花括号的码点转义以及补充平面代理对。
aliases:
  - Unicode escape
  - Unicode 码点转义
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
  - id: uni
    title: The Unicode Standard 16.0 — Conformance
    publisher: Unicode Consortium
    url: https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-3/
    language: en
    kind: standard
    locator: 第 3.8、3.9 节
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

Unicode 转义把字符的编号写成由 ASCII 组成的记号，便于在程序字面量或数据格式里记录不可见字符、标点和跨文字系统的内容。它在不同语法里可表示一个 UTF-16 码元，也可直接表示一个完整码点。

## 四位写法
<!-- sources: js, json, tool -->

\u 后接四位十六进制数字。数值落在基本多文种平面的非代理范围时，一组转义通常足以表达该字符。

:::example 一个基本平面字符
[输入]
\u20AC
[结果]
€
[说明]
20AC 是欧元符号的 Unicode 编号。它的 UTF-8 表示仍为 E2 82 AC，属于另一层编码。
:::

## 补充平面与代理对
<!-- sources: uni, json, js -->

大于 U+FFFF 的码点在四位形式中需要两个码元。用码点减去 0x10000，将余数拆为高十位和低十位，分别加到 D800 和 DC00，按高、低顺序写出。

:::example 表情符号的四位转义
[输入]
😀（U+1F600）
[结果]
\uD83D\uDE00
[说明]
差值是 0xF600，高十位为 0x3D，低十位为 0x200，分别落在高代理和低代理区。
:::

## 直接写出完整码点
<!-- sources: js, json, uni -->

ECMAScript 还支持 \u{十六进制码点}，使用花括号明确编号边界。JSON 的转义语法仍采用固定四位格式，需要用两个转义单元表达补充平面码点。

:::example 两种语法读取同一个字符
[输入]
ECMAScript 字面量 "\u{1F600}"
JSON 字符串 "\uD83D\uDE00"
[结果]
两者都表示 😀
[说明]
前者写一次完整码点，后者写两个码元。把前一种直接交给 JSON 解析器会违反 JSON 的转义语法。
:::

## 解码层与组合序列
<!-- sources: uni, js, tool -->

转义解析只负责恢复码元或码点。原本由多个码点构成的组合文本，在解码后仍可以保持多个码点。若还需把预组合和分解写法视作相同，应说明所采用的 Unicode 规范化规则。

## 常见误区

- 四位转义只能读取正好四位。更长的码点须用支持的花括号语法或代理对。
- 单独的高代理或低代理没有构成有效 Unicode 标量值，不能按正常字符来解释。
- 把 UTF-8 的每一个字节分别写成一条 \u 转义，通常不能还原原始字符。
