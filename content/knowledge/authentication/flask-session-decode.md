---
capabilityId: op:Flask%20Session%20Decode
title: 解码 Flask 会话
topicGroup: authentication
summary: 读取默认 Flask 签名 cookie 的载荷和时间字段，识别压缩前缀。
aliases:
  - Flask Session Decode
  - Flask cookie 解码
  - ItsDangerous 载荷
  - 会话时间戳
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
  - id: engine
    title: CyberChef 11.5.0 — FlaskSessionDecode
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/FlaskSessionDecode.mjs
    language: en
    kind: implementation
    locator: run()，三段拆分与四字节时间转换
---

## 介绍
<!-- sources: flask, safe -->

Flask 的默认客户端会话实现使用签名 cookie 保存经过序列化的会话内容。浏览器会带着 cookie 访问应用。载荷可以编码或压缩，默认的签名结构仍允许识别原字段。使用其他会话后端的 Flask 应用不一定采用同样的 cookie 结构。

## 载荷、时间与认证段
<!-- sources: flask, safe, time -->

普通样本用两处句点分为载荷、签发时间和认证段。载荷经 Base64URL 解码可得到 JSON 字节。时间一段也用 Base64URL 表示整数，签发时刻以 UTC 解释。第三段是用于验证的认证值，直接阅读前两段时并没有对这段认证值验算。

## 压缩标志与变长时间
<!-- sources: safe, time, engine -->

ItsDangerous 会在压缩确实能缩短载荷时加一个前导点，并把 zlib 字节编码到第一段有效内容中。这种情况下简单按点计数会出现一个起始空段。固定解码器只接受三个分段。它也按四字节有符号大端整数读取时间，无法正确解释所有长度的合法时间字段。

## 样例的载荷和时刻
<!-- sources: safe, time, engine -->

以下 cookie 是离线生成的笔记样本。第一个同时演示载荷与时间，第二个用固定早期时间区分变长编码，第三个描述真实的压缩载荷。

:::example 可读的两部分
[输入]
eyJub3RlIjoiTUlTVCJ9.ZVPxAA.Bai9CwDbMolxKEw7DKJ4TNY8UZ4
[结果]
载荷 {"note":"MIST"}，时间戳 1700000000。
[说明]
ZVPxAA 解码为 65 53 F1 00，大端数对应 2023-11-14 22:13:20 UTC。
:::

:::example 三字节时间字段
[输入]
eyJub3RlIjoiTUlTVCJ9.AVGA.qQjLgYUuL7HBZY6aYXyfeIGGKa0
[结果]
载荷仍为 {"note":"MIST"}。参考实现给出的时间是 86400，固定解码器显示 22118400。
[说明]
AVGA 解码得到 01 51 80。固定实现把缺少的末字节当作 00，形成 01 51 80 00。
:::

:::example 前导点标记压缩
[输入]
.eJyrVsrLL0lVslJyHCZAqRYAoK82OQ.ZVPxAA.RuCBSuQEECfEh2t4yO19XpR9nxE
[结果]
按 ItsDangerous 规则解码并展开，内容为 note 字段取值 A 连续 200 次。固定解码入口报告格式不支持。
[说明]
先识别最开头的点，下一段 Base64URL 解码后用 zlib 展开。压缩标志不属于 JSON。
:::

## 可读内容的证据范围
<!-- sources: flask, safe, time -->

仅用解码获得的时间和字段属于原 cookie 携带的信息，尚未经认证。分析应用自有测试材料时，应分别记录载荷形式、可读字段、签发时间和验证的状态。时效还需要应用规定的时间窗口。

## 常见误区

- 解码出 JSON 不表示会话在应用中仍有效。
- 压缩会话最前面的点是压缩标志，并不表示没有载荷。
- 数字时间要按字节解释，不能直接取 Base64URL 字符串当作十进制数。

