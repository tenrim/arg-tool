---
capabilityId: native:turing
title: 图灵机
topicGroup: programming
summary: 按当前状态和读头下符号选择纸带的写入、移动和状态转换。
aliases:
  - 图灵机
  - Turing
  - 状态
  - 转换表
  - 纸带
sources:
  - id: paper
    title: On Computable Numbers, with an Application to the Entscheidungsproblem
    publisher: Alan M. Turing
    url: https://theory.stanford.edu/~trevisan/cs172-07/turing36.pdf
    language: en
    kind: author-spec
    locator: 1936 年论文第 1、2 节，纸带图景与机器配置
  - id: machine
    title: turingmachine.io：Machine definition and examples
    publisher: turing-machine-viz 项目
    url: https://turingmachine.io/
    language: en
    kind: official-doc
    locator: YAML 符号、状态、空白及示例
  - id: core
    title: 图灵机状态、快照与撤销
    publisher: 迷雾工具箱
    url: /turing/core.js
    language: zh-CN
    kind: implementation
    locator: compileDefinition、stepSession、undoSession、snapshotSession
---

## 介绍
<!-- sources: paper, machine -->

图灵机是计算的抽象模型。它在纸带上读写离散符号，读头在格子间移动，有限状态控制器通过规则表决定每一步。简单机器也可以组合出一系列依赖当前位置和历史的操作。

## 一步的三个动作
<!-- sources: paper, core -->

一步读取当前位置的符号，根据当前状态选择规则。规则可写入符号、移动读头、指定下一状态。仅需移动、不改格子时，读到的符号保留。

:::example 扫描第一格
[输入]
纸带为 111，起始状态 scan 位于 0；规则读 1 时向右且保持 scan
[结果]
一步后纸带 111，读头 1，状态 scan
[说明]
没声明写入，格子不变。
:::

## 空白格和终止状态
<!-- sources: machine, core -->

纸带未写入的位置读作指定空白符。可以专门把读到空白作为进入终止状态的条件。在一元记数法中，数字用一串 1 表示，增加一个 1 就相当于加一。

:::example 一元加一
[输入]
纸带 111；scan 读 1 向右；读空白时写 1、左移并进入 done
[结果]
4 步后纸带 1111、读头位置 2、状态 done
[说明]
三次扫描后读头到位置 3，最后一步在该格写入。
:::

## 状态回退与复盘
<!-- sources: core, machine -->

查看执行历史可以分辨哪一步写过哪个格子。撤销应恢复纸带、状态和读头位置，复盘时才能从旧的配置重新选择规则。

:::example 撤掉写入
[输入]
由前例终态撤销一步
[结果]
纸带 111、读头位置 3、状态 scan
[说明]
位置 3 恢复为空白，下一步可以再次执行写入。
:::

## 运行步数和停机
<!-- sources: paper, machine, core -->

规则未定义或进入规定的终止状态时，机器不会继续演化。运行器设定步数上限可以有限时间返回，但上限只说明这次观察内未停机，不能用来证明任意程序永不停机。

## 常见误区

- 读头看到的符号不足以选择规则，状态也要匹配。
- 空白符是一个可读符号，和纸带边界不同。
- 一次观察达到执行上限，不证明机器永远不会停机。

