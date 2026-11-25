---
capabilityId: op:Parse%20CSR
title: 解析证书签名请求
topicGroup: authentication
summary: 读取 PKCS #10 请求的主体、公钥、签名和请求扩展，区分请求内容与签发结果。
aliases:
  - Parse CSR
  - PKCS#10 请求
  - 证书签名申请
sources:
  - id: csr
    title: RFC 2986 PKCS #10 Certification Request Syntax
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc2986
    language: en
    kind: standard
    locator: 第 4 节，认证请求信息与签名
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
    locator: Parse CSR：读取 CERTIFICATE REQUEST 的 Subject、公钥、签名和请求扩展
---

## 介绍
<!-- sources: csr, pem -->
PKCS #10 证书签名请求让申请方提交主体名、公钥和可选属性。申请方用对应私钥签名请求信息。签发机构可以核验请求，但还要自己的身份核查及签发流程。

## 请求信息与签名外层
<!-- sources: csr -->
CertificationRequestInfo 包含版本、主体名、SubjectPublicKeyInfo 和属性。外层再附上签名算法和签名值。签名使接收端能检查请求信息是否完整，以及签名和其中相应公钥的关系。

## 请求扩展与证书扩展
<!-- sources: csr, pem, engine -->
扩展请求可包含希望放进最终证书的 DNS 名等内容。查看工具把这些属性与公钥及签名分别列出。是否采纳以及怎样写入最终证书，由签发者依其策略处理。

## 本地请求样本
<!-- sources: csr, pem, engine -->
可用同一 RSA 公钥创建不同请求，分别观察主体与请求扩展。

:::example 含 DNS 扩展的请求
[输入]
主体 request.example，公钥 RSA，请求 SAN DNS:request.example 的 PEM
[结果]
主体、RSA 公钥和 SHA256withRSA 签名分开显示；请求扩展列出 DNS:request.example
[说明]
DNS 名来自请求属性，而不是已经签发的证书。
:::

:::example 属性为空的请求
[输入]
主体 bare.example，RSA 公钥，空 attributes 的 PEM
[结果]
仍显示主体、公钥和签名，没有 DNS 请求条目
[说明]
请求信息可以携带空属性集合。
:::

:::example 误将证书用于请求解析
[输入]
给出带 CERTIFICATE 边界的合成 X.509 证书
[结果]
提示输入不是合适的 PEM 请求
[说明]
两类数据可用相似的 Base64 文字封装，但标签及内部结构不同。
:::

## 验证申请材料
<!-- sources: csr, engine -->
打印出的签名字段可以记录所用算法。若要验证签名，还要用请求内公钥对原始请求信息验证。机构出具的最终证书需另读其签发者、有效期和实际扩展。

## 常见误区
- CSR 表述申请内容，不是已经签发的证书。
- 请求公钥是公开字段，签名使用的私钥在申请方保留。
- 解析签名字段与验证签名是两件事。
