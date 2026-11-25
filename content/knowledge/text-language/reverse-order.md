---
capabilityId: op:Reverse
title: 反转
topicGroup: text-language
summary: 按字节、码点或行反转顺序，以实际用途选择重复处理的单位。
aliases:
  - reverse
  - 倒序
sources:
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的处理规则和声明边界
  - id: source
    title: Reverse 源码
    publisher: GCHQ
    url: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/Reverse.mjs
    language: en
    kind: implementation
    locator: 按 Byte、Character、Line 分支处理
  - id: uc
    title: UAX #29：Unicode Text Segmentation
    publisher: Unicode Consortium
    url: https://www.unicode.org/reports/tr29/
    language: en
    kind: standard
    locator: Extended Grapheme Clusters，字形簇边界
---

## 介绍
<!-- sources: chef, source -->

反转是从末尾向开头重新排列输入单元。单元可为字节、Unicode 字符或文本行，所用单位决定结果能否保持文字结构。

## 原始字节反转
<!-- sources: source, chef -->

字节反转先保持每个八位值，再改变它们的位置。对一个多字节整数，整组反转可以转换字节序；对更长的文件整体逆序则会同时调换字段顺序。

:::example 对三个字节倒序
[输入]
41 00 FF
[结果]
FF 00 41
[说明]
保留每个字节自身的位序。
:::

## 码点与视觉字符
<!-- sources: source, uc -->

按字符的处理可保持一个补充平面码点的内部字节。视觉上的一个文字簇还可能由多个码点组成，包含组合重音或连接符时不一定能保持原结合。

:::example 反转含补充平面字符的文字
[输入]
A😀B，按字符
[结果]
B😀A
[说明]
表情仍作为一个码点，其编码字节未被反向排列。
:::

## 行边界
<!-- sources: source, chef -->

行反转保留每行的文字顺序，从最后一行向前排。文本包含 CRLF 或结尾空行时，需查看实际分行规则和末尾的换行符。

:::example 逐行倒序
[输入]
one
two
three
[结果]
three
two
one
[说明]
行顺序反过来，one、two、three 的内部字母顺序不改。
:::

## 可逆性的条件
<!-- sources: source, uc -->

两次使用同一单位的反转可以抵消，只要中途没有替换字节、丢失控制字符或改变分行。视图中出现乱码时，比对原始字节能区分换位后的编码不合法和数据被替换。

## 常见误区

- 反转字节不会自动按 UTF-8 维护字符。
- 字符和视觉字形簇可能不同。
- 行反转不是对每行分别倒序。

