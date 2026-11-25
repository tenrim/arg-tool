---
capabilityId: native:hunt-constraints-magicSquare
title: 幻方
topicGroup: logic
summary: 从自然数总和推出幻和，核对正常幻方的互异、行列和及两条主对角线。
aliases:
  - 正常幻方
  - 幻和
  - 半幻方
sources:
  - id: csplib
    title: Magic Squares and Sequences
    publisher: Toby Walsh / CSPLib
    url: https://www.csplib.org/Problems/prob019/
    language: en
    kind: author-spec
    locator: Problem 019 正常幻方和部分填数变体
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

n 阶正常幻方是一张 n×n 方格，使用 1 到 n² 的整数各一次，每行、每列、两条主对角线的和相等。半幻方保留行列条件，可能不满足对角线条件。题面也可以预填若干数字，要求补齐余格。

## 幻和的推导
<!-- sources: csplib -->

把网格中的数按行相加，所得总和是从 1 到 n² 的自然数和 n²(n²+1)/2。各行和相等，因此每行和是 n(n²+1)/2。列与两条主对角线也用这一目标值。

:::example 阶数决定幻和
[输入]
阶数 n=3 和 n=4。
[结果]
三阶幻和为 15，四阶幻和为 34。
[说明]
1 至 9 的和是 45，三等分为 15。1 至 16 的和是 136，四等分为 34。
:::

## 三阶网格核算
<!-- sources: csplib, parser -->

某张方格是否为幻方，可以先把所有数排序，确认每个应有数字只出现一次，再独立核对三类线和。三阶幻方旋转与反射后仍为幻方，因为每条受约束直线都映射到另一条受约束直线。

:::example 给定两格的三阶实例
[输入]
1 至 9 互异，所有规定直线和为 15，第一行前两格为 8、1。
[结果]
8 1 6
3 5 7
4 9 2
[说明]
行列和均为 15，两条主对角线分别是 8+5+2 与 6+5+4。这组线索下只有这个解。
:::

## 对角线条件
<!-- sources: csplib, local -->

两条主对角线是从左上到右下、从右上到左下的长度为 n 的直线。以四阶为例，按行连续编号时，第一条是第 1、6、11、16 格，第二条是第 4、7、10、13 格。平行的短斜线不属于这两个区域。

:::example 半幻方反例
[输入]
1 8 6
5 3 7
9 4 2
[结果]
行列全部为 15，对角线各为 6、18。
[说明]
左上到右下相加是 1+3+2，右上到左下相加是 6+3+9。
:::

## 预填线索与等价解
<!-- sources: csplib, parser -->

求所有原始摆法时，旋转和镜像得到的不同格值排列都可以计为不同解。无预填的三阶模型共有八盘，正是上面示例方格的对称变换。若题目把这组变换视为同一解，计数时需要单独声明这种等价关系。

## 常见误区

- 各线和相等还需检查格内数字集合，重复数字也可能凑出同一个和。
- 对角线必须核对两条，行列正确仍可能只是半幻方。
- 幻和公式只适用于这里指定的 1 至 n² 数字集合。
