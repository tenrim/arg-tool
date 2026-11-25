---
capabilityId: op:Disassemble%20x86
title: x86 反汇编
topicGroup: files
summary: 依据 16、32 或 64 位模式分析变长 x86 指令和操作数。
aliases:
  - Disassemble x86
  - x86
  - Intel 64
  - IA-32
  - 机器码
sources:
  - id: intel
    title: Intel 64 and IA-32 Architectures Software Developer’s Manual, Vol. 2
    publisher: Intel
    url: https://cdrdv2-public.intel.com/671110/325383-sdm-vol-2abcd.pdf
    language: en
    kind: official-doc
    locator: Chapter 2 Instruction Format，MOV、NOP、DEC 与 RET
  - id: ms
    title: x86 Instructions — Windows Debugger
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/x86-instructions
    language: en
    kind: official-doc
    locator: 变长指令造成的起点错位与阅读方法
  - id: engine
    title: CyberChef Shellcode 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Shellcode.js
    language: en
    kind: implementation
    locator: 反汇编入口及地址呈现
---

## 介绍
<!-- sources: intel -->

x86 反汇编从一串机器字节恢复指令助记符、寄存器和立即数等操作数。x86 指令长度可变。选择起始边界和模式之后，才能判断一条指令占用多少字节，并确定下一条从哪里开始。

## 前缀、操作码和操作数
<!-- sources: intel -->

常见指令可带有前缀，然后读取操作码。按操作码定义还可能有寄存器／寻址字节 ModR/M、比例变址字段、位移和立即数。多字节立即数以小端排列。从字节 `34 12` 读取一个 16 位立即数，可得到 0x1234。

## 位模式改变解释
<!-- sources: intel, engine -->

位模式决定部分操作码的意义和默认操作数宽度。64 位模式中的 `48` 可以是一个 REX.W 前缀，配合后续指令使用 64 位操作数。在 32 位模式中，同一字节可独立解作传统单字节 DEC 的一种编码。

## 从地址逐条读取
<!-- sources: intel, engine -->

以下片段可逐条手算。对齐显示中的前导零只改变格式，记录的下一地址仍等于当前地址加上指令编码长度。

:::example 两条单字节指令
[输入]
64 位模式，90 C3，起始偏移 0。
[结果]
偏移 0 为 NOP，偏移 1 为 RET。
[说明]
90 是空操作编码，C3 是近返回编码。仅有这两个字节无法知晓执行时的实际返回地址。
:::

:::example 立即数和后续地址
[输入]
32 位模式，B8 34 12 00 00 90，起始偏移 0x1000。
[结果]
0x1000 是 MOV EAX,00001234，0x1005 是 NOP。
[说明]
B8 后四字节组成 0x00001234，第一条指令共用 5 字节。在 16 位模式中用 B8 34 12 90，可得到三字节的 MOV AX,1234，接着是一字节 NOP。
:::

:::example 模式切换造成的不同分段
[输入]
分别以 64 位和 32 位模式读取 48 89 C8，从偏移 0 开始。
[结果]
64 位模式显示一条 MOV RAX,RCX。32 位模式显示 DEC EAX，然后是 MOV EAX,ECX。
[说明]
64 位模式把 48 作为 REX.W 前缀，32 位模式则把它作为偏移 0 的一字节指令。
:::

## 指令与数据的判别
<!-- sources: intel, ms, engine -->

若从长指令中间开始读取，前几个字节可能恰好被解释成其他合法操作。检查材料时应结合已有函数入口、文件代码段、分支目标和其他代码对同一区域的引用。单看一列助记符无法确认运行时可达性，也不能复原原始变量名、类型或注释。

## 常见误区

- 每一行的地址差不必相同，x86 指令可以用不同数量的字节。
- 选错模式时仍可能看到合法助记符，合法编码不等于解释正确。
- 指令里写着 RET 只说明该操作读取返回地址，不能从这一行单独确定控制流目的地。

