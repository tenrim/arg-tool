---
capabilityId: op:Wrap
title: 文本换行
topicGroup: text-language
summary: 将已有行中的连续文字按最大代码单元数重新断行，说明空行及词界行为。
aliases:
  - Wrap
  - 定宽换行
  - 按长度断行
sources:
  - id: spec
    title: ECMA-262 Regular Expression Patterns
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-patterns
    language: en
    kind: standard
    locator: 正则断言、字符类和数量词
  - id: uax
    title: Unicode Line Breaking Algorithm
    publisher: Unicode 联盟
    url: https://www.unicode.org/reports/tr14/
    language: en
    kind: standard
    locator: 可断行机会、换行上下文与显示宽度
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Wrap：.{1,width} 全局匹配并用 LF 连接
---

## 介绍
<!-- sources: spec, uax, engine -->
文本换行将较长的文字拆成短行。这里按代码单元数量限制每段长度，并实际写入换行字符。排版系统也可以按词边界或测量宽度断行，这项操作主要用于机械地固定段长。

## 在原有行附近分段
<!-- sources: spec, engine -->
程序按规定宽度匹配连续的非换行符。旧行的内容分段后，再用 LF 连接输出。没有非换行字符的空行不会产生一段，因此原材料里的连续换行可能被压缩。

## 长度、单元与显示
<!-- sources: spec, uax -->
正则没有使用 Unicode 字符模式时，匹配的长度以 UTF-16 单元计。一个补充平面字符使用两个代码单元，多个字符还可能合成一个可见字。按数量强制切段有可能把它们分开，也不考虑字体像素宽度。

## 固定宽度例子
<!-- sources: spec, engine -->
以下用单字节英文字母作规则无关的占位字符，字符各占一个 UTF-16 单元。

:::example 六个字符切成三段
[输入]
ABCDEF，宽度 2
[结果]
AB
CD
EF
[说明]
从开头每段最多取 2 个单元。
:::

:::example 原有换行后的短段
[输入]
ABCDE
FG
[结果]
ABC
DE
FG
[说明]
宽度为 3，第一行切两段，原有第二行的 FG 单独成段。
:::

:::example 空白行不构成段
[输入]
AA

B
[结果]
AA
B
[说明]
中间空行没有任何可匹配的非换行符，宽度 3 时仍不会被保留为独立段。
:::

## 保存结构的情形
<!-- sources: uax, engine -->
原始换行可能把编号、图样或信息块对齐。处理时可保留原布局，用定长断行后的材料检查规律。要按语言的合法断行机会转排显示文本时，应使用采用 Unicode 断行规则的排版过程。

## 常见误区
- 设定宽度不会让算法自动寻找词界。
- 计算宽度以文本单元为准，字形实际宽度可不同。
- 文本的末尾换行和连续空行未必保持原样。
