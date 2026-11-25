---
capabilityId: native:code-malbolge
title: Malbolge
topicGroup: programming
summary: 用三进制机器字、地址相关指令、自修改与运行状态解释 Malbolge。
aliases:
  - 三进制
  - 自修改代码
  - A C D
  - Malbolge
sources:
  - id: spec
    title: Malbolge Specification
    publisher: Ben Olmstead / Lou Scheffer
    url: https://www.lscheffer.com/malbolge_spec.html
    language: en
    kind: author-spec
    locator: 机器、加载、命令表和执行顺序
  - id: study
    title: Programming in Malbolge
    publisher: Lou Scheffer
    url: https://www.lscheffer.com/malbolge.shtml
    language: en
    kind: author-spec
    locator: 原始解释器、指令加密与路径分析
  - id: engine
    title: 固定 esolang 执行器
    publisher: Esolang Park 等
    url: /vendor/coderunner/esoteric.js
    language: en
    kind: implementation
    locator: Malbolge 的 A、C、D、指令与内存
---

## 介绍
<!-- sources: spec -->

Malbolge 使用十位三进制的机器字，状态包括累计器 A、代码指针 C、数据指针 D 以及统一存储程序和数据的内存。源字符的含义依赖地址，并可能被程序执行后的置换改变。

## 三进制字与内存
<!-- sources: spec, engine -->

每位可以是 0、1 或 2。十位可表示 3¹⁰ 种状态，单字最大为全部取 2。内存有同样数量的字，可用一个机器字表示可能的地址。

:::example 最大机器字
[输入]
三进制 2222222222。
[结果]
十进制 59048。
[说明]
3¹⁰=59049，0 至 59048 共 59049 个值。
:::

## 地址参与指令解读
<!-- sources: spec, study -->

解释器会考虑地址和内存当时的字符值，不能仅从字符外观判定操作。规范中的位置计算对 94 取余；移动源字符会改变地址项。加载前若改变有效字符顺序，也可能影响内存的初始填充。

:::example 地址对解码下标的影响
[输入]
当前字符 ASCII 码为 65，地址分别为 0 和 1。
[结果]
按 (字符值+C) mod 94 算出的下标分别是 65 与 66。
[说明]
这两个下标仅说明位置参与解码，未断言此字符在两处都可作为源指令使用。
:::

## 状态和自修改
<!-- sources: spec, study -->

运算可能修改 A、C、D 或数据格。指令执行完成后，还会用规定的表改写代码位置上的当前字，再推进指针。循环再次进入同一个地址时，当前内存值可能与初次进入时不同。

:::example 短程序实算
[输入]
(&%$_""7<5492V0TA3P
[结果]
zb3
[说明]
固定执行器结束后累计器 A 为 19763，此例的输出不能从源字符直接摘出。
:::

## 输入结束和跟踪
<!-- sources: spec, engine -->

原始运行规则用最大字 59048 表示输入结束，而不是借用普通输出字符。分析一段程序，宜记录 C、D、A 和正在变化的格。在最后一次可见输出后，程序仍可继续执行状态操作直至停止。

## 常见误区

- 相同的源字符在不同地址可以有不同含义。
- 下一次回到同一地址不一定会执行上一次的操作。
- 规范化的助记代码与原始可加载的字符程序是不同表示。
