---
capabilityId: native:code-deadfish
title: Deadfish
topicGroup: programming
summary: 跟踪 Deadfish 的一个累加器、四条命令和特殊边界重置。
aliases:
  - 累加器
  - i d s o
  - Deadfish 解释器
sources:
  - id: doc
    title: Deadfish 原始实现说明
    publisher: Esolang Park
    url: /vendor/knowledge/esolang-park/languages/deadfish/README.md
    language: en
    kind: author-spec
    locator: 四条命令、缺少分支与循环
  - id: engine
    title: 固定 esolang 执行器
    publisher: Esolang Park 等
    url: /vendor/coderunner/esoteric.js
    language: en
    kind: implementation
    locator: Deadfish 单步、十进制输出与 -1 / 256 重置
---

## 介绍
<!-- sources: doc, engine -->

Deadfish 以一个数值累加器表达计算。i 将值加一，d 减一，s 取平方，o 输出当前十进制数。常见实现的起始值为零，按程序里的指令先后改变。

## 加减和平方
<!-- sources: doc, engine -->

加法与平方的先后会显著影响结果。平方把当前值乘以自身，多次平方依次对新的值运算。读题时逐条列值比只数程序里有多少个 i 或 s 更可靠。

:::example 先累加再平方
[输入]
iiiso
[结果]
9
[说明]
三个 i 使累加器变成 3，s 得 9，o 打印十进制 9。
:::

## 特殊边界
<!-- sources: engine -->

固定解释器遇到累加器等于 −1 或等于 256 时将其重置为零。大于 256 的数不一定重置，因为条件检查这两个具体值。不同衍生实现可能调整边界。

:::example 精确达到重置值
[输入]
iiiisso
[结果]
0
[说明]
四次递增得 4，平方得 16，再平方恰为 256，输出前重置。
:::

## 经过更大的数
<!-- sources: engine -->

从初始值运算到大于 256，而没有命中 256 时，累加器可保留大值。这一特征可以用一段含两次平方的短程序对照位宽循环的解释。

:::example 跳过 256
[输入]
iiiiissio
[结果]
626
[说明]
连续状态是 5、25、625、626。经过的值没有命中重置边界。
:::

## 程序如何产生输出
<!-- sources: doc, engine -->

o 读取当前累加器并输出十进制文本。它本身没有条件跳转和循环结构。收到一串输出时，可以记录每次 o 触发的数字边界，多个数字的文本如果连续写出，并不自动包含分隔符。

## 常见误区

- 累加器大于 256 与刚好等于 256 的处理不同。
- o 的输出格式是十进制文本，数值 65 不会自动显示为 A。
- s 对当前值平方，连续两次相当于取四次方并经过两次边界判断。
