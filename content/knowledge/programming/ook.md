---
capabilityId: native:code-ook
title: Ook!
topicGroup: programming
summary: 识别三个标记的成对标点、Brainfuck 对应关系和输入输出次序。
aliases:
  - Ook
  - Ook.
  - Ook?
  - 成对指令
sources:
  - id: author
    title: Ook! Language Concepts and Commands
    publisher: David Morgan-Mar
    url: https://www.dangermouse.net/esoteric/ook.html
    language: en
    kind: author-spec
    locator: 标点对和命令
  - id: local
    title: 代码执行的输入模型
    publisher: 迷雾工具箱
    url: /coderunner/model.js
    language: zh-CN
    kind: implementation
    locator: ookToBrainfuck 的标点对与原创码位置映射
  - id: engine
    title: 固定 esolang 执行器
    publisher: Esolang Park 等
    url: /vendor/coderunner/esoteric.js
    language: en
    kind: implementation
    locator: 转换后用 Brainfuck 执行
---

## 介绍
<!-- sources: author, local -->

Ook! 使用 Ook.、Ook? 和 Ook! 三个词形，末尾标点参与语法。每两个标记构成一条命令。八种常用命令可对应到 Brainfuck 的数据带运算，因此可用同样的指针和循环方法逐步阅读。

## 词对有方向
<!-- sources: author, local -->

Ook. Ook? 让指针向右，Ook? Ook. 向左。Ook. Ook. 给当前格加一，Ook! Ook! 减一。调换两个词的位置时，应重新查命令含义，不能认为同样的组成词代表相同行为。

:::example 给右侧一格加一
[输入]
Ook. Ook? Ook. Ook. Ook? Ook.
[结果]
指针回到起始位置，右侧单元为 1，没有字符输出。
[说明]
依次向右、加一、向左，三种动作都不输出字符。
:::

## 一读一写
<!-- sources: author, local, engine -->

Ook. Ook! 读取输入至当前格，Ook! Ook. 输出格里的字符。读写次序不能颠倒。加法完成后，若没有输出词对，单元变化只留在数据带上。

:::example 与 Brainfuck 的三步对应
[输入]
Ook. Ook! Ook. Ook. Ook! Ook.，输入 @。
[结果]
A。
[说明]
三个词对依次对应读取、加一、输出。
:::

## 循环和词对校验
<!-- sources: author, local -->

Ook! Ook? 与 Ook? Ook! 对应循环开头和结尾。嵌套时先匹配词对组成的完整指令。有效词数须为偶数，而且每对的标点组合须在相应执行模型中有定义。

:::example 不在八指令表中的词对
[输入]
Ook? Ook?
[结果]
提示不是有效指令。
[说明]
这一组合在所用八指令转换表中没有对应操作。
:::

## 从转换读回原文
<!-- sources: local, engine -->

转换模型可保存变换后指令在原词对中的位置。单步时既可以看数据带，也可以回到两个原始词，核对是哪种标点控制动作。编辑器只改排版也应保留每个词后的实际标点。

## 常见误区

- Ook! 的感叹号不是整行结束标记，它是词的一部分。
- Ook. Ook? 与 Ook? Ook. 方向相反。
- 一个词对才是一条指令，只数标点和逐词执行都会丢失语义。
