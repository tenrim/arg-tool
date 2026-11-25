---
capabilityId: pair:To%20Hexdump
title: 十六进制转储
topicGroup: characters
summary: 十六进制转储把字节按行展示，通常列出行首偏移、十六进制字节和可打印字符预览。
aliases:
  - To Hexdump
  - From Hexdump
  - Hex dump
  - 字节转储
sources:
  - id: oracle
    title: hexdump(1)
    publisher: Oracle
    url: https://docs.oracle.com/cd/E75432_01/html/E71066/hexdump-1.html
    language: zh-CN
    kind: official-doc
    locator: -C 的十六进制及 ASCII 显示
  - id: manual
    title: hexdump(1) — util-linux manual
    publisher: util-linux
    url: https://man7.org/linux/man-pages/man1/hexdump.1.html
    language: en
    kind: official-doc
    locator: 典型转储格式与重复行显示
  - id: ascii
    title: RFC 20 — ASCII Format for Network Interchange
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc20.txt
    language: en
    kind: standard
    locator: 第 2、3 节，字符表及八位字节中的表示
  - id: fixed
    title: CyberChef Worker（固定构建）
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: 行宽、偏移和预览区
---

## 介绍
<!-- sources: oracle, manual -->
十六进制转储是查看原始字节的方法。常见布局先列出一行起始的字节偏移，中间列出数据字节，最后附上字符预览。定位某一字节时，把行首偏移加上它在本行内从零计的列号。

## 偏移、字节与预览
<!-- sources: oracle, manual, ascii -->
偏移记录数据位置。每两个十六进制数字表示一个字节。ASCII 预览可把 NUL 等不可打印字节显示为点。十六进制栏会保留对应字节的值，因而可区分预览中外形相同的项目。

:::example 以 4 字节为一行
[输入]
41 42 00 43 44 45
[结果]
00000000  41 42 00 43  |AB.C|
00000004  44 45        |DE|
00000006
[说明]
第二行从偏移 4 开始。第一行第三列是 00，预览用点代替。末尾偏移 6 表示读过 6 字节。
:::

## 点号的两种来历
<!-- sources: ascii, manual -->
ASCII 本身的句点是 2E。在采用点作占位符的预览中，00 和 2E 均可显示为点，原数据只能凭十六进制栏区分。遇到编码范围之外的其他字节时，预览还可能受显示模式影响。

:::example 看似相同的两个点
[输入]
2E 00
[结果]
十六进制栏为 2E 00，ASCII 预览为 ..
[说明]
第一点来自文件中的字面句点，第二点代表 NUL。
:::

## 行宽与总长度
<!-- sources: manual, fixed -->
行宽决定列数和下一个完整行的行首偏移。最后一行字节不足时，额外的对齐空格没有数据含义。若转储用星号代替重复行，恢复数据前还须确定该格式的省略约定与相邻偏移。

:::example 根据偏移定位最后一字节
[输入]
上一例 6 字节转储中的第二行，行首偏移 00000004
[结果]
45 位于偏移 00000005
[说明]
该字节在第二行的列号为 1。由末尾偏移 6 减去最后一字节位置 5，可知最后显示的是流结束边界。
:::

## 字节恢复与字段分析
<!-- sources: oracle, manual -->
从普通转储恢复文件时，只按偏移顺序抄取每行的字节栏，再按行连接。若另有偏移基准、截取范围或重复行折叠，须把它们记录下来。恢复字节后才能按格式解读长度、整数和文本等字段。

## 常见误区
- 字符预览中的问号、点和空白可能是显示占位，精确核对应读取十六进制栏。
- 行首的 00000004 是位置字段，不属于这一行的原始数据。
- 字节分行只影响显示，跨行的字段依然可以是连续的。
