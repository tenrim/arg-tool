---
capabilityId: op:Text-Integer%20Conversion
title: 文本与大整数
topicGroup: characters
summary: 按字节顺序连接文本的编码值，可把整段数据读成大整数。要恢复原始文本，还须保留编码、字节顺序及必要的长度。
aliases:
  - Text-Integer Conversion
  - 整数与字节串
  - 字节大整数
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
  - id: utf
    title: RFC 3629 — UTF-8
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3629.html
    language: en
    kind: standard
    locator: 第 3 节，标量到字节的映射
  - id: worker
    title: CyberChef Worker（固定构建）
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Text-Integer Conversion 的文本字节与大端数值处理
  - id: catalogue
    title: CyberChef 操作目录（固定构建）
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Text-Integer Conversion 条目
---

## 介绍
<!-- sources: int, ascii -->
若为字符选定字节编码，整段字节可按基数 256 读成一个非负大整数。这种对应也用于分析将消息先转换为整数再做运算的谜题。字符编码、字节序、长度决定逆向取回的内容。

## 大端读数
<!-- sources: int, ascii -->
设三个字节从左到右为 a、b、c，且首字节最高有效，大整数等于 a × 256² + b × 256 + c。逆向反复除以 256，余数从最低有效字节起出现。可按相同位权直接读写十六进制，每两个十六进制数字对应一个字节。

:::example ABC 作为一个整体整数
[输入]
ABC
[结果]
4276803（十进制），414243（十六进制）
[说明]
ASCII 字节是 41 42 43，十进制位权计算为 65 × 65536 + 66 × 256 + 67。
:::

## 前导零与原始长度
<!-- sources: int, worker -->
大端字节串前面的零字节对整数没有贡献。长度已知时，可以从整数还原到指定的字节宽度。原长未知时，使用能容纳整数的最短字节串，可能丢失开头的 NUL。

:::example 两种字节长度具有相同整数
[输入]
00 41 00 42
[结果]
0x410042
[说明]
用最短长度逆向展开得到 41 00 42。若同时知道原长为 4 字节，可以补回开头的 00，中间的 00 一直参与定位。
:::

## 单字节映射与 UTF-8
<!-- sources: utf, int, worker -->
同一字符在单字节映射与 UTF-8 中可能对应不同数据。常见的 Latin-1 解释把 U+00E9 对应到 E9，UTF-8 对同一字符使用两个字节。以字节重新计算时，结果随编码变化。

:::example 重音字母对应的两个整数
[输入]
é
[结果]
Latin-1 为 233，UTF-8 的 C3 A9 按大端计算为 50089
[说明]
E9 单独作为数就是 233。C3 A9 则按 195 × 256 + 169 计算。
:::

## 文本形式与数值形式
<!-- sources: int, ascii, catalogue -->
书写结果时，十进制和十六进制可以表示同一整数。含数字的原始文本也有自己的字符字节。例如字符 1 的 ASCII 值为 31（十六进制），数值 1 则可写为单字节 01。复算时先确定当前资料写的是文本，还是已经转换的整数。

## 常见误区
- 文本数字与数值字面量在转换前需要区分。
- 相同整数可以对应带不同数量前导零的原始字节串。
- 当字节中存在高位字符，仅凭整数无法判断原先采用了哪一种字符编码。
