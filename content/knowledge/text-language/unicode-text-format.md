---
capabilityId: op:Unicode%20Text%20Format
title: Unicode 文本样式
topicGroup: text-language
summary: 区分组合低线和叠加横划与富文本样式，并说明按字节附加符号的输入边界。
aliases:
  - Unicode Text Format
  - 组合低线
  - 组合删除线
sources:
  - id: combining
    title: Characters and Combining Marks
    publisher: Unicode Consortium
    url: https://www.unicode.org/faq/char_combmark.html
    language: en
    kind: official-doc
    locator: Combining Marks and Combining Character Sequences
  - id: marks
    title: Combining Diacritical Marks（U+0300–U+036F）
    publisher: Unicode Consortium
    url: https://www.unicode.org/charts/PDF/U0300.pdf
    language: en
    kind: standard
    locator: 码表及字符名称
  - id: catalogue
    title: CyberChef 固定操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Unicode Text Format
  - id: worker
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Unicode Text Format 的 run 方法
---

## 介绍
<!-- sources: combining, marks -->

Unicode 有些组合符可以叠到基字符上。例如 U+0332 可在下方画一条线，U+0336 可形成横向叠划。这里携带样式的是实际字符序列，转发纯文本时附加符也会一同被转发。

## 组合低线
<!-- sources: marks, worker -->

让一个字符带低线，可以在它后面接 U+0332。连续文字需对各位置分别附加，而非用一个符号包住一整段。复制出的文本会比原文本包含更多码点。

:::example 给两个基本字母加线
[输入]
Ab
[结果]
A̲b̲
[说明]
码点序列为 0041 0332 0062 0332，两个基字母各跟一个 U+0332。
:::

## 横划与重复叠加
<!-- sources: marks, combining, worker -->

组合长划叠符 U+0336 可使文字带横划。在同一个基字符后还可以出现其他组合符。显示效果由渲染器和字体决定，屏幕上的线不一定连续。

:::example 先附横划再附低线
[输入]
A，同时写入两种附加符
[结果]
A̶̲
[说明]
序列为 U+0041、U+0336、U+0332。它可以显示成一个带两种线条的字素簇。
:::

## 字符与字节的边界
<!-- sources: catalogue, worker, combining -->

按字符位置附加符号时，需要在完整码点后插入组合符。若处理器按单个字节追加，则只有 ASCII 等单字节输入直接符合这个假设。对多字节 UTF-8 输入逐字节追加会拆开本来的字节序列。

:::example UTF-8 多字节字符的对照
[输入]
é，UTF-8 为 C3 A9
[结果]
正确地在字符后加低线时，字节为 C3 A9 CC B2。
若每个输入字节后都追加低线，则字节为 C3 CC B2 A9 CC B2。
[说明]
CC B2 是 U+0332。后一串中 C3 和 A9 被分开，已经无法作为原字符的 UTF-8 表示解读。
:::

## 等价比较与去线
<!-- sources: marks, combining -->

删除这类视觉附加符可用于比较纯字母内容，但有些原始附加符也具有语言上的意义。应以明确的码点名单为依据。单纯移除 HTML 标签或普通字符样式，并不会删除文本本身携带的组合符。

## 常见误区

- 这里的线条属于 Unicode 字符数据。设定字体或清除富文本样式不会自动清理这些字符。
- 组合符没有自己的基字符时，可能显示在占位符上，也可能难以辨认。
- 组合符应附加到完整的文字单元后，不能通过把 UTF-8 文本拆成字节来代替。
