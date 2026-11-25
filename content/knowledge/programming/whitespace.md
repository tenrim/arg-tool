---
capabilityId: native:code-whitespace
title: Whitespace
topicGroup: programming
summary: 区分空格、Tab、换行的指令和二进制参数，复现压栈、算术与两种输出。
aliases:
  - 空白编程
  - 栈
  - UnWhitespace
sources:
  - id: author
    title: Whitespace-JS Usage and Notes
    publisher: Susisu
    url: https://raw.githubusercontent.com/susisu/Whitespace-JS/master/README.md
    language: en
    kind: author-spec
    locator: UnWhitespace 与 32 位整数备注
  - id: engine
    title: 固定 esolang 执行器
    publisher: Esolang Park 等
    url: /vendor/coderunner/esoteric.js
    language: en
    kind: implementation
    locator: Whitespace-JS 参数、栈、堆和输出指令
---

## 介绍
<!-- sources: author, engine -->

Whitespace 用空格、制表符和换行作为实际程序符号。一般可见字符不会参与解释。为了说明编码，常用 S、T、L 分别标出这三种符号；执行时仍要提供真正的空白字节。

## 指令前缀和数字
<!-- sources: author, engine -->

操作前缀区分栈、算术、堆、控制流与输入输出。压栈的前缀是 SS。数字紧接一个符号位，S 为正，T 为负，然后以 S/T 表示二进制位 0/1，L 结束数字。

:::example 推入正五
[输入]
显形 SSSTSTL。
[结果]
栈顶为 5。
[说明]
SS 表示压栈，符号 S 表示非负，TST 对应二进制 101。
:::

## 输出数字与字符
<!-- sources: engine -->

数字输出会把栈顶解释为数值的十进制文本，字符输出则取该值对应的字符。两种前缀分别为 TLST、TLSS，都会消耗栈顶。程序可用 LLL 明确结束。

:::example 数字和字符的差异
[输入]
显形 SSSTSSSSSTLTLSSLLL。
[结果]
A。
[说明]
先压入二进制 1000001 即 65，再以字符方式输出并停机。若换用数字输出，则会得到 65。
:::

## 算术与操作数顺序
<!-- sources: engine -->

算术一般从栈顶依次取两个数。对减法、整除这类有顺序的计算，要用先压入的数作为左操作数。原作者的 JavaScript 实现只提供有限精度，大整数的行为不能类推自任意精度解释器。

:::example 两数相加
[输入]
显形 SSSTSLSSSTTLTSSSTLSTLLL。
[结果]
5。
[说明]
两个压栈段分别放入 2 和 3，TSSS 取两数相加，TLST 输出 5。
:::

## 保全代码中的空白
<!-- sources: author, engine -->

检查原始文件时，普通文本编辑器的制表符转空格、删行尾空白和合并空行都会改变程序。显形可用来阅读或记录，中间转回代码时要确认每个记号被还原。

## 常见误区

- 显形字母 S、T、L 不是执行指令本身。
- Tab 和若干空格在屏幕上可能等宽，但语义不同。
- 规范的结束指令还需要真正的三次换行。
