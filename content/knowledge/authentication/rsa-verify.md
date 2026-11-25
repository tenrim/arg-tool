---
capabilityId: op:RSA%20Verify
title: RSA验签
topicGroup: authentication
summary: 用 RSA 公钥检查签名和原消息的编码关系，辨认算法与字节输入。
aliases:
  - RSA Verify
  - RSA 验证
  - PKCS #1 v1.5 验签
  - 签名校验
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
    locator: RSA Verify，消息按 Raw、Hex 或 Base64 转换后计算摘要
---

## 介绍
<!-- sources: std, fips -->

RSA 验签把公钥、原消息和外部提供的签名结合起来，判断签名是否与消息相符。典型场景是检查文件或记录有无改动。签名可通过不同显示方式承载，验证最终作用于确切字节。

## 公钥运算和预期编码
<!-- sources: std, fips -->

对输入签名执行 RSA 的公开指数运算，恢复编码代表值。对 RSASSA-PKCS1-v1_5，还要按给定摘要算法重新编码原消息，并核对此字节串与恢复出的编码是否一致。其中包括模数字节数、填充、算法标识和摘要内容。

## 识别消息的字节
<!-- sources: std, engine -->

若文字栏输入 MIST，按 ASCII 或 UTF-8 都会得到 4D 49 53 54。输入十六进制的 4d495354 并声明它为十六进制，也会得到相同字节。将 4d495354 当作八个普通字符则是另一条消息。签名字节与原消息各自有独立的表示方式。

## 正例和反例
<!-- sources: std, fips, engine -->

生成一对独立的 2048 位 RSA 测试密钥。用私钥、SHA-256 与 PKCS #1 v1.5 签署 ASCII MIST。把生成后的 256 字节签名和公钥代入下列验证。

:::example 两种文字表示的同一消息
[输入]
第一组以原始文字提交 MIST，第二组以十六进制提交 4D495354，两次都使用同一签名和公钥，摘要为 SHA-256。
[结果]
两次均通过。
[说明]
只有外层的输入表示改变，送给摘要函数的四个字节一致。
:::

:::example 修改文字后重验
[输入]
保留公钥、摘要和原签名，只把原始消息改成 Mist。
[结果]
验签失败。
[说明]
RSA 公钥运算与原签名保持不变，改后的消息摘要已不同。
:::

:::example 换用不同摘要算法
[输入]
公钥、签名和 MIST 均保持不变，待验算法从 SHA-256 改为 SHA-512。
[结果]
验签失败。
[说明]
算法标识及摘要内容均不再对应输入签名中的 DigestInfo。
:::

## 公钥来源和签名用途
<!-- sources: std, fips -->

验证成立说明该组消息字节、签名和公钥相符。要将签名与实际个人或组织联系起来，需要对公钥本身来源另行确认。挑战材料中的签名还可能采用 PSS 或其他算法，只有先确认签名类型才适合解释一次验签失败。

## 常见误区

- 对应公钥可以拿来验签，验证不要求交换私钥。
- 原文件和复制粘贴后的文本可能存在不可见的换行差别。
- 无法验签并不当然归因于正文篡改，也要检查字节编码和算法。

