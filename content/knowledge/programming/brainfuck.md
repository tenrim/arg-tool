---
capabilityId: native:code
title: Brainfuck
topicGroup: programming
summary: 从八条指令跟踪数据带、指针与循环，区分单元数值和字符输出。
aliases:
  - BF
  - 内存带
  - 八指令
sources:
  - id: ref
    title: Yet another brainfuck reference
    publisher: Brian Raiter
    url: https://www.brainfuck.org/brainfuck.html
    language: en
    kind: author-spec
    locator: 八条命令、循环和 EOF 差异
  - id: engine
    title: 固定 esolang 执行器
    publisher: Esolang Park 等
    url: /vendor/coderunner/esoteric.js
    language: en
    kind: implementation
    locator: Brainfuck 初值、数值改变与字节输出
  - id: original
    title: brainfuck-2
    publisher: Urban Müller / Aminet
    url: https://aminet.net/package/dev/lang/brainfuck-2
    language: en
    kind: author-spec
    locator: 原始编译器与解释器发布
---

## 介绍
<!-- sources: original, ref -->

Brainfuck 用八种字符描述运算。程序数据保存在可顺序移动的数据带上，数据指针指定当前格。执行位置与数据指针各自变化，当前程序字符决定是否改变数据带、跳转或读取输入。

## 指针和单元值
<!-- sources: ref, engine -->

大于号向右移动数据指针，小于号向左移动。加号和减号改变当前单元。此运行器计算 8 位无符号值，0 减一回到 255，255 加一回到 0。不同历史实现也可能采用别的单元宽度。

:::example 负一步回绕
[输入]
-.
[结果]
单元值为 255，显示为 ÿ。
[说明]
从零减去一按 256 取模，255 以代码单元显示时对应 U+00FF。
:::

## 成对方括号
<!-- sources: ref, engine -->

左方括号检查当前单元是否为零。为零时越过配对的右方括号。右方括号在当前单元非零时跳回循环入口。循环内改变了数据指针时，退出判断仍读取当时所指的单元。

:::example 循环产生一个可见字母
[输入]
++++++++[>++++++++<-]>+.
[结果]
A。
[说明]
循环让第 1 格的值从 8 减为 0，并在右侧格累计到 64。最后移动到右格并加一至 65。
:::

## 输入输出指令
<!-- sources: ref, engine -->

逗号把下一输入单元写入当前格，点号输出当前单元代表的字符。没有后续输入时，本实现读零。数字值与它作为文本显示的结果要分开核对，尤其是零或其他不可见字符。

:::example 读取并加一
[输入]
程序 ,+.，给定输入 @。
[结果]
A。
[说明]
@ 的值 64 进入当前格，加一成为 65，点号输出 A。
:::

## 跟踪一份程序
<!-- sources: ref, engine -->

阅读嵌套循环可以先找出每对括号，再记录数据指针是否在一次循环后回到原格。如果程序没有很快结束，查看重复变化和输入消耗可以定位原因，执行资源到达上限只说明本次未跑完。

## 常见误区

- 移动数据指针不会自动加减数据。
- 点号输出的是字符读法，产生数值 65 时不会直接打印 65。
- 单元大小及输入结束约定会因解释器而变。
