---
capabilityId: pair:To%20Decimal
title: 十进制字节
topicGroup: characters
summary: 说明十进制字节列表、无符号与二补码有符号值以及恢复原始字节的方法。
aliases:
  - To Decimal
  - From Decimal
  - 十进制字节数组
sources:
  - id: int
    title: Python Built-in Types — int.from_bytes
    publisher: Python Software Foundation
    url: https://docs.python.org/3/builtins/stdtypes.html#int.from_bytes
    language: en
    kind: official-doc
    locator: 字节序及有符号整数转换
  - id: ascii
    title: RFC 20 — ASCII Format for Network Interchange
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc20.txt
    language: en
    kind: standard
    locator: 第 2、3 节，字符表及八位字节中的表示
  - id: engine
    title: CyberChef 固定操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Decimal 与 From Decimal
---

## 介绍
<!-- sources: int, engine -->

十进制字节列表依次给出每个字节的数值。每一项只对应一个八位位模式。普通无符号表示从 0 起算到 255，列表中的其他标点一般只用于分隔各项。

## 无符号计数
<!-- sources: ascii, engine -->

一个字节的八位依次具有 128 到 1 的权值。权值相加得到 0 至 255。可见字符的原始字节还可以通过字符表查到对应的十进制值。

:::example 位模式范围的两端
[输入]
字节 00 7F 80 FF
[结果]
0 127 128 255
[说明]
7F 的低七位全为 1，80 只有最高位为 1。列表中的 127 和 128 是相邻的两个无符号值。
:::

## 二补码的有符号读法
<!-- sources: int, engine -->

在八位有符号二补码里，最高位具有 −128 的权值。也可以先按无符号读取，结果大于等于 128 时再减去 256。位模式本身不变，变化的是数值解释。

:::example 同一组字节的有符号读法
[输入]
字节 00 7F 80 FF
[结果]
0 127 -128 -1
[说明]
80 无符号时为 128，减 256 得 −128。FF 为 255，减 256 得 −1。
:::

## 从数字恢复字节
<!-- sources: int, engine -->

每一项都应落在所采用口径允许的范围内。按有符号二补码读取负值时加上 256 即得其无符号位模式，再写出一个字节。相邻数字要保留分组标记。

:::example 反向恢复位模式
[输入]
有符号十进制列表 0 127 -128 -1
[结果]
00 7F 80 FF
[说明]
−128+256=128 对应 80，−1+256=255 对应 FF。前两项直接读取。
:::

## 字节和值的层次
<!-- sources: int, ascii -->

十进制列表里的 65 可能是 ASCII 的 A，也可能是某个格式的版本号或普通数据项。还原字节只解决表示方式，解释内容还需要字符集或二进制格式。若要把整个序列当成一个整数，另外需要定义字节序与整数宽度。

## 常见误区

- 无符号单字节可到 255，有符号八位二补码只到 127。
- 一个有符号列表项 -1 仍对应一个字节 FF，不是两个独立字符。
- 65 66 是两个数值，不能直接拼成十进制整数 6566 来恢复字节。
