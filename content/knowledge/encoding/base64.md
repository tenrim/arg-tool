---
capabilityId: pair:To%20Base64
title: Base64
topicGroup: encoding
summary: 从三字节到四符号的位分组，解释尾组填充、规范编码与 URL 安全变体。
aliases:
  - To Base64
  - From Base64
  - Base64URL
sources:
  - id: rfc
    title: RFC 4648 — Base16、Base32 与 Base64 数据编码
    publisher: IETF（南京大学镜像）
    url: https://mirrors.nju.edu.cn/rfc/rfc4648.html
    language: en
    kind: standard
    locator: 第 3–10 节
  - id: python
    title: Python base64 文档
    publisher: Python Software Foundation
    url: https://docs.python.org/3/library/base64.html
    language: en
    kind: official-doc
    locator: 对应编码函数及变体
  - id: mdn
    title: Base64 术语说明
    publisher: MDN Web Docs
    url: https://developer.mozilla.org/zh-CN/docs/Glossary/Base64
    language: zh-CN
    kind: official-doc
    locator: 编码大小与填充
  - id: engine
    title: CyberChef 随站操作目录
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Base64 与 From Base64
---

## 介绍
<!-- sources: rfc, mdn -->

Base64 把任意字节序列写成 ASCII 字符。标准字母表依次排列 A–Z、a–z、0–9、+ 和 /。这 64 个符号各容纳 6 位，完整的三字节组变成四个字符，结果长度约为原字节数的 4/3。

Base64 是数据的外层表示。字节可以来自文本、图片或压缩数据；识别内层类型需要检查解码后的字节。

## 六位分组
<!-- sources: rfc, python -->

依次连接三个字节的 24 位，高位在前，每 6 位取一个数，按数值从 0 开始查表。解码时按顺序连回六位组，再切成八位字节。

:::example 三字节手算
[输入]
ARG，字节为 41 52 47
[结果]
010000 010101 001001 000111
索引 16、21、9、7 → QVJH
[说明]
字节 41 的最高六位给出索引 16。余下的 18 位依次参与后面的索引，分组可以跨越字节边界。
:::

## 尾组和规范位
<!-- sources: rfc, mdn -->

最后只剩一个字节时，第二个索引以四个零补齐，随后添加两个等号。剩两个字节时，第三个索引以两个零补齐，随后添加一个等号。等号只交代尾组形状。规范编码要求未使用的低位为零，才能让同一串字节有唯一写法。

:::example 一字节与两字节的尾组
[输入]
A（41）与 AB（41 42）
[结果]
A → QQ==
AB → QUI=
[说明]
A 的第二个索引是 010000。AB 的第三个索引是 001000。用等号补齐字符数以后，两种编码各占四个字符。
:::

## URL 安全字母表
<!-- sources: rfc, python, engine -->

Base64URL 把索引 62 和 63 写成 - 与 _，方便将结果放进受限的路径或标识符。是否省略等号由外层协议决定。若已知采用无填充形式，非空文本的长度模 4 可以是 0、2 或 3。

:::example 相同字节的两种写法
[输入]
十六进制字节 FB FF
[结果]
标准 Base64：+/8=
无填充 Base64URL：-_8
[说明]
前三个索引是 62、63、60。前两个符号随字母表变化，末尾等号随协议约定保留或省略。
:::

## 解码结果的判读
<!-- sources: rfc, mdn, engine -->

字母范围与长度可用来排除不相容的编码，但许多普通文本也只由这些符号组成。解码后需要检查文件头、文本编码或协议结构。宽松解码器可能跳过外层换行或非字母字符，严格协议则会拒绝不合规输入。

## 常见误区

- Base64 的输入单位是字节。UTF-8 和 UTF-16 表示同一段文字时，编码结果可能不同。
- 把片段随意截成四字符组会改变位的对齐。只有从正确边界出发才可按完整量子还原。
- 规范编码的尾部补位为零。肉眼看到相同的可解码结果并不能证明两种输入写法都符合协议。
