---
capabilityId: op:Remove%20null%20bytes
title: 移除空字节
topicGroup: files
summary: 把值为 00 的字节从序列中过滤，保留字符 0 和其他非零字节。
aliases:
  - Remove null bytes
  - 空字节
  - NUL
  - 零字节过滤
sources:
  - id: ascii
    title: RFC 20 ASCII format for Network Interchange
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc20
    language: en
    kind: standard
    locator: ASCII 表及 LF、NUL 字节
  - id: utf8
    title: RFC 3629 UTF-8
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3629.txt
    language: en
    kind: standard
    locator: 第 3 节，一到四字节及各字节的排列
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Remove null bytes：丢弃 Uint8Array 中值严格为 0 的项
---

## 介绍
<!-- sources: ascii, engine -->
空字节 NUL 是八位全为零的字节，十六进制写作 00。移除空字节会扫描完整输入，把数值恰为 0 的字节去掉，并保持其他字节的相对次序。

## NUL、空格和数字
<!-- sources: ascii, utf8 -->
ASCII 中 NUL 是 00、空格是 20、数字字符 0 是 30。这三者即使在文字中很难直观看出，也可用十六进制立即区分。ASCII 和相同范围的 UTF-8 字节保持这些值。

## 跨编码的注意点
<!-- sources: ascii, utf8, engine -->
NUL 可充当填充、标记或字符串终结符，实际意义由文件结构决定。含零字节的二进制字段还有可能是正常数值。若按字节移除，零值出现在什么字段都一样被删掉，结果会改变后续偏移。

## 字节过滤的例子
<!-- sources: ascii, engine -->
以下用十六进制直接表示待处理的字节，间隔空格只为便于阅读。

:::example 同时含 NUL 与数字 0
[输入]
41 00 42 30
[结果]
41 42 30
[说明]
只移除 00，结果可以读成 AB0。
:::

:::example 全部是零
[输入]
00 00
[结果]
空序列，0 字节
[说明]
没有任何非零样本可以进入结果。
:::

:::example 临近高值与低值
[输入]
FE FF 00 01
[结果]
FE FF 01
[说明]
FE、FF、01 都是非零字节，保留原相对位置。
:::

## 按材料结构检查
<!-- sources: ascii, engine -->
如果预期只清除某一字段末尾的填充，可以先界定该字段范围。过滤结果在一份文本里看似正确时，也不能证明原文件的所有零值都无用。

## 常见误区
- 数字 0、空格与空字节值不同。
- 过滤遍及首尾和中间，不只删除尾部填充。
- 可见文本里没有符号不代表文件里没有实际字节。
