---
capabilityId: op:BLAKE2s
title: BLAKE2s 哈希
topicGroup: file-compression
summary: 以 32 位压缩结构说明 BLAKE2s，复算无钥、短摘要和加钥结果。
aliases:
  - BLAKE2s
  - BLAKE2s-256
  - BLAKE2s-128
sources:
  - id: rfc
    title: RFC 7693 The BLAKE2 Cryptographic Hash and Message Authentication Code
    publisher: Saarinen、Aumasson / RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc7693.txt
    language: en
    kind: author-spec
    locator: 第 2、3 节与附录 A、B
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Hashing.js
    language: en
    kind: implementation
    locator: BLAKE2s 的输入字节和输出编码
---

## 介绍
<!-- sources: rfc -->

BLAKE2s 是针对较小字长平台设计的 BLAKE2 版本，压缩使用 32 位字。它每块处理 64 字节，摘要最多 32 字节，密钥也最多 32 字节。它与同家族的 BLAKE2b 共享整体设计，具体轮和字长不同。

## 压缩运算
<!-- sources: rfc -->

一个消息块分成 16 个小端 32 位字。每轮的 G 函数通过模 2³² 加法、异或、循环右旋混合数据。BLAKE2s 使用 16、12、8、7 位旋转量，一块计算 10 轮。块尾必须包含正确的累计计数和末块标志。

:::example RFC 无钥向量
[输入]
ASCII abc，输出 32 字节。
[结果]
508c5e8c327c14e2e1a72ba34eeb452f37458b209ed63a294d999b4c86675982
[说明]
消息长度为三字节，填充区域的零不计入原消息长度。
:::

## 摘要位数与输出编码
<!-- sources: rfc, engine -->

初始参数记录目标摘要字节数。对 BLAKE2s 选择 16 字节和 32 字节，得到两个相关规格但独立的摘要。十六进制和 Base64 可以呈现同一段输出字节，选择显示形式不会改变计算参数中的字节数。

:::example 同消息只取 16 字节的变体
[输入]
ASCII abc，无钥，要求 128 位摘要。
[结果]
aa4938119b1dc7b87cbad0ffd200d0ae
[说明]
128 位对应 16 字节，结果与上一例的前 16 字节不同。
:::

## 带密钥计算
<!-- sources: rfc, engine -->

使用密钥时，规范将密钥补齐到一块，并把它加入计算。参数块中的密钥长度保留原始长度。BLAKE2s 可以直接用作带密钥摘要，普通无钥摘要无法证明计算方掌握密钥。

:::example 原始二进制密钥
[输入]
ASCII abc，密钥为 00 01 02 03，输出 32 字节。
[结果]
38f773b555ed93f8a32d6eb2816141fa1158614db28157a63511e7e27619bed9
[说明]
这一公开向量可核对原始密钥与它的文本写法是否被正确区分。
:::

## 家族命名与复算
<!-- sources: rfc -->

在数据清单中记录算法名、是否加钥与输出字节数。BLAKE2s-256 和 BLAKE2b-256 同为 32 字节，轮数和按字分组方式不同。使用标准向量确认实现一致后，再复查实际输入。

## 常见误区

- BLAKE2s 的最长结果是 32 字节，不能照用 BLAKE2b 的上限。
- 目标长度属于算法参数，输出编码属于字节的展示。
- 加钥输出与无钥结果不能混作同一项校验。
