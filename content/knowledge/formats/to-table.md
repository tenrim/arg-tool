---
capabilityId: op:To%20Table
title: 转表格
topicGroup: formats
summary: 行列分隔文本可写成固定宽度文本、HTML 表格或 Markdown 表格。输出的表头、边框和转义规则因格式而异。
aliases:
  - To Table
  - 数据转表格
  - TSV
  - PSV
  - 纯文本表格
sources:
  - id: csv
    title: RFC 4180 — Common Format and MIME Type for CSV Files
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4180.html
    language: en
    kind: standard
    locator: 第 2 节，记录、表头与带引号字段
  - id: gfm
    title: GitHub Flavored Markdown Spec
    publisher: GitHub
    url: https://github.github.com/gfm/#tables-extension-
    language: en
    kind: standard
    locator: 第 4.10 节，表头、分隔行及管道字符处理
  - id: html
    title: HTML Living Standard — Tabular data
    publisher: WHATWG
    url: https://html.spec.whatwg.org/multipage/tables.html
    language: en
    kind: standard
    locator: 第 4.9 节，table、tr、th 和 td
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: To Table，分隔符、表头和三种表格输出
---

## 介绍
<!-- sources: csv, gfm, html -->
制表先把输入分成记录和字段，再将每个字段放到相应的行列。可输出供终端阅读的固定宽度文本，也可使用 Markdown 或 HTML，以便支持这些语法的阅读器展示为网格。

## 分隔符与列位置
<!-- sources: csv, fixed -->
记录分隔符确定新一行，字段分隔符确定同一行中的列。竖线、制表符和逗号都可能作为输入分隔符。若字段本身含分隔符，引号及转义规则由输入格式决定，单纯按字符切分无法恢复字段边界。

:::example 竖线分列后转 Markdown
[输入]
Name|Score
Ada|7
Lin|12
[结果]
| Name | Score |
| ---- | ----- |
| Ada  | 7     |
| Lin  | 12    |
[说明]
以首行作为表头。分隔行由 Markdown 语法需要，与原数据中的记录无关。
:::

## 固定宽度文本
<!-- sources: fixed, gfm -->
纯文本表格可按各列内容调整宽度，用空格补齐，用横线与竖线划分边框。它保持行列关系，但边框和补位字符属于显示。应在等宽字体下查看，宽字符和组合符也可能对列对齐产生影响。

:::example 用纯文本画出列框
[输入]
Name|Score
Ada|7
Lin|12
[结果]
+------+-------+
| Name | Score |
+------+-------+
| Ada  | 7     |
| Lin  | 12    |
+------+-------+
[说明]
Score 列至少容纳表头所需的五个字符，数字后面的空格用来对齐右侧边框。
:::

## 表头与语法结构
<!-- sources: gfm, html, fixed -->
HTML 可用 th 明确声明表头格，td 表示数据格。GitHub Flavored Markdown 表格按第一行、分隔行、数据行识别。即使输入未声明表头，用 Markdown 写出时，只要第一行后有有效分隔行，阅读器也会视第一行为表头。

:::example Markdown 的首行保留结构作用
[输入]
A,B
C,D
[结果]
| A | B |
| - | - |
| C | D |
[说明]
这段文本可作为 Markdown 表格解析，第一行 A、B 会被当成表头。希望两行均为普通数据时，需另加列名或选用支持无表头表格的输出格式。
:::

## 格内的文字和专用字符
<!-- sources: csv, gfm, html, fixed -->
目标格式可能把某个普通文本字符当作语法，例如 Markdown 表格里的竖线。需要把它作为单元格内容时，必须使用目标语法认可的转义。原始数据带复杂引号、竖线或换行时，可同时检查生成的文本和阅读器实际分列效果。

## 常见误区
- 补齐列宽的空格属于显示层，不能重新当作分隔数据。
- Markdown 的分隔行是结构，原始表格数据没有这条记录。
- 输出某种表格语法后，字段里的专用字符仍需按该语法处理。
