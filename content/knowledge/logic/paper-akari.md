---
capabilityId: native:paper-akari
title: 照明 求解
topicGroup: logic
summary: 按黑格遮挡、白格覆盖和相邻灯数安排照明谜题中的灯。
aliases:
  - 照明
  - Akari
  - Light Up
  - 灯泡谜题
sources:
  - id: nikoli
    title: Nikoli — Akari
    publisher: Nikoli
    url: https://www.nikoli.co.jp/en/puzzles/akari/
    language: en
    kind: official-doc
    locator: Rules / Features，照明、相互照射与黑格数字
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

照明（Akari）由 Nikoli 开发。题面由白格和黑格构成，需要在部分白格放灯，使全部白格点亮。黑格有的带数字，规定上下左右邻接的灯恰好有几盏。

## 光线与黑格
<!-- sources: nikoli, csp -->

灯照亮其所在白格，并沿同行或同列传播，直到黑格或边界。任何两盏灯都不能在未被黑格分隔的同一条行段或列段中。两个相离的灯可以沿不同方向照亮同一个空格。

## 数字黑格与邻接
<!-- sources: nikoli, csp -->

黑格上的数字只计算相邻四个正交位置上的灯泡。编号 0 禁止在直接邻格放灯，而没有数字的黑格仍然会挡光，但不规定邻灯数。白格必须有自己的灯，或能沿无遮挡的行段、列段看见一盏灯。

## 小棋盘实例
<!-- sources: nikoli, engine, csp -->

句点表示空白，井号指无数字黑格，数字直接写在黑格里。结果用圆点标灯，其他白格仍可由相邻灯点亮。

:::example 两个被墙隔离的白格
[输入]
. #
# .
[结果]
● #
# ●
[说明]
两处白格不同行也不同列，均无法由另一处照亮，因此必须各放一盏。
:::

:::example 右上角黑格标 0
[输入]
. 0
. .
[结果]
只有左下的白格放灯。
[说明]
左上与右下均贴着 0，不能放灯。左下的一盏灯沿纵横两段照亮这两个格，并照亮它自己的格子。
:::

:::example 没有数字或黑格的 2×2
[输入]
. .
. .
[结果]
两条对角线各形成一个合法布灯方案，输出中四格的灯状态均不固定。
[说明]
任选一条对角线放两盏灯可照亮全盘，又不让两灯彼此照射。另一条对角线同样成立。
:::

## 图案提取时区分灯与亮格
<!-- sources: nikoli, engine, csp -->

大多数合法终局里只有部分白格有灯，其他白格由灯照亮。若后续线索要读取灯泡位置，应从实际灯格取值。多解状态中的问号表示不一定有灯或不一定有共同决定，不能直接当作不放灯。

## 常见误区

- 没有标数字的黑格仍能遮光，和白格空位不同。
- 计数只看正交相邻的灯，远处能照到黑格边缘的灯不计入数字。
- 每格需要被照亮，但不是每格都需要放灯。

