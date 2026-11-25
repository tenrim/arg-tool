---
capabilityId: pair:To%20MessagePack
title: MessagePack 编码与解码
topicGroup: formats
summary: MessagePack 按预定的字节前缀表示整数、字符串、二进制、容器和扩展值，较小的整数或短字符串的长度能直接存进头部。
aliases:
  - To MessagePack
  - From MessagePack
  - MessagePack
  - 二进制对象序列化
sources:
  - id: spec
    title: MessagePack Specification
    publisher: MessagePack 项目
    url: https://github.com/msgpack/msgpack/blob/master/spec.md
    language: en
    kind: author-spec
    locator: 格式表、Integer、String、Array 及 Extension
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
    locator: To MessagePack 与 From MessagePack，结构化输入和固定库序列化
---

## 介绍
<!-- sources: spec -->
MessagePack 用二进制表示整数、字符串、布尔值、数组与映射。它为常见的小数据安排短格式，在一个头字节里合并类型及数值或长度。较长的数据和扩展值可用额外字节保存。

## 整数的前缀和范围
<!-- sources: spec, fixed -->
0 到 127 可直接用一个字节存放，−32 到 −1 亦有单字节范围。其他整数采用显式类型标记和数据域。因而整数 128 虽可放入一个无符号字节，仍应先加 uint8 标记 CC。

:::example 比较三条跨界整数
[输入]
127、128、−33（分别编码）
[结果]
7F、CC 80、D0 DF
[说明]
127 属于正 fixint。128 使用 uint8。−33 超出负 fixint 范围，使用有符号 int8 标记 D0，DF 是 −33 的八位补码。
:::

## 文本串和二进制串
<!-- sources: spec, utf -->
短文本可用 fixstr，把 UTF-8 字节数和类型合在同一个头字节。原始二进制另有 bin 类型，其内容不需满足 UTF-8。看见两个都能读成字母的字节串时，仍要依据头部判断它是否声明为文字。

:::example 两字节 UTF-8 文本
[输入]
"é"
[结果]
A2 C3 A9
[说明]
A2 表示 fixstr 且长度是 2。后两个字节是 é 的 UTF-8 编码。
:::

## 数组、映射与逐项读取
<!-- sources: spec, fixed -->
数组记录元素个数，映射记录成对的键和值。容器内部的元素各有自己的编码开头，长度不固定。先读完某个子项才能确定下一项的位置。

:::example 读取三个不同类型的元素
[输入]
93 01 A1 41 C3
[结果]
[1,"A",true]
[说明]
93 表示有三项的数组，01 为整数 1，A1 41 为单字节字符串 A，C3 是布尔真。
:::

## 扩展类型与 JSON 输出
<!-- sources: spec, fixed -->
扩展项含类型编号与载荷，可用于时间戳或应用自定义数据。读取者若没有该扩展的约定，仍可保存编号与原始载荷，但无法直接得到业务含义。输出到 JSON 时，原始字节或扩展值可能用包装结构表示。

## 常见误区
- 相同数字在不同二进制格式中使用的前缀可能完全不同。
- 文本长度从 UTF-8 字节计数，数组长度从元素计数。
- 看到可打印的载荷也须先检查其类型头，有效文字和二进制的编码不同。
