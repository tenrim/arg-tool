---
capabilityId: pair:To%20Base32
title: Base32
topicGroup: encoding
summary: 介绍五位索引、五字节量子、尾组填充以及 Base32hex 的字母表。
aliases:
  - To Base32
  - From Base32
  - Base32hex
sources:
  - id: rfc
    title: RFC 4648 — Base16、Base32 与 Base64 数据编码
    publisher: IETF（南京大学镜像）
    url: https://mirrors.nju.edu.cn/rfc/rfc4648.html
    language: en
    kind: standard
    locator: 第 3–10 节
  - id: python
    title: Python base64 文档
    publisher: Python Software Foundation
    url: https://docs.python.org/3/library/base64.html
    language: en
    kind: official-doc
    locator: 对应编码函数及变体
  - id: engine
    title: CyberChef 随站操作目录
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Base32 与 From Base32
---

## 介绍
<!-- sources: rfc, python -->

标准 Base32 用 32 个字符记下二进制数据，每个字符占 5 位。五个字节提供 40 位，正好写成八个符号。RFC 4648 的标准表由 A–Z 和 2–7 组成，排列位置决定每个符号的数值。

## 从字节得到索引
<!-- sources: rfc, engine -->

从第一个字节的最高位出发，依次切成五位组。一个五位组经常跨越连续两个字节。解码反向收集每个符号对应的五位，按八位分回字节。

:::example 五字节完整组
[输入]
fooba
[结果]
MZXW6YTB
[说明]
五个 ASCII 字节恰好用满 40 位，得到八个有效索引，无需等号。
:::

## 五种末组形状
<!-- sources: rfc, python -->

末组有效字节数为 1、2、3、4、5 时，相应的有效符号数为 2、4、5、7、8。在需要填充的协议里，后面分别补 6、4、3、1、0 个等号。最后一个五位索引若只有部分有效位，低位以零补足。

:::example 一字节与三字节
[输入]
f（66）与 foo（66 6F 6F）
[结果]
f → MY======
foo → MZXW6===
[说明]
f 切成 01100 与 11000。后者包含三个补零位。foo 共 24 位，最后一个索引只有四位有效信息。
:::

## Base32hex 字母表
<!-- sources: rfc, python, engine -->

Base32hex 使用 0–9、A–V。位的分切方法相同，字母表不同。编码后的符号排序在适当的定宽字节比较场景可保留原有次序，例如同长度输入按原字节顺序比较时。

:::example 两张表上的同一索引
[输入]
f（66），五位索引 12、24
[结果]
标准 Base32：MY======
Base32hex：CO======
[说明]
12 和 24 在标准表是 M 和 Y，在扩展十六进制表是 C 和 O。
:::

## 数据判读
<!-- sources: rfc, python -->

出现 2–7 和大写拉丁字母可能是标准 Base32 的线索。还要检查有效符号数、末尾等号和解码后的数据结构。允许小写字母、允许把相似数字当作字母都属于特定协议或解码器的兼容决策。

## 常见误区

- 一个符号对应五位，不能按单字符读出完整的八位字节。
- Base32hex 的字母表有 32 项。名称中的 hex 指字母表排序的设计，它处理的单位仍是五位。
- 等号通常只出现在末尾。把它当作额外索引会得到多余字节。
