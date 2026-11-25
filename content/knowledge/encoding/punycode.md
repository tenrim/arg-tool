---
capabilityId: pair:To%20Punycode
title: Punycode
topicGroup: encoding
summary: 将 Unicode 字符串转换为 ASCII，并区分原始 Bootstring 与国际化域名标签。
aliases:
  - Punycode
  - IDN
  - xn--
  - 国际化域名
sources:
  - id: puny
    title: "RFC 3492: Punycode"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3492.html
    language: en
    kind: standard
    locator: 第 3、5、6 节 Bootstring、参数及编解码
  - id: idna
    title: "RFC 5891: Internationalized Domain Names in Applications"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc5891.html
    language: en
    kind: standard
    locator: 第 4.4 节 U-label 到 A-label
  - id: chef
    title: CyberChef 11.5.0 To Punycode / From Punycode
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Punycode / From Punycode 输入、输出及参数
---

## 介绍
<!-- sources: puny, idna -->
Punycode 是 Bootstring 算法的一套固定参数，将 Unicode 串可逆表示为 ASCII。国际化域名可以使用 Punycode 标签传输，但域名协议还负责前缀、字元限制和标签边界。

## 先记录基本字符
<!-- sources: puny, chef -->
原始算法把 ASCII 基本字符按原次序保留在前，并在这一段存在时附一个连字符。后续部分以变长整数编码非基本字符的码点与插入位置。编码器使用偏置调整，令常见差值可用较少数字表示。

:::example 德语城市名
[输入]
原始 Punycode，münchen
[结果]
mnchen-3ya
[说明]
ASCII 段为 mnchen；后面的 3ya 编入非 ASCII 字符 ü 及其位置。
:::

## 原始算法的可逆表示
<!-- sources: puny, chef -->
解码时先取最后一个分隔连字符前的基本段，再读取后续整数以恢复非基本字符的位置和字符值。若输入全为基本字符，原始形式中也可看到末尾的分隔连字符。

:::example 原始模式下的纯 ASCII
[输入]
abc
[结果]
abc-
[说明]
三个基本字符原样保留，追加原始算法的分隔符，后续没有非 ASCII 数据。
:::

## IDNA 标签与点号
<!-- sources: idna, puny, chef -->
作为域名使用时，对合适的非 ASCII 标签加上 xn-- 前缀，产生 A-label。域名的点分标签分别处理。全部由允许的 ASCII 构成的标签通常保持原样。

:::example 分标签转换
[输入]
以国际化域名方式编码 bücher.de
[结果]
xn--bcher-kva.de
[说明]
bücher 转成 bcher-kva 并加前缀，de 保持原样。
:::

:::example 解出一个带前缀标签
[输入]
国际化域名解码 xn--mnchen-3ya
[结果]
münchen
[说明]
识别 xn-- 后再按 Punycode 解其余部分，复原 ü 的位置。
:::

## 域名合法性与显示限制
<!-- sources: idna, puny -->
Punycode 编码可逆不意味着对应字符串被某注册局接纳。IDNA 还规定合法码点和标签校验，域名系统也限制标签长度。外观相近的不同字符要按其实际码点读取。

## 常见误区

- xn-- 是 A-label 的前缀，不是原始 Punycode 算法产出的字节。
- 域名需要逐标签处理。
- 编码成功不能说明域名已注册或已解析。
- 对全 ASCII 输入，原始模式和域名模式可能给出不同的拼写。
