---
capabilityId: native:paper
title: 标准数独求解
topicGroup: logic
summary: 按行、列、宫的互异条件检查数独给定与可确定的填法。
aliases:
  - 数独
  - Sudoku
  - Number Place
  - 宫内互异
sources:
  - id: nikoli
    title: Nikoli — Sudoku
    publisher: Nikoli
    url: https://www.nikoli.co.jp/en/puzzles/sudoku/
    language: en
    kind: official-doc
    locator: Rules / History，9×9 的行列与宫
  - id: engine
    title: 迷雾工具箱纸笔题棋盘模型
    publisher: 迷雾工具箱
    url: /round3/board-model.js
    language: zh-CN
    kind: implementation
    locator: validateBoard、encodedBoard、resultText，题面边界和确定项
  - id: csp
    title: cspuz_core 固定求解器
    publisher: semiexp
    url: https://github.com/semiexp/cspuz_core/tree/d88f99c8c7872d400d2f0d2456860f50f3d1f1f6
    language: en
    kind: implementation
    locator: cspuz_rs_puzzles 与规则求解接口
---

## 介绍
<!-- sources: nikoli -->

标准数独要求把格子填上规定范围内的数字，使每行、每列和每宫都只用一次各数字。最常见形式为 9×9，每宫占 3×3。Nikoli 将杂志上的 Number Place 介绍给日本读者，并以 Sudoku 为题名发表。

## 行列宫与局部候选
<!-- sources: nikoli, engine -->

在 9×9 中，一个空格的候选集合是 1 到 9 中尚未在它所在的行、列和宫出现的数字。如果该集合只剩一个值，就可据此落格。若某一行必须出现某个数而只剩一个候选位置，也能确定那一格，尽管该格可能还未从自身候选中排掉其他数。

## 题面变体和全局状态
<!-- sources: nikoli, engine, csp -->

4×4 的标准缩小型使用 1 到 4 及 2×2 宫，6×6 可采用 2×3 宫。只要每个区域的格数正好等于可用数字数，互异就同时保证每种数字都出现。求解时需区分整个局面确定、多个解仍有共同事实、以及给定之间发生矛盾。

## 最小题面的三个结果
<!-- sources: nikoli, engine, csp -->

以下均为 4×4，句点表示没有给定。导出的确定项用数字表示，问号表示在当前结果中不能固定。

:::example 由第 1 行确定缺失值
[输入]
1 2 . 4
. 4 1 .
2 . 4 3
4 3 2 1
[结果]
1 2 3 4
3 4 1 2
2 1 4 3
4 3 2 1
[说明]
第一行缺 3，第三行缺 1。两个对应宫与纵列中的剩余候选共同推定第二行的两个空格。
:::

:::example 行内给定重复
[输入]
将上一例第 1 行第 2 格从 2 改为 1，其他位置保持。
[结果]
无解。
[说明]
同一行的两个给定 1 违反互异，填其他空格无法消除这项冲突。
:::

:::example 空题面的确定项
[输入]
4×4 数独，16 个位置均空白。
[结果]
存在多种完成方式，16 个位置在此结果中均为问号。
[说明]
任一合法终局可整体交换两个数字的名字并得到另一终局，因此没有哪个位置必然取某个具体数字。
:::

## 从求解结果提取信息
<!-- sources: nikoli, engine, csp -->

若题目要求读取几个坐标，应先使行列编号、宫边界和给定值与原题一致。导出文本也可用作第二轮谜题的数据。遇到多个解时，可以先使用各解共享的格子，或重新确认题目是否还有额外的区域或条件。

## 常见误区

- 宫的互异规则和整行、整列同样重要。
- 初见给定具有对称外形，也不能要求最终答案具有同样对称性。
- 无法固定某格仍可能有多组合法答案，区别于规则矛盾导致的无解。

