---
capabilityId: op:Generate%20ECDSA%20Key%20Pair
title: 生成 ECDSA 密钥对
topicGroup: authentication
summary: 从所选椭圆曲线上的私有标量生成公钥点并表示为常见密钥格式。
aliases:
  - Generate ECDSA Key Pair
  - EC 密钥对
  - P-256
  - P-384
  - P-521
sources:
  - id: fips
    title: FIPS 186-5 — Digital Signature Standard
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf
    language: en
    kind: standard
    locator: §6，EC 参数、密钥生成、ECDSA 签名和验签
  - id: curves
    title: SP 800-186 — Elliptic Curve Domain Parameters
    publisher: NIST
    url: https://csrc.nist.gov/pubs/sp/800/186/final
    language: en
    kind: standard
    locator: §3.2，P-256、P-384、P-521
  - id: example
    title: RFC 6979 — Deterministic Usage of DSA and ECDSA
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6979.html
    language: en
    kind: author-spec
    locator: §§2–3、附录 A.2.5，P-256 测试向量
  - id: jwa
    title: RFC 7518 — JSON Web Algorithms
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc7518.html
    language: en
    kind: standard
    locator: §§3.4、6.2，ECDSA 的 JWS 表示及 EC JWK
  - id: enc
    title: SEC 1 v2.0 — Elliptic Curve Cryptography
    publisher: Certicom Research / SECG
    url: https://www.secg.org/sec1-v2.pdf
    language: en
    kind: standard
    locator: §3.2，密钥对生成与验证
  - id: engine
    title: CyberChef 11.5.0 — Ciphers 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Ciphers.js
    language: en
    kind: implementation
    locator: Generate ECDSA Key Pair，PEM、JWK 与标作 DER 的十六进制输出
---

## 介绍
<!-- sources: fips, enc -->

ECDSA 密钥对基于一条指定的椭圆曲线。私钥是落在允许范围的秘密整数 d，公钥是同一曲线上的点 Q。两者关系写成 Q = dG，其中 G 为标准预先指定的基点。

## 曲线参数与密钥生成
<!-- sources: fips, curves, enc -->

曲线参数给出有限域、曲线方程、基点和基点的阶 n。生成私钥时，从 1 到 n−1 的合法空间选取 d，再作标量乘法。公钥点通常用坐标 x、y 表示。不同曲线的参数和坐标宽度不同，即使整数 d 相同，生成结果也要在各自曲线上解释。

## 表示公钥和私钥
<!-- sources: jwa, enc, engine -->

EC 公钥的 JWK 至少需要类型 kty、曲线标识 crv、坐标 x 与 y。私钥结构还含有 d。PEM 可以为公钥和私钥分别封装 ASN.1 结构。固定入口中，JWK 导出组合两条对象，PEM 导出包含两个密钥块，而标为 DER 的 EC 选项实际返回私有标量的十六进制，不是含曲线元数据的 ASN.1 密钥对象。

## 测试密钥及输出核对
<!-- sources: fips, curves, example, jwa, engine -->

第一例用已发表的测试参数独立派生公开坐标。后两例只检查随机生成的测试对象格式与数学对应关系，具体私钥无需记录。

:::example 已知 P-256 公钥坐标
[输入]
RFC 6979 附录 A.2.5 的公开测试标量 d = C9AFA9D845BA75166B5C215767B1D6934E50C3DB36E89B127B8A622B120F6721。
[结果]
x = 60FED4BA255A9D31C961EB74C6356D68C049B8923B61FA6CE669622E60F29FB6
y = 7903FE1008B8BC99A41AE9E95628BC64F2F1B20C2D7E9F5177A3C294D4462299
[说明]
用 P-256 基点执行 dG，按曲线的 32 字节坐标宽度分别读取 x 与 y。
:::

:::example P-256 JWK 中的字段
[输入]
生成 P-256 测试密钥，导出 JWK 并比较公私钥对象。
[结果]
两条记录的 crv 为 P-256，x、y 解码后各为 32 字节。只有私钥对象有 d，且两条记录的 x、y 相同。
[说明]
用独立密码库从私钥重新导出公钥，可核对是否对应同一个点。
:::

:::example P-384 PEM 与 P-521 标量
[输入]
分别生成 P-384 的 PEM 结果和 P-521 的 DER 选项结果。
[结果]
P-384 PEM 包含 PUBLIC KEY 和 PRIVATE KEY 块。P-521 的后一个输出则是十六进制数字串。
[说明]
前者可导入 ASN.1 密钥解析器并确认曲线。后者只含私有标量，须依赖外部曲线信息解释，字段名不会自动为它补全封装。
:::

## 验证密钥身份和用途
<!-- sources: fips, enc, jwa -->

密钥点的合法性和公私钥对应关系都可根据曲线信息来检查。公钥匹配不表示已经知道密钥所有者，后者要依赖可信交换、证书或应用记录。发布示例时可传递公钥和曲线；正式密钥的私有标量应由所有者控制。

## 常见误区

- 不是任意 x、y 数值组合都能成为指定曲线上的合法公钥。
- P-256 的标称位数描述曲线量级，公钥点有两个坐标，文本长度另由编码决定。
- 私钥标量的十六进制与 DER 私钥文件含有不同范围的信息。

