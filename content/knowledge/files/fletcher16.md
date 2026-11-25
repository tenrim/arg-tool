---
capabilityId: op:Fletcher-16%20Checksum
title: Fletcher-16校验和
topicGroup: file-compression
summary: 逐字节计算两个模 255 的累加值，按高低字节合成 16 位结果。
aliases:
  - Fletcher-16 Checksum
  - 模 255
  - 双字节 Fletcher
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
    locator: Fletcher-16 Checksum：逐字节、模 255、高 B 低 A
---

## 介绍
<!-- sources: rfc, engine -->
Fletcher-16 逐个处理输入字节，用两个各占 8 位的状态记录累加值。第二状态累计的是不断更新的第一状态，因此同样的字节以不同顺序出现时，也可能得到不同结果。

## 按模 255 累加
<!-- sources: rfc, engine -->
起始 A=B=0。对输入 x，计算 A=(A＋x) mod 255，随后 B=(B＋A) mod 255。最后把 B 写在高字节，A 写在低字节。等于模数的一个 FF 字节对 A 的模值贡献为零。

## 顺序为何影响结果
<!-- sources: rfc, engine -->
较早出现的每项会被计入较多次前缀和，较晚出现的项被计入较少次。两列累加可以分别检验总和值和带位置的和值，但仍有错误组合会同时抵消。

## 按字节的例子
<!-- sources: rfc, engine -->
字节以十六进制列出时，每组两位才是一项输入。

:::example 中间一个 00
[输入]
01 00 02
[结果]
0503
[说明]
A 依次是 1、1、3，B 累加得 5。
:::

:::example 四个 FF
[输入]
FF FF FF FF
[结果]
0000
[说明]
每个字节恰为 255，对 A 取模后为零，B 也保持零。
:::

:::example ASCII 字符串
[输入]
123456789 的 ASCII 字节
[结果]
1ede
[说明]
最终 B=30，A=222，转十六进制为 1E 和 DE。
:::

## 对照协议中的字段顺序
<!-- sources: rfc, engine -->
协议存放两个累加值时可能规定不同显示顺序，或规定对某些位置补零再计算。核对资料时应确认输入涵盖哪些字段以及输出字节的排列，再将裸计算结果与帧中的字段比较。

## 常见误区
- 16 位输出由两个八位余数拼接。
- 模 255 与简单截取最低 8 位不同。
- 校验值相同不能单独确定输入相同。
