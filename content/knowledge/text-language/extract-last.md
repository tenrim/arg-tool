---
capabilityId: native:extract-last
title: 每行末字提取
topicGroup: text-language
summary: 跳过空白行，读取其余每行的最后一个非空白码点并连接。
aliases:
  - 藏尾
  - telestich
  - 行尾读取
sources:
  - id: unicode
    title: ECMA-262 字符串迭代器
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string-iterator-objects
    language: en
    kind: standard
    locator: 字符串迭代按代码点长度推进
  - id: grapheme
    title: Unicode Text Segmentation
    publisher: Unicode 联盟
    url: https://www.unicode.org/reports/tr29/
    language: en
    kind: standard
    locator: 第 3 节，扩展字素簇与多个码点
  - id: engine
    title: 答案提取核心
    publisher: 迷雾工具箱
    url: /hunt-extract.js
    language: zh-CN
    kind: implementation
    locator: extractAnswer 的 last 分支、去空白和空行
---

## 介绍
<!-- sources: unicode, engine -->
每行末字提取读取每条记录清理后的最后一个码点，再按输入行序连接。材料可能有意将数字、标点或异体符号安排在各行结尾。

## 去掉空白后判断末尾
<!-- sources: unicode, engine -->
空行不参与。每行都剔除空白，包括末尾空格，随后以剩下的码点总数确定末位。句末标点仍在文本中，如果它是最后一个非空白符号就会被取到。

## 末码点与复合字形
<!-- sources: unicode, grapheme -->
末尾的一个字形可能由多个码点完成，如含连接符的组合表情。按码点选末位时只取最后一个元素，显示结果可能仍是一个图标，但其原意义已不同。

## 末位提取例子
<!-- sources: unicode, grapheme, engine -->
以下按行读出最后一项，复核时可用原文本中的符号序列确认。

:::example 不同符号的末位
[输入]
1β
2∞
3☆
[结果]
β∞☆
[说明]
三行的末位分别为 β、∞ 和 ☆。
:::

:::example 空白去掉后保留标点
[输入]
1 -␠

␠x?␠
[结果]
-?
[说明]
␠ 表示输入中的普通空格。空白行被跳过，两个有内容的行去外围空白后分别以短横和问号结尾。
:::

:::example 复合表情的最后码点
[输入]
A👩‍💻
B🧩
[结果]
💻🧩
[说明]
👩‍💻 由多个码点组成，末位只取其中计算机图标对应的码点。
:::

## 末尾格式的确认
<!-- sources: grapheme, engine -->
末尾可能有页码、软换行或从排版复制来的隐藏字符。材料中这些字段若不属于答案，应先按其来源判断是否保留。直接忽略可见标点可能丢失题目刻意留下的符号。

## 常见误区
- 末位以去掉空白之后的文本为准。
- 行末标点仍然是文本内容。
- 组合字形不一定能以最后一个码点完整读取。
