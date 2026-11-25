---
capabilityId: native:paper-slitherlink
title: 数回 求解
topicGroup: logic
summary: 根据格内数字选择横竖边，验证所有连线只构成一个闭环。
aliases:
  - 数回
  - Slitherlink
  - 单回路
  - 环路谜题
sources:
  - id: nikoli
    title: Nikoli — Slitherlink
    publisher: Nikoli
    url: https://www.nikoli.co.jp/en/puzzles/slitherlink/
    language: en
    kind: official-doc
    locator: Rules，边数、单环、不交叉
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

数回（Slitherlink）要求在点阵的相邻点之间画水平或垂直线，形成一个不自交、不分岔的闭环。格内数字表示这个格子的四条边中恰有几条被选，未标数字的格子仍可以与回路相邻。

## 把题面转成边的约束
<!-- sources: nikoli, csp -->

每条候选边有画线与不画线两种状态。给定 n 的格子具有四边总和为 n 的约束。例如为 0 的格子四边全部排除，为 3 的格子需要三边。格子之间的公共边只是一条线，会同时计入两侧格子。

## 顶点度数和整条回路
<!-- sources: nikoli, csp -->

回路经过一个点时恰有两条所选边与它相接，未经过的点则一条也没有。这个局部性质允许多个互不接触的小环，因此还要全盘检查所有选中边是不是位于同一条回路。出现无端点的多个环仍违反题目规定。

## 2×2 边状态实例
<!-- sources: nikoli, engine, csp -->

题面有 2 行 2 列格子，因此有 3×2 条横边和 2×3 条竖边。以下按画线为 1、不画线为 0、尚不能确定为问号来核对结果。

:::example 四格均为 2
[输入]
2 2
2 2
[结果]
横边从上到下为 1 1、0 0、1 1。
竖边从上到下为 1 0 1、1 0 1。
[说明]
四周的八条边围成一个外环，每个格子恰有两条边在环上，中间的边均未选。
:::

:::example 线段全被排除
[输入]
0 0
0 0
[结果]
无解。
[说明]
每一条边都挨着至少一个 0，被排除后不剩组成闭环所需的任何线。
:::

:::example 部分可确定的边
[输入]
3 .
. 3
[结果]
左上格的上边和左边、右下格的下边和右边确定为线，其余边未全部固定。
[说明]
角点不能只接一条线。每个标 3 的角格若漏掉一条外边，角点就将只剩一条。
:::

## 解读条件与结果
<!-- sources: nikoli, engine, csp -->

数回结果可以按图形描出路径，也可以用横、竖边矩阵存储。读取长度、转向和围出的区域时，应先确定走的是完整闭环，或者记录只掌握了其中哪些边。截图中空白格和数字 0 在规则中含义不同。

## 常见误区

- 两个相离的小环即便满足全部格内数字，也不是单环答案。
- 空格没有边数条件，四边仍受相邻格和回路控制。
- 未定边不是确定不连线，导出时保留问号。

