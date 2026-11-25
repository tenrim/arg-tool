---
capabilityId: op:Hex%20Density%20chart
title: 六边形分箱密度图
topicGroup: formats
summary: 在六边形格网中统计二维样本，区分分箱几何、显示尺寸和原坐标。
aliases:
  - Hex Density chart
  - hexbin
  - 六边形散点密度
sources:
  - id: d3
    title: D3 Hexbin
    publisher: D3
    url: https://github.com/d3/d3-hexbin
    language: en
    kind: official-doc
    locator: 六边形格网、半径及格内点的分配
  - id: nist
    title: NIST/SEMATECH e-Handbook：Scatter Plot
    publisher: NIST
    url: https://www.itl.nist.gov/div898/handbook/eda/section3/scatterp.htm
    language: en
    kind: official-doc
    locator: 两个变量的点图及其统计解读
  - id: engine
    title: CyberChef 11.5.0 图表模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Charts.js
    language: en
    kind: implementation
    locator: Hex Density chart；hexbin pack radius、draw radius 和各格统计
---

## 介绍
<!-- sources: d3, nist -->
六边形密度图把成堆的散点汇总为六边形区域。大批样本落在相近位置时，格内计数和色深可以显示密集处。格子的中心只代表一个区域，格中原坐标仍可各不相同。

## 错列格网与分箱半径
<!-- sources: d3, engine -->
规则的六边形格网将相邻行错开。程序把每个点按位置归入一格，分箱半径改变格中心间距与每格覆盖范围。半径较大通常会合并附近的群体，半径较小会分出更多细节。

## 绘制半径与分布统计
<!-- sources: d3, engine -->
几何分箱结束后，可为每个中心绘出显示用的六边形。显示半径决定图形大小，计数仍来自分箱时已确定的归属。格子的提示可读出数量、占比、中心和格内原点的坐标范围。

## 三点分箱对照
<!-- sources: d3, engine -->
三组用同一组坐标 (0,0)、(1,1)、(70,60) 分别改变分箱或绘制半径。

:::example 两个不为空的格
[输入]
分箱半径 20，绘制半径 10
[结果]
格计数为 2 与 1，占比分别为 66.67% 与 33.33%
[说明]
前两点同格，孤立点所在格显示中心约 (69.28,60.00)。
:::

:::example 只改变六边形画多大
[输入]
分箱半径仍为 20，绘制半径改为 15
[结果]
计数保持 2 与 1，两个六边形显示得更大
[说明]
格中心和数据归属仍来源于原先的分箱半径。
:::

:::example 用较大的格重新分箱
[输入]
分箱半径 100，绘制半径 10
[结果]
一个格计 3 点（100.00%），原坐标 X 范围为 0～70
[说明]
大格将原来分开的样本合并，没有更改任何一点的数据。
:::

## 密度图之间的比较
<!-- sources: d3, nist -->
如果任务要求识别两个相邻峰，可以尝试不同分箱半径并对照散点。半径、图面比例或显示空格的设置不同，色块形状就会变化。格数与原始记录数不必相同，两者应用于不同的判断。

## 常见误区
- 名称中的 Hex 指六边形，输入坐标按十进制数读取。
- 六边形中心是格网中心，可能不与任何原点重合。
- 画得更大只改变可见符号，改变分箱半径才可能合并或拆分格子。
