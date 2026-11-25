---
capabilityId: op:HMAC
title: 哈希消息认证码
topicGroup: authentication
summary: 用带内外两层的哈希构造和共享密钥验证消息完整性，区分密钥的文字与字节表示。
aliases:
  - HMAC
  - 带密钥哈希
  - 消息认证标签
sources:
  - id: rfc
    title: RFC 2104 HMAC Keyed-Hashing for Message Authentication
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc2104
    language: en
    kind: standard
    locator: 第 2 节，密钥整形、ipad 与 opad
  - id: vectors
    title: RFC 4231 Identifiers and Test Vectors for HMAC-SHA
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4231
    language: en
    kind: standard
    locator: 第 4 节测试用例 1、2、3
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: HMAC：选择摘要函数、按字节输入密钥/消息、Hex 输出
---

## 介绍
<!-- sources: rfc, engine -->
HMAC 从一条消息与共享密钥计算认证标签。它用选定的哈希函数做内、外两层计算。接收者可用原字节和同一密钥重算标签，判断消息是否保持一致。

## 密钥整形与两层计算
<!-- sources: rfc -->
令 B 是哈希内部块的字节数。过长的密钥先哈希，其余密钥写入 B 字节并补零，得到 K₀。内层计算 H((K₀⊕ipad)∥M)，外层计算 H((K₀⊕opad)∥内层结果)。∥ 表示连接，ipad、opad 分别用 36、5C 十六进制字节重复填满块。

## 密钥字节与输出位数
<!-- sources: rfc, vectors, engine -->
字符串与十六进制可表示不同的字节。Hex 0b 表示一个值 0B 的字节，文本 0b 表示 30 62 两字节。使用 SHA-256 时完整标签为 32 字节，可显示成 64 个十六进制字符。

## 三组公开向量
<!-- sources: vectors, engine -->
以下均用 HMAC-SHA-256。资料中的重复字节指重复其实际字节值。

:::example 重复字节密钥
[输入]
密钥为 20 个 0B 字节，消息为 ASCII 的 Hi There
[结果]
b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7
[说明]
这是 RFC 4231 用例 1。密钥的十六进制文本应按 Hex 解码。
:::

:::example 文本密钥
[输入]
密钥 Jefe，消息 what do ya want for nothing?
[结果]
5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843
[说明]
用例 2 的四字节密钥是 4A 65 66 65，消息结尾包括问号。
:::

:::example 整段二进制消息
[输入]
密钥为 20 个 AA 字节；消息为 50 个 DD 字节
[结果]
773ea91e36800e46854db8ebd09181a72959098b3ef8c122d9635514ced565fe
[说明]
用例 3 的消息并未先转换成印在屏幕上的字符串。
:::

## 标签校验的范围
<!-- sources: rfc, vectors -->
协议可能明确要求截短标签，此时双方需使用同一长度及同一摘要算法。消息的换行、空格、字符编码等任何字节变化，也会进入认证计算。标签只用于核对，并不隐去消息原文。

## 常见误区
- HMAC 的内部块长度不等于最终标签长度。
- 直接对密钥和正文拼接后做一次哈希，不能得到 HMAC。
- 双方必须用相同的消息字节与密钥。
