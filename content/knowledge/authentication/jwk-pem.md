---
capabilityId: pair:JWK%20to%20PEM
title: JWK / PEM
topicGroup: authentication
summary: 在 JWK 的 JSON 参数和 PEM 的密钥结构之间转换，并核对 RFC 7638 指纹。
aliases:
  - JWK to PEM
  - PEM to JWK
  - JSON Web Key
  - JWK thumbprint
sources:
  - id: jwk
    title: RFC 7517 JSON Web Key (JWK)
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc7517
    language: en
    kind: standard
    locator: 第 4、5 节，密钥字段与 JWK Set
  - id: jwa
    title: RFC 7518 JSON Web Algorithms (JWA)
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc7518
    language: en
    kind: standard
    locator: 第 6 节，RSA 模数、指数与 EC 坐标
  - id: thumb
    title: RFC 7638 JSON Web Key (JWK) Thumbprint
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc7638
    language: en
    kind: standard
    locator: 第 3 节，必要成员按字段排序、计算摘要
  - id: pem
    title: RFC 7468 Textual Encodings of PKIX, PKCS, and CMS Structures
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc7468
    language: en
    kind: standard
    locator: 第 2、5、6、7、13 节，文本封装标签
  - id: engine
    title: CyberChef 11.5.0 公钥模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/PublicKey.js
    language: en
    kind: implementation
    locator: JWK to PEM / PEM to JWK 的 RSA、EC、集合和标签分支
---

## 介绍
<!-- sources: jwk, pem -->
JWK 是用 JSON 表达密钥参数的一种格式，例如 RSA 公钥有 kty、n 和 e。PEM 用 Base64 和文本边界包住 DER 结构。两种表示之间转换，要先识别算法及参数，再保存相同的公钥或私钥要素。

## RSA 与 EC 的不同字段
<!-- sources: jwk, jwa, pem -->
RSA 的 n、e 为以 Base64URL 编码写出的无符号整数。EC 公钥写明曲线 crv，并提供坐标 x 与 y。PEM 的 PUBLIC KEY 结构则把算法和公钥字段放在 ASN.1 中，编码方式不同，表达的参数可相同。

## 密钥集合与指纹
<!-- sources: jwk, thumb, engine -->
JWK Set 将密钥收在 keys 数组。转换程序可以依次将支持的数组元素变成相应 PEM 区块。计算 JWK 指纹时，按 RFC 7638 只选算法规定的必要公开成员、按键名排序、用紧凑 JSON 序列化并计算摘要。额外的 kid 字段不在计算输入中。

## 样例转换
<!-- sources: jwk, jwa, thumb, pem, engine -->
以下用本地测试生成的公钥核对结构转换，比较数学参数以避开 PEM 换行差异。

:::example RSA 公钥转换
[输入]
一份 RSA JWK，kty 为 RSA，e 为 AQAB，并有对应的 n
[结果]
一个 PUBLIC KEY PEM，保留 n，公开指数解为 65537
[说明]
AQAB 解成 01 00 01。导出的 ASN.1 公钥和原密钥数学参数一致。
:::

:::example 按集合依次导出
[输入]
包含 RSA 与 EC 两份公钥的 keys 数组，RSA 在前
[结果]
两个 PEM 块，依次包含 RSA 和 EC 公钥
[说明]
转换保留所给集合的排列顺序。
:::

:::example 从 PEM 取得 JSON 与指纹
[输入]
RSA 的 PUBLIC KEY PEM，启用将 kid 设置为 RFC 7638 指纹
[结果]
返回含 kty、n、e 与 kid 的 JSON；kid 为规范指纹
[说明]
将 e、kty、n 依键名排序后，计算 SHA-256 并以无填充 Base64URL 写出。
:::

## 支持形式与标签
<!-- sources: jwk, pem, engine -->
当前这套转换接受相应的 RSA 与 EC JWK，OKP 公钥会拒绝。读 RSA 公钥的 PEM 时应使用装有 SubjectPublicKeyInfo 的 PUBLIC KEY 边界；直接使用 RSA PUBLIC KEY 的 PKCS #1 结构会遇到格式限制。JSON 附加信息也不一定能从 PEM 恢复。

## 常见误区
- JWK 的 n 和 e 是编码后的整数，不能当成十进制串读取。
- 同一个公钥可以有多种序列化形式，比较时需统一格式或参数。
- RFC 7638 指纹不对整个随手排版的原始 JSON 文本求摘要。
