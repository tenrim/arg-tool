---
capabilityId: pair:VarInt%20Encode
title: VarInt
topicGroup: encoding
summary: 用字节高位标记后续，引导读取低位优先的七位整数块。
aliases:
  - VarInt
  - LEB128
  - Protobuf
  - 变长整数
sources:
  - id: protobuf
    title: Protocol Buffers Encoding
    publisher: Google / Protobuf
    url: https://protobuf.dev/programming-guides/encoding/
    language: en
    kind: official-doc
    locator: Base 128 Varints、ZigZag、字段组成
  - id: chef
    title: CyberChef 11.5.0 VarInt Encode / Decode
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: VarInt Encode / Decode 输入、输出及参数
---

## 介绍
<!-- sources: protobuf, chef -->
Base 128 VarInt 用变长字节序列保存整数。每个字节低七位载有数据，最高位指示后续是否还有字节。小整数只占一个字节，大整数可继续追加数据块。

## 取低七位与继续位
<!-- sources: protobuf, chef -->
先取整数的低七位，再将剩余部分右移七位。若剩余非零，把当前字节最高位设置为 1。继续按相同办法处理，最后一个字节的高位为 0。

:::example 从单字节跨到双字节
[输入]
分别编码 127 与 128
[结果]
7F 与 80 01
[说明]
127 恰占七位。128 的低七位为零，但还有高组 1，因此其首字节只是继续标记 80。
:::

## 按 128 的幂累加
<!-- sources: protobuf, chef -->
解码将每个字节和 7F 作按位与，保留数据部分。首块乘 1，第二块乘 128，第三块乘 128²，以此类推。当遇到高位清零的字节时结束一个整数。

:::example Protobuf 文档中的 150
[输入]
96 01
[结果]
150
[说明]
96 的低七位为十进制 22，后续为 1，22＋1×128＝150。
:::

:::example 复算整数 300
[输入]
300
[结果]
AC 02
[说明]
300＝44＋2×128。44 的十六进制为 2C，设置最高位后成 AC。
:::

## 有符号映射与协议字段
<!-- sources: protobuf, chef -->
本转换操作接收单个非负整数。协议若使用 ZigZag 等有符号映射，需先明确字段类型，再对其映射值编码为 VarInt。Protobuf 消息本身还含字段号及线型，无法仅由数据部分反推完整结构。

## 截断与尾随数据
<!-- sources: protobuf, chef -->
合法码字必须有终止字节。只收到 80 时，载荷截断；固定解码器在这样的输入上可给出中间数字，不能据此认为完整码字已读出。同样，单值解码一次返回第一个完成的整数，尾随数据要按外层协议处理。

## 常见误区

- 继续位不参与数值累加。
- 低位块先写，不能把十六进制字节顺读成普通十六进制整数。
- 无终止位的码字应按截断处理。
- 单字段 VarInt 不能替代带模式的 Protobuf 消息解析。
