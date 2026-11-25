---
capabilityId: op:Flask%20Session%20Sign
title: 签署 Flask 会话
topicGroup: authentication
summary: 对 UTF-8 载荷和签发时刻计算兼容 Flask 默认会话格式的认证值。
aliases:
  - Flask Session Sign
  - Flask 签名会话
  - ItsDangerous HMAC
  - 会话盐
sources:
  - id: flask
    title: Flask 3.1.2 — SecureCookieSessionInterface
    publisher: Pallets
    url: https://github.com/pallets/flask/blob/3.1.2/src/flask/sessions.py
    language: en
    kind: implementation
    locator: SecureCookieSessionInterface，序列化、摘要、盐及打开会话的超时
  - id: safe
    title: ItsDangerous 2.2.0 — URL Safe Serialization
    publisher: Pallets
    url: https://github.com/pallets/itsdangerous/blob/2.2.0/src/itsdangerous/url_safe.py
    language: en
    kind: implementation
    locator: URLSafeSerializerMixin，Base64URL 编码与可选 zlib 压缩
  - id: time
    title: ItsDangerous — Signing With Timestamps
    publisher: Pallets
    url: https://itsdangerous.palletsprojects.com/en/stable/timed/
    language: en
    kind: official-doc
    locator: TimestampSigner，UTC 与 max_age
  - id: signer
    title: ItsDangerous 2.2.0 — Signer
    publisher: Pallets
    url: https://github.com/pallets/itsdangerous/blob/2.2.0/src/itsdangerous/signer.py
    language: en
    kind: implementation
    locator: derive_key() 与 get_signature()
  - id: engine
    title: CyberChef 11.5.0 — FlaskSessionSign
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/FlaskSessionSign.mjs
    language: en
    kind: implementation
    locator: run()，当前时间、派生密钥和认证值
---

## 介绍
<!-- sources: flask, safe, time -->

Flask 的默认 cookie 会话使用 URL 安全的带时间序列化器和基于秘密的认证。签署过程把应用选定的数据、签发时刻和认证值组合为 cookie 文本。本章计算的是自己创建的笔记样本，可用于理解默认会话结构。

## 派生密钥及认证输入
<!-- sources: flask, signer, engine -->

先将应用秘密和用于该类数据的盐按约定编码为字节。Flask 的默认会话配置使用 cookie-session 作为盐，HMAC 派生法以应用秘密为密钥、该盐为消息，输出派生密钥。再对已编码的载荷、句点和已编码的时间组成的字节串做 HMAC，所得值是第三段的内容。

## 时间、编码与压缩方式
<!-- sources: flask, safe, time, engine -->

固定入口将 JSON 序列化为 UTF-8，写入当前时间的秒数并计算认证，时间变化会改变后两段。它写出未压缩的载荷。ItsDangerous 的参考序列化器可以使用可选压缩，认证输入包括该实现产生的压缩标记和字节文本。

## 固定时间复算和真实生成
<!-- sources: safe, time, signer, engine -->

前两个实例固定参考序列化器的时钟进行逐字节核对。工具直接签署会使用实际执行时间，得到的第三段因此可能不同。所有密钥均为本文公开的测试数据。

:::example HMAC-SHA1 认证值
[输入]
{"note":"MIST"}，固定签发时间 1700000000，UTF-8 密钥 article-only-cookie-key，盐 cookie-session，HMAC-SHA1。
[结果]
eyJub3RlIjoiTUlTVCJ9.ZVPxAA.Bai9CwDbMolxKEw7DKJ4TNY8UZ4
[说明]
头两段为 eyJub3RlIjoiTUlTVCJ9.ZVPxAA。最后一段解码得到 20 字节。
:::

:::example 改为 HMAC-SHA256
[输入]
保持第一例的固定时间、载荷、测试密钥和盐，摘要改用 SHA-256。
[结果]
eyJub3RlIjoiTUlTVCJ9.ZVPxAA.IRfkcQk6o1mGdY4_xwQ0b0FX3wcZRvK648yhszSSebU
[说明]
这次也用 SHA-256 计算派生密钥。第三段还原后长 32 字节。
:::

:::example 载荷长度和压缩
[输入]
note 的值为连续 200 个 A，使用同一测试密钥和盐，由工具签署。
[结果]
工具输出的第一段是原始 JSON 的 Base64URL，签名可由采用相同配置的 Flask 序列化器验证。参考序列化器直接对此输入签发时，可输出带前导点的压缩载荷。
[说明]
认证值绑定生成时的具体载荷表示。即使反序列化后得到同样的 note，两种结构的签名输入仍不同。
:::

## 与应用约定的关系
<!-- sources: flask, signer, engine -->

盐区分不同签署用途，完整的应用秘密由所属应用专门管理。签署功能可以帮助检查应用拥有的测试数据如何编码，业务中的会话是否生效还依赖应用的配置与规则。应用也可自定义摘要、密钥轮换或改用其他会话接口。

## 常见误区

- 盐用于隔离用途，实际的认证秘密仍需独立保护。
- 同一载荷在不同时刻签署，认证值通常会随时间而变。
- 签署不会对 JSON 字段进行加密。

