---
capabilityId: op:To%20Lower%20case
title: 转小写
topicGroup: text-language
summary: 解释字符串的小写映射、希腊词末 Sigma、组合点及地区规则。
aliases:
  - To Lower case
  - 小写映射
sources:
  - id: unicode
    title: The Unicode Standard 16.0 — Conformance
    publisher: Unicode Consortium
    url: https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-3/
    language: en
    kind: standard
    locator: 第 3.13 节，默认大小写算法
  - id: special
    title: Unicode 16.0.0 SpecialCasing.txt
    publisher: Unicode Consortium
    url: https://www.unicode.org/Public/16.0.0/ucd/SpecialCasing.txt
    language: en
    kind: standard
    locator: 特殊映射与语言／上下文条件
  - id: ecma
    title: ECMAScript — String.prototype.toLowerCase
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.tolowercase
    language: en
    kind: standard
    locator: 整串 Unicode 大小写转换
  - id: worker
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: To Lower case 的 run 方法
---

## 介绍
<!-- sources: unicode, ecma -->

转小写使用 Unicode 的小写关系转换整个文本。它可以映射大写形式或保留不需改变的字符。是否要采用地区特定的映射，需要知道目标语言或使用的协议。

## 整串文本的上下文
<!-- sources: unicode, special, ecma -->

有些字母的小写形式受周围文字影响。希腊大写 Σ 在指定的词末上下文中写成 ς，其余常见位置写成 σ。整串处理保留了判断上下文所需的邻近字符。

:::example 希腊字母的词中和词末
[输入]
ΟΣ ΟΣΑ
[结果]
ος οσα
[说明]
第一个 Σ 在词末，用 ς。第二个 Σ 后还有 Α，用 σ。
:::

## 输出中的组合符
<!-- sources: unicode, special, worker -->

Unicode 完整的小写映射不局限于一个码点。某些大写字母的小写结果由一个基字母和附加符组成。显示时它们可能合为一个字素簇，逐字节比较仍会反映多个码点。

:::example 大写带点 I
[输入]
İ I ı i
[结果]
i̇ i ı i
[说明]
第一项变成 U+0069 与 U+0307，第二项变为不带附加符的 i。无点小写 ı 保持不变。
:::

## 字母范围之外
<!-- sources: unicode, ecma, worker -->

数字、表情符和多数标点没有可用的小写映射，通常保留原值。转换仅涉及 Unicode 为该过程指定的小写关系，原序列里的标准化差异仍可能存在。

:::example 有字母也有表情的混合文本
[输入]
Ä 😀 A
[结果]
ä 😀 a
[说明]
两个大写字母分别转成对应小写，表情符和空格不参与大小写变换。
:::

## 应用与比较边界
<!-- sources: unicode, ecma -->

转小写可以统一显示样式。切分字符串后分别转换可能失去跨边界的上下文。若目标是大小写无关比较，还须考虑 Unicode 默认大小写折叠与特定语言的比较规则。

## 常见误区

- 逐字符调用小写函数和对整串调用不总是等效。
- 转小写不会自动执行 Unicode 规范化，也不会代替去重音处理。
- 地区特定规则和默认 Unicode 映射在个别字母上会产生不同结果。
