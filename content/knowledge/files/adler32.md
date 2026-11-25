---
capabilityId: op:Adler-32%20Checksum
title: Adler-32校验和
topicGroup: file-compression
summary: 对字节值及其累积和分别取模，以 32 位结果核对传输数据。
aliases:
  - Adler-32 Checksum
  - Adler-32
  - Zlib 校验
sources:
  - id: rfc
    title: RFC 1950 ZLIB Compressed Data Format Specification
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc1950
    language: en
    kind: standard
    locator: 第 2.2、2.3 节与第 8 节样例实现
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Adler-32 Checksum：初值 1、0，模 65521
---

## 介绍
<!-- sources: rfc, engine -->
Adler-32 为一组字节生成 32 位校验值。Zlib 格式中用它来核对原始数据。算法把每个字节计入一个累加器，再把每一步的累加器值计入另一个累加器。

## 两组和
<!-- sources: rfc -->
设 A=1、B=0。输入字节 x 后，计算 A=(A＋x) mod 65521，随后 B=(B＋A) mod 65521。65521 是小于 65536 的最大素数，两个状态均能用 16 位存储。

## 拼接顺序
<!-- sources: rfc, engine -->
输出为 B×65536＋A，高 16 位存 B，低 16 位存 A。A 的初值为 1，使空输入与单纯的零初始化校验有所区别。

## 可复算的字节序列
<!-- sources: rfc, engine -->
三个例子分别检查初始化、正文字符和含零字节的情况。

:::example 空输入
[输入]
零字节消息
[结果]
00000001
[说明]
B 仍为 0，A 仍为 1。
:::

:::example 已知文字样本
[输入]
ASCII 字符串 Wikipedia
[结果]
11e60398
[说明]
按字节累加得到 A=920，B=4582，分别写为 0398 和 11E6。
:::

:::example 字节中间有 00
[输入]
实际字节 01 00 02
[结果]
00080004
[说明]
A 依次是 2、2、4，B 累加得到 8。
:::

## 与压缩格式联用
<!-- sources: rfc -->
读取采用此校验的文件时，必须先查规定对压缩字节还是解压字节计算。Zlib 包装中以未压缩数据为准。相同 32 位宽度的 CRC 和 Adler 使用不同算法与参数，不能仅按输出长度对照。

## 常见误区
- A 的初值是 1，空输入并非全零。
- 01 00 02 三个字节与文字“01 00 02”的字节序列不同。
- 校验相同不能保证原内容相同。
