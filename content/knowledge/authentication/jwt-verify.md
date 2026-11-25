---
capabilityId: op:JWT%20Verify
title: 验证 JWT
topicGroup: authentication
summary: 检查 JWT 的原始签名输入，并区分密码学结果和应用声明。
aliases:
  - JWT Verify
  - JWT 验签
  - JWS 验证
  - 签发者与接收者
sources:
  - id: jwt
    title: RFC 7519 — JSON Web Token
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc7519.html
    language: en
    kind: standard
    locator: §§3–7，紧凑形式、声明和验证
  - id: jws
    title: RFC 7515 — JSON Web Signature
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc7515.html
    language: en
    kind: standard
    locator: §§3.1、5，JWS Compact 及签名输入
  - id: jwa
    title: RFC 7518 — JSON Web Algorithms
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc7518.html
    language: en
    kind: standard
    locator: §§3.2–3.4，HMAC、RSA 与 ECDSA 标识
  - id: bcp
    title: RFC 8725 — JWT Best Current Practices
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc8725.html
    language: en
    kind: standard
    locator: §3，算法、密钥及声明策略
  - id: engine
    title: CyberChef 11.5.0 — Crypto 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: JWT Verify 调用 jsonwebtoken.verify；本地固定 Worker 中密钥类型处理报错
---

## 介绍
<!-- sources: jwt, jws, bcp -->

验证 JWT 涉及两个层次。密码学验证确认紧凑串的签名与事先选定的密钥和算法相符。声明检查则核对其中记录的签发者、接收者以及允许使用的时间。只有将这些证据结合起来，使用方才能按协议解释令牌。

## 对照原始签名输入
<!-- sources: jws, jwa -->

紧凑 JWS 的签名输入直接由收到的第一、第二段和一个句点组成。使用共享秘密的算法重新计算认证码，或者用预期的公钥验证数字签名。保持两段的原始文字非常重要，先解码再格式化 JSON 会使这一步使用不同数据。

## 声明的有效性
<!-- sources: jwt, bcp -->

exp 表示在该秒数及以后不应接受令牌，nbf 表示最早接收时间。iss 和 aud 的合法值来自验证方的应用或协议。即使签名成立，签发者或接收者不符合预期时，令牌仍不适用于该上下文。核对字段时还需要知道当前评估时间和该应用允许的容差。

## 使用公开构造样本复核
<!-- sources: jws, jwa, jwt, bcp -->

这组例子按参考算法独立计算，不含真实凭据。三例分别隔离密钥、过期判断和接收者检查。所用共享测试密钥为 UTF-8 文本 example-only-hs256-key-at-least-32-bytes。

:::example 同一条记录和两把测试密钥
[输入]
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub3RlIjoiTUlTVCIsImlhdCI6MTcwMDAwMDAwMH0.kDnF0x6MsYdAeYoEKVSjsaFVVuiPjn9bloSifye-fZo
[结果]
用本节测试密钥重算，认证码为 kDnF0x6MsYdAeYoEKVSjsaFVVuiPjn9bloSifye-fZo，与给定第三段一致。换成不同的测试密钥则不一致。
[说明]
认证码的匹配只确认该 JWS 与所用的秘密和数据一致。
:::

:::example 认证码有效但已过期
[输入]
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub3RlIjoiTUlTVCIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAwMDAxfQ.aaOH-TUbOEzppfM_sgv1JJz9AUVLeTvImWa2s5yZ6hY
取验证时间 1700000002，不设时间容差。
[结果]
认证码一致。exp 为 1700000001，整个声明校验的结果为已过期。
[说明]
签名不会在过期时自行改变。“是否过期”来自拿当前时间与声明比较。
:::

:::example 与接收者策略比较
[输入]
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub3RlIjoiTUlTVCIsImlhdCI6MTcwMDAwMDAwMCwiYXVkIjoidXJuOmRlbW86bm90ZXMifQ.yt3nJmxn-G-GccCn0gxWweA4SDTQbVWzgSUfnkUKWHc
[结果]
认证码一致，aud 为 urn:demo:notes。若该应用规定接收者为 urn:demo:archive，此令牌不符合接收者要求。
[说明]
允许值来自应用的预先约定，不从令牌自身选取。
:::

## 签名结果的适用范围
<!-- sources: jwt, bcp, engine -->

固定浏览器 Worker 对上述合成样例在密钥类型判断处报 TypeError，不能把这一报错读成“认证码不匹配”等具体结论。本章样例使用独立密码库复核认证码，然后分别应用声明比较。离线工具也不具备应用的业务授权和账号状态，服务端仍需执行自身的校验。

## 常见误区

- 可被解码的载荷不一定和签名相符。
- 重新序列化载荷后不能保证原签名仍适用于新文本。
- 一个通过验签的 JWT 也可能过期，或者仅面向另一个应用。

