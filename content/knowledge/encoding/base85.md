---
capabilityId: pair:To%20Base85
title: Base85
topicGroup: encoding
summary: 解释四字节与五符号的换算，并比较 Ascii85、Z85 与 RFC 1924 的数据边界。
aliases:
  - Ascii85
  - Z85
  - To Base85
  - From Base85
sources:
  - id: python
    title: Python base64 文档
    publisher: Python Software Foundation
    url: https://docs.python.org/3/library/base64.html
    language: en
    kind: official-doc
    locator: 对应编码函数及变体
  - id: z
    title: ZeroMQ RFC 32 — Z85
    publisher: ZeroMQ
    url: https://rfc.zeromq.org/spec/32/
    language: en
    kind: standard
    locator: Formal Specification 与 Test Case
  - id: ipv6
    title: RFC 1924 — A Compact Representation of IPv6 Addresses
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc1924.html
    language: en
    kind: standard
    locator: 第 4 节，字符表与 128 位地址
  - id: engine
    title: CyberChef 操作目录
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Base85 与 From Base85
---

## 介绍
<!-- sources: python, z, ipv6 -->

Base85 用 85 个符号表示进位数字。常见的分块写法用五个符号表示四个字节，因为 85 的五次方足以覆盖所有 32 位无符号整数。Ascii85、Z85 和基于 RFC 1924 字符集的变种必须分别说明，尤其要区分块长与字符表。

## 四字节到五符号
<!-- sources: python, z, engine -->

四个字节按大端顺序组成一个整数，再展开成五位 85 进制，空出的高位补零。解码时乘回 85 的相应幂，然后按四个八位字节输出。

:::example 一个完整非零块
[输入]
00 00 00 01
[结果]
Ascii85：!!!!"
Z85：00001
[说明]
五个数位是 0、0、0、0、1。两张表的零字符分别为 ! 和 0，数位 1 分别写成双引号和 1。
:::

## Ascii85 的零组与末组
<!-- sources: python, engine -->

Ascii85 中完整的四个零字节可缩写为 z。若最后只剩一至三个字节，常见做法以零补成四个字节，取五位编码的前二至四个符号。某些数据流还有独立的首尾界标。

:::example 缩写和不满四字节的尾组
[输入]
四个零字节，以及字节 41，分别独立编码
[结果]
00 00 00 00 → z
41 → 5l
[说明]
z 是完整零块的缩写。41 按 41 00 00 00 计算后只保留两个符号。
:::

## Z85 的帧长
<!-- sources: z -->

Z85 的字母表从十个数字起始，其后是小写、大写和标点。标准要求原始帧长度可被四整除、字符帧可被五整除。应用如果需要处理长度不齐的数据，要在外层约定如何保存原长。

:::example 两个完整块
[输入]
86 4F D2 6F B5 59 F7 5B
[结果]
HelloWorld
[说明]
这是 ZeroMQ 规范的测试向量。八个字节分别进入两个四字节组，结果没有缩写零组或截短末组。
:::

## IPv6 写法的边界
<!-- sources: ipv6, python, engine -->

RFC 1924 为一个完整的 128 位 IPv6 地址定义二十个字符的表示。采用同一张字符表的通用字节操作，仍可能另外采用四字节分块规则。因此仅靠字符表相同不足以证明结果能够互换，还要核对整数的作用范围。

## 常见误区

- Ascii85 的 z 可以代替一个完整零块。它不是任意变体通用的空值标记。
- 在不满整块的数据上，Ascii85 的尾组和规范 Z85 的要求不同。
- 五个字符能表示的最大数值超过 32 位上限。解码规范需要处理超出块范围的输入。
