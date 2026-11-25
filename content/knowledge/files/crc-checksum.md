---
capabilityId: op:CRC%20Checksum
title: CRC校验和
topicGroup: file-compression
summary: 用双方约定的多项式与参数组求循环冗余校验，借公开检查值区分不同预设。
aliases:
  - CRC Checksum
  - 循环冗余校验
  - CRC-32C
  - 自定义 CRC
sources:
  - id: rev
    title: Catalogue of parametrised CRC algorithms
    publisher: Greg Cook / CRC RevEng
    url: https://reveng.sourceforge.io/crc-catalogue/all.htm
    language: en
    kind: author-spec
    locator: 参数组、检查值以及不同预设名
  - id: ppp
    title: RFC 1662 PPP in HDLC-like Framing
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc1662
    language: en
    kind: standard
    locator: 第 3 节及附录 C，帧校验计算示例
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: CRC Checksum 的预设和自定义参数及字节处理
---

## 介绍
<!-- sources: rev, ppp -->
循环冗余校验把比特序列视作二元多项式的系数列。计算时依某个生成多项式作除法，原始余数再按配置处理为校验值。它常用于发现网络、存储或传输中的意外错误。

## 定宽参数组
<!-- sources: rev, engine -->
位宽决定寄存器和输出大小，多项式选择除法规则。初值、输入反射、输出反射和末异或定义完整配置。相同位宽的两个 CRC 名称可能代表不同配置，计算前要核对名称背后的参数。

## 反射和表示
<!-- sources: rev, ppp, engine -->
反射是按约定反转指定比特域的次序，与把一个字节序列从尾向头重排不同。表中 Check 常用 ASCII 的 123456789 作为检查向量。它有 9 个字节，应把这些字符当作原文而不是十六进制数字。

## 同一字节序列的 CRC
<!-- sources: rev, engine -->
下列向量都使用 ASCII 123456789，参考 CRC RevEng 每个参数组的检查值。

:::example CRC-8/SMBUS
[输入]
123456789，预设 CRC-8/SMBUS
[结果]
f4
[说明]
位宽 8，多项式 07，初值和末异或为 00，输入与输出均不反射。
:::

:::example CRC-32/ISO-HDLC
[输入]
123456789，预设 CRC-32/ISO-HDLC
[结果]
cbf43926
[说明]
该组反射输入和输出，起始及末异或均为 32 位全 1。
:::

:::example CRC-32/ISCSI
[输入]
123456789，预设 CRC-32/ISCSI
[结果]
e3069283
[说明]
虽然同为 32 位，所用 Castagnoli 多项式与 ISO-HDLC 的不同。
:::

## 校验结果与帧中字段
<!-- sources: rev, ppp -->
在协议里还需确认参加计算的具体字节范围，以及结果按什么端序写入帧。仅凭一个校验值和几个候选结果无法总是判定参数配置，应结合实际协议、另一组向量和原始资料核对。

## 常见误区
- CRC-32 只给出了位宽，不能唯一决定参数。
- 反射是比特顺序，序列化端序另有规定。
- CRC 用于有限范围的错误检测，不能证明消息的真实性。
