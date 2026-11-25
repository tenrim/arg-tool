---
capabilityId: op:Hamming%20Distance
title: 汉明距离
topicGroup: text-language
summary: 汉明距离按位置比较等长序列，值等于对应符号不同的位置数。
aliases:
  - Hamming Distance
  - 汉明距离
  - 位差
  - 逐字节不同数
sources:
  - id: hamming
    title: Error Detecting and Error Correcting Codes
    publisher: R. W. Hamming
    url: https://zoo.cs.yale.edu/classes/cs323/doc/Hamming.pdf
    language: en
    kind: author-spec
    locator: 第 6 节，码字之间的距离及检错、纠错球
  - id: cyberchef
    title: Hamming Distance（固定版本源码）
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/HammingDistance.mjs
    language: en
    kind: implementation
    locator: 输入等长、十六进制解码与位差统计
  - id: ascii
    title: RFC 20 — ASCII Format for Network Interchange
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc20.txt
    language: en
    kind: standard
    locator: ASCII 字符与八位字节写法
---

## 介绍
<!-- sources: hamming, cyberchef -->
汉明距离对齐两条等长序列后逐项比较。相同位置计 0，不同位置计 1，距离是所有位置的计数之和。给定统一的元素单位，距离值是把一条序列仅通过逐位置替换而变成另一条所需的最少替换次数。

## 逐位置比较
<!-- sources: hamming -->
对长度为 n 的序列 x 与 y，距离为从 i = 1 至 n 的不同位置数。计算保持位置对应。一个位置无论改动多大，只要两项不同，在指定单位下就只计一次。

:::example 三个符号中的一处变化
[输入]
KAR 与 KAT（ASCII 字节）
[结果]
1
[说明]
K 与 K 对应，A 与 A 对应，最后一个位置由 R 变为 T。
:::

## 位和字节的差异
<!-- sources: hamming, cyberchef -->
逐字节比较时，两个不同字节计一次。逐位比较时，把两字节异或，统计结果中为 1 的位；整个序列的位差是各字节位差之和。

:::example 一个不同字节包含四个位差
[输入]
F0 32 与 FF 32（十六进制字节）
[结果]
字节距离 1，位距离 4
[说明]
首字节异或为 0F，里面有四个 1。尾字节 32 相同，不增加任何计数。
:::

## 长度与编码
<!-- sources: cyberchef, ascii -->
等长要求适用于选定单位。编码后，外观上的一个字符有时占多个字节。十六进制写法中的两个字符通常代表一个字节，直接按字面文本比较可能得到另一组位置。

:::example 长度不同无法直接对齐
[输入]
AB 与 ABC（ASCII 字节）
[结果]
通常定义下没有汉明距离
[说明]
第二份多出一个 C，第一份没有对应位置。如要评价插入，可用允许变更长度的距离。
:::

## 码字间距与改错
<!-- sources: hamming -->
纠错码可以把合法码字排开，让它们之间保持最小距离。若合法码字的最小距离为 3，任何码字发生一次翻转后，都不会落入另一合法码字的一次翻转范围。接收者可以借此唯一定位到最近的原码字。

## 常见误区
- 一个不同字节可能贡献一至八个位差，需看比较单位。
- 长度不同时，擅自截去多余部分计算会改动题目条件。
- 计得距离并不意味着知道错误实际是怎样产生的。
