---
capabilityId: op:MIME%20Decoding
title: MIME 邮件头
topicGroup: encoding
summary: 逐个读取 RFC 2047 编码词中的字符集、B 或 Q 编码及字节内容。
aliases:
  - MIME header
  - RFC2047
  - encoded-word
  - 邮件头
sources:
  - id: word
    title: "RFC 2047: Message Header Extensions for Non-ASCII Text"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc2047.html
    language: en
    kind: standard
    locator: 第 2、4、6 节 encoded-word、B 和 Q、展示规则
  - id: body
    title: "RFC 2045: Format of Internet Message Bodies"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc2045.html
    language: en
    kind: standard
    locator: 第 6 节正文传输编码
  - id: chef
    title: CyberChef 11.5.0 MIME Decoding
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: MIME Decoding 输入、输出及参数
---

## 介绍
<!-- sources: word, chef -->
RFC 2047 允许部分传统邮件头字段用 ASCII 组成的编码词表示非 ASCII 内容。结构形如 =?charset?encoding?encoded-text?=。解码后的文字仍处在原邮件头的相应语法位置。

## 先解 B 或 Q，再解字符集
<!-- sources: word, chef -->
B 使用 Base64 表示待恢复的字节。Q 采用类似 Quoted-Printable 的可见转义；等号后两位十六进制可表示一个字节。取得字节后，再按首段命名的字符集识读。

:::example B 表示的短词
[输入]
=?UTF-8?B?QVJH?=
[结果]
ARG
[说明]
QVJH 还原为十六进制 41 52 47，在 UTF-8 中就是 ARG。
:::

:::example Q 表示的邮件主题
[输入]
Subject: =?UTF-8?Q?caf=C3=A9?=
[结果]
Subject: café
[说明]
Q 还原 C3 A9，按 UTF-8 作为一个带重音的字符读取，周围字段名保留。
:::

## Q 中的下划线
<!-- sources: word, body, chef -->
在 Q 编码词中未转义的下划线表示空格。若确实要装入下划线自身，用 =5F 表示。正文传输用的 Quoted-Printable 按不同规则解释普通下划线。

:::example 一个空格
[输入]
=?UTF-8?Q?two_words?=
[结果]
two words
[说明]
下划线按 Q 规则转换为空白。
:::

## 编码词之间的折叠空白
<!-- sources: word, chef -->
相邻合法编码词之间用于分隔的线性空白，在显示规则中可能被去掉；要真的在文字中留下空格，就将空格编码到词内。普通明文和编码词之间的分隔要按字段语法解释。

:::example 相邻编码词连读
[输入]
=?UTF-8?Q?A?= =?UTF-8?Q?B?=
[结果]
AB
[说明]
两段之间的空白是用于拆分编码词的外层间隔，不进入解码后正文。
:::

## 邮件头的适用位置
<!-- sources: word, body -->
RFC 2047 规定编码词只能用在允许的位置。附件内容、正文传输编码和地址语法有独立规则，不能用一次邮件头解码替代解析整封邮件。

## 常见误区

- Q 的下划线规则不同于正文 QP。
- Base64 只还原到字节，字符集负责文字显示。
- 并非所有邮件头字段的任意位置都能放编码词。
- 解码邮件头不能推断发件人身份是否真实。
