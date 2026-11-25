---
capabilityId: op:NT%20Hash
title: NT 哈希
topicGroup: file-compression
summary: 说明 NT 哈希的 UTF-16LE 编码和 MD4 运算，辨别旧摘要与网络认证字段。
aliases:
  - NT Hash
  - NTOWFv1
  - UTF-16LE MD4
sources:
  - id: spec
    title: MS-NLMP NTLM v1 Authentication
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/464551a8-9fc4-428e-b3d3-bc5bfb2e73a5
    language: en
    kind: author-spec
    locator: 第 3.3.1 节 LMOWFv1 和 NTOWFv1
  - id: docs
    title: Passwords technical overview
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/windows-server/security/kerberos/passwords-technical-overview
    language: en
    kind: official-doc
    locator: LM 与 NT 摘要的定义、旧服务兼容和无盐性质
  - id: md4
    title: RFC 1320 The MD4 Message-Digest Algorithm
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc1320.txt
    language: en
    kind: author-spec
    locator: 算法与空消息测试向量
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: NT Hash
---

## 介绍
<!-- sources: spec, docs -->

NT 哈希是 Windows 旧式身份认证相关的确定性摘要。常见计算把文本编码为 UTF-16LE 字节，再对实际字节做 MD4。结果为 16 字节。NTLM 文档的认证部分还规定了响应字段的其他步骤。

## 字符如何变成字节
<!-- sources: spec, md4 -->

UTF-16LE 按低字节在前存放每个 16 位代码单元，通常不加字节序标记。普通 ASCII 文本的字节序列中会出现高字节零，但这些零是编码的一部分，MD4 计算时不能丢掉。

:::example 以三个 ASCII 字符演算
[输入]
abc
[结果]
E0FBA38268D0EC66EF1CB452D5885E53
[说明]
输入摘要算法的六个字节是 61 00 62 00 63 00。
:::

## 大小写保留
<!-- sources: spec, engine -->

NT 摘要对输入运行 Unicode 编码和 MD4，不先把字母统一为大写。只要编码后的字节改变，计算输入就改变。这个特点有助于用公开样例区分它与 LM 哈希。

:::example 大小写样例比较
[输入]
password 与 Password，均为公开演算文本。
[结果]
8846F7EAEE8FB117AD06BDD830B7586C
A4F49C406510BDCAB6824EE7C30FD852
[说明]
前者首代码单元为 0070，后者为 0050。
:::

## 非 ASCII 与空消息
<!-- sources: spec, md4, engine -->

非 ASCII 输入同样按 UTF-16LE 编码，不能按 UTF-8 或本地传统代码页直接替换。空字符串编码后则是零个字节，结果可以和 RFC 中 MD4 的空消息向量核对。

:::example 带重音的单字符
[输入]
é，单个预组字母 U+00E9。
[结果]
E77286D072C7858E9110CC3A011D2AC8
[说明]
编码后为 E9 00。若换成字母 e 与组合重音两个代码点，输入字节与该样例不同。
:::

## 认证材料的边界
<!-- sources: spec, docs -->

NT 哈希不带随机盐，原样文相同便得到同一摘要。网络上的认证响应还取决于协议版本和质询，其字段不是这里的摘要。公开测试字符串只用于核对兼容格式与编码。

## 常见误区

- 通常的 NT 哈希处理 UTF-16LE 字节，直接对 UTF-8 做 MD4 会得到不同值。
- 输入的大小写与 Unicode 分解形式属于原始内容。
- NTLM 认证响应需要额外协议字段，不能按 NT 摘要直接解释。
