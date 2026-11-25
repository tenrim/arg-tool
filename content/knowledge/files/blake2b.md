---
capabilityId: op:BLAKE2b
title: BLAKE2b 哈希
topicGroup: file-compression
summary: 解释 BLAKE2b 的 64 位压缩、输出长度和直接加钥工作方式。
aliases:
  - BLAKE2b
  - BLAKE2b-512
  - BLAKE2b-128
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
    locator: BLAKE2b 的输出位数和密钥字节读取
---

## 介绍
<!-- sources: rfc -->

BLAKE2b 是 BLAKE2 的 64 位字版本，处理 128 字节消息块。规范允许 1 至 64 字节的摘要，以及零至 64 字节的密钥。零长度密钥对应普通摘要，正长度密钥进入原生加钥计算。

## 计数器与最后一块
<!-- sources: rfc -->

压缩输入包括前一链值、本块、累计字节计数以及最后一块标志。最终不满一块时补零到 128 字节，但计数描述实际进入计算的字节数。即使消息恰好是一整块，最后一块也按结束状态处理。

:::example 无钥标准向量
[输入]
ASCII abc，输出 64 字节。
[结果]
ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d17d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923
[说明]
RFC 附录用同一消息跟踪压缩步骤。零填充没有把逻辑计数从 3 变成 128。
:::

## 压缩与字序
<!-- sources: rfc, engine -->

一块读作 16 个小端 64 位字。BLAKE2b 的压缩进行 12 轮，混合函数 G 结合模加、异或和右旋 32、24、16、63 位。压缩结果折入链值，供下一块使用。

## 输出长度进入初始化
<!-- sources: rfc, engine -->

规范将所需字节数写入初始化参数，与密钥长度等值共同影响初始链。计算时选 16 字节会从一开始改变状态。这和先计算 64 字节再仅保留前 16 字节的做法不同。

:::example 128 位变体
[输入]
ASCII abc，无钥，计算 16 字节输出。
[结果]
cf4ab791c62b8d2b2109c90275287816
[说明]
普通 64 字节结果的开头为 ba80a53f，与该值不同。
:::

## 原生加钥
<!-- sources: rfc, engine -->

加钥模式把补齐至完整块的密钥置于消息前，并在参数中记录密钥的长度。规范指定的加钥过程包含明确的初始化和计数，不能以随意拼接明文密钥替代。公开例子的四字节密钥只用于复算。

:::example 四字节测试密钥
[输入]
ASCII abc，密钥为原始字节 00 01 02 03，输出 64 字节。
[结果]
6fde7a5c5aeb8aaeb37393ec1444fb5c0744ad4734fcdf0f0fc39e845bb893de919469e68632c84777d0539d6f409c435847263bfeef455a721a61e93475a64e
[说明]
密钥包含四个字节，文本 00010203 则有八个 ASCII 字符。
:::

## 常见误区

- BLAKE2b-128 的计算不是截短 BLAKE2b-512。
- 64 字节内部规格上限不等于每次摘要都必须输出 64 字节。
- 原生加钥模式有自己的初始化和补齐规则。
