---
capabilityId: native:codepoint
title: Unicode 码点
topicGroup: characters
summary: 区分码点、标量值、码元和字素簇，解释十六进制码点记法。
aliases:
  - Unicode 码位
  - Code point
  - U+ 编号
sources:
  - id: unicode
    title: The Unicode Standard 16.0 — Conformance
    publisher: Unicode Consortium
    url: https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-3/
    language: en
    kind: standard
    locator: 第 3.6、3.8、3.9 节
  - id: python
    title: Unicode 指南
    publisher: Python 软件基金会
    url: https://docs.python.org/zh-cn/3/howto/unicode.html
    language: zh-CN
    kind: official-doc
    locator: 码位、字形和字符编码
  - id: tool
    title: 字符编码转换规则
    publisher: 迷雾工具箱
    url: /basics/foundation.js
    language: zh-CN
    kind: implementation
    locator: foundationRecipe 和 validateCodes
  - id: seg
    title: Unicode Text Segmentation
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr29/
    language: en
    kind: standard
    locator: 扩展字素簇定义
---

## 介绍
<!-- sources: unicode, python -->

Unicode 码点是字符编码空间中的编号，范围为 U+0000 至 U+10FFFF。通常写成 U+ 加十六进制数字。Unicode 的码点空间还包含未分配位置、代理区与其他非普通图形字符的位置。

## 码点与字形
<!-- sources: unicode, python -->

字形由字体和上下文决定，码点则用来辨认文本中的实际值。看起来相似的字形可属于不同字符，同一个码点也可能由不同字体绘成不同的样式。

:::example 同形字母
[输入]
拉丁大写 A 与西里尔大写 А
[结果]
拉丁 A：U+0041
西里尔 А：U+0410
[说明]
两者外观相似，编码空间里却位于不同位置。比较文本时应以实际编号为准。
:::

## 标量值和代理区
<!-- sources: unicode, tool -->

U+D800 至 U+DFFF 为 UTF-16 的代理区。Unicode 标量值排除这段范围。代理码元在规定的高、低顺序成对出现时，用于计算补充平面中的一个码点。单个代理码元无法作为独立 Unicode 标量值编码到 UTF-8。

:::example 代理对合并
[输入]
UTF-16 码元 D83D DE00
[结果]
U+1F600
[说明]
高代理减 D800 得 0x3D，低代理减 DC00 得 0x200。将前者左移 10 位，加后者和 0x10000，得到 U+1F600。
:::

## 字素簇
<!-- sources: unicode, python, seg -->

多个码点可以一起构成一个用户可感知的字符。书写系统的组合标记以及某些 Emoji 序列均会出现这种情况。按 Unicode 的默认规则分割字素簇，与逐码点或逐存储单元遍历有不同结果。

:::example 组合重音
[输入]
é 与由 e 加组合尖音符构成的 é
[结果]
第一种：U+00E9
第二种：U+0065 U+0301
[说明]
两种形式可能显示一样，第二种有两个码点，并通常占一个扩展字素簇。
:::

## 编号与字节的比较
<!-- sources: unicode, python, tool -->

U+ 标记描述的是编号，UTF-8 或 UTF-16 字节描述的是某种存储序列。需要比较原始资料时，应记录使用的编码以及查看工具展示的是码点、字节还是码元。按规范化等价比较之前，也要确定是否允许合并原来不同的码点序列。

## 常见误区

- 摘录文本时，最好保留实际码点。用肉眼相似的符号代替会改变输入。
- 一个码点的取值可超过四个十六进制数字。补充平面编号应整体读取。
- 字节数、码点数和字素簇数分别回答不同的问题，不能直接互换。
