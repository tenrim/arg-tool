---
capabilityId: op:Levenshtein%20Distance
title: 编辑距离
topicGroup: text-language
summary: 莱文斯坦编辑距离取两条序列经插入、删除和替换互相转换所需的最小成本。
aliases:
  - Levenshtein Distance
  - 莱文斯坦距离
  - 字符串编辑距离
  - 动态规划
sources:
  - id: wf
    title: The String-to-String Correction Problem
    publisher: Robert A. Wagner 与 Michael J. Fischer
    url: https://computingbiology.github.io/docs/wagner1974.pdf
    language: en
    kind: author-spec
    locator: 第 2 至 4 节，编辑操作、递推和回溯
  - id: lev
    title: Binary Codes Capable of Correcting Deletions, Insertions, and Reversals
    publisher: V. I. Levenshtein
    url: https://nymity.ch/sybilhunting/pdf/Levenshtein1966a.pdf
    language: en
    kind: author-spec
    locator: 第 1 节，二进制序列的插入、删除与翻转
  - id: cyberchef
    title: Levenshtein Distance（固定版本源码）
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/LevenshteinDistance.mjs
    language: en
    kind: implementation
    locator: 三种编辑成本与逐前缀更新
---

## 介绍
<!-- sources: lev, wf -->
编辑距离度量把一条序列变成另一条序列的最小修改成本。莱文斯坦距离每次只插入、删除或替换一个符号，常见定义令三种操作的成本均为 1。这类度量可用于比较抄写记录或给候选文本排序。

## 前缀表与递推
<!-- sources: wf, cyberchef -->
D(i,j) 表示把原序列的前 i 项变成目标序列的前 j 项所需最小成本。D(i,0) 等于删除 i 项的总成本，D(0,j) 等于插入 j 项的总成本。表内每格取三项最小值：上一行加删除成本、前一列加插入成本、左上方加替换成本。两末项相等时，左上方的附加成本为零。

:::example 一次删除解决错位
[输入]
ABC → AC，三种成本都是 1
[结果]
1
[说明]
只删去 B 即可。两串长度相差 1，至少也需一次改变长度的操作。
:::

## 最短序列的还原
<!-- sources: wf -->
从 D(m,n) 反向查找与当前最小值相符的上游格，可得到一条最短编辑路径。左上分支表示保留或替换，上方表示删除，左方表示插入。多条路径代价相同的情况下，距离值仍相同。

:::example 单位成本下的三步修改
[输入]
kitten → sitting
[结果]
3
[说明]
k 替换成 s，e 替换成 i，尾部增加 g。输入长度相差 1，需要至少一次插入，且在只有一次插入的任意对齐下，仍至少有两处不等。
:::

## 不同操作的权重
<!-- sources: wf, cyberchef -->
若资料的漏字、添字和误字有不同意义，三种成本可以分别指定。较贵的替换可能被一次删除加一次插入取代。插入和删除权重不等时，两种转换方向的最小成本可不同。

:::example 昂贵替换的替代路径
[输入]
AB → AC，插入和删除各为 1，替换为 3
[结果]
2
[说明]
删去 B 再插入 C 共花 2。直接把 B 换成 C 要花 3。
:::

## 交换与计数单位
<!-- sources: wf, cyberchef -->
基本莱文斯坦规则中，交换相邻两项没有独立的一步操作。比较文本时还需确定“符号”按字节、UTF-16 码元、Unicode 码点或用户感知的文字单位划分。同一对文本在不同划分下可得到不同成本。

## 常见误区
- 莱文斯坦距离给出最小成本，不能唯一指出真实修改过程。
- 邻位交换如 AB → BA 在基本单位成本模型里需要两步。
- 较小的编辑距离说明某种划分下较省编辑操作，不能直接衡量两段文字的含义。
