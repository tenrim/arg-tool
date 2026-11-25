---
capabilityId: op:Fletcher-64%20Checksum
title: Fletcher-64校验和
topicGroup: file-compression
summary: 以小端 32 位分组累计两个模 2³²−1 的和，并保留部分末组。
aliases:
  - Fletcher-64 Checksum
  - 32 位输入字
  - 64 位双累加
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
    locator: Fletcher-64 Checksum：小端四字节、末组 1 至 3 字节、两个无符号半部
---

## 介绍
<!-- sources: rfc, engine -->
Fletcher-64 将每四个字节作为一个输入值，计算两个 32 位的余数并合成 64 位校验。较宽的输出域和成组宽度改变结果范围，检查时仍需确认同一版本和规则。

## 四字节与不足四字节
<!-- sources: engine -->
当前每组四字节按小端读入。剩余 1 至 3 字节时，组内继续按小端顺序组成一个数；缺少的高位字节补零。例子 01 00 02 的末组值为十六进制 00020001。

## 计算和拼接两个和
<!-- sources: rfc, engine -->
A 和 B 初值为 0，模数是 4294967295。每读取一个输入值后将它累加到 A 取余，再把新 A 累加到 B 取余。结果先写 B 的八个十六进制字符，再写 A 的八个字符。

## 两个字和部分尾字
<!-- sources: rfc, engine -->
以下结果保留前导零，原字节从左开始分组。

:::example 两个完整四字节组
[输入]
01 02 03 04 05 06 07 08
[结果]
100d0a070c0a0806
[说明]
输入值为 04030201 和 08070605。A=0C0A0806，B=100D0A07。
:::

:::example 三字节的末组
[输入]
01 00 02
[结果]
0002000100020001
[说明]
只处理一个值 00020001，A 和 B 因而相同。
:::

:::example 全 FF 字与模数
[输入]
FF FF FF FF
[结果]
0000000000000000
[说明]
单个输入字正好是模数。取余后 A 为 0，B 随之为 0。
:::

## 归档检验的边界
<!-- sources: rfc, engine -->
归档时可比较该校验的原始字节范围、端序及尾部约定。若需要发送者认证，还得有认证码或签名等机制。Fletcher 的两项累加只描述输入序列的部分信息。

## 常见误区
- 64 位是输出宽度，四字节输入组是 32 位。
- 模数是 2³²−1，不是 2³²。
- 前导零用于固定输出宽度，做字节对照时应保留。
