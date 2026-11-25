---
capabilityId: native:hunt-constraints-nonogram
title: 数织
topicGroup: logic
summary: 用连续黑段长度约束每行每列，计算最短占位、重叠位置与多解。
aliases:
  - Nonogram
  - 画图方格
  - 黑段长度
sources:
  - id: csplib
    title: Nonogram
    publisher: Gary Duncan、Ian Gent / CSPLib
    url: https://www.csplib.org/Problems/prob012/
    language: en
    kind: author-spec
    locator: Problem 012 行列长度串与段间空隙
  - id: parser
    title: 中文规则解析器
    publisher: philippica / cipher_machine
    url: https://github.com/philippica/cipher_machine/blob/29fa4ee1c60873484688c250b37c87d93f54cae4/src/sudoku/solverParser.js
    language: zh-CN
    kind: implementation
    locator: 区域、计数、排列、求和与连续段规则解析
  - id: local
    title: 约束预设与语句示例
    publisher: 迷雾工具箱
    url: /expansion/hunt-constraints-catalog.js
    language: zh-CN
    kind: implementation
    locator: CONSTRAINT_PRESETS 与 CONSTRAINT_RULE_REFERENCE
---

## 介绍
<!-- sources: csplib -->

数织的方格只有黑白两种状态。每行和每列的线索分别写出从一端读到另一端时，各个连续黑段的长度。解是一张同时满足所有行线索和列线索的图，实际画出的轮廓不参与规则判断。

## 段与空隙
<!-- sources: csplib, parser -->

相邻黑段之间至少隔一个白格。设一条线有 k 个正段长 d₁ 至 dₖ，则最短占位是各段长之和加 k−1。两端多余的白格可为零，中间空隙也可以多于一格。

:::example 两段刚好填满
[输入]
线长为 5，黑段长度为 [2,2]。
[结果]
黑 黑 白 黑 黑
[说明]
2+2+1=5，白色间隔的位置没有可移动余量。
:::

## 黑段的必经格
<!-- sources: csplib -->

一个可移动的黑段在所有合法位置中的交集给出必黑格。长 5 的线只有一个长度 3 的段时，段的左端可在第 1、2 或 3 格，三段位置都覆盖中央格。

:::example 中间格必黑
[输入]
线长为 5，长度序列为 [3]。
[结果]
第 3 格必黑，其余格需其他证据。
[说明]
合法区间为 1 至 3、2 至 4、3 至 5，交集只有第 3 格。
:::

## 行列交叉
<!-- sources: csplib, local -->

同一格同时参与所在行和所在列的连续段检查。一条线确定的黑格或白格可以缩小另一条线的可行排列。零线索表示整条线上没有黑段，在脚本的预设中写为 [0]。

:::example 矩形网格
[输入]
2×3 网格，两行线索是 [3]、[0]，三列线索均为 [1]。
[结果]
黑 黑 黑
白 白 白
[说明]
第一行全部为黑，第二行全部为白，逐列均只剩一个黑格。
:::

## 多解与矛盾
<!-- sources: csplib, parser -->

2×2 的每行每列都要求一个黑格，主、副对角线各形成一份合法盘。把棋盘的某一角额外指定为黑便可排除其中一盘。若一条线的最短占位已经超过线长，单凭这一线就能确认无解。

## 常见误区

- [2,2] 表示两个长度 2 的黑段，合并成一段后线索变成 [4]。
- 线索依次对应连续段，顺序也属于条件。
- 黑格数量正确不足以证明合法，还要检查分段与间隔。
