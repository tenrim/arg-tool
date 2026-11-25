---
capabilityId: op:JWT%20Sign
title: 签署 JWT
topicGroup: authentication
summary: 按 JWS 紧凑格式对头部和声明的精确表示生成认证码或数字签名。
aliases:
  - JWT Sign
  - 签署 JSON Web Token
  - JWS 签名输入
  - JWT HMAC
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
    locator: JWT Sign 使用 jsonwebtoken；浏览器 Worker 中存在密钥类型运行错误
---

## 介绍
<!-- sources: jwt, jws -->

签署 JWT 可以为载荷中的声明提供完整性保护。常见的签名 JWT 使用 JWS 紧凑形式，由头部、载荷和签名三个部分组成。HS 系列使用共享秘密生成 HMAC，RS 与 ES 系列使用公私钥体系生成数字签名。

## 完整字节串的签署
<!-- sources: jws, jwa -->

将头部及载荷分别写成 UTF-8，再分别作无填充的 Base64URL 编码。用单个句点将两个编码段连接成签名输入。计算认证码或数字签名后，把其字节也作 Base64URL 编码作为第三段。带空格和不带空格的 JSON 即便表示同一个对象，也能产生不同签名输入。

## 密钥和算法约定
<!-- sources: jwa, bcp -->

HS256 使用 HMAC-SHA256，RFC 7518 要求密钥至少 256 位。RS256 使用 RSA 的 PKCS#1 v1.5 签名算法与 SHA-256，ES256 使用 P-256 与 SHA-256，并规定如何表示签名的两个整数。签发者及验证者先按各自所处协议确定可用算法和密钥。

## 可独立复算的签名样例
<!-- sources: jws, jwa -->

这些例子只使用公开测试材料，按 RFC 签名输入复算。固定载荷中的 iat 已经写明，避免库自动补充当前时间使结果变化。章末另有当前入口的运行说明。

:::example HS256 的完整表示
[输入]
头部 {"alg":"HS256","typ":"JWT"}，载荷字节为 {"note":"MIST","iat":1700000000}。
测试密钥为 UTF-8 文本 example-only-hs256-key-at-least-32-bytes。
[结果]
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub3RlIjoiTUlTVCIsImlhdCI6MTcwMDAwMDAwMH0.kDnF0x6MsYdAeYoEKVSjsaFVVuiPjn9bloSifye-fZo
[说明]
前两段合并后作 HMAC-SHA256，返回的 32 字节以 Base64URL 形成第三段。
:::

:::example 同一个对象的不同序列化
[输入]
沿用上一例头部与密钥，将载荷字节改为 {"note":"MIST", "iat":1700000000}，逗号后有一个空格。
[结果]
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub3RlIjoiTUlTVCIsICJpYXQiOjE3MDAwMDAwMDB9.Zi3OXNtWtom4QKnZZSmZMBhGX5aaetEHHKqhB1D6vTM
[说明]
Base64URL 载荷与认证码随确切字节而变化。先解析载荷再重新序列化的库可能会移除这一个空格。
:::

:::example HS512 的长度变化
[输入]
头部 {"alg":"HS512","kid":"sample-key-1"}，载荷与第一例相同。
测试密钥为 UTF-8 文本 0123456789abcdef 连写 4 次，共 64 字节。
[结果]
第三段为 eH92Eor0LLJz8yq-Kf_Vf0uSuWISwR1p4UWnCmmR0zMe1OGwKAxz6cBJ9n583qU91fiYipMzJG8MUB8V4kdGfw。
[说明]
HMAC-SHA512 产生 64 字节认证码。头部含义和签署时选用的算法应一致。
:::

## 核对签名和密钥用途
<!-- sources: jws, bcp, engine -->

签发后可以用与算法匹配的验证密钥检查三段结构。使用共享秘密时，验证方需有同一秘密。使用公私钥时，验证使用公钥，私有材料只由签发方持有。

在固定浏览器 Worker 中，用本章合成 HS256 输入以及独立生成的 RSA、ECDSA 测试私钥调用，均在密钥类型判断处报 TypeError，无可用签名输出。上述签名实例按标准使用独立算法计算。看到这个错误时，应先区分运行环境问题和证书、密钥内容问题。

## 常见误区

- 签名保护数据完整性，头部和未加密载荷通常仍可读。
- 共享秘密产生认证码。公私钥数字签名生成和验证使用不同的密钥。
- 复制 JSON 前后若改变了实际字节，原先的签名输入也会变化。

