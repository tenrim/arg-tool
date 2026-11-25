---
capabilityId: op:Public%20Key%20from%20Certificate
title: 从证书提取公钥
topicGroup: authentication
summary: 取出证书所带的主体公钥，并保留算法及参数的标准 PEM 表示。
aliases:
  - Public Key from Certificate
  - 证书 SPKI
  - 主体公钥
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
  - id: engine
    title: CyberChef 11.5.0 公钥模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/PublicKey.js
    language: en
    kind: implementation
    locator: Public Key from Certificate：遍历证书 PEM 区块并调用 getPublicKey / getPEM
---

## 介绍
<!-- sources: x509, pem -->
证书的 SubjectPublicKeyInfo 字段保存主体的公钥。提取后可以单独检查该密钥的算法参数，也可以在其他接受公钥的地方核对它是否一致。证书的名称、有效期和签名不属于公钥数据。

## 公钥信息的字段
<!-- sources: x509, pem -->
SubjectPublicKeyInfo 的算法标识符说明怎样读出公钥字段。RSA 公钥包含模数 n 与公开指数 e，椭圆曲线公钥还要保留曲线约定和公开点。以 PUBLIC KEY 封装时保留这些结构。

## 多证书的顺序
<!-- sources: pem, engine -->
输入可以有多个 CERTIFICATE PEM 块。程序按出现顺序从每个块提取主体公钥，不会按自己推断的信任链重排。证书之间的主体、签发者对应关系需要另行分析。

## 合成样本的提取
<!-- sources: x509, pem, engine -->
以下比较所得的公钥与制作证书时写入的公钥数据，让算法与字节均可回查。

:::example 一份 RSA 主体证书
[输入]
主体 mist.example，RSA 2048 位，公开指数 65537
[结果]
一个 PUBLIC KEY PEM 块，保留原 RSA n 与 e
[说明]
导出的 DER 与原字段的 SubjectPublicKeyInfo 字节一致。
:::

:::example 一份椭圆曲线主体证书
[输入]
主体 elliptic.example，主体公钥为 P-256，证书签名采用 RSA
[结果]
一个 PUBLIC KEY PEM 块，包含 P-256 公钥
[说明]
取的是证书主体的验证材料，RSA 签名算法不改变该公钥。
:::

:::example 两份证书连续输入
[输入]
先贴 RSA 主体证书，再贴 P-256 主体证书
[结果]
两个 PUBLIC KEY PEM 块，先 RSA 后 P-256
[说明]
输出跟随输入的证书块次序。
:::

## 用公钥能核对什么
<!-- sources: x509, pem, engine -->
从不同文件取出的公钥可以用统一 DER 或数学参数比较。证书更新时，主体可能继续使用同一个公钥，证书本身的序列号、签名和有效期则可以变化。

## 常见误区
- 提取的是证书中公开的主体密钥。
- 多份证书的输出顺序不代表信任级别。
- 同一公钥可出现在不同序列号的证书里。
