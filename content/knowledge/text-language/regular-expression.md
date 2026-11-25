---
capabilityId: op:Regular%20expression
title: 正则表达式
topicGroup: text-language
summary: 用字符集合、量词、锚点和捕获组定位文本中满足模式的片段。
aliases:
  - Regular expression
  - RegExp
  - 正则
  - 捕获组
  - 模式匹配
sources:
  - id: ecma
    title: ECMAScript Language Specification — RegExp Objects
    publisher: Ecma International TC39
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-regexp-regular-expression-objects
    language: en
    kind: standard
    locator: RegExp pattern、Assertions、Quantifier、Capture 与 flags
  - id: engine
    title: CyberChef Regex 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Regex.js
    language: en
    kind: implementation
    locator: Regular expression，测试选项与捕获组输出
---

## 介绍
<!-- sources: ecma, engine -->

正则表达式把文本结构写成可反复应用的匹配规则。模式 `[A-Z]+-\d+` 可以表示一段大写字母、一条连字符以及一段数字。检索的目的是找出满足这些关系的原文片段，并按需记下其中的字段。

## 字符集合和量词
<!-- sources: ecma -->

`[A-Z]` 指定范围内的一个字符，`\d` 表示一位 ASCII 数字。量词 `+` 要求前面的元素出现一次或多次，`{3}` 则指定正好三次。量词只约束它紧邻的字符或分组，给多个字符整体加量词时需要先把它们分组。

## 边界和捕获
<!-- sources: ecma, engine -->

锚点 `^` 和 `$` 约束匹配的起止。在多行模式中也可以在每行开头和结尾成立。圆括号包起的捕获组会随整体匹配记录对应子串，便于把同一行的编号、名称或日期分列。另一个独立选项控制点号能否匹配换行。

## 模式的可复算样例
<!-- sources: ecma, engine -->

样例按 ECMAScript 的含义逐个匹配，每个模式在输入框里只需一层正则转义。显示组内容时保留完整匹配和各组原文。

:::example 识别两个不同编号
[输入]
文本 X-12 then ID-345，表达式 ([A-Z]+)-(\d+)。
[结果]
X-12 的第 1 组是 X，第 2 组是 12。
ID-345 的第 1 组是 ID，第 2 组是 345。
[说明]
第一组捕获连字符前的字母，第二组捕获之后的数字。
:::

:::example 完整行模式
[输入]
三行文字如下，表达式 ^ID-\d+$，开启按行匹配。
ID-12
other
ID-345
[结果]
ID-12
ID-345
[说明]
锚点使符合格式的行整体进入结果，中间行不匹配。
:::

:::example 点号跨越换行
[输入]
表达式 a.b，开启点号匹配换行，输入如下。
a
b
[结果]
a
b
[说明]
这是一个跨两行的匹配。点号匹配了 a 与 b 之间的换行。
:::

## 模式的边界检查
<!-- sources: ecma, engine -->

写完规则后，可用正例、接近的负例和带额外前后缀的样例核对覆盖。为编号使用 `\d+` 可以匹配许多数字，它不会自动判断数字是否处在允许范围。不同正则引擎在断言、标志及 Unicode 属性上也有差异，迁移规则时需比较语法。

## 常见误区

- 字符集合中方括号内的多个选项只取一个字符，不能表示整词。
- 多行锚点和点号匹配换行是两个独立的标志。
- 捕获组描述已匹配片段中的子串，开启列出组不会使一个模式获得额外匹配。

