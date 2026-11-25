---
capabilityId: op:Public%20Key%20from%20Private%20Key
title: 从私钥提取公钥
topicGroup: authentication
summary: 从本地已有的非对称私钥中取出可公开的参数，输出 SubjectPublicKeyInfo。
aliases:
  - Public Key from Private Key
  - 私钥导出公钥
  - SPKI
sources:
  - id: pem
    title: RFC 7468 Textual Encodings of PKIX, PKCS, and CMS Structures
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc7468
    language: en
    kind: standard
    locator: 第 2、5、6、7、13 节，文本封装标签
  - id: pkcs8
    title: RFC 5958 Asymmetric Key Packages
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc5958
    language: en
    kind: standard
    locator: 第 2 节 OneAsymmetricKey / PrivateKeyInfo
  - id: rsa
    title: RFC 8017 PKCS #1 RSA Cryptography Specifications Version 2.2
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc8017
    language: en
    kind: standard
    locator: 附录 A.1 RSA 公钥、私钥的参数
  - id: ec
    title: RFC 5915 Elliptic Curve Private Key Structure
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc5915
    language: en
    kind: standard
    locator: 第 3 节 ECPrivateKey、publicKey 可选项及生成说明
  - id: engine
    title: CyberChef 11.5.0 公钥模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/PublicKey.js
    language: en
    kind: implementation
    locator: Public Key from Private Key：RSA n/e、EC 公钥点及输出 PEM
---

## 介绍
<!-- sources: pkcs8, rsa, ec -->
公私钥对包含互相关联的数学资料。已有私钥时，程序能读出其中的公共参数，或按算法从私密参数推导到公钥。导出后供分发的是公钥部分。

## RSA 与椭圆曲线的关系
<!-- sources: rsa, ec, engine -->
RSA 私钥结构通常已经储存模数 n 和公开指数 e，可直接保留这两项。椭圆曲线的公开点满足 Q=dG，d 是私密标量，G 是曲线生成点。SEC 1 结构可附带公钥，缺省时也可从 d 计算。

## 容器识别
<!-- sources: pem, pkcs8, engine -->
PKCS #8 可封装不同算法的私钥。PKCS #1 的 RSA PRIVATE KEY 则用 RSA 特定结构；EC PRIVATE KEY 可包裹 SEC 1 结构。当前操作读取这些相应的 PEM 边界，成功时输出标准 PUBLIC KEY，而不会把私密字段带入结果。

## 合成密钥的对照
<!-- sources: pem, pkcs8, rsa, ec, engine -->
以下密钥仅用于本地试算。可比较输出 DER 与独立生成密钥对象的 SPKI。

:::example PKCS #8 私钥
[输入]
2048 位 RSA 私钥，以 PRIVATE KEY PEM 表示，公开指数为 65537
[结果]
一个 PUBLIC KEY PEM，保留原模数与 65537
[说明]
算法从 PKCS #8 内部识别，对照独立 SPKI 相同。
:::

:::example 同一 RSA 私钥的 PKCS #1 容器
[输入]
同一 RSA 密钥换为 RSA PRIVATE KEY PEM
[结果]
与上例完全相同的主体公钥 DER
[说明]
私钥容器不同，但 n 和 e 没有变化。
:::

:::example SEC 1 椭圆曲线私钥
[输入]
P-256 的 EC PRIVATE KEY PEM
[结果]
一个包含同曲线、同公共点的 PUBLIC KEY PEM
[说明]
导出结果与创建那把钥匙时对应的独立公钥一致。
:::

## 适合比较的对象
<!-- sources: pem, ec, engine -->
如果同一公钥可能使用不同 PEM 换行，可先解析为 DER 或核对算法参数，再对比。提取公钥无需把私钥分享给他人。带加密封装或不受支持的密钥类型需由能解释相应容器的库处理。

## 常见误区
- 只修改 PEM 标签不会改变数据类型。
- 从私钥导出公钥保留的是可公开字段。
- 相同密钥的不同容器可生成相同的公钥。
