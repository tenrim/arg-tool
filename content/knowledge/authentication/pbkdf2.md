---
capabilityId: op:Derive%20PBKDF2%20key
title: 派生 PBKDF2 密钥
topicGroup: authentication
summary: 从口令、盐与迭代次数推导所需字节数，区分 HMAC 迭代与分块输出。
aliases:
  - PBKDF2
  - Derive PBKDF2 key
  - PKCS #5
sources:
  - id: spec
    title: "RFC 8018 PKCS #5: Password-Based Cryptography Specification Version 2.1"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc8018
    language: en
    kind: standard
    locator: 第 5.2 节，PBKDF2 各块和 HMAC PRF
  - id: vectors
    title: RFC 6070 PBKDF2 HMAC-SHA1 Test Vectors
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc6070
    language: en
    kind: standard
    locator: 迭代 1 与 2 的测试向量
  - id: engine
    title: CyberChef 11.5.0 密码模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Ciphers.js
    language: en
    kind: implementation
    locator: Derive PBKDF2 key：口令与盐参数、随机盐回退和长度转换
---

## 介绍
<!-- sources: spec, engine -->
PBKDF2 从口令和盐推导指定长度的字节串。它让一次推导需要重复执行一项伪随机函数，并把多个输出块连接起来以满足长度要求。常用的伪随机函数由 HMAC 提供。

## 每个块的计算
<!-- sources: spec -->
第 i 块的第一项 U₁ 是 PRF(P,S∥INT(i))，P 是口令，S 是盐，INT(i) 为块序号的四字节大端表示。后续 Uⱼ=PRF(P,Uⱼ₋₁)。把本块所有 U 值逐位异或，再取各块连接结果的前若干字节。

## 盐、迭代和输出长度
<!-- sources: spec, engine -->
迭代次数决定每块计算多少项。盐使相同口令在不同记录里可以有不同结果。当前操作的密钥长度按位指定，传给底层时除以 8；空盐栏会触发随机盐回退。复核用的样例须明确给出相同盐字节。

## 输入与完整派生值
<!-- sources: spec, vectors, engine -->
以下口令和盐均按 ASCII 字节读入。前两项为公开向量，第三项比较另一种 PRF。

:::example 一次 HMAC-SHA-1
[输入]
口令 password，盐 salt，迭代 1，输出 160 位
[结果]
0c60c80f961f0e71f3a9b524af6012062fe037a6
[说明]
要求 20 字节，SHA-1 的一个完整块足够，结果为 U₁。
:::

:::example 两次 HMAC-SHA-1
[输入]
同一口令、盐和输出长度，迭代 2
[结果]
ea6c014dc72d6f8ccd1ed92ace1d41f0d8de8957
[说明]
结果对应 U₁ 与 U₂ 的异或。
:::

:::example HMAC-SHA-256
[输入]
口令 password，盐 salt，迭代 1，输出 256 位
[结果]
120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b
[说明]
输出仍是一块，PRF 改为 SHA-256 后产生 32 字节。
:::

## 记录算法条件
<!-- sources: spec, engine -->
复算须同时使用口令字节、盐、PRF、迭代次数和输出长度。仅保留屏幕上的十六进制密钥不会保留这些派生条件。例子的低迭代次数便于校对过程，实际记录应采用其应用协议的配置。

## 常见误区
- 设定 160 位输出相当于 20 字节。
- 迭代是在每个输出块内重复 PRF，再异或各项。
- 空盐栏会产生随机回退，不能当成显式的零长度固定盐。
