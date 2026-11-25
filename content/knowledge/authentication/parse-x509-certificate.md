---
capabilityId: op:Parse%20X.509%20certificate
title: 解析 X.509 证书
topicGroup: authentication
summary: 拆解 X.509 证书的主体、签发者、有效期、公钥、扩展和签名字段。
aliases:
  - X.509 证书
  - Parse X.509 certificate
  - 证书字段
sources:
  - id: x509
    title: RFC 5280 Internet X.509 Public Key Infrastructure Certificate and CRL Profile
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc5280
    language: en
    kind: standard
    locator: 第 4～6 节，证书、CRL 的字段和路径校验
  - id: pem
    title: RFC 7468 Textual Encodings of PKIX, PKCS, and CMS Structures
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc7468
    language: en
    kind: standard
    locator: 第 2、5、6、7、13 节，文本封装标签
  - id: curves
    title: RFC 5480 Elliptic Curve Cryptography Subject Public Key Information
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc5480
    language: en
    kind: standard
    locator: 第 2.1.1 节，secp256r1、prime256v1 与 P-256 命名
  - id: engine
    title: CyberChef 11.5.0 公钥模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/PublicKey.js
    language: en
    kind: implementation
    locator: Parse X.509 certificate 的输入解包、主体、公钥及签名展示
---

## 介绍
<!-- sources: x509, pem -->
X.509 证书由待签名证书内容、签名算法和签名值组成。待签名内容绑定主体及其公钥，并给出序列号、签发者、有效期和扩展。PEM 可把 DER 证书用文本方式封装。

## 主体、有效期和扩展
<!-- sources: x509, engine -->
序列号通常由签发者在其授权范围内分配。主体栏可含通用名，Subject Alternative Name 扩展还能列出 DNS 名等其他标识。有效期含 Not Before 与 Not After 两端，日期文本的表示需结合对应时区字段读取。

## 公钥类型与签名类型
<!-- sources: x509, engine -->
主体公钥信息记录主体算法和参数，签名算法说明签发者使用什么算法生成证书签名。两者可以不同。例如主体公钥用椭圆曲线，签发者仍可用 RSA 给这份证书签名。

## 合成证书的核对
<!-- sources: x509, pem, curves, engine -->
以下主体名称用于本地格式测试。正常解析只读取字段，可用另一种读取器交叉检查。

:::example RSA 主体和序列号
[输入]
主体 mist.example、签发者 Mist Fixture CA、序列号十进制 42 的 RSA PEM 示例
[结果]
主体与签发者分栏，序列号 42（0x2a），公钥算法 RSA
[说明]
序列号、主体和签发者来自待签名证书部分。
:::

:::example DER Hex 还原同一证书
[输入]
同一证书的 DER 字节改用十六进制填写，选择 DER Hex
[结果]
有效期为 2024-01-01 00:00:00 UTC 至 2034-01-01 00:00:00 UTC，序列号仍为 42
[说明]
移走 PEM 封装并用 Hex 表示 DER 不会改变内部时间和序列号。
:::

:::example RSA 签发者签椭圆曲线公钥
[输入]
主体 elliptic.example、序列号 63、主体曲线 prime256v1、签发算法 SHA256withRSA 的示例
[结果]
公钥曲线栏显示 secp256r1，证书签名算法为 SHA256withRSA
[说明]
prime256v1 与 secp256r1 是同一曲线的两个名称，签名算法仍由签发者侧决定。
:::

## 与信任路径核对
<!-- sources: x509, engine -->
证书是否可用于某个连接，需要核对名称、有效期、签名路径、信任锚、用途限制和适用的吊销状态。只查看表格中的证书内容，可以了解声明了什么，还不能得到这些验证的结果。

## 常见误区
- 主体公钥类型可与证书签名类型不同。
- 同一 DER 对象可有 PEM 和 Hex 等外部表示。
- 证书字段可读并不表示它已由受信任的签发者验证。
