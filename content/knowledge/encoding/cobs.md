---
capabilityId: pair:To%20COBS
title: COBS
topicGroup: encoding
summary: 分块替换零字节，给字节流留下零值用于区分帧。
aliases:
  - Consistent Overhead Byte Stuffing
  - COBS
  - 字节填充
sources:
  - id: paper
    title: Consistent Overhead Byte Stuffing
    publisher: Stuart Cheshire 与 Mary Baker
    url: https://stuartcheshire.org/papers/COBSforSIGCOMM/
    language: en
    kind: author-spec
    locator: 零字节分帧、码块和最大开销
  - id: chef
    title: CyberChef 11.5.0 To COBS / From COBS
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To COBS / From COBS 输入、输出及参数
---

## 介绍
<!-- sources: paper, chef -->
COBS 将可含任意字节的消息编码成不含 00 的载荷。传输协议因此可在载荷之外用 00 标记帧边界。编码只重组原数据，主要目的在于使分帧清楚、开销可控。

## 块头与非零数据
<!-- sources: paper -->
普通块头的值为接下来非零字节数加一。解码从块头后读取指定字节，在尚有后续块时恢复相应的 00。若某一块有 254 个连续非零字节，可用 FF 标头，不在这 254 个字节后附入隐含零值。

:::example 两段非零串
[输入]
十六进制载荷 11 22 00 33
[结果]
03 11 22 02 33
[说明]
第一段两个非零字节，标头 03；第二段一个非零字节，标头 02。
:::

## 空块与连续零值
<!-- sources: paper, chef -->
01 是不带非零数据的块头。遇到前置、后置或连续的零时，可以借助相邻空块保留其数量与位置。解码在相关块之间恢复这些零。

:::example 连续的零
[输入]
十六进制载荷 00 00
[结果]
01 01 01
[说明]
三个空块之间的两个界面分别对应一个零。
:::

:::example 末尾零
[输入]
解 02 11 01
[结果]
11 00
[说明]
02 后有一个 11，之后的 01 为零长度块，二者之间复原一个零。
:::

## 帧边界和编码长度
<!-- sources: paper, chef -->
帧分隔符来自所用外层协议。这里只计算 COBS 载荷，编码结果的末尾不自动添加帧分隔零值。较长的非零段可拆分成多个 FF 块，编码长度仍和原数据长度接近。

## 无效载荷与校验
<!-- sources: paper, chef -->
解码前应核对块头数值和剩余字节数。若 03 后只剩一个数据字节，则块未完整。固定解码操作对部分截断载荷仍可输出已读字节，所以读到输出不能代替结构验证。

## 常见误区

- 输出中不存在的 00 是被分块信息代表，原内容没有丢失。
- 帧末尾的 00 由外层协议规定，列示示例的载荷不包括它。
- 块头含义不是任意情况下都补一个零，FF 表示长的非零段。
- COBS 不提供独立的校验或加密。
