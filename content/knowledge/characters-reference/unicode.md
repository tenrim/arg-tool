---
capabilityId: native:unicode
title: Unicode 字符表
topicGroup: characters-reference
summary: 按码位读取 Unicode 名称、属性与编码，并区分单个码位与用户感知字符。
aliases:
  - Unicode
  - 码点
  - 字符表
  - U+0041
  - UTF-8
sources:
  - id: core
    title: The Unicode Standard 17.0.0, Chapter 2
    publisher: Unicode Consortium
    url: https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-2/
    language: en
    kind: standard
    locator: 第 2.4、2.5、2.11 节 码点、编码形式与组合字符
  - id: ucd
    title: Unicode Character Database 17.0
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr44/tr44-36.html
    language: en
    kind: standard
    locator: Name、General_Category、Blocks、数值和属性
  - id: cluster
    title: Unicode Text Segmentation
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr29/tr29-47.html
    language: en
    kind: standard
    locator: 第 3 节扩展字素簇
  - id: query
    title: Unicode 资料解码与字段
    publisher: 迷雾工具箱
    url: /reference/core.js
    language: zh-CN
    kind: implementation
    locator: unicode 分支与字节、序列的输出字段
---

## 介绍
<!-- sources: core, ucd -->
Unicode 用抽象字符描述文字等符号，并为可编码对象指定码位。U+ 后的十六进制数字说明码位。编码形式如 UTF-8 和 UTF-16 用不同单位保存同一码位。

## 码位、字形与字符身份
<!-- sources: core, ucd -->
字符是可在文本中辨识的抽象对象。字体决定字形，字形相近不代表编号相同。标准名称、一般类别、文字系统和区块等字段提供独立的信息，适合在交换文本时保留。

:::example 日文平假名的登记
[输入]
あ 或 U+3042
[结果]
U+3042 HIRAGANA LETTER A，十进制 12354
[说明]
十六进制 3042 等于 3×4096＋4×16＋2。
:::

## UTF-8 字节和 UTF-16 单元
<!-- sources: core, query -->
UTF-8 将一个标量值写成一至四个字节。UTF-16 的基本单元是 16 位，补充平面上的一个标量值占两个代理单元。高、低代理码位各自不能当作可独立写入 UTF-8 的标量。

:::example 补充平面上的表情
[输入]
😀 或 U+1F600
[结果]
码位 U+1F600，UTF-8 为 F0 9F 98 80，UTF-16 为 D83D DE00
[说明]
同一个标量值在两种编码中使用的存储单元不同。
:::

## 组合序列与字素簇
<!-- sources: core, cluster, query -->
看起来是一个符号的文本可以包含多个码位。例如组合音标、连字符和表情连接符可参与形成一个字素簇。浏览码位时宜保留各标量的顺序，不能用只识别视觉外形的截取方式替代。

:::example 无可见边框的控制记号
[输入]
U+200D
[结果]
ZERO WIDTH JOINER，UTF-8 为 E2 80 8D
[说明]
这是零宽连接符。在某些文字或表情序列中影响呈现，本身通常不占可见宽度。
:::

## 区块、文字系统与数据库版本
<!-- sources: core, ucd, query -->
区块表示连续的码位范围，属性可将不同区块中的字符归入同一个文字系统。字符表还可能含尚未分配的位置、控制码和私用区。识别时应给出 UCD 版本；本表所用版本为 Unicode 17.0。

## 常见误区

- U+1F600 的十六进制数字不等于输入文件中依次出现的字节。
- 可见的一个表情可能由多个码位构成。
- 代理码位只能按 UTF-16 的配对规则使用。
- 字体缺少字形不等于标准没有收录该码位。
