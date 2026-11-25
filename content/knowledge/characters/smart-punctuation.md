---
capabilityId: op:Escape%20Smart%20Characters
title: 智能标点替换
topicGroup: characters
summary: 用预设 ASCII 近似符号替换排版标点，区分自定义映射、字符遗漏和不可逆的变化。
aliases:
  - Escape Smart Characters
  - 排版标点兼容处理
  - 弯引号替换
sources:
  - id: punct
    title: General Punctuation（U+2000–U+206F）
    publisher: Unicode Consortium
    url: https://www.unicode.org/charts/PDF/U2000.pdf
    language: en
    kind: standard
    locator: 码表及字符名称
  - id: uax15
    title: Unicode Normalization Forms（UAX #15）
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr15/
    language: en
    kind: standard
    locator: 第 1.1、1.2 节，等价性与四种形式
  - id: catalogue
    title: CyberChef 固定操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Escape Smart Characters
  - id: worker
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Escape Smart Characters 的 run 方法
---

## 介绍
<!-- sources: punct, catalogue -->

排版引号、弯撇号、连字符和破折号各有不同码点。在只支持简单字符集的系统里，可以按约定把一部分排版符号换成 ASCII 近似符号。这个过程依靠明确的对应表，而非按字形猜测。

## 单字符与多字符替代
<!-- sources: punct, worker -->

一个排版字符可以产生多个 ASCII 字符。U+2026 是一个单独的省略号。替换方案可将它写成三个句点，因此新文本的字节数和字符下标都可能改变。

:::example 引号、破折号和省略号
[输入]
“Go” — …
[结果]
"Go" -- ...
[说明]
左右弯双引号分别变成普通双引号，长破折号变成两个连字符，省略号变成三个句点。
:::

## 相似符号的边界
<!-- sources: punct, worker -->

外形类似的横线可能用于断词、标出插入语或表示负数。替换表可以收录某些横线，同时保留表外的其他横线。判断结果要依赖明确的码点，而非只看长度或字体外观。

:::example 三种长短横线
[输入]
a—b–c−d
[结果]
a--b-c−d
[说明]
U+2014 与 U+2013 分别替换为两个和一个连字符。算式中常见的 U+2212 减号在这张对应表外，示例保留了它。
:::

## 未登记字符
<!-- sources: catalogue, worker -->

当处理目标是严格限制字符集时，表外字符有时会被丢弃或用占位符标记。保留表外字符可避免遗失内容，但仅凭已执行标点转换，不能断定输出全由 ASCII 组成。

:::example 保留未收录的字母
[输入]
“Ω”
[结果]
"Ω"
[说明]
两侧引号在表内，希腊大写 Ω 留在原序列中。结果仍包含一个非 ASCII 字符。
:::

## 与规范化的区别
<!-- sources: uax15, punct, worker -->

Unicode 规范化按字符数据库的等价关系进行分解、排序和组合。智能标点替换可以为了目标系统的限制将不同句法符号归到同一个近似写法。两边的结果可能碰巧相同，也可能保留截然不同的形状或长度。需要回溯标点细节时，要保留原序列。

## 常见误区

- 两个连字符既可能来自一个破折号，也可能原本就是两个字符。替换后没有足够的信息区分两者。
- 只换标点不会音译其余文字，也不会将所有非 ASCII 字符变成 ASCII。
- 处理前以字符位置标注的线索，在一对多替换后需要重新计算。
