---
capabilityId: op:RSA%20Sign
title: RSA签名
topicGroup: authentication
summary: 用 RSA 私钥签署经过摘要与标准编码的消息，输出独立签名字节。
aliases:
  - RSA Sign
  - RSASSA-PKCS1-v1_5
  - RSA 消息签名
  - DigestInfo
sources:
  - id: std
    title: RFC 8017 — PKCS #1 RSA Cryptography Specifications
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc8017.html
    language: en
    kind: official-doc
    locator: §§5.2、8–9，RSA 签名与编码核验
  - id: fips
    title: FIPS 186-5 — Digital Signature Standard
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf
    language: en
    kind: standard
    locator: §§3、5.5，生成、验签及 DigestInfo 检查
  - id: engine
    title: CyberChef 11.5.0 — Ciphers 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Ciphers.js
    language: en
    kind: implementation
    locator: RSA Sign，使用选定消息摘要与 PKCS #1 v1.5 签名
---

## 介绍
<!-- sources: std, fips -->

RSA 数字签名用于把消息的完整性与签名者的私钥联系起来。签名者对消息生成摘要并按选定方案编码，再执行私钥对应的签名运算。原消息可以和签名分开保存，验证者需要两者及对应公钥。

## 签名方案与摘要编码
<!-- sources: std, fips, engine -->

RSASSA-PKCS1-v1_5 定义 DigestInfo 结构，包含哈希算法标识与实际摘要。对长为 k 字节的模数，将签名输入编码为 `00 01`、填充 `FF`、分隔字节 `00`，以及 DigestInfo。RSA 私钥运算作用于整个编码块得到签名。RSA-PSS 使用不同的编码与盐机制，应按原协议区分。

## 固定长度和表示
<!-- sources: std, engine -->

标准签名结果长 k 字节。一个 2048 位模数对应 256 字节签名，若显示成十六进制则占 512 个十六进制字符。显示转换不应该丢失左侧零字节。签名生成使用原消息的字节，终端换行、不同 Unicode 编码或不同的解析流程都会影响摘要。

## 计算与独立复核例子
<!-- sources: std, fips, engine -->

使用自己生成的一对 2048 位 RSA 测试密钥、SHA-256 与 RSASSA-PKCS1-v1_5。签名字节取决于密钥，下面给出可以复核的消息摘要、表示长度和相关数学关系。

:::example 消息 MIST 的摘要
[输入]
ASCII MIST，字节 4D 49 53 54。
[结果]
SHA-256 为 B480DE16B1751104F979B804B3E51A4C5F39042718A942117900C6A839F79678。
[说明]
签名编码中的 DigestInfo 会保留 32 字节摘要及 SHA-256 的算法标识。
:::

:::example 2048 位签名的布局
[输入]
在上述测试条件下签署 MIST，并用原公钥核对得到的编码代表值。
[结果]
签名 256 字节。对应编码由 00 01、202 个 FF、00 与 51 字节的 DigestInfo 组成。
[说明]
2 + 202 + 1 + 51 = 256。DigestInfo 的末 32 字节正是上一例的摘要。
:::

:::example 对同一字节串重复签名
[输入]
用同一把测试私钥和 SHA-256、PKCS #1 v1.5 分别签署同一字节串 MIST 两次。
[结果]
两次签名逐字节相同。对应公钥能验证 MIST，将文本换为 Mist 后原签名失配。
[说明]
v1.5 所用的 DigestInfo 和填充都是确定的。文本大小写变化会改变摘要。
:::

## 使用公开材料解释结果
<!-- sources: std, fips -->

已生成的签名可用于核对谜题给定的数据版本和公钥。其验证结果应与公钥从何处获得、使用的摘要和签名方案一起解释。生成签名不改变原消息的可读性，发送给别人时可只公开签名和对应公钥。

## 常见误区

- 只有一个摘要不能替代由私钥产生的 RSA 签名。
- RSA-PSS 与 PKCS #1 v1.5 验证结构不同，不能因为同用 SHA-256 就混用。
- 签名长度由模数决定，消息增长不会相应增大签名。

