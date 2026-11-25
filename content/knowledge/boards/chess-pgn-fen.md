---
capabilityId: native:chess
title: 国际象棋棋谱复盘
topicGroup: boards
summary: 区分 PGN 的逐步对局记录与 FEN 局面快照，并读取代数记谱。
aliases:
  - 国际象棋
  - PGN
  - FEN
  - SAN
  - Nf3
sources:
  - id: pgn
    title: Portable Game Notation Specification and Implementation Guide
    publisher: Steven J. Edwards 等
    url: https://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm
    language: en
    kind: author-spec
    locator: 8.2（SAN）与 16.1（FEN）
  - id: chess
    title: chess.js API
    publisher: Jeff Hlywa／chess.js
    url: https://jhlywa.github.io/chess.js/
    language: en
    kind: official-doc
    locator: loadPgn、move、fen 与历史
  - id: core
    title: 国际象棋复盘模块
    publisher: 迷雾工具箱
    url: /round4/chess.js
    language: zh-CN
    kind: implementation
    locator: 棋谱输入、快照和局面浏览
---

## 介绍
<!-- sources: pgn, chess -->

PGN 用来交换完整或部分对局，可以携带日期、棋手、结果、注释和一串着法。FEN 是另一种格式，描述某一时刻盘面和继续下棋需要的部分状态。

## 代数记谱与移动顺序
<!-- sources: pgn, chess -->

SAN（标准代数记谱）用字母表示棋子类型，用坐标记录到达格，兵常省去类型字母。x 表示吃子，+ 表示将军，# 表示将死。PGN 页面的手数按一黑一白的完整回合计。

:::example 读四个半回合
[输入]
1. e4 e5 2. Nf3 Nc6
[结果]
两兵先到 e4、e5；白马 f3，黑马 c6；轮到白方
[说明]
N 是马，着法顺序决定中间局面。
:::

## FEN 的六个字段
<!-- sources: pgn, chess, core -->

FEN 包括棋子布局、轮到的一方、王车易位权、吃过路兵目标格，以及半回合和完整回合计数。布局从第 8 横排到第 1 横排，数字表示连续空格。

:::example 读仅余双王的快照
[输入]
8/8/8/8/8/8/4k3/6K1 w - - 0 1
[结果]
白王 g1，黑王 e2，白方走，无易位权和吃过路兵目标
[说明]
小写 k 表黑王，大写 K 表白王。
:::

## 从记录导出局面
<!-- sources: pgn, chess, core -->

复盘逐次经历棋谱节点，到达某一位置后可导出当时 FEN。用它作为新分析的起始位置，不会带上此前的走法、弃权计时或三次重复的全局历史。

:::example 四步之后导出
[输入]
1. e4 e5 2. Nf3 Nc6，取最后一帧
[结果]
r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3
[说明]
走完第二回合后轮白方，两个马步使半回合计数到 2。
:::

## 视角与格子名称
<!-- sources: pgn, core -->

棋盘翻转只改变观看方向，格子名称不变。比对题目截屏和棋谱时，应以字母列、数字横排和轮到哪一方为准，再检查与早前记录是否一致。

## 常见误区

- 一个 FEN 无法恢复先前的整盘着法。
- 棋盘翻转不会改变棋子坐标。
- PGN 中的完整回合数与逐条走子的数量不相同。

