---
capabilityId: op:Fletcher-32%20Checksum
title: Fletcher-32校验和
topicGroup: file-compression
summary: 以小端 16 位字为累加单位，使用模 65535 的双累加得到 32 位校验。
aliases:
  - Fletcher-32 Checksum
  - 16 位输入字
  - 模 65535
sources:
  - id: rfc
    title: RFC 1146 TCP Alternate Checksum Options
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc1146
    language: en
    kind: standard
    locator: 附录 I、II，双累加形式及词宽
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Fletcher-32 Checksum：小端读字、奇数个字节的末尾与模 65535
---

## 介绍
<!-- sources: rfc, engine -->
Fletcher-32 用两个各占 16 位的累加值生成结果。先把输入分成若干 16 位字，再用每个字的数值进行两次累加。选择字节顺序会影响每个输入值。

## 输入字的顺序
<!-- sources: rfc, engine -->
当前实现每两个字节按小端解释。例如 01 02 对应 0201。如果末尾只剩一个字节，这个字节直接作为低位输入，等价于在尾端补上 00 之后再组成小端字。

## 双累加和结果拼接
<!-- sources: rfc, engine -->
对每个字 W，A=(A＋W) mod 65535，B=(B＋A) mod 65535。A、B 初值为 0。合成时 B 在高 16 位，A 在低 16 位，输出八个十六进制字符。

## 组宽与末尾例子
<!-- sources: rfc, engine -->
样例用小端 16 位字处理。输出按正常从高到低的十六进制写法展示。

:::example 四个输入字
[输入]
01 02 03 04 05 06 07 08
[结果]
281e1410
[说明]
依次累加 0201、0403、0605、0807，最后 A=1410、B=281E（十六进制）。
:::

:::example 第一组后留一个字节
[输入]
01 00 02
[结果]
00040003
[说明]
先计 W=1，再计尾部 W=2；前缀和为 1、3，合为 4。
:::

:::example 输入字刚好等于模数
[输入]
FF FF FF FF
[结果]
00000000
[说明]
FFFF 两次分别等于 65535，A 和 B 取模后都为零。
:::

## 与其他实现对读
<!-- sources: rfc, engine -->
有些规范对成组、端序或尾部填充有专门规定。已有校验字段时，应先确认对方按相同方式组成输入字，再看高低输出半部如何储存。只对照名称只有在配置一致时有意义。

## 常见误区
- 输入按 16 位字累计，输出是两个结果合成 32 位。
- 末尾的单字节仍参与计算。
- 小端是这里读取输入字的顺序，十六进制结果按高低半部显示。
