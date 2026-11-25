---
capabilityId: native:character-tables
title: 语言文字字符表
topicGroup: characters-reference
summary: 按语言常用字符集、Unicode 文字系统及数值属性浏览、核对和复制字符。
aliases:
  - 假名
  - 韩文字母
  - 希腊字母
  - 西里尔文字
  - 希伯来文
  - 阿拉伯文
  - 泰文
  - 天城文
  - 数字符号
  - 卢恩文字
  - 罗马数字
  - 玛雅数字
sources:
  - id: script
    title: Unicode Script Property
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr24/tr24-39.html
    language: en
    kind: standard
    locator: 区块、Script 和 Script_Extensions
  - id: cldr
    title: "LDML Part 2: General — Character Elements"
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr35/tr35-77/tr35-general.html#Character_Elements
    language: en
    kind: standard
    locator: Exemplars 及字符集语法
  - id: ucd
    title: Unicode Character Database 17.0
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr44/tr44-36.html
    language: en
    kind: standard
    locator: Name、General_Category、Blocks、数值和属性
  - id: norm
    title: Unicode Normalization Forms
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr15/tr15-57.html
    language: en
    kind: standard
    locator: 规范等价、兼容等价及韩文分解
  - id: model
    title: 语言文字字符表的编排
    publisher: 迷雾工具箱
    url: /character-tables/model.js
    language: zh-CN
    kind: implementation
    locator: 字符集、组合标记、数值和复制
---

## 介绍
<!-- sources: script, cldr -->
语言文字字符表组织一组字符和它们的 Unicode 身份，可用于辨认文字、查数字符号或核对键入的字符。语言可同时用多个文字系统，同一文字系统也可能由多种语言共享。

## 语言惯用集合与文字系统范围
<!-- sources: script, cldr, model -->
CLDR 的 exemplars 记录某语种常用或辅助字符；Unicode 的 Script 属性标识文字系统。Script_Extensions 还可标记几个系统共用的字符。区块只是连续的编码位置，可包含不同文字系统的字符。

:::example 日文共用标记
[输入]
日文平假名、片假名两表查询 U+30FC
[结果]
两表均可查到 ー
[说明]
它在名称上是片假名—平假名长音符号，Script_Extensions 允许这两种假名共同使用。
:::

## 字符显示与组合标记
<!-- sources: ucd, cldr, model -->
字符可按标准名和码点识别。一个由基字和组合记号组成的可见文本可以有多个码点。单独显示某些非间距标记时可加虚线圆辅助观察，复制和导出应保留标记原本的值。

:::example 俄语辅助字符集中的带重音序列
[输入]
а́
[结果]
U+0430 U+0301
[说明]
第一个码点是西里尔小写 а，第二个码点是组合重音。
:::

## 韩文音节与兼容字母
<!-- sources: norm, ucd, model -->
现代预组韩文音节有 11172 个，编码范围 U+AC00 至 U+D7A3。预组音节可按规范分解成组合字母。兼容字母有独立的兼容性关系，字符记录保留原码点。

:::example 预组音节的规范分解
[输入]
가
[结果]
预组 U+AC00；NFD 为 ᄀ U+1100 与 ᅡ U+1161
[说明]
一个预组码位可以规范分解成两个韩文字母，兼容字母 ㄱ U+3131 属另一条记录。
:::

## 分类与数值属性
<!-- sources: ucd, model -->
Nd 是十进制数字，Nl 是字母形数字，No 是其他数字。派生数值属性还可覆盖其他类别，例如某些汉字。数值属性表记录单字符的标准数值，分数可保留精确的整数比。这不等同于对任意历史记数文本执行求值。

:::example 同样可按数值查找的不同符号
[输入]
๑、⅓、༳
[结果]
U+0E51 数值 1，U+2153 数值 1/3，U+0F33 数值 −1/2
[说明]
三者在不同文字或符号范围，数值属性各自独立。
:::

## 常见误区

- 文字系统与语言并非一一对应关系。
- 组合标记前用于展示的虚线圆不属于实际字符。
- 字符具有数值属性不代表懂得该书写系统完整的进位规则。
- 预组与分解形式可在归一化后等价，原码位序列仍然不同。
