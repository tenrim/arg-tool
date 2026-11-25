---
capabilityId: native:invisible
title: 隐藏字符检查
topicGroup: characters
summary: 辨认隐藏字符的码点、逻辑位置、断行、双向排列与表情组合。
aliases:
  - 隐形字符检测
  - 零宽字符检查
sources:
  - id: bidi
    title: UAX #9 — Unicode Bidirectional Algorithm
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr9/
    language: en
    kind: standard
    locator: 第 2 节，双向格式控制
  - id: lines
    title: UAX #14 — Unicode Line Breaking Algorithm
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr14/
    language: en
    kind: standard
    locator: 断行性质 ZW、GL
  - id: emoji
    title: UTS #51 — Unicode Emoji
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr51/
    language: en
    kind: standard
    locator: Emoji Presentation 和 Emoji ZWJ Sequences
  - id: core
    title: 隐藏字符的检查与分类清理
    publisher: 迷雾工具箱
    url: /basics/core.js
    language: zh-CN
    kind: implementation
    locator: inspect、emojiPreserved
---

## 介绍
<!-- sources: bidi, lines, core -->

有些 Unicode 字符很少单独画出字形，却能影响断行、书写方向或字符的组合方式。隐藏字符检查按码点扫描文本，记录这些字符的身份和位置。字形看不见无法说明原文本没有对应的字符。

## 断行和空白
<!-- sources: lines, core -->

零宽空格 U+200B 可以形成断行机会。不换行空格 U+00A0 往往具有可见宽度，却限制其附近的断行。两种字符都可能在复制后难以靠肉眼辨认，检查时需要列出具体码点。

:::example 两个字母间的零宽空格
[输入]
A[U+200B]B，方括号表示一个实际码点
[结果]
U+200B 零宽空格，码点位置 1，UTF-16 位置 1
[说明]
位置从零计算。A 在位置 0，随后是 U+200B 和 B。
:::

## 码点位置与存储偏移
<!-- sources: core, emoji -->

界面上的位置可能按码点计数，也可能按 UTF-16 码元计数。补充平面符号占两个 UTF-16 码元，此后两种偏移便会相差一个或更多。

:::example 表情符号之后的位置
[输入]
😀[U+200B]B
[结果]
U+200B 的码点位置为 1，UTF-16 位置为 2
[说明]
笑脸是一个码点，在 UTF-16 中用一对代理码元记录。
:::

## 双向格式控制
<!-- sources: bidi, core -->

双向算法区分逻辑存储顺序与渲染顺序。方向隔离和覆盖控制符可以影响画面的字符排列。定位时以原始码点顺序为准，并同时记录成对的起点和终点。

:::example 只在报告里显示控制符名称
[输入]
A[U+2067]1[U+2069]B
[结果]
位置 1：从右到左隔离起点 U+2067
位置 3：隔离结束 U+2069
[说明]
可见内容不显示控制符本身。检查报告中的位置按原始序列计算。
:::

## 可见效果与实际用途
<!-- sources: emoji, bidi, lines -->

Emoji 序列可以利用连接符组合图形，变体选择符则可能改变同一字符的展示形式。断行和方向字符也可能是正常排版的一部分。检查报告能证明字符出现过，判断有无隐藏消息还需要来源与语境。

## 常见误区

- 显示宽度为零并不等于没有作用。零宽字符仍可能影响断行或组合。
- 码点位置和 UTF-16 偏移只有在前面没有补充平面字符时才总能相等。
- 相同的屏幕画面可以由不同的码点序列产生，判断是否相同应比较实际字符。
