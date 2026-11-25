---
capabilityId: op:Fletcher-8%20Checksum
title: Fletcher-8校验和
topicGroup: file-compression
summary: 用两个模 15 累加值压缩为一个字节，区分输入的八位字节和输出的两个四位域。
aliases:
  - Fletcher-8 Checksum
  - 模 15 校验
  - 四位双累加
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
    locator: Fletcher-8 Checksum：逐字节、模 15，高半字节为第二个累加值
---

## 介绍
<!-- sources: rfc, engine -->
Fletcher 类校验不只累加输入值，也累加每一步的前缀和。此入口的 Fletcher-8 指输出大小 8 位，两个累加值各用四位。部分协议的“8 位 Fletcher”则指累加器宽度，需要看规则确认。

## 双累加步骤
<!-- sources: rfc, engine -->
把 A、B 初始都置 0。每读入一个八位字节 x，先取 A=(A＋x) mod 15，再取 B=(B＋A) mod 15。输入按完整字节读取，显示该字节的两位十六进制数字不单独计算。

## 合成结果
<!-- sources: engine -->
B 写成结果的高四位，A 写成低四位，得到单字节 16B＋A。比如 B=5、A=3，就记作 53。因为两个值按 15 取模，各自产生 0～14。

## 小输入算例
<!-- sources: rfc, engine -->
以下在能复算状态的位置写明两组累加值，用于对照十六进制结果。

:::example 中间的零
[输入]
01 00 02
[结果]
53
[说明]
A 依次为 1、1、3。B=1＋1＋3=5，输出为 53。
:::

:::example 一项正好是模数
[输入]
0F 00 00 00
[结果]
00
[说明]
0F 的数值是 15，A 每次均为 0，B 也一直为 0。
:::

:::example 标准可打印数字串
[输入]
ASCII 123456789
[结果]
0c
[说明]
处理九个字符字节后，A=12，B=0；低半字节 12 表示为 C。
:::

## 位宽与检测能力
<!-- sources: rfc, engine -->
第二累加值让顺序有机会影响结果，但两项只占一个字节，可能输出很相近。校验宽度、模数和初值需要一起记录，不能用这些名字代替具体协议规定。

## 常见误区
- 此处的 8 位指合成结果，不是每个累加器的位宽。
- 模数为 15，不能把溢出当作模 16。
- 单字节校验不提供唯一内容标识。
