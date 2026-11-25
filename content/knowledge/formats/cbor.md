---
capabilityId: pair:CBOR%20Encode
title: CBOR 编码与解码
topicGroup: formats
summary: CBOR 使用初始字节携带数据的主类型和长度信息，支持整数、字节串、文字、数组、映射和语义标签。
aliases:
  - CBOR Encode
  - CBOR Decode
  - 简明二进制对象表示
  - RFC 8949
sources:
  - id: rfc
    title: RFC 8949 — Concise Binary Object Representation
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc8949.html
    language: en
    kind: standard
    locator: 第 3 节，各主类型；第 4 节，确定性编码
  - id: utf
    title: RFC 3629 — UTF-8
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3629.html
    language: en
    kind: standard
    locator: 第 3 节，标量到字节的映射
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: CBOR Encode 与 CBOR Decode，从 JSON 值编码或从二进制还原数据
---

## 介绍
<!-- sources: rfc -->
CBOR 是一种二进制对象表示。它在数据项开头记录类型等信息，因此可在没有专门字段模式的情况下读取许多基本结构。它同时区分普通文字和原始字节，还可用标签为通用数据附加语义。

## 初始字节与整数
<!-- sources: rfc, fixed -->
初始字节的高三位给出主类型，低五位是附加信息。对整数，主类型 0 表示非负值，主类型 1 表示负值，编码参数 n 对应 −1 − n。低五位小于 24 时可直接放参数；用 24 表示参数在紧接的一字节中。

:::example 读出一个非负数和一个负数
[输入]
10 与 −25（分别编码）
[结果]
0A 与 38 18
[说明]
0A 的主类型为 0，参数为 10。38 的主类型为 1，附加信息是 24，下一字节 18 表示参数 24，故数值为 −1 − 24。
:::

## 字节串、UTF-8 文字与标签
<!-- sources: rfc, utf -->
字节串和文本串采用不同主类型。文本串使用 UTF-8，长度以字节计。语义标签另有主类型，可为后续数据加上时间等含义。解释文本串时保留字节顺序，按 UTF-8 还原文字。

:::example 单个重音字符占两个字节
[输入]
"é"
[结果]
62 C3 A9
[说明]
62 的主类型是文本串，长度为 2。C3 A9 是 é 的 UTF-8 字节。
:::

## 数组与映射的边界
<!-- sources: rfc, fixed -->
定长数组的长度表示后续数据项数，定长映射的长度表示键值对数。读完每个完整子项后才能读下一个。CBOR 也有不定长项目，使用专门的终止码，需逐项判断而不能按固定字节宽度跳过。

:::example 还原一组不同类型的元素
[输入]
83 01 61 41 F5
[结果]
[1,"A",true]
[说明]
83 表示三个数组元素，01 是整数 1，61 41 是一字节文字 A，F5 表示布尔真。
:::

## 相同值与确定性编码
<!-- sources: rfc -->
同一个抽象值有时有多种合法的编码形式。例如可用不同长度表示同一整数，也可能改变映射键的序列化顺序。需要用字节比较、签名或摘要时，应采用协议指定的确定性编码方式，按其规则选择最短形式及键排序。

## 常见误区
- 文本串中的长度不是 Unicode 字符数。
- 主类型为 1 时，参数 n 要按 −1 − n 换算，不能直接视为绝对值。
- 解码后的普通 JSON 显示可能无法完整保留字节串和部分标签的类型。
