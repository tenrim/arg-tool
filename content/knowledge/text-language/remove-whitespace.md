---
capabilityId: op:Remove%20whitespace
title: 移除空白字符
topicGroup: text-language
summary: 移除空白字符按种类删除空格、制表、换行等字符。字符外观相近时仍要依据实际码点和用途处理。
aliases:
  - Remove whitespace
  - 删除空白
  - CRLF
  - 制表符
  - 换页
sources:
  - id: unicode
    title: Unicode 17.0 Property List
    publisher: Unicode Consortium
    url: https://www.unicode.org/Public/17.0.0/ucd/PropList.txt
    language: en
    kind: standard
    locator: White_Space 属性表
  - id: lexical
    title: ECMAScript — White Space and Line Terminators
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html
    language: en
    kind: standard
    locator: White Space 与 Line Terminators 的字面条件
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Remove whitespace，指定字符过滤及可选删除句点
---

## 介绍
<!-- sources: unicode, lexical -->
空白可以用来分隔单词、列、行和页面。空格、制表符、回车和换行都可制造间隔或改变位置，但对应不同字符。清理材料前，先确定哪些间隔属于有意保留的结构。

## 空格与制表符
<!-- sources: unicode, fixed -->
普通空格 U+0020 是字符本身，制表符 U+0009 的显示宽度则随阅读环境计算。删除一种并不会自动删除另一种。仅要合并同一行中的普通空格时，制表分列仍可保留。

:::example 只删除普通空格
[输入]
A[空格]B[TAB]C[CR][LF]D[FF]E.
[结果]
AB[TAB]C[CR][LF]D[FF]E.
[说明]
方括号表示实际字符。句点、制表、回车、换行和换页均保留。
:::

## 行终止和换页
<!-- sources: unicode, lexical, fixed -->
回车 CR 为 U+000D，换行 LF 为 U+000A，某些文件把它们相连形成 CRLF。换页 FF 为 U+000C。跨平台文本可能混用分行形式，若只去掉 CR 或 LF 的一种，文件中仍可存在另一种。

:::example 删除五类指定空白
[输入]
A[空格]B[TAB]C[CR][LF]D[FF]E.
[结果]
ABCDE.
[说明]
对素材中出现的空格、制表、回车、换行和换页分别执行删除，普通句点继续保留。
:::

## Unicode 里同样留白的字符
<!-- sources: unicode, lexical, fixed -->
Unicode 的 White_Space 属性还包括不换行空格 U+00A0、全角空格 U+3000 等。处理范围取决于选择的字符集合。只处理 ASCII 的固定规则可保留这些表面相似的空白。

:::example 区分三种外观相近的空格
[输入]
A[U+00A0]B[U+3000]C[U+0020]D
[结果]
A[U+00A0]B[U+3000]CD
[说明]
按照删除普通空格的规则，只有 U+0020 被去掉。另两种 Unicode 空白仍在原位置。
:::

## 行列关系和数据可读性
<!-- sources: lexical, fixed -->
程序、诗歌、日志和表格可能以空白提供必要结构。清理后可与原文对照，确认是否丢失字段边界或自动换行。任何另行选择删除的非空白标点，也应作为单独的修改来核对。

## 常见误区
- CRLF 由两个实际字符构成，不等同于一个 CR 或 LF。
- 各种 Unicode 空白在屏幕上可能难以区分，宜查看码点。
- 句点属于标点，删除它和删除空格是不同操作。
