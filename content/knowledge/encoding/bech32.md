---
capabilityId: pair:To%20Bech32
title: Bech32
topicGroup: encoding
summary: 读取由前缀、五位数据组和校验和组成的字符串，并区分 Bech32 与 Bech32m。
aliases:
  - Bech32
  - Bech32m
  - BIP173
  - BIP350
  - HRP
sources:
  - id: old
    title: "BIP 173: Base32 address format for native witness outputs"
    publisher: Pieter Wuille 与 Greg Maxwell
    url: https://bips.dev/173/
    language: en
    kind: author-spec
    locator: 字符集、HRP、polymod 与测试向量
  - id: new
    title: "BIP 350: Bech32m format for v1+ witness addresses"
    publisher: Pieter Wuille
    url: https://bips.dev/350/
    language: en
    kind: author-spec
    locator: 新校验常数和版本要求
  - id: chef
    title: CyberChef 11.5.0 To Bech32 / From Bech32
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Bech32 / From Bech32 输入、输出及参数
---

## 介绍
<!-- sources: old, new -->
Bech32 是带校验和的 Base32 表示。字符串由可读前缀、一个分隔字符 1、数据和校验和组成。Bech32m 保留同一总体结构，但改变校验常数。

## 前缀与数据字符
<!-- sources: old, chef -->
可读部分称为 HRP，其内容参与校验。分界由最后一个 1 确定，分隔符右侧的字符来自专用的 32 字符表。转换字节载荷时按 5 位重新分组，不足一个组可补零，再由相应格式规定如何检查余位。

:::example 前缀 A、无数据
[输入]
HRP 为 a，通用 Bech32，空数据
[结果]
a12uel5l
[说明]
前缀 a 和分界 1 之后只有六个校验字符，这条是 BIP 173 的全大写向量 A12UEL5L 的小写形式。
:::

## 校验和区分两种格式
<!-- sources: old, new -->
polymod 对展开后的前缀、数据和校验组计算值。Bech32 使用常数 1，Bech32m 使用十六进制 2bc830a3。同一载荷和前缀经两种规则会出现同样的数据段、不同的校验尾部。

:::example 同一字节的两种尾部
[输入]
HRP 为 a，字节 FF；分别采用通用 Bech32 和 Bech32m
[结果]
a1lu9cgf6y
a1lusyc9lx
[说明]
FF 的八个 1 分组为 11111 和 11100，转成 lu。最后六个字符分别来自两套校验规则。
:::

## 大小写与前缀的影响
<!-- sources: old, new, chef -->
整个字符串可以用全大写或全小写，不能混合。前缀具有业务含义且参与校验，修改时应重新编码。数据部分最后六字符用于校验，不能直接当成业务数据。

:::example 空载荷采用 Bech32m
[输入]
HRP 为 a，通用 Bech32m，空数据
[结果]
a1lqfn3a
[说明]
与同样为空的 Bech32 相比，六个校验字符整体变化。
:::

## 通用字符串与见证地址
<!-- sources: old, new, chef -->
Bitcoin 见证地址还约定网络前缀、见证版本和程序长度。BIP 350 规定版本 0 用 Bech32，版本 1 至 16 用 Bech32m。通过通用校验的字符串仍需验证这些地址条件才可解释为地址。

## 常见误区

- 不是任意一个 1 都是分隔位置。
- 全小写和全大写可以同值，混合大小写通常无效。
- 校验和不能证明身份或资产归属。
- 通用解码结果与满足协议要求的有效地址是两层验证。
