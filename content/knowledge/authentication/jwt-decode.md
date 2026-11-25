---
capabilityId: op:JWT%20Decode
title: 解码 JWT
topicGroup: authentication
summary: 读取签名 JWT 中的 JSON 声明，区分载荷解析与信任验证。
aliases:
  - JWT Decode
  - JSON Web Token 解码
  - JWS 载荷
  - Base64URL 声明
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
  - id: engine
    title: CyberChef 11.5.0 — Crypto 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: JWT Decode 将 jsonwebtoken 的 payload 返回给调用者
---

## 介绍
<!-- sources: jwt, jws -->

JWT 用紧凑的字符串携带 JSON 声明。在常见的 JWS 形式中，头部和载荷可以直接解码阅读，最后一段是对原字节计算的认证码或数字签名。解码工具提取的是载荷视图，签名和声明的可信度需要另外验证。

## 紧凑格式各段的含义
<!-- sources: jwt, jws -->

JWS 的紧凑形式按头部、载荷、签名排列，以句点分隔。头部和载荷分别从 UTF-8 字节转为无填充的 Base64URL。JWT 的载荷是一个 JSON 对象，签名段通常承载二进制数据的编码。加密的 JWE 紧凑形式有不同的段结构。

## 时间与其他声明
<!-- sources: jwt, engine -->

声明字段可以按约定表示签发者、接收者、签发时刻及有效期。例如 iat 表示签发时间，exp 表示过期时间，使用从 Unix 纪元起的秒数。固定解码入口返回载荷对象，可读取这些数值。它不会因为某项时间已到而拒绝显示。

## 合成记录中的载荷
<!-- sources: jwt, jws, engine -->

下面三个 JWT 都只包含合成的笔记字段和公共测试日期，不涉及真实账号。第一个和第二个令牌用不同的认证段，但解码载荷相同。第三个带有明确的过期时间。

:::example 读出笔记和签发时刻
[输入]
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub3RlIjoiTUlTVCIsImlhdCI6MTcwMDAwMDAwMH0.kDnF0x6MsYdAeYoEKVSjsaFVVuiPjn9bloSifye-fZo
[结果]
{"note":"MIST","iat":1700000000}
[说明]
第二段进行 Base64URL 解码后得到 JSON，iat 对应 2023-11-14 22:13:20 UTC。
:::

:::example 认证段改变后的载荷
[输入]
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub3RlIjoiTUlTVCIsImlhdCI6MTcwMDAwMDAwMH0.ADnF0x6MsYdAeYoEKVSjsaFVVuiPjn9bloSifye-fZo
[结果]
{"note":"MIST","iat":1700000000}
[说明]
第一段和第二段未改。解码仍可读出载荷，认证码是否匹配属于验签阶段。
:::

:::example 有过期声明的样本
[输入]
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub3RlIjoiTUlTVCIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAwMDAxfQ.aaOH-TUbOEzppfM_sgv1JJz9AUVLeTvImWa2s5yZ6hY
[结果]
{"note":"MIST","iat":1700000000,"exp":1700000001}
[说明]
该载荷声称签发后 1 秒过期。时间声明已过仍然可以读取为 JSON。
:::

## 从结构读取到应用判断
<!-- sources: jwt, jws, engine -->

阅读材料时，载荷可帮助了解令牌试图描述什么。头部中的 alg 属于令牌提交的内容，不能把它当作已经可信的算法选择。实际使用还需验证签名，并由应用检查签发者、接收者和有效期是否符合自身规则。

## 常见误区

- Base64URL 便于传输字节，不提供载荷保密性。
- 固定解码结果只含载荷，受保护头部是令牌的第一段。
- 解码能读出 exp，不表示它仍处在有效期。

