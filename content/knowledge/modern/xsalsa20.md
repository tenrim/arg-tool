---
capabilityId: op:XSalsa20
title: XSalsa20
topicGroup: modern
summary: 将 24 字节 nonce 分成子密钥派生部分和消息使用部分，构造 Salsa20 密钥流。
aliases:
  - XSalsa20
  - HSalsa20
  - 扩展 Nonce
  - 192 位 nonce
sources:
  - id: sodium
    title: Libsodium — xsalsa20
    publisher: Libsodium
    url: https://doc.libsodium.org/advanced/stream_ciphers/xsalsa20
    language: en
    kind: official-doc
    locator: 32 字节密钥、24 字节 nonce、子密钥及流
  - id: hsalsa
    title: Libsodium 1.0.20 — HSalsa20 Reference
    publisher: Daniel J. Bernstein / Libsodium
    url: https://github.com/jedisct1/libsodium/blob/1.0.20-RELEASE/src/libsodium/crypto_core/hsalsa20/ref2/core_hsalsa20_ref2.c
    language: en
    kind: implementation
    locator: 20 轮及八个子密钥输出字
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
    locator: XSalsa20，nonce 分段、子密钥和块计数器
---

## 介绍
<!-- sources: sodium, hsalsa -->

XSalsa20 将 Salsa20 的 nonce 扩展到 24 字节。它先将原密钥与 16 字节 nonce 前缀组合成子密钥，再用后 8 字节生成消息处理所需的 Salsa20 密钥流。标准用法中的原密钥为 32 字节。

## HSalsa20 的子密钥
<!-- sources: sodium, hsalsa, core -->

HSalsa20 沿用 Salsa 的状态混合，输入中的四个 32 位字来自 nonce 前 16 字节。混合结束后选取编号 0、5、10、15、6、7、8、9 的八个状态字，每字按小端输出。与普通 Salsa20 输出整块的做法不同，这一步直接用所选状态字生成 32 字节子密钥。

## 生成消息密钥流
<!-- sources: sodium, hsalsa, core -->

子密钥送入 Salsa20 后，nonce 的最后八字节用于区分流，计数器决定从流的第几块开始。密钥流按 64 字节一块产生。明文和密文用同一流异或可互相转换。XSalsa20 的名称中的 20 指完整的 20 轮结构。

## nonce 两段的对照
<!-- sources: sodium, hsalsa, core, engine -->

以下各例密钥均为 32 个 00，消息为 16 个 00，使用完整 20 轮。只改变 nonce 的指定一段或计数器。最终输出可以与先算 HSalsa20、再算 Salsa20 的独立实现逐字节比较。

:::example 全零 nonce 的第一块
[输入]
24 个 00 的 nonce，计数器 0。
[结果]
BA 6E 26 DF 4B 2E A2 CF 64 D2 D3 63 66 23 B5 F4
[说明]
即使两种算法都使用全零原密钥，XSalsa20 生成了子密钥，所以与普通 Salsa20 的全零短 nonce 基准不同。
:::

:::example 前 16 字节变化
[输入]
nonce 为 01 后接 23 个 00，计数器 0。
[结果]
ED 36 42 C7 3B A4 5B C2 F8 21 49 18 16 2E A4 6C
[说明]
修改发生在 HSalsa20 的输入，后八字节仍全为 00。
:::

:::example 后八字节变化
[输入]
nonce 为 23 个 00 后接 01，计数器 0。
[结果]
28 F9 FC 35 7A 5A 58 94 2B 66 E5 D5 49 DD 36 43
[说明]
前 16 字节相同，子密钥与第一例一致，消息阶段所用八字节 nonce 发生变化。
:::

:::example 同一条流的第二块
[输入]
24 个 00 的 nonce，计数器改为 1。
[结果]
05 43 97 02 D7 BF EA 6B 04 19 B7 B7 D0 2A F7 40
[说明]
密钥和 nonce 都与第一例相同，从字节偏移 64 起取流。
:::

## 互操作与认证层
<!-- sources: sodium, hsalsa, core, engine -->

固定入口接受的范围与常见标准实现有区别，例如也接受 16 字节原密钥。对上述全零样本，它把 4294967296 的初始计数器视为 0，按 64 位块计数计算则会以 31 62 FF C5 开头。仅有 XSalsa20 密文不会验证消息边界、发送者或完整性。采用 XSalsa20 与 Poly1305 的封装要与单独的流加密分别识别。

## 常见误区

- 24 字节 nonce 的前 16 字节不是填充，会参与生成子密钥。
- XSalsa20 的密钥与 nonce 应分别处理，不能把连接后的全部字节当成一条密钥。
- 对比不同库时，应从标准的 32 字节密钥和完整轮数开始校对。

