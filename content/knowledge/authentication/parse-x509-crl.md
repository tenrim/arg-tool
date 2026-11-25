---
capabilityId: op:Parse%20X.509%20CRL
title: 解析 X.509 证书吊销列表
topicGroup: authentication
summary: 读取 CRL 的签发者、更新范围和被吊销证书的序列号。
aliases:
  - Parse X.509 CRL
  - 证书吊销列表
  - CRL 序列号
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
    locator: Parse X.509 CRL：读 PEM、Hex 等结构，展示更新、扩展和条目
---

## 介绍
<!-- sources: x509, pem -->
证书吊销列表由签发体系发布，记录其覆盖范围内被吊销的证书。外层包含待签名列表及对应签名，待签名部分载有签发者、更新信息及以序列号辨认的吊销记录。

## 更新时刻和列表版本
<!-- sources: x509, engine -->
thisUpdate 是本份列表发出的时间，nextUpdate 表示下一份更新的预计边界。在查看材料时，应核对列表的来源、签名及时间范围。版本与扩展会影响可适用的处理规则。

## 序列号、条目和范围
<!-- sources: x509, engine -->
吊销条目常包含证书序列号和吊销时刻，还可带原因等扩展。序列号要在正确签发者或适用范围内解释。另一签发者也可以使用相同编号，因此仅对照短整数无法认定是同一证书。

## 吊销条目的对照
<!-- sources: x509, pem, engine -->
以下为本地生成的 v2 示例，签发者均为 Mist Fixture CA，签名算法 SHA256withRSA。

:::example 有两个吊销条目的列表
[输入]
包含序列号十进制 42 和 43，吊销时间均为 2024-02-02 00:00:00 UTC 的 CRL
[结果]
两条记录，序列号分别为 2A 和 2B，吊销日期相同
[说明]
列表以十六进制显示这两个序列号。
:::

:::example 没有吊销条目的快照
[输入]
只有 thisUpdate 2024-02-01 和 nextUpdate 2024-03-01 的示例 CRL，不含记录
[结果]
仍显示两项更新时间，没有序列号条目
[说明]
条目为空与列表读不出来是不同的情况。
:::

:::example 同一列表的两种表示
[输入]
把第一项 PEM 解成 DER 字节，再以 DER Hex 读取
[结果]
同样读得签发者与 2A、2B 两条记录
[说明]
表示改变不影响实际列表或签名字节。
:::

## 未列出证书的判断
<!-- sources: x509, engine -->
若列表有效且范围适用，未列出某张证书才是吊销检查的部分依据。要判断某次用途是否可接受，需要同时检查签名、时限、适用签发者与是否涉及其他列表，如增量 CRL 或不同分区。

## 常见误区
- nextUpdate 与证书自身的有效期是不同字段。
- 吊销序列号要放在对应签发体系的范围里比较。
- 查看序列号不能代替对列表签名和新鲜度的验证。
