---
capabilityId: op:Scatter%20chart
title: 散点图
topicGroup: formats
summary: 为每条二维坐标画一个标记，说明重合点、坐标尺度和第三列颜色。
aliases:
  - Scatter chart
  - 坐标点
  - 二维散点
sources:
  - id: nist
    title: NIST/SEMATECH e-Handbook：Scatter Plot
    publisher: NIST
    url: https://www.itl.nist.gov/div898/handbook/eda/section3/scatterp.htm
    language: en
    kind: official-doc
    locator: 两个变量的点图及其统计解读
  - id: d3
    title: D3 Linear scales
    publisher: D3
    url: https://d3js.org/d3-scale/linear
    language: en
    kind: official-doc
    locator: 线性定义域向图面坐标映射
  - id: engine
    title: CyberChef 11.5.0 图表模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Charts.js
    language: en
    kind: implementation
    locator: Scatter chart；线性映射、记录级颜色和悬停坐标
---

## 介绍
<!-- sources: nist, engine -->
散点图用横坐标和纵坐标表示同一记录的两个数值，并给每条记录画一个点。它可显示聚集、空缺和离群点，也可让数据中已有的图案浮现。

## 数值到画布位置
<!-- sources: d3, engine -->
散点图的轴在数值区间上做线性映射。画面的 Y 轴通常向下增加，因此把较大的 Y 画在较高处需要反转纵向像素映射。当前方法在轴的两端留余量，两个轴的图面范围可以不同。

## 重合与附加色彩
<!-- sources: nist, engine -->
叠在同一坐标的记录有相同圆心，肉眼容易数少。可另用密度图看重合强度。启用第三列颜色时，第三列给出颜色名或颜色值，位置仍由前两个数决定。

## 坐标与点色样本
<!-- sources: engine -->
逗号分隔数据、各行没有表头。检查图形时既可数点，也可看每个标记的坐标。

:::example 对角递增
[输入]
0,0
5,5
10,10
[结果]
由左下经中心到右上，绘三个点
[说明]
(5,5) 恰在两轴区间中部，三个点等距排列。
:::

:::example 重复坐标
[输入]
0,0
0,0
10,10
[结果]
生成三个点标记，视觉上只有两处落点
[说明]
前两个圆心完全相同，数据记录数仍是 3。
:::

:::example 用第三列为点着色
[输入]
0,10,red
10,0,blue
[结果]
启用第三列颜色时，左上是红点，右下是蓝点
[说明]
颜色不改变计算 X 和 Y 的位置。
:::

## 读图与结论
<!-- sources: nist, d3 -->
散点图上的相关形状可提示进一步检验，单凭图形不能断言因果。同一坐标数据如果更改了两轴的图面比例，肉眼看到的斜率会变。材料中用点阵画图案时，应保留坐标单位、轴方向和尺度。

## 常见误区
- 散点图每个标记对应记录，图中可见落点的数量可能更少。
- 颜色属于额外编码，可以改变图例含义而不移动点。
- 数据单位与画布像素各有尺度，图像视觉角度并非数学斜率。
