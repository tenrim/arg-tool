---
capabilityId: op:Split
title: 分割
topicGroup: text-language
summary: 按一个字面分隔串划分记录，再用新的分隔符连接，保留空字段。
aliases:
  - Split
  - 分隔符替换
  - 拆分与连接
sources:
  - id: spec
    title: ECMA-262 String.prototype.split
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.split
    language: en
    kind: standard
    locator: 分隔字符串、空项与空分隔符
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Split：String.split 接 String.join
---

## 介绍
<!-- sources: spec, engine -->
分割先查找输入中的分隔串，把两次分隔之间的内容各自留作一项，然后用新的分隔串连接。逗号清单可因此改成逐行清单，或去除原分隔符得到紧凑的文字。

## 字面匹配和复合分隔
<!-- sources: spec, engine -->
当前输入分隔符按字面理解。设置为两个连续短横线时，只在完整的两个短横线处切开。分隔串里的正则元字符也维持原字符意义，不会自动组成正则语法。

## 空项和末尾分隔符
<!-- sources: spec, engine -->
两个分隔串紧邻会切出空项。末尾分隔符之后也有一个空项，连接后可表现为最后仍有一个新分隔符。空分隔符可拆为 UTF-16 单元，代理对和复合可见字可能由多个单元组成。

## 分割再连接的例子
<!-- sources: spec, engine -->
以下把两种分隔串都写出，便于核对空项是否被保留。

:::example 保留空字段
[输入]
A,,B,，用逗号分割，以 | 连接
[结果]
A||B|
[说明]
依次得到 A、空项、B、空项，新分隔符放在每一对相邻项之间。
:::

:::example 多字符分隔串
[输入]
01--02--03，以 -- 分割，以 LF 连接
[结果]
01
02
03
[说明]
每次匹配整个 --，不会在单个短横处另行分割。
:::

:::example 给连续字符插入标记
[输入]
abcd，用空分隔符分割，以冒号连接
[结果]
a:b:c:d
[说明]
四个 ASCII 字母各占一个单元，冒号只出现在单元之间。
:::

## 结构化表格与简单分隔
<!-- sources: spec, engine -->
当一项内容可包含分隔串，例如 CSV 的引号内有逗号，简单切分不会按字段引用规则避开它。可先按格式读取结构，再挑选要导出的字段和分隔符。

## 常见误区
- 逗号后连续两个空格属于字段的一部分，除非它们也写进分隔串。
- 空字段不会自动跳过。
- 空分隔符在 Unicode 文本里不保证按完整可见字拆分。
