---
capabilityId: pair:Hex%20to%20Object%20Identifier
title: OID / 十六进制
topicGroup: authentication
summary: 在对象标识符的点分数字弧与 ASN.1 值字节之间换算，区分 OID 内容和完整 TLV。
aliases:
  - Object Identifier to Hex
  - Hex to Object Identifier
  - OID 编解码
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
    locator: 两个方向调用 ASN1Util.oidHexToInt / oidIntToHex；输入输出仅值字节
---

## 介绍
<!-- sources: types, rules -->
对象标识符 OID 用点分整数记录一棵登记树的路径，例如 2.5.4.3。每个整数组成一条弧。它可以指代算法、证书属性或其他注册对象，具体对象由登记和标准定义。

## 合并首两弧
<!-- sources: types, rules -->
ASN.1 编码首先将前两弧 a、b 合成 40a＋b。首弧限定为 0、1 或 2；前两种情况下第二弧至多 39。合成结果和其余弧统一以 base-128 编码，值较大时可占多个字节。

## 七位数字与继续位
<!-- sources: rules, engine -->
每字节的低七位存一位 base-128 数字，从高到低排列。该弧尚未结束时置最高位为 1，末字节最高位写 0。当前方向对只传递 OID 的内容字节，完整 ASN.1 OID 还需标签 06 和长度字段。

## 按字节验算
<!-- sources: types, rules, engine -->
前面三项可在当前实现中双向转换。最后一项核对首两弧合成值超过一个字节时的限制。

:::example 证书常用短标识
[输入]
2.5.4.3
[结果]
55 04 03
[说明]
2×40＋5=85，即 55。后两弧 4、3 各占一个字节。包成 ASN.1 元素后是 06 03 55 04 03。
:::

:::example 含较大的后续弧
[输入]
1.2.840.113549.1.1.1
[结果]
2A 86 48 86 F7 0D 01 01 01
[说明]
首值是 42，840=6×128＋72，拆成 86 48；113549 拆为带续位的三个字节。
:::

:::example 127 与 128 的边界
[输入]
1.2.127.128
[结果]
2A 7F 81 00
[说明]
127 一字节即可，128=1×128＋0，写两个字节 81 00。
:::

:::example 首两弧合并后也可占两字节
[输入]
2.999.3
[结果]
按 X.690 应为 88 37 03；当前转换输出 43703
[说明]
1079=8×128＋55，须写成 88 37。当前运算未对首个合并值正确执行变长编码，不能用其结果写此类 OID。
:::

## 从值追到登记对象
<!-- sources: types, rules, engine -->
值区和完整 TLV 应先分开。若把 06 03 当成值的一部分，解码会把它们当作额外的弧。读出点分数字后，还应对照标准或登记条目确认其放在当前协议字段中的含义。

## 常见误区
- OID 的字节写法不等于点分文本的 ASCII 十六进制。
- 第一个合并值也可能需要使用多个 base-128 字节。
- OID 内容、TLV 标签和长度分别属于不同部分。
