---
capabilityId: op:Drop%20nth%20bytes
title: 间隔丢弃字节
topicGroup: files
summary: 从一个偏移开始移除每隔固定步长出现的字节，适合排除交织位置的干扰。
aliases:
  - Drop nth bytes
  - 周期删除
  - 字节抽样补集
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
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Drop nth bytes：第一个目标偏移、余数与 LF 保留
---

## 介绍
<!-- sources: engine, remainder -->
间隔丢弃按固定周期移除一组离散位置。起点选中第一个要删的字节，之后每隔指定的步长再删一个。其余字节按原顺序保留。

## 按偏移选目标
<!-- sources: engine, remainder -->
设起点是 s，步长是 p。偏移 i 在 i≥s 且 (i−s) 除以 p 的余数为 0 时被移除。起点之前的内容全部保留。步长须为正整数，起点为从零开始的非负整数。

## 重新计数的分行方式
<!-- sources: ascii, engine -->
逐行处理以 LF 字节 0A 识别边界，遇到 LF 时直接保留，并从下一字节重新开始偏移。依序处理整段时，LF 也可像其他字节一样落在目标位置。

## 周期与起点的例子
<!-- sources: engine, remainder -->
以下每个字符在输入中占一个字节，换行用 LF 表示。

:::example 每三个字节删一个
[输入]
ABCDEFGH，步长 3，起点 1
[结果]
ACDFG
[说明]
删除偏移 1、4、7 上的 B、E、H。
:::

:::example 删去从左起的奇数位
[输入]
ABCDEF，步长 2，起点 0
[结果]
BDF
[说明]
偏移 0、2、4 对应从左数的第 1、3、5 位。
:::

:::example 两行分别删除第二位
[输入]
ABC
DEF
[结果]
AC
DF
[说明]
逐行、步长 2、起点 1。两行各删一个字节，LF 得以保留。
:::

## 交织记录与逆推
<!-- sources: engine, remainder -->
在固定宽度的交织数据里，某个周期位置可属于填充或另一条数据列。丢弃一个位置会使记录变短，不能从输出独立恢复哪些原值被移除。若需可复核，应把选中的位置及原记录同时留存。

## 常见误区
- 起点本身就参与删除，无需先等一个周期。
- 周期以原输入的偏移计数，删了前一个目标不会重新计数。
- 区间删除一次去掉一段，周期删除按分散的位置操作。
