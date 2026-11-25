---
capabilityId: op:Heatmap%20chart
title: 热力图
topicGroup: formats
summary: 将二维坐标按轴分入矩形网格，以每格计数和占比表示样本聚集。
aliases:
  - Heatmap chart
  - 矩形分箱
  - 二维密度
sources:
  - id: d3
    title: D3 Binning data
    publisher: D3
    url: https://d3js.org/d3-array/bin
    language: en
    kind: official-doc
    locator: 把数值按区间归箱并得到计数
  - id: engine
    title: CyberChef 11.5.0 图表模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Charts.js
    language: en
    kind: implementation
    locator: Heatmap chart；getHeatmapPacking、格子比例和着色
---

## 介绍
<!-- sources: d3, engine -->
热力图用颜色表示网格的数值。本方法的输入是多条二维坐标，先按位置归入矩形格，再根据每格包含的记录数绘色。重复坐标也分别计入样本总数。

## 区间与网格
<!-- sources: d3, engine -->
每条轴先求最小值和最大值，再等分数值范围。各坐标用两个轴上的区间索引定位格子。当前算法在最大端加入很小余量以包含最大坐标，这个余量也使恰处中线的简单输入 5，在 0～10 的二等分样本里进入索引较小的格子。

## 计数、占比和颜色
<!-- sources: d3, engine -->
格内记录数为 c、样本总数为 N，提示中的占比是 100c/N%。颜色可按最拥挤格的计数进行拉伸。空格的计数为 0，即使有色表的背景，也没有数据记录属于该格。

## 两轴分箱实例
<!-- sources: engine -->
以下用逗号分隔横纵坐标，无表头。前两项使用横纵各两格。

:::example 两点同一坐标
[输入]
0,0
0,0
10,10
[结果]
左下格 2 点（66.67%），右上格 1 点（33.33%），其余两格 0 点
[说明]
即使坐标重复，计数依然记录两条观测。
:::

:::example 临近中线
[输入]
0,0
5,5
5.1,5.1
10,10
[结果]
左下与右上格各 2 点（50.00%）
[说明]
5 与 5.1 恰在当前计算的不同箱侧，可以用这组值观察边界归属。
:::

:::example 横坐标恒定
[输入]
0,0
0,5
[结果]
不能分箱，X 的最小值与最大值相同
[说明]
当前分箱要用轴的数值幅度作除数，零跨度属于退化情况。
:::

## 比较不同热力图
<!-- sources: d3, engine -->
轴范围、分箱数和颜色标尺改变外观。比较样本时可先固定这些条件，或核对格子提示中的实际计数与占比。需要辨认重复坐标或单点时，应结合原始数据或散点图。

## 常见误区
- 这个热力图统计每格落入的点数，没有第三列作为热值。
- 空白的格子表示零条记录，白色本身需结合当前配色解释。
- 两幅热力图颜色一样深，仍可能对应不同绝对计数。
