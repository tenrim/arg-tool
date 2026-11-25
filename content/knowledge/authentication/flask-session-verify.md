---
capabilityId: op:Flask%20Session%20Verify
title: 验证 Flask 会话
topicGroup: authentication
summary: 重算 Flask 签名 cookie 的认证值，区别签名结果与应用时效。
aliases:
  - Flask Session Verify
  - Flask 会话校验
  - ItsDangerous 验证
  - cookie 签名
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
    title: CyberChef 11.5.0 — FlaskSessionVerify
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/FlaskSessionVerify.mjs
    language: en
    kind: implementation
    locator: run()，原字符串的认证与时间报告
---

## 介绍
<!-- sources: flask, signer, engine -->

验证 Flask 签名会话检查 cookie 是否与应用秘密和签发规则相符。验证者以收到的编码字段为计算输入，重算认证值并对照末段。支持会话时效的服务还会独立判断签发时间离现在过去多久。

## 重算认证值
<!-- sources: signer, engine -->

以约定的盐和密钥派生方式得到用于该类 cookie 的派生密钥，然后对确切的载荷和时间字段计算 HMAC。解码为 JSON 再重新编码可能改变字符、空格或压缩形式，无法保证与原认证输入一致。错误的盐、密钥或摘要算法都会造成不匹配。

## 格式限制和使用窗口
<!-- sources: flask, safe, time, engine -->

固定验证入口只解析用两个句点分成三段的形式，压缩形式带有额外前导点，超出该入口的格式范围。验证通过时会显示校验成立和载荷，还可显示时间值。服务端 Flask 另可以在读取会话时提供最大可接受时长，诊断结果中的 valid 不能代替这个判断。

## 离线样例的校验路径
<!-- sources: flask, time, signer, engine -->

使用公开的笔记测试密钥 article-only-cookie-key，盐为 cookie-session。样例的固定时间是 1700000000。通过变动一项条件，可以区分认证不匹配与参考时效规则拒绝。

:::example 对照 SHA-1 认证值
[输入]
eyJub3RlIjoiTUlTVCJ9.ZVPxAA.Bai9CwDbMolxKEw7DKJ4TNY8UZ4
使用本节公开测试密钥与盐，算法选 SHA-1。
[结果]
valid 为 true，payload 为 {"note":"MIST"}，时间戳为 1700000000。
[说明]
认证输入的头两段未经改动，独立 HMAC 演算也与末段一致。
:::

:::example 改变摘要选择
[输入]
eyJub3RlIjoiTUlTVCJ9.ZVPxAA.IRfkcQk6o1mGdY4_xwQ0b0FX3wcZRvK648yhszSSebU
使用相同测试密钥与盐，分别选择 SHA-1 和 SHA-256。
[结果]
SHA-1 时报告签名不匹配，SHA-256 时通过。
[说明]
该样本生成时采用 SHA-256，第三段对应 32 字节认证值。
:::

:::example 有效认证与过期判断
[输入]
第一例的原 cookie。同一参考应用将当前时刻设为 1700003600，先检查最大时长 1800 秒，再比较最大时长 7200 秒。
[结果]
离线入口的认证检查通过。参考应用在 1800 秒规则下判为过期，在 7200 秒规则下接受样本。
[说明]
认证对应的载荷未改变，两个时效结果的差别来自 3600 秒的实际年龄。
:::

## 将结果与应用状态对应
<!-- sources: flask, time -->

实际应用可能有旧密钥回退、会话过期、撤销或独立的访问控制。单个 cookie 匹配某个密钥只能说明这份数据通过了所用的密码学校验。检查业务上的登录和授权时，仍要以应用当前使用的策略为依据。

## 常见误区

- 显示签发时间不等于工具已经执行时效限制。
- SHA-1 与 SHA-256 的签名不能互验，密钥和盐相同也不例外。
- 格式解析失败与 HMAC 不匹配表示不同阶段发现的问题。

