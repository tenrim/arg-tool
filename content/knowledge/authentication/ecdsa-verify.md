---
capabilityId: op:ECDSA%20Verify
title: ECDSA验签
topicGroup: authentication
summary: 用原消息、公钥与签名数对复查模运算，并区分签名表示。
aliases:
  - ECDSA Verify
  - 椭圆曲线验签
  - ECDSA DER 验证
  - P1363 验证
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
    locator: ECDSA Verify，自动与手动签名表达解析
---

## 介绍
<!-- sources: fips, example -->

ECDSA 验证输入原消息、签名和对应公钥，判断签名的 r、s 是否与消息匹配。公开验证过程不需要交换签署私钥。验签之前需要确认曲线和摘要算法，再按签名来源的格式取出两个整数。

## 公开验签的数学关系
<!-- sources: fips, example -->

验证先确认 r、s 在 1 至 n−1 范围内，n 为基点阶。对原消息得到摘要整数 z 后，求 w ≡ s⁻¹ mod n，令 u₁ ≡ zw mod n，u₂ ≡ rw mod n，再计算点 u₁G + u₂Q。该点不能为无穷远点，其横坐标模 n 与 r 相同才通过这一数学验证。

## 还原二数对
<!-- sources: der, jwa, engine -->

输入为 DER 时，需要读出 SEQUENCE 中的两个 INTEGER，保留必要的正数编码。P1363 的字节流则根据曲线宽度将前半部分和后半部分分开。JWS 签名段还需先作 Base64URL 解码。用错误的格式解释字节，可能在进入椭圆曲线运算前就出错。

## 一份公开签名的多种表示
<!-- sources: fips, example, der, jwa, engine -->

下列例子均使用 RFC 6979 附录 A.2.5 的 P-256 公钥与 SHA-256。签名数值是对应消息 sample 的公开测试记录。从 x、y 可构造公钥，从 r、s 可构造所需表示。

:::example ASN.1 与 P1363 的验签
[输入]
消息 sample。公钥坐标为
x = 60FED4BA255A9D31C961EB74C6356D68C049B8923B61FA6CE669622E60F29FB6
y = 7903FE1008B8BC99A41AE9E95628BC64F2F1B20C2D7E9F5177A3C294D4462299
签名数值为
r = EFD48B2AACB6A8FD1140DD9CD45E81D69D2C877B56AAF991C34D0EA84EAF3716
s = F7CB1C942D657C41D436C7A1B6E29F65F3E900DBB9AFF4064DC4AB2F843ACDA8
[结果]
将 r、s 转为 DER 或 P1363 后，分别选择相应格式，均能通过验签。
[说明]
入口对应的数值相同，写入 DER 时两个整数各需要前置 00。
:::

:::example 将消息的首字母改为大写
[输入]
保持第一例的公钥和签名，将消息替换为 Sample。
[结果]
验证失败。
[说明]
ASCII s 与 S 相差一个比特，摘要和验证的点运算已改变。
:::

:::example Base64URL 签名段的识别
[输入]
把第一例的 64 字节 P1363 数对作 Base64URL 编码，使用相同公钥、消息和摘要。
[结果]
固定入口的自动识别通过，显式选择“JSON Web Signature”报告失败。将其解回字节再按 P1363 验证可通过。
[说明]
同一份标准签名已在独立库验证，差异出现在该入口的两条格式处理路径。
:::

## 从正确数学到公钥归属
<!-- sources: fips, jwa, engine -->

验签成立只确认公钥下的这份签名和消息相符。若待验证对象是一个完整 JWS，需要从其紧凑结构取正确的签名段，并以原头部和载荷两段的连接字节作为消息。公钥是谁的、消息是否仍适用或获授权，需要以应用资料另行确认。

## 常见误区

- 字符改动、编码变化和意外添加的换行都可能改变被验证的原消息。
- 公钥的曲线类型、摘要与签名的字节封装均需匹配。
- 单独复核了签名数学关系，还没有验证公钥归属或应用的授权条件。

