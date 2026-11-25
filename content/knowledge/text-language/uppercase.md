---
capabilityId: op:To%20Upper%20case
title: 转大写
topicGroup: text-language
summary: 介绍 Unicode 大写映射、多码点结果以及整串转换与首字处理的差异。
aliases:
  - To Upper case
  - 大写映射
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
    title: ECMAScript — String.prototype.toUpperCase
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.touppercase
    language: en
    kind: standard
    locator: 整串 Unicode 大小写转换
  - id: worker
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: To Upper case 的 run 方法
---

## 介绍
<!-- sources: unicode, ecma -->

转大写将需要变换的字符映射到其 Unicode 大写表示。对有大小写的文字，这种表示可用于显示或比较。空格和多数符号没有大写项，通常不发生变化。

## 完整大写映射
<!-- sources: unicode, special, ecma -->

一些单字符会映射为多个大写字符。完成转换后应以实际结果重新计算字符串长度或字节偏移，不能沿用原来逐字符的下标。

:::example 词中的字符扩展
[输入]
Straße 42
[结果]
STRASSE 42
[说明]
ß 的默认完整大写映射为 SS，原数字和空格保持不变。
:::

## 默认规则与语言惯例
<!-- sources: unicode, special, ecma -->

默认转换不根据文本猜测其语言。某些地区对带点与不带点字母有专门约定，只有明确采用相应地区规则时才会保留这些差异。文本一般要按已知语言而非字体外观选择规则。

:::example 默认映射合并两个小写形式
[输入]
i ı İ ß ﬃ
[结果]
I I İ SS FFI
[说明]
普通 i 与无点小写 ı 都变为 I，连字 ﬃ 展开成 FFI。多个输入形式可得到同一结果。
:::

## 首字位置的选择
<!-- sources: ecma, worker -->

另一种处理只改变边界之后的首个符号，保留单元内部其余字符原样。它由实际的分词、断句或断段规则决定。使用简单标点分界的规则不等同于自然语言的完整断句。

:::example 以句点作为分界
[输入]
one. two! three? four
[结果]
One. Two! three? four
[说明]
行首以及句点后的首个字母变大写。感叹号与问号在该规则下不触发新的转换。
:::

## 识别用途
<!-- sources: unicode, special -->

整串大写适合制作视觉统一的标签。只对词首或句首转换时要保留原来字母和标点的其他形态。若内容需做大小写无关比较，应该使用协议明确规定的比较或折叠规则。

## 常见误区

- 并非每种大写映射都天然保持字符串长度。
- 按简单边界只改首字的操作可能不会识别所有语言的词和句。
- 用小写反向处理大写结果无法保证恢复原文。
