---
capabilityId: op:Disassemble%20ARM
title: ARM 反汇编
topicGroup: files
summary: 按 A32、T32 或 A64 指令编码解释原始字节，核对指令位置。
aliases:
  - Disassemble ARM
  - Arm
  - Thumb
  - AArch64
  - 反汇编
sources:
  - id: armv7
    title: ARMv7-A/R Architecture Reference Manual — ARM Instruction Set Encoding
    publisher: Arm
    url: https://support.arm.com/documentation/ddi0406/c/Application-Level-Architecture/ARM-Instruction-Set-Encoding/ARM-instruction-set-encoding
    language: en
    kind: official-doc
    locator: A32 指令编码与条件字段
  - id: thumb
    title: ARM Compiler armasm Reference Guide — NOP
    publisher: Arm
    url: https://support.arm.com/documentation/dui0489/i/arm-and-thumb-instructions/nop?lang=en
    language: en
    kind: official-doc
    locator: ARM 与 Thumb 空操作及替代形式
  - id: a64
    title: A64 Instruction Set Architecture Guide
    publisher: Arm
    url: https://documentation-service.arm.com/static/674d8b61c7fc0d1f211dc776
    language: en
    kind: official-doc
    locator: 固定 32 位指令，操作码字段与 RET
  - id: engine
    title: CyberChef Shellcode 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Shellcode.js
    language: en
    kind: implementation
    locator: 反汇编入口及地址呈现
---

## 介绍
<!-- sources: armv7, a64 -->

Arm 反汇编将原始指令字节解析为助记符和操作数。AArch32 可用 A32 与 T32，AArch64 使用 A64。它们共享一些术语，但表示指令的比特布局并不相同，阅读时须首先区分执行状态。

## 指令宽度与字节顺序
<!-- sources: armv7, thumb, a64 -->

A32 和 A64 的指令均为 32 位。T32 可使用 16 位与 32 位编码，解析器从第一个半字确定需要多读多少字节。将小端样本 `00 00 A0 E1` 还原成 A32 指令字时，最低位字节在前，整数值为 0xE1A00000。

## 指令字段与别名
<!-- sources: armv7, thumb, a64, engine -->

指令位域指定操作种类、寄存器或立即数。一个指令也可以有符合约定的显示别名。比如某些 A32 环境用同一寄存器自传送实现无实际作用的填充，反汇编仍会按原编码显示 MOV。作为独立编码存在的 NOP 则可直接显示自己的助记符。

## 字节与显示地址对照
<!-- sources: armv7, thumb, a64, engine -->

以下各例都是人工构造的独立指令片段。地址用于对照原字节位置和反汇编输出，不表示样本一定来自包含这些虚拟地址的已链接程序。

:::example A32 寄存器传送
[输入]
小端 A32，00 00 A0 E1，从地址 0 开始。
[结果]
0x00000000  mov r0, r0
[说明]
条件字段 1110 表示通常的无条件执行。源寄存器和目的寄存器均为 r0。
:::

:::example 16 位 Thumb 空操作
[输入]
小端 T32，00 BF，从地址 0 开始。
[结果]
0x00000000  nop
[说明]
两个字节组成 0xBF00，这条 NOP 占用一个半字。
:::

:::example 两条 A64 指令的地址
[输入]
A64，1F 20 03 D5 C0 03 5F D6，从十六进制地址 1000 开始。
[结果]
0x00001000  nop
0x00001004  ret
[说明]
两条指令各占 4 字节。RET 的默认返回寄存器是 X30，在这条助记符里省略。
:::

## 有上下文的结果判读
<!-- sources: armv7, a64, engine -->

文件头的机器类型、代码段和已有符号能够解释一段数据应从哪条边界开始读。把非代码数据或错误指令状态交给解析器也可能产生合法助记符。反汇编结果表达的是选定规则下的字节解释，恢复源码还需要更高层的程序结构与调试信息。

## 常见误区

- AArch32 的 A32 与 T32 不等同，不能单凭同一处理器名称选取指令状态。
- 十六进制列通常依照原字节顺序显示，与用于核对位域的整数写法可能不同。
- 改变起始地址会移动显示位置，不会把同一份字节变成另一种架构的指令。

