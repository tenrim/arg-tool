---
capabilityId: op:XOR%20Checksum
title: 异或校验和
topicGroup: file-compression
summary: 将固定宽度数据块的同位置字节逐列异或，保留不完整末块的已有字节。
aliases:
  - XOR Checksum
  - 逐列异或
  - 异或块校验
sources:
  - id: xor
    title: ECMA-262 Number Bitwise XOR
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-numeric-types-number-bitwiseXOR
    language: en
    kind: standard
    locator: Number::bitwiseXOR 和逐位异或
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: XOR Checksum：宽度为正整数、固定列异或及零初值
---

## 介绍
<!-- sources: xor, engine -->
异或校验和将多个比特值按位累积。若用固定字节宽度分组，每组同位置的字节会汇到同一列。输出为各列的最终异或值。

## 单列的规则
<!-- sources: xor, engine -->
两个相等的比特异或得 0，不同得 1。每列从 00 起算，每来一个字节便与对应列值异或。先后顺序可交换，因此同一列出现两个相同字节时，它们的贡献相互抵消。

## 尾部不足一组
<!-- sources: xor, engine -->
分组宽度决定输出字节数。末组比宽度短时，仅把已有的字节按列计入；空列仍使用以前的值。等价地说，末组缺失位置可看成与 00 异或。

## 三组字节实例
<!-- sources: xor, engine -->
以下用十六进制表示实际字节，块宽度以字节计。

:::example 两列的尾部
[输入]
01 02 03 04 05，块宽 2
[结果]
0706
[说明]
第一列 01⊕03⊕05=07，第二列 02⊕04=06。
:::

:::example 相同值抵消
[输入]
FF 00 FF，块宽 1
[结果]
00
[说明]
FF 与同一列的第二个 FF 抵消，00 不改变结果。
:::

:::example 输入短于块宽
[输入]
12 34 56，块宽 4
[结果]
12345600
[说明]
第四列始终为初值 00，前三列各收到一个字节。
:::

## 检错条件
<!-- sources: xor, engine -->
同一列上的不同位置如果以相同方式发生错误，异或可能抵消。交换两块的先后顺序也不改变各列结果。遇到需要检测更复杂错误的协议，应按协议对原数据的要求选择对应算法。

## 常见误区
- 块宽并非输入总长度。
- 异或累积与整数普通加法不同。
- 校验相同不能唯一确定块次序和字节内容。
