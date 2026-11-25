---
capabilityId: op:Salsa20
title: Salsa20
topicGroup: modern
summary: 从 64 位 nonce、计数器和密钥生成可定位的连续密钥流块。
aliases:
  - Salsa20
  - Salsa20/20
  - Salsa20/12
  - 流密码计数器
sources:
  - id: sodium
    title: Libsodium — salsa20
    publisher: Libsodium
    url: https://doc.libsodium.org/advanced/stream_ciphers/salsa20
    language: en
    kind: official-doc
    locator: 64 位 nonce、64 位块计数器及轮数
  - id: core
    title: Libsodium 1.0.20 — Salsa Core Reference
    publisher: Libsodium
    url: https://github.com/jedisct1/libsodium/blob/1.0.20-RELEASE/src/libsodium/crypto_core/salsa/ref/core_salsa_ref.c
    language: en
    kind: implementation
    locator: crypto_core_salsa，状态、行列轮和输出求和
  - id: engine
    title: CyberChef 11.5.0 — Ciphers 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Ciphers.js
    language: en
    kind: implementation
    locator: Salsa20，密钥长度、流块和初始计数器
---

## 介绍
<!-- sources: sodium, core -->

Salsa20 是 Daniel J. Bernstein 设计的对称流密码。密钥和一个 64 位 nonce 决定整条密钥流，计数器在这条流上定位不同的 64 字节块。将各消息字节与对应流字节相异或，可用于加密和解密。

## 32 位字与行列运算
<!-- sources: sodium, core -->

核心状态有 16 个以小端读入的 32 位字，含常量、密钥、nonce 与计数器。混合步骤在 32 位模加、循环左移及异或之间交替。四元组运算的旋转距离依次为 7、9、13、18。列与行两种顺序交替使用，完整版本做 20 轮。输出字为处理后状态与初值逐字相加，再按小端写出。

## 消息标识与流位置
<!-- sources: sodium, engine -->

nonce 区分同一密钥下的消息，计数器则是在一条流内部前进的块编号。计数器 1 对应从第 64 字节开始的第二块，并不表示跳过一个字节。不同轮数或不同密钥长度都需要按相应算法设定复现。

## 以零消息比较流块
<!-- sources: sodium, core, engine -->

前三例都使用 32 字节全零密钥、8 字节全零 nonce 和 16 字节全零消息。由于与零异或保持原值，结果就是所选流块的首 16 字节。第四例再观察非零消息。

:::example 完整轮数的第一块
[输入]
20 轮，计数器 0。密钥、nonce 和消息分别为 32、8 和 16 个 00。
[结果]
9A 97 F6 5B 9B 4C 72 1B 96 0A 67 21 45 FC A8 D4
[说明]
20 轮核心、初始状态求和及小端输出共同得到首块。
:::

:::example 同一条流中的第二块
[输入]
保持第一个例子的密钥和 nonce，计数器设为 1，消息仍是 16 个 00。
[结果]
AB EA 8A 17 64 6D 1A 77 82 F4 F2 AE 5E 9F 2B DE
[说明]
更改的仅是块编号，所得数据对应完整流的字节偏移 64 至 79。
:::

:::example 缩减轮数
[输入]
保持第一例的输入和计数器 0，改为 12 轮。
[结果]
BD 78 A2 F8 11 8A 56 3C 76 1D B4 F2 FB E0 55 DA
[说明]
12 轮变体使用不同的混合次数，不能还原 20 轮生成的密文。
:::

:::example 非零消息
[输入]
第一例的 20 轮设定，消息改为十六进制 41 42 43 44。
[结果]
DB D5 B5 1F
[说明]
41 ⊕ 9A 得 DB，其余字节依次使用 97、F6、5B。以相同设定再次异或可还原消息。
:::

## 读取外部样本的边界
<!-- sources: sodium, core, engine -->

规范的块计数器有 64 位。在上述全零基准中，固定入口把初始计数器 4294967296 解作与 0 相同，而按 64 位块计算时在该位置的开头应是 B6 5F C7 77。对于跨实现数据，要核对计数器位宽、nonce、密钥及轮数，且消息真实性需要独立认证机制。

## 常见误区

- 计数器 1 的起点是字节 64，逐字节偏移需要识别块内位置。
- Salsa20/12 与 Salsa20/20 的轮数改变输出，即便输入参数的字节完全相同。
- 普通 Salsa20 输出只有异或后的消息，没有隐含的认证标签。

