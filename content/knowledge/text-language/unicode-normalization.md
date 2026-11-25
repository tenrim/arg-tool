---
capabilityId: op:Normalise%20Unicode
title: Unicode 规范化
topicGroup: text-language
summary: 比较 NFC、NFD、NFKC、NFKD 的分解和组合步骤，以及规范等价与兼容等价。
aliases:
  - Normalise Unicode
  - NFC
  - NFD
  - NFKC
  - NFKD
sources:
  - id: uax15
    title: Unicode Normalization Forms（UAX #15）
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr15/
    language: en
    kind: standard
    locator: 第 1.1、1.2 节，等价性与四种形式
  - id: combining
    title: Characters and Combining Marks
    publisher: Unicode Consortium
    url: https://www.unicode.org/faq/char_combmark.html
    language: en
    kind: official-doc
    locator: Combining Marks and Combining Character Sequences
  - id: mdn
    title: String.prototype.normalize
    publisher: MDN Web Docs
    url: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
    language: zh-CN
    kind: official-doc
    locator: 四种规范化形式
  - id: catalogue
    title: CyberChef 固定操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Normalise Unicode
---

## 介绍
<!-- sources: uax15, combining -->

Unicode 可以用不同的码点序列表示规范等价的文字。例如带圆环的 A 可以用预组字符表示，也可写成 A 后接组合圆环。将文本转成同一种规范化形式，可以直接比较按该形式认定等价的表示。

## NFD 与 NFC
<!-- sources: uax15, mdn, catalogue -->

NFD 递归执行规范分解，再按规范组合类别调整可重排的附加符。NFC 在这个基础上，以规定的步骤重新组合可合并的序列。并非每组分解字符都有对应的预组字符。

:::example 圆环字母的两种表示
[输入]
Å（U+00C5）和 Å（U+0041 U+030A）
[结果]
NFD：两个输入都变为 U+0041 U+030A
NFC：两个输入都变为 U+00C5
[说明]
两种形式保留了圆环的语言信息，只选择不同的等价表示。
:::

## 组合符号的顺序
<!-- sources: uax15, combining -->

组合符号的顺序不总是按输入位置保持。对同一基字符，在规范允许重排时，附加符按其规范组合类别归序。具有同一非零组合类别的符号仍保留各自的先后。

:::example 重新排列两种组合符
[输入]
U+0061 U+0315 U+0300
[结果]
NFD：U+0061 U+0300 U+0315
[说明]
U+0315 的规范组合类别是 232，U+0300 是 230。规范排序将 230 放在 232 之前。
:::

## NFKD 与 NFKC
<!-- sources: uax15, mdn -->

兼容分解额外处理一些为了兼容旧系统或排版而单独保留的字符，例如全角形式、带圈数字和某些预制连字。NFKD 停在分解结果，NFKC 继续按 NFC 的规则组合。

:::example 从兼容形式到基本字符
[输入]
Ａ①ﬃ
[结果]
NFC：Ａ①ﬃ
NFKC：A1ffi
[说明]
全角形式、圈号和连字形态在后一结果中消失。它们原来的显示区别无法从结果反推。
:::

## 比较前决定采用哪种等价
<!-- sources: uax15, mdn -->

选择形式取决于应用的等价标准。若只需要合并预组与分解写法，规范等价已经足够。若索引还需忽略协议定义的兼容形态，才进一步使用兼容规范化。哈希和签名校验必须在协议规定的实际字节上处理。

## 常见误区

- 规范化不会自动忽略大小写。大小写折叠是另外定义的转换。
- 看起来像同一个字符的跨文字形，未必具有规范等价或兼容等价关系。
- 兼容规范化可能舍去有实际意义的样式区别。要保留可逆性，就需要原稿。
