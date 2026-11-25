---
capabilityId: op:Generate%20HOTP
title: 生成 HOTP 动态密码
topicGroup: authentication
summary: 用共享密钥和递增计数器导出定长口令，说明动态截断和同步。
aliases:
  - Generate HOTP
  - HMAC 动态口令
  - 计数器一次性密码
sources:
  - id: hotp
    title: "RFC 4226 HOTP: An HMAC-Based One-Time Password Algorithm"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4226
    language: en
    kind: standard
    locator: 第 5 节算法、附录 D 测试向量
  - id: base
    title: RFC 4648 Base-N Encodings
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4648
    language: en
    kind: standard
    locator: 第 6 节 Base32 字母表
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Generate HOTP 的 Base32 输入、HMAC-SHA-1、计数与 otpauth URI
---

## 介绍
<!-- sources: hotp, engine -->
HOTP 用密钥 K 和计数器 C 生成一串短数字。如果生成端和校验端对计数一致，就可以各自计算并对照口令。下一个事件可以让计数器向前推进，令结果随之变化。

## 密钥与计数器
<!-- sources: hotp, base, engine -->
密钥是共享字节串，Base32 是它的一种文字写法。先将 Base32 解为字节，再对以 8 字节大端表示的计数器计算 HMAC-SHA-1。相同密钥及计数器总有相同的摘要。标识标签不进入这项计算。

## 动态截断
<!-- sources: hotp -->
取摘要最后一个字节的最低四位当作偏移，从所指位置读四个相邻字节。按大端构成 32 位数，清除最高位得到 31 位整数 p。d 位口令为 p 对 10ᵈ 取余，再在左边补零到 d 位。

## 公开向量中的三个计数值
<!-- sources: hotp, base, engine -->
以下仅用 RFC 的公开测试密钥 12345678901234567890，其 Base32 形式为 GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ。输出长度统一为六位。

:::example 计数器 0
[输入]
公开测试密钥，计数器 0
[结果]
755224
[说明]
8 个计数字节全为 00。动态截断后 p 为 1284755224，取余为 755224。
:::

:::example 计数器 1
[输入]
公开测试密钥，计数器 1
[结果]
287082
[说明]
计数器低字节改为 01，密钥保持原样。
:::

:::example 计数器 9
[输入]
公开测试密钥，计数器 9
[结果]
520489
[说明]
这是附录 D 的第 10 个六位结果，因为向量从计数 0 开始。
:::

## 同步与输出中的密钥
<!-- sources: hotp, engine -->
改变计数器才会改变 HOTP 输入。同一计数可重算，校验端如何推进以及接受多少相邻计数由系统策略规定。用于配置的 URI 包含共享密钥，传阅时需要像对待密钥一样保护它。

## 常见误区
- HOTP 的变化量是计数器，等待半分钟不自动换码。
- Base32 文本须先解成密钥字节。
- 前导零属于定长口令，应保留。
