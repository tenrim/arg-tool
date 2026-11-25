---
capabilityId: op:Derive%20HKDF%20key
title: 派生 HKDF 密钥
topicGroup: authentication
summary: 先从密钥材料提取伪随机密钥，再按上下文和长度扩展输出。
aliases:
  - HKDF
  - Derive HKDF key
  - Extract and Expand
sources:
  - id: spec
    title: RFC 5869 HMAC-based Extract-and-Expand Key Derivation Function
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc5869
    language: en
    kind: standard
    locator: 第 2 节 Extract / Expand、附录 A.1/A.3 SHA-256 实例
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Derive HKDF key：with salt、no salt、skip 及长度限制
---

## 介绍
<!-- sources: spec, engine -->
HKDF 把已有密钥材料整理为指定长度的派生字节。它分为提取和扩展，应用可以把不同的上下文字节送入扩展阶段，为不同用途派生各自的结果。

## Extract 阶段
<!-- sources: spec, engine -->
提取阶段以盐为 HMAC 密钥，以输入密钥材料 IKM 为消息，得到伪随机密钥 PRK。没有给盐时，以摘要长度的全零字节作盐。如果协议已经有合适的 PRK，可以执行单独的扩展阶段。

## Expand 阶段
<!-- sources: spec, engine -->
令 T₀ 为空。第 i 块 Tᵢ 是 HMAC(PRK,Tᵢ₋₁∥info∥单字节 i)。连接各块后，取前 L 个字节。块号是一字节且从 1 开始，故 L 不超过摘要长度的 255 倍。info 是应用规定的上下文，可为空。

## SHA-256 测试向量
<!-- sources: spec, engine -->
下面使用 RFC 5869 的向量。用例 1 和用例 3 都从 22 个 0B 字节开始，输出 42 字节。

:::example RFC 用例 1
[输入]
22 个 0B 字节；盐 000102030405060708090a0b0c；info f0f1f2f3f4f5f6f7f8f9
[结果]
3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865
[说明]
先选择有盐提取，再扩展并截取 42 字节。
:::

:::example RFC 用例 3
[输入]
22 个 0B 字节；无盐，info 为空
[结果]
8da4e775a563c18f715f802a063c5a31b8a11f5c5ee1879ec3454e5f3c738d2d9d201395faa4b61a96c8
[说明]
提取仍照常进行，盐取 32 个零字节。
:::

:::example 将已知 PRK 直接用于扩展
[输入]
PRK 077709362c2e32df0ddc3f0dc47bba6390b6c73bb50f9c3122ec844ad7c2b3e5；info 与用例 1 相同
[结果]
3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865
[说明]
该 PRK 是用例 1 的中间值，跳过提取后得到一致的扩展结果。
:::

## 选择派生输入
<!-- sources: spec -->
HKDF 不会给低熵口令增加猜测成本。已有随机或协商产生的密钥材料适合这类提取扩展。实际使用还需要设计者明确规定每个派生用途的 info 和长度，让各侧可以精确复算。

## 常见误区
- “无盐”仍执行提取，“跳过”则把输入当成 PRK。
- info 与盐参与不同阶段。
- 相同输入与相同上下文会重现相同字节。
