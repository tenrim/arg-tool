---
capabilityId: op:MD4
title: MD4 哈希
topicGroup: file-compression
summary: 介绍 MD4 的 512 位分块、小端字序和三轮压缩，定位旧资料中的兼容性计算。
aliases:
  - MD4
  - Message-Digest 4
  - MD4 摘要
sources:
  - id: rfc
    title: RFC 1320 The MD4 Message-Digest Algorithm
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc1320.txt
    language: en
    kind: standard
    locator: 第 3 节和附录 A.5
  - id: security
    title: RFC 6150 MD4 to Historic Status
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6150.txt
    language: en
    kind: standard
    locator: 第 2 节 MD4 安全性
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: MD4
---

## 介绍
<!-- sources: rfc -->

MD4 把一条消息处理为 128 位摘要。它从固定的四个 32 位状态字开始，依次处理 512 位消息块。名称相近的 MD2 用按字节的查表混合，MD4 的基本运算转为 32 位算术和逻辑。

## 线性填充和小端解释
<!-- sources: rfc -->

消息后追加一个 1 位，再填零使位长达到 448 模 512，末尾附上原始长度的低 64 位，按小端顺序表示。每个 512 位块读成 16 个小端 32 位字。

:::example 第一块的开头
[输入]
ASCII abc，字节 61 62 63。
[结果]
第一个 32 位消息字为 0x80636261，末尾长度域为 18 00 00 00 00 00 00 00。
[说明]
紧接原字节的 80 含新增的 1 位，原长度是 24 位，即十六进制 18。
:::

## 三轮状态更新
<!-- sources: rfc, engine -->

每轮使用自己的布尔函数、消息字次序和循环移位。三轮共 48 步，基于四个状态字做加法和更新。每块结束，把当前工作字分别加回该块之前的状态，所得状态传给下一块。

:::example 空输入也有摘要
[输入]
长度为零的消息。
[结果]
31d6cfe0d16ae931b73c59d7e0c089c0
[说明]
补齐和长度域占一块，仍会执行一次完整压缩。
:::

## 完整摘要与编码
<!-- sources: rfc, engine -->

全部块结束后，按状态字顺序逐字以小端输出，共 16 字节。若使用十六进制表示，每字节以两个字符显示，所见的 32 个字符仍表示原来的 128 位。

:::example RFC 中的 abc
[输入]
ASCII abc，不含换行。
[结果]
a448017aaf21d8525fc10ae87aa6729d
[说明]
与先前的消息块开头一起核查，可以分别排查输入字节解释与输出字序。
:::

## 安全用途
<!-- sources: security -->

RFC 6150 把 MD4 转为历史状态，并记录其碰撞抗性遭到破坏。复现需要 MD4 的历史样例时可以保持原规格。当前系统的真实性、签名或防篡改验证应依据相应的现代协议。

## 常见误区

- MD4 与 MD5 的初始状态相近，轮函数和完整结果不同。
- 二进制摘要有 16 字节，32 是十六进制字符数。
- 摘要存在实际碰撞时，相等不能单独证明旧文件来源真实。
