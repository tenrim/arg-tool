---
capabilityId: op:Parse%20ASN.1%20hex%20string
title: 解析 ASN.1 十六进制
topicGroup: authentication
summary: 沿 ASN.1 编码的标签、长度和值展开嵌套结构，核对十六进制字面偏移。
aliases:
  - ASN.1
  - Parse ASN.1 hex string
  - DER 字段解析
  - TLV
sources:
  - id: types
    title: ITU-T X.680 ASN.1 Basic Notation
    publisher: ITU-T
    url: https://www.itu.int/rec/T-REC-X.680/en
    language: en
    kind: standard
    locator: 抽象语法、基本类型、OBJECT IDENTIFIER
  - id: rules
    title: ITU-T X.690 BER, CER and DER
    publisher: ITU-T
    url: https://www.itu.int/rec/T-REC-X.690/en
    language: en
    kind: standard
    locator: 第 8 节，标签、长度、内容及 OBJECT IDENTIFIER
  - id: engine
    title: CyberChef 11.5.0 公钥模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/PublicKey.js
    language: en
    kind: implementation
    locator: Parse ASN.1 hex string 调用 ASN1HEX.dump；清理 Hex、输入索引及预览长度
---

## 介绍
<!-- sources: types, rules -->
ASN.1 用来定义数据类型和结构；BER 和 DER 给出这些值的字节编码规则。证书、公钥及不同的协议记录可使用这种结构。一个 ASN.1 元素通常由标识、长度和内容相继组成。

## 标签和长度
<!-- sources: rules -->
标识字节记录标签类、编码是基本型还是构造型以及标签编号，编号较大时会占更多字节。长度的短形式可在一个字节内写 0～127。长形式的第一个字节指明后面有多少长度字节，接着才是实际内容。DER 使用定长形式并尽量使用短的合规表示。

## 从外层到内层
<!-- sources: types, rules, engine -->
构造型的内容里可保存其他 ASN.1 元素。应按外层的内容长度限制子项范围，再递归读取子项。解析器的起始索引在移除空白后的十六进制文本上计数，因此一个完整字节占两位索引。截短长 OCTET STRING 的显示只影响预览。

## 已知类型的样例
<!-- sources: rules, engine -->
以下输入中的空格只用于分组显示，不属于 ASN.1 数据。

:::example 一个正整数
[输入]
02 01 2A
[结果]
INTEGER 2a
[说明]
02 是 INTEGER，01 表示内容 1 字节，2A 是十进制 42。
:::

:::example 序列嵌套两个整数
[输入]
30 06 02 01 01 02 01 02
[结果]
SEQUENCE
  INTEGER 01
  INTEGER 02
[说明]
30 表示构造的 SEQUENCE，内容长 6 字节，刚好由两个各占 3 字节的 INTEGER 组成。
:::

:::example 直接查看第一个子元素
[输入]
同一序列，起始索引设置为 4
[结果]
INTEGER 01
[说明]
起始索引 4 对应从零数的第 2 字节，外层标签和长度各占一字节。
:::

## 树结构与协议含义
<!-- sources: types, rules, engine -->
通用解析树可以显示类型和不同层级的位置。上下文专用标签的含义还需对应 ASN.1 定义或协议说明。解析出层级并不能代替检查应用约束、签名、有效期或证书路径。

## 常见误区
- 长度字段计算内容字节，通常不包含自身和标签。
- 十六进制文本的索引 4 对应解码后从 0 起算的字节偏移 2。
- 结构能展开不表明上层协议已验证通过。
