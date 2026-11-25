---
capabilityId: op:Take%20nth%20bytes
title: 间隔提取字节
topicGroup: files
summary: 按照起点和固定间隔抽出离散字节，区分绝对偏移与逐行重置。
aliases:
  - Take nth bytes
  - 周期抽取
  - 交织字节
sources:
  - id: remainder
    title: ECMA-262 Number::remainder
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-numeric-types-number-remainder
    language: en
    kind: standard
    locator: 整除时余数为零
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
    locator: Take nth bytes：模余条件、逐行重置与输出字节序列
---

## 介绍
<!-- sources: remainder, engine -->
间隔提取从连续字节中按固定步长抽样，常用于拆分交织流，或检查每条固定宽度记录里的同一字段。它保留选中的字节，结果顺序与原输入相同。

## 抽样位置
<!-- sources: remainder, engine -->
从零起算的起点 s 是第一个待取位置。设步长 p 为正整数，继续取 s＋p、s＋2p 等。输入比起点短或恰等于起点时，整段模式不产生任何字节。

## 整段与逐行
<!-- sources: ascii, engine -->
整段模式的起点只在整段数据开始时计算一次。逐行模式以 LF 重置偏移，LF 原样留下。若由文本产生字节，文字中全角字符或编码签名也可能改变后续抽样相位。

## 周期抽样实例
<!-- sources: engine, remainder -->
三组选择位置可以直接按对应源字节核对。

:::example 第 2、5、8 个字节
[输入]
ABCDEFGH，步长 3，起点 1
[结果]
BEH
[说明]
偏移是 1、4、7，分别对应 B、E、H。
:::

:::example 分出交织的一列
[输入]
ABCDEF，步长 2，起点 0
[结果]
ACE
[说明]
每组两个字节，只保留组内第一位。
:::

:::example 新行重新取第二位
[输入]
ABC
DEF
[结果]
B
E
[说明]
逐行、步长 2、起点 1。第一行取 B，第二行取 E，换行保留。
:::

## 检查其他相位
<!-- sources: utf8, remainder, engine -->
宽度为 p 的交织可分别从偏移 0 到 p−1 抽取每列。把输出解释成文本前还应检查字节编码；同一 UTF-8 字符的字节可能因抽样而分散到不同列。

## 常见误区
- 步长为 3 表示相邻选中位置的差为 3，中间只跳过两个位置。
- 起点超出输入时不会回到开头。
- 逐行与整段模式可能产生不同列，尤其遇到不足一个周期的行长时。
