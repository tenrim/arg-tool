---
capabilityId: pair:To%20Quoted%20Printable
title: Quoted-Printable
topicGroup: encoding
summary: 保留常见可打印字节，以等号十六进制和软折行表示其他字节。
aliases:
  - Quoted Printable
  - QP
  - 可打印编码
sources:
  - id: mime
    title: "RFC 2045: Format of Internet Message Bodies"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc2045.html
    language: en
    kind: standard
    locator: 第 6.7 节 Quoted-Printable Content-Transfer-Encoding
  - id: chef
    title: CyberChef 11.5.0 To Quoted Printable / From Quoted Printable
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Quoted Printable / From Quoted Printable 输入、输出及参数
  - id: words
    title: "RFC 2047: Message Header Extensions for Non-ASCII Text"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc2047.html
    language: en
    kind: standard
    locator: 第 4.2 节 编码词的 Q 方式
---

## 介绍
<!-- sources: mime, chef -->
Quoted-Printable 常用于可读 ASCII 字节较多的邮件正文。它对一部分字节原样表示，将其余字节转换成等号与两位十六进制。字符集仍由消息其他字段说明。

## 从一个字节写成等号两位
<!-- sources: mime, chef -->
不能原样传送的字节可写成 =HH。等号本身是转义记号，原字节 3D 要写成 =3D。十六进制编码按原字节转换，不直接采用 Unicode 码位。

:::example 转义字面等号
[输入]
A=B
[结果]
A=3DB
[说明]
A 和 B 原样保留，等号字节转换为 =3D。
:::

## 先约定字符集再转义
<!-- sources: mime, chef -->
非 ASCII 文本先编码成字节。同一个字符在 Latin-1 中可能占一字节，在 UTF-8 中占多字节。解码先还原字节，再用邮件指定的 charset 识读。

:::example UTF-8 的 é
[输入]
caf=C3=A9
[结果]
字节 63 61 66 C3 A9，按 UTF-8 读作 café
[说明]
C3 和 A9 合起来组成一个 Unicode 字符，两个转义都要保留。
:::

## 软折行与行尾空白
<!-- sources: mime, chef -->
标准编码行的长度最多 76 个字符，换行符不计。若需要折行而不在解码后的正文中插入换行，就在编码行末加 = 作为软折行。原来在行尾的空格和制表符应使用转义，避免传输时被删去。

:::example 还原跨行的一段文字
[输入]
AB=
CD
[结果]
ABCD
[说明]
将等号和紧随的邮件行结束组合识别为软折行。
:::

## 与 RFC 2047 的 Q 写法
<!-- sources: mime, words -->
邮件正文 QP 与邮件头的 encoded-word 使用不同的结构。比如正文中普通下划线通常表示下划线，邮件头的 Q 规则可以用下划线表示空格。看到 =HH 时仍应先识别材料所在的层次。

## 常见误区

- 扫到等号不一定表示后面有字节，也可能是软折行。
- 解出的字节必须按正确字符集读取。
- 不能把正文的每个下划线都当空格。
- Quoted-Printable 是编码，没有密钥。
