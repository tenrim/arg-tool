---
capabilityId: pair:Protobuf%20Encode
title: Protobuf 编码与解码
topicGroup: formats
summary: Protobuf 用字段号和线缆类型定位二进制消息中的值，字段名称、完整类型及重复语义由消息模式决定。
aliases:
  - Protobuf Encode
  - Protobuf Decode
  - Protocol Buffers
  - 可变长整数
  - ZigZag
sources:
  - id: wire
    title: Protocol Buffers — Encoding
    publisher: Protobuf 项目
    url: https://protobuf.dev/programming-guides/encoding/
    language: en
    kind: official-doc
    locator: Base 128 Varints、Message Structure 与 Signed Integers
  - id: proto
    title: Protocol Buffers — Language Guide (proto3)
    publisher: Protobuf 项目
    url: https://protobuf.dev/programming-guides/proto3/
    language: en
    kind: official-doc
    locator: 字段编号、字段类型与默认值
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Protobuf Encode 与 Protobuf Decode，模式输入以及无模式时的数字字段
---

## 介绍
<!-- sources: wire, proto -->
Protocol Buffers 将消息写成一串字段记录。每条记录有编号与线缆类型，字段值随后排列。消息模式定义编号对应的名称、数据类型和重复规则，所以同一份消息可按编号解析外形，完整解释仍需对应模式。

## 字段标签与变长整数
<!-- sources: wire, fixed -->
字段标签把字段号左移 3 位，再合入线缆类型。标签与某些数值使用 Base 128 变长表示。每字节低七位参与值计算，最高位为 1 表示还有后续字节，低有效的七位组先存。

:::example 字段 1 的整数 150
[输入]
uint32 n = 1，值为 150
[结果]
08 96 01
[说明]
08 等于 1 × 8 + 0，线缆类型为变长整数。96 的低七位为 22，01 表示下一组为 1，故 22 + 128 = 150。
:::

## 长度限定的字段
<!-- sources: wire, proto, fixed -->
字符串、字节串、嵌套消息与一些成组重复字段都可通过长度限定格式传递。先读取字节数，再读完指定长度的载荷。仅看线缆类型时，这几类内容可以具有相同的外形。

:::example 字段 2 的单字节文字
[输入]
string name = 2，值为 "A"
[结果]
12 01 41
[说明]
标签 12（十六进制）等于 2 × 8 + 2。01 记录载荷长度，接着是 A 的 UTF-8 字节 41。
:::

## 有符号整数的 ZigZag
<!-- sources: wire, fixed -->
sint32 和 sint64 先用 ZigZag 把符号折到最低位，再编码为无符号变长整数。按数值顺序，0、−1、1、−2 映射为 0、1、2、3。这样小的负数也能用较短的字节串表示。

:::example 编码负偏移
[输入]
sint32 offset = 3，值为 −2
[结果]
18 03
[说明]
标签 18（十六进制）对应字段 3、线缆类型 0。−2 的 ZigZag 值为 3。
:::

## 模式用于还原名称和完整类型
<!-- sources: wire, proto, fixed -->
变长数据可能对应整数、布尔、枚举或经 ZigZag 的有符号数。长度限定的数据也可能是文字或另一个消息。无模式的读取结果只能按编号和候选类型解释，若取到消息编写时的定义，才能还原字段名及全部语义。

## 常见误区
- 字段标签只写字段号和线缆类型，字段名来自模式。
- int32 与 sint32 对负数的编码规则不同。
- 长度限定的载荷能被读取，不一定能仅凭字节确认其业务类型。
