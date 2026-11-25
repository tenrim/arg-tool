---
capabilityId: native:roman
title: 罗马数字
topicGroup: characters
summary: 用七个符号和六组常见减法规则表示整数，再用规范写法排查含混输入。
aliases:
  - Roman numerals
  - 罗马数字
  - IV
  - IX
sources:
  - id: bnu
    title: 从罗马数字的书写错误说起
    publisher: 北京师范大学出版科学研究院
    url: https://pub.bnu.edu.cn/jzyg1/92686.html
    language: zh-CN
    kind: official-doc
    locator: 基本符号及常见相加相减写法
  - id: uc
    title: Number Forms
    publisher: Unicode Consortium
    url: https://www.unicode.org/charts/PDF/U2150.pdf
    language: en
    kind: standard
    locator: 罗马数字兼容字形
  - id: code
    title: 罗马数字互转与规范验证
    publisher: 迷雾工具箱
    url: /basics/core.js
    language: zh-CN
    kind: implementation
    locator: Roman 输入、正规化和回编码验证
  - id: impl
    title: romanice 转换
    publisher: romanice 项目
    url: /vendor/basics/roman-converter.js
    language: en
    kind: implementation
    locator: toRoman、fromRoman
---

## 介绍
<!-- sources: bnu, impl -->
现代常见的罗马数字由 I、V、X、L、C、D、M 七个基本符号组成，分别表示 1、5、10、50、100、500、1000。读数依赖符号的组合和值，在常见教材规范中会用特定减法写法。

## 累加与减法组合
<!-- sources: bnu, impl -->
小值写在较大值右侧时通常累加，例如 VI＝6。在规定的短组内，小值写在较大值左侧表示减去小值。六组通用形式为 IV、IX、XL、XC、CD、CM，分别表示 4、9、40、90、400、900。

:::example 将减法组合用于各位
[输入]
2049
[结果]
MMXLIX
[说明]
MM 为 2000，XL 为 40，IX 为 9。
:::

## 规范序列与回编码检验
<!-- sources: bnu, impl, code -->
可以按千、百、十、个位分别构造片段，然后将它们连接起来。解码时可先算出整数，再将该数按规范格式重写并比对。能算出一个数不代表原写法符合约定。

:::example 唯一写法的校验
[输入]
IC 和 XCIX
[结果]
IC 在此口径下不接受；XCIX 表示 99
[说明]
99 按十位 90 与个位 9 分开，得到 XC 与 IX，不能用整百减 1 的任意组合代替。
:::

## Unicode 兼容字形
<!-- sources: uc, code -->
同一视觉记号可写成独立的罗马数字兼容字符，也可由拉丁字母组合。在这一入口中先将兼容字形正规化并统一大小写，再进行范围与规范写法验证。

:::example 一次解三个值
[输入]
Ⅳ Ⅻ mcmxcix
[结果]
4
12
1999
[说明]
前两个兼容符号分解成 IV、XII，末项转大写后为 M＋CM＋XC＋IX。
:::

## 数值边界与历史写法
<!-- sources: bnu, uc, code -->
这里采用 1 至 3999 的常用规范。某些历史铭文、钟面和更大数值体系可能用不同记号，读历史材料需要参考其自身约定。有上划线的记数及零没有在这套互转口径中定义。

:::example 范围内最大值
[输入]
3999
[结果]
MMMCMXCIX
[说明]
3000、900、90 和 9 分别表示为 MMM、CM、XC 和 IX。
:::

## 常见误区

- 仅按小数在前就相减，会接收 IC 等非规范组合。
- 兼容字符 Ⅳ 与两个拉丁字母 IV 不同码点，可在正规化后等价。
- 钟表上的 IIII 属于具体传统，不属此转换的规范输出。
- 3999 是这里的功能范围边界，不代表一切历史体系都不能表示更大的量。
