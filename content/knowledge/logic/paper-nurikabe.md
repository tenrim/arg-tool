---
capabilityId: native:paper-nurikabe
title: 数墙 求解
topicGroup: logic
summary: 根据岛的面积、黑格连通和 2×2 禁区判断数墙着色。
aliases:
  - 数墙
  - Nurikabe
  - 白岛
  - 黑墙
sources:
  - id: nikoli
    title: Nikoli — Nurikabe
    publisher: Nikoli
    url: https://www.nikoli.co.jp/en/puzzles/nurikabe/
    language: en
    kind: official-doc
    locator: Rules，岛面积、正交连通与黑格限制
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

数墙（Nurikabe）要求把一部分格涂黑，把剩余白格划分为一座座岛。每座岛恰有一个数字，数字是这座岛的白格总数。所有黑格连成一整片墙，并且不可出现全黑的 2×2 区块。

## 白岛的范围
<!-- sources: nikoli, csp -->

白格沿上下左右共享边连通。编号所在格本身是白格，也计入面积。一个标为 1 的岛只有编号自身，四邻的可用相邻格必须为黑。两格仅在角接触时仍可属于不同的白岛。

## 黑墙的两项全盘要求
<!-- sources: nikoli, csp -->

任何两块黑格之间要能由上下左右连续的黑格相连。一个 2×2 区域至少保留一格白色，避免整块涂黑。当某个 2×2 已有三个格确定为黑时，第四格不能再涂黑。把这条局部约束和全局连通性同时使用，可进一步缩小答案。

## 小棋盘的判定
<!-- sources: nikoli, engine, csp -->

以下题面用句点指代空格。结果中的句点是可确定的白格，井号是黑格，问号表示在不同解中可变化的格。

:::example 左上角的 1
[输入]
1 .
. .
[结果]
. #
# #
[说明]
只有编号格为白。其他三格均为黑，沿边连成一片且没有全黑 2×2。
:::

:::example 两个沿边相邻的 1
[输入]
1 1
. .
[结果]
无解。
[说明]
两个数字格必须是白格，却已沿边连成同一个岛，与每岛一个数字及面积 1 冲突。
:::

:::example 左上角的 2
[输入]
2 .
. .
[结果]
. ?
? #
[说明]
岛的第二格可在右侧或下方。右下格无法与编号直接相接，若将它纳入面积 2 的岛就会失去正交连通。
:::

## 保留题目给定与共有格
<!-- sources: nikoli, engine, csp -->

从数墙提取图案时，先核对每个格的色值是否在所有解中确定。若多个结果只共享部分黑白格，可以继续读取共通内容，或回到题面确认数字和范围。有编号的白格排版可以保留原数字，着色结果中的白格仍需合并回该岛计数。

## 常见误区

- 两个对角相接的白格不因为接触角点就属于同一个岛。
- 黑墙连通不会自动排除 2×2 全黑块，这两条都要检查。
- 编号代表所属白岛面积，不能把周围黑格的数量当成线索值。

