---
capabilityId: native:go
title: 围棋棋谱复盘
topicGroup: boards
summary: 按 SGF 节点、摆子和变着重建棋局，核对提子、坐标和停一手。
aliases:
  - 围棋
  - SGF
  - 气
  - 提子
  - 棋谱
sources:
  - id: sgf
    title: SGF File Format FF[4]
    publisher: Arno Hollosi 等
    url: https://www.red-bean.com/sgf/sgf4.html
    language: en
    kind: standard
    locator: 第 1、2、8 节，树、节点和属性语法
  - id: go
    title: SGF Go GM[1] 专项定义
    publisher: Arno Hollosi 等
    url: https://www.red-bean.com/sgf/go.html
    language: en
    kind: standard
    locator: 坐标、pass、摆子与提子
  - id: core
    title: 围棋棋谱复盘逻辑
    publisher: 迷雾工具箱
    url: /discovery/go-core.js
    language: zh-CN
    kind: implementation
    locator: compileGo、advance、节点与棋盘状态
---

## 介绍
<!-- sources: sgf, go -->

SGF 把棋谱写作带属性的树。根节点描述棋盘和局信息，后续节点保存着法、注释与变化。围棋的游戏标识是 GM[1]，棋盘大小记录为 SZ。

## 坐标与颜色属性
<!-- sources: go, sgf -->

SGF 坐标第一位表示从左到右的列，第二位表示从上到下的行。aa 是左上角。B 和 W 代表黑方、白方落子，而 AB、AW 用于布置棋子。

:::example 两次普通落子
[输入]
(;GM[1]SZ[5];B[aa];W[bb])
[结果]
第一手黑左上角；第二手白由左、由上各第二个格点
[说明]
每个分号开始一个节点，从根局面依次走。
:::

## 提子与相邻的气
<!-- sources: go, core -->

相邻采用上下左右，斜邻不连成一块。落子后检查相邻对手棋块是否已无空点相邻。无气的棋子被移除，随后才能解释新局面。

:::example 围住中心的白子
[输入]
(;GM[1]SZ[5]AB[ab][ba][cb]AW[bb];B[bc])
[结果]
B[bc] 后白子 bb 被提走，黑方记 1 个提子
[说明]
三颗预置黑子和新黑子占据了白子的四个正邻点。
:::

## 分支和停一手
<!-- sources: go, sgf, core -->

括号中的后继变化从同一个父节点分别展开。空着法 B[] 或 W[] 表示停一手，旧格式在不大于 19 路的棋盘中还可能用 tt 作为兼容写法。

:::example 保留两条变化
[输入]
(;SZ[5];B[cc](;W[])(;W[dd]))
[结果]
黑方下 cc 后有两个白方分支：停一手，或下 dd
[说明]
切到第二支时应从同一个父局面另走，不能追加在第一支之后。
:::

## 复盘与比赛规则
<!-- sources: go, sgf, core -->

棋谱可记录比赛规则、贴目和已知结果，也可只记录部分局面。读取棋谱时按实际属性重建状态，不能依靠盘面图恢复注释、分支与规则语境。

## 常见误区

- SGF 中的 ab 不是 A 列第 2 行的人类坐标体系唯一写法，要先识别格式。
- AB 摆子和 B 落子在棋谱中记录不同事件。
- 停一手属于节点，不能随意删去再复盘。

