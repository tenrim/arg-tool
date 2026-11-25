---
capabilityId: op:ECDSA%20Sign
title: ECDSA签名
topicGroup: authentication
summary: 使用曲线私钥、消息摘要和一次性标量计算两个签名整数。
aliases:
  - ECDSA Sign
  - 椭圆曲线签名
  - r 和 s
  - P1363 签名
sources:
  - id: fips
    title: FIPS 186-5 — Digital Signature Standard
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf
    language: en
    kind: standard
    locator: §6，EC 参数、密钥生成、ECDSA 签名和验签
  - id: example
    title: RFC 6979 — Deterministic Usage of DSA and ECDSA
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6979.html
    language: en
    kind: author-spec
    locator: §§2–3、附录 A.2.5，P-256 测试向量
  - id: der
    title: RFC 3279 — Algorithms and Identifiers for the Internet X.509 PKI
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc3279.html
    language: en
    kind: standard
    locator: §2.2.3，ECDSA-Sig-Value 两个 ASN.1 INTEGER
  - id: jwa
    title: RFC 7518 — JSON Web Algorithms
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc7518.html
    language: en
    kind: standard
    locator: §§3.4、6.2，ECDSA 的 JWS 表示及 EC JWK
  - id: engine
    title: CyberChef 11.5.0 — Ciphers 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Ciphers.js
    language: en
    kind: implementation
    locator: ECDSA Sign，ASN.1、拼接字节、Base64URL 和十六进制 JSON 输出
---

## 介绍
<!-- sources: fips, example -->

ECDSA 用椭圆曲线私钥签署一条消息。签名结果有两个整数 r、s，分别来自临时曲线点及将消息摘要与私钥结合的同余式。验证方使用公钥和原消息进行核对。

## 计算两个整数
<!-- sources: fips, example -->

设曲线基点 G 的阶为 n，消息摘要按规则转换为整数 z，签名用临时标量 k。先计算点 kG，将横坐标对 n 取模得到 r，再算 s ≡ k⁻¹(z + rd) mod n。若 r 或 s 为 0，必须按算法规则重新处理。临时标量可按规定随机选择，或者由经过验证的确定性过程生成。

## 从数对到字节
<!-- sources: der, jwa, engine -->

ASN.1 DER 使用由两个有符号 INTEGER 组成的序列。正整数最高位为 1 时会加 00 前导字节。P1363 或 JWS 用法则采用定长两段，先放 r 再放 s。JWS 的 ECDSA 签名段对这对定长字节作 Base64URL。工具中标作“JSON Web Signature”的结果仅是这段签名字节的编码，完整 JWS 还需要按该协议产生头部、载荷和签名输入。

## 可核对的签名样例
<!-- sources: fips, example, der, jwa, engine -->

第一、二例使用同一个公开向量，分别检查签名运算和字节表示。第三例用独立生成的测试密钥签署简短消息并检查实际输出。固定工具生成的临时标量不要求与确定性参考相同。

:::example P-256 的 RFC 6979 向量
[输入]
ASCII sample，SHA-256，P-256。使用 RFC 6979 附录 A.2.5 的公开测试密钥及对应的确定性临时标量。
[结果]
r = EFD48B2AACB6A8FD1140DD9CD45E81D69D2C877B56AAF991C34D0EA84EAF3716
s = F7CB1C942D657C41D436C7A1B6E29F65F3E900DBB9AFF4064DC4AB2F843ACDA8
[说明]
用该附录参数得到同一 kG，消息摘要为 AF2BDBE1AA9B6EC1E2ADE1D694F41FC71A831D0268E9891562113D8A62ADD1BF，两次模运算还原给定整数。
:::

:::example 对同一数对编码
[输入]
第一例的 r 和 s。
[结果]
P1363 拼接为 64 字节，Base64URL 为 86 字符。DER 为 72 字节，以 30 46 02 21 00 开头。
[说明]
r 与 s 各需 32 字节。两者最高位都为 1，DER 中各加一个 00 以保留正数含义。
:::

:::example 出现不同签名而验证一致
[输入]
独立生成 P-256 测试密钥，使用 SHA-256 签署 ASCII MIST，分别输出 ASN.1 HEX 和 P1363 HEX。
[结果]
两种输出都能由对应公钥与原消息验证。P1363 输出固定 64 字节，DER 长度视生成的 r、s 而定。
[说明]
格式转换通过对数值本身重新编码实现。分别执行两次签署还可能生成不同的数对。
:::

## 签署内容的原样保存
<!-- sources: fips, der, jwa -->

保存签名时还需要识别曲线、摘要算法、编码格式和原消息的确切表示。签名不会替换原文。用临时样例测试算法时，发布可复算向量没有身份含义，正式私钥与签名过程的秘密参数仍按其用途保护。

## 常见误区

- r、s 的位宽受曲线影响，不能把任意 ECDSA 签名当成固定 64 字节。
- DER 与 P1363 中的字节串看起来不同，数学上仍可表示同一数对。
- ASN.1 HEX 和 P1363 HEX 只是外层表示，不能与完整 JWS 令牌互换。

