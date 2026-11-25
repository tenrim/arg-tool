---
capabilityId: pair:RC2%20Encrypt
title: RC2
topicGroup: modern
summary: 用四个 16 位字和扩展密钥执行混合及搅拌的 64 位分组密码。
aliases:
  - RC2 Encrypt
  - RC2 Decrypt
  - 16 位字上的混合与搅拌
sources:
  - id: rfc
    title: RFC 2268：A Description of the RC2 Encryption Algorithm
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc2268.html
    language: en
    kind: standard
    locator: 第 2–5 节，有效密钥长度、算法和测试
  - id: modes
    title: NIST SP 800-38A：Block Cipher Modes
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf
    language: en
    kind: standard
    locator: 6.1、6.2，ECB 和 CBC
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作和输入输出定义
---

## 介绍
<!-- sources: rfc -->

RC2 由 Ronald Rivest 设计，分组为 8 字节，内部读作四个 16 位字。历史资料中也常用 ARC2 这个名称。密钥原始长度与密钥扩展后要求保留的有效位数各自有定义。

## 密钥扩展与有效位数
<!-- sources: rfc -->

将给定的密钥扩展为 128 字节，并按有效位数限制其中范围，再得到 64 个 16 位密钥字。相同密钥字节如果使用不同有效位设置，生成的轮密钥可能不同。

## 混合轮和搅拌轮
<!-- sources: rfc -->

混合将密钥字、相邻状态字的布尔组合与当前字相加，再在 16 位上旋转。搅拌根据另一个状态字的低六位选择密钥字后相加。加密按五轮混合、一次搅拌、六轮混合、一次搅拌、五轮混合执行。

## 模式与填充后的输出
<!-- sources: chef, modes -->

RC2 可以与 CBC 或 ECB 共同使用。CBC 的首块与 IV 异或，后续块使用前一密文。当加密使用 PKCS#7 填充时，正好满块的明文还会添入一整个填充块。以下使用 CBC、8 字节全零 IV 和 8 字节全零密钥。

:::example 空明文
[输入]
空字节串
[结果]
D726C518FFC46B4B
[说明]
一个分组全由填充组成。
:::

:::example 一个零字节
[输入]
00
[结果]
8C4AA31213F49619
[说明]
先写一个数据字节，再补足一块。
:::

:::example 八个零字节
[输入]
0000000000000000
[结果]
81B4CE4E4714989FD47578C7F4A6026F
[说明]
第一块为数据，第二块含整块填充。
:::

## 归档数据的证据
<!-- sources: rfc, chef -->

历史容器的 RC2 参数可能把有效密钥长度编码在算法参数里。核对算法向量时也要对齐该值。固定工作模式与填充产生的消息示例，不能直接与无填充的 RFC 单块输出逐字节比较。

## 常见误区

- RC2 的字长 16 位，分组长度为四字共 64 位。
- 原始密钥位数不必等于容器声明的有效位数。
- 零长度明文在启用分组填充时仍产生密文。

